import { ObjectLiteral, Nullable } from "@surface/types";

export default interface IRouteData
{
    match:  string;
    params: ObjectLiteral<string>;
    root:   string;
    route:  string;
    search: Nullable<ObjectLiteral<string>>;
}