/*
 * Copyright 2016 Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
;
import { __assign } from 'tslib'
/**
 * add all enumerable properties from the prototypes
 * of the {sources} constructors
 * onto the prototype of the {target} constructor.
 * constructor properties are excluded.
 *
 * @param  {Function} target *mutated by this function*
 * @param  {Function[]} ...sources
 */
export function mixin (target: Function, ...sources: Function[]): any {
    Object.assign(target.prototype, ...sources.map(source => source.prototype))
}

/**
 * custom implementation of Typescript `__extends` helper,
 * the difference being that the constructor property on the prototype
 * of the derived class is not enumerable (as with ES6 class).
 * this is required when applying Object.assign to mixin the prototype
 * of a subclass onto another prototype, so as not to copy the constructor.
 * @param  {Function} d derived class (subclass)
 * @param  {Function} b base class (super)
 */
export function __extends (d: Function, b: Function) {
    for (var p in b) {
        if (b.hasOwnProperty(p)) {
            d[p] = b[p]
        }
    }
    function __ () {
        Object.defineProperty(this, 'constructor', {
            value: d,
            enumerable: false,
            configurable: true,
            writable: true
        })
    }
    d.prototype = (b === null) ?
    Object.create(b) : (__.prototype = b.prototype, new (<any> __)());
}

/**
 * @deprecated replaced with custom __extends helper (--noEmitHelpers)
 * sets the `enumerable` property of the 'constructor' property
 * of the prototype of the given {ctor} constructor
 * to false:
 * * enumerable: false
 *
 * https://github.com/Microsoft/TypeScript/issues/1601
 * In ECMAScript 2015, the constructor property
 * on class (and subclass) prototypes _is not_ enumerable by default.
 * However, in Typescript transpiled to ECMAScript,
 * the constructor property on subclass prototypes _is_ enumerable.
 * This function fixes this discrepancy.
 *
 * @param  {Function} ctor subclass constructor *mutated by this function*
 */
export function fixSubclass (ctor: Function) {
  Object.defineProperty(ctor.prototype, 'constructor', {
      enumerable: false
  })
}