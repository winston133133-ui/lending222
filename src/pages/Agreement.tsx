import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Agreement() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-purple-600 hover:text-purple-700"><ArrowLeft size={20} /><span>На главную</span></Link>
        </div>
      </header>
      <article className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Пользовательское соглашение</h1>
        <p className="text-gray-500 mb-8">Дата вступления в силу: 01.01.2024</p>
        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">1. Предмет соглашения</h2><p>Настоящее Соглашение регулирует отношения между ИП «Ростовые куклы» и физическим лицом по поводу использования сайта и заказа услуг.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">2. Порядок оплаты</h2><ul className="list-disc pl-6 space-y-1"><li>При бронировании взимается предоплата в размере 50%</li><li>Остаток оплачивается в день мероприятия</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">3. Отмена заказа</h2><ul className="list-disc pl-6 space-y-1"><li>При отмене более чем за 3 дня — предоплата возвращается</li><li>При отмене менее чем за 24 часа — предоплата не возвращается</li></ul></section>
        </div>
      </article>
    </div>
  );
}
