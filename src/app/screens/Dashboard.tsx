import React, { useState } from 'react';

// --- داده‌های ساختگی (Mock Data) ---
const MENU_ITEMS = [
    { id: 1, title: 'داشبورد', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', active: true },
    { id: 2, title: 'نوبت‌دهی / پذیرش', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', active: false },
    { id: 3, title: 'تجویز نسخه', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', active: false },
    { id: 4, title: 'لیست بیماران', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', active: false },
    { id: 5, title: 'ویزیت های من', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', active: false },
];

const STEPS = [
    { id: 1, title: 'اطلاعات پروفایل', status: 'کامل شده', active: true },
    { id: 2, title: 'تنظیمات مطب', status: 'کامل شده', active: true },
    { id: 3, title: 'بیمه سلامت', status: 'کامل شده', active: true },
    { id: 4, title: 'تامین اجتماعی', status: 'کامل شده', active: true },
    { id: 5, title: 'تصویر پروفایل', status: 'کامل شده', active: true },
    { id: 6, title: 'امنیت', status: 'نیازمند بررسی', active: false },
].reverse(); // برای نمایش راست‌چین

const Dashboard = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div dir="rtl" className="flex h-screen bg-gray-50 font-[YekanBakhFaNum] text-gray-800 overflow-hidden selection:bg-blue-200">

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-20 md:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
        fixed md:static inset-y-0 right-0 w-64 bg-white border-l border-gray-200 flex flex-col z-30 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xl cursor-pointer">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path></svg>
                        مدیرا ai
                    </div>
                    <button className="md:hidden text-gray-500 hover:text-red-500" onClick={() => setIsMobileMenuOpen(false)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="p-4">
                    <button className="w-full bg-blue-800 hover:bg-blue-900 text-white rounded-lg h-10 flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-sm">
                        <span>+</span> ثبت نسخه جدید
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 space-y-1">
                    {MENU_ITEMS.map((item) => (
                        <a
                            key={item.id}
                            href="#"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${item.active
                                ? 'bg-blue-50 text-blue-800 border-r-4 border-blue-800 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-r-4 border-transparent'
                            }
              `}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                            </svg>
                            {item.title}
                        </a>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">

                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 z-10 shrink-0">
                    <div className="flex items-center gap-3 lg:gap-4">
                        <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setIsMobileMenuOpen(true)}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>

                        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
                            <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-8 h-8 rounded-full border border-gray-200" />
                            <span className="text-sm font-medium hidden sm:block">دکتر محمدی</span>
                        </div>

                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full relative transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <span className="hidden sm:inline-block bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs px-3 py-1 rounded-full font-medium shadow-sm">
              بسته‌ی پیشرفته PRO
            </span>
                    </div>

                    <div className="relative w-48 sm:w-72">
                        <input
                            type="text"
                            placeholder="جستجوی کد ملی..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pr-10 pl-4 text-xs focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Stepper Progress */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-x-auto">
                            <div className="flex items-center justify-between relative min-w-[600px]">
                                <div className="absolute top-5 left-8 right-8 h-[2px] bg-gray-100 z-0"></div>
                                {STEPS.map((step) => (
                                    <div key={step.id} className="flex flex-col items-center relative z-10 gap-2 w-24 group">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-transform group-hover:scale-110 shadow-sm
                      ${step.active ? 'border-emerald-500 text-emerald-500' : 'border-gray-300 text-gray-400'}`}>
                                            {step.active ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            ) : (
                                                <span className="text-sm font-bold">{step.id}</span>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[11px] text-gray-500 mb-0.5">مرحله {step.id}</div>
                                            <div className="text-xs font-bold text-gray-800 whitespace-nowrap">{step.title}</div>
                                            <div className={`text-[10px] px-2 py-0.5 rounded-full mt-1.5 font-medium
                        ${step.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                                                {step.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Banners Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            <div className="lg:col-span-8 bg-gradient-to-r from-yellow-100 to-[#f4e6b5] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
                                    <div className="w-20 h-20 bg-yellow-400 rounded-2xl shadow-lg relative flex items-center justify-center transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                                        <span className="text-white text-4xl font-bold">+</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-extrabold text-blue-900 mb-2">اشتراک‌گذاری نسخه‌های پراستفاده</h2>
                                        <p className="text-sm text-gray-700 mb-4 font-medium">به راحتی نسخه‌های پراستفاده را با همکاران کلینیک به اشتراک بگذارید.</p>
                                        <button className="bg-white text-blue-900 px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 hover:scale-105 transition-all">شروع انتقال</button>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 flex gap-4">
                                <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 flex flex-col justify-end text-white shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                                    <h3 className="text-sm font-bold mb-3 z-10 leading-relaxed">فعال‌سازی نوبت‌دهی آنلاین در سیستم جدید</h3>
                                    <button className="w-fit text-xs border border-white/30 bg-white/5 backdrop-blur-sm px-4 py-1.5 rounded-lg group-hover:bg-white/20 transition-colors z-10">مشاهده آموزش</button>
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Grid (Stats, Charts, Visits) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Right Column: Upcoming Visits Placeholder */}
                            <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
                                <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">ویزیت‌های پیش رو</h3>
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-10 space-y-3">
                                    <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    <p className="text-sm">ویزیتی برای امروز ثبت نشده است.</p>
                                    <button className="text-blue-600 text-sm font-medium hover:underline mt-2">ثبت نوبت جدید</button>
                                </div>
                            </div>

                            {/* Left Column: Stats & Charts */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { label: 'کل بیماران', value: '۳۱۲', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'text-blue-500', bg: 'bg-blue-50' },
                                        { label: 'بیماران جدید', value: '۷۲', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                        { label: 'درآمد کل', value: '۴.۵ م ت', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-yellow-500', bg: 'bg-yellow-50' },
                                        { label: 'اعتبار اشتراک', value: '۲۸۳ روز', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-purple-500', bg: 'bg-purple-50' },
                                    ].map((stat, idx) => (
                                        <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col hover:shadow-md transition-shadow">
                                            <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path></svg>
                                            </div>
                                            <div className="text-gray-500 text-xs mb-1 font-medium">{stat.label}</div>
                                            <div className="text-lg font-bold text-gray-800">{stat.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Charts Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Gender Chart Mock */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center">
                                        <h4 className="text-sm font-bold text-gray-700 w-full mb-4">ترکیب جنسیتی</h4>
                                        <div className="relative w-32 h-32 rounded-full mb-4"
                                             style={{ background: 'conic-gradient(#3b82f6 0% 60%, #ec4899 60% 100%)' }}>
                                            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center shadow-inner">
                                                <span className="text-xs text-gray-500 font-bold">بیماران</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 text-xs font-medium">
                                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>مرد (۶۰٪)</div>
                                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500"></span>زن (۴۰٪)</div>
                                        </div>
                                    </div>

                                    {/* Age Chart Mock */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col">
                                        <h4 className="text-sm font-bold text-gray-700 mb-4">رده سنی بیماران</h4>
                                        <div className="flex-1 flex items-end justify-between gap-2 h-32 pt-4">
                                            {[40, 70, 100, 50, 30].map((h, i) => (
                                                <div key={i} className="flex flex-col items-center flex-1 gap-2 group">
                                                    <div className="w-full bg-blue-100 rounded-t-sm relative group-hover:bg-blue-200 transition-colors" style={{ height: `${h}%` }}>
                                                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">{h}</div>
                                                    </div>
                                                    <span className="text-[10px] text-gray-500">{['<۲۰', '۲۰-۳۰', '۳۰-۴۰', '۴۰-۵۰', '>۵۰'][i]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
