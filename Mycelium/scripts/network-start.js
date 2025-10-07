#!/usr/bin/env node

/**
 * Network Start Script - Starts the Mycelium network with agents
 * Provides a convenient way to start the system with predefined configurations
 */

import { MyceliumCore } from '../src/core/mycelium-core.js';
import { config } from '../src/utils/config.js';
import { Logger } from '../src/utils/logger.js';
import chalk from 'chalk';

const logger = new Logger('NetworkStart');

async function startNetwork() {
  console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🌐 MYCELIUM NETWORK STARTUP                              ║
║                                                              ║
║    Starting distributed AI network...                       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `));

  try {
    // Initialize Mycelium
    const mycelium = new MyceliumCore(config);

    console.log(chalk.blue('🔧 Initializing core systems...'));
    await mycelium.initialize();

    console.log(chalk.blue('🚀 Starting network services...'));
    await mycelium.start();

    // Display network information
    displayNetworkInfo(mycelium);

    // Set up graceful shutdown
    setupGracefulShutdown(mycelium);

    // Start monitoring loop
    startMonitoringLoop(mycelium);

  } catch (error) {
    console.error(chalk.red('❌ Failed to start network:'), error.message);
    logger.error('Network startup failed:', error);
    process.exit(1);
  }
}

function displayNetworkInfo(mycelium) {
  const status = mycelium.getNetworkStatus();

  console.log(chalk.green('\n✅ Mycelium Network is running!\n'));

  console.log(chalk.white('📊 Network Status:'));
  console.log(chalk.cyan(`   🌐 Network ID: ${config.network.id}`));
  console.log(chalk.cyan(`   📡 API Server: http://localhost:${config.server.port}`));
  console.log(chalk.cyan(`   🔌 WebSocket: ws://localhost:${config.network.port || 8080}/ws`));
  console.log(chalk.cyan(`   🤖 Active Agents: ${status.agents.length}`));

  if (status.agents.length > 0) {
    console.log(chalk.white('\n🤖 Active Agents:'));
    for (const agent of status.agents) {
      const statusIcon = agent.status === 'running' ? '🟢' : '🟡';
      console.log(chalk.cyan(`   ${statusIcon} ${agent.id} (${agent.type}) - ${agent.status}`));
    }
  }

  console.log(chalk.white('\n📡 API Endpoints:'));
  console.log(chalk.cyan(`   🏥 Health Check: GET /api/health`));
  console.log(chalk.cyan(`   📊 Network Status: GET /api/network/status`));
  console.log(chalk.cyan(`   🤖 List Agents: GET /api/agents`));
  console.log(chalk.cyan(`   🧠 Context Query: POST /api/context/query`));

  console.log(chalk.white('\n📝 Useful Commands:'));
  console.log(chalk.cyan('   npm run network:status  - Check network status'));
  console.log(chalk.cyan('   npm run agent:create    - Create a new agent'));
  console.log(chalk.cyan('   curl localhost:3000/api/health - Test API'));

  console.log(chalk.dim('\n   Press Ctrl+C to stop the network\n'));
}

function setupGracefulShutdown(mycelium) {
  const shutdown = async (signal) => {
    console.log(chalk.yellow(`\n🛑 Received ${signal}, shutting down gracefully...`));

    try {
      await mycelium.shutdown();
      console.log(chalk.green('✅ Network shut down successfully'));
      process.exit(0);
    } catch (error) {
      console.error(chalk.red('❌ Error during shutdown:'), error.message);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGQUIT', () => shutdown('SIGQUIT'));
}

function startMonitoringLoop(mycelium) {
  let lastStatus = {};

  const monitor = setInterval(() => {
    try {
      const status = mycelium.getNetworkStatus();

      // Check for agent changes
      if (status.agents.length !== lastStatus.agentCount) {
        const change = status.agents.length - (lastStatus.agentCount || 0);
        const icon = change > 0 ? '📈' : '📉';
        console.log(chalk.blue(`${icon} Agent count changed: ${status.agents.length} (${change > 0 ? '+' : ''}${change})`));
      }

      // Check for agent status changes
      const runningAgents = status.agents.filter(a => a.status === 'running').length;
      if (runningAgents !== lastStatus.runningAgents) {
        console.log(chalk.blue(`🤖 Running agents: ${runningAgents}/${status.agents.length}`));
      }

      lastStatus = {
        agentCount: status.agents.length,
        runningAgents
      };

    } catch (error) {
      logger.error('Monitoring error:', error);
    }
  }, 30000); // Monitor every 30 seconds

  // Clean up on shutdown
  process.on('exit', () => {
    clearInterval(monitor);
  });
}

// Handle startup errors
process.on('uncaughtException', (error) => {
  console.error(chalk.red('\n💥 Uncaught exception during startup:'), error.message);
  logger.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('\n💥 Unhandled rejection during startup:'), reason);
  logger.error('Unhandled rejection:', reason);
  process.exit(1);
});

// Start the network
startNetwork();