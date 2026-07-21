export type CheckoutKind = 'order' | 'reservation' | 'wallet_charge';

export interface CheckoutSession {
  kind: CheckoutKind;
  title: string;
  subtitle?: string;
  providerName?: string;
  amount: number;
  serviceTypeLabel?: string;
  returnPath: string;
  orderId?: number;
  orderCode?: string;
  reservationToken?: string;
  doctorId?: string;
  slotLabel?: string;
  expiresAt?: string;
}

const STORAGE_KEY = 'medical_checkout_session_v1';

export function saveCheckoutSession(session: CheckoutSession): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadCheckoutSession(): CheckoutSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CheckoutSession;
    if (!parsed?.kind || typeof parsed.amount !== 'number' || !parsed.title) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearCheckoutSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function createMockAuthority(gatewayId: string): string {
  const prefix = gatewayId === 'mellat' ? 'MLT' : gatewayId === 'saman' ? 'SMN' : 'SMP';
  return `${prefix}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function createMockRefId(): string {
  return String(Math.floor(100_000_000 + Math.random() * 899_999_999));
}
