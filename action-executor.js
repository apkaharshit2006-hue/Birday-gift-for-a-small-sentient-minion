'use strict';

/**
 * ActionExecutor Module
 * 
 * Executes character actions and tracks execution status.
 * Validates actions before execution, provides fallback substitution on failure,
 * and logs execution results for debugging and metrics.
 */

const ActionRegistry = require('./action-registry');

/**
 * ExecutionResult object structure
 * @typedef {Object} ExecutionResult
 * @property {string} action - The action that was executed (or attempted)
 * @property {'success'|'failure'} status - Execution status
 * @property {string} [error] - Error message if status is 'failure'
 * @property {number} timestamp - Unix timestamp of execution
 */

/**
 * Execute a list of actions for a character
 * @param {string} character - Character name (cat, dog, lizard, snake, unicorn, jigglypuff, pikachu)
 * @param {string[]} actions - Array of action names to execute
 * @returns {ExecutionResult[]} Array of execution results
 */
function executeActions(character, actions) {
  if (!character || typeof character !== 'string') {
    return [{
      action: 'unknown',
      status: 'failure',
      error: 'Invalid character parameter',
      timestamp: Date.now()
    }];
  }

  if (!Array.isArray(actions) || actions.length === 0) {
    return [{
      action: 'none',
      status: 'failure',
      error: 'No actions provided',
      timestamp: Date.now()
    }];
  }

  const results = [];

  for (const action of actions) {
    const isValid = validateAction(character, action);
    
    if (isValid) {
      // Action is valid - simulate successful execution
      // In a real implementation, this would call the animation system
      const result = {
        action,
        status: 'success',
        timestamp: Date.now()
      };
      logExecution(action, 'success');
      results.push(result);
    } else {
      // Action is invalid - substitute with fallback
      const fallbackAction = substituteAction(character, action);
      const result = {
        action: fallbackAction,
        status: 'failure',
        error: `Invalid action '${action}' substituted with '${fallbackAction}'`,
        timestamp: Date.now()
      };
      logExecution(action, 'failure', result.error);
      results.push(result);
    }
  }

  return results;
}

/**
 * Validate that an action exists for a character
 * @param {string} character - Character name
 * @param {string} action - Action name to validate
 * @returns {boolean} True if action is valid for the character
 */
function validateAction(character, action) {
  if (!action || typeof action !== 'string') {
    return false;
  }
  
  return ActionRegistry.isValidAction(character, action);
}

/**
 * Provide a fallback action when the requested action is invalid
 * @param {string} character - Character name
 * @param {string} action - The invalid action that failed
 * @returns {string} A valid fallback action name
 */
function substituteAction(character, action) {
  // Try to infer a reasonable fallback based on the action name
  const actionLower = action ? action.toLowerCase() : '';
  
  // Emotion-related fallbacks (check these first as they're more specific)
  // Use word boundaries or underscores to match emotion keywords
  if (/(^|_)sad($|_)/.test(actionLower) || actionLower.includes('cry')) {
    return 'sad_droop';
  }
  if (/(^|_)surprise/.test(actionLower) || actionLower.includes('shock')) {
    return 'surprised_jump';
  }
  if (/(^|_)happy($|_)/.test(actionLower) || actionLower.includes('joy')) {
    return 'happy_bounce';
  }
  
  // Movement-related fallbacks
  if (actionLower.includes('walk') || actionLower.includes('move')) {
    return 'walk_random';
  }
  if (actionLower.includes('run') || actionLower.includes('dash') || actionLower.includes('sprint')) {
    return 'run_random';
  }
  if (actionLower.includes('jump') || actionLower.includes('hop') || actionLower.includes('leap')) {
    return 'jump';
  }
  
  // Bounce check (after happy check to avoid conflict)
  if (/(^|_)bounce($|_)/.test(actionLower)) {
    return 'happy_bounce';
  }
  
  // Idle fallback
  if (actionLower.includes('sit') || actionLower.includes('idle') || actionLower.includes('wait')) {
    return 'sit_idle';
  }
  
  // Default universal fallback
  return 'happy_bounce';
}

/**
 * Log execution status for debugging and metrics
 * @param {string} action - Action name
 * @param {'success'|'failure'} status - Execution status
 * @param {string} [error] - Optional error message
 */
function logExecution(action, status, error) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    action,
    status,
    ...(error && { error })
  };
  
  // In a real implementation, this would write to a proper logging system
  // For now, we'll use console in a structured format
  if (status === 'failure') {
    console.error('[ActionExecutor]', JSON.stringify(logEntry));
  } else {
    console.log('[ActionExecutor]', JSON.stringify(logEntry));
  }
}

module.exports = {
  executeActions,
  validateAction,
  substituteAction,
  logExecution
};
