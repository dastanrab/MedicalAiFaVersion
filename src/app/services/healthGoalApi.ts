import { USER_API_BASE_URL } from '../config/api';

/**
 * هدف کالری روزانه در بک‌اند.
 * کاربر وزن ایده‌آل را می‌فرستد و سرور هدف کالری را بر اساس آن (و پروفایل کاربر) محاسبه می‌کند.
 *
 * GET  /api/user/health/goal
 * PUT  /api/user/health/goal   { "ideal_weight": 68.5 }
 * → { "success": true, "data": { "daily_calorie_goal": 1950, "ideal_weight": 68.5, "source": "calculated" } }
 */
export type HealthGoal = {
  dailyCalorieGoal: number;
  idealWeight: number | null;
  source: 'custom' | 'calculated' | 'default' | null;
};

const GOAL_URL = `${USER_API_BASE_URL}/health/goal`;

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

function parseGoal(json: unknown): HealthGoal | null {
  const data = (json as { success?: boolean; data?: Record<string, unknown> } | null)?.data;
  if (!(json as { success?: boolean })?.success || !data) return null;

  const goal = Number(data.daily_calorie_goal);
  if (!Number.isFinite(goal) || goal <= 0) return null;

  const weight = data.ideal_weight == null ? null : Number(data.ideal_weight);
  const source = data.source;

  return {
    dailyCalorieGoal: Math.round(goal),
    idealWeight: weight != null && Number.isFinite(weight) ? weight : null,
    source: source === 'custom' || source === 'calculated' || source === 'default' ? source : null,
  };
}

async function readError(res: Response): Promise<string> {
  try {
    const json = await res.json();
    if (json?.errors) return Object.values(json.errors).flat().join('\n');
    if (typeof json?.message === 'string' && json.message) return json.message;
  } catch {
    // پاسخ JSON نیست
  }
  return 'خطا در ارتباط با سرور';
}

export class HealthGoalUnavailableError extends Error {}

/** هدف ذخیره‌شده در سرور؛ اگر سرویس در دسترس نباشد `null`. */
export async function fetchHealthGoal(accessToken: string): Promise<HealthGoal | null> {
  try {
    const res = await fetch(GOAL_URL, { headers: authHeaders(accessToken) });
    if (!res.ok) return null;
    return parseGoal(await res.json());
  } catch {
    return null;
  }
}

/**
 * ارسال وزن ایده‌آل و دریافت هدف کالری محاسبه‌شده.
 * اگر endpoint هنوز در بک‌اند نباشد (۴۰۴/۴۰۵ یا خطای شبکه) `HealthGoalUnavailableError` می‌دهد.
 */
export async function submitIdealWeight(accessToken: string, idealWeight: number): Promise<HealthGoal> {
  let res: Response;
  try {
    res = await fetch(GOAL_URL, {
      method: 'PUT',
      headers: authHeaders(accessToken),
      body: JSON.stringify({ ideal_weight: idealWeight }),
    });
  } catch {
    throw new HealthGoalUnavailableError('network');
  }

  if (res.status === 404 || res.status === 405) {
    throw new HealthGoalUnavailableError(String(res.status));
  }
  if (!res.ok) {
    throw new Error(await readError(res));
  }

  const goal = parseGoal(await res.json());
  if (!goal) throw new Error('پاسخ نامعتبر از سرور');
  return goal;
}
