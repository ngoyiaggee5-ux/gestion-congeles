export function playStockAlertSound() {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.value = 0.08;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
    oscillator.stop(context.currentTime + 0.35);
  } catch {
    /* ignore */
  }
}

export function dispatchStockAlert(product, remainingStock) {
  window.dispatchEvent(
    new CustomEvent("mbala:stock-alert", {
      detail: { product, remainingStock },
    })
  );
  playStockAlertSound();
}
