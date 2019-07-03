import { Indexer, Nullable } from "@surface/core";
import IExpression           from "../interfaces/expression";
import INode                 from "../interfaces/node";
import IPattern              from "../interfaces/pattern";
import NodeType              from "../node-type";
import SyntaxError           from "../syntax-error";
import
{
    AssignmentOpertaror,
    BinaryOperator,
    PatternElement,
    LogicalOperator,
    UnaryOperator,
    UpdateOperator,
} from "../types";
import Parameter             from "./elements/parameter";
import Property              from "./elements/property";
import SpreadElement         from "./elements/spread-element";
import ArrayExpression       from "./expressions/array-expression";
import AssignmentExpression  from "./expressions/assignment-expression";
import BinaryExpression      from "./expressions/binary-expression";
import CallExpression        from "./expressions/call-expression";
import ConditionalExpression from "./expressions/conditional-expression";
import ConstantExpression    from "./expressions/constant-expression";
import IdentifierExpression  from "./expressions/identifier-expression";
import LambdaExpression      from "./expressions/lambda-expression";
import LogicalExpression     from "./expressions/logical-expression";
import MemberExpression      from "./expressions/member-expression";
import NewExpression         from "./expressions/new-expression";
import ObjectExpression      from "./expressions/object-expression";
import RegexExpression       from "./expressions/regex-expression";
import SequenceExpression    from "./expressions/sequence-expression";
import TemplateExpression    from "./expressions/template-expression";
import UnaryExpression       from "./expressions/unary-expression";
import UpdateExpression      from "./expressions/update-expression";
import Messages              from "./messages";
import ArrayPattern          from "./patterns/array-pattern";
import ObjectPattern         from "./patterns/object-pattern";
import RestElement           from "./patterns/rest-element";
import Scanner, { Token }    from "./scanner";
import TokenType             from "./token-type";

export default class Parser
{
    private readonly context: Indexer;
    private readonly scanner: Scanner;

    private invalidInitialization: Nullable<Token>;
    private lookahead:             Token;

    private constructor(source: string, context: Indexer)
    {
        this.context               = context;
        this.scanner               = new Scanner(source);
        this.lookahead             = this.scanner.nextToken();
        this.invalidInitialization = null;
    }

    public static parse(source: string, context: object): IExpression
    {
        return new Parser(source, context as Indexer).parseExpression();
    }

