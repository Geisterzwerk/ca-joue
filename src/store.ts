// Local persistence (localStorage). Everything stays on the device.
import { STARTER_EXPRESSIONS } from "./content";

export type ModelId = "claude-opus-5-5" | "claude-sonnet-5-5" | "claude-haiku-5-5";

export interface Expression {
  id: string;
  fr: string;
  de: string;
  note?: string;
  source: "start" | "mission" | "freundin" | "nachschlagen";
  /** Leitner box 0..5 */
  box: number;
  /** ISO date (YYYY-MM-DD) when it is due again */
  due: string;
  added: string;
}

export interface DailyPhrase {
  date: string;
  fr: string;
  de: string;
  context: string;
}

export interface State {
  version: 1;
  settings: {
    apiKey: string;
    model: ModelId;
    name: string;
    partnerName: string;
    canton: string;
    autoSpeak: boolean;
    rate: number;
  };
  missions: Record<string, { count: number; last: string }>;
  activeDays: string[];
  sessionsDone: number;
  expressions: Expression[];
  daily: DailyPhrase | null;
  usage: { inputTokens: number; outputTokens: number; costUsd: number };
}

const KEY = "cajoue-state-v1";
const INTERVALS = [0, 1, 3, 7, 14, 30];

export function today(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function fresh(): State {
  const t = today();
  return {
    version: 1,
    settings: { apiKey: "", model: "claude-opus-5-5", name: "", partnerName: "", canton: "VD", autoSpeak: false, rate: 0.9 },
    missions: {},
    activeDays: [],
    sessionsDone: 0,
    expressions: STARTER_EXPRESSIONS.map((e) => ({
      id: uid(),
      fr: e.fr,
      de: e.de,
      source: "start" as const,
      box: 0,
      due: t,
      added: t,
    })),
    daily: null,
    usage: { inputTokens: 0, outputTokens: 0, costUsd: 0 },
  };
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      const base = fresh();
      return {
        ...base,
        ...parsed,
        settings: { ...base.settings, ...parsed.settings },
        usage: { ...base.usage, ...parsed.usage },
      };
    }
  } catch {
    /* ignore corrupt state */
  }
  return fresh();
}

export const state: State = load();

export function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked */
  }
}

export function resetAll(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  location.reload();
}

export function exportJson(): string {
  return JSON.stringify(state, null, 2);
}

export function importJson(json: string): void {
  const parsed = JSON.parse(json) as State;
  if (parsed.version !== 1 || !Array.isArray(parsed.expressions)) throw new Error("Ungültige Datei");
  localStorage.setItem(KEY, JSON.stringify(parsed));
  location.reload();
}

// ---- expressions / spaced repetition ----

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9' ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function addExpression(
  fr: string,
  de: string,
  source: Expression["source"],
  note?: string,
): boolean {
  const key = norm(fr);
  if (!key || state.expressions.some((e) => norm(e.fr) === key)) return false;
  const t = today();
  state.expressions.unshift({ id: uid(), fr, de, note, source, box: 0, due: addDays(t, 1), added: t });
  save();
  return true;
}

export function removeExpression(id: string): void {
  state.expressions = state.expressions.filter((e) => e.id !== id);
  save();
}

export function dueExpressions(limit: number): Expression[] {
  const t = today();
  return state.expressions
    .filter((e) => e.due <= t)
    .sort((a, b) => a.box - b.box || a.due.localeCompare(b.due))
    .slice(0, limit);
}

export function review(id: string, knew: boolean): void {
  const e = state.expressions.find((x) => x.id === id);
  if (!e) return;
  e.box = knew ? Math.min(e.box + 1, INTERVALS.length - 1) : 0;
  e.due = addDays(today(), knew ? INTERVALS[e.box] : 1);
  save();
}

/** Similarity 0..1 between two French strings, ignoring accents and punctuation. */
export function similarity(a: string, b: string): number {
  const x = norm(a).replace(/…|\.\.\./g, "");
  const y = norm(b).replace(/…|\.\.\./g, "");
  if (!x || !y) return 0;
  const dp: number[] = Array.from({ length: y.length + 1 }, (_, i) => i);
  for (let i = 1; i <= x.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= y.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (x[i - 1] === y[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return 1 - dp[y.length] / Math.max(x.length, y.length);
}

// ---- progress ----

export function markActive(): void {
  const t = today();
  if (!state.activeDays.includes(t)) state.activeDays.push(t);
  save();
}

export function streak(): number {
  const days = new Set(state.activeDays);
  let n = 0;
  let d = today();
  if (!days.has(d)) d = addDays(d, -1);
  while (days.has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export function completeMission(id: string): void {
  const m = state.missions[id] ?? { count: 0, last: "" };
  m.count++;
  m.last = today();
  state.missions[id] = m;
  save();
}

export function learnedCount(): number {
  return state.expressions.filter((e) => e.box >= 3).length;
}

export function levelHint(): string {
  const done = Object.keys(state.missions).length;
  if (done < 3) return "absoluter Anfänger (A0). Sehr kurze, einfache Sätze, Präsens, häufigste Wörter.";
  if (done < 7) return "Anfänger (A1). Kurze Sätze, Präsens und passé composé, Alltagswortschatz.";
  return "Anfänger mit Grundlagen (A1–A2). Normale kurze Sätze, etwas mehr Umgangssprache.";
}
