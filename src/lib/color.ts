export function hexToOklch(hex: string): string {
  if (!hex) {
    return "oklch(0.6882 0.2338 16.94)";
  }
  const cleanHex = hex.replace("#", "");
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    return "oklch(0.6882 0.2338 16.94)";
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  const linearR = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const linearG = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const linearB = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  const x = linearR * 0.4124564 + linearG * 0.3575761 + linearB * 0.1804375;
  const y = linearR * 0.2126729 + linearG * 0.7151522 + linearB * 0.072175;
  const z = linearR * 0.0193339 + linearG * 0.119192 + linearB * 0.9503041;
  const l = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z;
  const m = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z;
  const s = 0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bLab = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.sqrt(a * a + bLab * bLab);
  const h = Math.atan2(bLab, a) * (180 / Math.PI);
  const H = h >= 0 ? h : h + 360;
  return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(2)})`;
}
export function getVanixjnkColor(siteMainColor?: string | null): string {
  if (!siteMainColor || siteMainColor.trim() === "") {
    return "oklch(0.6882 0.2338 16.94)";
  }
  return hexToOklch(siteMainColor);
}