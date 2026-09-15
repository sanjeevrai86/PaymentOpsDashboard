import { useState } from 'react';
import { getTransactionById } from '@/data/mockData';
import { useRouter } from '@/hooks/useRouter';
import FlowMap from '@/components/investigation/FlowMap';
import DataTabs from '@/components/investigation/DataTabs';
import TriagePanel from '@/components/investigation/TriagePanel';
import StatusBadge from '@/components/StatusBadge';
import { ArrowLeft, Download, Share2, Printer, ArrowRight } from 'lucide-react';

export default function Investigation() {
  const { route, navigate } = useRouter();
  const txn = getTransactionById(route.params.id);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  if (!txn) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-sm text-slate-500 mb-3">Transaction not found.</p>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const showActionMessage = (message: string) => {
    setActionMessage(message);
    window.setTimeout(() => setActionMessage(null), 3000);
  };

  const exportInvestigation = () => {
    const payload = JSON.stringify(txn, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${txn.id}-investigation.json`;
    link.click();
    URL.revokeObjectURL(url);
    showActionMessage('Investigation exported successfully.');
  };

  const shareInvestigation = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: txn.id, text: `Payment investigation ${txn.id} — ${txn.status}`, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showActionMessage('Investigation link copied to clipboard.');
      }
    } catch {
      // user cancelled share
    }
  };

  const printInvestigation = () => {
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Breadcrumb + header */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white font-mono">{txn.id}</h1>
                <StatusBadge status={txn.status} size="sm" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{txn.scenario}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={exportInvestigation} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
              <button onClick={() => void shareInvestigation()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
              <button onClick={printInvestigation} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>
          </div>
        </div>

        {actionMessage && (
          <div className="mb-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400" role="status">
            {actionMessage}
          </div>
        )}

        {/* Transaction summary bar */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div>
              <div className="text-[11px] text-slate-400 mb-0.5">End-to-End ID</div>
              <div className="text-sm font-mono font-medium text-slate-800 dark:text-slate-200">{txn.endToEndId}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 mb-0.5">Amount</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs text-slate-400">{txn.currency}</span></div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 mb-0.5">Debit MOP</div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{txn.debitMOP}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 mb-0.5">Credit MOP</div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{txn.creditMOP}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 mb-0.5">Timestamp</div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200 tabular-nums">{new Date(txn.timestamp).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 mb-0.5">Debtor → Creditor</div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1 truncate">
                <span className="truncate">{txn.debtorName}</span>
                <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{txn.creditorName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Panel A + B: spans 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <FlowMap nodes={txn.flowNodes} selectedNodeId={selectedNodeId} onSelectNode={setSelectedNodeId} />
            <DataTabs transaction={txn} selectedNodeId={selectedNodeId} />
          </div>

          {/* Panel C: sidebar */}
          <div className="lg:col-span-1">
            <TriagePanel triage={txn.aiTriage} />
          </div>
        </div>
      </div>
    </div>
  );
}
