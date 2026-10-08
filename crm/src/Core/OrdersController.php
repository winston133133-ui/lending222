<?php
require_once __DIR__ . '/DB.php'; require_once __DIR__ . '/Auth.php'; require_once __DIR__ . '/CSRF.php';
require_once __DIR__ . '/Validator.php'; require_once __DIR__ . '/SlotService.php'; require_once __DIR__ . '/Notifier.php';
require_once __DIR__ . '/Uploader.php';
/**
 * Управление заявками: канбан + таблица, создание/редактирование, статусы,
 * чек при «Завершено» (отправка на email клиента), удаление (только админ).
 */
class OrdersController
{
    private const STATUSES = ['new'=>'Новая','in_work'=>'Обработка','prepayment'=>'Внесена предоплата (50%)',
                              'confirmed'=>'Подтверждено','completed'=>'Завершено','cancelled'=>'Отменено'];

    /** GET /admin/orders?view=kanban|table&q=&status= */
    public function index(): void
    {
        $view = ($_GET['view'] ?? 'kanban') === 'table' ? 'table' : 'kanban';
        $q = trim($_GET['q'] ?? ''); $st = $_GET['status'] ?? '';
        $sql = "SELECT o.*, cl.name client_name, cl.phone, cl.email, ch.name character_name
                FROM orders o LEFT JOIN clients cl ON cl.id=o.client_id LEFT JOIN characters ch ON ch.id=o.character_id
                WHERE 1=1"; $p = [];
        if ($q !== '') { $sql .= " AND (cl.name LIKE ? OR cl.phone LIKE ? OR o.customer_name LIKE ?)"; $p = array_merge($p, ["%$q%","%$q%","%$q%"]); }
        if (isset(self::STATUSES[$st])) { $sql .= " AND o.status = ?"; $p[] = $st; }
        $sql .= " ORDER BY o.event_date DESC, o.event_time LIMIT 300";
        $orders = DB::all($sql, $p);
        // Остаток real-time для каждой карточки
        foreach ($orders as &$o) $o['balance'] = self::balance((int)$o['id']);
        admin_render('orders/index', 'Заявки', 'orders', ['orders'=>$orders,'mode'=>$view,'q'=>$q,'status'=>$st,'statuses'=>self::STATUSES]);
    }

    /** GET /admin/orders/{id} — карточка заявки с редактированием */
    public function show(int $id): void
    {
        $o = DB::row("SELECT o.*, cl.name client_name, cl.phone, cl.email, ch.name character_name
                      FROM orders o LEFT JOIN clients cl ON cl.id=o.client_id LEFT JOIN characters ch ON ch.id=o.character_id WHERE o.id=?", [$id]);
        if (!$o) { http_response_code(404); echo 'Заявка не найдена'; return; }
        $data = [
            'o' => $o, 'balance' => self::balance($id), 'statuses' => self::STATUSES,
            'items' => DB::all('SELECT * FROM order_items WHERE order_id=?', [$id]),
            'chars' => DB::all('SELECT * FROM characters WHERE is_active=1 ORDER BY sort_order'),
            'services' => $o['character_id'] ? DB::all('SELECT * FROM character_services WHERE character_id=?', [(int)$o['character_id']]) : [],
            'cross' => DB::all('SELECT * FROM cross_products WHERE is_active=1'),
        ];
        admin_render('orders/show', "Заявка #$id", 'orders', $data);
    }

    /** POST /admin/orders/create — ручная заявка из админки (та же бизнес-логика, что и публичная) */
    public function store(): void
    {
        CSRF::ensure();
        $in = $_POST;
        $errors = Validator::make($in, [
            'name'=>'required|string|max:150', 'phone'=>'required|phone_ru',
            'event_date'=>'required|date', 'event_time'=>'required|time',
            'total_amount'=>'required|int|min:0',
        ]);
        $duration = $this->resolveDuration((int)($in['service_id'] ?? 0), (int)($in['character_id'] ?? 0));
        if (!$errors && !empty($in['event_date'])) {
            $slot = SlotService::isAvailable($in['event_date'], $in['event_time'] ?? '12:00', $duration);
            if (!$slot['available']) $errors['event_time'] = $slot['reason'];
        }
        if ($errors) { $_SESSION['flash_error'] = implode('; ', $errors); header('Location: /admin/orders'); return; }

        $phone = Validator::normPhone($in['phone']);
        $db = DB::pdo(); $db->beginTransaction();
        try {
            $clientId = $this->upsertClient($phone, $in['name'], $in['email'] ?? '', !empty($in['pd_consent']));
            $songs = array_slice(array_filter(array_map('trim', [$in['song1'] ?? '', $in['song2'] ?? '', $in['song3'] ?? ''])), 0, 3);
            $prepay = max(0, min((int)($in['prepayment'] ?? 0), (int)$in['total_amount']));
            DB::run("INSERT INTO orders (client_id,character_id,service_id,customer_name,event_date,event_time,address,songs,comment,total_amount,prepayment,status,pd_consent)
                     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'new',?)",
                [$clientId, (int)($in['character_id'] ?? 0) ?: null, (int)($in['service_id'] ?? 0) ?: null, $in['name'],
                 $in['event_date'], $in['event_time'], $in['address'] ?? '', implode('; ', $songs), $in['comment'] ?? '',
                 (int)$in['total_amount'], $prepay, !empty($in['pd_consent']) ? 1 : 0]);
            $orderId = (int)$db->lastInsertId();
            $this->saveCrossItems($orderId, $in['cross'] ?? []);
            $db->commit();
        } catch (Throwable $ex) { $db->rollBack(); $_SESSION['flash_error'] = 'Ошибка сохранения заявки'; header('Location: /admin/orders'); return; }

        Notifier::queueRealtime('new_order', ['order_id'=>$orderId]); // toast в других окнах админки
        header("Location: /admin/orders/$orderId");
    }

