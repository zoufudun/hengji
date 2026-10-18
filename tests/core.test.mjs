import test from 'node:test';
import assert from 'node:assert/strict';
import {
  allocate,
  calculateStars,
  demoState,
  execute,
  exportEmployeesCsv,
  exportProjectsCsv,
  getEmployeeTrendData,
  getMonthsBetween,
  getProjectTemplateCsv,
  getProjectTrendData,
  monthAmount,
  ownerSummary,
  parseCsv,
  parseEmployeeCsvText,
  parseProjectCsvText,
  projectAllocDetail,
  projectBudgetRate,
  rangeReport,
  report,
  validate,
  exportFullBackupJson,
  parseAndValidateBackupJson,
  getProjectMemberTemplateCsv,
  parseProjectMemberCsvText,
  getPlanMemberTemplateCsv,
  parsePlanMemberCsvText,
  getProjectGroupTemplateCsv,
  parseProjectGroupCsvText,
  parseProjectGroupsCsvText,
  getInitialProjectGroups,
  exportPeriodMatrixReportCsv,
  exportPeriodReportCsv,
  getProjectSpanMonths,
  generateProjectQuotaSchedule,
  getProjectQuotaPerspective,
  exportProjectQuotaScheduleCsv,
  parseProjectQuotaScheduleCsvText,
  exportEncryptedBackupJson,
  parseAndDecryptBackupJson,
  isEncryptedBackup,
  APP_VERSION,
  UPDATE_HISTORY,
  MAINTENANCE_QUOTA_RATE,
  BIDDING_MAX_RATE,
  BIDDING_DEFAULT_RATE,
  getQuotaPlanStageType,
  getMonthProjectsAllocPerspective,
} from '../lib/core.ts';

test('项目创建时只保存成员名单，不需要成员固定系数', () => {
  const base = { employees: [
    { id: 'admin', name: '管理员', department: '综合部', email: '', role: 'admin', active: true },
    { id: 'a', name: '甲', department: '项目部', email: '', role: 'member', active: true },
    { id: 'b', name: '乙', department: '技术部', email: '', role: 'member', active: true }
  ], projects: [], plans: [], audit: [] };
  const state = execute(base, 'admin', { type: 'project.save', data: { code: 'A', name: '项目A', client: '客户', contract: 120_000_000, owner: 'a', start: '2026-01', end: '2026-03', members: ['a','b'] } }, 'p1', '2026-01-01T00:00:00Z');
  assert.deepEqual(state.projects[0].members, ['a','b']);
  assert.equal('coefficient' in state.projects[0], false);
});

test('120 万三个月额度精确覆盖合同总额', () => {
  const state = demoState(); const project = state.projects[0];
  assert.equal(projectBudgetRate(state, project.id), 10000);
  assert.equal(state.plans.reduce((sum, plan) => sum + monthAmount(project, plan), 0), project.contract);
  assert.equal(state.plans[0].entries.reduce((sum, row) => sum + row.rate, 0), 10000);
  validate(state);
});

test('最大余数补差使成员绩点之和精确等于当月额度', () => {
  const rows = allocate(100, [{ employeeId: 'a', rate: 3333 }, { employeeId: 'b', rate: 3333 }, { employeeId: 'c', rate: 3334 }]);
  assert.equal(rows.reduce((sum, row) => sum + row.points, 0), 100);
});

test('月度成员比例必须等于 100%', () => {
  const state = demoState(); state.plans[0].entries[0].rate = 3999;
  assert.throws(() => validate(state), /必须等于 100%/);
});

test('项目各月额度不能超过 100%', () => {
  const state = demoState(); state.plans[2].budget = 3335;
  assert.throws(() => validate(state), /不能超过 100%/);
});

test('负责人最终占比遵循合同区间', () => {
  const state = demoState(); const project = state.projects[0];
  const summary = ownerSummary(state, project);
  assert.equal(summary.valid, true);
  assert.ok(summary.rate >= 3000 && summary.rate <= 6000);
});

test('负责人绩点分配率为参考区间，允许超出或低于参考区间而不拦截保存', () => {
  const state = demoState(); const project = state.projects[0];
  // 将首个分配方案的负责人比例调整至 90%（中型项目参考区间为 30%~60%），其余成员分摊 10%
  const ownerEntry = state.plans[0].entries.find(e => e.employeeId === project.owner);
  const otherEntries = state.plans[0].entries.filter(e => e.employeeId !== project.owner);
  if (ownerEntry && otherEntries.length > 0) {
    ownerEntry.rate = 9000;
    otherEntries[0].rate = 1000;
    for (let i = 1; i < otherEntries.length; i++) otherEntries[i].rate = 0;
    const summary = ownerSummary(state, project);
    assert.equal(summary.valid, false); // 超出建议区间 (90% > 60%)
    assert.doesNotThrow(() => validate(state)); // 不再作强制拦截
  }
});

test('月度汇总只计算已发布记录', () => {
  const state = demoState();
  assert.ok(report(state, '2026-01').find(row => row.employee.id === 'jia').points > 0);
  assert.equal(report(state, '2026-03').reduce((sum, row) => sum + row.points, 0), 0);
});

test('专业组支持总体组、产品组、研发组与初始部门成员', () => {
  const state = demoState();
  const next = execute(state, 'admin', { type: 'employee.initDefaults', data: {} }, 'init1', '2026-01-01T00:00:00Z');
  const groups = new Set(next.employees.map(e => e.group));
  assert.ok(groups.has('总体组'));
  assert.ok(groups.has('产品组'));
  assert.ok(groups.has('研发组'));
});

test('员工增删与关联项目安全保护', () => {
  let state = demoState();
  // 无法删除在项目中的成员
  assert.throws(() => execute(state, 'admin', { type: 'employee.delete', data: { id: 'jia' } }, 'd1', '2026-01-01T00:00:00Z'), /仍.*项目/);
  // 新增一个独立员工
  state = execute(state, 'admin', { type: 'employee.save', data: { name: '赵测试', department: '测试部', group: '研发组' } }, 'e_test', '2026-01-01T00:00:00Z');
  const created = state.employees.find(e => e.name === '赵测试');
  assert.ok(created);
  assert.equal(created.group, '研发组');
  // 能够正常删除无关联项目的员工
  state = execute(state, 'admin', { type: 'employee.delete', data: { id: created.id } }, 'd2', '2026-01-01T00:00:00Z');
  assert.equal(state.employees.some(e => e.name === '赵测试'), false);
});

