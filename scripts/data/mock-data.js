(function defineMockData(global) {
  "use strict";

  const ns = global.SupplierDashboard;

  const organizations = [
    { id: "ORG-WH", name: "武汉制造工厂" },
    { id: "ORG-EAST", name: "华东采购中心" },
    { id: "ORG-SOUTH", name: "华南采购中心" },
    { id: "ORG-NORTH", name: "华北采购中心" }
  ];

  const categories = [
    { id: "CAT-OFFICE", name: "常规办公用品", strategicImportance: "常规" },
    { id: "CAT-STEEL", name: "钢结构件", strategicImportance: "关键" },
    { id: "CAT-IT", name: "信息化设备", strategicImportance: "瓶颈" },
    { id: "CAT-LOGISTICS", name: "物流运输服务", strategicImportance: "杠杆" },
    { id: "CAT-MRO", name: "MRO备品备件", strategicImportance: "杠杆" },
    { id: "CAT-PACKAGING", name: "生产包装材料", strategicImportance: "常规" }
  ];

  const suppliers = [
    ["S001", "百隆五金结构件有限公司", "ORG-WH", "U100", ["CAT-STEEL"], "优秀", "优选", "注册完成", "供应商申请", false, "2026-11-18", { "CAT-STEEL": "高共同利益" }],
    ["S002", "武汉佰思杰科技有限公司", "ORG-WH", "U100", ["CAT-IT"], "推荐", "有价值", "注册完成", "内部供应商", false, "2026-07-12", { "CAT-IT": "采购方有利" }],
    ["S003", "广西智促科技有限公司", "ORG-SOUTH", "U100", ["CAT-OFFICE", "CAT-IT"], "合格", "需改善", "注册完成", "供应商申请", false, "2026-07-05", { "CAT-OFFICE": "供应商有利", "CAT-IT": "供应商有利" }],
    ["S004", "湖北曦翔建设工程有限公司", "ORG-WH", "U100", ["CAT-STEEL"], "潜在", "需改善", "注册中", "供应商申请", false, "2026-06-29", { "CAT-STEEL": "供应商有利" }],
    ["S005", "江南模塑科技有限公司", "ORG-EAST", "U100", ["CAT-STEEL"], "淘汰", "可剔除", "注册完成", "内部供应商", true, "2026-08-20", { "CAT-STEEL": "双方低利益" }],
    ["S006", "江南造船厂", "ORG-EAST", "U200", ["CAT-STEEL", "CAT-LOGISTICS"], "优秀", "优选", "注册完成", "内部供应商", false, "2027-01-12", { "CAT-STEEL": "采购方有利", "CAT-LOGISTICS": "高共同利益" }],
    ["S007", "中原工业设备有限公司", "ORG-WH", "U200", ["CAT-IT"], "注册", "有价值", "注册完成", "供应商申请", false, "2026-09-10", { "CAT-IT": "高共同利益" }],
    ["S008", "海川物流服务有限公司", "ORG-SOUTH", "U201", ["CAT-LOGISTICS"], "合格", "有价值", "注册完成", "供应商申请", false, "2026-12-31", { "CAT-LOGISTICS": "采购方有利" }],
    ["S009", "华新办公集采有限公司", "ORG-EAST", "U201", ["CAT-OFFICE", "CAT-PACKAGING"], "推荐", "优选", "注册完成", "供应商申请", false, "2027-02-14", { "CAT-OFFICE": "高共同利益", "CAT-PACKAGING": "采购方有利" }],
    ["S010", "东湖数字技术有限公司", "ORG-WH", "U202", ["CAT-IT"], "新的", "有价值", "待邀请", "供应商申请", false, "2026-10-08", { "CAT-IT": "双方低利益" }],
    ["S011", "南岭工程材料有限公司", "ORG-SOUTH", "U202", ["CAT-STEEL"], "合格", "需改善", "注册完成", "内部供应商", true, "2026-07-02", { "CAT-STEEL": "供应商有利" }],
    ["S012", "长江智能装备有限公司", "ORG-WH", "U202", ["CAT-IT", "CAT-LOGISTICS"], "潜在", "有价值", "已失效", "内部供应商", false, "2026-06-24", { "CAT-IT": "双方低利益", "CAT-LOGISTICS": "供应商有利" }],
    ["S013", "华中标准件有限公司", "ORG-WH", "U203", ["CAT-STEEL", "CAT-MRO"], "合格", "有价值", "注册完成", "供应商申请", false, "2027-03-01", { "CAT-STEEL": "采购方有利", "CAT-MRO": "采购方有利" }],
    ["S014", "江夏包装材料有限公司", "ORG-WH", "U204", ["CAT-OFFICE", "CAT-PACKAGING"], "注册", "有价值", "注册完成", "供应商申请", false, "2027-04-16", { "CAT-OFFICE": "高共同利益", "CAT-PACKAGING": "供应商有利" }],
    ["S015", "博远信息服务有限公司", "ORG-WH", "U100", ["CAT-IT"], "推荐", "优选", "注册完成", "供应商申请", false, "2026-12-08", { "CAT-IT": "供应商有利" }],
    ["S016", "东南仓配服务有限公司", "ORG-EAST", "U203", ["CAT-LOGISTICS", "CAT-MRO"], "合格", "有价值", "注册完成", "内部供应商", false, "2027-05-10", { "CAT-LOGISTICS": "双方低利益", "CAT-MRO": "供应商有利" }],
    ["S017", "苏州精密制造有限公司", "ORG-EAST", "U204", ["CAT-STEEL"], "优秀", "优选", "注册完成", "内部供应商", false, "2027-06-06", { "CAT-STEEL": "高共同利益" }],
    ["S018", "上海云帆科技有限公司", "ORG-EAST", "U200", ["CAT-IT"], "合格", "有价值", "注册完成", "内部供应商", false, "2027-01-30", { "CAT-IT": "采购方有利" }],
    ["S019", "宁波办公服务有限公司", "ORG-EAST", "U201", ["CAT-OFFICE", "CAT-PACKAGING"], "注册", "有价值", "注册完成", "供应商申请", false, "2027-08-12", { "CAT-OFFICE": "双方低利益", "CAT-PACKAGING": "双方低利益" }],
    ["S020", "华南优速物流有限公司", "ORG-SOUTH", "U205", ["CAT-LOGISTICS", "CAT-PACKAGING"], "优秀", "优选", "注册完成", "内部供应商", false, "2027-07-18", { "CAT-LOGISTICS": "高共同利益", "CAT-PACKAGING": "高共同利益" }],
    ["S021", "佛山五金配套有限公司", "ORG-SOUTH", "U206", ["CAT-STEEL", "CAT-MRO"], "合格", "有价值", "注册完成", "供应商申请", false, "2027-03-24", { "CAT-STEEL": "采购方有利", "CAT-MRO": "高共同利益" }],
    ["S022", "深圳数字集成有限公司", "ORG-SOUTH", "U100", ["CAT-IT", "CAT-OFFICE"], "推荐", "优选", "注册完成", "供应商申请", false, "2027-09-09", { "CAT-IT": "高共同利益", "CAT-OFFICE": "采购方有利" }],
    ["S023", "燕山工业材料有限公司", "ORG-NORTH", "U207", ["CAT-STEEL", "CAT-PACKAGING"], "合格", "有价值", "注册完成", "供应商申请", false, "2027-04-02", { "CAT-STEEL": "采购方有利", "CAT-PACKAGING": "供应商有利" }],
    ["S024", "津门智慧物流有限公司", "ORG-NORTH", "U208", ["CAT-LOGISTICS", "CAT-MRO"], "推荐", "优选", "注册完成", "内部供应商", false, "2027-05-22", { "CAT-LOGISTICS": "高共同利益", "CAT-MRO": "双方低利益" }],
    ["S025", "北方云科设备有限公司", "ORG-NORTH", "U209", ["CAT-IT"], "注册", "有价值", "注册完成", "供应商申请", false, "2027-01-18", { "CAT-IT": "供应商有利" }]
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

  const categoryCertifications = [
    ["CC001", "S001", "CAT-STEEL", "认证通过", "已认证", "2025-11-20", "2026-11-18", "U100"],
    ["CC002", "S002", "CAT-IT", "认证通过", "已认证", "2025-12-16", "2026-07-12", "U100"],
    ["CC003", "S002", "CAT-OFFICE", "认证中", "采购审核", "2026-06-18", "", "U100"],
    ["CC004", "S003", "CAT-OFFICE", "认证通过", "已认证", "2026-01-08", "2026-07-05", "U100"],
    ["CC005", "S003", "CAT-IT", "认证通过", "已认证", "2026-01-12", "2026-07-05", "U100"],
    ["CC006", "S004", "CAT-STEEL", "认证通过", "已认证", "2026-03-21", "2026-06-29", "U100"],
    ["CC007", "S005", "CAT-STEEL", "已失效", "认证退出", "2025-08-11", "2026-05-31", "U100"],
    ["CC008", "S006", "CAT-STEEL", "认证通过", "已认证", "2025-10-22", "2027-01-12", "U200"],
    ["CC009", "S006", "CAT-LOGISTICS", "认证通过", "已认证", "2025-12-02", "2027-01-12", "U200"],
    ["CC010", "S007", "CAT-IT", "认证通过", "已认证", "2026-02-10", "2026-09-10", "U200"],
    ["CC011", "S007", "CAT-STEEL", "认证中", "资料复核", "2026-06-17", "", "U200"],
    ["CC012", "S008", "CAT-LOGISTICS", "认证通过", "已认证", "2026-01-18", "2026-12-31", "U201"],
    ["CC013", "S009", "CAT-OFFICE", "认证通过", "已认证", "2026-02-24", "2027-02-14", "U201"],
    ["CC014", "S010", "CAT-IT", "认证中", "供应商提交", "2026-06-12", "", "U202"],
    ["CC015", "S011", "CAT-STEEL", "认证通过", "已认证", "2025-12-30", "2026-07-02", "U202"],
    ["CC016", "S012", "CAT-IT", "已失效", "证照更新", "2025-09-18", "2026-06-24", "U202"],
    ["CC017", "S012", "CAT-LOGISTICS", "认证通过", "已认证", "2026-02-28", "2026-12-24", "U202"],
    ["CC018", "S013", "CAT-STEEL", "认证通过", "已认证", "2026-03-01", "2027-03-01", "U203"],
    ["CC019", "S014", "CAT-OFFICE", "认证通过", "已认证", "2026-04-16", "2027-04-16", "U204"],
    ["CC020", "S015", "CAT-IT", "认证通过", "已认证", "2025-12-08", "2026-12-08", "U100"],
    ["CC021", "S016", "CAT-LOGISTICS", "认证通过", "已认证", "2026-05-10", "2027-05-10", "U203"],
    ["CC022", "S017", "CAT-STEEL", "认证通过", "已认证", "2026-06-06", "2027-06-06", "U204"],
    ["CC023", "S018", "CAT-IT", "认证通过", "已认证", "2026-01-30", "2027-01-30", "U200"],
    ["CC024", "S019", "CAT-OFFICE", "认证通过", "已认证", "2026-05-12", "2027-08-12", "U201"],
    ["CC025", "S020", "CAT-LOGISTICS", "认证通过", "已认证", "2026-04-18", "2027-07-18", "U205"],
    ["CC026", "S021", "CAT-STEEL", "认证通过", "已认证", "2026-03-24", "2027-03-24", "U206"],
    ["CC027", "S022", "CAT-IT", "认证通过", "已认证", "2026-03-09", "2027-09-09", "U100"],
    ["CC028", "S022", "CAT-OFFICE", "认证通过", "已认证", "2026-04-09", "2027-09-09", "U100"],
    ["CC029", "S023", "CAT-STEEL", "认证通过", "已认证", "2026-04-02", "2027-04-02", "U207"],
    ["CC030", "S024", "CAT-LOGISTICS", "认证通过", "已认证", "2026-05-22", "2027-05-22", "U208"],
    ["CC031", "S025", "CAT-IT", "认证通过", "已认证", "2026-01-18", "2027-01-18", "U209"],
    ["CC032", "S011", "CAT-LOGISTICS", "退回整改", "补充运输资质", "2026-06-10", "", "U202"],
    ["CC033", "S018", "CAT-STEEL", "待提交", "供应商补充材料", "2026-06-21", "", "U200"],
    ["CC034", "S013", "CAT-MRO", "认证通过", "已认证", "2026-03-18", "2027-03-18", "U203"],
    ["CC035", "S016", "CAT-MRO", "认证通过", "已认证", "2026-01-20", "2026-07-20", "U203"],
    ["CC036", "S021", "CAT-MRO", "认证中", "现场评审", "2026-06-19", "", "U206"],
    ["CC037", "S024", "CAT-MRO", "待提交", "供应商补充材料", "2026-06-22", "", "U208"],
    ["CC038", "S009", "CAT-PACKAGING", "认证通过", "已认证", "2026-03-10", "2027-03-10", "U201"],
    ["CC039", "S014", "CAT-PACKAGING", "认证通过", "已认证", "2026-02-10", "2026-07-10", "U204"],
    ["CC040", "S019", "CAT-PACKAGING", "待提交", "供应商提交资料", "2026-06-20", "", "U201"],
    ["CC041", "S020", "CAT-PACKAGING", "已失效", "认证退出", "2025-10-12", "2026-06-12", "U205"],
    ["CC042", "S023", "CAT-PACKAGING", "退回整改", "补充环保资质", "2026-06-18", "", "U207"]
  ].map((row) => ({
    id: row[0],
    supplierId: row[1],
    categoryId: row[2],
    status: row[3],
    node: row[4],
    submittedAt: row[5],
    expiresAt: row[6],
    ownerId: row[7]
  }));

  const performanceConfig = {
    "CAT-OFFICE": {
      grades: [
        { id: "A", label: "A级", min: 90, color: "#22b573", builtInGrade: "A" },
        { id: "B", label: "B级", min: 80, color: "#2f7df6", builtInGrade: "B" },
        { id: "C", label: "C级", min: 70, color: "#f5a623", builtInGrade: "C" },
        { id: "D", label: "D级", min: 0, color: "#ff5b57", builtInGrade: "D" }
      ],
      kpis: ["价格竞争力", "交付及时率", "服务响应", "质量稳定", "协同配合"]
    },
    "CAT-STEEL": {
      grades: [
        { id: "A", label: "卓越", min: 92, color: "#22b573", builtInGrade: "A" },
        { id: "B1", label: "良好", min: 85, color: "#2f7df6", builtInGrade: "B" },
        { id: "B2", label: "稳定", min: 75, color: "#68c7c1", builtInGrade: "B" },
        { id: "C", label: "观察", min: 65, color: "#f5a623", builtInGrade: "C" },
        { id: "D", label: "改善", min: 0, color: "#ff5b57", builtInGrade: "D" }
      ],
      kpis: ["质量评分", "交付评分", "价格评分", "售后评分", "响应评分", "协同评分"]
    },
    "CAT-IT": {
      grades: [
        { id: "S", label: "S级", min: 95, color: "#7057e8", builtInGrade: "A" },
        { id: "A", label: "A级", min: 88, color: "#22b573", builtInGrade: "B" },
        { id: "B", label: "B级", min: 76, color: "#2f7df6", builtInGrade: "C" },
        { id: "C", label: "C级", min: 0, color: "#f5a623", builtInGrade: "D" }
      ],
      kpis: ["产品能力", "实施质量", "服务保障", "信息安全", "响应效率", "协同配合"]
    },
    "CAT-LOGISTICS": {
      grades: [
        { id: "A", label: "优选", min: 90, color: "#22b573", builtInGrade: "A" },
        { id: "B", label: "合作", min: 78, color: "#2f7df6", builtInGrade: "B" },
        { id: "C", label: "一般", min: 65, color: "#f5a623", builtInGrade: "C" },
        { id: "D", label: "限制", min: 0, color: "#ff5b57", builtInGrade: "D" }
      ],
      kpis: ["准时到达率", "货损控制", "响应速度", "异常处理", "调度协同", "成本稳定"]
    },
    "CAT-MRO": {
      grades: [
        { id: "A", label: "稳定保障", min: 90, color: "#22b573", builtInGrade: "A" },
        { id: "B", label: "可用", min: 80, color: "#2f7df6", builtInGrade: "B" },
        { id: "C", label: "观察", min: 68, color: "#f5a623", builtInGrade: "C" },
        { id: "D", label: "限制", min: 0, color: "#ff5b57", builtInGrade: "D" }
      ],
      kpis: ["备件齐套率", "响应时效", "价格稳定性", "应急保障", "库存协同", "质量稳定"]
    },
    "CAT-PACKAGING": {
      grades: [
        { id: "A", label: "优质", min: 88, color: "#22b573", builtInGrade: "A" },
        { id: "B", label: "合格", min: 76, color: "#2f7df6", builtInGrade: "B" },
        { id: "C", label: "改善", min: 62, color: "#f5a623", builtInGrade: "C" },
        { id: "D", label: "停用", min: 0, color: "#ff5b57", builtInGrade: "D" }
      ],
      kpis: ["包装合格率", "交付及时率", "成本控制", "环保符合", "设计协同", "批次稳定"]
    }
  };

  function clampScore(value) {
    return Math.max(0, Math.min(100, value));
  }

  function derivedKpiScore(score, id, index) {
    const seed = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const offsets = [-3, 2, -1, 4, -4, 1, 3];
    return clampScore(score + offsets[(seed + index) % offsets.length]);
  }

  function assessment(id, supplierId, categoryId, period, score, kpiScores) {
    const kpis = performanceConfig[categoryId]?.kpis || [];
    return {
      id,
      supplierId,
      categoryId,
      period,
      score,
      kpiScores: kpis.map((_, index) => kpiScores[index] ?? derivedKpiScore(score, id, index))
    };
  }

  const assessments = [
    assessment("A001", "S001", "CAT-STEEL", "2026-Q1", 93, [95, 91, 90, 96]),
    assessment("A002", "S001", "CAT-STEEL", "2026-Q2", 91, [94, 88, 90, 92]),
    assessment("A039", "S001", "CAT-STEEL", "2025-07", 88, [90, 84, 87, 91, 86, 89]),
    assessment("A040", "S001", "CAT-STEEL", "2025-10", 90, [92, 87, 88, 93, 89, 91]),
    assessment("A041", "S001", "CAT-STEEL", "2026-03", 94, [96, 92, 90, 97, 91, 94]),
    assessment("A042", "S001", "CAT-STEEL", "2026-06", 92, [95, 89, 90, 94, 90, 92]),
    assessment("A003", "S004", "CAT-STEEL", "2026-Q1", 81, [78, 84, 83, 79]),
    assessment("A004", "S004", "CAT-STEEL", "2026-Q2", 74, [70, 72, 80, 74]),
    assessment("A043", "S004", "CAT-STEEL", "2025-09", 83, [80, 86, 84, 82, 81, 83]),
    assessment("A044", "S004", "CAT-STEEL", "2025-12", 79, [76, 80, 82, 78, 77, 79]),
    assessment("A045", "S004", "CAT-STEEL", "2026-06", 62, [58, 61, 68, 62, 60, 63]),
    assessment("A005", "S005", "CAT-STEEL", "2026-Q1", 72, [68, 74, 76, 70]),
    assessment("A006", "S005", "CAT-STEEL", "2026-Q2", 63, [60, 61, 70, 61]),
    assessment("A007", "S006", "CAT-STEEL", "2026-Q1", 88, [90, 86, 84, 92]),
    assessment("A008", "S006", "CAT-STEEL", "2026-Q2", 90, [92, 89, 87, 92]),
    assessment("A046", "S006", "CAT-STEEL", "2025-08", 84, [86, 82, 80, 88, 83, 85]),
    assessment("A047", "S006", "CAT-STEEL", "2025-11", 87, [88, 86, 84, 90, 85, 87]),
    assessment("A048", "S006", "CAT-STEEL", "2026-05", 91, [93, 90, 88, 92, 90, 91]),
    assessment("A009", "S011", "CAT-STEEL", "2026-Q2", 76, [75, 72, 82, 75]),
    assessment("A049", "S011", "CAT-STEEL", "2025-10", 79, [78, 76, 83, 79, 75, 78]),
    assessment("A050", "S011", "CAT-STEEL", "2026-06", 73, [72, 69, 80, 72, 70, 73]),
    assessment("A010", "S002", "CAT-IT", "2026-Q1", 89, [91, 88, 85, 92]),
    assessment("A011", "S002", "CAT-IT", "2026-Q2", 86, [90, 84, 82, 88]),
    assessment("A051", "S002", "CAT-IT", "2025-07", 82, [84, 82, 80, 83, 81, 82]),
    assessment("A052", "S002", "CAT-IT", "2025-11", 88, [90, 87, 86, 89, 88, 87]),
    assessment("A053", "S002", "CAT-IT", "2026-06", 87, [90, 85, 83, 88, 86, 87]),
    assessment("A012", "S003", "CAT-IT", "2026-Q2", 78, [82, 76, 74, 80]),
    assessment("A054", "S003", "CAT-IT", "2025-09", 74, [76, 73, 72, 76, 74, 73]),
    assessment("A055", "S003", "CAT-IT", "2026-06", 72, [75, 70, 68, 73, 72, 71]),
    assessment("A013", "S007", "CAT-IT", "2026-Q2", 92, [94, 91, 90, 93]),
    assessment("A056", "S007", "CAT-IT", "2025-08", 86, [88, 85, 84, 88, 86, 87]),
    assessment("A057", "S007", "CAT-IT", "2025-12", 90, [92, 89, 88, 91, 90, 90]),
    assessment("A058", "S007", "CAT-IT", "2026-06", 93, [95, 92, 91, 94, 92, 93]),
    assessment("A014", "S012", "CAT-IT", "2026-Q2", 68, [72, 66, 64, 70]),
    assessment("A015", "S003", "CAT-OFFICE", "2026-Q2", 84, [86, 82, 84]),
    assessment("A016", "S009", "CAT-OFFICE", "2026-Q2", 94, [95, 93, 94]),
    assessment("A017", "S006", "CAT-LOGISTICS", "2026-Q2", 87, [88, 89, 84, 87]),
    assessment("A018", "S008", "CAT-LOGISTICS", "2026-Q2", 91, [94, 90, 89, 91]),
    assessment("A019", "S012", "CAT-LOGISTICS", "2026-Q2", 70, [72, 68, 69, 71]),
    assessment("A020", "S013", "CAT-STEEL", "2026-Q2", 84, [86, 82, 83, 85]),
    assessment("A059", "S013", "CAT-STEEL", "2025-08", 80, [82, 78, 79, 81, 80, 80]),
    assessment("A060", "S013", "CAT-STEEL", "2026-06", 85, [87, 83, 84, 86, 84, 85]),
    assessment("A021", "S015", "CAT-IT", "2026-Q2", 90, [92, 89, 88, 91]),
    assessment("A061", "S015", "CAT-IT", "2025-10", 86, [88, 85, 84, 87, 86, 86]),
    assessment("A062", "S015", "CAT-IT", "2026-06", 96, [98, 95, 94, 97, 96, 95]),
    assessment("A022", "S017", "CAT-STEEL", "2026-Q2", 94, [96, 93, 91, 95]),
    assessment("A063", "S017", "CAT-STEEL", "2025-09", 89, [91, 88, 86, 91, 89, 90]),
    assessment("A064", "S017", "CAT-STEEL", "2026-06", 95, [97, 94, 92, 96, 94, 95]),
    assessment("A023", "S018", "CAT-IT", "2026-Q2", 82, [84, 80, 81, 83]),
    assessment("A065", "S018", "CAT-IT", "2025-11", 79, [81, 78, 77, 80, 78, 79]),
    assessment("A066", "S018", "CAT-IT", "2026-06", 84, [86, 82, 83, 85, 83, 84]),
    assessment("A024", "S020", "CAT-LOGISTICS", "2026-Q2", 93, [95, 92, 91, 94]),
    assessment("A025", "S021", "CAT-STEEL", "2026-Q2", 86, [88, 85, 84, 87]),
    assessment("A067", "S021", "CAT-STEEL", "2025-07", 82, [84, 80, 81, 83, 82, 82]),
    assessment("A068", "S021", "CAT-STEEL", "2026-05", 87, [89, 86, 85, 88, 86, 87]),
    assessment("A026", "S022", "CAT-IT", "2026-Q2", 88, [90, 87, 86, 89]),
    assessment("A069", "S022", "CAT-IT", "2025-09", 84, [86, 83, 82, 85, 84, 84]),
    assessment("A070", "S022", "CAT-IT", "2026-06", 89, [91, 88, 87, 90, 88, 89]),
    assessment("A027", "S022", "CAT-OFFICE", "2026-Q2", 91, [93, 90, 91]),
    assessment("A028", "S023", "CAT-STEEL", "2026-Q2", 82, [84, 81, 80, 83]),
    assessment("A071", "S023", "CAT-STEEL", "2025-11", 78, [80, 76, 77, 79, 78, 78]),
    assessment("A072", "S023", "CAT-STEEL", "2026-06", 83, [85, 82, 81, 84, 82, 83]),
    assessment("A029", "S024", "CAT-LOGISTICS", "2026-Q2", 89, [91, 88, 87, 90]),
    assessment("A030", "S025", "CAT-IT", "2026-Q2", 85, [87, 84, 83, 86]),
    assessment("A073", "S025", "CAT-IT", "2025-12", 81, [83, 80, 79, 82, 81, 81]),
    assessment("A074", "S025", "CAT-IT", "2026-06", 86, [88, 85, 84, 87, 86, 85]),
    assessment("A031", "S013", "CAT-MRO", "2026-Q2", 86, [88, 85, 84, 87]),
    assessment("A032", "S016", "CAT-MRO", "2026-Q2", 78, [76, 82, 77, 79]),
    assessment("A033", "S021", "CAT-MRO", "2026-Q2", 91, [92, 90, 88, 94]),
    assessment("A034", "S024", "CAT-MRO", "2026-Q2", 66, [64, 68, 67, 65]),
    assessment("A035", "S009", "CAT-PACKAGING", "2026-Q2", 90, [92, 89, 91, 88]),
    assessment("A036", "S014", "CAT-PACKAGING", "2026-Q2", 83, [85, 82, 80, 84]),
    assessment("A037", "S020", "CAT-PACKAGING", "2026-Q2", 72, [70, 76, 73, 69]),
    assessment("A038", "S023", "CAT-PACKAGING", "2026-Q2", 61, [62, 60, 63, 59])
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
    ["PT16", "S004", "CAT-STEEL", "one-off", "in_progress", "2026-06-28"],
    ["PT17", "S013", "CAT-STEEL", "periodic", "completed", "2026-06-22"],
    ["PT18", "S014", "CAT-OFFICE", "one-off", "in_progress", "2026-07-04"],
    ["PT19", "S015", "CAT-IT", "periodic", "completed", "2026-06-23"],
    ["PT20", "S017", "CAT-STEEL", "periodic", "completed", "2026-06-24"],
    ["PT21", "S018", "CAT-IT", "periodic", "completed", "2026-06-24"],
    ["PT22", "S020", "CAT-LOGISTICS", "periodic", "completed", "2026-06-24"],
    ["PT23", "S021", "CAT-STEEL", "periodic", "completed", "2026-06-24"],
    ["PT24", "S022", "CAT-IT", "periodic", "completed", "2026-06-24"],
    ["PT25", "S022", "CAT-OFFICE", "one-off", "completed", "2026-06-24"],
    ["PT26", "S023", "CAT-STEEL", "periodic", "completed", "2026-06-24"],
    ["PT27", "S024", "CAT-LOGISTICS", "periodic", "completed", "2026-06-24"],
    ["PT28", "S025", "CAT-IT", "periodic", "completed", "2026-06-24"],
    ["PT29", "S013", "CAT-MRO", "periodic", "completed", "2026-06-25"],
    ["PT30", "S016", "CAT-MRO", "periodic", "in_progress", "2026-07-01"],
    ["PT31", "S021", "CAT-MRO", "one-off", "completed", "2026-06-25"],
    ["PT32", "S024", "CAT-MRO", "periodic", "overdue", "2026-06-18"],
    ["PT33", "S009", "CAT-PACKAGING", "periodic", "completed", "2026-06-25"],
    ["PT34", "S014", "CAT-PACKAGING", "periodic", "completed", "2026-06-25"],
    ["PT35", "S020", "CAT-PACKAGING", "one-off", "in_progress", "2026-07-03"],
    ["PT36", "S023", "CAT-PACKAGING", "periodic", "overdue", "2026-06-17"]
  ].map((row) => ({
    id: row[0],
    supplierId: row[1],
    categoryId: row[2],
    type: row[3],
    status: row[4],
    dueDate: row[5]
  }));

  const risks = [
    ["R01", "S003", "performance", "high", "分析中", "绩效连续下降", "2026-06-24", 3, 3, 3, 2, 15],
    ["R02", "S004", "delivery", "high", "应对中", "关键交付延期", "2026-06-23", 4, 3, 6, 3, 15],
    ["R03", "S005", "compliance", "high", "分析中", "黑名单关联风险", "2026-06-22", 5, 4, 10, 6, 40],
    ["R04", "S011", "quality", "medium", "应对中", "来料质量波动", "2026-06-20", 3, 2, 3, 3, 7],
    ["R05", "S012", "certificate", "medium", "分析中", "注册与证照已失效", "2026-06-19", 2, 2, 1, 6, 7],
    ["R06", "S002", "service", "low", "已关闭", "服务响应时长偏高", "2026-06-10", 1, 2, 0.5, 1, 7],
    ["R07", "S001", "quality", "medium", "分析中", "抽检批次偏差", "2026-06-25", 3, 2, 3, 3, 7],
    ["R08", "S002", "service", "low", "应对中", "服务响应偏慢", "2026-06-25", 2, 1, 1, 1, 3],
    ["R09", "S003", "delivery", "medium", "分析中", "交付计划频繁调整", "2026-06-24", 2, 3, 1, 3, 15],
    ["R10", "S004", "certificate", "high", "应对中", "资质材料即将到期", "2026-06-23", 4, 2, 6, 6, 7],
    ["R11", "S005", "compliance", "high", "应对中", "合规整改超期", "2026-06-22", 4, 4, 6, 6, 40],
    ["R12", "S006", "capacity", "medium", "分析中", "旺季产能不足", "2026-06-21", 3, 3, 3, 3, 15],
    ["R13", "S007", "service", "low", "分析中", "技术支持响应不稳定", "2026-06-20", 2, 2, 1, 1, 7],
    ["R14", "S008", "delivery", "medium", "应对中", "运输异常率上升", "2026-06-19", 3, 2, 3, 3, 7],
    ["R15", "S009", "price", "low", "分析中", "报价波动偏高", "2026-06-18", 2, 1, 1, 1, 3],
    ["R16", "S010", "registration", "medium", "分析中", "邀请确认长时间未响应", "2026-06-17", 2, 3, 1, 2, 15],
    ["R17", "S011", "quality", "high", "应对中", "关键质量问题复发", "2026-06-16", 4, 3, 6, 3, 15],
    ["R18", "S012", "certificate", "high", "应对中", "证照更新未完成", "2026-06-15", 3, 4, 3, 6, 40]
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
    lecLikelihood: row[9],
    exposure: row[10],
    consequence: row[11],
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
    managementOrgIds: ["ORG-WH", "ORG-EAST", "ORG-SOUTH", "ORG-NORTH"],
    organizations,
    categories,
    suppliers,
    performanceConfig,
    assessments,
    performanceTasks,
    risks,
    remediations,
    workflows,
    categoryCertifications
  };
})(window);
