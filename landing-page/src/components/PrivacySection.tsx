import { AlertCircle, Eye, HeartHandshake, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Reveal } from './Reveal'

const principles = [
  {
    icon: Eye,
    title: 'نتیجه، تشخیص پزشکی نیست',
    description: 'جمع‌بندی مدیرا باید در کنار معاینه و نظر پزشک دیده شود.',
  },
  {
    icon: LockKeyhole,
    title: 'توجه به حساسیت اطلاعات',
    description: 'هنگام ثبت متن آزاد، تنها اطلاعات لازم و مرتبط با موضوع را وارد کنید.',
  },
  {
    icon: HeartHandshake,
    title: 'تصمیم‌گیری انسان‌محور',
    description: 'مدیرا برای کمک به فهم بهتر طراحی شده؛ تصمیم درمانی بر عهده پزشک و بیمار است.',
  },
]

export function PrivacySection() {
  return (
    <section id="trust" className="section-space bg-[#F7FAFC]">
      <div className="container-shell">
        <Reveal className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(30,101,137,0.3)] sm:p-10 lg:p-14">
          <div className="dot-grid absolute inset-0 opacity-35 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <div>
              <span className="section-label">
                <ShieldCheck className="h-3.5 w-3.5" />
                اعتماد و مسئولیت
              </span>
              <h2 className="mt-5 text-3xl font-extrabold leading-tight text-blue-950 sm:text-4xl">
                حرف سلامت که می‌شود، مرزها باید روشن باشند
              </h2>
              <p className="mt-4 text-sm leading-8 text-slate-600">
                مدیرا کمک می‌کند علائم‌تان را بهتر جمع‌بندی کنید، اما تشخیص و تصمیم درمانی فقط با پزشک
                است.
              </p>
            </div>

            <div className="grid gap-3">
              {principles.map((principle) => {
                const Icon = principle.icon
                return (
                  <article
                    key={principle.title}
                    className="flex gap-4 rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800">{principle.title}</h3>
                      <p className="mt-1 text-xs leading-6 text-slate-500">{principle.description}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>

          <div className="relative mt-9 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 sm:p-5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-xs leading-6 sm:text-sm sm:leading-7">
              <strong>یادآوری پزشکی:</strong> مدیرا جایگزین تشخیص، معاینه یا مشاوره پزشک نیست. اگر
              وضعیت‌تان فوری یا نگران‌کننده است، منتظر پاسخ سامانه نمانید و از خدمات فوریت‌های پزشکی
              کمک بگیرید.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
