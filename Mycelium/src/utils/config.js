/**
 * Configuration management for Mycelium
 * Loads and validates configuration from environment variables and files
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const env = process.env.NODE_ENV || 'development';

// Default configuration
const defaultConfig = {
  env,

  server: {
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || 'localhost',
    apiPrefix: '/api',
    cors: {
      enabled: true,
      origins: process.env.CORS_ORIGINS?.split(',') || ['*']
    }
  },

  network: {
    id: process.env.NETWORK_ID || `mycelium-${env}`,
    secret: process.env.NETWORK_SECRET || 'default-secret',
    maxConnections: parseInt(process.env.MAX_CONNECTIONS) || 100,
    heartbeatInterval: 30000,
    messageTimeout: 5000
  },

  agents: {
    maxAgents: parseInt(process.env.MAX_AGENTS) || 10,
    timeout: parseInt(process.env.AGENT_TIMEOUT) || 30000,
    autoLoad: process.env.AUTO_LOAD_AGENTS !== 'false',
    restartOnFailure: true,
    healthCheckInterval: 15000
  },

  context: {
    ttl: parseInt(process.env.CONTEXT_TTL) || 3600, // 1 hour
    maxSize: parseInt(process.env.MAX_CONTEXT_SIZE) || 1000000, // 1MB
    persistenceEnabled: process.env.PERSISTENCE_ENABLED !== 'false',
    compressionEnabled: true
  },

  decisions: {
    timeout: 10000,
    retries: 3,
    concurrentLimit: 5,
    historyRetention: 24 * 60 * 60 * 1000 // 24 hours
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'mycelium:',
    connectTimeout: 10000,
    retryAttempts: 3
  },

  ai: {
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
      maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS) || 1000,
      timeout: parseInt(process.env.ANTHROPIC_TIMEOUT) || 30000
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
      timeout: parseInt(process.env.OPENAI_TIMEOUT) || 30000
    }
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'pretty',
    file: process.env.LOG_FILE || null,
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
    maxSize: process.env.LOG_MAX_SIZE || '10m'
  },

  monitoring: {
    enabled: process.env.ENABLE_METRICS === 'true',
    port: parseInt(process.env.METRICS_PORT) || 9090,
    interval: parseInt(process.env.METRICS_INTERVAL) || 60000,
    retention: '7d'
  },

  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-encryption-key',
    rateLimiting: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: parseInt(process.env.API_RATE_LIMIT) || 1000
    }
  },

  integrations: {
    webhookSecret: process.env.WEBHOOK_SECRET || 'webhook-secret',
    retryAttempts: 3,
    timeout: 10000
  }
};

// Environment-specific overrides
const envConfigs = {
  development: {
    logging: {
      level: 'debug',
      format: 'pretty'
    },
    security: {
      jwtSecret: 'dev-secret-key'
    }
  },

  test: {
    server: {
      port: 0 // Use random port for tests
    },
    agents: {
      maxAgents: 3
    },
    logging: {
      level: 'error'
    },
    redis: {
      url: 'redis://localhost:6379/1' // Use different DB for tests
    }
  },

  production: {
    logging: {
      level: 'info',
      format: 'json'
    },
    monitoring: {
      enabled: true
    }
  }
};

// Load configuration files if they exist
function loadConfigFile(filename) {
  try {
    const configPath = join(process.cwd(), 'config', filename);
    const fileContent = readFileSync(configPath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    // Config file doesn't exist or is invalid - that's ok
    return {};
  }
}

// Merge configurations
function mergeConfig(...configs) {
  const result = {};

  for (const config of configs) {
    for (const key in config) {
      if (typeof config[key] === 'object' && config[key] !== null && !Array.isArray(config[key])) {
        result[key] = mergeConfig(result[key] || {}, config[key]);
      } else {
        result[key] = config[key];
      }
    }
  }

  return result;
}

// Build final configuration
const fileConfig = loadConfigFile(`${env}.json`);
const envConfig = envConfigs[env] || {};

export const config = mergeConfig(defaultConfig, envConfig, fileConfig);

// Validate required configuration
export function validateConfig() {
  const required = [
    'server.port',
    'network.id'
  ];

  for (const path of required) {
    const keys = path.split('.');
    let value = config;

    for (const key of keys) {
      value = value?.[key];
    }

    if (value === undefined || value === null) {
      throw new Error(`Required configuration missing: ${path}`);
    }
  }

  // Validate AI API keys if agents will use them
  if (config.agents.autoLoad && !config.ai.anthropic.apiKey && !config.ai.openai.apiKey) {
    console.warn('Warning: No AI API keys configured. Agents may not function properly.');
  }

  return true;
}

// Helper function to get nested config values
export function getConfig(path, defaultValue = undefined) {
  const keys = path.split('.');
  let value = config;

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      return defaultValue;
    }
  }

  return value;
}

// Validate on load
validateConfig();