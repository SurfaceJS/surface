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
Usage: publisher bump [options] <version> [preid]

Bump discovered packages or workspaces using provided custom version

Arguments:
  version                          An semantic version or an release type: major, minor, patch, premajor, preminor, prepatch, prerelease. Also can accept an glob prerelease '*-dev+123' to override just the prerelease part of the version. Useful for
                                   canary builds.
  preid                            The 'prerelease identifier' to use as a prefix for the 'prerelease' part of a semver. Like the rc in 1.2.0-rc.8

Options:
  --synchronize            [n]     Synchronize dependencies between workspace packages after bumping
  --independent            [n]     Ignore workspace version and bump itself
  --update-file-references [n]     Update file references when bumping
  --packages               <n...>  Packages or workspaces to include
  --include-private        <n>     Include private packages
  --cwd                    <n>     Working dir
  --dry                    [n]     Enables dry run
  --log-level              <n>     Log level (default: "info")
  -h, --help                       display help for command
```

### Publish

```txt
Usage: publisher publish [options] [tag]

Publish packages or workspaces packages

Arguments:
  tag                              Tag that will to publish

Options:
  --synchronize            [n]     Synchronize dependencies between workspace packages before publishing
  --canary                 [n]     Enables canary release
  --prerelease-type        <n>     An prerelease type: premajor, preminor, prepatch, prerelease
  --identifier             <n>     Identifier used to generate canary prerelease
  --sequence               <n>     Sequence used to compose the prerelease
  --registry               <n>     Registry from where packages will be unpublished
  --token                  <n>     Token used to authenticate
  --include-workspace-root [n]     Includes workspaces root
  --packages               <n...>  Packages or workspaces to include
  --include-private        <n>     Include private packages
  --cwd                    <n>     Working dir
  --dry                    [n]     Enables dry run
  --log-level              <n>     Log level (default: "info")
  -h, --help                       display help for command
```

### Unpublish

```txt
Usage: publisher unpublish [options] [tag]

Unpublish packages or workspaces packages

Arguments:
  tag                              Tag that will to unpublish

Options:
  --registry               <n>     Registry from where packages will be unpublished
  --token                  <n>     Token used to authenticate
  --include-workspace-root [n]     Includes workspaces root
  --packages               <n...>  Packages or workspaces to include
  --include-private        <n>     Include private packages
  --cwd                    <n>     Working dir
  --dry                    [n]     Enables dry run
  --log-level              <n>     Log level (default: "info")
  -h, --help                       display help for command
```
