/**
 * Logger utility for Mycelium
 * Provides structured logging with different levels and formats
 */

import chalk from 'chalk';
import { config } from './config.js';

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4
};

const LEVEL_COLORS = {
  error: chalk.red,
  warn: chalk.yellow,
  info: chalk.blue,
  debug: chalk.gray,
  trace: chalk.dim
};

const LEVEL_ICONS = {
  error: '❌',
  warn: '⚠️ ',
  info: '💡',
  debug: '🔍',
  trace: '📍'
};

export class Logger {
  constructor(component = 'System') {
    this.component = component;
    this.level = config.logging?.level || 'info';
    this.format = config.logging?.format || 'pretty';
    this.minLevel = LOG_LEVELS[this.level] || LOG_LEVELS.info;
  }

  log(level, message, meta = {}) {
    const levelNumber = LOG_LEVELS[level] || LOG_LEVELS.info;

    // Skip if level is too low
    if (levelNumber > this.minLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      component: this.component,
      message,
      ...meta
    };

    if (this.format === 'json') {
      console.log(JSON.stringify(logData));
    } else {
      this.prettyLog(level, message, meta, timestamp);
    }
  }

  prettyLog(level, message, meta, timestamp) {
    const color = LEVEL_COLORS[level] || chalk.white;
    const icon = LEVEL_ICONS[level] || '•';
    const time = chalk.dim(new Date(timestamp).toLocaleTimeString());
    const component = chalk.cyan(`[${this.component}]`);

    let output = `${icon} ${time} ${component} ${color(message)}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      output += chalk.dim(` ${JSON.stringify(meta)}`);
    }

    console.log(output);
  }

  error(message, meta = {}) {
    if (meta instanceof Error) {
      meta = {
        error: {
          name: meta.name,
          message: meta.message,
          stack: meta.stack
        }
      };
    }
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  trace(message, meta = {}) {
    this.log('trace', message, meta);
  }

  // Contextual loggers
  withContext(context) {
    return new ContextualLogger(this, context);
  }

  // Performance timing
  time(label) {
    const start = process.hrtime.bigint();
    return {
      end: () => {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // Convert to milliseconds
        this.debug(`${label} completed in ${duration.toFixed(2)}ms`);
        return duration;
      }
    };
  }
}

class ContextualLogger {
  constructor(logger, context) {
    this.logger = logger;
    this.context = context;
  }

  log(level, message, meta = {}) {
    this.logger.log(level, message, { ...this.context, ...meta });
  }

  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  trace(message, meta = {}) {
    this.log('trace', message, meta);
  }
}

// Global logger instance
export const globalLogger = new Logger('Global');

// Convenience function for quick logging
export function log(level, message, meta = {}) {
  globalLogger.log(level, message, meta);
}