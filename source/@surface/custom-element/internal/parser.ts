import IExpression,
{
    ArrayExpression,
    BinaryExpression,
    CallExpression,
    ConditionalExpression,
    ConstantExpression,
    IdentifierExpression,
    MemberExpression,
    ObjectExpression,
    PropertyExpression,
    RegexExpression,
    TemplateLiteralExpression,
    UnaryExpression,
    UpdateExpression,
}
from "./expression";
import Scanner, { RawToken } from "./scanner";
import Token                 from "./token";

import { Action } from "@surface/types";

export default class Parser
{
    private readonly context: Object;
    private readonly notify?: Action;
    private readonly scanner: Scanner;
    private lookahead: RawToken;

    public constructor(context: Object, source: string, notify?: Action)
    {
        this.context   = context;
        this.notify    = notify;
        this.scanner   = new Scanner(source);
        this.lookahead = this.scanner.nextToken();
    }

    public static parse(context: Object, source: string, notify?: Action): IExpression
    {
        return new Parser(context, source).parseExpression();
    }

    private argumentsExpression(): Array<IExpression>
    {
        this.expect("(");

        const args: Array<IExpression> = [];

        if (!this.match(")"))
        {
            while (true)
            {
                const expression = this.match("...") ? this.spreadExpression() : this.assignmentExpression();

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

    private arrayExpression(): IExpression
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
                for (const value of this.spreadExpression().evaluate())
                {
                    elements.push(new ConstantExpression(value));
                }
            }
            else
            {
                elements.push(this.assignmentExpression());
            }

            if (!this.match("]"))
            {
                this.expect(",");
            }
        }

        this.expect("]");

        return new ArrayExpression(elements);
    }

    private assignmentExpression(): IExpression
    {
        return this.conditionalExpression();
    }

    private binaryExpression(): IExpression
    {
        let expression = this.exponentiationExpression();

        let precedence = this.binaryPrecedence(this.lookahead);

        if (precedence > 0)
        {
            const token = this.nextToken();

            let left  = expression;
            let right = this.exponentiationExpression();

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
                    stack.push(new BinaryExpression(left, right, operator));
                }

                stack.push(this.nextToken().value as string);
                precedences.push(precedence);
                stack.push(this.exponentiationExpression());
            }

            let i = stack.length - 1;
            expression = stack[i] as IExpression;

