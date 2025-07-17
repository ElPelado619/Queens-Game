import { startTimer, stopTimer, getCurrentTime } from './timer.js';

let matriz_reinas = null;
let matriz_colores = null;
let size = null;
let gameCompleted = false;

let mouseIsDown = false;
let mouseButton = null;
let lastEdited = new Set();
let lastEditedTimeout = null;

window.addEventListener('blur', () => {
  mouseIsDown = false;
  mouseButton = null;
  lastEdited.clear();
});

document.addEventListener('mousedown', (e) => {
  if (gameCompleted) return;
  if (e.button !== 0 && e.button !== 2) return;

  mouseIsDown = true;
  mouseButton = e.button;
  lastEdited.clear();

  if (e.target.closest('td')) {
    const cell = e.target.closest('td');
    const [_, row, col] = cell.id.split('_').map(Number);
    edit_cell(row, col, mouseButton === 0 ? 1 : 2);
  }
});

document.addEventListener('mouseup', (e) => {
  if (e.button === mouseButton) {
    mouseIsDown = false;
    mouseButton = null;
    lastEditedTimeout = setTimeout(() => lastEdited.clear(), 50);
  }
});

document.getElementById("board").addEventListener('contextmenu', (e) => e.preventDefault());

function resetInputStates() {
  mouseIsDown = false;
  mouseButton = null;
  lastEdited.clear();

  if (lastEditedTimeout) {
    clearTimeout(lastEditedTimeout);
    lastEditedTimeout = null;
  }
}

export async function start_game(nueva_matriz, force_new_game) {

  document.getElementById("timer").style.color = "var(--color_text)"
  document.getElementById("timer").style.textShadow = "0 0 0px #00000000";

  matriz_colores = nueva_matriz;
  size = matriz_colores.length;
  let new_game_flag = true;

  const saved_queens_matrix = localStorage.getItem("matriz_reinas");
  const saved_completed = localStorage.getItem("gameCompleted");
  gameCompleted = saved_completed === "true";

  if (saved_queens_matrix && !force_new_game) {
    try {
      const data = JSON.parse(saved_queens_matrix);
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

  if (!gameCompleted) {
    startTimer(new_game_flag && !gameCompleted);
  } else {
    stopTimer();
  }

  check_win_condition();
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
    const icon = document.createElement('div');
    icon.className = 'board_icons icon_queen';
    icon.dataset.row = row;
    icon.dataset.col = col;
    celda.appendChild(icon);
  } else if (valor === 2) {
    const icon = document.createElement('div');
    icon.className = 'board_icons icon_cross';
    celda.appendChild(icon);
  }
}

function edit_cell(row, col, tipo) {
  if (gameCompleted) return;
  if (!valid_coords(row, col)) return;

  const key = `${row}_${col}`;
  if (lastEdited.has(key)) return;
  lastEdited.add(key);

  if (tipo === 1) {
    matriz_reinas[row][col] = matriz_reinas[row][col] === 1 ? 0 : 1;
  } else if (tipo === 2) {
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

      const newCell = cell.cloneNode(true);
      cell.replaceWith(newCell);

      newCell.addEventListener('mouseenter', () => {
        if (mouseIsDown && !gameCompleted) {
          edit_cell(row, col, mouseButton === 2 ? 2 : 1);
        }
      });

      newCell.addEventListener('click', (e) => {
        if (e.button === 0 && !gameCompleted) {
          edit_cell(row, col, 1);
        }
      });

      newCell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (!gameCompleted) {
          edit_cell(row, col, 2);
        }
      });
    }
  }
}

function empty_board() {
  gameCompleted = false;
  localStorage.setItem("gameCompleted", "false");
  resetInputStates();
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

export function cell_clicked(cell_id) {
  if (gameCompleted) return;
  const [_, row, col] = cell_id.split('_').map(Number);
  edit_cell(row, col, 1);
}

export function cell_right_clicked(cell_id) {
  if (gameCompleted) return;
  const [_, row, col] = cell_id.split('_').map(Number);
  edit_cell(row, col, 2);
}

document.getElementById("clear_board").addEventListener("click", () => {
  if (gameCompleted) return;
  empty_board();
  localStorage.setItem("matriz_reinas", JSON.stringify(matriz_reinas));
  render_board();
});

let invalid_queens = [];
function check_win_condition() {
  if (gameCompleted) return true;

  invalid_queens = [];
  let win_flag = true;
  const queens = [];
  const colorCounts = {};

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const cell = document.getElementById(`cell_${i}_${j}`);
      if (cell) {
        const icon = cell.querySelector('.icon_queen');
        if (icon) icon.classList.remove("invalid_queen");
      }
      if (matriz_reinas[i][j] === 1) {
        const color = matriz_colores[i][j];
        queens.push({ row: i, col: j, color });
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      }
    }
  }

  for (let i = 0; i < queens.length; i++) {
    let queenInvalid = false;
    for (let j = 0; j < queens.length; j++) {
      if (i === j) continue;
      const q1 = queens[i];
      const q2 = queens[j];
      if (q1.row === q2.row || q1.col === q2.col ||
          q1.color === q2.color ||
          (Math.abs(q1.row - q2.row) === 1 && Math.abs(q1.col - q2.col) === 1)) {
        queenInvalid = true;
      }
    }
    if (queenInvalid) {
      invalid_queens.push([queens[i].row, queens[i].col]);
      const icon = document.querySelector(`#cell_${queens[i].row}_${queens[i].col} .icon_queen`);
      if (icon) icon.classList.add("invalid_queen");
      win_flag = false;
    }
  }

  const allColors = new Set(matriz_colores.flat());
  for (const color of allColors) {
    if (colorCounts[color] !== 1) {
      win_flag = false;
      break;
    }
  }

  if (win_flag && queens.length > 0) {
    gameCompleted = true;
    localStorage.setItem("gameCompleted", "true");
    localStorage.setItem("miliseconds", JSON.stringify(getCurrentTime()));
    resetInputStates();
    stopTimer();
    victory_cells();
    document.getElementById("timer").style.color = "#61e82c";
    document.getElementById("timer").style.textShadow = "0 0 10px #61e82c";
  }

  return win_flag;
}

function victory_cells() {
  for (let i = 0; i < size; i++) {
    const delay = i * 0.3; // 0.3s de delay entre filas (ajustable)
    for (let j = 0; j < size; j++) {
      const cell = document.getElementById(`cell_${i}_${j}`);
      if (cell) {
        cell.classList.add("victory_row");
        cell.style.animationDelay = `${delay}s`;
      }
    }
  }
}

