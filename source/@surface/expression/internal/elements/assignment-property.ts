import IAssignmentProperty from "../../interfaces/assignment-property";
import IExpression         from "../../interfaces/expression";
import INode               from "../../interfaces/node";
import IPattern            from "../../interfaces/pattern";
import NodeType            from "../../node-type";
import TypeGuard           from "../../type-guard";

export default class AssignmentProperty implements INode
{
    private _computed: boolean;
    public get computed(): boolean
    {
        return this._computed;
    }

    /* istanbul ignore next */
    public set computed(value: boolean)
    {
        this._computed = value;
    }

    private _key: IExpression;
    public get key(): IExpression
    {
        return this._key;
    }

    /* istanbul ignore next */
    public set key(value: IExpression)
    {
        this._key = value;
    }

    private _shorthand: boolean;
    public get shorthand(): boolean
    {
        return this._shorthand;
    }

    /* istanbul ignore next */
    public set shorthand(value: boolean)
    {
        this._shorthand = value;
    }

    private _value: IPattern;
    public get value(): IPattern
    {
        return this._value;
    }

    /* istanbul ignore next */
    public set value(value: IPattern)
    {
        this._value = value;
    }

    public get type(): NodeType
    {
        return NodeType.AssignmentProperty;
    }

    public constructor(key: IExpression, value: IPattern, computed: boolean, shorthand: boolean)
    {
        this._key        = key;
        this._value      = value;
        this._computed   = computed;
        this._shorthand  = shorthand;
    }

    public clone(): IAssignmentProperty
    {
        return new AssignmentProperty(this.key.clone(), this.value.clone(), this.computed, this.shorthand);
    }

    public toString(): string
    {
        if (this.shorthand)
        {
            return this.value.toString();
        }
        else
        {
            if (TypeGuard.isIdentifier(this.key) || (TypeGuard.isLiteral(this.key) && typeof this.key.value == "number"))
            {
                return `${this.computed ? `[${this.key}]` : this.key}: ${this.value}`;
            }

            return `${this.computed ? `[${this.key}]` : this.key}: ${this.value}`;
        }
    }
}