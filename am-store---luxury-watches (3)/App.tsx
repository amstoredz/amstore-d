
import React, { useState, useEffect, useMemo } from 'react';
import { Product, Order, OrderStatus } from './types';
import CheckoutModal from './components/CheckoutModal';
import AdminPanel from './components/AdminPanel';
import { ADMIN_PASSWORD, isFirebaseConfigured, FIREBASE_CONFIG } from './constants';
import { listenToProducts, listenToOrders, deleteProductDB, updateOrderStatusDB, deleteOrderDB } from './services/databaseService';
import { 
  ShoppingBag, Clock, ShieldCheck, Instagram, 
  Lock, Truck, Filter, Music2, Star, 
  ShieldAlert, Copy, ChevronRight, ArrowUpRight, Sparkles
} from 'lucide-react';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(isFirebaseConfigured());
  const [dbError, setDbError] = useState<string | null>(null);
  
  const [categoryFilter, setCategoryFilter] = useState<string>('الكل');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [passError, setPassError] = useState(false);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribeProducts = listenToProducts(
        (data) => {
          setProducts(data);
          setLoading(false);
          setDbError(null);
        },
        (err) => {
          if (err.code === 'permission-denied') {
            setDbError('قواعد الحماية (Rules) ترفض الاتصال.');
          }
          setLoading(false);
        }
      );

      const unsubscribeOrders = listenToOrders((data) => {
        setOrders(data);
      });

      return () => {
        unsubscribeProducts();
        unsubscribeOrders();
      };
    } catch (e) {
      console.error("Critical connection error", e);
      setLoading(false);
    }
  }, [isConfigured]);

  const categories = useMemo(() => {
    return ['الكل', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  const displayedProducts = useMemo(() => {
    let result = categoryFilter === 'الكل' 
      ? products 
      : products.filter(p => p.category === categoryFilter);
    
    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }
    return result;
  }, [products, categoryFilter, sortBy]);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassInput === ADMIN_PASSWORD) {
      setShowAdmin(true);
      setIsPasswordModalOpen(false);
      setAdminPassInput('');
      setPassError(false);
    } else {
      setPassError(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-gold-200 border-t-gold-600 rounded-full animate-spin"></div>
            <Clock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold-600" size={24} />
          </div>
          <p className="font-black text-gray-400 animate-pulse tracking-[0.3em] text-xs">AM STORE LUXURY</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfdfd] selection:bg-gold-100 selection:text-gold-900">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-gray-100/50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="bg-black text-gold-400 p-2.5 rounded-2xl rotate-0 group-hover:rotate-12 transition-all duration-500 shadow-xl shadow-black/10">
              <Clock size={22} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-gray-900">AM STORE</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden lg:flex items-center gap-8 ml-8">
              {['الرئيسية', 'ساعات رجالية', 'ساعات نسائية', 'العروض'].map(link => (
                <a key={link} href="#" className="text-[11px] font-black text-gray-400 hover:text-black transition-colors tracking-widest">{link}</a>
              ))}
            </nav>
            <div className="flex gap-5 text-gray-300">
              <a href="https://www.instagram.com/amstoer?igsh=dWZuejIzZ2ozcjUw" target="_blank" rel="noopener noreferrer">
                <Instagram size={22} className="hover:text-gold-600 cursor-pointer transition-all" />
              </a>
              <a href="https://www.tiktok.com/@am_store_dz16" target="_blank" rel="noopener noreferrer">
                <Music2 size={22} className="hover:text-gold-600 cursor-pointer transition-all" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[85vh] flex items-center justify-center text-white overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1887&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-50 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-gold-200 text-[9px] font-black tracking-[0.3em] mb-8 uppercase animate-in slide-in-from-top-4 duration-1000">
            <Sparkles size={12} /> New Season Arrival 2025
          </div>
          <h2 className="text-6xl md:text-9xl font-black mb-8 leading-[0.9] tracking-tighter">وقتك <br/> <span className="bg-gradient-to-r from-gold-300 to-gold-600 bg-clip-text text-transparent italic">بفخامة</span></h2>
          <p className="text-sm md:text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed font-medium opacity-90 px-4">
            نحن لا نبيع الساعات فقط، بل نمنحك قطعة فنية تكتمل بها شخصيتك. أرقى الموديلات العالمية بين يديك.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <a href="#products" className="bg-white text-black px-14 py-6 rounded-2xl font-black text-lg hover:bg-gold-500 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3 group">
              تصفح الساعات <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="products" className="py-24 bg-[#fafafa]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tighter">مختاراتنا لك</h2>
            <div className="w-24 h-1.5 bg-gold-500 mx-auto rounded-full mb-6"></div>
            <p className="text-gray-400 font-bold max-w-lg mx-auto">تشكيلة حصرية من أرقى الساعات التي تجمع بين الدقة في الأداء والفخامة في التصميم.</p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-16">
            <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-8 py-3.5 rounded-full text-[11px] font-black whitespace-nowrap transition-all duration-500 flex items-center gap-2 ${
                    categoryFilter === cat 
                      ? 'bg-black text-white shadow-2xl scale-105' 
                      : 'bg-white text-gray-400 hover:text-gray-600 border border-gray-100'
                  }`}
                >
                  {categoryFilter === cat && <div className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse"></div>}
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-64 group">
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-gold-600 transition-colors" size={16} />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-white border border-gray-100 p-4 pr-12 rounded-2xl text-[11px] font-black text-gray-600 outline-none cursor-pointer hover:border-gold-200 transition-all appearance-none shadow-sm"
              >
                <option value="default">الترتيب التلقائي</option>
                <option value="price-asc">الأقل سعراً</option>
                <option value="price-desc">الأعلى سعراً</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
            {displayedProducts.map((product) => (
              <div 
                key={product.id} 
                className="group relative bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-gray-50 flex flex-col"
                onClick={() => setSelectedProduct(product)}
              >
                {/* Image Section */}
                <div className="relative overflow-hidden aspect-[4/5]">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" 
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center p-6 text-center">
                     <button className="bg-white text-black w-full py-4 rounded-2xl font-black text-xs transform translate-y-12 group-hover:translate-y-0 transition-transform duration-500 flex items-center justify-center gap-2 shadow-2xl">
                        أطلب الآن <ShoppingBag size={14} />
                     </button>
                  </div>
                  {product.oldPrice && (
                    <div className="absolute top-4 right-4 md:top-8 md:right-8">
                      <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl animate-pulse">
                        تخفيض حصري
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-10 flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-lg md:text-2xl font-black text-gray-900 mb-2 group-hover:text-gold-600 transition-colors truncate">{product.name}</h3>
                    <p className="text-[10px] md:text-xs text-gray-400 font-bold leading-relaxed line-clamp-2">{product.description}</p>
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-gray-50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black text-gray-300 uppercase">السعر</p>
                      <div className="flex flex-col">
                        {product.oldPrice && (
                          <span className="text-xs md:text-sm text-gray-400 line-through font-bold mb-1">
                            {product.oldPrice.toLocaleString()} دج
                          </span>
                        )}
                        <span className="text-xl md:text-3xl font-black text-gray-900">{product.price.toLocaleString()} <span className="text-xs text-gold-600">دج</span></span>
                      </div>
                    </div>
                    <div className="bg-gold-50 text-gold-600 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                       <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: <Truck size={22} />, title: "توصيل 58 ولاية", desc: "نضمن لك وصول المنتج في أسرع وقت ممكن لباب منزلك." },
              { icon: <ShieldCheck size={22} />, title: "ضمان الجودة", desc: "كل الساعات تخضع للفحص الدقيق قبل الشحن لضمان الجودة." },
              { icon: <Star size={22} />, title: "خدمة VIP", desc: "فريقنا متواجد 24/7 لمساعدتك في اختيار الساعة الأنسب لك." }
            ].map((f, i) => (
              <div key={i} className="relative group p-10 rounded-[3rem] bg-[#fafafa] border border-gray-100 hover:bg-white hover:shadow-2xl hover:border-gold-100 transition-all duration-500 overflow-hidden">
                <div className="absolute -right-8 -bottom-8 text-gray-200/20 group-hover:text-gold-100/30 transition-colors">{f.icon}</div>
                <div className="w-14 h-14 bg-white text-gold-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl group-hover:bg-black group-hover:text-white transition-all">
                  {f.icon}
                </div>
                <h3 className="text-xl font-black mb-4 text-gray-900">{f.title}</h3>
                <p className="text-gray-400 text-sm font-bold leading-relaxed">{f.desc}</p>
              </div>
            ))}
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
            <div className="max-w-md">
               <h1 className="text-4xl font-black tracking-tighter mb-6 flex items-center gap-3">
                 <div className="w-2 h-10 bg-gold-600 rounded-full"></div>
                 AM STORE
               </h1>
               <p className="text-gray-500 text-sm font-bold leading-loose">
                 الوجهة الأولى لعشاق الساعات الفاخرة في الجزائر. نؤمن بأن الساعة ليست مجرد أداة لمعرفة الوقت، بل هي تعبير عن الهوية والأناقة الخالدة.
               </p>
            </div>
            <div className="grid grid-cols-2 gap-16">
               <div className="space-y-6">
                 <h4 className="text-gold-500 font-black text-xs uppercase tracking-widest">تابعنا</h4>
                 <div className="flex gap-4">
                    <a href="https://www.instagram.com/amstoer?igsh=dWZuejIzZ2ozcjUw" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all"><Instagram size={20} /></a>
                    <a href="https://www.tiktok.com/@am_store_dz16" target="_blank" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all"><Music2 size={20} /></a>
                 </div>
               </div>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">
            <p>© {new Date().getFullYear()} AM STORE ALGERIA. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-8">
              <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-white transition-colors">Back to top</button>
              <button onClick={() => setIsPasswordModalOpen(true)} className="opacity-10 hover:opacity-100 transition-opacity">
                <Lock size={12} />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedProduct && <CheckoutModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onOrderSuccess={() => {}} />}
      
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl animate-in zoom-in duration-500">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-gold-50 text-gold-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner"><Lock size={40} /></div>
              <h3 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter">نظام الإدارة</h3>
              <p className="text-gray-400 font-bold">الدخول مصرح به للمسؤولين فقط</p>
            </div>
            <form onSubmit={handleAdminSubmit} className="space-y-8">
              <input 
                type="password" 
                placeholder="رمز الوصول" 
                className={`w-full p-6 bg-gray-50 border ${passError ? 'border-red-500' : 'border-gray-100'} rounded-[1.5rem] text-center font-black text-3xl tracking-[0.4em] outline-none focus:ring-4 ring-gold-500/20`} 
                value={adminPassInput} 
                onChange={e => { setAdminPassInput(e.target.value); setPassError(false); }} 
                autoFocus 
              />
              <button type="submit" className="w-full bg-black text-white py-6 rounded-[1.5rem] font-black text-lg shadow-2xl hover:bg-gold-600 transition-all transform active:scale-95">تأكيد الهوية</button>
              <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="w-full text-gray-400 font-bold text-xs uppercase tracking-widest">إغلاق</button>
            </form>
          </div>
        </div>
      )}

      {showAdmin && (
        <AdminPanel 
          products={products}
          orders={orders}
          onAddProduct={() => {}} 
          onUpdateProduct={() => {}} 
          onDeleteProduct={deleteProductDB}
          onUpdateOrder={updateOrderStatusDB}
          onDeleteOrder={deleteOrderDB}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  );
};

export default App;
