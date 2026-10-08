<?php /** Заявки: канбан (drag&drop статусов) + таблица с остатками; поиск; модалка ручной заявки */
$colors=['new'=>'border-t-blue-500','in_work'=>'border-t-amber-500','prepayment'=>'border-t-purple-500','confirmed'=>'border-t-emerald-500','completed'=>'border-t-slate-500','cancelled'=>'border-t-red-400'];
$labels=$statuses; ?>
<div class="flex flex-wrap items-center gap-3 mb-4">
  <form class="flex gap-2" method="get">
    <input type="hidden" name="view" value="<?= e($mode) ?>">
    <input name="q" value="<?= e($q) ?>" placeholder="Поиск: имя / телефон" class="rounded-lg border px-3 py-1.5 text-sm w-56">
    <select name="status" class="rounded-lg border px-2 py-1.5 text-sm"><option value="">Все статусы</option>
      <?php foreach ($labels as $k=>$l): ?><option value="<?= e($k) ?>" <?= $status===$k?'selected':'' ?>><?= e($l) ?></option><?php endforeach; ?></select>
    <button class="bg-purple-700 text-white rounded-lg px-3 py-1.5 text-sm">Найти</button></form>
  <div class="ml-auto flex gap-1 bg-white rounded-lg p-1 text-sm shadow-sm">
    <a href="?view=kanban<?= $q?("&q=".urlencode($q)):'' ?>" class="px-3 py-1 rounded <?= $mode==='kanban'?'bg-purple-700 text-white':'' ?>">Канбан</a>
    <a href="?view=table<?= $q?("&q=".urlencode($q)):'' ?>" class="px-3 py-1 rounded <?= $mode==='table'?'bg-purple-700 text-white':'' ?>">Таблица</a></div>
  <button @click="$dispatch('open-new-order')" class="bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg px-4 py-1.5 text-sm font-semibold">+ Новая заявка</button>
</div>

<?php if ($mode === 'kanban'): ?>
<div x-data="kanban()" class="grid md:grid-cols-3 xl:grid-cols-6 gap-3 items-start">
  <?php foreach ($labels as $st => $label): $list = array_filter($orders, fn($o) => $o['status'] === $st); ?>
    <div class="bg-slate-200/60 rounded-xl p-2 min-h-[120px]" :class="dragOver==='<?= e($st) ?>' && 'ring-2 ring-purple-500'"
         @dragover.prevent="dragOver='<?= e($st) ?>'" @dragleave="dragOver=''" @drop.prevent="move('<?= e($st) ?>', $event)">
      <p class="text-xs font-bold uppercase text-slate-500 px-1 pb-2"><?= e($label) ?> (<?= count($list) ?>)</p>
      <?php foreach ($list as $o): ?>
        <a draggable="true" @dragstart="drag(<?= (int)$o['id'] ?>)" href="/admin/orders/<?= (int)$o['id'] ?>"
           class="block bg-white rounded-lg shadow-sm border-t-4 <?= $colors[$o['status']] ?> p-3 mb-2 text-sm cursor-grab">
          <div class="flex justify-between"><b>#<?= (int)$o['id'] ?></b><span class="text-slate-500"><?= e($o['event_date']) ?> <?= e(substr((string)$o['event_time'],0,5)) ?></span></div>
          <div class="mt-1"><?= e($o['client_name'] ?: $o['customer_name']) ?></div>
          <a href="tel:<?= e($o['phone'] ?? '') ?>" onclick="event.stopPropagation()" class="text-purple-700 hover:underline"><?= e($o['phone'] ?? '') ?></a>
          <div class="mt-1 flex justify-between text-xs"><span><?= e($o['character_name'] ?? '') ?></span>
            <span class="<?= (int)$o['balance']>0?'text-red-600 font-semibold':'text-emerald-600' ?>">остаток <?= money((int)$o['balance']) ?></span></div>
        </a>
      <?php endforeach; ?>
    </div>
  <?php endforeach; ?>
</div>
<script>
// Drag&drop канбана: бросок карточки в колонку -> POST смены статуса без перезагрузки
function kanban(){ return { dragId:null, dragOver:'',
  drag(id){ this.dragId=id; },
  async move(status, ev){ ev.preventDefault(); if(!this.dragId||!status) return;
    const card=document.activeElement; await post(`/admin/orders/${this.dragId}/status`,{status}); this.dragId=null; location.reload(); } }; }
