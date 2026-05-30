import { useNavigate } from 'react-router';
import {
  Activity,
  Stethoscope,
  Sparkles,
  ChevronLeft,
  UtensilsCrossed,
  Calendar,
  Clock,
  ChevronRight,
  Brain,
  FileText,
  TrendingUp,
  Star,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '../components/ui/card';
import { AppBar } from '../components/AppBar';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

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
  },
  {
    id: 2,
    title: 'بررسی علائم',
    subtitle: 'تحلیل سردرد خفیف',
    time: '۵ روز پیش',
    tone: 'emerald' as const,
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

function SliderArrow({
  onClick,
  direction,
}: {
  onClick?: () => void;
  direction: 'next' | 'prev';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'next' ? 'بعدی' : 'قبلی'}
      className={`absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-100 bg-white/95 text-gray-700 shadow-[0_4px_16px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] active:scale-95 ${
        direction === 'next' ? 'right-2' : 'left-2'
      }`}
    >
      {direction === 'next' ? (
        <ChevronRight className="h-5 w-5" />
      ) : (
        <ChevronLeft className="h-5 w-5" />
      )}
    </button>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  const [userData, setUserData] = useState<{ name?: string; gender?: number } | null>(null);

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

  const firstName = userData?.name?.split(' ')[0] || 'کاربر';

  const quickActions: QuickAction[] = [
    {
      title: 'تشخیص هوشمند',
      desc: 'تحلیل علائم با AI',
      path: '/symptoms',
      icon: Sparkles,
      gradient: 'from-violet-500 to-indigo-600',
      iconBg: 'bg-violet-100 text-violet-600',
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
      gradient: 'from-purple-500 to-fuchsia-600',
      iconBg: 'bg-purple-100 text-purple-600',
    },
  ];

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1.15,
    slidesToScroll: 1,
    autoplay: true,
    rtl: true,
    autoplaySpeed: 4000,
    arrows: true,
    centerMode: false,
    nextArrow: <SliderArrow direction="next" />,
    prevArrow: <SliderArrow direction="prev" />,
  };

  return (
    <div
      className="h-full overflow-x-hidden overflow-y-auto bg-gradient-to-b from-blue-50 to-white pb-24 font-[YekanBakhFaNum]"
      dir="rtl"
    >
      <AppBar />

      <div className="px-6 pt-24 py-8 text-right">
        {/* Hero */}
        <div className="relative mb-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-5 pb-12 pt-5 shadow-[0_8px_32px_rgba(37,99,235,0.28)]">
            <div className="pointer-events-none absolute -top-10 -left-10 h-36 w-36 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-white/10" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '18px 18px',
              }}
            />
            <div className="relative z-10">
              <p className="text-sm font-medium text-blue-100">خوش آمدید</p>
              <h1 className="mt-1 text-2xl font-bold leading-tight text-white">
                سلام {firstName} عزیز 👋
              </h1>
              <p className="mt-1 text-sm text-blue-100">امروز حالتان چطور است؟</p>
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
                  className="border-0 p-3 text-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-gray-100"
                >
                  <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  <p className="text-[10px] font-medium text-gray-500">{stat.label}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Featured CTA — AI diagnosis */}
        <button
          type="button"
          onClick={() => navigate('/symptoms')}
          className="group mb-6 w-full overflow-hidden rounded-2xl bg-gradient-to-l from-violet-600 via-blue-600 to-indigo-600 p-5 text-right shadow-[0_8px_32px_rgba(79,70,229,0.35)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(79,70,229,0.45)] active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-violet-100">پیشنهاد ویژه</p>
              <h2 className="mt-0.5 text-lg font-bold text-white">شروع تشخیص هوشمند</h2>
              <p className="mt-1 text-sm text-blue-100">علائم را وارد کنید و نتیجه فوری بگیرید</p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30 transition-transform group-hover:scale-110">
              <ChevronLeft className="h-5 w-5 text-white" />
            </div>
          </div>
        </button>

        {/* Period tracker — conditional */}
        {userData?.gender === 1 && (
          <button
            type="button"
            onClick={() => navigate('/period-tracker')}
            className="mb-6 flex w-full items-center gap-4 rounded-2xl border border-pink-100 bg-gradient-to-l from-pink-50 to-rose-50/80 p-4 text-right shadow-[0_2px_16px_rgba(236,72,153,0.12)] transition-all hover:shadow-[0_4px_24px_rgba(236,72,153,0.18)] active:scale-[0.99]"
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
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">دسترسی سریع</h2>
            <span className="text-xs font-medium text-blue-600">همه خدمات</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions
              .filter((a) => !a.featured)
              .map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.title}
                    type="button"
                    onClick={() => action.path && navigate(action.path)}
                    className="group rounded-2xl border border-gray-100 bg-white p-4 text-right shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all hover:border-blue-100 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] active:scale-[0.98]"
                  >
                    <div
                      className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${action.iconBg}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">{action.title}</h3>
                    <p className="mt-0.5 text-xs text-gray-500">{action.desc}</p>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">فعالیت‌های اخیر</h2>
          </div>
          <Card className="overflow-hidden rounded-2xl border border-gray-100 p-0 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
            {recentActivities.map((item, index) => {
              const dotColor =
                item.tone === 'blue' ? 'bg-blue-500' : 'bg-emerald-500';
              const bgColor =
                item.tone === 'blue' ? 'bg-blue-50' : 'bg-emerald-50';
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-3 p-4 ${
                    index > 0 ? 'border-t border-gray-100' : ''
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgColor}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.subtitle}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium text-gray-400">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </Card>
        </div>

        {/* Blog slider */}
        <div className="mb-4 overflow-hidden">
          <div className="mb-4 flex items-center justify-between px-0">
            <h2 className="text-lg font-bold text-gray-900">آخرین مقالات سلامت</h2>
          </div>
          <div className="blog-slider-container -mx-2 px-2">
            <Slider {...sliderSettings}>
              {blogPosts.map((post) => (
                <div key={post.id} className="px-2">
                  <Card className="overflow-hidden rounded-2xl border border-gray-100 p-0 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 backdrop-blur-sm">
                        {post.tag}
                      </span>
                    </div>
                    <div className="space-y-2 p-4 text-right">
                      <h3 className="line-clamp-2 text-base font-bold leading-snug text-gray-900">
                        {post.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-gray-600">{post.excerpt}</p>
                      <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
}
