type HtmlWebpackPluginOptions =
{

    /**
     * Inject a base tag. E.g. base: "https://example.com/path/page.html
     * @default false
     **/
    base?: object | string | false,

    /**
     * @default true
     * Emit the file only if it was changed
     **/
    cache?: boolean,

    /** Allows you to add only some chunks (e.g only the unit-test chunk) */
    chunks?: unknown,

    /**
     * @default "auto"
     * Allows to control how chunks should be sorted before they are included to the HTML. Allowed values are 'none' \| 'auto' \| 'manual' \| {Function}
     **/
    chunksSortMode?: "none" | "auto" | "manual" | Function,

    /**
     * @default ""
     *  Allows you to skip some chunks (e.g don't add the unit-test chunk)
     **/
    excludeChunks?: string[],

    /**
     * Adds the given favicon path to the output HTML
     * @default ""
     **/
    favicon?: string,

    /**
     * The file to write the HTML to. Defaults to index.html. You can specify a subdirectory here too (eg: assets/admin.html)
     * @default "index.html"
     **/
    filename?: string,

    /**
     * If true then append a unique webpack compilation hash to all included scripts and CSS files. This is useful for cache busting
     * @default false
     * */
    hash?: boolean,

    /**
     * Inject all assets into the given template or templateContent. When passing true or 'body' all javascript resources will be placed at the bottom of the body element.
     * 'head' will place the scripts in the head element - see the inject:false example
     * @default true
     **/
    inject?: boolean | "head" | "body",

    /**
     * Allows to inject meta-tags. E.g. meta: {viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no'}
     * @default {}
     **/
    meta?: Record<string, string>,

    /**
     * If mode is "production", otherwise false Controls if and in what ways the output should be minified. See [minification](https://www.npmjs.com/package/html-webpack-plugin#minification) for more details.
     * @default true
     **/
    minify?: boolean | object,

    /**
     * Modern browsers support non blocking javascript loading ("defer") to improve the page startup performance.
     * @default "blocking"
     **/
    scriptLoading?: "blocking" | "defer",

    /**
     * @default true
     * Errors details will be written into the HTML page
     **/
    showErrors?: boolean,

    /**
     * Webpack relative or absolute path to the template. By default it will use src/index.ejs if it exists. Please see the docs for details
     * @default ""
     **/
    template?: string,

    /**
     * Can be used instead of template to provide an inline template - please read the Writing Your Own Templates section
     * @default false
     **/
    templateContent?: string | Function | false,

    /**
     * Allows to overwrite the parameters used in the template - see example
     * @default false
     **/
    templateParameters?: boolean | object | Function,

    /** Webpack App The title to use for the generated HTML document */
    title?: string,
    xhtml?: boolean,
};

export default HtmlWebpackPluginOptions;