import type { PaymentGatewayId } from '../../data/paymentGateways';
import type { ProviderRole } from '../config/providerNav';
import type { BillingCycle, ProviderPlanId } from '../data/providerPlans';

export type ProviderCheckoutKind = 'subscription' | 'vip_charge';

export interface ProviderPlanCheckoutSession {
    kind: ProviderCheckoutKind;
    role: ProviderRole;
    planName: string;
    amount: number;
    payable: number;
    discount: number;
    coupon: string;
    gatewayId: PaymentGatewayId;
    authority: string;
    returnPath: string;
    createdAt: string;
    planId?: ProviderPlanId;
    cycle?: BillingCycle;
    vipPackageId?: string;
    vipCredit?: number;
    vipGift?: number;
    finalized?: boolean;
    resultStatus?: 'success' | 'failed' | 'cancelled';
    refId?: string;
}

const STORAGE_KEY = 'provider_plan_checkout_v1';

export function isVipCheckout(session: ProviderPlanCheckoutSession | null | undefined): boolean {
    return session?.kind === 'vip_charge';
}

export function saveProviderPlanCheckout(session: ProviderPlanCheckoutSession): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadProviderPlanCheckout(): ProviderPlanCheckoutSession | null {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as ProviderPlanCheckoutSession;
        if (!parsed?.role || typeof parsed.amount !== 'number' || !parsed.planName) {
            return null;
        }
        const kind: ProviderCheckoutKind = parsed.kind ?? 'subscription';
        if (kind === 'subscription' && !parsed.planId) return null;
        if (kind === 'vip_charge' && !parsed.vipPackageId) return null;
        return { ...parsed, kind };
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
