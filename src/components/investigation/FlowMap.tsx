import type { FlowNode, NodeStatus } from '@/types';
import { CheckCircle2, XCircle, Circle, Loader2, ArrowRight, ArrowLeftRight } from 'lucide-react';

interface FlowMapProps {
  nodes: FlowNode[];
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}

const statusConfig: Record<NodeStatus, { color: string; bg: string; border: string; icon: typeof CheckCircle2; label: string }> = {
  success: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-300 dark:border-emerald-700', icon: CheckCircle2, label: 'Success' },
  failed: { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-300 dark:border-rose-700', icon: XCircle, label: 'Failed' },
  idle: { color: 'text-slate-400 dark:text-slate-600', bg: 'bg-slate-50 dark:bg-slate-800/30', border: 'border-slate-200 dark:border-slate-700', icon: Circle, label: 'Not Triggered' },
  active: { color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40', border: 'border-indigo-300 dark:border-indigo-700', icon: Loader2, label: 'In Progress' },
};

function FlowNodeCard({ node, selected, onClick }: { node: FlowNode; selected: boolean; onClick: () => void }) {
  const c = statusConfig[node.status];
  const Icon = c.icon;
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all min-w-[130px] ${
        selected
          ? `${c.bg} ${c.border} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-indigo-500 scale-105 shadow-lg`
          : `${c.bg} ${c.border} hover:scale-105 hover:shadow-md`
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.bg} ${c.color}`}>
        <Icon className={`w-4.5 h-4.5 ${node.status === 'active' ? 'animate-spin' : ''}`} />
      </div>
      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{node.label}</span>
      <span className={`text-[10px] font-medium ${c.color}`}>{c.label}</span>
    </button>
  );
}

function Arrow() {
  return (
    <div className="flex items-center px-1">
      <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
    </div>
  );
}

export default function FlowMap({ nodes, selectedNodeId, onSelectNode }: FlowMapProps) {
  const getNode = (id: string) => nodes.find((n) => n.id === id);
  const primaryFlow = ['ch', 'mw', 'pp', 'cl'];
  const subNodes = ['fr', 'co', 'cb', 'ad'];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payment Flow & Topology</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Click a node to view its logs and interface calls below</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          {(['success', 'failed', 'active', 'idle'] as NodeStatus[]).map((s) => {
            const c = statusConfig[s];
            const Icon = c.icon;
            return (
              <span key={s} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Icon className={`w-3 h-3 ${c.color} ${s === 'active' ? 'animate-spin' : ''}`} />
                {c.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Primary horizontal flow */}
      <div className="flex items-center justify-center flex-wrap gap-0 mb-6">
        {primaryFlow.map((id, i) => {
          const node = getNode(id);
          if (!node) return null;
          return (
            <div key={id} className="flex items-center">
              <FlowNodeCard node={node} selected={selectedNodeId === id} onClick={() => onSelectNode(id)} />
              {i < primaryFlow.length - 1 && <Arrow />}
            </div>
          );
        })}
      </div>

      {/* Sub-application nodes connected to middleware/processor */}
      <div className="relative">
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Bi-directional interfaces with internal applications</span>
          </div>
        </div>
        <div className="flex items-center justify-center flex-wrap gap-3">
          {subNodes.map((id) => {
            const node = getNode(id);
            if (!node) return null;
            return (
              <FlowNodeCard key={id} node={node} selected={selectedNodeId === id} onClick={() => onSelectNode(id)} />
            );
          })}
        </div>
      </div>

      {/* Selected node detail */}
      {selectedNodeId && (() => {
        const node = getNode(selectedNodeId);
        if (!node) return null;
        const c = statusConfig[node.status];
        return (
          <div className={`mt-5 rounded-lg border ${c.border} ${c.bg} p-3`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{node.label}</span>
              <span className={`text-[11px] font-semibold ${c.color}`}>{c.label}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">{node.detail}</p>
          </div>
        );
      })()}
    </div>
  );
}
