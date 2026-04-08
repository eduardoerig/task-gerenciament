import { createContext, useContext, useMemo, useState } from 'react';

interface AuthCtx {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const value = useMemo(
    () => ({
      token,
      login: (t: string) => {
        localStorage.setItem('token', t);
        setToken(t);
      },
      logout: () => {
        localStorage.removeItem('token');
        setToken(null);
      }
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
