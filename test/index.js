/* eslint-disable node/no-sync -- Ok for tests */
import assert from 'assert';
import fs from 'fs';
import {join, dirname} from 'path';
import {fileURLToPath} from 'url';
import vm from 'vm';
import glb from 'glob';

import testSuite from 'json-schema-test-suite';

const glob = glb.sync;

const __dirname = dirname(fileURLToPath(import.meta.url));

const globRelativePath = (path) => {
  return glob(join(__dirname, path));
};

(async () => {
// eslint-disable-next-line no-unsanitized/method -- Own tests
const JSONPullParser = (await import(__dirname + '/../index.js')).default;
globRelativePath('/**/fail*.json').forEach((file) => {
  console.log(file);
  const test = fs.readFileSync(file).toString();
  assert.throws(() => {
    JSONPullParser.parse(test);
  });
});

globRelativePath('/**/pass*.json').forEach((file) => {
  console.log(file);
  const test = fs.readFileSync(file).toString();

  let o1 = JSONPullParser.parse(test);
  assert.doesNotThrow(() => {
    o1 = JSONPullParser.parse(test);
    const o2 = JSON.parse(test);

    assert.deepStrictEqual(o1, o2);
  });
});

globRelativePath('/js/**/*.js').forEach((file) => {
  console.log(file);
  const sandbox = {
    assert: {
      throws (type, block) {
        try {
          block();
          assert.fail();
        } catch (err) {
          // eslint-disable-next-line no-restricted-syntax -- Frame safe
          assert(err instanceof type, `Expected ${type}, got ${err}`);
        }
      },
      sameValue (actual, expected, message) {
        assert.equal(actual, expected, message);
      }
    },
    console,
    JSON: JSONPullParser,
    SyntaxError
  };

  const source = fs.readFileSync(file).toString();
  const script = new vm.Script(source);

  const context = vm.createContext(sandbox);
  script.runInContext(context);
});

const factory = function (schema, options) {
  return {
    validate (json) {
      try {
        const s = JSON.stringify(json);
        let s1, s2, e1;
        try {
          s1 = JSON.stringify(JSON.parse(s));
        } catch (err) {
          e1 = err;
        }

        try {
          s2 = JSON.stringify(JSONPullParser.parse(s));
        } catch (err) {
          if (!e1) {
            console.log(json);
            console.error(err);
            // eslint-disable-next-line max-len -- Necessary
            // eslint-disable-next-line unicorn/no-process-exit -- Immediate feedback
            process.exit(-1);
          }
        }

        if (e1) return {valid: false, errors: [e1.message]};

        return s1 === s2
          ? {valid: true}
          : {valid: false, errors: ['not equal']};
      } catch (err) {
        console.error(err);
        return {valid: false, errors: [err.message]};
      }
    }
  };
};

/* const tests = */ testSuite.testSync(factory);

globRelativePath('/json/benchmark/**.json').forEach((file) => {
  console.log(file);
  const source = fs.readFileSync(file).toString();
  console.time('JSON');
  for (let i = 0; i < 1e2; ++i) JSON.parse(source);
  const o1 = JSON.parse(source);
  console.timeEnd('JSON');

  console.time('JSONPullParser');
  for (let i = 0; i < 1e2; ++i) JSONPullParser.parse(source);
  const o2 = JSONPullParser.parse(source);
  console.timeEnd('JSONPullParser');

  assert.deepStrictEqual(o1, o2);
  assert.equal(JSON.stringify(o1), JSON.stringify(o2));
});
})();
