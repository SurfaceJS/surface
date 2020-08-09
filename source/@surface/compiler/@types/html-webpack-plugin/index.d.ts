
declare module "html-webpack-plugin"
{
    import webpack from "webpack";

    type HtmlWebpackPluginOptions = import("../../internal/types/html-webpack-plugin-options").default;

    class HtmlWebpackPlugin extends webpack.Plugin
    {
        public constructor(options?: HtmlWebpackPluginOptions);
    }

    export default HtmlWebpackPlugin;
}