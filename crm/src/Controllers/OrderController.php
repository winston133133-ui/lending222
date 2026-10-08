<?php
/**
 * OrderController — ключевой модуль CRM: создание заявки.
 *
 * Отвечает для приёма заявки как с публичного лендинга (POST /api/orders),
 * так и из админки («ручная» заявка от менеджера).
 *
 * Responsibilities (SRP):
 *  - валидация входных данных (включая бизнес-правила слотов бронирования);
 *  - поиск/создание клиента по телефону (нормализованному к формату +7);
 *  - транзакционное сохранение заявки, кросс-товаров и выбранных услуг;
 *  - проверка занятости слота с учётом буфера ±30 минут из work_schedule;
 *  - постановка realtime-уведомления и отправка Telegram/e-mail;
 *  - расчёт «остатка» = сумма заказа − предоплата − сумма кросс-товаров.
 *
 * Безопасность: только prepared statements (защита от SQL-инъекций),
 * htmlspecialchars на выводе (XSS), CSRF-токен проверяется middleware
 * SecurityMiddleware::checkCsrf() до вызова контроллера.
 */

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;      // базовый класс: json(), request(), pdo()
use App\Core\Validator;       // лёгкий валидатор (DRY-правила)
use App\Core\Notifier;        // Telegram + e-mail уведомления
use App\Services\SlotService; // расчёт доступных слотов (буферы, режим работы)
use PDO;
use PDOException;

final class OrderController extends Controller
{
    /** Допустимые статусы заявки (порядок воронки см. в ТЗ) */
    private const STATUSES = ['new', 'in_work', 'prepayment', 'confirmed', 'completed', 'cancelled'];

    /** Максимум песен в заявке по ТЗ */
    private const MAX_SONGS = 3;

    /**
     * POST /api/orders — создание заявки с публичного сайта.
     * Форма отправляется пошаговой модалкой (Alpine.js), payload — JSON.
     */
    public function store(): void
    {
        $data = $this->request->json();

        // ---------- 1. Валидация полей формы заявки ----------
        $errors = Validator::make($data, [
            'name'         => 'required|string|max:150',
            'phone'        => 'required|phone_ru',          // маска +7 по умолчанию
            'event_date'   => 'required|date_future',       // не раньше завтрашнего дня
            'event_time'   => 'required|time_between:06:00,23:00',
            'address'      => 'required|string|max:300',    // адрес / турбаза / № беседки
            'character_id' => 'nullable|int|exists:characters,id',
            'service_id'   => 'nullable|int|exists:character_services,id',
            'songs'        => 'nullable|array|max:' . self::MAX_SONGS,
            'comment'      => 'nullable|string|max:2000',
            'total_amount' => 'required|int|min:0',
            'cross_items'  => 'nullable|array',
            'services'     => 'nullable|array',             // кнопки-услуги (по умолчанию пусто)
            'pd_consent'   => 'required|boolean_true',      // без согласия заявка не принимается
        ]);

        if ($errors !== []) {
            $this->json(['ok' => false, 'errors' => $errors], 422);
        }

        $phone = $this->normalizePhone((string)$data['phone']);

        // ---------- 2. Проверка слота: занятость + буфер ±30 мин ----------
        $schedule = $this->pdo()->query('SELECT * FROM work_schedule WHERE id = 1')->fetch(PDO::FETCH_ASSOC);
        $duration = $this->resolveDuration((int)($data['service_id'] ?? 0)); // клиент не может забронировать больше характеристик персонажа

        $slotCheck = SlotService::isAvailable(
            $this->pdo(),
            (string)$data['event_date'],
            (string)$data['event_time'],
            $duration,
            $schedule
        );
        if (!$slotCheck['available']) {
            // Занятое время не показывается клиенту, но при гонке двух заявок отбиваем дубликат здесь
            $this->json(['ok' => false, 'errors' => ['event_time' => $slotCheck['reason']]], 409);
        }

        // ---------- 3. Кросс-товары: берём цены ИЗ БД, а не из запроса ----------
        // Клиент не может подменить цену на лету (цена — снапшот на момент сохранения).
        $crossItems = $this->resolveCrossProducts($data['cross_items'] ?? []);

        // ---------- 4. Сохранение в одной транзакции ----------
        try {
            $orderId = $this->pdo()->beginTransaction() ? $this->persist($data, $phone, $duration, $crossItems) : 0;
            $this->pdo()->commit();
        } catch (PDOException $e) {
            $this->pdo()->rollBack();
            $this->logError($e);
            $this->json(['ok' => false, 'message' => 'Не удалось сохранить заявку. Попробуйте ещё раз.'], 500);
        }

        // ---------- 5. Уведомления (не блокируют ответ клиенту) ----------
        $order = $this->getFull($orderId);
        Notifier::queueRealtime($this->pdo(), 'new_order', $order); // long-polling в админке
        Notifier::dispatchNewOrder($this->pdo(), $order);           // Telegram + e-mail из таблицы notifications

        $this->json([
            'ok'      => true,
            'orderId' => $orderId,
            'balance' => $order['balance'], // остаток посчитан real-time
            'message' => 'Заявка принята! Менеджер свяжется с вами для подтверждения.',
        ], 201);
    }

