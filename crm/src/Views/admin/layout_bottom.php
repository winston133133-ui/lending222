    </div>
  </main>
</div>
<!-- Модалка списка уведомлений -->
<div x-show="notifOpen" class="fixed inset-0 z-50 bg-black/40 grid place-items-center" @click="notifOpen=false" x-cloak>
  <div class="bg-white rounded-2xl p-5 w-[min(92vw,480px)] max-h-[70vh] overflow-auto" @click.stop>
    <h3 class="font-bold mb-3">Уведомления</h3>
    <template x-for="n in notifications" :key="n.id">
      <a :href="'/admin/orders/'+ (n.payload.order_id||'')" class="block border-b py-2 text-sm hover:bg-purple-50 rounded">
        <b x-text="n.type === 'new_order' ? 'Новая заявка' : n.type"></b>
        <span class="text-slate-400 float-right" x-text="n.created_at"></span>
        <div class="text-slate-600" x-text="JSON.stringify(n.payload)"></div></a></template>
    <p x-show="!notifications.length" class="text-sm text-slate-500">Пока пусто — новые заявки с сайта появятся здесь без перезагрузки страницы.</p>
  </div>
</div>
<script>
// Оболочка админки: long-polling очереди уведомлений (заявки с сайта прилетают мгновенно)
function crmShell(){ return {
  unread: 0, toasts: [], notifications: [], notifOpen: false, since: <?= (int)(DB::row('SELECT COALESCE(MAX(id),0) m FROM pending_notifications')['m'] ?? 0) ?>,
  openNotifs(){ this.notifOpen = true; this.unread = 0; },
  init(){ this.poll(); },
  async poll(){
    const tick = async () => {
      try {
        const r = await fetch('/api/admin/notifications?since=' + this.since, {headers:{'Accept':'application/json'}});
        const j = await r.json();
        if (j.items?.length){
          this.since = j.since;
          for (const it of j.items){
            this.notifications.unshift(it); this.unread++;
            const p = it.payload || {};
            this.toasts.push({id: it.id, title: it.type==='new_order'?'🎉 Новая заявка #'+(p.order_id??''):it.type,
              text: p.customer_name ? `${p.customer_name}, ${p.event_date??''} ${p.event_time??''}` : 'Заявка с сайта',
              link: '/admin/orders/' + (p.order_id ?? '')});
            setTimeout(() => this.toasts.shift(), 8000);
          }
        } else this.since = j.since ?? this.since;
      } catch(e){}
      setTimeout(tick, 4000);
    };
    tick();
  }
}}
// Универсальный POST с CSRF (кнопки статусов, удаления и т.п.)
async function post(url, data){
  const body = new URLSearchParams(data||{}); body.append('_token', document.querySelector('meta[name=csrf-token]').content);
  const r = await fetch(url, {method:'POST', body, headers:{'Accept':'application/json'}});
  return r.json().catch(()=>({ok:r.ok}));
}
</script></body></html>
