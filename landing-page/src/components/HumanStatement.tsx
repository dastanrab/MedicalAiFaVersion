import { ArrowLeft, Check, Clock3, FileHeart, MessageSquareText, ThermometerSun } from 'lucide-react'
import { APP_URL } from '../data/content'
import { Reveal } from './Reveal'

function StoryVisual() {
  return (
    <div className="relative mx-auto min-h-[410px] w-full max-w-[500px]">
      <div className="absolute inset-8 rounded-[2.5rem] bg-gradient-to-br from-blue-100 to-indigo-100 blur-2xl" />
      <div className="absolute right-0 top-8 w-[72%] rotate-2 rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.3)]">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            <MessageSquareText className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] text-slate-400">چیزی که حس می‌کنم</p>
            <p className="mt-0.5 text-sm font-extrabold text-slate-800">«سرم سنگین شده و بی‌حالم»</p>
          </div>
        </div>
      </div>

      <div className="absolute left-0 top-[8.75rem] w-[68%] -rotate-2 rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_18px_45px_-24px_rgba(15,23,42,0.3)]">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-blue-50 p-3">
            <Clock3 className="h-4 w-4 text-blue-600" />
            <p className="mt-2 text-[10px] text-slate-400">شروع علائم</p>
            <p className="text-xs font-bold text-slate-700">از دیشب</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-3">
            <ThermometerSun className="h-4 w-4 text-amber-600" />
            <p className="mt-2 text-[10px] text-slate-400">نشانه همراه</p>
            <p className="text-xs font-bold text-slate-700">بدون تب</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 right-[8%] w-[84%] rounded-[2rem] bg-gradient-to-br from-blue-800 via-blue-700 to-blue-500 p-5 text-white shadow-[0_24px_60px_-25px_rgba(30,101,137,0.7)]">
        <div className="dot-grid absolute inset-0 rounded-[2rem] opacity-15" />
        <div className="relative flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <FileHeart className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-blue-100">آماده برای ادامه</p>
            <p className="mt-1 text-sm font-extrabold">شرح حال شما مرتب شد</p>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-blue-950">
            <Check className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  )
}

export function HumanStatement() {
  return (
    <section className="overflow-hidden bg-white py-20 sm:py-28">
      <div className="container-shell grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <Reveal>
          <p className="text-sm font-bold text-blue-600">گاهی گفتنِ دقیق حال‌مان سخت است.</p>
          <h2 className="mt-5 text-4xl font-extrabold leading-[1.45] text-blue-950 sm:text-5xl">
            چند نشانه پراکنده،
            <span className="block text-blue-600">یک شرح حال کامل‌تر.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
            مدیرا کمک می‌کند زمان شروع، شدت و نشانه‌های همراه را فراموش نکنید؛ تا وقتی با پزشک صحبت
            می‌کنید، تصویر دقیق‌تری از حال‌تان داشته باشید.
          </p>
          <a
            href={APP_URL}
            className="focus-ring group mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-950 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-blue-950/15 transition-all hover:-translate-y-0.5 hover:bg-blue-800"
          >
            شرح حال من
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </a>
        </Reveal>
        <Reveal delay={0.1}>
          <StoryVisual />
        </Reveal>
      </div>
    </section>
  )
}
