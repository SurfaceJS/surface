import fs          from "fs";
import path        from "path";
import HttpContext from "./http-context";

const internal = { fs, path };

type FS   = typeof internal.fs;
type Path = typeof internal.path;

export default abstract class RequestHandler
{
    protected readonly fs:   FS;
    protected readonly path: Path;

    protected constructor();
    protected constructor(fs:  FS, path:  Path);
    protected constructor(fs?: FS, path?: Path)
    {
        this.fs   = fs   || internal.fs;
        this.path = path || internal.path;
    }

    public abstract handle(httpContext: HttpContext): boolean;
}