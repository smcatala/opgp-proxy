/**
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