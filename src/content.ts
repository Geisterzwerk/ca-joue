// All learning content is written here – no AI needed.
// Placeholders: {name} = learner's first name, {copine} = girlfriend's name.

export interface Phrase {
  fr: string;
  de: string;
}

export interface Step {
  /** What the conversation partner says. */
  them: string;
  themDe: string;
  /** What the learner should answer (German instruction). */
  task: string;
  /** Every group must be matched by at least one keyword (accent-insensitive). */
  accept: string[][];
  /** Natural model answers. */
  examples: string[];
  /** Building blocks shown with the help button. */
  help?: Phrase[];
}

export interface Mission {
  id: string;
  emoji: string;
  title: string;
  goal: string;
  role: string;
  steps: Step[];
  end: Phrase;
}

export const MISSIONS: Mission[] = [
  {
    id: "vorstellen",
    emoji: "👋",
    title: "Sich vorstellen",
    goal: "Sag, wie du heisst, woher du kommst und was du arbeitest.",
    role: "Léa, eine Kollegin von {copine}, beim Apéro in Lausanne",
    steps: [
      {
        them: "Salut ! Moi, c'est Léa. Et toi, tu t'appelles comment ?",
        themDe: "Hallo! Ich bin Léa. Und du, wie heisst du?",
        task: "Sag, wie du heisst.",
        accept: [["appelle", "moi c'est", "je suis"]],
        examples: ["Salut ! Je m'appelle {name}.", "Moi, c'est {name}. Enchanté !"],
        help: [
          { fr: "Je m'appelle …", de: "Ich heisse …" },
          { fr: "Enchanté !", de: "Freut mich!" },
        ],
      },
      {
        them: "Enchantée ! Et tu connais qui, ici ?",
        themDe: "Freut mich! Und wen kennst du hier?",
        task: "Sag, dass du der Freund von {copine} bist.",
        accept: [["copain", "ami", "mec", "avec"]],
        examples: ["Je suis le copain de {copine}.", "Je suis avec {copine}, c'est ma copine."],
        help: [
          { fr: "Je suis le copain de …", de: "Ich bin der Freund von …" },
          { fr: "C'est ma copine.", de: "Das ist meine Freundin." },
        ],
      },
      {
        them: "Ah, c'est toi ! Elle m'a parlé de toi. Tu viens d'où ?",
        themDe: "Ah, du bist das! Sie hat mir von dir erzählt. Woher kommst du?",
        task: "Sag, woher du kommst.",
        accept: [["viens", "habite", "suis de", "suis d'", "originaire"]],
        examples: ["Je viens de Berne.", "Je viens de Suisse alémanique."],
        help: [
          { fr: "Je viens de …", de: "Ich komme aus …" },
          { fr: "la Suisse alémanique", de: "die Deutschschweiz" },
          { fr: "J'habite à …", de: "Ich wohne in …" },
        ],
      },
      {
        them: "Ah, un Suisse allemand ! Et tu fais quoi dans la vie ?",
        themDe: "Ah, ein Deutschschweizer! Und was machst du beruflich?",
        task: "Sag, was du arbeitest.",
        accept: [["suis", "travaille", "bosse", "fais", "etudie"]],
        examples: ["Je travaille dans une petite entreprise.", "Je suis informaticien."],
        help: [
          { fr: "Je travaille comme …", de: "Ich arbeite als …" },
          { fr: "Je suis … (Beruf)", de: "Ich bin … (ohne «un»)" },
          { fr: "Je travaille dans un bureau.", de: "Ich arbeite in einem Büro." },
        ],
      },
      {
        them: "Cool ! Tu parles bien français, dis donc !",
        themDe: "Cool! Du sprichst ja gut Französisch!",
        task: "Bedank dich und sag, dass du noch lernst.",
        accept: [["merci"], ["apprends", "apprendre", "encore", "un peu", "pas tres"]],
        examples: ["Merci ! J'apprends encore.", "Merci, mais je parle seulement un petit peu."],
        help: [
          { fr: "J'apprends le français.", de: "Ich lerne Französisch." },
          { fr: "un petit peu", de: "ein bisschen" },
        ],
      },
      {
        them: "Mais c'est super ! Bon, je vais chercher à boire. Tu veux quelque chose ?",
        themDe: "Super! Ich hole etwas zu trinken. Willst du etwas?",
        task: "Bestell dir ein Bier oder ein Glas Weisswein.",
        accept: [["biere", "verre", "vin", "blanc", "volontiers", "oui", "eau"]],
        examples: ["Oui, volontiers ! Une bière, s'il te plaît.", "Un verre de blanc, merci !"],
        help: [
          { fr: "Volontiers !", de: "Gern!" },
          { fr: "un verre de blanc", de: "ein Glas Weisswein (typisch Waadt)" },
        ],
      },
    ],
    end: { fr: "Ça joue, je reviens tout de suite !", de: "Alles klar, ich bin gleich zurück!" },
  },
  {
    id: "smalltalk",
    emoji: "☕",
    title: "Smalltalk-Start",
    goal: "Begrüssen, fragen wie's geht, plaudern und dich verabschieden.",
    role: "Julien, ein Kollege aus dem Freundeskreis, zufällig im Café",
    steps: [
      {
        them: "Hé, salut ! Ça va ?",
        themDe: "Hey, hallo! Wie geht's?",
        task: "Antworte und frag zurück.",
        accept: [["va", "bien", "tranquille", "super", "pas mal"], ["toi", "et vous"]],
        examples: ["Ça va bien, et toi ?", "Salut ! Tranquille, et toi ?"],
        help: [
          { fr: "Ça va bien, et toi ?", de: "Gut, und dir?" },
          { fr: "Tranquille.", de: "Alles ruhig / entspannt." },
        ],
      },
      {
        them: "Ouais, ça va, un peu fatigué. Quoi de neuf ?",
        themDe: "Ja, geht so, ein bisschen müde. Was gibt's Neues?",
        task: "Sag, dass es nichts Besonderes gibt – oder erzähl etwas Kleines.",
        accept: [["rien", "pas grand", "travail", "boulot", "week", "nouveau", "special"]],
        examples: ["Pas grand-chose. Beaucoup de boulot.", "Rien de spécial. Et toi, quoi de neuf ?"],
        help: [
          { fr: "Pas grand-chose.", de: "Nicht viel." },
          { fr: "Rien de spécial.", de: "Nichts Besonderes." },
          { fr: "beaucoup de boulot", de: "viel Arbeit (locker)" },
        ],
      },
      {
        them: "Moi, je pars en vacances la semaine prochaine !",
        themDe: "Ich fahre nächste Woche in die Ferien!",
        task: "Frag, wohin er geht.",
        accept: [["ou", "quel endroit"]],
        examples: ["Ah cool ! Tu vas où ?", "Super ! Où est-ce que tu vas ?"],
        help: [{ fr: "Tu vas où ?", de: "Wohin gehst du?" }],
      },
      {
        them: "En Valais, à la montagne. Il fait trop chaud ici en ce moment.",
        themDe: "Ins Wallis, in die Berge. Es ist gerade zu heiss hier.",
        task: "Sag etwas zum Wetter.",
        accept: [["chaud", "beau", "soleil", "froid", "pleut", "temps", "vrai"]],
        examples: ["Oui, il fait vraiment chaud !", "C'est vrai, il fait trop beau."],
        help: [
          { fr: "Il fait chaud.", de: "Es ist heiss." },
          { fr: "Il fait beau.", de: "Es ist schönes Wetter." },
          { fr: "Il pleut.", de: "Es regnet." },
        ],
      },
      {
        them: "Bon, je dois y aller. À plus !",
        themDe: "Gut, ich muss los. Bis später!",
        task: "Verabschiede dich auf Schweizer Art.",
        accept: [["bientot", "plus", "adieu", "salut", "ciao", "bonne", "vacances"]],
        examples: ["À tout bientôt ! Bonnes vacances !", "Salut, bonne journée !"],
        help: [
          { fr: "À tout bientôt !", de: "Bis bald! (typisch Romandie)" },
          { fr: "Bonnes vacances !", de: "Schöne Ferien!" },
        ],
      },
    ],
    end: { fr: "Adieu ! 👋", de: "Tschüss! («Adieu» ist in der Waadt ein ganz normaler Gruss)" },
  },
  {
    id: "wochenende",
    emoji: "🏔️",
    title: "Vom Wochenende erzählen",
    goal: "Erzähl, was du gemacht hast, und reagiere auf ihre Geschichte.",
    role: "Camille, eine Freundin von {copine}",
    steps: [
      {
        them: "Salut ! Alors, c'était comment, ton week-end ?",
        themDe: "Hallo! Und, wie war dein Wochenende?",
        task: "Sag, dass es gut war.",
        accept: [["bien", "super", "cool", "sympa", "genial", "top", "chouette"]],
        examples: ["C'était super !", "C'était très bien, merci."],
        help: [{ fr: "C'était super !", de: "Es war super!" }],
      },
      {
        them: "Ah ouais ? Qu'est-ce que tu as fait ?",
        themDe: "Ah ja? Was hast du gemacht?",
        task: "Erzähl, was du am Samstag gemacht hast.",
        accept: [["ai", "suis", "on a", "on est", "sommes", "avons"]],
        examples: ["Samedi, j'ai fait une randonnée.", "On est allés au lac avec des amis."],
        help: [
          { fr: "J'ai fait une randonnée.", de: "Ich bin gewandert." },
          { fr: "J'ai vu des amis.", de: "Ich habe Freunde getroffen." },
          { fr: "Je suis allé à …", de: "Ich bin nach … gegangen." },
        ],
      },
      {
        them: "Trop bien ! Et dimanche ?",
        themDe: "Super! Und am Sonntag?",
        task: "Sag, was du am Sonntag gemacht hast.",
        accept: [["ai", "suis", "on a", "on est", "sommes", "avons", "rien"]],
        examples: ["Dimanche, je me suis reposé.", "Dimanche, on a fait un brunch."],
        help: [
          { fr: "Je me suis reposé.", de: "Ich habe mich ausgeruht." },
          { fr: "J'ai dormi longtemps.", de: "Ich habe lange geschlafen." },
        ],
      },
      {
        them: "Moi, je suis allée dans le Lavaux avec ma sœur. On a bu un verre au bord du lac.",
        themDe: "Ich war mit meiner Schwester im Lavaux. Wir haben am See etwas getrunken.",
        task: "Reagiere darauf und frag, wie es war.",
        accept: [["comment", "c'etait", "sympa", "cool", "beau", "joli", "bien"]],
        examples: ["Oh, sympa ! C'était comment ?", "Trop cool ! Il faisait beau ?"],
        help: [
          { fr: "Sympa !", de: "Schön! / Nett!" },
          { fr: "C'était comment ?", de: "Wie war es?" },
        ],
      },
      {
        them: "Magnifique, avec le soleil sur les vignes. Tu dois y aller avec {copine} !",
        themDe: "Wunderschön, mit der Sonne auf den Reben. Du musst mit {copine} hingehen!",
        task: "Sag, dass das eine gute Idee ist.",
        accept: [["idee", "oui", "volontiers", "envie", "bien sur", "va y aller"]],
        examples: ["Bonne idée !", "Oui, on va y aller bientôt !"],
        help: [{ fr: "Bonne idée !", de: "Gute Idee!" }],
      },
    ],
    end: { fr: "Vous allez adorer. Bon, à tout bientôt !", de: "Ihr werdet es lieben. Also, bis bald!" },
  },
  {
    id: "nachfragen",
    emoji: "❓",
    title: "Fragen stellen & nachhaken",
    goal: "Halte das Gespräch mit Fragen am Laufen.",
    role: "Sophie, eine Freundin – sie antwortet gern, fragt aber selbst wenig",
    steps: [
      {
        them: "Salut, moi c'est Sophie.",
        themDe: "Hallo, ich bin Sophie.",
        task: "Frag sie, was sie arbeitet.",
        accept: [["fais", "travailles", "metier", "boulot", "travail"]],
        examples: ["Enchanté ! Tu fais quoi dans la vie ?", "Tu travailles où ?"],
        help: [{ fr: "Tu fais quoi dans la vie ?", de: "Was machst du beruflich?" }],
      },
      {
        them: "Je suis infirmière, au CHUV.",
        themDe: "Ich bin Pflegefachfrau, im CHUV (Unispital Lausanne).",
        task: "Frag, ob es ihr gefällt.",
        accept: [["plait", "aimes", "aime", "content"]],
        examples: ["Ça te plaît ?", "Tu aimes ton travail ?"],
        help: [{ fr: "Ça te plaît ?", de: "Gefällt es dir?" }],
      },
      {
        them: "Oui, beaucoup ! Mais c'est fatigant.",
        themDe: "Ja, sehr! Aber es ist anstrengend.",
        task: "Frag, was sie in ihrer Freizeit macht.",
        accept: [["libre", "loisirs", "temps", "fais quoi", "aimes faire", "week", "hobby"]],
        examples: ["Et pendant ton temps libre, tu fais quoi ?", "Qu'est-ce que tu aimes faire le week-end ?"],
        help: [{ fr: "pendant ton temps libre", de: "in deiner Freizeit" }],
      },
      {
        them: "J'adore voyager. L'année passée, je suis allée au Japon.",
        themDe: "Ich reise sehr gern. Letztes Jahr war ich in Japan.",
        task: "Frag nach (z.B. wie war es? wie lange?).",
        accept: [["comment", "combien", "c'etait", "longtemps", "quand", "pourquoi", "avec qui"]],
        examples: ["Waouh ! C'était comment ?", "Tu es restée combien de temps ?"],
        help: [
          { fr: "C'était comment ?", de: "Wie war es?" },
          { fr: "Combien de temps ?", de: "Wie lange?" },
          { fr: "Avec qui ?", de: "Mit wem?" },
        ],
      },
      {
        them: "Trois semaines, c'était génial ! La nourriture, wow.",
        themDe: "Drei Wochen, es war genial! Das Essen, wow.",
        task: "Frag, wohin sie als Nächstes reisen will.",
        accept: [["prochain", "prochaine", "apres", "ensuite", "ou"]],
        examples: ["Et c'est quoi, ton prochain voyage ?", "Tu veux aller où, après ?"],
        help: [{ fr: "ton prochain voyage", de: "deine nächste Reise" }],
      },
    ],
    end: { fr: "Le Pérou, j'espère ! Toi, tu poses des bonnes questions !", de: "Peru, hoffe ich! Du stellst gute Fragen!" },
  },
  {
    id: "nicht-verstanden",
    emoji: "🤔",
    title: "Wenn du nichts verstehst",
    goal: "Bitte darum, langsamer zu reden, zu wiederholen oder etwas zu erklären.",
    role: "Marc, ein Freund, der sehr schnell redet",
    steps: [
      {
        them: "Salut ! Dis, t'as capté le match d'hier ? C'était complètement dingue, le goal à la dernière minute !",
        themDe: "Hey! Sag mal, hast du den Match gestern gesehen? Völlig verrückt, das Goal in der letzten Minute!",
        task: "Du verstehst nichts. Bitte ihn, langsamer zu reden.",
        accept: [["lentement", "doucement", "moins vite"]],
        examples: ["Pardon, tu peux parler plus lentement, s'il te plaît ?"],
        help: [{ fr: "Plus lentement, s'il te plaît.", de: "Langsamer, bitte." }],
      },
      {
        them: "Ah, pardon ! Le match. De foot. Hier soir. Tu l'as vu ?",
        themDe: "Ah, Entschuldigung! Der Match. Fussball. Gestern Abend. Hast du ihn gesehen?",
        task: "Sag, dass du ihn nicht gesehen hast.",
        accept: [["non", "pas vu", "pas regarde"]],
        examples: ["Non, je ne l'ai pas vu.", "Non, pas vu."],
        help: [{ fr: "Je ne l'ai pas vu.", de: "Ich habe ihn nicht gesehen." }],
      },
      {
        them: "Dommage ! Lausanne a gagné, c'était le pied !",
        themDe: "Schade! Lausanne hat gewonnen, es war mega!",
        task: "Frag, was «c'était le pied» heisst.",
        accept: [["veut dire", "signifie", "c'est quoi", "quoi"]],
        examples: ["Ça veut dire quoi, « c'était le pied » ?", "Pardon, c'est quoi, « le pied » ?"],
        help: [{ fr: "Ça veut dire quoi, … ?", de: "Was heisst … ?" }],
      },
      {
        them: "Ah, « c'était le pied », ça veut dire « c'était génial ».",
        themDe: "Ah, «c'était le pied» heisst «es war genial».",
        task: "Bedank dich und sag, dass du es jetzt verstehst.",
        accept: [["merci"], ["compris", "comprends", "pige"]],
        examples: ["Ah, merci ! J'ai compris.", "Merci, maintenant je comprends."],
        help: [{ fr: "J'ai compris.", de: "Ich habe verstanden." }],
      },
      {
        them: "Bon, samedi y a encore un match. Tu viens avec nous au stade ?",
        themDe: "Also, am Samstag gibt's wieder einen Match. Kommst du mit uns ins Stadion?",
        task: "Bitte ihn, das zu wiederholen – du bist nicht sicher.",
        accept: [["repeter", "repete", "redire", "encore une fois", "pardon", "comment"]],
        examples: ["Pardon ? Tu peux répéter, s'il te plaît ?"],
        help: [{ fr: "Tu peux répéter ?", de: "Kannst du das wiederholen?" }],
      },
      {
        them: "Samedi. Match. Au stade. Avec nous. Tu viens ?",
        themDe: "Samstag. Match. Im Stadion. Mit uns. Kommst du?",
        task: "Sag zu.",
        accept: [["oui", "volontiers", "plaisir", "ca joue", "d'accord", "viens"]],
        examples: ["Oui, ça joue !", "Avec plaisir !"],
        help: [{ fr: "Avec plaisir !", de: "Mit Vergnügen!" }],
      },
    ],
    end: { fr: "Génial ! On se retrouve à la gare à dix-huit heures.", de: "Genial! Wir treffen uns um 18 Uhr am Bahnhof." },
  },
  {
    id: "apero",
    emoji: "🍷",
    title: "Apéro mit Freundinnen",
    goal: "Steig ins Gespräch ein und gib eigene Kommentare ab.",
    role: "Léa und Inès auf einer Terrasse",
    steps: [
      {
        them: "Léa : T'as vu, le programme du Montreux Jazz est sorti !\nInès : Ouais, y a des super concerts cette année.",
        themDe: "Léa: Hast du gesehen, das Programm vom Montreux Jazz ist draussen!\nInès: Ja, es gibt dieses Jahr super Konzerte.",
        task: "Frag, ob sie hingehen.",
        accept: [["allez", "aller", "vous y"]],
        examples: ["Vous y allez ?", "Vous allez au festival ?"],
        help: [{ fr: "Vous y allez ?", de: "Geht ihr hin?" }],
      },
      {
        them: "Inès : Oui, le vendredi ! Et toi, t'aimes quelle musique ?",
        themDe: "Inès: Ja, am Freitag! Und du, welche Musik magst du?",
        task: "Sag, welche Musik du magst.",
        accept: [["aime", "adore", "ecoute", "prefere"]],
        examples: ["J'aime bien le rock.", "J'adore la musique électronique."],
        help: [
          { fr: "J'aime bien …", de: "Ich mag …" },
          { fr: "J'écoute surtout …", de: "Ich höre vor allem …" },
        ],
      },
      {
        them: "Léa : Ah, cool. Moi, je préfère le jazz, mais les billets sont chers.",
        themDe: "Léa: Ah, cool. Ich mag lieber Jazz, aber die Tickets sind teuer.",
        task: "Stimm zu: Ja, es ist teuer.",
        accept: [["cher", "vrai", "raison"]],
        examples: ["C'est vrai, c'est cher.", "Oui, t'as raison, c'est super cher."],
        help: [
          { fr: "T'as raison.", de: "Du hast recht." },
          { fr: "C'est vrai.", de: "Das stimmt." },
        ],
      },
      {
        them: "Inès : Mais y a aussi des concerts gratuits au bord du lac !",
        themDe: "Inès: Aber es gibt auch Gratiskonzerte am Seeufer!",
        task: "Sag, dass du gern mitkommen möchtest.",
        accept: [["idee", "viens", "venir", "envie", "volontiers", "partant"]],
        examples: ["Bonne idée ! Je viens avec vous.", "J'ai envie de venir aussi !"],
        help: [
          { fr: "Je suis partant.", de: "Ich bin dabei." },
          { fr: "Je viens avec vous.", de: "Ich komme mit euch." },
        ],
      },
      {
        them: "Léa : Génial ! Alors on y va tous ensemble, avec {copine} ! Santé !",
        themDe: "Léa: Genial! Dann gehen wir alle zusammen, mit {copine}! Prost!",
        task: "Stoss an!",
        accept: [["sante", "tchin", "cheers"]],
        examples: ["Santé !", "Tchin-tchin !"],
        help: [{ fr: "Santé !", de: "Prost! (Beim Anstossen in die Augen schauen!)" }],
      },
    ],
    end: { fr: "Inès : Santé ! Il parle bien, ton copain, {copine} !", de: "Inès: Prost! Er redet gut, dein Freund, {copine}!" },
  },
  {
    id: "abmachen",
    emoji: "📱",
    title: "Pläne abmachen per Chat",
    goal: "Mach per WhatsApp ein Abendessen ab: Tag, Uhrzeit, was mitbringen.",
    role: "Inès, per WhatsApp",
    steps: [
      {
        them: "Coucou ! 😊 Ça vous dit, un souper chez nous la semaine prochaine ?",
        themDe: "Hallo! 😊 Habt ihr Lust auf ein Abendessen bei uns nächste Woche?",
        task: "Sag, dass ihr gern kommt.",
        accept: [["oui", "volontiers", "plaisir", "super", "cool", "grave", "top"]],
        examples: ["Oui, avec plaisir ! 😊", "Super idée, volontiers !"],
        help: [{ fr: "Avec plaisir !", de: "Sehr gern!" }],
      },
      {
        them: "Top ! Mardi ou jeudi, ça vous va ?",
        themDe: "Top! Dienstag oder Donnerstag, passt euch das?",
        task: "Wähl einen Tag.",
        accept: [["mardi", "jeudi"]],
        examples: ["Jeudi, c'est parfait.", "Mardi, ça joue pour nous."],
        help: [{ fr: "… ça joue pour nous.", de: "… passt für uns." }],
      },
      {
        them: "Parfait ! Vers 19 h ?",
        themDe: "Perfekt! Gegen 19 Uhr?",
        task: "Schlag lieber 19:30 Uhr vor.",
        accept: [["30", "demi", "trente"]],
        examples: ["Plutôt 19 h 30, c'est possible ?", "19 h 30, ça joue ?"],
        help: [
          { fr: "plutôt", de: "eher / lieber" },
          { fr: "19 h 30 (dix-neuf heures trente)", de: "19:30 Uhr" },
        ],
      },
      {
        them: "Ça joue ! On habite à la rue de Bourg 12, au 3e.",
        themDe: "Passt! Wir wohnen an der Rue de Bourg 12, im 3. Stock.",
        task: "Frag, ob ihr etwas mitbringen sollt.",
        accept: [["apporte", "amene", "prend", "quelque chose"]],
        examples: ["On apporte quelque chose ?", "On amène le dessert ?"],
        help: [
          { fr: "On apporte quelque chose ?", de: "Sollen wir etwas mitbringen?" },
          { fr: "une bouteille de vin", de: "eine Flasche Wein" },
        ],
      },
      {
        them: "Juste une bouteille de vin si vous voulez 🍷 Je me réjouis de vous voir !",
        themDe: "Nur eine Flasche Wein, wenn ihr wollt 🍷 Ich freue mich, euch zu sehen!",
        task: "Antworte kurz und verabschiede dich.",
        accept: [["bientot", "jeudi", "mardi", "plus", "merci", "bises", "ciao", "rejouis"]],
        examples: ["Ça joue, à jeudi ! Bises 😘", "Merci, nous aussi ! À tout bientôt !"],
        help: [
          { fr: "Bises", de: "Küsschen (Chat-Gruss unter Freunden)" },
          { fr: "Je me réjouis !", de: "Ich freue mich! (typisch Schweiz)" },
        ],
      },
    ],
    end: { fr: "😘😘", de: "" },
  },
  {
    id: "arbeit",
    emoji: "💼",
    title: "Über die Arbeit reden",
    goal: "Erklär einfach, was du arbeitest und ob es dir gefällt.",
    role: "Thomas, der Partner einer Freundin, beim Souper",
    steps: [
      {
        them: "Alors, tu travailles où ?",
        themDe: "Also, wo arbeitest du?",
        task: "Sag, wo du arbeitest.",
        accept: [["travaille", "bosse", "suis"]],
        examples: ["Je travaille à Berne, dans une petite entreprise.", "Je bosse dans une banque."],
        help: [
          { fr: "Je travaille à … (Stadt)", de: "Ich arbeite in … (Stadt)" },
          { fr: "dans une entreprise", de: "in einer Firma" },
        ],
      },
      {
        them: "Et c'est quoi, ton job exactement ?",
        themDe: "Und was ist dein Job genau?",
        task: "Erklär einfach, was du machst.",
        accept: [["suis", "fais", "occupe", "travaille", "responsable"]],
        examples: ["Je m'occupe des clients.", "Je fais des projets informatiques."],
        help: [
          { fr: "Je m'occupe de …", de: "Ich kümmere mich um …" },
          { fr: "Je suis responsable de …", de: "Ich bin verantwortlich für …" },
        ],
      },
      {
        them: "Ah, intéressant ! Ça te plaît ?",
        themDe: "Ah, interessant! Gefällt es dir?",
        task: "Sag, ob es dir gefällt – und warum.",
        accept: [["plait", "aime", "oui", "non"], ["parce", "car", "collegues", "interessant", "stress", "varie", "mais"]],
        examples: ["Oui, ça me plaît, parce que mes collègues sont sympas.", "Oui, mais il y a beaucoup de stress."],
        help: [
          { fr: "parce que", de: "weil" },
          { fr: "Mes collègues sont sympas.", de: "Meine Kollegen sind nett." },
          { fr: "C'est varié.", de: "Es ist abwechslungsreich." },
        ],
      },
      {
        them: "Moi, je suis prof dans un gymnase. Les élèves, c'est parfois difficile !",
        themDe: "Ich bin Lehrer an einem Gymnasium. Die Schüler sind manchmal schwierig!",
        task: "Frag, ob es ihm trotzdem gefällt.",
        accept: [["plait", "aimes", "content", "quand meme"]],
        examples: ["Et ça te plaît quand même ?", "Mais tu aimes ton métier ?"],
        help: [{ fr: "quand même", de: "trotzdem" }],
      },
      {
        them: "J'adore ça, mais vivement les vacances !",
        themDe: "Ich liebe es, aber ich freue mich auf die Ferien!",
        task: "Sag, dass du dich auch auf die Ferien freust.",
        accept: [["vacances", "moi aussi"]],
        examples: ["Moi aussi, je me réjouis des vacances !", "Moi aussi ! Vivement les vacances !"],
        help: [{ fr: "Je me réjouis de …", de: "Ich freue mich auf … (typisch Schweiz)" }],
      },
    ],
    end: { fr: "Haha, santé aux vacances alors !", de: "Haha, dann Prost auf die Ferien!" },
  },
  {
    id: "essen",
    emoji: "🧀",
    title: "Im Restaurant",
    goal: "Bestellen, sagen wie es schmeckt, zahlen.",
    role: "Serviceangestellte in einem Restaurant in Fribourg",
    steps: [
      {
        them: "Bonsoir ! Vous avez choisi ?",
        themDe: "Guten Abend! Haben Sie gewählt?",
        task: "Bestell eine Fondue moitié-moitié für zwei.",
        accept: [["fondue"], ["voudrais", "voudrait", "prend", "prendre", "aimerait", "aimerais", "pour"]],
        examples: ["Bonsoir ! On voudrait une fondue moitié-moitié pour deux, s'il vous plaît."],
        help: [
          { fr: "On voudrait …", de: "Wir hätten gern …" },
          { fr: "pour deux personnes", de: "für zwei Personen" },
        ],
      },
      {
        them: "Très bien. Et à boire ?",
        themDe: "Sehr gut. Und zu trinken?",
        task: "Bestell eine Flasche Weisswein oder Wasser.",
        accept: [["vin", "blanc", "eau", "biere", "bouteille", "carafe", "the"]],
        examples: ["Une bouteille de blanc, s'il vous plaît.", "Une carafe d'eau, s'il vous plaît."],
        help: [
          { fr: "une carafe d'eau", de: "ein Krug Leitungswasser" },
          { fr: "Avec la fondue : du blanc ou du thé !", de: "Zum Fondue: Weisswein oder Tee!" },
        ],
      },
      {
        them: "Voilà, bon appétit ! … Alors, ça vous plaît ?",
        themDe: "Bitte sehr, en Guete! … Und, schmeckt es Ihnen?",
        task: "Sag, dass es sehr gut schmeckt.",
        accept: [["bon", "delicieux", "excellent", "top", "super", "parfait"]],
        examples: ["Oui, c'est délicieux !", "C'est très bon, merci !"],
        help: [{ fr: "C'est délicieux !", de: "Es ist köstlich!" }],
      },
      {
        them: "Vous voulez un dessert ? On a des meringues à la crème double.",
        themDe: "Möchten Sie ein Dessert? Wir haben Meringues mit Doppelrahm.",
        task: "Lehn höflich ab – du bist satt.",
        accept: [["non"], ["merci", "faim", "assez", "plein"]],
        examples: ["Non merci, je n'ai plus faim.", "Non merci, c'était parfait."],
        help: [{ fr: "Je n'ai plus faim.", de: "Ich habe keinen Hunger mehr." }],
      },
      {
        them: "Pas de souci ! Autre chose ?",
        themDe: "Kein Problem! Sonst noch etwas?",
        task: "Verlang die Rechnung.",
        accept: [["addition", "payer", "compte"]],
        examples: ["L'addition, s'il vous plaît.", "On peut payer, s'il vous plaît ?"],
        help: [{ fr: "L'addition, s'il vous plaît.", de: "Die Rechnung, bitte." }],
      },
      {
        them: "Ça fait septante-huit francs, s'il vous plaît.",
        themDe: "Das macht 78 Franken, bitte. (septante = 70!)",
        task: "Frag, ob du mit Karte zahlen kannst.",
        accept: [["carte", "twint"]],
        examples: ["Je peux payer par carte ?", "Je peux payer avec Twint ?"],
        help: [{ fr: "Je peux payer par carte ?", de: "Kann ich mit Karte zahlen?" }],
      },
    ],
    end: { fr: "Bien sûr ! Merci et bonne soirée !", de: "Natürlich! Danke und einen schönen Abend!" },
  },
  {
    id: "meinung",
    emoji: "💬",
    title: "Eine Meinung sagen",
    goal: "Sag deine Meinung, widersprich und gib recht.",
    role: "Julien, ein Freund mit starken Meinungen",
    steps: [
      {
        them: "Dis, tu préfères les vacances à la montagne ou à la mer ?",
        themDe: "Sag mal, magst du lieber Ferien in den Bergen oder am Meer?",
        task: "Sag deine Meinung.",
        accept: [["prefere", "trouve", "aime", "mieux", "pense"]],
        examples: ["Je préfère la montagne.", "Moi, je trouve que la mer, c'est mieux."],
        help: [
          { fr: "Je préfère …", de: "Ich habe lieber …" },
          { fr: "Je trouve que …", de: "Ich finde, dass …" },
        ],
      },
      {
        them: "Ah bon ? Moi, je trouve la montagne un peu ennuyeuse.",
        themDe: "Ach so? Ich finde die Berge etwas langweilig.",
        task: "Widersprich höflich.",
        accept: [["pas", "non"]],
        examples: ["Ah non, je ne suis pas d'accord !", "Je ne trouve pas, c'est super beau."],
        help: [
          { fr: "Je ne suis pas d'accord.", de: "Ich bin nicht einverstanden." },
          { fr: "Je ne trouve pas.", de: "Finde ich nicht." },
        ],
      },
      {
        them: "Mais la mer, c'est plus relax, non ?",
        themDe: "Aber das Meer ist entspannter, oder?",
        task: "Gib ihm teilweise recht.",
        accept: [["raison", "vrai", "mais", "peut-etre"]],
        examples: ["C'est vrai, mais la montagne, c'est plus calme.", "T'as un peu raison."],
        help: [
          { fr: "C'est vrai, mais …", de: "Das stimmt, aber …" },
          { fr: "T'as un peu raison.", de: "Du hast ein bisschen recht." },
        ],
      },
      {
        them: "Et le foot ? T'es pour quelle équipe ?",
        themDe: "Und Fussball? Für welches Team bist du?",
        task: "Sag, welches Team du magst – oder dass dich Fussball nicht interessiert.",
        accept: [["pour", "supporter", "fan", "interesse", "aime", "bof", "pas"]],
        examples: ["Je suis pour YB !", "Bof, le foot, ça ne m'intéresse pas trop."],
        help: [
          { fr: "Bof …", de: "Naja … (gleichgültig)" },
          { fr: "Ça ne m'intéresse pas.", de: "Das interessiert mich nicht." },
        ],
      },
      {
        them: "Haha, on ne sera jamais d'accord, toi et moi !",
        themDe: "Haha, wir werden uns nie einig, du und ich!",
        task: "Antworte locker, mit Humor.",
        accept: [["haha", "mais", "grave", "ok", "bon", "verre", "pas"]],
        examples: ["C'est pas grave, haha !", "Haha, mais on boit quand même un verre ensemble ?"],
        help: [{ fr: "C'est pas grave.", de: "Macht nichts." }],
      },
    ],
    end: { fr: "Ça, c'est d'accord ! Allez, santé !", de: "Da sind wir uns einig! Komm, Prost!" },
  },
];

