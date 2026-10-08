<?php
/**
 * Публичный лендинг «Ростовые куклы» — превью-реализация всех секций из ТЗ.
 * Данные: $view (chars, cross, howto, condDelivery, condWork, payments, gallery,
 * stories, reviews, contacts, schedule, set). Стили: Tailwind CDN + Alpine.js.
 */
$s = $view['set'];
$brand = $s['brand_color'] ?? '#800080';
$today = date('Y-m-d');
?>
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($s['seo_title'] ?? $s['site_name']) ?></title>
<meta name="description" content="<?= e($s['seo_description'] ?? '') ?>">
<link rel="icon" href="<?= e($s['favicon'] ?? '') ?>">
<script src="https://cdn.tailwindcss.com"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
<script>
// Бренд-палитра #800080 и производные оттенки через Tailwind config (CDN)
tailwind.config = { theme: { extend: { colors: {
  brand: {50:'#faf0fa',100:'#f0d9f2',200:'#e0b3e6',300:'#cc84d4',400:'#b356c0',500:'#800080',600:'#730073',700:'#5c005c',800:'#470047',900:'#330033'}
}}}};
</script>
<style>
  /* Анимации: парящие декоративные элементы hero, плавный параллакс изображения */
  @keyframes floaty { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-14px) rotate(3deg)} }
  .floaty{animation:floaty 5s ease-in-out infinite}
  .floaty2{animation:floaty 7s ease-in-out infinite reverse}
  @keyframes pulseSoft{0%,100%{opacity:.55}50%{opacity:1}}
  .pulse-soft{animation:pulseSoft 3s ease-in-out infinite}
  [data-parallax]{transition:transform .25s cubic-bezier(.2,.8,.3,1);will-change:transform}
  html{scroll-behavior:smooth}
  .story-progress{transition:width linear}
</style>
</head>
<body class="bg-white text-slate-800 antialiased" x-data="landingApp()">

<!-- ===== Шапка / меню (рабочие якоря) ===== -->
<header class="fixed inset-x-0 top-0 z-40 bg-white/85 backdrop-blur border-b border-brand-100">
  <div class="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
    <a href="#hero" class="flex items-center gap-2 font-extrabold text-brand-600">
      <img src="<?= e($s['logo']) ?>" alt="Логотип" class="w-9 h-9 rounded-full object-cover">
      <span class="hidden sm:block text-sm leading-tight"><?= e($s['site_name']) ?></span>
    </a>
    <nav class="ml-auto hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
      <a href="#characters" class="hover:text-brand-600">Персонажи</a>
      <a href="#howto" class="hover:text-brand-600">Как заказать</a>
      <a href="#conditions" class="hover:text-brand-600">Условия</a>
      <a href="#payments" class="hover:text-brand-600">Оплата</a>
      <a href="#gallery" class="hover:text-brand-600">Галерея</a>
      <a href="#subscribe" class="hover:text-brand-600">Подписка</a>
      <a href="#stories" class="hover:text-brand-600">Истории</a>
      <a href="#reviews" class="hover:text-brand-600">Отзывы</a>
      <a href="#contacts" class="hover:text-brand-600">Контакты</a>
    </nav>
    <button @click="$dispatch('open-order')" class="ml-auto md:ml-0 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm">Заявка</button>
  </div>
</header>

