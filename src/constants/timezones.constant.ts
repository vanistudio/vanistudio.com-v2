export interface Timezone {
  code: string
  name: string
  offset: string
  offsetMinutes: number
}

export interface TimezoneConfig {
  defaultTimezone: string
  timezones: string[]
}

export type TimezoneCode = string

export const TIMEZONE_DATA: Record<string, Timezone> = {
  "Etc/GMT+12": { code: "Etc/GMT+12", name: "International Date Line West", offset: "UTC -12:00", offsetMinutes: -720 },
  "Pacific/Midway": { code: "Pacific/Midway", name: "Midway Island, Samoa", offset: "UTC -11:00", offsetMinutes: -660 },
  "Pacific/Niue": { code: "Pacific/Niue", name: "Niue", offset: "UTC -11:00", offsetMinutes: -660 },
  "Pacific/Pago_Pago": { code: "Pacific/Pago_Pago", name: "Pago Pago", offset: "UTC -11:00", offsetMinutes: -660 },
  "Pacific/Honolulu": { code: "Pacific/Honolulu", name: "Hawaii, Honolulu", offset: "UTC -10:00", offsetMinutes: -600 },
  "Pacific/Tahiti": { code: "Pacific/Tahiti", name: "Tahiti", offset: "UTC -10:00", offsetMinutes: -600 },
  "Pacific/Rarotonga": { code: "Pacific/Rarotonga", name: "Rarotonga", offset: "UTC -10:00", offsetMinutes: -600 },
  "Pacific/Marquesas": { code: "Pacific/Marquesas", name: "Marquesas Islands", offset: "UTC -09:30", offsetMinutes: -570 },
  "America/Anchorage": { code: "America/Anchorage", name: "Alaska Time (Anchorage)", offset: "UTC -09:00", offsetMinutes: -540 },
  "America/Adak": { code: "America/Adak", name: "Adak", offset: "UTC -09:00", offsetMinutes: -540 },
  "Pacific/Gambier": { code: "Pacific/Gambier", name: "Gambier Islands", offset: "UTC -09:00", offsetMinutes: -540 },
  "America/Los_Angeles": { code: "America/Los_Angeles", name: "Pacific Time (US & Canada)", offset: "UTC -08:00", offsetMinutes: -480 },
  "America/Tijuana": { code: "America/Tijuana", name: "Tijuana, Baja California", offset: "UTC -08:00", offsetMinutes: -480 },
  "America/Vancouver": { code: "America/Vancouver", name: "Vancouver", offset: "UTC -08:00", offsetMinutes: -480 },
  "America/Denver": { code: "America/Denver", name: "Mountain Time (US & Canada)", offset: "UTC -07:00", offsetMinutes: -420 },
  "America/Phoenix": { code: "America/Phoenix", name: "Arizona (Phoenix)", offset: "UTC -07:00", offsetMinutes: -420 },
  "America/Mazatlan": { code: "America/Mazatlan", name: "Mazatlan", offset: "UTC -07:00", offsetMinutes: -420 },
  "America/Edmonton": { code: "America/Edmonton", name: "Edmonton", offset: "UTC -07:00", offsetMinutes: -420 },
  "America/Chicago": { code: "America/Chicago", name: "Central Time (US & Canada)", offset: "UTC -06:00", offsetMinutes: -360 },
  "America/Mexico_City": { code: "America/Mexico_City", name: "Mexico City", offset: "UTC -06:00", offsetMinutes: -360 },
  "America/Guatemala": { code: "America/Guatemala", name: "Guatemala, Costa Rica", offset: "UTC -06:00", offsetMinutes: -360 },
  "America/Regina": { code: "America/Regina", name: "Saskatchewan (Regina)", offset: "UTC -06:00", offsetMinutes: -360 },
  "America/New_York": { code: "America/New_York", name: "Eastern Time (US & Canada)", offset: "UTC -05:00", offsetMinutes: -300 },
  "America/Bogota": { code: "America/Bogota", name: "Bogota, Lima, Quito", offset: "UTC -05:00", offsetMinutes: -300 },
  "America/Toronto": { code: "America/Toronto", name: "Toronto", offset: "UTC -05:00", offsetMinutes: -300 },
  "America/Santiago": { code: "America/Santiago", name: "Santiago", offset: "UTC -04:00", offsetMinutes: -240 },
  "America/Halifax": { code: "America/Halifax", name: "Atlantic Time (Canada)", offset: "UTC -04:00", offsetMinutes: -240 },
  "America/Caracas": { code: "America/Caracas", name: "Caracas", offset: "UTC -04:00", offsetMinutes: -240 },
  "America/La_Paz": { code: "America/La_Paz", name: "La Paz, Georgetown, Manaus", offset: "UTC -04:00", offsetMinutes: -240 },
  "America/St_Johns": { code: "America/St_Johns", name: "Newfoundland (St. John's)", offset: "UTC -03:30", offsetMinutes: -210 },
  "America/Sao_Paulo": { code: "America/Sao_Paulo", name: "Brasilia, Sao Paulo", offset: "UTC -03:00", offsetMinutes: -180 },
  "America/Argentina/Buenos_Aires": { code: "America/Argentina/Buenos_Aires", name: "Buenos Aires", offset: "UTC -03:00", offsetMinutes: -180 },
  "America/Godthab": { code: "America/Godthab", name: "Greenland (Nuuk)", offset: "UTC -03:00", offsetMinutes: -180 },
  "America/Montevideo": { code: "America/Montevideo", name: "Montevideo", offset: "UTC -03:00", offsetMinutes: -180 },
  "America/Noronha": { code: "America/Noronha", name: "Fernando de Noronha", offset: "UTC -02:00", offsetMinutes: -120 },
  "Atlantic/South_Georgia": { code: "Atlantic/South_Georgia", name: "South Georgia", offset: "UTC -02:00", offsetMinutes: -120 },
  "Atlantic/Azores": { code: "Atlantic/Azores", name: "Azores", offset: "UTC -01:00", offsetMinutes: -60 },
  "Atlantic/Cape_Verde": { code: "Atlantic/Cape_Verde", name: "Cape Verde Islands", offset: "UTC -01:00", offsetMinutes: -60 },
  "UTC": { code: "UTC", name: "Coordinated Universal Time", offset: "UTC +00:00", offsetMinutes: 0 },
  "Europe/London": { code: "Europe/London", name: "London, Dublin, Edinburgh", offset: "UTC +00:00", offsetMinutes: 0 },
  "Europe/Lisbon": { code: "Europe/Lisbon", name: "Lisbon", offset: "UTC +00:00", offsetMinutes: 0 },
  "Africa/Casablanca": { code: "Africa/Casablanca", name: "Casablanca", offset: "UTC +00:00", offsetMinutes: 0 },
  "Africa/Monrovia": { code: "Africa/Monrovia", name: "Monrovia", offset: "UTC +00:00", offsetMinutes: 0 },
  "Europe/Berlin": { code: "Europe/Berlin", name: "Berlin, Rome, Vienna, Stockholm", offset: "UTC +01:00", offsetMinutes: 60 },
  "Europe/Paris": { code: "Europe/Paris", name: "Paris, Brussels, Madrid, Amsterdam", offset: "UTC +01:00", offsetMinutes: 60 },
  "Europe/Warsaw": { code: "Europe/Warsaw", name: "Warsaw, Prague, Budapest, Belgrade", offset: "UTC +01:00", offsetMinutes: 60 },
  "Africa/Lagos": { code: "Africa/Lagos", name: "West Central Africa (Lagos, Kinshasa)", offset: "UTC +01:00", offsetMinutes: 60 },
  "Africa/Algiers": { code: "Africa/Algiers", name: "Algiers", offset: "UTC +01:00", offsetMinutes: 60 },
  "Europe/Athens": { code: "Europe/Athens", name: "Athens, Bucharest, Istanbul", offset: "UTC +02:00", offsetMinutes: 120 },
  "Europe/Kyiv": { code: "Europe/Kyiv", name: "Kyiv, Riga, Vilnius, Tallinn", offset: "UTC +02:00", offsetMinutes: 120 },
  "Europe/Helsinki": { code: "Europe/Helsinki", name: "Helsinki", offset: "UTC +02:00", offsetMinutes: 120 },
  "Asia/Jerusalem": { code: "Asia/Jerusalem", name: "Jerusalem", offset: "UTC +02:00", offsetMinutes: 120 },
  "Africa/Cairo": { code: "Africa/Cairo", name: "Cairo", offset: "UTC +02:00", offsetMinutes: 120 },
  "Africa/Johannesburg": { code: "Africa/Johannesburg", name: "Harare, Pretoria, Johannesburg", offset: "UTC +02:00", offsetMinutes: 120 },
  "Europe/Moscow": { code: "Europe/Moscow", name: "Moscow, St. Petersburg, Volgograd", offset: "UTC +03:00", offsetMinutes: 180 },
  "Asia/Riyadh": { code: "Asia/Riyadh", name: "Riyadh, Kuwait", offset: "UTC +03:00", offsetMinutes: 180 },
  "Asia/Baghdad": { code: "Asia/Baghdad", name: "Baghdad", offset: "UTC +03:00", offsetMinutes: 180 },
  "Africa/Nairobi": { code: "Africa/Nairobi", name: "Nairobi, Addis Ababa, Dar es Salaam", offset: "UTC +03:00", offsetMinutes: 180 },
  "Asia/Tehran": { code: "Asia/Tehran", name: "Tehran", offset: "UTC +03:30", offsetMinutes: 210 },
  "Asia/Dubai": { code: "Asia/Dubai", name: "Dubai, Abu Dhabi, Muscat, Tbilisi", offset: "UTC +04:00", offsetMinutes: 240 },
  "Asia/Baku": { code: "Asia/Baku", name: "Baku, Yerevan", offset: "UTC +04:00", offsetMinutes: 240 },
  "Asia/Tbilisi": { code: "Asia/Tbilisi", name: "Tbilisi", offset: "UTC +04:00", offsetMinutes: 240 },
  "Indian/Mauritius": { code: "Indian/Mauritius", name: "Mauritius", offset: "UTC +04:00", offsetMinutes: 240 },
  "Asia/Kabul": { code: "Asia/Kabul", name: "Kabul", offset: "UTC +04:30", offsetMinutes: 270 },
  "Asia/Karachi": { code: "Asia/Karachi", name: "Karachi, Islamabad, Tashkent", offset: "UTC +05:00", offsetMinutes: 300 },
  "Asia/Yekaterinburg": { code: "Asia/Yekaterinburg", name: "Yekaterinburg", offset: "UTC +05:00", offsetMinutes: 300 },
  "Indian/Maldives": { code: "Indian/Maldives", name: "Maldives", offset: "UTC +05:00", offsetMinutes: 300 },
  "Asia/Kolkata": { code: "Asia/Kolkata", name: "New Delhi, Mumbai, Kolkata, Colombo", offset: "UTC +05:30", offsetMinutes: 330 },
  "Asia/Kathmandu": { code: "Asia/Kathmandu", name: "Kathmandu", offset: "UTC +05:45", offsetMinutes: 345 },
  "Asia/Dhaka": { code: "Asia/Dhaka", name: "Dhaka, Almaty, Astana", offset: "UTC +06:00", offsetMinutes: 360 },
  "Asia/Omsk": { code: "Asia/Omsk", name: "Omsk", offset: "UTC +06:00", offsetMinutes: 360 },
  "Asia/Yangon": { code: "Asia/Yangon", name: "Yangon, Cocos Islands", offset: "UTC +06:30", offsetMinutes: 390 },
  "Asia/Bangkok": { code: "Asia/Bangkok", name: "Bangkok, Jakarta, Phnom Penh, Vientiane", offset: "UTC +07:00", offsetMinutes: 420 },
  "Asia/Ho_Chi_Minh": { code: "Asia/Ho_Chi_Minh", name: "Ho Chi Minh City, Hanoi", offset: "UTC +07:00", offsetMinutes: 420 },
  "Asia/Novosibirsk": { code: "Asia/Novosibirsk", name: "Novosibirsk", offset: "UTC +07:00", offsetMinutes: 420 },
  "Asia/Singapore": { code: "Asia/Singapore", name: "Singapore, Kuala Lumpur, Manila", offset: "UTC +08:00", offsetMinutes: 480 },
  "Asia/Shanghai": { code: "Asia/Shanghai", name: "Beijing, Shanghai, Hong Kong, Taipei", offset: "UTC +08:00", offsetMinutes: 480 },
  "Australia/Perth": { code: "Australia/Perth", name: "Perth, Western Australia", offset: "UTC +08:00", offsetMinutes: 480 },
  "Asia/Ulaanbaatar": { code: "Asia/Ulaanbaatar", name: "Ulaanbaatar", offset: "UTC +08:00", offsetMinutes: 480 },
  "Asia/Tokyo": { code: "Asia/Tokyo", name: "Tokyo, Osaka, Sapporo", offset: "UTC +09:00", offsetMinutes: 540 },
  "Asia/Seoul": { code: "Asia/Seoul", name: "Seoul", offset: "UTC +09:00", offsetMinutes: 540 },
  "Asia/Yakutsk": { code: "Asia/Yakutsk", name: "Yakutsk", offset: "UTC +09:00", offsetMinutes: 540 },
  "Australia/Darwin": { code: "Australia/Darwin", name: "Darwin", offset: "UTC +09:30", offsetMinutes: 570 },
  "Australia/Adelaide": { code: "Australia/Adelaide", name: "Adelaide", offset: "UTC +09:30", offsetMinutes: 570 },
  "Australia/Sydney": { code: "Australia/Sydney", name: "Sydney, Melbourne, Canberra, Brisbane", offset: "UTC +10:00", offsetMinutes: 600 },
  "Asia/Vladivostok": { code: "Asia/Vladivostok", name: "Vladivostok", offset: "UTC +10:00", offsetMinutes: 600 },
  "Pacific/Port_Moresby": { code: "Pacific/Port_Moresby", name: "Port Moresby", offset: "UTC +10:00", offsetMinutes: 600 },
  "Australia/Lord_Howe": { code: "Australia/Lord_Howe", name: "Lord Howe Island", offset: "UTC +10:30", offsetMinutes: 630 },
  "Pacific/Noumea": { code: "Pacific/Noumea", name: "Solomon Islands, New Caledonia", offset: "UTC +11:00", offsetMinutes: 660 },
  "Asia/Magadan": { code: "Asia/Magadan", name: "Magadan, Sakhalin", offset: "UTC +11:00", offsetMinutes: 660 },
  "Pacific/Norfolk": { code: "Pacific/Norfolk", name: "Norfolk Island", offset: "UTC +11:30", offsetMinutes: 690 },
  "Pacific/Auckland": { code: "Pacific/Auckland", name: "Auckland, Wellington", offset: "UTC +12:00", offsetMinutes: 720 },
  "Pacific/Fiji": { code: "Pacific/Fiji", name: "Fiji", offset: "UTC +12:00", offsetMinutes: 720 },
  "Asia/Kamchatka": { code: "Asia/Kamchatka", name: "Kamchatka, Anadyr", offset: "UTC +12:00", offsetMinutes: 720 },
  "Pacific/Chatham": { code: "Pacific/Chatham", name: "Chatham Islands", offset: "UTC +12:45", offsetMinutes: 765 },
  "Pacific/Apia": { code: "Pacific/Apia", name: "Apia, Upolu", offset: "UTC +13:00", offsetMinutes: 780 },
  "Pacific/Tongatapu": { code: "Pacific/Tongatapu", name: "Tongatapu, Nuku'alofa", offset: "UTC +13:00", offsetMinutes: 780 },
  "Pacific/Kiritimati": { code: "Pacific/Kiritimati", name: "Kiritimati, Line Islands", offset: "UTC +14:00", offsetMinutes: 840 }
}

export const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh"
export const DEFAULT_TIMEZONES = Object.keys(TIMEZONE_DATA)

export const getTimezone = (code: string): Timezone | undefined => {
  return TIMEZONE_DATA[code]
}

export const getAllTimezones = (): Timezone[] => {
  return Object.values(TIMEZONE_DATA)
}

export const getTimezonesByCode = (codes: string[]): Timezone[] => {
  return codes.map(code => TIMEZONE_DATA[code]).filter(Boolean)
}
