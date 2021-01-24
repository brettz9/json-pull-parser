import ObjectBuilder from './builder.js';

/**
 * @typedef {PlainObject} State
 * @property {string} s Text
 * @property {boolean} [d=false] Done
 * @property {Integer} [f=0] Position
 * @property {Integer} [l] Defaults to text length
 * @property {Integer} [e=VALUE] Expect
 * @property {Integer} [c=0] Column
 * @property {Integer} [r=1] Row
 * @property {Integer[]} [x=[]]
*/

/**
* @typedef {string} Type
*/

/**
 * @typedef {PlainObject} TokenPlain
 * @property {Type} type
 * @property {Integer} first
 * @property {Integer} last
*/

/**
 * @typedef {TokenPlain} TokenEnd
 */

/**
 * @typedef {SyntaxError|string|Float|boolean|null} JSONValueOrError
 */

/**
 * @typedef {TokenPlain} Token
 * @property {JSONValueOrError} value
 */

/**
 * @typedef {Token} TokenWithSource
 * @property {string} source
 */

const VALUE = 1;
const KEY = 2;
const COMMA = 4;
const COLON = 8;
const CLOSE = 16;
const OBJECT = 32;
const ARRAY = 64;

/**
 *
 */
class JSONPullParser {
  /**
   * @param {string} text
   * @returns {void}
   */
  constructor (text) {
    this.text = text;
  }

  /**
   * @returns {Iterator}
   */
  [Symbol.iterator] () {
    return tokenIterator(this.text);
  }

  /**
   * @returns {Iterator}
   */
  tokens () {
    return tokenIterator(this.text);
  }
}

/*
if (typeof Symbol === 'object' && Symbol.iterator) {
  JSONPullParser.prototype[Symbol.iterator] = JSONPullParser.prototype.tokens;
}
*/

JSONPullParser.StartDocument = '<';
JSONPullParser.EndDocument = '>';
JSONPullParser.StartObject = '{';
JSONPullParser.EndObject = '}';
JSONPullParser.StartArray = '[';
JSONPullParser.EndArray = ']';
JSONPullParser.String = 'string';
JSONPullParser.Number = 'number';
JSONPullParser.TrueLiteral = 'true';
JSONPullParser.FalseLiteral = 'false';
JSONPullParser.NullLiteral = 'null';
JSONPullParser.Whitespace = 'ws';
JSONPullParser.Error = 'error';

JSONPullParser.ObjectBuilder = ObjectBuilder;

/**
* @callback ReviverFunction
* @returns {JSON}
*/

/**
* @param {string} text
* @param {ReviverFunction} reviver
*/
JSONPullParser.parse = function (text, reviver) {
  if (typeof text !== 'string') text = String(text);
  const builder = new ObjectBuilder();
  for (const token of tokenIterator(text)) {
    // console.log("token: " + token.type);
    builder.handle(token);
  }
  if (typeof builder.value === 'undefined') {
    throw new SyntaxError('Unexpected end of JSON input');
  }
  return builder.value;
};

/**
 * @param {string} text
 * @yields {Token|TokenEnd}
 * @returns {void}
 */
function * tokenIterator (text) {
  const state = {
    s: text,
    d: false, // done
    f: 0, // position
    l: text.length, // length
    e: VALUE, // expect
    c: 0, // column
    r: 1, // row
    x: []
  };

  while (true) {
    // console.log(
    //  `next: ${state.f}, ${state.l}, ` +
    //   `${text.charCodeAt(state.f).toString(16)}`
    // );
    if (state.f === state.l) {
      if (!state.e && !state.x.length) {
        return;
      }
      yield parserError(
        state.s, state.l, state.l, 'Unexpected end of JSON input'
      );
    }
    const token = parseValue(state);
    state.f = token.last;

    yield token;
  }
}

/**
 * @param {string} s
 * @param {Integer} f
 * @param {Integer} l
 * @param {string} m Message
 * @param {Integer} r
 * @returns {Token}
 */
function parserError (s, f, l, m, r = 1) {
  let c = f;
  let cc = s.charCodeAt(c);
  while (cc !== 0x0A && c > 0) {
    cc = s.charCodeAt(--c);
  }
  if (cc === 0x0A) ++c;
  const str0 = 'undefined:' + r;
  const str1 = s.slice(c, f + 1);
  let str2 = '';
  for (let i = c; i < f; ++i) str2 += ' ';
  str2 += '^';

  const err = new SyntaxError(str0 + '\n' + str1 + '\n' + str2 + '\n\n' + m);
  return {
    type: JSONPullParser.Error,
    value: err,
    first: f,
    last: l
  };
}

/**
 * @param {string} s
 * @param {Integer} f
 * @param {Integer} l
 * @returns {Token}
 */
