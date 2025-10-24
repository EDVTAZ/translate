export async function getAllTranslations(
  text: string,
  from: string,
  languages: string[],
  key: string
): Promise<{ [key: string]: string[] }> {
  const targets = languages.filter((value) => from != value);
  const results: { [key: string]: string[] } = {};
  const translations = await Promise.all(
    targets.map((to) => getTranslation(text, from, to, key))
  );
  targets.forEach((to, i) => {
    results[to] = translations[i];
  });
  results[from] = [text];
  return results;
}

export async function getTranslation(
  text: string,
  from: string,
  to: string,
  key: string
): Promise<string[]> {
  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${key}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: from,
        target: to,
        q: text,
      }),
    }
  );
  if (response.ok) {
    const data = await response.json();
    return data["data"]["translations"].map((element: any) => {
      return element["translatedText"];
    });
  }
  return [];
}
