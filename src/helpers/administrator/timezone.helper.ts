import {
  TIMEZONE_DATA,
  DEFAULT_TIMEZONE,
  type Timezone,
} from "@/constants/timezones.constant";
export function isValidTimezone(code: string): boolean {
  return code in TIMEZONE_DATA;
}
export function getTimezoneDetails(code: string): Timezone {
  return TIMEZONE_DATA[code] || TIMEZONE_DATA[DEFAULT_TIMEZONE]!;
}
export function parseDatePure(date: Date | string | number): Date {
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? new Date() : date;
  }
  if (typeof date === "number") {
    return new Date(date);
  }
  if (typeof date === "string") {
    const cleaned = date.trim();
    const match = cleaned.match(/^(\d{4})[-/](\d{2})[-/](\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/);
    if (match) {
      const [, y, m, d, h, min, s, ms] = match;
      return new Date(Date.UTC(
        parseInt(y, 10),
        parseInt(m, 10) - 1,
        parseInt(d, 10),
        parseInt(h, 10),
        parseInt(min, 10),
        parseInt(s, 10),
        ms ? parseInt(ms.padEnd(3, "0").slice(0, 3), 10) : 0
      ));
    }
    const dayMatch = cleaned.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
    if (dayMatch) {
      const [, y, m, d] = dayMatch;
      return new Date(Date.UTC(
        parseInt(y, 10),
        parseInt(m, 10) - 1,
        parseInt(d, 10)
      ));
    }
    const parsed = new Date(cleaned);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  return new Date();
}
export function getDateFields(
  date: Date | string | number,
  timezoneCode: string = DEFAULT_TIMEZONE
) {
  const time = parseDatePure(date);
  const tz = getTimezoneDetails(timezoneCode);
  const localTimestamp = time.getTime() + tz.offsetMinutes * 60 * 1000;
  const shiftedDate = new Date(localTimestamp);

  return {
    year: shiftedDate.getUTCFullYear(),
    month: shiftedDate.getUTCMonth() + 1,
    day: shiftedDate.getUTCDate(),
    hour: shiftedDate.getUTCHours(),
    minute: shiftedDate.getUTCMinutes(),
    second: shiftedDate.getUTCSeconds(),
  };
}

export function formatInTimezone(
  date: Date | string | number,
  timezoneCode: string = DEFAULT_TIMEZONE,
  formatStr: string = "DD/MM/YYYY HH:mm:ss"
): string {
  const fields = getDateFields(date, timezoneCode);
  
  const pad = (n: number) => String(n).padStart(2, "0");
  
  return formatStr
    .replace("YYYY", String(fields.year))
    .replace("MM", pad(fields.month))
    .replace("DD", pad(fields.day))
    .replace("HH", pad(fields.hour))
    .replace("mm", pad(fields.minute))
    .replace("ss", pad(fields.second));
}

export function getFormattedCurrentTime(timezoneCode: string = DEFAULT_TIMEZONE): string {
  const tz = getTimezoneDetails(timezoneCode);
  const formattedTime = formatInTimezone(new Date(), tz.code, "HH:mm:ss");
  return `${formattedTime} (${tz.offset})`;
}

export function convertToTimezoneDate(
  date: Date | string | number,
  timezoneCode: string = DEFAULT_TIMEZONE
): Date {
  const fields = getDateFields(date, timezoneCode);
  return new Date(Date.UTC(
    fields.year,
    fields.month - 1,
    fields.day,
    fields.hour,
    fields.minute,
    fields.second
  ));
}

export function isDaytimeInTimezone(
  date: Date | string | number = new Date(),
  timezoneCode: string = DEFAULT_TIMEZONE
): boolean {
  const fields = getDateFields(date, timezoneCode);
  return fields.hour >= 6 && fields.hour < 18;
}

export function formatWithSiteTimezone(
  date: Date | string | number,
  siteTimezone: string = DEFAULT_TIMEZONE,
  formatStr: string = "DD/MM/YYYY HH:mm:ss"
): string {
  return formatInTimezone(date, siteTimezone, formatStr);
}
