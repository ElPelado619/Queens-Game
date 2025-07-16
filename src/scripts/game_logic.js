import { startTimer } from './timer.js';

let matriz_reinas = null;
let matriz_colores = null;
let size = null;

let mouseIsDown = false;
let mouseButton = null;
let lastEdited = new Set();

// Mouse event handlers
document.addEventListener('mousedown', (e) => {
  // Only handle left (0) and right (2) mouse buttons
  if (e.button !== 0 && e.button !== 2) return;
  
  mouseIsDown = true;
  mouseButton = e.button;
  lastEdited.clear();
  
  // Handle initial click immediately if on a cell
  if (e.target.closest('td')) {
    const cell = e.target.closest('td');
    const [_, row, col] = cell.id.split('_').map(Number);
    editar_celda(row, col, mouseButton === 0 ? 1 : 2);
  }
});

document.addEventListener('mouseup', (e) => {
  if (e.button === mouseButton) {
    mouseIsDown = false;
    mouseButton = null;
    setTimeout(() => lastEdited.clear(), 50);
  }
});

document.getElementById("board").addEventListener('contextmenu', (e) => e.preventDefault());

export async function start_game(nueva_matriz, force_new_game) {
  matriz_colores = nueva_matriz;
  size = matriz_colores.length;
  let new_game_flag = true;

  const guardado = localStorage.getItem("matriz_reinas");
  if (guardado && !force_new_game) {
    try {
      const data = JSON.parse(guardado);
      if (Array.isArray(data) && data.length === size) {
        matriz_reinas = data;
        new_game_flag = false;
      } else {
        throw new Error("Tamaño inválido");
      }
    } catch {
      empty_board();
      localStorage.setItem("matriz_reinas", JSON.stringify(matriz_reinas));
    }
  } else {
    empty_board();
    localStorage.setItem("matriz_reinas", JSON.stringify(matriz_reinas));
  }

  render_board();
  agregar_listeners_drag();


  if (new_game_flag) {
    startTimer(true); // start from 0
  }
  else {
    startTimer(false); //get time from localStorage
  }
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
  celda.innerHTML = '';
  
  if (valor === 1) {
    celda.innerHTML = '<img class="board_icons" src="src/assets/images/queen_icon.svg" alt="Queen Piece">';
  } else if (valor === 2) {
    celda.innerHTML = '<img class="board_icons" src="src/assets/images/cross.svg" alt="Cross icon">';
  }
}

function editar_celda(row, col, tipo) {
  if (!valid_coords(row, col)) return;
  
  const key = `${row}_${col}`;
  if (lastEdited.has(key)) return;
  lastEdited.add(key);

  // Clear opposite type when placing new mark
  if (tipo === 1) { // Queen placement
    matriz_reinas[row][col] = matriz_reinas[row][col] === 1 ? 0 : 1;
  } 
  else if (tipo === 2) { // Cross placement
    matriz_reinas[row][col] = matriz_reinas[row][col] === 2 ? 0 : 2;
  }

  render_icon(row, col);
  localStorage.setItem("matriz_reinas", JSON.stringify(matriz_reinas));
  check_win_condition();
}

function agregar_listeners_drag() {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = document.getElementById(`cell_${row}_${col}`);
      if (!cell) continue;

      // Clone cell to remove old listeners
      const newCell = cell.cloneNode(true);
      cell.replaceWith(newCell);

      // Handle mouseenter for dragging
      newCell.addEventListener('mouseenter', () => {
        if (mouseIsDown) {
          editar_celda(row, col, mouseButton === 2 ? 2 : 1);
        }
      });
      
      // accessibility and touch devices
      newCell.addEventListener('click', (e) => {
        if (e.button === 0) {
          editar_celda(row, col, 1);
        }
      });

      newCell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        editar_celda(row, col, 2);
      });
    }
  }
}

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

function valid_coords(row, col) {
  return row >= 0 && row < size && col >= 0 && col < size;
}

// Export functions
export function cell_clicked(cell_id) {
  const [_, row, col] = cell_id.split('_').map(Number);
  editar_celda(row, col, 1);
}

export function cell_right_clicked(cell_id) {
  const [_, row, col] = cell_id.split('_').map(Number);
  editar_celda(row, col, 2);
}

// Clear board button
document.getElementById("clear_board").addEventListener("click", () => {
  empty_board();
  localStorage.setItem("matriz_reinas", JSON.stringify(matriz_reinas));
  render_board();
});

function check_win_condition() {

}