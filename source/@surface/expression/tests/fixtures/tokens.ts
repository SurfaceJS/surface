import Messages     from "../../internal/messages";
import { RawToken } from "../../internal/scanner";
import Token        from "../../internal/token";

export const validTokens: Array<RawToken> =
[
    {
        raw:        "",
        value:      "",
        type:       Token.EOF,
        start:      0,
        end:        0,
        lineStart:  0,
        lineNumber: 1,
    },
    {
        raw:        "x",
        value:      "x",
        type:       Token.Identifier,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1,
    },
    {
        raw:        "_identifier",
        value:      "_identifier",
        type:       Token.Identifier,
        start:      0,
        end:        11,
        lineStart:  0,
        lineNumber: 1,
    },
    {
        raw:        "identifier",
        value:      "identifier",
        type:       Token.Identifier,
        start:      0,
        end:        10,
        lineStart:  0,
        lineNumber: 1,
    },
    {
        raw:        "\\u0069\\u{65}",
        value:      "ie",
        type:       Token.Identifier,
        start:      0,
        end:        12,
        lineStart:  0,
        lineNumber: 1,
    },
    {
        raw:        "\\u{65}\\u0069",
        value:      "ei",
        type:       Token.Identifier,
        start:      0,
        end:        12,
        lineStart:  0,
        lineNumber: 1,
    },
    {
        raw:        "identifier_\\u{FF}",
        value:      "identifier_ÿ",
        type:       Token.Identifier,
        start:      0,
        end:        17,
        lineStart:  0,
        lineNumber: 1,
    },
    {
        raw:        "識別子",
        value:      "識別子",
        type:       Token.Identifier,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1,
    },
    {
        raw:        "foo你",
        value:      "foo你",
        type:       Token.Identifier,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "你foo",
        value:      "你foo",
        type:       Token.Identifier,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "\"double quotes\"",
        value:      "double quotes",
        type:       Token.StringLiteral,
        start:      0,
        end:        15,
        lineStart:  0,
        lineNumber: 1,
        octal:      false
    },
    {
        raw:        "'\\n'",
        value:      "\n",
        type:       Token.StringLiteral,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1,
        octal:      false
    },
    {
        raw:        "'\\r'",
        value:      "\r",
        type:       Token.StringLiteral,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1,
        octal:      false
    },
    {
        raw:        "'\\b'",
        value:      "\b",
        type:       Token.StringLiteral,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1,
        octal:      false
    },
    {
        raw:        "'\\t'",
        value:      "\t",
        type:       Token.StringLiteral,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1,
        octal:      false
    },
    {
        raw:        "'\\f'",
        value:      "\f",
        type:       Token.StringLiteral,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1,
        octal:      false
    },
    {
        raw:        "'\\v'",
        value:      "\v",
        type:       Token.StringLiteral,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1,
        octal:      false
    },
    {
        raw:        "'\\1...'",
        value:      "...",
        type:       Token.StringLiteral,
        start:      0,
        end:        7,
        lineStart:  0,
        lineNumber: 1,
        octal:      true
    },
    {
        raw:        "'\\11...'",
        value:      "	...",
        type:       Token.StringLiteral,
        start:      0,
        end:        8,
        lineStart:  0,
        lineNumber: 1,
        octal:      true
    },
    {
        raw:        "'\\123...'",
        value:      "S...",
        type:       Token.StringLiteral,
        start:      0,
        end:        9,
        lineStart:  0,
        lineNumber: 1,
        octal:      true
    },
    {
        raw:        "'\\u{A9}'",
        value:      "©",
        type:       Token.StringLiteral,
        start:      0,
        end:        8,
        lineStart:  0,
        lineNumber: 1,
        octal:      false
    },
    {
        raw:        "'\\u00A9'",
        value:      "©",
        type:       Token.StringLiteral,
        start:      0,
        end:        8,
        lineStart:  0,
        lineNumber: 1,
        octal:      false
    },
    {
        raw:        "'\\xA9'",
        value:      "©",
        type:       Token.StringLiteral,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1,
        octal:      false
    },
    {
        raw:        "'\\z'",
        value:      "z",
        type:       Token.StringLiteral,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1,
        octal:      false
    },
    {
        raw:        "'single quotes'",
        value:      "single quotes",
        type:       Token.StringLiteral,
        start:      0,
        end:        15,
        lineStart:  0,
        lineNumber: 1,
        octal:      false
    },
    {
        raw:        "\"quotes '`\"",
        value:      "quotes '`",
        type:       Token.StringLiteral,
        start:      0,
        end:        11,
        lineStart:  0,
        lineNumber: 1,
        octal:      false
    },
    {
        raw:        "'quotes \"`'",
        value:      "quotes \"`",
        type:       Token.StringLiteral,
        start:      0,
        end:        11,
        lineStart:  0,
        lineNumber: 1,
        octal:      false
    },
    {
        raw:        "`\\n`",
        value:      "\n",
        type:       Token.Template,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1,
        head:       true,
        tail:       true
    },
    {
        raw:        "`\\r`",
        value:      "\r",
        type:       Token.Template,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1,
        head:       true,
        tail:       true
    },
    {
        raw:        "`\\b`",
        value:      "\b",
        type:       Token.Template,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1,
        head:       true,
        tail:       true
    },
    {
        raw:        "`\\t`",
        value:      "\t",
        type:       Token.Template,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1,
        head:       true,
        tail:       true
    },
    {
        raw:        "`\\f`",
        value:      "\f",
        type:       Token.Template,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1,
        head:       true,
        tail:       true
    },
    {
        raw:        "`\\v`",
        value:      "\v",
        type:       Token.Template,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1,
        head:       true,
        tail:       true
    },
    {
        raw:        "`\\u{A9}`",
        value:      "©",
        type:       Token.Template,
        start:      0,
        end:        8,
        lineStart:  0,
        lineNumber: 1,
        head:       true,
        tail:       true
    },
    {
        raw:        "`\\u00A9`",
        value:      "©",
        type:       Token.Template,
        start:      0,
        end:        8,
        lineStart:  0,
        lineNumber: 1,
        head:       true,
        tail:       true
    },
    {
        raw:        "`\\ujs`",
        value:      "\\ujs",
        type:       Token.Template,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1,
        head:       true,
        tail:       true
    },
    {
        raw:        "`\\xA9`",
        value:      "©",
        type:       Token.Template,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1,
        head:       true,
        tail:       true
    },
    {
        raw:        "`\\z`",
        value:      "z",
        type:       Token.Template,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1,
        head:       true,
        tail:       true
    },
    {
        raw:        "`\\\r`",
        value:      "\\\n",
        type:       Token.Template,
        start:      0,
        end:        4,
        lineStart:  3,
        lineNumber: 2,
        head:       true,
        tail:       true
    },
    {
        raw:        "`\\\r\n`",
        value:      "\\\n",
        type:       Token.Template,
        start:      0,
        end:        5,
        lineStart:  4,
        lineNumber: 2,
        head:       true,
        tail:       true
    },
    {
        raw:        "`\r\n`",
        value:      "\n",
        type:       Token.Template,
        start:      0,
        end:        4,
        lineStart:  3,
        lineNumber: 2,
        head:       true,
        tail:       true
    },
    {
        raw:        "`\\0a`",
        value:      "\0a",
        type:       Token.Template,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1,
        head:       true,
        tail:       true
    },
    {
        raw:        "`foo\nbar`",
        value:      "foo\nbar",
        type:       Token.Template,
        start:      0,
        end:        9,
        lineStart:  5,
        lineNumber: 2,
        head:       true,
        tail:       true
    },
    {
        raw:        "`foo$bar`",
        value:      "foo$bar",
        type:       Token.Template,
        start:      0,
        end:        9,
        lineStart:  0,
        lineNumber: 1,
        head:       true,
        tail:       true
    },
    {
        raw:        "`\\z`",
        value:      "z",
        type:       Token.Template,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1,
        head:       true,
        tail:       true
    },
    {
        raw:        "`string`",
        value:      "string",
        type:       Token.Template,
        start:      0,
        end:        8,
        lineStart:  0,
        lineNumber: 1,
        head:       true,
        tail:       true
    },
    {
        raw:        "`quotes \"'`",
        value:      "quotes \"'",
        type:       Token.Template,
        start:      0,
        end:        11,
        lineStart:  0,
        lineNumber: 1,
        head:       true,
        tail:       true
    },
    {
        raw:        "123",
        value:      123,
        type:       Token.NumericLiteral,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "123.123",
        value:      123.123,
        type:       Token.NumericLiteral,
        start:      0,
        end:        7,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0.",
        value:      0,
        type:       Token.NumericLiteral,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ".123",
        value:      0.123,
        type:       Token.NumericLiteral,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "123_123",
        value:      123123,
        type:       Token.NumericLiteral,
        start:      0,
        end:        7,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "123_123.123",
        value:      123123.123,
        type:       Token.NumericLiteral,
        start:      0,
        end:        11,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ".123_123",
        value:      0.123123,
        type:       Token.NumericLiteral,
        start:      0,
        end:        8,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "123e+1",
        value:      1230,
        type:       Token.NumericLiteral,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "123e-1",
        value:      12.3,
        type:       Token.NumericLiteral,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0x0123456789abcdef",
        value:      81985529216486900,
        type:       Token.NumericLiteral,
        start:      0,
        end:        18,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0X0123456789ABCDEF",
        value:      81985529216486900,
        type:       Token.NumericLiteral,
        start:      0,
        end:        18,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0x0123456789_abcdef",
        value:      81985529216486900,
        type:       Token.NumericLiteral,
        start:      0,
        end:        19,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0X0123456789_ABCDEF",
        value:      81985529216486900,
        type:       Token.NumericLiteral,
        start:      0,
        end:        19,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0b0101",
        value:      5,
        type:       Token.NumericLiteral,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0B0101",
        value:      5,
        type:       Token.NumericLiteral,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0b0101_0101",
        value:      85,
        type:       Token.NumericLiteral,
        start:      0,
        end:        11,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0B0101_0101",
        value:      85,
        type:       Token.NumericLiteral,
        start:      0,
        end:        11,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "018",
        value:      18,
        type:       Token.NumericLiteral,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "019",
        value:      19,
        type:       Token.NumericLiteral,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "08",
        value:      8,
        type:       Token.NumericLiteral,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "01234567",
        value:      342391,
        type:       Token.NumericLiteral,
        start:      0,
        end:        8,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0_1234567",
        value:      342391,
        type:       Token.NumericLiteral,
        start:      0,
        end:        9,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0o1234567",
        value:      342391,
        type:       Token.NumericLiteral,
        start:      0,
        end:        9,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0O1234567",
        value:      342391,
        type:       Token.NumericLiteral,
        start:      0,
        end:        9,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0o1_234567",
        value:      342391,
        type:       Token.NumericLiteral,
        start:      0,
        end:        10,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0O1_234567",
        value:      342391,
        type:       Token.NumericLiteral,
        start:      0,
        end:        10,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "true",
        value:      true,
        type:       Token.BooleanLiteral,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "false",
        value:      false,
        type:       Token.BooleanLiteral,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "null",
        value:      null,
        type:       Token.NullLiteral,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "if",
        value:      "if",
        type:       Token.Keyword,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "in",
        value:      "in",
        type:       Token.Keyword,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "do",
        value:      "do",
        type:       Token.Keyword,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "var",
        value:      "var",
        type:       Token.Keyword,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "for",
        value:      "for",
        type:       Token.Keyword,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "new",
        value:      "new",
        type:       Token.Keyword,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "try",
        value:      "try",
        type:       Token.Keyword,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "let",
        value:      "let",
        type:       Token.Keyword,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "this",
        value:      "this",
        type:       Token.Keyword,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "else",
        value:      "else",
        type:       Token.Keyword,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "case",
        value:      "case",
        type:       Token.Keyword,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "void",
        value:      "void",
        type:       Token.Keyword,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "with",
        value:      "with",
        type:       Token.Keyword,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "enum",
        value:      "enum",
        type:       Token.Keyword,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "while",
        value:      "while",
        type:       Token.Keyword,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "break",
        value:      "break",
        type:       Token.Keyword,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "catch",
        value:      "catch",
        type:       Token.Keyword,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "throw",
        value:      "throw",
        type:       Token.Keyword,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "const",
        value:      "const",
        type:       Token.Keyword,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "yield",
        value:      "yield",
        type:       Token.Keyword,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "class",
        value:      "class",
        type:       Token.Keyword,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "super",
        value:      "super",
        type:       Token.Keyword,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "return",
        value:      "return",
        type:       Token.Keyword,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "typeof",
        value:      "typeof",
        type:       Token.Keyword,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "delete",
        value:      "delete",
        type:       Token.Keyword,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "switch",
        value:      "switch",
        type:       Token.Keyword,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "export",
        value:      "export",
        type:       Token.Keyword,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "import",
        value:      "import",
        type:       Token.Keyword,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "default",
        value:      "default",
        type:       Token.Keyword,
        start:      0,
        end:        7,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "finally",
        value:      "finally",
        type:       Token.Keyword,
        start:      0,
        end:        7,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "extends",
        value:      "extends",
        type:       Token.Keyword,
        start:      0,
        end:        7,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "function",
        value:      "function",
        type:       Token.Keyword,
        start:      0,
        end:        8,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "function",
        value:      "function",
        type:       Token.Keyword,
        start:      0,
        end:        8,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "debugger",
        value:      "debugger",
        type:       Token.Keyword,
        start:      0,
        end:        8,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "instanceof",
        value:      "instanceof",
        type:       Token.Keyword,
        start:      0,
        end:        10,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "(",
        value:      "(",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "{",
        value:      "{",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ".",
        value:      ".",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "...",
        value:      "...",
        type:       Token.Punctuator,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "}",
        value:      "}",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ")",
        value:      ")",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ";",
        value:      ";",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ",",
        value:      ",",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:       "[",
        value:     "[",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "]",
        value:      "]",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ":",
        value:      ":",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "?",
        value:      "?",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "~",
        value:      "~",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ">>>=",
        value:      ">>>=",
        type:       Token.Punctuator,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "===",
        value:      "===",
        type:       Token.Punctuator,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "!==",
        value:      "!==",
        type:       Token.Punctuator,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ">>>",
        value:      ">>>",
        type:       Token.Punctuator,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "<<=",
        value:      "<<=",
        type:       Token.Punctuator,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ">>=",
        value:      ">>=",
        type:       Token.Punctuator,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "**=",
        value:      "**=",
        type:       Token.Punctuator,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "&&",
        value:      "&&",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "||",
        value:      "||",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "==",
        value:      "==",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "!=",
        value:      "!=",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "+=",
        value:      "+=",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "-=",
        value:      "-=",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "*=",
        value:      "*=",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "/=",
        value:      "/=",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "++",
        value:      "++",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "--",
        value:      "--",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "<<",
        value:      "<<",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ">>",
        value:      ">>",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "&=",
        value:      "&=",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "|=",
        value:      "|=",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "^=",
        value:      "^=",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "%=",
        value:      "%=",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "<=",
        value:      "<=",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ">=",
        value:      ">=",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "=>",
        value:      "=>",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "**",
        value:      "**",
        type:       Token.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "<",
        value:      "<",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ">",
        value:      ">",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "=",
        value:      "=",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "!",
        value:      "!",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "+",
        value:      "+",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "-",
        value:      "-",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "*",
        value:      "*",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "%",
        value:      "%",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "&",
        value:      "&",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "|",
        value:      "|",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "^",
        value:      "^",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "/",
        value:      "/",
        type:       Token.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
];

export const invalidTokens =
[
    { value: "𐏿",                          message: Messages.unexpectedTokenIllegal },
    { value: "\\u{}",                       message: Messages.unexpectedTokenIllegal },
    { value: "0.123e*1",                    message: Messages.unexpectedTokenIllegal },
    { value: "¬",                           message: Messages.unexpectedTokenIllegal },
    { value: "1i",                          message: Messages.unexpectedTokenIllegal },
    { value: "\\xD800",                     message: Messages.unexpectedTokenIllegal },
    { value: "\\uD800",                     message: Messages.unexpectedTokenIllegal },
    { value: "\\u{AH}",                     message: Messages.unexpectedTokenIllegal },
    { value: "\\u{123}\\x",                 message: Messages.unexpectedTokenIllegal },
    { value: "\\u{123}\\uD800",             message: Messages.unexpectedTokenIllegal },
    { value: "x\\z",                        message: Messages.unexpectedTokenIllegal },
    { value: "0x",                          message: Messages.unexpectedTokenIllegal },
    { value: "0xFFoo",                      message: Messages.unexpectedTokenIllegal },
    { value: "0xhij",                       message: Messages.unexpectedTokenIllegal },
    { value: "0b23",                        message: Messages.unexpectedTokenIllegal },
    { value: "'\r'",                        message: Messages.unexpectedTokenIllegal },
    { value: "'\\\r'",                      message: Messages.unexpectedTokenIllegal },
    { value: "'\\uA9'",                     message: Messages.unexpectedTokenIllegal },
    { value: "'\\8'",                       message: Messages.unexpectedTokenIllegal },
    { value: "'\\9'",                       message: Messages.unexpectedTokenIllegal },
    { value: "0b",                          message: Messages.unexpectedTokenIllegal },
    { value: "0B",                          message: Messages.unexpectedTokenIllegal },
    { value: "0o8",                         message: Messages.unexpectedTokenIllegal },
    { value: "0O8",                         message: Messages.unexpectedTokenIllegal },
    { value: "0o1a",                        message: Messages.unexpectedTokenIllegal },
    { value: "0O1a",                        message: Messages.unexpectedTokenIllegal },
    { value: "`foo",                        message: Messages.unexpectedTokenIllegal },
    { value: "`\\1`",                       message: Messages.templateOctalLiteral },
    { value: "`\\01`",                      message: Messages.templateOctalLiteral },
    { value: "\\u{006E}\\u{0065}\\u{0077}", message: Messages.invalidEscapedReservedWord },
    { value: "'\\xh'",                      message: Messages.invalidHexEscapeSequence },
    { value: "`\\xh`",                      message: Messages.invalidHexEscapeSequence },
    { value: "1_.123",                      message: Messages.numericSepatorNotAllowed },
    { value: "1._123",                      message: Messages.numericSepatorNotAllowed },
    { value: "1.123_",                      message: Messages.numericSepatorNotAllowed },
    { value: "0x_12",                       message: Messages.numericSepatorNotAllowed },
    { value: "0x12_",                       message: Messages.numericSepatorNotAllowed },
    { value: "0b_10",                       message: Messages.numericSepatorNotAllowed },
    { value: "0b10_",                       message: Messages.numericSepatorNotAllowed },
    { value: "0o_10",                       message: Messages.numericSepatorNotAllowed },
    { value: "0O_10",                       message: Messages.numericSepatorNotAllowed },
    { value: "0o10_",                       message: Messages.numericSepatorNotAllowed },
    { value: "0O10_",                       message: Messages.numericSepatorNotAllowed },
    { value: "010_",                        message: Messages.numericSepatorNotAllowed },
];