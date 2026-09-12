import React, { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Brain,
  Flame,
  Plus,
  Trash2,
  Target,
  Coffee,
  Sun,
  Moon,
  Cookie,
  X,
  ChevronLeft,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Ruler,
} from 'lucide-react';
import { AppBar } from '../components/AppBar';
import { Button } from '../components/ui/button';
import { useAuthStore } from '../store/authStore';
import {
  createMealId,
  dayTotal,
  getDayLog,
  getLocalDateString,
  loadHealthInsights,
  recentDayTotals,
  saveHealthInsights,
  type HealthInsightsData,
  type MealEntry,
  type MealType,
} from '../services/healthInsightsStorage';

const MEAL_TYPES: { id: MealType; label: string; icon: React.ReactNode }[] = [
  { id: 'breakfast', label: 'صبحانه', icon: <Coffee className="h-4 w-4" /> },
  { id: 'lunch', label: 'ناهار', icon: <Sun className="h-4 w-4" /> },
  { id: 'dinner', label: 'شام', icon: <Moon className="h-4 w-4" /> },
  { id: 'snack', label: 'میان‌وعده', icon: <Cookie className="h-4 w-4" /> },
];

const MEAL_LABEL: Record<MealType, string> = {
  breakfast: 'صبحانه',
  lunch: 'ناهار',
  dinner: 'شام',
  snack: 'میان‌وعده',
};

function weekdayShort(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  const names = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
  return names[day];
}

interface InsightItem {
  id: string;
  title: string;
  description: string;
  details: string;
  tips: string[];
  tone: 'ok' | 'warn' | 'info';
}

