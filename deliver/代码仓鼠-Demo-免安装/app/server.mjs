/* ============================================================
   代码仓鼠 · 本地服务器
   - 托管 app 静态文件  http://localhost:5173
   - /feed   POST/GET  给页面发“投喂”事件（给 Kiro Hook 用）
   - /events SSE       页面订阅投喂事件
   启动： node server.mjs
   ============================================================ */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 5173);
const clients = new Set();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  /* SSE：页面订阅投喂事件 */
  if (url.pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  /* 投喂：Kiro Hook 里 curl 一下就能喂仓鼠 */
  if (url.pathname === '/feed') {
    for (const c of clients) {
      try { c.write('data: feed\n\n'); } catch { /* ignore */ }
    }
    console.log('[feed] ' + new Date().toLocaleTimeString('zh-CN') + '  → ' + clients.size + ' 个页面');
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, hamster: '咔嚓', listeners: clients.size }));
    return;
  }

  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, listeners: clients.size }));
    return;
  }

  let rel = decodeURIComponent(url.pathname);
  if (rel === '/') rel = '/index.html';
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end('forbidden'); return; }

  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 · 仓鼠把这一页吃掉了');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(buf);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  🐹 代码仓鼠已启动');
  console.log('  → http://localhost:' + PORT);
  console.log('  → Kiro Hook 投喂接口: POST http://localhost:' + PORT + '/feed');
  console.log('');
  if (process.env.NO_OPEN !== '1' && process.platform === 'win32') {
    exec('start "" "http://localhost:' + PORT + '"');
  }
});
