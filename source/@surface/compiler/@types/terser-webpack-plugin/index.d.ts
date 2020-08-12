
declare module "terser-webpack-plugin"
{
    import webpack from "webpack";

    class TerserWebpackPlugin extends webpack.Plugin
    {
        public constructor(options?: TerserWebpackPlugin.Options);
    }

    export default TerserWebpackPlugin;

    export namespace TerserWebpackPlugin
    {
        export type Compress =
        {

            /** Replace arguments[index] with function parameter name whenever possible. */
            arguments?: boolean,

            /** Converts ()=>{return x} to ()=>x. Class and object literal methods will also be converted to arrow expressions if the resultant code is shorter: m(){return x} becomes m:()=>x. */
            arrows?: boolean,

            /** Various optimizations for boolean context, for example !!a ? b : c → a ? b : c */
            booleans?: boolean,

            /** Turn booleans into 0 and 1, also makes comparisons with booleans use == and != instead of === and !==. */
            booleans_as_integers?: boolean,

            /** Collapse single-use non-constant variables, side effects permitting. */
            collapse_vars?: boolean,

            /** Apply certain optimizations to binary nodes, e.g. !(a <= b) → a > b (only when unsafe_comps), attempts to negate binary nodes, e.g. a = !b && !c && !d && !e → a=!(b||c||d||e) etc. */
            comparisons?: boolean,

            /** Transforms constant computed properties into regular ones: {["computed"]: 1} is converted to {computed: 1}. */
            computed_props?: boolean,

            /** Apply optimizations for if-s and conditional expressions */
            conditionals?: boolean,

            /** Remove unreachable code */
            dead_code?: boolean,

            /** Enable most default enabled compress transforms. Useful when you only want to enable a few compress options while disabling the rest. */
            defaults?: boolean,

            /** Remove redundant or non-standard directives */
            directives?: boolean,

            /**
             * Pass true to discard calls to console.* functions. If you wish to drop a specific function call such as console.info and/or retain side effects
             * from function arguments after dropping the function call then use pure_funcs instead.
             **/
            drop_console?: boolean,

            /** Remove debugger; statements */
            drop_debugger?: boolean,

            /** Pass 6 or greater to enable compress options that will transform ES5 code into smaller ES6+ equivalent forms. */
            ecma?: 5 | 6 | 7 | 8,

            /** Attempt to evaluate constant expressions */
            evaluate?: boolean,

            /** Pass true to preserve completion values from terminal statements without return, e.g. in bookmarklets. */
            expression?: boolean,

            global_defs?: object,

            /** Hoist function declarations */
            hoist_funs?: boolean,

            /**
             * Hoist properties from constant object and array literals into regular variables subject to a set of constraints.
             * For example: var o={p:1, q:2}; f(o.p, o.q); is converted to f(1, 2);. Note: hoist_props works best with mangle enabled,
             * the compress option passes set to 2 or higher, and the compress option toplevel enabled. */
            hoist_props?: boolean,

            /** Hoist var declarations (this is false by default because it seems to increase the size of the output in general) */
            hoist_vars?: boolean,

            /** Optimizations for if/return and if/continue */
            if_return?: boolean,

            /** Inline calls to function with simple/return statement: */
            inline?: boolean,

            /**
             * Join consecutive var statements
             *   * false: Same as 0
             *   * 0:     Disabled inlining
             *   * 1:     Inline simple functions
             *   * 2:     Inline functions with arguments
             *   * 3:     Inline functions with arguments and variables
             *   * true:  Same as 3
             */
            join_vars?: boolean | 0 | 1 | 2 | 3,

            /** Prevent the compressor from discarding class names. Pass a regular expression to only keep class names matching that regex. See also: the keep_classnames mangle option. */
            keep_classnames?: boolean,

            /** Prevents the compressor from discarding unused function arguments. You need this for code which relies on Function.length. */
            keep_fargs?: boolean,

            /**
             * Pass true to prevent the compressor from discarding function names. Pass a regular expression to only keep class names matching that regex.
             * Useful for code relying on Function.prototype.name. See also: the keep_fnames mangle option.
             **/
            keep_fnames?: boolean,

            /** Pass true to prevent Infinity from being compressed into 1/0, which may cause performance issues on Chrome. */
            keep_infinity?: boolean,

            /** Optimizations for do, while and for loops when we can statically determine the condition. */
            loops?: boolean,

            /** Pass true when compressing an ES6 module. Strict mode is implied and the toplevel option as well. */
            module?: boolean,

            /** Negate "Immediately-Called Function Expressions" where the return value is discarded, to avoid the parens that the code generator would insert. */
            negate_iife?: boolean,

            /** The maximum number of times to run compress. In some cases more than one pass leads to further compressed code. Keep in mind more passes will take more time. */
            passes?: number,

            /** Rewrite property access using the dot notation, for example foo["bar"] → foo.bar */
            properties?: boolean,

            /**
             * You can pass an array of names and Terser will assume that those functions do not produce side effects.
             * DANGER: will not check if the name is redefined in scope. An example case here, for instance var q = Math.floor(a/b).
             * If variable q is not used elsewhere, Terser will drop it, but will still keep the Math.floor(a/b), not knowing what it does.
             * You can pass pure_funcs: [ 'Math.floor' ] to let it know that this function won't produce any side effect, in which case the whole statement
             * would get discarded. The current implementation adds some overhead (compression will be slower).
             **/
            pure_funcs?: string[] | null,

            /**
             * If you pass true for this, Terser will assume that object property access (e.g. foo.bar or foo["bar"]) doesn't have any side effects.
             * Specify "strict" to treat foo.bar as side-effect-free only when foo is certain to not throw, i.e. not null or undefined.
             **/
            pure_getters?: boolean | "strict",

            /**
             * Allows single-use functions to be inlined as function expressions when permissible allowing further optimization.
             * Enabled by default. Option depends on reduce_vars being enabled. Some code runs faster in the Chrome V8 engine if this option is disabled.
             * Does not negatively impact other major browsers.
             **/
            reduce_funcs?: boolean,

            /** Improve optimization on variables assigned with and used as constant values. */
            reduce_vars?: boolean,

            /**
             * Join consecutive simple statements using the comma operator. May be set to a positive integer to specify the maximum number of consecutive
             * comma sequences that will be generated. If this option is set to true then the default sequences limit is 200. Set option to false or 0
             * to disable. The smallest sequences length is 2. A sequences value of 1 is grandfathered to be equivalent to true and as such means 200.
             * On rare occasions the default sequences limit leads to very slow compress times in which case a value of 20 or less is recommended.
             **/
            sequences?: boolean,

            /**
             * Pass false to disable potentially dropping functions marked as "pure".
             * A function call is marked as "pure" if a comment annotation **@__PURE__** or **#__PURE__** immediately precedes the call.
             * For example: **@__PURE__**foo();
             **/
            side_effects?: boolean,

            /** De-duplicate and remove unreachable switch branches */
            switches?: boolean,

            /** Drop unreferenced functions ("funcs") and/or variables ("vars") in the top level scope (false by default, true to drop both unreferenced functions and variables) */
            toplevel?: boolean,

            /** Prevent specific toplevel functions and variables from unused removal */
            top_retain?: null | string | string[] | RegExp | Function,

            /** Transforms typeof foo == "undefined" into foo === void 0. Note: recommend to set this value to false for IE10 and earlier versions due to known issues. */
            typeofs?: boolean,

            /** Apply "unsafe" transformations. */
            unsafe?: boolean,

            /**
             * Convert ES5 style anonymous function expressions to arrow functions if the function body does not reference this.
             * Note: it is not always safe to perform this conversion if code relies on the the function having a prototype, which arrow functions lack.
             * This transform requires that the ecma compress option is set to 6 or greater.
             **/
            unsafe_arrows?: boolean,

            /**
             * Reverse < and <= to > and >= to allow improved compression.
             * This might be unsafe when an at least one of two operands is an object with computed values due the use of methods like get, or valueOf.
             * This could cause change in execution order after operands in the comparison are switching. Compression only works if both comparisons
             * and unsafe_comps are both set to true.
             **/
            unsafe_comps?: boolean,

            /** Compress and mangle Function(args, code) when both args and code are string literals. */
            unsafe_Function?: boolean,

            /** Optimize numerical expressions like 2 * x * 3 into 6 * x, which may give imprecise floating point results. */
            unsafe_math?: boolean,

            /**
             * Converts { m: function(){} } to { m(){} }. ecma must be set to 6 or greater to enable this transform.
             * If unsafe_methods is a RegExp then key/value pairs with keys matching the RegExp will be converted to concise methods.
             * Note: if enabled there is a risk of getting a "<method name> is not a constructor" TypeError should any code try to new the former function.
             **/
            unsafe_methods?: boolean,

            /** Optimize expressions like Array.prototype.slice.call(a) into [].slice.call(a) */
            unsafe_proto?: boolean,

            /** Enable substitutions of variables with RegExp values the same way as if they are constants. */
            unsafe_regexp?: boolean,

            /** Substitute void 0 if there is a variable named undefined in scope (variable name will be mangled, typically reduced to a single character) */
            unsafe_undefined?: boolean,

            /** Drop unreferenced functions and variables (simple direct variable assignments do not count as references unless set to "keep_assign") */
            unused?: boolean,

            /** Display warnings when dropping unreachable code or unused declarations etc. */
            warnings?: boolean,
        };

