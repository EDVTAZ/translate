import { useState } from "react";
import { getAllTranslations } from "./get-translations";
import "./App.css";
import { useCookie } from "./useCookies";

function App() {
  const [APIkey, setAPIkey] = useCookie(
    "APIkey",
    "",
    (v) => v,
    (v) => v
  );
  const [languages, setLangues] = useCookie<string[]>(
    "languages",
    [],
    (v) => v.split(","),
    (v) => v.join(",")
  );
  const [translations, setTranslations] = useState<{ [key: string]: string[] }>(
    {}
  );
  const [showAPIkey, setShowAPIkey] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState("");

  return (
    <>
      <div className="card">
        <button onClick={() => setShowAPIkey(!showAPIkey)}>Set API key</button>
        <button onClick={() => setShowLanguages(!showLanguages)}>
          Set languages
        </button>
        {showAPIkey && (
          <div>
            API key:
            <input
              defaultValue={APIkey}
              onChange={(ev) => setAPIkey(ev.target.value)}
            ></input>
          </div>
        )}
        {showLanguages && (
          <div>
            Languages:
            <input
              defaultValue={languages}
              onChange={(ev) => setLangues(ev.target.value.split(","))}
            ></input>
          </div>
        )}
      </div>
      {languages.map((language) => {
        return (
          <>
            <div onClick={() => setActiveLanguage(language)} key={language}>
              <div>{language}</div>
              {language == activeLanguage && (
                <div>
                  <input
                    onKeyDown={(ev) => {
                      if (ev.key == "Enter") {
                        setActiveLanguage("");
                        getAllTranslations(
                          (ev.target as HTMLInputElement).value,
                          language,
                          languages,
                          APIkey
                        ).then((result) => {
                          setTranslations(result);
                        });
                      }
                    }}
                  />
                </div>
              )}
              <div>
                {translations[language]?.map((translation, i) => (
                  <div key={`${language}-${i}-translation`}>{translation}</div>
                ))}
              </div>
            </div>
            <hr />
          </>
        );
      })}
    </>
  );
}

export default App;
