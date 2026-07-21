export type PaymentGatewayId = 'mellat' | 'saman';

export interface PaymentGateway {
  id: PaymentGatewayId;
  name: string;
  nameEn: string;
  description: string;
  /** Sample / display-only — no real bank redirect */
  isSample: boolean;
  accentClass: string;
  selectedRingClass: string;
}

export type DiscountType = 'percent' | 'fixed';

export interface SampleDiscountCode {
  code: string;
  type: DiscountType;
  value: number;
  maxDiscount?: number;
  description: string;
}

export const paymentGateways: PaymentGateway[] = [
  {
    id: 'mellat',
    name: 'بانک ملت',
    nameEn: 'Mellat',
    description: 'درگاه پرداخت بانک ملت — فعلاً نمایشی',
    isSample: true,
    accentClass: 'from-red-600 to-rose-700',
    selectedRingClass: 'ring-red-400',
  },
  {
    id: 'saman',
    name: 'بانک سامان',
    nameEn: 'Saman',
    description: 'درگاه پرداخت بانک سامان — فعلاً نمایشی',
    isSample: true,
    accentClass: 'from-sky-600 to-blue-700',
    selectedRingClass: 'ring-sky-400',
  },
];

export const sampleDiscountCodes: SampleDiscountCode[] = [
  {
    code: 'HEALTH10',
    type: 'percent',
    value: 10,
    description: '۱۰٪ تخفیف خدمات سلامت',
  },
  {
    code: 'FIRST50',
    type: 'fixed',
    value: 50_000,
    description: '۵۰ هزار تومان تخفیف اولین پرداخت',
  },
  {
    code: 'WELCOME',
    type: 'percent',
    value: 15,
    maxDiscount: 100_000,
    description: '۱۵٪ تخفیف خوش‌آمدگویی (سقف ۱۰۰ هزار)',
  },
];

export function findDiscountCode(raw: string): SampleDiscountCode | null {
  const code = raw.trim().toUpperCase();
  if (!code) return null;
  return sampleDiscountCodes.find((c) => c.code === code) ?? null;
}

export function calcDiscountAmount(amount: number, discount: SampleDiscountCode): number {
  if (amount <= 0) return 0;
  if (discount.type === 'fixed') {
    return Math.min(discount.value, amount);
  }
  const percentAmount = Math.floor((amount * discount.value) / 100);
  if (discount.maxDiscount != null) {
    return Math.min(percentAmount, discount.maxDiscount, amount);
  }
  return Math.min(percentAmount, amount);
}

export function getGatewayById(id: string | null | undefined): PaymentGateway | undefined {
  return paymentGateways.find((g) => g.id === id);
}
