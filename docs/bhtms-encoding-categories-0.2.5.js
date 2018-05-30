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
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/javascript-data-store/src/jsds.js":
/*!********************************************************!*\
  !*** ./node_modules/javascript-data-store/src/jsds.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/*\n * Copyright (c) 2010 Matthew A. Taylor\n *\n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n *\n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n *\n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\nvar REGEX_DOT_G = /\\./g,\n    BSLASH_DOT = '\\.',\n    REGEX_STAR_G = /\\*/g,\n    ID_LENGTH = 16,\n\n// static export\nJSDS,\n\n// private props\nrandoms = [],\n\n// private functions\nstoreIt,\n    update,\n    mergeArraysIntoSet,\n    arrayContains,\n    arrayRemoveItem,\n    fire,\n    listenerApplies,\n    removeListener,\n    getCompleteKey,\n    pullOutKeys,\n    toRegex,\n    valueMatchesKeyString,\n    clone,\n    getValue,\n    getRandomId,\n    generateRandomId;\n\n/*************************/\n/* The JSDataStore Class */\n/*************************/\n\nfunction JSDataStore(id) {\n    // data stores\n    this._s = {};\n    // event listeners\n    this._l = {};\n    this.id = id;\n}\n\nJSDataStore.prototype = {\n\n    /**\n     * Stores data\n     *\n     * key {String}: the key to be used to store the data. The same key can be used to retrieve\n     *               the data\n     * val {Object}: Any value to be stored in the store\n     * opts {Object} (optional): options to be used when storing data:\n     *                          'update': if true, values already existing within objects and\n     *                                    arrays will not be clobbered\n     * returns {Object}: The last value stored within specified key or undefined\n     *\n     * (fires 'store' event)\n     */\n    set: function (key, val, opts /*optional*/) {\n        var result;\n        opts = opts || { update: false };\n        fire.call(this, 'set', {\n            key: key,\n            value: val,\n            id: this.id,\n            when: 'before',\n            args: Array.prototype.slice.call(arguments, 0, arguments.length)\n        });\n        result = storeIt(this._s, key, opts, val);\n        fire.call(this, 'set', {\n            key: key,\n            value: val,\n            id: this.id,\n            when: 'after',\n            result: this.get(key, { quiet: true })\n        });\n        return result;\n    },\n\n    /**\n     * Gets data back out of store\n     *\n     * key {String}: the key of the data you want back\n     * returns {Object}: the data or undefined if key doesn't exist\n     *\n     * (fires 'get' event)\n     */\n    get: function (key) {\n        var s = this._s,\n            keys,\n            i = 0,\n            j = 0,\n            opts,\n            result,\n            splitKeys,\n            args = Array.prototype.slice.call(arguments, 0, arguments.length);\n\n        opts = args[args.length - 1];\n        if (typeof opts === 'string') {\n            opts = {};\n        } else {\n            args.pop();\n        }\n\n        if (!opts.quiet) {\n            fire.call(this, 'get', {\n                key: key,\n                when: 'before',\n                args: args\n            });\n        }\n\n        if (args.length === 1 && key.indexOf(BSLASH_DOT) < 0) {\n            result = s[key];\n        } else {\n            if (args.length > 1) {\n                keys = [];\n                for (i = 0; i < args.length; i++) {\n                    if (args[i].indexOf(BSLASH_DOT) > -1) {\n                        splitKeys = args[i].split(BSLASH_DOT);\n                        for (j = 0; j < splitKeys.length; j++) {\n                            keys.push(splitKeys[j]);\n                        }\n                    } else {\n                        keys.push(args[i]);\n                    }\n                }\n            } else if (key.indexOf(BSLASH_DOT) > -1) {\n                keys = key.split(BSLASH_DOT);\n            }\n\n            result = getValue(s, keys);\n        }\n\n        if (!opts.quiet) {\n            fire.call(this, 'get', {\n                key: key,\n                value: result,\n                when: 'after',\n                result: result\n            });\n        }\n        return result;\n    },\n\n    /**\n     * Adds a listener to this store. The listener will be executed when an event of\n     * the specified type is emitted and all the conditions defined in the parameters\n     * are met.\n     *\n     * type {String}: the type of event to listen for ('store', 'get', 'clear', etc.)\n     * options {object}: an object that contains one or more of the following configurations:\n     *                  'callback': the function to be executed\n     *                  'scope': the scope object for the callback execution\n     *                  'key': the storage key to listen for. If specified only stores into this key will\n     *                          cause callback to be executed\n     *                  'when': 'before' or 'after' (default is 'after')\n     */\n    on: function (type, opts) {\n        var me = this,\n            cbid = getRandomId(),\n            key = opts.key,\n            fn = opts.callback,\n            scope = opts.scope || this,\n            when = opts.when || 'after';\n        if (!this._l[type]) {\n            this._l[type] = [];\n        }\n        this._l[type].push({ id: cbid, callback: fn, scope: scope, key: key, when: when });\n        return {\n            id: cbid,\n            remove: function () {\n                removeListener(me._l[type], cbid);\n            }\n        };\n    },\n\n    before: function (type, key, cb, scpe) {\n        var callback = cb,\n            scope = scpe;\n        // key is optional\n        if (typeof key === 'function') {\n            callback = key;\n            scope = cb;\n            key = undefined;\n        }\n        return this.on(type, {\n            callback: callback,\n            key: key,\n            when: 'before',\n            scope: scope\n        });\n    },\n\n    after: function (type, key, cb, scpe) {\n        var callback = cb,\n            scope = scpe;\n        // key is optional\n        if (typeof key === 'function') {\n            callback = key;\n            scope = cb;\n            key = undefined;\n        }\n        return this.on(type, {\n            callback: callback,\n            key: key,\n            when: 'after',\n            scope: scope\n        });\n    },\n\n    /**\n     * Removes all data from store\n     *\n     * (fires 'clear' event)\n     */\n    clear: function () {\n        this._s = {};\n        fire.call(this, 'clear');\n    },\n\n    /**\n     * Removes all internal references to this data store. Note that to entirely release\n     * store object for garbage collection, you must also set any local references to the\n     * store to null!\n     *\n     * (fires 'remove' and 'clear' events)\n     */\n    remove: function () {\n        var ltype, optsArray, opts, i;\n        this.clear();\n        delete JSDS._stores[this.id];\n        arrayRemoveItem(randoms, this.id);\n        fire.call(this, 'remove');\n    }\n};\n\n/*************************/\n/* Global JSDS namespace */\n/*************************/\n\nJSDS = {\n\n    _stores: {},\n\n    /**\n     * Create a new data store object. If no id is specified, a random id will be\n     * generated.\n     *\n     * id {String} (optional): to identify this store for events and later retrieval\n     */\n    create: function (id) {\n\n        id = id || getRandomId();\n\n        if (this._stores[id]) {\n            throw new Error('Cannot overwrite existing data store \"' + id + '\"!');\n        }\n\n        this._stores[id] = new JSDataStore(id);\n\n        return this._stores[id];\n    },\n\n    /**\n     * Retrieves an existing data store object by id\n     *\n     * id {String}: the id of the store to retrieve\n     * returns {JSDataStore} the data store\n     */\n    get: function (id) {\n        return this._stores[id];\n    },\n\n    /**\n     * Removes all data stores objects. Specifically, each JSDataStore object's remove()\n     * method is called, and all local references to each are deleted.\n     */\n    clear: function () {\n        var storeId;\n        for (storeId in this._stores) {\n            if (this._stores.hasOwnProperty(storeId)) {\n                this._stores[storeId].remove();\n                delete this._stores[storeId];\n            }\n        }\n        this._stores = {};\n    },\n\n    /**\n     * Returns a count of the existing data stores in memory\n     */\n    count: function () {\n        var cnt = 0,\n            p;\n        for (p in this._stores) {\n            if (this._stores.hasOwnProperty(p)) {\n                cnt++;\n            }\n        }\n        return cnt;\n    },\n\n    /**\n     * Returns a list of ids [String] for all data store obects in memory\n     */\n    ids: function () {\n        var id,\n            ids = [];\n        for (id in this._stores) {\n            if (this._stores.hasOwnProperty(id)) {\n                ids.push(id);\n            }\n        }\n        return ids;\n    }\n};\n\n/*****************/\n/* PRIVATE STUFF */\n/*****************/\n\n// recursive store function\nstoreIt = function (store, key, opts, val, oldVal /*optional*/) {\n    var result, keys, oldKey;\n    if (key.indexOf(BSLASH_DOT) >= 0) {\n        keys = key.split('.');\n        oldVal = store[keys[0]] ? clone(store[keys[0]]) : undefined;\n        oldKey = keys.shift();\n        if (store[oldKey] === undefined) {\n            store[oldKey] = {};\n        }\n        return storeIt(store[oldKey], keys.join('.'), opts, val, oldVal);\n    }\n    result = oldVal ? oldVal[key] : store[key];\n    // if this is an update, and there is an old value to update\n    if (opts.update) {\n        update(store, val, key);\n    }\n    // if not an update, just overwrite the old value\n    else {\n            store[key] = val;\n        }\n    return result;\n};\n\n// recursive update function used to overwrite values within the store without\n// clobbering properties of objects\nupdate = function (store, val, key) {\n    var vprop;\n    if (typeof val !== 'object' || val instanceof Array) {\n        if (store[key] && val instanceof Array) {\n            mergeArraysIntoSet(store[key], val);\n        } else {\n            store[key] = val;\n        }\n    } else {\n        for (vprop in val) {\n            if (val.hasOwnProperty(vprop)) {\n                if (!store[key]) {\n                    store[key] = {};\n                }\n                if (store[key].hasOwnProperty(vprop)) {\n                    update(store[key], val[vprop], vprop);\n                } else {\n                    store[key][vprop] = val[vprop];\n                }\n            }\n        }\n    }\n};\n\n// merge two arrays without duplicate values\nmergeArraysIntoSet = function (lhs, rhs) {\n    var i = 0;\n    for (; i < rhs.length; i++) {\n        if (!arrayContains(lhs, rhs[i])) {\n            lhs.push(rhs[i]);\n        }\n    }\n};\n\n// internal utility function\narrayContains = function (arr, val, comparator /* optional */) {\n    var i = 0;\n    comparator = comparator || function (lhs, rhs) {\n        return lhs === rhs;\n    };\n    for (; i < arr.length; i++) {\n        if (comparator(arr[i], val)) {\n            return true;\n        }\n    }\n    return false;\n};\n\narrayRemoveItem = function (arr, item) {\n    var i, needle;\n    for (i = 0; i < arr.length; i++) {\n        if (arr[i] === item) {\n            needle = i;\n            break;\n        }\n    }\n    if (needle) {\n        arr.splice(needle, 1);\n    }\n};\n\n// fire an event of 'type' with included arguments to be passed to listeners functions\n// WARNING: this function must be invoked as fire.call(scope, type, args) because it uses 'this'.\n// The reason is so this function is not publicly exposed on JSDS instances\nfire = function (type, fireOptions) {\n    var i,\n        opts,\n        scope,\n        listeners,\n        pulledKeys,\n        listeners = this._l[type] || [];\n\n    fireOptions = fireOptions || {};\n\n    if (listeners.length) {\n        for (i = 0; i < listeners.length; i++) {\n            opts = listeners[i];\n            if (listenerApplies.call(this, opts, fireOptions)) {\n                scope = opts.scope || this;\n                if (opts.key && fireOptions) {\n                    if (opts.key.indexOf('*') >= 0) {\n                        pulledKeys = pullOutKeys(fireOptions.value);\n                        fireOptions.value = {};\n                        fireOptions.value.key = fireOptions.key + pulledKeys;\n                        fireOptions.value.value = getValue(this._s, fireOptions.value.key.split('.'));\n                    } else {\n                        fireOptions.value = getValue(this._s, opts.key.split('.'));\n                    }\n                }\n                if (fireOptions.args) {\n                    opts.callback.apply(scope, fireOptions.args);\n                } else if (fireOptions.result) {\n                    opts.callback.call(scope, fireOptions.result);\n                } else {\n                    opts.callback.call(scope, fireOptions.result);\n                }\n            }\n        }\n    }\n};\n\n// WARNING: this function must be invoked as listenerApplies.call(scope, listener, crit) because it uses 'this'.\n// The reason is so this function is not publicly exposed on JSDS instances\nlistenerApplies = function (listener, crit) {\n    var result = false,\n        last,\n        sub,\n        k,\n        replacedKey,\n        breakout = false;\n    if (listener.when && crit.when) {\n        if (listener.when !== crit.when) {\n            return false;\n        }\n    }\n    if (!listener.key || !crit) {\n        return true;\n    }\n    if (!crit.key || crit.key.match(toRegex(listener.key))) {\n        return true;\n    }\n    last = crit.key.length;\n    while (!breakout) {\n        sub = crit.key.substr(0, last);\n        last = sub.lastIndexOf(BSLASH_DOT);\n        if (last < 0) {\n            k = sub;\n            breakout = true;\n        } else {\n            k = sub.substr(0, last);\n        }\n        if (listener.key.indexOf('*') === 0) {\n            return valueMatchesKeyString(crit.value, listener.key.replace(/\\*/, crit.key).substr(crit.key.length + 1));\n        } else if (listener.key.indexOf('*') > 0) {\n            replacedKey = getCompleteKey(crit);\n            return toRegex(replacedKey).match(listener.key);\n        }\n        return valueMatchesKeyString(crit.value, listener.key.substr(crit.key.length + 1));\n    }\n    return result;\n};\n\nremoveListener = function (listeners, id) {\n    var i, l, needle;\n    for (i = 0; i < listeners.length; i++) {\n        l = listeners[i];\n        if (l.id && l.id === id) {\n            needle = i;\n            break;\n        }\n    }\n    if (typeof needle !== 'undefined') {\n        listeners.splice(needle, 1);\n    }\n};\n\ngetCompleteKey = function (o) {\n    var val = o.value,\n        key = o.key;\n    return key + pullOutKeys(val);\n};\n\npullOutKeys = function (v) {\n    var p,\n        res = '';\n    for (p in v) {\n        if (v.hasOwnProperty(p)) {\n            res += '.' + p;\n            if (typeof v[p] === 'object' && !(v[p] instanceof Array)) {\n                res += pullOutKeys(v[p]);\n            }\n        }\n    }\n    return res;\n};\n\ntoRegex = function (s) {\n    return s.replace(REGEX_DOT_G, '\\\\.').replace(REGEX_STAR_G, '\\.*');\n};\n\nvalueMatchesKeyString = function (val, key) {\n    var p,\n        i = 0,\n        keys = key.split('.');\n    for (p in val) {\n        if (val.hasOwnProperty(p)) {\n            if (keys[i] === '*' || p === keys[i]) {\n                if (typeof val[p] === 'object' && !(val[p] instanceof Array)) {\n                    return valueMatchesKeyString(val[p], keys.slice(i + 1).join('.'));\n                } else {\n                    return true;\n                }\n            }\n        }\n        i++;\n    }\n    return false;\n};\n\n// used to copy branches within the store. Object and array friendly\nclone = function (val) {\n    var newObj, i, prop;\n    if (val instanceof Array) {\n        newObj = [];\n        for (i = 0; i < val.length; i++) {\n            newObj[i] = clone(val[i]);\n        }\n    } else if (typeof val === 'object') {\n        newObj = {};\n        for (prop in val) {\n            if (val.hasOwnProperty(prop)) {\n                newObj[prop] = clone(val[prop]);\n            }\n        }\n    } else {\n        return val;\n    }\n    return newObj;\n};\n\n// returns a value from a store given an array of keys that is meant to describe depth\n// within the storage tree\ngetValue = function (store, keys) {\n    var key = keys.shift(),\n        endKey,\n        arrResult,\n        p,\n        keysClone;\n    if (key === '*') {\n        arrResult = [];\n        for (p in store) {\n            if (store.hasOwnProperty(p)) {\n                keysClone = clone(keys);\n                arrResult.push(getValue(store[p], keysClone));\n            }\n        }\n        return arrResult;\n    }\n    if (keys[0] && store[key] && (store[key][keys[0]] || keys[0] === '*')) {\n        return getValue(store[key], keys);\n    } else {\n        if (keys.length) {\n            endKey = keys[0];\n        } else {\n            endKey = key;\n        }\n        return store[endKey];\n    }\n};\n\ngenerateRandomId = function (length) {\n    var text = \"\",\n        i,\n        possible = \"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz\";\n    for (i = 0; i < length; i++) {\n        text += possible.charAt(Math.floor(Math.random() * possible.length));\n    }\n    return text;\n};\n\ngetRandomId = function () {\n    var id = generateRandomId(ID_LENGTH);\n    // no duplicate ids allowed\n    while (arrayContains(randoms, id)) {\n        id = generateRandomId(ID_LENGTH);\n    }\n    randoms.push(id);\n    return id;\n};\n\nmodule.exports = JSDS;\n\n//# sourceURL=webpack:///./node_modules/javascript-data-store/src/jsds.js?");

