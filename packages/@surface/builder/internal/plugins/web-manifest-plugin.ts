import path             from "path";
import { urlToRequest } from "loader-utils";
import webpack          from "webpack";
import URLDependency    from "webpack/lib/dependencies/URLDependency.js";

type Image = { size: string, src: string };

type Manifest =
{
    icons?: Image[],
};

type Context =
{
    manifests: Map<string, Manifest>,
    modules:   Map<string, webpack.NormalModule>,
};

const EXTENSION = ".webmanifest";

export default class WebManifestPlugin implements webpack.WebpackPluginInstance
{
    public constructor(private readonly options: { publicPath?: string })
    { }

    private async collectDependencies(loaderContext: webpack.LoaderContext<undefined>, context: Context, content: string): Promise<void>
    {
        try
        {
            const manifest = JSON.parse(content) as Manifest;

            const request = this.contextualize(loaderContext.context, loaderContext.request);

            context.manifests.set(request, manifest);

            const module = context.modules.get(request);

            if (module && manifest.icons)
            {
                const promises = manifest.icons.map(async entry => this.resolveImageSrc(loaderContext, module, entry));

                await Promise.all(promises);
            }
        }
        catch (error)
        {
            if (error instanceof SyntaxError)
            {
                throw new Error(`Invalid JSON in Web App Manifest: ${loaderContext.resourcePath}`);
            }
            else
            {
                throw error;
            }
        }
    }

    private contextualize(context: string, resourcePath: string): string
    {
        return path.relative(context, resourcePath).replace(/\\/g, "/");
    }

    private async resolveImageSrc(loaderContext: webpack.LoaderContext<undefined>, module: webpack.NormalModule, image: Image): Promise<void>
    {
        return new Promise
        (
            (resolve, reject) =>
            {
                const request = urlToRequest(image.src, this.options.publicPath);

                loaderContext.resolve
                (
                    loaderContext.context,
                    request,
                    (err, filename) =>
                    {
                        if (err)
                        {
                            return reject(err);
                        }

                        if (filename)
                        {
                            image.src = filename;

                            loaderContext.addDependency(filename);

                            module.addDependency(new URLDependency(filename, [0, 0], [0, 0], true));
                        }

                        resolve();
                    },
                );
            },
        );
    }

    private async readFile(loaderContext: webpack.LoaderContext<undefined>, resourcePath: string): Promise<string | Buffer | undefined>
    {
        return new Promise((resolve, reject) => loaderContext.fs.readFile(resourcePath, (error, content) => error ? reject(error) : resolve(content)));
    }

    private async resourceReader(loaderContext: webpack.LoaderContext<undefined>, context: Context): Promise<string | Buffer | undefined>
    {
        const { resourcePath } = loaderContext;

        if (resourcePath.endsWith(EXTENSION))
        {
            loaderContext.addDependency(resourcePath);

            const buffer  = await this.readFile(loaderContext, resourcePath) as Buffer;
            const content = buffer!.toString();

            await this.collectDependencies(loaderContext, context, content);

            console.log(this.collectDependencies, context);
        }

        return undefined;
    }

    private hookIntoBuildModule(compilation: webpack.Compilation, context: Context): void
    {
        compilation
            .hooks
            .buildModule
            .tap
            (
                WebManifestPlugin.name,
                module =>
                {
                    if ((module as webpack.NormalModule).rawRequest.endsWith(EXTENSION))
                    {
                        const request = this.contextualize(module.context!, (module as webpack.NormalModule).rawRequest);

                        context.modules.set(request, module as webpack.NormalModule);
                    }
                },
            );
    }

    private hookIntoReadResource(compilation: webpack.Compilation, context: Context): void
    {
        webpack
            .NormalModule
            .getCompilationHooks(compilation)
            .readResource
            .for(undefined)
            .tapAsync
            (
                WebManifestPlugin.name,
                (loaderContext, callback) =>
                    void this.resourceReader(loaderContext as webpack.LoaderContext<undefined>, context)
                        .then(x => callback(null, x))
                        .catch(x => callback(x)),
            );
    }

    private hookIntoRenderManifest(compilation: webpack.Compilation, context: Context): void
    {
        compilation
            .hooks
            .renderManifest
            .tap
            (
                WebManifestPlugin.name,
                (entry, options) =>
                {
                    if (context.manifests.size > 0)
                    {
                        const modules = compilation.chunkGraph.getChunkModules(options.chunk) as webpack.NormalModule[];
                        const builds  = new Map(modules.map(x => [x.request, x.buildInfo]));

                        for (const manifest of context.manifests.values())
                        {
                            if (manifest.icons)
                            {
                                for (const icon of manifest.icons)
                                {
                                    const buildInfo = builds.get(icon.src);

                                    if (buildInfo)
                                    {
                                        icon.src = buildInfo.filename;
                                    }
                                }
                            }
                        }
                    }

                    return entry;
                },
            );
    }

    private hookIntoProcessAssets(compilation: webpack.Compilation, context: Context): void
    {
        compilation
            .hooks
            .processAssets
            .tap
            (
                {
                    name:  WebManifestPlugin.name,
                    stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
                },
                () =>
                {
                    if (context.manifests.size > 0)
                    {
                        const assets = new Map(compilation.getAssets().map(x => [x.info.sourceFilename, x]));

                        for (const [key, manifest] of context.manifests)
                        {
                            const manifestAsset = assets.get(key);

                            if (manifestAsset && manifest.icons)
                            {
                                const content = JSON.stringify(manifest, null, 4);

                                compilation.updateAsset(manifestAsset.name, new webpack.sources.RawSource(content));
                            }
                        }
                    }
                },
            );
    }

    public apply(compiler: webpack.Compiler): void
    {
        compiler
            .hooks
            .compilation
            .tap
            (
                WebManifestPlugin.name,
                compilation =>
                {
                    const context = { manifests: new Map(), modules: new Map() };

                    // this.hookIntoReadResource;
                    this.hookIntoReadResource(compilation, context);
                    this.hookIntoBuildModule(compilation, context);
                    this.hookIntoRenderManifest(compilation, context);
                    this.hookIntoProcessAssets(compilation, context);
                },
            );
    }
}