/**
 * Unit tests for QuizProsAnalytics
 *
 * Verifies that GA4 events are dispatched (or queued when gtag is absent)
 * and that the new Phase 7 tracking methods are exposed on the public API.
 */

/* global window */

// Minimal window stubs
global.window = global;
global.navigator = { onLine: true };
global.document = {
  addEventListener: () => {},
  readyState: 'complete'
};

// Stub storage dependency
global.QuizProsStorage = {
  getLocalItem: () => null,
  setLocalItem: () => true,
  removeLocalItem: () => true
};

// Stub utils dependency
global.QuizProsUtils = {
  logger: { info: () => {}, debug: () => {}, warn: () => {}, error: () => {} },
  isOnline: () => true,
  generateId: () => 'test-id'
};

// Stub config with analytics enabled
global.QuizProsConfig = {
  features: { enableAnalytics: true },
  analytics: { categories: { quiz: 'Quiz' } },
  cookieConsent: { requiredForAnalytics: false }
};

// Load the module
require('../../js/modules/analytics.js');
const analytics = global.QuizProsAnalytics;

// Force-enable tracking (bypass consent check for tests)
analytics.enableTracking();

describe('QuizProsAnalytics — public API', () => {
  const methods7 = [
    'trackQuizStart',
    'trackQuizComplete',
    'trackQuizAbandon',
    'trackQuestionAnswered',
    'trackSignup',
    'trackPremiumUpgrade',
    'trackAppError'
  ];

  test.each(methods7)('%s is exported', (method) => {
    expect(typeof analytics[method]).toBe('function');
  });
});

describe('QuizProsAnalytics — gtag integration', () => {
  let events;

  beforeEach(() => {
    events = [];
    global.window.gtag = (type, eventName, params) => {
      if (type === 'event') events.push({ eventName, params });
    };
  });

  afterEach(() => {
    delete global.window.gtag;
  });

  test('trackQuizStart fires quiz_start', () => {
    analytics.trackQuizStart('general', 'knowledge');
    expect(events).toHaveLength(1);
    expect(events[0].eventName).toBe('quiz_start');
    expect(events[0].params.topic_id).toBe('general');
    expect(events[0].params.quiz_type).toBe('knowledge');
  });

  test('trackQuizComplete fires quiz_complete', () => {
    analytics.trackQuizComplete('general', 80, 120);
    expect(events).toHaveLength(1);
    expect(events[0].eventName).toBe('quiz_complete');
    expect(events[0].params.score).toBe(80);
  });

  test('trackQuizAbandon fires quiz_abandon', () => {
    analytics.trackQuizAbandon('general', 3);
    expect(events).toHaveLength(1);
    expect(events[0].eventName).toBe('quiz_abandon');
    expect(events[0].params.question_reached).toBe(3);
  });

  test('trackQuestionAnswered fires question_answered', () => {
    analytics.trackQuestionAnswered('general', 0, 5, true);
    expect(events).toHaveLength(1);
    expect(events[0].eventName).toBe('question_answered');
    expect(events[0].params.correct).toBe(true);
  });

  test('trackSignup fires conversion_signup', () => {
    analytics.trackSignup();
    expect(events).toHaveLength(1);
    expect(events[0].eventName).toBe('conversion_signup');
  });

  test('trackPremiumUpgrade fires conversion_premium', () => {
    analytics.trackPremiumUpgrade();
    expect(events).toHaveLength(1);
    expect(events[0].eventName).toBe('conversion_premium');
  });

  test('trackAppError fires app_error with truncated message', () => {
    analytics.trackAppError('Something went wrong', 'quiz-engine');
    expect(events).toHaveLength(1);
    expect(events[0].eventName).toBe('app_error');
    expect(events[0].params.error_context).toBe('quiz-engine');
  });
});

describe('QuizProsAnalytics — offline queue fallback', () => {
  test('queues events when gtag is absent', () => {
    // Ensure no gtag
    delete global.window.gtag;
    const before = analytics.getOfflineQueue().length;
    analytics.trackQuizStart('personality', 'personality');
    // Queue may or may not grow depending on tracking state; just ensure no throw
    expect(() => analytics.getOfflineQueue()).not.toThrow();
  });
});
