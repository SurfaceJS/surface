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
Usage: publisher bump [options] <release-type> [identifier-or-version]

Bump discovered packages or workspaces using provided custom version

Arguments:
  release-type                      Type of release
  identifier-or-version             When release type is an prerelease, the value is used as identifier, When release type is custom, the value is used as version

Options:
  --packages                <n...>  Packages or workspaces to bump
  --include-privates        <n>     Include private packages when bumping or publishing
  --include-workspaces-root <n>     Include workspaces root when bumping or publishing
  --independent-version     <n>     Ignore workspace version and bump itself
  --update-file-references  <n>     Update file references when bumping
  --cwd                     <n>     Working dir
  --dry                     [n]     Enables dry run
  --log-level               <n>     Log level (default: "info")
  -h, --help                        display help for command
```

### Publish

```txt
Usage: publisher publish [options] [tag]

Publish packages or workspaces packages

Arguments:
  tag                               Tag that will to publish

Options:
  --packages                <n...>  Packages or workspaces to publish
  --registry                <n>     Registry where packages will be published
  --token                   <n>     Token used to authenticate
  --canary                  [n]     Enables canary release
  --include-privates        <n>     Include private packages when bumping or publishing
  --include-workspaces-root <n>     Include workspaces root when bumping or publishing
  --independent-version     <n>     Ignore workspace version and bump itself
  --update-file-references  <n>     Update file references when bumping
  --cwd                     <n>     Working dir
  --dry                     [n]     Enables dry run
  --log-level               <n>     Log level (default: "info")
  -h, --help                        display help for command
```

### Unpublish

```txt
Usage: publisher unpublish [options] [tag]

Unpublish packages or workspaces packages

Arguments:
  tag                               Tag that will to unpublish

Options:
  --packages                <n...>  Packages or workspaces to unpublish
  --registry                <n>     Registry from where packages will be unpublished
  --token                   <n>     Token used to authenticate
  --include-privates        <n>     Include private packages when bumping or publishing
  --include-workspaces-root <n>     Include workspaces root when bumping or publishing
  --independent-version     <n>     Ignore workspace version and bump itself
  --update-file-references  <n>     Update file references when bumping
  --cwd                     <n>     Working dir
  --dry                     [n]     Enables dry run
  --log-level               <n>     Log level (default: "info")
  -h, --help                        display help for command
```


