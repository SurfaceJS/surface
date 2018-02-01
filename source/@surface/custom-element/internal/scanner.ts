import Character    from "./character";
import ErrorHandler from "./error-handler";
import Messages     from "./messages";

export enum Token
{
    BooleanLiteral,
    EOF,
    Identifier,
    Keyword,
    NullLiteral,
    NumericLiteral,
    Punctuator,
    RegularExpression,
    StringLiteral,
    Template
}

export type RawToken =
{
    type:       Token;
    value:      string|number;
    lineNumber: number;
    lineStart:  number;
    start:      number;
    end:        number;
    pattern?:   string;
    flags?:     string;
    regex?:     RegExp|null;
    octal?:     boolean;
    cooked?:    string;
    head?:      boolean;
    tail?:      boolean;
}

export default class Scanner
{
    private readonly curlyStack:   Array<string>;
    private readonly length:       number;
    private readonly source:       string;
    private readonly errorHandler: ErrorHandler;

    private _index: number;
    public get index(): number
    {
        return this._index;
    }

    private _lineNumber: number;
    public get lineNumber(): number
    {
        return this._lineNumber;
    }

    private _lineStart: number;
    public get lineStart(): number
    {
        return this._lineStart;
    }

    public constructor(source: string)
    {
        this.source = source;
        this.length = source.length;

        this._index      = 0;
        this._lineNumber = 0;
        this._lineStart  = 0;
    }

    private codePointAt(index: number): number
    {
        let codePoint = this.source.charCodeAt(index);

        // tslint:disable:no-magic-numbers
        if (codePoint >= 0xD800 && codePoint <= 0xDBFF)
        {
            const second = this.source.charCodeAt(index + 1);
            if (second >= 0xDC00 && second <= 0xDFFF)
            {
                const first = codePoint;
                codePoint = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
            }
        }
        // tslint:enable:no-magic-numbers

        return codePoint;
    }