test('项目实时已分配额度与明细、剩余额度和比例计算准确', () => {
  const state = demoState();
  const detail = projectAllocDetail(state, 'project-a');
  assert.ok(detail);
  assert.equal(detail.contract, 120_000_000);
  assert.equal(detail.totalBudgetRate, 10000); // 3333 + 3333 + 3334
  assert.equal(detail.publishedBudgetRate, 6666);
  assert.equal(detail.draftBudgetRate, 3334);
  assert.equal(detail.remainingRate, 0);
  assert.equal(detail.monthlyBreakdown.length, 3);
  assert.equal(detail.memberCumulative.length, 3);
});

test('区间报表支持自定义月份区间、季度及专业组筛选', () => {
  const state = demoState();
  const months = getMonthsBetween('2026-01', '2026-02');
  assert.deepEqual(months, ['2026-01', '2026-02']);
  const rep = rangeReport(state, { months });
  assert.ok(rep.length > 0);
  assert.ok(rep[0].points > 0);
  // 筛选研发组
  const devRep = rangeReport(state, { months, group: '研发组' });
  assert.equal(devRep.every(r => r.employee.group === '研发组'), true);
});

test('月度之星、季度之星与年度之星评定正确', () => {
  const state = demoState();
  const stars = calculateStars(state, { year: '2026', quarter: 1, month: '2026-01' });
  assert.ok(stars.monthStar.stars.length > 0);
  assert.equal(stars.monthStar.stars[0].employee.name, '甲'); // 2026-01中甲的绩点最高
  assert.ok(stars.quarterStar.stars.length > 0);
  assert.equal(stars.quarterStar.stars[0].employee.name, '甲');
  assert.ok(stars.yearStar.stars.length > 0);
});

test('CSV解析与导出功能完整性及工作令号', () => {
  const state = demoState();
  const prjCsv = exportProjectsCsv(state);
  assert.ok(prjCsv.includes('工作令号'));
  assert.ok(prjCsv.includes('PRJ-2026-001') || prjCsv.includes('A-2026-001'));
  const empCsv = exportEmployeesCsv(state);
  assert.ok(empCsv.includes('专业组'));
  const parsed = parseCsv('a,b,"c,d"\n1,2,"hello ""world"""');
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0][2], 'c,d');
  assert.equal(parsed[1][2], 'hello "world"');
});

test('周期绩点报表导出CSV按二维矩阵格式导出：第一行为各个项目合同名称加工作令号，含序号、姓名与个人累加', () => {
  const state = demoState();
  const months = ['2026-01', '2026-02', '2026-03'];
  const rows = rangeReport(state, { months });
  const csv = exportPeriodMatrixReportCsv(state.projects, rows, '2026年Q1');
  const parsed = parseCsv(csv);

  // 表头行 (第一行)
  const header = parsed[0];
  assert.equal(header[0], '序号');
  assert.equal(header[1], '姓名');
  assert.equal(header[header.length - 1], '个人累加');

  // 第一行包含各个项目合同名称与工作令号
  assert.equal(header.length, 2 + state.projects.length + 1);
  for (let i = 0; i < state.projects.length; i++) {
    const p = state.projects[i];
    const colHeader = header[2 + i];
    if (p.code && !p.name.includes(p.code)) {
      assert.ok(colHeader.includes(p.name) && colHeader.includes(p.code));
    } else {
      assert.ok(colHeader.includes(p.name));
    }
  }

  // 数据行
  assert.equal(parsed.length, rows.length + 1);
  for (let r = 0; r < rows.length; r++) {
    const row = parsed[r + 1];
    assert.equal(row[0], String(r + 1));
    assert.equal(row[1], rows[r].employee.name);
    assert.equal(row[row.length - 1], (rows[r].points / 100).toFixed(2));
  }

  // exportPeriodReportCsv 传入 state 兼容支持矩阵导出
  const csvFromOptions = exportPeriodReportCsv(rows, '2026年Q1', { state });
  assert.equal(csvFromOptions, csv);
});

test('支持新建项目：工作令号、客户名称选填、结束日期可以不确定', () => {
  const base = {
    employees: [
      { id: 'admin', name: '管理员', department: '综合部', email: '', role: 'admin', active: true },
      { id: 'a', name: '甲', department: '项目部', email: '', role: 'member', active: true }
    ],
    projects: [],
    plans: [],
    audit: []
  };

  // 客户名称为空，结束日期为空（不确定）
  const state = execute(base, 'admin', {
    type: 'project.save',
    data: {
      code: 'WO-2026-888',
      name: '某前沿技术研发攻坚',
      client: '',
      contract: 100_000_000,
      owner: 'a',
      start: '2026-02',
      end: '',
      members: ['a']
    }
  }, 'p_new', '2026-01-01T00:00:00Z');

  assert.equal(state.projects[0].code, 'WO-2026-888');
  assert.equal(state.projects[0].client, '');
  assert.equal(state.projects[0].end, '');
  validate(state);
});

test('支持按6列标准格式导入项目CSV（含项目名陈、工作令号、结束日期待定）', () => {
  const state = demoState();
  const csvContent = `项目名陈,工作令号,合同金额,项目负责人,开始日期,结束日期
无人机集群协同系统,WO-2026-901,150,张总体,2026-01-15,待定
雷达信号智能处理,WO-2026-902,80.5,李产品,2026-02,2026-08`;

  const parsed = parseProjectCsvText(csvContent, state);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].name, '无人机集群协同系统');
  assert.equal(parsed[0].code, 'WO-2026-901');
  assert.equal(parsed[0].contract, 150_000_000);
  assert.equal(parsed[0].start, '2026-01');
  assert.equal(parsed[0].end, ''); // 待定 -> ''

  assert.equal(parsed[1].name, '雷达信号智能处理');
  assert.equal(parsed[1].code, 'WO-2026-902');
  assert.equal(parsed[1].contract, 80_500_000);
  assert.equal(parsed[1].start, '2026-02');
  assert.equal(parsed[1].end, '2026-08');

  // 批量导入
  const nextState = execute(state, 'admin', {
    type: 'project.importBatch',
    data: { projects: parsed }
  }, 'batch1', '2026-01-01T00:00:00Z');

  assert.ok(nextState.projects.some(p => p.code === 'WO-2026-901' && p.end === ''));
  assert.ok(nextState.projects.some(p => p.code === 'WO-2026-902' && p.end === '2026-08'));
  validate(nextState);
});

test('趋势图数据生成符合周期，支持不确定结束日期的动态时间轴与员工获得额度趋势', () => {
  const state = demoState();
  const trends = getProjectTrendData(state, 'project-a');
  assert.equal(trends.length, 3);
  assert.equal(trends[0].month, '2026-01');
  assert.equal(trends[2].cumulativeRate, 100);

  // 测试结束日期为空的项目也能正常生成趋势图
  state.projects[0].end = '';
  const ongoingTrends = getProjectTrendData(state, 'project-a');
  assert.ok(ongoingTrends.length >= 3);
  assert.equal(ongoingTrends[0].month, '2026-01');

  // 员工获得额度趋势图
  const empTrends = getEmployeeTrendData(state, 'jia', ['2026-01', '2026-02', '2026-03']);
  assert.equal(empTrends.length, 3);
  assert.ok(empTrends[0].points > 0);
  assert.ok(empTrends[0].contributions.length > 0);
});

