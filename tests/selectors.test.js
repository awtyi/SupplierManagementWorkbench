const test = require("node:test");
const assert = require("node:assert/strict");
const { loadApp } = require("./helpers/load-app");

const files = [
  "scripts/namespace.js",
  "scripts/data/mock-data.js",
  "scripts/domain/metrics.js",
  "scripts/domain/selectors.js"
];

function normalize(value) {
  return JSON.parse(JSON.stringify(value));
}

function recordsForSuppliers(records, suppliers) {
  const supplierIds = new Set(suppliers.map((item) => item.id));
  return records.filter((item) => supplierIds.has(item.supplierId));
}

function latestAssessmentsForCategory(data, suppliers, categoryId) {
  const supplierIds = new Set(suppliers.map((item) => item.id));
  const assessments = data.assessments.filter(
    (item) => supplierIds.has(item.supplierId) && item.categoryId === categoryId
  );
  const latestBySupplier = new Map();

  for (const assessment of assessments) {
    const current = latestBySupplier.get(assessment.supplierId);
    if (!current || assessment.period > current.period) {
      latestBySupplier.set(assessment.supplierId, assessment);
    }
  }

  return {
    assessments,
    latest: Array.from(latestBySupplier.values())
  };
}

test("score analysis rejects an empty or all-category selection", () => {
  const { window } = loadApp(files);
  const { data, metrics, selectors } = window.SupplierDashboard;
  const suppliers = metrics.getSupplierScope(data, "management");

  assert.throws(
    () => selectors.performanceByCategory(data, suppliers, "all"),
    /采购品类必须单选/
  );
  assert.throws(
    () => selectors.performanceByCategory(data, suppliers, ""),
    /采购品类必须单选/
  );
});

test("steel category analysis resolves ranking trend KPI averages and declines from records", () => {
  const { window } = loadApp(files);
  const { data, metrics, selectors } = window.SupplierDashboard;
  const suppliers = metrics.getSupplierScope(data, "management");
  const result = selectors.performanceByCategory(data, suppliers, "CAT-STEEL");
  const { assessments, latest } = latestAssessmentsForCategory(data, suppliers, "CAT-STEEL");
  const supplierById = Object.fromEntries(suppliers.map((item) => [item.id, item]));
  const config = data.performanceConfig["CAT-STEEL"];
  const periods = [...new Set(assessments.map((item) => item.period))].sort();

  const expectedRanking = latest
    .map((item) => ({
      supplierId: item.supplierId,
      supplierName: supplierById[item.supplierId].name,
      score: item.score,
      gradeId: metrics.getGrade(item.score, config.grades).id
    }))
    .sort((left, right) => right.score - left.score);
  const expectedTrend = periods.map((period) => {
    const periodItems = assessments.filter((item) => item.period === period);
    return {
      label: period,
      value: Number(
        (
          periodItems.reduce((sum, item) => sum + item.score, 0) / periodItems.length
        ).toFixed(1)
      )
    };
  });
  const expectedKpiAverages = config.kpis
    .map((label, index) => {
      const scores = latest.map((item) => item.kpiScores[index]);
      return {
        label,
        value: Number(
          (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)
        )
      };
    })
    .sort((left, right) => left.value - right.value);
  const expectedDecliningSuppliers = Array.from(
    assessments.reduce((accumulator, item) => {
      if (!accumulator.has(item.supplierId)) {
        accumulator.set(item.supplierId, []);
      }
      accumulator.get(item.supplierId).push(item);
      return accumulator;
    }, new Map()).entries()
  )
    .map(([supplierId, history]) => {
      const ordered = [...history].sort((left, right) => left.period.localeCompare(right.period));
      if (ordered.length < 2) {
        return null;
      }

      return {
        supplierId,
        drop: ordered.at(-1).score - ordered.at(-2).score
      };
    })
    .filter((item) => item && item.drop < 0)
    .sort((left, right) => left.drop - right.drop);

  assert.equal(result.categoryName, "钢结构件");
  assert.deepEqual(
    normalize(result.gradeDistribution.map((item) => item.label)),
    normalize(config.grades.map((item) => item.label))
  );
  assert.deepEqual(
    normalize(
      result.ranking.map((item) => ({
        supplierId: item.supplierId,
        supplierName: item.supplierName,
        score: item.score,
        gradeId: item.grade.id
      }))
    ),
    normalize(expectedRanking)
  );
  assert.deepEqual(normalize(result.trend), normalize(expectedTrend));
  assert.deepEqual(normalize(result.kpiAverages), normalize(expectedKpiAverages));
  assert.deepEqual(
    normalize(
      result.decliningSuppliers.map((item) => ({
        supplierId: item.supplierId,
        drop: item.drop
      }))
    ),
    normalize(expectedDecliningSuppliers)
  );
});

test("attention selectors only surface suppliers needing action within scope", () => {
  const { window } = loadApp(files);
  const { data, metrics, selectors } = window.SupplierDashboard;
  const suppliers = metrics.getSupplierScope(data, "operations");
  const attention = selectors.operationsAttention(data, suppliers);
  const expectedSupplierIds = suppliers
    .filter((supplier) => {
      const hasOpenRisk = recordsForSuppliers(data.risks, [supplier]).some(
        (item) => item.status === "open"
      );
      const hasOpenRemediation = recordsForSuppliers(data.remediations, [supplier]).some(
        (item) => item.status !== "completed"
      );
      const certificateExpired = supplier.certificateExpiry < data.today;
      const certificateExpiring =
        supplier.certificateExpiry >= data.today &&
        supplier.certificateExpiry <= "2026-07-25";

      return (
        hasOpenRisk ||
        hasOpenRemediation ||
        supplier.blacklisted ||
        certificateExpired ||
        certificateExpiring ||
        supplier.level === "淘汰" ||
        ["可剔除", "需改善"].includes(supplier.segment)
      );
    })
    .map((item) => item.id);

  assert.deepEqual(
    normalize(attention.map((item) => item.id).sort()),
    normalize(expectedSupplierIds.sort())
  );
  assert.equal(attention[0].id, "S005");
});
