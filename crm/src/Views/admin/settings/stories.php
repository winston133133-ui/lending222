<?php require __DIR__ . '/_table.php'; /** Истории: фото/видео + подпись */
$editing = null; if (!empty($_GET['edit'])) $editing = DB::row('SELECT * FROM stories WHERE id=?', [(int)$_GET['edit']]);
settings_table('stories', $items, [['media_url','Медиа','img'],['caption','Подпись','text'],['media_type','Тип (photo/video)','text']], 'photo', $editing);
