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
  Building,
  Home,
  UserCheck, Sparkles
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppBar } from "../components/AppBar";
import { MedicalServicesSkeleton } from "../components/PageSkeleton";
import { useAuthStore } from "../store/authStore";
import {
  ProviderDetailsDialog,
  type ProviderDetails,
} from '../components/ProviderDetailsDialog';

type ListedProvider = ProviderDetails & {
  city: string;
  meta: string;
  image: string | null;
  image_url?: string | null;
  home_acceptance?: boolean;
  in_person_acceptance?: boolean;
};

// دریافت دقیق‌ترین URL عکس با اولویت image_url از سرور
function getProviderImageUrl(provider: Record<string, unknown> | null | undefined): string | null {
  if (!provider) return null;

  const candidates = [
    provider.image_url,
    provider.image,
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

// پارس مطمئن مختصات جغرافیایی
function parseCoordinate(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

const SUPPORTED_SERVICES_MAP: Record<string, { icon: LucideIcon; gradient: string; path: string }> = {
  laboratory: { icon: TestTube, gradient: 'from-sky-500 to-blue-600', path: '/services/labs' },
  pharmacy: { icon: Pill, gradient: 'from-emerald-500 to-teal-600', path: '/services/pharmacy' },
  clinic: { icon: Stethoscope, gradient: 'from-violet-500 to-indigo-600', path: '/services/nurse-home' },
  tooth: { icon: Sparkles, gradient: 'from-rose-500 to-pink-600', path: '/doctors?specialty=دندان%20پزشکی' },
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
          const mapToProvider = (p: any, type: 'lab' | 'pharmacy'): ListedProvider => {
            const resolvedImg = getProviderImageUrl(p);
            return {
              id: p.provider_id,
              name: p.name || 'بدون نام',
              city: p.city || 'نامشخص',
              meta: type === 'lab' ? 'آزمایشگاه' : 'داروخانه',
              address: p.address || 'آدرس ثبت نشده',
              rating: Number(p.rating) || 5.0,
              reviews: 0,
              hours: 'نامشخص',
              phone: 'ثبت نشده',
              // استفاده از lat و lng دیتابیس بدون هاردکد
              lat: parseCoordinate(p.lat),
              lng: parseCoordinate(p.lng),
              description: '',
              services: [],
              recentReviews: [],
              image: resolvedImg,
              image_url: resolvedImg,
              home_acceptance: Boolean(p.home_acceptance),
              in_person_acceptance: Boolean(p.in_person_acceptance),
            };
          };

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
        const resolvedImg = getProviderImageUrl(provider);

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
          // استفاده از مختصات ارسال شده از سرور
          lat: parseCoordinate(provider.lat),
          lng: parseCoordinate(provider.lng),
          description: provider.description || 'توضیحات تکمیلی برای این مرکز هنوز ثبت نشده است.',
          services: services || [],
          image: resolvedImg,
          image_url: resolvedImg, // تنظیم برای هدر دیالوگ
          home_acceptance: Boolean(provider.home_acceptance),
          in_person_acceptance: Boolean(provider.in_person_acceptance),
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
                          image={lab.image_url || lab.image}
                          homeAcceptance={lab.home_acceptance}
                          inPersonAcceptance={lab.in_person_acceptance}
                          fallbackGradient="from-sky-500 via-blue-600 to-indigo-700"
                          icon={TestTube}
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
                          image={pharmacy.image_url || pharmacy.image}
                          fallbackGradient="from-emerald-500 via-teal-600 to-cyan-700"
                          icon={Pill}
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
                        homeAcceptance,
                        inPersonAcceptance,
                        fallbackGradient,
                        icon: Icon,
                        onClick
                      }: {
  name: string;
  city: string;
  rating: number;
  meta: string;
  image?: string | null;
  homeAcceptance?: boolean;
  inPersonAcceptance?: boolean;
  fallbackGradient: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(image) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [image]);

  return (
      <button
          onClick={onClick}
          className="relative h-[190px] w-[260px] flex-none snap-center overflow-hidden rounded-2xl text-right shadow-md shadow-slate-900/10 transition-all active:scale-[0.98]"
      >
        {/* پس‌زمینه تصویر یا گرادیان */}
        {hasImage ? (
            <img
                src={image!}
                alt={name}
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setImageFailed(true)}
            />
        ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient}`}>
              <Icon className="absolute -left-4 -top-4 h-36 w-36 rotate-12 text-white/15" strokeWidth={1.5} />
            </div>
        )}

        {/* سایه تیره برای خوانایی متون */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

        {/* نشان‌های بالا */}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-800 shadow-sm backdrop-blur-sm">
            <Icon className="h-3 w-3" />
            {meta}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-white backdrop-blur-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-bold">{rating.toLocaleString('fa-IR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
          </span>
        </div>

        {/* اطلاعات پایین: بج‌های پذیرش، نام و شهر */}
        <div className="absolute inset-x-0 bottom-0 p-3.5 space-y-1.5">
          {(homeAcceptance || inPersonAcceptance) && (
              <div className="flex flex-wrap gap-1">
                {homeAcceptance && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/80 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm">
                      <Home className="h-2.5 w-2.5" />
                      منزل
                    </span>
                )}
                {inPersonAcceptance && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/80 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm">
                      <UserCheck className="h-2.5 w-2.5" />
                      حضوری
                    </span>
                )}
              </div>
          )}

          <div>
            <h3 className="line-clamp-1 text-base font-bold leading-6 text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
              {name}
            </h3>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-white/90 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{city}</span>
            </div>
          </div>
        </div>
      </button>
  );
}
