<?php
/**
 * SlotService — единая точка расчёта доступных слотов бронирования (DRY: используется
 * и публичным API /api/slots, и CRM-календарём, и при сохранении заявки).
 * Правила из ТЗ: режим работы (06:00–23:00), интервал шага, буфер ±30 минут до/после.
 */
class SlotService
{
    /** Свободные слоты на дату для программы длительностью $durationMin */
    public static function freeSlots(string $date, int $durationMin): array
    {
        $sc = self::schedule();
        $start = self::toMin($sc['start_time']); $end = self::toMin($sc['end_time']);
        $busy = self::busyIntervals($date);
        $free = [];
        for ($t = $start; $t + $durationMin <= $end; $t += (int)$sc['interval_min']) {
            if (!self::conflicts($t, $durationMin, (int)$sc['buffer_min'], $busy)) {
                $free[] = sprintf('%02d:%02d', intdiv($t, 60), $t % 60);
            }
        }
        return $free;
    }

    /** Проверка конкретного времени (защита от гонки двух заявок) */
    public static function isAvailable(string $date, string $time, int $durationMin): array
    {
        $sc = self::schedule();
        $t = self::toMin($time); $buf = (int)$sc['buffer_min'];
        if ($t < self::toMin($sc['start_time']) || $t + $durationMin > self::toMin($sc['end_time']))
            return ['available' => false, 'reason' => 'Вне графика работы (' . $sc['start_time'] . '–' . $sc['end_time'] . ')'];
        foreach (self::busyIntervals($date) as $b) {
            if ($t < $b['end'] + $buf && $b['start'] < $t + $durationMin + $buf)
                return ['available' => false, 'reason' => 'Это время занято (или пересекает буфер ±' . $buf . ' мин), выберите другое'];
        }
        return ['available' => true, 'reason' => ''];
    }

    /** Занятые интервалы на дату (все не отменённые заявки) */
    public static function busyIntervals(string $date): array
    {
        $rows = DB::all("SELECT o.event_time, COALESCE(cs.duration_min, c.duration_min, 40) dur
                        FROM orders o
                        LEFT JOIN characters c ON c.id = o.character_id
                        LEFT JOIN character_services cs ON cs.id = o.service_id
                        WHERE o.event_date = ? AND o.status != 'cancelled'", [$date]);
        return array_map(fn($r) => [
            'start' => self::toMin($r['event_time']),
            'end'   => self::toMin($r['event_time']) + (int)$r['dur'],
        ], $rows);
    }

    public static function schedule(): array
    {
        return DB::row('SELECT * FROM work_schedule ORDER BY id LIMIT 1')
            ?? ['start_time' => '06:00', 'end_time' => '23:00', 'interval_min' => 60, 'buffer_min' => 30];
    }

    private static function conflicts(int $t, int $dur, int $buf, array $busy): bool
    {
        foreach ($busy as $b) if ($t < $b['end'] + $buf && $b['start'] < $t + $dur + $buf) return true;
        return false;
    }

    private static function toMin(string $hm): int
    {
        [$h, $m] = array_pad(explode(':', $hm), 2, '0');
        return (int)$h * 60 + (int)$m;
    }
}
