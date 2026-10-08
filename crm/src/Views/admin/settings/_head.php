<?php /** Единая шапка вкладок настроек: пилюли по порядку ТЗ + WYSIWYG-хелпер */ ?>
<div class="flex flex-wrap gap-1 mb-5 text-sm">
  <?php foreach (SettingsController::TABS as $t => $label): if ($t==='users') continue; ?>
    <a href="/admin/settings/<?= e($t) ?>" class="px-3 py-1.5 rounded-full <?= $t===$tab?'bg-purple-700 text-white':'bg-white shadow-sm hover:bg-purple-100' ?>"><?= e($label) ?></a>
  <?php endforeach; ?><a href="/admin/users" class="px-3 py-1.5 rounded-full bg-white shadow-sm hover:bg-purple-100">Пользователи</a>
</div>
<?php
/** Мини-WYSIWYG (contenteditable) с сохранением переносов строк в <br> */
function wysiwyg(string $name, string $value, string $label = 'Описание'): void { ?>
<div class="sm:col-span-2">
  <span class="text-xs font-bold uppercase text-slate-500"><?= e($label) ?> (жирный/курсив работают, переносы сохраняются)</span>
  <div contenteditable="true" data-wysiwyg="<?= e($name) ?>" class="mt-1 min-h-[90px] rounded-lg border px-3 py-2 bg-white text-sm focus:outline focus:outline-2 focus:outline-purple-400"><?= clean_html($value) ?></div>
  <input type="hidden" name="<?= e($name) ?>">
</div><?php } ?>
<script>
// contenteditable -> hidden input перед отправкой формы (сохраняем <br>/<b>/<i>)
document.querySelectorAll('[data-wysiwyg]').forEach(ed => {
  const bar = document.createElement('div'); bar.className='flex gap-1 mt-1';
  bar.innerHTML = '<button type="button" class="text-xs border rounded px-2 py-0.5 bg-white" data-cmd="bold"><b>Ж</b></button>'
    + '<button type="button" class="text-xs border rounded px-2 py-0.5 bg-white" data-cmd="italic"><i>К</i></button>'
    + '<button type="button" class="text-xs border rounded px-2 py-0.5 bg-white" data-cmd="insertUnorderedList">• Список</button>';
  ed.parentNode.insertBefore(bar, ed.nextSibling);
  bar.addEventListener('click', ev => { const c = ev.target.dataset.cmd; if (c){ ed.focus(); document.execCommand(c); } });
  ed.closest('form')?.addEventListener('submit', () => { ed.parentNode.querySelector(`input[name="${ed.dataset.wysiwyg}"]`).value = ed.innerHTML; });
});
</script>
