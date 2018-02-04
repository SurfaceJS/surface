
import { Nullable } from "@surface/types";

export type Context =
{
    global: Object;
    model:  Object;
    self:   Object;
};

export default interface IExpression
{
    execute(): Nullable<Object>;
}

export class ArrayExpression implements IExpression
{
    public constructor(private readonly elements: Array<IExpression>)
    { }

    public execute(): Array<Nullable<Object>>
    {
        return this.elements.map(x => x.execute());
    }
}

export class BinaryExpression implements IExpression
{
    public constructor(private readonly operator: string, private readonly left: IExpression, private readonly right: IExpression)
    { }

    // tslint:disable-next-line:cyclomatic-complexity
    public execute(): Nullable<Object>
    {
        const left  = this.left.execute();
        const right = this.right.execute();

        switch (this.operator)
        {
            case "&&":
                return left && right;
            case "||":
                return left || right;
            case "==":
                return left == right;
            case "===":
                return left === right;
            case "!=":
                return left != right;
            case "!==":
                return left !== right;
            case "instanceof":
                if (right instanceof Function)
                {
                    return left instanceof right;
                }
                else
                {
                    throw new TypeError("Right-hand side of 'instanceof' is not callable");
                }
            default:
                if (left && right)
                {
                    switch (this.operator)
                    {
                        case "<=":
                            return left <= right;
                        case ">=":
                            return left >= right;
                        case ">":
                            return left > right;
                        case "<":
                            return left < right;
                        default:
                            if (typeof left == "number" && typeof right == "number")
                            {
                                switch (this.operator)
                                {
                                    case "&":
                                        return left & right;
                                    case "|":
                                        return left | right;
                                    case "^":
                                        return left ^ right;
                                    case "<<":
                                        return left << right;
                                    case ">>":
                                        return left >> right;
                                    case ">>>":
                                        return left >>> right;
                                    default:
                                        return;
                                }
                            }

                            return 0;
                    }
                }

                return;
        }
    }
}

export class CallExpression implements IExpression
{
    public constructor(private readonly context: IExpression, private readonly invoker: IExpression, private readonly args: Array<IExpression>)
    { }

    public execute(): Nullable<Object>
    {
        return (this.invoker.execute() as Function).apply(this.context.execute(), this.args.map(x => x.execute()));
    }
}

export class ConstantExpression implements IExpression
{
    public constructor(private readonly value: Nullable<Object>)
    { }

    public execute(): Nullable<Object>
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

    public execute(): Object
    {
        return this.context[this.name];
    }
}

export class MemberExpression implements IExpression
{
    public constructor(private readonly target: IExpression, private readonly property: string)
    { }

    public execute(): Nullable<Object>
    {
        const target = this.target.execute();
        if (target)
        {
            return target[this.property];
        }

        throw new TypeError(`Cannot read property '${this.property}' of undefined`);
    }
}

export class ObjectExpression implements IExpression
{
    //private readonly $object: Object;

    public constructor(private readonly properties: Array<IExpression>)
    {
        console.log(this.properties);
        //this.$object = { };
    }

    public execute(): Object
    {
        throw new Error("Method not implemented.");
    }
}

export class PropertyExpression implements IExpression
{
    public constructor(private readonly key: IExpression, private readonly value: IExpression)
    {
        console.log(this.key.execute());
    }

    public execute(): Nullable<Object>
    {
        return this.value.execute();
    }
}