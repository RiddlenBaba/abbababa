/**
 * MyceliumCore - Central Hub for the distributed AI network
 *
 * The core orchestrates agents, manages shared context, and coordinates
 * intelligent workflows across the organization.
 */

import { EventEmitter } from 'events';
import { NetworkHub } from './network-hub.js';
import { ContextManager } from './context-manager.js';
import { AgentRegistry } from './agent-registry.js';
import { DecisionEngine } from './decision-engine.js';
import { APIServer } from '../api/server.js';
import { Logger } from '../utils/logger.js';

export class MyceliumCore extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.logger = new Logger('MyceliumCore');
    this.isRunning = false;

    // Core components
    this.networkHub = new NetworkHub(config.network);
    this.contextManager = new ContextManager(config.context);
    this.agentRegistry = new AgentRegistry(config.agents);
    this.decisionEngine = new DecisionEngine(config.decisions);
    this.apiServer = new APIServer(config.server, this);

    // Component interconnections
    this.setupComponentConnections();
  }

  setupComponentConnections() {
    // Network hub events
    this.networkHub.on('message', this.handleNetworkMessage.bind(this));
    this.networkHub.on('agent_connected', this.handleAgentConnection.bind(this));
    this.networkHub.on('agent_disconnected', this.handleAgentDisconnection.bind(this));

    // Context manager events
    this.contextManager.on('context_updated', this.handleContextUpdate.bind(this));
    this.contextManager.on('insight_discovered', this.handleInsightDiscovery.bind(this));

    // Agent registry events
    this.agentRegistry.on('agent_registered', this.handleAgentRegistration.bind(this));
    this.agentRegistry.on('agent_removed', this.handleAgentRemoval.bind(this));

    // Decision engine events
    this.decisionEngine.on('decision_required', this.handleDecisionRequest.bind(this));
    this.decisionEngine.on('conflict_detected', this.handleConflict.bind(this));
  }

  async initialize() {
    this.logger.info('Initializing Mycelium components...');

    try {
      // Initialize components in dependency order
      await this.contextManager.initialize();
      await this.agentRegistry.initialize();
      await this.decisionEngine.initialize();
      await this.networkHub.initialize();
      await this.apiServer.initialize();

      this.logger.info('All components initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize components:', error);
      throw error;
    }
  }

  async start() {
    if (this.isRunning) {
      this.logger.warn('Mycelium is already running');
      return;
    }

    this.logger.info('Starting Mycelium network...');

    try {
      // Start components
      await this.networkHub.start();
      await this.apiServer.start();

      // Load default agents if configured
      if (this.config.agents.autoLoad) {
        await this.loadDefaultAgents();
      }

      this.isRunning = true;
      this.emit('started');

      this.logger.info('Mycelium network started successfully');
    } catch (error) {
      this.logger.error('Failed to start Mycelium:', error);
      throw error;
    }
  }

  async shutdown() {
    if (!this.isRunning) {
      this.logger.warn('Mycelium is not running');
      return;
    }

    this.logger.info('Shutting down Mycelium network...');

    try {
      // Shutdown components in reverse order
      await this.apiServer.stop();
      await this.networkHub.stop();
      await this.agentRegistry.shutdown();
      await this.contextManager.shutdown();

      this.isRunning = false;
      this.emit('stopped');

      this.logger.info('Mycelium network shut down successfully');
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
      throw error;
    }
  }

  async loadDefaultAgents() {
    this.logger.info('Loading default agents...');

    const defaultAgents = [
      {
        type: 'CustomerJourneyAgent',
        id: 'customer-journey-001',
        config: {
          departments: ['sales', 'marketing', 'support'],
          capabilities: ['lead-enrichment', 'cross-department-coordination']
        }
      }
      // Add more default agents as needed
    ];

    for (const agentConfig of defaultAgents) {
      try {
        await this.createAgent(agentConfig);
      } catch (error) {
        this.logger.error(`Failed to load agent ${agentConfig.id}:`, error);
      }
    }
  }

  async createAgent(config) {
    this.logger.info(`Creating agent: ${config.id} (${config.type})`);

    try {
      // Register the agent
      const agent = await this.agentRegistry.createAgent(config);

      // Connect to network
      await this.networkHub.connectAgent(agent);

      // Provide context access
      agent.setContextManager(this.contextManager);

      // Start the agent
      await agent.start();

      this.logger.info(`Agent ${config.id} created and started successfully`);
      return agent;
    } catch (error) {
      this.logger.error(`Failed to create agent ${config.id}:`, error);
      throw error;
    }
  }

  async removeAgent(agentId) {
    this.logger.info(`Removing agent: ${agentId}`);

    try {
      const agent = this.agentRegistry.getAgent(agentId);
      if (agent) {
        await agent.stop();
        await this.networkHub.disconnectAgent(agent);
        await this.agentRegistry.removeAgent(agentId);
        this.logger.info(`Agent ${agentId} removed successfully`);
      }
    } catch (error) {
      this.logger.error(`Failed to remove agent ${agentId}:`, error);
      throw error;
    }
  }

  // Event handlers
  handleNetworkMessage(message) {
    this.logger.debug('Network message received:', message.type);

    // Route message based on type
    if (message.type === 'agent_broadcast') {
      this.handleAgentBroadcast(message);
    } else if (message.type === 'context_query') {
      this.handleContextQuery(message);
    } else if (message.type === 'decision_request') {
      this.handleDecisionRequest(message);
    }
  }

  handleAgentConnection(agentId) {
    this.logger.info(`Agent connected: ${agentId}`);
    this.emit('agent_connected', agentId);
  }

  handleAgentDisconnection(agentId) {
    this.logger.info(`Agent disconnected: ${agentId}`);
    this.emit('agent_disconnected', agentId);
  }

  handleContextUpdate(update) {
    this.logger.debug('Context updated:', update.key);

    // Broadcast context updates to relevant agents
    this.networkHub.broadcastToAgents('context_update', update);
  }

  handleInsightDiscovery(insight) {
    this.logger.info('New insight discovered:', insight.type);

    // Share insights with all agents
    this.networkHub.broadcastToAgents('insight_shared', insight);
    this.emit('insight_discovered', insight);
  }

  handleAgentRegistration(agent) {
    this.logger.info(`Agent registered: ${agent.id} (${agent.type})`);
    this.emit('agent_registered', agent);
  }

  handleAgentRemoval(agentId) {
    this.logger.info(`Agent removed: ${agentId}`);
    this.emit('agent_removed', agentId);
  }

  async handleDecisionRequest(request) {
    this.logger.debug('Decision request received:', request.type);

    try {
      const decision = await this.decisionEngine.makeDecision(request);

      // Send decision back to requester
      if (request.respondTo) {
        await this.networkHub.sendMessage(request.respondTo, {
          type: 'decision_response',
          requestId: request.id,
          decision: decision
        });
      }

      this.emit('decision_made', decision);
    } catch (error) {
      this.logger.error('Failed to handle decision request:', error);
    }
  }

  handleConflict(conflict) {
    this.logger.warn('Agent conflict detected:', conflict.type);

    // Implement conflict resolution logic
    this.resolveConflict(conflict);
    this.emit('conflict_detected', conflict);
  }

  async resolveConflict(conflict) {
    // Basic conflict resolution - can be extended
    this.logger.info(`Resolving conflict: ${conflict.type}`);

    // For now, implement priority-based resolution
    if (conflict.agents && conflict.agents.length > 1) {
      const priorityAgent = conflict.agents.reduce((highest, current) =>
        (current.priority || 0) > (highest.priority || 0) ? current : highest
      );

      // Grant permission to highest priority agent
      await this.networkHub.sendMessage(priorityAgent.id, {
        type: 'conflict_resolved',
        resolution: 'granted',
        conflictId: conflict.id
      });

      // Notify other agents
      for (const agent of conflict.agents) {
        if (agent.id !== priorityAgent.id) {
          await this.networkHub.sendMessage(agent.id, {
            type: 'conflict_resolved',
            resolution: 'denied',
            conflictId: conflict.id,
            winner: priorityAgent.id
          });
        }
      }
    }
  }

  // Public API methods
  getNetworkStatus() {
    return {
      isRunning: this.isRunning,
      agents: this.agentRegistry.getActiveAgents().map(agent => ({
        id: agent.id,
        type: agent.type,
        status: agent.status,
        uptime: agent.uptime
      })),
      context: this.contextManager.getStats(),
      network: this.networkHub.getStats()
    };
  }

  getAgent(agentId) {
    return this.agentRegistry.getAgent(agentId);
  }

  listAgents() {
    return this.agentRegistry.listAgents();
  }

  async broadcastToAgents(message) {
    return this.networkHub.broadcastToAgents(message.type, message.data);
  }
}