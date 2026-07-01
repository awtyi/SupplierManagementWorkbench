(function definePrimitives(global) {
  "use strict";

  const ns = global.SupplierDashboard;
  const { escapeHtml, formatInteger, formatPercent } = ns.util;

  const colorByTone = {
    blue: "#eaf2ff",
    green: "#e9f8f0",
    orange: "#fff4df",
    red: "#ffedec",
    purple: "#f0edff",
    teal: "#e6f7f6"
  };

  function tag(text, tone = "gray") {
    return `<span class="tag ${tone}">${escapeHtml(text)}</span>`;
  }

  function metricCard(title, value, foot, tone = "blue") {
    return `<article class="metric-card" style="--metric-bg:${colorByTone[tone] || colorByTone.blue}">
      <p class="metric-title">${escapeHtml(title)}</p>
      <div class="metric-value">${escapeHtml(value)}</div>
      <div class="metric-foot">${foot}</div>
    </article>`;
  }

  function panel(title, subtitle, body, tools = "") {
    return `<section class="panel">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">${escapeHtml(title)}</h2>
          ${subtitle ? `<p class="panel-subtitle">${escapeHtml(subtitle)}</p>` : ""}
        </div>
        ${tools ? `<div class="panel-tools">${tools}</div>` : ""}
      </div>
      <div class="panel-body">${body}</div>
    </section>`;
  }

  function categorySelect(id, categories, selectedId, allowAll = false) {
    const options = [
      ...(allowAll ? [{ id: "all", name: "全部品类" }] : []),
      ...categories
    ]
      .map(
        (item) =>
          `<option value="${escapeHtml(item.id)}" ${
            item.id === selectedId ? "selected" : ""
          }>${escapeHtml(item.name)}</option>`
      )
      .join("");
    return `<select class="toolbar-select" data-action="${escapeHtml(id)}">${options}</select>`;
  }

  function toolbarField(label, control) {
    return `<label class="toolbar-field">
      <span>${escapeHtml(label)}</span>
      ${control}
    </label>`;
  }

  function table(headers, rows, rowRenderer) {
    return `<div class="table-scroll"><table class="data-table">
      <thead><tr>${headers.map((item) => `<th>${escapeHtml(item)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(rowRenderer).join("")}</tbody>
    </table></div>`;
  }

  function list(items) {
    if (!items.length) {
      return `<div class="empty-note">暂无需要关注的数据</div>`;
    }
    return `<div class="list">${items.join("")}</div>`;
  }

  ns.ui = {
    tag,
    metricCard,
    panel,
    categorySelect,
    toolbarField,
    table,
    list,
    formatInteger,
    formatPercent
  };
})(window);
