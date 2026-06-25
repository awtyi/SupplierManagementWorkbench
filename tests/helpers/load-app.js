const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "../..");

function loadApp(relativeFiles) {
  const document = {
    getElementById() {
      return null;
    }
  };
  const window = { document };
  window.window = window;

  const context = vm.createContext({
    window,
    document,
    console,
    Date,
    Intl,
    Math,
    structuredClone,
    setTimeout,
    clearTimeout
  });

  for (const relativeFile of relativeFiles) {
    const filename = path.join(root, relativeFile);
    const source = fs.readFileSync(filename, "utf8");
    vm.runInContext(source, context, { filename });
  }

  return { window, document };
}

module.exports = { loadApp };
