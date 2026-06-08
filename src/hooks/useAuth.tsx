import { UserType } from "@/types/global";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

type AuthContextType = {
  userId: string;
  userType: UserType | null;
  refreshAuth: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState("");
  const [userType, setUserType] = useState<UserType | null>(null);

  const refreshAuth = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    const id = localStorage.getItem("userId");
    const type = localStorage.getItem("userType");
    setUserId(id || "");
    setUserType(type === "employee" || type === "employer" ? type : null);
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  return <AuthContext.Provider value={{ userId, userType, refreshAuth }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthContextProvider 안에서 사용되어야 합니다.");
  }
  return context;
};
