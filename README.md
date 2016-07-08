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

The `OpgpKey` type alias is a type union of the following type aliases:
* [`PubKey`](#api.opgp-key.pub-key) type alias
that represents public keys
* [`SecKey`](#api.opgp-key.sec-key) type alias
that represents private keys
* [`RootKey`](#api.opgp-key.root-key) type alias
that represents primary keys,
a special type of [`SecKey`](#api.opgp-key.sec-key)

In other words, the `OpgpKey` type alias represents either
a public, private, or primary key.

All `OpgpKey` instances extend the [`Exposable`] interface,
which exposes public information about the key.

### syntax
```typescript
type OpgpKey = RootKey | SecKey | PubKey
```

##  <a name="api.opgp-key.exposable"></a> interface `Exposable`
### description
Instances of the `Exposable` interface expose public information about these.
All [`OpgpKey`](#api.opgp-key) instances are `Exposable`.

### syntax
```typescript
interface Exposable extends Identifiable {
  toString (): string
  hash: string
  id: string
  fingerprint: string
  armor: string
  expiry: number
}
```

##  <a name="api.opgp-key.pub-key"></a> type alias `PubKey`
### description
The `PubKey` type alias represents public key instances.

More specifically, the `PubKey` type alias is a type union
of the following interfaces:
* [`PubAuthKey`](api.opgp-key.pub-auth-key) interface
that represents public authentication keys for verifying signatures
* [`PubCodeKey`](api.opgp-key.pub-code-key) interface
that represents public coding keys for encoding a text
* [`PubUniKey`](api.opgp-key.pub-uni-key) interface
that represents public universal keys for both
verifying signatures and encoding text

### syntax
```typescript
type PubKey = PubAuthKey | PubCodeKey | PubUniKey
```

##  <a name="api.opgp-key.pub-auth-key"></a> type alias `PubAuthKey`
### description
The `PubAuthKey` interface represents public authentication keys
for verifying signatures,
with the [`Verifiable#verify`](#api.opgp-key.verifiable.verify) method
from the [`Verifiable`](#api.opgp-key.verifiable) interface.

Like all other [`OpgpKey`](#api.opgp-key) types,
`PubAuthKey` instances also expose public information about the key
through the [`Exposable`] interface.

### syntax
```typescript
interface PubAuthKey extends Exposable, Verifiable {}
```

##  <a name="api.opgp-key.pub-code-key"></a> type alias `PubCodeKey`
### description
The `PubCodeKey` interface represents public coding keys
for encoding a text,
with the [`Encodable#encode`](#api.opgp-key.encodable.encode) method
from the [`Encodable`](#api.opgp-key.encodable) interface.

Like all other [`OpgpKey`](#api.opgp-key) types,
`PubCodeKey` instances also expose public information about the key
through the [`Exposable`] interface.

### syntax
```typescript
interface PubCodeKey extends Exposable, Encodable {}
```

##  <a name="api.opgp-key.pub-uni-key"></a> type alias `PubUniKey`
### description
The `PubUniKey` interface represents public universal keys
for both verifying signatures and encoding a text,
* with the [`Verifiable#verify`](#api.opgp-key.verifiable.verify) method
from the [`Verifiable`](#api.opgp-key.verifiable) interface, and
* with the [`Encodable#verify`](#api.opgp-key.encodable.encode) method
from the [`Encodable`](#api.opgp-key.encodable) interface.

Like all other [`OpgpKey`](#api.opgp-key) types,
`PubUniKey` instances also expose public information about the key
through the [`Exposable`] interface.

### syntax
```typescript
interface PubUniKey extends Exposable, Encodable, Verifiable {}
```

##  <a name="api.opgp-key.sec-key"></a> type alias `SecKey`
### description
The `SecKey` type alias represents secret key instances.

More specifically, the `SecKey` type alias is a type union
of the following interfaces:
* [`SecAuthKey`](api.opgp-key.sec-auth-key) interface
that represents private authentication keys for signing a text
* [`SecCodeKey`](api.opgp-key.sec-code-key) interface
that represents private coding keys for decoding a text
* [`SecUniKey`](api.opgp-key.sec-uni-key) interface
that represents private universal keys for both
signing and decoding a text

All `SecKey` instances expose
* [`Lockable#lock`](#api.opgp-key.lockable.lock) and
[`Lockable#unlock`](#api.opgp-key.lockable.unlock) methods,
and an [`Lockable#isLocked`](#api.opgp-key.lockable) property
through the [`Lockable`](#api.opgp-key.lockable) interface
to respectively lock and unlock the key with a secret passphrase,
and to obtain the status of the key,
* a `publicKey` property with their `PubKey` public key component.

Like all other [`OpgpKey`](#api.opgp-key) types,
`SecAuthKey` instances also expose public information about the key
through the [`Exposable`] interface.

A specialized `SecKey` type is the [`RootKey`](#api.opgp-key.root-key) type,
which represents primary keys, that bundle `SecKey` subkeys and user id strings.

##  <a name="api.opgp-key.sec-auth-key"></a> type alias `SecAuthKey`
### description
The `SecAuthKey` interface represents private authentication keys
for signing a text,
with the [`Signable#sign`](#api.opgp-key.signable.sign) method
from the [`Signable`](#api.opgp-key.signable) interface.

Like all other [`SecKey`](#api.opgp-key.sec-key) intances,
`SecAuthKey` instances expose
* [`Lockable#lock`](#api.opgp-key.lockable.lock) and
[`Lockable#unlock`](#api.opgp-key.lockable.unlock) methods
and an [`Lockable#isLocked`](#api.opgp-key.lockable) property
through the [`Lockable`](#api.opgp-key.lockable) interface
to respectively lock and unlock the key with a secret passphrase,
and to obtain the status of the key,
* a `publicKey` property with their `PubAuthKey` public key component.

Like all other [`OpgpKey`](#api.opgp-key) types,
`SecAuthKey` instances also expose public information about the key
through the [`Exposable`] interface.

### syntax
```typescript
interface SecAuthKey extends Lockable, Signable {
	publicKey: PubAuthKey
}
```

##  <a name="api.opgp-key.sec-code-key"></a> type alias `SecCodeKey`
### description
The `SecCodeKey` interface represents private coding keys
for decoding a text,
with the [`Decodable#decode`](#api.opgp-key.decodable.decode) method
from the [`Decodable`](#api.opgp-key.decodable) interface.

Like all other [`SecKey`](#api.opgp-key.sec-key) intances,
`SecCodeKey` instances expose
* [`Lockable#lock`](#api.opgp-key.lockable.lock) and
[`Lockable#unlock`](#api.opgp-key.lockable.unlock) methods
and an [`Lockable#isLocked`](#api.opgp-key.lockable) property
through the [`Lockable`](#api.opgp-key.lockable) interface
to respectively lock and unlock the key with a secret passphrase,
and to obtain the status of the key,
* a `publicKey` property with their `PubCodeKey` public key component.

Like all other [`OpgpKey`](#api.opgp-key) types,
`SecCodeKey` instances also expose public information about the key
through the [`Exposable`] interface.

### syntax
```typescript
interface SecCodeKey extends Lockable, Decodable {
	publicKey: PubCodeKey
}
```

##  <a name="api.opgp-key.sec-code-key"></a> type alias `SecCodeKey`
### description
The `SecUniKey` interface represents private universal keys
for both signing and decoding a text,
* with the [`Signable#sign`](#api.opgp-key.signable.sign) method
from the [`Signable`](#api.opgp-key.signable) interface, and
* with the [`Decodable#decode`](#api.opgp-key.decodable.decode) method
from the [`Decodable`](#api.opgp-key.decodable) interface.

Like all other [`SecKey`](#api.opgp-key.sec-key) intances,
`SecUniKey` instances expose
* [`Lockable#lock`](#api.opgp-key.lockable.lock) and
[`Lockable#unlock`](#api.opgp-key.lockable.unlock) methods
and an [`Lockable#isLocked`](#api.opgp-key.lockable) property
through the [`Lockable`](#api.opgp-key.lockable) interface
to respectively lock and unlock the key with a secret passphrase,
and to obtain the status of the key,
* a `publicKey` property with their `PubUniKey` public key component.

Like all other [`OpgpKey`](#api.opgp-key) types,
`SecUniKey` instances also expose public information about the key
through the [`Exposable`] interface.

### syntax
```typescript
interface SecUniKey extends Lockable, Decodable, Signable {
	publicKey: PubUniKey
}
```

##  <a name="api.opgp-key.lockable"></a> interface `Lockable`
### description
Instances of the `Lockable` interface may be locked and unlocked
with a secret passphrase.

This interface exposes [`Lockable#lock`](#api.opgp-key.lockable.lock)
and [`Lockable#unlock`](#api.opgp-key.lockable.unlock) methods.

More specifically, locking a `Lockable` instance is simply encrypting it
with a secret passphrase, while unlocking a locked `Lockable` instance
is decrypting it with the passphrase that was used to lock it.

All [`SecKey`](#api.opgp-key.sec-key) instances are `Lockable` instances.

This functionality is provided by
[openpgp](https://openpgpjs.org/openpgpjs/doc/module-openpgp.html)
in the [openpgp](https://openpgpjs.org) worker.

Since they mutate the state of the underlying [openpgp](https://openpgpjs.org)
key in a security-critical way,
the [`Lockable#lock`](#api.opgp-key.lockable.lock)
and [`Lockable#unlock`](#api.opgp-key.lockable.unlock) methods
return a new immutable [`SecKey`](#api.opgp-key.sec-key) instance
of the same type.

The [`Lockable#lock`](#api.opgp-key.lockable.lock) method
by default immediately invalidates its `Lockable` instance,
which then becomes permanently stale.
This behavior can be disabled by setting the `opts.invalidate` option
of the [`Lockable#lock`](#api.opgp-key.lockable.lock) method to false.

When a `Lockable` instance is unlocked,
it stays unlocked for a given length of time,
as defined by the `opts.autolock` option
of the [`Lockable#unlock`](#api.opgp-key.lockable.unlock) methods,
after which the instance automatically becomes stale.
The `opts.autolock` option defaults to the default value
of the [`OpgpProxy`](#api.opgp-proxy).

Finally, the immutable state of a `Lockable` instance is exposed
by its `isLocked` property.

### syntax
```typescript
interface Lockable extends Exposable {
	lock (secret: string, opts?: LockOpts): Promise<this>
	unlock (secret: string, opts?: UnlockOpts): Promise<this>
  isLocked: boolean
}

interface LockOpts {
  invalidate: boolean // = true
}

interface UnlockOpts {
  autolock: number // = OpgpProxy.config.autolock
}
```

##  <a name="api.opgp-key.root-key"></a> type alias `RootKey`
### description
The type alias represents primary key instances.

All `RootKey` instances are specialized
[`SecKey`](#api.opgp-key.sec-key) instances.

More specifically, the `RootKey` type alias is a type union
of the following interfaces:
* [`RootAuthKey`](api.opgp-key.root-auth-key) interface
that represents primary authentication keys
and exposes the [`SecAuthKey`](#api.opgp-key.sec-auth-key) interface
* [`RootCodeKey`](api.opgp-key.root-code-key) interface
that represents primary coding keys
and exposes the [`SecCodeKey`](#api.opgp-key.sec-code-key) interface
* [`RootUniKey`](api.opgp-key.root-uni-key) interface
that represents primary universal keys
and exposes the [`SecUniKey`](#api.opgp-key.sec-uni-key) interface

Additionally, all `RootKey` instances expose
the [`Belongings`](#api.opgp-key.belongings) interface, with
* an [`Immutable.List`](https://facebook.github.io/immutable-js/)
of [`SecKey`](#api.opgp-key.sec-key) subkey instances,
* an [`Immutable.List`](https://facebook.github.io/immutable-js/)
of user id strings.

### syntax
```typescript
type RootKey = RootAuthKey | RootCodeKey | RootUniKey
```

##  <a name="api.opgp-key.belongings"></a> interface `Belongings`
### description
The `Belongings` interface exposes two immutable properties:
* an [`Immutable.List`](https://facebook.github.io/immutable-js/)
of [`SecKey`](#api.opgp-key.sec-key) subkey instances,
* an [`Immutable.List`](https://facebook.github.io/immutable-js/)
of user id strings.

All [`RootKey`](#api.opgp-key.root-key) instances
expose the above `Belongings` properties.

### syntax
```typescript
interface Belongings {
  keys: FList<SecKey>
  userids: FList<string>
}
```

##  <a name="api.opgp-key.root-auth-key"></a> interface `RootAuthKey`
### description
The `RootAuthKey` interface represents a primary key
that is itself a secret authentication key for signing texts.

More specifically, the `RootAuthKey` interface exposes both
* the [`SecAuthKey`](#api.opgp-key.sec-auth-key) interface
* the [`Belongings`](#api.opgp-key.belongings) interface,
with an [`Immutable.List`](https://facebook.github.io/immutable-js/)
of [`SecKey`](#api.opgp-key.sec-key) subkey instances,
and an [`Immutable.List`](https://facebook.github.io/immutable-js/)
of user id strings.

### syntax
```typescript
interface RootAuthKey extends SecAuthKey, Belongings {}
```

##  <a name="api.opgp-key.root-code-key"></a> interface `RootCodeKey`
### description
The `RootCodeKey` interface represents a primary key
that is itself a secret authentication key for signing texts.

More specifically, the `RootCodeKey` interface exposes both
* the [`SecCodeKey`](#api.opgp-key.sec-code-key) interface
* the [`Belongings`](#api.opgp-key.belongings) interface,
with an [`Immutable.List`](https://facebook.github.io/immutable-js/)
of [`SecKey`](#api.opgp-key.sec-key) subkey instances,
and an [`Immutable.List`](https://facebook.github.io/immutable-js/)
of user id strings.

### syntax
```typescript
interface RootCodeKey extends SecCodeKey, Belongings {}
```

##  <a name="api.opgp-key.root-auth-key"></a> interface `RootUniKey`
### description
The `RootUniKey` interface represents a primary key
that is itself a secret authentication key for signing texts.

More specifically, the `RootUniKey` interface exposes both
* the [`SecUniKey`](#api.opgp-key.sec-uni-key) interface
* the [`Belongings`](#api.opgp-key.belongings) interface,
with an [`Immutable.List`](https://facebook.github.io/immutable-js/)
of [`SecKey`](#api.opgp-key.sec-key) subkey instances,
and an [`Immutable.List`](https://facebook.github.io/immutable-js/)
of user id strings.

### syntax
```typescript
interface RootUniKey extends SecUniKey, Belongings {}
```

##  <a name="api.opgp-key.verifiable"></a> interface `Verifiable`
### description
The `Verifiable` interface exposes a single `verify` method
for verifying the signature of an armored authenticated `src` string
with this instance of [`PubAuthKey`](#api.opgp-key.pub-auth-key)
or [`PubUniKey`](#api.opgp-key.pub-auth-key).

### syntax
```typescript
export interface Verifiable {
	verify (src: string, opts?: VerifyOpts): Promise<string>
}

export interface VerifyOpts {} // ignored in current implementation
```

##  <a name="api.opgp-key.encodable"></a> interface `Encodable`
### description
The `Encodable` interface exposes a single `encode` method
for encoding a `src` string
with this instance of [`PubCodeKey`](#api.opgp-key.pub-code-key)
or [`PubUniKey`](#api.opgp-key.pub-auth-key).

### syntax
```typescript
interface Encodable {
	encode (src: string, opts?: EncodeOpts): Promise<string>
}

interface EncodeOpts {} // ignored in current implementation
```

##  <a name="api.opgp-key.signable"></a> interface `Signable`
### description
The `Signable` interface exposes a single `sign` method
for signing the `src` string
with this instance of [`SecAuthKey`](#api.opgp-key.sec-auth-key)
or [`SecUniKey`](#api.opgp-key.sec-auth-key).

### syntax
```typescript
interface Signable {
	sign (src: string, opts?: SignOpts): Promise<string>
}

interface SignOpts {} // ignored in current implementation
```

##  <a name="api.opgp-key.decodable"></a> interface `Decodable`
### description
The `Decodable` interface exposes a single `decode` method
for decoding an armored encoded `src` string
with this instance of [`SecCodeKey`](#api.opgp-key.sec-code-key)
or [`SecUniKey`](#api.opgp-key.sec-auth-key).

### syntax
```typescript
interface Decodable {
	decode (src: string, opts?: DecodeOpts): Promise<string>
}

export interface DecodeOpts {} // ignored in current implementation
```

##  <a name="api.opgp-key.verifiable"></a> interface `Verifiable`
### description
The `Verifiable` interface exposes a single `verify` method
for verifying the signature of an armored authenticated `src` string
with this instance of [`PubAuthKey`](#api.opgp-key.pub-auth-key)
or [`PubUniKey`](#api.opgp-key.pub-auth-key).

### syntax
```typescript
  (src: string, opts?: VerifyOpts): Promise<string>
```

#### param `src: string`
armored authenticated string

#### param `opts?: VerifyOpts`
ignored in current implementation

#### return `Promise<string>`
unsigned text extracted from `src`

### errors
flow | type | message | data
-----|------|---------|---------
async|`Error`|invalid argument|N/A|one or more argument invariants fail, e.g. wrong argument type
async|`Error`|invalid key|N/A|this `OpgpKey` is either stale or unknown
async|`Error`|verify error|N/A|the `src` string was not signed with this `OpgpKey`

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
