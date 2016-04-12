# versionlib

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Travis CI Build][travis-image]][travis-url]
[![Test Coverage][coveralls-image]][coveralls-url]
[![Code Climate][codeclimate-image]][codeclimate-url]
[![Deps][david-image]][david-url]
[![Dev Deps][david-dev-image]][david-dev-url]

A library of version number functions.

## Features

* Version parsing
* Version comparison
* Sorting (ascending and descending)
* Delta comparison
* Configurable LRU cache
* Written in ES2015
* Support for Node.js 4 and newer

## Installation

    npm install versionlib

## Usage

```javascript
import Version, * as version from 'versionlib';
// or require('versionlib');
```

## License

(The MIT License)

Copyright (c) 2016 Chris Barber

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

[npm-image]: https://img.shields.io/npm/v/versionlib.svg
[npm-url]: https://npmjs.org/package/versionlib
[downloads-image]: https://img.shields.io/npm/dm/versionlib.svg
[downloads-url]: https://npmjs.org/package/versionlib
[travis-image]: https://img.shields.io/travis/cb1kenobi/versionlib.svg
[travis-url]: https://travis-ci.org/cb1kenobi/versionlib
[coveralls-image]: https://img.shields.io/coveralls/cb1kenobi/versionlib/master.svg
[coveralls-url]: https://coveralls.io/r/cb1kenobi/versionlib
[codeclimate-image]: https://img.shields.io/codeclimate/github/cb1kenobi/versionlib.svg
[codeclimate-url]: https://codeclimate.com/github/cb1kenobi/versionlib
[david-image]: https://img.shields.io/david/cb1kenobi/versionlib.svg
[david-url]: https://david-dm.org/cb1kenobi/versionlib
[david-dev-image]: https://img.shields.io/david/dev/cb1kenobi/versionlib.svg
[david-dev-url]: https://david-dm.org/cb1kenobi/versionlib#info=devDependencies
