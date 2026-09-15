import type { AITriage } from '@/types';
import { useState } from 'react';
import { Sparkles, AlertTriangle, Target, ArrowRight, BookOpen, Lightbulb, Zap, Shield, Clock, CheckCircle2 } from 'lucide-react';

interface TriagePanelProps {
  triage: AITriage;
}

const variantStyles = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20',
  secondary: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20',
};

export default function TriagePanel({ triage }: TriagePanelProps) {
  const isFailure = triage.rawErrorCode !== 'N/A';
  const [completedAction, setCompletedAction] = useState<string | null>(null);

  const handleAction = (label: string) => {
    setCompletedAction(label);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-4">
      {/* Header */}
      <div className={`px-4 py-3 ${isFailure ? 'bg-gradient-to-r from-rose-500 to-rose-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'} text-white`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5" />
          <div>
            <h3 className="text-sm font-bold">AI-Assisted Triage Summary</h3>
            <p className="text-[11px] text-white/80">Cross-application root cause analysis</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {completedAction && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2.5 text-xs text-emerald-700 dark:text-emerald-400" role="status">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span><strong>{completedAction}</strong> has been queued for the operations team.</span>
          </div>
        )}
        {/* Failure Reason */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Failure Reason</span>
          </div>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{triage.failureReason}</p>
        </div>

        {/* Root Cause Application */}
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Root Cause Application</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">{triage.rootCauseApplication}</div>
        </div>

        {/* Error Code Mapping */}
        {isFailure && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Error Code Mapping</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 p-2.5">
                <div className="text-[10px] text-slate-400 mb-0.5">Raw Downstream Code</div>
                <div className="text-sm font-mono font-bold text-rose-600 dark:text-rose-400">{triage.rawErrorCode}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
              <div className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 p-2.5">
                <div className="text-[10px] text-slate-400 mb-0.5">ISO 20022 Code</div>
                <div className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">{triage.iso20022Code}</div>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{triage.iso20022Description}</p>
          </div>
        )}

        {/* Knowledge Base Reference */}
        {isFailure && (
          <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/20 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Knowledge Base Reference</span>
            </div>
            <div className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-1">{triage.knowledgeBaseRef}: {triage.knowledgeBaseTitle}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{triage.knowledgeBaseSnippet}</p>
          </div>
        )}

        {/* Recommended Next Steps */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recommended Next Steps</span>
          </div>
          <div className="space-y-2">
            {triage.recommendedSteps.map((step, i) => (
              <button
                key={i}
                onClick={() => handleAction(step.label)}
                className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-between ${variantStyles[step.variant]}`}
              >
                <span>{step.label}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-70" />
              </button>
            ))}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> AI v2.1</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Analyzed in 0.8s</span>
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {isFailure ? 'High confidence' : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}
