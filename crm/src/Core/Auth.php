<?php
/**
 * Auth — собственная реализация аутентификации на PHP-сессиях.
 * Пароли: password_hash()/password_verify() (bcrypt). Роли: admin | manager.
 * Менеджер имеет доступ только к заявкам и клиентам (+дашборд, календарь).
 */
class Auth
{
    public static function login(string $email, string $password): bool
    {
        $u = DB::row('SELECT * FROM users WHERE email = ? AND is_active = 1', [$email]);
        if ($u && password_verify($password, $u['password_hash'])) {
            session_regenerate_id(true); // защита от фиксации сессии
            $_SESSION['uid']  = (int)$u['id'];
            $_SESSION['role'] = $u['role'];
            $_SESSION['name'] = $u['name'];
            return true;
        }
        return false;
    }

    public static function logout(): void
    {
        $_SESSION = [];
        session_destroy();
    }

    public static function user(): ?array
    {
        return isset($_SESSION['uid']) ? ['id' => $_SESSION['uid'], 'role' => $_SESSION['role'], 'name' => $_SESSION['name']] : null;
    }

    public static function check(): bool { return isset($_SESSION['uid']); }
    public static function isAdmin(): bool { return ($_SESSION['role'] ?? '') === 'admin'; }

    /** Пустая строка = полный доступ; иначе список разрешённых префиксов разделов админки */
    public static function allowedSections(): array
    {
        return self::isAdmin() ? [] : ['dashboard', 'orders', 'clients', 'calendar'];
    }

    public static function canView(string $section): bool
    {
        $allowed = self::allowedSections();
        return $allowed === [] || in_array($section, $allowed, true);
    }

    /** Гость — редирект на страницу логина */
    public static function requireLogin(): void
    {
        if (!self::check()) { header('Location: /admin/login'); exit; }
    }
}
