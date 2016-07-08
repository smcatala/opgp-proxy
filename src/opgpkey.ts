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
import { List as FList } from 'immutable'
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

/**
 * The `OpgpKey` type alias represents immutable and ephemeral instances
 * that abstract key material from the [openpgp](https://openpgpjs.org/) worker.
 * * the sensitive cryptographic key material remains well contained
 * in the [openpgp](https://openpgpjs.org/) worker,
 * and is not included in the internals of, or exposed by `OpgpKey` instances.
 * * `OpgpKey` instances are immutable
 * * `OpgpKey` instances are ephemeral:
 * they become stale if none of their methods are called
 * for a defined length of time,
 * or if the [openpgp](https://openpgpjs.org/) worker is terminated.
 *
 * @see {Publishable}
 * @see {Concealable}
 */
export type OpgpKey = RootKey | SecKey | PubKey

export type RootKey = RootAuthKey | RootCodeKey | RootUniKey

export type SecKey = SecAuthKey | SecCodeKey | SecUniKey

export type PubKey = PubAuthKey | PubCodeKey | PubUniKey

export interface RootAuthKey extends SecAuthKey, Belongings {}

export interface RootCodeKey extends SecCodeKey, Belongings {}

export interface RootUniKey extends SecUniKey, Belongings {}

/**
 * @public
 * The `RootConcealable` interface represents intances of primary keys.
 *
 * More specifically, these are `Concealable`
 * instances that additionally expose
 * an [`Immutable.List`](https://facebook.github.io/immutable-js/)
 * of `Concealable` subkey instances
 * and an [`Immutable.List`](https://facebook.github.io/immutable-js/)
 * of user id {strings}.
 *
 * @generic P extends {Publishable},
 * the public component of this {Lockable}
 *
 * @see {Concealable}
 */
export interface Belongings {
  /**
   * @public
   * list of private subkey instances of this {Extendable}
   */
  keys: FList<SecKey>
  /**
   * @public
   * ordered list of openpgp user ids,
   * starting with the primary user id.
   */
  userids: FList<string>
}

export interface SecAuthKey extends Lockable, Signable {
  /**
   * @public
   * public component of this {Lockable}
   */
	publicKey: PubAuthKey
}

export interface SecCodeKey extends Lockable, Decodable {
  /**
   * @public
   * public component of this {Lockable}
   */
	publicKey: PubCodeKey
}

export interface SecUniKey extends Lockable, Decodable, Signable {
  /**
   * @public
   * public component of this {Lockable}
   */
	publicKey: PubUniKey
}

export interface PubAuthKey extends Exposable, Verifiable {}

export interface PubCodeKey extends Exposable, Encodable {}

export interface PubUniKey extends Exposable, Encodable, Verifiable {}

/**
 * @public
 * Instances of the `Lockable` interface may be locked and unlocked
 * with a secret passphrase.
 * This interface exposes [`Lockable#lock`](#api.opgp-key.lockable.lock)
 * and [`Lockable#unlock`](#api.opgp-key.lockable.unlock) methods.
 *
 * More specifically, locking a `Lockable` instance is simply encrypting it
 * with a secret passphrase, while unlocking a locked `Lockable` instance
 * is decrypting it with the passphrase that was used to lock it.
 *
 * This functionality is provided by
 * [openpgp](https://openpgpjs.org/openpgpjs/doc/module-openpgp.html)
 * in the [openpgp](https://openpgpjs.org) worker.
 *
 * Since they mutate the state of the underlying [openpgp](https://openpgpjs.org)
 * key in a security-critical way,
 * the [`Lockable#lock`](#api.opgp-key.lockable.lock)
 * and [`Lockable#unlock`](#api.opgp-key.lockable.unlock) methods
 * return a new immutable [`Concealable`](#api.opgp-key.concealable) instance.
 *
 * Furthermore, the [`Lockable#lock`](#api.opgp-key.lockable.lock) method
 * immediately invalidates its [`Concealable`](#api.opgp-key.concealable) instance,
 * which then becomes permanently stale.
 *
 * Finally, the current state of a `Lockable` instance is exposed
 * by its `isLocked` property.
 *
 * @see {Lockable#lock}
 * @see {Lockable#unlock}
 */
export interface Lockable extends Exposable {
  /**
   * @public
   * @param  {string} secret passphrase
   * @returns {Promise<this>} new passphrase-protected instance
   */
	lock (secret: string, opts?: LockOpts): Promise<this>
  /**
   * @public
   * @param  {string} secret passphrase
   * @returns {Promise<this>} new instance without passphrase protection
   */
	unlock (secret: string, opts?: UnlockOpts): Promise<this>
  /**
   * @public
   * @type {boolean} true if this {Lockable} is locked
   */
  isLocked: boolean
}

export interface LockOpts {
  invalidate: boolean // = true
}

export interface UnlockOpts {
  autolock: number // = OpgpProxy.config.autolock
}

/**
 * @public
 * public authenticity verification key interface
 */
export interface Verifiable {
  /**
   * @public
   * @param  {string} src
   * @returns {Promise<string>} extracted text, without signature.
   */
	verify (src: string, opts?: VerifyOpts): Promise<string>
}

