export const SCALE = 10000;
export const DEFAULT_GROUPS = ['总体组', '产品组', '研发组'] as const;
export type ProfessionalGroup = typeof DEFAULT_GROUPS[number] | string;

export type Employee = {
  id: string;
  employeeNo?: string; // 工号 / 员工唯一ID号
  name: string;
  department: string;
  group?: string; // 专业组：总体组 / 产品组 / 研发组 或组合如 产品组,研发组
  position?: string; // 职务：副所长,主任 / 副主任 / 研究员 / 高级工程师 / 工程师 等
  groupRole?: string; // 专业组职务：组长 / 副组长 / 顾问 / 组员
  email: string;
  role: 'admin' | 'auditor' | 'member';
  active: boolean;
};

export const isAdminRole = (actor?: Employee | null): boolean => actor?.role === 'admin';
export const isAuditorRole = (actor?: Employee | null): boolean => actor?.role === 'admin' || actor?.role === 'auditor';

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
export type State = {
  employees: Employee[];
  projects: Project[];
  plans: Plan[];
  audit: Audit[];
  auditorPackages?: ProjectMeritPackage[];
};
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
export const points = (amount: number, rate: number) => {
  const safeAmount = BigInt(Math.round(Number(amount) || 0));
  const safeRate = BigInt(Math.round(Number(rate) || 0));
  return Number((safeAmount * safeRate + 5000n) / 10000n);
};
export const pct = (rate: number) => `${(rate / 100).toFixed(2).replace(/\.00$/, '')}%`;
export const formatWan = (fen: number, maxDigits = 6): string => {
  if (fen == null || isNaN(fen)) return '0';
  const val = Number(fen) / 1_000_000;
  return Number(val.toFixed(maxDigits)).toLocaleString('zh-CN', { maximumFractionDigits: maxDigits });
};
export const wan = (fen: number) => formatWan(fen, 6);
export const score = (fen: number) => formatWan(fen, 6);
export const monthAmount = (project: Project, plan: Plan) => points(project.contract, plan.budget);

export function toMoney(value: unknown): number {
  if (value == null) fail('金额不能为空');
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) fail('金额格式不正确（必须大于0）');
    return integer(Math.round(value * 1_000_000), '金额', 1, 1_000_000_000_000);
  }
  let str = String(value).trim();
  if (!str) fail('金额不能为空');

  // 全角字符转半角字符（如 １２３．４５ -> 123.45）
  str = str.replace(/[\uff01-\uff5e]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));
  // 去除空格、千分位逗号与下划线（如 1,309,000.00 -> 1309000.00）
  str = str.replace(/[,_\s]/g, '');
  // 去除常见货币前缀（¥, ￥, $, RMB, rmb等）
  str = str.replace(/^[¥￥$RMBrmb]+/g, '');

  // 识别单位是否为“元”（且不含“万”，例如 1000000元 或 500000元）
  let isYuan = false;
  if (/[元圆]$/.test(str) && !/万/.test(str)) {
    isYuan = true;
    str = str.replace(/[元圆]$/, '');
  } else {
    str = str.replace(/[万元\s]+$/gi, '');
  }

  // 去除可能的负号（若为负数后续报错）
  const isNegative = str.startsWith('-');
  if (isNegative) str = str.slice(1);

  // 补全前导或尾部小数点，如 ".5" -> "0.5", "50." -> "50"
  if (str.startsWith('.')) str = '0' + str;
  if (str.endsWith('.')) str = str.slice(0, -1);

  // 如果包含多个小数点（例如令号 22.01.28 或日期 2026.09.15 误入金额列），尝试截取首个浮点数
  if ((str.match(/\./g) || []).length > 1) {
    const m = str.match(/^\d+(\.\d+)?/);
    if (m) str = m[0];
  }

  const num = Number(str);
  if (isNaN(num) || !Number.isFinite(num)) {
    fail('金额必须为有效数字（单位：万元）');
  }
  if (isNegative || num <= 0) {
    fail('金额必须大于 0（单位：万元）');
  }

  const wan = isYuan ? num / 10000 : num;
  // 1 万元 = 10,000 元 = 1,000,000 分
  // 金额在系统中以“分”为整型基准存储。
  // 对于 Excel 计算、浮点运算或外部导出时产生的超过 6 位小数（如 33.33333333 或 50.100000000000001），
  // 自动四舍五入到最近的“分”（即对应 6 位小数），杜绝直接向用户弹窗阻断导入
  const fen = Math.round(wan * 1_000_000);
  return integer(fen, '金额', 1, 1_000_000_000_000);
}

export function toRate(value: unknown): number {
  if (value == null) fail('比例不能为空');
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) fail('比例格式不正确');
    return integer(Math.round(value * 100), '比例');
  }
  let str = String(value).trim().replace('%', '');
  str = str.replace(/[\uff01-\uff5e]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));
  str = str.replace(/[,_\s]/g, '');
  if (str.startsWith('.')) str = '0' + str;
  if (str.endsWith('.')) str = str.slice(0, -1);

  const num = Number(str);
  if (isNaN(num) || !Number.isFinite(num)) {
    fail('百分比必须为有效数字');
  }
  // 自动四舍五入到基点（支持输入超过 2 位小数的浮点数自然保留到 0.01% 基点）
  return integer(Math.round(num * 100), '比例');
}

// Largest-remainder allocation keeps every monthly amount exact to the cent.
export function allocate(amount: number, entries: PlanEntry[]) {
  if (!entries || entries.length === 0) return [];
  const safeAmount = Math.round(Number(amount) || 0);
  const totalRate = total(entries.map(entry => Math.round(Number(entry.rate) || 0)));
  const rows = entries.map((entry, index) => {
    const raw = BigInt(safeAmount) * BigInt(Math.round(Number(entry.rate) || 0));
    return {
      employeeId: entry.employeeId,
      points: Number(raw / 10000n),
      remainder: Number(raw % 10000n),
      index,
      rate: entry.rate,
      workContent: entry.workContent || ''
    };
  });
  if (totalRate === SCALE) {
    const missing = safeAmount - total(rows.map(row => row.points));
    const order = [...rows].sort((a, b) => b.remainder - a.remainder || a.index - b.index);
    if (order.length > 0) {
      for (let index = 0; index < missing; index += 1) order[index % order.length].points += 1;
    }
  }
  return rows.map(({ employeeId, points, rate, workContent }) => ({ employeeId, points, rate, workContent }));
}

export function planAllocations(project: Project, plan: Plan) {
  if (!project || !plan) return [];
  if (Array.isArray(plan.records) && plan.records.length > 0) {
    return plan.records.map(r => ({
      employeeId: r.employeeId,
      points: Math.round(Number(r.points) || 0),
      rate: plan.entries?.find(e => e.employeeId === r.employeeId)?.rate || 0,
      workContent: plan.entries?.find(e => e.employeeId === r.employeeId)?.workContent || '',
    }));
  }
  try {
    return allocate(monthAmount(project, plan), plan.entries || []);
  } catch {
    const safeAmt = monthAmount(project, plan);
    return (plan.entries || []).map(entry => ({
      employeeId: entry.employeeId,
      points: points(safeAmt, entry.rate || 0),
      rate: entry.rate || 0,
      workContent: entry.workContent || '',
    }));
  }
}

export function projectBudgetRate(state: State, projectId: string) {
  const safePlans = Array.isArray(state?.plans) ? state.plans : [];
  return total(safePlans.filter(plan => plan.projectId === projectId).map(plan => plan.budget || 0));
}

export function ownerSummary(state: State, project: Project) {
  if (!project) return { allocated: 0, rate: 0, low: 0, high: 0, valid: true };
  const safePlans = Array.isArray(state?.plans) ? state.plans : [];
  const allocated = total(safePlans.filter(plan => plan.projectId === project.id).map(plan => planAllocations(project, plan).find(row => row.employeeId === project.owner)?.points ?? 0));
  const safeContract = BigInt(Math.round(Number(project.contract) || 0));
  const safeAllocated = BigInt(Math.round(Number(allocated) || 0));
  const rate = safeContract > 0n ? Number((safeAllocated * 10000n + safeContract / 2n) / safeContract) : 0;
  const [low, high] = range(Number(safeContract));
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
    const rawNo = typeof data.employeeNo === 'string' ? data.employeeNo.trim() : '';
    const old = state.employees.find(employee => employee.id === data.id || (rawNo && employee.employeeNo === rawNo));
    const effectiveNo = rawNo || old?.employeeNo || '';
    const employee: Employee = {
      id: old?.id || effectiveNo || id,
      employeeNo: effectiveNo || undefined,
      name: text(data.name, '员工姓名', 40),
      department: text(data.department, '部门', 60),
      group: typeof data.group === 'string' && data.group.trim() ? data.group.trim() : '',
      position: typeof data.position === 'string' ? data.position.trim() : (old?.position || ''),
      groupRole: typeof data.groupRole === 'string' ? data.groupRole.trim() : (old?.groupRole || ''),
      email: typeof data.email === 'string' ? data.email.trim().toLowerCase() : '',
      role: (data.role === 'admin' || data.role === 'auditor') ? data.role : 'member',
      active: data.active !== false
    };
    if (employee.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) fail('邮箱格式不正确');
    if (employee.id === actor.id && (!employee.active || employee.role !== 'admin')) fail('不能停用或降级当前管理员');
    if (old && state.projects.some(project => project.members.includes(old.id)) && !employee.active) fail('该员工仍在项目组中，不能停用');
    if (old) state.employees[state.employees.indexOf(old)] = employee;
    else state.employees.push(employee);
    action = old ? '修改员工' : '新增员工';
    target = `${employee.name}${employee.employeeNo ? `[${employee.employeeNo}]` : ''}（${employee.group || '未分组'}）`;
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
      const rawNo = typeof item.employeeNo === 'string' ? item.employeeNo.trim() : '';
      const existing = state.employees.find(e =>
        (rawNo && (e.employeeNo === rawNo || e.id === rawNo)) ||
        (item.id && e.id === item.id) ||
        e.name === empName
      );
      const groupVal = typeof item.group === 'string' && item.group.trim() ? item.group.trim() : '';
      const deptVal = typeof item.department === 'string' && item.department.trim() ? item.department.trim() : (groupVal ? `${groupVal.split(',')[0]}部` : '综合部');
      const emailVal = typeof item.email === 'string' ? item.email.trim().toLowerCase() : '';
      const posVal = typeof item.position === 'string' ? item.position.trim() : '';
      const grpRoleVal = typeof item.groupRole === 'string' ? item.groupRole.trim() : '';
      if (existing) {
        existing.department = deptVal;
        existing.group = groupVal;
        if (rawNo) existing.employeeNo = rawNo;
        if (posVal) existing.position = posVal;
        if (grpRoleVal) existing.groupRole = grpRoleVal;
        if (emailVal) existing.email = emailVal;
      } else {
        const targetId = item.id || rawNo || `emp_${crypto.randomUUID().slice(0, 8)}`;
        state.employees.push({
          id: targetId,
          employeeNo: rawNo || undefined,
          name: empName,
          department: deptVal,
          group: groupVal,
          position: posVal,
          groupRole: grpRoleVal,
          email: emailVal,
          role: (item.role === 'admin' || item.role === 'auditor') ? item.role : 'member',
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
    }).sort((a: ProjectMonthlyQuotaPlan, b: ProjectMonthlyQuotaPlan) => a.month.localeCompare(b.month));

    const totalRate = total(schedule.map(s => s.rate));
    const maxAllocable = Math.max(0, SCALE - (project.historyCompletedRate || 0));
    if (totalRate > maxAllocable) {
      fail(`全周期规划分配比例合计（${pct(totalRate)}）不能超过项目可分配余额（${pct(maxAllocable)}）`);
    }

    project.quotaSchedule = schedule;
    action = '制定项目额度规划';
    target = `${project.name} (已规划 ${schedule.length} 个月度，额度规划总额 ${pct(totalRate)})`;
  } else if (command.type === 'plan.batchPublish') {
    if (!Array.isArray(data.planIds) || data.planIds.length === 0) fail('未选择要批量发布的方案');
    const planIdSet = new Set(data.planIds.map(String));
    let count = 0;
    const publishedProjects: string[] = [];
    for (const plan of state.plans) {
      if (planIdSet.has(plan.id) && plan.status === 'draft') {
        const prj = state.projects.find(p => p.id === plan.projectId);
        if (!prj || (actor.role !== 'admin' && prj.owner !== actor.id)) {
          fail(`无权发布项目【${prj?.name || plan.projectId}】的月度方案`);
        }
        plan.status = 'published';
        count++;
        if (prj && !publishedProjects.includes(prj.name)) publishedProjects.push(prj.name);
      }
    }
    if (count === 0) fail('所选方案中没有处于草稿状态的可发布记录');
    action = '批量发布月度方案';
    target = `已成功发布 ${count} 个项目的月度方案${publishedProjects.length > 0 ? `（${publishedProjects.slice(0, 3).join('、')}${publishedProjects.length > 3 ? '等' : ''}）` : ''}`;
  } else if (command.type === 'plan.batchReopen') {
    if (!Array.isArray(data.planIds) || data.planIds.length === 0) fail('未选择要批量撤回的方案');
    const planIdSet = new Set(data.planIds.map(String));
    let count = 0;
    const reopenedProjects: string[] = [];
    for (const plan of state.plans) {
      if (planIdSet.has(plan.id) && plan.status === 'published') {
        const prj = state.projects.find(p => p.id === plan.projectId);
        if (!prj || (actor.role !== 'admin' && prj.owner !== actor.id)) {
          fail(`无权撤回项目【${prj?.name || plan.projectId}】的月度方案`);
        }
        plan.status = 'draft';
        count++;
        if (prj && !reopenedProjects.includes(prj.name)) reopenedProjects.push(prj.name);
      }
    }
    if (count === 0) fail('所选方案中没有处于已发布状态的可撤回记录');
    action = '批量撤回月度方案';
    target = `已撤回 ${count} 个项目的月度方案为草稿${reopenedProjects.length > 0 ? `（${reopenedProjects.slice(0, 3).join('、')}${reopenedProjects.length > 3 ? '等' : ''}）` : ''}`;
  } else if (command.type === 'plan.batchSave') {
    if (!Array.isArray(data.plans) || data.plans.length === 0) fail('未提供待保存的月度方案数据');
    let savedCount = 0;
    const modifiedProjects: string[] = [];
    for (const item of data.plans) {
      const project = state.projects.find(p => p.id === item.projectId);
      if (!project || (actor.role !== 'admin' && project.owner !== actor.id)) {
        fail(`无权维护项目【${project?.name || item.projectId}】的月度分配`);
      }
      if (project.status === 'archived') {
        fail(`已结项项目【${project.name}】不能调整月度分配`);
      }
      const monthStr = text(item.month, '分配月份');
      const budget = integer(item.budget, '月度额度比例', 1, SCALE);

      const existing = state.plans.find(p => (item.id && p.id === item.id) || (p.projectId === project.id && p.month === monthStr));
      if (existing && existing.status === 'published') {
        fail(`项目【${project.name}】在 ${monthStr} 的方案已发布，需先撤回为草稿才能修改`);
      }

      // 成员分配比例条目
      const entries: PlanEntry[] = Array.isArray(item.entries) ? item.entries.map((entry: any) => ({
        employeeId: String(entry.employeeId),
        rate: integer(entry.rate, '成员分配比例', 0, SCALE),
        workContent: typeof entry.workContent === 'string' ? entry.workContent.slice(0, 500) : ''
      })) : [];

      // 若未提供 entries 或 entries 为空，但项目有默认比例或成员，自动兜底
      if (entries.length === 0) {
        if (project.defaultRates && Object.keys(project.defaultRates).length > 0) {
          for (const [empId, r] of Object.entries(project.defaultRates)) {
            entries.push({ employeeId: empId, rate: Number(r), workContent: '' });
          }
        } else if (project.members.length > 0) {
          const baseRate = Math.floor(SCALE / project.members.length);
          let remRate = SCALE - baseRate * project.members.length;
          for (const empId of project.members) {
            let r = baseRate;
            if (remRate > 0) { r++; remRate--; }
            entries.push({ employeeId: empId, rate: r, workContent: '' });
          }
        }
      }

      // 确保成员被包含在项目成员列表中
      for (const entry of entries) {
        if (!project.members.includes(entry.employeeId)) {
          project.members.push(entry.employeeId);
        }
      }

      const plan: Plan = {
        id: existing?.id || item.id || `plan_${crypto.randomUUID().slice(0, 8)}`,
        projectId: project.id,
        month: monthStr,
        budget,
        entries,
        status: 'draft',
        note: typeof item.note === 'string' ? item.note.slice(0, 500) : (existing?.note || '')
      };

      if (existing) {
        state.plans[state.plans.indexOf(existing)] = plan;
      } else {
        state.plans.push(plan);
      }
      savedCount++;
      if (!modifiedProjects.includes(project.name)) modifiedProjects.push(project.name);
    }
    action = '批量保存月度方案';
    target = `已成功保存 ${savedCount} 个项目的月度分配草稿${modifiedProjects.length > 0 ? `（${modifiedProjects.slice(0, 3).join('、')}${modifiedProjects.length > 3 ? '等' : ''}）` : ''}`;
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
        amountWan: (alloc.points / 1_000_000).toFixed(6),
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
      amountWan: (cumulativePoints / 1_000_000).toFixed(6),
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
      plannedAmountWan: (plannedAmount / 1_000_000).toFixed(6),
      milestone: planItem?.milestone || '',
      note: planItem?.note || '',
      actualRate,
      actualPct: pct(actualRate),
      actualAmountWan: (actualAmount / 1_000_000).toFixed(6),
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
    totalPlannedWan: (points(project.contract, totalPlannedRate) / 1_000_000).toFixed(6),
    totalActualRate,
    totalActualPct: pct(totalActualRate),
    totalActualWan: (monthAmount(project, { budget: totalActualRate } as Plan) / 1_000_000).toFixed(6),
    remainingRate,
    remainingPct: pct(remainingRate),
    remainingWan: wan(remainingAmount),
    deliveryStageReserveRate: remainingRate,
    deliveryStageReserveAmount: remainingAmount,
    maxAllocableRate,
    maxAllocablePct: pct(maxAllocableRate),
    overbudgetCount,
    isFrontLoadedRisk,
    riskWarnings,
  };
}

