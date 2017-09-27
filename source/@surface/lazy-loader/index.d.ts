/**
 * Load code splitted modules
 * @param name Module to load
 */
export default function <T>(name: string): Promise<Constructor<T>>;