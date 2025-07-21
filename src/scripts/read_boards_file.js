import { load_selections } from "./save_selections";
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
      console.warn(`${boardKey} does not exist in boards${size}.`);
      return null;
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



document.addEventListener("DOMContentLoaded", async() => {
  board_count.innerHTML = "Boards that match the settings: "
  load_selections();
  getCountSizeAndMode();
});


document.getElementById("size").addEventListener("change", getCountSizeAndMode);
document.getElementById("difficulty").addEventListener("change", getCountSizeAndMode);

async function getCountSizeAndMode(){
  const size = document.getElementById("size").value;
  const difficulty = document.getElementById("difficulty").value;
  const board_count = document.getElementById("board_count");

  let modulePath = `./boards${size}.js`;
  if (difficulty === "chaos") {
    modulePath = `./chaosBoards${size}.js`;
  }
  const loader = boardModules[modulePath];
  if (!loader) {
    console.warn(`No board file found for path: ${modulePath}`);
    board_count.innerHTML = "Boards that match the settings: 0" 
    return null;
  }
  const module = await loader();
  const boardsObj = module[`boards${size}`];
  
  if (!boardsObj) {
    console.warn(`No boards object named boards${size} in ${modulePath}`);
    board_count.innerHTML = "Boards that match the settings: 0" 
    return null;
  }

  const boardKeys = Object.keys(boardsObj)
  let count = 0;
  for (let i = 0; i < boardKeys.length; i++) {
    count++;
  }

  board_count.innerHTML = "Boards that match the settings: " + count;
}
