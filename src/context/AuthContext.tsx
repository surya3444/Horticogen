"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { ensureUserProfile, getUserProfile } from "@/lib/firebase/users";
import type { UserProfile } from "@/lib/types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const p = await ensureUserProfile(u.uid, u.email || "", u.displayName || "");
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const p = await ensureUserProfile(cred.user.uid, email, name);
      setProfile(p);
    },
    []
  );

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    await fbSignOut(auth);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) setProfile(await getUserProfile(user.uid));
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin: profile?.role === "admin",
        register,
        login,
        logout,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
