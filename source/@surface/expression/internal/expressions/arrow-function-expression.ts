import { Indexer, Nullable }  from "@surface/core";
import { hasValue }           from "@surface/core/common/generic";
import IArrayPattern          from "../../interfaces/array-pattern";
import IExpression            from "../../interfaces/expression";
import IIdentifier            from "../../interfaces/identifier";
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

    /* istanbul ignore next */
    public set body(value: IExpression)
    {
        this._body = value;
    }

    private _parameters: Array<IPattern>;
    public get parameters(): Array<IPattern>
    {
        return this._parameters;
    }

    /* istanbul ignore next */
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
        /* istanbul ignore else */
        if (TypeGuard.isIdentifier(pattern))
        {
            return { [pattern.name]: value };
        }
        else if (TypeGuard.isAssignmentPattern(pattern))
        {
            if (TypeGuard.isIdentifier(pattern.left))
            {
                return { [pattern.left.name]: value ?? pattern.right.evaluate(scope, useCache) };
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

        /* istanbul ignore next */
        throw new Error("Invalid pattern");
    }

    private resolveArrayPattern(arrayPattern: IArrayPattern, value: Array<unknown>, scope: Indexer, useCache: boolean): Indexer
    {
        const currentScope: Indexer = { };

        let index = 0;

        for (const element of arrayPattern.elements)
        {
            if (element)
            {
                Object.assign(currentScope, this.resolvePattern(element, value[index], value.slice(index), scope, useCache));
            }

            index++;
        }

        return currentScope;
    }

    private resolveObjectPattern(objectPattern: IObjectPattern, value: Indexer, scope: Indexer, useCache: boolean): Indexer
    {
        const currentScope: Indexer = { };

        const aliases: Array<string> = [];

        for (const property of objectPattern.properties)
        {
            if (TypeGuard.isAssignmentProperty(property))
            {
                const alias = `${TypeGuard.isAssignmentPattern(property.value) ? (property.value.left as IIdentifier).name : (property.value as IIdentifier).name}`;
                const key   = property.shorthand ? alias : TypeGuard.isIdentifier(property.key) && !property.computed ? property.key.name : `${property.key.evaluate(scope, useCache)}`;

                currentScope[alias] = TypeGuard.isAssignmentPattern(property.value) ?
                    value[key] ?? property.value.right.evaluate(scope, useCache)
                    : currentScope[alias] = value[key];

                aliases.push(alias);
            }
            else
            {
                for (const alias of aliases)
                {
                    delete value[alias];
                }

                Object.assign(currentScope, this.resolveRestElement(property, value, scope, useCache));
            }
        }

        return currentScope;
    }

    private resolveRestElement(restElement: IRestElement, elements: Array<unknown>|Indexer, scope: Indexer, useCache: boolean): Indexer
    {
        if (TypeGuard.isIdentifier(restElement.argument))
        {
            return { [restElement.argument.name]: elements };
        }

        return this.resolvePattern(restElement.argument, elements, [], scope, useCache);
    }

    public evaluate(scope: Indexer, useCache?: boolean): Function
    {
        if (useCache && hasValue(this.cache))
        {
            return this.cache;
        }

        const fn = (...args: Array<unknown>) => this.body.evaluate({ ...scope, ...this.resolveParameters(args, scope, !!useCache) }, useCache);

        fn.toString = () => this.toString();

        return this.cache = fn;
    }

    public toString(): string
    {
        return `(${this.parameters.map(x => x.toString()).join(", ")}) => ${this.body}`;
    }
}