import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Search, Phone, Mail, Calendar, ChevronRight, X, UserPlus, CheckCircle, XCircle } from 'lucide-react';

export default function Clients() {
  const { clients = [], orders = [], addClient, updateClient } = useStore();
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' });

  const filteredClients = clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || (c.email && c.email.toLowerCase().includes(search.toLowerCase())));
  const selected = clients.find((c) => c.id === selectedClient);
  const selectedOrders = selectedClient ? orders.filter((o) => o.clientId === selectedClient) : [];

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    addClient({ id: Date.now().toString(), name: editForm.name, phone: editForm.phone, email: editForm.email || undefined, consentGiven: false, createdAt: new Date().toISOString().split('T')[0] });
    setShowAddForm(false);
    setEditForm({ name: '', phone: '', email: '' });
  };

  const handleEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedClient) { updateClient(selectedClient, editForm); setEditMode(false); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Клиентская база</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Поиск клиентов..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64" /></div>
          <button onClick={() => setShowAddForm(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm font-medium"><UserPlus size={16} /> Добавить</button>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50 max-h-[70vh] overflow-auto">
            {filteredClients.map((client) => (
              <div key={client.id} onClick={() => { setSelectedClient(client.id); setEditMode(false); }} className={`p-4 cursor-pointer hover:bg-gray-50 transition ${selectedClient === client.id ? 'bg-purple-50 border-l-4 border-purple-500' : ''}`}>
                <div className="flex items-center justify-between"><div><p className="font-medium">{client.name}</p><a href={`tel:${client.phone}`} className="text-sm text-purple-600 hover:text-purple-700 hover:underline">{client.phone}</a></div><div className="flex items-center gap-2"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{orders.filter(o => o.clientId === client.id).length} заказов</span><ChevronRight size={16} className="text-gray-400" /></div></div>
              </div>
            ))}
            {filteredClients.length === 0 && <div className="p-8 text-center text-gray-400">Клиенты не найдены</div>}
          </div>
        </div>
        <div className="lg:col-span-2">
          {selected ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold">{selected.name}</h2>{!editMode && <button onClick={() => { setEditMode(true); setEditForm({ name: selected.name, phone: selected.phone, email: selected.email || '' }); }} className="text-sm text-purple-600 hover:text-purple-700 font-medium">Редактировать</button>}</div>
              {editMode ? (
                <form onSubmit={handleEditClient} className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">Имя</label><input type="text" value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div><div><label className="block text-sm font-medium mb-1">Телефон</label><input type="tel" value={editForm.phone} onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div></div>
                  <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={editForm.email} onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
                  <div className="flex gap-2"><button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">Сохранить</button><button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Отмена</button></div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm"><Phone size={16} className="text-gray-400" /><a href={`tel:${selected.phone}`} className="text-purple-600 hover:text-purple-700 hover:underline">{selected.phone}</a></div>
                  {selected.email && <div className="flex items-center gap-2 text-sm"><Mail size={16} className="text-gray-400" /><span>{selected.email}</span></div>}
                  <div className="flex items-center gap-2 text-sm"><Calendar size={16} className="text-gray-400" /><span>Клиент с {selected.createdAt}</span></div>
                </div>
              )}
              <div className={`p-3 rounded-lg mb-6 flex items-center gap-3 ${selected.consentGiven ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {selected.consentGiven ? (<><CheckCircle className="text-green-600" size={20} /><div><p className="font-medium text-green-800 text-sm">Согласие на обработку ПД получено</p>{selected.consentDate && <p className="text-xs text-green-600">Дата: {selected.consentDate}</p>}</div></>) : (<><XCircle className="text-red-600" size={20} /><div><p className="font-medium text-red-800 text-sm">Согласие на обработку ПД не получено</p></div></>)}
              </div>
              <h3 className="font-bold text-sm text-gray-700 mb-3">История заказов</h3>
              {selectedOrders.length === 0 ? <p className="text-gray-400 text-sm">Нет заказов</p> : (
                <div className="space-y-3">
                  {selectedOrders.map((order) => (
                    <div key={order.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div><p className="font-medium text-sm">{order.characterName}</p>{order.serviceName && <p className="text-xs text-purple-600">{order.serviceName} · {order.serviceDuration} мин</p>}<p className="text-xs text-gray-500">{order.eventDate} в {order.eventTime}</p></div>
                      <div className="text-right"><p className="font-medium text-sm text-purple-600">{order.totalAmount.toLocaleString()} ₽</p><p className="text-xs text-gray-400">{order.status}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"><p className="text-gray-400">Выберите клиента из списка</p></div>}
        </div>
      </div>
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold">Новый клиент</h2><button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button></div>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Имя *</label><input required type="text" value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Телефон *</label><input required type="tel" value={editForm.phone} onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={editForm.email} onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
              <div className="flex gap-3 pt-2"><button type="submit" className="flex-1 bg-purple-600 text-white py-2.5 rounded-lg font-medium hover:bg-purple-700">Добавить</button><button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2.5 border rounded-lg hover:bg-gray-50">Отмена</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
