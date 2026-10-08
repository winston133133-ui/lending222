<?php /** Пользователи CRM: таблица + форма добавления/редактирования (роль, статус, сброс пароля) */ ?>
<div class="grid lg:grid-cols-3 gap-5">
  <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-x-auto">
    <table class="w-full text-sm"><thead><tr class="text-left text-xs uppercase text-slate-500 border-b">
      <th class="p-3">Имя</th><th class="p-3">Email</th><th class="p-3">Роль</th><th class="p-3">Статус</th><th class="p-3"></th></tr></thead>
      <tbody><?php foreach ($users as $u): ?>
      <tr class="border-b hover:bg-purple-50/40" x-data='u=<?= json_encode($u, JSON_HEX_APOS|JSON_HEX_QUOT) ?>'>
        <td class="p-3 font-medium"><?= e($u['name']) ?></td><td class="p-3"><?= e($u['email']) ?></td>
        <td class="p-3"><?= $u['role']==='admin' ? 'Администратор' : 'Менеджер' ?></td>
        <td class="p-3"><?= (int)$u['is_active'] ? '<span class="text-emerald-600">активен</span>' : '<span class="text-slate-400">отключён</span>' ?></td>
        <td class="p-3 text-right space-x-2 whitespace-nowrap">
          <button @click="$dispatch('edit-user', u)" class="text-xs underline">редактировать</button>
          <?php if ((int)$u['id'] !== (int)($_SESSION['uid'] ?? 0)): ?>
          <form method="post" action="/admin/users/<?= (int)$u['id'] ?>/delete" class="inline" onsubmit="return confirm('Удалить пользователя?')">
            <?= CSRF::field() ?><button class="text-xs text-red-600 underline">удалить</button></form><?php endif; ?>
        </td></tr><?php endforeach; ?></tbody></table>
  </div>
  <div x-data="userForm()" class="bg-white rounded-2xl shadow-sm p-5 h-fit">
    <h3 class="font-bold mb-3" x-text="form.id ? 'Редактировать' : 'Новый пользователь'"></h3>
    <form method="post" action="/admin/users/save" @edit-user.window="fill($event.detail)" class="space-y-3 text-sm">
      <?= CSRF::field() ?><input type="hidden" name="id" :value="form.id">
      <label>Имя*<input required name="name" x-model="form.name" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
      <label>Email*<input required type="email" name="email" x-model="form.email" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
      <label>Роль*<select name="role" x-model="form.role" class="mt-1 w-full rounded-lg border px-3 py-2">
        <option value="manager">Менеджер — заявки и клиенты</option><option value="admin">Администратор — полный доступ</option></select></label>
      <label x-show="!form.id">Пароль* (мин. 6)<input name="password" :required="!form.id" type="password" x-model="form.password" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
      <label x-show="form.id" class="block">Новый пароль (оставьте пустым, чтобы не менять)<input name="password" type="password" class="mt-1 w-full rounded-lg border px-3 py-2"></label>
      <label class="flex items-center gap-2"><input type="checkbox" name="is_active" value="1" :checked="form.is_active"> Активен</label>
      <button class="w-full bg-purple-700 text-white rounded-lg py-2 font-semibold">Сохранить</button>
    </form>
    <script>function userForm(){ return { form:{id:0,name:'',email:'',role:'manager',password:'',is_active:true},
      fill(u){ this.form = {...u, is_active: !!Number(u.is_active), password:''}; } }; }</script>
  </div>
</div>
