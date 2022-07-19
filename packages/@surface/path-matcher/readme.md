# Provides path matching functionality

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
| "..."           | Escapes any character between quotes.                                                                                                                                                                                                  |

## Examples

### instance

```ts
import PathMatcher from "@surface/path-matcher";

const matcher = new PathMatcher("/packages/**/*.{ts,js}", "/modules", "!/packages/node_modules");

console.log(matcher.paths) // ["/packages", "/modules"];
console.log(matcher.isMatch("/packages/foo/index.js"));                  // true
console.log(matcher.isMatch("/packages/foo/bar/index.ts"));              // true
console.log(matcher.isMatch("/modules/index.js"));                       // true
console.log(matcher.isMatch("/lib/foo/baz/index.js"));                   // false
console.log(matcher.isMatch("/packages/node_modules/foo/bar/index.ts")); // false
```

### makeRegex

```ts
import PathMatcher from "@surface/path-matcher";

const regex = PathMatcher.makeRegex("/packages/**/*.{ts,js}");

console.log(regex.test("/lib/foo/baz/index.js"));      // false
console.log(regex.test("/packages/foo/index.js"));     // true
console.log(regex.test("/packages/foo/bar/index.ts")); // true
```

### split

```ts
import PathMatcher from "@surface/path-matcher";

console.log(PathMatcher.split("/foo/**/baz.{ts,js}")); // { base: "/foo",    pattern: "**/baz.{ts,js}" }
console.log(PathMatcher.split("/foo/../baz.{ts,js}")); // { base: "/foo/..", pattern: "baz.{ts,js}" }
```

### resolve

```ts
import PathMatcher from "@surface/path-matcher";

console.log(PathMatcher.resolve("/foo/bar", "./baz.{ts,js}"));   // { base: "/foo/bar", pattern: "baz.{ts,js}",  fullPattern: "/foo/bar/baz.{ts,js}" }
console.log(PathMatcher.resolve("/foo/bar", "../baz.{ts,js}"));  // { base: "/foo",     pattern: "baz.{ts,js}",  fullPattern: "/foo/baz.{ts,js}" }
console.log(PathMatcher.resolve("/foo/bar", "!../baz.{ts,js}")); // { base: "/foo",     pattern: "!baz.{ts,js}", fullPattern: "!/foo/baz.{ts,js}" }"
```
