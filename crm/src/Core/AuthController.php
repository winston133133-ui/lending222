<?php
require_once __DIR__ . '/Auth.php'; require_once __DIR__ . '/CSRF.php';
/** Страница входа + выход из админки */
class AuthController
{
    public function showLogin(): void
    {
        if (Auth::check()) { header('Location: /admin'); return; }
        $error = '';
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            CSRF::ensure();
            if (Auth::login(trim($_POST['email'] ?? ''), $_POST['password'] ?? '')) { header('Location: /admin'); exit; }
            sleep(1); // замедление перебора паролей
            $error = 'Неверный email или пароль';
        }
        require dirname(__DIR__) . '/Views/admin/login.php';
    }

    public function logout(): void { CSRF::validate() ? Auth::logout() : null; header('Location: /admin/login'); }
}
