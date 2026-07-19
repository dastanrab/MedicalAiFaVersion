import type { LabRequestStatus, PharmacyRequestStatus, NurseRequestStatus } from '../config/statusOptions';

export interface TimelineEntry {
    at: string;
    label: string;
}

export interface LabRequest {
    id: number;
    code: string;
    patientName: string;
    patientPhone: string;
    nationalCode: string;
    insuranceNumber?: string;
    prescriptionType: 'digital' | 'paper';
    prescriptionCode?: string;
    tests: { name: string; price: number }[];
    totalPrice: number;
    type: 'in_person' | 'home';
    address?: string;
    scheduledDate: string;
    scheduledAt: string;
    note?: string;
    status: LabRequestStatus;
    timeline: TimelineEntry[];
    result?: LabRequestResult;
}

export interface LabRequestResult {
    fileName: string;
    fileUrl: string;
    notes?: string;
    uploadedAt: string;
}

export interface LabTestCatalogItem {
    id: number;
    name: string;
    category: string;
    price: number;
    turnaround: string;
    fasting: boolean;
    active: boolean;
    description?: string;
}

/** عناوین مرجع برای Select Box افزودن آزمایش */
export const labTestTitleOptions: { value: string; label: string; category: string; defaultPrice: number }[] = [
    { value: 'cbc', label: 'CBC — آزمایش خون کامل', category: 'خون', defaultPrice: 120000 },
    { value: 'fbs', label: 'FBS — قند خون ناشتا', category: 'خون', defaultPrice: 80000 },
    { value: 'tsh', label: 'TSH — هورمون تیروئید', category: 'هورمون', defaultPrice: 170000 },
    { value: 'vitamin_d3', label: 'Vitamin D3', category: 'ویتامین', defaultPrice: 210000 },
    { value: 'lipid', label: 'Lipid Profile — چربی خون', category: 'خون', defaultPrice: 150000 },
    { value: 'iron', label: 'Iron — آهن', category: 'خون', defaultPrice: 110000 },
    { value: 'hba1c', label: 'HbA1c — قند سه‌ماهه', category: 'خون', defaultPrice: 130000 },
    { value: 'urine', label: 'Urinalysis — ادرار', category: 'ادرار', defaultPrice: 70000 },
];

export interface TimeSlot {
    id: number;
    label: string;
    capacity: number;
    booked: number;
    active: boolean;
}

export interface LabResult {
    id: number;
    requestId: number;
    requestCode: string;
    patientName: string;
    uploadedAt: string;
    sent: boolean;
    fileName?: string;
    notes?: string;
}

export interface PharmacyRequest {
    id: number;
    code: string;
    patientName: string;
    patientPhone: string;
    prescriptionType: 'digital' | 'paper';
    prescriptionCode?: string;
    items: { name: string; dose: string; qty: number; available: boolean; price: number }[];
    totalPrice: number;
    deliveryType: 'pickup' | 'delivery';
    address?: string;
    insurance: boolean;
    note?: string;
    status: PharmacyRequestStatus;
    createdAt: string;
    timeline: TimelineEntry[];
}

export interface DrugInventoryItem {
    id: number;
    name: string;
    price: number;
}

export interface NursePersonnel {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    nationalCode: string;
    gender: 'male' | 'female';
    active: boolean;
}

export interface NurseService {
    id: number;
    serviceKey: string;
    name: string;
    price: number;
    description?: string;
    active: boolean;
}

export interface NurseRequest {
    extra_info: any;
    id: number;
    code: string;
    patientName: string;
    patientPhone: string;
    serviceType: string;
    serviceKey: string;
    address: string;
    scheduledAt: string;
    scheduledDate: string;
    scheduledTime: string;
    note?: string;
    amount: number;
    status: NurseRequestStatus;
    timeline: TimelineEntry[];
}

export interface ReviewItem {
    id: number;
    patientName: string;
    rating: number;
    comment: string;
    date: string;
    replied?: string;
}

export interface FinanceRow {
    id: number;
    code: string;
    patientName: string;
    amount: number;
    fee: number;
    net: number;
    method: string;
    date: string;
}

