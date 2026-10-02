import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { Order, OrderStatus } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../types';
import { Plus, Search, X, Phone, MapPin, Calendar, Music, MessageSquare, DollarSign, Upload, Mail, CheckCircle, Clock, FileText, Bell, ShoppingCart, Trash2, LayoutGrid, List } from 'lucide-react';

const COLUMNS: OrderStatus[] = ['NEW', 'PROCESSING', 'PREPAID', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export default function Orders() {
  const { orders = [], updateOrder, addOrder, deleteOrder, characters = [], clients = [], addClient, markOrderAsRead, markAllOrdersAsRead } = useStore();
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const unreadOrders = orders.filter((o) => o.isNew);
  const filteredOrders = orders.filter((o) => o.clientName.toLowerCase().includes(search.toLowerCase()) || o.characterName.toLowerCase().includes(search.toLowerCase()) || o.clientPhone.includes(search));

  useEffect(() => {
    if (unreadOrders.length > 0 && !showNotification) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }
  }, [unreadOrders.length]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrder(orderId, { status: newStatus, isNew: false });
    if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus, isNew: false });
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    if (order.isNew) markOrderAsRead(order.id);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту заявку?')) {
      deleteOrder(orderId);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    }
  };

  return (
    <div>
      {showNotification && unreadOrders.length > 0 && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg shadow-2xl animate-pulse max-w-sm">
          <div className="flex items-start gap-3">
            <Bell className="flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1"><p className="font-bold">Новая заявка!</p><p className="text-sm text-purple-100">{unreadOrders.length} {unreadOrders.length === 1 ? 'новая заявка' : 'новых заявок'}</p></div>
            <button onClick={() => setShowNotification(false)} className="text-white/80 hover:text-white"><X size={16} /></button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Заявки</h1>
          {unreadOrders.length > 0 && (<div className="flex items-center gap-2"><span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">{unreadOrders.length}</span><button onClick={markAllOrdersAsRead} className="text-xs text-purple-600 hover:text-purple-700 underline">Прочитать все</button></div>)}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64" /></div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${viewMode === 'kanban' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`} title="Канбан-доска"><LayoutGrid size={16} /></button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${viewMode === 'list' ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`} title="Список"><List size={16} /></button>
          </div>
          <button onClick={() => setShowCreateForm(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 text-sm"><Plus size={16} /> Новая</button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((status) => {
            const columnOrders = filteredOrders.filter((o) => o.status === status);
            return (
              <div key={status} className="min-w-[280px] flex-1">
                <div className="flex items-center justify-between mb-3 px-2"><h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${STATUS_COLORS[status].split(' ')[0]}`}></span>{STATUS_LABELS[status]}</h3><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{columnOrders.length}</span></div>
                <div className="space-y-2">
                  {columnOrders.map((order) => (
                    <div key={order.id} className={`bg-white p-3 rounded-lg shadow-sm border transition ${order.isNew ? 'border-purple-400 border-2' : 'border-gray-100'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 cursor-pointer" onClick={() => handleOrderClick(order)}>
                          {order.isNew && <div className="flex items-center gap-1 mb-2"><div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div><span className="text-xs font-medium text-purple-600">Новая</span></div>}
                          <p className="font-medium text-sm mb-1">{order.clientName}</p>
                          <a href={`tel:${order.clientPhone}`} onClick={(e) => e.stopPropagation()} className="text-xs text-purple-600 hover:text-purple-700 hover:underline mb-1 block">{order.clientPhone}</a>
                          <p className="text-xs text-gray-500 mb-2">{order.characterName}</p>
                          {order.serviceName && <p className="text-xs text-purple-600 mb-1">{order.serviceName} · {order.serviceDuration} мин</p>}
                          {order.crossProducts && order.crossProducts.length > 0 && (<div className="flex items-center gap-1 mb-1"><ShoppingCart size={10} className="text-gray-400" /><span className="text-xs text-gray-500">+{order.crossProducts.length} доп.</span></div>)}
                          <div className="flex items-center gap-2 text-xs text-gray-400"><Calendar size={12} /><span>{order.eventDate} {order.eventTime}</span></div>
                          <div className="flex items-center justify-between mt-2"><span className="text-xs font-medium text-purple-600">{order.totalAmount.toLocaleString()} ₽</span>{order.prepaidAmount > 0 && <span className="text-xs text-green-600">{order.prepaidAmount.toLocaleString()} ₽</span>}</div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }} className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition flex-shrink-0" title="Удалить заявку"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                  {columnOrders.length === 0 && <div className="text-center py-8 text-gray-300 text-sm">Пусто</div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Клиент</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Персонаж</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => handleOrderClick(order)}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.clientName}</p>
                      <a href={`tel:${order.clientPhone}`} onClick={(e) => e.stopPropagation()} className="text-xs text-purple-600 hover:text-purple-700 hover:underline">{order.clientPhone}</a>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-900">{order.characterName}</p>
                      {order.serviceName && <p className="text-xs text-gray-500">{order.serviceName}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{order.eventDate}</div>
                    <div className="text-xs text-gray-500">{order.eventTime}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-purple-600">{order.totalAmount.toLocaleString()} ₽</div>
                    {order.prepaidAmount > 0 && <div className="text-xs text-green-600">Предоплата: {order.prepaidAmount.toLocaleString()} ₽</div>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }} className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition" title="Удалить заявку"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">Заявки не найдены</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={handleStatusChange} onDelete={() => handleDeleteOrder(selectedOrder.id)} />}
      {showCreateForm && <CreateOrderModal onClose={() => setShowCreateForm(false)} characters={characters} clients={clients} addOrder={addOrder} addClient={addClient} />}
    </div>
  );
}

function OrderDetailModal({ order, onClose, onStatusChange, onDelete }: { order: Order; onClose: () => void; onStatusChange: (id: string, status: OrderStatus) => void; onDelete: () => void }) {
  const { updateOrder, clients = [] } = useStore();
  const [prepaidInput, setPrepaidInput] = useState(order.prepaidAmount.toString());
  const client = clients.find(c => c.id === order.clientId);
  const [receiptEmail, setReceiptEmail] = useState(order.receiptEmail || client?.email || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [emailSent, setEmailSent] = useState(false);

  const remaining = order.totalAmount - Number(prepaidInput || 0);

  const handlePrepaidChange = (value: string) => {
    const num = Math.max(0, Math.min(order.totalAmount, Number(value) || 0));
    setPrepaidInput(num.toString());
    updateOrder(order.id, { prepaidAmount: num });
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { updateOrder(order.id, { receiptImage: ev.target?.result as string, receiptDate: new Date().toISOString().split('T')[0] }); };
    reader.readAsDataURL(file);
  };

  const handleSendReceipt = () => {
    setEmailSent(true);
    updateOrder(order.id, { receiptEmail });
    setTimeout(() => setEmailSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Заявка #{order.id}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => { if (confirm('Вы уверены, что хотите удалить эту заявку?')) { onDelete(); onClose(); } }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Удалить заявку"><Trash2 size={20} /></button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
          </div>
        </div>
        <div className="space-y-4">
          <div><label className="text-xs text-gray-500 font-medium">Статус</label><select value={order.status} onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)} className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm">{COLUMNS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2"><Phone size={16} className="text-gray-400" /><div><p className="text-xs text-gray-500">Клиент</p><p className="font-medium">{order.clientName}</p><a href={`tel:${order.clientPhone}`} className="text-sm text-purple-600 hover:text-purple-700 hover:underline">{order.clientPhone}</a></div></div>
            <div className="flex items-center gap-2"><Calendar size={16} className="text-gray-400" /><div><p className="text-xs text-gray-500">Дата и время</p><p className="font-medium">{order.eventDate}</p><p className="text-sm text-gray-500">{order.eventTime}</p></div></div>
          </div>
          <div className="flex items-start gap-2"><MapPin size={16} className="text-gray-400 mt-0.5" /><div><p className="text-xs text-gray-500">Адрес</p><p className="font-medium">{order.address}</p></div></div>
          <div className="flex items-start gap-2"><MessageSquare size={16} className="text-gray-400 mt-0.5" /><div><p className="text-xs text-gray-500">Персонаж / Услуга</p><p className="font-medium">{order.characterName}</p>{order.serviceName && <p className="text-sm text-purple-600">{order.serviceName} · {order.serviceDuration} мин</p>}</div></div>
          {(order.songs || []).length > 0 && <div className="flex items-start gap-2"><Music size={16} className="text-gray-400 mt-0.5" /><div><p className="text-xs text-gray-500">Песни</p><div className="flex flex-wrap gap-1 mt-1">{order.songs.map((song, i) => <span key={i} className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">{song}</span>)}</div></div></div>}
          {order.crossProducts && order.crossProducts.length > 0 && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-sm text-orange-800 mb-2 flex items-center gap-2"><ShoppingCart size={14} />Дополнительные товары</h4>
              <div className="space-y-2">
                {order.crossProducts.map((cp, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white rounded p-2">
                    {cp.image && <img src={cp.image} alt={cp.productName} className="w-10 h-10 object-cover rounded" />}
                    <div className="flex-1"><p className="text-sm font-medium">{cp.productName}</p><p className="text-xs text-gray-500">{cp.quantity} шт × {cp.price.toLocaleString()} ₽</p></div>
                    <p className="text-sm font-bold text-orange-700">{(cp.price * cp.quantity).toLocaleString()} ₽</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {order.comment && <div className="flex items-start gap-2"><MessageSquare size={16} className="text-gray-400 mt-0.5" /><div><p className="text-xs text-gray-500">Комментарий</p><p className="text-sm text-gray-700">{order.comment}</p></div></div>}
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <h3 className="font-bold text-sm text-green-800 mb-3 flex items-center gap-2"><DollarSign size={16} /> Финансы</h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div><p className="text-xs text-gray-500">Сумма заказа</p><p className="text-lg font-bold text-gray-900">{order.totalAmount.toLocaleString()} ₽</p></div>
              <div><p className="text-xs text-gray-500">Остаток</p><p className="text-lg font-bold text-orange-600">{remaining.toLocaleString()} ₽</p></div>
            </div>
            <div><label className="block text-xs text-gray-500 font-medium mb-1">Предоплата (₽) — вносится вручную:</label><input type="number" min="0" max={order.totalAmount} value={prepaidInput} onChange={(e) => handlePrepaidChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /><div className="flex gap-2 mt-2"><button onClick={() => handlePrepaidChange((order.totalAmount * 0.5).toString())} className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-50">50% ({(order.totalAmount * 0.5).toLocaleString()} ₽)</button><button onClick={() => handlePrepaidChange(order.totalAmount.toString())} className="text-xs bg-white border border-gray-300 px-2 py-1 rounded hover:bg-gray-50">100% ({order.totalAmount.toLocaleString()} ₽)</button></div></div>
          </div>
          {order.status === 'COMPLETED' && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-bold text-sm text-blue-800 mb-3 flex items-center gap-2"><FileText size={16} /> Чек и отправка</h3>
              <div className="mb-3">
                <label className="block text-xs text-gray-500 font-medium mb-1">Прикрепить чек:</label>
                <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleReceiptUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-white border border-gray-300 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 w-full justify-center"><Upload size={16} />{order.receiptImage ? 'Заменить чек' : 'Загрузить чек'}</button>
                {order.receiptImage && <div className="mt-2"><p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Чек загружен ({order.receiptDate})</p><img src={order.receiptImage} alt="Чек" className="mt-2 max-h-32 rounded border" /></div>}
              </div>
              <div><label className="block text-xs text-gray-500 font-medium mb-1">Email для отправки чека:</label><div className="flex gap-2"><input type="email" value={receiptEmail} onChange={(e) => setReceiptEmail(e.target.value)} placeholder="client@example.com" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" /><button onClick={handleSendReceipt} disabled={!order.receiptImage || !receiptEmail} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"><Mail size={14} />{emailSent ? 'Отправлено ✓' : 'Отправить'}</button></div></div>
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100"><button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 font-medium">Закрыть</button></div>
      </div>
    </div>
  );
}

function CreateOrderModal({ onClose, characters, clients, addOrder, addClient }: any) {
  const [form, setForm] = useState({ clientName: '', clientPhone: '', characterId: '', serviceId: '', eventDate: '', eventTime: '', address: '', songs: '', comment: '', totalAmount: 0, prepaidAmount: 0 });
  const selectedChar = characters.find((c: any) => c.id === form.characterId);

  const getAvailableTimeSlots = (date: string, duration: number = 30): string[] => {
    const { orders: allOrders = [] } = useStore.getState();
    const slots: string[] = [];
    for (let h = 6; h < 23; h++) for (let m = 0; m < 60; m += 30) slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    const dayOrders = allOrders.filter((o: any) => o.eventDate === date && o.status !== 'CANCELLED');
    return slots.filter((slot) => {
      const [sH, sM] = slot.split(':').map(Number);
      const sStart = sH * 60 + sM;
      const sEnd = sStart + duration;
      for (const o of dayOrders) {
        const [oH, oM] = o.eventTime.split(':').map(Number);
        const oStart = oH * 60 + oM;
        const oEnd = oStart + (o.serviceDuration || 30);
        if (sStart < oEnd + 30 && sEnd > oStart - 30) return false;
      }
      return true;
    });
  };

  const availableSlots = form.eventDate && selectedChar?.services?.find((s: any) => s.id === form.serviceId) ? getAvailableTimeSlots(form.eventDate, selectedChar.services.find((s: any) => s.id === form.serviceId).duration) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [hours] = form.eventTime.split(':').map(Number);
    if (hours < 6 || hours >= 23) { alert('Время бронирования доступно с 06:00 до 23:00'); return; }
    const char = characters.find((c: any) => c.id === form.characterId);
    const service = char?.services?.find((s: any) => s.id === form.serviceId);
    let client = clients.find((c: any) => c.phone === form.clientPhone);
    if (!client) { client = { id: Date.now().toString(), name: form.clientName, phone: form.clientPhone, consentGiven: false, consentDate: '', createdAt: new Date().toISOString().split('T')[0] }; addClient(client); }
    addOrder({ id: Date.now().toString(), clientId: client.id, clientName: form.clientName, clientPhone: form.clientPhone, characterId: form.characterId, characterName: char?.name || '', serviceId: service?.id, serviceName: service?.name, serviceDuration: service?.duration, status: 'NEW', eventDate: form.eventDate, eventTime: form.eventTime, address: form.address, songs: form.songs.split(',').map((s: string) => s.trim()).filter(Boolean), comment: form.comment, totalAmount: form.totalAmount || service?.price || 0, prepaidAmount: form.prepaidAmount, createdAt: new Date().toISOString().split('T')[0] });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto p-6">
        <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold">Новая заявка</h2><button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Имя клиента *</label><input required type="text" value={form.clientName} onChange={(e) => setForm(p => ({ ...p, clientName: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Телефон *</label><input required type="tel" value={form.clientPhone} onChange={(e) => setForm(p => ({ ...p, clientPhone: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Персонаж *</label><select required value={form.characterId} onChange={(e) => setForm(p => ({ ...p, characterId: e.target.value, serviceId: '', totalAmount: 0 }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="">Выберите</option>{characters.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          {selectedChar && (selectedChar.services || []).length > 0 && (
            <div><label className="block text-sm font-medium mb-2">Выберите услугу *</label><div className="grid gap-2">{selectedChar.services.map((s: any) => (<button key={s.id} type="button" onClick={() => setForm(p => ({ ...p, serviceId: s.id, totalAmount: s.price }))} className={`p-2.5 rounded-lg border-2 text-left transition-all ${form.serviceId === s.id ? 'border-purple-600 bg-purple-50 shadow-md' : 'border-gray-200 bg-white hover:border-purple-300'}`}><div className="flex items-center justify-between"><div className="flex-1"><div className="font-semibold text-gray-900 text-sm">{s.name}</div><div className="flex items-center gap-3 text-xs mt-0.5"><span className="text-gray-600 flex items-center gap-1"><Clock size={12} />{s.duration} мин</span><span className="font-bold text-purple-600">{s.price.toLocaleString()} ₽</span></div></div>{form.serviceId === s.id && <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}</div></button>))}</div></div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Дата *</label><input required type="date" value={form.eventDate} onChange={(e) => setForm(p => ({ ...p, eventDate: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Время * (06:00 - 23:00)</label>{!form.eventDate || !selectedChar ? (<div className="border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-400 text-sm">Сначала дату и услугу</div>) : availableSlots.length === 0 ? (<div className="border border-red-200 bg-red-50 rounded-lg px-3 py-2 text-red-600 text-sm">Нет свободного времени</div>) : (<select required value={form.eventTime} onChange={(e) => setForm(p => ({ ...p, eventTime: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="">Время</option>{availableSlots.map((s) => <option key={s} value={s}>{s}</option>)}</select>)}<p className="text-xs text-gray-500 mt-1">{availableSlots.length > 0 ? `Доступно ${availableSlots.length} слотов · Буфер ±30 мин` : 'Работаем с 06:00 до 23:00'}</p></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Адрес *</label><input required type="text" value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Сумма (₽)</label><input type="number" value={form.totalAmount} onChange={(e) => setForm(p => ({ ...p, totalAmount: Number(e.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Предоплата (₽)</label><input type="number" value={form.prepaidAmount} onChange={(e) => setForm(p => ({ ...p, prepaidAmount: Number(e.target.value) }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Песни (через запятую)</label><input type="text" value={form.songs} onChange={(e) => setForm(p => ({ ...p, songs: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Happy Birthday, Каравай" /></div>
          <div><label className="block text-sm font-medium mb-1">Комментарий</label><textarea value={form.comment} onChange={(e) => setForm(p => ({ ...p, comment: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} /></div>
          <div className="flex gap-3 pt-2"><button type="submit" className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg font-medium hover:bg-purple-700">Создать заявку</button><button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">Отмена</button></div>
        </form>
      </div>
    </div>
  );
}
