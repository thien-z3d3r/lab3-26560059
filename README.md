# Lab 3: JavaScript Interactivity & Introduction to ReactJS

This repository contains the completed solutions for all exercises and homework assignments in **Lab 3**.

## Table of Contents

| Task | Location | Description | Tech Stack |
|------|----------|-------------|------------|
| **Exercise 1** | `exercise-1/` | Light/Dark Mode toggle with `localStorage` persistence and dynamic icon/label | Vanilla JS |
| **Exercise 2** | `exercise-2/` | Extended Todo List with add, toggle, delete, live active counter, and All/Active/Completed filters | Vanilla JS |
| **Exercise 3** | `exercise-3/` | Interactive Tic-Tac-Toe game with 3x3 grid, turn alternation, win/draw detection, scoreboard, and New Round restart | Vanilla JS |
| **Exercise 4** | `exercise-4/` | Vite + React scaffold with custom Profile Card component | React + Vite |
| **Section 5** | `section-5-todo/` | React Todo decomposition: `App` -> `TodoList` -> `TodoItem` passing data via props | React + Vite |
| **Homework 1** | `homework-1/` | Product gallery with 8 items, category filters, event delegation, cart badge, `localStorage`, clear cart, search, and VND currency formatting | Vanilla JS |
| **Homework 2** | `homework-2-react-tictactoe/` | Tic-Tac-Toe visual structure rebuilt with React components (`Board`, `Cell`, `GameStatus`), passing props | React + Vite |

---

## Running the Projects

### Navigation Hub
Open `index.html` in your browser to access the central dashboard linking directly to all projects.

### Vanilla JS Projects (Exercise 1, 2, 3, Homework 1)
Open their respective `index.html` directly in a browser, or run a local static server:
```bash
npx serve .
```

### React + Vite Projects (Exercise 4, Section 5, Homework 2)
To run in development mode:
```bash
# Exercise 4
cd exercise-4
npm run dev

# Section 5
cd section-5-todo
npm run dev

# Homework 2
cd homework-2-react-tictactoe
npm run dev
```

To build production bundles:
```bash
npm run build
```
Production builds have already been generated inside each project's `dist/` directory with relative asset paths.
