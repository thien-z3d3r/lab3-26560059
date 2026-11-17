import Cell from './Cell';

function Board({ board, winningIndices = [] }) {
  return (
    <div className="board">
      {board.map((value, index) => (
        <Cell
          key={index}
          value={value}
          isWinning={winningIndices.includes(index)}
        />
      ))}
    </div>
  );
}

export default Board;
