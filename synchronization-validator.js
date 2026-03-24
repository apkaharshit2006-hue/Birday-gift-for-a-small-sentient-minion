'use strict';

/**
 * SynchronizationValidator Module
 * 
 * Detects and logs mismatches between dialogue and actions.
 * Calculates coherence scores based on keyword matching between dialogue
 * and action names. Logs mismatches with type, severity, description, and timestamp.
 */

const { matchKeywords } = require('./action-hint-system');
const { isValidAction } = require('./action-registry');

/**
 * Validate a response for dialogue-action coherence
 * @param {Object} response - Response object with text, emotion, and actions
 * @param {string} character - Character name
 * @returns {Object} ValidationResult with isValid, coherenceScore, and mismatches
 */
function validate(response, character) {
  if (!response || typeof response !== 'object') {
    return {
      isValid: false,
      coherenceScore: 0,
      mismatches: [{
        type: 'invalid_response',
        severity: 'high',
        description: 'Response is null or not an object',
        timestamp: Date.now()
      }]
    };
  }

  const { text = '', actions = [] } = response;
  const mismatches = [];

  // Check for invalid actions
  const invalidActions = actions.filter(action => !isValidAction(character, action));
  if (invalidActions.length > 0) {
    mismatches.push({
      type: 'action_invalid',
      severity: 'high',
      description: `Invalid actions for ${character}: ${invalidActions.join(', ')}`,
      timestamp: Date.now()
    });
  }

  // Detect semantic mismatches
  const semanticMismatches = detectMismatches(text, actions);
  mismatches.push(...semanticMismatches);

  // Calculate coherence score
  const coherenceScore = calculateCoherence(text, actions);

  // Flag low coherence as a mismatch
  if (coherenceScore < 70 && actions.length > 0 && text.length > 0) {
    mismatches.push({
      type: 'semantic_mismatch',
      severity: 'medium',
      description: `Low coherence score (${coherenceScore}): dialogue and actions may not align`,
      timestamp: Date.now()
    });
  }

  return {
    isValid: mismatches.length === 0 || mismatches.every(m => m.severity === 'low'),
    coherenceScore,
    mismatches
  };
}

/**
 * Calculate coherence score between dialogue text and actions
 * Uses keyword matching to determine how well actions align with dialogue
 * @param {string} text - Dialogue text
 * @param {string[]} actions - Array of action names
 * @returns {number} Coherence score from 0-100
 */
