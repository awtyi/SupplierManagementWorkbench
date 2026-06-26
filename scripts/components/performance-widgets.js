(function definePerformanceWidgets(global) {
  "use strict";

  const ns = global.SupplierDashboard;
  const { escapeHtml } = ns.util;
  const { panel, tag, categorySelect, table, list } = ns.ui;

  function taskProgressWidget(data, suppliers, title = "绩效任务进度") {
    const summary = ns.metrics.getPerformanceTaskSummary(data, suppliers, "all");
    const statusRows = [
      { label: "已完成", value: summary.completed, color: "#20b26b" },
      { label: "进行中", value: summary.inProgress, color: "#2f7df6" },
      { label: "已逾期", value: summary.overdue, color: "#f05b57" }
    ];
    return panel(
      title,
      "任务进度允许组件内选择全部品类；得分/等级分析必须单选品类",
      `<div class="compact-donut">
        ${ns.charts.donutChart(statusRows, { height: 150 })}
        <div class="chart-legend">
          <span>应完成 ${summary.total}</span>
          <span>周期性评估 ${summary.periodic}</span>
          <span>一次性评估 ${summary.oneOff}</span>
        </div>
      </div>`,
      categorySelect("noop-category-all", data.categories, "all", true)
    );
  }

  function performanceOverviewWidget(data, suppliers, selectedCategoryId, categoryAction = "set-management-performance-category") {
    let perf;
    try {
      perf = ns.selectors.performanceByCategory(data, suppliers, selectedCategoryId);
    } catch (error) {
      return panel("品类绩效概览", "采购品类必须单选", `<div class="empty-note">${escapeHtml(error.message)}</div>`);
    }
    if (!perf.hasAssessments) {
      const message = perf.supplierCount
        ? `${perf.categoryName} 下已有 ${perf.supplierCount} 家供应商，但暂无绩效评估结果。完成评估后将展示等级分布、趋势、薄弱 KPI 和排名。`
        : `${perf.categoryName} 下暂无供应商，暂不能生成绩效概览。`;
      return panel(
        "品类绩效概览",
        `${perf.categoryName} · 暂无可分析的绩效结果`,
        `<div class="empty-note">${escapeHtml(message)}</div>`,
        categorySelect(categoryAction, data.categories, selectedCategoryId, false)
      );
    }

    const gradeBody = ns.charts.donutChart(
      perf.gradeDistribution.map((item) => ({
        label: item.label,
        value: item.value,
        color: item.color
      }))
    );
    const trendBody = ns.charts.lineChart(perf.trend);
    const weakKpis = perf.kpiAverages.map((item) => ({
      label: item.label,
      value: item.value,
      color: item.value < 75 ? "#f05b57" : item.value < 85 ? "#f59f22" : "#20b26b"
    }));

    const rankingRows = perf.ranking.slice(0, 6);
    return panel(
      "品类绩效概览",
      `${perf.categoryName} · 自定义等级、趋势、KPI 和同品类排名联动`,
      `<div class="performance-overview-grid">
        <div class="performance-overview-block">
          <h3 class="mini-title">等级分布</h3>
          ${gradeBody}
        </div>
        <div class="performance-overview-block">
          <h3 class="mini-title">平均得分趋势</h3>
          ${trendBody}
        </div>
        <div class="performance-overview-block">
          <h3 class="mini-title">薄弱 KPI</h3>
          ${ns.charts.progressRows(weakKpis)}
        </div>
        <div class="performance-overview-block">
          <h3 class="mini-title">同品类供应商排名</h3>
          ${table(["供应商", "得分", "等级"], rankingRows, (row) => `<tr data-open-supplier="${escapeHtml(row.supplierId)}">
            <td>${escapeHtml(row.supplierName)}</td>
            <td><strong class="mono">${row.score}</strong></td>
            <td>${tag(row.grade.label, row.score >= 85 ? "green" : row.score >= 75 ? "blue" : "orange")}</td>
          </tr>`)}
        </div>
      </div>`,
      categorySelect(categoryAction, data.categories, selectedCategoryId, false)
    );
  }

  function performanceAttentionWidget(data, suppliers, selectedCategoryId, categoryAction = "set-operations-performance-attention-category") {
    const perf = ns.selectors.performanceByCategory(data, suppliers, selectedCategoryId);
    const rows = perf.decliningSuppliers.slice(0, 6).map((item) => `<button class="list-item" data-open-supplier="${escapeHtml(item.supplierId)}">
      <span>
        <span class="item-title">${escapeHtml(item.supplierName)}</span>
        <span class="item-meta">上期 ${item.previousScore} → 本期 ${item.latestScore}</span>
      </span>
      ${tag(`${item.drop}分`, "red")}
    </button>`);

    return panel(
      "绩效变化关注",
      `${perf.categoryName} · 仅展示同一采购品类内的下降供应商`,
      list(rows),
      categorySelect(categoryAction, data.categories, selectedCategoryId, false)
    );
  }

  ns.widgets = ns.widgets || {};
  Object.assign(ns.widgets, {
    taskProgressWidget,
    performanceOverviewWidget,
    performanceAttentionWidget
  });
})(window);
