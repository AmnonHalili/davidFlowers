const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function loader(mocks = {}, globals = {}) {
  const cache = new Map();
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
    const localRequire = name => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name === 'server-only') return {};
      if (name.startsWith('@/')) return load(path.resolve('src', name.slice(2)) + '.ts');
      if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name) + '.ts');
      return require(name);
    };
    vm.runInNewContext(code, { exports, require: localRequire, process, Buffer, console, Date, URL, AbortSignal, ...globals }, { filename: file });
    return exports;
  }
  return load;
}
module.exports = { loader };