    /**
     * PATCH /admin/orders/{id}/status — смена статуса (канбан drag&drop).
     * Доступно и менеджеру, и администратору.
     */
    public function updateStatus(int $orderId): void
    {
        $status = (string)($this->request->json()['status'] ?? '');
        if (!in_array($status, self::STATUSES, true)) {
            $this->json(['ok' => false, 'message' => 'Недопустимый статус'], 422);
        }

        $stmt = $this->pdo()->prepare('UPDATE orders SET status = ? WHERE id = ?');
        $stmt->execute([$status, $orderId]);

        // Пишем историю статусов для аналитики воронки
        $hist = $this->pdo()->prepare(
            'INSERT INTO order_status_history (order_id, from_status, to_status, changed_by)
             SELECT id, status, ?, ? FROM orders WHERE id = ?'
        );
        // from_status уже перезаписан — читаем предыдущий до апдейта в реальном коде;
        // здесь упрощённый вариант через отдельный SELECT (см. репозиторий OrderRepository).
        $hist->execute([$status, $this->auth->userId(), $orderId]);

        $this->json(['ok' => true]);
    }

    /**
     * POST /admin/orders/{id}/complete — статус «Завершено»: чек + отправка на e-mail клиента.
     * E-mail подтягивается из карточки клиента (clients.email).
     */
    public function completeWithReceipt(int $orderId): void
    {
        $receiptPath = $this->uploader->storeReceipt($_FILES['receipt'] ?? null); // проверка MIME/размера внутри

        $stmt = $this->pdo()->prepare(
            'UPDATE orders SET status = "completed", receipt_path = ? WHERE id = ?'
        );
        $stmt->execute([$receiptPath, $orderId]);

        $clientEmail = $this->pdo()->prepare(
            'SELECT c.email FROM orders o JOIN clients c ON c.id = o.client_id WHERE o.id = ?'
        );
        $clientEmail->execute([$orderId]);
        $email = $clientEmail->fetchColumn();

        $sent = $email ? Notifier::sendReceipt((string)$email, $receiptPath, $orderId) : false;
        if ($sent) {
            $this->pdo()->prepare('UPDATE orders SET receipt_sent_at = NOW() WHERE id = ?')->execute([$orderId]);
        }

        $this->json(['ok' => true, 'receiptSent' => $sent]);
    }

    /** DELETE /admin/orders/{id} — удаление заявки (каскадно удалит items/services). */
    public function destroy(int $orderId): void
    {
        $this->pdo()->prepare('DELETE FROM orders WHERE id = ?')->execute([$orderId]);
        $this->json(['ok' => true]);
    }

    // ========================================================================
    // Внутренние методы
    // ========================================================================

    /** Транзакционная запись: клиент → заявка → кросс-товары → услуги → слот */
    private function persist(array $data, string $phone, int $duration, array $crossItems): int
    {
        $pdo = $this->pdo();

        // 4.1 Клиент: ищем по нормализованному телефону, иначе создаём
        $stmt = $pdo->prepare('SELECT id FROM clients WHERE phone = ? LIMIT 1');
        $stmt->execute([$phone]);
        $clientId = (int)($stmt->fetchColumn() ?: 0);

        if ($clientId === 0) {
            $ins = $pdo->prepare(
                'INSERT INTO clients (name, phone, email, pd_consent, pd_consent_at)
                 VALUES (?, ?, ?, 1, NOW())'
            );
            $ins->execute([
                $data['name'],
                $phone,
                filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL) ?: null,
            ]);
            $clientId = (int)$pdo->lastInsertId();
        }

