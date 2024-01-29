import { useRef, useState } from 'react';
import Board from '../components/Board';

function Game() {
  const boardElement = useRef();

  const [height, setHeight] = useState(8);
  const [width, setWidth] = useState(8);
  const [mines, setMines] = useState(10);

  const handleHeight = e => {
    let val = parseInt(e.target.value);
    setHeight(Math.min(val, 16));
  };

  const handleWidth = e => {
    const val = parseInt(e.target.value);
    setWidth(Math.min(val, 30));
  };

  const handleMines = e => {
    const val = parseInt(e.target.value);
    setMines(Math.min(val, 99));
  };

  const restartGame = e => {
    e.preventDefault() // prevent page refresh
    boardElement.current.restartBoard(); // link to restartBoard() in Board.jsx
  };

  return (
    <div className="game">
      <Board
        ref={boardElement}
        height={height}
        width={width}
        mines={mines}
      />
      <form>
        <label>Height</label>
        <input
          type="number"
          value={height}
          onChange={handleHeight}
        />
        <label>Width</label>
        <input
          type="number"
          value={width}
          onChange={handleWidth}
        />
        <label>Mines</label>
        <input
          type="number"
          value={mines}
          onChange={handleMines}
        />
        <button type="submit" onClick={restartGame}>Restart</button>
      </form>
    </div>
  );
}

export default Game;