test('严格支持工作令格式项目导入（同工作令号多子项目、2026.9开始日期、不确定结束日期、无负责人列自动兜底）', () => {
  const state = demoState();
  const img1Csv = `序号	项目名称	合同金额	工作令号	开始日期	结束日期
1	E1 S部	130.90	22-0128	2026.9	不确定
2	E1 W部	130.90	22-0128	2026.9	不确定
3	EA1 LDC	316.82	23-0181	2026.9	不确定
4	EA1 S部	137.59	23-0181	2026.9	不确定
5	EA1 W部	137.59	23-0181	2026.9	不确定
6	EA2 LDC	316.82	23-0181	2026.9	不确定
27	F1调试	35.553	26-0413	2026.9	不确定
28	F2调试	35.553	26-0413	2026.9	不确定`;

  // parseProjectCsvText 自动处理制表符或逗号
  const commaCsv = img1Csv.split('\n').map(line => line.split('\t').join(',')).join('\n');
  const parsed = parseProjectCsvText(commaCsv, state);
  assert.equal(parsed.length, 8);

  assert.equal(parsed[0].name, 'E1 S部');
  assert.equal(parsed[0].code, '22-0128');
  assert.equal(parsed[0].contract, 130_900_000);
  assert.equal(parsed[0].start, '2026-09');
  assert.equal(parsed[0].end, '');

  assert.equal(parsed[1].name, 'E1 W部');
  assert.equal(parsed[1].code, '22-0128');

  assert.equal(parsed[6].name, 'F1调试');
  assert.equal(parsed[6].contract, 35_553_000); // 35.553 万元

  // 执行批量导入到 state
  const nextState = execute(state, 'admin', {
    type: 'project.importBatch',
    data: { projects: parsed }
  }, 'batch_img1', '2026-01-01T00:00:00Z');

  // 验证相同令号 22-0128 下两个子项目均独立存在
  const e1s = nextState.projects.find(p => p.name === 'E1 S部');
  const e1w = nextState.projects.find(p => p.name === 'E1 W部');
  assert.ok(e1s);
  assert.ok(e1w);
  assert.equal(e1s.code, '22-0128');
  assert.equal(e1w.code, '22-0128');
  assert.notEqual(e1s.id, e1w.id);

  // 验证合规性检验通过
  validate(nextState);
});

test('严格支持部门员工编制花名册导入（职务、专业组、专业组职务、多专业组与智能部门推断）', () => {
  const state = demoState();
  const img2Csv = `序号,姓名,职务,专业组,专业组职务
1,周胜增,副所长,主任,,
2,胡兴刚,副主任,,
4,吕赟,主任助理,总体组,组长
5,陈韬,副总工程师,研发组,顾问
6,杜晓啸,研究员,总体组,顾问
10,赵淼,高级工程师,产品组,组员
15,刘盟,工程师,"产品组,研发组",副组长
17,孙骞,高级工程师,产品组,组长
22,孙波,工程师,"产品组,总体组",组员
29,邹富墩,高级工程师,研发组,组长`;

  const parsed = parseEmployeeCsvText(img2Csv);
  assert.equal(parsed.length, 10);

  // 验证首长推断为管理层及管理员
  const zhou = parsed.find(e => e.name === '周胜增');
  assert.ok(zhou);
  assert.equal(zhou.position, '副所长,主任');
  assert.equal(zhou.role, 'admin');
  assert.equal(zhou.department, '领导班子');

  // 验证跨组人员与职务
  const liu = parsed.find(e => e.name === '刘盟');
  assert.ok(liu);
  assert.equal(liu.position, '工程师');
  assert.equal(liu.group, '产品组,研发组');
  assert.equal(liu.groupRole, '副组长');
  assert.equal(liu.department, '产品研发部');

  // 批量导入员工库
  const nextState = execute(state, 'admin', {
    type: 'employee.importBatch',
    data: { employees: parsed }
  }, 'batch_img2', '2026-01-01T00:00:00Z');

  const empZhou = nextState.employees.find(e => e.name === '周胜增');
  assert.ok(empZhou);
  assert.equal(empZhou.position, '副所长,主任');

  const empLiu = nextState.employees.find(e => e.name === '刘盟');
  assert.ok(empLiu);
  assert.equal(empLiu.groupRole, '副组长');

  validate(nextState);
});

test('项目管理增加删除功能与批量删除，并联动清理相关计划', () => {
  const state = demoState();
  assert.equal(state.projects.length, 1);
  assert.equal(state.plans.length, 3);

  // 删除项目A
  const nextState = execute(state, 'admin', {
    type: 'project.delete',
    data: { id: 'project-a' }
  }, 'del-1', '2026-01-01T00:00:00Z');

  assert.equal(nextState.projects.length, 0);
  assert.equal(nextState.plans.length, 0);
  validate(nextState);

  // 测试批量删除
  const state2 = demoState();
  const nextState2 = execute(state2, 'admin', {
    type: 'project.deleteBatch',
    data: { ids: ['project-a'] }
  }, 'del-batch', '2026-01-01T00:00:00Z');
  assert.equal(nextState2.projects.length, 0);
  assert.equal(nextState2.plans.length, 0);
  validate(nextState2);
});

test('全量数据JSON备份与恢复功能测试', () => {
  const state = demoState();
  const backupJson = exportFullBackupJson(state);
  assert.ok(backupJson.includes('"version": "1.1.0"'));
  assert.ok(backupJson.includes('projectCount'));

  const restored = parseAndValidateBackupJson(backupJson);
  assert.equal(restored.state.projects.length, state.projects.length);
  assert.equal(restored.state.employees.length, state.employees.length);
  assert.equal(restored.state.plans.length, state.plans.length);
  assert.equal(restored.summary.projectCount, 1);
});

