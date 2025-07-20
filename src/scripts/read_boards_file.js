export async function getRandomMatrix(size) {
  try {
    let modulePath;

    switch (size) {
      case 6: modulePath = './boards6.js'; break;
      case 7: modulePath = './boards7.js'; break;
      case 8: modulePath = './boards8.js'; break;
      case 9: modulePath = './boards9.js'; break;
      case 10: modulePath = './boards10.js'; break;
      default: throw new Error("Invalid board size: " + size);
    }

    const boardsModule = await import(modulePath);

    const exportName = `boards${size}`;
    const boardsObj = boardsModule[exportName];
    if (!boardsObj) throw new Error(`Exported object ${exportName} not found in ${modulePath}`);

    const boardList = Object.values(boardsObj);
    if (boardList.length === 0) throw new Error(`No boards found in ${modulePath}`);

    const randomIndex = Math.floor(Math.random() * boardList.length);
    const chosenBoard = boardList[randomIndex];

    return chosenBoard;

  } catch (error) {
    console.error('Board loading error:', error);
    return null;
  }
}
