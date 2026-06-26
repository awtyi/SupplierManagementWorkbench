(function defineManagementView(global) {
  "use strict";

  const ns = global.SupplierDashboard;
  const { metricCard, formatPercent } = ns.ui;

  function renderManagementView(data, state) {
    const suppliers = ns.metrics.getSupplierScope(data, "management");
    const summary = ns.metrics.getSummary(data, suppliers);

    const cards = [
      metricCard("供应商总数", summary.total, "权限组织内全部供应商", "blue"),
      metricCard("注册完成供应商", summary.registrationCompleted, "注册状态 = 注册完成", "green"),
      metricCard("风险供应商", summary.riskSuppliers, "存在未关闭风险的去重供应商", summary.riskSuppliers ? "red" : "green"),
      metricCard("黑名单供应商", summary.blacklisted, "黑名单或关联异常供应商", summary.blacklisted ? "red" : "green"),
      metricCard("整改中供应商", summary.remediationSuppliers, "未完成整改闭环", summary.remediationSuppliers ? "orange" : "green"),
      metricCard("绩效任务完成率", formatPercent(summary.performanceCompletion), "全部品类任务进度汇总", "purple")
    ].join("");

    return `<div class="dashboard-view">
      <section class="section-grid grid-6">${cards}</section>

      <section class="section-grid grid-3">
        <div class="span-2">${ns.widgets.riskWidget(data, suppliers, { visibleRows: 4 })}</div>
        <div>${ns.widgets.orgDistributionWidget(data, suppliers)}</div>
      </section>

      <section class="section-grid grid-3">
        <div>${ns.widgets.distributionPanel("供应商区分分布", "可剔除/需改善/有价值/优选", suppliers, "segment")}</div>
        <div>${ns.widgets.distributionPanel("供应商级别分布", "新的/注册/推荐/潜在/优秀/合格/淘汰", suppliers, "level")}</div>
        <div>${ns.widgets.taskProgressWidget(data, suppliers, "组织绩效任务进度")}</div>
      </section>

      <section class="section-grid grid-3">
        <div>${ns.widgets.sourceRegistrationWidget(suppliers)}</div>
        <div class="span-2">${ns.widgets.relationshipMatrixWidget(data, suppliers, state.relationshipCategoryId)}</div>
      </section>

      <section class="section-grid grid-1">
        <div>${ns.widgets.performanceOverviewWidget(data, suppliers, state.managementPerformanceCategoryId, "set-management-performance-category")}</div>
      </section>

      <section class="section-grid grid-1">
        <div class="span-2">${ns.widgets.attentionTable(data, suppliers, state.managementAttentionCategoryId, "管理关注清单", "set-management-attention-category")}</div>
      </section>
    </div>`;
  }

  ns.views = ns.views || {};
  ns.views.renderManagementView = renderManagementView;
})(window);
