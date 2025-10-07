/**
 * CustomerJourneyAgent - Orchestrates customer interactions across departments
 * Coordinates sales, marketing, and support for seamless customer experiences
 */

import { BaseAgent } from './base-agent.js';
import { Logger } from '../utils/logger.js';

export class CustomerJourneyAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.logger = new Logger(`CustomerJourney[${this.id}]`);

    this.capabilities = [
      'lead-enrichment',
      'cross-department-coordination',
      'customer-context-management',
      'journey-optimization'
    ];

    // Agent-specific configuration
    this.departments = config.departments || ['sales', 'marketing', 'support'];
    this.enrichmentSources = config.enrichmentSources || ['website', 'social', 'crm'];
    this.coordinationRules = config.coordinationRules || this.getDefaultRules();

    // State management
    this.activeCustomers = new Map(); // customerId -> journey state
    this.journeyPatterns = new Map(); // pattern analysis
    this.departmentConnections = new Map(); // department -> agent connections
  }

  async initialize() {
    await super.initialize();

    this.logger.info('Initializing Customer Journey Agent...');

    // Set up journey tracking
    this.setupJourneyTracking();

    // Register for relevant events
    this.subscribeToEvents();

    this.logger.info('Customer Journey Agent initialized');
  }

  async start() {
    await super.start();

    // Start journey monitoring
    this.startJourneyMonitoring();

    this.logger.info('Customer Journey Agent started');
  }

  async stop() {
    if (this.journeyMonitor) {
      clearInterval(this.journeyMonitor);
    }

    await super.stop();
    this.logger.info('Customer Journey Agent stopped');
  }

  setupJourneyTracking() {
    // Initialize journey state tracking
    this.journeyStates = {
      'visitor': {
        next: ['lead', 'abandoned'],
        actions: ['enrich_profile', 'track_behavior']
      },
      'lead': {
        next: ['qualified', 'nurture', 'disqualified'],
        actions: ['lead_scoring', 'department_notification']
      },
      'qualified': {
        next: ['opportunity', 'nurture'],
        actions: ['sales_handoff', 'context_sharing']
      },
      'opportunity': {
        next: ['customer', 'lost'],
        actions: ['deal_coordination', 'stakeholder_alignment']
      },
      'customer': {
        next: ['expansion', 'churn_risk', 'renewal'],
        actions: ['onboarding_orchestration', 'success_monitoring']
      }
    };
  }

  subscribeToEvents() {
    // Subscribe to customer-related events
    this.on('customer_event', this.handleCustomerEvent.bind(this));
    this.on('department_update', this.handleDepartmentUpdate.bind(this));
    this.on('journey_milestone', this.handleJourneyMilestone.bind(this));

    // Listen for external events from website, CRM, etc.
    this.network.subscribe('lead.*', this.handleLeadEvent.bind(this));
    this.network.subscribe('customer.*', this.handleCustomerEvent.bind(this));
    this.network.subscribe('sales.*', this.handleSalesEvent.bind(this));
    this.network.subscribe('marketing.*', this.handleMarketingEvent.bind(this));
  }

  // Main event handlers
  async handleCustomerEvent(event) {
    const { customerId, eventType, data, source } = event;

    this.logger.debug(`Customer event: ${eventType} for ${customerId}`);

    try {
      // Get or create customer journey state
      let journey = this.activeCustomers.get(customerId);
      if (!journey) {
        journey = await this.initializeCustomerJourney(customerId, data);
        this.activeCustomers.set(customerId, journey);
      }

      // Update journey based on event
      await this.updateJourneyState(journey, eventType, data, source);

      // Trigger coordination actions
      await this.coordinateResponse(journey, eventType, data);

      // Share context with relevant departments
      await this.shareJourneyContext(journey);

    } catch (error) {
      this.logger.error(`Error handling customer event:`, error);
    }
  }

  async handleLeadEvent(event) {
    this.logger.debug(`Lead event: ${event.type}`);

    const customerId = event.data.leadId || event.data.customerId;
    if (!customerId) return;

    // Enrich lead data
    const enrichedData = await this.enrichLeadData(event.data);

    // Create customer event
    await this.handleCustomerEvent({
      customerId,
      eventType: 'lead_created',
      data: enrichedData,
      source: event.source || 'unknown'
    });
  }

  async handleSalesEvent(event) {
    this.logger.debug(`Sales event: ${event.type}`);

    if (event.type === 'opportunity_created') {
      await this.handleCustomerEvent({
        customerId: event.data.customerId,
        eventType: 'qualified_lead',
        data: event.data,
        source: 'sales'
      });
    }
  }

  async handleMarketingEvent(event) {
    this.logger.debug(`Marketing event: ${event.type}`);

    if (event.type === 'campaign_response') {
      await this.handleCustomerEvent({
        customerId: event.data.customerId,
        eventType: 'marketing_engagement',
        data: event.data,
        source: 'marketing'
      });
    }
  }

  // Journey management
  async initializeCustomerJourney(customerId, initialData) {
    const journey = {
      customerId,
      currentState: 'visitor',
      previousStates: [],
      timeline: [],
      context: {
        ...initialData,
        departments: {},
        touchpoints: [],
        score: 0
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Add initial timeline entry
    journey.timeline.push({
      timestamp: Date.now(),
      event: 'journey_started',
      state: 'visitor',
      data: initialData
    });

    this.logger.info(`Initialized journey for customer: ${customerId}`);
    return journey;
  }

  async updateJourneyState(journey, eventType, data, source) {
    const currentState = journey.currentState;
    const stateConfig = this.journeyStates[currentState];

    if (!stateConfig) {
      this.logger.warn(`Unknown journey state: ${currentState}`);
      return;
    }

    // Determine next state based on event
    const nextState = this.determineNextState(currentState, eventType, data);

    if (nextState && nextState !== currentState) {
      // Update state
      journey.previousStates.push({
        state: currentState,
        timestamp: Date.now()
      });
      journey.currentState = nextState;

      this.logger.info(`Customer ${journey.customerId} transitioned: ${currentState} → ${nextState}`);
    }

    // Add to timeline
    journey.timeline.push({
      timestamp: Date.now(),
      event: eventType,
      state: journey.currentState,
      source,
      data
    });

    // Update context
    journey.context = {
      ...journey.context,
      ...data,
      lastActivity: Date.now()
    };

    journey.updatedAt = Date.now();

    // Store journey context in shared context manager
    await this.contextManager.setContext(
      `customer_journey:${journey.customerId}`,
      journey,
      {
        source: this.id,
        tags: ['customer', 'journey', journey.currentState],
        ttl: 7 * 24 * 3600 // 7 days
      }
    );
  }

  determineNextState(currentState, eventType, data) {
    const stateConfig = this.journeyStates[currentState];
    if (!stateConfig) return null;

    // Simple state transition logic
    switch (eventType) {
      case 'lead_created':
        return currentState === 'visitor' ? 'lead' : currentState;

      case 'lead_qualified':
      case 'qualified_lead':
        return currentState === 'lead' ? 'qualified' : currentState;

      case 'opportunity_created':
        return currentState === 'qualified' ? 'opportunity' : currentState;

      case 'deal_closed':
        return currentState === 'opportunity' ? 'customer' : currentState;

      case 'purchase_completed':
        return 'customer';

      default:
        return currentState; // No state change
    }
  }

  // Coordination and orchestration
  async coordinateResponse(journey, eventType, data) {
    const actions = this.determineRequiredActions(journey, eventType, data);

    for (const action of actions) {
      try {
        await this.executeAction(action, journey);
      } catch (error) {
        this.logger.error(`Failed to execute action ${action.type}:`, error);
      }
    }
  }

  determineRequiredActions(journey, eventType, data) {
    const actions = [];
    const currentState = journey.currentState;

    // State-based actions
    const stateConfig = this.journeyStates[currentState];
    if (stateConfig && stateConfig.actions) {
      for (const actionType of stateConfig.actions) {
        actions.push({
          type: actionType,
          priority: 'normal',
          context: journey
        });
      }
    }

    // Event-based actions
    switch (eventType) {
      case 'lead_created':
        actions.push({
          type: 'notify_sales',
          priority: 'high',
          data: { newLead: true, customerId: journey.customerId }
        });
        break;

      case 'high_intent_signal':
        actions.push({
          type: 'escalate_to_sales',
          priority: 'urgent',
          data: { urgentFollow: true }
        });
        break;

      case 'support_ticket_created':
        actions.push({
          type: 'notify_customer_success',
          priority: 'high',
          data: { supportNeeded: true }
        });
        break;
    }

    return actions;
  }

  async executeAction(action, journey) {
    this.logger.debug(`Executing action: ${action.type} for ${journey.customerId}`);

    switch (action.type) {
      case 'enrich_profile':
        await this.enrichCustomerProfile(journey);
        break;

      case 'notify_sales':
        await this.notifyDepartment('sales', action, journey);
        break;

      case 'notify_marketing':
        await this.notifyDepartment('marketing', action, journey);
        break;

      case 'lead_scoring':
        await this.updateLeadScore(journey, action.data);
        break;

      case 'context_sharing':
        await this.shareJourneyContext(journey);
        break;

      case 'escalate_to_sales':
        await this.escalateToSales(journey, action.data);
        break;

      default:
        this.logger.warn(`Unknown action type: ${action.type}`);
    }
  }

  // Specific action implementations
  async enrichCustomerProfile(journey) {
    const enrichmentData = await this.performDataEnrichment(journey.customerId, journey.context);

    // Update journey context
    journey.context = {
      ...journey.context,
      ...enrichmentData,
      enrichedAt: Date.now()
    };

    this.logger.debug(`Enriched profile for customer: ${journey.customerId}`);
  }

  async performDataEnrichment(customerId, currentData) {
    // Simulate data enrichment from various sources
    const enrichment = {
      enrichmentScore: Math.floor(Math.random() * 100),
      estimatedCompanySize: this.estimateCompanySize(currentData),
      industryCategory: this.categorizeIndustry(currentData),
      engagementLevel: this.calculateEngagementLevel(currentData),
      enrichedAt: Date.now()
    };

    // In a real implementation, this would:
    // - Call external APIs (Clearbit, ZoomInfo, etc.)
    // - Query internal databases
    // - Analyze behavioral data
    // - Cross-reference with existing customers

    return enrichment;
  }

  async notifyDepartment(department, action, journey) {
    const message = {
      type: 'customer_journey_update',
      department,
      action: action.type,
      priority: action.priority || 'normal',
      customer: {
        id: journey.customerId,
        state: journey.currentState,
        context: journey.context
      },
      timestamp: Date.now()
    };

    // Send to relevant department agents
    const sent = await this.network.broadcastToAgentType(`${department}Agent`, message);

    if (sent === 0) {
      this.logger.warn(`No agents found for department: ${department}`);
      // Store for later delivery
      await this.contextManager.setContext(
        `pending_notification:${department}:${journey.customerId}`,
        message,
        { source: this.id, ttl: 3600 }
      );
    }

    this.logger.debug(`Notified ${department} department (${sent} agents)`);
  }

  async escalateToSales(journey, data) {
    const escalation = {
      type: 'urgent_lead',
      customerId: journey.customerId,
      reason: data.reason || 'high_intent_signal',
      context: journey.context,
      priority: 'urgent',
      timestamp: Date.now()
    };

    await this.notifyDepartment('sales', { type: 'urgent_escalation', ...data }, journey);

    // Also create a high-priority context entry
    await this.contextManager.setContext(
      `urgent_escalation:${journey.customerId}`,
      escalation,
      { source: this.id, priority: 'high', ttl: 1800 } // 30 minutes
    );
  }

  async updateLeadScore(journey, data) {
    const currentScore = journey.context.score || 0;
    const scoreIncrease = this.calculateScoreIncrease(journey, data);

    journey.context.score = Math.min(100, currentScore + scoreIncrease);
    journey.context.lastScoreUpdate = Date.now();

    // If score crosses threshold, trigger qualification
    if (journey.context.score >= 70 && journey.currentState === 'lead') {
      await this.handleCustomerEvent({
        customerId: journey.customerId,
        eventType: 'lead_qualified',
        data: { score: journey.context.score, autoQualified: true },
        source: this.id
      });
    }
  }

  // Context and insights
  async shareJourneyContext(journey) {
    const contextKey = `customer_journey:${journey.customerId}`;

    // Share detailed context
    await this.contextManager.setContext(contextKey, journey, {
      source: this.id,
      tags: ['customer', 'journey', journey.currentState],
      relationships: this.extractRelationships(journey)
    });

    // Share department-specific context
    for (const department of this.departments) {
      const deptContext = this.extractDepartmentContext(journey, department);
      await this.contextManager.setContext(
        `${department}_customer:${journey.customerId}`,
        deptContext,
        { source: this.id, tags: [department, 'customer'] }
      );
    }
  }

  extractRelationships(journey) {
    const relationships = [];

    // Related to company if available
    if (journey.context.company) {
      relationships.push(`company:${journey.context.company}`);
    }

    // Related to campaign if from marketing
    if (journey.context.campaignId) {
      relationships.push(`campaign:${journey.context.campaignId}`);
    }

    return relationships;
  }

  extractDepartmentContext(journey, department) {
    const baseContext = {
      customerId: journey.customerId,
      currentState: journey.currentState,
      score: journey.context.score,
      lastActivity: journey.context.lastActivity
    };

    switch (department) {
      case 'sales':
        return {
          ...baseContext,
          leadSource: journey.context.source,
          qualification: journey.context.qualification,
          companySize: journey.context.estimatedCompanySize,
          intent: journey.context.intentSignals
        };

      case 'marketing':
        return {
          ...baseContext,
          campaignHistory: journey.context.campaigns,
          engagementLevel: journey.context.engagementLevel,
          preferences: journey.context.preferences
        };

      case 'support':
        return {
          ...baseContext,
          productInterest: journey.context.productInterest,
          previousTickets: journey.context.supportHistory,
          urgencyLevel: journey.context.urgencyLevel
        };

      default:
        return baseContext;
    }
  }

  // Monitoring and optimization
  startJourneyMonitoring() {
    this.journeyMonitor = setInterval(() => {
      this.analyzeJourneyPatterns();
      this.cleanupInactiveJourneys();
    }, 60000); // Every minute
  }

  analyzeJourneyPatterns() {
    // Simple pattern analysis for MVP
    const activeJourneys = Array.from(this.activeCustomers.values());

    // Analyze conversion patterns
    const stateDistribution = {};
    for (const journey of activeJourneys) {
      stateDistribution[journey.currentState] = (stateDistribution[journey.currentState] || 0) + 1;
    }

    // Look for stuck journeys
    const stuckJourneys = activeJourneys.filter(j =>
      Date.now() - j.updatedAt > 24 * 60 * 60 * 1000 // 24 hours
    );

    if (stuckJourneys.length > 0) {
      this.logger.info(`Found ${stuckJourneys.length} stuck journeys`);
      // Could trigger re-engagement campaigns
    }
  }

  cleanupInactiveJourneys() {
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days

    for (const [customerId, journey] of this.activeCustomers) {
      if (journey.updatedAt < cutoffTime) {
        this.activeCustomers.delete(customerId);
        this.logger.debug(`Cleaned up inactive journey: ${customerId}`);
      }
    }
  }

  // Utility methods
  estimateCompanySize(data) {
    // Simple heuristic based on email domain, title, etc.
    const domain = data.email?.split('@')[1] || '';
    const title = data.title || '';

    if (title.includes('CEO') || title.includes('Founder')) {
      return 'startup';
    } else if (title.includes('VP') || title.includes('Director')) {
      return 'mid-market';
    } else if (title.includes('Manager')) {
      return 'smb';
    }

    return 'unknown';
  }

  categorizeIndustry(data) {
    const company = data.company || '';
    const website = data.website || '';

    // Simple keyword matching
    if (company.includes('Tech') || website.includes('.io')) {
      return 'technology';
    } else if (company.includes('Consulting')) {
      return 'consulting';
    }

    return 'unknown';
  }

  calculateEngagementLevel(data) {
    let score = 0;

    if (data.emailOpens > 0) score += 10;
    if (data.websiteVisits > 1) score += 20;
    if (data.downloadedContent) score += 30;
    if (data.attendedWebinar) score += 40;

    return Math.min(100, score);
  }

  calculateScoreIncrease(journey, data) {
    // Score increase based on activity type
    const scoreMap = {
      'email_open': 5,
      'website_visit': 10,
      'content_download': 20,
      'demo_request': 30,
      'pricing_page': 25,
      'webinar_attendance': 35
    };

    return scoreMap[data.activityType] || 0;
  }

  getDefaultRules() {
    return {
      autoQualificationScore: 70,
      urgentEscalationScore: 90,
      inactivityThreshold: 24 * 60 * 60 * 1000, // 24 hours
      maxJourneyAge: 30 * 24 * 60 * 60 * 1000  // 30 days
    };
  }

  // Public API for other agents
  async getCustomerJourney(customerId) {
    return this.activeCustomers.get(customerId) ||
           await this.contextManager.getContext(`customer_journey:${customerId}`);
  }

  async updateCustomerData(customerId, data) {
    const journey = await this.getCustomerJourney(customerId);
    if (journey) {
      await this.handleCustomerEvent({
        customerId,
        eventType: 'data_update',
        data,
        source: 'external_update'
      });
    }
  }

  getStats() {
    return {
      activeCustomers: this.activeCustomers.size,
      journeyStates: this.getJourneyStateDistribution(),
      departmentConnections: this.departmentConnections.size,
      uptime: Date.now() - this.startTime
    };
  }

  getJourneyStateDistribution() {
    const distribution = {};
    for (const journey of this.activeCustomers.values()) {
      distribution[journey.currentState] = (distribution[journey.currentState] || 0) + 1;
    }
    return distribution;
  }
}