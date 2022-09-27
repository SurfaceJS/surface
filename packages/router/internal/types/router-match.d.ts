import type RouteData from "./route-data.js";

type RouterMatch<T = RouteData> = { matched: true, value: T } | { matched: false, reason: string };

export default RouterMatch;
