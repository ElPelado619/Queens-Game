export async function obtenerMatrizAleatoria() {
  try {
    const respuesta = await fetch('src\assets\boards\board7x7.txt');

    const lineas = texto
      .trim()
      .split('\n')
      .filter(linea => linea.trim().length > 0);

    const indice = Math.floor(Math.random() * lineas.length);
    const lineaSeleccionada = lineas[indice];

    const matriz = JSON.parse(lineaSeleccionada);
    return matriz;
  } catch (error) {
    console.error('Error al obtener la matriz:', error);
    return null;
  }
}
