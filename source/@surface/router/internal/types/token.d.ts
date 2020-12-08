import type TokenType from "../enums/token-type.js";

type Token =
{
    index: number,
    type:  TokenType,
    value: string,
};

export default Token;