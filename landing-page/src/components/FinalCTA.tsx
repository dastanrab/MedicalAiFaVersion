import { ArrowLeft, HeartPulse, Sparkles } from 'lucide-react'
import { APP_URL } from '../data/content'
import { Reveal } from './Reveal'

export function FinalCTA() {
  return (
    <section className="pb-24 pt-6 bg-white">
      <div className="container-shell">
        <Reveal className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-700 via-blue-700 to-blue-500 px-6 py-14 text-center text-white shadow-[0_28px_70px_-30px_rgba(30,101,137,0.65)] sm:px-10 sm:py-16">
          <div className="dot-grid absolute inset-0 opacity-20" />
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-2xl" />
          <HeartPulse className="absolute right-[12%] top-12 hidden h-8 w-8 text-white/15 sm:block" />
          <Sparkles className="absolute bottom-14 left-[12%] hidden h-7 w-7 text-white/20 sm:block" />

          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-50">
              <Sparkles className="h-3.5 w-3.5" />
              چند دقیقه برای حال خودتان
            </span>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">از حال‌تان بگویید</h2>
            <p className="mt-4 text-sm leading-8 text-blue-50/85 sm:text-base">
              علائم‌تان را بنویسید، به چند سؤال جواب دهید و برای مراجعه بعدی آماده‌تر شوید.
            </p>
            <a
              href={APP_URL}
              className="focus-ring group mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-extrabold text-blue-700 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-blue-50"
            >
              شروع کنید
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
