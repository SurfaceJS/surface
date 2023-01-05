import type Logger from "@surface/logger";
import fetch       from "node-fetch";

type Options =
{
    apiUrl?: string,
    owner:   string,
    project: string,
    token:   string,
    type:    "github" | "gitlab",
};

/* c8 ignore start */

const APIS: Record<Options["type"], string> =
{
    "github": "https://api.github.com",
    "gitlab": "https://gitlab.com/api/v4",
};

export default class ReleaseClient
{
    private readonly apiUrl:  string;
    private readonly owner:   string;
    private readonly project: string;
    private readonly token:   string;
    private readonly type:    Options["type"];

    public constructor(options: Options, private readonly logger: Logger)
    {
        this.apiUrl  = options.apiUrl ?? APIS[options.type];
        this.owner   = options.owner;
        this.project = options.project;
        this.token   = options.token;
        this.type    = options.type;
    }

    public async createRelease(tag: string, notes: string): Promise<void>
    {
        if (this.type == "github")
        {
            const url = new URL([this.apiUrl, "repos", this.owner, this.project, "releases"].join("/"));

            const payload =
            {
                tag_name:               tag,
                name:                   tag,
                body:                   notes,
                draft:                  false,
                prerelease:             false,
                generate_release_notes: false,
            };

            const response = await fetch
            (
                url.href,
                {
                    method:  "post",
                    body:    JSON.stringify(payload),
                    headers:
                    {
                        "Authorization": `Bearer ${this.token}`,
                        "Content-Type":  "application/json",
                        "Accept":        "application/vnd.github+json",
                    },
                },
            );

            if (response.ok)
            {
                this.logger.info("Github release created!");
            }
            else
            {
                this.logger.error("Failed to create Github release!");
            }
        }
        else
        {
            const url     = new URL([this.apiUrl, "projects", encodeURIComponent([this.owner, this.project].join("/")), "release"].join("/"));
            const payload = { name: tag, tag_name: tag, description: notes };

            const response = await fetch
            (
                url.href,
                {
                    method:  "post",
                    body:    JSON.stringify(payload),
                    headers:
                    {
                        "PRIVATE-TOKEN": this.token,
                        "Content-Type":  "application/json",
                    },
                },
            );

            if (response.ok)
            {
                this.logger.info("Gitlab release created!");
            }
            else
            {
                this.logger.error("Failed to create Gitlab release!");
            }
        }
    }
}

/* c8 ignore stop */
