/* eslint-disable max-lines */
/* eslint-disable complexity */
/* eslint-disable max-statements */

import { format }               from "@surface/core";
import AssignmentProperty       from "./elements/assignment-property.js";
import Property                 from "./elements/property.js";
import SpreadElement            from "./elements/spread-element.js";
import TemplateElement          from "./elements/template-element.js";
import ArrayExpression          from "./expressions/array-expression.js";
import ArrowFunctionExpression  from "./expressions/arrow-function-expression.js";
import AssignmentExpression     from "./expressions/assignment-expression.js";
import BinaryExpression         from "./expressions/binary-expression.js";
import CallExpression           from "./expressions/call-expression.js";
import ChainExpression          from "./expressions/chain-expression.js";
import ConditionalExpression    from "./expressions/conditional-expression.js";
import Identifier               from "./expressions/identifier.js";
import Literal                  from "./expressions/literal.js";
import LogicalExpression        from "./expressions/logical-expression.js";
import MemberExpression         from "./expressions/member-expression.js";
import NewExpression            from "./expressions/new-expression.js";
import ObjectExpression         from "./expressions/object-expression.js";
import ParenthesizedExpression  from "./expressions/parenthesized-expression.js";
import SequenceExpression       from "./expressions/sequence-expression.js";
import TaggedTemplateExpression from "./expressions/tagged-template-expression.js";
import TemplateLiteral          from "./expressions/template-literal.js";
import ThisExpression           from "./expressions/this-expression.js";
import UnaryExpression          from "./expressions/unary-expression.js";
import UpdateExpression         from "./expressions/update-expression.js";
import type IExpression         from "./interfaces/expression.js";
import type INode               from "./interfaces/node.js";
import type IPattern            from "./interfaces/pattern.js";
import Messages                 from "./messages.js";
import NodeType                 from "./node-type.js";
import ArrayPattern             from "./patterns/array-pattern.js";
import AssignmentPattern        from "./patterns/assignment-pattern.js";
import ObjectPattern            from "./patterns/object-pattern.js";
import RestElement              from "./patterns/rest-element.js";
import Scanner                  from "./scanner.js";
import SyntaxError              from "./syntax-error.js";
import TokenType                from "./token-type.js";
import TypeGuard                from "./type-guard.js";
import type
{
    AssignmentOperator,
    BinaryOperator,
    LiteralValue,
    LogicalOperator,
    UnaryOperator,
    UpdateOperator,
} from "./types/operators";
import type Token from "./types/token";

type DupeCheck = (identifier: Identifier, token: Token) => Identifier;

export default class Parser
{
    private readonly scanner: Scanner;

    private invalidInitialization: Token | null;
    private lookahead:             Token;

    private constructor(source: string)
    {
        this.scanner               = new Scanner(source);
        this.lookahead             = this.scanner.nextToken();
        this.invalidInitialization = null;
    }

    public static parse(source: string): IExpression
    {
        return new Parser(source).parseExpression();
    }

    private createDupeChecker(): DupeCheck
    {
        const identifiers = new Set<string>();

        return (identifier, token) =>
        {
            if (identifiers.has(identifier.name))
            {
                throw this.syntaxError(token, Messages.duplicateParameterNameNotAllowedInThisContext);
            }

            identifiers.add(identifier.name);

            return identifier;
        };
    }

