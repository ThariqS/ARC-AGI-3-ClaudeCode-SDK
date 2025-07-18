import chalk from 'chalk';
import path from 'path';
import { readJSON, SESSIONS_FILE, CONFIG_FILE, FRAMES_DIR } from '../utils.js';
import fs from 'fs/promises';

async function showStatus() {
  try {
    const config = await readJSON(CONFIG_FILE);
    const sessions = await readJSON(SESSIONS_FILE);
    
    console.log(chalk.blue.bold('\n=== ARC-AGI-3 CLI Status ===\n'));
    
    if (config.currentScorecardId) {
      console.log(chalk.yellow('Active Scorecard:'), config.currentScorecardId);
    } else {
      console.log(chalk.gray('No active scorecard'));
    }
    
    console.log();
    
    if (!sessions || Object.keys(sessions).length === 0) {
      console.log(chalk.gray('No game sessions found.'));
      console.log(chalk.gray('\nTo start playing:'));
      console.log(chalk.gray('  node open-scorecard.js'));
      console.log(chalk.gray('  node start-game.js --game <game-id>'));
      return;
    }
    
    console.log(chalk.blue.bold('Game Sessions:'));
    console.log();
    
    for (const [gameId, session] of Object.entries(sessions)) {
      const isActive = session.state === 'NOT_FINISHED';
      const statusIcon = isActive ? '🎮' : session.state === 'WIN' ? '🏆' : '💀';
      
      console.log(`${statusIcon} ${chalk.yellow(gameId)}`);
      console.log(chalk.gray('  Session ID:'), session.guid);
      console.log(chalk.gray('  State:'), isActive ? chalk.green(session.state) : chalk.red(session.state));
      console.log(chalk.gray('  Score:'), `${session.score}/${session.winScore}`);
      console.log(chalk.gray('  Actions:'), session.actionCount);
      console.log(chalk.gray('  Frames:'), session.frameCount);
      
      const startTime = new Date(session.startTime);
      const duration = Date.now() - startTime.getTime();
      const minutes = Math.floor(duration / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);
      console.log(chalk.gray('  Duration:'), `${minutes}m ${seconds}s`);
      
      const frameDir = path.join(FRAMES_DIR, session.guid);
      try {
        const frames = await fs.readdir(frameDir);
        const frameFiles = frames.filter(f => f.startsWith('frame_'));
        if (frameFiles.length > 0) {
          const lastFrameFile = frameFiles.sort().pop();
          const lastFrame = await readJSON(path.join(frameDir, lastFrameFile));
          if (lastFrame.caption) {
            console.log(chalk.gray('  Last action:'), lastFrame.caption);
          }
        }
      } catch (e) {
        // Frame directory might not exist
      }
      
      console.log();
    }
    
    const activeSessions = Object.entries(sessions)
      .filter(([_, s]) => s.state === 'NOT_FINISHED');
    
    if (activeSessions.length > 0) {
      console.log(chalk.green('Active games available for play!'));
      console.log(chalk.gray('\nContinue playing:'));
      console.log(chalk.gray('  node action.js --type 1'));
      console.log(chalk.gray('  node reset-game.js'));
    } else {
      console.log(chalk.gray('No active games. Start a new one:'));
      console.log(chalk.gray('  node start-game.js --game <game-id>'));
    }
    
  } catch (error) {
    console.error(chalk.red('Error reading status:'), error.message);
    process.exit(1);
  }
}

showStatus();