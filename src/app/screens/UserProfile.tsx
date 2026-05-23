import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import {
  LogOut,
  Scale,
  Ruler,
  Calendar,
  MapPin,
  Check,
  Sparkles,
  UserRound,
  Mars,
  Venus,
  HeartPulse,
  type LucideIcon,
} from 'lucide-react';
import { AppBar } from '../components/AppBar';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useAuthStore } from '../store/authStore';
import { iranProvinces, iranCitiesByProvince } from '../data/iranLocations';

const pageClass =
  'h-full min-h-0 overflow-x-hidden overflow-y-auto overscroll-y-auto bg-gradient-to-b from-blue-50 to-white pb-28 text-right font-[YekanBakhFaNum] [-webkit-overflow-scrolling:touch]';

const inputClass =
  'h-11 rounded-xl border-0 bg-gray-50/80 text-right text-sm text-gray-800 shadow-none ring-1 ring-gray-100 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-300';

const selectClass =
  'w-full h-11 rounded-xl px-3 bg-gray-50/80 border-0 text-gray-700 text-sm text-right ring-1 ring-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all cursor-pointer';

type ProfileFormData = {
  firstName: string;
  lastName: string;
  gender: string;
  age: string;
  weight: string;
  height: string;
  province: string;
  city: string;
};

function sanitizeNonNegative(value: string): string {
  if (value === '') return '';
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return '';
  return value;
}
function ErrorAlert({ message, onClose }: { message: string; onClose: () => void }) {
  if (!message) return null;

  return (
      <div className="relative mb-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 px-4 py-3 shadow-[0_8px_24px_rgba(239,68,68,0.3)]">
          <div className="relative z-10 flex items-start gap-3" dir="rtl">
            <div className="flex-1">
              <p className="text-xs font-bold text-white sm:text-sm">خطا در ذخیره اطلاعات</p>
              <p className="mt-1 whitespace-pre-line text-[11px] leading-relaxed text-red-50 sm:text-xs">
                {message}
              </p>
            </div>
            <button
                onClick={onClose}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
  );
}

function IncompleteProfileWarning({ show }: { show: boolean }) {
  if (!show) return null;

  return (
      <div className="relative mb-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-rose-600 to-pink-600 px-4 py-3 shadow-[0_8px_24px_rgba(239,68,68,0.3)] sm:px-4">
          <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-sm" />
          <div className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-pink-400/25 blur-sm" />
          <div
              className="pointer-events-none absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
          />
          <div className="relative z-10 flex items-center gap-3" dir="rtl">
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white ring-1 ring-white/25">
                <HeartPulse className="h-2.5 w-2.5" />
                تکمیل پروفایل
              </p>
              <h1 className="mt-1.5 text-xs font-bold leading-tight text-white sm:text-sm">
                نام و جنسیت برای ادامه فرایند لازم است
              </h1>
              <p className="mt-1 text-[11px] leading-relaxed text-red-100 sm:text-xs">
                لطفاً نام و جنسیت خود را وارد کنید.
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}



export function UserProfile() {
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { accessToken, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    gender: '',
    age: '',
    weight: '',
    height: '',
    province: '',
    city: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!accessToken) {
        navigate('/');
        return;
      }

      const response = await fetch('http://185.222.163.113:7000/api/user/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('خطا در دریافت اطلاعات');

      const data = await response.json();

      if (data.success) {
        const user = data.data.user;
        setFormData({
          firstName: user.name?.split(' ')[0]?.substring(0, 10) || '',
          lastName: user.name?.split(' ')[1]?.substring(0, 10) || '',
          gender: user.gender === 0 ? 'male' : user.gender === 1 ? 'female' : 'male',
          age: user.age != null ? String(Math.max(0, user.age)) : '',
          weight: user.weight != null ? String(Math.max(0, user.weight)) : '',
          height: user.height != null ? String(Math.max(0, user.height)) : '',
          province: user.province || '',
          city: user.city || '',
        });
      }
    } catch (error) {
      console.error('خطا در دریافت پروفایل:', error);
      alert('خطا در دریافت اطلاعات پروفایل');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setErrorMessage('');
      const response = await fetch('http://185.222.163.113:7000/api/user/profile/update', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          gender: formData.gender === 'female' ? 1 : 0,
          age: parseInt(formData.age, 10),
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
        }),
      });

      const data = await response.json();

      if (data.success) {
        navigate('/home');
      } else {
        const errorMsg = data.errors
            ? Object.values(data.errors).flat().join('\n')
            : data.message;
        setErrorMessage(errorMsg || 'خطا در ذخیره اطلاعات');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('خطا در برقراری ارتباط با سرور');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: string) => {
    if (field === 'age' || field === 'weight' || field === 'height') {
      setFormData({ ...formData, [field]: sanitizeNonNegative(value) });
      return;
    }
    if (field === 'province') {
      setFormData({ ...formData, province: value, city: '' });
      return;
    }
    setFormData({ ...formData, [field]: value });
  };

  const availableCities = formData.province
    ? iranCitiesByProvince[formData.province] || []
    : [];

  if (loading) {
    return (
      <ProfileScrollShell>
        <LoadingSpinner />
      </ProfileScrollShell>
    );
  }

  return (
    <ProfileScrollShell>
      <AppBar />

      <div className="mx-auto w-full max-w-lg px-3 pb-6 pt-24 sm:px-4">
        <ProfileHero />
        <IncompleteProfileWarning
            show={!formData.firstName || !formData.gender}
        />
        <ErrorAlert message={errorMessage} onClose={() => setErrorMessage('')} />
        <Card
          dir="rtl"
          className="gap-0 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)] text-right sm:p-5"
        >
          <div className="space-y-4">
            <NameRow formData={formData} updateField={updateField} />

            <Field label="جنسیت">
              <GenderSelector
                value={formData.gender}
                onChange={(g) => updateField('gender', g)}
              />
            </Field>

            <MetricsRow formData={formData} updateField={updateField} />

            <LocationRow formData={formData} updateField={updateField} availableCities={availableCities} />
          </div>

          <div className="mt-3 flex justify-center">
            <SaveProfileButton saving={saving} onClick={handleSubmit} />
          </div>
        </Card>

        <button
          type="button"
          onClick={logout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white py-3 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          خروج از حساب کاربری
        </button>
      </div>
    </ProfileScrollShell>
  );
}

