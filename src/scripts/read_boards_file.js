const boardModules = import.meta.glob(['./boards*.js', './chaosBoards*.js']);

export async function getRegionsMatrix(size, difficulty, boardId) {
  let modulePath = `./boards${size}.js`;
  if (difficulty === "chaos") {
    modulePath = `./chaosBoards${size}.js`;
  }

  const loader = boardModules[modulePath];

  if (!loader) {
    console.error(`No board file found for path: ${modulePath}`);
    return null;
  }

  const module = await loader();
  const boardsObj = module[`boards${size}`];

  if (!boardsObj) {
    console.error(`No boards object named boards${size} in ${modulePath}`);
    return null;
  }

  if (!isNaN(boardId) && boardId >= 1) {
    const boardKey = `board_${boardId}`;
    if (!(boardKey in boardsObj)) {
      console.warn(`${boardKey} does not exist in boards${size}. Returning a random board instead.`);
      alert(`${boardKey} does not exist in boards${size}. Returning a random board instead.`);
    } else {
      console.log(`Loaded ${boardKey}, from boards${size} in ${modulePath}`);
      return {
        matrix_key: boardsObj[boardKey],
        board_number: boardId
      };
    }
  }

  const boardKeys = Object.keys(boardsObj);
  if (boardKeys.length === 0) {
    console.error(`No boards found in boards${size}`);
    return null;
  }

  const randomKey = boardKeys[Math.floor(Math.random() * boardKeys.length)];
  return {
    matrix_key: boardsObj[randomKey],
    board_number: parseInt(randomKey.split('_')[1])
  };
}