export interface NotificationItem {
    id: number;
    title: string;
    body: string;
    time: string;
    read: boolean;
}

export interface SupportTicket {
    id: number;
    subject: string;
    status: 'open' | 'answered' | 'closed';
    lastMessage: string;
    updatedAt: string;
}

export const mockLabProfile = {
    labName: 'آزمایشگاه پارس',
    licenseNumber: 'L-45892',
    technicalManager: 'دکتر رضایی',
    workHours: '۸ تا ۲۰',
    address: 'مشهد، بلوار وکیل‌آباد، پلاک ۱۲',
    province: 'خراسان رضوی',
    city: 'مشهد',
    isActive: true,
    homeSamplingEnabled: true,
    minOrderAmount: 100000,
};

export const mockPharmacyProfile = {
    pharmacyName: 'داروخانه سلامت',
    licenseNumber: 'P-78231',
    pharmacist: 'دکتر احمدی',
    shift: 'day' as const,
    workHours: '۸ تا ۲۲',
    address: 'تهران، خیابان ولیعصر، پلاک ۴۵',
    province: 'تهران',
    city: 'تهران',
    isActive: true,
    deliveryEnabled: true,
    deliveryRadius: 5,
    deliveryFee: 35000,
    lat: 35.7219,
    lng: 51.4056,
    isOpen: true,
};

export const mockNurseProfile = {
    firstName: 'زهرا',
    lastName: 'موسوی',
    nursingCode: 'N-33421',
    gender: 'female',
    services: ['injection', 'wound', 'elderly'],
    experience: 8,
    serviceFee: 450000,
    coverage: 'مناطق شمالی تهران',
    isAvailable: true,
    bio: 'پرستار با ۸ سال سابقه در مراقبت خانگی',
};

export const mockLabRequests: LabRequest[] = [
    {
        id: 1,
        code: 'LAB-1404-001',
        patientName: 'علی محمدی',
        patientPhone: '09151234567',
        nationalCode: '1234567890',
        insuranceNumber: '987654321',
        prescriptionType: 'digital',
        prescriptionCode: 'RX-8821',
        tests: [
            { name: 'CBC', price: 120000 },
            { name: 'FBS', price: 80000 },
        ],
        totalPrice: 200000,
        type: 'in_person',
        scheduledDate: '1404/03/20',
        scheduledAt: '1404/03/20',
        status: 'new',
        timeline: [{ at: '1404/03/19 14:30', label: 'درخواست ثبت شد' }],
    },
    {
        id: 2,
        code: 'LAB-1404-002',
        patientName: 'فاطمه کریمی',
        patientPhone: '09159876543',
        nationalCode: '0987654321',
        prescriptionType: 'paper',
        tests: [{ name: 'TSH', price: 170000 }],
        totalPrice: 170000,
        type: 'home',
        address: 'مشهد، احمدآباد، کوچه ۵، واحد ۳',
        scheduledDate: '1404/03/20',
        scheduledAt: '1404/03/20',
        note: 'ناشتا مراجعه می‌کنم',
        status: 'confirmed',
        timeline: [
            { at: '1404/03/19 10:00', label: 'درخواست ثبت شد' },
            { at: '1404/03/19 11:15', label: 'تأیید شد' },
        ],
    },
    {
        id: 3,
        code: 'LAB-1404-003',
        patientName: 'حسین رضایی',
        patientPhone: '09151112233',
        nationalCode: '1122334455',
        prescriptionType: 'digital',
        prescriptionCode: 'RX-9012',
        tests: [
            { name: 'Vitamin D3', price: 210000 },
            { name: 'Iron', price: 110000 },
        ],
        totalPrice: 320000,
        type: 'in_person',
        scheduledDate: '1404/03/19',
        scheduledAt: '1404/03/19',
        status: 'testing',
        timeline: [
            { at: '1404/03/18 09:00', label: 'درخواست ثبت شد' },
            { at: '1404/03/18 10:00', label: 'تأیید شد' },
            { at: '1404/03/18 18:30', label: 'نمونه‌گیری انجام شد' },
            { at: '1404/03/19 08:00', label: 'شروع آزمایش' },
        ],
    },
    {
        id: 4,
        code: 'LAB-1404-004',
        patientName: 'مریم احمدی',
        patientPhone: '09154445566',
        nationalCode: '5566778899',
        prescriptionType: 'digital',
        prescriptionCode: 'RX-7733',
        tests: [{ name: 'Lipid Profile', price: 150000 }],
        totalPrice: 150000,
        type: 'in_person',
        scheduledDate: '1404/03/18',
        scheduledAt: '1404/03/18',
        status: 'completed',
        result: {
            fileName: 'result-lipid.pdf',
            fileUrl: '#',
            notes: 'نتایج در محدوده نرمال',
            uploadedAt: '1404/03/18 14:00',
        },
        timeline: [
            { at: '1404/03/17 08:00', label: 'درخواست ثبت شد' },
            { at: '1404/03/17 09:00', label: 'تأیید شد' },
            { at: '1404/03/17 11:00', label: 'نمونه‌گیری انجام شد' },
            { at: '1404/03/18 14:00', label: 'نتیجه آماده' },
        ],
    },
];

