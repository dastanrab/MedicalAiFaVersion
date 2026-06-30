export interface DoctorProfile {
    id: string;
    name: string;
    specialty: string;
    medicalCode: string;
    rating: number;
    clinicAddress: string;
    phone: string;
    email: string;
    bio: string;
}

export type DoctorAppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'canceled';
export type DoctorAppointmentFilter = 'today' | 'upcoming' | 'completed' | 'canceled';
export type DoctorVisitType = 'in_person' | 'online' | 'home_visit';

export interface DoctorAppointment {
    id: number;
    patientId: number;
    patientName: string;
    patientPhone: string;
    date: string;
    time: string;
    visitType: DoctorVisitType;
    status: DoctorAppointmentStatus;
    notes?: string;
}

export interface DoctorPatient {
    id: number;
    name: string;
    phone: string;
    nationalId: string;
    age: number;
    gender: 'male' | 'female';
    lastVisit: string;
    visitCount: number;
    bloodType?: string;
    allergies?: string[];
    chronicConditions?: string[];
}

export interface DoctorPrescription {
    id: number;
    patientId: number;
    patientName: string;
    date: string;
    diagnosis: string;
    medicines: { name: string; dosage: string; duration: string }[];
    doctorNotes: string;
}

export interface DoctorConsultation {
    id: number;
    patientId: number;
    patientName: string;
    lastMessage: string;
    lastMessageAt: string;
    status: 'active' | 'pending' | 'closed';
    unreadCount: number;
}

export interface DoctorFinanceTransaction {
    id: number;
    code: string;
    patientName: string;
    amount: number;
    fee: number;
    net: number;
    method: string;
    date: string;
    type: 'income' | 'settlement';
}

export interface DoctorReview {
    id: number;
    patientName: string;
    rating: number;
    comment: string;
    date: string;
    replied?: string;
}

export interface DoctorActivity {
    id: number;
    label: string;
    at: string;
}

export const mockDoctorProfile: DoctorProfile = {
    id: 'doc-001',
    name: 'دکتر سارا احمدی',
    specialty: 'متخصص داخلی',
    medicalCode: '۱۲۳۴۵۶',
    rating: 4.8,
    clinicAddress: 'تهران، خیابان ولیعصر، پلاک ۲۴۵، طبقه ۳',
    phone: '۰۲۱-۸۸۷۷۶۶۵۵',
    email: 'doctor@test.com',
    bio: 'فارغ‌التحصیل دانشگاه علوم پزشکی تهران با ۱۵ سال سابقه طبابت.',
};

export const mockDoctorAppointments: DoctorAppointment[] = [
    { id: 1, patientId: 1, patientName: 'علی محمدی', patientPhone: '09121234567', date: '1404/04/10', time: '۰۹:۰۰', visitType: 'in_person', status: 'scheduled' },
    { id: 2, patientId: 2, patientName: 'فاطمه کریمی', patientPhone: '09129876543', date: '1404/04/10', time: '۱۰:۳۰', visitType: 'online', status: 'in_progress' },
    { id: 3, patientId: 3, patientName: 'حسین رضایی', patientPhone: '09131112233', date: '1404/04/10', time: '۱۱:۰۰', visitType: 'in_person', status: 'scheduled' },
    { id: 4, patientId: 4, patientName: 'زهرا موسوی', patientPhone: '09145556677', date: '1404/04/11', time: '۰۸:۳۰', visitType: 'home_visit', status: 'scheduled' },
    { id: 5, patientId: 5, patientName: 'محمد حسینی', patientPhone: '09167778899', date: '1404/04/11', time: '۱۴:۰۰', visitType: 'in_person', status: 'scheduled' },
    { id: 6, patientId: 6, patientName: 'مریم نوری', patientPhone: '09188889900', date: '1404/04/09', time: '۱۶:۰۰', visitType: 'online', status: 'completed', notes: 'فشار خون کنترل شده' },
    { id: 7, patientId: 7, patientName: 'رضا اکبری', patientPhone: '09199990011', date: '1404/04/08', time: '۱۰:۰۰', visitType: 'in_person', status: 'completed' },
    { id: 8, patientId: 8, patientName: 'سمیه جعفری', patientPhone: '09112223344', date: '1404/04/07', time: '۱۱:۳۰', visitType: 'in_person', status: 'completed' },
    { id: 9, patientId: 9, patientName: 'امیر صادقی', patientPhone: '09133334455', date: '1404/04/06', time: '۰۹:۳۰', visitType: 'online', status: 'canceled' },
    { id: 10, patientId: 10, patientName: 'نرگس باقری', patientPhone: '09144445566', date: '1404/04/12', time: '۱۵:۰۰', visitType: 'in_person', status: 'scheduled' },
    { id: 11, patientId: 1, patientName: 'علی محمدی', patientPhone: '09121234567', date: '1404/03/25', time: '۱۰:۰۰', visitType: 'in_person', status: 'completed' },
    { id: 12, patientId: 2, patientName: 'فاطمه کریمی', patientPhone: '09129876543', date: '1404/03/20', time: '۱۴:۳۰', visitType: 'online', status: 'completed' },
];

