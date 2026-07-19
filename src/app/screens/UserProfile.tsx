import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import {
  LogOut,
  Scale,
  Ruler,
  Calendar,
  MapPin,
  MapPinned,
  Check,
  Sparkles,
  UserRound,
  Mars,
  Venus,
  HeartPulse,
  IdCard,
  ShieldCheck,
  Plus,
  Trash2,
  Star,
  type LucideIcon,
} from 'lucide-react';
import { AppBar } from '../components/AppBar';
import { PageLoader } from '../components/PageLoader';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useAuthStore } from '../store/authStore';
import { iranProvinces, iranCitiesByProvince } from '../data/iranLocations';
import { useUserStore } from '../store/useUserStore';
import { isValidNationalCode, toEnglishDigits } from '../provider/utils/validation';
import {
  INSURANCE_TYPES,
  createAddressId,
  loadProfileExtras,
  saveProfileExtras,
  type ProfileExtras,
  type UserAddress,
} from '../services/profileExtras';

const pageClass =
    'h-full min-h-0 overflow-x-hidden overflow-y-auto overscroll-y-auto bg-gradient-to-b from-blue-50 to-white pb-28 text-right font-[YekanBakhFaNum] [-webkit-overflow-scrolling:touch]';

const inputClass =
    'h-11 rounded-xl border-0 bg-gray-50/80 text-right text-sm text-gray-800 shadow-none ring-1 ring-gray-100 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-300';

const selectClass =
    'w-full h-11 rounded-xl px-3 bg-gray-50/80 border-0 text-gray-700 text-sm text-right ring-1 ring-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all cursor-pointer';

const API_BASE_URL = 'http://185.222.163.113:7000';

type ServerAddress = {
  id: number;
  title: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  created_at?: string;
  updated_at?: string;
};

