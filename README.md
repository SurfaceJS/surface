![Build and Testing](https://github.com/SurfaceJS/surface/workflows/Build%20and%20Testing/badge.svg?branch=master)
![nycrc config on GitHub](https://img.shields.io/nycrc/SurfaceJS/modules?config=.nycrc.json)

## Introduction
Surface is an open source fully ESM project that aims to assist web development by providing several client ~~and server~~ tools.

## Installation and setup

Install the cli
```
    npm i -g @surface/cli
```

Create a new workspace
```
    surface new

    ? Choose a template: (Use arrow keys)
    > Simple Hello World application
    Simple Hello World application using router
    PWA Todo application
    SPA Todo application
```

## Getting Started
* [Custom elements](packages/%40surface/custom-element/readme.md#getting-started)
* [Working with router](packages/%40surface/web-router/readme.md) 

## Ecosystem

| Package                                                                                                                     | Version   | Description                                                                |
| --------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------- |
| [Builder](packages/%40surface/builder/readme.md)                           | ~~1.0.0~~ | Manage the compilation of typescript, scss/sass and bundling with webpack. |
| [Cli](packages/%40surface/cli/readme.md)                                   | ~~1.0.0~~ | Command line interface for scaffolding surface projects.                   |
| [Custom Element](packages/%40surface/custom-element/readme.md)             | ~~1.0.0~~ | Provides support of directives and data binding on custom elements.        |
| [Dependency Injection](packages/%40surface/dependency-injection/readme.md) | ~~1.0.0~~ | Dependency injection library.                                              |
| [Enumerable](packages/%40surface/enumerable/readme.md)                     | ~~1.0.0~~ | Provides many methods to iterate through of collections.                   |
| [Web Router](packages/%40surface/web-router/readme.md)                     | ~~1.0.0~~ | Single Page Application Router with dependecy injection capability.        |