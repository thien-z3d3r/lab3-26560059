function Cell({ value, isWinning }) {
  const classNames = [
    'cell',
    value ? 'taken' : '',
    value ? value.toLowerCase() : '',
    isWinning ? 'winner' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classNames}>{value}</div>;
}

export default Cell;
