const JSONPullParser = require(__dirname + '/..');

const assert = require('assert');
const fs     = require('fs');
const glob   = require('glob').sync;

glob(__dirname + '/**/fail*.json').forEach(file => {
  console.log(file);
  var test = fs.readFileSync(file).toString();
  assert.throws(() => {
    JSONPullParser.parse(test)
  });

});

glob(__dirname + '/**/pass*.json').forEach(file => {
  console.log(file);
  var test = fs.readFileSync(file).toString();

    var o1 = JSONPullParser.parse(test);
  assert.doesNotThrow( () => {

    var o1 = JSONPullParser.parse(test);
    var o2 = JSON.parse(test);

    assert.deepStrictEqual(o1, o2);

  });

});

const util = require('util');
const vm = require('vm');

glob(__dirname + '/js/**/*.js').forEach(file => {
  console.log(file);
  const sandbox = {
    assert: {
      throws(type, block) {
        try {
          block();
          assert.fail();
        } catch (err) {
          assert(err instanceof type, `Expected ${type}, got ${err}`);
        }
      },
      sameValue(actual, expected, message) {
        assert.equal(actual, expected, message);
      }
    },
    console: console,
    JSON: JSONPullParser,
    SyntaxError: SyntaxError,
  };

  const source = fs.readFileSync(file).toString();
  const script = new vm.Script(source);

  const context = new vm.createContext(sandbox);
  script.runInContext(context);

});

const testSuite = require('json-schema-test-suite');

const factory = function (schema, options) {
  return {
    validate: function (json) {
      try {
        var s = JSON.stringify(json);
        var s1, s2, e1;
        try {
          s1 = JSON.stringify(JSON.parse(s));
        }
        catch (err) {
          e1 = err;
        }

        try {
          s2 = JSON.stringify(JSONPullParser.parse(s));
        }
        catch (err) {
          if (!e1) {
            console.log(json);
            console.error(err);
            process.exit(-1);
          }
        }

        if (e1) return { valid: false, errors: [e1.message] };

        return s1 === s2 ? { valid: true } : { valid: false, errors: ['not equal'] };
      } catch (err) {
        console.error(err);
      }
    }
  };
};

const tests = testSuite.testSync(factory);

glob(__dirname + '/json/benchmark/**.json').forEach(file => {
  console.log(file);
  const source = fs.readFileSync(file).toString();
  console.time('JSON');
  for (let i = 0;i < 1e2;++i) JSON.parse(source);
  const o1 = JSON.parse(source);
  console.timeEnd('JSON');

  console.time('JSONPullParser');
  for (let i = 0;i < 1e2;++i) JSONPullParser.parse(source);
  const o2 = JSONPullParser.parse(source);
  console.timeEnd('JSONPullParser');

  assert.deepStrictEqual(o1, o2);
  assert.equal(JSON.stringify(o1), JSON.stringify(o2));

})