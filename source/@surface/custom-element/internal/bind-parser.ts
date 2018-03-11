import Expression         from "@surface/expression";
import IExpression        from "@surface/expression/interfaces/expression";
import ConstantExpression from "@surface/expression/internal/expressions/constant-expression";
import { Action }         from "@surface/types";

export default class BindParser
{
    private readonly source:  string;
    //private readonly notify?: Action;
    private index:   number;
    private context: Object;

    private constructor(context: Object, source: string, notify?: Action)
    {
        this.context = context;
        this.source  = source;
        //this.notify  = notify;

        this.index = 0;
    }

    public static scan(context: Object, source: string, notify?: Action): IExpression
    {
        const expressions = new BindParser(context, source, notify).parse(0);

        if (expressions.length == 1)
        {
            return expressions[0];
        }
        else
        {
            return { type: -1, evaluate: () => expressions.map(x => `${x.evaluate()}`).reduce((previous, current) => previous + current) };
        }
    }

    private advance(): void
    {
        this.index++;
    }

    private parse(start: number): Array<IExpression>
    {
        let scaped = false;

        const expressions: Array<IExpression> = [];

        while (!this.eof() && (this.source.substring(this.index, this.index + 2) != "{{" || scaped))
        {
            scaped = this.source[this.index] == "\\" && !scaped;
            this.advance();
        }

        if (start < this.index)
        {
            const textFragment = this.source.substring(start, this.index)
                .replace(/\\\\/g, "\\")
                .replace(/\\\{/g, "{")
                .replace(/\\\}/g, "}");

            expressions.push(new ConstantExpression(textFragment));
        }

        if (!this.eof())
        {
            let start = this.index + 2;
            let stack = 0;
            do
            {
                if (this.source[this.index] == "{" && !scaped)
                {
                    stack++;
                }

                if (this.source[this.index] == "}" && !scaped)
                {
                    stack--;
                }

                this.advance();
            }
            while (!this.eof() && stack > 0);

            expressions.push(Expression.from(this.source.substring(start, this.index - 2), this.context));

            return [...expressions, ...this.parse(this.index)];
        }

        return expressions;
    }

    private eof(): boolean
    {
        return this.index == this.source.length;
    }
}