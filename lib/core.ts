export const SCALE = 10000;
export const DEFAULT_GROUPS = ['总体组', '产品组', '研发组'] as const;
export type ProfessionalGroup = typeof DEFAULT_GROUPS[number] | string;

export type Employee = {
  id: string;
  name: string;
  department: string;
  group?: string; // 专业组：总体组 / 产品组 / 研发组 或组合如 产品组,研发组
  position?: string; // 职务：副所长,主任 / 副主任 / 研究员 / 高级工程师 / 工程师 等
  groupRole?: string; // 专业组职务：组长 / 副组长 / 顾问 / 组员
  email: string;
  role: 'admin' | 'member';
  active: boolean;
};

export type ProjectQuotaStageType = 'bidding' | 'normal' | 'maintenance';

export const MAINTENANCE_QUOTA_RATE = 500; // 维保阶段保留 5% 额度 (500 基点)
export const BIDDING_MAX_RATE = 1000;       // 前期项目争取阶段额度上限 10% (1000 基点)
export const BIDDING_DEFAULT_RATE = 500;   // 前期项目争取阶段默认额度 5% (500 基点)

export type ProjectMonthlyQuotaPlan = {
  month: string;      // 规划月份 YYYY-MM
  rate: number;       // 规划分配比例（基点 0-10000）
  milestone?: string; // 阶段里程碑 / 交付目标（如：方案设计、初样研制、联调测试、最终发货交付）
  note?: string;      // 规划说明 / 交付成果
  stageType?: ProjectQuotaStageType; // 阶段类型：bidding(前期项目争取阶段, 0-10%可调) | normal(正常研制交付阶段) | maintenance(维保阶段, 放置在最后保留5%额度)
};

export function getQuotaPlanStageType(plan: Partial<ProjectMonthlyQuotaPlan>): ProjectQuotaStageType {
  if (plan.stageType) return plan.stageType;
  const combined = `${plan.milestone || ''} ${plan.note || ''}`;
  if (combined.includes('争取') || combined.includes('招投标') || combined.includes('商务方案')) return 'bidding';
  if (combined.includes('维保') || combined.includes('质保') || combined.includes('售后')) return 'maintenance';
  return 'normal';
}

export type Project = {
  id: string;
  code: string;
  name: string;
  client: string;
  contract: number; // 分
  owner: string;
  start: string; // YYYY-MM
  end: string;   // YYYY-MM
  status: 'active' | 'archived';
  members: string[]; // employee ids
  historyCompletedAmount?: number; // 历史已完成额度（分），默认为 0
  historyCompletedRate?: number;   // 历史已完成比例（基点 0-10000），默认为 0
  defaultRates?: Record<string, number>; // 可选：项目默认成员分配比例 (基点 0-10000)
  quotaSchedule?: ProjectMonthlyQuotaPlan[]; // 项目全周期月度额度规划与节奏计划
};

export type PlanEntry = {
  employeeId: string;
  rate: number;
  workContent?: string;
};
export type Plan = {
  id: string;
  projectId: string;
  month: string; // YYYY-MM
  budget: number; // 基点 0-10000
  entries: PlanEntry[];
  status: 'draft' | 'published';
  note: string;
};

export type Audit = { id: string; at: string; actor: string; action: string; target: string };
export type State = { employees: Employee[]; projects: Project[]; plans: Plan[]; audit: Audit[] };
export type Command = { type: string; data: any };

export const emptyState = (): State => ({ employees: [], projects: [], plans: [], audit: [] });
export function fail(message: string): never { throw new Error(message); }
export function text(value: unknown, label: string, max = 160): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) fail(`${label}不能为空，且不能超过 ${max} 字`);
  return value.trim();
}
export function integer(value: unknown, label: string, min = 0, max = SCALE): number {
  if (!Number.isSafeInteger(value) || (value as number) < min || (value as number) > max) fail(`${label}必须在 ${min}–${max} 之间`);
  return value as number;
}
export const total = (values: number[]) => values.reduce((sum, value) => sum + value, 0);
export const range = (contract: number): [number, number] => contract < 50_000_000 ? [6000, 9000] : contract < 500_000_000 ? [3000, 6000] : [1000, 3000];
export const points = (amount: number, rate: number) => Number((BigInt(amount) * BigInt(rate) + 5000n) / 10000n);
export const pct = (rate: number) => `${(rate / 100).toFixed(2).replace(/\.00$/, '')}%`;
export const wan = (fen: number) => (fen / 1_000_000).toLocaleString('zh-CN', { maximumFractionDigits: 6 });
export const score = (fen: number) => (fen / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const monthAmount = (project: Project, plan: Plan) => points(project.contract, plan.budget);

export function toMoney(value: string) {
  if (!/^\d+(\.\d{1,6})?$/.test(value)) fail('金额最多保留六位小数（万元）');
  return integer(Math.round(Number(value) * 1_000_000), '金额', 1, 1_000_000_000_000);
}
export function toRate(value: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) fail('百分比最多保留两位小数');
  return integer(Math.round(Number(value) * 100), '比例');
}

// Largest-remainder allocation keeps every monthly amount exact to the cent.
export function allocate(amount: number, entries: PlanEntry[]) {
  if (total(entries.map(entry => entry.rate)) !== SCALE) fail('当月项目组成员分配比例之和必须等于 100%');
  const rows = entries.map((entry, index) => {
    const raw = BigInt(amount) * BigInt(entry.rate);
    return {
      employeeId: entry.employeeId,
      points: Number(raw / 10000n),
      remainder: Number(raw % 10000n),
      index,
      rate: entry.rate,
      workContent: entry.workContent || ''
    };
  });
  const missing = amount - total(rows.map(row => row.points));
  const order = [...rows].sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  for (let index = 0; index < missing; index += 1) order[index % order.length].points += 1;
  return rows.map(({ employeeId, points, rate, workContent }) => ({ employeeId, points, rate, workContent }));
}

export function planAllocations(project: Project, plan: Plan) {
  return allocate(monthAmount(project, plan), plan.entries);
}

export function projectBudgetRate(state: State, projectId: string) {
  return total(state.plans.filter(plan => plan.projectId === projectId).map(plan => plan.budget));
}

export function ownerSummary(state: State, project: Project) {
  const allocated = total(state.plans.filter(plan => plan.projectId === project.id).map(plan => planAllocations(project, plan).find(row => row.employeeId === project.owner)?.points ?? 0));
  const rate = project.contract ? Number((BigInt(allocated) * 10000n + BigInt(Math.floor(project.contract / 2))) / BigInt(project.contract)) : 0;
  const [low, high] = range(project.contract);
  return { allocated, rate, low, high, valid: rate >= low && rate <= high };
}

export const nowMonth = () => new Date().toISOString().slice(0, 7);
export const monthValid = (month: string) => /^20\d{2}-(0[1-9]|1[0-2])$/.test(month);
const unique = (ids: string[], message: string) => { if (new Set(ids).size !== ids.length) fail(message); };
const sameMembers = (left: string[], right: string[]) => left.length === right.length && left.every(id => right.includes(id));

export function validate(state: State) {
  unique(state.employees.map(employee => employee.id), '员工 ID 重复');
  unique(state.employees.filter(employee => employee.email).map(employee => employee.email.toLowerCase()), '员工邮箱重复');
  unique(state.projects.map(project => project.id), '项目 ID 重复');
  unique(state.projects.map(project => `${project.code}:${project.name}`), '相同工作令号下已存在同名项目');
  unique(state.plans.map(plan => `${plan.projectId}:${plan.month}`), '该项目当月分配已存在，请编辑现有记录');
  for (const project of state.projects) {
    integer(project.contract, '合同金额', 1, 1_000_000_000_000);
    if (!monthValid(project.start)) fail('项目开始月份不正确');
    if (project.end && (!monthValid(project.end) || project.start > project.end)) fail('项目起止月份不正确');
    if (!project.members.length || project.members.length > 200) fail('项目组人数应在 1–200 人之间');
    unique(project.members, '项目组成员重复');
    if (!project.members.includes(project.owner)) fail('项目负责人必须是项目组成员');
    for (const employeeId of project.members) if (!state.employees.some(employee => employee.id === employeeId && employee.active)) fail('项目组只能包含启用中的员工');
    const plans = state.plans.filter(plan => plan.projectId === project.id);
    const budgetRate = total(plans.map(plan => plan.budget));
    const maxPlanRate = Math.max(0, SCALE - (project.historyCompletedRate || 0));
    if (budgetRate > maxPlanRate) {
      if ((project.historyCompletedRate || 0) > 0) {
        fail(`该项目各月分配额度比例合计（${pct(budgetRate)}）不能超过历史剩余额度（${pct(maxPlanRate)}）`);
      } else {
        fail('该项目各月可分配额度比例合计不能超过 100%');
      }
    }
    for (const plan of plans) {
      if (!monthValid(plan.month) || plan.month < project.start || (project.end && plan.month > project.end)) fail('分配月份必须处于项目周期内');
      integer(plan.budget, '月度可分配额度比例', 1, SCALE);
      unique(plan.entries.map(entry => entry.employeeId), '月度成员重复');
      for (const entry of plan.entries) {
        if (!project.members.includes(entry.employeeId)) {
          project.members.push(entry.employeeId);
        }
      }
      for (const entry of plan.entries) integer(entry.rate, '成员月度分配比例', 0, SCALE);
      if (total(plan.entries.map(entry => entry.rate)) !== SCALE) fail('当月项目组成员分配比例之和必须等于 100%');
      planAllocations(project, plan);
    }
    // 项目负责人的绩点分配率为参考区间，用于指引和提醒，不作强制硬拦截
    const owner = ownerSummary(state, project);
    if (project.status === 'archived') {
      if (budgetRate !== maxPlanRate) fail(`项目各月额度比例合计达到历史剩余额度（${pct(maxPlanRate)}）后才能结项`);
      if (plans.some(plan => plan.status !== 'published')) fail('所有月度分配发布后才能结项');
    }
  }
  for (const plan of state.plans) if (!state.projects.some(project => project.id === plan.projectId)) fail('月度分配对应的项目不存在');
}

export const initialDepartmentEmployees: Employee[] = [];

