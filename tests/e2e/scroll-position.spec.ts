import { expect, test } from "@playwright/test";

async function scrollMetrics(page: import("@playwright/test").Page) {
  return page.evaluate(() => ({
    active: document.activeElement?.tagName,
    elementScrollTop: document.scrollingElement?.scrollTop ?? -1,
    hash: location.hash,
    height: document.documentElement.scrollHeight,
    historyRestoration: history.scrollRestoration,
    innerHeight,
    scrollY,
  }));
}

async function expectAtTop(page: import("@playwright/test").Page) {
  await expect.poll(async () => (await scrollMetrics(page)).scrollY).toBe(0);
  await expect.poll(async () => (await scrollMetrics(page)).elementScrollTop).toBe(0);
}

async function setScrollTop(page: import("@playwright/test").Page, top: number) {
  await page.evaluate((nextTop) => {
    document.documentElement.style.scrollBehavior = "auto";
    if (document.scrollingElement) document.scrollingElement.scrollTop = nextTop;
  }, top);
}

test("fresh Arabic navigation stays at the top after hydration", async ({ page }) => {
  await page.goto("/ar", { waitUntil: "domcontentloaded" });
  await expectAtTop(page);
  await expect(page).toHaveURL(/\/ar\/?$/);
});

test("fresh English navigation stays at the top after hydration", async ({ page }) => {
  await page.goto("/en", { waitUntil: "domcontentloaded" });
  await expectAtTop(page);
  await expect(page).toHaveURL(/\/en\/?$/);
});

test("root redirect starts at the top", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expectAtTop(page);
  await expect(page).toHaveURL(/\/ar\/?$/);
});

test("locale switching starts the new homepage at the top", async ({ page }) => {
  await page.goto("/ar", { waitUntil: "networkidle" });
  await setScrollTop(page, await page.evaluate(() => document.scrollingElement?.scrollHeight ?? 0));
  await page.getByRole("link", { name: /English|الإنجليزية/ }).click();
  await page.waitForLoadState("domcontentloaded");
  await expectAtTop(page);

  await page.getByRole("link", { name: /Arabic|العربية/ }).click();
  await page.waitForLoadState("domcontentloaded");
  await expectAtTop(page);
});

test("hydration does not focus an offscreen footer contact trigger", async ({ page }) => {
  await page.goto("/ar", { waitUntil: "domcontentloaded" });
  await expectAtTop(page);
  await expect.poll(async () => (await scrollMetrics(page)).active).not.toBe("BUTTON");
});

test("back and forward retain browser scroll restoration", async ({ page }) => {
  await page.goto("/ar", { waitUntil: "networkidle" });
  await setScrollTop(page, await page.evaluate(() => document.scrollingElement?.scrollHeight ?? 0));
  const footerPosition = await page.evaluate(() => scrollY);
  await Promise.all([
    page.waitForURL(/\/ar\/services\/furniture-moving\/?$/),
    page.getByRole("contentinfo").getByRole("link", { name: "نقل الأثاث" }).click(),
  ]);
  await page.waitForLoadState("networkidle");
  await page.goBack({ waitUntil: "domcontentloaded" });
  await expect.poll(async () => (await scrollMetrics(page)).scrollY).toBeGreaterThan(100);
  expect(await page.evaluate(() => scrollY)).toBeGreaterThanOrEqual(footerPosition - 8);
  await page.goForward({ waitUntil: "domcontentloaded" });
  await expectAtTop(page);
});

test("hash navigation still reaches the requested section", async ({ page }) => {
  await page.goto("/ar", { waitUntil: "networkidle" });
  if ((page.viewportSize()?.width ?? 0) < 768) {
    await page.getByRole("button", { name: "فتح قائمة التنقل" }).click();
  }
  await page.locator('a[href$="#services"]:visible').first().click();
  await expect(page).toHaveURL(/#services$/);
  await expect.poll(async () => (await scrollMetrics(page)).scrollY).toBeGreaterThan(0);
  await expect(page.locator("#services")).toBeVisible();
});
