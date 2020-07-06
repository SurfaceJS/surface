import { normalizeUrlPath, parseQuery, parseUrl, Func, Indexer } from "@surface/core";
import IRouteData                                                from "../internal/interfaces/route-data";
import INode                                                     from "./interfaces/node";
import SegmentNode                                               from "./nodes/segment-node";
import Parser                                                    from "./parser";
import TypeGuard                                                 from "./type-guard";

export default class Route
{
    private readonly tranformers: Map<string, Func<[string], unknown>>;
    private readonly nodes:       Array<INode>;
    private readonly pattern:     RegExp;

    public constructor(pattern: string, tranformers: Map<string, Func<[string], unknown>>)
    {
        this.tranformers = tranformers;

        const segments = Parser.parse(normalizeUrlPath(pattern));

        this.nodes   = segments.flatMap(x => x.nodes);
        this.pattern = new RegExp(`^${Array.from(this.segmentMap(segments)).join("")}$`);
    }

    private *segmentMap(segments: Array<SegmentNode>): Iterable<string>
    {
        for (const segment of segments)
        {
            const nodes = Array.from(this.nodeMap(segment.nodes)).join("");

            yield segment.optional ? `(?:/${nodes})?` : `/${nodes}`;
        }
    }

    private *nodeMap(nodes: Array<INode>): Iterable<string>
    {
        for (const node of nodes)
        {
            if (TypeGuard.isAssignment(node) || TypeGuard.isWildcard(node))
            {
                yield "([^\\/]*)";
            }
            if (TypeGuard.isRest(node))
            {
                yield "(.*)";
            }
            else if (TypeGuard.isTransformer(node))
            {
                yield node.optional ? "([^\\/]*)" : "([^\\/]+)";
            }
            else if (TypeGuard.isIdentifier(node))
            {
                yield node.optional ? "([^\\/]*)" : "([^\\/]+)";
            }
            else if (TypeGuard.isLiteral(node))
            {
                yield `(${node.value})`;
            }
        }
    }

    private collectParams(match: RegExpExecArray): Indexer
    {
        let data: Indexer = { };

        for (let index = 0; index < this.nodes.length; index++)
        {
            const node  = this.nodes[index];
            const group = match[index + 1];

            if (!TypeGuard.isLiteral(node))
            {
                if (TypeGuard.isAssignment(node))
                {
                    data[node.left] = group || node.right;
                }
                else if (TypeGuard.isTransformer(node))
                {
                    const [key, value] = TypeGuard.isAssignment(node.transformer)
                        ? [node.transformer.left, group ?? node.transformer.right]
                        : [node.transformer.name, group];

                    if (value)
                    {
                        const tranformer = this.tranformers.get(key);

                        if (!tranformer)
                        {
                            throw new Error(`Unregistred tranformer ${key}`);
                        }

                        data[node.name] = tranformer(value);
                    }

                }
                else if (TypeGuard.isIdentifier(node) && group)
                {
                    data[node.name] = group;
                }
                else if (TypeGuard.isRest(node))
                {
                    data[node.name] = group;
                }
            }
        }

        return data;
    }

    public match(uri: string): IRouteData | null
    {
        const { path, hash, query } = parseUrl(uri);

        const match = this.pattern.exec(normalizeUrlPath(path));

        if (match)
        {
            return {
                hash,
                path,
                params: this.collectParams(match),
                query:  parseQuery(query),
            };
        }

        return null;
    }
}