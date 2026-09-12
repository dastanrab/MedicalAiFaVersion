import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, ChevronLeft, Flame } from 'lucide-react';
import { AppBar } from '../components/AppBar';
import { useAuthStore } from '../store/authStore';
import { splitMealBudgets } from '../services/fitnessStorage';
import {
  createMealId,
  DEFAULT_DAILY_GOAL,
  getDayLog,
  getLocalDateString,
  loadHealthInsights,
  saveHealthInsights,
  type MealEntry,
  type MealType,
} from '../services/healthInsightsStorage';

interface FoodItem {
  name: string;
  calories: number;
}

const breakfastSuggestions: FoodItem[] = [
  { name: 'نان سنگک', calories: 80 },
  { name: 'پوره میوه', calories: 80 },
  { name: 'پنیر و گردو', calories: 120 },
];

const breakfastOptions: FoodItem[] = [
  { name: 'موز', calories: 89 },
  { name: 'پرتقال', calories: 47 },
  { name: 'شیر کم‌چرب', calories: 42 },
  { name: 'اسموتی میوه', calories: 75 },
  { name: 'جو دوسر', calories: 71 },
  { name: 'نان تست', calories: 79 },
  { name: 'نان سفید', calories: 80 },
  { name: 'چای با عسل', calories: 40 },
  { name: 'تخم‌مرغ آب‌پز', calories: 78 },
  { name: 'ماست کم‌چرب', calories: 60 },
];

const lunchOptions: FoodItem[] = [
  { name: 'مرغ گریل', calories: 165 },
  { name: 'برنج قهوه‌ای', calories: 112 },
  { name: 'سالاد مخلوط', calories: 33 },
  { name: 'سوپ سبزیجات', calories: 67 },
  { name: 'ساندویچ تن', calories: 145 },
  { name: 'ماکارونی', calories: 131 },
];

const dinnerOptions: FoodItem[] = [
  { name: 'ماهی سالمون', calories: 206 },
  { name: 'سبزیجات کبابی', calories: 75 },
  { name: 'کینوا', calories: 120 },
  { name: 'سوپ مرغ', calories: 86 },
  { name: 'سینه بوقلمون', calories: 135 },
  { name: 'بروکلی بخارپز', calories: 35 },
];

type MealKey = 'breakfast' | 'lunch' | 'dinner';

