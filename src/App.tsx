import { useEffect, useState } from "react";
import { getAllTranslations, loadTranslators } from "./get-translations";
import "./App.css";
import { useCookie } from "./useCookies";

function App() {
  const [languages, setLangues] = useCookie<string[]>(
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

  useEffect(() => {
    loadTranslators(languages, setDownloadProgress, setNeedsUserActivation);
  }, [languages.join()]);

  return "Translator" in self ? (
    <>
      <div className="card">
        <div>
          Languages:
          <input
            defaultValue={languages}
            onChange={(ev) => setLangues(ev.target.value.split(","))}
          ></input>
        </div>
        {needsUserActivation ? (
          <button
            onClick={() => {
              setNeedsUserActivation(0);
              loadTranslators(
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
                      getAllTranslations(toTranslate, language, languages).then(
                        (result) => {
                          setTranslations(result);
                        }
                      );
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
  ) : (
    <div>Chrome Translator API not available!</div>
  );
}

export default App;
