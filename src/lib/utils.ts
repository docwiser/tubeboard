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
  FLASH: "gemini-2.5-flash-latest",
  PRO: "gemini-3.1-pro-preview",
};

// Approximate costs (per 1M tokens) - Update as needed
export const COST_PER_1M_TOKENS = {
  [GEMINI_MODELS.FLASH]: { input: 0.075, output: 0.3 },
  [GEMINI_MODELS.PRO]: { input: 1.25, output: 5.0 },
};

export function calculateCost(model: string, inputTokens: number, outputTokens: number) {
  const rates = COST_PER_1M_TOKENS[model] || COST_PER_1M_TOKENS[GEMINI_MODELS.FLASH];
  const inputCost = (inputTokens / 1000000) * rates.input;
  const outputCost = (outputTokens / 1000000) * rates.output;
  return inputCost + outputCost;
}

export function extractYoutubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
