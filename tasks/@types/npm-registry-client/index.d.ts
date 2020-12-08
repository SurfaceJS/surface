
declare module "npm-registry-client"
{
    import type { Stream } from "stream";

    export interface IConfiguration
    {
        proxy?:
        {

            /** The URL to proxy HTTP requests through. */
            http?: string,

            /** The URL to proxy HTTPS requests through. Defaults to be the same as proxy.http if unset. */
            https?: string,

            /** The local address to use on multi-homed systems. */
            localAddress?: string,
        };
        ssl?:
        {

            /** Certificate signing authority certificates to trust. */
            ca?: string,

            /** Client certificate (PEM encoded). Enable access to servers that require client certificates. */
            certificate?: string,

            /** Private key (PEM encoded) for client certificate. */
            key?: string,

            /** Whether or not to be strict with SSL certificates. Default = true */
            strict?: string,
        };
        retry?:
        {

            /** Number of times to retry on GET failures. Default = 2. */
            count?: number,

            /** Factor setting for node-retry. Default = 10. */
            factor?: number,

            /** MinTimeout setting for node-retry. Default = 10000 (10 seconds) */
            minTimeout?: number,

            /** MaxTimeout setting for node-retry. Default = 60000 (60 seconds) */
            maxTimeout?: number,
        };

        /** User agent header to send. Default = "node/{process.version}" */
        userAgent?: string;

        /**  The logger to use. Defaults to require("npmlog") if that works, otherwise logs are disabled. */
        log?: object | null;

        /**  The default tag to use when publishing new packages. Default = "latest" */
        defaultTag?: string;

        /** A token for use with couch-login. */
        couchToken?: object;

        /** A random identifier for this set of client requests. Default = 8 random hexadecimal bytes. */
        sessionToken?: string;

        /** The maximum number of connections that will be open per origin (unique combination of protocol:host:port). Passed to the httpAgent. Default = 50 */
        maxSockets?: number;

        /**
         * Identify to severs if this request is coming from CI (for statistics purposes). Default = detected from environment– primarily this is done by
         * looking for the CI environment variable to be set to true. Also accepted are the existence of the JENKINS_URL, bamboo.buildKey and TDDIUM
         * environment variables.
         **/
        isFromCI?: boolean;

        /** The scope of the project this command is being run for. This is the top level npm module in which a command was run. Default = none */
        scope?: string;
    }

    export interface IPackage
    {
        dependencies?:    Record<string, string>;
        devDependencies?: Record<string, string>;
        name:             string;
        version:          string;
        deprecated?: string;
    }

    interface ICredential
    {
        username:   string;
        password:   string;
        email:      string;
        alwaysAuth: boolean;
    }

    interface ITokenCredential
    {
        token:      string;
        alwaysAuth: boolean;
    }

    type Credential = ICredential | ITokenCredential;
    type Callback<T = object> = (error: Error | null, data: T, raw: string, res: object) => void;

    export interface IAuthenticable
    {
        auth: Credential;
    }

    export interface IAccessParams extends IAuthenticable
    {

        /** New access level for the package. Can be either public or restricted. */
        access: string;
    }

    export interface IAdduserParams extends IAuthenticable
    { }

    export interface IDeprecateParams extends IAuthenticable
    {

        /** Semver version range */
        version: string;

        /** The message to use as a deprecation warning. */
        message: string;
    }

    export interface IFetchParams
    {

        /** HTTP headers to be included with the request. Optional. */
        headers: unknown;
        auth?: Credential;
    }

    export interface IGetData
    {
        "dist-tags":    { latest: string };
        author:         { name: string };
        bugs:           { url: string };
        description:    string;
        homepage:       string;
        keywords:       string[];
        license:        string;
        maintainers:    object[];
        name:           string;
        readme:         string;
        readmeFilename: string;
        repository:
        {
            type: string,
            url:  string,
        };
        time:
        {
            [key: string]: string,

            modified: string,
            created:  string,
        };
        versions: Record<string, IPackage | undefined>;
    }

    export interface IGetParams
    {
        auth?: Credential;

        /** Follow 302/301 responses. Optional (default: true). */
        follow?: boolean;

        /** If there's cached data available, then return that to the callback quickly, and update the cache the background. Optional (default: false). */
        fullMetadata?: boolean;

