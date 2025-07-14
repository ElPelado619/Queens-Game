import { obtenerMatrizAleatoria } from './read_boards_file.js';
import { cell_clicked, cell_right_clicked, start_game } from './game_logic.js';

let matriz_colores = null;

document.addEventListener("DOMContentLoaded", async () => {
  const guardado = localStorage.getItem("matriz_colores");
  if (guardado) {
    try {
      matriz_colores = JSON.parse(guardado);
      const size = matriz_colores.length;
      draw_board(size, matriz_colores);
      setTimeout(() => start_game(matriz_colores), 0);
    } catch (e) {
      console.error("Error al parsear localStorage:", e);
      await getNewBoard();
    }
  } else {
    await getNewBoard();
  }
});

document.getElementById("new_game").addEventListener("click", getNewBoard);

async function getNewBoard() {
  const size = parseInt(document.getElementById('size').value);
  matriz_colores = await obtenerMatrizAleatoria();
  if (matriz_colores) {
    localStorage.setItem("matriz_colores", JSON.stringify(matriz_colores));
    localStorage.removeItem("matriz_reinas");
    draw_board(size, matriz_colores);
    setTimeout(() => start_game(matriz_colores), 0);
  } else {
    alert('Could not load the board');
  }
}

function draw_board(size, matriz) {
  const board = document.getElementById('board');
  board.innerHTML = '';

  for (let row = 0; row < size; row++) {
    const new_row = document.createElement('tr');

    for (let column = 0; column < size; column++) {
      const cell = document.createElement('td');
      cell.id = `cell_${row}_${column}`;

      const valor = matriz[row][column];
      cell.className = "cell_color_" + valor;
      cell.classList.add(`cell_color_${valor}`);
      new_row.appendChild(cell);

      cell.addEventListener('click', () => cell_clicked(cell.id));
      cell.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        cell_right_clicked(cell.id);
      });
    }
    board.appendChild(new_row);
  }
}
