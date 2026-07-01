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

  function seriesLegend(series) {
    return `<div class="chart-legend">${series
      .map(
        (item) =>
          `<span style="color:${item.color}"><i class="legend-dot"></i>${escapeHtml(item.label)}</span>`
      )
      .join("")}</div>`;
  }

  function multiLineChart(labels, series, options = {}) {
    const width = options.width || 960;
    const height = options.height || 260;
    const plotLeft = 34;
    const plotRight = width - 8;
    const plotTop = 18;
    const plotBottom = height - 42;
    const values = series.flatMap((item) => item.points).filter((value) => value != null);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const min = options.min ?? Math.max(0, Math.floor((rawMin - 5) / 10) * 10);
    const max = options.max ?? Math.min(100, Math.ceil((rawMax + 5) / 10) * 10);
    const span = Math.max(1, max - min);
    const step = labels.length > 1 ? (plotRight - plotLeft) / (labels.length - 1) : plotRight - plotLeft;
    const yFor = (value) => plotBottom - ((value - min) / span) * (plotBottom - plotTop);
    const xFor = (index) => plotLeft + index * step;
    const gridValues = Array.from({ length: 5 }, (_, index) =>
      Math.round((max - (span * index) / 4) * 10) / 10
    );
    const grid = gridValues
      .map((value) => {
        const y = yFor(value);
        return `<line x1="${plotLeft}" y1="${y}" x2="${plotRight}" y2="${y}" stroke="#e4ebf5"></line>
          <text x="8" y="${y + 4}" fill="#8a97aa" font-size="11">${value}</text>`;
      })
      .join("");
    const paths = series
      .map((item) => {
        const points = item.points.map((value, index) =>
          value == null ? null : { x: xFor(index), y: yFor(value), value }
        );
        const visiblePoints = points.filter(Boolean);
        if (!visiblePoints.length) {
          return "";
        }
        const path = visiblePoints
          .map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`)
          .join(" ");
        const dots = visiblePoints
          .map((point) => `<circle cx="${point.x}" cy="${point.y}" r="3.2" fill="${item.color}">
            <title>${escapeHtml(item.label)} ${point.value}</title>
          </circle>`)
          .join("");
        return `<path d="${path}" fill="none" stroke="${item.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>${dots}`;
      })
      .join("");
    const xLabels = labels
      .map((label, index) => `<text x="${xFor(index)}" y="${height - 12}" text-anchor="middle" fill="#6b778c" font-size="11">${escapeHtml(label)}</text>`)
      .join("");

    return `<div class="multi-line-chart">
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img">
        ${grid}
        <line x1="${plotLeft}" y1="${plotBottom}" x2="${plotRight}" y2="${plotBottom}" stroke="#cfd9e8"></line>
        ${paths}
        ${xLabels}
      </svg>
      ${seriesLegend(series)}
    </div>`;
  }

  function radarChart(axes, series, options = {}) {
    const width = options.width || 560;
    const height = options.height || 330;
    const centerX = width / 2;
    const radius = options.radius || Math.min(138, Math.floor((height - 126) / 2), Math.floor(width / 3.8));
    const centerY = radius + 38;
    const levels = [0.25, 0.5, 0.75, 1];
    const angleFor = (index) => -Math.PI / 2 + (index * Math.PI * 2) / Math.max(axes.length, 1);
    const pointFor = (index, valueRatio) => {
      const angle = angleFor(index);
      return {
        x: centerX + Math.cos(angle) * radius * valueRatio,
        y: centerY + Math.sin(angle) * radius * valueRatio
      };
    };
    const polygonPoints = (ratio) => axes
      .map((_, index) => {
        const point = pointFor(index, ratio);
        return `${point.x},${point.y}`;
      })
      .join(" ");
    const grid = levels
      .map((level) => `<polygon points="${polygonPoints(level)}" fill="none" stroke="#dbe4f0" stroke-width="1"></polygon>`)
      .join("");
    const axisLines = axes
      .map((axis, index) => {
        const end = pointFor(index, 1);
        const labelPoint = pointFor(index, 1.18);
        return `<line x1="${centerX}" y1="${centerY}" x2="${end.x}" y2="${end.y}" stroke="#dbe4f0"></line>
          <text x="${labelPoint.x}" y="${labelPoint.y}" text-anchor="middle" dominant-baseline="middle" fill="#8a97aa" font-size="12" font-weight="800">${escapeHtml(axis)}</text>`;
      })
      .join("");
    const seriesShapes = series
      .map((item) => {
        const points = axes
          .map((_, index) => {
            const point = pointFor(index, Math.max(0, Math.min(100, item.values[index] || 0)) / 100);
            return `${point.x},${point.y}`;
          })
          .join(" ");
        const dots = axes
          .map((_, index) => {
            const point = pointFor(index, Math.max(0, Math.min(100, item.values[index] || 0)) / 100);
            return `<circle cx="${point.x}" cy="${point.y}" r="3.5" fill="${item.color}">
              <title>${escapeHtml(item.label)} ${escapeHtml(axes[index])} ${item.values[index] || 0}</title>
            </circle>`;
          })
          .join("");
        return `<polygon points="${points}" fill="${item.color}" fill-opacity="0.08" stroke="${item.color}" stroke-width="2.2"></polygon>${dots}`;
      })
      .join("");

    return `<div class="radar-chart">
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img">
        ${grid}
        ${axisLines}
        ${seriesShapes}
      </svg>
      ${seriesLegend(series)}
    </div>`;
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

  ns.charts = { barChart, lineChart, multiLineChart, radarChart, donutChart, progressRows, legend };
})(window);
