import Style from "@neshan-maps-platform/ol/style/Style";
import Icon from "@neshan-maps-platform/ol/style/Icon";

const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 24 30"><path d="M12 0C5.4 0 0 5.2 0 11.7 0 20.4 12 30 12 30s12-9.6 12-18.3C24 5.2 18.6 0 12 0z" fill="#ef4444"/><circle cx="12" cy="11.5" r="4.5" fill="#fff"/></svg>`;

/** استایل نشانگر قرمز برای نمایش نقطه روی نقشه نشان. */
export const neshanMarkerStyle = new Style({
  image: new Icon({
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(PIN_SVG)}`,
    anchor: [0.5, 1],
  }),
});
