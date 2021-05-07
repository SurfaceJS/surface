import type { Indexer }        from "@surface/core";
import type IArrayPattern      from "../interfaces/array-pattern";
import type IPattern           from "../interfaces/pattern";
import NodeType                from "../node-type.js";
import { PATTERN }             from "../symbols.js";
import TypeGuard               from "../type-guard.js";

export default class ArrayPattern implements IPattern
{
    private _elements: (IPattern | null)[];

    public [PATTERN]: void;

    public get elements(): (IPattern | null)[]
    {
        return this._elements;
    }

    /* c8 ignore next 4 */
    public set elements(value: (IPattern | null)[])
    {
        this._elements = value;
    }

    public get type(): NodeType
    {
        return NodeType.ArrayPattern;
    }

    public constructor(elements: (IPattern | null)[])
    {
        this._elements = elements;
    }

    public clone(): IArrayPattern
    {
        return new ArrayPattern(this.elements.map(x => x?.clone() ?? null));
    }

    public evaluate(scope: object, value: unknown[]): object
    {
        const currentScope: Indexer = { };

        let index = 0;

        for (const element of this.elements)
        {
            if (element)
            {
                if (TypeGuard.isRestElement(element))
                {
                    Object.assign(currentScope, element.evaluate(scope, value.slice(index)));
                }
                else
                {
                    Object.assign(currentScope, element.evaluate(scope, value[index]));
                }
            }

            index++;
        }

        return currentScope;
    }

    public toString(): string
    {
        return `[${this.elements.map(x => (x ??  "").toString()).join(", ")}]`;
    }
}