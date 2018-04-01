import Expression         from "@surface/expression";
import ExpressionType     from "@surface/expression/expression-type";
import IExpression        from "@surface/expression/interfaces/expression";
import ConstantExpression from "@surface/expression/internal/expressions/constant-expression";
import SyntaxError        from "@surface/expression/internal/syntax-error";
import BindingMode        from "./binding-mode";
import IExpressionBind    from "./interfaces/expression-bind";

export default class BindParser
{
    private readonly expressions: Array<IExpressionBind> = [];

    private readonly context: Object;
    private readonly source:  string;

    private index: number = 0;

    private constructor(source: string, context: Object)
    {
        this.source  = source;
        this.context = context;
    }

    public static scan(context: Object, source: string): IExpressionBind
    {
        return new BindParser(source, context).scan();
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
            let bindingMode = BindingMode.oneWay;
            let scaped      = false;

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

                this.expressions.push({ bindingMode: BindingMode.oneWay, expression: new ConstantExpression(textFragment) });
            }

            if (!this.eof())
            {
                if (this.source[this.index] == "{")
                {
                    bindingMode = BindingMode.twoWay;
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

                const expression = Expression.from(this.source.substring(start, this.index - 2), this.context);

                if (expression.type != ExpressionType.Member)
                {
                    bindingMode = BindingMode.oneWay;
                }

                this.expressions.push({ bindingMode, expression });

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

    private scan(): IExpressionBind
    {
        this.parse(0);

        let expression: IExpression;

        if (this.expressions.length == 1)
        {
            return this.expressions[0];
        }
        else
        {
            expression = { type: -1, evaluate: () => this.expressions.map(x => `${x.expression.evaluate()}`).reduce((previous, current) => previous + current) };
            return { bindingMode: BindingMode.oneWay, expression };
        }
    }
}