(function defineSvgCharts(global) {
  "use strict";

  const ns = global.SupplierDashboard;
  const { escapeHtml } = ns.util;

  function legend(items) {
    return `<div class="chart-legend">${items
      .map(
        (item) =>
          `<span style="color:${item.color}"><i class="legend-dot"></i>${escapeHtml(
            item.label
          )} ${item.value}</span>`
      )
      .join("")}</div>`;
  }

  function barChart(items, options = {}) {
    const width = options.width || 520;
    const height = options.height || 210;
    const max = Math.max(1, ...items.map((item) => item.value));
    const barHeight = Math.max(12, Math.floor((height - 32) / Math.max(items.length, 1)) - 10);
    const rows = items
      .map((item, index) => {
        const y = 18 + index * (barHeight + 12);
        const w = Math.max(6, ((width - 140) * item.value) / max);
        return `<g>
          <text x="0" y="${y + barHeight - 2}" fill="#6b778c" font-size="12">${escapeHtml(
            item.label
          )}</text>
          <rect x="108" y="${y}" width="${w}" height="${barHeight}" rx="6" fill="${
          item.color || "#2f7df6"
        }"></rect>
          <text x="${116 + w}" y="${y + barHeight - 2}" fill="#172033" font-size="12" font-weight="700">${
          item.value
        }</text>
        </g>`;
      })
      .join("");

    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img">${rows}</svg>`;
  }

  function lineChart(items, options = {}) {
    const width = options.width || 520;
    const height = options.height || 210;
    const values = items.map((item) => item.value);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 100);
    const span = Math.max(1, max - min);
    const step = items.length > 1 ? (width - 64) / (items.length - 1) : width - 64;
    const points = items.map((item, index) => {
      const x = 34 + index * step;
      const y = height - 34 - ((item.value - min) / span) * (height - 68);
      return { ...item, x, y };
    });
    const path = points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
    const dots = points
      .map(
        (point) =>
          `<circle cx="${point.x}" cy="${point.y}" r="4" fill="#2f7df6"></circle>
          <text x="${point.x}" y="${point.y - 10}" text-anchor="middle" fill="#172033" font-size="12">${point.value}</text>
          <text x="${point.x}" y="${height - 10}" text-anchor="middle" fill="#6b778c" font-size="11">${escapeHtml(
            point.label
          )}</text>`
      )
      .join("");

    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img">
      <line x1="30" y1="${height - 34}" x2="${width - 18}" y2="${height - 34}" stroke="#e4ebf5"></line>
      <path d="${path}" fill="none" stroke="#2f7df6" stroke-width="3" stroke-linecap="round"></path>
      ${dots}
    </svg>`;
  }

  function donutChart(items, options = {}) {
    const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
    let acc = 0;
    const size = options.size || 160;
    const center = size / 2;
    const radius = options.radius || 58;
    const strokeWidth = options.strokeWidth || 18;
    const circumference = 2 * Math.PI * radius;
    const circles = items
      .map((item) => {
        const dash = (item.value / total) * circumference;
        const circle = `<circle r="${radius}" cx="${center}" cy="${center}" fill="none" stroke="${
          item.color || "#2f7df6"
        }" stroke-width="${strokeWidth}" stroke-dasharray="${dash} ${circumference - dash}" stroke-dashoffset="${-acc}" transform="rotate(-90 ${center} ${center})"></circle>`;
        acc += dash;
        return circle;
      })
      .join("");

    return `<div class="donut-figure">
      <svg viewBox="0 0 ${size} ${size}" width="100%" height="${options.height || 170}" role="img">
        <circle r="${radius}" cx="${center}" cy="${center}" fill="none" stroke="#eef3fb" stroke-width="${strokeWidth}"></circle>
        ${circles}
        <text x="${center}" y="${center - 4}" text-anchor="middle" fill="#172033" font-size="${options.valueSize || 24}" font-weight="800">${total}</text>
        <text x="${center}" y="${center + 16}" text-anchor="middle" fill="#6b778c" font-size="12">供应商</text>
      </svg>
      ${options.hideLegend ? "" : legend(items)}
    </div>`;
  }

  function progressRows(items) {
    const max = Math.max(1, ...items.map((item) => item.value));
    return items
      .map(
        (item) => `<div class="progress-row">
          <span>${escapeHtml(item.label)}</span>
          <span class="progress-track"><i class="progress-fill" style="--w:${Math.round(
            (item.value / max) * 100
          )}%;--c:${item.color || "#2f7df6"}"></i></span>
          <strong class="mono">${item.value}</strong>
        </div>`
      )
      .join("");
  }

  ns.charts = { barChart, lineChart, donutChart, progressRows, legend };
})(window);