/***/ }),

/***/ "./src/widgets/encoding-categories/cyclicCategoryEncoder.js":
/*!******************************************************************!*\
  !*** ./src/widgets/encoding-categories/cyclicCategoryEncoder.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("let JSDS = __webpack_require__(/*! JSDS */ \"./node_modules/javascript-data-store/src/jsds.js\");\nlet utils = __webpack_require__(/*! ../utils */ \"./src/widgets/utils.js\");\nlet html = __webpack_require__(/*! ./cyclicCategoryEncoder.tmpl.html */ \"./src/widgets/encoding-categories/cyclicCategoryEncoder.tmpl.html\");\n\nlet colors = {\n    track: '#CCC',\n    bitOff: 'white',\n    bitOn: 'orange',\n    bitStroke: 'black'\n};\n\nmodule.exports = (elementId, bounded = false) => {\n\n    utils.loadHtml(html.default, elementId, () => {\n        let $d3El = d3.select('#' + elementId),\n            $jqEl = $('#' + elementId),\n            $svg = $d3El.select('svg');\n\n        let jsds = JSDS.create('cyclic-category-encoder-' + elementId);\n\n        let size = 300,\n            minValue = 0,\n            maxValue = 6,\n            bits = 12,\n            value = 2,\n            range = 3,\n            radius = size / 2 * 3 / 4;\n\n        let $minDisplay = $jqEl.find('.min-display'),\n            $valueDisplay = $jqEl.find('.value-display'),\n            $maxDisplay = $jqEl.find('.max-display'),\n            $rangeDisplay = $jqEl.find('.range-display'),\n            $nameLabel = $jqEl.find('.name-label'),\n            $minLabel = $jqEl.find('.min-label'),\n            $valueLabel = $jqEl.find('.value-label'),\n            $maxLabel = $jqEl.find('.max-label'),\n            $rangeLabel = $jqEl.find('.range-label');\n\n        let domainRange = d3.range(minValue, maxValue);\n        let encodingRange = d3.range(0, bits);\n\n        let scale = d3.scaleLinear().domain([minValue, maxValue]).range([0, bits]);\n\n        function setupDom() {\n            let half = size / 2;\n            $svg.attr('width', size).attr('height', size);\n            $svg.select('circle.track').attr('cx', half).attr('cy', half).attr('r', radius).attr('fill', 'none').attr('stroke', colors.track);\n\n            $nameLabel.attr('x', half).attr('y', size * 1 / 3);\n            $minLabel.attr('x', size * 1 / 3).attr('y', half + 20);\n            $valueLabel.attr('x', half).attr('y', half + 20);\n            $maxLabel.attr('x', size * 2 / 3).attr('y', half + 20);\n            $rangeLabel.attr('x', half).attr('y', size * 2 / 3 + 20);\n\n            $valueDisplay.attr('x', half).attr('y', half);\n            $valueLabel.attr('x', half).attr('y', half);\n            $minDisplay.attr('x', half / 2).attr('y', half).html(minValue);\n            $maxDisplay.attr('x', size * 3 / 4).attr('y', half).html(maxValue);\n\n            $rangeDisplay.attr('x', half).attr('y', size * 2 / 3).html(range + '/' + bits);\n        }\n\n        function updateValues(value) {\n            $valueDisplay.html(value);\n        }\n\n        function treatCircleBits(circles) {\n            circles.attr('cx', d => d.cx).attr('cy', d => d.cy).attr('r', radius / 8).attr('fill', d => {\n                if (d.bit) return colors.bitOn;else return colors.bitOff;\n            }).attr('stroke', colors.bitStroke).attr('stroke-width', 3);\n        }\n\n        function updateCircles(encoding) {\n            let bucketSpread = 2 * Math.PI / bits;\n            let center = { x: size / 2, y: size / 2 };\n            let data = encoding.map((bit, i) => {\n                let theta = i * bucketSpread;\n                return {\n                    bit: bit,\n                    cx: center.x + radius * Math.sin(theta),\n                    cy: center.y + radius * Math.cos(theta)\n                };\n            });\n            let $group = $svg.selectAll('g.bits');\n            let circles = $group.selectAll('circle').data(data);\n            treatCircleBits(circles);\n\n            let newCircles = circles.enter().append('circle');\n            treatCircleBits(newCircles);\n\n            circles.exit().remove();\n        }\n\n        function updateDisplay() {\n            let value = jsds.get('value');\n            let encoding = encode(value);\n            updateValues(value);\n            updateCircles(encoding);\n        }\n\n        function encode(value) {\n            let out = [];\n            d3.range(0, bits).forEach(() => {\n                out.push(0);\n            });\n            let index = scale(value);\n            out[index] = 1;\n            for (let i = 0; i < range; i++) {\n                let rangeIndex = index + i;\n                if (rangeIndex > out.length) {\n                    rangeIndex -= out.length;\n                }\n                out[rangeIndex] = 1;\n            }\n            return out;\n        }\n\n        setupDom();\n\n        jsds.after('set', 'value', updateDisplay);\n\n        let counter = minValue;\n\n        setInterval(() => {\n            jsds.set('value', counter++);\n            if (counter >= maxValue) counter = 0;\n        }, 300);\n    });\n};\n\n//# sourceURL=webpack:///./src/widgets/encoding-categories/cyclicCategoryEncoder.js?");

