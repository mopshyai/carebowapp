'use strict';

/**
 * query-string (CJS) requires decode-uri-component, which is published as ESM.
 * Metro 0.87's package-exports resolver can hand CJS a module namespace object,
 * so `decodeComponent(value)` throws "Object is not a function" while parsing
 * deep-link query strings. This shim unwraps `default` for that CJS caller.
 *
 * Metro only routes query-string's import through this file; this require uses
 * the real package because the origin is no longer query-string.
 */
const actual = require('decode-uri-component');
const decode = typeof actual === 'function' ? actual : actual && actual.default;

if (typeof decode !== 'function') {
  throw new Error('decode-uri-component did not export a function');
}

module.exports = decode;
