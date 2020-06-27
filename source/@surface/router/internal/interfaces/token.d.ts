import TokenType from "../enums/token-type";

export default interface IToken
{
    index: number;
    type:  TokenType;
    value: string;
}