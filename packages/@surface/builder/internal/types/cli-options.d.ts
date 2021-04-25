import type CliProjectOptions from "./cli-project-options";
import type Configuration     from "./configuration";

type CliOptions =
{
    config?:  string,
    logging?: Configuration["logging"],
    main?:    string,
    project?: string,
} & CliProjectOptions;

export default CliOptions;
