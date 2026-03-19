export const ENVIRONMENTS = [
  { key: "dev", label: "Development", host: "https://api-dev.i-esg.kr" },
  { key: "stg", label: "Staging", host: "https://api-stg.i-esg.kr" },
  { key: "prd", label: "Production", host: "https://api.i-esg.kr" },
] as const;

export type EnvKey = (typeof ENVIRONMENTS)[number]["key"];

export const DEFAULT_ENV: EnvKey = "dev";
