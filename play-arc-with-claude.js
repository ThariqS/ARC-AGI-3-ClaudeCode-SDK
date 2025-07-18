#!/usr/bin/env node

import { query } from "@anthropic-ai/claude-code";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function playArcWithClaude(gameName, maxTurns = 100) {
  console.log(`🎮 Starting ARC AGI 3 solver for: ${gameName}`);

  const messages = [];
  const initialPrompt = `Play the ARC AGI 3 game "${gameName}". Read CLAUDE.md to understand how to play. Keep playing until you win or reach ${maxTurns} turns.`;

  try {
    for await (const message of query({
      prompt: initialPrompt,
      abortController: new AbortController(),
      options: {
        maxTurns: maxTurns,
        cwd: __dirname,
      },
    })) {
      messages.push(message);
      console.log(`\n[Turn ${messages.length}]`);
      
      // Log different message types appropriately
      if (message.type === 'text') {
        console.log('📝 Text:', message.text);
      } else if (message.type === 'tool_use') {
        console.log('🔧 Tool Use:', message.name);
        if (message.input) {
          console.log('   Input:', JSON.stringify(message.input, null, 2));
        }
      } else if (message.type === 'tool_result') {
        console.log('✅ Tool Result:', message.tool_use_id);
        if (message.content) {
          // Handle both string and array content
          const content = typeof message.content === 'string' 
            ? message.content 
            : message.content.map(c => c.text || c).join('\n');
          console.log('   Output:', content.substring(0, 500) + (content.length > 500 ? '...' : ''));
        }
      } else if (message.message?.content) {
        // Handle message wrapper format
        console.log('💬 Message:');
        message.message.content.forEach((content, i) => {
          if (content.type === 'text') {
            console.log('   Text:', content.text);
          } else if (content.type === 'tool_use') {
            console.log('   Tool Use:', content.name, content.input ? JSON.stringify(content.input).substring(0, 100) + '...' : '');
          }
        });
      } else {
        // Fallback for unknown message types
        console.log('❓ Unknown message type:', message.type || 'no type');
        console.log('   Raw:', JSON.stringify(message, null, 2).substring(0, 500) + '...');
      }
    }
  } catch (error) {
    console.error("\n❌ Error:", error);
  }

  console.log(`\n✅ Completed after ${messages.length} turns`);
}

// Main execution
async function main() {
  const gameName = process.argv[2] || "ls20-016295f7601e";
  const maxTurns = parseInt(process.argv[3]) || 30;

  await playArcWithClaude(gameName, maxTurns);
}

main().catch(console.error);
