import { Outlet, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import CRMSidebar from './CRMSidebar';

export default function CRMLayout() {
  const { currentUser } = useStore();
  
  useEffect(() => {
    document.title = 'Панель администратора';
  }, []);
  
  if (!currentUser) return <Navigate to="/login" replace />;
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <CRMSidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8 max-w-full"><Outlet /></div>
      </main>
    </div>
  );
}
