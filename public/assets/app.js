const clock = document.querySelector("#clock");

function formatTime(date) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "medium"
  }).format(date);
}

function updateClock() {
  if (!clock) {
    return;
  }

  clock.textContent = `Cập nhật lúc ${formatTime(new Date())}`;
}

updateClock();
window.setInterval(updateClock, 1000);