</script>
<?php else: ?>
<div class="bg-white rounded-2xl shadow-sm overflow-x-auto">
<table class="w-full text-sm">
<thead><tr class="text-left text-xs uppercase text-slate-500 border-b">
  <th class="p-3">№</th><th class="p-3">Статус</th><th class="p-3">Клиент</th><th class="p-3">Телефон</th><th class="p-3">Персонаж</th>
  <th class="p-3">Дата/время</th><th class="p-3 text-right">Сумма</th><th class="p-3 text-right">Предоплата</th><th class="p-3 text-right">Остаток</th><th class="p-3"></th></tr></thead>
<tbody>
<?php foreach ($orders as $o): ?>
<tr class="border-b hover:bg-purple-50/40">
  <td class="p-3"><a class="font-mono text-purple-700 hover:underline" href="/admin/orders/<?= (int)$o['id'] ?>">#<?= (int)$o['id'] ?></a></td>
  <td class="p-3"><form method="post" action="/admin/orders/<?= (int)$o['id'] ?>/status" class="flex gap-1">
    <?= CSRF::field() ?><select name="status" onchange="this.form.submit()" class="rounded border text-xs p-1">
      <?php foreach ($labels as $k=>$l): ?><option <?= $o['status']===$k?'selected':'' ?> value="<?= e($k) ?>"><?= e($l) ?></option><?php endforeach; ?></select></form></td>
  <td class="p-3"><?= e($o['client_name'] ?: $o['customer_name']) ?></td>
  <td class="p-3"><a class="text-purple-700 hover:underline" href="tel:<?= e($o['phone'] ?? '') ?>"><?= e($o['phone'] ?? '—') ?></a></td>
  <td class="p-3"><?= e($o['character_name'] ?? '—') ?></td>
  <td class="p-3 whitespace-nowrap"><?= e($o['event_date']) ?> <?= e(substr((string)$o['event_time'],0,5)) ?></td>
  <td class="p-3 text-right"><?= money((int)$o['total_amount']) ?></td>
  <td class="p-3 text-right text-emerald-700"><?= money((int)$o['prepayment']) ?></td>
  <td class="p-3 text-right font-semibold <?= (int)$o['balance']>0?'text-red-600':'text-emerald-600' ?>"><?= money((int)$o['balance']) ?></td>
  <td class="p-3 text-right"><a href="/admin/orders/<?= (int)$o['id'] ?>" class="text-xs underline">открыть</a></td></tr>
<?php endforeach; if (!$orders): ?><tr><td colspan="10" class="p-6 text-center text-slate-500">Ничего не найдено</td></tr><?php endif; ?>
</tbody></table></div>
<?php endif; ?>

<!-- Модалка ручного создания заявки -->
<div x-data="{open:false}" @open-new-order.window="open=true" x-show="open" x-cloak
     class="fixed inset-0 z-50 bg-black/40 grid place-items-center overflow-auto" @click.self="open=false">
  <form method="post" action="/admin/orders/create" class="bg-white rounded-2xl p-6 w-[min(94vw,640px)] my-8 grid sm:grid-cols-2 gap-3 text-sm">
    <h2 class="sm:col-span-2 font-black text-lg">Новая заявка (вручную)</h2>
    <?= CSRF::field() ?>
    <label>Имя*<input required name="name" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
    <label>Телефон*<input required name="phone" placeholder="+7..." class="mt-1 w-full rounded-lg border px-3 py-2"></label>
    <label>Email<input name="email" type="email" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
    <label>Персонаж<select name="character_id" class="mt-1 w-full rounded-lg border px-3 py-2"><option value="">—</option>
      <?php foreach (DB::all('SELECT id,name FROM characters WHERE is_active=1 ORDER BY sort_order') as $c): ?><option value="<?= (int)$c['id'] ?>"><?= e($c['name']) ?></option><?php endforeach; ?></select></label>
    <label>Дата*<input required type="date" name="event_date" min="<?= date('Y-m-d') ?>" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
    <label>Время*<input required type="time" name="event_time" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
    <label class="sm:col-span-2">Адрес<input name="address" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
    <label>Сумма, ₽*<input required type="number" min="0" name="total_amount" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
    <label>Предоплата, ₽<input type="number" min="0" name="prepayment" value="0" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
    <label class="sm:col-span-2">Комментарий<textarea name="comment" rows="2" class="mt-1 w-full rounded-lg border px-3 py-2"></textarea></label>
    <label class="sm:col-span-2 flex items-center gap-2 text-xs"><input type="checkbox" name="pd_consent" value="1" required> Согласие клиента на обработку персональных данных получено</label>
    <div class="sm:col-span-2 flex gap-2 justify-end">
      <button type="button" @click="open=false" class="rounded-lg border px-4 py-2">Отмена</button>
      <button class="bg-purple-700 text-white rounded-lg px-4 py-2 font-semibold">Создать заявку</button></div>
  </form>
</div>
