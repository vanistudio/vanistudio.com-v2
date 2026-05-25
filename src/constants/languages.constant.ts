export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

export interface TranslationConfig {
  defaultLanguage: string
  languages: string[]
  altFlags?: Record<string, string>
  flagSize?: number
  globeSize?: number
  globeColor?: string
  nativeLanguageNames?: boolean
}
export type LanguageCode = string

export const LANGUAGE_DATA: Record<string, Language> = {
  "af": { code: "af", name: "Afrikaans", nativeName: "Afrikaans", flag: "za" },
  "sq": { code: "sq", name: "Albanian", nativeName: "Shqip", flag: "al" },
  "am": { code: "am", name: "Amharic", nativeName: "አማርኛ", flag: "et" },
  "ar": { code: "ar", name: "Arabic", nativeName: "العربية", flag: "sa" },
  "hy": { code: "hy", name: "Armenian", nativeName: "Հայերdelays", flag: "am" },
  "az": { code: "az", name: "Azerbaijani", nativeName: "Azərbaycan dili", flag: "az" },
  "eu": { code: "eu", name: "Basque", nativeName: "Euskara", flag: "es" },
  "be": { code: "be", name: "Belarusian", nativeName: "Беларуская мова", flag: "by" },
  "bn": { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "bd" },
  "bs": { code: "bs", name: "Bosnian", nativeName: "Bosanski", flag: "ba" },
  "bg": { code: "bg", name: "Bulgarian", nativeName: "Български", flag: "bg" },
  "ca": { code: "ca", name: "Catalan", nativeName: "Català", flag: "es" },
  "ceb": { code: "ceb", name: "Cebuano", nativeName: "Cebuano", flag: "ph" },
  "ny": { code: "ny", name: "Chichewa", nativeName: "Chichewa", flag: "mw" },
  "zh-CN": { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文", flag: "cn" },
  "zh-TW": { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "繁體中文", flag: "tw" },
  "co": { code: "co", name: "Corsican", nativeName: "Corsu", flag: "fr" },
  "hr": { code: "hr", name: "Croatian", nativeName: "Hrvatski", flag: "hr" },
  "cs": { code: "cs", name: "Czech", nativeName: "Čeština", flag: "cz" },
  "da": { code: "da", name: "Danish", nativeName: "Dansk", flag: "dk" },
  "nl": { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "nl" },
  "en": { code: "en", name: "English", nativeName: "English", flag: "us" },
  "eo": { code: "eo", name: "Esperanto", nativeName: "Esperanto", flag: "eu" },
  "et": { code: "et", name: "Estonian", nativeName: "Eesti", flag: "ee" },
  "tl": { code: "tl", name: "Filipino", nativeName: "Filipino", flag: "ph" },
  "fi": { code: "fi", name: "Finnish", nativeName: "Suomi", flag: "fi" },
  "fr": { code: "fr", name: "French", nativeName: "Français", flag: "fr" },
  "fy": { code: "fy", name: "Frisian", nativeName: "Frysk", flag: "nl" },
  "gl": { code: "gl", name: "Galician", nativeName: "Galego", flag: "es" },
  "ka": { code: "ka", name: "Georgian", nativeName: "ქართული", flag: "ge" },
  "de": { code: "de", name: "German", nativeName: "Deutsch", flag: "de" },
  "el": { code: "el", name: "Greek", nativeName: "Ελληνικά", flag: "gr" },
  "gu": { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "in" },
  "ht": { code: "ht", name: "Haitian Creole", nativeName: "Kreyol ayisyen", flag: "ht" },
  "ha": { code: "ha", name: "Hausa", nativeName: "Harshen Hausa", flag: "ng" },
  "haw": { code: "haw", name: "Hawaiian", nativeName: "Ōlelo Hawaiʻi", flag: "us" },
  "iw": { code: "iw", name: "Hebrew", nativeName: "עִבְרִית", flag: "il" },
  "hi": { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "in" },
  "hmn": { code: "hmn", name: "Hmong", nativeName: "Hmong", flag: "la" },
  "hu": { code: "hu", name: "Hungarian", nativeName: "Magyar", flag: "hu" },
  "is": { code: "is", name: "Icelandic", nativeName: "Íslenska", flag: "is" },
  "ig": { code: "ig", name: "Igbo", nativeName: "Igbo", flag: "ng" },
  "id": { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "id" },
  "ga": { code: "ga", name: "Irish", nativeName: "Gaeilge", flag: "ie" },
  "it": { code: "it", name: "Italian", nativeName: "Italiano", flag: "it" },
  "ja": { code: "ja", name: "Japanese", nativeName: "日本語", flag: "jp" },
  "jw": { code: "jw", name: "Javanese", nativeName: "Basa Jawa", flag: "id" },
  "kn": { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "in" },
  "kk": { code: "kk", name: "Kazakh", nativeName: "Қазақ тілі", flag: "kz" },
  "km": { code: "km", name: "Khmer", nativeName: "ភាសាខ្មែរ", flag: "kh" },
  "ko": { code: "ko", name: "Korean", nativeName: "한국어", flag: "kr" },
  "ku": { code: "ku", name: "Kurdish (Kurmanji)", nativeName: "كوردی", flag: "iq" },
  "ky": { code: "ky", name: "Kyrgyz", nativeName: "Кыргызча", flag: "kg" },
  "lo": { code: "lo", name: "Lao", nativeName: "ພາສາລາວ", flag: "la" },
  "la": { code: "la", name: "Latin", nativeName: "Latin", flag: "va" },
  "lv": { code: "lv", name: "Latvian", nativeName: "Latviešu valoda", flag: "lv" },
  "lt": { code: "lt", name: "Lithuanian", nativeName: "Lietuvių kalba", flag: "lt" },
  "lb": { code: "lb", name: "Luxembourgish", nativeName: "Lëtzebuergesch", flag: "lu" },
  "mk": { code: "mk", name: "Macedonian", nativeName: "Македонски јазик", flag: "mk" },
  "mg": { code: "mg", name: "Malagasy", nativeName: "Malagasy", flag: "mg" },
  "ms": { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", flag: "my" },
  "ml": { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "in" },
  "mt": { code: "mt", name: "Maltese", nativeName: "Maltese", flag: "mt" },
  "mi": { code: "mi", name: "Maori", nativeName: "Te Reo Māori", flag: "nz" },
  "mr": { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "in" },
  "mn": { code: "mn", name: "Mongolian", nativeName: "Монгол", flag: "mn" },
  "my": { code: "my", name: "Myanmar (Burmese)", nativeName: "ဗမာစာ", flag: "mm" },
  "ne": { code: "ne", name: "Nepali", nativeName: "नेपाली", flag: "np" },
  "no": { code: "no", name: "Norwegian", nativeName: "Norsk bokmål", flag: "no" },
  "ps": { code: "ps", name: "Pashto", nativeName: "پښتو", flag: "af" },
  "fa": { code: "fa", name: "Persian", nativeName: "فارسی", flag: "ir" },
  "pl": { code: "pl", name: "Polish", nativeName: "Polski", flag: "pl" },
  "pt": { code: "pt", name: "Portuguese", nativeName: "Português", flag: "br" },
  "pa": { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "in" },
  "ro": { code: "ro", name: "Romanian", nativeName: "Română", flag: "ro" },
  "ru": { code: "ru", name: "Russian", nativeName: "Русский", flag: "ru" },
  "sm": { code: "sm", name: "Samoan", nativeName: "Samoan", flag: "ws" },
  "gd": { code: "gd", name: "Scottish Gaelic", nativeName: "Gàidhlig", flag: "gb" },
  "sr": { code: "sr", name: "Serbian", nativeName: "Српски језик", flag: "rs" },
  "st": { code: "st", name: "Sesotho", nativeName: "Sesotho", flag: "ls" },
  "sn": { code: "sn", name: "Shona", nativeName: "Shona", flag: "zw" },
  "sd": { code: "sd", name: "Sindhi", nativeName: "سنڌي", flag: "pk" },
  "si": { code: "si", name: "Sinhala", nativeName: "සිංහල", flag: "lk" },
  "sk": { code: "sk", name: "Slovak", nativeName: "Slovenčina", flag: "sk" },
  "sl": { code: "sl", name: "Slovenian", nativeName: "Slovenščina", flag: "si" },
  "so": { code: "so", name: "Somali", nativeName: "Afsoomaali", flag: "so" },
  "es": { code: "es", name: "Spanish", nativeName: "Español", flag: "es" },
  "su": { code: "su", name: "Sundanese", nativeName: "Basa Sunda", flag: "id" },
  "sw": { code: "sw", name: "Swahili", nativeName: "Kiswahili", flag: "ke" },
  "sv": { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "se" },
  "tg": { code: "tg", name: "Tajik", nativeName: "Тоҷикӣ", flag: "tj" },
  "ta": { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "in" },
  "te": { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "in" },
  "th": { code: "th", name: "Thai", nativeName: "ไทย", flag: "th" },
  "tr": { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "tr" },
  "uk": { code: "uk", name: "Ukrainian", nativeName: "Українська", flag: "ua" },
  "ur": { code: "ur", name: "Urdu", nativeName: "اردو", flag: "pk" },
  "uz": { code: "uz", name: "Uzbek", nativeName: "O'zbekcha", flag: "uz" },
  "vi": { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "vn" },
  "cy": { code: "cy", name: "Welsh", nativeName: "Cymraeg", flag: "gb" },
  "xh": { code: "xh", name: "Xhosa", nativeName: "isiXhosa", flag: "za" },
  "yi": { code: "yi", name: "Yiddish", nativeName: "ייִדיש", flag: "il" },
  "yo": { code: "yo", name: "Yoruba", nativeName: "Yorùbá", flag: "ng" },
  "zu": { code: "zu", name: "Zulu", nativeName: "Zulu", flag: "za" }
}

export const DEFAULT_LANGUAGE = "vi"
export const DEFAULT_LANGUAGES = Object.keys(LANGUAGE_DATA)

export const getLanguage = (code: string): Language | undefined => {
  return LANGUAGE_DATA[code]
}

export const getAllLanguages = (): Language[] => {
  return Object.values(LANGUAGE_DATA)
}

export const getLanguagesByCode = (codes: string[]): Language[] => {
  return codes.map(code => LANGUAGE_DATA[code]).filter(Boolean)
}