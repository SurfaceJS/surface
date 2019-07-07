import { Indexer, Nullable }  from "@surface/core";
import { coalesce, hasValue } from "@surface/core/common/generic";
import IArrayPattern          from "../../interfaces/array-pattern";
import IExpression            from "../../interfaces/expression";
import IObjectPattern         from "../../interfaces/object-pattern";
import IPattern               from "../../interfaces/pattern";
import IRestElement           from "../../interfaces/rest-element";
import NodeType               from "../../node-type";
import Messages               from "../messages";
import TypeGuard              from "../type-guard";

export default class ArrowFunctionExpression implements IExpression
{
    private cache: Nullable<Function>;

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

    public get type(): NodeType
    {
        return NodeType.ArrowFunctionExpression;
    }

    public constructor(parameters: Array<IPattern>, body: IExpression)
    {
        this._parameters = parameters;
        this._body       = body;
    }

    private resolveParameters(args: Array<unknown>, scope: Indexer, useCache: boolean): Indexer
    {
        const currentScope: Indexer = { };

        let index = 0;
        for (const parameter of this.parameters)
        {
            if (TypeGuard.isIdentifier(parameter))
            {
                currentScope[parameter.name] = args[index];
            }
            else if (TypeGuard.isAssignmentExpression(parameter))
            {
                if (TypeGuard.isIdentifier(parameter.left))
                {
                    currentScope[parameter.left.name] = coalesce(args[index], parameter.right.evaluate(scope, useCache));
                }
                else
                {
                    throw new Error(Messages.illegalPropertyInDeclarationContext);
                }
            }
            else if (TypeGuard.isRestElement(parameter))
            {
                Object.assign(currentScope, this.resolveRestElement(parameter, args.slice(index), scope, useCache));
            }
            else if (TypeGuard.isArrayPattern(parameter))
            {
                Object.assign(currentScope, this.resolveArrayPattern(parameter, args[index] as Array<unknown>, scope, useCache));
            }
            else if (TypeGuard.isObjectPattern(parameter))
            {
                Object.assign(currentScope, this.resolveObjectPattern(parameter, args[index] as Indexer, scope, useCache));
            }

            index++;
        }

        return currentScope;
    }

    private resolveArrayPattern(arrayPattern: IArrayPattern, value: Array<unknown>, scope: Indexer, useCache: boolean): Indexer
    {
        const currentScope: Indexer = { };

        let index = 0;

        for (const element of arrayPattern.elements)
        {
            if (element)
            {
                if (TypeGuard.isIdentifier(element))
                {
                    currentScope[element.name] = value[index];
                }
                else if (TypeGuard.isAssignmentExpression(element))
                {
                    if (TypeGuard.isIdentifier(element.left))
                    {
                        currentScope[element.left.name] = coalesce(value[index], element.right.evaluate(scope, useCache));
                    }
                    else
                    {
                        throw new Error(Messages.illegalPropertyInDeclarationContext);
                    }
                }
                else if (TypeGuard.isArrayPattern(element))
                {
                    Object.assign(currentScope, this.resolveArrayPattern(element, value, scope, useCache));
                }
                else if (TypeGuard.isObjectPattern(element))
                {
                    Object.assign(currentScope, this.resolveObjectPattern(element, value[index] as Indexer, scope, useCache));
                }
                else if (TypeGuard.isRestElement(element))
                {
                    Object.assign(currentScope, this.resolveRestElement(element, value, scope, useCache));
                }
            }

            index++;
        }

        return currentScope;
    }

    private resolveRestElement(restElement: IRestElement, value: unknown, scope: Indexer, useCache: boolean): Indexer
    {
        const currentScope: Indexer = { };

        if (TypeGuard.isIdentifier(restElement.argument))
        {
            currentScope[restElement.argument.name] = value;
        }
        else if (TypeGuard.isAssignmentExpression(restElement.argument))
        {
            if (TypeGuard.isIdentifier(restElement.argument.left))
            {
                currentScope[restElement.argument.left.name] = coalesce(value, restElement.argument.right.evaluate(scope, useCache));
            }
            else
            {
                throw new Error(Messages.illegalPropertyInDeclarationContext);
            }
        }
        else if (TypeGuard.isArrayPattern(restElement.argument))
        {
            Object.assign(currentScope, this.resolveArrayPattern(restElement.argument, value as Array<unknown>, scope, useCache));
        }
        else if (TypeGuard.isObjectPattern(restElement.argument))
        {
            Object.assign(currentScope, this.resolveObjectPattern(restElement.argument, value as Indexer, scope, useCache));
        }
        else if (TypeGuard.isRestElement(restElement.argument))
        {
            Object.assign(currentScope, this.resolveRestElement(restElement.argument, value, scope, useCache));
        }

        return currentScope;
    }

    private resolveObjectPattern(objectPattern: IObjectPattern, value: Indexer, scope: Indexer, useCache: boolean): Indexer
    {
        const currentScope: Indexer = { };

        for (const property of objectPattern.properties)
        {
            if (TypeGuard.isProperty(property))
            {
                if (property.shorthand)
                {
                    if (TypeGuard.isAssignmentExpression(property.value))
                    {
                        currentScope[`${property.value.left.evaluate(scope, useCache)}`] = coalesce(value[`${property.value.left.evaluate(scope, useCache)}`], property.value.right.evaluate(scope, useCache));
                    }
                    else
                    {
                        currentScope[`${property.value.evaluate(scope, useCache)}`] = value[`${property.value.evaluate(scope, useCache)}`];
                    }
                }
                else
                {
                    if (TypeGuard.isAssignmentExpression(property.value))
                    {
                        currentScope[`${property.key.evaluate(scope, useCache)}`] = coalesce(value[`${property.value.left.evaluate(scope, useCache)}`], property.value.right.evaluate(scope, useCache));
                    }
                    else
                    {
                        currentScope[`${property.key.evaluate(scope, useCache)}`] = value[`${property.value.evaluate(scope, useCache)}`];
                    }
                }
            }
            else
            {
                Object.assign(currentScope, this.resolveRestElement(property, value, scope, useCache));
            }
        }

        return currentScope;
    }

    public evaluate(scope: Indexer, useCache: boolean): unknown
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        const fn = (...args: Array<unknown>) => this.body.evaluate({ ...scope, ...this.resolveParameters(args, scope, useCache) }, useCache);

        fn.toString = () => this.toString();

        return this.cache = fn;
    }

    public toString(): string
    {
        return `(${this.parameters.map(x => x.toString()).join(", ")}) => ${this.body}`;
    }
}