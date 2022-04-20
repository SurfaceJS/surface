/* eslint-disable complexity */
/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
import Character   from "./character.js";
import Messages    from "./messages.js";
import SyntaxError from "./syntax-error.js";
import TokenType   from "./token-type.js";
import type Token  from "./types/token.js";

const BACK_TICK                 = 0x60;
const BLACKSLASH                = 0x5C;
const CHAR_LOWERCASE_U          = 0x75;
const CLOSE_CURLY_BRACKET       = 0x7D;
const CLOSE_ROUND_BRACKET       = 0x29;
const DOT                       = 0x2E;
const DOUBLE_QUOTE              = 0x22;
const HIGH_SURROGATE_AREA_BEGIN = 0xD800;
const LOW_SURROGATE_AREA_END    = 0xDFFF;
const OPEN_ROUND_BRACKET        = 0x28;
const SEMI_COMA                 = 0x3B;
const SINGLE_QUOTE              = 0x27;
const UNICODE_RANGE_END         = 0x10FFFF;

export default class Scanner
{
    private readonly curlyStack: string[];
    private readonly length:     number;

    private lineNumber: number;
    private lineStart:  number;

    private readonly _source: string;
    public get source(): string
    {
        return this._source;
    }

    private _index: number;
    public get index(): number
    {
        return this._index;
    }

    public constructor(source: string)
    {
        this._source = source;

        this.curlyStack = [];
        this.length     = source.length;
        this._index     = 0;
        this.lineNumber = 1;
        this.lineStart  = 0;
    }

    private advance(): void
    {
        this._index++;
    }

    private eof(): boolean
    {
        return this.index == this.length;
    }

    // eslint-disable-next-line complexity
    private isKeyword(id: string): boolean
    {
        switch (id.length)
        {
            case 2:
                return id == "if"
                    || id == "in"
                    || id == "do";
            case 3:
                return id == "var"
                    || id == "for"
                    || id == "new"
                    || id == "try"
                    || id == "let";
            case 4:
                return id == "this"
                    || id == "else"
                    || id == "case"
                    || id == "void"
                    || id == "with"
                    || id == "enum";
            case 5:
                return id == "while"
                    || id == "break"
                    || id == "catch"
                    || id == "throw"
                    || id == "const"
                    || id == "yield"
                    || id == "class"
                    || id == "super";
            case 6:
                return id == "return"
                    || id == "typeof"
                    || id == "delete"
                    || id == "switch"
                    || id == "export"
                    || id == "import";
            case 7:
                return id == "default"
                    || id == "finally"
                    || id == "extends";
            case 8:
                return id == "function"
                    || id == "continue"
                    || id == "debugger";
            case 10:
                return id == "instanceof";
            default:
                return false;
        }
    }

    private isBinary(value: string): boolean
    {
        return value == "0" || value == "1";
    }

    private isImplicitOctalLiteral(): boolean
    {
        for (let i = this.index + 1; i < this.length; i++)
        {
            const char = this.source[i];

            if (char == "8" || char == "9")
            {
                return false;
            }

            if (!Character.isOctalDigit(char.charCodeAt(0)))
            {
                return true;
            }
        }

        return true;
    }

    private getIdentifier(): string
    {
        const start = this.index;

        while (!this.eof())
        {
            const charCode = this.source.charCodeAt(this.index);

            if (charCode == BLACKSLASH)
            {
                this.setCursorAt(start);

                return this.getComplexIdentifier();
            }
            else if (charCode >= HIGH_SURROGATE_AREA_BEGIN && charCode < LOW_SURROGATE_AREA_END)
            {
                this.setCursorAt(start);

                return this.getComplexIdentifier();
            }

            if (Character.isIdentifierPart(charCode))
            {
                this.advance();
            }
            else
            {
                break;
            }
        }

        return this.source.substring(start, this.index);
    }

