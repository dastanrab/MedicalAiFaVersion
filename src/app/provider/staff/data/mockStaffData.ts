import { toJalaali } from 'jalaali-js';
import { formatJalali } from '../../utils/jalali';

/**
 * داده‌های mock پنل کارمند — تا زمانی که API مخصوص کارمند آماده شود.
 * عمداً هیچ فیلد محرمانه‌ای (کد ملی، بیمه، شرح حال، تشخیص، نتایج AI، مبالغ مالی) در این داده‌ها وجود ندارد.
 */

/** تاریخ شمسی با فاصله n روز از امروز */
export function jalaliFromToday(offset: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return formatJalali(toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate()));
}

export function todayKey(): string {
    return jalaliFromToday(0);
}

// ─── پزشک ─────────────────────────────────────────────────────────────

export type StaffAppointmentStatus = 'booked' | 'checked_in' | 'done' | 'canceled' | 'available' ;

export interface StaffAppointment {
    id: number;
    patientName: string;
    patientPhone: string;
    date: string;
    time: string;
    type: 'in_person' | 'online';
    status: StaffAppointmentStatus;
    /** نوبت از اپلیکیشن گرفته شده یا منشی ثبت کرده */
    source: 'app' | 'secretary';
}

export interface StaffScheduleDay {
    weekday: string;
    shifts: { start: string; end: string }[];
    slotMinutes: number;
}

export const mockStaffAppointments: StaffAppointment[] = [
    { id: 1, patientName: 'مریم رضایی', patientPhone: '09121234567', date: jalaliFromToday(0), time: '09:00', type: 'in_person', status: 'done', source: 'app' },
    { id: 2, patientName: 'علی کریمی', patientPhone: '09351112233', date: jalaliFromToday(0), time: '09:30', type: 'in_person', status: 'checked_in', source: 'app' },
    { id: 3, patientName: 'نرگس محمدی', patientPhone: '09127654321', date: jalaliFromToday(0), time: '10:00', type: 'in_person', status: 'booked', source: 'secretary' },
    { id: 4, patientName: 'حسین احمدی', patientPhone: '09191239876', date: jalaliFromToday(0), time: '10:30', type: 'online', status: 'booked', source: 'app' },
    { id: 5, patientName: 'فاطمه موسوی', patientPhone: '09104445566', date: jalaliFromToday(0), time: '11:00', type: 'in_person', status: 'booked', source: 'app' },
    { id: 6, patientName: 'رضا قاسمی', patientPhone: '09367778899', date: jalaliFromToday(1), time: '09:00', type: 'in_person', status: 'booked', source: 'app' },
    { id: 7, patientName: 'زهرا حسینی', patientPhone: '09128889900', date: jalaliFromToday(1), time: '09:30', type: 'online', status: 'booked', source: 'app' },
    { id: 8, patientName: 'مریم رضایی', patientPhone: '09121234567', date: jalaliFromToday(2), time: '16:00', type: 'in_person', status: 'booked', source: 'secretary' },
    { id: 9, patientName: 'امیر نوری', patientPhone: '09213334455', date: jalaliFromToday(-1), time: '17:00', type: 'in_person', status: 'canceled', source: 'app' },
    { id: 10, patientName: 'علی کریمی', patientPhone: '09351112233', date: jalaliFromToday(-7), time: '10:00', type: 'in_person', status: 'done', source: 'app' },
];

export const mockStaffSchedule: StaffScheduleDay[] = [
    { weekday: 'شنبه', shifts: [{ start: '09:00', end: '13:00' }, { start: '16:00', end: '20:00' }], slotMinutes: 30 },
    { weekday: 'یکشنبه', shifts: [{ start: '09:00', end: '13:00' }], slotMinutes: 30 },
    { weekday: 'دوشنبه', shifts: [{ start: '09:00', end: '13:00' }, { start: '16:00', end: '20:00' }], slotMinutes: 30 },
    { weekday: 'سه‌شنبه', shifts: [{ start: '16:00', end: '20:00' }], slotMinutes: 30 },
    { weekday: 'چهارشنبه', shifts: [{ start: '09:00', end: '13:00' }], slotMinutes: 30 },
    { weekday: 'پنجشنبه', shifts: [{ start: '09:00', end: '12:00' }], slotMinutes: 20 },
    { weekday: 'جمعه', shifts: [], slotMinutes: 30 },
];

// ─── آزمایشگاه ────────────────────────────────────────────────────────

export type StaffLabStatus =
    | 'new'
    | 'confirmed'
    | 'sampled'
    | 'testing'
    | 'result_uploaded'
    | 'canceled';

export interface StaffLabRequest {
    id: number;
    code: string;
    patientName: string;
    patientPhone: string;
    tests: string[];
    type: 'in_person' | 'home';
    address?: string;
    date: string;
    time: string;
    status: StaffLabStatus;
    /** فقط نام فایل؛ محتوای جواب برای کارمند قابل مشاهده نیست */
    resultFileName?: string;
}

