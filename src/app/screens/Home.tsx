import { useNavigate } from 'react-router';
import {
  Activity,
  Stethoscope,
  Sparkles,
  ChevronLeft,
  UtensilsCrossed,
  Calendar,
  Clock,
  Brain,
  FileText,
  TrendingUp,
  Star,
  HelpCircle,
  ChevronDown,
  Bell,
  Crown,
  Bookmark,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { AppBar } from '../components/AppBar';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../admin/store/settingsStore';
import { todayJalali, PERSIAN_MONTHS, toFaDigits } from '../provider/utils/jalali';

const blogPosts = [
  {
    id: 1,
    title: '۱۰ نکته برای سلامت بهتر قلب',
    excerpt: 'با این تغییرات ساده قلبی سالم‌تر داشته باشید.',
    image: '/scan.jpg',
    date: '۲۸ اسفند ۱۴۰۴',
    readTime: '۵ دقیقه مطالعه',
    tag: 'قلب و عروق',
  },
  {
    id: 2,
    title: 'راهنمای تغذیه متعادل',
    excerpt: 'با مواد مغذی ضروری عملکرد سالم بدن خود آشنا شوید.',
    image: '/scan.jpg',
    date: '۲۵ اسفند ۱۴۰۴',
    readTime: '۷ دقیقه مطالعه',
    tag: 'تغذیه',
  },
  {
    id: 3,
    title: 'مزایای ورزش منظم',
    excerpt: 'فعال ماندن چرا برای سلامت جسم و روان ضروری است.',
    image: '/scan.jpg',
    date: '۲۰ اسفند ۱۴۰۴',
    readTime: '۶ دقیقه مطالعه',
    tag: 'ورزش',
  },
  {
    id: 4,
    title: 'سلامت روان: شکستن تابوها',
    excerpt: 'اهمیت سلامت روان در تندرستی کلی بدن را بشناسید.',
    image: '/scan.jpg',
    date: '۱۵ اسفند ۱۴۰۴',
    readTime: '۸ دقیقه مطالعه',
    tag: 'سلامت روان',
  },
];

const recentActivities = [
  {
    id: 1,
    title: 'دکتر سارا محمدی',
    subtitle: 'مشاوره — تکمیل شده',
    time: '۲ روز پیش',
    tone: 'blue' as const,
    icon: Stethoscope,
  },
  {
    id: 2,
    title: 'بررسی علائم',
    subtitle: 'تحلیل سردرد خفیف',
    time: '۵ روز پیش',
    tone: 'emerald' as const,
    icon: Activity,
  },
];

type QuickAction = {
  title: string;
  desc: string;
  path?: string;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  featured?: boolean;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'شب بخیر';
  if (hour < 12) return 'صبح بخیر';
  if (hour < 17) return 'ظهر بخیر';
  if (hour < 20) return 'عصر بخیر';
  return 'شب بخیر';
}

function getJalaliDateLabel(): string {
  const d = todayJalali();
  return `${toFaDigits(d.jd)} ${PERSIAN_MONTHS[d.jm - 1]} ${toFaDigits(d.jy)}`;
}

function HealthScoreRing({ value }: { value: number }) {
  const size = 56;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(value), 350);
    return () => clearTimeout(timer);
  }, [value]);

  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="fill-none stroke-white/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          className="fill-none stroke-white transition-all duration-1000 ease-out"
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
        />
      </svg>
      <span className="absolute text-xs font-extrabold text-white">{toFaDigits(value)}%</span>
    </div>
  );
}

