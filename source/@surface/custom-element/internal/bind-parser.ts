import Expression            from "@surface/expression";
import IExpression           from "@surface/expression/interfaces/expression";
import ConstantExpression    from "@surface/expression/internal/expressions/constant-expression";
import SyntaxError           from "@surface/expression/internal/syntax-error";
import { Action }            from "@surface/types";
import BindExpressionVisitor from "./bind-expression-visitor";
import BindingMode           from "./binding-mode";

export default class BindParser
{
    private readonly context: Object;
    private readonly source:  string;

    private bindingMode: BindingMode = BindingMode.oneWay;
    private index:       number      = 0;

    private constructor(source: string, context: Object)
    {
        this.source  = source;
        this.context = context;
    }

    public static scan(context: Object, source: string, host: Object, property: string, notify?: Action): IExpression
    {
        return new BindParser(source, context).bind(host, property, notify);
    }

    private advance(): void
    {
        this.index++;
    }

    private bind(host: Object, property: string, notify?: Action): IExpression
    {
        const expressions = this.parse(0);

        if (expressions.length == 1)
        {
            const expression = expressions[0];

            const visitor = new BindExpressionVisitor(this.bindingMode, host, property, notify);

            visitor.visit(expression);

            return expression;
        }
        else
        {
            const visitor = new BindExpressionVisitor(BindingMode.oneWay, host, property, notify);
            expressions.forEach(x => visitor.visit(x));

            return { type: -1, evaluate: () => expressions.map(x => `${x.evaluate()}`).reduce((previous, current) => previous + current) };
        }
    }

    private parse(start: number): Array<IExpression>
    {
        try
        {
            let scaped = false;

            const expressions: Array<IExpression> = [];

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

                expressions.push(new ConstantExpression(textFragment));
            }

            if (!this.eof())
            {
                if (this.source[this.index] == "{")
                {
                    this.bindingMode = BindingMode.twoWay;
                }

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

                expressions.push(Expression.from(this.source.substring(start, this.index - 2), this.context));

                return [...expressions, ...this.parse(this.index)];
            }

            return expressions;
        }
        catch (error)
        {
            if (error instanceof SyntaxError)
            {
                throw new Error(`${error.message}: posistion ${error.index}`);
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
}