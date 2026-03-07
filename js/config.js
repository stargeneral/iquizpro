/**
 * Configuration for IQuizPros
 * Central configuration file for the application
 */

window.QuizProsConfig = {
  // Application information
  app: {
    name: 'IQuizPros',
    version: '2.0.0',
    copyright: '© 2026 iQuizpro by P.G. Mitala. All rights reserved.',
    baseUrl: 'https://iquizpro.com'
  },
  
  // Firebase configuration
  firebase: {
    // IMPORTANT: Replace with your actual Firebase project config
    apiKey: "AIzaSyCRs_kyp7U8sRGDInIY11ds2N85oT1U1zg",
    authDomain: "quizpros.firebaseapp.com",
    projectId: "quizpros",
    storageBucket: "quizpros.firebasestorage.app",
    messagingSenderId: "684284511365",
    appId: "1:684284511365:web:9cb2919960c3f54d5595ec",
    measurementId: "G-EFENNQ209N"
  },
  
  // Feature flags
  features: {
    // Core features
    enableAnalytics: true,
    localStorage: true,
    offlineSupport: true,
    
    // Premium features
    premiumQuizzes: false, // Controlled by user account status
    premiumAnalysis: false, // Controlled by user account status
    
    // UI features
    darkMode: false,
    highContrast: false,
    
    // A/B test features
    newQuizLayout: false, // A/B test
    enhancedResults: false, // A/B test
    
    // Development features
    debug: false,
    logLevel: 'info' // 'debug', 'info', 'warn', 'error'
  },
  
  // Analytics configuration
  analytics: {
    gaTrackingId: 'G-0QZSJ62FJV',
    categories: {
      quiz: 'Quiz',
      navigation: 'Navigation',
      social: 'Social',
      premium: 'Premium',
      performance: 'Performance',
      error: 'Error',
      consent: 'Consent',
      auth: 'Authentication' // Added for auth events
    }
  },
  
  // Cookie consent configuration
  cookieConsent: {
    version: '1.0',
    requiredForAnalytics: true,
    categories: {
      necessary: {
        name: 'Necessary',
        description: 'These cookies are essential for the website to function properly and cannot be disabled.'
      },
      preferences: {
        name: 'Preferences',
        description: 'These cookies allow the website to remember choices you make and provide enhanced, personalized features.'
      },
      analytics: {
        name: 'Analytics',
        description: 'These cookies help us understand how visitors interact with our website, helping us improve our services.'
      },
      marketing: {
        name: 'Marketing',
        description: 'These cookies are used to track visitors across websites to display relevant advertisements.'
      }
    },
    texts: {
      title: 'Cookie Preferences',
      description: 'We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. By clicking "Accept All", you consent to our use of cookies.',
      acceptAll: 'Accept All',
      rejectAll: 'Reject All',
      savePreferences: 'Save Preferences',
      closeLabel: 'Close',
      footerLinks: [
        { text: 'Privacy Policy', href: 'privacy-policy.html' },
        { text: 'Cookie Policy', href: 'privacy-policy.html#cookies' }
      ]
    }
  },
  
  // Stripe configuration (publishable key is safe for frontend)
  stripe: {
    publishableKey: 'pk_test_51T58PmJ6EmozS4H2ro4wOQqmTl0YZAKBUcMmbl1PU4u7OblPif3ZrMz5zMfQ5kk5w6twoFovZFxtfkKBWK10K2wc000hMafCjP',
    // Stripe Payment Link URLs
    // IMPORTANT: Create NEW Payment Links in Stripe Dashboard at the new prices:
    //   premium → $12.99/month product  (current link is old $9.99 — must be replaced)
    //   pro     → $29.99/month product  (current link is old $19.99 — must be replaced)
    // Each Payment Link: success_url = https://iquizpro.com/?payment=success
    //                    cancel_url  = https://iquizpro.com/premium.html?payment=cancelled
    //                    metadata    = { tier: "premium" } or { tier: "pro" }
    paymentLinks: {
      premium: 'https://buy.stripe.com/test_6oUbJ2aMGdfu9lT6Bx8g002',
      pro:     'https://buy.stripe.com/test_6oU28s8Eyb7mfKh6Bx8g003'
    }
  },

  // Premium tiers configuration
  premium: {
    // Quiz IDs that require a paid subscription
    gatedQuizIds: ['career-deep-dive', 'emotional-intelligence', 'psych-mood', 'psych-anxiety', 'psych-neurocognitive', 'psych-personality-disorders', 'psych-nursing-mood', 'psych-nursing-psychosis', 'psych-nursing-personality', 'psych-nursing-special'],

    tiers: {
      free: {
        name: 'Basic',
        price: 0,
        aiGenerationsPerMonth: 5,
        features: [
          'Access to all standard quizzes',
          '5 AI quiz generations per month',
          'Social sharing',
          'Basic results'
        ]
      },
      premium: {
        name: 'Premium',
        price: 12.99,
        aiGenerationsPerMonth: 100,
        features: [
          'Everything in Basic',
          'All premium quizzes (Career Deep Dive, Emotional Intelligence)',
          '100 AI quiz generations per month',
          'Detailed personality analysis',
          'Quiz history & score trends',
          'Ad-free experience',
          'Priority support'
        ]
      },
      pro: {
        name: 'Pro',
        price: 29.99,
        aiGenerationsPerMonth: 500,
        features: [
          'Everything in Premium',
          '500 AI quiz generations per month',
          'Advanced analytics & lead generation',
          'Custom branding & quiz embedding',
          'Priority support & onboarding'
        ]
      },
      enterprise: {
        name: 'Enterprise',
        price: null, // Custom pricing — contact sales
        aiGenerationsPerMonth: null,
        features: [
          'Custom AI generation volume',
          'White-labeling & API access',
          'Dedicated account manager',
          'Team management features',
          'Advanced security & compliance'
        ]
      },
      // Kept for backward-compat with users subscribed before v3.2 pricing update
      unlimited: {
        name: 'Unlimited (Legacy)',
        price: 19.99,
        aiGenerationsPerMonth: null
      }
    }
  },
  
  // Quiz configuration
  quiz: {
    defaultQuestions: 10,
    timePerQuestion: 30, // seconds
    shareIncentive: true,
    categories: [
      'personality',
      'knowledge',
      'preference',
      'assessment'
    ]
  },
  
  // Timing configuration
  timing: {
    loadingDelay: 1500, // ms
    resultDelay: 1000, // ms
    cookieBannerDelay: 800, // ms
    animationSpeed: 300, // ms
    questionTransitionDelay: 500, // ms - delay before showing next question
    resultTransitionDelay: 1000, // ms - delay before showing results
    quizLoadingFallbackDelay: 5000 // ms - fallback delay if quiz loading gets stuck
  },
  
  // Audio configuration
  audio: {
    enabled: true,
    defaultVolume: 0.7, // 0.0 to 1.0
    sounds: {
      correctAnswer: 'assets/sounds/quiz-correct-answer.wav',
      wrongAnswer: 'assets/sounds/quiz-wrong-answer.wav'
    }
  },
  
  // Ad configuration
  ads: {
    enabled: true,
    positions: {
      topBanner: true,
      betweenQuestions: true,
      results: true
    },
    frequency: {
      questionInterval: 3 // Show ad every X questions
    }
  },
  
  // Error messages
  errors: {
    loadFailed: 'Failed to load quiz data. Please try again later.',
    networkError: 'Network error. Please check your connection and try again.',
    invalidQuiz: 'Invalid quiz data. Please try a different quiz.',
    premiumRequired: 'This feature requires a premium subscription.',
    authRequired: 'Sign in required to access this quiz.' // Added for auth errors
  },
  
  // API endpoints (for future use)
  api: {
    baseUrl: 'https://api.iquizpro.com/v1',
    endpoints: {
      quizzes: '/quizzes',
      results: '/results',
      user: '/user',
      analytics: '/analytics'
    },
    timeout: 10000 // ms
  },
  
  // Admin configuration (Phase 10.5)
  admin: {
    // Replace with the Firebase UID of the app owner/admin
    uid: '93fNHZN5u7YLk5ITbPTHfsFYTI13'
  },

  // Default paths and assets
  paths: {
    defaultImages: {
      personalityQuiz: 'assets/images/default-personality.webp',
      zodiacWheel: 'assets/images/zodiac/zodiac-wheel-default.webp',
      spiritAnimal: 'assets/images/spirit-animals/default-animal.webp',
      userProfile: 'assets/images/default-user.png' // Added default user profile image
    },
    templates: {
      personalityQuizzes: 'templates/personality-quizzes/',
      premiumQuizzes: 'templates/premium-quizzes/'
    }
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.QuizProsConfig;
}