    /** POST /admin/orders/{id}/update — редактирование полей и prepayment (остаток пересчитывается автоматически) */
    public function update(int $id): void
    {
        CSRF::ensure();
        $fields = ['customer_name'=>'string','event_date'=>'date','event_time'=>'time','address'=>'string',
                   'comment'=>'string','songs'=>'string','total_amount'=>'int','prepayment'=>'int','character_id'=>'int','service_id'=>'int'];
        $sets = []; $vals = [];
        foreach ($fields as $f => $type) {
            if (!array_key_exists($f, $_POST)) continue;
            $v = $type === 'int' ? max(0, (int)$_POST[$f]) : trim((string)$_POST[$f]);
            $sets[] = "$f = ?"; $vals[] = $v;
        }
        if ($sets) { $vals[] = $id; DB::run('UPDATE orders SET ' . implode(', ', $sets) . ' WHERE id = ?', $vals); }
        if (isset($_POST['cross'])) $this->saveCrossItems($id, $_POST['cross']);
        $_SESSION['flash_ok'] = 'Заявка обновлена. Остаток пересчитан: ' . money(self::balance($id));
        header("Location: /admin/orders/$id");
    }

    /** POST /admin/orders/{id}/status — смена статуса (кнопки/дрэг-дроп на канбане) */
    public function setStatus(int $id): void
    {
        CSRF::ensure();
        $st = $_POST['status'] ?? '';
        if (!isset(self::STATUSES[$st])) { http_response_code(422); exit('Недопустимый статус'); }
        DB::run('UPDATE orders SET status = ? WHERE id = ?', [$st, $id]);
        if (($_SERVER['HTTP_ACCEPT'] ?? '') === 'application/json') {
            header('Content-Type: application/json');
            echo json_encode(['ok'=>true,'status'=>$st,'balance'=>self::balance($id)], JSON_UNESCAPED_UNICODE); exit;
        }
        header("Location: /admin/orders/$id");
    }

