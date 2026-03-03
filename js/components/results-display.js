/**
 * Results Display Component for IQuizPros
 * Provides a reusable component for displaying quiz results
 * with various result types and layouts
 */

window.QuizProsResultsDisplay = (function() {
  // Private variables
  const config = window.QuizProsConfig;
  const utils = window.QuizProsUtils;
  
  /**
   * Create a results display element
   * @param {Object} resultData - Result data
   * @param {Object} options - Display options
   * @param {string} options.type - Result type ('regular', 'personality', 'image')
   * @param {boolean} options.showAds - Whether to show ads
   * @param {boolean} options.isPremium - Whether this is a premium result
   * @returns {HTMLElement} Results display element
   */
  function createResultsDisplay(resultData, options = {}) {
    if (!resultData) {
      console.error('Result data is required');
      return null;
    }
    
    const defaultOptions = {
      type: 'regular',
      showAds: !window.QuizProsPremium || !window.QuizProsPremium.hasPremiumAccess(),
      isPremium: false
    };
    
    // Merge options with defaults
    const displayOptions = { ...defaultOptions, ...options };
    
    // Create container element
    const container = document.createElement('div');
    container.className = 'results-container';
    
    // Check if this is a special image result
    if (resultData.isImageResult || displayOptions.type === 'image') {
      return createImageResultDisplay(resultData, displayOptions);
    }
    
    // Check if this is a personality result
    if (resultData.isPersonality || displayOptions.type === 'personality') {
      return createPersonalityResultDisplay(resultData, displayOptions);
    }
    
    // Create HTML content for regular result
    let html = '';
    
    // Add top banner/ad if needed
    if (displayOptions.showAds) {
      html += `
        <!-- Top Ad Space -->
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
    
    // Add result header
    html += `
      <div class="result-header">
        <h2>Your Result</h2>
        <div class="result-badge">${resultData.emoji || '🏆'}</div>
        <h3>${resultData.title || 'Quiz Completed!'}</h3>
      </div>
    `;
    
    // Add score if available
    if (resultData.score !== undefined && resultData.totalQuestions !== undefined) {
      const percentage = Math.round((resultData.score / resultData.totalQuestions) * 100);
      
      html += `
        <div class="result-score">
          <div class="score-value">${resultData.score}/${resultData.totalQuestions}</div>
          <div class="score-percentage">${percentage}%</div>
          <div class="score-bar-container">
            <div class="score-bar" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    }
    
    // Add result message
    html += `
      <div class="result-message">
        ${resultData.message || 'Thanks for taking the quiz!'}
      </div>
    `;
    
    // Add middle ad if needed
    if (displayOptions.showAds) {
      html += `
        <!-- Middle Ad Space -->
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
    
    // Add premium features if this is a premium result
    if (displayOptions.isPremium) {
      html += createPremiumResultFeatures(resultData);
    }
    
    // Add share section
    html += `
      <div class="share-section">
        <h4>Share Your Result</h4>
        <p>Let your friends know how you did!</p>
        <div class="share-buttons">
          <button class="share-btn" id="share-result">
            <i class="fas fa-share-alt"></i> Share Result
          </button>
          <button class="share-btn secondary" id="try-again">
            <i class="fas fa-redo"></i> Try Again
          </button>
        </div>
      </div>
    `;
    
    // Add more quizzes section
    html += `
      <div class="more-quizzes">
        <h4>More Quizzes You Might Like</h4>
        <div class="related-quizzes" id="related-quizzes">
          <!-- Related quizzes will be added here -->
        </div>
      </div>
    `;
    
    // Set HTML content
    container.innerHTML = html;
    
    // Add event listeners
    setupResultEventListeners(container, resultData);
    
    // Add related quizzes
    addRelatedQuizzes(container, resultData);
    
    return container;
  }
  
  /**
   * Create a personality result display element
   * @param {Object} resultData - Result data
   * @param {Object} options - Display options
   * @returns {HTMLElement} Personality result display element
   */
  function createPersonalityResultDisplay(resultData, options) {
    // Create container element
    const container = document.createElement('div');
    container.className = 'personality-result-container';
    
    // Create HTML content
    let html = '';
    
    // Add top ad if needed
    if (options.showAds) {
      html += `
        <!-- Top Ad Space -->
        <div class="ad-container">
          <div class="ad-block personality-ad">
            <iframe src="personality-banner.html" class="banner-iframe" frameborder="0"></iframe>
          </div>
        </div>
      `;
    }
    
    // Add personality header
    html += `
      <div class="personality-header">
        <h2>${resultData.title || resultData.dominantType || 'Your Personality Type'}</h2>
        <img src="${resultData.image || 'assets/images/default-personality.webp'}" alt="${resultData.dominantType}" class="personality-image">
        <h3>${resultData.subtitle || ''}</h3>
        <div class="personality-description">
          ${resultData.description || 'Thanks for taking the personality quiz!'}
        </div>
      </div>
    `;
    
    // Add personality chart
    if (resultData.percentages) {
      html += `
        <div class="personality-chart">
          <h3>Your Personality Breakdown</h3>
          <div class="chart-container">
            <div class="personality-bars">
      `;
      
      // Add each personality type
      Object.entries(resultData.percentages).forEach(([type, percentage]) => {
        const barColor = resultData.colors?.[type] || '#25d366';
        
        html += `
          <div class="chart-row">
            <div class="type-label">${type}</div>
            <div class="bar-container">
              <div class="bar-fill" style="width: ${percentage}%; background-color: ${barColor}"></div>
              <div class="percentage">${percentage}%</div>
            </div>
          </div>
        `;
      });
      
      html += `
            </div>
          </div>
        </div>
      `;
    }
    
    // Add middle ad if needed
    if (options.showAds) {
      html += `
        <!-- Middle Ad Space -->
        <div class="ad-container">
          <div class="ad-block">
            <a href="#" class="ad-link" id="premium-ad-link">
              <div class="test-ad premium-ad">
                <div class="ad-icon">⭐</div>
                <div class="ad-content">
                  <h3>Unlock Premium Analysis</h3>
                  <p>Get detailed insights into your personality</p>
                </div>
                <button class="ad-button premium-button" id="premium-ad-button">Try Free</button>
              </div>
            </a>
          </div>
        </div>
      `;
    }
    
    // Add personality details
    if (resultData.details) {
      html += `
        <div class="personality-details">
      `;
      
      // Add each detail section
      const detailSections = [
        { key: 'strengths', title: 'Key Strengths', icon: 'fa-star' },
        { key: 'weaknesses', title: 'Potential Challenges', icon: 'fa-exclamation-circle' },
        { key: 'career', title: 'Career Paths', icon: 'fa-briefcase' }
      ];
      
      detailSections.forEach(section => {
        if (resultData.details[section.key]) {
          html += `
            <div class="details-section">
              <h4><i class="fas ${section.icon}"></i> ${section.title}</h4>
              <ul>
          `;
          
          resultData.details[section.key].forEach(item => {
            html += `<li>${item}</li>`;
          });
          
          html += `
              </ul>
            </div>
          `;
        }
      });
      
      html += `</div>`;
    }
    
    // Add premium features if available
    if (options.isPremium) {
      html += createPremiumPersonalityFeatures(resultData);
    } else if (window.QuizProsPremium && !window.QuizProsPremium.hasPremiumAccess()) {
      // Add premium upsell for non-premium users
      html += `
        <div class="premium-result-feature">
          <h4><i class="fas fa-crown"></i> Premium Analysis</h4>
          <div class="premium-feature-locked">
            <p>Unlock detailed personality analysis, compatibility insights, and personalized recommendations with QuizPros Premium.</p>
            <div class="trait-examples">
              <div class="trait-example">Communication Style</div>
              <div class="trait-example">Learning Preferences</div>
              <div class="trait-example">Relationship Compatibility</div>
            </div>
          </div>
          <div class="premium-lock-message">
            <i class="fas fa-lock"></i> Unlock with Premium
          </div>
          <button class="btn btn-primary premium-unlock-button" id="premium-unlock-button">
            <i class="fas fa-crown"></i> Upgrade to Premium
          </button>
        </div>
      `;
    }
    
    // Add share section
    html += `
      <div class="share-section">
        <button class="btn btn-primary" id="share-personality">
          <i class="fas fa-share-alt"></i> Share Result
        </button>
        <button class="btn btn-secondary" id="try-another-quiz">
          <i class="fas fa-redo"></i> Try Another Quiz
        </button>
      </div>
    `;
    
    // Set HTML content
    container.innerHTML = html;
    
    // Add event listeners
    setupPersonalityResultEventListeners(container, resultData);
    
    return container;
  }
  
  /**
   * Create an image result display element (for zodiac, spirit animal, etc.)
   * @param {Object} resultData - Result data
   * @param {Object} options - Display options
   * @returns {HTMLElement} Image result display element
   */
  function createImageResultDisplay(resultData, options) {
    // Create container element
    const container = document.createElement('div');
    container.className = 'image-result-container';
    
    // Determine the specific type of image result
    const isZodiac = resultData.quizId === 'zodiac-sign-quiz' || options.quizId === 'zodiac-sign-quiz';
    const isSpiritAnimal = resultData.quizId === 'spirit-animal-quiz' || options.quizId === 'spirit-animal-quiz';
    
    // Create HTML content based on result type
    let html = '';
    
    if (isZodiac) {
      html = createZodiacResultContent(resultData, options);
    } else if (isSpiritAnimal) {
      html = createSpiritAnimalResultContent(resultData, options);
    } else {
      // Generic image result
      html = createGenericImageResultContent(resultData, options);
    }
    
    // Set HTML content
    container.innerHTML = html;
    
    // Add event listeners
    if (isZodiac) {
      setupZodiacResultEventListeners(container, resultData);
    } else if (isSpiritAnimal) {
      setupSpiritAnimalResultEventListeners(container, resultData);
    } else {
      setupResultEventListeners(container, resultData);
    }
    
    return container;
  }
  
  /**
   * Create zodiac result content
   * @param {Object} resultData - Result data
   * @param {Object} options - Display options
   * @returns {string} HTML content
   */
  function createZodiacResultContent(resultData, options) {
    let html = `
      <div class="zodiac-result">
        <div class="zodiac-result-content">
          <div class="zodiac-header">
            <h2>Your Zodiac Sign Is</h2>
            <h1>${resultData.title || resultData.sign}</h1>
            <img src="${resultData.image || `assets/images/zodiac/${resultData.sign.toLowerCase()}-result.webp`}" 
                 alt="${resultData.sign}" class="zodiac-sign-image"
                 onerror="this.src='assets/images/zodiac/zodiac-default.webp'">
            <div class="zodiac-dates">${resultData.dates || ''}</div>
            <div class="zodiac-element">Element: ${resultData.element || ''}</div>
          </div>
          
          <div class="zodiac-description">
            <p>${resultData.description || 'Your zodiac sign reveals key aspects of your personality and potential.'}</p>
          </div>
    `;
    
    // Add middle ad if needed
    if (options.showAds) {
      html += `
        <div class="zodiac-ad-space">
          <div class="ad-container">
            <div class="ad-block">
              <a href="#" class="ad-link" id="premium-ad-link">
                <div class="test-ad premium-ad">
                  <div class="ad-icon">⭐</div>
                  <div class="ad-content">
                    <h3>Get Your Full Zodiac Reading</h3>
                    <p>Unlock premium astrological insights</p>
                  </div>
                  <button class="ad-button premium-button" id="premium-ad-button">Try Free</button>
                </div>
              </a>
            </div>
          </div>
        </div>
      `;
    }
    
    // Add traits
    if (resultData.traits) {
      html += `
        <div class="zodiac-traits">
          <h3>Key Traits</h3>
          <ul>
      `;
      
      resultData.traits.forEach(trait => {
        html += `<li>${trait}</li>`;
      });
      
      html += `
          </ul>
        </div>
      `;
    }
    
    // Add premium features if available
    if (options.isPremium) {
      html += `
        <div class="zodiac-premium-section">
          <h3>Your Detailed Astrological Profile</h3>
          <div class="zodiac-compatibility">
            <h4>Compatibility</h4>
            <p>${resultData.compatibility || 'Your sign is most compatible with...'}</p>
          </div>
          <div class="zodiac-ruling-planet">
            <h4>Ruling Planet</h4>
            <p>${resultData.rulingPlanet || 'Your ruling planet influences...'}</p>
          </div>
        </div>
      `;
    } else if (window.QuizProsPremium && !window.QuizProsPremium.hasPremiumAccess()) {
      // Add premium upsell
      html += `
        <div class="zodiac-premium-upsell">
          <h3><i class="fas fa-crown"></i> Unlock Your Complete Zodiac Profile</h3>
          <div class="premium-feature-locked">
            <ul>
              <li>Detailed Compatibility Analysis</li>
              <li>Planetary Influences</li>
              <li>Monthly Horoscope Predictions</li>
              <li>Career & Relationship Guidance</li>
            </ul>
          </div>
          <button class="btn btn-primary premium-unlock-button" id="zodiac-premium-button">
            <i class="fas fa-crown"></i> Upgrade to Premium
          </button>
        </div>
      `;
    }
    
    // Add share section
    html += `
        <button id="share-zodiac">
          <i class="fas fa-share-alt"></i> Share Your Zodiac Sign
        </button>
        
        <button class="btn btn-secondary" id="try-another-quiz">
          <i class="fas fa-redo"></i> Try Another Quiz
        </button>
      </div>
    </div>
    `;
    
    return html;
  }
  
  /**
   * Create spirit animal result content
   * @param {Object} resultData - Result data
   * @param {Object} options - Display options
   * @returns {string} HTML content
   */
  function createSpiritAnimalResultContent(resultData, options) {
    let html = `
      <div class="spirit-animal-result">
        <div class="spirit-header">
          <h2>Your Spirit Animal Is</h2>
          <div class="spirit-reveal">
            <h1>${resultData.title || resultData.animal}</h1>
            <img src="${resultData.image || `assets/images/spirit-animals/${resultData.animal.toLowerCase()}-result.webp`}" 
                 alt="${resultData.animal}" class="spirit-image"
                 onerror="this.src='assets/images/default-personality.webp'">
            <div class="spirit-quote">"${resultData.quote || 'The spirit of the ' + resultData.animal + ' guides your path.'}"</div>
          </div>
          
          <div class="spirit-description">
            <p>${resultData.description || 'Your spirit animal reflects aspects of your inner self and life journey.'}</p>
          </div>
        </div>
    `;
    
    // Add middle ad if needed
    if (options.showAds) {
      html += `
        <div class="ad-container">
          <div class="ad-block">
            <a href="#" class="ad-link" id="premium-ad-link">
              <div class="test-ad premium-ad">
                <div class="ad-icon">⭐</div>
                <div class="ad-content">
                  <h3>Discover Your Full Spirit Guide</h3>
                  <p>Unlock premium spiritual insights</p>
                </div>
                <button class="ad-button premium-button" id="premium-ad-button">Try Free</button>
              </div>
            </a>
          </div>
        </div>
      `;
    }
    
    // Add traits
    if (resultData.traits) {
      html += `
        <div class="spirit-traits">
          <h3>Key Traits</h3>
          <ul>
      `;
      
      resultData.traits.forEach(trait => {
        html += `<li>${trait}</li>`;
      });
      
      html += `
          </ul>
        </div>
      `;
    }
    
    // Add guidance
    html += `
      <div class="spirit-guidance">
        <h3>Spiritual Guidance</h3>
        <p>${resultData.guidance || 'Your spirit animal offers these insights for your journey...'}</p>
      </div>
    `;
    
    // Add premium features if available
    if (options.isPremium) {
      html += `
        <div class="spirit-premium-section">
          <h3>Your Detailed Spirit Guide</h3>
          <div class="spirit-elements">
            <h4>Elemental Connection</h4>
            <p>${resultData.element || 'Your spirit animal connects with the element of...'}</p>
          </div>
          <div class="spirit-lessons">
            <h4>Life Lessons</h4>
            <p>${resultData.lessons || 'The key lessons your spirit animal brings to your life...'}</p>
          </div>
        </div>
      `;
    } else if (window.QuizProsPremium && !window.QuizProsPremium.hasPremiumAccess()) {
      // Add premium upsell
      html += `
        <div class="spirit-premium-upsell">
          <h3><i class="fas fa-crown"></i> Unlock Your Complete Spirit Guide</h3>
          <div class="premium-feature-locked">
            <ul>
              <li>Detailed Spiritual Analysis</li>
              <li>Elemental Connections</li>
              <li>Meditation Guidance</li>
              <li>Personal Growth Insights</li>
            </ul>
          </div>
          <button class="btn btn-primary premium-unlock-button" id="spirit-premium-button">
            <i class="fas fa-crown"></i> Upgrade to Premium
          </button>
        </div>
      `;
    }
    
    // Add share section
    html += `
        <div class="share-section">
          <button class="btn btn-primary" id="share-spirit">
            <i class="fas fa-share-alt"></i> Share Your Spirit Animal
          </button>
          
          <button class="btn btn-secondary" id="try-another-quiz">
            <i class="fas fa-redo"></i> Try Another Quiz
          </button>
        </div>
      </div>
    `;
    
    return html;
  }
  
  /**
   * Create generic image result content
   * @param {Object} resultData - Result data
   * @param {Object} options - Display options
   * @returns {string} HTML content
   */
  function createGenericImageResultContent(resultData, options) {
    let html = `
      <div class="image-result">
        <div class="image-result-header">
          <h2>Your Result</h2>
          <h1>${resultData.title || 'Quiz Completed!'}</h1>
          <img src="${resultData.image || 'assets/images/default-personality.webp'}" 
               alt="${resultData.title}" class="result-image">
          <div class="result-subtitle">${resultData.subtitle || ''}</div>
        </div>
        
        <div class="result-description">
          <p>${resultData.description || 'Thanks for taking the quiz!'}</p>
        </div>
    `;
    
    // Add middle ad if needed
    if (options.showAds) {
      html += `
        <div class="ad-container">
          <div class="ad-block">
            <a href="#" class="ad-link" id="premium-ad-link">
              <div class="test-ad premium-ad">
                <div class="ad-icon">⭐</div>
                <div class="ad-content">
                  <h3>Unlock Premium Results</h3>
                  <p>Get detailed insights and analysis</p>
                </div>
                <button class="ad-button premium-button" id="premium-ad-button">Try Free</button>
              </div>
            </a>
          </div>
        </div>
      `;
    }
    
    // Add details if available
    if (resultData.details) {
      html += `
        <div class="result-details">
          <h3>What This Means For You</h3>
          <p>${resultData.details}</p>
        </div>
      `;
    }
    
    // Add premium features if available
    if (options.isPremium) {
      html += createPremiumResultFeatures(resultData);
    }
    
    // Add share section
    html += `
        <div class="share-section">
          <button class="btn btn-primary" id="share-result">
            <i class="fas fa-share-alt"></i> Share Result
          </button>
          
          <button class="btn btn-secondary" id="try-again">
            <i class="fas fa-redo"></i> Try Again
          </button>
        </div>
      </div>
    `;
    
    return html;
  }
  
  /**
   * Create premium result features
   * @param {Object} resultData - Result data
   * @returns {string} HTML content
   */
  function createPremiumResultFeatures(resultData) {
    let html = `
      <div class="premium-result-features">
        <div class="premium-result-feature">
          <h4><i class="fas fa-chart-bar"></i> Detailed Analysis</h4>
          <div class="detailed-analysis">
    `;
    
    // Add performance analysis if available
    if (resultData.performance) {
      html += `
        <div class="analysis-section">
          <h5>Performance Breakdown</h5>
          <div class="performance-chart">
      `;
      
      // Add each category
      Object.entries(resultData.performance).forEach(([category, percentage]) => {
        html += `
          <div class="performance-category">
            <div class="category-label">${category}</div>
            <div class="performance-bar-container">
              <div class="performance-bar">
                <div class="performance-fill" style="width: ${percentage}%"></div>
              </div>
            </div>
            <div class="category-percentage">${percentage}%</div>
          </div>
        `;
      });
      
      html += `
          </div>
        </div>
      `;
    }
    
    // Add insights if available
    if (resultData.insights) {
      html += `
        <div class="analysis-section">
          <h5>Key Insights</h5>
          <ul class="insights-list">
      `;
      
      resultData.insights.forEach(insight => {
        html += `<li>${insight}</li>`;
      });
      
      html += `
          </ul>
        </div>
      `;
    }
    
    // Add recommendations if available
    if (resultData.recommendations) {
      html += `
        <div class="analysis-section">
          <h5>Recommendations</h5>
          <ul class="recommendations-list">
      `;
      
      resultData.recommendations.forEach(recommendation => {
        html += `<li>${recommendation}</li>`;
      });
      
      html += `
          </ul>
        </div>
      `;
    }
    
    html += `
          </div>
        </div>
        
        <div class="premium-result-feature">
          <h4><i class="fas fa-download"></i> Save & Export</h4>
          <p>Your premium results have been saved to your account. You can also download them in various formats.</p>
          <div class="export-buttons">
            <button class="btn btn-sm btn-outline" id="export-pdf">
              <i class="fas fa-file-pdf"></i> PDF
            </button>
            <button class="btn btn-sm btn-outline" id="export-image">
              <i class="fas fa-image"></i> Image
            </button>
            <button class="btn btn-sm btn-outline" id="export-text">
              <i class="fas fa-file-alt"></i> Text
            </button>
          </div>
        </div>
      </div>
    `;
    
    return html;
  }
  
  /**
   * Create premium personality features
   * @param {Object} resultData - Result data
   * @returns {string} HTML content
   */
  function createPremiumPersonalityFeatures(resultData) {
    let html = `
      <div class="personality-secondary">
        <h3>Premium Personality Insights</h3>
        <div class="secondary-traits">
    `;
    
    // Add communication style if available
    if (resultData.premium?.communication) {
      html += `
        <div class="secondary-trait">
          <h4><i class="fas fa-comments"></i> Communication Style</h4>
          <p>${resultData.premium.communication}</p>
        </div>
      `;
    }
    
    // Add learning style if available
    if (resultData.premium?.learning) {
      html += `
        <div class="secondary-trait">
          <h4><i class="fas fa-book"></i> Learning Style</h4>
          <p>${resultData.premium.learning}</p>
        </div>
      `;
    }
    
    // Add relationship style if available
    if (resultData.premium?.relationships) {
      html += `
        <div class="secondary-trait">
          <h4><i class="fas fa-heart"></i> Relationship Approach</h4>
          <p>${resultData.premium.relationships}</p>
        </div>
      `;
    }
    
    // Add stress response if available
    if (resultData.premium?.stress) {
      html += `
        <div class="secondary-trait">
          <h4><i class="fas fa-bolt"></i> Stress Response</h4>
          <p>${resultData.premium.stress}</p>
        </div>
      `;
    }
    
    // Add growth areas if available
    if (resultData.premium?.growth) {
      html += `
        <div class="secondary-trait">
          <h4><i class="fas fa-seedling"></i> Growth Opportunities</h4>
          <p>${resultData.premium.growth}</p>
        </div>
      `;
    }
    
    html += `
        </div>
        
        <div class="premium-export">
          <h4><i class="fas fa-download"></i> Save & Export</h4>
          <p>Your premium personality profile has been saved to your account. You can also download it in various formats.</p>
          <div class="export-buttons">
            <button class="btn btn-sm btn-outline" id="export-pdf">
              <i class="fas fa-file-pdf"></i> PDF
            </button>
            <button class="btn btn-sm btn-outline" id="export-image">
              <i class="fas fa-image"></i> Image
            </button>
            <button class="btn btn-sm btn-outline" id="export-text">
              <i class="fas fa-file-alt"></i> Text
            </button>
          </div>
        </div>
      </div>
    `;
    
    return html;
  }
  
  /**
   * Set up event listeners for result display
   * @param {HTMLElement} container - Result container element
   * @param {Object} resultData - Result data
   */
  function setupResultEventListeners(container, resultData) {
    if (!container) return;
    
    // Share result button
    const shareButton = container.querySelector('#share-result');
    if (shareButton) {
      shareButton.addEventListener('click', function() {
        shareResult(resultData);
      });
    }
    
    // Try again button
    const tryAgainButton = container.querySelector('#try-again');
    if (tryAgainButton) {
      tryAgainButton.addEventListener('click', function() {
        if (window.QuizProsEngine && window.QuizProsEngine.restartQuiz) {
          window.QuizProsEngine.restartQuiz();
        }
      });
    }
    
    // Premium ad button
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
    
    // Export buttons
    const exportButtons = container.querySelectorAll('[id^="export-"]');
    exportButtons.forEach(button => {
      button.addEventListener('click', function() {
        const format = this.id.replace('export-', '');
        exportResult(resultData, format);
      });
    });
  }
  
  /**
   * Set up event listeners for personality result display
   * @param {HTMLElement} container - Result container element
   * @param {Object} resultData - Result data
   */
  function setupPersonalityResultEventListeners(container, resultData) {
    if (!container) return;
    
    // Share result button
    const shareButton = container.querySelector('#share-personality');
    if (shareButton) {
      shareButton.addEventListener('click', function() {
        shareResult(resultData);
      });
    }
    
    // Try another quiz button
    const tryAnotherButton = container.querySelector('#try-another-quiz');
    if (tryAnotherButton) {
      tryAnotherButton.addEventListener('click', function() {
        if (window.QuizProsEngine && window.QuizProsEngine.resetAndReturn) {
          window.QuizProsEngine.resetAndReturn();
        }
      });
    }
    
    // Premium unlock button
    const premiumUnlockButton = container.querySelector('#premium-unlock-button');
    if (premiumUnlockButton) {
      premiumUnlockButton.addEventListener('click', function() {
        if (window.QuizProsPremium) {
          window.QuizProsPremium.showPremiumSignup('basic');
        }
      });
    }
    
    // Export buttons
    const exportButtons = container.querySelectorAll('[id^="export-"]');
    exportButtons.forEach(button => {
      button.addEventListener('click', function() {
        const format = this.id.replace('export-', '');
        exportResult(resultData, format);
      });
    });
  }
  
  /**
   * Set up event listeners for zodiac result display
   * @param {HTMLElement} container - Result container element
   * @param {Object} resultData - Result data
   */
  function setupZodiacResultEventListeners(container, resultData) {
    if (!container) return;
    
    // Share result button
    const shareButton = container.querySelector('#share-zodiac');
    if (shareButton) {
      shareButton.addEventListener('click', function() {
        shareResult(resultData);
      });
    }
    
    // Try another quiz button
    const tryAnotherButton = container.querySelector('#try-another-quiz');
    if (tryAnotherButton) {
      tryAnotherButton.addEventListener('click', function() {
        if (window.QuizProsEngine && window.QuizProsEngine.resetAndReturn) {
          window.QuizProsEngine.resetAndReturn();
        }
      });
    }
    
    // Premium button
    const premiumButton = container.querySelector('#zodiac-premium-button');
    if (premiumButton) {
      premiumButton.addEventListener('click', function() {
        if (window.QuizProsPremium) {
          window.QuizProsPremium.showPremiumSignup('basic');
        }
      });
    }
  }
  
  /**
   * Set up event listeners for spirit animal result display
   * @param {HTMLElement} container - Result container element
   * @param {Object} resultData - Result data
   */
  function setupSpiritAnimalResultEventListeners(container, resultData) {
    if (!container) return;
    
    // Share result button
    const shareButton = container.querySelector('#share-spirit');
    if (shareButton) {
      shareButton.addEventListener('click', function() {
        shareResult(resultData);
      });
    }
    
    // Try another quiz button
    const tryAnotherButton = container.querySelector('#try-another-quiz');
    if (tryAnotherButton) {
      tryAnotherButton.addEventListener('click', function() {
        if (window.QuizProsEngine && window.QuizProsEngine.resetAndReturn) {
          window.QuizProsEngine.resetAndReturn();
        }
      });
    }
    
    // Premium button
    const premiumButton = container.querySelector('#spirit-premium-button');
    if (premiumButton) {
      premiumButton.addEventListener('click', function() {
        if (window.QuizProsPremium) {
          window.QuizProsPremium.showPremiumSignup('basic');
        }
      });
    }
  }
  
  /**
   * Add related quizzes to the result display
   * @param {HTMLElement} container - Result container element
   * @param {Object} resultData - Result data
   */
  function addRelatedQuizzes(container, resultData) {
    if (!container || !window.QuizProsEngine) return;
    
    const relatedQuizzesContainer = container.querySelector('#related-quizzes');
    if (!relatedQuizzesContainer) return;
    
    // Get related quizzes
    const relatedQuizzes = window.QuizProsEngine.getRelatedQuizzes(resultData.quizId, 3);
    
    if (relatedQuizzes && relatedQuizzes.length > 0) {
      // Create grid for related quizzes
      if (window.QuizProsQuizCard) {
        const grid = window.QuizProsQuizCard.createQuizGrid(relatedQuizzes, {
          gridClass: 'related-quizzes-grid',
          onQuizClick: (quiz) => {
            if (window.QuizProsEngine && window.QuizProsEngine.startQuiz) {
              window.QuizProsEngine.startQuiz(quiz.id);
            }
          }
        });
        
        if (grid) {
          relatedQuizzesContainer.appendChild(grid);
        }
      }
    } else {
      // No related quizzes found
      relatedQuizzesContainer.innerHTML = '<p>No related quizzes found.</p>';
    }
  }
  
  /**
   * Share a result
   * @param {Object} resultData - Result data
   */
  function shareResult(resultData) {
    // Check if Web Share API is available
    if (navigator.share) {
      // Create share data
      const shareData = {
        title: `My ${resultData.quizName || 'Quiz'} Result`,
        text: getShareText(resultData),
        url: window.location.href
      };
      
      // Share result
      navigator.share(shareData)
        .then(() => {
          console.log('Result shared successfully');
          
          // Track share event
          if (window.QuizProsAnalytics) {
            window.QuizProsAnalytics.trackShare(
              'Web Share API',
              resultData.quizId,
              resultData.title || resultData.dominantType || resultData.sign || resultData.animal
            );
          }
        })
        .catch(error => {
          console.error('Error sharing result:', error);
          
          // Fallback to copy link
          copyShareLink(resultData);
        });
    } else {
      // Fallback to copy link
      copyShareLink(resultData);
    }
  }
  
  /**
   * Get share text for a result
   * @param {Object} resultData - Result data
   * @returns {string} Share text
   */
  function getShareText(resultData) {
    let text = '';
    
    if (resultData.isPersonality || resultData.dominantType) {
      text = `I took the ${resultData.quizName || 'Personality'} Quiz and got: ${resultData.dominantType}! `;
    } else if (resultData.quizId === 'zodiac-sign-quiz' || resultData.sign) {
      text = `I discovered my true zodiac sign is ${resultData.sign}! `;
    } else if (resultData.quizId === 'spirit-animal-quiz' || resultData.animal) {
      text = `I discovered my spirit animal is the ${resultData.animal}! `;
    } else if (resultData.score !== undefined && resultData.totalQuestions !== undefined) {
      const percentage = Math.round((resultData.score / resultData.totalQuestions) * 100);
      text = `I scored ${resultData.score}/${resultData.totalQuestions} (${percentage}%) on the ${resultData.quizName || 'Quiz'}! `;
    } else {
      text = `I got ${resultData.title || 'a result'} on the ${resultData.quizName || 'Quiz'}! `;
    }
    
    text += 'Take the quiz yourself at IQuizPros.com';
    
    return text;
  }
  
  /**
   * Copy share link to clipboard
   * @param {Object} resultData - Result data
   */
  function copyShareLink(resultData) {
    // Create share text
    const shareText = getShareText(resultData);
    
    // Try to copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText)
        .then(() => {
          alert('Share text copied to clipboard!');
          
          // Track share event
          if (window.QuizProsAnalytics) {
            window.QuizProsAnalytics.trackShare(
              'Clipboard',
              resultData.quizId,
              resultData.title || resultData.dominantType || resultData.sign || resultData.animal
            );
          }
        })
        .catch(error => {
          console.error('Error copying to clipboard:', error);
          alert('Could not copy to clipboard. Please copy the link manually.');
        });
    } else {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          alert('Share text copied to clipboard!');
          
          // Track share event
          if (window.QuizProsAnalytics) {
            window.QuizProsAnalytics.trackShare(
              'Clipboard',
              resultData.quizId,
              resultData.title || resultData.dominantType || resultData.sign || resultData.animal
            );
          }
        } else {
          alert('Could not copy to clipboard. Please copy the link manually.');
        }
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        alert('Could not copy to clipboard. Please copy the link manually.');
      }
      
      document.body.removeChild(textArea);
    }
  }
  
  /**
   * Export a result
   * @param {Object} resultData - Result data
   * @param {string} format - Export format ('pdf', 'image', 'text')
   */
  function exportResult(resultData, format) {
    // Check if user has premium access
    if (window.QuizProsPremium && !window.QuizProsPremium.hasPremiumAccess()) {
      // Show premium signup
      window.QuizProsPremium.showPremiumSignup('basic');
      return;
    }
    
    // Show export message
    alert(`Exporting result as ${format.toUpperCase()}... This feature is coming soon!`);
    
    // Track export event
    if (window.QuizProsAnalytics) {
      window.QuizProsAnalytics.trackEvent(
        'Premium',
        'ExportResult',
        `${format} - ${resultData.quizId}`
      );
    }
  }
  
  // Public API
  return {
    createResultsDisplay: createResultsDisplay,
    createPersonalityResultDisplay: createPersonalityResultDisplay,
    createImageResultDisplay: createImageResultDisplay,
    shareResult: shareResult,
    exportResult: exportResult
  };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Nothing to initialize for now
});
