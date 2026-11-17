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

describe('Exercise 1: Light/Dark Mode Toggle', () => {
  it('defaults to light mode when localStorage is empty', () => {
    const dom = setupEnvironment('exercise-1/index.html', 'exercise-1/app.js');
    const button = dom.window.document.querySelector('#themeToggle');
    assert.strictEqual(dom.window.document.body.classList.contains('dark-mode'), false);
    assert.strictEqual(button.textContent, '🌙 Dark Mode');
  });

  it('switches to dark mode on click and updates localStorage', () => {
    const dom = setupEnvironment('exercise-1/index.html', 'exercise-1/app.js');
    const button = dom.window.document.querySelector('#themeToggle');
    button.click();

    assert.strictEqual(dom.window.document.body.classList.contains('dark-mode'), true);
    assert.strictEqual(button.textContent, '☀️ Light Mode');
    assert.strictEqual(dom.window.localStorage.getItem('theme'), 'dark');

    button.click();
    assert.strictEqual(dom.window.document.body.classList.contains('dark-mode'), false);
    assert.strictEqual(button.textContent, '🌙 Dark Mode');
    assert.strictEqual(dom.window.localStorage.getItem('theme'), 'light');
  });

  it('restores dark mode on page load when saved in localStorage', () => {
    const dom = setupEnvironment('exercise-1/index.html', 'exercise-1/app.js', { theme: 'dark' });
    const button = dom.window.document.querySelector('#themeToggle');
    assert.strictEqual(dom.window.document.body.classList.contains('dark-mode'), true);
    assert.strictEqual(button.textContent, '☀️ Light Mode');
  });
});

describe('Exercise 2: Extended Todo List', () => {
  it('adds, toggles, and deletes items with live counter and storage', () => {
    const dom = setupEnvironment('exercise-2/index.html', 'exercise-2/app.js');
    const form = dom.window.document.querySelector('#todoForm');
    const input = dom.window.document.querySelector('#todoInput');
    const list = dom.window.document.querySelector('#todoList');
    const counter = dom.window.document.querySelector('#taskCounter');

    assert.strictEqual(counter.textContent, '0 tasks left');

    input.value = 'First task';
    form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

    assert.strictEqual(list.children.length, 1);
    assert.strictEqual(counter.textContent, '1 task left');

    input.value = 'Second task';
    form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));

    assert.strictEqual(list.children.length, 2);
    assert.strictEqual(counter.textContent, '2 tasks left');

    const firstCheckbox = list.children[0].querySelector('input[type="checkbox"]');
    firstCheckbox.checked = true;
    firstCheckbox.dispatchEvent(new dom.window.Event('change', { bubbles: true }));

    assert.strictEqual(counter.textContent, '1 task left');

    const deleteBtn = list.children[1].querySelector('.delete-btn');
    deleteBtn.click();

    assert.strictEqual(list.children.length, 1);
    assert.strictEqual(counter.textContent, '0 tasks left');
  });

  it('filters active, completed, and all tasks without mutating store', () => {
    const initialData = [
      { text: 'Task 1', completed: false },
      { text: 'Task 2', completed: true },
      { text: 'Task 3', completed: false }
    ];
    const dom = setupEnvironment('exercise-2/index.html', 'exercise-2/app.js', { 'todo-app-items': JSON.stringify(initialData) });

    const list = dom.window.document.querySelector('#todoList');
    const activeBtn = dom.window.document.querySelector('.filter-btn[data-filter="active"]');
    const completedBtn = dom.window.document.querySelector('.filter-btn[data-filter="completed"]');
    const allBtn = dom.window.document.querySelector('.filter-btn[data-filter="all"]');

    assert.strictEqual(list.children.length, 3);

    activeBtn.click();
    assert.strictEqual(list.children.length, 2);

    completedBtn.click();
    assert.strictEqual(list.children.length, 1);

    allBtn.click();
    assert.strictEqual(list.children.length, 3);
  });
});

