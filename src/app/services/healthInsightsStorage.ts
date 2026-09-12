export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealEntry {
  id: string;
  type: MealType;
  name: string;
  calories: number;
  createdAt: string;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  meals: MealEntry[];
}

export interface HealthInsightsData {
  dailyGoal: number;
  days: Record<string, DayLog>;
}

export const DEFAULT_DAILY_GOAL = 2000;

const STORAGE_PREFIX = 'health_insights_';

function storageKey(userId: number | string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createMealId(): string {
  return `meal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyData(): HealthInsightsData {
  return { dailyGoal: DEFAULT_DAILY_GOAL, days: {} };
}

export function loadHealthInsights(userId: number | string): HealthInsightsData {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return emptyData();
    const parsed = JSON.parse(raw) as Partial<HealthInsightsData>;
    const dailyGoal =
      typeof parsed.dailyGoal === 'number' && parsed.dailyGoal > 0
        ? Math.round(parsed.dailyGoal)
        : DEFAULT_DAILY_GOAL;
    const days: Record<string, DayLog> = {};
    if (parsed.days && typeof parsed.days === 'object') {
      for (const [date, log] of Object.entries(parsed.days)) {
        if (!log || typeof log !== 'object') continue;
        const meals = Array.isArray(log.meals)
          ? log.meals.filter(
              (m): m is MealEntry =>
                !!m &&
                typeof m === 'object' &&
                typeof m.id === 'string' &&
                typeof m.calories === 'number' &&
                m.calories >= 0,
            )
          : [];
        days[date] = { date, meals };
      }
    }
    return { dailyGoal, days };
  } catch {
    return emptyData();
  }
}

export function saveHealthInsights(userId: number | string, data: HealthInsightsData): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(data));
  } catch {
    // localStorage ممکن است در حالت خصوصی در دسترس نباشد
  }
}

export function dayTotal(log: DayLog | undefined): number {
  if (!log) return 0;
  return log.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
}

export function getDayLog(data: HealthInsightsData, date: string): DayLog {
  return data.days[date] ?? { date, meals: [] };
}

/** آخرین N روز شامل امروز، از قدیمی به جدید */
export function recentDayTotals(
  data: HealthInsightsData,
  daysCount = 7,
): { date: string; total: number }[] {
  const result: { date: string; total: number }[] = [];
  const today = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = getLocalDateString(d);
    result.push({ date: key, total: dayTotal(data.days[key]) });
  }
  return result;
}
