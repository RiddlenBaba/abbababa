/**
 * AgentRegistry - Manages agent lifecycle and capabilities
 * Handles creation, registration, monitoring, and removal of agents
 */

import { EventEmitter } from 'events';
import { Logger } from '../utils/logger.js';

export class AgentRegistry extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.logger = new Logger('AgentRegistry');

    this.agents = new Map(); // agentId -> agent instance
    this.agentTypes = new Map(); // agentType -> class constructor
    this.capabilities = new Map(); // capability -> agent IDs
    this.healthCheckInterval = null;

    // Register built-in agent types
    this.registerBuiltInAgents();
  }

  async initialize() {
    this.logger.info('Initializing agent registry...');

    // Start health monitoring
    this.startHealthChecking();

    this.logger.info('Agent registry initialized');
  }

  async shutdown() {
    this.logger.info('Shutting down agent registry...');

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Stop all agents
    for (const agent of this.agents.values()) {
      try {
        await agent.stop();
      } catch (error) {
        this.logger.error(`Error stopping agent ${agent.id}:`, error);
      }
    }

    this.agents.clear();
    this.logger.info('Agent registry shut down');
  }

  registerBuiltInAgents() {
    // Import and register built-in agent types
    // This would be expanded as we add more agent types
    this.logger.debug('Registering built-in agent types...');

    // For now, we'll register them when needed
    // In a full implementation, this would dynamically load agent classes
  }

  // Agent type registration
  registerAgentType(typeName, agentClass) {
    this.agentTypes.set(typeName, agentClass);
    this.logger.info(`Agent type registered: ${typeName}`);
  }

  getAgentTypes() {
    return Array.from(this.agentTypes.keys());
  }

  // Agent creation and management
  async createAgent(config) {
    const { type, id, ...agentConfig } = config;

    if (!type || !id) {
      throw new Error('Agent type and id are required');
    }

    if (this.agents.has(id)) {
      throw new Error(`Agent with id ${id} already exists`);
    }

    if (this.agents.size >= this.config.maxAgents) {
      throw new Error(`Maximum number of agents (${this.config.maxAgents}) reached`);
    }

    // Get agent class
    const AgentClass = this.getAgentClass(type);
    if (!AgentClass) {
      throw new Error(`Unknown agent type: ${type}`);
    }

    try {
      // Create agent instance
      const agent = new AgentClass({
        id,
        type,
        registry: this,
        ...agentConfig
      });

      // Initialize the agent
      await agent.initialize();

      // Register agent
      this.agents.set(id, agent);

      // Register capabilities
      this.registerAgentCapabilities(agent);

      // Set up event forwarding
      this.setupAgentEvents(agent);

      this.logger.info(`Agent created: ${id} (${type})`);
      this.emit('agent_registered', agent);

      return agent;
    } catch (error) {
      this.logger.error(`Failed to create agent ${id}:`, error);
      throw error;
    }
  }

  getAgentClass(type) {
    // For MVP, we'll use a simple factory pattern
    if (this.agentTypes.has(type)) {
      return this.agentTypes.get(type);
    }

    // Try to dynamically import the agent class
    try {
      return this.loadAgentClass(type);
    } catch (error) {
      this.logger.error(`Failed to load agent class ${type}:`, error);
      return null;
    }
  }

  loadAgentClass(type) {
    // Dynamic loading for built-in agents
    switch (type) {
      case 'CustomerJourneyAgent':
        return this.loadCustomerJourneyAgent();
      case 'SalesAgent':
        return this.loadSalesAgent();
      case 'MarketingAgent':
        return this.loadMarketingAgent();
      default:
        throw new Error(`No built-in agent for type: ${type}`);
    }
  }

  loadCustomerJourneyAgent() {
    // For now, return a placeholder class
    // In full implementation, this would import from ../agents/
    return class CustomerJourneyAgent {
      constructor(config) {
        this.id = config.id;
        this.type = config.type;
        this.capabilities = ['lead-enrichment', 'cross-department-coordination'];
        this.status = 'created';
        this.startTime = Date.now();
      }

      async initialize() {
        this.status = 'initialized';
      }

      async start() {
        this.status = 'running';
      }

      async stop() {
        this.status = 'stopped';
      }

      getHealthStatus() {
        return { status: this.status, uptime: Date.now() - this.startTime };
      }
    };
  }

  loadSalesAgent() {
    return class SalesAgent {
      constructor(config) {
        this.id = config.id;
        this.type = config.type;
        this.capabilities = ['lead-qualification', 'opportunity-scoring'];
        this.status = 'created';
        this.startTime = Date.now();
      }

      async initialize() { this.status = 'initialized'; }
      async start() { this.status = 'running'; }
      async stop() { this.status = 'stopped'; }
      getHealthStatus() { return { status: this.status, uptime: Date.now() - this.startTime }; }
    };
  }

  loadMarketingAgent() {
    return class MarketingAgent {
      constructor(config) {
        this.id = config.id;
        this.type = config.type;
        this.capabilities = ['campaign-optimization', 'audience-targeting'];
        this.status = 'created';
        this.startTime = Date.now();
      }

      async initialize() { this.status = 'initialized'; }
      async start() { this.status = 'running'; }
      async stop() { this.status = 'stopped'; }
      getHealthStatus() { return { status: this.status, uptime: Date.now() - this.startTime }; }
    };
  }

  registerAgentCapabilities(agent) {
    if (!agent.capabilities) return;

    for (const capability of agent.capabilities) {
      if (!this.capabilities.has(capability)) {
        this.capabilities.set(capability, new Set());
      }
      this.capabilities.get(capability).add(agent.id);
    }

    this.logger.debug(`Registered capabilities for ${agent.id}:`, agent.capabilities);
  }

  unregisterAgentCapabilities(agent) {
    if (!agent.capabilities) return;

    for (const capability of agent.capabilities) {
      const agentSet = this.capabilities.get(capability);
      if (agentSet) {
        agentSet.delete(agent.id);
        if (agentSet.size === 0) {
          this.capabilities.delete(capability);
        }
      }
    }
  }

  setupAgentEvents(agent) {
    agent.on('error', (error) => {
      this.logger.error(`Agent ${agent.id} error:`, error);
      this.handleAgentError(agent, error);
    });

    agent.on('status_changed', (status) => {
      this.logger.debug(`Agent ${agent.id} status changed to: ${status}`);
    });

    agent.on('capability_added', (capability) => {
      this.registerAgentCapabilities(agent);
    });

    agent.on('capability_removed', (capability) => {
      this.unregisterAgentCapabilities(agent);
    });
  }

  async removeAgent(agentId) {
    const agent = this.agents.get(agentId);

    if (!agent) {
      this.logger.warn(`Cannot remove agent ${agentId}: not found`);
      return false;
    }

    try {
      // Stop the agent
      await agent.stop();

      // Unregister capabilities
      this.unregisterAgentCapabilities(agent);

      // Remove from registry
      this.agents.delete(agentId);

      this.logger.info(`Agent removed: ${agentId}`);
      this.emit('agent_removed', agentId);

      return true;
    } catch (error) {
      this.logger.error(`Error removing agent ${agentId}:`, error);
      throw error;
    }
  }

  // Agent querying
  getAgent(agentId) {
    return this.agents.get(agentId);
  }

  listAgents() {
    return Array.from(this.agents.values());
  }

  getActiveAgents() {
    return this.listAgents().filter(agent => agent.status === 'running');
  }

  getAgentsByType(type) {
    return this.listAgents().filter(agent => agent.type === type);
  }

  getAgentsByCapability(capability) {
    const agentIds = this.capabilities.get(capability);
    if (!agentIds) return [];

    return Array.from(agentIds)
      .map(id => this.agents.get(id))
      .filter(agent => agent && agent.status === 'running');
  }

  // Agent discovery
  findAgentsForTask(task) {
    const { requiredCapabilities, preferredType, excludeAgents } = task;
    const candidates = [];

    for (const agent of this.getActiveAgents()) {
      // Skip excluded agents
      if (excludeAgents && excludeAgents.includes(agent.id)) {
        continue;
      }

      // Check required capabilities
      if (requiredCapabilities) {
        const hasAllCapabilities = requiredCapabilities.every(cap =>
          agent.capabilities && agent.capabilities.includes(cap)
        );
        if (!hasAllCapabilities) continue;
      }

      // Score the agent
      let score = 1;

      // Prefer specific type
      if (preferredType && agent.type === preferredType) {
        score += 2;
      }

      // Consider agent load/health
      const health = agent.getHealthStatus();
      if (health.status === 'running') {
        score += 1;
      }

      candidates.push({ agent, score });
    }

    // Sort by score (highest first)
    candidates.sort((a, b) => b.score - a.score);

    return candidates.map(c => c.agent);
  }

  // Health monitoring
  startHealthChecking() {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval || 15000);
  }

  async performHealthCheck() {
    const unhealthyAgents = [];

    for (const agent of this.agents.values()) {
      try {
        const health = agent.getHealthStatus();

        if (health.status === 'error' || health.status === 'crashed') {
          unhealthyAgents.push(agent);
        }
      } catch (error) {
        this.logger.error(`Health check failed for agent ${agent.id}:`, error);
        unhealthyAgents.push(agent);
      }
    }

    // Handle unhealthy agents
    for (const agent of unhealthyAgents) {
      await this.handleUnhealthyAgent(agent);
    }
  }

  async handleUnhealthyAgent(agent) {
    this.logger.warn(`Handling unhealthy agent: ${agent.id}`);

    if (this.config.restartOnFailure) {
      try {
        this.logger.info(`Restarting agent: ${agent.id}`);
        await agent.stop();
        await agent.start();
        this.logger.info(`Agent ${agent.id} restarted successfully`);
      } catch (error) {
        this.logger.error(`Failed to restart agent ${agent.id}:`, error);
        // If restart fails, remove the agent
        await this.removeAgent(agent.id);
      }
    } else {
      // Just remove the agent
      await this.removeAgent(agent.id);
    }
  }

  async handleAgentError(agent, error) {
    this.logger.error(`Agent ${agent.id} encountered error:`, error);

    // Emit error event
    this.emit('agent_error', { agent, error });

    // Handle based on error type
    if (error.critical) {
      await this.handleUnhealthyAgent(agent);
    }
  }

  // Statistics
  getStats() {
    const agents = this.listAgents();
    const activeAgents = this.getActiveAgents();

    const statsByType = {};
    for (const agent of agents) {
      statsByType[agent.type] = (statsByType[agent.type] || 0) + 1;
    }

    return {
      totalAgents: agents.length,
      activeAgents: activeAgents.length,
      agentsByType: statsByType,
      availableCapabilities: Array.from(this.capabilities.keys()),
      registeredTypes: this.getAgentTypes()
    };
  }
}