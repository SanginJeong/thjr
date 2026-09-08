import { test as setup, expect, request as playwrightRequest } from "@playwright/test";
import fs from "fs";
import {
  API_URL,
  authDir,
  employeeStatePath,
  employerStatePath,
  uniqueEmail,
  TEST_PASSWORD,
} from "./config";

type Role = "employee" | "employer";

// 실제 API 에 계정을 생성하고 로그인하여 localStorage 토큰을 저장한다.
// 앱의 인증은 쿠키가 아닌 localStorage(token/userId/userType) 기반이므로
// storageState 의 origins localStorage 로 로그인 상태를 재사용한다.
async function createLoggedInState(role: Role, statePath: string, baseURL: string) {
  const email = uniqueEmail(role);
  const api = await playwrightRequest.newContext();

  const signup = await api.post(`${API_URL}/users`, {
    data: { email, password: TEST_PASSWORD, type: role },
  });
  expect(signup.ok(), `회원가입 실패(${role}): ${signup.status()} ${await signup.text()}`).toBeTruthy();

  const login = await api.post(`${API_URL}/token`, {
    data: { email, password: TEST_PASSWORD },
  });
  expect(login.ok(), `로그인 실패(${role}): ${login.status()} ${await login.text()}`).toBeTruthy();

  const { item } = await login.json();
  const { token, user } = item;
  await api.dispose();

  const state = {
    cookies: [],
    origins: [
      {
        origin: baseURL,
        localStorage: [
          { name: "token", value: token },
          { name: "userId", value: user.item.id },
          { name: "userType", value: user.item.type },
        ],
      },
    ],
  };

  fs.mkdirSync(authDir, { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

setup("알바(employee) 계정 로그인 상태 저장", async ({ baseURL }) => {
  await createLoggedInState("employee", employeeStatePath, baseURL!);
});

setup("사장님(employer) 계정 로그인 상태 저장", async ({ baseURL }) => {
  await createLoggedInState("employer", employerStatePath, baseURL!);
});
