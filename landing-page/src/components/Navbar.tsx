import {
  ArrowLeft,
  Building2,
  HeartHandshake,
  Menu,
  Pill,
  Stethoscope,
  TestTube2,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { APP_BASE_URL, APP_URL, navItems } from '../data/content'
import { BrandLogo } from './BrandLogo'

const providers = [
  {
    title: 'پنل پزشکان',
    description: 'نوبت‌ها، بیماران و مشاوره‌ها',
    href: `${APP_BASE_URL}/provider/doctor/login`,
    icon: Stethoscope,
    tone: 'bg-blue-50 text-blue-700 group-hover:bg-blue-600',
  },
  {
    title: 'پنل آزمایشگاه',
    description: 'درخواست‌ها، نمونه‌گیری و نتایج',
    href: `${APP_BASE_URL}/provider/lab/login`,
    icon: TestTube2,
    tone: 'bg-cyan-50 text-cyan-700 group-hover:bg-cyan-600',
  },
  {
    title: 'پنل داروخانه',
    description: 'نسخه‌ها، موجودی و ارسال',
    href: `${APP_BASE_URL}/provider/pharmacy/login`,
    icon: Pill,
    tone: 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600',
  },
  {
    title: 'پنل خدمات پرستاری',
    description: 'درخواست‌ها، برنامه کاری و پوشش',
    href: `${APP_BASE_URL}/provider/nurse/login`,
    icon: HeartHandshake,
    tone: 'bg-rose-50 text-rose-700 group-hover:bg-rose-600',
  },
]

function ProviderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) closeButtonRef.current?.focus()
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-950/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="provider-modal-title"
        className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_30px_90px_-30px_rgba(20,57,78,0.65)]"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-700 to-blue-500 px-6 pb-8 pt-6 text-white sm:px-8">
          <div className="dot-grid absolute inset-0 opacity-20" />
          <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                <Building2 className="h-6 w-6" />
              </span>
              <div>
                <h2 id="provider-modal-title" className="text-xl font-extrabold">
                  ورود به پنل پذیرندگان
                </h2>
                <p className="mt-1 text-xs leading-6 text-blue-100">نوع پنل خود را انتخاب کنید.</p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="بستن پنجره"
              className="focus-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-7">
          {providers.map((provider) => {
            const Icon = provider.icon
            return (
              <a
                key={provider.href}
                href={provider.href}
                className="focus-ring group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_6px_24px_-18px_rgba(15,23,42,0.3)] transition-all hover:-translate-y-1 hover:border-blue-100 hover:shadow-[0_16px_36px_-20px_rgba(30,101,137,0.4)]"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all group-hover:text-white ${provider.tone}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-extrabold text-slate-800">{provider.title}</span>
                  <span className="mt-1 block text-[11px] leading-5 text-slate-500">{provider.description}</span>
                </span>
                <ArrowLeft className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:-translate-x-1 group-hover:text-blue-600" />
              </a>
            )
          })}
        </div>

        <p className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center text-[11px] leading-5 text-slate-500">
          این بخش مخصوص پزشکان و مجموعه‌های ارائه‌دهنده خدمات در مدیرا است.
        </p>
      </div>
    </div>,
    document.body,
  )
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [providerModalOpen, setProviderModalOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = isOpen || providerModalOpen ? 'hidden' : ''

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setProviderModalOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, providerModalOpen])

  const openProviderModal = () => {
    setIsOpen(false)
    setProviderModalOpen(true)
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <nav className="container-shell flex h-[76px] items-center justify-between" aria-label="ناوبری اصلی">
          <BrandLogo compact />

          <div className="hidden items-center gap-0.5 xl:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="focus-ring rounded-lg px-2.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={openProviderModal}
              className="focus-ring flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100"
            >
              <Building2 className="h-4 w-4" />
              ورود پنل پذیرندگان
            </button>
            <a
              href={APP_URL}
              className="focus-ring flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(33,150,205,0.65)] transition-all hover:-translate-y-0.5 hover:bg-blue-700"
            >
              <UserRound className="h-4 w-4" />
              ورود کاربر
            </a>
          </div>

          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'بستن منو' : 'باز کردن منو'}
            onClick={() => setIsOpen((value) => !value)}
            className="focus-ring flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        <div
          id="mobile-menu"
          className={`fixed inset-x-0 top-[76px] z-50 h-[calc(100dvh-76px)] bg-slate-950/25 transition-opacity md:hidden ${
            isOpen ? 'visible opacity-100' : 'invisible opacity-0'
          }`}
          onClick={() => setIsOpen(false)}
        >
          <div
            className={`rounded-b-3xl bg-white p-5 shadow-2xl transition-transform duration-300 ${
              isOpen ? 'translate-y-0' : '-translate-y-4'
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="focus-ring block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div className="mt-4 grid gap-2">
              <a
                href={APP_URL}
                className="focus-ring flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"
              >
                <UserRound className="h-4 w-4" />
                ورود کاربر
              </a>
              <button
                type="button"
                onClick={openProviderModal}
                className="focus-ring flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700"
              >
                <Building2 className="h-4 w-4" />
                ورود پنل پذیرندگان
              </button>
            </div>
          </div>
        </div>
      </header>

      <ProviderModal open={providerModalOpen} onClose={() => setProviderModalOpen(false)} />
    </>
  )
}
