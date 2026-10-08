<?php
// Ядро превью: PDO-обёртка (SQLite для локального предпросмотра, MySQL на проде) + схема и сиды.
// Эквивалент production-схемы — crm/database/schema.sql
class DB {
    private static ?PDO $pdo = null;
    public static function pdo(): PDO {
        if (self::$pdo === null) {
            self::$pdo = new PDO('sqlite:' . __DIR__ . '/../../data/app.sqlite');
            self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            self::$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            self::$pdo->exec('PRAGMA foreign_keys = ON');
            self::migrate(self::$pdo);
        }
        return self::$pdo;
    }

    /**
     * Инициализация соединения (вызывается один раз на старте приложения в App::run()).
     * Ленивая: реально PDO создаётся при первом обращении через pdo().
     */
    public static function init(): void { self::pdo(); }

    // --- Универсальные хелперы доступа к данным (prepared statements, защита от SQL-инъекций) ---
    public static function all(string $sql, array $p = []): array { $s = self::pdo()->prepare($sql); $s->execute($p); return $s->fetchAll(); }
    public static function row(string $sql, array $p = []): ?array { $s = self::pdo()->prepare($sql); $s->execute($p); $r = $s->fetch(); return $r ?: null; }
    public static function run(string $sql, array $p = []): void { $s = self::pdo()->prepare($sql); $s->execute($p); }

    private static function migrate(PDO $db): void {
        if ($db->query("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='users'")->fetchColumn() > 0) return;
        $stmts = [
"CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'manager', is_active INTEGER DEFAULT 1)",
"CREATE TABLE clients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT UNIQUE NOT NULL, email TEXT, pd_consent INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now','localtime')))",
"CREATE TABLE characters (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, slug TEXT UNIQUE, description TEXT, seo_description TEXT, price_from INTEGER DEFAULT 0, duration_min INTEGER DEFAULT 30, is_active INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0)",
"CREATE TABLE character_services (id INTEGER PRIMARY KEY AUTOINCREMENT, character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT, duration_min INTEGER, price INTEGER)",
"CREATE TABLE character_features (id INTEGER PRIMARY KEY AUTOINCREMENT, character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE, feature_key TEXT, feature_value TEXT)",
"CREATE TABLE character_images (id INTEGER PRIMARY KEY AUTOINCREMENT, character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE, path TEXT NOT NULL, alt TEXT)",
"CREATE TABLE cross_products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, price INTEGER NOT NULL, photo_path TEXT, is_active INTEGER DEFAULT 1)",
"CREATE TABLE orders (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER REFERENCES clients(id), character_id INTEGER REFERENCES characters(id), service_id INTEGER REFERENCES character_services(id), customer_name TEXT NOT NULL, event_date TEXT NOT NULL, event_time TEXT NOT NULL, address TEXT, songs TEXT, comment TEXT, total_amount INTEGER NOT NULL DEFAULT 0, prepayment INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'new', receipt_path TEXT, pd_consent INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now','localtime')))",
"CREATE TABLE order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE, product_id INTEGER REFERENCES cross_products(id), product_name TEXT, unit_price INTEGER, qty INTEGER DEFAULT 1, line_total INTEGER GENERATED ALWAYS AS (unit_price*qty) STORED)",
"CREATE TABLE order_services (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE, service_id INTEGER REFERENCES character_services(id))",
"CREATE TABLE work_schedule (id INTEGER PRIMARY KEY AUTOINCREMENT, start_time TEXT DEFAULT '06:00', end_time TEXT DEFAULT '23:00', interval_min INTEGER DEFAULT 60, buffer_min INTEGER DEFAULT 30)",
"CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT)",
"CREATE TABLE contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, label TEXT, type TEXT, url TEXT, value TEXT, icon_url TEXT, sort_order INTEGER DEFAULT 0)",
"CREATE TABLE conditions (id INTEGER PRIMARY KEY AUTOINCREMENT, group_key TEXT, title TEXT, body TEXT, icon TEXT, sort_order INTEGER DEFAULT 0)",
"CREATE TABLE payment_methods (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, body TEXT, icon TEXT, note TEXT)",
"CREATE TABLE how_to_order (id INTEGER PRIMARY KEY AUTOINCREMENT, step INTEGER, title TEXT, body TEXT, icon TEXT)",
"CREATE TABLE stories (id INTEGER PRIMARY KEY AUTOINCREMENT, media_type TEXT DEFAULT 'image', media_url TEXT, caption TEXT, view_seconds INTEGER DEFAULT 10)",
"CREATE TABLE gallery (id INTEGER PRIMARY KEY AUTOINCREMENT, image_url TEXT, caption TEXT)",
"CREATE TABLE reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, text TEXT, photo_url TEXT, rating INTEGER DEFAULT 5, is_published INTEGER DEFAULT 1)",
"CREATE TABLE subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, created_at TEXT DEFAULT (datetime('now','localtime')))",
"CREATE TABLE legal_pages (slug TEXT PRIMARY KEY, title TEXT, body TEXT)",
"CREATE TABLE pending_notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, payload TEXT, created_at TEXT DEFAULT (datetime('now','localtime')))",
        ];
        foreach ($stmts as $s) $db->exec($s);
        self::seed($db);
    }

