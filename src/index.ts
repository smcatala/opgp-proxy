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
const workify = require('webworkify') // no typings
import {
  fromArmor,
  fromMap,
  OpgpKeyring,
  OpgpKey
} from './opgpkeyring'

export interface OpgpProxyFactory {
  (config?: OpgpProxyConfig): Promise<OpgpProxy>
}

export interface OpgpProxyConfig {
  // TODO
}

/**
 * @public
 * immutable instance that proxies a worker instance
 * of [openpgp](https://openpgpjs.org/)
 * through a simplified API based on immutable ephemeral {OpgpKey} instances.
 */
export interface OpgpProxy {
  /**
   * @public
   * @factory
   * @param {string} armor [openpgp](https://openpgpjs.org/) armored key string
   * @param  {OpgpKeyringOpts} opts?
   * @returns {Promise<OpgpKeyring>}
   * @error {OpgpError}
   */
  getKeysFromArmor (armor: string, opts?: OpgpKeyringOpts): Promise<OpgpKeyring>
  /**
   * @public
   * @factory
   * @param  {Map<string,OpgpKey>|Immutable.Map<string,OpgpKey>} map
   * standard ES6 Map or
   * [Immutable](https://facebook.github.io/immutable-js/).Map
   * of `OpgpKey.hash` string to OpgpKey
   * @returns {OpgpKeyring}
   */
  getKeysFromMap (map: Map<string,OpgpKey>|FMap<string,OpgpKey>,
  opts?: OpgpKeyringOpts): OpgpKeyring
  /**
   * @public
   * terminate the [openpgp](https://openpgpjs.org/)
   */
  terminate (): void
}

export interface OpgpKeyringOpts {
  // TODO
}

class OpgpProxyClass implements OpgpProxy {
  static getInstance (config: OpgpProxyConfig): Promise<OpgpProxy> {
    return // TODO
  }

  /**
   * @public
   * @see {OpgpProxy#getKeysFromArmor}
   */
  getKeysFromArmor (armor: string, opts?: OpgpKeyringOpts): Promise<OpgpKeyring> {
    return
  }

  /**
   * @public
   * @see {OpgpProxy#getKeysFromMap}
   */
  getKeysFromMap (map: Map<string,OpgpKey>|FMap<string,OpgpKey>,
  opts?: OpgpKeyringOpts): OpgpKeyring {
    return
  }

  /**
   * @public
   * @see {OpgpProxy#terminate}
   */
  terminate (): void {
    // TODO
  }

  /**
   * @private
   */
  constructor (spec: OpgpProxySpec) {
    // TODO
  }

}

/**
 * @private
 */
interface OpgpProxySpec {
  // TODO
}

const getOpgpProxy: OpgpProxyFactory = OpgpProxyClass.getInstance
export default getOpgpProxy