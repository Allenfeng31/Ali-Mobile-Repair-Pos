import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import net from 'node:net';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const services = [
  {
    name: 'pos-api',
    port: 3001,
    cwd: path.join(rootDir, 'server'),
    command: 'npm',
    args: ['run', 'dev'],
  },
  {
    name: 'pos-ui',
    port: 3002,
    cwd: rootDir,
    command: 'npm',
    args: ['run', 'dev', '--', '--strictPort'],
  },
  {
    name: 'storefront',
    port: 3000,
    cwd: path.join(rootDir, 'storefront'),
    command: 'npm',
    args: ['run', 'dev', '--', '--port', '3000'],
  },
];

const children = [];

const isPortAvailable = (port) =>
  new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    socket.setTimeout(350);
    socket.once('connect', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(true));
  });

const prefixLine = (name, chunk) => {
  const text = chunk.toString();
  for (const line of text.split(/\r?\n/)) {
    if (line.trim()) console.log(`[${name}] ${line}`);
  }
};

const stopAll = () => {
  for (const child of children) {
    if (!child.killed) child.kill('SIGINT');
  }
};

process.on('SIGINT', () => {
  stopAll();
  setTimeout(() => process.exit(0), 250);
});

process.on('SIGTERM', () => {
  stopAll();
  setTimeout(() => process.exit(0), 250);
});

console.log('[dev:all] Starting POS UI, POS API, and storefront.');
console.log('[dev:all] POS UI: http://localhost:3002');
console.log('[dev:all] POS API: http://localhost:3001');
console.log('[dev:all] Storefront: http://localhost:3000');

for (const service of services) {
  if (!(await isPortAvailable(service.port))) {
    console.log(`[dev:all] ${service.name} already appears to be running on port ${service.port}; skipping.`);
    continue;
  }

  const child = spawn(service.command, service.args, {
    cwd: service.cwd,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  children.push(child);

  child.stdout.on('data', (chunk) => prefixLine(service.name, chunk));
  child.stderr.on('data', (chunk) => prefixLine(service.name, chunk));
  child.on('exit', (code, signal) => {
    if (signal === 'SIGINT' || signal === 'SIGTERM') return;
    console.log(`[${service.name}] exited with code ${code ?? 'unknown'}.`);
  });
}

if (children.length === 0) {
  console.log('[dev:all] All configured services already appear to be running.');
}
