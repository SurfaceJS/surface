import RouteData from "../route-data";

type RouterMatch<T = RouteData> = { matched: true, value: T } | { matched: false, reason: string };

export default RouterMatch;