test('全量系统灾备快照完整包含项目组配置、系统配置与工作区名称', () => {
  const state = demoState();
  const mockGroups = [
    {
      id: 'grp_01',
      name: '总体论证组',
      type: '项目组',
      leaderId: 'emp_01',
      memberIds: ['emp_01', 'emp_02'],
      defaultRates: { emp_01: 6000, emp_02: 4000 },
      description: '负责总体方案架构设计'
    }
  ];

  const fullBackup = exportFullBackupJson(state, {
    projectGroups: mockGroups,
    workspaceName: '衡绩专用加密工作区',
    configs: { theme: 'forest', backupSchedule: 'monthly' }
  });

  assert.ok(fullBackup.includes('总体论证组'));
  assert.ok(fullBackup.includes('衡绩专用加密工作区'));
  assert.ok(fullBackup.includes('"projectGroupCount": 1'));

  const restored = parseAndValidateBackupJson(fullBackup);
  assert.equal(restored.projectGroups.length, 1);
  assert.equal(restored.projectGroups[0].name, '总体论证组');
  assert.equal(restored.projectGroups[0].defaultRates.emp_01, 6000);
  assert.equal(restored.workspaceName, '衡绩专用加密工作区');
  assert.equal(restored.configs.theme, 'forest');
});

test('源代码中不再内置硬编码员工姓名，员工通过导入或手动添加，并可加入项目组', () => {
  const state = demoState();

  // 验证初始状态中没有硬编码的真实员工名单，只有系统管理员
  assert.equal(state.employees.filter(e => e.role === 'admin').length, 1);
  assert.equal(state.employees.find(e => e.id === 'admin').name, '管理员');

  // 手动添加员工
  const afterAdd = execute(state, 'admin', {
    type: 'employee.save',
    data: {
      name: '陈工程师',
      department: '第四研究室',
      group: '研发组',
      groupRole: '顾问',
      position: '副总工程师',
    }
  }, 'add-emp', '2026-01-01T00:00:00Z');

  const chen = afterAdd.employees.find(e => e.name === '陈工程师');
  assert.ok(chen);
  assert.equal(chen.group, '研发组');
  assert.equal(chen.groupRole, '顾问');

  // 验证新添加的员工能够顺利作为项目负责人和成员加入新项目
  const withChenProject = execute(afterAdd, 'admin', {
    type: 'project.save',
    data: {
      code: 'TEST-CHEN-01',
      name: '陈工负责与参与项目',
      contract: 100_000_000,
      owner: chen.id,
      start: '2026-01',
      end: '2026-06',
      members: [chen.id],
    }
  }, 'p-chen', '2026-01-01T00:00:00Z');

  const prj = withChenProject.projects.find(p => p.code === 'TEST-CHEN-01');
  assert.ok(prj);
  assert.ok(prj.members.includes(chen.id));
  assert.equal(prj.owner, chen.id);
  validate(withChenProject);
});

test('系统管理员权限可按成员自由配置与切换', () => {
  const state = demoState();
  // 将普通成员甲提升为管理员
  const state1 = execute(state, 'admin', {
    type: 'employee.save',
    data: { id: 'jia', name: '甲', department: '总体部', group: '总体组', role: 'admin', active: true }
  }, 'save-admin', '2026-01-01T00:00:00Z');

  const jia = state1.employees.find(e => e.id === 'jia');
  assert.equal(jia.role, 'admin');

  // 甲获得管理员权限后，可以以管理员身份操作
  const state2 = execute(state1, 'jia', {
    type: 'project.save',
    data: {
      code: 'JIA-PRJ-01',
      name: '甲创建的项目',
      contract: 50_000_000,
      owner: 'jia',
      start: '2026-01',
      end: '2026-05',
      members: ['jia']
    }
  }, 'p-jia', '2026-01-01T00:00:00Z');
  assert.ok(state2.projects.some(p => p.code === 'JIA-PRJ-01'));

  // 将甲降级为普通成员
  const state3 = execute(state2, 'admin', {
    type: 'employee.save',
    data: { id: 'jia', name: '甲', department: '总体部', group: '总体组', role: 'member', active: true }
  }, 'save-member', '2026-01-01T00:00:00Z');
  assert.equal(state3.employees.find(e => e.id === 'jia').role, 'member');
});

test('历史项目支持配置已完成额度与剩余额度，后续月度方案严格限制只能使用剩余额度', () => {
  const state = demoState();
  // 新建一个合同额 100 万元，历史已完成 40 万元的项目（剩余 60 万元，即 60%）
  const nextState = execute(state, 'admin', {
    type: 'project.save',
    data: {
      code: 'HIST-001',
      name: '历史延续试验项目',
      contract: 100_000_000, // 100万元
      historyCompletedAmount: 40_000_000, // 40万元已完成
      owner: 'jia',
      start: '2026-01',
      end: '2026-06',
      members: ['jia', 'yi']
    }
  }, 'p-hist', '2026-01-01T00:00:00Z');

  const prj = nextState.projects.find(p => p.code === 'HIST-001');
  assert.ok(prj);
  assert.equal(prj.historyCompletedAmount, 40_000_000);
  assert.equal(prj.historyCompletedRate, 4000); // 40%

  // 验证额度计算明细：可分配额度上限为 60 万元（60%）
  const detail = projectAllocDetail(nextState, prj.id);
  assert.equal(detail.isHistorical, true);
  assert.equal(detail.historyCompletedAmountWan, '40');
  assert.equal(detail.historyCompletedPct, '40%');
  assert.equal(detail.remainingWan, '60');
  assert.equal(detail.remainingPct, '60%');

  // 配置一个合规的当月分配：占用 50%（不超过 60% 剩余额度）
  const validPlanState = execute(nextState, 'admin', {
    type: 'plan.save',
    data: {
      projectId: prj.id,
      month: '2026-02',
      budget: 5000, // 50%
      entries: [{ employeeId: 'jia', rate: 5000 }, { employeeId: 'yi', rate: 5000 }],
      note: '历史项目后续第一阶段分配'
    }
  }, 'plan-hist-1', '2026-01-01T00:00:00Z');
  validate(validPlanState);

  // 尝试超额配置：试图再分配 20%（累计 70%，超过历史剩余 60% 上限），系统必须严格抛错拦截
  assert.throws(() => {
    execute(validPlanState, 'admin', {
      type: 'plan.save',
      data: {
        projectId: prj.id,
        month: '2026-03',
        budget: 2000, // 20% + 50% = 70% > 60%
        entries: [{ employeeId: 'jia', rate: 5000 }, { employeeId: 'yi', rate: 5000 }],
        note: '超额计划'
      }
    }, 'plan-hist-2', '2026-01-01T00:00:00Z');
  }, /不能超过历史剩余额度/);
});

