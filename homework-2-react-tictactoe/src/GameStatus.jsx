function GameStatus({ status, scores }) {
  return (
    <>
      <div className="scoreboard">
        <div className="score score-x">
          <span className="label">Player X</span>
          <span className="value">{scores.X}</span>
        </div>
        <div className="score score-draw">
          <span className="label">Draws</span>
          <span className="value">{scores.draw}</span>
        </div>
        <div className="score score-o">
          <span className="label">Player O</span>
          <span className="value">{scores.O}</span>
        </div>
      </div>
      <p className="status">{status}</p>
    </>
  );
}

export default GameStatus;
