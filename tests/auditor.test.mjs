import test from 'node:test';
import assert from 'node:assert/strict';
import {
  demoState,
  execute,
  isAdminRole,
  isAuditorRole,
  exportProjectMeritPackage,
  exportProjectMeritPackageJson,
  parseProjectMeritPackage,
  summarizeAuditorPackages,
  summarizeCurrentStateForAuditor,
  exportAuditorEmployeesCsv,
  exportAuditorProjectsCsv,
  exportAuditorMatrixCsv,
  exportAuditorDetailsCsv,
  exportAuditorFullBundleJson,
  exportProjectManagerBundle,
  exportProjectManagerBundleJson,
  parseMeritPackageOrBundle,
  calculateDepartmentContracts,
  calculateHonorStars,
  calculateStars,
} from '../lib/core.ts';

test('核算员与管理员角色权限校验', () => {
  const adminEmp = { id: 'e_admin', name: '系统管理员', department: '综合管理部', role: 'admin', active: true };
  const auditorEmp = { id: 'e_auditor', name: '李核算', department: '综合管理部', role: 'auditor', active: true };
  const memberEmp = { id: 'e_member', name: '王项目', department: '研发中心', role: 'member', active: true };

  assert.equal(isAdminRole(adminEmp), true);
  assert.equal(isAdminRole(auditorEmp), false);
  assert.equal(isAdminRole(memberEmp), false);

  assert.equal(isAuditorRole(adminEmp), true); // 管理员拥有核算员权限
  assert.equal(isAuditorRole(auditorEmp), true); // 核算员具备核算汇总权限
  assert.equal(isAuditorRole(memberEmp), false); // 普通成员无全项目核算权限
});

test('项目负责人导出项目分配绩点数据包：包含每个人的绩点总和、绩点明细、每个项目分配额度情况', () => {
  const state = demoState();
  const project = state.projects[0];
  const owner = state.employees.find(e => e.id === project.owner);

  // 1. 项目负责人导出数据包
  const pkg = exportProjectMeritPackage(state, project.id, { actor: owner });

  assert.equal(pkg.packageType, 'project_merit_package');
  assert.equal(pkg.project.id, project.id);
  assert.equal(pkg.project.name, project.name);
  assert.equal(pkg.project.code, project.code);

  // 验证包含项目分配额度情况
  assert.ok(pkg.project.contractWan > 0);
  assert.ok(typeof pkg.project.remainingWan === 'number');
  assert.ok(typeof pkg.project.periodAllocatedWan === 'number');
  assert.ok(typeof pkg.project.periodAllocatedPoints === 'number');

  // 验证包含每个人的绩点总和
  assert.ok(pkg.memberSummaries.length > 0);
  for (const m of pkg.memberSummaries) {
    assert.ok(m.employeeId);
    assert.ok(m.name);
    assert.ok(typeof m.totalPoints === 'number');
    assert.ok(typeof m.totalWan === 'number');
    assert.ok(typeof m.ratioInProject === 'number');
  }

  // 验证包含绩点明细
  assert.ok(pkg.details.length > 0);
  for (const d of pkg.details) {
    assert.equal(d.projectId, project.id);
    assert.ok(d.month);
    assert.ok(d.employeeId);
    assert.ok(typeof d.points === 'number');
    assert.ok(typeof d.rate === 'number');
  }

  // 验证导出 JSON
  const jsonStr = exportProjectMeritPackageJson(state, project.id, { actor: owner });
  const parsed = parseProjectMeritPackage(jsonStr);
  assert.equal(parsed.project.id, project.id);
  assert.equal(parsed.memberSummaries.length, pkg.memberSummaries.length);
  assert.equal(parsed.details.length, pkg.details.length);
});

test('权限隔离：非本项目负责人的普通员工无法越权导出其他项目数据包', () => {
  const state = demoState();
  const project = state.projects[0];
  const otherMember = state.employees.find(e => e.id !== project.owner && e.role === 'member');

  assert.throws(() => {
    exportProjectMeritPackage(state, project.id, { actor: otherMember });
  }, /只有项目负责人、核算员或管理员可以导出该项目的分配数据包/);
});

