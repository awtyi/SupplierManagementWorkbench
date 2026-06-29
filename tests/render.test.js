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

const operationsViewFiles = [
  "scripts/namespace.js",
  "scripts/data/mock-data.js",
  "scripts/domain/metrics.js",
  "scripts/domain/selectors.js",
  "scripts/state/store.js",
  "scripts/charts/svg-charts.js",
  "scripts/components/primitives.js",
  "scripts/components/risk-widget.js",
  "scripts/components/workflow-widgets.js",
  "scripts/components/supplier-widgets.js",
  "scripts/components/performance-widgets.js",
  "scripts/views/operations-view.js"
];

test("operations workbench omits workflow funnel and workflow todo panels", () => {
  const { window } = loadApp(operationsViewFiles);
  const { data, store, views } = window.SupplierDashboard;
  const html = views.renderOperationsView(data, store.getState());

  assert.equal(html.includes("流程漏斗"), false);
  assert.equal(html.includes("我的流程待办"), false);
});
