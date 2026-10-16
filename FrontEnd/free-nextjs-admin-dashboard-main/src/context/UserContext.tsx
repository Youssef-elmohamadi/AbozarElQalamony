"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserProfile } from "@/types/user";
import { getProfileAction } from "@/actions/admin/users";

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<UserProfile | null>;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{
  children: React.ReactNode;
  initialUser?: UserProfile | null;
}> = ({ children, initialUser = null }) => {
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [loading, setLoading] = useState<boolean>(!initialUser);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProfileAction();
      if (res.success && res.data) {
        setUser(res.data);
        return res.data as UserProfile;
      } else {
        setError(res.message || "تعذر جلب بيانات المستخدم");
        return null;
      }
    } catch (err: any) {
      setError(err?.message || "حدث خطأ غير متوقع");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setLoading(false);
    } else {
      fetchUser();
    }
  }, [initialUser, fetchUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        refreshUser: fetchUser,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
