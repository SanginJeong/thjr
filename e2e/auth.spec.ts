import { test, expect } from "@playwright/test";
import { API_URL, uniqueEmail, TEST_PASSWORD } from "./config";

// 인증 흐름은 로그인 상태를 재사용하지 않고 매번 새로 검증한다.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("회원가입 / 로그인", () => {
  test("회원가입 후 로그인 페이지로 이동한다", async ({ page }) => {
    const email = uniqueEmail("signup");

    await page.goto("/signup");
    await page.getByLabel("이메일 입력 영역").fill(email);
    await page.getByLabel("패스워드 입력 영역").fill(TEST_PASSWORD);
    await page.getByLabel("패스워드 확인 입력 영역").fill(TEST_PASSWORD);
    await page.getByLabel("알바님 선택").click();
    await page.getByRole("button", { name: "가입하기 버튼" }).click();

    // 가입 완료 모달의 "확인" 이후 /signin 으로 이동한다.
    await page.getByRole("button", { name: "확인" }).click();
    await expect(page).toHaveURL(/\/signin/);
  });

  test("가입한 계정으로 로그인하면 공고 목록으로 이동한다", async ({ page, request }) => {
    // 먼저 API 로 계정을 만들어 두고 UI 로 로그인한다.
    const email = uniqueEmail("login");
    const res = await request.post(`${API_URL}/users`, {
      data: { email, password: TEST_PASSWORD, type: "employee" },
    });
    expect(res.ok()).toBeTruthy();

    await page.goto("/signin");
    await page.getByLabel("이메일 입력").fill(email);
    await page.getByLabel("비밀번호 입력").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "로그인 버튼" }).click();

    await expect(page).toHaveURL(/\/joblist/);
    // 로그인 성공 시 token 이 localStorage 에 저장된다.
    await expect.poll(() => page.evaluate(() => localStorage.getItem("token"))).not.toBeNull();
  });

  test("잘못된 비밀번호로 로그인하면 에러 모달이 뜬다", async ({ page }) => {
    await page.goto("/signin");
    await page.getByLabel("이메일 입력").fill("nobody-e2e@test.com");
    await page.getByLabel("비밀번호 입력").fill("wrongpassword");
    await page.getByRole("button", { name: "로그인 버튼" }).click();

    await expect(page.getByRole("button", { name: "닫기" })).toBeVisible();
    await expect(page).toHaveURL(/\/signin/);
  });
});
