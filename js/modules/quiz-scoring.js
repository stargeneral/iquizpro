/**
 * Quiz Scoring — Pure scoring utilities for IQuizPros.
 * No DOM, no state — accepts data parameters and returns results.
 * Exposes window.QuizProsScoring
 */

window.QuizProsScoring = (function () {
  'use strict';

  /**
   * Find the personality type with the highest accumulated score.
   * @param {Object} personalityScores  e.g. { leader: 5, thinker: 3, ... }
   * @returns {string|null} The dominant type key, or null if scores are empty.
   */
  function getDominantType(personalityScores) {
    var dominantType = null;
    var highestScore = -1;
    Object.keys(personalityScores).forEach(function (type) {
      if (personalityScores[type] > highestScore) {
        highestScore = personalityScores[type];
        dominantType = type;
      }
    });
    return dominantType;
  }

  /**
   * Compute the score message, emoji and whether to celebrate.
   * @param {number} score    Number of correct answers.
   * @param {number} total    Total number of questions.
   * @param {string} [topicId] Optional topic ID — used to provide specialist profile messages.
   * @returns {{ message: string, title?: string, emoji: string, shouldCelebrate: boolean }}
   */
  function getScoreMessage(score, total, topicId) {
    var percentage = Math.round((score / total) * 100);

    // ── Psychiatry / Healthcare topics — Psych Score Profile ────────────────
    if (topicId && topicId.indexOf('psych-') === 0) {
      if (percentage >= 90) {
        return { title: '🧠 Brilliant Diagnostician', message: 'You think like a seasoned psychiatrist! Top-tier clinical reasoning.', emoji: '🧠', shouldCelebrate: true };
      }
      if (percentage >= 70) {
        return { title: '💡 Sharp Clinician', message: 'Strong foundations. Keep building your clinical expertise!', emoji: '💡', shouldCelebrate: true };
      }
      if (percentage >= 50) {
        return { title: '📚 Developing Practitioner', message: "You're on the right path. Review your pharmacology and DSM-5 criteria.", emoji: '📚', shouldCelebrate: false };
      }
      if (percentage >= 30) {
        return { title: '🌱 Keen Learner', message: 'Great start for a challenging field. Study those mechanisms!', emoji: '🌱', shouldCelebrate: false };
      }
      return { title: '🎓 Beginning the Journey', message: 'Psychiatry is complex — keep studying and you\'ll get there!', emoji: '🎓', shouldCelebrate: false };
    }

    // ── Standard score messages ──────────────────────────────────────────────
    if (percentage >= 90) {
      return { message: "Outstanding! You're a true expert!", emoji: '🏆', shouldCelebrate: true };
    }
    if (percentage >= 70) {
      return { message: 'Great job! You know your stuff!', emoji: '🎉', shouldCelebrate: true };
    }
    if (percentage >= 50) {
      return { message: "Good effort! You're on the right track.", emoji: '👍', shouldCelebrate: false };
    }
    if (percentage >= 30) {
      return { message: "Not bad, but there's room for improvement.", emoji: '🤔', shouldCelebrate: false };
    }
    return { message: 'Keep learning! Practice makes perfect.', emoji: '📚', shouldCelebrate: false };
  }

  return {
    getDominantType: getDominantType,
    getScoreMessage: getScoreMessage
  };
})();
