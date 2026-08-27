import { CalendarCheck, MessageCircle, Sparkles, Stethoscope, TestTube } from 'lucide-react'

const items = [
  { icon: Sparkles, label: 'ثبت و جمع‌بندی علائم' },
  { icon: Stethoscope, label: 'یافتن پزشک مرتبط' },
  { icon: CalendarCheck, label: 'رزرو نوبت' },
  { icon: MessageCircle, label: 'گفت‌وگوی آنلاین' },
  { icon: TestTube, label: 'خدمات سلامت' },
]

function RibbonItems({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div key={item.label} className="flex shrink-0 items-center">
            <span className="flex items-center gap-2.5 px-6 text-sm font-bold text-blue-950 sm:px-8">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Icon className="h-4 w-4" />
              </span>
              {item.label}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-300" aria-hidden="true" />
          </div>
        )
      })}
    </div>
  )
}

export function JourneyRibbon() {
  return (
    <section className="mt-14 overflow-hidden border-y border-blue-100 bg-gradient-to-l from-blue-50 via-white to-indigo-50 py-4 sm:mt-20">
      <div className="ribbon-track flex w-max">
        <RibbonItems />
        <RibbonItems hidden />
      </div>
    </section>
  )
}
