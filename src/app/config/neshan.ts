/** کلید وب نقشه نشان — در همه‌ی نقشه‌های برنامه استفاده می‌شود. */
export const NESHAN_MAP_KEY = "web.7f11b5c6971d4917a6e9272a522d8b9e";

/** تنظیمات پایه‌ی مشترک برای ساخت نقشه نشان. */
export const NESHAN_BASE_OPTIONS = {
  mapType: "neshan",
  key: NESHAN_MAP_KEY,
  poi: true,
  traffic: false,
} as const;

export const TEHRAN_CENTER = { lat: 35.699739, lng: 51.338097 };
