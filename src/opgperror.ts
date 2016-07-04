/// <reference path="../typings/index.d.ts" />

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
 * @public
 * @class
 * @generic T
 * @extends Error
 * @prop {string} message includes JSON-stringified `data`
 * @prop {T} data?
 */
class OpgpError<T> extends Error {
  constructor (message: string, data?: T) {
    super(append(message, data))
    this.data = data
  }

  data: T
}

/**
 * @param  {string} message
 * @param  {any} data
 * @return {string} JSON-stringified `data` appended to `message`
 * or only `message` if stringification of `data` fails.
 * * the stringified `data` is prepended with `data:`.
 * * `message` and stringified `data` are separated by a semicolon.
 */
function append (message: string, data: any): string {
  try {
    return `${message}; data: ${JSON.stringify(data)}`
  } catch (err) {
    return message
  }
}