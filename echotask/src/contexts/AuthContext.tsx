import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type StorageMode = 'local' | 'cloud';

const STORAGE_MODE_KEY = 'echotask_storage_mode';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  mode: StorageMode;
  setMode: (mode: StorageMode) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  mode: 'local',
  setMode: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setModeState] = useState<StorageMode>(() => {
    const saved = localStorage.getItem(STORAGE_MODE_KEY);
    return saved === 'cloud' ? 'cloud' : 'local';
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const setMode = (newMode: StorageMode) => {
    localStorage.setItem(STORAGE_MODE_KEY, newMode);
    setModeState(newMode);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setMode('local');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, mode, setMode, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
