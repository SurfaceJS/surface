import type { Indexer }         from "@surface/core";
import type IAssignmentProperty from "../interfaces/assignment-property";
import type IIdentifier         from "../interfaces/identifier.js";
import type IObjectPattern      from "../interfaces/object-pattern";
import type IPattern            from "../interfaces/pattern";
import type IRestElement        from "../interfaces/rest-element";
import NodeType                 from "../node-type.js";
import { PATTERN }              from "../symbols.js";
import TypeGuard                from "../type-guard.js";

export default class ObjectPattern implements IPattern
{
    private _properties: (IAssignmentProperty | IRestElement)[];

    public [PATTERN]: void;

    public get properties(): (IAssignmentProperty | IRestElement)[]
    {
        return this._properties;
    }

    /* c8 ignore next 4 */
    public set properties(value: (IAssignmentProperty | IRestElement)[])
    {
        this._properties = value;
    }

    public get type(): NodeType
    {
        return NodeType.ObjectPattern;
    }

    public constructor(properties: (IAssignmentProperty | IRestElement)[])
    {
        this._properties = properties;
    }

    public clone(): IObjectPattern
    {
        return new ObjectPattern(this.properties.map(x => x.clone()));
    }

    public evaluate(scope: object, value: Indexer): object
    {
        const aliases:      string[] = [];
        const currentScope: Indexer  = { };

        for (const property of this.properties)
        {
            if (TypeGuard.isAssignmentProperty(property))
            {
                const key = TypeGuard.isIdentifier(property.key) && !property.computed ? property.key.name : `${property.key.evaluate(scope)}`;

                if (TypeGuard.isObjectPattern(property.value))
                {
                    return property.value.evaluate(scope, value[key] as Indexer);
                }
                else if (TypeGuard.isArrayPattern(property.value))
                {
                    return property.value.evaluate(scope, value[key] as unknown[]);
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

                Object.assign(currentScope, property.evaluate(scope, value));
            }
        }

        return currentScope;
    }

    public toString(): string
    {
        return this.properties.length > 0 ? `{ ${this.properties.map(x => x.toString()).join(", ")} }` : "{ }";
    }
}