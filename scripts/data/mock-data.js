(function defineMockData(global) {
  "use strict";

  const ns = global.SupplierDashboard;

  const organizations = [
    { id: "ORG-WH", name: "武汉制造工厂" },
    { id: "ORG-EAST", name: "华东采购中心" },
    { id: "ORG-SOUTH", name: "华南采购中心" }
  ];

  const categories = [
    { id: "CAT-OFFICE", name: "常规办公用品", strategicImportance: "low" },
    { id: "CAT-STEEL", name: "钢结构件", strategicImportance: "high" },
    { id: "CAT-IT", name: "信息化设备", strategicImportance: "low" },
    { id: "CAT-LOGISTICS", name: "物流运输服务", strategicImportance: "high" }
  ];

  const suppliers = [
    ["S001", "百隆五金结构件有限公司", "ORG-WH", "U100", ["CAT-STEEL"], "优秀", "优选", "注册完成", "供应商申请", false, "2026-11-18", { "CAT-STEEL": "high" }],
    ["S002", "武汉佰思杰科技有限公司", "ORG-WH", "U100", ["CAT-IT"], "推荐", "有价值", "注册完成", "平台供应商", false, "2026-07-12", { "CAT-IT": "high" }],
    ["S003", "广西智促科技有限公司", "ORG-SOUTH", "U100", ["CAT-OFFICE", "CAT-IT"], "合格", "需改善", "注册完成", "供应商申请", false, "2026-07-05", { "CAT-OFFICE": "high", "CAT-IT": "low" }],
    ["S004", "湖北曦翔建设工程有限公司", "ORG-WH", "U100", ["CAT-STEEL"], "潜在", "需改善", "注册中", "供应商申请", false, "2026-06-29", { "CAT-STEEL": "low" }],
    ["S005", "江南模塑科技有限公司", "ORG-EAST", "U100", ["CAT-STEEL"], "淘汰", "可剔除", "注册完成", "内部供应商", true, "2026-08-20", { "CAT-STEEL": "low" }],
    ["S006", "江南造船厂", "ORG-EAST", "U200", ["CAT-STEEL", "CAT-LOGISTICS"], "优秀", "优选", "注册完成", "平台供应商", false, "2027-01-12", { "CAT-STEEL": "high", "CAT-LOGISTICS": "high" }],
    ["S007", "中原工业设备有限公司", "ORG-WH", "U200", ["CAT-IT"], "注册", "有价值", "注册完成", "供应商申请", false, "2026-09-10", { "CAT-IT": "high" }],
    ["S008", "海川物流服务有限公司", "ORG-SOUTH", "U201", ["CAT-LOGISTICS"], "合格", "有价值", "注册完成", "平台供应商", false, "2026-12-31", { "CAT-LOGISTICS": "high" }],
    ["S009", "华新办公集采有限公司", "ORG-EAST", "U201", ["CAT-OFFICE"], "推荐", "优选", "注册完成", "供应商申请", false, "2027-02-14", { "CAT-OFFICE": "low" }],
    ["S010", "东湖数字技术有限公司", "ORG-WH", "U202", ["CAT-IT"], "新的", "有价值", "待邀请", "供应商申请", false, "2026-10-08", { "CAT-IT": "low" }],
    ["S011", "南岭工程材料有限公司", "ORG-SOUTH", "U202", ["CAT-STEEL"], "合格", "需改善", "注册完成", "内部供应商", true, "2026-07-02", { "CAT-STEEL": "low" }],
    ["S012", "长江智能装备有限公司", "ORG-WH", "U202", ["CAT-IT", "CAT-LOGISTICS"], "潜在", "有价值", "已失效", "平台供应商", false, "2026-06-24", { "CAT-IT": "low", "CAT-LOGISTICS": "low" }]
  ].map((row) => ({
    id: row[0],
    name: row[1],
    orgId: row[2],
    ownerId: row[3],
    categoryIds: row[4],
    level: row[5],
    segment: row[6],
    registrationStatus: row[7],
    source: row[8],
    blacklisted: row[9],
    certificateExpiry: row[10],
    categoryAttractiveness: row[11]
  }));

  const performanceConfig = {
    "CAT-OFFICE": {
      grades: [
        { id: "A", label: "A级", min: 90, color: "#22b573" },
        { id: "B", label: "B级", min: 80, color: "#2f7df6" },
        { id: "C", label: "C级", min: 70, color: "#f5a623" },
        { id: "D", label: "D级", min: 0, color: "#ff5b57" }
      ],
      kpis: ["价格竞争力", "交付及时率", "服务响应"]
    },
    "CAT-STEEL": {
      grades: [
        { id: "A", label: "卓越", min: 92, color: "#22b573" },
        { id: "B1", label: "良好", min: 85, color: "#2f7df6" },
        { id: "B2", label: "稳定", min: 75, color: "#68c7c1" },
        { id: "C", label: "观察", min: 65, color: "#f5a623" },
        { id: "D", label: "改善", min: 0, color: "#ff5b57" }
      ],
      kpis: ["质量评分", "交付评分", "价格评分", "售后评分"]
    },
    "CAT-IT": {
      grades: [
        { id: "S", label: "S级", min: 95, color: "#7057e8" },
        { id: "A", label: "A级", min: 88, color: "#22b573" },
        { id: "B", label: "B级", min: 76, color: "#2f7df6" },
        { id: "C", label: "C级", min: 0, color: "#f5a623" }
      ],
      kpis: ["产品能力", "实施质量", "服务保障", "信息安全"]
    },
    "CAT-LOGISTICS": {
      grades: [
        { id: "A", label: "优选", min: 90, color: "#22b573" },
        { id: "B", label: "合作", min: 78, color: "#2f7df6" },
        { id: "C", label: "一般", min: 65, color: "#f5a623" },
        { id: "D", label: "限制", min: 0, color: "#ff5b57" }
      ],
      kpis: ["准时到达率", "货损控制", "响应速度", "异常处理"]
    }
  };

  function assessment(id, supplierId, categoryId, period, score, kpiScores) {
    return { id, supplierId, categoryId, period, score, kpiScores };
  }

  const assessments = [
    assessment("A001", "S001", "CAT-STEEL", "2026-Q1", 93, [95, 91, 90, 96]),
    assessment("A002", "S001", "CAT-STEEL", "2026-Q2", 91, [94, 88, 90, 92]),
    assessment("A003", "S004", "CAT-STEEL", "2026-Q1", 81, [78, 84, 83, 79]),
    assessment("A004", "S004", "CAT-STEEL", "2026-Q2", 74, [70, 72, 80, 74]),
    assessment("A005", "S005", "CAT-STEEL", "2026-Q1", 72, [68, 74, 76, 70]),
    assessment("A006", "S005", "CAT-STEEL", "2026-Q2", 63, [60, 61, 70, 61]),
    assessment("A007", "S006", "CAT-STEEL", "2026-Q1", 88, [90, 86, 84, 92]),
    assessment("A008", "S006", "CAT-STEEL", "2026-Q2", 90, [92, 89, 87, 92]),
    assessment("A009", "S011", "CAT-STEEL", "2026-Q2", 76, [75, 72, 82, 75]),
    assessment("A010", "S002", "CAT-IT", "2026-Q1", 89, [91, 88, 85, 92]),
    assessment("A011", "S002", "CAT-IT", "2026-Q2", 86, [90, 84, 82, 88]),
    assessment("A012", "S003", "CAT-IT", "2026-Q2", 78, [82, 76, 74, 80]),
    assessment("A013", "S007", "CAT-IT", "2026-Q2", 92, [94, 91, 90, 93]),
    assessment("A014", "S012", "CAT-IT", "2026-Q2", 68, [72, 66, 64, 70]),
    assessment("A015", "S003", "CAT-OFFICE", "2026-Q2", 84, [86, 82, 84]),
    assessment("A016", "S009", "CAT-OFFICE", "2026-Q2", 94, [95, 93, 94]),
    assessment("A017", "S006", "CAT-LOGISTICS", "2026-Q2", 87, [88, 89, 84, 87]),
    assessment("A018", "S008", "CAT-LOGISTICS", "2026-Q2", 91, [94, 90, 89, 91]),
    assessment("A019", "S012", "CAT-LOGISTICS", "2026-Q2", 70, [72, 68, 69, 71])
  ];

  const performanceTasks = [
    ["PT01", "S001", "CAT-STEEL", "periodic", "completed", "2026-06-20"],
    ["PT02", "S002", "CAT-IT", "periodic", "completed", "2026-06-20"],
    ["PT03", "S003", "CAT-IT", "one-off", "completed", "2026-06-18"],
    ["PT04", "S003", "CAT-OFFICE", "periodic", "in_progress", "2026-06-30"],
    ["PT05", "S004", "CAT-STEEL", "periodic", "overdue", "2026-06-15"],
    ["PT06", "S005", "CAT-STEEL", "one-off", "completed", "2026-06-19"],
    ["PT07", "S006", "CAT-STEEL", "periodic", "completed", "2026-06-21"],
    ["PT08", "S006", "CAT-LOGISTICS", "periodic", "completed", "2026-06-21"],
    ["PT09", "S007", "CAT-IT", "periodic", "completed", "2026-06-22"],
    ["PT10", "S008", "CAT-LOGISTICS", "periodic", "completed", "2026-06-22"],
    ["PT11", "S009", "CAT-OFFICE", "periodic", "completed", "2026-06-23"],
    ["PT12", "S010", "CAT-IT", "one-off", "in_progress", "2026-06-30"],
    ["PT13", "S011", "CAT-STEEL", "periodic", "completed", "2026-06-20"],
    ["PT14", "S012", "CAT-IT", "periodic", "overdue", "2026-06-12"],
    ["PT15", "S012", "CAT-LOGISTICS", "periodic", "completed", "2026-06-20"],
    ["PT16", "S004", "CAT-STEEL", "one-off", "in_progress", "2026-06-28"]
  ].map((row) => ({
    id: row[0],
    supplierId: row[1],
    categoryId: row[2],
    type: row[3],
    status: row[4],
    dueDate: row[5]
  }));

  const risks = [
    ["R01", "S003", "performance", "high", "open", "绩效连续下降", "2026-06-24", 3, 3],
    ["R02", "S004", "delivery", "high", "open", "关键交付延期", "2026-06-23", 4, 3],
    ["R03", "S005", "compliance", "high", "open", "黑名单关联风险", "2026-06-22", 5, 4],
    ["R04", "S011", "quality", "medium", "open", "来料质量波动", "2026-06-20", 3, 2],
    ["R05", "S012", "certificate", "medium", "open", "注册与证照已失效", "2026-06-19", 2, 2],
    ["R06", "S002", "service", "low", "closed", "服务响应时长偏高", "2026-06-10", 1, 2]
  ].map((row) => ({
    id: row[0],
    supplierId: row[1],
    type: row[2],
    level: row[3],
    status: row[4],
    title: row[5],
    createdAt: row[6],
    likelihood: row[7],
    severity: row[8],
    lsScore: row[7] * row[8]
  }));

  const remediations = [
    { id: "M01", supplierId: "S003", status: "in_progress", dueDate: "2026-07-05", title: "制定绩效改善计划" },
    { id: "M02", supplierId: "S004", status: "plan_missing", dueDate: "2026-06-27", title: "补充延期整改计划" },
    { id: "M03", supplierId: "S005", status: "overdue", dueDate: "2026-06-18", title: "黑名单事项整改" },
    { id: "M04", supplierId: "S011", status: "completed", dueDate: "2026-06-20", title: "质量问题复盘" }
  ];

  const workflows = [
    ["W01", "S002", "品类认证", "审批中", "采购审核", "2026-06-28"],
    ["W02", "S003", "等级调整", "退回", "补充材料", "2026-06-27"],
    ["W03", "S004", "供应商注册", "已逾期", "资质提交", "2026-06-20"],
    ["W04", "S005", "整改反馈", "待提交", "供应商反馈", "2026-06-26"],
    ["W05", "S001", "首选认证", "已完成", "流程结束", "2026-06-15"],
    ["W06", "S007", "品类认证", "审批中", "采购审核", "2026-07-02"],
    ["W07", "S010", "供应商申请", "待提交", "邀请确认", "2026-06-30"],
    ["W08", "S011", "等级调整", "审批中", "管理审批", "2026-06-29"],
    ["W09", "S012", "供应商注册", "已逾期", "证照更新", "2026-06-18"],
    ["W10", "S008", "首选认证", "已完成", "流程结束", "2026-06-12"]
  ].map((row) => ({
    id: row[0],
    supplierId: row[1],
    type: row[2],
    status: row[3],
    node: row[4],
    dueDate: row[5]
  }));

  ns.data = {
    today: "2026-06-25",
    currentUserId: "U100",
    managementOrgIds: ["ORG-WH", "ORG-EAST", "ORG-SOUTH"],
    organizations,
    categories,
    suppliers,
    performanceConfig,
    assessments,
    performanceTasks,
    risks,
    remediations,
    workflows
  };
})(window);
