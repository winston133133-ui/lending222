<?php
require_once __DIR__ . '/DB.php'; require_once __DIR__ . '/CSRF.php'; require_once __DIR__ . '/Validator.php';
/** Клиентская база: список с историей заказов, флаг согласия на ПД, кликабельный телефон */
class ClientsController
{
    public function index(): void
    {
        $q = trim($_GET['q'] ?? '');
        $sql = 'SELECT c.*, (SELECT COUNT(*) FROM orders o WHERE o.client_id=c.id AND o.status!=\'cancelled\') orders_cnt,
                       (SELECT COALESCE(SUM(o.total_amount),0) FROM orders o WHERE o.client_id=c.id AND o.status=\'completed\') total_sum
                FROM clients c WHERE 1=1'; $p = [];
        if ($q !== '') { $sql .= ' AND (c.name LIKE ? OR c.phone LIKE ?)'; $p = ["%$q%", "%$q%"]; }
        $clients = DB::all($sql . ' ORDER BY c.name LIMIT 500', $p);
        admin_render('clients/index', 'Клиенты', 'clients', ['clients' => $clients, 'q' => $q]);
    }

    public function show(int $id): void
    {
        $c = DB::row('SELECT * FROM clients WHERE id = ?', [$id]);
        if (!$c) { http_response_code(404); echo 'Клиент не найден'; return; }
        $orders = DB::all("SELECT o.*, ch.name character_name,
                    (o.total_amount - o.prepayment - (SELECT COALESCE(SUM(unit_price*qty),0) FROM order_items WHERE order_id=o.id)) balance
                    FROM orders o LEFT JOIN characters ch ON ch.id=o.character_id WHERE o.client_id=? ORDER BY o.event_date DESC", [$id]);
        admin_render('clients/show', 'Клиент: ' . $c['name'], 'clients', ['c' => $c, 'orders' => $orders]);
    }

    /** POST /admin/clients — добавление/редактирование клиента (только администратор) */
    public function save(): void
    {
        CSRF::ensure();
        if (!Auth::isAdmin()) { http_response_code(403); exit('Только для администратора'); }
        $id = (int)($_POST['id'] ?? 0);
        $errors = Validator::make($_POST, ['name'=>'required|string|max:150','phone'=>'required|phone_ru','email'=>'nullable|email']);
        if ($errors) { $_SESSION['flash_error'] = implode('; ', $errors); header('Location: /admin/clients'); return; }
        $phone = Validator::normPhone($_POST['phone']); $pd = !empty($_POST['pd_consent']) ? 1 : 0;
        if ($id) DB::run('UPDATE clients SET name=?, phone=?, email=?, pd_consent=? WHERE id=?',
            [trim($_POST['name']), $phone, trim($_POST['email'] ?? '') ?: null, $pd, $id]);
        else DB::run('INSERT INTO clients (name,phone,email,pd_consent) VALUES (?,?,?,?)',
            [trim($_POST['name']), $phone, trim($_POST['email'] ?? '') ?: null, $pd]);
        $_SESSION['flash_ok'] = 'Клиент сохранён'; header('Location: /admin/clients');
    }

    public function destroy(int $id): void
    {
        CSRF::ensure();
        if (!Auth::isAdmin()) { http_response_code(403); exit('Только для администратора'); }
        DB::run('DELETE FROM clients WHERE id = ?', [$id]);
        $_SESSION['flash_ok'] = 'Клиент удалён'; header('Location: /admin/clients');
    }
}
