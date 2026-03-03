// tests/e2e/daily-challenge.spec.js
// E2E tests for the daily challenge UI card and embed mode
const { test, expect } = require('@playwright/test');

test.describe('Daily challenge card', () => {

  test('daily challenge card is visible on home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#daily-challenge-card, .daily-challenge-card')).toBeVisible({ timeout: 10000 });
  });

  test('daily challenge card shows today\'s date or streak', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('#daily-challenge-card, .daily-challenge-card');
    await expect(card).toBeVisible({ timeout: 10000 });

    // Should show either a date, a streak counter, or a quiz label
    const text = await card.textContent();
    expect(text.trim().length).toBeGreaterThan(5);
  });

  test('clicking "Start Challenge" starts a quiz', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#daily-challenge-card, .daily-challenge-card')).toBeVisible({ timeout: 10000 });

    const startBtn = page.locator(
      '#daily-challenge-card button:has-text("Start"), #daily-challenge-card a:has-text("Start"), #daily-start-btn, .daily-start-btn'
    ).first();
    await expect(startBtn).toBeVisible({ timeout: 5000 });
    await startBtn.click();

    // Either a quiz question or a difficulty picker should appear
    const started = await Promise.race([
      page.locator('.option[role="radio"], .answer-option').waitFor({ timeout: 8000 }).then(() => true).catch(() => false),
      page.locator('.difficulty-picker, #difficulty-picker').waitFor({ timeout: 8000 }).then(() => true).catch(() => false),
    ]);
    expect(started).toBe(true);
  });

});

test.describe('Embed mode (?embed=1)', () => {

  test('embed mode hides header and footer', async ({ page }) => {
    // Use a known topic ID that always exists
    await page.goto('/?embed=1&quizId=general-knowledge');

    // body should have embed-mode class
    await expect(page.locator('body')).toHaveClass(/embed-mode/, { timeout: 5000 });

    // Header should NOT be visible
    await expect(page.locator('header')).toBeHidden({ timeout: 5000 });

    // Footer should NOT be visible
    await expect(page.locator('footer')).toBeHidden({ timeout: 5000 });
  });

  test('embed mode auto-starts the quiz', async ({ page }) => {
    await page.goto('/?embed=1&quizId=general-knowledge');

    // Should eventually show a quiz question (embed IIFE polls for engine)
    await expect(
      page.locator('.option[role="radio"], .answer-option, .quiz-option').first()
    ).toBeVisible({ timeout: 15000 });
  });

  test('embed mode shows play-on-iquizpros CTA in results', async ({ page }) => {
    await page.goto('/?embed=1&quizId=general-knowledge');

    // Answer all questions
    for (let i = 0; i < 20; i++) {
      const option = page.locator('.option[role="radio"], .answer-option').first();
      if (!await option.isVisible({ timeout: 5000 }).catch(() => false)) break;
      await option.click();
      await page.waitForTimeout(700);
      const done = await page.locator('#result-screen, #final-result, .results-screen').isVisible({ timeout: 800 }).catch(() => false);
      if (done) break;
      const nextBtn = page.locator('button:has-text("Next"), #next-btn').first();
      if (await nextBtn.isVisible({ timeout: 1000 }).catch(() => false)) await nextBtn.click();
      await page.waitForTimeout(300);
    }

    // The "Play on iQuizPros" CTA link should be visible in results
    await expect(page.locator('.embed-play-cta')).toBeVisible({ timeout: 8000 });
    const href = await page.locator('.embed-play-cta').getAttribute('href');
    expect(href).toContain('iquizpro.com');
  });

  test('embed mode without quizId does not crash the page', async ({ page }) => {
    // embed=1 but no quizId — should fall back to normal page
    await page.goto('/?embed=1');
    await expect(page.locator('#topic-selection-screen')).toBeVisible({ timeout: 10000 });
    // body should NOT have embed-mode (early inline script exits when quizId is missing)
    const cls = await page.locator('body').getAttribute('class');
    expect(cls || '').not.toContain('embed-mode');
  });

});
