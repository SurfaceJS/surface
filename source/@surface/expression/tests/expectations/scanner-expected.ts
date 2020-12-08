/* eslint-disable max-lines */
import Messages   from "../../internal/messages.js";
import TokenType  from "../../internal/token-type.js";
import type Token from "../../internal/types/token.js";

export type ExpectedInvalidToken = { token: string, message: string };
export type ExpectedValidToken   = { source: string, token: Token };

export const validTokens: ExpectedValidToken[] =
[
    {
        source: "",
        token:
        {
            end:        0,
            lineNumber: 1,
            lineStart:  0,
            raw:        "",
            start:      0,
            type:       TokenType.EOF,
            value:      "",
        },
    },
    {
        source: "x",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "x",
            start:      0,
            type:       TokenType.Identifier,
            value:      "x",
        },
    },
    {
        source: " x",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "x",
            start:      1,
            type:       TokenType.Identifier,
            value:      "x",
        },
    },
    {
        source: "_identifier",
        token:
        {
            end:        11,
            lineNumber: 1,
            lineStart:  0,
            raw:        "_identifier",
            start:      0,
            type:       TokenType.Identifier,
            value:      "_identifier",
        },
    },
    {
        source: "identifier",
        token:
        {
            end:        10,
            lineNumber: 1,
            lineStart:  0,
            raw:        "identifier",
            start:      0,
            type:       TokenType.Identifier,
            value:      "identifier",
        },
    },
    {
        source: "undefined",
        token:
        {
            end:        9,
            lineNumber: 1,
            lineStart:  0,
            raw:        "undefined",
            start:      0,
            type:       TokenType.Identifier,
            value:      undefined,
        },
    },
    {
        source: "\\u0069\\u{65}",
        token:
        {
            end:        12,
            lineNumber: 1,
            lineStart:  0,
            raw:        "\\u0069\\u{65}",
            start:      0,
            type:       TokenType.Identifier,
            value:      "ie",
        },
    },
    {
        source: "\\u{65}\\u0069",
        token:
        {
            end:        12,
            lineNumber: 1,
            lineStart:  0,
            raw:        "\\u{65}\\u0069",
            start:      0,
            type:       TokenType.Identifier,
            value:      "ei",
        },
    },
    {
        source: "identifier_\\u{FF}",
        token:
        {
            end:        17,
            lineNumber: 1,
            lineStart:  0,
            raw:        "identifier_\\u{FF}",
            start:      0,
            type:       TokenType.Identifier,
            value:      "identifier_ÿ",
        },
    },
    {
        source: "識別子",
        token:
        {
            end:        3,
            lineNumber: 1,
            lineStart:  0,
            raw:        "識別子",
            start:      0,
            type:       TokenType.Identifier,
            value:      "識別子",
        },
    },
    {
        source: "foo你",
        token:
        {
            end:        5,
            lineNumber: 1,
            lineStart:  0,
            raw:        "foo你",
            start:      0,
            type:       TokenType.Identifier,
            value:      "foo你",
        },
    },
    {
        source: "你foo",
        token:
        {
            end:        5,
            lineNumber: 1,
            lineStart:  0,
            raw:        "你foo",
            start:      0,
            type:       TokenType.Identifier,
            value:      "你foo",
        },
    },
    {
        source: "\"double quotes\"",
        token:
        {
            end:        15,
            lineNumber: 1,
            lineStart:  0,
            octal:      false,
            raw:        "\"double quotes\"",
            start:      0,
            type:       TokenType.StringLiteral,
            value:      "double quotes",
        },
    },
    {
        source: "'\\n'",
        token:
        {
            end:        4,
            lineNumber: 1,
            lineStart:  0,
            octal:      false,
            raw:        "'\\n'",
            start:      0,
            type:       TokenType.StringLiteral,
            value:      "\n",
        },
    },
    {
        source: "'\\r'",
        token:
        {
            end:        4,
            lineNumber: 1,
            lineStart:  0,
            octal:      false,
            raw:        "'\\r'",
            start:      0,
            type:       TokenType.StringLiteral,
            value:      "\r",
        },
    },
    {
        source: "'\\b'",
        token:
        {
            end:        4,
            lineNumber: 1,
            lineStart:  0,
            octal:      false,
            raw:        "'\\b'",
            start:      0,
            type:       TokenType.StringLiteral,
            value:      "\b",
        },
    },
    {
        source: "'\\t'",
        token:
        {
            end:        4,
            lineNumber: 1,
            lineStart:  0,
            octal:      false,
            raw:        "'\\t'",
            start:      0,
            type:       TokenType.StringLiteral,
            value:      "\t",
        },
    },
    {
        source: "'\\f'",
        token:
        {
            end:        4,
            lineNumber: 1,
            lineStart:  0,
            octal:      false,
            raw:        "'\\f'",
            start:      0,
            type:       TokenType.StringLiteral,
            value:      "\f",
        },
    },
    {
        source: "'\\v'",
        token:
        {
            end:        4,
            lineNumber: 1,
            lineStart:  0,
            octal:      false,
            raw:        "'\\v'",
            start:      0,
            type:       TokenType.StringLiteral,
            value:      "\v",
        },
    },
    {
        source: "'\\1...'",
        token:
        {
            end:        7,
            lineNumber: 1,
            lineStart:  0,
            octal:      true,
            raw:        "'\\1...'",
            start:      0,
            type:       TokenType.StringLiteral,
            value:      "...",
        },
    },
    {
        source: "'\\11...'",
        token:
        {
            end:        8,
            lineNumber: 1,
            lineStart:  0,
            octal:      true,
            raw:        "'\\11...'",
            start:      0,
            type:       TokenType.StringLiteral,
            // eslint-disable-next-line no-tabs
            value:      "	...",
        },
    },
    {
        source: "'\\123...'",
        token:
        {
            end:        9,
            lineNumber: 1,
            lineStart:  0,
            octal:      true,
            raw:        "'\\123...'",
            start:      0,
            type:       TokenType.StringLiteral,
            value:      "S...",
        },
    },
    {
        source: "'\\u{A9}'",
        token:
        {
            end:        8,
            lineNumber: 1,
            lineStart:  0,
            octal:      false,
            raw:        "'\\u{A9}'",
            start:      0,
            type:       TokenType.StringLiteral,
            value:      "©",
        },
    },
    {
        source: "'\\u00A9'",
        token:
        {
            end:        8,
            lineNumber: 1,
            lineStart:  0,
            octal:      false,
            raw:        "'\\u00A9'",
            start:      0,
            type:       TokenType.StringLiteral,
            value:      "©",
        },
    },
    {
        source: "'\\xA9'",
        token:
        {
            end:        6,
            lineNumber: 1,
            lineStart:  0,
            octal:      false,
            raw:        "'\\xA9'",
            start:      0,
            type:       TokenType.StringLiteral,
            value:      "©",
        },
    },
    {
        source: "'\\z'",
        token:
        {
            end:        4,
            lineNumber: 1,
            lineStart:  0,
            octal:      false,
            raw:        "'\\z'",
            start:      0,
            type:       TokenType.StringLiteral,
            value:      "z",
        },
    },
    {
        source: "'single quotes'",
        token:
        {
            end:        15,
            lineNumber: 1,
            lineStart:  0,
            octal:      false,
            raw:        "'single quotes'",
            start:      0,
            type:       TokenType.StringLiteral,
            value:      "single quotes",
        },
    },
    {
        source: "\"quotes '`\"",
        token:
        {
            end:        11,
            lineNumber: 1,
            lineStart:  0,
            octal:      false,
            raw:        "\"quotes '`\"",
            start:      0,
            type:       TokenType.StringLiteral,
            value:      "quotes '`",
        },
    },
    {
        source: "'quotes \"`'",
        token:
        {
            end:        11,
            lineNumber: 1,
            lineStart:  0,
            octal:      false,
            raw:        "'quotes \"`'",
            start:      0,
            type:       TokenType.StringLiteral,
            value:      "quotes \"`",
        },
    },
    {
        source: "`\\n`",
        token:
        {
            end:        4,
            head:       true,
            lineNumber: 1,
            lineStart:  0,
            raw:        "\\n",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "\n",
        },
    },
    {
        source: "`\\r`",
        token:
        {
            end:        4,
            head:       true,
            lineNumber: 1,
            lineStart:  0,
            raw:        "\\r",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "\r",
        },
    },
    {
        source: "`\\b`",
        token:
        {
            end:        4,
            head:       true,
            lineNumber: 1,
            lineStart:  0,
            raw:        "\\b",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "\b",
        },
    },
    {
        source: "`\\t`",
        token:
        {
            end:        4,
            head:       true,
            lineNumber: 1,
            lineStart:  0,
            raw:        "\\t",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "\t",
        },
    },
    {
        source: "`\\f`",
        token:
        {
            end:        4,
            head:       true,
            lineNumber: 1,
            lineStart:  0,
            raw:        "\\f",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "\f",
        },
    },
    {
        source: "`\\v`",
        token:
        {
            end:        4,
            head:       true,
            lineNumber: 1,
            lineStart:  0,
            raw:        "\\v",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "\v",
        },
    },
    {
        source: "`\\u{A9}`",
        token:
        {
            end:        8,
            head:       true,
            lineNumber: 1,
            lineStart:  0,
            raw:        "\\u{A9}",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "©",
        },
    },
    {
        source: "`\\u00A9`",
        token:
        {
            end:        8,
            head:       true,
            lineNumber: 1,
            lineStart:  0,
            raw:        "\\u00A9",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "©",
        },
    },
    {
        source: "`\\ujs`",
        token:
        {
            end:        6,
            head:       true,
            lineNumber: 1,
            lineStart:  0,
            raw:        "\\ujs",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "\\ujs",
        },
    },
    {
        source: "`\\xA9`",
        token:
        {
            end:        6,
            head:       true,
            lineNumber: 1,
            lineStart:  0,
            raw:        "\\xA9",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "©",
        },
    },
    {
        source: "`\\z`",
        token:
        {
            end:        4,
            head:       true,
            lineNumber: 1,
            lineStart:  0,
            raw:        "\\z",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "z",
        },
    },
    {
        source: "`\\\r`",
        token:
        {
            end:        4,
            head:       true,
            lineNumber: 2,
            lineStart:  3,
            raw:        "\\\r",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "\\\n",
        },
    },
    {
        source: "`\\\r\n`",
        token:
        {
            end:        5,
            head:       true,
            lineNumber: 2,
            lineStart:  4,
            raw:        "\\\r\n",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "\\\n",
        },
    },
    {
        source: "`\r\n`",
        token:
        {
            end:        4,
            head:       true,
            lineNumber: 2,
            lineStart:  3,
            raw:        "\r\n",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "\n",
        },
    },
    {
        source: "`\\0a`",
        token:
        {
            end:        5,
            head:       true,
            lineNumber: 1,
            lineStart:  0,
            raw:        "\\0a",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "\0a",
        },
    },
    {
        source: "`foo\nbar`",
        token:
        {
            end:        9,
            head:       true,
            lineNumber: 2,
            lineStart:  5,
            raw:        "foo\nbar",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "foo\nbar",
        },
    },
    {
        source: "`foo$bar`",
        token:
        {
            end:        9,
            head:       true,
            lineNumber: 1,
            lineStart:  0,
            raw:        "foo$bar",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "foo$bar",
        },
    },
    {
        source: "`\\z`",
        token:
        {
            end:        4,
            head:       true,
            lineNumber: 1,
            lineStart:  0,
            raw:        "\\z",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "z",
        },
    },
    {
        source: "`string`",
        token:
        {
            end:        8,
            head:       true,
            lineNumber: 1,
            lineStart:  0,
            raw:        "string",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "string",
        },
    },
    {
        source: "`quotes \"'`",
        token:
        {
            end:        11,
            head:       true,
            lineNumber: 1,
            lineStart:  0,
            raw:        "quotes \"'",
            start:      0,
            tail:       true,
            type:       TokenType.Template,
            value:      "quotes \"'",
        },
    },
    {
        source: "1",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "1",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      1,
        },
    },
    {
        source: "123",
        token:
        {
            end:        3,
            lineNumber: 1,
            lineStart:  0,
            raw:        "123",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      123,
        },
    },
    {
        source: "123.123",
        token:
        {
            end:        7,
            lineNumber: 1,
            lineStart:  0,
            raw:        "123.123",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      123.123,
        },
    },
    {
        source: "0.",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "0.",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      0,
        },
    },
    {
        source: ".123",
        token:
        {
            end:        4,
            lineNumber: 1,
            lineStart:  0,
            raw:        ".123",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      0.123,
        },
    },
    {
        source: "123_123",
        token:
        {
            end:        7,
            lineNumber: 1,
            lineStart:  0,
            raw:        "123_123",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      123123,
        },
    },
    {
        source: "123_123.123",
        token:
        {
            end:        11,
            lineNumber: 1,
            lineStart:  0,
            raw:        "123_123.123",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      123123.123,
        },
    },
    {
        source: ".123_123",
        token:
        {
            end:        8,
            lineNumber: 1,
            lineStart:  0,
            raw:        ".123_123",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      0.123123,
        },
    },
    {
        source: "123e+1",
        token:
        {
            end:        6,
            lineNumber: 1,
            lineStart:  0,
            raw:        "123e+1",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      1230,
        },
    },
    {
        source: "123e-1",
        token:
        {
            end:        6,
            lineNumber: 1,
            lineStart:  0,
            raw:        "123e-1",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      12.3,
        },
    },
    {
        source: "0x0123456789abcdef",
        token:
        {
            end:        18,
            lineNumber: 1,
            lineStart:  0,
            raw:        "0x0123456789abcdef",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      81985529216486900,
        },
    },
    {
        source: "0X0123456789ABCDEF",
        token:
        {
            end:        18,
            lineNumber: 1,
            lineStart:  0,
            raw:        "0X0123456789ABCDEF",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      81985529216486900,
        },
    },
    {
        source: "0x0123456789_abcdef",
        token:
        {
            end:        19,
            lineNumber: 1,
            lineStart:  0,
            raw:        "0x0123456789_abcdef",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      81985529216486900,
        },
    },
    {
        source: "0X0123456789_ABCDEF",
        token:
        {
            end:        19,
            lineNumber: 1,
            lineStart:  0,
            raw:        "0X0123456789_ABCDEF",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      81985529216486900,
        },
    },
    {
        source: "0b0101",
        token:
        {
            end:        6,
            lineNumber: 1,
            lineStart:  0,
            raw:        "0b0101",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      5,
        },
    },
    {
        source: "0b0101 ",
        token:
        {
            end:        6,
            lineNumber: 1,
            lineStart:  0,
            raw:        "0b0101",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      5,
        },
    },
    {
        source: "0B0101",
        token:
        {
            end:        6,
            lineNumber: 1,
            lineStart:  0,
            raw:        "0B0101",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      5,
        },
    },
    {
        source: "0b0101_0101",
        token:
        {
            end:        11,
            lineNumber: 1,
            lineStart:  0,
            raw:        "0b0101_0101",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      85,
        },
    },
    {
        source: "0B0101_0101",
        token:
        {
            end:        11,
            lineNumber: 1,
            lineStart:  0,
            raw:        "0B0101_0101",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      85,
        },
    },
    {
        source: "018",
        token:
        {
            end:        3,
            lineNumber: 1,
            lineStart:  0,
            raw:        "018",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      18,
        },
    },
    {
        source: "019",
        token:
        {
            end:        3,
            lineNumber: 1,
            lineStart:  0,
            raw:        "019",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      19,
        },
    },
    {
        source: "08",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "08",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      8,
        },
    },
    {
        source: "01234567",
        token:
        {
            end:        8,
            lineNumber: 1,
            lineStart:  0,
            raw:        "01234567",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      342391,
        },
    },
    {
        source: "0_1234567",
        token:
        {
            end:        9,
            lineNumber: 1,
            lineStart:  0,
            raw:        "0_1234567",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      342391,
        },
    },
    {
        source: "0o1234567",
        token:
        {
            end:        9,
            lineNumber: 1,
            lineStart:  0,
            raw:        "0o1234567",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      342391,
        },
    },
    {
        source: "0O1234567",
        token:
        {
            end:        9,
            lineNumber: 1,
            lineStart:  0,
            raw:        "0O1234567",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      342391,
        },
    },
    {
        source: "0o1_234567",
        token:
        {
            end:        10,
            lineNumber: 1,
            lineStart:  0,
            raw:        "0o1_234567",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      342391,
        },
    },
    {
        source: "0O1_234567",
        token:
        {
            end:        10,
            lineNumber: 1,
            lineStart:  0,
            raw:        "0O1_234567",
            start:      0,
            type:       TokenType.NumericLiteral,
            value:      342391,
        },
    },
    {
        source: "true",
        token:
        {
            end:        4,
            lineNumber: 1,
            lineStart:  0,
            raw:        "true",
            start:      0,
            type:       TokenType.BooleanLiteral,
            value:      true,
        },
    },
    {
        source: "false",
        token:
        {
            end:        5,
            lineNumber: 1,
            lineStart:  0,
            raw:        "false",
            start:      0,
            type:       TokenType.BooleanLiteral,
            value:      false,
        },
    },
    {
        source: "null",
        token:
        {
            end:        4,
            lineNumber: 1,
            lineStart:  0,
            raw:        "null",
            start:      0,
            type:       TokenType.NullLiteral,
            value:      null,
        },
    },
    {
        source: "if",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "if",
            start:      0,
            type:       TokenType.Keyword,
            value:      "if",
        },
    },
    {
        source: "in",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "in",
            start:      0,
            type:       TokenType.Keyword,
            value:      "in",
        },
    },
    {
        source: "do",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "do",
            start:      0,
            type:       TokenType.Keyword,
            value:      "do",
        },
    },
    {
        source: "var",
        token:
        {
            end:        3,
            lineNumber: 1,
            lineStart:  0,
            raw:        "var",
            start:      0,
            type:       TokenType.Keyword,
            value:      "var",
        },
    },
    {
        source: "for",
        token:
        {
            end:        3,
            lineNumber: 1,
            lineStart:  0,
            raw:        "for",
            start:      0,
            type:       TokenType.Keyword,
            value:      "for",
        },
    },
    {
        source: "new",
        token:
        {
            end:        3,
            lineNumber: 1,
            lineStart:  0,
            raw:        "new",
            start:      0,
            type:       TokenType.Keyword,
            value:      "new",
        },
    },
    {
        source: "try",
        token:
        {
            end:        3,
            lineNumber: 1,
            lineStart:  0,
            raw:        "try",
            start:      0,
            type:       TokenType.Keyword,
            value:      "try",
        },
    },
    {
        source: "let",
        token:
        {
            end:        3,
            lineNumber: 1,
            lineStart:  0,
            raw:        "let",
            start:      0,
            type:       TokenType.Keyword,
            value:      "let",
        },
    },
    {
        source: "this",
        token:
        {
            end:        4,
            lineNumber: 1,
            lineStart:  0,
            raw:        "this",
            start:      0,
            type:       TokenType.Keyword,
            value:      "this",
        },
    },
    {
        source: "else",
        token:
        {
            end:        4,
            lineNumber: 1,
            lineStart:  0,
            raw:        "else",
            start:      0,
            type:       TokenType.Keyword,
            value:      "else",
        },
    },
    {
        source: "case",
        token:
        {
            end:        4,
            lineNumber: 1,
            lineStart:  0,
            raw:        "case",
            start:      0,
            type:       TokenType.Keyword,
            value:      "case",
        },
    },
    {
        source: "void",
        token:
        {
            end:        4,
            lineNumber: 1,
            lineStart:  0,
            raw:        "void",
            start:      0,
            type:       TokenType.Keyword,
            value:      "void",
        },
    },
    {
        source: "with",
        token:
        {
            end:        4,
            lineNumber: 1,
            lineStart:  0,
            raw:        "with",
            start:      0,
            type:       TokenType.Keyword,
            value:      "with",
        },
    },
    {
        source: "enum",
        token:
        {
            end:        4,
            lineNumber: 1,
            lineStart:  0,
            raw:        "enum",
            start:      0,
            type:       TokenType.Keyword,
            value:      "enum",
        },
    },
    {
        source: "while",
        token:
        {
            end:        5,
            lineNumber: 1,
            lineStart:  0,
            raw:        "while",
            start:      0,
            type:       TokenType.Keyword,
            value:      "while",
        },
    },
    {
        source: "break",
        token:
        {
            end:        5,
            lineNumber: 1,
            lineStart:  0,
            raw:        "break",
            start:      0,
            type:       TokenType.Keyword,
            value:      "break",
        },
    },
    {
        source: "catch",
        token:
        {
            end:        5,
            lineNumber: 1,
            lineStart:  0,
            raw:        "catch",
            start:      0,
            type:       TokenType.Keyword,
            value:      "catch",
        },
    },
    {
        source: "throw",
        token:
        {
            end:        5,
            lineNumber: 1,
            lineStart:  0,
            raw:        "throw",
            start:      0,
            type:       TokenType.Keyword,
            value:      "throw",
        },
    },
    {
        source: "const",
        token:
        {
            end:        5,
            lineNumber: 1,
            lineStart:  0,
            raw:        "const",
            start:      0,
            type:       TokenType.Keyword,
            value:      "const",
        },
    },
    {
        source: "yield",
        token:
        {
            end:        5,
            lineNumber: 1,
            lineStart:  0,
            raw:        "yield",
            start:      0,
            type:       TokenType.Keyword,
            value:      "yield",
        },
    },
    {
        source: "class",
        token:
        {
            end:        5,
            lineNumber: 1,
            lineStart:  0,
            raw:        "class",
            start:      0,
            type:       TokenType.Keyword,
            value:      "class",
        },
    },
    {
        source: "super",
        token:
        {
            end:        5,
            lineNumber: 1,
            lineStart:  0,
            raw:        "super",
            start:      0,
            type:       TokenType.Keyword,
            value:      "super",
        },
    },
    {
        source: "return",
        token:
        {
            end:        6,
            lineNumber: 1,
            lineStart:  0,
            raw:        "return",
            start:      0,
            type:       TokenType.Keyword,
            value:      "return",
        },
    },
    {
        source: "typeof",
        token:
        {
            end:        6,
            lineNumber: 1,
            lineStart:  0,
            raw:        "typeof",
            start:      0,
            type:       TokenType.Keyword,
            value:      "typeof",
        },
    },
    {
        source: "delete",
        token:
        {
            end:        6,
            lineNumber: 1,
            lineStart:  0,
            raw:        "delete",
            start:      0,
            type:       TokenType.Keyword,
            value:      "delete",
        },
    },
    {
        source: "switch",
        token:
        {
            end:        6,
            lineNumber: 1,
            lineStart:  0,
            raw:        "switch",
            start:      0,
            type:       TokenType.Keyword,
            value:      "switch",
        },
    },
    {
        source: "export",
        token:
        {
            end:        6,
            lineNumber: 1,
            lineStart:  0,
            raw:        "export",
            start:      0,
            type:       TokenType.Keyword,
            value:      "export",
        },
    },
    {
        source: "import",
        token:
        {
            end:        6,
            lineNumber: 1,
            lineStart:  0,
            raw:        "import",
            start:      0,
            type:       TokenType.Keyword,
            value:      "import",
        },
    },
    {
        source: "default",
        token:
        {
            end:        7,
            lineNumber: 1,
            lineStart:  0,
            raw:        "default",
            start:      0,
            type:       TokenType.Keyword,
            value:      "default",
        },
    },
    {
        source: "finally",
        token:
        {
            end:        7,
            lineNumber: 1,
            lineStart:  0,
            raw:        "finally",
            start:      0,
            type:       TokenType.Keyword,
            value:      "finally",
        },
    },
    {
        source: "extends",
        token:
        {
            end:        7,
            lineNumber: 1,
            lineStart:  0,
            raw:        "extends",
            start:      0,
            type:       TokenType.Keyword,
            value:      "extends",
        },
    },
    {
        source: "function",
        token:
        {
            end:        8,
            lineNumber: 1,
            lineStart:  0,
            raw:        "function",
            start:      0,
            type:       TokenType.Keyword,
            value:      "function",
        },
    },
    {
        source: "function",
        token:
        {
            end:        8,
            lineNumber: 1,
            lineStart:  0,
            raw:        "function",
            start:      0,
            type:       TokenType.Keyword,
            value:      "function",
        },
    },
    {
        source: "debugger",
        token:
        {
            end:        8,
            lineNumber: 1,
            lineStart:  0,
            raw:        "debugger",
            start:      0,
            type:       TokenType.Keyword,
            value:      "debugger",
        },
    },
    {
        source: "instanceof",
        token:
        {
            end:        10,
            lineNumber: 1,
            lineStart:  0,
            raw:        "instanceof",
            start:      0,
            type:       TokenType.Keyword,
            value:      "instanceof",
        },
    },
    {
        source: "(",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "(",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "(",
        },
    },
    {
        source: "{",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "{",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "{",
        },
    },
    {
        source: ".",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        ".",
            start:      0,
            type:       TokenType.Punctuator,
            value:      ".",
        },
    },
    {
        source: "...",
        token:
        {
            end:        3,
            lineNumber: 1,
            lineStart:  0,
            raw:        "...",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "...",
        },
    },
    {
        source: "}",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "}",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "}",
        },
    },
    {
        source: ")",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        ")",
            start:      0,
            type:       TokenType.Punctuator,
            value:      ")",
        },
    },
    {
        source: ";",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        ";",
            start:      0,
            type:       TokenType.Punctuator,
            value:      ";",
        },
    },
    {
        source: ",",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        ",",
            start:      0,
            type:       TokenType.Punctuator,
            value:      ",",
        },
    },
    {
        source: "[",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "[",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "[",
        },
    },
    {
        source: "]",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "]",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "]",
        },
    },
    {
        source: ":",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        ":",
            start:      0,
            type:       TokenType.Punctuator,
            value:      ":",
        },
    },
    {
        source: "?",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "?",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "?",
        },
    },
    {
        source: "?.",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "?.",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "?.",
        },
    },
    {
        source: "?.0",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "?",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "?",
        },
    },
    {
        source: "?.x",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "?.",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "?.",
        },
    },
    {
        source: "??",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "??",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "??",
        },
    },
    {
        source: "~",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "~",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "~",
        },
    },
    {
        source: ">>>=",
        token:
        {
            end:        4,
            lineNumber: 1,
            lineStart:  0,
            raw:        ">>>=",
            start:      0,
            type:       TokenType.Punctuator,
            value:      ">>>=",
        },
    },
    {
        source: "===",
        token:
        {
            end:        3,
            lineNumber: 1,
            lineStart:  0,
            raw:        "===",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "===",
        },
    },
    {
        source: "!==",
        token:
        {
            end:        3,
            lineNumber: 1,
            lineStart:  0,
            raw:        "!==",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "!==",
        },
    },
    {
        source: ">>>",
        token:
        {
            end:        3,
            lineNumber: 1,
            lineStart:  0,
            raw:        ">>>",
            start:      0,
            type:       TokenType.Punctuator,
            value:      ">>>",
        },
    },
    {
        source: "<<=",
        token:
        {
            end:        3,
            lineNumber: 1,
            lineStart:  0,
            raw:        "<<=",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "<<=",
        },
    },
    {
        source: ">>=",
        token:
        {
            end:        3,
            lineNumber: 1,
            lineStart:  0,
            raw:        ">>=",
            start:      0,
            type:       TokenType.Punctuator,
            value:      ">>=",
        },
    },
    {
        source: "**=",
        token:
        {
            end:        3,
            lineNumber: 1,
            lineStart:  0,
            raw:        "**=",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "**=",
        },
    },
    {
        source: "&&",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "&&",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "&&",
        },
    },
    {
        source: "||",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "||",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "||",
        },
    },
    {
        source: "==",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "==",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "==",
        },
    },
    {
        source: "!=",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "!=",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "!=",
        },
    },
    {
        source: "+=",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "+=",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "+=",
        },
    },
    {
        source: "-=",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "-=",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "-=",
        },
    },
    {
        source: "*=",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "*=",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "*=",
        },
    },
    {
        source: "/=",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "/=",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "/=",
        },
    },
    {
        source: "++",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "++",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "++",
        },
    },
    {
        source: "--",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "--",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "--",
        },
    },
    {
        source: "<<",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "<<",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "<<",
        },
    },
    {
        source: ">>",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        ">>",
            start:      0,
            type:       TokenType.Punctuator,
            value:      ">>",
        },
    },
    {
        source: "&=",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "&=",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "&=",
        },
    },
    {
        source: "|=",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "|=",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "|=",
        },
    },
    {
        source: "^=",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "^=",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "^=",
        },
    },
    {
        source: "%=",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "%=",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "%=",
        },
    },
    {
        source: "<=",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "<=",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "<=",
        },
    },
    {
        source: ">=",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        ">=",
            start:      0,
            type:       TokenType.Punctuator,
            value:      ">=",
        },
    },
    {
        source: "=>",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "=>",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "=>",
        },
    },
    {
        source: "**",
        token:
        {
            end:        2,
            lineNumber: 1,
            lineStart:  0,
            raw:        "**",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "**",
        },
    },
    {
        source: "<",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "<",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "<",
        },
    },
    {
        source: ">",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        ">",
            start:      0,
            type:       TokenType.Punctuator,
            value:      ">",
        },
    },
    {
        source: "=",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "=",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "=",
        },
    },
    {
        source: "!",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "!",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "!",
        },
    },
    {
        source: "+",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "+",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "+",
        },
    },
    {
        source: "-",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "-",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "-",
        },
    },
    {
        source: "*",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "*",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "*",
        },
    },
    {
        source: "%",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "%",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "%",
        },
    },
    {
        source: "&",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "&",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "&",
        },
    },
    {
        source: "|",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "|",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "|",
        },
    },
    {
        source: "^",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "^",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "^",
        },
    },
    {
        source: "/",
        token:
        {
            end:        1,
            lineNumber: 1,
            lineStart:  0,
            raw:        "/",
            start:      0,
            type:       TokenType.Punctuator,
            value:      "/",
        },
    },
];

