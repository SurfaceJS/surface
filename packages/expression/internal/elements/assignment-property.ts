import type IExpression from "../interfaces/expression";
import type INode       from "../interfaces/node";
import type IPattern    from "../interfaces/pattern";
import NodeType         from "../node-type.js";
import TypeGuard        from "../type-guard.js";

export default class AssignmentProperty implements INode
{
    private _computed: boolean;
    public get computed(): boolean
    {
        return this._computed;
    }

    /* c8 ignore next 4 */
    public set computed(value: boolean)
    {
        this._computed = value;
    }

    private _key: IExpression;
    public get key(): IExpression
    {
        return this._key;
    }

    /* c8 ignore next 4 */
    public set key(value: IExpression)
    {
        this._key = value;
    }

    private _shorthand: boolean;
    public get shorthand(): boolean
    {
        return this._shorthand;
    }

    /* c8 ignore next 4 */
    public set shorthand(value: boolean)
    {
        this._shorthand = value;
    }

    private _value: IPattern;
    public get value(): IPattern
    {
        return this._value;
    }

    /* c8 ignore next 4 */
    public set value(value: IPattern)
    {
        this._value = value;
    }

    public get type(): NodeType
    {
        return NodeType.AssignmentProperty;
    }

    public constructor(key: IExpression, value: IPattern, computed: boolean = false, shorthand: boolean = false)
    {
        this._key        = key;
        this._value      = value;
        this._computed   = computed;
        this._shorthand  = shorthand;
    }

    public clone(): AssignmentProperty
    {
        return new AssignmentProperty(this.key.clone(), this.value.clone(), this.computed, this.shorthand);
    }

    public toString(): string
    {
        if (this.shorthand)
        {
            return this.value.toString();
        }

        if (TypeGuard.isIdentifier(this.key) || TypeGuard.isLiteral(this.key) && typeof this.key.value == "number")
        {
            return `${this.computed ? `[${this.key}]` : this.key}: ${this.value}`;
        }

        return `${this.computed ? `[${this.key}]` : this.key}: ${this.value}`;
    }
}