export type UserOrderStatus = 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled' | 'refunded';
export type UserTransactionType = 'payment' | 'wallet_charge' | 'refund' | 'subscription' | 'withdrawal';
export type UserTransactionStatus = 'success' | 'pending' | 'failed';

export interface UserWallet {
  balance: number;
  blockedBalance: number;
  currency: 'IRR';
  lastUpdated: string;
}

export interface UserOrder {
  id: number;
  code: string;
  title: string;
  serviceType: 'consultation' | 'lab' | 'pharmacy' | 'nurse' | 'subscription' | 'other';
  providerName?: string;
  amount: number;
  discount: number;
  finalAmount: number;
  status: UserOrderStatus;
  paymentMethod: 'wallet' | 'online' | 'mixed';
  createdAt: string;
  paidAt?: string;
}

export interface UserTransaction {
  id: number;
  code: string;
  type: UserTransactionType;
  title: string;
  amount: number;
  status: UserTransactionStatus;
  method: 'wallet' | 'card' | 'bank';
  reference?: string;
  orderCode?: string;
  createdAt: string;
}

export const mockUserWallet: UserWallet = {
  balance: 1_250_000,
  blockedBalance: 180_000,
  currency: 'IRR',
  lastUpdated: '۱۴۰۴/۱۲/۲۸ — ۱۰:۳۰',
};

export const mockUserOrders: UserOrder[] = [
  {
    id: 1,
    code: 'ORD-240128-001',
    title: 'مشاوره آنلاین — دکتر سارا محمدی',
    serviceType: 'consultation',
    providerName: 'دکتر سارا محمدی',
    amount: 350_000,
    discount: 0,
    finalAmount: 350_000,
    status: 'completed',
    paymentMethod: 'wallet',
    createdAt: '۱۴۰۴/۱۲/۲۵ — ۱۴:۲۰',
    paidAt: '۱۴۰۴/۱۲/۲۵ — ۱۴:۲۱',
  },
  {
    id: 2,
    code: 'ORD-240127-014',
    title: 'آزمایش خون کامل + قند ناشتا',
    serviceType: 'lab',
    providerName: 'آزمایشگاه پارس',
    amount: 890_000,
    discount: 90_000,
    finalAmount: 800_000,
    status: 'processing',
    paymentMethod: 'online',
    createdAt: '۱۴۰۴/۱۲/۲۷ — ۰۹:۱۵',
    paidAt: '۱۴۰۴/۱۲/۲۷ — ۰۹:۱۶',
  },
  {
    id: 3,
    code: 'ORD-240126-008',
    title: 'داروی نسخه دیجیتال',
    serviceType: 'pharmacy',
    providerName: 'داروخانه سلامت',
    amount: 420_000,
    discount: 20_000,
    finalAmount: 400_000,
    status: 'paid',
    paymentMethod: 'mixed',
    createdAt: '۱۴۰۴/۱۲/۲۶ — ۱۸:۴۰',
    paidAt: '۱۴۰۴/۱۲/۲۶ — ۱۸:۴۱',
  },
  {
    id: 4,
    code: 'ORD-240125-003',
    title: 'ویزیت پرستاری در منزل',
    serviceType: 'nurse',
    providerName: 'پرستار مریم کریمی',
    amount: 550_000,
    discount: 0,
    finalAmount: 550_000,
    status: 'pending',
    paymentMethod: 'wallet',
    createdAt: '۱۴۰۴/۱۲/۲۸ — ۱۱:۰۰',
  },
  {
    id: 5,
    code: 'ORD-240120-022',
    title: 'اشتراک پلن طلایی — یک ماهه',
    serviceType: 'subscription',
    amount: 299_000,
    discount: 0,
    finalAmount: 299_000,
    status: 'completed',
    paymentMethod: 'online',
    createdAt: '۱۴۰۴/۱۲/۲۰ — ۱۰:۰۰',
    paidAt: '۱۴۰۴/۱۲/۲۰ — ۱۰:۰۱',
  },
  {
    id: 6,
    code: 'ORD-240118-011',
    title: 'مشاوره آنلاین — دکتر علی رضایی',
    serviceType: 'consultation',
    providerName: 'دکتر علی رضایی',
    amount: 280_000,
    discount: 0,
    finalAmount: 280_000,
    status: 'cancelled',
    paymentMethod: 'wallet',
    createdAt: '۱۴۰۴/۱۲/۱۸ — ۱۶:۳۰',
  },
  {
    id: 7,
    code: 'ORD-240115-005',
    title: 'آزمایش تیروئید',
    serviceType: 'lab',
    providerName: 'آزمایشگاه مهر',
    amount: 320_000,
    discount: 0,
    finalAmount: 320_000,
    status: 'refunded',
    paymentMethod: 'online',
    createdAt: '۱۴۰۴/۱۲/۱۵ — ۰۸:۴۵',
    paidAt: '۱۴۰۴/۱۲/۱۵ — ۰۸:۴۶',
  },
];

