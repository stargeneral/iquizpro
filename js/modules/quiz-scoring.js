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
   * @param {number} score   Number of correct answers.
   * @param {number} total   Total number of questions.
   * @returns {{ message: string, emoji: string, shouldCelebrate: boolean }}
   */
  function getScoreMessage(score, total) {
    var percentage = Math.round((score / total) * 100);

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