export function execute(current: State, actorId: string, command: Command, id: string, at: string): State {
  const state: State = structuredClone(current);
  const actor = state.employees.find(employee => employee.id === actorId && employee.active);
  if (!actor) fail('当前操作员未获授权');
  const data = command.data;
  if (!data || typeof data !== 'object') fail('请求格式无效');
  let action = '', target = '';

  if (command.type === 'employee.save') {
    if (actor.role !== 'admin') fail('只有管理员可以管理员工');
    const old = state.employees.find(employee => employee.id === data.id);
    const employee: Employee = {
      id: old?.id || id,
      name: text(data.name, '员工姓名', 40),
      department: text(data.department, '部门', 60),
      group: typeof data.group === 'string' && data.group.trim() ? data.group.trim() : '',
      position: typeof data.position === 'string' ? data.position.trim() : (old?.position || ''),
      groupRole: typeof data.groupRole === 'string' ? data.groupRole.trim() : (old?.groupRole || ''),
      email: typeof data.email === 'string' ? data.email.trim().toLowerCase() : '',
      role: data.role === 'admin' ? 'admin' : 'member',
      active: data.active !== false
    };
    if (employee.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) fail('邮箱格式不正确');
    if (employee.id === actor.id && (!employee.active || employee.role !== 'admin')) fail('不能停用或降级当前管理员');
    if (old && state.projects.some(project => project.members.includes(old.id)) && !employee.active) fail('该员工仍在项目组中，不能停用');
    if (old) state.employees[state.employees.indexOf(old)] = employee;
    else state.employees.push(employee);
    action = old ? '修改员工' : '新增员工';
    target = `${employee.name}（${employee.group || '未分组'}）`;
  } else if (command.type === 'employee.delete') {
    if (actor.role !== 'admin') fail('只有管理员可以删除员工');
    const old = state.employees.find(employee => employee.id === data.id);
    if (!old) fail('员工不存在');
    if (old.id === actor.id) fail('不能删除当前登录管理员');
    const involved = state.projects.filter(p => p.members.includes(old.id));
    if (involved.length > 0) {
      fail(`员工【${old.name}】仍在项目【${involved.map(p => p.name).join('、')}】中，请先在项目中移出该成员`);
    }
    state.employees = state.employees.filter(employee => employee.id !== old.id);
    action = '删除员工'; target = old.name;
  } else if (command.type === 'employee.initDefaults') {
    // 源代码中已彻底移除内置真实员工，保留此指令作为空操作以防旧调用报错
    action = '初始化部门成员'; target = `当前共 ${state.employees.length} 位成员`;
  } else if (command.type === 'employee.importBatch') {
    if (actor.role !== 'admin') fail('只有管理员可以导入员工');
    if (!Array.isArray(data.employees)) fail('导入数据格式不正确');
    let count = 0;
    for (const item of data.employees) {
      if (!item.name || typeof item.name !== 'string' || !item.name.trim()) continue;
      const empName = item.name.trim();
      const existing = state.employees.find(e => e.name === empName || (item.id && e.id === item.id));
      const groupVal = typeof item.group === 'string' && item.group.trim() ? item.group.trim() : '';
      const deptVal = typeof item.department === 'string' && item.department.trim() ? item.department.trim() : (groupVal ? `${groupVal.split(',')[0]}部` : '综合部');
      const emailVal = typeof item.email === 'string' ? item.email.trim().toLowerCase() : '';
      const posVal = typeof item.position === 'string' ? item.position.trim() : '';
      const grpRoleVal = typeof item.groupRole === 'string' ? item.groupRole.trim() : '';
      if (existing) {
        existing.department = deptVal;
        existing.group = groupVal;
        if (posVal) existing.position = posVal;
        if (grpRoleVal) existing.groupRole = grpRoleVal;
        if (emailVal) existing.email = emailVal;
      } else {
        state.employees.push({
          id: item.id || `emp_${crypto.randomUUID().slice(0, 8)}`,
          name: empName,
          department: deptVal,
          group: groupVal,
          position: posVal,
          groupRole: grpRoleVal,
          email: emailVal,
          role: item.role === 'admin' ? 'admin' : 'member',
          active: true,
        });
      }
      count++;
    }
    action = '批量导入员工'; target = `成功导入/更新 ${count} 人`;
  } else if (command.type === 'project.save') {
    if (actor.role !== 'admin') fail('只有管理员可以维护项目');
    const old = state.projects.find(project => project.id === data.id);
    if (old?.status === 'archived') fail('请先恢复已结项项目');
    const contract = integer(data.contract, '合同金额', 1, 1_000_000_000_000);
    const rawHistAmt = typeof data.historyCompletedAmount === 'number'
      ? Math.max(0, data.historyCompletedAmount)
      : (typeof data.historyCompletedAmount === 'string' && data.historyCompletedAmount.trim() ? toMoney(data.historyCompletedAmount) : 0);
    const rawHistRate = typeof data.historyCompletedRate === 'number'
      ? Math.max(0, Math.min(SCALE, data.historyCompletedRate))
      : 0;
    const historyCompletedAmount = rawHistAmt > 0
      ? Math.min(contract, rawHistAmt)
      : (rawHistRate > 0 ? points(contract, rawHistRate) : 0);
    const historyCompletedRate = contract > 0
      ? Math.min(SCALE, Math.round((historyCompletedAmount * 10000) / contract))
      : 0;

    const project: Project = {
      id: old?.id || id,
      code: text(data.code, '工作令号', 40),
      name: text(data.name, '项目名称', 100),
      client: typeof data.client === 'string' ? data.client.trim().slice(0, 100) : '',
      contract,
      owner: text(data.owner, '负责人'),
      start: text(data.start, '开始月份'),
      end: typeof data.end === 'string' ? data.end.trim() : '',
      status: old?.status || 'active',
      members: Array.isArray(data.members) ? data.members.map(String) : [],
      historyCompletedAmount,
      historyCompletedRate,
      defaultRates: data.defaultRates || old?.defaultRates,
      quotaSchedule: Array.isArray(data.quotaSchedule) ? data.quotaSchedule : old?.quotaSchedule,
    };
    if (!state.employees.some(employee => employee.id === project.owner && employee.active)) fail('负责人必须是启用中的员工');
    if (old && state.plans.some(plan => plan.projectId === old.id)) {
      if (old.contract !== project.contract) fail('项目已有月度分配，不能修改合同金额');
    }
    if (old) state.projects[state.projects.indexOf(old)] = project;
    else state.projects.push(project);
    action = old ? '修改项目' : '新建项目'; target = project.name;
  } else if (command.type === 'project.importBatch') {
    if (actor.role !== 'admin') fail('只有管理员可以导入项目');
    if (!Array.isArray(data.projects)) fail('导入项目数据不正确');
    let count = 0;
    for (const item of data.projects) {
      if (!item.name && !item.code) continue;
      const prjName = (item.name || item.code || '').trim();
      const prjCode = (item.code || `WO-${nowMonth().replace('-', '')}-${String(count + 1).padStart(3, '0')}`).trim();

      let ownerId = item.owner;
      if (!state.employees.some(e => e.id === ownerId && e.active)) {
        const found = state.employees.find(e => (e.name === item.ownerName || e.name === item.owner) && e.active);
        if (found) {
          ownerId = found.id;
        } else {
          // 自动匹配系统首位管理员或首位激活员工为默认负责人
          const defaultAdmin = state.employees.find(e => e.role === 'admin' && e.active) || state.employees.find(e => e.active);
          if (defaultAdmin && (!item.ownerName || item.ownerName === '系统管理员' || item.ownerName === '默认负责人' || !item.owner)) {
            ownerId = defaultAdmin.id;
          } else {
            // 自动注册未在人员库中的项目负责人
            const newEmpId = `emp_${crypto.randomUUID().slice(0, 8)}`;
            state.employees.push({
              id: newEmpId,
              name: item.ownerName || item.owner || '新项目负责人',
              department: '总体部',
              group: '总体组',
              position: '项目负责人',
              groupRole: '组员',
              email: '',
              role: 'member',
              active: true,
            });
            ownerId = newEmpId;
          }
        }
      }
      const memberIds = new Set<string>();
      memberIds.add(ownerId);
      if (Array.isArray(item.members)) {
        for (const m of item.members) {
          const emp = state.employees.find(e => e.id === m || e.name === m);
          if (emp) {
            memberIds.add(emp.id);
          } else if (typeof m === 'string' && m.trim()) {
            const newEmpId = `emp_${crypto.randomUUID().slice(0, 8)}`;
            state.employees.push({
              id: newEmpId,
              name: m.trim(),
              department: '研发中心',
              group: '研发组',
              email: '',
              role: 'member',
              active: true,
            });
            memberIds.add(newEmpId);
          }
        }
      }
      const existing = state.projects.find(p => p.code === prjCode && p.name === prjName);
      const prj: Project = {
        id: existing?.id || `prj_${crypto.randomUUID().slice(0, 8)}`,
        code: text(prjCode, '工作令号', 40),
        name: text(prjName, '项目名称', 100),
        client: typeof item.client === 'string' ? item.client.trim().slice(0, 100) : '',
        contract: integer(item.contract, '合同金额', 1, 1_000_000_000_000),
        owner: ownerId,
        start: text(item.start || nowMonth(), '开始月份'),
        end: typeof item.end === 'string' ? item.end.trim() : '',
        status: existing?.status || 'active',
        members: Array.from(memberIds),
      };
      if (existing) state.projects[state.projects.indexOf(existing)] = prj;
      else state.projects.push(prj);
      count++;
    }
    action = '批量导入项目'; target = `成功导入 ${count} 个项目`;
  } else if (command.type === 'project.archive') {
    if (actor.role !== 'admin') fail('只有管理员可以结项或恢复项目');
    const project = state.projects.find(item => item.id === data.id);
    if (!project) fail('项目不存在');
    project.status = project.status === 'active' ? 'archived' : 'active';
    action = project.status === 'archived' ? '项目结项' : '恢复项目';
    target = project.name;
  } else if (command.type === 'project.delete') {
    if (actor.role !== 'admin') fail('只有管理员可以删除项目');
    const project = state.projects.find(item => item.id === data.id);
    if (!project) fail('项目不存在');
    state.plans = state.plans.filter(plan => plan.projectId !== project.id);
    state.projects = state.projects.filter(item => item.id !== project.id);
    action = '删除项目'; target = `${project.name} (${project.code})`;
  } else if (command.type === 'project.deleteBatch') {
    if (actor.role !== 'admin') fail('只有管理员可以删除项目');
    if (!Array.isArray(data.ids) || data.ids.length === 0) fail('未选择要删除的项目');
    const ids = new Set(data.ids.map(String));
    state.plans = state.plans.filter(plan => !ids.has(plan.projectId));
    state.projects = state.projects.filter(item => !ids.has(item.id));
    action = '批量删除项目'; target = `成功删除 ${ids.size} 个项目`;
  } else if (command.type === 'project.batchConfigureTeam') {
    if (actor.role !== 'admin') fail('只有管理员可以批量配置项目组');
    if (!Array.isArray(data.projectIds) || data.projectIds.length === 0) fail('未指定目标项目');
    const memberIds = Array.isArray(data.members) ? data.members.map(String) : [];
    if (memberIds.length === 0) fail('项目组成员不能为空');
    for (const employeeId of memberIds) {
      if (!state.employees.some(employee => employee.id === employeeId && employee.active)) {
        fail('项目组成员只能包含启用中的员工');
      }
    }
    const targetSet = new Set(data.projectIds.map(String));
    let count = 0;
    for (const project of state.projects) {
      if (targetSet.has(project.id)) {
        if (data.owner && memberIds.includes(data.owner)) {
          project.owner = data.owner;
        } else if (!memberIds.includes(project.owner)) {
          project.owner = memberIds[0];
        }
        project.members = Array.from(new Set(memberIds));
        if (data.defaultRates && typeof data.defaultRates === 'object') {
          project.defaultRates = data.defaultRates;
        }
        count++;
      }
    }
    action = '批量设置项目组成员与比例';
    target = `已为 ${count} 个项目配置 ${memberIds.length} 位成员与默认分配比例`;
  } else if (command.type === 'project.saveQuotaSchedule') {
    const project = state.projects.find(p => p.id === data.projectId);
    if (!project) fail('目标项目不存在');
    if (actor.role !== 'admin' && project.owner !== actor.id) fail('只有管理员或项目负责人可以调整项目额度规划');
    if (project.status === 'archived') fail('已结项项目不能调整额度规划');
    if (!Array.isArray(data.quotaSchedule)) fail('规划数据格式不正确');

    const schedule: ProjectMonthlyQuotaPlan[] = data.quotaSchedule.map((item: any) => {
      const milestone = typeof item.milestone === 'string' ? item.milestone.slice(0, 200) : '';
      const note = typeof item.note === 'string' ? item.note.slice(0, 200) : '';
      const rawStage = item.stageType;
      const stageType = (rawStage === 'bidding' || rawStage === 'maintenance' || rawStage === 'normal')
        ? rawStage
        : getQuotaPlanStageType({ milestone, note });
      const rate = integer(item.rate, '规划比例', 0, SCALE);
      if (stageType === 'bidding' && rate > BIDDING_MAX_RATE) {
        fail(`前期项目争取阶段规划额度（${pct(rate)}）不能超过 10%（0-10%可调）`);
      }
      return {
        month: text(item.month, '规划月份'),
        rate,
        milestone,
        note,
        stageType,
      };
    }).sort((a, b) => a.month.localeCompare(b.month));

    const totalRate = total(schedule.map(s => s.rate));
    const maxAllocable = Math.max(0, SCALE - (project.historyCompletedRate || 0));
    if (totalRate > maxAllocable) {
      fail(`全周期规划分配比例合计（${pct(totalRate)}）不能超过项目可分配余额（${pct(maxAllocable)}）`);
    }

    project.quotaSchedule = schedule;
    action = '制定项目额度规划';
    target = `${project.name} (已规划 ${schedule.length} 个月度，额度规划总额 ${pct(totalRate)})`;
  } else if (command.type.startsWith('plan.')) {
    const old = state.plans.find(plan => plan.id === data.id);
    const project = state.projects.find(item => item.id === (old?.projectId || data.projectId));
    if (!project || (actor.role !== 'admin' && project.owner !== actor.id)) fail('只有管理员或项目负责人可以分配绩点');
    if (project.status === 'archived') fail('已结项项目不能调整月度分配');
    target = `${project.name} / ${old?.month || data.month}`;
    if (command.type === 'plan.save') {
      if (old?.status === 'published') fail('已发布记录需先撤回才能编辑');
      const plan: Plan = {
        id: old?.id || id,
        projectId: project.id,
        month: text(data.month, '分配月份'),
        budget: integer(data.budget, '月度额度比例', 1, SCALE),
        entries: Array.isArray(data.entries) ? data.entries.map((entry: any) => ({
          employeeId: String(entry.employeeId),
          rate: integer(entry.rate, '成员分配比例'),
          workContent: typeof entry.workContent === 'string' ? entry.workContent.slice(0, 500) : ''
        })) : [],
        status: 'draft',
        note: typeof data.note === 'string' ? data.note.slice(0, 500) : ''
      };
      for (const entry of plan.entries) {
        if (!project.members.includes(entry.employeeId)) {
          project.members.push(entry.employeeId);
        }
      }
      if (old) state.plans[state.plans.indexOf(old)] = plan;
      else state.plans.push(plan);
      action = '保存月度分配草稿';
    } else if (command.type === 'plan.publish') {
      if (!old || old.status !== 'draft') fail('只能发布草稿');
      old.status = 'published';
      action = '发布月度绩点';
    } else if (command.type === 'plan.reopen') {
      if (!old || old.status !== 'published') fail('只能撤回已发布记录');
      old.status = 'draft';
      action = '撤回月度绩点';
    } else if (command.type === 'plan.delete') {
      if (!old || old.status !== 'draft') fail('只能删除草稿');
      state.plans = state.plans.filter(plan => plan.id !== old.id);
      action = '删除月度草稿';
    } else fail('未知操作');
  } else fail('未知操作');

  validate(state);
  state.audit.push({ id, at, actor: actor.name, action, target });
  return state;
}

