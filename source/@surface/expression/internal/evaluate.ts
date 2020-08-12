import { Indexer }    from "@surface/core";
import IArrayPattern  from "./interfaces/array-pattern";
import IIdentifier    from "./interfaces/identifier";
import IObjectPattern from "./interfaces/object-pattern";
import IPattern       from "./interfaces/pattern";
import IRestElement   from "./interfaces/rest-element";
import Messages       from "./messages";
import TypeGuard      from "./type-guard";

export default class Evaluate
{
    private static arrayPattern(scope: object, arrayPattern: IArrayPattern, value: unknown[], useCache: boolean): Indexer
    {
        const currentScope: Indexer = { };

        let index = 0;

        for (const element of arrayPattern.elements)
        {
            if (element)
            {
                Object.assign(currentScope, Evaluate.pattern(scope, element, value[index], value.slice(index), useCache));
            }

            index++;
        }

        return currentScope;
    }

    private static objectPattern(scope: object, objectPattern: IObjectPattern, value: Indexer, useCache: boolean): Indexer
    {
        const aliases:      string[] = [];
        const currentScope: Indexer  = { };

        for (const property of objectPattern.properties)
        {
            if (TypeGuard.isAssignmentProperty(property))
            {
                const key = TypeGuard.isIdentifier(property.key) && !property.computed ? property.key.name : `${property.key.evaluate(scope, useCache)}`;

                if (TypeGuard.isObjectPattern(property.value))
                {
                    return Evaluate.objectPattern(scope, property.value, value[key] as Indexer, useCache);
                }
                else if (TypeGuard.isArrayPattern(property.value))
                {
                    return Evaluate.arrayPattern(scope, property.value, value[key] as unknown[], useCache);
                }

                const alias      = `${TypeGuard.isAssignmentPattern(property.value) ? (property.value.left as IIdentifier).name : (property.value as IIdentifier).name}`;
                const aliasOrKey = property.shorthand ? alias : key;

                currentScope[alias] = TypeGuard.isAssignmentPattern(property.value)
                    ? property.value.right.evaluate(scope, useCache)
                    : currentScope[alias] = value[aliasOrKey];

                aliases.push(alias);
            }
            else
            {
                for (const alias of aliases)
                {
                    Reflect.deleteProperty(value, alias);
                }

                Object.assign(currentScope, Evaluate.restElement(scope, property, value, useCache));
            }
        }

        return currentScope;
    }

    private static restElement(scope: object, restElement: IRestElement, elements: unknown[] | Indexer, useCache: boolean): Indexer
    {
        if (TypeGuard.isIdentifier(restElement.argument))
        {
            return { [restElement.argument.name]: elements };
        }

        return Evaluate.pattern(scope, restElement.argument, elements, [], useCache);
    }

    public static pattern(scope: object, pattern: IPattern, value: unknown, rest: unknown[] = [], useCache: boolean = false): Indexer
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

            throw new Error(Messages.illegalPropertyInDeclarationContext);
        }
        else if (TypeGuard.isArrayPattern(pattern))
        {
            return Evaluate.arrayPattern(scope, pattern, value as unknown[], useCache);
        }
        else if (TypeGuard.isObjectPattern(pattern))
        {
            return Evaluate.objectPattern(scope, pattern, value as Indexer, useCache);
        }
        else if (TypeGuard.isRestElement(pattern))
        {
            return Evaluate.restElement(scope, pattern, rest, useCache);
        }

        /* istanbul ignore next */
        throw new Error("Invalid pattern");
    }
}