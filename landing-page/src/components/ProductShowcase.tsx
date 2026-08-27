import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  HeartPulse,
  Home,
  Pause,
  Play,
  Stethoscope,
} from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Reveal } from './Reveal'

const slides = [
  {
    id: 'home',
    tab: 'خانه',
    title: 'همه‌چیز از خانه مدیرا شروع می‌شود',
    description:
      'نوبت‌ها، خدمات درمانی و ثبت علائم از همین صفحه در دسترس‌اند؛ بدون جست‌وجو میان منوهای مختلف.',
    image: '/screenshots/home.png',
    alt: 'نمای واقعی صفحه خانه اپلیکیشن مدیرا',
    icon: Home,
    accent: 'from-blue-700 to-blue-500',
    points: ['دسترسی سریع به بخش‌های اصلی', 'نمای یک‌جا از فعالیت‌های اخیر'],
  },
  {
    id: 'symptoms',
    tab: 'ثبت علائم',
    title: 'علائم را انتخاب کنید یا خودتان بنویسید',
    description:
      'اگر نام دقیق یک علامت را نمی‌دانید، همان‌طور که حسش می‌کنید توضیح دهید. فرم از همان‌جا ادامه پیدا می‌کند.',
    image: '/screenshots/symptoms.png',
    alt: 'نمای واقعی صفحه ثبت علائم اپلیکیشن مدیرا',
    icon: Activity,
    accent: 'from-cyan-600 to-blue-500',
    points: ['انتخاب از فهرست یا توضیح آزاد', 'امکان برگشت و اصلاح پاسخ‌ها'],
  },
  {
    id: 'services',
    tab: 'خدمات درمانی',
    title: 'خدمات موردنیازتان را یک‌جا ببینید',
    description:
      'از آزمایشگاه و داروخانه تا تصویربرداری و مراقبت در منزل، هر بخش ورودی مشخص خودش را دارد.',
    image: '/screenshots/services.png',
    alt: 'نمای واقعی صفحه خدمات درمانی اپلیکیشن مدیرا',
    icon: HeartPulse,
    accent: 'from-indigo-700 to-violet-500',
    points: ['چهار دسته خدمت در یک صفحه', 'مشاهده مراکز و جزئیات هر خدمت'],
  },
] as const

