export const SCALE = 10000;
export type Employee = { id: string; name: string; department: string; email: string; role: 'admin'|'member'; authId?: string; active: boolean };
export type Project = { id: string; code: string; name: string; client: string; contract: number; fund: number; owner: string; start: string; end: string; status: 'active'|'archived'; members: { employeeId: string; coefficient: number }[]; exception: string };
export type Plan = { id: string; projectId: string; month: string; budget: number; entries: { employeeId: string; rate: number }[]; status: 'draft'|'published'; note: string };
export type Audit = { id: string; at: string; actor: string; actorId?: string; action: string; target: string };
export type State = { employees: Employee[]; projects: Project[]; plans: Plan[]; audit: Audit[] };
export type Command = { type: string; data: any };
export const emptyState = (): State => ({employees: [], projects: [], plans: [], audit: []});
export function fail(message: string): never { throw new Error(message); }
export function text(value: unknown, label: string, max = 160): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) fail(`${label}不能为空，且不能超过 ${max} 字`);
  return (value as string).trim();
}
export function integer(v: unknown, label: string, min = 0, max = SCALE): number {
  if (!Number.isSafeInteger(v) || (v as number) < min || (v as number) > max) fail(`${label}必须在 ${min}–${max} 之间`);
  return v as number;
}
export const range = (contract: number) => contract < 50 * 1000000 ? [6000, 9000] : contract < 500 * 1000000 ? [3000, 6000] : [1000, 3000];
export const points = (fund: number, rate: number) => Number((BigInt(fund) * BigInt(rate) + 5000n) / 10000n);
export const total = (values: number[]) => values.reduce((a,b) => a+b, 0);
export const pct = (rate: number) => `${(rate / 100).toFixed(2).replace(/\.00$/, '')}%`;
export const wan = (fen: number) => (fen / 1000000).toLocaleString('zh-CN', {maximumFractionDigits: 6});
export const score = (fen: number) => (fen / 100).toLocaleString('zh-CN', {minimumFractionDigits:2, maximumFractionDigits:2});
export function toMoney(value: string) { if (!/^\d+(\.\d{1,6})?$/.test(value)) fail('金额最多保留六位小数（万元）'); return integer(Math.round(Number(value)*1000000), '金额', 1, 1000000000000); }
export function toRate(value: string) { if (!/^\d+(\.\d{1,2})?$/.test(value)) fail('百分比最多保留两位小数'); return integer(Math.round(Number(value)*100), '分配率'); }
export const canManage = (actor: Employee, p: Project) => actor.role === 'admin' || p.owner === actor.id;
const monthValid = (m: string) => /^20\d{2}-(0[1-9]|1[0-2])$/.test(m);
const unique = (ids: string[], message: string) => { if (new Set(ids).size !== ids.length) fail(message); };
export function validate(s: State) {
  unique(s.employees.map(e=>e.id), '员工 ID 重复'); unique(s.employees.map(e=>e.email), '员工邮箱重复');
  unique(s.projects.map(p=>p.id), '项目 ID 重复'); unique(s.projects.map(p=>p.code), '项目编号已存在');
  unique(s.plans.map(p=>p.projectId+':'+p.month), '该项目当月计划已存在，请编辑现有计划');
  for (const a of s.plans) { integer(a.budget,'月度额度'); for (const e of a.entries) integer(e.rate,'月度分配率'); }
  for (const p of s.projects) {
    integer(p.contract,'合同金额',1,1000000000000); integer(p.fund,'可分配经费',1,p.contract);
    if (!monthValid(p.start)||!monthValid(p.end)||p.start>p.end) fail('项目起止月份不正确');
    if (!p.members.length || p.members.length > 200) fail('项目组人数应在 1–200 人之间');
    unique(p.members.map(m=>m.employeeId),'项目组成员重复');
    if (!p.members.some(m=>m.employeeId===p.owner)) fail('项目负责人必须是项目组成员');
    for (const m of p.members) { if (!s.employees.some(e=>e.id===m.employeeId)) fail('项目组包含不存在的员工'); integer(m.coefficient,'成员系数'); }
    if (total(p.members.map(m=>m.coefficient)) !== SCALE) fail('所有成员的项目系数合计必须等于 100%');
    const owner = p.members.find(m=>m.employeeId===p.owner)!; const [lo,hi]=range(p.contract);
    if ((owner.coefficient < lo || owner.coefficient > hi) && !p.exception.trim()) fail(`负责人参考系数为 ${pct(lo)}–${pct(hi)}，超出时请填写说明`);
    const plans = s.plans.filter(a=>a.projectId===p.id);
    if (total(plans.map(a=>a.budget))>SCALE) fail('该项目各月计划额度累计不能超过 100%');
    if (total(plans.flatMap(a=>a.entries.map(e=>e.rate)))>SCALE) fail('单项目全员累计分配率不能超过 100%');
    if (total(plans.flatMap(a=>a.entries.map(e=>points(p.fund,e.rate))))>p.fund) fail('四舍五入后的累计绩点超出项目经费，请微调分配率');
    for (const m of p.members) {
      const entries=plans.flatMap(a=>a.entries.filter(e=>e.employeeId===m.employeeId));
      if (total(entries.map(e=>e.rate))>m.coefficient) fail(`${s.employees.find(e=>e.id===m.employeeId)?.name}的累计分配率超出个人项目系数`);
      if (total(entries.map(e=>points(p.fund,e.rate)))>points(p.fund,m.coefficient)) fail('四舍五入后的个人累计绩点超出个人额度，请微调分配率');
    }
  }
  for (const a of s.plans) {
    const p=s.projects.find(p=>p.id===a.projectId); if (!p) fail('计划对应的项目不存在');
    if (!monthValid(a.month)||a.month<p.start||a.month>p.end) fail('分配月份必须处于项目周期内');
    integer(a.budget,'月度额度'); unique(a.entries.map(e=>e.employeeId),'月度成员重复');
    for (const e of a.entries) { if (!p.members.some(m=>m.employeeId===e.employeeId)) fail('只能为项目组成员分配绩点'); integer(e.rate,'月度分配率'); }
    if (total(a.entries.map(e=>e.rate))>a.budget) fail('本月成员分配率合计不能超过月度额度');
    if (total(a.entries.map(e=>points(p.fund,e.rate)))>points(p.fund,a.budget)) fail('四舍五入后的月度绩点超出本月额度，请微调分配率');
    if (a.status==='published' && !a.entries.some(e=>e.rate>0)) fail('不能发布空的绩点分配');
  }
}
export function execute(current: State, actorId: string, cmd: Command, id: string, at: string): State {
  const s: State = structuredClone(current);
  const actor=s.employees.find(e=>e.id===actorId && e.active); if (!actor) fail('当前账号未获授权');
  const d=cmd.data; if (!d || typeof d!=='object') fail('请求格式无效');
  let target='', label='';
  if (cmd.type==='employee.save') {
    if (actor.role!=='admin') fail('只有管理员可以管理员工');
    const existing=s.employees.find(e=>e.id===d.id);
    const email=text(d.email,'邮箱').toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('邮箱格式不正确');
    if (existing?.authId && existing.email!==email) fail('已绑定登录身份的邮箱不可修改');
    const e: Employee = {id:existing?.id||id,name:text(d.name,'员工姓名',40),department:text(d.department,'部门',60),email,role:d.role==='admin'?'admin':'member',active:d.active!==false,...(existing?.authId?{authId:existing.authId}:{})};
    if (e.id===actor.id && (!e.active||e.role!=='admin')) fail('不能停用或降级当前管理员');
    if (existing) s.employees[s.employees.indexOf(existing)]=e; else s.employees.push(e);
    target=e.name; label=existing?'修改员工':'新增员工';
  } else if (cmd.type==='project.save') {
    const old=s.projects.find(p=>p.id===d.id);
    if (old ? !canManage(actor,old) : actor.role!=='admin') fail('只有管理员或本项目负责人可以执行此操作');
    if (old?.status==='archived') fail('请先恢复已归档项目');
    if (old && actor.role!=='admin' && d.owner!==old.owner) fail('只有管理员可以变更项目负责人');
    const p: Project = {id:old?.id||id,code:text(d.code,'项目编号',40),name:text(d.name,'项目名称',100),client:text(d.client,'客户名称',100),contract:d.contract,fund:d.fund,owner:text(d.owner,'负责人'),start:d.start,end:d.end,status:old?.status||'active',members:Array.isArray(d.members)?d.members.map((m:any)=>({employeeId:m.employeeId,coefficient:m.coefficient})):[],exception:typeof d.exception==='string'?d.exception.slice(0,500):''};
    if (!s.employees.some(e=>e.id===p.owner && e.active)) fail('负责人必须是启用中的员工');
    if (old && s.plans.some(a=>a.projectId===old.id&&a.status==='published') && (old.contract!==p.contract||old.fund!==p.fund)) fail('项目已有发布记录，不能修改合同金额或可分配经费');
    if (old) s.projects[s.projects.indexOf(old)]=p; else s.projects.push(p);
    target=p.name; label=old?'修改项目与系数':'新建项目';
  } else if (cmd.type==='project.archive') {
    const p=s.projects.find(p=>p.id===d.id); if (!p||actor.role!=='admin') fail('只有管理员可以归档或恢复项目');
    p.status=p.status==='active'?'archived':'active'; target=p.name; label=p.status==='archived'?'归档项目':'恢复项目';
  } else if (cmd.type.startsWith('plan.')) {
    const old=s.plans.find(a=>a.id===d.id); const p=s.projects.find(p=>p.id===(old?.projectId||d.projectId));
    if (!p||!canManage(actor,p)) fail('只有管理员或本项目负责人可以分配绩点');
    if (p.status==='archived') fail('归档项目不能调整月度分配');
    target=p.name+' / '+(old?.month||d.month);
    if (cmd.type==='plan.save') {
      if (old?.status==='published') fail('已发布计划需先撤回才能编辑');
      if (old && d.projectId!==old.projectId) fail('不能更改计划所属项目');
      const a: Plan={id:old?.id||id,projectId:p.id,month:d.month,budget:d.budget,entries:Array.isArray(d.entries)?d.entries.map((e:any)=>({employeeId:e.employeeId,rate:e.rate})):[],status:'draft',note:typeof d.note==='string'?d.note.slice(0,500):''};
      if (old) s.plans[s.plans.indexOf(old)]=a; else s.plans.push(a); label='保存月度草稿';
    } else if (cmd.type==='plan.publish') {
      if (!old||old.status!=='draft') fail('只能发布草稿计划'); old.status='published'; label='发布月度绩点';
    } else if (cmd.type==='plan.reopen') {
      if (!old||old.status!=='published') fail('只能撤回已发布计划'); old.status='draft'; label='撤回月度绩点';
    } else if (cmd.type==='plan.delete') {
      if (!old||old.status!=='draft') fail('只能删除草稿计划'); s.plans=s.plans.filter(a=>a.id!==old.id); label='删除月度草稿';
    } else fail('未知操作');
  } else fail('未知操作');
  validate(s); s.audit.push({id,at,actor:actor.name,actorId:actor.id,action:label,target}); return s;
}
export function report(s: State, month: string) {
  return s.employees.map(e=>{
    const details=s.plans.filter(a=>a.month===month&&a.status==='published').flatMap(a=>a.entries.filter(x=>x.employeeId===e.id&&x.rate>0).map(x=>{const p=s.projects.find(p=>p.id===a.projectId)!;return {project:p.name,code:p.code,rate:x.rate,points:points(p.fund,x.rate)};}));
    return {employee:e,details,points:total(details.map(x=>x.points))};
  }).sort((a,b)=>b.points-a.points);
}
export function demoState(): State {
  const names=['陈予安','林知夏','周明远','沈若宁','许嘉禾','陆景行'];
  const departments=['项目管理部','技术研发部','技术研发部','设计咨询部','设计咨询部','项目管理部'];
  const s: State={employees:names.map((name,i)=>({id:'e'+i,name,department:departments[i],email:`member${i+1}@example.com`,role:i===0?'admin':'member',active:true})),projects:[],plans:[],audit:[]};
  s.projects=[
    {id:'p1',code:'PRJ-2026-001',name:'智慧园区数字化升级',client:'远景科技有限公司',contract:280000000,fund:280000000,owner:'e0',start:'2026-01',end:'2026-12',status:'active',members:[{employeeId:'e0',coefficient:4500},{employeeId:'e1',coefficient:3000},{employeeId:'e2',coefficient:2500}],exception:''},
    {id:'p2',code:'PRJ-2026-002',name:'城市公共空间规划设计',client:'城市建设发展集团',contract:650000000,fund:650000000,owner:'e3',start:'2026-03',end:'2027-02',status:'active',members:[{employeeId:'e3',coefficient:2500},{employeeId:'e4',coefficient:4500},{employeeId:'e5',coefficient:3000}],exception:''},
    {id:'p3',code:'PRJ-2026-003',name:'企业品牌视觉焕新',client:'禾川文化发展有限公司',contract:38000000,fund:38000000,owner:'e0',start:'2026-06',end:'2026-12',status:'active',members:[{employeeId:'e0',coefficient:7000},{employeeId:'e3',coefficient:3000}],exception:''},
    {id:'p4',code:'PRJ-2026-004',name:'能源管理平台研发',client:'新源绿色能源有限公司',contract:160000000,fund:160000000,owner:'e2',start:'2026-07',end:'2027-06',status:'active',members:[{employeeId:'e2',coefficient:5000},{employeeId:'e1',coefficient:3000},{employeeId:'e5',coefficient:2000}],exception:''}];
  for (let m=6;m<=10;m++) for (const p of s.projects) {
    const month=`2026-${String(m).padStart(2,'0')}`; if(month<p.start) continue;
    const rates=p.members.map(x=>({employeeId:x.employeeId,rate:Math.floor(x.coefficient*(m===10?.08:.1)/10)*10}));
    s.plans.push({id:`a-${p.id}-${m}`,projectId:p.id,month,budget:1000,entries:rates,status:m===10&&p.id==='p4'?'draft':'published',note:'按本月项目阶段成果分配'});
  }
  s.audit=[{id:'log1',at:'2026-10-16T08:30:00.000Z',actor:'陈予安',action:'发布月度绩点',target:'智慧园区数字化升级 / 2026-10'},{id:'log2',at:'2026-10-16T09:15:00.000Z',actor:'陈予安',action:'保存月度草稿',target:'能源管理平台研发 / 2026-10'}];
  validate(s); return s;
}
