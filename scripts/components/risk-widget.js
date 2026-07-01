(function defineRiskWidget(global) {
  "use strict";

  const ns = global.SupplierDashboard;
  const { escapeHtml } = ns.util;
  const { panel, toolbarField } = ns.ui;

  const riskTone = { critical: "red", elevated: "red-orange", high: "red", medium: "orange", low: "green", negligible: "gray" };
  const riskLabel = { critical: "高", elevated: "较高", high: "高", medium: "中", low: "低", negligible: "可忽略" };
  const riskColor = {
    critical: "#f05b57",
    elevated: "#ff7a45",
    high: "#f05b57",
    medium: "#ff8f1f",
    low: "#f5c542",
    negligible: "#9aa2af"
  };
  const riskWeight = { critical: 5, elevated: 4, high: 3, medium: 2, low: 1, negligible: 0 };
  const riskHeightObservers = [];
  const lecLikelihoodValue = {
    5: 10,
    4: 6,
    3: 3,
    2: 1,
    1: 0.5
  };
  const lecConsequenceValue = {
    5: 100,
    4: 40,
    3: 15,
    2: 7,
    1: 3
  };
  const exposureByType = {
    compliance: 6,
    certificate: 6,
    quality: 3,
    delivery: 3,
    capacity: 3,
    performance: 2,
    registration: 2,
    service: 1,
    price: 1
  };
  const lecLevels = [
    { id: "critical", label: "高", description: "极其危险", min: 320.01, color: riskColor.critical },
    { id: "elevated", label: "较高", description: "高度危险", min: 160.01, color: riskColor.elevated },
    { id: "medium", label: "中", description: "显著危险", min: 70.01, color: riskColor.medium },
    { id: "low", label: "低", description: "一般危险", min: 20.01, color: riskColor.low },
    { id: "negligible", label: "可忽略", description: "稍有危险", min: 0.01, color: riskColor.negligible }
  ];

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
    return risk.consequence || lecConsequenceValue[risk.severity] || 1;
  }

  function likelihoodScore(risk) {
    return risk.lecLikelihood || lecLikelihoodValue[risk.likelihood] || 0.1;
  }

  function lecScore(risk) {
    return Number((likelihoodScore(risk) * exposureScore(risk) * consequenceScore(risk)).toFixed(2));
  }

  function lecLevel(score) {
    return lecLevels.find((item) => score >= item.min)?.id || "negligible";
  }

  function scoreRisk(risk, method) {
    const score = method === "LEC" ? lecScore(risk) : lsScore(risk);
    return {
      ...risk,
      score,
      displayLevel: method === "LEC" ? lecLevel(score) : lsLevel(score),
      lecLikelihood: likelihoodScore(risk),
      exposure: exposureScore(risk),
      consequence: consequenceScore(risk)
    };
  }

  function levelRows(risks, method = "LS") {
    if (method === "LEC") {
      return lecLevels.map((level) => ({
        label: level.label,
        value: risks.filter((item) => item.displayLevel === level.id).length,
        color: level.color
      }));
    }

    return [
      { label: "高风险", value: risks.filter((item) => item.displayLevel === "high").length, color: riskColor.high },
      { label: "中风险", value: risks.filter((item) => item.displayLevel === "medium").length, color: riskColor.medium },
      { label: "低风险", value: risks.filter((item) => item.displayLevel === "low").length, color: "#20b26b" }
    ];
  }

  function renderRiskLevelCards(items, modifier) {
    return `<div class="risk-level-cards ${escapeHtml(modifier)}">
      ${items
        .map((item) => `<span class="risk-level-card" style="--c:${item.color}">
          <em>${escapeHtml(item.label)}</em>
          <strong>${item.value}</strong>
        </span>`)
        .join("")}
    </div>`;
  }

  function renderLsMatrix(risks) {
    const levelCards = renderRiskLevelCards(levelRows(risks, "LS"), "is-ls");
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
      ${levelCards}
      <div class="risk-matrix-wrap">
        <span class="risk-axis-y">严重度 S：高 ↑</span>
        <div class="risk-matrix-grid">${cells}</div>
        <span class="risk-axis-x">可能性 L：低 → 高</span>
      </div>
    </div>`;
  }

  function renderLecBubblePlot(risks) {
    const width = 460;
    const height = 250;
    const plot = { left: 42, top: 18, right: 432, bottom: 204 };
    const likelihoodScale = [0.1, 0.2, 0.5, 1, 3, 6, 10];
    const consequenceScale = [1, 3, 7, 15, 40, 100];
    const scaleIndex = (scale, value) => Math.max(0, scale.findIndex((item) => item === value));
    const xFor = (likelihood) =>
      plot.left + (scaleIndex(likelihoodScale, likelihood) / (likelihoodScale.length - 1)) * (plot.right - plot.left);
    const yFor = (consequence) =>
      plot.bottom - (scaleIndex(consequenceScale, consequence) / (consequenceScale.length - 1)) * (plot.bottom - plot.top);
    const radiusFor = (exposure) => 6 + Math.min(12, exposure * 1.8);
    const levelCards = renderRiskLevelCards(
      lecLevels.map((level) => ({
        ...level,
        value: risks.filter((item) => item.displayLevel === level.id).length
      })),
      "is-lec"
    );
    const groupedIndex = new Map();
    const bubbles = risks
      .map((risk) => {
        const key = `${risk.lecLikelihood}-${risk.consequence}`;
        const index = groupedIndex.get(key) || 0;
        groupedIndex.set(key, index + 1);
        const offsetRing = index % 6;
        const offsetX = [0, 9, -9, 6, -6, 0][offsetRing];
        const offsetY = [0, 4, -4, -8, 8, 10][offsetRing];
        const x = xFor(risk.lecLikelihood) + offsetX;
        const y = yFor(risk.consequence) + offsetY;
        const radius = radiusFor(risk.exposure);
        const title = `${risk.title}：L${risk.lecLikelihood} / E${risk.exposure} / C${risk.consequence} / LEC ${risk.score}`;
        return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${riskColor[risk.displayLevel]}" fill-opacity="0.78" stroke="#fff" stroke-width="2">
          <title>${escapeHtml(title)}</title>
        </circle>`;
      })
      .join("");
    const xTicks = likelihoodScale
      .map((value) => `<g>
        <line x1="${xFor(value)}" y1="${plot.top}" x2="${xFor(value)}" y2="${plot.bottom}" stroke="#edf2f8"></line>
        <text x="${xFor(value)}" y="${height - 20}" text-anchor="middle" fill="#6b778c" font-size="10">${value}</text>
      </g>`)
      .join("");
    const yTicks = consequenceScale
      .map((value) => `<g>
        <line x1="${plot.left}" y1="${yFor(value)}" x2="${plot.right}" y2="${yFor(value)}" stroke="#edf2f8"></line>
        <text x="16" y="${yFor(value) + 4}" fill="#6b778c" font-size="10">${value}</text>
      </g>`)
      .join("");

    return `<div class="risk-analysis-card">
      <div class="risk-analysis-head">
        <h3 class="mini-title">LEC风险气泡图</h3>
        <span>横轴L · 纵轴C · 气泡大小E</span>
      </div>
      ${levelCards}
      <div class="lec-bubble-chart">
        <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img" aria-label="LEC风险气泡图">
          ${xTicks}
          ${yTicks}
          <line x1="${plot.left}" y1="${plot.bottom}" x2="${plot.right}" y2="${plot.bottom}" stroke="#cfd9e8"></line>
          <line x1="${plot.left}" y1="${plot.top}" x2="${plot.left}" y2="${plot.bottom}" stroke="#cfd9e8"></line>
          ${bubbles}
          <text x="${(plot.left + plot.right) / 2}" y="${height - 3}" text-anchor="middle" fill="#526173" font-size="11" font-weight="800">可能性 L：低 → 高</text>
          <text x="10" y="${(plot.top + plot.bottom) / 2}" text-anchor="middle" fill="#526173" font-size="11" font-weight="800" transform="rotate(-90 10 ${(plot.top + plot.bottom) / 2})">后果 C：低 → 高</text>
        </svg>
        <div class="lec-bubble-legend">
          <span class="lec-size-note">气泡越大，暴露频次 E 越高</span>
        </div>
      </div>
    </div>`;
  }

  function riskWidget(data, suppliers, options = {}) {
    const scrollThreshold = options.visibleRows || 4;
    const method = options.method === "LEC" ? "LEC" : "LS";
    const methodAction = options.methodAction || "noop-risk-method";
    const supplierIds = new Set(suppliers.map((item) => item.id));
    const supplierById = Object.fromEntries(suppliers.map((item) => [item.id, item]));
    const openRisks = data.risks
      .filter((item) => supplierIds.has(item.supplierId) && ns.metrics.isOpenRiskStatus(item.status))
      .map((item) => scoreRisk(item, method))
      .sort((a, b) => b.score - a.score);
    const analysis = method === "LEC" ? renderLecBubblePlot(openRisks) : renderLsMatrix(openRisks);
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
          <span>${escapeHtml(risk.status === "open" ? "分析中" : risk.status)}</span>
          <time>${escapeHtml(risk.createdAt)}</time>
        </span>
      </button>`;
    });
    const shouldScroll = recent.length > scrollThreshold;
    const carouselRows = shouldScroll ? [...riskRows, ...riskRows] : riskRows;
    const carousel = `<div class="risk-carousel" data-risk-carousel style="--risk-duration:${Math.max(
      18,
      recent.length * 2.2
    )}s">
      <h3 class="risk-carousel-title">近20条未关闭风险</h3>
      <div class="risk-carousel-window">
        <div class="risk-carousel-track ${shouldScroll ? "" : "is-static"}">
          ${carouselRows.join("")}
        </div>
      </div>
    </div>`;

    return panel(
      "风险预警",
      "",
      `<div class="risk-layout">
        <div class="risk-left" data-risk-left>
          ${analysis}
        </div>
        ${carousel}
      </div>`,
      toolbarField("风险矩阵", `<select class="toolbar-select" data-action="${escapeHtml(methodAction)}" aria-label="风险矩阵">
        <option value="LS" ${method === "LS" ? "selected" : ""}>LS评价法</option>
        <option value="LEC" ${method === "LEC" ? "selected" : ""}>LEC评价法</option>
      </select>`)
    );
  }

  function syncRiskCarouselHeights(root = document) {
    riskHeightObservers.splice(0).forEach((observer) => observer.disconnect());
    const layouts = [...root.querySelectorAll(".risk-layout")];
    layouts.forEach((layout) => {
      const left = layout.querySelector("[data-risk-left]");
      const carousel = layout.querySelector("[data-risk-carousel]");
      const title = carousel?.querySelector(".risk-carousel-title");
      const windowElement = carousel?.querySelector(".risk-carousel-window");
      if (!left || !carousel || !title || !windowElement) {
        return;
      }

      const update = () => {
        const leftHeight = left.getBoundingClientRect().height;
        const titleStyle = getComputedStyle(title);
        const titleHeight =
          title.getBoundingClientRect().height +
          parseFloat(titleStyle.marginTop || 0) +
          parseFloat(titleStyle.marginBottom || 0);
        const height = Math.max(0, Math.floor(leftHeight - titleHeight));
        windowElement.style.height = `${height}px`;
      };

      update();
      if (!global.ResizeObserver) {
        return;
      }
      const observer = new ResizeObserver(update);
      observer.observe(left);
      observer.observe(title);
      riskHeightObservers.push(observer);
    });
  }

  ns.widgets = ns.widgets || {};
  ns.widgets.riskWidget = riskWidget;
  ns.widgets.syncRiskCarouselHeights = syncRiskCarouselHeights;
})(window);
