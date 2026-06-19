let fartAudio: HTMLAudioElement | undefined;

export function playFartSound() {
  fartAudio ??= new Audio("/apebble-fart-5-228245.mp3");
  fartAudio.currentTime = 0;

  void fartAudio.play().catch(() => {
    // Browsers may block audio if the click gesture is interrupted.
  });
}
