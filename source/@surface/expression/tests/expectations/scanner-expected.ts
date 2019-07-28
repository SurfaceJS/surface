import Messages  from "../../internal/messages";
import { Token } from "../../internal/scanner";
import TokenType from "../../internal/token-type";

export type ExpectedInvalidToken = { token: string, message: string };
export type ExpectedValidToken   = { source: string, token: Token };

export const validTokens: Array<ExpectedValidToken> =
[
    {
        source: "",
        token:
        {
            raw:        "",
            value:      "",
            type:       TokenType.EOF,
            start:      0,
            end:        0,
            lineStart:  0,
            lineNumber: 1,
        },
    },
    {
        source: "x",
        token:
        {
            raw:        "x",
            value:      "x",
            type:       TokenType.Identifier,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1,
        },
    },
    {
        source: " x",
        token:
        {
            raw:        "x",
            value:      "x",
            type:       TokenType.Identifier,
            start:      1,
            end:        2,
            lineStart:  0,
            lineNumber: 1,
        },
    },
    {
        source: "_identifier",
        token:
        {
            raw:        "_identifier",
            value:      "_identifier",
            type:       TokenType.Identifier,
            start:      0,
            end:        11,
            lineStart:  0,
            lineNumber: 1,
        },
    },
    {
        source: "identifier",
        token:
        {
            raw:        "identifier",
            value:      "identifier",
            type:       TokenType.Identifier,
            start:      0,
            end:        10,
            lineStart:  0,
            lineNumber: 1,
        },
    },
    {
        source: "undefined",
        token:
        {
            raw:        "undefined",
            value:      undefined,
            type:       TokenType.Identifier,
            start:      0,
            end:        9,
            lineStart:  0,
            lineNumber: 1,
        },
    },
    {
        source: "\\u0069\\u{65}",
        token:
        {
            raw:        "\\u0069\\u{65}",
            value:      "ie",
            type:       TokenType.Identifier,
            start:      0,
            end:        12,
            lineStart:  0,
            lineNumber: 1,
        },
    },
    {
        source: "\\u{65}\\u0069",
        token:
        {
            raw:        "\\u{65}\\u0069",
            value:      "ei",
            type:       TokenType.Identifier,
            start:      0,
            end:        12,
            lineStart:  0,
            lineNumber: 1,
        },
    },
    {
        source: "identifier_\\u{FF}",
        token:
        {
            raw:        "identifier_\\u{FF}",
            value:      "identifier_ÿ",
            type:       TokenType.Identifier,
            start:      0,
            end:        17,
            lineStart:  0,
            lineNumber: 1,
        },
    },
    {
        source: "識別子",
        token:
        {
            raw:        "識別子",
            value:      "識別子",
            type:       TokenType.Identifier,
            start:      0,
            end:        3,
            lineStart:  0,
            lineNumber: 1,
        },
    },
    {
        source: "foo你",
        token:
        {
            raw:        "foo你",
            value:      "foo你",
            type:       TokenType.Identifier,
            start:      0,
            end:        5,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "你foo",
        token:
        {
            raw:        "你foo",
            value:      "你foo",
            type:       TokenType.Identifier,
            start:      0,
            end:        5,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "\"double quotes\"",
        token:
        {
            raw:        "\"double quotes\"",
            value:      "double quotes",
            type:       TokenType.StringLiteral,
            start:      0,
            end:        15,
            lineStart:  0,
            lineNumber: 1,
            octal:      false
        },
    },
    {
        source: "'\\n'",
        token:
        {
            raw:        "'\\n'",
            value:      "\n",
            type:       TokenType.StringLiteral,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1,
            octal:      false
        },
    },
    {
        source: "'\\r'",
        token:
        {
            raw:        "'\\r'",
            value:      "\r",
            type:       TokenType.StringLiteral,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1,
            octal:      false
        },
    },
    {
        source: "'\\b'",
        token:
        {
            raw:        "'\\b'",
            value:      "\b",
            type:       TokenType.StringLiteral,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1,
            octal:      false
        },
    },
    {
        source: "'\\t'",
        token:
        {
            raw:        "'\\t'",
            value:      "\t",
            type:       TokenType.StringLiteral,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1,
            octal:      false
        },
    },
    {
        source: "'\\f'",
        token:
        {
            raw:        "'\\f'",
            value:      "\f",
            type:       TokenType.StringLiteral,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1,
            octal:      false
        },
    },
    {
        source: "'\\v'",
        token:
        {
            raw:        "'\\v'",
            value:      "\v",
            type:       TokenType.StringLiteral,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1,
            octal:      false
        },
    },
    {
        source: "'\\1...'",
        token:
        {
            raw:        "'\\1...'",
            value:      "...",
            type:       TokenType.StringLiteral,
            start:      0,
            end:        7,
            lineStart:  0,
            lineNumber: 1,
            octal:      true
        },
    },
    {
        source: "'\\11...'",
        token:
        {
            raw:        "'\\11...'",
            value:      "	...",
            type:       TokenType.StringLiteral,
            start:      0,
            end:        8,
            lineStart:  0,
            lineNumber: 1,
            octal:      true
        },
    },
    {
        source: "'\\123...'",
        token:
        {
            raw:        "'\\123...'",
            value:      "S...",
            type:       TokenType.StringLiteral,
            start:      0,
            end:        9,
            lineStart:  0,
            lineNumber: 1,
            octal:      true
        },
    },
    {
        source: "'\\u{A9}'",
        token:
        {
            raw:        "'\\u{A9}'",
            value:      "©",
            type:       TokenType.StringLiteral,
            start:      0,
            end:        8,
            lineStart:  0,
            lineNumber: 1,
            octal:      false
        },
    },
    {
        source: "'\\u00A9'",
        token:
        {
            raw:        "'\\u00A9'",
            value:      "©",
            type:       TokenType.StringLiteral,
            start:      0,
            end:        8,
            lineStart:  0,
            lineNumber: 1,
            octal:      false
        },
    },
    {
        source: "'\\xA9'",
        token:
        {
            raw:        "'\\xA9'",
            value:      "©",
            type:       TokenType.StringLiteral,
            start:      0,
            end:        6,
            lineStart:  0,
            lineNumber: 1,
            octal:      false
        },
    },
    {
        source: "'\\z'",
        token:
        {
            raw:        "'\\z'",
            value:      "z",
            type:       TokenType.StringLiteral,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1,
            octal:      false
        },
    },
    {
        source: "'single quotes'",
        token:
        {
            raw:        "'single quotes'",
            value:      "single quotes",
            type:       TokenType.StringLiteral,
            start:      0,
            end:        15,
            lineStart:  0,
            lineNumber: 1,
            octal:      false
        },
    },
    {
        source: "\"quotes '`\"",
        token:
        {
            raw:        "\"quotes '`\"",
            value:      "quotes '`",
            type:       TokenType.StringLiteral,
            start:      0,
            end:        11,
            lineStart:  0,
            lineNumber: 1,
            octal:      false
        },
    },
    {
        source: "'quotes \"`'",
        token:
        {
            raw:        "'quotes \"`'",
            value:      "quotes \"`",
            type:       TokenType.StringLiteral,
            start:      0,
            end:        11,
            lineStart:  0,
            lineNumber: 1,
            octal:      false
        },
    },
    {
        source: "`\\n`",
        token:
        {
            raw:        "\\n",
            value:      "\n",
            type:       TokenType.Template,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`\\r`",
        token:
        {
            raw:        "\\r",
            value:      "\r",
            type:       TokenType.Template,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`\\b`",
        token:
        {
            raw:        "\\b",
            value:      "\b",
            type:       TokenType.Template,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`\\t`",
        token:
        {
            raw:        "\\t",
            value:      "\t",
            type:       TokenType.Template,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`\\f`",
        token:
        {
            raw:        "\\f",
            value:      "\f",
            type:       TokenType.Template,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`\\v`",
        token:
        {
            raw:        "\\v",
            value:      "\v",
            type:       TokenType.Template,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`\\u{A9}`",
        token:
        {
            raw:        "\\u{A9}",
            value:      "©",
            type:       TokenType.Template,
            start:      0,
            end:        8,
            lineStart:  0,
            lineNumber: 1,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`\\u00A9`",
        token:
        {
            raw:        "\\u00A9",
            value:      "©",
            type:       TokenType.Template,
            start:      0,
            end:        8,
            lineStart:  0,
            lineNumber: 1,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`\\ujs`",
        token:
        {
            raw:        "\\ujs",
            value:      "\\ujs",
            type:       TokenType.Template,
            start:      0,
            end:        6,
            lineStart:  0,
            lineNumber: 1,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`\\xA9`",
        token:
        {
            raw:        "\\xA9",
            value:      "©",
            type:       TokenType.Template,
            start:      0,
            end:        6,
            lineStart:  0,
            lineNumber: 1,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`\\z`",
        token:
        {
            raw:        "\\z",
            value:      "z",
            type:       TokenType.Template,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`\\\r`",
        token:
        {
            raw:        "\\\r",
            value:      "\\\n",
            type:       TokenType.Template,
            start:      0,
            end:        4,
            lineStart:  3,
            lineNumber: 2,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`\\\r\n`",
        token:
        {
            raw:        "\\\r\n",
            value:      "\\\n",
            type:       TokenType.Template,
            start:      0,
            end:        5,
            lineStart:  4,
            lineNumber: 2,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`\r\n`",
        token:
        {
            raw:        "\r\n",
            value:      "\n",
            type:       TokenType.Template,
            start:      0,
            end:        4,
            lineStart:  3,
            lineNumber: 2,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`\\0a`",
        token:
        {
            raw:        "\\0a",
            value:      "\0a",
            type:       TokenType.Template,
            start:      0,
            end:        5,
            lineStart:  0,
            lineNumber: 1,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`foo\nbar`",
        token:
        {
            raw:        "foo\nbar",
            value:      "foo\nbar",
            type:       TokenType.Template,
            start:      0,
            end:        9,
            lineStart:  5,
            lineNumber: 2,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`foo$bar`",
        token:
        {
            raw:        "foo$bar",
            value:      "foo$bar",
            type:       TokenType.Template,
            start:      0,
            end:        9,
            lineStart:  0,
            lineNumber: 1,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`\\z`",
        token:
        {
            raw:        "\\z",
            value:      "z",
            type:       TokenType.Template,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`string`",
        token:
        {
            raw:        "string",
            value:      "string",
            type:       TokenType.Template,
            start:      0,
            end:        8,
            lineStart:  0,
            lineNumber: 1,
            head:       true,
            tail:       true
        },
    },
    {
        source: "`quotes \"'`",
        token:
        {
            raw:        "quotes \"'",
            value:      "quotes \"'",
            type:       TokenType.Template,
            start:      0,
            end:        11,
            lineStart:  0,
            lineNumber: 1,
            head:       true,
            tail:       true
        },
    },
    {
        source: "1",
        token:
        {
            raw:        "1",
            value:      1,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "123",
        token:
        {
            raw:        "123",
            value:      123,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        3,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "123.123",
        token:
        {
            raw:        "123.123",
            value:      123.123,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        7,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "0.",
        token:
        {
            raw:        "0.",
            value:      0,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: ".123",
        token:
        {
            raw:        ".123",
            value:      0.123,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "123_123",
        token:
        {
            raw:        "123_123",
            value:      123123,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        7,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "123_123.123",
        token:
        {
            raw:        "123_123.123",
            value:      123123.123,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        11,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: ".123_123",
        token:
        {
            raw:        ".123_123",
            value:      0.123123,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        8,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "123e+1",
        token:
        {
            raw:        "123e+1",
            value:      1230,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        6,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "123e-1",
        token:
        {
            raw:        "123e-1",
            value:      12.3,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        6,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "0x0123456789abcdef",
        token:
        {
            raw:        "0x0123456789abcdef",
            value:      81985529216486900,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        18,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "0X0123456789ABCDEF",
        token:
        {
            raw:        "0X0123456789ABCDEF",
            value:      81985529216486900,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        18,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "0x0123456789_abcdef",
        token:
        {
            raw:        "0x0123456789_abcdef",
            value:      81985529216486900,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        19,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "0X0123456789_ABCDEF",
        token:
        {
            raw:        "0X0123456789_ABCDEF",
            value:      81985529216486900,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        19,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "0b0101",
        token:
        {
            raw:        "0b0101",
            value:      5,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        6,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "0b0101 ",
        token:
        {
            raw:        "0b0101",
            value:      5,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        6,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "0B0101",
        token:
        {
            raw:        "0B0101",
            value:      5,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        6,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "0b0101_0101",
        token:
        {
            raw:        "0b0101_0101",
            value:      85,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        11,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "0B0101_0101",
        token:
        {
            raw:        "0B0101_0101",
            value:      85,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        11,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "018",
        token:
        {
            raw:        "018",
            value:      18,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        3,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "019",
        token:
        {
            raw:        "019",
            value:      19,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        3,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "08",
        token:
        {
            raw:        "08",
            value:      8,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "01234567",
        token:
        {
            raw:        "01234567",
            value:      342391,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        8,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "0_1234567",
        token:
        {
            raw:        "0_1234567",
            value:      342391,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        9,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "0o1234567",
        token:
        {
            raw:        "0o1234567",
            value:      342391,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        9,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "0O1234567",
        token:
        {
            raw:        "0O1234567",
            value:      342391,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        9,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "0o1_234567",
        token:
        {
            raw:        "0o1_234567",
            value:      342391,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        10,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "0O1_234567",
        token:
        {
            raw:        "0O1_234567",
            value:      342391,
            type:       TokenType.NumericLiteral,
            start:      0,
            end:        10,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "true",
        token:
        {
            raw:        "true",
            value:      true,
            type:       TokenType.BooleanLiteral,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "false",
        token:
        {
            raw:        "false",
            value:      false,
            type:       TokenType.BooleanLiteral,
            start:      0,
            end:        5,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "null",
        token:
        {
            raw:        "null",
            value:      null,
            type:       TokenType.NullLiteral,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "if",
        token:
        {
            raw:        "if",
            value:      "if",
            type:       TokenType.Keyword,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "in",
        token:
        {
            raw:        "in",
            value:      "in",
            type:       TokenType.Keyword,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "do",
        token:
        {
            raw:        "do",
            value:      "do",
            type:       TokenType.Keyword,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "var",
        token:
        {
            raw:        "var",
            value:      "var",
            type:       TokenType.Keyword,
            start:      0,
            end:        3,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "for",
        token:
        {
            raw:        "for",
            value:      "for",
            type:       TokenType.Keyword,
            start:      0,
            end:        3,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "new",
        token:
        {
            raw:        "new",
            value:      "new",
            type:       TokenType.Keyword,
            start:      0,
            end:        3,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "try",
        token:
        {
            raw:        "try",
            value:      "try",
            type:       TokenType.Keyword,
            start:      0,
            end:        3,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "let",
        token:
        {
            raw:        "let",
            value:      "let",
            type:       TokenType.Keyword,
            start:      0,
            end:        3,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "this",
        token:
        {
            raw:        "this",
            value:      "this",
            type:       TokenType.Keyword,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "else",
        token:
        {
            raw:        "else",
            value:      "else",
            type:       TokenType.Keyword,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "case",
        token:
        {
            raw:        "case",
            value:      "case",
            type:       TokenType.Keyword,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "void",
        token:
        {
            raw:        "void",
            value:      "void",
            type:       TokenType.Keyword,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "with",
        token:
        {
            raw:        "with",
            value:      "with",
            type:       TokenType.Keyword,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "enum",
        token:
        {
            raw:        "enum",
            value:      "enum",
            type:       TokenType.Keyword,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "while",
        token:
        {
            raw:        "while",
            value:      "while",
            type:       TokenType.Keyword,
            start:      0,
            end:        5,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "break",
        token:
        {
            raw:        "break",
            value:      "break",
            type:       TokenType.Keyword,
            start:      0,
            end:        5,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "catch",
        token:
        {
            raw:        "catch",
            value:      "catch",
            type:       TokenType.Keyword,
            start:      0,
            end:        5,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "throw",
        token:
        {
            raw:        "throw",
            value:      "throw",
            type:       TokenType.Keyword,
            start:      0,
            end:        5,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "const",
        token:
        {
            raw:        "const",
            value:      "const",
            type:       TokenType.Keyword,
            start:      0,
            end:        5,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "yield",
        token:
        {
            raw:        "yield",
            value:      "yield",
            type:       TokenType.Keyword,
            start:      0,
            end:        5,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "class",
        token:
        {
            raw:        "class",
            value:      "class",
            type:       TokenType.Keyword,
            start:      0,
            end:        5,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "super",
        token:
        {
            raw:        "super",
            value:      "super",
            type:       TokenType.Keyword,
            start:      0,
            end:        5,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "return",
        token:
        {
            raw:        "return",
            value:      "return",
            type:       TokenType.Keyword,
            start:      0,
            end:        6,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "typeof",
        token:
        {
            raw:        "typeof",
            value:      "typeof",
            type:       TokenType.Keyword,
            start:      0,
            end:        6,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "delete",
        token:
        {
            raw:        "delete",
            value:      "delete",
            type:       TokenType.Keyword,
            start:      0,
            end:        6,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "switch",
        token:
        {
            raw:        "switch",
            value:      "switch",
            type:       TokenType.Keyword,
            start:      0,
            end:        6,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "export",
        token:
        {
            raw:        "export",
            value:      "export",
            type:       TokenType.Keyword,
            start:      0,
            end:        6,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "import",
        token:
        {
            raw:        "import",
            value:      "import",
            type:       TokenType.Keyword,
            start:      0,
            end:        6,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "default",
        token:
        {
            raw:        "default",
            value:      "default",
            type:       TokenType.Keyword,
            start:      0,
            end:        7,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "finally",
        token:
        {
            raw:        "finally",
            value:      "finally",
            type:       TokenType.Keyword,
            start:      0,
            end:        7,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "extends",
        token:
        {
            raw:        "extends",
            value:      "extends",
            type:       TokenType.Keyword,
            start:      0,
            end:        7,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "function",
        token:
        {
            raw:        "function",
            value:      "function",
            type:       TokenType.Keyword,
            start:      0,
            end:        8,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "function",
        token:
        {
            raw:        "function",
            value:      "function",
            type:       TokenType.Keyword,
            start:      0,
            end:        8,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "debugger",
        token:
        {
            raw:        "debugger",
            value:      "debugger",
            type:       TokenType.Keyword,
            start:      0,
            end:        8,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "instanceof",
        token:
        {
            raw:        "instanceof",
            value:      "instanceof",
            type:       TokenType.Keyword,
            start:      0,
            end:        10,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "(",
        token:
        {
            raw:        "(",
            value:      "(",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "{",
        token:
        {
            raw:        "{",
            value:      "{",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: ".",
        token:
        {
            raw:        ".",
            value:      ".",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "...",
        token:
        {
            raw:        "...",
            value:      "...",
            type:       TokenType.Punctuator,
            start:      0,
            end:        3,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "}",
        token:
        {
            raw:        "}",
            value:      "}",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: ")",
        token:
        {
            raw:        ")",
            value:      ")",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: ";",
        token:
        {
            raw:        ";",
            value:      ";",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: ",",
        token:
        {
            raw:        ",",
            value:      ",",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "[",
        token:
        {
            raw:       "[",
            value:     "[",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "]",
        token:
        {
            raw:        "]",
            value:      "]",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: ":",
        token:
        {
            raw:        ":",
            value:      ":",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "?",
        token:
        {
            raw:        "?",
            value:      "?",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "?.",
        token:
        {
            raw:        "?.",
            value:      "?.",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "?.0",
        token:
        {
            raw:        "?",
            value:      "?",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "?.x",
        token:
        {
            raw:        "?.",
            value:      "?.",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "??",
        token:
        {
            raw:        "??",
            value:      "??",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "~",
        token:
        {
            raw:        "~",
            value:      "~",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: ">>>=",
        token:
        {
            raw:        ">>>=",
            value:      ">>>=",
            type:       TokenType.Punctuator,
            start:      0,
            end:        4,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "===",
        token:
        {
            raw:        "===",
            value:      "===",
            type:       TokenType.Punctuator,
            start:      0,
            end:        3,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "!==",
        token:
        {
            raw:        "!==",
            value:      "!==",
            type:       TokenType.Punctuator,
            start:      0,
            end:        3,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: ">>>",
        token:
        {
            raw:        ">>>",
            value:      ">>>",
            type:       TokenType.Punctuator,
            start:      0,
            end:        3,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "<<=",
        token:
        {
            raw:        "<<=",
            value:      "<<=",
            type:       TokenType.Punctuator,
            start:      0,
            end:        3,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: ">>=",
        token:
        {
            raw:        ">>=",
            value:      ">>=",
            type:       TokenType.Punctuator,
            start:      0,
            end:        3,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "**=",
        token:
        {
            raw:        "**=",
            value:      "**=",
            type:       TokenType.Punctuator,
            start:      0,
            end:        3,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "&&",
        token:
        {
            raw:        "&&",
            value:      "&&",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "||",
        token:
        {
            raw:        "||",
            value:      "||",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "==",
        token:
        {
            raw:        "==",
            value:      "==",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "!=",
        token:
        {
            raw:        "!=",
            value:      "!=",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "+=",
        token:
        {
            raw:        "+=",
            value:      "+=",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "-=",
        token:
        {
            raw:        "-=",
            value:      "-=",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "*=",
        token:
        {
            raw:        "*=",
            value:      "*=",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "/=",
        token:
        {
            raw:        "/=",
            value:      "/=",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "++",
        token:
        {
            raw:        "++",
            value:      "++",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "--",
        token:
        {
            raw:        "--",
            value:      "--",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "<<",
        token:
        {
            raw:        "<<",
            value:      "<<",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: ">>",
        token:
        {
            raw:        ">>",
            value:      ">>",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "&=",
        token:
        {
            raw:        "&=",
            value:      "&=",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "|=",
        token:
        {
            raw:        "|=",
            value:      "|=",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "^=",
        token:
        {
            raw:        "^=",
            value:      "^=",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "%=",
        token:
        {
            raw:        "%=",
            value:      "%=",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "<=",
        token:
        {
            raw:        "<=",
            value:      "<=",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: ">=",
        token:
        {
            raw:        ">=",
            value:      ">=",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "=>",
        token:
        {
            raw:        "=>",
            value:      "=>",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "**",
        token:
        {
            raw:        "**",
            value:      "**",
            type:       TokenType.Punctuator,
            start:      0,
            end:        2,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "<",
        token:
        {
            raw:        "<",
            value:      "<",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: ">",
        token:
        {
            raw:        ">",
            value:      ">",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "=",
        token:
        {
            raw:        "=",
            value:      "=",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "!",
        token:
        {
            raw:        "!",
            value:      "!",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "+",
        token:
        {
            raw:        "+",
            value:      "+",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "-",
        token:
        {
            raw:        "-",
            value:      "-",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "*",
        token:
        {
            raw:        "*",
            value:      "*",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "%",
        token:
        {
            raw:        "%",
            value:      "%",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "&",
        token:
        {
            raw:        "&",
            value:      "&",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "|",
        token:
        {
            raw:        "|",
            value:      "|",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "^",
        token:
        {
            raw:        "^",
            value:      "^",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
    {
        source: "/",
        token:
        {
            raw:        "/",
            value:      "/",
            type:       TokenType.Punctuator,
            start:      0,
            end:        1,
            lineStart:  0,
            lineNumber: 1
        },
    },
];

export const invalidTokens: Array<ExpectedInvalidToken> =
[
    { token: "𐏿",                          message: Messages.unexpectedTokenIllegal },
    { token: "\\u{}",                       message: Messages.unexpectedTokenIllegal },
    { token: "0.123e*1",                    message: Messages.unexpectedTokenIllegal },
    { token: "¬",                           message: Messages.unexpectedTokenIllegal },
    { token: "1i",                          message: Messages.unexpectedTokenIllegal },
    { token: "\\xD800",                     message: Messages.unexpectedTokenIllegal },
    { token: "\\uD800",                     message: Messages.unexpectedTokenIllegal },
    { token: "\\u{AH}",                     message: Messages.unexpectedTokenIllegal },
    { token: "\\u{123}\\x",                 message: Messages.unexpectedTokenIllegal },
    { token: "\\u{123}\\uD800",             message: Messages.unexpectedTokenIllegal },
    { token: "x\\z",                        message: Messages.unexpectedTokenIllegal },
    { token: "0x",                          message: Messages.unexpectedTokenIllegal },
    { token: "0xFFoo",                      message: Messages.unexpectedTokenIllegal },
    { token: "0xhij",                       message: Messages.unexpectedTokenIllegal },
    { token: "0b23",                        message: Messages.unexpectedTokenIllegal },
    { token: "'\r'",                        message: Messages.unexpectedTokenIllegal },
    { token: "'\\\r'",                      message: Messages.unexpectedTokenIllegal },
    { token: "'\\uA9'",                     message: Messages.unexpectedTokenIllegal },
    { token: "'\\8'",                       message: Messages.unexpectedTokenIllegal },
    { token: "'\\9'",                       message: Messages.unexpectedTokenIllegal },
    { token: "0b",                          message: Messages.unexpectedTokenIllegal },
    { token: "0B",                          message: Messages.unexpectedTokenIllegal },
    { token: "0B0a",                        message: Messages.unexpectedTokenIllegal },
    { token: "0B09",                        message: Messages.unexpectedTokenIllegal },
    { token: "0o8",                         message: Messages.unexpectedTokenIllegal },
    { token: "0O8",                         message: Messages.unexpectedTokenIllegal },
    { token: "0o1a",                        message: Messages.unexpectedTokenIllegal },
    { token: "0O1a",                        message: Messages.unexpectedTokenIllegal },
    { token: "`foo",                        message: Messages.unexpectedTokenIllegal },
    { token: "`\\1`",                       message: Messages.octalLiteralsAreNotAllowedInTemplateStrings },
    { token: "`\\01`",                      message: Messages.octalLiteralsAreNotAllowedInTemplateStrings },
    { token: "\\u{006E}\\u{0065}\\u{0077}", message: Messages.keywordMustNotContainEscapedCharacters },
    { token: "'\\xh'",                      message: Messages.invalidHexadecimalEscapeSequence },
    { token: "`\\xh`",                      message: Messages.invalidHexadecimalEscapeSequence },
    { token: "1_.123",                      message: Messages.numericSerapatorsAreNotAllowedHere },
    { token: "1._123",                      message: Messages.numericSerapatorsAreNotAllowedHere },
    { token: "1.123_",                      message: Messages.numericSerapatorsAreNotAllowedHere },
    { token: "0x_12",                       message: Messages.numericSerapatorsAreNotAllowedHere },
    { token: "0x12_",                       message: Messages.numericSerapatorsAreNotAllowedHere },
    { token: "0b_10",                       message: Messages.numericSerapatorsAreNotAllowedHere },
    { token: "0b10_",                       message: Messages.numericSerapatorsAreNotAllowedHere },
    { token: "0o_10",                       message: Messages.numericSerapatorsAreNotAllowedHere },
    { token: "0O_10",                       message: Messages.numericSerapatorsAreNotAllowedHere },
    { token: "0o10_",                       message: Messages.numericSerapatorsAreNotAllowedHere },
    { token: "0O10_",                       message: Messages.numericSerapatorsAreNotAllowedHere },
    { token: "010_",                        message: Messages.numericSerapatorsAreNotAllowedHere },
];