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

- [Getting started](https://github.com/SurfaceJS/surface/blob/master/packages/%40surface/custom-element/readme.md#getting-started)

## Ecosystem

| Package                                                                                                                     | Version   | Description                                                                |
| --------------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------- |
| [Builder](https://github.com/SurfaceJS/surface/blob/master/packages/%40surface/builder/readme.md)                           | ~~1.0.0~~ | Manage the compilation of typescript, scss/sass and bundling with webpack. |
| [Cli](https://github.com/SurfaceJS/surface/blob/master/packages/%40surface/cli/readme.md)                                   | ~~1.0.0~~ | Command line interface for scaffolding surface projects.                   |
| [Custom Element](https://github.com/SurfaceJS/surface/blob/master/packages/%40surface/custom-element/readme.md)             | ~~1.0.0~~ | Provides support of directives and data binding on custom elements.        |
| [Dependency Injection](https://github.com/SurfaceJS/surface/blob/master/packages/%40surface/dependency-injection/readme.md) | ~~1.0.0~~ | Dependency injection library.                                              |
| [Enumerable](https://github.com/SurfaceJS/surface/blob/master/packages/%40surface/enumerable/readme.md)                     | ~~1.0.0~~ | Provides many methods to iterate through of collections.                   |
| [Web Router](https://github.com/SurfaceJS/surface/blob/master/packages/%40surface/web-router/readme.md)                     | ~~1.0.0~~ | Single Page Application Router with dependecy injection capability.        |