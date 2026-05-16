import "dotenv/config";

function readPort(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`Invalid port value: ${value}`);
  }
  return parsed;
}

function readOrigins(value: string | undefined, fallback: string): string[] {
  return (value ?? fallback)
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}

export const config = {
  port: readPort(process.env.SERVER_PORT, 3000),
  clientOrigins: readOrigins(process.env.CLIENT_URL, "http://localhost:5173"),
} as const;

export type AppConfig = typeof config;
