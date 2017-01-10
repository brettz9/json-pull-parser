'use strict';

var ObjectBuilder = require('./builder');

var VALUE  =  1;
var KEY    =  2;
var COMMA  =  4;
var COLON  =  8;
var CLOSE  = 16;
var OBJECT = 32;
var ARRAY  = 64;

function JSONPullParser(text)
{
  this.text = text;
}

JSONPullParser.prototype[Symbol.iterator] = function()
{
  return TokenIterator(this.text);
}

JSONPullParser.prototype.tokens = function()
{
  return TokenIterator(this.text);
}

if (typeof Symbol === 'object' && Symbol.iterator) {
  JSONPullParser.prototype[Symbol.iterator] = JSONPullParser.prototype.tokens;
}

JSONPullParser.StartDocument = '<';
JSONPullParser.EndDocument   = '>';
JSONPullParser.StartObject   = '{';
JSONPullParser.EndObject     = '}';
JSONPullParser.StartArray    = '[';
JSONPullParser.EndArray      = ']';
JSONPullParser.String        = 'string';
JSONPullParser.Number        = 'number';
JSONPullParser.TrueLiteral   = 'true';
JSONPullParser.FalseLiteral  = 'false';
JSONPullParser.NullLiteral   = 'null';
JSONPullParser.Whitespace    = 'ws';
JSONPullParser.Error         = 'error';

function CodePointIterator(source)
{
  this.s = source;
  this.f = 0;
  this.l = source.length | 0;
  this.cc = 0;
}

CodePointIterator.prototype.next = function ()
{
  if (this.f >= this.l) return false;
  this.cc = source.charCodeAt(this.f++) | 0;
  return true;
}

CodePointIterator.prototype.code = function ()
{
  return this.cc;
}

CodePointIterator.prototype.expect = function (code)
{
}

JSONPullParser.ObjectBuilder = ObjectBuilder;

JSONPullParser.parse = function(text, reviever)
{
  if (typeof text !== 'string') text = '' + text;
  var builder = new ObjectBuilder();
  var it = TokenIterator(text);
  for (var step = it.next();!step.done; step = it.next()) {
    var token = step.value;
    // console.log("token: " + token.type);
    builder.handle(token);
  }
  if (typeof builder.value === 'undefined') throw new SyntaxError('Unexpected end of JSON input');
  return builder.value;
}

function TokenIterator(text)
{
  var state = {
    s: text,
    f: 0,           // position
    l: text.length, // length
    e: VALUE,       // expect
    c: 0,           // column
    r: 1,           // row
    x: []
  };
  return {
    next: function () {
      // console.log(`next: ${state.f}, ${state.l}, ${text.charCodeAt(state.f).toString(16)}`)
      if (state.f === state.l) return { done: true };
      var token = parseValue(state);
      state.f = token.last;
      return { value: token, done: false };
    }
  };
}

function ParserError(s, f, l, m, r)
{
  r = r || 1;
  var c = f;
  var cc = s.charCodeAt(c);
  while (cc !== 0x0a && c > 0) {
    cc = s.charCodeAt(--c);
  }
  if (cc === 0x0a) ++c;
  var str0 = 'undefined:' + r;
  var str1 = s.substring(c, f+1);
  var str2 = '';
  for (var i = c;i < f;++i) str2 += ' ';
  str2 += '^';

  var err = new SyntaxError(str0 + "\n" + str1 + "\n" + str2 + "\n\n" + m);
  return {
    type: JSONPullParser.Error,
    value: err,
    first: f,
    last: l
  };
}

function parseObjectStart(s, f, l)
{
  return {
    type: JSONPullParser.StartObject,
    value: '{',
    first: f,
    last: f+1
  };
}

function parseObjectEnd(s, f, l)
{
  return {
    type: JSONPullParser.EndObject,
    value: '}',
    first: f,
    last: f+1
  };
}
function parseArrayStart(s, f, l)
{
  return {
    type: JSONPullParser.StartArray,
    value: '[',
    first: f,
    last: f+1
  };
}

function parseArrayEnd(s, f, l)
{
  return {
    type: JSONPullParser.EndArray,
    value: ']',
    first: f,
    last: f+1
  };
}

