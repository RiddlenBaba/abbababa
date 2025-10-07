/**
 * DecisionEngine - Coordinates decisions across agents and resolves conflicts
 * Handles decision requests, conflict resolution, and workflow coordination
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';

export class DecisionEngine extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.logger = new Logger('DecisionEngine');

    this.pendingDecisions = new Map(); // decisionId -> decision context
    this.decisionHistory = []; // Historical decisions for learning
    this.conflictQueue = []; // Active conflicts needing resolution
    this.rules = new Map(); // decision rules and policies

    this.stats = {
      decisionsProcessed: 0,
      conflictsResolved: 0,
      averageDecisionTime: 0
    };

    // Initialize default rules
    this.initializeDefaultRules();
  }

  async initialize() {
    this.logger.info('Initializing decision engine...');

    // Start periodic conflict resolution
    this.startConflictProcessor();

    this.logger.info('Decision engine initialized');
  }

  async shutdown() {
    if (this.conflictProcessor) {
      clearInterval(this.conflictProcessor);
    }

    this.logger.info('Decision engine shut down');
  }

  initializeDefaultRules() {
    // Priority-based rules
    this.addRule('agent_priority', {
      type: 'priority',
      evaluate: (context) => {
        const agents = context.involvedAgents || [];
        return agents.reduce((highest, agent) =>
          (agent.priority || 0) > (highest.priority || 0) ? agent : highest
        );
      }
    });

    // Resource availability rules
    this.addRule('resource_availability', {
      type: 'resource',
      evaluate: (context) => {
        // Check if resources are available for the decision
        const requiredResources = context.requiredResources || [];
        // Implementation would check actual resource availability
        return { available: true, resources: requiredResources };
      }
    });

    // Time-based rules
    this.addRule('time_urgency', {
      type: 'temporal',
      evaluate: (context) => {
        const urgency = context.urgency || 'normal';
        const deadline = context.deadline;

        if (deadline && Date.now() > deadline) {
          return { expired: true, urgency: 'critical' };
        }

        return { expired: false, urgency };
      }
    });
  }

  addRule(name, rule) {
    this.rules.set(name, rule);
    this.logger.debug(`Decision rule added: ${name}`);
  }

  // Main decision processing
  async makeDecision(request) {
    const startTime = Date.now();
    const decisionId = uuidv4();

    const decision = {
      id: decisionId,
      type: request.type,
      context: request.context || {},
      requester: request.requester,
      timestamp: startTime,
      status: 'pending',
      result: null,
      reasoning: []
    };

    this.pendingDecisions.set(decisionId, decision);

    try {
      this.logger.debug(`Processing decision request: ${request.type}`);

      // Check for conflicts first
      const conflicts = await this.detectConflicts(request);

      if (conflicts.length > 0) {
        this.logger.info(`Conflicts detected for decision ${decisionId}`);
        return await this.handleConflicts(decision, conflicts);
      }

      // Process the decision through rules
      const result = await this.processDecisionRules(decision, request);

      // Finalize decision
      decision.result = result;
      decision.status = 'approved';
      decision.processingTime = Date.now() - startTime;

      // Update statistics
      this.updateStats(decision);

      // Store in history
      this.addToHistory(decision);

      this.logger.info(`Decision approved: ${decisionId} (${decision.processingTime}ms)`);

      return decision;

    } catch (error) {
      decision.status = 'failed';
      decision.error = error.message;
      decision.processingTime = Date.now() - startTime;

      this.logger.error(`Decision failed: ${decisionId}`, error);
      throw error;

    } finally {
      this.pendingDecisions.delete(decisionId);
    }
  }

  async processDecisionRules(decision, request) {
    const context = {
      ...request,
      decision,
      timestamp: Date.now()
    };

    const ruleResults = [];

    // Apply all relevant rules
    for (const [ruleName, rule] of this.rules) {
      try {
        if (this.isRuleApplicable(rule, context)) {
          const result = await rule.evaluate(context);
          ruleResults.push({ rule: ruleName, result });
          decision.reasoning.push(`Applied rule: ${ruleName}`);
        }
      } catch (error) {
        this.logger.error(`Rule evaluation error for ${ruleName}:`, error);
      }
    }

    // Combine rule results into final decision
    return this.synthesizeRuleResults(ruleResults, context);
  }

  isRuleApplicable(rule, context) {
    // Check if rule applies to this decision type
    if (rule.applicableTypes && !rule.applicableTypes.includes(context.type)) {
      return false;
    }

    // Check if rule conditions are met
    if (rule.conditions) {
      return rule.conditions(context);
    }

    return true;
  }

  synthesizeRuleResults(ruleResults, context) {
    // Simple synthesis for MVP - can be made more sophisticated
    const synthesis = {
      approved: true,
      confidence: 1.0,
      recommendations: [],
      constraints: []
    };

    for (const { rule, result } of ruleResults) {
      if (result.approved === false) {
        synthesis.approved = false;
        synthesis.reasoning = result.reason || `Rejected by rule: ${rule}`;
      }

      if (result.confidence !== undefined) {
        synthesis.confidence = Math.min(synthesis.confidence, result.confidence);
      }

      if (result.recommendations) {
        synthesis.recommendations.push(...result.recommendations);
      }

      if (result.constraints) {
        synthesis.constraints.push(...result.constraints);
      }
    }

    return synthesis;
  }

  // Conflict detection and resolution
  async detectConflicts(request) {
    const conflicts = [];

    // Check for resource conflicts
    const resourceConflicts = await this.detectResourceConflicts(request);
    conflicts.push(...resourceConflicts);

    // Check for agent conflicts
    const agentConflicts = await this.detectAgentConflicts(request);
    conflicts.push(...agentConflicts);

    // Check for temporal conflicts
    const temporalConflicts = await this.detectTemporalConflicts(request);
    conflicts.push(...temporalConflicts);

    return conflicts;
  }

  async detectResourceConflicts(request) {
    const conflicts = [];
    const requiredResources = request.requiredResources || [];

    // Check if other pending decisions need the same resources
    for (const [decisionId, pendingDecision] of this.pendingDecisions) {
      const otherResources = pendingDecision.context.requiredResources || [];
      const commonResources = requiredResources.filter(r => otherResources.includes(r));

      if (commonResources.length > 0) {
        conflicts.push({
          type: 'resource_conflict',
          conflictingDecision: decisionId,
          conflictingResources: commonResources
        });
      }
    }

    return conflicts;
  }

  async detectAgentConflicts(request) {
    const conflicts = [];
    const involvedAgents = request.involvedAgents || [];

    // Check if agents are involved in conflicting actions
    for (const agent of involvedAgents) {
      for (const [decisionId, pendingDecision] of this.pendingDecisions) {
        const otherAgents = pendingDecision.context.involvedAgents || [];

        if (otherAgents.some(a => a.id === agent.id)) {
          // Check if the actions conflict
          if (this.actionsConflict(request.action, pendingDecision.context.action)) {
            conflicts.push({
              type: 'agent_conflict',
              conflictingDecision: decisionId,
              conflictingAgent: agent.id
            });
          }
        }
      }
    }

    return conflicts;
  }

  async detectTemporalConflicts(request) {
    // Check for timing conflicts - simplified for MVP
    return [];
  }

  actionsConflict(action1, action2) {
    // Simple conflict detection - can be made more sophisticated
    const conflictingPairs = [
      ['create', 'delete'],
      ['start', 'stop'],
      ['enable', 'disable']
    ];

    for (const [a, b] of conflictingPairs) {
      if ((action1 === a && action2 === b) || (action1 === b && action2 === a)) {
        return true;
      }
    }

    return false;
  }

  async handleConflicts(decision, conflicts) {
    this.logger.info(`Handling ${conflicts.length} conflicts for decision ${decision.id}`);

    // Add to conflict queue
    const conflict = {
      id: uuidv4(),
      decision,
      conflicts,
      timestamp: Date.now(),
      status: 'pending'
    };

    this.conflictQueue.push(conflict);
    this.emit('conflict_detected', conflict);

    // For now, return a deferred decision
    decision.status = 'deferred';
    decision.conflicts = conflicts;

    return decision;
  }

  startConflictProcessor() {
    this.conflictProcessor = setInterval(() => {
      this.processConflictQueue();
    }, 1000); // Process every second
  }

  async processConflictQueue() {
    if (this.conflictQueue.length === 0) return;

    const conflict = this.conflictQueue.shift();

    try {
      await this.resolveConflict(conflict);
    } catch (error) {
      this.logger.error(`Failed to resolve conflict ${conflict.id}:`, error);
      // Re-queue for retry (with limit)
      if (conflict.retries < 3) {
        conflict.retries = (conflict.retries || 0) + 1;
        this.conflictQueue.push(conflict);
      }
    }
  }

  async resolveConflict(conflict) {
    this.logger.info(`Resolving conflict: ${conflict.id}`);

    const resolution = await this.determineConflictResolution(conflict);

    // Apply resolution
    switch (resolution.type) {
      case 'priority_winner':
        await this.applyPriorityResolution(conflict, resolution);
        break;

      case 'resource_sharing':
        await this.applyResourceSharing(conflict, resolution);
        break;

      case 'temporal_sequencing':
        await this.applyTemporalSequencing(conflict, resolution);
        break;

      default:
        this.logger.warn(`Unknown resolution type: ${resolution.type}`);
    }

    this.stats.conflictsResolved++;
    this.emit('conflict_resolved', { conflict, resolution });
  }

  async determineConflictResolution(conflict) {
    // Simple priority-based resolution for MVP
    const decision = conflict.decision;
    const priority = decision.context.priority || 0;

    // Check priorities of conflicting decisions
    let highestPriority = priority;
    let winner = decision;

    for (const conf of conflict.conflicts) {
      const conflictingDecision = this.pendingDecisions.get(conf.conflictingDecision);
      if (conflictingDecision) {
        const confPriority = conflictingDecision.context.priority || 0;
        if (confPriority > highestPriority) {
          highestPriority = confPriority;
          winner = conflictingDecision;
        }
      }
    }

    return {
      type: 'priority_winner',
      winner: winner.id,
      reason: `Highest priority: ${highestPriority}`
    };
  }

  async applyPriorityResolution(conflict, resolution) {
    const winnerDecision = this.pendingDecisions.get(resolution.winner);

    if (winnerDecision) {
      // Approve the winner
      winnerDecision.status = 'approved';
      winnerDecision.result = { approved: true, reason: resolution.reason };

      // Reject others
      if (conflict.decision.id !== resolution.winner) {
        conflict.decision.status = 'rejected';
        conflict.decision.result = { approved: false, reason: 'Conflict resolution - lower priority' };
      }
    }
  }

  async applyResourceSharing(conflict, resolution) {
    // Implementation for resource sharing resolution
    this.logger.debug('Applying resource sharing resolution');
  }

  async applyTemporalSequencing(conflict, resolution) {
    // Implementation for temporal sequencing
    this.logger.debug('Applying temporal sequencing resolution');
  }

  // Decision history and analytics
  addToHistory(decision) {
    this.decisionHistory.push({
      ...decision,
      finalizedAt: Date.now()
    });

    // Keep only recent history (for memory management)
    const maxHistory = 1000;
    if (this.decisionHistory.length > maxHistory) {
      this.decisionHistory = this.decisionHistory.slice(-maxHistory);
    }
  }

  updateStats(decision) {
    this.stats.decisionsProcessed++;

    // Update average processing time
    const currentAvg = this.stats.averageDecisionTime;
    const count = this.stats.decisionsProcessed;
    this.stats.averageDecisionTime = (currentAvg * (count - 1) + decision.processingTime) / count;
  }

  // Public API
  getDecision(decisionId) {
    return this.pendingDecisions.get(decisionId);
  }

  getDecisionHistory(filters = {}) {
    let history = [...this.decisionHistory];

    if (filters.type) {
      history = history.filter(d => d.type === filters.type);
    }

    if (filters.status) {
      history = history.filter(d => d.status === filters.status);
    }

    if (filters.since) {
      history = history.filter(d => d.timestamp >= filters.since);
    }

    return history.slice(0, filters.limit || 100);
  }

  getStats() {
    return {
      ...this.stats,
      pendingDecisions: this.pendingDecisions.size,
      activeConflicts: this.conflictQueue.length,
      totalRules: this.rules.size
    };
  }

  // For testing and debugging
  getPendingDecisions() {
    return Array.from(this.pendingDecisions.values());
  }

  getConflictQueue() {
    return [...this.conflictQueue];
  }
}