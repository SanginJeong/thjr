import path from "path";

export const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL as string;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_API_URL 이 설정되지 않았습니다. (.env 확인)");
}

export const authDir = path.resolve(__dirname, ".auth");
export const employeeStatePath = path.join(authDir, "employee.json");
export const employerStatePath = path.join(authDir, "employer.json");

// 실행마다 충돌 없는 새 계정을 만들기 위한 유니크 이메일 생성기.
// codeit the-julge API 는 영문/숫자 이메일만 허용하므로 형식을 맞춘다.
export const uniqueEmail = (role: string) =>
  `e2e${role}${Date.now()}${Math.floor(Math.random() * 1000)}@test.com`;

export const TEST_PASSWORD = "test1234";