/***/ }),

/***/ "./src/widgets/encoding-categories/cyclicCategoryEncoder.tmpl.html":
/*!*************************************************************************!*\
  !*** ./src/widgets/encoding-categories/cyclicCategoryEncoder.tmpl.html ***!
  \*************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (`<svg>\n\n    <text class=\"min-display\"></text>\n    <text class=\"value-display\"></text>\n    <text class=\"max-display\"></text>\n    <text class=\"range-display\"></text>\n\n    <text class=\"name-label\">day of week</text>\n    <text class=\"min-label\">min</text>\n    <text class=\"value-label\">value</text>\n    <text class=\"max-label\">max</text>\n    <text class=\"range-label\">range</text>\n\n    <circle class=\"track\"></circle>\n\n    <g class=\"bits\"></g>\n\n</svg>\n`);\n\n//# sourceURL=webpack:///./src/widgets/encoding-categories/cyclicCategoryEncoder.tmpl.html?");

/***/ }),

/***/ "./src/widgets/encoding-categories/index.js":
/*!**************************************************!*\
  !*** ./src/widgets/encoding-categories/index.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("window.BHTMS = {\n    cyclicCategoryEncoder: __webpack_require__(/*! ./cyclicCategoryEncoder */ \"./src/widgets/encoding-categories/cyclicCategoryEncoder.js\"),\n    JSDS: __webpack_require__(/*! JSDS */ \"./node_modules/javascript-data-store/src/jsds.js\")\n};\n\n//# sourceURL=webpack:///./src/widgets/encoding-categories/index.js?");

