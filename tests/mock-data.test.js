const test = require("node:test");
const assert = require("node:assert/strict");
const { loadApp } = require("./helpers/load-app");

const files = [
  "scripts/namespace.js",
  "scripts/data/mock-data.js"
];

test("mock data has deterministic role scopes and valid references", () => {
  const { window } = loadApp(files);
  const data = window.SupplierDashboard.data;
  const supplierIds = new Set(data.suppliers.map((item) => item.id));
  const categoryIds = new Set(data.categories.map((item) => item.id));

  assert.equal(data.currentUserId, "U100");
  assert.equal(data.suppliers.length, 12);
  assert.equal(
    data.suppliers.filter((item) => item.ownerId === data.currentUserId).length,
    5
  );

  for (const risk of data.risks) {
    assert.equal(supplierIds.has(risk.supplierId), true);
    assert.equal(risk.lsScore, risk.likelihood * risk.severity);
  }
  for (const assessment of data.assessments) {
    assert.equal(supplierIds.has(assessment.supplierId), true);
    assert.equal(categoryIds.has(assessment.categoryId), true);
  }
  for (const supplier of data.suppliers) {
    for (const categoryId of supplier.categoryIds) {
      assert.ok(
        ["high", "low"].includes(supplier.categoryAttractiveness[categoryId])
      );
    }
  }
});

test("category-specific grade and KPI configuration exists for every category", () => {
  const { window } = loadApp(files);
  const data = window.SupplierDashboard.data;

  for (const category of data.categories) {
    assert.ok(data.performanceConfig[category.id]);
    assert.ok(data.performanceConfig[category.id].grades.length >= 3);
    assert.ok(data.performanceConfig[category.id].kpis.length >= 3);
  }
});
