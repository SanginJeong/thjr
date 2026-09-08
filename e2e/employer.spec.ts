import { test, expect } from "@playwright/test";
import { employerStatePath } from "./config";

// 사장님 인증 상태(setup 에서 생성한 employer 계정)를 재사용한다.
test.use({ storageState: employerStatePath });

test.describe("사장님 가게 · 공고 관리", () => {
  test("로그인 상태에서 헤더에 '내 가게' 메뉴가 보인다", async ({ page }) => {
    await page.goto("/joblist");
    await expect(page.getByRole("link", { name: "내 가게" })).toBeVisible();
    await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();
  });

  test("아직 가게가 없으면 '가게 등록하기'가 보인다", async ({ page }) => {
    await page.goto("/employer/shops");
    await expect(page.getByRole("heading", { name: "내가게" })).toBeVisible();
    await expect(page.getByRole("button", { name: "가게 등록하기" })).toBeVisible();
  });

  test("'가게 등록하기'를 누르면 가게 등록 페이지로 이동한다", async ({ page }) => {
    await page.goto("/employer/shops");
    await page.getByRole("button", { name: "가게 등록하기" }).click();
    await expect(page).toHaveURL(/\/employer\/shops\/register/);
  });

  test("로그아웃하면 로그인 메뉴가 다시 보인다", async ({ page }) => {
    await page.goto("/joblist");
    await page.getByRole("button", { name: "로그아웃" }).click();
    await expect(page.getByRole("link", { name: "로그인" })).toBeVisible();
  });
});