<!-- ===== HERO: слева текст, справа изображение с реакцией на мышь, без обводок ===== -->
<section id="hero" class="relative overflow-hidden pt-16"
         @mousemove.throttle.60ms="heroMove($event)" @mouseleave="heroReset()">
  <!-- Фоновое изображение под градиентом (настраивается в админке) -->
  <div class="absolute inset-0 bg-cover bg-center" style="background-image:url('<?= e($s['hero_bg']) ?>')"></div>
  <div class="absolute inset-0 bg-gradient-to-br from-brand-800/95 via-brand-600/90 to-fuchsia-500/85"></div>
  <!-- Анимированные декоративные SVG-элементы ЗА текстом -->
  <svg class="absolute w-10 h-10 text-white/30 floaty" style="top:18%;left:8%" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6c0-1 1-2 2-2h2l2-2 2 2h2c1 0 2 1 2 2v3c0 4-2 7-6 8-4-1-6-4-6-8V6zm2 3h3l1 2 1-2h3v0c0 3-1.5 5-4 5s-4-2-4-5z"/></svg>
  <svg class="absolute w-12 h-12 text-amber-300/40 floaty2" style="top:70%;left:12%" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 6.8L21 12l-6.6 3.2L12 22l-2.4-6.8L3 12l6.6-3.2z"/></svg>
  <svg class="absolute w-9 h-9 text-cyan-300/40 floaty" style="top:25%;right:10%" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" opacity=".5"/><path d="M12 3v18M3 12h18" stroke="white" stroke-width="1"/></svg>
  <svg class="absolute w-11 h-11 text-pink-300/40 floaty2" style="top:65%;right:6%" viewBox="0 0 24 24" fill="currentColor"><path d="M2 12l9-9 3 3-6 6 6 6-3 3z"/><path d="M22 12l-9 9-3-3 6-6-6-6 3-3z" opacity=".7"/></svg>

  <div class="relative max-w-7xl mx-auto px-4 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center min-h-[60vh]">
    <div class="text-white">
      <h1 class="text-3xl md:text-5xl font-black leading-tight drop-shadow"><?= e($s['hero_title']) ?></h1>
      <p class="mt-4 text-lg text-white/90"><?= e($s['hero_subtitle']) ?></p>
      <div class="mt-6 flex flex-wrap gap-3">
        <button @click="$dispatch('open-order')" class="bg-white text-brand-600 font-bold px-6 py-3 rounded-xl shadow hover:bg-brand-50 transition">Заказать праздник</button>
        <a href="#characters" class="border-2 border-white/70 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition">Наши персонажи</a>
      </div>
      <p class="mt-4 text-sm text-white/70">Саратов • Энгельс • выезд на турбазы &nbsp;|&nbsp; Работа ежедневно <?= e($view['schedule']['start_time']) ?>–<?= e($view['schedule']['end_time']) ?></p>
    </div>
    <!-- Правый блок: изображение реагирует на движение мыши, без обводки/теней, адаптивно -->
    <div class="relative flex justify-center md:justify-end">
      <img data-parallax :style="`transform: translate(${px}px, ${py}px)`"
           src="<?= e($s['hero_image']) ?>" srcset="<?= e($s['hero_image']) ?> 900w"
           alt="Ростовые куклы на празднике" class="w-full max-w-md aspect-square object-contain select-none pointer-events-none">
    </div>
  </div>
</section>

<!-- ===== ПЕРСОНАЖИ ===== -->
<section id="characters" class="py-16 bg-brand-50/40">
  <div class="max-w-7xl mx-auto px-4">
    <h2 class="flex items-center gap-3 text-2xl md:text-3xl font-black text-brand-700">
      <svg class="w-8 h-8 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8c0-2 2-4 4-4h8c2 0 4 2 4 4v2c0 5-3 8-8 10-5-2-8-5-8-10V8z"/><circle cx="9.5" cy="10" r="1.2" fill="currentColor"/><circle cx="14.5" cy="10" r="1.2" fill="currentColor"/><path d="M9 14c1.8 1.2 4.2 1.2 6 0"/></svg>
      Наши персонажи
    </h2>
    <p class="mt-2 text-slate-500">Выберите героя — кликните по фото, чтобы рассмотреть ближе.</p>
    <div class="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <?php foreach ($view['chars'] as $c): ?>
      <article class="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden" x-data="{openFull:false, img:0, svc:null}">
        <!-- Мини-галерея: несколько фото, открыть/увеличить -->
        <div class="relative">
          <img :src="<?= htmlspecialchars(json_encode(array_column($c['images'], 'path'))) ?>[img]"
               @click="lightbox(<?= htmlspecialchars(json_encode(array_column($c['images'],'path'))) ?>, img)"
               class="w-full h-52 object-cover cursor-zoom-in" alt="<?= e($c['name']) ?>">
          <?php if (count($c['images']) > 1): ?>
          <div class="absolute bottom-2 right-2 flex gap-1">
            <?php foreach ($c['images'] as $k=>$im): ?>
            <button @click="img=<?= $k ?>" :class="img===<?= $k ?>?'ring-2 ring-white':'opacity-70'"
              class="w-8 h-8 rounded-md overflow-hidden"><img src="<?= e($im['path']) ?>" class="w-full h-full object-cover"></button>
            <?php endforeach; ?>
          </div>
          <?php endif; ?>
          <span class="absolute top-2 left-2 bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded-lg">от <?= money($c['price_from']) ?></span>
        </div>
        <div class="p-4">
          <h3 class="font-bold text-lg text-slate-900"><?= e($c['name']) ?></h3>
          <!-- Краткое описание; строки с новой строки в полном описании показываем звёздочками -->
          <p class="text-sm text-slate-600 mt-1"><?= e(str_replace("\n", " ", $c['description'])) ?></p>
          <template x-if="openFull"><p class="text-sm text-slate-600 mt-2 whitespace-pre-line"><?php
            echo e(preg_split("/\r?\n/", $c['description'])[0]);
            foreach (array_slice(preg_split("/\r?\n/", $c['description']),1) as $ln) echo "\n★ " . $ln;
          ?></p></template>
          <?php if (str_contains($c['description'], "\n")): ?>
          <button @click="openFull=!openFull" class="text-brand-600 text-sm font-medium mt-1" x-text="openFull?'Свернуть':'Подробнее'"></button>
          <?php endif; ?>

          <!-- Выбор услуги КНОПКАМИ (не select), по умолчанию ни одна не отмечена -->
          <p class="mt-3 text-xs uppercase tracking-wide text-slate-400 font-semibold">Услуга:</p>
          <div class="mt-1 flex flex-wrap gap-1.5">
            <?php foreach ($c['services'] as $sv): ?>
            <button @click="svc = (svc===<?= $sv['id'] ?> ? null : <?= $sv['id'] ?>)"
              :class="svc===<?= $sv['id'] ?> ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-brand-700 border-brand-200 hover:border-brand-400'"
              class="text-xs font-semibold border px-2.5 py-1 rounded-lg transition">
              <?= e($sv['title']) ?> · <?= (int)$sv['duration_min'] ?> мин · <?= money($sv['price']) ?>
            </button>
            <?php endforeach; ?>
          </div>
          <!-- После наименования выбранной услуги — её описание -->
          <template x-for="d in [{id:0,t:''}]"></template>
          <?php foreach ($c['services'] as $sv): ?>
          <p x-show="svc===<?= $sv['id'] ?>" class="text-xs text-slate-500 mt-2 italic">— <?= e($sv['description']) ?> (<?= (int)$sv['duration_min'] ?> мин)</p>
          <?php endforeach; ?>

          <button @click="$dispatch('open-order', {character: '<?= e($c['name']) ?>', cid: <?= (int)$c['id'] ?>, dur: <?= (int)$c['duration_min'] ?>})"
            class="mt-4 w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-xl transition">Забронировать</button>
        </div>
      </article>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ===== КАК ЗАКАЗАТЬ (красочная анимированная) ===== -->
