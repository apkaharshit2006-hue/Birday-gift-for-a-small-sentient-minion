'use strict';

/**
 * DebugLogger Module
 * 
 * Provides detailed logging of all system events for debugging and analysis.
 * Logs include timestamps, character context, and structured data for export.
 */

class DebugLogger {
  constructor() {
    this.logs = [];
  }

  /**
   * Log raw AI response
   * @param {string} raw - Raw response from AI
   * @param {string} character - Character name
   */
  logRawResponse(raw, character) {
    this.logs.push({
      type: 'raw_response',
      timestamp: Date.now(),
      character,
      data: { raw }
    });
  }

  /**
   * Log parsed response
   * @param {Object} response - Parsed response object
   * @param {string} character - Character name
   */
  logParsedResponse(response, character) {
    this.logs.push({
      type: 'parsed_response',
      timestamp: Date.now(),
      character,
      data: { response }
    });
  }

  /**
   * Log validation result
   * @param {Object} result - Validation result
   * @param {string} character - Character name
   */
  logValidation(result, character) {
    this.logs.push({
      type: 'validation',
      timestamp: Date.now(),
      character,
      data: { result }
    });
  }

  /**
   * Log action execution
   * @param {string} action - Action name
   * @param {string} status - Execution status ('success' or 'failure')
   * @param {string} character - Character name
   */
  logExecution(action, status, character) {
    this.logs.push({
      type: 'execution',
      timestamp: Date.now(),
      character,
      data: { action, status }
    });
  }

  /**
   * Export all logs as JSON
   * @returns {string} JSON string of all logs
   */
  exportLog() {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Get all logs
   * @returns {Array} Array of log entries
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Get logs filtered by type
   * @param {string} type - Log type to filter by
   * @returns {Array} Filtered log entries
   */
  getLogsByType(type) {
    return this.logs.filter(log => log.type === type);
  }

  /**
   * Get logs filtered by character
   * @param {string} character - Character name to filter by
   * @returns {Array} Filtered log entries
   */
  getLogsByCharacter(character) {
    return this.logs.filter(log => log.character === character);
  }

  /**
   * Get logs within a time range
   * @param {number} startTime - Start timestamp
   * @param {number} endTime - End timestamp
   * @returns {Array} Filtered log entries
   */
  getLogsByTimeRange(startTime, endTime) {
    return this.logs.filter(log => log.timestamp >= startTime && log.timestamp <= endTime);
  }
}

// Singleton instance
const logger = new DebugLogger();

module.exports = logger;
