/* eslint-disable import/prefer-default-export */
import TaskCanceledError      from "../errors/task-canceled-error.js";
import type { Callable }      from "../types";
import type CancellationToken from "../types/cancellation-token.js";

type Timer = unknown;

declare function setTimeout(action: Callable, timeout?: number): Timer;

export async function runAsync<T>(task: () => T | Promise<T>, timeout?: number, cancellationToken?: CancellationToken): Promise<T>
{
    return new Promise
    (
        (resolve, reject) =>
        {
            setTimeout
            (
                () =>
                {
                    if (cancellationToken?.canceled)
                    {
                        reject(new TaskCanceledError());
                    }
                    else
                    {
                        try
                        {
                            const value = task();

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
        },
    );
}