    private getComplexIdentifier(): string
    {
        let codePoint = this.source.codePointAt(this.index) as number;
        let id        = String.fromCodePoint(codePoint);

        this.setCursorAt(this.index + id.length);

        if (codePoint == BLACKSLASH)
        {
            if (this.source.charCodeAt(this.index) != CHAR_LOWERCASE_U)
            {
                this.throwUnexpectedToken();
            }

            this.advance();

            if (this.source[this.index] == "{")
            {
                this.advance();

                id = this.scanUnicodeCodePointEscape();
            }
            else
            {
                const hexEscape = this.scanHexEscape("u");
                if (hexEscape === null || hexEscape == "\\" || !Character.isIdentifierStart(hexEscape.charCodeAt(0)))
                {
                    this.throwUnexpectedToken();
                }
                else
                {
                    id = hexEscape;
                }
            }
        }

        while (!this.eof())
        {
            codePoint = this.source.codePointAt(this.index) as number;

            let char = String.fromCodePoint(codePoint);

            id += char;

            this.setCursorAt(this.index + char.length);

            if (codePoint == BLACKSLASH)
            {
                id = id.substring(0, id.length - 1);

                if (this.source.charCodeAt(this.index) != CHAR_LOWERCASE_U)
                {
                    this.throwUnexpectedToken();
                }

                this.advance();

                if (this.source[this.index] == "{")
                {
                    this.advance();

                    char = this.scanUnicodeCodePointEscape();
                }
                else
                {
                    const hexEscape = this.scanHexEscape("u");

                    if (hexEscape === null || hexEscape == "\\" || !Character.isIdentifierPart(hexEscape.charCodeAt(0)))
                    {
                        this.throwUnexpectedToken();
                    }
                    else
                    {
                        char = hexEscape;
                    }

                }

                id += char;
            }
        }

        return id;
    }

    private hexValue(char: string): number
    {
        return "0123456789abcdef".indexOf(char.toLowerCase());
    }

    private octalToDecimal(char: string): { code: number, isOctal: boolean }
    {
        let isOctal = char != "0";

        let code = Number(char);

        if (!this.eof() && Character.isOctalDigit(this.source.charCodeAt(this.index)))
        {
            isOctal = true;

            code = code * 8 + Number(this.source[this.index]);

            this.advance();

            if ("0123".includes(char) && !this.eof() && Character.isOctalDigit(this.source.charCodeAt(this.index)))
            {
                code = code * 8 + Number(this.source[this.index]);

                this.advance();
            }
        }

        return { code, isOctal };
    }

    private scanBinaryLiteral(start: number): Token
    {
        let value  = "";
        let isBigInt = false;

        if (!this.eof())
        {
            if (!this.isBinary(this.source[this.index]))
            {
                this.throwUnexpectedToken();
            }

            while (!this.eof())
            {
                const char = this.source[this.index];

                if (this.isBinary(char))
                {
                    value += char;
                }
                else if (char != "_")
                {
                    break;
                }

                this.advance();
            }
        }

        if (value.length == 0)
        {
            this.throwUnexpectedToken();
        }

        if (this.source[this.index - 1] == "_")
        {
            this.throwUnexpectedToken(Messages.numericSeparatorsAreNotAllowedAtTheEndOfNumericLiterals);
        }

        if (this.source[this.index] == "n")
        {
            isBigInt = true;

            this.advance();
        }
        else if (!this.eof())
        {
            const codePoint = this.source.charCodeAt(this.index);

            if (Character.isIdentifierStart(codePoint) || Character.isDecimalDigit(codePoint))
            {
                this.throwUnexpectedToken();
            }
        }

        const parser = isBigInt ? BigInt : Number;

        const token: Token =
        {
            end:        this.index,
            lineNumber: this.lineNumber,
            lineStart:  this.lineStart,
            raw:        this.source.substring(start, this.index),
            start,
            type:       TokenType.NumericLiteral,
            value:      parser(`0b${value}`),
        };

        return token;
    }

    private scanHexEscape(prefix: string): string | null
    {
        const length = prefix == "u" ? 4 : 2;

        let code = 0;

        for (let i = 0; i < length; i++)
        {
            if (!this.eof() && Character.isHexDigit(this.source.charCodeAt(this.index)))
            {
                code = code * 16 + this.hexValue(this.source[this.index]);

                this.advance();
            }
            else
            {
                return null;
            }
        }

        return String.fromCharCode(code);
    }

