import { useState } from 'react';
import Cell from '../src/components/Cell';

function RenderBoard({ handleLeftClick, handleRightClick}) {
  const [grid, setGrid] = useState([]);

  return grid.map(row => {
    const rowCells = row.map(gridCell => (
      <Cell
        key={gridCell.y * row.length + gridCell.x}
        onClick={() => handleLeftClick(gridCell.y, gridCell.x)}
        cMenu={e => handleRightClick(e, gridCell.y, gridCell.x)}
        value={gridCell}
      />
    ));

    return (
      <div className="row">{rowCells}</div>
    );
  });
}

export default RenderBoard;