        /** Duration before the request times out. Optional (default: never). */
        staleOk?: boolean;

        /** If true, don't attempt to fetch filtered ("corgi") registry metadata. */
        timeout?: number;
    }

    export interface IPublishParams extends IAuthenticable
    {

        /**  Access for the package. Can be public or restricted (no default). */
        access: "public" | "restricted";

        /** Package metadata. */
        metadata: IPackage;

        /** Stream of the package body / tarball. */
        body: Stream;
    }

    export interface IRequestParams
    {

        /** The request body. Objects that are not Buffers or Streams are encoded as JSON. Optional – body only used for write operations. */
        body: unknown;

        /** Stream the request body as it comes, handling error responses in a non-streaming way. */
        streaming: boolean;
        auth?: Credential;

        /** The cached ETag. Optional. */
        etag?: string;

        /** Follow 302/301 responses. Optional (default: true). */
        follow?: boolean;

        /** HTTP method. Optional (default: "GET"). */
        method?: string;

        /** The cached Last-Modified timestamp. Optional. */
        lastModified?: string;
    }

    export interface ISendAnonymousCLIMetricsParams extends IAuthenticable
    {

        /** A uuid unique to this dataset. */
        metricId: string;

        /** The metrics to share with the registry, with the following properties */
        metrics:
        {

            /** When the first data in this report was collected. */
            from: Date,

            /** When the last data in this report was collected. Usually right now. */
            to: Date,

            /** The number of successful installs in this period. */
            successfulInstalls: number,

            /** The number of installs that ended in error in this period. */
            failedInstalls: number,
        };
    }

    export interface IStarParams extends IAuthenticable
    {

        /** True to star the package, false to unstar it. Optional (default: false) */
        starred?: boolean;
    }

    export interface IStarsParams
    {

        /** (required if username is omitted). */
        auth?: Credential;

        /** Name of user to fetch starred packages for. Optional (default: user in auth). */
        username?: string;
    }

    export interface ITagParams
    {

        /** Tag name to apply. */
        tag: string;

        /** Version to tag. */
        version: string;
    }

    export interface IUnpublishParams extends IAuthenticable
    {

        /** Version to unpublish. Optional – omit to unpublish all versions. */
        version: string;
    }

    export interface IWhoamiParams extends IAuthenticable
    { }

    export namespace DisTags
    {
        export interface IFetchParams extends IAuthenticable
        {

            /** Name of the package */
            package: string;
        }

        export interface IAddParams extends IAuthenticable
        {

            /** Name of the new dist-tag. */
            distTag: string;

            /** Name of the package */
            package: string;

            /** Exact version to be mapped to the dist-tag. */
            version: string;
        }

        export interface ISetParams extends IAuthenticable
        {

            /** Object containing a map from tag names to package versions */
            distTags: object;

            /** Name of the package */
            package: string;
        }

        export interface IUpdateParams extends IAuthenticable
        {

            /** Object containing a map from tag names to package versions */
            distTags: object;

            /** Name of the package */
            package: string;
        }

        export interface IRmParams extends IAuthenticable
        {

            /** Object containing a map from tag names to package versions */
            distTags: object;

            /** Name of the package */
            package: string;
        }
    }

    export interface IDisTags
    {

        /**
         * Add (or replace) a single dist-tag onto the named package.
         * @param uri Base URL for the registry
         * @param params Object containing per-request properties
         * @param cb Callback
         */
        add(uri: string, params: DisTags.IAddParams, cb: Function): void;

        /**
         * Fetch all of the dist-tags for the named package.
         * @param uri Base URL for the registry.
         * @param params Object containing per-request properties
         * @param cb Callback
         */
        fetch(uri: string, params: DisTags.IFetchParams, cb: Function): void;

        /**
         * Remove a single dist-tag from the named package.
         * @param uri Base URL for the registry
         * @param params Object containing per-request properties
         * @param cb Callback
         */
        rm(uri: string, params: DisTags.IRmParams, cb: Function): void;

        /**
         * Set all of the dist-tags for the named package at once, creating any dist-tags that do not already exist.
         * Any dist-tags not included in the distTags map will be removed.
         * @param uri Base URL for the registry
         * @param params Object containing per-request properties
         * @param cb Callback
         */
        set(uri: string, params: DisTags.IAddParams, cb: Function): void;

