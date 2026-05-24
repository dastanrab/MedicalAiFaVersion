// pages/DashboardPage.tsx
import { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, Stethoscope,
  Users, UserPlus, DollarSign, Clock, BarChart2,
  Activity, TrendingUp
} from 'lucide-react';

const setupSteps = [
  { label: 'اطلاعات پروفایل', step: 1, done: true },
  { label: 'تنظیمات مطب', step: 2, done: true },
  { label: 'بیمه سلامت', step: 3, done: true },
  { label: 'تامین اجتماعی', step: 4, done: true },
  { label: 'تصویر پروفایل', step: 5, done: true },
  { label: 'امنیت', step: 6, done: false },
];

const bannerSlides = [
  {
    title: 'هوش مصنوعی در خدمت پزشکی',
    desc: 'تشخیص هوشمند علائم و پیشنهاد درمان با کمک مدیرا AI',
    color: 'from-blue-600 to-blue-800',
    emoji: '🧠',
  },
  {
    title: 'مدیریت هوشمند نوبت‌دهی',
    desc: 'کاهش زمان انتظار بیماران با سیستم نوبت‌دهی آنلاین',
    color: 'from-cyan-600 to-blue-700',
    emoji: '📅',
  },
  {
    title: 'تجویز دیجیتال نسخه',
    desc: 'صدور سریع نسخه الکترونیک با پشتیبانی از بیمه‌های مختلف',
    color: 'from-blue-700 to-indigo-800',
    emoji: '💊',
  },
];

const upcomingVisits = [
  { name: 'علی رضایی', time: '۰۹:۰۰', type: 'ویزیت', avatar: 'ع' },
  { name: 'مریم احمدی', time: '۰۹:۳۰', type: 'پیگیری', avatar: 'م' },
  { name: 'حسن کریمی', time: '۱۰:۰۰', type: 'ویزیت', avatar: 'ح' },
];

export default function DashboardPage() {
  const [activeSlide, setActiveSlide] = useState(0);

  const nextSlide = () => setActiveSlide((p) => (p + 1) % bannerSlides.length);
  const prevSlide = () => setActiveSlide((p) => (p - 1 + bannerSlides.length) % bannerSlides.length);

  return (
      <div className="space-y-5">
        {/* Setup Steps */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            {setupSteps.map((step, i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        step.done
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-orange-100 border-orange-400 text-orange-600'
                    }`}>
                      {step.done ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                      ) : (
                          <span className="text-xs font-bold">{step.step}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-600 text-center leading-tight">{step.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                        step.done ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                  {step.done ? 'کامل شده' : 'نیازمند بررسی'}
                </span>
                  </div>
                  {i < setupSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 mb-6 ${step.done ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
            ))}
          </div>
        </div>

        {/* Banner + Quick Cards */}
        <div className="grid grid-cols-4 gap-4">
          {/* Banner Slider */}
          <div className={`col-span-3 relative rounded-xl overflow-hidden bg-gradient-to-l ${bannerSlides[activeSlide].color} text-white p-8 min-h-[160px] flex items-center shadow-md`}>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{bannerSlides[activeSlide].title}</h2>
              <p className="text-blue-100 text-sm mb-4">{bannerSlides[activeSlide].desc}</p>
              <button className="bg-white text-blue-700 text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                بیشتر بدانید
              </button>
            </div>
            <div className="text-8xl opacity-30 mr-8">{bannerSlides[activeSlide].emoji}</div>

            {/* Controls */}
            <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {bannerSlides.map((_, i) => (
                  <button key={i} onClick={() => setActiveSlide(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === activeSlide ? 'bg-white w-4' : 'bg-white/40'}`}
                  />
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow transition-colors">
              <Calendar className="w-6 h-6" />
              <span className="text-xs font-medium">نوبت‌دهی آنلاین</span>
            </button>
            <button className="flex-1 bg-white hover:bg-blue-50 border border-gray-200 text-blue-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm transition-colors">
              <Stethoscope className="w-6 h-6" />
              <span className="text-xs font-medium text-gray-700">امکانات جدید</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'تعداد بیماران', value: '۳۱۲', icon: Users, color: 'blue', sub: 'کل بیماران' },
            { label: 'بیمار جدید', value: '۷۲', icon: UserPlus, color: 'cyan', sub: 'این ماه' },
            { label: 'کل درآمد', value: '—', icon: DollarSign, color: 'green', sub: 'بدون اطلاعات' },
            { label: 'اشتراک', value: '۲۸۳ روز', icon: Clock, color: 'purple', sub: 'باقی‌مانده' },
          ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        stat.color === 'cyan' ? 'bg-cyan-100 text-cyan-600' :
                            stat.color === 'green' ? 'bg-green-100 text-green-600' :
                                'bg-purple-100 text-purple-600'
                }`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.sub}</p>
                </div>
              </div>
          ))}
        </div>

        {/* Charts + Upcoming */}
        <div className="grid grid-cols-3 gap-4">
          {/* Bar Chart - Age */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">بیماران بر اساس سن</h3>
              <BarChart2 className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-end gap-2 h-32">
              {[
                { label: '۰-۱۸', val: 20, h: 55 },
                { label: '۱۸-۳۰', val: 26, h: 72 },
                { label: '۳۰-۴۵', val: 18, h: 50 },
                { label: '۴۵-۶۰', val: 14, h: 39 },
                { label: '۶۰+', val: 10, h: 28 },
              ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-blue-700">{bar.val}</span>
                    <div
                        className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-colors cursor-pointer"
                        style={{ height: `${bar.h}px` }}
                    />
                    <span className="text-xs text-gray-400">{bar.label}</span>
                  </div>
              ))}
            </div>
          </div>

          {/* Donut Chart - Gender */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">بیماران بر اساس جنسیت</h3>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center justify-center gap-6">
              <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
                <circle cx="50" cy="50" r="35" fill="none" stroke="#e5e7eb" strokeWidth="18" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="#1d4ed8" strokeWidth="18"
                        strokeDasharray={`${55.6 * 2.199} ${100 * 2.199}`} strokeLinecap="round" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="#06b6d4" strokeWidth="18"
                        strokeDasharray={`${38.9 * 2.199} ${100 * 2.199}`}
                        strokeDashoffset={`-${55.6 * 2.199}`} strokeLinecap="round" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="#93c5fd" strokeWidth="18"
                        strokeDasharray={`${5.5 * 2.199} ${100 * 2.199}`}
                        strokeDashoffset={`-${(55.6 + 38.9) * 2.199}`} strokeLinecap="round" />
              </svg>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-700 inline-block" /><span>مرد ۵۵.۶٪</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" /><span>زن ۳۸.۹٪</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-300 inline-block" /><span>سایر ۵.۵٪</span></div>
              </div>
            </div>
          </div>

          {/* Upcoming Visits */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">ویزیت‌های پیش رو</h3>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-3">
              {upcomingVisits.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                      {v.avatar}
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-medium text-gray-800">{v.name}</p>
                      <p className="text-xs text-gray-500">{v.type}</p>
                    </div>
                    <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{v.time}</span>
                  </div>
              ))}
            </div>
            <button className="w-full mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              مشاهده همه
            </button>
          </div>
        </div>
      </div>
  );
}
