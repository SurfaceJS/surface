import { IRouteData } from "..";

export type RouteValidExpectation =
    {
        expected: IRouteData | null,
        pattern:  string,
        url:      string,
    };

export type RouteInvalidExpectation =
    {
        error:   Error,
        pattern: string,
        url:     string,
    };

export const routeValidExpectations: Array<RouteValidExpectation> =
    [
        {
            expected:
            {
                hash:   "",
                path:    "",
                params: { },
                query:  { },
            },
            pattern: "",
            url:     ""
        },
        {
            expected: null,
            pattern:  "/path",
            url:      ""
        },
        {
            expected:
            {
                hash:   "",
                params: { },
                path:   "/path",
                query:  { },
            },
            pattern: "/path",
            url:     "/path"
        },
        {
            expected:
            {
                hash:   "example",
                params: { },
                path:   "/path",
                query:  { },
            },
            pattern: "/path",
            url:     "/path#example"
        },
        {
            expected:
            {
                hash:   "",
                params: { },
                path:   "/path",
                query:  { value1: "1", value2: "2" },
            },
            pattern: "/path",
            url:     "/path?value1=1&value2=2"
        },
        {
            expected:
            {
                hash:   "",
                params: { },
                path:   "/path-path",
                query:  { },
            },
            pattern: "/path*",
            url:     "/path-path"
        },
        {
            expected:
            {
                hash:   "",
                params: { },
                path:   "/pathpathpath/path",
                query:  { },
            },
            pattern: "/path*path/path",
            url:     "/pathpathpath/path"
        },
        {
            expected:
            {
                hash:   "",
                params: { value: "path" },
                path:   "/path",
                query:  { },
            },
            pattern: "/{value}",
            url:     "/path"
        },
        {
            expected:
            {
                hash:   "",
                params: { value: "path" },
                path:   "/path-path",
                query:  { },
            },
            pattern: "/{value}-path",
            url:     "/path-path"
        },
        {
            expected:
            {
                hash:   "",
                params: { value: "path" },
                path:   "/pathpathpath/path",
                query:  { },
            },
            pattern: "/path{value}path/path",
            url:     "/pathpathpath/path"
        },
        {
            expected:
            {
                hash:   "",
                params: { value1: "path", value2: "path", value3: "path" },
                path:   "/pathpathpathpathpathpathpathpath/path",
                query:  { },
            },
            pattern: "/path{value1}pathpath{value2}pathpath{value3}/path",
            url:     "/pathpathpathpathpathpathpathpath/path"
        },
        {
            expected:
            {
                hash:   "",
                params: { value1: "home", value2: "index" },
                path:   "path/home/index",
                query:  { },
            },
            pattern: "path/{value1}/{value2}",
            url:     "path/home/index"
        },
        {
            expected:
            {
                hash:   "",
                params: { value1: "home" },
                path:   "path/home",
                query:  { },
            },
            pattern: "path/{value1}/{value2?}",
            url:     "path/home"
        },
        {
            expected:
            {
                hash:   "",
                params: { },
                path:   "path",
                query:  { },
            },
            pattern: "path/{value1?}/{value2?}",
            url:     "path"
        },
        {
            expected:
            {
                hash:   "",
                params: { value1: "home", value2: "index" },
                path:   "path/home",
                query:  { },
            },
            pattern: "path/{value1}/{value2=index}",
            url:     "path/home"
        },
        {
            expected:
            {
                hash:   "",
                params: { value1: "home", value2: "index" },
                path:   "path",
                query:  { },
            },
            pattern: "path/{value1=home}/{value2=index}",
            url:     "path"
        },
        {
            expected:
            {
                hash:   "",
                params: { value1: "home", value2: "index" },
                path:   "path/index",
                query:  { },
            },
            pattern: "path/{value1=home}/{value2}",
            url:     "path/index"
        },
        {
            expected:
            {
                hash:   "",
                params: { value1: "home", value2: "index" },
                path:   "path/path",
                query:  { },
            },
            pattern: "path/path{value1=home}/{value2=index}",
            url:     "path/path"
        },
        {
            expected:
            {
                hash:   "",
                params: { value1: "home", value2: "index" },
                path:   "path/pathpath",
                query:  { },
            },
            pattern: "path/path{value1=home}path/{value2=index}",
            url:     "path/pathpath"
        },
        {
            expected:
            {
                hash:   "",
                params: { value1: "home", value2: "index" },
                path:   "path/pathpath",
                query:  { },
            },
            pattern: "path/path{value1=home}path/{value2=index}",
            url:     "path/pathpath"
        },
        {
            expected:
            {
                hash:   "",
                params: { value: ["path", "path"] },
                path:   "path/path.path",
                query:  { },
            },
            pattern: "path/{value:transformer}",
            url:     "path/path.path"
        },
        {
            expected:
            {
                hash:   "",
                params: { value: ["path", "path", "path"] },
                path:   "path/path.path.path",
                query:  { },
            },
            pattern: "path/{value:transformer=path.path}",
            url:     "path/path.path.path"
        },
        {
            expected:
            {
                hash:   "",
                params: { value: ["path", "path"] },
                path:   "path",
                query:  { },
            },
            pattern: "path/{value:transformer=path.path}",
            url:     "path"
        },
        {
            expected:
            {
                hash:   "",
                params: { },
                path:   "path",
                query:  { },
            },
            pattern: "path/{value:transformer?}",
            url:     "path"
        },
        {
            expected:
            {
                hash:   "",
                params: { value: "path/path/path/path" },
                path:   "path/path/path/path/path",
                query:  { },
            },
            pattern:  "path/{*value}",
            url:      "path/path/path/path/path"
        },
        {
            expected:
            {
                hash:   "",
                params: { value: "path/path/path" },
                path:   "path/path/path/path/path",
                query:  { },
            },
            pattern:  "path/{*value}/path",
            url:      "path/path/path/path/path"
        },
    ];

export const routeInvalidExpectations: Array<RouteInvalidExpectation> =
    [
        {
            error:   new Error("Unregistred tranformer Foo"),
            pattern: "/path/{value:Foo}",
            url:     "/path/path",
        }
    ];