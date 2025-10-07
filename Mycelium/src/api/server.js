/**
 * API Server - HTTP REST API for Mycelium network management
 * Provides endpoints for monitoring, agent management, and external integrations
 */

import express from 'express';
import { Logger } from '../utils/logger.js';

export class APIServer {
  constructor(config, myceliumCore) {
    this.config = config;
    this.core = myceliumCore;
    this.logger = new Logger('APIServer');
    this.app = express();
    this.server = null;

    this.setupMiddleware();
    this.setupRoutes();
  }

  async initialize() {
    this.logger.info('Initializing API server...');
  }

  async start() {
    const port = this.config.port || 3000;

    return new Promise((resolve, reject) => {
      this.server = this.app.listen(port, (err) => {
        if (err) {
          reject(err);
        } else {
          this.logger.info(`API server listening on port ${port}`);
          resolve();
        }
      });
    });
  }

  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          this.logger.info('API server stopped');
          resolve();
        });
      });
    }
  }

  setupMiddleware() {
    // JSON parsing
    this.app.use(express.json({ limit: '10mb' }));

    // CORS
    if (this.config.cors?.enabled) {
      this.app.use((req, res, next) => {
        const origins = this.config.cors.origins || ['*'];
        const origin = req.headers.origin;

        if (origins.includes('*') || origins.includes(origin)) {
          res.header('Access-Control-Allow-Origin', origin || '*');
        }

        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      });
    }

    // Logging middleware
    this.app.use((req, res, next) => {
      this.logger.debug(`${req.method} ${req.path}`);
      next();
    });

    // Error handling
    this.app.use((err, req, res, next) => {
      this.logger.error('API error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: err.message
      });
    });
  }

  setupRoutes() {
    const apiPrefix = this.config.apiPrefix || '/api';

    // Health check
    this.app.get(`${apiPrefix}/health`, (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: Date.now(),
        uptime: process.uptime()
      });
    });

    // Network status
    this.app.get(`${apiPrefix}/network/status`, (req, res) => {
      try {
        const status = this.core.getNetworkStatus();
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Agent management
    this.setupAgentRoutes(apiPrefix);

    // Context management
    this.setupContextRoutes(apiPrefix);

    // Decision engine
    this.setupDecisionRoutes(apiPrefix);

    // Events and messaging
    this.setupEventRoutes(apiPrefix);

    // Catch-all for undefined routes
    this.app.use(`${apiPrefix}/*`, (req, res) => {
      res.status(404).json({
        error: 'Not found',
        message: `API endpoint not found: ${req.method} ${req.path}`
      });
    });
  }

  setupAgentRoutes(apiPrefix) {
    const agentsPath = `${apiPrefix}/agents`;

    // List all agents
    this.app.get(agentsPath, (req, res) => {
      try {
        const agents = this.core.listAgents();
        res.json({
          agents: agents.map(agent => ({
            id: agent.id,
            type: agent.type,
            status: agent.status,
            capabilities: agent.capabilities,
            uptime: agent.uptime
          }))
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get specific agent
    this.app.get(`${agentsPath}/:agentId`, (req, res) => {
      try {
        const agent = this.core.getAgent(req.params.agentId);
        if (!agent) {
          return res.status(404).json({ error: 'Agent not found' });
        }

        res.json({
          id: agent.id,
          type: agent.type,
          status: agent.status,
          capabilities: agent.capabilities,
          uptime: agent.uptime,
          health: agent.getHealthStatus()
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Create new agent
    this.app.post(agentsPath, async (req, res) => {
      try {
        const { type, id, ...config } = req.body;

        if (!type || !id) {
          return res.status(400).json({
            error: 'Bad request',
            message: 'Agent type and id are required'
          });
        }

        const agent = await this.core.createAgent({ type, id, ...config });

        res.status(201).json({
          message: 'Agent created successfully',
          agent: {
            id: agent.id,
            type: agent.type,
            status: agent.status
          }
        });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    // Delete agent
    this.app.delete(`${agentsPath}/:agentId`, async (req, res) => {
      try {
        const success = await this.core.removeAgent(req.params.agentId);

        if (success) {
          res.json({ message: 'Agent removed successfully' });
        } else {
          res.status(404).json({ error: 'Agent not found' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Send message to agent
    this.app.post(`${agentsPath}/:agentId/messages`, async (req, res) => {
      try {
        const agentId = req.params.agentId;
        const message = req.body;

        const success = await this.core.networkHub.sendToAgent(agentId, message);

        if (success) {
          res.json({ message: 'Message sent successfully' });
        } else {
          res.status(404).json({ error: 'Agent not found or not connected' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  setupContextRoutes(apiPrefix) {
    const contextPath = `${apiPrefix}/context`;

    // Get context
    this.app.get(`${contextPath}/:key`, async (req, res) => {
      try {
        const context = await this.core.contextManager.getContext(req.params.key, {
          includeRelated: req.query.includeRelated === 'true'
        });

        if (!context) {
          return res.status(404).json({ error: 'Context not found' });
        }

        res.json(context);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Set context
    this.app.put(`${contextPath}/:key`, async (req, res) => {
      try {
        const key = req.params.key;
        const { data, ...options } = req.body;

        const context = await this.core.contextManager.setContext(key, data, options);

        res.json({
          message: 'Context updated successfully',
          context: {
            key: context.key,
            timestamp: context.timestamp
          }
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Query contexts
    this.app.post(`${contextPath}/query`, async (req, res) => {
      try {
        const query = req.body;
        const contexts = await this.core.contextManager.queryContexts(query);

        res.json({
          results: contexts,
          count: contexts.length
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get insights
    this.app.get(`${contextPath}/insights`, async (req, res) => {
      try {
        const filters = req.query;
        const insights = await this.core.contextManager.getInsights('api', filters);

        res.json({
          insights,
          count: insights.length
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Context statistics
    this.app.get(`${contextPath}/stats`, (req, res) => {
      try {
        const stats = this.core.contextManager.getStats();
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  setupDecisionRoutes(apiPrefix) {
    const decisionsPath = `${apiPrefix}/decisions`;

    // Make a decision request
    this.app.post(decisionsPath, async (req, res) => {
      try {
        const request = {
          ...req.body,
          requester: 'api'
        };

        const decision = await this.core.decisionEngine.makeDecision(request);

        res.json(decision);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get decision status
    this.app.get(`${decisionsPath}/:decisionId`, (req, res) => {
      try {
        const decision = this.core.decisionEngine.getDecision(req.params.decisionId);

        if (!decision) {
          return res.status(404).json({ error: 'Decision not found' });
        }

        res.json(decision);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get decision history
    this.app.get(decisionsPath, (req, res) => {
      try {
        const filters = req.query;
        const history = this.core.decisionEngine.getDecisionHistory(filters);

        res.json({
          decisions: history,
          count: history.length
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Decision engine statistics
    this.app.get(`${decisionsPath}/stats`, (req, res) => {
      try {
        const stats = this.core.decisionEngine.getStats();
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  setupEventRoutes(apiPrefix) {
    const eventsPath = `${apiPrefix}/events`;

    // Publish event
    this.app.post(`${eventsPath}/publish`, async (req, res) => {
      try {
        const event = {
          ...req.body,
          timestamp: Date.now(),
          source: 'api'
        };

        const sent = await this.core.broadcastToAgents({
          type: 'external_event',
          data: event
        });

        res.json({
          message: 'Event published successfully',
          agentsNotified: sent
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get network statistics
    this.app.get(`${eventsPath}/stats`, (req, res) => {
      try {
        const networkStats = this.core.networkHub.getStats();
        const contextStats = this.core.contextManager.getStats();
        const decisionStats = this.core.decisionEngine.getStats();

        res.json({
          network: networkStats,
          context: contextStats,
          decisions: decisionStats,
          system: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.version
          }
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }
}