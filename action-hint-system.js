'use strict';

/**
 * ActionHintSystem Module
 * 
 * Maps dialogue keywords to character actions, helping the AI understand
 * which words should trigger specific animations. Provides structured
 * keyword-to-action mappings with proper methods for keyword matching.
 */

const ACTION_HINTS = {
  cat: [
    { words: ['game', 'play', 'challenge', 'mini game', 'minigame'], action: 'start_mini_game' },
    { words: ['mouse', 'rat', 'mice', 'chase', 'hunt'], action: 'chase_mouse' },
    { words: ['yarn', 'ball'], action: 'play_yarn' },
    { words: ['scratch', 'claw'], action: 'scratch' },
    { words: ['purr'], action: 'purr' }
  ],
  dog: [
    { words: ['game', 'play', 'challenge', 'mini game', 'minigame'], action: 'start_mini_game' },
    { words: ['fetch', 'bone', 'bring'], action: 'fetch' },
    { words: ['howl', 'awoo'], action: 'howl' },
    { words: ['mug', 'splash'], action: 'play_mug' },
    { words: ['zoom', 'zoomies', 'dash'], action: 'zoom' }
  ],
  lizard: [
    { words: ['game', 'play', 'challenge', 'mini game', 'minigame'], action: 'start_mini_game' },
    { words: ['bug', 'fly', 'hunt'], action: 'hunt_bug' },
    { words: ['wall', 'crawl', 'climb'], action: 'wall_crawl' },
    { words: ['tongue', 'lick', 'flick'], action: 'tongue_flick' }
  ],
  snake: [
    { words: ['game', 'play', 'challenge', 'mini game', 'minigame'], action: 'start_mini_game' },
    { words: ['hiss'], action: 'hiss' },
    { words: ['orbit', 'circle', 'loop'], action: 'orbit' },
    { words: ['slither', 'sneak'], action: 'slither_random' },
    { words: ['coil', 'curl'], action: 'coil' }
  ],
  unicorn: [
    { words: ['game', 'play', 'challenge', 'mini game', 'minigame'], action: 'start_mini_game' },
    { words: ['rainbow', 'vomit', 'sparkle'], action: 'rainbow_vomit' },
    { words: ['cupcake', 'eat', 'nom'], action: 'eat_cupcake' },
    { words: ['gallop', 'dash', 'sprint'], action: 'gallop' }
  ],
  jigglypuff: [
    { words: ['game', 'play', 'challenge', 'mini game', 'minigame'], action: 'start_mini_game' },
    { words: ['sing', 'song', 'melody'], action: 'sing' },
    { words: ['mic', 'microphone'], action: 'take_mic' },
    { words: ['scribble', 'draw', 'angry'], action: 'angry_scribble' }
  ],
  pikachu: [
    { words: ['game', 'play', 'challenge', 'mini game', 'minigame'], action: 'start_mini_game' },
    { words: ['thunder', 'lightning', 'zap'], action: 'thunderbolt' },
    { words: ['ketchup'], action: 'chase_ketchup' },
    { words: ['happy', 'smile'], action: 'show_face_happy' },
    { words: ['sad'], action: 'show_face_sad' },
    { words: ['surprised', 'shock'], action: 'show_face_surprised' },
    { words: ['smug'], action: 'show_face_smug' },
    { words: ['derp', 'goofy'], action: 'show_face_derp' }
  ],
  person: [
    { words: ['game', 'play', 'challenge', 'mini game', 'minigame'], action: 'start_mini_game' },
    { words: ['care', 'dont care', 'ignore'], action: 'complain' },
    { words: ['like me', 'dont like'], action: 'need_attention' },
    { words: ['stare', 'moody', 'glance'], action: 'moody_stare' },
    { words: ['happy', 'smile'], action: 'smile_rarely' }
  ]
};

/**
 * Get action hints for a specific character
 * @param {string} character - Character name (cat, dog, lizard, snake, unicorn, jigglypuff, pikachu)
 * @returns {Array<{words: string[], action: string}>} Array of hint objects
 */
function getHints(character) {
  return ACTION_HINTS[character] || [];
}

/**
 * Check if text contains any of the specified keywords
 * @param {string} text - Text to search in (case-insensitive)
 * @param {string[]} keywords - Array of keywords to search for
 * @returns {boolean} True if any keyword is found in the text
 */
function matchKeywords(text, keywords) {
  if (!text || !Array.isArray(keywords)) {
    return false;
  }
  
  const lowerText = String(text).toLowerCase();
  return keywords.some(keyword => {
    const lowerKeyword = String(keyword).toLowerCase();
    return lowerText.includes(lowerKeyword);
  });
}

module.exports = {
  ACTION_HINTS,
  getHints,
  matchKeywords
};
