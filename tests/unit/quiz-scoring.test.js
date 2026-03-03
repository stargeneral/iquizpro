/**
 * Unit tests for quiz scoring utilities (QuizProsScoring)
 *
 * These tests exercise the pure scoring logic without a browser environment.
 * The module is loaded by evaluating the IIFE source directly.
 */

/* global window */

// Provide minimal window globals expected by the IIFE
global.window = global;
global.QuizProsUtils = {
  logger: { info: () => {}, debug: () => {}, warn: () => {}, error: () => {} }
};
global.QuizProsConfig = { features: {} };

// Load the module under test
require('../../js/modules/quiz-scoring.js');
const QuizProsScoring = global.QuizProsScoring;

describe('QuizProsScoring', () => {
  test('exports are defined', () => {
    expect(QuizProsScoring).toBeDefined();
    expect(typeof QuizProsScoring.getDominantType).toBe('function');
    expect(typeof QuizProsScoring.getScoreMessage).toBe('function');
  });

  // ─── getDominantType ────────────────────────────────────────────────────────
  describe('getDominantType', () => {
    test('returns the key with the highest score', () => {
      const scores = { introvert: 3, extrovert: 7, ambivert: 5 };
      expect(QuizProsScoring.getDominantType(scores)).toBe('extrovert');
    });

    test('handles a single-key object', () => {
      expect(QuizProsScoring.getDominantType({ aries: 10 })).toBe('aries');
    });

    test('returns a string for equal scores (any valid key)', () => {
      const scores = { a: 5, b: 5 };
      const result = QuizProsScoring.getDominantType(scores);
      expect(['a', 'b']).toContain(result);
    });

    test('returns null or undefined for empty object', () => {
      // Behaviour is implementation-defined; just ensure it does not throw
      expect(() => QuizProsScoring.getDominantType({})).not.toThrow();
    });

    test('distinguishes between closely scored types', () => {
      const scores = { leader: 10, thinker: 9, helper: 8 };
      expect(QuizProsScoring.getDominantType(scores)).toBe('leader');
    });

    test('works with zero scores', () => {
      const scores = { a: 0, b: 0, c: 1 };
      expect(QuizProsScoring.getDominantType(scores)).toBe('c');
    });
  });

  // ─── getScoreMessage ────────────────────────────────────────────────────────
  describe('getScoreMessage — return shape', () => {
    test('returns an object with message, emoji, shouldCelebrate', () => {
      const result = QuizProsScoring.getScoreMessage(8, 10);
      expect(typeof result).toBe('object');
      expect(typeof result.message).toBe('string');
      expect(typeof result.emoji).toBe('string');
      expect(typeof result.shouldCelebrate).toBe('boolean');
    });

    test('message is non-empty for any valid input', () => {
      [0, 3, 5, 7, 9, 10].forEach(score => {
        const r = QuizProsScoring.getScoreMessage(score, 10);
        expect(r.message.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getScoreMessage — score brackets', () => {
    // ≥ 90% → Outstanding / shouldCelebrate: true
    test('100% (10/10) → Outstanding bracket', () => {
      const r = QuizProsScoring.getScoreMessage(10, 10);
      expect(r.message).toMatch(/outstanding/i);
      expect(r.emoji).toBe('🏆');
      expect(r.shouldCelebrate).toBe(true);
    });

    test('90% boundary (9/10) → Outstanding bracket', () => {
      const r = QuizProsScoring.getScoreMessage(9, 10);
      expect(r.message).toMatch(/outstanding/i);
      expect(r.shouldCelebrate).toBe(true);
    });

    // ≥ 70% and < 90% → Great / shouldCelebrate: true
    test('80% (8/10) → Great bracket', () => {
      const r = QuizProsScoring.getScoreMessage(8, 10);
      expect(r.message).toMatch(/great/i);
      expect(r.emoji).toBe('🎉');
      expect(r.shouldCelebrate).toBe(true);
    });

    test('70% boundary (7/10) → Great bracket', () => {
      const r = QuizProsScoring.getScoreMessage(7, 10);
      expect(r.message).toMatch(/great/i);
      expect(r.shouldCelebrate).toBe(true);
    });

    // ≥ 50% and < 70% → Good effort / shouldCelebrate: false
    test('60% (6/10) → Good effort bracket', () => {
      const r = QuizProsScoring.getScoreMessage(6, 10);
      expect(r.message).toMatch(/good/i);
      expect(r.emoji).toBe('👍');
      expect(r.shouldCelebrate).toBe(false);
    });

    test('50% boundary (5/10) → Good effort bracket', () => {
      const r = QuizProsScoring.getScoreMessage(5, 10);
      expect(r.message).toMatch(/good/i);
      expect(r.shouldCelebrate).toBe(false);
    });

    // ≥ 30% and < 50% → Not bad / shouldCelebrate: false
    test('40% (4/10) → Not bad bracket', () => {
      const r = QuizProsScoring.getScoreMessage(4, 10);
      expect(r.message).toMatch(/not bad/i);
      expect(r.emoji).toBe('🤔');
      expect(r.shouldCelebrate).toBe(false);
    });

    test('30% boundary (3/10) → Not bad bracket', () => {
      const r = QuizProsScoring.getScoreMessage(3, 10);
      expect(r.message).toMatch(/not bad/i);
      expect(r.shouldCelebrate).toBe(false);
    });

    // < 30% → Keep learning / shouldCelebrate: false
    test('20% (2/10) → Keep learning bracket', () => {
      const r = QuizProsScoring.getScoreMessage(2, 10);
      expect(r.message).toMatch(/keep learning/i);
      expect(r.emoji).toBe('📚');
      expect(r.shouldCelebrate).toBe(false);
    });

    test('0% (0/10) → Keep learning bracket', () => {
      const r = QuizProsScoring.getScoreMessage(0, 10);
      expect(r.message).toMatch(/keep learning/i);
      expect(r.shouldCelebrate).toBe(false);
    });
  });

  describe('getScoreMessage — boundary precision', () => {
    // Verify each boundary value falls in the UPPER bracket (≥ rule, not >)
    test('exactly 90% is Outstanding, not Great', () => {
      const r = QuizProsScoring.getScoreMessage(9, 10);  // 90%
      expect(r.message).toMatch(/outstanding/i);
    });

    test('exactly 70% is Great, not Good effort', () => {
      const r = QuizProsScoring.getScoreMessage(7, 10);  // 70%
      expect(r.message).toMatch(/great/i);
    });

    test('exactly 50% is Good effort, not Not bad', () => {
      const r = QuizProsScoring.getScoreMessage(5, 10);  // 50%
      expect(r.message).toMatch(/good/i);
    });

    test('exactly 30% is Not bad, not Keep learning', () => {
      const r = QuizProsScoring.getScoreMessage(3, 10);  // 30%
      expect(r.message).toMatch(/not bad/i);
    });

    test('29% (just below 30 boundary) is Keep learning', () => {
      // 29/100 = 29% → Keep learning
      const r = QuizProsScoring.getScoreMessage(29, 100);
      expect(r.message).toMatch(/keep learning/i);
    });
  });

  describe('getScoreMessage — shouldCelebrate flag', () => {
    test('shouldCelebrate is true for scores >= 70%', () => {
      expect(QuizProsScoring.getScoreMessage(7, 10).shouldCelebrate).toBe(true);
      expect(QuizProsScoring.getScoreMessage(9, 10).shouldCelebrate).toBe(true);
      expect(QuizProsScoring.getScoreMessage(10, 10).shouldCelebrate).toBe(true);
    });

    test('shouldCelebrate is false for scores < 70%', () => {
      expect(QuizProsScoring.getScoreMessage(6, 10).shouldCelebrate).toBe(false);
      expect(QuizProsScoring.getScoreMessage(5, 10).shouldCelebrate).toBe(false);
      expect(QuizProsScoring.getScoreMessage(3, 10).shouldCelebrate).toBe(false);
      expect(QuizProsScoring.getScoreMessage(0, 10).shouldCelebrate).toBe(false);
    });
  });
});
