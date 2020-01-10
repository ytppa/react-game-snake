import React from "react";

function PlayField({ width, height, rabbits, snake }) {
  let cells = [];

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      if (
        rabbits.find(element => element.x === column && element.y === row) !==
        undefined
      ) {
        cells.push({
          key: `cell-${column}-${row}`,
          class: ["rabbit"],
          x: column,
          y: row
        });
      } else if (
        snake.find(element => element.x === column && element.y === row) !==
        undefined
      ) {
        const snakePartIndex = snake.findIndex(
          element => element.x === column && element.y === row
        );
        cells.push({
          key: `cell-${column}-${row}`,
          class: snakePartIndex === 0 ? ["snake", "head"] : ["snake"],
          x: column,
          y: row
        });
      } else {
        cells.push({
          key: `cell-${column}-${row}`,
          class: ["empty"],
          x: column,
          y: row
        });
      }
    }
  }

  let cellsJSX = cells.map(cell => (
    <div
      key={cell.key}
      className={`play-field--cell ${cell.class.join(" ")}`}
    />
  ));

  return (
    <div
      className="play-field"
      style={{
        gridTemplateColumns: `repeat(${width}, 1fr)`,
        gridTemplateRows: `repeat(${height}, 1fr)`
      }}
    >
      {cellsJSX}
    </div>
  );
}

export default PlayField;