<section id="howto" class="py-16 relative overflow-hidden bg-gradient-to-r from-brand-700 to-fuchsia-600 text-white">
  <div class="max-w-7xl mx-auto px-4">
    <h2 class="flex items-center gap-3 text-2xl md:text-3xl font-black pulse-soft">
      <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9"/></svg>
      Как заказать?
    </h2>
    <div class="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <?php foreach ($view['howto'] as $i => $h): ?>
      <div class="relative bg-white/10 backdrop-blur rounded-2xl p-5 hover:bg-white/20 transition hover:-translate-y-1 duration-300">
        <div class="absolute -top-5 left-5 w-10 h-10 rounded-full bg-amber-400 text-brand-800 font-black flex items-center justify-center shadow"><?= $i+1 ?></div>
        <svg class="w-8 h-8 mt-3 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/></svg>
        <h3 class="font-bold mt-2"><?= e($h['title']) ?></h3>
        <p class="text-sm text-white/85 mt-1"><?= e($h['body']) ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ===== УСЛОВИЯ РАБОТЫ И ДОСТАВКИ: два блока в одной секции ===== -->
<section id="conditions" class="py-16">
  <div class="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-8">
    <?php
    $blocks = [
      ['Доставка ростовой куклы', $view['condDelivery'], '<path d="M1 7h13v10H1zM14 10h4l3 3v4h-7z"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>'],
      ['Время работы ростовой куклы', $view['condWork'], '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>'],
    ];
    foreach ($blocks as [$title, $items, $icon]): ?>
    <div class="rounded-2xl border-2 border-brand-100 bg-brand-50/50 p-6">
      <h2 class="flex items-center gap-3 text-xl font-black text-brand-700">
        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><?= $icon ?></svg>
        <?= e($title) ?>
      </h2>
      <div class="mt-4 space-y-3">
        <?php foreach ($items as $it): ?>
        <div class="flex gap-3 bg-white rounded-xl p-4 shadow-sm">
          <div class="shrink-0 w-9 h-9 rounded-lg bg-brand-500/10 text-brand-600 flex items-center justify-center font-black"><?= e(mb_substr($it['title'],0,1)) ?></div>
          <div><h3 class="font-semibold text-slate-800"><?= e($it['title']) ?></h3>
          <p class="text-sm text-slate-600 mt-0.5"><?= e($it['body']) ?></p></div>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
    <?php endforeach; ?>
  </div>
</section>

<!-- ===== СПОСОБЫ ОПЛАТЫ ===== -->
<section id="payments" class="py-16 bg-slate-50">
  <div class="max-w-7xl mx-auto px-4">
    <h2 class="flex items-center gap-3 text-2xl md:text-3xl font-black text-brand-700">
      <svg class="w-8 h-8 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
      Способы оплаты
    </h2>
    <div class="mt-8 grid md:grid-cols-2 gap-6">
      <?php foreach ($view['payments'] as $p): ?>
      <div class="bg-white rounded-2xl p-6 shadow-sm border-t-4 border-brand-500">
        <h3 class="font-bold text-lg flex items-center gap-2">
          <svg class="w-6 h-6 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><?= $p['icon']==='card' ? '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>' : '<path d="M3 21h18M4 18h16M6 18V9M10 18V9M14 18V9M18 18V9M2 9l10-6 10 6z"/>' ?></svg>
          <?= e($p['title']) ?>
        </h3>
        <p class="text-sm text-slate-600 mt-2"><?= e($p['body']) ?></p>
        <p class="text-sm mt-3 font-medium text-brand-700 bg-brand-50 rounded-lg px-3 py-2"><?= e($p['note']) ?></p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ===== ГАЛЕРЕЯ (после способов оплаты) ===== -->
