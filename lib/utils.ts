import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

interface JWT {
  username: string;
  exp: number;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatTimestamp = (s: string): string => {
  const date = new Date(s);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${day}.${month}.${year}  ${hours}:${minutes}`;
};

export const parseJWToken = (token: string): JWT => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64)) as JWT
}
