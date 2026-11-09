// All calls to Claude. The API key is stored only on this device (localStorage)
// and the request goes straight from the browser to the Claude API.
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { BetaMessageParam } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import { z } from "zod";
import { CANTONS, type Mission } from "./content";
import { levelHint, save, state, type ModelId } from "./store";

const PRICES: Record<ModelId, [number, number]> = {
  "claude-opus-5-5": [4, 20],
  "claude-sonnet-5-5": [2, 10],
  "claude-haiku-5-5": [0.1, 0.5],
};

export const MODEL_LABELS: Record<ModelId, string> = {
  "claude-opus-5-5": "Claude Opus 5.5 – beste Qualität",
  "claude-sonnet-5-5": "Claude Sonnet 5.5 – ausgewogen, günstiger",
  "claude-haiku-5-5": "Claude Haiku 5.5 – sehr günstig, einfacher",
};

export class AiError extends Error {}

let client: Anthropic | null = null;
let clientKey = "";

function getClient(): Anthropic {
  const key = state.settings.apiKey.trim();
  if (!key) throw new AiError("Kein API-Schlüssel hinterlegt. Bitte unter «Mehr» eintragen.");
  if (!client || clientKey !== key) {
    // Personal app: the key belongs to the user and never leaves their device
    // except in requests to the Claude API itself.
    client = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true, maxRetries: 2 });
    clientKey = key;
  }
  return client;
}

function systemPrompt(): string {
  const s = state.settings;
  const canton = CANTONS.find((c) => c.id === s.canton) ?? CANTONS[0];
  return [
    "Du bist der Französisch-Coach in der App «Ça joue».",
    `Der Lernende${s.name ? ` heisst ${s.name},` : ""} spricht Deutsch (Deutschschweiz).`,
    "Er hatte 9 Jahre Schulfranzösisch, hat aber fast alles vergessen. Er hasst stures Auswendiglernen und lernt am liebsten praktisch.",
    `Sein Ziel: Smalltalk und Alltagsgespräche mit seiner Freundin${s.partnerName ? ` ${s.partnerName}` : ""} und ihren Kolleginnen aus der Romandie – und verstehen, worüber sie reden.`,
    `Aktuelles Niveau: ${levelHint()}`,
    "",
    "Sprache:",
    `- Verwende immer gesprochenes Schweizer Französisch (Romandie, Kanton ${canton.label}): septante, nonante, für 80 «${canton.eighty}»; déjeuner = Frühstück, dîner = Mittagessen, souper = Abendessen; natel, ça joue, service, à tout bientôt, adieu (als Gruss in der Waadt/Wallis), etc.`,
    "- Umgangssprachlich und natürlich (on statt nous, «ouais» ist ok), aber korrekt. Kein Frankreich-Slang (kein verlan).",
    "- Erklärungen und Übersetzungen auf Deutsch in Schweizer Rechtschreibung (ss statt ß). Kurz, freundlich, ohne Grammatik-Fachbegriffe.",
    "- Fehler sind normal. Korrigiere höchstens den wichtigsten Fehler pro Nachricht, nie Kleinigkeiten wie fehlende Akzente.",
  ].join("\n");
}

function track(usage: { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number | null; cache_creation_input_tokens?: number | null }) {
  const [pin, pout] = PRICES[state.settings.model];
  const input = usage.input_tokens + (usage.cache_creation_input_tokens ?? 0) * 1.25 + (usage.cache_read_input_tokens ?? 0) * 0.1;
  state.usage.inputTokens += usage.input_tokens + (usage.cache_read_input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0);
  state.usage.outputTokens += usage.output_tokens;
  state.usage.costUsd += (input * pin + usage.output_tokens * pout) / 1_000_000;
  save();
}

