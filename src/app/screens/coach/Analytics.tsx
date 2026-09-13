import React from 'react';
import {
    BarChart3, Users, Activity, Target, TrendingUp, Calendar as CalendarIcon
} from 'lucide-react';

export default function Analytics() {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-50 min-h-screen text-right font-[YekanBakhFaNum]" dir="rtl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">آمار و آنالیز</h2>
                    <p className="text-slate-500 text-sm mt-1">بررسی روند پیشرفت، ریزش و جذب شاگردان</p>
                </div>
                <select className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm font-medium cursor-pointer">
                    <option>گزارش ۳۰ روز گذشته</option>
                    <option>گزارش ۳ ماهه</option>
                    <option>گزارش سالانه</option>
                </select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'شاگردان فعال', value: '۱۲۴', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { title: 'نرخ ماندگاری', value: '۸۵٪', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { title: 'برنامه‌های صادر شده', value: '۴۸', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { title: 'جلسات مشاوره', value: '۳۲', icon: CalendarIcon, color: 'text-amber-600', bg: 'bg-amber-50' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm font-medium mb-1">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* نمودار درآمد و جذب (Mock) */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <BarChart3 size={20} className="text-indigo-500" />
                            نمودار جذب شاگردان جدید
                        </h3>
                    </div>
                    {/* Placeholder for Recharts */}
                    <div className="h-64 w-full flex items-end justify-between gap-2 px-2">
                        {[40, 70, 45, 90, 65, 120, 100].map((height, i) => (
                            <div key={i} className="w-full flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-full bg-indigo-100 rounded-t-lg relative group-hover:bg-indigo-200 transition-colors" style={{ height: `${height}%` }}>
                                    <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t-lg transition-all group-hover:bg-indigo-600" style={{ height: `${height - 10}%` }}></div>
                                </div>
                                <span className="text-xs text-slate-400 font-medium">هفته {i+1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* اهداف و پیشرفت */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-6 text-white shadow-md border border-indigo-400">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <TrendingUp size={20} />
                        اهداف ماهانه
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>جذب شاگرد جدید</span>
                                <span className="font-bold">۱۵ / ۲۰</span>
                            </div>
                            <div className="w-full bg-indigo-900/40 rounded-full h-2.5">
                                <div className="bg-emerald-400 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>تمدید اشتراک</span>
                                <span className="font-bold">۴۰ / ۵۰</span>
                            </div>
                            <div className="w-full bg-indigo-900/40 rounded-full h-2.5">
                                <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
