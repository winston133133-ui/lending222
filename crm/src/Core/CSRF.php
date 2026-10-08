<?php
/**
 * CSRF — токен в сессии, проверяется на всех POST-запросах админки и API.
 * В формах передаётся скрытым полем _token, в fetch — заголовком X-CSRF-Token.
 */
class CSRF
{
    public static function token(): string
    {
        if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
        return $_SESSION['csrf'];
    }

    public static function field(): string
    {
        return '<input type="hidden" name="_token" value="' . e(self::token()) . '">';
    }

    /** Разрешённые источники токена: поле формы, заголовок X-CSRF-Token или meta на странице */
    public static function validate(): bool
    {
        $sent = $_POST['_token'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
        return $sent !== '' && hash_equals($_SESSION['csrf'] ?? '', $sent);
    }

    public static function ensure(): void
    {
        if (!self::validate()) { http_response_code(419); exit('CSRF-проверка не пройдена. Обновите страницу.'); }
    }
}
