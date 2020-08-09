import path                   from "path";
import { removePathAsync }    from "@surface/io";
import chalk                  from "chalk";
import webpack                from "webpack";
import { buildConfiguration } from "./common";
import EnviromentType         from "./enums/enviroment-type";
import IConfiguration         from "./interfaces/configuration";

export default class Compiler
{
    private readonly $removePathAsync:     typeof removePathAsync;
    private readonly $webpack:             typeof webpack;
    private readonly enviroment:           EnviromentType;
    private readonly watch:                boolean;
    private readonly webpackCompiler:      webpack.Compiler;
    private readonly webpackConfiguration: webpack.Configuration;

    private readonly logLevel?: webpack.Stats.ToStringOptions;

    public constructor(configuration: IConfiguration = { }, enviroment: EnviromentType = EnviromentType.Development, watch: boolean = false, $removePathAsync = removePathAsync, $webpack = webpack)
    {
        this.logLevel             = configuration.logLevel;
        this.enviroment           = enviroment;
        this.watch                = watch;
        this.$removePathAsync     = $removePathAsync;
        this.$webpack             = $webpack;
        this.webpackConfiguration = buildConfiguration(enviroment, configuration);
        this.webpackCompiler      = this.$webpack(this.webpackConfiguration);
    }

    public build(): void
    {
        const statOptions: webpack.Stats.ToStringOptions = this.logLevel
        ?? {
            assets:   true,
            colors:   true,
            errors:   true,
            version:  true,
            warnings: true,
        };

        const callback: webpack.Compiler.Handler =
            (error, stats) => error ? console.log(error.message) : console.log(stats.toString(statOptions));

        console.log(`Starting ${chalk.bold.green(this.watch ? "Watch" : "Build")} using ${chalk.bold.green(this.enviroment)} configuration.`);

        if (this.watch)
        {
            this.webpackCompiler.watch({ aggregateTimeout: 500, ignored: /node_modules/, poll: true }, callback);
        }
        else
        {
            this.webpackCompiler.run(callback);
        }
    }

    public async clean(): Promise<void>
    {
        if (this.webpackConfiguration.output?.path)
        {
            const outputPath = this.webpackConfiguration.output.path;

            const promises =
            [
                this.$removePathAsync(outputPath),
                this.$removePathAsync(path.resolve(__dirname, ".cache")),
            ];

            await Promise.all(promises);
        }
        else
        {
            throw new Error("Invalid output path.");
        }
    }
}