    private argumentsExpression(): Array<IExpression|SpreadElement>
    {
        this.expect("(");

        const args: Array<IExpression|SpreadElement> = [];

        if (!this.match(")"))
        {
            while (true)
            {
                const expression = this.inheritGrammar(this.match("...") ? this.spreadExpression : this.assignmentExpression);

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

    private arrayPattern(): ArrayPattern
    {
        const elements: Array<PatternElement> = [];

        this.expect("[");

        while (!this.match("]"))
        {
            if (this.match("..."))
            {
                this.expect("...");

                elements.push(new RestElement(this.inheritGrammar(this.pattern, false)));

                if (!this.match("]"))
                {
                    throw this.syntaxError(Messages.restParameterMustBeLastFormalParameter);
                }
            }
            else if (this.match("["))
            {
                elements.push(this.inheritGrammar(this.arrayPattern));
            }
            else if (this.match("{"))
            {
                elements.push(this.inheritGrammar(this.objectDestructureExpression));
            }
            else
            {
                elements.push(this.reinterpretPattern(this.inheritGrammar(this.assignmentExpression)) as PatternElement);
            }

            if (!this.match("]"))
            {
                this.expect(",");
            }
        }

        this.expect("]");

        return new ArrayPattern(elements);
    }

    private arrayExpression(): IExpression
    {
        const elements: Array<IExpression|SpreadElement> = [];

        this.expect("[");

        while (!this.match("]"))
        {
            if (this.match(","))
            {
                elements.push(new ConstantExpression(undefined));
                this.nextToken();
            }

            if (this.match("..."))
            {
                elements.push(this.inheritGrammar(this.spreadExpression));
            }
            else if (!this.match("]"))
            {
                elements.push(this.inheritGrammar(this.assignmentExpression));
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
        const left = this.inheritGrammar(this.conditionalExpression);

        const isAssignment = this.match("=")
            || this.match("*=")
            || this.match("**=")
            || this.match("/=")
            || this.match("%=")
            || this.match("+=")
            || this.match("-=")
            || this.match("<<=")
            || this.match(">>=")
            || this.match(">>>=")
            || this.match("&=")
            || this.match("^=")
            || this.match("|=");

        if (isAssignment)
        {
            const token = this.nextToken();

            const right = this.isolateGrammar(this.assignmentExpression);

            return new AssignmentExpression(left, right, token.raw as AssignmentOpertaror);
        }
        else
        {
            return left;
        }
    }

    private binaryExpression(): IExpression
    {
        let expression = this.inheritGrammar(this.exponentiationExpression);

        let precedence = this.binaryPrecedence(this.lookahead);

        if (precedence > 0)
        {
            const token = this.nextToken();

            let left  = expression;
            let right = this.isolateGrammar(this.exponentiationExpression);

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
                stack.push(this.isolateGrammar(this.exponentiationExpression));
            }

            let i = stack.length - 1;
            expression = stack[i] as IExpression;

            while (i > 1)
            {
                const operator = stack[i - 1] as BinaryOperator|LogicalOperator;
                if (operator == "&&" || operator == "||" )
                {
                    expression = new LogicalExpression(stack[i - 2] as IExpression, expression, operator);
                }
                else
                {
                    expression = new BinaryExpression(stack[i - 2] as IExpression, expression, operator);
                }
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
        let expression =  this.inheritGrammar(this.binaryExpression);

        if (this.match("?"))
        {
            this.expect("?");

            const truthyExpression = this.isolateGrammar(this.assignmentExpression);

            this.expect(":");

            const falsyExpression = this.isolateGrammar(this.assignmentExpression);

            expression = new ConditionalExpression(expression, truthyExpression, falsyExpression);
        }

        return expression;
    }

    private pattern(root: boolean): IPattern
    {
        if (this.match("["))
        {
            return this.isolateGrammar(this.arrayPattern);
        }
        else if (this.match("{"))
        {
            return this.isolateGrammar(this.objectDestructureExpression);
        }
        else
        {
            const expression = this.isolateGrammar(this.assignmentExpression);

            if (!root && expression.type == NodeType.Assignment)
            {
                throw this.syntaxError(Messages.invalidDestructuringAssignmentTarget);
            }

            return this.reinterpretPattern(expression);
        }
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
        const expression = this.inheritGrammar(this.unaryExpression);

        if (this.match("**"))
        {
            const operator = this.nextToken().raw;
            return new BinaryExpression(expression, this.isolateGrammar(this.assignmentExpression), operator as BinaryOperator);
        }

        return expression;
    }

    private expression(): IExpression
    {
        const expression = this.isolateGrammar(this.assignmentExpression);

        if (this.lookahead.type != TokenType.EOF)
        {
            throw this.unexpectedTokenError(this.lookahead);
        }

        return expression;
    }

    // tslint:disable-next-line:no-any
    private inheritGrammar<TParser extends (...args: Array<any>) => any>(parser: TParser, ...args: Parameters<TParser>): ReturnType<TParser>
    {
        const invalidInitialization = this.invalidInitialization;

        this.invalidInitialization = null;

        const expression = parser.call(this, ...args);

        this.invalidInitialization = invalidInitialization || this.invalidInitialization;

        return expression;
    }

    // tslint:disable-next-line:no-any
    private isolateGrammar<TParser extends (...args: Array<any>) => any>(parser: TParser, ...args: Parameters<TParser>): ReturnType<TParser>
    {
        const invalidInitialization = this.invalidInitialization;

        this.invalidInitialization = null;

        const expression = parser.call(this, ...args);

        if (this.invalidInitialization)
        {
            throw this.unexpectedTokenError(this.invalidInitialization);
        }

        this.invalidInitialization = invalidInitialization || this.invalidInitialization;

        return expression;
    }

    private groupExpression(): IExpression
    {
        this.expect("(");

        if (this.match(")"))
        {
            this.expect(")");

            if (this.match("=>"))
            {
                this.expect("=>");

                const body = this.isolateGrammar(this.assignmentExpression);

                return new LambdaExpression(this.context, [], body);
            }

            throw this.unexpectedTokenError(this.lookahead);
        }
        else
        {
            const expressions: Array<INode> = [];

            if (this.match("..."))
            {
                expressions.push((this.inheritGrammar(this.restElement)));
            }
            else
            {
                expressions.push(this.inheritGrammar(this.assignmentExpression));

                if (this.match(","))
                {
                    while (true)
                    {
                        if (this.match(","))
                        {
                            this.expect(",");

                            if (this.match("..."))
                            {
                                expressions.push((this.inheritGrammar(this.restElement)));
                            }
                            else
                            {
                                expressions.push(this.isolateGrammar(this.assignmentExpression));
                            }
                        }
                        else
                        {
                            break;
                        }
                    }
                }

                this.expect(")");
            }

            if (this.match("=>"))
            {
                this.invalidInitialization = null;

                const parameters = expressions.map(x => new Parameter(this.reinterpretPattern(x) as PatternElement));

                this.expect("=>");

                const body = this.inheritGrammar(this.assignmentExpression);

                return new LambdaExpression(this.context, parameters, body);

            }
            else if (expressions.length > 1)
            {
                return new SequenceExpression(expressions as Array<IExpression>);
            }

            return expressions[0] as IExpression;
        }
    }

    private leftHandSideExpression(allowCall: boolean): IExpression
    {
        let expression = this.inheritGrammar(this.matchKeyword("new") ? this.newPrimaryExpression : this.primaryExpression);
        let parentExpression = expression;

        while (true)
        {
            if (this.match("."))
            {
                parentExpression = expression;
                this.expect(".");

                if (this.lookahead.type == TokenType.Identifier || this.lookahead.type == TokenType.Keyword)
                {
                    expression = new MemberExpression(parentExpression, new ConstantExpression(this.nextToken().value), false);
                }
                else
                {
                    throw this.unexpectedTokenError(this.lookahead);
                }

            }
            else if (this.match("["))
            {
                this.expect("[");

                const propertyExpression = this.isolateGrammar(this.assignmentExpression);

                this.expect("]");

                expression = new MemberExpression(expression, propertyExpression, true);
            }
            else if (this.match("("))
            {
                if (!allowCall)
                {
                    return expression;
                }

                const context = expression instanceof IdentifierExpression ?
                    new ConstantExpression(expression.context)
                    : parentExpression;

                expression = new CallExpression(context, expression, this.isolateGrammar(this.argumentsExpression));
            }
            else
            {
                break;
            }
        }

        return expression;
    }

    private objectDestructureExpression(): ObjectPattern
    {
        const entries: Array<Property|RestElement> = [];

        this.expect("{");

        while (!this.match("}"))
        {
            if (this.match("..."))
            {
                this.expect("...");

                const expression = this.inheritGrammar(this.leftHandSideExpression, false);

                if (expression.type != NodeType.Identifier)
                {
                    throw this.syntaxError(Messages.restOperatorMustBeFollowedByAnIdentifierInDeclarationContexts);
                }

                entries.push(new RestElement(expression));

                if (!this.match("}"))
                {
                    throw this.syntaxError(Messages.restParameterMustBeLastFormalParameter);
                }
            }
            else
            {
                entries.push(this.reinterpretPattern(this.inheritGrammar(this.objectPropertyExpression)) as Property);
            }

            if (!this.match("}"))
            {
                this.expect(",");
            }
        }

        this.expect("}");

        return new ObjectPattern(entries);
    }

    private objectExpression(): ObjectExpression
    {
        this.expect("{");

        const properties: Array<Property|SpreadElement> = [];

        while (!this.match("}"))
        {
            if (this.match("..."))
            {
                properties.push(this.inheritGrammar(this.spreadExpression));
            }
            else
            {
                properties.push(this.inheritGrammar(this.objectPropertyExpression));
            }

            if (!this.match("}"))
            {
                this.expect(",");
            }
        }

        this.expect("}");

        return new ObjectExpression(properties);
    }

    private objectPropertyExpression(): Property
    {
        const token = this.lookahead;

        let key:   IExpression;
        let value: IExpression;

        let computed = false;

        if (token.type == TokenType.Identifier)
        {
            key = new ConstantExpression(token.raw);

            this.nextToken();

            if (this.match("="))
            {
                const invalidInitialization = this.lookahead;

                this.expect("=");

                const value = this.isolateGrammar(this.assignmentExpression);

                this.invalidInitialization = invalidInitialization;

                return new Property(key, new AssignmentExpression(new IdentifierExpression({ }, token.raw), value, "="), computed, true);
            }

            if (!this.match(":"))
            {
                return new Property(key, new IdentifierExpression(this.context, token.raw), false, true);
            }
        }
        else
        {
            const token = this.lookahead;

            switch (token.type)
            {
                case TokenType.BooleanLiteral:
                case TokenType.Keyword:
                case TokenType.NullLiteral:
                case TokenType.NumericLiteral:
                case TokenType.StringLiteral:
                    key = new ConstantExpression(this.nextToken().value);
                    break;
                case TokenType.Punctuator:
                    if (token.raw == "[")
                    {
                        this.expect("[");

                        key = this.inheritGrammar(this.assignmentExpression);

                        this.expect("]");

                        computed = true;
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

        this.expect(":");

        value = this.isolateGrammar(this.assignmentExpression);
        return new Property(key, value, computed, false);
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

    private newPrimaryExpression(): IExpression
    {
        const token = this.nextToken();

        if (token.type != TokenType.Identifier)
        {
            this.unexpectedTokenError(token);
        }

        const callee = this.inheritGrammar(this.leftHandSideExpression, false);

        const args = this.match("(") ? this.isolateGrammar(this.argumentsExpression) : [];

        return new NewExpression(callee, args);
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
                if (this.lookahead.raw == "new" || this.lookahead.raw == "this" || this.lookahead.raw == "typeof")
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

                const indentifier = new IdentifierExpression(this.context, this.nextToken().raw);

                if (this.match("=>"))
                {
                    this.expect("=>");

                    return new LambdaExpression(this.context, [new Parameter(indentifier)], this.inheritGrammar(this.assignmentExpression));
                }
                else
                {
                    return indentifier;
                }

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
                        return this.inheritGrammar(this.groupExpression);
                    case "[":
                        return this.inheritGrammar(this.arrayExpression);
                    case "{":
                        return this.inheritGrammar(this.objectExpression);
                    case "/":
                        this.scanner.backtrack(1);
                        return this.inheritGrammar(this.regexExpression);
                    default:
                        throw this.unexpectedTokenError(this.lookahead);
                }

            case TokenType.Template:
                return this.inheritGrammar(this.templateLiteralExpression);
            /* istanbul ignore next */
            default:
                break;
        }

        throw this.unexpectedTokenError(this.lookahead);
    }

    // tslint:disable-next-line:cyclomatic-complexity
    private reinterpretPattern(expression: INode): INode
    {
        switch (expression.type)
        {
            case NodeType.Identifier:
            case NodeType.ArrayPattern:
            case NodeType.ObjectPattern:
            case NodeType.Rest:
                return expression;
            case NodeType.Assignment:
                if ((expression as AssignmentExpression).left.type != NodeType.Identifier)
                {
                    throw this.syntaxError(Messages.illegalPropertyInDeclarationContext);
                }

                return expression;
            case NodeType.Property:
                if (!(expression as Property).shorthand && (expression as Property).value.type != NodeType.Identifier && (expression as Property).value.type != NodeType.Object)
                {
                    break;
                }
                else if ((expression as Property).value.type == NodeType.Object)
                {
                    (expression as Property).value = this.reinterpretPattern((expression as Property).value) as IExpression;
                }

                return expression;

            case NodeType.Array:
            {
                let elements: Array<PatternElement> = [];

                let index = 0;
                for (const element of (expression as ArrayExpression).elements)
                {
                    if (element.type == NodeType.Spread && index < (expression as ArrayExpression).elements.length - 1)
                    {
                        throw this.syntaxError(Messages.restParameterMustBeLastFormalParameter);
                    }

                    elements.push(this.reinterpretPattern(element) as PatternElement);

                    index++;
                }

                return new ArrayPattern(elements);
            }
            case NodeType.Object:
            {
                let entries: Array<Property|RestElement> = [];

                let index = 0;
                for (const property of (expression as ObjectExpression).properties)
                {
                    if (property.type == NodeType.Spread && index < (expression as ObjectExpression).properties.length - 1)
                    {
                        throw this.syntaxError(Messages.restParameterMustBeLastFormalParameter);
                    }

                    entries.push(this.reinterpretPattern(property) as Property|RestElement);

                    index++;
                }

                return new ObjectPattern(entries);
            }
            case NodeType.Spread:
                if ((expression as SpreadElement).argument.type == NodeType.Assignment)
                {
                    throw this.syntaxError(Messages.invalidDestructuringAssignmentTarget);
                }
                else if ((expression as SpreadElement).argument.type != NodeType.Identifier)
                {
                    throw this.syntaxError(Messages.restOperatorMustBeFollowedByAnIdentifierInDeclarationContexts);
                }

                return new RestElement(this.reinterpretPattern((expression as SpreadElement).argument));
            default:
                break;
        }

        throw this.unexpectedTokenError(this.lookahead);
    }

    private regexExpression(): IExpression
    {
        const token = this.nextRegexToken();
        return new RegexExpression(token.pattern as string, token.flags as string);
    }

    private restElement(): RestElement
    {
        this.expect("...");

        const expression = this.isolateGrammar(this.pattern, true);

        if (expression.type == NodeType.Assignment)
        {
            throw this.syntaxError(Messages.restParameterMayNotHaveAdefaultInitializer);
        }

        if (!this.match(")"))
        {
            throw this.syntaxError(Messages.restParameterMustBeLastFormalParameter);
        }

        this.expect(")");

        return new RestElement(expression);
    }

    private spreadExpression(): SpreadElement
    {
        this.expect("...");

        return new SpreadElement(this.inheritGrammar(this.assignmentExpression));
    }

    private syntaxError(message: string): Error
    {
        return new SyntaxError(message, this.lookahead.lineNumber, this.lookahead.start, this.lookahead.start - this.lookahead.lineStart + 1);
    }

    private unaryExpression(): IExpression
    {
        if (this.match("+") || this.match("-") || this.match("~") || this.match("!") || this.matchKeyword("typeof"))
        {
            const token = this.nextToken();
            return new UnaryExpression(this.inheritGrammar(this.updateExpression), token.raw as UnaryOperator);
        }
        else
        {
            return this.inheritGrammar(this.updateExpression);
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
            expressions.push(this.inheritGrammar(this.assignmentExpression));
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
            return new UpdateExpression(this.inheritGrammar(this.leftHandSideExpression, true), operator, true);
        }
        else
        {
            const expression = this.inheritGrammar(this.leftHandSideExpression, true);

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
        let message: string;

        switch (token.type)
        {
            case TokenType.StringLiteral:
                message = Messages.unexpectedString;
                break;
            case TokenType.NumericLiteral:
                message = Messages.unexpectedNumber;
                break;
            case TokenType.EOF:
                message = Messages.unexpectedEndOfExpression;
                break;
            default:
                message = `${Messages.unexpectedToken} ${token.raw}`;
                break;
        }

        return new SyntaxError(message, token.lineNumber, token.start, token.start - token.lineStart + 1);
    }
}