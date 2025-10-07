/**
 * BaseAgent - Foundation class for all Mycelium agents
 * Provides common functionality like networking, context access, and lifecycle management
 */

import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';

export class BaseAgent extends EventEmitter {
  constructor(config) {
    super();

    this.id = config.id;
    this.type = config.type;
    this.config = config;
    this.registry = config.registry;

    this.logger = new Logger(`Agent[${this.id}]`);

    // Agent state
    this.status = 'created';
    this.startTime = null;
    this.capabilities = [];

    // Network connection
    this.ws = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;

    // Context and service access
    this.contextManager = null;
    this.network = null;

    // Message handling
    this.messageQueue = [];
    this.pendingMessages = new Map(); // messageId -> Promise resolver
    this.subscriptions = new Map(); // event pattern -> handler

    // Performance tracking
    this.metrics = {
      messagesReceived: 0,
      messagesSent: 0,
      errors: 0,
      uptime: 0
    };
  }

  // Lifecycle methods
  async initialize() {
    this.logger.debug('Initializing base agent...');
    this.status = 'initializing';

    // Connect to Mycelium network
    await this.connectToNetwork();

    this.status = 'initialized';
    this.emit('status_changed', 'initialized');
  }

  async start() {
    if (this.status === 'running') {
      this.logger.warn('Agent is already running');
      return;
    }

    this.logger.info('Starting agent...');
    this.startTime = Date.now();
    this.status = 'running';

    // Process any queued messages
    await this.processMessageQueue();

    // Start metrics tracking
    this.startMetricsTracking();

    this.emit('status_changed', 'running');
    this.emit('started');
  }

  async stop() {
    if (this.status === 'stopped') {
      return;
    }

    this.logger.info('Stopping agent...');
    this.status = 'stopping';

    // Close network connection
    if (this.ws) {
      this.ws.close();
    }

    // Stop metrics tracking
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    this.status = 'stopped';
    this.emit('status_changed', 'stopped');
    this.emit('stopped');
  }

  // Network connection management
  async connectToNetwork() {
    const networkUrl = this.config.networkUrl || 'ws://localhost:8080/ws';

    return new Promise((resolve, reject) => {
      this.logger.debug(`Connecting to network: ${networkUrl}`);

      this.ws = new WebSocket(networkUrl);

      this.ws.on('open', async () => {
        this.logger.info('Connected to Mycelium network');
        this.connected = true;
        this.reconnectAttempts = 0;

        // Register with the network
        await this.registerWithNetwork();

        // Setup network proxy
        this.network = new NetworkProxy(this);

        resolve();
      });

      this.ws.on('message', (data) => {
        this.handleNetworkMessage(data);
      });

      this.ws.on('close', () => {
        this.logger.warn('Network connection closed');
        this.connected = false;
        this.handleDisconnection();
      });

      this.ws.on('error', (error) => {
        this.logger.error('Network connection error:', error);
        this.metrics.errors++;
        reject(error);
      });
    });
  }

  async registerWithNetwork() {
    const registration = {
      type: 'agent_register',
      data: {
        agentId: this.id,
        agentType: this.type,
        capabilities: this.capabilities,
        timestamp: Date.now()
      }
    };

    await this.sendNetworkMessage(registration);
  }

