type UserArguments =
{
    build:      boolean;
    enviroment: "development"|"production";
    watch:      boolean;
    configuration:
    {
        path: string
    }
}

export = class
{
    public static resolve(args: Array<string>): UserArguments
    {
        let userArguments: UserArguments =
        {
            build:      args.includes("build"),
            watch:      args.includes("watch"),
            enviroment: args.includes("production") ? "production" : "development",
            configuration:
            {
                path: ""
            }
        };

        let index = args.indexOf("configuration");
        if (index > -1)
        {
            if (!args[index + 1])
                throw new Error("Invalid configuration path");

            userArguments.configuration.path = args[index + 1];
        }

        return userArguments;
    }
}