const { execSync } = require('child_process');

function getListeningPidOnPort(port) {
  const p = Number(port);
  if (!Number.isFinite(p)) return null;
  if (process.platform !== 'win32') return null;
  try {
    const out = execSync(`netstat -ano | findstr :${p}`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString();
    const lines = out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    // Prefer LISTENING line
    const listening = lines.find((l) => /\sLISTENING\s/i.test(l));
    const line = listening || lines[0];
    if (!line) return null;
    const parts = line.split(/\s+/);
    const pidStr = parts[parts.length - 1];
    const pid = Number(pidStr);
    return Number.isFinite(pid) ? pid : null;
  } catch {
    return null;
  }
}

function killPid(pid) {
  const p = Number(pid);
  if (!Number.isFinite(p)) return false;
  if (process.platform !== 'win32') return false;
  try {
    execSync(`powershell -NoProfile -Command "Stop-Process -Id ${p} -Force"`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

module.exports = { getListeningPidOnPort, killPid };

