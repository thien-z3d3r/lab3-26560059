const STORAGE_KEY = 'todo-app-items';

const form = document.querySelector('#todoForm');
const input = document.querySelector('#todoInput');
const list = document.querySelector('#todoList');
const counter = document.querySelector('#taskCounter');
const filterButtons = document.querySelectorAll('.filter-btn');

let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let currentFilter = 'all';

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function updateCounter() {
  const activeCount = todos.filter((todo) => !todo.completed).length;
  counter.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} left`;
}

function renderTodos() {
  list.innerHTML = '';

  todos.forEach((todo, index) => {
    if (currentFilter === 'active' && todo.completed) return;
    if (currentFilter === 'completed' && !todo.completed) return;

    const li = document.createElement('li');
    li.className = todo.completed ? 'completed' : '';

    li.innerHTML = `
      <input type="checkbox" ${todo.completed ? 'checked' : ''}>
      <span></span>
      <button type="button" class="delete-btn">✕</button>
    `;

    li.querySelector('span').textContent = todo.text;

    li.querySelector('input').addEventListener('change', () => {
      todos[index].completed = !todos[index].completed;
      saveTodos();
      renderTodos();
    });

    li.querySelector('.delete-btn').addEventListener('click', () => {
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
    });

    list.appendChild(li);
  });

  updateCounter();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  todos.push({ text, completed: false });
  saveTodos();
  renderTodos();
  input.value = '';
});

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

renderTodos();