<section id="gallery" class="py-16">
  <div class="max-w-7xl mx-auto px-4">
    <h2 class="flex items-center gap-3 text-2xl md:text-3xl font-black text-brand-700">
      <svg class="w-8 h-8 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>
      Галерея праздников
    </h2>
    <div class="mt-8 columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
      <?php foreach ($view['gallery'] as $g): ?>
      <figure class="mb-4 break-inside-avoid">
        <img src="<?= e($g['image_url']) ?>" loading="lazy" @click="lightbox(['<?= e($g['image_url']) ?>'],0)"
             class="w-full rounded-xl cursor-zoom-in hover:opacity-90 transition" alt="<?= e($g['caption']) ?>">
        <figcaption class="text-xs text-slate-500 mt-1"><?= e($g['caption']) ?></figcaption>
      </figure>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ===== ПОДПИСКА: изображение справа с выступом вверх, моб. — сверху ===== -->
<section id="subscribe" class="py-16 bg-gradient-to-l from-brand-700 via-brand-600 to-fuchsia-600 text-white">
  <div class="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-stretch">
    <div class="order-2 md:order-1 self-center">
      <h2 class="text-2xl md:text-3xl font-black">🎁 Секретные предложения и розыгрыши</h2>
      <p class="mt-2 text-white/85">Подпишитесь — пришлём промокод на первую программу и будем рассказывать о новых персонажах.</p>
      <form @submit.prevent="subscribe($event)" class="mt-5 flex flex-col sm:flex-row gap-3 max-w-md">
        <input type="email" name="email" required placeholder="Ваш email"
               class="flex-1 rounded-xl px-4 py-3 text-slate-800 outline outline-2 outline-white/60 focus:outline-amber-300 bg-white">
        <button class="bg-amber-400 hover:bg-amber-300 text-brand-800 font-bold px-6 py-3 rounded-xl transition">Подписаться</button>
      </form>
      <label class="mt-3 flex items-start gap-2 text-xs text-white/80 cursor-pointer">
        <input type="checkbox" name="pd_consent" class="mt-0.5 accent-amber-400">
        Согласен на обработку персональных данных
      </label>
      <p x-show="subMsg" x-text="subMsg" class="mt-2 text-sm font-medium text-amber-200"></p>
    </div>
    <div class="order-1 md:order-2 relative h-64 md:h-auto">
      <!-- Выступ вверх: изображение выходит за верхнюю границу блока, без обводок, реагирует на мышь -->
      <img data-parallax :style="`transform: translate(${sx}px, ${sy}px)`" src="<?= e($s['subscribe_image']) ?>"
           class="md:absolute md:-top-16 md:right-0 w-full h-full md:w-[70%] md:h-[115%] object-contain pointer-events-none select-none" alt="Подарок на подписку">
    </div>
  </div>
</section>

<!-- ===== ИСТОРИИ (прямоугольные, как Instagram; фото 10 сек, видео до конца) ===== -->
<section id="stories" class="py-16">
  <div class="max-w-7xl mx-auto px-4">
    <h2 class="text-2xl md:text-3xl font-black text-brand-700">Истории</h2>
    <div class="mt-6 flex gap-4 overflow-x-auto pb-2">
      <?php foreach ($view['stories'] as $i => $st): ?>
      <button @click="playStory(<?= $i ?>)" class="shrink-0 group">
        <div class="w-28 h-44 md:w-36 md:h-56 rounded-xl overflow-hidden border-4 border-brand-500 group-hover:scale-[1.03] transition relative">
          <?php if ($st['media_type']==='video'): ?>
          <video src="<?= e($st['media_url']) ?>" class="w-full h-full object-cover" muted preload="metadata"></video>
          <span class="absolute inset-0 flex items-center justify-center text-white text-3xl">▶</span>
          <?php else: ?>
          <img src="<?= e($st['media_url']) ?>" class="w-full h-full object-cover" alt="">
          <?php endif; ?>
          <span class="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[11px] px-2 py-1 truncate"><?= e($st['caption']) ?></span>
        </div>
      </button>
      <?php endforeach; ?>
    </div>
    <!-- Просмотрщик историй: прогресс-бар, автопереход -->
    <div x-show="storyIdx!==null" x-cloak class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" @click.self="closeStory()" @keydown.escape.window="closeStory()">
      <div class="relative w-[min(92vw,420px)]">
        <div class="flex gap-1 mb-2"><?php foreach ($view['stories'] as $i=>$_): ?>
          <div class="h-1 flex-1 bg-white/30 rounded"><div class="h-full bg-white rounded story-progress" :style="storyIdx><?= $i ?>|| (storyIdx===<?= $i ?> && storySeg==='done') ?'width:100%': (storyIdx===<?= $i ?>? 'width:'+storyPct+'%':'width:0')"></div></div>
        <?php endforeach; ?></div>
        <template x-if="storySeg==='image'"><img :src="storyUrl" class="w-full aspect-[9/12] object-contain rounded-xl"></template>
        <template x-if="storySeg==='video'"><video :src="storyUrl" autoplay playsinline class="w-full aspect-[9/12] object-contain rounded-xl" @ended="nextStory()"></video></template>
        <p x-text="storyCaption" class="text-white text-center mt-3"></p>
        <button @click="closeStory()" class="absolute -top-2 right-0 text-white/70 hover:text-white text-2xl">&times;</button>
      </div>
    </div>
  </div>
