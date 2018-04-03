import Expression      from "@surface/expression";
import ExpressionType  from "@surface/expression/expression-type";
import SyntaxError     from "@surface/expression/syntax-error";
import BindingMode     from "./binding-mode";
import IExpressionBind from "./interfaces/expression-bind";

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

                this.expressions.push({ bindingMode: BindingMode.oneWay, expression: Expression.constant(textFragment) });
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

        if (this.expressions.length == 1)
        {
            return this.expressions[0];
        }
        else
        {
            return { bindingMode: BindingMode.oneWay, expression: Expression.array(this.expressions.map(x => x.expression)) };
        }
    }
}