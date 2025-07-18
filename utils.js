import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONFIG_FILE = path.join(__dirname, 'config.json');
export const GAMES_FILE = path.join(__dirname, 'games.json');
export const SESSIONS_FILE = path.join(__dirname, 'sessions.json');
export const SCORECARDS_FILE = path.join(__dirname, 'scorecards.json');
export const FRAMES_DIR = path.join(__dirname, 'frames');
export const GAMES_DIR = path.join(__dirname, 'games');

export async function ensureFile(filePath, defaultContent = {}) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(defaultContent, null, 2));
  }
}

export async function readJSON(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function getConfig() {
  await ensureFile(CONFIG_FILE, { apiKey: null, baseUrl: 'https://three.arcprize.org' });
  return readJSON(CONFIG_FILE);
}

export async function makeRequest(endpoint, options = {}) {
  const config = await getConfig();
  
  if (!config.apiKey) {
    throw new Error('API key not configured. Run: node init.js --api-key YOUR-KEY');
  }

  const fetch = (await import('node-fetch')).default;
  
  const response = await fetch(`${config.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'X-API-Key': config.apiKey,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function saveFrame(guid, frameNumber, frameData, action, caption = '') {
  // Extract game ID from frameData or get it from sessions
  let gameId = frameData.game_id;
  if (!gameId) {
    const sessions = await readJSON(SESSIONS_FILE) || {};
    gameId = sessions[guid]?.gameId;
  }
  
  // Save in both old location (for compatibility) and new location
  const oldFrameDir = path.join(FRAMES_DIR, guid);
  const newFrameDir = gameId ? path.join(GAMES_DIR, gameId, 'frames') : oldFrameDir;
  
  await fs.mkdir(oldFrameDir, { recursive: true });
  await fs.mkdir(newFrameDir, { recursive: true });
  
  const frameFileName = `frame_${frameNumber.toString().padStart(4, '0')}.json`;
  const oldFrameFile = path.join(oldFrameDir, frameFileName);
  const newFrameFile = path.join(newFrameDir, frameFileName);
  
  const frameRecord = {
    frameNumber,
    timestamp: new Date().toISOString(),
    action: action || { type: 'UNKNOWN', params: {} },
    caption,
    state: frameData.state,
    score: frameData.score,
    winScore: frameData.win_score,
    frame: frameData.frame,
    changes: {
      description: caption || 'Frame captured',
      pixelsChanged: 0
    }
  };
  
  await writeJSON(oldFrameFile, frameRecord);
  if (gameId) {
    await writeJSON(newFrameFile, frameRecord);
  }
  
  const oldSummaryFile = path.join(oldFrameDir, 'summary.json');
  const newSummaryFile = path.join(newFrameDir, 'summary.json');
  let summary = await readJSON(oldSummaryFile) || await readJSON(newSummaryFile) || {
    gameId: frameData.game_id,
    guid: frameData.guid,
    totalFrames: 0,
    finalState: 'NOT_FINISHED',
    finalScore: 0,
    totalActions: 0,
    startTime: new Date().toISOString(),
    timeline: []
  };
  
  summary.totalFrames = frameNumber + 1;
  summary.finalState = frameData.state;
  summary.finalScore = frameData.score;
  summary.timeline.push({
    frame: frameNumber,
    action: action?.type || 'UNKNOWN',
    caption: caption || ''
  });
  
  await writeJSON(oldSummaryFile, summary);
  if (gameId) {
    await writeJSON(newSummaryFile, summary);
    
    // Also update game.json if it exists
    const gameJsonPath = path.join(GAMES_DIR, gameId, 'game.json');
    const gameData = await readJSON(gameJsonPath);
    if (gameData) {
      gameData.currentScore = frameData.score;
      gameData.sessionId = guid;
      gameData.lastUpdated = new Date().toISOString();
      await writeJSON(gameJsonPath, gameData);
    }
  }
}