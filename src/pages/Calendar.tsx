import { useState } from 'react';
import { useStore } from '../store/useStore';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function CalendarPage() {
  const { orders = [] } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;

  const getOrdersForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return orders.filter((o) => o.eventDate === dateStr && o.status !== 'CANCELLED');
  };

  const selectedDateOrders = selectedDate ? getOrdersForDate(selectedDate) : [];
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const today = new Date();

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Календарь бронирований</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
            <h2 className="text-lg font-bold capitalize">{format(currentMonth, 'LLLL yyyy', { locale: ru })}</h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">{weekDays.map((day) => <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">{day}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} className="aspect-square" />)}
            {days.map((day) => {
              const dayOrders = getOrdersForDate(day);
              const isToday = isSameDay(day, today);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              return (
                <button key={day.toISOString()} onClick={() => setSelectedDate(day)} className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all text-sm ${!isCurrentMonth ? 'text-gray-300' : ''} ${isToday ? 'bg-purple-100 text-purple-700 font-bold' : ''} ${isSelected ? 'bg-purple-600 text-white font-bold' : ''} ${!isToday && !isSelected && isCurrentMonth ? 'hover:bg-gray-100' : ''}`}>
                  <span>{format(day, 'd')}</span>
                  {dayOrders.length > 0 && <div className="flex gap-0.5 mt-0.5">{dayOrders.slice(0, 3).map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-500'}`} />)}</div>}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-purple-500"></div>Есть бронирования</div>
            <div className="flex items-center gap-2 text-xs text-gray-500"><div className="w-2 h-2 rounded-full bg-purple-200"></div>Сегодня</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-lg mb-4">{selectedDate ? format(selectedDate, 'd MMMM, EEEE', { locale: ru }) : 'Выберите дату'}</h3>
          {selectedDate && (
            <>
              {selectedDateOrders.length === 0 ? (
                <div className="text-center py-8"><p className="text-gray-400 text-sm">Нет бронирований на этот день</p><p className="text-green-500 text-sm mt-2 font-medium">✓ Дата свободна</p><p className="text-xs text-gray-400 mt-2">Доступно с 06:00 до 23:00</p></div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 mb-3">{selectedDateOrders.length} бронировани{selectedDateOrders.length === 1 ? 'е' : 'й'}:</p>
                  {selectedDateOrders.map((order) => {
                    const duration = order.serviceDuration || 30;
                    const [hours, minutes] = order.eventTime.split(':').map(Number);
                    const endMinutes = hours * 60 + minutes + duration;
                    const endHours = Math.floor(endMinutes / 60);
                    const endMins = endMinutes % 60;
                    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
                    return (
                      <div key={order.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                        <div className="flex items-center justify-between mb-1"><span className="font-medium text-sm">{order.eventTime} - {endTime}</span><span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{duration} мин</span></div>
                        <p className="text-sm font-medium">{order.characterName}</p>
                        {order.serviceName && <p className="text-xs text-purple-600">{order.serviceName}</p>}
                        <p className="text-xs text-gray-500">{order.clientName}</p>
                        <p className="text-xs text-gray-400 mt-1">{order.address}</p>
                        <div className="mt-2 pt-2 border-t border-gray-200"><p className="text-xs text-orange-600 flex items-center gap-1"><Clock size={12} />Буфер ±30 мин занят</p></div>
                      </div>
                    );
                  })}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium mb-1">ℹ️ Информация о бронировании:</p>
                    <ul className="text-xs text-blue-600 space-y-1"><li>• Рабочее время: 06:00 - 23:00</li><li>• Буфер между бронированиями: 30 минут</li><li>• Минимальное время услуги: 20 минут</li></ul>
                  </div>
                </div>
              )}
            </>
          )}
          {!selectedDate && <div className="text-center py-8 text-gray-400"><p className="text-sm">Нажмите на дату в календаре</p></div>}
        </div>
      </div>
    </div>
  );
}