export const mockUserTransactions: UserTransaction[] = [
  {
    id: 1,
    code: 'TXN-982341',
    type: 'wallet_charge',
    title: 'شارژ کیف پول',
    amount: 2_000_000,
    status: 'success',
    method: 'card',
    reference: 'REF-88421',
    createdAt: '۱۴۰۴/۱۲/۲۴ — ۱۲:۰۰',
  },
  {
    id: 2,
    code: 'TXN-982340',
    type: 'payment',
    title: 'پرداخت سفارش ORD-240127-014',
    amount: -800_000,
    status: 'success',
    method: 'card',
    orderCode: 'ORD-240127-014',
    reference: 'REF-88420',
    createdAt: '۱۴۰۴/۱۲/۲۷ — ۰۹:۱۶',
  },
  {
    id: 3,
    code: 'TXN-982339',
    type: 'payment',
    title: 'پرداخت سفارش ORD-240126-008',
    amount: -400_000,
    status: 'success',
    method: 'wallet',
    orderCode: 'ORD-240126-008',
    createdAt: '۱۴۰۴/۱۲/۲۶ — ۱۸:۴۱',
  },
  {
    id: 4,
    code: 'TXN-982338',
    type: 'payment',
    title: 'پرداخت سفارش ORD-240125-001',
    amount: -350_000,
    status: 'success',
    method: 'wallet',
    orderCode: 'ORD-240128-001',
    createdAt: '۱۴۰۴/۱۲/۲۵ — ۱۴:۲۱',
  },
  {
    id: 5,
    code: 'TXN-982337',
    type: 'subscription',
    title: 'خرید اشتراک پلن طلایی',
    amount: -299_000,
    status: 'success',
    method: 'card',
    orderCode: 'ORD-240120-022',
    reference: 'REF-88390',
    createdAt: '۱۴۰۴/۱۲/۲۰ — ۱۰:۰۱',
  },
  {
    id: 6,
    code: 'TXN-982336',
    type: 'refund',
    title: 'بازگشت وجه — ORD-240115-005',
    amount: 320_000,
    status: 'success',
    method: 'wallet',
    orderCode: 'ORD-240115-005',
    createdAt: '۱۴۰۴/۱۲/۱۶ — ۱۱:۳۰',
  },
  {
    id: 7,
    code: 'TXN-982335',
    type: 'wallet_charge',
    title: 'شارژ کیف پول',
    amount: 1_500_000,
    status: 'pending',
    method: 'bank',
    reference: 'REF-88350',
    createdAt: '۱۴۰۴/۱۲/۲۸ — ۱۰:۱۵',
  },
  {
    id: 8,
    code: 'TXN-982334',
    type: 'payment',
    title: 'پرداخت سفارش ORD-240118-011',
    amount: -280_000,
    status: 'failed',
    method: 'card',
    orderCode: 'ORD-240118-011',
    createdAt: '۱۴۰۴/۱۲/۱۸ — ۱۶:۳۱',
  },
];

export const orderStatusLabels: Record<UserOrderStatus, string> = {
  pending: 'در انتظار پرداخت',
  paid: 'پرداخت شده',
  processing: 'در حال انجام',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
  refunded: 'مسترد شده',
};

export const transactionTypeLabels: Record<UserTransactionType, string> = {
  payment: 'پرداخت',
  wallet_charge: 'شارژ کیف پول',
  refund: 'بازگشت وجه',
  subscription: 'اشتراک',
  withdrawal: 'برداشت',
};

export const transactionStatusLabels: Record<UserTransactionStatus, string> = {
  success: 'موفق',
  pending: 'در انتظار',
  failed: 'ناموفق',
};

export const serviceTypeLabels: Record<UserOrder['serviceType'], string> = {
  consultation: 'مشاوره',
  lab: 'آزمایش',
  pharmacy: 'داروخانه',
  nurse: 'پرستاری',
  subscription: 'اشتراک',
  other: 'سایر',
};

export function formatPrice(amount: number): string {
  return Math.abs(amount).toLocaleString('fa-IR');
}