function buildInsights(
  goal: number,
  todayTotal: number,
  todayMeals: MealEntry[],
  history: { date: string; total: number }[],
): InsightItem[] {
  const insights: InsightItem[] = [];
  const loggedDays = history.filter((h) => h.total > 0);
  const avg =
    loggedDays.length > 0
      ? Math.round(loggedDays.reduce((s, h) => s + h.total, 0) / loggedDays.length)
      : 0;

  if (todayMeals.length === 0) {
    insights.push({
      id: 'empty-today',
      title: 'هنوز وعده‌ای ثبت نشده',
      description: 'با ثبت اولین وعده، پیگیری کالری امروز شروع می‌شود.',
      details:
        'ثبت منظم وعده‌ها کمک می‌کند الگوی تغذیه خود را ببینید و هدف روزانه را بهتر رعایت کنید.',
      tips: [
        'صبحانه را فراموش نکنید؛ انرژی روز را تأمین می‌کند.',
        'حتی میان‌وعده کوچک را هم ثبت کنید تا تصویر کامل‌تری داشته باشید.',
        'هدف کالری را مطابق نیاز واقعی خود تنظیم کنید.',
      ],
      tone: 'info',
    });
  } else if (todayTotal > goal * 1.1) {
    insights.push({
      id: 'over-goal',
      title: 'بیشتر از هدف امروز',
      description: `تا الان ${todayTotal.toLocaleString('fa-IR')} از ${goal.toLocaleString('fa-IR')} کیلوکالری ثبت شده.`,
      details:
        'کمی بالاتر از هدف بودن در یک روز طبیعی است؛ مهم الگوی چندروزه است. برای وعده‌های بعدی انتخاب‌های سبک‌تر کمک می‌کند.',
      tips: [
        'برای میان‌وعده بعدی میوه یا ماست کم‌چرب را در نظر بگیرید.',
        'آب کافی بنوشید؛ گاهی تشنگی با گرسنگی اشتباه گرفته می‌شود.',
        'شام را سبک‌تر و زودتر برنامه‌ریزی کنید.',
      ],
      tone: 'warn',
    });
  } else if (todayTotal < goal * 0.7 && todayMeals.length > 0) {
    insights.push({
      id: 'under-goal',
      title: 'کمتر از هدف امروز',
      description: `هنوز فاصله قابل‌توجهی با هدف ${goal.toLocaleString('fa-IR')} کیلوکالری دارید.`,
      details:
        'اگر در اوایل روز هستید طبیعی است. اگر روز رو به پایان است و کالری خیلی کم ثبت شده، یک وعده متعادل با پروتئین و کربوهیدرات پیچیده اضافه کنید.',
      tips: [
        'یک وعده متعادل با پروتئین و سبزیجات اضافه کنید.',
        'از حذف کامل وعده‌ها خودداری کنید.',
        'اگر هدفتان کاهش وزن است، کمبود شدید کالری توصیه نمی‌شود.',
      ],
      tone: 'info',
    });
  } else if (todayMeals.length > 0) {
    insights.push({
      id: 'on-track',
      title: 'در مسیر هدف',
      description: 'کالری امروز نسبت به هدف در محدوده مناسبی است.',
      details:
        'ادامه همین ریتم ثبت وعده‌ها به شما کمک می‌کند روند تغذیه را شفاف ببینید و تصمیم‌های آگاهانه‌تری بگیرید.',
      tips: [
        'تعادل بین وعده‌ها را حفظ کنید.',
        'پروتئین و فیبر را در هر وعده فراموش نکنید.',
        'ثبت منظم مهم‌تر از کمال‌گرایی است.',
      ],
      tone: 'ok',
    });
  }

  const hasBreakfast = todayMeals.some((m) => m.type === 'breakfast');
  if (todayMeals.length > 0 && !hasBreakfast) {
    insights.push({
      id: 'no-breakfast',
      title: 'صبحانه ثبت نشده',
      description: 'امروز هنوز صبحانه‌ای ثبت نکرده‌اید.',
      details:
        'صبحانه منظم به ثبات انرژی و کاهش پرخوری در ادامه روز کمک می‌کند.',
      tips: [
        'حتی یک صبحانه سبک بهتر از حذف کامل است.',
        'ترکیب پروتئین + کربوهیدرات پیچیده انتخاب خوبی است.',
      ],
      tone: 'info',
    });
  }

  if (loggedDays.length >= 3) {
    insights.push({
      id: 'week-avg',
      title: 'میانگین روزهای اخیر',
      description: `میانگین ${loggedDays.length} روز ثبت‌شده: ${avg.toLocaleString('fa-IR')} کیلوکالری.`,
      details:
        avg > goal * 1.15
          ? 'میانگین شما بالاتر از هدف است؛ تنظیم وعده‌ها در چند روز آینده کمک می‌کند.'
          : avg < goal * 0.75
            ? 'میانگین شما کمتر از هدف است؛ اگر عمدی نیست، وعده‌ها را کامل‌تر ثبت یا مصرف کنید.'
            : 'میانگین شما نزدیک به هدف است؛ الگوی پایداری دارید.',
      tips: [
        'به جای یک روز، روند چندروزه را معیار قرار دهید.',
        'روزهای بدون ثبت را در میانگین لحاظ نکنید.',
      ],
      tone: avg > goal * 1.15 ? 'warn' : 'ok',
    });
  }

  return insights;
}