export const invalidTokens: ExpectedInvalidToken[] =
[
    { message: Messages.invalidOrUnexpectedToken,                    token: "𐏿" },
    { message: Messages.invalidUnicodeEscapeSequence,                token: "\\u{}" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "0.123e*1" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "¬" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "1i" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "\\xD800" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "\\uD800" },
    { message: Messages.invalidUnicodeEscapeSequence,                token: "\\u{AH}" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "\\u{123}\\x" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "\\u{123}\\uD800" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "x\\z" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "0x" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "0xFFoo" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "0xhij" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "0b23" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "'\r'" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "'\\\r'" },
    { message: Messages.invalidUnicodeEscapeSequence,                token: "'\\uA9'" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "0b" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "0B" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "0B0a" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "0B09" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "0o8" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "0O8" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "0o1a" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "0O1a" },
    { message: Messages.invalidOrUnexpectedToken,                    token: "`foo" },
    { message: Messages.octalLiteralsAreNotAllowedInTemplateStrings, token: "`\\1`" },
    { message: Messages.octalLiteralsAreNotAllowedInTemplateStrings, token: "`\\01`" },
    { message: Messages.keywordMustNotContainEscapedCharacters,      token: "\\u{006E}\\u{0065}\\u{0077}" },
    { message: Messages.invalidHexadecimalEscapeSequence,            token: "'\\xh'" },
    { message: Messages.invalidHexadecimalEscapeSequence,            token: "`\\xh`" },
    { message: Messages.numericSerapatorsAreNotAllowedHere,          token: "1_.123" },
    { message: Messages.numericSerapatorsAreNotAllowedHere,          token: "1._123" },
    { message: Messages.numericSerapatorsAreNotAllowedHere,          token: "1.123_" },
    { message: Messages.numericSerapatorsAreNotAllowedHere,          token: "0x_12" },
    { message: Messages.numericSerapatorsAreNotAllowedHere,          token: "0x12_" },
    { message: Messages.numericSerapatorsAreNotAllowedHere,          token: "0b_10" },
    { message: Messages.numericSerapatorsAreNotAllowedHere,          token: "0b10_" },
    { message: Messages.numericSerapatorsAreNotAllowedHere,          token: "0o_10" },
    { message: Messages.numericSerapatorsAreNotAllowedHere,          token: "0O_10" },
    { message: Messages.numericSerapatorsAreNotAllowedHere,          token: "0o10_" },
    { message: Messages.numericSerapatorsAreNotAllowedHere,          token: "0O10_" },
    { message: Messages.numericSerapatorsAreNotAllowedHere,          token: "010_" },
];