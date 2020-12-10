import typescript from "typescript";

// const source =
// `
//     import foo from "foo";

//     export let bar = 1;
//     export function fn() { return 1 }
//     export { foo };
//     export class XYX { }

//     export { default as baz } from "baz"

//     export default { id: 0 };
// `;

const source =
`
    import foo from "foo";

    export let bar = 1;
    export function fn() { return 1 }
    export { foo };
    export class XYX { }
    export { default as baz } from "baz"
    export * from "xyz";
    export default { id: 0 };

    module.exports.bar     = 1;
    module.exports.fn      = function() { return 1 }
    module.exports.foo     = foo;
    module.exports.XYX     = class XYX { }
    module.exports.default = { id: 0 }
    module.exports         = { id: 0 };
`;

export function getExports(source: string): { esm: boolean, exports: string[] }
{
    const exports: string[] = [];

    let esm = false;

    const sourceFile = typescript.createSourceFile("temp.js", source, typescript.ScriptTarget.Latest);

    sourceFile.forEachChild
    (
        node =>
        {
            if (typescript.isImportDeclaration(node))
            {
                esm = true;
            }
            else if (typescript.isVariableStatement(node) && node.modifiers?.some(x => x.kind == typescript.SyntaxKind.ExportKeyword))
            {
                for (const declaration of node.declarationList.declarations)
                {
                    if (typescript.isIdentifier(declaration.name))
                    {
                        const identifier = declaration.name.getText(sourceFile);

                        exports.push(`export const ${identifier} = proxy.${identifier};`);
                    }
                }
            }
            else if (typescript.isExportDeclaration(node))
            {
                if (node.exportClause && typescript.isNamedExports(node.exportClause))
                {
                    for (const element of node.exportClause.elements)
                    {
                        if (typescript.isIdentifier(element.name))
                        {
                            const identifier = element.name.getText(sourceFile);

                            exports.push(`export const ${identifier} = proxy.${identifier};`);
                        }
                    }
                }
                else
                {
                    exports.push(node.getText(sourceFile));
                }
            }
            else if ((typescript.isFunctionDeclaration(node) || typescript.isClassDeclaration(node)) && node.modifiers?.some(x => x.kind == typescript.SyntaxKind.ExportKeyword))
            {
                if (node.name && typescript.isIdentifier(node.name))
                {
                    const identifier = node.name.getText(sourceFile);

                    exports.push(`export const ${identifier} = proxy.${identifier};`);
                }
            }
            else if (typescript.isExportAssignment(node))
            {
                exports.push(`export default proxy.default;`);
            }
            else if (!esm && typescript.isExpressionStatement(node))
            {
                if (typescript.isBinaryExpression(node.expression) && node.expression.operatorToken.kind == typescript.SyntaxKind.EqualsToken && node.expression.left.getText(sourceFile).startsWith("module.exports"))
                {
                    const identifier = node.expression.left.getText(sourceFile).replace(/^module\.exports\.?/, "");

                    identifier
                        ? exports.push(`export const ${identifier} = proxy.${identifier};`)
                        : exports.push(`export default proxy;`);
                }
            }
        }
    )

    return { esm, exports };
}

const result = getExports(source);

console.log(result);