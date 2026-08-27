import {
  Activity,
  BrainCircuit,
  CalendarCheck,
  HeartHandshake,
  Languages,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TestTube,
  UserRoundSearch,
} from 'lucide-react'

export const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL ?? 'http://localhost:5174'
export const APP_URL = import.meta.env.VITE_APP_URL ?? `${APP_BASE_URL}/login`

export const navItems = [
  { label: 'معرفی', href: '#intro' },
  { label: 'امکانات', href: '#features' },
  { label: 'نحوه کار', href: '#ai' },
  { label: 'اعتماد و مسئولیت', href: '#trust' },
  { label: 'سوالات متداول', href: '#faq' },
]

export const trustItems = [
  {
    icon: BrainCircuit,
    title: 'شرح علائم، با جزئیات بیشتر',
    description: 'چند سؤال کوتاه کمک می‌کند چیزی از قلم نیفتد',
  },
  {
    icon: HeartHandshake,
    title: 'برای قبل از مراجعه',
    description: 'کمکی برای آماده‌تر شدن؛ نه جایگزین نظر پزشک',
  },
  {
    icon: Languages,
    title: 'با زبان خودتان',
    description: 'علائم را همان‌طور که حس می‌کنید بنویسید',
  },
  {
    icon: ShieldCheck,
    title: 'مرزها مشخص‌اند',
    description: 'هرجا پای تشخیص در میان است، پزشک تصمیم می‌گیرد',
  },
]

export const features = [
  {
    icon: Sparkles,
    title: 'علائم‌تان را بنویسید',
    description:
      'از میان علائم انتخاب کنید یا هرچه حس می‌کنید با کلمات خودتان بنویسید.',
    tone: 'blue',
  },
  {
    icon: BrainCircuit,
    title: 'چند سؤال کوتاه بعدی',
    description:
      'اگر نکته‌ای مبهم باشد، مدیرا درباره زمان شروع، شدت یا نشانه‌های همراه می‌پرسد.',
    tone: 'indigo',
  },
  {
    icon: UserRoundSearch,
    title: 'تخصص مرتبط را پیدا کنید',
    description:
      'در پایان می‌توانید تخصص مرتبط و پزشکان موجود در سامانه را ببینید.',
    tone: 'emerald',
  },
  {
    icon: CalendarCheck,
    title: 'پزشک‌تان را انتخاب کنید',
    description:
      'پروفایل پزشکان را ببینید و برای زمان مناسب، نوبت بگیرید.',
    tone: 'cyan',
  },
  {
    icon: TestTube,
    title: 'خدمات درمانی، کنار هم',
    description:
      'آزمایشگاه، داروخانه، تصویربرداری و مراقبت در منزل از یک بخش در دسترس‌اند.',
    tone: 'violet',
  },
  {
    icon: MessagesSquare,
    title: 'گفت‌وگو را ادامه دهید',
    description:
      'پس از رزرو، در صورت فعال بودن مشاوره آنلاین، ارتباط با پزشک را در مدیرا ادامه دهید.',
    tone: 'rose',
  },
]

export const steps = [
  {
    number: '۱',
    title: 'بگویید چه حسی دارید',
    description: 'علائم را انتخاب کنید یا با کلمات خودتان بنویسید.',
  },
  {
    number: '۲',
    title: 'به چند سؤال جواب دهید',
    description: 'زمان شروع، شدت علائم و نشانه‌های همراه مشخص می‌شوند.',
  },
  {
    number: '۳',
    title: 'جمع‌بندی را ببینید',
    description: 'آنچه نوشته‌اید مرتب می‌شود و تخصص مرتبط نمایش داده می‌شود.',
  },
  {
    number: '۴',
    title: 'برای قدم بعدی آماده شوید',
    description: 'پزشک یا خدمت موردنیازتان را بررسی کنید و ادامه دهید.',
  },
]

export const faqItems = [
  {
    question: 'مدیرا AI برای چه کسانی مناسب است؟',
    answer:
      'برای کسانی که می‌خواهند پیش از مراجعه، علائم‌شان را بهتر جمع‌بندی کنند و پزشک یا خدمت موردنیازشان را راحت‌تر پیدا کنند.',
  },
  {
    question: 'آیا مدیرا AI جایگزین پزشک است؟',
    answer:
      'خیر. این سامانه برای ارائه اطلاعات و کمک به درک بهتر موضوعات سلامت طراحی شده و جایگزین تشخیص، معاینه یا مشاوره پزشک نیست.',
  },
  {
    question: 'هوش مصنوعی چگونه در سامانه استفاده می‌شود؟',
    answer:
      'مدیرا از هوش مصنوعی برای بررسی توضیحات شما، پرسیدن سؤال‌های مرتبط و پیشنهاد تخصص مناسب استفاده می‌کند. نتیجه، تشخیص پزشکی نیست.',
  },
  {
    question: 'آیا باید اطلاعات زیادی وارد کنم؟',
    answer:
      'برای استفاده بهتر، فقط اطلاعات مرتبط با سؤال یا علائم خود را وارد کنید. از ثبت اطلاعات غیرضروری و هویتی در متن آزاد خودداری کنید.',
  },
  {
    question: 'چگونه می‌توانم از سامانه استفاده کنم؟',
    answer:
      'با انتخاب «ورود به سامانه»، وارد فرایند ورود می‌شوید و پس از تکمیل حساب کاربری به امکانات موجود دسترسی خواهید داشت.',
  },
]

export const showcaseTabs = [
  { id: 'symptoms', label: 'ثبت علائم', icon: Activity },
  { id: 'assistant', label: 'گفت‌وگو با مدیرا', icon: Stethoscope },
  { id: 'services', label: 'خدمات سلامت', icon: TestTube },
] as const

export type ShowcaseTab = (typeof showcaseTabs)[number]['id']