// 需求1：实时查看本项目已分配的额度和明细，剩余的额度和比例
export function projectAllocDetail(state: State, projectId: string) {
  const project = state.projects.find(p => p.id === projectId);
  if (!project) return null;
  const plans = state.plans.filter(p => p.projectId === projectId).sort((a, b) => a.month.localeCompare(b.month));

  const totalBudgetRate = total(plans.map(p => p.budget));
  const publishedPlans = plans.filter(p => p.status === 'published');
  const publishedBudgetRate = total(publishedPlans.map(p => p.budget));
  const draftPlans = plans.filter(p => p.status === 'draft');
  const draftBudgetRate = total(draftPlans.map(p => p.budget));

  const totalAllocatedAmount = monthAmount(project, { budget: totalBudgetRate } as Plan);
  const publishedAmount = monthAmount(project, { budget: publishedBudgetRate } as Plan);
  const draftAmount = monthAmount(project, { budget: draftBudgetRate } as Plan);

  // 历史项目额度处理
  const historyCompletedAmount = project.historyCompletedAmount || 0;
  const historyCompletedRate = project.historyCompletedRate || 0;
  const allocableAmount = Math.max(0, project.contract - historyCompletedAmount);
  const allocableRate = Math.max(0, SCALE - historyCompletedRate);

  // 后续剩余还可分配额度（从历史剩余额度中扣减系统内规划分配）
  const remainingRate = Math.max(0, allocableRate - totalBudgetRate);
  const remainingAmount = Math.max(0, allocableAmount - totalAllocatedAmount);

  // 全周期总计已完成（历史已完成 + 系统内已发布）
  const grandTotalCompletedAmount = historyCompletedAmount + publishedAmount;
  const grandTotalCompletedRate = historyCompletedRate + publishedBudgetRate;

  // 每月明细（按分配比例从小到大排序展示）
  const monthlyBreakdown = plans.map(plan => {
    const amount = monthAmount(project, plan);
    const allocations = planAllocations(project, plan);
    const memberDetails = allocations.map(alloc => {
      const emp = state.employees.find(e => e.id === alloc.employeeId);
      const entry = plan.entries.find(e => e.employeeId === alloc.employeeId);
      return {
        employeeId: alloc.employeeId,
        name: emp?.name || alloc.employeeId,
        department: emp?.department || '',
        group: emp?.group || '未分组',
        rate: entry?.rate || 0,
        ratePct: pct(entry?.rate || 0),
        points: alloc.points,
        amountWan: (alloc.points / 1_000_000).toFixed(4),
        workContent: entry?.workContent || '',
      };
    }).sort((a, b) => a.rate - b.rate); // 按分配比例从小到大严格排序
    return {
      planId: plan.id,
      month: plan.month,
      status: plan.status,
      budgetRate: plan.budget,
      budgetPct: pct(plan.budget),
      amount,
      amountWan: wan(amount),
      note: plan.note,
      members: memberDetails,
    };
  });

  // 项目内成员累计明细
  const memberCumulative = project.members.map(empId => {
    const emp = state.employees.find(e => e.id === empId);
    let cumulativePoints = 0;
    let publishedPoints = 0;
    let draftPoints = 0;

    for (const plan of plans) {
      const alloc = planAllocations(project, plan).find(a => a.employeeId === empId);
      if (alloc) {
        cumulativePoints += alloc.points;
        if (plan.status === 'published') publishedPoints += alloc.points;
        else draftPoints += alloc.points;
      }
    }

    const cumulativeRate = project.contract > 0
      ? Number((BigInt(cumulativePoints) * 10000n) / BigInt(project.contract))
      : 0;

    return {
      employeeId: empId,
      name: emp?.name || empId,
      department: emp?.department || '',
      group: emp?.group || '未分组',
      isOwner: project.owner === empId,
      cumulativePoints,
      publishedPoints,
      draftPoints,
      cumulativeRate,
      cumulativePct: pct(cumulativeRate),
      amountWan: (cumulativePoints / 1_000_000).toFixed(4),
    };
  });

  return {
    project,
    contract: project.contract,
    contractWan: wan(project.contract),
    // 历史项目额度
    isHistorical: historyCompletedAmount > 0 || historyCompletedRate > 0,
    historyCompletedAmount,
    historyCompletedAmountWan: wan(historyCompletedAmount),
    historyCompletedRate,
    historyCompletedPct: pct(historyCompletedRate),
    allocableAmount,
    allocableAmountWan: wan(allocableAmount),
    allocableRate,
    allocablePct: pct(allocableRate),
    grandTotalCompletedAmount,
    grandTotalCompletedAmountWan: wan(grandTotalCompletedAmount),
    grandTotalCompletedRate,
    grandTotalCompletedPct: pct(grandTotalCompletedRate),

    totalBudgetRate,
    totalBudgetPct: pct(totalBudgetRate),
    totalAllocatedAmount,
    totalAllocatedWan: wan(totalAllocatedAmount),
    publishedBudgetRate,
    publishedBudgetPct: pct(publishedBudgetRate),
    publishedAmount,
    publishedWan: wan(publishedAmount),
    draftBudgetRate,
    draftBudgetPct: pct(draftBudgetRate),
    draftAmount,
    draftWan: wan(draftAmount),
    remainingRate,
    remainingPct: pct(remainingRate),
    remainingAmount,
    remainingWan: wan(remainingAmount),
    completionPercentage: Number((totalBudgetRate / 100).toFixed(2)),
    monthlyBreakdown,
    memberCumulative,
  };
}

export function getMonthsBetween(startMonth: string, endMonth: string): string[] {
  if (!monthValid(startMonth) || !monthValid(endMonth)) return [];
  const [sY, sM] = startMonth.split('-').map(Number);
  const [eY, eM] = endMonth.split('-').map(Number);
  const result: string[] = [];
  let curY = sY, curM = sM;
  while (curY < eY || (curY === eY && curM <= eM)) {
    result.push(`${curY}-${String(curM).padStart(2, '0')}`);
    curM++;
    if (curM > 12) { curM = 1; curY++; }
  }
  return result;
}

// 获取项目起止周期内的完整月份清单（若结束日期待定或为空，默认推导 6 个月）
export function getProjectSpanMonths(startMonth: string, endMonth?: string, fallbackCount = 6): string[] {
  if (!startMonth || !monthValid(startMonth)) return [nowMonth()];
  if (endMonth && monthValid(endMonth) && endMonth >= startMonth) {
    return getMonthsBetween(startMonth, endMonth);
  }
  const result: string[] = [];
  let [curY, curM] = startMonth.split('-').map(Number);
  for (let i = 0; i < fallbackCount; i++) {
    result.push(`${curY}-${String(curM).padStart(2, '0')}`);
    curM++;
    if (curM > 12) { curM = 1; curY++; }
  }
  return result;
}

export type GenerateQuotaScheduleOptions = {
  biddingRate?: number;
  maintenanceRate?: number;
  state?: State;
};

// 自动生成项目周期额度规划策略模板（支持：前期争取与维保保留、防前期分光的稳健交付型、全周期平摊、中期攻坚型、同步实际平摊剩余）
export function generateProjectQuotaSchedule(
  project: Project,
  mode: 'deliverable_focused' | 'even' | 'middle_heavy' | 'sync_actual',
  stateOrOptions?: State | GenerateQuotaScheduleOptions
): ProjectMonthlyQuotaPlan[] {
  let state: State | undefined;
  let customBiddingRate: number | undefined;
  let customMaintenanceRate: number | undefined;

  if (stateOrOptions) {
    if ('projects' in stateOrOptions && 'plans' in stateOrOptions) {
      state = stateOrOptions as State;
    } else {
      const opts = stateOrOptions as GenerateQuotaScheduleOptions;
      state = opts.state;
      customBiddingRate = opts.biddingRate;
      customMaintenanceRate = opts.maintenanceRate;
    }
  }

  const months = getProjectSpanMonths(project.start, project.end);
  const totalAllocableRate = Math.max(0, SCALE - (project.historyCompletedRate || 0));
  const n = months.length;
  if (n === 0) return [];

  // 前期项目争取阶段：0-10% 可调，默认 5%
  const defaultBidding = totalAllocableRate > 0 ? Math.min(BIDDING_DEFAULT_RATE, Math.round(totalAllocableRate * 0.1)) : 0;
  const biddingRate = customBiddingRate !== undefined
    ? Math.max(0, Math.min(BIDDING_MAX_RATE, customBiddingRate))
    : defaultBidding;

  // 维保阶段（放置在最后，项目结束阶段）：保留 5% 额度
  const defaultMaint = totalAllocableRate >= MAINTENANCE_QUOTA_RATE ? MAINTENANCE_QUOTA_RATE : totalAllocableRate;
  const maintenanceRate = customMaintenanceRate !== undefined
    ? Math.max(0, Math.min(totalAllocableRate, customMaintenanceRate))
    : defaultMaint;

  if (n === 1) {
    return [{
      month: months[0],
      rate: totalAllocableRate,
      milestone: '全周期研制交付与维保',
      note: '集中考核（含交付验收与维保保留）',
      stageType: 'normal'
    }];
  }

  if (n === 2) {
    const early = Math.min(biddingRate, totalAllocableRate);
    const late = Math.max(0, totalAllocableRate - early);
    return [
      {
        month: months[0],
        rate: early,
        milestone: '前期项目争取阶段',
        note: '前期项目争取与客户方案对接（0-10%额度可调）',
        stageType: 'bidding'
      },
      {
        month: months[1],
        rate: late,
        milestone: '交付验收与维保阶段（项目结束）',
        note: '发货交付与项目结束阶段维保支持（保留5%额度）',
        stageType: 'maintenance'
      },
    ];
  }

  // n >= 3: 首月前期争取，末月末位维保保留5%，中间月份分配剩余研制交付额度
  const midAllocable = Math.max(0, totalAllocableRate - biddingRate - maintenanceRate);
  const midMonths = months.slice(1, n - 1);
  const midCount = midMonths.length;

  if (mode === 'sync_actual' && state) {
    const actualPlans = state.plans.filter(p => p.projectId === project.id);
    const actualMap = new Map(actualPlans.map(p => [p.month, p.budget]));
    let usedRate = 0;
    const futureMidMonths: string[] = [];

    // 首月（争取阶段）实际
    const m0 = months[0];
    const m0Actual = actualMap.get(m0);
    const m0Rate = m0Actual !== undefined ? m0Actual : biddingRate;
    usedRate += m0Rate;

    // 末月（维保阶段）实际
    const mLast = months[n - 1];
    const mLastActual = actualMap.get(mLast);
    const mLastRate = mLastActual !== undefined ? mLastActual : maintenanceRate;
    usedRate += mLastRate;

    // 中间月份
    for (const m of midMonths) {
      if (actualMap.has(m)) {
        usedRate += actualMap.get(m)!;
      } else {
        futureMidMonths.push(m);
      }
    }

    const remMidRate = Math.max(0, totalAllocableRate - usedRate);
    const fCount = futureMidMonths.length;
    const baseShare = fCount > 0 ? Math.floor(remMidRate / fCount) : 0;
    let remShare = fCount > 0 ? remMidRate - baseShare * fCount : 0;

    const res: ProjectMonthlyQuotaPlan[] = [];
    // 首月
    res.push({
      month: m0,
      rate: m0Rate,
      milestone: '前期项目争取阶段',
      note: m0Actual !== undefined ? '按系统已有分配实际同步' : '前期项目争取与客户方案对接（0-10%额度可调）',
      stageType: 'bidding'
    });
    // 中间月份
    for (const m of midMonths) {
      if (actualMap.has(m)) {
        res.push({
          month: m,
          rate: actualMap.get(m)!,
          milestone: '已执行阶段',
          note: '按系统已有分配实际同步',
          stageType: 'normal'
        });
      } else {
        let r = baseShare;
        if (remShare > 0) { r++; remShare--; }
        res.push({
          month: m,
          rate: r,
          milestone: '研制攻坚与交付阶段',
          note: '按剩余可用额度平摊',
          stageType: 'normal'
        });
      }
    }
    // 末月
    res.push({
      month: mLast,
      rate: mLastRate,
      milestone: '维保阶段（项目结束）',
      note: mLastActual !== undefined ? '按系统已有分配实际同步' : '项目结束阶段维保支持（保留5%额度）',
      stageType: 'maintenance'
    });
    return res;
  }

  // 稳健交付导向型（防前期把钱分完，重在交付验收）
  if (mode === 'deliverable_focused') {
    const res: ProjectMonthlyQuotaPlan[] = [];

    // 1. 首月：前期项目争取阶段
    res.push({
      month: months[0],
      rate: biddingRate,
      milestone: '前期项目争取阶段',
      note: '前期项目争取与客户方案对接（0-10%额度可调）',
      stageType: 'bidding'
    });

    // 2. 中间月份：主体研制与发货交付
    if (midCount === 1) {
      res.push({
        month: midMonths[0],
        rate: midAllocable,
        milestone: '核心部件攻坚、成品检验与发货交付',
        note: '主体交付阶段（保障有货有产出时有充裕额度分配）',
        stageType: 'normal'
      });
    } else if (midCount === 2) {
      const earlyPart = Math.round(midAllocable * 0.35);
      const latePart = midAllocable - earlyPart;
      res.push({
        month: midMonths[0],
        rate: earlyPart,
        milestone: '需求方案评审与核心部件攻坚',
        note: '前期研发阶段（严格控制消耗，防前期分完）',
        stageType: 'normal'
      });
      res.push({
        month: midMonths[1],
        rate: latePart,
        milestone: '整机综合联调、出厂检验与发货交付',
        note: '交付发货阶段（保障有货有产出时有充裕额度分配）',
        stageType: 'normal'
      });
    } else {
      const earlyCount = Math.max(1, Math.floor(midCount * 0.4));
      const lateCount = midCount - earlyCount;
      const earlyTotal = Math.round(midAllocable * 0.35);
      const lateTotal = midAllocable - earlyTotal;

      const earlyBase = Math.floor(earlyTotal / earlyCount);
      let earlyRem = earlyTotal - earlyBase * earlyCount;
      for (let i = 0; i < earlyCount; i++) {
        let r = earlyBase;
        if (earlyRem > 0) { r++; earlyRem--; }
        res.push({
          month: midMonths[i],
          rate: r,
          milestone: i === 0 ? '需求方案评审与系统架构设计' : '模块开发与单元调试',
          note: '前期研发阶段（严格控制消耗，防前期分完）',
          stageType: 'normal'
        });
      }

      const lateBase = Math.floor(lateTotal / lateCount);
      let lateRem = lateTotal - lateBase * lateCount;
      for (let i = 0; i < lateCount; i++) {
        let r = lateBase;
        if (lateRem > 0) { r++; lateRem--; }
        const isPenultimate = i === lateCount - 1;
        res.push({
          month: midMonths[earlyCount + i],
          rate: r,
          milestone: isPenultimate ? '成品检验、发货交付与用户验收' : '核心攻坚与整机试验验证',
          note: '交付发货阶段（保障有货有产出时有充裕额度分配）',
          stageType: 'normal'
        });
      }
    }

    // 3. 末月：维保阶段（放置在最后，项目结束阶段，保留 5% 额度）
    res.push({
      month: months[n - 1],
      rate: maintenanceRate,
      milestone: '维保阶段（项目结束）',
      note: '项目结束阶段维保支持（保留5%额度）',
      stageType: 'maintenance'
    });

    return res;
  }

  // 攻坚型或均摊型
  const res: ProjectMonthlyQuotaPlan[] = [];
  res.push({
    month: months[0],
    rate: biddingRate,
    milestone: '前期项目争取阶段',
    note: '前期项目争取与客户方案对接（0-10%额度可调）',
    stageType: 'bidding'
  });

  const base = Math.floor(midAllocable / midCount);
  let rem = midAllocable - base * midCount;
  for (let i = 0; i < midCount; i++) {
    let r = base;
    if (rem > 0) { r++; rem--; }
    res.push({
      month: midMonths[i],
      rate: r,
      milestone: mode === 'middle_heavy' ? `技术攻坚与系统联调（第${i + 1}阶段）` : `项目第 ${i + 2} 阶段研制与交付`,
      note: mode === 'middle_heavy' ? '中期攻坚研发' : '主体研制与交付',
      stageType: 'normal'
    });
  }

  res.push({
    month: months[n - 1],
    rate: maintenanceRate,
    milestone: '维保阶段（项目结束）',
    note: '项目结束阶段维保支持（保留5%额度）',
    stageType: 'maintenance'
  });

  return res;
}

