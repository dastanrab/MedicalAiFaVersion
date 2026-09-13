import React, { useState } from 'react';
import { ArrowRight, BrainCircuit, Loader2 } from 'lucide-react';

export default function AIGenerator({ onBack, onSave }) {
    // State ها به داخل کامپوننت منتقل شدند
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // تابع شبیه‌ساز ارتباط با هوش مصنوعی
    const handleGenerate = () => {
        if (!aiPrompt.trim()) return;

        setIsGenerating(true);

        // شبیه‌سازی زمان پردازش هوش مصنوعی (۲.۵ ثانیه)
        setTimeout(() => {
            setIsGenerating(false);

            // اطلاعات برنامه‌ای که هوش مصنوعی (فرضی) ساخته است
            const generatedPlan = {
                title: 'برنامه هوشمند (AI)',
                duration: '۴ هفته',
                level: 'متوسط'
            };

            // ارسال به صفحه اصلی برای ذخیره در جدول
            if(onSave) onSave(generatedPlan);

        }, 2500);
    };

    return (
        <div className="p-6 max-w-3xl mx-auto mt-10">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors w-fit mb-8">
                <ArrowRight size={20} />
                <span>بازگشت</span>
            </button>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
                        <BrainCircuit size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">تولید برنامه با هوش مصنوعی</h2>
                        <p className="text-gray-500 text-sm mt-1">مشخصات و هدف شاگرد را شرح دهید.</p>
                    </div>
                </div>

                <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="مثال: یک برنامه ۴ روزه در هفته برای یک آقا ۳۰ ساله سطح مبتدی. هدف کاهش وزن است و آسیب دیدگی زانو دارد..."
                    className="w-full h-40 border border-gray-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none mb-6 text-gray-700 bg-gray-50"
                    disabled={isGenerating}
                />

                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="w-full bg-gradient-to-l from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 size={24} className="animate-spin" />
                            <span>در حال تحلیل و ساخت برنامه...</span>
                        </>
                    ) : (
                        <>
                            <BrainCircuit size={24} />
                            <span>تولید برنامه</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
