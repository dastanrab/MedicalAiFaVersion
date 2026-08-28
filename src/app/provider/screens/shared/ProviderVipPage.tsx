import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
    Line,
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '../../../components/ui/chart';
import { Plus, Sparkles, Trash2, Wallet } from 'lucide-react';
import { PageHeader, formatPrice } from '../../components';
import { ProviderModal } from '../../components/ProviderModal';
import type { ProviderRole } from '../../config/providerNav';
import { providerPath } from '../../config/providerNav';
import { providerRoleLabels } from '../../config/providerTheme';
import {
    getSuggestedVipKeywords,
    getUnlockedVipLevel,
    getVipLevelMeta,
    makeCustomVipKeyword,
    vipCategoryClickTariff,
    vipLevels,
    type VipLevel,
} from '../../data/providerVip';
import {
    createDefaultVipAccount,
    useProviderVipStore,
} from '../../store/providerVipStore';
import { showProviderError, showProviderSuccess } from '../../utils/toast';
import { formatJalali, toFaDigits } from '../../utils/jalali';
import { toJalaali } from 'jalaali-js';

interface ProviderVipPageProps {
    role: ProviderRole;
}

const chartConfig = {
    amount: { label: 'مصرف', color: '#f59e0b' },
} satisfies ChartConfig;

function formatIsoJalali(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    const j = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return toFaDigits(formatJalali(j));
}

