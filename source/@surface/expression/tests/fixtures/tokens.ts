import Messages  from "../../internal/messages";
import { Token } from "../../internal/scanner";
import TokenType from "../../internal/token-type";

export const validTokens: Array<Token> =
[
    {
        raw:        "",
        value:      "",
        type:       TokenType.EOF,
        start:      0,
        end:        0,
        lineStart:  0,
        lineNumber: 1,
    },
    {
        raw:        "x",
        value:      "x",
        type:       TokenType.Identifier,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1,
    },
    {
        raw:        "_identifier",
        value:      "_identifier",
        type:       TokenType.Identifier,
        start:      0,
        end:        11,
        lineStart:  0,
        lineNumber: 1,
    },
    {
        raw:        "identifier",
        value:      "identifier",
        type:       TokenType.Identifier,
        start:      0,
        end:        10,
        lineStart:  0,
        lineNumber: 1,
    },
    {
        raw:        "\\u0069\\u{65}",
        value:      "ie",
        type:       TokenType.Identifier,
        start:      0,
        end:        12,
        lineStart:  0,
        lineNumber: 1,
    },
    {
        raw:        "\\u{65}\\u0069",
        value:      "ei",
        type:       TokenType.Identifier,
        start:      0,
        end:        12,
        lineStart:  0,
        lineNumber: 1,
    },
    {
        raw:        "identifier_\\u{FF}",
        value:      "identifier_ÿ",
        type:       TokenType.Identifier,
        start:      0,
        end:        17,
        lineStart:  0,
        lineNumber: 1,
    },
    {
        raw:        "識別子",
        value:      "識別子",
        type:       TokenType.Identifier,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1,
    },
    {
        raw:        "foo你",
        value:      "foo你",
        type:       TokenType.Identifier,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "你foo",
        value:      "你foo",
        type:       TokenType.Identifier,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
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
    {
        raw:        "`\\n`",
        value:      "\n",
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.Template,
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
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "123.123",
        value:      123.123,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        7,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0.",
        value:      0,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ".123",
        value:      0.123,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "123_123",
        value:      123123,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        7,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "123_123.123",
        value:      123123.123,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        11,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ".123_123",
        value:      0.123123,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        8,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "123e+1",
        value:      1230,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "123e-1",
        value:      12.3,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0x0123456789abcdef",
        value:      81985529216486900,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        18,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0X0123456789ABCDEF",
        value:      81985529216486900,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        18,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0x0123456789_abcdef",
        value:      81985529216486900,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        19,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0X0123456789_ABCDEF",
        value:      81985529216486900,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        19,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0b0101",
        value:      5,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0B0101",
        value:      5,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0b0101_0101",
        value:      85,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        11,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0B0101_0101",
        value:      85,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        11,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "018",
        value:      18,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "019",
        value:      19,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "08",
        value:      8,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "01234567",
        value:      342391,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        8,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0_1234567",
        value:      342391,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        9,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0o1234567",
        value:      342391,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        9,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0O1234567",
        value:      342391,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        9,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0o1_234567",
        value:      342391,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        10,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "0O1_234567",
        value:      342391,
        type:       TokenType.NumericLiteral,
        start:      0,
        end:        10,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "true",
        value:      true,
        type:       TokenType.BooleanLiteral,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "false",
        value:      false,
        type:       TokenType.BooleanLiteral,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "null",
        value:      null,
        type:       TokenType.NullLiteral,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "if",
        value:      "if",
        type:       TokenType.Keyword,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "in",
        value:      "in",
        type:       TokenType.Keyword,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "do",
        value:      "do",
        type:       TokenType.Keyword,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "var",
        value:      "var",
        type:       TokenType.Keyword,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "for",
        value:      "for",
        type:       TokenType.Keyword,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "new",
        value:      "new",
        type:       TokenType.Keyword,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "try",
        value:      "try",
        type:       TokenType.Keyword,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "let",
        value:      "let",
        type:       TokenType.Keyword,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "this",
        value:      "this",
        type:       TokenType.Keyword,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "else",
        value:      "else",
        type:       TokenType.Keyword,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "case",
        value:      "case",
        type:       TokenType.Keyword,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "void",
        value:      "void",
        type:       TokenType.Keyword,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "with",
        value:      "with",
        type:       TokenType.Keyword,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "enum",
        value:      "enum",
        type:       TokenType.Keyword,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "while",
        value:      "while",
        type:       TokenType.Keyword,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "break",
        value:      "break",
        type:       TokenType.Keyword,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "catch",
        value:      "catch",
        type:       TokenType.Keyword,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "throw",
        value:      "throw",
        type:       TokenType.Keyword,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "const",
        value:      "const",
        type:       TokenType.Keyword,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "yield",
        value:      "yield",
        type:       TokenType.Keyword,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "class",
        value:      "class",
        type:       TokenType.Keyword,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "super",
        value:      "super",
        type:       TokenType.Keyword,
        start:      0,
        end:        5,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "return",
        value:      "return",
        type:       TokenType.Keyword,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "typeof",
        value:      "typeof",
        type:       TokenType.Keyword,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "delete",
        value:      "delete",
        type:       TokenType.Keyword,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "switch",
        value:      "switch",
        type:       TokenType.Keyword,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "export",
        value:      "export",
        type:       TokenType.Keyword,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "import",
        value:      "import",
        type:       TokenType.Keyword,
        start:      0,
        end:        6,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "default",
        value:      "default",
        type:       TokenType.Keyword,
        start:      0,
        end:        7,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "finally",
        value:      "finally",
        type:       TokenType.Keyword,
        start:      0,
        end:        7,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "extends",
        value:      "extends",
        type:       TokenType.Keyword,
        start:      0,
        end:        7,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "function",
        value:      "function",
        type:       TokenType.Keyword,
        start:      0,
        end:        8,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "function",
        value:      "function",
        type:       TokenType.Keyword,
        start:      0,
        end:        8,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "debugger",
        value:      "debugger",
        type:       TokenType.Keyword,
        start:      0,
        end:        8,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "instanceof",
        value:      "instanceof",
        type:       TokenType.Keyword,
        start:      0,
        end:        10,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "(",
        value:      "(",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "{",
        value:      "{",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ".",
        value:      ".",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "...",
        value:      "...",
        type:       TokenType.Punctuator,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "}",
        value:      "}",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ")",
        value:      ")",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ";",
        value:      ";",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ",",
        value:      ",",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:       "[",
        value:     "[",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "]",
        value:      "]",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ":",
        value:      ":",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "?",
        value:      "?",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "~",
        value:      "~",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ">>>=",
        value:      ">>>=",
        type:       TokenType.Punctuator,
        start:      0,
        end:        4,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "===",
        value:      "===",
        type:       TokenType.Punctuator,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "!==",
        value:      "!==",
        type:       TokenType.Punctuator,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ">>>",
        value:      ">>>",
        type:       TokenType.Punctuator,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "<<=",
        value:      "<<=",
        type:       TokenType.Punctuator,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ">>=",
        value:      ">>=",
        type:       TokenType.Punctuator,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "**=",
        value:      "**=",
        type:       TokenType.Punctuator,
        start:      0,
        end:        3,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "&&",
        value:      "&&",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "||",
        value:      "||",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "==",
        value:      "==",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "!=",
        value:      "!=",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "+=",
        value:      "+=",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "-=",
        value:      "-=",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "*=",
        value:      "*=",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "/=",
        value:      "/=",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "++",
        value:      "++",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "--",
        value:      "--",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "<<",
        value:      "<<",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ">>",
        value:      ">>",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "&=",
        value:      "&=",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "|=",
        value:      "|=",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "^=",
        value:      "^=",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "%=",
        value:      "%=",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "<=",
        value:      "<=",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ">=",
        value:      ">=",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "=>",
        value:      "=>",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "**",
        value:      "**",
        type:       TokenType.Punctuator,
        start:      0,
        end:        2,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "<",
        value:      "<",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        ">",
        value:      ">",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "=",
        value:      "=",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "!",
        value:      "!",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "+",
        value:      "+",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "-",
        value:      "-",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "*",
        value:      "*",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "%",
        value:      "%",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "&",
        value:      "&",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "|",
        value:      "|",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "^",
        value:      "^",
        type:       TokenType.Punctuator,
        start:      0,
        end:        1,
        lineStart:  0,
        lineNumber: 1
    },
    {
        raw:        "/",
        value:      "/",
        type:       TokenType.Punctuator,
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