test('核算员导入多个项目分配数据包并自动汇总全员全项目分配', () => {
  // 模拟场景：一个团队，2位项目负责人各负责一个项目，分别分配并导出数据包发给核算员
  const state = demoState();

  // prjA 由已有的项目负责人负责
  const prjA = state.projects[0];
  const ownerA = state.employees.find(e => e.id === prjA.owner);

  // 新增项目 prjB，由另一位成员负责
  const ownerB = state.employees.find(e => e.id !== prjA.owner && e.role === 'member') || state.employees[1];
  const prjB = {
    id: 'prj_002',
    code: '26-002',
    name: '车载智能控制器研制项目',
    client: '比亚迪汽车',
    contract: 200_000_000, // 200 万元
    owner: ownerB.id,
    start: '2026-01',
    end: '2026-06',
    status: 'active',
    members: [ownerB.id, state.employees[0].id, state.employees[2].id],
  };
  state.projects.push(prjB);

  // 为 prjB 创建一个月度分配计划
  const planB = {
    id: 'plan_b_01',
    projectId: prjB.id,
    month: '2026-01',
    budget: 1000, // 10%
    status: 'published',
    note: '方案评审通过阶段分配',
    entries: [
      { employeeId: ownerB.id, rate: 5000, workContent: '主持总体方案设计与交付' },
      { employeeId: state.employees[0].id, rate: 3000, workContent: '硬件系统架构评审' },
      { employeeId: state.employees[2].id, rate: 2000, workContent: '嵌入式驱动研制' },
    ],
  };
  state.plans.push(planB);

  // 两位负责人导出各自项目的数据包
  const pkgA = exportProjectMeritPackage(state, prjA.id, { actor: ownerA });
  const pkgB = exportProjectMeritPackage(state, prjB.id, { actor: ownerB });

  // 核算员导入这两个数据包并执行自动汇总
  const summary = summarizeAuditorPackages([pkgA, pkgB], state.employees);

  // 1. 验证全景指标
  assert.equal(summary.overview.packageCount, 2);
  assert.ok(summary.overview.totalAllocatedPoints > 0);
  assert.ok(summary.overview.totalAllocatedWan > 0);
  assert.ok(summary.overview.totalEmployees > 0);

  // 2. 验证各项目分配额度情况对照表
  assert.equal(summary.projectSummaries.length, 2);
  const sumPrjA = summary.projectSummaries.find(p => p.id === prjA.id);
  const sumPrjB = summary.projectSummaries.find(p => p.id === prjB.id);
  assert.ok(sumPrjA);
  assert.ok(sumPrjB);
  assert.equal(sumPrjA.name, prjA.name);
  assert.equal(sumPrjA.contractWan, pkgA.project.contractWan);
  assert.equal(sumPrjA.allocatedPoints, pkgA.project.periodAllocatedPoints);

  // 3. 验证全员跨项目绩点总和大表
  assert.ok(summary.employeeSummaries.length > 0);
  for (const emp of summary.employeeSummaries) {
    assert.ok(emp.rank >= 1);
    assert.ok(emp.totalPoints >= 0);
    // 跨项目总绩点必须等于该员工在所有项目获得的绩点之和
    const calculatedSum = emp.projects.reduce((acc, p) => acc + p.points, 0);
    assert.equal(emp.totalPoints, calculatedSum);
  }

  // 4. 验证二维透视矩阵行列双向守恒
  assert.equal(summary.matrix.projectHeaders.length, 2);
  let sumRowsGrandTotal = 0;
  for (const r of summary.matrix.rows) {
    const rowSum = r.scores.reduce((a, b) => a + b, 0);
    assert.equal(r.rowTotalPoints, rowSum);
    sumRowsGrandTotal += rowSum;
  }
  const sumColsGrandTotal = summary.matrix.projectTotals.reduce((a, b) => a + b, 0);

  assert.equal(summary.matrix.grandTotalPoints, sumRowsGrandTotal);
  assert.equal(summary.matrix.grandTotalPoints, sumColsGrandTotal);
  assert.equal(summary.matrix.grandTotalPoints, summary.overview.totalAllocatedPoints);

  // 5. 验证 CSV 导出格式正确无误
  const empCsv = exportAuditorEmployeesCsv(summary);
  assert.ok(empCsv.includes('全员排名'));
  assert.ok(empCsv.includes('员工姓名'));
  assert.ok(empCsv.includes('累计获得总绩点'));

  const prjCsv = exportAuditorProjectsCsv(summary);
  assert.ok(prjCsv.includes('合同总额(万元)'));
  assert.ok(prjCsv.includes('已分配额度(万元)'));
  assert.ok(prjCsv.includes('剩余额度(万元)'));

  const matrixCsv = exportAuditorMatrixCsv(summary);
  assert.ok(matrixCsv.includes('个人累加'));
  assert.ok(matrixCsv.includes('项目累加'));

  const detailsCsv = exportAuditorDetailsCsv(summary);
  assert.ok(detailsCsv.includes('考核月份'));
  assert.ok(detailsCsv.includes('获得绩点'));

  const fullBundleJson = exportAuditorFullBundleJson(summary);
  assert.ok(fullBundleJson.includes('auditor_summary_bundle'));
});

