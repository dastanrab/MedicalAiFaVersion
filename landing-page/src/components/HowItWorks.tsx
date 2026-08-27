import { ArrowLeft, Route } from 'lucide-react'
import { APP_URL, steps } from '../data/content'
import { Reveal } from './Reveal'

export function HowItWorks() {
  return (
    <section className="section-space overflow-hidden bg-[#F7FAFC]">
      <div className="container-shell">
        <div className="grid items-start gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28">
            <span className="section-label">
              <Route className="h-3.5 w-3.5" />
              فقط چهار قدم
            </span>
            <h2 className="mt-5 text-3xl font-extrabold leading-tight text-blue-950 sm:text-4xl">
              شروعش از حال امروز شماست
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              چند دقیقه وقت بگذارید و آنچه حس می‌کنید بنویسید. در پایان، جمع‌بندی صحبت‌ها و گزینه‌های
              پیش رویتان را می‌بینید.
            </p>
            <a
              href={APP_URL}
              className="focus-ring group mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-[var(--brand-shadow)] hover:bg-blue-700"
            >
              شروع بررسی
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </a>
          </Reveal>

          <div className="relative">
            <div className="absolute bottom-10 right-6 top-10 w-px bg-gradient-to-b from-blue-300 via-blue-200 to-transparent sm:right-8" />
            <div className="space-y-4">
              {steps.map((step, index) => (
                <Reveal key={step.number} delay={index * 0.08}>
                  <article className="group relative flex gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_8px_28px_-18px_rgba(15,23,42,0.2)] transition-all hover:border-blue-100 hover:shadow-[0_14px_34px_-18px_rgba(33,150,205,0.28)] sm:gap-6 sm:p-7">
                    <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-lg font-extrabold text-white shadow-lg shadow-blue-200 transition-transform group-hover:scale-105 sm:h-16 sm:w-16 sm:text-xl">
                      {step.number}
                    </span>
                    <div className="pt-1 sm:pt-2">
                      <h3 className="text-base font-extrabold text-slate-900 sm:text-lg">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-500">{step.description}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
