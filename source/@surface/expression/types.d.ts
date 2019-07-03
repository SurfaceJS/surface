import IArrayPattern         from "./interfaces/array-pattern";
import IAssignmentPattern    from "./interfaces/assignment-pattern";
import IIdentifierExpression from "./interfaces/identifier-expression";
import IObjectPattern        from "./interfaces/object-pattern";
import IRestElement          from "./interfaces/rest-element";

export type AssignmentOpertaror   = "="|"*="|"**="|"/="|"%="|"+="|"-="|"<<="|">>="|">>>="|"&="|"^="|"|=";
export type ArithmeticOperator    = "+"|"-"|"*"|"/"|"%"|"**";
export type BinaryBitwiseOperator = "&"|"|"|"^";
export type LogicalOperator       = "&&"|"||";
export type BitwiseShiftOperator  = "<<"|">>"|">>>";
export type EqualityOperator      = "=="|"==="|"!="|"!==";
export type RelationalOperator    = "<="|">="|"<"|">"|"in"|"instanceof";
export type UnaryOperator         = "+"|"-"|"~"|"!"|"typeof";
export type UpdateOperator        = "++"|"--";

export type BinaryOperator = ArithmeticOperator|BinaryBitwiseOperator|BitwiseShiftOperator|EqualityOperator|RelationalOperator;
export type PatternElement = IArrayPattern|IAssignmentPattern|IIdentifierExpression|IObjectPattern|IRestElement;