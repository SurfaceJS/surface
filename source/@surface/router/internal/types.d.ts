import RouteData from "./route-data";

export type RouteMatch    = { matched: true, routeData: RouteData } | { matched: false, reason: string };
export type RouterMatch<T = RouteData> = { matched: true, value: T } | { matched: false, reason: string };