export const PATTERN_TOKENS           = new Set(["!", "@", "?", "*", "+"]);
export const REGEX_SPECIAL_CHARACTERS = new Set([".", "+", "*", "?", "^", "$", "(", ")", "[", "]", "{", "}", "|", "\\", "/"]);
export const SEPARATORS               = new Set(["/", "\\"]);
export const QUOTES                   = new Set(["\"", "'"]);
export const NUMBRACES_PATTERN        = /^(-?\d+)\.\.(-?\d+)(?:\.\.(-?\d+))?$/;
export const ALPHABRACES_PATTERN      = /^([a-zA-Z])\.\.([a-zA-Z])(?:\.\.(-?\d+))?$/;
export const CHARACTERS_CLASS_MAP: Record<string, string> =
{
    "[:alnum:]":  "[A-Za-z0-9]",
    "[:alpha:]":  "[A-Za-z]",
    "[:ascii:]":  "[\\x00-\\x7F]",
    "[:blank:]":  "[ \\t]",
    "[:cntrl:]":  "[\\x00-\\x1F\\x7F]",
    "[:digit:]":  "\\d",
    "[:graph:]":  "[\\x21-\\x7E]",
    "[:lower:]":  "[a-z]",
    "[:print:]":  "[\\x20-\\x7E]",
    "[:punct:]":  "[^ A-Za-z0-9]",
    "[:space:]":  "\\s",
    "[:upper:]":  "[A-Z]",
    "[:word:]":   "\\w",
    "[:xdigit:]": "[0-9a-fA-F]",
};

export const GROUPS =
{
    "!":  { open: "(?!^(?:", close: ")|(?:(^|.*[\\/\\\\])\\.[^\\/\\\\]+[\\/\\\\]?.*)$).*" },
    "!(": { open: "(?:(?!",  close: ").*)" },
    "!.": { open: "(?!^",    close: "$).*" },
    "*(": { open: "(?:",     close: ")*" },
    "+(": { open: "(?:",     close: ")+" },
    "?(": { open: "(?:",     close: ")?" },
    "@(": { open: "(?:",     close: ")" },
    "[":  { open: "[",       close: "]" },
    "{":  { open: "(?:",     close: ")" },
};
