<?php
/**
 * Party CRM - Установка на хостинг
 * 
 * Этот скрипт создаёт базу данных и таблицы для работы CRM
 */

session_start();

// Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $db_host = $_POST['db_host'] ?? 'localhost';
    $db_name = $_POST['db_name'] ?? 'party_crm';
    $db_user = $_POST['db_user'] ?? 'root';
    $db_pass = $_POST['db_pass'] ?? '';
    $admin_email = $_POST['admin_email'] ?? 'admin@crm.ru';
    $admin_password = $_POST['admin_password'] ?? 'admin123';
    
    try {
        // Подключение к MySQL
        $pdo = new PDO("mysql:host=$db_host", $db_user, $db_pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Создание базы данных
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $pdo->exec("USE `$db_name`");
        
        // Создание таблиц
        createTables($pdo);
        
        // Создание администратора
        createAdmin($pdo, $admin_email, $admin_password);
        
        // Сохранение конфигурации
        saveConfig($db_host, $db_name, $db_user, $db_pass);
        
        $success = true;
        $message = "Установка завершена успешно!";
        
    } catch (PDOException $e) {
        $success = false;
        $message = "Ошибка: " . $e->getMessage();
    }
}

function createTables($pdo) {
    // Таблица пользователей
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            role ENUM('ADMIN', 'MANAGER') NOT NULL DEFAULT 'MANAGER',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Таблица клиентов
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS clients (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            email VARCHAR(255),
            consent_given BOOLEAN DEFAULT FALSE,
            consent_date DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Таблица персонажей
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS characters (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            gallery JSON,
            seo_title VARCHAR(255),
            seo_description TEXT,
            seo_keywords VARCHAR(500),
            is_active BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Таблица услуг персонажей
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS character_services (
            id VARCHAR(36) PRIMARY KEY,
            character_id VARCHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            duration INT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Таблица заказов
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS orders (
            id VARCHAR(36) PRIMARY KEY,
            client_id VARCHAR(36) NOT NULL,
            client_name VARCHAR(255) NOT NULL,
            client_phone VARCHAR(50) NOT NULL,
            character_id VARCHAR(36) NOT NULL,
            character_name VARCHAR(255) NOT NULL,
            service_id VARCHAR(36),
            service_name VARCHAR(255),
            service_duration INT,
            status ENUM('NEW', 'PROCESSING', 'PREPAID', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'NEW',
            event_date DATE NOT NULL,
            event_time TIME NOT NULL,
            address TEXT NOT NULL,
            songs JSON,
            comment TEXT,
            total_amount DECIMAL(10,2) NOT NULL,
            prepaid_amount DECIMAL(10,2) DEFAULT 0,
            cross_products JSON,
            receipt_image LONGTEXT,
            receipt_date DATE,
            receipt_email VARCHAR(255),
            is_new BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id),
            FOREIGN KEY (character_id) REFERENCES characters(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Таблица отзывов
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS reviews (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            text TEXT NOT NULL,
            rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
            is_active BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Таблица галереи
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS gallery (
            id VARCHAR(36) PRIMARY KEY,
            image LONGTEXT NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Таблица кросс-товаров
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS cross_products (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            image LONGTEXT,
            price DECIMAL(10,2) NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Таблица настроек сайта
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS site_settings (
            id VARCHAR(36) PRIMARY KEY,
            key_name VARCHAR(255) UNIQUE NOT NULL,
            value LONGTEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Таблица контактных ссылок
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS contact_links (
            id VARCHAR(36) PRIMARY KEY,
            type ENUM('phone', 'link') NOT NULL,
            icon VARCHAR(500),
            label VARCHAR(255) NOT NULL,
            value VARCHAR(255) NOT NULL,
            link VARCHAR(500) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Таблица историй
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS stories (
            id VARCHAR(36) PRIMARY KEY,
            type ENUM('photo', 'video') NOT NULL,
            media LONGTEXT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    
    // Таблица расписания работы
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS work_schedule (
            id VARCHAR(36) PRIMARY KEY,
            day VARCHAR(20) NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            is_active BOOLEAN DEFAULT TRUE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

function createAdmin($pdo, $email, $password) {
    $id = uniqid('user_');
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, 'ADMIN')");
    $stmt->execute([$id, $email, $hashedPassword, 'Администратор']);
}

function saveConfig($host, $name, $user, $pass) {
    $config = "<?php\nreturn [\n    'db_host' => '$host',\n    'db_name' => '$name',\n    'db_user' => '$user',\n    'db_pass' => '$pass',\n];\n";
    file_put_contents(__DIR__ . '/api/config.php', $config);
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Party CRM - Установка</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #667eea; margin-bottom: 10px; font-size: 28px; }
        .subtitle { color: #666; margin-bottom: 30px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; color: #333; font-weight: 500; }
        input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        input:focus { outline: none; border-color: #667eea; }
        button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        button:hover { transform: translateY(-2px); }
        .message {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info {
            background: #e7f3ff;
            color: #004085;
            border: 1px solid #b8daff;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Party CRM</h1>
        <p class="subtitle">Установка системы на хостинг</p>
        
        <?php if (isset($success)): ?>
            <div class="message <?php echo $success ? 'success' : 'error'; ?>">
                <?php echo htmlspecialchars($message); ?>
            </div>
            
            <?php if ($success): ?>
                <div class="info">
                    <strong>Данные для входа:</strong><br>
                    Email: <?php echo htmlspecialchars($admin_email); ?><br>
                    Пароль: <?php echo htmlspecialchars($admin_password); ?><br><br>
                    <strong>Важно:</strong> Удалите файл install.php после установки!
                </div>
                <br>
                <a href="index.html" style="display: block; text-align: center; padding: 14px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Перейти на сайт →
                </a>
            <?php endif; ?>
        <?php else: ?>
            <form method="POST">
                <div class="form-group">
                    <label>Хост базы данных</label>
                    <input type="text" name="db_host" value="localhost" required>
                </div>
                <div class="form-group">
                    <label>Имя базы данных</label>
                    <input type="text" name="db_name" value="party_crm" required>
                </div>
                <div class="form-group">
                    <label>Пользователь БД</label>
                    <input type="text" name="db_user" value="root" required>
                </div>
                <div class="form-group">
                    <label>Пароль БД</label>
                    <input type="password" name="db_pass">
                </div>
                <div class="form-group">
                    <label>Email администратора</label>
                    <input type="email" name="admin_email" value="admin@crm.ru" required>
                </div>
                <div class="form-group">
                    <label>Пароль администратора</label>
                    <input type="password" name="admin_password" value="admin123" required>
                </div>
                <button type="submit">Установить CRM</button>
            </form>
            
            <div class="info">
                <strong>Инструкция:</strong><br>
                1. Загрузите все файлы из папки dist/ в корень сайта<br>
                2. Загрузите файл install.php в корень сайта<br>
                3. Откройте install.php в браузере<br>
                4. Введите данные для подключения к MySQL<br>
                5. Нажмите "Установить CRM"<br>
                6. После установки удалите install.php
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
