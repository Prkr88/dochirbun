export function playFartSound() {
  const audioGlobal = globalThis as typeof globalThis & {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const AudioContextClass = audioGlobal.AudioContext ?? audioGlobal.webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  const audioContext = new AudioContextClass();
  const duration = 0.38;
  const sampleRate = audioContext.sampleRate;
  const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
  const channel = buffer.getChannelData(0);

  for (let index = 0; index < channel.length; index += 1) {
    const progress = index / channel.length;
    const wobble = Math.sin(progress * Math.PI * 18) * 0.35;
    const lowBuzz = Math.sin(progress * Math.PI * 90 + wobble) * 0.55;
    const noise = (Math.random() * 2 - 1) * 0.22;
    const envelope = Math.sin(progress * Math.PI);

    channel[index] = (lowBuzz + noise) * envelope;
  }

  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(180, audioContext.currentTime);
  filter.frequency.exponentialRampToValueAtTime(70, audioContext.currentTime + duration);

  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.32, audioContext.currentTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);
  source.start();
  source.stop(audioContext.currentTime + duration);
  source.onended = () => void audioContext.close();
}
