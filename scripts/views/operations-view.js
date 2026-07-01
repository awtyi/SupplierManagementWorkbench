(function defineOperationsView(global) {
  "use strict";

  const ns = global.SupplierDashboard;
  const { metricCard } = ns.ui;

  function renderOperationsView(data, state) {
    const suppliers = ns.metrics.getSupplierScope(data, "operations");
    const summary = ns.metrics.getSummary(data, suppliers);

    const cards = [
      metricCard("我负责的供应商", summary.total, "当前人员作为负责人/管理员", "blue"),
      metricCard("待处理流程", summary.pendingWorkflows, "审批中、待提交、退回、逾期", summary.pendingWorkflows ? "orange" : "green"),
      metricCard("临期/逾期评估任务", summary.dueOrOverduePerformanceTasks, "未来7天到期或已逾期的绩效评估", summary.dueOrOverduePerformanceTasks ? "red" : "green"),
      metricCard("未关闭风险", summary.openRiskCount, "我负责供应商的未关闭风险总数", summary.openRiskCount ? "red" : "green"),
      metricCard("整改中供应商", summary.remediationSuppliers, "需要推进整改闭环", summary.remediationSuppliers ? "orange" : "green"),
      metricCard("证照异常供应商", summary.certificateAttentionSuppliers, "已过期或未来30天临期", summary.certificateAttentionSuppliers ? "red" : "green")
    ].join("");

    return `<div class="dashboard-view">
      <section class="section-grid grid-6">${cards}</section>

      <section class="section-grid grid-1 operations-exception-row">
        <div>${ns.widgets.riskWidget(data, suppliers, {
          visibleRows: 3,
          method: state.operationsRiskMethod,
          methodAction: "set-operations-risk-method"
        })}</div>
      </section>

      <section class="section-grid grid-3">
        <div>${ns.widgets.distributionPanel("我负责的供应商级别", "当前人员负责范围", suppliers, "level")}</div>
        <div>${ns.widgets.distributionPanel("注册状态分布", "按注册状态统计当前负责供应商", suppliers, "registrationStatus")}</div>
      </section>

      <section class="section-grid grid-1">
        <div>${ns.widgets.performanceOverviewWidget(data, suppliers, state.operationsPerformanceOverviewCategoryId, "set-operations-performance-overview-category", {
          trendGranularity: state.operationsPerformanceTrendGranularity,
          trendGranularityAction: "set-operations-performance-trend-granularity",
          trendKpi: state.operationsPerformanceTrendKpi,
          trendKpiAction: "set-operations-performance-trend-kpi"
        })}</div>
      </section>

      <section class="section-grid grid-1">
        <div>${ns.widgets.segmentMatrixWidget(data, suppliers, state.operationsSegmentCategoryId, state.operationsSegmentSupplierId, {
          categoryAction: "set-operations-segment-category",
          supplierAction: "set-operations-segment-supplier"
        })}</div>
      </section>

      <section class="section-grid grid-1">
        <div>${ns.widgets.attentionTable(
          data,
          suppliers,
          state.operationsSupplierAttentionCategoryId,
          "供应商关注清单",
          "set-operations-supplier-attention-category",
          state.operationsSupplierAttentionPage,
          "set-operations-supplier-attention-page"
        )}</div>
      </section>
    </div>`;
  }

  ns.views = ns.views || {};
  ns.views.renderOperationsView = renderOperationsView;
})(window);
