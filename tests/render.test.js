const test = require("node:test");
const assert = require("node:assert/strict");
const { loadApp } = require("./helpers/load-app");

test("namespace exposes an HTML escaping utility", () => {
  const { window } = loadApp(["scripts/namespace.js"]);
  assert.equal(
    window.SupplierDashboard.util.escapeHtml('<风险 id="1">'),
    "&lt;风险 id=&quot;1&quot;&gt;"
  );
});
