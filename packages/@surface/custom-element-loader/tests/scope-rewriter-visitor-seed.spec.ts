export const expressionsSeed =
[
    {
        expected: "this",
        source:   "this",
    },
    {
        expected: "undefined",
        source:   "undefined",
    },
    {
        expected: "null",
        source:   "null",
    },
    {
        expected: "0",
        source:   "0",
    },
    {
        expected: "true",
        source:   "true",
    },
    {
        expected: "\"X\"",
        source:   "\"X\"",
    },
    {
        expected: "scope.host",
        source:   "host",
    },
    {
        expected: "scope.host.value",
        source:   "host.value",
    },
    {
        expected: "scope.host[scope.key]",
        source:   "host[key]",
    },
    {
        expected: "scope.host[\"value\"]",
        source:   "host[\"value\"]",
    },
    {
        expected: "{ value: scope.host.value }",
        source:   "{ value: host.value }",
    },
    {
        expected: "{ value: scope.value }",
        source:   "{ value }",
    },
    {
        expected: "{ [scope.key]: scope.value }",
        source:   "{ [key]: value }",
    },
    {
        expected: "{ [\"key\"]: false }",
        source:   "{ [\"key\"]: false }",
    },
    {
        expected: "{ ...scope.value }",
        source:   "{ ...value }",
    },
    {
        expected: "[1, scope.value, false]",
        source:   "[1, value, false]",
    },
    {
        expected: "[scope.value, ...scope.values]",
        source:   "[value, ...values]",
    },
    {
        expected: "(value) => value",
        source:   "value => value",
    },
    {
        expected: "((value) => value, () => scope.value)",
        source:   "(value => value, () => value)",
    },
    {
        expected: "(value) => () => value",
        source:   "value => () => value",
    },
    {
        expected: "(value) => value + scope.otherValue",
        source:   "value => value + otherValue",
    },
    {
        expected: "(value, fallback) => value ?? fallback",
        source:   "(value, fallback) => value ?? fallback",
    },
    {
        expected: "(...rest) => rest",
        source:   "(...rest) => rest",
    },
    {
        expected: "({ value }) => value",
        source:   "({ value }) => value",
    },
    {
        expected: "({ value = 1 }) => value",
        source:   "({ value = 1 }) => value",
    },
    {
        expected: "({ value: alias }) => alias",
        source:   "({ value: alias }) => alias",
    },
    {
        expected: "({ [scope.name]: alias }) => alias",
        source:   "({ [name]: alias }) => alias",
    },
    {
        expected: "({ value: alias = 1 }) => alias",
        source:   "({ value: alias = 1 }) => alias",
    },
    {
        expected: "({ value: alias = scope.fallback }) => alias",
        source:   "({ value: alias = fallback }) => alias",
    },
    {
        expected: "({ [scope.name]: alias = scope.fallback }) => alias",
        source:   "({ [name]: alias = fallback }) => alias",
    },
    {
        expected: "({ object: { value } }) => value",
        source:   "({ object: { value } }) => value",
    },
    {
        expected: "({ object: { value: alias } }) => alias",
        source:   "({ object: { value: alias } }) => alias",
    },
    {
        expected: "({ object: { value: alias = scope.fallback } }) => alias",
        source:   "({ object: { value: alias = fallback } }) => alias",
    },
    {
        expected: "({ ...values }) => values",
        source:   "({ ...values }) => values",
    },
    {
        expected: "({ value, ...values }) => ({ value, ...values })",
        source:   "({ value, ...values }) => ({ value, ...values })",
    },

    {
        expected: "([value]) => value",
        source:   "([value]) => value",
    },
    {
        expected: "([value = 1]) => value",
        source:   "([value = 1]) => value",
    },
    {
        expected: "([, [value]]) => value",
        source:   "([, [value]]) => value",
    },
    {
        expected: "([, [value = scope.fallback]]) => value",
        source:   "([, [value = fallback]]) => value",
    },
    {
        expected: "([...values]) => values",
        source:   "([...values]) => values",
    },
    {
        expected: "([value, ...values]) => [value, ...values]",
        source:   "([value, ...values]) => [value, ...values]",
    },
    {
        expected: "(fn = (value) => value) => scope.value",
        source:   "(fn = (value) => value) => value",
    },
];

export const patternSeeds =
[
    {
        expected: "{ value }",
        source:   "{ value }",
    },
    {
        expected: "{ value }",
        source:   "{ value = 1 }",
    },
    {
        expected: "{ alias }",
        source:   "{ value: alias }",
    },
    {
        expected: "{ alias }",
        source:   "{ [name]: alias }",
    },
    {
        expected: "{ alias }",
        source:   "{ value: alias = 1 }",
    },
    {
        expected: "{ alias }",
        source:   "{ value: alias = fallback }",
    },
    {
        expected: "{ alias }",
        source:   "{ [name]: alias = fallback }",
    },
    {
        expected: "{ value }",
        source:   "{ object: { value } }",
    },
    {
        expected: "{ alias }",
        source:   "{ object: { value: alias } }",
    },
    {
        expected: "{ alias }",
        source:   "{ object: { value: alias = fallback } }",
    },
    {
        expected: "{ values }",
        source:   "{ ...values }",
    },
    {
        expected: "{ value, values }",
        source:   "{ value, ...values }",
    },

    {
        expected: "{ value }",
        source:   "[value]",
    },
    {
        expected: "{ value }",
        source:   "[value = 1]",
    },
    {
        expected: "{ value }",
        source:   "[, [value]]",
    },
    {
        expected: "{ value }",
        source:   "[, [value = fallback]]",
    },
    {
        expected: "{ values }",
        source:   "[...values]",
    },
    {
        expected: "{ value, values }",
        source:   "[value, ...values]",
    },
];