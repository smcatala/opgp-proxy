# opgp-proxy
[![build status](https://travis-ci.org/ZenyWay/opgp-proxy.svg?branch=master)](https://travis-ci.org/ZenyWay/opgp-proxy)
[![Join the chat at https://gitter.im/ZenyWay/opgp-proxy](https://badges.gitter.im/ZenyWay/opgp-proxy.svg)](https://gitter.im/ZenyWay/opgp-proxy?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

abstracting proxy for an [openpgp](https://openpgpjs.org/) instance, isolated
in a web worker, with the following features:
* simple API based on keys.
* hermetic container for cryptographic material.
sensitive key content remains contained and never leaves the worker thread.
* key instances are immutable and ephemeral.

In addition to its simple API,
the proxy ensures that key material is well contained
and does not leak throughout client code.
Key ephemerality and immutability further enhance the robustness of the API.

# <a name="api"></a> API v0.0.1 experimental
Typescript compatible.

Note that in its current implementation,
only a subset of the [openpgp](https://openpgpjs.org/) functionality
is exposed by the opgp-proxy.

The foundation of the API are the [`OpgpKey`](#api.opgpkey)
cryptographic keys.
These keys can be bundled into [`OpgpKeyring`](#api.opgpkey) maps.

Both [`OpgpKeyring`](#api.opgpkey) and
[`OpgpKey`](#api.opgpkey) instances
expose the main cryptographic methods to process `string` text:
* encode
* decode
* authenticate
* verify authenticity

## <a name="api.opgp-proxy"></a> module `opgp-proxy`
### exports
* [`fromArmor`](#api.fromArmor)
* [`OpgpKeyring`](#api.opgpkeyring)
* [`OpgpKey`](#api.opgpkey)

### errors
flow | type | message | data | reason
-----|------|---------|------|-------
sync |`Error`|initialization failure|N/A|fail to initialize [openpgp](https://openpgpjs.org/) worker

### example
```javascript
import * as opgpkeys from 'opgp-proxy'
```

## <a name="api.fromArmor"></a> factory `fromArmor`
### description
imports [`OpgpKey`](#api.opgpkey) instances
from an armored `string` into
a new [`OpgpKeyring`](#api.opgpkey) instance.

### syntax
```javascript
static fromArmor (armor: string): Promise<OpgpKeyring>
```

### errors
flow | type | message | data | reason
-----|------|---------|------|-------
async|`Error`|parse error|N/A|fail to parse input string

### example
```javascript
const armor = '-----BEGIN PGP PUBLIC KEY BLOCK... END PGP PUBLIC KEY BLOCK-----'
const keys = opgpkeys.fromArmor(armor)
```

##  <a name="api.opgpkeyring"></a> interface `OpgpKeyring`
### description
Essentially a `Map` of primary-key fingerprint `string`
to [`OpgpKey`](#api.opgpkey) instance
additionally exposing the following methods:
* [encode](#api.opgpkeyring.encode)
* [decode](#api.opgpkeyring.decode)
* [sign](#api.opgpkeyring.sign)
* [verify](#api.opgpkeyring.verify)

### syntax
```javascript
interface OpgpKeyring extends Map<string,OpgpKey> {
  encode (src: string, opts?: EncodeOpts): Promise<string>
  decode (src: string, opts?: DecodeOpts): Promise<string>
  sign (src: string, opts?: SignOpts): Promise<string>
  verify (src: string, opts?: VerifyOpts): Promise<string>
}
```

##  <a name="api.opgpkeyring.encode"></a> method `OpgpKeyring#encode`
### description
Encrypt-then-MAC Authenticated Encryption,
or optionally standard [openpgp](https://openpgpjs.org/) MAC-then-Encrypt AE.

By default, first encode the given `src` text
with all public encryption [`OpgpKey`](#api.opgpkey) instances
in this [`OpgpKeyring`](#api.opgpkey) instance.

If any private signing [`OpgpKey`](#api.opgpkey) instances
are bundled in this [`OpgpKeyring`](#api.opgpkey) instance,
then the encoded text is additionally authenticated
with these keys. Typically, only one signing key is necessary.

It is possible to optionally restrict encoding and/or signing
to a subset of the encoding and/or signing keys respectively
by providing corresponding lists of OpgpKey.hash reference strings
in `opts.keys`.

At least one public encoding key and one private signing key must be included.
If `strict` mode is disabled, it is possible to encrypt without authenticating,
although this is usually not recommended.

### syntax
```javascript
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
  strict?: boolean}
```

### errors
flow | type | message | data | reason
-----|------|---------|------|-------
async|`Error`|invalid argument|N/A|one or more argument invariants fail, e.g. wrong argument type
async|`Error`|invalid reference|N/A|one or more `OpgpKey.hash` reference strings in `opts.keys.encode` or `opts.keys.sign` do not match any key in this `OpgpKeyring`
async|`Error`|key not found|N/A|this OpgpKeyring does not contain any public encoding OpgpKey instances, or any private signing OpgpKey instances (`opts.strict` is true)
async|`OpgpError`|invalid key: ${data}|`Array<string>` `OpgpKey.hash` strings of invalid `OpgpKey` instances|one or more `OpgpKey` instances in this `OpgpKeyring` are either locked, stale or unknown

##  <a name="api.opgpkeyring.decode"></a> method `OpgpKeyring#decode`
### description
For EtM-AE strings, first verify the authenticity of the `src` string
with all required public verification [`OpgpKey`](#api.opgpkey) instances.
Fail if any required public verification [`OpgpKey`](#api.opgpkey) instances
are missing from this [`OpgpKeyring`](#api.opgpkey) or excluded.
If `strict` mode is disabled, it is possible to limit verification
to all public verification [`OpgpKey`](#api.opgpkey) instances bundled
in this [`OpgpKeyring`](#api.opgpkey) instance if any,
or to a subset defined by a list of `OpgpKey.hash` strings.

If and only if authenticity is successfully verified,
decode the given `src` string with the private encryption
[`OpgpKey`](#api.opgpkey) instance
in this [`OpgpKeyring`](#api.opgpkey) instance,
or with that referenced by a given `OpgpKey.hash` string.

For MtE-AE strings, first decode,
then verify authenticity of the decoded string.

### syntax
```javascript
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
}```

### errors
flow | type | message | data | reason
-----|------|---------|------|-------
async|`Error`|invalid argument|N/A|one or more argument invariants fail, e.g. wrong argument type
async|`Error`|invalid reference|N/A|one or more `OpgpKey.hash` reference strings in `opts.keys.encode` or `opts.keys.sign` do not match any key in this `OpgpKeyring`
async|`Error`|invalid cipher|N/A|fail to decode input
async|`OpgpError`|invalid key: ${data}|`Array<string>` `OpgpKey.hash` strings of invalid `OpgpKey` instances|one or more `OpgpKey` instances in this `OpgpKeyring` are either locked, stale or unknown
async|`OpgpError`|key not found: ${data}|`Array<string>` openpgp id strings of all required private decryption keys if none were found in this OpgpKeyring or included in `opts.keys.decode`
async|`OpgpError`|authentication error: ${data}|`Array<string>` `OpgpKey.hash` strings of `OpgpKey` instances for which authentication fails|one or more `OpgpKey` instances in this `OpgpKeyring` fails authentication

##  <a name="api.opgpkeyring.sign"></a> method `OpgpKeyring#sign`
### description
Authenticates the `src` text with the private signing
[`OpgpKey`](#api.opgpkey) instances
bundled in this [`OpgpKeyring`](#api.opgpkey) instance.

### syntax
```javascript
sign (src: string): Promise<string>
```

##  <a name="api.opgpkeyring.verify"></a> method `OpgpKeyring#verify`
### description
Verifies the authenticity of the `src` text with the public signing
[`OpgpKey`](#api.opgpkey) instances
bundled in this [`OpgpKeyring`](#api.opgpkey) instance.

Returns the `src` string upon successful validation of authenticity.

### syntax
```javascript
verify (src: string): Promise<string>
```

### errors
flow | type | message | data
-----|------|---------|---------
async|`OpgpError`|authentication failure: ${data}|`Array<string>` OpgpKey.hash strings of OpgpKey instances for which authenticity verification failed.

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
