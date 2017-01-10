JSONPullParser
--------------

**Introduction**

`JSONPullParser` is a dropin replacement for `JSON.parse` and also provides a
pull based api.

**Usage**

```javascript
let parser  = new JSONPullParser(json);
let builder = new JSONPullParser.ObjectBuilder();

for (let token of parser) builder.handle(token);
```

Se live [demo](http://www.susi.se/json-pull-parser/demo.html)!

# Getting started

`JSONPullParser` provides a simple API for iterating over the tokens in
[JSON](http://www.json.org/) data.

If your *JavaScript* engine supports [Symbol.iterator](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols)
then your parser is *iterable*.

```javascript
let parser  = new JSONPullParser(json);

for (let token of parser) {
  // use token
}
```

Otherwise you have to get an *iterator* from `parser.tokens()`

```javascript
var parser = new JSONPullParser(json);
var it     = parser.tokens();

while (true) {
  var step = it.next();
  if (step.done) break;
  var token = step.value;
  // use token
}
```

`JSONPullParser` ensures that the tokens are valid and delivered in a valid
sequence. `StartObject` and `StartArray` will always have a matching `EndObject`
and `EndArray` at the correct depth.

## ObjectBuilder

`ObjectBuilder` builds the resulting *JavaScript* object from the *tokens*. Its
`value` property is either undefined or a valid object/array/boolean or null.

`JSON.parse` could be implemented by simply feeding all the tokens to
`ObjectBuilder`.

```javascript
JSON.parse = function (source)
{
  let parser = new JSONPullParser(source);
  let builder = new JSONPullParser.ObjectBuilder();
  for (let token of parser) builder.handle(token);
  return builder.value;
}
```

## Custom handling of events

```javascript
let parser = new JSONPullParser(json);

for (let token of parser) {
  switch (token.type) {
    case JSONPullParser.StartObject:
      break;
    case JSONPullParser.EndObject:
      break;
    case JSONPullParser.StartArray:
      break;
    case JSONPullParser.EndArray:
      break;
    case JSONPullParser.String:
      break;
    case JSONPullParser.Number:
      break;
    case JSONPullParser.TrueLiteral:
      break;
    case JSONPullParser.FalseLiteral:
      break;
    case JSONPullParser.NullLiteral:
      break;
    case JSONPullParser.Error:
      break;
  }
}

```

# Conformance

`JSONPullParser` tries to conform to [ECMA 404](http://www.json.org).

[JSON-Schema-Test-Suite](https://github.com/json-schema-org/JSON-Schema-Test-Suite)
and [JSON_checker](http://www.json.org/JSON_checker/) are both used to validate
the parser as well as comparing the output from `JSON.parse` with
`JSONPullParser.parse` on a number of real life testcases.

`JSONPullParser` currently delegates string and number parsing is delegated to
`JSON.parse`.

# Results

`JSONPullParser` will obviously be slower than using native `JSON.parse`.
However it is mainly intended to be used when a constant frame rate or not
freezing the user interface is more important than performance.

<div>
  <svg version="1.1"
       baseProfile="full"
       width="200"
       height="130"
       viewBox="0 0 200 130"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M89,9 h4 l4,-4 l-4,4 h4 l4,-4 l-4,4 h4 l4,-4 l-4,4 h4 l4,-4 l-4,4 h4" stroke="black"/>
    <path d="M99,9 L100,10 L101,9 z" stroke="black" fill="black"/>
    <line x1="100" y1="10" x2="178" y2="54" stroke="black" fill="black"/>
    <circle cx="178" cy="54" r="10" stroke="none" fill="black"/>
  </svg>
  <pre>
json.length:          17.53mb
JSON.parse:           188ms
JSONPullParser.parse: 316ms
Equality:             true
JSON.parse done in 170ms
JSON.parse done in 184ms
JSONPullParser parsed 1M tokens in 480ms using 1001 fragments
JSONPullParser parsed 1M tokens in 396ms using 1001 fragments
  </pre>
</div>

Se live [demo](http://www.susi.se/json-pull-parser/demo.html)!
