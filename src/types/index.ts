export type Role = 'ADMIN' | 'MANAGER';
export type OrderStatus = 'NEW' | 'PROCESSING' | 'PREPAID' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  consentGiven: boolean;
  consentDate?: string;
  createdAt: string;
}

export interface CharacterService {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  gallery: string[];
  services: CharacterService[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  isActive: boolean;
}

export interface OrderCrossProduct {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  characterId: string;
  characterName: string;
  serviceId?: string;
  serviceName?: string;
  serviceDuration?: number;
  status: OrderStatus;
  eventDate: string;
  eventTime: string;
  address: string;
  songs: string[];
  comment?: string;
  totalAmount: number;
  prepaidAmount: number;
  crossProducts?: OrderCrossProduct[];
  receiptImage?: string;
  receiptDate?: string;
  receiptEmail?: string;
  createdAt: string;
  isNew?: boolean;
}

export interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  image: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface CrossProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  description?: string;
  isActive: boolean;
}

export interface HowToOrderStep {
  id: string;
  step: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

export interface WorkConditionSection {
  id: string;
  title: string;
  icon: string;
  items: string[];
  type: 'info' | 'warning' | 'rules';
}

export interface PaymentMethod {
  id: string;
  title: string;
  icon: string;
  subtitle: string;
  items: string[];
  warning?: string;
  color: 'green' | 'blue' | 'purple' | 'orange';
  isActive: boolean;
}

export interface ContactLink {
  id: string;
  type: 'phone' | 'link';
  icon: string; // URL изображения
  label: string;
  value: string;
  link: string;
  isActive: boolean;
}

export interface Story {
  id: string;
  type: 'photo' | 'video';
  media: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface WorkSchedule {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface SiteSettings {
  phone: string;
  whatsapp: string;
  telegram: string;
  maxMessenger: string;
  address: string;
  deliveryConditions: string;
  workRules: string;
  workAndDeliveryConditions: string;
  workConditionSections: WorkConditionSection[];
  howToOrderSteps: HowToOrderStep[];
  paymentInfo: string;
  paymentMethods: PaymentMethod[];
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  heroBackgroundImage?: string;
  logo?: string;
  icon?: string;
  siteSeoTitle: string;
  siteSeoDescription: string;
  siteSeoKeywords: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  notificationEmail?: string;
  enableTelegramNotifications?: boolean;
  enableEmailNotifications?: boolean;
  contactLinks: ContactLink[];
  stories: Story[];
  workSchedule: WorkSchedule[];
  subscriptionEnabled: boolean;
  subscriptionTitle: string;
  subscriptionDescription: string;
  subscriptionImage?: string;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: 'Новая',
  PROCESSING: 'Обработка',
  PREPAID: 'Предоплата 50%',
  CONFIRMED: 'Подтверждено',
  COMPLETED: 'Завершено',
  CANCELLED: 'Отменено',
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800 border-blue-200',
  PROCESSING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PREPAID: 'bg-purple-100 text-purple-800 border-purple-200',
  CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};