export const mockStaffLabRequests: StaffLabRequest[] = [
    { id: 101, code: 'LB-1201', patientName: 'سارا جعفری', patientPhone: '09121110001', tests: ['CBC', 'FBS'], type: 'home', address: 'تهران، سعادت‌آباد، خیابان سرو', date: jalaliFromToday(0), time: '07:30', status: 'new' },
    { id: 102, code: 'LB-1202', patientName: 'محمد صادقی', patientPhone: '09121110002', tests: ['TSH', 'Vitamin D3'], type: 'in_person', date: jalaliFromToday(0), time: '08:00', status: 'confirmed' },
    { id: 103, code: 'LB-1203', patientName: 'لیلا امینی', patientPhone: '09121110003', tests: ['Lipid Profile'], type: 'home', address: 'تهران، پونک، بلوار عدل', date: jalaliFromToday(0), time: '08:30', status: 'sampled' },
    { id: 104, code: 'LB-1204', patientName: 'کاوه رحیمی', patientPhone: '09121110004', tests: ['HbA1c'], type: 'in_person', date: jalaliFromToday(-1), time: '09:00', status: 'testing' },
    { id: 105, code: 'LB-1205', patientName: 'نازنین فرهادی', patientPhone: '09121110005', tests: ['Urinalysis', 'CBC'], type: 'in_person', date: jalaliFromToday(-1), time: '10:00', status: 'testing' },
    { id: 106, code: 'LB-1206', patientName: 'بهرام شریفی', patientPhone: '09121110006', tests: ['Iron'], type: 'home', address: 'تهران، نارمک، میدان هفت حوض', date: jalaliFromToday(1), time: '07:00', status: 'confirmed' },
    { id: 107, code: 'LB-1207', patientName: 'الهام کاظمی', patientPhone: '09121110007', tests: ['FBS'], type: 'in_person', date: jalaliFromToday(-2), time: '08:00', status: 'result_uploaded', resultFileName: 'LB-1207.pdf' },
    { id: 108, code: 'LB-1208', patientName: 'پویا مرادی', patientPhone: '09121110008', tests: ['TSH'], type: 'home', address: 'تهران، تهرانپارس', date: jalaliFromToday(1), time: '08:00', status: 'new' },
];

// ─── داروخانه ─────────────────────────────────────────────────────────

export type StaffPharmacyStatus = 'new' | 'reviewing' | 'preparing' | 'ready' | 'delivered' | 'canceled';

export interface StaffPharmacyRequest {
    id: number;
    code: string;
    patientName: string;
    patientPhone: string;
    prescriptionCode: string;
    drugs: { name: string; qty: number }[];
    deliveryType: 'pickup' | 'courier';
    address?: string;
    createdAt: string;
    status: StaffPharmacyStatus;
    courierName?: string;
}

export interface StaffDrugStock {
    id: number;
    name: string;
    form: string;
    stock: number;
    minStock: number;
}

export const mockStaffPharmacyRequests: StaffPharmacyRequest[] = [
    { id: 201, code: 'PH-3301', patientName: 'رویا نیک‌نام', patientPhone: '09122220001', prescriptionCode: '۱۲۳۴۵۶', drugs: [{ name: 'آموکسی‌سیلین ۵۰۰', qty: 2 }, { name: 'استامینوفن ۵۰۰', qty: 1 }], deliveryType: 'courier', address: 'تهران، ونک، خیابان ملاصدرا', createdAt: `${jalaliFromToday(0)} 09:12`, status: 'new' },
    { id: 202, code: 'PH-3302', patientName: 'مهدی سلیمانی', patientPhone: '09122220002', prescriptionCode: '۶۵۴۳۲۱', drugs: [{ name: 'متفورمین ۵۰۰', qty: 3 }], deliveryType: 'pickup', createdAt: `${jalaliFromToday(0)} 09:40`, status: 'reviewing' },
    { id: 203, code: 'PH-3303', patientName: 'آزاده صفری', patientPhone: '09122220003', prescriptionCode: '۷۷۸۸۹۹', drugs: [{ name: 'لوزارتان ۲۵', qty: 2 }, { name: 'آتورواستاتین ۲۰', qty: 1 }], deliveryType: 'courier', address: 'تهران، شهرک غرب، فاز ۲', createdAt: `${jalaliFromToday(0)} 10:05`, status: 'preparing' },
    { id: 204, code: 'PH-3304', patientName: 'سینا بهرامی', patientPhone: '09122220004', prescriptionCode: '۴۴۵۵۶۶', drugs: [{ name: 'سالبوتامول اسپری', qty: 1 }], deliveryType: 'courier', address: 'تهران، جردن', createdAt: `${jalaliFromToday(-1)} 18:20`, status: 'ready' },
    { id: 205, code: 'PH-3305', patientName: 'نگار یزدانی', patientPhone: '09122220005', prescriptionCode: '۲۲۳۳۴۴', drugs: [{ name: 'ویتامین D ۵۰۰۰۰', qty: 4 }], deliveryType: 'pickup', createdAt: `${jalaliFromToday(-1)} 12:00`, status: 'delivered' },
];

