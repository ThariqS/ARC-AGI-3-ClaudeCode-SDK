import fs from 'fs';

/**
 * Compare two frames and identify pixel differences
 * @param {string} frame1Path - Path to first frame JSON file
 * @param {string} frame2Path - Path to second frame JSON file
 * @returns {Array} Array of differences with row, col, oldVal, newVal
 */
export function compareFrames(frame1Path, frame2Path) {
    const frame1 = JSON.parse(fs.readFileSync(frame1Path, 'utf8'));
    const frame2 = JSON.parse(fs.readFileSync(frame2Path, 'utf8'));
    
    const grid1 = frame1.frame[0];
    const grid2 = frame2.frame[0];
    
    const differences = [];
    for (let row = 0; row < 64; row++) {
        for (let col = 0; col < 64; col++) {
            if (grid1[row][col] !== grid2[row][col]) {
                differences.push({
                    row, 
                    col, 
                    oldVal: grid1[row][col], 
                    newVal: grid2[row][col]
                });
            }
        }
    }
    
    return differences;
}

/**
 * Load a frame from JSON file
 * @param {string} framePath - Path to frame JSON file
 * @returns {Object} Frame object with grid data
 */
export function loadFrame(framePath) {
    return JSON.parse(fs.readFileSync(framePath, 'utf8'));
}

/**
 * Get the grid from a frame
 * @param {Object} frame - Frame object
 * @returns {Array} 2D grid array
 */
export function getGrid(frame) {
    return frame.frame[0];
}

/**
 * Print a summary of frame differences
 * @param {Array} differences - Array of pixel differences
 * @param {string} actionName - Name of the action that caused changes
 */
export function printDifferenceSummary(differences, actionName) {
    console.log(`\n${actionName}:`);
    if (differences.length === 0) {
        console.log('  No changes detected');
    } else {
        console.log(`  ${differences.length} pixels changed`);
        differences.slice(0, 5).forEach(d => {
            console.log(`    (${d.row},${d.col}): ${d.oldVal} → ${d.newVal}`);
        });
        if (differences.length > 5) {
            console.log(`    ... and ${differences.length - 5} more`);
        }
    }
}

/**
 * Get all frame files in a session directory
 * @param {string} sessionDir - Path to session directory
 * @returns {Array} Sorted array of frame file paths
 */
export function getFrameFiles(sessionDir) {
    const files = fs.readdirSync(sessionDir)
        .filter(f => f.startsWith('frame_') && f.endsWith('.json'))
        .sort();
    return files.map(f => `${sessionDir}/${f}`);
}