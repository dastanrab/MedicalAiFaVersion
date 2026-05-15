import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Search,
  ArrowLeft,
  FileText,
  CheckSquare,
  Sparkles,
  Brain,
  Thermometer,
  Wind,
  UtensilsCrossed,
  Heart,
  Activity,
  X,
  PenLine,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { AppBar } from '../components/AppBar';

const symptoms = [
  { id: 'headache', label: 'سردرد', category: 'سر' },
  { id: 'fever', label: 'تب', category: 'عمومی' },
  { id: 'cough', label: 'سرفه', category: 'تنفسی' },
  { id: 'sore-throat', label: 'گلودرد', category: 'تنفسی' },
  { id: 'fatigue', label: 'خستگی', category: 'عمومی' },
  { id: 'nausea', label: 'حالت تهوع', category: 'گوارشی' },
  { id: 'dizziness', label: 'سرگیجه', category: 'سر' },
  { id: 'body-ache', label: 'درد بدن', category: 'عمومی' },
  { id: 'runny-nose', label: 'آبریزش بینی', category: 'تنفسی' },
  { id: 'chest-pain', label: 'درد قفسه سینه', category: 'قفسه سینه' },
  { id: 'shortness-breath', label: 'تنگی نفس', category: 'تنفسی' },
  { id: 'stomach-pain', label: 'درد شکم', category: 'گوارشی' },
];

const categoryMeta: Record<
  string,
  { icon: LucideIcon; chip: string; iconBg: string; iconColor: string; selected: string; ring: string }
> = {
  سر: {
    icon: Brain,
    chip: 'bg-violet-50 text-violet-700 border-violet-100',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    selected: 'from-violet-500 to-purple-600',
    ring: 'ring-violet-200',
  },
  عمومی: {
    icon: Thermometer,
    chip: 'bg-amber-50 text-amber-700 border-amber-100',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    selected: 'from-amber-500 to-orange-500',
    ring: 'ring-amber-200',
  },
  تنفسی: {
    icon: Wind,
    chip: 'bg-sky-50 text-sky-700 border-sky-100',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    selected: 'from-sky-500 to-cyan-500',
    ring: 'ring-sky-200',
  },
  گوارشی: {
    icon: UtensilsCrossed,
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    selected: 'from-emerald-500 to-teal-500',
    ring: 'ring-emerald-200',
  },
  'قفسه سینه': {
    icon: Heart,
    chip: 'bg-rose-50 text-rose-700 border-rose-100',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    selected: 'from-rose-500 to-pink-500',
    ring: 'ring-rose-200',
  },
};

const allCategories = [...new Set(symptoms.map((s) => s.category))];

type InputMode = 'select' | 'text';

export type SymptomFormState = {
  mode: InputMode;
  selectedSymptoms: string[];
  freeText: string;
  age: string;
  gender: 'male' | 'female' | '';
  medicalHistory: string;
};

