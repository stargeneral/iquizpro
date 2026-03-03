/**
 * Quiz Renderer — Pure HTML-generation utilities for IQuizPros.
 * No DOM writes, no state — returns HTML strings.
 * Also owns the createFallbackTemplate helper (previously window.createFallbackTemplate).
 * Exposes window.QuizProsRenderer
 */

window.QuizProsRenderer = (function () {
  'use strict';

  /**
   * Build HTML for a standard text-options question.
   * @param {Object} question       Question object with .question and .options[].
   * @param {number} questionIndex  Zero-based current question index.
   * @param {number} total          Total number of questions in the quiz.
   * @returns {string} HTML string.
   */
  function renderQuestion(question, questionIndex, total) {
    var html = '<div class="question-number">Question ' + (questionIndex + 1) + ' of ' + total + '</div>'
      + '<div class="question-banner" aria-live="polite"><p>' + question.question + '</p></div>'
      + '<div class="options" role="radiogroup" aria-label="Answer options">';

    question.options.forEach(function (option, index) {
      html += '<button class="option" role="radio" aria-checked="false" onclick="QuizProsEngine.selectAnswer(' + index + ')">' + option + '</button>';
    });

    html += '</div>';
    return html;
  }

  /**
   * Build HTML for an image-selection (zodiac/spirit-animal) question.
   * Falls back to text buttons when the question has no image options.
   * @param {Object} question       Question object.
   * @param {number} questionIndex  Zero-based current question index.
   * @param {number} total          Total number of questions.
   * @returns {string} HTML string.
   */
  function renderZodiacQuestion(question, questionIndex, total) {
    var html = '<div class="question-number">Question ' + (questionIndex + 1) + ' of ' + total + '</div>'
      + '<div class="question-banner" aria-live="polite"><p>' + question.question + '</p></div>';

    var isImageSelection = question.isImageSelection || question.imageOptions
      || (question.options && question.options[0] && question.options[0].image);

    if (isImageSelection) {
      html += '<div class="image-selection-grid">';
      var imageOptions = question.imageOptions || question.options;
      imageOptions.forEach(function (option, index) {
        var imageUrl = option.image || option.imageUrl || option;
        var caption  = option.text || option.caption || option.label || '';
        html += '<div class="image-option" onclick="QuizProsEngine.selectAnswer(' + index + ')">'
          + '<img src="' + imageUrl + '" alt="' + (caption || 'Option ' + (index + 1)) + '" '
          + 'onerror="this.src=\'assets/images/default-personality.webp\'">'
          + '<div class="image-number">' + (index + 1) + '</div>'
          + (caption ? '<div class="image-caption">' + caption + '</div>' : '')
          + '</div>';
      });
      html += '</div>';
    } else {
      html += '<div class="options" role="radiogroup" aria-label="Answer options">';
      question.options.forEach(function (option, index) {
        var optionText = typeof option === 'string' ? option
          : (option.text || option.label || 'Option ' + (index + 1));
        html += '<button class="option" role="radio" aria-checked="false" onclick="QuizProsEngine.selectAnswer(' + index + ')">' + optionText + '</button>';
      });
      html += '</div>';
    }

    return html;
  }

  /**
   * Build HTML for a personality quiz result.
   * @param {Object} personalityType  Personality type object with title, description, etc.
   * @returns {string} HTML string.
   */
  function renderPersonalityResult(personalityType) {
    var traitsHTML = '';
    if (personalityType.characteristics && personalityType.characteristics.length > 0) {
      personalityType.characteristics.forEach(function (trait) {
        traitsHTML += '<li>' + trait + '</li>';
      });
    }

    return '<div class="personality-result">'
      + '<h2>' + personalityType.title + '</h2>'
      + '<div class="personality-image-container">'
      + '<img src="' + (personalityType.imagePath || 'assets/images/default-personality.webp') + '" '
      + 'alt="' + personalityType.title + '" class="personality-image" '
      + 'onerror="this.onerror=null;this.src=\'assets/images/default-personality.webp\';">'
      + '</div>'
      + '<p class="personality-description">' + personalityType.description + '</p>'
      + '<div class="personality-traits"><h3>Key Characteristics</h3><ul>' + traitsHTML + '</ul></div>'
      + '<div class="personality-strengths-challenges">'
      + '<div class="strengths"><h3>Your Strengths</h3><p>' + personalityType.strengths + '</p></div>'
      + '<div class="challenges"><h3>Growth Opportunities</h3><p>' + personalityType.challenges + '</p></div>'
      + '</div>'
      + '</div>';
  }

  /**
   * Build HTML for a regular score result.
   * @param {number} score  Number of correct answers.
   * @param {number} total  Total number of questions.
   * @returns {string} HTML string.
   */
  function renderScoreResult(score, total) {
    var percentage = Math.round((score / total) * 100);
    var scoring = window.QuizProsScoring
      ? window.QuizProsScoring.getScoreMessage(score, total)
      : { message: 'Quiz complete!', emoji: '🏆', shouldCelebrate: false };

    return '<div class="score-result">'
      + '<h3>' + scoring.message + '</h3>'
      + '<div class="score-percentage">' + percentage + '%</div>'
      + '<p>You answered ' + score + ' out of ' + total + ' questions correctly.</p>'
      + '</div>';
  }

  /**
   * Create and register a fallback template for zodiac or spirit-animal quizzes.
   * Called when the real JSON template fails to load.
   * Registers the template via QuizProsTopics.registerQuizTemplate().
   * @param {string} quizType  e.g. "zodiac-sign-quiz" | "spirit-animal-quiz"
   */
  function createFallbackTemplate(quizType) {
    console.log('Creating fallback template for ' + quizType);

    if (quizType === 'zodiac-sign-quiz') {
      var zodiacTemplate = {
        id: 'zodiac-sign-quiz',
        name: 'Discover Your True Zodiac Sign',
        description: 'Your birth date may say one thing, but your personality reveals your true cosmic alignment',
        icon: 'fas fa-star',
        isPersonality: true,
        isImageQuiz: true,
        category: 'image-quizzes',
        banner: 'assets/images/zodiac/zodiac-banner.webp',
        personalityTypes: {
          aries: {
            title: 'Aries - The Fire Pioneer',
            description: 'You embody the pioneering spirit of the ram – bold, courageous, and always ready to take the initiative.',
            characteristics: ['Natural leadership', 'Courageous', 'Energetic', 'Direct', 'Independent'],
            strengths: 'Your ability to make decisions quickly and take initiative makes you excellent in leadership roles.',
            challenges: "Sometimes you may need to slow down and listen more to others' input.",
            imagePath: 'assets/images/zodiac/aries-result.webp'
          },
          taurus: {
            title: 'Taurus - The Earth Cultivator',
            description: "You embody stability, persistence, and appreciation for life's sensual pleasures.",
            characteristics: ['Reliable', 'Patient', 'Practical', 'Determined', 'Loyal'],
            strengths: 'Your persistence and attention to detail allow you to succeed where others might give up.',
            challenges: 'You might sometimes be resistant to necessary change.',
            imagePath: 'assets/images/zodiac/taurus-result.webp'
          },
          gemini: {
            title: 'Gemini - The Air Communicator',
            description: 'You possess a naturally curious mind and excellent communication skills.',
            characteristics: ['Communicative', 'Curious', 'Adaptable', 'Versatile', 'Quick-thinking'],
            strengths: 'Your versatility and communication skills help you thrive in constantly changing environments.',
            challenges: 'You might sometimes scatter energy in too many directions.',
            imagePath: 'assets/images/zodiac/gemini-result.webp'
          }
        },
        questions: [
          {
            question: 'Which celestial body represents your inner energy?',
            isImageSelection: true,
            options: [
              { text: 'Sun',  image: 'assets/images/zodiac/sun.webp'  },
              { text: 'Moon', image: 'assets/images/zodiac/moon.webp' },
              { text: 'Mars', image: 'assets/images/zodiac/mars.webp' }
            ],
            personalityPoints: [
              { aries: 3, taurus: 1, gemini: 1 },
              { aries: 1, taurus: 3, gemini: 1 },
              { aries: 1, taurus: 1, gemini: 3 }
            ]
          },
          {
            question: 'Which element resonates with your true nature?',
            isImageSelection: true,
            options: [
              { text: 'Fire',  image: 'assets/images/zodiac/fire1.webp'  },
              { text: 'Earth', image: 'assets/images/zodiac/earth1.webp' },
              { text: 'Air',   image: 'assets/images/zodiac/air1.webp'   }
            ],
            personalityPoints: [
              { aries: 3, taurus: 0, gemini: 0 },
              { aries: 0, taurus: 3, gemini: 0 },
              { aries: 0, taurus: 0, gemini: 3 }
            ]
          }
        ]
      };

      if (window.QuizProsTopics && window.QuizProsTopics.registerQuizTemplate) {
        window.QuizProsTopics.registerQuizTemplate(zodiacTemplate, 'image-quizzes');
        console.log('Registered fallback zodiac quiz template');
      }
    }

    if (quizType === 'spirit-animal-quiz') {
      var spiritAnimalTemplate = {
        id: 'spirit-animal-quiz',
        name: 'Discover Your Spirit Animal',
        description: 'Find the animal that resonates with your inner self',
        icon: 'fas fa-paw',
        isPersonality: true,
        isImageQuiz: true,
        category: 'image-quizzes',
        personalityTypes: {
          wolf: {
            title: 'Wolf - The Loyal Protector',
            description: 'You are fiercely loyal and protective of your pack, with strong instincts and deep connections to those you care about.',
            characteristics: ['Loyal', 'Protective', 'Intuitive', 'Social', 'Independent'],
            strengths: 'Your loyalty and protective nature make you a trusted friend and ally.',
            challenges: 'Remember to take time for yourself outside of caring for others.',
            imagePath: 'assets/images/spirit-animals/wolf-result.webp'
          },
          eagle: {
            title: 'Eagle - The Visionary',
            description: 'You see the big picture and possess great vision, soaring above mundane concerns to focus on higher goals and perspectives.',
            characteristics: ['Visionary', 'Focused', 'Free-spirited', 'Powerful', 'Precise'],
            strengths: 'Your ability to see the big picture helps you achieve your lofty goals.',
            challenges: 'Staying connected to everyday practical matters can be difficult.',
            imagePath: 'assets/images/spirit-animals/eagle-result.webp'
          },
          bear: {
            title: 'Bear - The Strong Guardian',
            description: 'You embody strength and wisdom as a natural guardian, with tremendous power that you use judiciously and a deep connection to nature.',
            characteristics: ['Strong', 'Introspective', 'Confident', 'Protective', 'Wise'],
            strengths: 'Your inner strength and wisdom make you a powerful force.',
            challenges: 'Finding balance between solitude and social connection.',
            imagePath: 'assets/images/spirit-animals/bear-result.webp'
          }
        },
        questions: [
          {
            question: 'Which environment do you feel most at home in?',
            isImageSelection: true,
            options: [
              { text: 'Forest',     image: 'assets/images/spirit-animals/wolf.webp'  },
              { text: 'Mountains',  image: 'assets/images/spirit-animals/eagle.webp' },
              { text: 'Wilderness', image: 'assets/images/spirit-animals/bear.webp'  }
            ],
            personalityPoints: [
              { wolf: 3, eagle: 1, bear: 1 },
              { wolf: 1, eagle: 3, bear: 1 },
              { wolf: 1, eagle: 1, bear: 3 }
            ]
          },
          {
            question: 'How do you approach challenges in your life?',
            isImageSelection: true,
            options: [
              { text: 'With loyalty and teamwork',   image: 'assets/images/spirit-animals/wolf.webp'  },
              { text: 'With vision and perspective', image: 'assets/images/spirit-animals/eagle.webp' },
              { text: 'With strength and wisdom',    image: 'assets/images/spirit-animals/bear.webp'  }
            ],
            personalityPoints: [
              { wolf: 3, eagle: 0, bear: 0 },
              { wolf: 0, eagle: 3, bear: 0 },
              { wolf: 0, eagle: 0, bear: 3 }
            ]
          }
        ]
      };

      if (window.QuizProsTopics && window.QuizProsTopics.registerQuizTemplate) {
        window.QuizProsTopics.registerQuizTemplate(spiritAnimalTemplate, 'image-quizzes');
        console.log('Registered fallback spirit animal quiz template');
      }
    }
  }

  // Backward-compat alias — quiz-engine.js calls window.createFallbackTemplate()
  window.createFallbackTemplate = createFallbackTemplate;

  return {
    renderQuestion: renderQuestion,
    renderZodiacQuestion: renderZodiacQuestion,
    renderPersonalityResult: renderPersonalityResult,
    renderScoreResult: renderScoreResult,
    createFallbackTemplate: createFallbackTemplate
  };
})();
