export interface BodyMeasurements {
  neck: string;
  waist: string;
  arm: string;
  thigh: string;
  chest: string;
}

export interface FitnessProfileSnapshot {
  weightKg: number | null;
  heightCm: number | null;
  age: number | null;
  gender: 'male' | 'female' | null;
}

const MEASUREMENTS_PREFIX = 'body_measurements_';

function measurementsKey(userId: number | string): string {
  return `${MEASUREMENTS_PREFIX}${userId}`;
}

export function emptyMeasurements(): BodyMeasurements {
  return { neck: '', waist: '', arm: '', thigh: '', chest: '' };
}

export function loadBodyMeasurements(userId: number | string): BodyMeasurements {
  try {
    const raw = localStorage.getItem(measurementsKey(userId));
    if (!raw) return emptyMeasurements();
    const parsed = JSON.parse(raw) as Partial<BodyMeasurements>;
    return {
      neck: typeof parsed.neck === 'string' ? parsed.neck : '',
      waist: typeof parsed.waist === 'string' ? parsed.waist : '',
      arm: typeof parsed.arm === 'string' ? parsed.arm : '',
      thigh: typeof parsed.thigh === 'string' ? parsed.thigh : '',
      chest: typeof parsed.chest === 'string' ? parsed.chest : '',
    };
  } catch {
    return emptyMeasurements();
  }
}

export function saveBodyMeasurements(
  userId: number | string,
  data: BodyMeasurements,
): void {
  try {
    localStorage.setItem(measurementsKey(userId), JSON.stringify(data));
  } catch {
    // localStorage ممکن است در حالت خصوصی در دسترس نباشد
  }
}

/** Mifflin–St Jeor + ضریب فعالیت متوسط */
export function estimateDailyCalorieGoal(profile: FitnessProfileSnapshot): number | null {
  const { weightKg, heightCm, age, gender } = profile;
  if (
    weightKg == null ||
    heightCm == null ||
    age == null ||
    !gender ||
    weightKg <= 0 ||
    heightCm <= 0 ||
    age <= 0
  ) {
    return null;
  }

  const bmr =
    gender === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const tdee = Math.round(bmr * 1.55);
  return Math.min(6000, Math.max(800, tdee));
}

export function profileFromUser(user: {
  weight?: number | null;
  height?: number | null;
  age?: number | null;
  gender?: number | string | null;
} | null | undefined): FitnessProfileSnapshot {
  if (!user) {
    return { weightKg: null, heightCm: null, age: null, gender: null };
  }

  let gender: 'male' | 'female' | null = null;
  if (user.gender === 0 || user.gender === 'male' || user.gender === '0') gender = 'male';
  if (user.gender === 1 || user.gender === 'female' || user.gender === '1') gender = 'female';

  const weightKg =
    typeof user.weight === 'number' && Number.isFinite(user.weight) ? user.weight : null;
  const heightCm =
    typeof user.height === 'number' && Number.isFinite(user.height) ? user.height : null;
  const age = typeof user.age === 'number' && Number.isFinite(user.age) ? user.age : null;

  return { weightKg, heightCm, age, gender };
}

export function splitMealBudgets(dailyGoal: number): {
  breakfast: number;
  lunch: number;
  dinner: number;
} {
  return {
    breakfast: Math.round(dailyGoal * 0.3),
    lunch: Math.round(dailyGoal * 0.35),
    dinner: Math.round(dailyGoal * 0.35),
  };
}
