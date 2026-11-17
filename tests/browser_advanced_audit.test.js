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

describe('Interactive Flow Console and Network Audit', () => {
  it('detects 0 console errors during Exercise 2 rapid operations', async () => {
    const page = await browser.newPage();
    const errors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(`${baseUrl}/exercise-2/index.html`);

    for (let i = 1; i <= 5; i++) {
      await page.fill('#todoInput', `Continuous Task ${i}`);
      await page.click('#todoForm button[type="submit"]');
    }

    const checkboxes = page.locator('#todoList li input[type="checkbox"]');
    await checkboxes.nth(0).click();
    await checkboxes.nth(2).click();

    await page.click('.filter-btn[data-filter="active"]');
    await page.click('.filter-btn[data-filter="completed"]');
    await page.click('.filter-btn[data-filter="all"]');

    const deleteButtons = page.locator('#todoList li .delete-btn');
    await deleteButtons.nth(1).click();

    assert.deepStrictEqual(errors, []);
    await page.close();
  });

  it('detects 0 console errors during Homework 1 full shopping flow', async () => {
    const page = await browser.newPage();
    const errors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(`${baseUrl}/homework-1/index.html`);

    const categories = ['Electronics', 'Fashion', 'Books', 'All'];
    for (const cat of categories) {
      await page.click(`.filter-btn[data-category="${cat}"]`);
    }

    await page.fill('#searchInput', 'Headphones');
    await page.fill('#searchInput', 'Watch');
    await page.fill('#searchInput', '');

    const addButtons = page.locator('.product-card .add-to-cart-btn');
    const count = await addButtons.count();
    for (let i = 0; i < count; i++) {
      await addButtons.nth(i).click();
    }

    await page.click('#clearCartBtn');

    assert.deepStrictEqual(errors, []);
    await page.close();
  });
});

describe('Extreme Viewport Audit (320px to 2560px)', () => {
  const widths = [320, 360, 414, 1440, 1920, 2560];

  PAGES.forEach((pagePath) => {
    widths.forEach((w) => {
      it(`verifies no horizontal overflow on ${pagePath} at ${w}px`, async () => {
        const page = await browser.newPage({ viewport: { width: w, height: 900 } });
        await page.goto(`${baseUrl}${pagePath}`, { waitUntil: 'domcontentloaded' });

        const isOverflowing = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        assert.strictEqual(isOverflowing, false, `Overflow at ${w}px on ${pagePath}`);
        await page.close();
      });
    });
  });
});

describe('Keyboard Navigation and ARIA Compliance', () => {
  it('submits Exercise 2 form using Enter key', async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/exercise-2/index.html`);

    await page.focus('#todoInput');
    await page.keyboard.type('Keyboard submitted task');
    await page.keyboard.press('Enter');

    const items = page.locator('#todoList li');
    assert.strictEqual(await items.count(), 1);
    assert.strictEqual(await page.locator('#todoInput').inputValue(), '');

    await page.close();
  });

  it('verifies ARIA attributes on interactive inputs', async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/exercise-2/index.html`);

    const inputAria = await page.getAttribute('#todoInput', 'aria-label');
    assert.strictEqual(inputAria, 'New task');

    await page.goto(`${baseUrl}/homework-1/index.html`);
    const searchAria = await page.getAttribute('#searchInput', 'aria-label');
    assert.strictEqual(searchAria, 'Search products');

    await page.close();
  });
});
