
import { GoogleGenAI } from "@google/genai";
import { Order, Product } from "../types";

export const getAIInsights = async (products: Product[], orders: Order[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const systemInstruction = `
    أنت المدير التنفيذي للتسويق (CMO) لمتجر AM Store للساعات الفاخرة في الجزائر.
    مهمتك هي تقديم تحليل بيانات (Data-Driven Insights) عالي المستوى.
    حلل المنتجات والطلبات وقدم تقريراً منظماً يشمل:
    1. تحليل الأداء: (أي الساعات هي "الأكثر مبيعاً" وأيها "تحتاج دفع").
    2. نصيحة لوجستية: (الولايات الأكثر تفاعلاً وكيفية تحسين التوصيل).
    3. محتوى إعلاني: (اكتب جملة تسويقية جذابة لواحدة من الساعات).
    اجعل الأسلوب احترافياً، ملهماً، وباللغة العربية الفصحى المعاصرة.
  `;

  const prompt = `
    بيانات المتجر الحالية:
    المنتجات المتوفرة: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, price: p.price, category: p.category })))}
    سجل الطلبات الأخير: ${JSON.stringify(orders.map(o => ({ status: o.status, total: o.totalPrice, wilaya: o.wilaya })))}
    
    قدم لي التحليل الاستراتيجي الآن.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Error:", error);
    return "عذراً، نظام التحليل الذكي يواجه ضغطاً حالياً. يرجى المحاولة بعد قليل.";
  }
};
