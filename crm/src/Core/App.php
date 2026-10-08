<?php
require_once __DIR__ . '/helpers.php'; require_once __DIR__ . '/DB.php'; require_once __DIR__ . '/Auth.php';
require_once __DIR__ . '/CSRF.php'; require_once __DIR__ . '/SiteController.php'; require_once __DIR__ . '/AuthController.php';
require_once __DIR__ . '/DashboardController.php'; require_once __DIR__ . '/OrdersController.php'; require_once __DIR__ . '/ClientsController.php';
require_once __DIR__ . '/CalendarController.php'; require_once __DIR__ . '/SettingsController.php'; require_once __DIR__ . '/UsersController.php';
/**
 * App — микромаршрутизатор без внешних зависимостей (чистый PHP 8.2+).
 * Все параметры маршрутов приводятся к int, POST-guard роуты принимают только POST.
 */
class App
{
    private array $get = []; private array $post = [];

    public function run(): void
    {
        session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
        session_start();
        DB::init();
        $this->routes();
        $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        foreach (($method === 'GET' ? $this->get : $this->post) as [$pattern, $handler]) {
            $regex = '#^' . preg_replace('#\{(id|uid|tab|slug)\}#', '(?P<$1>\d+|[a-z_-]+)', $pattern) . '$#';
            if (preg_match($regex, $path, $m)) {
                $args = array_filter($m, 'is_string', ARRAY_FILTER_USE_KEY);
                array_walk($args, fn(&$v) => ctype_digit($v) ? $v = (int)$v : $v);
                echo '' === (string)call_user_func_array($handler, $args);
                return;
            }
        }
        http_response_code(404);
        echo '<h1 style="font-family:system-ui;padding:40px">404 — страница не найдена. <a href="/">На главную</a></h1>';
    }

    private function get(string $p, callable $h): void { $this->get[] = [$p, $h]; }
    private function post(string $p, callable $h): void { $this->post[] = [$p, fn(...$a) => $h(...$a)]; }

    private function routes(): void
    {
        $site = new SiteController(); $auth = new AuthController(); $dash = new DashboardController();
        $orders = new OrdersController(); $clients = new ClientsController(); $cal = new CalendarController();
        $settings = new SettingsController(); $users = new UsersController();

        // Публичная часть
        $this->get('/', [$site, 'home']);
        $this->get('/api/slots', [$site, 'slots']);
        $this->get('/privacy', fn() => $site->legal('privacy'));
        $this->get('/agreement', fn() => $site->legal('agreement'));
        $this->post('/order/create', [$site, 'storeOrder']);
        $this->post('/subscribe', [$site, 'subscribe']);
        $this->post('/page/save', [$site, 'savePage']);

        // Вход/выход
        $this->get('/admin/login', [$auth, 'showLogin']);
        $this->post('/admin/login', [$auth, 'showLogin']);
        $this->post('/admin/logout', [$auth, 'logout']);

        // Разделы CRM
        $this->get('/admin', [$dash, 'index']);
        $this->get('/admin/orders', [$orders, 'index']);
        $this->get('/admin/orders/{id}', [$orders, 'show']);
        $this->post('/admin/orders/create', [$orders, 'store']);
        $this->post('/admin/orders/{id}/update', [$orders, 'update']);
        $this->post('/admin/orders/{id}/status', [$orders, 'setStatus']);
        $this->post('/admin/orders/{id}/receipt', [$orders, 'sendReceipt']);
        $this->post('/admin/orders/{id}/delete', [$orders, 'destroy']);
        $this->get('/api/admin/notifications', [$orders, 'pollNotifications']);
        $this->get('/admin/clients', [$clients, 'index']);
        $this->get('/admin/clients/{id}', [$clients, 'show']);
        $this->post('/admin/clients/save', [$clients, 'save']);
        $this->post('/admin/clients/{id}/delete', [$clients, 'destroy']);
        $this->get('/admin/calendar', [$cal, 'index']);
        $this->get('/admin/users', [$users, 'index']);
        $this->post('/admin/users/save', [$users, 'save']);
        $this->post('/admin/users/{id}/delete', [$users, 'destroy']);

        // Настройки/CMS: 14 вкладок
        $this->get('/admin/settings/{tab}', [$settings, 'index']);
        $this->post('/admin/settings/{tab}', [$settings, 'save']);
        $this->post('/admin/settings/{tab}/delete/{id}', [$settings, 'deleteRow']);
    }
}
