import "./style.css";
import { CANTONS, DAILY, DIALOGUES, MISSIONS, PHRASEBOOK, type Dialogue, type Mission, type Phrase, type Step } from "./content";
import { canListen, canSpeak, listenOnce, speak, stopSpeaking } from "./speech";
import {
  addExpression,
  completeMission,
  dueExpressions,
  exportJson,
  hasKeyword,
  importJson,
  learnedCount,
  markActive,
  norm,
  removeExpression,
  resetAll,
  review,
  save,
  similarity,
  state,
  streak,
  today,
  type Expression,
} from "./store";

// ---------- tiny DOM helper ----------

type Child = Node | string | null | undefined | false;
type Props = Record<string, unknown> & { class?: string };

function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Props | null = null, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === "class") el.className = String(v);
      else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v as EventListener);
      else if (k in el && typeof v !== "string") (el as unknown as Record<string, unknown>)[k] = v;
      else el.setAttribute(k, String(v));
    }
  }
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

const app = document.getElementById("app")!;
type Tab = "heute" | "missionen" | "ausdruecke" | "mehr";
let currentTab: Tab = "heute";

/** Fill in the learner's personal placeholders. */
function fill(s: string): string {
  const canton = CANTONS.find((c) => c.id === state.settings.canton) ?? CANTONS[0];
  return s
    .replace(/\{name\}/g, state.settings.name || "Luca")
    .replace(/\{copine\}/g, state.settings.partnerName || "Sarah")
    .replace(/\{80\}/g, canton.eighty);
}

function speakBtn(text: string, voice = 0): HTMLButtonElement {
  return h("button", {
    class: "icon-btn",
    "aria-label": "Vorlesen",
    onclick: (e: MouseEvent) => {
      e.stopPropagation();
      stopSpeaking();
      void speak(text, voice, state.settings.rate);
    },
  }, "🔊");
}

function frRow(text: string, voice = 0, extraClass = ""): HTMLElement {
  return h("div", { class: "fr row " + extraClass }, h("span", null, text), speakBtn(text, voice));
}

function toast(msg: string) {
  const t = h("div", { class: "toast" }, msg);
  document.body.append(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, 2000);
}

