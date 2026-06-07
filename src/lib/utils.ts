import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function uuidv7(): string {
  const now = Date.now();
  const timestampHex = now.toString(16).padStart(12, "0");
  
  let random: Uint8Array;
  if (typeof window !== "undefined" && window.crypto) {
    random = window.crypto.getRandomValues(new Uint8Array(10));
  } else {
    const cryptoNode = require("crypto");
    random = cryptoNode.randomBytes(10);
  }

  const rand12 = ((random[0] << 8) | random[1]) & 0x0fff;
  const rand12Hex = rand12.toString(16).padStart(3, "0");

  const rand62_1 = (((random[2] << 8) | random[3]) & 0x3fff) | 0x8000;
  const rand62_1Hex = rand62_1.toString(16);

  const rand62_2 = (random[4] << 24) | (random[5] << 16) | (random[6] << 8) | random[7];
  const rand62_2Hex = (rand62_2 >>> 0).toString(16).padStart(8, "0");

  const rand62_3 = (random[8] << 8) | random[9];
  const rand62_3Hex = rand62_3.toString(16).padStart(4, "0");

  const part1 = timestampHex.substring(0, 8);
  const part2 = timestampHex.substring(8, 12);
  const part3 = "7" + rand12Hex;
  const part4 = rand62_1Hex;
  const part5 = rand62_2Hex + rand62_3Hex;

  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}
