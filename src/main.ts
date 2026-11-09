import "./style.css";
import * as ai from "./ai";
import { CANTONS, FREE_CHAT, MISSIONS, type Mission } from "./content";
import { canListen, canSpeak, listenOnce, speak, stopSpeaking } from "./speech";
import {
  addExpression,
  completeMission,
  dueExpressions,
  exportJson,
  importJson,
  learnedCount,
  markActive,
  removeExpression,
  resetAll,
  review,
  save,
  similarity,
  state,
  streak,
  today,
  type Expression,
  type ModelId,
} from "./store";

// ---------- tiny DOM helper ----------

type Child = Node | string | null | undefined | false;
type Props = Record<string, unknown> & { class?: string; onclick?: (e: MouseEvent) => void };

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
let currentTab: Tab = "heute";
type Tab = "heute" | "missionen" | "ausdruecke" | "mehr";

function speakBtn(text: string, voice = 0, label = "🔊"): HTMLButtonElement {
  return h("button", {
    class: "icon-btn",
    "aria-label": "Vorlesen",
    onclick: (e: MouseEvent) => {
      e.stopPropagation();
      stopSpeaking();
      void speak(text, voice, state.settings.rate);
    },
  }, label);
}

function errorBox(msg: string, retry?: () => void): HTMLElement {
  return h("div", { class: "error" }, h("p", null, "⚠️ " + msg), retry ? h("button", { class: "btn small", onclick: retry }, "Nochmal versuchen") : null);
}

function loading(text = "Moment…"): HTMLElement {
  return h("div", { class: "loading" }, h("span", { class: "dots" }, h("i"), h("i"), h("i")), text);
}

function toast(msg: string) {
  const t = h("div", { class: "toast" }, msg);
  document.body.append(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, 2200);
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
  return h(
    "nav",
    { class: "tabs" },
    ...tabs.map(([id, icon, label]) =>
      h("button", { class: id === currentTab ? "active" : "", onclick: () => go(id) }, h("span", null, icon), label),
    ),
  );
}

function go(tab: Tab) {
  currentTab = tab;
  if (!state.settings.apiKey && tab !== "mehr") return onboarding();
  ({ heute: home, missionen: missionList, ausdruecke: expressions, mehr: settings })[tab]();
}

// ---------- onboarding ----------

function onboarding() {
  const key = h("input", { type: "password", placeholder: "sk-ant-…", autocomplete: "off", value: state.settings.apiKey });
  const name = h("input", { type: "text", placeholder: "z.B. Luca", value: state.settings.name });
  const partner = h("input", { type: "text", placeholder: "optional", value: state.settings.partnerName });
  const canton = cantonSelect();
  const body = h(
    "div",
    { class: "stack" },
    h("div", { class: "hero" }, h("div", { class: "big" }, "🇨🇭 Ça joue"), h("p", null, "Französisch für die Romandie – praktisch, 10 Minuten am Tag.")),
    h("label", null, "Dein Vorname", name),
    h("label", null, "Name deiner Freundin", partner),
    h("label", null, "Woher kommt sie?", canton),
    h("label", null, "Claude API-Schlüssel", key),
    h("p", { class: "hint" }, "Den Schlüssel bekommst du auf console.anthropic.com → API Keys. Er wird nur auf diesem iPhone gespeichert. Details unter «Mehr»."),
    h("button", {
      class: "btn primary",
      onclick: () => {
        state.settings.apiKey = key.value.trim();
        state.settings.name = name.value.trim();
        state.settings.partnerName = partner.value.trim();
        state.settings.canton = canton.value;
        save();
        if (!state.settings.apiKey) return toast("Bitte API-Schlüssel eintragen");
        go("heute");
      },
    }, "Los geht's"),
  );
  shell("Willkommen", body, { tabs: false });
}

function cantonSelect(): HTMLSelectElement {
  const sel = h("select", null, ...CANTONS.map((c) => h("option", { value: c.id }, c.label)));
  sel.value = state.settings.canton;
  return sel;
}

// ---------- home ----------

function nextMission(): Mission {
  return MISSIONS.find((m) => !state.missions[m.id]) ?? MISSIONS.slice().sort((a, b) => (state.missions[a.id]?.last ?? "").localeCompare(state.missions[b.id]?.last ?? ""))[0];
}

