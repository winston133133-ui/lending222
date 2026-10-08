<?php require __DIR__ . '/_head.php'; /** Подписки: журнал подписок на Telegram + картинка блока подписки */ ?>
<div class="grid lg:grid-cols-3 gap-5 items-start">
  <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-x-auto"><table class="w-full text-sm">
    <thead><tr class="text-left text-xs uppercase text-slate-500 border-b"><th class="p-3">Дата</th><th class="p-3">Telegram ID</th><th class="p-3">@username</th><th class="p-3">Источник</th><th></th></tr></thead>
    <tbody><?php foreach ($items as $s): ?>
      <tr class="border-b"><td class="p-3"><?= e($s['created_at']) ?></td><td class="p-3 font-mono"><?= e($s['tg_user_id']) ?></td>
        <td class="p-3"><?= e($s['username'] ? '@'.$s['username'] : '—') ?></td><td class="p-3"><?= e($s['source']) ?></td>
        <td class="p-3 text-right"><form method="post" action="/admin/settings/subscriptions/delete/<?= (int)$s['id'] ?>" onsubmit="return confirm('Удалить запись?')">
          <?= CSRF::field() ?><input type="hidden" name="delete_sub" value="<?= (int)$s['id'] ?>"><button class="text-xs text-red-600 underline">удалить</button></form></td></tr>
    <?php endforeach; if (!$items): ?><tr><td colspan="5" class="p-6 text-center text-slate-500">Подписок пока нет (журнал наполняется виджетом сайта)</td></tr><?php endif; ?></tbody></table></div>
  <form method="post" action="/admin/settings/subscriptions" enctype="multipart/form-data" class="bg-white rounded-2xl shadow-sm p-5 space-y-3 text-sm h-fit">
    <h3 class="font-bold">Картинка блока подписки</h3><?= CSRF::field() ?>
    <?php if ($img): ?><img src="<?= e($img) ?>" class="rounded-xl max-h-40 object-cover" alt=""><?php endif; ?>
    <label class="block">Загрузить<input type="file" name="image" accept="image/*" class="mt-1 text-xs"></label>
    <button class="w-full bg-purple-700 text-white rounded-lg py-2 font-semibold">Сохранить</button>
  </form>
</div>
