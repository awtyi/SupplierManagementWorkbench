(function defineMetrics(global) {
  "use strict";

  const ns = global.SupplierDashboard;

  function uniqueSupplierCount(records) {
    return new Set(records.map((item) => item.supplierId)).size;
  }

  function getSupplierScope(data, view) {
    if (view === "operations") {
      return data.suppliers.filter((item) => item.ownerId === data.currentUserId);
    }

    return data.suppliers.filter((item) => data.managementOrgIds.includes(item.orgId));
  }

  function recordsForSuppliers(records, suppliers) {
    const supplierIds = new Set(suppliers.map((item) => item.id));
    return records.filter((item) => supplierIds.has(item.supplierId));
  }

  function getPerformanceTaskSummary(data, suppliers, categoryId) {
    let tasks = recordsForSuppliers(data.performanceTasks, suppliers);

    if (categoryId && categoryId !== "all") {
      tasks = tasks.filter((item) => item.categoryId === categoryId);
    }

    const completed = tasks.filter((item) => item.status === "completed").length;

    return {
      total: tasks.length,
      completed,
      inProgress: tasks.filter((item) => item.status === "in_progress").length,
      overdue: tasks.filter((item) => item.status === "overdue").length,
      periodic: tasks.filter((item) => item.type === "periodic").length,
      oneOff: tasks.filter((item) => item.type === "one-off").length,
      completionRate: tasks.length ? completed / tasks.length : 0
    };
  }

  function getSummary(data, suppliers) {
    const risks = recordsForSuppliers(data.risks, suppliers).filter(
      (item) => item.status === "open"
    );
    const remediations = recordsForSuppliers(data.remediations, suppliers).filter(
      (item) => item.status !== "completed"
    );
    const workflows = recordsForSuppliers(data.workflows, suppliers);
    const tasks = getPerformanceTaskSummary(data, suppliers, "all");

    return {
      total: suppliers.length,
      registrationCompleted: suppliers.filter(
        (item) => item.registrationStatus === "注册完成"
      ).length,
      riskSuppliers: uniqueSupplierCount(risks),
      blacklisted: suppliers.filter((item) => item.blacklisted).length,
      remediationSuppliers: uniqueSupplierCount(remediations),
      performanceCompletion: tasks.completionRate,
      pendingWorkflows: workflows.filter((item) => item.status !== "已完成").length,
      overdueWorkflows: workflows.filter((item) => item.status === "已逾期").length,
      expiringCertificates: suppliers.filter(
        (item) =>
          item.certificateExpiry >= data.today && item.certificateExpiry <= "2026-07-25"
      ).length
    };
  }

  function getGrade(score, grades) {
    return grades.find((grade) => score >= grade.min) || grades.at(-1);
  }

  function groupCount(items, key) {
    return items.reduce((accumulator, item) => {
      const value = item[key];
      accumulator[value] = (accumulator[value] || 0) + 1;
      return accumulator;
    }, {});
  }

  ns.metrics = {
    getSupplierScope,
    recordsForSuppliers,
    getPerformanceTaskSummary,
    getSummary,
    getGrade,
    groupCount
  };
})(window);
