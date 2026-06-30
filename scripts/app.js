(function runSupplierDashboard(global) {
  "use strict";

  const ns = global.SupplierDashboard;
  const data = ns.data;

  function validatePerformanceConfig() {
    const issues = ns.metrics.validatePerformanceConfig?.(data.performanceConfig) || [];
    if (issues.length) {
      console.warn("绩效等级映射配置存在异常：", issues);
    }
  }

  function updateHeader(state) {
    const scope = document.getElementById("scope-description");
    const buttons = document.querySelectorAll("[data-view]");
    buttons.forEach((button) => {
      const pressed = button.getAttribute("data-view") === state.view;
      button.setAttribute("aria-pressed", String(pressed));
    });
    if (!scope) {
      return;
    }
    scope.textContent =
      state.view === "management"
        ? "管理决策版：查看当前管理者权限组织内全部供应商，重点观察健康风险、资源结构与关系组合。"
        : "业务运营版：只查看当前人员负责的供应商，异常处置与流程推进等权展示。";
  }

  function render() {
    const state = ns.store.getState();
    const app = document.getElementById("app");
    if (!app) {
      return;
    }
    updateHeader(state);
    app.innerHTML =
      state.view === "operations"
        ? ns.views.renderOperationsView(data, state)
        : ns.views.renderManagementView(data, state);
    ns.widgets.syncRiskCarouselHeights?.(app);
    ns.widgets.syncCategoryCertificationHeights?.(app);
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const viewButton = event.target.closest("[data-view]");
      if (viewButton) {
        ns.store.setState({ view: viewButton.getAttribute("data-view") });
        return;
      }

      const segmentPoint = event.target.closest("[data-segment-supplier]");
      if (segmentPoint) {
        const supplierId = segmentPoint.getAttribute("data-segment-supplier");
        const action = segmentPoint.getAttribute("data-segment-action");
        if (action === "set-operations-segment-supplier") {
          ns.store.setState({ operationsSegmentSupplierId: supplierId });
        } else {
          ns.store.setState({ managementSegmentSupplierId: supplierId });
        }
        return;
      }

      const supplierButton = event.target.closest("[data-open-supplier]");
      if (supplierButton) {
        ns.drawer.renderSupplierDetail(data, supplierButton.getAttribute("data-open-supplier"));
        return;
      }

      const attentionPageButton = event.target.closest("[data-attention-page-action]");
      if (attentionPageButton) {
        const action = attentionPageButton.getAttribute("data-attention-page-action");
        const page = Number(attentionPageButton.getAttribute("data-attention-page")) || 1;
        if (action === "set-management-attention-page") {
          ns.store.setState({ managementAttentionPage: page });
        }
        if (action === "set-operations-supplier-attention-page") {
          ns.store.setState({ operationsSupplierAttentionPage: page });
        }
        return;
      }

      if (event.target.closest("[data-close-drawer]")) {
        ns.drawer.closeDrawer();
        return;
      }

      const drawer = document.getElementById("detail-drawer");
      if (
        drawer?.classList.contains("is-open") &&
        !event.target.closest("#detail-drawer") &&
        !event.target.closest("[data-open-supplier]")
      ) {
        ns.drawer.closeDrawer();
      }
    });

    document.addEventListener("change", (event) => {
      const target = event.target;
      const action = target.getAttribute("data-action");
      if (action === "set-relationship-category") {
        ns.store.setState({ relationshipCategoryId: target.value });
      }
      if (action === "set-management-performance-category") {
        ns.store.setState({ managementPerformanceCategoryId: target.value });
      }
      if (action === "set-management-attention-category") {
        ns.store.setState({ managementAttentionCategoryId: target.value, managementAttentionPage: 1 });
      }
      if (action === "set-management-risk-method") {
        ns.store.setState({ managementRiskMethod: target.value });
      }
      if (action === "set-management-segment-category") {
        ns.store.setState({ managementSegmentCategoryId: target.value, managementSegmentSupplierId: "" });
      }
      if (action === "set-operations-segment-category") {
        ns.store.setState({ operationsSegmentCategoryId: target.value, operationsSegmentSupplierId: "" });
      }
      if (action === "set-operations-supplier-attention-category") {
        ns.store.setState({ operationsSupplierAttentionCategoryId: target.value, operationsSupplierAttentionPage: 1 });
      }
      if (action === "set-operations-performance-overview-category") {
        ns.store.setState({ operationsPerformanceOverviewCategoryId: target.value });
      }
      if (action === "set-operations-risk-method") {
        ns.store.setState({ operationsRiskMethod: target.value });
      }
    });
  }

  validatePerformanceConfig();
  bindEvents();
  render();
  ns.store.subscribe(render);
})(window);
