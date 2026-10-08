<?php
require_once __DIR__ . '/DB.php'; require_once __DIR__ . '/Auth.php'; require_once __DIR__ . '/CSRF.php'; require_once __DIR__ . '/Validator.php';
/** CRUD пользователей CRM. Роли: Администратор (полный доступ), Менеджер (заявки+клиенты). Только для администратора. */
class UsersController
{
    public function index(): void
    {
        admin_render('users', 'Пользователи', 'settings', ['users' => DB::all('SELECT id,name,email,role,is_active FROM users ORDER BY id')]);
    }

    public function save(): void
    {
        CSRF::ensure();
        if (!Auth::isAdmin()) { http_response_code(403); exit('Только для администратора'); }
        $id = (int)($_POST['id'] ?? 0);
        $rules = ['name'=>'required|string|max:120','email'=>'required|email','role'=>'required|choice:admin,manager'];
        if (!$id) $rules['password'] = 'required|min:6';
        $errors = Validator::make($_POST, $rules);
        if ($errors) { $_SESSION['flash_error'] = implode('; ', $errors); header('Location: /admin/users'); return; }
        $hash = !empty($_POST['password']) ? password_hash($_POST['password'], PASSWORD_BCRYPT) : null;
        $active = empty($_POST['is_active']) || $_POST['is_active'] === '1' ? 1 : 0;
        try {
            if ($id) {
                if ($hash) DB::run('UPDATE users SET name=?, email=?, role=?, is_active=?, password_hash=? WHERE id=?',
                    [$_POST['name'], $_POST['email'], $_POST['role'], $active, $hash, $id]);
                else DB::run('UPDATE users SET name=?, email=?, role=?, is_active=? WHERE id=?',
                    [$_POST['name'], $_POST['email'], $_POST['role'], $active, $id]);
            } else {
                DB::run('INSERT INTO users (name,email,password_hash,role,is_active) VALUES (?,?,?,?,?)',
                    [$_POST['name'], $_POST['email'], $hash, $_POST['role'], $active]);
            }
            $_SESSION['flash_ok'] = 'Пользователь сохранён';
        } catch (Throwable $e) { $_SESSION['flash_error'] = 'Email уже занят'; }
        header('Location: /admin/users');
    }

    public function destroy(int $id): void
    {
        CSRF::ensure();
        if (!Auth::isAdmin() || $id === (int)($_SESSION['uid'] ?? 0)) { http_response_code(403); exit('Нельзя удалить себя'); }
        DB::run('DELETE FROM users WHERE id = ?', [$id]);
        $_SESSION['flash_ok'] = 'Пользователь удалён'; header('Location: /admin/users');
    }
}
