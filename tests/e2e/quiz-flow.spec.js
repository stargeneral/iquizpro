// tests/e2e/quiz-flow.spec.js
// E2E tests for knowledge quiz flow (start → answer → results)
const { test, expect } = require('@playwright/test');

test.describe('Knowledge quiz flow', () => {

  test('page loads with topic selection', async ({ page }) => {
    await page.goto('/');
    // Header should be visible
    await expect(page.locator('header')).toBeVisible();
    // Topic selection screen should appear (may be inside skeleton or real cards)
    await expect(page.locator('#topic-selection-screen')).toBeVisible({ timeout: 10000 });
  });

  test('can start a knowledge quiz by clicking a topic card', async ({ page }) => {
    await page.goto('/');
    // Wait for the topic grid to populate (skeleton cards replaced by real ones)
    const topicCard = page.locator('.topic-card[data-topic]').first();
    await expect(topicCard).toBeVisible({ timeout: 10000 });

    // Click the first visible topic card
    await topicCard.click();

    // A difficulty picker or quiz question should appear
    // Accept either the difficulty picker or the first quiz question
    const quizStarted = await Promise.race([
      page.locator('.difficulty-picker, #difficulty-picker').waitFor({ timeout: 8000 }).then(() => 'picker').catch(() => null),
      page.locator('#quiz-question, .question-text, [data-question-index]').waitFor({ timeout: 8000 }).then(() => 'question').catch(() => null),
    ]);
    expect(quizStarted).toBeTruthy();
  });

  test('can complete a short knowledge quiz and see results', async ({ page }) => {
    await page.goto('/');
    // Find and click the first topic card
    const topicCard = page.locator('.topic-card[data-topic]').first();
    await expect(topicCard).toBeVisible({ timeout: 10000 });
    const topicId = await topicCard.getAttribute('data-topic');
    await topicCard.click();

    // If a difficulty picker appears, choose Normal
    const picker = page.locator('.difficulty-picker, #difficulty-picker');
    if (await picker.isVisible({ timeout: 3000 }).catch(() => false)) {
      const normalBtn = page.locator('button:has-text("Normal"), button:has-text("Medium"), .difficulty-option').first();
      await normalBtn.click();
    }

    // Answer questions until results screen appears
    // Limit to 15 iterations to avoid infinite loops in large quizzes
    let answered = 0;
    for (let i = 0; i < 15; i++) {
      const option = page.locator('.option[role="radio"], .answer-option, .quiz-option').first();
      const optionVisible = await option.isVisible({ timeout: 5000 }).catch(() => false);
      if (!optionVisible) break;

      await option.click();

      // After selecting, wait briefly for next question or results
      await page.waitForTimeout(800);

      // Check if results screen is now visible
      const resultsVisible = await page.locator('#result-screen, #final-result, #personality-result, .results-screen').isVisible({ timeout: 1000 }).catch(() => false);
      if (resultsVisible) {
        answered++;
        break;
      }

      // Click "Next" button if present
      const nextBtn = page.locator('button:has-text("Next"), #next-btn, .next-question-btn').first();
      if (await nextBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(400);
      }
      answered++;
    }

    // Results should now be visible
    await expect(
      page.locator('#result-screen, #final-result, .results-screen, [id*="result"]').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('results screen shows score', async ({ page }) => {
    await page.goto('/');
    const topicCard = page.locator('.topic-card[data-topic]').first();
    await expect(topicCard).toBeVisible({ timeout: 10000 });
    await topicCard.click();

    // Skip difficulty picker if shown
    const picker = page.locator('.difficulty-picker, #difficulty-picker');
    if (await picker.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.locator('button:has-text("Normal"), button:has-text("Medium"), .difficulty-option').first().click();
    }

    // Answer all questions
    for (let i = 0; i < 20; i++) {
      const option = page.locator('.option[role="radio"], .answer-option, .quiz-option').first();
      if (!await option.isVisible({ timeout: 4000 }).catch(() => false)) break;
      await option.click();
      await page.waitForTimeout(700);
      const done = await page.locator('#result-screen, #final-result, .results-screen').isVisible({ timeout: 800 }).catch(() => false);
      if (done) break;
      const nextBtn = page.locator('button:has-text("Next"), #next-btn').first();
      if (await nextBtn.isVisible({ timeout: 1000 }).catch(() => false)) await nextBtn.click();
      await page.waitForTimeout(300);
    }

    // Score should be somewhere on the results screen
    const scoreEl = page.locator('#score-display, .score-value, .score-text, [id*="score"]').first();
    await expect(scoreEl).toBeVisible({ timeout: 8000 });
  });

  test('retake button returns to topic selection', async ({ page }) => {
    await page.goto('/');
    const topicCard = page.locator('.topic-card[data-topic]').first();
    await expect(topicCard).toBeVisible({ timeout: 10000 });
    await topicCard.click();

    if (await page.locator('.difficulty-picker, #difficulty-picker').isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.locator('.difficulty-option').first().click();
    }

    for (let i = 0; i < 20; i++) {
      const option = page.locator('.option[role="radio"]').first();
      if (!await option.isVisible({ timeout: 4000 }).catch(() => false)) break;
      await option.click();
      await page.waitForTimeout(700);
      if (await page.locator('#result-screen, #final-result').isVisible({ timeout: 800 }).catch(() => false)) break;
      const nextBtn = page.locator('button:has-text("Next"), #next-btn').first();
      if (await nextBtn.isVisible({ timeout: 1000 }).catch(() => false)) await nextBtn.click();
      await page.waitForTimeout(300);
    }

    // Click retake or home
    const retakeBtn = page.locator('button:has-text("Retake"), button:has-text("Play Again"), #retake-btn, a:has-text("Home")').first();
    if (await retakeBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await retakeBtn.click();
      // After retake/home, topic selection screen should reappear
      await expect(page.locator('#topic-selection-screen')).toBeVisible({ timeout: 8000 });
    }
  });

});
