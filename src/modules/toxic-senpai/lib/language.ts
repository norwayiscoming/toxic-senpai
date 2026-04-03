import { configManager } from "../../../config";

// ─── Language Detection ────────────────────────────────────────────

export type Language = "en" | "vi";

export function detectLanguage(): Language {
  const cfg = configManager.current;

  if (cfg.language !== "auto") {
    return cfg.language;
  }

  const locale = process.env.LANG || process.env.LC_ALL || "";
  if (locale.startsWith("vi")) {
    return "vi";
  }

  return "en";
}