export function ProviderVipPage({ role }: ProviderVipPageProps) {
    const navigate = useNavigate();
    const account = useProviderVipStore((s) => s.accounts[role]) ?? createDefaultVipAccount(role);
    const addKeyword = useProviderVipStore((s) => s.addKeyword);
    const removeKeyword = useProviderVipStore((s) => s.removeKeyword);
    const setLevel = useProviderVipStore((s) => s.setLevel);

    const [keywordInput, setKeywordInput] = useState('');
    const [suggestOpen, setSuggestOpen] = useState(false);

    const suggested = useMemo(() => getSuggestedVipKeywords(role), [role]);
    const unlocked = getUnlockedVipLevel(account.balance);
    const currentMeta = getVipLevelMeta(account.level);
    const selectedSet = useMemo(
        () => new Set(account.keywords.map((item) => item.keyword)),
        [account.keywords]
    );

    const chartData = useMemo(
        () =>
            account.consumption.map((point) => ({
                name: formatIsoJalali(point.date),
                amount: point.amount,
            })),
        [account.consumption]
    );

    const addFromOption = (keyword: string, clickTariff: number, impressionTariff: number) => {
        const ok = addKeyword(role, { keyword, clickTariff, impressionTariff });
        if (!ok) {
            showProviderError('این کلمه کلیدی قبلاً اضافه شده است');
            return;
        }
        showProviderSuccess(`«${keyword}» به لیست اضافه شد`);
        setKeywordInput('');
    };

    const handleAddCustom = () => {
        const option = makeCustomVipKeyword(role, keywordInput);
        if (option.keyword.length < 2) {
            showProviderError('کلمه کلیدی را وارد کنید');
            return;
        }
        addFromOption(option.keyword, option.clickTariff, option.impressionTariff);
    };

    const handleSelectLevel = (level: VipLevel) => {
        if (level === account.level) return;
        const ok = setLevel(role, level);
        if (!ok) {
            showProviderError(`برای LEVEL ${level} موجودی VIP کافی نیست. ابتدا سرویس را شارژ کنید.`);
            return;
        }
        showProviderSuccess(`سطح VIP به LEVEL ${level} تغییر کرد`);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="معرفی ویژه VIP"
                description="با شارژ کیف‌پول VIP و انتخاب کلمات کلیدی، در نتایج جستجوی بیمار بالاتر دیده می‌شوید. این بخش جدا از اشتراک پنل است."
                actions={
                    <button
                        type="button"
                        onClick={() => navigate(providerPath(role, 'vip/charge'))}
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-bold text-white shadow-sm shadow-amber-500/20 hover:bg-amber-600"
                    >
                        <Wallet className="h-4 w-4" />
                        شارژ سرویس VIP
                    </button>
                }
            />

            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-xs text-slate-500">سطح فعلی</p>
                            <h2 className="text-lg font-bold text-slate-800">VIP {currentMeta.label}</h2>
                        </div>
                        <div className="rounded-xl bg-amber-50 px-3 py-2 text-left ring-1 ring-amber-100">
                            <p className="text-[11px] text-amber-700">موجودی VIP</p>
                            <p className="text-sm font-bold text-amber-900">
                                {formatPrice(account.balance)} تومان
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setSuggestOpen(true)}
                            className="inline-flex h-11 items-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600"
                        >
                            <Sparkles className="h-4 w-4" />
                            کلمات پیشنهادی
                        </button>
                        <div className="flex min-w-[220px] flex-1 gap-2">
                            <input
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddCustom();
                                    }
                                }}
                                placeholder="افزودن کلمه کلیدی"
                                className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-amber-400"
                            />
                            <button
                                type="button"
                                onClick={handleAddCustom}
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                                aria-label="افزودن"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <p className="text-xs leading-6 text-slate-500">
                        کلماتی مرتبط با تخصص {providerRoleLabels[role]} وارد کنید تا در جستجوی بیمار پیدا شوید.
                    </p>

                    <div>
                        <h3 className="mb-3 text-sm font-bold text-slate-800">لیست کلمات کلیدی انتخاب‌شده</h3>
                        {account.keywords.length === 0 ? (
                            <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                                هنوز کلمه‌ای انتخاب نشده است.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[560px] text-right text-sm">
                                    <thead className="text-xs text-slate-500">
                                        <tr className="border-b border-slate-100">
                                            <th className="pb-2 font-medium">کلمه کلیدی</th>
                                            <th className="pb-2 font-medium">تعرفه هر کلیک برای شهر</th>
                                            <th className="pb-2 font-medium">تعرفه هر نمایش ویژه</th>
                                            <th className="pb-2 font-medium">عملیات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {account.keywords.map((item) => (
                                            <tr key={item.id} className="border-b border-slate-50">
                                                <td className="py-2.5 font-medium text-slate-800">{item.keyword}</td>
                                                <td className="py-2.5 text-slate-700">
                                                    {formatPrice(item.clickTariff)} تومان
                                                </td>
                                                <td className="py-2.5 text-slate-700">
                                                    {formatPrice(item.impressionTariff)} تومان
                                                </td>
                                                <td className="py-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeKeyword(role, item.id)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                        aria-label="حذف کلمه"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-6 text-slate-500">
                        تعرفه هر کلیک برای دسته شما حدود {formatPrice(vipCategoryClickTariff[role])} تومان است.
                        با افزایش LEVEL، رتبه شما در نتایج جستجو بهتر می‌شود.
                    </p>
                </section>

                <aside className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h3 className="mb-1 text-sm font-bold text-slate-800">مصرف شارژ VIP</h3>
                        <p className="mb-3 text-xs text-slate-500">جزئیات مصرف در روزهای اخیر</p>
                        <ChartContainer config={chartConfig} className="h-[200px] w-full">
                            <LineChart data={chartData}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} />
                                <YAxis tickLine={false} axisLine={false} fontSize={10} width={36} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Line type="monotone" dataKey="amount" stroke="var(--color-amount)" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ChartContainer>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h3 className="mb-3 text-sm font-bold text-slate-800">انتخاب سطح VIP</h3>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                            {vipLevels.map((item) => {
                                const locked = item.level > unlocked;
                                const selected = item.level === account.level;
                                return (
                                    <button
                                        key={item.level}
                                        type="button"
                                        onClick={() => handleSelectLevel(item.level)}
                                        className={`rounded-2xl border px-2 py-3 text-center transition ${
                                            selected
                                                ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-300'
                                                : locked
                                                  ? 'border-slate-100 bg-slate-50 opacity-60'
                                                  : 'border-slate-200 bg-white hover:bg-slate-50'
                                        }`}
                                    >
                                        <LevelGauge percent={item.level * 20} active={selected} />
                                        <p className="mt-1 text-[11px] font-bold text-slate-700">{item.label}</p>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="mt-3 text-xs leading-6 text-slate-500">{currentMeta.rankBoost}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate(providerPath(role, 'vip/charge'))}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-bold text-amber-950 hover:bg-amber-500"
                    >
                        <Wallet className="h-4 w-4" />
                        شارژ سرویس VIP
                    </button>
                </aside>
            </div>

            <ProviderModal
                open={suggestOpen}
                onClose={() => setSuggestOpen(false)}
                title="کلمات پیشنهادی"
                description="از لیست زیر کلمه مرتبط با تخصص خود را انتخاب کنید."
            >
                <ul className="space-y-2">
                    {suggested.map((item) => {
                        const added = selectedSet.has(item.keyword);
                        return (
                            <li
                                key={item.keyword}
                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5"
                            >
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{item.keyword}</p>
                                    <p className="text-[11px] text-slate-500">
                                        کلیک {formatPrice(item.clickTariff)} · نمایش {formatPrice(item.impressionTariff)} تومان
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    disabled={added}
                                    onClick={() => addFromOption(item.keyword, item.clickTariff, item.impressionTariff)}
                                    className="h-9 rounded-lg bg-amber-500 px-3 text-xs font-semibold text-white hover:bg-amber-600 disabled:bg-slate-100 disabled:text-slate-400"
                                >
                                    {added ? 'اضافه شده' : 'افزودن'}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </ProviderModal>
        </div>
    );
}

function LevelGauge({ percent, active }: { percent: number; active: boolean }) {
    const r = 28;
    const c = Math.PI * r;
    const dash = Math.max(4, (percent / 100) * c);
    const color = active ? '#f59e0b' : '#94a3b8';
    return (
        <svg viewBox="0 0 80 48" className="mx-auto h-10 w-16">
            <path
                d="M 12 40 A 28 28 0 0 1 68 40"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="7"
                strokeLinecap="round"
            />
            <path
                d="M 12 40 A 28 28 0 0 1 68 40"
                fill="none"
                stroke={color}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${c}`}
            />
        </svg>
    );
}