    private arguments(): (IExpression | SpreadElement)[]
    {
        this.expect("(");

        const args: (IExpression | SpreadElement)[] = [];

        if (!this.match(")"))
        {
            // eslint-disable-next-line no-constant-condition
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
        const elements: (IPattern | null)[] = [];
        const checker = this.createDupeChecker();

        this.expect("[");

        while (!this.match("]"))
        {
            if (this.match(","))
            {
                elements.push(null);
                this.nextToken();
            }

            const lookahead = this.lookahead;

            if (this.match("..."))
            {
                this.expect("...");

                elements.push(new RestElement(this.inheritGrammar(this.pattern, false)));

                if (!this.match("]"))
                {
                    throw this.syntaxError(this.lookahead, Messages.restParameterMustBeLastFormalParameter);
                }
            }
            else if (this.match("["))
            {
                elements.push(this.inheritGrammar(this.arrayPattern));
            }
            else if (this.match("{"))
            {
                elements.push(this.inheritGrammar(this.objectPattern));
            }
            else
            {
                elements.push(this.reinterpret(this.inheritGrammar(this.assignmentExpression), lookahead, checker));
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
        const elements: (IExpression | SpreadElement | null)[] = [];

        this.expect("[");

        while (!this.match("]"))
        {
            if (this.match(","))
            {
                elements.push(null);
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

    private assignmentExpression(preventBlock?: boolean): IExpression
    {
        if (preventBlock && this.match("{"))
        {
            throw this.unexpectedTokenError(this.lookahead);
        }

        const lookahead = this.lookahead;

        const left = this.inheritGrammar(this.conditionalExpression);

        if (this.match("=>"))
        {
            this.expect("=>");

            return new ArrowFunctionExpression([this.reinterpret(left, lookahead, this.createDupeChecker())], this.inheritGrammar(this.assignmentExpression, true));
        }

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
            || this.match("|=")
            || this.match("&&=")
            || this.match("||=")
            || this.match("??=");

        if (isAssignment)
        {
            if (!TypeGuard.isIdentifier(left) && !TypeGuard.isMemberExpression(left))
            {
                throw this.syntaxError(lookahead, Messages.invalidLeftHandSideInAssignment);
            }

            const token = this.nextToken();

            const right = this.isolateGrammar(this.assignmentExpression);

            return new AssignmentExpression(left, right, token.raw as AssignmentOperator);
        }

        return left;
    }

    private binaryExpression(): IExpression
    {
        const expression = this.inheritGrammar(this.exponentiationExpression);

        let precedence = this.binaryPrecedence(this.lookahead);

        if (precedence == 0)
        {
            return expression;
        }

        const left  = expression;
        const token = this.nextToken();
        const right = this.isolateGrammar(this.exponentiationExpression);

        const stack       = [left, token, right];
        const precedences = [precedence];

        // eslint-disable-next-line no-constant-condition
        while (true)
        {
            if (this.match("="))
            {
                throw this.syntaxError(this.lookahead, Messages.invalidLeftHandSideInAssignment);
            }

            if (this.match("=>"))
            {
                throw this.syntaxError(this.lookahead, Messages.malformedArrowFunctionParameterList);
            }

            precedence = this.binaryPrecedence(this.lookahead);

            if (precedence <= 0)
            {
                break;
            }

            let previousToken: Token | undefined;

            while (stack.length > 2 && precedence <= precedences[precedences.length - 1])
            {
                const right    = stack.pop() as IExpression;
                const token    = stack.pop() as Token;
                const operator = token.raw as BinaryOperator | LogicalOperator;
                const left     = stack.pop() as IExpression;

                if (left instanceof LogicalExpression && this.hasMixedCoalescingAndLogical(left.operator, operator))
                {
                    throw this.unexpectedTokenError(token);
                }
                else if (right instanceof LogicalExpression && this.hasMixedCoalescingAndLogical(right.operator, operator))
                {
                    throw this.unexpectedTokenError(previousToken!);
                }

                precedences.pop();

                const expression = operator == "&&" || operator == "||" || operator == "??"
                    ? new LogicalExpression(left, right, operator)
                    : new BinaryExpression(left, right, operator);

                stack.push(expression);

                previousToken = token;
            }

            stack.push(this.nextToken());

            precedences.push(precedence);

            stack.push(this.isolateGrammar(this.exponentiationExpression));
        }

        let previousToken: Token | undefined;

        let currentExpression = stack.pop() as IExpression;

        while (stack.length > 0)
        {
            const right    = currentExpression;
            const token    = stack.pop() as Token;
            const operator = token.raw as BinaryOperator | LogicalOperator;
            const left     = stack.pop() as IExpression;

            if (left instanceof LogicalExpression && this.hasMixedCoalescingAndLogical(left.operator, operator))
            {
                throw this.unexpectedTokenError(token);
            }
            else if (right instanceof LogicalExpression && this.hasMixedCoalescingAndLogical(right.operator, operator))
            {
                throw this.unexpectedTokenError(previousToken!);
            }

            currentExpression = operator == "&&" || operator == "||" || operator == "??"
                ? new LogicalExpression(left, right, operator)
                : new BinaryExpression(left, right, operator);

            previousToken = token;
        }

        return currentExpression;
    }

    private binaryPrecedence(token: Token): number
    {
        const operator = token.raw;

        if (token.type == TokenType.Punctuator)
        {
            switch (operator)
            {
                case "??":
                    return 1;

                case "||":
                    return 2;

                case "&&":
                    return 3;

                case "|":
                    return 4;

                case "^":
                    return 5;

                case "&":
                    return 6;

                case "==":
                case "!=":
                case "===":
                case "!==":
                    return 7;

                case "<":
                case ">":
                case "<=":
                case ">=":
                    return  8;

                case "<<":
                case ">>":
                case ">>>":
                    return 9;

                case "+":
                case "-":
                    return 10;

                case "*":
                case "/":
                case "%":
                    return 11;
                default:
                    return 0;
            }
        }
        else if (token.type == TokenType.Keyword)
        {
            return operator == "instanceof" || operator == "in" ? 7 : 0;
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
            return this.isolateGrammar(this.objectPattern);
        }

        const lookahead = this.lookahead;

        const expression = this.isolateGrammar(this.assignmentExpression);

        if (!root && expression.type == NodeType.AssignmentExpression)
        {
            throw this.syntaxError(lookahead, Messages.invalidDestructuringAssignmentTarget);
        }

        return this.reinterpret(expression, lookahead, this.createDupeChecker());
    }

    private expect(value: string): void
    {
        const token = this.nextToken();

        /* c8 ignore next 4 */
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

    private expression(preventBlock: boolean = false): IExpression
    {
        const expression = this.isolateGrammar(this.assignmentExpression, preventBlock);

        if (this.match(","))
        {
            const expressions = [expression];

            while (this.match(","))
            {
                this.expect(",");

                expressions.push(this.isolateGrammar(this.assignmentExpression));
            }

            return new SequenceExpression(expressions);
        }

        return expression;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private inheritGrammar<TParser extends (...args: any[]) => any>(parser: TParser, ...args: Parameters<TParser>): ReturnType<TParser>
    {
        const invalidInitialization = this.invalidInitialization;

        this.invalidInitialization = null;

        const expression = parser.call(this, ...args);

        this.invalidInitialization = invalidInitialization ?? this.invalidInitialization;

        return expression;
    }

    private isolateExpression(): IExpression
    {
        const expression = this.expression();

        if (this.lookahead.type != TokenType.EOF)
        {
            throw this.unexpectedTokenError(this.lookahead);
        }

        return expression;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private isolateGrammar<TParser extends (...args: any[]) => any>(parser: TParser, ...args: Parameters<TParser>): ReturnType<TParser>
    {
        const invalidInitialization = this.invalidInitialization;

        this.invalidInitialization = null;

        const expression = parser.call(this, ...args);

        if (this.invalidInitialization)
        {
            throw this.unexpectedTokenError(this.invalidInitialization);
        }

        this.invalidInitialization = invalidInitialization;

        return expression;
    }

    private hasMixedCoalescingAndLogical(previous: BinaryOperator | LogicalOperator, actual: BinaryOperator | LogicalOperator): boolean
    {
        return (previous == "&&" || previous == "||") && actual == "??" || (actual == "&&" || actual == "||") && previous == "??";
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

                const body = this.isolateGrammar(this.assignmentExpression, true);

                return new ArrowFunctionExpression([], body);
            }

            throw this.unexpectedTokenError(this.lookahead);
        }
        else
        {
            const expressions: INode[] = [];
            const tokens:  Token[] = [];

            if (this.match("..."))
            {
                tokens.push(this.lookahead);

                expressions.push(this.inheritGrammar(this.restElement));

                if (!this.match(")"))
                {
                    throw this.syntaxError(tokens[0], Messages.restParameterMustBeLastFormalParameter);
                }

                this.expect(")");
            }
            else
            {
                tokens.push(this.lookahead);

                expressions.push(this.inheritGrammar(this.assignmentExpression));

                if (this.match(","))
                {
                    // eslint-disable-next-line no-constant-condition
                    while (true)
                    {
                        if (this.match(","))
                        {
                            this.expect(",");

                            tokens.push(this.lookahead);

                            if (this.match("..."))
                            {
                                expressions.push(this.inheritGrammar(this.restElement));

                                if (!this.match(")"))
                                {
                                    throw this.syntaxError(tokens[tokens.length - 1], Messages.restParameterMustBeLastFormalParameter);
                                }

                                break;
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

                const checker = this.createDupeChecker();

                const parameters = expressions.map((x, i) => this.reinterpret(x, tokens[i], checker));

                this.expect("=>");

                const body = this.inheritGrammar(this.assignmentExpression, true);

                return new ArrowFunctionExpression(parameters, body);

            }
            else if (expressions.length > 1)
            {
                return new SequenceExpression(expressions as IExpression[]);
            }

            return new ParenthesizedExpression(expressions[0] as IExpression);
        }
    }

    private leftHandSideExpression(allowCall: boolean): IExpression
    {
        let expression        = this.inheritGrammar(this.matchKeyword("new") ? this.newPrimaryExpression : this.primaryExpression);
        let isChainExpression = false;

        // eslint-disable-next-line no-constant-condition
        while (true)
        {
            if (this.lookahead.type == TokenType.Template && this.lookahead.isHead)
            {
                const quasi = this.inheritGrammar(this.templateLiteralExpression);

                expression = new TaggedTemplateExpression(expression, quasi);
            }
            else if (this.match("."))
            {
                this.expect(".");

                if (this.lookahead.type == TokenType.Identifier || this.lookahead.type == TokenType.Keyword)
                {
                    expression = new MemberExpression(expression, new Identifier(this.nextToken().raw), false, false);
                }
                else
                {
                    throw this.unexpectedTokenError(this.lookahead);
                }
            }
            else
            {
                const optional = this.match("?.");

                if (optional)
                {
                    isChainExpression = true;

                    this.nextToken();
                }

                if (this.match("["))
                {
                    this.expect("[");

                    const propertyExpression = this.isolateGrammar(this.expression);

                    this.expect("]");

                    expression = new MemberExpression(expression, propertyExpression, true, optional);
                }
                else if (this.match("("))
                {
                    if (!allowCall)
                    {
                        return expression;
                    }

                    expression = new CallExpression(expression, this.isolateGrammar(this.arguments), optional);
                }
                else if (optional)
                {
                    if (this.lookahead.type == TokenType.Identifier || this.lookahead.type == TokenType.Keyword)
                    {
                        expression = new MemberExpression(expression, new Identifier(this.nextToken().raw), false, true);
                    }
                    else
                    {
                        throw this.unexpectedTokenError(this.lookahead);
                    }
                }
                else
                {
                    break;
                }
            }
        }

        return isChainExpression ? new ChainExpression(expression) : expression;
    }

    private objectPattern(): ObjectPattern
    {
        const entries: (AssignmentProperty | RestElement)[] = [];
        const checker = this.createDupeChecker();

        this.expect("{");

        while (!this.match("}"))
        {
            if (this.match("..."))
            {
                this.expect("...");

                const lookahead = this.lookahead;

                const expression = this.inheritGrammar(this.leftHandSideExpression, false);

                if (!TypeGuard.isIdentifier(expression))
                {
                    throw this.syntaxError(lookahead, Messages.restOperatorMustBeFollowedByAnIdentifierInDeclarationContexts);
                }

                entries.push(new RestElement(expression));

                if (!this.match("}"))
                {
                    throw this.syntaxError(lookahead, Messages.restParameterMustBeLastFormalParameter);
                }
            }
            else
            {
                const lookahead = this.lookahead;

                entries.push(this.reinterpret(this.inheritGrammar(this.objectPropertyExpression), lookahead, checker));
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

        const properties: (Property | SpreadElement)[] = [];

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

        let key: IExpression;

        let computed = false;

        if (token.type == TokenType.Identifier)
        {
            key = new Identifier(token.raw);

            this.nextToken();

            if (this.match("="))
            {
                const invalidInitialization = this.lookahead;

                this.expect("=");

                const value = this.isolateGrammar(this.assignmentExpression);

                this.invalidInitialization = invalidInitialization;

                return new Property(key, new AssignmentExpression(new Identifier(token.raw), value, "="), computed, true);
            }

            if (!this.match(":"))
            {
                return new Property(key, new Identifier(token.raw), false, true);
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
                    key = new Identifier(this.nextToken().raw);
                    break;
                case TokenType.NumericLiteral:
                case TokenType.StringLiteral:
                    key = new Literal(this.nextToken().value as LiteralValue);
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

        const value = this.isolateGrammar(this.assignmentExpression);

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
        this.nextToken();

        const callee = this.inheritGrammar(this.leftHandSideExpression, false);

        const args = this.match("(") ? this.isolateGrammar(this.arguments) : [];

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
                return this.isolateExpression();
            case TokenType.Punctuator:
                if
                (
                    this.lookahead.raw == "!"
                    || this.lookahead.raw == "("
                    || this.lookahead.raw == "+"
                    || this.lookahead.raw == "++"
                    || this.lookahead.raw == "-"
                    || this.lookahead.raw == "--"
                    || this.lookahead.raw == "/"
                    || this.lookahead.raw == "["
                    || this.lookahead.raw == "^"
                    || this.lookahead.raw == "{"
                    || this.lookahead.raw == "~"
                )
                {
                    return this.isolateExpression();
                }
                break;
            case TokenType.Keyword:
                if (this.lookahead.raw == "new" || this.lookahead.raw == "this" || this.lookahead.raw == "typeof")
                {
                    return this.isolateExpression();
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
                    this.nextToken();
                    return new ThisExpression();
                }
                break;
            case TokenType.Identifier:
                if (this.lookahead.raw == "undefined")
                {
                    return new Identifier(this.nextToken().raw);
                }

                return new Identifier(this.nextToken().raw);

            case TokenType.BooleanLiteral:
                return new Literal(this.nextToken().value as LiteralValue);
            case TokenType.NumericLiteral:
            case TokenType.NullLiteral:
            case TokenType.StringLiteral:
                return new Literal(this.nextToken().value as LiteralValue);
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

            /* c8 ignore next 2 */
            default:
                break;
        }

        throw this.unexpectedTokenError(this.lookahead);
    }

    private reinterpret(expression: ArrayExpression,          token: Token, dupecheck: DupeCheck): ArrayPattern;
    private reinterpret(expression: AssignmentExpression,     token: Token, dupecheck: DupeCheck): AssignmentPattern;
    private reinterpret(expression: ObjectExpression,         token: Token, dupecheck: DupeCheck): ObjectPattern;
    private reinterpret(expression: Property,                 token: Token, dupecheck: DupeCheck): AssignmentProperty;
    private reinterpret(expression: SpreadElement,            token: Token, dupecheck: DupeCheck): RestElement;
    private reinterpret(expression: Property | SpreadElement, token: Token, dupecheck: DupeCheck): AssignmentProperty | RestElement;
    private reinterpret(expression: INode,                    token: Token, dupecheck: DupeCheck): IPattern;
    private reinterpret(node:       INode,                    token: Token, dupecheck: DupeCheck): INode
    {
        switch (node.type)
        {
            case NodeType.Identifier:
            {
                return dupecheck(node as Identifier, token);
            }
            case NodeType.ObjectPattern:
            case NodeType.RestElement:
                return node;
            case NodeType.AssignmentExpression:
            {
                return this.reinterpretAssignmentExpression(node as AssignmentExpression, token, dupecheck);
            }
            case NodeType.Property:
            {
                return this.reinterpretProperty(node as Property, token, dupecheck);
            }
            case NodeType.ArrayExpression:
            {
                return this.reinterpretArrayExpression(node as ArrayExpression, token, dupecheck);
            }
            case NodeType.ObjectExpression:
            {
                return this.reinterpretObjectExpression(node as ObjectExpression, token, dupecheck);
            }
            case NodeType.SpreadElement:
            {
                return this.reinterpretSpreadElement(node as SpreadElement, token, dupecheck);
            } /* c8 ignore next 2 */
            default:
                break;
        } /* c8 ignore next 3 */

        throw this.unexpectedTokenError(token);
    }

    private reinterpretAssignmentExpression(expression: AssignmentExpression, token: Token, dupecheck: DupeCheck): AssignmentPattern
    {
        if (expression.operator != "=")
        {
            throw this.syntaxError(token, Messages.invalidDestructuringAssignmentTarget);
        }

        if (TypeGuard.isIdentifier(expression.left))
        {
            return new AssignmentPattern(dupecheck(expression.left, token), expression.right);
        }

        throw this.syntaxError(token, Messages.illegalPropertyInDeclarationContext);
    }

    private reinterpretArrayExpression(expression: ArrayExpression, token: Token, dupecheck: DupeCheck): ArrayPattern
    {
        const elements: (IPattern | null)[] = [];

        let index = 0;
        for (const element of expression.elements)
        {
            if (element)
            {
                if (element.type == NodeType.Literal)
                {
                    throw this.syntaxError(token, Messages.invalidDestructuringAssignmentTarget);
                }
                else if (element.type == NodeType.MemberExpression)
                {
                    throw this.syntaxError(token, Messages.illegalPropertyInDeclarationContext);
                }
                else if (element.type == NodeType.SpreadElement && index < expression.elements.length - 1)
                {
                    throw this.syntaxError(token, Messages.restParameterMustBeLastFormalParameter);
                }

                elements.push(this.reinterpret(element, token, dupecheck));
            }

            else
            {
                elements.push(null);
            }

            index++;
        }

        return new ArrayPattern(elements);
    }

    private reinterpretObjectExpression(expression: ObjectExpression, token: Token, dupecheck: DupeCheck): ObjectPattern
    {
        const entries: (AssignmentProperty | RestElement)[] = [];

        let index = 0;

        for (const property of expression.properties)
        {
            if (property.type == NodeType.SpreadElement && index < expression.properties.length - 1)
            {
                throw this.syntaxError(token, Messages.restParameterMustBeLastFormalParameter);
            }

            entries.push(this.reinterpret(property, token, dupecheck));

            index++;
        }

        return new ObjectPattern(entries);
    }

    private reinterpretProperty(property: Property, token: Token, dupecheck: DupeCheck): AssignmentProperty
    {
        const { key, value, computed, shorthand } = property as Property;

        if (shorthand)
        {
            if (TypeGuard.isIdentifier(value))
            {
                const identifier = dupecheck(value, token);

                return new AssignmentProperty(identifier.clone(), identifier.clone(), computed, shorthand);
            }
            else if (TypeGuard.isAssignmentExpression(value))
            {
                return new AssignmentProperty(key, this.reinterpretAssignmentExpression(value, token, dupecheck), computed, shorthand);
            }
        }
        else if (TypeGuard.isArrayExpression(value) || TypeGuard.isAssignmentExpression(value) || TypeGuard.isIdentifier(value) || TypeGuard.isObjectExpression(value))
        {
            if (TypeGuard.isIdentifier(value))
            {
                return new AssignmentProperty(key, dupecheck(value, token).clone(), computed, shorthand);
            }

            return new AssignmentProperty(key, this.reinterpret(value, token, dupecheck) as IPattern, computed, shorthand);
        }
        else if (TypeGuard.isMemberExpression(value))
        {
            throw this.syntaxError(token, Messages.illegalPropertyInDeclarationContext);
        }

        throw this.syntaxError(token, Messages.invalidDestructuringAssignmentTarget);
    }

    private reinterpretSpreadElement(node: SpreadElement, token: Token, dupecheck: DupeCheck): RestElement
    {
        const expression = node as SpreadElement;

        if (expression.argument.type == NodeType.AssignmentExpression)
        {
            throw this.syntaxError(token, Messages.invalidDestructuringAssignmentTarget);
        }

        return new RestElement(this.reinterpret(expression.argument, token, dupecheck));
    }

    private regexExpression(): IExpression
    {
        const token = this.nextRegexToken();
        return new Literal(token.value as RegExp);
    }

    private restElement(): RestElement
    {
        const lookahead = this.lookahead;

        this.expect("...");

        const expression = this.isolateGrammar(this.pattern, true);

        if (expression.type == NodeType.AssignmentPattern)
        {
            throw this.syntaxError(lookahead, Messages.restParameterMayNotHaveAdefaultInitializer);
        }

        return new RestElement(expression);
    }

    private spreadExpression(): SpreadElement
    {
        this.expect("...");

        return new SpreadElement(this.inheritGrammar(this.assignmentExpression));
    }

    private syntaxError(token: Token, message: string): Error
    {
        return new SyntaxError(message, token.lineNumber, token.start, token.start - token.lineStart + 1);
    }

    private unaryExpression(): IExpression
    {
        if (this.match("+") || this.match("-") || this.match("~") || this.match("!") || this.matchKeyword("typeof"))
        {
            const token = this.nextToken();

            return new UnaryExpression(this.inheritGrammar(this.unaryExpression), token.raw as UnaryOperator);
        }

        return this.inheritGrammar(this.updateExpression);
    }

    private templateLiteralExpression(): TemplateLiteral
    {
        const quasis:      TemplateElement[] = [];
        const expressions: IExpression[]     = [];

        let token = this.nextToken();
        quasis.push(new TemplateElement(token.value as string, token.raw, !!token.isTail));

        while (!!!token.isTail)
        {
            expressions.push(this.inheritGrammar(this.expression));

            token = this.nextToken();

            quasis.push(new TemplateElement(token.value as string, token.raw, !!token.isTail));
        }

        return new TemplateLiteral(quasis, expressions);
    }

    private updateExpression(): IExpression
    {
        if (this.match("++") || this.match("--"))
        {
            const operator   = this.nextToken().raw as UpdateOperator;

            const lookahead = this.lookahead;

            const expression = this.inheritGrammar(this.leftHandSideExpression, true);

            if (!TypeGuard.isIdentifier(expression) && !TypeGuard.isMemberExpression(expression))
            {
                throw this.syntaxError(lookahead, Messages.invalidLeftHandSideExpressionInPrefixOperation);
            }

            return new UpdateExpression(expression, operator, true);
        }

        const lookahead = this.lookahead;

        const expression = this.inheritGrammar(this.leftHandSideExpression, true);

        if (this.match("++") || this.match("--"))
        {
            if (!TypeGuard.isIdentifier(expression) && !TypeGuard.isMemberExpression(expression))
            {
                throw this.syntaxError(lookahead, Messages.invalidLeftHandSideExpressionInPostfixOperation);
            }

            const operator = this.nextToken().raw as UpdateOperator;

            return new UpdateExpression(expression, operator, false);
        }

        return expression;
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
            case TokenType.Template:
                message = format(Messages.unexpectedToken, { token: "" });
                break;
            default:
                message = format(Messages.unexpectedToken, { token: token.raw });
                break;
        }

        return new SyntaxError(message, token.lineNumber, token.start, token.start - token.lineStart + 1);
    }
}