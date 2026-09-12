import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Ruler, Info } from 'lucide-react';
import { AppBar } from '../components/AppBar';
import { useAuthStore } from '../store/authStore';
import {
  estimateDailyCalorieGoal,
  loadBodyMeasurements,
  profileFromUser,
  saveBodyMeasurements,
  type BodyMeasurements,
} from '../services/fitnessStorage';
import {
  loadHealthInsights,
  saveHealthInsights,
} from '../services/healthInsightsStorage';

const FIELDS: { key: keyof BodyMeasurements; label: string; placeholder: string }[] = [
  { key: 'neck', label: 'دور گردن (سانتی‌متر)', placeholder: '۳۵' },
  { key: 'waist', label: 'دور کمر (سانتی‌متر)', placeholder: '۸۰' },
  { key: 'arm', label: 'دور بازو (سانتی‌متر)', placeholder: '۳۰' },
  { key: 'thigh', label: 'دور ران (سانتی‌متر)', placeholder: '۵۵' },
  { key: 'chest', label: 'دور سینه (سانتی‌متر)', placeholder: '۹۵' },
];

export function BodyMeasurement() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? 'guest';

  const [measurements, setMeasurements] = useState<BodyMeasurements>(() =>
    loadBodyMeasurements(userId),
  );

  useEffect(() => {
    setMeasurements(loadBodyMeasurements(userId));
  }, [userId]);

  const profile = useMemo(() => profileFromUser(user), [user]);
  const suggestedGoal = useMemo(() => estimateDailyCalorieGoal(profile), [profile]);

  const updateMeasurement = (field: keyof BodyMeasurements, value: string) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }));
  };

  const allFieldsFilled = Object.values(measurements).every((value) => value.trim() !== '');

  const handleNext = () => {
    if (!allFieldsFilled) return;

    saveBodyMeasurements(userId, measurements);

    const existing = loadHealthInsights(userId);
    if (suggestedGoal != null) {
      saveHealthInsights(userId, { ...existing, dailyGoal: suggestedGoal });
    }

    navigate('/meal-plan');
  };

  const formatStat = (value: number | null, unit: string) => {
    if (value == null) return '—';
    return `${value.toLocaleString('fa-IR')} ${unit}`;
  };

  return (
    <div
      className="h-full overflow-y-auto bg-gradient-to-b from-orange-50 to-white pb-24 font-[YekanBakhFaNum]"
      dir="rtl"
    >
      <AppBar backTo="/home" />

      <div className="px-5 pt-24 pb-8 sm:px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/25">
            <Ruler className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-4 text-[22px] font-semibold text-gray-900">اندازه‌گیری بدن</h2>
          <p className="mt-1 text-sm text-gray-500">گام ۱ از ۳ — تناسب و تغذیه</p>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-[14px] border border-blue-200 bg-blue-50 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <p className="text-sm leading-6 text-blue-900">
            هرچه اندازه‌ها دقیق‌تر باشد، هدف کالری و برنامه غذایی دقیق‌تر محاسبه می‌شود.
          </p>
        </div>

        <div className="mb-6 rounded-[14px] bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <h3 className="mb-4 text-[15px] font-medium text-[#364153]">اطلاعات پروفایل شما</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <p className="mb-1 text-[12px] text-[#717182]">وزن</p>
              <p className="text-[16px] font-semibold text-gray-900">
                {formatStat(profile.weightKg, 'کیلو')}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-center">
              <p className="mb-1 text-[12px] text-[#717182]">قد</p>
              <p className="text-[16px] font-semibold text-gray-900">
                {formatStat(profile.heightCm, 'سانتی‌متر')}
              </p>
            </div>
            <div className="rounded-lg bg-violet-50 p-3 text-center">
              <p className="mb-1 text-[12px] text-[#717182]">سن</p>
              <p className="text-[16px] font-semibold text-gray-900">
                {formatStat(profile.age, 'سال')}
              </p>
            </div>
          </div>
          {suggestedGoal != null ? (
            <p className="mt-3 text-center text-xs text-gray-500">
              هدف پیشنهادی:{' '}
              <span className="font-semibold text-orange-600">
                {suggestedGoal.toLocaleString('fa-IR')} کیلوکالری
              </span>
            </p>
          ) : (
            <p className="mt-3 text-center text-xs text-amber-700">
              وزن، قد و سن را در پروفایل تکمیل کنید تا هدف دقیق‌تری پیشنهاد شود.
            </p>
          )}
        </div>

        <div className="space-y-5 rounded-[14px] bg-white p-5 shadow-sm ring-1 ring-gray-100">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className="mb-2 block text-[14px] font-medium text-[#364153]">
                {field.label}
              </label>
              <input
                type="number"
                inputMode="decimal"
                placeholder={field.placeholder}
                value={measurements[field.key]}
                onChange={(e) => updateMeasurement(field.key, e.target.value)}
                className="h-11 w-full rounded-lg border-none bg-[#f3f3f5] px-3 text-[14px] text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-orange-300"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          disabled={!allFieldsFilled}
          className={`mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[17px] font-medium transition-colors ${
            allFieldsFilled
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600'
              : 'cursor-not-allowed bg-gray-200 text-gray-500'
          }`}
        >
          ادامه به برنامه غذایی
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