  async handleDisconnection() {
    if (this.status === 'stopping' || this.status === 'stopped') {
      return; // Expected disconnection
    }

    // Attempt reconnection
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

      this.logger.info(`Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);

      setTimeout(() => {
        this.connectToNetwork().catch((error) => {
          this.logger.error('Reconnection failed:', error);
        });
      }, delay);
    } else {
      this.logger.error('Max reconnection attempts reached, stopping agent');
      this.status = 'error';
      this.emit('error', new Error('Network connection lost'));
    }
  }

  // Message handling
  handleNetworkMessage(data) {
    try {
      const message = JSON.parse(data.toString());
      this.metrics.messagesReceived++;

      // Handle different message types
      switch (message.type) {
        case 'registration_confirmed':
          this.handleRegistrationConfirmed(message);
          break;

        case 'agent_message':
          this.handleAgentMessage(message);
          break;

        case 'broadcast_message':
          this.handleBroadcastMessage(message);
          break;

        case 'context_update':
          this.handleContextUpdate(message);
          break;

        case 'heartbeat':
          this.handleHeartbeat(message);
          break;

        case 'heartbeat_response':
          // Heartbeat acknowledged
          break;

        default:
          this.logger.debug(`Unhandled message type: ${message.type}`);
          this.emit('message', message);
      }
    } catch (error) {
      this.logger.error('Failed to parse network message:', error);
      this.metrics.errors++;
    }
  }

  handleRegistrationConfirmed(message) {
    this.logger.info('Agent registration confirmed');
    this.emit('registered', message);
  }

  handleAgentMessage(message) {
    this.logger.debug(`Message from ${message.from}:`, message.payload?.type);

    // Check if this is a response to a pending message
    if (message.responseId && this.pendingMessages.has(message.responseId)) {
      const resolver = this.pendingMessages.get(message.responseId);
      resolver(message.payload);
      this.pendingMessages.delete(message.responseId);
      return;
    }

    // Emit as agent message
    this.emit('agent_message', {
      from: message.from,
      payload: message.payload,
      timestamp: message.timestamp
    });
  }

  handleBroadcastMessage(message) {
    this.logger.debug(`Broadcast from ${message.from}:`, message.payload?.type);

    this.emit('broadcast', {
      from: message.from,
      payload: message.payload,
      timestamp: message.timestamp
    });

    // Check subscriptions
    for (const [pattern, handler] of this.subscriptions) {
      if (this.matchesPattern(message.payload?.type, pattern)) {
        try {
          handler(message.payload);
        } catch (error) {
          this.logger.error(`Subscription handler error for ${pattern}:`, error);
        }
      }
    }
  }

  handleContextUpdate(message) {
    this.emit('context_update', message);
  }

  handleHeartbeat(message) {
    // Respond to heartbeat
    this.sendNetworkMessage({
      type: 'heartbeat_response',
      timestamp: Date.now()
    });
  }

  matchesPattern(eventType, pattern) {
    if (!eventType || !pattern) return false;

    // Simple glob-like pattern matching
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(eventType);
  }

  // Message sending
  async sendNetworkMessage(message) {
    if (!this.ws || !this.connected) {
      this.logger.warn('Cannot send message: not connected to network');
      // Queue message for later
      this.messageQueue.push(message);
      return false;
    }

    try {
      const messageWithId = {
        id: uuidv4(),
        ...message
      };

      this.ws.send(JSON.stringify(messageWithId));
      this.metrics.messagesSent++;
      return true;
    } catch (error) {
      this.logger.error('Failed to send network message:', error);
      this.metrics.errors++;
      return false;
    }
  }

  async processMessageQueue() {
    while (this.messageQueue.length > 0 && this.connected) {
      const message = this.messageQueue.shift();
      await this.sendNetworkMessage(message);
    }
  }

  // Service access
  setContextManager(contextManager) {
    this.contextManager = contextManager;
  }

  // Metrics and monitoring
  startMetricsTracking() {
    this.metricsInterval = setInterval(() => {
      this.metrics.uptime = Date.now() - this.startTime;
    }, 60000); // Update every minute
  }

  getHealthStatus() {
    return {
      status: this.status,
      connected: this.connected,
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      metrics: { ...this.metrics },
      lastError: this.lastError
    };
  }

  // Utility methods for subclasses
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  withTimeout(promise, timeoutMs = 5000) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
      )
    ]);
  }

  // Error handling
  handleError(error, context = {}) {
    this.logger.error('Agent error:', error, context);
    this.metrics.errors++;
    this.lastError = {
      message: error.message,
      timestamp: Date.now(),
      context
    };

    this.emit('error', error, context);

    // Consider stopping agent on critical errors
    if (error.critical) {
      this.stop();
    }
  }
}

/**
 * NetworkProxy - Provides a simplified interface for agent-to-agent communication
 */
class NetworkProxy {
  constructor(agent) {
    this.agent = agent;
    this.logger = new Logger(`Network[${agent.id}]`);
  }

  async sendMessage(targetAgentId, message) {
    const networkMessage = {
      type: 'agent_message',
      data: {
        targetAgentId,
        payload: message
      }
    };

    return this.agent.sendNetworkMessage(networkMessage);
  }

  async sendToAgentType(agentType, message) {
    const networkMessage = {
      type: 'agent_message',
      data: {
        targetType: agentType,
        payload: message
      }
    };

    return this.agent.sendNetworkMessage(networkMessage);
  }

  async broadcast(message, excludeSelf = true) {
    const networkMessage = {
      type: 'broadcast',
      data: {
        payload: message,
        excludeSelf
      }
    };

    return this.agent.sendNetworkMessage(networkMessage);
  }

  async broadcastToAgentType(agentType, message) {
    // For now, use broadcast and let agents filter
    // In a more sophisticated implementation, this could be server-side filtered
    const enrichedMessage = {
      ...message,
      targetType: agentType
    };

    return this.broadcast(enrichedMessage);
  }

  subscribe(eventPattern, handler) {
    this.agent.subscriptions.set(eventPattern, handler);
    this.logger.debug(`Subscribed to pattern: ${eventPattern}`);
  }

  unsubscribe(eventPattern) {
    this.agent.subscriptions.delete(eventPattern);
    this.logger.debug(`Unsubscribed from pattern: ${eventPattern}`);
  }

  async request(targetAgentId, request, timeoutMs = 10000) {
    const requestId = uuidv4();

    const promise = new Promise((resolve, reject) => {
      this.agent.pendingMessages.set(requestId, resolve);

      setTimeout(() => {
        this.agent.pendingMessages.delete(requestId);
        reject(new Error('Request timeout'));
      }, timeoutMs);
    });

    const message = {
      ...request,
      requestId,
      expectResponse: true
    };

    await this.sendMessage(targetAgentId, message);

    return promise;
  }
}