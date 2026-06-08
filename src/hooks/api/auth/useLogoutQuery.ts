import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";

export const useLogoutQuery = () => {
  const router = useRouter();
  const { refreshAuth } = useAuth();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userType");
    refreshAuth();
    router.replace("/joblist");
  };

  return { logout };
};
