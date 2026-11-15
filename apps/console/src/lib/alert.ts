let audio: AudioContext | undefined;

/** Short synthesized beep; avoids shipping audio assets. */
export function playAlert(kind: 'info' | 'warning'): void {
  try {
    audio ??= new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.frequency.value = kind === 'warning' ? 440 : 880;
    gain.gain.setValueAtTime(0.15, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.4);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.4);
  } catch {
    // Audio may be blocked until user interaction; alerts are best-effort.
  }
}
