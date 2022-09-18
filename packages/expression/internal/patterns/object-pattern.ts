import type { Indexer }        from "@surface/core";
import type AssignmentProperty from "../elements/assignment-property.js";
import type Identifier         from "../expressions/identifier.js";
import type IPattern           from "../interfaces/pattern.js";
import NodeType                from "../node-type.js";
import { PATTERN }             from "../symbols.js";
import TypeGuard               from "../type-guard.js";
import type RestElement        from "./rest-element.js";

export default class ObjectPattern implements IPattern
{
    private _properties: (AssignmentProperty | RestElement)[];

    public [PATTERN]!: void;

    public get properties(): (AssignmentProperty | RestElement)[]
    {
        return this._properties;
    }

    /* c8 ignore next 4 */
    public set properties(value: (AssignmentProperty | RestElement)[])
    {
        this._properties = value;
    }

    public get type(): NodeType
    {
        return NodeType.ObjectPattern;
    }

    public constructor(properties: (AssignmentProperty | RestElement)[])
    {
        this._properties = properties;
    }

    public clone(): ObjectPattern
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

                const alias      = `${TypeGuard.isAssignmentPattern(property.value) ? (property.value.left as Identifier).name : (property.value as Identifier).name}`;
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
