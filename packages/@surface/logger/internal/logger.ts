/* eslint-disable sort-keys */
import chalk, { type ChalkInstance } from "chalk";
import LogLevel                      from "./enums/log-level.js";

declare const console: { log: Function };

const COLORS: Record<keyof typeof LogLevel, ChalkInstance> =
{
    None:  chalk.hex("#ffffff"),
    Fatal: chalk.hex("#761d14"),
    Error: chalk.hex("#bf0615"),
    Warn:  chalk.hex("#de843d"),
    Info:  chalk.hex("#68a0d4"),
    Debug: chalk.hex("#ecb740"),
    Trace: chalk.hex("#649c4c"),
};

export default class Logger
{

    public constructor(private readonly logLevel: LogLevel)
    { }

    private log(message: string, level: keyof typeof LogLevel): void
    {
        console.log(`${chalk.gray(`[${level} ${new Date().toISOString()}]`)} ${COLORS[level](message)}`);
    }

    public fatal(message: string): void
    {
        if (this.logLevel >= LogLevel.Fatal)
        {
            this.log(message, "Fatal");
        }
    }

    public error(message: string): void
    {
        if (this.logLevel >= LogLevel.Error)
        {
            this.log(message, "Error");
        }
    }

    public warn(message: string): void
    {
        if (this.logLevel >= LogLevel.Warn)
        {
            this.log(message, "Warn");
        }
    }

    public info(message: string): void
    {
        if (this.logLevel >= LogLevel.Info)
        {
            this.log(message, "Info");
        }
    }

    public debug(message: string): void
    {
        if (this.logLevel >= LogLevel.Debug)
        {
            this.log(message, "Debug");
        }
    }

    public trace(message: string): void
    {
        if (this.logLevel >= LogLevel.Trace)
        {
            this.log(message, "Trace");
        }
    }
}