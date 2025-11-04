import { iso6393 } from "iso-639-3";

const mapping = Object.fromEntries(
  iso6393.filter((v) => "iso6391" in v).map((v) => [v["iso6391"], v])
);

export function validBCP47(tag: string) {
  return tag in mapping;
}

export function BCP47toISO6393(tag: string) {
  if (!validBCP47(tag)) return "*";
  return mapping[tag]["iso6393"];
}
