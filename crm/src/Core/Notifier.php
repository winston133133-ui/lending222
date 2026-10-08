<?php
/**
 * Notifier — уведомления о заявках:
 *  1) realtime-очередь (таблица pending_notifications, забирается long-polling'ом админки);
 *  2) Telegram-бот и e-mail (настройки из таблицы settings: tg_bot_token, tg_chat_id, notify_email).
 * Отправка — «огонь и забыть»: ошибки пишутся в notification_log, ответ сайта не блокируется.
 */
class Notifier
{
    /** Ставим уведомление в realtime-очередь для админки */
    public static function queueRealtime(string $type, array $payload): void
    {
        DB::run('INSERT INTO pending_notifications (type, payload) VALUES (?, ?)',
            [$type, json_encode($payload, JSON_UNESCAPED_UNICODE)]);
    }

    /** Админка забирает новые уведомления после последнего видимого id (long-polling) */
    public static function fetchRealtime(int $sinceId): array
    {
        return DB::all('SELECT id, type, payload, created_at FROM pending_notifications WHERE id > ? ORDER BY id LIMIT 20', [$sinceId]);
    }

    /** Новая заявка -> Telegram + e-mail (если настроены) */
    public static function dispatchNewOrder(array $order): void
    {
        $text = self::orderText($order);
        self::sendTelegram($text);
        self::sendEmail((string)setting('notify_email', ''), 'Новая заявка №' . ($order['id'] ?? ''), $text);
    }

    /** Отправка чека на e-mail клиента (заявка со статусом «Завершено») */
    public static function sendReceiptToClient(?string $email, string $subject, string $body, ?string $receiptPath): bool
    {
        if (!$email) return false;
        $ok = self::sendEmail($email, $subject, $body, $receiptPath);
        self::queueRealtime('receipt_sent', ['email' => $email, 'subject' => $subject, 'ok' => $ok]);
        return $ok;
    }

    private static function orderText(array $o): string
    {
        return "🎉 Новая заявка №{$o['id']}\n"
             . "Клиент: {$o['customer_name']} ({$o['phone']})\n"
             . "Мероприятие: {$o['event_date']} {$o['event_time']}\n"
             . "Адрес: {$o['address']}\n"
             . "Персонаж: " . ($o['character_name'] ?? '—') . "\n"
             . "Сумма: {$o['total_amount']} ₽, предоплата: {$o['prepayment']} ₽";
    }

    private static function sendTelegram(string $text): void
    {
        $token = setting('tg_bot_token', ''); $chat = setting('tg_chat_id', '');
        if (!$token || !$chat || $token === 'DEMO_TOKEN') return;
        @file_get_contents('https://api.telegram.org/bot' . $token . '/sendMessage?'
            . http_build_query(['chat_id' => $chat, 'text' => $text]));
    }

    private static function sendEmail(string $to, string $subject, string $body, ?string $attach = null): bool
    {
        if (!$to || !filter_var($to, FILTER_VALIDATE_EMAIL)) return false;
        $headers = 'From: ' . setting('site_name', 'CRM') . " <no-reply@rk4me.ru>\r\nContent-Type: text/plain; charset=utf-8\r\n";
        if ($attach && is_file(self::abs($attach))) { // MIME с вложением чека
            $b = 'crm' . bin2hex(random_bytes(6));
            $headers .= "MIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary=\"$b\"\r\n";
            $body = "--$b\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n$body\r\n"
                  . "--$b\r\nContent-Type: application/octet-stream; name=\"" . basename($attach) . "\"\r\n"
                  . "Content-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode(file_get_contents(self::abs($attach)))) . "\r\n--$b--";
        }
        return @mail($to, self::enc($subject), $body, $headers);
    }

    private static function abs(string $p): string { return dirname(__DIR__, 2) . '/public' . '/' . ltrim($p, '/'); }
    private static function enc(string $s): string { return '=?UTF-8?B?' . base64_encode($s) . '?='; }
}
