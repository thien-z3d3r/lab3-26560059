const button = document.querySelector('#themeToggle');
const savedTheme = localStorage.getItem('theme');

function updateButton(isDark) {
  button.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
}

if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
  updateButton(true);
} else {
  updateButton(false);
}

button.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateButton(isDark);
});
