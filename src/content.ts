// Static learning content: missions and starter expressions.

export interface Mission {
  id: string;
  emoji: string;
  title: string;
  /** What the learner should achieve (shown to the user, German). */
  goal: string;
  /** Scenario for the AI role-play partner. */
  scenario: string;
  /** Who the AI plays. */
  role: string;
}

export const MISSIONS: Mission[] = [
  {
    id: "vorstellen",
    emoji: "👋",
    title: "Sich vorstellen",
    goal: "Sag, wie du heisst, woher du kommst, was du arbeitest – und dass du der Freund von ihr bist.",
    scenario:
      "Apéro bei einer Kollegin der Freundin des Lernenden in Lausanne. Du lernst ihn gerade kennen und fragst freundlich, wer er ist, woher er kommt und was er macht.",
    role: "Léa, 29, eine Kollegin seiner Freundin",
  },
  {
    id: "smalltalk",
    emoji: "☕",
    title: "Smalltalk-Start",
    goal: "Begrüsse, frag wie es geht, antworte selbst und frag «quoi de neuf ?».",
    scenario:
      "Du triffst den Lernenden zufällig im Café. Ihr kennt euch flüchtig. Lockerer Smalltalk: wie geht's, was gibt's Neues, das Wetter.",
    role: "Julien, ein Kollege aus dem Freundeskreis",
  },
  {
    id: "wochenende",
    emoji: "🏔️",
    title: "Vom Wochenende erzählen",
    goal: "Erzähl in 3–4 Sätzen, was du am Wochenende gemacht hast, und frag zurück.",
    scenario:
      "Montagmorgen, Pause. Du fragst den Lernenden, was er am Wochenende gemacht hat, und erzählst kurz von deinem (Wandern im Lavaux).",
    role: "Camille, eine Freundin",
  },
  {
    id: "nachfragen",
    emoji: "❓",
    title: "Fragen stellen & nachhaken",
    goal: "Stell mindestens 4 Fragen, um mehr über die andere Person zu erfahren.",
    scenario:
      "Du sitzt beim Abendessen neben dem Lernenden. Du antwortest gern, aber stellst selbst wenig Fragen – er muss das Gespräch mit Fragen am Laufen halten.",
    role: "Sophie, eine Freundin, Pflegefachfrau, liebt Reisen",
  },
  {
    id: "nicht-verstanden",
    emoji: "🤔",
    title: "Wenn du nichts verstehst",
    goal: "Bitte darum, langsamer zu reden, etwas zu wiederholen oder ein Wort zu erklären.",
    scenario:
      "Du redest schnell und benutzt ein paar Wörter, die der Lernende sicher nicht kennt. Er muss nachfragen. Wenn er höflich nachfragt, wiederholst du langsamer und einfacher.",
    role: "Marc, ein gesprächiger Freund",
  },
  {
    id: "apero",
    emoji: "🍷",
    title: "Apéro mit Freundinnen",
    goal: "Steig in ein laufendes Gespräch ein und gib einen eigenen Kommentar ab.",
    scenario:
      "Apéro auf einer Terrasse. Du redest mit einer anderen Freundin über ein Konzert am Montreux Jazz. Bezieh den Lernenden ein und reagiere auf seine Kommentare.",
    role: "Léa und Inès (du spielst beide, markiere mit «Léa:» / «Inès:»)",
  },
  {
    id: "abmachen",
    emoji: "📱",
    title: "Pläne abmachen per Chat",
    goal: "Mach per WhatsApp einen Termin ab: Tag, Uhrzeit, Ort.",
    scenario:
      "WhatsApp-Chat. Du willst mit dem Lernenden und seiner Freundin etwas unternehmen (souper oder Ausflug). Schreib kurz, im Chat-Stil, mit Emojis. Findet gemeinsam Tag, Uhrzeit und Ort.",
    role: "Inès, eine Freundin, per WhatsApp",
  },
  {
    id: "arbeit",
    emoji: "💼",
    title: "Über die Arbeit reden",
    goal: "Erklär einfach, was du arbeitest und ob es dir gefällt.",
    scenario:
      "Beim Souper fragst du den Lernenden nach seiner Arbeit: was er macht, wo, ob es ihm gefällt. Erzähl auch kurz von deiner.",
    role: "Thomas, der Partner einer Freundin",
  },
  {
    id: "essen",
    emoji: "🧀",
    title: "Essen & Trinken",
    goal: "Bestell im Restaurant und sag, was dir schmeckt und was nicht.",
    scenario:
      "Restaurant in Fribourg. Du bist zuerst Kellnerin/Kellner (bestellen), danach redet ihr am Tisch darüber, was gut schmeckt (Fondue moitié-moitié!).",
    role: "Kellnerin im Restaurant",
  },
  {
    id: "meinung",
    emoji: "💬",
    title: "Eine Meinung sagen",
    goal: "Sag deine Meinung mit «je trouve que…», stimm zu oder widersprich.",
    scenario:
      "Ihr diskutiert locker über ein Alltagsthema (Ferien in den Bergen oder am Meer? Serien? Fussball?). Frag nach seiner Meinung und reagiere darauf, auch mal mit einer anderen Meinung.",
    role: "Julien, ein Freund mit starken Meinungen",
  },
];

export const FREE_CHAT: Mission = {
  id: "frei",
  emoji: "🗨️",
  title: "Freies Gespräch",
  goal: "Plaudern, worüber du willst.",
  scenario:
    "Lockeres Gespräch unter Freunden. Der Lernende bestimmt das Thema. Stell Rückfragen, halte es einfach.",
  role: "Camille, eine Freundin",
};

/** Starter building blocks – seeded on first launch. */
export const STARTER_EXPRESSIONS: { fr: string; de: string }[] = [
  { fr: "Salut, ça va ?", de: "Hallo, wie geht's?" },
  { fr: "Ça va bien, et toi ?", de: "Gut, und dir?" },
  { fr: "Je m'appelle …", de: "Ich heisse …" },
  { fr: "Je suis le copain de …", de: "Ich bin der Freund von …" },
  { fr: "Tu peux répéter, s'il te plaît ?", de: "Kannst du das bitte wiederholen?" },
  { fr: "Plus lentement, s'il te plaît.", de: "Langsamer, bitte." },
  { fr: "Je ne comprends pas.", de: "Ich verstehe nicht." },
  { fr: "Ça veut dire quoi, … ?", de: "Was heisst … ?" },
  { fr: "Je voudrais …", de: "Ich hätte gern …" },
  { fr: "Quoi de neuf ?", de: "Was gibt's Neues?" },
  { fr: "Ça joue !", de: "Passt! / Geht in Ordnung!" },
  { fr: "Service !", de: "Bitte schön! (Antwort auf Merci)" },
  { fr: "À tout bientôt !", de: "Bis bald!" },
  { fr: "Je trouve que …", de: "Ich finde, dass …" },
  { fr: "Moi aussi.", de: "Ich auch." },
];

export const CANTONS: { id: string; label: string; eighty: string }[] = [
  { id: "VD", label: "Waadt (Lausanne)", eighty: "huitante" },
  { id: "FR", label: "Freiburg", eighty: "huitante" },
  { id: "VS", label: "Wallis", eighty: "huitante" },
  { id: "GE", label: "Genf", eighty: "quatre-vingts" },
  { id: "NE", label: "Neuenburg", eighty: "quatre-vingts" },
  { id: "JU", label: "Jura", eighty: "quatre-vingts" },
  { id: "BE", label: "Berner Jura / Biel", eighty: "quatre-vingts" },
];
