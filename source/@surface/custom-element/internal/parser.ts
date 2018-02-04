import IExpression,
{
    IdentifierExpression,
    Context,
    ConstantExpression,
    ArrayExpression,
    PropertyExpression,
    ObjectExpression,
    MemberExpression,
    CallExpression,
    BinaryExpression
}
from "./expression";

import Scanner, { RawToken } from "./scanner";
import Token                 from "./token";

import { ObjectLiteral } from "@surface/types";

export default class Parser
{
    private readonly context:            Context;
    private readonly operatorPrecedence: ObjectLiteral<number>;
    private readonly scanner:            Scanner;
    private lookahead: RawToken;

    public constructor(context: Context, source: string)
    {
        this.context = context;
        this.scanner = new Scanner(source);
        this.lookahead = this.scanner.nextToken();
        this.operatorPrecedence =
        {
            ")":   0,
            ";":   0,
            ",":   0,
            "=":   0,
            "]":   0,
            "||":  1,
            "&&":  2,
            "|":   3,
            "^":   4,
            "&":   5,
            "==":  6,
            "!=":  6,
            "===": 6,
            "!==": 6,
            "<":   7,
            ">":   7,
            "<=":  7,
            ">=":  7,
            "<<":  8,
            ">>":  8,
            ">>>": 8,
            "+":   9,
            "-":   9,
            "*":   11,
            "/":   11,
            "%":   11
        };
    }

    private binaryPrecedence(token: RawToken): number
    {
        const operator = token.value;
        let precedence = 0;
        if (token.type === Token.Punctuator)
        {
            precedence = this.operatorPrecedence[operator] || 0;
        }
        else if (token.type === Token.Keyword)
        {
            precedence = (operator === "instanceof" || operator === "in") ? 7 : 0;
        }

        return precedence;
    }

    private expect(value: string): void
    {
        const token = this.nextToken();

        if (token.type !== Token.Punctuator || token.value !== value)
        {
            this.throwUnexpectedToken(token);
        }
    }

    private match(value: string): boolean
    {
        return this.lookahead.type === Token.Punctuator && this.lookahead.value === value;
    }

    private nextToken(): RawToken
    {
        const token = this.lookahead;
        this.lookahead = this.scanner.nextToken();
        return token;
    }

    private parseArgumentsExpression(): Array<IExpression>
    {
        this.expect("(");
        const args: Array<IExpression> = [];

        if (!this.match(")"))
        {
            while (true)
            {
                const expression = this.match("...") ? this.parseSpreadExpression() : this.parseAssignmentExpression();

                args.push(expression);

                if (this.match(")"))
                {
                    break;
                }

                this.expect(",");

                if (this.match(")"))
                {
                    break;
                }
            }
        }

        this.expect(")");

        return args;
    }

    private parseArrayExpression(): IExpression
    {
        const elements: Array<IExpression> = [];

        this.expect("[");

        while (!this.match("]"))
        {
            if (this.match(","))
            {
                this.nextToken();
            }
            else if (this.match("..."))
            {
                elements.push(this.parseSpreadExpression());
            }
            else
            {
                elements.push(this.parseAssignmentExpression());
            }

            if (!this.match("]"))
            {
                this.expect(",");
            }
        }

        this.expect("]");

        return new ArrayExpression(elements);
    }

    private parseAssignmentExpression(): IExpression
    {
        return this.parseConditionalExpression();
        //throw new Error("Method not implemented.");
    }

    private parseBinaryExpression(): IExpression
    {
        let expression = this.parseExponentiationExpression();

        let precedence = this.binaryPrecedence(this.lookahead);

        if (precedence > 0)
        {
            const token = this.nextToken();

            let left  = expression;
            let right = this.parseExponentiationExpression();

            const stack: [IExpression, string, IExpression] = [left, token.value as string, right];
            const precedences = [precedence];
            while (true)
            {
                precedence = this.binaryPrecedence(this.lookahead);

                if (precedence <= 0)
                {
                    break;
                }

                while (stack.length > 2 && precedence <= precedences[precedences.length - 1])
                {
                    right = stack.pop() as IExpression;
                    const operator = stack.pop() as string;
                    left = stack.pop() as IExpression;
                    precedences.pop();
                    stack.push(new BinaryExpression(operator, left, right));
                }

                stack.push(this.nextToken().value as string);
                precedences.push(precedence);
                stack.push(this.parseExponentiationExpression());
            }

            let i = stack.length - 1;
            expression = stack[i] as IExpression;

            while (i > 1)
            {
                expression = new BinaryExpression(stack[i - 1] as string, stack[i - 2] as IExpression, expression);
                i -= 2;
            }
        }
        return expression;
    }

    private parseConditionalExpression(): IExpression
    {
        return this.parseBinaryExpression();
        //throw new Error("Method not implemented.");
    }

    private parseExponentiationExpression(): IExpression
    {
        const expression = this.parseUnaryExpression();

        if (this.match("**"))
        {
            throw new Error("Method not implemented.");
        }

        return expression;
    }

    private parseExpression(): IExpression
    {
        return this.parseAssignmentExpression();
    }

    private parseGroupExpression(): IExpression
    {
        this.expect("(");

        const expression = this.parseAssignmentExpression();

        this.expect(")");

        return expression;
    }

