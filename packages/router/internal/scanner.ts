import TokenType  from "./enums/token-type.js";
import type Token from "./types/token.js";

export default class Scanner
{
    private readonly source: string;
    private index: number = 0;

    private get current(): string
    {
        return this.source[this.index]!;
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

    private scanPunctuator(): Token
    {
        const index = this.index;
        const value = this.current;

        this.advance();

        return {
            index,
            type:  TokenType.Punctuator,
            value,
        };
    }

    private scanSpace(): Token
    {
        return {
            index: this.index,
            type:  TokenType.Space,
            value: this.current,
        };
    }

    private scanLiteral(): Token
    {
        const index = this.index;

        while (!this.eof && !this.isPunctuator(this.current) && !this.isSpace(this.current))
        {
            this.advance();
        }

        return {
            index,
            type:  TokenType.Literal,
            value: this.source.substring(index, this.index),
        };
    }

    public nextToken(): Token
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
