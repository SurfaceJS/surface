import { assert }                                        from "@surface/core";
import type { IExpression }                              from "@surface/expression";
import { SyntaxError, TemplateElement, TemplateLiteral } from "@surface/expression";
import { getOffsetSyntaxError, parseExpression }         from "./expression-parsers.js";

const stringTokens = ["\"", "'", "`"];

export default class InterpolatedExpression
{
    private readonly source: string;

    private readonly quasis:      TemplateElement[] = [];
    private readonly expressions: IExpression[]     = [];

    private expressionEnd:   number = 0;
    private expressionStart: number = 0;
    private index:           number = 0;

    private get current(): string
    {
        return this.source[this.index]!;
    }

    private get eof(): boolean
    {
        return this.index == this.source.length;
    }

    private constructor(source: string)
    {
        this.source  = source;
    }

    public static parse(source: string): TemplateLiteral
    {
        return new InterpolatedExpression(source).scan();
    }

    private advance(): void
    {
        this.index++;
    }

    private collectTextFragment(start: number, end: number): void
    {
        const textFragment = this.source.substring(start, end)
            .replace(/(?<!\\)\\{/g, "{")
            .replace(/\\\\{/g, "\\")
            .replace(/{$/, "");

        this.quasis.push(new TemplateElement(textFragment, textFragment, end >= this.source.length));
    }

    private parse(start: number): void
    {
        try
        {
            let scaped = false;

            while (!this.eof && this.current != "{" || scaped)
            {
                scaped = this.current == "\\" && !scaped;

                if (scaped && this.source.substring(this.index, this.index + 3) == "\\\\{")
                {
                    scaped = false;

                    this.advance();
                }

                this.advance();
            }

            if (start == 0 || start < this.index)
            {
                this.collectTextFragment(start, this.index + 1);
            }

            if (!this.eof)
            {
                this.expressionStart = this.index + 1;

                if (this.scanBalance())
                {
                    this.expressionEnd = this.index - 1;

                    const expression = parseExpression(this.source.substring(this.expressionStart, this.expressionEnd));

                    this.expressions.push(expression);

                    if (!this.eof)
                    {
                        this.parse(this.index);
                    }
                    else if (this.expressions.length > 0)
                    {
                        this.collectTextFragment(this.index, this.index);
                    }
                }
                else
                {
                    throw new SyntaxError("Unexpected end of expression", (this.source.match(/\n/g)?.length ?? 0) + 1, this.source.length - 1, this.source.length);
                }
            }
        }
        catch (error)
        {
            assert(error instanceof SyntaxError);

            throw getOffsetSyntaxError(this.source, this.source.substring(this.expressionStart, this.expressionEnd), error);
        }
    }

    private scan(): TemplateLiteral
    {
        this.parse(0);

        return new TemplateLiteral(this.quasis, this.expressions);
    }

    private scanBalance(): boolean
    {
        let stack = 0;

        do
        {
            if (stringTokens.includes(this.current))
            {
                if (!this.scanString())
                {
                    return false;
                }
            }

            if (this.current == "{")
            {
                stack++;
            }

            if (this.current == "}")
            {
                stack--;
            }

            this.advance();
        }
        while (!this.eof && stack > 0);

        return stack == 0;
    }

    private scanString(): boolean
    {
        const token = this.current;

        this.advance();

        if (token == this.current)
        {
            return true;
        }

        let scaped = false;

        if (token == "`")
        {
            do
            {
                scaped = this.current == "\\" && !scaped;

                if (!scaped && this.source.substring(this.index, this.index + 2) == "${")
                {
                    this.advance();

                    if (!this.scanBalance())
                    {
                        return false;
                    }
                }
                else
                {
                    this.advance();
                }

            }
            while (!this.eof && this.current != token || scaped);
        }
        else
        {
            do
            {
                scaped = this.current == "\\" && !scaped;

                this.advance();
            }
            while (!this.eof && this.current != token || scaped);
        }

        return this.current == token;
    }
}
