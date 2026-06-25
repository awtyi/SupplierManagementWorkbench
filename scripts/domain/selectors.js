(function defineSelectors(global) {
  "use strict";

  const ns = global.SupplierDashboard;
  const { metrics } = ns;

  function supplierMap(suppliers) {
    return Object.fromEntries(suppliers.map((item) => [item.id, item]));
  }

  function performanceByCategory(data, suppliers, categoryId) {
    if (!categoryId || categoryId === "all") {
      throw new Error("绩效得分、等级、排名和KPI分析的采购品类必须单选");
    }

    const category = data.categories.find((item) => item.id === categoryId);
    const config = data.performanceConfig[categoryId];
    const supplierIds = new Set(suppliers.map((item) => item.id));
    const assessments = data.assessments.filter(
      (item) => supplierIds.has(item.supplierId) && item.categoryId === categoryId
    );
    const suppliersById = supplierMap(suppliers);
    const latestBySupplier = new Map();

    for (const assessment of assessments) {
      const current = latestBySupplier.get(assessment.supplierId);
      if (!current || assessment.period > current.period) {
        latestBySupplier.set(assessment.supplierId, assessment);
      }
    }

    const latest = Array.from(latestBySupplier.values());
    const ranking = latest
      .map((item) => ({
        supplierId: item.supplierId,
        supplierName: suppliersById[item.supplierId].name,
        score: item.score,
        grade: metrics.getGrade(item.score, config.grades)
      }))
      .sort((left, right) => right.score - left.score);

    const gradeDistribution = config.grades.map((grade) => ({
      id: grade.id,
      label: grade.label,
      color: grade.color,
      value: ranking.filter((item) => item.grade.id === grade.id).length
    }));

    const periods = [...new Set(assessments.map((item) => item.period))].sort();
    const trend = periods.map((period) => {
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

    const kpiAverages = config.kpis
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

    const historyBySupplier = assessments.reduce((accumulator, item) => {
      if (!accumulator[item.supplierId]) {
        accumulator[item.supplierId] = [];
      }

      accumulator[item.supplierId].push(item);
      return accumulator;
    }, {});

    const decliningSuppliers = Object.entries(historyBySupplier)
      .map(([supplierId, history]) => {
        const ordered = [...history].sort((left, right) => left.period.localeCompare(right.period));
        if (ordered.length < 2) {
          return null;
        }

        return {
          supplierId,
          supplierName: suppliersById[supplierId].name,
          previousScore: ordered.at(-2).score,
          latestScore: ordered.at(-1).score,
          drop: ordered.at(-1).score - ordered.at(-2).score
        };
      })
      .filter((item) => item && item.drop < 0)
      .sort((left, right) => left.drop - right.drop);

    return {
      categoryId,
      categoryName: category.name,
      gradeDistribution,
      ranking,
      trend,
      kpiAverages,
      decliningSuppliers
    };
  }

  function managementAttention(data, suppliers) {
    const openRisks = metrics.recordsForSuppliers(data.risks, suppliers).filter(
      (item) => item.status === "open"
    );
    const remediationBySupplier = Object.fromEntries(
      metrics.recordsForSuppliers(data.remediations, suppliers).map((item) => [
        item.supplierId,
        item
      ])
    );

    return suppliers
      .map((supplier) => ({
        ...supplier,
        openRiskCount: openRisks.filter((item) => item.supplierId === supplier.id).length,
        remediation: remediationBySupplier[supplier.id] || null,
        certificateExpired: supplier.certificateExpiry < data.today,
        certificateExpiring:
          supplier.certificateExpiry >= data.today &&
          supplier.certificateExpiry <= "2026-07-25"
      }))
      .filter(
        (item) =>
          item.openRiskCount > 0 ||
          item.remediation ||
          item.blacklisted ||
          item.certificateExpired ||
          item.certificateExpiring ||
          item.level === "淘汰" ||
          ["可剔除", "需改善"].includes(item.segment)
      )
      .sort((left, right) => {
        const leftWeight = left.openRiskCount * 10 + (left.blacklisted ? 8 : 0);
        const rightWeight = right.openRiskCount * 10 + (right.blacklisted ? 8 : 0);
        return rightWeight - leftWeight;
      });
  }

  function operationsAttention(data, suppliers) {
    return managementAttention(data, suppliers);
  }

  ns.selectors = {
    performanceByCategory,
    managementAttention,
    operationsAttention
  };
})(window);
