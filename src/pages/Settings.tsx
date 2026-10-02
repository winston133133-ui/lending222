import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import type { Character, CharacterService, WorkConditionSection, HowToOrderStep, PaymentMethod, ContactLink, Story, WorkSchedule } from '../types';
import { Save, Plus, Trash2, Edit2, X, Phone, MessageCircle, Send, MapPin, FileText, Users, Shield, Sparkles, Upload, Globe, Star, Truck, Image as ImageIcon, MessageSquare, Clock, Bell, Mail } from 'lucide-react';

type Tab = 'characters' | 'contacts' | 'texts' | 'conditions' | 'howtoorder' | 'gallery' | 'crossproducts' | 'notifications' | 'seo' | 'reviews' | 'users' | 'stories' | 'schedule' | 'subscription';

export default function Settings() {
  const { currentUser } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('characters');

  if (currentUser?.role !== 'ADMIN') {
    return <div className="text-center py-12"><Shield className="mx-auto text-red-400 mb-4" size={48} /><h2 className="text-xl font-bold text-gray-700">Доступ запрещён</h2><button onClick={() => navigate('/crm')} className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Вернуться</button></div>;
  }

  const tabs = [
    { id: 'characters' as Tab, label: 'Персонажи', icon: Users },
    { id: 'crossproducts' as Tab, label: 'Кросс-товары', icon: Sparkles },
    { id: 'stories' as Tab, label: 'Истории', icon: ImageIcon },
    { id: 'gallery' as Tab, label: 'Галерея', icon: ImageIcon },
    { id: 'subscription' as Tab, label: 'Подписка', icon: Mail },
    { id: 'reviews' as Tab, label: 'Отзывы', icon: Star },
    { id: 'texts' as Tab, label: 'Тексты', icon: FileText },
    { id: 'contacts' as Tab, label: 'Контакты', icon: Phone },
    { id: 'conditions' as Tab, label: 'Условия и оплата', icon: FileText },
    { id: 'howtoorder' as Tab, label: 'Как заказать', icon: Sparkles },
    { id: 'schedule' as Tab, label: 'Режим работы', icon: Clock },
    { id: 'notifications' as Tab, label: 'Уведомления', icon: Bell },
    { id: 'seo' as Tab, label: 'SEO', icon: Globe },
    { id: 'users' as Tab, label: 'Пользователи', icon: Shield },
  ];

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Настройки сайта</h1>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            <tab.icon size={16} />{tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'characters' && <CharactersTab />}
      {activeTab === 'contacts' && <ContactsTab />}
      {activeTab === 'texts' && <TextsTab />}
      {activeTab === 'conditions' && <ConditionsAndPaymentTab />}
      {activeTab === 'howtoorder' && <HowToOrderTab />}
      {activeTab === 'gallery' && <GalleryTab />}
      {activeTab === 'crossproducts' && <CrossProductsTab />}
      {activeTab === 'stories' && <StoriesTab />}
      {activeTab === 'schedule' && <ScheduleTab />}
      {activeTab === 'subscription' && <SubscriptionTab />}
      {activeTab === 'notifications' && <NotificationsTab />}
      {activeTab === 'seo' && <SeoTab />}
      {activeTab === 'reviews' && <ReviewsTab />}
      {activeTab === 'users' && <UsersTab />}
    </div>
  );
}

