const boardModules = import.meta.glob(['./boards*.js', './chaosBoards*.js']);

export async function getRandomMatrix(size, difficulty) {
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

  const boardList = Object.values(boardsObj);
  if (boardList.length === 0) {
    console.error(`No boards found in boards${size}`);
    return null;
  }

  const randomIndex = Math.floor(Math.random() * boardList.length);
  return boardList[randomIndex];
}