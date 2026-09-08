import { test, expect } from "@playwright/test";

// 인증 없이 공개 페이지가 정상 로드/렌더되는지 확인하는 최소 스모크 세트.
test.describe("스모크", () => {
  test("메인(공고 목록) 페이지가 뜬다", async ({ page }) => {
    await page.goto("/joblist");
    await expect(page).toHaveTitle(/전체 공고/);
    await expect(page.getByRole("heading", { name: "전체 공고" })).toBeVisible();
    await expect(page.getByRole("banner")).toBeVisible();
  });

  test("로그인 페이지가 뜬다", async ({ page }) => {
    await page.goto("/signin");
    await expect(page).toHaveTitle(/로그인/);
    await expect(page.getByLabel("이메일 입력")).toBeVisible();
    await expect(page.getByLabel("비밀번호 입력")).toBeVisible();
    await expect(page.getByRole("button", { name: "로그인 버튼" })).toBeVisible();
  });

  test("회원가입 페이지가 뜬다", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByLabel("이메일 입력 영역")).toBeVisible();
    await expect(page.getByRole("button", { name: "가입하기 버튼" })).toBeVisible();
  });

  test("헤더 로고가 공고 목록 링크를 가진다", async ({ page }) => {
    // 로그인/회원가입 페이지에는 헤더가 없으므로, 헤더가 있는 목록 페이지에서 확인한다.
    await page.goto("/joblist");
    const logo = page.getByRole("banner").getByLabel("공고 리스트 페이지로 이동");
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("href", "/joblist");
  });
});
