import { useEffect } from "react";

function getCookie(name: string) {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(name + "="));
  return match
    ? decodeURIComponent(match.split("=").slice(1).join("="))
    : undefined;
}

export function useCookies(
  setAPIkey: React.Dispatch<React.SetStateAction<string>>,
  setLanguages: React.Dispatch<React.SetStateAction<string[]>>
) {
  useEffect(() => {
    const ckApi = getCookie("APIkey");
    const ckLang = getCookie("languages");

    if (ckApi) setAPIkey(ckApi);
    if (ckLang) setLanguages(ckLang.split(","));
  }, []);
}
