import { useEffect, useState } from "react";
import {
  getAllTranslations,
  loadChromeTranslators,
} from "./get-translations-chrome-builtin";
import "./App.css";
import { useCookie } from "./useCookies";
import { validBCP47 } from "./language-tags";
import { useHFTranslateWorker } from "./use-hf-translate-worker";

function App() {
  const [languages, setLanguages] = useCookie<string[]>(
    "languages",
    [],
    (v) => v.split(","),
    (v) => v.join(",")
  );
  const [translations, setTranslations] = useState<{ [key: string]: string }>(
    {}
  );
  const [activeLanguage, setActiveLanguage] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(
    "Translators loaded!"
  );
  const [needsUserActivation, setNeedsUserActivation] = useState(0);
  const llmTranslate = useHFTranslateWorker(
    setTranslations,
    setDownloadProgress
  );

  useEffect(() => {
    if ("Translator" in self) {
      loadChromeTranslators(
        languages,
        setDownloadProgress,
        setNeedsUserActivation
      );
    }
  }, [languages.join()]);

  return (
    <>
      <div className="card">
        <div>
          Languages:
          <input
            defaultValue={languages}
            onChange={(ev) =>
              setLanguages(ev.target.value.split(",").filter(validBCP47))
            }
          ></input>
        </div>
        {needsUserActivation ? (
          <button
            onClick={() => {
              setNeedsUserActivation(0);
              loadChromeTranslators(
                languages,
                setDownloadProgress,
                setNeedsUserActivation
              );
            }}
          >
            Load translators! ({needsUserActivation} missing)
          </button>
        ) : (
          <div>{downloadProgress}</div>
        )}
      </div>
      <hr />
      {languages.map((language) => (
        <div
          className="language-item"
          onClick={() => setActiveLanguage(language)}
          key={language}
        >
          <div className="language-row">
            {language !== activeLanguage && (
              <div className="translations">{translations[language]}</div>
            )}

            {language === activeLanguage && language && (
              <div className="language-input">
                <input
                  autoFocus
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter") {
                      setActiveLanguage("");
                      const toTranslate = (ev.target as HTMLInputElement).value;
                      const newTranslations = Object.fromEntries(
                        languages.map((v) => [v, ""])
                      );
                      newTranslations[language] = toTranslate;
                      setTranslations(newTranslations);
                      if ("Translator" in self) {
                        getAllTranslations(
                          toTranslate,
                          language,
                          languages
                        ).then((result) => {
                          setTranslations(result);
                        });
                      } else {
                        languages
                          .filter((value) => language != value)
                          .forEach((targetl) =>
                            llmTranslate(toTranslate, language, targetl)
                          );
                      }
                    }
                  }}
                />
              </div>
            )}
            <div className="language-name">{language}</div>
          </div>
          <hr />
        </div>
      ))}
    </>
  );
}

export default App;
