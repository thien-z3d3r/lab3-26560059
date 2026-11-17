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

describe('Real Chromium Browser E2E Tests', () => {
  it('validates Exercise 1 theme toggle with real browser reload', async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/exercise-1/index.html`);

    const button = page.locator('#themeToggle');
    assert.strictEqual(await button.textContent(), '🌙 Dark Mode');

    await button.click();
    assert.strictEqual(await button.textContent(), '☀️ Light Mode');
    assert.strictEqual(await page.evaluate(() => document.body.classList.contains('dark-mode')), true);

    await page.reload();
    assert.strictEqual(await button.textContent(), '☀️ Light Mode');
    assert.strictEqual(await page.evaluate(() => document.body.classList.contains('dark-mode')), true);

    await button.click();
    assert.strictEqual(await button.textContent(), '🌙 Dark Mode');
    await page.close();
  });

  it('validates Exercise 2 todo creation, completion, and reload in Chromium', async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/exercise-2/index.html`);

    await page.fill('#todoInput', 'Buy groceries');
    await page.click('#todoForm button[type="submit"]');

    const items = page.locator('#todoList li');
    assert.strictEqual(await items.count(), 1);
    assert.strictEqual(await page.locator('#taskCounter').textContent(), '1 task left');

    await page.click('#todoList li input[type="checkbox"]');
    assert.strictEqual(await page.locator('#taskCounter').textContent(), '0 tasks left');

    await page.reload();
    assert.strictEqual(await page.locator('#todoList li').count(), 1);
    assert.strictEqual(await page.locator('#taskCounter').textContent(), '0 tasks left');

    await page.click('.filter-btn[data-filter="active"]');
    assert.strictEqual(await page.locator('#todoList li:visible').count(), 0);

    await page.click('.filter-btn[data-filter="completed"]');
    assert.strictEqual(await page.locator('#todoList li:visible').count(), 1);

    await page.close();
  });

  it('validates Exercise 3 Tic-Tac-Toe gameplay, win detection, and reset', async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/exercise-3/index.html`);

    const cells = page.locator('#board .cell');
    assert.strictEqual(await cells.count(), 9);

    await cells.nth(0).click();
    await cells.nth(3).click();
    await cells.nth(1).click();
    await cells.nth(4).click();
    await cells.nth(2).click();

    assert.strictEqual(await page.locator('#status').textContent(), 'Player X wins!');
    assert.strictEqual(await page.locator('#scoreX .value').textContent(), '1');

    await page.click('#restartBtn');
    assert.strictEqual(await page.locator('#status').textContent(), "Player X's turn");
    assert.strictEqual(await cells.nth(0).textContent(), '');
    assert.strictEqual(await page.locator('#scoreX .value').textContent(), '1');

    await page.close();
  });

  it('validates Exercise 4 Profile Card React app renders in Chromium', async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/exercise-4/dist/index.html`);

    assert.strictEqual(await page.locator('.profile-card h2').textContent(), 'Nguyen Van A');
    assert.strictEqual(await page.locator('.profile-card .title').textContent(), 'Frontend Development Student');
    assert.strictEqual(await page.locator('.skills span').count(), 4);

    await page.close();
  });

  it('validates Section 5 Todo React app renders hierarchy in Chromium', async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/section-5-todo/dist/index.html`);

    assert.strictEqual(await page.locator('.summary').textContent(), '1 of 3 completed');
    assert.strictEqual(await page.locator('.todo-list li').count(), 3);

    await page.close();
  });

  it('validates Homework 1 Product Gallery and persistent cart in Chromium', async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/homework-1/index.html`);

    assert.strictEqual(await page.locator('.product-card').count(), 8);

    await page.click('.filter-btn[data-category="Fashion"]');
    assert.strictEqual(await page.locator('.product-card').count(), 3);

    await page.fill('#searchInput', 'Shoes');
    assert.strictEqual(await page.locator('.product-card').count(), 1);

    await page.click('.filter-btn[data-category="All"]');
    await page.fill('#searchInput', '');
    assert.strictEqual(await page.locator('.product-card').count(), 8);

    await page.locator('.product-card').first().locator('.add-to-cart-btn').click();
    assert.strictEqual(await page.locator('#cartBadge').textContent(), '1');

    await page.reload();
    assert.strictEqual(await page.locator('#cartBadge').textContent(), '1');

    await page.click('#clearCartBtn');
    assert.strictEqual(await page.locator('#cartBadge').textContent(), '0');

    await page.close();
  });

  it('validates Homework 2 React Tic-Tac-Toe components render in Chromium', async () => {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/homework-2-react-tictactoe/dist/index.html`);

    assert.strictEqual(await page.locator('.scoreboard .score').count(), 3);
    assert.strictEqual(await page.locator('.board .cell').count(), 9);
    assert.strictEqual(await page.locator('.restart-btn').textContent(), '↻ New Round');

    await page.close();
  });
});
