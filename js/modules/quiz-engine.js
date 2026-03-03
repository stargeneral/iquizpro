/**
 * QuizPros Quiz Engine
 * Core functionality for managing quiz state and logic
 */

window.QuizProsEngine = (function () {
  // Private variables
  const config = window.QuizProsConfig;
  const utils = window.QuizProsUtils;

  // Quiz state variables
  let currentQuiz = null;
  let currentQuestion = 0;
  let score = 0;
  let questionData = [];
  let activePersonalityTypes = null;
  let currentQuizBanner = null;
  let personalityScores = {};
  let isPersonalityQuiz = false;
  let selectedAnswers = []; // Track answers for potential review later
  let quizLoadingTimeout = null;
  let quizStartTime = null;
  let isPremiumQuiz = false;
  let attemptingToNavigateAway = false;
  let navigationBlocked = false;

  // Streak tracking (knowledge quizzes only)
  let currentStreak = 0;
  let bestStreak = 0;

  // Difficulty selection (knowledge quizzes only)
  var _selectedDifficulty = null; // null/'all'/'easy'/'medium'/'hard'
  var _DIFFICULTY_KEY = 'iqp_difficulty';

  // Timed mode
  var _timedMode    = false;
  var _TIMED_MODE_KEY = 'iqp_timed_mode';
  var _TIMER_SECONDS  = 30;
  var _questionTimerInterval = null;
  var _questionTimeLeft      = 0;
  var _questionStart         = 0;

  // ─── SEO / Meta helpers ──────────────────────────────────────────────────
  const _DEFAULT_TITLE = 'iQuizPros - Free Online Quizzes & Personality Tests';
  const _DEFAULT_DESC  = 'Take fun personality quizzes, knowledge challenges, and trivia tests. Discover your personality type and share results with friends.';

  function _setMeta(selector, attr, value) {
    var el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  }

  function _updatePageSEO(title, description) {
    document.title = title;
    _setMeta('meta[property="og:title"]',         'content', title);
    _setMeta('meta[property="og:description"]',   'content', description);
    _setMeta('meta[name="twitter:title"]',        'content', title);
    _setMeta('meta[name="twitter:description"]',  'content', description);
  }

  function _resetPageSEO() {
    _updatePageSEO(_DEFAULT_TITLE, _DEFAULT_DESC);
  }
  // ─────────────────────────────────────────────────────────────────────────

  // ─── Scroll helper ───────────────────────────────────────────────────────
  function _scrollToQuizTop() {
    var el = document.getElementById('main-quiz-container');
    if (!el) return;
    // Use a short delay so the container is already visible before scrolling
    setTimeout(function() {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }
  // ─────────────────────────────────────────────────────────────────────────

  // ─── Difficulty picker ───────────────────────────────────────────────────
  function _showDifficultyPicker(topicId) {
    // Remove any existing picker
    var existing = document.getElementById('difficulty-picker-overlay');
    if (existing) existing.remove();

    // Load persisted preference — per-topic key first, then global fallback (10.8b)
    try {
      _selectedDifficulty = localStorage.getItem('iqp_difficulty_' + topicId)
        || localStorage.getItem(_DIFFICULTY_KEY)
        || 'all';
    } catch(e) {}

    // Get question counts per difficulty from question bank
    var counts = { easy: 0, medium: 0, hard: 0, all: 0 };
    if (window.QuizProsQuestionBank && window.QuizProsQuestionBank.getDifficultyCounts) {
      counts = window.QuizProsQuestionBank.getDifficultyCounts(topicId);
    }

    var overlay = document.createElement('div');
    overlay.id = 'difficulty-picker-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);';

    var levels = [
      { key: 'easy',   label: 'Easy',   emoji: '🟢', desc: 'Straightforward questions to warm up',  count: counts.easy },
      { key: 'medium', label: 'Medium', emoji: '🟡', desc: 'Balanced challenge for most players',   count: counts.medium },
      { key: 'hard',   label: 'Hard',   emoji: '🔴', desc: 'Tough questions for trivia experts',    count: counts.hard },
      { key: 'all',    label: 'All Levels', emoji: '🎯', desc: 'Mix of all difficulties',           count: counts.all }
    ];

    var btns = levels.map(function(l) {
      var isActive = (_selectedDifficulty === l.key) ? 'border:3px solid #25d366;background:#f0faf5;' : 'border:3px solid #e0e0e0;background:#fff;';
      return '<button class="diff-btn" data-diff="' + l.key + '" style="' + isActive + 'padding:1rem 1.25rem;border-radius:12px;cursor:pointer;text-align:left;transition:all 0.2s;width:100%;">' +
        '<span style="font-size:1.4rem;">' + l.emoji + '</span>' +
        '<span style="display:inline-block;margin-left:0.75rem;vertical-align:middle;">' +
          '<strong style="display:block;font-size:1rem;color:#1a1a1a;">' + l.label + '</strong>' +
          '<small style="color:#666;">' + l.desc + ' &bull; ' + l.count + ' questions</small>' +
        '</span>' +
      '</button>';
    }).join('');

    overlay.innerHTML =
      '<div style="background:#fff;border-radius:20px;padding:2rem;max-width:420px;width:90%;box-shadow:0 24px 64px rgba(0,0,0,0.25);font-family:inherit;">' +
        '<div style="text-align:center;margin-bottom:1.5rem;">' +
          '<div style="font-size:2.5rem;margin-bottom:0.5rem;">🎓</div>' +
          '<h2 style="margin:0 0 0.25rem;font-size:1.4rem;color:#1a1a1a;">Choose Difficulty</h2>' +
          '<p style="margin:0;color:#666;font-size:0.9rem;">Select how challenging you want your quiz to be</p>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:0.75rem;">' + btns + '</div>' +
        '<button id="diff-start-btn" style="margin-top:1.5rem;width:100%;padding:0.9rem;background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;border:none;border-radius:12px;font-size:1rem;font-weight:700;cursor:pointer;letter-spacing:0.02em;">Start Quiz →</button>' +
        '<button id="diff-cancel-btn" style="margin-top:0.5rem;width:100%;padding:0.6rem;background:transparent;color:#888;border:none;cursor:pointer;font-size:0.875rem;">Cancel</button>' +
      '</div>';

    document.body.appendChild(overlay);

    // Button event listeners
    overlay.querySelectorAll('.diff-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        overlay.querySelectorAll('.diff-btn').forEach(function(b) {
          b.style.border = '3px solid #e0e0e0';
          b.style.background = '#fff';
        });
        btn.style.border = '3px solid #25d366';
        btn.style.background = '#f0faf5';
        _selectedDifficulty = btn.getAttribute('data-diff');
        // Save per-topic key (10.8b); keep global key for backward-compat
        try {
          localStorage.setItem('iqp_difficulty_' + topicId, _selectedDifficulty);
          localStorage.setItem(_DIFFICULTY_KEY, _selectedDifficulty);
        } catch(e) {}
      });
    });

    document.getElementById('diff-start-btn').addEventListener('click', function() {
      overlay.remove();
      startQuiz(topicId, true);
    });

    document.getElementById('diff-cancel-btn').addEventListener('click', function() {
      overlay.remove();
    });

    // Close on backdrop click
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.remove();
    });
  }

  // ─── Streak helpers ──────────────────────────────────────────────────────
  function _removeStreakBadge() {
    var existing = document.getElementById('streak-badge');
    if (existing) existing.remove();
  }

  // ── C.5: Shareable result card helpers ─────────────────────────────────────

  function _buildShareCanvas(label, scoreText) {
    try {
      var canvas = document.createElement('canvas');
      canvas.width  = 600;
      canvas.height = 315;
      var ctx = canvas.getContext('2d');

      // Background gradient
      var grad = ctx.createLinearGradient(0, 0, 600, 315);
      grad.addColorStop(0, '#25d366');
      grad.addColorStop(1, '#128c7e');
      ctx.fillStyle = grad;
      ctx.roundRect ? ctx.roundRect(0, 0, 600, 315, 20) : ctx.fillRect(0, 0, 600, 315);
      ctx.fill();

      // Logo / brand
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = 'bold 64px system-ui';
      ctx.fillText('🧠', 30, 90);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText('iQuizPros', 105, 75);

      // Score line
      ctx.font = 'bold 52px system-ui, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText(scoreText, 30, 175);

      // Quiz label
      ctx.font = '22px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      var displayLabel = String(label).length > 36 ? String(label).slice(0, 33) + '…' : String(label);
      ctx.fillText(displayLabel, 30, 215);

      // CTA
      ctx.font = 'italic 17px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('Can you beat my score? iquizpro.com', 30, 285);

      return canvas;
    } catch (e) {
      return null;
    }
  }

  function _injectShareButton() {
    var container = document.getElementById('result-message');
    if (!container) return;

    // Build label + score text
    var label = currentQuiz;
    try {
      var t = window.QuizProsTopics && window.QuizProsTopics.getTopics().find(function(x){ return x.id === currentQuiz; });
      if (t) label = t.name;
    } catch(e) {}

    var scoreText = isPersonalityQuiz ? 'Personality Result' : (score + '/' + questionData.length);

    var existing = document.getElementById('share-result-btn');
    if (existing) existing.remove();

    var btn = document.createElement('button');
    btn.id = 'share-result-btn';
    btn.textContent = '📸 Share Result';
    btn.style.cssText = [
      'margin-top:1rem;padding:.625rem 1.25rem;',
      'background:linear-gradient(135deg,#25d366,#128c7e);',
      'color:#fff;font-weight:700;font-size:1rem;',
      'border:none;border-radius:8px;cursor:pointer;',
      'display:block;width:100%;max-width:280px;',
      'min-height:44px;'
    ].join('');

    btn.addEventListener('click', function() {
      var canvas = _buildShareCanvas(label, scoreText);
      if (!canvas) { alert('Canvas share is not supported in this browser.'); return; }

      if (navigator.share && navigator.canShare) {
        canvas.toBlob(function(blob) {
          var file = new File([blob], 'iquizpros-result.png', { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: 'My iQuizPros result', text: 'I scored ' + scoreText + ' on ' + label + '! Beat me at iquizpro.com' })
              .catch(function() {}); // ignore user cancel
          } else {
            _downloadCanvas(canvas);
          }
        }, 'image/png');
      } else {
        _downloadCanvas(canvas);
      }
    });

    container.appendChild(btn);
  }

  function _downloadCanvas(canvas) {
    var link = document.createElement('a');
    link.download = 'iquizpros-result.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // ── Phase 10.4: PDF export ─────────────────────────────────────────────────
  function _loadScript(src) {
    return new Promise(function(resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) { resolve(); return; }
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function _exportResultsPDF() {
    var resultEl = document.getElementById('final-result') || document.getElementById('personality-result');
    if (!resultEl) return Promise.reject(new Error('No result element'));
    return _loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
      .then(function() {
        return _loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      })
      .then(function() {
        return window.html2canvas(resultEl, { scale: 2, useCORS: true, allowTaint: true });
      })
      .then(function(canvas) {
        var imgData = canvas.toDataURL('image/png');
        var W = canvas.width / 2;
        var H = canvas.height / 2;
        var pdf = new window.jspdf.jsPDF({ orientation: H > W ? 'portrait' : 'landscape', unit: 'px', format: [W, H] });
        pdf.addImage(imgData, 'PNG', 0, 0, W, H);
        var label = currentQuiz;
        try {
          var t = window.QuizProsTopics && window.QuizProsTopics.getTopics().find(function(x){ return x.id === currentQuiz; });
          if (t) label = t.name;
        } catch(e) {}
        pdf.save('iquizpros-' + label.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '-result.pdf');
      });
  }

  function _injectPDFButton() {
    var container = document.getElementById('result-message');
    if (!container) return;
    var existing = document.getElementById('export-pdf-btn');
    if (existing) existing.remove();
    var btn = document.createElement('button');
    btn.id = 'export-pdf-btn';
    btn.innerHTML = '<i class="fas fa-file-pdf"></i> Download PDF';
    btn.addEventListener('click', function() {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating…';
      _exportResultsPDF().then(function() {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-file-pdf"></i> Download PDF';
      }).catch(function(err) {
        utils.logger.warn('PDF export failed', err);
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-file-pdf"></i> Download PDF';
      });
    });
    container.appendChild(btn);
  }

  // ── C.7: Swipe gesture handler ──────────────────────────────────────────────

  var _swipeTouchStartX = 0;
  var _swipeTouchStartY = 0;

  function _attachSwipeHandler(element) {
    if (!element) return;
    // Remove previous listeners by replacing the element reference (lightweight approach)
    // We store one pair of listeners per container using a flag
    if (element._swipeAttached) return;
    element._swipeAttached = true;

    element.addEventListener('touchstart', function(e) {
      _swipeTouchStartX = e.changedTouches[0].clientX;
      _swipeTouchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    element.addEventListener('touchend', function(e) {
      var dx = e.changedTouches[0].clientX - _swipeTouchStartX;
      var dy = e.changedTouches[0].clientY - _swipeTouchStartY;
      // Only treat as horizontal swipe if horizontal movement dominates
      if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;

      if (dx < 0) {
        // Swipe left — advance (personality: skip; knowledge: only if options are disabled)
        var disabledOptions = element.querySelectorAll('.option[disabled]');
        if (isPersonalityQuiz || disabledOptions.length > 0) {
          // All options already locked (answer selected), so advance
          currentQuestion++;
          _saveProgress();
          if (currentQuestion >= questionData.length) {
            _clearProgress(currentQuiz);
            showResults();
          } else {
            showQuestion();
          }
        }
      }
      // Swipe right — not implemented (would require tracking history stack)
    }, { passive: true });
  }

  // ── C.6: How others answered ─────────────────────────────────────────────────

  function _recordAndShowHowOthersAnswered(qIdx, chosenIndex) {
    if (typeof firebase === 'undefined' || !firebase.firestore) return;
    var docRef = firebase.firestore().collection('quizStats').doc(currentQuiz);
    var field = 'q' + qIdx + 'o' + chosenIndex;

    // Increment this option's count (fire-and-forget)
    docRef.set(
      { [field]: firebase.firestore.FieldValue.increment(1) },
      { merge: true }
    ).catch(function() {});

    // Fetch the full doc to compute percentages and show a bar chart
    docRef.get().then(function(snap) {
      if (!snap.exists) return;
      var data = snap.data() || {};
      var question = questionData[qIdx];
      if (!question || !question.options || question.options.length < 2) return;

      var counts = question.options.map(function(_, i) {
        return Number(data['q' + qIdx + 'o' + i] || 0);
      });
      var total = counts.reduce(function(a, b) { return a + b; }, 0);
      if (total === 0) return;

      var existing = document.getElementById('how-others-answered');
      if (existing) existing.remove();

      var panel = document.createElement('div');
      panel.id = 'how-others-answered';
      panel.setAttribute('aria-live', 'polite');
      panel.style.cssText = 'margin-top:1rem;padding:1rem;background:#f0faf5;border-radius:10px;font-size:.875rem;';
      var html = '<div style="font-weight:700;color:#128c7e;margin-bottom:.6rem;">📊 How others answered</div>';
      counts.forEach(function(count, i) {
        var pct = Math.round((count / total) * 100);
        var isCorrect = i === question.answer;
        var isChosen  = i === chosenIndex;
        var barColor = isCorrect ? '#25d366' : (isChosen ? '#c62828' : '#bbb');
        var label = String(question.options[i]).replace(/</g,'&lt;').replace(/>/g,'&gt;');
        html += '<div style="margin-bottom:.4rem;">'
          + '<div style="display:flex;justify-content:space-between;margin-bottom:2px;">'
          + '<span style="color:#444;">' + label + (isCorrect ? ' ✓' : '') + '</span>'
          + '<span style="font-weight:600;color:#444;">' + pct + '%</span></div>'
          + '<div style="background:#e0e0e0;border-radius:4px;height:8px;">'
          + '<div style="background:' + barColor + ';width:' + pct + '%;height:100%;border-radius:4px;transition:width .4s;"></div>'
          + '</div></div>';
      });
      panel.innerHTML = html;

      var container = document.getElementById('quiz-container') ||
                      document.getElementById('main-quiz-container') ||
                      document.querySelector('.quiz-content');
      if (container) container.appendChild(panel);
    }).catch(function() {});
  }

  // ────────────────────────────────────────────────────────────────────────────

  function _updateStreakBadge() {
    if (isPersonalityQuiz) return; // streaks are knowledge-only

    // Find the quiz progress area to anchor the badge
    var progressArea = document.querySelector('.progress-container') ||
                       document.querySelector('.quiz-progress') ||
                       document.getElementById('question-container');
    if (!progressArea) return;

    var badge = document.getElementById('streak-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'streak-badge';
      badge.style.cssText = [
        'display:inline-flex;align-items:center;gap:4px;',
        'background:linear-gradient(135deg,#25d366 0%,#128c7e 100%);',
        'color:#fff;font-weight:700;font-size:0.82rem;',
        'padding:3px 10px;border-radius:20px;',
        'margin-top:6px;transition:transform 0.15s,opacity 0.3s;',
        'box-shadow:0 2px 6px rgba(37,211,102,0.35);'
      ].join('');
      progressArea.appendChild(badge);
    }

    if (currentStreak < 2) {
      badge.style.opacity = '0';
      badge.style.transform = 'scale(0.7)';
      return;
    }

    var fire = currentStreak >= 5 ? '\uD83D\uDD25\uD83D\uDD25' : '\uD83D\uDD25';
    badge.textContent = fire + ' ' + currentStreak + ' in a row!';
    badge.style.opacity = '1';
    badge.style.transform = 'scale(1)';

    // Pulse animation on milestones
    if (currentStreak === 3 || currentStreak === 5 || currentStreak % 5 === 0) {
      badge.style.transform = 'scale(1.25)';
      setTimeout(function() { badge.style.transform = 'scale(1)'; }, 250);
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  // ─── Progress saving (knowledge quizzes) ─────────────────────────────────
  var _PROGRESS_PREFIX = 'iqp_progress_';
  var _PROGRESS_TTL    = 86400000; // 24 hours in ms

  function _saveProgress() {
    if (!currentQuiz || isPersonalityQuiz) return;
    try {
      var state = {
        topicId:        currentQuiz,
        questionData:   questionData,
        currentQuestion: currentQuestion,
        score:          score,
        selectedAnswers: selectedAnswers,
        currentStreak:  currentStreak,
        bestStreak:     bestStreak,
        savedAt:        Date.now()
      };
      localStorage.setItem(_PROGRESS_PREFIX + currentQuiz, JSON.stringify(state));
    } catch(e) {
      utils.logger.warn('Could not save quiz progress:', e);
    }
  }

  function _clearProgress(topicId) {
    try { localStorage.removeItem(_PROGRESS_PREFIX + topicId); } catch(e) {}
  }

  function _getSavedProgress(topicId) {
    try {
      var raw = localStorage.getItem(_PROGRESS_PREFIX + topicId);
      if (!raw) return null;
      var state = JSON.parse(raw);
      if (Date.now() - state.savedAt > _PROGRESS_TTL) { _clearProgress(topicId); return null; }
      return state;
    } catch(e) { return null; }
  }

  function _showResumePrompt(topicId, savedState, onResume, onFresh) {
    var container = document.getElementById('main-quiz-container');
    if (!container) { onFresh(); return; }

    var overlay = document.createElement('div');
    overlay.id = 'resume-prompt';
    overlay.style.cssText = [
      'position:absolute;top:0;left:0;width:100%;height:100%;',
      'display:flex;align-items:center;justify-content:center;',
      'background:rgba(255,255,255,0.95);z-index:50;',
      'border-radius:12px;flex-direction:column;gap:16px;padding:32px;text-align:center;'
    ].join('');

    var q = savedState.currentQuestion;
    var total = savedState.questionData ? savedState.questionData.length : '?';

    overlay.innerHTML = [
      '<div style="font-size:2rem">\u23F8\uFE0F</div>',
      '<h3 style="color:#128c7e;margin:0">Unfinished quiz found</h3>',
      '<p style="color:#555;margin:0">You were on question <strong>' + q + '</strong> of <strong>' + total + '</strong> ',
      '(score: ' + savedState.score + '/' + q + ')</p>',
      '<div style="display:flex;gap:12px">',
        '<button id="resume-btn" style="background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;',
          'border:none;padding:10px 22px;border-radius:8px;font-size:0.95rem;font-weight:700;cursor:pointer;">',
          '\u25B6 Resume</button>',
        '<button id="fresh-btn" style="background:#f1f1f1;color:#555;',
          'border:none;padding:10px 22px;border-radius:8px;font-size:0.95rem;cursor:pointer;">',
          'Start Fresh</button>',
      '</div>'
    ].join('');

    container.style.position = 'relative';
    container.appendChild(overlay);

    document.getElementById('resume-btn').addEventListener('click', function() {
      overlay.remove();
      onResume();
    });
    document.getElementById('fresh-btn').addEventListener('click', function() {
      overlay.remove();
      _clearProgress(topicId);
      onFresh();
    });
  }
  // ─────────────────────────────────────────────────────────────────────────

  // ─── Timed mode helpers ──────────────────────────────────────────────────
  function _stopQuestionTimer() {
    if (_questionTimerInterval) {
      clearInterval(_questionTimerInterval);
      _questionTimerInterval = null;
    }
    var bar = document.getElementById('quiz-timer-bar');
    if (bar) { var wrap = bar.parentElement; if (wrap) wrap.remove(); else bar.remove(); }
  }

  function _onTimerExpired() {
    _stopQuestionTimer();
    // Disable all options (no answer selected)
    var allOptions = document.querySelectorAll('.option');
    allOptions.forEach(function(opt) {
      opt.disabled = true;
      opt.style.pointerEvents = 'none';
    });
    // Show correct answer
    var question = questionData[currentQuestion];
    if (question && allOptions[question.answer]) {
      allOptions[question.answer].classList.add('correct');
    }
    // Auto-advance after a brief pause
    setTimeout(function() {
      currentQuestion++;
      _saveProgress();
      if (currentQuestion >= questionData.length) {
        _clearProgress(currentQuiz);
        showResults();
      } else {
        showQuestion();
      }
    }, 1200);
  }

  function _startQuestionTimer() {
    _stopQuestionTimer(); // clear any previous
    _questionTimeLeft = _TIMER_SECONDS;

    // Build timer bar
    var container = document.getElementById('question-container') ||
                    document.getElementById('main-quiz-container');
    if (!container) return;

    var bar = document.createElement('div');
    bar.id = 'quiz-timer-bar';
    bar.style.cssText = [
      'height:6px;border-radius:3px;margin-bottom:8px;',
      'background:linear-gradient(90deg,#25d366,#128c7e);',
      'transition:width 1s linear;width:100%;'
    ].join('');

    var barWrap = document.createElement('div');
    barWrap.style.cssText = 'width:100%;background:#e0e0e0;border-radius:3px;margin-bottom:8px;overflow:hidden;';
    barWrap.appendChild(bar);

    // Insert before the first child of the question container
    container.insertBefore(barWrap, container.firstChild);

    _questionTimerInterval = setInterval(function() {
      _questionTimeLeft--;
      var pct = Math.max(0, (_questionTimeLeft / _TIMER_SECONDS) * 100);
      bar.style.width = pct + '%';
      // Turn red when <10s
      if (_questionTimeLeft <= 10) {
        bar.style.background = '#e74c3c';
      }
      if (_questionTimeLeft <= 0) {
        _onTimerExpired();
      }
    }, 1000);
  }

  function _injectTimerToggle() {
    if (isPersonalityQuiz) return;
    var container = document.getElementById('question-container') ||
                    document.getElementById('main-quiz-container');
    if (!container) return;
    if (document.getElementById('timer-toggle')) return; // already injected

    // Load saved preference
    try {
      var saved = localStorage.getItem(_TIMED_MODE_KEY);
      if (saved === 'true') _timedMode = true;
    } catch(e) {}

    var btn = document.createElement('button');
    btn.id = 'timer-toggle';
    btn.type = 'button';
    btn.style.cssText = [
      'position:absolute;top:10px;right:12px;',
      'background:' + (_timedMode ? 'linear-gradient(135deg,#25d366,#128c7e)' : '#f1f1f1') + ';',
      'color:' + (_timedMode ? '#fff' : '#555') + ';',
      'border:none;border-radius:20px;padding:4px 12px;font-size:0.75rem;',
      'font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;',
      'transition:background 0.2s,color 0.2s;'
    ].join('');
    btn.innerHTML = '\u23F1\uFE0F ' + (_timedMode ? 'Timed ON' : 'Timed OFF');

    btn.addEventListener('click', function() {
      _timedMode = !_timedMode;
      try { localStorage.setItem(_TIMED_MODE_KEY, String(_timedMode)); } catch(e) {}
      btn.style.background = _timedMode ? 'linear-gradient(135deg,#25d366,#128c7e)' : '#f1f1f1';
      btn.style.color       = _timedMode ? '#fff' : '#555';
      btn.innerHTML = '\u23F1\uFE0F ' + (_timedMode ? 'Timed ON' : 'Timed OFF');
      if (_timedMode) {
        _startQuestionTimer();
      } else {
        _stopQuestionTimer();
      }
    });

    // Make container relative for absolute positioning
    container.style.position = 'relative';
    container.appendChild(btn);
  }
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Reset the quiz state completely
   */
  function resetQuizState() {
    utils.logger.info("Resetting quiz state");
    utils.performance.startMeasure("resetQuizState");

    // Reset quiz state variables
    currentQuiz = null;
    currentQuestion = 0;
    score = 0;
    questionData = [];
    activePersonalityTypes = null;
    currentQuizBanner = null;
    personalityScores = {};
    isPersonalityQuiz = false;
    selectedAnswers = [];
    quizStartTime = null;
    isPremiumQuiz = false;
    attemptingToNavigateAway = false;
    navigationBlocked = false;
    currentStreak = 0;
    bestStreak = 0;
    _removeStreakBadge();
    _stopQuestionTimer();

    // Clear any existing timeouts
    if (quizLoadingTimeout) {
      clearTimeout(quizLoadingTimeout);
      quizLoadingTimeout = null;
    }

    // Reset UI state if elements exist
    utils.domUtils.toggleElementDisplay("loading", false);

    const questionContainer = document.getElementById("question-container");
    if (questionContainer) {
      questionContainer.innerHTML = "";
      questionContainer.style.display = "none";
    }

    // Hide result containers
    const resultContainers = ["pre-result", "final-result", "locked-result"];
    resultContainers.forEach((id) => {
      utils.domUtils.toggleElementDisplay(id, false);
    });

    // Reset progress bar
    const progressBar = document.getElementById("progress");
    if (progressBar) {
      progressBar.style.width = "0%";
      progressBar.setAttribute('aria-valuenow', '0');
    }

    // Important: Don't show topic selection screen here
    // This should only be done in resetAndReturn()

    utils.performance.endMeasure("resetQuizState");
    utils.logger.debug("Quiz state reset completed");
  }

  /**
   * Reset quiz state and return to topic selection
   */
  function resetAndReturn() {
    utils.logger.info('Resetting quiz and returning to topic selection');
    
    // Check if the quiz was just started
    const timeSinceStart = quizStartTime ? (new Date() - quizStartTime) : 10000;
    
    // If this is happening very quickly after starting, we might have an issue
    if (timeSinceStart < 2000) {
      console.warn('Quick navigation detected - the quiz may be failing to load properly');
      
      // If we're already trying to block navigation, don't repeat
      if (navigationBlocked) {
        console.log('Navigation already blocked, proceeding with reset');
      } else if (!attemptingToNavigateAway) {
        // First attempt to navigate away - block it and try to recover
        console.log('First navigation attempt blocked, trying to recover quiz');
        attemptingToNavigateAway = true;
        navigationBlocked = true;
        
        // Try to recover by forcing quiz display
        setTimeout(() => {
          // Hide loading spinner
          utils.domUtils.toggleElementDisplay("loading", false);
          
          // Set up question container
          const questionContainer = document.getElementById("question-container");
          if (questionContainer) {
            questionContainer.style.display = 'block';
            
            // If this is an image quiz, provide special fallback
            if (currentQuiz === "zodiac-sign-quiz" || currentQuiz === "spirit-animal-quiz") {
              console.log('Attempting fallback for image quiz:', currentQuiz);
              
              // Create fallback content for questionContainer
              questionContainer.innerHTML = `
                <div class="question-number">Question 1 of 6</div>
                <div class="question-banner">
                  <p>Which element resonates with your true nature?</p>
                </div>
                <div class="image-selection-grid">
                  <div class="image-option" onclick="QuizProsEngine.selectAnswer(0)">
                    <img src="assets/images/zodiac/fire1.webp" alt="Fire" onerror="this.src='assets/images/default-personality.webp'">
                    <div class="image-number">1</div>
                    <div class="image-caption">Fire (Dynamic)</div>
                  </div>
                  <div class="image-option" onclick="QuizProsEngine.selectAnswer(1)">
                    <img src="assets/images/zodiac/earth1.webp" alt="Earth" onerror="this.src='assets/images/default-personality.webp'">
                    <div class="image-number">2</div>
                    <div class="image-caption">Earth (Stable)</div>
                  </div>
                  <div class="image-option" onclick="QuizProsEngine.selectAnswer(2)">
                    <img src="assets/images/zodiac/air1.webp" alt="Air" onerror="this.src='assets/images/default-personality.webp'">
                    <div class="image-number">3</div>
                    <div class="image-caption">Air (Mental)</div>
                  </div>
                </div>
              `;
              
              // Create minimal question data
              questionData = [
                {
                  question: "Which element resonates with your true nature?",
                  isImageSelection: true,
                  personalityPoints: [
                    { "aries": 3, "taurus": 0, "gemini": 0 },
                    { "aries": 0, "taurus": 3, "gemini": 0 },
                    { "aries": 0, "taurus": 0, "gemini": 3 }
                  ]
                }
              ];
              
              // Set up personality scores
              personalityScores = {
                "aries": 0,
                "taurus": 0,
                "gemini": 0
              };
              
              // Set up personality types
              activePersonalityTypes = {
                "aries": {
                  "title": "Aries - The Fire Pioneer",
                  "description": "You embody the pioneering spirit of the ram – bold, courageous, and always ready to take the initiative.",
                  "characteristics": ["Bold", "Courageous", "Action-oriented"],
                  "strengths": "Leadership and initiative",
                  "challenges": "Patience and listening",
                  "imagePath": "assets/images/zodiac/aries-result.webp"
                },
                "taurus": {
                  "title": "Taurus - The Earth Cultivator",
                  "description": "You embody stability, persistence, and appreciation for life's sensual pleasures.",
                  "characteristics": ["Steady", "Reliable", "Determined"],
                  "strengths": "Persistence and practicality",
                  "challenges": "Adaptability and change",
                  "imagePath": "assets/images/zodiac/taurus-result.webp"
                },
                "gemini": {
                  "title": "Gemini - The Air Communicator",
                  "description": "You possess a naturally curious mind and excellent communication skills.",
                  "characteristics": ["Versatile", "Curious", "Communicative"],
                  "strengths": "Adaptability and expression",
                  "challenges": "Focus and consistency",
                  "imagePath": "assets/images/zodiac/gemini-result.webp"
                }
              };
              
              isPersonalityQuiz = true;
            } else {
              // Regular quiz fallback
              questionContainer.innerHTML = `
                <div class="question-number">Question 1 of 10</div>
                <div class="question-banner">
                  <p>What is the capital of France?</p>
                </div>
                <div class="options">
                  <button class="option" onclick="QuizProsEngine.selectAnswer(0)">London</button>
                  <button class="option" onclick="QuizProsEngine.selectAnswer(1)">Berlin</button>
                  <button class="option" onclick="QuizProsEngine.selectAnswer(2)">Paris</button>
                  <button class="option" onclick="QuizProsEngine.selectAnswer(3)">Madrid</button>
                </div>
              `;
              
              // Create minimal question data
              questionData = [
                {
                  question: "What is the capital of France?",
                  options: ["London", "Berlin", "Paris", "Madrid"],
                  answer: 2
                }
              ];
            }
          }
          
          // Reset navigation block after some time
          setTimeout(() => {
            navigationBlocked = false;
            console.log('Navigation block cleared');
          }, 5000);
        }, 500);
        
        return; // Block the navigation away
      }
    }
    
    // Track quiz abandon if a quiz was in progress
    try {
      if (currentQuiz && window.QuizProsAnalytics && window.QuizProsAnalytics.trackQuizAbandon) {
        window.QuizProsAnalytics.trackQuizAbandon(currentQuiz, currentQuestion);
      }
    } catch (e) { /* non-fatal */ }

    // If we get here, proceed with resetting
    resetQuizState();

    // Restore default page title / OG tags
    _resetPageSEO();

    // Hide quiz container
    utils.domUtils.toggleElementDisplay('main-quiz-container', false);

    // Show topic selection
    utils.domUtils.toggleElementDisplay('topic-selection-screen', true);
    utils.domUtils.toggleElementDisplay('category-selection-screen', false);
    
    // Re-initialize topic selection UI if available
    if (window.QuizProsUI && window.QuizProsUI.initTopicSelectionUI) {
      setTimeout(() => window.QuizProsUI.initTopicSelectionUI(), 100);
    }
  }

  /**
   * Add a fallback timer for quiz loading
   */
  function addLoadingFallbackTimer() {
    utils.logger.debug("Adding quiz loading fallback timer");

    // Clear any existing timeout
    if (quizLoadingTimeout) {
      clearTimeout(quizLoadingTimeout);
    }

    // Create a timeout that will force the quiz to show after delay
    const timerFn = window.QuizProsTimer ? window.QuizProsTimer.scheduleLoadingFallback : setTimeout;
    quizLoadingTimeout = timerFn(() => {
      const loadingElement = document.getElementById("loading");
      const questionContainer = document.getElementById("question-container");

      // Force hide loading and show question container if it's still showing after timeout
      if (loadingElement && loadingElement.style.display === "flex") {
        utils.logger.warn("Loading timeout triggered - forcing quiz display");
        loadingElement.style.display = "none";

        if (questionContainer) {
          questionContainer.style.display = "block";

          // Check if this is an image-based quiz
          const isImageQuiz = currentQuiz === "zodiac-sign-quiz" || 
                              currentQuiz === "spirit-animal-quiz" || 
                              (questionData[0] && questionData[0].isImageSelection) ||
                              (currentQuiz && (
                                currentQuiz.includes("image-") || 
                                currentQuiz.includes("visual-") ||
                                currentQuiz.includes("zodiac-") ||
                                currentQuiz.includes("spirit-")
                              ));
          
          // Use the appropriate function to show the question
          if (isImageQuiz) {
            try {
              showZodiacQuestion();
            } catch (error) {
              utils.logger.error("Error showing image question:", error);
              // Fallback to regular question if image question fails
              showQuestion();
            }
          } else {
            showQuestion();
          }
        }
      }
    }, config.timing.quizLoadingFallbackDelay);
  }

  /**
   * Start a quiz with the selected topic ID
   */
 /**
 * Modified startQuiz function for QuizProsEngine
 * Checks authentication before starting quizzes
 * This code should replace the startQuiz function in quiz-engine.js
 */

/**
 * Start a quiz with the selected topic ID
 * @param {string} topicId - Topic identifier
 * @param {boolean} _skipDifficultyPicker - Internal flag; true when called from picker
 */
function startQuiz(topicId, _skipDifficultyPicker) {
  // Show difficulty picker for knowledge quizzes before proceeding
  var isKnowledgeQuiz = !topicId.includes('quiz');
  if (isKnowledgeQuiz && !_skipDifficultyPicker) {
    _showDifficultyPicker(topicId);
    return;
  }

  utils.logger.info(`Starting quiz with topic ID: ${topicId}`);
  
  // Store the topic ID in localStorage so we can return to it after authentication
  try {
    localStorage.setItem('last_clicked_quiz_topic', topicId);
  } catch (e) {
    console.warn('Could not save last clicked quiz topic to localStorage:', e);
  }
  console.log(`Starting quiz: ${topicId}`);
  utils.performance.startMeasure("startQuiz");
  
  // Store quiz start time for navigation protection
  quizStartTime = new Date();
  attemptingToNavigateAway = false;
  navigationBlocked = false;

  try {
    // TEMPORARILY DISABLED: Authentication requirement for quizzes
    // Check if authentication is required for this quiz
    // General quiz (id: 'general') and Uganda quiz (id: 'uganda') are always accessible without authentication
    // All other quizzes, including personality quizzes, require authentication
    /* 
    if (topicId !== 'general' && topicId !== 'uganda') {
      // Check if user is signed in
      const isSignedIn = window.QuizProsAuth && window.QuizProsAuth.isSignedIn && window.QuizProsAuth.isSignedIn();
      
      if (!isSignedIn) {
        utils.logger.info(`Authentication required for quiz: ${topicId}`);
        console.log("Showing quiz access info modal");
        
        // Show the informational modal first
        setTimeout(function() {
          if (window.QuizProsAuthUI && typeof window.QuizProsAuthUI.promptSignInForQuiz === 'function') {
            console.log("Using QuizProsAuthUI.promptSignInForQuiz");
            window.QuizProsAuthUI.promptSignInForQuiz();
          } else {
            console.log("Falling back to forceShowSignInModal");
            if (typeof forceShowSignInModal === 'function') {
              forceShowSignInModal();
            } else {
              console.error("No authentication modal methods available");
            }
          }
        }, 100);
        
        utils.performance.endMeasure("startQuiz");
        return;
      }
    }
    */
    
    // Premium gating: check if this quiz requires a paid subscription
    if (window.QuizProsPremium && window.QuizProsPremium.requiresPremium(topicId)) {
      if (!window.QuizProsPremium.checkQuizAccess(topicId)) {
        utils.performance.endMeasure("startQuiz");
        return; // upgrade modal already shown by checkQuizAccess
      }
    }

    // Special handling for known problematic quizzes
    if (topicId === "zodiac-sign-quiz" || topicId === "spirit-animal-quiz") {
      console.log(`Special handling for ${topicId}`);
      
      // Create fallback template data if needed
      if (window.createFallbackTemplate && typeof window.createFallbackTemplate === 'function') {
        window.createFallbackTemplate(topicId);
      }
    }
    
    // Log available quiz data for debugging
    if (window.QuizProsTopics) {
      console.log("Available topics:", window.QuizProsTopics.getTopics());
      if (topicId.includes('quiz')) {
        console.log("Quiz template for this ID:", window.QuizProsTopics.getPersonalityQuizTemplate(topicId));
      }
    }

    // Reset quiz state before starting new quiz
    resetQuizState();

    // Reset wrong answer sound alternation for new quiz
    if (window.QuizProsAudio && window.QuizProsAudio.resetWrongAnswerAlternation) {
      window.QuizProsAudio.resetWrongAnswerAlternation();
    }

    // Set current quiz ID immediately
    currentQuiz = topicId;
    
    // Hide topic selection and show quiz container first
    utils.domUtils.toggleElementDisplay("topic-selection-screen", false);
    utils.domUtils.toggleElementDisplay("category-selection-screen", false);
    utils.domUtils.toggleElementDisplay("main-quiz-container", true);
    _scrollToQuizTop();

    // Use the safe analytics wrapper from utils
    if (utils.analytics && typeof utils.analytics.trackEvent === 'function') {
      utils.analytics.trackEvent(
        config.analytics.categories.quiz,
        "Started",
        topicId
      );
    }

    // Get selected topic information
    const topicsData = window.QuizProsTopics.getTopics();
    const selectedTopic = topicsData.find((t) => t.id === topicId);

    // Update page title & OG tags for the active quiz
    if (selectedTopic) {
      const quizTitle = selectedTopic.name + ' Quiz – iQuizPros';
      _updatePageSEO(quizTitle, 'Take the ' + selectedTopic.name + ' quiz on iQuizPros and share your result!');
    }

    // Check for saved progress on knowledge quizzes (personality quizzes have 'quiz' in their id)
    if (!topicId.includes('quiz')) {
      const savedProgress = _getSavedProgress(topicId);
      if (savedProgress && savedProgress.currentQuestion > 0 &&
          savedProgress.questionData && savedProgress.questionData.length > 0) {
        _showResumePrompt(topicId, savedProgress,
          function onResume() {
            // Restore state from localStorage snapshot
            questionData      = savedProgress.questionData;
            currentQuestion   = savedProgress.currentQuestion;
            score             = savedProgress.score;
            selectedAnswers   = savedProgress.selectedAnswers || [];
            currentStreak     = savedProgress.currentStreak || 0;
            bestStreak        = savedProgress.bestStreak || 0;
            isPersonalityQuiz = false;
            utils.domUtils.toggleElementDisplay('question-container', true);
            utils.domUtils.toggleElementDisplay('final-result', false);
            showQuestion();
            _updateStreakBadge();
          },
          function onFresh() {
            // Progress cleared by prompt; restart quiz from scratch
            startQuiz(topicId);
          }
        );
        utils.performance.endMeasure("startQuiz");
        return; // Pause; the prompt callbacks drive the rest
      }
    }

    // Check if this is a premium quiz - BUT ALLOW FREE ACCESS FOR ALL USERS
    if (selectedTopic && selectedTopic.isPremium) {
      isPremiumQuiz = true;

      // FREE ACCESS: Premium quizzes are now free for all users
      // No authentication or subscription required
      utils.logger.info(`Starting premium quiz with free access: ${topicId}`);

      // Track premium quiz start (for analytics only, no restrictions)
      try {
        if (utils.analytics && typeof utils.analytics.trackEvent === 'function') {
          utils.analytics.trackEvent(
            config.analytics.categories.premium,
            "FreeAccessPremiumQuizStarted",
            topicId
          );
        }
      } catch (error) {
        utils.logger.error("Error tracking premium quiz start:", error);
      }

      /* DISABLED: Premium access check - all quizzes are now free
      if (window.QuizProsUserManager) {
        const hasAccess = window.QuizProsUserManager.hasQuizAccess(topicId);
        if (!hasAccess) {
          window.QuizProsUserManager.showPremiumSignup(
            selectedTopic.premiumTier || "basic"
          );
          utils.performance.endMeasure("startQuiz");
          return;
        }
      }
      */
    } else {
      isPremiumQuiz = false;
    }

    // Hide topic selection and show quiz container
    utils.domUtils.toggleElementDisplay("topic-selection-screen", false);
    utils.domUtils.toggleElementDisplay("category-selection-screen", false);
    utils.domUtils.toggleElementDisplay("main-quiz-container", true);
    _scrollToQuizTop();

    // Hide results containers
    utils.domUtils.toggleElementDisplay("pre-result", false);
    utils.domUtils.toggleElementDisplay("final-result", false);

    // Clear previous content
    const questionContainer = document.getElementById("question-container");
    if (questionContainer) {
      questionContainer.innerHTML = "";
      questionContainer.style.display = "none"; // Hide until questions are ready
    }

    // Record quiz start time for timing analytics
    quizStartTime = new Date();

    utils.logger.debug(
      "Selected topic:",
      selectedTopic ? selectedTopic.name : "Topic not found"
    );

    // Track quiz page view
    try {
      if (utils.analytics && typeof utils.analytics.trackPageView === 'function') {
        utils.analytics.trackPageView(
          `Quiz: ${selectedTopic ? selectedTopic.name : topicId}`,
          `/quiz/${topicId}`
        );
      }
    } catch (error) {
      utils.logger.error("Error tracking page view:", error);
    }

    // Check if this is a personality quiz
    const isTemplatePersonalityQuiz =
      selectedTopic && selectedTopic.isPersonality;
    isPersonalityQuiz =
      topicId === "personality" || isTemplatePersonalityQuiz;

    // Track quiz start event
    try {
      if (window.QuizProsAnalytics && window.QuizProsAnalytics.trackQuizStart) {
        window.QuizProsAnalytics.trackQuizStart(topicId, isPersonalityQuiz ? 'personality' : 'knowledge');
      }
    } catch (e) { /* non-fatal */ }

    // C.3: Increment quizStats play count in Firestore
    try {
      if (typeof firebase !== 'undefined' && firebase.firestore) {
        firebase.firestore().collection('quizStats').doc(topicId).set(
          { playCount: firebase.firestore.FieldValue.increment(1) },
          { merge: true }
        );
      }
    } catch (e) { /* non-fatal — user may be unauthenticated */ }

    // Initialize quiz data based on type
    if (isPersonalityQuiz) {
      utils.logger.info("Initializing personality quiz:", topicId);

      if (isTemplatePersonalityQuiz) {
        const template =
          window.QuizProsTopics.getPersonalityQuizTemplate(topicId);
        utils.logger.debug(
          "Using template personality quiz:",
          template?.name
        );

        if (
          !template ||
          !template.personalityTypes ||
          !template.questions ||
          template.questions.length === 0
        ) {
          utils.logger.error("Invalid quiz template data:", template);
          throw new Error(`Invalid template data for quiz: ${topicId}`);
        }

        // Set active personality types for this quiz
        activePersonalityTypes = template.personalityTypes;

        // Initialize scores
        personalityScores = {};
        Object.keys(template.personalityTypes).forEach((type) => {
          personalityScores[type] = 0;
        });

        // Get questions from the template
        questionData = template.questions;
        currentQuizBanner = template.banner || null;

        utils.logger.debug(
          `Loaded ${questionData.length} questions for ${template.name}`
        );
      } else {
        // Original personality quiz
        utils.logger.debug("Using standard personality quiz data");
        activePersonalityTypes = window.QuizProsTopics.getPersonalityTypes();

        personalityScores = {
          leader: 0,
          thinker: 0,
          social: 0,
          intuitive: 0,
        };

        questionData =
          window.QuizProsTopics.getPersonalityQuestions(topicId) || [];
        currentQuizBanner = null;
      }
    } else {
      // Regular quiz
      utils.logger.info("Initializing regular knowledge quiz:", topicId);
      activePersonalityTypes = null;
      currentQuizBanner = null;
      questionData = window.QuizProsTopics.getQuestions(topicId) || [];

      // Fallback to general questions if needed
      if (questionData.length === 0) {
        utils.logger.warn(
          "No questions found, using general knowledge questions as fallback"
        );
        questionData = window.QuizProsTopics.getQuestions("general");
      }

      // Randomise question pool with optional difficulty filtering — cap at 10
      if (window.QuizProsQuestionBank && window.QuizProsQuestionBank.getRandomQuestions) {
        // Use new getRandomQuestions with difficulty support
        var diff = (_selectedDifficulty && _selectedDifficulty !== 'all') ? _selectedDifficulty : null;
        questionData = window.QuizProsQuestionBank.getRandomQuestions(topicId, 10, diff);
        utils.logger.info('Randomised question pool (difficulty: ' + (diff || 'all') + '): ' + questionData.length + ' questions');
      } else if (questionData.length > 10) {
        // Legacy fallback: plain shuffle
        const shuffled = questionData.slice();
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
        }
        questionData = shuffled.slice(0, 10);
        utils.logger.info('Randomised question pool: showing 10 of ' + shuffled.length);
      }
    }

    utils.logger.debug(`Quiz has ${questionData.length} questions`);

    // Final validation of question data
    if (
      !questionData ||
      !Array.isArray(questionData) ||
      questionData.length === 0
    ) {
      utils.logger.error("No questions available for quiz:", topicId);
      throw new Error(`No questions available for quiz: ${topicId}`);
    }

    // Update topic info in header
    if (selectedTopic) {
      document.getElementById("current-topic-info").textContent =
        selectedTopic.name;
    }

    // Reset quiz progress
    currentQuestion = 0;
    score = 0;

    // Update total questions counter
    document.getElementById("total-questions").textContent =
      questionData.length;

    // If user has premium, show premium badge
    if (window.QuizProsUI && window.QuizProsUI.showPremiumBadge) {
      window.QuizProsUI.showPremiumBadge();
    }

    // Show loading screen
    utils.domUtils.toggleElementDisplay("loading", true);

    // Clear any existing fallback timer
    if (quizLoadingTimeout) {
      clearTimeout(quizLoadingTimeout);
    }

    // Add new fallback timer to prevent stuck loading
    addLoadingFallbackTimer();

    // Start the quiz after a short delay
    setTimeout(() => {
      try {
        utils.domUtils.toggleElementDisplay("loading", false);
        utils.domUtils.toggleElementDisplay("question-container", true);
        
        // Check if this is an image-based quiz
        const isImageQuiz = currentQuiz === "zodiac-sign-quiz" || 
                            currentQuiz === "spirit-animal-quiz" || 
                            (questionData[0] && questionData[0].isImageSelection);
        
        // Use the appropriate function to show the question
        if (isImageQuiz) {
          showZodiacQuestion();
        } else {
          showQuestion();
        }
      } catch (error) {
        utils.logger.error("Error showing question:", error);
        utils.domUtils.setInnerHTML(
          "error-message",
          "There was an error loading the quiz. Please try again."
        );
        utils.domUtils.toggleElementDisplay("error-modal", true);

        // Clean up
        utils.domUtils.toggleElementDisplay("main-quiz-container", false);
        utils.domUtils.toggleElementDisplay("topic-selection-screen", true);
      }
    }, 1500);

    utils.performance.endMeasure("startQuiz");
  } catch (error) {
    // Comprehensive error handling
    utils.logger.error("Error starting quiz:", error);
    utils.domUtils.setInnerHTML(
      "error-message",
      "Sorry, this quiz is currently unavailable. Please try another quiz."
    );
    utils.domUtils.toggleElementDisplay("error-modal", true);

    // Reset to a clean state
    resetQuizState();

    // Return to topic selection
    utils.domUtils.toggleElementDisplay("main-quiz-container", false);
    utils.domUtils.toggleElementDisplay("topic-selection-screen", true);

    // Re-initialize topic selection UI
    if (window.QuizProsUI && window.QuizProsUI.initTopicSelectionUI) {
      setTimeout(() => window.QuizProsUI.initTopicSelectionUI(), 100);
    }

    utils.performance.endMeasure("startQuiz");
  }
}

  /**
   * Show the current question
   */
  function showQuestion() {
    utils.logger.info(`Showing question ${currentQuestion + 1} of ${questionData.length}`);
    utils.performance.startMeasure('showQuestion');
    _questionStart = Date.now();
    
    try {
      // Get the current question data
      const question = questionData[currentQuestion];

      if (!question) {
        utils.logger.error('Invalid question data:', question);
        throw new Error('Invalid question data');
      }

      // Get the question container
      const questionContainer = document.getElementById('question-container');
      if (!questionContainer) {
        utils.logger.error('Question container not found');
        throw new Error('Question container not found');
      }

      // Build and set question HTML via renderer
      const html = window.QuizProsRenderer
        ? window.QuizProsRenderer.renderQuestion(question, currentQuestion, questionData.length)
        : '<p>' + question.question + '</p>';
      utils.domUtils.setInnerHTML('question-container', html);

      // Fade-in animation — reset then re-apply class to replay
      questionContainer.classList.remove('quiz-question-animate');
      void questionContainer.offsetWidth; // trigger reflow
      questionContainer.classList.add('quiz-question-animate');

      // Update progress bar
      const progressPercentage = ((currentQuestion) / questionData.length) * 100;
      const progressBar = document.getElementById('progress');
      if (progressBar) {
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.setAttribute('aria-valuenow', String(Math.round(progressPercentage)));
      }

      // Show the question container
      questionContainer.style.display = 'block';

      // Keyboard navigation for quiz options (radiogroup arrow-key pattern)
      const optionButtons = questionContainer.querySelectorAll('.option[role="radio"]');
      optionButtons.forEach((btn, idx) => {
        btn.addEventListener('keydown', function(e) {
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            const next = optionButtons[Math.min(idx + 1, optionButtons.length - 1)];
            if (next) next.focus();
          } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const prev = optionButtons[Math.max(idx - 1, 0)];
            if (prev) prev.focus();
          }
        });
      });

      // Move focus to first option so keyboard users can navigate immediately
      setTimeout(function() {
        const firstOption = questionContainer.querySelector('.option[role="radio"]');
        if (firstOption) firstOption.focus();
      }, 80);

      // Inject timer toggle (once, on first question)
      if (currentQuestion === 0) _injectTimerToggle();

      // Start countdown if timed mode is on
      if (_timedMode && !isPersonalityQuiz) _startQuestionTimer();

      // C.7: Swipe left = skip question (personality) / nothing; right = go back not supported
      // Attach swipe listener to the question container (replaces any previous listener)
      _attachSwipeHandler(questionContainer);

      utils.performance.endMeasure('showQuestion');
    } catch (error) {
      utils.logger.error('Error showing question:', error);
      utils.performance.endMeasure('showQuestion');
      
      // Show error message
      alert('There was an error loading the question. Please try again.');
      
      // Return to topic selection
      resetAndReturn();
    }
  }
  
  /**
   * Show a zodiac or image-based quiz question
   */
  function showZodiacQuestion() {
    utils.logger.info(`Showing image question ${currentQuestion + 1} of ${questionData.length}`);
    utils.performance.startMeasure('showZodiacQuestion');
    
    try {
      // Validate quiz state
      if (!questionData || !Array.isArray(questionData) || questionData.length === 0) {
        throw new Error('No question data available');
      }
      
      if (currentQuestion >= questionData.length) {
        utils.logger.warn('Question index out of bounds, showing results');
        showResults();
        return;
      }
      
      // Get the current question data
      const question = questionData[currentQuestion];
      
      if (!question || (!question.options && !question.imageOptions)) {
        utils.logger.error('Invalid image question data:', question);
        throw new Error('Invalid question data structure');
      }
      
      // Get the question container
      const questionContainer = document.getElementById('question-container');
      if (!questionContainer) {
        utils.logger.error('Question container not found');
        throw new Error('Question container not found');
      }
      
      // Build and set image question HTML via renderer
      const html = window.QuizProsRenderer
        ? window.QuizProsRenderer.renderZodiacQuestion(question, currentQuestion, questionData.length)
        : '<p>' + question.question + '</p>';
      utils.domUtils.setInnerHTML('question-container', html);
      
      // Update progress bar
      const progressPercentage = ((currentQuestion) / questionData.length) * 100;
      const progressBar = document.getElementById('progress');
      if (progressBar) {
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.setAttribute('aria-valuenow', String(Math.round(progressPercentage)));
      }

      // Show the question container
      questionContainer.style.display = 'block';

      utils.performance.endMeasure('showZodiacQuestion');
    } catch (error) {
      utils.logger.error('Error showing image question:', error);
      utils.performance.endMeasure('showZodiacQuestion');
      
      // Show error message
      alert('There was an error loading the question. Please try again.');
      
      // Return to topic selection
      resetAndReturn();
    }
  }
  
  /**
   * Handle answer selection
   * @param {number} selectedIndex - Index of the selected answer
   */
  function selectAnswer(selectedIndex) {
    utils.logger.info(`Selected answer ${selectedIndex} for question ${currentQuestion + 1}`);
    utils.performance.startMeasure('selectAnswer');
    
    try {
      // Get the current question
      const question = questionData[currentQuestion];
      
      if (!question) {
        utils.logger.error('Invalid question data for answer selection');
        throw new Error('Invalid question data');
      }
      
      // Track the selected answer
      selectedAnswers[currentQuestion] = selectedIndex;
      
      // Handle different quiz types
      if (isPersonalityQuiz) {
        // For personality quiz, update personality scores
        if (question.personalityPoints && question.personalityPoints[selectedIndex]) {
          const points = question.personalityPoints[selectedIndex];
          
          // Add points to each personality type
          Object.keys(points).forEach(type => {
            if (personalityScores[type] !== undefined) {
              personalityScores[type] += points[type];
            }
          });
          
          utils.logger.debug('Updated personality scores:', personalityScores);
        }
      } else {
        // Stop the countdown as soon as an answer is selected
        _stopQuestionTimer();

        // For regular quiz, check if answer is correct
        if (question.answer === selectedIndex) {
          score++;

          // Update streak
          currentStreak++;
          if (currentStreak > bestStreak) bestStreak = currentStreak;
          _updateStreakBadge();

          // Play correct answer sound if available
          if (window.QuizProsAudio && window.QuizProsAudio.playCorrectSound) {
            window.QuizProsAudio.playCorrectSound();
          }

          // Show visual feedback for correct answer
          const options = document.querySelectorAll('.option');
          if (options && options[selectedIndex]) {
            options[selectedIndex].classList.add('correct');
          }
        } else {
          // Reset streak on wrong answer
          currentStreak = 0;
          _updateStreakBadge();

          // Play wrong answer sound if available
          if (window.QuizProsAudio && window.QuizProsAudio.playWrongSound) {
            window.QuizProsAudio.playWrongSound();
          }

          // Show visual feedback for incorrect answer
          const options = document.querySelectorAll('.option');
          if (options) {
            if (options[selectedIndex]) {
              options[selectedIndex].classList.add('incorrect');
            }

            if (options[question.answer]) {
              options[question.answer].classList.add('correct');
            }
          }
        }
      }
      
      // Update aria-checked state on radio options (accessibility)
      const radioOptions = document.querySelectorAll('.option[role="radio"]');
      radioOptions.forEach((opt, i) => {
        opt.setAttribute('aria-checked', i === selectedIndex ? 'true' : 'false');
      });

      // Track question answered event
      try {
        if (window.QuizProsAnalytics && window.QuizProsAnalytics.trackQuestionAnswered) {
          const timeSpent = _questionStart ? Math.round((Date.now() - _questionStart) / 1000) : null;
          const correct = isPersonalityQuiz ? null : (questionData[currentQuestion] && questionData[currentQuestion].answer === selectedIndex);
          window.QuizProsAnalytics.trackQuestionAnswered(currentQuiz, currentQuestion, timeSpent, correct);
        }
      } catch (e) { /* non-fatal */ }

      // C.6: Write aggregated response to Firestore + show "How others answered"
      if (!isPersonalityQuiz) {
        _recordAndShowHowOthersAnswered(currentQuestion, selectedIndex);
      }

      // Haptic feedback for mobile (where supported)
      if (navigator.vibrate) {
        try {
          if (!isPersonalityQuiz) {
            // Distinct patterns: correct = short-pause-short, wrong = long
            const isCorrect = questionData[currentQuestion] && questionData[currentQuestion].answer === selectedIndex;
            navigator.vibrate(isCorrect ? [40, 30, 40] : [120]);
          } else {
            navigator.vibrate(30); // Neutral tap for personality quizzes
          }
        } catch (e) { /* ignore — vibrate may be blocked */ }
      }

      // Disable all options after selection
      const allOptions = document.querySelectorAll('.option');
      allOptions.forEach(option => {
        option.disabled = true;
        option.style.pointerEvents = 'none';
      });

      // Show explanation / fun fact if available (knowledge quizzes only)
      const explanation = !isPersonalityQuiz && (question.explanation || question.funFact);
      if (explanation) {
        const quizContainer = document.getElementById('quiz-container') ||
                              document.getElementById('main-quiz-container') ||
                              document.querySelector('.quiz-content');
        if (quizContainer) {
          const existing = quizContainer.querySelector('.explanation-banner');
          if (existing) existing.remove();
          const banner = document.createElement('div');
          banner.className = 'explanation-banner';
          banner.setAttribute('aria-live', 'polite');
          banner.innerHTML = '<span class="explanation-icon">\uD83D\uDCA1</span> <span class="explanation-text">' +
            explanation.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
          quizContainer.appendChild(banner);
        }
      }

      // Move to next question after a short delay (longer when explanation shown)
      const delay = explanation ? 2800 : 1000;
      setTimeout(() => {
        currentQuestion++;

        // Persist progress after advancing (knowledge quizzes only)
        _saveProgress();

        // Check if quiz is complete
        if (currentQuestion >= questionData.length) {
          _clearProgress(currentQuiz); // Clear on completion
          showResults();
        } else {
          // Show next question
          // Check if this is an image-based quiz
          const isImageQuiz = currentQuiz === "zodiac-sign-quiz" ||
                              currentQuiz === "spirit-animal-quiz" ||
                              (questionData[currentQuestion] && questionData[currentQuestion].isImageSelection);

          if (isImageQuiz) {
            showZodiacQuestion();
          } else {
            showQuestion();
          }
        }
      }, delay);
      
      utils.performance.endMeasure('selectAnswer');
    } catch (error) {
      utils.logger.error('Error selecting answer:', error);
      utils.performance.endMeasure('selectAnswer');
      
      // Show error message
      alert('There was an error processing your answer. Please try again.');
      
      // Try to continue with next question
      currentQuestion++;
      
      if (currentQuestion >= questionData.length) {
        showResults();
      } else {
        if (currentQuiz === 'zodiac-sign-quiz') {
          showZodiacQuestion();
        } else {
          showQuestion();
        }
      }
    }
  }
  
  /**
   * Show quiz results
   */
  function showResults() {
    utils.logger.info('Showing quiz results');
    utils.performance.startMeasure('showResults');
    
    try {
      // Ensure we're actually done with questions
      if (currentQuestion < questionData.length - 1) {
        utils.logger.warn('Attempting to show results before quiz completion');
        return;
      }
      
      // Clean up quiz state
      utils.domUtils.toggleElementDisplay('question-container', false);
      utils.domUtils.toggleElementDisplay('loading', false);
      
      // Clear any pending timeouts
      if (quizLoadingTimeout) {
        clearTimeout(quizLoadingTimeout);
        quizLoadingTimeout = null;
      }
      
      // Update progress bar to 100%
      const progressBar = document.getElementById('progress');
      if (progressBar) {
        progressBar.style.width = '100%';
        progressBar.setAttribute('aria-valuenow', '100');
      }
      
      // Calculate quiz duration
      let quizDuration = 0;
      if (quizStartTime) {
        quizDuration = Math.floor((new Date() - quizStartTime) / 1000);
      }
      
      // Track quiz completion
      try {
        if (utils.analytics && typeof utils.analytics.trackEvent === 'function') {
          utils.analytics.trackEvent(
            config.analytics.categories.quiz,
            'Completed',
            currentQuiz,
            {
              score: isPersonalityQuiz ? 0 : score,
              duration: quizDuration,
              questions: questionData.length
            }
          );
        }
      } catch (error) {
        utils.logger.error('Error tracking quiz completion:', error);
      }

      // Track structured quiz_complete event
      try {
        if (window.QuizProsAnalytics && window.QuizProsAnalytics.trackQuizComplete) {
          const pct = isPersonalityQuiz ? null : Math.round((score / questionData.length) * 100);
          window.QuizProsAnalytics.trackQuizComplete(currentQuiz, pct, quizDuration);
        }
      } catch (e) { /* non-fatal */ }

      // Handle different quiz types
      if (isPersonalityQuiz) {
        // Determine dominant personality type via scoring module
        const dominantType = window.QuizProsScoring
          ? window.QuizProsScoring.getDominantType(personalityScores)
          : Object.keys(personalityScores).reduce((a, b) => personalityScores[a] > personalityScores[b] ? a : b);

        utils.logger.debug('Dominant personality type:', dominantType);

        const personalityType = activePersonalityTypes[dominantType];
        if (!personalityType) {
          utils.logger.error('Invalid personality type result:', dominantType);
          throw new Error('Invalid personality result');
        }

        // Show final result
        utils.domUtils.toggleElementDisplay('final-result', true);
        document.getElementById('result-score').textContent = '';
        document.getElementById('total-questions').textContent = '';

        // Build and set result HTML via renderer
        const resultHTML = window.QuizProsRenderer
          ? window.QuizProsRenderer.renderPersonalityResult(personalityType)
          : '<p>' + personalityType.title + '</p>';
        utils.domUtils.setInnerHTML('result-message', resultHTML);

        // Animate result card entrance (personality)
        const finalResultEl = document.getElementById('final-result');
        if (finalResultEl) {
          finalResultEl.classList.remove('score-reveal-animate');
          void finalResultEl.offsetWidth;
          finalResultEl.classList.add('score-reveal-animate');
        }

        // Update page title / OG for sharing
        _updatePageSEO(
          "I\u2019m " + personalityType.title + " \u2013 iQuizPros",
          "I just discovered my personality type on iQuizPros. Find out yours!"
        );

        document.getElementById('whatsapp-share-again').innerHTML =
          '<i class="fab fa-whatsapp"></i> Share Your Result';

      } else {
        // Regular quiz — show score
        utils.domUtils.toggleElementDisplay('final-result', true);
        document.getElementById('result-score').textContent = score;
        document.getElementById('total-questions').textContent = questionData.length;

        // Get score message from scoring module
        const scoring = window.QuizProsScoring
          ? window.QuizProsScoring.getScoreMessage(score, questionData.length)
          : { message: 'Quiz complete!', emoji: '🏆', shouldCelebrate: false };

        // Update result badge
        document.getElementById('result-badge').textContent = scoring.emoji;

        // Play celebration for good scores
        if (scoring.shouldCelebrate) {
          const percentage = Math.round((score / questionData.length) * 100);
          utils.logger.info(`Celebrating good score: ${percentage}%`);

          if (window.QuizProsAudio && window.QuizProsAudio.playCelebrationSound) {
            setTimeout(() => { window.QuizProsAudio.playCelebrationSound(); }, 500);
          }

          if (typeof confetti === 'function') {
            setTimeout(() => {
              const duration = 3000;
              const animationEnd = Date.now() + duration;
              const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
              function randomInRange(min, max) { return Math.random() * (max - min) + min; }
              const interval = setInterval(function() {
                const timeLeft = animationEnd - Date.now();
                if (timeLeft <= 0) { return clearInterval(interval); }
                const particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
              }, 250);
            }, 300);
          } else {
            utils.logger.warn('Confetti library not loaded');
          }
        }

        // Build and set result HTML via renderer
        const resultHTML = window.QuizProsRenderer
          ? window.QuizProsRenderer.renderScoreResult(score, questionData.length)
          : '<p>Score: ' + score + '/' + questionData.length + '</p>';
        utils.domUtils.setInnerHTML('result-message', resultHTML);

        // Animate result card pop-in
        const finalResultElKnowledge = document.getElementById('final-result');
        if (finalResultElKnowledge) {
          finalResultElKnowledge.classList.remove('score-reveal-animate');
          void finalResultElKnowledge.offsetWidth;
          finalResultElKnowledge.classList.add('score-reveal-animate');
        }

        // Score count-up animation on #result-score
        const scoreEl = document.getElementById('result-score');
        if (scoreEl && score > 0) {
          var targetScore = score;
          var startScore = 0;
          var duration = 700;
          var startTime = null;
          function countUp(timestamp) {
            if (!startTime) startTime = timestamp;
            var elapsed = timestamp - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            scoreEl.textContent = Math.round(eased * targetScore);
            if (progress < 1) requestAnimationFrame(countUp);
            else scoreEl.textContent = targetScore;
          }
          scoreEl.textContent = '0';
          requestAnimationFrame(countUp);
        }

        // Update page title / OG for sharing
        const _quizLabel = (function() {
          try {
            const t = window.QuizProsTopics && window.QuizProsTopics.getTopics().find(function(t){ return t.id === currentQuiz; });
            return t ? t.name : currentQuiz;
          } catch(e) { return currentQuiz; }
        })();
        _updatePageSEO(
          "I scored " + score + "/" + questionData.length + " on " + _quizLabel + " \u2013 iQuizPros",
          "Can you beat my score? Play " + _quizLabel + " on iQuizPros!"
        );

        // Append best streak stat to result area (if streak >= 2)
        if (bestStreak >= 2) {
          var resultMsgEl = document.getElementById('result-message');
          if (resultMsgEl) {
            var streakStat = document.createElement('div');
            streakStat.style.cssText = 'margin-top:10px;font-size:0.9rem;color:#128c7e;font-weight:600;';
            streakStat.innerHTML = '\uD83D\uDD25 Best streak: <strong>' + bestStreak + '</strong> correct in a row';
            resultMsgEl.appendChild(streakStat);
          }
        }

        // Remove streak badge when showing results
        _removeStreakBadge();
      }
      
      // ── C.5: Inject "Share Result" Canvas card button ──────────────────────
      _injectShareButton();
      _injectPDFButton();   // Phase 10.4

      // ── Phase 10.6: Embed CTA ("Play on iQuizPros") ──────────────────────
      if (document.body.classList.contains('embed-mode')) {
        var resultContainer = document.getElementById('result-message');
        if (resultContainer) {
          var existingCta = resultContainer.querySelector('.embed-play-cta');
          if (!existingCta) {
            var ctaLink = document.createElement('a');
            ctaLink.className = 'embed-play-cta';
            ctaLink.href = 'https://iquizpro.com';
            ctaLink.target = '_blank';
            ctaLink.rel = 'noopener noreferrer';
            ctaLink.textContent = 'Play more quizzes on iQuizPros →';
            resultContainer.appendChild(ctaLink);
          }
        }
      }

      // Save quiz result to history (localStorage + Firestore for authenticated users)
      try {
        if (window.QuizProsUserManager && typeof window.QuizProsUserManager.saveQuizResult === 'function') {
          const dominantTypeKey = isPersonalityQuiz
            ? (window.QuizProsScoring
                ? window.QuizProsScoring.getDominantType(personalityScores)
                : Object.keys(personalityScores).reduce((a, b) => personalityScores[a] > personalityScores[b] ? a : b))
            : null;
          const personalityTitle = dominantTypeKey && activePersonalityTypes[dominantTypeKey]
            ? activePersonalityTypes[dominantTypeKey].title
            : null;

          window.QuizProsUserManager.saveQuizResult(currentQuiz, {
            quizId:           currentQuiz,
            quizTitle:        currentQuiz,
            score:            isPersonalityQuiz ? null : score,
            total:            questionData.length,
            personalityType:  personalityTitle,
            isPersonalityQuiz,
            completedAt:      new Date().toISOString()
          });
        }
      } catch (histErr) {
        utils.logger.warn('Could not save quiz history:', histErr);
      }

      // Set up event listeners for result buttons
      const tryAgainButton = document.getElementById('try-again');
      if (tryAgainButton) {
        // Remove existing event listeners
        const newTryAgainButton = tryAgainButton.cloneNode(true);
        tryAgainButton.parentNode.replaceChild(newTryAgainButton, tryAgainButton);
        
        // Add new event listener
        newTryAgainButton.addEventListener('click', function() {
          // Reset quiz state
          resetQuizState();
          
          // Start the quiz again
          startQuiz(currentQuiz);
        });
      }
      
      // Set up share buttons
      const shareButtons = [
        document.getElementById('whatsapp-share-first'),
        document.getElementById('whatsapp-share-again')
      ];
      
      shareButtons.forEach(button => {
        if (button) {
          // Remove existing event listeners
          const newButton = button.cloneNode(true);
          button.parentNode.replaceChild(newButton, button);
          
          // Add new event listener
          newButton.addEventListener('click', function() {
            // Create share text
            let shareText = '';
            
            if (isPersonalityQuiz) {
              // Get personality type
              const dominantType = Object.keys(personalityScores).reduce((a, b) => 
                personalityScores[a] > personalityScores[b] ? a : b
              );
              
              const personalityType = activePersonalityTypes[dominantType];
              
              if (personalityType) {
                shareText = `I took the ${currentQuiz} quiz and I'm a "${personalityType.title}"! Find out your personality type: ${window.location.href}`;
              } else {
                shareText = `I just took a personality quiz! Find out your personality type: ${window.location.href}`;
              }
            } else {
              // Regular quiz
              shareText = `I scored ${score}/${questionData.length} on the ${currentQuiz} quiz! Can you beat my score? ${window.location.href}`;
            }
            
            // Encode share text
            const encodedText = encodeURIComponent(shareText);
            
            // Create WhatsApp share URL
            const whatsappUrl = `https://wa.me/?text=${encodedText}`;
            
            // Open WhatsApp share
            window.open(whatsappUrl, '_blank');
            
            // If this is the first share button, show final result
            if (button.id === 'whatsapp-share-first') {
              utils.domUtils.toggleElementDisplay('pre-result', false);
              utils.domUtils.toggleElementDisplay('final-result', true);
            }
            
            // Track share event
            try {
              if (utils.analytics && typeof utils.analytics.trackEvent === 'function') {
                utils.analytics.trackEvent(
                  config.analytics.categories.social,
                  'Share',
                  'WhatsApp'
                );
              }
            } catch (error) {
              utils.logger.error('Error tracking share event:', error);
            }
          });
        }
      });
      
      // Signal quiz completion (PWA install prompt + other listeners)
      // 10.2: include correctCount for daily leaderboard
      try {
        document.dispatchEvent(new CustomEvent('quizpros:quiz:completed', {
          detail: { quizId: currentQuiz, isPersonality: isPersonalityQuiz, correctCount: isPersonalityQuiz ? null : score }
        }));
      } catch (e) { /* non-fatal */ }

      utils.performance.endMeasure('showResults');
    } catch (error) {
      utils.logger.error('Error showing results:', error);
      utils.performance.endMeasure('showResults');
      
      // Show error message
      alert('There was an error displaying your results. Please try again.');
      
      // Return to topic selection
      resetAndReturn();
    }
  }

  // createFallbackTemplate has moved to quiz-renderer.js (window.QuizProsRenderer.createFallbackTemplate).
  // window.createFallbackTemplate backward-compat alias is set by quiz-renderer.js.
  // Keeping a local guard in case quiz-renderer.js didn't load:
  if (!window.createFallbackTemplate) {
    window.createFallbackTemplate = function(quizType) {
    console.log(`createFallbackTemplate called but quiz-renderer.js not loaded for ${quizType}`);
    
    // Create fallback templates for specific quiz types
    if (quizType === "zodiac-sign-quiz") {
      const zodiacTemplate = {
        "id": "zodiac-sign-quiz",
        "name": "Discover Your True Zodiac Sign",
        "description": "Your birth date may say one thing, but your personality reveals your true cosmic alignment",
        "icon": "fas fa-star",
        "isPersonality": true,
        "isImageQuiz": true,
        "category": "image-quizzes",
        "banner": "assets/images/zodiac/zodiac-banner.webp",
        "personalityTypes": {
          "aries": {
            "title": "Aries - The Fire Pioneer",
            "description": "You embody the pioneering spirit of the ram – bold, courageous, and always ready to take the initiative.",
            "characteristics": ["Natural leadership", "Courageous", "Energetic", "Direct", "Independent"],
            "strengths": "Your ability to make decisions quickly and take initiative makes you excellent in leadership roles.",
            "challenges": "Sometimes you may need to slow down and listen more to others' input.",
            "imagePath": "assets/images/zodiac/aries-result.webp"
          },
          "taurus": {
            "title": "Taurus - The Earth Cultivator",
            "description": "You embody stability, persistence, and appreciation for life's sensual pleasures.",
            "characteristics": ["Reliable", "Patient", "Practical", "Determined", "Loyal"],
            "strengths": "Your persistence and attention to detail allow you to succeed where others might give up.",
            "challenges": "You might sometimes be resistant to necessary change.",
            "imagePath": "assets/images/zodiac/taurus-result.webp"
          },
          "gemini": {
            "title": "Gemini - The Air Communicator",
            "description": "You possess a naturally curious mind and excellent communication skills.",
            "characteristics": ["Communicative", "Curious", "Adaptable", "Versatile", "Quick-thinking"],
            "strengths": "Your versatility and communication skills help you thrive in constantly changing environments.",
            "challenges": "You might sometimes scatter energy in too many directions.",
            "imagePath": "assets/images/zodiac/gemini-result.webp"
          }
        },
        "questions": [
          {
            "question": "Which celestial body represents your inner energy?",
            "isImageSelection": true,
            "options": [
              { "text": "Sun", "image": "assets/images/zodiac/sun.webp" },
              { "text": "Moon", "image": "assets/images/zodiac/moon.webp" },
              { "text": "Mars", "image": "assets/images/zodiac/mars.webp" }
            ],
            "personalityPoints": [
              { "aries": 3, "taurus": 1, "gemini": 1 },
              { "aries": 1, "taurus": 3, "gemini": 1 },
              { "aries": 1, "taurus": 1, "gemini": 3 }
            ]
          },
          {
            "question": "Which element resonates with your true nature?",
            "isImageSelection": true,
            "options": [
              { "text": "Fire", "image": "assets/images/zodiac/fire1.webp" },
              { "text": "Earth", "image": "assets/images/zodiac/earth1.webp" },
              { "text": "Air", "image": "assets/images/zodiac/air1.webp" }
            ],
            "personalityPoints": [
              { "aries": 3, "taurus": 0, "gemini": 0 },
              { "aries": 0, "taurus": 3, "gemini": 0 },
              { "aries": 0, "taurus": 0, "gemini": 3 }
            ]
          }
        ]
      };
      
      // Register the template
      if (window.QuizProsTopics && window.QuizProsTopics.registerQuizTemplate) {
        window.QuizProsTopics.registerQuizTemplate(zodiacTemplate, 'image-quizzes');
        console.log("Registered fallback zodiac quiz template");
      }
    }
    
    // Spirit animal quiz fallback
    if (quizType === "spirit-animal-quiz") {
      const spiritAnimalTemplate = {
        "id": "spirit-animal-quiz",
        "name": "Discover Your Spirit Animal",
        "description": "Find the animal that resonates with your inner self",
        "icon": "fas fa-paw",
        "isPersonality": true,
        "isImageQuiz": true,
        "category": "image-quizzes",
        "personalityTypes": {
          "wolf": {
            "title": "Wolf - The Loyal Protector",
            "description": "You are fiercely loyal and protective of your pack, with strong instincts and deep connections to those you care about.",
            "characteristics": ["Loyal", "Protective", "Intuitive", "Social", "Independent"],
            "strengths": "Your loyalty and protective nature make you a trusted friend and ally.",
            "challenges": "Remember to take time for yourself outside of caring for others.",
            "imagePath": "assets/images/spirit-animals/wolf-result.webp"
          },
          "eagle": {
            "title": "Eagle - The Visionary",
            "description": "You see the big picture and possess great vision, soaring above mundane concerns to focus on higher goals and perspectives.",
            "characteristics": ["Visionary", "Focused", "Free-spirited", "Powerful", "Precise"],
            "strengths": "Your ability to see the big picture helps you achieve your lofty goals.",
            "challenges": "Staying connected to everyday practical matters can be difficult.",
            "imagePath": "assets/images/spirit-animals/eagle-result.webp"
          },
          "bear": {
            "title": "Bear - The Strong Guardian",
            "description": "You embody strength and wisdom as a natural guardian, with tremendous power that you use judiciously and a deep connection to nature.",
            "characteristics": ["Strong", "Introspective", "Confident", "Protective", "Wise"],
            "strengths": "Your inner strength and wisdom make you a powerful force.",
            "challenges": "Finding balance between solitude and social connection.",
            "imagePath": "assets/images/spirit-animals/bear-result.webp"
          }
        },
        "questions": [
          {
            "question": "Which environment do you feel most at home in?",
            "isImageSelection": true,
            "options": [
              { "text": "Forest", "image": "assets/images/spirit-animals/wolf.webp" },
              { "text": "Mountains", "image": "assets/images/spirit-animals/eagle.webp" },
              { "text": "Wilderness", "image": "assets/images/spirit-animals/bear.webp" }
            ],
            "personalityPoints": [
              { "wolf": 3, "eagle": 1, "bear": 1 },
              { "wolf": 1, "eagle": 3, "bear": 1 },
              { "wolf": 1, "eagle": 1, "bear": 3 }
            ]
          },
          {
            "question": "How do you approach challenges in your life?",
            "isImageSelection": true,
            "options": [
              { "text": "With loyalty and teamwork", "image": "assets/images/spirit-animals/wolf.webp" },
              { "text": "With vision and perspective", "image": "assets/images/spirit-animals/eagle.webp" },
              { "text": "With strength and wisdom", "image": "assets/images/spirit-animals/bear.webp" }
            ],
            "personalityPoints": [
              { "wolf": 3, "eagle": 0, "bear": 0 },
              { "wolf": 0, "eagle": 3, "bear": 0 },
              { "wolf": 0, "eagle": 0, "bear": 3 }
            ]
          }
        ]
      };
      
      // Register the template
      if (window.QuizProsTopics && window.QuizProsTopics.registerQuizTemplate) {
        window.QuizProsTopics.registerQuizTemplate(spiritAnimalTemplate, 'image-quizzes');
        console.log("Registered fallback spirit animal quiz template");
      }
    }
    };  // end window.createFallbackTemplate fallback function
  }   // end if (!window.createFallbackTemplate)

  /**
   * Start an AI-generated quiz from Cloud Function data.
   * Converts the generated quiz format into the engine's question format and begins the quiz.
   * @param {Object} quizData - { id, title, topic, questions: [{question, options, correctIndex}] }
   * @returns {boolean} true if started, false if invalid data
   */
  function startGeneratedQuiz(quizData) {
    utils.logger.info('Starting generated quiz: ' + (quizData && quizData.id));

    if (!quizData || !Array.isArray(quizData.questions) || !quizData.questions.length) {
      utils.logger.error('startGeneratedQuiz: invalid quiz data');
      return false;
    }

    resetQuizState();

    // Convert generated format → engine format
    // Generated: { id, question, options, correctIndex, explanation }
    // Engine expects: { question, options, answer }
    questionData = quizData.questions.map(function(q) {
      return {
        question:    q.question,
        options:     q.options,
        answer:      q.correctIndex,
        explanation: q.explanation || ''
      };
    });

    currentQuiz       = 'ai-' + quizData.id;
    isPersonalityQuiz = false;
    isPremiumQuiz     = false;
    quizStartTime     = new Date();
    currentQuestion   = 0;
    score             = 0;

    // Hide topic / category screens; show quiz container
    utils.domUtils.toggleElementDisplay('topic-selection-screen', false);
    utils.domUtils.toggleElementDisplay('category-selection-screen', false);
    utils.domUtils.toggleElementDisplay('main-quiz-container', true);
    _scrollToQuizTop();
    utils.domUtils.toggleElementDisplay('pre-result', false);
    utils.domUtils.toggleElementDisplay('final-result', false);

    var topicInfoEl = document.getElementById('current-topic-info');
    if (topicInfoEl) topicInfoEl.textContent = quizData.title || 'AI Quiz';

    var totalQEl = document.getElementById('total-questions');
    if (totalQEl) totalQEl.textContent = questionData.length;

    utils.domUtils.toggleElementDisplay('loading', true);
    setTimeout(function() {
      utils.domUtils.toggleElementDisplay('loading', false);
      utils.domUtils.toggleElementDisplay('question-container', true);
      showQuestion();
    }, 800);

    return true;
  }

  // Public API
  return {
    // State management
    resetQuizState: resetQuizState,
    resetAndReturn: resetAndReturn,

    // Quiz flow
    startQuiz: startQuiz,
    startGeneratedQuiz: startGeneratedQuiz,
    selectAnswer: selectAnswer,
    showQuestion: showQuestion,
    showZodiacQuestion: showZodiacQuestion,
    showResults: showResults,

    // Getters
    getCurrentQuiz: function () {
      return currentQuiz;
    },
    getCurrentQuestion: function () {
      return currentQuestion;
    },
    getScore: function () {
      return score;
    },
    getQuestionData: function () {
      return questionData;
    },
    getSelectedAnswers: function () {
      return selectedAnswers;
    },
    isPremium: function () {
      return isPremiumQuiz;
    },

    // Initialization
    init: function () {
      utils.logger.info("Initializing QuizPros Engine");
      return this;
    }
  };
})();

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  QuizProsEngine.init();
  
  // Add event listener for back button
  const backButton = document.getElementById('back-to-topics');
  if (backButton) {
    backButton.addEventListener('click', function() {
      QuizProsEngine.resetAndReturn();
    });
  }
});
