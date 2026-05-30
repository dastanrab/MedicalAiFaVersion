export type UserType = 'normal' | 'doctor' | 'pharmacy' | 'lab';
export type UserStatus = 'active' | 'inactive' | 'blocked';

export const userTypeLabels: Record<UserType, string> = {
    normal: 'کاربر عادی',
    doctor: 'دکتر',
    pharmacy: 'داروخانه',
    lab: 'آزمایشگاه',
};

export const userStatusLabels: Record<UserStatus, string> = {
    active: 'فعال',
    inactive: 'غیرفعال',
    blocked: 'مسدود',
};

export const userStatusStyles: Record<UserStatus, string> = {
    active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    inactive: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    blocked: 'bg-red-50 text-red-700 ring-red-600/20',
};

export const userTypeStyles: Record<UserType, string> = {
    normal: 'bg-slate-100 text-slate-700',
    doctor: 'bg-indigo-50 text-indigo-700',
    pharmacy: 'bg-teal-50 text-teal-700',
    lab: 'bg-amber-50 text-amber-700',
};

export interface AdminUserRow {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string | null;
    type: UserType;
    phone: string;
    status: UserStatus;
    province: string;
    city: string;
    isVerified: boolean;
}

export const mockUsers: AdminUserRow[] = [
    { id: 1, firstName: 'سارا', lastName: 'احمدی', type: 'normal', phone: '09121234567', status: 'active', avatar: 'https://i.pravatar.cc/100?img=1', province: 'تهران', city: 'تهران', isVerified: true },
    { id: 2, firstName: 'دکتر رضا', lastName: 'موسوی', type: 'doctor', phone: '09122345678', status: 'active', avatar: 'https://i.pravatar.cc/100?img=12', province: 'اصفهان', city: 'اصفهان', isVerified: true },
    { id: 3, firstName: 'داروخانه', lastName: 'مرکزی', type: 'pharmacy', phone: '09123456789', status: 'inactive', avatar: 'https://i.pravatar.cc/100?img=33', province: 'فارس', city: 'شیراز', isVerified: false },
    { id: 4, firstName: 'آزمایشگاه', lastName: 'پارس', type: 'lab', phone: '09124567890', status: 'active', avatar: 'https://i.pravatar.cc/100?img=45', province: 'خراسان رضوی', city: 'مشهد', isVerified: true },
    { id: 5, firstName: 'مریم', lastName: 'کریمی', type: 'normal', phone: '09125678901', status: 'blocked', avatar: 'https://i.pravatar.cc/100?img=5', province: 'تهران', city: 'ری', isVerified: false },
    { id: 6, firstName: 'دکتر نازنین', lastName: 'حسینی', type: 'doctor', phone: '09126789012', status: 'active', avatar: 'https://i.pravatar.cc/100?img=20', province: 'گیلان', city: 'رشت', isVerified: true },
    { id: 7, firstName: 'محمد', lastName: 'رحیمی', type: 'normal', phone: '09127890123', status: 'inactive', avatar: 'https://i.pravatar.cc/100?img=15', province: 'آذربایجان شرقی', city: 'تبریز', isVerified: false },
    { id: 8, firstName: 'داروخانه', lastName: 'سلامت', type: 'pharmacy', phone: '09128901234', status: 'active', avatar: 'https://i.pravatar.cc/100?img=60', province: 'خوزستان', city: 'اهواز', isVerified: true },
    { id: 9, firstName: 'علی', lastName: 'نوری', type: 'normal', phone: '09129012345', status: 'active', avatar: 'https://i.pravatar.cc/100?img=8', province: 'اصفهان', city: 'کاشان', isVerified: true },
    { id: 10, firstName: 'دکتر سینا', lastName: 'قاسمی', type: 'doctor', phone: '09120123456', status: 'active', avatar: 'https://i.pravatar.cc/100?img=11', province: 'تهران', city: 'تهران', isVerified: true },
    { id: 11, firstName: 'فاطمه', lastName: 'زارعی', type: 'normal', phone: '09131234567', status: 'blocked', avatar: 'https://i.pravatar.cc/100?img=9', province: 'فارس', city: 'مرودشت', isVerified: false },
    { id: 12, firstName: 'آزمایشگاه', lastName: 'نوین', type: 'lab', phone: '09132345678', status: 'inactive', avatar: 'https://i.pravatar.cc/100?img=50', province: 'گیلان', city: 'لاهیجان', isVerified: false },
    { id: 13, firstName: 'حسین', lastName: 'صادقی', type: 'normal', phone: '09133456789', status: 'active', avatar: 'https://i.pravatar.cc/100?img=13', province: 'خراسان رضوی', city: 'نیشابور', isVerified: true },
    { id: 14, firstName: 'داروخانه', lastName: 'شفا', type: 'pharmacy', phone: '09134567890', status: 'active', avatar: 'https://i.pravatar.cc/100?img=53', province: 'تهران', city: 'شهریار', isVerified: true },
    { id: 15, firstName: 'دکتر لیلا', lastName: 'اکبری', type: 'doctor', phone: '09135678901', status: 'inactive', avatar: 'https://i.pravatar.cc/100?img=24', province: 'آذربایجان شرقی', city: 'مراغه', isVerified: false },
];
