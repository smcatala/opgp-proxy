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
import { mixin, fixSubclass } from './lib/utils'

/**
 * @public
 * @factory
 * @param  {OpgpKeySpec} spec
 * @return {Promise<OpgpKey>} a private or public key
 */
export interface OpgpKeyFactory {
  (spec: OpgpKeySpec): Promise<OpgpKey>
}

/**
 * @public
 * specification for a private or public key
 */
export interface OpgpKeySpec {
  /**
 * @public
   * openpgp armored string of a public or private openpgp key
   */
  armor: string
}

export type OpgpKey = Publishable | Concealable<Publishable>

/**
 * type of public key instances
 */
export type Publishable =
Exposable & (Encodable | Verifiable | (Encodable & Verifiable))

/**
 * type of private key instances
 * @generic P extends {Publishable}
 * the type of the public component of private key instances of this type
 */
export interface Concealable<P extends Publishable>
extends Exposable, Lockable {
  /**
   * @public
   * public component of this {Lockable}
   */
	publicKey: P
}

/**
 * @public
 * a primary key, with subkeys and user ids.
 * @generic P extends {Publishable},
 * the public component of this {Lockable}
 */
export interface Extendable<P extends Publishable> extends Concealable<P> {
  /**
   * @public
   * list of private subkey instances of this {Extendable}
   */
  keys: Concealable<Publishable>[]
  /**
   * @public
   * ordered list of openpgp user ids,
   * starting with the primary user id.
   */
  userids: string[]
}

/**
 * @public
 * {Lockable} instances may be locked (encoded) and unlocked
 * with a secret passphrase.
 */
export interface Lockable {
  /**
   * @public
   * @param  {string} secret passphrase
   * @returns {Promise<this>} new passphrase-protected instance
   */
	lock (): Promise<this>
  /**
   * @public
   * @param  {string} secret passphrase
   * @returns {Promise<this>} new instance without passphrase protection
   */
	unlock (): Promise<this>
  /**
   * @public
   * @type {boolean} true if this {Lockable} is locked
   */
  isLocked: boolean
}

/**
 * @public
 * public authenticity verification key interface
 */
export interface Verifiable {
  /**
   * @public
   * @param  {string} src
   * @returns {Promise<string>} `src`,
   * if proven authentic with this {Verifiable}.
   * @error {AuthError} 'verification failure'
   */
	verify (src: string): Promise<string>
}

/**
 * @public
 * public encoding key interface
 */
export interface Encodable {
  /**
   * @public
   * @param  {string} src
   * @returns {Promise<string>} encoded `src`,
   * using this {Encodable}
   */
	encode (src: string): Promise<string>
}

/**
 * @public
 * private signing key interface
 */
export interface Signable {
  /**
   * @public
   * @param  {string} src
   * @returns {Promise<string>} authenticated `src`,
   * signed with this {Signable}.
   */
	sign (src: string): Promise<string>
}

/**
 * @public
 * private decoding key interface
 */
export interface Decodable {
  /**
   * @public
   * @param  {string} src
   * @returns {Promise<string>} decoded `src`,
   * using this {Decodable}
   */
	decode (src: string): Promise<string>
}

/**
 * @public
 * public key interface
 */

export interface Exposable extends Identifiable {
  /**
   * @public
   * @returns string JSON representation of this {Exposable}
   */
  toString (): string
  /**
   * @public
   * @generic P extends {Publishable}
   * @return {this is Concealable<P>}
   */
  isPrivateKey <P extends Exposable>(): this is Concealable<P>
  /**
   * @public
   * @return {this is Encodable|Decodable}
   */
  isCodingKey (): this is Encodable | Decodable
  /**
   * @public
   * @return {this is Signable|Verifiable}
   */
  isAuthKey (): this is Signable | Verifiable
}

/**
 * @public
 * identification strings of an {Publishable} instance
 */
export interface Identifiable {
  /**
   * SHA256 of the armored representation of this {Publishable}.
   */
  hash: string
  /**
   * openpgp id of this {Publishable}.
   */
  id: string
  /**
   * openpgp fingerprint of this {Publishable}
   */
  fingerprint: string
  /**
   * openpgp armored string of this {Publishable}
   */
  armor: string
  /**
   * expiry date of this {Publishable} in unix time.
   * Infinity if no expiry.
   */
  expiry: number
}

