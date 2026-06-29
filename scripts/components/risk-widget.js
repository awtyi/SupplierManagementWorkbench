(function defineRiskWidget(global) {
  "use strict";

  const ns = global.SupplierDashboard;
  const { escapeHtml } = ns.util;
  const { panel } = ns.ui;

  const riskTone = { high: "red", medium: "orange", low: "green" };
  const riskLabel = { high: "高", medium: "中", low: "低" };
  const riskColor = { high: "#f05b57", medium: "#f59f22", low: "#20b26b" };
  const riskWeight = { high: 3, medium: 2, low: 1 };
  const exposureByType = {
    compliance: 6,
    certificate: 6,
    quality: 3,
    delivery: 3,
    capacity: 3,
    performance: 2,
    registration: 2,
    service: 2,
    price: 2
  };

  function lsScore(risk) {
    return risk.likelihood * risk.severity;
  }

  function lsLevel(score) {
    if (score >= 12) {
      return "high";
    }
    if (score >= 6) {
      return "medium";
    }
    return "low";
  }

  function exposureScore(risk) {
    return risk.exposure || exposureByType[risk.type] || 1;
  }

  function consequenceScore(risk) {
    return risk.consequence || risk.severity * 3;
  }

  function lecScore(risk) {
    return risk.likelihood * exposureScore(risk) * consequenceScore(risk);
  }

  function lecLevel(score) {
    if (score >= 120) {
      return "high";
    }
    if (score >= 45) {
      return "medium";
    }
    return "low";
  }

  function scoreRisk(risk, method) {
    const score = method === "LEC" ? lecScore(risk) : lsScore(risk);
    return {
      ...risk,
      score,
      displayLevel: method === "LEC" ? lecLevel(score) : lsLevel(score),
      exposure: exposureScore(risk),
      consequence: consequenceScore(risk)
    };
  }

  function levelRows(risks) {
    return [
      { label: "高风险", value: risks.filter((item) => item.displayLevel === "high").length, color: riskColor.high },
      { label: "中风险", value: risks.filter((item) => item.displayLevel === "medium").length, color: riskColor.medium },
      { label: "低风险", value: risks.filter((item) => item.displayLevel === "low").length, color: riskColor.low }
    ];
  }

  function renderLsMatrix(risks) {
    const cells = [5, 4, 3, 2, 1]
      .map((severity) =>
        [1, 2, 3, 4, 5]
          .map((likelihood) => {
            const cellRisks = risks.filter(
              (item) => item.severity === severity && item.likelihood === likelihood
            );
            const level = cellRisks.length
              ? cellRisks
                  .map((item) => item.displayLevel)
                  .sort((left, right) => riskWeight[right] - riskWeight[left])[0]
              : lsLevel(likelihood * severity);
            const title = `L${likelihood} × S${severity}：${cellRisks.length}条`;
            return `<span class="risk-matrix-cell ${level} ${cellRisks.length ? "has-data" : ""}" title="${escapeHtml(title)}">
              ${cellRisks.length ? `<strong>${cellRisks.length}</strong>` : ""}
            </span>`;
          })
          .join("")
      )
      .join("");

    return `<div class="risk-analysis-card">
      <div class="risk-analysis-head">
        <h3 class="mini-title">LS风险矩阵</h3>
        <span>格内数字为未关闭风险数量</span>
      </div>
      <div class="risk-matrix-wrap">
        <span class="risk-axis-y">严重度 S：高 ↑</span>
        <div class="risk-matrix-grid">${cells}</div>
        <span class="risk-axis-x">可能性 L：低 → 高</span>
      </div>
    </div>`;
  }

  function renderLecSummary(risks) {
    const maxRisk = risks[0];
    const scoreBands = [
      { label: "重大 120+", value: risks.filter((item) => item.score >= 120).length, color: riskColor.high },
      { label: "关注 45-119", value: risks.filter((item) => item.score >= 45 && item.score < 120).length, color: riskColor.medium },
      { label: "观察 20-44", value: risks.filter((item) => item.score >= 20 && item.score < 45).length, color: "#16a6a0" },
      { label: "低位 <20", value: risks.filter((item) => item.score < 20).length, color: riskColor.low }
    ];
    const factorCards = maxRisk
      ? [
          { label: "最高LEC", value: maxRisk.score },
          { label: "L可能性", value: maxRisk.likelihood },
          { label: "E暴露", value: maxRisk.exposure },
          { label: "C后果", value: maxRisk.consequence }
        ]
      : [
          { label: "最高LEC", value: 0 },
          { label: "L可能性", value: 0 },
          { label: "E暴露", value: 0 },
          { label: "C后果", value: 0 }
        ];

    return `<div class="risk-analysis-card">
      <div class="risk-analysis-head">
        <h3 class="mini-title">LEC风险分布</h3>
        <span>L × E × C 三因子评分</span>
      </div>
      <div class="lec-factor-grid">
        ${factorCards
          .map((item) => `<span><em>${escapeHtml(item.label)}</em><strong>${item.value}</strong></span>`)
          .join("")}
      </div>
      <h3 class="mini-title risk-subtitle">LEC分值区间</h3>
      ${ns.charts.progressRows(scoreBands)}
    </div>`;
  }

  function riskWidget(data, suppliers, options = {}) {
    const visibleRows = options.visibleRows || 4;
    const method = options.method === "LEC" ? "LEC" : "LS";
    const methodAction = options.methodAction || "noop-risk-method";
    const supplierIds = new Set(suppliers.map((item) => item.id));
    const supplierById = Object.fromEntries(suppliers.map((item) => [item.id, item]));
    const openRisks = data.risks
      .filter((item) => supplierIds.has(item.supplierId) && item.status === "open")
      .map((item) => scoreRisk(item, method))
      .sort((a, b) => b.score - a.score);
    const levelItems = levelRows(openRisks);
    const analysis = method === "LEC" ? renderLecSummary(openRisks) : renderLsMatrix(openRisks);
    const recent = openRisks.slice(0, 20);
    const riskRows = recent.map((risk) => {
      const supplier = supplierById[risk.supplierId];
      return `<button class="risk-card" data-open-supplier="${escapeHtml(risk.supplierId)}">
        <span class="risk-card-level ${riskTone[risk.displayLevel]}">${escapeHtml(riskLabel[risk.displayLevel])}</span>
        <span class="risk-card-main">
          <span class="risk-card-title">${escapeHtml(risk.title)}</span>
          <span class="risk-card-subtitle">${escapeHtml(supplier?.name || risk.supplierId)} · ${method} ${risk.score}</span>
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
      "组件内筛选：风险矩阵",
      `<div class="risk-layout">
        <div>
          ${analysis}
          ${ns.charts.progressRows(levelItems)}
        </div>
        ${carousel}
      </div>`,
      `<select class="toolbar-select" data-action="${escapeHtml(methodAction)}" aria-label="风险评价法">
        <option value="LS" ${method === "LS" ? "selected" : ""}>LS评价法</option>
        <option value="LEC" ${method === "LEC" ? "selected" : ""}>LEC评价法</option>
      </select>`
    );
  }

  ns.widgets = ns.widgets || {};
  ns.widgets.riskWidget = riskWidget;
})(window);
