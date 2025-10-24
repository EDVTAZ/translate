import { useMemo, useState } from "react";
import "./App.css";

function App() {
  const [APIkey, setAPIkey] = useState("");

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <input onChange={(ev) => setAPIkey(ev.target.value)}></input>
        <button
          onClick={() =>
            fetch(
              `https://translation.googleapis.com/language/translate/v2?key=${APIkey}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  source: "en",
                  target: "nl",
                  q: "hello there",
                }),
              }
            ).then((response) =>
              response.json().then((value) => console.log(value))
            )
          }
        ></button>
      </div>
    </>
  );
}

export default App;
