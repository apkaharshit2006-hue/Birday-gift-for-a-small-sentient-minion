'use strict';

/**
 * AutonomousBehaviorEngine Module
 * 
 * Generates self-initiated character actions with AI or fallback support.
 * Handles autonomous behavior triggers, AI timeouts, and personality-appropriate fallback dialogue.
 */

const { buildSystemPrompt } = require('./system-prompt-generator');
const { parse } = require('./response-parser');
const { inferActions } = require('./action-inference-engine');

/**
 * Fallback dialogue repository for all 7 characters
 * 10-20 personality-appropriate options per character
 */
const FALLBACK_DIALOGUES = {
  cat: [
    "Mrrrow... *stretches* Time for a nap.",
    "*flicks tail* I suppose I could chase something.",
    "Purr... Maybe I'll explore over there.",
    "*yawns* Everything is so boring today.",
    "Meow! I demand attention... but not too much.",
    "*sits and stares* I'm judging you silently.",
    "Mrrp! *pounces at nothing* Got it!",
    "*grooms paw* I'm far too elegant for this.",
    "Meow meow! Where's my food?",
    "*scratches* This spot needs my mark.",
    "Purrrr... *rubs against screen edge*",
    "*chases tail* Wait, that's MY tail!",
    "Mrow! *runs randomly* Zoomies time!",
    "*sits in box* If I fits, I sits.",
    "Meow? *looks around suspiciously*"
  ],
  dog: [
    "WOOF! *tail wag* Let's play!",
    "Bork bork! *runs in circles* ZOOMIES!",
    "*sniff sniff* I smell something interesting!",
    "Woof! *jumps excitedly* Are we going for a WALK?!",
    "*howls* AROOOOO! Just saying hi!",
    "Bork! *fetches imaginary ball* Got it!",
    "*tail wag intensifies* You're the BEST!",
    "Woof woof! *runs left and right* So much energy!",
    "*sits and pants happily* Life is AMAZING!",
    "Bork! *play bow* Let's have fun!",
    "*zooms around* GOTTA GO FAST!",
    "Woof! *splashes in water bowl* Wheee!",
    "*howls at nothing* AROOO! I'm a wolf!",
    "Bork bork! *chases own tail* Almost got it!",
    "*happy bounce* Everything is WONDERFUL!"
  ],
  lizard: [
    "*slow blink* Hmmm... interesting.",
    "*tongue flick* I sense... something.",
    "*basks* The warmth... it sustains me.",
    "Hssss... *climbs slowly* I shall ascend.",
    "*stares motionless* Time is an illusion.",
    "*tongue flick* A bug... perhaps.",
    "*slow walk* No need to rush... ever.",
    "*basks on rock* This is... acceptable.",
    "Hmmm... *flicks tongue* The air tastes... curious.",
    "*climbs wall* Gravity is merely a suggestion.",
    "*sits perfectly still* I am one with the desktop.",
    "*slow blink* You are... tolerable.",
    "*tongue flick* I hunt... eventually.",
    "*basks* The sun... it calls to me.",
    "Hssss... *moves slowly* Patience is wisdom."
  ],
  snake: [
    "Hsssss... *coils up* I'm watching you.",
    "*slithers* Sssso much to explore.",
    "Sssss... *circles* I'm feeling mischievous.",
    "*hiss* Don't underestimate me, human.",
    "*slithers randomly* Sssneaky sssneaky...",
    "Hsssss! *strikes at nothing* Gotcha!",
    "*coils dramatically* I am FEARSOME!",
    "Sssss... *orbits* Round and round I go.",
    "*hiss* This desktop is MINE now.",
    "*slithers left* Sssso ssssmooth...",
    "Hsssss... *menacing pose* Beware!",
    "*circles* Hypnotic, aren't I?",
    "Sssss... *slithers* I move like water.",
    "*hiss hiss* Feeling sssspicy today!",
    "*coils up* Comfortable and dangerous."
  ],
  unicorn: [
    "✨ *shakes rainbow mane* MAGICAL!",
    "*hooves clop* Everything is SPARKLY today!",
    "Neigh! ✨ *gallops* I'm MAJESTIC!",
    "*rainbow vomit* TASTE THE RAINBOW!",
    "✨ *prances* I'm too fabulous for this!",
    "*eats cupcake* Mmm, MAGICAL sweetness!",
    "Neigh neigh! ✨ *sparkles intensify*",
    "*gallops dramatically* BEHOLD MY GLORY!",
    "✨ *shakes mane* Rainbows everywhere!",
    "*prances* I am WONDER incarnate!",
    "Neigh! *rainbow trail* Follow the magic!",
    "✨ *sparkle sparkle* Everything is AMAZING!",
    "*gallops* FASTER THAN DREAMS!",
    "*eats cupcake* ✨ Delicious magic!",
    "Neigh! *majestic pose* I am LEGENDARY!"
  ],
  jigglypuff: [
    "Jigglypuff~ ♪ *puffs up* Time to sing!",
    "*takes mic* ♪ Jiggly jiggly puff puff! ♪",
    "Jigglypuff! *angry* You better listen!",
    "♪ Jigglypuff jiggly~ ♪ *sings beautifully*",
    "*puffs up angrily* You fell asleep?! RUDE!",
    "Jigglypuff puff! *bounces happily*",
    "*takes mic* ♪ My voice is PERFECT! ♪",
    "Jigglypuff! *scribbles on screen* That's what you get!",
    "♪ Jiggly~ ♪ *sings sweetly*",
    "*puffs up* I'm the BEST singer!",
    "Jigglypuff puff! *bounces excitedly*",
    "*angry scribble* Don't ignore my singing!",
    "♪ Jigglypuff~ ♪ *mic in hand*",
    "*puffs up proudly* My voice is a gift!",
    "Jigglypuff! *sings and bounces*"
  ],
  pikachu: [
    "Pika pika! ⚡ *cheeks spark*",
    "Pikachu! *runs around* Pika!",
    "Pika! ⚡ *thunderbolt* Zap zap!",
    "*chases ketchup bottle* PIKA PIKA!",
    "Pikachu! *happy face* Pika!",
    "Pika pika! ⚡ *cheeks spark excitedly*",
    "*runs* Pika pika pikachu!",
    "Pikachu! *surprised face* Pika?!",
    "Pika! *thunderbolt* ⚡ Zap!",
    "*chases ketchup* Pika pika!",
    "Pikachu! *smug face* Pika~",
    "Pika pika! *derp face* Pikaaa...",
    "⚡ Pikachu! *electric sparks*",
    "*happy bounce* Pika pika!",
    "Pikachu! Ketchup! Pika!"
  ],
  person: [
    "u dont care about me...",
    "u dont like me? i knew it.",
    "*sigh* i'm just here i guess.",
    "is it something i said?",
    "fine. be like that.",
    "i'm not in the mood.",
    "*looks away dramatically*",
    "whatever."
  ]
};

