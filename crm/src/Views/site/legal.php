<?php
/** Юридическая страница (согласие на ПД / пользовательское соглашение) */
$s = $set;
?>
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($row['title'] ?? 'Документ') ?> — <?= e($s['site_name']) ?></title>
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={theme:{extend:{colors:{brand:{500:'#800080',600:'#730073',700:'#5c005c',900:'#330033'}}}}};</script>
</head>
<body class="bg-slate-50 text-slate-800">
<header class="bg-brand-700 text-white">
  <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
    <a href="/" class="font-black">🎭 <?= e($s['site_name']) ?></a>
    <a href="/" class="text-sm underline">На главную</a>
  </div>
</header>
<main class="max-w-4xl mx-auto px-4 py-10">
  <h1 class="text-2xl md:text-3xl font-black text-brand-700"><?= e($row['title'] ?? '') ?></h1>
  <article class="prose prose-slate max-w-none mt-6 bg-white rounded-2xl shadow-sm p-6 md:p-8 leading-relaxed whitespace-pre-line"><?= e($row['body'] ?? '') ?></article>
</main>
<footer class="text-center text-xs text-slate-400 py-6">© <?= date('Y') ?> «<?= e($s['site_name']) ?>»</footer>
</body>
</html>
