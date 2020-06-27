import TokenType from "./enums/token-type";
import IToken    from "./interfaces/token";

export default class Scanner
{
    private readonly source: string;
    private index:   number = 0;

    private get current(): string
    {
        return this.source[this.index];
    }

    private get eof(): boolean
    {
        return this.index == this.source.length;
    }

    public constructor(source: string)
    {
        this.source = source;
    }

    private advance(): void
    {
        this.index++;
    }

    private isPunctuator(value: string): boolean
    {
        switch (value)
        {
            case "{":
            case "}":
            case "=":
            case ":":
            case "*":
            case "?":
            case "/":
                return true;
            default:
                return false;
        }
    }

    private isSpace(value: string): boolean
    {
        return value == " ";
    }

    private scanPunctuator(): IToken
    {
        const index = this.index;
        const value = this.current;

        this.advance();

        return {
            index,
            value,
            type:  TokenType.Punctuator,
        };
    }

    private scanSpace(): IToken
    {
        return {
            index: this.index,
            value: this.current,
            type:  TokenType.Space,
        };
    }

    private scanLiteral(): IToken
    {
        const index = this.index;

        while (!this.eof && !this.isPunctuator(this.current) && !this.isSpace(this.current))
        {
            this.advance();
        }

        return {
            index,
            value: this.source.substring(index, this.index),
            type:  TokenType.Literal,
        };
    }

    public nextToken(): IToken
    {
        if (!this.eof)
        {
            if (this.isSpace(this.current))
            {
                return this.scanSpace();
            }

            if (this.isPunctuator(this.current))
            {
                return this.scanPunctuator();
            }

            return this.scanLiteral();
        }

        return {
            index: this.index,
            type:  TokenType.Eof,
            value: "",
        };
    }
}