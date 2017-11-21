export interface Startup
{
    initilize(): void;
}

export type HttpVerbs = 'POST'|'GET'|'PUT'|'DELETE';