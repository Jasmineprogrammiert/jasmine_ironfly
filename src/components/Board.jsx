import React from "react";
import PropTypes from "prop-types";
import Cell from "./Cell";

class Board extends React.Component {
  state = this.getInitialState(); 

  getInitialState() { 
    const initialState = { 
      grid: this.createBoard(), 
      minesCount: this.props.mines,
      gameStatus: this.props.gameStatus
    };

    return initialState;
  }

  restartBoard() {
    this.setState(this.getInitialState());
  }

  createBoard(click = null) {
    const grid = [];
    const rows = this.props.width;
    const columns = this.props.height;
    const minesCount = this.props.mines;
    const minesArray = this.getRandomMines(minesCount, columns, rows, click);
  
    for (let i = 0; i < columns; ++i) {
      grid.push([]);
      for (let j = 0; j < rows; ++j) {
        const gridCell = new GridCell(i, j, minesArray.includes(i * rows + j));
        this.addGridCell(grid, gridCell);
      }
    }
  
    return grid;
  }
  
  addGridCell(grid, gridCell) {
    const y = grid.length - 1; 
    const x = grid[y].length; 
    const currCell = gridCell;
    const neighbours = this.getNeighbours(grid, y, x);

    for (let neighbourGridCell of neighbours) {
      if (currCell.isMine) {
        neighbourGridCell.val += 1; 
      } else if (neighbourGridCell.isMine) {
        currCell.val += 1;
      }
    }

    grid[y].push(gridCell); 
  }

  getRandomMines(totalMines, columns, rows, click = null) {
    const minesArray = [];
    const totalCells = columns * rows;
    const minesPool = Array.from({ length: totalCells }, (_, i) => i);
  
    if (click > 0 && click < totalCells) {
      minesPool.splice(click, 1);
    }
  
    for (let i = 0; i < totalMines; ++i) {
      const randomIndex = Math.floor(Math.random() * (totalCells - i));
      minesArray.push(...minesPool.splice(randomIndex, 1));
    }
  
    return minesArray;
  }

  getNeighbours(grid, y, x) {
    const neighbours = [];
    const currRow = grid[y];
    const prevRow = grid[y - 1];
    const nextRow = grid[y + 1];

    if (currRow[x - 1]) neighbours.push(currRow[x - 1]);
    if (currRow[x + 1]) neighbours.push(currRow[x + 1]);
    if (prevRow) {
      if (prevRow[x - 1]) neighbours.push(prevRow[x - 1]);
      if (prevRow[x]) neighbours.push(prevRow[x]);
      if (prevRow[x + 1]) neighbours.push(prevRow[x + 1]);
    }
    if (nextRow) {
      if (nextRow[x - 1]) neighbours.push(nextRow[x - 1]); 
      if (nextRow[x]) neighbours.push(nextRow[x]);
      if (nextRow[x + 1]) neighbours.push(nextRow[x + 1]);
    }

    return neighbours;
  }

  revealBoard() {
    const grid = this.state.grid;

    for (const row of grid) {
      for (const gridCell of row) {
        gridCell.isRevealed = true;
      }
    }

    this.setState({});
  }

  revealEmptyNeighbours(grid, y, x) {
    const cell = grid[y][x];
  
    if (cell.isRevealed || cell.isFlagged) return;
  
    cell.isFlagged = false;
    cell.isRevealed = true;
  
    if (cell.isEmpty) {
      const neighbors = this.getNeighbours(grid, y, x);
  
      for (const neighbor of neighbors) {
        this.revealEmptyNeighbours(grid, neighbor.y, neighbor.x);
      }
    }
  }

  checkVictory() {
    const { height, width, mines } = this.props;
    const revealed = this.getRevealed();

    if (revealed >= height * width - mines) {
      this.killBoard("won");
    }
  }

  getRevealed() {
    let revealed = 0;
    const grid = this.state.grid
  
    for (const row of grid) {
      for (const gridCell of row) {
        if (gridCell.isRevealed) {
          revealed++;
        }
      }
    }
  
    return revealed;
  }
  

  killBoard(type) {
    const message = type === "lost" ? "Ooops you lost @@" : "Congrats! You won!";

    this.setState({ gameStatus: message }, () => {
      this.revealBoard();
    });
  }

  handleLeftClick(y, x) {
    const grid = this.state.grid;
    const gridCell = grid[y][x];

    gridCell.isClicked = true;

    if (gridCell.isRevealed || gridCell.isFlagged) return false;

    if (gridCell.isMine) {
      this.killBoard("lost");
      return false;
    }

    if (gridCell.isEmpty) {
      this.revealEmptyNeighbours(grid, y, x);
    }

    gridCell.isFlagged = false;
    gridCell.isRevealed = true;

    this.setState({}, () => {
      this.checkVictory();
    });
  }  

  handleRightClick(e, y, x) {
    e.preventDefault(); 

    const grid = this.state.grid;
    let minesLeft = this.state.minesCount;

    if (grid[y][x].isRevealed) return false;

    if (grid[y][x].isFlagged) {
      grid[y][x].isFlagged = false;
      minesLeft++;
    } else {
      grid[y][x].isFlagged = true;
      minesLeft--;
    }

    this.setState({
      minesCount: minesLeft
    });
  }

  renderBoard() {
    const grid = this.state.grid;

    return grid.map(row => {
      const rowCells = row.map(gridCell => (
        <Cell
          key={gridCell.y * row.length + gridCell.x}
          value={gridCell}
          onClick={() => this.handleLeftClick(gridCell.y, gridCell.x)}
          cMenu={e => this.handleRightClick(e, gridCell.y, gridCell.x)}
        />
      ));

      return (
        <>
        <div className="row">{rowCells}</div>
        </>
      );
    });
  }

  render() {
    return (
      <>
      <div className="board">
        <div className="mines-count">
          <span>💣 {this.state.minesCount}</span>
        </div>
        <div className="grid">{this.renderBoard()}</div>
      </div>
      <p>{this.state.gameStatus}</p>
      </>
    );
  }
}

class GridCell {
  constructor(y, x, isMine) {
    this.x = x;
    this.y = y;
    this.val = 0;
    this.isMine = isMine;
    this.isRevealed = false;
    this.isFlagged = false;
    this.isUnknown = false;
    this.isClicked = false;
  }
  get isEmpty() { 
    return this.val === 0 && !this.isMine;
  }
}

Board.propTypes = {
  height: PropTypes.number,
  width: PropTypes.number,
  mines: PropTypes.number
};

export default Board;