describe('Exercise 3: Tic-Tac-Toe Mini Game', () => {
  it('renders 9 cells and alternates turns', () => {
    const dom = setupEnvironment('exercise-3/index.html', 'exercise-3/app.js');
    const board = dom.window.document.querySelector('#board');
    const status = dom.window.document.querySelector('#status');

    assert.strictEqual(board.children.length, 9);
    assert.strictEqual(status.textContent, "Player X's turn");

    board.children[0].click();
    assert.strictEqual(board.children[0].textContent, 'X');
    assert.strictEqual(status.textContent, "Player O's turn");

    board.children[0].click();
    assert.strictEqual(board.children[0].textContent, 'X');
    assert.strictEqual(status.textContent, "Player O's turn");

    board.children[4].click();
    assert.strictEqual(board.children[4].textContent, 'O');
    assert.strictEqual(status.textContent, "Player X's turn");
  });

  it('detects a winner, updates score, and freezes subsequent clicks', () => {
    const dom = setupEnvironment('exercise-3/index.html', 'exercise-3/app.js');
    const board = dom.window.document.querySelector('#board');
    const status = dom.window.document.querySelector('#status');
    const scoreX = dom.window.document.querySelector('#scoreX .value');

    board.children[0].click();
    board.children[3].click();
    board.children[1].click();
    board.children[4].click();
    board.children[2].click();

    assert.strictEqual(status.textContent, 'Player X wins!');
    assert.strictEqual(scoreX.textContent, '1');

    board.children[8].click();
    assert.strictEqual(board.children[8].textContent, '');
  });

  it('detects a draw and allows restarting a new round', () => {
    const dom = setupEnvironment('exercise-3/index.html', 'exercise-3/app.js');
    const board = dom.window.document.querySelector('#board');
    const status = dom.window.document.querySelector('#status');
    const scoreDraw = dom.window.document.querySelector('#scoreDraw .value');
    const restartBtn = dom.window.document.querySelector('#restartBtn');

    board.children[0].click();
    board.children[1].click();
    board.children[2].click();
    board.children[4].click();
    board.children[3].click();
    board.children[5].click();
    board.children[7].click();
    board.children[6].click();
    board.children[8].click();

    assert.strictEqual(status.textContent, 'Game ended in a draw!');
    assert.strictEqual(scoreDraw.textContent, '1');

    restartBtn.click();
    assert.strictEqual(status.textContent, "Player X's turn");
    assert.strictEqual(board.children[0].textContent, '');
    assert.strictEqual(scoreDraw.textContent, '1');
  });
});

describe('Homework 1: Product Gallery with Persistent Cart', () => {
  it('renders all 8 products and filters by category and search', () => {
    const dom = setupEnvironment('homework-1/index.html', 'homework-1/app.js');
    const grid = dom.window.document.querySelector('#productGrid');
    const searchInput = dom.window.document.querySelector('#searchInput');
    const fashionBtn = dom.window.document.querySelector('.filter-btn[data-category="Fashion"]');
    const allBtn = dom.window.document.querySelector('.filter-btn[data-category="All"]');

    assert.strictEqual(grid.children.length, 8);

    fashionBtn.click();
    assert.strictEqual(grid.children.length, 3);

    searchInput.value = 'shoes';
    searchInput.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    assert.strictEqual(grid.children.length, 1);
    assert.strictEqual(grid.children[0].querySelector('.product-name').textContent, 'Running Shoes');

    allBtn.click();
    searchInput.value = '';
    searchInput.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    assert.strictEqual(grid.children.length, 8);
  });

  it('uses event delegation to add products and manages persistent cart', () => {
    const dom = setupEnvironment('homework-1/index.html', 'homework-1/app.js');
    const grid = dom.window.document.querySelector('#productGrid');
    const badge = dom.window.document.querySelector('#cartBadge');
    const total = dom.window.document.querySelector('#cartTotal');
    const clearBtn = dom.window.document.querySelector('#clearCartBtn');

    assert.strictEqual(badge.textContent, '0');

    const firstAddBtn = grid.children[0].querySelector('.add-to-cart-btn');
    firstAddBtn.click();

    assert.strictEqual(badge.textContent, '1');
    assert.strictEqual(total.textContent.includes('1.290.000'), true);

    firstAddBtn.click();
    assert.strictEqual(badge.textContent, '2');
    assert.strictEqual(total.textContent.includes('2.580.000'), true);

    const savedCart = JSON.parse(dom.window.localStorage.getItem('mini-shop-cart'));
    assert.strictEqual(savedCart.length, 1);
    assert.strictEqual(savedCart[0].quantity, 2);

    clearBtn.click();
    assert.strictEqual(badge.textContent, '0');
    assert.strictEqual(dom.window.localStorage.getItem('mini-shop-cart'), null);
  });
});
