import { program } from 'commander';
import chalk from 'chalk';
import { makeRequest, readJSON, writeJSON, saveFrame, SESSIONS_FILE } from '../utils.js';

program
  .requiredOption('--type <number>', 'Action type (1-6)', parseInt)
  .option('--x <number>', 'X coordinate (0-63) for ACTION6', parseInt)
  .option('--y <number>', 'Y coordinate (0-63) for ACTION6', parseInt)
  .option('--game <game-id>', 'Game ID (uses last active if not specified)')
  .option('--reasoning <json>', 'Reasoning metadata as JSON')
  .parse();

const options = program.opts();

function generateCaption(actionType, x, y, prevScore, newScore) {
  const scoreDiff = newScore - prevScore;
  let actionDesc = `ACTION${actionType}`;
  
  if (actionType === 6 && x !== undefined && y !== undefined) {
    actionDesc = `ACTION6 at (${x}, ${y})`;
  }
  
  if (scoreDiff > 0) {
    return `Executed ${actionDesc} - Score increased by ${scoreDiff}`;
  } else if (scoreDiff < 0) {
    return `Executed ${actionDesc} - Score decreased by ${Math.abs(scoreDiff)}`;
  } else {
    return `Executed ${actionDesc}`;
  }
}

async function executeAction() {
  try {
    if (options.type < 1 || options.type > 6) {
      console.error(chalk.red('Action type must be between 1 and 6'));
      process.exit(1);
    }
    
    if (options.type === 6 && (options.x === undefined || options.y === undefined)) {
      console.error(chalk.red('ACTION6 requires --x and --y coordinates'));
      process.exit(1);
    }
    
    if (options.type === 6 && (options.x < 0 || options.x > 63 || options.y < 0 || options.y > 63)) {
      console.error(chalk.red('Coordinates must be between 0 and 63'));
      process.exit(1);
    }
    
    const sessions = await readJSON(SESSIONS_FILE);
    if (!sessions || Object.keys(sessions).length === 0) {
      console.error(chalk.red('No active game sessions. Start a game first:'));
      console.error(chalk.gray('  node start-game.js --game <game-id>'));
      process.exit(1);
    }
    
    let gameId = options.game;
    if (!gameId) {
      const activeSessions = Object.entries(sessions)
        .filter(([_, session]) => session.state === 'NOT_FINISHED');
      
      if (activeSessions.length === 0) {
        console.error(chalk.red('No active games found. Start a new game.'));
        process.exit(1);
      }
      
      gameId = activeSessions[0][0];
      if (activeSessions.length > 1) {
        console.log(chalk.yellow(`Multiple active games found. Using: ${gameId}`));
      }
    }
    
    const session = sessions[gameId];
    if (!session) {
      console.error(chalk.red(`No session found for game: ${gameId}`));
      process.exit(1);
    }
    
    if (session.state !== 'NOT_FINISHED') {
      console.error(chalk.red(`Game is in ${session.state} state. Reset the game to continue.`));
      process.exit(1);
    }
    
    let requestBody = {
      game_id: gameId,
      guid: session.guid
    };
    
    if (options.reasoning) {
      try {
        requestBody.reasoning = JSON.parse(options.reasoning);
      } catch (e) {
        console.error(chalk.red('Invalid JSON in reasoning:'), e.message);
        process.exit(1);
      }
    }
    
    let endpoint = `/api/cmd/ACTION${options.type}`;
    
    if (options.type === 6) {
      requestBody.x = options.x;
      requestBody.y = options.y;
    }
    
    console.log(chalk.blue(`Executing ACTION${options.type}...`));
    
    const response = await makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });
    
    const caption = generateCaption(
      options.type,
      options.x,
      options.y,
      session.score,
      response.score
    );
    
    const actionData = {
      type: `ACTION${options.type}`,
      params: options.type === 6 ? { x: options.x, y: options.y } : {}
    };
    
    await saveFrame(
      session.guid,
      session.frameCount,
      response,
      actionData,
      caption
    );
    
    session.state = response.state;
    session.score = response.score;
    session.frameCount++;
    session.actionCount++;
    
    await writeJSON(SESSIONS_FILE, sessions);
    
    console.log(chalk.green('\n✓ Action executed successfully!'));
    console.log(chalk.blue('State:'), response.state);
    console.log(chalk.blue('Score:'), `${response.score}/${response.win_score}`);
    
    if (response.state === 'WIN') {
      console.log(chalk.green.bold('\n🎉 GAME WON! 🎉'));
    } else if (response.state === 'GAME_OVER') {
      console.log(chalk.red.bold('\n💀 GAME OVER 💀'));
    }
    
    const frameChanges = [];
    if (session.lastFrame) {
      for (let i = 0; i < response.frame[0].length; i++) {
        for (let j = 0; j < response.frame[0][i].length; j++) {
          for (let k = 0; k < response.frame[0][i][j].length; k++) {
            if (session.lastFrame[0]?.[i]?.[j]?.[k] !== response.frame[0][i][j][k]) {
              frameChanges.push(`(${j},${k})`);
            }
          }
        }
      }
    }
    
    if (frameChanges.length > 0 && frameChanges.length < 20) {
      console.log(chalk.gray(`Pixels changed: ${frameChanges.join(', ')}`));
    } else if (frameChanges.length >= 20) {
      console.log(chalk.gray(`${frameChanges.length} pixels changed`));
    }
    
    session.lastFrame = response.frame;
    
  } catch (error) {
    console.error(chalk.red('Error executing action:'), error.message);
    process.exit(1);
  }
}

executeAction();