test('核算员从当前系统 State 一键全量汇总', () => {
  const state = demoState();
  const summary = summarizeCurrentStateForAuditor(state);

  assert.ok(summary.overview.packageCount > 0);
  assert.ok(summary.employeeSummaries.length > 0);
  assert.ok(summary.projectSummaries.length > 0);
  assert.ok(summary.matrix.rows.length > 0);
});

test('项目负责人管理多个项目：一键导出名下全部项目数据包集合 (ProjectManagerBundle) 与智能导入', () => {
  const state = demoState();
  const manager = {
    id: 'emp_pm_099',
    name: '周项目',
    department: '智能网联部',
    role: 'member',
    active: true,
  };
  state.employees.push(manager);

  // 模拟该项目负责人管理 2 个项目
  const p1 = {
    id: 'prj_m_01',
    code: 'M-01',
    name: '自主无人机机载飞控系统',
    client: '航天科工',
    contract: 150_000_000,
    owner: manager.id,
    start: '2026-01',
    end: '2026-12',
    status: 'active',
    members: [manager.id, state.employees[1].id],
  };
  const p2 = {
    id: 'prj_m_02',
    code: 'M-02',
    name: '多模态任务载荷软件研制',
    client: '中航工业',
    contract: 250_000_000,
    owner: manager.id,
    start: '2026-02',
    end: '2026-10',
    status: 'active',
    members: [manager.id, state.employees[2].id],
  };
  state.projects.push(p1, p2);

  // 添加月度分配
  state.plans.push({
    id: 'plan_m1',
    projectId: p1.id,
    month: '2026-03',
    budget: 800,
    status: 'published',
    note: '方案设计阶段',
    entries: [{ employeeId: manager.id, rate: 10000, workContent: '总体方案设计' }],
  });
  state.plans.push({
    id: 'plan_m2',
    projectId: p2.id,
    month: '2026-03',
    budget: 1200,
    status: 'published',
    note: '关键算法突破',
    entries: [{ employeeId: manager.id, rate: 6000, workContent: '核心算法研发' }, { employeeId: state.employees[2].id, rate: 4000, workContent: '仿真测试' }],
  });

  // 1. 项目负责人一键导出自己负责的所有数据包合包
  const bundle = exportProjectManagerBundle(state, manager.id, manager);
  assert.equal(bundle.format, 'hengji-pm-merit-bundle');
  assert.equal(bundle.managerId, manager.id);
  assert.equal(bundle.projectCount, 2);
  assert.equal(bundle.packages.length, 2);
  assert.ok(bundle.totalContractWan > 0);
  assert.ok(bundle.totalAllocatedPoints > 0);

  // 2. 导出 JSON 并使用 parseMeritPackageOrBundle 智能解包
  const bundleJson = exportProjectManagerBundleJson(state, manager.id, manager);
  const unpackedPkgs = parseMeritPackageOrBundle(bundleJson);
  assert.equal(unpackedPkgs.length, 2);
  assert.equal(unpackedPkgs[0].project.ownerName, manager.name);
  assert.equal(unpackedPkgs[1].project.ownerName, manager.name);

  // 3. 核算员将此合包与其他单包混合自动汇总
  const summary = summarizeAuditorPackages(unpackedPkgs, state.employees);
  assert.equal(summary.projectSummaries.length, 2);
  assert.ok(summary.employeeSummaries.some(e => e.id === manager.id));

  // 4. 测试全部门合同额度汇总
  const deptContracts = calculateDepartmentContracts(summary);
  assert.equal(deptContracts.totalProjects, 2);
  assert.equal(deptContracts.totalContractWan, bundle.totalContractWan);
  assert.ok(deptContracts.totalAllocatedWan > 0);
  assert.ok(deptContracts.totalRemainingWan > 0);
  assert.ok(deptContracts.overallAllocatedRateBps > 0);

  // 5. 测试荣誉之星评选（月度之星、季度之星、年度之星）
  const stars = calculateHonorStars(summary);
  assert.ok(stars.monthlyStars.length > 0);
  assert.ok(stars.quarterlyStars.length > 0);
  assert.ok(stars.annualStars.length > 0);
  // manager 绩效突出，应入选荣誉之星
  assert.ok(stars.monthlyStars.some(s => s.employeeId === manager.id));
  // 6. 测试系统管理员导出全系统全部项目数据包合包 (managerId === 'all')
  const adminActor = { id: 'admin', name: '管理员', role: 'admin', active: true };
  const allBundle = exportProjectManagerBundle(state, 'all', adminActor);
  assert.equal(allBundle.format, 'hengji-pm-merit-bundle');
  assert.equal(allBundle.managerId, 'all');
  assert.equal(allBundle.projectCount, state.projects.length);
  assert.equal(allBundle.packages.length, state.projects.length);
});

