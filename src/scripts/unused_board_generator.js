export async function getRandomMatrix(size) {

  // Primero generar una solución válida de reinas según reglas:
  // - una reina por fila, sin que estén adyacentes (incluye diagonales y casillas contiguas)
  function isAdjacent(r1, c1, r2, c2) {
    return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
  }

  function isValid(queens) {
    for (let i = 0; i < size; i++) {
      for (let j = i + 1; j < size; j++) {
        if (isAdjacent(i, queens[i], j, queens[j])) return false;
      }
    }
    return true;
  }

  // Generar permutaciones válidas hasta encontrar una al azar
  function generateRandomValidSolution() {
    const base = Array.from({ length: size }, (_, i) => i);

    // Usamos shuffle + check para no recorrer todo
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    let tries = 0;
    while (tries < 10000) {
      shuffle(base);
      if (isValid(base)) return base;
      tries++;
    }
    return null;
  }

  // Generar regiones balanceadas BFS por capas
  function fillBoard(queens) {
    const board = Array.from({ length: size }, () => Array(size).fill(0));
    const regionCount = size;
    const seeds = queens.map((col, row) => ({ row, col, region: row + 1 }));

    // Marcar semillas
    for (const s of seeds) {
      board[s.row][s.col] = s.region;
    }

    // Cola para cada región
    const queues = seeds.map(s => [{ r: s.row, c: s.col }]);

    while (true) {
      let progress = false;

      for (let i = 0; i < regionCount; i++) {
        if (queues[i].length === 0) continue;

        const nextCells = [];
        const { r, c } = queues[i].shift();

        // Vecinos 4-direcciones (arriba, abajo, izquierda, derecha)
        const directions = [
          [-1, 0], [1, 0], [0, -1], [0, 1]
        ];

        for (const [dr, dc] of directions) {
          const nr = r + dr;
          const nc = c + dc;

          if (
            nr >= 0 && nr < size &&
            nc >= 0 && nc < size &&
            board[nr][nc] === 0
          ) {
            board[nr][nc] = seeds[i].region;
            nextCells.push({ r: nr, c: nc });
            progress = true;
          }
        }

        queues[i].push(...nextCells);
      }

      if (!progress) break;
    }

    // Verificar que todas las celdas están asignadas
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (board[r][c] === 0) return null;
      }
    }

    return board;
  }

  // Ejecutar todo

  const solution = generateRandomValidSolution();
  if (!solution) {
    console.error("No se encontró solución válida tras muchos intentos.");
    return null;
  }

  const board = fillBoard(solution);
  if (!board) {
    console.error("No se pudo asignar regiones balanceadas.");
    return null;
  }

  return board;
}
