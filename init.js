import { program } from 'commander';
import chalk from 'chalk';
import { writeJSON, CONFIG_FILE } from './utils.js';

program
  .requiredOption('--api-key <key>', 'Your ARC-AGI-3 API key')
  .option('--base-url <url>', 'API base URL', 'https://three.arcprize.org')
  .parse();

const options = program.opts();

async function init() {
  try {
    const config = {
      apiKey: options.apiKey,
      baseUrl: options.baseUrl,
      currentScorecardId: null
    };

    await writeJSON(CONFIG_FILE, config);
    
    console.log(chalk.green('✓ Configuration saved successfully!'));
    console.log(chalk.blue('API Key:'), options.apiKey.substring(0, 8) + '...');
    console.log(chalk.blue('Base URL:'), options.baseUrl);
    console.log('\nYou can now use the other commands:');
    console.log(chalk.gray('  node list-games.js'));
    console.log(chalk.gray('  node open-scorecard.js'));
    console.log(chalk.gray('  node start-game.js --game <game-id>'));
  } catch (error) {
    console.error(chalk.red('Error saving configuration:'), error.message);
    process.exit(1);
  }
}

init();