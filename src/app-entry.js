/**
 * app-entry.js — webpack Entry Point for iQuizPros
 *
 * Imports all app modules in the same dependency order as the original
 * index.html <script> tags. Each module sets window.QuizProsXxx as a side
 * effect and communicates through the global window object.
 *
 * Order is critical — never reorder without checking CLAUDE.md dependency graph.
 *
 * CSS is also imported here so webpack bundles it via MiniCssExtractPlugin
 * into a single dist/css/app.[hash].css file.
 */

// ── CSS (bundled into dist/css/app.[hash].css) ──────────────────────────────
import '../css/base.css';
import '../css/theme.css';
import '../css/layout.css';
import '../css/components.css';
import '../css/components/buttons.css';
import '../css/components/cards.css';
import '../css/components/modals.css';
import '../css/components/inputs.css';
import '../css/header.css';
import '../styles.css';
import '../css/quiz-detail.css';
import '../css/auth-styles.css';
import '../toast-styles.css';

// ── JavaScript modules (dependency order from index.html) ───────────────────
// Layer 1: Config (no deps)
import '../js/config.js';

// Layer 2: Utilities (depend on QuizProsConfig)
import '../js/utils/utils.js';
import '../js/utils/storage.js';
import '../js/utils/api.js';
import '../js/utils/error-reporter.js';
import '../js/utils/feature-flags.js';
import '../js/utils/audio.js';

// Layer 3: UI Components (depend on utils)
import '../js/components/mobile-menu.js';
import '../js/components/header.js';
import '../js/components/footer.js';
import '../js/components/premium-badge.js';
import '../js/components/question-display.js';
import '../js/components/quiz-card.js';
import '../js/components/results-display.js';

// Layer 4: Feature Modules (depend on utils + components)
import '../js/modules/analytics.js';
import '../js/modules/cookie-consent.js';
import '../js/modules/premium.js';

// Layer 5: Quiz Data + Engine Sub-modules
import '../js/modules/question-bank.js';
import '../js/modules/topics.js';
import '../js/modules/quiz-timer.js';
import '../js/modules/quiz-scoring.js';
import '../js/modules/quiz-renderer.js';

// Layer 6: Core Quiz Engine (depends on all sub-modules above)
import '../js/modules/quiz-engine.js';

// Layer 7: User/UI Management
import '../js/modules/ui-manager.js';
import '../js/modules/user-manager.js';

// Layer 8: App Initialization (depends on all modules above)
import '../app.js';

// Layer 9: Auth (loads last — app.js only registers DOMContentLoaded handlers)
import '../js/modules/auth-manager.js';