        export type ExtractComments =
        {
            banner:         boolean | string | ((licenseFile: string) => string),
            condition:      boolean | string | RegExp | ((node: unknown, comment: unknown) => boolean | object),
            filename:       string | ((file: string) => string),
            warningsFilter: (warning: string, source: string) => boolean,
        };

        export type Mangle =
        {

            /** Mangle names visible in scopes where eval or with are used. */
            eval?: boolean,

            /** Prevent mangle class names. Pass a regular expression to only keep class names matching that regex. See also: the keep_classnames compress option. */
            keep_classnames?: boolean,

            /**
             * Prevent mangle function names. Pass a regular expression to only keep class names matching that regex.
             * Useful for code relying on Function.prototype.name. See also: the keep_fnames compress option.
             **/
            keep_fnames?: boolean,

            /** ES6 modules, where the toplevel scope is not the global scope. Implies toplevel. */
            module?: boolean,

            /** Identifiers that should be excluded from mangling. Example: ["foo", "bar"]. */
            reserved?: string[],

            /** Mangle names declared in the top level scope. */
            toplevel?: boolean,

            /** Work around the Safari 10 loop iterator bug "Cannot declare a let variable twice". See also: the safari10 output option. */
            safari10?: boolean,
        };

        export type Options =
        {
            cache?:           boolean | string,
            cacheKeys?:       (defaultCacheKeys: object, file: string) => object,
            exclude?:         string | RegExp | (string | RegExp)[],
            extractComments?: boolean | string | RegExp | ((node: unknown, comment: unknown) => boolean) | ExtractComments,
            include?:         string | RegExp | (string | RegExp)[],
            minify?:          Function,
            parallel?:        boolean | number,
            sourceMap?:       boolean,
            test?:            string | RegExp | (string | RegExp)[],
            terserOptions?:   TerserOptions,
        };

