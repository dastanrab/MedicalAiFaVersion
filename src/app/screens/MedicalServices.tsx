import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ChevronLeft,
  HeartPulse,
  MapPin,
  Pill,
  Star,
  TestTube,
  Stethoscope,
  Building
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppBar } from "../components/AppBar";
import { MedicalServicesSkeleton } from "../components/PageSkeleton";
import { useAuthStore } from "../store/authStore";
import {
  ProviderDetailsDialog,
  type ProviderDetails,
} from '../components/ProviderDetailsDialog';

const DEFAULT_PROVIDER_LOGO = "/logo.svg";

type ListedProvider = ProviderDetails & {
  city: string;
  meta: string;
  image: string | null;
};

function getProviderImageUrl(provider: Record<string, unknown> | null | undefined): string | null {
  if (!provider) return null;

  const candidates = [
    provider.image,
    provider.image_url,
    provider.logo,
    provider.logo_url,
    provider.avatar,
    provider.photo,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

// فقط ۴ سرویسی که در فرانت پیاده‌سازی شده‌اند
const SUPPORTED_SERVICES_MAP: Record<string, { icon: LucideIcon; gradient: string; path: string }> = {
  laboratory: { icon: TestTube, gradient: 'from-sky-500 to-blue-600', path: '/services/labs' },
  pharmacy: { icon: Pill, gradient: 'from-emerald-500 to-teal-600', path: '/services/pharmacy' },
  clinic: { icon: Stethoscope, gradient: 'from-violet-500 to-indigo-600', path: '/services/nurse-home' },
  imaging_center: { icon: Building, gradient: 'from-rose-500 to-pink-600', path: '/services/labs' },
};

export function MedicalServices() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const [activeServices, setActiveServices] = useState<any[]>([]);
  const [details, setDetails] = useState<ProviderDetails | null>(null);
  const [detailsType, setDetailsType] = useState<'lab' | 'pharmacy' | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const [labsList, setLabsList] = useState<ListedProvider[]>([]);
  const [pharmaciesList, setPharmaciesList] = useState<ListedProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // دریافت لیست سرویس‌های فعال و مراکز
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };

        const [servicesRes, providersRes] = await Promise.all([
          fetch('https://api.mediraai.com/api/user/services', { headers }),
          fetch('https://api.mediraai.com/api/user/providers', { headers }),
        ]);

        const servicesJson = await servicesRes.json();
        if (servicesJson.status === 'success') {
          setActiveServices(servicesJson.data);
        }

        const providersJson = await providersRes.json();

        if (providersJson.status === 'success') {
          const mapToProvider = (p: any, type: 'lab' | 'pharmacy'): ListedProvider => ({
            id: p.provider_id,
            name: p.name || 'بدون نام',
            city: p.city || 'نامشخص',
            meta: type === 'lab' ? 'آزمایشگاه' : 'داروخانه',
            address: p.address || 'آدرس ثبت نشده',
            rating: Number(p.rating) || 5.0,
            reviews: 0,
            hours: 'نامشخص',
            phone: 'ثبت نشده',
            lat: 35.6892,
            lng: 51.3890,
            description: '',
            services: [],
            recentReviews: [],
            image: getProviderImageUrl(p),
          });

          setLabsList((providersJson.data.labs || []).map((l: any) => mapToProvider(l, 'lab')));
          setPharmaciesList((providersJson.data.pharmacies || []).map((ph: any) => mapToProvider(ph, 'pharmacy')));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [accessToken]);

  const fetchAndOpenDetails = async (providerId: string | number, type: 'lab' | 'pharmacy') => {
    setDetails(null);
    setDetailsType(type);
    setIsDetailsLoading(true);
    try {
      const response = await fetch(`https://api.mediraai.com/api/user/providers/${type}/${providerId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const json = await response.json();

      if (json.status === 'success') {
        const { provider, reviews, services } = json.data;

        const mappedDetails: ProviderDetails = {
          id: provider.provider_id,
          name: provider.name || 'بدون نام',
          city: provider.city || 'نامشخص',
          meta: type === 'lab' ? 'آزمایشگاه' : 'داروخانه',
          address: provider.address || 'آدرس ثبت نشده',
          rating: Number.isFinite(Number(provider.rating)) ? Number(provider.rating) : 5.0,
          reviews: reviews?.length || 0,
          hours: provider.hours || 'ساعت کاری نامشخص',
          phone: provider.phone || 'ثبت نشده',
          lat: Number.isFinite(Number(provider.lat)) ? Number(provider.lat) : 35.6892,
          lng: Number.isFinite(Number(provider.lng)) ? Number(provider.lng) : 51.3890,
          description: provider.description || 'توضیحات تکمیلی برای این مرکز هنوز ثبت نشده است.',
          services: services || [],
          recentReviews: (reviews || []).map((r: any) => ({
            author: r.author || 'کاربر سایت',
            date: r.date ? new Date(r.date).toLocaleDateString('fa-IR') : 'نامشخص',
            rating: Number(r.rating) || 5,
            text: r.text || r.comment || 'بدون متن',
          }))
        };

        setDetailsType(type);
        setDetails(mappedDetails);
      }
    } catch (error) {
      console.error('Error fetching provider details:', error);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const isServiceActive = (key: string) => activeServices.some(s => s.service_key === key);

  if (!isLoading && activeServices.length === 0) {
    return (
        <div className="h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white pb-24 text-right font-[YekanBakhFaNum]" dir="rtl">
          <AppBar backTo="/home" />
          <div className="flex flex-col items-center justify-center px-6 pt-32 text-center">
            <HeartPulse className="mb-4 h-12 w-12 text-slate-300" />
            <p className="text-gray-600">در حال حاضر هیچ خدمتی فعال نیست.</p>
          </div>
        </div>
    );
  }

  if (isLoading) {
    return (
        <div className="relative h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white pb-24 text-right font-[YekanBakhFaNum]" dir="rtl">
          <AppBar backTo="/home" />
          <MedicalServicesSkeleton />
        </div>
    );
  }

  return (
      <div className="relative h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white pb-24 text-right font-[YekanBakhFaNum]" dir="rtl">
        <AppBar backTo="/home" />

        <div className="px-4 pb-8 pt-24">
          <ServicesHero />

          <div className="mb-10 grid grid-cols-2 gap-3">
            {activeServices
                .filter((service) => SUPPORTED_SERVICES_MAP[service.service_key])
                .map((service) => {
                  const uiConfig = SUPPORTED_SERVICES_MAP[service.service_key];
                  const Icon = uiConfig.icon;

                  return (
                      <button
                          key={service.service_key}
                          type="button"
                          onClick={() => navigate(uiConfig.path)}
                          className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${uiConfig.gradient} p-4 text-right shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_10px_32px_rgba(0,0,0,0.16)] active:scale-[0.98]`}
                      >
                        <div className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
                        <div className="pointer-events-none absolute -bottom-4 -right-4 h-14 w-14 rounded-full bg-white/10" />
                        <div className="relative z-10">
                          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <p className="text-sm font-bold text-white">{service.name}</p>
                          <p className="mt-0.5 text-[11px] text-white/80 line-clamp-1">{service.description}</p>
                          <div className="mt-3 flex items-center gap-0.5 text-[11px] font-medium text-white/90">
                            <span>ورود</span>
                            <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                          </div>
                        </div>
                      </button>
                  );
                })}
          </div>

          {isServiceActive('laboratory') && (
              <>
                <SectionHeader title="آزمایشگاه‌های برتر" onViewAll={() => navigate('/services/labs')} />
                <HorizontalScroll>
                  {labsList.map((lab, idx) => (
                      <ProviderCard
                          key={lab.id || `lab-${idx}`}
                          name={lab.name}
                          city={lab.city}
                          rating={lab.rating}
                          meta={lab.meta}
                          image={lab.image}
                          iconBg="bg-sky-50"
                          accent="text-sky-600"
                          onClick={() => fetchAndOpenDetails(lab.id, 'lab')}
                      />
                  ))}
                </HorizontalScroll>
              </>
          )}

          {isServiceActive('pharmacy') && (
              <>
                <SectionHeader
                    title="داروخانه‌های نزدیک"
                    className="mt-10"
                    onViewAll={() => navigate('/services/pharmacy')}
                />
                <HorizontalScroll>
                  {pharmaciesList.map((pharmacy, idx) => (
                      <ProviderCard
                          key={pharmacy.id || `pharmacy-${idx}`}
                          name={pharmacy.name}
                          city={pharmacy.city}
                          rating={pharmacy.rating}
                          meta={pharmacy.meta}
                          image={pharmacy.image}
                          iconBg="bg-emerald-50"
                          accent="text-emerald-600"
                          onClick={() => fetchAndOpenDetails(pharmacy.id, 'pharmacy')}
                      />
                  ))}
                </HorizontalScroll>
              </>
          )}
        </div>

        <ProviderDetailsDialog
            key={details?.id ?? detailsType ?? 'provider-details'}
            open={isDetailsLoading || details !== null}
            loading={isDetailsLoading && details === null}
            onOpenChange={(open) => {
              if (!open) {
                setDetails(null);
                setDetailsType(null);
                setIsDetailsLoading(false);
              }
            }}
            details={details}
            accent={detailsType === 'pharmacy' ? 'emerald' : 'sky'}
            infoTitle={detailsType === 'pharmacy' ? 'اطلاعات داروخانه' : 'اطلاعات آزمایشگاه'}
            servicesTitle={detailsType === 'pharmacy' ? 'لیست داروها' : 'خدمات آزمایشی'}
            servicesIcon={detailsType === 'pharmacy' ? Pill : TestTube}
        />
      </div>
  );
}

