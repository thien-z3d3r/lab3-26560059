import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

function setupEnvironment(htmlPath, jsPath, initialStorage = {}) {
  const html = fs.readFileSync(path.resolve(htmlPath), 'utf8');
  const js = fs.readFileSync(path.resolve(jsPath), 'utf8');
  const dom = new JSDOM(html, { url: 'http://localhost', runScripts: 'outside-only' });

  for (const [key, value] of Object.entries(initialStorage)) {
    dom.window.localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  }

  dom.window.eval(js);
  return dom;
}

describe('Edge Cases: Theme & Todo List', () => {
  it('ignores empty and whitespace-only submissions in todo list', () => {
    const dom = setupEnvironment('exercise-2/index.html', 'exercise-2/app.js');
    const form = dom.window.document.querySelector('#todoForm');
    const input = dom.window.document.querySelector('#todoInput');
    const list = dom.window.document.querySelector('#todoList');
    const counter = dom.window.document.querySelector('#taskCounter');

    input.value = '   ';
    form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

    assert.strictEqual(list.children.length, 0);
    assert.strictEqual(counter.textContent, '0 tasks left');
  });

  it('accurately tracks active count across multiple toggle cycles', () => {
    const dom = setupEnvironment('exercise-2/index.html', 'exercise-2/app.js');
    const form = dom.window.document.querySelector('#todoForm');
    const input = dom.window.document.querySelector('#todoInput');
    const list = dom.window.document.querySelector('#todoList');
    const counter = dom.window.document.querySelector('#taskCounter');

    input.value = 'Task A';
    form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

    input.value = 'Task B';
    form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

    assert.strictEqual(counter.textContent, '2 tasks left');

    const checkboxA = list.children[0].querySelector('input[type="checkbox"]');
    checkboxA.checked = true;
    checkboxA.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    assert.strictEqual(counter.textContent, '1 task left');

    checkboxA.checked = false;
    checkboxA.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    assert.strictEqual(counter.textContent, '2 tasks left');
  });

  it('survives rapid theme toggles with consistent state', () => {
    const dom = setupEnvironment('exercise-1/index.html', 'exercise-1/app.js');
    const button = dom.window.document.querySelector('#themeToggle');

    for (let i = 0; i < 5; i++) {
      button.click();
    }

    assert.strictEqual(dom.window.document.body.classList.contains('dark-mode'), true);
    assert.strictEqual(button.textContent, '☀️ Light Mode');
    assert.strictEqual(dom.window.localStorage.getItem('theme'), 'dark');
  });
});

describe('Edge Cases: Tic-Tac-Toe Game', () => {
  it('detects diagonal win [0, 4, 8] and highlights winning cells', () => {
    const dom = setupEnvironment('exercise-3/index.html', 'exercise-3/app.js');
    const board = dom.window.document.querySelector('#board');
    const status = dom.window.document.querySelector('#status');
    const scoreX = dom.window.document.querySelector('#scoreX .value');

    board.children[0].click();
    board.children[1].click();
    board.children[4].click();
    board.children[2].click();
    board.children[8].click();

    assert.strictEqual(status.textContent, 'Player X wins!');
    assert.strictEqual(scoreX.textContent, '1');
    assert.strictEqual(board.children[0].classList.contains('winner'), true);
    assert.strictEqual(board.children[4].classList.contains('winner'), true);
    assert.strictEqual(board.children[8].classList.contains('winner'), true);
  });

  it('detects diagonal win [2, 4, 6] correctly', () => {
    const dom = setupEnvironment('exercise-3/index.html', 'exercise-3/app.js');
    const board = dom.window.document.querySelector('#board');
    const status = dom.window.document.querySelector('#status');

    board.children[2].click();
    board.children[0].click();
    board.children[4].click();
    board.children[1].click();
    board.children[6].click();

    assert.strictEqual(status.textContent, 'Player X wins!');
    assert.strictEqual(board.children[2].classList.contains('winner'), true);
    assert.strictEqual(board.children[4].classList.contains('winner'), true);
    assert.strictEqual(board.children[6].classList.contains('winner'), true);
  });

  it('detects player O victory and increments O score', () => {
    const dom = setupEnvironment('exercise-3/index.html', 'exercise-3/app.js');
    const board = dom.window.document.querySelector('#board');
    const status = dom.window.document.querySelector('#status');
    const scoreO = dom.window.document.querySelector('#scoreO .value');

    board.children[0].click();
    board.children[1].click();
    board.children[3].click();
    board.children[4].click();
    board.children[8].click();
    board.children[7].click();

    assert.strictEqual(status.textContent, 'Player O wins!');
    assert.strictEqual(scoreO.textContent, '1');
    assert.strictEqual(board.children[1].classList.contains('winner'), true);
    assert.strictEqual(board.children[4].classList.contains('winner'), true);
    assert.strictEqual(board.children[7].classList.contains('winner'), true);
  });
});

describe('Edge Cases: Product Gallery & Cart', () => {
  it('supports case-insensitive searches', () => {
    const dom = setupEnvironment('homework-1/index.html', 'homework-1/app.js');
    const grid = dom.window.document.querySelector('#productGrid');
    const searchInput = dom.window.document.querySelector('#searchInput');

    searchInput.value = 'BLUETOOTH';
    searchInput.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

    assert.strictEqual(grid.children.length, 1);
    assert.strictEqual(grid.children[0].querySelector('.product-name').textContent, 'Bluetooth Speaker');
  });

  it('shows no-products message when search yields 0 matches', () => {
    const dom = setupEnvironment('homework-1/index.html', 'homework-1/app.js');
    const grid = dom.window.document.querySelector('#productGrid');
    const searchInput = dom.window.document.querySelector('#searchInput');

    searchInput.value = 'NonExistentItem123';
    searchInput.dispatchEvent(new dom.window.Event('input', { bubbles: true }));

    assert.strictEqual(grid.children.length, 1);
    assert.strictEqual(grid.children[0].classList.contains('no-products'), true);
  });

  it('calculates total correctly across multiple items from different categories', () => {
    const dom = setupEnvironment('homework-1/index.html', 'homework-1/app.js');
    const grid = dom.window.document.querySelector('#productGrid');
    const badge = dom.window.document.querySelector('#cartBadge');
    const total = dom.window.document.querySelector('#cartTotal');

    grid.children[0].querySelector('.add-to-cart-btn').click();
    grid.children[3].querySelector('.add-to-cart-btn').click();
    grid.children[6].querySelector('.add-to-cart-btn').click();

    assert.strictEqual(badge.textContent, '3');
    assert.strictEqual(total.textContent.includes('2.360.000'), true);
  });
});
