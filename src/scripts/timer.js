let miliseconds = 0;
let interval = null;

const time_text = document.getElementById("timer");

export function startTimer(start_from_zero) {
  clearInterval(interval);

  const gameCompleted = localStorage.getItem("gameCompleted") === "true";
  const saved = JSON.parse(localStorage.getItem("miliseconds"));

  if (saved !== null && typeof saved === "number") {
    miliseconds = saved;
  }

  renderStoredTime();

  if (gameCompleted) {
    return;
  }

  if (start_from_zero) {
    miliseconds = 0;
    localStorage.setItem("miliseconds", JSON.stringify(miliseconds));
    renderStoredTime();
  }

  interval = setInterval(updateTime, 10);
}

function updateTime() {
  miliseconds += 10;
  localStorage.setItem("miliseconds", JSON.stringify(miliseconds));
  
  const total_seconds = Math.floor(miliseconds / 1000);
  const hours = Math.floor(total_seconds / 3600);
  const minutes = Math.floor((total_seconds % 3600) / 60);
  const seconds = total_seconds % 60;
  const centiseconds = Math.floor((miliseconds % 1000) / 10);

  const formattedTime =
    `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}.` +
    `${String(centiseconds).padStart(2, "0")}`;

  time_text.textContent = formattedTime;
}

function renderStoredTime() {
  const total_seconds = Math.floor(miliseconds / 1000);
  const hours = Math.floor(total_seconds / 3600);
  const minutes = Math.floor((total_seconds % 3600) / 60);
  const seconds = total_seconds % 60;
  const centiseconds = Math.floor((miliseconds % 1000) / 10);

  const formattedTime =
    `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}.` +
    `${String(centiseconds).padStart(2, "0")}`;

  time_text.textContent = formattedTime;
}

export function stopTimer() {
  clearInterval(interval);
  interval = null;
}

export function resetTimer() {
  stopTimer();
  miliseconds = 0;
  localStorage.removeItem("miliseconds");
  localStorage.removeItem("gameCompleted");
  time_text.textContent = "00:00:00.00";
}

export function getCurrentTime() {
  return miliseconds;
}