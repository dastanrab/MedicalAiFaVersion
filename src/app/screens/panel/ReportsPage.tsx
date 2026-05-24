// ReportsPage.tsx
import { useState } from 'react';
import {
    BarChart3, TrendingUp, DollarSign, Users, ClipboardList,
    Download, Calendar, ChevronLeft, ChevronRight, MoreHorizontal,
    Activity, PieChart, Filter
} from 'lucide-react';

// Sample data for reports
const summaryStats = [
    { label: 'کل ویزیت‌ها', value: 348, change: +12.5, icon: BarChart3, color: 'blue' },
    { label: 'بیماران جدید', value: 86, change: +8.2, icon: Users, color: 'cyan' },
    { label: 'درآمد کل', value: '۱۲,۵۰۰,۰۰۰', change: +15.3, unit: 'تومان', icon: DollarSign, color: 'green' },
    { label: 'نسخه‌های صادر شده', value: 217, change: +5.4, icon: ClipboardList, color: 'purple' },
];

// Monthly visits data (for chart placeholder)
const monthlyVisits: { month: string; visits: number; revenue: number }[] = [
    { month: 'فروردین', visits: 45, revenue: 3500000 },
    { month: 'اردیبهشت', visits: 52, revenue: 4100000 },
    { month: 'خرداد', visits: 38, revenue: 2900000 },
    { month: 'تیر', visits: 60, revenue: 4800000 },
    { month: 'مرداد', visits: 48, revenue: 3700000 },
    { month: 'شهریور', visits: 55, revenue: 4200000 },
];

// Diagnosis frequency data (for table)
const topDiagnoses = [
    { diagnosis: 'دیابت نوع ۲', count: 42, percentage: 24 },
    { diagnosis: 'فشار خون بالا', count: 36, percentage: 20 },
    { diagnosis: 'میگرن', count: 28, percentage: 16 },
    { diagnosis: 'آسم', count: 19, percentage: 11 },
    { diagnosis: 'آرتروز زانو', count: 15, percentage: 9 },
];

// Visit types distribution (for pie/donut)
const visitTypeData = [
    { type: 'ویزیت جدید', percentage: 40, color: '#3B82F6' },
    { type: 'پیگیری', percentage: 30, color: '#10B981' },
    { type: 'ویزیت مجدد', percentage: 20, color: '#F59E0B' },
    { type: 'مشاوره', percentage: 10, color: '#8B5CF6' },
];

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'financial'>('overview');
    const [dateRange, setDateRange] = useState('last_month');

    const tabs = [
        { key: 'overview', label: 'نمای کلی' },
        { key: 'patients', label: 'بیماران' },
        { key: 'financial', label: 'مالی' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">گزارش‌ها</h1>
                    <p className="text-sm text-gray-500 mt-1">تحلیل و آمار عملکرد مطب</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="border border-gray-200 bg-white rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-blue-300"
                    >
                        <option value="last_month">ماه گذشته</option>
                        <option value="last_quarter">سه ماه گذشته</option>
                        <option value="last_year">سال گذشته</option>
                    </select>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        خروجی PDF
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
                {summaryStats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                    stat.color === 'cyan' ? 'bg-cyan-100 text-cyan-600' :
                                        stat.color === 'green' ? 'bg-green-100 text-green-600' :
                                            'bg-purple-100 text-purple-600'
                            }`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div className={`flex items-center text-xs font-medium text-green-600`}>
                                <TrendingUp className="w-3.5 h-3.5 ml-0.5" />
                                {stat.change}%
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                            {stat.unit && <p className="text-xs text-gray-400">{stat.unit}</p>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Report Tabs */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as typeof activeTab)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeTab === tab.key
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === 'overview' && (
                    <>
                        {/* Charts Row */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Monthly visits bar chart */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-sm font-semibold text-gray-700">ویزیت‌های ماهانه</h2>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-end justify-around h-44 px-2">
                                    {monthlyVisits.map((item, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                            <div className="w-full max-w-[32px] bg-blue-500 rounded-t-md hover:bg-blue-600 transition-colors"
                                                 style={{ height: `${(item.visits / 60) * 100}%` }}
                                            ></div>
                                            <span className="text-xs text-gray-500">{item.month}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Revenue line chart placeholder */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-semibold text-gray-700">درآمد ماهانه (تومان)</h2>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="relative h-44">
                                    <svg viewBox="0 0 300 150" className="w-full h-full">
                                        <defs>
                                            <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <polyline
                                            fill="none"
                                            stroke="#3B82F6"
                                            strokeWidth="2"
                                            points="0,120 60,110 120,130 180,90 240,100 300,80"
                                        />
                                        <circle cx="0" cy="120" r="3" fill="#3B82F6" />
                                        <circle cx="60" cy="110" r="3" fill="#3B82F6" />
                                        <circle cx="120" cy="130" r="3" fill="#3B82F6" />
                                        <circle cx="180" cy="90" r="3" fill="#3B82F6" />
                                        <circle cx="240" cy="100" r="3" fill="#3B82F6" />
                                        <circle cx="300" cy="80" r="3" fill="#3B82F6" />
                                    </svg>
                                    <div className="absolute bottom-0 left-0 right-0 flex justify-around text-xs text-gray-500">
                                        {monthlyVisits.map((item, i) => (
                                            <span key={i}>{item.month}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tables Row */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Top Diagnoses */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h2 className="text-sm font-semibold text-gray-700 mb-4">تشخیص‌های شایع</h2>
                                <div className="space-y-3">
                                    {topDiagnoses.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-xs font-medium text-gray-500 w-8">{i + 1}</span>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm text-gray-800">{item.diagnosis}</span>
                                                    <span className="text-xs text-gray-500">{item.count} مورد</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full bg-blue-500"
                                                        style={{ width: `${item.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Visit Types Distribution */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h2 className="text-sm font-semibold text-gray-700 mb-4">ترکیب ویزیت‌ها</h2>
                                <div className="flex items-center justify-center">
                                    <div className="relative w-40 h-40">
                                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                            {(() => {
                                                let accumulated = 0;
                                                return visitTypeData.map((item, i) => {
                                                    const dashArray = item.percentage;
                                                    const prevOffset = accumulated;
                                                    accumulated += dashArray;
                                                    return (
                                                        <circle
                                                            key={i}
                                                            cx="18"
                                                            cy="18"
                                                            r="15.9155"
                                                            fill="none"
                                                            stroke={item.color}
                                                            strokeWidth="4"
                                                            strokeDasharray={`${dashArray} ${100 - dashArray}`}
                                                            strokeDashoffset={-prevOffset}
                                                        />
                                                    );
                                                });
                                            })()}
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-sm font-bold text-gray-600">ویزیت‌ها</span>
                                        </div>
                                    </div>
                                    <div className="mr-6 space-y-2">
                                        {visitTypeData.map((item, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                                                <span className="text-xs text-gray-600">{item.type}: {item.percentage}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'patients' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">آمار بیماران</h2>
                        <p className="text-gray-500">گزارش تفصیلی بیماران در این بخش قرار می‌گیرد.</p>
                    </div>
                )}

                {activeTab === 'financial' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-700 mb-4">گزارش مالی</h2>
                        <p className="text-gray-500">جزئیات درآمد و هزینه‌ها در این بخش قرار می‌گیرد.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
