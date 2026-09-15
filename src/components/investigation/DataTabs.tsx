import { useState } from 'react';
import type { Transaction, InterfaceCall, LogEntry, IsoMessage } from '@/types';
import { FileJson, Code2, Terminal, Clock, CheckCircle2, XCircle, Loader2, Copy, Check, AlertCircle, Info, ChevronRight } from 'lucide-react';

interface DataTabsProps {
  transaction: Transaction;
  selectedNodeId: string | null;
}

type Tab = 'messages' | 'interfaces' | 'logs';

export default function DataTabs({ transaction, selectedNodeId }: DataTabsProps) {
  const [tab, setTab] = useState<Tab>('messages');

  const tabs: { key: Tab; label: string; icon: typeof FileJson; badge?: number }[] = [
    { key: 'messages', label: 'Message Details (ISO 20022)', icon: FileJson, badge: transaction.isoMessages.length },
    { key: 'interfaces', label: 'Interface Calls & DB Records', icon: Code2, badge: transaction.interfaceCalls.length },
    { key: 'logs', label: 'Processing Logs', icon: Terminal, badge: transaction.logs.length },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col">
      {/* Tab bar */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 whitespace-nowrap ${
              tab === t.key
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.badge !== undefined && (
              <span className={`text-[10px] px-1.5 rounded-full ${tab === t.key ? 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto" style={{ maxHeight: '560px' }}>
        {tab === 'messages' && <MessageDetailsTab messages={transaction.isoMessages} />}
        {tab === 'interfaces' && <InterfaceCallsTab calls={transaction.interfaceCalls} selectedNodeId={selectedNodeId} />}
        {tab === 'logs' && <LogsTab logs={transaction.logs} selectedNodeId={selectedNodeId} />}
      </div>
    </div>
  );
}

function MessageDetailsTab({ messages }: { messages: IsoMessage[] }) {
  const [selected, setSelected] = useState(0);
  const [viewMode, setViewMode] = useState<'raw' | 'json'>('raw');
  const [copied, setCopied] = useState(false);

  const msg = messages[selected];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(viewMode === 'raw' ? msg.rawPayload : msg.convertedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message selector */}
      <div className="flex flex-wrap gap-1.5 p-3 border-b border-slate-100 dark:border-slate-800">
        {messages.map((m, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selected === i
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {m.type}
          </button>
        ))}
      </div>

      {msg && (
        <>
          {/* Message metadata */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4">
            <div>
              <span className="text-[11px] text-slate-400 block">Message Type</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{msg.messageType}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Direction</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{msg.direction}</span>
            </div>
          </div>

          {/* View toggle + copy */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('raw')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${viewMode === 'raw' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Raw Payload (XML)
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition ${viewMode === 'json' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Converted JSON
              </button>
            </div>
            <button onClick={copyToClipboard} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Payload viewer */}
          <div className="flex-1 overflow-auto p-4 bg-slate-50 dark:bg-slate-950/50">
            <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {viewMode === 'raw' ? msg.rawPayload : msg.convertedJson}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}

function InterfaceCallsTab({ calls, selectedNodeId }: { calls: InterfaceCall[]; selectedNodeId: string | null }) {
  const nodeAppMap: Record<string, string[]> = {
    ch: ['Middleware'],
    mw: ['Middleware'],
    pp: ['Payment Processor'],
    cl: ['Clearing'],
    fr: ['Fraud Engine'],
    co: ['Compliance'],
    cb: ['Core Banking'],
    ad: ['Advices'],
  };

  const filtered = selectedNodeId && nodeAppMap[selectedNodeId]
    ? calls.filter((c) => nodeAppMap[selectedNodeId].some((app) => c.application.includes(app)))
    : calls;

  const statusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (status === 'failed') return <XCircle className="w-4 h-4 text-rose-500" />;
    return <Loader2 className="w-4 h-4 text-amber-500" />;
  };

  return (
    <div className="p-4">
      {selectedNodeId && (
        <div className="mb-3 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg px-3 py-2">
          Filtered by selected node: {nodeAppMap[selectedNodeId]?.join(', ')}
        </div>
      )}
      <div className="space-y-2">
        {filtered.map((call) => (
          <div key={call.id} className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/30">
              {statusIcon(call.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{call.application}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{call.appKey}</span>
                  <span className="text-[10px] text-slate-400">·</span>
                  <span className="text-xs text-slate-500">{call.direction}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{call.endpoint}</div>
              </div>
              <div className="text-right shrink-0">
                <div className={`text-sm font-bold tabular-nums ${call.statusCode >= 200 && call.statusCode < 300 ? 'text-emerald-600 dark:text-emerald-400' : call.statusCode >= 400 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {call.statusCode || '---'}
                </div>
                <div className="text-[10px] text-slate-400">{call.latencyMs > 0 ? `${call.latencyMs}ms` : '—'}</div>
              </div>
              <div className="text-xs text-slate-400 tabular-nums shrink-0 hidden sm:block">
                {new Date(call.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </div>
            </div>
            <div className="px-4 py-2.5 bg-white dark:bg-slate-900">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Payload Extract</div>
              <pre className="text-xs font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">{call.payload}</pre>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-sm text-slate-400 py-8">No interface calls for this node.</div>
        )}
      </div>
    </div>
  );
}

function LogsTab({ logs, selectedNodeId }: { logs: LogEntry[]; selectedNodeId: string | null }) {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');

  const nodeSourceMap: Record<string, string[]> = {
    ch: ['Channels'],
    mw: ['Middleware'],
    pp: ['Payment Processor'],
    cl: ['Clearing'],
    fr: ['Fraud'],
    co: ['Compliance'],
    cb: ['Core Banking'],
    ad: ['Advices'],
  };

  let filtered = logs;
  if (selectedNodeId && nodeSourceMap[selectedNodeId]) {
    filtered = filtered.filter((l) => nodeSourceMap[selectedNodeId].some((src) => l.source.includes(src)));
  }
  if (severityFilter !== 'ALL') {
    filtered = filtered.filter((l) => l.level === severityFilter);
  }

  const levelConfig = {
    INFO: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    WARN: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    ERROR: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30' },
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
        {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSeverityFilter(s)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
              severityFilter === s
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {s}
          </button>
        ))}
        {selectedNodeId && (
          <span className="ml-auto text-[11px] text-indigo-600 dark:text-indigo-400">Filtered by: {nodeSourceMap[selectedNodeId]?.join(', ')}</span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-950/50">
        <div className="space-y-1.5 font-mono">
          {filtered.map((log) => {
            const c = levelConfig[log.level];
            const Icon = c.icon;
            return (
              <div key={log.id} className={`flex items-start gap-3 rounded-lg ${c.bg} px-3 py-2`}>
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${c.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-400 tabular-nums">{new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })}</span>
                    <span className={`text-[11px] font-bold ${c.color}`}>{log.level}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">[{log.source}]</span>
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{log.message}</div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center text-sm text-slate-400 py-8">No logs match the current filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
