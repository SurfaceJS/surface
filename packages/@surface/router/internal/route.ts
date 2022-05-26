import type { Indexer }  from "@surface/core";
import { hasValue }      from "@surface/core";
import type IConstraint  from "./interfaces/constraint";
import type INode        from "./interfaces/node";
import type ITransformer from "./interfaces/transformer";
import type SegmentNode  from "./nodes/segment-node.js";
import Parser            from "./parser.js";
import TypeGuard         from "./type-guard.js";
import type RouteMatch   from "./types/route-match";

export default class Route
{
    private readonly nodes:        INode[];
    private readonly pattern:      RegExp;
    private readonly segments:     SegmentNode[];
    private readonly constraints:  Map<string, IConstraint>;
    private readonly transformers: Map<string, ITransformer>;

    public constructor(pattern: string, constraints: Map<string, IConstraint>, transformers: Map<string, ITransformer>)
    {
        this.constraints  = constraints;
        this.transformers = transformers;
        this.segments     = Parser.parse(this.normalize(pattern));
        this.nodes        = this.segments.flatMap(x => x.nodes);
        this.pattern      = new RegExp(`^${Array.from(this.segmentMap(this.segments)).join("")}$`);
    }

    private *segmentMap(segments: SegmentNode[]): Iterable<string>
    {
        for (const segment of segments)
        {
            const nodes = Array.from(this.nodeMap(segment.nodes)).join("");

            yield segment.optional ? `(?:/${nodes})?` : `/${nodes}`;
        }
    }

    private *nodeMap(nodes: INode[]): Iterable<string>
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

    private collectParameters(match: RegExpExecArray): Indexer | null
    {
        const parameters: Indexer = { };

        for (let index = 0; index < this.nodes.length; index++)
        {
            const node  = this.nodes[index]!;
            const group = match[index + 1];

            if (!TypeGuard.isLiteral(node))
            {
                if (TypeGuard.isAssignment(node))
                {
                    parameters[node.left] = group || node.right;
                }
                else if (TypeGuard.isTransformer(node))
                {
                    const [key, value] = TypeGuard.isAssignment(node.transformer)
                        ? [node.transformer.left, group ?? node.transformer.right]
                        : [node.transformer.name, group];

                    const constraint = this.constraints.get(key);
                    const tranformer = this.transformers.get(key);

                    if (!constraint && !tranformer)
                    {
                        throw new Error(`Unregistred constraint or transformer ${key}`);
                    }

                    if (value && !node.optional && !(constraint?.validate(value) ?? true))
                    {
                        return null;
                    }

                    if (value)
                    {
                        parameters[node.name] = tranformer ? tranformer.parse(value) : value;
                    }
                }
                else if (TypeGuard.isIdentifier(node) && group)
                {
                    parameters[node.name] = group;
                }
                else if (TypeGuard.isRest(node))
                {
                    parameters[node.name] = group ?? "";
                }
            }
        }

        return parameters;
    }

    private matchParameters(params: Indexer): RouteMatch
    {
        const paths:         string[] = [];
        const missingParams: string[] = [];
        const invalidParams: string[] = [];

        const parameters: Indexer = { };

        for (const segment of this.segments)
        {
            paths.push("/");

            const count = paths.length;

            for (const node of segment.nodes)
            {
                // istanbul ignore else
                if (TypeGuard.isLiteral(node))
                {
                    paths.push(node.value);
                }
                else if (TypeGuard.isAssignment(node))
                {
                    let fallback: string | undefined;

                    const value = parameters[node.left] = params[node.left] || (fallback = node.right);

                    if (value != fallback)
                    {
                        paths.push(value as string);
                    }
                }
                else if (TypeGuard.isTransformer(node))
                {
                    let defaultValue: string | undefined;

                    const [key, value] = TypeGuard.isAssignment(node.transformer)
                        ? [node.transformer.left, params[node.name] ?? (defaultValue = node.transformer.right)]
                        : [node.transformer.name, params[node.name]];

                    const constraint  = this.constraints.get(key);
                    const transformer = this.transformers.get(key);

                    if (!constraint && !transformer)
                    {
                        throw new Error(`Unregistred constraint or transformer ${key}`);
                    }

                    if (!hasValue(value))
                    {
                        if (!node.optional)
                        {
                            missingParams.push(node.name);
                        }
                    }
                    else if (transformer)
                    {
                        if (value == defaultValue)
                        {
                            parameters[node.name] = transformer.parse(value as string);

                            paths.push(value as string);
                        }
                        else
                        {
                            parameters[node.name] = value;

                            const stringValue = transformer.stringify(value);

                            if (!this.constraints.get(key)?.validate(stringValue))
                            {
                                invalidParams.push(`${typeof value == "string" ? `"${value}"` : value} is not assignable to ${node.name}:${key}`);
                            }
                            else
                            {
                                paths.push(stringValue);
                            }
                        }
                    }
                }
                else if (TypeGuard.isIdentifier(node))
                {
                    const value = params[node.name];

                    if (!hasValue(value))
                    {
                        if (!node.optional)
                        {
                            missingParams.push(node.name);
                        }
                    }
                    else
                    {
                        paths.push((parameters[node.name] = params[node.name]) as string);
                    }

                }
                else if (TypeGuard.isRest(node))
                {
                    const value = parameters[node.name] = params[node.name] ?? "";

                    if (value)
                    {
                        paths.push(value as string);
                    }
                }
            }

            if (paths.length == count && segment.optional)
            {
                paths.pop();
            }
        }

        const reasons: string[] = [];

        if (invalidParams.length > 0)
        {
            reasons.push(`Invalid parameters: ${invalidParams.join(", ")}`);
            // reasons.push(invalidParams.join(", "));
        }

        if (missingParams.length > 0)
        {
            reasons.push(`Missing parameters: ${missingParams.join(", ")}`);
            // reasons.push(missingParams.map(x => `${x}: missing`).join(", "));
        }

        if (reasons.length > 0)
        {
            return { matched: false, reason: reasons.join(", ") };
        }

        return { matched: true, routeData: { parameters, path: paths.join("") } };
    }

    private matchUrl(path: string): RouteMatch
    {
        const normalizedPath = this.normalize(path);

        const match = this.pattern.exec(normalizedPath);

        if (match)
        {
            const parameters = this.collectParameters(match);

            if (parameters)
            {
                return {
                    matched:   true,
                    routeData: { parameters, path: normalizedPath },
                };
            }
        }

        return { matched: false, reason: "Pattern don't match" };
    }

    private normalize(path: string): string
    {
        return path == "/" ? path : (path.startsWith("/") ? "" : "/") + path.replace(/\/$/, "");
    }

    public match(value: string | Indexer): RouteMatch
    {
        if (typeof value == "string")
        {
            return this.matchUrl(value);
        }

        return this.matchParameters(value);
    }
}
