<?php /** Календарь: месячная сетка; в дне — события (время+персонаж+клиент) и счётчик свободных слотов */ ?>
<div class="flex items-center gap-3 mb-4 text-sm">
  <a class="px-3 py-1.5 bg-white rounded-lg shadow-sm" href="?m=<?= e($prev) ?>">←</a>
  <b class="text-lg capitalize"><?php $mn=[1=>'Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']; echo $mn[(int)substr($month,5,2)] . ' ' . substr($month,0,4); ?></b>
  <a class="px-3 py-1.5 bg-white rounded-lg shadow-sm" href="?m=<?= e($next) ?>">→</a>
  <span class="ml-auto text-slate-500">Режим работы <?= e($sc['start_time']) ?>–<?= e($sc['end_time']) ?> · шаг <?= (int)$sc['interval_min'] ?> мин · буфер ±<?= (int)$sc['buffer_min'] ?> мин</span>
</div>
<div class="grid grid-cols-7 gap-2">
  <?php foreach (['Пн','Вт','Ср','Чт','Пт','Сб','Вс'] as $w): ?><div class="text-center text-xs font-bold text-slate-500"><?= $w ?></div><?php endforeach; ?>
  <?php $firstWd = (int)date('N', strtotime($month.'-01')); for ($i=1;$i<$firstWd;$i++): ?><div></div><?php endfor; ?>
  <?php foreach ($cells as $c): $today = $c['date'] === date('Y-m-d'); ?>
    <div class="bg-white rounded-xl shadow-sm p-2 min-h-[92px] text-xs <?= $today ? 'ring-2 ring-purple-500' : '' ?>">
      <div class="flex justify-between"><b><?= $c['day'] ?></b><span class="<?= $c['free'] ? 'text-emerald-600' : 'text-red-500' ?>"><?= $c['free'] ? "своб. {$c['free']}" : 'нет мест' ?></span></div>
      <?php foreach ($c['events'] as $ev): ?>
        <a href="/admin/orders/<?= (int)$ev['id'] ?>" class="block mt-1 rounded px-1 py-0.5 truncate <?= ['cancelled'=>'bg-red-50 text-red-500 line-through','completed'=>'bg-slate-100','confirmed'=>'bg-emerald-50','new'=>'bg-blue-50','in_work'=>'bg-amber-50','prepayment'=>'bg-purple-50'][$ev['status']] ?? 'bg-slate-50' ?>">
          <?= e(substr((string)$ev['event_time'],0,5)) ?> · <?= e($ev['character_name'] ?: '—') ?> <span class="text-slate-400">(<?= e($ev['customer'] ?: $ev['customer_name']) ?>)</span></a>
      <?php endforeach; ?>
    </div>
  <?php endforeach; ?>
</div>
