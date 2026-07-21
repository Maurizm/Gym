export const timer = {
  endTime: null,
  intervalId: null,
  onTick: null,
  onComplete: null,

  start(seconds) {
    this.stop();
    this.endTime = Date.now() + seconds * 1000;

    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
    this.tick(); // Initial tick
  },

  tick() {
    if (!this.endTime) return;
    const now = Date.now();
    const remainingMs = this.endTime - now;

    if (remainingMs <= 0) {
      this.stop();
      if (this.onComplete) this.onComplete();
      return;
    }

    const remainingSecs = Math.ceil(remainingMs / 1000);
    if (this.onTick) this.onTick(remainingSecs);
  },

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.endTime = null;
  },

  format(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
};

// Handle visibility change to ensure timer updates correctly when returning to the app
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && timer.endTime) {
    timer.tick();
  }
});
