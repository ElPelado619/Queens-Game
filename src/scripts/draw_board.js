import { getRandomMatrix } from './read_boards_file.js';
import { start_game } from './game_logic.js';

let colors_matrix = null;

document.addEventListener("DOMContentLoaded", async () => {
  const saved_color_matrix = localStorage.getItem("colors_matrix");
  if (saved_color_matrix) {
    colors_matrix = JSON.parse(saved_color_matrix);
    const size = colors_matrix.length;
    draw_board(size, colors_matrix);
    start_game(colors_matrix, false);
  } else {
    await getNewBoard();
  }
});

document.getElementById("new_game").addEventListener("click", getNewBoard);

async function getNewBoard() {
  const size = parseInt(document.getElementById('size').value);
  colors_matrix = await getRandomMatrix(size);

  if (colors_matrix) {
    draw_board(size, colors_matrix);
    start_game(colors_matrix, true); //2nd parameter is to force new game
    localStorage.setItem("colors_matrix", JSON.stringify(colors_matrix));
  } else {
    alert('Could not load the board');
  }
}

function draw_board(size, matriz) {
  const board = document.getElementById('board');
  board.innerHTML = '';

  for (let row = 0; row < size; row++) {
    const new_row = document.createElement('tr');

    for (let col = 0; col < size; col++) {

      const cell = document.createElement('td');
      const value = matriz[row][col]; // values between 1 and 10
      cell.id = `cell_${row}_${col}`;
      cell.className = `cell_color_${value}`;

      new_row.appendChild(cell);
    }

    board.appendChild(new_row);
  }
}