function home() {
  currentTab = "heute";
  const doneToday = state.activeDays.includes(today());
  const isListeningDay = state.sessionsDone % 2 === 1;
  const mastered = Object.keys(state.missions).length;
  const daily = state.daily && state.daily.date === today() ? state.daily : null;

  const dailyCard = h("div", { class: "card daily" }, h("div", { class: "label" }, `❤️ Satz des Tages${state.settings.partnerName ? " für " + state.settings.partnerName : ""}`));
  if (daily) {
    dailyCard.append(h("div", { class: "fr row" }, h("span", null, daily.fr), speakBtn(daily.fr)), h("div", { class: "de" }, daily.de), h("p", { class: "hint" }, daily.context));
  } else {
    const btn = h("button", { class: "btn small" }, "Satz holen");
    btn.onclick = async () => {
      btn.replaceWith(loading("Suche einen Satz…"));
      try {
        const p = await ai.dailyPhrase();
        state.daily = { date: today(), fr: p.fr, de: p.de, context: p.kontext };
        save();
        home();
      } catch (e) {
        dailyCard.lastElementChild?.replaceWith(errorBox((e as Error).message));
      }
    };
    dailyCard.append(h("p", { class: "hint" }, "Kommt nach deiner Session – oder hol ihn jetzt."), btn);
  }

  const body = h(
    "div",
    { class: "stack" },
    h(
      "div",
      { class: "stats" },
      h("div", null, h("b", null, String(streak())), h("span", null, "Tage am Stück")),
      h("div", null, h("b", null, `${mastered}/${MISSIONS.length}`), h("span", null, "Situationen")),
      h("div", null, h("b", null, String(learnedCount())), h("span", null, "Ausdrücke sitzen")),
    ),
    h(
      "div",
      { class: "card session" },
      h("div", { class: "label" }, doneToday ? "✅ Heute schon geübt" : "Deine 10 Minuten"),
      h("h2", null, isListeningDay ? "👂 Mithören & mitreden" : `${nextMission().emoji} ${nextMission().title}`),
      h("p", { class: "hint" }, "Aufwärmen → " + (isListeningDay ? "Hörgespräch" : "Chat-Mission") + " → Aussprache → Satz des Tages"),
      h("button", { class: "btn primary", onclick: () => void session() }, doneToday ? "Noch eine Session" : "Session starten"),
    ),
    dailyCard,
    h(
      "div",
      { class: "quick" },
      h("button", { class: "card tile", onclick: howToSayScreen }, h("span", null, "💬"), "Wie sag ich das?"),
      h("button", { class: "card tile", onclick: () => chatScreen(FREE_CHAT, () => go("heute")) }, h("span", null, "🗨️"), "Freies Gespräch"),
      h("button", { class: "card tile", onclick: () => listeningScreen(() => go("heute")) }, h("span", null, "👂"), "Mithören"),
      h("button", { class: "card tile", onclick: () => addExpressionScreen(() => go("heute")) }, h("span", null, "➕"), "Ausdruck von ihr"),
    ),
  );
  shell("Ça joue", body);
}

// ---------- daily session ----------