export const mockLabCatalog: LabTestCatalogItem[] = [
    { id: 1, name: 'CBC', category: 'خون', price: 120000, turnaround: '۲۴ ساعت', fasting: false, active: true, description: 'آزمایش خون کامل' },
    { id: 2, name: 'FBS', category: 'خون', price: 80000, turnaround: '۲۴ ساعت', fasting: true, active: true, description: 'قند خون ناشتا' },
    { id: 3, name: 'TSH', category: 'هورمون', price: 170000, turnaround: '۴۸ ساعت', fasting: false, active: true },
    { id: 4, name: 'Vitamin D3', category: 'ویتامین', price: 210000, turnaround: '۴۸ ساعت', fasting: false, active: true },
    { id: 5, name: 'Lipid Profile', category: 'خون', price: 150000, turnaround: '۲۴ ساعت', fasting: true, active: false },
];

export const mockTimeSlots: TimeSlot[] = [
    { id: 1, label: '۸ تا ۱۰', capacity: 5, booked: 3, active: true },
    { id: 2, label: '۱۰ تا ۱۲', capacity: 5, booked: 5, active: true },
    { id: 3, label: '۱۶ تا ۱۸', capacity: 4, booked: 1, active: true },
    { id: 4, label: '۱۸ تا ۲۰', capacity: 4, booked: 2, active: true },
];

export const mockLabResults: LabResult[] = [
    { id: 1, requestId: 4, requestCode: 'LAB-1404-004', patientName: 'مریم احمدی', uploadedAt: '1404/03/18 14:00', sent: false, fileName: 'result-lipid.pdf' },
    { id: 2, requestId: 0, requestCode: 'LAB-1403-089', patientName: 'رضا نوری', uploadedAt: '1404/03/15 11:30', sent: true, fileName: 'result-cbc.pdf' },
];

