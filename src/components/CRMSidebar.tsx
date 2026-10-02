import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LayoutDashboard, ClipboardList, Users, Calendar, Settings, LogOut, Menu, X, Sparkles } from 'lucide-react';

const navItems = [
  { path: '/crm', icon: LayoutDashboard, label: 'Дашборд' },
  { path: '/crm/orders', icon: ClipboardList, label: 'Заявки' },
  { path: '/crm/clients', icon: Users, label: 'Клиенты' },
  { path: '/crm/calendar', icon: Calendar, label: 'Календарь' },
  { path: '/crm/settings', icon: Settings, label: 'Настройки', adminOnly: true },
];

export default function CRMSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useStore();

  const handleLogout = () => { logout(); navigate('/'); };
  const filteredNav = navItems.filter((item) => !item.adminOnly || currentUser?.role === 'ADMIN');

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-purple-600 text-white rounded-lg shadow-lg">
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      {isOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-purple-900 to-purple-800 text-white transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-purple-700">
          <div className="flex items-center gap-3">
            <Sparkles className="text-yellow-400" size={28} />
            <div>
              <h1 className="font-bold text-lg">Party CRM</h1>
              <p className="text-xs text-purple-300">Агентство праздников</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-white/20 font-medium' : 'text-purple-200 hover:bg-white/10'}`}>
                <item.icon size={20} /><span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-purple-700">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">{currentUser?.name?.[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.name}</p>
              <p className="text-xs text-purple-300">{currentUser?.role === 'ADMIN' ? 'Администратор' : 'Менеджер'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 w-full text-sm text-purple-200 hover:text-white hover:bg-white/10 rounded-lg">
            <LogOut size={16} /><span>Выйти</span>
          </button>
        </div>
      </aside>
    </>
  );
}