async function session() {
  const steps: ((next: () => void) => void)[] = [];
  const collected: { fr: string; de: string }[] = [];
  let phrase: { fr: string; de: string; kontext: string } | null = null;
  let pronunciation: string[] = [];

  const due = dueExpressions(4);
  if (due.length) steps.push((next) => warmup(due, next));

  const isListening = state.sessionsDone % 2 === 1;
  if (isListening) {
    steps.push((next) =>
      listeningScreen(next, (d) => {
        pronunciation = d.zeilen.map((z) => z.fr).filter((s) => s.length < 70).slice(0, 6);
      }),
    );
  } else {
    const m = nextMission();
    steps.push((next) =>
      chatScreen(m, next, (fb) => {
        collected.push(...fb.ausdruecke);
        phrase = fb.satz_des_tages;
        pronunciation = fb.ausdruecke.map((a) => a.fr);
      }),
    );
  }
  steps.push((next) => pronounce(pronunciation, next));
  steps.push(() => sessionDone(collected, phrase));

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
      const sim = similarity(input.value, e.fr);
      if (!input.value.trim()) return;
      const good = sim >= 0.8;
      const close = !good && sim >= 0.55;
      result.replaceChildren(
        h("div", { class: "result " + (good ? "ok" : close ? "close" : "bad") },
          h("b", null, good ? "Richtig! 🎉" : close ? "Fast! 👌" : "Noch nicht ganz"),
          h("div", { class: "fr row" }, h("span", null, e.fr), speakBtn(e.fr))),
      );
      finish(good || close);
    };
    input.addEventListener("keydown", (ev) => { if (ev.key === "Enter") check(); });
    actions.append(
      h("button", { class: "btn ghost", onclick: () => {
        result.replaceChildren(h("div", { class: "result bad" }, h("b", null, "So heisst es:"), h("div", { class: "fr row" }, h("span", null, e.fr), speakBtn(e.fr))));
        finish(false);
      } }, "Weiss nicht"),
      h("button", { class: "btn primary", onclick: check }, "Prüfen"),
    );
    body.replaceChildren(
      progressBar(i, items.length),
      h("p", { class: "hint" }, "Wie sagst du das auf Französisch? Ungefähr reicht – Akzente egal."),
      h("div", { class: "card prompt" }, h("div", { class: "de big" }, e.de)),
      input,
      result,
      actions,
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
      h("button", { class: "btn", onclick: () => void speak(s, 0, 0.6) }, "🐢 Langsam"),
    );
    if (canListen()) {
      const mic = h("button", { class: "btn primary" }, "🎤 Nachsprechen");
      mic.onclick = async () => {
        mic.disabled = true;
        mic.textContent = "🎙️ Ich höre zu…";
        stopSpeaking();
        try {
          const alts = await listenOnce().result;
          const best = alts.reduce((acc, a) => Math.max(acc, similarity(a, s)), 0);
          const heard = alts[0] ?? "";
          const score = Math.round(best * 100);
          out.replaceChildren(
            h("div", { class: "result " + (score >= 75 ? "ok" : score >= 50 ? "close" : "bad") },
              h("b", null, score >= 75 ? `Super! ${score}% 🎉` : score >= 50 ? `Gut! ${score}% – nochmal?` : `${score}% – hör nochmal genau hin`),
              heard ? h("p", { class: "hint" }, `Verstanden: «${heard}»`) : h("p", { class: "hint" }, "Ich habe nichts verstanden – sprich etwas lauter.")),
          );
        } catch (e) {
          const msg = (e as Error).message;
          out.replaceChildren(h("p", { class: "hint" }, msg === "not-allowed" ? "Mikrofon nicht erlaubt. In Safari erlauben – oder einfach leise nachsprechen." : "Spracherkennung klappt hier gerade nicht. Sprich einfach nach und geh weiter."));
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
      controls,
      out,
      h("button", { class: "btn ghost", onclick: () => { i++; render(); } }, i + 1 < list.length ? "Nächster Satz" : "Fertig"),
    );
    void speak(s, 0, state.settings.rate);
  };
  render();
}

async function sessionDone(collected: { fr: string; de: string }[], phrase: { fr: string; de: string; kontext: string } | null) {
  state.sessionsDone++;
  markActive();
  let added = 0;
  for (const c of collected) if (addExpression(c.fr, c.de, "mission")) added++;
  const body = h("div", { class: "stack" },
    h("div", { class: "hero" }, h("div", { class: "big" }, "🎉"), h("h2", null, "Bravo, c'est fait !"), h("p", null, `${streak()} Tag(e) am Stück. ${added ? `${added} neue Ausdrücke gespeichert.` : ""}`)),
  );
  const phraseBox = h("div");
  body.append(phraseBox, h("button", { class: "btn primary", onclick: () => go("heute") }, "Zur Übersicht"));
  shell("Geschafft", body, { tabs: false });

  const showPhrase = (p: { fr: string; de: string; kontext: string }) => {
    state.daily = { date: today(), fr: p.fr, de: p.de, context: p.kontext };
    save();
    phraseBox.replaceChildren(
      h("div", { class: "card daily" },
        h("div", { class: "label" }, `❤️ Sag das heute ${state.settings.partnerName || "deiner Freundin"}`),
        h("div", { class: "fr row" }, h("span", null, p.fr), speakBtn(p.fr)),
        h("div", { class: "de" }, p.de),
        h("p", { class: "hint" }, p.kontext)),
    );
  };
  if (phrase) showPhrase(phrase);
  else {
    phraseBox.replaceChildren(loading("Satz des Tages…"));
    try {
      showPhrase(await ai.dailyPhrase());
    } catch {
      phraseBox.replaceChildren();
    }
  }
}