class ExposableKey implements Exposable {
  /**
   * @public
   * @see OpgpKeyFactory
   */
  static getInstance <P extends Publishable>(spec: OpgpKeySpec):
  Promise<OpgpKey> {
    // TODO post spec.armor to worker, receive corresponding {OpgpKeyDescriptor},
    // then create new OpgpKey with received {OpgpKeyDescriptor},
    // after deep-freeze.
    return
  }

  /**
   * @public
   * @see OpgpKey#toString
   */
  toString (): string {
    return JSON.stringify(this)
  }

  /**
   * @public
   * @return {this is Concealable<Publishable>}
   */
  isPrivateKey(): this is Concealable<Publishable> {
    return this._isPrivateKey
  }

  /**
   * @public
   * @return {this is Encodable|Decodable}
   */
  isCodingKey(): this is Encodable|Decodable {
    return this._isCodingKey
  }

  /**
   * @public
   * @return {this is Verifiable|Signable}
   */
  isAuthKey(): this is Verifiable|Signable {
    return this._isAuthKey
  }

  /**
   * @public
   * @immutable
   * @enumerable true
   * SHA256 of the armored representation of this {OpgpKey}.
   */
  hash: string

  /**
   * @public
   * @immutable
   * @enumerable true
   * openpgp id of this {OpgpKey}
   */
  id: string

  /**
   * @public
   * @immutable
   * @enumerable true
   * openpgp fingerprint of this {OpgpKey}
   */
  fingerprint: string

  /** TODO move to primary key
   * @public
   * @immutable
   * @enumerable true
   * ordered list of {OpgpUserId}s of the user of this {OpgpKey},
   * starting with the user's primary id
   */
//  userids: string[]

  /**
   * @public
   * @immutable
   * @enumerable false
   * armored representation of this {OpgpKey}.
   */
  armor: string

  /**
   * @public
   * @immutable
   * @enumerable false
   * expiry date of this {OpgpKey} in unix time.
   * Infinity if no expiry.
   */
  expiry: number

  /**
   * @private
   * @param  {OpgpKeyDescriptor} spec
   * private properties are not enumerable so that they don't show up in JSON.
   * object properties of spec should be immutable.
   * @see PgpKey.fromArmor
   * @see PgpKey#clone
   */
  constructor (spec: PublishableKeySpec) {
    Object.defineProperties(this, {
      id: { value: spec.id, enumerable: true },
      fingerprint: { value: spec.fingerprint, enumerable: true },
      expiry: { value: spec.expiry, enumerable: true },
      armor: { value: spec.armor, enumerable: false },
      hash: { value: spec.hash, enumerable: false },
      _handle: { value: spec.handle, enumerable: false },
      _isPrivateKey: { value: spec.isPrivateKey, enumerable: false },
      _isCodingKey: { value: spec.isCodingKey, enumerable: false },
      _isAuthKey: { value: spec.isAuthKey, enumerable: false }
    })
  }

  /**
   * @protected
   * @immutable
   * @enumerable false
   * temporary secret handle for this {OpgpKey}.
   */
  protected _handle : string

  /**
   * @protected
   * @immutable
   * @enumerable false
   * {this is PrivateOpgpKey}
   */
  protected _isPrivateKey : boolean

  /**
   * @protected
   * @immutable
   * @enumerable false
   * {this is EncodingOpgpKey | DecodingOpgpKey}
   */
  protected _isCodingKey : boolean

  /**
   * @protected
   * @immutable
   * @enumerable false
   * {this is SigningOpgpKey | VerifyingOpgpKey}
   */
  protected _isAuthKey : boolean
}

class PublicAuthenticatingKey extends ExposableKey implements Verifiable {
  /**
   * @public
   * @see Verifiable#verify
   */
	verify (src: string): Promise<string> {
		return // TODO
	}

  constructor (spec: PublishableKeySpec) {
    super(spec)
  }
}

fixSubclass(PublicAuthenticatingKey)

class PublicCodingKey extends ExposableKey implements Encodable {
  /**
   * @public
   * @see Encodable#encode
   */	encode (src: string): Promise<string> {
		return // TODO
	}

