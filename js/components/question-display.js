/**
 * Question Display Component for IQuizPros
 * Provides a reusable component for displaying quiz questions
 * with various question types and layouts
 */

window.QuizProsQuestionDisplay = (function() {
  // Private variables
  const config = window.QuizProsConfig;
  const utils = window.QuizProsUtils;
  
  /**
   * Create a question display element
   * @param {Object} question - Question data
   * @param {Object} options - Display options
   * @param {string} options.type - Question type ('regular', 'personality', 'image')
   * @param {boolean} options.showAds - Whether to show ads
   * @param {Function} options.onSelect - Callback when an option is selected
   * @returns {HTMLElement} Question display element
   */
  function createQuestionDisplay(question, options = {}) {
    if (!question) {
      console.error('Question data is required');
      return null;
    }
    
    const defaultOptions = {
      type: 'regular',
      showAds: !window.QuizProsPremium || !window.QuizProsPremium.hasPremiumAccess(),
      onSelect: null
    };
    
    // Merge options with defaults
    const displayOptions = { ...defaultOptions, ...options };
    
    // Create container element
    const container = document.createElement('div');
    container.className = 'question-container';
    
    // Check if this is an image selection question
    if (question.isImageSelection || displayOptions.type === 'image') {
      return createImageQuestionDisplay(question, displayOptions);
    }
    
    // Create HTML content based on question type
    let html = '';
    
    // Add top banner/ad if needed
    if (displayOptions.showAds) {
      html += `
        <!-- Countdown Banner (Top Ad Space) -->
        <div class="top-banner countdown-banner">
          <div class="banner-content">
            <div class="banner-icon">⏳</div>
            <div class="banner-text">
              <span class="banner-label">New Feature Launching In:</span>
              <span class="banner-message">3 days - Image Personality Quizzes!</span>
            </div>
          </div>
          <div class="banner-action">
            <button class="banner-button" id="banner-button">Take a Quiz Now</button>
          </div>
        </div>
      `;
    } else if (window.QuizProsUI && window.QuizProsUI.createPremiumUpsellBanner && !isPremiumQuiz) {
      // Show premium upsell instead of ad for non-premium users on regular quizzes
      const premiumBanner = window.QuizProsUI.createPremiumUpsellBanner();
      if (premiumBanner) {
        html += premiumBanner.outerHTML;
      }
    }
    
    // Add question banner
    const questionClass = displayOptions.type === 'personality' ? 'personality-question' : '';
    html += `
      <!-- Question Title Banner -->
      <div class="question-banner ${questionClass}">
        <p>${question.question}</p>
      </div>
    `;
    
    // Add middle ad if needed
    if (displayOptions.showAds) {
      html += `
        <!-- Middle Ad Space -->
        <div class="ad-container">
          <div class="ad-block">
            <a href="#" class="ad-link" id="premium-ad-link">
              <div class="test-ad premium-ad">
                <div class="ad-icon">⭐</div>
                <div class="ad-content">
                  <h3>Unlock QuizPros Premium</h3>
                  <p>Access 200+ exclusive quizzes & remove ads</p>
                </div>
                <button class="ad-button premium-button" id="premium-ad-button">Try Free</button>
              </div>
            </a>
          </div>
        </div>
      `;
    }
    
    // Add question number
    html += `
      <!-- Question Number -->
      <div class="question-number">Question ${question.index + 1} of ${question.total}</div>
    `;
    
    // Add options
    const optionClass = displayOptions.type === 'personality' ? 'personality-options' : '';
    html += `<div class="options ${optionClass}">`;
    
    // Add each option
    question.options.forEach((option, index) => {
      const optionTypeClass = displayOptions.type === 'personality' ? 'personality-option' : '';
      html += `
        <button class="option ${optionTypeClass}" data-index="${index}">
          ${option}
        </button>
      `;
    });
    
    html += `</div>`;
    
    // Add bottom ad if needed
    if (displayOptions.showAds) {
      html += `
        <!-- Bottom Ad Space -->
        <div class="ad-container">
          <div class="ad-block">
            <a href="#" class="ad-link" id="creator-ad-link">
              <div class="test-ad creator-ad">
                <div class="ad-icon">🔧</div>
                <div class="ad-content">
                  <h3>Create Your Own Quiz!</h3>
                  <p>Make custom quizzes for friends & family</p>
                </div>
                <button class="ad-button" id="creator-ad-button">Start Now</button>
              </div>
            </a>
          </div>
        </div>
      `;
    }
    
    // Set HTML content
    container.innerHTML = html;
    
    // Add event listeners for options
    const optionButtons = container.querySelectorAll('.option');
    optionButtons.forEach(button => {
      button.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'), 10);
        
        // Call onSelect callback if provided
        if (typeof displayOptions.onSelect === 'function') {
          displayOptions.onSelect(index);
        }
      });
    });
    
    // Add event listeners for ad buttons
    const premiumAdButton = container.querySelector('#premium-ad-button');
    if (premiumAdButton) {
      premiumAdButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (window.QuizProsPremium) {
          window.QuizProsPremium.showPremiumSignup('basic');
        }
      });
    }
    
    // Add event listener for the countdown banner button
    const bannerButton = container.querySelector('#banner-button');
    if (bannerButton) {
      bannerButton.addEventListener('click', function() {
        // Ask for confirmation before leaving the quiz
        if (confirm('Are you sure you want to exit this quiz? Your progress will be lost.')) {
          // Return to topic selection screen
          if (window.QuizProsEngine && window.QuizProsEngine.resetAndReturn) {
            window.QuizProsEngine.resetAndReturn();
          }
        }
      });
    }
    
    return container;
  }
  
  /**
   * Create an image question display element
   * @param {Object} question - Question data
   * @param {Object} options - Display options
   * @returns {HTMLElement} Image question display element
   */
  function createImageQuestionDisplay(question, options) {
    // Create container element
    const container = document.createElement('div');
    container.className = 'question-container';
    
    // Create HTML content
    let html = '';
    
    // Check if this is a special first question for zodiac quiz
    if (options.quizId === 'zodiac-sign-quiz' && question.index === 0) {
      html = `
        <!-- Zodiac Quiz Special Layout -->
        <div class="zodiac-special-layout">
          <h2 class="zodiac-title-top">WHAT IS YOUR TRUE</h2>
          
          <div class="zodiac-wheel-container">
            <img src="assets/images/zodiac/zodiac-wheel.webp" alt="Zodiac Wheel" class="zodiac-wheel" 
                 onerror="this.src='assets/images/zodiac/zodiac-wheel-default.webp'">
          </div>
          
          <h2 class="zodiac-title-bottom">ZODIAC SIGN?</h2>
        </div>
        
        <div class="question-number zodiac-subtitle">Choose the sign you feel most drawn to</div>
      `;
    } else {
      // Regular image question
      // Add question banner
      const questionClass = options.quizId === 'zodiac-sign-quiz' ? 'zodiac-question' : 
                           (options.quizId === 'spirit-animal-quiz' ? 'spirit-animal-question' : '');
      
      html += `
        <!-- Question Title Banner -->
        <div class="question-banner ${questionClass}">
          <p>${question.question || "What do you choose?"}</p>
        </div>
        
        <div class="question-number">Question ${question.index + 1} of ${question.total}</div>
      `;
    }
    
    // Add image selection grid
    const gridClass = options.quizId === 'zodiac-sign-quiz' ? 'zodiac-grid' : 
                     (options.quizId === 'spirit-animal-quiz' ? 'spirit-animal-grid' : '');
    
    html += `<!-- Image Selection Grid -->
      <div class="image-selection-grid ${gridClass}">`;
    
    // Add image options
    question.options.forEach((option, index) => {
      const optionClass = options.quizId === 'zodiac-sign-quiz' ? 'zodiac-option' : 
                         (options.quizId === 'spirit-animal-quiz' ? 'spirit-animal-option' : '');
      
      html += `
        <div class="image-option ${optionClass}" data-index="${index}">
          <img src="${option.image || ""}" alt="${option.text || "Option " + (index + 1)}" 
               onerror="this.src='assets/images/default/default-personality.webp'">
          <div class="image-number">${index + 1}</div>
          <div class="image-caption">${option.text || ""}</div>
        </div>
      `;
    });
    
    html += `</div>`;
    
    // Set HTML content
    container.innerHTML = html;
    
    // Add event listeners for image options
    const imageOptions = container.querySelectorAll('.image-option');
    imageOptions.forEach(option => {
      option.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'), 10);
        
        // Call onSelect callback if provided
        if (typeof options.onSelect === 'function') {
          options.onSelect(index);
        }
      });
    });
    
    return container;
  }
  
  /**
   * Update a question display with new question data
   * @param {HTMLElement} container - Question container element
   * @param {Object} question - New question data
   * @param {Object} options - Display options
   * @returns {HTMLElement} Updated question display element
   */
  function updateQuestionDisplay(container, question, options = {}) {
    if (!container || !question) return null;
    
    // Create new question display
    const newDisplay = createQuestionDisplay(question, options);
    
    // Replace container content
    container.innerHTML = '';
    container.appendChild(newDisplay);
    
    return container;
  }
  
  /**
   * Highlight the selected option
   * @param {HTMLElement} container - Question container element
   * @param {number} index - Selected option index
   * @param {boolean} isCorrect - Whether the selection is correct (for knowledge quizzes)
   */
  function highlightSelectedOption(container, index, isCorrect = null) {
    if (!container) return;
    
    // Get all option buttons
    const options = container.querySelectorAll('.option');
    
    // Remove any existing selection
    options.forEach(option => {
      option.classList.remove('selected', 'correct', 'incorrect');
    });
    
    // Highlight the selected option
    if (options[index]) {
      options[index].classList.add('selected');
      
      // Add correct/incorrect class if provided
      if (isCorrect !== null) {
        options[index].classList.add(isCorrect ? 'correct' : 'incorrect');
        
        // Play sound effect if audio module is available
        if (window.QuizProsAudio) {
          if (isCorrect) {
            window.QuizProsAudio.playCorrectSound();
          } else {
            window.QuizProsAudio.playWrongSound();
          }
        }
      }
    }
  }
  
  // Public API
  return {
    createQuestionDisplay: createQuestionDisplay,
    createImageQuestionDisplay: createImageQuestionDisplay,
    updateQuestionDisplay: updateQuestionDisplay,
    highlightSelectedOption: highlightSelectedOption
  };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Nothing to initialize for now
});