function saveExpr(p: Phrase, source: Expression["source"], note?: string) {
  toast(addExpression(p.fr, p.de, source, note) ? "Gespeichert ✓" : "Schon gespeichert");
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- layout ----------

function shell(title: string, body: Node, opts: { back?: () => void; tabs?: boolean } = {}) {
  stopSpeaking();
  app.replaceChildren(
    h("header", { class: "top" }, opts.back ? h("button", { class: "back", onclick: opts.back, "aria-label": "Zurück" }, "‹") : null, h("h1", null, title)),
    h("main", { class: opts.tabs === false ? "notabs" : "" }, body),
    opts.tabs === false ? "" : tabBar(),
  );
  window.scrollTo(0, 0);
}

function tabBar(): HTMLElement {
  const tabs: [Tab, string, string][] = [
    ["heute", "☀️", "Heute"],
    ["missionen", "🎭", "Missionen"],
    ["ausdruecke", "📒", "Ausdrücke"],
    ["mehr", "⚙️", "Mehr"],
  ];
  return h("nav", { class: "tabs" },
    ...tabs.map(([id, icon, label]) => h("button", { class: id === currentTab ? "active" : "", onclick: () => go(id) }, h("span", null, icon), label)));
}

function go(tab: Tab) {
  currentTab = tab;
  if (!state.settings.onboarded) return onboarding();
  ({ heute: home, missionen: missionList, ausdruecke: expressions, mehr: settings })[tab]();
}

// ---------- onboarding ----------

function cantonSelect(): HTMLSelectElement {
  const sel = h("select", null, ...CANTONS.map((c) => h("option", { value: c.id }, c.label)));
  sel.value = state.settings.canton;
  return sel;
}

function onboarding() {
  const name = h("input", { type: "text", placeholder: "z.B. Luca", value: state.settings.name });
  const partner = h("input", { type: "text", placeholder: "z.B. Sarah", value: state.settings.partnerName });
  const canton = cantonSelect();
  shell("Willkommen", h("div", { class: "stack" },
    h("div", { class: "hero" }, h("div", { class: "big" }, "🇨🇭 Ça joue"), h("p", null, "Französisch für die Romandie – praktisch, 10 Minuten am Tag.")),
    h("label", null, "Dein Vorname", name),
    h("label", null, "Name deiner Freundin", partner),
    h("label", null, "Woher kommt sie?", canton),
    h("p", { class: "hint" }, "Die Namen kommen in den Übungen vor. Alles bleibt nur auf diesem iPhone."),
    h("button", { class: "btn primary", onclick: () => {
      state.settings.name = name.value.trim();
      state.settings.partnerName = partner.value.trim();
      state.settings.canton = canton.value;
      state.settings.onboarded = true;
      save();
      go("heute");
    } }, "Los geht's"),
  ), { tabs: false });
}

// ---------- home ----------

function nextMission(): Mission {
  return MISSIONS.find((m) => !state.missions[m.id]) ??
    MISSIONS.slice().sort((a, b) => (state.missions[a.id]?.last ?? "").localeCompare(state.missions[b.id]?.last ?? ""))[0];
}

function nextDialogue(): Dialogue {
  return DIALOGUES[Math.floor(state.sessionsDone / 2) % DIALOGUES.length];
}

function dailyPhrase() {
  const dayNo = Math.floor(Date.now() / 86400000);
  return DAILY[dayNo % DAILY.length];
}

function home() {
  currentTab = "heute";
  const doneToday = state.activeDays.includes(today());
  const listeningDay = state.sessionsDone % 2 === 1;
  const m = nextMission();
  const p = dailyPhrase();

  shell("Ça joue", h("div", { class: "stack" },
    h("div", { class: "stats" },
      h("div", null, h("b", null, String(streak())), h("span", null, "Tage am Stück")),
      h("div", null, h("b", null, `${Object.keys(state.missions).length}/${MISSIONS.length}`), h("span", null, "Situationen")),
      h("div", null, h("b", null, String(learnedCount())), h("span", null, "Ausdrücke sitzen"))),
    h("div", { class: "card session" },
      h("div", { class: "label" }, doneToday ? "✅ Heute schon geübt" : "Deine 10 Minuten"),
      h("h2", null, listeningDay ? `👂 ${nextDialogue().titel}` : `${m.emoji} ${m.title}`),
      h("p", { class: "hint" }, "Aufwärmen → " + (listeningDay ? "Hörgespräch" : "Chat-Mission") + " → Aussprache → Satz des Tages"),
      h("button", { class: "btn primary", onclick: session }, doneToday ? "Noch eine Session" : "Session starten")),
    h("div", { class: "card daily" },
      h("div", { class: "label" }, `❤️ Satz des Tages${state.settings.partnerName ? " für " + state.settings.partnerName : ""}`),
      frRow(p.fr), h("div", { class: "de" }, p.de), h("p", { class: "hint" }, p.kontext)),
    h("div", { class: "quick" },
      h("button", { class: "card tile", onclick: howToSayScreen }, h("span", null, "💬"), "Wie sag ich das?"),
      h("button", { class: "card tile", onclick: () => listeningPicker() }, h("span", null, "👂"), "Mithören"),
      h("button", { class: "card tile", onclick: () => addExpressionScreen(() => go("heute")) }, h("span", null, "➕"), "Ausdruck von ihr"),
      h("button", { class: "card tile", onclick: () => go("missionen") }, h("span", null, "🎭"), "Alle Missionen")),
  ));
}

// ---------- daily session ----------

function session() {
  const steps: ((next: () => void) => void)[] = [];
  const collected: Phrase[] = [];
  let pronunciation: string[] = [];

  const due = dueExpressions(4);
  if (due.length) steps.push((next) => warmup(due, next));

  if (state.sessionsDone % 2 === 1) {
    const d = nextDialogue();
    pronunciation = shuffle(d.zeilen.map((z) => z.fr).filter((s) => s.length < 60)).slice(0, 2);
    steps.push((next) => listeningScreen(d, next, true));
  } else {
    const m = nextMission();
    pronunciation = shuffle(m.steps.map((s) => fill(s.examples[0]))).slice(0, 2);
    steps.push((next) => missionScreen(m, next, (phrases) => collected.push(...phrases)));
  }
  steps.push((next) => pronounce(pronunciation, next));
  steps.push(() => sessionDone(collected));

  let i = 0;
  const run = () => steps[i++]?.(run);
  run();
}

function progressBar(step: number, total: number): HTMLElement {
  return h("div", { class: "progress" }, h("div", { style: `width:${Math.round((step / total) * 100)}%` }));
}

function warmup(items: Expression[], next: () => void) {
  let i = 0;
  const body = h("div", { class: "stack" });
  shell("Aufwärmen", body, { back: () => go("heute"), tabs: false });

  const render = () => {
    if (i >= items.length) return next();
    const e = items[i];
    const input = h("input", { type: "text", placeholder: "Auf Französisch…", autocapitalize: "off", autocomplete: "off", spellcheck: false });
    const result = h("div");
    const actions = h("div", { class: "row gap" });
    const finish = (knew: boolean) => {
      review(e.id, knew);
      input.disabled = true;
      actions.replaceChildren(h("button", { class: "btn primary", onclick: () => { i++; render(); } }, "Weiter"));
      void speak(e.fr, 0, state.settings.rate);
    };
    const check = () => {
      if (!input.value.trim()) return;
      const sim = similarity(input.value, e.fr);
      const good = sim >= 0.8;
      const close = !good && sim >= 0.55;
      result.replaceChildren(h("div", { class: "result " + (good ? "ok" : close ? "close" : "bad") },
        h("b", null, good ? "Richtig! 🎉" : close ? "Fast! 👌" : "Noch nicht ganz"), frRow(e.fr)));
      finish(good || close);
    };
    input.addEventListener("keydown", (ev) => { if (ev.key === "Enter") check(); });
    actions.append(
      h("button", { class: "btn ghost", onclick: () => {
        result.replaceChildren(h("div", { class: "result bad" }, h("b", null, "So heisst es:"), frRow(e.fr)));
        finish(false);
      } }, "Weiss nicht"),
      h("button", { class: "btn primary", onclick: check }, "Prüfen"),
    );
    body.replaceChildren(
      progressBar(i, items.length),
      h("p", { class: "hint" }, "Wie sagst du das auf Französisch? Ungefähr reicht – Akzente egal."),
      h("div", { class: "card prompt" }, h("div", { class: "de big" }, e.de)),
      input, result, actions,
    );
    input.focus();
  };
  render();
}

function pronounce(sentences: string[], next: () => void) {
  const list = sentences.filter(Boolean).slice(0, 2);
  if (!list.length || !canSpeak()) return next();
  let i = 0;
  const body = h("div", { class: "stack" });
  shell("Aussprache", body, { back: () => go("heute"), tabs: false });

  const render = () => {
    if (i >= list.length) return next();
    const s = list[i];
    const out = h("div");
    const controls = h("div", { class: "row gap wrap" },
      h("button", { class: "btn", onclick: () => void speak(s, 0, state.settings.rate) }, "🔊 Anhören"),
      h("button", { class: "btn", onclick: () => void speak(s, 0, 0.6) }, "🐢 Langsam"));
    if (canListen()) {
      const mic = h("button", { class: "btn primary" }, "🎤 Nachsprechen");
      mic.onclick = async () => {
        mic.disabled = true;
        mic.textContent = "🎙️ Ich höre zu…";
        stopSpeaking();
        try {
          const alts = await listenOnce().result;
          const score = Math.round(alts.reduce((acc, a) => Math.max(acc, similarity(a, s)), 0) * 100);
          out.replaceChildren(h("div", { class: "result " + (score >= 75 ? "ok" : score >= 50 ? "close" : "bad") },
            h("b", null, score >= 75 ? `Super! ${score}% 🎉` : score >= 50 ? `Gut! ${score}% – nochmal?` : `${score}% – hör nochmal genau hin`),
            h("p", { class: "hint" }, alts[0] ? `Verstanden: «${alts[0]}»` : "Ich habe nichts verstanden – sprich etwas lauter.")));
        } catch (e) {
          out.replaceChildren(h("p", { class: "hint" }, (e as Error).message === "not-allowed"
            ? "Mikrofon nicht erlaubt. In Safari erlauben – oder einfach leise nachsprechen."
            : "Spracherkennung klappt hier gerade nicht. Sprich einfach nach und geh weiter."));
        }
        mic.disabled = false;
        mic.textContent = "🎤 Nochmal";
      };
      controls.append(mic);
    }
    body.replaceChildren(
      progressBar(i, list.length),
      h("p", { class: "hint" }, "Hör zu und sprich laut nach. Im Zug? Flüstern geht auch."),
      h("div", { class: "card prompt" }, h("div", { class: "fr big" }, s)),
      controls, out,
      h("button", { class: "btn ghost", onclick: () => { i++; render(); } }, i + 1 < list.length ? "Nächster Satz" : "Fertig"),
    );
    void speak(s, 0, state.settings.rate);
  };
  render();
}

function sessionDone(collected: Phrase[]) {
  state.sessionsDone++;
  markActive();
  let added = 0;
  for (const c of collected) if (addExpression(c.fr, c.de, "mission")) added++;
  const p = dailyPhrase();
  shell("Geschafft", h("div", { class: "stack" },
    h("div", { class: "hero" }, h("div", { class: "big" }, "🎉"), h("h2", null, "Bravo, c'est fait !"),
      h("p", null, `${streak()} Tag(e) am Stück.${added ? ` ${added} neue Ausdrücke gespeichert.` : ""}`)),
    h("div", { class: "card daily" },
      h("div", { class: "label" }, `❤️ Sag das heute ${state.settings.partnerName || "deiner Freundin"}`),
      frRow(p.fr), h("div", { class: "de" }, p.de), h("p", { class: "hint" }, p.kontext)),
    h("button", { class: "btn primary", onclick: () => go("heute") }, "Zur Übersicht"),
  ), { tabs: false });
}

// ---------- mission (guided chat) ----------

type Verdict = "good" | "close" | "miss";

function evaluate(answer: string, step: Step): Verdict {
  const examples = step.examples.map(fill);
  const groups = step.accept.map((g) => g.map(fill));
  const matched = groups.filter((g) => g.some((kw) => hasKeyword(answer, kw))).length;
  const sim = Math.max(...examples.map((e) => similarity(answer, e)));
  if (matched === groups.length || sim >= 0.75) return "good";
  if (matched > 0 || sim >= 0.5) return "close";
  return "miss";
}

function looksGerman(text: string): boolean {
  const t = " " + norm(text) + " ";
  return [" ich ", " und ", " bin ", " ist ", " nicht ", " wie ", " das ", " der ", " die "].some((w) => t.includes(w));
}

function missionScreen(m: Mission, onDone: () => void, onPhrases?: (p: Phrase[]) => void) {
  let i = 0;
  let good = 0;
  let tries = 0;
  const log = h("div", { class: "chat" });
  const taskBox = h("div", { class: "task" });
  const input = h("textarea", { rows: 1, placeholder: "Schreib auf Französisch…", autocapitalize: "sentences", spellcheck: false });
  const send = h("button", { class: "send", "aria-label": "Senden" }, "↑");
  const helpBtn = h("button", { class: "chip" }, "💡 Hilfe");
  const skipBtn = h("button", { class: "chip" }, "⏭ Lösung zeigen");
  const inputRow = h("div", { class: "row input-row" }, input, send);
  const composer = h("div", { class: "composer" }, taskBox, h("div", { class: "row gap" }, helpBtn, skipBtn), inputRow);
  const scroll = () => requestAnimationFrame(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }));

  const them = (fr: string, de: string) => {
    const lines = fill(fr).split("\n");
    const deEl = h("div", { class: "de hidden" }, fill(de));
    log.append(h("div", { class: "bubble them" },
      ...lines.map((l) => h("div", { class: "fr" }, l)),
      deEl,
      h("div", { class: "bubble-tools" },
        speakBtn(lines.join(" ")),
        de ? h("button", { class: "icon-btn", onclick: () => deEl.classList.toggle("hidden") }, "🇩🇪") : null)));
    if (state.settings.autoSpeak) void speak(lines.join(" "), 0, state.settings.rate);
  };

  const showStep = () => {
    const step = m.steps[i];
    tries = 0;
    them(step.them, step.themDe);
    taskBox.replaceChildren(h("span", { class: "step-no" }, `${i + 1}/${m.steps.length}`), " 🎯 " + fill(step.task));
    scroll();
    input.focus();
  };

  const advance = () => {
    i++;
    if (i < m.steps.length) {
      setTimeout(showStep, 500);
    } else {
      setTimeout(() => {
        them(m.end.fr, m.end.de);
        log.append(h("div", { class: "goal" }, "🎉 Mission geschafft!"));
        composer.replaceChildren(h("button", { class: "btn primary wide", onclick: finish }, "Weiter zum Feedback"));
        scroll();
      }, 500);
    }
  };

  const respond = () => {
    const text = input.value.trim();
    if (!text || i >= m.steps.length) return;
    input.value = "";
    input.style.height = "";
    const step = m.steps[i];
    log.append(h("div", { class: "bubble me" }, text));
    tries++;
    const v = evaluate(text, step);
    const ex = fill(step.examples[0]);
    if (looksGerman(text) && v !== "good") {
      log.append(h("div", { class: "correction" }, h("div", null, "🇩🇪 Das war Deutsch. Auf Französisch: ", h("b", null, ex), speakBtn(ex)), h("div", { class: "hint" }, "Schreib es ab – so bleibt es hängen.")));
    } else if (v === "good") {
      good++;
      const alt = step.examples.length > 1 ? fill(step.examples[norm(text) === norm(ex) ? 1 : 0]) : null;
      log.append(h("div", { class: "feedback ok" }, h("b", null, ["Super! 👍", "Parfait ! 🎉", "Genau! 💪", "Top! ✨"][i % 4]),
        alt && norm(alt) !== norm(text) ? h("div", { class: "hint" }, "Man kann auch sagen: ", h("b", null, alt), speakBtn(alt)) : null));
      advance();
    } else if (v === "close" || tries >= 2) {
      if (v === "close") good += 0.5;
      log.append(h("div", { class: "correction" }, h("div", null, v === "close" ? "👌 Fast! Natürlicher: " : "So könntest du es sagen: ", h("b", null, ex), speakBtn(ex))));
      advance();
    } else {
      log.append(h("div", { class: "correction" }, h("div", null, "🤔 Das passt noch nicht ganz zur Aufgabe. Versuch's nochmal – oder tipp auf 💡 Hilfe.")));
    }
    scroll();
  };

  send.onclick = respond;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); respond(); }
  });
  input.addEventListener("input", () => {
    input.style.height = "";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  });
  helpBtn.onclick = () => {
    const step = m.steps[i];
    if (!step) return;
    const items = step.help ?? [];
    log.append(h("div", { class: "help" },
      h("div", { class: "label" }, "💡 Bausteine"),
      ...items.map((s) => h("button", { class: "suggestion", onclick: () => { input.value = fill(s.fr).replace(/\s*\(.*\)\s*$/, "").replace(/…/g, "").trim() + " "; input.focus(); } },
        h("div", { class: "fr" }, fill(s.fr)), h("div", { class: "de" }, fill(s.de)))),
      items.length ? null : h("p", { class: "hint" }, "Beispiel: " + fill(step.examples[0]))));
    scroll();
  };
  skipBtn.onclick = () => {
    const step = m.steps[i];
    if (!step) return;
    const ex = fill(step.examples[0]);
    log.append(h("div", { class: "correction" }, h("div", null, "So könntest du sagen: ", h("b", null, ex), speakBtn(ex)), h("div", { class: "hint" }, "Schreib es ab – so bleibt es hängen.")));
    tries = 2;
    scroll();
  };

  const finish = () => {
    const pct = Math.round((good / m.steps.length) * 100);
    if (pct >= 50) completeMission(m.id);
    const phrases: Phrase[] = [];
    for (const s of m.steps) for (const p of s.help ?? []) if (!p.fr.includes("…") && phrases.length < 6) phrases.push({ fr: fill(p.fr), de: fill(p.de) });
    if (onPhrases) onPhrases(phrases);
    else {
      for (const p of phrases) addExpression(p.fr, p.de, "mission");
      markActive();
    }
    shell("Feedback", h("div", { class: "stack" },
      h("div", { class: "hero" }, h("div", { class: "big" }, pct >= 80 ? "🏆" : pct >= 50 ? "👏" : "💪"),
        h("h2", null, pct >= 80 ? "Excellent !" : pct >= 50 ? "Bien joué !" : "Bon début !"),
        h("p", null, `${Math.round(good)} von ${m.steps.length} Antworten gut.`),
        h("p", { class: "hint" }, pct >= 50 ? "Situation gemeistert ✓ – wiederhol sie in ein paar Tagen." : "Mach die Mission bald nochmal – beim zweiten Mal geht's leichter.")),
      h("div", { class: "card" }, h("div", { class: "label" }, "📝 Musterantworten"),
        ...m.steps.map((s) => h("div", { class: "tip" }, h("div", { class: "hint" }, fill(s.task)), frRow(fill(s.examples[0]))))),
      phrases.length ? h("div", { class: "card" }, h("div", { class: "label" }, "📒 Zum Merken" + (onPhrases ? "" : " (gespeichert)")),
        ...phrases.map((a) => h("div", { class: "expr" }, frRow(a.fr), h("div", { class: "de" }, a.de)))) : "",
      h("button", { class: "btn primary", onclick: onDone }, onPhrases ? "Weiter zur Aussprache" : "Fertig"),
    ), { tabs: false });
  };

  shell(m.title, h("div", { class: "chat-wrap" },
    h("div", { class: "mission-goal" }, h("b", null, `${m.emoji} ${m.title}`), h("div", null, m.goal), h("div", { class: "hint" }, "Du schreibst mit: " + fill(m.role))),
    log), { back: () => { if (i === 0 || confirm("Mission verlassen?")) onDone(); }, tabs: false });
  app.append(composer);
  showStep();
}

