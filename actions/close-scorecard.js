import chalk from 'chalk';
import { makeRequest, readJSON, writeJSON, CONFIG_FILE, SCORECARDS_FILE } from '../utils.js';

async function closeScorecard() {
  try {
    const config = await readJSON(CONFIG_FILE);
    
    if (!config.currentScorecardId) {
      console.error(chalk.red('No active scorecard to close.'));
      process.exit(1);
    }
    
    console.log(chalk.blue(`Closing scorecard: ${config.currentScorecardId}`));
    
    const requestBody = {
      card_id: config.currentScorecardId
    };
    
    const response = await makeRequest('/api/scorecard/close', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
    
    const scorecards = await readJSON(SCORECARDS_FILE) || { openScorecard: null, history: [] };
    
    if (scorecards.openScorecard) {
      scorecards.history.push({
        ...scorecards.openScorecard,
        closedAt: new Date().toISOString(),
        results: response
      });
    }
    
    scorecards.openScorecard = null;
    await writeJSON(SCORECARDS_FILE, scorecards);
    
    config.currentScorecardId = null;
    await writeJSON(CONFIG_FILE, config);
    
    console.log(chalk.green('\n✓ Scorecard closed successfully!\n'));
    
    console.log(chalk.yellow.bold('Final Results:'));
    console.log(chalk.blue('Games Won:'), `${response.won}/${response.played}`);
    console.log(chalk.blue('Total Score:'), response.score);
    console.log(chalk.blue('Total Actions:'), response.total_actions);
    
    const winRate = response.played > 0 ? 
      ((response.won / response.played) * 100).toFixed(1) : 0;
    console.log(chalk.green.bold(`Win Rate: ${winRate}%`));
    
    console.log(chalk.yellow.bold('\nPer-Game Summary:'));
    
    for (const [gameId, card] of Object.entries(response.cards)) {
      const gameWins = card.states ? card.states.filter(s => s === 'WIN').length : 0;
      const gameWinRate = card.total_plays > 0 ? 
        ((gameWins / card.total_plays) * 100).toFixed(1) : 0;
      
      console.log(`\n${chalk.blue(gameId)}`);
      console.log(chalk.gray('  Plays:'), card.total_plays);
      console.log(chalk.gray('  Wins:'), gameWins);
      console.log(chalk.gray('  Win Rate:'), `${gameWinRate}%`);
      console.log(chalk.gray('  Total Actions:'), card.total_actions);
      
      if (card.scores && card.scores.length > 0) {
        const avgScore = (card.scores.reduce((a, b) => a + b, 0) / card.scores.length).toFixed(1);
        console.log(chalk.gray('  Average Score:'), avgScore);
      }
    }
    
    console.log(chalk.gray('\n\nTo start a new scorecard:'));
    console.log(chalk.gray('  node open-scorecard.js'));
    
  } catch (error) {
    console.error(chalk.red('Error closing scorecard:'), error.message);
    process.exit(1);
  }
}

closeScorecard();