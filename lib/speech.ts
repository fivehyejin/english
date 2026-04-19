export function speak(text: string, lang = 'en-US'): boolean {
  if (typeof window === 'undefined') return false;
  if (!('speechSynthesis' in window)) {
    return false;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
  return true;
}

export function speakSequence(texts: string[], lang = 'en-US'): boolean {
  if (typeof window === 'undefined') return false;
  if (!('speechSynthesis' in window)) {
    return false;
  }
  window.speechSynthesis.cancel();

  const playAt = (idx: number) => {
    if (idx >= texts.length) return;
    const u = new SpeechSynthesisUtterance(texts[idx]);
    u.lang = lang;
    u.rate = 0.9;
    u.onend = () => playAt(idx + 1);
    window.speechSynthesis.speak(u);
  };
  playAt(0);
  return true;
}

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