/**
 * ignored in current implementation
 */
export interface VerifyOpts {}

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
	encode (src: string, opts?: EncodeOpts): Promise<string>
}

/**
 * optional settings for {Encodable#encode}
 */
export interface EncodeOpts {
  /**
   * Encrypt-then-MAC when true.
   * Otherwise force openpgp Mac-then-Encrypt.
   * default: true
   */
  etm?: boolean
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
	sign (src: string, opts?: SignOpts): Promise<string>
}

/**
 * ignored in current implementation
 */
export interface SignOpts {}

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
	decode (src: string, opts?: DecodeOpts): Promise<string>
}

/**
 * ignored in current implementation
 */
export interface DecodeOpts {}

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

class ExposableKeyClass implements Exposable {
  /**
   * @public
   * @see OpgpKeyFactory
   */
  static getInstance (spec: OpgpKeySpec): Promise<OpgpKey> {
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
    // TODO
    Object.defineProperties(this, {
      id: { value: spec.id, enumerable: true },
      fingerprint: { value: spec.fingerprint, enumerable: true },
      expiry: { value: spec.expiry, enumerable: true },
      armor: { value: spec.armor, enumerable: false },
      hash: { value: spec.hash, enumerable: false },
      _handle: { value: spec.handle, enumerable: false },
    })
  }

  /**
   * @protected
   * @immutable
   * @enumerable false
   * temporary secret handle for this {OpgpKey}.
   */
  protected _handle : string
}

class PubAuthKeyClass extends ExposableKeyClass implements PubAuthKey {
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

fixSubclass(PubAuthKeyClass)

class PubCodingKeyClass extends ExposableKeyClass implements PubCodeKey {
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

fixSubclass(PubCodingKeyClass)

class PubUniKeyClass extends ExposableKeyClass implements PubUniKey {
  /**
   * @param  {any} key
   * @returns boolean true if {this} is a universal key
   */
  static isUniversalKey (key: any): boolean {
    if (key && (key.publicKey instanceof ExposableKeyClass)) {
      return PubUniKeyClass.isUniversalKey(key.publicKey)
    }
    return (key && (key instanceof PubUniKeyClass))
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

fixSubclass(PubUniKeyClass)

mixin (PubUniKeyClass, PubAuthKeyClass, PubCodingKeyClass)

class LockableKeyClass extends ExposableKeyClass implements Lockable {
  /**
   * @public
   * @see Lockable#lock
   */
	lock (secret: string): Promise<this> {
		return // TODO
	}

  /**
   * @public
   * @see Lockable#unlock
   */
	unlock (secret: string): Promise<this> {
		return // TODO
	}

  /**
   * @public
   * @see Lockable#islocked
   */
	isLocked: boolean

  constructor (spec: LockableKeySpec) {
    super(spec)
  }
}

fixSubclass(LockableKeyClass)

class SecAuthKeyClass extends LockableKeyClass implements SecAuthKey {
  /**
   * @public
   * @see Signable#sign
   */
	sign (src: string): Promise<string> {
		return // TODO
	}

  publicKey: PubAuthKey

	constructor (spec: LockableKeySpec) {
		super(spec)
    const publicKey = ExposableKeyClass.getInstance(spec.publicKey)
    Object.defineProperties(this, {
      publicKey: { value: publicKey, enumerable: true },
      isLocked: { value: spec.isLocked, enumerable: false }
    })
	}
}

fixSubclass(SecAuthKeyClass)

class SecCodingKeyClass extends LockableKeyClass implements SecCodeKey {
  /**
   * @public
   * @see Decodable#decode
   */
	decode (src: string): Promise<string> {
		return // TODO
	}

  publicKey: PubCodeKey

	constructor (spec: LockableKeySpec) {
		super(spec)
    const publicKey = ExposableKeyClass.getInstance(spec.publicKey)
    Object.defineProperties(this, {
      publicKey: { value: publicKey, enumerable: true },
      isLocked: { value: spec.isLocked, enumerable: false }
    })
	}
}

fixSubclass(SecCodingKeyClass)

class SecUniKeyClass extends LockableKeyClass implements SecUniKey {
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

  publicKey: PubUniKey

	constructor (spec: LockableKeySpec) {
		super(spec)
    const publicKey = ExposableKeyClass.getInstance(spec.publicKey)
    Object.defineProperties(this, {
      publicKey: { value: publicKey, enumerable: true },
      isLocked: { value: spec.isLocked, enumerable: false }
    })
	}
}

fixSubclass(SecUniKeyClass)

mixin(SecUniKeyClass, SecAuthKeyClass, SecCodingKeyClass)

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
  isSecKey : boolean

  /**
   * @private
   * {this is EncodingOpgpKey | DecodingOpgpKey}
   */
  isCodeKey : boolean

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

interface LockableKeySpec extends PublishableKeySpec {
  publicKey: PublishableKeySpec,
  isLocked: boolean
}

/**
 * @public
 * @see OpgpKeyFactory
 */
export const getOpgpKey: OpgpKeyFactory = ExposableKeyClass.getInstance