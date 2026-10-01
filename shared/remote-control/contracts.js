/**
 * @typedef {Object} PlayerReader
 * @property {function(): Object} readMetadata
 * @property {function(): Object} readState
 * @property {function(function(): void): function(): void} subscribe
 */

/**
 * @typedef {Object} PlayerActions
 * @property {function(Object): Object} execute
 * @property {function(number, Object=): boolean} navigateTo
 * @property {function(Function): function(): void} subscribeNavigation
 */

/**
 * @typedef {Object} RemoteTransport
 * @property {function(): Promise<void>} connect
 * @property {function(): boolean} isConnected
 * @property {function(string, Object, number=): Promise<Object|null>} request
 * @property {function(string, Function): function(): void} subscribe
 * @property {function(): void} disconnect
 */

/**
 * @typedef {Object} SessionRepository
 * @property {function(Object, number): Promise<Object>} create
 * @property {function(string): Promise<Object|null>} get
 * @property {function(string): Promise<Object|null>} findByCode
 * @property {function(string, number, Object): Promise<Object>} update
 * @property {function(string, number=): Promise<void>} remove
 * @property {function(): Promise<Object[]>} list
 */

/**
 * @typedef {Object} CredentialStore
 * @property {function(): Object|null} load
 * @property {function(Object): void} save
 * @property {function(): void} clear
 */

/**
 * @typedef {Object} Clock
 * @property {function(): number} now
 */

export {};
