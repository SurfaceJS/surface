**@surface/expression** are a javascript subset that allows you to parse and evaluate the generated AST.

Supported Expressions:
* ArrayExpression
* ArrowFunctionExpression
* AssignmentExpression
* BinaryExpression
* CallExpression
* ChainExpression
* ConditionalExpression
* Identifier
* Literal
* LogicalExpression
* MemberExpression
* NewExpression
* ObjectExpression
* ParenthesizedExpression
* RegExpLiteral
* SequenceExpression
* TaggedTemplateExpression
* TemplateLiteral
* ThisExpression
* UnaryExpression
* UpdateExpression

Notes that ArrowFunctionExpression does not supports **Block Body**.

Basic usage:
```js
import Expression from "@surface/expression";

const expression = Expression.parse("x + y");

const value = expression.evaluate({ x: 1, y: 2 });

console.log(value); // 3
```