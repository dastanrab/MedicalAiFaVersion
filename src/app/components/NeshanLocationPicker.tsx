import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import Map from "@neshan-maps-platform/ol/Map";
import View from "@neshan-maps-platform/ol/View";
import { fromLonLat, toLonLat } from "@neshan-maps-platform/ol/proj";
import { NESHAN_BASE_OPTIONS, TEHRAN_CENTER } from "../config/neshan";

/**
 * انتخاب موقعیت با نقشه نشان: کاربر نقشه را جابه‌جا می‌کند و مرکز نقشه
 * (زیر نشانگر ثابت) به‌عنوان مختصات انتخاب‌شده برگردانده می‌شود.
 */
export function NeshanLocationPicker({
  lat,
  lng,
  onChange,
  zoom = 15,
  className = "h-64",
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  zoom?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new Map({
      ...NESHAN_BASE_OPTIONS,
      target: containerRef.current,
      view: new View({
        center: fromLonLat([lng ?? TEHRAN_CENTER.lng, lat ?? TEHRAN_CENTER.lat]),
        zoom,
      }),
    });

    map.on("moveend", () => {
      const center = map.getView().getCenter();
      if (!center) return;
      const [nextLng, nextLat] = toLonLat(center);
      onChangeRef.current(nextLat, nextLng);
    });

    mapRef.current = map;
    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // اگر مختصات از بیرون (مثلاً ورودی دستی) تغییر کرد، نقشه را جابه‌جا کن
  useEffect(() => {
    const view = mapRef.current?.getView();
    if (!view || lat == null || lng == null) return;
    const current = view.getCenter();
    if (current) {
      const [curLng, curLat] = toLonLat(current);
      if (Math.abs(curLat - lat) < 1e-6 && Math.abs(curLng - lng) < 1e-6) return;
    }
    view.setCenter(fromLonLat([lng, lat]));
  }, [lat, lng]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-100 ${className}`}>
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
        <div className="relative -top-5">
          <MapPin className="h-10 w-10 text-red-500 drop-shadow-md" fill="currentColor" />
          <div className="absolute -bottom-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-black/20 blur-[2px]" />
        </div>
      </div>
    </div>
  );
}
