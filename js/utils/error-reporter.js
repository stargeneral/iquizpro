/**
 * Error Reporter for iQuizPros
 * Centralised uncaught-error and unhandled-rejection handler.
 * Reports to QuizProsAnalytics (GA4 app_error event) and keeps a
 * small in-memory log for debugging.
 */

window.QuizProsErrorReporter = (function() {
  var _log = [];
  var MAX_LOG = 50;
  var _recentErrors = {};       // key → last-reported timestamp
  var DEDUP_WINDOW_MS = 60000;  // 60 seconds

  function _isDuplicate(key) {
    var now = Date.now();
    var last = _recentErrors[key];
    if (last && (now - last) < DEDUP_WINDOW_MS) return true;
    _recentErrors[key] = now;
    return false;
  }

  function _record(context, message, detail) {
    var entry = { ts: Date.now(), context: context, message: message, detail: detail };
    _log.push(entry);
    if (_log.length > MAX_LOG) _log.shift();

    // Forward to analytics (deduplicated — same error suppressed within 60 s)
    var key = (context || '') + '|' + (message || '');
    if (_isDuplicate(key)) return;
    try {
      if (window.QuizProsAnalytics && window.QuizProsAnalytics.trackAppError) {
        window.QuizProsAnalytics.trackAppError(message, context);
      }
    } catch (e) { /* guard against infinite loops */ }
  }

  function report(context, error) {
    var message = (error && error.message) ? error.message : String(error);
    _record(context, message, error && error.stack ? error.stack.slice(0, 300) : null);
  }

  function getLog() {
    return _log.slice();
  }

  // Global uncaught JS errors
  window.addEventListener('error', function(event) {
    var context = (event.filename || 'unknown') + ':' + event.lineno;
    _record(context, event.message || 'Uncaught error', null);
  });

  // Global unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    var reason = event.reason;
    var message = reason instanceof Error ? reason.message : String(reason);
    _record('unhandledrejection', message, null);
  });

  return {
    report: report,
    getLog: getLog
  };
})();
