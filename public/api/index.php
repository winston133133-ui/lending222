<?php
/**
 * Party CRM API
 * REST API для работы с базой данных
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Обработка preflight запросов
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Загрузка конфигурации
$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Конфигурация не найдена. Запустите install.php']);
    exit();
}

$config = require $configPath;

// Подключение к базе данных
try {
    $pdo = new PDO(
        "mysql:host={$config['db_host']};dbname={$config['db_name']};charset=utf8mb4",
        $config['db_user'],
        $config['db_pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка подключения к базе данных']);
    exit();
}

// Получение метода и пути запроса
$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_GET['path']) ? $_GET['path'] : '';
$path = trim($path, '/');
$segments = explode('/', $path);

// Роутинг
try {
    switch ($segments[0] ?? '') {
        case 'auth':
            handleAuth($pdo, $method, $segments);
            break;
        case 'orders':
            handleOrders($pdo, $method, $segments);
            break;
        case 'clients':
            handleClients($pdo, $method, $segments);
            break;
        case 'characters':
            handleCharacters($pdo, $method, $segments);
            break;
        case 'settings':
            handleSettings($pdo, $method, $segments);
            break;
        case 'reviews':
            handleReviews($pdo, $method, $segments);
            break;
        case 'gallery':
            handleGallery($pdo, $method, $segments);
            break;
        case 'cross-products':
            handleCrossProducts($pdo, $method, $segments);
            break;
        case 'contact-links':
            handleContactLinks($pdo, $method, $segments);
            break;
        case 'stories':
            handleStories($pdo, $method, $segments);
            break;
        case 'users':
            handleUsers($pdo, $method, $segments);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint не найден']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

// Обработка авторизации
function handleAuth($pdo, $method, $segments) {
    if ($method === 'POST' && ($segments[1] ?? '') === 'login') {
        $data = json_decode(file_get_contents('php://input'), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password'])) {
            session_start();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_role'] = $user['role'];
            
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['name'],
                    'role' => $user['role']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Неверный email или пароль']);
        }
    } elseif ($method === 'POST' && ($segments[1] ?? '') === 'logout') {
        session_start();
        session_destroy();
        echo json_encode(['success' => true]);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// Обработка заказов
function handleOrders($pdo, $method, $segments) {
    session_start();
    
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
        $orders = $stmt->fetchAll();
        
        // Декодирование JSON полей
        foreach ($orders as &$order) {
            $order['songs'] = json_decode($order['songs'] ?? '[]', true);
            $order['cross_products'] = json_decode($order['cross_products'] ?? '[]', true);
        }
        
        echo json_encode($orders);
    } elseif ($method === 'POST') {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Не авторизован']);
            return;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $id = uniqid('order_');
        
        $stmt = $pdo->prepare("
            INSERT INTO orders (id, client_id, client_name, client_phone, character_id, character_name, 
            service_id, service_name, service_duration, status, event_date, event_time, address, 
            songs, comment, total_amount, prepaid_amount, cross_products)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $id,
            $data['clientId'],
            $data['clientName'],
            $data['clientPhone'],
            $data['characterId'],
            $data['characterName'],
            $data['serviceId'] ?? null,
            $data['serviceName'] ?? null,
            $data['serviceDuration'] ?? null,
            $data['status'] ?? 'NEW',
            $data['eventDate'],
            $data['eventTime'],
            $data['address'],
            json_encode($data['songs'] ?? []),
            $data['comment'] ?? null,
            $data['totalAmount'],
            $data['prepaidAmount'] ?? 0,
            json_encode($data['crossProducts'] ?? [])
        ]);
        
        echo json_encode(['success' => true, 'id' => $id]);
    } elseif ($method === 'PUT' && isset($segments[1])) {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Не авторизован']);
            return;
        }
        
        $id = $segments[1];
        $data = json_decode(file_get_contents('php://input'), true);
        
        $fields = [];
        $values = [];
        
        foreach ($data as $key => $value) {
            if (in_array($key, ['songs', 'cross_products'])) {
                $value = json_encode($value);
            }
            $fields[] = "$key = ?";
            $values[] = $value;
        }
        
        $values[] = $id;
        $sql = "UPDATE orders SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        
        echo json_encode(['success' => true]);
    } elseif ($method === 'DELETE' && isset($segments[1])) {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Не авторизован']);
            return;
        }
        
        $id = $segments[1];
        $stmt = $pdo->prepare("DELETE FROM orders WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// Обработка клиентов
function handleClients($pdo, $method, $segments) {
    session_start();
    
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM clients ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    } elseif ($method === 'POST') {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Не авторизован']);
            return;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $id = uniqid('client_');
        
        $stmt = $pdo->prepare("
            INSERT INTO clients (id, name, phone, email, consent_given, consent_date)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $id,
            $data['name'],
            $data['phone'],
            $data['email'] ?? null,
            $data['consentGiven'] ?? false,
            $data['consentDate'] ?? null
        ]);
        
        echo json_encode(['success' => true, 'id' => $id]);
    } elseif ($method === 'PUT' && isset($segments[1])) {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Не авторизован']);
            return;
        }
        
        $id = $segments[1];
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            UPDATE clients SET name = ?, phone = ?, email = ?, consent_given = ?, consent_date = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $data['name'],
            $data['phone'],
            $data['email'] ?? null,
            $data['consentGiven'] ?? false,
            $data['consentDate'] ?? null,
            $id
        ]);
        
        echo json_encode(['success' => true]);
    } elseif ($method === 'DELETE' && isset($segments[1])) {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Не авторизован']);
            return;
        }
        
        $id = $segments[1];
        $stmt = $pdo->prepare("DELETE FROM clients WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// Обработка персонажей
function handleCharacters($pdo, $method, $segments) {
    session_start();
    
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM characters ORDER BY created_at DESC");
        $characters = $stmt->fetchAll();
        
        // Получение услуг для каждого персонажа
        foreach ($characters as &$character) {
            $character['gallery'] = json_decode($character['gallery'] ?? '[]', true);
            
            $stmt = $pdo->prepare("SELECT * FROM character_services WHERE character_id = ?");
            $stmt->execute([$character['id']]);
            $character['services'] = $stmt->fetchAll();
        }
        
        echo json_encode($characters);
    } elseif ($method === 'POST') {
        if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещён']);
            return;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $id = uniqid('char_');
        
        $stmt = $pdo->prepare("
            INSERT INTO characters (id, name, description, gallery, seo_title, seo_description, seo_keywords, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $id,
            $data['name'],
            $data['description'] ?? '',
            json_encode($data['gallery'] ?? []),
            $data['seoTitle'] ?? '',
            $data['seoDescription'] ?? '',
            $data['seoKeywords'] ?? '',
            $data['isActive'] ?? true
        ]);
        
        // Добавление услуг
        if (isset($data['services'])) {
            foreach ($data['services'] as $service) {
                $serviceId = uniqid('service_');
                $stmt = $pdo->prepare("
                    INSERT INTO character_services (id, character_id, name, description, duration, price)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $serviceId,
                    $id,
                    $service['name'],
                    $service['description'] ?? '',
                    $service['duration'],
                    $service['price']
                ]);
            }
        }
        
        echo json_encode(['success' => true, 'id' => $id]);
    } elseif ($method === 'PUT' && isset($segments[1])) {
        if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещён']);
            return;
        }
        
        $id = $segments[1];
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            UPDATE characters SET name = ?, description = ?, gallery = ?, seo_title = ?, 
            seo_description = ?, seo_keywords = ?, is_active = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $data['name'],
            $data['description'] ?? '',
            json_encode($data['gallery'] ?? []),
            $data['seoTitle'] ?? '',
            $data['seoDescription'] ?? '',
            $data['seoKeywords'] ?? '',
            $data['isActive'] ?? true,
            $id
        ]);
        
        echo json_encode(['success' => true]);
    } elseif ($method === 'DELETE' && isset($segments[1])) {
        if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещён']);
            return;
        }
        
        $id = $segments[1];
        $stmt = $pdo->prepare("DELETE FROM characters WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// Обработка настроек
function handleSettings($pdo, $method, $segments) {
    session_start();
    
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT key_name, value FROM site_settings");
        $settings = [];
        
        while ($row = $stmt->fetch()) {
            $settings[$row['key_name']] = $row['value'];
        }
        
        echo json_encode($settings);
    } elseif ($method === 'PUT') {
        if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещён']);
            return;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        foreach ($data as $key => $value) {
            $stmt = $pdo->prepare("
                INSERT INTO site_settings (id, key_name, value) 
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE value = ?
            ");
            $id = uniqid('setting_');
            $stmt->execute([$id, $key, $value, $value]);
        }
        
        echo json_encode(['success' => true]);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// Обработка отзывов
function handleReviews($pdo, $method, $segments) {
    session_start();
    
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM reviews ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    } elseif ($method === 'POST') {
        if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещён']);
            return;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $id = uniqid('review_');
        
        $stmt = $pdo->prepare("
            INSERT INTO reviews (id, name, text, rating, is_active)
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $id,
            $data['name'],
            $data['text'],
            $data['rating'],
            $data['isActive'] ?? true
        ]);
        
        echo json_encode(['success' => true, 'id' => $id]);
    } elseif ($method === 'PUT' && isset($segments[1])) {
        if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещён']);
            return;
        }
        
        $id = $segments[1];
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            UPDATE reviews SET name = ?, text = ?, rating = ?, is_active = ?
            WHERE id = ?
        ");
        
        $stmt->execute([
            $data['name'],
            $data['text'],
            $data['rating'],
            $data['isActive'] ?? true,
            $id
        ]);
        
        echo json_encode(['success' => true]);
    } elseif ($method === 'DELETE' && isset($segments[1])) {
        if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещён']);
            return;
        }
        
        $id = $segments[1];
        $stmt = $pdo->prepare("DELETE FROM reviews WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// Обработка галереи
function handleGallery($pdo, $method, $segments) {
    session_start();
    
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM gallery ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    } elseif ($method === 'POST') {
        if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещён']);
            return;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $id = uniqid('gallery_');
        
        $stmt = $pdo->prepare("
            INSERT INTO gallery (id, image, description, is_active)
            VALUES (?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $id,
            $data['image'],
            $data['description'] ?? '',
            $data['isActive'] ?? true
        ]);
        
        echo json_encode(['success' => true, 'id' => $id]);
    } elseif ($method === 'DELETE' && isset($segments[1])) {
        if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещён']);
            return;
        }
        
        $id = $segments[1];
        $stmt = $pdo->prepare("DELETE FROM gallery WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// Обработка кросс-товаров
function handleCrossProducts($pdo, $method, $segments) {
    session_start();
    
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM cross_products ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    } elseif ($method === 'POST') {
        if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещён']);
            return;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $id = uniqid('cross_');
        
        $stmt = $pdo->prepare("
            INSERT INTO cross_products (id, name, image, price, description, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $id,
            $data['name'],
            $data['image'] ?? null,
            $data['price'],
            $data['description'] ?? null,
            $data['isActive'] ?? true
        ]);
        
        echo json_encode(['success' => true, 'id' => $id]);
    } elseif ($method === 'DELETE' && isset($segments[1])) {
        if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещён']);
            return;
        }
        
        $id = $segments[1];
        $stmt = $pdo->prepare("DELETE FROM cross_products WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// Обработка контактных ссылок
function handleContactLinks($pdo, $method, $segments) {
    session_start();
    
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM contact_links ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    } elseif ($method === 'POST') {
        if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещён']);
            return;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $id = uniqid('contact_');
        
        $stmt = $pdo->prepare("
            INSERT INTO contact_links (id, type, icon, label, value, link, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $id,
            $data['type'],
            $data['icon'] ?? null,
            $data['label'],
            $data['value'],
            $data['link'],
            $data['isActive'] ?? true
        ]);
        
        echo json_encode(['success' => true, 'id' => $id]);
    } elseif ($method === 'DELETE' && isset($segments[1])) {
        if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещён']);
            return;
        }
        
        $id = $segments[1];
        $stmt = $pdo->prepare("DELETE FROM contact_links WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// Обработка историй
function handleStories($pdo, $method, $segments) {
    session_start();
    
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM stories ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    } elseif ($method === 'POST') {
        if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещён']);
            return;
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        $id = uniqid('story_');
        
        $stmt = $pdo->prepare("
            INSERT INTO stories (id, type, media, title, description, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $id,
            $data['type'],
            $data['media'],
            $data['title'],
            $data['description'] ?? null,
            $data['isActive'] ?? true
        ]);
        
        echo json_encode(['success' => true, 'id' => $id]);
    } elseif ($method === 'DELETE' && isset($segments[1])) {
        if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'ADMIN') {
            http_response_code(403);
            echo json_encode(['error' => 'Доступ запрещён']);
            return;
        }
        
        $id = $segments[1];
        $stmt = $pdo->prepare("DELETE FROM stories WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

// Обработка пользователей
function handleUsers($pdo, $method, $segments) {
    session_start();
    
    if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'ADMIN') {
        http_response_code(403);
        echo json_encode(['error' => 'Доступ запрещён']);
        return;
    }
    
    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = uniqid('user_');
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare("
            INSERT INTO users (id, email, password, name, role)
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $id,
            $data['email'],
            $hashedPassword,
            $data['name'],
            $data['role']
        ]);
        
        echo json_encode(['success' => true, 'id' => $id]);
    } elseif ($method === 'DELETE' && isset($segments[1])) {
        $id = $segments[1];
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}
?>
