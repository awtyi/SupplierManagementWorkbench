(function definePerformanceWidgets(global) {
  "use strict";

  const ns = global.SupplierDashboard;
  const { escapeHtml } = ns.util;
  const { panel, tag, categorySelect, toolbarField, list } = ns.ui;

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
      toolbarField("采购品类", categorySelect("noop-category-all", data.categories, "all", true))
    );
  }

  function toolbarSelect(action, selectedValue, options) {
    return `<select class="toolbar-select" data-action="${escapeHtml(action)}">${options
      .map((item) => `<option value="${escapeHtml(item.value)}" ${item.value === selectedValue ? "selected" : ""}>${escapeHtml(item.label)}</option>`)
      .join("")}</select>`;
  }

  function gradeTone(score) {
    if (score >= 85) {
      return "green";
    }
    if (score >= 75) {
      return "blue";
    }
    return "orange";
  }

  function rankingList(title, rows, tone = "normal", emptyText = `${title}暂无数据`) {
    return `<div class="ranking-list ranking-list-${escapeHtml(tone)}">
      <p class="ranking-list-title">${escapeHtml(title)}</p>
      ${
        rows.length
          ? rows
              .map(
                (row, index) => `<button type="button" class="ranking-item" data-open-supplier="${escapeHtml(row.supplierId)}">
                  <span class="ranking-index">${index + 1}</span>
                  <span class="ranking-name">${escapeHtml(row.supplierName)}</span>
                  <strong class="ranking-score mono">${row.score}</strong>
                  ${tag(row.grade.label, gradeTone(row.score))}
                </button>`
              )
              .join("")
          : `<div class="empty-note compact-empty-note">${escapeHtml(emptyText)}</div>`
      }
    </div>`;
  }

  function kpiTone(value) {
    if (value < 75) {
      return { label: "薄弱", tone: "weak" };
    }
    if (value < 85) {
      return { label: "关注", tone: "watch" };
    }
    return { label: "稳定", tone: "stable" };
  }

  function weakKpiList(items) {
    if (!items.length) {
      return `<div class="empty-note compact-empty-note">暂无薄弱 KPI 数据</div>`;
    }

    return `<div class="weak-kpi-list">
      ${items
        .map((item, index) => {
          const tone = kpiTone(item.value);
          return `<div class="weak-kpi-item weak-kpi-${tone.tone}">
            <span class="weak-kpi-index">${index + 1}</span>
            <span class="weak-kpi-name">${escapeHtml(item.label)}</span>
            <strong class="weak-kpi-score mono">${item.value}</strong>
            <span class="weak-kpi-tag">${escapeHtml(tone.label)}</span>
          </div>`;
        })
        .join("")}
    </div>`;
  }

  function performanceOverviewWidget(data, suppliers, selectedCategoryId, categoryAction = "set-management-performance-category", options = {}) {
    const trendGranularity = options.trendGranularity || "quarter";
    const trendKpi = options.trendKpi || "total";
    let perf;
    try {
      perf = ns.selectors.performanceByCategory(data, suppliers, selectedCategoryId, {
        trendGranularity,
        trendKpi
      });
    } catch (error) {
      return panel("品类绩效概览", "采购品类必须单选", `<div class="empty-note">${escapeHtml(error.message)}</div>`);
    }
    const controls = [
      toolbarField("采购品类", categorySelect(categoryAction, data.categories, selectedCategoryId, false)),
      toolbarField("统计周期", toolbarSelect(options.trendGranularityAction || "noop-performance-trend-granularity", trendGranularity, [
        { value: "month", label: "月" },
        { value: "quarter", label: "季度" },
        { value: "half", label: "半年" },
        { value: "year", label: "年" }
      ])),
      toolbarField("KPI", toolbarSelect(options.trendKpiAction || "noop-performance-trend-kpi", trendKpi, perf.kpiOptions))
    ].join("");
    if (!perf.hasAssessments) {
      const message = perf.supplierCount
        ? `${perf.categoryName} 下已有 ${perf.supplierCount} 家供应商，但暂无绩效评估结果。完成评估后将展示绩效趋势、等级分布、薄弱 KPI TOP5、供应商排名和多维绩效分析。`
        : `${perf.categoryName} 下暂无供应商，暂不能生成绩效概览。`;
      return panel(
        "品类绩效概览",
        `${perf.categoryName} · 暂无可分析的绩效结果`,
        `<div class="empty-note">${escapeHtml(message)}</div>`,
        controls
      );
    }

    const gradeBody = ns.charts.donutChart(
      perf.gradeDistribution.map((item) => ({
        label: item.label,
        value: item.value,
        color: item.color
      }))
    );
    const trendBody = ns.charts.multiLineChart(perf.trendLabels, perf.trendSeries, { height: 300 });
    const weakKpis = perf.kpiAverages.slice(0, 5);
    const radarBody = ns.charts.radarChart(perf.radar.axes, perf.radar.series, { height: 430 });

    const firstGrade = perf.gradeDistribution[0];
    const lastGrade = perf.gradeDistribution.at(-1);
    const topRankingRows = perf.ranking
      .filter((item) => item.grade.id === firstGrade.id)
      .slice(0, 3);
    const attentionRankingRows = [...perf.ranking]
      .reverse()
      .filter((item) => item.grade.id === lastGrade.id)
      .slice(0, 3);
    return panel(
      "品类绩效概览",
      `${perf.categoryName} · 趋势、等级、排名、KPI与多维分析`,
      `<div class="performance-overview-grid">
        <div class="performance-overview-block performance-overview-wide">
          <h3 class="mini-title">绩效趋势分析</h3>
          <p class="block-note">按${escapeHtml(perf.selectedKpiLabel)}展示该品类下各供应商最近一年的绩效变化。</p>
          ${trendBody}
        </div>
        <div class="performance-overview-left">
          <div class="performance-overview-block">
            <h3 class="mini-title">供应商排名</h3>
            <p class="block-note">优秀仅展示第一等级，待关注仅展示倒数第一等级。</p>
            <div class="ranking-dual-list">
              ${rankingList("优秀 TOP3", topRankingRows, "top", `暂无${firstGrade.label}供应商`)}
              ${rankingList("待关注 TOP3", attentionRankingRows, "attention", `暂无${lastGrade.label}供应商`)}
            </div>
          </div>
          <div class="performance-overview-lower">
            <div class="performance-overview-block">
              <h3 class="mini-title">等级分布</h3>
              ${gradeBody}
            </div>
            <div class="performance-overview-block">
              <h3 class="mini-title">薄弱 KPI TOP5</h3>
              <p class="block-note">按最近一次评估的 KPI 平均分由低到高展示；低于75为薄弱，75-84.9为关注，85及以上为稳定。</p>
              ${weakKpiList(weakKpis)}
            </div>
          </div>
        </div>
        <div class="performance-overview-block performance-overview-radar">
          <h3 class="mini-title">多维绩效分析</h3>
          ${radarBody}
        </div>
      </div>`,
      controls
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
      toolbarField("采购品类", categorySelect(categoryAction, data.categories, selectedCategoryId, false))
    );
  }

  ns.widgets = ns.widgets || {};
  Object.assign(ns.widgets, {
    taskProgressWidget,
    performanceOverviewWidget,
    performanceAttentionWidget
  });
})(window);
