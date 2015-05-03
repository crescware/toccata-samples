(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.toccata = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _default2 = require('./lib/toccata');

var _default3 = _interopRequireDefault(_default2);

exports['default'] = _default3['default'];
module.exports = exports['default'];

// same as the following ES6
// export default from './lib/toccata';
},{"./lib/toccata":4}],2:[function(require,module,exports){
'use strict';
exports.document = (typeof window === 'object') ? window.document : {};

},{}],3:[function(require,module,exports){
'use strict';
/**
 * return the operating mode of toccata
 *
 * @param {*} angular
 * @returns {string}
 */
function operatingMode(angular) {
    if (!angular.version && !angular.bootstrap) {
        // arg of angular is not Angular
        throw new Error('AngularJS or Angular 2 is required to Toccata');
    }
    var version = angular.version;
    if (!version) {
        // if Angular 2
        return 'v2';
    }
    var preReleaseVer = (function (v) {
        var full = v.full.split('-')[1];
        return (!full) ? { phase: void 0, num: void 0 } : {
            phase: full.split('.')[0],
            num: +full.split('.')[1]
        };
    })(version);
    if (version.major === 1 && version.minor === 4 && preReleaseVer.phase === 'beta' && preReleaseVer.num < 5) {
        // if AngularJS <1.4.0-beta.5
        throw new Error("AngularJS " + version.full + " does not support CommonJS");
    }
    var lessThan1_3_14 = version.major === 1 && version.minor === 3 && version.dot < 14;
    var lessThan1_3 = version.major === 1 && version.minor < 3;
    if (lessThan1_3_14 || lessThan1_3) {
        // if AngularJS <1.3.14
        throw new Error('Toccata does not support the version less than AngularJS 1.3.14');
    }
    return 'v1';
}
exports.default = operatingMode;

},{}],4:[function(require,module,exports){
/**
 * Cresc Toccata
 * @copyright © 2015 Crescware
 */
/// <reference path="../typings/node/node.d.ts" />
'use strict';
var operating_mode_1 = require('./operating-mode');
var v1_1 = require('./v1/v1');
var v2_1 = require('./v2/v2');
var pkg = require('../package.json');
function toccata(angular) {
    if (!angular) {
        throw new Error('AngularJS or Angular 2 is required');
    }
    return new Toccata(angular);
}
exports.toccata = toccata;
toccata.version = pkg.version;
var Toccata = (function () {
    /**
     * @constructor
     */
    function Toccata(core) {
        this.operatingMode = operating_mode_1.default(core);
        this.core = core;
        this.bootstrap = this.bootstrapFactory();
        this.Component = this.ComponentFactory();
        this.View = this.ViewFactory();
        // WIP, not working
        /*
        this.Ancestor = this.AncestorFactory();
        this.Parent   = this.ParentFactory();
        */
        if (this.isV2()) {
            this.For = this.core.For || console.warn('angular2.For not found');
        }
        if (this.isV1()) {
            this.NgController = this.NgControllerBase.bind(this);
            this.NgDirective = this.NgDirectiveBase.bind(this);
            this._uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    }
    /**
     * Only V1
     * Set AngularJS 1.x angular.module('name', ['requires'])
     *
     * @param {any} mod
     */
    Toccata.prototype.setModule = function (mod) {
        if (this.isV2()) {
            return;
        } // noop when v2
        this.coreModule = this.coreModule || [];
        this.coreModule.push(mod);
    };
    /**
     * Only V1
     * @param {string} name
     * @returns {*} angular.module
     */
    Toccata.prototype.module = function (name) {
        if (this.isV2()) {
            throw new Error('toccata.module is available only when the mode is v1');
        }
        var corresponding;
        var exists = this.coreModule.some(function (mod, i) {
            corresponding = i;
            return mod.name === name;
        });
        if (!exists) {
            throw new Error("Toccata has not a module \"" + name + "\". you can do toccata.setModule(angular.module(\"" + name + "\", []))");
        }
        return this.coreModule[corresponding];
    };
    /**
     * Only V1
     *
     * usage
     * @NgController({
     *   name: 'ControllerName'
     * })
     * class Controller{
     *   //...
     * }
     *
     * @param {*} [def]
     * @returns {Function}
     */
    Toccata.prototype.NgControllerBase = function (def) {
        var _this = this;
        var funcName = 'NgController';
        def = def || {};
        return function (controller) {
            var ctrlName = def.name || controller.name || '';
            if (!ctrlName) {
                throw new Error("name is required. @" + funcName + "({name: \"controllerName\"})");
            }
            if (1 < _this.coreModule.length && !def.module) {
                throw new Error("Toccata has some angular.module. You must specify the module name. @" + funcName + "({module: \"moduleName\", name: \"" + def.name + "\"})");
            }
            if (_this.coreModule.length === 1) {
                _this.coreModule[0].controller(ctrlName, controller);
                return controller;
            }
            _this.module(def.module).controller(ctrlName, controller);
            return controller;
        };
    };
    /**
     * Only V1
     *
     * usage
     * @NgDirective({
     *   name: 'directiveName' // and set also as 'controllerAs'
     * })
     * class Controller{
     *   //...
     * }
     *
     * @param {*} [def]
     */
    Toccata.prototype.NgDirectiveBase = function (def) {
        var _this = this;
        var funcName = 'NgDirective';
        def = def || {};
        return function (controller) {
            var dirName = def.name || '';
            if (!dirName) {
                throw new Error("name is required. @" + funcName + "({name: \"directiveName\"})");
            }
            if (1 < _this.coreModule.length && !def.module) {
                throw new Error("Toccata has some angular.module. You must specify the module name. @" + funcName + "({module: \"moduleName\", name: \"" + def.name + "\"})");
            }
            var ddo = {
                restrict: def.restrict || 'E',
                controller: controller,
                controllerAs: dirName,
            };
            // All of the property is not supported yet
            // The support is also undecided
            // Does everyone use all?
            var availableProps = [
                'compile',
                'link',
                'require',
                'scope',
                'template',
                'templateUrl'
            ];
            availableProps.forEach(function (prop) {
                if (def[prop]) {
                    ddo[prop] = def[prop];
                }
            });
            if (_this.coreModule.length === 1) {
                _this.coreModule[0].directive(dirName, function () { return ddo; });
                return controller;
            }
            _this.module(def.module).directive(dirName, function () { return ddo; });
            return controller;
        };
    };
    /**
     * @returns {boolean}
     */
    Toccata.prototype.isV1 = function () {
        return this.operatingMode === 'v1';
    };
    /**
     * @returns {boolean}
     */
    Toccata.prototype.isV2 = function () {
        return this.operatingMode === 'v2';
    };
    /**
     * @returns {Function}
     */
    Toccata.prototype.bootstrapFactory = function () {
        return (this.isV2())
            ? v2_1.default.prototype._bootstrapFactory.call(this)
            : v1_1.default.prototype._bootstrapFactory.call(this);
    };
    /**
     * @returns {Decoratable}
     */
    Toccata.prototype.ComponentFactory = function () {
        return (this.isV2())
            ? v2_1.default.prototype._ComponentFactory.call(this)
            : v1_1.default.prototype._ComponentFactory.call(this);
    };
    /**
     * @returns {Decoratable}
     */
    Toccata.prototype.ViewFactory = function () {
        return (this.isV2())
            ? v2_1.default.prototype._ViewFactory.call(this)
            : v1_1.default.prototype._ViewFactory.call(this);
    };
    /**
     * @returns {Decoratable}
     */
    Toccata.prototype.ParentFactory = function () {
        return (this.isV2())
            ? v2_1.default.prototype._ParentFactory.call(this)
            : v1_1.default.prototype._ParentFactory.call(this);
    };
    /**
     * @returns {Decoratable}
     */
    Toccata.prototype.AncestorFactory = function () {
        return (this.isV2())
            ? v2_1.default.prototype._AncestorFactory.call(this)
            : v1_1.default.prototype._AncestorFactory.call(this);
    };
    return Toccata;
})();
exports.Toccata = Toccata;

},{"../package.json":7,"./operating-mode":3,"./v1/v1":5,"./v2/v2":6}],5:[function(require,module,exports){
'use strict';
var browser_dependencies_1 = require('../browser-dependencies');
var ToccataForV1 = (function () {
    function ToccataForV1() {
    }
    /**
     * Return AngularJS 1.x bootstrap()
     * If you are already doing Toccata#initModule(), it is not nothing
     *
     * @private
     * @returns {function(*, string[]): void}
     */
    ToccataForV1.prototype._bootstrapFactory = function () {
        var _this = this;
        return function (component, requires) {
            if (!component) {
                throw new TypeError('bootstrap requires the component constructor');
            }
            var selector = component._toccataSelectorCache;
            if (!selector) {
                throw new TypeError('bootstrap requires the selector of component, you can use annotation');
            }
            requires = requires || [];
            requires.push(_this._uuid);
            _this.core.bootstrap(browser_dependencies_1.document.body, requires);
        };
    };
    /**
     * @private
     * @returns {Decoratable}
     */
    ToccataForV1.prototype._ComponentFactory = function () {
        var _this = this;
        return function (def) {
            return function (component) {
                if (!component._toccataDdoCache) {
                    throw new Error('You must first use the @View annotation');
                }
                function camelize(s) {
                    return s.replace(/(\-|_|\s)+(.)?/g, function (mathc, sep, c) {
                        return (c ? c.toUpperCase() : '');
                    });
                }
                component._toccataSelectorCache = camelize(def.selector);
                var ddo = component._toccataDdoCache;
                ddo.restrict = 'E';
                ddo.controller = component;
                ddo.controllerAs = component.name || 'Component';
                try {
                    _this.core.module(_this._uuid);
                }
                catch (e) {
                    // Initialize a module if cannot take it
                    _this.core.module(_this._uuid, []);
                }
                _this.core.module(_this._uuid)
                    .directive(component._toccataSelectorCache, function () { return ddo; });
                return component;
            };
        };
    };
    /**
     * @private
     * @returns {Decoratable}
     */
    ToccataForV1.prototype._ViewFactory = function () {
        return function (def) {
            return function (component) {
                if (!def.template && !def.templateUrl) {
                    throw new Error('template or templateUrl is required');
                }
                component._toccataDdoCache = {
                    template: def.template,
                    templateUrl: def.templateUrl
                };
                return component;
            };
        };
    };
    /**
     * Parent support is currently WIP
     *
     * @private
     * @returns {Decoratable}
     */
    ToccataForV1.prototype._ParentFactory = function () {
        return function (def) {
            // noop
            return function (decoratee) {
                // noop
                return decoratee;
            };
        };
    };
    /**
     * Ancestor support is currently WIP
     *
     * @private
     * @returns {Decoratable}
     */
    ToccataForV1.prototype._AncestorFactory = function () {
        return function (def) {
            // noop
            return function (decoratee) {
                // noop
                return decoratee;
            };
        };
    };
    return ToccataForV1;
})();
exports.default = ToccataForV1;

},{"../browser-dependencies":2}],6:[function(require,module,exports){
'use strict';
var ToccataForV2 = (function () {
    function ToccataForV2() {
    }
    /**
     * Return Angular 2 bootstrap()
     *
     * @private
     * @returns {function(*, ?*=, ?Function=): void}
     */
    ToccataForV2.prototype._bootstrapFactory = function () {
        return this.core.bootstrap;
    };
    /**
     * @private
     * @returns {Decoratable}
     */
    ToccataForV2.prototype._ComponentFactory = function () {
        var _this = this;
        var Component = function (def) {
            var annotation = new _this.core.Component(def);
            return function (decoratee) {
                decoratee.annotations = decoratee.annotations || [];
                if (def.injectables) {
                    decoratee.parameters = decoratee.parameters || [def.injectables];
                }
                decoratee.annotations.push(annotation);
                return decoratee;
            };
        };
        return Component;
    };
    /**
     * @private
     * @returns {Decoratable}
     */
    ToccataForV2.prototype._ViewFactory = function () {
        var _this = this;
        var View = function (def) {
            var annotation = new _this.core.View(def);
            return function (decoratee) {
                decoratee.annotations = decoratee.annotations || [];
                decoratee.annotations.push(annotation);
                return decoratee;
            };
        };
        return View;
    };
    /**
     * Parent support is currently WIP
     *
     * @private
     * @returns {Decoratable}
     */
    ToccataForV2.prototype._ParentFactory = function () {
        var _this = this;
        var Parent = function (def) {
            return function (decoratee) {
                return new _this.core.Parent(decoratee);
            };
        };
        return Parent;
    };
    /**
     * Ancestor support is currently WIP
     *
     * @private
     * @returns {Decoratable}
     */
    ToccataForV2.prototype._AncestorFactory = function () {
        var _this = this;
        var Ancestor = function (def) {
            return function (decoratee) {
                return new _this.core.Ancestor(decoratee);
            };
        };
        return Ancestor;
    };
    return ToccataForV2;
})();
exports.default = ToccataForV2;

},{}],7:[function(require,module,exports){
module.exports={
  "name": "toccata",
  "description": "Cresc Toccata is the utility for AngularJS >= 1.3.14 / Angular 2",
  "version": "0.1.0",
  "author": "Crescware",
  "bugs": {
    "url": "https://github.com/crescware/toccata/issues"
  },
  "devDependencies": {
    "babel": "^5.1.11",
    "babel-core": "^5.1.11",
    "babel-plugin-espower": "^0.2.1",
    "browserify": "^9.0.8",
    "del": "^1.1.1",
    "dtsm": "^0.9.1",
    "glob": "^5.0.5",
    "gulp": "^3.8.11",
    "gulp-mocha": "^2.0.1",
    "gulp-shell": "^0.4.0",
    "licensify": "^1.1.0",
    "nightmare": "^1.8.1",
    "power-assert": "^0.11.0",
    "proxyquire": "^1.4.0",
    "run-sequence": "^1.0.2",
    "sinon": "^1.14.1",
    "superstatic": "^2.2.0",
    "tslint": "^2.1.1",
    "typescript": "^1.5.0-alpha",
    "watchify": "^3.1.1"
  },
  "homepage": "https://github.com/crescware/toccata",
  "keywords": [
    "Angular",
    "AngularJS",
    "flux",
    "framework"
  ],
  "license": "MIT",
  "main": "index.js",
  "repository": {
    "type": "git",
    "url": "https://github.com/crescware/toccata.git"
  },
  "scripts": {
    "1-3-14": "cd ./test/e2e/1-3-14         && ss --port 1314 &",
    "1-3": "   cd ./test/e2e/1-3-latest     && ss --port 1300 &",
    "1-4": "   cd ./test/e2e/1-4-latest     && ss --port 1400 &",
    "2-0": "   cd ./test/e2e/2-0-0-alpha-21 && ss --port 2000 &",
    "allserver": "npm run 1-3-14 && npm run 1-3 && npm run 1-4 && npm run 2-0",
    "build": "gulp build",
    "build:fixtures": "gulp build:fixtures",
    "dtsm": "dtsm install",
    "e2e": "gulp e2e",
    "gulpfile": "babel gulpfile.es6 -o gulpfile.js",
    "test": "gulp test",
    "watch": "gulp watch"
  }
}

},{}],8:[function(require,module,exports){
module.exports = require('./index').toccata;
},{"./index":1}]},{},[8])(8)
});