/* eslint-disable @typescript-eslint/indent */

import Evaluate          from "./internal/evaluate";
import Expression        from "./internal/expression";
import ExpressionVisitor from "./internal/expression-visitor";
import NodeType          from "./internal/node-type";
import SyntaxError       from "./internal/syntax-error";
import TypeGuard         from "./internal/type-guard";

export
{
    Evaluate,
    ExpressionVisitor,
    NodeType,
    SyntaxError,
    TypeGuard,
};

export type
{
    IArrayExpression,
    IArrayPattern,
    IArrowFunctionExpression,
    IAssignmentExpression,
    IAssignmentPattern,
    IAssignmentProperty,
    IBinaryExpression,
    ICallExpression,
    ICoalesceExpression,
    IConditionalExpression,
    IElement,
    IExpression,
    IIdentifier,
    ILiteral,
    ILogicalExpression,
    IMemberExpression,
    INewExpression,
    INode,
    IObjectExpression,
    IObjectPattern,
    IParenthesizedExpression,
    IPattern,
    IProperty,
    IRegExpLiteral,
    IRestElement,
    ISequenceExpression,
    ISpreadElement,
    ITaggedTemplateExpression,
    ITemplateElement,
    ITemplateLiteral,
    IThisExpression,
    IUnaryExpression,
    IUpdateExpression,
} from "./internal/interfaces";

export default Expression;