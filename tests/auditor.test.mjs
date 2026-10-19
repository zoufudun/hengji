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