    private eof(): boolean
    {
        return this._index == this.length;
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private isKeyword(id: string): boolean
    {
        // tslint:disable:no-magic-numbers
        switch (id.length)
        {
            case 2:
                return (id == "if")
                    || (id == "in")
                    || (id == "do");
            case 3:
                return (id == "var")
                    || (id == "for")
                    || (id == "new")
                    || (id == "try")
                    || (id == "let");
            case 4:
                return (id == "this")
                    || (id == "else")
                    || (id == "case")
                    || (id == "void")
                    || (id == "with")
                    || (id == "enum");
            case 5:
                return (id == "while")
                    || (id == "break")
                    || (id == "catch")
                    || (id == "throw")
                    || (id == "const")
                    || (id == "yield")
                    || (id == "class")
                    || (id == "super");
            case 6:
                return (id == "return")
                    || (id == "typeof")
                    || (id == "delete")
                    || (id == "switch")
                    || (id == "export")
                    || (id == "import");
            case 7:
                return (id == "default")
                    || (id == "finally")
                    || (id == "extends");
            case 8:
                return (id == "function")
                    || (id == "continue")
                    || (id == "debugger");
            case 10:
                return (id == "instanceof");
            default:
                return false;
        }
        // tslint:enable:no-magic-numbers
    }

    private isImplicitOctalLiteral(): boolean
    {
        // Implicit octal, unless there is a non-octal digit.
        // (Annex B.1.1 on Numeric Literals)
        for (let i = this._index + 1; i < this.length; i++)
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
        const start = this._index;

        this._index++;

        while (!this.eof())
        {
            const charCode = this.source.charCodeAt(this._index);
            if (charCode == 0x5C)
            {
                // Blackslash (U+005C) marks Unicode escape sequence.
                this._index = start;
                return this.getComplexIdentifier();
            }
            else if (charCode >= 0xD800 && charCode < 0xDFFF)
            {
                // Need to handle surrogate pairs.
                this._index = start;
                return this.getComplexIdentifier();
            }

            if (Character.isIdentifierPart(charCode))
            {
                this._index++;
            }
            else
            {
                break;
            }
        }

        return this.source.slice(start, this._index);
    }

    private getComplexIdentifier(): string
    {
        let codePoint       = this.codePointAt(this._index);
        let id: string = String.fromCodePoint(codePoint);

        this._index += id.length;

        // tslint:disable:no-magic-numbers
        // '\u' (U+005C, U+0075) denotes an escaped character.
        if (codePoint == 0x5C)
        {
            if (this.source.charCodeAt(this._index) != 0x75)
            {
                this.throwUnexpectedToken();
            }

            this._index++;

            if (this.source[this._index] == "{")
            {
                this._index++;
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
            codePoint = this.codePointAt(this._index);

            if (!Character.isIdentifierPart(codePoint))
            {
                break;
            }

            let char = String.fromCodePoint(codePoint);
            id += char;

            this._index += char.length;

            // '\u' (U+005C, U+0075) denotes an escaped character.
            if (codePoint == 0x5C)
            {
                id = id.substr(0, id.length - 1);

                if (this.source.charCodeAt(this._index) != 0x75)
                {
                    this.throwUnexpectedToken();
                }

                this._index++;

                if (this.source[this._index] == "{")
                {
                    this._index++;
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
        // tslint:enable:no-magic-numbers

        return id;
    }

    private hexValue(char: string): number
    {
        return "0123456789abcdef".indexOf(char.toLowerCase());
    }

    private octalValue(char: string): number
    {
        return "01234567".indexOf(char);
    }

    private octalToDecimal(ch: string): { code: number, octal: boolean }
    {
        // tslint:disable:no-magic-numbers
        // \0 is not octal escape sequence
        let octal = (ch !== "0");
        let code = this.octalValue(ch);

        if (!this.eof() && Character.isOctalDigit(this.source.charCodeAt(this.index)))
        {
            octal = true;
            code = code * 8 + this.octalValue(this.source[this._index]);
            this._index++;

            // 3 digits are only allowed when string starts
            // with 0, 1, 2, 3
            if ("0123".indexOf(ch) >= 0 && !this.eof() && Character.isOctalDigit(this.source.charCodeAt(this.index)))
            {

                code = code * 8 + this.octalValue(this.source[this._index]);
                this._index++;
            }
        }

        return { code, octal };
        // tslint:enable:no-magic-numbers
    }

    private scanBinaryLiteral(start: number): RawToken
    {
        let num = "";
        let char;

        while (!this.eof())
        {
            char = this.source[this._index];

            if (char != "0" && char != "1")
            {
                break;
            }

            num += this.source[this._index];
            this._index++;
        }

        if (num.length == 0)
        {
            // only 0b or 0B
            this.throwUnexpectedToken();
        }

        if (!this.eof())
        {
            char = this.source.charCodeAt(this._index);

            if (Character.isIdentifierStart(char) || Character.isDecimalDigit(char))
            {
                this.throwUnexpectedToken();
            }
        }

        const token =
        {
            type:       Token.NumericLiteral,
            value:      Number.parseInt(num, 2),
            lineNumber: this.lineNumber,
            lineStart:  this.lineStart,
            start:      start,
            end:        this._index
        };

        return token;
    }

    private scanHexEscape(prefix: string): string|null
    {
        const length = (prefix == "u") ? 4 : 2;

        let code = 0;

        for (let i = 0; i < length; i++)
        {
            if (!this.eof() && Character.isHexDigit(this.source.charCodeAt(this.index)))
            {
                code = code * 16 + this.hexValue(this.source[this._index]);
                this._index++;
            }
            else
            {
                return null;
            }
        }

        return String.fromCharCode(code);
    }

    private scanHexLiteral(start: number): RawToken
    {
        let num = "";

        while (!this.eof())
        {
            if (!Character.isHexDigit(this.source.charCodeAt(this.index)))
            {
                break;
            }

            num += this.source[this._index];
            this._index++;
        }

        if (num.length == 0)
        {
            this.throwUnexpectedToken();
        }

        if (Character.isIdentifierStart(this.source.charCodeAt(this.index)))
        {
            this.throwUnexpectedToken();
        }

        const token =
        {
            type:       Token.NumericLiteral,
            value:      Number.parseInt("0x" + num, 16),
            lineNumber: this.lineNumber,
            lineStart:  this.lineStart,
            start:      start,
            end:        this.index
        };

        return token;
    }

    private scanIdentifier(): RawToken
    {
        let type: Token;
        const start = this._index;

        // Backslash (U+005C) starts an escaped character.
        const id = (this.source.charCodeAt(start) == 0x5C) ? this.getComplexIdentifier() : this.getIdentifier();

        // There is no keyword or literal with only one character.
        // Thus, it must be an identifier.
        if (id.length == 1)
        {
            type = Token.Identifier;
        }
        else if (this.isKeyword(id))
        {
            type = Token.Keyword;
        }
        else if (id == "null")
        {
            type = Token.NullLiteral;
        }
        else if (id == "true" || id == "false")
        {
            type = Token.BooleanLiteral;
        }
        else
        {
            type = Token.Identifier;
        }

        if (type != Token.Identifier && (start + id.length != this._index))
        {
            const restore = this._index;
            this._index = start;
            this.tolerateUnexpectedToken(Messages.invalidEscapedReservedWord);
            this._index = restore;
        }

        const token =
        {
            type:       type,
            value:      id,
            lineNumber: this.lineNumber,
            lineStart:  this.lineStart,
            start:      start,
            end:        this._index
        };

        return token;
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private scanNumericLiteral(): RawToken
    {
        const start = this._index;
        let char = this.source[start];

        let $number = "";
        if (char != ".")
        {
            $number = this.source[this._index];

            this._index++;

            char = this.source[this._index];

            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if ($number == "0")
            {
                if (char == "x" || char == "X")
                {
                    this._index++;
                    return this.scanHexLiteral(start);
                }
                if (char == "b" || char == "B")
                {
                    this._index++;
                    return this.scanBinaryLiteral(start);
                }
                if (char == "o" || char == "O")
                {
                    return this.scanOctalLiteral(char, start);
                }

                if (char && Character.isOctalDigit(char.charCodeAt(0)))
                {
                    if (this.isImplicitOctalLiteral())
                    {
                        return this.scanOctalLiteral(char, start);
                    }
                }
            }

            while (Character.isDecimalDigit(this.source.charCodeAt(this._index)))
            {
                this._index++;
                $number += this.source[this._index];
            }
            char = this.source[this._index];
        }

        if (char == ".")
        {
            this._index++;
            $number += this.source[this._index];

            while (Character.isDecimalDigit(this.source.charCodeAt(this._index)))
            {
                this._index++;
                $number += this.source[this._index];
            }

            char = this.source[this._index];
        }

        if (char == "e" || char == "E")
        {
            this._index++;
            $number += this.source[this._index];

            char = this.source[this._index];

            if (char == "+" || char == "-")
            {
                this._index++;
                $number += this.source[this._index];
            }

            if (Character.isDecimalDigit(this.source.charCodeAt(this._index)))
            {
                while (Character.isDecimalDigit(this.source.charCodeAt(this._index)))
                {
                    this._index++;
                    $number += this.source[this._index];
                }
            }
            else
            {
                this.throwUnexpectedToken();
            }
        }

        if (Character.isIdentifierStart(this.source.charCodeAt(this._index)))
        {
            this.throwUnexpectedToken();
        }

        const token =
        {
            type:       Token.NumericLiteral,
            value:      Number.parseFloat($number),
            lineNumber: this.lineNumber,
            lineStart:  this.lineStart,
            start:      start,
            end:        this._index
        };

        return token;
    }

    private scanOctalLiteral(prefix: string, start: number): RawToken
    {
        let $number = "";
        let octal   = false;

        if (Character.isOctalDigit(prefix.charCodeAt(0)))
        {
            octal = true;
            $number = "0" + this.source[this._index++];
            this._index++
        }
        else
        {
            this._index++;
        }

        while (!this.eof())
        {
            if (!Character.isOctalDigit(this.source.charCodeAt(this.index)))
            {
                break;
            }

            $number += this.source[this._index];
            this._index++
        }

        if (!octal && $number.length == 0)
        {
            // only 0o or 0O
            this.throwUnexpectedToken();
        }

        if (Character.isIdentifierStart(this.source.charCodeAt(this.index)) || Character.isDecimalDigit(this.source.charCodeAt(this.index)))
        {
            this.throwUnexpectedToken();
        }

        const token =
        {
            type:       Token.NumericLiteral,
            value:      Number.parseInt($number, 8),
            octal:      octal,
            lineNumber: this.lineNumber,
            lineStart:  this.lineStart,
            start:      start,
            end:        this.index
        };

        return token;
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private scanStringLiteral(): RawToken
    {
        const start = this.index;
        let quote = this.source[start];

        this._index++;

        let octal   = false;
        let $string = "";

        while (!this.eof())
        {
            let char = this.source[this._index];
            this._index++;

            if (char == quote)
            {
                quote = "";
                break;
            }
            else if (char == "\\")
            {
                char = this.source[this._index++];
                if (!char || !Character.isLineTerminator(char.charCodeAt(0)))
                {
                    switch (char)
                    {
                        case "u":
                            if (this.source[this._index] == "{")
                            {
                                this._index++;
                                $string += this.scanUnicodeCodePointEscape();
                            }
                            else
                            {
                                const unescapedChar = this.scanHexEscape(char);

                                if (Object.is(unescapedChar, null))
                                {
                                    this.throwUnexpectedToken();
                                }

                                $string += unescapedChar;
                            }
                            break;
                        case "x":
                            const unescaped = this.scanHexEscape(char);

                            if (Object.is(unescaped, null))
                            {
                                this.throwUnexpectedToken(Messages.invalidHexEscapeSequence);
                            }

                            $string += unescaped;
                            break;
                        case "n":
                            $string += "\n";
                            break;
                        case "r":
                            $string += "\r";
                            break;
                        case "t":
                            $string += "\t";
                            break;
                        case "b":
                            $string += "\b";
                            break;
                        case "f":
                            $string += "\f";
                            break;
                        case "v":
                            $string += "\x0B";
                            break;
                        case "8":
                        case "9":
                            $string += char;
                            this.tolerateUnexpectedToken();
                            break;

                        default:
                            if (char && Character.isOctalDigit(char.charCodeAt(0)))
                            {
                                const octToDec = this.octalToDecimal(char);

                                octal = octToDec.octal || octal;
                                $string += String.fromCharCode(octToDec.code);
                            }
                            else
                            {
                                $string += char;
                            }
                            break;
                    }
                }
                else
                {
                    this._lineNumber++;

                    if (char == "\r" && this.source[this.index] == "\n")
                    {
                        this._index++;
                    }

                    this._lineStart = this.index;
                }
            }
            else if (Character.isLineTerminator(char.charCodeAt(0)))
            {
                break;
            }
            else
            {
                $string += char;
            }
        }

        if (quote != "")
        {
            this._index = start;
            this.throwUnexpectedToken();
        }

        const token =
        {
            type:       Token.StringLiteral,
            value:      $string,
            octal:      octal,
            lineNumber: this.lineNumber,
            lineStart:  this.lineStart,
            start:      start,
            end:        this.index
        };

        return token;
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private scanPunctuator(): RawToken
    {
        const start = this.index;

        // tslint:disable:no-magic-numbers
        // Check for most common single-character punctuators.
        let $string = this.source[this.index];
        switch ($string)
        {
            case "(":
            case "{":
                if ($string == "{")
                {
                    this.curlyStack.push("{");
                }
                this._index++;
                break;

            case ".":
                this._index++;
                if (this.source[this.index] == "." && this.source[this.index + 1] == ".")
                {
                    // Spread operator: ...
                    this._index += 2;
                    $string = "...";
                }
                break;

            case "}":
                this._index++;
                this.curlyStack.pop();
                break;
            case ")":
            case ";":
            case ",":
            case "[":
            case "]":
            case ":":
            case "?":
            case "~":
                this._index++;
                break;

            default:
                // 4-character punctuator.
                $string = this.source.substr(this.index, 4);

                if ($string == ">>>=")
                {
                    this._index += 4;
                }
                else
                {
                    // 3-character punctuators.
                    $string = $string.substr(0, 3);
                    switch ($string)
                    {
                        case "==":
                        case "!=":
                        case ">>>":
                        case "<<=":
                        case ">>=":
                        case "**=":
                            this._index += 3;
                            break;
                        default:
                            // 2-character punctuators.
                            $string = $string.substr(0, 2);
                            switch ($string)
                            {
                                case "&&":
                                case "||":
                                case "==":
                                case "!=":
                                case "+=":
                                case "-=":
                                case "*=":
                                case "/=":
                                case "++":
                                case "--":
                                case "<<":
                                case ">>":
                                case "&=":
                                case "|=":
                                case "^=":
                                case "%=":
                                case "<=":
                                case ">=":
                                case "=>":
                                case "**":
                                    this._index += 2;
                                    break;
                            default:
                                // 1-character punctuators.
                                $string = this.source[this.index];
                                if ("<>=!+-*%&|^/".indexOf($string) >= 0)
                                {
                                    this._index++;
                                }
                                break;
                            }
                    }
                }
        }
        // tslint:enable:no-magic-numbers

        if (this.index == start)
        {
            this.throwUnexpectedToken();
        }

        const token =
        {
            type:       Token.Punctuator,
            value:      $string,
            lineNumber: this.lineNumber,
            lineStart:  this.lineStart,
            start:      start,
            end:        this.index
        };

        return token;
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private scanTemplate(): RawToken
    {
        const start = this.index;
        const head  = (this.source[start] == "`");

        let cooked     = "";
        let terminated = false;

        let tail      = false;
        let rawOffset = 2;

        this._index++;

        while (!this.eof())
        {
            let char = this.source[this._index];
            this._index++

            if (char == "`")
            {
                rawOffset  = 1;
                tail       = true;
                terminated = true;
                break;
            }
            else if (char == "$")
            {
                if (this.source[this._index] == "{")
                {
                    this.curlyStack.push("${");
                    this._index++;
                    terminated = true;
                    break;
                }
                cooked += char;
            }
            else if (char == "\\")
            {
                char = this.source[this._index];
                this._index++

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
                                this._index++;
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
                                    this._index = restore;
                                    cooked += char;
                                }
                            }
                            break;
                        case "x":
                            const unescaped = this.scanHexEscape(char);
                            if (unescaped === null)
                            {
                                this.throwUnexpectedToken(Messages.invalidHexEscapeSequence);
                            }
                            cooked += unescaped;
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
                                    // Illegal: \01 \02 and so on
                                    this.throwUnexpectedToken(Messages.templateOctalLiteral);
                                }
                                cooked += "\0";
                            }
                            else if (Character.isOctalDigit(char.charCodeAt(0)))
                            {
                                // Illegal: \1 \2
                                this.throwUnexpectedToken(Messages.templateOctalLiteral);
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
                    this._lineNumber++;
                    if (char == "\r" && this.source[this.index] == "\n") {
                        this._index++;
                    }
                    this._lineStart = this.index;
                }
            }
            else if (Character.isLineTerminator(char.charCodeAt(0)))
            {
                this._lineNumber++;

                if (char == "\r" && this.source[this.index] == "\n")
                {
                    this._index++;
                }

                this._lineStart = this.index;
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

        if (!head)
        {
            this.curlyStack.pop();
        }

        const token =
        {
            type:       Token.Template,
            value:      this.source.slice(start + 1, this.index - rawOffset),
            cooked:     cooked,
            head:       head,
            tail:       tail,
            lineNumber: this.lineNumber,
            lineStart:  this.lineStart,
            start:      start,
            end:        this.index
        };

        return token;
    }

    private scanUnicodeCodePointEscape(): string
    {
        let ch = this.source[this._index];
        let code = 0;

        // At least, one hex digit is required.
        if (ch == "}")
        {
            this.throwUnexpectedToken();
        }

        while (!this.eof())
        {
            ch = this.source[this._index];

            this._index++;

            if (!Character.isHexDigit(ch.charCodeAt(0)))
            {
                break;
            }
            code = code * 16 + this.hexValue(ch);
        }

        // tslint:disable-next-line:no-magic-numbers
        if (code > 0x10FFFF || ch != "}")
        {
            this.throwUnexpectedToken();
        }

        return String.fromCodePoint(code);
    }

    private throwUnexpectedToken(message?: string): void
    {
        this.errorHandler.throwError(this._index, this._lineNumber, this._index - this._lineStart + 1, message || Messages.unexpectedTokenIllegal);
    }

    private tolerateUnexpectedToken(message?: string): void
    {
        this.errorHandler.tolerateError(this._index, this._lineNumber, this._index - this._lineStart + 1, message || Messages.unexpectedTokenIllegal);
    }

    public lexical(): RawToken
    {
        // tslint:disable:no-magic-numbers
        if (this.eof())
        {
            return { type: Token.EOF, value: "", lineNumber: 0, lineStart: 0, start: 0, end: 0 };
        }

        const charCode = this.source.charCodeAt(this._index);

        if (Character.isIdentifierStart(charCode))
        {
            return this.scanIdentifier();
        }

        // Very common: ( and ) and ;
        if (charCode == 0x28 || charCode == 0x29 || charCode == 0x3B)
        {
            return this.scanPunctuator();
        }

        // String literal starts with single quote (U+0027) or double quote (U+0022).
        if (charCode == 0x27 || charCode == 0x22)
        {
            return this.scanStringLiteral();
        }

        // Dot (.) U+002E can also start a floating-point number, hence the need
        // to check the next character.
        if (charCode == 0x2E)
        {
            if (Character.isDecimalDigit(this.source.charCodeAt(this._index + 1)))
            {
                return this.scanNumericLiteral();
            }
            return this.scanPunctuator();
        }

        if (Character.isDecimalDigit(charCode))
        {
            return this.scanNumericLiteral();
        }

        // Template literals start with ` (U+0060) for template head
        // or } (U+007D) for template middle or template tail.
        if (charCode == 0x60 || (charCode == 0x7D && this.curlyStack[this.curlyStack.length - 1] == "${"))
        {
            return this.scanTemplate();
        }

        // Possible identifier start in a surrogate pair.
        if (charCode >= 0xD800 && charCode < 0xDFFF)
        {
            if (Character.isIdentifierStart(this.codePointAt(this._index)))
            {
                return this.scanIdentifier();
            }
        }

        return this.scanPunctuator();
        /// tslint:enable:no-magic-numbers
    }
}