export const mockStaffDrugStock: StaffDrugStock[] = [
    { id: 1, name: 'آموکسی‌سیلین ۵۰۰', form: 'کپسول', stock: 120, minStock: 50 },
    { id: 2, name: 'استامینوفن ۵۰۰', form: 'قرص', stock: 340, minStock: 100 },
    { id: 3, name: 'متفورمین ۵۰۰', form: 'قرص', stock: 40, minStock: 60 },
    { id: 4, name: 'لوزارتان ۲۵', form: 'قرص', stock: 85, minStock: 40 },
    { id: 5, name: 'آتورواستاتین ۲۰', form: 'قرص', stock: 12, minStock: 30 },
    { id: 6, name: 'سالبوتامول اسپری', form: 'اسپری', stock: 18, minStock: 10 },
    { id: 7, name: 'ویتامین D ۵۰۰۰۰', form: 'پرل', stock: 200, minStock: 50 },
];

export const mockStaffCouriers = ['پیک داخلی — حمید', 'پیک داخلی — جواد', 'اسنپ باکس'];

// ─── پرستار در منزل ───────────────────────────────────────────────────

export type StaffNurseStatus = 'pending_nurse' | 'pending_visit' | 'completed' | 'canceled';

export interface StaffNurseRequest {
    id: number;
    code: string;
    patientName: string;
    patientPhone: string;
    service: string;
    address: string;
    date: string;
    time: string;
    status: StaffNurseStatus;
    nurseId?: number;
}

export interface StaffNursePersonnel {
    id: number;
    name: string;
    phone: string;
    gender: 'male' | 'female';
    active: boolean;
}

export interface StaffNurseService {
    id: number;
    title: string;
    duration: string;
    active: boolean;
}

export const mockStaffNursePersonnel: StaffNursePersonnel[] = [
    { id: 1, name: 'زینب کرمی', phone: '09123330001', gender: 'female', active: true },
    { id: 2, name: 'محسن طاهری', phone: '09123330002', gender: 'male', active: true },
    { id: 3, name: 'شیما اکبری', phone: '09123330003', gender: 'female', active: true },
    { id: 4, name: 'رامین عباسی', phone: '09123330004', gender: 'male', active: false },
];

export const mockStaffNurseServices: StaffNurseService[] = [
    { id: 1, title: 'تزریقات', duration: '۳۰ دقیقه', active: true },
    { id: 2, title: 'سرم‌تراپی', duration: '۹۰ دقیقه', active: true },
    { id: 3, title: 'پانسمان', duration: '۴۵ دقیقه', active: true },
    { id: 4, title: 'مراقبت از سالمند', duration: '۸ ساعت', active: true },
    { id: 5, title: 'سوند گذاری', duration: '۴۵ دقیقه', active: false },
];

export const mockStaffNurseRequests: StaffNurseRequest[] = [
    { id: 301, code: 'NR-5501', patientName: 'منیژه کیانی', patientPhone: '09124440001', service: 'تزریقات', address: 'تهران، یوسف‌آباد', date: jalaliFromToday(0), time: '10:00', status: 'pending_nurse' },
    { id: 302, code: 'NR-5502', patientName: 'جمشید فلاحی', patientPhone: '09124440002', service: 'پانسمان', address: 'تهران، شهرآرا', date: jalaliFromToday(0), time: '12:00', status: 'pending_visit', nurseId: 2 },
    { id: 303, code: 'NR-5503', patientName: 'پروین رستمی', patientPhone: '09124440003', service: 'سرم‌تراپی', address: 'تهران، پاسداران', date: jalaliFromToday(0), time: '15:30', status: 'pending_nurse' },
    { id: 304, code: 'NR-5504', patientName: 'اکبر توکلی', patientPhone: '09124440004', service: 'مراقبت از سالمند', address: 'تهران، نیاوران', date: jalaliFromToday(1), time: '08:00', status: 'pending_visit', nurseId: 1 },
    { id: 305, code: 'NR-5505', patientName: 'سمیرا داوودی', patientPhone: '09124440005', service: 'تزریقات', address: 'تهران، صادقیه', date: jalaliFromToday(-1), time: '18:00', status: 'completed', nurseId: 3 },
];

// ─── مشترک ───────────────────────────────────────────────────────────

export interface StaffReview {
    id: number;
    author: string;
    rating: number;
    comment: string;
    date: string;
}

export const mockStaffReviews: StaffReview[] = [
    { id: 1, author: 'م. رضایی', rating: 5, comment: 'برخورد کادر بسیار محترمانه بود و زمان انتظار کم بود.', date: jalaliFromToday(-1) },
    { id: 2, author: 'ع. کریمی', rating: 4, comment: 'هماهنگی نوبت خوب بود، فقط پارکینگ کمی سخت است.', date: jalaliFromToday(-3) },
    { id: 3, author: 'ن. محمدی', rating: 5, comment: 'تلفنی خیلی سریع پاسخ دادند.', date: jalaliFromToday(-6) },
    { id: 4, author: 'ح. احمدی', rating: 3, comment: 'نوبت با تأخیر انجام شد.', date: jalaliFromToday(-10) },
];
