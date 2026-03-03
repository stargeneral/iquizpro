/**
 * Audio Utilities for IQuizPros
 * Provides functions for playing sounds and managing audio
 */

window.QuizProsAudio = (function() {
  // Private variables
  const config = window.QuizProsConfig;
  const utils = window.QuizProsUtils;
  
  // Audio cache to prevent reloading sounds
  const audioCache = {};

  // Audio settings
  let audioEnabled = true;
  let volume = 0.7; // Default volume (0.0 to 1.0)

  // Track which wrong answer sound to play (for alternating)
  let wrongAnswerSoundIndex = 0;
  
  /**
   * Initialize audio settings
   */
  function initialize() {
    utils.logger.info('Initializing audio module');
    
    // Load audio settings from storage if available
    if (window.QuizProsStorage && window.QuizProsStorage.isLocalStorageAvailable) {
      const settings = window.QuizProsStorage.getLocalItem('audio_settings');
      
      if (settings) {
        audioEnabled = settings.enabled !== false;
        volume = settings.volume || volume;
        
        utils.logger.debug('Loaded audio settings:', settings);
      }
    }
    
    // Preload common sounds
    preloadSound('quiz-correct-answer', 'assets/sounds/quiz-correct-answer.wav');
    preloadSound('quiz-wrong-answer', 'assets/sounds/quiz-wrong-answer.wav');
    preloadSound('wrong-answer-alt', 'assets/sounds/wrong-answer.mp3'); // Alternative wrong answer sound
    preloadSound('crowd-cheer', 'assets/sounds/crowd-cheer.mp3'); // Celebration sound

    utils.logger.debug('Audio initialization complete');
  }
  
  /**
   * Preload a sound file
   * @param {string} id - Sound identifier
   * @param {string} url - Sound file URL
   */
  function preloadSound(id, url) {
    if (!audioEnabled) return;
    
    try {
      utils.logger.debug(`Preloading sound: ${id} from ${url}`);
      
      // Create audio element
      const audio = new Audio();
      
      // Set properties
      audio.preload = 'auto';
      audio.volume = volume;
      
      // Add to cache
      audioCache[id] = {
        audio: audio,
        url: url,
        loaded: false
      };
      
      // Add event listeners
      audio.addEventListener('canplaythrough', function() {
        audioCache[id].loaded = true;
        utils.logger.debug(`Sound loaded: ${id}`);
      });
      
      audio.addEventListener('error', function(e) {
        utils.logger.warn(`Error loading sound ${id} (file may not exist yet):`, e);
        // Don't mark as error, just not loaded
        audioCache[id].loaded = false;
        
        // Create a fallback audio context for generating sounds programmatically
        if (!audioCache.audioContext) {
          try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCache.audioContext = new AudioContext();
          } catch (err) {
            utils.logger.error('Failed to create audio context:', err);
          }
        }
      });
      
      // Set source and start loading
      audio.src = url;
      audio.load();
    } catch (error) {
      utils.logger.error(`Error preloading sound ${id}:`, error);
    }
  }
  
  /**
   * Play a sound
   * @param {string} id - Sound identifier
   * @param {Object} options - Playback options
   * @param {number} options.volume - Volume override (0.0 to 1.0)
   * @param {boolean} options.loop - Whether to loop the sound
   * @returns {HTMLAudioElement|null} Audio element or null if sound couldn't be played
   */
  function playSound(id, options = {}) {
    if (!audioEnabled) return null;
    
    try {
      utils.logger.debug(`Playing sound: ${id}`);
      
      // Check if sound is in cache
      if (!audioCache[id]) {
        utils.logger.warn(`Sound not preloaded: ${id}`);
        return null;
      }
      
      // Check if sound is loaded
      if (audioCache[id].loaded) {
        // Get cached audio
        const cachedAudio = audioCache[id].audio;
        
        // Clone the audio element to allow multiple plays
        const audio = cachedAudio.cloneNode(true);
        
        // Set options
        audio.volume = options.volume !== undefined ? options.volume : volume;
        audio.loop = options.loop || false;
        
        // Play the sound
        const playPromise = audio.play();
        
        // Handle play promise
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            utils.logger.error(`Error playing sound ${id}:`, error);
          });
        }
        
        return audio;
      } else {
        // Sound file couldn't be loaded, generate sound programmatically
        return generateFallbackSound(id, options);
      }
    } catch (error) {
      utils.logger.error(`Error playing sound ${id}:`, error);
      return generateFallbackSound(id, options);
    }
  }
  
  /**
   * Generate a fallback sound programmatically
   * @param {string} id - Sound identifier
   * @param {Object} options - Playback options
   * @returns {Object|null} An object with a stop method or null if sound couldn't be generated
   */
  function generateFallbackSound(id, options = {}) {
    if (!audioCache.audioContext) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCache.audioContext = new AudioContext();
      } catch (err) {
        utils.logger.error('Failed to create audio context:', err);
        return null;
      }
    }
    
    const ctx = audioCache.audioContext;
    const soundVolume = options.volume !== undefined ? options.volume : volume;
    
    try {
      // Create oscillator and gain node
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Set volume
      gainNode.gain.value = soundVolume;
      
      // Configure sound based on ID
      if (id === 'quiz-correct-answer') {
        // Correct answer sound: rising tone
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.2);
        
        // Start and stop
        oscillator.start();
        gainNode.gain.setValueAtTime(soundVolume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.stop(ctx.currentTime + 0.5);
      } else if (id === 'quiz-wrong-answer') {
        // Wrong answer sound: descending tone
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, ctx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.3);
        
        // Start and stop
        oscillator.start();
        gainNode.gain.setValueAtTime(soundVolume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        oscillator.stop(ctx.currentTime + 0.4);
      } else {
        // Generic sound
        oscillator.type = 'sine';
        oscillator.frequency.value = 440;
        
        // Start and stop
        oscillator.start();
        gainNode.gain.setValueAtTime(soundVolume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.stop(ctx.currentTime + 0.3);
      }
      
      // Return an object with a stop method
      return {
        stop: function() {
          try {
            oscillator.stop();
          } catch (e) {
            // Ignore errors if already stopped
          }
        }
      };
    } catch (error) {
      utils.logger.error(`Error generating fallback sound for ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Play correct answer sound
   * @returns {HTMLAudioElement|null} Audio element or null if sound couldn't be played
   */
  function playCorrectSound() {
    return playSound('quiz-correct-answer');
  }
  
  /**
   * Play wrong answer sound - alternates between two sounds
   * @returns {HTMLAudioElement|null} Audio element or null if sound couldn't be played
   */
  function playWrongSound() {
    // Alternate between two wrong answer sounds
    let soundId;
    if (wrongAnswerSoundIndex === 0) {
      soundId = 'wrong-answer-alt'; // wrong-answer.mp3
      wrongAnswerSoundIndex = 1;
    } else {
      soundId = 'quiz-wrong-answer'; // quiz-wrong-answer.wav
      wrongAnswerSoundIndex = 0;
    }

    utils.logger.debug(`Playing alternating wrong answer sound: ${soundId}`);
    return playSound(soundId);
  }

  /**
   * Play celebration sound with crowd cheer
   * @returns {HTMLAudioElement|null} Audio element or null if sound couldn't be played
   */
  function playCelebrationSound() {
    utils.logger.debug('Playing celebration crowd cheer sound');
    return playSound('crowd-cheer', { volume: 0.6 }); // Slightly lower volume for celebration
  }

  /**
   * Reset the wrong answer sound alternation
   * Call this when starting a new quiz
   */
  function resetWrongAnswerAlternation() {
    wrongAnswerSoundIndex = 0;
    utils.logger.debug('Reset wrong answer sound alternation');
  }
  
  /**
   * Stop a sound
   * @param {HTMLAudioElement|Object} audio - Audio element or fallback sound object to stop
   */
  function stopSound(audio) {
    if (!audio) return;
    
    try {
      // Check if this is an HTML audio element or our fallback object
      if (audio instanceof HTMLAudioElement) {
        audio.pause();
        audio.currentTime = 0;
      } else if (typeof audio.stop === 'function') {
        // This is our fallback sound object
        audio.stop();
      }
    } catch (error) {
      utils.logger.error('Error stopping sound:', error);
    }
  }
  
  /**
   * Enable or disable audio
   * @param {boolean} enabled - Whether audio should be enabled
   */
  function setAudioEnabled(enabled) {
    audioEnabled = enabled;
    
    // Save setting to storage
    if (window.QuizProsStorage && window.QuizProsStorage.isLocalStorageAvailable) {
      const settings = window.QuizProsStorage.getLocalItem('audio_settings') || {};
      settings.enabled = enabled;
      window.QuizProsStorage.setLocalItem('audio_settings', settings);
    }
    
    utils.logger.debug(`Audio ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Set audio volume
   * @param {number} newVolume - Volume level (0.0 to 1.0)
   */
  function setVolume(newVolume) {
    // Ensure volume is between 0 and 1
    volume = Math.max(0, Math.min(1, newVolume));
    
    // Update volume for all cached sounds
    Object.values(audioCache).forEach(cached => {
      if (cached.audio) {
        cached.audio.volume = volume;
      }
    });
    
    // Save setting to storage
    if (window.QuizProsStorage && window.QuizProsStorage.isLocalStorageAvailable) {
      const settings = window.QuizProsStorage.getLocalItem('audio_settings') || {};
      settings.volume = volume;
      window.QuizProsStorage.setLocalItem('audio_settings', settings);
    }
    
    utils.logger.debug(`Audio volume set to ${volume}`);
  }
  
  /**
   * Check if audio is enabled
   * @returns {boolean} Whether audio is enabled
   */
  function isAudioEnabled() {
    return audioEnabled;
  }
  
  /**
   * Get current volume
   * @returns {number} Current volume (0.0 to 1.0)
   */
  function getVolume() {
    return volume;
  }
  
  // Public API
  return {
    initialize: initialize,
    preloadSound: preloadSound,
    playSound: playSound,
    playCorrectSound: playCorrectSound,
    playWrongSound: playWrongSound,
    playCelebrationSound: playCelebrationSound,
    resetWrongAnswerAlternation: resetWrongAnswerAlternation,
    stopSound: stopSound,
    setAudioEnabled: setAudioEnabled,
    setVolume: setVolume,
    isAudioEnabled: isAudioEnabled,
    getVolume: getVolume
  };
})();

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  QuizProsAudio.initialize();
});
