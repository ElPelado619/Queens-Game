let miliseconds = 0;
let interval = null;

const time_text = document.getElementById("timer");

export function startTimer(start_from_zero) {
  clearInterval(interval); // Evita múltiples timers

  if (start_from_zero || !localStorage.getItem("miliseconds")) {
    miliseconds = 0;
  } else {
    const saved = JSON.parse(localStorage.getItem("miliseconds"));
    miliseconds = typeof saved === "number" ? saved : 0;
  }

  interval = setInterval(updateTime, 10);
}

function updateTime() {
  miliseconds += 10;

  const total_seconds = Math.floor(miliseconds / 1000);
  const hours = Math.floor(total_seconds / 3600);
  const minutes = Math.floor((total_seconds % 3600) / 60);
  const seconds = total_seconds % 60;
  const centiseconds = Math.floor((miliseconds % 1000) / 10); // centésimas (00–99)

  const formattedTime = 
    `${String(hours).padStart(2, "0")}:` +
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}.` +
    `${String(centiseconds).padStart(2, "0")}`;

  time_text.textContent = formattedTime;
  localStorage.setItem("miliseconds", JSON.stringify(miliseconds));
}

export function stopTimer() {
  clearInterval(interval);
  interval = null;
}

export function resetTimer() {
  stopTimer();
  miliseconds = 0;
  localStorage.removeItem("miliseconds");
  time_text.textContent = "00:00:00.00";
}
