import { Sparkles } from 'lucide-react'
import { features } from '../data/content'
import { Reveal } from './Reveal'

const toneClasses = {
  blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600',
  indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600',
  cyan: 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600',
  violet: 'bg-violet-50 text-violet-600 group-hover:bg-violet-600',
  rose: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600',
}

export function Features() {
  return (
    <section id="features" className="section-space bg-[#F7FAFC]">
      <div className="container-shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="section-label">
            <Sparkles className="h-3.5 w-3.5" />
            مدیرا چه کار می‌کند؟
          </span>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight text-blue-950 sm:text-4xl">
            از «حالم خوب نیست» تا یک شرح حال مرتب
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            لازم نیست اصطلاح پزشکی بلد باشید. از همان چیزی که حس می‌کنید شروع کنید؛ مدیرا بقیه سؤال‌ها
            را یکی‌یکی می‌پرسد.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const featured = index === 0
            return (
              <Reveal
                key={feature.title}
                delay={index * 0.06}
                className={featured || index === 3 || index === 5 ? 'lg:col-span-2' : ''}
              >
                <article
                  className={`group relative h-full overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 ${
                    featured
                      ? 'border border-blue-500 bg-gradient-to-br from-blue-800 via-blue-700 to-blue-500 shadow-[0_20px_45px_-22px_rgba(30,101,137,0.65)] sm:p-8'
                      : 'border border-slate-100 bg-white shadow-[0_5px_24px_-16px_rgba(15,23,42,0.25)] hover:border-blue-100 hover:shadow-[0_20px_42px_-20px_rgba(30,101,137,0.3)]'
                  }`}
                >
                  {featured ? (
                    <>
                      <div className="dot-grid absolute inset-0 opacity-20" />
                      <div className="absolute -left-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-xl" />
                      <span className="absolute left-5 top-5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold text-blue-50">
                        از اینجا شروع کنید
                      </span>
                    </>
                  ) : (
                    <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-blue-100/0 blur-2xl transition-colors group-hover:bg-blue-100/50" />
                  )}
                  <span
                    className={`relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 group-hover:shadow-lg ${
                      featured
                        ? 'bg-white/15 text-white ring-1 ring-white/25'
                        : `group-hover:text-white ${toneClasses[feature.tone as keyof typeof toneClasses]}`
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className={`relative mt-5 font-extrabold ${featured ? 'text-2xl text-white' : 'text-lg text-slate-900'}`}>
                    {feature.title}
                  </h3>
                  <p
                    className={`relative mt-2 max-w-xl text-sm leading-7 ${
                      featured ? 'text-blue-50/85 sm:text-base sm:leading-8' : 'text-slate-500'
                    }`}
                  >
                    {feature.description}
                  </p>
                </article>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