// ---------- chat mission ----------

function chatScreen(m: Mission, onDone: () => void, onFeedback?: (fb: ai.FeedbackT) => void) {
  const history: ai.ChatTurn[] = [];
  const log = h("div", { class: "chat" });
  const input = h("textarea", { rows: 1, placeholder: "Schreib auf Französisch…", autocapitalize: "sentences", spellcheck: false });
  const send = h("button", { class: "send", "aria-label": "Senden" }, "↑");
  const helpBtn = h("button", { class: "chip" }, "💡 Hilfe");
  const endBtn = h("button", { class: "chip" }, "🏁 Beenden");
  let busy = false;
  let goalReached = false;

  const scroll = () => requestAnimationFrame(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }));

  const addAssistant = (r: ai.ChatReplyT) => {
    const de = h("div", { class: "de hidden" }, r.reply_de);
    log.append(
      h("div", { class: "bubble them" },
        h("div", { class: "fr" }, r.reply_fr),
        de,
        h("div", { class: "bubble-tools" },
          speakBtn(r.reply_fr),
          h("button", { class: "icon-btn", onclick: () => de.classList.toggle("hidden") }, "🇩🇪"))),
    );
    if (state.settings.autoSpeak) void speak(r.reply_fr, 0, state.settings.rate);
  };

  const addCorrection = (c: NonNullable<ai.ChatReplyT["correction"]>) => {
    log.append(
      h("div", { class: "correction" },
        h("div", null, h("s", null, c.du_hast_geschrieben), " → ", h("b", null, c.besser), speakBtn(c.besser)),
        h("div", { class: "hint" }, c.tipp)),
    );
  };

  const withBusy = async (fn: () => Promise<void>) => {
    if (busy) return;
    busy = true;
    send.disabled = true;
    const l = loading("");
    log.append(l);
    scroll();
    try {
      await fn();
    } catch (e) {
      log.append(errorBox((e as Error).message));
    } finally {
      l.remove();
      busy = false;
      send.disabled = false;
      scroll();
    }
  };

  const doSend = () => {
    const text = input.value.trim();
    if (!text || busy) return;
    input.value = "";
    input.style.height = "";
    history.push({ role: "user", text });
    log.append(h("div", { class: "bubble me" }, text));
    void withBusy(async () => {
      try {
        const r = await ai.chatReply(m, history);
        if (r.correction) addCorrection(r.correction);
        history.push({ role: "assistant", text: r.reply_fr });
        addAssistant(r);
        if (r.goal_reached && !goalReached) {
          goalReached = true;
          log.append(h("div", { class: "goal" }, "🎯 Ziel erreicht! Du kannst weiterreden oder auf «Beenden» tippen."));
          endBtn.classList.add("pulse");
        }
      } catch (e) {
        history.pop(); // allow retry with the same message
        input.value = text;
        throw e;
      }
    });
  };

  send.onclick = doSend;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  });
  input.addEventListener("input", () => {
    input.style.height = "";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  });

  helpBtn.onclick = () =>
    void withBusy(async () => {
      const r = await ai.help(m, history);
      log.append(
        h("div", { class: "help" },
          h("div", { class: "label" }, "💡 Du könntest sagen:"),
          ...r.suggestions.map((s) =>
            h("button", { class: "suggestion", onclick: () => { input.value = s.fr; input.focus(); } },
              h("div", { class: "fr" }, s.fr), h("div", { class: "de" }, s.de)),
          )),
      );
    });

  endBtn.onclick = () => {
    const userTurns = history.filter((t) => t.role === "user").length;
    if (userTurns < 2) {
      if (confirm("Mission abbrechen? (Noch kein Feedback möglich)")) onDone();
      return;
    }
    void finish();
  };

  const finish = async () => {
    const body = h("div", { class: "stack" }, loading("Ich schaue mir dein Gespräch an…"));
    shell("Feedback", body, { tabs: false });
    try {
      const fb = await ai.feedback(m, history);
      if (m.id !== FREE_CHAT.id && (goalReached || history.length >= 8)) completeMission(m.id);
      onFeedback?.(fb);
      const sessionMode = !!onFeedback;
      if (!sessionMode) {
        for (const a of fb.ausdruecke) addExpression(a.fr, a.de, "mission");
        markActive();
      }
      body.replaceChildren(
        h("div", { class: "card" }, h("div", { class: "label" }, "👏 Gut gemacht"), h("p", null, fb.lob)),
        fb.tipps.length
          ? h("div", { class: "card" }, h("div", { class: "label" }, "🔧 Das nächste Mal"),
            ...fb.tipps.map((t) => h("div", { class: "tip" }, h("div", null, h("s", null, t.du), " → ", h("b", null, t.besser), speakBtn(t.besser)), h("div", { class: "hint" }, t.warum))))
          : "",
        h("div", { class: "card" }, h("div", { class: "label" }, "📒 Zum Merken" + (sessionMode ? "" : " (gespeichert)")),
          ...fb.ausdruecke.map((a) => h("div", { class: "expr" }, h("div", { class: "fr row" }, h("span", null, a.fr), speakBtn(a.fr)), h("div", { class: "de" }, a.de)))),
        h("button", { class: "btn primary", onclick: onDone }, sessionMode ? "Weiter zur Aussprache" : "Fertig"),
      );
    } catch (e) {
      body.replaceChildren(errorBox((e as Error).message, () => void finish()), h("button", { class: "btn ghost", onclick: onDone }, "Ohne Feedback beenden"));
    }
  };

  const goal = h("div", { class: "mission-goal" }, h("b", null, `${m.emoji} ${m.title}`), h("div", null, "🎯 " + m.goal), h("div", { class: "hint" }, "Du schreibst mit: " + m.role));
  const composer = h("div", { class: "composer" }, h("div", { class: "row gap" }, helpBtn, endBtn), h("div", { class: "row input-row" }, input, send));
  const body = h("div", { class: "chat-wrap" }, goal, log);
  shell(m.title, body, { back: () => { if (history.length < 2 || confirm("Mission verlassen?")) onDone(); }, tabs: false });
  app.append(composer);

  void withBusy(async () => {
    const r = await ai.startChat(m);
    history.push({ role: "assistant", text: r.reply_fr });
    addAssistant(r);
  });
}

