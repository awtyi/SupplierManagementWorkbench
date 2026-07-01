(function defineSelectors(global) {
  "use strict";

  const ns = global.SupplierDashboard;
  const { metrics } = ns;

  function supplierMap(suppliers) {
    return Object.fromEntries(suppliers.map((item) => [item.id, item]));
  }

  const chartColors = ["#2f7df6", "#20b26b", "#f59f22", "#f05b57", "#7057e8", "#68c7c1", "#9b6b43", "#4b5563"];

  function parseAssessmentPeriod(period) {
    const quarterMatch = String(period).match(/^(\d{4})-Q([1-4])$/);
    if (quarterMatch) {
      return {
        year: Number(quarterMatch[1]),
        month: (Number(quarterMatch[2]) - 1) * 3 + 1
      };
    }

    const monthMatch = String(period).match(/^(\d{4})-(\d{2})$/);
    if (monthMatch) {
      return {
        year: Number(monthMatch[1]),
        month: Number(monthMatch[2])
      };
    }

    const yearMatch = String(period).match(/^(\d{4})$/);
    if (yearMatch) {
      return {
        year: Number(yearMatch[1]),
        month: 1
      };
    }

    return {
      year: 1970,
      month: 1
    };
  }

  function periodSortValue(period) {
    const parsed = parseAssessmentPeriod(period);
    return parsed.year * 12 + parsed.month;
  }

  function bucketLabel(period, granularity) {
    const parsed = parseAssessmentPeriod(period);
    return bucketLabelFromParts(parsed.year, parsed.month, granularity);
  }

  function bucketLabelFromParts(year, month, granularity) {
    if (granularity === "month") {
      return `${year}-${String(month).padStart(2, "0")}`;
    }
    if (granularity === "half") {
      return `${year}H${month <= 6 ? 1 : 2}`;
    }
    if (granularity === "year") {
      return String(year);
    }
    return `${year}-Q${Math.floor((month - 1) / 3) + 1}`;
  }

  function continuousTrendLabels(startSortValue, endSortValue, granularity) {
    const labels = [];
    for (let value = startSortValue; value <= endSortValue; value += 1) {
      const normalized = value - 1;
      const year = Math.floor(normalized / 12);
      const month = normalized % 12 + 1;
      const label = bucketLabelFromParts(year, month, granularity);
      if (!labels.includes(label)) {
        labels.push(label);
      }
    }
    return labels;
  }

  function getAssessmentValue(assessment, kpiIndex) {
    if (kpiIndex == null) {
      return assessment.score;
    }
    return assessment.kpiScores[kpiIndex] ?? assessment.score;
  }

  function performanceByCategory(data, suppliers, categoryId, options = {}) {
    if (!categoryId || categoryId === "all") {
      throw new Error("绩效得分、等级、排名和KPI分析的采购品类必须单选");
    }

    const category = data.categories.find((item) => item.id === categoryId);
    const config = data.performanceConfig[categoryId];
    const granularity = options.trendGranularity || "quarter";
    const selectedKpiValue = options.trendKpi || "total";
    const selectedKpiIndex = selectedKpiValue === "total" ? null : Number(selectedKpiValue);
    const kpiOptions = [
      { value: "total", label: "总分" },
      ...config.kpis.map((label, index) => ({ value: String(index), label }))
    ];
    const selectedKpiLabel = selectedKpiIndex == null
      ? "总分"
      : config.kpis[selectedKpiIndex] || "总分";
    const supplierIds = new Set(suppliers.map((item) => item.id));
    const assessments = data.assessments.filter(
      (item) =>
        supplierIds.has(item.supplierId) &&
        item.categoryId === categoryId &&
        metrics.isCertifiedForCategory(data, item.supplierId, categoryId)
    );
    const categorySuppliers = suppliers.filter((item) =>
      metrics.isCertifiedForCategory(data, item.id, categoryId)
    );
    const suppliersById = supplierMap(suppliers);
    const latestBySupplier = new Map();

    for (const assessment of assessments) {
      const current = latestBySupplier.get(assessment.supplierId);
      if (!current || periodSortValue(assessment.period) > periodSortValue(current.period)) {
        latestBySupplier.set(assessment.supplierId, assessment);
      }
    }

    const latest = Array.from(latestBySupplier.values());
    if (!latest.length) {
      return {
        categoryId,
        categoryName: category.name,
        supplierCount: categorySuppliers.length,
        hasAssessments: false,
        gradeDistribution: config.grades.map((grade) => ({
          id: grade.id,
          label: grade.label,
          color: grade.color,
          value: 0
        })),
        ranking: [],
        trend: [],
        trendSeries: [],
        trendLabels: [],
        kpiAverages: [],
        kpiOptions,
        selectedKpiLabel,
        radar: { axes: config.kpis, series: [] },
        decliningSuppliers: []
      };
    }
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

    const latestSortValue = Math.max(...assessments.map((item) => periodSortValue(item.period)));
    const oneYearStart = latestSortValue - 11;
    const recentAssessments = assessments.filter((item) => periodSortValue(item.period) >= oneYearStart);
    const trendLabels = continuousTrendLabels(oneYearStart, latestSortValue, granularity);
    const trendSeries = Array.from(latestBySupplier.keys())
      .map((supplierId, index) => {
        const supplierAssessments = recentAssessments.filter((item) => item.supplierId === supplierId);
        const points = trendLabels.map((label) => {
          const periodItems = supplierAssessments.filter((item) => bucketLabel(item.period, granularity) === label);
          if (!periodItems.length) {
            return null;
          }
          return Number(
            (
              periodItems.reduce((sum, item) => sum + getAssessmentValue(item, selectedKpiIndex), 0) /
              periodItems.length
            ).toFixed(1)
          );
        });
        return {
          supplierId,
          label: suppliersById[supplierId].name,
          color: chartColors[index % chartColors.length],
          points
        };
      })
      .filter((item) => item.points.some((point) => point != null));
    const trend = trendLabels.map((label, index) => {
      const values = trendSeries
        .map((series) => series.points[index])
        .filter((value) => value != null);
      return {
        label,
        value: values.length
          ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1))
          : 0
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

    const radar = {
      axes: config.kpis,
      series: latest
        .map((item, index) => ({
          supplierId: item.supplierId,
          label: suppliersById[item.supplierId].name,
          color: chartColors[index % chartColors.length],
          values: config.kpis.map((_, kpiIndex) => item.kpiScores[kpiIndex] ?? 0)
        }))
        .sort((left, right) => left.label.localeCompare(right.label, "zh-Hans-CN"))
    };

    const historyBySupplier = assessments.reduce((accumulator, item) => {
      if (!accumulator[item.supplierId]) {
        accumulator[item.supplierId] = [];
      }

      accumulator[item.supplierId].push(item);
      return accumulator;
    }, {});

    const decliningSuppliers = Object.entries(historyBySupplier)
      .map(([supplierId, history]) => {
        const ordered = [...history].sort((left, right) => periodSortValue(left.period) - periodSortValue(right.period));
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
      supplierCount: categorySuppliers.length,
      hasAssessments: true,
      gradeDistribution,
      ranking,
      trend,
      trendSeries,
      trendLabels,
      kpiAverages,
      kpiOptions,
      selectedKpiLabel,
      radar,
      decliningSuppliers
    };
  }

  function managementAttention(data, suppliers) {
    const openRisks = metrics.recordsForSuppliers(data.risks, suppliers).filter(
      (item) => metrics.isOpenRiskStatus(item.status)
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
          item.level !== "淘汰" &&
          (item.openRiskCount > 0 ||
            item.remediation ||
            item.blacklisted ||
            item.certificateExpired ||
            item.certificateExpiring ||
            ["可剔除", "需改善"].includes(item.segment))
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
