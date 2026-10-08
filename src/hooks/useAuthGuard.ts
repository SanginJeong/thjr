import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_RULES, getAuthRedirect } from "@/utils/authGuard";

// 클라이언트 내비게이션용 가드. 규칙은 AUTH_RULES 하나만 본다.
// AuthContext 는 useEffect 에서 localStorage 를 읽으므로, 마운트 전에는 판단하지 않는다.
// (판단을 서두르면 로그인 상태에서도 빈 userId 로 /signin 에 보내진다.)
export const useAuthGuard = () => {
  const router = useRouter();
  const { userId, userType } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const redirectTo = mounted ? getAuthRedirect(AUTH_RULES, router.pathname, userId, userType) : null;

  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router]);

  return { isAuthorized: mounted && redirectTo === null };
};
