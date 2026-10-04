import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  normalizePhone,
  isPhoneNumber,
  isPhoneMatching,
  getPhoneSearchVariants,
} from '../lib/phoneUtils';

interface AuthContextType {
  user: UserProfile | null;
  points: number;
  isLoading: boolean;
  isAdmin: boolean;
  isEmailVerified: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginWithWhatsApp: (name: string, phone: string, pass?: string, isSignup?: boolean) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, emailOrPhone: string, pass: string) => Promise<{ success: boolean; message?: string }>;
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
    whatsapp: '772606709',
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
    whatsapp: '771234567',
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

const findUserInLocalDB = (identifier: string): (UserProfile & { pass?: string }) | undefined => {
  if (!identifier) return undefined;
  const users = getStoredUsersDB();
  const clean = identifier.trim();

  // 1. Direct Email Match
  if (clean.includes('@')) {
    const normEmail = clean.toLowerCase();
    return users.find((u) => u.email.toLowerCase() === normEmail);
  }

  // 2. Phone / WhatsApp Match with Full Normalization
  const normPhone = normalizePhone(clean);
  const variants = getPhoneSearchVariants(clean);

  return users.find((u) => {
    // Match phone or whatsapp fields
    if (isPhoneMatching(u.phone, clean) || isPhoneMatching(u.whatsapp, clean)) return true;
    if (normPhone && (normalizePhone(u.phone || '') === normPhone || normalizePhone(u.whatsapp || '') === normPhone)) return true;

    // Match against user email if registered as whatsapp pseudo-email
    const userEmail = (u.email || '').toLowerCase();
    if (variants.some((v) => userEmail === v.toLowerCase())) return true;
    if (normPhone && userEmail.startsWith(normPhone)) return true;

    // Exact raw string match
    if (u.phone === clean || u.whatsapp === clean) return true;

    return false;
  });
};