// 获取项目全周期额度规划与实际执行全景透视数据
export function getProjectQuotaPerspective(state: State, projectId: string) {
  const project = state.projects.find(p => p.id === projectId);
  if (!project) return null;

  const actualPlans = state.plans.filter(p => p.projectId === projectId);
  const actualMap = new Map<string, { budget: number; status: 'draft' | 'published'; amount: number; note: string }>();
  for (const pl of actualPlans) {
    const amt = monthAmount(project, pl);
    actualMap.set(pl.month, { budget: pl.budget, status: pl.status, amount: amt, note: pl.note });
  }

  const schedule = project.quotaSchedule || [];
  const scheduleMap = new Map<string, ProjectMonthlyQuotaPlan>(schedule.map(s => [s.month, s]));

  const monthSet = new Set<string>();
  for (const m of getProjectSpanMonths(project.start, project.end)) monthSet.add(m);
  for (const s of schedule) monthSet.add(s.month);
  for (const p of actualPlans) monthSet.add(p.month);

  const sortedMonths = Array.from(monthSet).sort((a, b) => a.localeCompare(b));

  let cumPlanned = 0;
  let cumActual = 0;
  let overbudgetCount = 0;

  const monthRows = sortedMonths.map(month => {
    const planItem = scheduleMap.get(month);
    const plannedRate = planItem?.rate || 0;
    const plannedAmount = points(project.contract, plannedRate);

    const actualItem = actualMap.get(month);
    const actualRate = actualItem?.budget || 0;
    const actualAmount = actualItem?.amount || 0;
    const actualStatus = actualItem?.status || 'none';

    cumPlanned += plannedRate;
    cumActual += actualRate;

    const diffRate = actualRate - plannedRate; // > 0 意味着实际超额
    const isOver = plannedRate > 0 ? actualRate > plannedRate : actualRate > 0;
    if (isOver && actualRate > 0) overbudgetCount++;

    return {
      month,
      plannedRate,
      plannedPct: pct(plannedRate),
      plannedAmountWan: (plannedAmount / 1_000_000).toFixed(4),
      milestone: planItem?.milestone || '',
      note: planItem?.note || '',
      actualRate,
      actualPct: pct(actualRate),
      actualAmountWan: (actualAmount / 1_000_000).toFixed(4),
      actualStatus,
      actualNote: actualItem?.note || '',
      cumPlannedRate: cumPlanned,
      cumPlannedPct: pct(cumPlanned),
      cumActualRate: cumActual,
      cumActualPct: pct(cumActual),
      diffRate,
      diffPct: (diffRate > 0 ? '+' : '') + pct(diffRate),
      isOver,
    };
  });

  const totalPlannedRate = total(monthRows.map(r => r.plannedRate));
  const totalActualRate = total(monthRows.map(r => r.actualRate));
  const historyCompletedRate = project.historyCompletedRate || 0;
  const historyCompletedAmount = project.historyCompletedAmount || 0;

  const maxAllocableRate = Math.max(0, SCALE - historyCompletedRate);
  const remainingRate = Math.max(0, maxAllocableRate - totalActualRate);
  const remainingAmount = Math.max(0, project.contract - historyCompletedAmount - monthAmount(project, { budget: totalActualRate } as Plan));

  // 风险评估：透视前期把钱分完导致后续无钱可分配的风险
  const riskWarnings: string[] = [];
  let isFrontLoadedRisk = false;

  const totalMonths = sortedMonths.length;
  const currentM = nowMonth();
  const pastMonthsCount = sortedMonths.filter(m => m <= currentM).length;
  const timeProgressRate = totalMonths > 0 ? Math.round((pastMonthsCount * 10000) / totalMonths) : 0;
  const spendProgressRate = maxAllocableRate > 0 ? Math.round((totalActualRate * 10000) / maxAllocableRate) : 0;

  if (spendProgressRate > 7000 && timeProgressRate < 5000) {
    isFrontLoadedRisk = true;
    riskWarnings.push(`前期额度消耗过快风险：时间进度仅 ${pct(timeProgressRate)}，但已分配 ${pct(spendProgressRate)} 额度。后期交付发货阶段面临额度枯竭风险！`);
  }

  if (remainingRate < 1500 && sortedMonths.filter(m => m > currentM).length >= 2) {
    isFrontLoadedRisk = true;
    riskWarnings.push(`后期交付额度储备不足：后续剩余月份仅剩 ${pct(remainingRate)} (${wan(remainingAmount)} 万元)，建议控制前期月度分配节奏，确保发货交付时有钱可分！`);
  }

  if (overbudgetCount > 0) {
    riskWarnings.push(`共有 ${overbudgetCount} 个月份的实际分配额度超出了原定的月度规划值。`);
  }

  if (totalPlannedRate < maxAllocableRate) {
    riskWarnings.push(`全周期月度额度规划尚有 ${pct(maxAllocableRate - totalPlannedRate)} (${wan(points(project.contract, maxAllocableRate - totalPlannedRate))} 万元) 未安排月度规划。`);
  }

  return {
    project,
    contractWan: wan(project.contract),
    historyCompletedRate,
    historyCompletedPct: pct(historyCompletedRate),
    historyCompletedWan: wan(historyCompletedAmount),
    monthRows,
    totalPlannedRate,
    totalPlannedPct: pct(totalPlannedRate),
    totalPlannedWan: (points(project.contract, totalPlannedRate) / 1_000_000).toFixed(4),
    totalActualRate,
    totalActualPct: pct(totalActualRate),
    totalActualWan: (monthAmount(project, { budget: totalActualRate } as Plan) / 1_000_000).toFixed(4),
    remainingRate,
    remainingPct: pct(remainingRate),
    remainingWan: wan(remainingAmount),
    maxAllocableRate,
    maxAllocablePct: pct(maxAllocableRate),
    overbudgetCount,
    isFrontLoadedRisk,
    riskWarnings,
  };
}

// 导出项目周期额度规划与透视 CSV
export function exportProjectQuotaScheduleCsv(perspective: ReturnType<typeof getProjectQuotaPerspective>): string {
  if (!perspective) return '';
  const headers = [
    '工作令号',
    '项目名称',
    '规划月份',
    '阶段里程碑与交付目标',
    '规划分配比例(%)',
    '规划额度(万元)',
    '实际已分配比例(%)',
    '实际已分配额度(万元)',
    '分配状态',
    '累计规划比例(%)',
    '累计实际比例(%)',
    '执行偏差(%)',
    '规划说明与交付物'
  ];
  const rows = perspective.monthRows.map(r => [
    perspective.project.code,
    perspective.project.name,
    r.month,
    r.milestone || '阶段研制',
    (r.plannedRate / 100).toFixed(2),
    r.plannedAmountWan,
    (r.actualRate / 100).toFixed(2),
    r.actualAmountWan,
    r.actualStatus === 'published' ? '已发布' : r.actualStatus === 'draft' ? '草稿待发布' : '未分配',
    (r.cumPlannedRate / 100).toFixed(2),
    (r.cumActualRate / 100).toFixed(2),
    (r.diffRate / 100).toFixed(2),
    r.note || ''
  ]);
  return generateCsv(headers, rows);
}

// 解析项目额度规划 CSV 文本
export function parseProjectQuotaScheduleCsvText(csvText: string, project: Project): ProjectMonthlyQuotaPlan[] {
  const rows = parseCsv(csvText);
  if (rows.length === 0) return [];
  const firstRow = rows[0];
  let monthCol = -1, rateCol = -1, milestoneCol = -1, noteCol = -1;

  for (let i = 0; i < firstRow.length; i++) {
    const cell = firstRow[i].trim();
    if (/月份|月度|时间|周期/.test(cell) && monthCol === -1) monthCol = i;
    else if (/规划比例|分配比例|比例/.test(cell) && rateCol === -1) rateCol = i;
    else if (/里程碑|阶段|目标|任务/.test(cell) && milestoneCol === -1) milestoneCol = i;
    else if (/说明|备注|交付物|内容/.test(cell) && noteCol === -1) noteCol = i;
  }

  const result: ProjectMonthlyQuotaPlan[] = [];
  const dataRows = rows.slice(1);
  for (const row of dataRows) {
    if (!row || row.length === 0 || row.every(c => !c.trim())) continue;
    const rawMonth = monthCol !== -1 ? (row[monthCol] || '').trim() : '';
    const normMonth = normalizeMonthInput(rawMonth);
    if (!normMonth || !monthValid(normMonth)) continue;

    const rawRate = rateCol !== -1 ? (row[rateCol] || '').trim() : '';
    let parsedRate = 0;
    if (rawRate) {
      const num = parseFloat(rawRate.replace('%', '').trim());
      if (!isNaN(num)) parsedRate = Math.round(num * 100);
    }

    const milestone = milestoneCol !== -1 ? (row[milestoneCol] || '').trim() : '';
    const note = noteCol !== -1 ? (row[noteCol] || '').trim() : '';
    const stageType = getQuotaPlanStageType({ milestone, note });

    result.push({
      month: normMonth,
      rate: Math.max(0, Math.min(SCALE, parsedRate)),
      milestone,
      note,
      stageType,
    });
  }

  return result.sort((a, b) => a.month.localeCompare(b.month));
}
export function rangeReport(state: State, options: {
  startMonth?: string;
  endMonth?: string;
  months?: string[];
  group?: string;
  search?: string;
  status?: 'published' | 'all';
}) {
  const { startMonth, endMonth, months, group, search, status = 'published' } = options;

  let targetMonths: string[] = [];
  if (months && months.length > 0) {
    targetMonths = months;
  } else if (startMonth && endMonth) {
    targetMonths = getMonthsBetween(startMonth, endMonth);
  } else if (startMonth) {
    targetMonths = [startMonth];
  } else {
    targetMonths = Array.from(new Set(state.plans.map(p => p.month))).sort();
  }

  const filteredEmployees = state.employees.filter(emp => {
    if (group && group !== 'all' && emp.group !== group) return false;
    if (search && !(emp.name + emp.department + (emp.group || '')).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return filteredEmployees.map(employee => {
    const details = state.plans
      .filter(plan => targetMonths.includes(plan.month) && (status === 'all' || plan.status === 'published'))
      .flatMap(plan => {
        const project = state.projects.find(item => item.id === plan.projectId);
        if (!project) return [];
        const allocated = planAllocations(project, plan).find(row => row.employeeId === employee.id)?.points ?? 0;
        const entry = plan.entries.find(row => row.employeeId === employee.id);
        return allocated > 0 && entry ? [{
          projectId: project.id,
          project: project.name,
          code: project.code,
          month: plan.month,
          status: plan.status,
          budget: plan.budget,
          rate: entry.rate,
          points: allocated,
        }] : [];
      });

    const totalPoints = total(details.map(d => d.points));
    const projectCount = new Set(details.map(d => d.projectId)).size;
    const activeMonthsCount = new Set(details.map(d => d.month)).size;

    return {
      employee,
      details,
      points: totalPoints,
      projectCount,
      activeMonthsCount,
      targetMonths,
    };
  }).sort((left, right) => right.points - left.points);
}

// 需求5：评出月度之星，季度之星，年度之星
export function calculateStars(state: State, options: { year: string; quarter?: number; month?: string }) {
  const year = options.year || '2026';
  const month = options.month || `${year}-01`;
  const quarter = options.quarter || 1;

  // 1. 月度之星：该月绩点最高
  const monthReport = rangeReport(state, { months: [month], status: 'published' });
  const topMonthPoints = monthReport[0]?.points || 0;
  const monthStars = topMonthPoints > 0 ? monthReport.filter(r => r.points === topMonthPoints) : [];

  // 2. 季度之星：该季度三个月累计最高
  const qMonthsMap: Record<number, string[]> = {
    1: [`${year}-01`, `${year}-02`, `${year}-03`],
    2: [`${year}-04`, `${year}-05`, `${year}-06`],
    3: [`${year}-07`, `${year}-08`, `${year}-09`],
    4: [`${year}-10`, `${year}-11`, `${year}-12`],
  };
  const qMonths = qMonthsMap[quarter] || qMonthsMap[1];
  const quarterReport = rangeReport(state, { months: qMonths, status: 'published' });
  const topQuarterPoints = quarterReport[0]?.points || 0;
  const quarterStars = topQuarterPoints > 0 ? quarterReport.filter(r => r.points === topQuarterPoints) : [];

  // 3. 年度之星：整年度12个月累计最高
  const yearMonths = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
  const yearReport = rangeReport(state, { months: yearMonths, status: 'published' });
  const topYearPoints = yearReport[0]?.points || 0;
  const yearStars = topYearPoints > 0 ? yearReport.filter(r => r.points === topYearPoints) : [];

  return {
    year,
    month,
    quarter,
    monthStar: {
      month,
      stars: monthStars,
      topPoints: topMonthPoints,
      ranking: monthReport,
    },
    quarterStar: {
      year,
      quarter,
      months: qMonths,
      stars: quarterStars,
      topPoints: topQuarterPoints,
      ranking: quarterReport,
    },
    yearStar: {
      year,
      months: yearMonths,
      stars: yearStars,
      topPoints: topYearPoints,
      ranking: yearReport,
    },
  };
}

// 需求3 & 4：趋势图与柱状图数据生成
export function getProjectTrendData(state: State, projectId: string) {
  const detail = projectAllocDetail(state, projectId);
  if (!detail) return [];
  const project = detail.project;

  // 若结束日期未确定，动态推算时间轴（从开始月份至已有分配最大月份+3个月，或至少6个月）
  let allMonths: string[] = [];
  if (project.end && monthValid(project.end)) {
    allMonths = getMonthsBetween(project.start, project.end);
  } else {
    let latestMonth = project.start;
    const projectPlans = state.plans.filter(p => p.projectId === projectId);
    for (const pl of projectPlans) {
      if (pl.month > latestMonth) latestMonth = pl.month;
    }
    const [sy, sm] = project.start.split('-').map(Number);
    const [ly, lm] = latestMonth.split('-').map(Number);
    const monthsSpan = (ly - sy) * 12 + (lm - sm);
    const targetSpan = Math.max(5, monthsSpan + 3);
    let ey = sy;
    let em = sm + targetSpan;
    if (em > 12) {
      ey += Math.floor((em - 1) / 12);
      em = ((em - 1) % 12) + 1;
    }
    const targetEnd = `${ey}-${String(em).padStart(2, '0')}`;
    allMonths = getMonthsBetween(project.start, targetEnd);
  }

  if (!allMonths.length) return [];

  let runningBudgetRate = 0;
  let runningAmount = 0;

  return allMonths.map(month => {
    const plan = state.plans.find(p => p.projectId === projectId && p.month === month);
    const monthBudgetRate = plan ? plan.budget : 0;
    const monthAmt = plan ? monthAmount(project, plan) : 0;
    runningBudgetRate += monthBudgetRate;
    runningAmount += monthAmt;

    const remainingRate = Math.max(0, SCALE - runningBudgetRate);
    const remainingAmt = Math.max(0, project.contract - runningAmount);

    return {
      month,
      hasPlan: !!plan,
      status: plan?.status || 'none',
      monthlyRate: Number((monthBudgetRate / 100).toFixed(2)),
      cumulativeRate: Number((runningBudgetRate / 100).toFixed(2)),
      remainingRate: Number((remainingRate / 100).toFixed(2)),
      monthlyAmountWan: Number((monthAmt / 1_000_000).toFixed(4)),
      cumulativeAmountWan: Number((runningAmount / 1_000_000).toFixed(4)),
      remainingAmountWan: Number((remainingAmt / 1_000_000).toFixed(4)),
    };
  });
}

// 需求3：员工获得额度趋势图（支持按月追踪某员工的绩点与折合额度）
export function getEmployeeTrendData(state: State, employeeId: string, months: string[]) {
  const employee = state.employees.find(e => e.id === employeeId);
  if (!employee) return [];

  let cumulativePoints = 0;
  return months.map(month => {
    const publishedPlans = state.plans.filter(p => p.month === month && p.status === 'published');
    let monthPoints = 0;
    const projectContribs: { project: string; points: number; wan: number }[] = [];

    for (const plan of publishedPlans) {
      const project = state.projects.find(p => p.id === plan.projectId);
      if (!project) continue;
      const alloc = planAllocations(project, plan).find(r => r.employeeId === employeeId);
      if (alloc && alloc.points > 0) {
        monthPoints += alloc.points;
        projectContribs.push({
          project: project.name,
          points: alloc.points,
          wan: Number((alloc.points / 1_000_000).toFixed(4)),
        });
      }
    }

    cumulativePoints += monthPoints;
    return {
      month,
      points: Number((monthPoints / 100).toFixed(2)),
      wan: Number((monthPoints / 1_000_000).toFixed(4)),
      cumulativePoints: Number((cumulativePoints / 100).toFixed(2)),
      cumulativeWan: Number((cumulativePoints / 1_000_000).toFixed(4)),
      projectCount: projectContribs.length,
      contributions: projectContribs,
    };
  });
}

export function getMonthlyBarData(state: State, months: string[]) {
  return months.map(m => {
    const plans = state.plans.filter(p => p.month === m);
    let totalAmt = 0;
    let publishedAmt = 0;
    let draftAmt = 0;

    for (const plan of plans) {
      const prj = state.projects.find(p => p.id === plan.projectId);
      if (!prj) continue;
      const amt = monthAmount(prj, plan);
      totalAmt += amt;
      if (plan.status === 'published') publishedAmt += amt;
      else draftAmt += amt;
    }

    return {
      month: m,
      totalWan: Number((totalAmt / 1_000_000).toFixed(4)),
      publishedWan: Number((publishedAmt / 1_000_000).toFixed(4)),
      draftWan: Number((draftAmt / 1_000_000).toFixed(4)),
      planCount: plans.length,
    };
  });
}

export function getGroupMonthlyComparison(state: State, months: string[]) {
  return months.map(m => {
    const rep = report(state, m);
    const result: Record<string, any> = { month: m, '总体组': 0, '产品组': 0, '研发组': 0, '其他': 0, totalWan: 0 };
    for (const r of rep) {
      const grp = r.employee.group || '其他';
      const wanVal = Number((r.points / 1_000_000).toFixed(4));
      if (grp === '总体组') result['总体组'] += wanVal;
      else if (grp === '产品组') result['产品组'] += wanVal;
      else if (grp === '研发组') result['研发组'] += wanVal;
      else result['其他'] += wanVal;
      result.totalWan += wanVal;
    }
    result['总体组'] = Number(result['总体组'].toFixed(4));
    result['产品组'] = Number(result['产品组'].toFixed(4));
    result['研发组'] = Number(result['研发组'].toFixed(4));
    result['其他'] = Number(result['其他'].toFixed(4));
    result.totalWan = Number(result.totalWan.toFixed(4));
    return result;
  });
}

// 需求6：CSV 导入导出支持
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, '').trim();
  if (!clean) return [];
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const next = clean[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(cell.trim());
        cell = '';
      } else if (char === '\r' && next === '\n') {
        row.push(cell.trim());
        lines.push(row);
        row = [];
        cell = '';
        i++;
      } else if (char === '\n' || char === '\r') {
        row.push(cell.trim());
        lines.push(row);
        row = [];
        cell = '';
      } else {
        cell += char;
      }
    }
  }
  if (cell || row.length) {
    row.push(cell.trim());
    lines.push(row);
  }
  return lines;
}