export const mockPharmacyRequests: PharmacyRequest[] = [
    {
        id: 1,
        code: 'PHR-1404-001',
        patientName: 'سارا جعفری',
        patientPhone: '09153334455',
        prescriptionType: 'digital',
        prescriptionCode: 'RX-5512',
        items: [
            { name: 'آموکسی‌سیلین ۵۰۰', dose: 'هر ۸ ساعت', qty: 21, available: true, price: 85000 },
            { name: 'استامینوفن ۵۰۰', dose: 'در صورت تب', qty: 10, available: true, price: 25000 },
        ],
        totalPrice: 110000,
        deliveryType: 'pickup',
        insurance: true,
        status: 'new',
        createdAt: '1404/03/19 16:00',
        timeline: [{ at: '1404/03/19 16:00', label: 'نسخه ثبت شد' }],
    },
    {
        id: 2,
        code: 'PHR-1404-002',
        patientName: 'محمد حسینی',
        patientPhone: '09156667788',
        prescriptionType: 'paper',
        items: [
            { name: 'متفورمین ۵۰۰', dose: 'دو بار در روز', qty: 60, available: true, price: 95000 },
            { name: 'لوزارتان ۵۰', dose: 'یک بار در روز', qty: 30, available: false, price: 120000 },
        ],
        totalPrice: 215000,
        deliveryType: 'delivery',
        address: 'تهران، سعادت‌آباد، میدان کاج',
        insurance: false,
        note: 'لوزارتان اگر موجود نبود جایگزین بگویید',
        status: 'reviewing',
        createdAt: '1404/03/19 12:00',
        timeline: [
            { at: '1404/03/19 12:00', label: 'نسخه ثبت شد' },
            { at: '1404/03/19 12:30', label: 'در حال بررسی' },
        ],
    },
    {
        id: 3,
        code: 'PHR-1404-003',
        patientName: 'نرگس صادقی',
        patientPhone: '09157778899',
        prescriptionType: 'digital',
        prescriptionCode: 'RX-6621',
        items: [{ name: 'ویتامین D', dose: 'هفتگی', qty: 4, available: true, price: 45000 }],
        totalPrice: 45000,
        deliveryType: 'delivery',
        address: 'تهران، ونک، خیابان ملاصدرا',
        insurance: false,
        status: 'ready',
        createdAt: '1404/03/18 09:00',
        timeline: [
            { at: '1404/03/18 09:00', label: 'نسخه ثبت شد' },
            { at: '1404/03/18 10:00', label: 'آماده تحویل' },
        ],
    },
];

export const mockDrugInventory: DrugInventoryItem[] = [
    { id: 1, name: 'آموکسی‌سیلین ۵۰۰', price: 85000 },
    { id: 2, name: 'متفورمین ۵۰۰', price: 95000 },
    { id: 3, name: 'لوزارتان ۵۰', price: 120000 },
    { id: 4, name: 'استامینوفن ۵۰۰', price: 25000 },
    { id: 5, name: 'ویتامین D', price: 45000 },
];

/** پایگاه مرجع دارو — برای انتخاب عنوان هنگام افزودن به لیست */
export const mockDrugDatabase: { name: string; defaultPrice: number }[] = [
    { name: 'آموکسی‌سیلین ۵۰۰', defaultPrice: 85000 },
    { name: 'متفورمین ۵۰۰', defaultPrice: 95000 },
    { name: 'لوزارتان ۵۰', defaultPrice: 120000 },
    { name: 'استامینوفن ۵۰۰', defaultPrice: 25000 },
    { name: 'ویتامین D', defaultPrice: 45000 },
    { name: 'ایبوپروفن ۴۰۰', defaultPrice: 35000 },
    { name: 'آسپرین ۸۰', defaultPrice: 20000 },
    { name: 'آتورواستاتین ۲۰', defaultPrice: 98000 },
    { name: 'امپرازول ۲۰', defaultPrice: 72000 },
    { name: 'سیتالوپرام ۲۰', defaultPrice: 110000 },
    { name: 'کلونازپام ۱', defaultPrice: 65000 },
    { name: 'سالبوتامول اسپری', defaultPrice: 185000 },
];

export const mockNursePersonnel: NursePersonnel[] = [
    {
        id: 1,
        firstName: 'مریم',
        lastName: 'حسینی',
        phone: '09121112233',
        nationalCode: '0012345678',
        gender: 'female',
        active: true,
    },
    {
        id: 2,
        firstName: 'رضا',
        lastName: 'کاظمی',
        phone: '09124445566',
        nationalCode: '0023456789',
        gender: 'male',
        active: true,
    },
    {
        id: 3,
        firstName: 'سمیه',
        lastName: 'جعفری',
        phone: '09127778899',
        nationalCode: '0034567890',
        gender: 'female',
        active: false,
    },
];

