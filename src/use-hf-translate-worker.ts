import { useEffect, useRef } from "react";
import { BCP47toFLORES200 } from "./language-tags";

export function useHFTranslateWorker(
  setTranslations: React.Dispatch<
    React.SetStateAction<{
      [key: string]: string;
    }>
  >,
  setDownloadProgress: React.Dispatch<React.SetStateAction<string>>
) {
  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    if (!worker.current && !("Translator" in self)) {
      worker.current = new Worker(new URL("./worker.ts", import.meta.url), {
        type: "module",
      });
    }

    const onMessageReceived = (e: any) => {
      console.log(e.data);
      switch (e.data.status) {
        case "update":
        case "translated":
          setTranslations((prev) => ({
            ...prev,
            [e.data.to]: e.data.translation,
          }));
          break;
        case "progress":
          setDownloadProgress(
            `Downloading ${e.data.file} ${Math.round(e.data.progress)}%`
          );
          break;
        case "ready":
          setDownloadProgress("Translators loaded!");
          break;
      }
    };

    worker.current?.addEventListener("message", onMessageReceived);

    return () =>
      worker.current?.removeEventListener("message", onMessageReceived);
  }, []);

  return (text: string, from: string, to: string) => {
    if (worker.current == null) return;
    worker.current.postMessage({
      text: text,
      src_lang: BCP47toFLORES200(from),
      tgt_lang: BCP47toFLORES200(to),
    });
  };
}