export default function HealthInsights() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? 'guest';

  const [data, setData] = useState<HealthInsightsData>(() => loadHealthInsights(userId));
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [goalInput, setGoalInput] = useState(String(data.dailyGoal));
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [selectedInsight, setSelectedInsight] = useState<InsightItem | null>(null);

  const today = getLocalDateString();
  const todayLog = getDayLog(data, today);
  const todayCalories = dayTotal(todayLog);
  const progress = data.dailyGoal > 0 ? Math.min(todayCalories / data.dailyGoal, 1) : 0;
  const remaining = Math.max(data.dailyGoal - todayCalories, 0);
  const history = useMemo(() => recentDayTotals(data, 7), [data]);
  const insights = useMemo(
    () => buildInsights(data.dailyGoal, todayCalories, todayLog.meals, history),
    [data.dailyGoal, todayCalories, todayLog.meals, history],
  );
  const maxHistory = Math.max(...history.map((h) => h.total), data.dailyGoal, 1);

  const persist = (next: HealthInsightsData) => {
    setData(next);
    saveHealthInsights(userId, next);
  };

  const handleSaveGoal = () => {
    const value = Math.round(Number(goalInput));
    if (!Number.isFinite(value) || value < 800 || value > 6000) return;
    persist({ ...data, dailyGoal: value });
    setShowGoalEdit(false);
  };

  const handleAddMeal = () => {
    const calories = Math.round(Number(mealCalories));
    if (!Number.isFinite(calories) || calories <= 0) return;

    const entry: MealEntry = {
      id: createMealId(),
      type: mealType,
      name: mealName.trim() || MEAL_LABEL[mealType],
      calories,
      createdAt: new Date().toISOString(),
    };

    const existing = getDayLog(data, today);
    const nextDays = {
      ...data.days,
      [today]: { date: today, meals: [...existing.meals, entry] },
    };
    persist({ ...data, days: nextDays });
    setMealName('');
    setMealCalories('');
    setShowAddMeal(false);
  };

  const handleDeleteMeal = (mealId: string) => {
    const existing = getDayLog(data, today);
    const meals = existing.meals.filter((m) => m.id !== mealId);
    const nextDays = { ...data.days };
    if (meals.length === 0) {
      delete nextDays[today];
    } else {
      nextDays[today] = { date: today, meals };
    }
    persist({ ...data, days: nextDays });
  };

  const toneStyles = {
    ok: {
      accent: 'from-emerald-400 to-teal-500',
      iconBg: 'bg-emerald-50 text-emerald-600',
      header: 'from-emerald-500 to-teal-600',
      tipBg: 'bg-emerald-50/80',
      tipRing: 'ring-emerald-100',
      tipDot: 'bg-emerald-500',
      button: 'w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white',
      Icon: CheckCircle2,
    },
    warn: {
      accent: 'from-amber-400 to-orange-500',
      iconBg: 'bg-amber-50 text-amber-600',
      header: 'from-amber-500 to-orange-600',
      tipBg: 'bg-amber-50/80',
      tipRing: 'ring-amber-100',
      tipDot: 'bg-amber-500',
      button: 'w-full rounded-2xl bg-amber-600 hover:bg-amber-700 text-white',
      Icon: AlertCircle,
    },
    info: {
      accent: 'from-indigo-400 to-blue-500',
      iconBg: 'bg-indigo-50 text-indigo-600',
      header: 'from-indigo-500 to-blue-600',
      tipBg: 'bg-indigo-50/80',
      tipRing: 'ring-indigo-100',
      tipDot: 'bg-indigo-500',
      button: 'w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white',
      Icon: TrendingUp,
    },
  } as const;

  return (
    <div
      className="relative h-full overflow-x-hidden overflow-y-auto bg-[#F6F8FC] pb-24 font-[YekanBakhFaNum]"
      dir="rtl"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[320px] overflow-hidden">
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -top-10 left-0 h-56 w-56 rounded-full bg-blue-200/35 blur-3xl" />
      </div>

      <AppBar backTo="/home" />

      <div className="relative z-10 px-5 pt-24 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-500/25">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">بینش سلامت</h1>
            <p className="text-xs text-gray-500">پیگیری کالری و وعده‌های غذایی</p>
          </div>
        </div>

        <Link
          to="/body-measurement"
          className="mb-5 flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/80 px-4 py-3 text-sm text-orange-800 transition-colors hover:bg-orange-100"
        >
          <span className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            تنظیم تناسب و تغذیه
          </span>
          <ChevronLeft className="h-4 w-4" />
        </Link>

        {/* هدف و پیشرفت امروز */}
        <section className="mb-5 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 p-5 text-white shadow-[0_20px_50px_-20px_rgba(37,99,235,0.55)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-white/90">
              <Flame className="h-4 w-4" />
              <span>کالری امروز</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setGoalInput(String(data.dailyGoal));
                setShowGoalEdit(true);
              }}
              className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] ring-1 ring-white/25 backdrop-blur-sm"
            >
              <Target className="h-3.5 w-3.5" />
              هدف: {data.dailyGoal.toLocaleString('fa-IR')}
            </button>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-4xl font-bold tracking-tight">
                {todayCalories.toLocaleString('fa-IR')}
              </p>
              <p className="mt-1 text-xs text-white/75">
                {todayCalories >= data.dailyGoal
                  ? `${(todayCalories - data.dailyGoal).toLocaleString('fa-IR')} بیش از هدف`
                  : `${remaining.toLocaleString('fa-IR')} کیلوکالری باقی‌مانده`}
              </p>
            </div>
            <div className="relative h-20 w-20 shrink-0">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 97.4} 97.4`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {Math.round(progress * 100).toLocaleString('fa-IR')}٪
              </div>
            </div>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${Math.min(progress * 100, 100)}%` }}
            />
          </div>
        </section>

        {/* وعده‌های امروز */}
        <section className="mb-5 rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-indigo-50">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">وعده‌های امروز</h2>
            <button
              type="button"
              onClick={() => setShowAddMeal(true)}
              className="flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100"
            >
              <Plus className="h-3.5 w-3.5" />
              افزودن
            </button>
          </div>

          {todayLog.meals.length === 0 ? (
            <button
              type="button"
              onClick={() => setShowAddMeal(true)}
              className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 px-4 py-8 text-center"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Plus className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-gray-700">اولین وعده را ثبت کنید</p>
              <p className="mt-1 text-xs text-gray-500">صبحانه، ناهار، شام یا میان‌وعده</p>
            </button>
          ) : (
            <ul className="space-y-2">
              {todayLog.meals.map((meal) => {
                const meta = MEAL_TYPES.find((t) => t.id === meal.type);
                return (
                  <li
                    key={meal.id}
                    className="flex items-center gap-3 rounded-2xl bg-[#F8FAFF] px-3 py-3 ring-1 ring-indigo-50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 ring-1 ring-indigo-100">
                      {meta?.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{meal.name}</p>
                      <p className="text-[11px] text-gray-500">{MEAL_LABEL[meal.type]}</p>
                    </div>
                    <p className="shrink-0 text-sm font-bold text-gray-800">
                      {meal.calories.toLocaleString('fa-IR')}
                      <span className="mr-1 text-[10px] font-normal text-gray-400">kcal</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500"
                      aria-label="حذف وعده"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* تاریخچه ۷ روز */}
        <section className="mb-5 rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-indigo-50">
          <h2 className="mb-4 text-sm font-bold text-gray-900">۷ روز اخیر</h2>
          <div className="flex h-36 items-end justify-between gap-1.5">
            {history.map((day) => {
              const heightPct = Math.max((day.total / maxHistory) * 100, day.total > 0 ? 8 : 3);
              const isToday = day.date === today;
              const over = day.total > data.dailyGoal;
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] font-medium text-gray-500">
                    {day.total > 0 ? day.total.toLocaleString('fa-IR') : '—'}
                  </span>
                  <div className="flex h-24 w-full items-end justify-center">
                    <div
                      className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                        isToday
                          ? 'bg-gradient-to-t from-indigo-600 to-blue-400'
                          : over
                            ? 'bg-gradient-to-t from-amber-500 to-amber-300'
                            : 'bg-gradient-to-t from-indigo-200 to-indigo-100'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className={`text-[10px] ${isToday ? 'font-bold text-indigo-600' : 'text-gray-400'}`}>
                    {isToday ? 'امروز' : weekdayShort(day.date)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-center text-[10px] text-gray-400">
            خط هدف حدود {data.dailyGoal.toLocaleString('fa-IR')} کیلوکالری است
          </p>
        </section>

        {/* بینش‌ها */}
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-bold text-gray-900">نکات شخصی‌سازی‌شده</h2>
          <div className="space-y-2.5">
            {insights.map((item) => {
              const style = toneStyles[item.tone];
              const Icon = style.Icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedInsight(item)}
                  className="flex w-full overflow-hidden rounded-2xl bg-white text-right shadow-sm ring-1 ring-indigo-50 transition active:scale-[0.99]"
                >
                  <div className={`w-1 shrink-0 bg-gradient-to-b ${style.accent}`} />
                  <div className="flex flex-1 items-center gap-3 p-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.description}</p>
                    </div>
                    <ChevronLeft className="h-4 w-4 shrink-0 text-gray-300" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* مودال افزودن وعده */}
      {showAddMeal && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 px-4 pb-6 backdrop-blur-sm sm:items-center"
          onClick={() => setShowAddMeal(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-base font-bold text-gray-900">افزودن وعده</h3>
              <button
                type="button"
                onClick={() => setShowAddMeal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 px-5 py-5">
              <div>
                <p className="mb-2 text-xs font-bold text-gray-500">نوع وعده</p>
                <div className="grid grid-cols-4 gap-2">
                  {MEAL_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setMealType(t.id)}
                      className={`flex flex-col items-center gap-1 rounded-2xl px-1 py-2.5 text-[11px] font-semibold ring-1 transition ${
                        mealType === t.id
                          ? 'bg-indigo-600 text-white ring-indigo-600'
                          : 'bg-gray-50 text-gray-600 ring-gray-100'
                      }`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-500">نام غذا (اختیاری)</label>
                <input
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="مثلاً مرغ و برنج"
                  className="w-full rounded-2xl bg-[#F6F8FC] px-4 py-3 text-sm text-gray-800 outline-none ring-1 ring-indigo-100 focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-500">کالری (kcal)</label>
                <input
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={mealCalories}
                  onChange={(e) => setMealCalories(e.target.value)}
                  placeholder="مثلاً ۳۵۰"
                  className="w-full rounded-2xl bg-[#F6F8FC] px-4 py-3 text-center text-sm text-gray-800 outline-none ring-1 ring-indigo-100 focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <Button
                className="w-full rounded-2xl bg-indigo-600 py-6 text-white hover:bg-indigo-700"
                onClick={handleAddMeal}
                disabled={!mealCalories || Number(mealCalories) <= 0}
              >
                ثبت وعده
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* مودال ویرایش هدف */}
      {showGoalEdit && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 px-4 pb-6 backdrop-blur-sm sm:items-center"
          onClick={() => setShowGoalEdit(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-base font-bold text-gray-900">هدف کالری روزانه</h3>
              <button
                type="button"
                onClick={() => setShowGoalEdit(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 px-5 py-5">
              <p className="text-xs leading-relaxed text-gray-500">
                عددی بین ۸۰۰ تا ۶۰۰۰ کیلوکالری وارد کنید.
              </p>
              <input
                type="number"
                min="800"
                max="6000"
                inputMode="numeric"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="w-full rounded-2xl bg-[#F6F8FC] px-4 py-3 text-center text-lg font-bold text-gray-800 outline-none ring-1 ring-indigo-100 focus:ring-2 focus:ring-indigo-300"
              />
              <Button
                className="w-full rounded-2xl bg-indigo-600 py-6 text-white hover:bg-indigo-700"
                onClick={handleSaveGoal}
              >
                ذخیره هدف
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* مودال بینش */}
      {selectedInsight && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 px-4 pb-6 backdrop-blur-sm sm:items-center"
          onClick={() => setSelectedInsight(null)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const style = toneStyles[selectedInsight.tone];
              const Icon = style.Icon;
              return (
                <>
                  <div className={`relative overflow-hidden bg-gradient-to-br px-6 pb-8 pt-6 ${style.header}`}>
                    <button
                      type="button"
                      onClick={() => setSelectedInsight(null)}
                      className="relative z-10 mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur-sm"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{selectedInsight.title}</h3>
                    </div>
                  </div>
                  <div className="space-y-5 px-6 py-6">
                    <p className="text-sm leading-relaxed text-gray-600">{selectedInsight.details}</p>
                    <ul className="space-y-2.5">
                      {selectedInsight.tips.map((tip) => (
                        <li
                          key={tip}
                          className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm text-gray-600 ring-1 ${style.tipBg} ${style.tipRing}`}
                        >
                          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${style.tipDot}`} />
                          <span className="leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className={style.button} onClick={() => setSelectedInsight(null)}>
                      متوجه شدم
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