export function generateCsv(headers: string[], rows: (string | number)[][]): string {
  const escapeCell = (val: string | number) => {
    const str = String(val ?? '');
    if (/[",\n\r]/.test(str) || /^[=+\-@\t\r]/.test(str)) {
      return `"${str.replaceAll('"', '""')}"`;
    }
    return str;
  };
  const body = [headers, ...rows].map(line => line.map(escapeCell).join(',')).join('\r\n');
  return `\uFEFF${body}`;
}

export function exportProjectsCsv(state: State): string {
  const headers = ['工作令号', '项目名称', '客户名称', '合同金额(万元)', '负责人', '开始月份', '结束月份', '状态', '已规划额度(万元)', '已规划比例', '剩余额度(万元)', '剩余比例', '成员名单'];
  const rows = state.projects.map(p => {
    const detail = projectAllocDetail(state, p.id);
    const ownerName = state.employees.find(e => e.id === p.owner)?.name || p.owner;
    const memberNames = p.members.map(mId => state.employees.find(e => e.id === mId)?.name || mId).join(';');
    return [
      p.code,
      p.name,
      p.client,
      wan(p.contract),
      ownerName,
      p.start,
      p.end || '待定',
      p.status === 'active' ? '进行中' : '已结项',
      detail ? detail.totalAllocatedWan : '0',
      detail ? detail.totalBudgetPct : '0%',
      detail ? detail.remainingWan : wan(p.contract),
      detail ? detail.remainingPct : '100%',
      memberNames,
    ];
  });
  return generateCsv(headers, rows);
}

export function exportProjectMembersCsv(state: State): string {
  const headers = ['工作令号', '项目名称', '成员姓名', '所属部门', '专业组', '是否负责人', '累计获得额度(万元)', '累计获得绩点', '累计占比'];
  const rows: (string | number)[][] = [];
  for (const p of state.projects) {
    const detail = projectAllocDetail(state, p.id);
    if (!detail) continue;
    for (const m of detail.memberCumulative) {
      rows.push([
        p.code,
        p.name,
        m.name,
        m.department,
        m.group,
        m.isOwner ? '是' : '否',
        m.amountWan,
        score(m.cumulativePoints),
        m.cumulativePct,
      ]);
    }
  }
  return generateCsv(headers, rows);
}

export function exportEmployeesCsv(state: State): string {
  const headers = ['序号', '姓名', '职务', '专业组', '专业组职务', '所属部门', '邮箱', '系统角色', '状态', '参与项目数'];
  const rows = state.employees.map((e, index) => [
    index + 1,
    e.name,
    e.position || '',
    e.group || '',
    e.groupRole || '',
    e.department,
    e.email || '',
    e.role === 'admin' ? '系统管理员' : '普通员工',
    e.active ? '启用' : '停用',
    state.projects.filter(p => p.members.includes(e.id)).length,
  ]);
  return generateCsv(headers, rows);
}

// 周期绩点报表明细矩阵 CSV 导出（按图2格式：序号、姓名、各个项目合同名称加工作令号、个人累加）
export function exportPeriodMatrixReportCsv(
  projects: Project[],
  rows: ReturnType<typeof rangeReport>,
  _periodLabel?: string
): string {
  const projectHeaders = projects.map(p => {
    if (p.code && !p.name.includes(p.code)) {
      return `${p.name} (${p.code})`;
    }
    return p.name;
  });

  const headers = ['序号', '姓名', ...projectHeaders, '个人累加'];

  const data = rows.map((r, index) => {
    const projectScores = projects.map(p => {
      const fen = r.details
        .filter(d => d.projectId === p.id || (p.code && d.code === p.code))
        .reduce((sum, d) => sum + d.points, 0);
      return (fen / 100).toFixed(2);
    });

    const totalScore = (r.points / 100).toFixed(2);

    return [
      index + 1,
      r.employee.name,
      ...projectScores,
      totalScore,
    ];
  });

  return generateCsv(headers, data);
}

export function exportPeriodReportCsv(
  rows: ReturnType<typeof rangeReport>,
  periodLabel: string,
  options?: { projects?: Project[]; state?: State }
): string {
  if (options?.projects || options?.state?.projects) {
    return exportPeriodMatrixReportCsv(options.projects || options.state!.projects, rows, periodLabel);
  }
  const headers = ['统计周期', '排名', '员工姓名', '职务', '专业组', '专业组职务', '所属部门', '贡献项目数', '获得总绩点', '折合总额度(万元)', '参与项目明细'];
  const data = rows.map((r, i) => {
    const detailStr = r.details.map(d => `${d.month}:${d.project}(${score(d.points)}绩点)`).join('; ');
    return [
      periodLabel,
      i + 1,
      r.employee.name,
      r.employee.position || '',
      r.employee.group || '',
      r.employee.groupRole || '',
      r.employee.department,
      r.projectCount,
      score(r.points),
      (r.points / 1_000_000).toFixed(4),
      detailStr,
    ];
  });
  return generateCsv(headers, data);
}

// 部门员工花名册 CSV 模板（标准列：序号、姓名、职务、专业组、专业组职务）
export function getEmployeeTemplateCsv(): string {
  const headers = ['序号', '姓名', '职务', '专业组', '专业组职务'];
  const examples = [
    ['1', '张三', '副所长,主任', '', ''],
    ['2', '李四', '副主任', '', ''],
    ['3', '王五', '主任助理', '总体组', '组长'],
    ['4', '赵六', '副总工程师', '研发组', '顾问'],
    ['5', '孙七', '研究员', '总体组', '顾问'],
    ['6', '周八', '高级工程师', '产品组', '组长'],
    ['7', '吴九', '工程师', '研发组', '组员'],
    ['8', '郑十', '助理工程师', '产品组', '组员'],
  ];
  return generateCsv(headers, examples);
}

// 项目台账数据 CSV 模板（标准列：序号、项目名称、合同金额、工作令号、开始日期、结束日期）
export function getProjectTemplateCsv(): string {
  const headers = ['序号', '项目名称', '合同金额', '工作令号', '开始日期', '结束日期'];
  const examples = [
    ['1', 'E1 S部', '130.90', '22-0128', '2026.9', '不确定'],
    ['2', 'E1 W部', '130.90', '22-0128', '2026.9', '不确定'],
    ['3', 'EA1 LDC', '316.82', '23-0181', '2026.9', '不确定'],
    ['4', 'EA1 S部', '137.59', '23-0181', '2026.9', '不确定'],
    ['5', 'EA1 W部', '137.59', '23-0181', '2026.9', '不确定'],
    ['6', 'EA2 LDC', '316.82', '23-0181', '2026.9', '不确定'],
    ['16', 'F1 S部', '134.12', '25-0183', '2026.9', '不确定'],
    ['21', 'EA5 LDC', '313.65', '25-0181', '2026.9', '不确定'],
    ['27', 'F1调试', '35.553', '26-0413', '2026.9', '不确定'],
    ['28', 'F2调试', '35.553', '26-0413', '2026.9', '不确定'],
  ];
  return generateCsv(headers, examples);
}

export function normalizeMonthInput(val: string | undefined | null): string {
  if (!val) return '';
  const str = String(val).trim();
  if (!str) return '';
  if (/^[-—/\\~]+$/.test(str) || /待定|不确定|暂无|暂未|持续|推进|长期|未定/.test(str)) {
    return '';
  }
  const match = str.match(/^(20\d{2})[-/.年\s]*(0?[1-9]|1[0-2])(?:[-/.月日\s]*\d{1,2})?/);
  if (match) {
    const y = match[1];
    const m = match[2].padStart(2, '0');
    return `${y}-${m}`;
  }
  return '';
}

// 解析项目 CSV（支持：序号、项目名称、合同金额、工作令号、开始日期、结束日期，可自动容错表头与多子项目同令号）
export function parseProjectCsvText(csvText: string, state?: State) {
  const rows = parseCsv(csvText);
  if (rows.length === 0) return [];

  const firstRow = rows[0];
  let nameCol = -1, codeCol = -1, contractCol = -1, ownerCol = -1, startCol = -1, endCol = -1, clientCol = -1, membersCol = -1;

  for (let i = 0; i < firstRow.length; i++) {
    const cell = firstRow[i].trim();
    if (/^序号$|^编号$|^id$/i.test(cell) && nameCol === -1 && codeCol === -1) {
      continue; // 跳过纯序号列
    }
    if (/项目名[称陈]|名称/.test(cell) && nameCol === -1) nameCol = i;
    else if (/工作令号|令号|项目编号|任务单号/.test(cell) && codeCol === -1) codeCol = i;
    else if (/合同金额|合同总额|金额/.test(cell) && contractCol === -1) contractCol = i;
    else if (/项目负责人|负责人|项目经理/.test(cell) && ownerCol === -1) ownerCol = i;
    else if (/开始[日期月份时间]|启动[日期月份时间]/.test(cell) && startCol === -1) startCol = i;
    else if (/结束[日期月份时间]|截止[日期月份时间]|交付[日期月份时间]|完成[日期月份时间]/.test(cell) && endCol === -1) endCol = i;
    else if (/客户[名称主体]?|发包方|委托方/.test(cell) && clientCol === -1) clientCol = i;
    else if (/项目组成员|成员[名单姓名列表]?/.test(cell) && membersCol === -1) membersCol = i;
  }

  let dataRows = rows;
  const hasHeader = nameCol !== -1 || codeCol !== -1 || contractCol !== -1;
  if (hasHeader) {
    dataRows = rows.slice(1);
  } else {
    // 兼容工作令格式（无表头或纯数据行）：序号(0), 项目名称(1), 合同金额(2), 工作令号(3), 开始日期(4), 结束日期(5)
    if (firstRow.length >= 6 && /^\d+$/.test(firstRow[0].trim())) {
      nameCol = 1;
      contractCol = 2;
      codeCol = 3;
      startCol = 4;
      endCol = 5;
    } else {
      // 默认按 6 列顺序：项目名称、工作令号、合同金额、项目负责人、开始日期、结束日期
      nameCol = 0;
      codeCol = 1;
      contractCol = 2;
      ownerCol = 3;
      startCol = 4;
      endCol = 5;
    }
  }

  // Fallback defaults
  if (nameCol === -1) nameCol = 1;
  if (contractCol === -1) contractCol = 2;
  if (codeCol === -1) codeCol = 3;
  if (startCol === -1) startCol = 4;
  if (endCol === -1) endCol = 5;

  const results: {
    code: string;
    name: string;
    client: string;
    contract: number;
    owner: string;
    ownerName: string;
    start: string;
    end: string;
    members: string[];
  }[] = [];

  // 获取默认项目负责人（优先选用管理人员或首位员工）
  const defaultEmployee = state?.employees.find(e => e.role === 'admin' && e.active) || state?.employees.find(e => e.active);

  for (const row of dataRows) {
    if (!row || row.length === 0 || row.every(c => !c.trim())) continue;
    const rawName = nameCol !== -1 ? (row[nameCol] || '').trim() : '';
    const rawCode = codeCol !== -1 ? (row[codeCol] || '').trim() : '';
    if (!rawName && !rawCode) continue;

    const rawContract = contractCol !== -1 ? (row[contractCol] || '') : '';
    const rawOwner = ownerCol !== -1 ? (row[ownerCol] || '').trim() : '';
    const rawStart = startCol !== -1 ? (row[startCol] || '') : '';
    const rawEnd = endCol !== -1 ? (row[endCol] || '') : '';
    const rawClient = clientCol !== -1 ? (row[clientCol] || '').trim() : '';
    const rawMembers = membersCol !== -1 ? (row[membersCol] || '').trim() : '';

    const name = rawName || rawCode;
    const code: string = rawCode || `WO-${nowMonth().replace('-', '')}-${String(results.length + 1).padStart(3, '0')}`;
    const cleanAmt = rawContract.replace(/[^\d.]/g, '');
    const contract = cleanAmt ? toMoney(cleanAmt) : 10_000_000;

    let start = normalizeMonthInput(rawStart);
    if (!start) start = nowMonth();
    const end = normalizeMonthInput(rawEnd);

    let ownerId = '';
    let ownerName = rawOwner;
    if (!ownerName) {
      ownerName = defaultEmployee?.name || '管理员';
      ownerId = defaultEmployee?.id || 'admin';
    } else if (state) {
      const matchEmp = state.employees.find(e => e.name === ownerName || e.id === ownerName);
      if (matchEmp) {
        ownerId = matchEmp.id;
        ownerName = matchEmp.name;
      }
    }

    const members: string[] = [];
    if (ownerId) members.push(ownerId);

    if (rawMembers) {
      const parts = rawMembers.split(/[,;，；|]/).map(s => s.trim()).filter(Boolean);
      for (const p of parts) {
        if (state) {
          const emp = state.employees.find(e => e.name === p || e.id === p);
          if (emp && !members.includes(emp.id)) members.push(emp.id);
          else if (!emp && !members.includes(p)) members.push(p);
        } else if (!members.includes(p)) {
          members.push(p);
        }
      }
    }

    results.push({
      code,
      name,
      client: rawClient,
      contract,
      owner: ownerId,
      ownerName,
      start,
      end,
      members,
    });
  }
  return results;
}

// 解析部门员工花名册 CSV（支持：序号、姓名、职务、专业组、专业组职务，并智能推断部门与角色）
export function parseEmployeeCsvText(csvText: string) {
  const rows = parseCsv(csvText);
  if (rows.length === 0) return [];

  const firstRow = rows[0];
  let nameCol = -1, posCol = -1, grpCol = -1, grpRoleCol = -1, deptCol = -1, emailCol = -1, roleCol = -1;

  for (let i = 0; i < firstRow.length; i++) {
    const cell = firstRow[i].trim();
    if (/^序号$|^编号$|^id$/i.test(cell) && nameCol === -1) {
      continue; // 跳过序号列
    }
    if (/姓名|员工姓名|名字/.test(cell) && nameCol === -1) nameCol = i;
    else if (/^职务$|^岗位$|^职位$|^职称$/.test(cell) && posCol === -1) posCol = i;
    else if (/^专业组$|^所属专业组$|^分组$/.test(cell) && grpCol === -1) grpCol = i;
    else if (/专业组职务|组内职务|专业职务|组内角色/.test(cell) && grpRoleCol === -1) grpRoleCol = i;
    else if (/部门|所属部门|科室/.test(cell) && deptCol === -1) deptCol = i;
    else if (/邮箱|邮件|email/i.test(cell) && emailCol === -1) emailCol = i;
    else if (/角色|权限|系统角色/.test(cell) && roleCol === -1) roleCol = i;
  }

  let dataRows = rows;
  const hasHeader = nameCol !== -1 || posCol !== -1 || grpCol !== -1;
  if (hasHeader) {
    dataRows = rows.slice(1);
  } else {
    // 兼容花名册格式（无表头或纯数据行）：序号(0), 姓名(1), 职务(2), 专业组(3), 专业组职务(4)
    if (firstRow.length >= 5 && /^\d+$/.test(firstRow[0].trim())) {
      nameCol = 1;
      posCol = 2;
      grpCol = 3;
      grpRoleCol = 4;
    } else {
      nameCol = 0;
      deptCol = 1;
      grpCol = 2;
      emailCol = 3;
      roleCol = 4;
    }
  }

  if (nameCol === -1) nameCol = 1;
  if (posCol === -1) posCol = 2;
  if (grpCol === -1) grpCol = 3;
  if (grpRoleCol === -1) grpRoleCol = 4;

  const results: {
    name: string;
    position: string;
    group: string;
    groupRole: string;
    department: string;
    email: string;
    role: 'admin' | 'member';
  }[] = [];

  for (const row of dataRows) {
    if (!row || row.length === 0 || row.every(c => !c.trim())) continue;
    const rawName = nameCol !== -1 ? (row[nameCol] || '').trim() : '';
    if (!rawName) continue;

    let rawPos = posCol !== -1 ? (row[posCol] || '').trim() : '';
    let offset = 0;
    // 兼容未经引号包裹的中文逗号拆分（如 副所长,主任）
    if (row.length > firstRow.length && posCol !== -1 && row[posCol + 1] && /主任|所长|总工|助理|顾问/.test(row[posCol + 1])) {
      rawPos = `${rawPos},${row[posCol + 1].trim()}`;
      offset = 1;
    }

    const rawGrp = grpCol !== -1 ? (row[grpCol + offset] || '').trim() : '';
    const rawGrpRole = grpRoleCol !== -1 ? (row[grpRoleCol + offset] || '').trim() : '';
    let rawDept = deptCol !== -1 ? (row[deptCol + offset] || '').trim() : '';
    const rawEmail = emailCol !== -1 ? (row[emailCol + offset] || '').trim().toLowerCase() : '';
    const rawRole = roleCol !== -1 ? (row[roleCol + offset] || '').trim() : '';

    // 智能推断部门（如果表格中无部门列）
    if (!rawDept) {
      if (rawGrp.includes('总体组') && rawGrp.includes('产品组')) rawDept = '总体产品部';
      else if (rawGrp.includes('产品组') && rawGrp.includes('研发组')) rawDept = '产品研发部';
      else if (rawGrp.includes('总体组')) rawDept = '总体部';
      else if (rawGrp.includes('产品组')) rawDept = '产品部';
      else if (rawGrp.includes('研发组')) rawDept = '研发中心';
      else if (/所长|主任|助理/.test(rawPos)) rawDept = '领导班子';
      else if (/核算|财务/.test(rawPos)) rawDept = '核算员';
      else rawDept = '综合部';
    }

    const isAdmin = rawRole.includes('管理') || /所长|主任|核算|admin/i.test(rawPos);

    results.push({
      name: rawName,
      position: rawPos,
      group: rawGrp,
      groupRole: rawGrpRole,
      department: rawDept,
      email: rawEmail,
      role: isAdmin ? 'admin' : 'member',
    });
  }

  return results;
}

export function report(state: State, month: string) {
  return state.employees.map(employee => {
    const details = state.plans.filter(plan => plan.month === month && plan.status === 'published').flatMap(plan => {
      const project = state.projects.find(item => item.id === plan.projectId)!;
      const allocated = planAllocations(project, plan).find(row => row.employeeId === employee.id)?.points ?? 0;
      const entry = plan.entries.find(row => row.employeeId === employee.id);
      return allocated > 0 && entry ? [{ project: project.name, code: project.code, budget: plan.budget, rate: entry.rate, points: allocated }] : [];
    });
    return { employee, details, points: total(details.map(detail => detail.points)) };
  }).sort((left, right) => right.points - left.points);
}

export function demoState(): State {
  const state: State = {
    employees: [
      { id: 'admin', name: '管理员', department: '综合管理部', group: '总体组', position: '系统管理员', email: 'admin@topfire.com', role: 'admin', active: true },
      { id: 'jia', name: '甲', department: '总体部', group: '总体组', email: '', role: 'member', active: true },
      { id: 'yi', name: '乙', department: '研发中心', group: '研发组', email: '', role: 'member', active: true },
      { id: 'bing', name: '丙', department: '产品部', group: '产品组', email: '', role: 'member', active: true },
    ],
    projects: [{ id: 'project-a', code: 'A-2026-001', name: '项目A', client: '示例客户', contract: 120_000_000, owner: 'jia', start: '2026-01', end: '2026-03', status: 'active', members: ['jia', 'yi', 'bing'] }],
    plans: [
      { id: 'a-01', projectId: 'project-a', month: '2026-01', budget: 3333, entries: [{ employeeId: 'jia', rate: 4000 }, { employeeId: 'yi', rate: 3500 }, { employeeId: 'bing', rate: 2500 }], status: 'published', note: '需求调研与总体设计' },
      { id: 'a-02', projectId: 'project-a', month: '2026-02', budget: 3333, entries: [{ employeeId: 'jia', rate: 4500 }, { employeeId: 'yi', rate: 3000 }, { employeeId: 'bing', rate: 2500 }], status: 'published', note: '研发原型交付与客户评审' },
      { id: 'a-03', projectId: 'project-a', month: '2026-03', budget: 3334, entries: [{ employeeId: 'jia', rate: 5000 }, { employeeId: 'yi', rate: 2500 }, { employeeId: 'bing', rate: 2500 }], status: 'draft', note: '项目最终集成与上线验收' },
    ], audit: [],
  };
  validate(state); return state;
}

export type BackupData = {
  version: string;
  system: string;
  exportedAt: string;
  summary: {
    projectCount: number;
    employeeCount: number;
    planCount: number;
    publishedPlanCount: number;
    auditCount: number;
    projectGroupCount?: number;
    configCount?: number;
  };
  state: State;
  projectGroups?: ProjectGroup[];
  workspaceName?: string;
  configs?: Record<string, any>;
};

export function exportFullBackupJson(
  state: State,
  optionsOrGroups?: {
    projectGroups?: ProjectGroup[];
    workspaceName?: string;
    configs?: Record<string, any>;
  } | ProjectGroup[]
): string {
  validate(state);
  const options = Array.isArray(optionsOrGroups)
    ? { projectGroups: optionsOrGroups }
    : (optionsOrGroups || {});
  const projectGroups = Array.isArray(options.projectGroups) ? options.projectGroups : [];

  const backup: BackupData = {
    version: '1.1.0',
    system: '衡绩员工绩点考核系统',
    exportedAt: new Date().toISOString(),
    summary: {
      projectCount: state.projects.length,
      employeeCount: state.employees.length,
      planCount: state.plans.length,
      publishedPlanCount: state.plans.filter(p => p.status === 'published').length,
      auditCount: state.audit.length,
      projectGroupCount: projectGroups.length,
      configCount: 1,
    },
    state,
    projectGroups,
    workspaceName: options.workspaceName || '',
    configs: options.configs || {},
  };
  return JSON.stringify(backup, null, 2);
}

export function parseAndValidateBackupJson(jsonStr: string): BackupData {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    fail('备份文件格式损坏，非合法的 JSON 数据');
  }
  if (!parsed || typeof parsed !== 'object') fail('备份文件内容无效');
  const targetState: State = parsed.state || parsed;
  if (!Array.isArray(targetState.employees) || !Array.isArray(targetState.projects) || !Array.isArray(targetState.plans)) {
    fail('备份文件缺少必要的业务模块数据（员工、项目或月度分配）');
  }
  validate(targetState);

  const projectGroups: ProjectGroup[] = Array.isArray(parsed.projectGroups)
    ? parsed.projectGroups
    : (Array.isArray(parsed.groups) ? parsed.groups : []);

  return {
    version: parsed.version || '1.1.0',
    system: parsed.system || '衡绩员工绩点考核系统',
    exportedAt: parsed.exportedAt || new Date().toISOString(),
    summary: {
      projectCount: targetState.projects.length,
      employeeCount: targetState.employees.length,
      planCount: targetState.plans.length,
      publishedPlanCount: targetState.plans.filter((p: any) => p.status === 'published').length,
      auditCount: Array.isArray(targetState.audit) ? targetState.audit.length : 0,
      projectGroupCount: projectGroups.length,
      configCount: parsed.configs ? Object.keys(parsed.configs).length : 1,
    },
    state: targetState,
    projectGroups,
    workspaceName: typeof parsed.workspaceName === 'string' ? parsed.workspaceName : '',
    configs: parsed.configs || {},
  };
}