// ---------------- Listening ----------------

export interface Dialogue {
  id: string;
  titel: string;
  situation: string;
  zeilen: { sprecher: string; fr: string; de: string }[];
  fragen: { frage: string; optionen: string[]; richtig: number }[];
  einstieg: string;
  beispiele: string[];
}

export const DIALOGUES: Dialogue[] = [
  {
    id: "lavaux",
    titel: "Ein Wochenende im Lavaux",
    situation: "Léa und Inès beim Apéro am Montag.",
    zeilen: [
      { sprecher: "Léa", fr: "Salut Inès ! Alors, ton week-end ?", de: "Hallo Inès! Und, dein Wochenende?" },
      { sprecher: "Inès", fr: "Trop bien ! Samedi, on est allés dans le Lavaux.", de: "Super! Am Samstag waren wir im Lavaux." },
      { sprecher: "Léa", fr: "Ah, sympa ! Il faisait beau ?", de: "Schön! War das Wetter gut?" },
      { sprecher: "Inès", fr: "Grand soleil ! On a fait une balade dans les vignes et on a bu un verre à Cully.", de: "Strahlender Sonnenschein! Wir sind durch die Reben spaziert und haben in Cully etwas getrunken." },
      { sprecher: "Léa", fr: "Ça a l'air génial. Moi, j'ai bossé tout le samedi…", de: "Klingt toll. Ich habe den ganzen Samstag gearbeitet…" },
      { sprecher: "Inès", fr: "Oh non ! Et dimanche ?", de: "Oh nein! Und am Sonntag?" },
      { sprecher: "Léa", fr: "Dimanche, j'ai dormi jusqu'à midi, haha.", de: "Am Sonntag habe ich bis Mittag geschlafen, haha." },
    ],
    fragen: [
      { frage: "Wo war Inès am Samstag?", optionen: ["In Genf", "Im Lavaux", "In den Bergen"], richtig: 1 },
      { frage: "Was hat Léa am Sonntag gemacht?", optionen: ["Gearbeitet", "Wandern", "Lange geschlafen"], richtig: 2 },
    ],
    einstieg: "Erzähl kurz, was du am Wochenende gemacht hast.",
    beispiele: ["Moi, samedi, j'ai fait une randonnée.", "Moi aussi, j'ai dormi longtemps dimanche !"],
  },
  {
    id: "resto",
    titel: "Das neue Restaurant",
    situation: "Camille und Julien in der Mittagspause.",
    zeilen: [
      { sprecher: "Camille", fr: "Dis, tu connais le nouveau resto à côté de la gare ?", de: "Sag mal, kennst du das neue Restaurant beim Bahnhof?" },
      { sprecher: "Julien", fr: "Le thaï ? Oui, j'y suis allé mardi.", de: "Das Thailändische? Ja, ich war am Dienstag dort." },
      { sprecher: "Camille", fr: "Et alors, c'est bon ?", de: "Und, ist es gut?" },
      { sprecher: "Julien", fr: "Super bon, mais un peu cher. J'ai payé quarante balles pour un plat.", de: "Sehr gut, aber etwas teuer. Ich habe vierzig Stutz für ein Gericht bezahlt." },
      { sprecher: "Camille", fr: "Quarante francs ? C'est pas donné !", de: "Vierzig Franken? Das ist nicht gerade billig!" },
      { sprecher: "Julien", fr: "Non, mais ça vaut le coup. On y va ensemble un soir ?", de: "Nein, aber es lohnt sich. Gehen wir mal abends zusammen hin?" },
      { sprecher: "Camille", fr: "Ça joue ! Jeudi, ça te va ?", de: "Abgemacht! Passt dir Donnerstag?" },
    ],
    fragen: [
      { frage: "Was für ein Restaurant ist es?", optionen: ["Italienisch", "Thailändisch", "Schweizerisch"], richtig: 1 },
      { frage: "Wie findet Julien es?", optionen: ["Gut, aber teuer", "Günstig, aber schlecht", "Zu scharf"], richtig: 0 },
    ],
    einstieg: "Sag, dass du auch mitkommen möchtest.",
    beispiele: ["Je peux venir avec vous ?", "Moi aussi, j'ai envie de le tester !"],
  },
  {
    id: "ferien",
    titel: "Ferienpläne",
    situation: "Sophie und Léa reden über den Sommer.",
    zeilen: [
      { sprecher: "Sophie", fr: "Vous partez où cet été ?", de: "Wohin fahrt ihr diesen Sommer?" },
      { sprecher: "Léa", fr: "On hésite. Peut-être en Italie, ou en Corse.", de: "Wir sind unschlüssig. Vielleicht nach Italien oder Korsika." },
      { sprecher: "Sophie", fr: "La Corse, c'est magnifique ! J'y suis allée il y a deux ans.", de: "Korsika ist wunderschön! Ich war vor zwei Jahren dort." },
      { sprecher: "Léa", fr: "Ah ouais ? Vous avez pris le bateau ?", de: "Ah ja? Habt ihr die Fähre genommen?" },
      { sprecher: "Sophie", fr: "Oui, depuis Nice. Avec la voiture, c'est pratique.", de: "Ja, ab Nizza. Mit dem Auto ist das praktisch." },
      { sprecher: "Léa", fr: "Et toi, cette année ?", de: "Und du, dieses Jahr?" },
      { sprecher: "Sophie", fr: "Moi, je reste en Suisse. Une semaine à Zermatt, ça me suffit !", de: "Ich bleibe in der Schweiz. Eine Woche Zermatt reicht mir!" },
    ],
    fragen: [
      { frage: "Wohin will Léa vielleicht?", optionen: ["Italien oder Korsika", "Spanien", "Zermatt"], richtig: 0 },
      { frage: "Was macht Sophie dieses Jahr?", optionen: ["Sie fährt nach Nizza", "Sie bleibt in der Schweiz", "Sie geht nach Korsika"], richtig: 1 },
    ],
    einstieg: "Sag, wohin du gern in die Ferien gehen würdest.",
    beispiele: ["Moi, j'aimerais aller en Espagne.", "Moi aussi, je reste en Suisse cet été."],
  },
  {
    id: "stress",
    titel: "Stress bei der Arbeit",
    situation: "Marc und Inès nach Feierabend.",
    zeilen: [
      { sprecher: "Marc", fr: "T'as l'air crevée. Ça va ?", de: "Du siehst kaputt aus. Geht's?" },
      { sprecher: "Inès", fr: "Bof… J'ai trop de boulot en ce moment.", de: "Naja… Ich habe gerade zu viel Arbeit." },
      { sprecher: "Marc", fr: "Ton chef te met la pression ?", de: "Macht dein Chef Druck?" },
      { sprecher: "Inès", fr: "Ouais, on a un gros projet à finir avant vendredi.", de: "Ja, wir müssen ein grosses Projekt bis Freitag fertig machen." },
      { sprecher: "Marc", fr: "Courage ! Et après, tu prends congé ?", de: "Kopf hoch! Und danach nimmst du frei?" },
      { sprecher: "Inès", fr: "Oui, trois jours. Je vais pas toucher mon natel !", de: "Ja, drei Tage. Ich werde mein Handy nicht anrühren!" },
      { sprecher: "Marc", fr: "T'as raison. Tu le mérites.", de: "Recht hast du. Das hast du verdient." },
    ],
    fragen: [
      { frage: "Bis wann muss das Projekt fertig sein?", optionen: ["Bis Montag", "Bis Freitag", "Bis Ende Monat"], richtig: 1 },
      { frage: "Was macht Inès danach?", optionen: ["Drei Tage frei", "Sie kündigt", "Neues Handy kaufen"], richtig: 0 },
    ],
    einstieg: "Mach Inès Mut – oder erzähl von deinem Arbeitsstress.",
    beispiele: ["Courage, Inès !", "Moi aussi, j'ai beaucoup de boulot en ce moment."],
  },
  {
    id: "serie",
    titel: "Die neue Serie",
    situation: "Julien und Camille im Zug.",
    zeilen: [
      { sprecher: "Julien", fr: "T'as commencé la nouvelle série sur Netflix ?", de: "Hast du mit der neuen Serie auf Netflix angefangen?" },
      { sprecher: "Camille", fr: "Laquelle ? Y en a tellement !", de: "Welche? Es gibt so viele!" },
      { sprecher: "Julien", fr: "Celle avec le détective à Genève.", de: "Die mit dem Detektiv in Genf." },
      { sprecher: "Camille", fr: "Ah oui ! J'ai vu deux épisodes hier soir. J'adore !", de: "Ah ja! Ich habe gestern Abend zwei Folgen geschaut. Ich liebe sie!" },
      { sprecher: "Julien", fr: "Moi, j'ai tout regardé en un week-end, haha.", de: "Ich habe alles an einem Wochenende geschaut, haha." },
      { sprecher: "Camille", fr: "Chut ! Me dis pas la fin !", de: "Pst! Verrat mir nicht das Ende!" },
    ],
    fragen: [
      { frage: "Wo spielt die Serie?", optionen: ["In Lausanne", "In Genf", "In Paris"], richtig: 1 },
      { frage: "Wie viele Folgen hat Camille gesehen?", optionen: ["Zwei", "Alle", "Keine"], richtig: 0 },
    ],
    einstieg: "Sag, welche Serie du gerade schaust oder magst.",
    beispiele: ["Moi, je regarde une série coréenne en ce moment.", "J'adore les séries policières !"],
  },
  {
    id: "geburtstag",
    titel: "Eine Überraschungsparty",
    situation: "Léa und Sophie planen etwas.",
    zeilen: [
      { sprecher: "Léa", fr: "Samedi, c'est l'anniversaire de Camille. On organise quelque chose ?", de: "Am Samstag hat Camille Geburtstag. Organisieren wir etwas?" },
      { sprecher: "Sophie", fr: "Bonne idée ! Une surprise chez moi ?", de: "Gute Idee! Eine Überraschung bei mir?" },
      { sprecher: "Léa", fr: "Parfait. Moi, je fais le gâteau.", de: "Perfekt. Ich mache den Kuchen." },
      { sprecher: "Sophie", fr: "Et moi, j'achète les boissons. On invite qui ?", de: "Und ich kaufe die Getränke. Wen laden wir ein?" },
      { sprecher: "Léa", fr: "Les collègues du boulot, et Julien, bien sûr. Une quinzaine de personnes.", de: "Die Arbeitskollegen und natürlich Julien. Etwa fünfzehn Leute." },
      { sprecher: "Sophie", fr: "Ça joue. Rendez-vous à dix-neuf heures, et on éteint la lumière quand elle arrive !", de: "Abgemacht. Treffpunkt 19 Uhr, und wir machen das Licht aus, wenn sie kommt!" },
    ],
    fragen: [
      { frage: "Wer macht den Kuchen?", optionen: ["Sophie", "Léa", "Camille"], richtig: 1 },
      { frage: "Wie viele Leute kommen ungefähr?", optionen: ["Fünf", "Fünfzehn", "Fünfzig"], richtig: 1 },
    ],
    einstieg: "Biete an, etwas mitzubringen oder zu helfen.",
    beispiele: ["Je peux apporter une salade.", "Je peux aider à décorer !"],
  },
  {
    id: "wohnung",
    titel: "Wohnungssuche in Genf",
    situation: "Thomas und Inès am Telefon.",
    zeilen: [
      { sprecher: "Thomas", fr: "Alors, t'as trouvé un appart à Genève ?", de: "Und, hast du eine Wohnung in Genf gefunden?" },
      { sprecher: "Inès", fr: "Toujours pas ! C'est la galère.", de: "Immer noch nicht! Es ist ein Krampf." },
      { sprecher: "Thomas", fr: "Les loyers sont trop chers ?", de: "Sind die Mieten zu teuer?" },
      { sprecher: "Inès", fr: "Oui, deux mille huit cents francs pour un trois-pièces…", de: "Ja, 2800 Franken für eine Dreizimmerwohnung…" },
      { sprecher: "Thomas", fr: "Aïe. Et à Nyon ? C'est moins cher, et y a le train.", de: "Autsch. Und in Nyon? Das ist günstiger, und es gibt den Zug." },
      { sprecher: "Inès", fr: "C'est vrai, je vais regarder. Quinze minutes de train, ça va.", de: "Stimmt, ich schaue mal. Fünfzehn Minuten Zug, das geht." },
    ],
    fragen: [
      { frage: "Was ist das Problem?", optionen: ["Die Mieten sind zu teuer", "Es gibt keine Züge", "Sie mag Genf nicht"], richtig: 0 },
      { frage: "Was schlägt Thomas vor?", optionen: ["Lausanne", "Nyon", "Bern"], richtig: 1 },
    ],
    einstieg: "Sag, wo du wohnst und ob es teuer ist.",
    beispiele: ["Moi, j'habite à Berne. C'est un peu moins cher.", "Chez nous aussi, les loyers sont chers !"],
  },
  {
    id: "paleo",
    titel: "Tickets fürs Paléo",
    situation: "Camille und Marc reden über das Festival in Nyon.",
    zeilen: [
      { sprecher: "Camille", fr: "T'as des billets pour le Paléo ?", de: "Hast du Tickets fürs Paléo?" },
      { sprecher: "Marc", fr: "Oui ! Pour le jeudi et le samedi.", de: "Ja! Für Donnerstag und Samstag." },
      { sprecher: "Camille", fr: "La chance ! Moi, j'ai rien eu. C'était complet en dix minutes.", de: "Glück gehabt! Ich habe nichts bekommen. Es war in zehn Minuten ausverkauft." },
      { sprecher: "Marc", fr: "Attends, mon frère a peut-être un billet en trop pour samedi.", de: "Warte, mein Bruder hat vielleicht ein Ticket zu viel für Samstag." },
      { sprecher: "Camille", fr: "Sérieux ? Tu peux lui demander ?", de: "Im Ernst? Kannst du ihn fragen?" },
      { sprecher: "Marc", fr: "Je lui écris tout de suite.", de: "Ich schreibe ihm sofort." },
    ],
    fragen: [
      { frage: "Warum hat Camille keine Tickets?", optionen: ["Zu teuer", "Ausverkauft", "Keine Zeit"], richtig: 1 },
      { frage: "Wer hat vielleicht ein Ticket?", optionen: ["Marcs Bruder", "Marcs Freundin", "Camilles Schwester"], richtig: 0 },
    ],
    einstieg: "Sag, ob du gern an Festivals gehst.",
    beispiele: ["J'adore les festivals !", "Bof, y a trop de monde pour moi."],
  },
  {
    id: "souper",
    titel: "Was gibt's zum Souper?",
    situation: "Léa und Thomas am Telefon, auf dem Heimweg.",
    zeilen: [
      { sprecher: "Thomas", fr: "On mange quoi ce soir ?", de: "Was essen wir heute Abend?" },
      { sprecher: "Léa", fr: "J'ai pas envie de cuisiner… Une raclette ?", de: "Ich habe keine Lust zu kochen… Ein Raclette?" },
      { sprecher: "Thomas", fr: "En plein été ? T'es folle, haha !", de: "Mitten im Sommer? Du spinnst, haha!" },
      { sprecher: "Léa", fr: "Bon, alors des pâtes. C'est rapide.", de: "Gut, dann Pasta. Das geht schnell." },
      { sprecher: "Thomas", fr: "Ça joue. J'achète du pain à la Migros en rentrant ?", de: "Passt. Soll ich auf dem Heimweg Brot in der Migros kaufen?" },
      { sprecher: "Léa", fr: "Oui, et une salade aussi. Et n'oublie pas le cornet !", de: "Ja, und auch einen Salat. Und vergiss die Tüte nicht! (cornet = Tüte, Schweiz)" },
    ],
    fragen: [
      { frage: "Warum kein Raclette?", optionen: ["Kein Käse da", "Es ist Sommer", "Zu teuer"], richtig: 1 },
      { frage: "Was soll Thomas kaufen?", optionen: ["Brot und Salat", "Pasta und Wein", "Käse"], richtig: 0 },
    ],
    einstieg: "Sag, was du heute Abend gern essen würdest.",
    beispiele: ["Moi, j'ai envie d'une pizza.", "Une raclette, même en été !"],
  },
];