    private scanHexLiteral(start: number): Token
    {
        let value  = "";
        let isBigInt = false;

        if (!this.eof())
        {
            if (!Character.isHexDigit(this.source.charCodeAt(this.index)))
            {
                this.throwUnexpectedToken();
            }

            while (!this.eof())
            {
                const char = this.source[this.index];

                if (Character.isHexDigit(char.charCodeAt(0)))
                {
                    value += char;
                }
                else if (char != "_")
                {
                    break;
                }

                this.advance();
            }
        }

        if (value.length == 0)
        {
            this.throwUnexpectedToken();
        }

        if (this.source[this.index - 1] == "_")
        {
            this.throwUnexpectedToken(Messages.numericSeparatorsAreNotAllowedAtTheEndOfNumericLiterals);
        }

        if (this.source[this.index] == "n")
        {
            isBigInt = true;

            this.advance();
        }

        if (Character.isIdentifierStart(this.source.charCodeAt(this.index)))
        {
            this.throwUnexpectedToken();
        }

        const parser = isBigInt ? BigInt : Number;

        const token: Token =
        {
            end:        this.index,
            lineNumber: this.lineNumber,
            lineStart:  this.lineStart,
            raw:        this.source.substring(start, this.index),
            start,
            type:       TokenType.NumericLiteral,
            value:      parser(`0x${value}`),
        };

        return token;
    }

    private scanIdentifier(): Token
    {
        const start = this.index;
        const id    = this.source.charCodeAt(start) == BLACKSLASH ? this.getComplexIdentifier() : this.getIdentifier();

        let type:  TokenType;
        let value: unknown;

        if (id.length == 1)
        {
            type  = TokenType.Identifier;
            value = id;
        }
        else if (this.isKeyword(id))
        {
            type  = TokenType.Keyword;
            value = id;
        }
        else if (id == "null")
        {
            type  = TokenType.NullLiteral;
            value = null;
        }
        else if (id == "undefined")
        {
            type  = TokenType.Identifier;
            value = undefined;
        }
        else if (id == "true" || id == "false")
        {
            type  = TokenType.BooleanLiteral;
            value = id == "true";
        }
        else
        {
            type  = TokenType.Identifier;
            value = id;
        }

        if (type != TokenType.Identifier && start + id.length != this.index)
        {
            this.setCursorAt(start);
            this.throwUnexpectedToken(Messages.keywordMustNotContainEscapedCharacters);
        }

        const token: Token =
        {
            end:        this.index,
            lineNumber: this.lineNumber,
            lineStart:  this.lineStart,
            raw:        this.source.substring(start, this.index),
            start,
            type,
            value,
        };

        return token;
    }

    private scanNumericLiteral(): Token
    {
        const start = this.index;

        let isBigInt = false;
        let isFloat  = false;

        let value = "";

        if (this.source[this.index] != ".")
        {
            value = this.source[this.index];

            this.advance();

            if (!this.eof())
            {
                if (value == "0")
                {
                    const char = this.source[this.index];

                    if (char == "_")
                    {
                        this.throwUnexpectedToken(Messages.numericSeparatorCanNotBeUsedAfterLeadingZero);
                    }

                    if (char == "x" || char == "X")
                    {
                        this.advance();

                        return this.scanHexLiteral(start);
                    }

                    if (char == "b" || char == "B")
                    {
                        this.advance();

                        return this.scanBinaryLiteral(start);
                    }

                    if (char == "o" || char == "O")
                    {
                        this.advance();

                        return this.scanOctalLiteral(start, false);
                    }

                    if (this.source[this.index] && Character.isOctalDigit(char.charCodeAt(0)))
                    {
                        if (this.isImplicitOctalLiteral())
                        {
                            return this.scanOctalLiteral(start, true);
                        }
                    }
                }

                while (!this.eof())
                {
                    const char = this.source[this.index];

                    if (Character.isDecimalDigit(this.source.charCodeAt(this.index)))
                    {
                        value += char;
                    }
                    else if (char != "_")
                    {
                        break;
                    }

                    this.advance();
                }
            }
        }

        if (this.source[this.index - 1] == "_")
        {
            this.throwUnexpectedToken(Messages.numericSeparatorsAreNotAllowedAtTheEndOfNumericLiterals);
        }

        if (this.source[this.index] == ".")
        {
            isFloat = true;

            value += this.source[this.index];

            this.advance();

            if (!this.eof())
            {
                if (!Character.isDecimalDigit(this.source.charCodeAt(this.index)))
                {
                    this.throwUnexpectedToken();
                }

                while (!this.eof())
                {
                    const char = this.source[this.index];

                    if (Character.isDecimalDigit(this.source.charCodeAt(this.index)))
                    {
                        value += char;
                    }
                    else if (char != "_")
                    {
                        break;
                    }

                    this.advance();
                }
            }

        }

        if (this.source[this.index] == "e" || this.source[this.index] == "E")
        {
            value += this.source[this.index];

            this.advance();

            if (this.source[this.index] == "+" || this.source[this.index] == "-")
            {
                value += this.source[this.index];

                this.advance();
            }

            if (Character.isDecimalDigit(this.source.charCodeAt(this.index)))
            {
                while (Character.isDecimalDigit(this.source.charCodeAt(this.index)))
                {
                    value += this.source[this.index];

                    this.advance();
                }
            }
            else
            {
                this.throwUnexpectedToken();
            }
        }

        if (this.source[this.index - 1] == "_")
        {
            this.throwUnexpectedToken(Messages.numericSeparatorsAreNotAllowedAtTheEndOfNumericLiterals);
        }

        if (this.source[this.index] == "n")
        {
            if (isFloat)
            {
                this.throwUnexpectedToken();
            }

            isBigInt = true;

            this.advance();
        }

        if (Character.isIdentifierStart(this.source.charCodeAt(this.index)))
        {
            this.throwUnexpectedToken();
        }

        const parser = isBigInt ? BigInt : Number;

        const token: Token =
        {
            end:        this.index,
            lineNumber: this.lineNumber,
            lineStart:  this.lineStart,
            raw:        this.source.substring(start, this.index),
            start,
            type:       TokenType.NumericLiteral,
            value:      parser(value),
        };

        return token;
    }