export const mockNurseServices: NurseService[] = [
    {
        id: 1,
        serviceKey: 'injection',
        name: 'تزریقات و سرم‌تراپی',
        price: 450000,
        description: 'تزریق دارو و سرم در منزل',
        active: true,
    },
    {
        id: 2,
        serviceKey: 'wound',
        name: 'پانسمان و مراقبت از زخم',
        price: 380000,
        active: true,
    },
    {
        id: 3,
        serviceKey: 'elderly',
        name: 'مراقبت از سالمند',
        price: 600000,
        description: 'ویزیت و مراقبت روزانه',
        active: true,
    },
    {
        id: 4,
        serviceKey: 'physio',
        name: 'فیزیوتراپی',
        price: 520000,
        active: false,
    },
];

export const mockNurseRequests: NurseRequest[] = [
    {
        id: 1,
        code: 'NRS-1404-001',
        patientName: 'اکبر فرهادی',
        patientPhone: '09152223344',
        serviceType: 'تزریقات و سرم‌تراپی',
        serviceKey: 'injection',
        address: 'تهران، تجریش، خیابان دربند',
        scheduledAt: '1404/03/20 — ۱۰:۰۰',
        scheduledDate: '1404/03/20',
        scheduledTime: '۱۰:۰۰',
        note: 'نیاز به تزریق ویتامین B12',
        amount: 450000,
        status: 'new',
        timeline: [{ at: '1404/03/19 18:00', label: 'درخواست ثبت شد' }],
    },
    {
        id: 2,
        code: 'NRS-1404-002',
        patientName: 'طاهره ملکی',
        patientPhone: '09155556677',
        serviceType: 'مراقبت از سالمند',
        serviceKey: 'elderly',
        address: 'تهران، نیاوران، کوچه گلستان',
        scheduledAt: '1404/03/20 — ۱۴:۰۰',
        scheduledDate: '1404/03/20',
        scheduledTime: '۱۴:۰۰',
        amount: 600000,
        status: 'accepted',
        timeline: [
            { at: '1404/03/19 15:00', label: 'درخواست ثبت شد' },
            { at: '1404/03/19 15:30', label: 'پذیرفته شد' },
        ],
    },
    {
        id: 3,
        code: 'NRS-1404-003',
        patientName: 'پریسا اکبری',
        patientPhone: '09158889900',
        serviceType: 'پانسمان زخم',
        serviceKey: 'wound',
        address: 'تهران، سعادت‌آباد، بلوار دریا',
        scheduledAt: '1404/03/19 — ۱۶:۰۰',
        scheduledDate: '1404/03/19',
        scheduledTime: '۱۶:۰۰',
        amount: 380000,
        status: 'in_progress',
        timeline: [
            { at: '1404/03/19 10:00', label: 'درخواست ثبت شد' },
            { at: '1404/03/19 10:15', label: 'پذیرفته شد' },
            { at: '1404/03/19 15:45', label: 'در راه' },
            { at: '1404/03/19 16:00', label: 'شروع خدمت' },
        ],
    },
    {
        id: 4,
        code: 'NRS-1404-004',
        patientName: 'حسین نوری',
        patientPhone: '09153334455',
        serviceType: 'فیزیوتراپی',
        serviceKey: 'physio',
        address: 'تهران، ونک، خیابان ملاصدرا',
        scheduledAt: '1404/03/21 — ۰۹:۰۰',
        scheduledDate: '1404/03/21',
        scheduledTime: '۰۹:۰۰',
        amount: 520000,
        status: 'accepted',
        timeline: [
            { at: '1404/03/18 11:00', label: 'درخواست ثبت شد' },
            { at: '1404/03/18 12:00', label: 'پذیرفته شد' },
        ],
    },
    {
        id: 5,
        code: 'NRS-1404-005',
        patientName: 'زهرا صادقی',
        patientPhone: '09156667788',
        serviceType: 'مراقبت از نوزاد',
        serviceKey: 'baby',
        address: 'تهران، پاسداران، بوستان هفتم',
        scheduledAt: '1404/03/21 — ۱۱:۰۰',
        scheduledDate: '1404/03/21',
        scheduledTime: '۱۱:۰۰',
        amount: 550000,
        status: 'new',
        timeline: [{ at: '1404/03/20 09:00', label: 'درخواست ثبت شد' }],
    },
    {
        id: 6,
        code: 'NRS-1404-006',
        patientName: 'محمد رضایی',
        patientPhone: '09159990011',
        serviceType: 'تزریقات و سرم‌تراپی',
        serviceKey: 'injection',
        address: 'تهران، شهرک غرب، فاز ۳',
        scheduledAt: '1404/03/22 — ۱۶:۰۰',
        scheduledDate: '1404/03/22',
        scheduledTime: '۱۶:۰۰',
        amount: 450000,
        status: 'completed',
        timeline: [
            { at: '1404/03/17 14:00', label: 'درخواست ثبت شد' },
            { at: '1404/03/17 15:00', label: 'پذیرفته شد' },
            { at: '1404/03/22 16:30', label: 'تکمیل شد' },
        ],
    },
    {
        id: 7,
        code: 'NRS-1404-007',
        patientName: 'فاطمه کریمی',
        patientPhone: '09151112233',
        serviceType: 'مراقبت عمومی',
        serviceKey: 'general',
        address: 'تهران، یوسف‌آباد، خیابان جهان‌آرا',
        scheduledAt: '1404/03/22 — ۱۰:۰۰',
        scheduledDate: '1404/03/22',
        scheduledTime: '۱۰:۰۰',
        amount: 400000,
        status: 'on_way',
        timeline: [
            { at: '1404/03/21 08:00', label: 'درخواست ثبت شد' },
            { at: '1404/03/21 09:00', label: 'پذیرفته شد' },
            { at: '1404/03/22 09:30', label: 'در راه' },
        ],
    },
    {
        id: 8,
        code: 'NRS-1404-008',
        patientName: 'علی احمدی',
        patientPhone: '09154445566',
        serviceType: 'پانسمان و مراقبت از زخم',
        serviceKey: 'wound',
        address: 'تهران، تهرانپارس، فلکه اول',
        scheduledAt: '1404/03/15 — ۱۴:۰۰',
        scheduledDate: '1404/03/15',
        scheduledTime: '۱۴:۰۰',
        amount: 380000,
        status: 'completed',
        timeline: [
            { at: '1404/03/14 10:00', label: 'درخواست ثبت شد' },
            { at: '1404/03/15 15:00', label: 'تکمیل شد' },
        ],
    },
    {
        id: 9,
        code: 'NRS-1404-009',
        patientName: 'نرگس جلالی',
        patientPhone: '09157778899',
        serviceType: 'مراقبت از سالمند',
        serviceKey: 'elderly',
        address: 'تهران، زعفرانیه، خیابان شهید',
        scheduledAt: '1404/03/25 — ۰۸:۰۰',
        scheduledDate: '1404/03/25',
        scheduledTime: '۰۸:۰۰',
        amount: 600000,
        status: 'new',
        timeline: [{ at: '1404/03/22 16:00', label: 'درخواست ثبت شد' }],
    },
    {
        id: 10,
        code: 'NRS-1404-010',
        patientName: 'رضا موسوی',
        patientPhone: '09158881234',
        serviceType: 'تزریقات و سرم‌تراپی',
        serviceKey: 'injection',
        address: 'تهران، جردن، خیابان ناهید',
        scheduledAt: '1404/03/25 — ۱۸:۰۰',
        scheduledDate: '1404/03/25',
        scheduledTime: '۱۸:۰۰',
        amount: 450000,
        status: 'canceled',
        timeline: [
            { at: '1404/03/20 12:00', label: 'درخواست ثبت شد' },
            { at: '1404/03/24 10:00', label: 'لغو شد' },
        ],
    },
    {
        id: 11,
        code: 'NRS-1404-011',
        patientName: 'سارا باقری',
        patientPhone: '09152225678',
        serviceType: 'فیزیوتراپی',
        serviceKey: 'physio',
        address: 'تهران، سعادت‌آباد، میدان کاج',
        scheduledAt: '1404/03/20 — ۱۸:۰۰',
        scheduledDate: '1404/03/20',
        scheduledTime: '۱۸:۰۰',
        amount: 520000,
        status: 'accepted',
        timeline: [
            { at: '1404/03/19 20:00', label: 'درخواست ثبت شد' },
            { at: '1404/03/19 21:00', label: 'پذیرفته شد' },
        ],
    },
    {
        id: 12,
        code: 'NRS-1404-012',
        patientName: 'امیر حسینی',
        patientPhone: '09153338901',
        serviceType: 'مراقبت عمومی',
        serviceKey: 'general',
        address: 'تهران، نارمک، میدان هفت‌حوض',
        scheduledAt: '1404/03/18 — ۱۲:۰۰',
        scheduledDate: '1404/03/18',
        scheduledTime: '۱۲:۰۰',
        amount: 400000,
        status: 'completed',
        timeline: [
            { at: '1404/03/17 09:00', label: 'درخواست ثبت شد' },
            { at: '1404/03/18 13:00', label: 'تکمیل شد' },
        ],
    },
];

