import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { emptyState, execute, type State, type Employee } from '../../../lib/merit';
export const dynamic = 'force-dynamic';
const json = (data: unknown, status=200) => Response.json(data, {status,headers:{'Cache-Control':'no-store'}});
type Row = { revision: number; payload: string };
async function load() {
  const user=await getChatGPTUser(); if(!user) throw new Error('401:请先登录工作区');
  if(!env.DB) throw new Error('503:数据库暂不可用');
  let row=await env.DB.prepare('SELECT revision,payload FROM merit_workspace WHERE id=1').first<Row>();
  if(!row) {
    const s=emptyState();
    s.employees.push({id:crypto.randomUUID(),authId:user.userId,name:user.displayName,department:'管理部',email:user.email.toLowerCase(),role:'admin',active:true});
    s.audit.push({id:crypto.randomUUID(),at:new Date().toISOString(),actor:user.displayName,actorId:s.employees[0].id,action:'初始化工作区',target:'建立管理员账号'});
    await env.DB.prepare('INSERT OR IGNORE INTO merit_workspace(id,revision,payload) VALUES(1,0,?)').bind(JSON.stringify(s)).run();
    row=await env.DB.prepare('SELECT revision,payload FROM merit_workspace WHERE id=1').first<Row>();
  }
  if(!row) throw new Error('503:初始化数据库失败');
  for(let attempt=0;attempt<3;attempt++) {
    const s=JSON.parse(row.payload) as State;
    let actor=s.employees.find(e=>e.authId===user.userId);
    if(!actor) {
      actor=s.employees.find(e=>!e.authId&&e.email===user.email.toLowerCase()&&e.active);
      if(!actor) throw new Error('403:当前账号未被添加到员工库，请联系管理员');
      actor.authId=user.userId;
      const result=await env.DB.prepare('UPDATE merit_workspace SET payload=?,revision=revision+1 WHERE id=1 AND revision=?').bind(JSON.stringify(s),row.revision).run();
      if(!result.meta.changes) { row=(await env.DB.prepare('SELECT revision,payload FROM merit_workspace WHERE id=1').first<Row>())!; continue; }
      row.revision++;
    }
    if(!actor.active) throw new Error('403:当前账号已停用');
    return {state:s,actor,revision:row.revision};
  }
  throw new Error('409:工作区已更新，请刷新后重试');
}
export function visible(state: State, actor: Employee): State {
  const admin=actor.role==='admin';
  const projects=admin?state.projects:state.projects.filter(p=>p.members.some(m=>m.employeeId===actor.id));
  const relevant=new Set(projects.flatMap(p=>p.members.map(m=>m.employeeId)));
  const employees=state.employees.filter(e=>admin||relevant.has(e.id)||e.id===actor.id).map(e=>({ ...e,authId:undefined,email:admin||e.id===actor.id?e.email:'' }));
  const plans=state.plans.filter(a=>projects.some(p=>p.id===a.projectId)).map(a=>{
    const p=projects.find(p=>p.id===a.projectId)!;
    return admin||p.owner===actor.id?a:{...a,entries:a.entries.filter(e=>e.employeeId===actor.id)};
  });
  return {employees,projects,plans,audit:admin?state.audit:state.audit.filter(a=>a.actorId===actor.id)};
}
function errorResponse(error: unknown) {
  const message=error instanceof Error?error.message:'请求处理失败';
  const match=/^(401|403|409|503):(.+)$/.exec(message);
  if(match) return json({error:match[2]},Number(match[1]));
  if(/SQLITE|D1_|no such table|internal/i.test(message)) return json({error:'数据库暂不可用，请稍后重试或联系管理员'},503);
  return json({error:message},400);
}
export async function GET() {
  try { const x=await load();return json({state:visible(x.state,x.actor),actor:{...x.actor,authId:undefined},revision:x.revision}); }
  catch(e) { return errorResponse(e); }
}
export async function POST(request: Request) {
  try {
    if(request.headers.get('origin')!==new URL(request.url).origin) return json({error:'请求来源不匹配'},403);
    const body=await request.text(); if(body.length>1000000) return json({error:'请求内容过大'},413);
    const input=JSON.parse(body); const x=await load();
    if(input.revision!==x.revision) return json({error:'其他人已更新数据，请刷新页面后重试。当前输入仍保留。'},409);
    const next=execute(x.state,x.actor.id,input.command,crypto.randomUUID(),new Date().toISOString());
    const result=await env.DB!.prepare('UPDATE merit_workspace SET payload=?,revision=revision+1 WHERE id=1 AND revision=?').bind(JSON.stringify(next),x.revision).run();
    if(!result.meta.changes) return json({error:'数据发生并发更新，请刷新后重试'},409);
    return json({state:visible(next,x.actor),actor:{...x.actor,authId:undefined},revision:x.revision+1});
  } catch(e) {return errorResponse(e);}
}