function ProfileScrollShell({ children }: { children: ReactNode }) {
  return <div className={pageClass}>{children}</div>;
}

function LoadingSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <SpinnerContent />
    </div>
  );
}

function SpinnerContent() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      <p className="text-sm text-gray-600">در حال بارگذاری...</p>
    </div>
  );
}

function ProfileHero() {
  return (
    <div className="relative mb-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 px-4 py-5 shadow-[0_12px_40px_rgba(79,70,229,0.35)] sm:px-5">
        <div className="pointer-events-none absolute -top-14 -left-14 h-44 w-44 rounded-full bg-white/10 blur-sm" />
        <div className="pointer-events-none absolute -bottom-12 -right-10 h-36 w-36 rounded-full bg-violet-400/25 blur-sm" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative z-10 flex items-center gap-4" dir="rtl">
          <div className="relative shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 ring-2 ring-white/40 backdrop-blur-md shadow-lg shadow-indigo-900/20">
              <UserRound className="h-8 w-8 text-white" strokeWidth={1.75} />
            </div>
            <span className="absolute -bottom-0.5 -left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-white shadow-sm">
              <Sparkles className="h-3 w-3 text-white" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white ring-1 ring-white/25">
              <HeartPulse className="h-3 w-3" />
              پروفایل سلامت
            </p>
            <h1 className="mt-2 text-sm font-bold leading-tight text-white sm:text-base">تکمیل پروفایل</h1>
            <p className="mt-1.5 text-xs leading-relaxed text-blue-100 sm:text-sm">
              اطلاعات خود را برای دریافت پیشنهادهای دقیق‌تر وارد کنید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


function LocationRow({
  formData,
  updateField,
  availableCities,
}: {
  formData: ProfileFormData;
  updateField: (field: string, value: string) => void;
  availableCities: string[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="استان" icon={<MapPin className="h-3.5 w-3.5 text-blue-500" />}>
        <select
          value={formData.province}
          onChange={(e) => updateField('province', e.target.value)}
          className={selectClass}
        >
          <option value="">انتخاب استان</option>
          {iranProvinces.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </Field>
      <Field label="شهر" icon={<MapPin className="h-3.5 w-3.5 text-blue-500" />}>
        <select
          value={formData.city}
          onChange={(e) => updateField('city', e.target.value)}
          disabled={!formData.province}
          className={`${selectClass} ${!formData.province ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <option value="">{formData.province ? 'انتخاب شهر' : 'ابتدا استان'}</option>
          {availableCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}

function NameRow({
  formData,
  updateField,
}: {
  formData: Pick<ProfileFormData, 'firstName' | 'lastName'>;
  updateField: (field: string, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="نام">
        <Input
          placeholder="علی"
          value={formData.firstName}
          onChange={(e) => updateField('firstName', e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="نام خانوادگی">
        <Input
          placeholder="احمدی"
          value={formData.lastName}
          onChange={(e) => updateField('lastName', e.target.value)}
          className={inputClass}
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-700">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

function GenderSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (gender: string) => void;
}) {
  const options: {
    id: string;
    label: string;
    Icon: LucideIcon;
    gradient: string;
    iconBg: string;
    iconColor: string;
  }[] = [
    {
      id: 'male',
      label: 'مرد',
      Icon: Mars,
      gradient: 'from-sky-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 'female',
      label: 'زن',
      Icon: Venus,
      gradient: 'from-rose-400 to-pink-600',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
    },
  ];

  return (
    <div className="grid w-full grid-cols-2 gap-3">
      {options.map((opt) => {
        const active = value === opt.id;
        const Icon = opt.Icon;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`group relative flex w-full min-w-0 flex-col items-center gap-2 overflow-hidden rounded-2xl border-2 px-2 py-3 transition-all duration-200 active:scale-[0.98] ${
              active
                ? `border-transparent bg-gradient-to-br ${opt.gradient} shadow-lg shadow-black/10`
                : 'border-gray-100 bg-gray-50/80 hover:border-gray-200 hover:bg-white'
            }`}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                active ? 'bg-white/25 text-white' : `${opt.iconBg} ${opt.iconColor}`
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
            </span>
            <span
              className={`text-sm font-bold ${
                active ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'
              }`}
            >
              {opt.label}
            </span>
            {active && (
              <span className="absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/25">
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function MetricsRow({
  formData,
  updateField,
}: {
  formData: Pick<ProfileFormData, 'age' | 'weight' | 'height'>;
  updateField: (field: string, value: string) => void;
}) {
  const blockNegativeKey: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault();
  };

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <Field label="سن" icon={<Calendar className="h-3.5 w-3.5 text-blue-500" />}>
        <Input
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="۲۵"
          value={formData.age}
          onChange={(e) => updateField('age', e.target.value)}
          onKeyDown={blockNegativeKey}
          className={inputClass}
        />
      </Field>
      <Field label="وزن" icon={<Scale className="h-3.5 w-3.5 text-blue-500" />}>
        <Input
          type="number"
          min={0}
          step="0.1"
          inputMode="decimal"
          placeholder="۷۰"
          value={formData.weight}
          onChange={(e) => updateField('weight', e.target.value)}
          onKeyDown={blockNegativeKey}
          className={inputClass}
        />
      </Field>
      <Field label="قد" icon={<Ruler className="h-3.5 w-3.5 text-blue-500" />}>
        <Input
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="۱۷۵"
          value={formData.height}
          onChange={(e) => updateField('height', e.target.value)}
          onKeyDown={blockNegativeKey}
          className={inputClass}
        />
      </Field>
    </div>
  );
}

function SaveProfileButton({
  saving,
  onClick,
}: {
  saving: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="group inline-flex items-center gap-2.5 rounded-full border border-blue-100/90 bg-gradient-to-b from-white via-white to-blue-50/90 py-1.5 pl-1.5 pr-4 text-xs font-semibold text-blue-700 shadow-[0_4px_24px_-6px_rgba(59,130,246,0.28)] transition-all duration-300 hover:border-blue-200 hover:text-blue-800 hover:shadow-[0_8px_32px_-6px_rgba(59,130,246,0.38)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60"
    >
      <span className="tracking-tight">{saving ? 'در حال ذخیره...' : 'ذخیره پروفایل'}</span>
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/30 transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-700 group-hover:shadow-blue-500/40">
        <Check className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
