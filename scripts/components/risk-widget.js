(function defineRiskWidget(global) {
  "use strict";

  const ns = global.SupplierDashboard;
  const { escapeHtml } = ns.util;
  const { panel } = ns.ui;

  const riskTone = { high: "red", medium: "orange", low: "green" };
  const riskLabel = { high: "高", medium: "中", low: "低" };
  const riskColor = { high: "#f05b57", medium: "#f59f22", low: "#20b26b" };
  const riskWeight = { high: 3, medium: 2, low: 1 };

  function riskWidget(data, suppliers, options = {}) {
    const visibleRows = options.visibleRows || 4;
    const supplierIds = new Set(suppliers.map((item) => item.id));
    const supplierById = Object.fromEntries(suppliers.map((item) => [item.id, item]));
    const openRisks = data.risks
      .filter((item) => supplierIds.has(item.supplierId) && item.status === "open")
      .sort((a, b) => b.lsScore - a.lsScore);
    const levelItems = [
      { label: "高风险", value: openRisks.filter((item) => item.level === "high").length, color: riskColor.high },
      { label: "中风险", value: openRisks.filter((item) => item.level === "medium").length, color: riskColor.medium },
      { label: "低风险", value: openRisks.filter((item) => item.level === "low").length, color: riskColor.low }
    ];
    const matrix = [5, 4, 3, 2, 1]
      .map((severity) =>
        [1, 2, 3, 4, 5]
          .map((likelihood) => {
            const cellRisks = openRisks.filter(
              (item) => item.severity === severity && item.likelihood === likelihood
            );
            const count = cellRisks.length;
            const score = severity * likelihood;
            const highestLevel = cellRisks
              .map((item) => item.level)
              .sort((left, right) => riskWeight[right] - riskWeight[left])[0];
            const color = highestLevel
              ? riskColor[highestLevel]
              : score >= 12
                ? riskColor.high
                : score >= 6
                  ? riskColor.medium
                  : riskColor.low;
            return `<rect x="${(likelihood - 1) * 32}" y="${(5 - severity) * 26}" width="28" height="22" rx="4" fill="${color}" opacity="${count ? 0.95 : 0.16}"></rect>
              ${count ? `<text x="${(likelihood - 1) * 32 + 14}" y="${(5 - severity) * 26 + 15}" text-anchor="middle" fill="#fff" font-size="11" font-weight="800">${count}</text>` : ""}`;
          })
          .join("")
      )
      .join("");
    const recent = openRisks.slice(0, 20);
    const riskRows = recent.map((risk) => {
      const supplier = supplierById[risk.supplierId];
      return `<button class="risk-card" data-open-supplier="${escapeHtml(risk.supplierId)}">
        <span class="risk-card-level ${riskTone[risk.level]}">${escapeHtml(riskLabel[risk.level])}</span>
        <span class="risk-card-main">
          <span class="risk-card-title">${escapeHtml(risk.title)}</span>
          <span class="risk-card-subtitle">${escapeHtml(supplier?.name || risk.supplierId)}</span>
        </span>
        <span class="risk-card-side">
          <span>分析中</span>
          <time>${escapeHtml(risk.createdAt)}</time>
        </span>
      </button>`;
    });
    const shouldScroll = recent.length > visibleRows;
    const carouselRows = shouldScroll ? [...riskRows, ...riskRows] : riskRows;
    const carousel = `<div class="risk-carousel" style="--risk-rows:${visibleRows};--risk-duration:${Math.max(
      18,
      recent.length * 2.2
    )}s">
      <h3 class="risk-carousel-title">近20条风险</h3>
      <div class="risk-carousel-window">
        <div class="risk-carousel-track ${shouldScroll ? "" : "is-static"}">
          ${carouselRows.join("")}
        </div>
      </div>
    </div>`;

    return panel(
      "风险预警",
      "组件内筛选：风险等级 / 风险类型 / 时间范围",
      `<div class="risk-layout">
        <div>
          <div class="chart-wrap">
            <svg viewBox="0 0 160 130" width="100%" height="160" role="img">
              ${matrix}
            </svg>
          </div>
          ${ns.charts.progressRows(levelItems)}
        </div>
        ${carousel}
      </div>`,
      `<select class="toolbar-select" aria-label="风险评价法">
        <option selected>LS评价法</option>
        <option>LEC评价法</option>
      </select>`
    );
  }

  ns.widgets = ns.widgets || {};
  ns.widgets.riskWidget = riskWidget;
})(window);
