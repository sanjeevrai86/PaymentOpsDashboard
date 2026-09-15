import type { PaymentStatus } from '@/types';
import { CheckCircle2, XCircle, RotateCcw, Ban, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md';
}

const config: Record<PaymentStatus, { color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
  Completed: { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/50', border: 'border-emerald-200 dark:border-emerald-800', icon: CheckCircle2 },
  Failed: { color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50', border: 'border-rose-200 dark:border-rose-800', icon: XCircle },
  Returned: { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50', border: 'border-amber-200 dark:border-amber-800', icon: RotateCcw },
  Rejected: { color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/50', border: 'border-rose-200 dark:border-rose-800', icon: Ban },
  Cancelled: { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800/50', border: 'border-slate-200 dark:border-slate-700', icon: Clock },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const c = config[status];
  const Icon = c.icon;
  const sizeCls = size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5';
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${c.bg} ${c.color} ${c.border} ${sizeCls}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {status}
    </span>
  );
}
