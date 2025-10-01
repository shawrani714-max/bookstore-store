const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logFile = path.join(__dirname, '../server.logs');
    this.ensureLogFile();
  }

  ensureLogFile() {
    if (!fs.existsSync(this.logFile)) {
      fs.writeFileSync(this.logFile, '');
    }
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    const logLine = `[${timestamp}] ${level.toUpperCase()}: ${message}${data ? ' | Data: ' + JSON.stringify(data) : ''}\n`;
    
    // Write to file
    fs.appendFileSync(this.logFile, logLine);
    
    // Also log to console
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    if (data) {
      console.log('Data:', data);
    }
  }

  info(message, data = null) {
    this.log('info', message, data);
  }

  error(message, data = null) {
    this.log('error', message, data);
  }

  warn(message, data = null) {
    this.log('warn', message, data);
  }

  debug(message, data = null) {
    this.log('debug', message, data);
  }

  // Clear the log file
  clear() {
    fs.writeFileSync(this.logFile, '');
    this.info('Log file cleared');
  }

  // Get recent logs
  getRecentLogs(lines = 50) {
    try {
      const content = fs.readFileSync(this.logFile, 'utf8');
      const logLines = content.split('\n').filter(line => line.trim());
      return logLines.slice(-lines).join('\n');
    } catch (error) {
      return 'Error reading log file: ' + error.message;
    }
  }
}

module.exports = new Logger();