function calculateCoherence(text, actions) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return actions.length === 0 ? 100 : 50; // Empty text with no actions is coherent
  }

  if (!Array.isArray(actions) || actions.length === 0) {
    return 50; // Text without actions is neutral coherence
  }

  const lowerText = text.toLowerCase();
  let matchCount = 0;

  // Check each action for keyword matches in the text
  actions.forEach(action => {
    // Extract keywords from action name (split by underscore)
    const actionKeywords = action.split('_');
    
    // Check if any action keyword appears in the text
    const hasMatch = actionKeywords.some(keyword => {
      // Skip very short keywords (like "to", "a", etc.)
      if (keyword.length <= 2) return false;
      
      // Split text into words and check if any word contains or starts with the keyword
      // This handles "mouse" matching "mouse", and also partial matches
      const words = lowerText.split(/\W+/).filter(w => w.length > 0);
      return words.some(word => {
        // Check if word contains the keyword (handles exact matches and compounds)
        if (word.includes(keyword)) return true;
        // Check if keyword contains the word (handles "thunder" matching "thunderbolt")
        if (keyword.includes(word) && word.length >= 4) return true;
        // Check if word starts with a reasonable prefix of keyword (handles conjugations)
        const minPrefixLength = Math.min(4, keyword.length - 1);
        if (word.length >= minPrefixLength && keyword.startsWith(word.substring(0, minPrefixLength))) return true;
        return false;
      });
    });

    if (hasMatch) {
      matchCount++;
    }
  });

  // Calculate score: (matched actions / total actions) * 100
  let baseScore = (matchCount / actions.length) * 100;

  // Bonus points for semantic matches (even if exact keyword doesn't match)
  // Check for related movement words
  const movementWords = ['run', 'walk', 'jump', 'move', 'chase', 'zoom', 'gallop', 'dash', 'sprint'];
  const hasMovementText = movementWords.some(word => {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedWord}`, 'i');
    return regex.test(lowerText);
  });
  const hasMovementAction = actions.some(a => 
    movementWords.some(word => a.includes(word)) || 
    a.includes('left') || a.includes('right') || a.includes('random')
  );
  
  if (hasMovementText && hasMovementAction && matchCount === 0) {
    // Give partial credit for semantic movement match
    baseScore = Math.max(baseScore, 50);
  }

  // Bonus points for emotion-related actions matching emotion words
  let emotionBonus = 0;
  if (lowerText.includes('happy') && actions.some(a => a.includes('happy'))) {
    emotionBonus += 10;
  }
  if (lowerText.includes('sad') && actions.some(a => a.includes('sad'))) {
    emotionBonus += 10;
  }
  if (lowerText.includes('surprised') && actions.some(a => a.includes('surprised'))) {
    emotionBonus += 10;
  }

  // Cap at 100
  return Math.min(100, Math.round(baseScore + emotionBonus));
}

/**
 * Detect specific mismatches between dialogue and actions
 * @param {string} text - Dialogue text
 * @param {string[]} actions - Array of action names
 * @returns {Array} Array of mismatch objects
 */
function detectMismatches(text, actions) {
  const mismatches = [];

  if (!text || typeof text !== 'string' || !Array.isArray(actions)) {
    return mismatches;
  }

  const lowerText = text.toLowerCase();

  // Check for keyword contradictions
  // Example: text says "running" but actions only include sit_idle
  const movementKeywords = ['run', 'running', 'walk', 'walking', 'jump', 'jumping', 'move', 'moving'];
  const hasMovementText = movementKeywords.some(kw => lowerText.includes(kw));
  const hasMovementAction = actions.some(a => 
    a.includes('run') || a.includes('walk') || a.includes('jump') || 
    a.includes('chase') || a.includes('zoom') || a.includes('gallop')
  );

  if (hasMovementText && !hasMovementAction && actions.includes('sit_idle')) {
    mismatches.push({
      type: 'keyword_missing',
      severity: 'medium',
      description: 'Dialogue mentions movement but actions include sit_idle',
      timestamp: Date.now()
    });
  }

  // Check for emotion contradictions
  if (lowerText.includes('happy') && actions.includes('sad_droop')) {
    mismatches.push({
      type: 'emotion_mismatch',
      severity: 'medium',
      description: 'Dialogue says happy but actions include sad_droop',
      timestamp: Date.now()
    });
  }

  if (lowerText.includes('sad') && actions.includes('happy_bounce')) {
    mismatches.push({
      type: 'emotion_mismatch',
      severity: 'medium',
      description: 'Dialogue says sad but actions include happy_bounce',
      timestamp: Date.now()
    });
  }

  return mismatches;
}

/**
 * Log a mismatch to console (in production, this could write to a file or database)
 * @param {Object} mismatch - Mismatch object with type, severity, description, timestamp
 */
function logMismatch(mismatch) {
  if (!mismatch || typeof mismatch !== 'object') {
    return;
  }

  const timestamp = mismatch.timestamp && typeof mismatch.timestamp === 'number' 
    ? new Date(mismatch.timestamp).toISOString() 
    : new Date().toISOString();
  const severity = mismatch.severity || 'unknown';
  const type = mismatch.type || 'unknown';
  const description = mismatch.description || 'No description';

  console.warn(`[MISMATCH] ${timestamp} [${severity.toUpperCase()}] ${type}: ${description}`);
}

module.exports = {
  validate,
  calculateCoherence,
  detectMismatches,
  logMismatch
};
