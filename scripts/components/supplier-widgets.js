(function defineSupplierWidgets(global) {
  "use strict";

  const ns = global.SupplierDashboard;
  const { escapeHtml } = ns.util;
  const { panel, tag, table, categorySelect, toolbarField } = ns.ui;

  const categoryCertificationHeightObservers = [];
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

  function supplierGrowthFunnelWidget(suppliers) {
    const total = suppliers.length;
    const registeredSuppliers = suppliers.filter((supplier) => supplier.registrationStatus === "注册完成");
    const qualifiedSuppliers = registeredSuppliers.filter((supplier) =>
      ["合格", "优秀"].includes(supplier.level)
    );
    const excellentSuppliers = registeredSuppliers.filter((supplier) => supplier.level === "优秀");
    const denominator = Math.max(total, 1);
    const levels = [
      { label: "所有供应商", value: total, color: "#2f7df6" },
      { label: "注册供应商", value: registeredSuppliers.length, color: "#16a6a0" },
      { label: "合格供应商", value: qualifiedSuppliers.length, color: "#20b26b" },
      { label: "优秀供应商", value: excellentSuppliers.length, color: "#7457e8" }
    ];

    return panel(
      "供应商成长漏斗",
      "所有供应商 → 注册供应商 → 合格供应商 → 优秀供应商",
      `<div class="supplier-growth-funnel">
        ${levels
          .map((item, index) => {
            const width = Math.round((item.value / denominator) * 100);
            const totalRate = total ? Math.round((item.value / total) * 100) : 0;
            const previous = levels[index - 1];
            const parentRate = previous?.value ? `${Math.round((item.value / previous.value) * 100)}%` : "-";
            const isInsideLabel = item.value > 0 && width >= 16;
            const isTiny = item.value > 0 && width < 16;
            const label = `${item.label} ${item.value}`;
            return `<div class="supplier-growth-row">
              <div class="supplier-growth-rate">
                <span>占全部</span>
                <strong>${totalRate}%</strong>
              </div>
              <div class="supplier-growth-main">
                <div class="supplier-growth-track ${item.value ? "" : "is-empty"}">
                  <span class="supplier-growth-bar ${isTiny ? "is-tiny" : ""}" style="--w:${width}%;--c:${item.color}">
                    ${isInsideLabel ? `<span class="supplier-growth-label is-inside">${escapeHtml(item.label)} <strong>${item.value}</strong></span>` : ""}
                  </span>
                  ${isTiny ? `<i class="supplier-growth-marker" style="--c:${item.color}"></i>` : ""}
                  ${isInsideLabel ? "" : `<span class="supplier-growth-label is-outside">${escapeHtml(label)}</span>`}
                </div>
              </div>
              <div class="supplier-growth-rate is-right">
                <span>占上层</span>
                <strong>${parentRate}</strong>
              </div>
            </div>`;
          })
          .join("")}
      </div>`
    );
  }

  function orgDistributionWidget(data, suppliers) {
    const risks = ns.metrics.recordsForSuppliers(data.risks, suppliers).filter((item) => ns.metrics.isOpenRiskStatus(item.status));
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
      "按采购组织对比供应商规模、注册完成与风险情况",
      `<div class="org-distribution-body">
        <div class="org-bullet-list">${byOrg
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
        </div>
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

  const certificationStatusTone = {
    认证通过: "green",
    认证中: "blue",
    退回整改: "orange",
    待提交: "orange",
    已失效: "red"
  };

  function addDays(dateText, days) {
    const date = new Date(`${dateText}T00:00:00`);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
  }

  function isCertificationExpiring(record, data) {
    return record.status === "认证通过" &&
      record.expiresAt &&
      record.expiresAt >= data.today &&
      record.expiresAt <= addDays(data.today, 30);
  }

  function isCertificationAttention(record, data) {
    return ["待提交", "退回整改", "已失效"].includes(record.status) || isCertificationExpiring(record, data);
  }

  function categoryCertificationOverviewWidget(data, suppliers) {
    const supplierById = Object.fromEntries(suppliers.map((item) => [item.id, item]));
    const categoryById = Object.fromEntries(data.categories.map((item) => [item.id, item]));
    const records = (data.categoryCertifications || []).filter((item) => supplierById[item.supplierId]);
    const passed = records.filter((item) => item.status === "认证通过");
    const inProgress = records.filter((item) => ["认证中", "待提交"].includes(item.status));
    const returned = records.filter((item) => item.status === "退回整改");
    const expired = records.filter((item) => item.status === "已失效");
    const expiring = records.filter((item) => isCertificationExpiring(item, data));
    const categoryRows = data.categories.map((category) => {
      const categoryRecords = records.filter((item) => item.categoryId === category.id);
      const normalPassed = categoryRecords.filter((item) => item.status === "认证通过" && !isCertificationExpiring(item, data));
      const certifying = categoryRecords.filter((item) => item.status === "认证中");
      const pendingAttention = categoryRecords.filter((item) =>
        ["待提交", "退回整改"].includes(item.status) || isCertificationExpiring(item, data)
      );
      const categoryExpired = categoryRecords.filter((item) => item.status === "已失效");
      const total = categoryRecords.length;
      const segments = [
        { label: "已认证", value: normalPassed.length, tone: "green" },
        { label: "认证中", value: certifying.length, tone: "blue" },
        { label: "待处理", value: pendingAttention.length, tone: "orange" },
        { label: "已失效", value: categoryExpired.length, tone: "red" }
      ].map((item) => ({
        ...item,
        percent: total ? Math.round((item.value / total) * 100) : 0
      }));
      const stats = [
        { label: "已认证", value: normalPassed.length, tone: "green" },
        { label: "认证中", value: certifying.length, tone: "blue" },
        { label: "待处理", value: pendingAttention.length, tone: "orange" },
        { label: "已失效", value: categoryExpired.length, tone: "red" }
      ].filter((item) => item.value > 0);
      return {
        category,
        total,
        attention: categoryRecords.filter((item) => isCertificationAttention(item, data)).length,
        expired: categoryExpired.length,
        pending: pendingAttention.length,
        segments,
        stats
      };
    }).sort((left, right) =>
      right.expired - left.expired ||
      right.pending - left.pending ||
      right.attention - left.attention ||
      right.total - left.total ||
      left.category.name.localeCompare(right.category.name, "zh-Hans-CN")
    );
    const concernRows = records
      .filter((item) => isCertificationAttention(item, data))
      .sort((left, right) => {
        const order = { 已失效: 0, 退回整改: 1, 待提交: 2, 认证通过: 3 };
        const leftOrder = isCertificationExpiring(left, data) ? 3 : order[left.status] ?? 9;
        const rightOrder = isCertificationExpiring(right, data) ? 3 : order[right.status] ?? 9;
        return leftOrder - rightOrder || (left.expiresAt || "9999-12-31").localeCompare(right.expiresAt || "9999-12-31");
      });
    const metricItems = [
      { label: "认证通过组合", value: passed.length, tone: "green" },
      { label: "认证中/待提交", value: inProgress.length, tone: "blue" },
      { label: "退回整改", value: returned.length, tone: "orange" },
      { label: "即将到期", value: expiring.length, tone: "red" },
      { label: "已失效", value: expired.length, tone: "red" }
    ];

    return panel(
      "品类认证概览",
      "按供应商-采购品类认证关系展示覆盖、流程状态与异常关注",
      `<div class="category-cert-overview" data-category-cert-layout>
        <div class="category-cert-metrics">
          ${metricItems
            .map((item) => `<div class="category-cert-metric ${item.tone}">
              <span>${escapeHtml(item.label)}</span>
              <strong>${item.value}</strong>
            </div>`)
            .join("")}
        </div>
        <div class="category-cert-grid">
          <section class="category-cert-block category-cert-coverage" data-category-cert-left>
            <h3 class="mini-title">品类覆盖情况</h3>
            <div class="category-cert-coverage-list">
              ${categoryRows
                .map((item) => `<div class="category-cert-row">
                  <div class="category-cert-row-head">
                    <strong>${escapeHtml(item.category.name)}</strong>
                    <span>共 ${item.total} 组</span>
                  </div>
                  <div class="category-cert-stack ${item.total ? "" : "is-empty"}">
                    ${item.segments
                      .filter((segment) => segment.value)
                      .map((segment) => `<i class="category-cert-segment ${segment.tone}" style="--w:${segment.percent}%" title="${escapeHtml(segment.label)} ${segment.value}"></i>`)
                      .join("")}
                  </div>
                  <div class="category-cert-row-foot">
                    ${item.stats
                      .map((stat) => `<span class="category-cert-foot-stat ${stat.tone}">${escapeHtml(stat.label)} ${stat.value}</span>`)
                      .join("")}
                  </div>
                </div>`)
                .join("")}
            </div>
          </section>
          <section class="category-cert-block category-cert-concerns">
            <h3 class="mini-title">认证关注事项</h3>
            <div class="category-cert-window">
              <div class="category-cert-track ${concernRows.length > 3 ? "" : "is-static"}" style="--category-cert-duration:${Math.max(16, concernRows.length * 2.4)}s">
                ${(concernRows.length > 3 ? [...concernRows, ...concernRows] : concernRows)
                  .map((item) => {
                    const supplier = supplierById[item.supplierId];
                    const category = categoryById[item.categoryId];
                    const label = isCertificationExpiring(item, data) ? "即将到期" : item.status;
                    const tone = isCertificationExpiring(item, data) ? "red" : certificationStatusTone[item.status] || "gray";
                    const dateText = item.expiresAt || item.submittedAt;
                    return `<button class="category-cert-card" type="button" data-open-supplier="${escapeHtml(item.supplierId)}">
                      <span class="category-cert-main">
                        <strong>${escapeHtml(supplier.name)}</strong>
                        <em>${escapeHtml(category.name)} · ${escapeHtml(item.node)}</em>
                      </span>
                      <span class="category-cert-side">
                        ${tag(label, tone)}
                        <time>${escapeHtml(dateText)}</time>
                      </span>
                    </button>`;
                  })
                  .join("") || `<div class="empty-note">暂无需要关注的品类认证事项</div>`}
              </div>
            </div>
          </section>
        </div>
      </div>`
    );
  }

  function syncCategoryCertificationHeights(root = document) {
    categoryCertificationHeightObservers.splice(0).forEach((observer) => observer.disconnect());
    const layouts = [...root.querySelectorAll("[data-category-cert-layout]")];
    layouts.forEach((layout) => {
      const left = layout.querySelector("[data-category-cert-left]");
      const concerns = layout.querySelector(".category-cert-concerns");
      const title = concerns?.querySelector(".mini-title");
      const windowElement = concerns?.querySelector(".category-cert-window");
      if (!left || !concerns || !title || !windowElement) {
        return;
      }

      const update = () => {
        windowElement.style.height = "";
        const leftHeight = left.getBoundingClientRect().height;
        const titleStyle = getComputedStyle(title);
        const titleHeight =
          title.getBoundingClientRect().height +
          parseFloat(titleStyle.marginTop || 0) +
          parseFloat(titleStyle.marginBottom || 0);
        const height = Math.max(96, Math.floor(leftHeight - titleHeight));
        windowElement.style.height = `${height}px`;
      };

      update();
      if (!global.ResizeObserver) {
        return;
      }
      const observer = new ResizeObserver(update);
      observer.observe(left);
      observer.observe(title);
      categoryCertificationHeightObservers.push(observer);
    });
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
  const attentionPageSize = 8;

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
        if (!current || ns.metrics.parseAssessmentPeriod(item.period) > ns.metrics.parseAssessmentPeriod(current.period)) {
          accumulator[item.supplierId] = item;
        }
        return accumulator;
      }, {});
  }

  function segmentMatrixEntries(data, suppliers, categoryId) {
    const category = data.categories.find((item) => item.id === categoryId) || data.categories[0];
    const performanceGrades = data.performanceConfig[category.id]?.grades || [];
    const latestBySupplier = latestAssessmentBySupplier(data, suppliers, category.id);
    return suppliers
      .filter((supplier) =>
        ns.metrics.isCertifiedForCategory(data, supplier.id, category.id) && latestBySupplier[supplier.id]
      )
      .map((supplier, index) => {
        const assessment = latestBySupplier[supplier.id];
        const customGrade = ns.metrics.getGrade(assessment.score, performanceGrades);
        const grade = ns.metrics.getBuiltInGrade(assessment.score, performanceGrades);
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
          customGrade,
          relation,
          segment,
          x: 12.5 + gradeIndex * 25 + jitterX,
          y: 83.33 - relationIndex * 33.33 + jitterY
        };
      });
  }

  function segmentMatrixWidget(data, suppliers, categoryId, selectedSupplierId, options = {}) {
    const categoryAction = options.categoryAction || "set-management-segment-category";
    const supplierAction = options.supplierAction || "set-management-segment-supplier";
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
        title="${escapeHtml(`${entry.supplier.name} · 内置${entry.grade} · ${entry.customGrade?.label || "未评级"} · ${entry.relation.type} · ${entry.segment}`)}"
        data-segment-supplier="${escapeHtml(entry.supplier.id)}"
        data-segment-action="${escapeHtml(supplierAction)}"
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
          <p>内置${escapeHtml(selectedEntry.grade)}等级 · ${escapeHtml(selectedEntry.customGrade?.label || "未评级")} · ${escapeHtml(selectedEntry.relation.type)}性关系 · ${escapeHtml(selectedEntry.segment)}</p>
          <ul>${selectedAdvice.actions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>`
      : `<div class="empty-note">当前品类暂无可落点的供应商</div>`;

    return panel(
      "供应商区分策略矩阵",
      "按内置绩效等级 A/B/C/D 与企业-供应商关系细分定位供应商区分",
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
      toolbarField("采购品类", categorySelect(categoryAction, data.categories, selectedCategoryId, false))
    );
  }

  function relationshipEntries(data, suppliers, selectedCategoryId) {
    const categoryById = Object.fromEntries(data.categories.map((item) => [item.id, item]));
    return suppliers.flatMap((supplier) =>
      ns.metrics.getCertifiedCategoryIds(data, supplier.id)
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
      toolbarField("采购品类", categorySelect("set-relationship-category", data.categories, selectedCategoryId, true))
    );
  }

  function latestCertifiedAssessment(data, supplier, selectedCategoryId) {
    const certifiedCategoryIds = ns.metrics.getCertifiedCategoryIds(data, supplier.id);
    const allowedCategoryIds =
      selectedCategoryId === "all"
        ? certifiedCategoryIds
        : certifiedCategoryIds.includes(selectedCategoryId)
          ? [selectedCategoryId]
          : [];
    const latest = data.assessments
      .filter((item) => item.supplierId === supplier.id && allowedCategoryIds.includes(item.categoryId))
      .sort((left, right) => ns.metrics.parseAssessmentPeriod(right.period) - ns.metrics.parseAssessmentPeriod(left.period))[0];
    if (!latest) {
      return null;
    }
    const config = data.performanceConfig[latest.categoryId];
    const category = data.categories.find((item) => item.id === latest.categoryId);
    const grade = ns.metrics.getGrade(latest.score, config.grades);
    const history = data.assessments
      .filter((item) => item.supplierId === supplier.id && item.categoryId === latest.categoryId)
      .sort((left, right) => ns.metrics.parseAssessmentPeriod(left.period) - ns.metrics.parseAssessmentPeriod(right.period));
    const previous = history.at(-2);
    const previousGrade = previous ? ns.metrics.getGrade(previous.score, config.grades) : null;
    const gradeRankById = Object.fromEntries(config.grades.map((item, index) => [item.id, index]));
    const currentRank = gradeRankById[grade.id];
    const previousRank = previousGrade ? gradeRankById[previousGrade.id] : null;
    const trend =
      previousRank == null || currentRank == null || previousRank === currentRank
        ? "flat"
        : currentRank < previousRank
          ? "up"
          : "down";
    return {
      label: selectedCategoryId === "all" ? `${category.name} · ${grade.label}` : grade.label,
      trend
    };
  }

  function attentionTable(
    data,
    suppliers,
    selectedCategoryId,
    title = "管理关注清单",
    categoryAction = "set-management-attention-category",
    page = 1,
    pageAction = "set-management-attention-page"
  ) {
    const normalizedCategoryId = selectedCategoryId || "all";
    const allRows = ns.selectors
      .managementAttention(data, suppliers)
      .filter((supplier) => ns.metrics.isCertifiedForCategory(data, supplier.id, normalizedCategoryId));
    const pageCount = Math.max(1, Math.ceil(allRows.length / attentionPageSize));
    const currentPage = Math.min(Math.max(Number(page) || 1, 1), pageCount);
    const start = (currentPage - 1) * attentionPageSize;
    const rows = allRows.slice(start, start + attentionPageSize);
    const orgById = Object.fromEntries(data.organizations.map((item) => [item.id, item.name]));
    const certificateTag = (row) => {
      if (row.certificateExpired) {
        return tag("已过期", "red");
      }
      if (row.certificateExpiring) {
        return tag("临期", "orange");
      }
      return tag("正常", "green");
    };
    const gradeCell = (row) => {
      const grade = latestCertifiedAssessment(data, row, normalizedCategoryId);
      if (!grade) {
        return tag(normalizedCategoryId === "all" ? "无认证品类评估" : "无本品类评估", "gray");
      }
      const indicator =
        grade.trend === "up"
          ? `<span class="grade-trend up" title="绩效等级上升" aria-label="绩效等级上升">▲</span>`
          : grade.trend === "down"
            ? `<span class="grade-trend down" title="绩效等级下降" aria-label="绩效等级下降">▼</span>`
            : "";
      return `${tag(grade.label, "purple")} ${indicator}`;
    };
    const pager = `<div class="attention-pager" aria-label="${escapeHtml(title)}分页">
      <button class="pager-button" type="button" data-attention-page-action="${escapeHtml(pageAction)}" data-attention-page="${currentPage - 1}" ${currentPage <= 1 ? "disabled" : ""}>‹</button>
      <span>${currentPage}/${pageCount}</span>
      <button class="pager-button" type="button" data-attention-page-action="${escapeHtml(pageAction)}" data-attention-page="${currentPage + 1}" ${currentPage >= pageCount ? "disabled" : ""}>›</button>
    </div>`;
    return panel(
      title,
      "按认证通过的供应商-品类关系筛选关注数据",
      `<div class="attention-table-wrap">
        ${table(
          ["供应商", "组织", "级别", "区分", "注册状态", "绩效等级", "风险", "整改", "证照"],
          rows,
          (row) => `<tr data-open-supplier="${escapeHtml(row.id)}">
            <td>${escapeHtml(row.name)}</td>
            <td>${escapeHtml(orgById[row.orgId] || row.orgId)}</td>
            <td>${tag(row.level, "blue")}</td>
            <td>${tag(row.segment, row.segment === "可剔除" ? "red" : row.segment === "需改善" ? "orange" : "green")}</td>
            <td>${tag(row.registrationStatus, row.registrationStatus === "注册完成" ? "green" : row.registrationStatus === "已失效" ? "red" : "orange")}</td>
            <td>${gradeCell(row)}</td>
            <td>${row.openRiskCount ? tag(`${row.openRiskCount}条`, "red") : tag("无", "green")}</td>
            <td>${row.remediation ? tag(remediationStatusText[row.remediation.status] || row.remediation.status, row.remediation.status === "overdue" ? "red" : "orange") : tag("无整改", "green")}</td>
            <td>${certificateTag(row)}</td>
          </tr>`
        )}
        <div class="attention-footer">
          <span>共 ${allRows.length} 条，每页 ${attentionPageSize} 条</span>
          ${pager}
        </div>
      </div>`,
      toolbarField("采购品类", categorySelect(categoryAction, data.categories, normalizedCategoryId, true))
    );
  }

  ns.widgets = ns.widgets || {};
  Object.assign(ns.widgets, {
    distributionPanel,
    supplierGrowthFunnelWidget,
    orgDistributionWidget,
    sourceRegistrationWidget,
    categoryCertificationOverviewWidget,
    syncCategoryCertificationHeights,
    segmentMatrixWidget,
    relationshipMatrixWidget,
    attentionTable
  });
})(window);
