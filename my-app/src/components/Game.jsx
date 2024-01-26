import { useRef, useState } from "react";
import Board from "./Board";

function Game() {
  const boardElement = useRef();

  const [height, setHeight] = useState(8);
  const [width, setWidth] = useState(8);
  const [mines, setMines] = useState(10);
  const [gameStatus, setGameStatus] = useState(0);

  const handleChange = (prop, value) => {
    switch (prop) {
      case "height":
        setHeight(value);
        break;
      case "width":
        setWidth(value);
        break;
      case "mines":
        setMines(value);
        break;
      default:
        break;
    }
  };

  const handleChangeHeight = (event) => {
    const val = clamp(event.target.value, 5, 18);
    handleChange("height", val);
  };

  const handleChangeWidth = (event) => {
    const val = clamp(event.target.value, 5, 18);
    handleChange("width", val);
  };

  const handleChangeMines = (event) => {
    const cap = Math.floor((height * width) / 3);
    const val = clamp(event.target.value, 1, cap);
    handleChange("mines", val);
  };

  const restartGame = () => {
    boardElement.current.restartBoard();
  };

  const clamp = (n, min, max) => {
    return Math.max(min, Math.min(n, max));
  };

  const gameOverMessage = gameStatus === 1 ? "Game Over" : "";

  return (
    <div className="game">
      <Board
        ref={boardElement}
        height={height}
        width={width}
        mines={mines}
        gameStatus={gameStatus}
      />
      <div className="control-buttons">
        <button onClick={restartGame}>Restart</button>
        <form>
          <label>Height</label>
          <input
            type="number"
            value={height}
            onChange={handleChangeHeight}
          />
          <label>Width</label>
          <input
            type="number"
            value={width}
            onChange={handleChangeWidth}
          />
          <label>Mines</label>
          <input
            type="number"
            value={mines}
            onChange={handleChangeMines}
          />
        </form>
        <div>{gameOverMessage}</div>
      </div>
    </div>
  );
}

export default Game;
