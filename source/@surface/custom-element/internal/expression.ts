import CustomElement from "..";
import * as symbols  from "../symbols";
import { Action, Nullable, Func1, Func2 } from "@surface/types";

export type Context =
{
    global: Object;
    host:   Object;
    this:   Object;
};

// tslint:disable:no-any
export default interface IExpression
{
    evaluate(): any;
}

export class ArrayExpression implements IExpression
{
    public constructor(private readonly elements: Array<IExpression>)
    { }

    public evaluate(): Array<any>
    {
        return this.elements.map(x => x.evaluate());
    }
}

const binaryFunctions: { [key: string]: Func2<any, any, any> } =
{
    "+":          (left, right) => left + right,
    "-":          (left, right) => left - right,
    "*":          (left, right) => left * right,
    "/":          (left, right) => left / right,
    "&&":         (left, right) => left && right,
    "||":         (left, right) => left || right,
    "==":         (left, right) => left == right,
    "===":        (left, right) => left === right,
    "!=":         (left, right) => left != right,
    "!==":        (left, right) => left !== right,
    "instanceof": (left, right) => left instanceof right,
    "<=":         (left, right) => left <= right,
    ">=":         (left, right) => left >= right,
    "<":          (left, right) => left <  right,
    ">":          (left, right) => left >  right,
    "&":          (left, right) => left & right,
    "|":          (left, right) => left | right,
    "^":          (left, right) => left ^ right,
    "<<":         (left, right) => left << right,
    ">>":         (left, right) => left >> right,
    ">>>":        (left, right) => left >>> right,
};

const unaryFunctions: { [key: string]: Func1<any, any> } =
{
    "+":      value => +value,
    "-":      value => -value,
    "~":      value => ~value,
    "!":      value => !value,
    "typeof": value => typeof value,
};

const updateFunctions: { [key: string]: Func1<any, any> } =
{
    "++*": value => ++value,
    "--*": value => --value,
    "*++": value => value++,
    "*--": value => value--,
};

export class BinaryExpression implements IExpression
{
    private operation: Func2<any, any, any>;
    public constructor(private readonly left: IExpression, private readonly right: IExpression, operator: string)
    {
        this.operation = binaryFunctions[operator];
    }

    public evaluate(): any
    {
        return this.operation(this.left.evaluate(), this.right.evaluate());
    }
}

export class CallExpression implements IExpression
{
    public constructor(private readonly context: IExpression, private readonly name: string, private readonly args: Array<IExpression>)
    { }

    public evaluate(): any
    {
        const context = this.context.evaluate() as object;
        return context[this.name].apply(context, this.args.map(x => x.evaluate()));
    }
}

export class ConditionalExpression implements IExpression
{
    public constructor(private readonly conditionExpression: IExpression, private readonly truthyExpression: IExpression, private readonly falsy: IExpression)
    {}

    public evaluate(): any
    {
        return this.conditionExpression.evaluate() ? this.truthyExpression.evaluate() : this.falsy.evaluate();
    }
}

export class ConstantExpression implements IExpression
{
    public constructor(private readonly value: Nullable<Object>)
    { }

    public evaluate(): any
    {
        return this.value;
    }
}

export class IdentifierExpression implements IExpression
{
    public constructor(private readonly context: Object, private readonly name: string)
    {
        if (!(this.name in this.context))
        {
            throw new Error(`The identifier ${name} does not exist in this context.`);
        }
    }

    public evaluate(): Object
    {
        return this.context[this.name];
    }
}

export class MemberExpression implements IExpression
{
    private readonly _property: IExpression;
    public get property(): string
    {
        return `${this._property.evaluate()}`;
    }

    private readonly _target: IExpression;
    public get target(): Nullable<Object>
    {
        return this._target.evaluate();
    }

    public constructor(target: IExpression, property: IExpression, notify?: Action)
    {
        this._property = property;
        this._target   = target;

        if (notify)
        {
            this.listen(notify);
        }
    }

    private listen(notify: Action): void
    {
        const context  = this.target;
        const property = this.property;

        if (!context)
        {
            throw new TypeError("Can't bind to non initialized object.");
        }

        const observedAttributes = context.constructor[symbols.observedAttributes] as Array<string>;
        if (observedAttributes && context instanceof CustomElement && observedAttributes.some(x => x == property))
        {
            const onAttributeChanged = context[symbols.onAttributeChanged];
            context[symbols.onAttributeChanged] = function (this: CustomElement, attributeName: string, oldValue: string, newValue: string, namespace: string): void
            {
                if (attributeName == property)
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
            let descriptor = Object.getOwnPropertyDescriptor(context.constructor.prototype, property);
            if (descriptor && descriptor.get)
            {
                let getter = descriptor.get;
                let setter = descriptor.set;

                Object.defineProperty
                (
                    context,
                    property,
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

    public evaluate(): any
    {
        const target = this.target as Object;
        return target[this.property];
    }
}

export class ObjectExpression implements IExpression
{
    public constructor(private readonly properties: Array<PropertyExpression>)
    { }

    public evaluate(): Object
    {
        const $object = { };

        for (const property of this.properties)
        {
            $object[property.key as string|number] = property.evaluate();
        }

        return $object;
    }
}

export class PropertyExpression implements IExpression
{
    private readonly _key: IExpression;
    public get key(): string
    {
        return `${this._key.evaluate()}`;
    }

    private readonly _value: IExpression;
    public get value(): Nullable<string|number>
    {
        return this._value.evaluate();
    }

    public constructor(key: IExpression, value: IExpression)
    {
        this._key   = key;
        this._value = value;
    }

    public evaluate(): any
    {
        return this.value;
    }
}

export class RegexExpression implements IExpression
{
    public constructor(private readonly pattern: string, private readonly flags: string)
    { }

    public evaluate(): any
    {
        return new RegExp(this.pattern, this.flags);
    }
}

export class TemplateLiteralExpression implements IExpression
{
    public constructor(private readonly quasis: Array<string>, private readonly expressions: Array<IExpression>)
    { }

    public evaluate(): any
    {
        let result = "";

        for (let i = 0; i < this.expressions.length; i++)
        {
            result = this.quasis[i] + this.expressions[i].evaluate();
        }

        return result + this.quasis[this.quasis.length - 1];
    }
}

export class UnaryExpression implements IExpression
{
    private readonly operation: Func1<any, any>;
    public constructor(private readonly value: IExpression, operator: string)
    {
        this.operation = unaryFunctions[operator];
    }

    public evaluate(): any
    {
        return this.operation(this.value.evaluate());
    }
}

export class UpdateExpression implements IExpression
{
    private readonly operation: Func1<any, any>;

    public constructor(private readonly value: IExpression, operator: string, prefix: boolean)
    {
        this.operation = prefix ? updateFunctions[`*${operator}`] : updateFunctions[`${operator}*`];
    }

    public evaluate(): any
    {
        return this.operation(this.value.evaluate());
    }
}
// tslint:enable:no-any