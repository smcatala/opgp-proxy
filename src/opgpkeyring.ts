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
import { getOpgpKey, OpgpKey } from './opgpkey'

export { OpgpKey }

/**
 * @public
 * @factory
 * @param {string} armor
 * @return {Promise<OpgpKeyring>}
 * @error {OpgpError}
 */
export interface OpgpKeyringFactory {
  (armor: string, opts?: Object): Promise<OpgpKeyring>
}

/**
 * immutable proxy for an {openpgp} instance
 * running in a web worker thread.
 * a map of primary-key hash {string} to {OpgpKey} instance.
 * @extends {Map<string,OpgpKey>}
 */
export interface OpgpKeyring extends Map<string,OpgpKey> {
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
}

/**
 * @class
 * immutable proxy for an {openpgp} instance
 * running in a web worker thread
 */
class OpgpKeyringClass extends Map<string,OpgpKey> implements OpgpKeyring {
  /**
   * @public
   * @see {OpgpKeyringFactory}
   */
  static fromArmor (armor: string): Promise<OpgpKeyring> {
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
   * @private
   * @param  {PgpKeySpec} spec
   * @see {OpgpKeyringFactory}
   */
  constructor (spec: OpgpKeyringSpec) {
    super()
  }

  private _armor: string
}

/**
 * @private
 *
 */
interface OpgpKeyringSpec {
  // TODO
}

export const fromArmor: OpgpKeyringFactory = OpgpKeyringClass.fromArmor