function parseValue(state)
{
  var s = state.s;
  var f = state.f;
  var l = state.l;
  while (f < l) {
    state.c++;
    switch (s.charCodeAt(f)) {
      case 0x0a: // LF
        state.c = 0;
        state.r++;
      case 0x09: // TAB
      case 0x0d: // CR
      case 0x20: // WS
        ++f; continue;
      case 0x7b: // {
        if (!(state.e & VALUE)) return ParserError(s, f, l, 'Unexpected token { in JSON at position ' + f, state.r);
        state.e = KEY | CLOSE;
        state.x.push(OBJECT);
        return parseObjectStart(s, f, l);
      case 0x7d: // }
        if (!(state.e & CLOSE) || state.x.pop() !== OBJECT) return ParserError(s, f, l, 'Unexpected token } in JSON at position ' + f, state.r);
        state.e = state.x.length > 0 ? COMMA | CLOSE : 0;
        return parseObjectEnd(s, f, l);
      case 0x5b: // [
        if (!(state.e & VALUE)) return ParserError(s, f, l, 'Unexpected token [ in JSON at position ' + f, state.r);
        state.e = VALUE | CLOSE;
        state.x.push(ARRAY);
        return parseArrayStart(s, f, l);
      case 0x5d: // ]
        if (!(state.e & CLOSE) || state.x.pop() !== ARRAY) return ParserError(s, f, l, 'Unexpected token ] in JSON at position ' + f, state.r);
        state.e = state.x.length > 0 ? COMMA | CLOSE : 0;
        return parseArrayEnd(s, f, l);
      case 0x3a: // :
        if (!(state.e & COLON)) return ParserError(s, f, l, 'Unexpected token : in JSON at position ' + f, state.r);
        state.e = VALUE;
        ++f; continue;
      case 0x2c: // ,
        if (!(state.e & COMMA)) return ParserError(s, f, l, 'Unexpected token , in JSON at position ' + f, state.r);
        if (state.x.length > 0 && state.x[state.x.length-1] === OBJECT) state.e = KEY;
        else state.e = VALUE;
        ++f; continue;
      case 0x2d: // -
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
        if (!(state.e & VALUE)) return ParserError(s, f, l, 'Unexpected number in JSON at position ' + f, state.r);
        state.e = state.x.length > 0 ? COMMA | CLOSE : 0;
        return parseNumber(s, f, l);
      case 0x22:
        if (state.e & KEY) {
          state.e = COLON;
          return parseString(s, f, l);
        }
        if (!(state.e & VALUE)) return ParserError(s, f, l, 'Unexpected string in JSON at position ' + f, state.r);
        state.e = state.x.length > 0 ? COMMA | CLOSE : 0;
        return parseString(s, f, l);
      case 0x74: // t
        if (!(state.e & VALUE)) return ParserError(s, f, l, 'Unexpected token t in JSON at position ' + f, state.r);
        state.e = state.x.length > 0 ? COMMA | CLOSE : 0;
        return parseTrue(s, f, l);
      case 0x66: // f
        if (!(state.e & VALUE)) return ParserError(s, f, l, 'Unexpected token f in JSON at position ' + f, state.r);
        state.e = state.x.length > 0 ? COMMA | CLOSE : 0;
        return parseFalse(s, f, l);
      case 0x6e: // n
        if (!(state.e & VALUE)) return ParserError(s, f, l, 'Unexpected token n in JSON at position ' + f, state.r);
        state.e = state.x.length > 0 ? COMMA | CLOSE : 0;
        return parseNull(s, f, l);
      default: return ParserError(s, f, l, 'Unexpected token ' + s[f] + ' in JSON at position ' + f, state.r);
    }
  }
  return {
    type: JSONPullParser.EndDocument,
    first: l,
    last: l,
  };
}

function parseNumber(s, f, l)
{
  var c = f;

  var cc = s.charCodeAt(c++);

  if (cc === 0x2d /* - */) cc = s.charCodeAt(c++);

  if (cc !== 0x30 /* 0 */) {
    while (cc >= 0x30 /* 0 */ && cc <= 0x39 /* 9 */) {
      cc = s.charCodeAt(c++);
    }
  }
  else {
    cc = s.charCodeAt(c++);
  }

  if (cc === 0x2e /* . */) {
    cc = s.charCodeAt(c++);
    while (cc >= 0x30 && cc <= 0x39) cc = s.charCodeAt(c++);
  }

  if (cc === 0x65 /* e */|| cc === 0x45 /* E */) {
    cc = s.charCodeAt(c++);
    if (cc === 0x2b /* + */|| cc === 0x2d /* - */) cc = s.charCodeAt(c++);
    if (cc < 0x30 || cc > 0x39) return ParserError(s, c-1, l, 'Unexpected token ' + s[c-1] + ' in JSON at position ' + (c-1));
    if (c >= l) return ParserError(s, f, l, 'Unexpected end of JSON input');
    while (cc >= 0x30 /* 0 */ && cc <= 0x39 /* 9 */) cc = s.charCodeAt(c++);

  }

  return {
    type: JSONPullParser.Number,
    value: parseFloat(s.substring(f, c-1)), // parseFloat seems to be faster than JSON.parse
    first: f,
    last: c-1
  };

}

// ECMA-404 section 9
function parseString(s, f, l)
{
  var c = f+1;
  while (c < l) {
    var cc = s.charCodeAt(c++);
    if (cc === 0x22 /* " */) break;
    else if (cc === 0x5c /* \ */) {
      cc = s.charCodeAt(c++);
      if (cc === 0x75 /* u */) {
        c += 4;
        if (c > l) return ParserError(s, l, l, 'Unexpected end of JSON input');
      }
    }
  }
  // console.log(`string: ${c}, ${f}, ${s.substring(f, c)}`);
  return {
    type: JSONPullParser.String,
    value: JSON.parse(s.substring(f, c)),
    source: s,
    first: f,
    last: c
  };
}

function match(s, f, l, ccs, success)
{
  if (f + ccs.length > l) return ParserError(s, l, l, 'Unexpected end of JSON input');
  for (var i = 0;i < ccs.length; ++i) {
    var cc = s.charCodeAt(f++);
    if (cc !== ccs[i]) return ParserError(s, f, l, 'Unexpected token ' + s[f-1] + ' in JSON at position ' + (f-1));
  }
  return success;
}

function parseTrue(s, f, l)
{
  return match(s, f, l, [0x74, 0x72, 0x75, 0x65], {
    type: JSONPullParser.TrueLiteral,
    value: true,
    source: s,
    first: f,
    last: f+4
  });
}

function parseFalse(s, f, l)
{
  return match(s, f, l, [0x66, 0x61, 0x6c, 0x73, 0x65], {
    type: JSONPullParser.FalseLiteral,
    value: false,
    source: s,
    first: f,
    last: f+5
  });
}

function parseNull(s, f, l)
{
  return match(s, f, l, [0x6e, 0x75, 0x6c, 0x6c], {
    type: JSONPullParser.NullLiteral,
    value: null,
    source: s,
    first: f,
    last: f+4
  });
}

module.exports = JSONPullParser;
