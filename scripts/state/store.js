(function defineStore(global) {
  "use strict";

  const ns = global.SupplierDashboard;

  const state = {
    view: "management",
    managementPerformanceCategoryId: "CAT-STEEL",
    managementPerformanceTrendGranularity: "quarter",
    managementPerformanceTrendKpi: "total",
    managementAttentionCategoryId: "all",
    managementAttentionPage: 1,
    managementRiskMethod: "LS",
    managementSegmentCategoryId: "CAT-STEEL",
    managementSegmentSupplierId: "",
    relationshipCategoryId: "all",
    operationsSupplierAttentionCategoryId: "all",
    operationsSupplierAttentionPage: 1,
    operationsPerformanceOverviewCategoryId: "CAT-IT",
    operationsPerformanceTrendGranularity: "quarter",
    operationsPerformanceTrendKpi: "total",
    operationsSegmentCategoryId: "CAT-IT",
    operationsSegmentSupplierId: "",
    operationsRiskMethod: "LS"
  };

  const listeners = new Set();

  function getState() {
    return { ...state };
  }

  function setState(partial) {
    Object.assign(state, partial);
    listeners.forEach((listener) => listener(getState()));
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  ns.store = { getState, setState, subscribe };
})(window);