/***/ }),

/***/ "./src/widgets/utils.js":
/*!******************************!*\
  !*** ./src/widgets/utils.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// Loads given html into an element, calls the cb one time when loaded.\nfunction loadHtml(html, elementId, cb) {\n    let $el = $('#' + elementId);\n    $el.html(html).promise().done(cb);\n}\n\nfunction getRandomInt(max) {\n    return Math.floor(Math.random() * Math.floor(max));\n}\n\nfunction precisionRound(number, precision) {\n    let factor = Math.pow(10, precision);\n    return Math.round(number * factor) / factor;\n}\n\nfunction getRandomArbitrary(min, max) {\n    return Math.random() * (max - min) + min;\n}\n\nlet mod = function (a, b) {\n    return (a % b + b) % b;\n};\n\n// Standard Normal variate using Box-Muller transform.\nlet randomBoxMuller = function () {\n    let u = 0,\n        v = 0;\n    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)\n    while (v === 0) v = Math.random();\n    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);\n};\n\nfunction randomTorusWalk(d, w, h, speed) {\n    let X = [];\n    let V = [];\n    let x = [0.5 * w, 0.5 * h];\n\n    X.push(x.slice());\n    let v = [0.0, 0.0];\n    let theta = 0.0;\n\n    for (let t = 0; t < d; t++) {\n        theta += randomBoxMuller() / 4;\n        v[0] = speed * Math.cos(theta);\n        v[1] = speed * Math.sin(theta);\n        x[0] += v[0];\n        x[1] += v[1];\n        x[0] = mod(x[0], w);\n        x[1] = mod(x[1], h);\n        X.push(x.slice());\n        V.push(v.slice());\n    }\n    return [X, V];\n}\n\nmodule.exports = {\n    loadHtml: loadHtml,\n    getRandomInt: getRandomInt,\n    getRandomArbitrary: getRandomArbitrary,\n    precisionRound: precisionRound,\n    randomTorusWalk: randomTorusWalk\n};\n\n//# sourceURL=webpack:///./src/widgets/utils.js?");

/***/ }),

/***/ 0:
/*!********************************************************!*\
  !*** multi ./src/widgets/encoding-categories/index.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = __webpack_require__(/*! ./src/widgets/encoding-categories/index.js */\"./src/widgets/encoding-categories/index.js\");\n\n\n//# sourceURL=webpack:///multi_./src/widgets/encoding-categories/index.js?");

/***/ })

/******/ });