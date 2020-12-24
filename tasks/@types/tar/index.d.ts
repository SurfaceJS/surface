
declare module "tar"
{
    import type { Stream } from "stream";
    import MiniPass        from "minipass";

    export interface ICreateOptions
    {

        /** The current working directory for creating the archive. Defaults to process.cwd(). [Alias: C] */
        cwd?: unknown;

        /** Write the tarball archive to the specified filename.
         * If this is specified, then the callback will be fired when the file has been written,
         * and a promise will be returned that resolves when the file is written.
         * If a filename is not specified, then a Readable Stream will be returned which will emit the file data. [Alias: f] */
        file?: unknown;

        /** A function that gets called with (path, stat) for each entry being added. Return true to add the entry to the archive, or false to omit it. */
        filter?: unknown;

        /** Set to true to pack the targets of symbolic links. Without this option, symbolic links are archived as such. [Alias: L, h] */
        follow?: unknown;

        /** Set to any truthy value to create a gzipped archive, or an object with settings for zlib.Gzip() [Alias: z] */
        gzip?: unknown;

        /** A number specifying how many concurrent jobs to run. Defaults to 4. */
        jobs?: unknown;

        /** A Map object containing the device and inode value for any file whose nlink is > 1, to identify hard links. */
        linkCache?: unknown;

        /** The maximum buffer size for fs.read() operations. Defaults to 16 MB. */
        maxReadSize?: unknown;

        /** The mode to set on the created file archive */
        mode?: unknown;

        /** Set to a Date object to force a specific mtime for everything added to the archive. Overridden by noMtime. */
        mtime?: unknown;

        /** Do not recursively archive the contents of directories. [Alias: n] */
        noDirRecurse?: unknown;

        /**
         * Set to true to omit writing mtime values for entries. Note that this prevents using other mtime-based features like tar.update or thekeepNewer
         * option with the resulting tar archive. [Alias: m, no-mtime]
         **/
        noMtime?: unknown;

        /** Suppress pax extended headers. Note that this means that long paths and linkpaths will be truncated, and large or negative numeric values may be interpreted incorrectly. */
        noPax?: unknown;

        /** A function that will get called with (code, message, data) for any warnings encountered. (See "Warnings and Errors") */
        onwarn?: unknown;

        /**
         * Omit metadata that is system-specific: ctime, atime, uid, gid, uname, gname, dev, ino, and nlink. Note that mtime is still included,
         * because this is necessary for other time-based operations. Additionally, mode is set to a "reasonable default" for most unix systems, based on a umask value of 0o22.
         **/
        portable?: unknown;

        /** A path portion to prefix onto the entries in the archive. */
        prefix?: unknown;

        /** Allow absolute paths. By default, / is stripped from absolute paths. [Alias: P] */
        preservePaths?: unknown;

        /** A Map object that caches calls to readdir. */
        readdirCache?: unknown;

        /** A Map object that caches calls lstat. */
        statCache?: unknown;

        /** Treat warnings as crash-worthy errors. Default false. */
        strict?: unknown;

        /** Act synchronously. If this is set, then any provided file will be fully written after the call to tar.c.
         * If this is set, and a file is not provided, then the resulting stream will already have the data ready to read or emit('data') as soon as you request it. */
        sync?: unknown;
    }

    export interface IExtractOptions
    {

        /** Extract files relative to the specified directory. Defaults to process.cwd(). If provided, this must exist and must be a directory. [Alias: C] */
        cwd?: unknown;

        /** A Map object of which directories exist. */
        dirCache?: unknown;

        /** Default mode for directories */
        dmode?: unknown;

        /** The archive file to extract. If not specified, then a Writable stream is returned where the archive data should be written. [Alias: f] */
        file?: unknown;

        /** A function that gets called with (path, entry) for each entry being unpacked. Return true to unpack the entry from the archive, or false to skip it. */
        filter?: unknown;

        /** Default mode for files */
        fmode?: unknown;

        /**
         * Set to a number to force ownership of all extracted files and folders, and all implicitly created directories, to be owned by the specified
         * group id, regardless of the gid field in the archive. Cannot be used along with preserveOwner. Requires also setting a uid option.
         **/
        gid?: unknown;

        /** Do not overwrite existing files. In particular, if a file appears more than once in an archive, later copies will not overwrite earlier copies. [Alias: k, keep-existing] */
        keep?: unknown;

        /** The maximum size of meta entries that is supported. Defaults to 1 MB. */
        maxMetaEntrySize?: unknown;

        /** The maximum buffer size for fs.read() operations. Defaults to 16 MB. */
        maxReadSize?: unknown;

        /** Set to true to keep the existing file on disk if it's newer than the file in the archive. [Alias: keep-newer, keep-newer-files] */
        newer?: unknown;

