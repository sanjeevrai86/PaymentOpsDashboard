import { useState, useMemo } from 'react';
import { transactions } from '@/data/mockData';
import type { PaymentStatus, MOP } from '@/types';
import { useRouter } from '@/hooks/useRouter';
import StatusBadge from '@/components/StatusBadge';
import { TrendingUp, TrendingDown, Clock, AlertCircle, ArrowUpDown, ChevronLeft, ChevronRight, Filter, X, Eye } from 'lucide-react';

type SortField = 'timestamp' | 'amount';
type SortDir = 'asc' | 'desc';
type QuickTab = 'All' | PaymentStatus;

export default function Dashboard() {
  const { navigate } = useRouter();
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'All'>('All');
  const [mopFilter, setMopFilter] = useState<MOP | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [quickTab, setQuickTab] = useState<QuickTab>('All');
  const [page, setPage] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const pageSize = 8;

  const filtered = useMemo(() => {
    let result = [...transactions];
    if (quickTab !== 'All') result = result.filter((t) => t.status === quickTab);
    else if (statusFilter !== 'All') result = result.filter((t) => t.status === statusFilter);
    if (mopFilter !== 'All') result = result.filter((t) => t.debitMOP === mopFilter || t.creditMOP === mopFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.id.toLowerCase().includes(q) || t.endToEndId.toLowerCase().includes(q));
    }
    if (amountMin) result = result.filter((t) => t.amount >= parseFloat(amountMin));
    if (amountMax) result = result.filter((t) => t.amount <= parseFloat(amountMax));
    if (dateFrom) result = result.filter((t) => t.timestamp >= dateFrom);
    if (dateTo) result = result.filter((t) => t.timestamp <= dateTo + 'T23:59:59Z');
    result.sort((a, b) => {
      let cmp: number;
      if (sortField === 'timestamp') cmp = a.timestamp.localeCompare(b.timestamp);
      else cmp = a.amount - b.amount;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [statusFilter, mopFilter, searchQuery, amountMin, amountMax, dateFrom, dateTo, sortField, sortDir, quickTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const allStatuses: PaymentStatus[] = ['Failed', 'Returned', 'Rejected', 'Cancelled', 'Completed'];
  const allMOPs: MOP[] = ['FedNow', 'ACH', 'SEPA', 'SWIFT', 'RTGS', 'CHIPS'];

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const hasActiveFilters = statusFilter !== 'All' || mopFilter !== 'All' || amountMin || amountMax || dateFrom || dateTo;

  const clearFilters = () => {
    setStatusFilter('All'); setMopFilter('All'); setAmountMin(''); setAmountMax(''); setDateFrom(''); setDateTo(''); setQuickTab('All');
  };

  // KPI calculations
  const totalToday = transactions.length;
  const failedCount = transactions.filter((t) => t.status === 'Failed' || t.status === 'Rejected').length;
  const failedRate = ((failedCount / totalToday) * 100).toFixed(1);
  const activeReviews = transactions.filter((t) => t.status === 'Cancelled' || t.status === 'Returned').length;

  const kpis = [
    { label: 'Total Payments Today', value: totalToday.toString(), delta: '+12.4%', deltaUp: true, icon: TrendingUp, accent: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { label: 'Failed Transaction Rate', value: `${failedRate}%`, delta: '-2.1%', deltaUp: false, icon: TrendingDown, accent: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30' },
    { label: 'Avg. Triage Time', value: '4m 12s', delta: '-18.3%', deltaUp: false, icon: Clock, accent: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Active Manual Reviews', value: activeReviews.toString(), delta: '+3', deltaUp: true, icon: AlertCircle, accent: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  ];

  const quickTabs: { label: QuickTab; count: number }[] = [
    { label: 'All', count: transactions.length },
    ...allStatuses.map((s) => ({ label: s, count: transactions.filter((t) => t.status === s).length })),
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Payment Operations Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Monitor, triage, and investigate payment exceptions across all channels.</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.accent}`} />
                </div>
                <span className={`text-xs font-semibold ${kpi.deltaUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {kpi.delta}
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Quick filter tabs */}
        <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
          {quickTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => { setQuickTab(tab.label); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-2 ${
                quickTab === tab.label
                  ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
              <span className={`text-[11px] px-1.5 rounded-full ${quickTab === tab.label ? 'bg-white/20 dark:bg-black/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Filter className="w-4 h-4 text-slate-400" /> Filters
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              placeholder="Transaction ID or End-to-End ID..."
              className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition"
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as PaymentStatus | 'All'); setQuickTab('All'); setPage(0); }}
              className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="All">All Statuses</option>
              {allStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={mopFilter}
              onChange={(e) => { setMopFilter(e.target.value as MOP | 'All'); setPage(0); }}
              className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="All">All MOPs</option>
              {allMOPs.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${showAdvanced ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Advanced
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="px-3 py-2 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          {showAdvanced && (
            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Date From</label>
                <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0); }} className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Date To</label>
                <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0); }} className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Amount Min</label>
                <input type="number" value={amountMin} onChange={(e) => { setAmountMin(e.target.value); setPage(0); }} placeholder="0" className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Amount Max</label>
                <input type="number" value={amountMax} onChange={(e) => { setAmountMax(e.target.value); setPage(0); }} placeholder="∞" className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
          )}
        </div>

        {/* Transactions table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">Transaction ID</th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">End-to-End ID</th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">Debit MOP</th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">Credit MOP</th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3 cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200" onClick={() => toggleSort('amount')}>
                    <span className="flex items-center gap-1">Amount <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3 cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200" onClick={() => toggleSort('timestamp')}>
                    <span className="flex items-center gap-1">Timestamp <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400 px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => navigate(`/investigation/${t.id}`)}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition cursor-pointer group"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 font-mono">{t.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 font-mono">{t.endToEndId}</td>
                    <td className="px-4 py-3"><span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{t.debitMOP}</span></td>
                    <td className="px-4 py-3"><span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{t.creditMOP}</span></td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 tabular-nums">{t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs text-slate-400">{t.currency}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} size="sm" /></td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 tabular-nums">{new Date(t.timestamp).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline">
                        <Eye className="w-3.5 h-3.5" /> Investigate
                      </span>
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">No transactions match the current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Showing {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
                      i === currentPage
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
