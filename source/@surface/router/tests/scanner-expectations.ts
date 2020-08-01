import TokenType from "../internal/enums/token-type";
import Token     from "../internal/types/token";

export type ScannerValidExpectation =
{
    source: string,
    token:  Token
};

export type ScannerInvalidExpectation =
{
    error:  Error
    source: string,
};

export const scannerValidExpectations: Array<ScannerValidExpectation> =
[
    {
        source: "",
        token:  { index: 0, value: "", type: TokenType.Eof }
    },
    {
        source: " ",
        token:  { index: 0, value: " ", type: TokenType.Space }
    },
    {
        source: "path",
        token:  { index: 0, value: "path", type: TokenType.Literal }
    },
    {
        token:  { index: 0, value: "/", type: TokenType.Punctuator },
        source: "/",
    },
    {
        token:  { index: 0, value: "{", type: TokenType.Punctuator },
        source: "{",
    },
    {
        token:  { index: 0, value: "}", type: TokenType.Punctuator },
        source: "}",
    },
    {
        token:  { index: 0, value: "=", type: TokenType.Punctuator },
        source: "=",
    },
    {
        token:  { index: 0, value: ":", type: TokenType.Punctuator },
        source: ":",
    },
    {
        token:  { index: 0, value: "*", type: TokenType.Punctuator },
        source: "*",
    },
    {
        token:  { index: 0, value: "?", type: TokenType.Punctuator },
        source: "?",
    },
];

export const scannerInvalidExpectations: Array<ScannerInvalidExpectation> =
[
    {
        source: "",
        error:  new Error()
    },
];