// ---------- listening ----------

function listeningPicker() {
  shell("Mithören", h("div", { class: "stack" },
    h("p", { class: "hint" }, "Gespräche, wie sie ihre Kolleginnen beim Apéro führen. Wähl eins aus."),
    ...DIALOGUES.map((d) => h("button", { class: "card mission", onclick: () => listeningScreen(d, listeningPicker) },
      h("span", { class: "emoji" }, "👂"), h("div", null, h("b", null, d.titel), h("div", { class: "hint" }, d.situation))))),
    { back: () => go("heute"), tabs: false });
}

function listeningScreen(d: Dialogue, onDone: () => void, inSession = false) {
  const speakers = [...new Set(d.zeilen.map((z) => z.sprecher))];
  let showText = false;
  let showDe = false;
  let slow = true;
  let playing = false;

  const lines = h("div", { class: "lines" });
  const drawLines = () => {
    lines.replaceChildren(...d.zeilen.map((z) => {
      const v = speakers.indexOf(z.sprecher);
      return h("div", { class: "line" + (v % 2 ? " b" : "") },
        h("div", { class: "who" }, z.sprecher),
        h("div", { class: "fr" }, showText ? z.fr : "• • •"),
        showDe ? h("div", { class: "de" }, z.de) : null,
        h("div", { class: "bubble-tools" }, speakBtn(z.fr, v),
          showText ? h("button", { class: "icon-btn", "aria-label": "Merken", onclick: () => saveExpr({ fr: z.fr, de: z.de }, "mission") }, "➕") : null));
    }));
  };
  drawLines();

  const playBtn = h("button", { class: "btn primary" }, "▶️ Abspielen");
  playBtn.onclick = async () => {
    if (playing) {
      playing = false;
      stopSpeaking();
      playBtn.textContent = "▶️ Abspielen";
      return;
    }
    playing = true;
    playBtn.textContent = "⏹ Stopp";
    for (const z of d.zeilen) {
      if (!playing) break;
      await speak(z.fr, speakers.indexOf(z.sprecher), slow ? 0.75 : 1.0);
    }
    playing = false;
    playBtn.textContent = "▶️ Nochmal";
  };
  const toggle = (label: () => string, fn: () => void) => {
    const b = h("button", { class: "chip" }, label());
    b.onclick = () => { fn(); b.textContent = label(); drawLines(); };
    return b;
  };

  const questions = h("div", { class: "stack" });
  for (const q of d.fragen) {
    const opts = h("div", { class: "options" });
    q.optionen.forEach((o, idx) => {
      const b = h("button", { class: "option" }, o);
      b.onclick = () => {
        opts.querySelectorAll("button").forEach((x, j) => {
          (x as HTMLButtonElement).disabled = true;
          if (j === q.richtig) x.classList.add("right");
        });
        if (idx !== q.richtig) b.classList.add("wrong");
      };
      opts.append(b);
    });
    questions.append(h("div", { class: "card" }, h("b", null, q.frage), opts));
  }

  const join = h("textarea", { rows: 2, placeholder: "Dein Satz auf Französisch…", spellcheck: false });
  const joinOut = h("div");
  const joinBtn = h("button", { class: "btn" }, "Einwerfen");
  joinBtn.onclick = () => {
    if (!join.value.trim()) return;
    joinOut.replaceChildren(
      h("div", { class: "feedback ok" }, h("b", null, "Bravo, du hast dich eingemischt! 🙌"),
        h("div", { class: "hint" }, looksGerman(join.value) ? "Das war noch Deutsch – probier's mit den Beispielen unten." : "Vergleich deinen Satz mit diesen Beispielen:")),
      ...d.beispiele.map((b) => frRow(b, 0, "example")),
    );
    markActive();
  };

  shell("Mithören", h("div", { class: "stack" },
    h("div", { class: "card" }, h("h2", null, "👂 " + d.titel), h("p", { class: "hint" }, d.situation)),
    h("p", { class: "hint" }, "1. Hör zuerst ohne Text zu. Wie viel verstehst du?"),
    h("div", { class: "row gap wrap" }, playBtn,
      toggle(() => (slow ? "🐢 Langsam" : "🐇 Normal"), () => { slow = !slow; }),
      toggle(() => (showText ? "🙈 Text aus" : "👀 Text"), () => { showText = !showText; }),
      toggle(() => (showDe ? "🇩🇪 aus" : "🇩🇪 Übersetzung"), () => { showDe = !showDe; showText = showText || showDe; })),
    lines,
    h("p", { class: "hint" }, "2. Hast du's verstanden?"),
    questions,
    h("div", { class: "card" }, h("div", { class: "label" }, "3. Misch dich ein!"), h("p", null, d.einstieg), join, joinBtn, joinOut),
    h("button", { class: "btn primary", onclick: onDone }, inSession ? "Weiter" : "Fertig"),
  ), { back: onDone, tabs: false });
}

