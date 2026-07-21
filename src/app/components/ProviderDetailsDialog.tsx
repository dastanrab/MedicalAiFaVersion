import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Info,
  MapPin,
  MessageCircleMore,
  Smartphone,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { LocationMap, MASHHAD_FALLBACK } from "./LocationMap";

export type ProviderReview = {
  name: string;
  date: string;
  rating: number;
  comment: string;
};

export type ProviderServiceItem = {
  name: string;
  price: number;
};

export type ProviderDetails = {
  name: string;
  address: string;
  description: string;
  hours: string;
  phone: string;
  rating: number;
  reviews: number;
  services: ProviderServiceItem[];
  recentReviews: ProviderReview[];
  lat?: number | null;
  lng?: number | null;
};

type Accent = "emerald" | "sky" | "violet" | "rose";

const accentStyles: Record<
  Accent,
  {
    header: string;
    icon: string;
    dot: string;
    reviewSuccess: string;
    submitButton: string;
    focus: string;
  }
> = {
  emerald: {
    header: "from-emerald-500 to-teal-600",
    icon: "text-emerald-600",
    dot: "bg-emerald-400",
    reviewSuccess: "bg-emerald-50 text-emerald-700",
    submitButton:
      "bg-gradient-to-l from-emerald-500 to-teal-600 shadow-emerald-200 hover:from-emerald-600 hover:to-teal-700",
    focus: "focus:border-emerald-400 focus:ring-emerald-100",
  },
  sky: {
    header: "from-sky-500 to-blue-600",
    icon: "text-blue-600",
    dot: "bg-blue-400",
    reviewSuccess: "bg-blue-50 text-blue-700",
    submitButton:
      "bg-gradient-to-l from-sky-500 to-blue-600 shadow-blue-200 hover:from-sky-600 hover:to-blue-700",
    focus: "focus:border-blue-400 focus:ring-blue-100",
  },
  violet: {
    header: "from-violet-500 to-indigo-600",
    icon: "text-violet-600",
    dot: "bg-violet-400",
    reviewSuccess: "bg-violet-50 text-violet-700",
    submitButton:
      "bg-gradient-to-l from-violet-500 to-indigo-600 shadow-violet-200 hover:from-violet-600 hover:to-indigo-700",
    focus: "focus:border-violet-400 focus:ring-violet-100",
  },
  rose: {
    header: "from-rose-500 to-pink-600",
    icon: "text-rose-600",
    dot: "bg-rose-400",
    reviewSuccess: "bg-rose-50 text-rose-700",
    submitButton:
      "bg-gradient-to-l from-rose-500 to-pink-600 shadow-rose-200 hover:from-rose-600 hover:to-pink-700",
    focus: "focus:border-rose-400 focus:ring-rose-100",
  },
};