    private scanOctalLiteral(start: number, implicit: boolean): Token
    {
        let value    = "";
        let isBigInt = false;

        if (!this.eof())
        {
            if (!Character.isOctalDigit(this.source.charCodeAt(this.index)))
            {
                this.throwUnexpectedToken();
            }

            while (!this.eof())
            {
                const char = this.source[this.index];

                if (Character.isOctalDigit(char.charCodeAt(0)))
                {
                    value += char;
                }
                else if (char != "_")
                {
                    break;
                }

                this.advance();
            }
        }

        if (!implicit && value.length == 0)
        {
            this.throwUnexpectedToken();
        }

        if (this.source[this.index - 1] == "_")
        {
            this.throwUnexpectedToken(Messages.numericSeparatorsAreNotAllowedAtTheEndOfNumericLiterals);
        }

        if (!implicit && this.source[this.index] == "n")
        {
            isBigInt = true;

            this.advance();
        }

        const codePoint = this.source.charCodeAt(this.index);

        if (Character.isIdentifierStart(codePoint) || Character.isDecimalDigit(codePoint))
        {
            this.throwUnexpectedToken();
        }

        const parser = isBigInt ? BigInt : Number;

        const token: Token =
        {
            end:        this.index,
            lineNumber: this.lineNumber,
            lineStart:  this.lineStart,
            raw:        this.source.substring(start, this.index),
            start,
            type:       TokenType.NumericLiteral,
            value:      parser(`0o${value}`),
        };

        return token;
    }

