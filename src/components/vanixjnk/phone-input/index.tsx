"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/input";

export interface Country {
  name: string;
  code: string;
  dialCode: string;
}

export const COUNTRIES: Country[] = [
  { name: "Vietnam", code: "vn", dialCode: "+84" },
  { name: "United States", code: "us", dialCode: "+1" },
  { name: "United Kingdom", code: "gb", dialCode: "+44" },
  { name: "Canada", code: "ca", dialCode: "+1" },
  { name: "Australia", code: "au", dialCode: "+61" },
  { name: "Singapore", code: "sg", dialCode: "+65" },
  { name: "Japan", code: "jp", dialCode: "+81" },
  { name: "South Korea", code: "kr", dialCode: "+82" },
  { name: "China", code: "cn", dialCode: "+86" },
  { name: "Taiwan", code: "tw", dialCode: "+886" },
  { name: "Hong Kong", code: "hk", dialCode: "+852" },
  { name: "France", code: "fr", dialCode: "+33" },
  { name: "Germany", code: "de", dialCode: "+49" },
  { name: "Russia", code: "ru", dialCode: "+7" },
  { name: "India", code: "in", dialCode: "+91" },
  { name: "Brazil", code: "br", dialCode: "+55" },
  { name: "Thailand", code: "th", dialCode: "+66" },
  { name: "Malaysia", code: "my", dialCode: "+60" },
  { name: "Indonesia", code: "id", dialCode: "+62" },
  { name: "Philippines", code: "ph", dialCode: "+63" },
  { name: "Cambodia", code: "kh", dialCode: "+855" },
  { name: "Laos", code: "la", dialCode: "+856" },
  { name: "Myanmar", code: "mm", dialCode: "+95" },
  { name: "New Zealand", code: "nz", dialCode: "+64" },
  { name: "South Africa", code: "za", dialCode: "+27" },
  { name: "Spain", code: "es", dialCode: "+34" },
  { name: "Italy", code: "it", dialCode: "+39" },
  { name: "Netherlands", code: "nl", dialCode: "+31" },
  { name: "Switzerland", code: "ch", dialCode: "+41" },
  { name: "Sweden", code: "se", dialCode: "+46" },
  { name: "Norway", code: "no", dialCode: "+47" },
  { name: "Denmark", code: "dk", dialCode: "+45" },
  { name: "Finland", code: "fi", dialCode: "+358" },
  { name: "Ukraine", code: "ua", dialCode: "+380" },
  { name: "Poland", code: "pl", dialCode: "+48" },
  { name: "Romania", code: "ro", dialCode: "+40" },
  { name: "Turkey", code: "tr", dialCode: "+90" },
  { name: "Saudi Arabia", code: "sa", dialCode: "+966" },
  { name: "United Arab Emirates", code: "ae", dialCode: "+971" },
  { name: "Israel", code: "il", dialCode: "+972" },
  { name: "Egypt", code: "eg", dialCode: "+20" },
  { name: "Nigeria", code: "ng", dialCode: "+234" },
  { name: "Mexico", code: "mx", dialCode: "+52" },
  { name: "Argentina", code: "ar", dialCode: "+54" },
  { name: "Colombia", code: "co", dialCode: "+57" },
  { name: "Chile", code: "cl", dialCode: "+56" },
  { name: "Peru", code: "pe", dialCode: "+51" },
  { name: "Pakistan", code: "pk", dialCode: "+92" },
  { name: "Bangladesh", code: "bd", dialCode: "+880" },
  { name: "Sri Lanka", code: "lk", dialCode: "+94" },
  { name: "Nepal", code: "np", dialCode: "+977" },
  { name: "Macau", code: "mo", dialCode: "+853" },
  { name: "Austria", code: "at", dialCode: "+43" },
  { name: "Belgium", code: "be", dialCode: "+32" },
  { name: "Bulgaria", code: "bg", dialCode: "+359" },
  { name: "Croatia", code: "hr", dialCode: "+385" },
  { name: "Cyprus", code: "cy", dialCode: "+357" },
  { name: "Czech Republic", code: "cz", dialCode: "+420" },
  { name: "Estonia", code: "ee", dialCode: "+372" },
  { name: "Greece", code: "gr", dialCode: "+30" },
  { name: "Hungary", code: "hu", dialCode: "+36" },
  { name: "Iceland", code: "is", dialCode: "+354" },
  { name: "Ireland", code: "ie", dialCode: "+353" },
  { name: "Latvia", code: "lv", dialCode: "+371" },
  { name: "Lithuania", code: "lt", dialCode: "+370" },
  { name: "Luxembourg", code: "lu", dialCode: "+352" },
  { name: "Malta", code: "mt", dialCode: "+356" },
  { name: "Portugal", code: "pt", dialCode: "+351" },
  { name: "Slovakia", code: "sk", dialCode: "+421" },
  { name: "Slovenia", code: "si", dialCode: "+386" },
  { name: "Afghanistan", code: "af", dialCode: "+93" },
  { name: "Aland Islands", code: "ax", dialCode: "+358" },
  { name: "Albania", code: "al", dialCode: "+355" },
  { name: "Algeria", code: "dz", dialCode: "+213" },
  { name: "American Samoa", code: "as", dialCode: "+1-684" },
  { name: "Andorra", code: "ad", dialCode: "+376" },
  { name: "Angola", code: "ao", dialCode: "+244" },
  { name: "Anguilla", code: "ai", dialCode: "+1-264" },
  { name: "Antarctica", code: "aq", dialCode: "+672" },
  { name: "Antigua and Barbuda", code: "ag", dialCode: "+1-268" },
  { name: "Armenia", code: "am", dialCode: "+374" },
  { name: "Aruba", code: "aw", dialCode: "+297" },
  { name: "Azerbaijan", code: "az", dialCode: "+994" },
  { name: "Bahamas", code: "bs", dialCode: "+1-242" },
  { name: "Bahrain", code: "bh", dialCode: "+973" },
  { name: "Barbados", code: "bb", dialCode: "+1-246" },
  { name: "Belarus", code: "by", dialCode: "+375" },
  { name: "Belize", code: "bz", dialCode: "+501" },
  { name: "Benin", code: "bj", dialCode: "+229" },
  { name: "Bermuda", code: "bm", dialCode: "+1-441" },
  { name: "Bhutan", code: "bt", dialCode: "+975" },
  { name: "Bolivia", code: "bo", dialCode: "+591" },
  { name: "Bonaire, Sint Eustatius and Saba", code: "bq", dialCode: "+599" },
  { name: "Bosnia and Herzegovina", code: "ba", dialCode: "+387" },
  { name: "Botswana", code: "bw", dialCode: "+267" },
  { name: "Bouvet Island", code: "bv", dialCode: "+47" },
  { name: "British Indian Ocean Territory", code: "io", dialCode: "+246" },
  { name: "Brunei", code: "bn", dialCode: "+673" },
  { name: "Burkina Faso", code: "bf", dialCode: "+226" },
  { name: "Burundi", code: "bi", dialCode: "+257" },
  { name: "Cabo Verde", code: "cv", dialCode: "+238" },
  { name: "Cameroon", code: "cm", dialCode: "+237" },
  { name: "Cayman Islands", code: "ky", dialCode: "+1-345" },
  { name: "Central African Republic", code: "cf", dialCode: "+236" },
  { name: "Chad", code: "td", dialCode: "+235" },
  { name: "Christmas Island", code: "cx", dialCode: "+61" },
  { name: "Cocos (Keeling) Islands", code: "cc", dialCode: "+61" },
  { name: "Comoros", code: "km", dialCode: "+269" },
  { name: "Congo (Congo-Brazzaville)", code: "cg", dialCode: "+242" },
  { name: "Congo (Congo-Kinshasa)", code: "cd", dialCode: "+243" },
  { name: "Cook Islands", code: "ck", dialCode: "+682" },
  { name: "Costa Rica", code: "cr", dialCode: "+506" },
  { name: "Cote d'Ivoire", code: "ci", dialCode: "+225" },
  { name: "Cuba", code: "cu", dialCode: "+53" },
  { name: "Curacao", code: "cw", dialCode: "+599" },
  { name: "Djibouti", code: "dj", dialCode: "+253" },
  { name: "Dominica", code: "dm", dialCode: "+1-767" },
  { name: "Dominican Republic", code: "do", dialCode: "+1" },
  { name: "Ecuador", code: "ec", dialCode: "+593" },
  { name: "El Salvador", code: "sv", dialCode: "+503" },
  { name: "Equatorial Guinea", code: "gq", dialCode: "+240" },
  { name: "Eritrea", code: "er", dialCode: "+291" },
  { name: "Eswatini (Swaziland)", code: "sz", dialCode: "+268" },
  { name: "Ethiopia", code: "et", dialCode: "+251" },
  { name: "Falkland Islands", code: "fk", dialCode: "+500" },
  { name: "Faroe Islands", code: "fo", dialCode: "+298" },
  { name: "Fiji", code: "fj", dialCode: "+679" },
  { name: "French Guiana", code: "gf", dialCode: "+594" },
  { name: "French Polynesia", code: "pf", dialCode: "+689" },
  { name: "French Southern Territories", code: "tf", dialCode: "+262" },
  { name: "Gabon", code: "ga", dialCode: "+241" },
  { name: "Gambia", code: "gm", dialCode: "+220" },
  { name: "Georgia", code: "ge", dialCode: "+995" },
  { name: "Ghana", code: "gh", dialCode: "+233" },
  { name: "Gibraltar", code: "gi", dialCode: "+350" },
  { name: "Greenland", code: "gl", dialCode: "+299" },
  { name: "Grenada", code: "gd", dialCode: "+1-473" },
  { name: "Guadeloupe", code: "gp", dialCode: "+590" },
  { name: "Guam", code: "gu", dialCode: "+1-671" },
  { name: "Guatemala", code: "gt", dialCode: "+502" },
  { name: "Guernsey", code: "gg", dialCode: "+44" },
  { name: "Guinea", code: "gn", dialCode: "+224" },
  { name: "Guinea-Bissau", code: "gw", dialCode: "+245" },
  { name: "Guyana", code: "gy", dialCode: "+592" },
  { name: "Haiti", code: "ht", dialCode: "+509" },
  { name: "Heard Island and McDonald Islands", code: "hm", dialCode: "+672" },
  { name: "Honduras", code: "hn", dialCode: "+504" },
  { name: "Iran", code: "ir", dialCode: "+98" },
  { name: "Iraq", code: "iq", dialCode: "+964" },
  { name: "Isle of Man", code: "im", dialCode: "+44" },
  { name: "Jamaica", code: "jm", dialCode: "+1-876" },
  { name: "Jersey", code: "je", dialCode: "+44" },
  { name: "Jordan", code: "jo", dialCode: "+962" },
  { name: "Kazakhstan", code: "kz", dialCode: "+7" },
  { name: "Kenya", code: "ke", dialCode: "+254" },
  { name: "Kiribati", code: "ki", dialCode: "+686" },
  { name: "North Korea", code: "kp", dialCode: "+850" },
  { name: "Kuwait", code: "kw", dialCode: "+965" },
  { name: "Kyrgyzstan", code: "kg", dialCode: "+996" },
  { name: "Lebanon", code: "lb", dialCode: "+961" },
  { name: "Lesotho", code: "ls", dialCode: "+266" },
  { name: "Liberia", code: "lr", dialCode: "+231" },
  { name: "Libya", code: "ly", dialCode: "+218" },
  { name: "Liechtenstein", code: "li", dialCode: "+423" },
  { name: "North Macedonia", code: "mk", dialCode: "+389" },
  { name: "Madagascar", code: "mg", dialCode: "+261" },
  { name: "Malawi", code: "mw", dialCode: "+265" },
  { name: "Maldives", code: "mv", dialCode: "+960" },
  { name: "Mali", code: "ml", dialCode: "+223" },
  { name: "Marshall Islands", code: "mh", dialCode: "+692" },
  { name: "Martinique", code: "mq", dialCode: "+596" },
  { name: "Mauritania", code: "mr", dialCode: "+222" },
  { name: "Mauritius", code: "mu", dialCode: "+230" },
  { name: "Mayotte", code: "yt", dialCode: "+262" },
  { name: "Micronesia", code: "fm", dialCode: "+691" },
  { name: "Moldova", code: "md", dialCode: "+373" },
  { name: "Monaco", code: "mc", dialCode: "+377" },
  { name: "Mongolia", code: "mn", dialCode: "+976" },
  { name: "Montenegro", code: "me", dialCode: "+382" },
  { name: "Montserrat", code: "ms", dialCode: "+1-664" },
  { name: "Mozambique", code: "mz", dialCode: "+258" },
  { name: "Namibia", code: "na", dialCode: "+264" },
  { name: "Nauru", code: "nr", dialCode: "+674" },
  { name: "New Caledonia", code: "nc", dialCode: "+687" },
  { name: "Nicaragua", code: "ni", dialCode: "+505" },
  { name: "Niger", code: "ne", dialCode: "+227" },
  { name: "Niue", code: "nu", dialCode: "+683" },
  { name: "Norfolk Island", code: "nf", dialCode: "+672" },
  { name: "Northern Mariana Islands", code: "mp", dialCode: "+1-670" },
  { name: "Oman", code: "om", dialCode: "+968" },
  { name: "Palau", code: "pw", dialCode: "+680" },
  { name: "Palestine", code: "ps", dialCode: "+970" },
  { name: "Panama", code: "pa", dialCode: "+507" },
  { name: "Papua New Guinea", code: "pg", dialCode: "+675" },
  { name: "Paraguay", code: "py", dialCode: "+595" },
  { name: "Pitcairn", code: "pn", dialCode: "+64" },
  { name: "Puerto Rico", code: "pr", dialCode: "+1-787" },
  { name: "Qatar", code: "qa", dialCode: "+974" },
  { name: "Reunion", code: "re", dialCode: "+262" },
  { name: "Rwanda", code: "rw", dialCode: "+250" },
  { name: "Saint Barthelemy", code: "bl", dialCode: "+590" },
  { name: "Saint Helena", code: "sh", dialCode: "+290" },
  { name: "Saint Kitts and Nevis", code: "kn", dialCode: "+1-869" },
  { name: "Saint Lucia", code: "lc", dialCode: "+1-758" },
  { name: "Saint Martin", code: "mf", dialCode: "+590" },
  { name: "Saint Pierre and Miquelon", code: "pm", dialCode: "+508" },
  { name: "Saint Vincent and the Grenadines", code: "vc", dialCode: "+1-784" },
  { name: "Samoa", code: "ws", dialCode: "+685" },
  { name: "San Marino", code: "sm", dialCode: "+378" },
  { name: "Sao Tome and Principe", code: "st", dialCode: "+239" },
  { name: "Senegal", code: "sn", dialCode: "+221" },
  { name: "Serbia", code: "rs", dialCode: "+381" },
  { name: "Seychelles", code: "sc", dialCode: "+248" },
  { name: "Sierra Leone", code: "sl", dialCode: "+232" },
  { name: "Sint Maarten", code: "sx", dialCode: "+1-721" },
  { name: "Solomon Islands", code: "sb", dialCode: "+677" },
  { name: "Somalia", code: "so", dialCode: "+252" },
  { name: "South Georgia and the South Sandwich Islands", code: "gs", dialCode: "+500" },
  { name: "South Sudan", code: "ss", dialCode: "+211" },
  { name: "Sudan", code: "sd", dialCode: "+249" },
  { name: "Suriname", code: "sr", dialCode: "+597" },
  { name: "Svalbard and Jan Mayen", code: "sj", dialCode: "+47" },
  { name: "Syria", code: "sy", dialCode: "+963" },
  { name: "Tajikistan", code: "tj", dialCode: "+992" },
  { name: "Tanzania", code: "tz", dialCode: "+255" },
  { name: "Timor-Leste", code: "tl", dialCode: "+670" },
  { name: "Togo", code: "tg", dialCode: "+228" },
  { name: "Tokelau", code: "tk", dialCode: "+690" },
  { name: "Tonga", code: "to", dialCode: "+676" },
  { name: "Trinidad and Tobago", code: "tt", dialCode: "+1-868" },
  { name: "Tunisia", code: "tn", dialCode: "+216" },
  { name: "Turkmenistan", code: "tm", dialCode: "+993" },
  { name: "Turks and Caicos Islands", code: "tc", dialCode: "+1-649" },
  { name: "Tuvalu", code: "tv", dialCode: "+688" },
  { name: "Uganda", code: "ug", dialCode: "+256" },
  { name: "United States Minor Outlying Islands", code: "um", dialCode: "+1" },
  { name: "Uruguay", code: "uy", dialCode: "+598" },
  { name: "Uzbekistan", code: "uz", dialCode: "+998" },
  { name: "Vanuatu", code: "vu", dialCode: "+678" },
  { name: "Vatican City", code: "va", dialCode: "+379" },
  { name: "Virgin Islands, British", code: "vg", dialCode: "+1-284" },
  { name: "Virgin Islands, U.S.", code: "vi", dialCode: "+1-340" },
  { name: "Wallis and Futuna", code: "wf", dialCode: "+681" },
  { name: "Western Sahara", code: "eh", dialCode: "+212" },
  { name: "Yemen", code: "ye", dialCode: "+967" },
  { name: "Zambia", code: "zm", dialCode: "+260" },
  { name: "Zimbabwe", code: "zw", dialCode: "+263" },
]