// ---------------- Phrasebook («Wie sag ich das?») ----------------

export interface Entry {
  cat: string;
  de: string;
  fr: string;
  note?: string;
  /** extra German search words */
  tags?: string;
}

export const PHRASEBOOK: Entry[] = [
  // Begrüssen
  { cat: "Begrüssen", de: "Hallo! / Tschüss! (locker)", fr: "Salut !", tags: "hoi hallo gruss" },
  { cat: "Begrüssen", de: "Guten Tag / Grüezi", fr: "Bonjour !", note: "Beim Betreten von Läden immer «Bonjour» sagen." },
  { cat: "Begrüssen", de: "Guten Abend", fr: "Bonsoir !" },
  { cat: "Begrüssen", de: "Wie geht's?", fr: "Ça va ?", tags: "gehts" },
  { cat: "Begrüssen", de: "Gut, und dir?", fr: "Ça va bien, et toi ?", tags: "antwort" },
  { cat: "Begrüssen", de: "Freut mich!", fr: "Enchanté !", note: "Eine Frau schreibt «Enchantée», man hört keinen Unterschied." },
  { cat: "Begrüssen", de: "Bis bald!", fr: "À tout bientôt !", note: "Typisch Romandie.", tags: "tschüss abschied" },
  { cat: "Begrüssen", de: "Bis später!", fr: "À plus !", tags: "tschüss abschied" },
  { cat: "Begrüssen", de: "Tschüss (Waadt/Wallis)", fr: "Adieu !", note: "In der Waadt und im Wallis ein normaler Gruss – nicht «Lebewohl».", tags: "abschied" },
  { cat: "Begrüssen", de: "Schönen Abend!", fr: "Bonne soirée !", tags: "abschied" },
  { cat: "Begrüssen", de: "Schönes Wochenende!", fr: "Bon week-end !", tags: "abschied" },
  { cat: "Begrüssen", de: "Küsschen (zur Begrüssung)", fr: "On se fait la bise ?", note: "In der Romandie: 3 Küsschen, links-rechts-links.", tags: "kuss bise" },
  // Smalltalk
  { cat: "Smalltalk", de: "Was gibt's Neues?", fr: "Quoi de neuf ?" },
  { cat: "Smalltalk", de: "Nicht viel.", fr: "Pas grand-chose." },
  { cat: "Smalltalk", de: "Was machst du beruflich?", fr: "Tu fais quoi dans la vie ?", tags: "arbeit job beruf" },
  { cat: "Smalltalk", de: "Woher kommst du?", fr: "Tu viens d'où ?" },
  { cat: "Smalltalk", de: "Ich komme aus der Deutschschweiz.", fr: "Je viens de Suisse alémanique.", tags: "herkunft" },
  { cat: "Smalltalk", de: "Ich wohne in …", fr: "J'habite à …" },
  { cat: "Smalltalk", de: "Was hast du am Wochenende gemacht?", fr: "T'as fait quoi ce week-end ?" },
  { cat: "Smalltalk", de: "Es ist schönes Wetter.", fr: "Il fait beau.", tags: "wetter sonne" },
  { cat: "Smalltalk", de: "Es regnet.", fr: "Il pleut.", tags: "wetter" },
  { cat: "Smalltalk", de: "Es ist heiss / kalt.", fr: "Il fait chaud / froid.", tags: "wetter" },
  { cat: "Smalltalk", de: "Ich bin müde.", fr: "Je suis crevé.", note: "Locker. Neutral: «Je suis fatigué».", tags: "müde kaputt" },
  { cat: "Smalltalk", de: "Ich lerne Französisch.", fr: "J'apprends le français." },
  // Verstehen
  { cat: "Verstehen", de: "Ich verstehe nicht.", fr: "Je ne comprends pas.", tags: "versteh" },
  { cat: "Verstehen", de: "Kannst du das wiederholen?", fr: "Tu peux répéter, s'il te plaît ?", tags: "nochmal" },
  { cat: "Verstehen", de: "Langsamer, bitte.", fr: "Plus lentement, s'il te plaît.", tags: "langsam" },
  { cat: "Verstehen", de: "Was heisst …?", fr: "Ça veut dire quoi, … ?", tags: "bedeutet bedeutung" },
  { cat: "Verstehen", de: "Wie sagt man … auf Französisch?", fr: "Comment on dit … en français ?" },
  { cat: "Verstehen", de: "Ich habe verstanden.", fr: "J'ai compris.", tags: "kapiert" },
  { cat: "Verstehen", de: "Mein Französisch ist nicht so gut.", fr: "Mon français n'est pas terrible.", tags: "schlecht" },
  // Meinung
  { cat: "Meinung", de: "Ich finde, dass …", fr: "Je trouve que …", tags: "meinung denke" },
  { cat: "Meinung", de: "Ich denke, dass …", fr: "Je pense que …" },
  { cat: "Meinung", de: "Du hast recht.", fr: "T'as raison.", tags: "stimmt" },
  { cat: "Meinung", de: "Das stimmt.", fr: "C'est vrai." },
  { cat: "Meinung", de: "Ich bin nicht einverstanden.", fr: "Je ne suis pas d'accord.", tags: "dagegen" },
  { cat: "Meinung", de: "Ich auch.", fr: "Moi aussi." },
  { cat: "Meinung", de: "Ich auch nicht.", fr: "Moi non plus." },
  { cat: "Meinung", de: "Naja … / Mir egal.", fr: "Bof …", tags: "egal" },
  { cat: "Meinung", de: "Cool! / Mega!", fr: "Trop bien !", tags: "super toll" },
  { cat: "Meinung", de: "Das ist lustig.", fr: "C'est marrant.", tags: "witzig" },
  // Essen & Trinken
  { cat: "Essen", de: "Ich hätte gern …", fr: "Je voudrais …", tags: "bestellen" },
  { cat: "Essen", de: "Die Rechnung, bitte.", fr: "L'addition, s'il vous plaît.", tags: "zahlen" },
  { cat: "Essen", de: "Kann ich mit Karte zahlen?", fr: "Je peux payer par carte ?", tags: "zahlen twint" },
  { cat: "Essen", de: "Es ist köstlich!", fr: "C'est délicieux !", tags: "fein lecker gut" },
  { cat: "Essen", de: "En Guete!", fr: "Bon appétit !" },
  { cat: "Essen", de: "Prost!", fr: "Santé !", note: "Beim Anstossen in die Augen schauen!", tags: "anstossen" },
  { cat: "Essen", de: "Frühstück / Mittagessen / Abendessen", fr: "le déjeuner / le dîner / le souper", note: "So sagt man es in der Schweiz (in Frankreich anders!).", tags: "zmorge zmittag znacht" },
  { cat: "Essen", de: "Ich habe Hunger.", fr: "J'ai faim." },
  { cat: "Essen", de: "Ich bin satt.", fr: "Je n'ai plus faim.", tags: "voll" },
  { cat: "Essen", de: "ein Glas Weisswein", fr: "un verre de blanc", tags: "wein" },
  { cat: "Essen", de: "ein Krug Leitungswasser", fr: "une carafe d'eau", tags: "wasser" },
  { cat: "Essen", de: "Tüte / Sack (im Laden)", fr: "un cornet", note: "Schweizer Wort. In Frankreich: «un sac».", tags: "tasche" },
  // Abmachen
  { cat: "Abmachen", de: "Hast du Lust auf …?", fr: "Ça te dit, … ?", tags: "lust" },
  { cat: "Abmachen", de: "Passt! / Abgemacht!", fr: "Ça joue !", note: "Typisch Schweiz – sehr nützlich!", tags: "ok gut" },
  { cat: "Abmachen", de: "Passt dir das?", fr: "Ça te va ?" },
  { cat: "Abmachen", de: "Wann treffen wir uns?", fr: "On se voit quand ?", tags: "treffen" },
  { cat: "Abmachen", de: "Um wie viel Uhr?", fr: "À quelle heure ?", tags: "zeit" },
  { cat: "Abmachen", de: "Sollen wir etwas mitbringen?", fr: "On apporte quelque chose ?" },
  { cat: "Abmachen", de: "Ich freue mich!", fr: "Je me réjouis !", note: "Typisch Schweiz. In Frankreich: «J'ai hâte !».", tags: "freude" },
  { cat: "Abmachen", de: "Ich bin dabei.", fr: "Je suis partant." },
  { cat: "Abmachen", de: "Ich komme etwas später.", fr: "J'arrive un peu plus tard.", tags: "verspätung" },
  { cat: "Abmachen", de: "Gern geschehen / Bitte", fr: "Service !", note: "Schweizer Antwort auf «Merci».", tags: "bitte danke" },
  // Für sie
  { cat: "Für sie", de: "Ich liebe dich.", fr: "Je t'aime." },
  { cat: "Für sie", de: "Du fehlst mir.", fr: "Tu me manques.", note: "Achtung: wörtlich «du fehlst mir» – nicht «je te manque»!", tags: "vermisse vermissen" },
  { cat: "Für sie", de: "Hast du gut geschlafen?", fr: "Tu as bien dormi ?" },
  { cat: "Für sie", de: "Wie war dein Tag?", fr: "C'était comment, ta journée ?" },
  { cat: "Für sie", de: "Du bist schön.", fr: "Tu es belle." },
  { cat: "Für sie", de: "Ich denke an dich.", fr: "Je pense à toi." },
  { cat: "Für sie", de: "Ich bin stolz auf dich.", fr: "Je suis fier de toi." },
  { cat: "Für sie", de: "Schatz", fr: "mon cœur / ma chérie", tags: "liebling" },
  { cat: "Für sie", de: "Gute Nacht, schlaf gut.", fr: "Bonne nuit, dors bien.", tags: "nacht" },
  { cat: "Für sie", de: "Es tut mir leid.", fr: "Je suis désolé.", tags: "entschuldigung sorry" },
  // Zahlen
  { cat: "Zahlen", de: "70 / 80 / 90", fr: "septante / {80} / nonante", note: "Schweiz! In Frankreich: soixante-dix / quatre-vingts / quatre-vingt-dix.", tags: "zahl siebzig achtzig neunzig" },
  { cat: "Zahlen", de: "Wie viel kostet das?", fr: "C'est combien ?", tags: "preis kosten" },
  { cat: "Zahlen", de: "Franken (locker)", fr: "balles", note: "«Vingt balles» = 20 Stutz.", tags: "stutz geld" },
  { cat: "Zahlen", de: "Handy", fr: "le natel", note: "Schweizer Wort. In Frankreich: «le portable».", tags: "telefon" },
];

