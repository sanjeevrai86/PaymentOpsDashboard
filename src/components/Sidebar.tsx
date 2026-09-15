import { useRouter } from '@/hooks/useRouter';
import { useState } from 'react';
import { LayoutDashboard, Search, FileText, Bell, Settings, HelpCircle, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { route, navigate } = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  const items = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', enabled: true },
    { label: 'Investigations', icon: Search, path: '/dashboard', enabled: true },
    { label: 'Reports', icon: FileText, path: null, enabled: false },
    { label: 'Alerts', icon: Bell, path: null, enabled: false },
    { label: 'Monitoring', icon: Activity, path: null, enabled: false },
  ];

  const bottomItems = [
    { label: 'Settings', icon: Settings, path: null, enabled: false },
    { label: 'Help & Support', icon: HelpCircle, path: null, enabled: false },
  ];

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-56'} transition-all duration-200 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0`}>
      <div className="flex-1 py-4 space-y-1 px-2">
        {items.map((item, i) => {
          const isActive = i === 0 && route.path === '/dashboard';
          return (
            <button
              key={i}
              onClick={() => item.path ? navigate(item.path) : showToast(`${item.label} is not available in this demo.`)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition group ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : item.enabled
                    ? 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? '' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </div>

      <div className="py-4 px-2 space-y-1 border-t border-slate-100 dark:border-slate-800">
        {bottomItems.map((item, i) => (
          <button
            key={i}
            onClick={() => item.path ? navigate(item.path) : showToast(`${item.label} is not available in this demo.`)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-4.5 h-4.5 shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </button>
        ))}
      </div>

      <button
        onClick={onToggle}
        className="h-9 flex items-center justify-center border-t border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {toast && (
        <div className="absolute bottom-16 left-2 z-50 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl px-3 py-2 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap" role="status">
          {toast}
        </div>
      )}
    </aside>
  );
}
