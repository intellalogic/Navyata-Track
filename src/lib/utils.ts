import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
}).format(amount);
