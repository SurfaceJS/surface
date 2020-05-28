export type ArithmeticOperator    = "+"|"-"|"*"|"/"|"%"|"**";
export type AssignmentOperator    = "="|"*="|"**="|"/="|"%="|"+="|"-="|"<<="|">>="|">>>="|"&="|"^="|"|=";
export type BinaryBitwiseOperator = "&"|"|"|"^";
export type BitwiseShiftOperator  = "<<"|">>"|">>>";
export type CoalesceOperator      = "??";
export type EqualityOperator      = "=="|"==="|"!="|"!==";
export type LiteralValue          = boolean|null|number|RegExp|string;
export type LogicalOperator       = "&&"|"||";
export type RelationalOperator    = "<="|">="|"<"|">"|"in"|"instanceof";
export type UnaryOperator         = "+"|"-"|"~"|"!"|"typeof";
export type UpdateOperator        = "++"|"--";

export type BinaryOperator = ArithmeticOperator|BinaryBitwiseOperator|BitwiseShiftOperator|EqualityOperator|RelationalOperator;