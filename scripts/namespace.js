(function bootstrapSupplierDashboard(global) {
  "use strict";

  const namespace = global.SupplierDashboard || {};

  namespace.util = {
    escapeHtml(value) {
      return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    },
    formatInteger(value) {
      return new Intl.NumberFormat("zh-CN", {
        maximumFractionDigits: 0
      }).format(Number(value || 0));
    },
    formatPercent(value) {
      return `${(Number(value || 0) * 100).toFixed(1)}%`;
    }
  };

  global.SupplierDashboard = namespace;
})(window);
