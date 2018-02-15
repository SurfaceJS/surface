import Character   from "./character";
import Messages    from "./messages";
import SyntaxError from "./syntax-error";
import Token       from "./token";

export type RawToken =
{
    type:     Token;
    value:    Object;
    pattern?: string;
    flags?:   string;
    regex?:   RegExp|null;
    octal?:   boolean;
    cooked?:  string;
    head?:    boolean;
    tail?:    boolean;
};

export default class Scanner
{
    private readonly curlyStack: Array<string>;
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
        this.lineNumber = 0;
        this.lineStart  = 0;
    }

    private advance(): void
    {
        this._index++;
    }

    private codePointAt(index: number): number
    {
        let codePoint = this.source.charCodeAt(index);

        if (codePoint >= 0xD800 && codePoint <= 0xDBFF)
        {
            const second = this.source.charCodeAt(index + 1);
            if (second >= 0xDC00 && second <= 0xDFFF)
            {
                const first = codePoint;
                codePoint = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
            }
        }

        return codePoint;
    }

    private eof(): boolean
    {
        return this.index == this.length;
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private isKeyword(id: string): boolean
    {
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
            }

    private isImplicitOctalLiteral(): boolean
    {
        // Implicit octal, unless there is a non-octal digit.
        // (Annex B.1.1 on Numeric Literals)
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

        this.advance();

        while (!this.eof())
        {
            const charCode = this.source.charCodeAt(this.index);
            if (charCode == 0x5C)
            {
                // Blackslash (U+005C) marks Unicode escape sequence.
                this.setCursorAt(start);
                return this.getComplexIdentifier();
            }
            else if (charCode >= 0xD800 && charCode < 0xDFFF)
            {
                // Need to handle surrogate pairs.
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

        return this.source.slice(start, this.index);
    }

    private getComplexIdentifier(): string
    {
        let codePoint = this.codePointAt(this.index);
        let id        = String.fromCodePoint(codePoint);

        this.setCursorAt(this.index + id.length);

        // '\u' (U+005C, U+0075) denotes an escaped character.
        if (codePoint == 0x5C)
        {
            if (this.source.charCodeAt(this.index) != 0x75)
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
            codePoint = this.codePointAt(this.index);

            if (!Character.isIdentifierPart(codePoint))
            {
                break;
            }

            let char = String.fromCodePoint(codePoint);
            id += char;

            this.setCursorAt(this.index + char.length);

            // '\u' (U+005C, U+0075) denotes an escaped character.
            if (codePoint == 0x5C)
            {
                id = id.substr(0, id.length - 1);

                if (this.source.charCodeAt(this.index) != 0x75)
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

    private octalValue(char: string): number
    {
        return "01234567".indexOf(char);
    }

    private octalToDecimal(ch: string): { code: number, octal: boolean }
    {
        // \0 is not octal escape sequence
        let octal = (ch !== "0");
        let code = this.octalValue(ch);

        if (!this.eof() && Character.isOctalDigit(this.source.charCodeAt(this.index)))
        {
            octal = true;
            code = code * 8 + this.octalValue(this.source[this.index]);
            this.advance();

            // 3 digits are only allowed when string starts
            // with 0, 1, 2, 3
            if ("0123".indexOf(ch) >= 0 && !this.eof() && Character.isOctalDigit(this.source.charCodeAt(this.index)))
            {

                code = code * 8 + this.octalValue(this.source[this.index]);
                this.advance();
            }
        }

        return { code, octal };
    }

    private scanBinaryLiteral(start: number): RawToken
    {
        let $number = "";
        let char    = "";

        while (!this.eof())
        {
            char = this.source[this.index];

            if (char != "0" && char != "1")
            {
                break;
            }

            $number += this.source[this.index];
            this.advance();
        }

        if ($number.length == 0)
        {
            // only 0b or 0B
            this.throwUnexpectedToken();
        }

        if (!this.eof())
        {
            const codePoint = this.source.charCodeAt(this.index);

            if (Character.isIdentifierStart(codePoint) || Character.isDecimalDigit(codePoint))
            {
                this.throwUnexpectedToken();
            }
        }

        const token =
        {
            type:  Token.NumericLiteral,
            value: Number.parseInt($number, 2)
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

    private scanHexLiteral(start: number): RawToken
    {
        let $number = "";

        while (!this.eof())
        {
            if (!Character.isHexDigit(this.source.charCodeAt(this.index)))
            {
                break;
            }

            $number += this.source[this.index];
            this.advance();
        }

        if ($number.length == 0)
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
            value:      Number.parseInt("0x" + $number, 16)
        };

        return token;
    }

    private scanIdentifier(): RawToken
    {
        let type: Token;
        const start = this.index;

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

        if (type != Token.Identifier && (start + id.length != this.index))
        {
            const restore = this.index;
            this.setCursorAt(start);
            this.throwUnexpectedToken(Messages.invalidEscapedReservedWord);
            this.setCursorAt(restore);
        }

        const token =
        {
            type:       type,
            value:      id
        };

        return token;
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private scanNumericLiteral(): RawToken
    {
        const start = this.index;
        let char = this.source[start];

        let $number = "";
        if (char != ".")
        {
            $number = this.source[this.index];

            this.advance();

            char = this.source[this.index];

            // Hex number starts with '0x'.
            // Octal number starts with '0'.
            // Octal number in ES6 starts with '0o'.
            // Binary number in ES6 starts with '0b'.
            if ($number == "0")
            {
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

            while (Character.isDecimalDigit(this.source.charCodeAt(this.index)))
            {
                this.advance();
                $number += this.source[this.index];
            }
            char = this.source[this.index];
        }

        if (char == ".")
        {
            this.advance();
            $number += this.source[this.index];

            while (Character.isDecimalDigit(this.source.charCodeAt(this.index)))
            {
                this.advance();
                $number += this.source[this.index];
            }

            char = this.source[this.index];
        }

        if (char == "e" || char == "E")
        {
            this.advance();
            $number += this.source[this.index];

            char = this.source[this.index];

            if (char == "+" || char == "-")
            {
                this.advance();
                $number += this.source[this.index];
            }

            if (Character.isDecimalDigit(this.source.charCodeAt(this.index)))
            {
                while (Character.isDecimalDigit(this.source.charCodeAt(this.index)))
                {
                    this.advance();
                    $number += this.source[this.index];
                }
            }
            else
            {
                this.throwUnexpectedToken();
            }
        }

        if (Character.isIdentifierStart(this.source.charCodeAt(this.index)))
        {
            this.throwUnexpectedToken();
        }

        const token =
        {
            type:  Token.NumericLiteral,
            value: Number.parseFloat($number)
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

            this.advance();

            $number = "0" + this.source[this.index];

            this.advance();
        }
        else
        {
            this.advance();
        }

        while (!this.eof())
        {
            if (!Character.isOctalDigit(this.source.charCodeAt(this.index)))
            {
                break;
            }

            $number += this.source[this.index];
            this.advance();
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
            type:  Token.NumericLiteral,
            value: Number.parseInt($number, 8)
        };

        return token;
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private scanStringLiteral(): RawToken
    {
        const start = this.index;
        let quote = this.source[start];

        this.advance();

        let octal   = false;
        let $string = "";

        while (!this.eof())
        {
            let char = this.source[this.index];
            this.advance();

            if (char == quote)
            {
                quote = "";
                break;
            }
            else if (char == "\\")
            {
                this.advance();
                char = this.source[this.index];
                if (!char || !Character.isLineTerminator(char.charCodeAt(0)))
                {
                    switch (char)
                    {
                        case "u":
                            if (this.source[this.index] == "{")
                            {
                                this.advance();
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
                            this.throwUnexpectedToken();
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
                    this.lineNumber++;

                    if (char == "\r" && this.source[this.index] == "\n")
                    {
                        this.advance();
                    }

                    this.lineStart = this.index;
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

        if (!Object.is(quote, ""))
        {
            this.setCursorAt(start);
            this.throwUnexpectedToken();
        }

        const token =
        {
            type:  Token.StringLiteral,
            value: $string,
            octal: octal
        };

        return token;
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private scanPunctuator(): RawToken
    {
        const start = this.index;

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
                this.advance();
                break;

            case ".":
                this.advance();
                if (this.source[this.index] == "." && this.source[this.index + 1] == ".")
                {
                    // Spread operator: ...
                    this.setCursorAt(this.index + 2);
                    $string = "...";
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
            case "?":
            case "~":
                this.advance();
                break;

            default:
                // 4-character punctuator.
                $string = this.source.substr(this.index, 4);

                if ($string == ">>>=")
                {
                    this.setCursorAt(this.index + 4);
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
                        this.setCursorAt(this.index + 3);
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
                                this.setCursorAt(this.index + 2);
                                break;
                            default:
                                // 1-character punctuators.
                                $string = this.source[this.index];
                                if ("<>=!+-*%&|^/".indexOf($string) >= 0)
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

        const token =
        {
            type:  Token.Punctuator,
            value: $string
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

        this.advance();

        while (!this.eof())
        {
            let char = this.source[this.index];
            this.advance();

            if (char == "`")
            {
                rawOffset  = 1;
                tail       = true;
                terminated = true;
                break;
            }
            else if (char == "$")
            {
                if (this.source[this.index] == "{")
                {
                    this.curlyStack.push("${");
                    this.advance();
                    terminated = true;
                    break;
                }
                cooked += char;
            }
            else if (char == "\\")
            {
                char = this.source[this.index];
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
                    this.lineNumber++;
                    if (char == "\r" && this.source[this.index] == "\n")
                    {
                        this.advance();
                    }
                    this.lineStart = this.index;
                }
            }
            else if (Character.isLineTerminator(char.charCodeAt(0)))
            {
                this.lineNumber++;

                if (char == "\r" && this.source[this.index] == "\n")
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

        if (!head)
        {
            this.curlyStack.pop();
        }

        const token =
        {
            type:   Token.Template,
            value:  this.source.slice(start + 1, this.index - rawOffset),
            cooked: cooked,
            head:   head,
            tail:   tail
        };

        return token;
    }

    private scanUnicodeCodePointEscape(): string
    {
        let char = this.source[this.index];
        let code = 0;

        // At least, one hex digit is required.
        if (char == "}")
        {
            this.throwUnexpectedToken();
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

        if (code > 0x10FFFF || char != "}")
        {
            this.throwUnexpectedToken();
        }

        return String.fromCodePoint(code);
    }

    private setCursorAt(position: number): void
    {
        this._index = position;
    }

    private throwUnexpectedToken(message?: string): void
    {
        throw new SyntaxError(message || Messages.unexpectedTokenIllegal, this.index, this.lineNumber, this.index - this.lineStart + 1);
    }

    public nextToken(): RawToken
    {
        if (this.eof())
        {
            return { type: Token.EOF, value: "" };
        }

        const charCode = this.source.charCodeAt(this.index);

        if (Character.isWhiteSpace(charCode))
        {
            this.advance();
            return this.nextToken();
        }

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

        // Template literals start with ` (U+0060) for template head
        // or } (U+007D) for template middle or template tail.
        if (charCode == 0x60 || (charCode == 0x7D && this.curlyStack[this.curlyStack.length - 1] == "${"))
        {
            return this.scanTemplate();
        }

        // Possible identifier start in a surrogate pair.
        if (charCode >= 0xD800 && charCode < 0xDFFF)
        {
            if (Character.isIdentifierStart(this.codePointAt(this.index)))
            {
                return this.scanIdentifier();
            }
        }

        return this.scanPunctuator();
    }

    public scanRegex(): RawToken
    {
        let char        = "";
        let pattern  = char;
        let classMarker = false;
        let terminated  = false;

        while (!this.eof())
        {
            char = this.source[this.index];

            this.advance();

            pattern += char;

            if (char == "\\")
            {
                this.advance();
                char += this.source[this.index];

                if (Character.isLineTerminator(char.charCodeAt(0)))
                {
                    this.throwUnexpectedToken(Messages.unterminatedRegExp);
                }

                pattern += char;
            }
            else if (Character.isLineTerminator(char.charCodeAt(0)))
            {
                this.throwUnexpectedToken(Messages.unterminatedRegExp);
            }
            else if (classMarker && char == "]")
            {
                classMarker = false;
            }
            else
            {
                if (char == "/")
                {
                    pattern = pattern.substring(0, pattern.length - 1);
                    terminated = true;
                    break;
                }
                else if (char == "[")
                {
                    classMarker = true;
                }
            }
        }

        if (!terminated)
        {
            this.throwUnexpectedToken(Messages.unterminatedRegExp);
        }

        let flags = "";

        while (!this.eof())
        {
            char = this.source[this.index];

            if (!Character.isIdentifierPart(char.charCodeAt(0)))
            {
                break;
            }

            flags += char;
            this.advance();
        }

        return { value: "", pattern, type: Token.RegularExpression, flags };
    }
}