        /** Set to true to omit writing mtime value for extracted entries. [Alias: m, no-mtime] */
        noMtime?: unknown;

        /** A function that gets called with (entry) for each entry that passes the filter. */
        onentry?: unknown;

        /** A function that will get called with (code, message, data) for any warnings encountered. (See "Warnings and Errors") */
        onwarn?: unknown;

        /**
         * If true, tar will set the uid and gid of extracted entries to the uid and gid fields in the archive. This defaults to true when run as root,
         * and false otherwise. If false, then files and directories will be set with the owner and group of the user running the process. This is similar
         * to -p in tar(1), but ACLs and other system-specific data is never unpacked in this implementation, and modes are set by default already. [Alias: p]
         **/
        preserveOwner?: unknown;

        /**
         * Allow absolute paths, paths containing .., and extracting through symbolic links. By default, / is stripped from absolute paths, .. paths are not
         * extracted, and any file whose location would be modified by a symbolic link is not extracted. [Alias: P]
         **/
        preservePaths?: unknown;

        /** Treat warnings as crash-worthy errors. Default false. */
        strict?: unknown;

        /**
         * Remove the specified number of leading path elements. Pathnames with fewer elements will be silently skipped. Note that the pathname is edited
         * after applying the filter, but before security checks. [Alias: strip-components, stripComponents]
         **/
        strip?: unknown;

        /** Create files and directories synchronously. */
        sync?: unknown;

        /**
         * Provide a function that takes an entry object, and returns a stream, or any falsey value. If a stream is provided, then that stream's data will
         * be written instead of the contents of the archive entry. If a falsey value is provided, then the entry is written to disk as normal.
         * (To exclude items from extraction, use the filter option described above.)
         **/
        transform?: unknown;

        /**
         * Set to a number to force ownership of all extracted files and folders, and all implicitly created directories,
         * to be owned by the specified user id, regardless of the uid field in the archive. Cannot be used along with preserveOwner.
         * Requires also setting a gid option.
         **/
        uid?: unknown;

        /** Filter the modes of entries like process.umask(). */
        umask?: unknown;

        /**
         * Unlink files before creating them. Without this option, tar overwrites existing files, which preserves existing hardlinks.
         * With this option, existing hardlinks will be broken, as will any symlink that would affect the location of an extracted file. [Alias: U]
         **/
        unlink?: unknown;

    }

    export interface IListOptions
    {

        /** Extract files relative to the specified directory. Defaults to process.cwd(). [Alias: C] */
        cwd?: unknown;

        /** The archive file to list. If not specified, then a Writable stream is returned where the archive data should be written. [Alias: f] */
        file?: unknown;

        /** A function that gets called with (path, entry) for each entry being listed. Return true to emit the entry from the archive, or false to skip it. */
        filter?: unknown;

        /** The maximum buffer size for fs.read() operations. Defaults to 16 MB. */
        maxReadSize?: unknown;

        /** By default, entry streams are resumed immediately after the call to onentry. Set noResume: true to suppress this behavior.
         * Note that by opting into this, the stream will never complete until the entry data is consumed. */
        noResume?: unknown;

        /** A function that gets called with (entry) for each entry that passes the filter.
         * This is important for when both file and sync are set, because it will be called synchronously. */
        onentry?: unknown;

        /** Treat warnings as crash-worthy errors. Default false. */
        strict?: unknown;

        /** Read the specified file synchronously. (This has no effect when a file option isn't specified, because entries are emitted as fast as they are parsed from the stream anyway.) */
        sync?: unknown;
    }

    export interface IReplaceOptions
    {

        /** The current working directory for adding entries to the archive. Defaults to process.cwd(). [Alias: C] */
        cwd?: unknown;

        /** Required. Write the tarball archive to the specified filename. [Alias: f] */
        file?: unknown;

        /** A function that gets called with (path, stat) for each entry being added. Return true to add the entry to the archive, or false to omit it. */
        filter?: unknown;

        /** Set to true to pack the targets of symbolic links. Without this option, symbolic links are archived as such. [Alias: L, h] */
        follow?: unknown;

        /** Set to any truthy value to create a gzipped archive, or an object with settings for zlib.Gzip() [Alias: z] */
        gzip?: unknown;

        /** The maximum buffer size for fs.read() operations. Defaults to 16 MB. */
        maxReadSize?: unknown;

        /** Set to a Date object to force a specific mtime for everything added to the archive. Overridden by noMtime. */
        mtime?: unknown;

        /** Do not recursively archive the contents of directories. [Alias: n] */
        noDirRecurse?: unknown;

        /**
         * Set to true to omit writing mtime values for entries. Note that this prevents using other mtime-based features like tar.update or the keepNewer
         * option with the resulting tar archive. [Alias: m, no-mtime]
         **/
        noMtime?: unknown;

