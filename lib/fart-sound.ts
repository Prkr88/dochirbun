import type { ReportRating } from "@/types/report";

const fartAudioCache = new Map<ReportRating, HTMLAudioElement>();

export function playFartSound(rating: ReportRating = 3) {
  let audio = fartAudioCache.get(rating);

  if (!audio) {
    audio = new Audio(`/${rating}-star-fart.mp3`);
    fartAudioCache.set(rating, audio);
  }

  audio.currentTime = 0;

  void audio.play().catch(() => {
    // Browsers may block audio if the click gesture is interrupted.
  });
}
