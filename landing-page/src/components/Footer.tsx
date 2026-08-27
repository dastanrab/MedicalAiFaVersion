import { ArrowUp, HeartPulse } from 'lucide-react'
import { navItems } from '../data/content'
import { BrandLogo } from './BrandLogo'

export function Footer() {
  return (
    <footer className="bg-blue-950 text-white">
      <div className="container-shell py-12">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-md">
            <BrandLogo inverted />
            <p className="mt-5 text-sm leading-7 text-blue-100/70">
              در مدیرا علائم‌تان را ثبت می‌کنید، پزشک مرتبط را پیدا می‌کنید و به خدمات درمانی دسترسی
              دارید.
            </p>
            <p className="mt-3 flex items-center gap-2 text-xs text-blue-200/60">
              <HeartPulse className="h-4 w-4" />
              شرح حال بهتر، گفت‌وگوی بهتر با پزشک
            </p>
          </div>

          <div>
            <h2 className="text-sm font-extrabold text-white">دسترسی سریع</h2>
            <nav className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3" aria-label="پیوندهای پایین صفحه">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="focus-ring rounded-md text-sm text-blue-100/65 transition-colors hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-6 text-center text-xs text-blue-100/50 sm:flex-row sm:text-right">
          <p>© {new Date().getFullYear().toLocaleString('fa-IR', { useGrouping: false })} مدیرا AI — تمامی حقوق محفوظ است.</p>
          <a
            href="#intro"
            className="focus-ring inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-blue-100/70 hover:bg-white/10 hover:text-white"
          >
            بازگشت به بالا
            <ArrowUp className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  )
}
