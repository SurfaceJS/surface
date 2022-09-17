import type { PackageJson } from "@npm/types";
import type NpmService      from "../internal/npm-service.js";

const skip = false;

type Key = `package/${string}`;

export type HasChangesScenario =
{
    skip:     boolean,
    message:  string,
    options:  Parameters<NpmService["hasChanges"]>[2],
    local:    Record<Key, string>,
    remote?:  Record<Key, string>,
    expected: boolean,
};

export const scenarios: HasChangesScenario[] =
[
    {
        skip,
        message:  "No remote",
        options:  { },
        local:    { },
        expected: true,
    },
    {
        skip,
        message:  "Remote has less files",
        options:  { },
        local:    { "package/foo": "foo" },
        remote:   { },
        expected: true,
    },
    {
        skip,
        message:  "Content differ",
        options:  { },
        local:    { "package/foo": "foo" },
        remote:   { "package/foo": "foo1" },
        expected: true,
    },
    {
        skip,
        message:  "package.json differ",
        options:  { },
        local:
        {
            "package/package.json": JSON.stringify
            (
                {
                    name:    "foo",
                    version: "2.0.0",
                } as PackageJson,
            ),
        },
        remote:
        {
            "package/package.json": JSON.stringify
            (
                {
                    name:    "foo",
                    version: "1.0.0",
                } as PackageJson,
            ),
        },
        expected: true,
    },
    {
        skip,
        message: "Package version should be ignored",
        options: { ignorePackageVersion: true },
        local:
        {
            "package/package.json": JSON.stringify
            (
                {
                    name:    "foo",
                    version: "2.0.0",
                } as PackageJson,
            ),
        },
        remote:
        {
            "package/package.json": JSON.stringify
            (
                {
                    name:    "foo",
                    version: "1.0.0",
                } as PackageJson,
            ),
        },
        expected: false,
    },
    {
        skip,
        message:  "Source map should be ignored",
        options:  { },
        local:    { "package/foo": "foo" },
        remote:   { "package/foo": "foo\n//# sourceMappingURL=foo.js.map" },
        expected: false,
    },
    {
        skip,
        message:  "File references should be ignored",
        options:  { },
        local:
        {
            "package/package.json": JSON.stringify
            (
                {
                    name:         "foo",
                    version:      "1.0.0",
                    dependencies: { bar: "file:bar" },
                } as PackageJson,
            ),
        },
        remote:
        {
            "package/package.json": JSON.stringify
            (
                {
                    name:         "foo",
                    version:      "1.0.0",
                    dependencies: { bar: "1.0.0" },
                } as PackageJson,
            ),
        },
        expected: false,
    },
    {
        skip,
        message: "Files that matches the provided pattern should be ignored",
        options: { ignoreFiles: ["**/*.md"] },
        local:
        {
            "package/foo":             "foo",
            "package/readme.md":       "local",
            "package/tests/readme.md": "local",
        },
        remote:
        {
            "package/foo":             "foo",
            "package/readme.md":       "remote",
            "package/tests/readme.md": "remote",
        },
        expected: false,
    },
];