</section>

<!-- ===== ОТЗЫВЫ ===== -->
<section id="reviews" class="py-16 bg-brand-50/40">
  <div class="max-w-7xl mx-auto px-4">
    <h2 class="flex items-center gap-3 text-2xl md:text-3xl font-black text-brand-700">
      <svg class="w-8 h-8 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17l-7 4 2-8-5-5 8-1 3-7 3 7 8 1-5 5 2 8z"/></svg>
      Отзывы клиентов
    </h2>
    <div class="mt-8 grid md:grid-cols-3 gap-6">
      <?php foreach ($view['reviews'] as $r): ?>
      <div class="bg-white rounded-2xl p-5 shadow-sm">
        <div class="flex items-center gap-3">
          <?php if ($r['photo_url']): ?><img src="<?= e($r['photo_url']) ?>" class="w-11 h-11 rounded-full object-cover" alt=""><?php endif; ?>
          <div><p class="font-bold"><?= e($r['name']) ?></p>
          <p class="text-amber-400 text-sm"><?= str_repeat('★', (int)$r['rating']) . str_repeat('☆', 5-(int)$r['rating']) ?></p></div>
        </div>
        <p class="text-sm text-slate-600 mt-3">«<?= e($r['text']) ?>»</p>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
</section>

<!-- ===== КОНТАКТЫ: слева ссылки из админки, справа блок условий доставки ===== -->
<section id="contacts" class="py-16">
  <div class="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-10">
    <div>
      <h2 class="flex items-center gap-3 text-2xl md:text-3xl font-black text-brand-700">
        <svg class="w-8 h-8 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 2 .7 2.9a2 2 0 01-.4 2.1L8.1 10a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.9.6 2.9.7a2 2 0 011.6 2z"/></svg>
        Контакты
      </h2>
      <div class="mt-6 space-y-3">
        <?php foreach ($view['contacts'] as $c): ?>
        <a href="<?= e($c['url']) ?>" class="flex items-center gap-4 bg-white border border-brand-100 hover:border-brand-400 rounded-xl px-4 py-3 transition shadow-sm">
          <img src="<?= e($c['icon_url']) ?>" alt="" class="w-8 h-8 object-contain">
          <span><span class="block font-semibold text-slate-800"><?= e($c['label']) ?></span>
          <span class="block text-sm text-brand-600"><?= e($c['value']) ?></span></span>
        </a>
        <?php endforeach; ?>
      </div>
    </div>
    <div class="rounded-2xl bg-gradient-to-br from-brand-600 to-fuchsia-600 text-white p-6 lg:p-8">
      <h3 class="text-xl font-black">Условия доставки</h3>
      <ul class="mt-4 space-y-3 text-sm">
        <?php foreach ($view['condDelivery'] as $it): ?>
        <li class="flex gap-3 bg-white/10 rounded-xl p-4"><svg class="w-5 h-5 shrink-0 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
          <span><b><?= e($it['title']) ?></b><br><span class="text-white/85"><?= e($it['body']) ?></span></span></li>
        <?php endforeach; ?>
      </ul>
      <button @click="$dispatch('open-order')" class="mt-6 w-full bg-white text-brand-700 font-bold py-3 rounded-xl hover:bg-brand-50 transition">Оставить заявку</button>
    </div>
  </div>
</section>