export const mockDoctorPatients: DoctorPatient[] = [
    { id: 1, name: 'علی محمدی', phone: '09121234567', nationalId: '۰۰۱۲۳۴۵۶۷۸', age: 42, gender: 'male', lastVisit: '1404/03/25', visitCount: 8, bloodType: 'A+', allergies: ['پنی‌سیلین'], chronicConditions: ['فشار خون'] },
    { id: 2, name: 'فاطمه کریمی', phone: '09129876543', nationalId: '۰۰۲۳۴۵۶۷۸۹', age: 35, gender: 'female', lastVisit: '1404/03/20', visitCount: 5, bloodType: 'O+', chronicConditions: ['دیابت نوع ۲'] },
    { id: 3, name: 'حسین رضایی', phone: '09131112233', nationalId: '۰۰۳۴۵۶۷۸۹۰', age: 58, gender: 'male', lastVisit: '1404/03/15', visitCount: 12, bloodType: 'B+', chronicConditions: ['آرتروز'] },
    { id: 4, name: 'زهرا موسوی', phone: '09145556677', nationalId: '۰۰۴۵۶۷۸۹۰۱', age: 29, gender: 'female', lastVisit: '1404/03/10', visitCount: 3 },
    { id: 5, name: 'محمد حسینی', phone: '09167778899', nationalId: '۰۰۵۶۷۸۹۰۱۲', age: 45, gender: 'male', lastVisit: '1404/03/08', visitCount: 6, allergies: ['آسپرین'] },
    { id: 6, name: 'مریم نوری', phone: '09188889900', nationalId: '۰۰۶۷۸۹۰۱۲۳', age: 31, gender: 'female', lastVisit: '1404/04/09', visitCount: 4 },
    { id: 7, name: 'رضا اکبری', phone: '09199990011', nationalId: '۰۰۷۸۹۰۱۲۳۴', age: 52, gender: 'male', lastVisit: '1404/04/08', visitCount: 9, chronicConditions: ['کلسترول بالا'] },
    { id: 8, name: 'سمیه جعفری', phone: '09112223344', nationalId: '۰۰۸۹۰۱۲۳۴۵', age: 38, gender: 'female', lastVisit: '1404/04/07', visitCount: 2 },
    { id: 9, name: 'امیر صادقی', phone: '09133334455', nationalId: '۰۰۹۰۱۲۳۴۵۶', age: 27, gender: 'male', lastVisit: '1404/02/28', visitCount: 1 },
    { id: 10, name: 'نرگس باقری', phone: '09144445566', nationalId: '۰۱۰۱۲۳۴۵۶۷', age: 33, gender: 'female', lastVisit: '1404/03/01', visitCount: 7 },
];

export const mockDoctorPrescriptions: DoctorPrescription[] = [
    {
        id: 1,
        patientId: 1,
        patientName: 'علی محمدی',
        date: '1404/03/25',
        diagnosis: 'فشار خون بالا',
        medicines: [
            { name: 'لوزارتان ۵۰mg', dosage: '۱ عدد صبح', duration: '۳۰ روز' },
            { name: 'آملودیپین ۵mg', dosage: '۱ عدد شب', duration: '۳۰ روز' },
        ],
        doctorNotes: 'کنترل فشار خون هفتگی توصیه می‌شود.',
    },
    {
        id: 2,
        patientId: 2,
        patientName: 'فاطمه کریمی',
        date: '1404/03/20',
        diagnosis: 'دیابت نوع ۲',
        medicines: [
            { name: 'متفورمین ۵۰۰mg', dosage: '۱ عدد صبح و شب', duration: '۶۰ روز' },
        ],
        doctorNotes: 'رژیم غذایی کم قند رعایت شود.',
    },
    {
        id: 3,
        patientId: 3,
        patientName: 'حسین رضایی',
        date: '1404/03/15',
        diagnosis: 'درد مفاصل',
        medicines: [
            { name: 'ایبوپروفن ۴۰۰mg', dosage: 'در صورت نیاز', duration: '۱۴ روز' },
            { name: 'گلوکوزامین', dosage: '۱ عدد روزانه', duration: '۹۰ روز' },
        ],
        doctorNotes: 'ورزش سبک توصیه می‌شود.',
    },
    {
        id: 4,
        patientId: 6,
        patientName: 'مریم نوری',
        date: '1404/04/09',
        diagnosis: 'سرماخوردگی',
        medicines: [
            { name: 'استامینوفن ۵۰۰mg', dosage: 'هر ۸ ساعت', duration: '۵ روز' },
        ],
        doctorNotes: 'استراحت و مایعات فراوان.',
    },
];

