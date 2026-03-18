const { execSync } = require('child_process');

const port = process.argv[2];
if (!port) { console.error('Usage: node kill-port.js <port>'); process.exit(1); }

try {
  const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
  const lines = result.split('\n').filter(l => l.includes('LISTENING'));
  for (const line of lines) {
    const pid = line.trim().split(/\s+/).pop();
    if (pid && pid !== '0') {
      try { execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' }); console.log(`Killed PID ${pid} on port ${port}`); }
      catch { /* already dead */ }
    }
  }
} catch { /* nothing listening */ }
