/**
 * Quiz Card Component for IQuizPros
 * Provides a reusable component for displaying quiz cards in the topic selection
 * and category screens
 */

window.QuizProsQuizCard = (function() {
  // Private variables
  const config = window.QuizProsConfig;
  const utils = window.QuizProsUtils;
  
  /**
   * Create a quiz card element
   * @param {Object} quizData - Quiz data
   * @param {Object} options - Display options
   * @param {string} options.type - Card type ('regular', 'personality', 'premium')
   * @param {Function} options.onClick - Callback when card is clicked
   * @returns {HTMLElement} Quiz card element
   */
  function createQuizCard(quizData, options = {}) {
    if (!quizData) {
      console.error('Quiz data is required');
      return null;
    }
    
    const defaultOptions = {
      type: 'regular',
      onClick: null
    };
    
    // Merge options with defaults
    const cardOptions = { ...defaultOptions, ...options };
    
    // Create card element
    const card = document.createElement('div');
    card.className = 'topic-card';
    
    // Add type-specific class
    if (cardOptions.type === 'personality') {
      card.classList.add('personality-topic-card');
    } else if (cardOptions.type === 'premium') {
      card.classList.add('premium-topic-card');
    }
    
    // Add category-specific class if available
    if (quizData.category) {
      card.classList.add(`${quizData.category}-card`);
    }
    
    // Create card content
    let html = `
      <div class="topic-icon"><i class="${quizData.icon || 'fas fa-question-circle'}"></i></div>
      <h3>${quizData.name || quizData.title || 'Quiz'}</h3>
    `;
    
    // Add description if available
    if (quizData.description) {
      html += `<p class="topic-description">${quizData.description}</p>`;
    }
    
    // Add premium tag if needed - Changed to show "FREE ACCESS" instead of premium lock
    if (quizData.isPremium || cardOptions.type === 'premium') {
      // Show "FREE ACCESS" badge instead of premium lock
      html += `<div class="free-access-tag" style="background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; display: inline-block; margin-top: 8px;">FREE ACCESS</div>`;
    }
    
    // Set card content
    card.innerHTML = html;
    
    // Add click event listener
    card.addEventListener('click', function() {
      // FREE ACCESS: All quizzes (including premium) are now free for everyone
      // No premium access check required

      /* DISABLED: Premium access check - all quizzes are now free
      if (quizData.isPremium && window.QuizProsPremium && !window.QuizProsPremium.hasPremiumAccess()) {
        window.QuizProsPremium.showPremiumSignup(quizData.premiumTier || 'basic');
        if (window.QuizProsAnalytics) {
          window.QuizProsAnalytics.trackEvent('Premium', 'AccessDenied', quizData.id);
        }
        return;
      }
      */

      // Call onClick callback if provided
      if (typeof cardOptions.onClick === 'function') {
        cardOptions.onClick(quizData);
      } else if (window.QuizProsEngine && window.QuizProsEngine.startQuiz) {
        // Default behavior: start quiz
        window.QuizProsEngine.startQuiz(quizData.id);
      }
    });
    
    return card;
  }
  
  /**
   * Create a category card element
   * @param {Object} categoryData - Category data
   * @param {Function} onClick - Callback when card is clicked
   * @returns {HTMLElement} Category card element
   */
  function createCategoryCard(categoryData, onClick) {
    if (!categoryData) {
      console.error('Category data is required');
      return null;
    }
    
    // Create card element
    const card = document.createElement('div');
    card.className = 'category-card';
    
    // Add border color if available
    if (categoryData.color) {
      card.style.borderLeft = `4px solid ${categoryData.color}`;
    }
    
    // Create card content
    let html = `
      <div class="category-icon" ${categoryData.color ? `style="color: ${categoryData.color}"` : ''}>
        <i class="${categoryData.icon || 'fas fa-folder'}"></i>
      </div>
      <h3>${categoryData.name}</h3>
      <p>${categoryData.description || 'Explore quizzes in this category'}</p>
    `;
    
    // Set card content
    card.innerHTML = html;
    
    // Add click event listener
    card.addEventListener('click', function() {
      if (typeof onClick === 'function') {
        onClick(categoryData);
      }
    });
    
    return card;
  }
  
  /**
   * Create a premium feature card
   * @param {Object} featureData - Feature data
   * @param {Function} onClick - Callback when card is clicked
   * @param {boolean} isLocked - Whether the feature is locked
   * @returns {HTMLElement} Feature card element
   */
  function createFeatureCard(featureData, onClick, isLocked = false) {
    if (!featureData) {
      console.error('Feature data is required');
      return null;
    }
    
    // Create card element
    const card = document.createElement('div');
    card.className = 'feature-card';
    
    // Create card content
    let html = `
      <div class="feature-icon">
        <i class="${featureData.icon || 'fas fa-star'}"></i>
      </div>
      <h3>${featureData.title}</h3>
      <p>${featureData.description}</p>
    `;
    
    // Add premium badge if needed
    if (featureData.tier === 'plus') {
      html += `<span class="plus-badge">Plus</span>`;
    }
    
    // Add button if provided
    if (featureData.buttonText) {
      html += `<button class="btn btn-sm btn-outline feature-button">${featureData.buttonText}</button>`;
    }
    
    // Set card content
    card.innerHTML = html;
    
    // Add click event listener to button
    const button = card.querySelector('.feature-button');
    if (button) {
      button.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent card click
        
        if (typeof onClick === 'function') {
          onClick(featureData);
        }
      });
    }
    
    // Add click event listener to card
    card.addEventListener('click', function() {
      if (typeof onClick === 'function' && !button) {
        onClick(featureData);
      }
    });
    
    // Lock the card if needed
    if (isLocked && window.QuizProsPremiumBadge) {
      window.QuizProsPremiumBadge.lockElement(
        card, 
        `Unlock with Premium ${featureData.tier === 'plus' ? 'Plus' : 'Basic'}`,
        featureData.tier || 'basic'
      );
    }
    
    return card;
  }
  
  /**
   * Create a grid of quiz cards
   * @param {Array} quizzes - Array of quiz data
   * @param {Object} options - Display options
   * @returns {HTMLElement} Grid element containing quiz cards
   */
  function createQuizGrid(quizzes, options = {}) {
    if (!Array.isArray(quizzes)) {
      console.error('Quizzes must be an array');
      return null;
    }
    
    // Create grid element
    const grid = document.createElement('div');
    grid.className = options.gridClass || 'topics-grid';
    
    // Create cards for each quiz
    quizzes.forEach(quiz => {
      const card = createQuizCard(quiz, {
        type: quiz.isPersonality ? 'personality' : (quiz.isPremium ? 'premium' : 'regular'),
        onClick: options.onQuizClick
      });
      
      if (card) {
        grid.appendChild(card);
      }
    });
    
    return grid;
  }
  
  /**
   * Create a grid of category cards
   * @param {Array} categories - Array of category data
   * @param {Function} onClick - Callback when a category is clicked
   * @returns {HTMLElement} Grid element containing category cards
   */
  function createCategoryGrid(categories, onClick) {
    if (!Array.isArray(categories)) {
      console.error('Categories must be an array');
      return null;
    }
    
    // Create grid element
    const grid = document.createElement('div');
    grid.className = 'categories-grid';
    
    // Create cards for each category
    categories.forEach(category => {
      const card = createCategoryCard(category, onClick);
      
      if (card) {
        grid.appendChild(card);
      }
    });
    
    return grid;
  }
  
  // Public API
  return {
    createQuizCard: createQuizCard,
    createCategoryCard: createCategoryCard,
    createFeatureCard: createFeatureCard,
    createQuizGrid: createQuizGrid,
    createCategoryGrid: createCategoryGrid
  };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Nothing to initialize for now
});
