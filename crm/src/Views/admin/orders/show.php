<?php /** Карточка заявки: статусы, редактирование, кросс-товары, чек/email, удаление */

$crossSum = array_sum(array_map(fn($i) => (int)$i['unit_price'] * (int)$i['qty'], $items)); ?>
<a href="/admin/orders" class="text-sm text-purple-700 hover:underline">← Все заявки</a>
<div class="grid lg:grid-cols-3 gap-5 mt-3">
  <!-- Левая колонка: финансовый блок -->
  <div class="space-y-4">
    <div class="bg-white rounded-2xl shadow-sm p-5">
      <div class="flex justify-between items-center"><h2 class="font-black text-lg">Заявка #<?= (int)$o['id'] ?></h2>
        <span class="text-xs px-3 py-1 rounded-full font-semibold <?= ['new'=>'bg-blue-100 text-blue-700','in_work'=>'bg-amber-100 text-amber-700','prepayment'=>'bg-purple-100 text-purple-700','confirmed'=>'bg-emerald-100 text-emerald-700','completed'=>'bg-slate-200','cancelled'=>'bg-red-100 text-red-600'][$o['status']] ?>">
          <?= e($statuses[$o['status']]) ?></span></div>
      <!-- Кнопки смены статуса (realtime без перезагрузки страницы) -->
      <div class="flex flex-wrap gap-1 mt-3 text-xs">
        <?php foreach ($statuses as $k => $l): if ($k === $o['status']) continue; ?>
          <button onclick="setStatus(<?= (int)$o['id'] ?>,'<?= e($k) ?>')" class="border rounded-lg px-2 py-1 hover:bg-purple-50"><?= e($l) ?></button>
        <?php endforeach; ?></div>
      <div class="mt-4 space-y-1 text-sm border-t pt-3">
        <div class="flex justify-between"><span>Сумма заказа</span><b><?= money((int)$o['total_amount']) ?></b></div>
        <div class="flex justify-between text-emerald-700"><span>Предоплата</span><b><?= money((int)$o['prepayment']) ?></b></div>
        <div class="flex justify-between text-slate-500"><span>Кросс-товары</span><b><?= money($crossSum) ?></b></div>
        <div class="flex justify-between text-base border-t pt-2 <?= $balance > 0 ? 'text-red-600' : 'text-emerald-600' ?>"><span><b>Остаток (автоматически)</b></span><b><?= money((int)$balance) ?></b></div>
      </div>
      <p class="text-xs text-slate-400 mt-2">Создана: <?= e($o['created_at']) ?> · Согласие ПД: <?= $o['pd_consent'] ? 'есть' : 'нет' ?></p>
    </div>

    <!-- Чек и email клиента (при «Завершено» — отправка чека) -->
    <div class="bg-white rounded-2xl shadow-sm p-5">
      <h3 class="font-bold mb-2">Чек об оплате</h3>
      <?php if ($o['receipt_path']): ?><a target="_blank" class="text-purple-700 underline text-sm" href="<?= e($o['receipt_path']) ?>">Открыть прикреплённый чек</a><?php endif; ?>
      <form method="post" action="/admin/orders/<?= (int)$o['id'] ?>/receipt" enctype="multipart/form-data" class="mt-2 space-y-2">
        <?= CSRF::field() ?>
        <input type="file" name="receipt" accept="image/*" class="text-xs w-full">
        <button class="w-full bg-fuchsia-600 text-white rounded-lg py-2 text-sm font-semibold <?= $o['status'] !== 'completed' ? 'opacity-50' : '' ?>">
          Прикрепить и отправить на email клиента</button>
        <p class="text-xs text-slate-500">Email: <b><?= e($o['email'] ?: 'не указан') ?></b>. Отправка доступна при статусе «Завершено».</p>
      </form>
    </div>

    <?php if (Auth::isAdmin()): ?>
    <form method="post" action="/admin/orders/<?= (int)$o['id'] ?>/delete" onsubmit="return confirm('Удалить заявку безвозвратно?')">
      <?= CSRF::field() ?><button class="w-full border border-red-300 text-red-600 hover:bg-red-50 rounded-xl py-2 text-sm">Удалить заявку</button></form>
    <?php endif; ?>
  </div>

  <!-- Правая колонка (2/3): форма редактирования -->
  <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm p-5">
    <h3 class="font-bold mb-3">Данные заявки</h3>
    <form method="post" action="/admin/orders/<?= (int)$o['id'] ?>/update" class="grid sm:grid-cols-2 gap-3 text-sm">
      <?= CSRF::field() ?>
      <label>Имя клиента<input name="customer_name" value="<?= e($o['customer_name']) ?>" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
      <label>Телефон (из базы)
        <a class="mt-1 block rounded-lg border px-3 py-2 text-purple-700 hover:underline" href="tel:<?= e($o['phone'] ?? '') ?>"><?= e($o['phone'] ?? '—') ?></a></label>
      <label>Дата<input type="date" name="event_date" value="<?= e($o['event_date']) ?>" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
      <label>Время<input type="time" name="event_time" value="<?= e(substr((string)$o['event_time'],0,5)) ?>" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
      <label class="sm:col-span-2">Адрес<input name="address" value="<?= e($o['address']) ?>" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
      <label>Персонаж<select name="character_id" class="mt-1 w-full rounded-lg border px-3 py-2"><option value="0">—</option>
        <?php foreach ($chars as $c): ?><option value="<?= (int)$c['id'] ?>" <?= (int)$o['character_id']===(int)$c['id']?'selected':'' ?>><?= e($c['name']) ?></option><?php endforeach; ?></select></label>
      <label>Программа<select name="service_id" class="mt-1 w-full rounded-lg border px-3 py-2"><option value="0">—</option>
        <?php foreach ($services as $sv): ?><option value="<?= (int)$sv['id'] ?>" <?= (int)$o['service_id']===(int)$sv['id']?'selected':'' ?>><?= e($sv['title']) ?> (<?= (int)$sv['duration_min'] ?> мин)</option><?php endforeach; ?></select></label>
      <label>Сумма, ₽<input type="number" min="0" name="total_amount" value="<?= (int)$o['total_amount'] ?>" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
      <label>Предоплата, ₽<input type="number" min="0" name="prepayment" value="<?= (int)$o['prepayment'] ?>" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
      <label class="sm:col-span-2">Песни (до 3)<input name="songs" value="<?= e($o['songs']) ?>" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
      <label class="sm:col-span-2">Комментарий<textarea name="comment" rows="3" class="mt-1 w-full rounded-lg border px-3 py-2"><?= e($o['comment']) ?></textarea></label>
      <!-- Кросс-товары: количество -> сумма пересчитывается на лету, остаток в БД автоматически -->
      <fieldset class="sm:col-span-2 border rounded-xl p-3"><legend class="px-2 text-xs font-bold uppercase text-slate-500">Дополнительно (шары, торт…)</legend>
        <div class="grid sm:grid-cols-2 gap-2 text-sm" x-data="{qtys:{}}">
          <?php foreach ($cross as $cp): $cur = 0; foreach ($items as $i) if ((int)$i['product_id']===(int)$cp['id']) $cur=(int)$i['qty']; ?>
            <label class="flex items-center gap-2 border rounded-lg px-2 py-1.5">
              <span class="flex-1"><?= e($cp['name']) ?> <span class="text-slate-400">@ <?= money((int)$cp['price']) ?></span></span>
              <input type="number" min="0" max="20" name="cross[<?= (int)$cp['id'] ?>]" value="<?= $cur ?>" class="w-16 rounded border px-2 py-1"></label>
          <?php endforeach; ?></div>
        <p class="text-xs text-slate-400 mt-2">Цены берутся из справочника; итог и остаток пересчитываются автоматически после сохранения.</p></fieldset>
      <div class="sm:col-span-2"><button class="bg-purple-700 hover:bg-purple-800 text-white rounded-xl px-6 py-2.5 font-semibold">Сохранить изменения</button></div>
    </form>
  </div>
</div>
<script>
// Смена статуса через fetch + мгновенный пересчёт отображения остатка
async function setStatus(id, status){ const r = await post(`/admin/orders/${id}/status`, {status}); if (r.ok) location.reload(); }
</script>
