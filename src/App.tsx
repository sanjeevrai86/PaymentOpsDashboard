import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { useRouter } from '@/hooks/useRouter';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Investigation from '@/pages/Investigation';
import TopNav from '@/components/TopNav';
import Sidebar from '@/components/Sidebar';

function AppContent() {
  const { user } = useAuth();
  const { route } = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
      <TopNav onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        {route.path.startsWith('/investigation') ? <Investigation /> : <Dashboard />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
