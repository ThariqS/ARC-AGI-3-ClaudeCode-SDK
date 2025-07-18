/**
 * Convert grid to ASCII art representation
 * @param {Array} grid - 2D grid array
 * @param {Object} colorMap - Optional mapping of color values to characters
 * @returns {string} ASCII representation of the grid
 */
export function gridToAscii(grid, colorMap = null) {
    const defaultMap = {
        0: ' ', 1: '1', 2: '2', 3: '█', 4: '▓', 5: '▒', 
        6: '6', 7: '7', 8: '8', 9: '░', 10: 'A', 11: 'B',
        12: 'C', 13: 'D', 14: 'E', 15: 'F'
    };
    
    const map = colorMap || defaultMap;
    let ascii = '';
    
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[0].length; col++) {
            const val = grid[row][col];
            ascii += map[val] || val.toString();
        }
        ascii += '\n';
    }
    
    return ascii;
}

/**
 * Display a small region of the grid
 * @param {Array} grid - 2D grid array
 * @param {number} centerRow - Center row of region
 * @param {number} centerCol - Center column of region
 * @param {number} radius - Radius around center to display
 * @returns {string} ASCII representation of the region
 */
export function displayRegion(grid, centerRow, centerCol, radius = 5) {
    const startRow = Math.max(0, centerRow - radius);
    const endRow = Math.min(grid.length - 1, centerRow + radius);
    const startCol = Math.max(0, centerCol - radius);
    const endCol = Math.min(grid[0].length - 1, centerCol + radius);
    
    let display = `Region around (${centerRow}, ${centerCol}):\n`;
    display += '  ';
    
    // Column headers
    for (let col = startCol; col <= endCol; col++) {
        display += (col % 10).toString();
    }
    display += '\n';
    
    // Grid with row numbers
    for (let row = startRow; row <= endRow; row++) {
        display += (row % 10).toString() + ' ';
        for (let col = startCol; col <= endCol; col++) {
            const val = grid[row][col];
            display += val < 10 ? val.toString() : String.fromCharCode(65 + val - 10);
        }
        display += '\n';
    }
    
    return display;
}

/**
 * Create a summary visualization of the grid
 * @param {Array} grid - 2D grid array
 * @param {number} scale - Scale factor for downsampling (e.g., 4 means 4x4 blocks)
 * @returns {string} Downsampled ASCII representation
 */
export function createGridSummary(grid, scale = 4) {
    const summaryRows = Math.ceil(grid.length / scale);
    const summaryCols = Math.ceil(grid[0].length / scale);
    const summary = [];
    
    for (let sr = 0; sr < summaryRows; sr++) {
        const row = [];
        for (let sc = 0; sc < summaryCols; sc++) {
            // Find most common color in block
            const colorCounts = {};
            let maxCount = 0;
            let dominantColor = 0;
            
            for (let r = sr * scale; r < Math.min((sr + 1) * scale, grid.length); r++) {
                for (let c = sc * scale; c < Math.min((sc + 1) * scale, grid[0].length); c++) {
                    const color = grid[r][c];
                    colorCounts[color] = (colorCounts[color] || 0) + 1;
                    if (colorCounts[color] > maxCount) {
                        maxCount = colorCounts[color];
                        dominantColor = color;
                    }
                }
            }
            
            row.push(dominantColor);
        }
        summary.push(row);
    }
    
    return gridToAscii(summary);
}

/**
 * Highlight specific positions in grid display
 * @param {Array} grid - 2D grid array
 * @param {Array} positions - Array of {row, col} positions to highlight
 * @param {string} highlightChar - Character to use for highlighting
 * @returns {string} Grid with highlighted positions
 */
export function highlightPositions(grid, positions, highlightChar = '*') {
    const posSet = new Set(positions.map(p => `${p.row},${p.col}`));
    let display = '';
    
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[0].length; col++) {
            if (posSet.has(`${row},${col}`)) {
                display += highlightChar;
            } else {
                const val = grid[row][col];
                display += val < 10 ? val.toString() : String.fromCharCode(65 + val - 10);
            }
        }
        display += '\n';
    }
    
    return display;
}

/**
 * Compare two grids side by side
 * @param {Array} grid1 - First 2D grid array
 * @param {Array} grid2 - Second 2D grid array
 * @param {number} maxWidth - Maximum width to display (truncates if needed)
 * @returns {string} Side-by-side comparison
 */
export function compareSideBySide(grid1, grid2, maxWidth = 20) {
    const height = Math.max(grid1.length, grid2.length);
    const width1 = Math.min(grid1[0].length, maxWidth);
    const width2 = Math.min(grid2[0].length, maxWidth);
    
    let display = 'Grid 1'.padEnd(width1) + '  |  ' + 'Grid 2\n';
    display += '-'.repeat(width1) + '  |  ' + '-'.repeat(width2) + '\n';
    
    for (let row = 0; row < height; row++) {
        // Grid 1
        if (row < grid1.length) {
            for (let col = 0; col < width1; col++) {
                const val = grid1[row][col];
                display += val < 10 ? val.toString() : String.fromCharCode(65 + val - 10);
            }
            if (grid1[0].length > maxWidth) display += '...';
        } else {
            display += ' '.repeat(width1);
        }
        
        display += '  |  ';
        
        // Grid 2
        if (row < grid2.length) {
            for (let col = 0; col < width2; col++) {
                const val = grid2[row][col];
                display += val < 10 ? val.toString() : String.fromCharCode(65 + val - 10);
            }
            if (grid2[0].length > maxWidth) display += '...';
        }
        
        display += '\n';
    }
    
    return display;
}