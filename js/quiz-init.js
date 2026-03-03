// Quiz Initialization Script
window.iQuizPros = window.iQuizPros || {};

class QuizInitializer {
    constructor() {
        this.quizId = new URLSearchParams(window.location.search).get('id');
        this.quizContent = document.getElementById('quiz-content');
        this.progressBar = document.querySelector('.quiz-progress-fill');
        this.progressText = document.querySelector('.quiz-progress-text');
    }

    async initialize() {
        try {
            if (!this.quizId) {
                throw new Error('No quiz ID provided');
            }

            // Load quiz template
            const template = await this.loadQuizTemplate();
            if (!template) {
                throw new Error('Failed to load quiz template');
            }

            // Initialize quiz state
            this.initializeQuizState(template);

            // Show first question
            this.showQuestion(template.questions[0], 0, template.questions.length);

            // Add event listeners
            this.setupEventListeners();

            return true;
        } catch (error) {
            console.error('Quiz initialization failed:', error);
            this.showError('Failed to initialize quiz');
            return false;
        }
    }

    async loadQuizTemplate() {
        try {
            console.log('Loading quiz template for ID:', this.quizId);
            const response = await fetch(`/api/quiz/${this.quizId}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const template = await response.json();
            console.log('Quiz template loaded:', template);
            return template;
        } catch (error) {
            console.error('Error loading quiz template:', error);
            throw error;
        }
    }

    initializeQuizState(template) {
        window.iQuizPros.quizState = {
            currentQuestion: 0,
            totalQuestions: template.questions.length,
            answers: [],
            score: 0,
            startTime: new Date(),
            isPersonalityQuiz: template.type === 'personality',
            template: template
        };
    }

    showQuestion(question, index, total) {
        // Update progress
        this.updateProgress(index + 1, total);

        // Show question content
        this.quizContent.innerHTML = `
            <div class="question">
                <h2 class="question-text">${question.text}</h2>
                <div class="options">
                    ${question.options.map((option, i) => `
                        <button class="option" data-index="${i}">
                            ${typeof option === 'string' ? option : option.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add click handlers to options
        const options = this.quizContent.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                const index = parseInt(option.dataset.index);
                this.handleAnswer(index, options);
            });
        });
    }

    async handleAnswer(selectedIndex, options) {
        const state = window.iQuizPros.quizState;
        const question = state.template.questions[state.currentQuestion];

        // Disable all options
        options.forEach(opt => opt.classList.add('disabled'));

        // Highlight selected option
        options[selectedIndex].classList.add('selected');

        // Store answer
        state.answers.push({
            questionId: question.id,
            selectedOption: selectedIndex,
            timestamp: new Date().toISOString()
        });

        // Update score for knowledge quiz
        if (!state.isPersonalityQuiz && selectedIndex === question.correctOption) {
            state.score++;
        }

        // Move to next question or show results
        setTimeout(() => {
            if (state.currentQuestion < state.totalQuestions - 1) {
                state.currentQuestion++;
                this.showQuestion(
                    state.template.questions[state.currentQuestion],
                    state.currentQuestion,
                    state.totalQuestions
                );
            } else {
                this.showResults();
            }
        }, 1000);
    }

    showResults() {
        const state = window.iQuizPros.quizState;
        const duration = Math.round((new Date() - state.startTime) / 1000);

        let resultContent;
        if (state.isPersonalityQuiz) {
            // Calculate personality type
            const personalityType = this.calculatePersonalityType();
            resultContent = this.getPersonalityResultContent(personalityType);
        } else {
            // Calculate knowledge quiz score
            const percentage = Math.round((state.score / state.totalQuestions) * 100);
            resultContent = this.getKnowledgeResultContent(state.score, state.totalQuestions, percentage, duration);
        }

        this.quizContent.innerHTML = `
            <div class="results">
                <h1>Your Results</h1>
                ${resultContent}
                <div class="result-actions">
                    <button class="btn btn-primary share-result">
                        <i class="fas fa-share-alt"></i> Share Results
                    </button>
                    <button class="btn btn-secondary retake-quiz">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                    <button class="btn btn-tertiary return-home">
                        <i class="fas fa-home"></i> Back to Home
                    </button>
                </div>
            </div>
        `;

        this.setupResultButtons();
    }

    calculatePersonalityType() {
        const state = window.iQuizPros.quizState;
        const personalityScores = {};

        // Initialize scores
        Object.keys(state.template.personalityTypes).forEach(type => {
            personalityScores[type] = 0;
        });

        // Calculate scores
        state.answers.forEach((answer, index) => {
            const question = state.template.questions[index];
            if (question.personalityPoints && question.personalityPoints[answer.selectedOption]) {
                const points = question.personalityPoints[answer.selectedOption];
                Object.entries(points).forEach(([type, value]) => {
                    personalityScores[type] += value;
                });
            }
        });

        // Find dominant type
        let dominantType = null;
        let highestScore = -1;

        Object.entries(personalityScores).forEach(([type, score]) => {
            if (score > highestScore) {
                highestScore = score;
                dominantType = type;
            }
        });

        return state.template.personalityTypes[dominantType];
    }

    getPersonalityResultContent(personalityType) {
        return `
            <div class="personality-result">
                <h2>${personalityType.title}</h2>
                <div class="personality-image">
                    <img src="${personalityType.imagePath}" alt="${personalityType.title}">
                </div>
                <div class="personality-description">
                    <p>${personalityType.description}</p>
                </div>
                <div class="personality-traits">
                    <h3>Key Characteristics:</h3>
                    <ul>
                        ${personalityType.characteristics.map(trait => `
                            <li>${trait}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    getKnowledgeResultContent(score, total, percentage, duration) {
        return `
            <div class="knowledge-result">
                <div class="score-circle ${this.getScoreClass(percentage)}">
                    <div class="score-percentage">${percentage}%</div>
                    <div class="score-text">${this.getScoreText(percentage)}</div>
                </div>
                <div class="score-details">
                    <div class="detail-item">
                        <span class="label">Correct Answers:</span>
                        <span class="value">${score}/${total}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Time Taken:</span>
                        <span class="value">${this.formatTime(duration)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    setupResultButtons() {
        const shareButton = this.quizContent.querySelector('.share-result');
        const retakeButton = this.quizContent.querySelector('.retake-quiz');
        const homeButton = this.quizContent.querySelector('.return-home');

        if (shareButton) {
            shareButton.addEventListener('click', () => this.showShareOptions());
        }

        if (retakeButton) {
            retakeButton.addEventListener('click', () => window.location.reload());
        }

        if (homeButton) {
            homeButton.addEventListener('click', () => window.location.href = '/');
        }
    }

    setupEventListeners() {
        // Exit quiz handlers
        const exitButton = document.querySelector('.exit-quiz-button');
        const exitModal = document.getElementById('exit-modal');
        const cancelExitButton = document.getElementById('cancel-exit');
        const confirmExitButton = document.getElementById('confirm-exit');

        if (exitButton) {
            exitButton.addEventListener('click', () => {
                exitModal.style.display = 'flex';
            });
        }

        if (cancelExitButton) {
            cancelExitButton.addEventListener('click', () => {
                exitModal.style.display = 'none';
            });
        }

        if (confirmExitButton) {
            confirmExitButton.addEventListener('click', () => {
                window.location.href = '/';
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === exitModal) {
                exitModal.style.display = 'none';
            }
        });
    }

    updateProgress(current, total) {
        if (this.progressBar && this.progressText) {
            const percentage = (current / total) * 100;
            this.progressBar.style.width = `${percentage}%`;
            this.progressText.textContent = `Question ${current} of ${total}`;
        }
    }

    showError(message) {
        this.showToast(message, 'error');
        this.quizContent.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <h2>Oops! Something went wrong</h2>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="window.location.href='/'">
                    Return to Home
                </button>
            </div>
        `;
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }

    getScoreClass(percentage) {
        if (percentage >= 90) return 'excellent';
        if (percentage >= 70) return 'good';
        if (percentage >= 50) return 'average';
        return 'poor';
    }

    getScoreText(percentage) {
        if (percentage >= 90) return 'Excellent!';
        if (percentage >= 70) return 'Good Job!';
        if (percentage >= 50) return 'Not Bad!';
        return 'Keep Practicing!';
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const initializer = new QuizInitializer();
    await initializer.initialize();
});
