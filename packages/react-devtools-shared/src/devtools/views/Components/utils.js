/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

/**
 * Converts nested hooks paths to the format expected by the backend.
 * e.g. [''] => ['']
 * e.g. [1, 'value', ...] => [...]
 * e.g. [2, 'subhooks', 1, 'value', ...] => [...]
 * e.g. [1, 'subhooks', 3, 'subhooks', 2, 'value', ...] => [...]
 */
export function parseHookPathForEdit(
  path: Array<string | number>,
): Array<string | number> {
  let index = 0;
  for (let i = 0; i < path.length; i++) {
    if (path[i] === 'value') {
      index = i + 1;
      break;
    }
  }
  return path.slice(index);
}

export function isJson(str) {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
}

export function jsonBeautify(jsonStr) {
  jsonStr = jsonStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return jsonStr.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, match => {
    let cls = 'json-number'
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key'
      } else {
        cls = 'json-string'
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean'
    } else if (/null/.test(match)) {
      cls = 'json-null'
    }
    return '<span class="' + cls + '">' + match + '</span>'
  })
}