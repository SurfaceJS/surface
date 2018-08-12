import IExpression                                       from "../interfaces/expression";
import SyntaxError                                       from "../syntax-error";
import { BinaryOperator, UnaryOperator, UpdateOperator } from "../types";
import ArrayExpression                                   from "./expressions/array-expression";
import BinaryExpression                                  from "./expressions/binary-expression";
import CallExpression                                    from "./expressions/call-expression";
import ConditionalExpression                             from "./expressions/conditional-expression";
import ConstantExpression                                from "./expressions/constant-expression";
import IdentifierExpression                              from "./expressions/identifier-expression";
import MemberExpression                                  from "./expressions/member-expression";
import ObjectExpression                                  from "./expressions/object-expression";
import PropertyExpression                                from "./expressions/property-expression";
import RegexExpression                                   from "./expressions/regex-expression";
import TemplateExpression                                from "./expressions/template-expression";
import UnaryExpression                                   from "./expressions/unary-expression";
import UpdateExpression                                  from "./expressions/update-expression";
import Scanner, { Token }                                from "./scanner";
import TokenType                                         from "./token-type";

export default class Parser
{
    private readonly context: Object;
    private readonly scanner: Scanner;
    private lookahead: Token;

    private constructor(source: string, context: Object)
    {
        this.context   = context;
        this.scanner   = new Scanner(source);
        this.lookahead = this.scanner.nextToken();
    }

    public static parse(source: string, context: Object): IExpression
    {
        return new Parser(source, context).parseExpression();
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
        let elements: Array<IExpression> = [];

        this.expect("[");

        while (!this.match("]"))
        {
            if (this.match(","))
            {
                elements = [...elements, new ConstantExpression(undefined)];
                this.nextToken();
            }

            if (this.match("..."))
            {
                for (const value of this.spreadExpression().evaluate() as Iterable<Object>)
                {
                    elements.push(new ConstantExpression(value));
                }
            }
            else if (!this.match("]"))
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

            const stack: [IExpression, string, IExpression] = [left, token.raw, right];
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
                    stack.push(new BinaryExpression(left, right, operator as BinaryOperator));
                }

                stack.push(this.nextToken().raw);
                precedences.push(precedence);
                stack.push(this.exponentiationExpression());
            }

            let i = stack.length - 1;
            expression = stack[i] as IExpression;