type ProfileFormData = {
  firstName: string;
  lastName: string;
  gender: string;
  age: string;
  weight: string;
  height: string;
  province: number | '' | string;
  city: number | '' | string;
  nationalCode: string;
  insuranceType: string;
  insuranceNumber: string;
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
  const refreshUserProfile = useUserStore((state) => state.fetchProfile);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { accessToken, logout } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);

  const [userId, setUserId] = useState<number | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    gender: '',
    age: '',
    weight: '',
    height: '',
    province: '',
    city: '',
    nationalCode: '',
    insuranceType: '',
    insuranceNumber: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const authHeaders = () => ({
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  });

  const serverToLocal = (sa: ServerAddress, isDefault = false): UserAddress => ({
    id: String(sa.id),
    serverId: sa.id,
    title: sa.title ?? 'آدرس',
    details: sa.address,
    isDefault,
  });

  const buildProfileExtras = (nextAddresses: UserAddress[] = addresses): ProfileExtras | null => {
    if (userId == null) return null;

    return {
      nationalCode: toEnglishDigits(formData.nationalCode).replace(/\D/g, ''),
      insuranceType: formData.insuranceType,
      insuranceNumber: toEnglishDigits(formData.insuranceNumber),
      addresses: nextAddresses,
    };
  };

  const persistProfileExtras = (nextAddresses: UserAddress[] = addresses) => {
    const extras = buildProfileExtras(nextAddresses);
    if (userId != null && extras) {
      saveProfileExtras(userId, extras);
    }
  };

  const mergeServerAddressesWithLocalDefaults = (
      serverAddresses: ServerAddress[],
      savedAddresses: UserAddress[]
  ) => {
    const defaultServerId =
        savedAddresses.find((addr) => addr.isDefault && addr.serverId != null)?.serverId ?? null;

    const mapped = serverAddresses.map((address, index) =>
        serverToLocal(
            address,
            defaultServerId != null ? address.id === defaultServerId : index === 0
        )
    );

    if (mapped.length > 0 && !mapped.some((addr) => addr.isDefault)) {
      mapped[0] = { ...mapped[0], isDefault: true };
    }

    return mapped;
  };

  const fetchAddresses = async (savedAddresses: UserAddress[] = []) => {
    if (!accessToken) return;

    try {
      setAddressLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/user/addresses`, {
        method: 'GET',
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'خطا در دریافت آدرس‌ها');
      }

      const serverAddresses: ServerAddress[] = data.data?.addresses ?? [];
      const mergedAddresses = mergeServerAddressesWithLocalDefaults(serverAddresses, savedAddresses);

      setAddresses(mergedAddresses);

      if (userId != null) {
        const extras = buildProfileExtras(mergedAddresses);
        if (extras) {
          saveProfileExtras(userId, extras);
        }
      }
    } catch (error) {
      console.error('خطا در دریافت آدرس‌ها:', error);
      setErrorMessage('خطا در دریافت آدرس‌ها');
      setAddresses(savedAddresses);
    } finally {
      setAddressLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      if (!accessToken) {
        navigate('/');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'GET',
        headers: authHeaders(),
      });

      if (!response.ok) throw new Error('خطا در دریافت اطلاعات');

      const data = await response.json();

      if (data.success) {
        const user = data.data.user;
        const nextUserId = user.id ?? null;
        const extras = nextUserId != null ? loadProfileExtras(nextUserId) : null;

        setUserId(nextUserId);
        setFormData({
          firstName: user.name?.split(' ')[0]?.substring(0, 10) || '',
          lastName: user.name?.split(' ')[1]?.substring(0, 10) || '',
          gender: user.gender === 0 ? 'male' : user.gender === 1 ? 'female' : 'male',
          age: user.age != null ? String(Math.max(0, user.age)) : '',
          weight: user.weight != null ? String(Math.max(0, user.weight)) : '',
          height: user.height != null ? String(Math.max(0, user.height)) : '',
          province: user.province ?? '',
          city: user.city ?? '',
          nationalCode: user.national_code ?? extras?.nationalCode ?? '',
          insuranceType: user.insurance_type ?? extras?.insuranceType ?? '',
          insuranceNumber: user.insurance_number ?? extras?.insuranceNumber ?? '',
        });

        await fetchAddresses(extras?.addresses ?? []);
      }
    } catch (error) {
      console.error('خطا در دریافت پروفایل:', error);
      alert('خطا در دریافت اطلاعات پروفایل');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const nationalCode = toEnglishDigits(formData.nationalCode).replace(/\D/g, '');
    if (nationalCode && !isValidNationalCode(nationalCode)) {
      setErrorMessage('کد ملی وارد شده معتبر نیست');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');

      const response = await fetch(`${API_BASE_URL}/api/user/profile/update`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          gender: formData.gender === 'female' ? 1 : 0,
          age: formData.age ? parseInt(formData.age, 10) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          height: formData.height ? parseFloat(formData.height) : null,
          province: formData.province === '' ? null : Number(formData.province),
          city: formData.city === '' ? null : Number(formData.city),
          national_code: nationalCode,
          insurance_type: formData.insuranceType,
          insurance_number: toEnglishDigits(formData.insuranceNumber),
        }),
      });

      const data = await response.json();

      if (data.success) {
        persistProfileExtras(addresses);
        await refreshUserProfile(true);
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
      setFormData((prev) => ({ ...prev, [field]: sanitizeNonNegative(value) }));
      return;
    }

    if (field === 'province') {
      setFormData((prev) => ({ ...prev, province: value, city: '' }));
      return;
    }

    if (field === 'nationalCode') {
      setFormData((prev) => ({
        ...prev,
        nationalCode: toEnglishDigits(value).replace(/\D/g, '').slice(0, 10),
      }));
      return;
    }

    if (field === 'insuranceType' && value === 'none') {
      setFormData((prev) => ({
        ...prev,
        insuranceType: value,
        insuranceNumber: '',
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addAddress = async (title: string, details: string) => {
    if (!accessToken) return;
    if (!details.trim()) return;

    try {
      setAddressSaving(true);
      setErrorMessage('');

      const response = await fetch(`${API_BASE_URL}/api/user/addresses`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: title.trim() || 'آدرس جدید',
          address: details.trim(),
          lat: null,
          lng: null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.errors
            ? Object.values(data.errors).flat().join('\n')
            : data.message;
        setErrorMessage(errorMsg || 'خطا در ثبت آدرس');
        return false;
      }

      const createdAddress: ServerAddress = data.data.address;
      const nextAddress = serverToLocal(createdAddress, addresses.length === 0);
      const nextAddresses = [...addresses, nextAddress];

      setAddresses(nextAddresses);
      persistProfileExtras(nextAddresses);
      return true;
    } catch (error) {
      console.error('خطا در ثبت آدرس:', error);
      setErrorMessage('خطا در ثبت آدرس');
      return false;
    } finally {
      setAddressSaving(false);
    }
  };

  const removeAddress = async (id: string) => {
    if (!accessToken) return;

    const target = addresses.find((a) => a.id === id);
    if (!target?.serverId) return;

    try {
      setAddressSaving(true);
      setErrorMessage('');

      const response = await fetch(`${API_BASE_URL}/api/user/addresses/${target.serverId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || 'خطا در حذف آدرس');
        return;
      }

      const remaining = addresses.filter((a) => a.id !== id);

      if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
        remaining[0] = { ...remaining[0], isDefault: true };
      }

      setAddresses(remaining);
      persistProfileExtras(remaining);
    } catch (error) {
      console.error('خطا در حذف آدرس:', error);
      setErrorMessage('خطا در حذف آدرس');
    } finally {
      setAddressSaving(false);
    }
  };

  const setDefaultAddress = (id: string) => {
    const nextAddresses = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    setAddresses(nextAddresses);
    persistProfileExtras(nextAddresses);
  };

  const availableCities =
      formData.province !== '' ? (iranCitiesByProvince[Number(formData.province)] ?? []) : [];

  if (loading) {
    return (
        <ProfileScrollShell>
          <LoadingSpinner />
        </ProfileScrollShell>
    );
  }

  return (
      <ProfileScrollShell>
        <AppBar backTo="/home" />

        <div className="mx-auto w-full max-w-lg px-3 pb-6 pt-24 sm:px-4">
          <ProfileHero />
          <IncompleteProfileWarning show={!formData.firstName || !formData.gender} />
          <ErrorAlert message={errorMessage} onClose={() => setErrorMessage('')} />

          <Card
              dir="rtl"
              className="gap-0 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 text-right shadow-[0_2px_16px_rgba(0,0,0,0.06)] sm:p-5"
          >
            <div className="space-y-4">
              <NameRow formData={formData} updateField={updateField} />

              <Field label="جنسیت">
                <GenderSelector value={formData.gender} onChange={(g) => updateField('gender', g)} />
              </Field>

              <MetricsRow formData={formData} updateField={updateField} />

              <LocationRow
                  formData={formData}
                  updateField={updateField}
                  availableCities={availableCities}
              />

              <IdentityInsuranceSection formData={formData} updateField={updateField} />
            </div>

            <div className="mt-3 flex justify-center">
              <SaveProfileButton saving={saving} onClick={handleSubmit} />
            </div>
          </Card>

          <AddressesSection
              addresses={addresses}
              loading={addressLoading}
              saving={addressSaving}
              onAdd={addAddress}
              onRemove={removeAddress}
              onSetDefault={setDefaultAddress}
          />

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
  return <PageLoader />;
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
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 ring-2 ring-white/40 shadow-lg shadow-indigo-900/20 backdrop-blur-md">
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
              <h1 className="mt-2 text-sm font-bold leading-tight text-white sm:text-base">
                تکمیل پروفایل
              </h1>
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
  availableCities: Array<{ id: number; name: string }>;
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
            {iranProvinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
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
            {availableCities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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
                    <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/25">
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

function IdentityInsuranceSection({
                                    formData,
                                    updateField,
                                  }: {
  formData: Pick<ProfileFormData, 'nationalCode' | 'insuranceType' | 'insuranceNumber'>;
  updateField: (field: string, value: string) => void;
}) {
  const nationalCodeInvalid =
      formData.nationalCode.length === 10 && !isValidNationalCode(formData.nationalCode);

  return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <IdCard className="h-4 w-4" />
        </span>
          <span className="text-sm font-bold text-gray-800">اطلاعات هویتی و بیمه</span>
        </div>

        <Field label="کد ملی" icon={<IdCard className="h-3.5 w-3.5 text-blue-500" />}>
          <Input
              dir="ltr"
              inputMode="numeric"
              maxLength={10}
              placeholder="۰۰۱۲۳۴۵۶۷۸"
              value={formData.nationalCode}
              onChange={(e) => updateField('nationalCode', e.target.value)}
              className={`${inputClass} ${nationalCodeInvalid ? 'ring-2 ring-red-300' : ''}`}
          />
          {nationalCodeInvalid && (
              <p className="mt-1 text-[11px] text-red-500">کد ملی وارد شده معتبر نیست</p>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="نوع بیمه" icon={<ShieldCheck className="h-3.5 w-3.5 text-blue-500" />}>
            <select
                value={formData.insuranceType}
                onChange={(e) => updateField('insuranceType', e.target.value)}
                className={selectClass}
            >
              <option value="">انتخاب نوع بیمه</option>
              {INSURANCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
              ))}
            </select>
          </Field>

          <Field label="شماره بیمه" icon={<ShieldCheck className="h-3.5 w-3.5 text-blue-500" />}>
            <Input
                dir="ltr"
                inputMode="numeric"
                placeholder="شماره دفترچه / بیمه"
                value={formData.insuranceNumber}
                onChange={(e) => updateField('insuranceNumber', e.target.value)}
                disabled={formData.insuranceType === 'none'}
                className={`${inputClass} ${formData.insuranceType === 'none' ? 'cursor-not-allowed opacity-50' : ''}`}
            />
          </Field>
        </div>
      </div>
  );
}

function AddressesSection({
                            addresses,
                            loading,
                            saving,
                            onAdd,
                            onRemove,
                            onSetDefault,
                          }: {
  addresses: UserAddress[];
  loading: boolean;
  saving: boolean;
  onAdd: (title: string, details: string) => Promise<boolean | void>;
  onRemove: (id: string) => Promise<void>;
  onSetDefault: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

  const handleAdd = async () => {
    if (!details.trim()) return;

    const success = await onAdd(title, details);
    if (success) {
      setTitle('');
      setDetails('');
      setShowForm(false);
    }
  };

  return (
      <Card
          dir="rtl"
          className="mt-3 gap-0 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 text-right shadow-[0_2px_16px_rgba(0,0,0,0.06)] sm:p-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <MapPinned className="h-4 w-4" />
          </span>
            <span className="text-sm font-bold text-gray-800">آدرس‌های منتخب</span>
          </div>

          <button
              type="button"
              onClick={() => setShowForm((s) => !s)}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
          >
            <Plus className="h-3.5 w-3.5" />
            افزودن آدرس
          </button>
        </div>

        {loading && (
            <p className="mt-3 rounded-xl bg-gray-50/80 px-3 py-4 text-center text-xs text-gray-400">
              در حال دریافت آدرس‌ها...
            </p>
        )}

        {!loading && addresses.length === 0 && !showForm && (
            <p className="mt-3 rounded-xl bg-gray-50/80 px-3 py-4 text-center text-xs text-gray-400">
              هنوز آدرسی ثبت نکرده‌اید. آدرس‌های پرکاربرد خود را ذخیره کنید.
            </p>
        )}

        {addresses.length > 0 && (
            <ul className="mt-3 space-y-2">
              {addresses.map((addr) => (
                  <li
                      key={addr.id}
                      className={`rounded-xl border px-3 py-2.5 transition-colors ${
                          addr.isDefault ? 'border-blue-200 bg-blue-50/50' : 'border-gray-100 bg-gray-50/60'
                      }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-800">{addr.title}</span>
                          {addr.isDefault && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        پیش‌فرض
                      </span>
                          )}
                        </div>
                        <p className="mt-1 break-words text-[11px] leading-relaxed text-gray-500">
                          {addr.details}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        {!addr.isDefault && (
                            <button
                                type="button"
                                onClick={() => onSetDefault(addr.id)}
                                title="انتخاب به‌عنوان پیش‌فرض"
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => onRemove(addr.id)}
                            disabled={saving}
                            title="حذف آدرس"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:pointer-events-none disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
              ))}
            </ul>
        )}

        {showForm && (
            <div className="mt-3 space-y-3 rounded-xl border border-dashed border-blue-200 bg-blue-50/30 p-3">
              <Field label="عنوان آدرس">
                <Input
                    placeholder="مثلاً منزل، محل کار"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputClass}
                />
              </Field>

              <Field label="نشانی کامل">
            <textarea
                rows={3}
                placeholder="استان، شهر، خیابان، کوچه، پلاک..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full resize-none rounded-xl border-0 bg-gray-50/80 px-3 py-2.5 text-right text-sm text-gray-800 ring-1 ring-gray-100 placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            />
              </Field>

              <div className="flex items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setTitle('');
                      setDetails('');
                    }}
                    className="rounded-full px-4 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100"
                >
                  انصراف
                </button>

                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!details.trim() || saving}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-blue-500/30 transition-all hover:from-blue-600 hover:to-blue-700 disabled:pointer-events-none disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  {saving ? 'در حال ثبت...' : 'ثبت آدرس'}
                </button>
              </div>
            </div>
        )}
      </Card>
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
