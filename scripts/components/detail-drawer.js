(function defineDetailDrawer(global) {
  "use strict";

  const ns = global.SupplierDashboard;
  const { escapeHtml } = ns.util;

  function renderSupplierDetail(data, supplierId) {
    const drawer = document.getElementById("detail-drawer");
    const supplier = data.suppliers.find((item) => item.id === supplierId);
    if (!drawer || !supplier) {
      return;
    }
    const org = data.organizations.find((item) => item.id === supplier.orgId);
    const categories = supplier.categoryIds
      .map((id) => data.categories.find((item) => item.id === id)?.name || id)
      .join("、");
    const openRisks = data.risks.filter((item) => item.supplierId === supplier.id && ns.metrics.isOpenRiskStatus(item.status));
    drawer.innerHTML = `<div class="drawer-head">
      <div>
        <p class="page-kicker">供应商详情摘要</p>
        <h2 class="panel-title">${escapeHtml(supplier.name)}</h2>
      </div>
      <button class="drawer-close" type="button" data-close-drawer>×</button>
    </div>
    <div class="drawer-field"><span>采购组织</span><strong>${escapeHtml(org?.name || supplier.orgId)}</strong></div>
    <div class="drawer-field"><span>采购品类</span><strong>${escapeHtml(categories)}</strong></div>
    <div class="drawer-field"><span>供应商级别</span><strong>${escapeHtml(supplier.level)}</strong></div>
    <div class="drawer-field"><span>供应商区分</span><strong>${escapeHtml(supplier.segment)}</strong></div>
    <div class="drawer-field"><span>注册状态</span><strong>${escapeHtml(supplier.registrationStatus)}</strong></div>
    <div class="drawer-field"><span>供应商来源</span><strong>${escapeHtml(supplier.source)}</strong></div>
    <div class="drawer-field"><span>证照有效期</span><strong>${escapeHtml(supplier.certificateExpiry)}</strong></div>
    <div class="drawer-field"><span>未关闭风险</span><strong>${openRisks.length ? openRisks.map((risk) => escapeHtml(risk.title)).join("、") : "无"}</strong></div>
    <p class="panel-subtitle" style="margin-top:18px">演示版抽屉只做摘要；正式系统点击后进入供应商 360、风险详情、流程详情等现有页面。</p>`;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
  }

  function closeDrawer() {
    const drawer = document.getElementById("detail-drawer");
    if (!drawer) {
      return;
    }
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
  }

  ns.drawer = { renderSupplierDetail, closeDrawer };
})(window);
