(function defineManagementView(global) {
  "use strict";

  const ns = global.SupplierDashboard;
  const { metricCard } = ns.ui;

  function renderManagementView(data, state) {
    const suppliers = ns.metrics.getSupplierScope(data, "management");
    const summary = ns.metrics.getSummary(data, suppliers);

    const cards = [
      metricCard("供应商总数", summary.total, "权限组织内全部供应商", "blue"),
      metricCard("待改善供应商", summary.improvementSegmentSuppliers, "需改善或可剔除且未淘汰", summary.improvementSegmentSuppliers ? "orange" : "green"),
      metricCard("风险供应商", summary.riskSuppliers, "存在未关闭风险的去重供应商", summary.riskSuppliers ? "red" : "green"),
      metricCard("绩效下降供应商", summary.decliningPerformanceSuppliers, "最近两期绩效得分下降", summary.decliningPerformanceSuppliers ? "orange" : "green"),
      metricCard("整改中供应商", summary.remediationSuppliers, "未完成整改闭环", summary.remediationSuppliers ? "orange" : "green"),
      metricCard("证照异常供应商", summary.certificateAttentionSuppliers, "已过期或未来30天临期", summary.certificateAttentionSuppliers ? "red" : "green")
    ].join("");

    return `<div class="dashboard-view">
      <section class="section-grid grid-6">${cards}</section>

      <section class="section-grid grid-3">
        <div>
          <div class="layout-stack management-side-stack">
            ${ns.widgets.sourceRegistrationWidget(suppliers)}
            ${ns.widgets.orgDistributionWidget(data, suppliers)}
          </div>
        </div>
        <div class="span-2">${ns.widgets.riskWidget(data, suppliers, {
          visibleRows: 4,
          method: state.managementRiskMethod,
          methodAction: "set-management-risk-method"
        })}</div>
      </section>

      <section class="section-grid grid-3">
        <div>${ns.widgets.distributionPanel("供应商级别分布", "新的/注册/推荐/潜在/优秀/合格/淘汰", suppliers, "level")}</div>
        <div class="span-2">${ns.widgets.supplierGrowthFunnelWidget(suppliers)}</div>
      </section>

      <section class="section-grid grid-1">
        <div>${ns.widgets.categoryCertificationOverviewWidget(data, suppliers)}</div>
      </section>

      <section class="section-grid grid-1">
        <div>${ns.widgets.relationshipMatrixWidget(data, suppliers, state.relationshipCategoryId)}</div>
      </section>

      <section class="section-grid grid-1">
        <div>${ns.widgets.performanceOverviewWidget(data, suppliers, state.managementPerformanceCategoryId, "set-management-performance-category", {
          trendGranularity: state.managementPerformanceTrendGranularity,
          trendGranularityAction: "set-management-performance-trend-granularity",
          trendKpi: state.managementPerformanceTrendKpi,
          trendKpiAction: "set-management-performance-trend-kpi"
        })}</div>
      </section>

      <section class="section-grid grid-1">
        <div>${ns.widgets.segmentMatrixWidget(data, suppliers, state.managementSegmentCategoryId, state.managementSegmentSupplierId)}</div>
      </section>

      <section class="section-grid grid-1">
        <div class="span-2">${ns.widgets.attentionTable(
          data,
          suppliers,
          state.managementAttentionCategoryId,
          "管理关注清单",
          "set-management-attention-category",
          state.managementAttentionPage,
          "set-management-attention-page"
        )}</div>
      </section>
    </div>`;
  }

  ns.views = ns.views || {};
  ns.views.renderManagementView = renderManagementView;
})(window);