const saveUserToDB = (newUser: UserProfile & { pass?: string }) => {
  try {
    const current = getStoredUsersDB();
    const filtered = current.filter((u) => {
      // Don't keep if same email
      if (u.email && newUser.email && u.email.toLowerCase() === newUser.email.toLowerCase()) return false;
      // Don't keep if matching phone
      if (newUser.phone && isPhoneMatching(u.phone, newUser.phone)) return false;
      if (newUser.whatsapp && isPhoneMatching(u.whatsapp, newUser.whatsapp)) return false;
      return true;
    });
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

  const login = async (identifier: string, pass: string) => {
    setIsLoading(true);
    try {
      if (!identifier || !identifier.trim()) {
        return { success: false, message: 'يرجى إدخال البريد الإلكتروني أو رقم الجوال.' };
      }

      const cleanIdentifier = identifier.trim();
      const isPhone = isPhoneNumber(cleanIdentifier);
      const normPhone = normalizePhone(cleanIdentifier);

      if (isSupabaseConfigured()) {
        let authEmail = cleanIdentifier.toLowerCase();
        if (isPhone) {
          // Attempt to find registered email by phone
          try {
            const { data: dbUser } = await supabase
              .from('users')
              .select('email, phone')
              .or(`phone.eq.${normPhone},whatsapp.eq.${normPhone}`)
              .limit(1)
              .maybeSingle();

            if (dbUser?.email) {
              authEmail = dbUser.email;
            } else {
              authEmail = `${normPhone}@whatsapp.user`;
            }
          } catch (e) {
            authEmail = `${normPhone}@whatsapp.user`;
          }
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: pass,
        });

        if (error) throw error;

        if (data.user) {
          let { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (authEmail === ADMIN_EMAIL && profile?.role !== 'ADMIN') {
            await supabase.from('users').update({ role: 'ADMIN' }).eq('id', data.user.id);
            profile = profile ? { ...profile, role: 'ADMIN' } : profile;
          }

          if (profile) setUser(profile);
        }
        return { success: true };
      } else {
        // Local Persistent Mode: Check using unified multi-format finder
        const found = findUserInLocalDB(cleanIdentifier);

        if (!found) {
          if (cleanIdentifier.toLowerCase() === ADMIN_EMAIL) {
            // Seed admin user
            const adminProfile: UserProfile & { pass: string } = {
              id: 'usr-admin-01',
              name: 'محمد السقاف (المدير)',
              email: ADMIN_EMAIL,
              pass: pass || '123456',
              role: 'ADMIN',
              email_verified: true,
              phone: '772606709',
              whatsapp: '772606709',
              governorate: 'إب',
              area: 'الظهار',
              address: 'اليمن - إب',
              created_at: new Date().toISOString(),
            };
            saveUserToDB(adminProfile);
            setUser(adminProfile);
            localStorage.setItem(SESSION_KEY, JSON.stringify(adminProfile));
            return { success: true };
          }

          if (isPhone) {
            return {
              success: false,
              message: 'رقم الجوال غير مسجل لدينا. يرجى إنشاء حساب جديد أولاً أو التحقق من الرقم.',
            };
          } else {
            return {
              success: false,
              message: 'البريد الإلكتروني غير مسجل لدينا. يرجى إنشاء حساب جديد أولاً.',
            };
          }
        }

        // Check password validity
        if (found.pass && pass && found.pass !== pass) {
          return { success: false, message: 'كلمة المرور غير صحيحة. يرجى التأكد وإعادة المحاولة.' };
        }

        const profile: UserProfile = {
          id: found.id,
          name: found.name,
          email: found.email,
          role: found.email?.toLowerCase() === ADMIN_EMAIL ? 'ADMIN' : found.role || 'CUSTOMER',
          email_verified: found.email_verified ?? true,
          phone: found.phone || (isPhone ? normPhone : '772606709'),
          whatsapp: found.whatsapp || found.phone || (isPhone ? normPhone : undefined),
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

  const loginWithWhatsApp = async (name: string, phone: string, pass: string = '123456', isSignup: boolean = false) => {
    setIsLoading(true);
    try {
      const normPhone = normalizePhone(phone);

      if (!normPhone || normPhone.length < 6) {
        return { success: false, message: 'يرجى إدخال رقم جوال / WhatsApp صحيح مكون من 6 أرقام على الأقل.' };
      }

      if (isSignup && (!name || !name.trim())) {
        return { success: false, message: 'يرجى كتابة الاسم الكامل أولاً قبل إنشاء الحساب.' };
      }

      const found = findUserInLocalDB(phone);

      if (isSignup) {
        if (found) {
          return { success: false, message: 'رقم الجوال هذا مسجل مسبقاً بالفعل. يرجى اختيار تسجيل الدخول.' };
        }

        const finalName = name && name.trim() ? name.trim() : `مستخدم ${normPhone.slice(-4)}`;
        const newProfile: UserProfile & { pass: string } = {
          id: `usr-wa-${Date.now()}`,
          name: finalName,
          email: `${normPhone}@whatsapp.user`,
          pass: pass || '123456',
          role: 'CUSTOMER',
          email_verified: true,
          phone: normPhone,
          whatsapp: normPhone,
          login_provider: 'whatsapp',
          governorate: 'إب',
          area: 'الظهار',
          address: 'اليمن - إب',
          created_at: new Date().toISOString(),
        };

        saveUserToDB(newProfile);

        const { pass: _, ...profile } = newProfile;
        setUser(profile);
        localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
        return { success: true };
      } else {
        // Login Flow with Phone
        if (!found) {
          return {
            success: false,
            message: 'رقم الجوال هذا غير مسجل لدينا. يرجى النقر على "إنشاء حساب جديد".',
          };
        }

        if (found.pass && pass && found.pass !== pass) {
          return { success: false, message: 'كلمة المرور غير صحيحة. يرجى التأكد وإعادة المحاولة.' };
        }

        const profile: UserProfile = {
          id: found.id,
          name: found.name,
          email: found.email,
          role: 'CUSTOMER',
          email_verified: true,
          phone: found.phone || normPhone,
          whatsapp: found.whatsapp || normPhone,
          login_provider: 'whatsapp',
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
      return { success: false, message: err.message || 'فشل معالجة رقم الجوال' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, emailOrPhone: string, pass: string) => {
    setIsLoading(true);
    try {
      if (!name || !name.trim()) {
        return { success: false, message: 'يرجى إدخال الاسم الكامل أولاً.' };
      }

      const cleanInput = emailOrPhone.trim();

      // If user provided a phone number in the signup field
      if (isPhoneNumber(cleanInput)) {
        return await loginWithWhatsApp(name, cleanInput, pass, true);
      }

      const normalizedEmail = cleanInput.toLowerCase();

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: pass,
          options: {
            data: { name: name.trim(), role: normalizedEmail === ADMIN_EMAIL ? 'ADMIN' : 'CUSTOMER' },
          },
        });
        if (error) throw error;
        if (data.user) {
          const newUser: UserProfile = {
            id: data.user.id,
            name: name.trim(),
            email: normalizedEmail,
            role: normalizedEmail === ADMIN_EMAIL ? 'ADMIN' : 'CUSTOMER',
            email_verified: false,
            created_at: new Date().toISOString(),
          };
          setUser(newUser);
        }
        return { success: true, message: 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني.' };
      } else {
        const existing = findUserInLocalDB(normalizedEmail);
        if (existing) {
          return { success: false, message: 'البريد الإلكتروني أو رقم الهاتف مسجل بالفعل. يرجى تسجيل الدخول.' };
        }

        const newUser: UserProfile & { pass: string } = {
          id: `usr-${Date.now()}`,
          name: name.trim(),
          email: normalizedEmail,
          pass,
          role: normalizedEmail === ADMIN_EMAIL ? 'ADMIN' : 'CUSTOMER',
          email_verified: false,
          phone: '772606709',
          whatsapp: '772606709',
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
        loginWithWhatsApp,
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