function ServicesHero() {
  return (
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800">خدمات درمانی و پزشکی</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          دسترسی سریع به مراکز درمانی، آزمایشگاه‌ها و داروخانه‌های معتبر با امکان ثبت درخواست آنلاین.
        </p>
      </div>
  );
}

function SectionHeader({ title, onViewAll, className = "" }: { title: string; onViewAll: () => void; className?: string }) {
  return (
      <div className={`mb-4 flex items-center justify-between ${className}`}>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <button onClick={onViewAll} className="flex items-center gap-1 text-xs font-semibold text-blue-600">
          مشاهده همه
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
      </div>
  );
}

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  return (
      <div className="relative -mx-4">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 scrollbar-hide">
          {children}
        </div>
      </div>
  );
}

function ProviderCard({
                        name,
                        city,
                        rating,
                        meta,
                        image,
                        iconBg,
                        accent,
                        onClick
                      }: {
  name: string;
  city: string;
  rating: number;
  meta: string;
  image?: string | null;
  iconBg: string;
  accent: string;
  onClick: () => void;
}) {
  const [src, setSrc] = useState(image || DEFAULT_PROVIDER_LOGO);
  const isFallback = !image || src === DEFAULT_PROVIDER_LOGO;

  useEffect(() => {
    setSrc(image || DEFAULT_PROVIDER_LOGO);
  }, [image]);

  return (
      <button
          onClick={onClick}
          className="w-[260px] flex-none snap-center rounded-2xl border border-slate-100 bg-white p-4 text-right shadow-sm transition-all active:scale-[0.98]"
      >
        <div className="flex items-start justify-between">
          <div
              className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl ${
                isFallback ? iconBg : "bg-slate-50 ring-1 ring-slate-100"
              }`}
          >
            <img
                src={src}
                alt={name}
                className={isFallback ? "h-8 w-8 object-contain" : "h-full w-full object-cover"}
                onError={() => {
                  if (src !== DEFAULT_PROVIDER_LOGO) {
                    setSrc(DEFAULT_PROVIDER_LOGO);
                  }
                }}
            />
          </div>
          <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-amber-600">
            <Star className="h-3 w-3 fill-amber-500" />
            <span className="text-[11px] font-bold">{rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="mt-4">
          <div className={`text-[10px] font-bold ${accent}`}>{meta}</div>
          <h3 className="mt-1 truncate text-sm font-bold text-slate-800">{name}</h3>
          <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate">{city}</span>
          </div>
        </div>
      </button>
  );
}
