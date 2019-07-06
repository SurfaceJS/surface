import { Indexer }    from "@surface/core";
import { coalesce }   from "@surface/core/common/generic";
import IArrayPattern  from "../../interfaces/array-pattern";
import IExpression    from "../../interfaces/expression";
import IObjectPattern from "../../interfaces/object-pattern";
import IPattern       from "../../interfaces/pattern";
import IRestElement   from "../../interfaces/rest-element";
import NodeType       from "../../node-type";
import Messages       from "../messages";
import TypeGuard      from "../type-guard";
import BaseExpression from "./abstracts/base-expression";

export default class ArrowFunctionExpression extends BaseExpression
{
    private _body: IExpression;
    public get body(): IExpression
    {
        return this._body;
    }

    public set body(value: IExpression)
    {
        this._body = value;
    }

    private _parameters: Array<IPattern>;
    public get parameters(): Array<IPattern>
    {
        return this._parameters;
    }

    public set parameters(value: Array<IPattern>)
    {
        this._parameters = value;
    }

    private _scope: Indexer;
    public get scope(): Indexer
    {
        return this._scope;
    }

    public get type(): NodeType
    {
        return NodeType.ArrowFunctionExpression;
    }

    public constructor(scope: Indexer, parameters: Array<IPattern>, body: IExpression)
    {
        super();

        this._scope      = scope;
        this._parameters = parameters;
        this._body       = body;
    }

    private resolveParameters(args: Array<unknown>): Indexer
    {
        const scope: Indexer = { };

        let index = 0;
        for (const parameter of this.parameters)
        {
            if (TypeGuard.isIdentifier(parameter))
            {
                scope[parameter.name] = args[index];
            }
            else if (TypeGuard.isAssignmentExpression(parameter))
            {
                if (TypeGuard.isIdentifier(parameter.left))
                {
                    scope[parameter.left.name] = coalesce(args[index], parameter.right.evaluate());
                }
                else
                {
                    throw new Error(Messages.illegalPropertyInDeclarationContext);
                }
            }
            else if (TypeGuard.isRestElement(parameter))
            {
                Object.assign(scope, this.resolveRestElement(parameter, args.slice(index)));
            }
            else if (TypeGuard.isArrayPattern(parameter))
            {
                Object.assign(scope, this.resolveArrayPattern(parameter, args[index] as Array<unknown>));
            }
            else if (TypeGuard.isObjectPattern(parameter))
            {
                Object.assign(scope, this.resolveObjectPattern(parameter, args[index] as Indexer));
            }

            index++;
        }

        return scope;
    }

    private resolveArrayPattern(arrayPattern: IArrayPattern, value: Array<unknown>): Indexer
    {
        const result: Indexer = { };

        let index = 0;

        for (const element of arrayPattern.elements)
        {
            if (element)
            {
                if (TypeGuard.isIdentifier(element))
                {
                    result[element.name] = value[index];
                }
                else if (TypeGuard.isAssignmentExpression(element))
                {
                    if (TypeGuard.isIdentifier(element.left))
                    {
                        result[element.left.name] = coalesce(value[index], element.right.evaluate());
                    }
                    else
                    {
                        throw new Error(Messages.illegalPropertyInDeclarationContext);
                    }
                }
                else if (TypeGuard.isArrayPattern(element))
                {
                    Object.assign(result, this.resolveArrayPattern(element, value));
                }
                else if (TypeGuard.isObjectPattern(element))
                {
                    Object.assign(result, this.resolveObjectPattern(element, value[index] as Indexer));
                }
                else if (TypeGuard.isRestElement(element))
                {
                    Object.assign(result, this.resolveRestElement(element, value));
                }
            }

            index++;
        }

        return result;
    }

    private resolveRestElement(restElement: IRestElement, value: unknown): Indexer
    {
        const result: Indexer = { };

        if (TypeGuard.isIdentifier(restElement.argument))
        {
            result[restElement.argument.name] = value;
        }
        else if (TypeGuard.isAssignmentExpression(restElement.argument))
        {
            if (TypeGuard.isIdentifier(restElement.argument.left))
            {
                result[restElement.argument.left.name] = coalesce(value, restElement.argument.right.evaluate());
            }
            else
            {
                throw new Error(Messages.illegalPropertyInDeclarationContext);
            }
        }
        else if (TypeGuard.isArrayPattern(restElement.argument))
        {
            Object.assign(result, this.resolveArrayPattern(restElement.argument, value as Array<unknown>));
        }
        else if (TypeGuard.isObjectPattern(restElement.argument))
        {
            Object.assign(result, this.resolveObjectPattern(restElement.argument, value as Indexer));
        }
        else if (TypeGuard.isRestElement(restElement.argument))
        {
            Object.assign(result, this.resolveRestElement(restElement.argument, value));
        }

        return result;
    }

    private resolveObjectPattern(objectPattern: IObjectPattern, value: Indexer): Indexer
    {
        const result: Indexer = { };

        for (const property of objectPattern.properties)
        {
            if (TypeGuard.isProperty(property))
            {
                if (property.shorthand)
                {
                    if (TypeGuard.isAssignmentExpression(property.value))
                    {
                        result[`${property.value.left.evaluate()}`] = coalesce(value[`${property.value.left.evaluate()}`], property.value.right.evaluate());
                    }
                    else
                    {
                        result[`${property.value.evaluate()}`] = value[`${property.value.evaluate()}`];
                    }
                }
                else
                {
                    if (TypeGuard.isAssignmentExpression(property.value))
                    {
                        result[`${property.key.evaluate()}`] = coalesce(value[`${property.value.left.evaluate()}`], property.value.right.evaluate());
                    }
                    else
                    {
                        result[`${property.key.evaluate()}`] = value[`${property.value.evaluate()}`];
                    }
                }
            }
            else
            {
                Object.assign(result, this.resolveRestElement(property, value));
            }
        }

        return result;
    }

    public evaluate(): unknown
    {
        if (!this._cache)
        {
            const fn = (...args: Array<unknown>) =>
            {
                const scope = this.resolveParameters(args);

                const outterScope: Indexer = { ...this.scope };

                Object.assign(this.scope, scope);

                const value = this.body.evaluate();

                for (const key of Object.keys(scope))
                {
                    if (!(key in outterScope))
                    {
                        delete this.scope[key];
                    }
                }

                Object.assign(this.scope, outterScope);

                return value;
            };

            fn.toString = () => this.toString();

            this._cache = fn;
        }

        return this._cache;
    }

    public toString(): string
    {
        return `(${this.parameters.map(x => x.toString()).join(", ")}) => ${this.body}`;
    }
}