    private scanStringLiteral(): Token
    {
        const start = this.index;
        const quote = this.source[start];

        let terminated = false;
        let isOctal    = false;
        let value      = "";

        this.advance();

        while (!this.eof())
        {
            const char = this.source[this.index];

            this.advance();

            if (char == quote)
            {
                terminated = true;

                break;
            }
            else if (char == "\\")
            {
                const char = this.source[this.index];

                this.advance();

                if (!Character.isLineTerminator(char.charCodeAt(0)))
                {
                    switch (char)
                    {
                        case "u":
                            if (this.source[this.index] == "{")
                            {
                                this.advance();

                                value += this.scanUnicodeCodePointEscape();
                            }
                            else
                            {
                                const unescapedChar = this.scanHexEscape(char);

                                if (Object.is(unescapedChar, null))
                                {
                                    this.throwUnexpectedToken(Messages.invalidUnicodeEscapeSequence);
                                }

                                value += unescapedChar;
                            }
                            break;
                        case "x":
                        {
                            const unescaped = this.scanHexEscape(char);

                            if (Object.is(unescaped, null))
                            {
                                this.throwUnexpectedToken(Messages.invalidHexadecimalEscapeSequence);
                            }

                            value += unescaped;

                            break;
                        }
                        case "n":
                            value += "\n";

                            break;

                        case "r":
                            value += "\r";

                            break;

                        case "t":
                            value += "\t";

                            break;

                        case "b":
                            value += "\b";

                            break;

                        case "f":
                            value += "\f";

                            break;

                        case "v":
                            value += "\x0B";

                            break;

                        default:
                            if (char && Character.isOctalDigit(char.charCodeAt(0)))
                            {
                                const octalToDecimal = this.octalToDecimal(char);

                                isOctal = octalToDecimal.isOctal;

                                value += String.fromCharCode(octalToDecimal.code);
                            }
                            else
                            {
                                value += char;
                            }
                            break;
                    }
                }
                else
                {
                    break;
                }
            }
            else if (Character.isLineTerminator(char.charCodeAt(0)))
            {
                break;
            }
            else
            {
                value += char;
            }
        }

        if (!terminated)
        {
            this.throwUnexpectedToken();
        }

        const token: Token =
        {
            end:        this.index,
            isOctal,
            lineNumber: this.lineNumber,
            lineStart:  this.lineStart,
            raw:        this.source.substring(start, this.index),
            start,
            type:       TokenType.StringLiteral,
            value,
        };

        return token;
    }

    // eslint-disable-next-line complexity
    private scanPunctuator(): Token
    {
        const start = this.index;

        let punctuator = this.source[this.index];

        switch (punctuator)
        {
            case "(":
            case "{":
                if (punctuator == "{")
                {
                    this.curlyStack.push("{");
                }

                this.advance();

                break;

            case ".":
                this.advance();

                if (this.source[this.index] == "." && this.source[this.index + 1] == ".")
                {
                    this.setCursorAt(this.index + 2);

                    punctuator = "...";
                }

                break;

            case "}":
                this.advance();

                this.curlyStack.pop();

                break;

            case ")":
            case ";":
            case ",":
            case "[":
            case "]":
            case ":":
            case "~":
                this.advance();

                break;

            case "?":
                {
                    punctuator = "?";

                    const lookahead = this.source[this.index + 1];

                    if (lookahead == ".")
                    {
                        if (!Character.isDecimalDigit(this.source.codePointAt(this.index + 2)!))
                        {
                            punctuator = "?.";

                            this.advance();
                        }
                    }
                    else if (lookahead == "?")
                    {
                        punctuator = "??";

                        this.advance();

                        if (this.source[this.index + 1] == "=")
                        {
                            punctuator = "??=";

                            this.advance();
                        }
                    }

                    this.advance();
                }

                break;

            default:
                punctuator = this.source.substr(this.index, 4);

                if (punctuator == ">>>=")
                {
                    this.setCursorAt(this.index + 4);
                }
                else
                {
                    punctuator = punctuator.substr(0, 3);

                    switch (punctuator)
                    {
                        case "===":
                        case "!==":
                        case ">>>":
                        case "<<=":
                        case ">>=":
                        case "**=":
                        case "&&=":
                        case "||=":
                            this.setCursorAt(this.index + 3);

                            break;
                        default:
                            punctuator = punctuator.substr(0, 2);

                            switch (punctuator)
                            {
                                case "!=":
                                case "%=":
                                case "&&":
                                case "&=":
                                case "**":
                                case "*=":
                                case "++":
                                case "+=":
                                case "--":
                                case "-=":
                                case "/=":
                                case "<<":
                                case "<=":
                                case "==":
                                case "=>":
                                case ">=":
                                case ">>":
                                case "^=":
                                case "|=":
                                case "||":
                                    this.setCursorAt(this.index + 2);

                                    break;

                                default:
                                    punctuator = this.source[this.index];

                                    if ("<>=!+-*%&|^/".includes(punctuator))
                                    {
                                        this.advance();
                                    }

                                    break;
                            }
                    }
                }
        }

        if (this.index == start)
        {
            this.throwUnexpectedToken();
        }

        const token: Token =
        {
            end:        this.index,
            lineNumber: this.lineNumber,
            lineStart:  this.lineStart,
            raw:        punctuator,
            start,
            type:       TokenType.Punctuator,
            value:      punctuator,
        };

        return token;
    }

