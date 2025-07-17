export async function getRandomMatrix(size) {
  try {
    let answer;

    switch (size) {
      case 7:
        answer = await fetch('src/assets/boards/boards7.txt');
        break;
      case 8:
        answer = await fetch('src/assets/boards/boards8.txt');
        break;
      case 9:
        answer = await fetch('src/assets/boards/boards9.txt');
        break;
      case 10:
        answer = await fetch('src/assets/boards/boards10.txt');
        break;
      default:
        throw new Error("Board size of " + size + " not valid");
    }
   
    const text = await answer.text();

    const lines = text
      .trim()
      .split('\n')
      .filter(linea => linea.trim().length > 0);

    const index = Math.floor(Math.random() * lines.length);
    const selectedLines = lines[index];

    const matrix = JSON.parse(selectedLines);
    return matrix;
  } catch (error) {
    console.error('Could not load the board:', error);
    return null;
  }
}
