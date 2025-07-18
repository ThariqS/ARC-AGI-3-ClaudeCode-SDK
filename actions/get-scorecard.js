import { program } from 'commander';
import chalk from 'chalk';
import { makeRequest, readJSON, CONFIG_FILE, SCORECARDS_FILE } from '../utils.js';

program
  .option('--card-id <id>', 'Specific scorecard ID to retrieve')
  .option('--game <game-id>', 'Filter scorecard to specific game')
  .parse();

const options = program.opts();

async function getScorecard() {
  try {
    let cardId = options.cardId;
    
    if (!cardId) {
      const config = await readJSON(CONFIG_FILE);
      if (!config.currentScorecardId) {
        console.error(chalk.red('No active scorecard. Specify --card-id or open a scorecard first.'));
        process.exit(1);
      }
      cardId = config.currentScorecardId;
    }
    
    console.log(chalk.blue(`Fetching scorecard: ${cardId}`));
    
    let endpoint = `/api/scorecard/${cardId}`;
    if (options.game) {
      endpoint += `/${options.game}`;
      console.log(chalk.gray(`Filtering to game: ${options.game}`));
    }
    
    const scorecard = await makeRequest(endpoint);
    
    console.log(chalk.green('\n✓ Scorecard retrieved successfully!\n'));
    
    console.log(chalk.yellow.bold('Summary:'));
    console.log(chalk.gray('Card ID:'), scorecard.card_id);
    console.log(chalk.gray('API Key:'), scorecard.api_key);
    console.log(chalk.blue('Games Won:'), `${scorecard.won}/${scorecard.played}`);
    console.log(chalk.blue('Total Score:'), scorecard.score);
    console.log(chalk.blue('Total Actions:'), scorecard.total_actions);
    
    if (scorecard.source_url) {
      console.log(chalk.gray('Source URL:'), scorecard.source_url);
    }
    
    if (scorecard.tags && scorecard.tags.length > 0) {
      console.log(chalk.gray('Tags:'), scorecard.tags.join(', '));
    }
    
    if (scorecard.opaque) {
      console.log(chalk.gray('Metadata:'), JSON.stringify(scorecard.opaque, null, 2));
    }
    
    console.log(chalk.yellow.bold('\nPer-Game Results:'));
    
    for (const [gameId, card] of Object.entries(scorecard.cards)) {
      console.log(`\n${chalk.blue(gameId)}`);
      console.log(chalk.gray('  Plays:'), card.total_plays);
      console.log(chalk.gray('  Actions:'), card.total_actions);
      
      if (card.scores && card.states && card.actions) {
        for (let i = 0; i < card.total_plays; i++) {
          const state = card.states[i];
          const stateIcon = state === 'WIN' ? '🏆' : 
                           state === 'GAME_OVER' ? '💀' : '🎮';
          console.log(chalk.gray(`  Play ${i + 1}:`), 
            `${stateIcon} ${state} - Score: ${card.scores[i]}, Actions: ${card.actions[i]}`);
        }
      }
    }
    
    const winRate = scorecard.played > 0 ? 
      ((scorecard.won / scorecard.played) * 100).toFixed(1) : 0;
    console.log(chalk.green.bold(`\nOverall Win Rate: ${winRate}%`));
    
  } catch (error) {
    console.error(chalk.red('Error fetching scorecard:'), error.message);
    process.exit(1);
  }
}

getScorecard();