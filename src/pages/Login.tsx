import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { Environment } from '@/types';
import { Shield, Lock, User, ChevronDown, Building2, Globe, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [environment, setEnvironment] = useState<Environment>('Production');
  const [showPassword, setShowPassword] = useState(false);
  const [envOpen, setEnvOpen] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) {
      setError('Please enter both User ID and Password.');
      return;
    }
    setError('');
    login(userId, password, environment);
    window.location.hash = '/dashboard';
  };

  const environments: Environment[] = ['Production', 'UAT', 'Sandbox'];
  const envColors: Record<Environment, string> = {
    Production: 'text-rose-600 dark:text-rose-400',
    UAT: 'text-amber-600 dark:text-amber-400',
    Sandbox: 'text-emerald-600 dark:text-emerald-400',
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 dark:bg-slate-950">
      {/* Left branding panel */}
      <div className="lg:w-1/2 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">PayOps Central</h1>
              <p className="text-xs text-slate-400">Payment Operations & Triage Platform</p>
            </div>
          </div>
          <div className="hidden lg:block mt-20">
            <h2 className="text-3xl font-bold leading-tight mb-4">Investigate payments across your entire stack.</h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              End-to-end triage for failed, returned, rejected, and cancelled payments across channels, middleware, processors, and clearing.
            </p>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-6 text-xs text-slate-500 mt-12">
          <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> SOC 2 Type II</span>
          <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> ISO 20022</span>
          <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> 256-bit Encryption</span>
        </div>
      </div>

      {/* Right login form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sign in to your account</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Enter your credentials to access the operations portal.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">User ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. jmorgan"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Environment</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setEnvOpen(!envOpen)}
                  className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-left flex items-center justify-between text-sm text-slate-900 dark:text-white hover:border-slate-400 dark:hover:border-slate-600 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <span className={`font-medium ${envColors[environment]}`}>{environment}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${envOpen ? 'rotate-180' : ''}`} />
                </button>
                {envOpen && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
                    {environments.map((env) => (
                      <button
                        key={env}
                        type="button"
                        onClick={() => { setEnvironment(env); setEnvOpen(false); }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition flex items-center justify-between ${env === environment ? 'bg-slate-50 dark:bg-slate-700/30' : ''}`}
                      >
                        <span className={`font-medium ${envColors[env]}`}>{env}</span>
                        {env === environment && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition shadow-lg shadow-indigo-600/20"
            >
              Sign In
            </button>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500 pt-2">
              Use any User ID and password to access the demo.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
