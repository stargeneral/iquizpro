/**
 * Topics Module for IQuizPros
 * Manages quiz topics, categories, and quiz data.
 * Static question/personality data lives in question-bank.js (window.QuizProsQuestionBank).
 */

window.QuizProsTopics = (function() {
  const utils = window.QuizProsUtils;

  // Mutable runtime state
  let topics = [];
  let personalityTypes = {};
  let quizTemplates = {};

  // Quiz categories (UI metadata only — not question data)
  const quizCategories = {
    "self-discovery": {
      name: "Self-Discovery & Identity",
      description: "Discover more about your personal identity and traits",
      icon: "fas fa-user-check",
      color: "#9b59b6"
    },
    "professional": {
      name: "Professional & Leadership",
      description: "Explore your work style and leadership tendencies",
      icon: "fas fa-briefcase",
      color: "#3498db"
    },
    "relationships": {
      name: "Relationships & Communication",
      description: "Understand how you connect with others",
      icon: "fas fa-heart",
      color: "#e74c3c"
    },
    "learning": {
      name: "Learning & Creativity",
      description: "Explore your creative process and learning style",
      icon: "fas fa-lightbulb",
      color: "#2ecc71"
    },
    "lifestyle": {
      name: "Lifestyle & Preferences",
      description: "Discover your preferences in daily life",
      icon: "fas fa-map-marker-alt",
      color: "#f39c12"
    },
    "image-quizzes": {
      name: "Visual Personality Tests",
      description: "Discover yourself through visual choices and images",
      icon: "fas fa-images",
      color: "#3d85c6"
    }
  };

  /**
   * Initialize the topics module.
   * Loads default data from QuizProsQuestionBank.
   */
  function initialize() {
    utils.logger.info('Initializing topics module');

    const bank = window.QuizProsQuestionBank;
    if (!bank) {
      utils.logger.error('QuizProsQuestionBank not loaded — topics cannot initialize');
      return;
    }

    topics = bank.getDefaultTopics();
    personalityTypes = bank.getDefaultPersonalityTypes();

    utils.logger.debug('Topics initialized with ' + topics.length + ' topics');
  }

  /**
   * Get all quiz topics
   * @returns {Array}
   */
  function getTopics() {
    return topics;
  }

  /**
   * Get personality types
   * @returns {Object}
   */
  function getPersonalityTypes() {
    return personalityTypes;
  }

  /**
   * Get quiz categories
   * @returns {Object}
   */
  function getQuizCategories() {
    return quizCategories;
  }

  /**
   * Get questions for a specific topic
   * @param {string} topicId
   * @returns {Array}
   */
  function getQuestions(topicId) {
    utils.logger.debug('Loading questions for topic: ' + topicId);
    const bank = window.QuizProsQuestionBank;
    if (!bank) {
      utils.logger.error('QuizProsQuestionBank not available');
      return [];
    }
    return bank.getQuestions(topicId);
  }

  /**
   * Get personality quiz questions
   * @param {string} [topicId]
   * @returns {Array}
   */
  function getPersonalityQuestions(topicId) {
    const bank = window.QuizProsQuestionBank;
    if (!bank) {
      utils.logger.error('QuizProsQuestionBank not available');
      return [];
    }
    return bank.getPersonalityQuestions();
  }

  /**
   * Get a registered personality quiz template
   * @param {string} quizId
   * @returns {Object|null}
   */
  function getPersonalityQuizTemplate(quizId) {
    return quizTemplates[quizId] || null;
  }

  /**
   * Register a quiz template (adds to runtime topics list)
   * @param {Object} template
   * @param {string} category
   * @param {boolean} isPremium
   */
  function registerQuizTemplate(template, category, isPremium) {
    if (isPremium === undefined) isPremium = false;

    if (!template || !template.id) {
      utils.logger.error('Invalid quiz template:', template);
      return;
    }

    quizTemplates[template.id] = template;

    const existingTopic = topics.find(function(t) { return t.id === template.id; });
    if (!existingTopic) {
      topics.push({
        id: template.id,
        name: template.name,
        description: template.description || '',
        icon: template.icon || 'fas fa-question',
        isPersonality: true,
        category: category,
        isPremium: isPremium
      });
      utils.logger.debug('Registered new quiz template: ' + template.name);
      console.log('Registered new quiz template: ' + template.name + ' in category ' + category);
    } else {
      existingTopic.name = template.name;
      existingTopic.description = template.description || existingTopic.description;
      existingTopic.icon = template.icon || existingTopic.icon;
      existingTopic.isPersonality = true;
      existingTopic.category = category;
      existingTopic.isPremium = isPremium;
      utils.logger.debug('Updated existing quiz template: ' + template.name);
      console.log('Updated existing quiz template: ' + template.name + ' in category ' + category);
    }
  }

  // Public API — unchanged from original
  return {
    initialize: initialize,
    getTopics: getTopics,
    getPersonalityTypes: getPersonalityTypes,
    getQuizCategories: getQuizCategories,
    getQuestions: getQuestions,
    getPersonalityQuestions: getPersonalityQuestions,
    getPersonalityQuizTemplate: getPersonalityQuizTemplate,
    registerQuizTemplate: registerQuizTemplate
  };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  QuizProsTopics.initialize();
});
