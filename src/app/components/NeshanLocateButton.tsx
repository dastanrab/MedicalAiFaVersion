import { useState, type RefObject } from "react";
import { LocateFixed, Loader2 } from "lucide-react";
import type Map from "@neshan-maps-platform/ol/Map";
import { fromLonLat } from "@neshan-maps-platform/ol/proj";

const GEO_ERRORS: Record<number, string> = {
  1: "دسترسی به موقعیت مکانی داده نشد",
  2: "موقعیت مکانی در دسترس نیست؛ GPS را روشن کنید",
  3: "دریافت موقعیت طول کشید؛ دوباره تلاش کنید",
};

/**
 * دکمه‌ی «موقعیت من» روی نقشه نشان: موقعیت فعلی کاربر را می‌گیرد و نقشه را به آن‌جا می‌برد.
 * چون انتخابگرها مختصات را از مرکز نقشه می‌خوانند، با جابه‌جایی نقشه مختصات هم به‌روز می‌شود.
 * والد باید `relative` باشد.
 */
export function NeshanLocateButton({
  mapRef,
  className = "bottom-3 right-3",
}: {
  mapRef: RefObject<Map | null>;
  className?: string;
}) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (locating) return;

    if (!("geolocation" in navigator)) {
      setError("مرورگر شما از موقعیت مکانی پشتیبانی نمی‌کند");
      return;
    }

    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        const view = mapRef.current?.getView();
        if (!view) return;
        view.animate({
          center: fromLonLat([coords.longitude, coords.latitude]),
          zoom: Math.max(view.getZoom() ?? 16, 16),
          duration: 500,
        });
      },
      (err) => {
        setLocating(false);
        setError(GEO_ERRORS[err.code] ?? "خطا در دریافت موقعیت مکانی");
        window.setTimeout(() => setError(null), 3500);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  };

  return (
    <div className={`absolute z-20 flex flex-col items-start gap-2 ${className}`}>
      {error && (
        <div className="max-w-[220px] rounded-xl bg-slate-900/85 px-3 py-2 text-[11px] leading-5 text-white shadow-lg" dir="rtl">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={locate}
        aria-label="رفتن به موقعیت من"
        title="موقعیت من"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-blue-600 shadow-[0_4px_14px_rgba(0,0,0,0.15)] ring-1 ring-slate-100 transition active:scale-95 disabled:opacity-70"
        disabled={locating}
      >
        {locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <LocateFixed className="h-5 w-5" />}
      </button>
    </div>
  );
}