<!-- ===== ФУТЕР ===== -->
<footer class="bg-brand-900 text-white/70 py-8 text-sm">
  <div class="max-w-7xl mx-auto px-4 space-y-3">
    <p class="leading-relaxed"><?= e($s['footer_disclaimer']) ?></p>
    <div class="flex flex-wrap gap-4">
      <a href="/privacy" class="underline hover:text-white">Согласие на обработку ПД</a>
      <a href="/agreement" class="underline hover:text-white">Пользовательское соглашение</a>
      <a href="/admin" class="underline hover:text-white">Вход для менеджеров</a>
    </div>
    <p>© <?= date('Y') ?> «<?= e($s['site_name']) ?>». Саратов / Энгельс.</p>
  </div>
</footer>

<!-- ===== Лайтбокс ===== -->
<div x-show="lb.open" x-cloak class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" @click.self="lb.open=false" @keydown.escape.window="lb.open=false">
  <img :src="lb.items[lb.i]" class="max-w-[92vw] max-h-[88vh] rounded-lg">
  <button x-show="lb.items.length>1" @click="lb.i=(lb.i+1)%lb.items.length" class="absolute right-4 text-white text-5xl">›</button>
  <button x-show="lb.items.length>1" @click="lb.i=(lb.i-1+lb.items.length)%lb.items.length" class="absolute left-4 text-white text-5xl">‹</button>
  <button @click="lb.open=false" class="absolute top-4 right-4 text-white text-3xl">&times;</button>
</div>

