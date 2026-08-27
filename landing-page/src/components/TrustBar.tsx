import { trustItems } from '../data/content'
import { Reveal } from './Reveal'

export function TrustBar() {
  return (
    <section aria-label="مزیت‌های کلیدی" className="relative z-10 -mt-8">
      <div className="container-shell">
        <Reveal className="grid overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.28)] sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className={`flex gap-3 p-5 sm:p-6 ${
                  index > 0 ? 'border-t border-slate-100 sm:border-t-0 sm:border-r' : ''
                } ${index === 2 ? 'sm:border-r-0 lg:border-r' : ''}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-800">{item.title}</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                </div>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
