// cSpell:ignore stroustrup

const config =
{
    overrides:
    [
        {
            files:         ["*.ts", "*.tsx", "*.mts", "*.cts"],
            parser:        "@typescript-eslint/parser",
            parserOptions:
            {
                ecmaVersion: 2021,
                sourceType:  "module",
            },
            plugins:
            [
                "@typescript-eslint",
                "jsdoc",
                "import",
            ],
            rules:
            {
                "@typescript-eslint/adjacent-overload-signatures": "warn",
                "@typescript-eslint/array-type":                   "warn",
                "@typescript-eslint/await-thenable":               "warn",
                "@typescript-eslint/ban-tslint-comment":           "warn",
                "@typescript-eslint/brace-style":
                [
                    "warn",
                    "stroustrup",
                    {
                        allowSingleLine: true,
                    },
                ],
                "@typescript-eslint/class-literal-property-style": "warn",
                "@typescript-eslint/comma-spacing":
                [
                    "warn",
                    {
                        after: true,
                    },
                ],
                "@typescript-eslint/consistent-type-imports":       "warn",
                "@typescript-eslint/default-param-last":            "warn",
                "@typescript-eslint/dot-notation":                  "warn",
                "@typescript-eslint/explicit-function-return-type":
                [
                    "warn",
                    {
                        allowConciseArrowFunctionExpressionsStartingWithVoid: true,
                        allowExpressions:                                     true,
                        allowHigherOrderFunctions:                            true,
                        allowTypedFunctionExpressions:                        true,
                    },
                ],
                "@typescript-eslint/explicit-member-accessibility": "warn",
                "@typescript-eslint/indent":                        "warn",
                "@typescript-eslint/keyword-spacing":               "warn",
                "@typescript-eslint/lines-between-class-members":
                [
                    "warn",
                    "always",
                    {
                        exceptAfterSingleLine: true,
                    },
                ],
                "@typescript-eslint/member-delimiter-style":
                [
                    "warn",
                    {
                        multiline:
                        {
                            delimiter:   "comma",
                            requireLast: true,
                        },
                        overrides:
                        {
                            interface:
                            {
                                multiline:
                                {
                                    delimiter:   "semi",
                                    requireLast: true,
                                },
                            },
                        },
                        singleline:
                        {
                            delimiter:   "comma",
                            requireLast: false,
                        },
                    },
                ],
                "@typescript-eslint/member-ordering":
                [
                    "warn",
                    {
                        default:
                        [
                            "signature",
                            "private-static-field",
                            "protected-static-field",
                            "public-static-field",
                            "private-abstract-field",
                            "private-decorated-field",
                            "private-instance-field",
                            "protected-abstract-field",
                            "protected-decorated-field",
                            "protected-instance-field",
                            "public-abstract-field",
                            "public-decorated-field",
                            "public-instance-field",
                            "private-constructor",
                            "protected-constructor",
                            "public-constructor",
                            "private-static-method",
                            "protected-static-method",
                            "public-static-method",
                            "private-abstract-method",
                            "private-decorated-method",
                            "private-instance-method",
                            "protected-abstract-method",
                            "protected-decorated-method",
                            "protected-instance-method",
                            "public-abstract-method",
                            "public-decorated-method",
                            "public-instance-method",
                        ],
                    },
                ],
                "@typescript-eslint/naming-convention":
                [
                    "warn",
                    {
                        format:   ["PascalCase"],
                        selector: "enumMember",
                    },
                    {
                        format:   ["PascalCase"],
                        selector: "typeLike",
                    },
                    {
                        custom:
                        {
                            match: true,
                            regex: "^I[A-Z]",
                        },
                        format:   ["PascalCase"],
                        selector: "interface",
                    },
                ],
                "@typescript-eslint/no-array-constructor":            "warn",
                "@typescript-eslint/no-confusing-non-null-assertion": "warn",
                "@typescript-eslint/no-dupe-class-members":           "warn",
                "@typescript-eslint/no-duplicate-imports":            "warn",
                "@typescript-eslint/no-dynamic-delete":               "warn",
                "@typescript-eslint/no-empty-function":               "warn",
                "@typescript-eslint/no-explicit-any":                 "warn",
                "@typescript-eslint/no-extra-non-null-assertion":     "warn",
                "@typescript-eslint/no-extra-parens":                 "warn",
                "@typescript-eslint/no-extra-semi":                   "warn",
                "@typescript-eslint/no-floating-promises":            "warn",
                "@typescript-eslint/no-for-in-array":                 "warn",
                "@typescript-eslint/no-implied-eval":                 "warn",
                "@typescript-eslint/no-inferrable-types":
                [
                    "warn",
                    {
                        ignoreParameters: true,
                        ignoreProperties: true,
                    },
                ],
                "@typescript-eslint/no-loss-of-precision":                   "warn",
                "@typescript-eslint/no-misused-new":                         "warn",
                "@typescript-eslint/no-namespace":                           "warn",
                "@typescript-eslint/no-require-imports":                     "warn",
                "@typescript-eslint/no-throw-literal":                       "warn",
                "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
                "@typescript-eslint/no-unnecessary-qualifier":               "warn",
                "@typescript-eslint/no-unnecessary-type-arguments":          "warn",
                "@typescript-eslint/no-unused-vars":
                [
                    "warn",
                    {
                        argsIgnorePattern: "^_",
                        varsIgnorePattern: "^_",
                    },
                ],
                "@typescript-eslint/no-useless-constructor":         "warn",
                "@typescript-eslint/no-var-requires":                "warn",
                "@typescript-eslint/prefer-as-const":                "warn",
                "@typescript-eslint/prefer-for-of":                  "warn",
                "@typescript-eslint/prefer-function-type":           "warn",
                "@typescript-eslint/prefer-includes":                "warn",
                "@typescript-eslint/prefer-literal-enum-member":     "warn",
                "@typescript-eslint/prefer-nullish-coalescing":      "warn",
                "@typescript-eslint/prefer-optional-chain":          "warn",
                "@typescript-eslint/prefer-readonly":                "warn",
                "@typescript-eslint/prefer-reduce-type-parameter":   "warn",
                "@typescript-eslint/prefer-regexp-exec":             "warn",
                "@typescript-eslint/prefer-string-starts-ends-with": "warn",
                "@typescript-eslint/promise-function-async":         "warn",
                "@typescript-eslint/quotes":                         "warn",
                "@typescript-eslint/return-await":                   "warn",
                "@typescript-eslint/semi":                           "warn",
                "@typescript-eslint/switch-exhaustiveness-check":    "warn",
                "@typescript-eslint/triple-slash-reference":         "warn",
                "@typescript-eslint/type-annotation-spacing":        "warn",
                "accessor-pairs":                                    "warn",
                "array-bracket-newline":
                [
                    "warn",
                    "consistent",
                ],
                "array-bracket-spacing":
                [
                    "warn",
                    "never",
                ],
                "array-callback-return": "warn",
                "array-element-newline":
                [
                    "warn",
                    "consistent",
                ],
                "arrow-body-style": "warn",
                "arrow-spacing":    "warn",
                "block-scoped-var": "warn",
                "block-spacing":    "warn",
                "comma-dangle":
                [
                    "warn",
                    "always-multiline",
                ],
                "comma-style": "warn",
                "complexity":
                [
                    "warn",
                    10,
                ],
                "computed-property-spacing": "warn",
                "constructor-super":         "warn",
                "curly":                     "warn",
                "default-case":              "warn",
                "default-case-last":         "warn",
                "default-param-last":        "warn",
                "dot-notation":              "warn",
                "for-direction":             "warn",
                "func-name-matching":        "warn",
                "func-style":
                [
                    "warn",
                    "declaration",
                    {
                        allowArrowFunctions: true,
                    },
                ],
                "function-call-argument-newline":
                [
                    "warn",
                    "consistent",
                ],
                "generator-star-spacing": "warn",
                "getter-return":          "warn",
                "grouped-accessor-pairs": "warn",
                "id-denylist":            "warn",
                "id-match":               "warn",
                "import/default":         "warn",
                "import/exports-last":    "warn",
                "import/extensions":
                [
                    "warn",
                    "never",
                    {
                        cjs: "always",
                        js:  "always",
                        mjs: "always",
                    },
                ],
                "import/first":                       "warn",
                "import/named":                       "warn",
                "import/namespace":                   "warn",
                "import/newline-after-import":        "warn",
                "import/no-absolute-path":            "warn",
                "import/no-amd":                      "warn",
                "import/no-anonymous-default-export": "warn",
                "import/no-cycle":                    "warn",
                "import/no-deprecated":               "warn",
                "import/no-duplicates":               "warn",
                "import/no-mutable-exports":          "warn",
                "import/no-named-as-default":         "warn",
                "import/no-named-as-default-member":  "warn",
                "import/no-named-default":            "warn",
                "import/no-namespace":                "warn",
                "import/no-restricted-paths":         "warn",
                "import/no-self-import":              "warn",
                "import/no-unassigned-import":        "warn",
                "import/no-unused-modules":           "warn",
                "import/no-useless-path-segments":    "warn",
                "import/no-webpack-loader-syntax":    "warn",
                "import/order":
                [
                    "warn",
                    {
                        alphabetize:
                        {
                            order: "asc",
                        },
                    },
                ],
                "import/prefer-default-export": "warn",
                "jsx-quotes":                   "warn",
                "key-spacing":
                [
                    "warn",
                    {
                        align: "value",
                        mode:  "minimum",
                    },
                ],
                "keyword-spacing":      "warn",
                "lines-around-comment": "warn",
                "max-depth":
                [
                    "warn",
                    8,
                ],
                "max-len":
                [
                    "warn",
                    150,
                ],
                "max-lines":
                [
                    "warn",
                    500,
                ],
                "max-lines-per-function":
                [
                    "warn",
                    50,
                ],
                "max-nested-callbacks": "warn",
                "max-params":
                [
                    "warn",
                    5,
                ],
                "max-statements":
                [
                    "warn",
                    25,
                ],
                "max-statements-per-line":  "warn",
                "new-parens":               "warn",
                "newline-per-chained-call":
                [
                    "error",
                    {
                        ignoreChainWithDepth: 2,
                    },
                ],
                "no-alert":                  "warn",
                "no-array-constructor":      "warn",
                "no-async-promise-executor": "warn",
                "no-caller":                 "warn",
                "no-case-declarations":      "warn",
                "no-class-assign":           "warn",
                "no-compare-neg-zero":       "warn",
                "no-const-assign":           "warn",
                "no-constant-condition":     "warn",
                "no-control-regex":          "warn",
                "no-debugger":               "warn",
                "no-delete-var":             "warn",
                "no-div-regex":              "warn",
                "no-dupe-args":              "warn",
                "no-dupe-else-if":           "warn",
                "no-dupe-keys":              "warn",
                "no-duplicate-case":         "warn",
                "no-else-return":            "warn",
                "no-empty":                  "warn",
                "no-empty-character-class":  "warn",
                "no-empty-pattern":          "warn",
                "no-eq-null":                "warn",
                "no-eval":                   "warn",
                "no-ex-assign":              "warn",
                "no-extend-native":          "warn",
                "no-extra-bind":             "warn",
                "no-extra-label":            "warn",
                "no-extra-semi":             "warn",
                "no-fallthrough":            "warn",
                "no-floating-decimal":       "warn",
                "no-func-assign":            "warn",
                "no-global-assign":          "warn",
                "no-implicit-globals":       "warn",
                "no-implied-eval":           "warn",
                "no-import-assign":          "warn",
                "no-invalid-regexp":         "warn",
                "no-irregular-whitespace":   "warn",
                "no-iterator":               "warn",
                "no-label-var":              "warn",
                "no-labels":                 "warn",
                "no-lone-blocks":            "warn",
                "no-lonely-if":              "warn",
                "no-loss-of-precision":      "warn",
                "no-mixed-spaces-and-tabs":  "warn",
                "no-multi-str":              "warn",
                "no-multiple-empty-lines":
                [
                    "warn",
                    {
                        max: 1,
                    },
                ],
                "no-new":                           "warn",
                "no-new-func":                      "warn",
                "no-new-object":                    "warn",
                "no-new-symbol":                    "warn",
                "no-new-wrappers":                  "warn",
                "no-obj-calls":                     "warn",
                "no-octal-escape":                  "warn",
                "no-param-reassign":                "warn",
                "no-proto":                         "warn",
                "no-regex-spaces":                  "warn",
                "no-restricted-exports":            "warn",
                "no-restricted-globals":            "warn",
                "no-restricted-imports":            "warn",
                "no-restricted-properties":         "warn",
                "no-restricted-syntax":             "warn",
                "no-script-url":                    "warn",
                "no-self-assign":                   "warn",
                "no-self-compare":                  "warn",
                "no-setter-return":                 "warn",
                "no-shadow-restricted-names":       "warn",
                "no-tabs":                          "warn",
                "no-this-before-super":             "warn",
                "no-throw-literal":                 "warn",
                "no-trailing-spaces":               "warn",
                "no-undef-init":                    "warn",
                "no-unmodified-loop-condition":     "warn",
                "no-unneeded-ternary":              "warn",
                "no-unreachable":                   "warn",
                "no-unsafe-finally":                "warn",
                "no-unsafe-negation":               "warn",
                "no-unused-labels":                 "warn",
                "no-unused-vars":                   "off",
                "no-useless-backreference":         "warn",
                "no-useless-call":                  "warn",
                "no-useless-catch":                 "warn",
                "no-useless-computed-key":          "warn",
                "no-useless-concat":                "warn",
                "no-useless-rename":                "warn",
                "no-useless-return":                "warn",
                "no-var":                           "warn",
                "no-whitespace-before-property":    "warn",
                "no-with":                          "warn",
                "nonblock-statement-body-position": "warn",
                "object-curly-newline":
                [
                    "warn",
                    {
                        consistent: true,
                        multiline:  true,
                    },
                ],
                "object-curly-spacing":
                [
                    "warn",
                    "always",
                ],
                "object-property-newline":
                [
                    "warn",
                    {
                        allowAllPropertiesOnSameLine: true,
                    },
                ],
                "object-shorthand":             "warn",
                "one-var-declaration-per-line": "warn",
                "operator-assignment":          "warn",
                "operator-linebreak":
                [
                    "warn",
                    "before",
                    {
                        overrides:
                        {
                            "=": "after",
                        },
                    },
                ],
                "padding-line-between-statements": "warn",
                "prefer-arrow-callback":           "warn",
                "prefer-const":                    "warn",
                "prefer-exponentiation-operator":  "warn",
                "prefer-numeric-literals":         "warn",
                "prefer-object-spread":            "warn",
                "prefer-regex-literals":           "warn",
                "prefer-rest-params":              "warn",
                "prefer-spread":                   "warn",
                "prefer-template":                 "warn",
                "quotes":                          "warn",
                "require-atomic-updates":          "warn",
                "require-yield":                   "warn",
                "rest-spread-spacing":             "warn",
                "semi-spacing":                    "warn",
                "semi-style":                      "warn",
                "sort-imports":
                [
                    "warn",
                    {
                        ignoreDeclarationSort: true,
                    },
                ],
                "space-before-blocks":    "warn",
                "space-in-parens":        "warn",
                "space-infix-ops":        "warn",
                "space-unary-ops":        "warn",
                "spaced-comment":         "warn",
                "switch-colon-spacing":   "warn",
                "symbol-description":     "warn",
                "template-curly-spacing": "warn",
                "template-tag-spacing":   "warn",
                "unicode-bom":            "warn",
                "use-isnan":              "warn",
                "valid-typeof":           "warn",
                "vars-on-top":            "warn",
                "wrap-iife":              "warn",
                "yield-star-spacing":     "warn",
                "yoda":                   "warn",
            },
        },
    ],
};

export = config;