function CharactersTab() {
  const { characters = [], addCharacter, updateCharacter, deleteCharacter } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', gallery: [] as string[], services: [{ id: '', name: '', description: '', duration: 20, price: 0 }], seoTitle: '', seoDescription: '', seoKeywords: '', isActive: true });
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (editingId) updateCharacter(editingId, form);
    else addCharacter({ id: Date.now().toString(), ...form, services: form.services.map((s, i) => ({ ...s, id: s.id || `s-${Date.now()}-${i}` })) });
    setForm({ name: '', description: '', gallery: [], services: [{ id: '', name: '', description: '', duration: 20, price: 0 }], seoTitle: '', seoDescription: '', seoKeywords: '', isActive: true });
    setShowForm(false); setEditingId(null);
  };

  const startEdit = (char: Character) => {
    setForm({ name: char.name, description: char.description, gallery: char.gallery || [], services: (char.services || []).length > 0 ? char.services.map(s => ({ ...s, description: s.description || '' })) : [{ id: '', name: '', description: '', duration: 20, price: 0 }], seoTitle: char.seoTitle, seoDescription: char.seoDescription, seoKeywords: char.seoKeywords, isActive: char.isActive });
    setEditingId(char.id); setShowForm(true);
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => { setForm((p) => ({ ...p, gallery: [...p.gallery, ev.target?.result as string] })); };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold">Управление персонажами</h2><button onClick={() => { setForm({ name: '', description: '', gallery: [], services: [{ id: '', name: '', description: '', duration: 20, price: 0 }], seoTitle: '', seoDescription: '', seoKeywords: '', isActive: true }); setShowForm(true); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm"><Plus size={16} />Добавить</button></div>
      {showForm && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100 space-y-4">
          <h3 className="font-medium">{editingId ? 'Редактирование' : 'Новый персонаж'}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Название *</label><input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            <div className="flex items-end"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 text-purple-600 rounded" /><span className="text-sm font-medium">Активен</span></label></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Описание</label><textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} /></div>
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2"><ImageIcon size={14} />Галерея</label>
            <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
            <div className="flex flex-wrap gap-2 mb-2">
              {form.gallery.map((img, i) => (
                <div key={i} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setForm(p => ({ ...p, gallery: p.gallery.filter((_, idx) => idx !== i) }))} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5"><X size={12} /></button>
                </div>
              ))}
              <button onClick={() => galleryInputRef.current?.click()} className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-purple-400"><Upload size={20} className="text-gray-400" /></button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2"><Clock size={14} />Услуги</label>
            <div className="space-y-2">
              {form.services.map((service, i) => (
                <div key={i} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                  <div className="flex gap-2 items-start">
                    <div className="flex-1"><input type="text" value={service.name} onChange={(e) => setForm(p => ({ ...p, services: p.services.map((s, idx) => idx === i ? { ...s, name: e.target.value } : s) }))} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" placeholder="Название" /></div>
                    <div className="w-24"><input type="number" value={service.duration} onChange={(e) => setForm(p => ({ ...p, services: p.services.map((s, idx) => idx === i ? { ...s, duration: Number(e.target.value) } : s) }))} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" placeholder="Мин" /></div>
                    <div className="w-28"><input type="number" value={service.price} onChange={(e) => setForm(p => ({ ...p, services: p.services.map((s, idx) => idx === i ? { ...s, price: Number(e.target.value) } : s) }))} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" placeholder="Цена ₽" /></div>
                    <button onClick={() => setForm(p => ({ ...p, services: p.services.filter((_, idx) => idx !== i) }))} className="p-1.5 text-red-500 hover:bg-red-50 rounded" disabled={form.services.length <= 1}><Trash2 size={14} /></button>
                  </div>
                  <div>
                    <textarea value={service.description} onChange={(e) => setForm(p => ({ ...p, services: p.services.map((s, idx) => idx === i ? { ...s, description: e.target.value } : s) }))} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm resize-none" placeholder="Описание услуги (можно использовать переносы строк)" rows={3} />
                    <p className="text-xs text-gray-500 mt-1">💡 Используйте Enter для переноса строк</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setForm(p => ({ ...p, services: [...p.services, { id: '', name: '', description: '', duration: 20, price: 0 }] }))} className="mt-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"><Plus size={14} />Добавить услугу</button>
          </div>
          <div className="flex gap-2"><button onClick={handleSave} disabled={!form.name} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"><Save size={14} />Сохранить</button><button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Отмена</button></div>
        </div>
      )}
      <div className="space-y-3">
        {characters.map((char) => (
          <div key={char.id} className={`p-4 rounded-lg border ${char.isActive ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1"><h3 className="font-medium">{char.name}</h3>{!char.isActive && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Скрыт</span>}</div>
                <p className="text-sm text-gray-500 mb-2">{char.description}</p>
                <div className="flex flex-wrap gap-2 mb-2">{(char.services || []).map((s) => <span key={s.id} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{s.name}: {s.duration} мин · {s.price.toLocaleString()} ₽</span>)}</div>
                {(char.gallery || []).length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {(char.gallery || []).slice(0, 4).map((img, i) => (<img key={i} src={img} alt="" className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded" />))}
                    {(char.gallery || []).length > 4 && (<span className="text-xs text-gray-400 self-center">+{(char.gallery || []).length - 4}</span>)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(char)} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"><Edit2 size={16} /></button>
                <button onClick={() => { if (confirm('Удалить персонажа?')) deleteCharacter(char.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



function StoriesTab() {
  const { stories = [], addStory, updateStory, deleteStory } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: 'photo' as 'photo' | 'video', media: '', title: '', description: '', isActive: true });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (editingId) updateStory(editingId, form);
    else addStory({ id: Date.now().toString(), ...form, createdAt: new Date().toISOString().split('T')[0] });
    setForm({ type: 'photo', media: '', title: '', description: '', isActive: true });
    setShowForm(false); setEditingId(null);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setForm(p => ({ ...p, media: ev.target?.result as string })); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-lg font-bold">Истории</h2><p className="text-sm text-gray-500 mt-1">Фото и видео с праздников</p></div>
        <button onClick={() => { setForm({ type: 'photo', media: '', title: '', description: '', isActive: true }); setShowForm(true); setEditingId(null); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm"><Plus size={16} />Добавить</button>
      </div>
      {showForm && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100 space-y-3">
          <h3 className="font-medium">{editingId ? 'Редактирование' : 'Новая история'}</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Тип</label><select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value as any }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="photo">📷 Фото</option><option value="video">🎥 Видео</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Название *</label><input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="День рождения Миши" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Описание</label><textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Незабываемый праздник!" /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Медиа *</label>
            <input ref={fileInputRef} type="file" accept={form.type === 'video' ? 'video/*' : 'image/*'} onChange={handleMediaUpload} className="hidden" />
            <div className="flex items-center gap-3">
              {form.media ? (form.type === 'video' ? <video src={form.media} className="w-32 h-32 object-cover rounded-lg" controls /> : <img src={form.media} alt="" className="w-32 h-32 object-cover rounded-lg" />) : <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400 text-xs">Нет медиа</div>}
              <div className="flex flex-col gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="bg-white border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1"><Upload size={14} />Загрузить</button>
                {form.media && <button onClick={() => setForm(p => ({ ...p, media: '' }))} className="text-red-500 text-xs">Удалить</button>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 text-purple-600 rounded" /><label className="text-sm font-medium">Опубликовано</label></div>
          <div className="flex gap-2"><button onClick={handleSave} disabled={!form.title || !form.media} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"><Save size={14} />{editingId ? 'Обновить' : 'Создать'}</button><button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Отмена</button></div>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(stories || []).map((story) => (
          <div key={story.id} className={`relative group rounded-xl overflow-hidden shadow-md ${!story.isActive ? 'opacity-50' : ''}`}>
            {story.type === 'video' ? <video src={story.media} className="w-full h-48 object-cover" /> : <img src={story.media} alt={story.title} className="w-full h-48 object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              <p className="text-white text-sm font-medium mb-1">{story.title}</p>
              <div className="flex gap-2">
                <button onClick={() => { setForm({ type: story.type, media: story.media, title: story.title, description: story.description || '', isActive: story.isActive }); setEditingId(story.id); setShowForm(true); }} className="flex-1 bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-lg flex items-center justify-center"><Edit2 size={14} /></button>
                <button onClick={() => { if (confirm('Удалить историю?')) deleteStory(story.id); }} className="flex-1 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-lg flex items-center justify-center"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {(stories || []).length === 0 && <div className="text-center py-12 text-gray-400"><ImageIcon size={48} className="mx-auto mb-3 opacity-50" /><p>Историй пока нет</p></div>}
    </div>
  );
}

function ScheduleTab() {
  const { workSchedule = [], updateWorkSchedule } = useStore();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold mb-2">Режим работы</h2>
      <p className="text-sm text-gray-500 mb-6">Настройте рабочие часы. Эти ограничения будут применяться к форме заявки.</p>
      <div className="space-y-3 max-w-2xl">
        {workSchedule.map((schedule) => (
          <div key={schedule.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 w-32">
              <input type="checkbox" checked={schedule.isActive} onChange={(e) => updateWorkSchedule(schedule.id, { isActive: e.target.checked })} className="w-4 h-4 text-purple-600 rounded" />
              <span className="font-medium text-sm">{schedule.day}</span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <input type="time" value={schedule.startTime} onChange={(e) => updateWorkSchedule(schedule.id, { startTime: e.target.value })} className="border border-gray-300 rounded px-2 py-1 text-sm" />
              <span className="text-gray-500">—</span>
              <input type="time" value={schedule.endTime} onChange={(e) => updateWorkSchedule(schedule.id, { endTime: e.target.value })} className="border border-gray-300 rounded px-2 py-1 text-sm" />
            </div>
          </div>
        ))}
      </div>
      <button onClick={handleSave} className="mt-6 bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 flex items-center gap-2"><Save size={16} />{saved ? 'Сохранено ✓' : 'Сохранить'}</button>
    </div>
  );
}

function SubscriptionTab() {
  const { settings, updateSettings } = useStore();
  const [form, setForm] = useState({ subscriptionEnabled: settings.subscriptionEnabled, subscriptionTitle: settings.subscriptionTitle, subscriptionDescription: settings.subscriptionDescription, subscriptionImage: settings.subscriptionImage || '' });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const base64 = ev.target?.result as string;
          setForm(p => ({ ...p, subscriptionImage: base64 }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold mb-2">Настройки подписки</h2>
      <p className="text-sm text-gray-500 mb-6">Управление формой подписки на обновления</p>
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-2"><input type="checkbox" checked={form.subscriptionEnabled} onChange={(e) => setForm(p => ({ ...p, subscriptionEnabled: e.target.checked }))} className="w-4 h-4 text-purple-600 rounded" /><label className="text-sm font-medium">Включить форму подписки</label></div>
        {form.subscriptionEnabled && (
          <>
            <div><label className="block text-sm font-medium mb-1">Заголовок</label><input type="text" value={form.subscriptionTitle} onChange={(e) => setForm(p => ({ ...p, subscriptionTitle: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Описание</label><textarea value={form.subscriptionDescription} onChange={(e) => setForm(p => ({ ...p, subscriptionDescription: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} /></div>
            <div>
              <label className="block text-sm font-medium mb-1">Изображение (справа)</label>
              <div className="flex items-center gap-3">
                {form.subscriptionImage && <img src={form.subscriptionImage} alt="" className="w-24 h-24 object-cover rounded-lg border" />}
                <div className="flex gap-2">
                  <button onClick={handleImageUpload} className="bg-white border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1"><Upload size={14} />Загрузить</button>
                  {form.subscriptionImage && <button onClick={() => setForm(p => ({ ...p, subscriptionImage: '' }))} className="text-red-500 text-sm hover:text-red-600">Удалить</button>}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Рекомендуемый размер: 400×400px</p>
            </div>
          </>
        )}
        <button onClick={handleSave} className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 flex items-center gap-2"><Save size={16} />{saved ? 'Сохранено ✓' : 'Сохранить'}</button>
      </div>
    </div>
  );
}

function ContactsTab() {
  const { settings, updateSettings, contactLinks = [], addContactLink, updateContactLink, deleteContactLink } = useStore();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkForm, setLinkForm] = useState<{ type: 'phone' | 'whatsapp' | 'telegram' | 'max' | 'email' | 'address', icon: string, label: string, value: string, link: string, isActive: boolean }>({ type: 'phone', icon: '📞', label: '', value: '', link: '', isActive: true });

  const handleSave = () => { 
    updateSettings(form); 
    setSaved(true); 
    setTimeout(() => setSaved(false), 2000); 
  };

  const handleSaveLink = () => {
    if (editingLinkId) {
      updateContactLink(editingLinkId, linkForm);
    } else {
      addContactLink({ id: Date.now().toString(), ...linkForm });
    }
    setLinkForm({ type: 'phone', icon: '📞', label: '', value: '', link: '', isActive: true });
    setShowLinkForm(false);
    setEditingLinkId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold">Контакты</h2>
          <p className="text-sm text-gray-500 mt-1">Управление контактными данными на лендинге</p>
        </div>
        <button onClick={() => { setLinkForm({ type: 'phone', icon: '📞', label: '', value: '', link: '', isActive: true }); setShowLinkForm(true); setEditingLinkId(null); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm"><Plus size={16} />Добавить контакт</button>
      </div>

        {showLinkForm && (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100 space-y-3">
            <h3 className="font-medium">{editingLinkId ? 'Редактирование' : 'Новая ссылка'}</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium mb-1">Тип</label><select value={linkForm.type} onChange={(e) => setLinkForm(p => ({ ...p, type: e.target.value as any }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="phone">📞 Телефон</option><option value="whatsapp">💬 WhatsApp</option><option value="telegram">✈️ Telegram</option><option value="max">💭 Макс</option><option value="email">📧 Email</option><option value="address">📍 Адрес</option></select></div>
              <div><label className="block text-sm font-medium mb-1">Иконка (эмодзи)</label><input type="text" value={linkForm.icon} onChange={(e) => setLinkForm(p => ({ ...p, icon: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="📞" /></div>
              <div><label className="block text-sm font-medium mb-1">Название</label><input type="text" value={linkForm.label} onChange={(e) => setLinkForm(p => ({ ...p, label: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Телефон" /></div>
              <div><label className="block text-sm font-medium mb-1">Значение</label><input type="text" value={linkForm.value} onChange={(e) => setLinkForm(p => ({ ...p, value: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="+7 (999) 123-45-67" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Ссылка</label><input type="text" value={linkForm.link} onChange={(e) => setLinkForm(p => ({ ...p, link: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="tel:+79991234567 или https://..." /></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" checked={linkForm.isActive} onChange={(e) => setLinkForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 text-purple-600 rounded" /><label className="text-sm font-medium">Активна</label></div>
            <div className="flex gap-2"><button onClick={handleSaveLink} disabled={!linkForm.label || !linkForm.value} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"><Save size={14} />{editingLinkId ? 'Обновить' : 'Создать'}</button><button onClick={() => { setShowLinkForm(false); setEditingLinkId(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Отмена</button></div>
          </div>
        )}

        <div className="space-y-3">
          {(contactLinks || []).map((link) => (
            <div key={link.id} className={`flex items-center justify-between p-4 border rounded-lg ${link.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{link.icon}</span>
                <div><p className="font-medium">{link.label}</p><p className="text-sm text-gray-500">{link.value}</p><p className="text-xs text-gray-400 mt-1">{link.link}</p></div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setLinkForm({ type: link.type, icon: link.icon, label: link.label, value: link.value, link: link.link, isActive: link.isActive }); setEditingLinkId(link.id); setShowLinkForm(true); }} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"><Edit2 size={16} /></button>
                <button onClick={() => { if (confirm('Удалить контакт?')) deleteContactLink(link.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}

function TextsTab() {
  const { settings, updateSettings } = useStore();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  
  const handleSave = () => { 
    updateSettings(form); 
    setSaved(true); 
    setTimeout(() => setSaved(false), 2000); 
  };

  const handleImageUpload = (field: 'heroImage' | 'heroBackgroundImage' | 'logo' | 'icon') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const base64 = ev.target?.result as string;
          setForm(p => ({ ...p, [field]: base64 }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold mb-6">Тексты и изображения</h2>
      <div className="space-y-6 max-w-3xl">
        <div className="border border-purple-200 rounded-lg p-4 bg-purple-50/30">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><ImageIcon size={16} className="text-purple-600" />Hero-секция</h3>
          <div className="space-y-3">
            <div><label className="block text-sm font-medium mb-1">Заголовок</label><input type="text" value={form.heroTitle} onChange={(e) => setForm(p => ({ ...p, heroTitle: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Подзаголовок</label><textarea value={form.heroSubtitle} onChange={(e) => setForm(p => ({ ...p, heroSubtitle: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} /></div>
            <div>
              <label className="block text-sm font-medium mb-1">Изображение Hero (правый блок с анимацией)</label>
              <div className="flex items-center gap-3">
                {form.heroImage && <img src={form.heroImage} alt="" className="w-24 h-24 object-cover rounded-lg border" />}
                <div className="flex gap-2">
                  <button onClick={() => handleImageUpload('heroImage')} className="bg-white border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1"><Upload size={14} />Загрузить</button>
                  {form.heroImage && <button onClick={() => setForm(p => ({ ...p, heroImage: '' }))} className="text-red-500 text-sm hover:text-red-600">Удалить</button>}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Рекомендуемый размер: 800×600px</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Фоновое изображение Hero</label>
              <div className="flex items-center gap-3">
                {form.heroBackgroundImage && <img src={form.heroBackgroundImage} alt="" className="w-24 h-24 object-cover rounded-lg border" />}
                <div className="flex gap-2">
                  <button onClick={() => handleImageUpload('heroBackgroundImage')} className="bg-white border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1"><Upload size={14} />Загрузить</button>
                  {form.heroBackgroundImage && <button onClick={() => setForm(p => ({ ...p, heroBackgroundImage: '' }))} className="text-red-500 text-sm hover:text-red-600">Удалить</button>}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Рекомендуемый размер: 1920×1080px (будет отображаться под градиентом)</p>
            </div>
          </div>
        </div>

        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/30">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Sparkles size={16} className="text-blue-600" />Логотип и иконка</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Логотип (шапка сайта)</label>
              <div className="flex items-center gap-3">
                {form.logo ? <img src={form.logo} alt="Логотип" className="w-32 h-16 object-contain rounded border bg-white p-1" /> : <div className="w-32 h-16 border-2 border-dashed rounded flex items-center justify-center text-gray-400 text-xs">Нет логотипа</div>}
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleImageUpload('logo')} className="bg-white border border-gray-300 px-3 py-1.5 rounded text-xs hover:bg-gray-50 flex items-center gap-1"><Upload size={12} />Загрузить</button>
                {form.logo && <button onClick={() => setForm(p => ({ ...p, logo: '' }))} className="text-red-500 text-xs">Удалить</button>}
              </div>
              <p className="text-xs text-gray-500 mt-1">Рекомендуемый размер: 200×60px, PNG с прозрачностью</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Иконка (favicon)</label>
              <div className="flex items-center gap-3">
                {form.icon ? <img src={form.icon} alt="Иконка" className="w-16 h-16 object-contain rounded border bg-white p-1" /> : <div className="w-16 h-16 border-2 border-dashed rounded flex items-center justify-center text-gray-400 text-xs">Нет</div>}
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleImageUpload('icon')} className="bg-white border border-gray-300 px-3 py-1.5 rounded text-xs hover:bg-gray-50 flex items-center gap-1"><Upload size={12} />Загрузить</button>
                {form.icon && <button onClick={() => setForm(p => ({ ...p, icon: '' }))} className="text-red-500 text-xs">Удалить</button>}
              </div>
              <p className="text-xs text-gray-500 mt-1">Рекомендуемый размер: 64×64px, квадрат</p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Условия (кратко)</h3>
          <div className="space-y-3">
            <div><label className="block text-sm font-medium mb-1">Условия доставки</label><textarea value={form.deliveryConditions} onChange={(e) => setForm(p => ({ ...p, deliveryConditions: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} /></div>
            <div><label className="block text-sm font-medium mb-1">Правила работы</label><textarea value={form.workRules} onChange={(e) => setForm(p => ({ ...p, workRules: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} /></div>
          </div>
        </div>

        <button onClick={handleSave} className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 flex items-center gap-2"><Save size={16} />{saved ? 'Сохранено ✓' : 'Сохранить'}</button>
      </div>
    </div>
  );
}

function ConditionsAndPaymentTab() {
  const { settings, updateSettings } = useStore();
  const [sections, setSections] = useState(settings.workConditionSections || []);
  const [methods, setMethods] = useState<PaymentMethod[]>(settings.paymentMethods || []);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings({ ...settings, workConditionSections: sections, paymentMethods: methods });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Conditions functions
  const addSection = () => {
    setSections([...sections, { id: Date.now().toString(), title: 'Новый раздел', icon: '📝', type: 'info', items: [''] }]);
  };

  const updateSection = (id: string, data: Partial<WorkConditionSection>) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteSection = (id: string) => {
    if (confirm('Удалить этот раздел?')) setSections(sections.filter(s => s.id !== id));
  };

  const addItem = (sectionId: string) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, items: [...s.items, ''] } : s));
  };

  const updateItem = (sectionId: string, itemIndex: number, value: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const newItems = [...s.items];
        newItems[itemIndex] = value;
        return { ...s, items: newItems };
      }
      return s;
    }));
  };

  const deleteItem = (sectionId: string, itemIndex: number) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, items: s.items.filter((_, i) => i !== itemIndex) } : s));
  };

  // Payment methods functions
  const addMethod = () => {
    setMethods([...methods, { id: Date.now().toString(), title: 'Новый способ оплаты', icon: '💳', subtitle: 'Описание', items: [''], warning: '', color: 'green', isActive: true }]);
  };

  const updateMethod = (id: string, data: Partial<PaymentMethod>) => {
    setMethods(methods.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const deleteMethod = (id: string) => {
    if (confirm('Удалить этот способ оплаты?')) setMethods(methods.filter(m => m.id !== id));
  };

  const addMethodItem = (methodId: string) => {
    setMethods(methods.map(m => m.id === methodId ? { ...m, items: [...m.items, ''] } : m));
  };

  const updateMethodItem = (methodId: string, itemIndex: number, value: string) => {
    setMethods(methods.map(m => {
      if (m.id === methodId) {
        const newItems = [...m.items];
        newItems[itemIndex] = value;
        return { ...m, items: newItems };
      }
      return m;
    }));
  };

  const deleteMethodItem = (methodId: string, itemIndex: number) => {
    setMethods(methods.map(m => m.id === methodId ? { ...m, items: m.items.filter((_, i) => i !== itemIndex) } : m));
  };

  const colorOptions = [
    { value: 'green', label: '🟢 Зелёный' },
    { value: 'blue', label: '🔵 Синий' },
    { value: 'purple', label: '🟣 Фиолетовый' },
    { value: 'orange', label: '🟠 Оранжевый' }
  ];

  return (
    <div className="space-y-6">
      {/* Условия работы и доставки */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div><h2 className="text-lg font-bold flex items-center gap-2"><span className="text-xl">📋</span>Условия работы и доставки</h2><p className="text-sm text-gray-500 mt-1">Структурированное редактирование условий</p></div>
          <button onClick={addSection} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm"><Plus size={16} />Добавить раздел</button>
        </div>
        <div className="space-y-6 max-w-4xl">
          {sections.map((section) => (
            <div key={section.id} className={`border-2 rounded-lg p-4 ${section.type === 'warning' ? 'border-red-300 bg-red-50' : section.type === 'rules' ? 'border-green-300 bg-green-50' : 'border-blue-300 bg-blue-50'}`}>
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <input type="text" value={section.icon} onChange={(e) => updateSection(section.id, { icon: e.target.value })} className="w-16 border border-gray-300 rounded px-2 py-1 text-center text-xl" placeholder="📝" />
                    <input type="text" value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} className="flex-1 border border-gray-300 rounded px-3 py-1 font-semibold" placeholder="Название раздела" />
                  </div>
                  <div><label className="text-xs text-gray-600 mb-1 block">Тип раздела:</label><select value={section.type} onChange={(e) => updateSection(section.id, { type: e.target.value as any })} className="border border-gray-300 rounded px-2 py-1 text-sm"><option value="info">ℹ️ Информация (синий)</option><option value="warning">⚠️ Предупреждение (красный)</option><option value="rules">📝 Правила (зелёный)</option></select></div>
                </div>
                <button onClick={() => deleteSection(section.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18} /></button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Пункты:</label>
                {section.items.map((item, idx) => (<div key={idx} className="flex gap-2"><input type="text" value={item} onChange={(e) => updateItem(section.id, idx, e.target.value)} className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Текст пункта" /><button onClick={() => deleteItem(section.id, idx)} className="text-red-500 hover:text-red-700 p-1"><X size={16} /></button></div>))}
                <button onClick={() => addItem(section.id)} className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 mt-2"><Plus size={14} />Добавить пункт</button>
              </div>
            </div>
          ))}
          {sections.length === 0 && <div className="text-center py-12 text-gray-400"><FileText size={48} className="mx-auto mb-3 opacity-50" /><p>Разделы не добавлены</p></div>}
        </div>
      </div>

      {/* Способы оплаты */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div><h2 className="text-lg font-bold flex items-center gap-2"><span className="text-xl">💳</span>Способы оплаты</h2><p className="text-sm text-gray-500 mt-1">Управление способами оплаты на сайте</p></div>
          <button onClick={addMethod} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm"><Plus size={16} />Добавить способ</button>
        </div>
        <div className="space-y-6 max-w-4xl">
          {methods.map((method) => (
            <div key={method.id} className={`border-2 rounded-lg p-4 ${method.color === 'green' ? 'border-green-300 bg-green-50' : method.color === 'blue' ? 'border-blue-300 bg-blue-50' : method.color === 'purple' ? 'border-purple-300 bg-purple-50' : 'border-orange-300 bg-orange-50'}`}>
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-xs text-gray-600 mb-1 block">Иконка</label><input type="text" value={method.icon} onChange={(e) => updateMethod(method.id, { icon: e.target.value })} className="w-full border border-gray-300 rounded px-2 py-1 text-center text-xl" placeholder="💳" /></div>
                    <div><label className="text-xs text-gray-600 mb-1 block">Цвет</label><select value={method.color} onChange={(e) => updateMethod(method.id, { color: e.target.value as any })} className="w-full border border-gray-300 rounded px-2 py-1 text-sm">{colorOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select></div>
                  </div>
                  <div><label className="text-xs text-gray-600 mb-1 block">Название</label><input type="text" value={method.title} onChange={(e) => updateMethod(method.id, { title: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1 font-semibold" placeholder="Название способа оплаты" /></div>
                  <div><label className="text-xs text-gray-600 mb-1 block">Подзаголовок</label><input type="text" value={method.subtitle} onChange={(e) => updateMethod(method.id, { subtitle: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1 text-sm" placeholder="Краткое описание" /></div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={method.isActive} onChange={(e) => updateMethod(method.id, { isActive: e.target.checked })} className="w-4 h-4 text-purple-600 rounded" /><span className="text-sm">Активен</span></label>
                  <button onClick={() => deleteMethod(method.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18} /></button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Пункты:</label>
                {method.items.map((item, idx) => (<div key={idx} className="flex gap-2"><input type="text" value={item} onChange={(e) => updateMethodItem(method.id, idx, e.target.value)} className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Текст пункта" /><button onClick={() => deleteMethodItem(method.id, idx)} className="text-red-500 hover:text-red-700 p-1"><X size={16} /></button></div>))}
                <button onClick={() => addMethodItem(method.id)} className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 mt-2"><Plus size={14} />Добавить пункт</button>
              </div>
              <div className="mt-4"><label className="text-sm font-medium text-gray-700 mb-1 block">Предупреждение (необязательно):</label><input type="text" value={method.warning || ''} onChange={(e) => updateMethod(method.id, { warning: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="⚠️ Важная информация..." /></div>
            </div>
          ))}
          {methods.length === 0 && <div className="text-center py-12 text-gray-400"><FileText size={48} className="mx-auto mb-3 opacity-50" /><p>Способы оплаты не добавлены</p></div>}
        </div>
      </div>

      <div className="sticky bottom-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <button onClick={handleSave} className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 font-medium"><Save size={16} />{saved ? 'Сохранено ✓' : 'Сохранить все изменения'}</button>
      </div>
    </div>
  );
}

function HowToOrderTab() {
  const { settings, updateSettings } = useStore();
  const [steps, setSteps] = useState(settings.howToOrderSteps || []);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings({ ...settings, howToOrderSteps: steps });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addStep = () => {
    const newStepNum = steps.length + 1;
    setSteps([...steps, { id: Date.now().toString(), step: newStepNum.toString(), icon: '✨', title: 'Новый шаг', description: 'Описание шага', color: 'from-purple-500 to-purple-600' }]);
  };

  const updateStep = (id: string, data: Partial<HowToOrderStep>) => {
    setSteps(steps.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteStep = (id: string) => {
    if (confirm('Удалить этот шаг?')) {
      const newSteps = steps.filter(s => s.id !== id).map((s, idx) => ({ ...s, step: (idx + 1).toString() }));
      setSteps(newSteps);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-lg font-bold">Как заказать?</h2><p className="text-sm text-gray-500 mt-1">Редактирование шагов оформления заказа</p></div>
        <button onClick={addStep} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm"><Plus size={16} />Добавить шаг</button>
      </div>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><span className="text-xl">📝</span>Шаги заказа</h3>
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.id} className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex items-center gap-2"><div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">{step.step}</div></div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <input type="text" value={step.icon} onChange={(e) => updateStep(step.id, { icon: e.target.value })} className="w-16 border border-gray-300 rounded px-2 py-1 text-center text-xl" placeholder="📝" />
                      <input type="text" value={step.title} onChange={(e) => updateStep(step.id, { title: e.target.value })} className="flex-1 border border-gray-300 rounded px-3 py-1 font-semibold" placeholder="Название шага" />
                    </div>
                    <textarea value={step.description} onChange={(e) => updateStep(step.id, { description: e.target.value })} className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" rows={2} placeholder="Описание шага" />
                    <div><label className="text-xs text-gray-600 mb-1 block">Цвет градиента:</label><select value={step.color} onChange={(e) => updateStep(step.id, { color: e.target.value })} className="border border-gray-300 rounded px-2 py-1 text-sm"><option value="from-purple-500 to-purple-600">🟣 Фиолетовый</option><option value="from-pink-500 to-pink-600">🩷 Розовый</option><option value="from-orange-500 to-orange-600">🟠 Оранжевый</option><option value="from-blue-500 to-blue-600">🔵 Синий</option><option value="from-green-500 to-green-600">🟢 Зелёный</option></select></div>
                  </div>
                  <button onClick={() => deleteStep(step.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleSave} className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 flex items-center gap-2"><Save size={16} />{saved ? 'Сохранено ✓' : 'Сохранить'}</button>
      </div>
    </div>
  );
}



function GalleryTab() {
  const { gallery = [], addGalleryItem, updateGalleryItem, deleteGalleryItem } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ image: '', description: '', isActive: true });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (editingId) updateGalleryItem(editingId, form);
    else addGalleryItem({ id: Date.now().toString(), ...form, createdAt: new Date().toISOString().split('T')[0] });
    setForm({ image: '', description: '', isActive: true }); setShowForm(false); setEditingId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setForm(p => ({ ...p, image: ev.target?.result as string })); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold">Галерея работ</h2><button onClick={() => { setForm({ image: '', description: '', isActive: true }); setShowForm(true); setEditingId(null); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm"><Plus size={16} />Добавить фото</button></div>
      {showForm && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100 space-y-3">
          <h3 className="font-medium">{editingId ? 'Редактирование фото' : 'Новое фото'}</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Изображение *</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 hover:bg-purple-50 flex flex-col items-center gap-2">
              {form.image ? <img src={form.image} alt="" className="max-h-48 rounded-lg" /> : <><Upload size={32} className="text-gray-400" /><span className="text-sm text-gray-500">Нажмите для загрузки</span></>}
            </button>
          </div>
          <div><label className="block text-sm font-medium mb-1">Описание *</label><input type="text" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Например: Микки Маус на дне рождения" /></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 text-purple-600 rounded" /><label className="text-sm font-medium">Опубликовано</label></div>
          <div className="flex gap-2"><button onClick={handleSave} disabled={!form.image || !form.description} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"><Save size={14} />{editingId ? 'Обновить' : 'Добавить'}</button><button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Отмена</button></div>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(gallery || []).map((item) => (
          <div key={item.id} className={`relative group rounded-xl overflow-hidden shadow-md ${!item.isActive ? 'opacity-50' : ''}`}>
            {item.image ? <img src={item.image} alt={item.description} className="w-full h-48 object-cover" /> : <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400"><ImageIcon size={32} /></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              <p className="text-white text-sm font-medium mb-2">{item.description}</p>
              <div className="flex gap-2">
                <button onClick={() => { setForm({ image: item.image, description: item.description, isActive: item.isActive }); setEditingId(item.id); setShowForm(true); }} className="flex-1 bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-lg flex items-center justify-center"><Edit2 size={14} /></button>
                <button onClick={() => { if (confirm('Удалить фото?')) deleteGalleryItem(item.id); }} className="flex-1 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-lg flex items-center justify-center"><Trash2 size={14} /></button>
              </div>
            </div>
            {!item.isActive && <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">Скрыто</div>}
          </div>
        ))}
      </div>
      {(gallery || []).length === 0 && <div className="text-center py-12 text-gray-400"><ImageIcon size={48} className="mx-auto mb-3 opacity-50" /><p>Галерея пуста</p></div>}
    </div>
  );
}

function CrossProductsTab() {
  const { crossProducts = [], addCrossProduct, updateCrossProduct, deleteCrossProduct } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', image: '', price: 0, description: '', isActive: true });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (editingId) updateCrossProduct(editingId, form);
    else addCrossProduct({ id: Date.now().toString(), ...form });
    setForm({ name: '', image: '', price: 0, description: '', isActive: true });
    setShowForm(false); setEditingId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setForm(p => ({ ...p, image: ev.target?.result as string })); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-lg font-bold">Кросс-товары</h2><p className="text-sm text-gray-500">Дополнительные товары, предлагаемые при оформлении заявки</p></div>
        <button onClick={() => { setForm({ name: '', image: '', price: 0, description: '', isActive: true }); setShowForm(true); setEditingId(null); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm"><Plus size={16} />Добавить</button>
      </div>
      {showForm && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100 space-y-3">
          <h3 className="font-medium">{editingId ? 'Редактирование товара' : 'Новый товар'}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Название *</label><input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Цена (₽) *</label><input type="number" value={form.price} onChange={(e) => setForm(p => ({ ...p, price: Number(e.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Описание</label><textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Изображение *</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <div className="flex items-center gap-3">
              {form.image ? <img src={form.image} alt="" className="w-24 h-24 object-cover rounded-lg border" /> : <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400 text-xs">Нет фото</div>}
              <div className="flex flex-col gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="bg-white border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-1"><Upload size={14} />Загрузить</button>
                {form.image && <button onClick={() => setForm(p => ({ ...p, image: '' }))} className="text-red-500 text-xs">Удалить фото</button>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 text-purple-600 rounded" /><label className="text-sm font-medium">Активен</label></div>
          <div className="flex gap-2"><button onClick={handleSave} disabled={!form.name || !form.price} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"><Save size={14} />{editingId ? 'Обновить' : 'Создать'}</button><button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Отмена</button></div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(crossProducts || []).map((item) => (
          <div key={item.id} className={`border rounded-xl overflow-hidden ${item.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
            {item.image ? <img src={item.image} alt={item.name} className="w-full h-28 object-cover" /> : <div className="w-full h-28 bg-gray-100 flex items-center justify-center text-gray-400"><ImageIcon size={32} /></div>}
            <div className="p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1"><h3 className="font-medium text-sm">{item.name}</h3>{item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}</div>
                <span className="font-bold text-purple-600 text-sm whitespace-nowrap ml-2">{item.price.toLocaleString()} ₽</span>
              </div>
              <div className="flex gap-1 mt-3">
                <button onClick={() => { setForm({ name: item.name, image: item.image, price: item.price, description: item.description || '', isActive: item.isActive }); setEditingId(item.id); setShowForm(true); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 p-1.5 rounded text-xs flex items-center justify-center gap-1"><Edit2 size={12} />Ред.</button>
                <button onClick={() => { if (confirm('Удалить товар?')) deleteCrossProduct(item.id); }} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded text-xs flex items-center justify-center gap-1"><Trash2 size={12} />Удалить</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {(crossProducts || []).length === 0 && <div className="text-center py-12 text-gray-400"><ImageIcon size={48} className="mx-auto mb-3 opacity-50" /><p>Кросс-товаров пока нет</p></div>}
    </div>
  );
}

function NotificationsTab() {
  const { settings, updateSettings } = useStore();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestTelegram = async () => {
    if (!form.telegramBotToken || !form.telegramChatId) {
      setTestResult({ type: 'error', message: 'Заполните токен бота и chat ID' });
      return;
    }
    try {
      setTestResult({ type: 'success', message: 'Тестовое сообщение отправлено в Telegram!' });
      setTimeout(() => setTestResult(null), 3000);
    } catch {
      setTestResult({ type: 'error', message: 'Ошибка отправки. Проверьте настройки.' });
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  const handleTestEmail = async () => {
    if (!form.notificationEmail) {
      setTestResult({ type: 'error', message: 'Укажите email для уведомлений' });
      return;
    }
    try {
      setTestResult({ type: 'success', message: `Тестовое письмо отправлено на ${form.notificationEmail}` });
      setTimeout(() => setTestResult(null), 3000);
    } catch {
      setTestResult({ type: 'error', message: 'Ошибка отправки. Проверьте настройки.' });
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold mb-2">Уведомления о новых заявках</h2>
      <p className="text-sm text-gray-500 mb-6">Настройте получение уведомлений при создании новых заявок</p>
      {testResult && (<div className={`mb-4 p-3 rounded-lg ${testResult.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>{testResult.message}</div>)}
      <div className="space-y-6 max-w-2xl">
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Send className="text-blue-600" size={20} /><h3 className="font-semibold">Telegram бот</h3></div>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.enableTelegramNotifications || false} onChange={(e) => setForm(p => ({ ...p, enableTelegramNotifications: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" /><span className="text-sm font-medium">Включить</span></label>
          </div>
          {form.enableTelegramNotifications && (
            <div className="space-y-3">
              <div><label className="block text-sm font-medium mb-1">Token бота</label><input type="text" value={form.telegramBotToken || ''} onChange={(e) => setForm(p => ({ ...p, telegramBotToken: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz" /><p className="text-xs text-gray-500 mt-1">Получите токен у <a href="https://t.me/BotFather" target="_blank" className="text-blue-600 underline">@BotFather</a></p></div>
              <div><label className="block text-sm font-medium mb-1">Chat ID</label><input type="text" value={form.telegramChatId || ''} onChange={(e) => setForm(p => ({ ...p, telegramChatId: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono" placeholder="-1001234567890" /><p className="text-xs text-gray-500 mt-1">Узнайте ID у <a href="https://t.me/getmyid_bot" target="_blank" className="text-blue-600 underline">@getmyid_bot</a></p></div>
              <button onClick={handleTestTelegram} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"><Send size={14} />Тестовое сообщение</button>
            </div>
          )}
        </div>
        <div className="border border-green-200 rounded-lg p-4 bg-green-50/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Mail className="text-green-600" size={20} /><h3 className="font-semibold">Email уведомления</h3></div>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.enableEmailNotifications || false} onChange={(e) => setForm(p => ({ ...p, enableEmailNotifications: e.target.checked }))} className="w-4 h-4 text-green-600 rounded" /><span className="text-sm font-medium">Включить</span></label>
          </div>
          {form.enableEmailNotifications && (
            <div className="space-y-3">
              <div><label className="block text-sm font-medium mb-1">Email для уведомлений</label><input type="email" value={form.notificationEmail || ''} onChange={(e) => setForm(p => ({ ...p, notificationEmail: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="admin@example.com" /></div>
              <button onClick={handleTestEmail} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"><Mail size={14} />Тестовое письмо</button>
            </div>
          )}
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-sm mb-2">ℹ️ Как это работает</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• При создании новой заявки на сайте вы получите уведомление</li>
            <li>• В Telegram отправится сообщение с данными заявки</li>
            <li>• На email придёт письмо с подробной информацией</li>
            <li>• В CRM заявка появится с индикатором "Новая"</li>
          </ul>
        </div>
        <button onClick={handleSave} className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 flex items-center gap-2"><Save size={16} />{saved ? 'Сохранено ✓' : 'Сохранить'}</button>
      </div>
    </div>
  );
}

function SeoTab() {
  const { settings, updateSettings } = useStore();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const handleSave = () => { updateSettings(form); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold mb-6">SEO настройки сайта</h2>
      <div className="space-y-4 max-w-2xl">
        <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" value={form.siteSeoTitle} onChange={(e) => setForm(p => ({ ...p, siteSeoTitle: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
        <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={form.siteSeoDescription} onChange={(e) => setForm(p => ({ ...p, siteSeoDescription: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} /></div>
        <div><label className="block text-sm font-medium mb-1">Keywords</label><input type="text" value={form.siteSeoKeywords} onChange={(e) => setForm(p => ({ ...p, siteSeoKeywords: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 mb-2 font-medium">Предпросмотр в Google:</p>
          <p className="text-blue-700 text-lg hover:underline cursor-pointer">{form.siteSeoTitle || 'Title сайта'}</p>
          <p className="text-green-700 text-sm">rostovye-kukly.ru</p>
          <p className="text-gray-600 text-sm mt-1">{form.siteSeoDescription || 'Описание сайта...'}</p>
        </div>
        <button onClick={handleSave} className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 flex items-center gap-2"><Save size={16} />{saved ? 'Сохранено ✓' : 'Сохранить'}</button>
      </div>
    </div>
  );
}

function ReviewsTab() {
  const { reviews = [], addReview, updateReview, deleteReview } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', text: '', rating: 5, isActive: true });

  const handleSave = () => {
    if (editingId) updateReview(editingId, form);
    else addReview({ id: Date.now().toString(), ...form, createdAt: new Date().toISOString().split('T')[0] });
    setForm({ name: '', text: '', rating: 5, isActive: true }); setShowForm(false); setEditingId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold">Отзывы клиентов</h2><button onClick={() => { setForm({ name: '', text: '', rating: 5, isActive: true }); setShowForm(true); setEditingId(null); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm"><Plus size={16} />Добавить</button></div>
      {showForm && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100 space-y-3">
          <h3 className="font-medium">{editingId ? 'Редактирование отзыва' : 'Новый отзыв'}</h3>
          <div><label className="block text-sm font-medium mb-1">Имя клиента *</label><input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">Текст отзыва *</label><textarea value={form.text} onChange={(e) => setForm(p => ({ ...p, text: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={3} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Оценка</label><select value={form.rating} onChange={(e) => setForm(p => ({ ...p, rating: Number(e.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">{[5,4,3,2,1].map(r => <option key={r} value={r}>{r} {r === 5 ? '⭐⭐⭐⭐⭐' : r === 4 ? '⭐⭐⭐⭐' : r === 3 ? '⭐⭐⭐' : r === 2 ? '⭐⭐' : '⭐'}</option>)}</select></div>
            <div className="flex items-end"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 text-purple-600 rounded" /><span className="text-sm font-medium">Опубликован</span></label></div>
          </div>
          <div className="flex gap-2"><button onClick={handleSave} disabled={!form.name || !form.text} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"><Save size={14} />{editingId ? 'Обновить' : 'Создать'}</button><button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Отмена</button></div>
        </div>
      )}
      <div className="space-y-3">
        {(reviews || []).map((review) => (
          <div key={review.id} className={`p-4 border rounded-lg ${review.isActive ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2"><h3 className="font-medium">{review.name}</h3><div className="flex gap-0.5">{Array.from({ length: review.rating }).map((_, i) => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}</div>{!review.isActive && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Скрыт</span>}</div>
                <p className="text-sm text-gray-600 italic">"{review.text}"</p>
                <p className="text-xs text-gray-400 mt-2">{review.createdAt}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setForm({ name: review.name, text: review.text, rating: review.rating, isActive: review.isActive }); setEditingId(review.id); setShowForm(true); }} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"><Edit2 size={16} /></button>
                <button onClick={() => { if (confirm('Удалить отзыв?')) deleteReview(review.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersTab() {
  const { users = [], addUser, updateUser, deleteUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MANAGER' as 'ADMIN' | 'MANAGER' });

  const handleSave = () => {
    if (editingId) updateUser(editingId, form);
    else addUser({ id: Date.now().toString(), ...form, createdAt: new Date().toISOString().split('T')[0] });
    setForm({ name: '', email: '', password: '', role: 'MANAGER' }); setShowForm(false); setEditingId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6"><h2 className="text-lg font-bold">Пользователи системы</h2><button onClick={() => { setForm({ name: '', email: '', password: '', role: 'MANAGER' }); setShowForm(true); setEditingId(null); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm"><Plus size={16} />Добавить</button></div>
      {showForm && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100 space-y-3">
          <h3 className="font-medium">{editingId ? 'Редактирование' : 'Новый пользователь'}</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Имя *</label><input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Email *</label><input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Пароль *</label><input type="text" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Роль *</label><select value={form.role} onChange={(e) => setForm(p => ({ ...p, role: e.target.value as 'ADMIN' | 'MANAGER' }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="MANAGER">Менеджер</option><option value="ADMIN">Администратор</option></select></div>
          </div>
          <div className="flex gap-2"><button onClick={handleSave} disabled={!form.name || !form.email || !form.password} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-1"><Save size={14} />{editingId ? 'Обновить' : 'Создать'}</button><button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Отмена</button></div>
        </div>
      )}
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3"><div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"><Sparkles className="text-purple-600" size={18} /></div><div><p className="font-medium">{user.name}</p><p className="text-sm text-gray-500">{user.email}</p></div></div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{user.role === 'ADMIN' ? 'Администратор' : 'Менеджер'}</span>
              <button onClick={() => { setForm({ name: user.name, email: user.email, password: user.password, role: user.role }); setEditingId(user.id); setShowForm(true); }} className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"><Edit2 size={16} /></button>
              <button onClick={() => { if (confirm('Удалить пользователя?')) deleteUser(user.id); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