function parseObjectStart (s, f, l) {
  return {
    type: JSONPullParser.StartObject,
    value: '{',
    first: f,
    last: f + 1
  };
}

/**
 * @param {string} s
 * @param {Integer} f
 * @param {Integer} l
 * @returns {Token}
 */
function parseObjectEnd (s, f, l) {
  return {
    type: JSONPullParser.EndObject,
    value: '}',
    first: f,
    last: f + 1
  };
}
/**
 * @param {string} s
 * @param {Integer} f
 * @param {Integer} l
 * @returns {Token}
 */
function parseArrayStart (s, f, l) {
  return {
    type: JSONPullParser.StartArray,
    value: '[',
    first: f,
    last: f + 1
  };
}

/**
 * @param {string} s
 * @param {Integer} f
 * @param {Integer} l
 * @returns {Token}
 */
function parseArrayEnd (s, f, l) {
  return {
    type: JSONPullParser.EndArray,
    value: ']',
    first: f,
    last: f + 1
  };
}

/**
 * @param {State} state
 * @returns {Token|TokenEnd}
 */
function parseValue (state) {
  const {s, l} = state;
  let {f} = state;
  while (f < l) {
    state.c++;
    switch (s.charCodeAt(f)) {
    case 0x0A: // LF
      state.c = 0;
      state.r++;
      // Fallthrough
    case 0x09: // TAB
    case 0x0D: // CR
    case 0x20: // WS
      ++f; continue;
    case 0x7B: // {
      if (!(state.e & VALUE)) {
        return parserError(
          s, f, l, 'Unexpected token { in JSON at position ' + f, state.r
        );
      }
      state.e = KEY | CLOSE;
      state.x.push(OBJECT);
      return parseObjectStart(s, f, l);
    case 0x7D: // }
      if (!(state.e & CLOSE) || state.x.pop() !== OBJECT) {
        return parserError(
          s, f, l, 'Unexpected token } in JSON at position ' + f, state.r
        );
      }
      state.e = state.x.length > 0 ? COMMA | CLOSE : 0;
      return parseObjectEnd(s, f, l);
    case 0x5B: // [
      if (!(state.e & VALUE)) {
        return parserError(
          s, f, l, 'Unexpected token [ in JSON at position ' + f, state.r
        );
      }
      state.e = VALUE | CLOSE;
      state.x.push(ARRAY);
      return parseArrayStart(s, f, l);
    case 0x5D: // ]
      if (!(state.e & CLOSE) || state.x.pop() !== ARRAY) {
        return parserError(
          s, f, l, 'Unexpected token ] in JSON at position ' + f, state.r
        );
      }
      state.e = state.x.length > 0 ? COMMA | CLOSE : 0;
      return parseArrayEnd(s, f, l);
    case 0x3A: // :
      if (!(state.e & COLON)) {
        return parserError(
          s, f, l, 'Unexpected token : in JSON at position ' + f, state.r
        );
      }
      state.e = VALUE;
      ++f; continue;
    case 0x2C: // ,
      if (!(state.e & COMMA)) {
        return parserError(
          s, f, l, 'Unexpected token , in JSON at position ' + f, state.r
        );
      }
      if (state.x.length > 0 && state.x[state.x.length - 1] === OBJECT) {
        state.e = KEY;
      } else {
        state.e = VALUE;
      }
      ++f; continue;
    case 0x2D: // -
    case 0x30: // 0
    case 0x31: // 1
    case 0x32: // 2
    case 0x33: // 3
    case 0x34: // 4
    case 0x35: // 5
    case 0x36: // 6
    case 0x37: // 7
    case 0x38: // 8
    case 0x39: // 9
      if (!(state.e & VALUE)) {
        return parserError(
          s, f, l, 'Unexpected number in JSON at position ' + f, state.r
        );
      }
      state.e = state.x.length > 0 ? COMMA | CLOSE : 0;
      return parseNumber(s, f, l);
    case 0x22:
      if (state.e & KEY) {
        state.e = COLON;
        return parseString(s, f, l);
      }
      if (!(state.e & VALUE)) {
        return parserError(
          s, f, l, 'Unexpected string in JSON at position ' + f, state.r
        );
      }
      state.e = state.x.length > 0 ? COMMA | CLOSE : 0;
      return parseString(s, f, l);
    case 0x74: // t
      if (!(state.e & VALUE)) {
        return parserError(
          s, f, l, 'Unexpected token t in JSON at position ' + f, state.r
        );
      }
      state.e = state.x.length > 0 ? COMMA | CLOSE : 0;
      return parseTrue(s, f, l);
    case 0x66: // f
      if (!(state.e & VALUE)) {
        return parserError(
          s, f, l, 'Unexpected token f in JSON at position ' + f, state.r
        );
      }
      state.e = state.x.length > 0 ? COMMA | CLOSE : 0;
      return parseFalse(s, f, l);
    case 0x6E: // n
      if (!(state.e & VALUE)) {
        return parserError(
          s, f, l, 'Unexpected token n in JSON at position ' + f, state.r
        );
      }
      state.e = state.x.length > 0 ? COMMA | CLOSE : 0;
      return parseNull(s, f, l);
    default: return parserError(
      s, f, l, 'Unexpected token ' + s[f] + ' in JSON at position ' + f, state.r
    );
    }
  }
  return {
    type: JSONPullParser.EndDocument,
    first: l,
    last: l
  };
}

