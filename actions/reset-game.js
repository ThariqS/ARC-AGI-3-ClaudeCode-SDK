import { program } from 'commander';
import chalk from 'chalk';
import { makeRequest, readJSON, writeJSON, saveFrame, CONFIG_FILE, SESSIONS_FILE } from '../utils.js';

program
  .option('--game <game-id>', 'Game ID to reset (uses last active if not specified)')
  .option('--full', 'Force full game reset (call RESET twice)')
  .parse();

const options = program.opts();

async function resetGame() {
  try {
    const config = await readJSON(CONFIG_FILE);
    if (!config.currentScorecardId) {
      console.error(chalk.red('No open scorecard found. Please open a scorecard first.'));
      process.exit(1);
    }
    
    const sessions = await readJSON(SESSIONS_FILE);
    if (!sessions || Object.keys(sessions).length === 0) {
      console.error(chalk.red('No game sessions found. Start a game first.'));
      process.exit(1);
    }
    
    let gameId = options.game;
    if (!gameId) {
      const lastSession = Object.entries(sessions).sort((a, b) => 
        new Date(b[1].startTime) - new Date(a[1].startTime)
      )[0];
      gameId = lastSession[0];
      console.log(chalk.yellow(`Using last active game: ${gameId}`));
    }
    
    const session = sessions[gameId];
    if (!session) {
      console.error(chalk.red(`No session found for game: ${gameId}`));
      process.exit(1);
    }
    
    console.log(chalk.blue(`Resetting game: ${gameId}`));
    
    const requestBody = {
      game_id: gameId,
      card_id: config.currentScorecardId,
      guid: session.guid
    };
    
    const response = await makeRequest('/api/cmd/RESET', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
    
    let resetType = 'Level reset';
    let finalResponse = response;
    
    if (options.full) {
      console.log(chalk.blue('Performing second RESET for full game reset...'));
      const secondResponse = await makeRequest('/api/cmd/RESET', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      resetType = 'Full game reset';
      finalResponse = secondResponse;
    }
    
    await saveFrame(
      session.guid,
      session.frameCount,
      finalResponse,
      { type: 'RESET', params: { full: options.full || false } },
      resetType
    );
    
    session.state = finalResponse.state;
    session.score = finalResponse.score;
    session.frameCount++;
    
    await writeJSON(SESSIONS_FILE, sessions);
    
    console.log(chalk.green(`\n✓ ${resetType} successful!`));
    console.log(chalk.blue('State:'), finalResponse.state);
    console.log(chalk.blue('Score:'), `${finalResponse.score}/${finalResponse.win_score}`);
    
    console.log('\nNext steps:');
    console.log(chalk.gray('  node status.js          # View current state'));
    console.log(chalk.gray('  node action.js --type 1 # Continue playing'));
    
  } catch (error) {
    console.error(chalk.red('Error resetting game:'), error.message);
    process.exit(1);
  }
}

resetGame();