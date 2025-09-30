const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'server.logs');

function viewLogs() {
  try {
    if (!fs.existsSync(logFile)) {
      console.log('📋 No log file found. Start the server to create logs.');
      return;
    }

    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    console.log('📋 SERVER LOGS (Last 50 entries):');
    console.log('=' .repeat(60));
    
    if (lines.length === 0) {
      console.log('No logs found.');
      return;
    }

    // Show last 50 lines
    const recentLines = lines.slice(-50);
    recentLines.forEach(line => {
      console.log(line);
    });
    
    console.log('=' .repeat(60));
    console.log(`📊 Total log entries: ${lines.length}`);
    console.log('💡 Tip: Run this script again to see new logs');
    
  } catch (error) {
    console.error('Error reading logs:', error.message);
  }
}

viewLogs();