export const mockReviews: ReviewItem[] = [
    { id: 1, patientName: 'علی محمدی', rating: 5, comment: 'خدمات عالی و سریع', date: '1404/03/15' },
    { id: 2, patientName: 'فاطمه کریمی', rating: 4, comment: 'زمان‌بندی دقیق بود', date: '1404/03/12', replied: 'ممنون از اعتماد شما' },
    { id: 3, patientName: 'حسین رضایی', rating: 3, comment: 'کمی تأخیر در پاسخگویی', date: '1404/03/10' },
];

export const mockFinanceRows: FinanceRow[] = [
    { id: 1, code: 'PAY-001', patientName: 'علی محمدی', amount: 200000, fee: 20000, net: 180000, method: 'آنلاین', date: '1404/03/19' },
    { id: 2, code: 'PAY-002', patientName: 'فاطمه کریمی', amount: 170000, fee: 17000, net: 153000, method: 'آنلاین', date: '1404/03/18' },
    { id: 3, code: 'PAY-003', patientName: 'حسین رضایی', amount: 320000, fee: 32000, net: 288000, method: 'نقدی', date: '1404/03/17' },
];

export const mockNotifications: NotificationItem[] = [
    { id: 1, title: 'درخواست جدید', body: 'یک درخواست جدید ثبت شد', time: '۵ دقیقه پیش', read: false },
    { id: 2, title: 'لغو درخواست', body: 'بیمار درخواست را لغو کرد', time: '۱ ساعت پیش', read: false },
    { id: 3, title: 'امتیاز جدید', body: 'امتیاز ۵ ستاره دریافت شد', time: 'دیروز', read: true },
];

