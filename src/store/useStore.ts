import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Client, Character, Order, SiteSettings, Review, GalleryItem, CrossProduct, ContactLink, Story, WorkSchedule } from '../types';

const initialCharacters: Character[] = [
  {
    id: '1',
    name: 'Микки Маус',
    description: 'Любимый персонаж детей всех возрастов! Танцы, игры, фотосессия.',
    gallery: [],
    services: [
      { id: 's1', name: 'Экспресс-поздравление', description: 'Быстрое поздравление с песней и танцами', duration: 20, price: 5000 },
      { id: 's2', name: 'Открытие магазина', description: 'Торжественное открытие с конкурсами и играми', duration: 40, price: 8000 },
    ],
    seoTitle: 'Микки Маус на праздник в Саратове',
    seoDescription: 'Закажите Микки Мауса',
    seoKeywords: 'микки маус',
    isActive: true,
  },
  {
    id: '2',
    name: 'Человек-Паук',
    description: 'Супергерой для настоящих фанатов Marvel! Трюки, игры, поздравления.',
    gallery: [],
    services: [
      { id: 's1', name: 'Экспресс-поздравление', description: 'Супергеройское поздравление', duration: 20, price: 6000 },
      { id: 's2', name: 'Открытие магазина', description: 'Геройское открытие', duration: 40, price: 10000 },
    ],
    seoTitle: 'Человек-Паук Саратов',
    seoDescription: 'Человек-Паук на праздник',
    seoKeywords: 'человек-паук',
    isActive: true,
  },
];

const initialClients: Client[] = [
  { id: '1', name: 'Анна Петрова', phone: '+7 (927) 123-45-67', email: 'anna@mail.ru', consentGiven: true, consentDate: '2024-01-15', createdAt: '2024-01-15' },
];

const today = new Date().toISOString().split('T')[0];

const initialOrders: Order[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Анна Петрова',
    clientPhone: '+7 (927) 123-45-67',
    characterId: '1',
    characterName: 'Микки Маус',
    serviceId: 's2',
    serviceName: 'Открытие магазина',
    serviceDuration: 40,
    status: 'CONFIRMED',
    eventDate: today,
    eventTime: '14:00',
    address: 'г. Саратов',
    songs: ['Happy Birthday'],
    totalAmount: 8000,
    prepaidAmount: 4000,
    createdAt: '2024-03-20',
  },
];

