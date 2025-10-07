# Mycelium - The Living AI Network
*Phase 1 MVP Implementation*

## Overview

Mycelium is a distributed AI agent network that connects departments and processes across your organization, creating a living intelligence system that learns and grows over time.

## Quick Start

```bash
# Clone and setup
cd Mycelium
npm install
cp .env.example .env
# Edit .env with your API keys and configuration

# Start the development environment
npm run setup
npm run dev

# In another terminal, start the network
npm run network:start

# Check network status
npm run network:status
```

## Architecture

```
Mycelium Network
├── Core Hub (Central Intelligence)
│   ├── Event Router
│   ├── Context Manager
│   ├── Agent Registry
│   └── Decision Engine
├── Agents (Distributed Intelligence)
│   ├── Customer Journey Agent
│   ├── Sales Intelligence Agent
│   ├── Marketing Coordination Agent
│   └── Operations Orchestration Agent
└── Integration Layer
    ├── API Gateway
    ├── Webhook Manager
    └── Data Connectors
```

## Core Concepts

### Agents
Self-contained AI entities that specialize in specific business functions:
- **Autonomous**: Make decisions based on context and rules
- **Communicative**: Share insights with other agents
- **Learning**: Improve from interactions and outcomes
- **Contextual**: Understand business processes and relationships

### Network Intelligence
The collective knowledge and coordination capabilities that emerge from agent interactions:
- **Shared Context**: All agents access unified business state
- **Coordinated Actions**: Prevent conflicts and optimize workflows
- **Compound Learning**: Network gets smarter as agents learn from each other
- **Predictive Insights**: Anticipate needs and optimize proactively

## Phase 1 Features

### ✅ Core Infrastructure
- [x] Agent framework and lifecycle management
- [x] Real-time communication between agents
- [x] Shared context and state management
- [x] Basic monitoring and health checks

### 🚧 Current Development
- [ ] Customer Journey Orchestration agent
- [ ] Sales-Marketing coordination workflows
- [ ] Integration with common business platforms
- [ ] Web dashboard for network monitoring

### 🔮 Coming Next
- [ ] Advanced learning and optimization
- [ ] Predictive analytics and forecasting
- [ ] Multi-department workflow automation
- [ ] Enterprise security and compliance features

## Agent Development

### Creating a New Agent

```bash
npm run agent:create MyNewAgent
```

This creates a new agent template in `src/agents/` with:
- Agent class with standard lifecycle methods
- Configuration and capability definitions
- Integration with the core network
- Basic tests and documentation

### Agent Structure

```javascript
// src/agents/example-agent.js
export class ExampleAgent {
  constructor(config) {
    this.id = config.id;
    this.capabilities = config.capabilities;
    this.context = new AgentContext();
  }

  async initialize() {
    // Agent startup logic
  }

  async process(event) {
    // Handle incoming events and make decisions
  }

  async collaborate(agentId, message) {
    // Communicate with other agents
  }

  async learn(experience) {
    // Update behavior based on outcomes
  }
}
```

## API Reference

### Core Hub API

#### Agent Registration
```javascript
POST /api/agents/register
{
  "agentId": "customer-journey-001",
  "type": "CustomerJourneyAgent",
  "capabilities": ["lead-enrichment", "cross-department-coordination"],
  "config": { ... }
}
```

#### Event Publishing
```javascript
POST /api/events/publish
{
  "type": "customer.lead.created",
  "data": { "leadId": "lead-123", "source": "website" },
  "context": { "department": "marketing" }
}
```

#### Context Queries
```javascript
GET /api/context/query?type=customer&id=lead-123
```

### Agent-to-Agent Communication

```javascript
// Send message to specific agent
await network.sendMessage('sales-agent-001', {
  type: 'lead.qualification.request',
  data: leadData,
  priority: 'high'
});

// Broadcast to all agents of a type
await network.broadcast('MarketingAgent', {
  type: 'campaign.performance.update',
  data: campaignMetrics
});

// Subscribe to events
network.subscribe('customer.*', (event) => {
  // Handle customer-related events
});
```

## Configuration

### Network Configuration
```javascript
// config/network.json
{
  "maxAgents": 10,
  "communicationTimeout": 5000,
  "contextRetentionHours": 24,
  "learningEnabled": true,
  "monitoring": {
    "enabled": true,
    "metricsInterval": 60000
  }
}
```

### Agent Configuration
```javascript
// config/agents/customer-journey.json
{
  "type": "CustomerJourneyAgent",
  "maxInstances": 3,
  "capabilities": [
    "lead-enrichment",
    "multi-department-coordination",
    "context-awareness"
  ],
  "integrations": ["crm", "marketing-automation", "support"],
  "learning": {
    "enabled": true,
    "feedbackWeight": 0.1,
    "adaptationRate": 0.05
  }
}
```

## Development Guidelines

### Code Style
- ES6+ JavaScript with modern Node.js features
- Functional programming patterns where appropriate
- Comprehensive error handling and logging
- Clear documentation and inline comments

### Testing
- Unit tests for all agent logic
- Integration tests for agent communication
- End-to-end tests for complete workflows
- Performance tests for network scalability

### Monitoring
- Agent health and performance metrics
- Network communication patterns
- Business outcome measurements
- Error tracking and alerting

## Deployment

### Development
```bash
npm run dev
```
Starts the development server with hot reloading and detailed logging.

### Production
```bash
npm start
```
Runs the optimized production build with monitoring and error recovery.

### Docker
```bash
docker build -t mycelium .
docker run -p 3000:3000 mycelium
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-agent`
3. Commit changes: `git commit -am 'Add amazing agent capability'`
4. Push to branch: `git push origin feature/amazing-agent`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- Documentation: `/docs`
- Examples: `/examples`
- Issues: Create GitHub issue
- Discord: [Mycelium Development Community]

---

*Mycelium is part of the Abba Baba AI-human collaboration platform.*