    /** POST /admin/orders/{id}/receipt — прикрепить чек и отправить на email клиента (при статусе «Завершено») */
    public function sendReceipt(int $id): void
    {
        CSRF::ensure();
        $o = DB::row("SELECT o.*, cl.email FROM orders o LEFT JOIN clients cl ON cl.id=o.client_id WHERE o.id=?", [$id]);
        if (!$o) { http_response_code(404); exit; }
        $path = $o['receipt_path'];
        if (!empty($_FILES['receipt']['name'])) {
            try { $path = Uploader::image($_FILES['receipt'], 'receipts')['path']; DB::run('UPDATE orders SET receipt_path=? WHERE id=?', [$path, $id]); }
            catch (Throwable $e) { $_SESSION['flash_error'] = $e->getMessage(); header("Location: /admin/orders/$id"); return; }
        }
        $sent = Notifier::sendReceiptToClient($o['email'], 'Чек по заявке #' . $id,
            "Спасибо, что выбрали нас! Итог по заявке #$id: оплата " . money((int)$o['total_amount']) . '.', $path);
        $_SESSION[$sent ? 'flash_ok' : 'flash_error'] = $sent ? 'Чек отправлен на ' . $o['email'] : 'Не удалось отправить (проверьте email клиента в карточке)';
        header("Location: /admin/orders/$id");
    }

    /** POST /admin/orders/{id}/delete — удаление (полный доступ есть только у администратора) */
    public function destroy(int $id): void
    {
        CSRF::ensure();
        if (!Auth::isAdmin()) { http_response_code(403); exit('Только для администратора'); }
        DB::run('DELETE FROM orders WHERE id = ?', [$id]);
        $_SESSION['flash_ok'] = "Заявка #$id удалена"; header('Location: /admin/orders');
    }

    /** GET /api/admin/notifications?since={id} — long-polling новых заявок без перезагрузки */
    public function pollNotifications(): void
    {
        header('Content-Type: application/json; charset=utf-8');
        $since = (int)($_GET['since'] ?? 0);
        $items = Notifier::fetchRealtime($since);
        foreach ($items as &$it) $it['payload'] = json_decode((string)$it['payload'], true);
        echo json_encode(['ok'=>true,'since'=>end($items)['id'] ?? $since,'items'=>$items], JSON_UNESCAPED_UNICODE);
    }

    // ---------- служебное ----------
    private function upsertClient(string $phone, string $name, string $email, bool $pd): int
    {
        $cl = DB::row('SELECT * FROM clients WHERE phone = ?', [$phone]);
        if ($cl) { DB::run('UPDATE clients SET name=?, email=COALESCE(NULLIF(?,\'\'),email), pd_consent=MAX(pd_consent,?) WHERE id=?',
            [$name, $email, $pd ? 1 : 0, (int)$cl['id']]); return (int)$cl['id']; }
        DB::run('INSERT INTO clients (name,phone,email,pd_consent) VALUES (?,?,?,?)', [$name, $phone, $email ?: null, $pd ? 1 : 0]);
        return (int)DB::pdo()->lastInsertId();
    }

    /** Кросс-товары: цены всегда из БД (снапшот), qty 1..20 */
    private function saveCrossItems(int $orderId, $raw): void
    {
        DB::run('DELETE FROM order_items WHERE order_id = ?', [$orderId]);
        foreach ((array)$raw as $pid => $qty) {
            $prod = DB::row('SELECT * FROM cross_products WHERE id=? AND is_active=1', [(int)$pid]);
            if ($prod && (int)$qty > 0)
                DB::run('INSERT INTO order_items (order_id,product_id,product_name,unit_price,qty) VALUES (?,?,?,?,?)',
                    [$orderId, (int)$pid, $prod['name'], (int)$prod['price'], max(1, min(20, (int)$qty))]);
        }
    }

    /** Длительность брони: из услуги персонажа (клиент не может забронировать больше характеристик) */
    private function resolveDuration(int $serviceId, int $charId): int
    {
        if ($serviceId && ($s = DB::row('SELECT duration_min FROM character_services WHERE id=?', [$serviceId]))) return max(10, (int)$s['duration_min']);
        if ($charId && ($c = DB::row('SELECT duration_min FROM characters WHERE id=?', [$charId]))) return max(10, (int)$c['duration_min']);
        return 40;
    }

    /** Остаток = сумма − предоплата − Σ кросс-товаров (real-time) */
    public static function balance(int $orderId): int
    {
        $r = DB::row('SELECT total_amount, prepayment FROM orders WHERE id=?', [$orderId]);
        if (!$r) return 0;
        $cross = (int)DB::row('SELECT COALESCE(SUM(unit_price*qty),0) s FROM order_items WHERE order_id=?', [$orderId])['s'];
        return max(0, (int)$r['total_amount'] - (int)$r['prepayment'] - $cross);
    }
}
