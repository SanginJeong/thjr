import { useRouter } from "next/router";

export const useLogoutQuery = () => {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userType");
    router.replace("/joblist");
  };

  return { logout };
};
