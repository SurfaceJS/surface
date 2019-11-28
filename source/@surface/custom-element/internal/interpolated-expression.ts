import Expression       from "@surface/expression";
import IArrayExpression from "@surface/expression/interfaces/array-expression";
import IExpression      from "@surface/expression/interfaces/expression";
import SyntaxError      from "@surface/expression/syntax-error";
import parse            from "./parse";

const stringTokens = ["\"", "'", "`"];

export default class InterpolatedExpression
{
    private static readonly cache: Record<string, IArrayExpression> = { };

    private readonly source: string;

    private readonly expressions: Array<IExpression> = [];

    private index: number = 0;

    private constructor(source: string)
    {
        this.source  = source;
    }

    public static parse(source: string): IArrayExpression
    {
        if (source in InterpolatedExpression.cache)
        {
            return InterpolatedExpression.cache[source];
        }

        return InterpolatedExpression.cache[source] = new InterpolatedExpression(source).scan();
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

        this.expressions.push(Expression.literal(textFragment));
    }

    private current(): string
    {
        return this.source[this.index];
    }

    private eof(): boolean
    {
        return this.index == this.source.length;
    }

    private parse(start: number): void
    {
        try
        {
            let scaped = false;

            while (!this.eof() && this.current() != "{" || scaped)
            {
                scaped = this.current() == "\\" && !scaped;

                if (scaped && this.source.substring(this.index, this.index + 3) == "\\\\{")
                {
                    scaped = false;

                    this.advance();
                }

                this.advance();
            }

            if (start < this.index)
            {
                this.collectTextFragment(start, this.index + 1);
            }

            start = this.index + 1;

            if (!this.eof())
            {
                const balanced = this.scanBalance();

                const offset = balanced ? 1 : 0;

                const expression = parse(this.source.substring(start, this.index - offset));

                this.expressions.push(expression);

                if (!this.eof())
                {
                    this.parse(this.index);
                }
            }
        }
        catch (error)
        {
            /* istanbul ignore else */
            if (error instanceof SyntaxError)
            {
                throw new Error(`${error.message} at posistion ${error.index}`);
            }
            else
            {
                throw error;
            }
        }
    }

    private scan(): IArrayExpression
    {
        this.parse(0);

        return Expression.array(this.expressions);
    }

    private scanBalance(): boolean
    {
        let stack = 0;

        do
        {
            if (stringTokens.includes(this.current()))
            {
                if (!this.scanString())
                {
                    return false;
                }
            }

            if (this.current() == "{")
            {
                stack++;
            }

            if (this.current() == "}")
            {
                stack--;
            }

            this.advance();
        }
        while (!this.eof() && stack > 0);

        return stack == 0;
    }

    private scanString(): boolean
    {
        const token = this.current();

        this.advance();

        let scaped = false;

        while (!this.eof() && this.current() != token || scaped)
        {
            scaped = this.current() == "\\" && !scaped;

            if (!scaped && this.source.substring(this.index, this.index + 2) == "${")
            {
                this.advance();

                this.scanBalance();
            }

            this.advance();
        }

        return this.current() == token;
    }
}