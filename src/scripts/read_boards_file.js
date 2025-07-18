export async function getRandomMatrix(size) {
  try {
    const basePath = (import.meta.env.BASE_URL || '/') + 'boards/';
    let fileName;

    switch (size) {
      case 7: fileName = 'boards7.txt'; break;
      case 8: fileName = 'boards8.txt'; break;
      case 9: fileName = 'boards9.txt'; break;
      case 10: fileName = 'boards10.txt'; break;
      default: throw new Error("Invalid board size: " + size);
    }

    const response = await fetch(basePath + fileName);
    if (!response.ok) throw new Error(`Failed to load ${fileName}`);
    
    const text = await response.text();
    const lines = text.trim().split('\n').filter(line => line.trim());
    const randomLine = lines[Math.floor(Math.random() * lines.length)];
    
    return JSON.parse(randomLine);
  } catch (error) {
    console.error('Board loading error:', error);
    return null; // or return a default board
  }
}