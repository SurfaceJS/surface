/* eslint-disable import/no-commonjs */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-require-imports */
import { createRequire } from "module";
import { typeGuard }     from "@surface/core";
import type
{
    AssignmentExpression,
    ClassDeclaration,
    ExportAllDeclaration,
    ExportNamedDeclaration,
    ExpressionStatement,
    FunctionDeclaration,
    Program,
    VariableDeclaration,
} from "./types";

const require = createRequire(import.meta.url);

const acorn = require("acorn") as typeof import("acorn");

export default function getExports(source: string): { esm: boolean, exports: string[]}
{
    const exports: string[] = [];

    let esm = true;

    const ast = acorn.parse(source, { ecmaVersion: "latest", sourceType: "module" }) as Program;

    for (const node of ast.body)
    {
        if (typeGuard<ExportNamedDeclaration>(node, node.type == "ExportNamedDeclaration"))
        {
            if (typeGuard<VariableDeclaration>(node.declaration, node.declaration?.type == "VariableDeclaration"))
            {
                for (const declarator of node.declaration.declarations)
                {
                    const identifier = declarator.id.name;

                    exports.push(`export let ${identifier} = proxy.${identifier}`);
                }
            }
            else if (typeGuard<FunctionDeclaration | ClassDeclaration>(node.declaration, node.declaration?.type == "FunctionDeclaration" || node.declaration?.type == "ClassDeclaration"))
            {
                const identifier = node.declaration.id.name;

                exports.push(`export let ${identifier} = proxy.${identifier}`);
            }
            else
            {
                for (const specifier of node.specifiers)
                {
                    const identifier = specifier.exported.name;

                    exports.push(`export let ${identifier} = proxy.${identifier}`);
                }
            }
        }
        else if (typeGuard<ExportAllDeclaration>(node, node.type == "ExportAllDeclaration"))
        {
            exports.push(`export * from "${node.source.value}"`);
        }
        else if (node.type == "ExportDefaultDeclaration")
        {
            exports.push("export default proxy.default");
        }
        else if (typeGuard<ExpressionStatement>(node, node.type == "ExpressionStatement"))
        {
            if (typeGuard<AssignmentExpression>(node.expression, node.expression.type == "AssignmentExpression"))
            {
                const left = source.substring(node.expression.left.start, node.expression.left.end);

                if (left.startsWith("module.exports"))
                {
                    esm = false;

                    const identifier = left.replace(/module\.exports\.?/, "");

                    const expression = !identifier
                        ? "export default proxy"
                        : identifier == "default"
                            ? "export default proxy.default"
                            : `export let ${identifier} = proxy.${identifier}`;

                    exports.push(expression);
                }
            }
        }
    }

    return { esm, exports };
}