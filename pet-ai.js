'use strict';

// Import new modules
const ResponseParser = require('./response-parser');
const ActionInferenceEngine = require('./action-inference-engine');
const SystemPromptGenerator = require('./system-prompt-generator');

// Maintain backward compatibility: export ACTION_LISTS and ACTION_HINTS
// These are now used as data sources for ActionRegistry and ActionHintSystem
const ACTION_LISTS = {
  cat:        ['walk_left','walk_right','walk_to_center','walk_random','run_left','run_right','run_random','jump','sit_idle','happy_bounce','sad_droop','surprised_jump','scratch','chase_mouse','play_yarn','purr'],
  dog:        ['walk_left','walk_right','walk_to_center','walk_random','run_left','run_right','run_random','jump','sit_idle','happy_bounce','sad_droop','surprised_jump','fetch','howl','play_mug','zoom'],
  lizard:     ['walk_left','walk_right','walk_to_center','walk_random','run_left','run_right','run_random','jump','sit_idle','happy_bounce','sad_droop','surprised_jump','hunt_bug','wall_crawl','tongue_flick'],
  snake:      ['walk_left','walk_right','walk_to_center','walk_random','run_left','run_right','run_random','sit_idle','happy_bounce','sad_droop','surprised_jump','hiss','orbit','slither_random'],
  unicorn:    ['walk_left','walk_right','walk_to_center','walk_random','run_left','run_right','run_random','jump','sit_idle','happy_bounce','sad_droop','surprised_jump','rainbow_vomit','eat_cupcake','gallop'],
  jigglypuff: ['walk_left','walk_right','walk_to_center','walk_random','run_left','run_right','run_random','jump','sit_idle','happy_bounce','sad_droop','surprised_jump','sing','take_mic','angry_scribble'],
  pikachu:    ['walk_left','walk_right','walk_to_center','walk_random','run_left','run_right','run_random','jump','sit_idle','happy_bounce','sad_droop','surprised_jump','thunderbolt','chase_ketchup','show_face_happy','show_face_sad','show_face_surprised','show_face_smug','show_face_derp'],
};

const ACTION_HINTS = {
  cat: [
    { words:['mouse','rat','mice','chase','hunt'], action:'chase_mouse' },
    { words:['yarn','ball'], action:'play_yarn' },
    { words:['scratch','claw'], action:'scratch' },
    { words:['purr'], action:'purr' },
  ],
  dog: [
    { words:['fetch','bone','bring'], action:'fetch' },
    { words:['howl','awoo'], action:'howl' },
    { words:['mug','splash'], action:'play_mug' },
    { words:['zoom','zoomies','dash'], action:'zoom' },
  ],
  lizard: [
    { words:['bug','fly','hunt'], action:'hunt_bug' },
    { words:['wall','crawl','climb'], action:'wall_crawl' },
    { words:['tongue','lick','flick'], action:'tongue_flick' },
  ],
  snake: [
    { words:['hiss'], action:'hiss' },
    { words:['orbit','circle','loop'], action:'orbit' },
    { words:['slither','sneak'], action:'slither_random' },
  ],
  unicorn: [
    { words:['rainbow','vomit','sparkle'], action:'rainbow_vomit' },
    { words:['cupcake','eat','nom'], action:'eat_cupcake' },
    { words:['gallop','dash','sprint'], action:'gallop' },
  ],
  jigglypuff: [
    { words:['sing','song','melody'], action:'sing' },
    { words:['mic','microphone'], action:'take_mic' },
    { words:['scribble','draw','angry'], action:'angry_scribble' },
  ],
  pikachu: [
    { words:['thunder','lightning','zap'], action:'thunderbolt' },
    { words:['ketchup'], action:'chase_ketchup' },
    { words:['happy','smile'], action:'show_face_happy' },
    { words:['sad'], action:'show_face_sad' },
    { words:['surprised','shock'], action:'show_face_surprised' },
    { words:['smug'], action:'show_face_smug' },
    { words:['derp','goofy'], action:'show_face_derp' },
  ],
};

const AI_MODEL = 'phi3:latest';

/**
 * Parse AI response using new ResponseParser module
 * @param {string} pet - Character name
 * @param {string} raw - Raw AI response
 * @returns {Object} Parsed response with { text, emotion, actions }
 */
function parseResponse(pet, raw) {
  return ResponseParser.parse(raw, pet);
}

/**
 * Infer actions from text using new ActionInferenceEngine module
 * @param {string} pet - Character name
 * @param {string} text - Dialogue text
 * @param {string} emotion - Emotion state
 * @returns {string[]} Array of inferred actions
 */
function inferActionsFromText(pet, text, emotion) {
  return ActionInferenceEngine.inferActions(pet, text, emotion);
}

/**
 * Build system prompt using new SystemPromptGenerator module
 * @param {string} pet - Character name
 * @param {string} mode - 'chat' or 'autonomous'
 * @returns {string} System prompt for AI
 */
function buildSystemPrompt(pet, mode='chat') {
  return SystemPromptGenerator.buildSystemPrompt(pet, mode);
}

module.exports = {
  AI_MODEL,
  ACTION_LISTS,
  ACTION_HINTS,
  buildSystemPrompt,
  parseResponse,
  inferActionsFromText,
};