        /** Suppress pax extended headers. Note that this means that long paths and linkpaths will be truncated, and large or negative numeric values may be interpreted incorrectly. */
        noPax?: unknown;

        /** A function that will get called with (code, message, data) for any warnings encountered. (See "Warnings and Errors") */
        onwarn?: unknown;

        /**
         * Omit metadata that is system-specific: ctime, atime, uid, gid, uname, gname, dev, ino, and nlink. Note that mtime is still included,
         * because this is necessary for other time-based operations. Additionally, mode is set to a "reasonable default" for most unix systems,
         * based on a umask value of 0o22.
         **/
        portable?: unknown;

        /** A path portion to prefix onto the entries in the archive. */
        prefix?: unknown;

        /** Allow absolute paths. By default, / is stripped from absolute paths. [Alias: P] */
        preservePaths?: unknown;

        /** Treat warnings as crash-worthy errors. Default false. */
        strict?: unknown;

        /** Act synchronously. If this is set, then any provided file will be fully written after the call to tar.c. */
        sync?: unknown;
    }

    export interface IUpdateOptions
    {

        /** The current working directory for adding entries to the archive. Defaults to process.cwd(). [Alias: C] */
        cwd?: unknown;

        /** Required. Write the tarball archive to the specified filename. [Alias: f] */
        file?: unknown;

        /** A function that gets called with (path, stat) for each entry being added. Return true to add the entry to the archive, or false to omit it. */
        filter?: unknown;

        /** Set to true to pack the targets of symbolic links. Without this option, symbolic links are archived as such. [Alias: L, h] */
        follow?: unknown;

        /** Set to any truthy value to create a gzipped archive, or an object with settings for zlib.Gzip() [Alias: z] */
        gzip?: unknown;

        /** The maximum buffer size for fs.read() operations. Defaults to 16 MB. */
        maxReadSize?: unknown;

        /** Set to a Date object to force a specific mtime for everything added to the archive. Overridden by noMtime. */
        mtime?: unknown;

        /** Do not recursively archive the contents of directories. [Alias: n] */
        noDirRecurse?: unknown;

        /**
         * Set to true to omit writing mtime values for entries. Note that this prevents using other mtime-based features like tar.update or the keepNewer
         * option with the resulting tar archive. [Alias: m, no-mtime]
         **/
        noMtime?: unknown;

        /** Suppress pax extended headers. Note that this means that long paths and linkpaths will be truncated, and large or negative numeric values may be interpreted incorrectly. */
        noPax?: unknown;

        /** A function that will get called with (code, message, data) for any warnings encountered. (See "Warnings and Errors") */
        onwarn?: unknown;

        /**
         * Omit metadata that is system-specific: ctime, atime, uid, gid, uname, gname, dev, ino, and nlink. Note that mtime is still included,
         * because this is necessary for other time-based operations. Additionally, mode is set to a "reasonable default" for most unix systems,
         * based on a umask value of 0o22.
         **/
        portable?: unknown;

        /** A path portion to prefix onto the entries in the archive. */
        prefix?: unknown;

        /** Allow absolute paths. By default, / is stripped from absolute paths. [Alias: P] */
        preservePaths?: unknown;

        /** Treat warnings as crash-worthy errors. Default false. */
        strict?: unknown;

        /** Act synchronously. If this is set, then any provided file will be fully written after the call to tar.c. */
        sync?: unknown;
    }

    /**
     * Create a tarball archive.
     * @param options
     * @param fileList The fileList is an array of paths to add to the tarball.
     * Adding a directory also adds its children recursively.
     * An entry in fileList that starts with an @ symbol is a tar archive whose entries will be added.
     * To add a file that starts with @, prepend it with ./.
     * @param callback Callback
     */
    export function create(options: ICreateOptions, fileList: string[]): Promise<Stream>;
    export function create(options: ICreateOptions, fileList: string[], callback: (promise: Promise<unknown>) => void): void;

    /**
     * Extract a tarball archive.
     * @param options Options
     * @param fileList The fileList is an array of paths to extract from the tarball.
     * If no paths are provided, then all the entries are extracted.
     * If the archive is gzipped, then tar will detect this and unzip it.
     * Note that all directories that are created will be forced to be writable, readable, and listable by their owner, to avoid cases where a directory
     * prevents extraction of child entries by virtue of its mode.
     * Most extraction errors will cause a warn event to be emitted. If the cwd is missing, or not a directory, then the extraction will fail completely.
     * @param callback Callback
     */
    export function extract(options: IExtractOptions, fileList: string[]): Promise<Stream>;
    export function extract(options: IExtractOptions, fileList: string[], callback: (promise: Promise<unknown>) => void): void;

