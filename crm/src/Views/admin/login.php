<?php /** Страница входа в CRM */ ?>
<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Вход — CRM</title><script src="https://cdn.tailwindcss.com"></script></head>
<body class="min-h-screen grid place-items-center bg-gradient-to-br from-purple-900 via-fuchsia-700 to-purple-500 font-sans">
  <form method="post" class="bg-white rounded-2xl shadow-xl p-8 w-[min(92vw,380px)] space-y-4">
    <h1 class="text-2xl font-black text-purple-800">Вход в CRM</h1>
    <?php if (!empty($error)): ?><p class="text-sm text-red-600 bg-red-50 rounded-lg p-2"><?= e($error) ?></p><?php endif; ?>
    <label class="block text-sm">Email
      <input name="email" type="email" required class="mt-1 w-full rounded-lg border px-3 py-2" value="<?= e($_POST['email'] ?? '') ?>"></label>
    <label class="block text-sm">Пароль
      <input name="password" type="password" required class="mt-1 w-full rounded-lg border px-3 py-2"></label>
    <?= CSRF::field() ?>
    <button class="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2.5 rounded-lg">Войти</button>
    <a href="/" class="block text-center text-sm text-purple-700 hover:underline">← На сайт</a>
  </form>
</body></html>