function explain(err: unknown): never {
  if (err instanceof AiError) throw err;
  if (err instanceof Anthropic.AuthenticationError) throw new AiError("Der API-Schlüssel ist ungültig. Bitte unter «Mehr» prüfen.");
  if (err instanceof Anthropic.PermissionDeniedError) throw new AiError("Kein Zugriff mit diesem API-Schlüssel (Guthaben oder Berechtigung prüfen).");
  if (err instanceof Anthropic.RateLimitError) throw new AiError("Zu viele Anfragen gerade. Warte kurz und versuch es nochmal.");
  if (err instanceof Anthropic.BadRequestError) {
    const msg = err.message.toLowerCase();
    if (msg.includes("credit") || msg.includes("balance")) throw new AiError("Dein API-Guthaben ist aufgebraucht. Lade es in der Claude Console auf.");
    throw new AiError("Anfrage abgelehnt: " + err.message);
  }
  if (err instanceof Anthropic.APIConnectionError) throw new AiError("Keine Verbindung. Bist du online?");
  if (err instanceof Anthropic.APIError) throw new AiError("Fehler vom Claude-Server (" + (err.status ?? "?") + "). Versuch es gleich nochmal.");
  throw new AiError("Unerwarteter Fehler: " + String(err));
}

/** One structured request. `task` is the instruction for this specific call. */
async function ask<T extends z.ZodType>(
  schema: T,
  task: string,
  messages: BetaMessageParam[],
  maxTokens = 4000,
): Promise<z.infer<T>> {
  const model = state.settings.model;
  // Server-side fallbacks retry on another model if a request is declined.
  // Not available for Haiku.
  const fallback =
    model === "claude-haiku-5-5"
      ? {}
      : { betas: ["server-side-fallback-2026-07-01" as const], fallbacks: "default" as const };
  try {
    const res = await getClient().beta.messages.parse({
      model,
      max_tokens: maxTokens,
      system: [
        { type: "text", text: systemPrompt() },
        { type: "text", text: task },
      ],
      messages,
      output_config: { effort: "low", format: betaZodOutputFormat(schema) },
      ...fallback,
    });
    track(res.usage);
    if (res.stop_reason === "refusal") throw new AiError("Claude hat diese Anfrage abgelehnt. Formulier sie anders.");
    if (res.stop_reason === "max_tokens") throw new AiError("Antwort wurde abgeschnitten. Versuch es nochmal.");
    if (res.parsed_output == null) throw new AiError("Antwort konnte nicht gelesen werden. Versuch es nochmal.");
    return res.parsed_output as z.infer<T>;
  } catch (err) {
    explain(err);
  }
}

// ---------- Mission chat ----------

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

const Correction = z
  .object({
    du_hast_geschrieben: z.string().describe("Der fehlerhafte Teil, wie der Lernende ihn geschrieben hat"),
    besser: z.string().describe("Korrigierte, natürliche Version auf Schweizer Französisch"),
    tipp: z.string().describe("Sehr kurze Erklärung auf Deutsch (max. 1 Satz)"),
  })
  .nullable();

export const ChatReply = z.object({
  correction: Correction.describe("Nur bei einem wichtigen Fehler in der letzten Nachricht des Lernenden, sonst null"),
  reply_fr: z.string().describe("Deine Antwort in der Rolle, auf Französisch, 1–3 kurze Sätze"),
  reply_de: z.string().describe("Deutsche Übersetzung deiner Antwort"),
  goal_reached: z.boolean().describe("true, wenn der Lernende das Missionsziel insgesamt erreicht hat"),
});
export type ChatReplyT = z.infer<typeof ChatReply>;

function missionTask(m: Mission): string {
  return [
    "AUFGABE: Rollenspiel (Chat).",
    `Situation: ${m.scenario}`,
    `Deine Rolle: ${m.role}`,
    `Ziel des Lernenden: ${m.goal}`,
    "Regeln:",
    "- Bleib in der Rolle. Antworte kurz (1–3 Sätze), passend zum Niveau, und stell meist eine einfache Frage zurück, damit er weiterreden kann.",
    "- Schreibt der Lernende auf Deutsch oder Englisch, antworte trotzdem in der Rolle auf Französisch und zeig in der Korrektur, wie man es auf Französisch sagt.",
    "- Führe das Gespräch sanft Richtung Ziel. Nach ca. 6–10 Wechseln darf es natürlich zu Ende gehen.",
  ].join("\n");
}