// -------------------------------------------------------------
// 系统版本、更新历史与开发作者
// -------------------------------------------------------------
export const APP_VERSION = '0.4.0';
export const APP_BUILD = '20261018';
export const APP_AUTHOR = '邹富敦 (Phudon Zou) / TOPFIRE 研发团队';
export const APP_CONTACT = 'zoufudun@163.com';

export type VersionUpdate = {
  version: string;
  date: string;
  tag: '重大更新' | '功能增强' | '安全优化' | '常规迭代';
  title: string;
  items: string[];
};

export const UPDATE_HISTORY: VersionUpdate[] = [
  {
    version: 'v0.4.0',
    date: '2026-10-18',
    tag: '重大更新',
    title: '全周期额度规划升级与弹窗防误触保护',
    items: [
      '【弹窗防误触保护】全局弹窗底层交互优化：点击弹窗遮罩外部背景不再误退出，必须通过右上角关闭按钮或取消退出，彻底避免填写的数据和额度规划意外丢失。',
      '【前期项目争取阶段】月度额度规划首月/前期新增“前期项目争取阶段”（0-10% 额度可调），规范前期商务与技术对接，严格防范前期过度分光。',
      '【维保阶段保留5%】月度额度规划置底新增“维保阶段（项目结束）”，锁定并保留 5% 额度，保障项目终检验收后的质保维保与售后技术支持。',
      '【智能排期算法升级】“稳健交付型”算法原生集成前期争取（0-10%可调）与项目结束维保保留（5%），主体研制阶段平稳过渡，发货交付大头保障。',
      '【快捷配置与追加】规划弹窗提供一键设为前期争取/维保阶段、快捷追加前期或维保月份，并在底部汇总栏直观展示争取阶段、维保阶段与中间研制占比。'
    ]
  },
  {
    version: 'v0.3.0',
    date: '2026-10-18',
    tag: '重大更新',
    title: '全周期额度规划与灾备加密体系',
    items: [
      '【全周期额度规划】支持按项目起止周期对各月份建立预期分配比例、金额与阶段里程碑（如方案评审、初样研制、试验联调、成品发货交付验收）。',
      '【防前期透支策略】新增“🎯稳健交付型（前低后高）”智能排期算法，锁定 45%+ 额度在后期发货交付，杜绝前期把钱分完。',
      '【全景透视走势图】提供月度规划 vs 实际消耗双柱对比图、累计消耗折线图及发货交付储备金监控。',
      '【月度分配表单联动】在月度绩效分配表单中实时展示当月规划与节点交付物，支持“⚡ 一键套用规划额度”，超支时自动弹出风险预警。',
      '【灾备数据高强度加密】全量系统灾备快照升级为企业级 AES-256-GCM + PBKDF2 加密保护，导出时设置密钥，导入时必须输入权限口令方可解密。',
      '【关于与版本历史】新增系统关于面板、开发作者信息与完整版本演进历史。',
      '【缺陷修复】修复额度规划弹窗中 points 函数引用报错。'
    ]
  },
  {
    version: 'v0.2.0',
    date: '2026-10-17',
    tag: '重大更新',
    title: '多团队架构、参考区间与全量灾备',
    items: [
      '【专业组体系】全面打通总体组、产品组、研发组等多专业组架构，支持项目组多模版管理与一键批量配置成员比例。',
      '【柔性管理规则】项目负责人分配率由硬性强校验变更为参考区间，支持灵活超出并给出合理诊断提示。',
      '【管理员自由切换】支持在在职员工列表中自由设置/移交系统管理员，并在顶部栏实时同步。',
      '【二维矩阵报表】周期绩效报表支持按各项目合同名称加工作令号导出二维矩阵格式 CSV。',
      '【代码去内置化】彻底清理源码中预设员工姓名，改为支持全量花名册一键导入与初始化。'
    ]
  },
  {
    version: 'v0.1.0',
    date: '2026-10-16',
    tag: '常规迭代',
    title: '离线版系统发布与核心绩点引擎',
    items: [
      '【离线优先架构】支持 Windows 单文件便携版运行，支持创建 .hengji 加密安全工作区，数据全本地存储。',
      '【精准绩点折合】合同金额以分存储、支持 6 位小数万元换算，最大余数补差法精确保全成员绩点。',
      '【多维度考核与荣誉】支持月度之星、季度之星与年度之星自动评定，支持项目消耗趋势分析。'
    ]
  }
];

