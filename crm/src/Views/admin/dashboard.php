<?php /** Дашборд: KPI + ближайшие мероприятия + последние заявки */ $sc=['new'=>'bg-blue-100 text-blue-700','in_work'=>'bg-amber-100 text-amber-700','prepayment'=>'bg-purple-100 text-purple-700','confirmed'=>'bg-emerald-100 text-emerald-700','completed'=>'bg-slate-200 text-slate-700','cancelled'=>'bg-red-100 text-red-600'];?>
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <?php foreach ([['Новых заявок сегодня',$stats['new_today']],['За неделю',$stats['new_week']],['Предоплаты',money($stats['prepay_sum'])],['Оплачено полностью',money($stats['paid_full'])]] as [$l,$v]): ?>
    <div class="bg-white rounded-2xl shadow-sm p-5"><p class="text-xs uppercase text-slate-500"><?= e($l) ?></p><p class="text-2xl font-black mt-1"><?= e((string)$v) ?></p></div>
  <?php endforeach; ?>
</div>
<div class="grid lg:grid-cols-2 gap-5 mt-5">
  <section class="bg-white rounded-2xl shadow-sm p-5">
    <h2 class="font-bold mb-3">Ближайшие мероприятия (сегодня/завтра)</h2>
    <?php if (!$upcoming): ?><p class="text-sm text-slate-500">Нет активных броней на ближайшие дни.</p><?php endif; ?>
    <?php foreach ($upcoming as $o): ?>
      <a href="/admin/orders/<?= (int)$o['id'] ?>" class="flex items-center gap-3 border-b py-2 hover:bg-purple-50 rounded text-sm">
        <span class="w-14 text-center font-mono"><?= e(substr((string)$o['event_time'],0,5)) ?></span>
        <span class="flex-1"><b><?= e($o['customer'] ?: $o['customer_name']) ?></b> · <?= e($o['character_name'] ?? '—') ?> · <?= e($o['address']) ?></span>
        <span class="<?= $sc[$o['status']] ?> px-2 py-0.5 rounded-full text-xs whitespace-nowrap"><?= ['new'=>'Новая','in_work'=>'Обработка','prepayment'=>'Предоплата','confirmed'=>'Подтверждено','completed'=>'Завершено','cancelled'=>'Отменено'][$o['status']] ?></span>
        <span class="w-24 text-right font-semibold <?= (int)$o['balance']>0?'text-red-600':'text-emerald-600' ?>">остаток <?= money((int)$o['balance']) ?></span></a>
    <?php endforeach; ?>
  </section>
  <section class="bg-white rounded-2xl shadow-sm p-5">
    <h2 class="font-bold mb-3">Последние заявки</h2>
    <?php foreach ($recent as $r): ?>
      <a href="/admin/orders/<?= (int)$r['id'] ?>" class="flex items-center gap-2 border-b py-2 text-sm hover:bg-purple-50 rounded">
        <span class="text-slate-400 w-12">#<?= (int)$r['id'] ?></span>
        <span class="flex-1"><?= e($r['customer'] ?? $r['phone'] ?? '—') ?></span>
        <span class="<?= $sc[$r['status']] ?> px-2 py-0.5 rounded-full text-xs"><?= ['new'=>'Новая','in_work'=>'В работе','prepayment'=>'Предоплата','confirmed'=>'Подтв.','completed'=>'Готово','cancelled'=>'Отменена'][$r['status']] ?></span>
        <span class="w-20 text-right font-medium"><?= money((int)$r['total_amount']) ?></span></a>
    <?php endforeach; ?>
  </section>
</div>
