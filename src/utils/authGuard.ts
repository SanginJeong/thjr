import { UserType } from "@/types/global";

export type AuthRule = {
  // 정적 경로만 지원한다. (_document 에서는 location.pathname, 페이지에서는 router.pathname 과 비교)
  path: string;
  // 지정하면 해당 유저 타입만 접근 가능하다.
  role?: UserType;
  // role 이 맞지 않을 때 보낼 경로
  roleRedirect?: string;
};

// 보호 페이지 규칙의 단일 소스. _document 인라인 스크립트와 useAuthGuard 가 함께 사용한다.
export const AUTH_RULES: AuthRule[] = [
  { path: "/profile" },
  { path: "/profile/register" },
  { path: "/employer/shops", role: "employer", roleRedirect: "/signin" },
  { path: "/employer/shops/register", role: "employer", roleRedirect: "/joblist" },
];

// 주의: AUTH_GATE_SCRIPT 에서 toString() 으로 직렬화되므로 외부 참조 없이 자기완결적으로 유지할 것.
export function getAuthRedirect(
  rules: AuthRule[],
  pathname: string,
  userId: string | null,
  userType: string | null,
): string | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    if (rule.path !== path) {
      continue;
    }
    if (!userId) {
      return "/signin";
    }
    if (rule.role && userType !== rule.role) {
      return rule.roleRedirect || "/signin";
    }
    return null;
  }
  return null;
}

// <head> 에서 body 를 그리기 전에 실행되어, 하드 로드 시 보호 페이지의 정적 셸이 보이지 않게 한다.
export const AUTH_GATE_SCRIPT = `(function () {
  try {
    var target = (${getAuthRedirect.toString()})(
      ${JSON.stringify(AUTH_RULES)},
      location.pathname,
      localStorage.getItem("userId"),
      localStorage.getItem("userType")
    );
    if (target) location.replace(target);
  } catch (e) {}
})();`;