    /**
     * List the contents of a tarball archive.
     * @param options
     * @param fileList The fileList is an array of paths to list from the tarball. If no paths are provided, then all the entries are listed.
     * If the archive is gzipped, then tar will detect this and unzip it.
     * Returns an event emitter that emits entry events with tar.ReadEntry objects. However, they don't emit 'data' or 'end' events.
     * (If you want to get actual readable entries, use the tar.Parse class instead.)
     * @param callback
     */
    export function list(options: IListOptions, fileList: string[]): Promise<Stream>;
    export function list(options: IListOptions, fileList: string[], callback: (promise: Promise<unknown>) => void): void;

    /**
     * Add files to an existing archive. Because later entries override earlier entries, this effectively replaces any existing entries.
     * @param options
     * @param fileList The fileList is an array of paths to add to the tarball. Adding a directory also adds its children recursively.
     * An entry in fileList that starts with an @ symbol is a tar archive whose entries will be added. To add a file that starts with @, prepend it with ./.
     * @param callback
     */
    export function replace(options: IReplaceOptions, fileList: string[]): Promise<Stream>;
    export function replace(options: IReplaceOptions, fileList: string[], callback: (promise: Promise<unknown>) => void): void;

    /**
     * Add files to an archive if they are newer than the entry already in the tarball archive.
     * @param options
     * @param fileList The fileList is an array of paths to add to the tarball.
     * Adding a directory also adds its children recursively.
     * An entry in fileList that starts with an @ symbol is a tar archive whose entries will be added. To add a file that starts with @, prepend it with ./.
     * @param callback
     */
    export function update(options: IUpdateOptions, fileList: string[]): Promise<Stream>;
    export function update(options: IUpdateOptions, fileList: string[], callback: (promise: Promise<unknown>) => void): void;

    /** A readable tar stream. */
    class Pack extends MiniPass
    {
        public static PackSync: PackSync;

        public constructor(options?: Pack.IOptions);

        /** Adds an entry to the archive. Returns the Pack stream. */
        public add(path: string): Pack;

        /** Adds an entry to the archive. Returns true if flushed. */
        public write(path: string): boolean;

        /** Finishes the archive. */
        public end(): void;
    }

    class PackSync extends Pack { }

    export namespace Pack
    {
        export interface IOptions
        {

            /** A function that gets called with (path, stat) for each entry being added. Return true to add the entry to the archive, or false to omit it. */
            filter?: (path: string, stat: unknown) => void;

            /** A function that will get called with (code, message, data) for any warnings encountered. (See "Warnings and Errors") */
            onwarn?: (code: unknown, message: unknown, data: unknown) => void;

            /** Treat warnings as crash-worthy errors. Default false. */
            strict?: boolean;

            /** The current working directory for creating the archive. Defaults to process.cwd(). */
            cwd?: string;

            /** A path portion to prefix onto the entries in the archive. */
            prefix?: string;

            /** Set to any truthy value to create a gzipped archive, or an object with settings for zlib.Gzip() */
            gzip?: unknown;

            /** Omit metadata that is system-specific: ctime, atime, uid, gid, uname, gname, dev, ino, and nlink.
             *  Note that mtime is still included, because this is necessary for other time-based operations. Additionally,
             *  mode is set to a "reasonable default" for most unix systems, based on a umask value of 0o22. */
            portable?: unknown;

            /** Allow absolute paths. By default, / is stripped from absolute paths. */
            preservePaths?: boolean;

            /** A Map object containing the device and inode value for any file whose nlink is > 1, to identify hard links. */
            linkCache?: Map<string, unknown>;

            /** A Map object that caches calls lstat. */
            statCache?: Map<string, unknown>;

            /** A Map object that caches calls to readdir. */
            readdirCache?: Map<string, unknown>;

            /** A number specifying how many concurrent jobs to run. Defaults to 4. */
            jobs?: number;

            /** The maximum buffer size for fs.read() operations. Defaults to 16 MB. */
            maxReadSize?: number;

            /** Do not recursively archive the contents of directories. */
            noDirRecurse?: boolean;

            /** Set to true to pack the targets of symbolic links. Without this option, symbolic links are archived as such. */
            follow?: boolean;

            /**
             * Suppress pax extended headers. Note that this means that long paths and linkpaths will be truncated,
             * and large or negative numeric values may be interpreted incorrectly.
             **/
            noPax?: unknown;

            /**
             * Set to true to omit writing mtime values for entries. Note that this prevents using other mtime-based features like tar.update or
             * the keepNewer option with the resulting tar archive.
             **/
            noMtime?: boolean;

            /** Set to a Date object to force a specific mtime for everything added to the archive. Overridden by noMtime. */
            mtime?: Date;
        }
    }
}