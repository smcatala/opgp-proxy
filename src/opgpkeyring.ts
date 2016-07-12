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
import { Map as FMap, Iterable } from 'immutable'
import { fixSubclass } from './lib/utils'
import { getOpgpKey, OpgpKey, SecKey, LockOpts, UnlockOpts } from './opgpkey'

export { OpgpKey, SecKey, Iterable }

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

/**
 * @public
 * @factory
 * @param  {Array<OpgpKey>|Iterable<any,OpgpKey>} list of OpgpKey instances
 * @returns {OpgpKeyring}
 */
export interface OpgpKeyringFromList {
  (list: Array<OpgpKey>|Iterable<any,OpgpKey>, opts?: OpgpKeyringOpts):
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
  encode (src: string, opts?: EncodeOpts): Promise<string>
  /**
   * @public
   * @param  {string} src
   * @returns {Promise<string>} authenticity verified decoded src cipher,
   * first verified with the public keys in this {OpgpKeyring} if any,
   * then decoded with the private key in this {OpgpKeyring},
   * only if proven authentic.
   * [The Order of Encryption and Authentication for Protecting Communications (Or: How Secure is SSL?), Hugo Krawczyk](http://www.iacr.org/archive/crypto2001/21390309.pdf)
   */
  decode (src: string, opts?: DecodeOpts): Promise<string>
  /**
   * @public
   * @param  {string} src
   * @returns {Promise<string>} authenticated src,
   * signed with the private signing keys in this {OpgpKeyring} if any.
   */
  sign (src: string, opts?: SignOpts): Promise<string>
  /**
   * @public
   * @param  {string} src
   * @returns {Promise<string>} src,
   * if proven authentic with the public signing keys
   * in this {OpgpKeyring} if any.
   * @error {AuthError} 'verification failure'
   *  the list of
   */
  verify (src: string, opts?: VerifyOpts): Promise<string>
  /**
   * @public
   * @param  {string|Iterable<string,string>} secrets
   * @param  {LockOpts} opts?
   * @returns {Promise<this>}
   */
  lock (secrets: string|Iterable<string,string>, opts?: LockOpts): Promise<this>
  /**
   * @public
   * @param  {string|Iterable<string,string>} secrets
   * @param  {LockOpts} opts?
   * @returns {Promise<this>}
   */
  unlock (secrets: string|Iterable<string,string>, opts?: UnlockOpts): Promise<this>
  /**
   * @public
   * [Immutable](https://facebook.github.io/immutable-js/).Map
   * of primary-key hash {string} to {OpgpKey} instance
   * of the keys in this {OpgpKeyring}.
   */
  asMap: FMap<string, OpgpKey>
}

export interface EncodeOpts {
  keys?: {
    /**
     * list of OpgpKey.hash reference strings
     * of public encoding OpgpKey instances in this OpgpKeyring
     * to use for encoding.
     * default: all public encoding OpgpKey instances in this OpgpKeyring.
     */
    encode?: string[]
    /**
     * list of OpgpKey.hash reference strings
     * of private signing OpgpKey instances in this OpgpKeyring
     * to use for signing.
     * default: all private signing OpgpKey instances in this OpgpKeyring.
     */
    sign?: string[]
  }
  /**
   * Encrypt-then-MAC when true.
   * Otherwise force openpgp Mac-then-Encrypt.
   * default: true
   */
  etm?: boolean
  /**
   * require authentication when true:
   * in particular, fail if no private signing keys are included.
   * Otherwise limit authentication to the included public signing keys, if any.
   * default: true
   */
  strict?: boolean
}

export interface DecodeOpts {
  keys?: {
    /**
     * OpgpKey.hash reference string of the private decoding OpgpKey instance
     * in this OpgpKeyring to use for decoding.
     * default: the single private decoding OpgpKey instance in this OpgpKeyring
     */
    decode?: string
    /**
     * list of OpgpKey.hash reference strings
     * of public verification OpgpKey instances in this OpgpKeyring
     * to use for verifying authenticity.
     * default: all public verification OpgpKey instances in this OpgpKeyring
     */
    verify?: string[]
  }
  /**
   * require full verification of all signatures when true:
   * in particular, fail if any keys required for full verification are missing.
   * Otherwise limit verification to the public verification keys
   * in this `OpgpKeyring`.
   * default: true
   */
  strict?: boolean
}

export interface SignOpts {
  keys?: {
    /**
     * list of OpgpKey.hash reference strings
     * of private signing OpgpKey instances in this OpgpKeyring
     * to use for signing.
     * default: all private signing OpgpKey instances in this OpgpKeyring.
     */
    sign?: string[]
  }
}

export interface VerifyOpts {
  keys?: {
    /**
     * list of OpgpKey.hash reference strings
     * of public verification OpgpKey instances in this OpgpKeyring
     * to use for verifying authenticity.
     * default: all public verification OpgpKey instances in this OpgpKeyring
     */
    verify?: string[]
  }
  /**
   * require full verification of all signatures when true:
   * in particular, fail if any keys required for full verification are missing.
   * Otherwise limit verification to the public verification keys
   * in this `OpgpKeyring`.
   * default: true
   */
  strict?: boolean
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
  static fromList (list: Array<OpgpKey>|Iterable<any,OpgpKey>, opts?: OpgpKeyringOpts): OpgpKeyring {
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
   * @see {OpgpKeyring#lock}
   */
  lock (secrets: string|Iterable<string,string>, opts?: LockOpts): Promise<this> {
    return
  }

  /**
   * @public
   * @see {OpgpKeyring#unlock}
   */
  unlock (secrets: string|Iterable<string,string>, opts?: UnlockOpts): Promise<this> {
    return
  }

  /**
   * @public
   * @see {OpgpKeyring#keys}
   */
  asMap: FMap<string, OpgpKey>

  /**
   * @private
   * @param  {PgpKeySpec} spec
   * @see {OpgpKeyringFactory}
   */
  constructor (spec: OpgpKeyringSpec) {
    // TODO
    Object.defineProperties(this, {
      asMap: { value: FMap(spec.keys), enumerable: true }
    })
  }

  private _armor: string
}

/**
 * @private
 *
 */
interface OpgpKeyringSpec {
  // TODO
  armor: string
  keys?: Map<string,OpgpKey> | FMap<string,OpgpKey>
}

export const fromArmor: OpgpKeyringFromArmor = OpgpKeyringClass.fromArmor
export const fromList: OpgpKeyringFromList = OpgpKeyringClass.fromList