  constructor (spec: PublishableKeySpec) {
    super(spec)
  }
}

fixSubclass(PublicCodingKey)

class PublicUniversalKey extends ExposableKey
implements Verifiable, Encodable {
  /**
   * @param  {any} key
   * @returns boolean true if {this} is a universal key
   */
  static isUniversalKey (key: any): boolean {
    if (key && (key.publicKey instanceof ExposableKey)) {
      return PublicUniversalKey.isUniversalKey(key.publicKey)
    }
    return (key && (key instanceof PublicUniversalKey))
  }

  /**
   * @public
   * @see Verifiable#verify
   */
	verify: (src: string) => Promise<string>

  /**
   * @public
   * @see Encodable#encode
   */
	encode: (src: string) => Promise<string>

  constructor (spec: PublishableKeySpec) {
		super(spec)
	}
}

fixSubclass(PublicUniversalKey)

mixin (PublicUniversalKey, PublicAuthenticatingKey, PublicCodingKey)

class ConcealableKey<P extends Publishable>
extends ExposableKey
implements Concealable<P> {
  /**
   * @public
   * @see Lockable#lock
   */
	lock (): Promise<this> {
		return // TODO
	}

  /**
   * @public
   * @see Lockable#unlock
   */
	unlock (): Promise<this> {
		return // TODO
	}

  /**
   * @public
   * @see Lockable#islocked
   */
	isLocked: boolean

  publicKey: P

  constructor (spec: ConcealableKeySpec) {
    super(spec)
    const publicKey = ExposableKey.getInstance(spec.publicKey)
    Object.defineProperties(this, {
      publicKey: { value: publicKey, enumerable: true },
      isLocked: { value: spec.isLocked, enumerable: false }
    })
  }
}

fixSubclass(ConcealableKey)

class PrivateAuthenticatingKey<P extends Exposable & Verifiable>
extends ConcealableKey<P>
implements Signable {
  /**
   * @public
   * @see Signable#sign
   */
	sign (src: string): Promise<string> {
		return // TODO
	}

	constructor (spec: ConcealableKeySpec) {
		super(spec)
	}
}

fixSubclass(PrivateAuthenticatingKey)

class PrivateCodingKey<P extends Exposable & Encodable>
extends ConcealableKey<P>
implements Decodable {
  /**
   * @public
   * @see Decodable#decode
   */
	decode (src: string): Promise<string> {
		return // TODO
	}

	constructor (spec: ConcealableKeySpec) {
		super(spec)
	}
}

fixSubclass(PrivateCodingKey)

class PrivateUniversalKey<P extends Exposable & Verifiable & Encodable>
extends ConcealableKey<P>
implements Signable, Decodable {
  /**
   * @public
   * @see Signable#sign
   */
	sign: (src: string) => Promise<string>

  /**
   * @public
   * @see Decodable#decode
   */
	decode: (src: string) => Promise<string>

	constructor (spec: ConcealableKeySpec) {
		super(spec)
	}
}

fixSubclass(PrivateUniversalKey)

mixin(PrivateUniversalKey, PrivateAuthenticatingKey, PrivateCodingKey)

/**
 * @private
 * key descriptor from worker
 */
interface PublishableKeySpec extends Identifiable {
  /**
   * @private
   * temporary secret handle for this {OpgpKey}.
   */
  handle: string
  /**
   * @private
   * {this is PrivateOpgpKey}
   */
  isPrivateKey : boolean

  /**
   * @private
   * {this is EncodingOpgpKey | DecodingOpgpKey}
   */
  isCodingKey : boolean

  /**
   * @private
   * {this is SigningOpgpKey | VerifyingOpgpKey}
   */
  isAuthKey : boolean
  /**
   * @public
   * ordered list of the user ids of this {OpgpKey},
   * starting with the user's primary id.
   */
  userids?: string[]
}

interface ConcealableKeySpec extends PublishableKeySpec {
  publicKey: PublishableKeySpec,
  isLocked: boolean
}

/**
 * @public
 * @see OpgpKeyFactory
 */
export const getOpgpKey: OpgpKeyFactory = ExposableKey.getInstance