test('项目组成员可通过 CSV 文本批量导入并匹配部门现有员工，自动创建新成员', () => {
  const state = demoState();
  const template = getProjectMemberTemplateCsv();
  assert.ok(template.includes('员工姓名'));
  assert.ok(template.includes('专业组'));

  const csvContent = `员工姓名,专业组,备注
甲,总体组,骨干成员
乙,总体组,骨干成员
测试新员工,产品组,新加入同事`;

  const parsed = parseProjectMemberCsvText(csvContent, state.employees);
  assert.equal(parsed.memberIds.length, 3);
  assert.equal(parsed.newEmployees.length, 1);
  assert.equal(parsed.newEmployees[0].name, '测试新员工');
  assert.equal(parsed.newEmployees[0].group, '产品组');

  // 甲与乙为已有员工，直接匹配其已有的 ID
  const jia = state.employees.find(e => e.name === '甲');
  const yi = state.employees.find(e => e.name === '乙');
  assert.ok(parsed.memberIds.includes(jia.id));
  assert.ok(parsed.memberIds.includes(yi.id));
  assert.ok(parsed.memberIds.includes(parsed.newEmployees[0].id));
});

test('修改已有月度分配或后续分配支持中途增加成员或成员退出，且已存在方案的项目支持更新成员名单', () => {
  const state = demoState();
  // 找一个已有方案的项目 project-a
  const project = state.projects[0];
  const oldMembersCount = project.members.length;

  // 1. 允许修改已有月度方案的项目成员名单（中途增加或调整成员）
  const newMemberId = 'emp_chen_mid';
  const stateWithNewEmp = {
    ...state,
    employees: [
      ...state.employees,
      { id: newMemberId, name: '中途加入员工', department: '研发部', group: '研发组', email: '', role: 'member', active: true }
    ]
  };

  const updatedProjectState = execute(stateWithNewEmp, 'admin', {
    type: 'project.save',
    data: {
      ...project,
      members: [...project.members, newMemberId]
    }
  }, 'update-proj-members', '2026-01-01T00:00:00Z');

  const updatedPrj = updatedProjectState.projects.find(p => p.id === project.id);
  assert.equal(updatedPrj.members.length, oldMembersCount + 1);
  assert.ok(updatedPrj.members.includes(newMemberId));

  // 2. 修改已有月度分配 a-03：成员 bing 本月中途退出，新成员 newMemberId 中途加入
  // 只要当月 entries 的比例合计为 10000 (100%)，即便成员与项目总成员不完全一致，也能正常保存和校验
  const midPlanState = execute(updatedProjectState, 'admin', {
    type: 'plan.save',
    data: {
      id: 'a-03',
      projectId: project.id,
      month: '2026-03',
      budget: 3334,
      entries: [
        // 成员 bing 退出，新成员加入，负责人比例调整
        { employeeId: 'jia', rate: 4000 },
        { employeeId: 'yi', rate: 2000 },
        { employeeId: newMemberId, rate: 4000 }
      ],
      note: '3月份中途调整成员分配：新增研发人员，部分成员当月退出'
    }
  }, 'plan-mid-members', '2026-01-01T00:00:00Z');

  validate(midPlanState);
  const plan = midPlanState.plans.find(p => p.id === 'a-03');
  assert.ok(plan);
  assert.equal(plan.entries.length, 3);
  assert.equal(plan.entries.some(e => e.employeeId === newMemberId), true);
  assert.equal(plan.entries.some(e => e.employeeId === 'bing'), false); // bing 成功退出
});

test('月度分配与常用项目组模版CSV导入解析及成员工作内容描述测试', () => {
  const state = demoState();

  // 1. 月度分配模板与解析
  const planCsv = `员工姓名,当月分配比例(%),当月工作内容描述
甲,40.00,负责项目整体架构与主控模块编码
乙,35.00,负责数据接口协议与联调测试
丙,25.00,负责前端界面交互设计与评审`;

  const parsedPlan = parsePlanMemberCsvText(planCsv, state);
  assert.equal(parsedPlan.entries.length, 3);
  assert.equal(parsedPlan.entries[0].rate, 4000);
  assert.equal(parsedPlan.entries[0].workContent, '负责项目整体架构与主控模块编码');
  assert.equal(parsedPlan.entries[1].rate, 3500);
  assert.equal(parsedPlan.entries[1].workContent, '负责数据接口协议与联调测试');
  assert.equal(parsedPlan.entries[2].rate, 2500);
  assert.equal(parsedPlan.entries[2].workContent, '负责前端界面交互设计与评审');

  // 创建一个测试项目
  const baseState = execute(state, 'admin', {
    type: 'project.save',
    data: {
      code: 'WC-001',
      name: '工作内容测试项目',
      client: '测试客户',
      contract: 100_000_000,
      owner: 'jia',
      start: '2026-04',
      end: '2026-06',
      members: ['jia', 'yi', 'bing']
    }
  }, 'p-wc-test', '2026-01-01T00:00:00Z');

  // 保存带 workContent 的计划
  const planState = execute(baseState, 'admin', {
    type: 'plan.save',
    data: {
      id: 'plan-wc-test',
      projectId: 'p-wc-test',
      month: '2026-04',
      budget: 1000,
      entries: parsedPlan.entries,
      note: '包含成员工作内容描述的分配'
    }
  }, 'plan-wc-test', '2026-01-01T00:00:00Z');

  const savedPlan = planState.plans.find(p => p.id === 'plan-wc-test');
  assert.ok(savedPlan);
  assert.equal(savedPlan.entries[0].workContent, '负责项目整体架构与主控模块编码');

  // allocate 保持 workContent
  const allocated = allocate(100000, savedPlan.entries);
  assert.equal(allocated[0].workContent, '负责项目整体架构与主控模块编码');

  // projectAllocDetail 按比例从小到大排列 (升序)
  const detail = projectAllocDetail(planState, 'p-wc-test');
  const april = detail.monthlyBreakdown.find(m => m.month === '2026-04');
  assert.ok(april);
  // 丙 (25%) < 乙 (35%) < 甲 (40%)
  assert.equal(april.members[0].name, '丙');
  assert.equal(april.members[0].rate, 2500);
  assert.equal(april.members[1].name, '乙');
  assert.equal(april.members[1].rate, 3500);
  assert.equal(april.members[2].name, '甲');
  assert.equal(april.members[2].rate, 4000);

  // 2. 常用项目组模版 CSV 导入解析
  const groupCsv = `员工姓名,月度默认分配比例(%),当月工作内容,专业组,职务,部门,备注
周胜增,40.00,总体架构与评审,总体组,副所长,领导班子,负责人
刘盟,30.00,总体设计与论证,总体组,主任设计师,第四研究室,
邹富墩,30.00,研发攻关与联调,研发组,设计师,第四研究室,`;

  const parsedGroup = parseProjectGroupCsvText(groupCsv, state);
  assert.equal(parsedGroup.memberIds.length, 3);
  assert.equal(parsedGroup.defaultRates[parsedGroup.memberIds[0]], 4000);
  assert.equal(parsedGroup.memberEntries.length, 3);
  assert.equal(parsedGroup.memberEntries[0].workContent, '总体架构与评审');
});