        /**
         * Update the values of multiple dist-tags, creating any dist-tags that do not already exist.
         * Any pre-existing dist-tags not included in the distTags map will be left alone.
         * @param uri Base URL for the registry
         * @param params Object containing per-request properties
         * @param cb Callback
         */
        update(uri: string, params: DisTags.IUpdateParams, cb: Function): void;
    }

    export default class RegClient
    {
        public distTags: IDisTags;

        public constructor(config?: IConfiguration);

        /**
         * Set the access level for scoped packages. For now, there are only two access levels: "public" and "restricted".
         * @param uri Registry URL for the package's access API endpoint. Looks like /-/package/<package name>/access
         * @param params Object containing per-request properties
         * @param cb Callback
         */
        public access(uri: string, params: IAccessParams, cb: Function): void;

        /**
         * Add a user account to the registry, or verify the credentials.
         * @param uri Base registry URL.
         * @param params Object containing per-request properties.
         * @param cb Callback
         */
        public adduser(uri: string, params: IAdduserParams, cb: Callback): void;

        /**
         * Deprecate a version of a package in the registry.
         * @param uri Full registry URI for the deprecated package.
         * @param params Object containing per-request properties.
         * @param cb Callback
         */
        public deprecate(uri: string, params: IDeprecateParams, cb: Function): void;

        /**
         * Fetches data from the registry via a GET request, saving it in the cache folder with the ETag or the "Last Modified" timestamp.
         * @param uri The complete registry URI to fetch
         * @param params Object containing per-request properties.
         * @param cb Callback
         */
        public get(uri: string, params: IGetParams, cb: Callback<IGetData>): void;

        /**
         * Fetch a package from a URL, with auth set appropriately if included. Used to cache remote tarballs as well as request package tarballs from the registry.
         * @param uri The complete registry URI to upload to
         * @param params Object containing per-request properties.
         * @param cb Callback
         */
        public fetch(uri: string, params: IFetchParams, cb: Function): void;

        /**
         * Publish a package to the registry.
         * Note that this does not create the tarball from a folder.
         * @param uri The complete registry URI to fetch
         * @param params Object containing per-request properties.
         * @param cb Callback
         */
        public publish(uri: string, params: IPublishParams, cb: Function): void;

        /**
         * Make a generic request to the registry. All the other methods are wrappers around client.request.
         * @param uri URI pointing to the resource to request.
         * @param params Object containing per-request properties.
         * @param cb Callback
         */
        public request(uri: string, params: IRequestParams, cb: Function): void;

        /**
         * PUT a metrics object to the /-/npm/anon-metrics/v1/ endpoint on the registry.
         * @param uri Base URL for the registry.
         * @param params Object containing per-request properties.
         * @param cb Callback
         */
        public sendAnonymousCLIMetrics(uri: string, params: ISendAnonymousCLIMetricsParams, cb: Function): void;

        /**
         * Star or unstar a package.
         *
         * Note that the user does not have to be the package owner to star or unstar a package, though other writes do require that the user be the package owner.
         * @param uri The complete registry URI for the package to star.
         * @param params Object containing per-request properties.
         * @param cb Callback
         */
        public star(uri: string, params: IStarParams, cb: Function): void;

        /**
         * View your own or another user's starred packages.
         * @param uri The base URL for the registry.
         * @param params Object containing per-request properties.
         * @param cb Callback
         */
        public stars(uri: string, params: IStarsParams, cb: Function): void;

        /**
         * Mark a version in the dist-tags hash, so that pkg@tag will fetch the specified version.
         * @param uri The complete registry URI to tag
         * @param params Object containing per-request properties.
         * @param cb Callback
         */
        public tag(uri: string, params: ITagParams, cb: Function): void;

        /**
         * Remove a version of a package (or all versions) from the registry. When the last version us unpublished,
         * the entire document is removed from the database.
         * @param uri The complete registry URI of the package to unpublish.
         * @param params Object containing per-request properties.
         * @param cb Callback
         */
        public unpublish(uri: string, params: IUnpublishParams, cb: Function): void;

        /**
         * Simple call to see who the registry thinks you are. Especially useful with token-based auth.
         * @param uri The base registry for the URI.
         * @param params Object containing per-request properties.
         * @param cb Callback
         */
        public whoami(uri: string, params: IWhoamiParams, cb: Function): void;
    }
}