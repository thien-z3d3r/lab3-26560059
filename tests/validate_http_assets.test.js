import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

let server;
let baseUrl;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

before(async () => {
  server = http.createServer((req, res) => {
    const safePath = path.normalize(decodeURI(req.url)).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(process.cwd(), safePath === '/' ? 'index.html' : safePath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(() => {
  if (server) server.close();
});

describe('HTTP Asset Delivery and Integrity', () => {
  const routes = [
    '/',
    '/index.html',
    '/exercise-1/index.html',
    '/exercise-1/style.css',
    '/exercise-1/app.js',
    '/exercise-2/index.html',
    '/exercise-2/style.css',
    '/exercise-2/app.js',
    '/exercise-3/index.html',
    '/exercise-3/style.css',
    '/exercise-3/app.js',
    '/exercise-4/dist/index.html',
    '/section-5-todo/dist/index.html',
    '/homework-1/index.html',
    '/homework-1/style.css',
    '/homework-1/app.js',
    '/homework-1/images/headphones.png',
    '/homework-1/images/smartwatch.png',
    '/homework-1/images/speaker.png',
    '/homework-1/images/jacket.png',
    '/homework-1/images/shoes.png',
    '/homework-1/images/cap.png',
    '/homework-1/images/book.png',
    '/homework-1/images/sketchbook.png',
    '/homework-2-react-tictactoe/dist/index.html'
  ];

  routes.forEach((route) => {
    it(`serves ${route} with HTTP 200`, async () => {
      const res = await fetch(`${baseUrl}${route}`);
      assert.strictEqual(res.status, 200);
      const buffer = await res.arrayBuffer();
      assert.strictEqual(buffer.byteLength > 0, true);
    });
  });
});
