'use strict';

/**
 * CoherenceMetricsEngine Module
 * 
 * Tracks and aggregates coherence scores and metrics over time.
 * Provides per-character and per-type breakdowns for analysis.
 */

class CoherenceMetricsEngine {
  constructor() {
    this.responses = [];
  }

  /**
   * Record a response for metrics tracking
   * @param {Object} response - Response object with text, emotion, actions
   * @param {string} character - Character name
   * @param {string} type - Interaction type ('chat' or 'autonomous')
   */
  recordResponse(response, character, type) {
    if (!response || !character || !type) {
      return;
    }

    this.responses.push({
      timestamp: Date.now(),
      character,
      type,
      response
    });
  }

  /**
   * Calculate aggregated metrics
   * @param {Object} filter - Optional filter { character, type, startTime, endTime }
   * @returns {Object} Metrics object
   */
  calculateMetrics(filter = {}) {
    let filtered = this.responses;

    // Apply filters
    if (filter.character) {
      filtered = filtered.filter(r => r.character === filter.character);
    }
    if (filter.type) {
      filtered = filtered.filter(r => r.type === filter.type);
    }
    if (filter.startTime) {
      filtered = filtered.filter(r => r.timestamp >= filter.startTime);
    }
    if (filter.endTime) {
      filtered = filtered.filter(r => r.timestamp <= filter.endTime);
    }

    const totalResponses = filtered.length;

    if (totalResponses === 0) {
      return {
        totalResponses: 0,
        averageCoherence: 0,
        byCharacter: {},
        byType: { chat: 0, autonomous: 0 }
      };
    }

    // Calculate by character
    const byCharacter = {};
    const characters = [...new Set(filtered.map(r => r.character))];
    
    characters.forEach(char => {
      const charResponses = filtered.filter(r => r.character === char);
      byCharacter[char] = {
        count: charResponses.length,
        percentage: (charResponses.length / totalResponses * 100).toFixed(1)
      };
    });

    // Calculate by type
    const chatCount = filtered.filter(r => r.type === 'chat').length;
    const autonomousCount = filtered.filter(r => r.type === 'autonomous').length;

    const byType = {
      chat: chatCount,
      autonomous: autonomousCount
    };

    // Average coherence (placeholder - would need actual coherence scores)
    const averageCoherence = 0;

    return {
      totalResponses,
      averageCoherence,
      byCharacter,
      byType
    };
  }

  /**
   * Get coherence score for a character and/or type
   * @param {string} character - Optional character filter
   * @param {string} type - Optional type filter
   * @returns {number} Average coherence score (0-100)
   */
  getCoherenceScore(character, type) {
    let filtered = this.responses;

    if (character) {
      filtered = filtered.filter(r => r.character === character);
    }
    if (type) {
      filtered = filtered.filter(r => r.type === type);
    }

    if (filtered.length === 0) {
      return 0;
    }

    // Placeholder: would calculate actual coherence scores
    // For now, return a default value
    return 0;
  }

  /**
   * Export metrics as JSON
   * @returns {string} JSON string of metrics
   */
  exportMetrics() {
    const metrics = this.calculateMetrics();
    return JSON.stringify(metrics, null, 2);
  }

  /**
   * Get all recorded responses
   * @returns {Array} Array of response records
   */
  getResponses() {
    return [...this.responses];
  }

  /**
   * Clear all recorded responses
   */
  clearResponses() {
    this.responses = [];
  }

  /**
   * Get response count
   * @returns {number} Total number of recorded responses
   */
  getResponseCount() {
    return this.responses.length;
  }

  /**
   * Get responses by character
   * @param {string} character - Character name
   * @returns {Array} Filtered response records
   */
  getResponsesByCharacter(character) {
    return this.responses.filter(r => r.character === character);
  }

  /**
   * Get responses by type
   * @param {string} type - Interaction type ('chat' or 'autonomous')
   * @returns {Array} Filtered response records
   */
  getResponsesByType(type) {
    return this.responses.filter(r => r.type === type);
  }
}

// Singleton instance
const metricsEngine = new CoherenceMetricsEngine();

module.exports = metricsEngine;
