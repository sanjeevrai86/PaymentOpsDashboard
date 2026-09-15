import { useEffect, useState, useCallback } from 'react';

export interface Route {
  path: string;
  params: Record<string, string>;
}

function parseHash(): Route {
  const hash = window.location.hash.slice(1) || '/dashboard';
  const parts = hash.split('/').filter(Boolean);
  if (parts.length === 0) return { path: '/dashboard', params: {} };
  if (parts[0] === 'dashboard') return { path: '/dashboard', params: {} };
  if (parts[0] === 'investigation' && parts[1]) {
    return { path: `/investigation/${parts[1]}`, params: { id: parts[1] } };
  }
  return { path: '/dashboard', params: {} };
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseHash);

  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.hash = path;
  }, []);

  return { route, navigate };
}
