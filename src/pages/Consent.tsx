import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Consent() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-purple-600 hover:text-purple-700"><ArrowLeft size={20} /><span>На главную</span></Link>
        </div>
      </header>
      <article className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Согласие на обработку персональных данных</h1>
        <p className="text-gray-500 mb-8">Дата вступления в силу: 01.01.2024</p>
        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">1. Общие положения</h2><p>Настоящее Согласие на обработку персональных данных (далее — Согласие) разработано в соответствии с Федеральным законом от 27.07.2006 г. № 152-ФЗ «О персональных данных».</p><p className="mt-3">Пользователь, оставляя заявку на сайте «Ростовые куклы», принимает настоящее Согласие на обработку персональных данных (далее — Согласие).</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">2. Персональные данные</h2><p>Пользователь даёт согласие на обработку следующих персональных данных:</p><ul className="list-disc pl-6 space-y-1 mt-2"><li>Фамилия, имя, отчество</li><li>Контактный телефон</li><li>Адрес электронной почты</li><li>Адрес проведения мероприятия</li><li>Иные данные, переданные пользователем через форму заявки</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">3. Цели обработки персональных данных</h2><p>Персональные данные обрабатываются в следующих целях:</p><ul className="list-disc pl-6 space-y-1 mt-2"><li>Обработка заявок и заключение договоров на оказание услуг</li><li>Предоставление услуг по организации праздничных мероприятий</li><li>Связь с пользователем (телефон, email, мессенджеры)</li><li>Улучшение качества обслуживания</li><li>Выполнение требований законодательства РФ</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">4. Способы обработки персональных данных</h2><p>Обработка персональных данных осуществляется следующими способами:</p><ul className="list-disc pl-6 space-y-1 mt-2"><li>Сбор и запись на бумажных носителях</li><li>Систематизация и хранение в электронных базах данных</li><li>Использование, передача и блокирование</li><li>Уничтожение по истечении срока хранения</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">5. Срок обработки и хранения</h2><p>Обработка персональных данных осуществляется до момента достижения целей обработки или до отзыва согласия пользователем.</p><p className="mt-3">После достижения целей обработки или отзыва согласия персональные данные уничтожаются в срок не более 30 дней.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">6. Права пользователя</h2><p>Пользователь имеет право:</p><ul className="list-disc pl-6 space-y-1 mt-2"><li>Получить информацию о своих персональных данных</li><li>Требовать уточнения, блокирования или уничтожения данных</li><li>Отозвать согласие на обработку персональных данных</li><li>Обжаловать действия или бездействие оператора в суд</li></ul></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">7. Отзыв согласия</h2><p>Пользователь может отозвать согласие на обработку персональных данных, направив письменное заявление на адрес электронной почты оператора.</p><p className="mt-3">Оператор обязан прекратить обработку персональных данных в срок не более 30 дней с момента получения отзыва согласия.</p></section>
          <section><h2 className="text-xl font-bold text-gray-900 mb-3">8. Контакты оператора</h2><p>По всем вопросам, связанным с обработкой персональных данных, обращайтесь:</p><div className="bg-gray-50 p-4 rounded-lg mt-3"><p><strong>Телефон:</strong> +7 (8452) 123-456</p><p><strong>Email:</strong> info@rostovye-kukly.ru</p><p><strong>Адрес:</strong> г. Саратов, ул. Примерная, д. 1</p></div></section>
          <section className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg"><p className="text-sm text-purple-800"><strong>Важно:</strong> Отправляя заявку через форму на сайте, вы автоматически подтверждаете своё согласие с условиями обработки персональных данных.</p></section>
        </div>
      </article>
    </div>
  );
}
