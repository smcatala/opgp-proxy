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
import assert = require('assert')
import Promise = require('bluebird')
import {
  Observable,
  ConnectableObservable,
  BehaviorSubject,
  Observer
} from '@reactivex/rxjs'
import { Map as FMap } from 'immutable'
import { fixSubclass } from './lib/utils'
import { getOpgpKey, OpgpKey } from './opgpkey'

export { OpgpKey }

/**
 * @public
 * @factory
 * @param {string} armor [openpgp](https://openpgpjs.org/) armored key string
 * @param {OpgpKeyringOpts} opts?
 * @return {Promise<OpgpKeyring>}
 * @error {OpgpError}
 */
export interface OpgpKeyringFromArmor {
  (armor: string, opts?: OpgpKeyringOpts): Promise<OpgpKeyring>
}

/** TODO expand to accept Iterable<string,OpgpKey>
 * @public
 * @factory
 * @param  {Map<string,OpgpKey>|Immutable.Map<string,OpgpKey>} map
 * standard ES6 Map or
 * [Immutable](https://facebook.github.io/immutable-js/).Map
 * of `OpgpKey.hash` string to OpgpKey
 * @returns {OpgpKeyring}
 */
export interface OpgpKeyringFromMap {
  (map: Map<string,OpgpKey>|FMap<string,OpgpKey>, opts?: OpgpKeyringOpts):
  OpgpKeyring
}

export interface OpgpKeyringOpts {
  // TODO
}

/**
 * @public
 * immutable proxy for an {openpgp} instance
 * running in a web worker thread.
 * the keys are accessible
 * as an [Immutable](https://facebook.github.io/immutable-js/).Map
 * of primary-key hash {string} to {OpgpKey} instance.
 * @see {OpgpKeyring#keys}
 */
export interface OpgpKeyring {
  /**
   * @public
   * Encrypt-then-MAC authenticated encryption
   * @param  {string} src
   * @returns {Promise<string>} armored authenticated cipher of src,
   * first encoded with all public keys in this {OpgpKeyring}
   * then signed with the private keys in this {OpgpKeyring} if any.
   * [The Order of Encryption and Authentication for Protecting Communications (Or: How Secure is SSL?), Hugo Krawczyk](http://www.iacr.org/archive/crypto2001/21390309.pdf)
   */
  encode (src: string): Promise<string>
  /**
   * @public
   * @param  {string} src
   * @returns {Promise<string>} authenticity verified decoded src cipher,
   * first verified with the public keys in this {OpgpKeyring} if any,
   * then decoded with the private key in this {OpgpKeyring},
   * only if proven authentic.
   * [The Order of Encryption and Authentication for Protecting Communications (Or: How Secure is SSL?), Hugo Krawczyk](http://www.iacr.org/archive/crypto2001/21390309.pdf)
   */
  decode (src: string): Promise<string>
  /**
   * @public
   * @param  {string} src
   * @returns {Promise<string>} authenticated src,
   * signed with the private signing keys in this {OpgpKeyring} if any.
   */
  sign (src: string): Promise<string>
  /**
   * @public
   * @param  {string} src
   * @returns {Promise<string>} src,
   * if proven authentic with the public signing keys
   * in this {OpgpKeyring} if any.
   * @error {AuthError} 'verification failure'
   *  the list of
   */
  verify (src: string): Promise<string>
  /**
   * @public
   * [Immutable](https://facebook.github.io/immutable-js/).Map
   * of primary-key hash {string} to {OpgpKey} instance
   * of the keys in this {OpgpKeyring}.
   */
  keys: FMap<string, OpgpKey>
}

/**
 * @class
 * immutable proxy for an {openpgp} instance
 * running in a web worker thread
 */
class OpgpKeyringClass
implements OpgpKeyring {
  /**
   * @public
   * @static
   * @see {OpgpKeyringFromArmor}
   */
  static fromArmor (armor: string, opts?: OpgpKeyringOpts): Promise<OpgpKeyring> {
    return
  }

  /**
   * @public
   * @static
   * @see {OpgpKeyringFromMap}
   */
  static fromMap (map: Map<string,OpgpKey>|FMap<string,OpgpKey>,
  opts?: OpgpKeyringOpts): OpgpKeyring {
    return
  }

  /**
   * @public
   * @see {OpgpKeyring#encode}
   */
  encode (src: string): Promise<string> {
    return
  }

  /**
   * @public
   * @see {OpgpKeyring#encode}
   */
  decode (src: string): Promise<string> {
    return
  }

  /**
   * @public
   * @see {OpgpKeyring#sign}
   */
  sign (src: string): Promise<string> {
    return
  }

  /**
   * @public
   * @see {OpgpKeyring#verify}
   */
  verify (src: string): Promise<string> {
    return
  }

  /**
   * @public
   * @see {OpgpKeyring#keys}
   */
  keys: FMap<string, OpgpKey>

  /**
   * @private
   * @param  {PgpKeySpec} spec
   * @see {OpgpKeyringFactory}
   */
  constructor (spec: OpgpKeyringSpec) {
    // TODO
    Object.defineProperties(this, {
      keys: { value: FMap(spec.keys), enumerable: true }
    })
  }

  private _armor: string
}

fixSubclass(OpgpKeyringClass)

/**
 * @private
 *
 */
interface OpgpKeyringSpec {
  // TODO
  keys: Map<string,OpgpKey> | FMap<string,OpgpKey>
}

export const fromArmor: OpgpKeyringFromArmor = OpgpKeyringClass.fromArmor
export const fromMap: OpgpKeyringFromMap = OpgpKeyringClass.fromMap