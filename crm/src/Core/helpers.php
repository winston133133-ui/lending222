<?php
// Общие хелперы: экранирование (XSS), форматирование, URL-чистые слаги
function e(?string $s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function money(float|int $v): string { return number_format((float)$v, 0, ',', ' ') . ' ₽'; }
function slugify(string $s): string {
    $map = ['а'=>'a','б'=>'b','в'=>'v','г'=>'g','д'=>'d','е'=>'e','ё'=>'e','ж'=>'zh','з'=>'z','и'=>'i','й'=>'y','к'=>'k','л'=>'l','м'=>'m','н'=>'n','о'=>'o','п'=>'p','р'=>'r','с'=>'s','т'=>'t','у'=>'u','ф'=>'f','х'=>'h','ц'=>'ts','ч'=>'ch','ш'=>'sh','щ'=>'sch','ъ'=>'','ы'=>'i','ь'=>'','э'=>'e','ю'=>'yu','я'=>'ya'];
    $s = mb_strtolower($s, 'UTF-8');
    foreach ($map as $c=>$t) $s = str_replace($c, $t, $s);
    $s = preg_replace('/[^a-z0-9]+/', '-', $s);
    return trim($s, '-') ?: 'item';
}
function fmt_date(string $dt): string { return date('d.m.Y H:i', strtotime($dt)); }

/** Клиентский формат телефона: +7 (927) 123-45-67 (для кликабельных tel:-ссылок в админке и на сайте) */
function phone_pretty(?string $p): string {
    $d = preg_replace('/\D/', '', (string)$p);
    if (strlen($d) === 11 && ($d[0] === '7' || $d[0] === '8')) $d = '7' . substr($d, 1);
    elseif (strlen($d) === 10) $d = '7' . $d;
    else return (string)$p;
    return '+'.substr($d,0,1).' ('.substr($d,1,3).') '.substr($d,4,3).'-'.substr($d,7,2).'-'.substr($d,9,2);
}

/** Значение настройки сайта с дефолтом */
function setting(string $key, string $default = ''): string {
    $v = DB::row('SELECT value FROM settings WHERE key = ?', [$key])['value'] ?? null;
    return $v !== null && $v !== '' ? $v : $default;
}
/** Контент-safe вывод HTML из WYSIWYG (белый список тегов) */
function clean_html(?string $html): string {
    $allowed = '<b><strong><i><em><u><br><p><ul><ol><li><a><h3><h4><span>';
    return strip_tags((string)$html, $allowed);
}

/** Единая точка рендера страниц админки: layout + view + flash */
function admin_render(string $view, string $title, string $section, array $data = []): void
{
    Auth::requireLogin();
    if (!Auth::canView($section)) { http_response_code(403); echo '<h1 style="font-family:system-ui;padding:40px">Нет доступа к разделу «' . e($section) . '». Раздел доступен только администратору.</h1>'; return; }
    extract($data);
    $flashOk = $_SESSION['flash_ok'] ?? null; $flashErr = $_SESSION['flash_error'] ?? null;
    unset($_SESSION['flash_ok'], $_SESSION['flash_error']);
    require dirname(__DIR__) . '/Views/admin/layout_top.php';
    require dirname(__DIR__) . "/Views/admin/$view.php";
    require dirname(__DIR__) . '/Views/admin/layout_bottom.php';
}
