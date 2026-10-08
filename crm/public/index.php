<?php
/**
 * Точка входа CRM-системы (чистый PHP 8.2+, без composer-зависимостей).
 * Запуск для разработки: php -S 0.0.0.0:8080 -t public public/index.php
 */
declare(strict_types=1);
require dirname(__DIR__) . '/src/Core/App.php';
(new App())->run();