<!-- ===== МОДАЛЬНАЯ ФОРМА ЗАЯВКИ (пошаговая) ===== -->
<div x-show="modal.open" x-cloak class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" @click.self="modal.open=false" @keydown.escape.window="modal.open=false">
 <div class="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto" x-data="orderForm()" @open-order.window="start($event.detail)">
  <div class="flex items-center justify-between px-6 pt-5">
    <h3 class="text-xl font-black text-brand-700">Заявка <span class="text-sm font-normal text-slate-400">шаг <span x-text="step"></span> из 3</span></h3>
    <button @click="modalClose()" class="text-2xl text-slate-400 hover:text-slate-700">&times;</button>
  </div>
  <!-- Прогресс -->
  <div class="px-6 mt-3 flex gap-2"><template x-for="n in 3"><div class="h-1.5 flex-1 rounded-full" :class="step>=n?'bg-brand-500':'bg-brand-100'"></div></template></div>

  <form @submit.prevent="submitStep()" class="p-6 space-y-4">
    <!-- ШАГ 1: контакты и дата -->
    <template x-if="step===1">
      <div class="space-y-4">
        <div><label class="text-sm font-semibold">Ваше имя *</label><input x-model="f.name" class="mt-1 w-full rounded-xl border-slate-300 outline outline-1 focus:outline-brand-500 px-3 py-2" placeholder="Мария"></div>
        <div><label class="text-sm font-semibold">Телефон *</label>
          <input x-model="f.phone" @input="maskPhone($event)" inputmode="tel" class="mt-1 w-full rounded-xl outline outline-1 outline-slate-300 focus:outline-brand-500 px-3 py-2" placeholder="+7 (___) ___-__-__"></div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div><label class="text-sm font-semibold">Дата мероприятия *</label>
            <input type="date" x-model="f.date" :min="'<?= $today ?>'" @change="loadSlots()" class="mt-1 w-full rounded-xl outline outline-1 outline-slate-300 focus:outline-brand-500 px-3 py-2"></div>
          <div><label class="text-sm font-semibold">Время * <span class="text-xs text-slate-400">(только свободные, <?= e($view['schedule']['start_time'].'–'.$view['schedule']['end_time']) ?>)</span></label>
            <select x-model="f.time" class="mt-1 w-full rounded-xl outline outline-1 outline-slate-300 focus:outline-brand-500 px-3 py-2">
              <option value="">— выберите —</option>
              <template x-for="t in slots"><option :value="t" x-text="t"></option></template>
            </select>
            <p x-show="slots.length===0 && f.date" class="text-xs text-red-500 mt-1">Нет свободных слотов на эту дату — выберите другую.</p></div>
        </div>
        <div><label class="text-sm font-semibold">Адрес / турбаза / № беседки</label><input x-model="f.address" class="mt-1 w-full rounded-xl outline outline-1 outline-slate-300 focus:outline-brand-500 px-3 py-2" placeholder="Саратов, ул. Чернышевского 10 / база «Мечта», беседка 5"></div>
      </div>
    </template>

    <!-- ШАГ 2: персонаж, услуги, песни, комментарий -->
    <template x-if="step===2">
      <div class="space-y-4">
        <div><label class="text-sm font-semibold">Персонаж / шоу</label>
          <select x-model="f.character_id" class="mt-1 w-full rounded-xl outline outline-1 outline-slate-300 px-3 py-2">
            <option value="">— не выбран —</option>
            <?php foreach ($view['chars'] as $c): ?><option value="<?= $c['id'] ?>"><?= e($c['name']) ?> (от <?= money($c['price_from']) ?>)</option><?php endforeach; ?>
          </select></div>
        <div><label class="text-sm font-semibold">Список песен (до 3-х)</label>
          <template x-for="(song,i) in f.songs" :key="i">
            <div class="flex gap-2 mt-1"><input x-model="f.songs[i]" class="flex-1 rounded-xl outline outline-1 outline-slate-300 px-3 py-1.5 text-sm" :placeholder="'Песня '+(i+1)">
            <button type="button" @click="f.songs.splice(i,1)" class="text-red-400 px-2">×</button></div>
          </template>
          <button type="button" x-show="f.songs.length<3" @click="f.songs.push('')" class="text-brand-600 text-sm font-medium mt-1">+ добавить песню</button></div>
        <div><label class="text-sm font-semibold">Комментарий</label><textarea x-model="f.comment" rows="2" class="mt-1 w-full rounded-xl outline outline-1 outline-slate-300 px-3 py-2"></textarea></div>
      </div>
    </template>

    <!-- ШАГ 3: кросс-товары, сумма, согласие -->
    <template x-if="step===3">
      <div class="space-y-4">
        <div><label class="text-sm font-semibold">Дополнительно (кросс-товары)</label>
          <div class="mt-2 grid sm:grid-cols-2 gap-2">
            <?php foreach ($view['cross'] as $xp): ?>
            <label class="flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer hover:border-brand-400 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50">
              <input type="checkbox" @change="toggleCross(<?= $xp['id'] ?>, $event.target.checked)">
              <img src="<?= e($xp['photo_path']) ?>" class="w-10 h-10 rounded-lg object-cover" alt="">
              <span class="text-sm flex-1"><?= e($xp['name']) ?><br><b class="text-brand-600"><?= money($xp['price']) ?></b></span>
              <input type="number" min="1" max="20" x-show="crossQty[<?= $xp['id'] ?>]" x-model.number="crossQty[<?= $xp['id'] ?>]" class="w-14 rounded-lg outline outline-1 outline-slate-300 px-2 py-1 text-sm">
            </label>
            <?php endforeach; ?>
          </div></div>
        <div class="grid sm:grid-cols-2 gap-4">
          <div><label class="text-sm font-semibold">Сумма заказа, ₽</label><input type="number" min="0" x-model.number="f.total_amount" class="mt-1 w-full rounded-xl outline outline-1 outline-slate-300 px-3 py-2"></div>
          <div><label class="text-sm font-semibold">Предоплата вручную, ₽</label><input type="number" min="0" x-model.number="f.prepayment" class="mt-1 w-full rounded-xl outline outline-1 outline-slate-300 px-3 py-2"></div>
        </div>
        <p class="text-sm bg-brand-50 rounded-xl px-4 py-3">Остаток рассчитается автоматически: <b x-text="moneyFmt(f.total_amount - f.prepayment - crossSum())"></b></p>
        <label class="flex items-start gap-2 text-sm cursor-pointer">
          <input type="checkbox" x-model="f.pd_consent" class="mt-0.5 accent-brand-500">
          <span>Согласен на обработку персональных данных *</span>
        </label>
      </div>
    </template>

    <p x-show="err" x-text="err" class="text-sm text-red-600"></p>
    <div class="flex justify-between pt-2">
      <button type="button" x-show="step>1" @click="step--; err=''" class="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50">Назад</button>
      <button type="submit" :disabled="(step===3 && !f.pd_consent) || sending"
        class="ml-auto px-6 py-2.5 rounded-xl font-bold text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
        :class="step===3?'bg-brand-500 hover:bg-brand-600':'bg-brand-500 hover:bg-brand-600'"
        x-text="sending?'Отправка…':(step===3?'Отправить заявку':'Далее')"></button>
    </div>
  </form>
  <!-- Успех -->
  <div x-show="done" class="p-10 text-center">
    <div class="text-5xl">🎉</div><h4 class="text-xl font-black text-brand-700 mt-3">Заявка принята!</h4>
    <p class="text-slate-600 mt-2">Менеджер свяжется с вами в течение 15 минут. Ожидайте SMS/звонок на <b x-text="f.phone"></b>.</p>
    <button @click="modalClose()" class="mt-5 bg-brand-500 text-white px-6 py-2.5 rounded-xl font-bold">Готово</button>
  </div>
 </div>
</div>

