import { execSync } from 'child_process';
import net from 'net';

/**
 * Finds the Process ID (PID) listening on the specified port.
 * Supports Windows and Unix platforms.
 */
export function getProcessOnPort(port) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano -p tcp | findstr :${port}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore']
      });
      const lines = output.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        // Format: TCP 0.0.0.0:5000 0.0.0.0:0 LISTENING 16176
        if (parts.length >= 5 && parts[3] === 'LISTENING') {
          const localAddr = parts[1];
          if (localAddr.endsWith(`:${port}`)) {
            const pid = parseInt(parts[4], 10);
            if (!isNaN(pid) && pid > 0) return pid;
          }
        }
      }
    } else {
      const output = execSync(`lsof -t -i :${port}`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore']
      });
      const pid = parseInt(output.trim().split('\n')[0], 10);
      if (!isNaN(pid) && pid > 0) return pid;
    }
  } catch (err) {
    // Port not in use or command returned non-zero
  }
  return null;
}

/**
 * Verifies if an existing process on the specified port is an instance of this project.
 */
export async function isProjectInstanceRunning(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`, {
      signal: AbortSignal.timeout(1500)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && (data.app === 'AI Placement Coach API' || data.message?.includes('AI Placement Coach API'))) {
        return true;
      }
    }
  } catch (err) {
    // Not running or not responsive
  }
  return false;
}

/**
 * Checks if a port is available for binding.
 */
export function isPortFree(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        tester.once('close', () => resolve(true)).close();
      })
      .listen(port, '0.0.0.0');
  });
}

/**
 * Ensures that port 5000 is available for this project without changing the port.
 * If another instance of this project is running on port 5000, it terminates the stale instance.
 * If an external process occupies port 5000, it logs a clear message and halts gracefully.
 */
export async function ensurePortAvailable(port) {
  const existingPid = getProcessOnPort(port);
  if (!existingPid || existingPid === process.pid) {
    return true;
  }

  const isOurApp = await isProjectInstanceRunning(port);

  if (isOurApp && existingPid) {
    console.log(`[Server] Port ${port} is currently held by an existing instance of AI Placement Coach API (PID ${existingPid}).`);
    console.log(`[Server] Stopping stale instance (PID ${existingPid}) to guarantee a single development server on port ${port}...`);
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /F /PID ${existingPid}`, { stdio: 'ignore' });
      } else {
        process.kill(existingPid, 'SIGKILL');
      }
    } catch (e) {
      console.warn(`[Server] Could not stop PID ${existingPid}:`, e.message);
    }

    // Wait for the port to be released (up to 3 seconds)
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 200));
      const pidStillThere = getProcessOnPort(port);
      if (!pidStillThere) {
        console.log(`[Server] Port ${port} released successfully.`);
        return true;
      }
    }
  } else if (existingPid) {
    console.error(`[Server] ERROR: Port ${port} is occupied by an external process (PID ${existingPid}).`);
    console.error(`[Server] Port ${port} is required for AI Placement Coach API. Fallback ports are disabled.`);
    console.error(`[Server] Please close process ${existingPid} to start the server.`);
    process.exit(1);
  } else {
    console.error(`[Server] ERROR: Port ${port} is already in use. Please free port ${port}.`);
    process.exit(1);
  }

  return true;
}