// ---------- listening ----------

const TOPICS = [
  "Was sie am Wochenende gemacht haben",
  "Ein neues Restaurant in Lausanne",
  "Ferienpläne für den Sommer",
  "Stress bei der Arbeit",
  "Eine Serie, die beide schauen",
  "Ein Ausflug in die Berge bei schönem Wetter",
  "Eine Geburtstagsparty planen",
  "Sport und Fitness",
  "Wohnungssuche in Genf",
  "Ein Konzert oder Festival (Paléo, Montreux Jazz)",
  "Einkaufen und Preise",
  "Was es zum Souper gibt",
];

function listeningScreen(onDone: () => void, onDialogue?: (d: ai.DialogueT) => void) {
  const body = h("div", { class: "stack" }, loading("Ich schreibe ein Gespräch…"));
  shell("Mithören", body, { back: onDone, tabs: false });
  const topic = TOPICS[(state.sessionsDone + new Date().getDate()) % TOPICS.length];

  const load = async () => {
    body.replaceChildren(loading("Ich schreibe ein Gespräch…"));
    try {
      const d = await ai.listening(topic);
      onDialogue?.(d);
      render(d);
    } catch (e) {
      body.replaceChildren(errorBox((e as Error).message, () => void load()));
    }
  };

  const render = (d: ai.DialogueT) => {
    const speakers = [...new Set(d.zeilen.map((z) => z.sprecher))];
    let showText = false;
    let showDe = false;
    let slow = true;
    let playing = false;

    const lines = h("div", { class: "lines" });
    const drawLines = () => {
      lines.replaceChildren(
        ...d.zeilen.map((z) =>
          h("div", { class: "line" + (speakers.indexOf(z.sprecher) % 2 ? " b" : "") },
            h("div", { class: "who" }, z.sprecher),
            h("div", { class: "fr" }, showText ? z.fr : "• • •"),
            showDe ? h("div", { class: "de" }, z.de) : null,
            h("div", { class: "bubble-tools" },
              speakBtn(z.fr, speakers.indexOf(z.sprecher)),
              showText ? h("button", { class: "icon-btn", onclick: () => { if (addExpression(z.fr, z.de, "mission")) toast("Gespeichert ✓"); else toast("Schon gespeichert"); } }, "➕") : null)),
        ),
      );
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
      const rate = slow ? 0.75 : 1.0;
      for (const z of d.zeilen) {
        if (!playing) break;
        await speak(z.fr, speakers.indexOf(z.sprecher), rate);
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
    d.fragen.forEach((q) => {
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
    });

    const join = h("textarea", { rows: 2, placeholder: "Dein Satz auf Französisch…", spellcheck: false });
    const joinOut = h("div");
    const joinBtn = h("button", { class: "btn" }, "Einwerfen");
    joinBtn.onclick = async () => {
      if (!join.value.trim()) return;
      joinBtn.disabled = true;
      joinOut.replaceChildren(loading(""));
      try {
        const r = await ai.joinIn(d, join.value.trim());
        joinOut.replaceChildren(
          r.correction ? h("div", { class: "correction" }, h("div", null, h("s", null, r.correction.du_hast_geschrieben), " → ", h("b", null, r.correction.besser), speakBtn(r.correction.besser)), h("div", { class: "hint" }, r.correction.tipp)) : "",
          h("div", { class: "bubble them" }, h("div", { class: "fr" }, r.reaktion_fr), h("div", { class: "de" }, r.reaktion_de), h("div", { class: "bubble-tools" }, speakBtn(r.reaktion_fr, 1))),
          h("p", { class: "hint" }, r.lob),
        );
        markActive();
      } catch (e) {
        joinOut.replaceChildren(errorBox((e as Error).message));
      }
      joinBtn.disabled = false;
    };

    body.replaceChildren(
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
      h("button", { class: "btn primary", onclick: onDone }, onDialogue ? "Weiter" : "Fertig"),
    );
  };
  void load();
}

// ---------- missions ----------

function missionList() {
  currentTab = "missionen";
  const body = h("div", { class: "stack" },
    h("p", { class: "hint" }, "Situationen aus deinem Alltag mit ihr und ihren Kolleginnen. Tipp eine an, um sie zu üben."),
    ...MISSIONS.map((m) => {
      const p = state.missions[m.id];
      return h("button", { class: "card mission", onclick: () => chatScreen(m, () => go("missionen")) },
        h("span", { class: "emoji" }, m.emoji),
        h("div", null, h("b", null, m.title), h("div", { class: "hint" }, m.goal)),
        h("span", { class: "badge" + (p ? " done" : "") }, p ? `✓ ${p.count}×` : "neu"));
    }),
    h("button", { class: "card mission", onclick: () => chatScreen(FREE_CHAT, () => go("missionen")) },
      h("span", { class: "emoji" }, FREE_CHAT.emoji), h("div", null, h("b", null, FREE_CHAT.title), h("div", { class: "hint" }, "Rede über alles, was dich interessiert."))),
  );
  shell("Missionen", body);
}

// ---------- expressions ----------

function expressions() {
  currentTab = "ausdruecke";
  const list = h("div", { class: "stack" });
  const draw = () => {
    list.replaceChildren(
      ...state.expressions.map((e) =>
        h("div", { class: "card expr" },
          h("div", { class: "fr row" }, h("span", null, e.fr), h("span", { class: "row" }, speakBtn(e.fr),
            h("button", { class: "icon-btn", "aria-label": "Löschen", onclick: () => { if (confirm(`«${e.fr}» löschen?`)) { removeExpression(e.id); draw(); } } }, "🗑"))),
          h("div", { class: "de" }, e.de),
          e.note ? h("div", { class: "hint" }, e.note) : null,
          h("div", { class: "meter" }, ...[1, 2, 3, 4, 5].map((n) => h("i", { class: n <= e.box ? "on" : "" })),
            e.source === "freundin" ? h("span", { class: "tag" }, "❤️ von ihr") : null)),
      ),
    );
  };
  draw();
  const body = h("div", { class: "stack" },
    h("div", { class: "row gap" },
      h("button", { class: "btn primary", onclick: () => addExpressionScreen(() => go("ausdruecke")) }, "➕ Ausdruck von ihr"),
      h("button", { class: "btn", onclick: howToSayScreen }, "💬 Wie sag ich…?")),
    h("p", { class: "hint" }, `${state.expressions.length} Ausdrücke. Die Punkte zeigen, wie gut einer sitzt – fällige kommen automatisch beim Aufwärmen.`),
    list,
  );
  shell("Meine Ausdrücke", body);
}

function addExpressionScreen(back: () => void) {
  const input = h("input", { type: "text", placeholder: "z.B. «y'a pas le feu au lac» oder «sa schu»", spellcheck: false, autocapitalize: "off" });
  const out = h("div");
  const btn = h("button", { class: "btn primary" }, "Nachschlagen");
  btn.onclick = async () => {
    if (!input.value.trim()) return;
    btn.disabled = true;
    out.replaceChildren(loading(""));
    try {
      const r = await ai.lookup(input.value.trim());
      out.replaceChildren(
        h("div", { class: "card" },
          h("div", { class: "fr row big" }, h("span", null, r.fr), speakBtn(r.fr)),
          h("div", { class: "de" }, r.de),
          r.hinweis ? h("p", { class: "hint" }, r.hinweis) : null,
          h("button", { class: "btn primary", onclick: () => {
            if (addExpression(r.fr, r.de, "freundin", r.hinweis ?? undefined)) toast("Gespeichert ✓");
            else toast("Schon gespeichert");
            back();
          } }, "Speichern")),
      );
    } catch (e) {
      out.replaceChildren(errorBox((e as Error).message));
    }
    btn.disabled = false;
  };
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") btn.click(); });
  shell("Ausdruck von ihr", h("div", { class: "stack" },
    h("p", { class: "hint" }, "Etwas aufgeschnappt? Schreib es so auf, wie du es gehört hast – oder auf Deutsch. Die App findet die richtige Form."),
    input, btn, out), { back, tabs: false });
  input.focus();
}

function howToSayScreen() {
  const back = () => go(currentTab);
  const input = h("textarea", { rows: 2, placeholder: "Auf Deutsch, z.B. «Hast du gut geschlafen?»" });
  const out = h("div", { class: "stack" });
  const btn = h("button", { class: "btn primary" }, "Wie sag ich das?");
  btn.onclick = async () => {
    const text = input.value.trim();
    if (!text) return;
    btn.disabled = true;
    out.replaceChildren(loading(""));
    try {
      const r = await ai.howToSay(text);
      out.replaceChildren(
        h("div", { class: "card" },
          h("div", { class: "fr row big" }, h("span", null, r.fr), speakBtn(r.fr)),
          h("div", { class: "hint" }, "🗣 " + r.aussprache),
          r.variante ? h("div", { class: "fr row" }, h("span", null, "oder: " + r.variante), speakBtn(r.variante)) : null,
          h("p", { class: "hint" }, r.hinweis),
          h("div", { class: "row gap" },
            h("button", { class: "btn small", onclick: () => void speak(r.fr, 0, 0.6) }, "🐢 Langsam"),
            h("button", { class: "btn small", onclick: () => { if (addExpression(r.fr, text, "nachschlagen", r.hinweis)) toast("Gespeichert ✓"); else toast("Schon gespeichert"); } }, "➕ Merken"))),
      );
      markActive();
    } catch (e) {
      out.replaceChildren(errorBox((e as Error).message));
    }
    btn.disabled = false;
  };
  shell("Wie sag ich das?", h("div", { class: "stack" }, input, btn, out), { back, tabs: false });
  input.focus();
}

// ---------- settings ----------

function settings() {
  currentTab = "mehr";
  const s = state.settings;
  const key = h("input", { type: "password", value: s.apiKey, placeholder: "sk-ant-…", autocomplete: "off" });
  const name = h("input", { type: "text", value: s.name });
  const partner = h("input", { type: "text", value: s.partnerName });
  const canton = cantonSelect();
  const model = h("select", null, ...(Object.keys(ai.MODEL_LABELS) as ModelId[]).map((id) => h("option", { value: id }, ai.MODEL_LABELS[id])));
  model.value = s.model;
  const auto = h("input", { type: "checkbox", checked: s.autoSpeak });
  const rate = h("input", { type: "range", min: "0.5", max: "1.2", step: "0.05", value: String(s.rate) });
  const fileIn = h("input", { type: "file", accept: "application/json", style: "display:none" });
  fileIn.onchange = async () => {
    const f = fileIn.files?.[0];
    if (!f) return;
    try {
      importJson(await f.text());
    } catch (e) {
      toast((e as Error).message);
    }
  };

  const persist = () => {
    s.apiKey = key.value.trim();
    s.name = name.value.trim();
    s.partnerName = partner.value.trim();
    s.canton = canton.value;
    s.model = model.value as ModelId;
    s.autoSpeak = auto.checked;
    s.rate = Number(rate.value);
    save();
  };
  for (const el of [key, name, partner, canton, model, auto, rate]) el.addEventListener("change", persist);

  const body = h("div", { class: "stack" },
    h("div", { class: "card stack" },
      h("div", { class: "label" }, "Über dich"),
      h("label", null, "Dein Vorname", name),
      h("label", null, "Name deiner Freundin", partner),
      h("label", null, "Kanton (Wortwahl, z.B. huitante)", canton)),
    h("div", { class: "card stack" },
      h("div", { class: "label" }, "Sprache"),
      h("label", { class: "row check" }, auto, "Antworten im Chat automatisch vorlesen"),
      h("label", null, "Vorlese-Tempo", rate),
      h("button", { class: "btn small", onclick: () => void speak("Salut ! Ça joue ? On se voit ce soir pour le souper ?", 0, Number(rate.value)) }, "🔊 Test")),
    h("div", { class: "card stack" },
      h("div", { class: "label" }, "Claude (KI)"),
      h("label", null, "API-Schlüssel", key),
      h("label", null, "Modell", model),
      h("p", { class: "hint" }, `Bisher verbraucht: ca. $${state.usage.costUsd.toFixed(2)} (${Math.round((state.usage.inputTokens + state.usage.outputTokens) / 1000)}k Tokens). Schätzung – die genauen Kosten siehst du in der Claude Console.`),
      h("details", null, h("summary", null, "So bekommst du einen API-Schlüssel"),
        h("ol", null,
          h("li", null, "Geh auf console.anthropic.com und erstell ein Konto."),
          h("li", null, "Unter «Billing» ein Guthaben aufladen (z.B. 5 $)."),
          h("li", null, "Unter «API Keys» → «Create Key» einen Schlüssel erstellen."),
          h("li", null, "Den Schlüssel (beginnt mit sk-ant-) oben einfügen.")),
        h("p", { class: "hint" }, "Der Schlüssel bleibt nur auf diesem Gerät. Gib den Link zur App trotzdem nicht weiter, ohne dass die Person einen eigenen Schlüssel einträgt."))),
    h("div", { class: "card stack" },
      h("div", { class: "label" }, "Daten"),
      h("p", { class: "hint" }, "Alles wird nur auf diesem iPhone gespeichert. Mach ab und zu ein Backup."),
      h("div", { class: "row gap wrap" },
        h("button", { class: "btn small", onclick: () => {
          const blob = new Blob([exportJson()], { type: "application/json" });
          const a = h("a", { href: URL.createObjectURL(blob), download: `ca-joue-backup-${today()}.json` });
          a.click();
        } }, "Backup speichern"),
        h("button", { class: "btn small", onclick: () => fileIn.click() }, "Backup laden"),
        h("button", { class: "btn small danger", onclick: () => { if (confirm("Wirklich alles löschen?")) resetAll(); } }, "Alles zurücksetzen")),
      fileIn),
    h("p", { class: "hint center" }, "Ça joue · v0.1"),
  );
  shell("Mehr", body);
}

// ---------- boot ----------

go("heute");

if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
