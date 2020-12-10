import type { Node } from "acorn";

export type AssignmentExpression = Node &
{
    left:     Node,
    operator: string,
    right:    Node,
};

export type FunctionDeclaration = Node &
{
    id: Identifier,
};

export type ClassDeclaration = Node &
{
    id: Identifier,
};

export type ExportAllDeclaration = Node &
{
    source: Literal,
};

export type ExportNamedDeclaration = Node &
{
    declaration: Node | null,
    specifiers: ExportSpecifier[],
};

export type ExportSpecifier = Node &
{
    local: Identifier,
    exported: Identifier,
};

export type ExpressionStatement = Node &
{
    expression: Node,
};

export type Identifier = Node &
{
    name: string,
};

export type Literal =
{
    value: string,
};

export type Program = Node &
{
    body: Node[],
};

export type VariableDeclaration = Node &
{
    declarations: VariableDeclarator[],
};

export type VariableDeclarator = Node &
{
    id: Identifier,
};