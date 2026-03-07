/**
 * UI Manager Module for IQuizPros
 * Handles UI interactions, animations, and dynamic UI updates
 */

window.QuizProsUI = (function() {
  // Private variables
  const config = window.QuizProsConfig;
  const utils = window.QuizProsUtils;
  
  // Track active screens and modals
  let activeScreen = null;
  let activeModal = null;
  let isLoading = false;
  let topicSelectionFallbackTimer = null;
  
  /**
   * Initialize topic selection UI
   */
  function initTopicSelectionUI() {
    utils.logger.info('Initializing topic selection UI');
    utils.performance.startMeasure('initTopicSelectionUI');
    
    try {
      const topicScreen = document.getElementById('topic-selection-screen');
      
      if (!topicScreen) {
        utils.logger.error('Topic selection container not found');
        utils.performance.endMeasure('initTopicSelectionUI');
        return;
      }
      
      // Get topics data from the topics module
      const topicsData = window.QuizProsTopics ? window.QuizProsTopics.getTopics() : [];

      // If no topics module, use fallback data
      const regularQuizzes = topicsData.filter(topic => !topic.isPersonality && topic.id !== 'personality' && topic.category !== 'healthcare');
      const healthcareQuizzes = topicsData.filter(topic => topic.category === 'healthcare');

      // ── Hero Section ────────────────────────────────────────────────────────
      let html = `
        <div class="hero-section">
          <h1 class="hero-title">Discover Yourself</h1>
          <p class="hero-subtitle">Take personality quizzes and knowledge challenges — then share your results!</p>
          <div class="hero-cta">
            <button class="btn-hero" onclick="document.getElementById('knowledge-section').scrollIntoView({behavior:'smooth'})">
              <i class="fas fa-play"></i> Start a Quiz
            </button>
            <a href="/premium.html" class="btn-hero-outline">
              <i class="fas fa-crown"></i> Go Premium
            </a>
          </div>
        </div>
      `;

      // ── Continue Where You Left Off ─────────────────────────────────────────
      const savedProgress = [];
      topicsData.forEach(function(topic) {
        if (topic.isPersonality) return; // progress saving is for knowledge quizzes only
        try {
          var raw = localStorage.getItem('iqp_progress_' + topic.id);
          if (raw) {
            var data = JSON.parse(raw);
            if (data && data.questionIndex >= 0 && data.expires > Date.now() && data.total > 1) {
              savedProgress.push({ topic: topic, data: data });
            }
          }
        } catch (e) { /* ignore */ }
      });
      if (savedProgress.length > 0) {
        html += `<div class="resume-section">
          <h3><i class="fas fa-history"></i> Continue Where You Left Off</h3>
          <div class="resume-cards">`;
        savedProgress.forEach(function(item) {
          var pct = Math.round(((item.data.questionIndex + 1) / item.data.total) * 100);
          html += `
            <div class="resume-card" tabindex="0"
              onclick="window.QuizProsEngine.startQuiz('${item.topic.id}')"
              onkeydown="if(event.key==='Enter'||event.key===' ')window.QuizProsEngine.startQuiz('${item.topic.id}')"
              role="button" aria-label="Resume ${item.topic.name}, question ${item.data.questionIndex + 1} of ${item.data.total}">
              <div class="resume-card-icon"><i class="${item.topic.icon || 'fas fa-question-circle'}"></i></div>
              <div class="resume-card-info">
                <div class="resume-card-title">${item.topic.name}</div>
                <div class="resume-card-progress">Question ${item.data.questionIndex + 1} of ${item.data.total} &bull; ${pct}% done</div>
              </div>
              <div class="resume-card-action"><i class="fas fa-play-circle"></i></div>
            </div>`;
        });
        html += `</div></div>`;
      }
      
      // ── Daily Challenge (Phase 9) + Leaderboard (10.2) ──────────────────────
      html += _buildDailyChallengeHTML(regularQuizzes);
      html += '<div id="daily-leaderboard-section"></div>';

      // ── Quiz Search Bar (11.5) ───────────────────────────────────────────────
      html += `
        <div class="quiz-search-bar">
          <input type="search" id="quiz-search-input" placeholder="Search quizzes…" aria-label="Search quizzes" autocomplete="off">
          <button id="quiz-search-clear" aria-label="Clear search" style="display:none">✕</button>
        </div>
      `;

      // Add regular quizzes section
      html += `
        <div class="quiz-section" id="knowledge-section">
          <h3>Knowledge Quizzes</h3>
          <p>Test your knowledge with these topic-based quizzes!</p>
          <div class="topics-grid" role="list">
      `;

      // Add regular quiz cards
      regularQuizzes.forEach((topic) => {
        html += `
          <div class="topic-card" role="listitem" aria-label="${topic.name} quiz" data-topic="${topic.id}" data-title="${topic.name.toLowerCase()}" data-category="knowledge" onclick="window.QuizProsUI.showQuizDetail('${topic.id}'); return false;">
            <div class="topic-icon"><i class="${topic.icon}"></i></div>
            <h3>${topic.name}</h3>
          </div>
        `;
      });
      
      html += `</div></div>`;

      // ── Healthcare / Psychiatry Section ─────────────────────────────────────
      if (healthcareQuizzes.length > 0) {
        html += `
          <div class="quiz-section" id="healthcare-section">
            <h3><i class="fas fa-stethoscope" style="margin-right:.4rem;"></i>Healthcare Quizzes</h3>
            <p>Medical Psychiatry (DSM-5 aligned) and Nursing Psychiatry (NCLEX-style) assessments for healthcare professionals and students.</p>
            <div class="topics-grid" role="list">
        `;
        healthcareQuizzes.forEach((topic) => {
          const lockIcon = topic.isPremium ? '<span class="premium-lock" title="Premium"><i class="fas fa-lock"></i></span>' : '';
          html += `
            <div class="topic-card" role="listitem" aria-label="${topic.name} quiz" data-topic="${topic.id}" data-title="${topic.name.toLowerCase()}" data-category="healthcare" onclick="window.QuizProsUI.showQuizDetail('${topic.id}'); return false;" style="position:relative;">
              ${lockIcon}
              <div class="topic-icon"><i class="${topic.icon || 'fas fa-brain'}"></i></div>
              <h3>${topic.name}</h3>
            </div>
          `;
        });
        html += `</div></div>`;
      }

      // Add personality quiz section
      html += `
        <div class="quiz-section personality-section" id="personality-section">
          <h3>Personality Quizzes</h3>
          <p>Discover more about yourself with these personality assessments!</p>
          <div class="topics-grid personality-grid" role="list">
            <div class="topic-card personality-topic-card" role="listitem" aria-label="Personality Tests" data-title="personality tests" data-category="personality" onclick="QuizProsUI.showCategorySelection()">
              <div class="topic-icon"><i class="fas fa-brain"></i></div>
              <h3>Personality Tests</h3>
              <p class="topic-description">Explore quizzes about your personality, work style, relationships, and more!</p>
            </div>
          </div>
        </div>
      `;
      
      // Add premium quiz section if premium module is available
      if (window.QuizProsPremium) {
        html += `
          <div class="quiz-section premium-section">
            <h3>Premium Quizzes <i class="fas fa-crown"></i></h3>
            <p>Unlock in-depth assessments and exclusive content!</p>
            <div class="topics-grid premium-grid" role="list">
              <div class="topic-card premium-topic-card" role="listitem" aria-label="Premium Quizzes" data-title="premium quizzes" data-category="premium" onclick="window.location.href='/premium.html'">
                <div class="topic-icon"><i class="fas fa-star"></i></div>
                <h3>Premium Quizzes</h3>
                <p class="topic-description">Access advanced personality assessments and professional tools!</p>
                <div class="premium-badge">Premium</div>
              </div>
            </div>
          </div>
        `;
      }
      
      // ── Popular Quizzes (C.3) ────────────────────────────────────────────────
      // Rendered async after main HTML; placeholder injected here
      html += `<div id="popular-quizzes-section"></div>`;

      // ── Testimonials (C.4) ──────────────────────────────────────────────────
      html += `
        <section class="testimonials-section" aria-label="User testimonials">
          <h2 class="section-title" style="text-align:center;color:var(--primary-dark,#128c7e);margin:2rem 0 1rem;">What Players Say</h2>
          <div class="testimonials-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;margin-bottom:2rem;">
            <div class="testimonial-card" style="background:#fff;border-radius:12px;padding:1.25rem;box-shadow:0 2px 8px rgba(0,0,0,.06);">
              <p style="color:#444;font-style:italic;margin-bottom:.75rem;">"The personality quizzes are so accurate — I shared mine with all my friends!"</p>
              <div style="font-weight:700;color:#128c7e;">⭐⭐⭐⭐⭐ &nbsp;Sarah M.</div>
            </div>
            <div class="testimonial-card" style="background:#fff;border-radius:12px;padding:1.25rem;box-shadow:0 2px 8px rgba(0,0,0,.06);">
              <p style="color:#444;font-style:italic;margin-bottom:.75rem;">"Great for team building! We used the live presenter mode at our company event."</p>
              <div style="font-weight:700;color:#128c7e;">⭐⭐⭐⭐⭐ &nbsp;James K.</div>
            </div>
            <div class="testimonial-card" style="background:#fff;border-radius:12px;padding:1.25rem;box-shadow:0 2px 8px rgba(0,0,0,.06);">
              <p style="color:#444;font-style:italic;margin-bottom:.75rem;">"The AI quiz generator is a game changer. I created a custom quiz in under 30 seconds!"</p>
              <div style="font-weight:700;color:#128c7e;">⭐⭐⭐⭐⭐ &nbsp;Priya D.</div>
            </div>
          </div>
        </section>`;

      // ── Premium Upgrade CTA Strip ───────────────────────────────────────────
      // Only show for non-premium users
      const isPremiumUser = window.QuizProsPremium && window.QuizProsPremium.hasPremiumAccess
        ? window.QuizProsPremium.hasPremiumAccess() : false;
      if (!isPremiumUser) {
        html += `
          <div class="upgrade-cta-strip">
            <div class="upgrade-cta-content">
              <div class="upgrade-cta-text">
                <i class="fas fa-crown"></i>
                <span>Unlock AI-powered quizzes, detailed reports &amp; more</span>
              </div>
              <a href="/premium.html" class="upgrade-cta-button">View Plans</a>
            </div>
          </div>`;
      }

      // Add copyright
      html += `
        <div class="copyright-text">
          <p>${config.app.copyright}</p>
        </div>
      `;

      // Set the HTML
      utils.domUtils.setInnerHTML('topic-selection-screen', html);

      // Show the screen
      topicScreen.style.display = 'block';

      // 11.5: Attach quiz search filter
      _initSearchFilter();

      // ── Async: fetch + render popular quizzes ────────────────────────────────
      _renderPopularQuizzes();

      // 10.2: Load global daily leaderboard asynchronously
      _loadDailyLeaderboard();

      // C.8: Attach pull-to-refresh on the topic selection screen
      _attachPullToRefresh(topicScreen);

      // Scroll to anchor if URL hash targets a quiz section
      if (window.location.hash) {
        setTimeout(() => {
          const target = document.querySelector(window.location.hash);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }

      utils.performance.endMeasure('initTopicSelectionUI');
    } catch (error) {
      utils.logger.error('Error initializing topic selection UI:', error);
      utils.performance.endMeasure('initTopicSelectionUI');
    }
  }
  
  // ── Daily Challenge helpers (Phase 9) ──────────────────────────────────────

  function _getTodayStr() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function _getDailyChallengeData(regularTopics) {
    if (!regularTopics || regularTopics.length === 0) return null;
    var today = _getTodayStr();
    // Deterministic topic from date: treat YYYYMMDD as number, mod by count
    var seed = parseInt(today.replace(/-/g, ''), 10);
    var topic = regularTopics[seed % regularTopics.length];

    var completed = false;
    try {
      var raw = localStorage.getItem('iqp_daily_challenge');
      if (raw) {
        var data = JSON.parse(raw);
        completed = (data.date === today && data.completed === true && data.topicId === topic.id);
      }
    } catch (e) { /* ignore */ }

    var streak = 0;
    try {
      var rawS = localStorage.getItem('iqp_daily_streak');
      if (rawS) { streak = (JSON.parse(rawS).count || 0); }
    } catch (e) { /* ignore */ }

    return { topic: topic, date: today, completed: completed, streak: streak };
  }

  function _buildDailyChallengeHTML(regularTopics) {
    var dc = _getDailyChallengeData(regularTopics);
    if (!dc) return '';
    var t = dc.topic;
    var safeId = t.id.replace(/'/g, "\\'");
    var safeName = t.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var streakHtml = (dc.streak > 0)
      ? `<div class="daily-streak">🔥 ${dc.streak} day streak</div>` : '';
    var statusHtml = dc.completed
      ? `<div class="daily-done"><i class="fas fa-check-circle"></i> Completed!</div>`
      : `<div class="daily-cta">Play Now →</div>`;
    var clickAttr = dc.completed ? ''
      : `onclick="window._iqpDailyTopicId='${safeId}'; window.QuizProsEngine && window.QuizProsEngine.startQuiz('${safeId}')"
         onkeydown="if(event.key==='Enter'||event.key===' '){window._iqpDailyTopicId='${safeId}'; window.QuizProsEngine&&window.QuizProsEngine.startQuiz('${safeId}')}"`;
    var roleAttr = dc.completed ? 'role="img"' : 'role="button" tabindex="0"';
    return `
      <div class="daily-challenge-section" id="daily-challenge-section">
        <h3><i class="fas fa-calendar-day"></i> Today's Challenge</h3>
        <div class="daily-challenge-card ${dc.completed ? 'completed' : ''}"
          id="daily-challenge-card" ${roleAttr} ${clickAttr}
          aria-label="${dc.completed ? 'Daily challenge completed: ' + safeName : 'Start today\'s daily challenge: ' + safeName}">
          <div class="daily-challenge-inner">
            <div class="daily-badge"><i class="fas fa-sun"></i> Daily</div>
            <div class="daily-topic-info">
              ${t.image ? `<img src="${t.image}" class="daily-challenge-thumb" alt="" loading="lazy">` : `<div class="daily-topic-icon"><i class="${t.icon || 'fas fa-question-circle'}"></i></div>`}
              <div class="daily-topic-name">${safeName}</div>
            </div>
            <div class="daily-meta">${streakHtml}${statusHtml}</div>
          </div>
        </div>
      </div>`;
  }

  /**
   * Mark today's daily challenge as completed and update the streak.
   * Called from app.js via the quizpros:quiz:completed event.
   * @param {string} quizId
   * @param {number|null} correctCount - number of correct answers (10.2)
   */
  function completeDailyChallenge(quizId, correctCount) {
    var today = _getTodayStr();
    try {
      var raw = localStorage.getItem('iqp_daily_challenge');
      var existing = raw ? JSON.parse(raw) : null;
      // Do nothing if already completed today for this topic
      if (existing && existing.date === today && existing.completed && existing.topicId === quizId) return;
      // Only count if quizId matches today's daily topic
      var regularTopics = window.QuizProsTopics ? window.QuizProsTopics.getTopics().filter(t => !t.isPersonality) : [];
      var dc = _getDailyChallengeData(regularTopics);
      if (!dc || dc.topic.id !== quizId) return;

      // Persist completion
      localStorage.setItem('iqp_daily_challenge', JSON.stringify({ date: today, topicId: quizId, completed: true }));

      // Update streak
      var streak = 0;
      try {
        var rawS = localStorage.getItem('iqp_daily_streak');
        var sdata = rawS ? JSON.parse(rawS) : { lastDate: '', count: 0 };
        var yesterday = (function() {
          var y = new Date(Date.now() - 86400000);
          return y.getFullYear() + '-' + String(y.getMonth()+1).padStart(2,'0') + '-' + String(y.getDate()).padStart(2,'0');
        })();
        if (sdata.lastDate === yesterday) {
          sdata.count = (sdata.count || 0) + 1;
        } else if (sdata.lastDate === today) {
          // Already counted today (shouldn't happen due to guard above)
        } else {
          sdata.count = 1; // streak broken, restart
        }
        sdata.lastDate = today;
        streak = sdata.count;
        localStorage.setItem('iqp_daily_streak', JSON.stringify(sdata));
      } catch (e) { /* ignore */ }

      // Update the card in the DOM if it's visible
      var card = document.getElementById('daily-challenge-card');
      if (card) {
        card.classList.add('completed');
        card.removeAttribute('onclick');
        card.removeAttribute('onkeydown');
        card.setAttribute('role', 'img');
        var meta = card.querySelector('.daily-meta');
        if (meta) {
          meta.innerHTML = (streak > 0 ? `<div class="daily-streak">🔥 ${streak} day streak</div>` : '') +
            `<div class="daily-done"><i class="fas fa-check-circle"></i> Completed!</div>`;
        }
      }
      utils.logger.info('Daily challenge completed: ' + quizId + ', streak: ' + streak);

      // 10.2: Write score to global daily leaderboard for authenticated users
      if (correctCount != null && typeof firebase !== 'undefined') {
        try {
          var user = firebase.auth().currentUser;
          if (user) {
            var nick = user.displayName || null;
            if (!nick) { try { nick = localStorage.getItem('iqp_nickname'); } catch(e) {} }
            var lbRef = firebase.firestore()
              .collection('dailyLeaderboard').doc(today)
              .collection('scores').doc(user.uid);
            lbRef.get().then(function(doc) {
              if (!doc.exists || (doc.data().score || 0) < correctCount) {
                return lbRef.set({
                  nickname: nick || 'Anonymous',
                  score: correctCount,
                  topicId: quizId,
                  completedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
              }
            }).then(function() {
              _loadDailyLeaderboard(); // refresh the leaderboard panel
            }).catch(function(e) {
              utils.logger.warn('dailyLeaderboard write failed:', e);
            });
          }
        } catch(e) { /* non-fatal if Firestore unavailable */ }
      }
    } catch (e) {
      utils.logger.error('completeDailyChallenge error:', e);
    }
  }

  /**
   * 10.2: Load and render today's global daily leaderboard (top 10).
   * Reads from Firestore dailyLeaderboard/{today}/scores, ordered by score desc.
   */
  function _loadDailyLeaderboard() {
    var container = document.getElementById('daily-leaderboard-section');
    if (!container) return;
    if (typeof firebase === 'undefined' || !firebase.firestore) return;

    var today = _getTodayStr();
    firebase.firestore()
      .collection('dailyLeaderboard').doc(today)
      .collection('scores')
      .orderBy('score', 'desc')
      .limit(10)
      .get()
      .then(function(snapshot) {
        if (snapshot.empty) {
          container.innerHTML = '';
          return;
        }
        var currentUid = null;
        try { currentUid = firebase.auth().currentUser && firebase.auth().currentUser.uid; } catch(e) {}
        var rows = '';
        snapshot.docs.forEach(function(doc, idx) {
          var d = doc.data();
          var isMe = currentUid && doc.id === currentUid;
          rows += '<tr class="daily-lb-row' + (isMe ? ' daily-lb-me' : '') + '">' +
            '<td>' + (idx + 1) + '</td>' +
            '<td>' + escHtmlLb(d.nickname || 'Anonymous') + (isMe ? ' <span class="daily-lb-you">(you)</span>' : '') + '</td>' +
            '<td>' + (d.score != null ? d.score + '/10' : '—') + '</td>' +
            '</tr>';
        });
        container.innerHTML =
          '<div class="daily-leaderboard-section">' +
            '<h4><i class="fas fa-trophy"></i> Today\'s Top Scores</h4>' +
            '<table class="daily-lb-table"><thead><tr><th>#</th><th>Player</th><th>Score</th></tr></thead>' +
            '<tbody>' + rows + '</tbody></table>' +
          '</div>';
      })
      .catch(function(e) { utils.logger.warn('_loadDailyLeaderboard error:', e); });
  }

  function escHtmlLb(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /**
   * C.8: Attach a pull-to-refresh gesture on the topic selection screen.
   * Pulling down ≥80px from the top of the page triggers a re-render of the
   * topic selection UI (useful to refresh popular quizzes / resume cards).
   * Only attaches once per element.
   */
  var _ptr = { startY: 0, el: null };
  function _attachPullToRefresh(element) {
    if (!element || element._ptrAttached) return;
    element._ptrAttached = true;

    var indicator = document.createElement('div');
    indicator.id = 'ptr-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    indicator.style.cssText = [
      'position:fixed;top:0;left:50%;transform:translateX(-50%) translateY(-60px);',
      'background:#25d366;color:#fff;font-size:.85rem;font-weight:700;',
      'padding:.4rem 1rem;border-radius:0 0 20px 20px;',
      'transition:transform .2s ease;z-index:9800;pointer-events:none;'
    ].join('');
    indicator.textContent = '↓ Pull to refresh';
    document.body.appendChild(indicator);

    document.addEventListener('touchstart', function(e) {
      if (window.scrollY === 0) _ptr.startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
      if (_ptr.startY === 0) return;
      var dy = e.touches[0].clientY - _ptr.startY;
      if (dy > 20 && window.scrollY === 0) {
        var progress = Math.min(dy / 80, 1);
        indicator.style.transform = 'translateX(-50%) translateY(' + (progress * 60 - 60) + 'px)';
        indicator.textContent = dy >= 80 ? '↑ Release to refresh' : '↓ Pull to refresh';
      }
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
      var dy = e.changedTouches[0].clientY - _ptr.startY;
      _ptr.startY = 0;
      indicator.style.transform = 'translateX(-50%) translateY(-60px)';
      indicator.textContent = '↓ Pull to refresh';
      if (dy >= 80 && window.scrollY === 0) {
        initTopicSelectionUI(); // re-render
      }
    }, { passive: true });
  }

  /**
  /**
   * 11.5 — Quiz Search Filter
   * Attaches input/clear logic to #quiz-search-input. Debounces by 200ms.
   * Shows/hides .topic-card elements based on data-title and data-category.
   */
  function _initSearchFilter() {
    var input = document.getElementById('quiz-search-input');
    var clearBtn = document.getElementById('quiz-search-clear');
    if (!input) return;

    var debounceTimer = null;
    var noResultsEl = null;

    function applyFilter() {
      var query = input.value.trim().toLowerCase();
      var cards = document.querySelectorAll('.topic-card');
      var visibleCount = 0;

      cards.forEach(function(card) {
        var title = (card.dataset.title || '').toLowerCase();
        var category = (card.dataset.category || '').toLowerCase();
        var matches = !query || title.indexOf(query) !== -1 || category.indexOf(query) !== -1;
        card.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
      });

      // Show/hide clear button
      if (clearBtn) clearBtn.style.display = query ? '' : 'none';

      // Show/hide no-results message
      var grid = document.querySelector('.topics-grid');
      if (noResultsEl) { noResultsEl.remove(); noResultsEl = null; }
      if (query && visibleCount === 0 && grid) {
        noResultsEl = document.createElement('p');
        noResultsEl.className = 'quiz-no-results';
        noResultsEl.textContent = 'No quizzes found for "' + input.value.trim() + '"';
        grid.parentNode.insertBefore(noResultsEl, grid.nextSibling);
      }
    }

    input.addEventListener('input', function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(applyFilter, 200);
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        input.value = '';
        applyFilter();
        input.focus();
      });
    }
  }

  /**
   * Fetch top quizzes from Firestore quizStats and render them into
   * the #popular-quizzes-section placeholder.
   * Fails silently — the placeholder remains empty if Firestore is unavailable.
   */
  function _renderPopularQuizzes() {
    var container = document.getElementById('popular-quizzes-section');
    if (!container) return;
    if (typeof firebase === 'undefined' || !firebase.firestore) return;
    try {
      firebase.firestore()
        .collection('quizStats')
        .orderBy('playCount', 'desc')
        .limit(5)
        .get()
        .then(function(snapshot) {
          if (!snapshot || snapshot.empty) return;
          var items = [];
          snapshot.forEach(function(doc) {
            var d = doc.data();
            if (d && d.playCount > 0) items.push({ id: doc.id, count: d.playCount, name: d.displayName || doc.id });
          });
          if (items.length === 0) return;
          var cardsHtml = items.map(function(item) {
            var label = String(item.name).replace(/</g,'&lt;').replace(/>/g,'&gt;');
            var count = Number(item.count).toLocaleString();
            return '<button class="popular-card" onclick="if(window.startQuiz)window.startQuiz(\'' + item.id.replace(/'/g,'') + '\')" style="background:#fff;border:2px solid #e8f8f0;border-radius:12px;padding:.875rem 1rem;text-align:left;cursor:pointer;transition:box-shadow .15s;min-width:160px;flex-shrink:0;">'
              + '<div style="font-weight:700;color:#128c7e;margin-bottom:.25rem;">' + label + '</div>'
              + '<div style="font-size:.8rem;color:#888;">🔥 ' + count + ' plays</div>'
              + '</button>';
          }).join('');
          container.innerHTML = '<section aria-label="Popular quizzes" style="margin-bottom:2rem;">'
            + '<h2 style="color:var(--primary-dark,#128c7e);margin:0 0 .75rem;font-size:1.1rem;">🔥 Popular Right Now</h2>'
            + '<div style="display:flex;gap:.75rem;overflow-x:auto;padding-bottom:.5rem;-webkit-overflow-scrolling:touch;">'
            + cardsHtml + '</div></section>';
        })
        .catch(function() { /* silently ignore — Firestore may not be ready */ });
    } catch(e) { /* ignore */ }
  }

  /**
   * Add a fallback timer for topic selection
   */
  function addTopicSelectionFallbackTimer() {
    utils.logger.debug('Adding topic selection fallback timer');
    
    // Clear any existing timeout
    if (topicSelectionFallbackTimer) {
      clearTimeout(topicSelectionFallbackTimer);
    }
    
    // Create a timeout that will force the topic selection to show after delay
    topicSelectionFallbackTimer = setTimeout(() => {
      const topicScreen = document.getElementById('topic-selection-screen');
      
      if (topicScreen && topicScreen.innerHTML === '<h3>Loading quiz topics...</h3>') {
        utils.logger.warn('Topic selection fallback timer triggered');
        
        // Force initialize topic selection UI
        initTopicSelectionUI();
      }
    }, 3000); // 3 second fallback
  }
  
  /**
   * Show category selection screen
   */
  function showCategorySelection() {
    utils.logger.info('Showing category selection');
    utils.performance.startMeasure('showCategorySelection');
    
    try {
      // Hide topic selection screen
      utils.domUtils.toggleElementDisplay('topic-selection-screen', false);
      
      // Track category view using safe analytics wrapper
      utils.analytics.trackEvent(
        config.analytics.categories.navigation,
        'CategoryView',
        'Personality Categories'
      );
      
      // Get quiz categories
      const quizCategories = window.QuizProsTopics ? 
        window.QuizProsTopics.getQuizCategories() : 
        {
          "self-discovery": {
            name: "Self-Discovery & Identity",
            description: "Discover more about your personal identity and traits",
            icon: "fas fa-user-check",
            color: "#25d366" // Brand green
          },
          "professional": {
            name: "Professional & Leadership",
            description: "Explore your work style and leadership tendencies",
            icon: "fas fa-briefcase",
            color: "#3498db" // Blue
          },
          "relationships": {
            name: "Relationships & Communication",
            description: "Understand how you connect with others",
            icon: "fas fa-heart",
            color: "#e74c3c" // Red
          },
          "learning": {
            name: "Learning & Creativity",
            description: "Explore your creative process and learning style",
            icon: "fas fa-lightbulb",
            color: "#2ecc71" // Green
          },
          "lifestyle": {
            name: "Lifestyle & Preferences",
            description: "Discover your preferences in daily life",
            icon: "fas fa-map-marker-alt",
            color: "#f39c12" // Orange
          },
          "image-quizzes": {
            name: "Visual Personality Tests",
            description: "Discover yourself through visual choices and images",
            icon: "fas fa-images",
            color: "#3d85c6" // Blue
          }
        };
      
      // Get the category selection screen
      const categoryScreen = document.getElementById('category-selection-screen');
      const categoryGridContainer = document.getElementById('category-grid-container');
      
      // Generate HTML for categories
      let html = `
        <h2>Choose a Category</h2>
        <p>Select the aspect of yourself you'd like to explore</p>
        <div class="categories-grid">
      `;
      
      // Add category cards
      Object.entries(quizCategories).forEach(([categoryId, category]) => {
        html += `
          <div class="category-card" style="border-left: 4px solid ${category.color}" onclick="QuizProsUI.showQuizzesByCategory('${categoryId}')">
            <div class="category-icon" style="color: ${category.color}"><i class="${category.icon}"></i></div>
            <h3>${category.name}</h3>
            <p>${category.description}</p>
          </div>
        `;
      });
      
      html += `</div>`;
      
      // Add copyright
      html += `
        <div class="copyright-text">
          <p>${config.app.copyright}</p>
        </div>
      `;
      
      // Set the HTML and display the screen
      utils.domUtils.setInnerHTML('category-grid-container', html);
      utils.domUtils.toggleElementDisplay('category-selection-screen', true);
      
      // Set up back button event handler
      const backButton = document.getElementById('back-to-topics-from-categories');
      if (backButton) {
        // Clone to remove existing event listeners
        const newBackButton = backButton.cloneNode(true);
        backButton.parentNode.replaceChild(newBackButton, backButton);
        
        newBackButton.addEventListener('click', function() {
          utils.domUtils.toggleElementDisplay('category-selection-screen', false);
          utils.domUtils.toggleElementDisplay('topic-selection-screen', true);
        });
      }
      
      utils.performance.endMeasure('showCategorySelection');
    } catch (error) {
      utils.logger.error('Error showing category selection:', error);
      
      // Fallback - return to topic selection
      utils.domUtils.toggleElementDisplay('category-selection-screen', false);
      utils.domUtils.toggleElementDisplay('topic-selection-screen', true);
      utils.performance.endMeasure('showCategorySelection');
    }
  }
  
  /**
   * Show quizzes filtered by category
   */
function showQuizzesByCategory(categoryId) {
  utils.logger.info('Showing quizzes by category:', categoryId);
  utils.performance.startMeasure('showQuizzesByCategory');
  
  try {
    // Hide category selection screen
    utils.domUtils.toggleElementDisplay('category-selection-screen', false);
    
    // Track category selection using safe analytics wrapper
    if (utils.analytics && typeof utils.analytics.trackEvent === 'function') {
      utils.analytics.trackEvent(
        config.analytics.categories.navigation,
        'CategorySelected',
        categoryId
      );
    }
    
    // Get all necessary data
    const topicsData = window.QuizProsTopics ? 
      window.QuizProsTopics.getTopics() : 
      [];
    
    const quizCategories = window.QuizProsTopics ? 
      window.QuizProsTopics.getQuizCategories() : 
      {};
    
    console.log("Available topics for category selection:", topicsData);
    
    // Filter quizzes by category
    const categoryQuizzes = topicsData.filter(topic => 
      topic.isPersonality && topic.category === categoryId
    );
    
    console.log(`Found ${categoryQuizzes.length} quizzes in category ${categoryId}:`, categoryQuizzes);
    
    // If no quizzes in this category, show a message and fallback option
    if (categoryQuizzes.length === 0) {
      // Check if we can create a fallback quiz for this category
      let fallbackCreated = false;
      
      if (categoryId === 'image-quizzes' && window.QuizProsTopics && window.QuizProsTopics.registerQuizTemplate) {
        // Create fallback zodiac quiz
        const zodiacFallback = {
          id: "zodiac-sign-quiz",
          name: "Discover Your Zodiac Sign",
          description: "Find your cosmic alignment through visual choices",
          icon: "fas fa-star",
          isPersonality: true,
          isImageQuiz: true,
          category: "image-quizzes"
        };
        
        window.QuizProsTopics.registerQuizTemplate(zodiacFallback, 'image-quizzes');
        console.log("Created fallback zodiac quiz");
        
        // Try to get quizzes again
        const updatedQuizzes = topicsData.filter(topic => 
          topic.isPersonality && topic.category === categoryId
        );
        
        if (updatedQuizzes.length > 0) {
          console.log("Using fallback quizzes:", updatedQuizzes);
          categoryQuizzes.push(...updatedQuizzes);
          fallbackCreated = true;
        }
      }
      
      if (!fallbackCreated) {
        alert(`No quizzes available in the ${quizCategories[categoryId]?.name || categoryId} category yet.`);
        utils.domUtils.toggleElementDisplay('category-selection-screen', true);
        utils.performance.endMeasure('showQuizzesByCategory');
        return;
      }
    }
    
    // Create content for quiz selection
    const categoryScreen = document.getElementById('category-selection-screen');
    const categoryGridContainer = document.getElementById('category-grid-container');
    
    let html = `
      <h2>${quizCategories[categoryId]?.name || 'Personality Quizzes'}</h2>
      <p>Select a quiz to start</p>
      <div class="categories-grid">
    `;
    
    // Add quiz cards
    categoryQuizzes.forEach((quiz) => {
      html += `
        <div class="topic-card personality-topic-card ${categoryId}-card" onclick="window.QuizProsEngine.startQuiz('${quiz.id}'); return false;">
          <div class="topic-icon"><i class="${quiz.icon}"></i></div>
          <h3>${quiz.name}</h3>
          ${quiz.description ? `<p class="topic-description">${quiz.description}</p>` : ''}
        </div>
      `;
    });
    
    html += `</div>`;
    
    // Add copyright
    html += `
      <div class="copyright-text">
        <p>${config.app.copyright || '© 2026 iQuizpro by P.G. Mitala. All rights reserved.'}</p>
        <p>Made with <span style="color:#e74c3c">&#10084;</span> for curious minds</p>
      </div>
    `;
    
    // Set the HTML and display the screen
    utils.domUtils.setInnerHTML('category-grid-container', html);
    utils.domUtils.toggleElementDisplay('category-selection-screen', true);
    
    // Update back button to return to category selection
    const backButton = document.getElementById('back-to-topics-from-categories');
    if (backButton) {
      // Clone to remove existing event listeners
      const newBackButton = backButton.cloneNode(true);
      backButton.parentNode.replaceChild(newBackButton, backButton);
      
      newBackButton.addEventListener('click', function() {
        showCategorySelection();
      });
    }
    
    utils.performance.endMeasure('showQuizzesByCategory');
  } catch (error) {
    utils.logger.error('Error showing quizzes by category:', error);
    console.error('Error showing quizzes by category:', error);
    
    // Fallback - return to category selection
    showCategorySelection();
    utils.performance.endMeasure('showQuizzesByCategory');
  }
}
  
  /**
   * Show quiz detail screen
   * @param {string} quizId - The quiz ID to show details for
   */
  function showQuizDetail(quizId) {
    utils.logger.info('Showing quiz detail for:', quizId);
    utils.performance.startMeasure('showQuizDetail');
    
    try {
      // Hide topic selection screen
      utils.domUtils.toggleElementDisplay('topic-selection-screen', false);
      
      // Get quiz data
      const topicsData = window.QuizProsTopics ? window.QuizProsTopics.getTopics() : [];
      const quizData = topicsData.find(topic => topic.id === quizId);
      
      if (!quizData) {
        utils.logger.error('Quiz not found:', quizId);
        alert('Quiz not found');
        utils.domUtils.toggleElementDisplay('topic-selection-screen', true);
        return;
      }
      
      // Get or create quiz detail screen
      let detailScreen = document.getElementById('quiz-detail-screen');
      if (!detailScreen) {
        detailScreen = document.createElement('div');
        detailScreen.id = 'quiz-detail-screen';
        detailScreen.className = 'quiz-container';
        detailScreen.style.display = 'none';
        
        detailScreen.innerHTML = `
          <div class="quiz-header">
            <button id="back-to-topics-from-detail" class="back-button">
              <i class="fas fa-arrow-left"></i> Back
            </button>
            <div class="quiz-topic-info" id="detail-topic-info">Quiz Details</div>
          </div>
          <div id="quiz-detail-content" class="quiz-detail-content"></div>
        `;
        
        document.body.appendChild(detailScreen);
      }
      
      // Generate quiz detail content
      const questionCount = quizData.questionCount || 20;
      const completionTime = quizData.completionTime || 10;
      
      const detailHTML = `
        <div class="quiz-detail-card">
          <div class="quiz-detail-header">
            <div class="quiz-detail-icon"><i class="${quizData.icon || 'fas fa-question-circle'}"></i></div>
            <h1 class="quiz-detail-title">${quizData.name}</h1>
            <p class="quiz-detail-description">${quizData.description || 'Test your knowledge with this engaging quiz!'}</p>
          </div>
          
          <div class="quiz-detail-body">
            <div class="quiz-detail-info">
              <div class="quiz-info-item">
                <div class="quiz-info-icon"><i class="fas fa-question-circle"></i></div>
                <span class="quiz-info-label">Questions</span>
                <span class="quiz-info-value">${questionCount}</span>
              </div>
              <div class="quiz-info-item">
                <div class="quiz-info-icon"><i class="fas fa-clock"></i></div>
                <span class="quiz-info-label">Time</span>
                <span class="quiz-info-value">~${completionTime} min</span>
              </div>
              <div class="quiz-info-item">
                <div class="quiz-info-icon"><i class="fas fa-trophy"></i></div>
                <span class="quiz-info-label">Type</span>
                <span class="quiz-info-value">${quizData.isPersonality ? 'Personality' : 'Knowledge'}</span>
              </div>
            </div>
            
            <div class="quiz-detail-actions">
              <button class="quiz-action-button start-quiz-btn" onclick="window.QuizProsEngine.startQuiz('${quizId}')">
                <i class="fas fa-play"></i>
                Start Quiz
              </button>
              <button class="quiz-action-button start-live-btn" onclick="window.location.href='live-presenter.html?quiz=${quizId}'">
                <i class="fas fa-broadcast-tower"></i>
                Start Live Session
              </button>
            </div>
          </div>
        </div>
      `;
      
      // Set content
      const contentDiv = document.getElementById('quiz-detail-content');
      if (contentDiv) {
        contentDiv.innerHTML = detailHTML;
      }
      
      // Show the screen
      utils.domUtils.toggleElementDisplay('quiz-detail-screen', true);
      
      // Set up back button
      const backButton = document.getElementById('back-to-topics-from-detail');
      if (backButton) {
        const newBackButton = backButton.cloneNode(true);
        backButton.parentNode.replaceChild(newBackButton, backButton);
        
        newBackButton.addEventListener('click', function() {
          utils.domUtils.toggleElementDisplay('quiz-detail-screen', false);
          utils.domUtils.toggleElementDisplay('topic-selection-screen', true);
        });
      }
      
      // Track event
      if (utils.analytics && typeof utils.analytics.trackEvent === 'function') {
        utils.analytics.trackEvent(
          config.analytics.categories.navigation,
          'QuizDetailViewed',
          quizId
        );
      }
      
      utils.performance.endMeasure('showQuizDetail');
    } catch (error) {
      utils.logger.error('Error showing quiz detail:', error);
      console.error('Error showing quiz detail:', error);
      utils.domUtils.toggleElementDisplay('quiz-detail-screen', false);
      utils.domUtils.toggleElementDisplay('topic-selection-screen', true);
      utils.performance.endMeasure('showQuizDetail');
    }
  }
  
  /**
   * Create a premium upsell banner
   * @returns {HTMLElement} Premium upsell banner element
   */
  function createPremiumUpsellBanner() {
    const banner = document.createElement('div');
    banner.className = 'top-banner premium-banner';
    
    banner.innerHTML = `
      <div class="banner-content">
        <div class="banner-icon">👑</div>
        <div class="banner-text">
          <span class="banner-label">Premium Features</span>
          <span class="banner-message">Unlock premium quizzes and ad-free experience!</span>
        </div>
      </div>
      <div class="banner-action">
        <button class="banner-button premium-button" id="premium-banner-button">Try Premium</button>
      </div>
    `;
    
    // Add event listener for the button
    const button = banner.querySelector('#premium-banner-button');
    if (button) {
      button.addEventListener('click', function() {
        if (window.QuizProsPremium && window.QuizProsPremium.showPremiumSignup) {
          window.QuizProsPremium.showPremiumSignup('basic');
          
          // Track event using safe analytics wrapper
          utils.analytics.trackEvent(
            config.analytics.categories.premium,
            'BannerClicked',
            'QuizPage'
          );
        }
      });
    }
    
    return banner;
  }
  
  /**
   * Show premium badge in header
   */
  function showPremiumBadge() {
    if (!window.QuizProsPremium || !window.QuizProsPremium.hasPremiumAccess()) {
      return;
    }
    
    const topicInfo = document.getElementById('current-topic-info');
    if (!topicInfo) return;
    
    // Create badge element
    const badge = document.createElement('span');
    badge.className = 'premium-badge-small';
    badge.innerHTML = '<i class="fas fa-crown"></i> Premium';
    
    // Add badge to header
    topicInfo.appendChild(badge);
  }
  
  // Public API
  return {
    // UI initialization
    initTopicSelectionUI: initTopicSelectionUI,
    
    // Category and quiz display
    showCategorySelection: showCategorySelection,
    showQuizzesByCategory: showQuizzesByCategory,
    showQuizDetail: showQuizDetail,
    
    // Premium UI elements
    createPremiumUpsellBanner: createPremiumUpsellBanner,
    showPremiumBadge: showPremiumBadge,
    
    // Daily Challenge (Phase 9)
    completeDailyChallenge: completeDailyChallenge,

    // Timeout management
    addTopicSelectionFallbackTimer: addTopicSelectionFallbackTimer,
    
    // Initialization
    init: function() {
      utils.logger.info('Initializing QuizPros UI');
      
      // Add fallback timer for topic selection
      addTopicSelectionFallbackTimer();
      
      return this;
    }
  };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  QuizProsUI.init();
});