/**
 * @param {string} s
 * @param {Integer} f
 * @param {Integer} l
 * @returns {Token}
 */
function parseNumber (s, f, l) {
  let c = f;

  let cc = s.charCodeAt(c++);

  if (cc === 0x2D /* - */) cc = s.charCodeAt(c++);

  if (cc !== 0x30 /* 0 */) {
    while (cc >= 0x30 /* 0 */ && cc <= 0x39 /* 9 */) {
      cc = s.charCodeAt(c++);
    }
  } else {
    cc = s.charCodeAt(c++);
  }

  if (cc === 0x2E /* . */) {
    cc = s.charCodeAt(c++);
    while (cc >= 0x30 && cc <= 0x39) cc = s.charCodeAt(c++);
  }

  if (cc === 0x65 /* e */|| cc === 0x45 /* E */) {
    cc = s.charCodeAt(c++);
    if (cc === 0x2B /* + */|| cc === 0x2D /* - */) cc = s.charCodeAt(c++);
    if (cc < 0x30 || cc > 0x39) {
      return parserError(
        s, c - 1, l,
        'Unexpected token ' + s[c - 1] + ' in JSON at position ' + (c - 1)
      );
    }
    if (c >= l) return parserError(s, f, l, 'Unexpected end of JSON input');
    while (cc >= 0x30 /* 0 */ && cc <= 0x39 /* 9 */) cc = s.charCodeAt(c++);
  }

  return {
    type: JSONPullParser.Number,
    value: Number.parseFloat(
      s.slice(f, c - 1)
    ), // parseFloat seems to be faster than JSON.parse
    first: f,
    last: c - 1
  };
}

// ECMA-404 section 9
/**
 * @param {string} s
 * @param {Integer} f
 * @param {Integer} l
 * @returns {TokenWithSource}
 */
function parseString (s, f, l) {
  let c = f + 1;
  while (c < l) {
    let cc = s.charCodeAt(c++);
    if (cc === 0x22 /* " */) break;
    else if (cc === 0x5C /* \ */) {
      cc = s.charCodeAt(c++);
      if (cc === 0x75 /* u */) {
        c += 4;
        if (c > l) return parserError(s, l, l, 'Unexpected end of JSON input');
      }
    }
  }
  // console.log(`string: ${c}, ${f}, ${s.substring(f, c)}`);
  return {
    type: JSONPullParser.String,
    value: JSON.parse(s.slice(f, c)),
    source: s,
    first: f,
    last: c
  };
}

/**
 * @param {string} s
 * @param {Integer} f
 * @param {Integer} l
 * @param {Integer[]} ccs
 * @param {TokenWithSource} success
 * @returns {token}
 */
function match (s, f, l, ccs, success) {
  if (f + ccs.length > l) {
    return parserError(s, l, l, 'Unexpected end of JSON input');
  }
  for (const cc_ of ccs) {
    const cc = s.charCodeAt(f++);
    if (cc !== cc_) {
      return parserError(
        s, f, l,
        'Unexpected token ' + s[f - 1] + ' in JSON at position ' + (f - 1)
      );
    }
  }
  return success;
}

/**
 * @param {string} s
 * @param {Integer} f
 * @param {Integer} l
 * @returns {TokenWithSource}
 */
function parseTrue (s, f, l) {
  return match(s, f, l, [0x74, 0x72, 0x75, 0x65], {
    type: JSONPullParser.TrueLiteral,
    value: true,
    source: s,
    first: f,
    last: f + 4
  });
}

/**
 * @param {string} s
 * @param {Integer} f
 * @param {Integer} l
 * @returns {TokenWithSource}
 */
function parseFalse (s, f, l) {
  return match(s, f, l, [0x66, 0x61, 0x6C, 0x73, 0x65], {
    type: JSONPullParser.FalseLiteral,
    value: false,
    source: s,
    first: f,
    last: f + 5
  });
}

/**
 * @param {string} s
 * @param {Integer} f
 * @param {Integer} l
 * @returns {TokenWithSource}
 */
function parseNull (s, f, l) {
  return match(s, f, l, [0x6E, 0x75, 0x6C, 0x6C], {
    type: JSONPullParser.NullLiteral,
    value: null,
    source: s,
    first: f,
    last: f + 4
  });
}

export default JSONPullParser;
