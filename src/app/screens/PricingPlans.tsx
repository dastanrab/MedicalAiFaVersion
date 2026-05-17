import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Crown, Check, Sparkles } from 'lucide-react';
import { AppBar } from '../components/AppBar';
import { Card } from '../components/ui/card';
import { useAuthStore } from '../store/authStore';
import { pricingPlans, type PricingPlan } from '../data/pricingPlans';

const pageClass =
  'h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white pb-24 text-right font-[YekanBakhFaNum]';

export function PricingPlans() {
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('basic');

  useEffect(() => {
    const fetchPlan = async () => {
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

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCurrentPlan(data.data.plan?.type || 'basic');
          }
        }
      } catch (error) {
        console.error('خطا در دریافت پلن:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [accessToken, navigate]);

  if (loading) {
    return (
      <div className={pageClass}>
        <div className="flex min-h-[50vh] items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <AppBar />

      <div className="mx-auto max-w-md px-6 pb-8 pt-24">
        <PlansHero />

        <div className="space-y-4">
          {pricingPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} currentPlan={currentPlan} />
          ))}
        </div>

        <p className="flex items-center justify-center gap-2 pt-4 text-xs text-gray-500">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          پرداخت امن و رمزنگاری شده
        </p>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      <p className="text-sm text-gray-600">در حال بارگذاری...</p>
    </div>
  );
}

function PlansHero() {
  return (
    <div className="relative mb-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-amber-500 to-orange-500 px-5 py-5 shadow-[0_8px_32px_rgba(245,158,11,0.28)]">
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
            <Crown className="h-7 w-7 text-white" />
          </div>
          <div className="min-w-0 flex-1 text-right">
            <h1 className="text-xl font-bold leading-tight text-white">پلن‌ها</h1>
            <p className="mt-0.5 text-sm leading-snug text-amber-100">
              انتخاب پلن مناسب برای نیازهای شما
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan, currentPlan }: { plan: PricingPlan; currentPlan: string }) {
  return (
    <Card
      dir="rtl"
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] text-right ${
        plan.popular
          ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-white'
          : plan.id === 'premium'
            ? 'border-amber-200 bg-gradient-to-br from-amber-50/80 to-white'
            : 'border-gray-100 bg-white'
      }`}
    >
      {plan.popular && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-0.5 text-[10px] font-bold text-white shadow-md">
          محبوب‌ترین
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              plan.id === 'basic'
                ? 'bg-gray-100 text-gray-500'
                : plan.id === 'pro'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-amber-100 text-amber-600'
            }`}
          >
            <Crown className="h-5 w-5" />
          </span>
          <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
        </div>
        <p
          className={`text-sm font-bold ${
            plan.id === 'basic'
              ? 'text-gray-700'
              : plan.id === 'pro'
                ? 'text-blue-600'
                : 'text-amber-600'
          }`}
        >
          {plan.price}
        </p>
      </div>

      <ul className="mb-4 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
            <Check
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                plan.id === 'basic'
                  ? 'text-gray-400'
                  : plan.id === 'pro'
                    ? 'text-blue-500'
                    : 'text-amber-500'
              }`}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={currentPlan === plan.id}
        className={`h-10 w-full rounded-full text-sm font-semibold transition-all active:scale-[0.98] ${
          currentPlan === plan.id
            ? 'cursor-default bg-gray-100 text-gray-500'
            : plan.id === 'basic'
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              : plan.id === 'pro'
                ? 'bg-gradient-to-l from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/30 hover:from-blue-700 hover:to-blue-600'
                : 'bg-gradient-to-l from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30 hover:from-amber-600 hover:to-amber-700'
        }`}
      >
        {currentPlan === plan.id ? 'پلن فعلی' : `انتخاب ${plan.name}`}
      </button>
    </Card>
  );
}