export const mockDoctorConsultations: DoctorConsultation[] = [
    { id: 1, patientId: 2, patientName: 'فاطمه کریمی', lastMessage: 'دکتر جان، قند خونم بالا رفته', lastMessageAt: '۱۴:۳۰', status: 'active', unreadCount: 2 },
    { id: 2, patientId: 1, patientName: 'علی محمدی', lastMessage: 'نتیجه آزمایش را فرستادم', lastMessageAt: '۱۲:۱۵', status: 'active', unreadCount: 1 },
    { id: 3, patientId: 5, patientName: 'محمد حسینی', lastMessage: 'درخواست مشاوره آنلاین', lastMessageAt: '۱۰:۰۰', status: 'pending', unreadCount: 1 },
    { id: 4, patientId: 7, patientName: 'رضا اکبری', lastMessage: 'ممنون از راهنمایی شما', lastMessageAt: 'دیروز', status: 'closed', unreadCount: 0 },
    { id: 5, patientId: 10, patientName: 'نرگس باقری', lastMessage: 'سوال درباره دارو', lastMessageAt: 'دیروز', status: 'active', unreadCount: 0 },
];

export const mockDoctorFinanceTransactions: DoctorFinanceTransaction[] = [
    { id: 1, code: 'DOC-001', patientName: 'علی محمدی', amount: 350000, fee: 35000, net: 315000, method: 'آنلاین', date: '1404/04/10', type: 'income' },
    { id: 2, code: 'DOC-002', patientName: 'فاطمه کریمی', amount: 250000, fee: 25000, net: 225000, method: 'آنلاین', date: '1404/04/09', type: 'income' },
    { id: 3, code: 'DOC-003', patientName: 'حسین رضایی', amount: 400000, fee: 40000, net: 360000, method: 'نقدی', date: '1404/04/08', type: 'income' },
    { id: 4, code: 'DOC-004', patientName: 'مریم نوری', amount: 200000, fee: 20000, net: 180000, method: 'آنلاین', date: '1404/04/07', type: 'income' },
    { id: 5, code: 'SET-001', patientName: '—', amount: 2500000, fee: 0, net: 2500000, method: 'واریز بانکی', date: '1404/04/05', type: 'settlement' },
    { id: 6, code: 'DOC-005', patientName: 'رضا اکبری', amount: 350000, fee: 35000, net: 315000, method: 'آنلاین', date: '1404/04/04', type: 'income' },
];

export const mockDoctorReviews: DoctorReview[] = [
    { id: 1, patientName: 'علی محمدی', rating: 5, comment: 'پزشک بسیار دلسوز و حرفه‌ای', date: '1404/04/01' },
    { id: 2, patientName: 'فاطمه کریمی', rating: 5, comment: 'توضیحات کامل و دقیق', date: '1404/03/28', replied: 'ممنون از اعتماد شما' },
    { id: 3, patientName: 'حسین رضایی', rating: 4, comment: 'زمان انتظار کمی طولانی بود', date: '1404/03/20' },
    { id: 4, patientName: 'مریم نوری', rating: 5, comment: 'مشاوره آنلاین عالی بود', date: '1404/03/15' },
];

export const mockDoctorActivities: DoctorActivity[] = [
    { id: 1, label: 'نوبت جدید — علی محمدی', at: '۱۰ دقیقه پیش' },
    { id: 2, label: 'نسخه صادر شد — فاطمه کریمی', at: '۳۰ دقیقه پیش' },
    { id: 3, label: 'مشاوره آنلاین شروع شد — مریم نوری', at: '۱ ساعت پیش' },
    { id: 4, label: 'ویزیت تکمیل شد — حسین رضایی', at: '۲ ساعت پیش' },
    { id: 5, label: 'نظر جدید دریافت شد — امتیاز ۵', at: 'دیروز' },
];

export const mockDoctorRevenueChart = [
    { day: 'شنبه', amount: 1200000, visits: 6 },
    { day: 'یکشنبه', amount: 1850000, visits: 9 },
    { day: 'دوشنبه', amount: 1500000, visits: 7 },
    { day: 'سه‌شنبه', amount: 2100000, visits: 11 },
    { day: 'چهارشنبه', amount: 1750000, visits: 8 },
    { day: 'پنجشنبه', amount: 900000, visits: 4 },
    { day: 'جمعه', amount: 600000, visits: 3 },
];

export const mockDoctorWorkingHours = ['۰۸:۰۰', '۰۹:۰۰', '۱۰:۰۰', '۱۱:۰۰', '۱۴:۰۰', '۱۵:۰۰', '۱۶:۰۰', '۱۷:۰۰'];

export const doctorVisitTypeLabels: Record<DoctorVisitType, string> = {
    in_person: 'حضوری — مطب',
    online: 'آنلاین',
    home_visit: 'ویزیت در منزل',
};

export function getPatientById(id: number): DoctorPatient | undefined {
    return mockDoctorPatients.find((p) => p.id === id);
}

export function getAppointmentById(id: number): DoctorAppointment | undefined {
    return mockDoctorAppointments.find((a) => a.id === id);
}

export function getPatientAppointments(patientId: number): DoctorAppointment[] {
    return mockDoctorAppointments.filter((a) => a.patientId === patientId);
}

export function getPatientPrescriptions(patientId: number): DoctorPrescription[] {
    return mockDoctorPrescriptions.filter((p) => p.patientId === patientId);
}