const sortedCountries = Array.from(
  new Map(COUNTRIES.map((c) => [c.code, c])).values()
).sort((a, b) => a.name.localeCompare(b.name));


function findCountryByNumber(phone: string): { country: Country; localNum: string } {
  const defaultCountry = sortedCountries.find((c) => c.code === "vn") || sortedCountries[0];
  if (!phone) {
    return { country: defaultCountry, localNum: "" };
  }

  let cleanPhone = phone.trim();
  if (!cleanPhone.startsWith("+")) {
    cleanPhone = "+" + cleanPhone;
  }

  const countriesByPrefixLen = [...sortedCountries].sort(
    (a, b) => b.dialCode.length - a.dialCode.length
  );

  for (const country of countriesByPrefixLen) {
    if (cleanPhone.startsWith(country.dialCode)) {
      const localNum = cleanPhone.slice(country.dialCode.length);
      return { country, localNum };
    }
  }

  return { country: defaultCountry, localNum: phone };
}

export interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function PhoneInput({
  value = "",
  onChange,
  placeholder = "Nhập số điện thoại...",
  disabled = false,
  className,
  id,
}: PhoneInputProps) {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const { country: initialCountry, localNum: initialLocalNum } = React.useMemo(() => {
    return findCountryByNumber(value);
  }, [value]);

  const [selectedCountry, setSelectedCountry] = React.useState<Country>(initialCountry);
  const [localNumber, setLocalNumber] = React.useState<string>(initialLocalNum);

  React.useEffect(() => {
    const { country, localNum } = findCountryByNumber(value);
    setSelectedCountry(country);
    setLocalNumber(localNum);
  }, [value]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setPopoverOpen(false);
    setSearch("");
    const combinedValue = `${country.dialCode}${localNumber.replace(/\D/g, "")}`;
    if (onChange) {
      onChange(combinedValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleanDigits = rawVal.replace(/\D/g, "");
    setLocalNumber(cleanDigits);
    const combinedValue = `${selectedCountry.dialCode}${cleanDigits}`;
    if (onChange) {
      onChange(combinedValue);
    }
  };

  const filteredCountries = React.useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return sortedCountries;
    return sortedCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.dialCode.includes(term) ||
        c.code.toLowerCase().includes(term)
    );
  }, [search]);

  const [displayLimit, setDisplayLimit] = React.useState(30);

  React.useEffect(() => {
    setDisplayLimit(30);
  }, [search]);

  const visibleCountries = React.useMemo(() => {
    return filteredCountries.slice(0, displayLimit);
  }, [filteredCountries, displayLimit]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50) {
      setDisplayLimit((prev) => Math.min(prev + 30, filteredCountries.length));
    }
  };

  const paddingLeft = React.useMemo(() => {
    const dialCodeLength = selectedCountry.dialCode.length;
    return Math.round(72 + dialCodeLength * 7.5);
  }, [selectedCountry.dialCode]);

  return (
    <div
      className={cn("relative flex items-center w-full", className)}
      id={id ? `${id}-container` : undefined}
    >
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "absolute left-0 top-0 bottom-0 flex items-center gap-1.5 px-3 border-r border-input bg-transparent text-sm hover:bg-muted/50 transition-colors cursor-pointer select-none outline-none rounded-l-lg shrink-0 z-10",
              disabled && "opacity-50 pointer-events-none cursor-not-allowed"
            )}
          >
            <img
              src={`https://hatscripts.github.io/circle-flags/flags/${selectedCountry.code}.svg`}
              alt={selectedCountry.name}
              className="size-4.5 rounded-full shrink-0"
            />
            <span className="text-[13px] font-bold font-mono tracking-tight text-foreground">
              {selectedCountry.dialCode}
            </span>
            <Icon
              icon="solar:alt-arrow-down-line-duotone"
              className={cn(
                "size-3 text-muted-foreground/60 transition-transform duration-200 shrink-0",
                popoverOpen && "rotate-180"
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-72 p-2 shadow-md rounded-lg flex flex-col focus-within:ring-0"
        >
          <div className="relative shrink-0 mb-2">
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground/60 pointer-events-none">
              <Icon icon="solar:magnifer-line-duotone" className="size-4" />
            </div>
            <Input
              type="text"
              placeholder="Tìm quốc gia, mã vùng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8.5 pl-9 text-xs"
            />
          </div>
          <div
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto max-h-[220px] custom-scrollbar flex flex-col gap-0.5 pr-0.5"
          >
            {visibleCountries.map((c) => {
              const isSelected = selectedCountry.code === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCountrySelect(c)}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-all cursor-pointer outline-none",
                    isSelected
                      ? "bg-muted text-foreground font-semibold"
                      : "hover:bg-muted/50 text-foreground/80 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={`https://hatscripts.github.io/circle-flags/flags/${c.code}.svg`}
                      alt={c.name}
                      className="size-4.5 rounded-full shrink-0"
                      loading="lazy"
                    />
                    <span className="truncate pr-1 font-medium">{c.name}</span>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-mono font-bold text-2xs px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground",
                      isSelected && "text-foreground"
                    )}
                  >
                    {c.dialCode}
                  </span>
                </button>
              );
            })}
            {filteredCountries.length === 0 && (
              <div className="text-center py-6 text-xs text-muted-foreground/60">
                Không tìm thấy quốc gia phù hợp
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <Input
        id={id}
        type="tel"
        value={localNumber}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{ paddingLeft: `${paddingLeft}px` }}
        className="w-full"
      />
    </div>
  );
}
