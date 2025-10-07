#!/usr/bin/env node

/**
 * Setup script for Mycelium development environment
 * Initializes configuration, checks dependencies, and prepares the system
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const PROJECT_ROOT = process.cwd();

async function main() {
  console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🍄 MYCELIUM SETUP                                        ║
║                                                              ║
║    Setting up your development environment...               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `));

  try {
    await checkNodeVersion();
    await createEnvironmentFile();
    await createConfigDirectories();
    await checkDependencies();
    await displayNextSteps();

    console.log(chalk.green('\n✅ Setup completed successfully!\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ Setup failed:'), error.message);
    process.exit(1);
  }
}

async function checkNodeVersion() {
  console.log(chalk.blue('📋 Checking Node.js version...'));

  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);

  if (major < 18) {
    throw new Error(`Node.js version 18+ required, found ${version}`);
  }

  console.log(chalk.green(`   ✓ Node.js ${version} is compatible`));
}

async function createEnvironmentFile() {
  console.log(chalk.blue('🔧 Setting up environment configuration...'));

  const envPath = join(PROJECT_ROOT, '.env');

  try {
    await fs.access(envPath);
    console.log(chalk.yellow('   ⚠ .env file already exists, skipping'));
    return;
  } catch {
    // .env doesn't exist, create it
  }

  try {
    const examplePath = join(PROJECT_ROOT, '.env.example');
    await fs.copyFile(examplePath, envPath);
    console.log(chalk.green('   ✓ Created .env file from template'));
    console.log(chalk.cyan('   📝 Please edit .env with your API keys and configuration'));
  } catch (error) {
    console.log(chalk.yellow('   ⚠ Could not create .env file:', error.message));
  }
}

async function createConfigDirectories() {
  console.log(chalk.blue('📁 Creating configuration directories...'));

  const directories = [
    'config',
    'config/agents',
    'logs',
    'data'
  ];

  for (const dir of directories) {
    const dirPath = join(PROJECT_ROOT, dir);

    try {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(chalk.green(`   ✓ Created directory: ${dir}`));
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.log(chalk.yellow(`   ⚠ Could not create directory ${dir}:`, error.message));
      }
    }
  }

  // Create basic configuration files
  await createDefaultConfigs();
}

async function createDefaultConfigs() {
  console.log(chalk.blue('⚙️ Creating default configuration files...'));

  const configs = {
    'config/development.json': {
      server: { port: 3000 },
      network: { port: 8080 },
      logging: { level: 'debug' },
      agents: { autoLoad: true, maxAgents: 5 }
    },
    'config/agents/customer-journey.json': {
      type: 'CustomerJourneyAgent',
      departments: ['sales', 'marketing', 'support'],
      autoStart: true,
      capabilities: ['lead-enrichment', 'cross-department-coordination']
    }
  };

  for (const [filePath, content] of Object.entries(configs)) {
    const fullPath = join(PROJECT_ROOT, filePath);

    try {
      await fs.access(fullPath);
      console.log(chalk.yellow(`   ⚠ ${filePath} already exists, skipping`));
      continue;
    } catch {
      // File doesn't exist, create it
    }

    try {
      await fs.writeFile(fullPath, JSON.stringify(content, null, 2));
      console.log(chalk.green(`   ✓ Created config: ${filePath}`));
    } catch (error) {
      console.log(chalk.yellow(`   ⚠ Could not create config ${filePath}:`, error.message));
    }
  }
}

async function checkDependencies() {
  console.log(chalk.blue('📦 Checking dependencies...'));

  try {
    const packagePath = join(PROJECT_ROOT, 'package.json');
    const packageContent = await fs.readFile(packagePath, 'utf8');
    const pkg = JSON.parse(packageContent);

    const requiredDeps = Object.keys(pkg.dependencies || {});
    const missingDeps = [];

    for (const dep of requiredDeps) {
      try {
        await import(dep);
      } catch {
        try {
          require.resolve(dep);
        } catch {
          missingDeps.push(dep);
        }
      }
    }

    if (missingDeps.length > 0) {
      console.log(chalk.yellow('   ⚠ Some dependencies may be missing:'));
      for (const dep of missingDeps) {
        console.log(chalk.yellow(`     - ${dep}`));
      }
      console.log(chalk.cyan('   💡 Run: npm install'));
    } else {
      console.log(chalk.green('   ✓ All dependencies are available'));
    }
  } catch (error) {
    console.log(chalk.yellow('   ⚠ Could not check dependencies:', error.message));
  }
}

async function displayNextSteps() {
  console.log(chalk.blue('\n🚀 Next Steps:'));

  const steps = [
    '1. Edit .env file with your API keys:',
    '   - ANTHROPIC_API_KEY (for Claude AI)',
    '   - OPENAI_API_KEY (optional, for OpenAI)',
    '',
    '2. Start the development environment:',
    '   npm run dev',
    '',
    '3. In another terminal, check network status:',
    '   npm run network:status',
    '',
    '4. Create your first agent:',
    '   npm run agent:create MyCustomAgent',
    '',
    '5. View the API documentation at:',
    '   http://localhost:3000/api/health'
  ];

  for (const step of steps) {
    if (step === '') {
      console.log('');
    } else if (step.startsWith('   ')) {
      console.log(chalk.cyan(step));
    } else {
      console.log(chalk.white(step));
    }
  }
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  console.error(chalk.red('\n💥 Uncaught exception:'), error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('\n💥 Unhandled rejection:'), reason);
  process.exit(1);
});

// Run setup
main();