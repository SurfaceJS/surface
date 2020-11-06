/* eslint-disable import/prefer-default-export */
import { Callable }      from "../types";
import CancellationToken from "../types/cancellation-token";

type Timer = unknown;

declare function clearTimeout(timer: Timer): Timer;
declare function setTimeout(action: Callable, timeout?: number): Timer;

export async function runAsync<T>(action: () => T | Promise<T>, timeout?: number, cancellationToken?: CancellationToken): Promise<T>
{
    return new Promise
    (
        (resolve, reject) =>
        {
            const timer = setTimeout
            (
                () =>
                {
                    if (cancellationToken?.canceled)
                    {
                        reject(new Error("Action was canceled"));
                    }
                    else
                    {
                        try
                        {
                            const value = action();

                            if (value instanceof Promise)
                            {
                                value.then(resolve, reject);
                            }
                            else
                            {
                                resolve(value);
                            }
                        }
                        catch (error)
                        {
                            reject(error);
                        }
                    }
                },
                timeout,
            );

            cancellationToken?.onCancellation.subscribe(() => (clearTimeout(timer), resolve()));
        },
    );
}