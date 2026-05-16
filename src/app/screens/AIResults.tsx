import { useNavigate } from 'react-router';
import {
  Sparkles,
  AlertCircle,
  Activity,
  Home,
  Clock,
  TrendingUp,
  Shield,
  Thermometer,
  Droplets,
  Wind,
  Calendar,
  Pill,
  Heart,
  Info,
  Stethoscope,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AppBar } from '../components/AppBar';
import { SymptomFlowBack } from '../components/SymptomFlowBack';

const keySymptoms = [
  { label: 'تب', icon: Thermometer, bg: 'bg-red-50', color: 'text-red-500' },
  { label: 'آبریزش بینی', icon: Droplets, bg: 'bg-sky-50', color: 'text-sky-500' },
  { label: 'سرفه', icon: Wind, bg: 'bg-amber-50', color: 'text-amber-500' },
  { label: 'خستگی', icon: Activity, bg: 'bg-violet-50', color: 'text-violet-500' },
];

const expectations = [
  'علائم معمولاً طی ۲ تا ۳ روز به اوج می‌رسند',
  'پس از روز پنجم بهبود تدریجی انتظار می‌رود',
  'بیشتر افراد طی ۷ تا ۱۰ روز بهبود کامل پیدا می‌کنند',
];

const recommendations = [
  {
    title: 'استراحت و مایعات',
    desc: '۷ تا ۹ ساعت خواب و مصرف حداقل ۸ لیوان آب در روز',
    badge: 'ضروری',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Heart,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    title: 'داروهای بدون نسخه',
    desc: 'استامینوفن ۵۰۰ میلی‌گرم هر ۶ ساعت یا ایبوپروفن برای تب و درد',
    badge: 'در صورت نیاز',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: Pill,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
  },
  {
    title: 'بخور گرم',
    desc: 'استنشاق بخار گرم ۲ تا ۳ بار در روز برای رفع گرفتگی بینی',
    badge: 'توصیه‌شده',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
    icon: Droplets,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
  {
    title: 'پایش علائم',
    desc: 'دمای بدن و علائم را ثبت کنید؛ در تب بالای ۳۹.۵ درجه یا تنگی نفس فوراً به پزشک مراجعه کنید',
    badge: 'مهم',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Activity,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
];

const urgentSigns = [
  'تب بالای ۳۹.۵ درجه بیش از ۳ روز',
  'تنگی نفس یا درد قفسه سینه',
  'بدتر شدن علائم پس از بهبود اولیه',
  'سردرد شدید یا گیجی',
];

export function AIResults() {
  const navigate = useNavigate();

  return (
    <div
      className="h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white pb-28 text-right font-[YekanBakhFaNum]"
      dir="rtl"
    >
      <AppBar />

      <div className="px-6 pt-24 py-8">
        <SymptomFlowBack to="/questionnairev1" label="بازگشت به سوالات" className="mb-4" />

        {/* Hero */}
        <div className="relative mb-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-blue-600 to-indigo-600 px-5 pt-5 pb-12 shadow-[0_8px_32px_rgba(79,70,229,0.3)]">
            <div className="pointer-events-none absolute -top-10 -left-10 h-36 w-36 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-white/10" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '18px 18px',
              }}
            />
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white ring-1 ring-white/25">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  تحلیل تکمیل شد
                </div>
                <h1 className="text-xl font-bold leading-tight text-white">نتیجه تشخیص هوشمند</h1>
                <p className="mt-0.5 text-sm leading-snug text-blue-100">
                  بر اساس علائم و پاسخ‌های شما
                </p>
              </div>
            </div>
          </div>

          {/* Stats — floating */}
          <div className="relative z-10 -mt-8 grid grid-cols-3 gap-2 px-1">
            {[
              { label: 'علائم بررسی‌شده', value: '۸', icon: Activity, tone: 'blue' },
              { label: 'مدت تقریبی', value: '۳–۵ روز', icon: Clock, tone: 'violet' },
              { label: 'میزان تطابق', value: '۸۵٪', icon: TrendingUp, tone: 'emerald' },
            ].map((stat) => {
              const Icon = stat.icon;
              const toneMap = {
                blue: 'bg-blue-50 text-blue-600',
                violet: 'bg-violet-50 text-violet-600',
                emerald: 'bg-emerald-50 text-emerald-600',
              } as const;
              return (
                <Card
                  key={stat.label}
                  className="border-0 p-3 text-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-gray-100"
                >
                  <div
                    className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${toneMap[stat.tone as keyof typeof toneMap]}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-[10px] font-medium text-gray-500">{stat.label}</p>
                  <p className="text-sm font-bold text-gray-900">{stat.value}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Diagnosis */}
        <Card className="mb-4 overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 p-5 text-white shadow-[0_8px_32px_rgba(37,99,235,0.28)]">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-blue-100">احتمال تشخیص</p>
              <h2 className="mt-0.5 text-xl font-bold leading-snug">عفونت دستگاه تنفسی فوقانی</h2>
              <p className="mt-2 text-sm leading-relaxed text-blue-100">
                شایع‌ترین نوع سرماخوردگی که بینی، گلو و مجاری هوایی را تحت تأثیر قرار می‌دهد
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Badge className="rounded-full border-white/30 bg-white/20 text-white">اطمینان ۸۵٪</Badge>
            <Badge className="rounded-full border-white/30 bg-white/20 text-white">شدت متوسط</Badge>
            <Badge className="rounded-full border-white/30 bg-white/20 text-white">خودبه‌خود بهبود</Badge>
          </div>
        </Card>

        {/* Key symptoms */}
        <Card className="mb-4 rounded-2xl border border-gray-100 p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
          <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
            <Info className="h-4 w-4 shrink-0 text-blue-500" />
            علائم کلیدی شناسایی‌شده
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {keySymptoms.map(({ label, icon: Icon, bg, color }) => (
              <div
                key={label}
                className={`flex items-center gap-2 rounded-xl p-2.5 ${bg}`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                <span className="text-sm font-medium text-gray-900">{label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Severity & recovery */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <Card className="rounded-2xl border border-gray-100 p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-xs text-gray-500">سطح شدت</p>
            <p className="text-lg font-bold text-gray-900">متوسط</p>
          </Card>
          <Card className="rounded-2xl border border-gray-100 p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500">زمان بهبود</p>
            <p className="text-lg font-bold text-gray-900">۷ تا ۱۰ روز</p>
          </Card>
        </div>

        {/* What to expect */}
        <Card className="mb-4 rounded-2xl border border-indigo-100 bg-gradient-to-l from-indigo-50/80 to-violet-50/80 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-900">
            <TrendingUp className="h-4 w-4 shrink-0 text-indigo-600" />
            پیش‌بینی روند بیماری
          </h3>
          <ul className="space-y-2.5">
            {expectations.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-gray-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        {/* Recommendations */}
        <div className="mb-4">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900">
            <Shield className="h-5 w-5 shrink-0 text-emerald-600" />
            توصیه‌های درمانی
          </h2>
          <div className="space-y-2">
            {recommendations.map((rec) => {
              const Icon = rec.icon;
              return (
                <Card
                  key={rec.title}
                  className="rounded-2xl border border-gray-100 p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${rec.iconBg}`}
                    >
                      <Icon className={`h-5 w-5 ${rec.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900">{rec.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">{rec.desc}</p>
                      <Badge className={`mt-2 rounded-full text-[11px] ${rec.badgeClass}`}>
                        {rec.badge}
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Urgent care */}
        <Card className="mb-4 rounded-2xl border border-red-200 bg-red-50/80 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-red-900">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            در این موارد فوراً به پزشک مراجعه کنید
          </h3>
          <ul className="space-y-2">
            {urgentSigns.map((sign) => (
              <li key={sign} className="flex items-start gap-2 text-sm text-red-900">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
                {sign}
              </li>
            ))}
          </ul>
        </Card>

        {/* Disclaimer */}
        <Card className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm leading-relaxed text-amber-900">
              این تحلیل توسط هوش مصنوعی تولید شده و جایگزین تشخیص پزشک نیست. برای تشخیص و
              درمان دقیق حتماً با پزشک مشورت کنید.
            </p>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate('/doctors')}
            className="group flex w-full items-center justify-center gap-2.5 rounded-full border border-blue-100/90 bg-gradient-to-b from-white via-white to-blue-50/90 py-3 pl-1.5 pr-4 text-sm font-semibold text-blue-700 shadow-[0_4px_24px_-6px_rgba(59,130,246,0.28)] transition-all duration-300 hover:border-blue-200 hover:text-blue-800 hover:shadow-[0_8px_32px_-6px_rgba(59,130,246,0.38)] active:scale-[0.97]"
          >
            <span>یافتن پزشک</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30 transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-700">
              <Stethoscope className="h-4 w-4" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/home')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Home className="h-4 w-4" />
            بازگشت به خانه
          </button>
        </div>
      </div>
    </div>
  );
}
