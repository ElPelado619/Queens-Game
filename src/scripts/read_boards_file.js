export async function obtenerMatrizAleatoria(size) {
  try {
    let respuesta;

    switch (size) {
      case 7:
        respuesta = await fetch('src/assets/boards/boards7.txt');
        break;
      case 8:
        respuesta = await fetch('src/assets/boards/boards8.txt');
        break;
      case 9:
        respuesta = await fetch('src/assets/boards/boards9.txt');
        break;
      case 10:
        respuesta = await fetch('src/assets/boards/boards10.txt');
        break;
      default:
        throw new Error("Board size of " + size + " not valid");
    }
   
    const texto = await respuesta.text();

    const lineas = texto
      .trim()
      .split('\n')
      .filter(linea => linea.trim().length > 0);

    const indice = Math.floor(Math.random() * lineas.length);
    const lineaSeleccionada = lineas[indice];

    const matriz = JSON.parse(lineaSeleccionada);
    return matriz;
  } catch (error) {
    console.error('Could not load the board:', error);
    return null;
  }
}
