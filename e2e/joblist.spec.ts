import { test, expect } from "@playwright/test";

// 공고 목록/검색/상세 이동. 인증 불필요한 공개 흐름.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("공고 목록 · 상세", () => {
  test("전체 공고 목록이 렌더된다", async ({ page }) => {
    await page.goto("/joblist");
    await expect(page.getByRole("heading", { name: "전체 공고" })).toBeVisible();
  });

  test("검색어를 입력하면 검색 결과 페이지로 이동한다", async ({ page }) => {
    await page.goto("/joblist");
    const search = page.getByLabel("공고 검색");
    await search.fill("서울");
    await search.press("Enter");

    await expect(page).toHaveURL(/keyword=/);
    await expect(page.getByRole("heading", { name: "서울" })).toBeVisible();
  });

  test("공고 카드를 클릭하면 상세 페이지로 이동한다", async ({ page }) => {
    // 기본 정렬(time)은 "시작 예정" 공고만 노출하므로, 날짜 필터가 없는 pay 정렬로 접근한다.
    await page.goto("/joblist?sort=pay");
    await expect(page.getByRole("heading", { name: "전체 공고" })).toBeVisible();

    // 상세 링크 패턴: /jobinfo/{shopId}/{noticeId}
    // 카드는 react-query 로 비동기 로드되므로 넉넉한 타임아웃으로 대기한다.
    const firstCard = page.locator('a[href^="/jobinfo/"]').first();
    await expect(firstCard).toBeVisible({ timeout: 15000 });
    await firstCard.click();

    await expect(page).toHaveURL(/\/jobinfo\/.+\/.+/);
    await expect(page).toHaveTitle(/공고 상세/);
  });
});
