import AssignmentNode  from "../internal/nodes/assignment-node.js";
import IdentifierNode  from "../internal/nodes/identifier-node.js";
import LiteralNode     from "../internal/nodes/literal-node.js";
import RestNode        from "../internal/nodes/rest-node.js";
import SegmentNode     from "../internal/nodes/segment-node.js";
import TransformerNode from "../internal/nodes/transformer-node.js";
import WildcardNode    from "../internal/nodes/wildcard-node.js";

export type ParserValidExpectation =
{
    expected: SegmentNode[],
    pattern:  string,
};

export type ParserInvalidExpectation =
{
    error:   Error,
    pattern: string,
};

export const validExpectations: ParserValidExpectation[] =
[
    {
        expected:
        [
            new SegmentNode([], false),
        ],
        pattern:  "/",
    },
    {
        expected:
        [
            new SegmentNode([new LiteralNode("path")], false),
        ],
        pattern:  "/path",
    },
    {
        expected:
        [
            new SegmentNode([new LiteralNode("path")], false),
            new SegmentNode([new LiteralNode("sub-path")], false),
        ],
        pattern:  "/path/sub-path",
    },
    {
        expected:
        [
            new SegmentNode([new WildcardNode(), new LiteralNode("path")], false),
        ],
        pattern:  "/*path",
    },
    {
        expected:
        [
            new SegmentNode([new LiteralNode("path"), new WildcardNode()], false),
        ],
        pattern:  "/path*",
    },
    {
        expected:
        [
            new SegmentNode([new LiteralNode("path"), new WildcardNode(), new LiteralNode("path")], false),
        ],
        pattern:  "/path*path",
    },
    {
        expected:
        [
            new SegmentNode([new IdentifierNode("path")], false),
        ],
        pattern:  "/{path}",
    },
    {
        expected:
        [
            new SegmentNode([new IdentifierNode("identifier"), new LiteralNode("path")], false),
        ],
        pattern:  "/{identifier}path",
    },
    {
        expected:
        [
            new SegmentNode([new IdentifierNode("identifier")], false),
            new SegmentNode([new LiteralNode("path")], false),
        ],
        pattern:  "/{identifier}/path",
    },
    {
        expected:
        [
            new SegmentNode([new IdentifierNode("identifier", true)], true),
        ],
        pattern:  "/{identifier?}",
    },
    {
        expected:
        [
            new SegmentNode([new IdentifierNode("identifier", true), new LiteralNode("path")], false),
        ],
        pattern:  "/{identifier?}path",
    },
    {
        expected:
        [
            new SegmentNode([new IdentifierNode("identifier", true)], true),
            new SegmentNode([new LiteralNode("path")], false),
        ],
        pattern:  "/{identifier?}/path",
    },
    {
        expected:
        [
            new SegmentNode([new AssignmentNode("identifier", "home")], true),
        ],
        pattern:  "/{identifier=home}",
    },
    {
        expected:
        [
            new SegmentNode([new AssignmentNode("identifier", "home"), new LiteralNode("path")], false),
        ],
        pattern:  "/{identifier=home}path",
    },
    {
        expected:
        [
            new SegmentNode([new AssignmentNode("identifier", "home")], true),
            new SegmentNode([new LiteralNode("path")], false),
        ],
        pattern:  "/{identifier=home}/path",
    },
    {
        expected:
        [
            new SegmentNode([new LiteralNode("path"), new AssignmentNode("identifier", "home"), new LiteralNode("path")], false),
        ],
        pattern:  "/path{identifier=home}path",
    },
    {
        expected:
        [
            new SegmentNode([new RestNode("identifier")], true),
        ],
        pattern:  "/{*identifier}",
    },
    {
        expected:
        [
            new SegmentNode([new LiteralNode("path")], false),
            new SegmentNode([new RestNode("identifier")], true),
        ],
        pattern:  "/path/{*identifier}",
    },
    {
        expected:
        [
            new SegmentNode([new TransformerNode("identifier", new IdentifierNode("transformer"))], false),
        ],
        pattern:  "/{identifier:transformer}",
    },
    {
        expected:
        [
            new SegmentNode([new TransformerNode("identifier", new IdentifierNode("transformer", true))], true),
        ],
        pattern:  "/{identifier:transformer?}",
    },
    {
        expected:
        [
            new SegmentNode([new TransformerNode("identifier", new AssignmentNode("transformer", "default"))], true),
        ],
        pattern:  "/{identifier:transformer=default}",
    },
];

export const invalidExpectations: ParserInvalidExpectation[] =
[
    { error: new Error("Unexpected end of path"),     pattern: "" },
    { error: new Error("Unexpected token path at 0"), pattern: "path" },
    { error: new Error("Unexpected token } at 6"),    pattern: "/path{}" },
    { error: new Error("Unexpected token { at 6"),    pattern: "/path{{}" },
    { error: new Error("Unexpected token : at 5"),    pattern: "/path:" },
    { error: new Error("Unexpected token { at 12"),   pattern: "/path{value}{another}" },
    { error: new Error("Unexpected token * at 7"),    pattern: "/path{**rest}" },
    { error: new Error("Unexpected space at 1"),      pattern: "/ " },
];