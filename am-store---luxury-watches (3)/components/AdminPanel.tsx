
import React, { useState, useEffect } from 'react';
import { Product, Order, OrderStatus } from '../types';
import { addProductDB, updateProductDB } from '../services/databaseService';
import { getAIInsights } from '../services/aiService';
import { 
  Plus, X, Trash2, Edit, LayoutDashboard, ShoppingCart, 
  Package, LogOut, Save, TrendingUp, Sparkles, BrainCircuit, RefreshCw, ChevronLeft, BarChart3, Target
} from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrder: (id: string, status: OrderStatus) => void;
  onDeleteOrder: (id: string) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  products, 
  orders, 
  onDeleteProduct, 
  onUpdateOrder, 
  onDeleteOrder,
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'ai'>('stats');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', price: 0, oldPrice: 0, description: '', color: '', image: '', category: 'Classic'
  });

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingProduct) {
        await updateProductDB(editingProduct.id, formData);
      } else {
        await addProductDB(formData as Omit<Product, 'id'>);
      }
      setShowForm(false);
      setEditingProduct(null);
      setFormData({ name: '', price: 0, oldPrice: 0, description: '', color: '', image: '', category: 'Classic' });
    } catch (err) {
      alert("حدث خطأ أثناء الحفظ");
    }
    setLoading(false);
  };

  const fetchAI = async () => {
    setAiLoading(true);
    const result = await getAIInsights(products, orders);
    setAiInsight(result || "لا توجد تقارير متاحة حالياً.");
    setAiLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'ai' && !aiInsight) {
      fetchAI();
    }
  }, [activeTab]);

  const stats = {
    totalSales: orders.filter(o => o.status === OrderStatus.CONFIRMED || o.status === OrderStatus.SHIPPED).reduce((acc, o) => acc + o.totalPrice, 0),
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === OrderStatus.PENDING).length,
    stockCount: products.length
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-[#f8f9fa] overflow-hidden text-right animate-in fade-in duration-500" dir="rtl">
      {/* Sidebar */}
      <div className="w-80 bg-black text-white flex flex-col hidden md:flex border-l border-white/5">
        <div className="p-12 border-b border-white/5">
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-gold-600 p-3 rounded-[1.2rem] shadow-2xl shadow-gold-600/30"><LayoutDashboard size={24} /></div>
            <span className="font-black text-3xl tracking-tighter">ADMIN</span>
          </div>
          <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.3em] mr-16">AM Store Dashboard</p>
        </div>
        
        <nav className="flex-1 p-8 space-y-4 mt-6">
          <button onClick={() => setActiveTab('stats')} className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-300 ${activeTab === 'stats' ? 'bg-white text-black font-black shadow-2xl' : 'hover:bg-white/5 text-gray-400 font-bold'}`}>
            <div className="flex items-center gap-4"><BarChart3 size={20} /> الإحصائيات</div>
            {activeTab === 'stats' && <ChevronLeft size={16} />}
          </button>
          <button onClick={() => setActiveTab('ai')} className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-300 ${activeTab === 'ai' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black shadow-2xl scale-105' : 'hover:bg-white/5 text-gray-400 font-bold'}`}>
            <div className="flex items-center gap-4"><BrainCircuit size={20} /> تقارير الـ AI</div>
            {activeTab === 'ai' && <ChevronLeft size={16} />}
          </button>
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-300 ${activeTab === 'products' ? 'bg-white text-black font-black shadow-2xl' : 'hover:bg-white/5 text-gray-400 font-bold'}`}>
            <div className="flex items-center gap-4"><Package size={20} /> المنتجات</div>
            {activeTab === 'products' && <ChevronLeft size={16} />}
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-300 ${activeTab === 'orders' ? 'bg-white text-black font-black shadow-2xl' : 'hover:bg-white/5 text-gray-400 font-bold'}`}>
            <div className="flex items-center gap-4"><ShoppingCart size={20} /> الطلبات</div>
            {activeTab === 'orders' && <ChevronLeft size={16} />}
          </button>
        </nav>

        <div className="p-8 border-t border-white/5">
           <button onClick={onClose} className="w-full flex items-center justify-center gap-4 px-6 py-5 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all font-black border border-red-500/20 shadow-2xl">
             <LogOut size={22} /> خروج من النظام
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex bg-white border-b px-6 py-5 justify-between items-center shadow-sm">
          <h2 className="font-black text-xl tracking-tighter">AM ADMIN</h2>
          <button onClick={onClose} className="p-3 bg-red-50 text-red-500 rounded-xl"><LogOut size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-16 space-y-12">
          {activeTab === 'stats' && (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">نظرة عامة على الأداء</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: 'المبيعات المؤكدة', val: `${stats.totalSales.toLocaleString()} دج`, color: 'text-gold-600', bg: 'bg-gold-50' },
                  { label: 'إجمالي الطلبات', val: stats.totalOrders, color: 'text-gray-900', bg: 'bg-gray-100' },
                  { label: 'بانتظار المراجعة', val: stats.pendingOrders, color: 'text-orange-500', bg: 'bg-orange-50' },
                  { label: 'موديلات المخزن', val: stats.stockCount, color: 'text-blue-600', bg: 'bg-blue-50' }
                ].map((s, i) => (
                  <div key={i} className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 group hover:shadow-2xl hover:border-gold-100 transition-all duration-500">
                    <div className={`${s.bg} w-14 h-14 rounded-2xl mb-6 flex items-center justify-center`}>
                      <div className={`w-3 h-3 rounded-full ${s.color.replace('text', 'bg')} animate-pulse`}></div>
                    </div>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">{s.label}</p>
                    <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'ai' && (
            <div className="max-w-5xl mx-auto py-4">
              <div className="bg-gradient-to-br from-[#0a0a1a] via-black to-[#1a0a2a] rounded-[4rem] p-12 md:p-20 text-white shadow-3xl relative overflow-hidden border border-white/5">
                <div className="absolute -top-32 -right-32 p-10 opacity-5 pointer-events-none rotate-12"><BrainCircuit size={500} /></div>
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div className="flex items-center gap-6">
                      <div className="bg-white/10 p-6 rounded-[2rem] backdrop-blur-3xl border border-white/10 shadow-2xl ring-1 ring-white/20"><Sparkles className="text-gold-400" size={36} /></div>
                      <div>
                        <h2 className="text-5xl font-black tracking-tighter">المستشار الذكي</h2>
                        <p className="text-gray-400 font-bold mt-2">تحليل استراتيجي متكامل لمشروع AM Store</p>
                      </div>
                    </div>
                    <button onClick={fetchAI} className="flex items-center justify-center gap-4 bg-white text-black hover:bg-gold-500 hover:text-white px-10 py-5 rounded-[1.5rem] font-black text-lg transition-all shadow-2xl group active:scale-95">
                      <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-700" /> تحليل جديد
                    </button>
                  </div>
                  
                  {aiLoading ? (
                    <div className="flex flex-col items-center py-32 gap-10">
                      <div className="relative">
                        <div className="w-24 h-24 border-4 border-white/10 border-t-gold-500 rounded-full animate-spin"></div>
                      </div>
                      <p className="font-black text-2xl text-white">جاري تحليل البيانات...</p>
                    </div>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                      <div className="bg-white/5 backdrop-blur-3xl p-12 md:p-16 rounded-[3.5rem] border border-white/10 leading-relaxed text-lg md:text-xl font-medium whitespace-pre-wrap shadow-inner text-indigo-50/90 selection:bg-gold-500/30">
                        {aiInsight}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-4xl font-black text-gray-900 tracking-tighter">إدارة المخزون</h2>
                </div>
                <button onClick={() => { setEditingProduct(null); setFormData({name: '', price: 0, oldPrice: 0, description: '', color: '', image: '', category: 'Classic'}); setShowForm(true); }} className="bg-black text-white px-10 py-6 rounded-[1.5rem] flex items-center gap-4 font-black shadow-2xl hover:bg-gold-600 transition-all">
                  <Plus size={24} /> إضافة موديل جديد
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {products.map(product => (
                  <div key={product.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 flex items-center gap-8 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                    <div className="relative overflow-hidden w-32 h-32 rounded-[2rem] shrink-0 shadow-xl shadow-black/5">
                      <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-2xl text-gray-900 truncate mb-1">{product.name}</h3>
                      <div className="flex flex-col">
                        {product.oldPrice && <span className="text-sm text-gray-400 line-through font-bold">{product.oldPrice.toLocaleString()} دج</span>}
                        <span className="text-gold-600 font-black text-xl">{product.price.toLocaleString()} دج</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button onClick={() => { setEditingProduct(product); setFormData(product); setShowForm(true); }} className="p-4 bg-gray-50 text-gray-600 rounded-2xl hover:bg-black hover:text-white transition-all"><Edit size={20} /></button>
                      <button onClick={() => { if(confirm('حذف هذا المنتج؟')) onDeleteProduct(product.id); }} className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-10">
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter">سجل الطلبات الواردة</h2>
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id} className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-10 hover:border-gold-200 transition-colors relative overflow-hidden">
                    {order.status === OrderStatus.PENDING && (
                      <div className="absolute top-0 right-0 w-2 h-full bg-orange-400"></div>
                    )}
                    <div className="flex items-start gap-8">
                      <div className="bg-gray-50 w-20 h-20 rounded-[2rem] flex items-center justify-center text-gray-300 shrink-0 border border-gray-100"><ShoppingCart size={32} /></div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h3 className="font-black text-3xl text-gray-900">{order.customerName}</h3>
                          <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === OrderStatus.PENDING ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-gray-500 font-bold text-lg">{order.wilaya} | {order.phone}</p>
                        <p className="text-gold-600 font-black text-xl mt-2">{order.productName}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:items-end gap-6">
                      <p className="text-4xl font-black text-gray-900">{order.totalPrice.toLocaleString()} <span className="text-sm text-gold-600">دج</span></p>
                      <div className="flex gap-4">
                        <select className="px-6 py-4 rounded-2xl border-2 border-gray-100 text-sm font-black bg-gray-50 outline-none focus:border-gold-500" value={order.status} onChange={(e) => onUpdateOrder(order.id, e.target.value as OrderStatus)}>
                          {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={() => { if(confirm('حذف الطلب؟')) onDeleteOrder(order.id); }} className="p-4 text-red-400 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={24} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal (Enhanced) */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-2xl">
          <form onSubmit={handleSaveProduct} className="bg-white w-full max-w-2xl rounded-[4rem] p-12 shadow-3xl max-h-[90vh] overflow-y-auto no-scrollbar animate-in zoom-in duration-500 border border-white/20">
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-4xl font-black tracking-tighter">{editingProduct ? 'تعديل موديل' : 'إضافة موديل فاخر'}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="p-4 bg-gray-100 rounded-[1.5rem] hover:bg-black hover:text-white transition-all"><X size={24} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 px-2 uppercase tracking-widest">اسم الموديل</label>
                <input required className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-black font-black text-lg outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 px-2 uppercase tracking-widest">السعر الجديد (دج)</label>
                <input type="number" required className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-black font-black text-lg outline-none" value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 px-2 uppercase tracking-widest">السعر القديم (دج - اختياري)</label>
                <input type="number" className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-black font-black text-lg outline-none" value={formData.oldPrice || ''} onChange={e => setFormData({...formData, oldPrice: Number(e.target.value)})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 px-2 uppercase tracking-widest">التصنيف</label>
                <select className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-black font-black text-lg outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="Classic">Classic</option><option value="Sport">Sport</option><option value="Luxury">Luxury</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black text-gray-400 px-2 uppercase tracking-widest">رابط الصورة</label>
                <input className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[1.5rem] text-black font-black text-lg outline-none" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black text-gray-400 px-2 uppercase tracking-widest">الوصف</label>
                <textarea required className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] h-48 text-black font-bold text-lg outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full mt-12 bg-black text-white py-7 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-3xl hover:bg-gold-600 transition-all">
              <Save size={28} /> {loading ? 'جاري الحفظ...' : 'حفظ ونشر الموديل'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
