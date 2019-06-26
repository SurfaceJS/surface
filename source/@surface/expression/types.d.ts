import ArrayDestructureExpression  from "./internal/expressions/array-destructure-expression";
import AssignmentExpression        from "./internal/expressions/assignment-expression";
import IdentifierExpression        from "./internal/expressions/identifier-expression";
import ObjectDestructureExpression from "./internal/expressions/object-destructure-expression";
import RestExpression              from "./internal/expressions/rest-expression";

export type AssignmentOpertaror   = "="|"*="|"**="|"/="|"%="|"+="|"-="|"<<="|">>="|">>>="|"&="|"^="|"|=";
export type ArithmeticOperator    = "+"|"-"|"*"|"/"|"%"|"**";
export type BinaryBitwiseOperator = "&"|"|"|"^";
export type BinaryLogicalOperator = "&&"|"||";
export type BitwiseShiftOperator  = "<<"|">>"|">>>";
export type EqualityOperator      = "=="|"==="|"!="|"!==";
export type RelationalOperator    = "<="|">="|"<"|">"|"in"|"instanceof";
export type UnaryOperator         = "+"|"-"|"~"|"!"|"typeof";
export type UpdateOperator        = "++"|"--";

export type BinaryOperator     = ArithmeticOperator|BinaryBitwiseOperator|BinaryLogicalOperator|BitwiseShiftOperator|EqualityOperator|RelationalOperator;
export type DestructureElement = ArrayDestructureExpression|AssignmentExpression|IdentifierExpression|ObjectDestructureExpression|RestExpression;
export type ParameterElement   = DestructureElement;