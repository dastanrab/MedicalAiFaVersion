import { Activity, ArrowLeft, Check, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { APP_URL } from '../data/content'

function AppPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[510px]" aria-label="پیش‌نمایش رابط کاربری مدیرا AI">
      <div className="absolute -inset-10 -z-10 rounded-full bg-blue-300/20 blur-3xl" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[#F6F8FC] p-3 shadow-[0_28px_80px_-28px_rgba(20,57,78,0.38)] sm:p-4"
      >
        <div className="mb-3 flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </div>
          <span className="text-[10px] font-semibold text-slate-400">medira.ai</span>
        </div>

        <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-500 p-5 text-white">
          <div className="dot-grid absolute inset-0 opacity-25" />
          <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-blue-100">گفت‌وگو با مدیرا</span>
              <h3 className="mt-1 text-xl font-extrabold">چه چیزی اذیت‌تان می‌کند؟</h3>
              <p className="mt-1 text-xs leading-6 text-blue-100">
                هرچه هست، با کلمات خودتان بنویسید
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <Sparkles className="h-7 w-7" />
            </div>
          </div>
        </div>

        <div className="relative z-10 -mt-5 mx-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_12px_32px_-16px_rgba(15,23,42,0.35)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div className="flex-1">
                <p className="text-xs font-bold text-slate-800">از چه زمانی شروع شده؟</p>
              <div className="mt-2 rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-500">
                از دیروز سردرد دارم و کمی احساس خستگی می‌کنم...
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 pr-12">
            {['سردرد', 'خستگی', 'از دیروز'].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700"
              >
                <Check className="h-3 w-3" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Activity className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] text-slate-400">الان اینجایید</p>
                <p className="text-xs font-bold text-slate-700">تکمیل شرح حال</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] text-slate-400">قدم بعد</p>
                <p className="text-xs font-bold text-slate-700">پزشک مرتبط</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="floating absolute -left-3 top-24 hidden rounded-2xl border border-white bg-white/95 p-3 shadow-xl sm:block">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Check className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] text-slate-400">بدون فرم‌های طولانی</p>
            <p className="text-xs font-bold text-slate-700">همان‌طور که حرف می‌زنید</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  const reduceMotion = useReducedMotion()

  return (
    <section id="intro" className="relative overflow-hidden bg-white pb-20 pt-16 sm:pt-20 lg:pb-28 lg:pt-24">
      <div className="hairline-grid absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
      <div className="absolute -right-40 top-8 h-[28rem] w-[28rem] rounded-full bg-blue-100/70 blur-3xl" />
      <div className="absolute -left-32 top-32 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl" />
      <svg
        className="pointer-events-none absolute bottom-6 left-0 h-28 w-full text-blue-200/50"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 72h340l26-1 15-44 24 79 22-59 18 25h235l18-2 15-31 20 54 17-23h690"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="container-shell relative grid items-center gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="text-center lg:text-right"
        >
          <div className="section-label">
            <Stethoscope className="h-3.5 w-3.5" />
            از شرح حال تا پیدا کردن پزشک
          </div>
          <h1 className="mt-6 text-[2.55rem] font-extrabold leading-[1.28] tracking-[-0.02em] text-blue-950 sm:text-5xl lg:text-[3.5rem]">
            حال‌تان را بهتر بگویید،
            <span className="relative mx-2 inline-block text-blue-600">
              راه بعدی
              <svg
                className="absolute -bottom-2 right-0 w-full text-blue-300"
                viewBox="0 0 180 12"
                fill="none"
                aria-hidden="true"
              >
                <path d="M3 8.5C45 2 126 2 177 7" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              </svg>
            </span>
            را پیدا کنید
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg sm:leading-9 lg:mx-0">
            مدیرا AI حرف‌های پراکنده درباره حال‌تان را کنار هم می‌گذارد، چند سؤال لازم را می‌پرسد و
            کمک می‌کند پزشک یا خدمت مرتبط را پیدا کنید.
          </p>

          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
            <a
              href={APP_URL}
              className="focus-ring group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-[var(--brand-shadow)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
            >
              ورود به سامانه
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </a>
            <a
              href="#features"
              className="focus-ring inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              آشنایی با امکانات
            </a>
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-xs leading-6 text-slate-500 lg:justify-start">
            <ShieldCheck className="h-4 w-4 shrink-0 text-blue-500" />
            برای جمع‌بندی بهتر علائم؛ تشخیص و درمان با پزشک است.
          </p>
        </motion.div>

        <AppPreview />
      </div>
    </section>
  )
}
