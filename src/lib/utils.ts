import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 6,
  }).format(amount);
}

export const GEMINI_MODELS = {
  FLASH_2_5: "gemini-2.5-flash",
  FLASH_LITE_2_5: "gemini-2.5-flash-lite-preview-02-05",
  PRO_2_5: "gemini-2.5-pro",
  FLASH_3: "gemini-3-flash-preview",
  PRO_3_1: "gemini-3.1-pro-preview",
};

export const MODEL_LABELS: Record<string, string> = {
  [GEMINI_MODELS.FLASH_2_5]: "Gemini 2.5 Flash",
  [GEMINI_MODELS.FLASH_LITE_2_5]: "Gemini 2.5 Flash Lite",
  [GEMINI_MODELS.PRO_2_5]: "Gemini 2.5 Pro",
  [GEMINI_MODELS.FLASH_3]: "Gemini 3.0 Flash",
  [GEMINI_MODELS.PRO_3_1]: "Gemini 3.1 Pro",
};

// Approximate costs (per 1M tokens) - Update as needed
export const COST_PER_1M_TOKENS: Record<string, { input: number; output: number }> = {
  [GEMINI_MODELS.FLASH_2_5]: { input: 0.075, output: 0.3 },
  [GEMINI_MODELS.FLASH_LITE_2_5]: { input: 0.05, output: 0.2 }, // Estimated
  [GEMINI_MODELS.PRO_2_5]: { input: 1.25, output: 5.0 },
  [GEMINI_MODELS.FLASH_3]: { input: 0.075, output: 0.3 }, // Estimated same as flash
  [GEMINI_MODELS.PRO_3_1]: { input: 1.25, output: 5.0 }, // Estimated same as pro
};

export function calculateCost(model: string, inputTokens: number, outputTokens: number) {
  const rates = COST_PER_1M_TOKENS[model] || COST_PER_1M_TOKENS[GEMINI_MODELS.FLASH_2_5];
  const inputCost = (inputTokens / 1000000) * rates.input;
  const outputCost = (outputTokens / 1000000) * rates.output;
  return inputCost + outputCost;
}

export function extractYoutubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
