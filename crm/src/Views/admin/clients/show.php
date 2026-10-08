<?php /** Карточка клиента с историей заказов и остатками */ ?>
<a href="/admin/clients" class="text-sm text-purple-700 hover:underline">← Все клиенты</a>
<div class="bg-white rounded-2xl shadow-sm p-5 mt-3 mb-4">
  <h2 class="font-black text-xl"><?= e($c['name']) ?>
    <?= (int)$c['pd_consent'] ? '<span class="ml-2 align-middle text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">согласие ПД есть</span>' : '' ?></h2>
  <p class="text-sm mt-1">📞 <a class="text-purple-700 hover:underline" href="tel:<?= e($c['phone']) ?>"><?= e(phone_pretty($c['phone'])) ?></a>
     ✉️ <?= e($c['email'] ?: '—') ?> · зарегистрирован <?= e($c['created_at']) ?></p>
</div>
<div class="bg-white rounded-2xl shadow-sm overflow-x-auto"><table class="w-full text-sm">
<thead><tr class="text-left text-xs uppercase text-slate-500 border-b"><th class="p-3">Заявка</th><th class="p-3">Персонаж</th><th class="p-3">Дата</th><th class="p-3">Статус</th><th class="p-3 text-right">Сумма</th><th class="p-3 text-right">Остаток</th></tr></thead>
<tbody><?php foreach ($orders as $o): ?>
<tr class="border-b"><td class="p-3"><a class="text-purple-700 underline" href="/admin/orders/<?= (int)$o['id'] ?>">#<?= (int)$o['id'] ?></a></td>
<td class="p-3"><?= e($o['character_name'] ?? '—') ?></td><td class="p-3"><?= e($o['event_date']) ?> <?= e(substr((string)$o['event_time'],0,5)) ?></td>
<td class="p-3"><?= e(['new'=>'Новая','in_work'=>'Обработка','prepayment'=>'Предоплата','confirmed'=>'Подтверждено','completed'=>'Завершено','cancelled'=>'Отменено'][$o['status']] ?? $o['status']) ?></td>
<td class="p-3 text-right"><?= money((int)$o['total_amount']) ?></td>
<td class="p-3 text-right <?= (int)$o['balance']>0?'text-red-600':'text-emerald-600' ?>"><?= money((int)$o['balance']) ?></td></tr>
<?php endforeach; if (!$orders): ?><tr><td colspan="6" class="p-6 text-center text-slate-500">Заказов пока нет</td></tr><?php endif; ?></tbody></table></div>