function toMessages(history: ChatTurn[]): BetaMessageParam[] {
  return history.map((t) => ({ role: t.role, content: t.text }));
}

export function startChat(m: Mission): Promise<ChatReplyT> {
  return ask(ChatReply, missionTask(m) + "\n- Jetzt: Eröffne das Gespräch mit einer kurzen Begrüssung/Frage. correction = null.", [
    { role: "user", content: "(Start der Mission)" },
  ]);
}

export function chatReply(m: Mission, history: ChatTurn[]): Promise<ChatReplyT> {
  return ask(ChatReply, missionTask(m), [{ role: "user", content: "(Start der Mission)" }, ...toMessages(history)]);
}

export const Help = z.object({
  suggestions: z
    .array(z.object({ fr: z.string(), de: z.string() }))
    .describe("3 kurze Satzbausteine/Antworten, die der Lernende jetzt sagen könnte, einfach bis etwas anspruchsvoller"),
});

export function help(m: Mission, history: ChatTurn[]): Promise<z.infer<typeof Help>> {
  return ask(
    Help,
    missionTask(m) + "\nJETZT NICHT in der Rolle antworten: Der Lernende weiss nicht weiter. Gib ihm 3 Vorschläge, was er auf die letzte Nachricht antworten könnte.",
    [{ role: "user", content: "(Start der Mission)" }, ...toMessages(history), { role: "user", content: "(Hilfe: Was könnte ich sagen?)" }],
  );
}

export const Feedback = z.object({
  lob: z.string().describe("1–2 Sätze ehrliches, konkretes Lob auf Deutsch"),
  tipps: z
    .array(z.object({ du: z.string(), besser: z.string(), warum: z.string() }))
    .describe("Max. 3 wichtigste Verbesserungen aus dem Gespräch (du = was er geschrieben hat). Leer, wenn nichts Wichtiges."),
  ausdruecke: z
    .array(z.object({ fr: z.string(), de: z.string() }))
    .describe("3–5 nützliche Ausdrücke/Satzbausteine aus dieser Situation zum Merken"),
  satz_des_tages: z
    .object({ fr: z.string(), de: z.string(), kontext: z.string().describe("Wann/wie er den Satz heute seiner Freundin sagen kann, auf Deutsch") })
    .describe("Ein kurzer, alltagstauglicher Satz, den er heute seiner Freundin sagen kann"),
});
export type FeedbackT = z.infer<typeof Feedback>;

export function feedback(m: Mission, history: ChatTurn[]): Promise<FeedbackT> {
  const transcript = history.map((t) => `${t.role === "user" ? "LERNENDER" : "PARTNER"}: ${t.text}`).join("\n");
  return ask(
    Feedback,
    `AUFGABE: Kurzes Feedback nach der Mission «${m.title}» (Ziel: ${m.goal}). Motivierend, ehrlich, kurz.`,
    [{ role: "user", content: "Gesprächsverlauf:\n" + transcript }],
  );
}

// ---------- Listening ----------

export const Dialogue = z.object({
  titel: z.string().describe("Kurzer Titel auf Deutsch"),
  situation: z.string().describe("1 Satz auf Deutsch: wer redet, wo"),
  zeilen: z
    .array(z.object({ sprecher: z.string(), fr: z.string(), de: z.string() }))
    .describe("6–10 Repliken zwischen 2 Freundinnen/Freunden, natürlich, Schweizer Französisch"),
  fragen: z
    .array(
      z.object({
        frage: z.string().describe("Verständnisfrage auf Deutsch"),
        optionen: z.array(z.string()).describe("3 Antwortmöglichkeiten auf Deutsch"),
        richtig: z.number().int().describe("Index der richtigen Option (0-2)"),
      }),
    )
    .describe("2 Verständnisfragen"),
  einstieg: z.string().describe("Auf Deutsch: Wozu soll der Lernende am Ende einen eigenen Satz ins Gespräch einwerfen?"),
});
export type DialogueT = z.infer<typeof Dialogue>;

