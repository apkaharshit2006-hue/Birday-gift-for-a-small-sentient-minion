'use strict';

/**
 * ActionRegistry Module
 * 
 * Maintains the authoritative list of available actions per character.
 * Separates universal actions (available to all characters) from signature actions
 * (character-specific animations).
 */

const ACTION_LISTS = {
  cat: {
    universal: [
      'walk_left', 'walk_right', 'walk_to_center', 'walk_random',
      'run_left', 'run_right', 'run_random',
      'jump', 'sit_idle', 'start_mini_game',
      'happy_bounce', 'sad_droop', 'surprised_jump'
    ],
    signature: ['scratch', 'chase_mouse', 'play_yarn', 'purr']
  },
  dog: {
    universal: [
      'walk_left', 'walk_right', 'walk_to_center', 'walk_random',
      'run_left', 'run_right', 'run_random',
      'jump', 'sit_idle', 'start_mini_game',
      'happy_bounce', 'sad_droop', 'surprised_jump'
    ],
    signature: ['fetch', 'howl', 'play_mug', 'zoom']
  },
  lizard: {
    universal: [
      'walk_left', 'walk_right', 'walk_to_center', 'walk_random',
      'run_left', 'run_right', 'run_random',
      'jump', 'sit_idle', 'start_mini_game',
      'happy_bounce', 'sad_droop', 'surprised_jump'
    ],
    signature: ['hunt_bug', 'wall_crawl', 'tongue_flick']
  },
  snake: {
    universal: [
      'walk_left', 'walk_right', 'walk_to_center', 'walk_random',
      'run_left', 'run_right', 'run_random',
      'sit_idle', 'start_mini_game',
      'happy_bounce', 'sad_droop', 'surprised_jump'
    ],
    signature: ['hiss', 'orbit', 'slither_random', 'coil']
  },
  unicorn: {
    universal: [
      'walk_left', 'walk_right', 'walk_to_center', 'walk_random',
      'run_left', 'run_right', 'run_random',
      'jump', 'sit_idle', 'start_mini_game',
      'happy_bounce', 'sad_droop', 'surprised_jump'
    ],
    signature: ['rainbow_vomit', 'eat_cupcake', 'gallop']
  },
  jigglypuff: {
    universal: [
      'walk_left', 'walk_right', 'walk_to_center', 'walk_random',
      'run_left', 'run_right', 'run_random',
      'jump', 'sit_idle', 'start_mini_game',
      'happy_bounce', 'sad_droop', 'surprised_jump'
    ],
    signature: ['sing', 'take_mic', 'angry_scribble']
  },
  pikachu: {
    universal: [
      'walk_left', 'walk_right', 'walk_to_center', 'walk_random',
      'run_left', 'run_right', 'run_random',
      'jump', 'sit_idle', 'start_mini_game',
      'happy_bounce', 'sad_droop', 'surprised_jump'
    ],
    signature: [
      'thunderbolt', 'chase_ketchup',
      'show_face_happy', 'show_face_sad', 'show_face_surprised',
      'show_face_smug', 'show_face_derp'
    ]
  },
  person: {
    universal: [
      'walk_left', 'walk_right', 'walk_to_center', 'walk_random',
      'run_left', 'run_right', 'run_random',
      'jump', 'sit_idle', 'start_mini_game',
      'happy_bounce', 'sad_droop', 'surprised_jump'
    ],
    signature: ['moody_stare', 'complain', 'need_attention', 'smile_rarely']
  }
};

/**
 * Get all available actions for a character (universal + signature)
 * @param {string} character - Character name (cat, dog, lizard, snake, unicorn, jigglypuff, pikachu)
 * @returns {string[]} Array of all available action names
 */
function getActions(character) {
  const charData = ACTION_LISTS[character];
  if (!charData) {
    return [];
  }
  return [...charData.universal, ...charData.signature];
}

/**
 * Check if an action is valid for a specific character
 * @param {string} character - Character name
 * @param {string} action - Action name to validate
 * @returns {boolean} True if action is valid for the character
 */
function isValidAction(character, action) {
  const actions = getActions(character);
  return actions.includes(action);
}

/**
 * Get signature (character-specific) actions for a character
 * @param {string} character - Character name
 * @returns {string[]} Array of signature action names
 */
function getSignatureActions(character) {
  const charData = ACTION_LISTS[character];
  if (!charData) {
    return [];
  }
  return [...charData.signature];
}

/**
 * Get universal actions (available to all characters)
 * @returns {string[]} Array of universal action names
 */
function getUniversalActions() {
  // Return universal actions from cat as reference (all characters share these)
  return [...ACTION_LISTS.cat.universal];
}

module.exports = {
  ACTION_LISTS,
  getActions,
  isValidAction,
  getSignatureActions,
  getUniversalActions
};
