import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { goBack } from '../navigation/appHistory';
import { rememberCreatedAddress } from '../lib/pendingAddress';
import {
  Check,
  HeartPulse,
  MapPinned,
  Plus,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import { AppBar } from '../components/AppBar';
import { AddressesPageSkeleton } from '../components/PageSkeleton';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/useUserStore';
import {
  loadProfileExtras,
  saveProfileExtras,
  type UserAddress,
} from '../services/profileExtras';

const pageClass =
  'h-full min-h-0 overflow-x-hidden overflow-y-auto overscroll-y-auto bg-gradient-to-b from-blue-50 to-white pb-28 text-right font-[YekanBakhFaNum] [-webkit-overflow-scrolling:touch]';

const inputClass =
  'h-11 rounded-xl border-0 bg-gray-50/80 text-right text-sm text-gray-800 shadow-none ring-1 ring-gray-100 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-300';

const API_BASE_URL = 'https://api.mediraai.com';

type ServerAddress = {
  id: number;
  title: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  created_at?: string;
  updated_at?: string;
};

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

function getExplicitReturnPath(from: unknown): string | null {
  if (typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')) {
    return from;
  }
  return null;
}

function getReturnPath(from: unknown): string {
  return getExplicitReturnPath(from) ?? '/home';
}

export function UserAddresses() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuthStore();
  const storeUser = useUserStore((state) => state.user);
  const fetchUserProfile = useUserStore((state) => state.fetchProfile);

  const navigationState = location.state as { from?: string; openForm?: boolean } | null;
  const backTo = getReturnPath(navigationState?.from);
  const returnPath = getExplicitReturnPath(navigationState?.from);

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(storeUser?.id ?? null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [showForm, setShowForm] = useState(Boolean(navigationState?.openForm));
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    void loadAddresses();
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

  const persistAddresses = (nextAddresses: UserAddress[], nextUserId = userId) => {
    if (nextUserId == null) return;
    const extras = loadProfileExtras(nextUserId);
    saveProfileExtras(nextUserId, {
      ...extras,
      addresses: nextAddresses,
    });
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

  const loadAddresses = async () => {
    try {
      if (!accessToken) {
        navigate('/');
        return;
      }

      await fetchUserProfile();
      const latestUser = useUserStore.getState().user;
      const nextUserId = latestUser?.id ?? null;
      setUserId(nextUserId);

      const extras = nextUserId != null ? loadProfileExtras(nextUserId) : null;

      const response = await fetch(`${API_BASE_URL}/api/user/addresses`, {
        method: 'GET',
        headers: authHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'خطا در دریافت آدرس‌ها');
      }

      const serverAddresses: ServerAddress[] = data.data?.addresses ?? [];
      const mergedAddresses = mergeServerAddressesWithLocalDefaults(
        serverAddresses,
        extras?.addresses ?? []
      );

      setAddresses(mergedAddresses);
      persistAddresses(mergedAddresses, nextUserId);
      setShowForm((open) => open || mergedAddresses.length === 0);
    } catch (error) {
      console.error('خطا در دریافت آدرس‌ها:', error);
      setErrorMessage('خطا در دریافت آدرس‌ها');
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async () => {
    if (!accessToken || !details.trim()) return;

    try {
      setSaving(true);
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
        return;
      }

      const createdAddress: ServerAddress = data.data.address;
      const nextAddress = serverToLocal(createdAddress, addresses.length === 0);
      const nextAddresses = [...addresses, nextAddress];

      setAddresses(nextAddresses);
      persistAddresses(nextAddresses);
      setTitle('');
      setDetails('');
      setShowForm(false);

      if (returnPath) {
        rememberCreatedAddress(createdAddress.id);
        goBack(navigate, returnPath);
      }
    } catch (error) {
      console.error('خطا در ثبت آدرس:', error);
      setErrorMessage('خطا در ثبت آدرس');
    } finally {
      setSaving(false);
    }
  };

  const removeAddress = async (id: string) => {
    if (!accessToken) return;

    const target = addresses.find((a) => a.id === id);
    if (!target?.serverId) return;

    try {
      setSaving(true);
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
      persistAddresses(remaining);
      if (remaining.length === 0) setShowForm(true);
    } catch (error) {
      console.error('خطا در حذف آدرس:', error);
      setErrorMessage('خطا در حذف آدرس');
    } finally {
      setSaving(false);
    }
  };

  const setDefaultAddress = (id: string) => {
    const nextAddresses = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    setAddresses(nextAddresses);
    persistAddresses(nextAddresses);
  };

  if (loading) {
    return (
      <div className={pageClass}>
        <AppBar backTo={backTo} />
        <AddressesPageSkeleton />
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <AppBar backTo={backTo} />

      <div className="mx-auto w-full px-3 pb-6 pt-24 sm:px-4">
        <AddressesHero />
        <ErrorAlert message={errorMessage} onClose={() => setErrorMessage('')} />

        <Card
          dir="rtl"
          className="gap-0 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 text-right shadow-[0_2px_16px_rgba(0,0,0,0.06)] sm:p-5"
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

          {addresses.length === 0 && !showForm && (
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
                          onClick={() => setDefaultAddress(addr.id)}
                          title="انتخاب به‌عنوان پیش‌فرض"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => void removeAddress(addr.id)}
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
                  onClick={() => void addAddress()}
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
      </div>
    </div>
  );
}

function AddressesHero() {
  return (
    <div className="relative mb-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-600 px-4 py-5 shadow-[0_12px_40px_rgba(13,148,136,0.35)] sm:px-5">
        <div className="pointer-events-none absolute -top-14 -left-14 h-44 w-44 rounded-full bg-white/10 blur-sm" />
        <div className="pointer-events-none absolute -bottom-12 -right-10 h-36 w-36 rounded-full bg-blue-400/25 blur-sm" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative z-10 flex items-center gap-4" dir="rtl">
          <div className="relative shrink-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 ring-2 ring-white/40 shadow-lg shadow-teal-900/20 backdrop-blur-md">
              <MapPinned className="h-8 w-8 text-white" strokeWidth={1.75} />
            </div>
            <span className="absolute -bottom-0.5 -left-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-white shadow-sm">
              <Sparkles className="h-3 w-3 text-white" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white ring-1 ring-white/25">
              <HeartPulse className="h-3 w-3" />
              آدرس‌های منتخب
            </p>
            <h1 className="mt-2 text-sm font-bold leading-tight text-white sm:text-base">
              ثبت و مدیریت آدرس
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-emerald-50 sm:text-sm">
              آدرس‌های پرکاربرد را ذخیره کنید تا در درخواست آزمایش و داروخانه استفاده شوند.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}
