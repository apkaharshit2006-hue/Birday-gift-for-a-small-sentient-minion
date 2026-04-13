'use strict';

/**
 * ActionInferenceEngine Module
 * 
 * Converts dialogue text and emotion into valid character actions.
 * Uses ActionHintSystem for keyword matching, adds emotion-based actions,
 * and prioritizes character-specific signature actions over universal ones.
 */

const { getHints, matchKeywords } = require('./action-hint-system');
const { getActions, getSignatureActions, isValidAction } = require('./action-registry');

/**
 * Infer actions from dialogue text and emotion
 * @param {string} character - Character name (cat, dog, lizard, snake, unicorn, jigglypuff, pikachu)
 * @param {string} text - Dialogue text to analyze
 * @param {string} emotion - Emotion state (happy, sad, surprised)
 * @returns {string[]} Array of inferred actions (max 3, deduplicated)
 */
function inferActions(character, text, emotion) {
  if (!character || !text) {
    return [];
  }

  let actions = [];

  // 1. Extract keyword-based actions from Action Hint System
  const hints = getHints(character);
  for (const hint of hints) {
    if (matchKeywords(text, hint.words)) {
      actions.push(hint.action);
    }
  }

  // 2. Add generic movement pattern matching (jump, run, walk)
  const lowerText = text.toLowerCase();
  if (lowerText.includes('jump')) {
    actions.push('jump');
  }
  if (lowerText.includes('run') || lowerText.includes('running')) {
    actions.push('run_random');
  }
  if (lowerText.includes('walk') || lowerText.includes('walking')) {
    actions.push('walk_random');
  }

  // 3. Add emotion-based actions
  actions = addEmotionActions(actions, emotion, character);

  // 4. Deduplicate
  actions = [...new Set(actions)];

  // 5. Filter to valid actions only
  actions = actions.filter(action => isValidAction(character, action));

  // 6. Prioritize character-specific actions over universal ones
  actions = prioritizeActions(actions, character);

  // 7. Enforce 3-action limit
  return actions.slice(0, 3);
}

/**
 * Prioritize character-specific signature actions over universal actions
 * @param {string[]} actions - Array of actions to prioritize
 * @param {string} character - Character name
 * @returns {string[]} Reordered array with signature actions first
 */
function prioritizeActions(actions, character) {
  if (!actions || actions.length === 0) {
    return [];
  }

  const signatureActions = getSignatureActions(character);
  const signature = [];
  const universal = [];

  for (const action of actions) {
    if (signatureActions.includes(action)) {
      signature.push(action);
    } else {
      universal.push(action);
    }
  }

  // Return signature actions first, then universal
  return [...signature, ...universal];
}

/**
 * Add emotion-based actions to the actions array
 * @param {string[]} actions - Existing actions array
 * @param {string} emotion - Emotion state (happy, sad, surprised)
 * @param {string} character - Character name
 * @returns {string[]} Actions array with emotion-based actions added
 */
function addEmotionActions(actions, emotion, character) {
  if (!emotion || !character) {
    return actions;
  }

  const result = [...actions];

  // Add emotion-specific actions if they're valid for the character
  if (emotion === 'sad' && isValidAction(character, 'sad_droop')) {
    result.push('sad_droop');
  } else if (emotion === 'surprised' && isValidAction(character, 'surprised_jump')) {
    result.push('surprised_jump');
  } else if (emotion === 'happy' && isValidAction(character, 'happy_bounce')) {
    // Only add happy_bounce if no other actions are present
    if (result.length === 0) {
      result.push('happy_bounce');
    }
  }

  return result;
}

module.exports = {
  inferActions,
  prioritizeActions,
  addEmotionActions
};
