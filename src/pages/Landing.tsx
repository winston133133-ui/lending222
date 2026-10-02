import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Phone, Sparkles, X, Clock, Star, ChevronRight, ChevronLeft, MessageSquare, Send, MapPin, Shield, MessageCircle, ShoppingCart, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import type { Character } from '../types';

function HeroImageAnimation({ image }: { image: string }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div 
      className="hidden lg:flex justify-center items-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={imageRef}
        className="relative w-full max-w-md aspect-square transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg)`,
        }}
      >
        <img
          src={image}
          alt="Hero"
          className="w-full h-full object-contain"
        />
        <div className="absolute -top-8 -right-8 text-7xl transition-transform duration-300 animate-bounce" style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`, animationDuration: '3s' }}>🎈</div>
        <div className="absolute -bottom-8 -left-8 text-7xl transition-transform duration-300 animate-bounce" style={{ transform: `translate(${-mousePos.x * 0.5}px, ${-mousePos.y * 0.5}px)`, animationDuration: '4s', animationDelay: '0.5s' }}>🎊</div>
        <div className="absolute top-1/2 -right-10 text-6xl transition-transform duration-300 animate-pulse" style={{ transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`, animationDuration: '2s' }}>✨</div>
        <div className="absolute -top-10 left-1/4 text-5xl transition-transform duration-300 animate-pulse" style={{ transform: `translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px)`, animationDuration: '2.5s', animationDelay: '1s' }}>⭐</div>
        <div className="absolute bottom-1/4 -left-10 text-5xl transition-transform duration-300 animate-ping" style={{ transform: `translate(${-mousePos.x * 0.7}px, ${-mousePos.y * 0.7}px)`, animationDuration: '3s', animationDelay: '0.3s' }}>🎉</div>
        <div className="absolute top-1/4 -right-12 text-4xl transition-transform duration-300 animate-bounce" style={{ transform: `translate(${mousePos.x * 0.9}px, ${mousePos.y * 0.9}px)`, animationDuration: '2.8s', animationDelay: '0.7s' }}>🎁</div>
      </div>
    </div>
  );
}

