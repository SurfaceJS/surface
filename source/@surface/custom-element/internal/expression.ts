import CustomElement from "..";
import * as symbols  from "../symbols";

import { Action, Nullable } from "@surface/types";

export default abstract class Expression
{
    protected static readonly functionPattern       = /^((?:(?:[_a-zA-Z]\w?)|\.)*)\s*(\(.*\))$/;
    protected static readonly propertyAccessPattern = /^((?:(?:[_a-zA-Z]\w?)|\.)*)$/;

    public static from(rawExpression: string, context: Object, onchange?: Action): Expression
    {
        if (Expression.functionPattern.test(rawExpression))
        {
            return new CallExpression(rawExpression, context, onchange);
        }
        else if (Expression.propertyAccessPattern.test(rawExpression))
        {
            return new MemberAccessExpression(rawExpression, context, onchange);
        }
        else
        {
            return new ConstantExpression(rawExpression);
        }
    }

    protected contextualize(path: string, context: Object): { key: string, context: Object }
    {
        if (path.indexOf(".") > -1)
        {
            let current = context;

            const childrens = path.split(".");
            const key       = childrens.pop() || "invalid-key";

            for (const child of childrens)
            {
                if (!(current = current[child]))
                {
                    throw new Error(`Invalid access path: ${path}. The member '${child}' don't exists on '${context.constructor.name}'.`);
                }
            }

            return { key: key, context: current };
        }
        else
        {
            return { key: path, context };
        }
    }

    protected scapeBrackets(rawExpression: string): string
    {
        let expression = rawExpression;

        if (rawExpression.indexOf(",") > -1)
        {
            const brackets =
            [
                { pattern: /(\(.*)\(([^\(\)]*)\)(.*\))/g, comma: /(\([^\(\)]*),([^\(\)]*\))/g, open: 40,  close: 41 },
                { pattern: /(\[.*)\[([^\[\]]*)\](.*\])/g, comma: /(\[[^\[\]]*),([^\[\]]*\])/g, open: 91,  close: 93 },
                { pattern: /(\{.*)\{([^\{\}]*)\}(.*\})/g, comma: /(\{[^\{\}]*),([^\{\}]*\})/g, open: 123, close: 125 },
            ];

            const stringComma = /((["'])(?:(?!\2).)*),((?:(?!\2).)*\2)/g;

            expression = expression.replace(/"([^",]*)"/g, "%34$1%34").replace(/'([^',]*)'/g, "%39$1%39");

            for (const bracket of brackets)
            {
                while (bracket.pattern.test(expression))
                {
                    expression = expression.replace(bracket.pattern, `$1%${bracket.open}$2%${bracket.close}$3`);
                }

                while (bracket.comma.test(expression))
                {
                    expression = expression.replace(bracket.comma, "$1%44$2");
                }
            }

            while (stringComma.test(expression))
            {
                expression = expression.replace(stringComma, "$1%44$3");
            }
        }

        return expression;
    }

    protected unscapeBrackets(rawExpression: string): string
    {
        if (/%\d+/.test(rawExpression))
        {
            return rawExpression
                .replace(/%34/g,  "\"")
                .replace(/%39/g,  "'")
                .replace(/%40/g,  "(")
                .replace(/%41/g,  ")")
                .replace(/%44/g,  ",")
                .replace(/%91/g,  "[")
                .replace(/%93/g,  "]")
                .replace(/%123/g, "{")
                .replace(/%125/g, "}");
        }
        else
        {
            return rawExpression;
        }
    }

    public abstract execute(): Nullable<Object>;
}

export class CallExpression extends Expression
{
    private readonly context:     Object;
    private readonly expressions: Array<Expression>;

    private readonly _invoker: Function;
    public get invoker(): Function
    {
        return this._invoker;
    }

    public constructor(rawExpression: string, context: Object, onchange?: Action)
    {
        super();

        const breaked = this.break(rawExpression);

        const contextualized = this.contextualize(breaked.name, context);

        this.context     = contextualized.context;
        this.expressions = this.parseArgs(breaked.args, context, onchange);
        this._invoker    = contextualized.context[contextualized.key];
    }

    private break(rawExpression: string): { name: string; args: string }
    {
        const match = Expression.functionPattern.exec(rawExpression);

        if (match)
        {
            const groups = { name: 1, args: 2 };

            return { name: match[groups.name], args: match[groups.args] };
        }

        throw new Error("Invalid function expression.");
    }

    private parseArgs(args: string, context: Object, onchange?: Action): Array<Expression>
    {
        const expressions: Array<Expression> = [];

        for (const arg of super.scapeBrackets(args.replace(/^\(|\)$/g, "")).split(",").map(x => x.trim()))
        {
            expressions.push(Expression.from(super.unscapeBrackets(arg), context, onchange));
        }

        return expressions;
    }

    public execute(): Nullable<Object>
    {
        return this.invoker.apply(this.context, this.expressions.map(x => x.execute()));
    }
}

export class ConstantExpression extends Expression
{
    private value: Nullable<Object>;

    public constructor(value: string)
    {
        super();
        this.value = this.parseValue(value);
    }

    private parseValue(value: string): Nullable<Object>
    {
        if (/^(["'])((?!\1).)*\1$/.test(value))
        {
            return value.replace(/^["']|["']$/g, "");
        }
        else if (/^(?:\d+(?:\.\d+)?)$/.test(value))
        {
            return Number.parseFloat(value);
        }
        else if (/true|false/.test(value))
        {
            return value == "true";
        }
        else if (/^{.*}$/.test(value))
        {
            return JSON.parse(value.replace(/([{,]\s*)([a-zA-Z_]\w+)(\s*:)/g, "$1\"$2\"$3").replace(/'/g, "\""));
        }
        else if (value == "null")
        {
            return null;
        }
        else
        {
            return undefined;
        }
    }

    public execute(): Nullable<Object>
    {
        return this.value;
    }
}

export class MemberAccessExpression extends Expression
{
    private readonly context: Object;
    private readonly key: string;

    public constructor(rawExpression: string, context: Object, onchange?: Action)
    {
        super();

        const contextualized = super.contextualize(rawExpression, context);

        this.context = contextualized.context;
        this.key     = contextualized.key;

        if (onchange)
        {
            this.listen(this.key, this.context, onchange);
        }
    }

    private listen(key: string, context: Object, notify: Action): void
    {
        const observedAttributes = context.constructor[symbols.observedAttributes] as Array<string>;
        if (observedAttributes && context instanceof CustomElement && observedAttributes.some(x => x == key))
        {
            const onAttributeChanged = context[symbols.onAttributeChanged];
            context[symbols.onAttributeChanged] = function (this: CustomElement, attributeName: string, oldValue: string, newValue: string, namespace: string): void
            {
                if (attributeName == key)
                {
                    notify();
                }

                if (onAttributeChanged)
                {
                    onAttributeChanged.call(context, attributeName, oldValue, newValue, namespace);
                }
            };
        }
        else
        {
            let descriptor = Object.getOwnPropertyDescriptor(context.constructor.prototype, key);
            if (descriptor)
            {
                let getter = descriptor.get;
                let setter = descriptor.set;

                Object.defineProperty
                (
                    context,
                    key,
                    {
                        get: () => getter && getter.call(context),
                        set: (value: Object) =>
                        {
                            if (setter)
                            {
                                setter.call(context, value);
                            }

                            notify();
                        }
                    }
                );
            }
        }
    }

    public execute(): Nullable<Object>
    {
        return this.context[this.key];
    }
}