test('项目组管理源码中无硬编码默认模版，且支持一键批量为每个项目组设置项目成员和默认分配比例', () => {
  // 1. 验证 getInitialProjectGroups() 源码彻底无硬编码默认模版，初始化完全为空数组
  const initialGroups = getInitialProjectGroups();
  assert.deepEqual(initialGroups, []);

  // 2. 验证 project.batchConfigureTeam 一键批量设置项目成员与默认分配比例
  const state = demoState();
  state.projects.push({
    id: 'project-b',
    code: 'B-2026-002',
    name: '项目B',
    client: '测试客户B',
    contract: 80_000_000,
    owner: 'yi',
    start: '2026-02',
    end: '2026-06',
    status: 'active',
    members: ['yi', 'bing']
  });
  const p1Id = state.projects[0].id;
  const p2Id = state.projects[1].id;

  const targetMembers = ['jia', 'yi', 'bing'];
  const defaultRates = { jia: 5000, yi: 3000, bing: 2000 };

  const nextState = execute(state, 'admin', {
    type: 'project.batchConfigureTeam',
    data: {
      projectIds: [p1Id, p2Id],
      members: targetMembers,
      defaultRates,
      owner: 'jia',
    }
  }, 'batch-team-test', '2026-01-01T00:00:00Z');

  const p1 = nextState.projects.find(p => p.id === p1Id);
  const p2 = nextState.projects.find(p => p.id === p2Id);

  assert.ok(p1 && p2);
  assert.deepEqual(p1.members, targetMembers);
  assert.deepEqual(p2.members, targetMembers);
  assert.equal(p1.owner, 'jia');
  assert.equal(p2.owner, 'jia');
  assert.deepEqual(p1.defaultRates, defaultRates);
  assert.deepEqual(p2.defaultRates, defaultRates);

  // 验证状态校验通过
  validate(nextState);
});

test('项目组支持完整多团队花名册CSV批量导入与恢复（图3批量导出恢复测试）', () => {
  const state = demoState();

  // 模拟图3中导出的项目组花名册CSV文本（10个项目组，含组长、组员顿号分隔列表、默认分配比例、职责等）
  const multiGroupCsv = `项目组名称,组类别,组长姓名,组员列表,组员人数,默认分配比例,职责与工作内容,创建时间
火灾报警控制系统项目组,项目组,邹富墩,"刘盟、邹富墩、杨健、蔡欣欣、毕清博",5,"刘盟:10.0%; 邹富墩:30.0%; 杨健:20.0%; 蔡欣欣:20.0%; 毕清博:20.0%",火灾报警控制系统研发,2026-10-18
E1 S部 月度项目组,项目组,邹富墩,"邹富墩、杨健、蔡欣欣",3,"邹富墩:35.0%; 杨健:35.0%; 蔡欣欣:30.0%",S部项目组,2026-10-18
EA2 S部 月度项目组,项目组,邹富墩,"邹富墩、蔡欣欣",2,"邹富墩:30.0%; 蔡欣欣:70.0%",EA2研发,2026-10-18
EA1 LDC 月度项目组,项目组,邹富墩,"邹富墩、毕清博",2,"邹富墩:35.0%; 毕清博:65.0%",LDC研发,2026-10-18
F1 LDC 月度项目组,项目组,邹富墩,"邹富墩、杨春迪",2,"邹富墩:35.0%; 杨春迪:65.0%",F1研发,2026-10-18
F1 S部 月度项目组,项目组,邹富墩,"邹富墩、杨春迪",2,"邹富墩:35.0%; 杨春迪:65.0%",F1 S部研发,2026-10-18
F1调试 月度项目组,项目组,邹富墩,"邹富墩、张磊",2,"邹富墩:60.0%; 张磊:40.0%",调试组,2026-10-18
EA1 S部 月度项目组,项目组,邹富墩,"邹富墩、杨健",2,"邹富墩:35.0%; 杨健:65.0%",EA1 S部,2026-10-18
EA5 LDC 月度项目组,项目组,邹富墩,"邹富墩、毕清博",2,"邹富墩:35.0%; 毕清博:65.0%",EA5 LDC,2026-10-18
EA5 S部 月度项目组,项目组,邹富墩,"邹富墩、杨健",2,"邹富墩:35.0%; 杨健:65.0%",EA5 S部,2026-10-18`;

  const { groups, newEmployees } = parseProjectGroupsCsvText(multiGroupCsv, state, '项目组与团队花名册-2026-10');

  // 1. 验证导入后有10个项目组，而不是只有1个
  assert.equal(groups.length, 10);

  // 2. 验证各个项目组的名字完整保留
  assert.equal(groups[0].name, '火灾报警控制系统项目组');
  assert.equal(groups[1].name, 'E1 S部 月度项目组');
  assert.equal(groups[9].name, 'EA5 S部 月度项目组');

  // 3. 验证自动补齐新员工
  assert.ok(newEmployees.length >= 6); // 邹富墩、刘盟、杨健、蔡欣欣、毕清博、杨春迪、张磊
  const zouEmp = newEmployees.find(e => e.name === '邹富墩');
  const liuEmp = newEmployees.find(e => e.name === '刘盟');
  assert.ok(zouEmp);
  assert.ok(liuEmp);

  // 4. 验证组长关联正确
  assert.equal(groups[0].owner, zouEmp.id);

  // 5. 验证组员列表与人数正确
  assert.equal(groups[0].members.length, 5);
  assert.ok(groups[0].members.includes(liuEmp.id));
  assert.ok(groups[0].members.includes(zouEmp.id));

  // 6. 验证默认分配比例解析正确（百分比转bps）
  assert.equal(groups[0].defaultRates[liuEmp.id], 1000); // 10.0%
  assert.equal(groups[0].defaultRates[zouEmp.id], 3000); // 30.0%

  // 7. 验证单团队模版CSV兼容性
  const singleTemplateCsv = `员工姓名,专业组,默认分配比例,职责描述,是否组长
张三,总体组,60%,总体统筹,是
李四,产品组,40%,模块实现,否`;
  const singleRes = parseProjectGroupsCsvText(singleTemplateCsv, state, '单团队导入测试');
  assert.equal(singleRes.groups.length, 1);
  assert.equal(singleRes.groups[0].name, '单团队导入测试');
  assert.equal(singleRes.groups[0].members.length, 2);
});

