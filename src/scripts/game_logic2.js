import { startTimer, stopTimer, getCurrentTime } from './timer.js';
import { playSound } from './audio.js';

let queens_matrix = [];
let colors_matrix = null;
let size = null;
let gameCompleted = false;

let mouseIsDown = false;
let mouseButton = null;
let lastEdited = new Set();
let lastEditedTimeout = null;
let isInitialClick = true; // Track initial clicks for sound control
let rightClickStartedInBoard = false;
let rightClickMode = null; //'draw' or 'erase'

let marker_type = "cross" //cross, flag

document.getElementById("switch_marker").addEventListener("click", change_marker_type);

document.addEventListener("keydown", function(event) {
  if (event.key === " ") {
    change_marker_type();
  }
});

function change_marker_type() {
  const marker_button = document.getElementById("switch_marker");
  if (marker_type === "cross") {
    marker_type = "flag";
    marker_button.innerHTML = '<img src="src/assets/images/flag.svg" class="switch_marker_image flag" alt="Change marker button"></img>'
  }
  else {
    marker_type = "cross";
    marker_button.innerHTML = '<img src="src/assets/images/cross.svg" class="switch_marker_image cross" alt="Change marker button"></img>'
  }
}

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
  isInitialClick = true;

  const cell = e.target.closest('td');
  if (cell && cell.id) {
    const idParts = cell.id.split('_');
    if (idParts.length >= 3) {
      const row = Number(idParts[1]);
      const col = Number(idParts[2]);

      if (mouseButton === 2) {
        rightClickStartedInBoard = true;
        rightClickMode = queens_matrix[row] && queens_matrix[row][col] === 2 ? 'erase' : 'draw';
      }
      edit_cell(row, col, mouseButton === 0 ? 1 : 2);
    }
  } else {
    if (mouseButton === 2) {
      rightClickStartedInBoard = false;
    }
  }
});

// Prevents context menu from appearing while dragging from inside the board to outside it
document.addEventListener('contextmenu', (e) => {
  if (rightClickStartedInBoard) {
    e.preventDefault();
  }
  rightClickStartedInBoard = false;
});


document.addEventListener('mouseup', (e) => {
  if (e.button === mouseButton) {
    mouseIsDown = false;
    mouseButton = null;
    rightClickMode = null;
    lastEditedTimeout = setTimeout(() => lastEdited.clear(), 50);
  }
});

document.getElementById("board").addEventListener('contextmenu', (e) => e.preventDefault());
document.getElementById("board_table").addEventListener('contextmenu', (e) => e.preventDefault());

function resetInputStates() {
  mouseIsDown = false;
  mouseButton = null;
  lastEdited.clear();
  isInitialClick = true;

  if (lastEditedTimeout) {
    clearTimeout(lastEditedTimeout);
    lastEditedTimeout = null;
  }
}

export async function start_game(nueva_matriz, force_new_game) {
  if (!nueva_matriz) return;
  document.getElementById("timer").style.color = "var(--color_text)";
  document.getElementById("timer").style.textShadow = "0 0 0px #00000000";

  colors_matrix = nueva_matriz;
  size = colors_matrix.length;
  let new_game_flag = true;

  const saved_queens_matrix = localStorage.getItem("queens_matrix");
  const saved_completed = localStorage.getItem("gameCompleted");
  gameCompleted = saved_completed === "true";

  if (saved_queens_matrix && !force_new_game) {
    try {
      const data = JSON.parse(saved_queens_matrix);
      if (Array.isArray(data) && data.length === size) {
        queens_matrix = data;
        new_game_flag = false;
      } else {
        throw new Error("Invalid size");
      }
    } catch {
      empty_board("all");
      localStorage.setItem("queens_matrix", JSON.stringify(queens_matrix));
    }
  } else {
    empty_board("all");
    localStorage.setItem("queens_matrix", JSON.stringify(queens_matrix));
  }

  render_board();
  add_drag_listeners();

  if (!gameCompleted) {
    startTimer(new_game_flag && !gameCompleted);
  } else {
    stopTimer();
  }

  check_win_condition();
}

function render_board() {
  invalid_queens = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      render_icon(row, col);
    }
  }
}

function render_icon(row, col) {
  const cell = document.getElementById(`cell_${row}_${col}`);
  if (!cell) return;

  const valor = queens_matrix[row][col];
  cell.innerHTML = '';

  if (valor === 1) {
    const icon = document.createElement('div');
    icon.className = 'board_icons icon_queen';
    icon.dataset.row = row;
    icon.dataset.col = col;
    cell.appendChild(icon);    
  } else if (valor === 2) {
    const icon = document.createElement('div');
    icon.className = 'board_icons icon_cross';
    cell.appendChild(icon);
  } else if (valor === 3) {
    const icon = document.createElement('div');
    icon.className = 'board_icons icon_flag';
    cell.appendChild(icon);
  }
}