            while (i > 1)
            {
                expression = new BinaryExpression(stack[i - 2] as IExpression, expression, stack[i - 1] as string);
                i -= 2;
            }
        }
        return expression;
    }

    private binaryPrecedence(token: RawToken): number
    {
        const operator = token.value;

        if (token.type == Token.Punctuator)
        {
            switch (operator)
            {
                case ")":
                case ";":
                case ",":
                case "=":
                case "]":
                default:
                    return 0;

                case "||":
                    return 1;

                case "&&":
                    return 2;

                case "|":
                    return 3;

                case "^":
                    return 4;

                case "&":
                    return 5;

                case "==":
                case "!=":
                case "===":
                case "!==":
                    return 6;

                case "<":
                case ">":
                case "<=":
                case ">=":
                    return  7;

                case "<<":
                case ">>":
                case ">>>":
                    return 8;

                case "+":
                case "-":
                    return 9;

                case "*":
                case "/":
                case "%":
                    return 11;
            }
        }
        else if (token.type == Token.Keyword)
        {
            return (operator == "instanceof" || operator == "in") ? 7 : 0;
        }

        return 0;
    }

    private conditionalExpression(): IExpression
    {
        let expression =  this.binaryExpression();

        if (this.match("?"))
        {
            this.expect("?");

            const truthyExpression = this.assignmentExpression();

            this.expect(":");

            const falsyExpression  = this.assignmentExpression();

            expression = new ConditionalExpression(expression, truthyExpression, falsyExpression);
        }

        return expression;
    }

    private expect(value: string): void
    {
        const token = this.nextToken();

        if (token.type !== Token.Punctuator || token.value !== value)
        {
            throw this.unexpectedTokenError(token);
        }
    }

    private exponentiationExpression(): IExpression
    {
        const expression = this.unaryExpression();

        if (this.match("**"))
        {
            const operator = this.nextToken().raw;
            return new BinaryExpression(expression, this.assignmentExpression(), operator as string);
        }

        return expression;
    }

    private groupExpression(): IExpression
    {
        this.expect("(");

        const expression = this.assignmentExpression();

        this.expect(")");

        return expression;
    }

    private leftHandSideExpression(): IExpression
    {
        let expression = this.primaryExpression();
        let parentExpression = expression;

        while (true)
        {
            if (this.match("."))
            {
                parentExpression = expression;
                this.expect(".");

                if (this.lookahead.type == Token.Identifier)
                {
                    expression = new MemberExpression(parentExpression, new ConstantExpression(this.nextToken().value), this.notify);
                }
                else
                {
                    throw this.unexpectedTokenError(this.nextToken());
                }

            }
            else if (this.match("("))
            {
                expression = new CallExpression(parentExpression, (expression as MemberExpression).property, this.argumentsExpression());
            }
            else if (this.match("["))
            {
                this.expect("[");

                const propertyExpression = this.assignmentExpression();

                this.expect("]");

                expression = new MemberExpression(expression, propertyExpression);
            }
            else
            {
                break;
            }
        }

        return expression;
    }

    private objectExpression(): ObjectExpression
    {
        this.expect("{");

        const properties: Array<PropertyExpression> = [];
        while (!this.match("}"))
        {
            if (this.match("..."))
            {
                for (const [key, value] of Object.entries(this.spreadExpression().evaluate() || {}))
                {
                    properties.push(new PropertyExpression(new ConstantExpression(key), new ConstantExpression(value)));
                }
            }
            else
            {
                properties.push(this.objectPropertyExpression());
            }

            if (!this.match("}"))
            {
                this.expect(",");
            }
        }

        this.expect("}");

        return new ObjectExpression(properties);
    }

    private objectPropertyExpression(): PropertyExpression
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
            const token = this.lookahead;

            switch (token.type)
            {
                case Token.Identifier:
                case Token.StringLiteral:
                case Token.NumericLiteral:
                case Token.BooleanLiteral:
                case Token.NullLiteral:
                    key = new ConstantExpression(this.nextToken().value);
                    break;
                case Token.Punctuator:
                    if (token.value == "[")
                    {
                        this.expect("[");

                        key = this.assignmentExpression();

                        this.expect("]");
                    }
                    else
                    {
                        throw this.unexpectedTokenError(token);
                    }
                    break;
                default:
                    throw this.unexpectedTokenError(token);
            }
        }

        this.nextToken();

        value = this.assignmentExpression();
        return new PropertyExpression(key, value);
    }

    private match(value: string): boolean
    {
        return this.lookahead.type === Token.Punctuator && this.lookahead.value === value;
    }

    private matchKeyword(value: string): boolean
    {
        return this.lookahead.type === Token.Keyword && this.lookahead.value === value;
    }

    private nextToken(): RawToken
    {
        const token = this.lookahead;
        this.lookahead = this.scanner.nextToken();
        return token;
    }

    private nextRegexToken(): RawToken
    {
        const token = this.scanner.scanRegex();

        this.nextToken();

        return token;
    }

    private parseExpression(): IExpression
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
                return this.assignmentExpression();
            case Token.Punctuator:
                if
                (
                    this.lookahead.value == "("
                    || this.lookahead.value == "{"
                    || this.lookahead.value == "["
                    || this.lookahead.value == "/"
                    || this.lookahead.value == "!"
                    || this.lookahead.value == "+"
                    || this.lookahead.value == "-"
                    || this.lookahead.value == "^"
                    || this.lookahead.value == "~"
                    || this.lookahead.value == "++"
                    || this.lookahead.value == "--"
                    || this.lookahead.value == "!!"
                )
                {
                    return this.assignmentExpression();
                }
                break;
            case Token.Keyword:
                if (this.lookahead.value == "this" || this.lookahead.value == "typeof")
                {
                    return this.assignmentExpression();
                }
                break;
            default:
                break;
        }

        throw new Error("Expression not supported");
    }

    private primaryExpression(): IExpression
    {
        switch (this.lookahead.type)
        {
            case Token.Keyword:
                if (this.matchKeyword("this"))
                {
                    return new IdentifierExpression(this.context, this.nextToken().value as string);
                }
                break;
            case Token.Identifier:
                if (this.lookahead.value == "undefined")
                {
                    return new ConstantExpression(undefined);
                }

                return new IdentifierExpression(this.context, this.nextToken().value as string);

            case Token.BooleanLiteral:
                return new ConstantExpression(this.nextToken().value);

            case Token.NumericLiteral:
            case Token.NullLiteral:
            case Token.StringLiteral:
            case Token.RegularExpression:
                return new ConstantExpression(this.nextToken().value);

            case Token.Punctuator:
                switch (this.lookahead.value)
                {
                    case "(":
                        return this.groupExpression();
                    case "[":
                        return this.arrayExpression();
                    case "{":
                        return this.objectExpression();
                    case "/":
                        this.scanner.backtrack(1);
                        return this.regexExpression();
                    default:
                        throw this.unexpectedTokenError(this.nextToken());
                }

            case Token.Template:
                return this.templateLiteralExpression();

            default:
                break;
        }

        throw this.unexpectedTokenError(this.nextToken());
    }

    private regexExpression(): IExpression
    {
        const token = this.nextRegexToken();
        return new RegexExpression(token.pattern as string, token.flags as string);
    }

    private spreadExpression(): IExpression
    {
        this.expect("...");
        return this.assignmentExpression();
    }

    private unaryExpression(): IExpression
    {
        if (this.match("+") || this.match("-") || this.match("~") || this.match("!") || this.matchKeyword("typeof"))
        {
            const token = this.nextToken();
            return new UnaryExpression(this.updateExpression(), token.value as string);
        }
        else
        {
            return this.updateExpression();
        }
    }

    private templateLiteralExpression(): IExpression
    {
        const quasis:      Array<string>    = [];
        const expressions: Array<IExpression> = [];

        let token = this.nextToken();
        quasis.push(token.value as string);

        while (!!!token.tail)
        {
            expressions.push(this.assignmentExpression());
            token = this.nextToken();
            quasis.push(token.value as string);
        }

        return new TemplateLiteralExpression(quasis, expressions);
    }

    private updateExpression(): IExpression
    {
        if (this.match("++") || this.match("--"))
        {
            const operator = this.nextToken().raw;
            return new UpdateExpression(this.leftHandSideExpression(), operator, true);
        }
        else
        {
            const expression = this.leftHandSideExpression();

            if (this.match("++") || this.match("--"))
            {
                const operator = this.nextToken().raw;
                return new UpdateExpression(expression, operator, false);
            }

            return expression;
        }
    }

    private unexpectedTokenError(token: Object, message?: string): Error
    {
        return new Error(message);
    }
}