        export type Parse =
        {

            /** Support top level return statements */
            bare_returns?: boolean,

            /** Note: this setting is not presently enforced except for ES8 optional trailing commas in function parameter lists and calls with ecma 8. */
            ecma?: 5 | 6 | 7 | 8,

            html5_comments?: boolean,

            /** Support #!command as the first line */
            shebang?: boolean,
        };

        export type TerserOptions =
        {

            /** False to skip compressing entirely. Pass an object to specify custom compress options */
            compress?: boolean | Compress,

            /** Override parse, compress and output options */
            ecma?: 5 | 6 | 7 | 8,

            /** Support IE8. */
            ie8?: boolean,

            /** Prevent discarding or mangling of class names. Pass a regular expression to only keep class names matching that regex. */
            keep_classnames?: boolean | RegExp,

            /**
             * Prevent discarding or mangling of function names. Pass a regular expression to only keep class names matching that regex.
             * Useful for code relying on Function.prototype.name.
             * If the top level minify option keep_classnames is undefined it will be overridden with the value of the top level minify option keep_fnames.
             **/
            keep_fnames?: boolean | RegExp,

            /** False to skip mangling names, or pass an object to specify mangle options */
            mangle?: boolean | Mangle,

            /** Use when minifying an ES6 module. "use strict" is implied and names can be mangled on the top scope. If compress or mangle is enabled then the toplevel option will be enabled. */
            module?: boolean,

            /**
             * Pass an empty object {} or a previously used nameCache object if you wish to cache mangled variable and property names across multiple
             * invocations of minify(). Note: this is a read/write property. minify() will read the name cache state of this object and update it during
             * minification so that it may be reused or externally persisted by the user.
             **/
            nameCache?: object | null,

            /** Additional parse options */
            parse?: Parse,

            /** Additional output options. The defaults are optimized for best compression. */
            output?: object | null,

            /** To work around Safari 10/11 bugs in loop scoping and await. See safari10 options in mangle and output for details. */
            safari10?: boolean,

            /** Source map options */
            sourceMap?: boolean | object,

            /** Set to true if you wish to enable top level variable and function name mangling and to drop unused variables and functions. */
            toplevel?: boolean,

            /** Return compressor warnings in result.warnings. Use the value "verbose" for more detailed warnings */
            warnings?: boolean | "verbose",
        };
    }
}
