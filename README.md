# opgp-proxy
[![build status](https://travis-ci.org/ZenyWay/opgp-proxy.svg?branch=master)](https://travis-ci.org/ZenyWay/opgp-proxy)
[![Join the chat at https://gitter.im/ZenyWay/opgp-proxy](https://badges.gitter.im/ZenyWay/opgp-proxy.svg)](https://gitter.im/ZenyWay/opgp-proxy?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

abstracting proxy for an [openpgp](https://openpgpjs.org/) instance, isolated
in a web worker, with the following features:
* robust, minimalistic yet flexible API based on keys.
* key instances are immutable and ephemeral.
* hermetic container for cryptographic material.
sensitive key content remains contained and never leaves the worker thread.

In addition to its minimalistic yet flexible API,
the proxy ensures that key material is well contained
and does not leak throughout client code.
Key ephemerality and immutability further enhance the robustness of the API.

# <a name="api"></a> API v0.0.1 experimental
Typescript compatible.

Note that in its current implementation,
only a subset of the [openpgp](https://openpgpjs.org/) functionality
is exposed by the opgp-proxy.

The foundation of the API are the [`OpgpKey`](#api.opgp-key)
cryptographic keys.
These keys can be bundled into [`OpgpKeyring`](#api.opgp-keyring) instances
which expose the bundled keys as an
[`Immutable.Map`](https://facebook.github.io/immutable-js/).

Both [`OpgpKeyring`](#api.opgp-keyring) and
[`OpgpKey`](#api.opgp-key) instances
expose the main cryptographic methods to process `string` text:
* encode
* decode
* sign (authenticate)
* verify (authenticity)

## <a name="api.opgp-proxy-module"></a> module `opgp-proxy`
### description
exports a default [`OpgpProxyFactory`](#api.opgp-proxy-factory).

### example
```typescript
import getOpgpProxy from 'opgp-proxy'
```

## <a name="api.opgp-proxy-factory"></a> static factory `getOpgpProxy`
### description
Spawn and initialize an [openpgp](https://openpgpjs.org/) worker,
and return an immutable [OpgpProxy](#api.opgp-proxy).

This factory's optional `config` argument
allows to configure the [openpgp](https://openpgpjs.org/) worker instance
and the new [OpgpProxy](#api.opgp-proxy) instance.


### syntax
```typescript
export interface OpgpProxyFactory {
  (config?: OpgpProxyConfig): Promise<OpgpProxy>
}

export interface OpgpProxyConfig {
  // TODO
}
```

### errors
flow | type | message | data | reason
-----|------|---------|------|-------
sync |`Error`|initialization failure|N/A|fail to initialize [openpgp](https://openpgpjs.org/) worker

### example
```typescript
const proxyConfig = {
  // TODO
}
const proxy = getOpgpProxy(proxyConfig)

proxy.then(proxy => /* do something with proxy */})
```

## <a name="api.opgp-proxy"></a> interface `OpgpProxy`
### description
Abstracts the [openpgp](https://openpgpjs.org/) worker functionality
into [`OpgpKeyring`](#api.opgp-keyring) bundles of
[`OpgpKey`](#api.opgp-key) instances.

Both [`OpgpKeyring`](#api.opgp-keyring) and [`OpgpKey`](#api.opgp-key) instances
are immutable. [`OpgpKey`](#api.opgp-key) instances are additionally ephemeral.

* [`getKeysFromArmor`](#api.opgp-proxy.get-keys-from-armor)
* [`getKeysFromMap`](#api.opgp-proxy.get-keys-from-map)
* [`terminate`](#api.opgp-proxy.terminate)
* [`OpgpKeyring`](#api.opgp-keyring)
* [`OpgpKey`](#api.opgp-key)

### syntax
```typescript
export interface OpgpProxy {
  getKeysFromArmor (armor: string, opts?: OpgpKeyringOpts): Promise<OpgpKeyring>

  getKeysFromMap (map: Map<string,OpgpKey>|FMap<string,OpgpKey>, opts?: OpgpKeyringOpts):
  OpgpKeyring

  terminate (): void
}
```

## <a name="api.opgp-proxy.get-key-from-armor"></a> factory method `getKeysFromArmor`
### description
import [`OpgpKey`](#api.opgp-key) instances
from an armored [openpgp](https://openpgpjs.org/) `string`
as a new or an existing [`OpgpKeyring`](#api.opgp-keyring) instance.

### syntax
```typescript
interface OpgpProxy {
  // ...
  getKeysFromArmor (armor: string, opts?: OpgpKeyringOpts): Promise<OpgpKeyring>
}
```

### errors
flow | type | message | data | reason
-----|------|---------|------|-------
async|`Error`|invalid argument|N/A|one or more argument invariants fail, e.g. wrong argument type
async|`Error`|parse error|N/A|fail to parse input string

### example
```typescript
const armor = '-----BEGIN PGP PUBLIC KEY BLOCK... END PGP PUBLIC KEY BLOCK-----'
const keys = proxy.getKeysFromArmor(armor)
keys.then(keys => /* do something with keys */)
```

## <a name="api.opgp-proxy.get-key-from-map"></a> factory method `getKeysFromMap`
### description
import [`OpgpKey`](#api.opgp-key) instances
from an armored [openpgp](https://openpgpjs.org/) `string`
as a new or an existing [`OpgpKeyring`](#api.opgp-keyring) instance.

### syntax
```typescript
interface OpgpProxy {
  // ...
  getKeysFromMap (map: Map<string,OpgpKey>|FMap<string,OpgpKey>,
  opts?: OpgpKeyringOpts): OpgpKeyring
}
```

### errors
flow | type | message | data | reason
-----|------|---------|------|-------
sync|`Error`|invalid argument|N/A|one or more argument invariants fail, e.g. wrong argument type

### example
```typescript
const armor = '-----BEGIN PGP PUBLIC KEY BLOCK... END PGP PUBLIC KEY BLOCK-----'
const keys = proxy.getKeysFromArmor(armor)
keys.then(keys => /* do something with keys */)
```

## <a name="api.opgp-proxy.terminate"></a> method `terminate`
### description
terminate the [openpgp](https://openpgpjs.org/) worker
of this [OpgpProxy](#api.opgp-proxy).

However, as long as this [OpgpProxy](#api.opgp-proxy) instance persists,
any call to one of its methods,
except the [`OpgpProxy#terminate`](api.opgp-proxy.terminate) method,
or to a method of one of the [`OpgpKeyring`](#api.opgp-keyring)
or [`OpgpKey`](#api.opgp-key) instances it has spawned
will restart a new [openpgp](https://openpgpjs.org/) worker.

Note that when a new [openpgp](https://openpgpjs.org/) worker is spawned,
all [`OpgpKey`](#api.opgp-key) instances
from previously terminated [openpgp](https://openpgpjs.org/) workers are stale.

### syntax
```typescript
interface OpgpProxy {
  // ...
  terminate (): void
}
```

### errors
none

##  <a name="api.opgp-keyring"></a> interface `OpgpKeyring`
### description
Essentially wraps an [`Immutable.Map`](https://facebook.github.io/immutable-js/)
of primary-key fingerprint `string` to [`OpgpKey`](#api.opgp-key) instance and
additionally exposes the following methods:
* [encode](#api.opgp-keyring.encode)
* [decode](#api.opgp-keyring.decode)
* [sign](#api.opgp-keyring.sign)
* [verify](#api.opgp-keyring.verify)

The corresponding [`Immutable.Map`](https://facebook.github.io/immutable-js/)
is exposed as a `OpgpProxy.keys`] property.

### syntax
```typescript
interface OpgpKeyring extends Map<string,OpgpKey> {
  encode (src: string, opts?: EncodeOpts): Promise<string>
  decode (src: string, opts?: DecodeOpts): Promise<string>
  sign (src: string, opts?: SignOpts): Promise<string>
  verify (src: string, opts?: VerifyOpts): Promise<string>
  keys: Immutable.Map<string, OpgpKey>
}
```

##  <a name="api.opgp-keyring.encode"></a> method `OpgpKeyring#encode`
### description
Encrypt-then-MAC Authenticated Encryption,
or optionally standard [openpgp](https://openpgpjs.org/) MAC-then-Encrypt AE.

By default, first encode the given `src` text
with all public encryption [`OpgpKey`](#api.opgp-key) instances
in this [`OpgpKeyring`](#api.opgp-keyring) instance.

If any private signing [`OpgpKey`](#api.opgp-key) instances
are bundled in this [`OpgpKeyring`](#api.opgp-keyring) instance,
then the encoded text is additionally authenticated
with these keys. Typically, only one signing key is necessary.

It is possible to optionally restrict encoding and/or signing
to a subset of the encoding and/or signing [`OpgpKey`](#api.opgp-key) instances
respectively by providing corresponding lists
of `OpgpKey.hash` reference strings in `opts.keys`.

At least one public encoding key and one private signing key must be included.
If `strict` mode is disabled, it is possible to encrypt without authenticating,
although this is usually not recommended.

### syntax
```typescript
encode (src: string, opts?: EncodeOpts): Promise<string>

interface EncodeOpts {
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
```

### errors
flow | type | message | data | reason
-----|------|---------|------|-------
async|`Error`|invalid argument|N/A|one or more argument invariants fail, e.g. wrong argument type
async|`Error`|invalid reference|N/A|one or more `OpgpKey.hash` reference strings in `opts.keys.encode` or `opts.keys.sign` do not match any key in this `OpgpKeyring`
async|`Error`|encode error|N/A|this OpgpKeyring does not contain any public encoding OpgpKey instances
async|`Error`|sign error|N/A|`opts.strict` is true and this OpgpKeyring does not contain any private signing OpgpKey instances
async|`OpgpError`|invalid key: ${data}|`Array<string>` `OpgpKey.hash` strings of invalid `OpgpKey` instances|one or more `OpgpKey` instances in this `OpgpKeyring` are either locked, stale or unknown

##  <a name="api.opgp-keyring.decode"></a> method `OpgpKeyring#decode`
### description
For EtM-AE strings, first verify the authenticity of the `src` string
with all required public verification [`OpgpKey`](#api.opgp-key) instances.
Fail if any required public verification [`OpgpKey`](#api.opgp-key) instances
are missing from this [`OpgpKeyring`](#api.opgp-keyring)
or excluded from the list of `OpgpKey.hash` reference strings
in `opts.keys.verify`.

If `strict` mode is disabled, it is possible to limit verification
to all public verification [`OpgpKey`](#api.opgp-key) instances bundled
in this [`OpgpKeyring`](#api.opgp-keyring) instance if any,
or to a subset defined by a list of `OpgpKey.hash` reference strings
in `opts.keys.verify`.

If and only if authenticity is successfully verified,
decode the given `src` string with the private encryption
[`OpgpKey`](#api.opgp-key) instance
in this [`OpgpKeyring`](#api.opgp-keyring) instance,
or with that referenced by a `OpgpKey.hash` reference string
defined in `opts.keys.verify`.

For MtE-AE strings, first decode,
then verify authenticity of the decoded string.

### syntax
```typescript
decode (src: string, opts?: DecodeOpts): Promise<string>

interface DecodeOpts {
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
```

### errors
flow | type | message | data | reason
-----|------|---------|------|-------
async|`Error`|invalid argument|N/A|one or more argument invariants fail, e.g. wrong argument type
async|`Error`|invalid reference|N/A|one or more `OpgpKey.hash` reference strings in `opts.keys.decode` or `opts.keys.verify` do not match any key in this `OpgpKeyring`
async|`Error`|unknkown cipher|N/A|cipher not supported, or no cipher, or unknown cipher format
async|`OpgpError`|invalid key: ${data}|`Array<string>` `OpgpKey.hash` strings of invalid `OpgpKey` instances|one or more `OpgpKey` instances in this `OpgpKeyring` are either locked, stale or unknown
async|`OpgpError`|decode error: ${data}|`Array<string>` openpgp id strings of all required private decryption keys|none of the required private decryption keys were found in this OpgpKeyring or in `opts.keys.decode`
async|`OpgpError`|verify error: ${data}|`Array<string>` openpgp id strings of all keys for which authentication fails|authenticity verification fails with one or more `OpgpKey` instances in this `OpgpKeyring`, or `opts.strict` is true and one or more required keys were not found

##  <a name="api.opgp-keyring.sign"></a> method `OpgpKeyring#sign`
### description
Authenticate the `src` text with the private signing
[`OpgpKey`](#api.opgp-key) instances
bundled in this [`OpgpKeyring`](#api.opgp-keyring) instance.
Typically, only one signing key is necessary.

It is possible to optionally restrict signing
to a subset of the private signing [`OpgpKey`](#api.opgp-key) instances
by providing a corresponding list of `OpgpKey.hash` reference strings
in `opts.keys.sign`.

At least one public encoding key and one private signing key must be included.

### syntax
```typescript
sign (src: string, opts?: SignOpts): Promise<string>

interface SignOpts {
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
```

### errors
flow | type | message | data | reason
-----|------|---------|------|-------
async|`Error`|invalid argument|N/A|one or more argument invariants fail, e.g. wrong argument type
async|`Error`|invalid reference|N/A|one or more `OpgpKey.hash` reference strings in `opts.keys.sign` do not match any key in this `OpgpKeyring`
async|`Error`|sign error|N/A|this OpgpKeyring does not contain any private signing OpgpKey instances
async|`OpgpError`|invalid key: ${data}|`Array<string>` `OpgpKey.hash` strings of invalid `OpgpKey` instances|one or more `OpgpKey` instances in this `OpgpKeyring` are either locked, stale or unknown

##  <a name="api.opgp-keyring.verify"></a> method `OpgpKeyring#verify`
### description
Verify the authenticity of the `src` string
with all required public verification [`OpgpKey`](#api.opgp-key) instances.
Fail if any required public verification [`OpgpKey`](#api.opgp-key) instances
are missing from this [`OpgpKeyring`](#api.opgp-keyring)
or excluded from `opts.keys.verify`.

If `strict` mode is disabled, it is possible to limit verification
to all public verification [`OpgpKey`](#api.opgp-key) instances bundled
in this [`OpgpKeyring`](#api.opgp-keyring) instance if any,
or to a subset defined by a list of `OpgpKey.hash` strings.

Returns the `src` string upon successful validation of authenticity.

### syntax
```typescript
verify (src: string, opts?: VerifyOpts): Promise<string>

interface VerifyOpts {
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
```

### errors
flow | type | message | data
-----|------|---------|---------
async|`Error`|invalid argument|N/A|one or more argument invariants fail, e.g. wrong argument type
async|`Error`|invalid reference|N/A|one or more `OpgpKey.hash` reference strings in `opts.keys.decode` or `opts.keys.verify` do not match any key in this `OpgpKeyring`
async|`OpgpError`|invalid key: ${data}|`Array<string>` `OpgpKey.hash` strings of invalid `OpgpKey` instances|one or more `OpgpKey` instances in this `OpgpKeyring` are either locked, stale or unknown
async|`OpgpError`|verify error: ${data}|`Array<string>` openpgp id strings of all keys for which authentication fails|authenticity verification fails with one or more `OpgpKey` instances in this `OpgpKeyring`, or `opts.strict` is true and one or more required keys were not found

##  <a name="api.opgp-key"></a> type alias `OpgpKey`
### description
The `OpgpKey` type alias represents immutable and ephemeral instances
that abstract key material from the [openpgp](https://openpgpjs.org/) worker.
* the sensitive cryptographic key material remains well contained
in the [openpgp](https://openpgpjs.org/) worker,
and is not included in the internals of, or exposed by `OpgpKey` instances.
* `OpgpKey` instances are immutable
* `OpgpKey` instances are ephemeral:
they become stale if none of their methods are called
for a defined length of time,
or if the [openpgp](https://openpgpjs.org/) worker is terminated.

A stale `OpgpKey` is permanently detached from the key material
it represented in the [openpgp](https://openpgpjs.org/) worker,
allowing for the corresponding worker-side key instance
to eventually be garbage collected.
A new `OpgpKey` instance may readily be created from a stale instance,
e.g. from the latter's `OpgpKey.armor` string,
however, in case of private keys,
the new instance will always be locked by default,
regardless of whether the stale instance had been unlocked or not.

The `OpgpKey` type alias is a union of the following:
* [`Publishable`](#api.opgp-key.publishable) type alias
that represents public keys
* [`Concealable<Publishable>`](#api.opgp-key.concealable) interface
that represents private keys

In other words, the `OpgpKey` type alias represents either
a public, or a private key.

### syntax
```typescript
type OpgpKey = Publishable | Concealable<Publishable>
```

##  <a name="api.opgp-key.publishable"></a> type alias `Publishable`
### description
The `Publishable` type alias represents public key instances.

More specifically, these are [`Exposable`](#api.opgp-key.exposable) instances
that are either [`Encodable`](#api.opgp-key.encodable),
or [`Verifiable`](#api.opgp-key.verifiable),
or both.

In other words, `Publishable` instances expose properties about the key
through the [`Exposable`](#api.opgp-key.exposable) interface,
as well as [`Encodable#encode`](#api.opgp-key.encodable.encode)
and/or [`Verifiable#verify`](#api.opgp-key.verifiable.verify) methods
through the [`Encodable`](#api.opgp-key.encodable)
and [`Verifiable`](#api.opgp-key.verifiable) interfaces respectively.

### syntax
```typescript
type Publishable =
Exposable & (Encodable | Verifiable | (Encodable & Verifiable))
```

##  <a name="api.opgp-key.concealable"></a> interface `Concealable<P extends Publishable>`
### description
The `Concealable` interface represents private key instances.

More specifically, these are [`Exposable`](#api.opgp-key.exposable) instances
that are additionally [`Lockable`](#api.opgp-key.lockable).

In other words, `Concealable` instances expose properties about the key
through the [`Exposable`](#api.opgp-key.exposable) interface,
as well as [`Lockable#lock`](#api.opgp-key.lockable.lock)
and [`Lockable#unlock`](#api.opgp-key.lockable.unlock) methods
through the [`Lockable`](#api.opgp-key.lockable) interface.

Additionally, `Concealable` instances also expose
a `Concealable#publicKey` property holding
their [`Publishable`](#api.opgp-key.publishable) public key component.
The type of that [`Publishable`](#api.opgp-key.publishable)
defines that of the `Concealable`,
and is hence the generic type parameter of the `Concealable`.

The more specialised [`RootConcealable`](#api.opgp-key.root-concealable)
interface, that extends the `Concealable` interface, represents primary keys,
which additionally expose subkeys and owner information.

### syntax
```typescript
interface Concealable<P extends Publishable> extends Exposable, Lockable {
	publicKey: P
}
```

##  <a name="api.opgp-key.root-concealable"></a> interface `RootConcealable<P extends Publishable>`
### description
The `RootConcealable` interface represents intances of primary keys.

More specifically, these are [`Concealable`](#api.opgp-key.concealable)
instances that additionally expose
an [`Immutable.List`](https://facebook.github.io/immutable-js/)
of [`Concealable`](#api.opgp-key.concealable) subkey instances
and an [`Immutable.List`](https://facebook.github.io/immutable-js/)
of user id strings.

### syntax
```typescript
export interface RootConcealable<P extends Publishable> extends Concealable<P> {
  keys: Immutable.List<Concealable<Publishable>>
  userids: Immutable.List<string>
}
```

##  <a name="api.opgp-key.lockable"></a> interface `Lockable`
### description
Instances of the `Lockable` interface may be locked and unlocked
with a secret passphrase.
[`Concealable`](#api.opgp-key.concealable) instances are specialized
`Lockable` instances.

This interface exposes [`Lockable#lock`](#api.opgp-key.lockable.lock)
and [`Lockable#unlock`](#api.opgp-key.lockable.unlock) methods.

More specifically, locking a `Lockable` instance is simply encrypting it
with a secret passphrase, while unlocking a locked `Lockable` instance
is decrypting it with the passphrase that was used to lock it.

This functionality is provided by
[openpgp](https://openpgpjs.org/openpgpjs/doc/module-openpgp.html)
in the [openpgp](https://openpgpjs.org) worker.

Since they mutate the state of the underlying [openpgp](https://openpgpjs.org)
key in a security-critical way,
the [`Lockable#lock`](#api.opgp-key.lockable.lock)
and [`Lockable#unlock`](#api.opgp-key.lockable.unlock) methods
return a new immutable [`Concealable`](#api.opgp-key.concealable) instance.

Furthermore, the [`Lockable#lock`](#api.opgp-key.lockable.lock) method
immediately invalidates its `Lockable` instance,
which then becomes permanently stale.

Finally, the immutable state of a `Lockable` instance is exposed
by its `isLocked` property.

### syntax
```typescript
interface Lockable {
	lock (): Promise<this>
	unlock (): Promise<this>
  isLocked: boolean
}
```

##  <a name="api.opgp-key.exposable"></a> interface `Exposable`
### description
Instances of the `Exposable` interface expose public information about these.
All [`OpgpKey`](#api.opgp-key) instances are `Exposable`.

### syntax
```typescript
interface Exposable extends Identifiable {
  toString (): string
  isPrivateKey <P extends Exposable>(): this is Concealable<P>
  isCodingKey (): this is Encodable | Decodable
  isAuthKey (): this is Signable | Verifiable
  hash: string
  id: string
  fingerprint: string
  armor: string
  expiry: number
}
```

##  <a name="api.opgp-key"></a> interface `OpgpKey`
### description

### syntax
```typescript

```

### errors
flow | type | message | data
-----|------|---------|---------

# <a name="license"></a> LICENSE
Copyright 2016 Stéphane M. Catala

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the [License](./LICENSE) for the specific language governing permissions and
Limitations under the License.
