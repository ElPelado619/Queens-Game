const VERSION = "0.4.0";

function displayStartupInfo() {
  const startupTime = new Date().toLocaleString();
  const styles = [
    'color: #61dafb',
    'background-color: #222',
    'padding: 4px 8px',
    'border-radius: 4px',
    'font-family: monospace'
  ].join(';');
  
  console.log(
    `%c♕ Queens Game v${VERSION} | ${startupTime} ♕`,
    styles
  );
}

if (typeof window !== 'undefined') {
  displayStartupInfo();
  
  if (performance?.mark) {
    performance.mark('game_init_start');
  }
}