function edit_cell(row, col, type) {
  if (gameCompleted) return;
  if (!valid_coords(row, col)) return;

  const key = `${row}_${col}`;
  if (lastEdited.has(key)) return;
  lastEdited.add(key);

  const previousValue = queens_matrix[row][col];
  
  if (type === 1) {

    const wasQueen = queens_matrix[row][col] === 1;
    queens_matrix[row][col] = wasQueen ? 0 : 1;

    if (isInitialClick) {
      if (queens_matrix[row][col] === 1) {
        playSound('place');
      } else if (wasQueen) {
        playSound('remove');
      }
    }
  } else if (type === 2) {
    const desiredValue = marker_type === "flag" ? 3 : 2;
    queens_matrix[row][col] = (queens_matrix[row][col] === desiredValue) ? 0 : desiredValue;
  }


  isInitialClick = false;
  render_icon(row, col);
  localStorage.setItem("queens_matrix", JSON.stringify(queens_matrix));
  check_win_condition();
}

function add_drag_listeners() {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = document.getElementById(`cell_${row}_${col}`);
      if (!cell) continue;

      const newCell = cell.cloneNode(true);
      cell.replaceWith(newCell);

      newCell.addEventListener('mouseenter', () => {
        if (mouseIsDown && !gameCompleted) {
          if (mouseButton === 2) {
            const currentValue = queens_matrix[row][col];
          if (rightClickMode === 'draw') {
            const desiredValue = marker_type === "flag" ? 3 : 2;
            if (currentValue !== desiredValue) {
              edit_cell(row, col, 2);
            }
          } else if (rightClickMode === 'erase') {
            const isMarker = currentValue === 2 || currentValue === 3;
            if (isMarker) {
              queens_matrix[row][col] = 0;
              render_icon(row, col);
              localStorage.setItem("queens_matrix", JSON.stringify(queens_matrix));
            }
          }

          } else {
            edit_cell(row, col, 1);
          }
        }
      });

      newCell.addEventListener('click', (e) => {
        if (e.button === 0 && !gameCompleted) {
          isInitialClick = true; // Force sound for click
          edit_cell(row, col, 1);
        }
      });

      newCell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (!gameCompleted) {
          isInitialClick = true; // Force sound for right-click
          edit_cell(row, col, 2);
        }
      });
    }
  }
}

function empty_board(type) {
  resetInputStates();

  if (type === "crosses") {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if(queens_matrix[row][col] === 2){
          queens_matrix[row][col] = 0;
          const cell = document.getElementById(`cell_${row}_${col}`);
          if (cell) cell.innerHTML = '';
        }
      }
    }
  }
  else if (type === "flags") {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if(queens_matrix[row][col] === 3){
          queens_matrix[row][col] = 0;
          const cell = document.getElementById(`cell_${row}_${col}`);
          if (cell) cell.innerHTML = '';
        }
      }
    }
  }
  else {
    gameCompleted = false;
    localStorage.setItem("gameCompleted", "false");
    queens_matrix = [];
    for (let row = 0; row < size; row++) {
      queens_matrix[row] = [];
      for (let col = 0; col < size; col++) {
        queens_matrix[row][col] = 0;
        const cell = document.getElementById(`cell_${row}_${col}`);
        if (cell) cell.innerHTML = '';
      }
    }
  }

}

function valid_coords(row, col) {
  return row >= 0 && row < size && col >= 0 && col < size;
}

export function cell_clicked(cell_id) {
  if (gameCompleted) return;
  const [_, row, col] = cell_id.split('_').map(Number);
  isInitialClick = true; // Ensure sound plays
  edit_cell(row, col, 1);
}

export function cell_right_clicked(cell_id) {
  if (gameCompleted) return;
  const [_, row, col] = cell_id.split('_').map(Number);
  isInitialClick = true; // Ensure sound plays
  edit_cell(row, col, 2);
}

document.getElementById("clear_board").addEventListener("click", () => {
  if (gameCompleted) return;
  empty_board("all");
  localStorage.setItem("queens_matrix", JSON.stringify(queens_matrix));
  render_board();
  check_win_condition();
});

document.getElementById("clear_crosses").addEventListener("click", () => {
  if (gameCompleted) return;
  empty_board("crosses");
  localStorage.setItem("queens_matrix", JSON.stringify(queens_matrix));
  render_board();
  check_win_condition();
});

document.getElementById("clear_flags").addEventListener("click", () => {
  if (gameCompleted) return;
  empty_board("flags");
  localStorage.setItem("queens_matrix", JSON.stringify(queens_matrix));
  render_board();
  check_win_condition();
});

let invalid_queens = [];
function check_win_condition() {
  if (gameCompleted || !colors_matrix) return false;

  invalid_queens = [];
  let win_flag = true;
  const queens = [];
  const colorCounts = {};

  const allColors = colors_matrix && colors_matrix.flat ? new Set(colors_matrix.flat()) : new Set();
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const cell = document.getElementById(`cell_${i}_${j}`);
      if (cell) {
        const icon = cell.querySelector('.icon_queen');
        if (icon) icon.classList.remove("invalid_queen");
      }
      if (queens_matrix[i][j] === 1) {
        const color = colors_matrix[i][j];
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
    playSound('win');
    victory_cells();
    document.getElementById("timer").style.color = "var(--timer_victory_color)";
    document.getElementById("timer").style.textShadow = "0 0 10px #61e82c";
  }

  return win_flag;
}

function victory_cells() {
  for (let i = 0; i < size; i++) {
    const delay = i * 0.3;
    for (let j = 0; j < size; j++) {
      const cell = document.getElementById(`cell_${i}_${j}`);
      if (cell) {
        cell.classList.add("victory_row");
        cell.style.animationDelay = `${delay}s`;
      }
    }
  }
}