import type CliProjectOptions from "./cli-project-options.js";
import type Configuration     from "./configuration.js";

type CliOptions =
{
    clean?:   boolean,
    config?:  string,
    logging?: Configuration["logging"],
    main?:    string,
    project?: string,
} & CliProjectOptions;

export default CliOptions;
