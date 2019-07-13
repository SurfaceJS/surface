import Expression  from "@surface/expression";
import IExpression from "@surface/expression/interfaces/expression";
import SyntaxError from "@surface/expression/syntax-error";

export default class BindParser
{
    private readonly expressions: Array<IExpression> = [];

    private readonly source:  string;

    private index: number = 0;

    private constructor(source: string)
    {
        this.source  = source;
    }

    public static scan(source: string): IExpression
    {
        return new BindParser(source).scan();
    }

    private advance(): void
    {
        this.index++;
    }

    // tslint:disable-next-line:cyclomatic-complexity
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

                const expression = Expression.from(this.source.substring(start, this.index - 2));

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