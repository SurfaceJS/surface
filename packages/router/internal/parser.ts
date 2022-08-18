import TokenType       from "./enums/token-type.js";
import type INode      from "./interfaces/node";
import AssignmentNode  from "./nodes/assignment-node.js";
import IdentifierNode  from "./nodes/identifier-node.js";
import LiteralNode     from "./nodes/literal-node.js";
import RestNode        from "./nodes/rest-node.js";
import SegmentNode     from "./nodes/segment-node.js";
import TransformerNode from "./nodes/transformer-node.js";
import WildcardNode    from "./nodes/wildcard-node.js";
import Scanner         from "./scanner.js";
import TypeGuard       from "./type-guard.js";
import type Token      from "./types/token";

export default class Parser
{
    private readonly scanner: Scanner;
    private lookahead: Token;

    public constructor(source: string)
    {
        this.scanner = new Scanner(source);

        this.lookahead = this.scanner.nextToken();
    }

    public static parse(source: string): SegmentNode[]
    {
        return new Parser(source).parse();
    }

    private expect(value: string): void
    {
        const token = this.nextToken();

        if (token.value != value)
        {
            this.throwUnexpectedToken(token);
        }
    }

    private assertKeysIdentity(segments: SegmentNode[]): void
    {
        const keys = new Set();

        for (const node of segments.flatMap(x => x.nodes))
        {
            const key = TypeGuard.isAssignment(node)
                ? node.left
                : TypeGuard.isIdentifier(node) || TypeGuard.isRest(node) || TypeGuard.isTransformer(node)
                    ? node.name
                    : undefined;

            if (key && keys.has(key))
            {
                throw new Error(`Found duplicated key ${key}`);
            }

            keys.add(key);
        }
    }

    private hasOptional(nodes: INode[]): boolean
    {
        const singleNode = nodes.length == 1 ? nodes[0] : null;

        return !!singleNode
        && (
            TypeGuard.isAssignment(singleNode)
            || TypeGuard.isRest(singleNode)
            || TypeGuard.isIdentifier(singleNode) && singleNode.optional
            || TypeGuard.isTransformer(singleNode) && singleNode.optional
        );
    }

    private nextToken(): Token
    {
        const token = this.lookahead;

        this.lookahead = this.scanner.nextToken();

        return token;
    }

    private match(value: string): boolean
    {
        return this.lookahead.type === TokenType.Punctuator && this.lookahead.value === value;
    }

    private parse(): SegmentNode[]
    {
        const type = this.lookahead.type;

        if (type == TokenType.Eof)
        {
            throw new Error("Unexpected end of path");
        }

        const segments: SegmentNode[] = [];

        while (this.lookahead.type != TokenType.Eof)
        {
            segments.push(this.parseSegment());
        }

        this.assertKeysIdentity(segments);

        return segments;
    }

    private parseIdentifierNode(): AssignmentNode | IdentifierNode | TransformerNode;
    private parseIdentifierNode(ignoreTransformer: true): AssignmentNode | IdentifierNode;
    private parseIdentifierNode(ignoreTransformer: boolean = false): INode
    {
        const token = this.nextToken();

        if (token.type == TokenType.Literal)
        {
            if (this.match("="))
            {
                this.expect("=");

                return new AssignmentNode(token.value, this.nextToken().value);
            }
            else if (!ignoreTransformer && this.match(":"))
            {
                this.expect(":");

                return new TransformerNode(token.value, this.parseIdentifierNode(true));
            }
            else if (this.match("?"))
            {
                this.expect("?");

                return new IdentifierNode(token.value, true);
            }

            return new IdentifierNode(token.value);

        }

        this.throwUnexpectedToken(token);
    }

    private parseSegment(): SegmentNode
    {
        this.expect("/");

        const nodes: INode[] = [];

        while (!this.match("/") && this.lookahead.type != TokenType.Eof)
        {
            switch (this.lookahead.type)
            {
                case TokenType.Literal:
                    nodes.push(new LiteralNode(this.lookahead.value));

                    this.nextToken();

                    break;
                case TokenType.Punctuator:
                    if (this.match("*"))
                    {
                        this.expect("*");

                        nodes.push(new WildcardNode());
                    }
                    else if (this.match("{"))
                    {
                        this.expect("{");

                        if (this.match("*"))
                        {
                            this.expect("*");

                            const token = this.nextToken();

                            if (token.type != TokenType.Literal)
                            {
                                this.throwUnexpectedToken(token);
                            }

                            nodes.push(new RestNode(token.value));
                        }
                        else
                        {
                            nodes.push(this.parseIdentifierNode());
                        }

                        this.expect("}");

                        if (this.match("{"))
                        {
                            this.throwUnexpectedToken(this.lookahead);
                        }
                    }
                    else
                    {
                        this.throwUnexpectedToken(this.lookahead);
                    }
                    break;
                case TokenType.Space:
                default:
                    throw new Error(`Unexpected space at ${this.lookahead.index}`);
            }
        }

        return new SegmentNode(nodes, this.hasOptional(nodes));
    }

    private throwUnexpectedToken(token: Token): never
    {
        throw new Error(`Unexpected token ${token.value} at ${token.index}`);
    }
}
