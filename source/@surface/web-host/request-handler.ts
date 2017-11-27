import { HttpContext } from './http-context';

export abstract class RequestHandler
{
    public abstract handle(httpContext: HttpContext): boolean;
}