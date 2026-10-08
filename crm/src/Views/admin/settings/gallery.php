<?php require __DIR__ . '/_table.php'; /** Галерея: фото + подпись */
$editing = null; if (!empty($_GET['edit'])) $editing = DB::row('SELECT * FROM gallery WHERE id=?', [(int)$_GET['edit']]);
settings_table('gallery', $items, [['image_url','Фото','img'],['caption','Подпись','text']], 'photo', $editing);
