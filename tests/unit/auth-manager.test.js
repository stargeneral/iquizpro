/**
 * Unit tests for QuizProsAuthManager
 *
 * Tests auth state management (isSignedIn / getCurrentUser) by
 * stubbing the Firebase SDK and manually invoking the
 * onAuthStateChanged callback to simulate sign-in and sign-out events.
 */

/* global window */

// ─── Firebase mock ────────────────────────────────────────────────────────────
// Must be declared BEFORE require() so the IIFE boot code picks them up.

let _onAuthStateChangedCb = null;

const mockAuth = {
  setPersistence:                  jest.fn(() => Promise.resolve()),
  onAuthStateChanged:              jest.fn((cb) => { _onAuthStateChangedCb = cb; return () => {}; }),
  getRedirectResult:               jest.fn(() => Promise.resolve(null)),
  signOut:                         jest.fn(() => Promise.resolve()),
  signInWithEmailAndPassword:      jest.fn(() => Promise.resolve({
    user: { uid: 'u1', email: 'a@b.com', displayName: 'Alice',
            photoURL: null, emailVerified: true,
            providerData: [{ providerId: 'password' }] }
  })),
  createUserWithEmailAndPassword:  jest.fn(() => Promise.resolve({
    user: { uid: 'u2', email: 'new@b.com', displayName: null,
            photoURL: null, emailVerified: false,
            providerData: [{ providerId: 'password' }],
            updateProfile: jest.fn(() => Promise.resolve()) }
  })),
  sendPasswordResetEmail:          jest.fn(() => Promise.resolve()),
};

const mockFirebase = {
  apps:         [],
  initializeApp: jest.fn(),
  app:           jest.fn(() => ({})),
  auth:          jest.fn(() => mockAuth),
};
mockFirebase.auth.GoogleAuthProvider = class {};

global.firebase = mockFirebase;

global.QuizProsConfig = {
  firebase: {
    apiKey:            'test-api-key',
    authDomain:        'test.firebaseapp.com',
    projectId:         'test-proj',
    databaseURL:       'https://test.firebaseio.com',
    storageBucket:     'test.appspot.com',
    messagingSenderId: '12345678',
    appId:             '1:12345678:web:abcdef',
  },
  features: {},
};

// Load the module — IIFE runs _boot() immediately, which calls initialize()
// and registers the onAuthStateChanged callback.
require('../../js/modules/auth-manager.js');
const authManager = global.QuizProsAuthManager;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MOCK_USER = {
  uid:           'test-uid-123',
  email:         'test@example.com',
  displayName:   'Test User',
  photoURL:      null,
  emailVerified: true,
  providerData:  [{ providerId: 'password' }],
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('QuizProsAuthManager — public API', () => {
  const expectedMethods = [
    'initialize',
    'signIn',
    'signUp',
    'signInWithGoogle',
    'signOut',
    'isSignedIn',
    'getCurrentUser',
    'showSignInModal',
    'showSignUpModal',
    'showForgotPasswordModal',
    'closeAuthModal',
  ];

  test('module is defined', () => {
    expect(authManager).toBeDefined();
    expect(typeof authManager).toBe('object');
  });

  test.each(expectedMethods)('%s is exported', (method) => {
    expect(typeof authManager[method]).toBe('function');
  });
});

describe('QuizProsAuthManager — initial state', () => {
  test('isSignedIn() returns false before any auth state change', () => {
    // The callback has been registered but not yet invoked
    expect(authManager.isSignedIn()).toBe(false);
  });

  test('getCurrentUser() returns null before any auth state change', () => {
    expect(authManager.getCurrentUser()).toBeNull();
  });

  test('onAuthStateChanged callback was registered with Firebase', () => {
    expect(mockAuth.onAuthStateChanged).toHaveBeenCalledTimes(1);
    expect(_onAuthStateChangedCb).toBeInstanceOf(Function);
  });
});

describe('QuizProsAuthManager — auth state changes', () => {
  afterEach(() => {
    // Always reset to signed-out state so tests are independent
    if (_onAuthStateChangedCb) _onAuthStateChangedCb(null);
  });

  test('isSignedIn() returns true after sign-in callback fires', () => {
    _onAuthStateChangedCb(MOCK_USER);
    expect(authManager.isSignedIn()).toBe(true);
  });

  test('getCurrentUser() returns a user object after sign-in', () => {
    _onAuthStateChangedCb(MOCK_USER);
    const user = authManager.getCurrentUser();
    expect(user).not.toBeNull();
    expect(user.id).toBe('test-uid-123');
    expect(user.email).toBe('test@example.com');
    expect(user.displayName).toBe('Test User');
  });

  test('getCurrentUser() normalises provider from providerData', () => {
    _onAuthStateChangedCb(MOCK_USER);
    expect(authManager.getCurrentUser().provider).toBe('password');
  });

  test('getCurrentUser() defaults displayName to email prefix when displayName absent', () => {
    _onAuthStateChangedCb({
      uid: 'u3', email: 'no-name@example.com', displayName: null,
      photoURL: null, emailVerified: false, providerData: [],
    });
    const user = authManager.getCurrentUser();
    expect(user.displayName).toBe('no-name');
  });

  test('isSignedIn() returns false after sign-out callback fires', () => {
    _onAuthStateChangedCb(MOCK_USER);   // sign in
    expect(authManager.isSignedIn()).toBe(true);
    _onAuthStateChangedCb(null);        // sign out
    expect(authManager.isSignedIn()).toBe(false);
  });

  test('getCurrentUser() returns null after sign-out', () => {
    _onAuthStateChangedCb(MOCK_USER);
    _onAuthStateChangedCb(null);
    expect(authManager.getCurrentUser()).toBeNull();
  });

  test('successive sign-in and sign-out cycles work correctly', () => {
    // Cycle 1
    _onAuthStateChangedCb(MOCK_USER);
    expect(authManager.isSignedIn()).toBe(true);
    _onAuthStateChangedCb(null);
    expect(authManager.isSignedIn()).toBe(false);

    // Cycle 2 — different user
    const user2 = { ...MOCK_USER, uid: 'u99', email: 'b@c.com', displayName: 'Bob' };
    _onAuthStateChangedCb(user2);
    expect(authManager.isSignedIn()).toBe(true);
    expect(authManager.getCurrentUser().id).toBe('u99');
  });
});

describe('QuizProsAuthManager — tier gating / signed-in state stability', () => {
  afterEach(() => {
    if (_onAuthStateChangedCb) _onAuthStateChangedCb(null);
  });

  test('isSignedIn() stays true across multiple reads while user is set', () => {
    _onAuthStateChangedCb(MOCK_USER);
    expect(authManager.isSignedIn()).toBe(true);
    expect(authManager.isSignedIn()).toBe(true);
    expect(authManager.isSignedIn()).toBe(true);
  });

  test('getCurrentUser() is stable across multiple reads', () => {
    _onAuthStateChangedCb(MOCK_USER);
    const a = authManager.getCurrentUser();
    const b = authManager.getCurrentUser();
    expect(a).toBe(b); // same object reference
  });

  test('unathenticated users cannot access auth-gated state', () => {
    // No sign-in callback fired
    expect(authManager.isSignedIn()).toBe(false);
    expect(authManager.getCurrentUser()).toBeNull();
  });
});
