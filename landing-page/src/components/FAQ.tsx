import { ChevronDown, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import { faqItems } from '../data/content'
import { Reveal } from './Reveal'

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="section-space bg-white">
      <div className="container-shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="section-label">
            <HelpCircle className="h-3.5 w-3.5" />
            پرسش‌های پرتکرار
          </span>
          <h2 className="mt-5 text-3xl font-extrabold text-blue-950 sm:text-4xl">پیش از شروع، پاسخ‌ها را ببینید</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">پاسخ کوتاه به مهم‌ترین سؤال‌ها درباره مدیرا AI.</p>
        </Reveal>

        <Reveal className="mx-auto mt-10 max-w-3xl space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index
            const panelId = `faq-panel-${index}`
            return (
              <article
                key={item.question}
                className={`overflow-hidden rounded-2xl border bg-white transition-all ${
                  isOpen
                    ? 'border-blue-200 shadow-[0_12px_30px_-20px_rgba(33,150,205,0.35)]'
                    : 'border-slate-100 shadow-sm hover:border-blue-100'
                }`}
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="focus-ring flex w-full items-center gap-4 rounded-2xl p-4 text-right sm:p-5"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
                        isOpen ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      <HelpCircle className="h-4 w-4" />
                    </span>
                    <span className={`flex-1 text-sm font-extrabold sm:text-base ${isOpen ? 'text-blue-800' : 'text-slate-800'}`}>
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-slate-100 px-5 py-4 pr-[4.25rem] text-sm leading-7 text-slate-600">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
