<?php require __DIR__ . '/_table.php'; /** Кросс-товары: название+описание+цена */
$editing = null; if (!empty($_GET['edit'])) $editing = DB::row('SELECT * FROM cross_products WHERE id=?', [(int)$_GET['edit']]);
settings_table('cross', $items, [['name','Название','text'],['description','Описание','textarea'],['price','Цена, ₽','money']], null, $editing);
