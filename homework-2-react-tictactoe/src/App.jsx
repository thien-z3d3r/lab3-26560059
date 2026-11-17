import Board from './Board';
import GameStatus from './GameStatus';
import './App.css';

const sampleBoard = ['X', 'O', 'X', 'X', 'O', '', '', 'O', ''];
const sampleScores = { X: 3, O: 2, draw: 1 };
const sampleStatus = "Player X's turn";

function App() {
  return (
    <main className="game">
      <h1>Tic<span>-</span>Tac<span>-</span>Toe</h1>
      <GameStatus status={sampleStatus} scores={sampleScores} />
      <Board board={sampleBoard} />
      <button type="button" className="restart-btn">↻ New Round</button>
    </main>
  );
}

export default App;
