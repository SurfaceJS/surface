Provides path matching functionality.

Supported Syntax
| Pattern         | Description                                                                                                                                                                                                                            |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| *               | Matches any string, including the null string.                                                                                                                                                                                         |
| **              | Matches all files and zero or more directories and subdirectories.                                                                                                                                                                     |
| […]             | Matches any one of the enclosed characters. A pair of characters separated by a hyphen denotes a range expression (`[A-Za-z]`). If the first character following the `[` is a `!` or a `^` then any character not enclosed is matched. |
| ?               | Matches any single character.                                                                                                                                                                                                          |
| ?(pattern-list) | Matches zero or one occurrence of the given patterns.                                                                                                                                                                                  |
| *(pattern-list) | Matches zero or more occurrences of the given patterns.                                                                                                                                                                                |
| +(pattern-list) | Matches one or more occurrences of the given patterns.                                                                                                                                                                                 |
| @(pattern-list) | Matches one of the given patterns.                                                                                                                                                                                                     |
| !(pattern-list) | Matches anything except one of the given patterns.                                                                                                                                                                                     |
| {x..y[..incr]}  | A brace expansion is contained between a pair of braces `{}`. It can be a list of comma-separated items or a range specifier. Spaces are not permitted inside the braces unless you’ve wrapped the string in quotation marks `"`.      |
| !               | When used at start, all pattern is negated                                                                                                                                                                                             |

# Api
## Parse
Creates a regex object from given pattern.

```ts
import PathMatcher from "@surface/path-matcher";

const regex = PathMatcher.parse("/packages/**/*.{ts,js}");

console.log(regex.test("/lib/foo/baz/index.js"));      // false
console.log(regex.test("/packages/foo/index.js"));     // true
console.log(regex.test("/packages/foo/bar/index.ts")); // true
```

The parse method also accept the following options:

```ts
type Options =
{

    /** Allow patterns to match dotfiles. Otherwise dotfiles are ignored unless a `.` is explicitly defined in the pattern. */
    dot?: boolean,

    /** Disables brace matching `{js,ts}, {a..z}, {0..10}`. */
    noBrace?: boolean,

    /** Perform case-insensitive matching. */
    noCase?: boolean,

    /** Disables pattern lists matching `!(..), @(..), +(..) *(..)`. */
    noExtGlob?: boolean,

    /** Disables GlobStar matching `**`.*/
    noGlobStar?: boolean,

    /** Disables negate matching. `!/foo/**` */
    noNegate?: boolean,
};
```

## Split
Splits base path from the pattern.
```ts
import PathMatcher from "@surface/path-matcher";

console.log(PathMatcher.split("/foo/**/baz.{ts,js}")); // { base: "/foo", pattern: "**/baz.{ts,js}" }
console.log(PathMatcher.split("/foo/../baz.{ts,js}")); // { base: "/foo/..", pattern: "baz.{ts,js}" }
```

## Resolve
Resolve relative patterns. Mostly useful when pattern can include negation.

```ts
import PathMatcher from "@surface/path-matcher";

console.log(PathMatcher.resolve("/foo/bar", "./baz.{ts,js}"));  // /foo/bar/baz.{ts,js}
console.log(PathMatcher.resolve("/foo/bar", "../baz.{ts,js}")); // /foo/baz.{ts,js}

console.log(PathMatcher.resolve("/foo/bar", "!../baz.{ts,js}")); // !/foo/baz.{ts,js}
```