function MealSection({
  title,
  maxCalories,
  options,
  selected,
  onToggle,
  accent,
  suggestions,
}: {
  title: string;
  maxCalories: number;
  options: FoodItem[];
  selected: string[];
  onToggle: (name: string) => void;
  accent: {
    bar: string;
    selectedBorder: string;
    selectedBg: string;
    hoverBorder: string;
    check: string;
    cal: string;
  };
  suggestions?: FoodItem[];
}) {
  const total = selected.reduce((sum, name) => {
    const item = options.find((opt) => opt.name === name);
    return sum + (item?.calories || 0);
  }, 0);
  const remaining = Math.max(maxCalories - total, 0);

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-[18px] font-semibold text-gray-900">{title}</h3>
        <span className="text-[13px] text-gray-600">
          حداکثر {maxCalories.toLocaleString('fa-IR')} کیلوکالری
        </span>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex justify-between text-[12px] text-gray-600">
          <span>انتخاب‌شده: {total.toLocaleString('fa-IR')} کیلوکالری</span>
          <span>باقی‌مانده: {remaining.toLocaleString('fa-IR')}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full transition-all ${accent.bar}`}
            style={{ width: `${Math.min((total / Math.max(maxCalories, 1)) * 100, 100)}%` }}
          />
        </div>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="mb-4">
          <p className="mb-3 text-[14px] font-medium text-gray-700">پیشنهادها</p>
          <div className="grid grid-cols-3 gap-3">
            {suggestions.map((item, index) => (
              <div
                key={item.name}
                className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-center"
              >
                <p className="mb-1 text-[12px] font-medium text-gray-900">
                  پیشنهاد {(index + 1).toLocaleString('fa-IR')}
                </p>
                <p className="mb-1 text-[11px] text-gray-700">{item.name}</p>
                <p className="text-[11px] font-semibold text-orange-600">
                  {item.calories.toLocaleString('fa-IR')} کیلوکالری
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mb-3 text-[14px] font-medium text-gray-700">انتخاب مواد غذایی</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((item) => {
          const isSelected = selected.includes(item.name);
          return (
            <button
              type="button"
              key={item.name}
              onClick={() => onToggle(item.name)}
              className={`relative rounded-lg border-2 p-3 text-right transition-all ${
                isSelected
                  ? `${accent.selectedBorder} ${accent.selectedBg}`
                  : `border-gray-200 bg-white ${accent.hoverBorder}`
              }`}
            >
              {isSelected && (
                <div
                  className={`absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full ${accent.check}`}
                >
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <p className="mb-1 text-[13px] font-medium text-gray-900">{item.name}</p>
              <p className={`text-[12px] font-semibold ${accent.cal}`}>
                {item.calories.toLocaleString('fa-IR')} کیلوکالری
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MealPlan() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? 'guest';

  const insights = useMemo(() => loadHealthInsights(userId), [userId]);
  const dailyCalories = insights.dailyGoal || DEFAULT_DAILY_GOAL;
  const budgets = useMemo(() => splitMealBudgets(dailyCalories), [dailyCalories]);

  const [selectedBreakfast, setSelectedBreakfast] = useState<string[]>([]);
  const [selectedLunch, setSelectedLunch] = useState<string[]>([]);
  const [selectedDinner, setSelectedDinner] = useState<string[]>([]);

  const toggleSelection = (itemName: string, meal: MealKey) => {
    const setter =
      meal === 'breakfast'
        ? setSelectedBreakfast
        : meal === 'lunch'
          ? setSelectedLunch
          : setSelectedDinner;

    setter((prev) =>
      prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName],
    );
  };

  const buildEntries = (
    selected: string[],
    options: FoodItem[],
    type: MealType,
  ): MealEntry[] => {
    const now = new Date().toISOString();
    return selected
      .map((name) => options.find((opt) => opt.name === name))
      .filter((item): item is FoodItem => !!item)
      .map((item) => ({
        id: createMealId(),
        type,
        name: item.name,
        calories: item.calories,
        createdAt: now,
      }));
  };

  const handleSave = () => {
    const data = loadHealthInsights(userId);
    const today = getLocalDateString();
    const existing = getDayLog(data, today);
    const kept = existing.meals.filter((m) => m.type === 'snack');
    const meals: MealEntry[] = [
      ...kept,
      ...buildEntries(selectedBreakfast, breakfastOptions, 'breakfast'),
      ...buildEntries(selectedLunch, lunchOptions, 'lunch'),
      ...buildEntries(selectedDinner, dinnerOptions, 'dinner'),
    ];

    saveHealthInsights(userId, {
      ...data,
      dailyGoal: dailyCalories,
      days: {
        ...data.days,
        [today]: { date: today, meals },
      },
    });

    navigate('/health-insights');
  };

  const hasSelection =
    selectedBreakfast.length + selectedLunch.length + selectedDinner.length > 0;

  return (
    <div
      className="h-full overflow-y-auto bg-gradient-to-b from-orange-50 to-white pb-24 font-[YekanBakhFaNum]"
      dir="rtl"
    >
      <AppBar backTo="/body-measurement" />

      <div className="px-5 pt-24 pb-8 sm:px-6">
        <p className="mb-4 text-center text-sm text-gray-500">گام ۲ از ۳ — تناسب و تغذیه</p>

        <div className="mb-6 rounded-[14px] bg-gradient-to-br from-orange-500 to-amber-600 p-6 text-center shadow-lg shadow-orange-500/20">
          <Flame className="mx-auto mb-3 h-12 w-12 text-white" />
          <h2 className="mb-2 text-[16px] font-semibold text-white">هدف کالری روزانه شما</h2>
          <p className="text-[36px] font-bold text-white">
            {dailyCalories.toLocaleString('fa-IR')}
          </p>
          <p className="text-[14px] text-orange-100">کیلوکالری در روز</p>
        </div>

        <MealSection
          title="صبحانه"
          maxCalories={budgets.breakfast}
          options={breakfastOptions}
          selected={selectedBreakfast}
          onToggle={(name) => toggleSelection(name, 'breakfast')}
          suggestions={breakfastSuggestions}
          accent={{
            bar: 'bg-gradient-to-l from-orange-400 to-orange-500',
            selectedBorder: 'border-orange-500',
            selectedBg: 'bg-orange-50',
            hoverBorder: 'hover:border-orange-300',
            check: 'bg-orange-500',
            cal: 'text-orange-600',
          }}
        />

        <MealSection
          title="ناهار"
          maxCalories={budgets.lunch}
          options={lunchOptions}
          selected={selectedLunch}
          onToggle={(name) => toggleSelection(name, 'lunch')}
          accent={{
            bar: 'bg-gradient-to-l from-emerald-400 to-emerald-500',
            selectedBorder: 'border-emerald-500',
            selectedBg: 'bg-emerald-50',
            hoverBorder: 'hover:border-emerald-300',
            check: 'bg-emerald-500',
            cal: 'text-emerald-600',
          }}
        />

        <MealSection
          title="شام"
          maxCalories={budgets.dinner}
          options={dinnerOptions}
          selected={selectedDinner}
          onToggle={(name) => toggleSelection(name, 'dinner')}
          accent={{
            bar: 'bg-gradient-to-l from-violet-400 to-violet-500',
            selectedBorder: 'border-violet-500',
            selectedBg: 'bg-violet-50',
            hoverBorder: 'hover:border-violet-300',
            check: 'bg-violet-500',
            cal: 'text-violet-600',
          }}
        />

        <button
          type="button"
          onClick={handleSave}
          disabled={!hasSelection}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[17px] font-medium transition-colors ${
            hasSelection
              ? 'bg-gradient-to-l from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-700'
              : 'cursor-not-allowed bg-gray-200 text-gray-500'
          }`}
        >
          ذخیره و رفتن به پیگیری روزانه
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
