'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomerProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (data) setCustomerProfile(data);
    return data;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCustomerProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchCustomerProfile(session.user.id);
      } else {
        setCustomerProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchCustomerProfile]);

  const signInWithOtp = async (phone) => {
    let formattedPhone = phone.replace(/[\s()-]/g, '');
    if (/^\d{10}$/.test(formattedPhone)) {
      formattedPhone = `+91${formattedPhone}`;
    } else if (/^\d+$/.test(formattedPhone) && !formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
      options: {
        shouldCreateUser: true,
      },
    });
    if (error) throw error;
  };

  const verifyOtp = async (phone, token) => {
    let formattedPhone = phone.replace(/[\s()-]/g, '');
    if (/^\d{10}$/.test(formattedPhone)) {
      formattedPhone = `+91${formattedPhone}`;
    } else if (/^\d+$/.test(formattedPhone) && !formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }

    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token,
      type: 'sms',
    });
    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  };

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUpWithEmail = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setCustomerProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchCustomerProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        customerProfile,
        loading,
        signInWithOtp,
        verifyOtp,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
