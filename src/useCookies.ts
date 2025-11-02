import { useEffect, useState } from "react";

function getCookie(name: string) {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(name + "="));
  return match
    ? decodeURIComponent(match.split("=").slice(1).join("="))
    : undefined;
}

export function useCookie<T>(
  name: string,
  initial: T,
  parse: (cookie: string) => T,
  serialize: (value: T) => string
): [T, React.Dispatch<T>] {
  const [cookieValue, setCookieValue] = useState(initial);

  useEffect(() => {
    const freshCookieValue = getCookie(name);
    if (freshCookieValue) {
      setCookieValue(parse(freshCookieValue));
    }
  }, []);

  function updateValue(value: T) {
    const serialized = serialize(value);
    if (serialized) {
      document.cookie = `${name}=${serialized}; path=/`;
      setCookieValue(value);
    }
  }

  return [cookieValue, updateValue];
}
