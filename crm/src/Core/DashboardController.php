<?php
require_once __DIR__ . '/DB.php';
/** Дашборд: новые заявки сегодня/неделя, ближайшие мероприятия, выручка и остатки (real-time) */
class DashboardController
{
    public function index(): void
    {
        $today = date('Y-m-d'); $weekAgo = date('Y-m-d', strtotime('-7 days')); $tomorrow = date('Y-m-d', strtotime('+1 day'));
        $stats = [
            'new_today'  => (int)DB::row("SELECT COUNT(*) c FROM orders WHERE created_at >= ? AND status NOT IN ('cancelled')", [$today . ' 00:00'])['c'],
            'new_week'   => (int)DB::row("SELECT COUNT(*) c FROM orders WHERE created_at >= ? AND status NOT IN ('cancelled')", [$weekAgo])['c'],
            // Выручка: предоплаты и полные оплаты (по всем не отменённым заявкам)
            'prepay_sum' => (int)DB::row("SELECT COALESCE(SUM(prepayment),0) s FROM orders WHERE status != 'cancelled'")['s'],
            'paid_full'  => (int)DB::row("SELECT COALESCE(SUM(total_amount),0) s FROM orders WHERE status = 'completed'")['s'],
        ];
        // Остаток = сумма − предоплата − кросс-товары (real-time, как в VIEW v_orders_balance)
        $upcoming = DB::all("SELECT o.*, c.name customer, c.phone, ch.name character_name,
                    (o.total_amount - o.prepayment - (SELECT COALESCE(SUM(unit_price*qty),0) FROM order_items WHERE order_id = o.id)) balance
                FROM orders o LEFT JOIN clients c ON c.id = o.client_id LEFT JOIN characters ch ON ch.id = o.character_id
                WHERE o.status NOT IN ('cancelled','completed') AND (o.event_date = ? OR o.event_date = ?)
                ORDER BY o.event_date, o.event_time", [$today, $tomorrow]);
        $recent = DB::all("SELECT o.id, o.status, o.total_amount, o.created_at, c.name customer, c.phone
                FROM orders o LEFT JOIN clients c ON c.id=o.client_id ORDER BY o.created_at DESC LIMIT 8");
        $viewData = compact('stats','upcoming','recent');
        admin_render('dashboard', 'Дашборд', 'dashboard', $viewData);
    }
}
