
import React, { useState } from 'react';
import { Product, Order, Wilaya, SHIPPING_COSTS, OrderStatus } from '../types';
import { X, CheckCircle, Truck, Phone, User, MapPin, ChevronLeft, CreditCard } from 'lucide-react';
import { sendOrderToTelegram } from '../services/telegramService';
import { addOrderDB } from '../services/databaseService';

interface CheckoutModalProps {
  product: Product;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ product, onClose, onOrderSuccess }) => {
  // نعدل الحالة لتبدأ من 'form' مباشرة
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    wilaya: Wilaya.ALGER,
    baladiya: ''
  });

  const selectedShipping = SHIPPING_COSTS[formData.wilaya] || SHIPPING_COSTS.default;
  const total = product.price + selectedShipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.baladiya) {
      alert("يرجى ملء كافة الحقول المطلوبة");
      return;
    }
    setLoading(true);
    
    const orderData: Omit<Order, 'id'> = {
      customerName: formData.name,
      phone: formData.phone,
      wilaya: formData.wilaya,
      baladiya: formData.baladiya,
      productName: product.name,
      totalPrice: total,
      date: new Date().toLocaleDateString('ar-DZ'),
      status: OrderStatus.PENDING
    };

    try {
      const docRef = await addOrderDB(orderData);
      await sendOrderToTelegram({ id: docRef.id, ...orderData } as Order);
      setStep('success');
    } catch (error) {
      alert("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative text-right" dir="rtl">
        
        {/* Header/Close */}
        <div className="absolute top-4 left-4 z-20">
          <button onClick={onClose} className="p-3 bg-white/80 hover:bg-white rounded-full shadow-lg backdrop-blur-md transition-all">
            <X size={20} className="text-gray-900" />
          </button>
        </div>

        {step === 'form' && (
          <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-gold-50 p-4 rounded-3xl text-gold-600 shadow-sm"><Truck size={28} /></div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">إتمام طلبك</h2>
                <p className="text-gray-400 text-sm font-bold">أدخل بياناتك وسيتم شحن <span className="text-black">{product.name}</span> لك</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <User className="absolute right-4 top-4 text-gray-400 group-focus-within:text-gold-600 transition-colors" size={20} />
                  <input placeholder="الاسم الكامل" required className="w-full p-4 pr-12 bg-gray-50 border border-gray-100 rounded-2xl text-black font-bold focus:ring-2 ring-gold-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="relative group">
                  <Phone className="absolute right-4 top-4 text-gray-400 group-focus-within:text-gold-600 transition-colors" size={20} />
                  <input type="tel" placeholder="رقم الهاتف" required className="w-full p-4 pr-12 bg-gray-50 border border-gray-100 rounded-2xl text-black font-bold focus:ring-2 ring-gold-500 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="relative group">
                  <MapPin className="absolute right-4 top-4 text-gray-400 group-focus-within:text-gold-600 transition-colors" size={20} />
                  <select className="w-full p-4 pr-12 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-black focus:ring-2 ring-gold-500 outline-none appearance-none" value={formData.wilaya} onChange={e => setFormData({...formData, wilaya: e.target.value as Wilaya})}>
                    {Object.values(Wilaya).map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div className="relative group">
                  <MapPin className="absolute right-4 top-4 text-gray-400 group-focus-within:text-gold-600 transition-colors" size={20} />
                  <input placeholder="البلدية" required className="w-full p-4 pr-12 bg-gray-50 border border-gray-100 rounded-2xl text-black font-bold focus:ring-2 ring-gold-500 outline-none" value={formData.baladiya} onChange={e => setFormData({...formData, baladiya: e.target.value})} />
                </div>
              </div>
              
              <div className="bg-gray-900 p-6 rounded-3xl text-white space-y-3 mt-6 shadow-inner">
                <div className="flex justify-between text-sm"><span className="text-gray-400 font-bold">سعر الساعة:</span><span className="font-black">{product.price.toLocaleString()} دج</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400 font-bold">تكلفة الشحن لولايتك:</span><span className="font-black">{selectedShipping} دج</span></div>
                <div className="h-[1px] bg-white/10 my-2"></div>
                <div className="flex justify-between items-end">
                   <span className="text-sm font-bold">الإجمالي النهائي:</span>
                   <span className="text-3xl font-black text-gold-500">{total.toLocaleString()} دج</span>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-gold-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-gold-900/20 flex items-center justify-center gap-3 hover:bg-gold-500 transition-all active:scale-95">
                {loading ? (
                  <><RefreshCw className="animate-spin" /> جاري تأكيد طلبك...</>
                ) : (
                  <><CreditCard /> تأكيد الطلب الآن</>
                )}
              </button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="p-12 text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><CheckCircle size={56} /></div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">تم استلام طلبك!</h2>
            <p className="text-gray-500 text-lg font-bold leading-relaxed mb-10 px-4">
               شكراً لك يا {formData.name.split(' ')[0]}! لقد استلمنا طلبك للساعة <span className="text-gold-600">"{product.name}"</span>. 
               سنتصل بك على الرقم <span className="underline">{formData.phone}</span> خلال 24 ساعة لتأكيد موعد التوصيل.
            </p>
            <button onClick={onClose} className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all">العودة للمتجر</button>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple spinner icon for loading state
const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={`animate-spin h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default CheckoutModal;
