#!/usr/bin/env node

/**
 * Mycelium - The Living AI Network
 * Main entry point for the Mycelium system
 */

import { MyceliumCore } from './core/mycelium-core.js';
import { Logger } from './utils/logger.js';
import { config } from './utils/config.js';
import chalk from 'chalk';

const logger = new Logger('Main');

async function startMycelium() {
  try {
    console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🍄 MYCELIUM - The Living AI Network                      ║
║                                                              ║
║    Phase 1 MVP - Distributed Intelligence Network           ║
║    Version: 0.1.0                                           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    `));

    logger.info('Initializing Mycelium Core...');

    // Initialize the core system
    const mycelium = new MyceliumCore(config);

    // Start the network
    await mycelium.initialize();
    await mycelium.start();

    logger.info(chalk.green('🚀 Mycelium network is now active!'));
    logger.info(`🌐 Network ID: ${config.network.id}`);
    logger.info(`📡 Listening on port: ${config.server.port}`);
    logger.info(`🤖 Max agents: ${config.agents.maxAgents}`);

    // Graceful shutdown handling
    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      await mycelium.shutdown();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      await mycelium.shutdown();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start Mycelium:', error);
    process.exit(1);
  }
}

// Only run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  startMycelium().catch((error) => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}