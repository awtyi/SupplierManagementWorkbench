(function defineWorkflowWidgets(global) {
  "use strict";

  const ns = global.SupplierDashboard;
  const { escapeHtml } = ns.util;
  const { panel, tag, table, list } = ns.ui;
  const remediationStatusText = {
    plan_missing: "未提交整改计划",
    in_progress: "整改中",
    feedback: "待反馈",
    overdue: "已逾期",
    completed: "已完成"
  };

  function scopedRecords(records, suppliers) {
    return ns.metrics.recordsForSuppliers(records, suppliers);
  }

  function workflowFunnelWidget(data, suppliers) {
    const workflows = scopedRecords(data.workflows, suppliers);
    const rows = ["待提交", "审批中", "退回", "已完成", "已逾期"].map((status, index) => ({
      label: status,
      value: workflows.filter((item) => item.status === status).length,
      color: ["#16a6a0", "#2f7df6", "#f59f22", "#20b26b", "#f05b57"][index]
    }));
    return panel("流程漏斗", "供应商申请/注册/品类认证/首选认证/等级调整", ns.charts.progressRows(rows));
  }

  function workflowTodoWidget(data, suppliers) {
    const supplierById = Object.fromEntries(suppliers.map((item) => [item.id, item]));
    const rows = scopedRecords(data.workflows, suppliers)
      .filter((item) => item.status !== "已完成")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return panel(
      "我的流程待办",
      "按流程类型、状态与时间范围筛选待办",
      table(["供应商", "流程", "节点", "截止", "状态"], rows, (row) => `<tr data-open-supplier="${escapeHtml(row.supplierId)}">
        <td>${escapeHtml(supplierById[row.supplierId]?.name || row.supplierId)}</td>
        <td>${escapeHtml(row.type)}</td>
        <td>${escapeHtml(row.node)}</td>
        <td>${escapeHtml(row.dueDate)}</td>
        <td>${tag(row.status, row.status === "已逾期" ? "red" : row.status === "退回" ? "orange" : "blue")}</td>
      </tr>`)
    );
  }

  function remediationWidget(data, suppliers) {
    const remediations = scopedRecords(data.remediations, suppliers).filter((item) => item.status !== "completed");
    const labels = [
      { id: "plan_missing", label: "未提交整改计划", shortLabel: "未提交", color: "#f59f22" },
      { id: "in_progress", label: "整改中", shortLabel: "整改中", color: "#2f7df6" },
      { id: "feedback", label: "待反馈", shortLabel: "待反馈", color: "#16a6a0" },
      { id: "overdue", label: "已逾期", shortLabel: "已逾期", color: "#f05b57" }
    ];
    const funnelItems = labels.map((item) => ({
      ...item,
      value: remediations.filter((remediation) => remediation.status === item.id).length
    }));
    const max = Math.max(1, ...funnelItems.map((item) => item.value));
    const total = remediations.length;
    const body = `<div class="remediation-funnel">
      <div class="remediation-funnel-total">
        <span>未完成整改</span>
        <strong>${total}</strong>
      </div>
      <div class="remediation-funnel-stack">
        ${funnelItems
          .map((item, index) => {
            const width = Math.max(48, Math.round((item.value / max) * 100) - index * 7);
            return `<div class="remediation-funnel-row">
              <div class="remediation-funnel-bar" style="--w:${width}%;--c:${item.color}">
                <span>${escapeHtml(item.shortLabel)}</span>
                <strong>${item.value}</strong>
              </div>
              <span class="remediation-funnel-label">${escapeHtml(item.label)}</span>
            </div>`;
          })
          .join("")}
      </div>
    </div>`;
    return panel("整改状态", "按整改闭环状态查看未完成事项", body);
  }

  function certificateWidget(data, suppliers) {
    const rows = suppliers
      .filter((item) => item.certificateExpiry <= "2026-07-25")
      .sort((a, b) => a.certificateExpiry.localeCompare(b.certificateExpiry));
    return panel(
      "证照与有效期预警",
      "企业证书、注册有效期等临期或到期事项",
      list(rows.map((item) => `<button class="list-item" data-open-supplier="${escapeHtml(item.id)}">
        <span>
          <span class="item-title">${escapeHtml(item.name)}</span>
          <span class="item-meta">有效期至 ${escapeHtml(item.certificateExpiry)}</span>
        </span>
        ${tag(item.certificateExpiry < data.today ? "已过期" : "临期", item.certificateExpiry < data.today ? "red" : "orange")}
      </button>`))
    );
  }

  ns.widgets = ns.widgets || {};
  Object.assign(ns.widgets, {
    workflowFunnelWidget,
    workflowTodoWidget,
    remediationWidget,
    certificateWidget
  });
})(window);