const initialContactLinks: ContactLink[] = [
  { id: 'cl1', type: 'phone', icon: 'https://cdn-icons-png.flaticon.com/512/724/724664.png', label: 'Телефон', value: '+7 (8452) 123-456', link: 'tel:+78452123456', isActive: true },
  { id: 'cl2', type: 'link', icon: 'https://cdn-icons-png.flaticon.com/512/733/733585.png', label: 'WhatsApp', value: '+7 (927) 123-45-67', link: 'https://wa.me/79271234567', isActive: true },
  { id: 'cl3', type: 'link', icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111646.png', label: 'Telegram', value: '@rostovye_kukly', link: 'https://t.me/rostovye_kukly', isActive: true },
  { id: 'cl4', type: 'link', icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968769.png', label: 'Макс', value: '@rostovye_kukly', link: 'https://max.ru/rostovye_kukly', isActive: true },
];

const initialStories: Story[] = [];

const initialWorkSchedule: WorkSchedule[] = [
  { id: 'ws1', day: 'Понедельник', startTime: '09:00', endTime: '21:00', isActive: true },
  { id: 'ws2', day: 'Вторник', startTime: '09:00', endTime: '21:00', isActive: true },
  { id: 'ws3', day: 'Среда', startTime: '09:00', endTime: '21:00', isActive: true },
  { id: 'ws4', day: 'Четверг', startTime: '09:00', endTime: '21:00', isActive: true },
  { id: 'ws5', day: 'Пятница', startTime: '09:00', endTime: '22:00', isActive: true },
  { id: 'ws6', day: 'Суббота', startTime: '10:00', endTime: '22:00', isActive: true },
  { id: 'ws7', day: 'Воскресенье', startTime: '10:00', endTime: '21:00', isActive: true },
];

const defaultWorkConditionSections: SiteSettings['workConditionSections'] = [
  {
    id: 'wc-delivery',
    title: 'Доставка ростовой куклы',
    icon: '🚗',
    type: 'info',
    items: [
      'Доставка по г. Саратов и г. Энгельс — бесплатно при заказе от 5000 ₽.',
      'Выезд за пределы города рассчитывается индивидуально (300 ₽/км от границы города).',
      'Подача персонажа точно ко времени — при опоздании клиента более чем на 15 минут время мероприятия сокращается.',
      'Для мероприятий на турбазах и за городом просьба уточнять маршрут заранее.',
    ],
  },
  {
    id: 'wc-time',
    title: 'Время работы ростовой куклы',
    icon: '⏰',
    type: 'rules',
    items: [
      'Работаем ежедневно с 06:00 до 23:00.',
      'Минимальная длительность выступления — 20 минут.',
      'Между мероприятиями предусмотрен технологический перерыв 30 минут (подготовка костюма, репетиция).',
      'Продлить выступление можно на месте, если следующее бронирование позволяет.',
    ],
  },
];

const defaultPaymentMethods: SiteSettings['paymentMethods'] = [
  {
    id: 'pm-sber',
    title: 'Оплата на карту Сбербанк',
    icon: '💳',
    subtitle: 'Реквизиты отправляем в мессенджер',
    color: 'green',
    isActive: true,
    items: [
      'Перевод на карту Сбербанк по номеру телефона.',
      'Реквизиты карты менеджер отправляет в WhatsApp / Telegram после подтверждения заявки.',
      'Доступна предоплата 50% — остаток вносится в день мероприятия.',
    ],
    warning: 'Заказ считается принятым только после внесения предоплаты и подтверждения менеджером.',
  },
  {
    id: 'pm-invoice',
    title: 'Безналичный расчёт для юр. лиц',
    icon: '🏦',
    subtitle: 'Работаем с организациями и ИП',
    color: 'blue',
    isActive: true,
    items: [
      'Выставляем счёт с НДС / без НДС, подписываем договор и акт оказанных услуг.',
      'Заявки для юридических лиц — по email или телефону.',
      'Отправляйте реквизиты компании на: dmitriirusakov-sar@mail.ru',
    ],
    warning: 'Заказ считается принятым только после внесения предоплаты и подтверждения менеджером.',
  },
];

const defaultHowToOrderSteps: SiteSettings['howToOrderSteps'] = [
  { id: 'ho-1', step: '1', icon: '📞', title: 'Оставьте заявку', description: 'Выберите персонажа, услугу и удобное время прямо на сайте — или позвоните нам.', color: 'from-purple-500 to-purple-700' },
  { id: 'ho-2', step: '2', icon: '🤝', title: 'Подтверждение', description: 'Менеджер свяжется с вами в течение 15 минут, уточнит детали и отправит реквизиты.', color: 'from-pink-500 to-rose-600' },
  { id: 'ho-3', step: '3', icon: '🎉', title: 'Праздник!', description: 'Внесена предоплата — заказ подтверждён. Персонаж приедет точно ко времени.', color: 'from-orange-500 to-amber-600' },
];

const initialSettings: SiteSettings = {
  phone: '+7 (8452) 123-456',
  whatsapp: '+7 (927) 123-45-67',
  telegram: '@rostovye_kukly',
  maxMessenger: '@rostovye_kukly',
  address: 'г. Саратов и г. Энгельс',
  booking: { enabled: true, startTime: '06:00', endTime: '23:00', slotInterval: 30, bufferMinutes: 30 },
  deliveryConditions: 'Доставка по Саратову и Энгельсу бесплатно при заказе от 5000 ₽. За городом — 300 ₽/км.',
  workRules: 'Работаем ежедневно с 06:00 до 23:00. Минимальная длительность выступления — 20 минут.',
  workAndDeliveryConditions: '',
  workConditionSections: defaultWorkConditionSections,
  howToOrderSteps: defaultHowToOrderSteps,
  paymentInfo: 'Оплата на карту Сбербанк или безналичный расчёт для юр. лиц. Заказ считается принятым только после внесения предоплаты и подтверждения менеджером.',
  paymentMethods: defaultPaymentMethods,
  heroTitle: 'Ростовые куклы в Саратове',
  heroSubtitle: 'Яркие праздники для ваших детей!',
  heroImage: '',
  heroBackgroundImage: '',
  logo: '',
  icon: '',
  siteSeoTitle: 'Ростовые куклы Саратов',
  siteSeoDescription: 'Закажите ростовых кукол на праздник',
  siteSeoKeywords: 'ростовые куклы, саратов',
  telegramBotToken: '',
  telegramChatId: '',
  notificationEmail: '',
  enableTelegramNotifications: false,
  enableEmailNotifications: false,
  contactLinks: initialContactLinks,
  stories: initialStories,
  workSchedule: initialWorkSchedule,
  subscriptionEnabled: true,
  subscriptionTitle: 'Подпишитесь на обновления',
  subscriptionDescription: 'Получайте новости о специальных предложениях и акциях первыми!',
  subscriptionImage: '',
};

const initialUsers: User[] = [
  { id: '1', email: 'admin@crm.ru', password: 'admin', name: 'Администратор', role: 'ADMIN', createdAt: '2024-01-01' },
  { id: '2', email: 'manager@crm.ru', password: 'manager', name: 'Менеджер', role: 'MANAGER', createdAt: '2024-01-01' },
];

const initialReviews: Review[] = [
  { id: '1', name: 'Елена М.', text: 'Отличный праздник!', rating: 5, isActive: true, createdAt: '2024-03-15' },
];

const initialGallery: GalleryItem[] = [];

const initialCrossProducts: CrossProduct[] = [
  { id: 'cp1', name: 'Гелиевые шары', image: '', price: 1500, description: '10 штук', isActive: true },
];

interface StoreState {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (id: string, data: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  markOrderAsRead: (id: string) => void;
  markAllOrdersAsRead: () => void;
  clients: Client[];
  addClient: (client: Client) => void;
  updateClient: (id: string, data: Partial<Client>) => void;
  characters: Character[];
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, data: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  settings: SiteSettings;
  updateSettings: (data: Partial<SiteSettings>) => void;
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  reviews: Review[];
  addReview: (review: Review) => void;
  updateReview: (id: string, data: Partial<Review>) => void;
  deleteReview: (id: string) => void;
  gallery: GalleryItem[];
  addGalleryItem: (item: GalleryItem) => void;
  updateGalleryItem: (id: string, data: Partial<GalleryItem>) => void;
  deleteGalleryItem: (id: string) => void;
  crossProducts: CrossProduct[];
  addCrossProduct: (item: CrossProduct) => void;
  updateCrossProduct: (id: string, data: Partial<CrossProduct>) => void;
  deleteCrossProduct: (id: string) => void;
  contactLinks: ContactLink[];
  addContactLink: (link: ContactLink) => void;
  updateContactLink: (id: string, data: Partial<ContactLink>) => void;
  deleteContactLink: (id: string) => void;
  stories: Story[];
  addStory: (story: Story) => void;
  updateStory: (id: string, data: Partial<Story>) => void;
  deleteStory: (id: string) => void;
  workSchedule: WorkSchedule[];
  updateWorkSchedule: (id: string, data: Partial<WorkSchedule>) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      currentUser: null,
      login: (email: string, password: string) => {
        const state = useStore.getState();
        const user = state.users.find((u) => u.email === email && u.password === password);
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },
      logout: () => set({ currentUser: null }),
      orders: initialOrders,
      addOrder: (order) => set((state) => ({ orders: [...state.orders, { ...order, isNew: true }] })),
      updateOrder: (id, data) => set((state) => ({ orders: state.orders.map((o) => (o.id === id ? { ...o, ...data } : o)) })),
      deleteOrder: (id) => set((state) => ({ orders: state.orders.filter((o) => o.id !== id) })),
      markOrderAsRead: (id) => set((state) => ({ orders: state.orders.map((o) => (o.id === id ? { ...o, isNew: false } : o)) })),
      markAllOrdersAsRead: () => set((state) => ({ orders: state.orders.map((o) => ({ ...o, isNew: false })) })),
      clients: initialClients,
      addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
      updateClient: (id, data) => set((state) => ({ clients: state.clients.map((c) => (c.id === id ? { ...c, ...data } : c)) })),
      characters: initialCharacters,
      addCharacter: (character) => set((state) => ({ characters: [...state.characters, character] })),
      updateCharacter: (id, data) => set((state) => ({ characters: state.characters.map((c) => (c.id === id ? { ...c, ...data } : c)) })),
      deleteCharacter: (id) => set((state) => ({ characters: state.characters.filter((c) => c.id !== id) })),
      settings: initialSettings,
      updateSettings: (data) => set((state) => ({ settings: { ...state.settings, ...data } })),
      users: initialUsers,
      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: (id, data) => set((state) => ({ users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)) })),
      deleteUser: (id) => set((state) => ({ users: state.users.filter((u) => u.id !== id) })),
      reviews: initialReviews,
      addReview: (review) => set((state) => ({ reviews: [...state.reviews, review] })),
      updateReview: (id, data) => set((state) => ({ reviews: state.reviews.map((r) => (r.id === id ? { ...r, ...data } : r)) })),
      deleteReview: (id) => set((state) => ({ reviews: state.reviews.filter((r) => r.id !== id) })),
      gallery: initialGallery,
      addGalleryItem: (item) => set((state) => ({ gallery: [...state.gallery, item] })),
      updateGalleryItem: (id, data) => set((state) => ({ gallery: state.gallery.map((g) => (g.id === id ? { ...g, ...data } : g)) })),
      deleteGalleryItem: (id) => set((state) => ({ gallery: state.gallery.filter((g) => g.id !== id) })),
      crossProducts: initialCrossProducts,
      addCrossProduct: (item) => set((state) => ({ crossProducts: [...state.crossProducts, item] })),
      updateCrossProduct: (id, data) => set((state) => ({ crossProducts: state.crossProducts.map((c) => (c.id === id ? { ...c, ...data } : c)) })),
      deleteCrossProduct: (id) => set((state) => ({ crossProducts: state.crossProducts.filter((c) => c.id !== id) })),
      contactLinks: initialContactLinks,
      addContactLink: (link) => set((state) => ({ contactLinks: [...state.contactLinks, link] })),
      updateContactLink: (id, data) => set((state) => ({ contactLinks: state.contactLinks.map((c) => (c.id === id ? { ...c, ...data } : c)) })),
      deleteContactLink: (id) => set((state) => ({ contactLinks: state.contactLinks.filter((c) => c.id !== id) })),
      stories: initialStories,
      addStory: (story) => set((state) => ({ stories: [...state.stories, story] })),
      updateStory: (id, data) => set((state) => ({ stories: state.stories.map((s) => (s.id === id ? { ...s, ...data } : s)) })),
      deleteStory: (id) => set((state) => ({ stories: state.stories.filter((s) => s.id !== id) })),
      workSchedule: initialWorkSchedule,
      updateWorkSchedule: (id, data) => set((state) => ({ workSchedule: state.workSchedule.map((w) => (w.id === id ? { ...w, ...data } : w)) })),
    }),
    {
      name: 'crm-party-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        // Миграция со старых версий: дожимаем недостающие поля настроек дефолтами
        const s = persistedState || {};
        if (version < 2 && s.settings) {
          s.settings = {
            ...initialSettings,
            ...s.settings,
            booking: s.settings.booking ?? initialSettings.booking,
            workConditionSections: (s.settings.workConditionSections && s.settings.workConditionSections.length > 0) ? s.settings.workConditionSections : initialSettings.workConditionSections,
            paymentMethods: (s.settings.paymentMethods && s.settings.paymentMethods.length > 0) ? s.settings.paymentMethods : initialSettings.paymentMethods,
            howToOrderSteps: (s.settings.howToOrderSteps && s.settings.howToOrderSteps.length > 0) ? s.settings.howToOrderSteps : initialSettings.howToOrderSteps,
          };
        }
        return s;
      },
    }
  )
);
