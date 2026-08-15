import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/**
 * Converts ASCII digits (0-9) to Persian digits (۰-۹).
 */
export function toPersianDigits(value: string | number | null | undefined): string {
  if (value == null) return "";
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[parseInt(digit, 10)]);
}

