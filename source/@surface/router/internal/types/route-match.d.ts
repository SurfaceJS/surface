import RouteData from "../route-data";

type RouteMatch = { matched: true, routeData: RouteData } | { matched: false, reason: string };

export default RouteMatch;