// tests/e2e/personality-flow.spec.js
// E2E tests for personality quiz flow (start → answer all → personality result)
const { test, expect } = require('@playwright/test');

test.describe('Personality quiz flow', () => {

  // Helper: scroll to and click a personality quiz card
  async function clickPersonalityTopic(page) {
    await page.goto('/');
    // Wait for topic cards to load
    await expect(page.locator('.topic-card[data-topic]').first()).toBeVisible({ timeout: 10000 });

    // Look for a card that's a personality quiz (category attribute or title pattern)
    const personalityCard = page.locator('.topic-card[data-category="personality"], .topic-card[data-type="personality"]').first();
    const hasPersonality = await personalityCard.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasPersonality) {
      await personalityCard.scrollIntoViewIfNeeded();
      await personalityCard.click();
    } else {
      // Fall back: click any card labelled with a known personality quiz name
      const fallback = page.locator('.topic-card:has-text("Animal"), .topic-card:has-text("Zodiac"), .topic-card:has-text("Love Language")').first();
      if (await fallback.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fallback.scrollIntoViewIfNeeded();
        await fallback.click();
      } else {
        // Last resort: click first card in the Personality section
        const sectionFirst = page.locator('#personality-section .topic-card').first();
        await sectionFirst.scrollIntoViewIfNeeded();
        await sectionFirst.click();
      }
    }
  }

  test('personality quiz starts and shows first question', async ({ page }) => {
    await clickPersonalityTopic(page);

    // A question should appear — no difficulty picker for personality quizzes
    await expect(
      page.locator('.option[role="radio"], .answer-option, .quiz-option').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('can complete a personality quiz and see a personality result', async ({ page }) => {
    await clickPersonalityTopic(page);

    // Answer all questions (personality quizzes are typically 10–15 options)
    for (let i = 0; i < 20; i++) {
      const option = page.locator('.option[role="radio"], .answer-option, .quiz-option').first();
      if (!await option.isVisible({ timeout: 5000 }).catch(() => false)) break;
      await option.click();
      await page.waitForTimeout(600);

      // Check if personality results are visible
      const done = await page.locator('#personality-result, .personality-result, [id*="personality"]').isVisible({ timeout: 800 }).catch(() => false);
      if (done) break;

      // Some personality quizzes have a "Next" button
      const nextBtn = page.locator('button:has-text("Next"), #next-btn').first();
      if (await nextBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(400);
      }
    }

    // Personality result container should be visible
    await expect(
      page.locator('#personality-result, .personality-result, #result-screen').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('personality result contains a type title or heading', async ({ page }) => {
    await clickPersonalityTopic(page);

    for (let i = 0; i < 20; i++) {
      const option = page.locator('.option[role="radio"], .answer-option, .quiz-option').first();
      if (!await option.isVisible({ timeout: 5000 }).catch(() => false)) break;
      await option.click();
      await page.waitForTimeout(600);
      const done = await page.locator('#personality-result, #result-screen').isVisible({ timeout: 800 }).catch(() => false);
      if (done) break;
      const nextBtn = page.locator('button:has-text("Next"), #next-btn').first();
      if (await nextBtn.isVisible({ timeout: 1000 }).catch(() => false)) await nextBtn.click();
      await page.waitForTimeout(400);
    }

    // A personality title/heading should be present
    const heading = page.locator(
      '#personality-result h2, #personality-result h3, .personality-type-title, .result-type, .personality-result-title'
    ).first();
    await expect(heading).toBeVisible({ timeout: 8000 });
    const text = await heading.textContent();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('personality result includes share and PDF buttons', async ({ page }) => {
    await clickPersonalityTopic(page);

    for (let i = 0; i < 20; i++) {
      const option = page.locator('.option[role="radio"], .answer-option, .quiz-option').first();
      if (!await option.isVisible({ timeout: 5000 }).catch(() => false)) break;
      await option.click();
      await page.waitForTimeout(600);
      const done = await page.locator('#personality-result, #result-screen').isVisible({ timeout: 800 }).catch(() => false);
      if (done) break;
      const nextBtn = page.locator('button:has-text("Next"), #next-btn').first();
      if (await nextBtn.isVisible({ timeout: 1000 }).catch(() => false)) await nextBtn.click();
      await page.waitForTimeout(400);
    }

    // Share button
    await expect(
      page.locator('#share-result-btn, button:has-text("Share"), button:has-text("share")').first()
    ).toBeVisible({ timeout: 8000 });

    // PDF download button
    await expect(page.locator('#export-pdf-btn')).toBeVisible({ timeout: 5000 });
  });

});
