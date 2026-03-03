// Quiz Page Script
document.addEventListener('DOMContentLoaded', () => {
    // Get quiz ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id');

    if (!quizId) {
        window.location.href = '/';
        return;
    }

    // Initialize quiz engine
    const quizEngine = window.iQuizPros?.quizEngine;
    if (!quizEngine) {
        showToast('Quiz engine not available', 'error');
        return;
    }

    // Initialize quiz
    initializeQuiz(quizId);
});

async function initializeQuiz(quizId) {
    try {
        // Get quiz data from API
        const response = await fetch(`/api/quiz/${quizId}`);
        if (!response.ok) {
            throw new Error('Failed to load quiz');
        }

        const quizData = await response.json();
        
        // Initialize quiz engine with data
        await window.iQuizPros.quizEngine.initialize();
        const success = await window.iQuizPros.quizEngine.startQuiz(quizId);
        
        if (!success) {
            throw new Error('Failed to start quiz');
        }

        // Show first question
        showQuestion();

        // Setup quiz state listener
        window.iQuizPros.quizEngine.onQuizStateChanged(handleQuizStateChange);
    } catch (error) {
        console.error('Error initializing quiz:', error);
        showToast(error.message, 'error');
    }
}

function showQuestion() {
    const quizEngine = window.iQuizPros?.quizEngine;
    const question = quizEngine.getCurrentQuestion();
    const state = quizEngine.getQuizState();

    if (!question || !state) {
        showToast('Error loading question', 'error');
        return;
    }

    // Update progress
    updateProgress(state);

    // Get quiz content container
    const quizContent = document.getElementById('quiz-content');
    if (!quizContent) return;

    // Create question HTML
    quizContent.innerHTML = `
        <div class="question">
            <h2 class="question-text">${question.text}</h2>
            <div class="options">
                ${question.options.map((option, index) => `
                    <button class="option" data-index="${index}">
                        ${option}
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    // Add click handlers to options
    const options = quizContent.querySelectorAll('.option');
    options.forEach(option => {
        option.addEventListener('click', () => {
            const index = parseInt(option.dataset.index);
            handleAnswer(index, options);
        });
    });
}

async function handleAnswer(selectedIndex, options) {
    const quizEngine = window.iQuizPros?.quizEngine;
    
    try {
        // Disable all options
        options.forEach(opt => {
            opt.disabled = true;
            opt.classList.add('disabled');
        });

        // Highlight selected option
        options[selectedIndex].classList.add('selected');

        // Select answer in quiz engine
        const success = await quizEngine.selectAnswer(selectedIndex);
        if (!success) {
            throw new Error('Failed to process answer');
        }

        // Play sound based on correctness
        const state = quizEngine.getQuizState();
        if (!state.isPersonalityQuiz) {
            const isCorrect = state.lastAnswerCorrect;
            window.iQuizPros.audioUtils.playSound(isCorrect ? 'correct' : 'incorrect');
        }

    } catch (error) {
        console.error('Error handling answer:', error);
        showToast(error.message, 'error');
    }
}

function handleQuizStateChange(state) {
    switch (state.eventType) {
        case 'answer-selected':
            // Handle answer feedback
            break;
        case 'question-changed':
            showQuestion();
            break;
        case 'quiz-completed':
            showResults();
            break;
    }
}

function showResults() {
    const quizEngine = window.iQuizPros?.quizEngine;
    const results = quizEngine.getQuizResults();

    if (!results) {
        showToast('Error loading results', 'error');
        return;
    }

    const quizContent = document.getElementById('quiz-content');
    if (!quizContent) return;

    let resultContent;
    if (results.isPersonalityQuiz) {
        const personalityType = results.personalityType;
        resultContent = `
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
    } else {
        resultContent = `
            <div class="knowledge-result">
                <div class="score-circle ${getScoreClass(results.percentage)}">
                    <div class="score-percentage">${results.percentage}%</div>
                    <div class="score-text">${getScoreText(results.percentage)}</div>
                </div>
                <div class="score-details">
                    <div class="detail-item">
                        <span class="label">Correct Answers:</span>
                        <span class="value">${results.score}/${results.totalQuestions}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Time Taken:</span>
                        <span class="value">${formatTime(results.duration)}</span>
                    </div>
                </div>
            </div>
        `;

        // Show confetti for good scores
        if (results.percentage >= 70) {
            window.iQuizPros.confettiUtils.showCelebration();
            window.iQuizPros.audioUtils.playCelebrationSound();
        }
    }

    quizContent.innerHTML = `
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

    // Add button handlers
    setupResultButtons(results);
}

function setupResultButtons(results) {
    const quizContent = document.getElementById('quiz-content');
    if (!quizContent) return;

    const shareButton = quizContent.querySelector('.share-result');
    const retakeButton = quizContent.querySelector('.retake-quiz');
    const homeButton = quizContent.querySelector('.return-home');

    if (shareButton) {
        shareButton.addEventListener('click', () => {
            showShareOptions(results);
        });
    }

    if (retakeButton) {
        retakeButton.addEventListener('click', () => {
            window.location.reload();
        });
    }

    if (homeButton) {
        homeButton.addEventListener('click', () => {
            window.location.href = '/';
        });
    }
}

function updateProgress(state) {
    const progressBar = document.querySelector('.quiz-progress-fill');
    const progressText = document.querySelector('.quiz-progress-text');

    if (progressBar && progressText) {
        progressBar.style.width = `${state.progress}%`;
        progressText.textContent = `Question ${state.currentQuestion + 1} of ${state.totalQuestions}`;
    }
}

function showShareOptions(results) {
    const modal = document.createElement('div');
    modal.className = 'modal share-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Share Your Results</h2>
                <button class="close-button">&times;</button>
            </div>
            <div class="modal-body">
                <div class="share-buttons">
                    <button class="share-button whatsapp">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </button>
                    <button class="share-button facebook">
                        <i class="fab fa-facebook"></i> Facebook
                    </button>
                    <button class="share-button twitter">
                        <i class="fab fa-twitter"></i> Twitter
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add share button handlers
    const shareButtons = modal.querySelectorAll('.share-button');
    shareButtons.forEach(button => {
        button.addEventListener('click', () => {
            const platform = button.classList.contains('whatsapp') ? 'whatsapp' :
                           button.classList.contains('facebook') ? 'facebook' : 'twitter';
            window.iQuizPros.sharingService.shareResults(results, platform);
            modal.remove();
        });
    });

    // Close button handler
    const closeButton = modal.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modal.remove();
        });
    }

    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Helper Functions
function getScoreClass(percentage) {
    if (percentage >= 90) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'average';
    return 'poor';
}

function getScoreText(percentage) {
    if (percentage >= 90) return 'Excellent!';
    if (percentage >= 70) return 'Good Job!';
    if (percentage >= 50) return 'Not Bad!';
    return 'Keep Practicing!';
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function showToast(message, type = 'info') {
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