    // eslint-disable-next-line max-lines-per-function, max-statements
    private scanTemplate(): Token
    {
        const start  = this.index;
        const isHead = this.source[start] == "`";

        let cooked     = "";
        let terminated = false;
        let isTail     = false;
        let offset     = 1;

        this.advance();

        while (!this.eof())
        {
            const char = this.source[this.index];

            this.advance();

            if (char == "`")
            {
                isTail       = true;
                terminated = true;

                break;
            }
            else if (char == "$")
            {
                if (this.source[this.index] == "{")
                {
                    this.curlyStack.push("${");

                    this.advance();

                    offset++;

                    terminated = true;

                    break;
                }
                cooked += char;
            }
            else if (char == "\\")
            {
                const char = this.source[this.index];

                this.advance();

                if (!Character.isLineTerminator(char.charCodeAt(0)))
                {
                    switch (char)
                    {
                        case "n":
                            cooked += "\n";

                            break;

                        case "r":
                            cooked += "\r";

                            break;

                        case "t":
                            cooked += "\t";

                            break;

                        case "u":
                            if (this.source[this.index] == "{")
                            {
                                this.advance();

                                cooked += this.scanUnicodeCodePointEscape();
                            }
                            else
                            {
                                const restore       = this.index;
                                const unescapedChar = this.scanHexEscape(char);

                                if (unescapedChar !== null)
                                {
                                    cooked += unescapedChar;
                                }
                                else
                                {
                                    this.setCursorAt(restore);

                                    cooked += "\\u";
                                }
                            }

                            break;

                        case "x":
                            {
                                const unescaped = this.scanHexEscape(char);

                                if (Object.is(unescaped, null))
                                {
                                    this.throwUnexpectedToken(Messages.invalidHexadecimalEscapeSequence);
                                }

                                cooked += unescaped;
                            }

                            break;

                        case "b":
                            cooked += "\b";

                            break;

                        case "f":
                            cooked += "\f";

                            break;

                        case "v":
                            cooked += "\v";

                            break;

                        default:
                            if (char == "0")
                            {
                                if (Character.isDecimalDigit(this.source.charCodeAt(this.index)))
                                {
                                    this.throwUnexpectedToken(Messages.octalLiteralsAreNotAllowedInTemplateStrings);
                                }

                                cooked += "\0";
                            }
                            else if (Character.isOctalDigit(char.charCodeAt(0)))
                            {
                                this.throwUnexpectedToken(Messages.octalLiteralsAreNotAllowedInTemplateStrings);
                            }
                            else
                            {
                                cooked += char;
                            }

                            break;
                    }
                }
                else
                {
                    this.lineNumber++;

                    if (this.source[this.index] == "\n")
                    {
                        this.advance();
                    }

                    this.lineStart = this.index;

                    cooked += "\\\n";
                }
            }
            else if (Character.isLineTerminator(char.charCodeAt(0)))
            {
                this.lineNumber++;

                if (this.source[this.index] == "\n")
                {
                    this.advance();
                }

                this.lineStart = this.index;

                cooked += "\n";
            }
            else
            {
                cooked += char;
            }
        }

        if (!terminated)
        {
            this.throwUnexpectedToken();
        }

        if (!isHead)
        {
            this.curlyStack.pop();
        }

        const token: Token =
        {
            end:        this.index,
            isHead,
            isTail,
            lineNumber: this.lineNumber,
            lineStart:  this.lineStart,
            raw:        this.source.slice(start + 1, this.index - offset),
            start,
            type:       TokenType.Template,
            value:      cooked,
        };

        return token;
    }

    private scanUnicodeCodePointEscape(): string
    {
        let char = this.source[this.index];
        let code = 0;

        if (char == "}")
        {
            this.throwUnexpectedToken(Messages.invalidUnicodeEscapeSequence);
        }

        while (!this.eof())
        {
            char = this.source[this.index];

            this.advance();

            if (!Character.isHexDigit(char.charCodeAt(0)))
            {
                break;
            }

            code = code * 16 + this.hexValue(char);
        }

        if (code > UNICODE_RANGE_END || char != "}")
        {
            this.throwUnexpectedToken(Messages.invalidUnicodeEscapeSequence);
        }

        return String.fromCodePoint(code);
    }

