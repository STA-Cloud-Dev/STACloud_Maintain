const clock = document.querySelector("#clock");
const portalStatus = document.querySelector("#portal-check-status");
const portalCountdown = document.querySelector("#portal-countdown");
const portalUrl = "https://portal.stacloud.dev/";
const portalCheckIntervalMs = 60_000;
let secondsUntilPortalCheck = portalCheckIntervalMs / 1000;

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

function updatePortalCountdown() {
  if (!portalStatus || !portalCountdown) {
    return;
  }

  portalCountdown.textContent = String(secondsUntilPortalCheck);
  portalStatus.firstChild.textContent = "Sẽ tự kiểm tra lại portal.stacloud.dev sau ";
}

function checkPrimaryPortal() {
  if (portalStatus) {
    portalStatus.setAttribute("aria-live", "polite");
    portalStatus.textContent = "Đang chuyển đến portal.stacloud.dev để kiểm tra trạng thái...";
  }

  window.location.assign(portalUrl);
}

updatePortalCountdown();
window.setInterval(() => {
  secondsUntilPortalCheck -= 1;

  if (secondsUntilPortalCheck <= 0) {
    checkPrimaryPortal();
    return;
  }

  updatePortalCountdown();
}, 1000);
