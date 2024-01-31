import React from "react";
import PropTypes from "prop-types";
import Cell from "./Cell";

class Board extends React.Component {
  state = this.getInitialState(); 

  getInitialState() { 
    const initialState = { // useState-alike
      // this: the current object or instance of a class, which gives access
      // to the class"s properties and methods wihtin its own scope
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
      // ++i increments and returns the incremented value (faster)
      // i++ returns the current value then increments it
      grid.push([]); // adds a new row to the grid
      for (let j = 0; j < rows; ++j) {
        // gridCell: a single cell in the grid
        // i * rows + j creates a unique id for each cell
        // minesArray.includes(i * rows + j) checks if the cell is a mine
        const gridCell = new GridCell(i, j, minesArray.includes(i * rows + j));
        this.addGridCell(grid, gridCell);
      }
    }

    return grid;
  }

  addGridCell(grid, gridCell) {
    const y = grid.length - 1; // y: index of the last row = number of total rows
    const x = grid[y].length; // x: number of columns in the last row = number of total columns
    const currCell = gridCell; // the last cell being added to the grid array
    const neighbours = this.getNeighbours(grid, y, x);

    for (let neighbourGridCell of neighbours) {
      if (currCell.isMine) {
        neighbourGridCell.val += 1; // the neighbourGridCell is adjacent to a mine
      } else if (neighbourGridCell.isMine) {
        currCell.val += 1;
      }
    }

    // grid: a 2D array
    // gridCell: a single cell in the grid, an object with properties
    grid[y].push(gridCell); // adds the gridCell to the last row of the grid array
  }

  getRandomMines(totalMines, columns, rows, click = null) {
    const minesArray = []; // store randomly selected mine positions
    const totalCells = columns * rows;
    // ... Array() create an array, Array() create a nested array
    // keys() returns an array of indices
    const minesPool = [...Array(totalCells).keys()]; // all possible cell indices for mines

    if (click > 0 && click < totalCells) {
      // splice(index, howMany, replacement): replace howMany elements from index with replacement
      minesPool.splice(click, 1);
    }

    for (let i = 0; i < totalMines; ++i) { 
      // 0 < Math.random() < 1
      // num < minesPool.length (like i < arr.length)
      // Math.floor() rounds the number down to the nearest integer
      const num = Math.floor(Math.random() * minesPool.length);
      // removes the randomly selected num from minesPool, and adds it to minesArray
      minesArray.push(...minesPool.splice(num, 1));
    }

    return minesArray; // randomly selected mine positions
  }

  getNeighbours(grid, y, x) {
    // find the neighboring cells of a given cell in a grid, taking into account the current row, previous row, and next row. 
    const neighbours = [];
    const currRow = grid[y];
    const prevRow = grid[y - 1];
    const nextRow = grid[y + 1];

    if (currRow[x - 1]) neighbours.push(currRow[x - 1]); // currRow, lColumn
    if (currRow[x + 1]) neighbours.push(currRow[x + 1]); // currRow, rColumn
    if (prevRow) {
      if (prevRow[x - 1]) neighbours.push(prevRow[x - 1]); // prevRow, lColumn
      if (prevRow[x]) neighbours.push(prevRow[x]); // prevRow, currColumn
      if (prevRow[x + 1]) neighbours.push(prevRow[x + 1]); // prevRow, rColumn
    }
    if (nextRow) {
      if (nextRow[x - 1]) neighbours.push(nextRow[x - 1]); 
      if (nextRow[x]) neighbours.push(nextRow[x]);
      if (nextRow[x + 1]) neighbours.push(nextRow[x + 1]);
    }

    return neighbours;
  }

  // current cell: 13
  // currRow: 12, 14, 
  // prevRow: 7, 8, 9, 
  // nextRow: 17, 18, 19

  // const grid = [
  //   [1, 2, 3, 4, 5],
  //   [6, 7, 8, 9, 10],
  //   [11, 12, 13, 14, 15],
  //   [16, 17, 18, 19, 20],
  //   [21, 22, 23, 24, 25]
  // ];
  
  // const result = getNeighbours(grid, 2, 2);
  // console.log(result);

  revealBoard() {
    const grid = this.state.grid;

    for (const row of grid) {
      for (const gridCell of row) {
        gridCell.isRevealed = true;
      }
    }

    // const [sttae, setState] = useState(initialState)
    // this.setState(newState, callback)
    // re-rendered the UI with the state isRevealed = true
    this.setState({});
  }

  revealEmptyNeigbhours(grid, y, x) {
    // creates a new array of neighbouring cells
    const neighbours = [...this.getNeighbours(grid, y, x)];
    grid[y][x].isFlagged = false;
    grid[y][x].isRevealed = true;

    while (neighbours.length) {
      // removes and assigns the first element from the neighbours array to the neighbourGridCell variable
      const neighbourGridCell = neighbours.shift();

      if (neighbourGridCell.isRevealed) {
        continue;
      }
      if (neighbourGridCell.isEmpty) {
        neighbours.push(
          ...this.getNeighbours(grid, neighbourGridCell.y, neighbourGridCell.x)
        );
      }

      neighbourGridCell.isFlagged = false;
      neighbourGridCell.isRevealed = true;
    }
  }

  checkVictory() {
    const { height, width, mines } = this.props;
    const revealed = this.getRevealed();

    // all cells = (safe + mine) cells
    if (revealed >= height * width - mines) {
      this.killBoard("won");
    }
  }

  getRevealed = () => {
    return this.state.grid
      // reduce the 2D grid aray to a 1D array
      // [] represents an empty array
      .reduce((accumulator, row) => {
        accumulator.push(...row);
        return accumulator;
      }, [])
      // create a new arr with only the revealed cells
      .map(row => row.isRevealed)
      // filter out cells that are not revealed, i.e. has a value of false
      // and return the length of the array
      .filter(row => !!row).length;
  };

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

    if (gridCell.isRevealed || gridCell.isFlagged) {
      return false;
    }
    if (gridCell.isMine) {
      this.killBoard("lost");
      return false;
    }

    // If cell is not a mine and is empty (does not have any mines adjacent to it), it reveals adjacent cells and repeats for other empty cells.
    if (gridCell.isEmpty) {
      this.revealEmptyNeigbhours(grid, y, x);
    }

    gridCell.isFlagged = false;
    gridCell.isRevealed = true;

    // {} triggers a re-render of the component
    this.setState({}, () => {
      this.checkVictory();
    });
  }

  handleRightClick(e, y, x) {
    e.preventDefault(); // prevent the display of the context menu

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
          // use key to identify which items have changed, are added, or are removed
          key={gridCell.y * row.length + gridCell.x}
          value={gridCell}
          onClick={() => this.handleLeftClick(gridCell.y, gridCell.x)}
          // context menu
          cMenu={e => this.handleRightClick(e, gridCell.y, gridCell.x)}
        />
      ));
      // const grid = [
      //   [1, 2, 3],
      //   [4, 5, 6],
      //   [7, 8, 9]
      // ];

      // key 
      // 0 * 3 + 0 = 0
      // 0 * 3 + 1 = 1
      // 0 * 3 + 2 = 2
      // 1 * 3 + 0 = 3
      // ... ...

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
  get isEmpty() { // getter method: access the property of an object
    return this.val === 0 && !this.isMine;
  }
}

Board.propTypes = { // validator
  height: PropTypes.number,
  width: PropTypes.number,
  mines: PropTypes.number
};

export default Board;
