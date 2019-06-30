import { Indexer }            from "@surface/core";
import { coalesce }           from "@surface/core/common/generic";
import ExpressionType         from "../../expression-type";
import IDestructureExpression from "../../interfaces/destructure-expression";
import IExpression            from "../../interfaces/expression";
import Messages               from "../messages";
import TypeGuard              from "../type-guard";
import BaseExpression         from "./abstracts/base-expression";

export default class RestExpression extends BaseExpression implements IDestructureExpression
{
    private readonly _argument: IExpression;
    public get argument(): IExpression
    {
        return this._argument;
    }

    public get type(): ExpressionType
    {
        return ExpressionType.Rest;
    }

    public constructor(argument: IExpression)
    {
        super();
        this._argument = argument;
    }

    public destruct(value: unknown): Indexer
    {
        const result: Indexer = { };

        if (TypeGuard.isIdentifierExpression(this.argument))
        {
            result[this.argument.name] = value;
        }
        else if (TypeGuard.isAssignmentExpression(this.argument))
        {
            if (TypeGuard.isIdentifierExpression(this.argument.left))
            {
                result[this.argument.left.name] = coalesce(value, this.argument.right.evaluate());
            }
            else
            {
                throw new Error(Messages.illegalPropertyInDeclarationContext);
            }
        }
        else if (TypeGuard.isArrayDestructureExpression(this.argument) || TypeGuard.isObjectDestructureExpression(this.argument) || TypeGuard.isRestExpression(this.argument))
        {
            Object.assign(result, this.argument.destruct(value));
        }

        return result;
    }

    public evaluate(): unknown
    {
        return undefined;
    }

    public toString(): string
    {
        return `...${this.argument}`;
    }
}