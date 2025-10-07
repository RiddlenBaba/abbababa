/**
 * ContextManager - Shared context and memory system for agents
 * Manages organizational knowledge, insights, and cross-departmental data
 */

import { EventEmitter } from 'events';
import { Logger } from '../utils/logger.js';

export class ContextManager extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.logger = new Logger('ContextManager');

    // In-memory storage for MVP (can be replaced with Redis/DB later)
    this.contexts = new Map(); // key -> context data
    this.insights = new Map(); // insight ID -> insight data
    this.relationships = new Map(); // entity ID -> related entities
    this.history = []; // chronological context changes

    // Performance tracking
    this.stats = {
      contextsCreated: 0,
      contextsUpdated: 0,
      insightsGenerated: 0,
      queriesProcessed: 0
    };
  }

  async initialize() {
    this.logger.info('Initializing context manager...');

    // Start cleanup interval for expired contexts
    this.startCleanupInterval();

    this.logger.info('Context manager initialized');
  }

  async shutdown() {
    this.logger.info('Shutting down context manager...');

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Optionally persist important contexts before shutdown
    await this.persistCriticalContexts();

    this.logger.info('Context manager shut down');
  }

  // Context management
  async setContext(key, data, options = {}) {
    const context = {
      key,
      data,
      timestamp: Date.now(),
      ttl: options.ttl || this.config.ttl,
      source: options.source || 'unknown',
      priority: options.priority || 'normal',
      tags: options.tags || [],
      relationships: options.relationships || []
    };

    const isUpdate = this.contexts.has(key);
    this.contexts.set(key, context);

    // Track in history
    this.history.push({
      action: isUpdate ? 'update' : 'create',
      key,
      timestamp: Date.now(),
      source: options.source
    });

    // Update statistics
    if (isUpdate) {
      this.stats.contextsUpdated++;
    } else {
      this.stats.contextsCreated++;
    }

    // Process relationships
    this.updateRelationships(key, context.relationships);

    // Check for insights
    await this.analyzeForInsights(key, context);

    // Emit events
    this.emit('context_updated', { key, context, isUpdate });

    this.logger.debug(`Context ${isUpdate ? 'updated' : 'created'}: ${key}`);
    return context;
  }

  async getContext(key, options = {}) {
    this.stats.queriesProcessed++;

    const context = this.contexts.get(key);

    if (!context) {
      return null;
    }

    // Check if context has expired
    if (this.isExpired(context)) {
      this.contexts.delete(key);
      return null;
    }

    // Include related contexts if requested
    if (options.includeRelated) {
      context.relatedContexts = await this.getRelatedContexts(key);
    }

    return context;
  }

  async queryContexts(query) {
    this.stats.queriesProcessed++;

    const results = [];

    for (const [key, context] of this.contexts) {
      if (this.isExpired(context)) {
        this.contexts.delete(key);
        continue;
      }

      if (this.matchesQuery(context, query)) {
        results.push(context);
      }
    }

    // Sort by relevance/timestamp
    results.sort((a, b) => {
      if (query.sortBy === 'timestamp') {
        return b.timestamp - a.timestamp;
      }
      return 0; // Default ordering
    });

    this.logger.debug(`Query returned ${results.length} results`);
    return results;
  }

  async deleteContext(key) {
    const context = this.contexts.get(key);

    if (context) {
      this.contexts.delete(key);
      this.removeRelationships(key);

      this.history.push({
        action: 'delete',
        key,
        timestamp: Date.now()
      });

      this.emit('context_deleted', { key, context });
      this.logger.debug(`Context deleted: ${key}`);
      return true;
    }

    return false;
  }

  // Relationship management
  updateRelationships(entityId, relationships) {
    if (!relationships || relationships.length === 0) return;

    const existing = this.relationships.get(entityId) || new Set();

    for (const related of relationships) {
      existing.add(related);

      // Create bidirectional relationships
      const relatedSet = this.relationships.get(related) || new Set();
      relatedSet.add(entityId);
      this.relationships.set(related, relatedSet);
    }

    this.relationships.set(entityId, existing);
  }

  removeRelationships(entityId) {
    const related = this.relationships.get(entityId);

    if (related) {
      // Remove bidirectional references
      for (const relatedId of related) {
        const relatedSet = this.relationships.get(relatedId);
        if (relatedSet) {
          relatedSet.delete(entityId);
        }
      }

      this.relationships.delete(entityId);
    }
  }

  async getRelatedContexts(entityId, maxDepth = 1) {
    const related = new Map();
    const visited = new Set();

    await this.traverseRelationships(entityId, related, visited, 0, maxDepth);

    return Array.from(related.values());
  }

  async traverseRelationships(entityId, results, visited, depth, maxDepth) {
    if (depth >= maxDepth || visited.has(entityId)) return;

    visited.add(entityId);
    const relationships = this.relationships.get(entityId);

    if (!relationships) return;

    for (const relatedId of relationships) {
      const context = await this.getContext(relatedId);
      if (context) {
        results.set(relatedId, context);

        if (depth < maxDepth - 1) {
          await this.traverseRelationships(relatedId, results, visited, depth + 1, maxDepth);
        }
      }
    }
  }

  // Insight generation and analysis
  async analyzeForInsights(contextKey, context) {
    // Simple pattern-based insights for MVP
    const insights = [];

    // Look for patterns across similar contexts
    const similarContexts = await this.findSimilarContexts(context);

    if (similarContexts.length > 2) {
      insights.push({
        type: 'pattern_detected',
        description: `Recurring pattern detected in ${context.source}`,
        contexts: similarContexts.map(c => c.key),
        confidence: 0.8,
        suggestions: ['Consider automation opportunity', 'Review process efficiency']
      });
    }

    // Look for anomalies
    if (this.detectAnomaly(context, similarContexts)) {
      insights.push({
        type: 'anomaly_detected',
        description: `Unusual pattern in ${contextKey}`,
        context: contextKey,
        confidence: 0.7,
        suggestions: ['Investigate cause', 'Update process documentation']
      });
    }

    // Generate insights
    for (const insight of insights) {
      await this.generateInsight(insight);
    }
  }

  async generateInsight(insightData) {
    const insight = {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...insightData,
      timestamp: Date.now(),
      status: 'new',
      impact: 'medium' // Could be calculated based on context
    };

    this.insights.set(insight.id, insight);
    this.stats.insightsGenerated++;

    this.emit('insight_discovered', insight);
    this.logger.info(`New insight generated: ${insight.type}`);

    return insight;
  }

  async findSimilarContexts(targetContext, limit = 10) {
    const similar = [];

    for (const [key, context] of this.contexts) {
      if (key === targetContext.key || this.isExpired(context)) continue;

      const similarity = this.calculateSimilarity(targetContext, context);
      if (similarity > 0.7) { // Threshold for similarity
        similar.push({ ...context, similarity });
      }
    }

    return similar
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  calculateSimilarity(context1, context2) {
    let score = 0;
    let factors = 0;

    // Compare sources
    if (context1.source === context2.source) {
      score += 0.3;
    }
    factors += 0.3;

    // Compare tags
    if (context1.tags && context2.tags) {
      const commonTags = context1.tags.filter(tag => context2.tags.includes(tag));
      score += (commonTags.length / Math.max(context1.tags.length, context2.tags.length)) * 0.4;
    }
    factors += 0.4;

    // Compare priority
    if (context1.priority === context2.priority) {
      score += 0.1;
    }
    factors += 0.1;

    // Compare data structure (simple comparison)
    const dataScore = this.compareDataStructure(context1.data, context2.data);
    score += dataScore * 0.2;
    factors += 0.2;

    return factors > 0 ? score / factors : 0;
  }

  compareDataStructure(data1, data2) {
    if (typeof data1 !== typeof data2) return 0;

    if (typeof data1 === 'object' && data1 !== null && data2 !== null) {
      const keys1 = Object.keys(data1);
      const keys2 = Object.keys(data2);
      const commonKeys = keys1.filter(key => keys2.includes(key));

      return commonKeys.length / Math.max(keys1.length, keys2.length);
    }

    return data1 === data2 ? 1 : 0;
  }

  detectAnomaly(context, similarContexts) {
    if (similarContexts.length < 3) return false;

    // Simple anomaly detection based on data patterns
    // This could be enhanced with ML algorithms

    // For now, just check if this context is very different from similar ones
    const avgSimilarity = similarContexts.reduce((sum, ctx) => sum + ctx.similarity, 0) / similarContexts.length;

    return avgSimilarity < 0.5; // Threshold for anomaly
  }

  // Query matching
  matchesQuery(context, query) {
    if (!query) return true;

    // Match by source
    if (query.source && context.source !== query.source) {
      return false;
    }

    // Match by tags
    if (query.tags && query.tags.length > 0) {
      const hasMatchingTag = query.tags.some(tag => context.tags.includes(tag));
      if (!hasMatchingTag) return false;
    }

    // Match by priority
    if (query.priority && context.priority !== query.priority) {
      return false;
    }

    // Match by time range
    if (query.after && context.timestamp < query.after) {
      return false;
    }

    if (query.before && context.timestamp > query.before) {
      return false;
    }

    // Match by data content (simple text search)
    if (query.contains) {
      const dataStr = JSON.stringify(context.data).toLowerCase();
      const searchStr = query.contains.toLowerCase();
      if (!dataStr.includes(searchStr)) {
        return false;
      }
    }

    return true;
  }

  // Utility methods
  isExpired(context) {
    if (!context.ttl) return false;
    return (Date.now() - context.timestamp) > (context.ttl * 1000);
  }

  startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredContexts();
    }, 60000); // Run every minute
  }

  cleanupExpiredContexts() {
    let cleaned = 0;

    for (const [key, context] of this.contexts) {
      if (this.isExpired(context)) {
        this.contexts.delete(key);
        this.removeRelationships(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired contexts`);
    }
  }

  async persistCriticalContexts() {
    // In the MVP, this is a placeholder
    // In production, this would save important contexts to persistent storage
    this.logger.debug('Persisting critical contexts (placeholder)');
  }

  // Statistics and monitoring
  getStats() {
    return {
      ...this.stats,
      totalContexts: this.contexts.size,
      totalInsights: this.insights.size,
      totalRelationships: this.relationships.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  estimateMemoryUsage() {
    // Rough estimate of memory usage
    const contextSize = JSON.stringify(Array.from(this.contexts.values())).length;
    const insightSize = JSON.stringify(Array.from(this.insights.values())).length;
    const relationshipSize = JSON.stringify(Array.from(this.relationships.entries())).length;

    return contextSize + insightSize + relationshipSize;
  }

  // Public API methods for agents
  async shareContext(agentId, key, data, options = {}) {
    return this.setContext(key, data, { ...options, source: agentId });
  }

  async requestContext(agentId, key) {
    return this.getContext(key);
  }

  async searchContext(agentId, query) {
    return this.queryContexts(query);
  }

  async getInsights(agentId, filters = {}) {
    const insights = Array.from(this.insights.values());

    return insights.filter(insight => {
      if (filters.type && insight.type !== filters.type) return false;
      if (filters.minConfidence && insight.confidence < filters.minConfidence) return false;
      if (filters.status && insight.status !== filters.status) return false;
      return true;
    });
  }
}