// -------------------------------------------------------------
// 企业级全量灾备快照 AES-256-GCM 高强度加密与权限解密
// -------------------------------------------------------------
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveKeyWebCrypto(password: string, salt: Uint8Array, iterations = 100000): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function exportEncryptedBackupJson(
  state: State,
  password: string,
  optionsOrGroups?: { projectGroups?: ProjectGroup[]; workspaceName?: string; configs?: Record<string, any> } | ProjectGroup[]
): Promise<string> {
  if (!password || !password.trim()) {
    fail('请设置灾备数据加密口令（权限密钥）');
  }
  const rawBackupJson = exportFullBackupJson(state, optionsOrGroups);
  const enc = new TextEncoder();
  const plaintext = enc.encode(rawBackupJson);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyWebCrypto(password.trim(), salt, 100000);
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );
  const ciphertext = new Uint8Array(ciphertextBuffer);

  const encryptedEnvelope = {
    format: 'hengji-encrypted-backup',
    version: '2.0.0',
    system: '衡绩员工绩点考核系统',
    kdf: 'PBKDF2-SHA256',
    iterations: 100000,
    encrypted: true,
    salt: uint8ToBase64(salt),
    iv: uint8ToBase64(iv),
    data: uint8ToBase64(ciphertext),
    exportedAt: new Date().toISOString(),
    summary: {
      projectCount: state.projects.length,
      employeeCount: state.employees.length,
      planCount: state.plans.length,
    },
    note: '企业级AES-256-GCM加密灾备快照，需输入口令解密还原'
  };
  return JSON.stringify(encryptedEnvelope, null, 2);
}

export async function parseAndDecryptBackupJson(fileContent: string, password?: string): Promise<BackupData> {
  let parsed: any;
  try {
    parsed = JSON.parse(fileContent);
  } catch {
    fail('备份文件格式损坏，非合法的 JSON 数据');
  }

  // If this is an encrypted backup
  if (parsed && parsed.format === 'hengji-encrypted-backup' && parsed.encrypted) {
    if (!password || !password.trim()) {
      fail('该灾备快照已启用高强度加密，请输入解密口令');
    }
    try {
      const salt = base64ToUint8(parsed.salt);
      const iv = base64ToUint8(parsed.iv);
      const ciphertext = base64ToUint8(parsed.data);
      const iterations = parsed.iterations || 100000;
      const key = await deriveKeyWebCrypto(password.trim(), salt, iterations);
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        ciphertext
      );
      const dec = new TextDecoder();
      const rawJson = dec.decode(decryptedBuffer);
      return parseAndValidateBackupJson(rawJson);
    } catch (e: any) {
      if (e.message && e.message.includes('备份文件')) throw e;
      fail('灾备解密失败：权限口令错误或备份文件已被篡改！');
    }
  }

  // If unencrypted legacy backup
  return parseAndValidateBackupJson(fileContent);
}

export function isEncryptedBackup(fileContent: string): boolean {
  try {
    const parsed = JSON.parse(fileContent);
    return Boolean(parsed && parsed.format === 'hengji-encrypted-backup' && parsed.encrypted);
  } catch {
    return false;
  }
}


// 需求5：常用项目组与项目组成员 CSV 导入
export function getProjectMemberTemplateCsv(): string {
  const headers = ['员工姓名', '专业组', '职务/角色', '部门', '备注'];
  const examples = [
    ['张三', '总体组', '主任', '总体部', '项目总负责'],
    ['李四', '总体组', '研究员', '总体部', '总体架构设计'],
    ['王五', '产品组', '高级工程师', '产品部', '产品业务规划'],
    ['赵六', '研发组', '工程师', '研发中心', '核心算法研发'],
    ['孙七', '产品组,研发组', '工程师', '产品研发部', '软硬件集成'],
  ];
  return generateCsv(headers, examples);
}

export function parseProjectMemberCsvText(csvText: string, stateOrEmployees: State | Employee[]): {
  memberIds: string[];
  newEmployees: Employee[];
  memberNames: string[];
} {
  const employees = Array.isArray(stateOrEmployees) ? stateOrEmployees : (stateOrEmployees?.employees || []);
  const rows = parseCsv(csvText);
  if (rows.length === 0) return { memberIds: [], newEmployees: [], memberNames: [] };
  const firstRow = rows[0];
  let nameCol = -1, groupCol = -1, positionCol = -1, deptCol = -1;
  for (let i = 0; i < firstRow.length; i++) {
    const cell = firstRow[i].trim();
    if (/^序号$|^编号$|^id$/i.test(cell) && nameCol === -1) continue;
    if (/姓名|员工|成员/.test(cell) && nameCol === -1) nameCol = i;
    else if (/专业组|分组|组别/.test(cell) && groupCol === -1) groupCol = i;
    else if (/职务|岗位|角色|职称/.test(cell) && positionCol === -1) positionCol = i;
    else if (/部门|科室/.test(cell) && deptCol === -1) deptCol = i;
  }
  let dataRows = rows;
  if (nameCol !== -1) {
    dataRows = rows.slice(1);
  } else {
    nameCol = 0;
    if (firstRow.length > 1) groupCol = 1;
    if (firstRow.length > 2) positionCol = 2;
    if (firstRow.length > 3) deptCol = 3;
    dataRows = rows;
  }

  const memberIds: string[] = [];
  const memberNames: string[] = [];
  const newEmployees: Employee[] = [];

  for (const row of dataRows) {
    if (!row || row.length === 0 || row.every(c => !c.trim())) continue;
    const rawName = nameCol !== -1 ? (row[nameCol] || '').trim() : '';
    if (!rawName || rawName === '姓名' || rawName === '员工姓名') continue;
    const rawGroup = groupCol !== -1 ? (row[groupCol] || '').trim() : '';
    const rawPos = positionCol !== -1 ? (row[positionCol] || '').trim() : '';
    const rawDept = deptCol !== -1 ? (row[deptCol] || '').trim() : '';

    const existing = employees.find(e => e.name === rawName || e.id === rawName);
    if (existing) {
      if (!memberIds.includes(existing.id)) {
        memberIds.push(existing.id);
        memberNames.push(existing.name);
      }
    } else {
      const newId = `emp_${crypto.randomUUID().slice(0, 8)}`;
      const newEmp: Employee = {
        id: newId,
        name: rawName,
        department: rawDept || (rawGroup.includes('总体') ? '总体部' : rawGroup.includes('产品') ? '产品部' : '研发中心'),
        group: rawGroup || '总体组',
        position: rawPos || '工程师',
        groupRole: rawPos.includes('组长') ? '组长' : rawPos.includes('副组长') ? '副组长' : rawPos.includes('顾问') ? '顾问' : '组员',
        email: '',
        role: 'member',
        active: true,
      };
      newEmployees.push(newEmp);
      memberIds.push(newId);
      memberNames.push(rawName);
    }
  }
  return { memberIds, newEmployees, memberNames };
}

// 需求3/4：月度成员分配比例与工作内容 CSV 模版与解析
export function getPlanMemberTemplateCsv(): string {
  const headers = ['员工姓名', '当月分配比例(%)', '当月工作内容描述', '专业组', '部门'];
  const examples = [
    ['张三', '30', '主导系统核心通信架构与关键性能调优', '研发组', '研发中心'],
    ['李四', '25', '负责数据解析算法研发与接口联调', '研发组', '研发中心'],
    ['王五', '20', '总体技术指标拆解与需求方案评审', '总体组', '总体部'],
    ['赵六', '15', '参与单元集成测试与软硬件可靠性验证', '总体组', '总体部'],
    ['孙七', '10', '产品需求梳理与用户使用手册编制', '产品组', '产品部'],
  ];
  return generateCsv(headers, examples);
}

export function parsePlanMemberCsvText(csvText: string, stateOrEmployees: State | Employee[]): {
  entries: { employeeId: string; rate: number; workContent: string }[];
  memberNames: string[];
  newEmployees: Employee[];
} {
  const employees = Array.isArray(stateOrEmployees) ? stateOrEmployees : (stateOrEmployees?.employees || []);
  const rows = parseCsv(csvText);
  if (rows.length === 0) return { entries: [], memberNames: [], newEmployees: [] };
  const firstRow = rows[0];
  let nameCol = -1, rateCol = -1, workCol = -1, groupCol = -1, deptCol = -1;
  for (let i = 0; i < firstRow.length; i++) {
    const cell = firstRow[i].trim();
    if (/姓名|员工|成员/.test(cell) && nameCol === -1) nameCol = i;
    else if (/比例|额度比例|分配比例/.test(cell) && rateCol === -1) rateCol = i;
    else if (/工作内容|工作描述|任务|职责|内容/.test(cell) && workCol === -1) workCol = i;
    else if (/专业组|分组/.test(cell) && groupCol === -1) groupCol = i;
    else if (/部门|科室/.test(cell) && deptCol === -1) deptCol = i;
  }
  let dataRows = rows;
  if (nameCol !== -1) {
    dataRows = rows.slice(1);
  } else {
    nameCol = 0;
    if (firstRow.length > 1) rateCol = 1;
    if (firstRow.length > 2) workCol = 2;
    dataRows = rows;
  }

  const entries: { employeeId: string; rate: number; workContent: string }[] = [];
  const memberNames: string[] = [];
  const newEmployees: Employee[] = [];

  for (const row of dataRows) {
    if (!row || row.length === 0 || row.every(c => !c.trim())) continue;
    const rawName = nameCol !== -1 ? (row[nameCol] || '').trim() : '';
    if (!rawName || rawName === '姓名' || rawName === '员工姓名') continue;
    const rawRate = rateCol !== -1 ? (row[rateCol] || '').trim() : '';
    const rawWork = workCol !== -1 ? (row[workCol] || '').trim() : '';
    const rawGroup = groupCol !== -1 ? (row[groupCol] || '').trim() : '';
    const rawDept = deptCol !== -1 ? (row[deptCol] || '').trim() : '';

    let parsedRate = 0;
    if (rawRate) {
      const cleanNum = rawRate.replace('%', '').trim();
      const num = parseFloat(cleanNum);
      if (!isNaN(num)) {
        parsedRate = Math.round(num * 100);
      }
    }

    const existing = employees.find(e => e.name === rawName || e.id === rawName);
    let targetId = existing?.id;
    if (!targetId) {
      targetId = `emp_${crypto.randomUUID().slice(0, 8)}`;
      const newEmp: Employee = {
        id: targetId,
        name: rawName,
        department: rawDept || (rawGroup.includes('总体') ? '总体部' : rawGroup.includes('产品') ? '产品部' : '研发中心'),
        group: rawGroup || '总体组',
        position: '工程师',
        groupRole: '组员',
        email: '',
        role: 'member',
        active: true,
      };
      newEmployees.push(newEmp);
    }
    entries.push({ employeeId: targetId, rate: parsedRate, workContent: rawWork });
    memberNames.push(rawName);
  }
  return { entries, memberNames, newEmployees };
}

