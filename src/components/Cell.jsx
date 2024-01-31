import PropTypes from "prop-types";

const Cell = ({ value, onClick, cMenu }) => {
  const getValue = () => {
    if (!value.isRevealed) {
      return value.isFlagged ? "🚩" : null;
    } else if (value.isMine) {
      return "💣";
    } else if (value.isEmpty) {
      return "";
    }
    return value.val;
  };

  const className = `cell ${
    value.isRevealed ? "" : "hidden"
  } ${value.isMine ? "is-mine" : ""} ${
    value.isClicked ? "is-clicked" : ""
  } ${value.isEmpty ? "is-empty" : ""} ${
    value.isUnknown ? "is-unknown" : ""
  } ${value.isFlagged ? "is-flag" : ""}`;

  return (
    // onContextMenu handle the right-click event
    <div className={className} onClick={onClick} onContextMenu={cMenu}>
      {getValue()}
    </div>
  );
};

const cellItemShape = {
  x: PropTypes.number,
  y: PropTypes.number,
  val: PropTypes.number,
  isRevealed: PropTypes.bool,
  isMine: PropTypes.bool,
  isFlagged: PropTypes.bool
};

Cell.propTypes = {
  value: PropTypes.shape(cellItemShape),
  onClick: PropTypes.func,
  cMenu: PropTypes.func
};

export default Cell;
