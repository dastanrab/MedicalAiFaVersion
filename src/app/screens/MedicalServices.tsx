import { useNavigate } from 'react-router';
import {
  ChevronLeft,
  MapPin,
  Star,
  HeartPulse,
  ArrowLeft,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AppBar } from '../components/AppBar';
import { Card } from '../components/ui/card';
import { servicesCatalog } from '../config/servicesCatalog';
import { useSettingsStore } from '../admin/store/settingsStore';
import type { ServiceModuleId } from '../admin/config/settingsOptions';

const topLabs = [
  { name: 'آزمایشگاه پاتوبیولوژی سینا', city: 'مشهد', rating: 4.9, reviews: '۲۴۰ نظر' },
  { name: 'آزمایشگاه تخصصی نیکان', city: 'تهران', rating: 4.8, reviews: '۱۸۵ نظر' },
  { name: 'آزمایشگاه رازی', city: 'اصفهان', rating: 4.7, reviews: '۱۵۶ نظر' },
];

const pharmacies = [
  { name: 'داروخانه شبانه‌روزی مرکزی', city: 'مشهد', rating: 4.8, open: '۲۴ ساعته' },
  { name: 'داروخانه دکتر عبیدی', city: 'تهران', rating: 4.9, open: '۸ تا ۲۲' },
  { name: 'داروخانه بزرگ اصفهان', city: 'اصفهان', rating: 4.6, open: '۸ تا ۲۱' },
];

export function MedicalServices() {
  const navigate = useNavigate();
  const enabledServices = useSettingsStore((s) => s.services);
  const services = servicesCatalog.filter((s) => enabledServices[s.id as ServiceModuleId]);

  if (services.length === 0) {
    return (
      <div className="h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white pb-24 text-right font-[YekanBakhFaNum]" dir="rtl">
        <AppBar />
        <div className="flex flex-col items-center justify-center px-6 pt-32 text-center">
          <HeartPulse className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-gray-600">در حال حاضر هیچ خدمتی فعال نیست.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white pb-24 text-right font-[YekanBakhFaNum]" dir="rtl">
      <AppBar />

      <div className="px-4 pb-8 pt-24">
        <ServicesHero />

        <div className="mb-10 grid grid-cols-2 gap-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.title}
                type="button"
                onClick={() => navigate(service.path)}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${service.gradient} p-4 text-right shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_10px_32px_rgba(0,0,0,0.16)] active:scale-[0.98]`}
              >
                <div className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-4 -right-4 h-14 w-14 rounded-full bg-white/10" />
                <div className="relative z-10">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-white">{service.title}</p>
                  <p className="mt-0.5 text-[11px] text-white/80">{service.desc}</p>
                  <div className="mt-3 flex items-center gap-0.5 text-[11px] font-medium text-white/90">
                    <span>ورود</span>
                    <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {enabledServices.labs && (
          <>
            <SectionHeader title="آزمایشگاه‌های برتر" onViewAll={() => navigate('/services/labs')} />
            <HorizontalScroll>
              {topLabs.map((lab) => (
                <ProviderCard
                  key={lab.name}
                  name={lab.name}
                  city={lab.city}
                  rating={lab.rating}
                  meta={lab.reviews}
                  icon={servicesCatalog[0].icon}
                  iconBg="bg-sky-50 text-sky-600"
                  accent="text-sky-600"
                  onClick={() => navigate('/services/labs')}
                />
              ))}
            </HorizontalScroll>
          </>
        )}

        {enabledServices.pharmacy && (
          <>
            <SectionHeader
              title="داروخانه‌های نزدیک"
              className="mt-10"
              onViewAll={() => navigate('/services/pharmacy')}
            />
            <HorizontalScroll>
              {pharmacies.map((pharmacy) => (
                <ProviderCard
                  key={pharmacy.name}
                  name={pharmacy.name}
                  city={pharmacy.city}
                  rating={pharmacy.rating}
                  meta={pharmacy.open}
                  icon={servicesCatalog[1].icon}
                  iconBg="bg-emerald-50 text-emerald-600"
                  accent="text-emerald-600"
                  onClick={() => navigate('/services/pharmacy')}
                />
              ))}
            </HorizontalScroll>
          </>
        )}
      </div>
    </div>
  );
}

function ServicesHero() {
  return (
    <div className="relative mb-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-5 py-5 shadow-[0_8px_32px_rgba(37,99,235,0.28)]">
        <div className="pointer-events-none absolute -top-10 -left-10 h-36 w-36 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-white/10" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
            <HeartPulse className="h-7 w-7 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold leading-tight text-white">خدمات درمانی</h1>
            <p className="mt-0.5 text-sm leading-snug text-blue-100">
              دسترسی سریع به آزمایشگاه، داروخانه و مراقبت در منزل
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  className = '',
  onViewAll,
}: {
  title: string;
  className?: string;
  onViewAll?: () => void;
}) {
  return (
    <div className={`mb-4 flex items-center justify-between ${className}`}>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-0.5 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          همه
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="-me-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {children}
      <div className="w-4 shrink-0 snap-none" aria-hidden />
    </div>
  );
}

function ProviderCard({
  name,
  city,
  rating,
  meta,
  icon: Icon,
  iconBg,
  accent,
  onClick,
}: {
  name: string;
  city: string;
  rating: number;
  meta: string;
  icon: LucideIcon;
  iconBg: string;
  accent: string;
  onClick: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      className="min-w-[230px] shrink-0 snap-start cursor-pointer rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)] active:scale-[0.99]"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-[11px] font-bold text-amber-700">{rating}</span>
        </div>
      </div>

      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900">{name}</h3>

      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
        <MapPin className="h-3 w-3 shrink-0" />
        <span>{city}</span>
        <span className="text-gray-300">·</span>
        <span>{meta}</span>
      </div>

      <span className={`mt-3 flex items-center gap-1 text-xs font-semibold ${accent}`}>
        مشاهده
        <ArrowLeft className="h-3 w-3" />
      </span>
    </Card>
  );
}