function QuickActionCard({ action, onClick }: { action: QuickAction; onClick: () => void }) {
  const Icon = action.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 text-right shadow-[0_2px_16px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_18px_36px_-12px_rgba(15,23,42,0.18)] active:scale-[0.97]"
    >
      <div
        className={`pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${action.gradient} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-25`}
      />
      <div
        className={`relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${action.iconBg} transition-transform duration-300 group-hover:scale-110`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="relative text-sm font-bold text-gray-900">{action.title}</h3>
      <p className="relative mt-1 text-xs leading-relaxed text-gray-500">{action.desc}</p>
      <div className="relative mt-3 flex items-center gap-1 text-[11px] font-semibold text-transparent transition-all duration-300 group-hover:text-blue-600">
        مشاهده
        <ChevronLeft className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
      </div>
    </button>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  const faq = useSettingsStore((s) => s.content.faq);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ name?: string; gender?: number } | null>(null);
  const blogScrollRef = useRef<HTMLDivElement>(null);
  const blogCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeBlogIndex, setActiveBlogIndex] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://185.222.163.113:7000/api/user/profile', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success) {
          setUserData(data.data.user);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (accessToken) fetchProfile();
  }, [accessToken]);

  useEffect(() => {
    const root = blogScrollRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setActiveBlogIndex(idx);
          }
        });
      },
      { root, threshold: [0.6] }
    );

    blogCardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const firstName = userData?.name?.split(' ')[0] || 'کاربر';

  const quickActions: QuickAction[] = [
    {
      title: 'تشخیص هوشمند',
      desc: 'تحلیل علائم با AI',
      path: '/symptoms',
      icon: Sparkles,
      gradient: 'from-blue-400 to-blue-600',
      iconBg: 'bg-blue-100 text-blue-600',
      featured: true,
    },
    {
      title: 'پزشکان',
      desc: 'رزرو نوبت آنلاین',
      path: '/doctors',
      icon: Stethoscope,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'بررسی علائم',
      desc: 'ثبت و پیگیری',
      path: '/symptoms',
      icon: Activity,
      gradient: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'تناسب و تغذیه',
      desc: 'برنامه اختصاصی',
      path: '/body-measurement',
      icon: UtensilsCrossed,
      gradient: 'from-orange-500 to-amber-600',
      iconBg: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'بینش سلامت',
      desc: 'نکات شخصی‌سازی‌شده',
      icon: Brain,
      gradient: 'from-indigo-500 to-indigo-700',
      iconBg: 'bg-indigo-100 text-indigo-600',
    },
  ];

  return (
    <div
      className="relative h-full overflow-x-hidden overflow-y-auto bg-[#F6F8FC] pb-16 font-[YekanBakhFaNum]"
      dir="rtl"
    >
      {/* Ambient background decoration */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] overflow-hidden">
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -top-10 left-0 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl" />
      </div>

      <AppBar showChat />

      <div className="relative z-10 px-5 pt-24 pb-4 text-right sm:px-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mb-6"
        >
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 px-5 pb-14 pt-5 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.5)]">
            <div className="pointer-events-none absolute -top-14 -left-14 h-40 w-40 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-indigo-400/20 blur-2xl" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.1]"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '18px 18px',
              }}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-12 w-12 shrink-0 ring-2 ring-white/40">
                    <AvatarFallback className="bg-white/15 text-base font-bold text-white backdrop-blur-sm">
                      {firstName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-blue-100/90">{getGreeting()} 👋</p>
                    <h1 className="mt-0.5 truncate text-xl font-extrabold leading-tight text-white">
                      {firstName} عزیز
                    </h1>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-blue-100/80">
                      <Calendar className="h-3 w-3" />
                      {getJalaliDateLabel()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/chats')}
                  aria-label="اعلان‌ها"
                  className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors hover:bg-white/25"
                >
                  <Bell className="h-4.5 w-4.5" />
                  <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-amber-400 ring-2 ring-blue-600" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate('/results')}
                className="group mt-5 flex w-full items-center gap-3 rounded-2xl bg-white/10 p-2.5 pr-3.5 text-right ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                <HealthScoreRing value={82} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">امتیاز سلامت شما عالی است</p>
                  <p className="mt-0.5 text-[11px] text-blue-100/80">
                    بر اساس آخرین تحلیل هوش مصنوعی
                  </p>
                </div>
                <ChevronLeft className="h-4.5 w-4.5 shrink-0 text-white/70 transition-transform group-hover:-translate-x-1" />
              </button>
            </div>
          </div>

          {/* Health stats — floating */}
          <div className="relative z-10 -mt-8 grid grid-cols-3 gap-2 px-1">
            {[
              { label: 'معاینه', value: '۱۲', icon: Stethoscope },
              { label: 'نسخه', value: '۸', icon: FileText },
              { label: 'امتیاز', value: '۴.۸', icon: Star },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.label}
                  className="items-center gap-0 border-0 py-3 px-2 text-center shadow-[0_8px_28px_-8px_rgba(15,23,42,0.15)] ring-1 ring-gray-100 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <div className="mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-xl font-extrabold leading-none text-gray-900">{stat.value}</p>
                  <p className="mt-1 text-[10px] font-medium text-gray-500">{stat.label}</p>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Featured CTA — AI diagnosis */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          type="button"
          onClick={() => navigate('/symptoms')}
          className="group relative mb-6 w-full overflow-hidden rounded-[1.75rem] bg-gradient-to-l from-blue-700 via-blue-500 to-blue-400 p-5 text-right shadow-[0_16px_40px_-8px_rgba(33,150,205,0.45)] transition-all duration-300 hover:shadow-[0_20px_48px_-8px_rgba(33,150,205,0.55)] active:scale-[0.99]"
        >
          <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/25 blur-md transition-transform duration-700 ease-out group-hover:translate-x-[260%]" />
          <div className="relative flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
              <Sparkles className="h-7 w-7 text-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-blue-100">پیشنهاد ویژه</p>
              <h2 className="mt-0.5 text-lg font-bold text-white">شروع تشخیص هوشمند</h2>
              <p className="mt-1 text-sm text-blue-50">علائم را وارد کنید و نتیجه فوری بگیرید</p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30 transition-transform group-hover:scale-110">
              <ChevronLeft className="h-5 w-5 text-white" />
            </div>
          </div>
        </motion.button>

        {/* Premium membership teaser */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          type="button"
          onClick={() => navigate('/plans')}
          className="group relative mb-6 flex w-full items-center gap-4 overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-l from-amber-50 via-orange-50 to-amber-50 p-4 text-right shadow-[0_4px_20px_rgba(217,119,6,0.1)] transition-all hover:shadow-[0_10px_28px_rgba(217,119,6,0.18)] active:scale-[0.99]"
        >
          <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-amber-200/40 blur-2xl" />
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/30">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div className="relative min-w-0 flex-1">
            <h3 className="font-bold text-gray-900">ارتقا به اشتراک ویژه</h3>
            <p className="mt-0.5 text-xs text-gray-600">دسترسی نامحدود به تمام امکانات هوش مصنوعی</p>
          </div>
          <ChevronLeft className="relative h-5 w-5 shrink-0 text-amber-500 transition-transform group-hover:-translate-x-1" />
        </motion.button>

        {/* Period tracker — conditional */}
        {userData?.gender === 1 && (
          <button
            type="button"
            onClick={() => navigate('/period-tracker')}
            className="mb-6 flex w-full items-center gap-4 rounded-3xl border border-pink-100 bg-gradient-to-l from-pink-50 to-rose-50/80 p-4 text-right shadow-[0_2px_16px_rgba(236,72,153,0.12)] transition-all hover:shadow-[0_4px_24px_rgba(236,72,153,0.18)] active:scale-[0.99]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 shadow-md shadow-pink-500/25">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-gray-900">تقویم قاعدگی</h3>
              <p className="mt-0.5 text-sm text-gray-600">ثبت و پیش‌بینی چرخه قاعدگی</p>
            </div>
            <ChevronLeft className="h-5 w-5 shrink-0 text-pink-400" />
          </button>
        )}

        {/* Quick access grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">دسترسی سریع</h2>
            <button
              type="button"
              onClick={() => navigate('/services')}
              className="flex items-center gap-0.5 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              همه خدمات
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions
              .filter((a) => !a.featured)
              .map((action) => (
                <QuickActionCard
                  key={action.title}
                  action={action}
                  onClick={() => action.path && navigate(action.path)}
                />
              ))}
          </div>
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">فعالیت‌های اخیر</h2>
          </div>
          <div className="relative">
            <div className="absolute right-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-blue-200 via-gray-200 to-transparent" />
            <div className="space-y-3">
              {recentActivities.map((item) => {
                const Icon = item.icon;
                const iconColor = item.tone === 'blue' ? 'text-blue-600' : 'text-emerald-600';
                const bgColor = item.tone === 'blue' ? 'bg-blue-50' : 'bg-emerald-50';
                return (
                  <div key={item.id} className="relative flex items-center gap-3">
                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-[#F6F8FC] ${bgColor}`}
                    >
                      <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
                    </div>
                    <Card className="min-w-0 flex-1 flex-row items-center justify-between gap-3 rounded-2xl border border-gray-100 p-3.5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.subtitle}</p>
                      </div>
                      <span className="shrink-0 text-[11px] font-medium text-gray-400">
                        {item.time}
                      </span>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Latest articles — full-bleed carousel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mb-8 -mx-5 sm:-mx-6"
        >
          <div className="mb-4 flex items-center justify-between px-5 sm:px-6">
            <h2 className="text-lg font-bold text-gray-900">آخرین مقالات سلامت</h2>
            <span className="text-xs font-medium text-gray-400">
              {toFaDigits(activeBlogIndex + 1)} از {toFaDigits(blogPosts.length)}
            </span>
          </div>

          <div
            ref={blogScrollRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
          >
            {blogPosts.map((post, index) => (
              <div
                key={post.id}
                ref={(el) => {
                  blogCardRefs.current[index] = el;
                }}
                data-index={index}
                className={`w-[80%] shrink-0 snap-center sm:w-[58%] ${
                  index === 0 ? 'pr-5 sm:pr-6' : ''
                } ${index === blogPosts.length - 1 ? 'pl-5 sm:pl-6' : ''}`}
              >
                <Card className="group overflow-hidden rounded-[1.75rem] border border-gray-100 p-0 shadow-[0_10px_30px_-8px_rgba(15,23,42,0.14)] transition-shadow duration-300 hover:shadow-[0_18px_40px_-10px_rgba(15,23,42,0.2)]">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                    <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-blue-700 backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        {post.tag}
                      </span>
                      <button
                        type="button"
                        aria-label="ذخیره مقاله"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/40 backdrop-blur-md transition-colors hover:bg-white/30"
                      >
                        <Bookmark className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <h3 className="absolute inset-x-4 bottom-3 line-clamp-2 text-base font-bold leading-snug text-white">
                      {post.title}
                    </h3>
                  </div>

                  <div className="space-y-2.5 p-4 text-right">
                    <p className="line-clamp-2 text-sm text-gray-600">{post.excerpt}</p>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 text-[11px] text-gray-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {post.readTime}
                        </span>
                      </div>
                      <ChevronLeft className="h-3.5 w-3.5 text-blue-500 transition-transform group-hover:-translate-x-0.5" />
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5">
            {blogPosts.map((post, index) => (
              <span
                key={post.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeBlogIndex ? 'w-5 bg-blue-600' : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {faq.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-2"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50">
                <HelpCircle className="h-4.5 w-4.5 text-blue-600" />
              </span>
              <h2 className="text-lg font-bold text-gray-900">سؤالات متداول</h2>
            </div>
            <div className="space-y-3">
              {faq.map((item) => {
                const isOpen = openFaqId === item.id;
                return (
                  <Card
                    key={item.id}
                    className={`gap-0 overflow-hidden rounded-2xl border p-0 transition-all duration-300 ${
                      isOpen
                        ? 'border-blue-100 shadow-[0_10px_28px_-10px_rgba(37,99,235,0.25)]'
                        : 'border-gray-100 shadow-[0_2px_12px_rgba(15,23,42,0.04)] hover:border-blue-100 hover:shadow-[0_6px_20px_-8px_rgba(37,99,235,0.15)]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                      className="flex w-full items-center gap-3 p-4 text-right transition-colors hover:bg-gray-50/70"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                          isOpen
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        <HelpCircle className="h-4 w-4" />
                      </span>
                      <span
                        className={`flex-1 text-sm font-semibold transition-colors ${
                          isOpen ? 'text-blue-700' : 'text-gray-900'
                        }`}
                      >
                        {item.question}
                      </span>
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                          isOpen ? 'rotate-180 bg-blue-50' : 'bg-gray-50'
                        }`}
                      >
                        <ChevronDown
                          className={`h-4 w-4 ${isOpen ? 'text-blue-600' : 'text-gray-400'}`}
                        />
                      </span>
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="border-t border-gray-100 px-4 py-3 pr-[52px] text-sm leading-relaxed text-gray-600">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