    private parseLeftHandSideExpressionAllowCall(): IExpression
    {
        let expression = this.parsePrimaryExpression();
        let parentExpression = expression;

        while (true)
        {
            if (this.match("."))
            {
                parentExpression = expression;
                this.expect(".");

                if (this.lookahead.type == Token.Identifier)
                {
                    expression = new MemberExpression(parentExpression, this.nextToken().value as string);
                }
                else
                {
                    throw this.unexpectedTokenError(this.nextToken());
                }

            }
            else if (this.match("("))
            {
                const args = this.parseArgumentsExpression();
                expression = new CallExpression(parentExpression, expression, args);
            }
            else if (this.match("["))
            {
                this.expect("[");

                const property = this.parseExpression();

                this.expect("]");

                expression = new MemberExpression(expression, property.execute() as string);
            }
            //else if (this.lookahead.type == Token.Template && this.lookahead.head)
            //{
            //    const quasi = this.parseTemplateLiteralExpression();
            //}
            else
            {
                break;
            }
        }

        return expression;
    }

    private parseObjectExpression(): ObjectExpression
    {
        this.expect("{");

        const properties: Array<IExpression> = [];
        while (!this.match("}"))
        {
            properties.push(this.match("...") ? this.parseSpreadExpression(): this.parseObjectPropertyExpression());

            if (!this.match("}"))
            {
                this.expect(",");
            }
        }

        this.expect("}");

        return new ObjectExpression(properties);
    }

    private parseObjectPropertyExpression(): PropertyExpression
    {
        const token = this.lookahead;

        let key:   IExpression;
        let value: IExpression;

        if (token.type == Token.Identifier)
        {
            key = new ConstantExpression(token.value);
            this.nextToken();

            if (!this.match(":"))
            {
                return new PropertyExpression(key, new IdentifierExpression(this.context, token.value as string));
            }
        }
        else
        {
            key = this.parseObjectPropertyKeyExpression();
        }

        this.nextToken();

        value = this.parseAssignmentExpression();
        return new PropertyExpression(key, value);
    }

    private parseObjectPropertyKeyExpression(): ConstantExpression
    {
        const token = this.lookahead;

        switch (token.type)
        {
            case Token.Identifier:
            case Token.StringLiteral:
            case Token.NumericLiteral:
            case Token.BooleanLiteral:
            case Token.NullLiteral:
                return new ConstantExpression(this.nextToken().value);

            case Token.Punctuator:
                if (token.value == "[")
                {
                    this.expect("[");

                    const key = this.parseAssignmentExpression();

                    this.expect("]");

                    return new ConstantExpression(key);
                }
                else
                {
                    throw this.unexpectedTokenError(token);
                }

            default:
                throw this.unexpectedTokenError(token);
        }
    }

    private parseSpreadExpression(): IExpression
    {
        this.expect("...");
        return this.parseAssignmentExpression();
    }

    private parseStatementExpression(): IExpression
    {
        return this.parseExpression();
    }

    private parsePrimaryExpression(): IExpression
    {
        switch (this.lookahead.type)
        {
            case Token.Identifier:
                if (this.lookahead.value == "undefined")
                {
                    return new ConstantExpression(undefined);
                }

                return new IdentifierExpression(this.context, this.nextToken().value as string);

            case Token.BooleanLiteral:
                return new ConstantExpression(this.nextToken().value == "true");

            case Token.NumericLiteral:
            case Token.NullLiteral:
            case Token.StringLiteral:
            case Token.RegularExpression:
                return new ConstantExpression(this.nextToken().value);

            case Token.Punctuator:
                switch (this.lookahead.value)
                {
                    case "(":
                        return this.parseGroupExpression();
                    case "[":
                        return this.parseArrayExpression();
                    case "{":
                        return this.parseObjectExpression();
                    default:
                        throw this.unexpectedTokenError(this.nextToken());
                }

            default:
                throw this.unexpectedTokenError(this.nextToken());
        }
    }

    //private parseTemplateHead():

    /*
    private parseTemplateLiteralExpression(): IExpression
    {
        const expression: Array<IExpression> = [];
        const quasis:     Array<Object>      = [];

        let quasi = this.
        throw new Error("Method not implemented.");
    }
    */

    private parseUnaryExpression(): IExpression
    {
        if (this.match("+") || this.match("-") || this.match("~") || this.match("!"))
        {
            throw new Error("Method not implemented.");
        }
        else
        {
            return this.parseUpdateExpression();
        }
    }

    private parseUpdateExpression(): IExpression
    {
        if (this.match("++") || this.match("--"))
        {
            throw new Error("Method not implemented.");
        }
        else
        {
            return this.parseLeftHandSideExpressionAllowCall();
        }
    }

    /*
    private qualifiedPropertyName(token: RawToken): boolean
    {
        switch (token.type)
        {
            case Token.Identifier:
            case Token.StringLiteral:
            case Token.BooleanLiteral:
            case Token.NullLiteral:
            case Token.NumericLiteral:
            case Token.Keyword:
                return true;
            case Token.Punctuator:
                return token.value == "[";
            default:
                break;
        }
        return false;
    }
    */

    /*
    private reinterpretExpressionAsPattern(expression: IExpression): IExpression
    {
        switch ((expression as Object).constructor)
        {
            case IdentifierExpression:
            default:
                return expression;
        }
    }
    */

    public throwUnexpectedToken(token: Object, message?: string): never
    {
        throw this.unexpectedTokenError(token, message);
    }

    public unexpectedTokenError(token: Object, message?: string): Error
    {
        return new Error(message);
    }

    public parse(): IExpression
    {
        switch (this.lookahead.type)
        {
            case Token.StringLiteral:
            case Token.NumericLiteral:
            case Token.BooleanLiteral:
            case Token.NullLiteral:
            case Token.RegularExpression:
            case Token.Template:
            case Token.Identifier:
                return this.parseStatementExpression();
            case Token.Punctuator:
                if (this.lookahead.value == "(" || this.lookahead.value == "{"  || this.lookahead.value == "[")
                {
                    return this.parseStatementExpression();
                }
            default:
                throw new Error("Expression not supported");
        }
    }
}