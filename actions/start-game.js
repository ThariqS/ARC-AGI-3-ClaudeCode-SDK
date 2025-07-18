import { program } from 'commander';
import chalk from 'chalk';
import { makeRequest, readJSON, writeJSON, saveFrame, CONFIG_FILE, SESSIONS_FILE, ensureFile } from '../utils.js';

program
  .requiredOption('--game <game-id>', 'Game ID to start')
  .parse();

const options = program.opts();

async function startGame() {
  try {
    const config = await readJSON(CONFIG_FILE);
    
    if (!config.currentScorecardId) {
      console.error(chalk.red('No open scorecard found. Please open a scorecard first:'));
      console.error(chalk.gray('  node open-scorecard.js'));
      process.exit(1);
    }
    
    await ensureFile(SESSIONS_FILE, {});
    
    console.log(chalk.blue(`Starting new game: ${options.game}`));
    
    const requestBody = {
      game_id: options.game,
      card_id: config.currentScorecardId
    };
    
    const response = await makeRequest('/api/cmd/RESET', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
    
    const sessions = await readJSON(SESSIONS_FILE);
    sessions[options.game] = {
      guid: response.guid,
      state: response.state,
      score: response.score,
      winScore: response.win_score,
      frameCount: 1,
      actionCount: 0,
      startTime: new Date().toISOString()
    };
    await writeJSON(SESSIONS_FILE, sessions);
    
    await saveFrame(
      response.guid,
      0,
      response,
      { type: 'RESET', params: {} },
      'Game initialized'
    );
    
    console.log(chalk.green('\n✓ Game started successfully!'));
    console.log(chalk.yellow('Session ID:'), response.guid);
    console.log(chalk.blue('State:'), response.state);
    console.log(chalk.blue('Score:'), `${response.score}/${response.win_score}`);
    console.log(chalk.gray(`Frame size: ${response.frame[0].length}x${response.frame[0][0].length}`));
    
    const nonZeroPixels = response.frame[0].flat().flat().filter(pixel => pixel !== 0).length;
    console.log(chalk.gray(`Non-zero pixels: ${nonZeroPixels}`));
    
    console.log('\nNext steps:');
    console.log(chalk.gray('  node status.js                    # View current state'));
    console.log(chalk.gray('  node action.js --type 1           # Execute ACTION1'));
    console.log(chalk.gray('  node action.js --type 6 --x 10 --y 20  # Execute ACTION6'));
    
  } catch (error) {
    console.error(chalk.red('Error starting game:'), error.message);
    process.exit(1);
  }
}

startGame();