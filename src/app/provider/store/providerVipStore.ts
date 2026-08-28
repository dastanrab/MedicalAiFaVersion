import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProviderRole } from '../config/providerNav';
import {
    getSuggestedVipKeywords,
    getUnlockedVipLevel,
    type VipKeywordOption,
    type VipLevel,
} from '../data/providerVip';
import type { ProviderPlanPaymentStatus } from './providerPlanStore';

export interface VipSelectedKeyword extends VipKeywordOption {
    id: string;
    addedAt: string;
}

export interface VipConsumptionPoint {
    date: string;
    amount: number;
}

export interface VipChargeRecord {
    id: string;
    packageId: string;
    packageName: string;
    payAmount: number;
    giftAmount: number;
    credit: number;
    discount: number;
    payable: number;
    gatewayId: string;
    authority: string;
    refId?: string;
    status: ProviderPlanPaymentStatus;
    createdAt: string;
    failureReason?: string;
}

export interface VipAccount {
    balance: number;
    level: VipLevel;
    keywords: VipSelectedKeyword[];
    consumption: VipConsumptionPoint[];
    charges: VipChargeRecord[];
}

interface ProviderVipState {
    accounts: Partial<Record<ProviderRole, VipAccount>>;
    getAccount: (role: ProviderRole) => VipAccount;
    ensureAccount: (role: ProviderRole) => void;
    addKeyword: (role: ProviderRole, option: VipKeywordOption) => boolean;
    removeKeyword: (role: ProviderRole, id: string) => void;
    setLevel: (role: ProviderRole, level: VipLevel) => boolean;
    creditBalance: (role: ProviderRole, amount: number) => void;
    addCharge: (role: ProviderRole, charge: VipChargeRecord) => void;
    hasCharge: (role: ProviderRole, authority: string) => boolean;
}

function buildMockConsumption(): VipConsumptionPoint[] {
    const points: VipConsumptionPoint[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i -= 1) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        points.push({
            date: d.toISOString(),
            amount: 80_000 + ((13 - i) * 19_700 + i * 11_300) % 160_000,
        });
    }
    return points;
}

export function createDefaultVipAccount(role: ProviderRole): VipAccount {
    const suggested = getSuggestedVipKeywords(role).slice(0, 2);
    const keywords = suggested.map((item, index) => ({
        ...item,
        id: `kw-${role}-${index + 1}`,
        addedAt: new Date().toISOString(),
    }));
    const balance = 2_450_000;
    return {
        balance,
        level: getUnlockedVipLevel(balance),
        keywords,
        consumption: buildMockConsumption(),
        charges: [],
    };
}

export const EMPTY_VIP_CHARGES: VipChargeRecord[] = [];

function withAccount(
    accounts: Partial<Record<ProviderRole, VipAccount>>,
    role: ProviderRole,
    updater: (current: VipAccount) => VipAccount
): Partial<Record<ProviderRole, VipAccount>> {
    const current = accounts[role] ?? createDefaultVipAccount(role);
    return { ...accounts, [role]: updater(current) };
}

export const useProviderVipStore = create<ProviderVipState>()(
    persist(
        (set, get) => ({
            accounts: {},

            getAccount: (role) => get().accounts[role] ?? createDefaultVipAccount(role),

            addKeyword: (role, option) => {
                const keyword = option.keyword.trim();
                if (!keyword) return false;
                const current = get().accounts[role] ?? createDefaultVipAccount(role);
                if (current.keywords.some((item) => item.keyword === keyword)) return false;
                set((state) => ({
                    accounts: withAccount(state.accounts, role, (account) => ({
                        ...account,
                        keywords: [
                            {
                                ...option,
                                keyword,
                                id: `kw-${Date.now()}`,
                                addedAt: new Date().toISOString(),
                            },
                            ...account.keywords,
                        ],
                    })),
                }));
                return true;
            },

            removeKeyword: (role, id) => {
                set((state) => ({
                    accounts: withAccount(state.accounts, role, (account) => ({
                        ...account,
                        keywords: account.keywords.filter((item) => item.id !== id),
                    })),
                }));
            },

            setLevel: (role, level) => {
                const current = get().accounts[role] ?? createDefaultVipAccount(role);
                if (level > getUnlockedVipLevel(current.balance)) return false;
                set((state) => ({
                    accounts: withAccount(state.accounts, role, (account) => ({
                        ...account,
                        level,
                    })),
                }));
                return true;
            },

            creditBalance: (role, amount) => {
                if (amount <= 0) return;
                set((state) => ({
                    accounts: withAccount(state.accounts, role, (account) => {
                        const balance = account.balance + amount;
                        return {
                            ...account,
                            balance,
                            level: Math.max(account.level, getUnlockedVipLevel(balance)) as VipLevel,
                        };
                    }),
                }));
            },

            addCharge: (role, charge) => {
                set((state) => ({
                    accounts: withAccount(state.accounts, role, (account) => {
                        if (account.charges.some((item) => item.authority === charge.authority)) {
                            return account;
                        }
                        return {
                            ...account,
                            charges: [charge, ...account.charges].slice(0, 30),
                        };
                    }),
                }));
            },

            hasCharge: (role, authority) => {
                const account = get().accounts[role];
                return (account?.charges ?? []).some((item) => item.authority === authority);
            },

            ensureAccount: (role) => {
                if (get().accounts[role]) return;
                set((state) => ({
                    accounts: {
                        ...state.accounts,
                        [role]: createDefaultVipAccount(role),
                    },
                }));
            },
        }),
        {
            name: 'provider-vip-storage',
            partialize: (state) => ({ accounts: state.accounts }),
        }
    )
);