test('【核心Bug修复】基于工号/唯一ID合并跨项目不同数据包中的同一组员，同名不同工号严格隔离，导出报表全量以万元为单位', () => {
  // 模拟两个独立离线客户端生成的项目数据包：
  // 负责人A本地生成的员工记录 uuid_A1，姓名="张工"，工号="1008"
  // 负责人B本地生成的员工记录 uuid_B1，姓名="张工"，工号="1008" (不同离线库生成的不同UUID，但工号相同)
  // 另外，负责人B本地还有另一位重名员工 uuid_B2，姓名="张工"，工号="2009" (同名不同工号，绝对不能合并)
  const pkgA = {
    packageType: 'project_merit_package',
    version: '0.6.3',
    exportedAt: '2026-10-21T09:00:00Z',
    project: {
      id: 'prj_alpha',
      code: 'ALPHA-01',
      name: '智能雷达研发',
      contractWan: 100,
      periodAllocatedWan: 10,
      periodAllocatedPoints: 1000000,
      remainingWan: 90,
      ownerName: '赵总',
    },
    memberSummaries: [
      {
        employeeId: 'uuid_A1',
        employeeNo: '1008',
        name: '张工',
        department: '技术部',
        group: '雷达组',
        position: '高级工程师',
        totalPoints: 600000, // 0.6 万元
        totalWan: 0.6,
        ratioInProject: 60,
      },
    ],
    details: [
      {
        projectId: 'prj_alpha',
        projectCode: 'ALPHA-01',
        projectName: '智能雷达研发',
        month: '2026-03',
        employeeId: 'uuid_A1',
        employeeNo: '1008',
        employeeName: '张工',
        department: '技术部',
        group: '雷达组',
        position: '高级工程师',
        rate: 6000,
        points: 600000,
        wan: 0.6,
        workContent: '雷达天线仿真',
      },
    ],
  };

  const pkgB = {
    packageType: 'project_merit_package',
    version: '0.6.3',
    exportedAt: '2026-10-21T09:30:00Z',
    project: {
      id: 'prj_beta',
      code: 'BETA-02',
      name: '微波射频模组研发',
      contractWan: 80,
      periodAllocatedWan: 8,
      periodAllocatedPoints: 800000,
      remainingWan: 72,
      ownerName: '钱总',
    },
    memberSummaries: [
      {
        employeeId: 'uuid_B1',
        employeeNo: '1008', // 相同工号，不同本地UUID
        name: '张工',
        department: '技术部',
        group: '雷达组',
        position: '高级工程师',
        totalPoints: 500000, // 0.5 万元
        totalWan: 0.5,
        ratioInProject: 62.5,
      },
      {
        employeeId: 'uuid_B2',
        employeeNo: '2009', // 重名但工号不同
        name: '张工',
        department: '测试部',
        group: '微波组',
        position: '测试工程师',
        totalPoints: 300000, // 0.3 万元
        totalWan: 0.3,
        ratioInProject: 37.5,
      },
    ],
    details: [
      {
        projectId: 'prj_beta',
        projectCode: 'BETA-02',
        projectName: '微波射频模组研发',
        month: '2026-03',
        employeeId: 'uuid_B1',
        employeeNo: '1008',
        employeeName: '张工',
        department: '技术部',
        group: '雷达组',
        position: '高级工程师',
        rate: 5000,
        points: 500000,
        wan: 0.5,
        workContent: '射频匹配调试',
      },
      {
        projectId: 'prj_beta',
        projectCode: 'BETA-02',
        projectName: '微波射频模组研发',
        month: '2026-03',
        employeeId: 'uuid_B2',
        employeeNo: '2009',
        employeeName: '张工',
        department: '测试部',
        group: '微波组',
        position: '测试工程师',
        rate: 3000,
        points: 300000,
        wan: 0.3,
        workContent: '高低温性能测试',
      },
    ],
  };

  // 核算员端全局员工花名册
  const allEmployees = [
    { id: 'master_1008', employeeNo: '1008', name: '张工', department: '技术部', group: '雷达组', position: '高级工程师', role: 'member', active: true },
    { id: 'master_2009', employeeNo: '2009', name: '张工', department: '测试部', group: '微波组', position: '测试工程师', role: 'member', active: true },
  ];

  const summary = summarizeAuditorPackages([pkgA, pkgB], allEmployees);

  // 1. 验证合并结果：工号 1008 的张工跨两个项目正确合并，总人数必须为 2 人（而不是 3 条不同记录）
  assert.equal(summary.employeeSummaries.length, 2, '工号相同的张工必须合并，同名不同工号保持独立');

  const emp1008 = summary.employeeSummaries.find(e => e.employeeNo === '1008');
  assert.ok(emp1008, '必须存在工号1008的汇总记录');
  assert.equal(emp1008.name, '张工');
  assert.equal(emp1008.projectCount, 2, '工号1008参与了2个项目');
  assert.equal(emp1008.totalPoints, 1100000, '总绩点为 600,000 + 500,000 = 1,100,000');
  assert.equal(emp1008.totalWan, 1.1, '折合总万元为 1.1000 万元');

  const emp2009 = summary.employeeSummaries.find(e => e.employeeNo === '2009');
  assert.ok(emp2009, '必须存在工号2009的独立汇总记录');
  assert.equal(emp2009.name, '张工');
  assert.equal(emp2009.department, '测试部');
  assert.equal(emp2009.projectCount, 1);
  assert.equal(emp2009.totalPoints, 300000);
  assert.equal(emp2009.totalWan, 0.3);

  // 2. 验证透视矩阵：也必须按工号精确合并
  assert.equal(summary.matrix.rows.length, 2);
  const matrix1008 = summary.matrix.rows.find(r => r.employeeNo === '1008');
  assert.ok(matrix1008);
  assert.equal(matrix1008.rowTotalPoints, 1100000);

  // 3. 验证 CSV 导出以“万”为单位且含工号
  const empCsv = exportAuditorEmployeesCsv(summary);
  assert.ok(empCsv.includes('工号'), '全员汇总CSV必须包含工号列');
  assert.ok(empCsv.includes('累计获得总绩点(万元)'), '绩点必须明确标明为万元单位');
  assert.ok(empCsv.includes('1.1000'), '工号1008的累计绩点必须格式化为1.1000万');
  assert.ok(empCsv.includes('0.3000'), '工号2009的累计绩点必须格式化为0.3000万');

  const matrixCsv = exportAuditorMatrixCsv(summary);
  assert.ok(matrixCsv.includes('工号'), '矩阵CSV必须包含工号列');
  assert.ok(matrixCsv.includes('1.1000'), '矩阵个人累加必须为1.1000万');

  const detailsCsv = exportAuditorDetailsCsv(summary);
  assert.ok(detailsCsv.includes('工号'), '明细流水CSV必须包含工号列');
  assert.ok(detailsCsv.includes('0.6000'), '单笔明细获得绩点必须为0.6000万');
});

