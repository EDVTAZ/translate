import { useState } from "react";
import { getAllTranslations } from "./get-translations";
import "./App.css";
import { useCookies } from "./useCookies";
import { useEffect } from "react";

function App() {
  const [APIkey, setAPIkey] = useState("");
  const [languages, setLangues] = useState<string[]>([]);
  const [translations, setTranslations] = useState<{ [key: string]: string[] }>(
    {}
  );

  useCookies(setAPIkey, setLangues);
  useEffect(() => {
    if (APIkey) {
      document.cookie = `APIkey=${APIkey}; path=/`;
    }
  }, [APIkey]);
  useEffect(() => {
    if (languages) {
      document.cookie = `languages=${languages}; path=/`;
    }
  }, [languages]);

  return (
    <>
      <div className="card">
        <div>
          <p>API key: </p>
          <input
            defaultValue={APIkey}
            onChange={(ev) => setAPIkey(ev.target.value)}
          ></input>
        </div>
        <div>
          <p>Languages: </p>
          <input
            defaultValue={languages}
            onChange={(ev) => setLangues(ev.target.value.split(","))}
          ></input>
        </div>
      </div>
      {languages.map((language) => {
        return (
          <div key={language} className="card">
            <div>{language}</div>
            <div>
              <input
                onKeyDown={(ev) => {
                  if (ev.key == "Enter") {
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
            <div>
              {translations[language]?.map((translation) => (
                <div key={`${language}-translation`}>{translation}</div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default App;