test('项目周期额度规划与全周期透视功能（前期争取阶段0-10%可调、维保阶段保留5%、全景透视）', () => {
  let state = demoState();
  const project = state.projects[0]; // project-a (120万, 2026-01 至 2026-03)

  // 1. 验证常量定义
  assert.equal(MAINTENANCE_QUOTA_RATE, 500); // 5%
  assert.equal(BIDDING_MAX_RATE, 1000); // 10%
  assert.equal(BIDDING_DEFAULT_RATE, 500); // 5%

  // 2. 验证根据周期生成月份跨度
  const months = getProjectSpanMonths(project.start, project.end);
  assert.deepEqual(months, ['2026-01', '2026-02', '2026-03']);

  // 3. 验证生成“稳健交付型”规划模板：
  // 首月为前期项目争取阶段 (0-10%可调，默认5%)，末月为维保阶段 (保留5%)，中间主体研制分配剩余90%
  const deliverablePlan = generateProjectQuotaSchedule(project, 'deliverable_focused');
  assert.equal(deliverablePlan.length, 3);
  const totalRate = deliverablePlan.reduce((s, p) => s + p.rate, 0);
  assert.equal(totalRate, 10000); // 100%

  // 首月：前期项目争取阶段 (500 bps = 5%)
  assert.equal(deliverablePlan[0].stageType, 'bidding');
  assert.equal(deliverablePlan[0].rate, 500);
  assert.ok(deliverablePlan[0].milestone.includes('前期项目争取'));

  // 中间月：主体研制阶段 (9000 bps = 90%)
  assert.equal(deliverablePlan[1].stageType, 'normal');
  assert.equal(deliverablePlan[1].rate, 9000);

  // 末月：维保阶段（保留 5% 额度）
  assert.equal(deliverablePlan[2].stageType, 'maintenance');
  assert.equal(deliverablePlan[2].rate, 500);
  assert.ok(deliverablePlan[2].milestone.includes('维保阶段'));

  // 4. 验证多月份项目（如6个月）：首月前期争取(5%)，末月维保保留(5%)，中间发货交付大头保障
  const longProject = {
    ...project,
    start: '2026-09',
    end: '2027-02'
  };
  const longPlan = generateProjectQuotaSchedule(longProject, 'deliverable_focused');
  assert.equal(longPlan.length, 6);
  assert.equal(longPlan.reduce((s, p) => s + p.rate, 0), 10000);
  assert.equal(longPlan[0].stageType, 'bidding');
  assert.equal(longPlan[0].rate, 500);
  assert.equal(longPlan[5].stageType, 'maintenance');
  assert.equal(longPlan[5].rate, 500);

  // 5. 验证自定义前期争取阶段比例（如调整为 8% = 800 bps）
  const customBiddingPlan = generateProjectQuotaSchedule(longProject, 'deliverable_focused', { biddingRate: 800 });
  assert.equal(customBiddingPlan[0].rate, 800);
  assert.equal(customBiddingPlan[5].rate, 500);
  assert.equal(customBiddingPlan.reduce((s, p) => s + p.rate, 0), 10000);

  // 6. 验证保存项目额度规划及阶段合规校验
  state = execute(state, 'admin', {
    type: 'project.saveQuotaSchedule',
    data: {
      projectId: project.id,
      quotaSchedule: deliverablePlan,
    }
  }, 'save-quota-1', '2026-01-01T00:00:00Z');

  const updatedPrj = state.projects.find(p => p.id === project.id);
  assert.ok(updatedPrj.quotaSchedule);
  assert.equal(updatedPrj.quotaSchedule.length, 3);
  assert.equal(updatedPrj.quotaSchedule[0].stageType, 'bidding');
  assert.equal(updatedPrj.quotaSchedule[2].stageType, 'maintenance');

  // 尝试将前期争取阶段设为超过 10%（例如 1200 bps = 12%），系统必须严格抛错拦截
  assert.throws(() => {
    execute(state, 'admin', {
      type: 'project.saveQuotaSchedule',
      data: {
        projectId: project.id,
        quotaSchedule: [
          { month: '2026-01', rate: 1200, milestone: '前期项目争取阶段', stageType: 'bidding' },
          { month: '2026-02', rate: 8300, milestone: '模块开发', stageType: 'normal' },
          { month: '2026-03', rate: 500, milestone: '维保阶段', stageType: 'maintenance' }
        ]
      }
    }, 'save-quota-invalid', '2026-01-01T00:00:00Z');
  }, /前期项目争取阶段.*不能超过 10%/);

  // 7. 验证获取全周期透视数据（规划 vs 实际、偏差、进度）
  const perspective = getProjectQuotaPerspective(state, project.id);
  assert.ok(perspective);
  assert.equal(perspective.totalPlannedRate, 10000);
  assert.equal(perspective.monthRows.length, 3);
  assert.ok(perspective.totalActualRate > 0);

  // 8. 验证 CSV 导出与导入（包含阶段类型识别与保留）
  const csvText = exportProjectQuotaScheduleCsv(perspective);
  assert.ok(csvText.includes('工作令号'));
  assert.ok(csvText.includes('规划分配比例(%)'));
  assert.ok(csvText.includes('前期项目争取'));
  assert.ok(csvText.includes('维保阶段'));

  const parsedSchedule = parseProjectQuotaScheduleCsvText(csvText, project);
  assert.equal(parsedSchedule.length, 3);
  assert.equal(parsedSchedule[0].month, '2026-01');
  assert.equal(parsedSchedule[0].rate, deliverablePlan[0].rate);
  assert.equal(parsedSchedule[0].stageType, 'bidding');
  assert.equal(parsedSchedule[2].stageType, 'maintenance');

  // 9. 验证智能阶段类型识别 getQuotaPlanStageType
  assert.equal(getQuotaPlanStageType({ milestone: '前期项目争取与技术方案论证' }), 'bidding');
  assert.equal(getQuotaPlanStageType({ milestone: '维保阶段（项目结束）' }), 'maintenance');
  assert.equal(getQuotaPlanStageType({ milestone: '核心模块开发与联调' }), 'normal');
});

