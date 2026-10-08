<?php require __DIR__ . '/_head.php'; /** Персонажи: карусель на сайт + характеристики + услуги (длительность брони) */ ?>
<div class="grid lg:grid-cols-5 gap-5 items-start">
  <div class="lg:col-span-3 space-y-3">
    <?php foreach ($chars as $c): $feats = DB::all('SELECT * FROM character_features WHERE character_id=?', [(int)$c['id']]); $svs = DB::all('SELECT * FROM character_services WHERE character_id=?', [(int)$c['id']]); ?>
    <details class="bg-white rounded-2xl shadow-sm p-4 <?= (int)$c['is_active']?:'opacity-60' ?>" x-data>
      <summary class="flex items-center gap-3 cursor-pointer list-none">
        <img src="<?= e((DB::row('SELECT path FROM character_images WHERE character_id=?',[(int)$c['id']])['path']) ?? '') ?>" class="w-12 h-12 rounded-xl object-cover bg-purple-100" alt="">
        <span class="font-bold flex-1"><?= e($c['name']) ?> <span class="text-xs font-normal text-slate-400">#<?= (int)$c['id'] ?> · от <?= money((int)$c['price_from']) ?> · <?= (int)$c['duration_min'] ?> мин</span></span>
        <span class="text-xs"><?= (int)$c['is_active'] ? '🟢 активен' : '⚪ скрыт' ?></span></summary>
      <form method="post" action="/admin/settings/characters" enctype="multipart/form-data" class="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
        <?= CSRF::field() ?><input type="hidden" name="id" value="<?= (int)$c['id'] ?>">
        <label>Имя<input required name="name" value="<?= e($c['name']) ?>" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
        <label>Цена «от», ₽<input type="number" name="price_from" value="<?= (int)$c['price_from'] ?>" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
        <?php wysiwyg('description', (string)$c['description']); ?>
        <label class="sm:col-span-2">SEO-описание<textarea name="seo_description" rows="2" class="mt-1 w-full rounded-lg border px-3 py-2"><?= e($c['seo_description']) ?></textarea></label>
        <label class="sm:col-span-2">Характеристики (по одной в строке, формат «Рост = 175 см»)<textarea name="features" rows="4" class="mt-1 w-full rounded-lg border px-3 py-2 font-mono text-xs"><?php foreach ($feats as $f) echo e($f['feature_key']) . ' = ' . e($f['feature_value']) . "\n"; ?></textarea></label>
        <fieldset class="sm:col-span-2 border rounded-xl p-3"><legend class="px-2 text-xs font-bold uppercase text-slate-500">Услуги программы (название — длительность — цена)</legend>
          <div class="space-y-2"><?php for ($i = 0; $i < max(3, count($svs) + 1); $i++): $sv = $svs[$i] ?? null; ?>
            <div class="grid grid-cols-[1fr_90px_90px] gap-2">
              <input name="services[<?= $i ?>][title]" placeholder="Название программы" value="<?= e($sv['title'] ?? '') ?>" class="rounded-lg border px-2 py-1.5">
              <input type="number" min="10" name="services[<?= $i ?>][duration_min]" title="Длительность, мин" value="<?= (int)($sv['duration_min'] ?? 30) ?>" class="rounded-lg border px-2 py-1.5">
              <input type="number" min="0" name="services[<?= $i ?>][price]" title="Цена, ₽" value="<?= (int)($sv['price'] ?? 0) ?>" class="rounded-lg border px-2 py-1.5"></div>
          <?php endfor; ?>
            <p class="text-xs text-slate-400">Клиент не сможет забронировать время больше длительности выбранной программы.</p></div></fieldset>
        <label class="sm:col-span-2">Дополнительные фото (галерея персонажа)<input type="file" name="images[]" multiple accept="image/*" class="mt-1 text-xs"></label>
        <label>Длительность по умолчанию, мин<input type="number" name="duration_min" value="<?= (int)$c['duration_min'] ?>" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
        <label>Порядок в карусели<input type="number" name="sort_order" value="<?= (int)$c['sort_order'] ?>" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
        <label class="flex items-center gap-2"><input type="checkbox" name="is_active" value="1" <?= (int)$c['is_active']?'checked':'' ?>> Показывать на сайте</label>
        <div class="flex gap-2 justify-end items-end"><button class="bg-purple-700 text-white rounded-lg px-4 py-2">Сохранить</button>
          <button formaction="/admin/settings/characters/delete/<?= (int)$c['id'] ?>" formnovalidate onclick="return confirm('Удалить персонажа?')" class="text-red-600 text-sm underline">удалить</button></div>
      </form>
    </details>
    <?php endforeach; ?>
  </div>
  <form method="post" action="/admin/settings/characters" enctype="multipart/form-data" class="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5 space-y-3 text-sm h-fit sticky top-20">
    <h3 class="font-bold">Новый персонаж</h3><?= CSRF::field() ?><input type="hidden" name="id" value="0">
    <label>Имя*<input required name="name" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
    <label>Цена «от», ₽<input type="number" name="price_from" value="4500" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
    <?php wysiwyg('description', ''); ?>
    <label class="block">Фото<input type="file" name="images[]" multiple accept="image/*" class="mt-1 text-xs"></label>
    <label class="block">Характеристики (строк «Ключ = Значение»)<textarea name="features" rows="3" class="mt-1 w-full rounded-lg border px-3 py-2 font-mono text-xs" placeholder="Рост = 175 см"></textarea></label>
    <button class="w-full bg-fuchsia-600 text-white rounded-lg py-2 font-semibold">Добавить</button>
  </form>
</div>
