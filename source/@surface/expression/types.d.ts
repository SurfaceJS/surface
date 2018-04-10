export type ArithmeticOperator    = "+"|"-"|"*"|"/"|"%"|"**";
export type BinaryBitwiseOperator = "&"|"|"|"^";
export type BinaryLogicalOperator = "&&"|"||";
export type BitwiseShiftOperator  = "<<"|">>"|">>>"
export type EqualityOperator      = "=="|"==="|"!="|"!=="
export type RelationalOperator    = "<="|">="|"<"|">"|"in"|"instanceof";
export type UnaryOperator         = "+"|"-"|"~"|"!"|"typeof";
export type UpdateOperator        = "++"|"--";

export type BinaryOperator = ArithmeticOperator|BinaryBitwiseOperator|BinaryLogicalOperator|BitwiseShiftOperator|EqualityOperator|RelationalOperator;