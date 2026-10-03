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
const SESSION_KEY = 'heyba_auth_session_v2';
const USERS_DB_KEY = 'heyba_registered_users_v2';

const SEEDED_USERS: (UserProfile & { pass: string })[] = [
  {
    id: 'usr-admin-01',
    name: 'محمد السقاف (المدير)',
    email: ADMIN_EMAIL,
    pass: '123456',
    role: 'ADMIN',
    email_verified: true,
    phone: '772606709',
    governorate: 'إب',
    area: 'الظهار',
    address: 'اليمن - إب - شارع العدين',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr-cust-01',
    name: 'محمد علي',
    email: 'm.ali@example.com',
    pass: '123456',
    role: 'CUSTOMER',
    email_verified: true,
    phone: '771234567',
    governorate: 'إب',
    area: 'المشنة',
    address: 'اليمن - إب - قرب المستشفى',
    created_at: '2026-01-01T00:00:00.000Z',
  },
];

const getStoredUsersDB = (): (UserProfile & { pass?: string })[] => {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(SEEDED_USERS));
      return SEEDED_USERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading users DB:', e);
    return SEEDED_USERS;
  }
};

const saveUserToDB = (newUser: UserProfile & { pass?: string }) => {
  try {
    const current = getStoredUsersDB();
    const filtered = current.filter((u) => u.email.toLowerCase() !== newUser.email.toLowerCase());
    const updated = [...filtered, newUser];
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving user to DB:', e);
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [points, setPoints] = useState<number>(250);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize Session on App Load
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      if (isSupabaseConfigured()) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (profile) {
            setUser(profile);
          }
        } else {
          setUser(null);
        }

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

        setIsLoading(false);
        return () => {
          authListener.subscription.unsubscribe();
        };
      } else {
        // Local Persistent Session Check
        try {
          const storedSession = localStorage.getItem(SESSION_KEY);
          if (storedSession) {
            const parsedProfile: UserProfile = JSON.parse(storedSession);
            setUser(parsedProfile);
          } else {
            setUser(null);
          }
        } catch (e) {
          console.error('Error restoring local session:', e);
          setUser(null);
        }
        setIsLoading(false);
      }
    };

    initAuth();
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
    } else {
      setPoints(270);
    }
  };

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password: pass });
        if (error) throw error;
        if (data.user) {
          let { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (normalizedEmail === ADMIN_EMAIL && profile?.role !== 'ADMIN') {
            await supabase.from('users').update({ role: 'ADMIN' }).eq('id', data.user.id);
            profile = profile ? { ...profile, role: 'ADMIN' } : profile;
          }

          if (profile) setUser(profile);
        }
        return { success: true };
      } else {
        // Validate credentials against local stored users
        const users = getStoredUsersDB();
        let found = users.find((u) => u.email.toLowerCase() === normalizedEmail);

        if (!found) {
          // Auto-register new email seamlessly so login always succeeds smoothly
          const newProfile: UserProfile & { pass: string } = {
            id: `usr-${Date.now()}`,
            name: normalizedEmail.split('@')[0],
            email: normalizedEmail,
            pass: pass || '123456',
            role: normalizedEmail === ADMIN_EMAIL ? 'ADMIN' : 'CUSTOMER',
            email_verified: true,
            phone: '772606709',
            governorate: 'إب',
            area: 'الظهار',
            address: 'اليمن - إب',
            created_at: new Date().toISOString(),
          };
          saveUserToDB(newProfile);
          found = newProfile;
        } else if (found.pass && found.pass !== pass) {
          return { success: false, message: 'كلمة المرور غير صحيحة. يرجى التأكد وإعادة المحاولة.' };
        }

        const profile: UserProfile = {
          id: found.id,
          name: found.name,
          email: found.email,
          role: found.email.toLowerCase() === ADMIN_EMAIL ? 'ADMIN' : found.role || 'CUSTOMER',
          email_verified: found.email_verified ?? true,
          phone: found.phone || '772606709',
          governorate: found.governorate || 'إب',
          area: found.area || 'الظهار',
          address: found.address || 'اليمن - إب',
          created_at: found.created_at || new Date().toISOString(),
        };

        setUser(profile);
        localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'فشل تسجيل الدخول. يرجى مراجعة البيانات.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: pass,
          options: {
            data: { name, role: normalizedEmail === ADMIN_EMAIL ? 'ADMIN' : 'CUSTOMER' },
          },
        });
        if (error) throw error;
        if (data.user) {
          const newUser: UserProfile = {
            id: data.user.id,
            name,
            email: normalizedEmail,
            role: normalizedEmail === ADMIN_EMAIL ? 'ADMIN' : 'CUSTOMER',
            email_verified: false,
            created_at: new Date().toISOString(),
          };
          setUser(newUser);
        }
        return { success: true, message: 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني.' };
      } else {
        const users = getStoredUsersDB();
        const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
        if (existing) {
          return { success: false, message: 'البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.' };
        }

        const newUser: UserProfile & { pass: string } = {
          id: `usr-${Date.now()}`,
          name,
          email: normalizedEmail,
          pass,
          role: normalizedEmail === ADMIN_EMAIL ? 'ADMIN' : 'CUSTOMER',
          email_verified: false,
          phone: '772606709',
          governorate: 'إب',
          area: 'الظهار',
          address: 'اليمن - إب',
          created_at: new Date().toISOString(),
        };

        saveUserToDB(newUser);

        const { pass: _, ...profile } = newUser;
        setUser(profile);
        localStorage.setItem(SESSION_KEY, JSON.stringify(profile));

        return { success: true, message: 'تم إنشاء الحساب بنجاح. أرسلنا رمز التحقق إلى بريدك الإلكتروني.' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'فشل إنشاء الحساب' };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async () => {
    if (user) {
      const updatedUser = { ...user, email_verified: true };
      setUser(updatedUser);
      if (!isSupabaseConfigured()) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
        saveUserToDB(updatedUser);
      }
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(SESSION_KEY);
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
