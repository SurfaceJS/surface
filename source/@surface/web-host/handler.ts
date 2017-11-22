import { HttpContext } from './http-context';

export abstract class Handler
{
    public abstract handle(httpContext: HttpContext): boolean;
}