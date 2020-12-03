declare type Resolver = {
    hooks: {
        resolved: {
            tap(name: string, callback: (request: unknown) => void): void;
        };
    };
};
export default interface IResolvePluginInstance {
    apply: (resolver?: Resolver) => void;
}
export {};
