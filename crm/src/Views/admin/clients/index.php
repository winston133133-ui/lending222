<?php /** Клиенты: поиск, таблица (согласие ПД, сумма заказов), модалка добавления/редактирования */ ?>
<div class="flex flex-wrap items-center gap-3 mb-4">
  <form method="get" class="flex gap-2"><input name="q" value="<?= e($q) ?>" placeholder="Поиск по имени/телефону" class="rounded-lg border px-3 py-1.5 text-sm w-64">
    <button class="bg-purple-700 text-white rounded-lg px-3 py-1.5 text-sm">Найти</button></form>
  <?php if (Auth::isAdmin()): ?><button @click="$dispatch('open-client')" class="ml-auto bg-fuchsia-600 text-white rounded-lg px-4 py-1.5 text-sm font-semibold">+ Клиент</button><?php endif; ?>
</div>
<div class="bg-white rounded-2xl shadow-sm overflow-x-auto"><table class="w-full text-sm">
<thead><tr class="text-left text-xs uppercase text-slate-500 border-b"><th class="p-3">Имя</th><th class="p-3">Телефон</th><th class="p-3">Email</th><th class="p-3">Согласие ПД</th><th class="p-3 text-right">Заказов</th><th class="p-3 text-right">Выручка</th><th class="p-3"></th></tr></thead>
<tbody><?php foreach ($clients as $cl): ?>
<tr class="border-b hover:bg-purple-50/40">
  <td class="p-3 font-medium"><a href="/admin/clients/<?= (int)$cl['id'] ?>" class="text-purple-700 hover:underline"><?= e($cl['name']) ?></a></td>
  <td class="p-3"><a href="tel:<?= e($cl['phone']) ?>" class="text-purple-700 hover:underline"><?= e(phone_pretty($cl['phone'])) ?></a></td>
  <td class="p-3"><?= e($cl['email'] ?? '—') ?></td>
  <td class="p-3"><?= (int)$cl['pd_consent'] ? '<span class="text-emerald-600">✓ есть</span>' : '<span class="text-red-500">нет</span>' ?></td>
  <td class="p-3 text-right"><?= (int)$cl['orders_cnt'] ?></td>
  <td class="p-3 text-right"><?= money((int)$cl['total_sum']) ?></td>
  <td class="p-3 text-right whitespace-nowrap">
    <?php if (Auth::isAdmin()): ?>
    <button @click="$dispatch('edit-client', <?= json_encode($cl, JSON_HEX_APOS|JSON_HEX_QUOT) ?>)" class="text-xs underline">изм.</button>
    <form method="post" action="/admin/clients/<?= (int)$cl['id'] ?>/delete" class="inline" onsubmit="return confirm('Удалить клиента со всей историей?')">
      <?= CSRF::field() ?><button class="text-xs text-red-600 underline">удал.</button></form><?php endif; ?></td></tr>
<?php endforeach; if (!$clients): ?><tr><td colspan="7" class="p-6 text-center text-slate-500">Не найдено</td></tr><?php endif; ?></tbody></table></div>

<?php if (Auth::isAdmin()): ?>
<div x-data="{open:false, f:{id:0,name:'',phone:'',email:'',pd:false}}" @open-client.window="f={id:0,name:'',phone:'',email:'',pd:false};open=true"
     @edit-client.window="f={...$event.detail, pd:!!+$event.detail.pd_consent}; open=true" x-show="open" x-cloak
     class="fixed inset-0 z-50 bg-black/40 grid place-items-center" @click.self="open=false">
  <form method="post" action="/admin/clients/save" class="bg-white rounded-2xl p-6 w-[min(92vw,420px)] space-y-3 text-sm">
    <h2 class="font-black text-lg" x-text="f.id ? 'Редактировать клиента' : 'Новый клиент'"></h2>
    <?= CSRF::field() ?><input type="hidden" name="id" :value="f.id">
    <label>Имя*<input required name="name" x-model="f.name" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
    <label>Телефон*<input required name="phone" x-model="f.phone" placeholder="+7..." class="mt-1 w-full rounded-lg border px-3 py-2"></label>
    <label>Email<input type="email" name="email" x-model="f.email" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
    <label class="flex gap-2"><input type="checkbox" name="pd_consent" value="1" x-model="f.pd"> Согласие на обработку ПД</label>
    <button class="w-full bg-purple-700 text-white rounded-lg py-2 font-semibold">Сохранить</button>
  </form>
</div>
<?php endif; ?>
