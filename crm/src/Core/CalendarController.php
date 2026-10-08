<?php
require_once __DIR__ . '/DB.php'; require_once __DIR__ . '/SlotService.php';
/** Календарь бронирований: сетка дней с занятыми слотами + буферы ±30 мин */
class CalendarController
{
    public function index(): void
    {
        // Первый день месяца, за которым показываем сетку (навигация ?m=YYYY-MM)
        $month = preg_match('/^\d{4}-\d{2}$/', $_GET['m'] ?? '') ? $_GET['m'] : date('Y-m');
        $ts = strtotime($month . '-01');
        $daysInMonth = (int)date('t', $ts);
        $sc = SlotService::schedule();
        $events = [];
        foreach (DB::all("SELECT o.*, c.name customer, c.phone, ch.name character_name, COALESCE(cs.duration_min, ch.duration_min, 40) dur
                          FROM orders o LEFT JOIN clients c ON c.id=o.client_id LEFT JOIN characters ch ON ch.id=o.character_id
                          LEFT JOIN character_services cs ON cs.id=o.service_id
                          WHERE o.event_date LIKE ? AND o.status != 'cancelled' ORDER BY o.event_date, o.event_time",
                         [$month . '-%']) as $ev) $events[$ev['event_date']][] = $ev;
        $cells = [];
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $date = sprintf('%s-%02d', $month, $d);
            $free = SlotService::freeSlots($date, max(10, (int)$sc['interval_min']));
            $cells[] = ['date' => $date, 'day' => $d, 'weekday' => date('D', strtotime($date)),
                        'events' => $events[$date] ?? [], 'free' => count($free)];
        }
        admin_render('calendar', 'Календарь бронирований', 'calendar',
            ['month' => $month, 'cells' => $cells, 'sc' => $sc, 'prev' => date('Y-m', strtotime($month . '-01 -1 month')),
             'next' => date('Y-m', strtotime($month . '-01 +1 month'))]);
    }
}
