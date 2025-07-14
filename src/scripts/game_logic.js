let matriz_reinas = null; // 0: Vacío, 1: Reina, 2: Cruz
let matriz_colores = null;
let size = null;

let mouseIsDown = false;
let mouseButton = null; // 0 = izquierdo, 2 = derecho

document.addEventListener('mousedown', (e) => {
  mouseIsDown = true;
  mouseButton = e.button;
});

document.addEventListener('mouseup', () => {
  mouseIsDown = false;
  mouseButton = null;
});

document.getElementById("board").addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

export async function start_game(nueva_matriz) {
  matriz_colores = nueva_matriz;
  size = matriz_colores.length;

  const guardado = localStorage.getItem("matriz_reinas");
  if (guardado) {
    try {
      const data = JSON.parse(guardado);
      if (Array.isArray(data) && data.length === size) {
        matriz_reinas = data;
      } else {
        throw new Error("Tamaño inválido");
      }
    } catch (e) {
      console.warn("Matriz reinas inválida o corrupta. Se reinicia.");
      empty_board();
      localStorage.setItem("matriz_reinas", JSON.stringify(matriz_reinas));
    }
  } else {
    empty_board();
    localStorage.setItem("matriz_reinas", JSON.stringify(matriz_reinas));
  }

  render_board();
  agregar_listeners_drag();
}

function render_board() {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      render_icon(row, col);
    }
  }
}

function render_icon(row, col) {
  const celda = document.getElementById(`cell_${row}_${col}`);
  if (!celda) return;

  const valor = matriz_reinas[row][col];
  if (valor === 1) {
    celda.innerHTML = '<img class="board_icons" src="src/assets/images/queen_icon.svg" alt="Queen Piece">';
  } else if (valor === 2) {
    celda.innerHTML = '<img class="board_icons" src="src/assets/images/cross.svg" alt="Cross icon">';
  } else {
    celda.innerHTML = '';
  }
}

export function cell_clicked(cell_id) {
  const [_, row, col] = cell_id.split('_').map(Number);
  if (!valid_coords(row, col)) return;

  matriz_reinas[row][col] = matriz_reinas[row][col] === 1 ? 0 : 1;
  render_icon(row, col);
  localStorage.setItem("matriz_reinas", JSON.stringify(matriz_reinas));
  check_win_condition();
}

export function cell_right_clicked(cell_id) {
  const [_, row, col] = cell_id.split('_').map(Number);
  if (!valid_coords(row, col)) return;

  matriz_reinas[row][col] = matriz_reinas[row][col] === 2 ? 0 : 2;
  render_icon(row, col);
  localStorage.setItem("matriz_reinas", JSON.stringify(matriz_reinas));
  check_win_condition();
}

document.getElementById("clear_board").addEventListener("click", () => {
  empty_board();
  localStorage.setItem("matriz_reinas", JSON.stringify(matriz_reinas));
});

function empty_board() {
  matriz_reinas = [];
  for (let row = 0; row < size; row++) {
    matriz_reinas[row] = [];
    for (let col = 0; col < size; col++) {
      matriz_reinas[row][col] = 0;
      const cell = document.getElementById(`cell_${row}_${col}`);
      if (cell) cell.innerHTML = '';
    }
  }
}

function agregar_listeners_drag() {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = document.getElementById(`cell_${row}_${col}`);
      if (!cell) continue;

      cell.addEventListener('mouseenter', () => {
        if (mouseIsDown && mouseButton === 0) {
          cell_clicked(cell.id);
        } else if (mouseIsDown && mouseButton === 2) {
          cell_right_clicked(cell.id);
        }
      });
    }
  }
}

function valid_coords(row, col) {
  return row >= 0 && row < size && col >= 0 && col < size;
}

function check_win_condition() {

}
