import type RouteData from "../types/route-data";

type RouteMatch = { matched: true, routeData: RouteData } | { matched: false, reason: string };

export default RouteMatch;