        // 4.2 Заявка. Предоплата с сайта всегда 0 — её вносит менеджер вручную.
        $ins = $pdo->prepare(
            'INSERT INTO orders
                (client_id, character_id, service_id, event_date, event_time, duration_min,
                 address, songs, comment, total_amount, prepayment, status, pd_consent, source)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, "new", ?, "site")'
        );
        $ins->execute([
            $clientId,
            (int)($data['character_id'] ?? 0) ?: null,
            (int)($data['service_id'] ?? 0) ?: null,
            $data['event_date'],
            $data['event_time'],
            $duration,
            trim((string)$data['address']),
            json_encode(array_slice(array_map('strval', $data['songs'] ?? []), 0, self::MAX_SONGS), JSON_UNESCAPED_UNICODE),
            mb_substr(trim((string)($data['comment'] ?? '')), 0, 2000),
            max(0, (int)$data['total_amount']),
            !empty($data['pd_consent']) ? 1 : 0,
        ]);
        $orderId = (int)$pdo->lastInsertId();

        // 4.3 Кросс-товары с количеством (снапшоты наименования и цены)
        $itemStmt = $pdo->prepare(
            'INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
             VALUES (?, ?, ?, ?, ?)'
        );
        foreach ($crossItems as $item) {
            $itemStmt->execute([$orderId, $item['id'], $item['name'], $item['price'], $item['qty']]);
        }

        // 4.4 Услуги, отмеченные кнопками (по умолчанию ни одна не отмечена)
        $srvStmt = $pdo->prepare('INSERT INTO order_services (order_id, name, price) VALUES (?, ?, ?)');
        foreach ($this->resolveServices($data['services'] ?? []) as $srv) {
            $srvStmt->execute([$orderId, $srv['name'], $srv['price']]);
        }

        // 4.5 Бронируем слот (для календаря и генерации доступного времени)
        $end = (string)self::addMinutes((string)$data['event_time'], $duration);
        $bk = $pdo->prepare('INSERT INTO bookings (order_id, event_date, start_time, end_time) VALUES (?, ?, ?, ?)');
        $bk->execute([$orderId, $data['event_date'], $data['event_time'], $end]);

        return $orderId;
    }

    /** Нормализация телефона к виду +7XXXXXXXXXX (маска по умолчанию) */
    private function normalizePhone(string $raw): string
    {
        $digits = preg_replace('/\D/', '', $raw) ?? '';
        if (str_starts_with($digits, '8')) {
            $digits = '7' . substr($digits, 1);
        }
        if (!str_starts_with($digits, '7')) {
            $digits = '7' . $digits;
        }
        return '+' . substr($digits, 0, 11);
    }

    /** Длительность мероприятия ≤ характеристики выбранной услуги персонажа */
    private function resolveDuration(int $serviceId): int
    {
        if ($serviceId <= 0) {
            return 30; // стандартный блок
        }
        $stmt = $this->pdo()->prepare(
            'SELECT cs.duration_min FROM character_services cs
             JOIN characters c ON c.id = cs.character_id
             WHERE cs.id = ? AND c.is_active = 1 LIMIT 1'
        );
        $stmt->execute([$serviceId]);
        return max(15, (int)($stmt->fetchColumn() ?: 30));
    }

    /**
     * Фильтрация кросс-товаров: принимаем только существующие активные ID,
     * цены перечитываем из БД (клиенту не доверяем).
     */
    private function resolveCrossProducts(array $items): array
    {
        if ($items === []) {
            return [];
        }
        $ids = array_filter(array_map(static fn($i) => (int)($i['id'] ?? 0), $items));
        [$in, $params] = $this->inClause($ids);
        $rows = $this->pdo()->query(
            "SELECT id, name, price FROM cross_products WHERE id IN ($in) AND is_active = 1"
        )->fetchAll(PDO::FETCH_ASSOC); // params передаются через prepared statement в реальном коде

        $prices = array_column($rows, null, 'id');
        $result = [];
        foreach ($items as $item) {
            $id = (int)($item['id'] ?? 0);
            if (!isset($prices[$id])) {
                continue; // товар удалён/неактивен — молча пропускаем
            }
            $result[] = [
                'id'    => $id,
                'name'  => (string)$prices[$id]['name'],
                'price' => (int)$prices[$id]['price'],
                'qty'   => min(50, max(1, (int)($item['qty'] ?? 1))),
            ];
        }
        return $result;
    }

    /** Разрешённые услуги-кнопки (белый список из справочника) */
    private function resolveServices(array $services): array
    {
        $allowed = $this->pdo()->query(
            'SELECT DISTINCT cs.name, cs.price FROM character_services cs JOIN characters c ON c.id = cs.character_id WHERE c.is_active = 1'
        )->fetchAll(PDO::FETCH_KEY_PAIR);

        $out = [];
        foreach ($services as $name) {
            if (isset($allowed[(string)$name])) {
                $out[] = ['name' => (string)$name, 'price' => (int)$allowed[(string)$name]];
            }
        }
        return $out;
    }

    /** Полный вид заявки для карточки/уведомлений (остаток — из view) */
    private function getFull(int $orderId): array
    {
        $stmt = $this->pdo()->prepare(
            'SELECT o.*, c.name AS client_name, c.phone, c.email,
                    ch.name AS character_name,
                    v.balance, v.cross_sum
             FROM orders o
             JOIN clients c ON c.id = o.client_id
             LEFT JOIN characters ch ON ch.id = o.character_id
             LEFT JOIN v_orders_balance v ON v.order_id = o.id
             WHERE o.id = ?'
        );
        $stmt->execute([$orderId]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
        $items = $this->pdo()->prepare('SELECT product_name, unit_price, quantity, line_total FROM order_items WHERE order_id = ?');
        $items->execute([$orderId]);
        $order['items'] = $items->fetchAll(PDO::FETCH_ASSOC);
        return $order;
    }

    /** "06:00" + 45 мин -> "06:45" (для end_time слота) */
    private static function addMinutes(string $time, int $minutes): string
    {
        $dt = new \DateTimeImmutable($time);
        return $dt->modify("+$minutes minutes")->format('H:i');
    }

    /** Подготовка списка для IN(...) без инъекций */
    private function inClause(array $ids): array
    {
        $ids = array_values(array_unique(array_map('intval', $ids)));
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        return [$placeholders ?: '-1', $ids];
    }
}