// -------------------------------------------------------------
// 月底分配：全项目当月集中管理透视与批量修改辅助函数
// -------------------------------------------------------------
export type MonthProjectAllocRow = {
  project: Project;
  plan?: Plan;
  status: 'published' | 'draft' | 'unallocated';
  plannedRate: number; // bps from quotaSchedule for this month
  plannedAmount: number; // money
  plannedAmountWan: string;
  plannedMilestone: string;
  plannedStageType: ProjectQuotaStageType;
  actualRate: number; // bps from plan.budget (or 0 if unallocated)
  actualAmount: number; // money
  actualAmountWan: string;
  diffRate: number; // actualRate - plannedRate
  diffAmount: number; // actualAmount - plannedAmount
  allocableRemainingRate: number; // remaining rate for project excluding current month draft
  allocableRemainingAmount: number; // remaining amount for project
  isHistorical: boolean;
  entries: PlanEntry[];
  memberCount: number;
  canManage: boolean;
};

export function getMonthProjectsAllocPerspective(state: State, month: string, actorId?: string) {
  const normMonth = text(month, '查询月份');
  const actor = actorId ? state.employees.find(e => e.id === actorId) : undefined;
  const isAdmin = !actor || actor.role === 'admin';

  // 筛选出在该月份执行或有分配记录或处在生命周期内的项目
  const relevantProjects = state.projects.filter(p => {
    // 包含已有该月分配的项目
    const hasPlan = state.plans.some(pl => pl.projectId === p.id && pl.month === normMonth);
    if (hasPlan) return true;
    // 活跃项目且开始月份 <= 该月份
    if (p.status !== 'active') return false;
    if (p.start && p.start > normMonth) return false;
    if (p.end && p.end < normMonth) return false;
    return true;
  }).sort((a, b) => a.code.localeCompare(b.code));

  let totalPlannedAmount = 0;
  let totalPlannedRate = 0;
  let totalActualAmount = 0;
  let totalActualRate = 0;
  let allocatedCount = 0;
  let draftCount = 0;
  let publishedCount = 0;

  const rows: MonthProjectAllocRow[] = relevantProjects.map(project => {
    const plan = state.plans.find(pl => pl.projectId === project.id && pl.month === normMonth);
    const quotaItem = project.quotaSchedule?.find(s => s.month === normMonth);

    const plannedRate = quotaItem?.rate || 0;
    const plannedAmount = points(project.contract, plannedRate);
    const plannedMilestone = quotaItem?.milestone || '';
    const plannedStageType = quotaItem?.stageType || (quotaItem ? getQuotaPlanStageType(quotaItem) : 'normal');

    const actualRate = plan ? plan.budget : 0;
    const actualAmount = plan ? monthAmount(project, plan) : 0;
    const status: 'published' | 'draft' | 'unallocated' = plan
      ? (plan.status === 'published' ? 'published' : 'draft')
      : 'unallocated';

    const diffRate = actualRate - plannedRate;
    const diffAmount = actualAmount - plannedAmount;

    totalPlannedAmount += plannedAmount;
    totalPlannedRate += plannedRate;
    totalActualAmount += actualAmount;
    totalActualRate += actualRate;

    if (plan) {
      allocatedCount++;
      if (plan.status === 'published') publishedCount++;
      else draftCount++;
    }

    // 计算项目剩余可用额度（不含当前月草稿）
    const otherPlans = state.plans.filter(pl => pl.projectId === project.id && pl.id !== plan?.id);
    const otherBudgetRate = total(otherPlans.map(pl => pl.budget));
    const historyCompletedRate = project.historyCompletedRate || 0;
    const maxAllocableRate = Math.max(0, SCALE - historyCompletedRate);
    const allocableRemainingRate = Math.max(0, maxAllocableRate - otherBudgetRate);
    const allocableRemainingAmount = points(project.contract, allocableRemainingRate);

    // 默认或已有成员分配条目
    let entries: PlanEntry[] = plan?.entries ? [...plan.entries] : [];
    if (entries.length === 0) {
      if (project.defaultRates && Object.keys(project.defaultRates).length > 0) {
        entries = Object.entries(project.defaultRates).map(([empId, r]) => ({
          employeeId: empId,
          rate: Number(r),
          workContent: ''
        }));
      } else if (project.members.length > 0) {
        const base = Math.floor(SCALE / project.members.length);
        let rem = SCALE - base * project.members.length;
        entries = project.members.map(empId => {
          let r = base;
          if (rem > 0) { r++; rem--; }
          return { employeeId: empId, rate: r, workContent: '' };
        });
      }
    }

    const canManage = isAdmin || (actor && project.owner === actor.id);

    return {
      project,
      plan,
      status,
      plannedRate,
      plannedAmount,
      plannedAmountWan: wan(plannedAmount),
      plannedMilestone,
      plannedStageType,
      actualRate,
      actualAmount,
      actualAmountWan: wan(actualAmount),
      diffRate,
      diffAmount,
      allocableRemainingRate,
      allocableRemainingAmount,
      isHistorical: Boolean(project.historyCompletedRate && project.historyCompletedRate > 0),
      entries,
      memberCount: project.members.length,
      canManage: Boolean(canManage),
    };
  });

  return {
    month: normMonth,
    rows,
    totalProjects: relevantProjects.length,
    allocatedCount,
    draftCount,
    publishedCount,
    totalPlannedAmount,
    totalPlannedRate,
    totalActualAmount,
    totalActualRate,
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
  const { startMonth, endMonth, months, group, search, status = 'published' } = options || {};

  const safePlans = Array.isArray(state?.plans) ? state.plans : [];
  const safeEmployees = Array.isArray(state?.employees) ? state.employees.filter(Boolean) : [];
  const safeProjects = Array.isArray(state?.projects) ? state.projects : [];

  let targetMonths: string[] = [];
  if (months && months.length > 0) {
    targetMonths = months;
  } else if (startMonth && endMonth) {
    targetMonths = getMonthsBetween(startMonth, endMonth);
  } else if (startMonth) {
    targetMonths = [startMonth];
  } else {
    targetMonths = Array.from(new Set(safePlans.map(p => p.month).filter(Boolean))).sort();
  }

  const filteredEmployees = safeEmployees.filter(emp => {
    if (!emp) return false;
    if (group && group !== 'all' && emp.group !== group) return false;
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const txt = ((emp.name || '') + (emp.department || '') + (emp.group || '') + (emp.employeeNo || '') + (emp.position || '')).toLowerCase();
      if (!txt.includes(q)) return false;
    }
    return true;
  });

  return filteredEmployees.map(employee => {
    const details = safePlans
      .filter(plan => plan && targetMonths.includes(plan.month) && (status === 'all' || plan.status === 'published'))
      .flatMap(plan => {
        const project = safeProjects.find(item => item && item.id === plan.projectId);
        if (!project) return [];
        let allocated = 0;
        try {
          allocated = planAllocations(project, plan).find(row => row.employeeId === employee.id)?.points ?? 0;
        } catch {
          allocated = 0;
        }
        const entry = Array.isArray(plan.entries) ? plan.entries.find(row => row.employeeId === employee.id) : undefined;
        return allocated > 0 ? [{
          projectId: project.id,
          project: project.name || '未命名项目',
          code: project.code || '',
          month: plan.month,
          status: plan.status,
          budget: plan.budget || 0,
          rate: entry?.rate || 0,
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
  const safeState: State = {
    employees: Array.isArray(state?.employees) ? state.employees : [],
    projects: Array.isArray(state?.projects) ? state.projects : [],
    plans: Array.isArray(state?.plans) ? state.plans : [],
    audit: Array.isArray(state?.audit) ? state.audit : [],
  };
  const year = options?.year || '2026';
  const month = options?.month || `${year}-01`;
  const quarter = options?.quarter || 1;

  // 1. 月度之星：该月绩点最高
  const monthReport = rangeReport(safeState, { months: [month], status: 'published' });
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
  const quarterReport = rangeReport(safeState, { months: qMonths, status: 'published' });
  const topQuarterPoints = quarterReport[0]?.points || 0;
  const quarterStars = topQuarterPoints > 0 ? quarterReport.filter(r => r.points === topQuarterPoints) : [];

  // 3. 年度之星：整年度12个月累计最高
  const yearMonths = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
  const yearReport = rangeReport(safeState, { months: yearMonths, status: 'published' });
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
      monthlyAmountWan: Number((monthAmt / 1_000_000).toFixed(6)),
      cumulativeAmountWan: Number((runningAmount / 1_000_000).toFixed(6)),
      remainingAmountWan: Number((remainingAmt / 1_000_000).toFixed(6)),
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
          wan: Number((alloc.points / 1_000_000).toFixed(6)),
        });
      }
    }

    cumulativePoints += monthPoints;
    return {
      month,
      points: Number((monthPoints / 100).toFixed(2)),
      wan: Number((monthPoints / 1_000_000).toFixed(6)),
      cumulativePoints: Number((cumulativePoints / 100).toFixed(2)),
      cumulativeWan: Number((cumulativePoints / 1_000_000).toFixed(6)),
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
      totalWan: Number((totalAmt / 1_000_000).toFixed(6)),
      publishedWan: Number((publishedAmt / 1_000_000).toFixed(6)),
      draftWan: Number((draftAmt / 1_000_000).toFixed(6)),
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
      const wanVal = Number((r.points / 1_000_000).toFixed(6));
      if (grp === '总体组') result['总体组'] += wanVal;
      else if (grp === '产品组') result['产品组'] += wanVal;
      else if (grp === '研发组') result['研发组'] += wanVal;
      else result['其他'] += wanVal;
      result.totalWan += wanVal;
    }
    result['总体组'] = Number(result['总体组'].toFixed(6));
    result['产品组'] = Number(result['产品组'].toFixed(6));
    result['研发组'] = Number(result['研发组'].toFixed(6));
    result['其他'] = Number(result['其他'].toFixed(6));
    result.totalWan = Number(result.totalWan.toFixed(6));
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
  const headers = ['工作令号', '项目名称', '成员工号', '成员姓名', '所属部门', '专业组', '是否负责人', '累计获得额度(万元)', '累计获得绩点(万元)', '累计占比'];
  const rows: (string | number)[][] = [];
  for (const p of state.projects) {
    const detail = projectAllocDetail(state, p.id);
    if (!detail) continue;
    for (const m of detail.memberCumulative) {
      const emp = state.employees.find(e => e.id === m.employeeId || e.name === m.name);
      rows.push([
        p.code,
        p.name,
        emp?.employeeNo || emp?.id || '',
        m.name,
        m.department,
        m.group,
        m.isOwner ? '是' : '否',
        m.amountWan,
        (m.cumulativePoints / 1_000_000).toFixed(6),
        m.cumulativePct,
      ]);
    }
  }
  return generateCsv(headers, rows);
}

export function exportEmployeesCsv(state: State): string {
  const headers = ['序号', '工号', '姓名', '职务', '专业组', '专业组职务', '所属部门', '邮箱', '系统角色', '状态', '参与项目数'];
  const rows = state.employees.map((e, index) => [
    index + 1,
    e.employeeNo || e.id || '',
    e.name,
    e.position || '',
    e.group || '',
    e.groupRole || '',
    e.department,
    e.email || '',
    e.role === 'admin' ? '系统管理员' : e.role === 'auditor' ? '绩效核算员' : '普通员工',
    e.active ? '启用' : '停用',
    state.projects.filter(p => p.members.includes(e.id)).length,
  ]);
  return generateCsv(headers, rows);
}

// 周期绩点报表明细矩阵 CSV 导出（按图2格式：序号、姓名、各个项目合同名称加工作令号、个人累加，最底行计算每个合同的项目累加，以万为单位）
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

  // 项目列纵向累加器（单位：分 points）
  const projectPointsSums = new Array(projects.length).fill(0);
  let grandTotalPoints = 0;

  const data = rows.map((r, index) => {
    let rowPersonalTotal = 0;
    const projectScores = projects.map((p, pIndex) => {
      // 必须严格精确匹配项目唯一 ID（p.id），坚决不能使用令号模糊或跨项目匹配，
      // 彻底解决图1中同令号下的多个不同合同（如 EA1 LDC、EA1 S部、EA1 W部等）细目重复计算的问题！
      const fen = r.details
        .filter(d => d.projectId === p.id)
        .reduce((sum, d) => sum + d.points, 0);

      projectPointsSums[pIndex] += fen;
      rowPersonalTotal += fen;
      return (fen / 1_000_000).toFixed(6);
    });

    grandTotalPoints += rowPersonalTotal;

    return [
      index + 1,
      r.employee.name,
      ...projectScores,
      (rowPersonalTotal / 1_000_000).toFixed(6),
    ];
  });

  // 按照图2：在最底端增加“项目累加”行，统计每个合同的所有人的累加和，最后一列为所有项目累加的终极总和（等于所有人的个人累加总和）
  const projectTotalsRow = [
    '',
    '项目累加',
    ...projectPointsSums.map(pts => (pts / 1_000_000).toFixed(6)),
    (grandTotalPoints / 1_000_000).toFixed(6),
  ];

  data.push(projectTotalsRow);

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
  const headers = ['统计周期', '排名', '员工工号', '员工姓名', '职务', '专业组', '专业组职务', '所属部门', '贡献项目数', '获得总绩点(万元)', '折合总额度(万元)', '参与项目明细'];
  const data = rows.map((r, i) => {
    const detailStr = r.details.map(d => `${d.month}:${d.project}(${(d.points / 1_000_000).toFixed(6)}万)`).join('; ');
    return [
      periodLabel,
      i + 1,
      r.employee.employeeNo || r.employee.id || '',
      r.employee.name,
      r.employee.position || '',
      r.employee.group || '',
      r.employee.groupRole || '',
      r.employee.department,
      r.projectCount,
      (r.points / 1_000_000).toFixed(6),
      (r.points / 1_000_000).toFixed(6),
      detailStr,
    ];
  });
  return generateCsv(headers, data);
}

// 部门员工花名册 CSV 模板（标准列：序号、姓名、职务、专业组、专业组职务、部门、工号）
export function getEmployeeTemplateCsv(): string {
  const headers = ['序号', '姓名', '职务', '专业组', '专业组职务', '部门', '工号'];
  const examples = [
    ['1', '周胜增', '副所长,主任', '领导班子', '总负责', '第四研究室', '1001'],
    ['2', '胡兴刚', '副主任', '领导班子', '分管领导', '第四研究室', '1002'],
    ['3', '刘杰', '副主任', '领导班子', '分管领导', '第四研究室', '1003'],
    ['4', '吕赟', '主任助理', '总体组', '组长', '第四研究室', '1004'],
    ['5', '陈韬', '副总工程师', '研发组', '顾问', '第四研究室', '1005'],
    ['6', '杜晓啸', '研究员', '总体组', '顾问', '第四研究室', '1006'],
    ['7', '石芳菲', '研究员', '产品组', '顾问', '第四研究室', '1007'],
    ['8', '郑珊珊', '研究员', '总体组', '组员', '第四研究室', '1008'],
    ['9', '洪秋玉', '核算员', '核算', '核算', '第四研究室', '1009'],
    ['10', '赵淼', '高级工程师', '总体组', '组员', '第四研究室', '1010'],
    ['11', '张孝华', '高级工程师', '总体组', '组员', '第四研究室', '1011'],
    ['12', '余烨', '工程师', '总体组', '组员', '第四研究室', '1012'],
    ['13', '张诗琪', '助理工程师', '总体组', '组员', '第四研究室', '1013'],
    ['14', '郑祎鹏', '助理工程师', '总体组', '组员', '第四研究室', '1014'],
    ['15', '刘盟', '工程师', '总体组,研发组', '副组长', '第四研究室', '1015'],
    ['16', '周陈喜', '工程师', '总体组,研发组', '副组长', '第四研究室', '1016'],
    ['17', '孙骞', '高级工程师', '产品组', '组长', '第四研究室', '1017'],
    ['18', '朱圣音', '工程师', '产品组', '副组长', '第四研究室', '1018'],
    ['19', '蔡欣欣', '工程师', '产品组', '副组长', '第四研究室', '1019'],
    ['20', '赵鑫亮', '工程师', '产品组', '组员', '第四研究室', '1020'],
    ['21', '郭岩成', '工程师', '产品组,研发组', '组员', '第四研究室', '1021'],
    ['22', '孙波', '工程师', '产品组,总体组', '组员', '第四研究室', '1022'],
    ['23', '赵杰伟', '工程师', '产品组', '组员', '第四研究室', '1023'],
    ['24', '王富成', '工程师', '产品组', '组员', '第四研究室', '1024'],
    ['25', '张磊', '助理工程师', '产品组', '组员', '第四研究室', '1025'],
    ['26', '齐云飞', '助理工程师', '产品组', '组员', '第四研究室', '1026'],
    ['27', '沈书戎', '助理工程师', '产品组', '组员', '第四研究室', '1027'],
    ['28', '曹景瑞', '助理工程师', '产品组', '组员', '第四研究室', '1028'],
    ['29', '邹富墩', '高级工程师', '研发组', '组长', '第四研究室', '1029'],
    ['30', '杨健', '工程师', '研发组', '副组长', '第四研究室', '1030'],
    ['31', '杨春迪', '工程师', '研发组', '组员', '第四研究室', '1031'],
    ['32', '赵计贺', '助理工程师', '研发组', '组员', '第四研究室', '1032'],
    ['33', '丁泉森', '助理工程师', '研发组,产品组', '组员', '第四研究室', '1033'],
    ['34', '毕清博', '工程师', '研发组', '组员', '第四研究室', '1034'],
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
  let isYuanColumn = false;

  for (let i = 0; i < firstRow.length; i++) {
    const cell = firstRow[i].trim();
    if (/^序号$|^编号$|^id$/i.test(cell) && nameCol === -1 && codeCol === -1) {
      continue; // 跳过纯序号列
    }
    if (/项目名[称陈]|名称/.test(cell) && nameCol === -1) nameCol = i;
    else if (/工作令号|令号|项目编号|任务单号|任务令号|令号编号/.test(cell) && codeCol === -1) codeCol = i;
    else if (/合同[金总]?额|合同[总]?价|项目[金总]?额|[总]?金额|[总]?经费|[总]?预算|[总]?产值/i.test(cell) && contractCol === -1) {
      contractCol = i;
      if (/[\(（]元[\)）]|单位[:：\s]*元/i.test(cell)) {
        isYuanColumn = true;
      }
    }
    else if (/项目负责人|负责人|项目经理|责任人|总师|负责人姓名/.test(cell) && ownerCol === -1) ownerCol = i;
    else if (/开始[日期月份时间]?|启动[日期月份时间]?|立项[日期月份时间]?/.test(cell) && startCol === -1) startCol = i;
    else if (/结束[日期月份时间]?|截止[日期月份时间]?|交付[日期月份时间]?|完成[日期月份时间]?|结项[日期月份时间]?/.test(cell) && endCol === -1) endCol = i;
    else if (/客户[名称主体]?|发包方|委托方|委托单位|用户单位/.test(cell) && clientCol === -1) clientCol = i;
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
    
    // 金额解析与自适应容错：兼容万元/元、千分位、科学计数法、Excel浮点超长小数及待定金额
    let contract = 10_000_000;
    try {
      if (rawContract && String(rawContract).trim()) {
        const rawTrimmed = String(rawContract).trim();
        const isYuan = (isYuanColumn && !/万/.test(rawTrimmed)) || (/[元圆]$/.test(rawTrimmed) && !/万/.test(rawTrimmed));
        contract = toMoney(isYuan && !/[元圆]$/.test(rawTrimmed) ? `${rawTrimmed}元` : rawTrimmed);
      }
    } catch {
      // 容错兜底：若该行金额填写了“待定/暂无”或其它无法识别的文本，安全使用默认 10 万元（10_000_000 分），不阻断整表导入
      contract = 10_000_000;
    }

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

// 解析部门员工花名册 CSV（支持：序号、姓名、职务、专业组、专业组职务、部门、工号，并智能推断部门与角色）
export function parseEmployeeCsvText(csvText: string) {
  const rows = parseCsv(csvText);
  if (rows.length === 0) return [];

  const firstRow = rows[0];
  let nameCol = -1, posCol = -1, grpCol = -1, grpRoleCol = -1, deptCol = -1, emailCol = -1, roleCol = -1, noCol = -1;

  for (let i = 0; i < firstRow.length; i++) {
    const cell = firstRow[i].trim();
    if (/^序号$|^编号$/i.test(cell) && nameCol === -1) {
      continue; // 跳过纯序号列
    }
    if (/^工号$|^员工工号$|^员工编号$|^唯一ID$|^ID$|^工号号$/i.test(cell) && noCol === -1) noCol = i;
    else if (/姓名|员工姓名|名字/.test(cell) && nameCol === -1) nameCol = i;
    else if (/^职务$|^岗位$|^职位$|^职称$/.test(cell) && posCol === -1) posCol = i;
    else if (/^专业组$|^所属专业组$|^分组$/.test(cell) && grpCol === -1) grpCol = i;
    else if (/专业组职务|组内职务|专业职务|组内角色/.test(cell) && grpRoleCol === -1) grpRoleCol = i;
    else if (/部门|所属部门|科室/.test(cell) && deptCol === -1) deptCol = i;
    else if (/邮箱|邮件|email/i.test(cell) && emailCol === -1) emailCol = i;
    else if (/角色|权限|系统角色/.test(cell) && roleCol === -1) roleCol = i;
  }

  let dataRows = rows;
  const hasHeader = nameCol !== -1 || posCol !== -1 || grpCol !== -1 || noCol !== -1;
  if (hasHeader) {
    dataRows = rows.slice(1);
  } else {
    // 兼容花名册格式（无表头或纯数据行）
    if (firstRow.length >= 7 && /^\d+$/.test(firstRow[0].trim())) {
      // 序号(0), 姓名(1), 职务(2), 专业组(3), 专业组职务(4), 部门(5), 工号(6)
      nameCol = 1;
      posCol = 2;
      grpCol = 3;
      grpRoleCol = 4;
      deptCol = 5;
      noCol = 6;
    } else if (firstRow.length >= 6 && /^\d+$/.test(firstRow[0].trim())) {
      // 序号(0), 姓名(1), 职务(2), 专业组(3), 专业组职务(4), 工号(5)
      nameCol = 1;
      posCol = 2;
      grpCol = 3;
      grpRoleCol = 4;
      noCol = 5;
    } else if (firstRow.length >= 5 && /^\d+$/.test(firstRow[0].trim())) {
      // 序号(0), 姓名(1), 职务(2), 专业组(3), 专业组职务(4)
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
    id?: string;
    employeeNo?: string;
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
    const rawNo = noCol !== -1 ? (row[noCol + offset] || '').trim() : '';

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
      id: rawNo || undefined,
      employeeNo: rawNo || undefined,
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
export const APP_VERSION = '0.7.8';
export const APP_BUILD = '20261024';
export const APP_AUTHOR = '邹富敦 (Phudon Zou) / TOPFIRE 研发团队';
export const APP_CONTACT = 'zoufudun@163.com';

// 官方代码与发布仓库及 GitHub Pages
export const GITHUB_REPO = 'zoufudun/hengji';
export const GITHUB_REPO_URL = 'https://github.com/zoufudun/hengji';
export const GITHUB_RELEASES_URL = 'https://github.com/zoufudun/hengji/releases';
export const GITHUB_PAGES_URL = 'https://zoufudun.github.io/hengji/';

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseName: string;
  releaseNotes: string;
  publishedAt: string;
  downloadUrl: string;
  htmlUrl: string;
  checkedAt: string;
  error?: string;
}

export function compareSemver(v1: string, v2: string): number {
  const p1 = (v1 || '').trim().replace(/^[vV]/, '').split('.').map(n => parseInt(n, 10) || 0);
  const p2 = (v2 || '').trim().replace(/^[vV]/, '').split('.').map(n => parseInt(n, 10) || 0);
  const len = Math.max(p1.length, p2.length, 3);
  for (let i = 0; i < len; i++) {
    const a = p1[i] || 0;
    const b = p2[i] || 0;
    if (a > b) return 1;
    if (a < b) return -1;
  }
  return 0;
}

export async function checkAppUpdate(currentVersion = APP_VERSION): Promise<UpdateCheckResult> {
  const checkedAt = new Date().toLocaleString();
  const defaultResult: UpdateCheckResult = {
    hasUpdate: false,
    currentVersion,
    latestVersion: currentVersion,
    releaseName: '',
    releaseNotes: '',
    publishedAt: '',
    downloadUrl: GITHUB_RELEASES_URL,
    htmlUrl: GITHUB_RELEASES_URL,
    checkedAt,
  };

  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), 9000) : null;
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      signal: controller ? controller.signal : undefined,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
      cache: 'no-cache',
    });
    if (timeout) clearTimeout(timeout);

    if (res.status === 404 || res.status === 403 || res.status === 429) {
      // API 受限或暂无 Release 时，自动回退到 raw.githubusercontent.com 查询 package.json 保证可用性
      try {
        const rawRes = await fetch(`https://raw.githubusercontent.com/${GITHUB_REPO}/main/package.json`, { cache: 'no-cache' });
        if (rawRes.ok) {
          const rawPkg = await rawRes.json();
          const rawVersion = String(rawPkg.version || '').trim();
          const hasUpdate = compareSemver(rawVersion, currentVersion) > 0;
          return {
            hasUpdate,
            currentVersion,
            latestVersion: rawVersion || currentVersion,
            releaseName: hasUpdate ? `v${rawVersion} 全新版本` : `v${currentVersion} 最新稳定版`,
            releaseNotes: hasUpdate ? '发现全新发布版本，请点击下方按钮直接下载更新。' : '当前系统已处于官方最新稳定状态。',
            publishedAt: new Date().toLocaleDateString(),
            downloadUrl: `${GITHUB_RELEASES_URL}/download/v${rawVersion}/衡绩员工绩点考核系统-${rawVersion}.exe`,
            htmlUrl: `${GITHUB_RELEASES_URL}/tag/v${rawVersion}`,
            checkedAt,
          };
        }
      } catch {}

      if (res.status === 404) {
        return {
          ...defaultResult,
          error: '暂无可用的线上发行版本（官方正在准备首发 Release）',
        };
      }
    }

    if (!res.ok) {
      throw new Error(`GitHub 响应异常 (HTTP ${res.status})`);
    }

    const data = await res.json();
    const tagName = String(data.tag_name || '').trim();
    const cleanTag = tagName.replace(/^[vV]/, '');
    const releaseName = String(data.name || tagName);
    const releaseNotes = String(data.body || '该版本暂无详细说明。');
    const publishedAt = data.published_at ? new Date(data.published_at).toLocaleDateString() : '';
    const htmlUrl = data.html_url || `${GITHUB_REPO_URL}/releases/tag/${tagName}`;

    let downloadUrl = htmlUrl;
    if (Array.isArray(data.assets) && data.assets.length > 0) {
      const exeAsset = data.assets.find((a: any) => typeof a.name === 'string' && a.name.toLowerCase().endsWith('.exe'));
      if (exeAsset && exeAsset.browser_download_url) {
        downloadUrl = exeAsset.browser_download_url;
      }
    }

    const hasUpdate = compareSemver(cleanTag, currentVersion) > 0;

    return {
      hasUpdate,
      currentVersion,
      latestVersion: cleanTag || currentVersion,
      releaseName,
      releaseNotes,
      publishedAt,
      downloadUrl,
      htmlUrl,
      checkedAt,
    };
  } catch (err: any) {
    try {
      const rawRes = await fetch(`https://raw.githubusercontent.com/${GITHUB_REPO}/main/package.json`, { cache: 'no-cache' });
      if (rawRes.ok) {
        const rawPkg = await rawRes.json();
        const rawVersion = String(rawPkg.version || '').trim();
        const hasUpdate = compareSemver(rawVersion, currentVersion) > 0;
        return {
          hasUpdate,
          currentVersion,
          latestVersion: rawVersion || currentVersion,
          releaseName: hasUpdate ? `v${rawVersion} 全新版本` : `v${currentVersion} 最新稳定版`,
          releaseNotes: hasUpdate ? '发现全新发布版本，请点击下方按钮直接下载更新。' : '当前系统已处于官方最新稳定状态。',
          publishedAt: new Date().toLocaleDateString(),
          downloadUrl: `${GITHUB_RELEASES_URL}/download/v${rawVersion}/衡绩员工绩点考核系统-${rawVersion}.exe`,
          htmlUrl: `${GITHUB_RELEASES_URL}/tag/v${rawVersion}`,
          checkedAt,
        };
      }
    } catch {}

    return {
      ...defaultResult,
      error: `检查更新失败: ${err.message || '网络连接超时，请检查是否能正常访问 GitHub'}`,
    };
  }
}

export type VersionUpdate = {
  version: string;
  date: string;
  tag: '重大更新' | '重大修复' | '功能增强' | '安全优化' | '常规迭代';
  title: string;
  items: string[];
};

export const UPDATE_HISTORY: VersionUpdate[] = [
  {
    version: 'v0.7.8',
    date: '2026-10-24',
    tag: '重大体验升级',
    title: '侧边栏徽标尊贵加大、二维透视矩阵全量规范以万为单位、前五名榜单直观重构、多格式覆盖安装进程监控修复',
    items: [
      '【品牌徽标尊贵加大】侧边栏金黄底朱红圆角“衡”字主徽标尺寸升级（加大至 52px），搭配 21px 品牌字体，视觉中心更为稳重大气。',
      '【二维透视矩阵绩点全量规范以“万”呈现】修正二维透视矩阵视图中的单位计算，各项目分润与右侧【个人累加】、底行【项目累加】全量以“万元”为标准单位严格对齐，表头清晰标注“个人累加 (万)”。',
      '【当月个人绩点前五名直观榜单重构】全新设计排行榜视觉体验：前三名金银铜牌勋章、员工专属头像与团队标签、高辨识度进度柱状对比条、万元清晰数值呈现，直观震撼一目了然。',
      '【覆盖安装与多格式安装进程全面修复】彻底修复覆盖安装、MSI安装、单文件覆盖、解压覆盖退出后无安装进程的问题：升级安装向导与进程调度机制，显示实时安装覆盖控制台与向导界面，进程平滑接管无缝重启。',
      '【GitHub 发布文件命名全面统一】GitHub 发布资产全部规范统一为 hengji-0.7.8.msi、hengji-0.7.8.exe、hengji-0.7.8.zip，以及免安装单文件 hengji-portable-0.7.8.exe。'
    ]
  },
  {
    version: 'v0.7.7',
    date: '2026-10-23',
    tag: '重大更新',
    title: 'MSI安装包双击安装向导修正、顶部导航栏精简、彩花徽标换新、新增ZIP免安装解压即用版',
    items: [
      '【MSI 安装体验全面修正】调整 Windows Installer 配置为 assisted 向导模式（oneClick: false），双击即可调出标准安装向导，支持自由选择安装目录并自动生成快捷方式。',
      '【顶部导航栏极简纯粹】移除顶部导航栏中的“关于”与“操作手册”按钮，操作界面更聚焦，杜绝冗余视觉干扰。',
      '【弹窗徽标全面换新】系统版本更新与关于弹窗徽标全面换新为现代明艳的八彩同心绽放花瓣 Logo，带来更具活力的高品质科技感。',
      '【新增 ZIP 压缩包免安装版】发布标准 .zip 绿色压缩版本，用户下载后直接解压即可运行，无需执行任何安装，适配各类型受限终端。',
      '【自动化更新支持全格式】更新模块同步支持 Setup EXE、MSI、Portable 与 ZIP 多格式智能静默覆盖安装与自动重启。'
    ]
  },
  {
    version: 'v0.7.6',
    date: '2026-10-23',
    tag: '重大更新',
    title: '合同金额与员工绩点明确按万为单位、纯粹加大金黄衡徽标、发布安装版(EXE/MSI)与自动安装覆盖重启',
    items: [
      '【合同金额与员工绩点全域以万为单位】所有台账大盘、报表矩阵、成员档案与弹窗表头全量规范标注为“(万)”与“(万元)”，数值统一以万为单位折算。',
      '【品牌标识纯粹化与衡徽标加大】彻底移除八彩花瓣辅助标，侧边栏与更新中心纯粹聚焦并突出金黄底朱红圆角“衡”字徽章（尺寸加大至 42px），搭配“衡绩考核”四字，端庄大气，权威尊贵。',
      '【新增安装版本发布（MSI 格式与 EXE 格式）】正式支持 Windows 标准安装包向导 (.exe)、企业级 Windows Installer 安装包 (.msi) 以及单文件绿色便携版 (.exe) 全矩阵发布。',
      '【新版本自动下载覆盖安装并重启】在线检测到新版本后，支持全自动下载安装包并静默安装至当前程序目录（覆盖旧版本），并在安装完成后自动启动新版本，平滑升级零丢失。'
    ]
  },
  {
    version: 'v0.7.5',
    date: '2026-10-23',
    tag: '常规迭代',
    title: '品牌双徽标全面升级为金黄圆角衡章与八彩花瓣、侧栏品牌布局文字更新为“衡绩考核”、更新包自动下载至D盘并定位高亮',
    items: [
      '【品牌双图标全面焕新】系统品牌标识左侧升级为金黄底色、朱红圆角边框、端庄“衡”字并内嵌火炬薪火的圆角衡章，微圆角遮罩配微阴影彻底消除白边；右侧辉映高质感八彩同心绽放花瓣。',
      '【侧栏品牌文字优化为“衡绩考核”】侧边栏品牌区域品牌文字正式更新为“衡绩考核”（严格 4 个汉字），文字居中水平中线严密对齐。',
      '【更新包实体下载至D盘并定位高亮】告别界面模拟，更新包真实物理落地保存至本地 D 盘（D:\\衡绩员工绩点考核系统-0.7.5.exe），下载完成后自动呼出资源管理器并高亮选中。'
    ]
  },
  {
    version: 'v0.7.4',
    date: '2026-10-23',
    tag: '重大更新',
    title: '全量绩点与合同统一为万元与6位小数规范、甲骨文与彩瓣双图标、启动自动检测与动态光圈提醒',
    items: [
      '【全量绩点与合同规范统一为万元】系统全链路（大盘概览、项目管理、月度分配、荣誉殿堂、统计报表及 CSV 导出）全面升级为统一的“万元”单位，数值格式化最多保留 6 位小数，杜绝以往“元/分”混淆，精度兼具严谨与纯粹。',
      '【甲骨文“衡”字艺术标与现代彩瓣双图标】系统品牌标识全面升级为高端双图标架构：左侧呈献古雅高洁的甲骨文“衡”字艺术徽标（天平权衡之形），右侧交相辉映八彩活力花瓣图腾，传统古韵与现代科技相得益彰。',
      '【软件启动自动检测与矩形框动态光圈提醒】软件冷启动后自动异步检测 GitHub 线上版本；当探测到新版本时，界面呼出极具视觉冲击力的“矩形框旋转动态光圈（Border Beam & Neon Aura）”浮动卡片，醒目而尊贵地引导用户一键直通升级。'
    ]
  },
  {
    version: 'v0.7.3',
    date: '2026-10-23',
    tag: '重大更新',
    title: '版本更新中心轻奢视觉重构 (CC Switch 风格)、操作手册与底栏精简纯净化、GitHub Pages 自动化部署',
    items: [
      '【版本更新中心视觉重构】在线更新弹窗重构为高辨识度现代卡片（参考 CC Switch 风格），整合软件标识、当前版本、醒目橙色一键更新通道、官方网站、更新日志与近期更新快捷抽屉，并新增 GitHub Star 点赞号召横幅。',
      '【侧栏底栏精简纯净化】侧栏底栏移除繁杂的嵌入更新按钮，优雅保持左侧版本号标识、右侧仅保留“操作手册”与“关于”双核入口，空间布局舒展清爽。',
      '【检查更新交互升级】关于窗口标签栏新增高质感“检查更新...”按钮，弹窗呼出动效丝滑，检测与一键下载体验一气呵成。',
      '【GitHub Pages 自动化云端部署】配置自动化 GitHub Actions Pages 工作流，桌面端与网页版无缝同步构建并部署至 https://zoufudun.github.io/hengji/。'
    ]
  },
  {
    version: 'v0.7.2',
    date: '2026-10-23',
    tag: '重大更新',
    title: '卓越绩星荣誉殿堂重磅升级、全景工作区严格物理隔离与在线版本更新支持',
    items: [
      '【系统在线更新与检测】新增在线检测版本更新机制与升级下载通道，直连 GitHub Releases 官方仓库，一键检测最新发行版本并提供在线下载与更新日志查阅。',
      '【考核之星殿堂优美升华 · 卓越绩星荣誉殿堂】殿堂全面升级命名为“卓越绩星荣誉殿堂”，修复组件图标依赖异常，上半区展示月度/季度/年度三大荣誉勋章金卡展台，下半区无缝承接月度、季度、年度与自定义区间四大统计维度的全景排行榜。',
      '【综合管理工作区与核算员工作区彻底隔离】严格划分职责边界，综合管理工作区剥离核算员专区内容与跨部门数据归集通道，纯粹聚焦项目全周期管理、月度分配、团队编制与全景分析；核算员工作区独立呈现专属数据包导入与全盘多维透视矩阵。',
      '【全景合同矩阵与高端专业导航体系】“部门合同额度大盘”全面升级命名为“全景合同矩阵”，侧边栏及所有标签页全面升级为更具美感的殿堂级专业命名，美化侧边栏分类微胶囊与微光细线。',
      '【防解包崩溃与错误边界全域加固】对荣誉殿堂计算实施多层级可选链安全访问与 try/catch 隔离保护，增强多数据包合并中跨项目组员姓名的严格映射，彻底杜绝渲染与计算异常。'
    ]
  },
  {
    version: 'v0.7.1',
    date: '2026-10-22',
    tag: '重大更新',
    title: '核算员总览看板风格对齐、数据导入独立页面与考核之星殿堂尊贵重构',
    items: [
      '【核算员总览看板保持图1经典排版】严格按照系统总览大盘风格，提供柔和浅绿 Hero 大横幅、核心考核规则卡片、4项核心指标大卡、左列“本月之星与年度领跑”以及右列“个人绩点前五名”优雅布局。',
      '【数据导入独立成页与清单管理】将原置于汇总顶部的操作栏、智能拖拽识别区、已导入项目数据包清单与4大指标卡单独放置为一个全新独立导航与页面【数据导入】，支持高效批量导入、清单查看与移除清空。',
      '【导航细目页面全面纯净化】“部门全员汇总”、“部门合同额度大盘”、“全员绩点排名”、“考核之星殿堂”、“全项目二维透视”、“全量流水明细”等导航项全面去除导入操作条与统计卡，直接呈现纯粹干净的报表内容。',
      '【考核之星殿堂尊贵升级为图5样式】更名为【考核之星殿堂】，全面重构为深绿尊贵荣誉横幅、月度之星金卡+月份选择器、季度之星金卡+季度选择器、年度之星金卡及全员考核榜单，与图5完全一致。'
    ]
  },
  {
    version: 'v0.7.0',
    date: '2026-10-22',
    tag: '重大更新',
    title: '核算员工作区全面重构、多数据包拖拽识别与全生命周期持久化升级',
    items: [
      '【多数据包批量导入与智能拖拽识别】支持在核算员工作区及数据中心一次性批量选择或拖拽识别多个项目分配数据包（.json）、多项目合包与总包，自动解析合并，实时展示导入项目清单与额度统计。',
      '【核算员导入数据全生命周期持久化】彻底修复核算员导入数据包后切换页面再返回导致数据丢失的问题；数据包完整纳入工作区加密持久化与本地存储，页面切换、锁定或重新打开数据不失效。',
      '【核算员工作区全新重构】纯粹聚焦汇总与统计，彻底剥离项目创建、月度分配、项目组管理等非核算员职能；左侧导航栏深度整合“总览看板、部门全员汇总、部门合同额度大盘、全员绩点排名、考核执行殿堂、全项目二维透视、全量流水明细、趋势与柱状图、分配规则准则、数据导入导出与灾备”，避免重复显示，布局一目了然。',
      '【核心聚焦四大统计维度】紧扣核算员工作重心，重点透视与监控全员绩点排名、全员绩点细目、考核之星殿堂（月/季/年度之星）、合同总额及额度消耗进度，赋能高效核算。'
    ]
  },
  {
    version: 'v0.6.3',
    date: '2026-10-21',
    tag: '重大更新',
    title: '员工唯一工号跨项目数据包精准合并识别机制与全量绩点以万为单位导出规范',
    items: [
      '【修复多数据包组员同名合并重大缺陷】彻底解决绩效核算员汇总不同项目负责人发送的数据包时，因本地ID不一致导致同名组员未合并或重名员工误合并的缺陷。',
      '【部门员工管理全面引入唯一工号列】在员工与专业组管理中增加“工号”核心列与唯一性校验，支持手动编辑、标准花名册 CSV 批量导入导出，项目组名单与团队配置中显式关联并呈现工号。',
      '【项目分配数据包与全员汇总引擎升级】项目分配绩点数据包（.json）及细目流水中全面记录员工唯一工号；核算员自动汇总时严格以唯一工号/ID为判定准则执行跨项目数据合并与求和，确保同人同号100%精准汇流、不同人同名清晰隔离。',
      '【导出的绩点数据全量以万为单位】全面规范所有报表导出标准，全员跨项目绩点总表、各项目分配额度对照表、二维透视矩阵、全量明细流水及周期绩效报表等所有 CSV 导出的绩点数据统一以“万元”为标准单位，与财务及合同额度无缝接轨。'
    ]
  },
  {
    version: 'v0.6.2',
    date: '2026-10-20',
    tag: '重大更新',
    title: '首次启动新手操作引导、五步核心业务闭环向导与简易操作手册',
    items: [
      '【首次启动操作引导】初次进入工作区自动弹出“新手操作引导”，提供 5 步核心业务闭环操作指引（第1步新建工作区、第2步导入项目与员工、第3步项目库配置与全周期额度规划、第4步月度分配与一键发布、第5步周期报表与荣誉透视）。',
      '【全场景便捷入口】在“选择安全工作区”启动页新增新手 5 步向导与图文手册入口，在顶部操作栏常驻“📖 操作手册”与“💡 新手引导”快捷按钮，在侧边栏底部提供常驻手册链接，支持随时查阅并一键跳转对应功能模块。',
      '【软件界面深度集成简易操作手册】在软件内直接集成完整的图文并茂操作手册（含 7 大章节、ASCII 业务流程图、前低后高额度曲线、二维透视矩阵与新手 FAQ 避坑指南），支持在软件内直接点击阅读，随读随练。'
    ]
  },
  {
    version: 'v0.6.1',
    date: '2026-10-19',
    tag: '功能增强',
    title: '工作区类型前置与界面自适应优化、项目数据包双通道导出',
    items: [
      '【工作区类型与应用场景优化】移除单独的项目负责人工作区，新建工作区首位前置“综合管理工作区”，次位提供“绩效核算工作区”，权限与职责分工更为清晰。',
      '【项目数据包双通道导出】在“项目库与额度管理”与“数据导入导出与系统灾备中心”同时提供“导出项目数据包”功能，项目负责人可一键导出负责项目的合包，系统管理员可一键导出全系统全量项目数据包合包。',
      '【界面自适应布局与视觉优化】彻底移除顶部栏拥挤折行的工作区标签，重构顶部栏与操作区弹性响应式布局，解决小窗口下按钮折行问题；全面优化数据导入导出中心排版，消除宽屏大面积空白，提供更舒展的视觉体验。',
      '【核算中心荣誉之星与部门合同大盘】全面打通全员绩点排名颁奖台、月度/季度/年度荣誉之星评定及全部门合同额度执行大盘监控。'
    ]
  },
  {
    version: 'v0.6.0',
    date: '2026-10-19',
    tag: '重大更新',
    title: '绩效核算员全项目全员绩点自动汇总与分配数据包流转中心',
    items: [
      '【新增绩效核算员（auditor）专属角色权限体系】在系统角色中正式开辟“绩效核算员”权限，与系统管理员（admin）及普通员工（member）形成精准的角色分权体系。核算员拥有专属的“全项目全员绩点汇总中心”工作台、数据包导入与汇总导出权，严密隔离普通成员越权查看全项目汇总数据。',
      '【项目负责人导出项目分配绩点数据包】项目负责人在完成本项目各周期分配后，可在项目库卡片、方案列表或项目详情中一键导出《项目分配绩点数据包 (.json)》，数据包完整涵盖：① 本项目分配额度情况（合同金额、已分配额度、剩余额度及比例）；② 项目内每个人的绩点总和与占比；③ 每一笔月度分润明细流水与工作履职内容，支持无损外发给核算员。',
      '【核算员自动汇总工作台（多数据包合并与一键读取）】核算员在专享模块中支持单选/批量多选/直接拖拽多位项目负责人发来的数据包，亦支持在单库模式下一键载入当前系统全部项目。系统秒级自动完成跨项目数据合并与汇总计算。',
      '【四大全景透视维度】工作台提供无缝切换的四大维度：① 全员跨项目绩点总表（汇总每个人在所有项目累计获得的绩点总和、折合万元、贡献项目数及个人明细下钻档案）；② 各项目分配额度情况对照表（直观比对各项目合同额、已分配、剩余额度与健康状态）；③ 全项目全员二维透视矩阵（矩阵呈现人×项目绩点，右侧个人累加，最底行项目累加及终极总额双向守恒）；④ 全量明细流水表。',
      '【多维核算报表导出与归档总包】支持导出全员绩点总表 CSV、各项目分配额度对照表 CSV、二维透视矩阵 CSV、全量明细流水 CSV，以及可用于系统归档审计的《核算汇总完整数据总包 (.json)》。',
      '【身份委任与快捷切换】在顶部身份面板支持一键委任部门成员为“📊 绩效核算员”，并支持在管理员、核算员、项目负责人与普通成员之间自由切换操作身份。'
    ]
  },
  {
    version: 'v0.5.5',
    date: '2026-10-19',
    tag: '重大修复',
    title: '合同分配细目隔离修复与周期报表项目累加计算',
    items: [
      '【彻底修复同令号多合同细目串联重复计算缺陷】解决母子项目或相同工作令号（如 23-0181 下的 EA1 LDC、EA1 S部、EA1 W部等12个合同）在导出周期报表时细目数值完全相同且重复放大的严重问题。明细提取严格锁定项目唯一 ID（projectId === project.id），确保每个合同独立精准核算自身实际额度。',
      '【周期报表项目累加与双向求和闭环】按照标准透视矩阵格式，在报表底部新增浅蓝高亮的“项目累加”汇总行，精准汇总每个合同/工作令号下所有员工的获得绩点总计，右下角展示全系统总额双向闭环累加和。',
      '【周期报表矩阵透视与榜单双视图】界面端周期绩点报表新增“矩阵透视”与“全员榜单”无缝双视图切换，支持在系统内直观查验每个员工在每个合同的细目分润与底部的项目累加汇总。',
    ]
  },
  {
    version: 'v0.5.4',
    date: '2026-10-19',
    tag: '功能增强',
    title: '合同金额导入精度容错与多格式自适应解析强化',
    items: [
      '【彻底消除“金额最多保留六位小数”报错阻断】针对用户自 Excel、WPS 或财务系统导出 CSV 时常见的高精度浮点数（如 33.3333333333、50.100000000000001、8 位固定小数等），底层金额解析算法全面升级为安全自动四舍五入到“分”（对应万元 6 位小数），杜绝因小数位数超出而直接弹出错误打断导入。',
      '【合同金额列智能自适应识别】扩展表头匹配正则，全面兼容“合同额”、“合同额(万元)”、“合同总价”、“总金额”、“项目经费”、“总预算”、“产值”等多样化表头，杜绝因表头未命中回退导致令号或日期被误当金额解析。',
      '【千分位、货币符号与科学计数法兼容】自动清洗金额中的千分位逗号（如 1,309,000.00）、中文全角数字与全角点号、货币符号（¥、￥、$、RMB）及科学计数法（如 1.25E+05），并智能识别“元”与“万元”单位转换。',
      '【单行容错安全兜底】导入工作令 CSV 时，若单行金额为“待定”、“不确定”或空缺，自动安全兜底为标准额度并继续导入全表，彻底防止单个单元格格式瑕疵导致上百个项目导入失败。'
    ]
  },
  {
    version: 'v0.5.3',
    date: '2026-10-18',
    tag: '常规迭代',
    title: '输入框键盘焦点脱钩修复与数值录入体验优化',
    items: [
      '【彻底修复 Windows 键盘焦点脱钩】根治系统模态框（如文件打开/保存对话框、原生提示等）关闭后，Chromium 子窗口失去键盘焦点导致输入框“经常无法输入、必须最小化点击其他软件再激活才可输入”的系统级缺陷。',
      '【主进程与渲染进程硬件焦点双向保活】新增 workspace:refocus-window 原生 IPC 唤醒机制，在原生对话框返回、窗口激活及点击输入框时主动执行 win.webContents.focus() 恢复硬件按键消息分发。',
      '【输入框点击命中区与穿透优化】优化百分比输入框 (.suffix-input) 样式，针对后缀百分号 % 设置 pointer-events: none 防遮挡，并在容器点击时自动将光标注入输入框，杜绝边缘命中失败。',
      '【受控组件录入阻截彻底消除】将月度分配比例、成员占比及规划额度输入框从原生 number 升级为 text (inputMode=\"decimal\")，配合本地缓冲与失焦归一化，支持顺畅输入小数点、0、连续退格与编辑，杜绝数字被截断吞没。'
    ]
  },
  {
    version: 'v0.5.2',
    date: '2026-10-18',
    tag: '常规迭代',
    title: '全屏与非全屏自适应布局优化与双层控制台重构',
    items: [
      '【非全屏与中窄屏自适应】彻底解决非全屏（中等/窄窗口如 1000px-1366px）下月度分配工具栏与统计指标折行断截、界面凌乱的问题，实现全屏与非全屏无缝平滑自适应。',
      '【标题与操作区防挤压】优化页面标题与主副视图切换按键布局，设置弹性伸缩与文字防折行保护，杜绝“全项目当月集中管理”等按键文字断词换行。',
      '【双层响应式控制台重构】将月度分配操作工具栏升级为结构清晰的双层高内聚面板：上层统一承载状态筛选胶囊、自适应搜索框与自动化填充工具；下层专注负责快捷多选工具与“🚀 批量发布 / ↩ 批量撤回”核心执行操作，消除孤行悬挂。',
      '【指标卡片自适应平整排布】指标概览卡片（项目总计、配置进度、全周期规划、当月分配）优化为紧凑平整排列，自适应伸缩不换行。'
    ]
  },
  {
    version: 'v0.5.1',
    date: '2026-10-18',
    tag: '功能增强',
    title: '批量撤回独立强化与快捷全选体系',
    items: [
      '【独立常驻的批量撤回按键】在月底分配与全项目集中管理看板常驻提供“↩ 批量撤回”一级操作按键，支持一键撤回勾选的已发布项目或当月全部已发布方案。',
      '【多模式快捷勾选工具条】表格上方新增快捷勾选栏，提供“全选当月草稿”、“全选当月已发布”、“全选所有项目”与“清空选择”，支持清晰掌握勾选状态。',
      '【批量撤回前置安全确认】批量撤回时弹出明确的确认提示，说明撤回后转为草稿并暂时从当月报表中移出，支持无缝重新调整额度与人员。',
      '【单项目历史明细联动支持】单项目各月份明细视图中同样新增“批量撤回已发布”快捷入口，方便单项目整周期或历史调整。'
    ]
  },
  {
    version: 'v0.5.0',
    date: '2026-10-18',
    tag: '重大更新',
    title: '月底分配全项目集中管理与批量修改发布',
    items: [
      '【全项目月度集中管理】新增“全项目当月集中管理”透视看板，在一个界面集中呈现当月全部项目的合同额、规划额度、当月分配额度与状态，彻底免除逐个项目来回切换弹窗的繁琐操作。',
      '【各项目月度分配批量修改】支持在集中面板中行内直接调整各项目的月度分配比例与折合金额，提供增减微调、规划额度偏差对比与一键批量保存所有修改。',
      '【一键批量发布与撤回】支持勾选多个项目或全选当月所有草稿方案，一键批量发布入库生效，并记录审计日志；同时支持批量撤回草稿，极大提升月末结算效率。',
      '【规划额度与团队模板一键联动】支持“⚡ 一键按全周期规划填充当月额度”与“👥 一键套用项目组默认成员分配”，高效完成初稿配置后只需微调即可直接发布。'
    ]
  },
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
      salt: new Uint8Array(salt),
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
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        new Uint8Array(ciphertext)
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
  let nameCol = -1, groupCol = -1, positionCol = -1, deptCol = -1, noCol = -1;
  for (let i = 0; i < firstRow.length; i++) {
    const cell = firstRow[i].trim();
    if (/^序号$|^编号$/i.test(cell) && nameCol === -1) continue;
    if (/^工号$|^员工工号$|^员工编号$|^唯一ID$|^ID$/i.test(cell) && noCol === -1) noCol = i;
    else if (/姓名|员工|成员/.test(cell) && nameCol === -1) nameCol = i;
    else if (/专业组|分组|组别/.test(cell) && groupCol === -1) groupCol = i;
    else if (/职务|岗位|角色|职称/.test(cell) && positionCol === -1) positionCol = i;
    else if (/部门|科室/.test(cell) && deptCol === -1) deptCol = i;
  }
  let dataRows = rows;
  if (nameCol !== -1 || noCol !== -1) {
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
    const rawNo = noCol !== -1 ? (row[noCol] || '').trim() : '';
    const rawGroup = groupCol !== -1 ? (row[groupCol] || '').trim() : '';
    const rawPos = positionCol !== -1 ? (row[positionCol] || '').trim() : '';
    const rawDept = deptCol !== -1 ? (row[deptCol] || '').trim() : '';

    const existing = employees.find(e =>
      (rawNo && (e.employeeNo === rawNo || e.id === rawNo)) ||
      e.name === rawName ||
      e.id === rawName
    );
    if (existing) {
      if (rawNo && !existing.employeeNo) existing.employeeNo = rawNo;
      if (!memberIds.includes(existing.id)) {
        memberIds.push(existing.id);
        memberNames.push(existing.name);
      }
    } else {
      const newId = rawNo || `emp_${crypto.randomUUID().slice(0, 8)}`;
      const newEmp: Employee = {
        id: newId,
        employeeNo: rawNo || undefined,
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
  const headers = ['工号', '员工姓名', '当月分配比例(%)', '当月工作内容描述', '专业组', '部门'];
  const examples = [
    ['1029', '邹富敦', '30', '主导系统核心通信架构与关键性能调优', '研发组', '研发中心'],
    ['1030', '杨健', '25', '负责数据解析算法研发与接口联调', '研发组', '研发中心'],
    ['1010', '赵淼', '20', '总体技术指标拆解与需求方案评审', '总体组', '总体部'],
    ['1012', '余烨', '15', '参与单元集成测试与软硬件可靠性验证', '总体组', '总体部'],
    ['1017', '孙骞', '10', '产品需求梳理与用户使用手册编制', '产品组', '产品部'],
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
  let nameCol = -1, rateCol = -1, workCol = -1, groupCol = -1, deptCol = -1, noCol = -1;
  for (let i = 0; i < firstRow.length; i++) {
    const cell = firstRow[i].trim();
    if (/^序号$|^编号$/i.test(cell) && nameCol === -1) continue;
    if (/^工号$|^员工工号$|^员工编号$|^唯一ID$|^ID$/i.test(cell) && noCol === -1) noCol = i;
    else if (/姓名|员工|成员/.test(cell) && nameCol === -1) nameCol = i;
    else if (/比例|额度比例|分配比例/.test(cell) && rateCol === -1) rateCol = i;
    else if (/工作内容|工作描述|任务|职责|内容/.test(cell) && workCol === -1) workCol = i;
    else if (/专业组|分组/.test(cell) && groupCol === -1) groupCol = i;
    else if (/部门|科室/.test(cell) && deptCol === -1) deptCol = i;
  }
  let dataRows = rows;
  if (nameCol !== -1 || noCol !== -1) {
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
    const rawNo = noCol !== -1 ? (row[noCol] || '').trim() : '';
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

    const existing = employees.find(e =>
      (rawNo && (e.employeeNo === rawNo || e.id === rawNo)) ||
      e.name === rawName ||
      e.id === rawName
    );
    let targetId = existing?.id;
    if (!targetId) {
      targetId = rawNo || `emp_${crypto.randomUUID().slice(0, 8)}`;
      const newEmp: Employee = {
        id: targetId,
        employeeNo: rawNo || undefined,
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
    } else if (rawNo && !existing?.employeeNo) {
      existing.employeeNo = rawNo;
    }
    entries.push({ employeeId: targetId, rate: parsedRate, workContent: rawWork });
    memberNames.push(rawName);
  }
  return { entries, memberNames, newEmployees };
}

// 常用项目组模版（含月度默认分配额度比例）
export function getProjectGroupTemplateCsv(): string {
  const headers = ['工号', '员工姓名', '月度默认分配比例(%)', '当月工作内容', '专业组', '职务', '部门', '备注'];
  const examples = [
    ['1029', '邹富敦', '35', '主导系统核心通信架构与关键性能调优', '研发组', '高级工程师', '研发中心', '研发负责人'],
    ['1030', '杨健', '25', '负责数据解析算法研发与接口联调', '研发组', '工程师', '研发中心', '骨干研发'],
    ['1010', '赵淼', '20', '总体技术指标拆解与需求方案评审', '总体组', '工程师', '总体部', '总体设计'],
    ['1012', '余烨', '10', '底层驱动适配与联调', '总体组', '工程师', '总体部', '驱动研发'],
    ['1017', '孙骞', '10', '产品需求梳理与文档标准化', '产品组', '高级工程师', '产品部', '产品规范'],
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

// ============================================================================
// 绩效核算员核心业务：项目分配绩点数据包与全项目全员绩点汇总
// ============================================================================

export type ProjectMeritPackage = {
  version: '1.0';
  packageType: 'project_merit_package';
  generatedAt: string;
  exporter: {
    id: string;
    employeeNo?: string;
    name: string;
    position?: string;
    group?: string;
    role?: string;
  };
  period: {
    months: string[];
    periodLabel: string;
  };
  project: {
    id: string;
    code: string;
    name: string;
    client: string;
    contract: number; // 单位：分
    ownerId: string;
    ownerName: string;
    start: string;
    end: string;
    status: 'active' | 'archived';
    // 额度情况
    contractWan: number; // 合同总额(万元)
    historyCompletedAmount: number; // 历史完成(分)
    historyCompletedWan: number; // 历史完成(万元)
    periodAllocatedPoints: number; // 本包已分配绩点总和(分)
    periodAllocatedWan: number; // 本包已分配折合金额(万元)
    periodAllocatedRateBps: number; // 本包已分配基点(0-10000)
    allTimeAllocatedPoints: number; // 项目全周期已分配总绩点(分)
    allTimeAllocatedWan: number; // 项目全周期已分配总额度(万元)
    remainingWan: number; // 扣除所有已发布方案后的剩余额度(万元)
    remainingRateBps: number; // 剩余基点
  };
  // 每个人的绩点总和
  memberSummaries: {
    employeeId: string;
    employeeNo?: string;
    name: string;
    department: string;
    group?: string;
    position?: string;
    groupRole?: string;
    totalPoints: number; // 在本项目中获得的总绩点 (分)
    totalWan: number; // 折合金额 (万元)
    ratioInProject: number; // 占本项目本次分配总量的比例 (%)
    monthsCount: number; // 参与分配的月数
  }[];
  // 绩点分配明细
  details: {
    projectId: string;
    projectName: string;
    projectCode: string;
    month: string;
    employeeId: string;
    employeeNo?: string;
    employeeName: string;
    department: string;
    group?: string;
    position?: string;
    groupRole?: string;
    rate: number; // 当月个人分配率 (基点 0-10000)
    points: number; // 获得绩点 (分)
    wan: number; // 折合万元
    workContent?: string;
    planBudget: number; // 当月项目额度规划基点
    planStatus: 'published' | 'draft';
  }[];
  // 包含的方案原始数据
  plans?: Plan[];
};

export type AuditorSummaryResult = {
  overview: {
    packageCount: number; // 纳入核算的项目数
    totalContractWan: number; // 合同总额(万元)
    totalAllocatedWan: number; // 已分配总金额(万元)
    totalAllocatedPoints: number; // 已分配总绩点(分)
    totalEmployees: number; // 获得分配的员工数
    avgPointsPerEmployee: number; // 全员人均绩点(分)
    months: string[]; // 涉及月份
    periodLabel: string; // 周期说明
  };
  // 1. 全员跨项目绩点总和大表
  employeeSummaries: {
    id: string;
    employeeId: string;
    employeeNo?: string;
    name: string;
    department: string;
    group: string;
    position: string;
    groupRole: string;
    totalPoints: number; // 跨项目总绩点 (分)
    totalWan: number; // 折合总金额 (万元)
    projectCount: number; // 参与项目数
    projects: {
      projectId: string;
      projectName: string;
      projectCode: string;
      ownerName: string;
      points: number;
      wan: number;
      months: string[];
    }[];
    details: ProjectMeritPackage['details'];
    rank: number;
  }[];
  // 2. 项目分配额度情况对照表
  projectSummaries: {
    id: string;
    code: string;
    name: string;
    client: string;
    ownerName: string;
    contractWan: number; // 合同金额(万元)
    allocatedWan: number; // 已分配额度(万元)
    allocatedPoints: number; // 已分配绩点(分)
    allocatedRateBps: number; // 已分配比例 (基点)
    remainingWan: number; // 剩余额度(万元)
    remainingRateBps: number; // 剩余比例 (基点)
    headcount: number; // 参与分配人数
    recordCount: number; // 分配细项记录数
    healthStatus: 'normal' | 'warning' | 'completed';
    months: string[];
    packageSource?: string;
  }[];
  // 3. 二维透视矩阵
  matrix: {
    projectHeaders: { id: string; name: string; code: string; label: string }[];
    projects?: { id: string; name: string; code: string; label: string }[];
    rows: {
      index: number;
      employeeId: string;
      employeeNo?: string;
      name: string;
      group: string;
      position: string;
      scores: number[]; // 各项目的绩点 (分)
      rowTotalPoints: number; // 个人累加 (分)
    }[];
    projectTotals: number[]; // 各项目列累加 (分)
    grandTotalPoints: number; // 所有项目累加的终极总和 (分)
  };
  // 4. 全量明细
  allDetails: ProjectMeritPackage['details'];
  // 5. 专业组分布
  groupDistribution: {
    group: string;
    points: number;
    wan: number;
    headcount: number;
    ratio: number;
  }[];
};

/**
 * 项目负责人导出本项目分配绩点数据包
 */
export function exportProjectMeritPackage(
  state: State,
  projectId: string,
  options?: {
    months?: string[];
    status?: 'published' | 'all';
    actor?: Employee;
  }
): ProjectMeritPackage {
  const project = state.projects.find(p => p.id === projectId);
  if (!project) fail('项目不存在');

  const actor = options?.actor;
  if (actor && actor.role !== 'admin' && actor.role !== 'auditor' && project.owner !== actor.id) {
    fail('只有项目负责人、核算员或管理员可以导出该项目的分配数据包');
  }

  const statusFilter = options?.status || 'published';
  let targetPlans = state.plans.filter(p => p.projectId === project.id);
  if (statusFilter !== 'all') {
    targetPlans = targetPlans.filter(p => p.status === 'published');
  }
  if (options?.months && options.months.length > 0) {
    targetPlans = targetPlans.filter(p => options.months!.includes(p.month));
  }
  targetPlans.sort((a, b) => a.month.localeCompare(b.month));

  const owner = state.employees.find(e => e.id === project.owner);
  const ownerName = owner?.name || '未知负责人';

  const detail = projectAllocDetail(state, project.id);
  const contractWan = Number((project.contract / 1_000_000).toFixed(6));
  const historyCompletedAmount = project.historyCompletedAmount || 0;
  const historyCompletedWan = Number((historyCompletedAmount / 1_000_000).toFixed(6));

  const allTimeAllocatedPoints = detail?.publishedAmount || 0;
  const allTimeAllocatedWan = Number((allTimeAllocatedPoints / 1_000_000).toFixed(6));
  const remainingWan = Number(((detail?.remainingAmount ?? (project.contract - historyCompletedAmount)) / 1_000_000).toFixed(6));
  const remainingRateBps = detail?.remainingRate ?? Math.max(0, SCALE - (project.historyCompletedRate || 0));

  // 收集所选 plans 的分配明细
  const details: ProjectMeritPackage['details'] = [];
  const memberPointsMap = new Map<string, { points: number; wan: number; months: Set<string> }>();

  let periodAllocatedPoints = 0;
  let periodAllocatedRateBps = 0;

  for (const plan of targetPlans) {
    periodAllocatedRateBps += plan.budget;
    const allocations = planAllocations(project, plan);
    for (const alloc of allocations) {
      const emp = state.employees.find(e => e.id === alloc.employeeId || (e.employeeNo && e.employeeNo === alloc.employeeId));
      const empNo = emp?.employeeNo || (emp && !emp.id.startsWith('emp_') ? emp.id : undefined);
      const entry = plan.entries.find(e => e.employeeId === alloc.employeeId);
      const pts = alloc.points;
      const amountWan = Number((pts / 1_000_000).toFixed(6));

      periodAllocatedPoints += pts;

      let currentMember = memberPointsMap.get(alloc.employeeId);
      if (!currentMember) {
        currentMember = { points: 0, wan: 0, months: new Set<string>() };
        memberPointsMap.set(alloc.employeeId, currentMember);
      }
      currentMember.points += pts;
      currentMember.wan += amountWan;
      currentMember.months.add(plan.month);

      details.push({
        projectId: project.id,
        projectName: project.name,
        projectCode: project.code,
        month: plan.month,
        employeeId: alloc.employeeId,
        employeeNo: empNo,
        employeeName: emp?.name || alloc.employeeId,
        department: emp?.department || '',
        group: emp?.group || '',
        position: emp?.position || '',
        groupRole: emp?.groupRole || '',
        rate: entry?.rate || 0,
        points: pts,
        wan: amountWan,
        workContent: entry?.workContent || '',
        planBudget: plan.budget,
        planStatus: plan.status,
      });
    }
  }

  const periodAllocatedWan = Number((periodAllocatedPoints / 1_000_000).toFixed(6));

  // 计算每个人的绩点总和
  const memberSummaries: ProjectMeritPackage['memberSummaries'] = [];
  for (const [empId, agg] of memberPointsMap.entries()) {
    const emp = state.employees.find(e => e.id === empId || (e.employeeNo && e.employeeNo === empId));
    const empNo = emp?.employeeNo || (emp && !emp.id.startsWith('emp_') ? emp.id : undefined);
    const ratio = periodAllocatedPoints > 0 ? Number(((agg.points / periodAllocatedPoints) * 100).toFixed(2)) : 0;
    memberSummaries.push({
      employeeId: empId,
      employeeNo: empNo,
      name: emp?.name || empId,
      department: emp?.department || '',
      group: emp?.group || '',
      position: emp?.position || '',
      groupRole: emp?.groupRole || '',
      totalPoints: agg.points,
      totalWan: Number(agg.wan.toFixed(6)),
      ratioInProject: ratio,
      monthsCount: agg.months.size,
    });
  }
  memberSummaries.sort((a, b) => b.totalPoints - a.totalPoints);

  const months = Array.from(new Set(targetPlans.map(p => p.month))).sort();
  const periodLabel = months.length === 1 ? months[0] : months.length > 1 ? `${months[0]} 至 ${months[months.length - 1]}` : '全周期';

  const exporter: ProjectMeritPackage['exporter'] = {
    id: actor?.id || owner?.id || 'unknown',
    employeeNo: actor?.employeeNo || owner?.employeeNo,
    name: actor?.name || ownerName,
    position: actor?.position,
    group: actor?.group,
    role: actor?.role,
  };

  return {
    version: '1.0',
    packageType: 'project_merit_package',
    generatedAt: new Date().toISOString(),
    exporter,
    period: {
      months,
      periodLabel,
    },
    project: {
      id: project.id,
      code: project.code,
      name: project.name,
      client: project.client,
      contract: project.contract,
      ownerId: project.owner,
      ownerName,
      start: project.start,
      end: project.end,
      status: project.status,
      contractWan,
      historyCompletedAmount,
      historyCompletedWan,
      periodAllocatedPoints,
      periodAllocatedWan,
      periodAllocatedRateBps,
      allTimeAllocatedPoints,
      allTimeAllocatedWan,
      remainingWan,
      remainingRateBps,
    },
    memberSummaries,
    details,
    plans: targetPlans,
  };
}

/**
 * 导出项目分配数据包 JSON 格式
 */
export function exportProjectMeritPackageJson(
  state: State,
  projectId: string,
  options?: {
    months?: string[];
    status?: 'published' | 'all';
    actor?: Employee;
  }
): string {
  const pkg = exportProjectMeritPackage(state, projectId, options);
  return JSON.stringify(pkg, null, 2);
}

/**
 * 解析并校验项目分配绩点数据包
 */
export function parseProjectMeritPackage(raw: string | object): ProjectMeritPackage {
  let data: any = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!data || typeof data !== 'object') {
    fail('数据包解析失败：内容不是有效的对象格式');
  }

  // 兼容普通快照或报表对象格式
  if (data.packageType !== 'project_merit_package' && data.project && data.details) {
    data.packageType = 'project_merit_package';
    data.version = data.version || '1.0';
  }

  if (!data.project || !data.project.name) {
    fail('数据包格式错误：缺少项目核心信息（project.name）');
  }

  if (!Array.isArray(data.details)) {
    data.details = [];
  }

  if (!Array.isArray(data.memberSummaries)) {
    // 自动根据 details 计算 memberSummaries
    const map = new Map<string, { employeeNo?: string; name: string; dept: string; group: string; pos: string; grpRole: string; points: number; wan: number; months: Set<string> }>();
    let totalPts = 0;
    for (const d of data.details) {
      totalPts += (d.points || 0);
      const key = d.employeeNo || d.employeeId;
      let item = map.get(key);
      if (!item) {
        item = {
          employeeNo: d.employeeNo,
          name: d.employeeName || d.employeeId,
          dept: d.department || '',
          group: d.group || '',
          pos: d.position || '',
          grpRole: d.groupRole || '',
          points: 0,
          wan: 0,
          months: new Set(),
        };
        map.set(key, item);
      }
      item.points += (d.points || 0);
      item.wan += (d.wan || 0);
      if (d.month) item.months.add(d.month);
    }

    data.memberSummaries = Array.from(map.entries()).map(([empId, item]) => ({
      employeeId: empId,
      employeeNo: item.employeeNo,
      name: item.name,
      department: item.dept,
      group: item.group,
      position: item.pos,
      groupRole: item.grpRole,
      totalPoints: item.points,
      totalWan: Number(item.wan.toFixed(6)),
      ratioInProject: totalPts > 0 ? Number(((item.points / totalPts) * 100).toFixed(2)) : 0,
      monthsCount: item.months.size,
    })).sort((a, b) => b.totalPoints - a.totalPoints);
  }

  if (!data.period) {
    const months = Array.from(new Set(data.details.map((d: any) => d.month).filter(Boolean))) as string[];
    months.sort();
    data.period = {
      months,
      periodLabel: months.length > 0 ? `${months[0]} ~ ${months[months.length - 1]}` : '未指定周期',
    };
  }

  return data as ProjectMeritPackage;
}

/**
 * 核算员自动汇总多个项目分配数据包（核心：根据唯一ID/工号判定跨数据包合并）
 */
export function summarizeAuditorPackages(
  packages: ProjectMeritPackage[],
  allEmployees?: Employee[]
): AuditorSummaryResult {
  if (!packages || packages.length === 0) {
    return {
      overview: {
        packageCount: 0,
        totalContractWan: 0,
        totalAllocatedWan: 0,
        totalAllocatedPoints: 0,
        totalEmployees: 0,
        avgPointsPerEmployee: 0,
        months: [],
        periodLabel: '暂无数据',
      },
      employeeSummaries: [],
      projectSummaries: [],
      matrix: {
        projectHeaders: [],
        projects: [],
        rows: [],
        projectTotals: [],
        grandTotalPoints: 0,
      },
      allDetails: [],
      groupDistribution: [],
    };
  }

  // 1. 月份与周期汇总
  const allMonthsSet = new Set<string>();
  for (const pkg of packages) {
    if (pkg.period?.months) {
      pkg.period.months.forEach(m => allMonthsSet.add(m));
    }
    if (pkg.details) {
      pkg.details.forEach(d => { if (d.month) allMonthsSet.add(d.month); });
    }
  }
  const sortedMonths = Array.from(allMonthsSet).sort();
  const periodLabel = sortedMonths.length === 1 ? sortedMonths[0] : sortedMonths.length > 1 ? `${sortedMonths[0]} 至 ${sortedMonths[sortedMonths.length - 1]}` : '全周期';

  // 2. 项目分配额度情况对照表
  const projectSummaries: AuditorSummaryResult['projectSummaries'] = [];
  let totalContractWan = 0;
  let totalAllocatedWan = 0;
  let totalAllocatedPoints = 0;

  for (const pkg of packages) {
    const p = pkg.project;
    totalContractWan += (p.contractWan || 0);
    totalAllocatedWan += (p.periodAllocatedWan || 0);
    totalAllocatedPoints += (p.periodAllocatedPoints || 0);

    const healthStatus: 'normal' | 'warning' | 'completed' =
      (p.remainingWan < 0) ? 'warning' : (p.remainingRateBps <= 500) ? 'completed' : 'normal';

    projectSummaries.push({
      id: p.id,
      code: p.code || '',
      name: p.name,
      client: p.client || '',
      ownerName: p.ownerName || '未知',
      contractWan: p.contractWan || 0,
      allocatedWan: p.periodAllocatedWan || 0,
      allocatedPoints: p.periodAllocatedPoints || 0,
      allocatedRateBps: p.periodAllocatedRateBps || 0,
      remainingWan: p.remainingWan || 0,
      remainingRateBps: p.remainingRateBps || 0,
      headcount: pkg.memberSummaries?.length || 0,
      recordCount: pkg.details?.length || 0,
      healthStatus,
      months: pkg.period?.months || [],
      packageSource: pkg.exporter?.name ? `由【${pkg.exporter.name}】导出 (${pkg.generatedAt?.slice(0, 10) || ''})` : '项目数据包',
    });
  }

  // 3. 全量明细汇总
  const allDetails: ProjectMeritPackage['details'] = [];
  for (const pkg of packages) {
    if (pkg.details) {
      allDetails.push(...pkg.details);
    }
  }
  allDetails.sort((a, b) => {
    const mComp = a.month.localeCompare(b.month);
    if (mComp !== 0) return mComp;
    const pComp = a.projectName.localeCompare(b.projectName);
    if (pComp !== 0) return pComp;
    return b.points - a.points;
  });

  // 4. 全员跨项目绩点总和大表（以唯一ID/工号为核心跨项目精准合并）
  type EmpAgg = {
    key: string;
    employeeId: string;
    employeeNo?: string;
    name: string;
    department: string;
    group: string;
    position: string;
    groupRole: string;
    totalPoints: number;
    totalWan: number;
    projectsMap: Map<string, {
      projectId: string;
      projectName: string;
      projectCode: string;
      ownerName: string;
      points: number;
      wan: number;
      months: Set<string>;
    }>;
    details: ProjectMeritPackage['details'];
  };

  const empMap = new Map<string, EmpAgg>();

  for (const d of allDetails) {
    // 匹配全局花名册中的员工（严格分层：优先按工号精确匹配；其次按ID匹配；只有在未指定工号时才退化至按姓名匹配）
    let matchEmp: Employee | undefined;
    if (d.employeeNo && allEmployees) {
      matchEmp = allEmployees.find(e => (e.employeeNo && e.employeeNo === d.employeeNo) || e.id === d.employeeNo);
    }
    if (!matchEmp && d.employeeId && allEmployees) {
      matchEmp = allEmployees.find(e => e.id === d.employeeId || (e.employeeNo && e.employeeNo === d.employeeId));
    }
    if (!matchEmp && allEmployees && !d.employeeNo) {
      matchEmp = allEmployees.find(e => e.name === d.employeeName);
    }

    // 核心判定准则：按唯一的ID号/工号判定合并
    // 优先取数据包中的工号/ID，其次取核算员花名册中的匹配工号/ID，确保不同数据包中同工号/同ID精准归集
    const uniqueKey = (
      d.employeeNo?.trim() ||
      matchEmp?.employeeNo?.trim() ||
      (matchEmp && !matchEmp.id.startsWith('emp_') ? matchEmp.id.trim() : '') ||
      d.employeeId?.trim() ||
      d.employeeName?.trim()
    );

    const effectiveNo = d.employeeNo || matchEmp?.employeeNo || (matchEmp && !matchEmp.id.startsWith('emp_') ? matchEmp.id : undefined);
    const effectiveName = d.employeeName || matchEmp?.name || uniqueKey;

    let agg = empMap.get(uniqueKey);
    if (!agg) {
      agg = {
        key: uniqueKey,
        employeeId: uniqueKey,
        employeeNo: effectiveNo,
        name: effectiveName,
        department: matchEmp?.department || d.department || '',
        group: matchEmp?.group || d.group || '',
        position: matchEmp?.position || d.position || '',
        groupRole: matchEmp?.groupRole || d.groupRole || '',
        totalPoints: 0,
        totalWan: 0,
        projectsMap: new Map(),
        details: [],
      };
      empMap.set(uniqueKey, agg);
    } else {
      if (!agg.employeeNo && effectiveNo) {
        agg.employeeNo = effectiveNo;
      }
      if (!agg.department && (matchEmp?.department || d.department)) {
        agg.department = matchEmp?.department || d.department || '';
      }
      if (!agg.group && (matchEmp?.group || d.group)) {
        agg.group = matchEmp?.group || d.group || '';
      }
      if (!agg.position && (matchEmp?.position || d.position)) {
        agg.position = matchEmp?.position || d.position || '';
      }
    }

    agg.totalPoints += d.points;
    agg.totalWan += d.wan;
    agg.details.push(d);

    let prj = agg.projectsMap.get(d.projectId);
    if (!prj) {
      const pkgPrj = packages.find(pkg => pkg.project.id === d.projectId)?.project;
      prj = {
        projectId: d.projectId,
        projectName: d.projectName,
        projectCode: d.projectCode,
        ownerName: pkgPrj?.ownerName || '',
        points: 0,
        wan: 0,
        months: new Set(),
      };
      agg.projectsMap.set(d.projectId, prj);
    }
    prj.points += d.points;
    prj.wan += d.wan;
    if (d.month) prj.months.add(d.month);
  }

  const employeeSummaries: AuditorSummaryResult['employeeSummaries'] = Array.from(empMap.values())
    .map(agg => ({
      id: agg.key,
      employeeId: agg.employeeId,
      employeeNo: agg.employeeNo,
      name: agg.name,
      department: agg.department,
      group: agg.group,
      position: agg.position,
      groupRole: agg.groupRole,
      totalPoints: agg.totalPoints,
      totalWan: Number(agg.totalWan.toFixed(6)),
      projectCount: agg.projectsMap.size,
      projects: Array.from(agg.projectsMap.values()).map(p => ({
        projectId: p.projectId,
        projectName: p.projectName,
        projectCode: p.projectCode,
        ownerName: p.ownerName,
        points: p.points,
        wan: Number(p.wan.toFixed(6)),
        months: Array.from(p.months).sort(),
      })),
      details: agg.details,
      rank: 0,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  employeeSummaries.forEach((e, idx) => { e.rank = idx + 1; });

  // 5. 二维透视矩阵（图2风格）
  const projectHeaders = packages.map(pkg => ({
    id: pkg.project.id,
    name: pkg.project.name,
    code: pkg.project.code,
    label: pkg.project.code && !pkg.project.name.includes(pkg.project.code)
      ? `${pkg.project.name} (${pkg.project.code})`
      : pkg.project.name,
  }));

  const projectTotals = new Array(projectHeaders.length).fill(0);
  let grandTotalPoints = 0;

  const matrixRows = employeeSummaries.map((emp, index) => {
    let rowTotal = 0;
    const scores = projectHeaders.map((header, colIdx) => {
      const pts = emp.details
        .filter(d => d.projectId === header.id)
        .reduce((sum, d) => sum + d.points, 0);
      projectTotals[colIdx] += pts;
      rowTotal += pts;
      return pts;
    });

    grandTotalPoints += rowTotal;

    return {
      index: index + 1,
      employeeId: emp.employeeId,
      employeeNo: emp.employeeNo,
      name: emp.name,
      group: emp.group,
      position: emp.position,
      scores,
      rowTotalPoints: rowTotal,
    };
  });

  // 6. 专业组分布统计
  const groupMap = new Map<string, { points: number; wan: number; emps: Set<string> }>();
  for (const emp of employeeSummaries) {
    const grp = emp.group || '其他未分组';
    let g = groupMap.get(grp);
    if (!g) {
      g = { points: 0, wan: 0, emps: new Set() };
      groupMap.set(grp, g);
    }
    g.points += emp.totalPoints;
    g.wan += emp.totalWan;
    g.emps.add(emp.employeeId);
  }

  const groupDistribution: AuditorSummaryResult['groupDistribution'] = Array.from(groupMap.entries())
    .map(([group, val]) => ({
      group,
      points: val.points,
      wan: Number(val.wan.toFixed(6)),
      headcount: val.emps.size,
      ratio: totalAllocatedPoints > 0 ? Number(((val.points / totalAllocatedPoints) * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.points - a.points);

  const totalEmployees = employeeSummaries.length;
  const avgPointsPerEmployee = totalEmployees > 0 ? Math.round(totalAllocatedPoints / totalEmployees) : 0;

  return {
    overview: {
      packageCount: packages.length,
      totalContractWan: Number(totalContractWan.toFixed(6)),
      totalAllocatedWan: Number(totalAllocatedWan.toFixed(6)),
      totalAllocatedPoints,
      totalEmployees,
      avgPointsPerEmployee,
      months: sortedMonths,
      periodLabel,
    },
    employeeSummaries,
    projectSummaries,
    matrix: {
      projectHeaders,
      projects: projectHeaders,
      rows: matrixRows,
      projectTotals,
      grandTotalPoints,
    },
    allDetails,
    groupDistribution,
  };
}

/**
 * 核算员从当前系统 State 一键全量汇总
 */
export function summarizeCurrentStateForAuditor(
  state: State,
  options?: {
    months?: string[];
    status?: 'published' | 'all';
    actor?: Employee;
  }
): AuditorSummaryResult {
  const statusFilter = options?.status || 'published';
  const targetProjects = state.projects.filter(p => {
    if (options?.months && options.months.length > 0) {
      return state.plans.some(plan => plan.projectId === p.id && options.months!.includes(plan.month) && (statusFilter === 'all' || plan.status === 'published'));
    }
    return state.plans.some(plan => plan.projectId === p.id && (statusFilter === 'all' || plan.status === 'published'));
  });

  const packages: ProjectMeritPackage[] = [];
  for (const p of targetProjects) {
    try {
      const pkg = exportProjectMeritPackage(state, p.id, options);
      if (pkg.details.length > 0) {
        packages.push(pkg);
      }
    } catch {
      // 容错跳过无分配项目
    }
  }

  return summarizeAuditorPackages(packages, state.employees);
}

/**
 * 导出全员跨项目绩点总表 CSV（以万元为单位）
 */
export function exportAuditorEmployeesCsv(summary: AuditorSummaryResult): string {
  const headers = ['全员排名', '工号', '员工姓名', '所属专业组', '职务', '专业组职务', '所属部门', '参与项目数', '累计获得总绩点(万元)', '折合总金额(万元)', '参与项目明细'];
  const rows = summary.employeeSummaries.map(emp => {
    const detailStr = emp.projects.map(p => `${p.projectName}(${p.wan.toFixed(6)}万)`).join('; ');
    return [
      emp.rank,
      emp.employeeNo || emp.employeeId || '',
      emp.name,
      emp.group || '未分组',
      emp.position || '',
      emp.groupRole || '',
      emp.department,
      emp.projectCount,
      (emp.totalPoints / 1_000_000).toFixed(6),
      emp.totalWan.toFixed(6),
      detailStr,
    ];
  });
  return generateCsv(headers, rows);
}

/**
 * 导出项目分配额度情况对照表 CSV（以万元为单位）
 */
export function exportAuditorProjectsCsv(summary: AuditorSummaryResult): string {
  const headers = ['序号', '工作令号', '项目名称', '项目负责人', '客户名称', '合同总额(万元)', '已分配额度(万元)', '已分配比例(%)', '已分配绩点(万元)', '剩余额度(万元)', '剩余比例(%)', '分配人数', '核算期数', '额度健康度'];
  const rows = summary.projectSummaries.map((p, idx) => [
    idx + 1,
    p.code,
    p.name,
    p.ownerName,
    p.client,
    p.contractWan.toFixed(6),
    p.allocatedWan.toFixed(6),
    (p.allocatedRateBps / 100).toFixed(2),
    (p.allocatedPoints / 1_000_000).toFixed(6),
    p.remainingWan.toFixed(6),
    (p.remainingRateBps / 100).toFixed(2),
    p.headcount,
    p.months.join('; '),
    p.healthStatus === 'warning' ? '超额预警' : p.healthStatus === 'completed' ? '结项/用尽' : '正常执行',
  ]);
  return generateCsv(headers, rows);
}

/**
 * 导出二维透视矩阵 CSV（按图2格式：序号、工号、姓名、职务、专业组、各合同令号...、个人累加，最底行【项目累加】，以万元为单位）
 */
export function exportAuditorMatrixCsv(summary: AuditorSummaryResult): string {
  const headers = ['序号', '工号', '姓名', '职务', '专业组', ...summary.matrix.projectHeaders.map(h => h.label), '个人累加(万元)'];
  const data = summary.matrix.rows.map(r => [
    r.index,
    r.employeeNo || r.employeeId || '',
    r.name,
    r.position || '',
    r.group || '',
    ...r.scores.map(pts => (pts / 1_000_000).toFixed(6)),
    (r.rowTotalPoints / 1_000_000).toFixed(6),
  ]);

  // 最底行【项目累加】
  const projectTotalsRow = [
    '',
    '项目累加',
    '',
    '',
    '',
    ...summary.matrix.projectTotals.map(pts => (pts / 1_000_000).toFixed(6)),
    (summary.matrix.grandTotalPoints / 1_000_000).toFixed(6),
  ];

  data.push(projectTotalsRow);
  return generateCsv(headers, data);
}

/**
 * 导出全量明细流水 CSV（以万元为单位）
 */
export function exportAuditorDetailsCsv(summary: AuditorSummaryResult): string {
  const headers = ['序号', '考核月份', '工作令号', '项目名称', '员工工号', '员工姓名', '专业组', '职务', '所属部门', '分润比例(%)', '获得绩点(万元)', '折合金额(万元)', '工作履职内容'];
  const rows = summary.allDetails.map((d, idx) => [
    idx + 1,
    d.month,
    d.projectCode,
    d.projectName,
    d.employeeNo || d.employeeId || '',
    d.employeeName,
    d.group || '',
    d.position || '',
    d.department || '',
    (d.rate / 100).toFixed(2),
    (d.points / 1_000_000).toFixed(6),
    d.wan.toFixed(6),
    d.workContent || '',
  ]);
  return generateCsv(headers, rows);
}

/**
 * 导出核算汇总完整数据包 JSON 格式（用于归档与审计）
 */
export function exportAuditorFullBundleJson(summary: AuditorSummaryResult, originalPackages: ProjectMeritPackage[] = []): string {
  return JSON.stringify({
    version: '1.0',
    bundleType: 'auditor_summary_bundle',
    exportedAt: new Date().toISOString(),
    packages: originalPackages,
    summary,
  }, null, 2);
}

// ============================================================================
// 工作区类型划分与权限绑定模型 (v0.6.0)
// ============================================================================

export type WorkspaceType = 'general' | 'auditor' | 'project_manager';

export interface WorkspaceMeta {
  workspaceType?: WorkspaceType;
  ownerEmployeeId?: string;
  ownerEmployeeName?: string;
}

/**
 * 项目负责人名下全部项目聚合数据包
 */
export interface ProjectManagerMeritBundle {
  format: 'hengji-pm-merit-bundle';
  version: string;
  bundleId: string;
  exportedAt: string;
  managerId: string;
  managerName: string;
  managerDepartment?: string;
  projectCount: number;
  totalContractWan: number;
  totalAllocatedPoints: number;
  packages: ProjectMeritPackage[];
}

/**
 * 导出项目负责人管理的所有项目数据包集合（一键打包）
 */
export function exportProjectManagerBundle(state: State, managerId: string, actor: Employee): ProjectManagerMeritBundle {
  if (!managerId) fail('未指定项目负责人');

  if (managerId === 'all') {
    const isManagerOrAdmin = isAuditorRole(actor) || isAdminRole(actor);
    if (!isManagerOrAdmin) {
      fail('仅管理员或核算员可导出全项目数据包集合');
    }
    if (state.projects.length === 0) {
      fail('当前系统暂无任何项目数据可导出');
    }
    const packages: ProjectMeritPackage[] = [];
    let totalContractWan = 0;
    let totalAllocatedPoints = 0;

    for (const project of state.projects) {
      const pkg = exportProjectMeritPackage(state, project.id, { actor });
      packages.push(pkg);
      totalContractWan += pkg.project.contractWan;
      totalAllocatedPoints += (pkg.project.periodAllocatedPoints || pkg.project.allTimeAllocatedPoints || 0);
    }

    return {
      format: 'hengji-pm-merit-bundle',
      version: '0.6.0',
      bundleId: `pm_bundle_all_${Date.now()}`,
      exportedAt: new Date().toISOString(),
      managerId: 'all',
      managerName: '全系统项目汇总',
      managerDepartment: actor.department || '全部门',
      projectCount: packages.length,
      totalContractWan: Number(totalContractWan.toFixed(6)),
      totalAllocatedPoints,
      packages,
    };
  }

  const targetManager = state.employees.find(e => e.id === managerId);
  if (!targetManager) fail(`未找到项目负责人（工号/ID: ${managerId}）`);

  // 权限校验：仅负责人本人、核算员或管理员可以导出该负责人名下的全部项目包
  const isSelf = actor.id === managerId;
  const isManagerOrAdmin = isAuditorRole(actor) || isAdminRole(actor);
  if (!isSelf && !isManagerOrAdmin) {
    fail(`无权导出项目负责人【${targetManager.name}】名下的项目数据包`);
  }

  // 筛选该负责人管理的所有项目（owner === managerId 或 owner === targetManager.name）
  const managerProjects = state.projects.filter(p => p.owner === managerId || p.owner === targetManager.name);
  if (managerProjects.length === 0) {
    fail(`项目负责人【${targetManager.name}】名下暂无管理的任何项目`);
  }

  const packages: ProjectMeritPackage[] = [];
  let totalContractWan = 0;
  let totalAllocatedPoints = 0;

  for (const project of managerProjects) {
    const pkg = exportProjectMeritPackage(state, project.id, { actor });
    packages.push(pkg);
    totalContractWan += pkg.project.contractWan;
    totalAllocatedPoints += (pkg.project.periodAllocatedPoints || pkg.project.allTimeAllocatedPoints || 0);
  }

  return {
    format: 'hengji-pm-merit-bundle',
    version: '0.6.0',
    bundleId: `pm_bundle_${managerId}_${Date.now()}`,
    exportedAt: new Date().toISOString(),
    managerId,
    managerName: targetManager.name,
    managerDepartment: targetManager.department,
    projectCount: packages.length,
    totalContractWan: Number(totalContractWan.toFixed(6)),
    totalAllocatedPoints,
    packages,
  };
}

/**
 * 导出项目负责人全部数据包的 JSON 字符串
 */
export function exportProjectManagerBundleJson(state: State, managerId: string, actor: Employee): string {
  const bundle = exportProjectManagerBundle(state, managerId, actor);
  return JSON.stringify(bundle, null, 2);
}

/**
 * 智能解析导入的 JSON：支持单个项目数据包 (ProjectMeritPackage) 或项目负责人合并包 (ProjectManagerMeritBundle)
 */
export function parseMeritPackageOrBundle(jsonStr: string): ProjectMeritPackage[] {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    fail('文件不是合法的 JSON 格式，无法解析');
  }

  if (!parsed || typeof parsed !== 'object') {
    fail('数据包内容为空或格式不正确');
  }

  // 1. 如果是项目负责人多包合包或核算员归档总包
  if (
    parsed.format === 'hengji-pm-merit-bundle' ||
    parsed.bundleType === 'auditor_summary_bundle' ||
    (Array.isArray(parsed.packages) && (parsed.managerId || parsed.bundleType === 'auditor_summary_bundle' || parsed.format === 'hengji-auditor-full-bundle'))
  ) {
    if (Array.isArray(parsed.packages) && parsed.packages.length > 0) {
      return parsed.packages.map((pkg: any) => parseProjectMeritPackage(JSON.stringify(pkg)));
    }
  }

  // 2. 如果是单个项目数据包
  if (parsed.format === 'hengji-project-merit-package' || parsed.packageId || parsed.project) {
    return [parseProjectMeritPackage(jsonStr)];
  }

  // 3. 容错处理：如果是直接数组形式的数据包
  if (Array.isArray(parsed)) {
    return parsed.map((item: any) => parseProjectMeritPackage(JSON.stringify(item)));
  }

  fail('无法识别的数据包格式：既不是单项目数据包，也不是项目负责人多项目合并包');
}

// ============================================================================
// 全部门合同额度汇总与荣誉之星统计模型 (v0.6.0)
// ============================================================================

export interface DepartmentContractSummary {
  totalProjects: number;
  totalContractWan: number;
  totalAllocatedWan: number;
  totalRemainingWan: number;
  overallAllocatedRateBps: number;
  totalAllocatedPoints: number;
  warningProjectsCount: number;
  completedProjectsCount: number;
  normalProjectsCount: number;
  projects: Array<{
    id: string;
    code: string;
    name: string;
    ownerName: string;
    contractWan: number;
    allocatedWan: number;
    remainingWan: number;
    allocatedRateBps: number;
    allocatedPoints: number;
    healthStatus: 'normal' | 'warning' | 'completed';
    headcount: number;
  }>;
}

/**
 * 计算全部门合同额度汇总
 */
export function calculateDepartmentContracts(summary: AuditorSummaryResult): DepartmentContractSummary {
  let totalContractWan = 0;
  let totalAllocatedWan = 0;
  let totalRemainingWan = 0;
  let totalAllocatedPoints = 0;
  let warningProjectsCount = 0;
  let completedProjectsCount = 0;
  let normalProjectsCount = 0;

  const projects = summary.projectSummaries.map(p => {
    totalContractWan += p.contractWan;
    totalAllocatedWan += p.allocatedWan;
    totalRemainingWan += p.remainingWan;
    totalAllocatedPoints += p.allocatedPoints;

    if (p.healthStatus === 'warning') warningProjectsCount++;
    else if (p.healthStatus === 'completed') completedProjectsCount++;
    else normalProjectsCount++;

    return {
      id: p.id,
      code: p.code,
      name: p.name,
      ownerName: p.ownerName,
      contractWan: p.contractWan,
      allocatedWan: p.allocatedWan,
      remainingWan: p.remainingWan,
      allocatedRateBps: p.allocatedRateBps,
      allocatedPoints: p.allocatedPoints,
      healthStatus: p.healthStatus,
      headcount: p.headcount,
    };
  });

  const overallRate = totalContractWan > 0 ? Math.round((totalAllocatedWan / totalContractWan) * 10000) : 0;

  return {
    totalProjects: projects.length,
    totalContractWan: Number(totalContractWan.toFixed(6)),
    totalAllocatedWan: Number(totalAllocatedWan.toFixed(6)),
    totalRemainingWan: Number(totalRemainingWan.toFixed(6)),
    overallAllocatedRateBps: Math.min(10000, overallRate),
    totalAllocatedPoints,
    warningProjectsCount,
    completedProjectsCount,
    normalProjectsCount,
    projects,
  };
}

export interface HonorStar {
  category: 'monthly' | 'quarterly' | 'annual';
  title: string;       // 如：2026年3月 月度之星、2026年Q1 季度之星、2026年度 领航之星
  period: string;      // 2026-03, 2026-Q1, 2026
  employeeId: string;
  employeeName: string;
  department: string;
  group?: string;
  position?: string;
  points: number;      // 获得绩点（分）
  wan: number;         // 折合万元
  projectCount: number;
  topProjects: string[]; // 主要贡献项目
  badge: string;       // 徽章标识：👑 🌟 🏆 🎖️
  rank: number;
  reason: string;      // 评语/高光亮点
}

export interface HonorStarsResult {
  monthlyStars: HonorStar[];
  quarterlyStars: HonorStar[];
  annualStars: HonorStar[];
}

/**
 * 自动评选月度之星、季度之星与年度之星
 */
export function calculateHonorStars(summary: AuditorSummaryResult): HonorStarsResult {
  const details = summary?.allDetails || [];
  const empMap = new Map<string, { name: string; dept: string; group?: string; pos?: string }>();
  (summary?.employeeSummaries || []).forEach(e => {
    if (e && e.id) {
      empMap.set(e.id, { name: e.name || e.employeeNo || e.id, dept: e.department || '第四研究室', group: e.group, pos: e.position });
    }
  });

  // 1. 按月份聚合：month -> employeeId -> { points, projects: Set<string> }
  const monthMap = new Map<string, Map<string, { points: number; projects: Set<string> }>>();
  // 2. 按季度聚合：quarter -> employeeId -> { points, projects: Set<string> }
  const quarterMap = new Map<string, Map<string, { points: number; projects: Set<string> }>>();
  // 3. 按年度聚合：year -> employeeId -> { points, projects: Set<string> }
  const yearMap = new Map<string, Map<string, { points: number; projects: Set<string> }>>();

  for (const d of details) {
    const month = d.month || '当前周期';
    const year = month.slice(0, 4) || '本年';
    const monthNum = parseInt(month.slice(5, 7) || '1', 10);
    const qNum = Math.ceil(monthNum / 3) || 1;
    const quarter = `${year}-Q${qNum}`;

    // 月度累计
    if (!monthMap.has(month)) monthMap.set(month, new Map());
    const mSub = monthMap.get(month)!;
    if (!mSub.has(d.employeeId)) mSub.set(d.employeeId, { points: 0, projects: new Set() });
    const mItem = mSub.get(d.employeeId)!;
    mItem.points += d.points;
    mItem.projects.add(d.projectName);

    // 季度累计
    if (!quarterMap.has(quarter)) quarterMap.set(quarter, new Map());
    const qSub = quarterMap.get(quarter)!;
    if (!qSub.has(d.employeeId)) qSub.set(d.employeeId, { points: 0, projects: new Set() });
    const qItem = qSub.get(d.employeeId)!;
    qItem.points += d.points;
    qItem.projects.add(d.projectName);

    // 年度累计
    if (!yearMap.has(year)) yearMap.set(year, new Map());
    const ySub = yearMap.get(year)!;
    if (!ySub.has(d.employeeId)) ySub.set(d.employeeId, { points: 0, projects: new Set() });
    const yItem = ySub.get(d.employeeId)!;
    yItem.points += d.points;
    yItem.projects.add(d.projectName);
  }

  // 评选月度之星（每个月前 1-2 名）
  const monthlyStars: HonorStar[] = [];
  const sortedMonths = Array.from(monthMap.keys()).sort().reverse();
  for (const month of sortedMonths) {
    const mSub = monthMap.get(month)!;
    const sorted = Array.from(mSub.entries()).sort((a, b) => b[1].points - a[1].points);
    const topList = sorted.slice(0, Math.min(2, sorted.length));
    topList.forEach(([empId, data], idx) => {
      const info = empMap.get(empId) || { name: empId, dept: '部门', group: '', pos: '' };
      const [y, m] = month.split('-');
      const title = y && m ? `${y}年${parseInt(m, 10)}月 · 月度之星` : `${month} · 月度之星`;
      monthlyStars.push({
        category: 'monthly',
        title,
        period: month,
        employeeId: empId,
        employeeName: info.name,
        department: info.dept,
        group: info.group,
        position: info.pos,
        points: data.points,
        wan: Number((data.points / 1_000_000).toFixed(6)),
        projectCount: data.projects.size,
        topProjects: Array.from(data.projects).slice(0, 3),
        badge: idx === 0 ? '🌟 月度领跑之星' : '⭐ 月度进取之星',
        rank: idx + 1,
        reason: `在 ${month} 周期内斩获 ${(data.points / 1_000_000).toFixed(6)} 万绩点，深度参与 ${data.projects.size} 项核心项目任务，履职交付成果显著。`,
      });
    });
  }

  // 评选季度之星（每个季度前 1-3 名）
  const quarterlyStars: HonorStar[] = [];
  const sortedQuarters = Array.from(quarterMap.keys()).sort().reverse();
  for (const q of sortedQuarters) {
    const qSub = quarterMap.get(q)!;
    const sorted = Array.from(qSub.entries()).sort((a, b) => b[1].points - a[1].points);
    const topList = sorted.slice(0, Math.min(3, sorted.length));
    topList.forEach(([empId, data], idx) => {
      const info = empMap.get(empId) || { name: empId, dept: '部门', group: '', pos: '' };
      const badges = ['🏆 季度卓越之星', '🥈 季度攻坚标兵', '🥉 季度实干先锋'];
      quarterlyStars.push({
        category: 'quarterly',
        title: `${q} · 季度之星`,
        period: q,
        employeeId: empId,
        employeeName: info.name,
        department: info.dept,
        group: info.group,
        position: info.pos,
        points: data.points,
        wan: Number((data.points / 1_000_000).toFixed(6)),
        projectCount: data.projects.size,
        topProjects: Array.from(data.projects).slice(0, 3),
        badge: badges[idx] || '🎖️ 季度标兵',
        rank: idx + 1,
        reason: `整个 ${q} 季度持续攻坚，累计贡献 ${(data.points / 1_000_000).toFixed(6)} 万绩点，位列季度绩效排名前列。`,
      });
    });
  }

  // 评选年度之星（每个年度综合排名前 3 名）
  const annualStars: HonorStar[] = [];
  const sortedYears = Array.from(yearMap.keys()).sort().reverse();
  for (const yr of sortedYears) {
    const ySub = yearMap.get(yr)!;
    const sorted = Array.from(ySub.entries()).sort((a, b) => b[1].points - a[1].points);
    const topList = sorted.slice(0, Math.min(3, sorted.length));
    topList.forEach(([empId, data], idx) => {
      const info = empMap.get(empId) || { name: empId, dept: '部门', group: '', pos: '' };
      const badges = ['👑 年度功勋领航之星', '💎 年度卓越领航之星', '🏅 年度杰出贡献之星'];
      annualStars.push({
        category: 'annual',
        title: `${yr}年度 · 领航之星`,
        period: yr,
        employeeId: empId,
        employeeName: info.name,
        department: info.dept,
        group: info.group,
        position: info.pos,
        points: data.points,
        wan: Number((data.points / 1_000_000).toFixed(6)),
        projectCount: data.projects.size,
        topProjects: Array.from(data.projects).slice(0, 4),
        badge: badges[idx] || '👑 年度之星',
        rank: idx + 1,
        reason: `${yr}年度累计斩获 ${(data.points / 1_000_000).toFixed(6)} 万总绩点，领跑全团队项目交付，以卓越贡献树立年度标杆！`,
      });
    });
  }

  return {
    monthlyStars,
    quarterlyStars,
    annualStars,
  };
}