// ---------------- Daily phrases ----------------

export const DAILY: { fr: string; de: string; kontext: string }[] = [
  { fr: "Tu as bien dormi ?", de: "Hast du gut geschlafen?", kontext: "Am Morgen, beim déjeuner." },
  { fr: "C'était comment, ta journée ?", de: "Wie war dein Tag?", kontext: "Wenn sie am Abend nach Hause kommt." },
  { fr: "Je pense à toi.", de: "Ich denke an dich.", kontext: "Per WhatsApp, in der Mittagspause." },
  { fr: "On mange quoi ce soir ?", de: "Was essen wir heute Abend?", kontext: "Am Nachmittag per Nachricht." },
  { fr: "Tu me manques.", de: "Du fehlst mir.", kontext: "Wenn ihr euch einen Tag nicht seht." },
  { fr: "Bonne nuit, dors bien.", de: "Gute Nacht, schlaf gut.", kontext: "Vor dem Einschlafen." },
  { fr: "Ça te dit, un film ce soir ?", de: "Hast du Lust auf einen Film heute Abend?", kontext: "Nach dem Souper." },
  { fr: "Tu es belle aujourd'hui.", de: "Du bist schön heute.", kontext: "Einfach so – wirkt immer." },
  { fr: "Je me réjouis de te voir !", de: "Ich freue mich, dich zu sehen!", kontext: "Bevor ihr euch trefft." },
  { fr: "Merci pour le souper, c'était délicieux !", de: "Danke fürs Abendessen, es war köstlich!", kontext: "Wenn sie gekocht hat." },
  { fr: "Je fais le café ?", de: "Soll ich Kaffee machen?", kontext: "Am Morgen." },
  { fr: "Tu veux faire quoi ce week-end ?", de: "Was willst du am Wochenende machen?", kontext: "Am Donnerstag oder Freitag." },
  { fr: "Je t'aime fort.", de: "Ich liebe dich sehr.", kontext: "Wann immer du willst." },
  { fr: "Il fait trop beau, on va se promener ?", de: "Es ist so schön, gehen wir spazieren?", kontext: "An einem sonnigen Tag." },
  { fr: "Tu as besoin de quelque chose à la Migros ?", de: "Brauchst du etwas aus der Migros?", kontext: "Bevor du einkaufen gehst." },
  { fr: "Je suis fier de toi.", de: "Ich bin stolz auf dich.", kontext: "Wenn ihr etwas gelungen ist." },
  { fr: "Tu m'apprends un mot en français ?", de: "Bringst du mir ein Wort auf Französisch bei?", kontext: "Beim Kaffee – sie wird sich freuen." },
  { fr: "On se fait un apéro ?", de: "Machen wir einen Apéro?", kontext: "Am Freitagabend." },
  { fr: "Tu as passé une bonne journée ?", de: "Hattest du einen guten Tag?", kontext: "Am Abend." },
  { fr: "J'ai appris une nouvelle phrase aujourd'hui !", de: "Ich habe heute einen neuen Satz gelernt!", kontext: "Nach deiner Session." },
  { fr: "Ça joue pour toi ?", de: "Passt das für dich?", kontext: "Wenn ihr etwas abmacht." },
  { fr: "Tu veux un verre de blanc ?", de: "Willst du ein Glas Weisswein?", kontext: "Beim Apéro." },
  { fr: "Qu'est-ce que tu as envie de manger ?", de: "Worauf hast du Lust zu essen?", kontext: "Vor dem Souper." },
  { fr: "Dors bien, à demain !", de: "Schlaf gut, bis morgen!", kontext: "Als Gute-Nacht-Nachricht." },
  { fr: "Tu es la meilleure.", de: "Du bist die Beste.", kontext: "Wenn sie dir hilft." },
  { fr: "On se voit à quelle heure ?", de: "Um wie viel Uhr sehen wir uns?", kontext: "Per WhatsApp." },
  { fr: "Je t'invite au resto ce soir.", de: "Ich lade dich heute Abend ins Restaurant ein.", kontext: "Für eine Überraschung." },
];

// ---------------- Starter building blocks ----------------

export const STARTER_EXPRESSIONS: Phrase[] = [
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
  { fr: "Ça joue !", de: "Passt! / Abgemacht!" },
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
