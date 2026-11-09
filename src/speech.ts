// Text-to-speech (built into iOS) and speech recognition (Safari, when available).

let voices: SpeechSynthesisVoice[] = [];

function loadVoices() {
  if (!("speechSynthesis" in window)) return;
  voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("fr"));
  // Prefer Swiss, then France, then the rest
  const rank = (v: SpeechSynthesisVoice) => {
    const l = v.lang.toLowerCase();
    return (l.includes("ch") ? 0 : l.includes("fr-fr") ? 1 : 2) + (v.localService ? 0 : 0.5);
  };
  voices.sort((a, b) => rank(a) - rank(b));
}

if ("speechSynthesis" in window) {
  loadVoices();
  speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
}

export function canSpeak(): boolean {
  return "speechSynthesis" in window;
}

export let speechRate = 0.9;
export function setRate(r: number) {
  speechRate = r;
}

/** Speak French text. voiceIndex lets dialogues use two different voices. Resolves when done. */
export function speak(text: string, voiceIndex = 0, rate = speechRate): Promise<void> {
  return new Promise((resolve) => {
    if (!canSpeak()) return resolve();
    if (!voices.length) loadVoices();
    const u = new SpeechSynthesisUtterance(text.replace(/^[A-ZÀ-ÿa-z]+:\s*/, ""));
    u.lang = "fr-FR";
    if (voices.length) {
      u.voice = voices[voiceIndex % voices.length];
      u.lang = u.voice.lang;
    }
    // If only one voice exists, vary pitch so two speakers sound different
    if (voices.length < 2 && voiceIndex % 2 === 1) u.pitch = 1.25;
    u.rate = rate;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if (canSpeak()) speechSynthesis.cancel();
}

// ---- recognition ----

interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function recognitionCtor(): (new () => Recognition) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => Recognition) | null;
}

export function canListen(): boolean {
  return recognitionCtor() !== null;
}

/** Listen once in French. Resolves with the transcript (alternatives joined by "|"), rejects on error. */
export function listenOnce(): { result: Promise<string[]>; stop: () => void } {
  const Ctor = recognitionCtor();
  if (!Ctor) return { result: Promise.reject(new Error("unsupported")), stop: () => {} };
  const rec = new Ctor();
  rec.lang = "fr-CH";
  rec.interimResults = false;
  rec.continuous = false;
  rec.maxAlternatives = 3;
  const result = new Promise<string[]>((resolve, reject) => {
    let got: string[] = [];
    rec.onresult = (e) => {
      const r = e.results[0];
      got = Array.from({ length: r.length }, (_, i) => r[i].transcript);
    };
    rec.onerror = (e) => reject(new Error(e.error));
    rec.onend = () => resolve(got);
  });
  try {
    rec.start();
  } catch (e) {
    return { result: Promise.reject(e as Error), stop: () => {} };
  }
  return { result, stop: () => rec.stop() };
}
