import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  points: number;
  isLoading: boolean;
  isAdmin: boolean;
  isEmailVerified: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  verifyEmail: () => Promise<void>;
  logout: () => Promise<void>;
  refreshPoints: () => Promise<void>;
}

const ADMIN_EMAIL = 'mohammed.f.saqqaf@gmail.com';

const MOCK_ADMIN_USER: UserProfile = {
  id: 'usr-admin-01',
  name: 'محمد السقاف (المدير)',
  email: ADMIN_EMAIL,
  role: 'ADMIN',
  email_verified: true,
  phone: '772606709',
  address: 'اليمن - إب',
  created_at: new Date().toISOString(),
};

const MOCK_CUSTOMER_USER: UserProfile = {
  id: 'usr-cust-01',
  name: 'محمد علي',
  email: 'm.ali@example.com',
  role: 'CUSTOMER',
  email_verified: true,
  phone: '772606709',
  address: 'اليمن - إب',
  created_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(MOCK_CUSTOMER_USER);
  const [points, setPoints] = useState<number>(250);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      setIsLoading(true);
      supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
        if (authUser) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (profile) {
            setUser(profile);
          }
        }
        setIsLoading(false);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (profile) setUser(profile);
        } else {
          setUser(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const refreshPoints = async () => {
    if (!user) return;
    if (isSupabaseConfigured()) {
      const { data } = await supabase
        .from('points')
        .select('points')
        .eq('user_id', user.id);
      
      if (data) {
        const total = data.reduce((acc, curr) => acc + curr.points, 0);
        setPoints(total);
      }
    }
  };

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        if (data.user) {
          let { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (data.user.email?.toLowerCase() === ADMIN_EMAIL && profile?.role !== 'ADMIN') {
            await supabase.from('users').update({ role: 'ADMIN' }).eq('id', data.user.id);
            profile = profile ? { ...profile, role: 'ADMIN' } : profile;
          }

          if (profile) setUser(profile);
        }
        return { success: true };
      } else {
        const normalizedEmail = email.trim().toLowerCase();
        if (normalizedEmail === ADMIN_EMAIL) {
          setUser(MOCK_ADMIN_USER);
        } else {
          setUser({
            ...MOCK_CUSTOMER_USER,
            email: normalizedEmail,
            name: normalizedEmail.split('@')[0],
            role: 'CUSTOMER',
          });
        }
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'فشل تسجيل الدخول' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: { name, role: 'CUSTOMER' },
          },
        });
        if (error) throw error;
        if (data.user) {
          const newUser: UserProfile = {
            id: data.user.id,
            name,
            email,
            role: 'CUSTOMER',
            email_verified: false,
            created_at: new Date().toISOString(),
          };
          setUser(newUser);
        }
        return { success: true, message: 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني.' };
      } else {
        const newUser: UserProfile = {
          id: `usr-${Date.now()}`,
          name,
          email,
          role: 'CUSTOMER',
          email_verified: false,
          created_at: new Date().toISOString(),
        };
        setUser(newUser);
        return { success: true, message: 'تم إنشاء الحساب بنجاح. أرسلنا رمز التحقق إلى بريدك.' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'فشل إنشاء الحساب' };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async () => {
    if (user) {
      setUser({ ...user, email_verified: true });
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        points,
        isLoading,
        isAdmin: user?.role === 'ADMIN',
        isEmailVerified: user?.email_verified ?? false,
        login,
        signup,
        verifyEmail,
        logout,
        refreshPoints,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