<script>
// Глобальный компонент: параллакс hero/подписки, лайтбокс, истории, состояние модалки
function landingApp(){ return {
  px:0, py:0, sx:0, sy:0, subMsg:'',
  modal:{open:false},
  lb:{open:false, items:[], i:0},
  storyIdx:null, storyUrl:'', storyCaption:'', storySeg:'image', storyPct:0, _t:null,
  heroMove(e){ const r=e.currentTarget.getBoundingClientRect();
    this.px=((e.clientX-r.left)/r.width-.5)*-24; this.py=((e.clientY-r.top)/r.height-.5)*-24;
    this.sx=this.px*.6; this.sy=this.py*.6; },
  heroReset(){ this.px=this.py=this.sx=this.sy=0 },
  lightbox(items,i=0){ this.lb={open:true,items,i} },
  async subscribe(form){ const fd=new FormData(form);
    const res=await fetch('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email:fd.get('email'),pd_consent:!!fd.get('pd_consent')})}).then(r=>r.json());
    this.subMsg = res.ok ? 'Спасибо! Промокод уже летит на вашу почту 🎁' : (res.error||'Ошибка, попробуйте позже');
    if(res.ok) form.reset(); },
  playStory(i){ this.storyIdx=i; this.showStory() },
  showStory(){ const st=<?= json_encode(array_map(fn($x)=>['t'=>$x['media_type'],'u'=>$x['media_url'],'c'=>$x['caption'],'sec'=>(int)$x['view_seconds']], $view['stories']), JSON_UNESCAPED_UNICODE) ?>;
    const s=st[this.storyIdx]; if(!s){this.closeStory();return}
    this.storyUrl=s.u; this.storyCaption=s.c; this.storySeg=s.t; this.storyPct=0; clearInterval(this._t);
    if(s.t==='image'){ const step=100/(s.sec*10); this._t=setInterval(()=>{ this.storyPct+=step;
      if(this.storyPct>=100) this.nextStory(); },100); } },
  nextStory(){ this.storyIdx++; if(this.storyIdx >= <?= count($view['stories']) ?>) this.closeStory(); else this.showStory(); },
  closeStory(){ clearInterval(this._t); this.storyIdx=null; },
  moneyFmt(v){ return (v||0).toLocaleString('ru-RU')+' ₽' },
}}
// Форма заявки: шаги, маска +7, динамические слоты, отправка в /api/orders
function orderForm(){ return {
  step:1, sending:false, done:false, err:'', slots:[], crossQty:{},
  f:{name:'',phone:'',date:'<?= $today ?>',time:'',address:'',character_id:'',songs:[''],comment:'',total_amount:0,prepayment:0,pd_consent:false},
  start(d){ window.landingModal?.open=true; this.step=1; this.done=false; this.err='';
    if(d?.cid) this.f.character_id=d.cid; this.loadSlots(); },
  maskPhone(e){ let v=e.target.value.replace(/\D/g,''); if(v[0]==='8')v='7'+v.slice(1); if(v[0]!=='7')v='7'+v; v=v.slice(0,11);
    let out='+7'; if(v.length>1)out+=' ('+v.slice(1,4); if(v.length>=4)out+=') '+v.slice(4,7);
    if(v.length>=7)out+='-'+v.slice(7,9); if(v.length>=9)out+='-'+v.slice(9,11); e.target.value=out; },
  toggleCross(id,on){ if(on) this.crossQty[id]=1; else delete this.crossQty[id]; },
  crossSum(){ const prices=<?= json_encode(array_combine(array_column($view['cross'],'id'), array_column($view['cross'],'price'))) ?>;
    let s=0; for(const [id,q] of Object.entries(this.crossQty)) s+=prices[id]*(q||1); return s },
  async loadSlots(){ if(!this.f.date) return;
    const r=await fetch(`/api/slots?date=${this.f.date}&duration=40`).then(x=>x.json()); this.slots=r.slots; },
  submitStep(){ this.err='';
    if(this.step===1){ if(this.f.name.trim().length<2)return this.err='Укажите имя';
      if(this.f.phone.replace(/\D/g,'').length!==11)return this.err='Введите телефон полностью';
      if(!this.f.time)return this.err='Выберите свободное время'; this.step=2; return; }
    if(this.step===2){ this.step=3; return; }
    this.send(); },
  async send(){ this.sending=true;
    const body={...this.f, songs:this.f.songs.filter(Boolean).slice(0,3),
      cross_items:Object.entries(this.crossQty).map(([product_id,qty])=>({product_id:+product_id,qty}))};
    try{ const res=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const j=await res.json();
      if(j.ok){ this.done=true; } else { this.err=Object.values(j.errors||{}).join('. '); if(j.status===409)this.loadSlots(); } }
    catch(e){ this.err='Сервер недоступен, попробуйте позже'; }
    this.sending=false; },
  modalClose(){ document.querySelector('[x-data="landingApp()"]') && (Alpine.$data(document.body).modal.open=false); this.done=false; },
}}
// Проброс события открытия модалки (x-dispatch → глобальное состояние)
document.addEventListener('alpine:init',()=>{})
window.addEventListener('DOMContentLoaded',()=>{ document.body.addEventListener('open-order',(ev)=>{ Alpine.$data(document.body).modal.open=true; }); });
</script>
<style>[x-cloak]{display:none!important}</style>
</body>
</html>
