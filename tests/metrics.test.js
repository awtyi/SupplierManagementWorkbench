const test = require("node:test");
const assert = require("node:assert/strict");
const { loadApp } = require("./helpers/load-app");

const files = [
  "scripts/namespace.js",
  "scripts/data/mock-data.js",
  "scripts/domain/metrics.js"
];

function normalize(value) {
  return JSON.parse(JSON.stringify(value));
}

function recordsForSuppliers(records, suppliers) {
  const supplierIds = new Set(suppliers.map((item) => item.id));
  return records.filter((item) => supplierIds.has(item.supplierId));
}

test("management and operations scopes follow role rules", () => {
  const { window } = loadApp(files);
  const { data, metrics } = window.SupplierDashboard;

  const expectedManagement = data.suppliers.filter((item) =>
    data.managementOrgIds.includes(item.orgId)
  );
  const expectedOperations = data.suppliers.filter(
    (item) => item.ownerId === data.currentUserId
  );

  assert.deepEqual(
    metrics.getSupplierScope(data, "management").map((item) => item.id),
    expectedManagement.map((item) => item.id)
  );
  assert.deepEqual(
    metrics.getSupplierScope(data, "operations").map((item) => item.id),
    expectedOperations.map((item) => item.id)
  );
});

test("summary metrics are derived from scoped supplier records", () => {
  const { window } = loadApp(files);
  const { data, metrics } = window.SupplierDashboard;
  const suppliers = metrics.getSupplierScope(data, "management");
  const summary = metrics.getSummary(data, suppliers);
  const scopedRisks = recordsForSuppliers(data.risks, suppliers).filter(
    (item) => item.status === "open"
  );
  const scopedRemediations = recordsForSuppliers(data.remediations, suppliers).filter(
    (item) => item.status !== "completed"
  );
  const scopedTasks = recordsForSuppliers(data.performanceTasks, suppliers);
  const scopedWorkflows = recordsForSuppliers(data.workflows, suppliers);

  const expected = {
    total: suppliers.length,
    registrationCompleted: suppliers.filter(
      (item) => item.registrationStatus === "注册完成"
    ).length,
    riskSuppliers: new Set(scopedRisks.map((item) => item.supplierId)).size,
    blacklisted: suppliers.filter((item) => item.blacklisted).length,
    remediationSuppliers: new Set(scopedRemediations.map((item) => item.supplierId)).size,
    performanceCompletion:
      scopedTasks.filter((item) => item.status === "completed").length / scopedTasks.length,
    pendingWorkflows: scopedWorkflows.filter((item) => item.status !== "已完成").length,
    overdueWorkflows: scopedWorkflows.filter((item) => item.status === "已逾期").length,
    expiringCertificates: suppliers.filter(
      (item) =>
        item.certificateExpiry >= data.today && item.certificateExpiry <= "2026-07-25"
    ).length
  };

  assert.deepEqual(normalize(summary), expected);
});

test("performance task summary respects supplier scope and category filter", () => {
  const { window } = loadApp(files);
  const { data, metrics } = window.SupplierDashboard;
  const suppliers = metrics.getSupplierScope(data, "operations");
  const expectedTasks = recordsForSuppliers(data.performanceTasks, suppliers).filter(
    (item) => item.categoryId === "CAT-STEEL"
  );
  const completed = expectedTasks.filter((item) => item.status === "completed").length;

  assert.deepEqual(
    normalize(metrics.getPerformanceTaskSummary(data, suppliers, "CAT-STEEL")),
    {
      total: expectedTasks.length,
      completed,
      inProgress: expectedTasks.filter((item) => item.status === "in_progress").length,
      overdue: expectedTasks.filter((item) => item.status === "overdue").length,
      periodic: expectedTasks.filter((item) => item.type === "periodic").length,
      oneOff: expectedTasks.filter((item) => item.type === "one-off").length,
      completionRate: completed / expectedTasks.length
    }
  );
});

test("grade resolution uses the selected category configuration", () => {
  const { window } = loadApp(files);
  const { data, metrics } = window.SupplierDashboard;

  assert.equal(metrics.getGrade(90, data.performanceConfig["CAT-IT"].grades).id, "A");
  assert.equal(metrics.getGrade(90, data.performanceConfig["CAT-STEEL"].grades).id, "B1");
});
