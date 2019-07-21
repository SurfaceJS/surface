import { Indexer, Nullable }  from "@surface/core";
import { coalesce, hasValue } from "@surface/core/common/generic";
import IArrayPattern          from "../../interfaces/array-pattern";
import IExpression            from "../../interfaces/expression";
import IIdentifier            from "../../interfaces/identifier";
import ILiteral               from "../../interfaces/literal";
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

    private resolveParameters($arguments: Array<unknown>, scope: Indexer, useCache: boolean): Indexer
    {
        const currentScope: Indexer = { };

        let index = 0;
        for (const parameter of this.parameters)
        {
            Object.assign(currentScope, this.resolvePattern(parameter, $arguments[index], $arguments.slice(index), scope, useCache));

            index++;
        }

        return currentScope;
    }

    private resolvePattern(pattern: IPattern, value: unknown, rest: Array<unknown>, scope: Indexer, useCache: boolean): Indexer
    {
        if (TypeGuard.isIdentifier(pattern))
        {
            return { [pattern.name]: value };
        }
        else if (TypeGuard.isAssignmentPattern(pattern))
        {
            if (TypeGuard.isIdentifier(pattern.left))
            {
                return { [pattern.left.name]: coalesce(value, pattern.right.evaluate(scope, useCache)) };
            }
            else
            {
                throw new Error(Messages.illegalPropertyInDeclarationContext);
            }
        }
        else if (TypeGuard.isArrayPattern(pattern))
        {
            return this.resolveArrayPattern(pattern, value as Array<unknown>, scope, useCache);
        }
        else if (TypeGuard.isObjectPattern(pattern))
        {
            return this.resolveObjectPattern(pattern, value as Indexer, scope, useCache);
        }
        else if (TypeGuard.isRestElement(pattern))
        {
            return this.resolveRestElement(pattern, rest, scope, useCache);
        }

        throw new Error();
    }

    private resolveArrayPattern(arrayPattern: IArrayPattern, value: Array<unknown>, scope: Indexer, useCache: boolean): Indexer
    {
        const currentScope: Indexer = { };

        let index = 0;

        for (const element of arrayPattern.elements)
        {
            if (element)
            {
                Object.assign(currentScope, this.resolvePattern(element, value[index], value, scope, useCache));
            }

            index++;
        }

        return currentScope;
    }

    private resolveObjectPattern(objectPattern: IObjectPattern, value: Indexer, scope: Indexer, useCache: boolean): Indexer
    {
        const currentScope: Indexer = { };

        for (const property of objectPattern.properties)
        {
            if (TypeGuard.isAssignmentProperty(property))
            {
                if (TypeGuard.isAssignmentExpression(property.value))
                {
                    currentScope[`${property.value.left.evaluate(scope, useCache)}`] = coalesce(value[`${property.value.left.evaluate(scope, useCache)}`], property.value.right.evaluate(scope, useCache));
                }
                else
                {
                    currentScope[`${(property.value as IIdentifier|ILiteral).evaluate(scope, useCache)}`] = property.shorthand ?
                        value[`${(property.value as IIdentifier|ILiteral).evaluate(scope, useCache)}`]
                        : value[`${property.key.evaluate(scope, useCache)}`];
                }
            }
            else
            {
                Object.assign(currentScope, this.resolveRestElement(property, value, scope, useCache));
            }
        }

        return currentScope;
    }

    private resolveRestElement(restElement: IRestElement, value: Array<unknown>|Indexer, scope: Indexer, useCache: boolean): Indexer
    {
        if (TypeGuard.isIdentifier(restElement.argument))
        {
            return { [restElement.argument.name]: value };
        }

        return this.resolvePattern(restElement.argument, value, [], scope, useCache);
    }

    public evaluate(scope: Indexer, useCache?: boolean): Function
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        const fn = (...args: Array<unknown>) => this.body.evaluate({ ...scope, ...this.resolveParameters(args, scope, !!useCache) }, useCache);

        //fn.apply    = (thisArg: Indexer, argArray: Array<unknown>) => this.evaluate({ ...scope, this: thisArg })(argArray);
        //fn.bind     = (thisArg: Indexer) => this.evaluate({ ...scope, this: thisArg });
        //fn.call     = (thisArg: Indexer, ...argArray: Array<unknown>) => this.evaluate({ ...scope, this: thisArg })(argArray);
        fn.toString = () => this.toString();

        return this.cache = fn;
    }

    public toString(): string
    {
        return `(${this.parameters.map(x => x.toString()).join(", ")}) => ${this.body}`;
    }
}