export function ProviderDetailsDialog({
  open,
  onOpenChange,
  details,
  accent = "emerald",
  infoTitle,
  servicesTitle,
  servicesIcon: ServicesIcon,
  reviewPlaceholder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  details: ProviderDetails | null;
  accent?: Accent;
  infoTitle: string;
  servicesTitle: string;
  servicesIcon: LucideIcon;
  reviewPlaceholder: string;
}) {
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const styles = accentStyles[accent];

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setReviewRating(0);
      setReviewText("");
      setReviewSubmitted(false);
    }
    onOpenChange(nextOpen);
  };

  const submitReview = () => {
    if (reviewRating === 0 || reviewText.trim().length === 0) return;
    setReviewSubmitted(true);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        dir="rtl"
        className="flex max-h-[90dvh] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0 text-right shadow-2xl [&>button]:left-4 [&>button]:right-auto [&>button]:text-white [&>button]:opacity-100 sm:max-w-md"
      >
        {details && (
          <>
            <div className={`bg-gradient-to-l ${styles.header} px-6 py-6 text-white`}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
                <Building2 className="h-6 w-6" />
              </div>
              <DialogHeader className="text-right sm:text-right">
                <DialogTitle className="text-lg font-black leading-7 text-white">
                  {details.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-white/80">
                  {details.address}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5">
              <section className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                  <Info className={`h-4 w-4 ${styles.icon}`} />
                  {infoTitle}
                </h3>
                <div className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3.5">
                  <Info className={`mt-0.5 h-4 w-4 shrink-0 ${styles.icon}`} />
                  <div>
                    <p className="text-[11px] font-bold text-slate-700">توضیحات</p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">{details.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3.5">
                    <Clock3 className={`mt-0.5 h-4 w-4 shrink-0 ${styles.icon}`} />
                    <div>
                      <p className="text-[11px] font-bold text-slate-700">ساعت کاری</p>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500">{details.hours}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3.5">
                    <Smartphone className={`mt-0.5 h-4 w-4 shrink-0 ${styles.icon}`} />
                    <div>
                      <p className="text-[11px] font-bold text-slate-700">تلفن تماس</p>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500" dir="ltr">
                        {details.phone}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                    <MapPin className={`h-3.5 w-3.5 ${styles.icon}`} />
                    موقعیت روی نقشه
                  </p>
                  <LocationMap
                    lat={details.lat ?? MASHHAD_FALLBACK.lat}
                    lng={details.lng ?? MASHHAD_FALLBACK.lng}
                    label={details.name}
                  />
                </div>
              </section>

              <section className="space-y-3 border-t border-slate-100 pt-5">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                  <ServicesIcon className={`h-4 w-4 ${styles.icon}`} />
                  {servicesTitle}
                </h3>
                <div className="overflow-hidden rounded-2xl border border-slate-100">
                  {details.services.map((service, index) => (
                    <div
                      key={service.name}
                      className={`flex items-center justify-between gap-3 px-4 py-3.5 ${
                        index !== details.services.length - 1 ? "border-b border-slate-100" : ""
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2 text-xs font-bold text-slate-700">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${styles.dot}`} />
                        {service.name}
                      </span>
                      <span className="shrink-0 text-[11px] font-normal text-slate-800">
                        {service.price.toLocaleString("fa-IR")}{" "}
                        <span className="text-[9px] text-slate-500">تومان</span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3 border-t border-slate-100 pt-5">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                  <MessageCircleMore className={`h-4 w-4 ${styles.icon}`} />
                  امتیاز کاربران
                </h3>
                <div className="flex items-center justify-between rounded-3xl bg-gradient-to-l from-amber-50 to-orange-50 p-4 ring-1 ring-amber-100">
                  <div>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-black leading-none text-slate-800">
                        {details.rating.toLocaleString("fa-IR")}
                      </span>
                      <span className="pb-0.5 text-xs text-slate-400">از ۵</span>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-500">
                      بر اساس {details.reviews.toLocaleString("fa-IR")} نظر ثبت‌شده
                    </p>
                  </div>
                  <div className="flex gap-1" dir="ltr">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < Math.round(details.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-white text-amber-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2.5">
                  {details.recentReviews.map((review) => (
                    <article key={`${review.name}-${review.date}`} className="rounded-2xl bg-slate-50 p-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-700">{review.name}</p>
                          <p className="mt-0.5 text-[10px] text-slate-400">{review.date}</p>
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {review.rating.toLocaleString("fa-IR")}
                        </span>
                      </div>
                      <p className="text-xs leading-6 text-slate-500">{review.comment}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="space-y-3 border-t border-slate-100 pt-5">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-800">
                  <MessageCircleMore className={`h-4 w-4 ${styles.icon}`} />
                  ثبت نظر
                </h3>
                {reviewSubmitted ? (
                  <div className={`flex items-center gap-3 rounded-2xl p-4 text-xs font-bold ${styles.reviewSuccess}`}>
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    نظر شما با موفقیت ثبت شد.
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                      <span className="text-xs font-bold text-slate-600">امتیاز شما</span>
                      <div className="flex gap-0.5" dir="ltr">
                        {Array.from({ length: 5 }).map((_, index) => {
                          const value = index + 1;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setReviewRating(value)}
                              aria-label={`امتیاز ${value}`}
                              className="rounded-full p-0.5 transition-transform hover:scale-110"
                            >
                              <Star
                                className={`h-3.5 w-3.5 ${
                                  value <= reviewRating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(event) => setReviewText(event.target.value)}
                      rows={3}
                      placeholder={reviewPlaceholder}
                      className={`w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-6 outline-none transition focus:ring-2 ${styles.focus}`}
                    />
                    <Button
                      type="button"
                      onClick={submitReview}
                      disabled={reviewRating === 0 || reviewText.trim().length === 0}
                      className={`h-11 w-full rounded-full text-sm font-bold text-white shadow-md ${styles.submitButton}`}
                    >
                      ثبت نظر
                    </Button>
                  </>
                )}
              </section>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