export function ProductShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [direction, setDirection] = useState(1)
  const pointerStart = useRef<number | null>(null)
  const reduceMotion = useReducedMotion()
  const activeSlide = slides[activeIndex]
  const previousIndex = (activeIndex - 1 + slides.length) % slides.length
  const nextIndex = (activeIndex + 1) % slides.length
  const previousSlide = slides[previousIndex]
  const nextSlide = slides[nextIndex]

  const goTo = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1)
    setActiveIndex(index)
  }

  const goNext = () => {
    setDirection(1)
    setActiveIndex((current) => (current + 1) % slides.length)
  }

  const goPrevious = () => {
    setDirection(-1)
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    if (!isPlaying || reduceMotion) return
    const timer = window.setInterval(goNext, 5500)
    return () => window.clearInterval(timer)
  }, [isPlaying, reduceMotion])

  return (
    <section className="section-space relative overflow-hidden bg-[#F4F8FB]">
      <div className="absolute right-0 top-0 h-[34rem] w-[34rem] rounded-full bg-blue-100/70 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-100/70 blur-3xl" />
      <div className="hairline-grid absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <div className="container-shell relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="section-label">
            <Stethoscope className="h-3.5 w-3.5" />
            تصویر واقعی برنامه
          </span>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight text-blue-950 sm:text-4xl lg:text-5xl">
            قبل از شروع، یک دور در مدیرا بزنید
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            این تصاویر مستقیماً از خود برنامه گرفته شده‌اند. بین بخش‌ها جابه‌جا شوید و ببینید قرار است
            با چه محیطی کار کنید.
          </p>
        </Reveal>

        <Reveal className="mt-10 sm:mt-14" delay={0.08}>
          <div className="overflow-hidden rounded-[2rem] border border-white bg-white/80 shadow-[0_30px_80px_-38px_rgba(20,57,78,0.5)] backdrop-blur-xl">
            <div className="border-b border-slate-100 p-3 sm:p-4">
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100/80 p-1.5">
                {slides.map((slide, index) => {
                  const Icon = slide.icon
                  const active = index === activeIndex
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => goTo(index)}
                      className={`focus-ring relative flex items-center justify-center gap-2 rounded-xl px-2 py-3 text-[11px] font-bold transition-colors sm:text-sm ${
                        active ? 'text-white' : 'text-slate-500 hover:bg-white/70 hover:text-blue-700'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="showcase-tab"
                          className={`absolute inset-0 rounded-xl bg-gradient-to-l ${slide.accent} shadow-lg`}
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <Icon className="relative h-4 w-4" />
                      <span className="relative">{slide.tab}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div
              className="grid min-h-[650px] lg:grid-cols-[0.86fr_1.14fr]"
              onPointerDown={(event) => {
                pointerStart.current = event.clientX
              }}
              onPointerUp={(event) => {
                if (pointerStart.current === null) return
                const distance = event.clientX - pointerStart.current
                if (Math.abs(distance) > 60) {
                  if (distance > 0) goNext()
                  else goPrevious()
                }
                pointerStart.current = null
              }}
            >
              <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeSlide.id}
                    initial={reduceMotion ? false : { opacity: 0, x: direction * -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, x: direction * 24 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${activeSlide.accent} text-white shadow-lg`}
                      >
                        <activeSlide.icon className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                      </span>
                    </div>

                    <h3 className="mt-6 text-2xl font-extrabold leading-[1.5] text-blue-950 sm:text-3xl">
                      {activeSlide.title}
                    </h3>
                    <p className="mt-4 max-w-lg text-sm leading-8 text-slate-600">{activeSlide.description}</p>

                    <ul className="mt-6 space-y-3">
                      {activeSlide.points.map((point) => (
                        <li key={point} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-9 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goPrevious}
                    aria-label="تصویر قبلی"
                    className="focus-ring flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="تصویر بعدی"
                    className="focus-ring flex h-11 w-11 items-center justify-center rounded-xl bg-blue-950 text-white shadow-lg transition-all hover:bg-blue-800"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPlaying((value) => !value)}
                    aria-label={isPlaying ? 'توقف پخش خودکار' : 'ادامه پخش خودکار'}
                    className="focus-ring mr-1 flex h-11 items-center gap-2 rounded-xl px-3 text-xs font-bold text-slate-500 hover:bg-slate-100"
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {isPlaying ? 'توقف' : 'پخش'}
                  </button>
                </div>
              </div>

              <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950 via-blue-800 to-blue-500 px-4 py-10 sm:min-h-[590px] sm:px-8 lg:min-h-[650px]">
                <div className="dot-grid absolute inset-0 opacity-20" />
                <div className="absolute -left-16 top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -right-20 bottom-20 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl" />

                <button
                  type="button"
                  onClick={() => goTo(previousIndex)}
                  aria-label={`نمایش ${previousSlide.tab}`}
                  className="focus-ring group absolute bottom-10 right-[-2rem] z-10 w-[150px] rotate-[7deg] rounded-[1.9rem] border-[5px] border-white/80 bg-slate-900 p-1 opacity-75 shadow-2xl transition-all duration-500 hover:right-1 hover:z-30 hover:rotate-2 hover:opacity-100 sm:right-3 sm:w-[180px] lg:right-5"
                >
                  <div className="overflow-hidden rounded-[1.35rem] bg-white">
                    <img
                      src={previousSlide.image}
                      alt=""
                      aria-hidden="true"
                      className="aspect-[550/900] w-full object-cover object-top"
                    />
                  </div>
                  <span className="absolute -top-3 right-1/2 translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-blue-950/90 px-3 py-1 text-[9px] font-bold text-white shadow-lg backdrop-blur">
                    {previousSlide.tab}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => goTo(nextIndex)}
                  aria-label={`نمایش ${nextSlide.tab}`}
                  className="focus-ring group absolute bottom-10 left-[-2rem] z-10 w-[150px] -rotate-[7deg] rounded-[1.9rem] border-[5px] border-white/80 bg-slate-900 p-1 opacity-75 shadow-2xl transition-all duration-500 hover:left-1 hover:z-30 hover:-rotate-2 hover:opacity-100 sm:left-3 sm:w-[180px] lg:left-5"
                >
                  <div className="overflow-hidden rounded-[1.35rem] bg-white">
                    <img
                      src={nextSlide.image}
                      alt=""
                      aria-hidden="true"
                      className="aspect-[550/900] w-full object-cover object-top"
                    />
                  </div>
                  <span className="absolute -top-3 right-1/2 translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-blue-950/90 px-3 py-1 text-[9px] font-bold text-white shadow-lg backdrop-blur">
                    {nextSlide.tab}
                  </span>
                </button>

                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={activeSlide.image}
                    initial={reduceMotion ? false : { opacity: 0, y: 32, scale: 0.94, rotate: direction * 2 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: 20, scale: 0.96, rotate: direction * -2 }}
                    transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                    className="relative z-20 w-full max-w-[230px] sm:max-w-[270px]"
                  >
                    <div className="rounded-[2.6rem] border-[7px] border-slate-950 bg-slate-950 p-1.5 shadow-[0_38px_80px_-22px_rgba(0,0,0,0.75)]">
                      <div className="relative overflow-hidden rounded-[1.95rem] bg-white">
                        <div className="absolute left-1/2 top-2 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-slate-950" />
                        <img
                          src={activeSlide.image}
                          alt={activeSlide.alt}
                          className="aspect-[550/900] w-full object-cover object-top"
                        />
                      </div>
                    </div>
                    <div className="absolute -bottom-4 right-1/2 flex translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/20 bg-white px-4 py-2 text-[10px] font-extrabold text-blue-950 shadow-xl">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {activeSlide.tab}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="absolute left-5 top-5 z-30 hidden rounded-2xl border border-white/20 bg-white/10 p-3 text-white shadow-xl backdrop-blur-md sm:block">
                  <p className="text-[10px] text-blue-100">اسکرین‌شات واقعی</p>
                  <p className="mt-0.5 text-xs font-bold">سه بخش از اپ مدیرا</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-white px-6 py-4">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`نمایش ${slide.tab}`}
                  className={`focus-ring h-2 rounded-full transition-all ${
                    index === activeIndex ? 'w-9 bg-blue-600' : 'w-2 bg-slate-200 hover:bg-blue-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
