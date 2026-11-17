const boardElement = document.querySelector('#board');
const statusElement = document.querySelector('#status');
const restartBtn = document.querySelector('#restartBtn');
const scoreXElement = document.querySelector('#scoreX .value');
const scoreDrawElement = document.querySelector('#scoreDraw .value');
const scoreOElement = document.querySelector('#scoreO .value');

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

let board = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = true;
let scores = { X: 0, O: 0, draw: 0 };

function updateStatus(message) {
  statusElement.textContent = message;
}

function updateScoreboard() {
  scoreXElement.textContent = scores.X;
  scoreDrawElement.textContent = scores.draw;
  scoreOElement.textContent = scores.O;
}

function checkWinner() {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combination };
    }
  }

  if (board.every((cell) => cell !== '')) {
    return { winner: 'draw', combination: null };
  }

  return null;
}

function handleCellClick(index) {
  if (!gameActive || board[index] !== '') {
    return;
  }

  board[index] = currentPlayer;
  const cell = boardElement.children[index];
  cell.textContent = currentPlayer;
  cell.classList.add('taken', currentPlayer.toLowerCase());

  const result = checkWinner();

  if (result) {
    gameActive = false;
    if (result.winner === 'draw') {
      scores.draw++;
      updateStatus("Game ended in a draw!");
    } else {
      scores[result.winner]++;
      updateStatus(`Player ${result.winner} wins!`);
      result.combination.forEach((idx) => {
        boardElement.children[idx].classList.add('winner');
      });
    }
    updateScoreboard();
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus(`Player ${currentPlayer}'s turn`);
}

function renderBoard() {
  boardElement.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.addEventListener('click', () => handleCellClick(i));
    boardElement.appendChild(cell);
  }
}

function startNewRound() {
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameActive = true;
  updateStatus(`Player ${currentPlayer}'s turn`);

  Array.from(boardElement.children).forEach((cell) => {
    cell.textContent = '';
    cell.className = 'cell';
  });
}

restartBtn.addEventListener('click', startNewRound);

renderBoard();
startNewRound();
