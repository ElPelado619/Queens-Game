import { getRegionsMatrix } from './read_boards_file.js';
import { start_game } from './game_logic.js';

let colors_matrix = null;
let current_board_number = null;

document.addEventListener("DOMContentLoaded", async () => {
  const saved_color_matrix = localStorage.getItem("colors_matrix");
  current_board_number = localStorage.getItem("current_board_number");
  document.getElementById("board_number").value = parseInt(current_board_number);

  if (saved_color_matrix) {
    colors_matrix = JSON.parse(saved_color_matrix);
    const size = colors_matrix.length;
    draw_board(size, colors_matrix);
    start_game(colors_matrix, false);
  } else {
    if(current_board_number){
      await getNewBoard("by_number");
    }else{
      await getNewBoard("random");
    }
    
  }
  check_number_input();
  if(current_board_number){
    document.getElementById("board_id_text").innerHTML = `Board ID: ${current_board_number}`;
  }
});

document.getElementById("new_game").addEventListener("click", () => getNewBoard("random"));
document.getElementById("load_by_number").addEventListener("click", () => getNewBoard("by_number"));
document.getElementById("board_number").addEventListener("change", () => {
  check_number_input();
});

window.addEventListener('beforeunload', () => {
  localStorage.setItem("current_board_number", current_board_number);
});

function check_number_input(){
  const number = parseInt(document.getElementById("board_number").value);
  const load_button = document.getElementById("load_by_number")
  if (!number || number < 1) {
    load_button.disabled = true;
    load_button.classList.add("disabled");
  }
  else {
    load_button.disabled = false;
    load_button.classList.remove("disabled");
  }
}

async function getNewBoard(type) {
  const size = parseInt(document.getElementById('size').value);
  const difficulty = document.getElementById('difficulty').value;

  let response;

  if(type === "by_number") {
    const boardId = parseInt(document.getElementById('board_number').value);
    response = await getRegionsMatrix(size, difficulty, boardId);
    if(response && response.matrix_key){
      colors_matrix = response.matrix_key;
    }
  }
  else {
    response = await getRegionsMatrix(size, difficulty, null);
    if(response && response.matrix_key){colors_matrix = response.matrix_key;}
  }

  if (colors_matrix && response) {
    draw_board(size, colors_matrix);
    start_game(colors_matrix, true);
    localStorage.setItem("colors_matrix", JSON.stringify(colors_matrix));
    document.getElementById("board_number").value = parseInt(response.board_number);
    document.getElementById("board_id_text").innerHTML = `Board ID: ${response.board_number}`;
    current_board_number = response.board_number;
  } else {
    alert('Couldn\'t get a new board with the chosen settings.');
  }

  if(response && response.board_number){
    localStorage.setItem("current_board_number", response.board_number);
  }
  check_number_input();
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