export function SymptomSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<InputMode>('select');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [freeText, setFreeText] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [error, setError] = useState<string | null>(null);

  const buildFormState = (): SymptomFormState => ({
    mode,
    selectedSymptoms,
    freeText,
    age,
    gender,
    medicalHistory,
  });

  useEffect(() => {
    const saved = location.state as SymptomFormState | null;
    if (!saved || typeof saved !== 'object' || !('mode' in saved)) return;
    setMode(saved.mode ?? 'select');
    setSelectedSymptoms(saved.selectedSymptoms ?? []);
    setFreeText(saved.freeText ?? '');
    setAge(saved.age ?? '');
    setGender(saved.gender ?? '');
    setMedicalHistory(saved.medicalHistory ?? '');
  }, [location.key]);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const filteredSymptoms = useMemo(() => {
    return symptoms.filter((symptom) => {
      const matchesSearch = symptom.label.includes(searchQuery);
      const matchesCategory = !activeCategory || symptom.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const selectedLabels = symptoms
    .filter((s) => selectedSymptoms.includes(s.id))
    .map((s) => s.label);

  const handleContinueWithSelection = () => {
    const symptomFormState = buildFormState();
    navigate('/questionnairev1', { state: { selectedSymptoms, symptomFormState } });
  };

  const handleSubmitFreeText = () => {
    if (!freeText.trim()) {
      setError('لطفاً علائم خود را شرح دهید');
      return;
    }

    const payload: Record<string, unknown> = { symptoms: freeText };
    if (age) payload.age = Number(age);
    if (gender) payload.gender = gender;
    if (medicalHistory) payload.medical_history = medicalHistory;

    navigate('/diagnosis-result', {
      state: {
        requestPayload: payload,
        isLoading: true,
        symptomFormState: buildFormState(),
      },
    });
  };

  return (
    <div
      className="h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white pb-32 text-right font-[YekanBakhFaNum]"
      dir="rtl"
    >
      <AppBar />

      <div className="px-6 pt-24 py-8">
        {/* Hero Header — same style as DoctorList */}
        <div className="relative mb-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 px-5 pt-5 pb-11 shadow-[0_8px_32px_rgba(37,99,235,0.28)]">
            <div className="pointer-events-none absolute -top-10 -left-10 h-36 w-36 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-white/10" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '18px 18px',
              }}
            />
            <div className="relative z-10 flex items-center gap-4" dir="rtl">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div className="min-w-0 flex-1 text-right">
                <h1 className="text-xl font-bold leading-tight text-white">تشخیص هوشمند علائم</h1>
                <p className="mt-0.5 text-sm leading-snug text-blue-100">
                  علائم را انتخاب کنید یا به زبان خودتان توضیح دهید
                </p>
              </div>
            </div>
          </div>

          {/* Mode toggle — floating over hero */}
          <div className="relative z-10 -mt-[1.625rem] px-1">
            <div className="flex h-12 gap-1 rounded-full bg-white px-1 pb-1 pt-[3px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-gray-100">
              <button
                type="button"
                onClick={() => setMode('select')}
                className={`flex h-full flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-all duration-200 ${
                  mode === 'select'
                    ? 'bg-gradient-to-l from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/30'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <CheckSquare className="h-4 w-4 shrink-0" />
                <span>انتخاب از لیست</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('text')}
                className={`flex h-full flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition-all duration-200 ${
                  mode === 'text'
                    ? 'bg-gradient-to-l from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/30'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span>توضیح آزاد</span>
              </button>
            </div>
          </div>
        </div>

        {/* Select Mode */}
        {mode === 'select' && (
          <>
            {/* Search — floating style */}
            <div className="relative mb-5">
              <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-400" />
              <Input
                placeholder="جستجوی علائم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 rounded-full border-0 bg-white pr-11 text-right shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-300"
              />
            </div>

            {/* Category chips */}
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  activeCategory === null
                    ? 'border-blue-200 bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-100 hover:bg-blue-50'
                }`}
              >
                همه
              </button>
              {allCategories.map((cat) => {
                const meta = categoryMeta[cat];
                const Icon = meta?.icon ?? Activity;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                      activeCategory === cat
                        ? 'border-blue-200 bg-blue-600 text-white shadow-md shadow-blue-500/25'
                        : `${meta?.chip ?? 'bg-gray-50 text-gray-600 border-gray-200'} hover:opacity-90`
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Selected symptoms */}
            {selectedSymptoms.length > 0 && (
              <div className="mb-5 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-l from-blue-50 to-indigo-50/80 p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                    <Activity className="h-3.5 w-3.5" />
                    {selectedSymptoms.length.toLocaleString('fa-IR')} علامت
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSymptoms([])}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800"
                  >
                    پاک کردن همه
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {selectedLabels.map((label) => (
                    <Badge
                      key={label}
                      variant="secondary"
                      className="gap-1 rounded-full border-blue-200 bg-white px-3 py-1 text-blue-800"
                    >
                      {label}
                      <button
                        type="button"
                        onClick={() => {
                          const id = symptoms.find((s) => s.label === label)?.id;
                          if (id) toggleSymptom(id);
                        }}
                        className="mr-0.5 rounded-full p-0.5 hover:bg-blue-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Symptoms grid */}
            <div className="grid grid-cols-2 gap-3">
              {filteredSymptoms.map((symptom) => {
                const isSelected = selectedSymptoms.includes(symptom.id);
                const meta = categoryMeta[symptom.category];
                const Icon = meta?.icon ?? Activity;

                return (
                  <button
                    key={symptom.id}
                    type="button"
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`group relative overflow-hidden rounded-2xl border p-4 text-right transition-all duration-200 active:scale-[0.98] ${
                      isSelected
                        ? `border-transparent bg-gradient-to-br ${meta?.selected ?? 'from-blue-500 to-indigo-500'} text-white shadow-[0_4px_20px_rgba(59,130,246,0.35)] ring-2 ${meta?.ring ?? 'ring-blue-200'}`
                        : 'border-gray-100 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] hover:border-blue-100'
                    }`}
                  >
                    {isSelected && (
                      <div className="pointer-events-none absolute -top-6 -left-6 h-20 w-20 rounded-full bg-white/10" />
                    )}
                    <div className="relative flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                            isSelected
                              ? 'bg-white/20 ring-1 ring-white/30'
                              : (meta?.iconBg ?? 'bg-blue-50')
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${isSelected ? 'text-white' : (meta?.iconColor ?? 'text-blue-600')}`}
                          />
                        </div>
                        <Checkbox
                          checked={isSelected}
                          className={`pointer-events-none border-2 ${
                            isSelected ? 'border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-600' : ''
                          }`}
                        />
                      </div>
                      <div>
                        <p className={`text-sm font-bold leading-snug ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                          {symptom.label}
                        </p>
                        <p
                          className={`mt-0.5 text-[11px] font-medium ${
                            isSelected ? 'text-white/80' : 'text-gray-400'
                          }`}
                        >
                          {symptom.category}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredSymptoms.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                  <Search className="h-7 w-7 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600">علامتی با این جستجو پیدا نشد</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory(null);
                  }}
                  className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  نمایش همه علائم
                </button>
              </div>
            )}
          </>
        )}

        {/* Text Mode */}
        {mode === 'text' && (
          <Card className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
            <div className="mb-5 flex items-center gap-3 rounded-xl bg-gradient-to-l from-blue-50 to-indigo-50 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md shadow-blue-500/25">
                <PenLine className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">توضیح آزاد علائم</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  هرچه دقیق‌تر بنویسید، تشخیص دقیق‌تر خواهد بود
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  علائم خود را شرح دهید *
                </label>
                <textarea
                  value={freeText}
                  onChange={(e) => {
                    setFreeText(e.target.value);
                    if (error) setError(null);
                  }}
                  rows={5}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-right text-sm leading-relaxed transition-colors placeholder:text-gray-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="مثال: از دیروز سردرد شدید دارم و تب کرده‌ام..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">سن</label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="h-11 rounded-xl border-gray-200 bg-gray-50/50 text-right focus:bg-white"
                    placeholder="مثال: ۳۰"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">جنسیت</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female' | '')}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 text-right text-sm focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">انتخاب کنید</option>
                    <option value="male">مرد</option>
                    <option value="female">زن</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  سابقه پزشکی (اختیاری)
                </label>
                <textarea
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-right text-sm leading-relaxed transition-colors placeholder:text-gray-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="بیماری‌های قبلی، داروهای مصرفی و..."
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-right text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div className="pointer-events-none fixed bottom-20 left-0 right-0 flex justify-center bg-gradient-to-t from-white via-white to-transparent p-6">
        {mode === 'select' ? (
          <button
            type="button"
            onClick={handleContinueWithSelection}
            disabled={selectedSymptoms.length === 0}
            className="group pointer-events-auto relative z-10 inline-flex items-center gap-2.5 rounded-full border border-blue-100/90 bg-gradient-to-b from-white via-white to-blue-50/90 py-1.5 pl-1.5 pr-4 text-xs font-semibold text-blue-700 shadow-[0_4px_24px_-6px_rgba(59,130,246,0.28)] transition-all duration-300 hover:border-blue-200 hover:text-blue-800 hover:shadow-[0_8px_32px_-6px_rgba(59,130,246,0.38)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-blue-100/90 disabled:hover:shadow-[0_4px_24px_-6px_rgba(59,130,246,0.28)]"
          >
            <span className="tracking-tight">ادامه سوالات</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30 transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-700 group-hover:shadow-blue-500/40 group-disabled:from-blue-500 group-disabled:to-blue-600">
              <ArrowLeft className="h-3.5 w-3.5" />
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitFreeText}
            disabled={!freeText.trim()}
            className="group pointer-events-auto relative z-10 inline-flex items-center gap-2.5 rounded-full border border-blue-100/90 bg-gradient-to-b from-white via-white to-blue-50/90 py-1.5 pl-1.5 pr-4 text-xs font-semibold text-blue-700 shadow-[0_4px_24px_-6px_rgba(59,130,246,0.28)] transition-all duration-300 hover:border-blue-200 hover:text-blue-800 hover:shadow-[0_8px_32px_-6px_rgba(59,130,246,0.38)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-blue-100/90 disabled:hover:shadow-[0_4px_24px_-6px_rgba(59,130,246,0.28)]"
          >
            <span className="tracking-tight">دریافت تشخیص</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30 transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-700 group-hover:shadow-blue-500/40 group-disabled:from-blue-500 group-disabled:to-blue-600">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