// ---------- missions ----------

function missionList() {
  currentTab = "missionen";
  shell("Missionen", h("div", { class: "stack" },
    h("p", { class: "hint" }, "Situationen aus deinem Alltag mit ihr und ihren Kolleginnen. Tipp eine an, um sie zu üben."),
    ...MISSIONS.map((m) => {
      const p = state.missions[m.id];
      return h("button", { class: "card mission", onclick: () => missionScreen(m, () => go("missionen")) },
        h("span", { class: "emoji" }, m.emoji),
        h("div", null, h("b", null, m.title), h("div", { class: "hint" }, m.goal)),
        h("span", { class: "badge" + (p ? " done" : "") }, p ? `✓ ${p.count}×` : "neu"));
    }),
  ));
}

// ---------- expressions ----------

function expressions() {
  currentTab = "ausdruecke";
  const list = h("div", { class: "stack" });
  const draw = () => {
    list.replaceChildren(...state.expressions.map((e) =>
      h("div", { class: "card expr" },
        h("div", { class: "fr row" }, h("span", null, e.fr), h("span", { class: "row" }, speakBtn(e.fr),
          h("button", { class: "icon-btn", "aria-label": "Löschen", onclick: () => { if (confirm(`«${e.fr}» löschen?`)) { removeExpression(e.id); draw(); } } }, "🗑"))),
        e.de ? h("div", { class: "de" }, e.de) : null,
        e.note ? h("div", { class: "hint" }, e.note) : null,
        h("div", { class: "meter" }, ...[1, 2, 3, 4, 5].map((n) => h("i", { class: n <= e.box ? "on" : "" })),
          e.source === "freundin" ? h("span", { class: "tag" }, "❤️ von ihr") : null))));
  };
  draw();
  shell("Meine Ausdrücke", h("div", { class: "stack" },
    h("div", { class: "row gap" },
      h("button", { class: "btn primary", onclick: () => addExpressionScreen(() => go("ausdruecke")) }, "➕ Ausdruck von ihr"),
      h("button", { class: "btn", onclick: howToSayScreen }, "💬 Wie sag ich…?")),
    h("p", { class: "hint" }, `${state.expressions.length} Ausdrücke. Die Punkte zeigen, wie gut einer sitzt – fällige kommen automatisch beim Aufwärmen.`),
    list,
  ));
}

