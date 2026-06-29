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
    return panel(
      "采购组织分布",
      "总量底条、注册完成进度与风险供应商标记",
      `<div class="org-bullet-list">${byOrg
        .map((item) => {
          const totalWidth = 100;
          const registeredWidth = item.registered
            ? Math.max(8, Math.round((item.registered / item.value) * 100))
            : 0;
          const riskOffset = Math.min(100, Math.max(7, Math.round((item.risk / item.value) * 100)));
          return `<div class="org-bullet">
            <div class="org-bullet-head">
              <strong>${escapeHtml(item.label)}</strong>
              <span>${item.value} 家</span>
            </div>
            <div class="org-bullet-track">
              <i class="org-bullet-total" style="--w:${totalWidth}%"></i>
              <i class="org-bullet-registered" style="--w:${registeredWidth}%">
                ${item.registered ? `<span>${item.registered}</span>` : ""}
              </i>
              ${item.risk ? `<b class="org-bullet-risk" style="--x:${riskOffset}%">${item.risk}</b>` : ""}
            </div>
            <div class="org-bullet-meta">
              <span>注册完成 ${item.registered}/${item.value}</span>
              <span>风险供应商 ${item.risk}</span>
            </div>
          </div>`;
        })
        .join("")}</div>
      <div class="chart-legend compact-legend">
        <span style="color:#2f7df6"><i class="legend-dot"></i>组织供应商总量</span>
        <span style="color:#20b26b"><i class="legend-dot"></i>注册完成率</span>
        <span style="color:#f05b57"><i class="legend-dot"></i>风险供应商</span>
      </div>`
    );
  }

  function sourceRegistrationWidget(suppliers) {
    const source = countItems(suppliers, "source");
    return panel(
      "供应商来源",
      "仅展示供应商申请与内部供应商来源分布",
      ns.charts.donutChart(source)
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
  const segmentVisual = {
    优选: {
      className: "prime",
      tone: "green",
      summary: "长期合作关系",
      actions: ["优先进入核心供应资源池", "签订长期框架协议", "联合规划产能与成本优化"]
    },
    有价值: {
      className: "value",
      tone: "orange",
      summary: "优选来源与协同发展",
      actions: ["作为优选供应商来源", "推进物流、交付和质量协同", "观察是否具备升级为优选的条件"]
    },
    需改善: {
      className: "improve",
      tone: "orange",
      summary: "推进持续改善",
      actions: ["制定阶段性改善计划", "明确质量、交付或成本改善目标", "到期复评后决定保留或降级"]
    },
    可剔除: {
      className: "circulation",
      tone: "blue",
      summary: "限期改善或退出",
      actions: ["签订改善协议并跟踪达成情况", "减少新增合作与关键订单依赖", "一定时间内不达标则纳入剔除候选"]
    }
  };
  const fixedGradeOrder = ["D", "C", "B", "A"];
  const relationOrder = ["一般", "合作", "战略"];

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

  function fixedPerformanceGrade(score) {
    if (score >= 90) {
      return "A";
    }
    if (score >= 80) {
      return "B";
    }
    if (score >= 70) {
      return "C";
    }
    return "D";
  }

  function strategySegment(relationType, grade) {
    if (relationType === "战略") {
      return grade === "A" ? "优选" : grade === "B" ? "有价值" : "需改善";
    }
    if (relationType === "合作") {
      return grade === "A" ? "优选" : grade === "B" ? "有价值" : grade === "C" ? "需改善" : "可剔除";
    }
    return ["A", "B"].includes(grade) ? "有价值" : "可剔除";
  }

  function latestAssessmentBySupplier(data, suppliers, categoryId) {
    const supplierIds = new Set(suppliers.map((item) => item.id));
    return data.assessments
      .filter((item) => supplierIds.has(item.supplierId) && item.categoryId === categoryId)
      .reduce((accumulator, item) => {
        const current = accumulator[item.supplierId];
        if (!current || item.period > current.period) {
          accumulator[item.supplierId] = item;
        }
        return accumulator;
      }, {});
  }

  function segmentMatrixEntries(data, suppliers, categoryId) {
    const category = data.categories.find((item) => item.id === categoryId) || data.categories[0];
    const latestBySupplier = latestAssessmentBySupplier(data, suppliers, category.id);
    return suppliers
      .filter((supplier) => supplier.categoryIds.includes(category.id) && latestBySupplier[supplier.id])
      .map((supplier, index) => {
        const assessment = latestBySupplier[supplier.id];
        const grade = fixedPerformanceGrade(assessment.score);
        const relation = relationshipType(category, supplier);
        const segment = strategySegment(relation.type, grade);
        const gradeIndex = fixedGradeOrder.indexOf(grade);
        const relationIndex = relationOrder.indexOf(relation.type);
        const jitterX = ((index % 3) - 1) * 2.3;
        const jitterY = ((Math.floor(index / 3) % 3) - 1) * 2.3;
        return {
          supplier,
          assessment,
          grade,
          relation,
          segment,
          x: 12.5 + gradeIndex * 25 + jitterX,
          y: 83.33 - relationIndex * 33.33 + jitterY
        };
      });
  }

  function segmentMatrixWidget(data, suppliers, categoryId, selectedSupplierId) {
    const selectedCategoryId = data.categories.some((item) => item.id === categoryId)
      ? categoryId
      : data.categories[0].id;
    const entries = segmentMatrixEntries(data, suppliers, selectedCategoryId);
    const selectedEntry = entries.find((item) => item.supplier.id === selectedSupplierId) || entries[0] || null;
    const counts = ["优选", "有价值", "需改善", "可剔除"].map((segment) => ({
      segment,
      value: entries.filter((item) => item.segment === segment).length,
      ...segmentVisual[segment]
    }));
    const cells = relationOrder
      .slice()
      .reverse()
      .map((relation) =>
        fixedGradeOrder
          .map((grade) => {
            const segment = strategySegment(relation, grade);
            return `<span class="segment-zone ${segmentVisual[segment].className}">
              <strong>${escapeHtml(segment)}</strong>
            </span>`;
          })
          .join("")
      )
      .join("");
    const points = entries
      .map((entry) => `<button class="segment-point ${segmentVisual[entry.segment].className} ${selectedEntry?.supplier.id === entry.supplier.id ? "is-selected" : ""}"
        style="--x:${entry.x}%;--y:${entry.y}%"
        title="${escapeHtml(`${entry.supplier.name} · ${entry.grade} · ${entry.relation.type} · ${entry.segment}`)}"
        data-segment-supplier="${escapeHtml(entry.supplier.id)}"
        type="button">
        <span>${escapeHtml(entry.supplier.name.slice(0, 1))}</span>
      </button>`)
      .join("");
    const selectedAdvice = selectedEntry
      ? segmentVisual[selectedEntry.segment]
      : null;
    const advice = selectedEntry
      ? `<div class="segment-advice-card ${selectedAdvice.className}">
          <span class="item-meta">已选供应商</span>
          <strong>${escapeHtml(selectedEntry.supplier.name)}</strong>
          <p>${escapeHtml(selectedEntry.grade)}等级 · ${escapeHtml(selectedEntry.relation.type)}性关系 · ${escapeHtml(selectedEntry.segment)}</p>
          <ul>${selectedAdvice.actions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>`
      : `<div class="empty-note">当前品类暂无可落点的供应商</div>`;

    return panel(
      "供应商区分策略矩阵",
      "按固定绩效等级 A/B/C/D 与企业-供应商关系细分定位供应商区分",
      `<div class="segment-strategy-layout">
        <div class="segment-matrix-shell">
          <div class="segment-axis-title vertical">关系细分（SRS）</div>
          <div class="segment-matrix">
            <div class="segment-zone-grid">${cells}</div>
            <div class="segment-points">${points}</div>
          </div>
          <div class="segment-axis-title horizontal">供应商评价结果（SE）</div>
          <div class="segment-y-labels">
            <span>战略性</span>
            <span>合作性</span>
            <span>一般性</span>
          </div>
          <div class="segment-x-labels">
            ${fixedGradeOrder.map((grade) => `<span>${grade}等级</span>`).join("")}
          </div>
        </div>
        <aside class="segment-side">
          <div class="segment-counts">
            ${counts
              .map((item) => `<div class="segment-count-card ${item.className}">
                ${tag(item.segment, item.tone)}
                <strong>${item.value}</strong>
                <span>${escapeHtml(item.summary)}</span>
              </div>`)
              .join("")}
          </div>
          ${advice}
        </aside>
      </div>`,
      categorySelect("set-management-segment-category", data.categories, selectedCategoryId, false)
    );
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
    segmentMatrixWidget,
    relationshipMatrixWidget,
    attentionTable
  });
})(window);
