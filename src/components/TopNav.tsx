import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from '@/hooks/useRouter';
import { Bell, Search, Sun, Moon, ChevronDown, LogOut, User, Settings, Grid3x3, Shield, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { transactions } from '@/data/mockData';

interface TopNavProps {
  onToggleSidebar: () => void;
}

export default function TopNav({ onToggleSidebar }: TopNavProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { navigate } = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [appSwitcherOpen, setAppSwitcherOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof transactions>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (appRef.current && !appRef.current.contains(e.target as Node)) setAppSwitcherOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase();
      setSearchResults(transactions.filter((t) =>
        t.id.toLowerCase().includes(q) || t.endToEndId.toLowerCase().includes(q) || t.debtorName.toLowerCase().includes(q) || t.creditorName.toLowerCase().includes(q)
      ).slice(0, 6));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  const envColor: Record<string, string> = {
    Production: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    UAT: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    Sandbox: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  };

  const apps = [
    { name: 'PayOps Central', icon: Shield, active: true },
    { name: 'Fraud Monitor', icon: AlertTriangle, active: false },
    { name: 'Compliance Hub', icon: CheckCircle2, active: false },
    { name: 'Core Banking', icon: Grid3x3, active: false },
  ];

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center px-4 gap-3 sticky top-0 z-30">
      {/* App switcher */}
      <div className="relative" ref={appRef}>
        <button
          onClick={() => setAppSwitcherOpen(!appSwitcherOpen)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 hidden md:block">PayOps Central</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
        </button>
        {appSwitcherOpen && (
          <div className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700">Application Switcher</div>
            {apps.map((app) => (
              <button
                key={app.name}
                onClick={() => {
                  if (!app.active) showToast(`${app.name} is not available in this environment.`);
                  setAppSwitcherOpen(false);
                }}
                className={`w-full px-3 py-2.5 flex items-center gap-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition ${app.active ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}
              >
                <app.icon className="w-4 h-4" />
                {app.name}
                {app.active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Environment badge */}
      {user && (
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${envColor[user.environment]}`}>
          {user.environment}
        </span>
      )}

      {/* Global search */}
      <div className="flex-1 max-w-xl relative mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Transaction ID, End-to-End ID, or party name..."
          className="w-full pl-10 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition"
        />
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden z-50">
            {searchResults.map((t) => (
              <button
                key={t.id}
                onClick={() => { navigate(`/investigation/${t.id}`); setSearchQuery(''); }}
                className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition text-left"
              >
                <div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{t.id}</div>
                  <div className="text-xs text-slate-400">{t.endToEndId} · {t.debtorName} → {t.creditorName}</div>
                </div>
                <span className={`text-xs font-semibold ${t.status === 'Completed' ? 'text-emerald-500' : t.status === 'Failed' || t.status === 'Rejected' ? 'text-rose-500' : 'text-amber-500'}`}>{t.status}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500 dark:text-slate-400">
        {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
      </button>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500 dark:text-slate-400"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        </button>
        {notifOpen && (
          <div className="absolute top-full right-0 mt-1 w-80 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Notifications</span>
              <span className="text-[11px] text-slate-400">3 new</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {[
                { icon: AlertTriangle, color: 'text-rose-500', title: 'TXN-20260915-00534 rejected', detail: 'Fraud risk score exceeded threshold', time: '5m ago', txnId: 'TXN-20260915-00534' },
                { icon: Info, color: 'text-amber-500', title: 'TXN-20260915-00198 awaiting Camt.029', detail: 'Cancellation request pending > 30min', time: '18m ago', txnId: 'TXN-20260915-00198' },
                { icon: AlertTriangle, color: 'text-rose-500', title: 'TXN-20260915-00372 failed', detail: 'Core Banking timeout on debit post', time: '32m ago', txnId: 'TXN-20260915-00372' },
              ].map((n, i) => (
                <button
                  key={i}
                  onClick={() => { navigate(`/investigation/${n.txnId}`); setNotifOpen(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                >
                  <div className="flex gap-3">
                    <n.icon className={`w-4 h-4 mt-0.5 ${n.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{n.title}</div>
                      <div className="text-xs text-slate-400 truncate">{n.detail}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{n.time}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      {user && (
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-xs font-bold">
              {user.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">{user.name}</div>
              <div className="text-[11px] text-slate-400 leading-tight">{user.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>
          {profileOpen && (
            <div className="absolute top-full right-0 mt-1 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</div>
                <div className="text-xs text-slate-400">{user.userId} · {user.environment}</div>
              </div>
              <button onClick={() => showToast('Profile page is not available in this demo.')} className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                <User className="w-4 h-4 text-slate-400" /> My Profile
              </button>
              <button onClick={() => showToast('Settings page is not available in this demo.')} className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                <Settings className="w-4 h-4 text-slate-400" /> Settings
              </button>
              <div className="border-t border-slate-100 dark:border-slate-700">
                <button onClick={logout} className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-200" role="status">
          <Info className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
}
