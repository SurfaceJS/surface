declare function setTimeout(callback: () => void): void;

export function runAsync<T>(action: () => T): Promise<T>
{
    return new Promise
    (
        (resolve, reject) => setTimeout
        (
            () =>
            {
                try
                {
                    resolve(action());
                }
                catch (error)
                {
                    reject(error);
                }
            }
        )
    );
}