'use strict';

/**
 * ResponseParser Module
 * 
 * Extracts and validates AI responses into a standardized format.
 * Handles malformed JSON, code blocks, missing fields, and invalid emotions.
 */

const ActionRegistry = require('./action-registry');

/**
 * Parse raw AI response into standardized Response object
 * @param {string} raw - Raw AI response text
 * @param {string} character - Character name (cat, dog, lizard, snake, unicorn, jigglypuff, pikachu)
 * @returns {Object} Parsed response with { text, emotion, actions }
 */
function parse(raw, character) {
  // Handle empty or invalid input
  if (!raw || typeof raw !== 'string' || raw.trim() === '') {
    return getFallbackResponse(character);
  }

  // Try to extract JSON from raw response
  const extracted = extractJSON(raw);
  
  if (!extracted) {
    // If JSON extraction fails, treat entire response as dialogue text
    return {
      text: raw.trim(),
      emotion: 'happy',
      actions: []
    };
  }

  // Validate structure
  if (!validateStructure(extracted)) {
    return getFallbackResponse(character);
  }

  // Normalize and validate fields
  const text = typeof extracted.text === 'string' ? extracted.text.trim() : '';
  const emotion = normalizeEmotion(extracted.emotion);
  const actions = filterActions(
    Array.isArray(extracted.actions) ? extracted.actions : [],
    character
  );

  return { text, emotion, actions };
}

/**
 * Extract JSON from raw response (handles code blocks and malformed JSON)
 * @param {string} raw - Raw response text
 * @returns {Object|null} Extracted JSON object or null if extraction fails
 */
function extractJSON(raw) {
  if (!raw || typeof raw !== 'string') {
    return null;
  }

  // Try to extract JSON from code blocks first (```json ... ```)
  const codeBlockMatch = raw.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch (e) {
      // Continue to other extraction methods
    }
  }

  // Try to find JSON object in the response
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      // Continue to other extraction methods
    }
  }

  // Try to parse the entire response as JSON
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Validate that object has required response structure
 * @param {Object} obj - Object to validate
 * @returns {boolean} True if object has valid structure
 */
function validateStructure(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return false;
  }

  // Check that required fields exist (text, emotion, actions)
  // Allow missing fields but require at least the object structure
  return true;
}

/**
 * Normalize emotion to allowed set (happy, sad, surprised)
 * @param {string} emotion - Emotion value to normalize
 * @returns {string} Normalized emotion (defaults to 'happy')
 */
function normalizeEmotion(emotion) {
  const allowedEmotions = ['happy', 'sad', 'surprised'];
  
  if (!emotion || typeof emotion !== 'string') {
    return 'happy';
  }

  const normalized = emotion.toLowerCase().trim();
  
  if (allowedEmotions.includes(normalized)) {
    return normalized;
  }

  return 'happy';
}

/**
 * Filter actions to only valid actions for the character
 * @param {string[]} actions - Array of action names
 * @param {string} character - Character name
 * @returns {string[]} Filtered, deduplicated, and limited actions (max 3)
 */
function filterActions(actions, character) {
  if (!Array.isArray(actions)) {
    return [];
  }

  // Filter to valid actions only
  const validActions = actions
    .filter(action => typeof action === 'string' && action.trim() !== '')
    .map(action => action.trim())
    .filter(action => ActionRegistry.isValidAction(character, action));

  // Remove duplicates while preserving order
  const uniqueActions = [...new Set(validActions)];

  // Limit to 3 actions
  return uniqueActions.slice(0, 3);
}

/**
 * Get fallback response for a character
 * @param {string} character - Character name
 * @returns {Object} Fallback response with { text, emotion, actions }
 */
function getFallbackResponse(character) {
  const fallbacks = {
    cat: { text: 'Meow!', emotion: 'happy', actions: ['happy_bounce'] },
    dog: { text: 'Woof!', emotion: 'happy', actions: ['happy_bounce'] },
    lizard: { text: 'Hiss...', emotion: 'happy', actions: ['happy_bounce'] },
    snake: { text: 'Sssss...', emotion: 'happy', actions: ['happy_bounce'] },
    unicorn: { text: 'Neigh!', emotion: 'happy', actions: ['happy_bounce'] },
    jigglypuff: { text: 'Jigglypuff!', emotion: 'happy', actions: ['happy_bounce'] },
    pikachu: { text: 'Pika!', emotion: 'happy', actions: ['happy_bounce'] }
  };

  return fallbacks[character] || { text: '', emotion: 'happy', actions: [] };
}

module.exports = {
  parse,
  extractJSON,
  validateStructure,
  normalizeEmotion,
  filterActions
};