export const mockSupportTickets: SupportTicket[] = [
    { id: 1, subject: 'مشکل در آپلود نتیجه', status: 'open', lastMessage: 'فایل PDF آپلود نمی‌شود', updatedAt: '1404/03/19' },
    { id: 2, subject: 'سؤال درباره کارمزد', status: 'answered', lastMessage: 'پاسخ پشتیبانی ارسال شد', updatedAt: '1404/03/17' },
];

export const mockChartData = [
    { day: 'شنبه', count: 4 },
    { day: 'یکشنبه', count: 7 },
    { day: 'دوشنبه', count: 5 },
    { day: 'سه‌شنبه', count: 9 },
    { day: 'چهارشنبه', count: 6 },
    { day: 'پنجشنبه', count: 8 },
    { day: 'جمعه', count: 3 },
];

export const nurseServiceLabels: Record<string, string> = {
    injection: 'تزریقات و سرم‌تراپی',
    wound: 'پانسمان و مراقبت از زخم',
    elderly: 'مراقبت از سالمند',
    baby: 'مراقبت از نوزاد',
    physio: 'فیزیوتراپی',
    general: 'مراقبت عمومی',
};

export const nurseBlockedSlots = ['1404/03/21 — صبح', '1404/03/22 — عصر'];

export const nurseMaxVisitsPerDay = 6;