function CharacterCard({ character, onOrder }: { character: Character; onOrder: () => void }) {
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  
  const gallery = character.gallery || [];
  const hasGallery = gallery.length > 0;
  
  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  const openImageModal = () => hasGallery && setShowImageModal(true);
  const closeImageModal = () => setShowImageModal(false);
  
  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
        {hasGallery ? (
          <div className="relative h-64 overflow-hidden group cursor-pointer" onClick={openImageModal}>
            <img src={gallery[currentImageIndex]} alt={`${character.name} - фото ${currentImageIndex + 1}`} className="w-full h-full object-cover transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
            {gallery.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-purple-700 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={20} /></button>
                <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-purple-700 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={20} /></button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {gallery.map((_, idx) => (<button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }} className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/60'}`} />))}
                </div>
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">{currentImageIndex + 1} / {gallery.length}</div>
              </>
            )}
          </div>
        ) : (
          <div className="h-64 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center"><span className="text-7xl">🎭</span></div>
        )}
        <div className="p-6">
          <h3 className="font-bold text-xl mb-2">{character.name}</h3>
          <p className="text-gray-500 mb-4 text-sm">{character.description}</p>
          <div className="space-y-2 mb-4">
            {(character.services || []).map((s) => (
              <div key={s.id} className="bg-gray-50 rounded-lg overflow-hidden">
                <button onClick={() => setExpandedService(expandedService === s.id ? null : s.id)} className="w-full flex justify-between items-center text-sm px-3 py-2 hover:bg-gray-100">
                  <span className="text-gray-700">{s.name}</span>
                  <span className="font-medium text-purple-600 flex items-center gap-1">{s.duration} мин · {s.price.toLocaleString()} ₽<ChevronRight size={14} className={`transition-transform ${expandedService === s.id ? 'rotate-90' : ''}`} /></span>
                </button>
                {expandedService === s.id && s.description && (
                  <div className="px-3 pb-2 text-xs text-gray-600 border-t border-gray-200 pt-2">
                    {s.description.split('\n').filter(line => line.trim()).map((line, idx) => (
                      <div key={idx} className="flex items-start gap-2 mb-1">
                        <span className="text-purple-600 font-bold flex-shrink-0">✦</span>
                        <span>{line.trim()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-400">от</p><p className="text-2xl font-bold text-purple-600">{(character.services?.length ? Math.min(...character.services.map(s => s.price)) : 0).toLocaleString()} ₽</p></div>
            <button onClick={onOrder} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-1">Заказать <ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
      
      {showImageModal && hasGallery && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={closeImageModal}>
          <button onClick={closeImageModal} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"><X size={32} /></button>
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={gallery[currentImageIndex]} alt={`${character.name} - фото ${currentImageIndex + 1}`} className="w-full h-auto max-h-[85vh] object-contain rounded-lg" />
            {gallery.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm"><ChevronLeft size={28} /></button>
                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm"><ChevronRight size={28} /></button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">{currentImageIndex + 1} / {gallery.length}</div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function Landing() {
  const store = useStore();
  const characters = store.characters || [];
  const settings = store.settings || ({} as any);
  const reviews = store.reviews || [];
  const crossProducts = store.crossProducts || [];
  
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCrossProducts, setSelectedCrossProducts] = useState<{ productId: string; quantity: number }[]>([]);
  const [formData, setFormData] = useState({ name: '', phone: '', date: '', time: '', address: '', characterId: '', serviceId: '', songs: '', comment: '' });

  const selectedCharacter = characters.find((c) => c.id === formData.characterId);
  const selectedService = selectedCharacter?.services.find((s) => s.id === formData.serviceId);

  const getAvailableTimeSlots = (date: string, serviceDuration: number = 30): string[] => {
    const { orders: allOrders = [] } = store;
    const allSlots: string[] = [];
    for (let hour = 6; hour < 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        allSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    const dayOrders = allOrders.filter((o) => o.eventDate === date && o.status !== 'CANCELLED');
    return allSlots.filter((slot) => {
      const [sH, sM] = slot.split(':').map(Number);
      const sStart = sH * 60 + sM;
      const sEnd = sStart + serviceDuration;
      for (const order of dayOrders) {
        const [oH, oM] = order.eventTime.split(':').map(Number);
        const oStart = oH * 60 + oM;
        const oEnd = oStart + (order.serviceDuration || 30);
        if (sStart < oEnd + 30 && sEnd > oStart - 30) return false;
      }
      return true;
    });
  };

  const availableTimeSlots = formData.date && selectedService ? getAvailableTimeSlots(formData.date, selectedService.duration) : [];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    const character = characters.find((c) => c.id === formData.characterId);
    const service = character?.services.find((s) => s.id === formData.serviceId);
    const { addOrder, addClient, clients } = store;
    const crossProductsList = selectedCrossProducts.map(({ productId, quantity }) => {
      const cp = crossProducts.find(c => c.id === productId);
      return { productId, productName: cp?.name || '', price: cp?.price || 0, quantity, image: cp?.image || '' };
    });
    const crossTotal = crossProductsList.reduce((sum, cp) => sum + (cp.price * cp.quantity), 0);
    const totalAmount = (service?.price || 0) + crossTotal;
    let client = clients.find((c) => c.phone === formData.phone);
    if (!client) {
      const newClient = { id: 'new-' + Date.now(), name: formData.name, phone: formData.phone, consentGiven: true, consentDate: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString().split('T')[0] };
      addClient(newClient);
      client = newClient;
    }
    addOrder({
      id: Date.now().toString(), clientId: client.id, clientName: formData.name, clientPhone: formData.phone,
      characterId: formData.characterId, characterName: character?.name || '', serviceId: service?.id,
      serviceName: service?.name, serviceDuration: service?.duration, status: 'NEW', eventDate: formData.date,
      eventTime: formData.time, address: formData.address, songs: formData.songs.split(',').map((s) => s.trim()).filter(Boolean),
      comment: formData.comment, totalAmount, prepaidAmount: 0, crossProducts: crossProductsList,
      createdAt: new Date().toISOString().split('T')[0],
    });
    setOrderSubmitted(true);
    setTimeout(() => { setShowOrderForm(false); setOrderSubmitted(false); setConsent(false); setCurrentStep(1); setSelectedCrossProducts([]); setFormData({ name: '', phone: '', date: '', time: '', address: '', characterId: '', serviceId: '', songs: '', comment: '' }); }, 3000);
  };

  const modalRef = useRef<HTMLDivElement>(null);
  const handleModalClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) setShowOrderForm(false);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowOrderForm(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (settings.icon) {
      let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.icon;
    }
    if (settings.siteSeoTitle) document.title = settings.siteSeoTitle;
  }, [settings.icon, settings.siteSeoTitle]);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.logo ? <img src={settings.logo} alt="Логотип" className="h-10 object-contain" /> : (<><Sparkles className="text-purple-600" size={28} /><span className="font-bold text-xl text-purple-900">Ростовые куклы</span></>)}
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollTo('characters')} className="text-gray-600 hover:text-purple-600">Персонажи</button>
            <button onClick={() => scrollTo('how')} className="text-gray-600 hover:text-purple-600">Как заказать</button>
            <button onClick={() => scrollTo('payment')} className="text-gray-600 hover:text-purple-600">Оплата</button>
            <button onClick={() => scrollTo('reviews')} className="text-gray-600 hover:text-purple-600">Отзывы</button>
            <button onClick={() => scrollTo('conditions')} className="text-gray-600 hover:text-purple-600">Условия</button>
            <button onClick={() => scrollTo('contacts')} className="text-gray-600 hover:text-purple-600">Контакты</button>
          </nav>
          <button onClick={() => setShowOrderForm(true)} className="bg-purple-600 text-white px-5 py-2.5 rounded-full font-medium hover:bg-purple-700 shadow-lg">Заказать</button>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white min-h-[650px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-[10%] text-6xl opacity-30 animate-bounce" style={{ animationDuration: '3.5s' }}>🎭</div>
          <div className="absolute top-1/4 right-[15%] text-5xl opacity-25 animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🎪</div>
          <div className="absolute bottom-1/3 left-[5%] text-5xl opacity-30 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>🎨</div>
          <div className="absolute bottom-10 right-[10%] text-6xl opacity-25 animate-pulse" style={{ animationDuration: '3s', animationDelay: '1.5s' }}>🎉</div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">{settings.heroTitle}</h1>
              <p className="text-lg lg:text-xl text-purple-100 mb-8">{settings.heroSubtitle}</p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => setShowOrderForm(true)} className="bg-white text-purple-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-purple-50 shadow-xl">Оставить заявку</button>
                <a href={`tel:${settings.phone}`} className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 flex items-center gap-2"><Phone size={20} />{settings.phone}</a>
              </div>
            </div>
            {settings.heroImage && <HeroImageAnimation image={settings.heroImage} />}
          </div>
        </div>
      </section>

      <section id="characters" className="py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">Наши персонажи</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {characters.filter(c => c.isActive).map((char) => (
              <CharacterCard key={char.id} character={char} onOrder={() => { setFormData(p => ({ ...p, characterId: char.id, serviceId: '' })); setShowOrderForm(true); }} />
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">Как заказать?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {(settings.howToOrderSteps || []).map((item) => (
              <div key={item.id} className="relative group">
                <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
                  <div className={`absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br ${item.color} text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg`}>{item.step}</div>
                  <div className="text-6xl mb-4">{item.icon}</div>
                  <h3 className={`font-bold text-xl mb-3 bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="payment" className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">💳 Способы оплаты</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {(settings.paymentMethods || []).filter(m => m.isActive).map((method) => {
              const colorClasses: any = {
                green: { border: 'border-green-200', gradient: 'from-green-500 to-emerald-600', dot: 'bg-green-500' },
                blue: { border: 'border-blue-200', gradient: 'from-blue-500 to-indigo-600', dot: 'bg-blue-500' },
                purple: { border: 'border-purple-200', gradient: 'from-purple-500 to-purple-600', dot: 'bg-purple-500' },
                orange: { border: 'border-orange-200', gradient: 'from-orange-500 to-orange-600', dot: 'bg-orange-500' }
              };
              const colors = colorClasses[method.color] || colorClasses.green;
              return (
                <div key={method.id} className={`bg-white rounded-3xl shadow-2xl p-6 lg:p-8 border-2 ${colors.border}`}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`bg-gradient-to-br ${colors.gradient} p-4 rounded-2xl text-white shadow-lg text-4xl`}>{method.icon}</div>
                    <div><h3 className="text-xl font-bold text-gray-800">{method.title}</h3><p className="text-gray-500 text-sm">{method.subtitle}</p></div>
                  </div>
                  <div className="space-y-3 text-gray-700 text-sm">
                    {method.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3"><div className={`w-2 h-2 ${colors.dot} rounded-full mt-2 flex-shrink-0`}></div><p>{item}</p></div>
                    ))}
                    {method.warning && <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg mt-4"><p className="font-semibold text-amber-900 text-xs">⚠️ {method.warning}</p></div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="reviews" className="py-20 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">Отзывы клиентов</h2>
          {(reviews || []).filter(r => r.isActive).length === 0 ? <p className="text-center text-gray-400">Отзывов пока нет</p> : (
            <div className="grid md:grid-cols-3 gap-8">
              {(reviews || []).filter(r => r.isActive).map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                  <div className="flex gap-1 mb-3">{Array.from({ length: review.rating }).map((_, j) => <Star key={j} size={16} className="fill-yellow-400 text-yellow-400" />)}</div>
                  <p className="text-gray-600 mb-4 italic">"{review.text}"</p>
                  <p className="font-bold text-purple-700">{review.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="conditions" className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">📋 Условия работы и доставки</h2>
          <div className="space-y-6">
            {(settings.workConditionSections || []).map((section) => (
              <div key={section.id} className={`rounded-2xl shadow-xl p-6 ${section.type === 'warning' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : section.type === 'rules' ? 'bg-white' : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'}`}>
                <div className="flex items-center gap-3 mb-4"><span className="text-3xl">{section.icon}</span><h3 className="text-2xl font-bold">{section.title}</h3></div>
                <div className="space-y-3 text-sm">{section.items.map((item, idx) => (<div key={idx} className={`${section.type === 'rules' ? 'bg-gray-50 border-l-4 border-gray-400' : 'bg-white/10'} rounded-lg p-3`}><p>{item}</p></div>))}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contacts" className="py-20 bg-gray-900 text-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">Контакты</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4"><Phone className="text-purple-400" size={24} /><div><p className="text-sm text-gray-400">Телефон</p><a href={`tel:${settings.phone}`} className="text-lg hover:text-purple-300">{settings.phone}</a></div></div>
              <div className="flex items-center gap-4"><MessageCircle className="text-green-400" size={24} /><div><p className="text-sm text-gray-400">WhatsApp</p><p className="text-lg">{settings.whatsapp}</p></div></div>
              <div className="flex items-center gap-4"><Send className="text-blue-400" size={24} /><div><p className="text-sm text-gray-400">Telegram</p><p className="text-lg">{settings.telegram}</p></div></div>
              <div className="flex items-center gap-4"><MessageSquare className="text-orange-400" size={24} /><div><p className="text-sm text-gray-400">Макс</p><p className="text-lg">{settings.maxMessenger}</p></div></div>
              <div className="flex items-center gap-4"><MapPin className="text-red-400" size={24} /><div><p className="text-sm text-gray-400">Адрес</p><p className="text-lg">{settings.address}</p></div></div>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MapPin size={20} className="text-purple-400" />Условия доставки</h3>
                <p className="text-gray-300 leading-relaxed">{settings.deliveryConditions}</p>
              </div>
              <div className="bg-gray-800 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Clock size={20} className="text-purple-400" />Правила работы</h3>
                <p className="text-gray-300 leading-relaxed">{settings.workRules}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-950 text-gray-400 py-8 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-sm mb-4 leading-relaxed">Сайт носит исключительно информационный характер и не является публичной офертой. Подробная информация о стоимости услуг и товаров, их наличии, видах и характеристиках вы можете узнать в нашем отделе продаж.</p>
          <p className="mb-3">© 2024 Ростовые куклы — Саратов</p>
          <div className="flex justify-center gap-4 text-sm flex-wrap">
            <Link to="/privacy" className="text-purple-400 hover:text-purple-300">Политика конфиденциальности</Link>
            <span>·</span>
            <Link to="/consent" className="text-purple-400 hover:text-purple-300">Согласие на обработку ПД</Link>
            <span>·</span>
            <Link to="/login" className="text-purple-400 hover:text-purple-300">Вход для сотрудников →</Link>
          </div>
        </div>
      </footer>

      {showOrderForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={handleModalClick}>
          <div ref={modalRef} className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto p-6">
            {orderSubmitted ? (
              <div className="text-center py-12"><div className="text-6xl mb-4">🎉</div><h3 className="text-2xl font-bold mb-2">Заявка отправлена!</h3></div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4"><h3 className="text-xl font-bold">Шаг {currentStep} из 4</h3><button onClick={() => { setShowOrderForm(false); setCurrentStep(1); }} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button></div>
                <div className="flex gap-1 mb-6">{[1, 2, 3, 4].map((step) => (<div key={step} className={`flex-1 h-1.5 rounded-full ${step <= currentStep ? 'bg-purple-600' : 'bg-gray-200'}`} />))}</div>
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Выберите персонажа</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {characters.filter(c => c.isActive).map((c) => (<button key={c.id} type="button" onClick={() => setFormData(p => ({ ...p, characterId: c.id, serviceId: '' }))} className={`p-3 rounded-lg border-2 text-left transition-all ${formData.characterId === c.id ? 'border-purple-600 bg-purple-50 shadow-md' : 'border-gray-200 hover:border-purple-300'}`}><div className="font-medium text-sm">{c.name}</div></button>))}
                    </div>
                    {selectedCharacter && (selectedCharacter.services || []).length > 0 && (
                      <div><h4 className="font-semibold text-lg mt-4">Выберите услугу</h4><div className="grid gap-2 mt-2">{(selectedCharacter.services || []).map((service) => (<button key={service.id} type="button" onClick={() => setFormData(p => ({ ...p, serviceId: service.id }))} className={`p-3 rounded-lg border-2 text-left transition-all ${formData.serviceId === service.id ? 'border-purple-600 bg-purple-50 shadow-md' : 'border-gray-200 hover:border-purple-300'}`}><div className="flex items-center justify-between"><div className="flex-1"><div className="font-semibold text-sm">{service.name}</div><div className="flex items-center gap-3 text-xs mt-0.5"><span className="text-gray-600 flex items-center gap-1"><Clock size={12} />{service.duration} мин</span><span className="font-bold text-purple-600">{service.price.toLocaleString()} ₽</span></div></div>{formData.serviceId === service.id && <Check size={20} className="text-purple-600" />}</div></button>))}</div></div>
                    )}
                    <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowOrderForm(false)} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">Отмена</button><button type="button" onClick={() => setCurrentStep(2)} disabled={!formData.characterId || !formData.serviceId} className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">Далее <ArrowRight size={16} /></button></div>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Дата и место</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium mb-1">Дата *</label><input required type="date" value={formData.date} onChange={(e) => setFormData(p => ({ ...p, date: e.target.value, time: '' }))} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500" /></div>
                      <div><label className="block text-sm font-medium mb-1">Время *</label>{!formData.date || !selectedService ? (<div className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-gray-400 text-sm">Сначала дату</div>) : availableTimeSlots.length === 0 ? (<div className="border border-red-200 bg-red-50 rounded-lg px-4 py-2.5 text-red-600 text-sm">Нет свободного времени</div>) : (<select required value={formData.time} onChange={(e) => setFormData(p => ({ ...p, time: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500"><option value="">Время</option>{availableTimeSlots.map((s) => <option key={s} value={s}>{s}</option>)}</select>)}</div>
                    </div>
                    <div><label className="block text-sm font-medium mb-1">Адрес *</label><input required type="text" value={formData.address} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500" placeholder="Адрес" /></div>
                    <div className="flex gap-3 pt-2"><button type="button" onClick={() => setCurrentStep(1)} className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"><ArrowLeft size={16} />Назад</button><button type="button" onClick={() => setCurrentStep(3)} disabled={!formData.date || !formData.time || !formData.address} className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">Далее <ArrowRight size={16} /></button></div>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2"><ShoppingCart size={20} />Дополнительно</h4>
                    {(crossProducts || []).filter(cp => cp.isActive).length === 0 ? (<p className="text-gray-400 text-sm text-center py-8">Дополнительных товаров нет</p>) : (
                      <div className="grid grid-cols-1 gap-3">{crossProducts.filter(cp => cp.isActive).map((cp) => {
                        const selected = selectedCrossProducts.find(s => s.productId === cp.id);
                        const quantity = selected?.quantity || 0;
                        return (
                          <div key={cp.id} className={`p-3 rounded-lg border-2 transition-all ${quantity > 0 ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                            <div className="flex items-center gap-3">
                              {cp.image ? (<img src={cp.image} alt={cp.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />) : (<div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"><ShoppingCart size={24} className="text-gray-400" /></div>)}
                              <div className="flex-1 min-w-0"><div className="font-medium text-sm">{cp.name}</div>{cp.description && <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{cp.description}</div>}<div className="font-bold text-purple-600 text-sm mt-1">{cp.price.toLocaleString()} ₽</div></div>
                              {quantity > 0 ? (<div className="flex items-center gap-2 flex-shrink-0"><button type="button" onClick={() => setSelectedCrossProducts(p => quantity <= 1 ? p.filter(s => s.productId !== cp.id) : p.map(s => s.productId === cp.id ? { ...s, quantity: s.quantity - 1 } : s))} className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold">−</button><span className="w-8 text-center font-semibold">{quantity}</span><button type="button" onClick={() => setSelectedCrossProducts(p => p.some(s => s.productId === cp.id) ? p.map(s => s.productId === cp.id ? { ...s, quantity: s.quantity + 1 } : s) : [...p, { productId: cp.id, quantity: 1 }])} className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold">+</button></div>) : (<button type="button" onClick={() => setSelectedCrossProducts(p => [...p, { productId: cp.id, quantity: 1 }])} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition flex-shrink-0">+ Добавить</button>)}
                            </div>
                            {quantity > 0 && (<div className="text-right mt-2 pt-2 border-t border-purple-200"><span className="text-sm font-semibold text-purple-700">{(cp.price * quantity).toLocaleString()} ₽</span></div>)}
                          </div>
                        );
                      })}</div>
                    )}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex justify-between items-center"><span className="text-sm text-gray-700">Итого:</span><span className="font-bold text-purple-700 text-lg">{((selectedService?.price || 0) + selectedCrossProducts.reduce((sum, cp) => sum + ((crossProducts.find(c => c.id === cp.productId)?.price || 0) * cp.quantity), 0)).toLocaleString()} ₽</span></div>
                    </div>
                    <div className="flex gap-3 pt-2"><button type="button" onClick={() => setCurrentStep(2)} className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"><ArrowLeft size={16} />Назад</button><button type="button" onClick={() => setCurrentStep(4)} className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-2">Далее <ArrowRight size={16} /></button></div>
                  </div>
                )}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Ваши контакты</h4>
                    <div><label className="block text-sm font-medium mb-1">Ваше имя *</label><input required type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500" placeholder="Как к вам обращаться?" /></div>
                    <div><label className="block text-sm font-medium mb-1">Телефон *</label><input required type="tel" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500" placeholder="+7 (___) ___-__-__" /></div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-sm mb-2">Ваш заказ:</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">{selectedCharacter?.name} · {selectedService?.name}</span><span className="font-medium">{selectedService?.price.toLocaleString()} ₽</span></div>
                        {selectedCrossProducts.map((cp) => {
                          const product = crossProducts.find(c => c.id === cp.productId);
                          return product ? <div key={cp.productId} className="flex justify-between"><span className="text-gray-600">+ {product.name} × {cp.quantity}</span><span className="font-medium">{(product.price * cp.quantity).toLocaleString()} ₽</span></div> : null;
                        })}
                        <div className="border-t border-gray-300 pt-1 mt-1 flex justify-between"><span className="font-bold">Итого:</span><span className="font-bold text-purple-700">{((selectedService?.price || 0) + selectedCrossProducts.reduce((sum, cp) => sum + ((crossProducts.find(c => c.id === cp.productId)?.price || 0) * cp.quantity), 0)).toLocaleString()} ₽</span></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500" />
                        <span className="text-xs text-gray-600">Я согласен на <Link to="/privacy" target="_blank" className="text-purple-600 underline">обработку персональных данных</Link></span>
                      </label>
                    </div>
                    <form onSubmit={handleSubmit}>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setCurrentStep(3)} className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"><ArrowLeft size={16} />Назад</button>
                        <button type="submit" disabled={!consent || !formData.name || !formData.phone} className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed">Отправить заявку</button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
