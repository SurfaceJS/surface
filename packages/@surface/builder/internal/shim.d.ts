declare module "webpack/lib/dependencies/URLDependency.js"
{
    import webpack from "webpack";

    export default class URLDependency extends webpack.Dependency
    {
        public constructor(request: string, range: [number, number], outerRange: [number, number], relative: boolean);
    }
}