test('v0.7.0：核算员支持批量导入多个数据包、合包与总包，并支持持久化保存', () => {
  const state = demoState();
  const prjA = state.projects[0];
  const prjB = state.projects[1] || { ...prjA, id: 'prj_test_b', name: '测试工程B', code: 'TEST-B' };

  // 1. 导出两个单包
  const pkgA = exportProjectMeritPackage(state, prjA.id, { actor: state.employees[0] });
  const pkgB = {
    ...pkgA,
    packageId: 'pkg_test_b',
    project: { ...pkgA.project, id: prjB.id, name: prjB.name, code: prjB.code },
  };

  // 2. 模拟从字符串/文件导入
  const jsonA = JSON.stringify(pkgA);
  const jsonB = JSON.stringify(pkgB);

  const parsedA = parseMeritPackageOrBundle(jsonA);
  const parsedB = parseMeritPackageOrBundle(jsonB);
  assert.equal(parsedA.length, 1);
  assert.equal(parsedB.length, 1);

  // 模拟批量多选/拖拽合并
  const allImported = [...parsedA, ...parsedB];
  assert.equal(allImported.length, 2);

  // 3. 汇总与总包导出归档
  const summary = summarizeAuditorPackages(allImported, state.employees);
  const fullBundleJson = exportAuditorFullBundleJson(summary, allImported);
  assert.ok(fullBundleJson.includes('auditor_summary_bundle'));

  // 4. 从总包反向导入恢复所有独立包
  const restoredPkgs = parseMeritPackageOrBundle(fullBundleJson);
  assert.equal(restoredPkgs.length, 2);
  assert.equal(restoredPkgs[0].project.id, prjA.id);
  assert.equal(restoredPkgs[1].project.id, prjB.id);

  // 5. 验证 State 持久化字段
  const stateWithAuditor = {
    ...state,
    auditorPackages: allImported,
  };
  assert.equal(stateWithAuditor.auditorPackages?.length, 2);
});

