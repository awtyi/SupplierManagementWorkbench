(function defineSupplierWidgets(global) {
  "use strict";

  const ns = global.SupplierDashboard;
  const { escapeHtml } = ns.util;
  const { panel, tag, table, categorySelect } = ns.ui;

  const palette = ["#2f7df6", "#20b26b", "#f59f22", "#f05b57", "#7457e8", "#16a6a0", "#8c98a8"];
  const remediationStatusText = {
    plan_missing: "未提交整改计划",
    in_progress: "整改中",
    feedback: "待反馈",
    overdue: "已逾期",
    completed: "已完成"
  };

  function countItems(items, key) {
    return Object.entries(ns.metrics.groupCount(items, key)).map(([label, value], index) => ({
      label,
      value,
      color: palette[index % palette.length]
    }));
  }

  function distributionPanel(title, subtitle, items, key) {
    return panel(title, subtitle, ns.charts.donutChart(countItems(items, key)));
  }

  function orgDistributionWidget(data, suppliers) {
    const risks = ns.metrics.recordsForSuppliers(data.risks, suppliers).filter((item) => item.status === "open");
    const byOrg = data.organizations
      .map((org) => {
        const orgSuppliers = suppliers.filter((item) => item.orgId === org.id);
        const orgSupplierIds = new Set(orgSuppliers.map((item) => item.id));
        return {
          label: org.name,
          value: orgSuppliers.length,
          risk: new Set(risks.filter((item) => orgSupplierIds.has(item.supplierId)).map((item) => item.supplierId)).size,
          registered: orgSuppliers.filter((item) => item.registrationStatus === "注册完成").length
        };
      })
      .filter((item) => item.value);
    const max = Math.max(1, ...byOrg.map((item) => item.value));
    return panel(
      "采购组织分布",
      "总量底条、注册完成进度与风险供应商标记",
      `<div class="org-bullet-list">${byOrg
        .map((item) => {
          const totalWidth = Math.max(8, Math.round((item.value / max) * 100));
          const registeredWidth = Math.round((item.registered / item.value) * totalWidth);
          const riskOffset = Math.min(100, Math.max(7, Math.round((item.risk / max) * 100)));
          return `<div class="org-bullet">
            <div class="org-bullet-head">
              <strong>${escapeHtml(item.label)}</strong>
              <span>${item.value} 家</span>
            </div>
            <div class="org-bullet-track">
              <i class="org-bullet-total" style="--w:${totalWidth}%"></i>
              <i class="org-bullet-registered" style="--w:${registeredWidth}%"></i>
              ${item.risk ? `<b class="org-bullet-risk" style="--x:${riskOffset}%">${item.risk}</b>` : ""}
            </div>
            <div class="org-bullet-meta">
              <span>注册完成 ${item.registered}</span>
              <span>风险供应商 ${item.risk}</span>
            </div>
          </div>`;
        })
        .join("")}</div>
      <div class="chart-legend compact-legend">
        <span style="color:#2f7df6"><i class="legend-dot"></i>供应商总量</span>
        <span style="color:#20b26b"><i class="legend-dot"></i>注册完成</span>
        <span style="color:#f05b57"><i class="legend-dot"></i>风险供应商</span>
      </div>`
    );
  }

  function sourceRegistrationWidget(suppliers) {
    const source = countItems(suppliers, "source");
    const reg = countItems(suppliers, "registrationStatus");
    function compactDonutGroup(title, items) {
      return `<div class="source-status-chart-card">
          <h3 class="mini-title">${escapeHtml(title)}</h3>
          ${ns.charts.donutChart(items, {
            height: 142,
            size: 146,
            radius: 49,
            strokeWidth: 16,
            valueSize: 24,
            hideLegend: true
          })}
        </div>
        <div class="source-status-legend-card">${items
          .map(
            (item) => `<span style="color:${item.color}">
              <i class="legend-dot"></i>
              <em>${escapeHtml(item.label)}</em>
              <strong>${item.value}</strong>
            </span>`
          )
          .join("")}</div>
      `;
    }
    return panel(
      "来源与注册状态",
      "供应商来源和注册生命周期使用双饼图并列观察",
      `<div class="dual-donut compact-source-status">
        ${compactDonutGroup("供应商来源", source)}
        ${compactDonutGroup("注册状态", reg)}
      </div>`
    );
  }

  const importanceOrder = ["关键", "瓶颈", "杠杆", "常规"];
  const attractionOrder = ["双方低利益", "采购方有利", "供应商有利", "高共同利益"];
  const relationshipMap = {
    关键: {
      双方低利益: "一般",
      采购方有利: "合作",
      供应商有利: "合作",
      高共同利益: "战略"
    },
    瓶颈: {
      双方低利益: "一般",
      采购方有利: "一般",
      供应商有利: "合作",
      高共同利益: "合作"
    },
    杠杆: {
      双方低利益: "一般",
      采购方有利: "一般",
      供应商有利: "一般",
      高共同利益: "合作"
    },
    常规: {
      双方低利益: "一般",
      采购方有利: "一般",
      供应商有利: "一般",
      高共同利益: "一般"
    }
  };
  const relationshipVisual = {
    一般: { letter: "T", className: "general", tone: "gray" },
    合作: { letter: "C", className: "coop", tone: "green" },
    战略: { letter: "S", className: "strategic", tone: "red" }
  };

  function relationshipType(category, supplier) {
    const importance = category.strategicImportance;
    const attraction = supplier.categoryAttractiveness[category.id] || "双方低利益";
    const type = relationshipMap[importance]?.[attraction] || "一般";
    return {
      importance,
      attraction,
      type,
      ...relationshipVisual[type]
    };
  }

  function relationshipEntries(data, suppliers, selectedCategoryId) {
    const categoryById = Object.fromEntries(data.categories.map((item) => [item.id, item]));
    return suppliers.flatMap((supplier) =>
      supplier.categoryIds
        .filter((categoryId) => selectedCategoryId === "all" || categoryId === selectedCategoryId)
        .map((categoryId) => {
          const category = categoryById[categoryId];
          const relation = relationshipType(category, supplier);
          return {
            supplierId: supplier.id,
            supplierName: supplier.name,
            categoryId,
            categoryName: category.name,
            ...relation
          };
        })
    );
  }

  function relationshipMatrixWidget(data, suppliers, selectedCategoryId) {
    const entries = relationshipEntries(data, suppliers, selectedCategoryId);
    const summary = ["战略", "合作", "一般"].map((type) => ({
      type,
      value: entries.filter((item) => item.type === type).length,
      ...relationshipVisual[type]
    }));
    const header = `<div class="srs-corner"><span class="srs-axis-attraction">供应商吸引度</span><span class="srs-axis-importance">品类重要性</span></div>${attractionOrder
      .map((item) => `<div class="srs-col">${escapeHtml(item)}</div>`)
      .join("")}`;
    const rows = importanceOrder
      .map((importance) => {
        const cells = attractionOrder
          .map((attraction) => {
            const type = relationshipMap[importance][attraction];
            const visual = relationshipVisual[type];
            const matched = entries.filter(
              (item) => item.importance === importance && item.attraction === attraction
            );
            const tooltipLines = matched.slice(0, 3).map((item) =>
              selectedCategoryId === "all"
                ? `${item.categoryName}-${item.supplierName}`
                : item.supplierName
            );
            if (matched.length > 3) {
              tooltipLines.push("…");
            }
            const tooltip = tooltipLines
              .map((line) => `<span>${escapeHtml(line)}</span>`)
              .join("");
            return `<div class="srs-cell is-${visual.className}">
              <span class="srs-badge ${visual.className}">${visual.letter}</span>
              <strong class="srs-cell-count">${matched.length}</strong>
              <span class="srs-cell-label">${escapeHtml(type)}</span>
              ${matched.length ? `<span class="srs-tooltip">${tooltip}</span>` : ""}
            </div>`;
          })
          .join("");
        return `<div class="srs-row">${escapeHtml(importance)}</div>${cells}`;
      })
      .join("");
    return panel(
      "供应关系组合矩阵",
      "品类重要性（常规/杠杆/瓶颈/关键）× 供应商吸引度，按 4×4 区间得到一般/合作/战略",
      `<div class="srs-wrap">
        <div class="table-scroll"><div class="srs-matrix">${header}${rows}</div></div>
        <div class="srs-summary">${summary
          .map(
            (item) => `<div class="srs-summary-card">
              ${tag(`${item.letter} · ${item.type}`, item.tone)}
              <strong>${item.value}</strong>
              <span class="item-meta">供应商-品类关系点</span>
            </div>`
          )
          .join("")}</div>
      </div>`,
      categorySelect("set-relationship-category", data.categories, selectedCategoryId, true)
    );
  }

  function attentionTable(
    data,
    suppliers,
    selectedCategoryId,
    title = "管理关注清单",
    categoryAction = "set-management-attention-category"
  ) {
    const rows = ns.selectors.managementAttention(data, suppliers).slice(0, 8);
    const orgById = Object.fromEntries(data.organizations.map((item) => [item.id, item.name]));
    const perf = ns.selectors.performanceByCategory(
      data,
      suppliers.filter((supplier) => supplier.categoryIds.includes(selectedCategoryId)),
      selectedCategoryId
    );
    const gradeBySupplier = Object.fromEntries(
      perf.ranking.map((item) => [item.supplierId, item.grade.label])
    );
    return panel(
      title,
      "默认覆盖高风险、整改逾期、绩效下降、证照临期、淘汰/需改善",
      table(
        ["供应商", "组织", "级别/区分", "注册状态", "绩效等级", "风险", "整改/证照"],
        rows,
        (row) => `<tr data-open-supplier="${escapeHtml(row.id)}">
          <td>${escapeHtml(row.name)}</td>
          <td>${escapeHtml(orgById[row.orgId] || row.orgId)}</td>
          <td>${tag(row.level, row.level === "淘汰" ? "red" : "blue")} ${tag(row.segment, row.segment === "可剔除" ? "red" : row.segment === "需改善" ? "orange" : "green")}</td>
          <td>${tag(row.registrationStatus, row.registrationStatus === "注册完成" ? "green" : row.registrationStatus === "已失效" ? "red" : "orange")}</td>
          <td>${gradeBySupplier[row.id] ? tag(gradeBySupplier[row.id], "purple") : tag("无本品类评估", "gray")}</td>
          <td>${row.openRiskCount ? tag(`${row.openRiskCount}条`, "red") : tag("无", "green")}</td>
          <td>${row.remediation ? tag(remediationStatusText[row.remediation.status] || row.remediation.status, row.remediation.status === "overdue" ? "red" : "orange") : tag("无整改", "green")} ${row.certificateExpired ? tag("已过期", "red") : row.certificateExpiring ? tag("临期", "orange") : ""}</td>
        </tr>`
      ),
      categorySelect(categoryAction, data.categories, selectedCategoryId, false)
    );
  }

  ns.widgets = ns.widgets || {};
  Object.assign(ns.widgets, {
    distributionPanel,
    orgDistributionWidget,
    sourceRegistrationWidget,
    relationshipMatrixWidget,
    attentionTable
  });
})(window);
