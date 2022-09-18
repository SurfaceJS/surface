import type NpmService from "../../internal/npm-service.js";

type VirtualRegistryEntry =
{
    tag?:         string,
    remote?:      Record<string, Partial<Awaited<ReturnType<NpmService["get"]>>>>,
    isPublished?: boolean,
    hasChanges?:  boolean,
}

type VirtualRegistry = Record<string, VirtualRegistryEntry>;

export default VirtualRegistry;
