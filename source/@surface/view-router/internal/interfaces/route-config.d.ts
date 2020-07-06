import { Component } from "../types";

export default interface IRouteConfig
{
    component: Component | (() => Component)
    path:      string;
    name?:     string;
    slot?:     string;
}