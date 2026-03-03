/**
 * QuizPros Main Application
 * The entry point for the QuizPros application - WITH AGGRESSIVE FALLBACK
 */

const QuizProsApp = (function () {
  // Private variables
  const config = window.QuizProsConfig;
  const utils = window.QuizProsUtils;

  // Timeout to force UI display if loading takes too long
  let forceDisplayTimeout = null;

  /**
   * Create a fallback topic selection UI immediately
   */
  function createFallbackTopicSelection() {
    const topicScreen = document.getElementById("topic-selection-screen");
    if (!topicScreen) return;

    console.log("FORCING fallback topic selection UI");

    topicScreen.innerHTML = `
      <h2>Choose Your Quiz Topic</h2>
      <div class="topics-grid">
        <div class="topic-card" onclick="QuizProsEngine.startQuiz('general')">
          <div class="topic-icon"><i class="fas fa-brain"></i></div>
          <h3>General Knowledge</h3>
        </div>
        <div class="topic-card" onclick="QuizProsEngine.startQuiz('science')">
          <div class="topic-icon"><i class="fas fa-flask"></i></div>
          <h3>Science Quiz</h3>
        </div>
        <div class="topic-card" onclick="QuizProsEngine.startQuiz('history')">
          <div class="topic-icon"><i class="fas fa-clock"></i></div>
          <h3>History Legend</h3>
        </div>
        <div class="topic-card" onclick="QuizProsEngine.startQuiz('movies')">
          <div class="topic-icon"><i class="fas fa-film"></i></div>
          <h3>Movie Trivia</h3>
        </div>
      </div>
    `;
  }

  /**
   * Set up forcing mechanism to ensure UI displays
   */
  function setupForceDisplay() {
    // Clear any existing timeout
    if (forceDisplayTimeout) {
      clearTimeout(forceDisplayTimeout);
    }

    // Set a timeout to force display after 3 seconds
    forceDisplayTimeout = setTimeout(() => {
      console.log("Force display timeout triggered");

      // Create fallback topic selection
      createFallbackTopicSelection();

      // Force-hide the loading indicator, if it exists
      try {
        const loadingIndicator = document.querySelector(".loading-indicator");
        if (loadingIndicator) {
          loadingIndicator.style.display = "none";
        }
      } catch (e) {
        console.error("Error hiding loading indicator:", e);
      }
    }, 3000); // 3 seconds timeout
  }

  /**
   * Initialize the application
   */
  async function initApp() {
    console.log(`Initializing QuizPros v${config.app.version}`);

    try {
      // Set up force display mechanism immediately
      setupForceDisplay();

      // Set initial loading state
      const topicScreen = document.getElementById("topic-selection-screen");
      if (topicScreen) {
        topicScreen.innerHTML = `
          <div class="loading-indicator">
            <div class="spinner"></div>
            <h3>Loading quiz topics...</h3>
          </div>
        `;
      }

      // Hide result containers
      const resultContainers = ["pre-result", "final-result", "locked-result"];
      resultContainers.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
      });

      // Initialize the quiz engine if available
      if (window.QuizProsEngine && window.QuizProsEngine.init) {
        window.QuizProsEngine.init();
      } else {
        console.error("QuizProsEngine not available");
      }

      // Try to initialize topic selection UI from whatever module is available
      let topicInitialized = false;

      // First try UI manager
      if (window.QuizProsUI && window.QuizProsUI.initTopicSelectionUI) {
        try {
          window.QuizProsUI.initTopicSelectionUI();
          topicInitialized = true;
          console.log("Topic selection initialized with UI Manager");
          
          // Add refreshContent function to prevent errors
          if (!window.QuizProsUI.refreshContent) {
            window.QuizProsUI.refreshContent = function() {
              console.log("Content refresh requested");
              window.QuizProsUI.initTopicSelectionUI();
            };
          }
        } catch (e) {
          console.error("Error initializing topics with UI Manager:", e);
        }
      }

      // Then try user manager if UI manager failed
      if (
        !topicInitialized &&
        window.QuizProsUserManager &&
        window.QuizProsUserManager.initTopicSelectionUI
      ) {
        try {
          window.QuizProsUserManager.initTopicSelectionUI();
          topicInitialized = true;
          console.log("Topic selection initialized with User Manager");
        } catch (e) {
          console.error("Error initializing topics with User Manager:", e);
        }
      }

      // If both failed, use fallback
      if (!topicInitialized) {
        console.warn("No topic initialization succeeded - using fallback");
        createFallbackTopicSelection();

        // Cancel force display since we've already displayed the fallback
        if (forceDisplayTimeout) {
          clearTimeout(forceDisplayTimeout);
          forceDisplayTimeout = null;
        }
      }

      console.log("QuizPros initialization complete");
    } catch (error) {
      console.error("Error during app initialization:", error);

      // Immediate fallback - don't wait
      createFallbackTopicSelection();

      // Cancel force display since we've already displayed the fallback
      if (forceDisplayTimeout) {
        clearTimeout(forceDisplayTimeout);
        forceDisplayTimeout = null;
      }
    }
  }

  // Public API
  return {
    // Initialization
    init: initApp,

    // Version info
    getVersion: function () {
      return config.app.version;
    },

    // Force display for external access
    forceDisplay: createFallbackTopicSelection,
  };
})();

// Initialize the application on DOM ready
document.addEventListener("DOMContentLoaded", function () {
  // Reset any existing quiz state
  if (window.QuizProsEngine) {
    window.QuizProsEngine.resetQuizState();
  }

  // Initialize the application
  QuizProsApp.init();

  // Add a super aggressive fallback - force display after 5 seconds no matter what
  setTimeout(() => {
    console.log("SUPER AGGRESSIVE FALLBACK: Forcing display after timeout");
    if (document.querySelector(".loading-indicator")) {
      QuizProsApp.forceDisplay();
    }
  }, 5000);
});
window.QuizProsFooter.initializeFullFooter();