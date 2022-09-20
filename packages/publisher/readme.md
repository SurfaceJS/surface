# @Surface/Publisher

Tool designed to handles workspaces bumping and publishing.

## Install

```txt
   npm i @surface/publisher
```

## Basic Usage

```txt
    publisher bump minor
    publisher publish --token=<your-registry-token>
```

## How it works

By default, when running `bump` or `publish`, the tool will look for an `packages.json` in the current directory, if this file contains a workspaces property, it will be considered a workspace and the process will execute the `bump` or `publish` on the workspace packages.

## Authentication

Registry and token can be provided through the cli or using a `.npmrc` file at package level, workspace level or user level. Notes that when providing registry or token through the cli will overwrites the `.npmrc`'s values.

Currently only npm automation tokens are supported when publishing on the `https://www.npmjs.com` registry.

## Commands

### Bump

```txt
Usage: publisher bump [options] <version> [preid] [build]

Bump discovered packages or workspaces using provided custom version

Arguments:
  version                          An semantic version or an release type: major, minor, patch, premajor, preminor, prepatch, prerelease. Also can accept an glob prerelease '*-dev+123' to override just the prerelease part of the version. Useful for canary
                                   builds.
  preid                            The 'prerelease identifier' part of a semver. Like the "rc" in 1.2.0-rc.8+2022
  build                            The build part of a semver. Like the "2022" in 1.2.0-rc.8+2022

Options:
  --tag                    <n>     Tag used to compare local and remote packages
  --force                  [n]     Bump packages with no changes
  --independent            [n]     Ignore workspace root version and bump itself
  --synchronize            [n]     Synchronize dependencies between workspace packages after bumping
  --update-file-references [n]     Update file references when bumping
  --packages               <n...>  Packages or workspaces to include
  --registry               <n>     Registry from where packages will be unpublished
  --token                  <n>     Token used to authenticate
  --cwd                    <n>     Working dir
  --dry                    [n]     Enables dry run
  --log-level              <n>     Log level (default: "info")
  --ignore-changes         <n...>  Files to ignore when detecting changes
  -h, --help                       display help for command
```

### Changed

```txt
Usage: publisher changed [options] [tag]

List local packages that have changed compared to remote tagged package.

Arguments:
  tag                              Dist tag used to compare local and remote packages

Options:
  --packages               <n...>  Packages or workspaces to include
  --registry               <n>     Registry from where packages will be unpublished
  --token                  <n>     Token used to authenticate
  --cwd                    <n>     Working dir
  --dry                    [n]     Enables dry run
  --log-level              <n>     Log level (default: "info")
  --ignore-changes         <n...>  Files to ignore when detecting changes
  --include-private        <n>     Includes private packages when publishing or unpublishing
  --include-workspace-root [n]     Includes workspaces root when publishing or unpublishing
  -h, --help                       display help for command
```

### Publish

```txt
Usage: publisher publish [options] [tag]

Publish packages or workspaces packages

Arguments:
  tag                              Tag to publish

Options:
  --synchronize            [n]     Synchronize dependencies between workspace packages before publishing
  --canary                 [n]     Enables canary release
  --prerelease-type        <n>     An prerelease type: premajor, preminor, prepatch, prerelease
  --preid                  <n>     The 'prerelease identifier' part of a semver. Like the "rc" in 1.2.0-rc.8+2022
  --build                  <n>     The build part of a semver. Like the "2022" in 1.2.0-rc.8+2022
  --force                  <n>     Forces to publish unchanged packages. Used by canary
  --packages               <n...>  Packages or workspaces to include
  --registry               <n>     Registry from where packages will be unpublished
  --token                  <n>     Token used to authenticate
  --cwd                    <n>     Working dir
  --dry                    [n]     Enables dry run
  --log-level              <n>     Log level (default: "info")
  --ignore-changes         <n...>  Files to ignore when detecting changes
  --include-private        <n>     Includes private packages when publishing or unpublishing
  --include-workspace-root [n]     Includes workspaces root when publishing or unpublishing
  -h, --help                       display help for command
```

### Unpublish

```txt
Usage: publisher unpublish [options] [tag]

Unpublish packages or workspaces packages

Arguments:
  tag                              Tag to unpublish

Options:
  --packages               <n...>  Packages or workspaces to include
  --registry               <n>     Registry from where packages will be unpublished
  --token                  <n>     Token used to authenticate
  --cwd                    <n>     Working dir
  --dry                    [n]     Enables dry run
  --log-level              <n>     Log level (default: "info")
  --include-private        <n>     Includes private packages when publishing or unpublishing
  --include-workspace-root [n]     Includes workspaces root when publishing or unpublishing
  -h, --help                       display help for command
```