test('企业级全量灾备数据 AES-256-GCM 加密导出与权限口令解密验证', async () => {
  const state = demoState();
  const password = 'DisasterAdmin#2026';

  // 1. 加密导出全量灾备
  const encryptedJson = await exportEncryptedBackupJson(state, password, {
    workspaceName: '生产保密工作区',
    projectGroups: [{ id: 'g1', name: '核心总体组', type: '总体组', memberIds: ['admin'] }]
  });

  assert.ok(isEncryptedBackup(encryptedJson));
  const parsedEnvelope = JSON.parse(encryptedJson);
  assert.equal(parsedEnvelope.format, 'hengji-encrypted-backup');
  assert.equal(parsedEnvelope.encrypted, true);
  assert.ok(parsedEnvelope.salt);
  assert.ok(parsedEnvelope.iv);
  assert.ok(parsedEnvelope.data);
  // 明文数据不应暴露在顶层
  assert.equal(parsedEnvelope.state, undefined);

  // 2. 正确口令成功解密
  const decrypted = await parseAndDecryptBackupJson(encryptedJson, password);
  assert.equal(decrypted.workspaceName, '生产保密工作区');
  assert.equal(decrypted.state.employees.length, state.employees.length);
  assert.equal(decrypted.state.projects.length, state.projects.length);
  assert.equal(decrypted.projectGroups.length, 1);
  assert.equal(decrypted.projectGroups[0].name, '核心总体组');

  // 3. 错误口令解密被拒绝
  await assert.rejects(
    async () => {
      await parseAndDecryptBackupJson(encryptedJson, 'WrongPassword123');
    },
    /权限口令错误/
  );

  // 4. 未输入口令被拒绝
  await assert.rejects(
    async () => {
      await parseAndDecryptBackupJson(encryptedJson, '');
    },
    /请输入解密口令/
  );

  // 5. 兼容导入历史未加密备份
  const legacyBackup = exportFullBackupJson(state);
  assert.equal(isEncryptedBackup(legacyBackup), false);
  const legacyDecrypted = await parseAndDecryptBackupJson(legacyBackup);
  assert.equal(legacyDecrypted.state.projects.length, state.projects.length);

  // 6. 版本号与更新历史验证
  assert.equal(APP_VERSION, '0.5.0');
  assert.ok(UPDATE_HISTORY.length >= 5);
  assert.equal(UPDATE_HISTORY[0].version, 'v0.5.0');
  assert.ok(UPDATE_HISTORY[0].items.some(it => it.includes('集中管理')));
  assert.ok(UPDATE_HISTORY[0].items.some(it => it.includes('批量发布')));
});

test('月底分配全项目当月集中透视、每个项目月分配批量修改与一键批量发布/撤回', () => {
  let state = demoState();

  // 添加第二个测试项目
  state.projects.push({
    id: 'project-b',
    code: 'B-2026-002',
    name: '智能控制系统研发',
    client: '测试客户B',
    contract: 100_000_000,
    owner: 'yi',
    start: '2026-01',
    end: '2026-06',
    status: 'active',
    members: ['yi', 'bing'],
    quotaSchedule: [
      { month: '2026-03', rate: 2000, milestone: '单元调试', stageType: 'normal' },
      { month: '2026-04', rate: 3000, milestone: '综合联调', stageType: 'normal' }
    ]
  });

  // 1. 验证 getMonthProjectsAllocPerspective 全项目集中透视
  const perspective202603 = getMonthProjectsAllocPerspective(state, '2026-03', 'admin');
  assert.equal(perspective202603.month, '2026-03');
  assert.equal(perspective202603.totalProjects, 2); // project-a 和 project-b
  assert.equal(perspective202603.rows.length, 2);

  // 验证各行数据
  const rowA = perspective202603.rows.find(r => r.project.id === 'project-a');
  const rowB = perspective202603.rows.find(r => r.project.id === 'project-b');
  assert.ok(rowA && rowB);

  // project-a 在 demoState 中已存在 2026-03 的草稿方案 a-03
  assert.equal(rowA.status, 'draft');
  assert.equal(rowA.actualRate, 3334);
  assert.ok(rowA.plan);

  // project-b 尚未创建 2026-03 分配
  assert.equal(rowB.status, 'unallocated');
  assert.equal(rowB.actualRate, 0);
  assert.equal(rowB.plannedRate, 2000);
  assert.equal(rowB.diffRate, -2000);

  // 2. 验证 plan.batchSave 批量修改/创建多个项目的月度分配
  const batchSaveData = {
    plans: [
      {
        projectId: 'project-a',
        month: '2026-03',
        budget: 3000,
        entries: [
          { employeeId: 'jia', rate: 6000, workContent: '总体联调' },
          { employeeId: 'yi', rate: 4000, workContent: '接口适配' }
        ],
        note: '集中调整3月计划'
      },
      {
        projectId: 'project-b',
        month: '2026-03',
        budget: 2000,
        entries: [
          { employeeId: 'yi', rate: 5000, workContent: '硬件驱动' },
          { employeeId: 'bing', rate: 5000, workContent: '算法集成' }
        ],
        note: '集中新建3月计划'
      }
    ]
  };

  state = execute(state, 'admin', {
    type: 'plan.batchSave',
    data: batchSaveData
  }, 'batch-save-1', '2026-01-01T00:00:00Z');

  // 验证批量保存后两个项目在 2026-03 均存在且状态为草稿
  const planA = state.plans.find(p => p.projectId === 'project-a' && p.month === '2026-03');
  const planB = state.plans.find(p => p.projectId === 'project-b' && p.month === '2026-03');
  assert.ok(planA && planB);
  assert.equal(planA.status, 'draft');
  assert.equal(planA.budget, 3000);
  assert.equal(planB.status, 'draft');
  assert.equal(planB.budget, 2000);

  // 3. 验证 plan.batchPublish 一键批量发布选中的项目方案
  state = execute(state, 'admin', {
    type: 'plan.batchPublish',
    data: { planIds: [planA.id, planB.id] }
  }, 'batch-pub-1', '2026-01-01T00:00:00Z');

  const pubPlanA = state.plans.find(p => p.id === planA.id);
  const pubPlanB = state.plans.find(p => p.id === planB.id);
  assert.equal(pubPlanA.status, 'published');
  assert.equal(pubPlanB.status, 'published');

  // 4. 再次获取全项目集中透视：此时已发布数量应为 2
  const updatedPerspective = getMonthProjectsAllocPerspective(state, '2026-03', 'admin');
  assert.equal(updatedPerspective.publishedCount, 2);
  assert.equal(updatedPerspective.draftCount, 0);

  // 5. 验证 plan.batchReopen 批量撤回月度方案为草稿
  state = execute(state, 'admin', {
    type: 'plan.batchReopen',
    data: { planIds: [planA.id, planB.id] }
  }, 'batch-reopen-1', '2026-01-01T00:00:00Z');

  const reopenedA = state.plans.find(p => p.id === planA.id);
  const reopenedB = state.plans.find(p => p.id === planB.id);
  assert.equal(reopenedA.status, 'draft');
  assert.equal(reopenedB.status, 'draft');

  // 6. 验证已发布的方案不允许未撤回直接保存
  const rePubState = execute(state, 'admin', {
    type: 'plan.batchPublish',
    data: { planIds: [planA.id] }
  }, 'batch-pub-again', '2026-01-01T00:00:00Z');

  assert.throws(() => {
    execute(rePubState, 'admin', {
      type: 'plan.batchSave',
      data: {
        plans: [{ projectId: 'project-a', month: '2026-03', budget: 2500 }]
      }
    }, 'fail-edit-pub', '2026-01-01T00:00:00Z');
  }, /已发布，需先撤回为草稿才能修改/);
});


