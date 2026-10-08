import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Phone, Sparkles, X, Clock, Star, ChevronRight, ChevronLeft, MessageSquare, Send, MapPin, Shield, MessageCircle, ShoppingCart, Check, ArrowRight, ArrowLeft, Image as ImageIcon, CreditCard, ClipboardList, Users, HelpCircle, MessageCircleIcon } from 'lucide-react';
import type { Character, Story } from '../types';
import { getAvailableTimeSlots as libGetAvailableTimeSlots, bookingLimits } from '../lib/slots';

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

function StoriesViewer({ stories, onClose }: { stories: Story[]; onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (!currentStory) return;

    if (currentStory.type === 'video' && videoRef.current) {
      videoRef.current.play();
      const handleVideoEnd = () => {
        if (currentIndex < stories.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setProgress(0);
        } else {
          onClose();
        }
      };
      videoRef.current.addEventListener('ended', handleVideoEnd);
      return () => videoRef.current?.removeEventListener('ended', handleVideoEnd);
    } else {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if (currentIndex < stories.length - 1) {
              setCurrentIndex(currentIndex + 1);
              return 0;
            } else {
              onClose();
              return 0;
            }
          }
          return prev + 1;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [currentIndex, currentStory, stories.length, onClose]);

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
        <X size={32} />
      </button>
      
      <div className="relative w-full max-w-2xl h-[80vh] mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Progress bars */}
        <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
          {stories.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100"
                style={{ 
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Story content */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
          {currentStory.type === 'video' ? (
            <video 
              ref={videoRef}
              src={currentStory.media} 
              className="w-full h-full object-contain"
              controls={false}
            />
          ) : (
            <img 
              src={currentStory.media} 
              alt={currentStory.title}
              className="w-full h-full object-contain"
            />
          )}
          
          {/* Story info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h3 className="text-white text-xl font-bold mb-2">{currentStory.title}</h3>
            {currentStory.description && (
              <p className="text-white/90 text-sm">{currentStory.description}</p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <button 
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={28} />
        </button>
        <button 
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm"
        >
          <ChevronRight size={28} />
        </button>

        {/* Click areas for navigation */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={goToPrev} />
          <div className="w-1/3 h-full" />
          <div className="w-1/3 h-full cursor-pointer" onClick={goToNext} />
        </div>
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
                <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#800080] p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={20} /></button>
                <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#800080] p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={20} /></button>
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
                  <span className="font-medium text-[#800080] flex items-center gap-1">{s.duration} мин · {s.price.toLocaleString()} ₽<ChevronRight size={14} className={`transition-transform ${expandedService === s.id ? 'rotate-90' : ''}`} /></span>
                </button>
                {expandedService === s.id && s.description && (
                  <div className="px-3 pb-2 text-xs text-gray-600 border-t border-gray-200 pt-2">
                    {s.description.split('\n').filter(line => line.trim()).map((line, idx) => (
                      <div key={idx} className="flex items-start gap-2 mb-1">
                        <span className="text-[#800080] font-bold flex-shrink-0">✦</span>
                        <span>{line.trim()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-400">от</p><p className="text-2xl font-bold text-[#800080]">{(character.services?.length ? Math.min(...character.services.map(s => s.price)) : 0).toLocaleString()} ₽</p></div>
            <button onClick={onOrder} className="bg-[#800080] text-white px-4 py-2 rounded-lg hover:bg-[#660066] flex items-center gap-1">Заказать <ChevronRight size={16} /></button>
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
  const gallery = store.gallery || [];
  const contactLinks = store.contactLinks || [];
  const stories = store.stories || [];
  
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCrossProducts, setSelectedCrossProducts] = useState<{ productId: string; quantity: number }[]>([]);
  const [showStoriesViewer, setShowStoriesViewer] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '+7 ', date: '', time: '', address: '', characterId: '', serviceId: '', songs: '', comment: '' });

  const selectedCharacter = characters.find((c) => c.id === formData.characterId);
  const selectedService = selectedCharacter?.services.find((s) => s.id === formData.serviceId);

  const getAvailableTimeSlots = (date: string, serviceDuration: number = 30): string[] => {
    return libGetAvailableTimeSlots(store.orders || [], store.settings, date, serviceDuration);
  };

  const availableTimeSlots = formData.date && selectedService ? getAvailableTimeSlots(formData.date, selectedService.duration) : [];

  const formatPhone = (value: string) => {
    // Убираем все кроме цифр
    const digits = value.replace(/\D/g, '');
    // Если начинается с 8, заменяем на 7
    const normalizedDigits = digits.startsWith('8') ? '7' + digits.slice(1) : digits;
    // Если не начинается с 7, добавляем 7
    const finalDigits = normalizedDigits.startsWith('7') ? normalizedDigits : '7' + normalizedDigits;
    
    // Форматируем: +7 (XXX) XXX-XX-XX
    let formatted = '+7 ';
    if (finalDigits.length > 1) formatted += '(' + finalDigits.slice(1, 4);
    if (finalDigits.length >= 4) formatted += ') ';
    if (finalDigits.length >= 7) formatted += finalDigits.slice(4, 7);
    if (finalDigits.length >= 9) formatted += '-' + finalDigits.slice(7, 9);
    if (finalDigits.length >= 11) formatted += '-' + finalDigits.slice(9, 11);
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData(p => ({ ...p, phone: formatted }));
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
            {settings.logo ? <img src={settings.logo} alt="Логотип" className="h-10 object-contain" /> : (<><Sparkles className="text-[#800080]" size={28} /><span className="font-bold text-xl text-[#800080]">Ростовые куклы</span></>)}
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#characters" className="text-gray-600 hover:text-[#800080] transition">Персонажи</a>
            <a href="#how" className="text-gray-600 hover:text-[#800080] transition">Как заказать</a>
            <a href="#conditions" className="text-gray-600 hover:text-[#800080] transition">Условия</a>
            <a href="#payment" className="text-gray-600 hover:text-[#800080] transition">Оплата</a>
            <a href="#gallery" className="text-gray-600 hover:text-[#800080] transition">Галерея</a>
            <a href="#reviews" className="text-gray-600 hover:text-[#800080] transition">Отзывы</a>
            <a href="#contacts" className="text-gray-600 hover:text-[#800080] transition">Контакты</a>
          </nav>
          <button onClick={() => setShowOrderForm(true)} className="bg-[#800080] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#660066] shadow-lg">Заказать</button>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-[#800080] via-[#660066] to-[#990099] text-white min-h-[650px]">
        {settings.heroBackgroundImage && (
          <div className="absolute inset-0">
            <img src={settings.heroBackgroundImage} alt="" className="w-full h-full object-cover opacity-20" />
          </div>
        )}
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
              <p className="text-lg lg:text-xl text-white/90 mb-8">{settings.heroSubtitle}</p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => setShowOrderForm(true)} className="bg-white text-[#800080] px-8 py-4 rounded-full font-bold text-lg hover:bg-white/90 shadow-xl">Оставить заявку</button>
                <a href={`tel:${settings.phone}`} className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 flex items-center gap-2"><Phone size={20} />{settings.phone}</a>
              </div>
            </div>
            {settings.heroImage && <HeroImageAnimation image={settings.heroImage} />}
          </div>
        </div>
      </section>

      {/* Stories Section */}
      {stories.filter(s => s.isActive).length > 0 && (
        <section id="stories" className="py-20 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <ImageIcon size={40} className="text-yellow-600" />
              Яркие моменты
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg">Погрузитесь в атмосферу наших праздников</p>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {stories.filter(s => s.isActive).map((story) => (
                <div key={story.id} className="group relative w-40 h-56 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer" onClick={() => setShowStoriesViewer(true)}>
                  {story.type === 'video' ? (
                    <video src={story.media} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" muted />
                  ) : (
                    <img src={story.media} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div>
                      <p className="text-white font-bold text-xs">{story.title}</p>
                      {story.description && <p className="text-white/80 text-xs mt-1 line-clamp-2">{story.description}</p>}
                    </div>
                  </div>
                  {story.type === 'video' && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stories Viewer Modal */}
      {showStoriesViewer && (
        <StoriesViewer 
          stories={stories.filter(s => s.isActive)} 
          onClose={() => setShowStoriesViewer(false)} 
        />
      )}

      <section id="characters" className="py-20 scroll-mt-20 relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#800080]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#990099]/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#800080] to-[#990099] rounded-2xl shadow-lg">
              <Users size={40} className="text-white" />
            </div>
            <span className="bg-gradient-to-r from-[#800080] to-[#990099] bg-clip-text text-transparent">Наши персонажи</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {characters.filter(c => c.isActive).map((char) => (
              <CharacterCard key={char.id} character={char} onOrder={() => { setFormData(p => ({ ...p, characterId: char.id, serviceId: '' })); setShowOrderForm(true); }} />
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 scroll-mt-20 relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute top-20 right-20 text-8xl opacity-10 animate-pulse">✨</div>
        <div className="absolute bottom-20 left-20 text-7xl opacity-10 animate-bounce">🎈</div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#800080] via-[#990099] to-orange-500 rounded-2xl shadow-lg">
              <HelpCircle size={40} className="text-white" />
            </div>
            <span className="bg-gradient-to-r from-[#800080] via-[#990099] to-orange-600 bg-clip-text text-transparent">Как заказать?</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {(settings.howToOrderSteps || []).map((item, index) => (
              <div key={item.id} className="relative group">
                {/* Соединительная линия */}
                {index < (settings.howToOrderSteps?.length || 0) - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-1 bg-gradient-to-r from-[#800080] to-transparent rounded-full"></div>
                )}
                <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-[#800080]/20">
                  <div className={`absolute -top-4 -right-4 w-14 h-14 bg-gradient-to-br ${item.color} text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg animate-pulse`} style={{ animationDuration: '3s' }}>{item.step}</div>
                  <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                  <h3 className={`font-bold text-xl mb-3 bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="payment" className="py-20 bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 scroll-mt-20 relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute top-1/2 left-0 w-40 h-40 bg-green-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-0 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-600 via-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <CreditCard size={40} className="text-white" />
            </div>
            <span className="bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">Способы оплаты</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {(settings.paymentMethods || []).filter(m => m.isActive).map((method, index) => {
              const colorClasses: any = {
                green: { border: 'border-green-200', gradient: 'from-green-500 to-emerald-600', dot: 'bg-green-500', bg: 'bg-green-50' },
                blue: { border: 'border-blue-200', gradient: 'from-blue-500 to-indigo-600', dot: 'bg-blue-500', bg: 'bg-blue-50' },
                purple: { border: 'border-purple-200', gradient: 'from-purple-500 to-purple-600', dot: 'bg-purple-500', bg: 'bg-purple-50' },
                orange: { border: 'border-orange-200', gradient: 'from-orange-500 to-orange-600', dot: 'bg-orange-500', bg: 'bg-orange-50' }
              };
              const colors = colorClasses[method.color] || colorClasses.green;
              return (
                <div key={method.id} className={`relative group bg-white rounded-3xl shadow-xl p-6 lg:p-8 border-2 ${colors.border} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                  {/* Декоративный номер */}
                  <div className={`absolute -top-4 -right-4 w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center text-2xl font-bold shadow-lg`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`bg-gradient-to-br ${colors.gradient} p-4 rounded-2xl text-white shadow-lg text-4xl transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>{method.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{method.title}</h3>
                      <p className="text-gray-500 text-sm">{method.subtitle}</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-gray-700 text-sm">
                    {method.items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 transform hover:translate-x-2 transition-transform duration-200">
                        <div className={`w-2 h-2 ${colors.dot} rounded-full mt-2 flex-shrink-0`}></div>
                        <p>{item}</p>
                      </div>
                    ))}
                    {method.warning && (
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg mt-4 hover:bg-amber-100 transition-colors">
                        <p className="font-semibold text-amber-900 text-xs flex items-center gap-2">
                          <span className="text-lg">⚠️</span>
                          {method.warning}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="conditions" className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 scroll-mt-20 relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute top-10 right-10 w-24 h-24 bg-[#800080]/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-[#990099]/10 rounded-full blur-2xl"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#800080] to-[#990099] rounded-2xl shadow-lg">
              <ClipboardList size={40} className="text-white" />
            </div>
            <span className="bg-gradient-to-r from-[#800080] to-[#990099] bg-clip-text text-transparent">Условия работы и доставки</span>
          </h2>
          {(settings.workConditionSections || []).length === 0 ? (
            <p className="text-center text-gray-400">Условия уточняются у менеджера</p>
          ) : ((settings.workConditionSections || []).length <= 2 ? (
            /* Два основных блока — «Доставка ростовой куклы» и «Время работы ростовой куклы» — в одной секции, в два блока */
            <div className="grid md:grid-cols-2 gap-8 items-stretch">
              {(settings.workConditionSections || []).map((section) => (
                <div key={section.id} className={`relative group rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl ${
                  section.type === 'warning'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:-translate-y-1'
                    : section.type === 'rules'
                    ? 'bg-white border-2 border-[#800080]/10 hover:border-[#800080]/30'
                    : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:-translate-y-1'
                }`}>
                  <div className="flex items-center gap-4 mb-6">
                    <span className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 ${section.type === 'rules' ? 'bg-[#800080]/10' : 'bg-white/20'}`}>{section.icon}</span>
                    <h3 className="text-2xl font-bold">{section.title}</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    {section.items.map((item, idx) => (
                      <div key={idx} className={`${
                        section.type === 'rules'
                          ? 'bg-gray-50 border-l-4 border-[#800080]/30 hover:border-[#800080] hover:bg-gray-100'
                          : 'bg-white/10 hover:bg-white/20'
                      } rounded-lg p-3 transition-all duration-300 flex items-start gap-3`}>
                        <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${section.type === 'rules' ? 'bg-[#800080]' : 'bg-white'}`}></span>
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {(settings.workConditionSections || []).map((section, index) => (
                <div key={section.id} className={`relative group rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl ${
                  section.type === 'warning'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:scale-[1.02]'
                    : section.type === 'rules'
                    ? 'bg-white border-2 border-[#800080]/10 hover:border-[#800080]/30'
                    : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:scale-[1.02]'
                }`}>
                  <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg ${
                    section.type === 'warning' ? 'bg-white text-red-500' : section.type === 'rules' ? 'bg-gradient-to-br from-[#800080] to-[#990099] text-white' : 'bg-white text-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-3 mb-4 ml-8">
                    <span className="text-4xl transform group-hover:scale-110 transition-transform duration-300">{section.icon}</span>
                    <h3 className="text-2xl font-bold">{section.title}</h3>
                  </div>
                  <div className="space-y-3 text-sm ml-8">
                    {section.items.map((item, idx) => (
                      <div key={idx} className={`${
                        section.type === 'rules'
                          ? 'bg-gray-50 border-l-4 border-[#800080]/30 hover:border-[#800080] hover:bg-gray-100'
                          : 'bg-white/10 hover:bg-white/20'
                      } rounded-lg p-3 transition-all duration-300`}>
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      {(gallery || []).filter(g => g.isActive).length > 0 && (
        <section id="gallery" className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 scroll-mt-20 relative overflow-hidden">
          {/* Декоративные элементы */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-[#800080]/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-tl from-[#990099]/10 to-transparent rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4 flex items-center justify-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-lg">
                <ImageIcon size={40} className="text-white" />
              </div>
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Галерея</span>
            </h2>
            <p className="text-center text-gray-600 mb-12 text-lg">Наши работы и праздники</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(gallery || []).filter(g => g.isActive).map((item, index) => (
                <div key={item.id} className={`group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  index % 5 === 0 ? 'aspect-square' : index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'
                }`}>
                  <img src={item.image} alt={item.description} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-sm font-medium">{item.description}</p>
                    </div>
                  </div>
                  {/* Декоративный уголок */}
                  <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Subscription Section */}
      {settings.subscriptionEnabled && (
        <section className="py-12 bg-gradient-to-br from-[#800080] via-[#990099] to-orange-500 text-white relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Изображение - на мобильных сверху, на десктопе справа */}
              <div className="order-1 md:order-2 relative">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-[#800080] to-[#990099] rotate-45 rounded-lg"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 overflow-visible">
                  {settings.subscriptionImage ? (
                    <div className="relative -mt-16 mb-4">
                      <img src={settings.subscriptionImage} alt="Подписка" className="w-full h-auto max-h-64 object-contain rounded-lg animate-float" />
                    </div>
                  ) : (
                    <div className="text-6xl text-center mb-4 -mt-8 animate-bounce">🎉</div>
                  )}
                  <div className="text-center">
                    <p className="font-bold text-lg mb-2">Присоединяйтесь!</p>
                    <p className="text-sm text-white/80">Будьте в курсе всех новостей и специальных предложений</p>
                  </div>
                </div>
              </div>
              
              {/* Форма - на мобильных снизу, на десктопе слева */}
              <div className="order-2 md:order-1">
                <h2 className="text-2xl lg:text-3xl font-bold mb-3">{settings.subscriptionTitle}</h2>
                <p className="text-base text-white/90 mb-6">{settings.subscriptionDescription}</p>
                <form onSubmit={(e) => { e.preventDefault(); alert('Спасибо за подписку!'); }} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="email" 
                      required 
                      placeholder="Ваш email" 
                      className="flex-1 px-5 py-3 rounded-full text-gray-800 border-2 border-white/30 focus:outline-none focus:ring-4 focus:ring-white/50 focus:border-white/60 bg-white/95" 
                    />
                    <button type="submit" className="bg-white text-[#800080] px-6 py-3 rounded-full font-bold hover:bg-purple-50 transition shadow-xl whitespace-nowrap">
                      Подписаться
                    </button>
                  </div>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" required className="mt-1 w-4 h-4 text-white rounded focus:ring-white" />
                    <span className="text-xs text-white/90">Я согласен на обработку персональных данных в соответствии с <Link to="/privacy" target="_blank" className="underline hover:text-white">политикой конфиденциальности</Link></span>
                  </label>
                </form>
                <p className="text-xs text-white/70 mt-3">Мы не рассылаем спам. Только интересные новости и акции!</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="reviews" className="py-20 scroll-mt-20 relative overflow-hidden">
        {/* Декоративный фон */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#800080]/5 via-transparent to-[#990099]/5"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg">
              <MessageCircleIcon size={40} className="text-white" />
            </div>
            <span>Отзывы клиентов</span>
          </h2>
          {(reviews || []).filter(r => r.isActive).length === 0 ? <p className="text-center text-gray-400">Отзывов пока нет</p> : (
            <div className="grid md:grid-cols-3 gap-8">
              {(reviews || []).filter(r => r.isActive).map((review, index) => (
                <div key={review.id} className="relative group">
                  {/* Декоративная рамка */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#800080] to-[#990099] rounded-2xl transform group-hover:scale-105 transition-transform duration-300 opacity-0 group-hover:opacity-20"></div>
                  <div className="relative bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
                    {/* Цитата */}
                    <div className="absolute -top-3 -left-3 text-6xl text-[#800080]/20 font-serif">"</div>
                    <div className="flex gap-1 mb-3">{Array.from({ length: review.rating }).map((_, j) => <Star key={j} size={16} className="fill-yellow-400 text-yellow-400" />)}</div>
                    <p className="text-gray-600 mb-4 italic relative z-10">"{review.text}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#800080] to-[#990099] rounded-full flex items-center justify-center text-white font-bold">
                        {review.name.charAt(0)}
                      </div>
                      <p className="font-bold text-[#800080]">{review.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="contacts" className="py-20 bg-gray-900 text-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 flex items-center justify-center gap-3">
            <Phone size={40} className="text-[#800080]" />
            Свяжитесь с нами
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <h3 className="text-xl font-bold mb-4 text-[#990099]">Наши контакты</h3>
              
              {/* Все контакты из настроек админки */}
              {contactLinks.filter(c => c.isActive).map((contact) => (
                <div key={contact.id} className="flex items-center gap-4">
                  {contact.icon ? (
                    <img src={contact.icon} alt={contact.label} className="w-10 h-10 object-contain" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center text-gray-400 text-xs">?</div>
                  )}
                  <div>
                    <p className="text-sm text-gray-400">{contact.label}</p>
                    <a href={contact.link} target={contact.link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-lg hover:text-[#990099] transition">
                      {contact.value}
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MapPin size={20} className="text-[#800080]" />Условия доставки</h3>
                <p className="text-gray-300 leading-relaxed">{settings.deliveryConditions}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Clock size={20} className="text-[#800080]" />Правила работы</h3>
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
            <Link to="/privacy" className="text-[#800080] hover:text-[#990099]">Политика конфиденциальности</Link>
            <span>·</span>
            <Link to="/consent" className="text-[#800080] hover:text-[#990099]">Согласие на обработку ПД</Link>
            <span>·</span>
            <Link to="/login" className="text-[#800080] hover:text-[#990099]">Вход для сотрудников →</Link>
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
                <div className="flex gap-1 mb-6">{[1, 2, 3, 4].map((step) => (<div key={step} className={`flex-1 h-1.5 rounded-full ${step <= currentStep ? 'bg-[#800080]' : 'bg-gray-200'}`} />))}</div>
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Выберите персонажа</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {characters.filter(c => c.isActive).map((c) => (<button key={c.id} type="button" onClick={() => setFormData(p => ({ ...p, characterId: c.id, serviceId: '' }))} className={`p-3 rounded-lg border-2 text-left transition-all ${formData.characterId === c.id ? 'border-purple-600 bg-purple-50 shadow-md' : 'border-gray-200 hover:border-purple-300'}`}><div className="font-medium text-sm">{c.name}</div></button>))}
                    </div>
                    {selectedCharacter && (selectedCharacter.services || []).length > 0 && (
                      <div><h4 className="font-semibold text-lg mt-4">Выберите услугу</h4><div className="grid gap-2 mt-2">{(selectedCharacter.services || []).map((service) => (<button key={service.id} type="button" onClick={() => setFormData(p => ({ ...p, serviceId: service.id }))} className={`p-3 rounded-lg border-2 text-left transition-all ${formData.serviceId === service.id ? 'border-[#800080] bg-purple-50 shadow-md' : 'border-gray-200 hover:border-[#990099]'}`}><div className="flex items-center justify-between"><div className="flex-1"><div className="font-semibold text-sm">{service.name}</div><div className="flex items-center gap-3 text-xs mt-0.5"><span className="text-gray-600 flex items-center gap-1"><Clock size={12} />{service.duration} мин</span><span className="font-bold text-[#800080]">{service.price.toLocaleString()} ₽</span></div></div>{formData.serviceId === service.id && <Check size={20} className="text-[#800080]" />}</div></button>))}</div></div>
                    )}
                    <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowOrderForm(false)} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">Отмена</button><button type="button" onClick={() => setCurrentStep(2)} disabled={!formData.characterId || !formData.serviceId} className="flex-1 bg-[#800080] text-white py-3 rounded-lg font-bold hover:bg-[#660066] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">Далее <ArrowRight size={16} /></button></div>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Дата и место</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium mb-1">Дата *</label><input required type="date" min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={(e) => setFormData(p => ({ ...p, date: e.target.value, time: '' }))} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500" /></div>
                      <div><label className="block text-sm font-medium mb-1">Время * ({bookingLimits(settings).startTime}–{bookingLimits(settings).endTime})</label>{!formData.date || !selectedService ? (<div className="border border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 text-gray-400 text-sm">Сначала дату</div>) : availableTimeSlots.length === 0 ? (<div className="border border-red-200 bg-red-50 rounded-lg px-4 py-2.5 text-red-600 text-sm">Нет свободного времени</div>) : (<select required value={formData.time} onChange={(e) => setFormData(p => ({ ...p, time: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500"><option value="">Время</option>{availableTimeSlots.map((s) => <option key={s} value={s}>{s}</option>)}</select>)}</div>
                    </div>
                    <div><label className="block text-sm font-medium mb-1">Адрес / турбаза / номер беседки *</label><input required type="text" value={formData.address} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500" placeholder="г. Саратов, ул. Пример, 1 или турбаза «Заря», беседка №5" /></div>
                    <div className="flex gap-3 pt-2"><button type="button" onClick={() => setCurrentStep(1)} className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"><ArrowLeft size={16} />Назад</button><button type="button" onClick={() => setCurrentStep(3)} disabled={!formData.date || !formData.time || !formData.address} className="flex-1 bg-[#800080] text-white py-3 rounded-lg font-bold hover:bg-[#660066] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">Далее <ArrowRight size={16} /></button></div>
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
                              <div className="flex-1 min-w-0"><div className="font-medium text-sm">{cp.name}</div>{cp.description && <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{cp.description}</div>}<div className="font-bold text-[#800080] text-sm mt-1">{cp.price.toLocaleString()} ₽</div></div>
                              {quantity > 0 ? (<div className="flex items-center gap-2 flex-shrink-0"><button type="button" onClick={() => setSelectedCrossProducts(p => quantity <= 1 ? p.filter(s => s.productId !== cp.id) : p.map(s => s.productId === cp.id ? { ...s, quantity: s.quantity - 1 } : s))} className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold">−</button><span className="w-8 text-center font-semibold">{quantity}</span><button type="button" onClick={() => setSelectedCrossProducts(p => p.some(s => s.productId === cp.id) ? p.map(s => s.productId === cp.id ? { ...s, quantity: s.quantity + 1 } : s) : [...p, { productId: cp.id, quantity: 1 }])} className="w-8 h-8 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center font-bold">+</button></div>) : (<button type="button" onClick={() => setSelectedCrossProducts(p => [...p, { productId: cp.id, quantity: 1 }])} className="px-4 py-2 bg-[#800080] hover:bg-[#660066] text-white rounded-lg text-sm font-medium transition flex-shrink-0">+ Добавить</button>)}
                            </div>
                            {quantity > 0 && (<div className="text-right mt-2 pt-2 border-t border-[#800080]/20"><span className="text-sm font-semibold text-[#800080]">{(cp.price * quantity).toLocaleString()} ₽</span></div>)}
                          </div>
                        );
                      })}</div>
                    )}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <div className="flex justify-between items-center"><span className="text-sm text-gray-700">Итого:</span><span className="font-bold text-[#800080] text-lg">{((selectedService?.price || 0) + selectedCrossProducts.reduce((sum, cp) => sum + ((crossProducts.find(c => c.id === cp.productId)?.price || 0) * cp.quantity), 0)).toLocaleString()} ₽</span></div>
                    </div>
                    <div className="flex gap-3 pt-2"><button type="button" onClick={() => setCurrentStep(2)} className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"><ArrowLeft size={16} />Назад</button><button type="button" onClick={() => setCurrentStep(4)} className="flex-1 bg-[#800080] text-white py-3 rounded-lg font-bold hover:bg-[#660066] flex items-center justify-center gap-2">Далее <ArrowRight size={16} /></button></div>
                  </div>
                )}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Ваши контакты</h4>
                    <div><label className="block text-sm font-medium mb-1">Ваше имя *</label><input required type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500" placeholder="Как к вам обращаться?" /></div>
                    <div><label className="block text-sm font-medium mb-1">Телефон *</label><input required type="tel" value={formData.phone} onChange={handlePhoneChange} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500" placeholder="+7 (___) ___-__-__" maxLength={18} /></div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-sm mb-2">Ваш заказ:</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">{selectedCharacter?.name} · {selectedService?.name}</span><span className="font-medium">{selectedService?.price.toLocaleString()} ₽</span></div>
                        {selectedCrossProducts.map((cp) => {
                          const product = crossProducts.find(c => c.id === cp.productId);
                          return product ? <div key={cp.productId} className="flex justify-between"><span className="text-gray-600">+ {product.name} × {cp.quantity}</span><span className="font-medium">{(product.price * cp.quantity).toLocaleString()} ₽</span></div> : null;
                        })}
                        <div className="border-t border-gray-300 pt-1 mt-1 flex justify-between"><span className="font-bold">Итого:</span><span className="font-bold text-[#800080]">{((selectedService?.price || 0) + selectedCrossProducts.reduce((sum, cp) => sum + ((crossProducts.find(c => c.id === cp.productId)?.price || 0) * cp.quantity), 0)).toLocaleString()} ₽</span></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 w-4 h-4 text-[#800080] rounded focus:ring-[#800080]" />
                        <span className="text-xs text-gray-600">Я согласен на <Link to="/privacy" target="_blank" className="text-[#800080] underline">обработку персональных данных</Link></span>
                      </label>
                    </div>
                    <form onSubmit={handleSubmit}>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setCurrentStep(3)} className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"><ArrowLeft size={16} />Назад</button>
                        <button type="submit" disabled={!consent || !formData.name || !formData.phone} className="flex-1 bg-[#800080] text-white py-3 rounded-lg font-bold hover:bg-[#660066] transition disabled:opacity-50 disabled:cursor-not-allowed">Отправить заявку</button>
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
