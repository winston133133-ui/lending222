<?php require __DIR__ . '/_table.php'; /** Отзывы: имя, текст, оценка, фото */
$editing = null; if (!empty($_GET['edit'])) $editing = DB::row('SELECT * FROM reviews WHERE id=?', [(int)$_GET['edit']]);
settings_table('reviews', $items, [['name','Имя','text'],['text','Текст отзыва','textarea'],['rating','Оценка 1–5','num'],['photo_path','Фото','img']], 'photo', $editing);
