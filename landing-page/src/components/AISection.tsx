import { Activity, ArrowLeft, BrainCircuit, Check, MessageCircleQuestion, Route, Sparkles } from 'lucide-react'
import { APP_URL } from '../data/content'
import { Reveal } from './Reveal'

function AIVisual() {
  const nodes = [
    { label: 'شرح علائم', icon: MessageCircleQuestion, className: 'right-2 top-8 sm:right-8' },
    { label: 'سؤال بعدی', icon: Sparkles, className: 'left-2 top-8 sm:left-8' },
    { label: 'جمع‌بندی', icon: Activity, className: 'bottom-8 right-2 sm:right-8' },
    { label: 'پزشک مرتبط', icon: Route, className: 'bottom-8 left-2 sm:left-8' },
  ]

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[500px]">
      <div className="pulse-soft absolute inset-[18%] rounded-full border border-blue-200 bg-blue-50/70" />
      <div className="absolute inset-[29%] rounded-full border border-blue-200 bg-white shadow-[0_18px_50px_-20px_rgba(33,150,205,0.45)]" />
      <div className="absolute inset-[35%] z-10 flex items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl shadow-blue-200">
        <BrainCircuit className="h-12 w-12 sm:h-16 sm:w-16" />
      </div>

      <svg className="absolute inset-0 h-full w-full text-blue-200" viewBox="0 0 500 500" aria-hidden="true">
        <path d="M250 250L110 100M250 250L390 100M250 250L110 400M250 250L390 400" stroke="currentColor" strokeWidth="2" strokeDasharray="5 8" />
      </svg>

      {nodes.map((node) => {
        const Icon = node.icon
        return (
          <div
            key={node.label}
            className={`floating absolute ${node.className} flex min-w-[118px] items-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_12px_30px_-16px_rgba(15,23,42,0.3)]`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold text-slate-700">{node.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export function AISection() {
  return (
    <section id="ai" className="section-space overflow-hidden bg-white">
      <div className="container-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <AIVisual />
        </Reveal>

        <Reveal>
          <span className="section-label">
            <BrainCircuit className="h-3.5 w-3.5" />
            پشت صحنه مدیرا
          </span>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight text-blue-950 sm:text-4xl">
            مدیرا از حرف‌های شما، یک شرح حال مرتب می‌سازد
          </h2>
          <p className="mt-5 text-sm leading-8 text-slate-600 sm:text-base">
            شما فقط آنچه حس می‌کنید را می‌نویسید. موتور هوش مصنوعی مدیرا پاسخ‌ها را کنار هم می‌گذارد،
            اگر لازم باشد سؤال دیگری می‌پرسد و در پایان تخصص مرتبط را نشان می‌دهد.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'سؤال‌ها بر اساس جواب قبلی شما ادامه پیدا می‌کنند',
              'شرح علائم پراکنده، مرتب و خلاصه می‌شود',
              'پیشنهاد تخصص داده می‌شود؛ نه تشخیص قطعی',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <a
            href={APP_URL}
            className="focus-ring group mt-8 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-100"
          >
            شروع گفت‌وگو با مدیرا
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </a>
        </Reveal>
      </div>
    </section>
  )
}
