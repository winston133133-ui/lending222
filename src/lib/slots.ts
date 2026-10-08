import type { Order, SiteSettings } from '../types';

const toMin = (t: string): number => {
  const [h, m] = (t || '0:0').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

const fromMin = (v: number): string => `${Math.floor(v / 60).toString().padStart(2, '0')}:${(v % 60).toString().padStart(2, '0')}`;

/**
 * Динамическое формирование доступных слотов бронирования:
 * - границы времени (по умолчанию 06:00–23:00), интервал и буфер берутся из настроек сайта;
 * - занятое время (мероприятие + буфер ±N минут) не предлагается клиенту;
 * - отменённые заявки не блокируют слоты.
 */
export function getAvailableTimeSlots(
  orders: Order[],
  settings: SiteSettings,
  date: string,
  serviceDuration: number = 30,
): string[] {
  const b = settings?.booking;
  const start = toMin(b?.startTime || '06:00');
  const end = toMin(b?.endTime || '23:00');
  const interval = Math.max(5, b?.slotInterval || 30);
  const buffer = b?.bufferMinutes ?? 30;

  const slots: string[] = [];
  for (let t = start; t + serviceDuration <= end; t += interval) {
    slots.push(fromMin(t));
  }

  const dayOrders = (orders || []).filter((o) => o.eventDate === date && o.status !== 'CANCELLED');
  return slots.filter((slot) => {
    const sStart = toMin(slot);
    const sEnd = sStart + serviceDuration;
    for (const o of dayOrders) {
      const oStart = toMin(o.eventTime);
      const oEnd = oStart + (o.serviceDuration || 30);
      // слот пересекается с мероприятием или попадает в буфер ±N минут
      if (sStart < oEnd + buffer && sEnd > oStart - buffer) return false;
    }
    return true;
  });
}

export const bookingLimits = (settings: SiteSettings) => ({
  startTime: settings?.booking?.startTime || '06:00',
  endTime: settings?.booking?.endTime || '23:00',
  slotInterval: settings?.booking?.slotInterval || 30,
  bufferMinutes: settings?.booking?.bufferMinutes ?? 30,
});
