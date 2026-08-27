import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProviderRole } from '../config/providerNav';
import {
    cycleDurationMs,
    type BillingCycle,
    type ProviderPlanId,
} from '../data/providerPlans';

export type ProviderPlanPaymentStatus = 'success' | 'failed' | 'cancelled';

export interface ProviderSubscription {
    planId: ProviderPlanId;
    cycle: BillingCycle;
    startedAt: string;
    expiresAt: string | null;
}

export interface ProviderPlanPayment {
    id: string;
    planId: ProviderPlanId;
    planName: string;
    cycle: BillingCycle;
    amount: number;
    discount: number;
    payable: number;
    gatewayId: string;
    authority: string;
    refId?: string;
    status: ProviderPlanPaymentStatus;
    createdAt: string;
    failureReason?: string;
}

interface ProviderPlanState {
    subscriptions: Partial<Record<ProviderRole, ProviderSubscription>>;
    payments: Partial<Record<ProviderRole, ProviderPlanPayment[]>>;
    getSubscription: (role: ProviderRole) => ProviderSubscription;
    activatePlan: (role: ProviderRole, planId: ProviderPlanId, cycle: BillingCycle) => void;
    addPayment: (role: ProviderRole, payment: ProviderPlanPayment) => void;
    hasPayment: (role: ProviderRole, authority: string) => boolean;
}

export const DEFAULT_PROVIDER_SUBSCRIPTION: ProviderSubscription = {
    planId: 'starter',
    cycle: 'monthly',
    startedAt: new Date().toISOString(),
    expiresAt: null,
};

export const EMPTY_PROVIDER_PAYMENTS: ProviderPlanPayment[] = [];

export const useProviderPlanStore = create<ProviderPlanState>()(
    persist(
        (set, get) => ({
            subscriptions: {},
            payments: {},

            getSubscription: (role) => get().subscriptions[role] ?? DEFAULT_PROVIDER_SUBSCRIPTION,

            activatePlan: (role, planId, cycle) => {
                const now = Date.now();
                const expiresAt =
                    planId === 'starter' ? null : new Date(now + cycleDurationMs(cycle)).toISOString();

                set((state) => ({
                    subscriptions: {
                        ...state.subscriptions,
                        [role]: {
                            planId,
                            cycle: planId === 'starter' ? 'monthly' : cycle,
                            startedAt: new Date(now).toISOString(),
                            expiresAt,
                        },
                    },
                }));
            },

            addPayment: (role, payment) => {
                set((state) => {
                    const current = state.payments[role] ?? [];
                    if (current.some((item) => item.authority === payment.authority)) {
                        return state;
                    }
                    return {
                        payments: {
                            ...state.payments,
                            [role]: [payment, ...current].slice(0, 30),
                        },
                    };
                });
            },

            hasPayment: (role, authority) => {
                return (get().payments[role] ?? []).some((item) => item.authority === authority);
            },
        }),
        {
            name: 'provider-plan-storage',
            partialize: (state) => ({
                subscriptions: state.subscriptions,
                payments: state.payments,
            }),
        }
    )
);
