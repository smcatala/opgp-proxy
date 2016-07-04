# opgp-proxy
[![build status](https://travis-ci.org/ZenyWay/opgp-proxy.svg?branch=master)](https://travis-ci.org/ZenyWay/opgp-proxy)
[![Join the chat at https://gitter.im/ZenyWay/opgp-proxy](https://badges.gitter.im/ZenyWay/opgp-proxy.svg)](https://gitter.im/ZenyWay/opgp-proxy?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

abstracting proxy for an [openpgp](https://openpgpjs.org/) instance, isolated
in a web worker.
cryptographic material never leaves the worker thread,
is only temporarily instantiated,
and is abstracted as temporarily valid immutable instances in the main thread.

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
sync |`Error`|'initialization failure'|N/A|fail to initialize [openpgp](https://openpgpjs.org/) worker

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
async|`Error`|'invalid armor'|N/A|fail to parse armor string

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
  encode (src: string): Promise<string>
  decode (src: string): Promise<string>
  sign (src: string): Promise<string>
  verify (src: string): Promise<string>
}
```

##  <a name="api.opgpkeyring.encode"></a> method `OpgpKeyring#encode`
### description
Encrypt-then-MAC Authenticated Encryption.

Encodes the given `src` text
with all public encryption [`OpgpKey`](#api.opgpkey) instances
in this [`OpgpKeyring`](#api.opgpkey) instance.

If any private signing [`OpgpKey`](#api.opgpkey) instances
are bundled in this [`OpgpKeyring`](#api.opgpkey) instance,
then the encoded text is additionally authenticated with these keys.

### syntax
```javascript
encode (src: string): Promise<string>
```

##  <a name="api.opgpkeyring.decode"></a> method `OpgpKeyring#decode`
### description
If any public signing [`OpgpKey`](#api.opgpkey) instances
are bundled in this [`OpgpKeyring`](#api.opgpkey) instance,
then the authenticity of the `src` text is first verified with these keys.

Only following successful authenticity validation, is the given `src` text decoded
with the private encryption [`OpgpKey`](#api.opgpkey) instance
in this [`OpgpKeyring`](#api.opgpkey) instance.

### syntax
```javascript
decode (src: string): Promise<string>
```

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
async|`OpgpError`|'verification failure; data: '|`Array<OpgpKey>` instances for which authenticity verification failed.

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
