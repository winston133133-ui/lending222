<?php
/** Шапка админки: сайдбар (меню строго по ТЗ) + topbar с realtime-колокольчиком */
$navItems = [
    ['dashboard','📊','Дашборд'], ['orders','📋','Заявки'], ['clients','👥','Клиенты'], ['calendar','🗓️','Календарь'],
];
if (Auth::isAdmin()) {
    foreach (SettingsController::TABS as $tab => $label) $navItems[] = ['settings/' . $tab, '', $label];
    $navItems[] = ['users', '🔑', 'Пользователи'];
}
$isActive = fn(string $key) => str_replace('/admin/', '', $GLOBALS['active'] ?? '') === $key || ($key === 'settings/characters' && false);
?><!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title><?= e($title) ?> — CRM</title>
<meta name="csrf-token" content="<?= e(CSRF::token()) ?>">
<script src="https://cdn.tailwindcss.com"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
<link rel="icon" href="<?= e(setting('favicon')) ?>"></head>
<body class="bg-slate-100 font-sans text-slate-800" x-data="crmShell()">
<div class="flex min-h-screen">
  <aside class="w-60 shrink-0 bg-purple-950 text-purple-100 flex flex-col">
    <a href="/admin" class="px-4 py-4 font-black text-white border-b border-purple-800"><?= e(setting('site_name','CRM')) ?></a>
    <nav class="flex-1 overflow-y-auto py-2 text-sm">
      <?php foreach ($navItems as [$key,$icon,$label]): $k = explode('/', $key)[0]; if (!Auth::canView($k)) continue; ?>
        <a href="/admin/<?= e($key) ?>" class="flex items-center gap-2 px-4 py-2 hover:bg-purple-800 <?= ($section === explode('/',$key)[0] && ($section !== 'settings' || ($key !== '' && basename($key) === ($tab ?? '')))) || $section === $k ? 'bg-purple-800 font-semibold text-white' : '' ?>">
          <span><?= $icon ?: '⚙️' ?></span><span><?= e($label) ?></span></a>
      <?php endforeach; ?>
    </nav>
    <form method="post" action="/admin/logout" class="p-3 border-t border-purple-800">
      <?= CSRF::field() ?><div class="text-xs text-purple-300 px-1 pb-2"><?= e($_SESSION['name'] ?? '') ?> (<?= Auth::isAdmin() ? 'администратор' : 'менеджер' ?>)</div>
      <button class="w-full text-left text-sm bg-purple-800 hover:bg-purple-700 rounded-lg px-3 py-2">Выйти</button>
    </form>
  </aside>
  <main class="flex-1 min-w-0">
    <header class="bg-white border-b px-5 h-14 flex items-center gap-4 sticky top-0 z-30">
      <h1 class="font-bold text-lg"><?= e($title) ?></h1>
      <button class="ml-auto relative text-2xl" @click="openNotifs" title="Уведомления о новых заявках">
        🔔<span x-show="unread>0" x-text="unread" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 grid place-items-center"></span></button>
    </header>
    <!-- Toast-уведомления (realtime long-polling) -->
    <div class="fixed right-4 top-16 z-50 space-y-2">
      <template x-for="n in toasts" :key="n.id">
        <div class="bg-purple-800 text-white shadow-lg rounded-xl px-4 py-3 text-sm max-w-xs" x-transition>
          <b x-text="n.title"></b><div x-text="n.text" class="text-purple-100 mt-0.5"></div>
          <a :href="n.link" class="underline text-xs">Открыть заявку →</a></div></template>
    </div>
    <?php if (!empty($flashOk)): ?><div class="mx-5 mt-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-2 text-sm"><?= e($flashOk) ?></div><?php endif; ?>
    <?php if (!empty($flashErr)): ?><div class="mx-5 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2 text-sm"><?= e($flashErr) ?></div><?php endif; ?>
    <div class="p-5">
