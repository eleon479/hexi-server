export function mapBuilder(columns, rows, players) {
  const newMap = {
    size: 50,
    columns,
    rows,
    tiles: [],
  };

  for (let c = 0; c < columns; c++) {
    let newCol = [];
    for (let r = 0; r < rows; r++) {
      newCol.push({ player: null, power: 0, active: true });
    }
    newMap.tiles.push(newCol);
  }

  const playerIdList = Object.keys(players);

  // @todo refactor this to allow for more than 2 players
  const firstPlayer = playerIdList[0];
  const secondPlayer = playerIdList[1];

  // maybe extract this elsewhere?
  newMap.tiles[0][0] = { player: firstPlayer, power: 2, active: true };
  newMap.tiles[columns - 1][rows - 1] = {
    player: secondPlayer,
    power: 2,
    active: true,
  };

  return newMap;
}