function addExpressionScreen(back: () => void) {
  const fr = h("input", { type: "text", placeholder: "z.B. Y'a pas le feu au lac.", spellcheck: false, autocapitalize: "off" });
  const de = h("input", { type: "text", placeholder: "z.B. Es eilt nicht. (frag sie!)" });
  const note = h("input", { type: "text", placeholder: "optional, z.B. wann sie es sagt" });
  shell("Ausdruck von ihr", h("div", { class: "stack" },
    h("p", { class: "hint" }, "Etwas von ihr oder ihren Kolleginnen aufgeschnappt? Schreib es auf – und frag sie gleich, was es heisst. 😉"),
    h("label", null, "Auf Französisch", fr),
    h("label", null, "Bedeutung auf Deutsch", de),
    h("label", null, "Notiz", note),
    h("div", { class: "row gap" },
      h("button", { class: "btn", onclick: () => { if (fr.value.trim()) void speak(fr.value, 0, state.settings.rate); } }, "🔊 Anhören"),
      h("button", { class: "btn primary", onclick: () => {
        if (!fr.value.trim()) return toast("Bitte den französischen Ausdruck eintragen");
        saveExpr({ fr: fr.value.trim(), de: de.value.trim() }, "freundin", note.value.trim() || undefined);
        back();
      } }, "Speichern")),
  ), { back, tabs: false });
  fr.focus();
}

