/**
 * NetworkHub - Communication layer for agent-to-agent messaging
 * Manages WebSocket connections and message routing between agents
 */

import { EventEmitter } from 'events';
import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger.js';

export class NetworkHub extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.logger = new Logger('NetworkHub');
    this.agents = new Map(); // agentId -> connection info
    this.connections = new Map(); // connectionId -> connection info
    this.wss = null;
    this.heartbeatInterval = null;
  }

  async initialize() {
    this.logger.info('Initializing network hub...');

    // Create WebSocket server
    this.wss = new WebSocketServer({
      port: this.config.port || 8080,
      path: '/ws'
    });

    this.setupWebSocketServer();
    this.startHeartbeat();

    this.logger.info(`Network hub initialized on port ${this.config.port || 8080}`);
  }

  async start() {
    this.logger.info('Network hub started and listening for connections');
  }

  async stop() {
    this.logger.info('Stopping network hub...');

    // Stop heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Close all connections
    for (const connection of this.connections.values()) {
      connection.ws.close();
    }

    // Close WebSocket server
    if (this.wss) {
      this.wss.close();
    }

    this.logger.info('Network hub stopped');
  }

  setupWebSocketServer() {
    this.wss.on('connection', (ws, request) => {
      const connectionId = uuidv4();

      const connection = {
        id: connectionId,
        ws,
        agentId: null,
        connected: true,
        lastSeen: Date.now(),
        metadata: {}
      };

      this.connections.set(connectionId, connection);

      this.logger.debug(`New connection: ${connectionId}`);

      // Handle connection events
      ws.on('message', (data) => {
        this.handleMessage(connectionId, data);
      });

      ws.on('close', () => {
        this.handleDisconnection(connectionId);
      });

      ws.on('error', (error) => {
        this.logger.error(`Connection error for ${connectionId}:`, error);
        this.handleDisconnection(connectionId);
      });

      // Send welcome message
      this.sendToConnection(connectionId, {
        type: 'connection_established',
        connectionId,
        timestamp: Date.now()
      });
    });

    this.logger.debug('WebSocket server event handlers setup complete');
  }

  handleMessage(connectionId, data) {
    try {
      const message = JSON.parse(data.toString());
      const connection = this.connections.get(connectionId);

      if (!connection) {
        this.logger.warn(`Message from unknown connection: ${connectionId}`);
        return;
      }

      // Update last seen
      connection.lastSeen = Date.now();

      this.logger.trace(`Message received from ${connectionId}:`, message.type);

      // Handle different message types
      switch (message.type) {
        case 'agent_register':
          this.handleAgentRegistration(connectionId, message);
          break;

        case 'agent_message':
          this.handleAgentMessage(connectionId, message);
          break;

        case 'broadcast':
          this.handleBroadcast(connectionId, message);
          break;

        case 'heartbeat':
          this.handleHeartbeat(connectionId, message);
          break;

        default:
          this.logger.debug(`Unknown message type: ${message.type}`);
          this.emit('message', message);
      }
    } catch (error) {
      this.logger.error(`Failed to parse message from ${connectionId}:`, error);
    }
  }

  handleAgentRegistration(connectionId, message) {
    const { agentId, agentType, capabilities } = message.data;

    if (!agentId || !agentType) {
      this.logger.warn(`Invalid agent registration from ${connectionId}`);
      return;
    }

    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Check if agent is already registered
    if (this.agents.has(agentId)) {
      this.logger.warn(`Agent ${agentId} already registered`);
      this.sendToConnection(connectionId, {
        type: 'registration_failed',
        reason: 'Agent already registered'
      });
      return;
    }

    // Register the agent
    connection.agentId = agentId;
    connection.agentType = agentType;
    connection.capabilities = capabilities || [];

    this.agents.set(agentId, {
      id: agentId,
      type: agentType,
      capabilities,
      connectionId,
      registeredAt: Date.now(),
      lastActivity: Date.now()
    });

    this.logger.info(`Agent registered: ${agentId} (${agentType})`);

    // Confirm registration
    this.sendToConnection(connectionId, {
      type: 'registration_confirmed',
      agentId,
      timestamp: Date.now()
    });

    this.emit('agent_connected', agentId);
  }

  handleAgentMessage(connectionId, message) {
    const { targetAgentId, targetType, payload } = message.data;
    const connection = this.connections.get(connectionId);

    if (!connection || !connection.agentId) {
      this.logger.warn(`Message from unregistered connection: ${connectionId}`);
      return;
    }

    const sourceAgentId = connection.agentId;

    // Route message to specific agent or agents of a type
    if (targetAgentId) {
      this.sendToAgent(targetAgentId, {
        type: 'agent_message',
        from: sourceAgentId,
        payload,
        timestamp: Date.now()
      });
    } else if (targetType) {
      this.broadcastToAgentType(targetType, {
        type: 'agent_message',
        from: sourceAgentId,
        payload,
        timestamp: Date.now()
      });
    }

    // Update activity
    const agent = this.agents.get(sourceAgentId);
    if (agent) {
      agent.lastActivity = Date.now();
    }
  }

  handleBroadcast(connectionId, message) {
    const connection = this.connections.get(connectionId);

    if (!connection || !connection.agentId) {
      this.logger.warn(`Broadcast from unregistered connection: ${connectionId}`);
      return;
    }

    const sourceAgentId = connection.agentId;
    const { payload, excludeSelf } = message.data;

    this.broadcastToAllAgents({
      type: 'broadcast_message',
      from: sourceAgentId,
      payload,
      timestamp: Date.now()
    }, excludeSelf ? sourceAgentId : null);
  }

  handleHeartbeat(connectionId, message) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastSeen = Date.now();
    }

    // Send heartbeat response
    this.sendToConnection(connectionId, {
      type: 'heartbeat_response',
      timestamp: Date.now()
    });
  }

  handleDisconnection(connectionId) {
    const connection = this.connections.get(connectionId);

    if (connection && connection.agentId) {
      const agentId = connection.agentId;
      this.agents.delete(agentId);
      this.logger.info(`Agent disconnected: ${agentId}`);
      this.emit('agent_disconnected', agentId);
    }

    this.connections.delete(connectionId);
    this.logger.debug(`Connection closed: ${connectionId}`);
  }

  // Message sending methods
  sendToConnection(connectionId, message) {
    const connection = this.connections.get(connectionId);

    if (!connection || !connection.connected) {
      this.logger.warn(`Cannot send to connection ${connectionId}: not connected`);
      return false;
    }

    try {
      connection.ws.send(JSON.stringify({
        id: uuidv4(),
        ...message
      }));
      return true;
    } catch (error) {
      this.logger.error(`Failed to send message to ${connectionId}:`, error);
      return false;
    }
  }

  sendToAgent(agentId, message) {
    const agent = this.agents.get(agentId);

    if (!agent) {
      this.logger.warn(`Agent not found: ${agentId}`);
      return false;
    }

    return this.sendToConnection(agent.connectionId, message);
  }

  broadcastToAllAgents(message, excludeAgentId = null) {
    let sent = 0;

    for (const [agentId, agent] of this.agents) {
      if (excludeAgentId && agentId === excludeAgentId) {
        continue;
      }

      if (this.sendToAgent(agentId, message)) {
        sent++;
      }
    }

    this.logger.debug(`Broadcast sent to ${sent} agents`);
    return sent;
  }

  broadcastToAgentType(agentType, message) {
    let sent = 0;

    for (const [agentId, agent] of this.agents) {
      if (agent.type === agentType) {
        if (this.sendToAgent(agentId, message)) {
          sent++;
        }
      }
    }

    this.logger.debug(`Broadcast sent to ${sent} agents of type ${agentType}`);
    return sent;
  }

  // Agent management methods
  async connectAgent(agent) {
    // This method is called when an agent is created by the core
    // The actual connection happens when the agent connects via WebSocket
    this.logger.debug(`Agent ${agent.id} ready for connection`);
  }

  async disconnectAgent(agent) {
    const agentInfo = this.agents.get(agent.id);

    if (agentInfo) {
      const connection = this.connections.get(agentInfo.connectionId);
      if (connection) {
        connection.ws.close();
      }
    }
  }

  // Heartbeat system
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.performHeartbeat();
    }, this.config.heartbeatInterval || 30000);
  }

  performHeartbeat() {
    const now = Date.now();
    const timeout = (this.config.heartbeatInterval || 30000) * 2;

    // Check for stale connections
    for (const [connectionId, connection] of this.connections) {
      if (now - connection.lastSeen > timeout) {
        this.logger.warn(`Connection timeout: ${connectionId}`);
        this.handleDisconnection(connectionId);
      }
    }

    // Send heartbeat to all connected agents
    this.broadcastToAllAgents({
      type: 'heartbeat',
      timestamp: now
    });
  }

  // Status and statistics
  getStats() {
    return {
      totalConnections: this.connections.size,
      totalAgents: this.agents.size,
      agentTypes: Array.from(new Set(
        Array.from(this.agents.values()).map(agent => agent.type)
      )),
      uptime: process.uptime()
    };
  }

  getConnectedAgents() {
    return Array.from(this.agents.values());
  }

  isAgentConnected(agentId) {
    return this.agents.has(agentId);
  }
}