import type { NodeStatus } from '@/types';

interface NodeStatusDotProps {
  status: NodeStatus;
}

const config: Record<NodeStatus, { dot: string; ring: string }> = {
  success: { dot: 'bg-emerald-500', ring: 'ring-emerald-500/30' },
  failed: { dot: 'bg-rose-500', ring: 'ring-rose-500/30' },
  idle: { dot: 'bg-slate-400 dark:bg-slate-600', ring: 'ring-slate-400/20' },
  active: { dot: 'bg-indigo-500', ring: 'ring-indigo-500/30' },
};

export default function NodeStatusDot({ status }: NodeStatusDotProps) {
  const c = config[status];
  return <span className={`inline-block w-2 h-2 rounded-full ring-2 ${c.dot} ${c.ring}`} />;
}
