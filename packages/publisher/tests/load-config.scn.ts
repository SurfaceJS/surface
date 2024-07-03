import type pacote from "pacote";

const CWD = process.cwd();

const skip = false;

export type Scenario =
{
    message:   string,
    skip:      boolean,
    path:      string,
    env:       Record<string, string>,
    source:    string,
    expected:  pacote.Options,
};

export const scenarios: Scenario[] =
[
    {
        skip,
        message:  "Cant find .npmrc",
        path:      CWD,
        source:    "",
        env:       { },
        expected:  { },
    },
    {
        skip,
        message:   "Find empty .npmrc in the path",
        path:      CWD,
        source:    "",
        env:       { },
        expected:  { },
    },
    {
        skip,
        message:   ".npmrc with non string values",
        path:      CWD,
        source:    "boolean=true\nnumber=0.1\nstring=some string",
        env:       { },
        expected:  { boolean: true, number: 0.1, string: "some string" },
    },
    {
        skip,
        message:   "Find non empty .npmrc in the path",
        path:      CWD,
        source:    "\n\tkey=value\n  env-key=${ENV}\nempty-env=${EMPTY}",
        env:       { "ENV": "env-value" },
        expected:  { "key": "value", "env-key": "env-value", "empty-env": undefined },
    },
    {
        skip,
        message:   "Find .npmrc with comments",
        path:      CWD,
        source:    "; this is a comment\nkey=value # this is another comment",
        env:       { },
        expected:  { key: "value" },
    },
    {
        skip,
        message:   "Find .npmrc with quotes and escapes",
        path:      CWD,
        source:    "\"key#\"='value;'\nkey\\;=value\\#",
        env:       { },
        expected:  { "key#": "value;", "key;": "value#" },
    },
];
