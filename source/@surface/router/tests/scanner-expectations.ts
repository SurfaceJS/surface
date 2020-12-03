import TokenType from "../internal/enums/token-type";
import Token     from "../internal/types/token";

export type ScannerValidExpectation =
{
    source: string,
    token:  Token,
};

export type ScannerInvalidExpectation =
{
    error:  Error,
    source: string,
};

export const scannerValidExpectations: ScannerValidExpectation[] =
[
    {
        source: "",
        token:  { index: 0, type: TokenType.Eof, value: "" },
    },
    {
        source: " ",
        token:  { index: 0, type: TokenType.Space, value: " " },
    },
    {
        source: "path",
        token:  { index: 0, type: TokenType.Literal, value: "path" },
    },
    {
        source: "/",
        token:  { index: 0, type: TokenType.Punctuator, value: "/" },
    },
    {
        source: "{",
        token:  { index: 0, type: TokenType.Punctuator, value: "{" },
    },
    {
        source: "}",
        token:  { index: 0, type: TokenType.Punctuator, value: "}" },
    },
    {
        source: "=",
        token:  { index: 0, type: TokenType.Punctuator, value: "=" },
    },
    {
        source: ":",
        token:  { index: 0, type: TokenType.Punctuator, value: ":" },
    },
    {
        source: "*",
        token:  { index: 0, type: TokenType.Punctuator, value: "*" },
    },
    {
        source: "?",
        token:  { index: 0, type: TokenType.Punctuator, value: "?" },
    },
];

export const scannerInvalidExpectations: ScannerInvalidExpectation[] =
[
    {
        error:  new Error(),
        source: "",
    },
];