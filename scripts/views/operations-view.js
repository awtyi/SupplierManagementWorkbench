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
      metricCard("已逾期任务", summary.overdueWorkflows, "流程或评估已超过截止时间", summary.overdueWorkflows ? "red" : "green"),
      metricCard("未关闭风险", summary.riskSuppliers, "按供应商去重统计", summary.riskSuppliers ? "red" : "green"),
      metricCard("整改中供应商", summary.remediationSuppliers, "需要推进整改闭环", summary.remediationSuppliers ? "orange" : "green"),
      metricCard("证照临期供应商", summary.expiringCertificates, "未来 30 天内临期", summary.expiringCertificates ? "orange" : "green")
    ].join("");

    return `<div class="dashboard-view">
      <section class="section-grid grid-6">${cards}</section>

      <section class="section-grid grid-3 operations-exception-row">
        <div class="span-2">${ns.widgets.riskWidget(data, suppliers, {
          visibleRows: 3,
          method: state.operationsRiskMethod,
          methodAction: "set-operations-risk-method"
        })}</div>
        <div>${ns.widgets.remediationWidget(data, suppliers)}</div>
      </section>

      <section class="section-grid grid-3">
        <div>${ns.widgets.distributionPanel("我负责的供应商级别", "当前人员负责范围", suppliers, "level")}</div>
        <div>${ns.widgets.distributionPanel("注册状态分布", "直接读取注册状态枚举", suppliers, "registrationStatus")}</div>
      </section>

      <section class="section-grid grid-1">
        <div>${ns.widgets.performanceOverviewWidget(data, suppliers, state.operationsPerformanceOverviewCategoryId, "set-operations-performance-overview-category")}</div>
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
