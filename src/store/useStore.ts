import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Client, Character, Order, SiteSettings, Review, GalleryItem, CrossProduct } from '../types';

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

const initialSettings: SiteSettings = {
  phone: '+7 (8452) 123-456',
  whatsapp: '+7 (927) 123-45-67',
  telegram: '@rostovye_kukly',
  maxMessenger: '@rostovye_kukly',
  address: 'г. Саратов',
  deliveryConditions: 'Доставка бесплатно от 5000₽',
  workRules: 'Минимальное время 20 минут',
  workAndDeliveryConditions: '',
  workConditionSections: [],
  howToOrderSteps: [],
  paymentInfo: '',
  paymentMethods: [],
  heroTitle: 'Ростовые куклы в Саратове',
  heroSubtitle: 'Яркие праздники для ваших детей!',
  heroImage: '',
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
    }),
    {
      name: 'crm-party-storage',
      version: 1,
    }
  )
);
