import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

function MapInvalidator({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    const timers = [50, 200, 400].map((delay) =>
      window.setTimeout(() => {
        map.invalidateSize();
        map.setView([lat, lng], map.getZoom(), { animate: false });
      }, delay),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [map, lat, lng]);

  return null;
}

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
  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-100 ${className}`}>
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          {label ? <Popup>{label}</Popup> : null}
        </Marker>
        <MapInvalidator lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}

export const MASHHAD_FALLBACK = { lat: 36.297, lng: 59.6062 };
