import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-purple-600 hover:text-purple-700"><ArrowLeft size={20} /><span>На главную</span></Link>
        </div>
      </header>
      <article className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Политика обработки персональных данных</h1>
        <p className="text-gray-500 mb-8">Дата вступления в силу: 01.01.2024</p>
        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">1. Общие положения</h2><p>Настоящая Политика конфиденциальности определяет порядок обработки персональных данных пользователей сайта «Ростовые куклы».</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">2. Собираемые данные</h2><ul className="list-disc pl-6 space-y-1"><li>Фамилия, имя, отчество</li><li>Контактный телефон</li><li>Адрес электронной почты</li><li>Адрес проведения мероприятия</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">3. Цели обработки</h2><ul className="list-disc pl-6 space-y-1"><li>Обработка заявок и заключение договоров</li><li>Предоставление услуг по организации праздников</li><li>Связь с пользователем</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">4. Контакты</h2><p>По вопросам обработки ПД: <strong>+7 (8452) 123-456</strong></p></section>
        </div>
      </article>
    </div>
  );
}
