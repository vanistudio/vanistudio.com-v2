export interface Timezone {
  code: string
  name: string
  offset: string
  offsetMinutes: number
  flag: string
  country: string
}

export interface TimezoneConfig {
  defaultTimezone: string
  timezones: string[]
}

export type TimezoneCode = string

export const TIMEZONE_DATA: Record<string, Timezone> = {
  "Etc/GMT+12": { code: "Etc/GMT+12", name: "International Date Line West", offset: "UTC -12:00", offsetMinutes: -720, flag: "un", country: "Quốc tế" },
  "Pacific/Midway": { code: "Pacific/Midway", name: "Midway Island, Samoa", offset: "UTC -11:00", offsetMinutes: -660, flag: "um", country: "Đảo Midway (Mỹ)" },
  "Pacific/Niue": { code: "Pacific/Niue", name: "Niue", offset: "UTC -11:00", offsetMinutes: -660, flag: "nu", country: "Niue" },
  "Pacific/Pago_Pago": { code: "Pacific/Pago_Pago", name: "Pago Pago", offset: "UTC -11:00", offsetMinutes: -660, flag: "as", country: "Samoa thuộc Mỹ" },
  "Pacific/Honolulu": { code: "Pacific/Honolulu", name: "Hawaii, Honolulu", offset: "UTC -10:00", offsetMinutes: -600, flag: "us", country: "Hoa Kỳ (Hawaii)" },
  "Pacific/Tahiti": { code: "Pacific/Tahiti", name: "Tahiti", offset: "UTC -10:00", offsetMinutes: -600, flag: "pf", country: "Polynesia thuộc Pháp" },
  "Pacific/Rarotonga": { code: "Pacific/Rarotonga", name: "Rarotonga", offset: "UTC -10:00", offsetMinutes: -600, flag: "ck", country: "Quần đảo Cook" },
  "Pacific/Marquesas": { code: "Pacific/Marquesas", name: "Marquesas Islands", offset: "UTC -09:30", offsetMinutes: -570, flag: "pf", country: "Polynesia thuộc Pháp" },
  "America/Anchorage": { code: "America/Anchorage", name: "Alaska Time (Anchorage)", offset: "UTC -09:00", offsetMinutes: -540, flag: "us", country: "Hoa Kỳ (Alaska)" },
  "America/Adak": { code: "America/Adak", name: "Adak", offset: "UTC -09:00", offsetMinutes: -540, flag: "us", country: "Hoa Kỳ (Aleutian)" },
  "Pacific/Gambier": { code: "Pacific/Gambier", name: "Gambier Islands", offset: "UTC -09:00", offsetMinutes: -540, flag: "pf", country: "Polynesia thuộc Pháp" },
  "America/Los_Angeles": { code: "America/Los_Angeles", name: "Pacific Time (US & Canada)", offset: "UTC -08:00", offsetMinutes: -480, flag: "us", country: "Hoa Kỳ" },
  "America/Tijuana": { code: "America/Tijuana", name: "Tijuana, Baja California", offset: "UTC -08:00", offsetMinutes: -480, flag: "mx", country: "Mexico" },
  "America/Vancouver": { code: "America/Vancouver", name: "Vancouver", offset: "UTC -08:00", offsetMinutes: -480, flag: "ca", country: "Canada" },
  "America/Denver": { code: "America/Denver", name: "Mountain Time (US & Canada)", offset: "UTC -07:00", offsetMinutes: -420, flag: "us", country: "Hoa Kỳ" },
  "America/Phoenix": { code: "America/Phoenix", name: "Arizona (Phoenix)", offset: "UTC -07:00", offsetMinutes: -420, flag: "us", country: "Hoa Kỳ" },
  "America/Mazatlan": { code: "America/Mazatlan", name: "Mazatlan", offset: "UTC -07:00", offsetMinutes: -420, flag: "mx", country: "Mexico" },
  "America/Edmonton": { code: "America/Edmonton", name: "Edmonton", offset: "UTC -07:00", offsetMinutes: -420, flag: "ca", country: "Canada" },
  "America/Chicago": { code: "America/Chicago", name: "Central Time (US & Canada)", offset: "UTC -06:00", offsetMinutes: -360, flag: "us", country: "Hoa Kỳ" },
  "America/Mexico_City": { code: "America/Mexico_City", name: "Mexico City", offset: "UTC -06:00", offsetMinutes: -360, flag: "mx", country: "Mexico" },
  "America/Guatemala": { code: "America/Guatemala", name: "Guatemala, Costa Rica", offset: "UTC -06:00", offsetMinutes: -360, flag: "gt", country: "Guatemala" },
  "America/Regina": { code: "America/Regina", name: "Saskatchewan (Regina)", offset: "UTC -06:00", offsetMinutes: -360, flag: "ca", country: "Canada" },
  "America/New_York": { code: "America/New_York", name: "Eastern Time (US & Canada)", offset: "UTC -05:00", offsetMinutes: -300, flag: "us", country: "Hoa Kỳ" },
  "America/Bogota": { code: "America/Bogota", name: "Bogota, Lima, Quito", offset: "UTC -05:00", offsetMinutes: -300, flag: "co", country: "Colombia" },
  "America/Toronto": { code: "America/Toronto", name: "Toronto", offset: "UTC -05:00", offsetMinutes: -300, flag: "ca", country: "Canada" },
  "America/Santiago": { code: "America/Santiago", name: "Santiago", offset: "UTC -04:00", offsetMinutes: -240, flag: "cl", country: "Chile" },
  "America/Halifax": { code: "America/Halifax", name: "Atlantic Time (Canada)", offset: "UTC -04:00", offsetMinutes: -240, flag: "ca", country: "Canada" },
  "America/Caracas": { code: "America/Caracas", name: "Caracas", offset: "UTC -04:00", offsetMinutes: -240, flag: "ve", country: "Venezuela" },
  "America/La_Paz": { code: "America/La_Paz", name: "La Paz, Georgetown, Manaus", offset: "UTC -04:00", offsetMinutes: -240, flag: "bo", country: "Bolivia" },
  "America/St_Johns": { code: "America/St_Johns", name: "Newfoundland (St. John's)", offset: "UTC -03:30", offsetMinutes: -210, flag: "ca", country: "Canada" },
  "America/Sao_Paulo": { code: "America/Sao_Paulo", name: "Brasilia, Sao Paulo", offset: "UTC -03:00", offsetMinutes: -180, flag: "br", country: "Brazil" },
  "America/Argentina/Buenos_Aires": { code: "America/Argentina/Buenos_Aires", name: "Buenos Aires", offset: "UTC -03:00", offsetMinutes: -180, flag: "ar", country: "Argentina" },
  "America/Godthab": { code: "America/Godthab", name: "Greenland (Nuuk)", offset: "UTC -03:00", offsetMinutes: -180, flag: "gl", country: "Greenland" },
  "America/Montevideo": { code: "America/Montevideo", name: "Montevideo", offset: "UTC -03:00", offsetMinutes: -180, flag: "uy", country: "Uruguay" },
  "America/Noronha": { code: "America/Noronha", name: "Fernando de Noronha", offset: "UTC -02:00", offsetMinutes: -120, flag: "br", country: "Brazil" },
  "Atlantic/South_Georgia": { code: "Atlantic/South_Georgia", name: "South Georgia", offset: "UTC -02:00", offsetMinutes: -120, flag: "gs", country: "Nam Georgia & QĐ Nam Sandwich" },
  "Atlantic/Azores": { code: "Atlantic/Azores", name: "Azores", offset: "UTC -01:00", offsetMinutes: -60, flag: "pt", country: "Bồ Đào Nha (Azores)" },
  "Atlantic/Cape_Verde": { code: "Atlantic/Cape_Verde", name: "Cape Verde Islands", offset: "UTC -01:00", offsetMinutes: -60, flag: "cv", country: "Cape Verde" },
  "UTC": { code: "UTC", name: "Coordinated Universal Time", offset: "UTC +00:00", offsetMinutes: 0, flag: "un", country: "Quốc tế (UTC)" },
  "Europe/London": { code: "Europe/London", name: "London, Dublin, Edinburgh", offset: "UTC +00:00", offsetMinutes: 0, flag: "gb", country: "Vương quốc Anh" },
  "Europe/Lisbon": { code: "Europe/Lisbon", name: "Lisbon", offset: "UTC +00:00", offsetMinutes: 0, flag: "pt", country: "Bồ Đào Nha" },
  "Africa/Casablanca": { code: "Africa/Casablanca", name: "Casablanca", offset: "UTC +00:00", offsetMinutes: 0, flag: "ma", country: "Maroc" },
  "Africa/Monrovia": { code: "Africa/Monrovia", name: "Monrovia", offset: "UTC +00:00", offsetMinutes: 0, flag: "lr", country: "Liberia" },
  "Europe/Berlin": { code: "Europe/Berlin", name: "Berlin, Rome, Vienna, Stockholm", offset: "UTC +01:00", offsetMinutes: 60, flag: "de", country: "Đức" },
  "Europe/Paris": { code: "Europe/Paris", name: "Paris, Brussels, Madrid, Amsterdam", offset: "UTC +01:00", offsetMinutes: 60, flag: "fr", country: "Pháp" },
  "Europe/Warsaw": { code: "Europe/Warsaw", name: "Warsaw, Prague, Budapest, Belgrade", offset: "UTC +01:00", offsetMinutes: 60, flag: "pl", country: "Ba Lan" },
  "Africa/Lagos": { code: "Africa/Lagos", name: "West Central Africa (Lagos, Kinshasa)", offset: "UTC +01:00", offsetMinutes: 60, flag: "ng", country: "Nigeria" },
  "Africa/Algiers": { code: "Africa/Algiers", name: "Algiers", offset: "UTC +01:00", offsetMinutes: 60, flag: "dz", country: "Algeria" },
  "Europe/Athens": { code: "Europe/Athens", name: "Athens, Bucharest, Istanbul", offset: "UTC +02:00", offsetMinutes: 120, flag: "gr", country: "Hy Lạp" },
  "Europe/Kyiv": { code: "Europe/Kyiv", name: "Kyiv, Riga, Vilnius, Tallinn", offset: "UTC +02:00", offsetMinutes: 120, flag: "ua", country: "Ukraine" },
  "Europe/Helsinki": { code: "Europe/Helsinki", name: "Helsinki", offset: "UTC +02:00", offsetMinutes: 120, flag: "fi", country: "Phần Lan" },
  "Asia/Jerusalem": { code: "Asia/Jerusalem", name: "Jerusalem", offset: "UTC +02:00", offsetMinutes: 120, flag: "il", country: "Israel" },
  "Africa/Cairo": { code: "Africa/Cairo", name: "Cairo", offset: "UTC +02:00", offsetMinutes: 120, flag: "eg", country: "Ai Cập" },
  "Africa/Johannesburg": { code: "Africa/Johannesburg", name: "Harare, Pretoria, Johannesburg", offset: "UTC +02:00", offsetMinutes: 120, flag: "za", country: "Nam Phi" },
  "Europe/Moscow": { code: "Europe/Moscow", name: "Moscow, St. Petersburg, Volgograd", offset: "UTC +03:00", offsetMinutes: 180, flag: "ru", country: "Nga" },
  "Asia/Riyadh": { code: "Asia/Riyadh", name: "Riyadh, Kuwait", offset: "UTC +03:00", offsetMinutes: 180, flag: "sa", country: "Ả Rập Xê Út" },
  "Asia/Baghdad": { code: "Asia/Baghdad", name: "Baghdad", offset: "UTC +03:00", offsetMinutes: 180, flag: "iq", country: "Iraq" },
  "Africa/Nairobi": { code: "Africa/Nairobi", name: "Nairobi, Addis Ababa, Dar es Salaam", offset: "UTC +03:00", offsetMinutes: 180, flag: "ke", country: "Kenya" },
  "Asia/Tehran": { code: "Asia/Tehran", name: "Tehran", offset: "UTC +03:30", offsetMinutes: 210, flag: "ir", country: "Iran" },
  "Asia/Dubai": { code: "Asia/Dubai", name: "Dubai, Abu Dhabi, Muscat, Tbilisi", offset: "UTC +04:00", offsetMinutes: 240, flag: "ae", country: "Các TVQ Ả Rập Thống Nhất" },
  "Asia/Baku": { code: "Asia/Baku", name: "Baku, Yerevan", offset: "UTC +04:00", offsetMinutes: 240, flag: "az", country: "Azerbaijan" },
  "Asia/Tbilisi": { code: "Asia/Tbilisi", name: "Tbilisi", offset: "UTC +04:00", offsetMinutes: 240, flag: "ge", country: "Georgia" },
  "Indian/Mauritius": { code: "Indian/Mauritius", name: "Mauritius", offset: "UTC +04:00", offsetMinutes: 240, flag: "mu", country: "Mauritius" },
  "Asia/Kabul": { code: "Asia/Kabul", name: "Kabul", offset: "UTC +04:30", offsetMinutes: 270, flag: "af", country: "Afghanistan" },
  "Asia/Karachi": { code: "Asia/Karachi", name: "Karachi, Islamabad, Tashkent", offset: "UTC +05:00", offsetMinutes: 300, flag: "pk", country: "Pakistan" },
  "Asia/Yekaterinburg": { code: "Asia/Yekaterinburg", name: "Yekaterinburg", offset: "UTC +05:00", offsetMinutes: 300, flag: "ru", country: "Nga" },
  "Indian/Maldives": { code: "Indian/Maldives", name: "Maldives", offset: "UTC +05:00", offsetMinutes: 300, flag: "mv", country: "Maldives" },
  "Asia/Kolkata": { code: "Asia/Kolkata", name: "New Delhi, Mumbai, Kolkata, Colombo", offset: "UTC +05:30", offsetMinutes: 330, flag: "in", country: "Ấn Độ" },
  "Asia/Kathmandu": { code: "Asia/Kathmandu", name: "Kathmandu", offset: "UTC +05:45", offsetMinutes: 345, flag: "np", country: "Nepal" },
  "Asia/Dhaka": { code: "Asia/Dhaka", name: "Dhaka, Almaty, Astana", offset: "UTC +06:00", offsetMinutes: 360, flag: "bd", country: "Bangladesh" },
  "Asia/Omsk": { code: "Asia/Omsk", name: "Omsk", offset: "UTC +06:00", offsetMinutes: 360, flag: "ru", country: "Nga" },
  "Asia/Yangon": { code: "Asia/Yangon", name: "Yangon, Cocos Islands", offset: "UTC +06:30", offsetMinutes: 390, flag: "mm", country: "Myanmar" },
  "Asia/Bangkok": { code: "Asia/Bangkok", name: "Bangkok, Jakarta, Phnom Penh, Vientiane", offset: "UTC +07:00", offsetMinutes: 420, flag: "th", country: "Thái Lan" },
  "Asia/Ho_Chi_Minh": { code: "Asia/Ho_Chi_Minh", name: "Ho Chi Minh City, Hanoi", offset: "UTC +07:00", offsetMinutes: 420, flag: "vn", country: "Việt Nam" },
  "Asia/Novosibirsk": { code: "Asia/Novosibirsk", name: "Novosibirsk", offset: "UTC +07:00", offsetMinutes: 420, flag: "ru", country: "Nga" },
  "Asia/Singapore": { code: "Asia/Singapore", name: "Singapore, Kuala Lumpur, Manila", offset: "UTC +08:00", offsetMinutes: 480, flag: "sg", country: "Singapore" },
  "Asia/Shanghai": { code: "Asia/Shanghai", name: "Beijing, Shanghai, Hong Kong, Taipei", offset: "UTC +08:00", offsetMinutes: 480, flag: "cn", country: "Trung Quốc" },
  "Australia/Perth": { code: "Australia/Perth", name: "Perth, Western Australia", offset: "UTC +08:00", offsetMinutes: 480, flag: "au", country: "Úc" },
  "Asia/Ulaanbaatar": { code: "Asia/Ulaanbaatar", name: "Ulaanbaatar", offset: "UTC +08:00", offsetMinutes: 480, flag: "mn", country: "Mông Cổ" },
  "Asia/Tokyo": { code: "Asia/Tokyo", name: "Tokyo, Osaka, Sapporo", offset: "UTC +09:00", offsetMinutes: 540, flag: "jp", country: "Nhật Bản" },
  "Asia/Seoul": { code: "Asia/Seoul", name: "Seoul", offset: "UTC +09:00", offsetMinutes: 540, flag: "kr", country: "Hàn Quốc" },
  "Asia/Yakutsk": { code: "Asia/Yakutsk", name: "Yakutsk", offset: "UTC +09:00", offsetMinutes: 540, flag: "ru", country: "Nga" },
  "Australia/Darwin": { code: "Australia/Darwin", name: "Darwin", offset: "UTC +09:30", offsetMinutes: 570, flag: "au", country: "Úc" },
  "Australia/Adelaide": { code: "Australia/Adelaide", name: "Adelaide", offset: "UTC +09:30", offsetMinutes: 570, flag: "au", country: "Úc" },
  "Australia/Sydney": { code: "Australia/Sydney", name: "Sydney, Melbourne, Canberra, Brisbane", offset: "UTC +10:00", offsetMinutes: 600, flag: "au", country: "Úc" },
  "Asia/Vladivostok": { code: "Asia/Vladivostok", name: "Vladivostok", offset: "UTC +10:00", offsetMinutes: 600, flag: "ru", country: "Nga" },
  "Pacific/Port_Moresby": { code: "Pacific/Port_Moresby", name: "Port Moresby", offset: "UTC +10:00", offsetMinutes: 600, flag: "pg", country: "Papua New Guinea" },
  "Australia/Lord_Howe": { code: "Australia/Lord_Howe", name: "Lord Howe Island", offset: "UTC +10:30", offsetMinutes: 630, flag: "au", country: "Úc" },
  "Pacific/Noumea": { code: "Pacific/Noumea", name: "Solomon Islands, New Caledonia", offset: "UTC +11:00", offsetMinutes: 660, flag: "nc", country: "Tân Caledonia (Pháp)" },
  "Asia/Magadan": { code: "Asia/Magadan", name: "Magadan, Sakhalin", offset: "UTC +11:00", offsetMinutes: 660, flag: "ru", country: "Nga" },
  "Pacific/Norfolk": { code: "Pacific/Norfolk", name: "Norfolk Island", offset: "UTC +11:30", offsetMinutes: 690, flag: "nf", country: "Đảo Norfolk (Úc)" },
  "Pacific/Auckland": { code: "Pacific/Auckland", name: "Auckland, Wellington", offset: "UTC +12:00", offsetMinutes: 720, flag: "nz", country: "New Zealand" },
  "Pacific/Fiji": { code: "Pacific/Fiji", name: "Fiji", offset: "UTC +12:00", offsetMinutes: 720, flag: "fj", country: "Fiji" },
  "Asia/Kamchatka": { code: "Asia/Kamchatka", name: "Kamchatka, Anadyr", offset: "UTC +12:00", offsetMinutes: 720, flag: "ru", country: "Nga" },
  "Pacific/Chatham": { code: "Pacific/Chatham", name: "Chatham Islands", offset: "UTC +12:45", offsetMinutes: 765, flag: "nz", country: "QĐ Chatham (New Zealand)" },
  "Pacific/Apia": { code: "Pacific/Apia", name: "Apia, Upolu", offset: "UTC +13:00", offsetMinutes: 780, flag: "ws", country: "Samoa" },
  "Pacific/Tongatapu": { code: "Pacific/Tongatapu", name: "Tongatapu, Nuku'alofa", offset: "UTC +13:00", offsetMinutes: 780, flag: "to", country: "Tonga" },
  "Pacific/Kiritimati": { code: "Pacific/Kiritimati", name: "Kiritimati, Line Islands", offset: "UTC +14:00", offsetMinutes: 840, flag: "ki", country: "Kiribati" }
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
