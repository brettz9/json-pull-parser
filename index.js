module.exports = require('./src/parser.js');

// function printStatus(fn) {
//     switch(%GetOptimizationStatus(fn)) {
//         case 1: console.log("Function is optimized"); break;
//         case 2: console.log("Function is not optimized"); break;
//         case 3: console.log("Function is always optimized"); break;
//         case 4: console.log("Function is never optimized"); break;
//         case 6: console.log("Function is maybe deoptimized"); break;
//         case 7: console.log("Function is optimized by TurboFan"); break;
//         default: console.log("Unknown optimization status"); break;
//     }
// }

// const N = 1e6;

// var o = true;
// // for (let i = 0;i < N;++i) {
// //   o.push(null);
// //   o.push(true);
// //   o.push(false);
// //   // o.push(((Math.random() - 0.5) * 1e12));
// //   // o.push(((Math.random() - 0.5) * 1e12).toString(36));
// //   // o[ ((Math.random() - 0.5) * 1e12).toString(36) ] = ((Math.random() - 0.5) * 1e12);
// // }

// var s = JSON.stringify(o, null, 2);

// JSONPullParser.parse(s);
// JSONPullParser.parse(s);
// JSONPullParser.parse(s);


// // %OptimizeFunctionOnNextCall(JSONPullParser.parse);
// %OptimizeFunctionOnNextCall(parseTrue);
// %OptimizeFunctionOnNextCall(parseFalse);
// %OptimizeFunctionOnNextCall(parseNull);
// %OptimizeFunctionOnNextCall(match);

// JSONPullParser.parse(s);
// JSONPullParser.parse(s);

// printStatus(JSONPullParser.parse);
// printStatus(parseNumber);
// printStatus(parseString);
// printStatus(parseTrue);
// printStatus(parseFalse);
// printStatus(parseNull);
// printStatus(match);


// // console.time('1');
// // var o1 = JSON.parse(s);
// // console.timeEnd('1');
// // var s1 = JSON.stringify(o1);

// console.time('2');
// var o2 = JSONPullParser.parse(s);
// console.timeEnd('2');
// // var s2 = JSON.stringify(o2);

// console.time('1');
// var o1 = JSON.parse(s);
// console.timeEnd('1');
// var s1 = JSON.stringify(o1);


// // console.log(s1 === s2);

// // for (let i = 0;i < N;++i) {
// //   if (o1[i] !== o2[i]) {
// //     console.log(i, o[i], o1[i], o2[i]);
// //     break;
// //   }
// // }

// JSON.parse('["Comma after the close"],');

// JSONPullParser.parse('25');