    private setCursorAt(position: number): void
    {
        this._index = position;
    }

    private throwUnexpectedToken(message?: string): never
    {
        throw new SyntaxError(message ?? Messages.invalidOrUnexpectedToken, this.lineNumber, this.index, this.index - this.lineStart + 1);
    }

    public backtrack(steps: number): void
    {
        this._index -= steps;
    }

    public nextToken(): Token
    {
        if (this.eof())
        {
            const token: Token =
            {
                end:        this.index,
                lineNumber: this.lineNumber,
                lineStart:  this.lineStart,
                raw:        "",
                start:      this.index,
                type:       TokenType.EOF,
                value:      "",
            };

            return token;
        }

        const charCode = this.source.charCodeAt(this.index);

        if (Character.isWhiteSpace(charCode))
        {
            this.advance();

            return this.nextToken();
        }

        if (Character.isLineTerminator(charCode))
        {
            this.lineNumber++;

            this.advance();

            this.lineStart = this.index;

            return this.nextToken();
        }

        if (Character.isIdentifierStart(charCode))
        {
            return this.scanIdentifier();
        }

        if (charCode == OPEN_ROUND_BRACKET || charCode == CLOSE_ROUND_BRACKET || charCode == SEMI_COMA)
        {
            return this.scanPunctuator();
        }

        if (charCode == SINGLE_QUOTE || charCode == DOUBLE_QUOTE)
        {
            return this.scanStringLiteral();
        }

        if (charCode == DOT)
        {
            if (Character.isDecimalDigit(this.source.charCodeAt(this.index + 1)))
            {
                return this.scanNumericLiteral();
            }
            return this.scanPunctuator();
        }

        if (Character.isDecimalDigit(charCode))
        {
            return this.scanNumericLiteral();
        }

        if (charCode == BACK_TICK || charCode == CLOSE_CURLY_BRACKET && this.curlyStack[this.curlyStack.length - 1] == "${")
        {
            return this.scanTemplate();
        }

        if (charCode >= HIGH_SURROGATE_AREA_BEGIN && charCode < LOW_SURROGATE_AREA_END)
        {
            if (Character.isIdentifierStart(this.source.codePointAt(this.index) as number))
            {
                return this.scanIdentifier();
            }
        }

        return this.scanPunctuator();
    }

    public scanRegex(): Token
    {
        const start = this.index;

        let pattern     = "";
        let classMarker = false;
        let terminated  = false;

        if (!this.eof() && this.source[this.index] == "/")
        {
            pattern = this.source[this.index];

            while (!this.eof())
            {
                this.advance();

                const char = this.source[this.index];

                pattern += char;

                if (char && !Character.isLineTerminator(char.charCodeAt(0)))
                {
                    if (char == "\\")
                    {
                        this.advance();

                        const char = this.source[this.index];

                        if (Character.isLineTerminator(char.charCodeAt(0)))
                        {
                            this.throwUnexpectedToken(Messages.invalidRegularExpressionMissingToken);
                        }

                        pattern += char;
                    }
                    else if (classMarker && char == "]")
                    {
                        classMarker = false;
                    }
                    else if (char == "/")
                    {
                        terminated = true;

                        this.advance();

                        break;
                    }
                    else if (char == "[")
                    {
                        classMarker = true;
                    }
                }
            }
        }
        else
        {
            this.throwUnexpectedToken();
        }

        if (!terminated)
        {
            this.throwUnexpectedToken(Messages.invalidRegularExpressionMissingToken);
        }

        let flags = "";

        while (!this.eof())
        {
            const char = this.source[this.index];

            if (!Character.isIdentifierPart(char.charCodeAt(0)))
            {
                break;
            }

            flags += char;

            this.advance();
        }

        pattern = pattern.substring(1, pattern.length - 1);

        const token: Token =
        {
            end:        this.index,
            flags,
            lineNumber: this.lineNumber,
            lineStart:  this.lineStart,
            pattern,
            raw:        `/${pattern}/${flags}`,
            start,
            type:       TokenType.RegularExpression,
            value:      new RegExp(pattern, flags),
        };

        return token;
    }
}