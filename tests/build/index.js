/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class Enumerable {
    any(predicate) {
        let hasAny = false;
        let sequence = this;
        if (predicate)
            sequence = sequence.where(predicate);
        for (let element of sequence) {
            hasAny = element == element;
            break;
        }
        return hasAny;
    }
    /** Casts the elements of an IEnumerable to the specified type. Note that no type checking is performed at runtime. */
    cast() {
        return this;
    }
    /**
     * Returns the elements of the specified sequence or the specified value in a singleton collection if the sequence is empty.
     * @param value The value to return if the sequence is empty.
     */
    defaultIfEmpty(value) {
        return new DefaultIfEmptyIterator(this, value);
    }
    /**
     * Returns the element at a specified index in a sequence.
     * @param index The zero-based index of the element to retrieve.
     */
    elementAt(index) {
        let element = this.elementAtOrDefault(index);
        if (!element)
            throw new Error('Index is less than 0 or greater than the number of elements in source.');
        return element;
    }
    /**
     * Returns the element at a specified index in a sequence or or undefined|null value if the index is out of range.
     * @param index The zero-based index of the element to retrieve.
     */
    elementAtOrDefault(index) {
        let currentIndex = 0;
        let current = null;
        for (const element of this) {
            current = element;
            if (currentIndex == index)
                break;
            index++;
        }
        return current;
    }
    first(predicate) {
        let element = null;
        element = predicate && this.firstOrDefault(predicate) || this.firstOrDefault();
        if (!element && predicate)
            throw new Error('No element satisfies the condition in predicate.');
        else if (!element)
            throw new Error('The source sequence is empty.');
        return element;
    }
    firstOrDefault(predicate) {
        if (predicate)
            return this.where(predicate).firstOrDefault();
        return this[Symbol.iterator]().next().value;
    }
    /**
     * Performs the specified action on each element of the sequence by incorporating the element's index.
     * @param action The Action2<TSource, number> delegate to perform on each element of the sequence.
     */
    forEach(action) {
        let index = 0;
        for (const element of this) {
            action(element, index);
            index++;
        }
    }
    last(predicate) {
        let element = null;
        element = predicate && this.lastOrDefault(predicate) || this.lastOrDefault();
        if (!element && predicate)
            throw new Error('No element satisfies the condition in predicate.');
        else if (!element)
            throw new Error('The source sequence is empty.');
        return element;
    }
    lastOrDefault(predicate) {
        if (predicate)
            return this.where(predicate).lastOrDefault();
        let current = null;
        for (let element of this)
            current = element;
        return current;
    }
    /**
     * Projects each element of a sequence into a new form by incorporating the element's index.
     * @param selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
     */
    select(selector) {
        return new SelectIterator(this, selector);
    }
    selectMany(collectionSelector, selector) {
        if (!selector)
            selector = x => x;
        return new SelectManyIterator(this, collectionSelector, selector);
    }
    /**
     * Bypasses a specified number of elements in a sequence and then returns the remaining elements.
     * @param count The number of elements to skip before returning the remaining elements.
     */
    skip(count) {
        return new SkipIterator(this, count);
    }
    /**
     * Bypasses elements in a sequence as long as a specified condition is true and then returns the remaining elements.
     * The element's index is used in the logic of the predicate function.
     * @param predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
     */
    skipWhile(predicate) {
        return new SkipWhileIterator(this, predicate);
    }
    /**
     * The sequence to return elements from.
     * @param count The number of elements to return.
     */
    take(count) {
        return new TakeIterator(this, count);
    }
    /**
     * Returns elements from a sequence as long as a specified condition is true. The element's index is used in the logic of the predicate function.
     * @param predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
     */
    takeWhile(predicate) {
        return new TakeWhileIterator(this, predicate);
    }
    /** Creates an array from a Enumerable<T>. */
    toArray() {
        let values = [];
        for (let element of this)
            values.push(element);
        return values;
    }
    /**
     * Filters a sequence of values based on a predicate.
     * @param predicate A function to test each element for a condition.
     */
    where(predicate) {
        return new WhereIterator(this, predicate);
    }
    /**
     * Applies a specified function to the corresponding elements of two sequences, producing a sequence of the results.
     * @param second   The second sequence to merge.
     * @param selector A function that specifies how to merge the elements from the two sequences.
     */
    zip(second, selector) {
        return new ZipIterator(this, second, selector);
    }
    /**
     * Create a enumerable object from a iterable source
     * @param source Source used to create the iterable object
     */
    static from(source) {
        return new EnumerableIterator(source);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Enumerable;

class EnumerableIterator extends Enumerable {
    constructor(source) {
        super();
        this[Symbol.iterator] = function* () {
            for (const element of source) {
                yield element;
            }
        };
    }
}
class WhereIterator extends Enumerable {
    constructor(source, predicate) {
        super();
        this[Symbol.iterator] = function* () {
            for (const element of source) {
                if (predicate(element))
                    yield element;
            }
        };
    }
}
class DefaultIfEmptyIterator extends Enumerable {
    constructor(source, defaultValue) {
        super();
        this[Symbol.iterator] = function* () {
            let index = 0;
            for (const element of source) {
                index++;
                yield element;
            }
            if (index == 0)
                yield defaultValue;
        };
    }
}
class SelectIterator extends Enumerable {
    constructor(source, selector) {
        super();
        this[Symbol.iterator] = function* () {
            let index = 0;
            for (const element of source)
                yield selector(element, index++);
        };
    }
}
class SelectManyIterator extends Enumerable {
    constructor(source, iterableSelector, selector) {
        super();
        this[Symbol.iterator] = function* () {
            let index = 0;
            for (const element of source) {
                for (const iteration of iterableSelector(element)) {
                    yield selector(iteration, index);
                    index++;
                }
            }
        };
    }
}
class SkipIterator extends Enumerable {
    constructor(source, count) {
        super();
        let index = 1;
        this[Symbol.iterator] = function* () {
            for (const element of source) {
                if (index > count)
                    yield element;
                index++;
            }
        };
    }
}
class SkipWhileIterator extends Enumerable {
    constructor(source, predicate) {
        super();
        let index = 0;
        let skip = true;
        this[Symbol.iterator] = function* () {
            for (const element of source) {
                if (skip)
                    skip = predicate(element, index);
                if (!skip)
                    yield element;
                index++;
            }
        };
    }
}
class TakeIterator extends Enumerable {
    constructor(source, count) {
        super();
        let index = 0;
        this[Symbol.iterator] = function* () {
            for (const element of source) {
                if (index < count)
                    yield element;
                else
                    break;
                index++;
            }
        };
    }
}
class TakeWhileIterator extends Enumerable {
    constructor(source, predicate) {
        super();
        let index = 0;
        this[Symbol.iterator] = function* () {
            for (const element of source) {
                if (predicate(element, index))
                    yield element;
                else
                    break;
                index++;
            }
        };
    }
}
class ZipIterator extends Enumerable {
    constructor(source, collection, selector) {
        super();
        this[Symbol.iterator] = function* () {
            let index = 0;
            for (const element of source) {
                yield selector(element, collection[index], index);
                index++;
            }
        };
    }
}


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__surface_enumerable_extensions__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__surface_enumerable__ = __webpack_require__(0);


class Dictionary extends __WEBPACK_IMPORTED_MODULE_1__surface_enumerable__["a" /* Enumerable */] {
    constructor(source) {
        super();
        let keysValues = [];
        if (source) {
            if (Array.isArray(source))
                keysValues = source;
            else
                keysValues = Object.keys(source).asEnumerable().select(x => new KeyValuePair(x, source[x])).toArray();
        }
        this._source = new Map();
        keysValues.forEach(x => this._source.set(x.key, x.value));
        this[Symbol.iterator] = function* getIterable() {
            for (const element of this._source) {
                let [key, value] = element;
                yield new KeyValuePair(key, value);
            }
        }
            .bind(this);
    }
    get size() {
        return this._source.size;
    }
    delete(key) {
        this._source.delete(key);
    }
    has(key) {
        return this._source.has(key);
    }
    get(key) {
        return this._source.get(key);
    }
    set(key, value) {
        this._source.set(key, value);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Dictionary;

class KeyValuePair {
    constructor(key, value) {
        if (key)
            this._key = key;
        if (value)
            this._value = value;
    }
    get key() {
        return this._key;
    }
    set key(value) {
        this._key = value;
    }
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
    }
}
/* harmony export (immutable) */ __webpack_exports__["b"] = KeyValuePair;



/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__surface_enumerable__ = __webpack_require__(0);

class List extends __WEBPACK_IMPORTED_MODULE_0__surface_enumerable__["a" /* Enumerable */] {
    constructor(source) {
        super();
        if (source && Array.isArray(source))
            this.source = source;
        else if (source instanceof __WEBPACK_IMPORTED_MODULE_0__surface_enumerable__["a" /* Enumerable */])
            this.source = source.toArray();
        else
            this.source = [];
        let self = this;
        this[Symbol.iterator] = function* () {
            for (const item of self.source)
                yield item;
        };
    }
    /** Returns Length of the list. */
    get length() {
        return this.source.length;
    }
    /**
     * Adds provided item to the list.
     * @param item Item to insert.
     */
    add(item) {
        this.source.push(item);
    }
    addAt(itemOrItems, index) {
        let left = this.source.splice(index + 1);
        if (Array.isArray(itemOrItems)) {
            let items = itemOrItems;
            this.source = this.source.concat(items).concat(left);
        }
        else if (itemOrItems instanceof List) {
            let items = Array.from(itemOrItems);
            this.source = this.source.concat(items).concat(left);
        }
        else {
            let item = itemOrItems;
            this.source = this.source.concat([item]).concat(left);
        }
    }
    remove(indexOritem, count) {
        let index = 0;
        let item = null;
        if (typeof indexOritem == "number") {
            index = indexOritem;
            this.source.splice(index, count || 1);
        }
        else {
            item = indexOritem;
            index = this.source.findIndex(x => Object.is(x, item));
            this.source.splice(index, 1);
        }
    }
    /**
     * Returns the item at the specified index.
     * @param index Position of the item.
     */
    item(index) {
        return this.source[index];
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = List;



/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_collection__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_router__ = __webpack_require__(7);


__WEBPACK_IMPORTED_MODULE_0_collection__["a" /* execute */]();
__WEBPACK_IMPORTED_MODULE_1_router__["a" /* execute */]();


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = execute;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__surface_collection__ = __webpack_require__(5);

function execute() {
    let dictionary = new __WEBPACK_IMPORTED_MODULE_0__surface_collection__["a" /* Dictionary */]({ foo: 1, bar: 2 });
    dictionary.forEach(x => console.log(x.key));
}


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__surface_collection_dictionary__ = __webpack_require__(1);
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__surface_collection_dictionary__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__surface_collection_list__ = __webpack_require__(2);
/* unused harmony namespace reexport */




/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__surface_enumerable__ = __webpack_require__(0);

Array.prototype.asEnumerable = function () {
    return __WEBPACK_IMPORTED_MODULE_0__surface_enumerable__["a" /* Enumerable */].from(this);
};


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = execute;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__surface_router__ = __webpack_require__(8);

function execute() {
    let routes = [
        '/{controller}/{action}/{id?}',
        '/{controller}/{language}-{country}/{action}/{id?}',
        '/{controller=home}/{action=index}/{id?}',
        '/adm/{controller=home}/{action=index}/{id?}',
    ];
    let router = __WEBPACK_IMPORTED_MODULE_0__surface_router__["a" /* Router */].create(__WEBPACK_IMPORTED_MODULE_0__surface_router__["b" /* RoutingType */].Abstract, routes);
    console.log('case 1: ', router.match('/home'));
    console.log('case 2: ', router.match('/home/about'));
    console.log('case 2: ', router.match('/home/en-us/about/1'));
    console.log('case 3: ', router.match('/home/about/2'));
    console.log('case 4: ', router.match('/adm/home/about/1'));
}


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return RoutingType; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__surface_collection_extensions__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__surface_router_route__ = __webpack_require__(10);


var RoutingType;
(function (RoutingType) {
    RoutingType[RoutingType["Abstract"] = 0] = "Abstract";
    RoutingType[RoutingType["Hash"] = 1] = "Hash";
    RoutingType[RoutingType["History"] = 2] = "History";
})(RoutingType || (RoutingType = {}));
class Router {
    constructor(routes) {
        this._routes = routes;
    }
    static create(routingType, routes) {
        let route = routes.asEnumerable().select(x => new __WEBPACK_IMPORTED_MODULE_1__surface_router_route__["a" /* Route */](x)).toList();
        switch (routingType) {
            case RoutingType.Abstract:
                return new AbstractRouter(route);
            case RoutingType.Hash:
                return new HashRouter(route);
            case RoutingType.History:
                return new HistoryRouter(route);
        }
    }
    match(path) {
        return this._routes.select(x => x.match(path)).firstOrDefault(x => !!x);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Router;

class AbstractRouter extends Router {
    constructor(routes) {
        super(routes);
    }
    routeTo(path) {
        throw new Error("Method not implemented.");
    }
    when(route, action) {
        throw new Error("Method not implemented.");
    }
}
class HashRouter extends Router {
    constructor(routes) {
        super(routes);
    }
    routeTo(path) {
        throw new Error("Method not implemented.");
    }
    when(route, action) {
        throw new Error("Method not implemented.");
    }
}
class HistoryRouter extends Router {
    constructor(routes) {
        super(routes);
        let self = this;
        window.onpopstate = function (event) {
            self.routeTo(this.location.pathname);
        };
    }
    routeTo(path) {
        /*
        window.history.pushState(null, "", path);
        let route = this.routes[path];

        if (route)
            route(this.parsePath(path));
        else if (this.routes['/*'])
            this.routes['/*'](this.parsePath(path));
        */
    }
    when(route, action) {
        //this.routes[route] = action;
        return this;
    }
}


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__surface_collection_dictionary__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__surface_collection_list__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__surface_enumerable__ = __webpack_require__(0);



Array.prototype.toList = function () {
    return new __WEBPACK_IMPORTED_MODULE_1__surface_collection_list__["a" /* List */](this);
};
__WEBPACK_IMPORTED_MODULE_2__surface_enumerable__["a" /* Enumerable */].prototype.toList = function () {
    return new __WEBPACK_IMPORTED_MODULE_1__surface_collection_list__["a" /* List */](this);
};
__WEBPACK_IMPORTED_MODULE_2__surface_enumerable__["a" /* Enumerable */].prototype.toDictionary = function (keySelector, valueSelector) {
    return new __WEBPACK_IMPORTED_MODULE_0__surface_collection_dictionary__["a" /* Dictionary */](this.select(x => new __WEBPACK_IMPORTED_MODULE_0__surface_collection_dictionary__["b" /* KeyValuePair */](keySelector(x), valueSelector(x))).toArray());
};


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//import { ObjectLiteral } from '@surface/types';
class Route {
    get expression() {
        return this._expression;
    }
    get isDefault() {
        return this._isDefault;
    }
    get pattern() {
        return this._pattern;
    }
    constructor(pattern, isDefault) {
        this._pattern = pattern;
        this._expression = this.toExpression(pattern);
    }
    match(route) {
        let [path, search] = route.split('?');
        let params = {};
        if (this._expression.test(route)) {
            let keys = this._expression.exec(this._pattern);
            this._expression.lastIndex = 0;
            let values = this._expression.exec(path);
            if (keys && values) {
                Array.from(keys).asEnumerable()
                    .zip(Array.from(values), (key, value) => ({ key, value }))
                    .skip(1)
                    .forEach(x => {
                    let match = /{\s*([^=?]+)\??(?:=([^}]*))?\s*}/.exec(x.key);
                    if (match) {
                        params[match[1]] = x.value || match[2];
                    }
                });
            }
            return { match: this.pattern, route, params, search };
        }
        return null;
    }
    toExpression(pattern) {
        let expression = pattern.replace(/^\/|\/$/g, '').split('/').asEnumerable()
            .select(x => x.replace(/{\s*([^}\s\?=]+)\s*}/g, '([^\\\/]+)').replace(/{\s*([^}=?\s]+)\s*=\s*([^}=?\s]+)\s*}|{\s*([^} ?]+\?)?\s*}|(\s*\*\s*)/, '([^\\\/]*)'))
            .toArray()
            .join('\\\/');
        expression = expression.replace(/(\(\[\^\\\/\]\*\))(\\\/)/g, '$1\\\/?');
        return new RegExp(`^\/?${expression}\/?$`);
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Route;



/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map