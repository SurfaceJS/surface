import IArrayDestructureExpression  from "./interfaces/array-destructure-expression";
import IAssignmentExpression        from "./interfaces/assignment-expression";
import IIdentifierExpression        from "./interfaces/identifier-expression";
import IObjectDestructureExpression from "./interfaces/object-destructure-expression";
import IRestExpression              from "./interfaces/rest-expression";

export type AssignmentOpertaror   = "="|"*="|"**="|"/="|"%="|"+="|"-="|"<<="|">>="|">>>="|"&="|"^="|"|=";
export type ArithmeticOperator    = "+"|"-"|"*"|"/"|"%"|"**";
export type BinaryBitwiseOperator = "&"|"|"|"^";
export type BinaryLogicalOperator = "&&"|"||";
export type BitwiseShiftOperator  = "<<"|">>"|">>>";
export type EqualityOperator      = "=="|"==="|"!="|"!==";
export type RelationalOperator    = "<="|">="|"<"|">"|"in"|"instanceof";
export type UnaryOperator         = "+"|"-"|"~"|"!"|"typeof";
export type UpdateOperator        = "++"|"--";

export type BinaryOperator        = ArithmeticOperator|BinaryBitwiseOperator|BinaryLogicalOperator|BitwiseShiftOperator|EqualityOperator|RelationalOperator;
export type DestructureExpression = IArrayDestructureExpression|IAssignmentExpression|IIdentifierExpression|IObjectDestructureExpression|IRestExpression;