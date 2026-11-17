import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

let server;
let baseUrl;
let browser;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const PAGES = [
  '/',
  '/exercise-1/index.html',
  '/exercise-2/index.html',
  '/exercise-3/index.html',
  '/exercise-4/dist/index.html',
  '/section-5-todo/dist/index.html',
  '/homework-1/index.html',
  '/homework-2-react-tictactoe/dist/index.html'
];

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
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });

  browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
});

after(async () => {
  if (browser) await browser.close();
  if (server) server.close();
});

describe('Browser Console and Network Error Audit', () => {
  PAGES.forEach((pagePath) => {
    it(`verifies 0 console errors and 0 network failures on ${pagePath}`, async () => {
      const page = await browser.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      const failedRequests = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      page.on('pageerror', (err) => {
        pageErrors.push(err.message);
      });

      page.on('response', (res) => {
        if (res.status() >= 400) {
          failedRequests.push(`${res.status()} ${res.url()}`);
        }
      });

      await page.goto(`${baseUrl}${pagePath}`, { waitUntil: 'networkidle' });

      assert.deepStrictEqual(consoleErrors, [], `Console errors on ${pagePath}`);
      assert.deepStrictEqual(pageErrors, [], `Page errors on ${pagePath}`);
      assert.deepStrictEqual(failedRequests, [], `Failed requests on ${pagePath}`);

      await page.close();
    });
  });
});

describe('Responsive Viewport Audit', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 }
  ];

  PAGES.forEach((pagePath) => {
    viewports.forEach((vp) => {
      it(`verifies no horizontal overflow on ${pagePath} at ${vp.name} (${vp.width}px)`, async () => {
        const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
        await page.goto(`${baseUrl}${pagePath}`, { waitUntil: 'domcontentloaded' });

        const isOverflowing = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        assert.strictEqual(isOverflowing, false, `Horizontal overflow detected on ${pagePath} at ${vp.width}px`);
        await page.close();
      });
    });
  });
});

describe('Accessibility and Semantic HTML Audit', () => {
  PAGES.forEach((pagePath) => {
    it(`verifies semantic structure and accessibility on ${pagePath}`, async () => {
      const page = await browser.newPage();
      await page.goto(`${baseUrl}${pagePath}`, { waitUntil: 'domcontentloaded' });

      const imgResults = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.map((img) => ({
          hasAlt: img.hasAttribute('alt'),
          src: img.getAttribute('src')
        }));
      });

      imgResults.forEach((img) => {
        assert.strictEqual(img.hasAlt, true, `Image missing alt attribute: ${img.src}`);
      });

      const buttonResults = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.map((btn) => ({
          text: btn.textContent.trim(),
          hasType: btn.hasAttribute('type')
        }));
      });

      buttonResults.forEach((btn) => {
        assert.strictEqual(btn.text.length > 0, true, 'Button missing label or text');
      });

      const hasHeading = await page.evaluate(() => {
        return document.querySelectorAll('h1, h2, h3').length > 0;
      });

      assert.strictEqual(hasHeading, true, `Page ${pagePath} missing semantic heading`);

      await page.close();
    });
  });
});
