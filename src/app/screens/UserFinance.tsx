import { useMemo, useState, type ComponentType } from 'react';
import {
  Wallet,
  ShoppingBag,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { AppBar } from '../components/AppBar';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  formatPrice,
  mockUserOrders,
  mockUserTransactions,
  mockUserWallet,
  orderStatusLabels,
  serviceTypeLabels,
  transactionStatusLabels,
  transactionTypeLabels,
  type UserOrder,
  type UserOrderStatus,
  type UserTransaction,
  type UserTransactionStatus,
  type UserTransactionType,
} from '../data/userFinanceMockData';

const pageClass =
  'h-full min-h-0 overflow-x-hidden overflow-y-auto overscroll-y-auto bg-gradient-to-b from-blue-50 to-white pb-28 text-right font-[YekanBakhFaNum] [-webkit-overflow-scrolling:touch]';

const orderStatusStyles: Record<UserOrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  paid: 'bg-blue-50 text-blue-700 ring-blue-200',
  processing: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  cancelled: 'bg-gray-100 text-gray-600 ring-gray-200',
  refunded: 'bg-violet-50 text-violet-700 ring-violet-200',
};

const transactionStatusStyles: Record<UserTransactionStatus, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  failed: 'bg-red-50 text-red-700 ring-red-200',
};