export function listening(topicHint: string): Promise<DialogueT> {
  return ask(
    Dialogue,
    [
      "AUFGABE: Erstelle ein kurzes Hörverständnis-Gespräch.",
      "Zwei Freundinnen/Freunde aus der Romandie reden miteinander, so wie die Kolleginnen seiner Freundin beim Apéro reden würden.",
      "Natürlich, mit typischen Füllwörtern (bon, ben, ouais, du coup), aber zum Niveau passend. Jede Replik kurz.",
      `Thema: ${topicHint}`,
    ].join("\n"),
    [{ role: "user", content: "Neues Hörgespräch, bitte." }],
  );
}

export const JoinIn = z.object({
  correction: Correction,
  reaktion_fr: z.string().describe("Wie eine der beiden auf seinen Einwurf reagiert, Französisch, 1–2 Sätze"),
  reaktion_de: z.string(),
  lob: z.string().describe("Kurzes Feedback auf Deutsch, 1 Satz"),
});

export function joinIn(d: DialogueT, sentence: string): Promise<z.infer<typeof JoinIn>> {
  const transcript = d.zeilen.map((z) => `${z.sprecher}: ${z.fr}`).join("\n");
  return ask(
    JoinIn,
    `AUFGABE: Der Lernende hat das folgende Gespräch gehört und wirft jetzt einen eigenen Satz ein (${d.einstieg}).\n\n${transcript}`,
    [{ role: "user", content: sentence }],
  );
}

// ---------- Tools ----------

export const HowToSay = z.object({
  fr: z.string().describe("Einfachste natürliche Art, es in der Romandie zu sagen"),
  variante: z.string().nullable().describe("Alternative (z.B. lockerer oder höflicher), sonst null"),
  hinweis: z.string().describe("Kurzer Hinweis auf Deutsch (Schweizer Besonderheit, Verwendung) – 1 Satz"),
  aussprache: z.string().describe("Aussprache-Hilfe für Deutschsprachige, z.B. «sa schu»"),
});

export function howToSay(text: string): Promise<z.infer<typeof HowToSay>> {
  return ask(HowToSay, "AUFGABE: Der Lernende will wissen, wie man etwas auf Französisch sagt. Gib die einfachste, alltagstaugliche Version.", [
    { role: "user", content: text },
  ]);
}

export const Lookup = z.object({
  fr: z.string().describe("Der Ausdruck auf Französisch (korrigierte Schreibweise)"),
  de: z.string().describe("Deutsche Bedeutung"),
  hinweis: z.string().nullable().describe("Kurzer Hinweis, falls nützlich (z.B. typisch Schweiz), sonst null"),
});

export function lookup(text: string): Promise<z.infer<typeof Lookup>> {
  return ask(
    Lookup,
    "AUFGABE: Der Lernende hat einen Ausdruck aufgeschnappt (vermutlich von seiner Freundin) oder will einen speichern. Er kann ihn falsch geschrieben, nach Gehör notiert oder auf Deutsch eingegeben haben. Gib die korrekte französische Form und die Bedeutung.",
    [{ role: "user", content: text }],
    1500,
  );
}

export const DailyPhraseSchema = z.object({
  fr: z.string(),
  de: z.string(),
  kontext: z.string().describe("Wann/wie er den Satz heute seiner Freundin sagen kann, auf Deutsch"),
});

export function dailyPhrase(): Promise<z.infer<typeof DailyPhraseSchema>> {
  const day = new Date().toLocaleDateString("de-CH", { weekday: "long" });
  return ask(
    DailyPhraseSchema,
    `AUFGABE: Gib einen kurzen, liebevollen oder alltäglichen Satz, den er heute (${day}) seiner Freundin auf Französisch sagen kann. Abwechslungsreich, nicht kitschig.`,
    [{ role: "user", content: "Satz des Tages, bitte." }],
    1500,
  );
}