function howToSayScreen() {
  const back = () => go(currentTab);
  const input = h("input", { type: "search", placeholder: "Suchen, z.B. «Rechnung», «müde», «Liebe»", autocomplete: "off" });
  const results = h("div", { class: "stack" });
  const cats = [...new Set(PHRASEBOOK.map((e) => e.cat))];
  let cat = "";
  const catBar = h("div", { class: "row gap wrap" });

  const entryCard = (e: (typeof PHRASEBOOK)[number]) => {
    const fr = fill(e.fr);
    return h("div", { class: "card expr" },
      h("div", { class: "hint" }, e.de),
      h("div", { class: "fr row big" }, h("span", null, fr), h("span", { class: "row" }, speakBtn(fr),
        h("button", { class: "icon-btn", "aria-label": "Merken", onclick: () => saveExpr({ fr, de: e.de }, "nachschlagen", e.note) }, "➕"))),
      e.note ? h("div", { class: "hint" }, "💡 " + fill(e.note)) : null);
  };

  const draw = () => {
    const words = norm(input.value).split(" ").filter(Boolean);
    let list = PHRASEBOOK;
    if (words.length) {
      list = PHRASEBOOK.filter((e) => {
        const hay = norm(`${e.de} ${e.tags ?? ""} ${e.fr} ${e.cat}`);
        return words.every((w) => hay.includes(w));
      });
    } else if (cat) list = PHRASEBOOK.filter((e) => e.cat === cat);
    catBar.replaceChildren(...cats.map((c) => h("button", { class: "chip" + (c === cat && !words.length ? " active" : ""), onclick: () => { cat = cat === c ? "" : c; input.value = ""; draw(); } }, c)));
    results.replaceChildren(...(list.length ? list.map(entryCard) : [h("p", { class: "hint" }, "Nichts gefunden. Versuch ein anderes Wort – oder frag deine Freundin und speichere es unter «Ausdruck von ihr».")]));
  };
  input.addEventListener("input", draw);
  draw();
  shell("Wie sag ich das?", h("div", { class: "stack" }, input, catBar, results), { back, tabs: false });
}

