import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { CalendarDays, DollarSign, ClipboardList, TrendingUp, ArrowRight, User, MapPin } from 'lucide-react';
import { STATUS_LABELS, STATUS_COLORS } from '../types';

export default function Dashboard() {
  const { orders = [], currentUser } = useStore();
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => o.eventDate === today);
  const tomorrowOrders = orders.filter((o) => o.eventDate === tomorrow);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const weekOrders = orders.filter((o) => o.createdAt >= weekAgo);
  const todayNewOrders = orders.filter((o) => o.createdAt === today);
  const prepaidTotal = orders.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.prepaidAmount, 0);
  const totalRevenue = orders.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.prepaidAmount + (o.status === 'COMPLETED' ? o.totalAmount - o.prepaidAmount : 0), 0);

  const stats = [
    { label: 'Новых заявок сегодня', value: todayNewOrders.length, icon: ClipboardList, color: 'bg-blue-500', lightColor: 'bg-blue-50' },
    { label: 'Заявок за неделю', value: weekOrders.length, icon: TrendingUp, color: 'bg-green-500', lightColor: 'bg-green-50' },
    { label: 'Мероприятий сегодня', value: todayOrders.length, icon: CalendarDays, color: 'bg-purple-500', lightColor: 'bg-purple-50' },
    { label: 'Выручка (предоплаты)', value: `${prepaidTotal.toLocaleString()} ₽`, icon: DollarSign, color: 'bg-amber-500', lightColor: 'bg-amber-50' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Добро пожаловать, {currentUser?.name}! 👋</h1>
        <p className="text-gray-500 mt-1">Вот что происходит сегодня в вашем бизнесе</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className={`${stat.lightColor} p-2.5 rounded-lg inline-block mb-3`}><stat.icon className={stat.color.replace('bg-', 'text-')} size={22} /></div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white mb-8">
        <div className="flex items-center justify-between"><div><p className="text-purple-200 text-sm">Общая выручка</p><p className="text-3xl font-bold mt-1">{totalRevenue.toLocaleString()} ₽</p></div><DollarSign size={48} className="text-purple-300" /></div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between"><h2 className="font-bold text-lg flex items-center gap-2"><CalendarDays className="text-purple-600" size={20} />Сегодня</h2><span className="text-sm text-gray-400">{today}</span></div>
          <div className="p-5">
            {todayOrders.length === 0 ? <p className="text-gray-400 text-center py-8">Нет мероприятий на сегодня</p> : (
              <div className="space-y-4">
                {todayOrders.map((order) => (
                  <div key={order.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm font-bold min-w-[50px] text-center">{order.eventTime}</div>
                    <div className="flex-1 min-w-0"><p className="font-medium truncate">{order.characterName}</p><p className="text-sm text-gray-500 flex items-center gap-1"><User size={12} /> {order.clientName}</p><p className="text-sm text-gray-400 flex items-center gap-1"><MapPin size={12} /> {order.address}</p></div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between"><h2 className="font-bold text-lg flex items-center gap-2"><CalendarDays className="text-blue-600" size={20} />Завтра</h2><span className="text-sm text-gray-400">{tomorrow}</span></div>
          <div className="p-5">
            {tomorrowOrders.length === 0 ? <p className="text-gray-400 text-center py-8">Нет мероприятий на завтра</p> : (
              <div className="space-y-4">
                {tomorrowOrders.map((order) => (
                  <div key={order.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-bold min-w-[50px] text-center">{order.eventTime}</div>
                    <div className="flex-1 min-w-0"><p className="font-medium truncate">{order.characterName}</p><p className="text-sm text-gray-500 flex items-center gap-1"><User size={12} /> {order.clientName}</p></div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/crm/orders" className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg hover:bg-purple-700">Все заявки <ArrowRight size={16} /></Link>
        <Link to="/crm/calendar" className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50">Календарь <ArrowRight size={16} /></Link>
      </div>
    </div>
  );
}
