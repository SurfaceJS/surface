import type { Indexer }    from "@surface/core";
import type IArrayPattern  from "./interfaces/array-pattern";
import type IIdentifier    from "./interfaces/identifier";
import type IObjectPattern from "./interfaces/object-pattern";
import type IPattern       from "./interfaces/pattern";
import type IRestElement   from "./interfaces/rest-element";
import Messages            from "./messages.js";
import TypeGuard           from "./type-guard.js";

export default class Evaluate
{
    private static arrayPattern(scope: object, arrayPattern: IArrayPattern, value: unknown[]): Indexer
    {
        const currentScope: Indexer = { };

        let index = 0;

        for (const element of arrayPattern.elements)
        {
            if (element)
            {
                Object.assign(currentScope, Evaluate.pattern(scope, element, value[index], value.slice(index)));
            }

            index++;
        }

        return currentScope;
    }

    private static objectPattern(scope: object, objectPattern: IObjectPattern, value: Indexer): Indexer
    {
        const aliases:      string[] = [];
        const currentScope: Indexer  = { };

        for (const property of objectPattern.properties)
        {
            if (TypeGuard.isAssignmentProperty(property))
            {
                const key = TypeGuard.isIdentifier(property.key) && !property.computed ? property.key.name : `${property.key.evaluate(scope)}`;

                if (TypeGuard.isObjectPattern(property.value))
                {
                    return Evaluate.objectPattern(scope, property.value, value[key] as Indexer);
                }
                else if (TypeGuard.isArrayPattern(property.value))
                {
                    return Evaluate.arrayPattern(scope, property.value, value[key] as unknown[]);
                }

                const alias      = `${TypeGuard.isAssignmentPattern(property.value) ? (property.value.left as IIdentifier).name : (property.value as IIdentifier).name}`;
                const aliasOrKey = property.shorthand ? alias : key;

                currentScope[alias] = TypeGuard.isAssignmentPattern(property.value)
                    ? property.value.right.evaluate(scope)
                    : currentScope[alias] = value[aliasOrKey];

                aliases.push(alias);
            }
            else
            {
                for (const alias of aliases)
                {
                    Reflect.deleteProperty(value, alias);
                }

                Object.assign(currentScope, Evaluate.restElement(scope, property, value));
            }
        }

        return currentScope;
    }

    private static restElement(scope: object, restElement: IRestElement, elements: unknown[] | Indexer): Indexer
    {
        if (TypeGuard.isIdentifier(restElement.argument))
        {
            return { [restElement.argument.name]: elements };
        }

        return Evaluate.pattern(scope, restElement.argument, elements, []);
    }

    public static pattern(scope: object, pattern: IPattern, value: unknown, rest: unknown[] = []): Indexer
    {
        if (TypeGuard.isIdentifier(pattern))
        {
            return { [pattern.name]: value };
        }
        else if (TypeGuard.isAssignmentPattern(pattern))
        {
            if (TypeGuard.isIdentifier(pattern.left))
            {
                return { [pattern.left.name]: value ?? pattern.right.evaluate(scope) };
            }

            throw new Error(Messages.illegalPropertyInDeclarationContext);
        }
        else if (TypeGuard.isArrayPattern(pattern))
        {
            return Evaluate.arrayPattern(scope, pattern, value as unknown[]);
        }
        else if (TypeGuard.isObjectPattern(pattern))
        {
            return Evaluate.objectPattern(scope, pattern, value as Indexer);
        }
        else if (TypeGuard.isRestElement(pattern))
        {
            return Evaluate.restElement(scope, pattern, rest);
        } /* c8 ignore next 3 */

        throw new Error("Invalid pattern");
    }
}