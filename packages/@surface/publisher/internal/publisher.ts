// import { isDirectory } from "@surface/io";

export type Options =
{
    packages?: string[],
};

export default class Publisher
{
    // private readonly options: Required<Options>;
    // public constructor(options: Options)
    // {
    //     this.options =
    //     {
    //         packages: options.packages ?? [],
    //     };
    // }

    public async bump(): Promise<void>
    {
        // for (const package of this.options.packages)
        // {
        //     if (await isDirectory(package))
        //     { }
        // }

        return Promise.resolve();
    }
}