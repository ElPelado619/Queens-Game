import { obtenerMatrizAleatoria } from './read_boards_file.js';
import { start_game } from './game_logic.js';

let matriz_colores = null;

document.addEventListener("DOMContentLoaded", async () => {
  const saved_color_matrix = localStorage.getItem("matriz_colores");
  if (saved_color_matrix) {
    matriz_colores = JSON.parse(saved_color_matrix);
    const size = matriz_colores.length;
    draw_board(size, matriz_colores);
    start_game(matriz_colores, false);
  } else {
    await getNewBoard();
  }
});

document.getElementById("new_game").addEventListener("click", getNewBoard);

async function getNewBoard() {
  const size = parseInt(document.getElementById('size').value);
  matriz_colores = await obtenerMatrizAleatoria(size);

  if (matriz_colores) {
    draw_board(size, matriz_colores);
    start_game(matriz_colores, true); //2nd parameter is to force new game
    localStorage.setItem("matriz_colores", JSON.stringify(matriz_colores));
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
      const valor = matriz[row][col]; // values between 1 and 10
      cell.id = `cell_${row}_${col}`;
      cell.className = `cell_color_${valor}`;

      new_row.appendChild(cell);
    }

    board.appendChild(new_row);
  }
}
