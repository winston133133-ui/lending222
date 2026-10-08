<?php
/** Дженерик-рендер вкладки «таблица + форма» (DRY для cross/stories/gallery/reviews) */
function settings_table(string $tab, array $rows, array $cols, ?string $uploadField = null, ?array $editing = null): void {
    require __DIR__ . '/_head.php'; ?>
<div class="grid lg:grid-cols-3 gap-5 items-start">
  <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-x-auto"><table class="w-full text-sm">
    <thead><tr class="text-left text-xs uppercase text-slate-500 border-b"><?php foreach ($cols as $c): ?><th class="p-3"><?= e($c[1]) ?></th><?php endforeach; ?><th></th></tr></thead>
    <tbody><?php foreach ($rows as $r): ?>
      <tr class="border-b hover:bg-purple-50/40">
        <?php foreach ($cols as [$key, $label, $type]): ?>
          <td class="p-3"><?= match ($type) {
              'money' => money((int)$r[$key]), 'img' => $r[$key] ? '<img src="' . e($r[$key]) . '" class="h-10 rounded-lg object-cover" alt="">' : '—',
              'num' => (string)(int)$r[$key], default => mb_strimwidth((string)($r[$key] ?? ''), 0, 60, '…') ?: '—' } ?></td>
        <?php endforeach; ?>
        <td class="p-3 text-right whitespace-nowrap">
          <a class="text-xs underline" href="/admin/settings/<?= e($tab) ?>?edit=<?= (int)$r['id'] ?>">изм.</a>
          <form method="post" action="/admin/settings/<?= e($tab) ?>/delete/<?= (int)$r['id'] ?>" class="inline" onsubmit="return confirm('Удалить запись?')">
            <?= CSRF::field() ?><button class="text-xs text-red-600 underline">удалить</button></form></td></tr>
    <?php endforeach; if (!$rows): ?><tr><td colspan="<?= count($cols)+1 ?>" class="p-6 text-center text-slate-500">Список пуст</td></tr><?php endif; ?></tbody></table></div>
  <form method="post" action="/admin/settings/<?= e($tab) ?>" enctype="multipart/form-data" class="bg-white rounded-2xl shadow-sm p-5 space-y-3 text-sm h-fit">
    <h3 class="font-bold"><?= $editing ? 'Редактировать' : 'Добавить' ?></h3>
    <?= CSRF::field() ?><input type="hidden" name="id" value="<?= (int)($editing['id'] ?? 0) ?>">
    <?php foreach ($cols as [$key, $label, $type]): if ($type === 'img') continue; ?>
      <label class="block"><?= e($label) ?>
        <?php if ($type === 'textarea'): ?><textarea name="<?= e($key) ?>" rows="3" class="mt-1 w-full rounded-lg border px-3 py-2"><?= e((string)($editing[$key] ?? '')) ?></textarea>
        <?php elseif ($type === 'money' || $type === 'num'): ?><input type="number" min="0" name="<?= e($key) ?>" value="<?= (int)($editing[$key] ?? ($type==='money'?1500:1)) ?>" class="mt-1 w-full rounded-lg border px-3 py-2">
        <?php else: ?><input name="<?= e($key) ?>" value="<?= e((string)($editing[$key] ?? '')) ?>" class="mt-1 w-full rounded-lg border px-3 py-2"><?php endif; ?></label>
    <?php endforeach; ?>
    <?php if ($uploadField): ?><label class="block">Загрузить изображение<input type="file" name="<?= e($uploadField) ?>" accept="image/*" class="mt-1 text-xs"></label><?php endif; ?>
    <button class="w-full bg-purple-700 text-white rounded-lg py-2 font-semibold">Сохранить</button>
  </form>
</div>
<?php }
