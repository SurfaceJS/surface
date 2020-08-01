import TokenType from "../enums/token-type";

type Token =
{
    index: number;
    type:  TokenType;
    value: string;
}

export default Token