    private static function seed(PDO $db): void {
        // Учётки: администратор и менеджер (пароли — только для демо-превью)
        $u = $db->prepare("INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)");
        $u->execute(['Администратор','admin@rk4me.ru', password_hash('admin123', PASSWORD_BCRYPT), 'admin']);
        $u->execute(['Менеджер Ольга','manager@rk4me.ru', password_hash('manager123', PASSWORD_BCRYPT), 'manager']);
        $db->exec("INSERT INTO work_schedule (start_time,end_time,interval_min,buffer_min) VALUES ('06:00','23:00',60,30)");

        // Персонажи + галерея (плейсхолдеры picsum; в проде Uploader делает srcset 400/800/1600) + услуги
        $chars = [
            ['Мишка Тедди','teddy',"Плюшевый любимец детей.\nВесёлые игры, флешмобы, фотосессии.","Отлично подходит для детских дней рождения в Саратове и Энгельсе.",4500,40],
            ['Зайка Сюрприз','zayka',"Озорная зайчиха с шариками.\nМыльное шоу в подарок!","Шоу-программа с интерактивом до 40 минут.",4000,40],
            ['Единорожка Люси','unicorn',"Сияющая единорожка — мечта каждой девочки.","Программа с аниматором и шоу мыльных пузырей.",5000,30],
            ['Тигр Рыжик','tiger',"Дерзкий и обаятельный хищник для активных праздников.","Флешмобы, конкурсы, фотозона.",4500,40],
            ['Клоун Пиф-Паф','clown',"Классический клоун-аниматор с фокусами и шутками.","Ведёт программу полностью или работает в паре.",4000,60],
            ['Щеня Поляна','puppy',"Любимец из мультсериала — энергия и доброта.","Идеален для малышей 2–7 лет.",4200,30],
        ];
        $ci = $db->prepare("INSERT INTO characters (name,slug,description,seo_description,price_from,duration_min,sort_order) VALUES (?,?,?,?,?,?,?)");
        $im = $db->prepare("INSERT INTO character_images (character_id,path,alt) VALUES (?,?,?)");
        $sv = $db->prepare("INSERT INTO character_services (character_id,title,description,duration_min,price) VALUES (?,?,?,?,?)");
        $services = [['Открытие магазина','Встреча гостей, приветственный перформанс',20,2500],
                     ['Детский день рождения','Игры, конкурсы, вынос торта',40,4500],
                     ['Выписка из роддома','Встреча мамы с малышом',30,3500]];
        foreach ($chars as $i => $c) {
            $ci->execute([$c[0],$c[1],$c[2],$c[3],$c[4],$c[5],$i+1]);
            $cid = (int)$db->lastInsertId();
            for ($k = 0; $k < 3; $k++) $im->execute([$cid, "https://picsum.photos/seed/{$c[1]}-$k/800/600", $c[0]]);
            foreach ($services as $s) $sv->execute(array_merge([$cid], $s));
        }

        // Кросс-товары: компактные карточки (фото, наименование, цена, описание)
        $cp = $db->prepare("INSERT INTO cross_products (name,description,price,photo_path) VALUES (?,?,?,?)");
        $cross = [['Воздушные шары','Букет из 12 шаров с гелием',900],['Торт «Праздничный»','Заказной торт, 1 кг',1500],
                 ['Пиньята с конфетами','Разбивается под счёт «три-четыре»',1200],['Мыльное шоу','Оборудование + мастер',2000],
                 ['Фотозона «Радуга»','Гирлянда + фон',1800],['Свечи-цифры','Для торта, любая цифра',300]];
        foreach ($cross as $j => $c) $cp->execute([$c[0],$c[1],$c[2],'https://picsum.photos/seed/x'.$j.'/300/300']);

        // Настройки сайта (CMS)
        $st = $db->prepare("INSERT INTO settings (key,value) VALUES (?,?)");
        foreach ([
            ['site_name','Ростовые куклы — Саратов / Энгельс'],
            ['brand_color','#800080'],
            ['hero_title','Подарим ребёнку праздник, который запомнится навсегда!'],
            ['hero_subtitle','Ростовые куклы, шоу-программы и аниматоры в Саратове и Энгельсе. Приедем в детский сад, школу, ТЦ или на турбазу.'],
            ['hero_image','https://picsum.photos/seed/hero-rk/900/900'],
            ['hero_bg','https://picsum.photos/seed/bg-rk/1920/1080?grayscale'],
            ['logo','https://picsum.photos/seed/logo-rk/200/200?grayscale'],
            ['favicon','https://picsum.photos/seed/icon-rk/64/64'],
            ['subscribe_image','https://picsum.photos/seed/subs-rk/700/800'],
            ['seo_title','Ростовые куклы в Саратове и Энгельсе — заказать шоу-программу'],
            ['seo_description','Аренда ростовых кукол, аниматоры, шоу-программы для детей в Саратове и Энгельсе. Предоплата 50%, выезд с 6:00 до 23:00.'],
            ['footer_disclaimer','Сайт носит исключительно информационный характер и не является публичной офертой. Подробная информация о стоимости услуг и товаров, их наличии, видах и характеристиках вы можете узнать в нашем отделе продаж.'],
            ['tg_bot_token','DEMO_TOKEN'],['tg_chat_id','0'],['notify_email','info@rk4me.ru'],
        ] as [$k,$v]) $st->execute([$k,$v]);

        // Контакты: единый список (тип «телефон»/«ссылка», иконка — внешний URL)
        $ct = $db->prepare("INSERT INTO contacts (label,type,url,value,icon_url,sort_order) VALUES (?,?,?,?,?,?)");
        foreach ([
            ['Телефон','phone','tel:+79271234567','+7 (927) 123-45-67','https://cdn-icons-png.flaticon.com/512/724/724664.png'],
            ['WhatsApp','link','https://wa.me/79271234567','Написать в WhatsApp','https://cdn-icons-png.flaticon.com/512/174/174858.png'],
            ['Telegram','link','https://t.me/rk_saratov','Написать в Telegram','https://cdn-icons-png.flaticon.com/512/2111/2111646.png'],
            ['Макс','link','https://max.ru/rk_saratov','Написать в MAX','https://cdn-icons-png.flaticon.com/512/1077/1077114.png'],
        ] as $i=>$c) $ct->execute(array_merge($c,[$i+1]));

        // Условия (два блока) и способы оплаты (структурированные, с иконками)
        $cd = $db->prepare("INSERT INTO conditions (group_key,title,body,icon,sort_order) VALUES (?,?,?,?,?)");
        foreach ([
            ['delivery','Доставка по Саратову и Энгельсу','По городу — бесплатно при заказе программы от 40 минут. Ранний выезд (до 8:00) и вечерний (после 21:00) — +500 ₽.','truck',1],
            ['delivery','Выезд за город','Турбазы, базы отдыха, частные дома — расчёт индивидуально (от 30 ₽/км). Укажите название базы и номер беседки в заявке.','map',2],
            ['worktime','Режим работы','Принимаем заказы ежедневно с 06:00 до 23:00. Между мероприятиями — технологический перерыв 30 минут (буфер).','clock',1],
            ['worktime','Продолжительность программ','Стандартные блоки: 20 / 30 / 40 / 60 минут. Продлить визит можно на месте, если позволяет график следующего заказа.','timer',2],
        ] as $c) $cd->execute($c);
        $pm = $db->prepare("INSERT INTO payment_methods (title,body,icon,note) VALUES (?,?,?,?)");
        foreach ([
            ['Оплата на карту Сбербанк','Реквизиты карты менеджер отправляет в WhatsApp, Telegram или MAX после подтверждения заявки.','card','Заказ считается принятым только после внесения предоплаты (50%) и подтверждения менеджером.'],
            ['Безналичный расчёт для юр. лиц','Работаем с ИП и организациями по договору. Счёт и закрывающие документы — по запросу.','bank','Email для заявок от юр. лиц: dmitriirusakov-sar@mail.ru'],
        ] as $p) $pm->execute($p);

        // «Как заказать» — редактируемые шаги с иконками
        $hs = $db->prepare("INSERT INTO how_to_order (step,title,body,icon) VALUES (?,?,?,?)");
        foreach ([
            [1,'Оставьте заявку','Заполните форму на сайте или позвоните — менеджер ответит в течение 15 минут.','form'],
            [2,'Выберите персонажа','Подберём куклу под возраст детей и формат праздника, рассчитаем услуги и кросс-товары.','mask'],
            [3,'Внесите предоплату','50% на карту Сбербанк или по счёту — дата и время закрепляются за вами.','ruble'],
            [4,'Встречайте праздник','Кукла приедет за 10 минут до начала. Полная оплата — по завершении мероприятия.','party'],
        ] as $s) $hs->execute($s);

        // Истории (прямоугольные, как в Instagram), галерея, отзывы
        $so = $db->prepare("INSERT INTO stories (media_url,caption,view_seconds) VALUES (?,?,?)");
        foreach ([['https://picsum.photos/seed/st1/450/800','День рождения в Парке Липки'],['https://picsum.photos/seed/st2/450/800','Выписка из роддома'],['https://picsum.photos/seed/st3/450/800','Флешмоб в ТЦ']] as $s) $so->execute([$s[0],$s[1],10]);
        $ga = $db->prepare("INSERT INTO gallery (image_url,caption) VALUES (?,?)");
        for ($g=1;$g<=8;$g++) $ga->execute(["https://picsum.photos/seed/g$g/600/450","Праздник №$g"]);
        $rv = $db->prepare("INSERT INTO reviews (name,text,photo_url,rating) VALUES (?,?,?,?)");
        foreach ([
            ['Екатерина','Заказывали Мишку на 5 лет сыну — ребёнок в восторге! Кукла чистая, аниматор внимательный.','https://picsum.photos/seed/r1/100/100',5],
            ['Ирина','Встречали мамочку с малышкой из роддома. Все медсёстры плакали от счастья.','https://picsum.photos/seed/r2/100/100',5],
            ['Дмитрий','Работаем второй год как юр. лицо — закрывающие присылают вовремя, дети довольны.','',5],
        ] as $r) $rv->execute($r);

        // Юридические страницы
        $lp = $db->prepare("INSERT INTO legal_pages (slug,title,body) VALUES (?,?,?)");
        $lp->execute(['privacy','Согласие на обработку персональных данных','Настоящим я даю согласие на обработку моих персональных данных в соответствии с ФЗ-152 «О персональных данных». Оставляя заявку на сайте, вы соглашаетесь с обработкой имени, телефона и адреса исключительно в целях оказания услуг.']);
        $lp->execute(['agreement','Пользовательское соглашение',"1. Сайт предоставляет информацию об услугах агентства праздников.\n2. Заказ принимается после предоплаты 50% и подтверждения менеджером.\n3. Отмена более чем за 24 часа — предоплата возвращается полностью."]);

        // Демо-клиенты и заявки (для дашборда, канбана, календаря)
        $cl = $db->prepare("INSERT INTO clients (name,phone,email,pd_consent) VALUES (?,?,?,?)");
        foreach ([['Анна Смирнова','+79271112233','anna@mail.ru',1],['Пётр Иванов','+79625554411','',1],
                  ['Мария Кузнецова','+79057778899','maria@bk.ru',1],['ООО «Улыбка»','+78452000100','buh@ulybka.ru',0]] as $c) $cl->execute($c);
        $today = date('Y-m-d'); $tomorrow = date('Y-m-d', strtotime('+1 day'));
        $od = $db->prepare("INSERT INTO orders (client_id,character_id,customer_name,event_date,event_time,address,songs,comment,total_amount,prepayment,status,pd_consent,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,datetime('now','localtime','-' || ? || ' hours'))");
        $oi = $db->prepare("INSERT INTO order_items (order_id,product_id,product_name,unit_price,qty) SELECT ?,id,name,price,? FROM cross_products WHERE id=?");
        $orders = [
          [1,1,'$today','12:00','Детский сад №14, пр. Кирова','Малышка, Крышки-пожки, Весёлый одуванчик','Юбилей Саши',6000,0,'new',[1=>2,3=>1],12],
          [2,2,'$today','16:00','Турбаза «Чапчелка», беседка 5','','Корпоратив',9000,4500,'prepayment',[2=>1],30],
          [3,3,'$tomorrow','10:00','ул. Жемчужная 22, кв. 5','Единорог','День рождения Ани, 2 песни',7500,3750,'confirmed',[4=>1,6=>2],5],
          [4,4,'$tomorrow','18:00','ТЦ «Хэппи Молл», 3 этаж','','Флешмоб для отдела продаж',12000,0,'in_work',[1=>3,2=>1],50],
          [1,5,'$today','19:00','Энгельс, пл. Ленина 1','','',8000,8000,'completed',[],70],
        ];
        foreach ($orders as $o) {
            $od->execute([$o[0],$o[1],"Клиент #{$o[0]}",$o[2],$o[3],$o[4],$o[5],$o[6],$o[7],$o[8],$o[9],1,$o[11]]);
            $oid = (int)$db->lastInsertId();
            foreach ($o[10] as $pid=>$qty) $oi->execute([$oid,$qty,$pid]);
        }
    }
}
require_once __DIR__ . '/helpers.php';
