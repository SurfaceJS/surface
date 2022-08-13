import type { Auth } from "../internal/npm-config.js";

const CWD = process.cwd();

const skip = false;

export type Scenario =
{
    message:   string,
    skip:      boolean,
    path:      string,
    env:       Record<string, string>,
    source?:   string,
    expected?: Map<string, string>,
};

export type AuthScenario =
{
    message:  string,
    skip:     boolean,
    scope:    string,
    path:     string,
    source:   string,
    expected: { registry: string | undefined, authToken: string | undefined, scopedAuth: Auth | null },
};

export const scenarios: Scenario[] =
[
    {
        skip,
        message: "Cant find .npmrc",
        path:    CWD,
        env:     { },
    },
    {
        skip,
        message:   "Find empty .npmrc in the path",
        path:      CWD,
        source:    "",
        env:       { },
        expected:  new Map(),
    },
    {
        skip,
        message:   "Find non empty .npmrc in the path",
        path:      CWD,
        source:    "\n\tkey=value\n  env-key=${ENV}\nempty-env=${EMPTY}",
        env:       { "ENV": "env-value" },
        expected:  new Map([["key", "value"], ["env-key", "env-value"], ["empty-env", ""]]),
    },
    {
        skip,
        message:   "Find .npmrc with comments",
        path:      CWD,
        source:    "; this is a comment\nkey=value # this is another comment",
        env:       { },
        expected:  new Map([["key", "value"]]),
    },
    {
        skip,
        message:   "Find .npmrc with quotes and escapes",
        path:      CWD,
        source:    "\"key#\"='value;'\nkey\\;=value\\#",
        env:       { },
        expected:  new Map([["key#", "value;"], ["key;", "value#"]]),
    },
];

export const authScenarios: AuthScenario[] =
[
    {
        skip,
        message:  "Cant anything",
        path:     CWD,
        source:   "",
        scope:    "@foo",
        expected: { registry: undefined, authToken: undefined, scopedAuth: null },
    },
    {
        skip,
        message:  "find registry and auth token",
        path:     CWD,
        source:   "registry=https://test.com\n_authToken=123",
        scope:    "@foo",
        expected: { registry: "https://test.com", authToken: "123", scopedAuth: null },
    },
    {
        skip,
        message:  "Cant find scoped registry and cant find scoped _authToken",
        path:     CWD,
        scope:    "@foo",
        source:   "@foo:registry=https://test.com",
        expected: { registry: undefined, authToken: undefined, scopedAuth: null },
    },
    {
        skip,
        message:  "Find scoped registry and token",
        path:     CWD,
        scope:    "@foo",
        source:   "@foo:registry=https://test.com\n//test.com:_authToken=123",
        expected: { registry: undefined, authToken: undefined, scopedAuth: { registry: "https://test.com", token: "123" } },
    },
];
