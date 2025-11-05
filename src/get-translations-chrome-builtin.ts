declare class Translator {
  static create(config: {
    sourceLanguage: string;
    targetLanguage: string;
    monitor?: (monitor: EventTarget) => void;
  }): Translator;
  static availability(config: {
    sourceLanguage: string;
    targetLanguage: string;
  }): string;
  translate: (text: string) => string;
}
const translators: { [fromto: string]: Translator } = {};

export async function getAllTranslations(
  text: string,
  from: string,
  languages: string[]
): Promise<{ [key: string]: string }> {
  const targets = languages.filter((value) => from != value);
  const results: { [key: string]: string } = {};
  const translations = await Promise.all(
    targets.map((to) => getTranslation(text, from, to))
  );
  targets.forEach((to, i) => {
    results[to] = translations[i];
  });
  results[from] = text;
  return results;
}

export async function loadTranslator(
  from: string,
  to: string,
  progressCallback: (status: string) => void
) {
  const fromto = `${from}-${to}`;
  try {
    const availability = await Translator.availability({
      sourceLanguage: from,
      targetLanguage: to,
    });
    if (availability == "downloadable" || availability == "available") {
      translators[fromto] = await Translator.create({
        sourceLanguage: from,
        targetLanguage: to,
        monitor(m) {
          m.addEventListener("downloadprogress", (e: any) => {
            console.log(`Downloading ${fromto} ${Math.round(e.loaded * 100)}%`);
            progressCallback(
              `Downloading ${fromto} ${Math.round(e.loaded * 100)}%`
            );
          });
        },
      });
      progressCallback("Translators loaded!");
    } else {
      console.log(`${fromto} is ${availability}!`);
    }
  } catch (err) {
    console.log(`failed to create translator ${fromto}`, err);
  }
}

export async function loadChromeTranslators(
  languages: string[],
  progressCallback: (status: string) => void,
  setNeedsUserActivation: (state: number) => void
) {
  let missing = 0;
  for (let i = 0; i < languages.length; i++) {
    for (let j = 0; j < languages.length; j++) {
      if (i == j) {
        continue;
      }
      const from = languages[i];
      const to = languages[j];
      const fromto = `${from}-${to}`;
      if (!(fromto in translators)) {
        if (navigator.userActivation.isActive === true) {
          await loadTranslator(from, to, progressCallback);
        } else {
          missing += 1;
        }
      }
    }
  }
  setNeedsUserActivation(missing);
  return translators;
}

async function getTranslation(
  text: string,
  from: string,
  to: string
): Promise<string> {
  const fromto = `${from}-${to}`;

  const currentTranslator = translators[fromto];
  if (!currentTranslator) return "Language pair not loaded, please load it!";
  return currentTranslator.translate(text);
}
