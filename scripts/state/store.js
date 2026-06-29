(function defineStore(global) {
  "use strict";

  const ns = global.SupplierDashboard;

  const state = {
    view: "management",
    managementPerformanceCategoryId: "CAT-STEEL",
    managementAttentionCategoryId: "CAT-STEEL",
    managementRiskMethod: "LS",
    managementSegmentCategoryId: "CAT-STEEL",
    managementSegmentSupplierId: "",
    relationshipCategoryId: "all",
    operationsSupplierAttentionCategoryId: "CAT-IT",
    operationsPerformanceAttentionCategoryId: "CAT-IT",
    operationsPerformanceOverviewCategoryId: "CAT-IT",
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