export function UserFinance() {
  const [activeTab, setActiveTab] = useState('overview');

  const totalSpent = useMemo(
    () =>
      mockUserTransactions
        .filter((t) => t.status === 'success' && t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    []
  );

  const pendingOrders = useMemo(
    () => mockUserOrders.filter((o) => o.status === 'pending').length,
    []
  );

  const successfulTransactions = useMemo(
    () => mockUserTransactions.filter((t) => t.status === 'success').length,
    []
  );

  return (
    <div className={pageClass}>
      <AppBar />

      <div className="mx-auto w-full max-w-lg px-3 pb-6 pt-24 sm:px-4">
        <FinanceHero wallet={mockUserWallet} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4" dir="rtl">
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-gray-100">
            <TabsTrigger
              value="overview"
              className="rounded-xl py-2.5 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:text-sm"
            >
              خلاصه
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-xl py-2.5 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:text-sm"
            >
              سفارشات
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="rounded-xl py-2.5 text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white sm:text-sm"
            >
              تراکنش‌ها
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <SummaryCard
                label="مجموع پرداخت"
                value={`${formatPrice(totalSpent)}`}
                suffix="ت"
                icon={TrendingDown}
                tone="rose"
              />
              <SummaryCard
                label="سفارش معلق"
                value={String(pendingOrders)}
                suffix="مورد"
                icon={Clock}
                tone="amber"
              />
              <SummaryCard
                label="تراکنش موفق"
                value={String(successfulTransactions)}
                suffix="مورد"
                icon={CheckCircle2}
                tone="emerald"
              />
            </div>

            <RecentOrdersPreview orders={mockUserOrders.slice(0, 3)} onViewAll={() => setActiveTab('orders')} />
            <RecentTransactionsPreview
              transactions={mockUserTransactions.slice(0, 4)}
              onViewAll={() => setActiveTab('transactions')}
            />
          </TabsContent>

          <TabsContent value="orders" className="mt-4 space-y-3">
            {mockUserOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </TabsContent>

          <TabsContent value="transactions" className="mt-4 space-y-3">
            {mockUserTransactions.map((txn) => (
              <TransactionCard key={txn.id} transaction={txn} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function FinanceHero({ wallet }: { wallet: typeof mockUserWallet }) {
  const available = wallet.balance - wallet.blockedBalance;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 px-5 py-6 shadow-[0_12px_40px_rgba(16,185,129,0.35)]">
      <div className="pointer-events-none absolute -top-14 -left-14 h-44 w-44 rounded-full bg-white/10 blur-sm" />
      <div className="pointer-events-none absolute -bottom-12 -right-10 h-36 w-36 rounded-full bg-cyan-400/20 blur-sm" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10" dir="rtl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white ring-1 ring-white/25">
              <Wallet className="h-3 w-3" />
              کیف پول
            </p>
            <p className="mt-3 text-sm text-emerald-100">موجودی قابل استفاده</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-white">
              {formatPrice(available)}
              <span className="mr-1 text-base font-medium text-emerald-100">تومان</span>
            </p>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm">
            <Wallet className="h-7 w-7 text-white" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 px-3 py-2.5 ring-1 ring-white/20">
            <p className="text-[11px] text-emerald-100">موجودی کل</p>
            <p className="mt-0.5 text-sm font-bold text-white">{formatPrice(wallet.balance)} ت</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-2.5 ring-1 ring-white/20">
            <p className="text-[11px] text-emerald-100">مسدود شده</p>
            <p className="mt-0.5 text-sm font-bold text-white">{formatPrice(wallet.blockedBalance)} ت</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
          >
            <Plus className="h-4 w-4" />
            شارژ کیف پول
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-white/25 transition hover:bg-white/25"
          >
            <RefreshCw className="h-4 w-4" />
            بروزرسانی
          </button>
        </div>

        <p className="mt-3 text-[10px] text-emerald-100/80">آخرین بروزرسانی: {wallet.lastUpdated}</p>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  suffix,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  suffix: string;
  icon: ComponentType<{ className?: string }>;
  tone: 'rose' | 'amber' | 'emerald';
}) {
  const tones = {
    rose: 'from-rose-500 to-pink-600 shadow-rose-200',
    amber: 'from-amber-500 to-orange-600 shadow-amber-200',
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-200',
  };

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-0 p-3 shadow-sm ring-1 ring-gray-100">
      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${tones[tone]} text-white shadow-sm`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[10px] font-medium text-gray-500 sm:text-xs">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-gray-900 sm:text-base">
        {value}
        <span className="mr-0.5 text-[10px] font-normal text-gray-500">{suffix}</span>
      </p>
    </Card>
  );
}

function RecentOrdersPreview({
  orders,
  onViewAll,
}: {
  orders: UserOrder[];
  onViewAll: () => void;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
          <ShoppingBag className="h-4 w-4 text-blue-500" />
          آخرین سفارشات
        </h2>
        <button type="button" onClick={onViewAll} className="text-xs font-medium text-blue-600 hover:text-blue-700">
          مشاهده همه
        </button>
      </div>
      <div className="space-y-2">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} compact />
        ))}
      </div>
    </section>
  );
}

function RecentTransactionsPreview({
  transactions,
  onViewAll,
}: {
  transactions: UserTransaction[];
  onViewAll: () => void;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
          <CreditCard className="h-4 w-4 text-blue-500" />
          آخرین تراکنش‌ها
        </h2>
        <button type="button" onClick={onViewAll} className="text-xs font-medium text-blue-600 hover:text-blue-700">
          مشاهده همه
        </button>
      </div>
      <div className="space-y-2">
        {transactions.map((txn) => (
          <TransactionCard key={txn.id} transaction={txn} compact />
        ))}
      </div>
    </section>
  );
}

function OrderCard({ order, compact = false }: { order: UserOrder; compact?: boolean }) {
  return (
    <Card
      dir="rtl"
      className="gap-0 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
              {serviceTypeLabels[order.serviceType]}
            </span>
            <span
              className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ring-1 ${orderStatusStyles[order.status]}`}
            >
              {orderStatusLabels[order.status]}
            </span>
          </div>
          <h3 className="mt-2 text-sm font-bold leading-snug text-gray-900">{order.title}</h3>
          {order.providerName && (
            <p className="mt-1 text-xs text-gray-500">{order.providerName}</p>
          )}
        </div>
        <div className="shrink-0 text-left">
          <p className="text-sm font-bold text-gray-900">{formatPrice(order.finalAmount)} ت</p>
          {order.discount > 0 && (
            <p className="text-[10px] text-gray-400 line-through">{formatPrice(order.amount)}</p>
          )}
        </div>
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-50 pt-3 text-[11px] text-gray-500">
          <span>کد: {order.code}</span>
          <span>روش پرداخت: {paymentMethodLabel(order.paymentMethod)}</span>
          <span>{order.createdAt}</span>
          {order.paidAt && <span>پرداخت: {order.paidAt}</span>}
        </div>
      )}

      {compact && (
        <p className="mt-2 text-[10px] text-gray-400">{order.code} · {order.createdAt}</p>
      )}
    </Card>
  );
}

function TransactionCard({
  transaction,
  compact = false,
}: {
  transaction: UserTransaction;
  compact?: boolean;
}) {
  const isCredit = transaction.amount > 0;
  const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;
  const typeIcon = transactionIcon(transaction.type);

  return (
    <Card
      dir="rtl"
      className="gap-0 overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
              {transactionTypeLabels[transaction.type]}
            </span>
            <span
              className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ring-1 ${transactionStatusStyles[transaction.status]}`}
            >
              {transactionStatusLabels[transaction.status]}
            </span>
          </div>
          <h3 className="mt-1.5 text-sm font-semibold text-gray-900">{transaction.title}</h3>
          {!compact && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500">
              <span>کد: {transaction.code}</span>
              <span>روش: {methodLabel(transaction.method)}</span>
              {transaction.reference && <span>پیگیری: {transaction.reference}</span>}
              {transaction.orderCode && <span>سفارش: {transaction.orderCode}</span>}
            </div>
          )}
          <p className="mt-1.5 text-[10px] text-gray-400">{transaction.createdAt}</p>
        </div>

        <div className="shrink-0 text-left">
          <p
            className={`text-sm font-bold ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}
          >
            {isCredit ? '+' : '−'}
            {formatPrice(transaction.amount)} ت
          </p>
          <div className="mt-1 flex justify-end">{typeIcon}</div>
        </div>
      </div>
    </Card>
  );
}

function paymentMethodLabel(method: UserOrder['paymentMethod']): string {
  const labels = {
    wallet: 'کیف پول',
    online: 'درگاه آنلاین',
    mixed: 'ترکیبی',
  };
  return labels[method];
}

function methodLabel(method: UserTransaction['method']): string {
  const labels = {
    wallet: 'کیف پول',
    card: 'کارت بانکی',
    bank: 'انتقال بانکی',
  };
  return labels[method];
}

function transactionIcon(type: UserTransactionType) {
  const className = 'h-3.5 w-3.5 text-gray-400';
  switch (type) {
    case 'wallet_charge':
      return <TrendingUp className={className} />;
    case 'refund':
      return <RefreshCw className={className} />;
    case 'subscription':
      return <CreditCard className={className} />;
    case 'withdrawal':
      return <XCircle className={className} />;
    default:
      return <ArrowUpRight className={className} />;
  }
}