// 常用项目组模版（含月度默认分配额度比例）
export function getProjectGroupTemplateCsv(): string {
  const headers = ['员工姓名', '月度默认分配比例(%)', '当月工作内容', '专业组', '职务', '部门', '备注'];
  const examples = [
    ['张三', '35', '主导系统核心通信架构与关键性能调优', '研发组', '高级工程师', '研发中心', '研发负责人'],
    ['李四', '25', '负责数据解析算法研发与接口联调', '研发组', '工程师', '研发中心', '骨干研发'],
    ['王五', '20', '总体技术指标拆解与需求方案评审', '总体组', '工程师', '总体部', '总体设计'],
    ['赵六', '10', '底层驱动适配与联调', '研发组', '工程师', '研发中心', '驱动研发'],
    ['孙七', '10', '产品需求梳理与文档标准化', '产品组', '工程师', '产品部', '产品规范'],
  ];
  return generateCsv(headers, examples);
}

export function parseProjectGroupCsvText(csvText: string, stateOrEmployees: State | Employee[]): {
  memberEntries: { employeeId: string; defaultRate: number; workContent?: string }[];
  memberIds: string[];
  defaultRates: Record<string, number>;
  newEmployees: Employee[];
  memberNames: string[];
} {
  const employees = Array.isArray(stateOrEmployees) ? stateOrEmployees : (stateOrEmployees?.employees || []);
  const rows = parseCsv(csvText);
  if (rows.length === 0) return { memberEntries: [], memberIds: [], defaultRates: {}, newEmployees: [], memberNames: [] };
  const firstRow = rows[0];
  let nameCol = -1, rateCol = -1, workCol = -1, groupCol = -1, posCol = -1, deptCol = -1;
  for (let i = 0; i < firstRow.length; i++) {
    const cell = firstRow[i].trim();
    if (/姓名|员工|成员/.test(cell) && nameCol === -1) nameCol = i;
    else if (/比例|额度比例|默认比例/.test(cell) && rateCol === -1) rateCol = i;
    else if (/工作内容|工作描述|任务|职责/.test(cell) && workCol === -1) workCol = i;
    else if (/专业组|分组/.test(cell) && groupCol === -1) groupCol = i;
    else if (/职务|岗位|角色|职称/.test(cell) && posCol === -1) posCol = i;
    else if (/部门|科室/.test(cell) && deptCol === -1) deptCol = i;
  }
  let dataRows = rows;
  if (nameCol !== -1) {
    dataRows = rows.slice(1);
  } else {
    nameCol = 0;
    if (firstRow.length > 1) rateCol = 1;
    dataRows = rows;
  }

  const memberEntries: { employeeId: string; defaultRate: number; workContent?: string }[] = [];
  const memberIds: string[] = [];
  const memberNames: string[] = [];
  const newEmployees: Employee[] = [];

  for (const row of dataRows) {
    if (!row || row.length === 0 || row.every(c => !c.trim())) continue;
    const rawName = nameCol !== -1 ? (row[nameCol] || '').trim() : '';
    if (!rawName || rawName === '姓名' || rawName === '员工姓名') continue;
    const rawRate = rateCol !== -1 ? (row[rateCol] || '').trim() : '';
    const rawWork = workCol !== -1 ? (row[workCol] || '').trim() : '';
    const rawGroup = groupCol !== -1 ? (row[groupCol] || '').trim() : '';
    const rawPos = posCol !== -1 ? (row[posCol] || '').trim() : '';
    const rawDept = deptCol !== -1 ? (row[deptCol] || '').trim() : '';

    let parsedRate = 0;
    if (rawRate) {
      const cleanNum = rawRate.replace('%', '').trim();
      const num = parseFloat(cleanNum);
      if (!isNaN(num)) {
        parsedRate = Math.round(num * 100);
      }
    }

    const existing = employees.find(e => e.name === rawName || e.id === rawName);
    let targetId = existing?.id;
    if (!targetId) {
      targetId = `emp_${crypto.randomUUID().slice(0, 8)}`;
      const newEmp: Employee = {
        id: targetId,
        name: rawName,
        department: rawDept || (rawGroup.includes('总体') ? '总体部' : rawGroup.includes('产品') ? '产品部' : '研发中心'),
        group: rawGroup || '总体组',
        position: rawPos || '工程师',
        groupRole: rawPos.includes('组长') ? '组长' : rawPos.includes('副组长') ? '副组长' : rawPos.includes('顾问') ? '顾问' : '组员',
        email: '',
        role: 'member',
        active: true,
      };
      newEmployees.push(newEmp);
    }
    if (!memberIds.includes(targetId)) {
      memberIds.push(targetId);
      memberNames.push(rawName);
      memberEntries.push({ employeeId: targetId, defaultRate: parsedRate, workContent: rawWork });
    }
  }
  const defaultRates: Record<string, number> = Object.fromEntries(memberEntries.map(m => [m.employeeId, m.defaultRate]));
  return { memberEntries, memberIds, defaultRates, newEmployees, memberNames };
}

// 项目组类型与管理
export type ProjectGroupType = '项目组' | '技术交流组' | '任务攻坚组' | '专项研发组' | string;

export interface ProjectGroup {
  id: string;
  name: string;
  type: ProjectGroupType;
  leaderId?: string; // 组长 / 负责人
  owner?: string; // 负责人 / 组长 (别名兼容)
  memberIds: string[];
  members?: string[]; // 成员列表 (别名兼容)
  defaultRates?: Record<string, number>; // 员工ID -> 分配比例 (基点 0-10000)
  memberEntries?: { employeeId: string; defaultRate?: number; workContent?: string }[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function getInitialProjectGroups(_employees?: Employee[], _currentAdminId?: string): ProjectGroup[] {
  // 需求4：项目组管理不要默认模版，从程序源代码中删除；组员与模版由用户手动创建或通过CSV导入
  return [];
}

export function exportProjectGroupsCsv(groups: ProjectGroup[], employees: Employee[]): string {
  const headers = ['项目组名称', '组类别', '组长姓名', '组员列表', '组员人数', '默认分配比例概览', '职责与工作目标', '创建时间'];
  const rows = groups.map(g => {
    const leader = employees.find(e => e.id === g.leaderId)?.name || '未指定';
    const memberNames = g.memberIds.map(id => employees.find(e => e.id === id)?.name || id).join('、');
    const rateOverview = g.defaultRates
      ? Object.entries(g.defaultRates)
          .filter(([, r]) => typeof r === 'number' && r > 0)
          .map(([id, r]) => `${employees.find(e => e.id === id)?.name || id}:${(r / 100).toFixed(1)}%`)
          .join('; ')
      : '未配置';
    return [
      g.name,
      g.type || '项目组',
      leader,
      memberNames,
      String(g.memberIds.length),
      rateOverview,
      g.description || '',
      g.createdAt || ''
    ];
  });
  return generateCsv(headers, rows);
}

// 解析项目组与协作团队 CSV（支持图3所示的多项目组批量导出格式，同时也兼容单组模板格式）
export function parseProjectGroupsCsvText(
  csvText: string,
  stateOrEmployees: State | Employee[],
  fallbackGroupName?: string
): {
  groups: ProjectGroup[];
  newEmployees: Employee[];
} {
  const state: State = Array.isArray(stateOrEmployees)
    ? { employees: stateOrEmployees, projects: [], plans: [], audit: [] }
    : stateOrEmployees;
  const employees = state.employees;

  const rows = parseCsv(csvText);
  if (rows.length === 0) return { groups: [], newEmployees: [] };

  const firstRow = rows[0];
  let nameCol = -1, typeCol = -1, leaderCol = -1, membersCol = -1, ratesCol = -1, descCol = -1, dateCol = -1;

  for (let i = 0; i < firstRow.length; i++) {
    const cell = firstRow[i].trim();
    if (/项目组名称|团队名称|组名称|^项目组$/i.test(cell) && nameCol === -1) nameCol = i;
    else if (/组类别|团队类别|^类别$|^类型$/i.test(cell) && typeCol === -1) typeCol = i;
    else if (/组长姓名|组长|负责人|团队负责人/i.test(cell) && leaderCol === -1) leaderCol = i;
    else if (/组员列表|组员名单|组员|成员列表|成员名单/i.test(cell) && membersCol === -1) membersCol = i;
    else if (/默认分配比例|分配比例|比例概览|默认比例/i.test(cell) && ratesCol === -1) ratesCol = i;
    else if (/职责与工作内容|职责与工作目标|职责|工作内容|工作目标|描述|备注/i.test(cell) && descCol === -1) descCol = i;
    else if (/创建时间|更新时间|时间|日期/i.test(cell) && dateCol === -1) dateCol = i;
  }

  // 如果没有“项目组名称”列，按单组模板格式解析
  if (nameCol === -1) {
    const single = parseProjectGroupCsvText(csvText, state);
    if (single.memberIds.length === 0) {
      return { groups: [], newEmployees: [] };
    }
    const defaultGroup: ProjectGroup = {
      id: `cg_${Date.now()}`,
      name: fallbackGroupName || '导入项目组',
      type: '项目组',
      leaderId: single.memberIds[0],
      owner: single.memberIds[0],
      memberIds: single.memberIds,
      members: single.memberIds,
      defaultRates: single.defaultRates,
      memberEntries: single.memberEntries,
      description: `通过模板导入（共 ${single.memberIds.length} 人）`,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    return { groups: [defaultGroup], newEmployees: single.newEmployees };
  }

  const newEmployees: Employee[] = [];
  const groups: ProjectGroup[] = [];
  const dataRows = rows.slice(1);

  const resolveEmployee = (empName: string, isLeader: boolean): Employee => {
    let existing = employees.find(e => e.name === empName || e.id === empName);
    if (!existing) {
      existing = newEmployees.find(e => e.name === empName || e.id === empName);
    }
    if (!existing) {
      const id = `emp_${crypto.randomUUID().slice(0, 8)}`;
      existing = {
        id,
        name: empName,
        department: '研发中心',
        group: '研发组',
        position: isLeader ? '高级工程师' : '工程师',
        groupRole: isLeader ? '组长' : '组员',
        email: '',
        role: 'member',
        active: true,
      };
      newEmployees.push(existing);
    }
    return existing;
  };

  for (let rIdx = 0; rIdx < dataRows.length; rIdx++) {
    const row = dataRows[rIdx];
    if (!row || row.length === 0 || row.every(c => !c.trim())) continue;
    const groupName = (row[nameCol] || '').trim();
    if (!groupName || groupName === '项目组名称' || groupName === '组名称') continue;

    const groupType = typeCol !== -1 && row[typeCol]?.trim() ? row[typeCol].trim() : '项目组';
    const leaderName = leaderCol !== -1 ? (row[leaderCol] || '').trim() : '';
    const membersStr = membersCol !== -1 ? (row[membersCol] || '').trim() : '';
    const ratesStr = ratesCol !== -1 ? (row[ratesCol] || '').trim() : '';
    const description = descCol !== -1 ? (row[descCol] || '').trim() : '';
    const dateStr = dateCol !== -1 ? (row[dateCol] || '').trim() : '';

    // 解析组员列表（支持顿号、逗号、分号、空格分割）
    const memberNameList: string[] = membersStr
      ? membersStr.split(/[、,，;；\s\n\r]+/).map(s => s.trim()).filter(Boolean)
      : [];

    if (leaderName && !memberNameList.includes(leaderName)) {
      memberNameList.unshift(leaderName);
    }

    const defaultRates: Record<string, number> = {};

    // 解析默认分配比例字符串（例如 "刘盟:10.0%; 邹富墩:30.0%" 或 "邹富墩:35.0%; 杨健:12.0%"）
    if (ratesStr) {
      const rateTokens = ratesStr.split(/[;；\n\r]+/);
      for (const token of rateTokens) {
        const trimmed = token.trim();
        if (!trimmed) continue;
        const match = trimmed.match(/^(.+?)[:：=＝\s]+([0-9]+(?:\.[0-9]+)?)\s*%?/);
        if (match) {
          const rateName = match[1].trim();
          const rateVal = parseFloat(match[2]);
          if (rateName && !isNaN(rateVal)) {
            const emp = resolveEmployee(rateName, rateName === leaderName);
            const basisPoints = Math.round(rateVal * 100);
            defaultRates[emp.id] = basisPoints;
            if (!memberNameList.includes(rateName)) {
              memberNameList.push(rateName);
            }
          }
        }
      }
    }

    const memberIds: string[] = [];
    const memberEntries: { employeeId: string; defaultRate: number; workContent?: string }[] = [];

    for (const mName of memberNameList) {
      const emp = resolveEmployee(mName, mName === leaderName);
      if (!memberIds.includes(emp.id)) {
        memberIds.push(emp.id);
        memberEntries.push({
          employeeId: emp.id,
          defaultRate: defaultRates[emp.id] || 0,
          workContent: emp.name === leaderName ? '负责团队总体统筹与项目推进' : ''
        });
      }
    }

    let leaderId: string | undefined = undefined;
    if (leaderName) {
      const leaderEmp = resolveEmployee(leaderName, true);
      leaderId = leaderEmp.id;
    } else if (memberIds.length > 0) {
      leaderId = memberIds[0];
    }

    const group: ProjectGroup = {
      id: `cg_${Date.now()}_${rIdx}`,
      name: groupName,
      type: (['项目组', '技术交流组', '任务攻坚组', '专项研发组'].includes(groupType) ? groupType : '项目组') as ProjectGroupType,
      leaderId,
      owner: leaderId,
      memberIds,
      members: memberIds,
      defaultRates,
      memberEntries,
      description: description || `包含 ${memberIds.length} 名成员`,
      createdAt: (dateStr && !dateStr.includes('#') ? dateStr : new Date().toISOString().slice(0, 10)),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    groups.push(group);
  }

  return { groups, newEmployees };
}

