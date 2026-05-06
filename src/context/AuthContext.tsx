"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseUrl, type Profile } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  devBypassRole: (role: Profile['role']) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  devBypassRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isPlaceholder = supabaseUrl.includes('placeholder-project.supabase.co');
    
    if (isPlaceholder) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      setProfile(data as Profile);
    } catch (error) {
      console.error('Error loading profile', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const devBypassRole = (role: Profile['role']) => {
    setProfile({
      id: 'dev-bypass-id',
      role: role,
      outlet_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      full_name: 'Dev User'
    });
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, signOut, devBypassRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
