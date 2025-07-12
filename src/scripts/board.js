document.getElementById('board').oncontextmenu = function(e) {
  e.preventDefault(); //stop context menu from appearing
}

document.addEventListener('DOMContentLoaded', () => {

})

function draw_board(size){  //square size

  board = document.getElementById('board');
  board.innerHTML = '';

  for (let row = 0; row < size; row++) {
    let new_row = document.createElement('tr');
    for (let column = 0; column < size; column++) {
      let cell = document.createElement('td');
      cell.id = 'cell_' + row + '_' + column;
      cell.addEventListener('click', function(){
        cell_clicked(this.id);
      })
      new_row.appendChild(cell);
    }
    board.appendChild(new_row);
  }
}