            while (i > 1)
            {
                expression = new BinaryExpression(stack[i - 2] as IExpression, expression, stack[i - 1] as BinaryOperator);
                i -= 2;
            }
        }
        return expression;
    }

    private binaryPrecedence(token: Token): number
    {
        const operator = token.raw;

        if (token.type == TokenType.Punctuator)
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
        else if (token.type == TokenType.Keyword)
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

        /* istanbul ignore if */
        if (token.type !== TokenType.Punctuator || token.raw !== value)
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
            return new BinaryExpression(expression, this.assignmentExpression(), operator as BinaryOperator);
        }

        return expression;
    }

    private expression(): IExpression
    {
        const expression = this.assignmentExpression();

        if (this.lookahead.type != TokenType.EOF)
        {
            throw this.unexpectedTokenError(this.lookahead);
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

                if (this.lookahead.type == TokenType.Identifier)
                {
                    expression = new MemberExpression(parentExpression, new ConstantExpression(this.nextToken().value));
                }
                else
                {
                    throw this.unexpectedTokenError(this.nextToken());
                }

            }
            else if (this.match("("))
            {
                expression = new CallExpression(parentExpression, (expression as MemberExpression).key.evaluate() as string, this.argumentsExpression());
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
                for (const [key, value] of Object.entries(this.spreadExpression().evaluate() as Object))
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

        if (token.type == TokenType.Identifier)
        {
            key = new ConstantExpression(token.raw);
            this.nextToken();

            if (!this.match(":"))
            {
                return new PropertyExpression(key, new IdentifierExpression(this.context, token.raw));
            }
        }
        else
        {
            const token = this.lookahead;

            switch (token.type)
            {
                case TokenType.StringLiteral:
                case TokenType.NumericLiteral:
                case TokenType.BooleanLiteral:
                case TokenType.NullLiteral:
                    key = new ConstantExpression(this.nextToken().value);
                    break;
                case TokenType.Punctuator:
                    if (token.raw == "[")
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
        return this.lookahead.type === TokenType.Punctuator && this.lookahead.raw === value;
    }

    private matchKeyword(value: string): boolean
    {
        return this.lookahead.type === TokenType.Keyword && this.lookahead.raw === value;
    }

    private nextToken(): Token
    {
        const token = this.lookahead;
        this.lookahead = this.scanner.nextToken();
        return token;
    }

    private nextRegexToken(): Token
    {
        const token = this.scanner.scanRegex();

        this.nextToken();

        return token;
    }

    private parseExpression(): IExpression
    {
        switch (this.lookahead.type)
        {
            case TokenType.StringLiteral:
            case TokenType.NumericLiteral:
            case TokenType.BooleanLiteral:
            case TokenType.NullLiteral:
            case TokenType.RegularExpression:
            case TokenType.Template:
            case TokenType.Identifier:
                return this.expression();
            case TokenType.Punctuator:
                if
                (
                    this.lookahead.raw == "("
                    || this.lookahead.raw == "{"
                    || this.lookahead.raw == "["
                    || this.lookahead.raw == "/"
                    || this.lookahead.raw == "!"
                    || this.lookahead.raw == "+"
                    || this.lookahead.raw == "-"
                    || this.lookahead.raw == "^"
                    || this.lookahead.raw == "~"
                    || this.lookahead.raw == "++"
                    || this.lookahead.raw == "--"
                )
                {
                    return this.expression();
                }
                break;
            case TokenType.Keyword:
                if (this.lookahead.raw == "this" || this.lookahead.raw == "typeof")
                {
                    return this.expression();
                }
                break;
            default:
                break;
        }

        throw this.unexpectedTokenError(this.lookahead);
    }

    private primaryExpression(): IExpression
    {
        switch (this.lookahead.type)
        {
            case TokenType.Keyword:
                if (this.matchKeyword("this"))
                {
                    return new IdentifierExpression(this.context, this.nextToken().raw);
                }
                break;
            case TokenType.Identifier:
                if (this.lookahead.raw == "undefined")
                {
                    return new ConstantExpression(this.nextToken().value);
                }

                return new IdentifierExpression(this.context, this.nextToken().raw);

            case TokenType.BooleanLiteral:
                return new ConstantExpression(this.nextToken().value);

            case TokenType.NumericLiteral:
            case TokenType.NullLiteral:
            case TokenType.StringLiteral:
            case TokenType.RegularExpression:
                return new ConstantExpression(this.nextToken().value);

            case TokenType.Punctuator:
                switch (this.lookahead.raw)
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

            case TokenType.Template:
                return this.templateLiteralExpression();
            /* istanbul ignore next */
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
            return new UnaryExpression(this.updateExpression(), token.raw as UnaryOperator);
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

        return new TemplateExpression(quasis, expressions);
    }

    private updateExpression(): IExpression
    {
        if (this.match("++") || this.match("--"))
        {
            const operator = this.nextToken().raw as UpdateOperator;
            return new UpdateExpression(this.leftHandSideExpression(), operator, true);
        }
        else
        {
            const expression = this.leftHandSideExpression();

            if (this.match("++") || this.match("--"))
            {
                const operator = this.nextToken().raw as UpdateOperator;
                return new UpdateExpression(expression, operator, false);
            }

            return expression;
        }
    }

    private unexpectedTokenError(token: Token): Error
    {
        let unexpected = `token ${token.raw}`;

        switch (token.type)
        {
            case TokenType.StringLiteral:
                unexpected = "string";
                break;
            case TokenType.NumericLiteral:
                unexpected = "number";
            case TokenType.EOF:
                unexpected = "end of expression";
            default:
                break;
        }

        return new SyntaxError(`Unexpected ${unexpected}`, token.lineNumber, token.start, token.start - token.lineStart + 1);
    }
}