import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

describe('Exercise 4: Vite React Profile Card', () => {
  it('contains the expected JSX elements and props in App.jsx', () => {
    const appCode = fs.readFileSync(path.resolve('exercise-4/src/App.jsx'), 'utf8');
    assert.strictEqual(appCode.includes('className="profile-card"'), true);
    assert.strictEqual(appCode.includes('src="/avatar.png"'), true);
    assert.strictEqual(appCode.includes('Nguyen Van A'), true);
    assert.strictEqual(appCode.includes('Frontend Development Student'), true);
    assert.strictEqual(appCode.includes('HTML'), true);
    assert.strictEqual(appCode.includes('CSS'), true);
    assert.strictEqual(appCode.includes('JavaScript'), true);
    assert.strictEqual(appCode.includes('React'), true);
  });

  it('verifies avatar exists in public directory', () => {
    const avatarPath = path.resolve('exercise-4/public/avatar.png');
    assert.strictEqual(fs.existsSync(avatarPath), true);
  });

  it('builds successfully with Vite', () => {
    const output = execSync('npm run build', { cwd: path.resolve('exercise-4'), encoding: 'utf8' });
    assert.strictEqual(output.includes('built in'), true);
    assert.strictEqual(fs.existsSync(path.resolve('exercise-4/dist/index.html')), true);
  });
});

describe('Section 5: React Todo Components', () => {
  it('implements App, TodoList, and TodoItem components with prop passing', () => {
    const itemCode = fs.readFileSync(path.resolve('section-5-todo/src/TodoItem.jsx'), 'utf8');
    const listCode = fs.readFileSync(path.resolve('section-5-todo/src/TodoList.jsx'), 'utf8');
    const appCode = fs.readFileSync(path.resolve('section-5-todo/src/App.jsx'), 'utf8');

    assert.strictEqual(itemCode.includes('function TodoItem({ todo })'), true);
    assert.strictEqual(itemCode.includes('todo.completed'), true);
    assert.strictEqual(itemCode.includes('todo.text'), true);

    assert.strictEqual(listCode.includes('function TodoList({ todos })'), true);
    assert.strictEqual(listCode.includes('<TodoItem key={index} todo={todo} />') || listCode.includes('todo={todo}'), true);

    assert.strictEqual(appCode.includes('import TodoList from \'./TodoList\';'), true);
    assert.strictEqual(appCode.includes('<TodoList todos={sampleTodos} />'), true);
    assert.strictEqual(appCode.includes('1 of 3 completed') || appCode.includes('completed'), true);
  });

  it('builds successfully with Vite', () => {
    const output = execSync('npm run build', { cwd: path.resolve('section-5-todo'), encoding: 'utf8' });
    assert.strictEqual(output.includes('built in'), true);
    assert.strictEqual(fs.existsSync(path.resolve('section-5-todo/dist/index.html')), true);
  });
});

describe('Homework 2: React Tic-Tac-Toe Components', () => {
  it('decomposes UI into Board, Cell, and GameStatus components driven by props', () => {
    const cellCode = fs.readFileSync(path.resolve('homework-2-react-tictactoe/src/Cell.jsx'), 'utf8');
    const boardCode = fs.readFileSync(path.resolve('homework-2-react-tictactoe/src/Board.jsx'), 'utf8');
    const statusCode = fs.readFileSync(path.resolve('homework-2-react-tictactoe/src/GameStatus.jsx'), 'utf8');
    const appCode = fs.readFileSync(path.resolve('homework-2-react-tictactoe/src/App.jsx'), 'utf8');

    assert.strictEqual(cellCode.includes('function Cell({ value, isWinning })'), true);
    assert.strictEqual(boardCode.includes('function Board({ board'), true);
    assert.strictEqual(boardCode.includes('<Cell'), true);
    assert.strictEqual(statusCode.includes('function GameStatus({ status, scores })'), true);
    assert.strictEqual(statusCode.includes('Player X'), true);
    assert.strictEqual(statusCode.includes('Draws'), true);
    assert.strictEqual(statusCode.includes('Player O'), true);

    assert.strictEqual(appCode.includes('import Board from \'./Board\';'), true);
    assert.strictEqual(appCode.includes('import GameStatus from \'./GameStatus\';'), true);
    assert.strictEqual(appCode.includes('<GameStatus status={sampleStatus} scores={sampleScores} />'), true);
    assert.strictEqual(appCode.includes('<Board board={sampleBoard} />'), true);
  });

  it('builds successfully with Vite', () => {
    const output = execSync('npm run build', { cwd: path.resolve('homework-2-react-tictactoe'), encoding: 'utf8' });
    assert.strictEqual(output.includes('built in'), true);
    assert.strictEqual(fs.existsSync(path.resolve('homework-2-react-tictactoe/dist/index.html')), true);
  });
});