// ---------- settings ----------

function settings() {
  currentTab = "mehr";
  const s = state.settings;
  const name = h("input", { type: "text", value: s.name });
  const partner = h("input", { type: "text", value: s.partnerName });
  const canton = cantonSelect();
  const auto = h("input", { type: "checkbox", checked: s.autoSpeak });
  const rate = h("input", { type: "range", min: "0.5", max: "1.2", step: "0.05", value: String(s.rate) });
  const fileIn = h("input", { type: "file", accept: "application/json", style: "display:none" });
  fileIn.onchange = async () => {
    const f = fileIn.files?.[0];
    if (!f) return;
    try { importJson(await f.text()); } catch (e) { toast((e as Error).message); }
  };
  const persist = () => {
    s.name = name.value.trim();
    s.partnerName = partner.value.trim();
    s.canton = canton.value;
    s.autoSpeak = auto.checked;
    s.rate = Number(rate.value);
    save();
  };
  for (const el of [name, partner, canton, auto, rate]) el.addEventListener("change", persist);

  shell("Mehr", h("div", { class: "stack" },
    h("div", { class: "card stack" },
      h("div", { class: "label" }, "Über dich"),
      h("label", null, "Dein Vorname", name),
      h("label", null, "Name deiner Freundin", partner),
      h("label", null, "Kanton (Wortwahl, z.B. huitante)", canton)),
    h("div", { class: "card stack" },
      h("div", { class: "label" }, "Sprache"),
      h("label", { class: "row check" }, auto, "Im Chat automatisch vorlesen"),
      h("label", null, "Vorlese-Tempo", rate),
      h("button", { class: "btn small", onclick: () => void speak("Salut ! Ça joue ? On se voit ce soir pour le souper ?", 0, Number(rate.value)) }, "🔊 Test"),
      h("p", { class: "hint" }, "Tipp: Unter iPhone-Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Französisch kannst du eine bessere Stimme laden.")),
    h("div", { class: "card stack" },
      h("div", { class: "label" }, "Daten"),
      h("p", { class: "hint" }, "Alles wird nur auf diesem iPhone gespeichert. Mach ab und zu ein Backup."),
      h("div", { class: "row gap wrap" },
        h("button", { class: "btn small", onclick: () => {
          const blob = new Blob([exportJson()], { type: "application/json" });
          h("a", { href: URL.createObjectURL(blob), download: `ca-joue-backup-${today()}.json` }).click();
        } }, "Backup speichern"),
        h("button", { class: "btn small", onclick: () => fileIn.click() }, "Backup laden"),
        h("button", { class: "btn small danger", onclick: () => { if (confirm("Wirklich alles löschen?")) resetAll(); } }, "Alles zurücksetzen")),
      fileIn),
    h("p", { class: "hint center" }, "Ça joue · v0.2 · ohne KI, ohne Kosten"),
  ));
}

// ---------- boot ----------

go("heute");

if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
