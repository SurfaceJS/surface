import { HttpContext } from "./http-context";

import * as fs   from "fs";
import * as path from "path";

const internal = { fs, path };

type FS   = typeof internal.fs;
type Path = typeof internal.path;

export abstract class RequestHandler
{
    protected fs:   FS;
    protected path: Path;

    protected constructor();
    protected constructor(fs:  FS, path:  Path);
    protected constructor(fs?: FS, path?: Path)
    {
        this.fs   = fs   || internal.fs;
        this.path = path || internal.path;
    }

    public abstract handle(httpContext: HttpContext): boolean;
}