/**
 * Trigger autonomous behavior for a character
 * Attempts AI call first, falls back to pre-written dialogue on failure
 * @param {string} character - Character name (cat, dog, lizard, snake, unicorn, jigglypuff, pikachu)
 * @param {Function} aiCallFunction - Optional AI call function for testing (defaults to internal callAI)
 * @returns {Promise<Object>} Response object with { text, emotion, actions, source: 'ai' | 'fallback' }
 */
async function triggerAutonomousBehavior(character, aiCallFunction = null) {
  if (!character) {
    throw new Error('Character is required');
  }

  try {
    // Attempt to call AI with autonomous mode
    const aiCall = aiCallFunction || callAI;
    const rawResponse = await aiCall(character, 'autonomous');
    
    // Parse AI response
    const parsed = parse(rawResponse, character);
    
    return {
      ...parsed,
      source: 'ai',
      timestamp: Date.now()
    };
  } catch (error) {
    // AI failed or timed out, use fallback
    const fallbackText = selectFallbackDialogue(character);
    const inferredActions = inferActionsFromFallback(character, fallbackText);
    
    return {
      text: fallbackText,
      emotion: 'happy',
      actions: inferredActions,
      source: 'fallback',
      timestamp: Date.now(),
      error: error.message
    };
  }
}

/**
 * Call AI with timeout handling
 * @param {string} character - Character name
 * @param {string} mode - 'chat' or 'autonomous'
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<string>} Raw AI response
 * @throws {Error} If AI call fails or times out
 */
async function callAI(character, mode = 'autonomous', timeout = 8000) {
  const systemPrompt = buildSystemPrompt(character, mode);
  const prompt = buildAutonomousPrompt(character);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'phi3:latest',
        system: systemPrompt,
        prompt,
        stream: false,
        options: { temperature: 0.9, num_predict: 150 }
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
    const data = await response.json();
    return data.response || '{}';
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Build an autonomous-mode prompt for a character
 * @param {string} character - Character name
 * @returns {string} Prompt text
 */
function buildAutonomousPrompt(character) {
  const prompts = {
    cat:        'You are bored and want to do something mischievous or cute. Decide what to do.',
    dog:        'You have so much energy! Decide your next playful action.',
    lizard:     'You are basking peacefully. Decide what to do next.',
    snake:      'You feel mischievous. What dramatic thing will you do?',
    unicorn:    'The magic is strong today! Decide your most spectacular action.',
    jigglypuff: 'You really want to sing or get attention. What will you do?',
    pikachu:    'You feel electrically charged! What will you do?',
    person:     'You feel ignored and moody. What sarcastic or needy thing will you say?',
  };
  return prompts[character] || 'Decide what to do next on your own.';
}

/**
 * Select random fallback dialogue for a character
 * @param {string} character - Character name
 * @returns {string} Fallback dialogue text
 */
function selectFallbackDialogue(character) {
  const dialogues = FALLBACK_DIALOGUES[character];
  
  if (!dialogues || dialogues.length === 0) {
    return 'Hello!';
  }
  
  const randomIndex = Math.floor(Math.random() * dialogues.length);
  return dialogues[randomIndex];
}

/**
 * Infer actions from fallback dialogue text
 * Uses ActionInferenceEngine to extract actions from text
 * @param {string} character - Character name
 * @param {string} text - Fallback dialogue text
 * @returns {string[]} Array of inferred actions (max 3)
 */
function inferActionsFromFallback(character, text) {
  if (!character || !text) {
    return [];
  }
  
  // Use ActionInferenceEngine to infer actions from fallback text
  // Default emotion to 'happy' for fallback dialogue
  return inferActions(character, text, 'happy');
}

module.exports = {
  triggerAutonomousBehavior,
  callAI,
  selectFallbackDialogue,
  inferActionsFromFallback,
  FALLBACK_DIALOGUES
};
