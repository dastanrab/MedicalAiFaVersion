import { useEffect, useRef } from "react";
import Map from "@neshan-maps-platform/ol/Map";
import View from "@neshan-maps-platform/ol/View";
import Feature from "@neshan-maps-platform/ol/Feature";
import Point from "@neshan-maps-platform/ol/geom/Point";
import VectorLayer from "@neshan-maps-platform/ol/layer/Vector";
import VectorSource from "@neshan-maps-platform/ol/source/Vector";
import { defaults as defaultInteractions } from "@neshan-maps-platform/ol/interaction/defaults";
import { fromLonLat } from "@neshan-maps-platform/ol/proj";
import { NESHAN_BASE_OPTIONS } from "../config/neshan";
import { neshanMarkerStyle } from "../lib/neshanMarker";

/** نمایش یک نقطه روی نقشه نشان (فقط نمایشی). */
export function LocationMap({
  lat,
  lng,
  label,
  className = "h-44",
}: {
  lat: number;
  lng: number;
  label?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Feature<Point> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const marker = new Feature({ geometry: new Point(fromLonLat([lng, lat])) });
    marker.setStyle(neshanMarkerStyle);
    markerRef.current = marker;

    const map = new Map({
      ...NESHAN_BASE_OPTIONS,
      target: containerRef.current,
      interactions: defaultInteractions({ mouseWheelZoom: false }),
      layers: [new VectorLayer({ source: new VectorSource({ features: [marker] }), zIndex: 10 })],
      view: new View({ center: fromLonLat([lng, lat]), zoom: 15 }),
    });
    mapRef.current = map;

    // نقشه داخل مودال/انیمیشن باز می‌شود؛ بعد از مشخص شدن اندازه، دوباره رندر شود
    const observer = new ResizeObserver(() => map.updateSize());
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      map.setTarget(undefined);
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const coord = fromLonLat([lng, lat]);
    markerRef.current?.getGeometry()?.setCoordinates(coord);
    mapRef.current?.getView().setCenter(coord);
  }, [lat, lng]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-100 ${className}`}
      title={label}
      aria-label={label}
    >
      <div ref={containerRef} className="absolute inset-0 h-full w-full" style={{ zIndex: 0 }} />
    </div>
  );
}

export const MASHHAD_FALLBACK = { lat: 36.297, lng: 59.6062 };
