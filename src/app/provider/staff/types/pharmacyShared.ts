import { Package, Clock, Truck, CheckCircle2 } from 'lucide-react';

export const API_BASE = 'https://api.mediraai.com/api';

export const staffPharmacyStatusLabels: Record<string, string> = {
    '0': 'در انتظار بررسی',
    '1': 'در انتظار پرداخت',
    '2': 'در حال آماده‌سازی',
    '3': 'آماده تحویل / ارسال',
    '4': 'در حال ارسال (پیک)',
    '5': 'تحویل شده',
    '6': 'تکمیل شده',
    '7': 'لغو شده',
};

export const staffPharmacyStatusStyles: Record<string, string> = {
    '0': 'bg-slate-100 text-slate-700',
    '1': 'bg-amber-100 text-amber-700',
    '2': 'bg-blue-100 text-blue-700',
    '3': 'bg-indigo-100 text-indigo-700',
    '4': 'bg-purple-100 text-purple-700',
    '5': 'bg-emerald-100 text-emerald-700',
    '6': 'bg-emerald-100 text-emerald-700',
    '7': 'bg-red-100 text-red-700',
};

export const pharmacyDeliveryTypeLabels: Record<string, string> = {
    '0': 'مراجعه حضوری',
    '1': 'ارسال با پیک',
};

export const getNextStep = (status: number, deliveryType: number) => {
    switch (status) {
        case 1:
            return { endpoint: 'status/preparing', label: 'شروع آماده‌سازی', icon: Package };
        case 2:
            return { endpoint: 'status/ready', label: 'آماده تحویل/ارسال', icon: Clock };
        case 3:
            if (deliveryType === 1) {
                return { endpoint: 'status/delivering', label: 'تحویل به پیک', icon: Truck };
            }
            return { endpoint: 'status/delivered', label: 'تحویل به بیمار', icon: CheckCircle2 };
        case 4:
            return { endpoint: 'status/delivered', label: 'تأیید تحویل نهایی', icon: CheckCircle2 };
        default:
            return null;
    }
};

export interface PharmacyItem {
    id: number;
    medicine_name: string;
    quantity: number;
    unit: string;
    unit_price?: number;
    total_price?: number;
}

export interface ApiPharmacyRequest {
    id: number;
    status: number;
    delivery_type: number;
    total_price: number;
    created_at: string;
    user_name: string;
    user_mobile: string;
    prescription_code?: string;
    address_id:number;
    address_name:string;
    address_lng:string;
    address_lat:string;
    /** null یا undefined یعنی عمومی و رزرو نشده */
    pharmacy_id?: number | null;
}

export interface DetailedPharmacyRequest extends ApiPharmacyRequest {
    // ---------- اطلاعات آدرس و موقعیت ----------
    address_name:string | null;
    address_id:number;
    address_lng:string;
    address_lat:string;
    user_address_text?: string | null;
    user_address?: string | null;     // در صورت وجود در API
    address?: string | null;          // در صورت وجود در API
    lat?: number | string | null;
    lng?: number | string | null;
    latitude?: number | string | null;   // گاهی از API برمی‌گردد
    longitude?: number | string | null;  // گاهی از API برمی‌گردد

    prescription_id?: number;
    prescription_type_name?: string;
    prescription_details?: string | null;
    items: PharmacyItem[];
}
export const extractAddress = (d: DetailedPharmacyRequest | null | undefined): string | null => {
    if (!d) return null;
    const raw = d.user_address_text || d.user_address || d.address || d.address_name;
    if (typeof raw !== 'string') return null;
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
};

/**
 * استخراج مختصات معتبر (فیلتر کردن 0, null, NaN و رشته‌های خالی)
 */
export const extractCoords = (
    d: DetailedPharmacyRequest | null | undefined
): { lat: number; lng: number } | null => {
    if (!d) return null;
    const rawLat = d.lat ?? d.latitude ?? d.address_lat;
    const rawLng = d.lng ?? d.longitude ?? d.address_lng;
    if (rawLat == null || rawLng == null) return null;

    const lat = Number(rawLat);
    const lng = Number(rawLng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    if (lat === 0 || lng === 0) return null;
    // محدوده معتبر جهانی
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

    return { lat, lng };
};

/**
 * باز کردن موقعیت در نقشه نشان
 */
export const openNeshanMap = (lat: number, lng: number) => {

    const url = `https://neshan.org/maps/@${lat},${lng},16z,0p/routing/car/destination/${lat},${lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
};
export interface ParsedPrescriptionDetails {
    code?: string | null;
    files?: string[];
    medicines?: string | null;
    description?: string | null;
    delivery_type?: number | string;
    has_insurance?: string | number;
    user_address_id?: string | number;
}

export const statusOptions = [
    { value: 'all', label: 'همه وضعیت‌ها' },
    ...Object.entries(staffPharmacyStatusLabels).map(([value, label]) => ({ value, label })),
];

export const deliveryOptions = [
    { value: 'all', label: 'همه روش‌ها' },
    { value: '0', label: 'مراجعه حضوری' },
    { value: '1', label: 'ارسال با پیک' },
];

/** آیا درخواست به داروخانه جاری رزرو شده است؟ */
export const isAssignedToUs = (r: { pharmacy_id?: number | null }) =>
    r.pharmacy_id !== null && r.pharmacy_id !== undefined;