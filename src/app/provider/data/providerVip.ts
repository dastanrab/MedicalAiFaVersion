import type { ProviderRole } from '../config/providerNav';

export type VipLevel = 1 | 2 | 3 | 4 | 5;

export interface VipKeywordOption {
    keyword: string;
    clickTariff: number;
    impressionTariff: number;
}

export interface VipChargePackage {
    id: string;
    payAmount: number;
    giftAmount: number;
    popular?: boolean;
}

export const vipChargePackages: VipChargePackage[] = [
    { id: 'vip-5', payAmount: 5_000_000, giftAmount: 2_000_000 },
    { id: 'vip-10', payAmount: 10_000_000, giftAmount: 5_000_000, popular: true },
    { id: 'vip-20', payAmount: 20_000_000, giftAmount: 12_000_000 },
    { id: 'vip-39', payAmount: 39_000_000, giftAmount: 26_000_000 },
];

export const vipLevels: { level: VipLevel; label: string; minBalance: number; rankBoost: string }[] = [
    { level: 1, label: 'LEVEL 1', minBalance: 0, rankBoost: 'نمایش عادی در نتایج' },
    { level: 2, label: 'LEVEL 2', minBalance: 2_000_000, rankBoost: 'اولویت نسبی در شهر شما' },
    { level: 3, label: 'LEVEL 3', minBalance: 5_000_000, rankBoost: 'نمایش بالاتر برای کلمات کلیدی' },
    { level: 4, label: 'LEVEL 4', minBalance: 10_000_000, rankBoost: 'رتبه نزدیک به صدر نتایج' },
    { level: 5, label: 'LEVEL 5', minBalance: 20_000_000, rankBoost: 'بالاترین اولویت جستجو' },
];

const SUGGESTED: Record<ProviderRole, VipKeywordOption[]> = {
    doctor: [
        { keyword: 'زنان و زایمان', clickTariff: 58_990, impressionTariff: 365 },
        { keyword: 'لبیوپلاستی', clickTariff: 58_990, impressionTariff: 365 },
        { keyword: 'مشاوره آنلاین پزشکی', clickTariff: 42_500, impressionTariff: 290 },
        { keyword: 'ویزیت در مطب', clickTariff: 36_800, impressionTariff: 240 },
        { keyword: 'پزشک عمومی', clickTariff: 31_200, impressionTariff: 210 },
    ],
    lab: [
        { keyword: 'آزمایش خون', clickTariff: 41_200, impressionTariff: 280 },
        { keyword: 'چکاپ کامل', clickTariff: 49_700, impressionTariff: 320 },
        { keyword: 'آزمایش تیروئید', clickTariff: 38_400, impressionTariff: 250 },
        { keyword: 'نمونه‌گیری در منزل', clickTariff: 44_900, impressionTariff: 300 },
        { keyword: 'آزمایش قند', clickTariff: 33_100, impressionTariff: 220 },
    ],
    pharmacy: [
        { keyword: 'داروخانه شبانه‌روزی', clickTariff: 39_800, impressionTariff: 270 },
        { keyword: 'نسخه الکترونیک', clickTariff: 35_600, impressionTariff: 230 },
        { keyword: 'مکمل غذایی', clickTariff: 29_400, impressionTariff: 190 },
        { keyword: 'داروی کمیاب', clickTariff: 47_200, impressionTariff: 310 },
        { keyword: 'ارسال دارو', clickTariff: 32_800, impressionTariff: 210 },
    ],
    nurse: [
        { keyword: 'پرستاری در منزل', clickTariff: 45_300, impressionTariff: 300 },
        { keyword: 'تزریقات در منزل', clickTariff: 38_900, impressionTariff: 260 },
        { keyword: 'سرم‌تراپی', clickTariff: 41_700, impressionTariff: 280 },
        { keyword: 'مراقبت سالمند', clickTariff: 36_200, impressionTariff: 240 },
        { keyword: 'پانسمان زخم', clickTariff: 34_500, impressionTariff: 225 },
    ],
};

export const vipCategoryClickTariff: Record<ProviderRole, number> = {
    doctor: 49_700,
    lab: 41_200,
    pharmacy: 35_600,
    nurse: 38_900,
};

export const vipDefaultImpressionTariff = 365;

export function getSuggestedVipKeywords(role: ProviderRole): VipKeywordOption[] {
    return SUGGESTED[role];
}

export function getVipPackage(id: string | null | undefined): VipChargePackage | undefined {
    if (!id) return undefined;
    return vipChargePackages.find((item) => item.id === id);
}

export function getVipLevelMeta(level: VipLevel) {
    return vipLevels.find((item) => item.level === level) ?? vipLevels[0];
}

export function getUnlockedVipLevel(balance: number): VipLevel {
    let unlocked: VipLevel = 1;
    for (const item of vipLevels) {
        if (balance >= item.minBalance) unlocked = item.level;
    }
    return unlocked;
}

export function vipPackageCredit(pack: VipChargePackage): number {
    return pack.payAmount + pack.giftAmount;
}

export function makeCustomVipKeyword(role: ProviderRole, keyword: string): VipKeywordOption {
    return {
        keyword: keyword.trim(),
        clickTariff: vipCategoryClickTariff[role],
        impressionTariff: vipDefaultImpressionTariff,
    };
}
