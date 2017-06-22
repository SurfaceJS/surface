import Path = require("path");

type UserArguments =
{
    enviroment:    string;
    project:       string;
    watch:         boolean;
}

interface Arguments
{
    [key: string]:
    {
        fallback:   Object,
        constraint: Array<string>
    }
}

const ARGUMENTS: Arguments =
{
    enviroment:
    {
        fallback:   null,
        constraint: ["dev", "development", "prod", "production"]
    },
    project:
    {
        fallback:   null,
        constraint: []
    },
    watch:
    {
        fallback:   true,
        constraint: []
    }
}

export = class UserArgumentsParser
{
    public static resolve(args: Array<string>): UserArguments
    {
        let userArguments: UserArguments =
        {
            enviroment:    "development",
            project:       "./surface-project.json",
            watch:         false
        };

        for (let arg of args.slice(2))
        {
            if (arg.indexOf("="))
            {
                let [key, value] = arg.split("=");
                userArguments[key] = UserArgumentsParser.validateArguments(key as keyof UserArguments, value, userArguments[key]);
            }
        }

        return userArguments;
    }

    private static validateArguments<TKey extends keyof UserArguments, T extends string|boolean>(key: TKey, value: string, defaultValue: T): T
    {
        switch (key)
        {
            case "project":
                if (value.endsWith("/"))
                {
                    return value.concat("surface-project.json") as T;
                }
            case "enviroment":
                if (!["dev","development", "prod","production"].includes(key))
                {
                    throw new Error(`argument ${key} has invalid value`)
                }
            default:
                return UserArgumentsParser.treatValue(key, value, defaultValue) as T;
        }
    }

    private static treatValue<T extends string|boolean>(key: string, value: string|null, defaultValue: T): T
    {
        let property = ARGUMENTS[key];

        if (property.constraint.length > 0 && !property.constraint.includes(value))
            throw new Error(`argument ${key} has invalid value`);

        return (value || property.fallback || defaultValue) as T;
    }
}