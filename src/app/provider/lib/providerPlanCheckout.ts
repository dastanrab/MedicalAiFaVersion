import type { PaymentGatewayId } from '../../data/paymentGateways';
import type { ProviderRole } from '../config/providerNav';
import type { BillingCycle, ProviderPlanId } from '../data/providerPlans';

export interface ProviderPlanCheckoutSession {
    role: ProviderRole;
    planId: ProviderPlanId;
    planName: string;
    cycle: BillingCycle;
    amount: number;
    payable: number;
    discount: number;
    coupon: string;
    gatewayId: PaymentGatewayId;
    authority: string;
    returnPath: string;
    createdAt: string;
    finalized?: boolean;
    resultStatus?: 'success' | 'failed' | 'cancelled';
    refId?: string;
}

const STORAGE_KEY = 'provider_plan_checkout_v1';

export function saveProviderPlanCheckout(session: ProviderPlanCheckoutSession): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadProviderPlanCheckout(): ProviderPlanCheckoutSession | null {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as ProviderPlanCheckoutSession;
        if (!parsed?.role || !parsed.planId || typeof parsed.amount !== 'number') return null;
        return parsed;
    } catch {
        return null;
    }
}

export function clearProviderPlanCheckout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
}

export function createProviderAuthority(gatewayId: string): string {
    const prefix = gatewayId === 'mellat' ? 'MLT' : gatewayId === 'saman' ? 'SMN' : 'PAY';
    return `${prefix}${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function createProviderRefId(): string {
    return String(Math.floor(100_000_000 + Math.random() * 899_999_999));
}
