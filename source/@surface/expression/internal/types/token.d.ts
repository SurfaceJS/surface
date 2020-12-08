import type TokenType from "../token-type.js";

type Token =
{
    end:        number,
    lineNumber: number,
    lineStart:  number,
    raw:        string,
    start:      number,
    type:       TokenType,
    value:      unknown,
    flags?:     string,
    head?:      boolean,
    octal?:     boolean,
    pattern?:   string,
    tail?:      boolean,
};

export default Token;