import { Indexer }        from "@surface/core";
import IArrayPattern      from "./interfaces/array-pattern";
import IAssignmentPattern from "./interfaces/assignment-pattern";
import IIdentifier        from "./interfaces/identifier";
import IObjectPattern     from "./interfaces/object-pattern";
import IRestElement       from "./interfaces/rest-element";

export type ArithmeticOperator    = "+"|"-"|"*"|"/"|"%"|"**";
export type AssignmentOperator    = "="|"*="|"**="|"/="|"%="|"+="|"-="|"<<="|">>="|">>>="|"&="|"^="|"|=";
export type BinaryBitwiseOperator = "&"|"|"|"^";
export type BitwiseShiftOperator  = "<<"|">>"|">>>";
export type EqualityOperator      = "=="|"==="|"!="|"!==";
export type LiteralValue          = boolean|null|number|RegExp|string;
export type LogicalOperator       = "&&"|"||";
export type RelationalOperator    = "<="|">="|"<"|">"|"in"|"instanceof";
export type UnaryOperator         = "+"|"-"|"~"|"!"|"typeof";
export type UpdateOperator        = "++"|"--";

export type BinaryOperator = ArithmeticOperator|BinaryBitwiseOperator|BitwiseShiftOperator|EqualityOperator|RelationalOperator;