test('全项目二维透视 matrix 兼容性与考核之星殿堂全员评选及姓名完整性', () => {
  const state = demoState();
  const prj = state.projects[0];
  const pkg = exportProjectMeritPackage(state, prj.id, 'emp_01');

  const summary = summarizeAuditorPackages([pkg], state.employees);
  // 验证图1报错修复：matrix.projectHeaders 与 matrix.projects 别名均可安全读取
  assert.ok(Array.isArray(summary.matrix.projectHeaders));
  assert.ok(Array.isArray(summary.matrix.projects));
  assert.equal(summary.matrix.projectHeaders.length, 1);
  assert.equal(summary.matrix.projects.length, 1);

  // 验证图2：全员汇总中每个员工姓名完整，不会出现 undefined 或空白
  for (const emp of summary.employeeSummaries) {
    assert.ok(emp.name, `员工姓名不能为空: ${emp.id}`);
    assert.notEqual(emp.name, 'undefined');
  }

  // 验证基于数据包中的月份评选月度之星、季度之星与年度之星
  const months = summary.overview.months;
  assert.ok(months.length > 0);
  const targetMonth = months[0];
  const targetYear = targetMonth.slice(0, 4);
  const targetQuarter = Math.ceil(parseInt(targetMonth.slice(5, 7), 10) / 3);

  // 模拟构建派生状态评选
  const derivedEmployees = summary.employeeSummaries.map(e => ({
    id: e.id,
    employeeNo: e.employeeNo,
    name: e.name,
    department: e.department,
    group: e.group,
    groupRole: e.groupRole || '组员',
    position: e.position,
    role: 'member',
    active: true,
  }));

  const derivedPlans = [{
    id: `plan_${prj.id}_${targetMonth}`,
    projectId: prj.id,
    month: targetMonth,
    budget: 10000,
    status: 'published',
    publishedAt: new Date().toISOString(),
    entries: summary.employeeSummaries.map(e => ({ employeeId: e.id, rate: 100 })),
    records: summary.employeeSummaries.map(e => ({
      id: `rec_${e.id}`,
      projectId: prj.id,
      employeeId: e.id,
      points: e.totalPoints,
      createdAt: new Date().toISOString(),
    })),
  }];

  const derivedState = {
    ...state,
    employees: derivedEmployees,
    plans: derivedPlans,
  };

  const stars = calculateStars(derivedState, {
    year: targetYear,
    quarter: targetQuarter,
    month: targetMonth,
  });

  // 验证月度之星评选出真实榜首且姓名非空
  assert.ok(stars.monthStar.stars.length > 0, '月度之星应成功评出');
  assert.ok(stars.monthStar.stars[0].employee.name, '月度之星姓名不能为空');
  assert.notEqual(stars.monthStar.stars[0].employee.name, 'undefined');
  assert.ok(stars.monthStar.topPoints > 0, '当月最高绩点应大于0');

  // 验证季度之星评出
  assert.ok(stars.quarterStar.stars.length > 0, '季度之星应成功评出');
  assert.ok(stars.quarterStar.stars[0].employee.name, '季度之星姓名不能为空');

  // 验证年度之星评出
  assert.ok(stars.yearStar.stars.length > 0, '年度之星应成功评出');
  assert.ok(stars.yearStar.stars[0].employee.name, '年度之星姓名不能为空');
  assert.ok(stars.yearStar.topPoints > 0, '年度最高绩点应大于0');
});




