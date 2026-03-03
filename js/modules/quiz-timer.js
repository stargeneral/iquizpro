/**
 * Quiz Timer — Loading fallback timer utility for IQuizPros.
 * Exposes window.QuizProsTimer
 */

window.QuizProsTimer = (function () {
  'use strict';

  /**
   * Schedule a loading-fallback callback after a delay.
   * Matches setTimeout(callback, delay) convention for drop-in compatibility.
   * @param {Function} callback  Function to call when the timer fires.
   * @param {number}   delay     Milliseconds to wait.
   * @returns {number} The timeout ID (pass to clearTimeout to cancel).
   */
  function scheduleLoadingFallback(callback, delay) {
    return setTimeout(callback, delay);
  }

  return { scheduleLoadingFallback: scheduleLoadingFallback };
})();
