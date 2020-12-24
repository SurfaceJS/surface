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
    isHead?:    boolean,
    isOctal?:   boolean,
    pattern?:   string,
    isTail?:    boolean,
};

export default Token;