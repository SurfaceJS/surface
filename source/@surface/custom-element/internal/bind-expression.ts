import Expression  from "@surface/expression";
import IExpression from "@surface/expression/interfaces/expression";
import SyntaxError from "@surface/expression/syntax-error";
import parse       from "./parse";

export default class BindExpression
{
    private static readonly cache: Record<string, IExpression> = { };

    private readonly source: string;

    private readonly expressions: Array<IExpression> = [];

    private index: number = 0;

    private constructor(source: string)
    {
        this.source  = source;
    }

    public static parse(source: string): IExpression
    {
        if (source in BindExpression.cache)
        {
            return BindExpression.cache[source];
        }

        return BindExpression.cache[source] = new BindExpression(source).scan();
    }

    private advance(): void
    {
        this.index++;
    }

    private parse(start: number): void
    {
        try
        {
            let scaped = false;

            while (!this.eof() && (this.source.substring(this.index, this.index + 2) != "{{" && this.source.substring(this.index, this.index + 2) != "[[") || scaped)
            {
                scaped = this.source[this.index] == "\\" && !scaped;
                this.advance();
            }

            if (start < this.index)
            {
                const textFragment = this.source.substring(start, this.index)
                    .replace(/\\\\/g, "\\")
                    .replace(/\\\{/g, "{")
                    .replace(/\\\}/g, "}")
                    .replace(/\\\[/g, "[")
                    .replace(/\\\]/g, "]");

                this.expressions.push(Expression.literal(textFragment));
            }

            if (!this.eof())
            {
                let start = this.index + 2;
                let stack = 0;

                do
                {
                    if (!scaped && (this.source[this.index] == "{" || this.source[this.index] == "["))
                    {
                        stack++;
                    }

                    if (!scaped && (this.source[this.index] == "}" || this.source[this.index] == "]"))
                    {
                        stack--;
                    }

                    this.advance();
                }
                while (!this.eof() && stack > 0);

                const expression = parse(this.source.substring(start, this.index - 2));

                this.expressions.push(expression);

                if (!this.eof())
                {
                    this.parse(this.index);
                }
            }
        }
        catch (error)
        {
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

    private eof(): boolean
    {
        return this.index == this.source.length;
    }

    private scan(): IExpression
    {
        this.parse(0);

        if (this.expressions.length == 1)
        {
            return this.expressions[0];
        }
        else
        {
            return Expression.array(this.expressions);
        }
    }
}