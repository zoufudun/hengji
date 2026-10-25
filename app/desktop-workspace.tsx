'use client';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Award,
  ArrowUpDown,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CalendarRange,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ArrowRight,
  CircleGauge,
  Copy,
  Crown,
  Database,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  GripHorizontal,
  GripVertical,
  FolderArchive,
  FolderKanban,
  FolderOpen,
  KeyRound,
  Layers,
  LayoutGrid,
  ListFilter,
  LogOut,
  Medal,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  BookOpen,
  BookOpenCheck,
  Save,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
  Square,
  Table2,
  Trash2,
  TrendingUp,
  Trophy,
  Upload,
  Users,
  AlertCircle,
  AlertTriangle,
  Info,
  History,
  Lock,
  Unlock,
  CloudDownload,
  RefreshCw,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Globe,
  Star,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  DEFAULT_GROUPS,
  calculateStars,
  demoState,
  execute,
  exportEmployeesCsv,
  exportFullBackupJson,
  exportPeriodMatrixReportCsv,
  exportPeriodReportCsv,
  exportProjectMembersCsv,
  exportProjectsCsv,
  getEmployeeTemplateCsv,
  getEmployeeTrendData,
  getGroupMonthlyComparison,
  getMonthlyBarData,
  getMonthsBetween,
  getProjectMemberTemplateCsv,
  getProjectTemplateCsv,
  getProjectTrendData,
  parseProjectMemberCsvText,
  getPlanMemberTemplateCsv,
  parsePlanMemberCsvText,
  getProjectGroupTemplateCsv,
  parseProjectGroupCsvText,
  parseProjectGroupsCsvText,
  getInitialProjectGroups,
  exportProjectGroupsCsv,
  initialDepartmentEmployees,
  getProjectSpanMonths,
  generateProjectQuotaSchedule,
  getProjectQuotaPerspective,
  exportProjectQuotaScheduleCsv,
  parseProjectQuotaScheduleCsvText,
  monthAmount,
  normalizeMonthInput,
  nowMonth,
  ownerSummary,
  parseAndValidateBackupJson,
  parseCsv,
  parseEmployeeCsvText,
  parseProjectCsvText,
  pct,
  planAllocations,
  projectAllocDetail,
  projectBudgetRate,
  range,
  rangeReport,
  report,
  score,
  points,
  APP_VERSION,
  APP_BUILD,
  APP_AUTHOR,
  APP_CONTACT,
  UPDATE_HISTORY,
  GITHUB_REPO,
  GITHUB_REPO_URL,
  GITHUB_RELEASES_URL,
  GITHUB_PAGES_URL,
  checkAppUpdate,
  type UpdateCheckResult,
  exportEncryptedBackupJson,
  parseAndDecryptBackupJson,
  isEncryptedBackup,
  toMoney,
  toRate,
  total,
  validate,
  wan,
  type Employee,
  type Plan,
  type Project,
  type State,
  type BackupData,
  type ProjectGroup,
  type ProjectGroupType,
  type ProjectMonthlyQuotaPlan,
  type ProjectQuotaStageType,
  type PlanEntry,
  type MonthProjectAllocRow,
  type WorkspaceType,
  MAINTENANCE_QUOTA_RATE,
  BIDDING_MAX_RATE,
  BIDDING_DEFAULT_RATE,
  getQuotaPlanStageType,
  getMonthProjectsAllocPerspective,
  exportProjectMeritPackage,
  exportProjectMeritPackageJson,
  exportProjectManagerBundleJson,
  parseProjectMeritPackage,
  summarizeAuditorPackages,
  summarizeCurrentStateForAuditor,
  isAuditorRole,
  calculateDepartmentContracts,
  calculateHonorStars,
  exportAuditorEmployeesCsv,
  exportAuditorProjectsCsv,
  exportAuditorMatrixCsv,
  exportAuditorDetailsCsv,
  exportAuditorFullBundleJson,
  parseMeritPackageOrBundle,
  type ProjectMeritPackage,
} from '../lib/core';
import { AuditorSummaryView, type AuditorTab } from '../components/AuditorSummaryView';
import { OfficialLandingPage } from '../components/OfficialLandingPage';
import brandHengSeal from './brand-heng-seal.png';
import brandBurstFlower from './brand-burst-flower.png';

type Tab = 'dashboard' | 'projects' | 'plans' | 'groups' | 'employees' | 'analytics' | 'stars' | 'reports' | 'rules' | 'data_io' | 'auditor';

const uid = () => crypto.randomUUID();
const errorText = (error: unknown) => error instanceof Error ? error.message : String(error);

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function Modal({
  title,
  subtitle,
  children,
  onClose,
  wide = false,
  closeOnBackdrop = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose(): void;
  wide?: boolean;
  closeOnBackdrop?: boolean;
}) {
  return (
    <div
      className="modal-backdrop"
      onClick={() => {
        // 需求1：点击框体外部默认不退出弹窗，防止用户误触导致正在输入的数据丢失；需通过右上角关闭或取消按钮退出
        if (closeOnBackdrop) {
          onClose();
        }
      }}
    >
      <section className={`modal ${wide ? 'wide' : ''}`} onClick={e => e.stopPropagation()}>
        <header>
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="icon-button" onClick={onClose} title="关闭"><X size={20} /></button>
        </header>
        {children}
      </section>
    </div>
  );
}

function Badge({ children, tone = 'neutral', style }: { children: React.ReactNode; tone?: 'neutral' | 'green' | 'amber' | 'blue' | 'purple' | 'gray'; style?: React.CSSProperties }) {
  return <span className={`badge ${tone}`} style={style}>{children}</span>;
}

function GroupTag({ group }: { group?: any }) {
  const g = typeof group === 'string' ? group : String(group || '未分组');
  let cls = 'other';
  if (g.includes('总体')) cls = 'zt';
  else if (g.includes('产品')) cls = 'cp';
  else if (g.includes('研发')) cls = 'yf';
  return <span className={`group-tag ${cls}`}>{g}</span>;
}

// -------------------------------------------------------------
// 甲骨文“衡”字艺术图标 (Oracle Bone Script "Heng" Icon)
// -------------------------------------------------------------
function OracleHengIcon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      title="甲骨文 · 衡"
    >
      <defs>
        <linearGradient id="oracleJadeBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="60%" stopColor="#047857" />
          <stop offset="100%" stopColor="#065f46" />
        </linearGradient>
        <linearGradient id="oracleGoldStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
      </defs>
      {/* 典雅青铜古玉圆角底座 */}
      <rect x="5" y="5" width="90" height="90" rx="18" fill="url(#oracleJadeBg)" stroke="#34d399" strokeWidth="2.5" />
      {/* 隐隐微光内环 */}
      <rect x="8" y="8" width="84" height="84" rx="15" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

      {/* 甲骨文/金文“衡”字象形篆体：行之左彳、中置牛角天平权衡之横木、行之右亍 */}
      <g stroke="url(#oracleGoldStroke)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        {/* 左侧“彳”字甲骨文象形两段弧折 */}
        <path d="M 23 27 Q 16 36 24 45" />
        <path d="M 24 47 Q 15 61 21 73" />
        <line x1="21" y1="73" x2="21" y2="81" strokeWidth="4" />

        {/* 中间“衡”之牛轭横木与天平悬秤 (双侧权衡之器) */}
        <path d="M 32 30 C 44 24 56 24 68 30" strokeWidth="4.5" />
        <line x1="50" y1="24" x2="50" y2="76" strokeWidth="4.5" />
        {/* 左角/左秤盘 */}
        <path d="M 37 32 Q 29 46 41 54 Q 45 42 39 34" strokeWidth="3.8" />
        {/* 右角/右秤盘 */}
        <path d="M 63 32 Q 71 46 59 54 Q 55 42 61 34" strokeWidth="3.8" />
        {/* 下承托基座横梁 */}
        <path d="M 35 67 Q 50 61 65 67" strokeWidth="4" />
        <line x1="43" y1="76" x2="57" y2="76" strokeWidth="5" />

        {/* 右侧“亍”字甲骨文道轨 */}
        <line x1="77" y1="27" x2="86" y2="27" strokeWidth="4.5" />
        <line x1="77" y1="41" x2="85" y2="41" strokeWidth="4.5" />
        <path d="M 82 27 L 82 71 Q 82 81 74 79" strokeWidth="4.5" />
      </g>
    </svg>
  );
}

// -------------------------------------------------------------
// 现代八彩花瓣标识 (CC Switch 经典七彩花瓣图标)
// -------------------------------------------------------------
function BurstLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      title="CC Switch 灵感彩瓣"
    >
      {/* 8 条圆角彩色花瓣，顺时针各 45 度精密排列 */}
      <rect x="44" y="6" width="12" height="26" rx="6" fill="#f97316" />
      <rect x="44" y="6" width="12" height="26" rx="6" transform="rotate(45 50 50)" fill="#6366f1" />
      <rect x="44" y="6" width="12" height="26" rx="6" transform="rotate(90 50 50)" fill="#f59e0b" />
      <rect x="44" y="6" width="12" height="26" rx="6" transform="rotate(135 50 50)" fill="#14b8a6" />
      <rect x="44" y="6" width="12" height="26" rx="6" transform="rotate(180 50 50)" fill="#0ea5e9" />
      <rect x="44" y="6" width="12" height="26" rx="6" transform="rotate(225 50 50)" fill="#84cc16" />
      <rect x="44" y="6" width="12" height="26" rx="6" transform="rotate(270 50 50)" fill="#10b981" />
      <rect x="44" y="6" width="12" height="26" rx="6" transform="rotate(315 50 50)" fill="#ec4899" />
      {/* 中心翡翠绿圆核 */}
      <circle cx="50" cy="50" r="14" fill="#00b080" />
    </svg>
  );
}

// -------------------------------------------------------------
// 品牌徽标标识 (Brand Logo: 金黄圆角衡章，内嵌火焰薪火与衡字)
// -------------------------------------------------------------
function BrandLogo({ size = 52 }: { size?: number }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
      <img
        src={brandHengSeal}
        alt="衡"
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          objectFit: 'cover',
          borderRadius: Math.max(8, Math.round(size * 0.22)),
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
          boxShadow: '0 3px 10px rgba(0,0,0,0.28)',
        }}
      />
    </div>
  );
}
const DualBrandLogo = BrandLogo;

// -------------------------------------------------------------
// 现代八彩花瓣品牌标 (Flower Brand Logo: 八彩花瓣图标)
// -------------------------------------------------------------
function FlowerBrandLogo({ size = 42 }: { size?: number }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
      <img
        src={brandBurstFlower}
        alt="衡绩"
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
        }}
      />
    </div>
  );
}

class SafeStarsBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('StarsView caught error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '36px', background: '#ffffff', borderRadius: '16px', border: '1px solid #fee2e2', margin: '20px 0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', marginBottom: '12px' }}>
            <AlertTriangle size={24} />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>卓越绩星荣誉殿堂渲染提示</h3>
          </div>
          <p style={{ color: '#475569', fontSize: '13.5px', lineHeight: 1.6, marginBottom: '16px' }}>
            检测到当前工作区或数据包中的部分绩效分配记录存在格式差异，系统已为您实施安全隔离保护（{this.state.error?.message || '未知数据格式'}）。
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              className="primary"
              style={{ background: '#059669', borderColor: '#047857' }}
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              🔄 重新加载荣誉殿堂
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function GroupRoleBadge({ role }: { role?: string }) {
  if (!role) return <span style={{ color: '#94a3b8', fontSize: '11px' }}>—</span>;
  if (role === '组长') return <Badge tone="amber">🌟 组长</Badge>;
  if (role === '副组长') return <Badge tone="blue">副组长</Badge>;
  if (role === '顾问') return <Badge tone="purple">顾问</Badge>;
  return <Badge tone="neutral">{role}</Badge>;
}

// Browser & Desktop file download helper
async function triggerDownload(content: string, filename: string, mimeType = 'text/csv;charset=utf-8'): Promise<void> {
  if (typeof window !== 'undefined' && window.meritDesktop?.exportCsv && !filename.endsWith('.json')) {
    await window.meritDesktop.exportCsv({ content, defaultPath: filename });
    return;
  }
  const type = filename.endsWith('.json') ? 'application/json;charset=utf-8' : mimeType;
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// 清理历史残留虚拟系统管理员账号，确保主任与真实管理人员拥有系统控制权
function sanitizeState(s: State): State {
  if (!s || !Array.isArray(s.employees)) return s;
  const fakeAdmin = s.employees.find(e => e.name === '系统管理员');
  if (!fakeAdmin) return s;

  const realAdmin = s.employees.find(e => e.role === 'admin' && e.name !== '系统管理员') ||
    s.employees.find(e => e.name !== '系统管理员') ||
    { id: 'admin', name: '管理员', department: '综合管理部', group: '', position: '系统管理员', groupRole: '', email: 'admin@topfire.com', role: 'admin', active: true };

  const fakeId = fakeAdmin.id;
  const cleanedEmployees = s.employees.filter(e => e.id !== fakeId && e.name !== '系统管理员');

  const cleanedProjects = s.projects.map(p => {
    const newOwner = p.owner === fakeId ? realAdmin.id : p.owner;
    const newMembers = p.members.map(m => m === fakeId ? realAdmin.id : m);
    return {
      ...p,
      owner: newOwner,
      members: Array.from(new Set(newMembers)),
    };
  });

  const cleanedPlans = s.plans.map(pl => {
    // 将虚拟管理员的历史绩点分配无损转移合并给真实主任管理员账号，确保百分比严格保持100%
    const entries = pl.entries.map(en => en.employeeId === fakeId ? { ...en, employeeId: realAdmin.id } : en);
    const mergedMap = new Map<string, number>();
    for (const en of entries) {
      mergedMap.set(en.employeeId, (mergedMap.get(en.employeeId) || 0) + en.rate);
    }
    const mergedEntries = Array.from(mergedMap.entries()).map(([employeeId, rate]) => ({ employeeId, rate }));
    return {
      ...pl,
      entries: mergedEntries,
    };
  });

  return {
    ...s,
    employees: cleanedEmployees,
    projects: cleanedProjects,
    plans: cleanedPlans,
  };
}

function WorkspaceGate({ hasLegacyData, onReady, onError, onOpenGuide, onOpenManual, onOpenAbout, onOpenUpdate, updateResult }: {
  hasLegacyData: boolean;
  onReady(data: {
    name: string;
    revision: number;
    actorId: string;
    workspaceType?: WorkspaceType;
    ownerEmployeeId?: string;
    ownerEmployeeName?: string;
    state: State;
    projectGroups: ProjectGroup[];
    filePath: string;
  }): void;
  onError(message: string): void;
  onOpenGuide(): void;
  onOpenManual(): void;
  onOpenAbout(): void;
  onOpenUpdate(): void;
  updateResult?: UpdateCheckResult | null;
}) {
  const [mode, setMode] = useState<'home' | 'create' | 'open'>('home');
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>('general');
  const [ownerEmployeeId, setOwnerEmployeeId] = useState('');
  const [ownerEmployeeName, setOwnerEmployeeName] = useState('');
  const [name, setName] = useState('衡绩工作区');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [openPath, setOpenPath] = useState('');
  const [base, setBase] = useState<{ employees: Employee[]; projectGroups: ProjectGroup[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const chooseOpen = async () => {
    setErrorMsg('');
    try {
      if (typeof window !== 'undefined' && window.meritDesktop?.chooseOpen) {
        const selected = await window.meritDesktop.chooseOpen();
        if (selected) {
          setOpenPath(selected);
          setMode('open');
        }
      }
    } catch (error) {
      const msg = errorText(error);
      setErrorMsg(msg);
      onError(msg);
    }
  };

  const createWorkspace = async () => {
    setErrorMsg('');
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg('请填写工作区名称');
      return;
    }

    if (workspaceType === 'auditor' && !ownerEmployeeName.trim()) {
      setErrorMsg('请配置该工作区绑定的绩效核算员姓名');
      return;
    }

    const pwd = password.trim();
    const confirmPwd = confirmPassword.trim();
    if (pwd && confirmPwd && pwd !== confirmPwd) {
      setErrorMsg('两次输入的管理员口令不一致，请重新核对');
      return;
    }
    if (pwd && !confirmPwd) {
      setErrorMsg('您输入了管理员口令，请在确认口令栏再次输入以核实');
      return;
    }
    const defaultAdmin: Employee = {
      id: 'admin',
      name: '管理员',
      department: '综合管理部',
      group: '',
      position: '系统管理员',
      groupRole: '',
      email: 'admin@local',
      role: 'admin',
      active: true,
    };
    const employees = base?.employees?.length ? structuredClone(base.employees) : [defaultAdmin];

    // 如果是绩效核算员工作区，确保该核算员在员工列表中并标记 role: 'auditor'
    let finalOwnerId = ownerEmployeeId.trim();
    const finalOwnerName = ownerEmployeeName.trim();
    if (workspaceType === 'auditor' && finalOwnerName) {
      if (!finalOwnerId) finalOwnerId = `aud_${Date.now().toString().slice(-4)}`;
      const existing = employees.find(e => e.id === finalOwnerId || e.name === finalOwnerName);
      if (!existing) {
        employees.push({
          id: finalOwnerId,
          name: finalOwnerName,
          department: '综合管理部',
          position: '绩效核算员',
          role: 'auditor',
          email: `${finalOwnerId}@local`,
          active: true,
        });
      } else {
        existing.role = 'auditor';
        finalOwnerId = existing.id;
      }
    }

    const initial: State = { employees, projects: [], plans: [], audit: [] };
    try {
      setBusy(true);
      if (typeof window !== 'undefined' && window.meritDesktop?.create) {
        const result = await window.meritDesktop.create({
          name: trimmedName,
          password: pwd,
          workspaceType,
          ownerEmployeeId: finalOwnerId,
          ownerEmployeeName: finalOwnerName,
          state: initial,
          projectGroups: base?.projectGroups || []
        });
        if (result) {
          onReady(result);
        }
      } else {
        // 浏览器环境免密备用存储
        const rev = 1;
        localStorage.setItem('merit_desktop_state', JSON.stringify({
          revision: rev,
          actorId: finalOwnerId || 'admin',
          workspaceType,
          ownerEmployeeId: finalOwnerId,
          ownerEmployeeName: finalOwnerName,
          state: initial,
        }));
        onReady({
          name: trimmedName,
          revision: rev,
          actorId: finalOwnerId || 'admin',
          workspaceType,
          ownerEmployeeId: finalOwnerId,
          ownerEmployeeName: finalOwnerName,
          state: initial,
          projectGroups: base?.projectGroups || [],
          filePath: '本地存储 (Web LocalStorage)'
        });
      }
    } catch (error) {
      const msg = errorText(error);
      setErrorMsg(msg);
      onError(msg);
    } finally {
      setBusy(false);
    }
  };

  const openWorkspace = async () => {
    setErrorMsg('');
    if (!openPath) return chooseOpen();
    try {
      setBusy(true);
      if (typeof window !== 'undefined' && window.meritDesktop?.open) {
        const res = await window.meritDesktop.open({ filePath: openPath, password: password.trim() });
        if (res) onReady(res);
      }
    } catch (error) {
      const msg = errorText(error);
      setErrorMsg(msg);
      onError(msg);
    } finally {
      setBusy(false);
    }
  };

  const importBase = async () => {
    setErrorMsg('');
    try {
      if (typeof window !== 'undefined' && window.meritDesktop?.importBase) {
        const result = await window.meritDesktop.importBase();
        if (result) {
          setBase(result);
          setMode('create');
          setName('基于共享基础库的新工作区');
        }
      }
    } catch (error) {
      const msg = errorText(error);
      setErrorMsg(msg);
      onError(msg);
    }
  };

  return <div className="workspace-gate">
    <div className="workspace-hero">
      <div className="workspace-logo">衡绩</div>
      <span className="eyebrow">ENCRYPTED OFFLINE WORKSPACE</span>
      <h1>选择你的安全工作区</h1>
      <p>项目、月度分配、工作内容和绩点全部保存在你指定的加密文件中。程序不会把业务数据默认放到系统盘。</p>
      {mode === 'home' && <div className="workspace-actions">
        <button className="primary large" onClick={() => { setErrorMsg(''); setMode('create'); }}><Plus size={18}/>新建工作区</button>
        <button className="secondary large" onClick={chooseOpen}><FolderOpen size={18}/>打开工作区</button>
        <button className="secondary large" onClick={importBase}><Users size={18}/>从共享基础库新建</button>
      </div>}
      {mode === 'home' && (
        <div style={{ marginTop: '22px', paddingTop: '18px', borderTop: '1px solid #e3e9e5', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="guide-gate-trigger"
            onClick={onOpenGuide}
          >
            <Sparkles size={15} style={{ color: '#16a34a' }} />
            💡 5步快速操作向导
          </button>
          <button
            type="button"
            className="guide-gate-trigger manual-gate-trigger"
            onClick={onOpenManual}
          >
            <BookOpen size={15} style={{ color: '#0284c7' }} />
            📖 简易操作手册 (图文版)
          </button>
          <button
            type="button"
            className="guide-gate-trigger"
            style={{ background: '#f8fafc', borderColor: '#cbd5e1', color: '#0f172a' }}
            onClick={onOpenAbout}
          >
            <Info size={15} style={{ color: '#0d9488' }} />
            ℹ️ 关于 (v{APP_VERSION})
          </button>
          <button
            type="button"
            className="guide-gate-trigger"
            style={{
              background: updateResult?.hasUpdate ? '#fff7ed' : '#f0f9ff',
              borderColor: updateResult?.hasUpdate ? '#fdba74' : '#bae6fd',
              color: updateResult?.hasUpdate ? '#c2410c' : '#0369a1',
              fontWeight: 600,
            }}
            onClick={onOpenUpdate}
          >
            <RefreshCw size={15} style={{ color: updateResult?.hasUpdate ? '#ea580c' : '#0284c7' }} />
            {updateResult?.hasUpdate ? `🚀 发现新版 v${updateResult.latestVersion} (点击升级)` : '🔍 检测新版'}
          </button>
        </div>
      )}
      {mode === 'create' && <div className="workspace-form">
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
            工作区类型与应用场景
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div
              style={{
                border: `2px solid ${workspaceType === 'general' ? '#15803d' : '#e2e8f0'}`,
                background: workspaceType === 'general' ? '#f0fdf4' : '#ffffff',
                borderRadius: '10px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => {
                setWorkspaceType('general');
                setName('衡绩通用管理工作区');
                setErrorMsg('');
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#166534', fontSize: '13.5px' }}>
                <Building2 size={16} />
                🏢 综合管理工作区
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '6px', lineHeight: 1.45 }}>
                全功能综合工作区，适用于超级管理员统一全局配置、项目库创建、额度分配规划与团队基准库维护。
              </div>
            </div>

            <div
              style={{
                border: `2px solid ${workspaceType === 'auditor' ? '#0284c7' : '#e2e8f0'}`,
                background: workspaceType === 'auditor' ? '#f0f9ff' : '#ffffff',
                borderRadius: '10px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => {
                setWorkspaceType('auditor');
                setName('部门绩效核算与汇总工作区');
                setErrorMsg('');
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0369a1', fontSize: '13.5px' }}>
                <Calculator size={16} />
                📊 绩效核算工作区
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '6px', lineHeight: 1.45 }}>
                核算员专职工作区，用于导入项目分配数据包，汇总部门全员绩点档案、监控合同额度大盘与评选月/季/年度之星。
              </div>
            </div>
          </div>
        </div>

        {/* 若为核算员工作区：配置核算员 */}
        {workspaceType === 'auditor' && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#047857', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} />
              配置工作区绑定的绩效核算员
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: base?.employees?.length ? '1fr 1fr' : '1fr 1fr', gap: '10px' }}>
              {base?.employees?.length ? (
                <Field label="从基础库选择核算员">
                  <select
                    value={ownerEmployeeId}
                    onChange={e => {
                      const emp = base.employees.find(x => x.id === e.target.value);
                      setOwnerEmployeeId(e.target.value);
                      if (emp) {
                        setOwnerEmployeeName(emp.name);
                        setName(`${emp.name}的绩效核算汇总工作区`);
                      }
                      setErrorMsg('');
                    }}
                  >
                    <option value="">-- 请选择核算员 --</option>
                    {base.employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.department} - {emp.role === 'auditor' ? '核算员' : emp.position || '成员'})
                      </option>
                    ))}
                  </select>
                </Field>
              ) : null}
              <Field label="核算员姓名">
                <input
                  value={ownerEmployeeName}
                  onChange={e => {
                    setOwnerEmployeeName(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="如：李核算"
                />
              </Field>
              <Field label="核算员工号 / ID (选填)">
                <input
                  value={ownerEmployeeId}
                  onChange={e => { setOwnerEmployeeId(e.target.value); setErrorMsg(''); }}
                  placeholder="如：aud_01 或留空自动生成"
                />
              </Field>
            </div>
          </div>
        )}

        <Field label="工作区名称"><input autoFocus value={name} onChange={event => { setName(event.target.value); setErrorMsg(''); }} placeholder="例如：张主管负责的项目工作区"/></Field>
        {base && <div className="safe-note green"><Check size={16}/>已载入 {base.employees.length} 名员工及其专业组信息；不包含常用项目组、项目、工作内容或绩点。</div>}
        <div className="workspace-passwords">
          <Field label="安全访问口令 (选填)" hint="若需安全防窥可设置口令；留空则创建免密工作区">
            <input type="password" value={password} onChange={event => { setPassword(event.target.value); setErrorMsg(''); }} placeholder="选填，留空则免密直接使用"/>
          </Field>
          <Field label="确认口令" hint="未设口令时无需输入">
            <input type="password" value={confirmPassword} onChange={event => { setConfirmPassword(event.target.value); setErrorMsg(''); }} placeholder="未设口令时无需输入"/>
          </Field>
        </div>
        <div className="safe-note">
          <ShieldCheck size={17}/>
          <div>
            <b>请选择非系统盘或单位加密盘保存</b>
            <span>点击下方按钮即可弹出文件窗口自由选择保存位置（建议存放到 D 盘或加密盘）。设置口令保护更安全；留空则日常使用免密直接打开。</span>
          </div>
        </div>
        {errorMsg && (
          <div className="safe-note red" style={{ margin: '10px 0 16px' }}>
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <div>
              <b>操作提示</b>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}
        <div className="workspace-actions">
          <button className="secondary" onClick={() => { setErrorMsg(''); setMode('home'); }}>返回</button>
          <button className="primary" disabled={busy} onClick={createWorkspace}>
            <Save size={17}/>{busy ? '正在选择保存位置…' : '选择位置并创建'}
          </button>
        </div>
      </div>}
      {mode === 'open' && <div className="workspace-form">
        <Field label="工作区文件"><div className="workspace-file-row"><input readOnly value={openPath}/><button className="secondary" onClick={chooseOpen}>重新选择</button></div></Field>
        <Field label="管理员口令"><input autoFocus type="password" value={password} onChange={event => { setPassword(event.target.value); setErrorMsg(''); }} onKeyDown={event => { if (event.key === 'Enter') openWorkspace(); }} placeholder="未设口令的工作区可直接点击解密打开"/></Field>
        <div className="safe-note"><ShieldCheck size={17}/><span>口令只在当前运行期间保存在内存中，锁定或退出程序后立即清除。未设口令的工作区可直接打开。</span></div>
        {errorMsg && (
          <div className="safe-note red" style={{ margin: '10px 0 16px' }}>
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <div>
              <b>操作提示</b>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}
        <div className="workspace-actions">
          <button className="secondary" onClick={() => { setErrorMsg(''); setMode('home'); }}>返回</button>
          <button className="primary" disabled={busy} onClick={openWorkspace}>
            <KeyRound size={17}/>{busy ? '正在解密…' : '解密并打开'}
          </button>
        </div>
      </div>}
      {hasLegacyData && mode === 'home' && <div className="legacy-hint">检测到旧版本地数据。请先用旧版本导出完整备份，再在新工作区的数据导入页面恢复。</div>}
    </div>
    <div className="workspace-security"><div><ShieldCheck/><b>AES-256-GCM 加密</b><span>项目和绩点不以明文保存</span></div><div><Database/><b>保存位置由作者选择</b><span>不再默认藏在系统盘</span></div><div><Users/><b>安全共享基础库</b><span>只导出员工与专业组</span></div></div>
  </div>;
}

export default function DesktopWorkspace() {
  const [state, setState] = useState<State | null>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>('general');
  const [ownerEmployeeId, setOwnerEmployeeId] = useState('');
  const [ownerEmployeeName, setOwnerEmployeeName] = useState('');
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [hasLegacyData, setHasLegacyData] = useState(false);
  const [revision, setRevision] = useState(0);
  const [actorId, setActorId] = useState('admin');
  const [dataFile, setDataFile] = useState('');
  const [tab, setTab] = useState<Tab>('dashboard');
  const [auditorSubTab, setAuditorSubTab] = useState<AuditorTab>('employees');
  const [auditorPackages, setAuditorPackages] = useState<ProjectMeritPackage[]>([]);
  const [notice, setNotice] = useState('');

  // Modals & form state
  const [employeeEdit, setEmployeeEdit] = useState<Employee | 'new' | null>(null);
  const [projectEdit, setProjectEdit] = useState<Project | 'new' | null>(null);
  const [projectDetailId, setProjectDetailId] = useState<string | null>(null);
  const [projectQuotaModalId, setProjectQuotaModalId] = useState<string | null>(null);
  const [planEdit, setPlanEdit] = useState<Plan | 'new' | null>(null);
  const [planProjectId, setPlanProjectId] = useState('');
  const [preloadGroupId, setPreloadGroupId] = useState<string>('');

  // 项目组管理状态 (不预设默认模版，由用户根据业务需要手动配置或从CSV导入)
  const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [apertureNoticeOpen, setApertureNoticeOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualChapter, setManualChapter] = useState(0);
  const [showOfficialHome, setShowOfficialHome] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && !window.meritDesktop?.status) {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      if (params.get('demo') === '1' || hash === '#demo' || hash === '#app') {
        return false;
      }
      return true;
    }
    return false;
  });

  // 启动后自动异步检测更新，存在新版本时采用热门的矩形框动态光圈提示新版本
  useEffect(() => {
    const timer = setTimeout(() => {
      checkAppUpdate(APP_VERSION).then(res => {
        setUpdateResult(res);
        if (res.hasUpdate) {
          setUpdateAvailable(true);
          setApertureNoticeOpen(true);
        }
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const derivedAuditorState = useMemo(() => {
    return buildAuditorDerivedState(auditorPackages, state);
  }, [auditorPackages, state]);

  // 第一次进入工作区自动展示新手 5 步向导
  useEffect(() => {
    if (state && !showOfficialHome && typeof window !== 'undefined') {
      try {
        const viewed = localStorage.getItem('hengji_onboarding_viewed_v062');
        if (!viewed) {
          setOnboardingStep(1);
          setOnboardingOpen(true);
        }
      } catch {}
    }
  }, [Boolean(state), showOfficialHome]);

  const saveProjectGroups = async (next: ProjectGroup[]) => {
    setProjectGroups(next);
    if (state) await persist(state, '常用项目组已保存到当前工作区', next);
  };

  // Load initial state (Desktop IPC with LocalStorage fallback)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.meritDesktop?.status) {
      window.meritDesktop.status().then(data => {
        setHasLegacyData(Boolean(data.hasLegacyData));
        if (data.open) applyWorkspace(data);
        setWorkspaceReady(true);
      }).catch(error => { setNotice(errorText(error)); setWorkspaceReady(true); });
    } else {
      // Browser fallback
      try {
        const raw = localStorage.getItem('merit_desktop_state');
        if (raw) {
          const parsed = JSON.parse(raw);
          const cleanState = sanitizeState(parsed.state);
          setState(cleanState);
          setRevision(parsed.revision || 1);
          setWorkspaceType(parsed.workspaceType || 'general');
          setOwnerEmployeeId(parsed.ownerEmployeeId || '');
          setOwnerEmployeeName(parsed.ownerEmployeeName || '');
          setActorId(parsed.actorId === 'admin' && !cleanState.employees.some(e => e.id === 'admin') ? (cleanState.employees.find(e => e.role === 'admin')?.id || 'emp_01') : (parsed.actorId || 'emp_01'));
          if (cleanState.auditorPackages && Array.isArray(cleanState.auditorPackages)) {
            setAuditorPackages(cleanState.auditorPackages);
          }
        } else {
          const init = sanitizeState(demoState());
          setState(init);
          setRevision(1);
          setActorId('admin');
        }
      } catch {
        setState(sanitizeState(demoState()));
      }
      setWorkspaceReady(true);
    }
  }, []);

  function applyWorkspace(data: {
    name: string;
    revision: number;
    actorId: string;
    workspaceType?: WorkspaceType;
    ownerEmployeeId?: string;
    ownerEmployeeName?: string;
    state: State;
    projectGroups: ProjectGroup[];
    filePath: string;
  }) {
    const cleanState = sanitizeState(data.state);
    const wsType = data.workspaceType || 'general';
    setWorkspaceType(wsType);
    setOwnerEmployeeId(data.ownerEmployeeId || '');
    setOwnerEmployeeName(data.ownerEmployeeName || '');

    const pkgs = (cleanState.auditorPackages && Array.isArray(cleanState.auditorPackages)) ? cleanState.auditorPackages : [];
    setAuditorPackages(pkgs);

    let chosenActorId = data.actorId;
    // 如果是项目负责人工作区，自动优先以项目负责人身份进入
    if (wsType === 'project_manager' && data.ownerEmployeeId) {
      const pm = cleanState.employees.find(e => e.id === data.ownerEmployeeId);
      if (pm) chosenActorId = pm.id;
    } else if (wsType === 'auditor') {
      const aud = cleanState.employees.find(e => (e.role === 'auditor' || e.id === data.ownerEmployeeId) && e.active);
      if (aud) chosenActorId = aud.id;
      setTab('dashboard');
    } else {
      const adminId = cleanState.employees.find(employee => employee.role === 'admin' && employee.active)?.id || cleanState.employees[0]?.id || 'admin';
      chosenActorId = adminId;
    }

    setState(cleanState);
    setRevision(data.revision);
    setActorId(chosenActorId);
    setProjectGroups(Array.isArray(data.projectGroups) ? data.projectGroups : []);
    setDataFile(data.filePath);
    setWorkspaceName(data.name);
  }

  async function persist(next: State, message: string, groups = projectGroups) {
    const fullState: State = {
      ...next,
      auditorPackages: next.auditorPackages !== undefined ? next.auditorPackages : auditorPackages,
    };
    validate(fullState);
    if (typeof window !== 'undefined' && window.meritDesktop?.save) {
      const saved = await window.meritDesktop.save({
        name: workspaceName,
        revision,
        actorId,
        workspaceType,
        ownerEmployeeId,
        ownerEmployeeName,
        state: fullState,
        projectGroups: groups,
      });
      setState(saved.state);
      setRevision(saved.revision);
      setDataFile(saved.filePath);
      if (saved.state.auditorPackages) {
        setAuditorPackages(saved.state.auditorPackages);
      }
    } else {
      const nextRev = revision + 1;
      localStorage.setItem('merit_desktop_state', JSON.stringify({
        revision: nextRev,
        actorId,
        workspaceType,
        ownerEmployeeId,
        ownerEmployeeName,
        state: fullState,
      }));
      setState(fullState);
      setRevision(nextRev);
    }
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2800);
  }

  const handleUpdateAuditorPackages = async (newPkgs: ProjectMeritPackage[], message?: string) => {
    setAuditorPackages(newPkgs);
    try {
      localStorage.setItem(`merit_auditor_pkgs_${workspaceName || 'default'}`, JSON.stringify(newPkgs));
    } catch {}
    if (state) {
      const nextState: State = {
        ...state,
        auditorPackages: newPkgs,
      };
      await persist(nextState, message || `已成功更新并持久化保存 ${newPkgs.length} 个项目数据包`);
    }
  };

  const handleImportAuditorFiles = async (files: FileList | null | File[]) => {
    if (!files || files.length === 0) return;
    const newPkgs: ProjectMeritPackage[] = [];
    let errorCount = 0;
    let bundleCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await file.text();
        const parsedList = parseMeritPackageOrBundle(text);
        if (parsedList.length > 1) {
          bundleCount++;
        }
        for (const p of parsedList) {
          newPkgs.push(p);
        }
      } catch (err: any) {
        errorCount++;
        console.error('导入数据包失败:', file.name, err);
      }
    }

    if (newPkgs.length > 0) {
      const map = new Map<string, ProjectMeritPackage>();
      auditorPackages.forEach(p => map.set(p.project.id, p));
      newPkgs.forEach(p => map.set(p.project.id, p));
      const merged = Array.from(map.values());
      const bundleHint = bundleCount > 0 ? `（含 ${bundleCount} 个多项目合并包）` : '';
      const msg = `✅ 成功导入 ${newPkgs.length} 个项目数据包${bundleHint}！已为您自动合并汇总并持久化保存。`;
      await handleUpdateAuditorPackages(merged, msg);
    }

    if (errorCount > 0) {
      setNotice(`⚠️ 有 ${errorCount} 个文件格式不合规或损坏，未成功导入。`);
    }
  };

  const handleLoadSystemProjectsToAuditor = () => {
    if (!state) return;
    const systemPackages: ProjectMeritPackage[] = [];
    const employees = state.employees || [];
    state.projects.forEach(prj => {
      const plans = state.plans.filter(p => p.projectId === prj.id && p.status === 'published');
      if (!plans.length) return;
      const records = plans.flatMap(p => p.records);
      const pkg = exportProjectMeritPackage(
        prj,
        plans,
        records,
        employees,
        currentActor.id,
        currentActor.name
      );
      systemPackages.push(pkg);
    });
    if (!systemPackages.length) {
      setNotice('当前系统内暂无已发布的项目月度分配记录');
      return;
    }
    handleUpdateAuditorPackages(systemPackages, `已从当前系统成功载入 ${systemPackages.length} 个项目的全部分配数据`);
  };

  const handleExportAuditorFullBundle = async () => {
    if (!auditorPackages.length) {
      setNotice('当前尚未载入任何项目数据包，无法导出汇总总包');
      return;
    }
    const employees = state?.employees || [];
    const summary = summarizeAuditorPackages(auditorPackages, employees);
    const bundleJson = exportAuditorFullBundleJson(summary, auditorPackages);
    await triggerDownload(
      bundleJson,
      `衡绩_全项目全员核算汇总数据总包_${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
    setNotice('全项目全员核算汇总数据总包已成功导出');
  };

  const handleRemoveAuditorPackage = (projectId: string) => {
    const next = auditorPackages.filter(p => p.project.id !== projectId);
    handleUpdateAuditorPackages(next, '已从当前核算中移除该项目数据包');
  };

  const handleClearAllAuditorPackages = () => {
    if (!auditorPackages.length) return;
    if (confirm('确定要清空当前已载入的全部项目数据包吗？清空后可重新导入。')) {
      handleUpdateAuditorPackages([], '已清空当前载入的项目数据包');
    }
  };

  async function command(type: string, data: any, message: string) {
    if (!state) return false;
    try {
      await persist(execute(state, actorId, { type, data }, uid(), new Date().toISOString()), message);
      return true;
    } catch (error) {
      setNotice(errorText(error));
      return false;
    }
  }

  // 身份与权限计算
  const currentActor: Employee = useMemo(() => {
    if (!state) {
      return { id: 'admin', name: '管理员', department: '综合管理部', group: '', position: '系统管理员', role: 'admin', active: true, email: 'admin@topfire.com' };
    }
    return (
      state.employees.find(e => e.id === actorId && e.active) ||
      state.employees.find(e => e.role === 'admin' && e.active) ||
      state.employees[0] ||
      { id: 'admin', name: '管理员', department: '综合管理部', group: '', position: '系统管理员', role: 'admin', active: true, email: 'admin@topfire.com' }
    );
  }, [state, actorId]);

  const isAdmin = currentActor.role === 'admin';
  const isAuditor = currentActor.role === 'admin' || currentActor.role === 'auditor';
  const isManager = useMemo(() => {
    return Boolean(state?.projects.some(p => p.owner === currentActor.id));
  }, [state, currentActor.id]);

  const handleExportProjectPackage = async (projectId: string) => {
    if (!state) return;
    try {
      const p = state.projects.find(item => item.id === projectId);
      if (!p) {
        setNotice('项目不存在');
        return;
      }
      const jsonStr = exportProjectMeritPackageJson(state, projectId, { actor: currentActor });
      const filename = `【项目绩点数据包】${p.name}_${p.code || '令号'}_${new Date().toISOString().slice(0, 10)}.json`;
      await triggerDownload(jsonStr, filename, 'application/json;charset=utf-8');
      setNotice(`✅ 已成功导出【${p.name}】绩点分配数据包！请将此数据包发给核算员进行全员汇总。`);
    } catch (err: any) {
      setNotice(`❌ 导出数据包失败：${err.message}`);
    }
  };

  // 导出项目数据包（项目负责人导出名下项目合包，或管理员一键导出全系统所有项目合包）
  const handleExportManagerAllPackages = async (targetManagerId?: string) => {
    if (!state) return;
    if (state.projects.length === 0) {
      setNotice('当前系统暂无任何项目数据可导出。');
      return;
    }
    const mId = targetManagerId || (workspaceType === 'project_manager' && ownerEmployeeId ? ownerEmployeeId : currentActor.id);
    const manager = state.employees.find(e => e.id === mId) || currentActor;
    const myProjects = state.projects.filter(p => p.owner === mId || p.owner === manager.name);

    if (myProjects.length === 0 || targetManagerId === 'all') {
      if (isAdmin || currentActor.role === 'auditor') {
        try {
          const bundleJson = exportProjectManagerBundleJson(state, 'all', currentActor);
          const filename = `【项目数据包合包】全部门_${state.projects.length}个项目数据包_${new Date().toISOString().slice(0, 10)}.json`;
          await triggerDownload(bundleJson, filename, 'application/json;charset=utf-8');
          setNotice(`✅ 已成功导出全部门共 ${state.projects.length} 个项目的绩点分配数据包！请直接发给核算员导入。`);
          return;
        } catch (err: any) {
          setNotice(`❌ 导出失败: ${err.message || '未知错误'}`);
          return;
        }
      } else {
        setNotice(`【${manager.name}】名下暂无管理的任何项目。`);
        return;
      }
    }

    try {
      const bundleJson = exportProjectManagerBundleJson(state, mId, currentActor);
      const filename = `【项目数据包合包】${manager.name}_负责的全部项目数据包_${new Date().toISOString().slice(0, 10)}.json`;
      await triggerDownload(bundleJson, filename, 'application/json;charset=utf-8');
      setNotice(`✅ 已成功导出【${manager.name}】管理的全部 ${myProjects.length} 个项目数据包！请直接发给核算员导入。`);
    } catch (err: any) {
      setNotice(`❌ 导出失败: ${err.message || '未知错误'}`);
    }
  };


  const handleUpdateAdmin = async (
    targetEmpId: string,
    action: 'setAdmin' | 'transferAdmin' | 'removeAdmin',
    switchActive = false
  ) => {
    if (!state) return;
    const targetEmp = state.employees.find(e => e.id === targetEmpId);
    if (!targetEmp) return;

    let updatedEmployees = [...state.employees];

    if (action === 'setAdmin') {
      updatedEmployees = updatedEmployees.map(e => (e.id === targetEmpId ? { ...e, role: 'admin' } : e));
    } else if (action === 'transferAdmin') {
      // 移交管理员：将当前操作者或原有管理员角色调整为 member，新目标设为 admin
      updatedEmployees = updatedEmployees.map(e => {
        if (e.id === targetEmpId) return { ...e, role: 'admin' };
        if (e.id === currentActor.id) return { ...e, role: 'member' };
        return e;
      });
    } else if (action === 'removeAdmin') {
      const remainingAdmins = updatedEmployees.filter(e => e.id !== targetEmpId && e.role === 'admin' && e.active);
      if (remainingAdmins.length === 0) {
        setNotice('系统必须至少保留一名管理员，无法撤销最后一个管理员！');
        return;
      }
      updatedEmployees = updatedEmployees.map(e => (e.id === targetEmpId ? { ...e, role: 'member' } : e));
    }

    const nextState: State = {
      ...state,
      employees: updatedEmployees,
      audit: [
        {
          id: uid(),
          at: new Date().toISOString(),
          actor: currentActor.name,
          action: action === 'setAdmin' ? '设为系统管理员' : action === 'transferAdmin' ? '移交系统管理员' : '降为普通成员',
          target: targetEmp.name,
        },
        ...state.audit,
      ],
    };

    if (switchActive || action === 'transferAdmin') {
      setActorId(targetEmpId);
    }

    const actionText = action === 'setAdmin' ? '设为系统管理员' : action === 'transferAdmin' ? '变更为系统管理员' : '降为普通成员';
    await persist(nextState, `已成功将【${targetEmp.name}】${actionText}`);
  };

  const handleRestoreState = async (restoredState: State, restoredGroups?: ProjectGroup[]) => {
    try {
      const clean = sanitizeState(restoredState);
      const groupsToApply = Array.isArray(restoredGroups) ? restoredGroups : projectGroups;
      setProjectGroups(groupsToApply);
      await persist(clean, '全量系统灾备数据与项目组配置已成功恢复！', groupsToApply);
    } catch (e) {
      setNotice(errorText(e));
    }
  };

  if (!workspaceReady) return <div className="loading"><div className="spinner" />正在初始化安全工作区…</div>;
  if (showOfficialHome && typeof window !== 'undefined' && !window.meritDesktop?.status) {
    return (
      <OfficialLandingPage
        onLaunchDemo={(initialTab, targetWsType) => {
          let currentState = state;
          if (!currentState) {
            const init = sanitizeState(demoState());
            currentState = init;
            setState(init);
            setRevision(1);
            setActorId('admin');
          }
          if (targetWsType) {
            setWorkspaceType(targetWsType);
            if (targetWsType === 'auditor' && currentState && (!auditorPackages || auditorPackages.length === 0)) {
              const sysPkgs: ProjectMeritPackage[] = [];
              const emps = currentState.employees || [];
              currentState.projects.forEach(prj => {
                const pls = currentState!.plans.filter(p => p.projectId === prj.id && p.status === 'published');
                if (!pls.length) return;
                const pkg = exportProjectMeritPackage(prj, pls, [], emps, 'admin', '管理员');
                sysPkgs.push(pkg);
              });
              if (sysPkgs.length > 0) {
                setAuditorPackages(sysPkgs);
              }
            }
          } else {
            setWorkspaceType('general');
          }
          if (initialTab) {
            setTab(initialTab as Tab);
          } else {
            setTab('dashboard');
          }
          setShowOfficialHome(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }
  if (!state) return (
    <>
      <WorkspaceGate
        hasLegacyData={hasLegacyData}
        onReady={applyWorkspace}
        onError={message => setNotice(message)}
        onOpenGuide={() => {
          setOnboardingStep(1);
          setOnboardingOpen(true);
        }}
        onOpenManual={() => {
          setManualChapter(0);
          setManualOpen(true);
        }}
        onOpenAbout={() => setAboutModalOpen(true)}
        onOpenUpdate={() => setUpdateModalOpen(true)}
        updateResult={updateResult}
      />
      {aboutModalOpen && (
        <AboutModal
          onClose={() => setAboutModalOpen(false)}
          onCheckUpdate={() => {
            setAboutModalOpen(false);
            setUpdateModalOpen(true);
          }}
          updateResult={updateResult}
        />
      )}
      {updateModalOpen && (
        <UpdateModal
          initialResult={updateResult}
          onClose={() => setUpdateModalOpen(false)}
        />
      )}
      {apertureNoticeOpen && updateResult?.hasUpdate && (
        <UpdateApertureNotice
          result={updateResult}
          onOpenUpdate={() => {
            setApertureNoticeOpen(false);
            setUpdateModalOpen(true);
          }}
          onClose={() => setApertureNoticeOpen(false)}
        />
      )}
      {onboardingOpen && (
        <OnboardingGuideModal
          step={onboardingStep}
          onStepChange={setOnboardingStep}
          onClose={() => setOnboardingOpen(false)}
          onOpenManual={() => {
            setManualChapter(onboardingStep);
            setManualOpen(true);
          }}
          onNavigate={() => {}}
          isGate={true}
        />
      )}
      {manualOpen && (
        <ManualModal
          initialChapter={manualChapter}
          onClose={() => setManualOpen(false)}
          onOpenGuide={() => {
            setOnboardingStep(manualChapter >= 1 && manualChapter <= 5 ? manualChapter : 1);
            setOnboardingOpen(true);
          }}
          onNavigate={() => {}}
          isGate={true}
        />
      )}
    </>
  );

  const nav = [
    { key: 'dashboard', icon: CircleGauge, label: '全景总览驾驶舱' },
    { key: 'projects', icon: BriefcaseBusiness, label: '项目全周期管理' },
    { key: 'plans', icon: CalendarRange, label: '月度绩效分配' },
    { key: 'groups', icon: FolderKanban, label: '常用项目组矩阵' },
    { key: 'employees', icon: Users, label: '团队编制花名册' },
    { key: 'rules', icon: BookOpenCheck, label: '绩效准则与规范' },
    { key: 'analytics', icon: TrendingUp, label: '效能趋势与洞察' },
    { key: 'stars', icon: Trophy, label: '卓越绩星荣誉殿堂' },
    { key: 'reports', icon: BarChart3, label: '多周期汇总报表' },
    { key: 'data_io', icon: FileSpreadsheet, label: '数据资产与灾备中心' },
  ] as const;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '0 4px 18px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '18px' }}>
          <DualBrandLogo size={52} />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <strong style={{ fontSize: '21px', fontWeight: 800, letterSpacing: '1.5px', color: '#ffffff', lineHeight: 1, whiteSpace: 'nowrap' }}>
              衡绩考核
            </strong>
          </div>
        </div>

        {workspaceType === 'auditor' ? (
          <>
            <div className="sidebar-section-title">全景驾驶与考核准则</div>
            <nav>
              <button
                className={tab === 'dashboard' ? 'active' : ''}
                onClick={() => setTab('dashboard')}
              >
                <CircleGauge size={18} />
                <span>全景总览驾驶舱</span>
                <ChevronRight size={14} />
              </button>
              <button
                className={tab === 'rules' ? 'active' : ''}
                onClick={() => setTab('rules')}
              >
                <BookOpenCheck size={18} />
                <span>绩效准则与规范</span>
                <ChevronRight size={14} />
              </button>
              <button
                className={tab === 'analytics' ? 'active' : ''}
                onClick={() => setTab('analytics')}
              >
                <TrendingUp size={18} />
                <span>效能趋势与洞察</span>
                <ChevronRight size={14} />
              </button>
            </nav>

            <div className="sidebar-section-title">数据包流转中心</div>
            <nav>
              <button
                className={tab === 'auditor' && auditorSubTab === 'import' ? 'active' : ''}
                onClick={() => { setTab('auditor'); setAuditorSubTab('import'); }}
              >
                <Upload size={18} style={{ color: '#059669' }} />
                <span>数据包导入中心</span>
                <ChevronRight size={14} />
              </button>
            </nav>

            <div className="sidebar-section-title">全景绩效审计大盘</div>
            <nav>
              <button
                className={tab === 'auditor' && auditorSubTab === 'employees' ? 'active' : ''}
                onClick={() => { setTab('auditor'); setAuditorSubTab('employees'); }}
              >
                <Users size={18} style={{ color: '#10b981' }} />
                <span>全员跨项目绩效总表</span>
                <ChevronRight size={14} />
              </button>
              <button
                className={tab === 'auditor' && auditorSubTab === 'contracts' ? 'active' : ''}
                onClick={() => { setTab('auditor'); setAuditorSubTab('contracts'); }}
              >
                <BriefcaseBusiness size={18} style={{ color: '#0284c7' }} />
                <span>全景合同矩阵</span>
                <ChevronRight size={14} />
              </button>
              <button
                className={tab === 'stars' || (tab === 'auditor' && (auditorSubTab === 'stars' || auditorSubTab === 'ranking')) ? 'active' : ''}
                onClick={() => { setTab('stars'); setAuditorSubTab('stars'); }}
              >
                <Crown size={18} style={{ color: '#e11d48' }} />
                <span>卓越绩星荣誉殿堂</span>
                <ChevronRight size={14} />
              </button>
              <button
                className={tab === 'auditor' && auditorSubTab === 'matrix' ? 'active' : ''}
                onClick={() => { setTab('auditor'); setAuditorSubTab('matrix'); }}
              >
                <Table2 size={18} style={{ color: '#8b5cf6' }} />
                <span>全项目多维透视矩阵</span>
                <ChevronRight size={14} />
              </button>
              <button
                className={tab === 'auditor' && auditorSubTab === 'details' ? 'active' : ''}
                onClick={() => { setTab('auditor'); setAuditorSubTab('details'); }}
              >
                <FileSpreadsheet size={18} style={{ color: '#06b6d4' }} />
                <span>全量明细审计流水</span>
                <ChevronRight size={14} />
              </button>
            </nav>

            <div className="sidebar-section-title">数据资产与灾备中心</div>
            <nav>
              <button
                className={tab === 'data_io' ? 'active' : ''}
                onClick={() => setTab('data_io')}
              >
                <FolderArchive size={18} />
                <span>数据资产与灾备中心</span>
                <ChevronRight size={14} />
              </button>
            </nav>
          </>
        ) : (
          <>
            <div className="sidebar-section-title">核心业务矩阵</div>
            <nav>
              {nav.slice(0, 5).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  className={tab === key ? 'active' : ''}
                  onClick={() => setTab(key as Tab)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </nav>

            <div className="sidebar-section-title">效能分析与荣誉殿堂</div>
            <nav>
              {nav.slice(5).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  className={tab === key ? 'active' : ''}
                  onClick={() => setTab(key as Tab)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </nav>
          </>
        )}

        <div className="sidebar-foot">
          <Database size={16} />
          <div>
            <span>{workspaceName || '在线交互演示工作区'}</span>
            {dataFile ? (
              <button onClick={() => window.meritDesktop?.showData()}>
                <FolderOpen size={13} />定位工作区文件
              </button>
            ) : (
              <button
                type="button"
                style={{ color: '#6ee7b7', cursor: 'pointer' }}
                onClick={() => {
                  setShowOfficialHome(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <Globe size={12} />返回衡绩官网介绍主页
              </button>
            )}
          </div>
        </div>
        <div style={{ padding: '8px 14px', borderTop: '1px solid #1c3b32', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
          <span>v{APP_VERSION}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              style={{ border: 'none', background: 'transparent', color: '#7dd3fc', cursor: 'pointer', padding: 0, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              onClick={() => {
                setManualChapter(0);
                setManualOpen(true);
              }}
              title="查看图文并茂的新手简易操作手册"
            >
              <BookOpen size={11} />操作手册
            </button>
            <button
              type="button"
              style={{ border: 'none', background: 'transparent', color: '#4ade80', cursor: 'pointer', padding: 0, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              onClick={() => setAboutModalOpen(true)}
              title="查看系统关于与版本更新历史"
            >
              <Info size={11} />关于
            </button>
          </div>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
            <span className="eyebrow" style={{ margin: 0, fontSize: '10px' }}>
              MERIT EVALUATION SYSTEM
            </span>
            <strong style={{ fontSize: '18px', color: '#142822', whiteSpace: 'nowrap' }}>
              {workspaceType === 'auditor' ? (
                tab === 'dashboard' ? '全景总览驾驶舱' :
                tab === 'auditor' ? (
                  auditorSubTab === 'import' ? '数据包导入中心' :
                  auditorSubTab === 'employees' ? '全员跨项目绩效总表' :
                  auditorSubTab === 'contracts' ? '全景合同矩阵' :
                  auditorSubTab === 'ranking' || auditorSubTab === 'stars' ? '卓越绩星荣誉殿堂' :
                  auditorSubTab === 'matrix' ? '全项目多维透视矩阵' :
                  auditorSubTab === 'details' ? '全量明细审计流水' : '全项目全员绩效大盘'
                ) :
                tab === 'data_io' ? '数据资产与灾备中心' :
                tab === 'rules' ? '绩效准则与规范' :
                tab === 'analytics' ? '效能趋势与洞察' :
                tab === 'stars' ? '卓越绩星荣誉殿堂' :
                nav.find(item => item.key === tab)?.label
              ) : (
                tab === 'auditor' ? '全项目全员绩效大盘' : nav.find(item => item.key === tab)?.label
              )}
            </strong>
          </div>
          <div className="operator" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: 'auto' }}>
            <div
              className="user-profile-badge clickable"
              title="点击修改系统管理员或切换身份"
              onClick={() => setAuthModalOpen(true)}
            >
              <div className={`user-avatar-circle ${isAdmin ? 'admin' : currentActor.role === 'auditor' ? 'auditor' : isManager ? 'manager' : 'member'}`}>
                {currentActor.name.slice(0, 1)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <b style={{ fontSize: '13px', color: '#1e293b' }}>{currentActor.name}</b>
                  <span className={`role-badge ${isAdmin ? 'admin' : currentActor.role === 'auditor' ? 'auditor' : isManager ? 'manager' : 'member'}`}>
                    {isAdmin ? '👑 系统管理员' : currentActor.role === 'auditor' ? '📊 绩效核算员' : isManager ? '💼 项目负责人' : '👤 专业组成员'}
                  </span>
                  <span className="badge-edit-hint">
                    修改 <ChevronDown size={11} />
                  </span>
                </div>
              </div>
            </div>
            <button className="secondary" style={{ padding: '6px 12px', fontSize: '12.5px', gap: '5px' }} onClick={async () => {
              if (!state) return;
              if (window.meritDesktop?.saveAs) {
                const saved = await window.meritDesktop.saveAs({
                  name: workspaceName,
                  revision,
                  actorId,
                  workspaceType,
                  ownerEmployeeId,
                  ownerEmployeeName,
                  state,
                  projectGroups,
                });
                if (saved) { setRevision(saved.revision); setDataFile(saved.filePath); setNotice('工作区已另存为新文件'); }
              } else {
                setNotice('网页演示版暂不支持另存为本地文件，可点击右上方备份功能下载数据');
              }
            }}><Save size={14}/>工作区另存为</button>
            <button className="secondary" style={{ padding: '6px 12px', fontSize: '12.5px', gap: '5px' }} onClick={async () => {
              if (window.meritDesktop?.exportBase) {
                if (await window.meritDesktop.exportBase({ state, projectGroups })) setNotice('共享基础库已导出：不包含项目、工作内容和绩点');
              } else {
                setNotice('网页演示版暂不支持直接导出基础库，可使用项目组管理进行维护');
              }
            }}><Users size={14}/>导出共享基础库</button>
            <button
              className="secondary guide-nav-btn"
              style={{ padding: '6px 12px', fontSize: '12.5px', gap: '5px' }}
              onClick={() => {
                setOnboardingStep(1);
                setOnboardingOpen(true);
              }}
              title="新手五步快速上手向导与业务闭环指南"
            >
              <Sparkles size={14} style={{ color: '#16a34a' }} />新手引导
            </button>
            {typeof window !== 'undefined' && !window.meritDesktop?.status && (
              <button
                className="secondary"
                style={{
                  padding: '6px 12px',
                  fontSize: '12.5px',
                  gap: '5px',
                  background: '#ecfdf5',
                  borderColor: '#6ee7b7',
                  color: '#047857',
                  fontWeight: 600,
                }}
                onClick={() => {
                  setShowOfficialHome(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                title="返回衡绩官方网站介绍主页"
              >
                <Globe size={14} />官网介绍主页
              </button>
            )}
            <button className="secondary" style={{ padding: '6px 12px', fontSize: '12.5px', gap: '5px' }} onClick={async () => {
              if (window.meritDesktop?.lock) {
                await window.meritDesktop.lock();
                setState(null); setWorkspaceName(''); setDataFile(''); setProjectGroups([]); setNotice('工作区已锁定');
              } else {
                setShowOfficialHome(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}><LogOut size={14}/>{typeof window !== 'undefined' && !window.meritDesktop?.status ? '退出体验' : '锁定'}</button>
          </div>
        </header>

        <div className="page">
          {tab === 'dashboard' && (
            workspaceType === 'auditor' ? (
              <AuditorDashboardView
                state={derivedAuditorState}
                onNavigate={setTab}
                onNavigateDataImport={() => {
                  setTab('auditor');
                  setAuditorSubTab('import');
                }}
                onNavigateRanking={() => {
                  setTab('auditor');
                  setAuditorSubTab('ranking');
                }}
              />
            ) : (
              <DashboardView
                state={state}
                onNavigate={setTab}
                onResetDemo={async () => {
                  if (state.projects.length && !confirm('载入示例会重置当前全部数据，是否继续？')) return;
                  try { await persist(demoState(), '示例数据已成功载入'); } catch (e) { setNotice(errorText(e)); }
                }}
                onOpenGuide={(step = 1) => {
                  setOnboardingStep(step);
                  setOnboardingOpen(true);
                }}
              />
            )
          )}
          {tab === 'projects' && (
            <ProjectsView
              state={state}
              isAdmin={isAdmin}
              isManager={isManager}
              currentActorId={currentActor.id}
              projectGroups={projectGroups}
              onAdd={() => setProjectEdit('new')}
              onEdit={setProjectEdit}
              onDelete={project => {
                if (confirm(`⚠️ 确定要删除项目【${project.name}】（工作令号：${project.code}）吗？\n删除项目将同步清除该项目的所有月度分配草稿与历史记录，此操作不可撤销。`)) {
                  command('project.delete', { id: project.id }, `项目【${project.name}】已永久删除`);
                }
              }}
              onBatchDelete={ids => {
                if (confirm(`⚠️ 确定要批量删除选中的 ${ids.length} 个项目吗？\n将同步删除关联的全部月度分配记录，此操作不可撤销。`)) {
                  command('project.deleteBatch', { ids }, `已批量删除 ${ids.length} 个项目`);
                }
              }}
              onViewDetail={setProjectDetailId}
              onOpenQuotaSchedule={setProjectQuotaModalId}
              onArchive={project => command('project.archive', { id: project.id }, project.status === 'active' ? '项目已结项' : '项目已恢复')}
              onImportProjects={async projects => {
                await command('project.importBatch', { projects }, `成功导入 ${projects.length} 个项目`);
              }}
              onBatchConfigureTeam={async (projectIds, members, defaultRates, ownerId) => {
                await command('project.batchConfigureTeam', { projectIds, members, defaultRates, owner: ownerId }, `已成功为 ${projectIds.length} 个项目批量配置项目成员与默认分配比例`);
              }}
              onExportPackage={handleExportProjectPackage}
              onExportManagerAllPackages={handleExportManagerAllPackages}
            />
          )}
          {tab === 'plans' && (
            <PlansView
              state={state}
              isAdmin={isAdmin}
              isManager={isManager}
              currentActorId={currentActor.id}
              onAdd={projectId => { setPlanProjectId(projectId); setPlanEdit('new'); }}
              onEdit={setPlanEdit}
              onOpenQuotaSchedule={setProjectQuotaModalId}
              onAction={(type, plan) => command(type, { id: plan.id }, type === 'plan.publish' ? '月度绩点已发布' : type === 'plan.reopen' ? '月度绩点已撤回' : '月度草稿已删除')}
              onBatchPublish={async (planIds) => {
                return await command('plan.batchPublish', { planIds }, `已成功批量发布 ${planIds.length} 个项目的月度方案`);
              }}
              onBatchReopen={async (planIds) => {
                return await command('plan.batchReopen', { planIds }, `已成功批量撤回 ${planIds.length} 个项目的月度方案为草稿`);
              }}
              onBatchSave={async (plans) => {
                return await command('plan.batchSave', { plans }, `已成功批量保存 ${plans.length} 个项目的月度分配方案`);
              }}
            />
          )}
          {tab === 'groups' && (
            <GroupsView
              state={state}
              groups={projectGroups}
              currentActorId={currentActor.id}
              onSaveGroups={saveProjectGroups}
              onNewProjectWithGroup={group => {
                setPreloadGroupId(group.id);
                setProjectEdit('new');
              }}
            />
          )}
          {tab === 'employees' && (
            <EmployeesView
              state={state}
              isAdmin={isAdmin}
              currentActorId={currentActor.id}
              onAdd={() => setEmployeeEdit('new')}
              onEdit={setEmployeeEdit}
              onToggleAdmin={async employee => {
                const newRole = employee.role === 'admin' ? 'member' : 'admin';
                const roleName = newRole === 'admin' ? '系统管理员' : '普通成员';
                if (confirm(`确定要将【${employee.name}】权限调整为【${roleName}】吗？`)) {
                  await command('employee.save', { ...employee, role: newRole }, `已将【${employee.name}】调整为【${roleName}】`);
                }
              }}
              onDelete={employee => {
                if (confirm(`确定要删除员工【${employee.name}】吗？`)) {
                  command('employee.delete', { id: employee.id }, `员工【${employee.name}】已删除`);
                }
              }}
              onNavigateIo={() => setTab('data_io')}
              onImportEmployees={async employees => {
                await command('employee.importBatch', { employees }, `成功导入 ${employees.length} 位员工`);
              }}
            />
          )}
          {tab === 'rules' && <RulesView />}
          {tab === 'analytics' && <AnalyticsView state={workspaceType === 'auditor' ? derivedAuditorState : state!} />}
          {tab === 'stars' && (
            <SafeStarsBoundary>
              <StarsView state={workspaceType === 'auditor' ? derivedAuditorState : (state || demoState())} />
            </SafeStarsBoundary>
          )}
          {tab === 'reports' && <ReportsView state={workspaceType === 'auditor' ? derivedAuditorState : state!} />}
          {tab === 'data_io' && (
            workspaceType === 'auditor' ? (
              <AuditorDataIoView
                state={state}
                auditorPackages={auditorPackages}
                workspaceName={workspaceName}
                onImportPackages={handleImportAuditorFiles}
                onRemovePackage={handleRemoveAuditorPackage}
                onClearAllPackages={handleClearAllAuditorPackages}
                onExportFullBundle={handleExportAuditorFullBundle}
                triggerDownload={triggerDownload}
                setNotice={setNotice}
              />
            ) : (
              <DataIoView
                state={state}
                isAdmin={isAdmin}
                projectGroups={projectGroups}
                workspaceName={workspaceName}
                onRestoreState={handleRestoreState}
                onImportEmployees={async employees => {
                  await command('employee.importBatch', { employees }, `成功导入 ${employees.length} 位员工`);
                }}
                onImportProjects={async projects => {
                  await command('project.importBatch', { projects }, `成功导入 ${projects.length} 个项目`);
                }}
                onExportPackages={handleExportManagerAllPackages}
                onNavigateAuditor={() => setTab('auditor')}
              />
            )
          )}
          {tab === 'auditor' && (
            auditorSubTab === 'stars' ? (
              <SafeStarsBoundary>
                <StarsView state={derivedAuditorState} />
              </SafeStarsBoundary>
            ) : (
              <AuditorSummaryView
                state={state!}
                currentActor={currentActor}
                isAdmin={isAdmin}
                isAuditor={isAuditor}
                packages={auditorPackages}
                onUpdatePackages={handleUpdateAuditorPackages}
                activeSubTab={auditorSubTab}
                onSubTabChange={setAuditorSubTab}
                hideTabBar={workspaceType === 'auditor'}
                onSwitchToAuditor={() => {
                  const employees = state?.employees || [];
                  const audEmp = employees.find(e => e.role === 'auditor' && e.active) || employees.find(e => e.role === 'admin' && e.active);
                  if (audEmp) setActorId(audEmp.id);
                  else setAuthModalOpen(true);
                }}
                triggerDownload={triggerDownload}
                setNotice={setNotice}
              />
            )
          )}
        </div>
      </main>

      {notice && (
        <div className={`toast ${/不能|无效|必须|超过|错误|失败|请先/.test(notice) ? 'error' : ''}`}>
          {notice}
        </div>
      )}

      {/* Edit / New Employee Modal */}
      {employeeEdit && (
        <EmployeeFormModal
          value={employeeEdit}
          onClose={() => setEmployeeEdit(null)}
          onSave={async data => {
            if (await command('employee.save', data, employeeEdit === 'new' ? '员工已添加' : '员工信息已更新')) {
              setEmployeeEdit(null);
            }
          }}
        />
      )}

      {/* Edit / New Project Modal */}
      {projectEdit && (
        <ProjectFormModal
          state={state}
          value={projectEdit}
          initialGroupId={preloadGroupId}
          projectGroups={projectGroups}
          onSaveGroups={saveProjectGroups}
          onClose={() => { setProjectEdit(null); setPreloadGroupId(''); }}
          onSave={async data => {
            if (await command('project.save', data, projectEdit === 'new' ? '项目已创建' : '项目信息已更新')) {
              setProjectEdit(null);
              setPreloadGroupId('');
            }
          }}
          onBatchImport={async projects => {
            if (await command('project.importBatch', { projects }, `成功批量导入 ${projects.length} 个项目`)) {
              setProjectEdit(null);
              setPreloadGroupId('');
            }
          }}
        />
      )}

      {/* Project Realtime Quota & Breakdown Modal (需求1) */}
      {projectDetailId && (
        <ProjectDetailModal
          state={state}
          projectId={projectDetailId}
          onClose={() => setProjectDetailId(null)}
          onOpenQuotaSchedule={setProjectQuotaModalId}
          onExportPackage={handleExportProjectPackage}
        />
      )}

      {/* Project Quota Schedule & Perspective Modal (额度规划与全景透视) */}
      {projectQuotaModalId && (
        <ProjectQuotaModal
          state={state}
          projectId={projectQuotaModalId}
          onClose={() => setProjectQuotaModalId(null)}
          onSaveQuotaSchedule={async (pId, schedule) => {
            if (await command('project.saveQuotaSchedule', { projectId: pId, quotaSchedule: schedule }, '项目周期额度规划已成功保存')) {
              setProjectQuotaModalId(null);
            }
          }}
        />
      )}

      {/* Plan Form Modal */}
      {planEdit && (
        <PlanFormModal
          state={state}
          value={planEdit}
          initialProjectId={planProjectId}
          projectGroups={projectGroups}
          onSaveGroups={saveProjectGroups}
          onOpenQuotaSchedule={setProjectQuotaModalId}
          onClose={() => { setPlanEdit(null); setPlanProjectId(''); }}
          onSave={async data => {
            if (await command('plan.save', data, '月度分配草稿已保存')) {
              setPlanEdit(null);
              setPlanProjectId('');
            }
          }}
        />
      )}

      {/* Auth & Admin Management Modal */}
      {authModalOpen && (
        <AuthModal
          state={state}
          currentActorId={currentActor.id}
          onClose={() => setAuthModalOpen(false)}
          onUpdateAdmin={handleUpdateAdmin}
          onSelectActor={id => {
            setActorId(id);
            const chosen = state.employees.find(e => e.id === id);
            setNotice(`已切换当前操作账号为【${chosen?.name || id}】`);
            setAuthModalOpen(false);
          }}
          onUpdateEmployeeRole={async (emp, newRole) => {
            await command('employee.save', { ...emp, role: newRole }, `已将【${emp.name}】权限调整为【${newRole === 'admin' ? '系统管理员' : newRole === 'auditor' ? '绩效核算员' : '普通员工'}】`);
          }}
        />
      )}

      {/* Onboarding Guide Modal */}
      {onboardingOpen && (
        <OnboardingGuideModal
          step={onboardingStep}
          onStepChange={setOnboardingStep}
          onClose={() => setOnboardingOpen(false)}
          onOpenManual={() => {
            setManualChapter(onboardingStep);
            setManualOpen(true);
          }}
          onNavigate={(targetTab) => {
            setTab(targetTab);
            setOnboardingOpen(false);
          }}
          isGate={false}
        />
      )}

      {/* Manual Modal */}
      {manualOpen && (
        <ManualModal
          initialChapter={manualChapter}
          onClose={() => setManualOpen(false)}
          onOpenGuide={() => {
            setOnboardingStep(manualChapter >= 1 && manualChapter <= 5 ? manualChapter : 1);
            setOnboardingOpen(true);
          }}
          onNavigate={(targetTab) => {
            setTab(targetTab);
            setManualOpen(false);
          }}
          isGate={false}
        />
      )}

      {/* About & Version History Modal */}
      {aboutModalOpen && (
        <AboutModal
          onClose={() => setAboutModalOpen(false)}
          onCheckUpdate={() => {
            setAboutModalOpen(false);
            setUpdateModalOpen(true);
          }}
          updateResult={updateResult}
        />
      )}

      {/* Online Version Update Modal */}
      {updateModalOpen && (
        <UpdateModal
          initialResult={updateResult}
          onClose={() => setUpdateModalOpen(false)}
        />
      )}

      {/* 热门的矩形框动态光圈检测更新提示卡片 */}
      {apertureNoticeOpen && updateResult?.hasUpdate && (
        <UpdateApertureNotice
          result={updateResult}
          onOpenUpdate={() => {
            setApertureNoticeOpen(false);
            setUpdateModalOpen(true);
          }}
          onClose={() => setApertureNoticeOpen(false)}
        />
      )}

    </div>
  );
}

// -------------------------------------------------------------
// 关于系统弹窗 (About & Update History Modal)
// -------------------------------------------------------------
function AboutModal({
  onClose,
  onCheckUpdate,
  updateResult,
}: {
  onClose(): void;
  onCheckUpdate?: () => void;
  updateResult?: UpdateCheckResult | null;
}) {
  const [activeTab, setActiveTab] = useState<'intro' | 'history'>('intro');
  const [localCheck, setLocalCheck] = useState<UpdateCheckResult | null>(updateResult || null);
  const [checkingNow, setCheckingNow] = useState(false);

  useEffect(() => {
    if (updateResult) {
      setLocalCheck(updateResult);
      return;
    }
    setCheckingNow(true);
    checkAppUpdate(APP_VERSION)
      .then((res) => setLocalCheck(res))
      .catch(() => {})
      .finally(() => setCheckingNow(false));
  }, [updateResult]);

  return (
    <Modal
      title="关于衡绩员工绩点考核系统"
      subtitle={`版本号: v${APP_VERSION} (Build ${APP_BUILD}) · 离线优先安全架构`}
      wide
      onClose={onClose}
    >
      <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
        {/* 顶部品牌与核心信息卡片 */}
        <div style={{
          background: 'linear-gradient(135deg, #142822 0%, #1c3b32 60%, #15803d 100%)',
          borderRadius: '12px',
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(20,40,34,0.18)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <DualBrandLogo size={38} />
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', letterSpacing: '0.5px' }}>衡绩 · 员工绩点考核系统</h2>
                <span style={{ fontSize: '12px', opacity: 0.85, letterSpacing: '1px' }}>MERIT PERFORMANCE EVALUATION SYSTEM</span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.9, maxWidth: '520px', lineHeight: 1.5 }}>
              面向多项目、长周期、跨专业组的工程与科研团队，构建“合同额度控制 — 全周期节奏规划 — 月度绩点分润 — 荣誉与报表透视”的端到端量化闭环。
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            borderRadius: '10px',
            padding: '12px 18px',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            fontSize: '12px'
          }}>
            <div><span style={{ opacity: 0.75 }}>软件版本：</span><b style={{ color: '#4ade80', fontSize: '14px' }}>v{APP_VERSION}</b></div>
            <div><span style={{ opacity: 0.75 }}>发布构建：</span><b>Build {APP_BUILD}</b></div>
            <div><span style={{ opacity: 0.75 }}>新版检测：</span><b style={{ color: localCheck?.hasUpdate ? '#fbbf24' : '#86efac' }}>{checkingNow ? '正在检测...' : localCheck?.hasUpdate ? `发现新版 v${localCheck.latestVersion}` : '已是最新版'}</b></div>
            <div><span style={{ opacity: 0.75 }}>系统授权：</span><b>企业本地私有版 (离线免联网)</b></div>
          </div>
        </div>

        {/* 标签栏：系统简介与理念 vs 版本演进更新历史 */}
        <div className="modal-nav-tabs" style={{ marginBottom: '18px', display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'intro' ? 'active' : ''}`}
            onClick={() => setActiveTab('intro')}
          >
            <ShieldCheck size={14} /> 架构设计与开发作者
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={14} /> 版本更新历史 ({UPDATE_HISTORY.length} 个版本)
          </button>
          {onCheckUpdate && (
            <button
              type="button"
              style={{
                marginLeft: 'auto',
                background: localCheck?.hasUpdate
                  ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                  : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 16px',
                fontWeight: 600,
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                boxShadow: localCheck?.hasUpdate
                  ? '0 2px 8px rgba(234,88,12,0.35)'
                  : '0 2px 8px rgba(2,132,199,0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onClick={onCheckUpdate}
            >
              <RefreshCw size={13.5} className={checkingNow ? 'spin-icon' : ''} />
              {localCheck?.hasUpdate ? `🚀 检测到新版 v${localCheck.latestVersion} (点击下载安装)` : '检测新版 / 在线升级...'}
            </button>
          )}
        </div>

        {activeTab === 'intro' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '18px' }}>
            {/* 左侧：系统理念与技术特色 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 18px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} color="#0284c7" />
                  核心设计理念
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#334155', lineHeight: 1.8 }}>
                  <li><strong>公平量化有据可循</strong>：严格遵循项目合同总额上限，杜绝超额超发，确保每一分绩点真实挂钩项目合同经费。</li>
                  <li><strong>全周期规划防透支</strong>：提供“稳健交付型”全生命周期排期模型，锁定关键发货交付阶段储备金，杜绝“前期分光、后期有货无钱”现象。</li>
                  <li><strong>柔性管理与专业组协同</strong>：支持总体组、产品组、研发组等多专业组团队架构，项目负责人绩点率实行参考区间引导。</li>
                  <li><strong>离线原生与数据自主</strong>：纯本地文件存储（.hengji 与全量加密灾备快照），无网络依赖、无需云端服务器，保障涉密安全。</li>
                </ul>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 18px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={16} color="#15803d" />
                  企业级安全防护体系
                </h4>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
                  系统工作区与全量系统灾备文件均采用国际高强度 <b>AES-256-GCM</b> 对称加密算法，结合 <b>PBKDF2-SHA256</b> 密钥派生（100,000 次哈希迭代），有效防范暴力破解与数据篡改。导入与恢复时必须输入正确的权限密钥方能解密。
                </div>
              </div>
            </div>

            {/* 右侧：开发作者卡片与系统环境信息 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px 18px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Crown size={16} color="#15803d" />
                  研发团队与作者信息
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#64748b', width: '70px' }}>开发作者：</span>
                    <strong style={{ color: '#0f172a' }}>{APP_AUTHOR}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#64748b', width: '70px' }}>联系邮箱：</span>
                    <a href={`mailto:${APP_CONTACT}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>{APP_CONTACT}</a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#64748b', width: '70px' }}>系统版本：</span>
                    <span style={{ color: '#15803d', fontWeight: 700 }}>v{APP_VERSION} (Major.Minor.Patch 规范)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#64748b', width: '70px' }}>更新准则：</span>
                    <span style={{ color: '#475569' }}>每次更新根据功能幅度同步调整大版本/小版本号</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px' }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '13px', color: '#334155' }}>💻 技术架构与栈</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ background: '#e2e8f0', borderRadius: '4px', padding: '2px 7px', fontSize: '11px', color: '#334155' }}>Electron 33</span>
                  <span style={{ background: '#e2e8f0', borderRadius: '4px', padding: '2px 7px', fontSize: '11px', color: '#334155' }}>React 19</span>
                  <span style={{ background: '#e2e8f0', borderRadius: '4px', padding: '2px 7px', fontSize: '11px', color: '#334155' }}>TypeScript</span>
                  <span style={{ background: '#e2e8f0', borderRadius: '4px', padding: '2px 7px', fontSize: '11px', color: '#334155' }}>Vite 8</span>
                  <span style={{ background: '#e2e8f0', borderRadius: '4px', padding: '2px 7px', fontSize: '11px', color: '#334155' }}>Recharts 3</span>
                  <span style={{ background: '#e2e8f0', borderRadius: '4px', padding: '2px 7px', fontSize: '11px', color: '#334155' }}>WebCrypto AES-256</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 版本更新历史时间轴 */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {UPDATE_HISTORY.map((ver, idx) => (
              <div
                key={ver.version}
                style={{
                  background: idx === 0 ? '#f0fdf4' : '#ffffff',
                  border: `1px solid ${idx === 0 ? '#86efac' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  padding: '16px 20px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <b style={{ fontSize: '16px', color: idx === 0 ? '#15803d' : '#0f172a' }}>{ver.version}</b>
                    <Badge tone={idx === 0 ? 'green' : 'neutral'}>{ver.tag}</Badge>
                    <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>{ver.title}</span>
                  </div>
                  <time style={{ fontSize: '12px', color: '#64748b' }}>📅 发布日期: {ver.date}</time>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#334155', lineHeight: 1.7 }}>
                  {ver.items.map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
        <div style={{ fontSize: '11.5px', color: '#64748b' }}>
          © 2026 TOPFIRE 衡绩 · 保留所有权利
        </div>
        <button type="button" className="primary" onClick={onClose}>
          我知道了
        </button>
      </div>
    </Modal>
  );
}

// -------------------------------------------------------------
// GitHub 图标与现代彩瓣标识 (CC Switch 灵感组件)
// -------------------------------------------------------------
function GithubIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

// -------------------------------------------------------------
// 矩形框动态光圈检测更新提示卡片 (Rotating Neon Border Beam Aperture)
// -------------------------------------------------------------
function UpdateApertureNotice({
  result,
  onOpenUpdate,
  onClose,
}: {
  result: UpdateCheckResult;
  onOpenUpdate(): void;
  onClose(): void;
}) {
  return (
    <div className="aperture-notification-wrapper">
      <div className="aperture-spinning-beam" />
      <div className="aperture-card-content">
        <DualBrandLogo size={28} />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
              发现新版本 v{result.latestVersion} 可用！
            </span>
            <span style={{ fontSize: '10px', background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>
              全新发布
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
            {result.releaseName || '官方新版已就绪，点击立即体验全新功能'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
          <button
            type="button"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '7px',
              padding: '6px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.35)',
              whiteSpace: 'nowrap',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            onClick={onOpenUpdate}
          >
            <CloudDownload size={14} />
            立即更新
          </button>

          <button
            type="button"
            style={{
              border: 'none',
              background: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px',
            }}
            onClick={onClose}
            title="稍后提醒"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 系统版本在线检测与更新弹窗 (Online Version Update Modal · CC Switch 风格)
// -------------------------------------------------------------
function UpdateModal({
  onClose,
  initialResult,
}: {
  onClose(): void;
  initialResult?: UpdateCheckResult | null;
}) {
  const [checking, setChecking] = useState(!initialResult);
  const [result, setResult] = useState<UpdateCheckResult | null>(initialResult || null);
  const [showRecent, setShowRecent] = useState(false);
  const [showStarBanner, setShowStarBanner] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [updateStepText, setUpdateStepText] = useState('正在处理中...');
  const [installStepText, setInstallStepText] = useState('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [downloadedPath, setDownloadedPath] = useState<string>('');
  const [downloadedFormat, setDownloadedFormat] = useState<'setup' | 'msi' | 'portable' | 'zip' | null>(null);
  const [downloadError, setDownloadError] = useState<string>('');
  const [installDir, setInstallDir] = useState<string>('D:\\衡绩员工绩点考核系统');
  const [showInstallChooser, setShowInstallChooser] = useState<boolean>(false);

  const isSystemDrive = /^[Cc]:/.test(installDir.trim());

  useEffect(() => {
    if (typeof window !== 'undefined' && window.meritDesktop?.getDefaultInstallDir) {
      window.meritDesktop.getDefaultInstallDir().then((dir) => {
        if (dir) setInstallDir(dir);
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.meritDesktop?.onUpdateProgress) {
      const unsubscribe = window.meritDesktop.onUpdateProgress((data) => {
        if (typeof data.percent === 'number') {
          setProgressPercent(data.percent);
        }
        if (data.message) {
          setUpdateStepText(data.message);
          setInstallStepText(data.message);
        }
      });
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, []);

  const handleChooseInstallDir = async () => {
    if (typeof window !== 'undefined' && window.meritDesktop?.chooseInstallDir) {
      try {
        const chosen = await window.meritDesktop.chooseInstallDir(installDir);
        if (chosen) {
          setInstallDir(chosen);
        }
      } catch {}
    }
  };

  const handleAutoInstall = async (format: 'setup' | 'msi' | 'portable' | 'zip' = 'setup') => {
    if (updating || installing) return;
    setInstalling(true);
    setDownloadError('');
    setProgressPercent(5);
    const targetVer = result?.latestVersion || APP_VERSION;
    const formatLabel = format === 'msi'
      ? 'MSI 安装包'
      : format === 'zip'
      ? 'ZIP 绿色解压版'
      : format === 'setup'
      ? 'EXE 安装向导版'
      : '便携单文件版';
    setInstallStepText(`正在准备 ${formatLabel} (v${targetVer})...`);

    try {
      if (typeof window !== 'undefined' && window.meritDesktop?.installUpdate) {
        const res = await window.meritDesktop.installUpdate({
          version: targetVer,
          format,
          installDir: installDir.trim() || 'D:\\衡绩员工绩点考核系统',
          filePath: downloadedFormat === format && downloadedPath ? downloadedPath : undefined,
        });
        if (res && res.success) {
          setProgressPercent(100);
          setInstallStepText('安装程序已启动，正在无缝切换至新版本...');
        } else {
          throw new Error(res?.message || '自动安装失败');
        }
      } else {
        await handleDownloadOrInstall(format, false);
      }
    } catch (err: any) {
      setDownloadError(err?.message || '自动安装更新失败');
      setInstalling(false);
    }
  };

  const handleDownloadOrInstall = async (format: 'setup' | 'msi' | 'portable' | 'zip', openChooserAfter = true) => {
    if (updating || installing) return;
    setUpdating(true);
    setDownloadError('');
    setProgressPercent(5);
    const targetVer = result?.latestVersion || APP_VERSION;
    const formatLabel = format === 'msi'
      ? 'MSI 安装包'
      : format === 'zip'
      ? 'ZIP 绿色压缩版'
      : format === 'setup'
      ? 'EXE 安装向导版'
      : '便携单文件版';
    setUpdateStepText(`正在高速下载 ${formatLabel} (v${targetVer})...`);

    try {
      if (typeof window !== 'undefined' && window.meritDesktop?.downloadUpdate) {
        const res = await window.meritDesktop.downloadUpdate({
          version: targetVer,
          format,
        });
        if (res && res.success) {
          setDownloadedPath(res.filePath);
          setDownloadedFormat(format);
          setUpdateSuccess(true);
          setProgressPercent(100);
          setUpdateStepText(`已成功保存至 ${res.filePath}`);
          if (openChooserAfter) {
            setShowInstallChooser(true);
          }
        } else {
          throw new Error('未能保存更新包到本地');
        }
      } else {
        // 浏览器环境网页模式下载
        setUpdateStepText(`正在发起浏览器下载 ${formatLabel}...`);
        const filename = format === 'msi'
          ? `hengji-${targetVer}.msi`
          : format === 'zip'
          ? `hengji-${targetVer}.zip`
          : format === 'setup'
          ? `hengji-${targetVer}.exe`
          : `hengji-portable-${targetVer}.exe`;
        const downloadUrl = `https://ghfast.top/https://github.com/zoufudun/hengji/releases/download/v${targetVer}/${encodeURIComponent(filename)}`;
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setDownloadedPath(`浏览器默认下载目录 / ${filename}`);
        setDownloadedFormat(format);
        setUpdateSuccess(true);
        setProgressPercent(100);
      }
    } catch (err: any) {
      setDownloadError(err?.message || '下载更新包失败');
    } finally {
      setUpdating(false);
    }
  };

  const doCheck = async () => {
    setChecking(true);
    setDownloadError('');
    try {
      const res = await checkAppUpdate(APP_VERSION);
      setResult(res);
    } catch (e: any) {
      setResult({
        hasUpdate: false,
        currentVersion: APP_VERSION,
        latestVersion: APP_VERSION,
        releaseName: '',
        releaseNotes: '',
        publishedAt: '',
        downloadUrl: GITHUB_RELEASES_URL,
        htmlUrl: GITHUB_RELEASES_URL,
        checkedAt: new Date().toLocaleString(),
        error: e.message || '网络连接超时，未能连通 GitHub 服务器',
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (!initialResult) {
      doCheck();
    }
  }, []);

  const openUrl = (url: string) => {
    if (typeof window !== 'undefined' && window.meritDesktop?.openUrl) {
      window.meritDesktop.openUrl(url);
    } else if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 1050,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '760px',
          maxWidth: '95%',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 24px 48px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部信息行：Logo + 软件名称与版本 + 右侧醒目操作按钮与关闭 */}
        <div
          style={{
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <FlowerBrandLogo size={42} />
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#0f172a',
                  letterSpacing: '0.2px',
                }}
              >
                衡绩考核 (HengJi)
              </h3>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                当前运行版本: v{APP_VERSION}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {checking ? (
              <button
                type="button"
                disabled
                style={{
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'not-allowed',
                }}
              >
                <RefreshCw size={15} className="spin-icon" />
                检测中...
              </button>
            ) : installing || updating ? (
              <button
                type="button"
                disabled
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.45)',
                  cursor: 'wait',
                }}
              >
                <Loader2 size={16} className="spin-icon" />
                {installing ? `${installStepText} (${progressPercent}%)` : `${updateStepText} (${progressPercent}%)`}
              </button>
            ) : result?.hasUpdate ? (
              <button
                type="button"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onClick={() => setShowInstallChooser(true)}
                title={`检测到新版本 v${result.latestVersion}，点击弹出选择安装方式进行更新`}
              >
                <Download size={16} />
                更新到 v{result.latestVersion}
              </button>
            ) : null}

            <button
              type="button"
              style={{
                border: 'none',
                background: 'transparent',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              onClick={onClose}
              title="关闭"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* 分割线与新版本提示状态栏 + 实时下载进度条 */}
        <div
          style={{
            borderTop: '1px solid #f1f5f9',
            borderBottom: '1px solid #f1f5f9',
            padding: '14px 28px',
            fontSize: '13.5px',
            fontWeight: 600,
            color: '#1e293b',
            background: '#fafafa',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              {checking
                ? '正在连接官方仓库检测最新版本...'
                : installing
                ? (installStepText || '正在启动无终端安装程序，请稍候...')
                : updating
                ? (updateStepText || '正在高速下载更新包至本地，请稍候...')
                : updateSuccess
                ? `🎉 更新包已成功下载就绪！(v${result?.latestVersion || APP_VERSION}) 请选择安装方式完成部署`
                : result?.hasUpdate
                ? `🚀 检测到新版本: v${result.latestVersion} — 请点击右上角“更新到 v${result.latestVersion}”或下方选择安装方式`
                : result?.error
                ? `检测提示: ${result.error}`
                : `检测到新版本: 无 (当前已是官方最新版本 v${APP_VERSION})`}
            </div>
            {!checking && (
              <button
                type="button"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#0284c7',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 500,
                  padding: 0,
                  flexShrink: 0,
                }}
                onClick={doCheck}
              >
                <RefreshCw size={12} />
                重新检查
              </button>
            )}
          </div>

          {(installing || updating) && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ height: '7px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.max(5, Math.min(100, progressPercent))}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)',
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 安装版本发布格式矩阵卡片：EXE安装版、MSI安装包、便携单文件版、ZIP绿色版（有新版本时才显示） */}
        {result?.hasUpdate && (
          <div
            style={{
              margin: '16px 28px 0',
              padding: '16px 20px',
              background: '#f0f7ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
            }}
          >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📦 安装版本发布与分发矩阵（四种方式）</span>
                <span style={{ fontSize: '11.5px', background: result?.hasUpdate ? '#dbeafe' : '#e2e8f0', color: result?.hasUpdate ? '#1d4ed8' : '#475569', padding: '1px 7px', borderRadius: '4px', fontWeight: 600 }}>
                  目标版本: v{result?.latestVersion || APP_VERSION}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                全程采用原生无终端静默调度（不弹出黑框/蓝框命令行），默认安装到非系统盘。
              </div>
            </div>

            <button
              type="button"
              disabled={installing || updating}
              onClick={() => setShowInstallChooser(true)}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 15px',
                fontSize: '12.5px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                cursor: (installing || updating) ? 'wait' : 'pointer',
              }}
            >
              <Sparkles size={14} />
              弹出选择安装方式 (四种方式)
            </button>
          </div>

          {/* 安装目标地址设置栏（MSI安装 / EXE安装 / ZIP解压通用，默认非系统盘） */}
          <div
            style={{
              background: '#ffffff',
              border: `1px solid ${isSystemDrive ? '#fcd34d' : '#bae6fd'}`,
              borderRadius: '9px',
              padding: '10px 12px',
              marginBottom: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FolderOpen size={14} color="#0284c7" />
                <span>MSI / EXE / ZIP 安装目标地址（默认非系统盘）：</span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  padding: '1px 7px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  background: isSystemDrive ? '#fef3c7' : '#dcfce7',
                  color: isSystemDrive ? '#b45309' : '#15803d',
                }}
              >
                {isSystemDrive ? '⚠️ 当前为 C 盘系统盘，建议改为 D 盘等非系统盘' : '✅ 已设为非系统盘目录'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={installDir}
                onChange={(e) => setInstallDir(e.target.value)}
                placeholder="例如：D:\衡绩员工绩点考核系统"
                style={{
                  flex: 1,
                  fontSize: '12px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  background: '#f8fafc',
                }}
              />
              {typeof window !== 'undefined' && window.meritDesktop?.chooseInstallDir && (
                <button
                  type="button"
                  onClick={handleChooseInstallDir}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <FolderOpen size={13} />
                  浏览选择地址...
                </button>
              )}
              {isSystemDrive && (
                <button
                  type="button"
                  onClick={() => setInstallDir('D:\\衡绩员工绩点考核系统')}
                  style={{
                    background: '#f0fdf4',
                    color: '#15803d',
                    border: '1px solid #86efac',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  设为 D:\ 盘
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
            {/* EXE 安装向导版 */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} color="#2563eb" />
                    <span>EXE 安装版</span>
                  </div>
                  <span style={{ fontSize: '10.5px', background: '#dbeafe', color: '#1e40af', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                    Setup.exe
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.5 }}>
                  NSIS 标准向导，直接调起图形安装向导（不弹终端），预填上方非系统盘路径。
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                <button
                  type="button"
                  disabled={installing || updating}
                  onClick={() => handleAutoInstall('setup')}
                  style={{
                    flex: 1,
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: (installing || updating) ? 'wait' : 'pointer',
                  }}
                  title={`安装至：${installDir}`}
                >
                  ⚡ 覆盖安装
                </button>
                <button
                  type="button"
                  disabled={installing || updating}
                  onClick={() => handleDownloadOrInstall('setup')}
                  style={{
                    background: '#f8fafc',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '11.5px',
                    cursor: (installing || updating) ? 'wait' : 'pointer',
                  }}
                  title="下载 Setup.exe 安装包并选择安装方式"
                >
                  <CloudDownload size={13} />
                </button>
              </div>
            </div>

            {/* MSI 安装包 */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #67e8f9',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Package size={14} color="#0891b2" />
                    <span>MSI 安装包</span>
                  </div>
                  <span style={{ fontSize: '10.5px', background: '#cffafe', color: '#155e75', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                    .msi 格式
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.45 }}>
                  Windows Installer 标准包，支持自定义非系统盘安装地址，无终端弹窗。
                </div>
                <div
                  style={{
                    marginTop: '6px',
                    padding: '4px 6px',
                    background: '#ecfeff',
                    border: '1px solid #a5f3fc',
                    borderRadius: '4px',
                    fontSize: '10.5px',
                    color: '#0e7490',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '4px',
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={installDir}>
                    📂 {installDir}
                  </span>
                  {typeof window !== 'undefined' && window.meritDesktop?.chooseInstallDir && (
                    <button
                      type="button"
                      onClick={handleChooseInstallDir}
                      style={{
                        border: 'none',
                        background: '#0891b2',
                        color: '#ffffff',
                        borderRadius: '3px',
                        padding: '1px 5px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      改地址
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                <button
                  type="button"
                  disabled={installing || updating}
                  onClick={() => handleAutoInstall('msi')}
                  style={{
                    flex: 1,
                    background: '#0891b2',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: (installing || updating) ? 'wait' : 'pointer',
                  }}
                  title={`安装 MSI 至指定目录：${installDir}`}
                >
                  ⚡ MSI 安装
                </button>
                <button
                  type="button"
                  disabled={installing || updating}
                  onClick={() => handleDownloadOrInstall('msi')}
                  style={{
                    background: '#f8fafc',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '11.5px',
                    cursor: (installing || updating) ? 'wait' : 'pointer',
                  }}
                  title="下载 MSI 安装包并选择安装方式"
                >
                  <CloudDownload size={13} />
                </button>
              </div>
            </div>

            {/* 便携单文件版 */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FolderKanban size={14} color="#16a34a" />
                    <span>便携单文件</span>
                  </div>
                  <span style={{ fontSize: '10.5px', background: '#dcfce7', color: '#166534', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                    免安装
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.5 }}>
                  绿色便携单可执行文件，后台无窗口静默替换并自动启动新版。
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                <button
                  type="button"
                  disabled={installing || updating}
                  onClick={() => handleAutoInstall('portable')}
                  style={{
                    flex: 1,
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: (installing || updating) ? 'wait' : 'pointer',
                  }}
                  title="后台静默单文件覆盖并重启（不弹出终端）"
                >
                  ⚡ 单文件覆盖
                </button>
                <button
                  type="button"
                  disabled={installing || updating}
                  onClick={() => handleDownloadOrInstall('portable')}
                  style={{
                    background: '#f8fafc',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '11.5px',
                    cursor: (installing || updating) ? 'wait' : 'pointer',
                  }}
                  title="下载便携单文件并选择安装方式"
                >
                  <CloudDownload size={13} />
                </button>
              </div>
            </div>

            {/* ZIP 绿色解压版 */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FolderArchive size={14} color="#ea580c" />
                    <span>ZIP 绿色版</span>
                  </div>
                  <span style={{ fontSize: '10.5px', background: '#ffedd5', color: '#9a3412', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                    解压即用
                  </span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.5 }}>
                  绿色压缩文件包，后台无窗口静默解压至目标地址并自动重启。
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                <button
                  type="button"
                  disabled={installing || updating}
                  onClick={() => handleAutoInstall('zip')}
                  style={{
                    flex: 1,
                    background: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: (installing || updating) ? 'wait' : 'pointer',
                  }}
                  title={`静默解压覆盖至：${installDir}（不弹出终端）`}
                >
                  ⚡ 解压覆盖
                </button>
                <button
                  type="button"
                  disabled={installing || updating}
                  onClick={() => handleDownloadOrInstall('zip')}
                  style={{
                    background: '#f8fafc',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '11.5px',
                    cursor: (installing || updating) ? 'wait' : 'pointer',
                  }}
                  title="下载 ZIP 绿色压缩包并选择安装方式"
                >
                  <CloudDownload size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* 点击下载后弹出的“选择哪种方式安装（四种方式）”弹窗 */}
        {showInstallChooser && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.72)',
              backdropFilter: 'blur(4px)',
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => !installing && !updating && setShowInstallChooser(false)}
          >
            <div
              style={{
                width: '680px',
                maxWidth: '100%',
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                padding: '22px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="#2563eb" />
                    <span>请选择安装方式（四种安装与部署方式 · v{result?.latestVersion || APP_VERSION}）</span>
                  </h4>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                    所有安装方式均已优化为原生无终端模式（不弹出黑框终端），MSI 与向导默认安装到非系统盘。
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInstallChooser(false)}
                  style={{ border: 'none', background: '#f1f5f9', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#475569' }}
                >
                  <X size={17} />
                </button>
              </div>

              {/* 弹窗内的安装地址选项（特别针对 MSI 安装与 EXE/ZIP 部署，默认非系统盘） */}
              <div
                style={{
                  background: '#f0f9ff',
                  border: `1px solid ${isSystemDrive ? '#f59e0b' : '#7dd3fc'}`,
                  borderRadius: '10px',
                  padding: '12px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0369a1' }}>
                    📍 安装目标地址选项（MSI 安装 / EXE 安装 / ZIP 解压均默认非系统盘）：
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: isSystemDrive ? '#b45309' : '#15803d' }}>
                    {isSystemDrive ? '⚠️ 请勿默认装入系统盘，建议选择 D 盘' : '✅ 默认非系统盘安全路径'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={installDir}
                    onChange={(e) => setInstallDir(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      fontSize: '12.5px',
                      borderRadius: '6px',
                      border: '1px solid #93c5fd',
                      background: '#ffffff',
                      color: '#0f172a',
                    }}
                  />
                  {typeof window !== 'undefined' && window.meritDesktop?.chooseInstallDir && (
                    <button
                      type="button"
                      onClick={handleChooseInstallDir}
                      style={{
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '7px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <FolderOpen size={14} />
                      选择安装目录...
                    </button>
                  )}
                </div>
              </div>

              {/* 四种安装方式大卡片列表 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ border: '1.5px solid #bfdbfe', background: '#f8fafc', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>方式一：EXE 安装版 (Setup.exe)</span>
                      <span style={{ fontSize: '10.5px', background: '#dbeafe', padding: '1px 6px', borderRadius: '4px' }}>推荐向导</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '4px', lineHeight: 1.45 }}>
                      启动 NSIS 图形安装向导（无终端弹窗），自动预填上方所选非系统盘目录完成覆盖升级。
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      disabled={installing || updating}
                      onClick={() => handleAutoInstall('setup')}
                      style={{ flex: 1, background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ⚡ 立即 EXE 覆盖安装
                    </button>
                    <button
                      type="button"
                      disabled={installing || updating}
                      onClick={() => handleDownloadOrInstall('setup', false)}
                      style={{ background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      仅下载
                    </button>
                  </div>
                </div>

                <div style={{ border: '1.5px solid #67e8f9', background: '#ecfeff', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0e7490', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>方式二：MSI 安装包 (.msi)</span>
                      <span style={{ fontSize: '10.5px', background: '#cffafe', padding: '1px 6px', borderRadius: '4px' }}>可选安装地址</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#155e75', marginTop: '4px', lineHeight: 1.45 }}>
                      Windows Installer 标准包，直接安装至上方选定的非系统盘地址（<b>{installDir}</b>），不弹终端。
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      disabled={installing || updating}
                      onClick={() => handleAutoInstall('msi')}
                      style={{ flex: 1, background: '#0891b2', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ⚡ 立即 MSI 安装 (至所选地址)
                    </button>
                    <button
                      type="button"
                      disabled={installing || updating}
                      onClick={() => handleDownloadOrInstall('msi', false)}
                      style={{ background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      仅下载
                    </button>
                  </div>
                </div>

                <div style={{ border: '1.5px solid #bbf7d0', background: '#f0fdf4', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>方式三：便携单文件 (Portable.exe)</span>
                      <span style={{ fontSize: '10.5px', background: '#dcfce7', padding: '1px 6px', borderRadius: '4px' }}>免安装</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#166534', marginTop: '4px', lineHeight: 1.45 }}>
                      绿色便携单文件，后台静默覆盖当前程序并自动重启（不写注册表、不弹终端窗口）。
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      disabled={installing || updating}
                      onClick={() => handleAutoInstall('portable')}
                      style={{ flex: 1, background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ⚡ 立即单文件覆盖重启
                    </button>
                    <button
                      type="button"
                      disabled={installing || updating}
                      onClick={() => handleDownloadOrInstall('portable', false)}
                      style={{ background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      仅下载
                    </button>
                  </div>
                </div>

                <div style={{ border: '1.5px solid #fed7aa', background: '#fff7ed', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#9a3412', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>方式四：ZIP 绿色解压版 (.zip)</span>
                      <span style={{ fontSize: '10.5px', background: '#ffedd5', padding: '1px 6px', borderRadius: '4px' }}>解压即用</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#9a3412', marginTop: '4px', lineHeight: 1.45 }}>
                      绿色免安装压缩包，后台静默解压覆盖至上方所选目录并自动启动新版（不弹终端）。
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      disabled={installing || updating}
                      onClick={() => handleAutoInstall('zip')}
                      style={{ flex: 1, background: '#ea580c', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ⚡ 立即 ZIP 解压覆盖
                    </button>
                    <button
                      type="button"
                      disabled={installing || updating}
                      onClick={() => handleDownloadOrInstall('zip', false)}
                      style={{ background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '7px 10px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      仅下载
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 下载结果与文件路径展示卡片 */}
        {downloadedPath && (
          <div
            style={{
              margin: '16px 28px 0',
              padding: '14px 18px',
              background: '#f0fdf4',
              border: '1px solid #86efac',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={22} color="#16a34a" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, color: '#15803d', fontSize: '13.5px' }}>
                  更新安装包已就绪并成功下载至本地！
                </div>
                <div style={{ fontSize: '12px', color: '#166534', marginTop: '2px', wordBreak: 'break-all' }}>
                  文件路径：<b>{downloadedPath}</b>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              {typeof window !== 'undefined' && window.meritDesktop?.showItemInFolder && (
                <button
                  type="button"
                  style={{
                    background: '#ffffff',
                    border: '1px solid #86efac',
                    color: '#15803d',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                  onClick={() => window.meritDesktop?.showItemInFolder?.(downloadedPath)}
                >
                  <FolderOpen size={13} />
                  打开所在文件夹
                </button>
              )}
              {typeof window !== 'undefined' && window.meritDesktop?.openPath && (
                <button
                  type="button"
                  style={{
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
                  }}
                  onClick={() => window.meritDesktop?.openPath?.(downloadedPath)}
                >
                  <Sparkles size={13} />
                  立即运行更新包
                </button>
              )}
            </div>
          </div>
        )}

        {downloadError && (
          <div
            style={{
              margin: '16px 28px 0',
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#b91c1c',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertTriangle size={16} />
            <span>{downloadError}</span>
          </div>
        )}

        {/* 快捷操作标签栏：官方网站、更新日志、近期更新 */}
        <div
          style={{
            padding: '16px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '7px 16px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
            onClick={() => openUrl(GITHUB_PAGES_URL)}
          >
            <Globe size={15} color="#0284c7" />
            官方网站
          </button>

          <button
            type="button"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '7px 16px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
            onClick={() => openUrl(GITHUB_RELEASES_URL)}
          >
            <ExternalLink size={15} color="#475569" />
            更新日志
          </button>

          <button
            type="button"
            style={{
              background: showRecent ? '#f0fdf4' : '#ffffff',
              border: `1px solid ${showRecent ? '#86efac' : '#e2e8f0'}`,
              borderRadius: '8px',
              padding: '7px 16px',
              fontSize: '13px',
              fontWeight: 500,
              color: showRecent ? '#15803d' : '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onClick={() => setShowRecent(!showRecent)}
          >
            <Sparkles size={15} color="#f59e0b" />
            近期更新
          </button>
        </div>

        {/* 展开的近期更新日志内容抽屉 */}
        {showRecent && (
          <div
            style={{
              margin: '0 28px 18px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '16px 20px',
              maxHeight: '220px',
              overflowY: 'auto',
              fontSize: '12.5px',
              color: '#334155',
              lineHeight: 1.7,
            }}
          >
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '8px', fontSize: '13px' }}>
              📌 {result?.hasUpdate ? `v${result.latestVersion} 发行说明` : `v${APP_VERSION} 近期重点更新亮点`}
            </div>
            {result?.hasUpdate && result.releaseNotes ? (
              <div style={{ whiteSpace: 'pre-wrap', marginBottom: '10px' }}>{result.releaseNotes}</div>
            ) : null}
            <ul style={{ margin: 0, paddingLeft: '18px' }}>
              {UPDATE_HISTORY[0].items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 底部暖调 Star 号召横幅 */}
        {showStarBanner && (
          <div
            style={{
              background: '#fff7ed',
              borderTop: '1px solid #fed7aa',
              padding: '13px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '13px', color: '#9a3412', fontWeight: 500 }}>
              <Star size={17} fill="#f59e0b" color="#f59e0b" style={{ flexShrink: 0 }} />
              <span>如果 衡绩 帮到了你，请在 GitHub 点个 Star，这对我们意义重大</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                style={{
                  background: '#ffffff',
                  border: '1px solid #fed7aa',
                  borderRadius: '7px',
                  padding: '5px 13px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fffbeb')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                onClick={() => openUrl(GITHUB_REPO_URL)}
              >
                <GithubIcon size={14} />
                去点 Star
              </button>

              <button
                type="button"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#c2410c',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: 0.8,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
                onClick={() => setShowStarBanner(false)}
                title="关闭提示"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 新手 5 步快速上手操作向导弹窗 (Onboarding Guide Modal)
// -------------------------------------------------------------
function OnboardingGuideModal({
  step,
  onStepChange,
  onClose,
  onOpenManual,
  onNavigate,
  isGate = false,
}: {
  step: number;
  onStepChange(step: number): void;
  onClose(): void;
  onOpenManual?(): void;
  onNavigate(tab: Tab): void;
  isGate?: boolean;
}) {
  const [dontShowAgain, setDontShowAgain] = useState(true);

  const handleFinish = () => {
    if (dontShowAgain && typeof window !== 'undefined') {
      try {
        localStorage.setItem('hengji_onboarding_viewed_v062', 'true');
      } catch {}
    }
    onClose();
  };

  const steps = [
    {
      num: 1,
      title: '第一步：新建安全工作区',
      shortTitle: '1. 新建工作区',
      stage: '数据安全与存储底座',
      icon: Database,
      targetTab: 'dashboard' as Tab,
    },
    {
      num: 2,
      title: '第二步：导入项目与员工',
      shortTitle: '2. 导入项目/员工',
      stage: '初始化业务主体',
      icon: Users,
      targetTab: 'employees' as Tab,
    },
    {
      num: 3,
      title: '第三步：额度规划与项目组',
      shortTitle: '3. 规划与项目组',
      stage: '顶层策略与防透支',
      icon: Sliders,
      targetTab: 'projects' as Tab,
    },
    {
      num: 4,
      title: '第四步：月度分配与发布',
      shortTitle: '4. 月度分配发布',
      stage: '月度考评与分润',
      icon: CalendarRange,
      targetTab: 'plans' as Tab,
    },
    {
      num: 5,
      title: '第五步：周期报表与荣誉',
      shortTitle: '5. 周期报表透视',
      stage: '实时报表与荣誉榜',
      icon: BarChart3,
      targetTab: 'reports' as Tab,
    },
  ];

  const current = steps[step - 1] || steps[0];

  return (
    <Modal
      title="衡绩考核系统 · 新手 5 步快速上手向导"
      subtitle="端到端业务闭环：从新建安全工作区到月度分配与周期报表透视"
      wide
      onClose={handleFinish}
    >
      <div className="modal-body" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
        {/* Stepper 步骤导航栏 */}
        <div className="onboarding-stepper">
          {steps.map(s => {
            const isCompleted = s.num < step;
            const isActive = s.num === step;
            return (
              <button
                key={s.num}
                type="button"
                className={`onboarding-step-btn ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => onStepChange(s.num)}
                title={`切换到第 ${s.num} 步：${s.title}`}
              >
                <div className="step-index-circle">
                  {isCompleted ? <Check size={14} /> : s.num}
                </div>
                <div className="step-text-wrap">
                  <span className="step-num-text">STEP 0{s.num}</span>
                  <span className="step-label-text">{s.shortTitle}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 步骤标题与阶段徽章 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '4px', padding: '2px 8px', fontWeight: 700 }}>
                第 {current.num} 步 / 共 5 步 · {current.stage}
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              {current.title}
            </h3>
          </div>
          {onOpenManual && (
            <button
              type="button"
              className="secondary"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: '#f0f9ff',
                color: '#0369a1',
                borderColor: '#bae6fd',
                fontWeight: 600,
              }}
              onClick={() => {
                onClose();
                onOpenManual();
              }}
              title="切换至完整图文操作手册"
            >
              <BookOpen size={13} /> 切换为完整操作手册
            </button>
          )}
        </div>

        {/* Step 1 内容 */}
        {step === 1 && (
          <div>
            <div className="onboarding-flow-card">
              <div className="flow-card-title">
                <Sparkles size={14} /> 第 1 步业务流程与安全机制示意
              </div>
              <div className="flow-steps-track">
                <div className="flow-node highlight">
                  <Database size={15} /> 1. 启动衡绩系统
                </div>
                <span className="flow-arrow">➔</span>
                <div className="flow-node">
                  📁 选取非系统盘 (D/E盘)
                </div>
                <span className="flow-arrow">➔</span>
                <div className="flow-node">
                  🔒 设置管理员口令 (AES-256)
                </div>
                <span className="flow-arrow">➔</span>
                <div className="flow-node highlight">
                  ✨ 生成 .hengji 加密工作区
                </div>
                <span className="flow-arrow">➔</span>
                <div className="flow-node">
                  🛡️ 自动生成 .backup 灾备
                </div>
              </div>
            </div>

            <div className="onboarding-checklist">
              <div className="checklist-item">
                <div className="checklist-item-num">1</div>
                <div>
                  <div className="checklist-item-title">在启动页点击【新建工作区】</div>
                  <div className="checklist-item-desc">
                    首次打开软件，点击【+ 新建工作区】（亦支持点击【从共享基础库新建】快速继承已有部门员工与常用项目组配置）。
                  </div>
                </div>
              </div>
              <div className="checklist-item">
                <div className="checklist-item-num">2</div>
                <div>
                  <div className="checklist-item-title">选择工作区应用场景</div>
                  <div className="checklist-item-desc">
                    系统提供两种工作区模式：首选推荐<b>【🏢 综合管理工作区】</b>，适合超级管理员或部门负责人统揽项目配置、额度规划、月度分配与花名册维护；专职核算员可选择<b>【📊 绩效核算工作区】</b>。
                  </div>
                </div>
              </div>
              <div className="checklist-item">
                <div className="checklist-item-num">3</div>
                <div>
                  <div className="checklist-item-title">指定非系统盘安全存储目录（后缀为 .hengji）</div>
                  <div className="checklist-item-desc">
                    系统彻底摒弃数据默认写入 C 盘隐蔽目录的缺陷。弹出系统保存对话框时，<b>强烈建议保存在非系统盘（如 D 盘、E 盘、单位专用保密盘或受控网盘目录）</b>。
                  </div>
                </div>
              </div>
              <div className="checklist-item">
                <div className="checklist-item-num">4</div>
                <div>
                  <div className="checklist-item-title">设置管理员口令或免密快速进入</div>
                  <div className="checklist-item-desc">
                    可输入口令通过行业高标准 PBKDF2-SHA256 与 AES-256-GCM 认证加密保护；在个人专用电脑上，口令亦可<b>留空</b>创建免密工作区，日常双击或一键直接秒进，便捷高效。
                  </div>
                </div>
              </div>
              <div className="checklist-item">
                <div className="checklist-item-num">5</div>
                <div>
                  <div className="checklist-item-title">每次保存自动生成同名镜像双重灾备</div>
                  <div className="checklist-item-desc">
                    每次保存时，系统自动在工作区同目录生成 <code>.hengji.backup</code> 上一版历史备份，随时双重兜底。纯本地离线运行，零网络依赖。
                  </div>
                </div>
              </div>
            </div>

            <div className="onboarding-tip-box">
              <div className="tip-icon">💡</div>
              <div>
                <div className="tip-title">新手提示：工作区随时可另存与备份</div>
                <div className="tip-content">
                  进入系统后，随时可使用顶部栏【工作区另存为】制作加密副本，或点击【导出共享基础库】导出不含项目和绩效的基础架构分发给其他组员。
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 内容 */}
        {step === 2 && (
          <div>
            <div className="onboarding-flow-card">
              <div className="flow-card-title">
                <Sparkles size={14} /> 第 2 步业务主体初始化示意
              </div>
              <div className="flow-steps-track">
                <div className="flow-node highlight">
                  <Users size={15} /> 1. 部门员工花名册
                </div>
                <span className="flow-arrow">+</span>
                <div className="flow-node highlight">
                  <BriefcaseBusiness size={15} /> 2. 工程合同项目清单
                </div>
                <span className="flow-arrow">➔</span>
                <div className="flow-node">
                  ⚡ 智能剥离千分位/超长小数
                </div>
                <span className="flow-arrow">➔</span>
                <div className="flow-node highlight">
                  🎯 考核业务底座就绪
                </div>
              </div>
            </div>

            <div className="onboarding-checklist">
              <div className="checklist-item">
                <div className="checklist-item-num">1</div>
                <div>
                  <div className="checklist-item-title">导入或添加部门员工（支持总体组、产品组、研发组）</div>
                  <div className="checklist-item-desc">
                    点击左侧【员工与专业组】：① 可点击【📥 批量导入员工 CSV】直接拖拽单位现有花名册，智能识别姓名、工号、部门、专业组、职务及邮箱；② 空白工作区可点击【⚡ 一键初始化内置成员】一秒载入标杆架构；③ 亦支持点击【+ 新建员工】手工录入。
                  </div>
                </div>
              </div>
              <div className="checklist-item">
                <div className="checklist-item-num">2</div>
                <div>
                  <div className="checklist-item-title">导入或新建工程合同项目</div>
                  <div className="checklist-item-desc">
                    点击左侧【项目库与额度】或【数据导入导出与灾备】：① 点击【📥 批量导入项目 CSV】拖拽现有项目台账表格；② 亦可点击【+ 新建项目】录入工程工作令号、项目名称、客户单位、含税合同总额（万元）及计划起止周期。
                  </div>
                </div>
              </div>
              <div className="checklist-item">
                <div className="checklist-item-num">3</div>
                <div>
                  <div className="checklist-item-title">财务多位小数、千分位逗号全自动容错解析</div>
                  <div className="checklist-item-desc">
                    系统全面适配财务与 OA 导出数据，自动剥离千分位逗号（如 <code>1,309,000.00</code>）、货币符号（¥、￥、$）及超长浮点小数（如 <code>33.33333333</code> 自动四舍五入到分），绝不弹窗报错导致表格报废。
                  </div>
                </div>
              </div>
              <div className="checklist-item">
                <div className="checklist-item-num">4</div>
                <div>
                  <div className="checklist-item-title">同令号多子合同独立核算</div>
                  <div className="checklist-item-desc">
                    同一工作令号下支持存在多个子项目或不同执行合同，每个合同项目独立归集与分配，彻底杜绝数据串联或克隆。
                  </div>
                </div>
              </div>
            </div>

            <div className="onboarding-tip-box blue">
              <div className="tip-icon">ℹ️</div>
              <div>
                <div className="tip-title">专业组体系贯穿全系统</div>
                <div className="tip-content">
                  设置好员工的“总体组”、“产品组”、“研发组”后，在项目团队挑选、专业组月度额度配比柱状图、月度之星评选及报表透视中都会自动分组联动。
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 内容 */}
        {step === 3 && (
          <div>
            <div className="onboarding-flow-card">
              <div className="flow-card-title">
                <Sparkles size={14} /> 第 3 步项目额度规划与稳健交付策略示意
              </div>
              <div className="flow-steps-track">
                <div className="flow-node">
                  🌱 前期争取阶段 (0~10%可调, 推荐5%)
                </div>
                <span className="flow-arrow">➔</span>
                <div className="flow-node highlight">
                  📦 成品研制与发货交付 (大头45%+锁定)
                </div>
                <span className="flow-arrow">➔</span>
                <div className="flow-node">
                  🛡️ 维保支持阶段 (牢固锁定5%)
                </div>
                <span className="flow-arrow">➔</span>
                <div className="flow-node highlight">
                  👥 绑定常用项目组模版
                </div>
              </div>
            </div>

            <div className="onboarding-checklist">
              <div className="checklist-item">
                <div className="checklist-item-num">1</div>
                <div>
                  <div className="checklist-item-title">指派项目负责人与配置团队成员</div>
                  <div className="checklist-item-desc">
                    在【项目库与额度】中找到对应项目，点击【编辑】指派项目负责人，并勾选参与该项目的团队成员（支持按总体组、产品组、研发组一键全选）。
                  </div>
                </div>
              </div>
              <div className="checklist-item">
                <div className="checklist-item-num">2</div>
                <div>
                  <div className="checklist-item-title">制定全周期月度额度规划（防前期透支核心策略）</div>
                  <div className="checklist-item-desc">
                    点击项目卡片上的<b>【🎯 额度规划】</b>按钮。系统首创<b>“🎯 稳健交付型（前低后高）”</b>排期策略：
                    <ul style={{ margin: '6px 0 0 16px', padding: 0, color: '#475569', fontSize: '12px', lineHeight: 1.6 }}>
                      <li><b>前期项目争取阶段（首月 0%~10% 可调，默认推荐 5%）</b>：用于方案论证与前期商务争取，设立硬性上限，严防初期把钱分完；</li>
                      <li><b>主体研制与成品交付阶段</b>：将大头（45% 以上额度）牢牢锁定在成品试验联调、发货交付与终检验收阶段；</li>
                      <li><b>维保阶段额度锁定（置底保留 5%）</b>：在项目最后一个月牢固锁定 5% 绩效额度，确保发货终验后售后维保依然有充沛激励。</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="checklist-item">
                <div className="checklist-item-num">3</div>
                <div>
                  <div className="checklist-item-title">一键稳健排期与阶段里程碑</div>
                  <div className="checklist-item-desc">
                    点击“🎯 一键稳健排期”自动秒级排定全生命周期；可按月输入阶段里程碑（如方案评审、试样研制、试验联调、成品发货验收）。
                  </div>
                </div>
              </div>
              <div className="checklist-item">
                <div className="checklist-item-num">4</div>
                <div>
                  <div className="checklist-item-title">项目组管理与角色默认分配比例</div>
                  <div className="checklist-item-desc">
                    在【项目组管理】中，可沉淀团队常用的项目组模版（如典型型号组：总体组30%、产品组30%、研发组40%），后续月度分配时可一键套用默认比例。
                  </div>
                </div>
              </div>
            </div>

            <div className="onboarding-tip-box">
              <div className="tip-icon">🎯</div>
              <div>
                <div className="tip-title">规划与实际联动基准</div>
                <div className="tip-content">
                  排好的全周期规划额度，将在后续月度分配时作为重要标尺；月度分配时系统会实时呈现偏差对比，并提供“⚡ 一键套用当月规划额度”。
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 内容 */}
        {step === 4 && (
          <div>
            <div className="onboarding-flow-card">
              <div className="flow-card-title">
                <Sparkles size={14} /> 第 4 步月底分配与批量发布生效示意
              </div>
              <div className="flow-steps-track">
                <div className="flow-node">
                  📅 选择考核月份 (如当月)
                </div>
                <span className="flow-arrow">➔</span>
                <div className="flow-node highlight">
                  📊 全项目当月集中大表
                </div>
                <span className="flow-arrow">➔</span>
                <div className="flow-node">
                  ⚡ 套用规划 & 成员分配 (100%)
                </div>
                <span className="flow-arrow">➔</span>
                <div className="flow-node highlight">
                  🚀 一键批量发布生效
                </div>
              </div>
            </div>

            <div className="onboarding-checklist">
              <div className="checklist-item">
                <div className="checklist-item-num">1</div>
                <div>
                  <div className="checklist-item-title">月底分配全项目集中透视大表（告别逐个点开）</div>
                  <div className="checklist-item-desc">
                    点击左侧【月度分配】，默认进入<b>【📊 全项目当月集中管理】</b>大表；顶部选择考核月份，当月所有进行中项目集中呈现在同一张透视大表中。
                  </div>
                </div>
              </div>
              <div className="checklist-item">
                <div className="checklist-item-num">2</div>
                <div>
                  <div className="checklist-item-title">调整当月分配额度（支持一键套用规划）</div>
                  <div className="checklist-item-desc">
                    表格每行清晰显示项目合同额、负责人及阶段里程碑；可直接微调当月分配比例（%），亦可直接点击<b>“⚡ 套用规划”</b>一键载入第 3 步排好的规划额度。
                  </div>
                </div>
              </div>
              <div className="checklist-item">
                <div className="checklist-item-num">3</div>
                <div>
                  <div className="checklist-item-title">配置成员当月分配比例（必须等于 100%）</div>
                  <div className="checklist-item-desc">
                    点击每行的【👥 快速配置成员比例】弹窗，为各成员输入分润百分比；支持快捷点击“一键全员均摊”或“套用项目组默认比例”；弹窗底部实时校验比例之和，<b>必须精确等于 100%</b> 方可保存。
                  </div>
                </div>
              </div>
              <div className="checklist-item">
                <div className="checklist-item-num">4</div>
                <div>
                  <div className="checklist-item-title">批量保存与一键批量发布/撤回</div>
                  <div className="checklist-item-desc">
                    同时调整多个项目的额度与比例后，点击顶部<b>【💾 批量保存当月修改】</b>；点击【📝 全选当月草稿】，点击<b>【🚀 批量发布所选项目】</b>立即正式生效计入考核！如需调整支持<b>【↩ 批量撤回为草稿】</b>。
                  </div>
                </div>
              </div>
            </div>

            <div className="onboarding-tip-box blue">
              <div className="tip-icon">🧮</div>
              <div>
                <div className="tip-title">考核核心计算公式</div>
                <div className="tip-content">
                  <b>员工当月获得绩点 = 项目合同金额（万元） × 当月项目分配比例（%） × 员工当月分配率（%）</b>。未发布的草稿状态方案不会计入最终考核报表。
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5 内容 */}
        {step === 5 && (
          <div>
            <div className="onboarding-flow-card">
              <div className="flow-card-title">
                <Sparkles size={14} /> 第 5 步报表透视与考核之星闭环示意
              </div>
              <div className="flow-steps-track">
                <div className="flow-node">
                  🗓️ 选定考核周期 (年/季/月/区间)
                </div>
                <span className="flow-arrow">➔</span>
                <div className="flow-node highlight">
                  📊 二维透视矩阵大表
                </div>
                <span className="flow-arrow">➔</span>
                <div className="flow-node">
                  ⚖️ 个人累加 + 浅蓝项目累加
                </div>
                <span className="flow-arrow">➔</span>
                <div className="flow-node highlight">
                  👑 终极总额双向守恒 & 考核之星
                </div>
              </div>
            </div>

            <div className="onboarding-checklist">
              <div className="checklist-item">
                <div className="checklist-item-num">1</div>
                <div>
                  <div className="checklist-item-title">多时间维度自由切换（年、季、月、自定义跨度）</div>
                  <div className="checklist-item-desc">
                    点击左侧【周期绩点报表】，顶部自由切换：<b>整年度</b>、<b>按季度（Q1~Q4）</b>、<b>单月份</b>或<b>自定义月份跨度区间</b>（如 2026-01 至 2026-06），数据瞬时秒级重算。
                  </div>
                </div>
              </div>
              <div className="checklist-item">
                <div className="checklist-item-num">2</div>
                <div>
                  <div className="checklist-item-title">标准二维透视矩阵（图2标准）</div>
                  <div className="checklist-item-desc">
                    界面直接呈现高清晰度二维透视矩阵：
                    <ul style={{ margin: '6px 0 0 16px', padding: 0, color: '#475569', fontSize: '12px', lineHeight: 1.6 }}>
                      <li><b>横向每行（人员维度）</b>：展示每位员工在各个项目分得的绩点，最右侧深色标示<b>【个人累加】</b>跨项目总和；</li>
                      <li><b>纵向每列（项目维度）</b>：展示每个合同项目列，<b>矩阵末行整行浅蓝色高亮展示【项目累加】汇总行</b>；</li>
                      <li><b>右下角全系统终极总累加</b>：行和（所有人累加之和） = 列和（所有项目累加之和），双向交叉验证 100% 严密自洽闭环！</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="checklist-item">
                <div className="checklist-item-num">3</div>
                <div>
                  <div className="checklist-item-title">个人明细下钻与报表 CSV 导出</div>
                  <div className="checklist-item-desc">
                    点击任意员工姓名调出其个人履职与分润明细档案；点击【导出本期报表 CSV】，生成的标准二维矩阵报表完全符合财务审计标准，在 Excel/WPS 中直接打开算薪。
                  </div>
                </div>
              </div>
              <div className="checklist-item">
                <div className="checklist-item-num">4</div>
                <div>
                  <div className="checklist-item-title">考核之星荣誉殿堂与核算员汇总中心</div>
                  <div className="checklist-item-desc">
                    在【考核之星殿堂】中，系统根据已发布绩点自动评选出<b>月度之星 🌟</b>、<b>季度之星 🏆</b>、<b>年度之星 👑</b>，金银铜奖牌榜实时闪耀；专职核算员还可在【核算员专区】批量合并各项目负责人的数据包。
                  </div>
                </div>
              </div>
            </div>

            <div className="onboarding-tip-box blue">
              <div className="tip-icon">🏆</div>
              <div>
                <div className="tip-title">五步完成核心闭环！</div>
                <div className="tip-content">
                  至此，您已完整掌握从“新建工作区 ➔ 导入主体 ➔ 额度规划 ➔ 月度分配 ➔ 周期报表”的全部核心操作。祝您使用愉快！
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 底部导航控制工具条 */}
        <div className="onboarding-modal-footer">
          <label className="dont-show-checkbox">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={e => setDontShowAgain(e.target.checked)}
            />
            <span>下次进入工作区不再自动弹出（随时可点击顶部【新手引导】再次查看）</span>
          </label>

          <div className="onboarding-btn-group">
            {step > 1 && (
              <button
                type="button"
                className="secondary"
                style={{ padding: '7px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => onStepChange(step - 1)}
              >
                <ChevronLeft size={16} /> 上一步
              </button>
            )}

            {/* 跳转对应功能模块快捷按钮 */}
            {!isGate && (
              <button
                type="button"
                className="secondary"
                style={{
                  padding: '7px 16px',
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f0fdf4',
                  color: '#15803d',
                  borderColor: '#86efac',
                  fontWeight: 600,
                }}
                onClick={() => {
                  handleFinish();
                  onNavigate(current.targetTab);
                }}
              >
                <ArrowRight size={14} /> 立即前往此模块
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                className="primary"
                style={{ padding: '7px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => onStepChange(step + 1)}
              >
                下一步 <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="primary"
                style={{ padding: '7px 20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#15803d' }}
                onClick={handleFinish}
              >
                <Check size={16} /> 完成引导，开始使用
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// -------------------------------------------------------------
// 新手简易操作手册弹窗 (Concise Illustrated User Manual Modal)
// -------------------------------------------------------------
function ManualModal({
  initialChapter = 0,
  onClose,
  onOpenGuide,
  onNavigate,
  isGate = false,
}: {
  initialChapter?: number;
  onClose(): void;
  onOpenGuide(): void;
  onNavigate(tab: Tab): void;
  isGate?: boolean;
}) {
  const [activeChapter, setActiveChapter] = useState(initialChapter);

  const chapters = [
    {
      id: 0,
      badge: '业务总览',
      icon: Sparkles,
      title: '🧭 五步业务闭环总览',
      subtitle: '端到端数据量化流转架构与核心闭环',
      targetTab: 'dashboard' as Tab,
    },
    {
      id: 1,
      badge: '第 1 步',
      icon: Database,
      title: '📌 第一步：新建安全工作区',
      subtitle: '离线优先 · AES-256 口令加密 · 非系统盘存储根基',
      targetTab: 'dashboard' as Tab,
    },
    {
      id: 2,
      badge: '第 2 步',
      icon: Users,
      title: '📌 第二步：导入项目与员工',
      subtitle: '员工名册与工程合同初始化 · 财务格式自动清洗',
      targetTab: 'employees' as Tab,
    },
    {
      id: 3,
      badge: '第 3 步',
      icon: Sliders,
      title: '📌 第三步：规划与项目组',
      subtitle: '防前期透支 · 🎯 稳健交付型曲线 · 维保保留 5%',
      targetTab: 'projects' as Tab,
    },
    {
      id: 4,
      badge: '第 4 步',
      icon: CalendarRange,
      title: '📌 第四步：月度分配与发布',
      subtitle: '集中管理大表 · ⚡ 套用规划 · 100% 校验 · 批量发布',
      targetTab: 'plans' as Tab,
    },
    {
      id: 5,
      badge: '第 5 步',
      icon: BarChart3,
      title: '📌 第五步：周期报表与荣誉',
      subtitle: '二维透视矩阵 · 项目累加行 · 行列双向闭环 · 考核之星',
      targetTab: 'reports' as Tab,
    },
    {
      id: 6,
      badge: '常见问答',
      icon: BookOpenCheck,
      title: '💡 新手 FAQ 与避坑指南',
      subtitle: '草稿发布、防误触保护、多合同独立归集与灾备迁移',
      targetTab: 'dashboard' as Tab,
    },
  ];

  const currentCh = chapters[activeChapter] || chapters[0];

  return (
    <Modal
      title="衡绩考核系统 · 新手简易操作手册"
      subtitle={`版本号: v${APP_VERSION} (Build ${APP_BUILD}) · 离线优先安全架构 · 图文并茂业务操作指南`}
      wide
      onClose={onClose}
    >
      <div className="manual-modal-body">
        <div className="manual-layout">
          {/* 左侧目录导航 */}
          <div className="manual-nav-sidebar">
            <div>
              <div className="manual-nav-header">
                <span className="manual-nav-title">手册目录章节</span>
                <button
                  type="button"
                  className="manual-switch-guide-btn"
                  onClick={() => {
                    onClose();
                    onOpenGuide();
                  }}
                  title="切换为 5 步交互式新手向导"
                >
                  <Sparkles size={12} /> 5步交互向导
                </button>
              </div>
              <div className="manual-nav-list">
                {chapters.map((ch) => {
                  const Icon = ch.icon;
                  const isActive = ch.id === activeChapter;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      className={`manual-nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveChapter(ch.id)}
                    >
                      <div className="manual-nav-icon">
                        <Icon size={15} />
                      </div>
                      <div className="manual-nav-text">
                        <div className="manual-nav-item-title">{ch.title}</div>
                        <div className="manual-nav-item-sub">{ch.badge}</div>
                      </div>
                      <ChevronRight size={13} className="manual-nav-arrow" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="manual-sidebar-author">
              <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>衡绩考核系统团队</div>
              <div><b>作者</b>: 邹富敦 (Phudon Zou)</div>
              <div><b>团队</b>: TOPFIRE 研发团队</div>
              <div><b>支持</b>: zoufudun@163.com</div>
            </div>
          </div>

          {/* 右侧详细内容区域 */}
          <div className="manual-content-pane">
            <div className="manual-content-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="manual-chapter-tag">{currentCh.badge}</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{currentCh.subtitle}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {currentCh.title}
                </h2>
                {!isGate && currentCh.id > 0 && currentCh.id < 6 && (
                  <button
                    type="button"
                    className="manual-jump-module-btn"
                    onClick={() => {
                      onClose();
                      onNavigate(currentCh.targetTab);
                    }}
                    title={`立即打开 ${currentCh.title}`}
                  >
                    <ArrowRight size={13} /> 立即前往对应功能模块
                  </button>
                )}
              </div>
            </div>

            <div className="manual-chapter-body">
              {/* Chapter 0: 业务总览 */}
              {activeChapter === 0 && (
                <div>
                  <div className="manual-section">
                    <p>
                      衡绩系统采用端到端的数据量化流转架构，从建立安全工作区出发，经过业务数据初始化、全周期额度防透支规划、月底集中考评与一键发布，最终在报表中心形成行列双向严密自洽的透视矩阵与荣誉殿堂。
                    </p>
                    <div className="manual-grid-cards">
                      <div className="manual-card">
                        <div className="manual-card-title">🛡️ 纯本地单机运行</div>
                        <div className="manual-card-desc">零网络依赖，所有部门员工、项目及分配数据均存储在用户指定的 <code>.hengji</code> 加密文件中，从物理层面杜绝数据泄露。</div>
                      </div>
                      <div className="manual-card">
                        <div className="manual-card-title">🔒 工业级安全防护</div>
                        <div className="manual-card-desc">PBKDF2-SHA256（100,000次加盐迭代计算）派生密钥，结合 AES-256-GCM 认证加密；自动生成 <code>.backup</code> 镜像兜底。</div>
                      </div>
                      <div className="manual-card">
                        <div className="manual-card-title">🎯 防前期透支规划</div>
                        <div className="manual-card-desc">首创“稳健交付型（前低后高）”算法，前期项目争取设立硬性上限，成品发货终验锁定大头，维保支持置底保留 5%。</div>
                      </div>
                      <div className="manual-card">
                        <div className="manual-card-title">📊 双向 100% 严密闭环</div>
                        <div className="manual-card-desc">二维透视矩阵中，横向人员行累加与纵向项目列累加完全相等，右下角全系统终极总额双向交叉自洽闭环。</div>
                      </div>
                    </div>
                  </div>

                  <div className="manual-section">
                    <div className="manual-section-h3">五步核心业务闭环流程图</div>
                    <pre className="manual-ascii-box">{`┌─────────────────────────────────────────────────────────────────────────────────┐
│                           衡绩系统 5 步核心业务闭环流程图                           │
└─────────────────────────────────────────────────────────────────────────────────┘

   【第 1 步：建立工作区】       【第 2 步：初始化主体】        【第 3 步：顶层规划设计】
   ┌───────────────────┐        ┌───────────────────┐        ┌───────────────────┐
   │  新建安全工作区    │ ─────▶ │  导入部门员工名册  │ ─────▶ │  全周期额度规划    │
   │  .hengji 本地存储  │        │  (总体/产品/研发) │        │  (稳健交付防透支) │
   │  AES-256 口令加密 │        │  导入合同项目清单  │        │  项目组模版比例   │
   └───────────────────┘        └───────────────────┘        └───────────────────┘
                                                                       │
                                                                       ▼
   【第 5 步：报表与荣誉】       【第 4 步：月底考评发布】
   ┌───────────────────┐        ┌───────────────────┐
   │  周期绩点报表透视  │ ◀───── │  月度分配集中大表  │
   │  横向个人·纵向项目 │        │  ⚡ 套用当月规划   │
   │  双向 100% 闭环求和│        │  配置成员比例 100%│
   │  考核之星荣誉殿堂  │        │  🚀 一键批量发布   │
   └───────────────────┘        └───────────────────┘`}</pre>
                  </div>

                  <div className="manual-callout-box blue">
                    <strong>💡 新手阅读建议</strong>：点击左侧章节目录或下方“下一章”按钮，即可依次查阅每一步的具体操作指引、避坑锦囊与核算公式。随时可点击右上角【5步交互向导】体验操作。
                  </div>
                </div>
              )}

              {/* Chapter 1: 第一步 */}
              {activeChapter === 1 && (
                <div>
                  <div className="manual-section">
                    <div className="manual-section-h3">1.1 业务背景与安全架构</div>
                    <p>
                      衡绩系统采用<b>完全离线优先架构</b>，零网络依赖。系统不会把业务数据隐蔽放到 C 盘用户目录，所有部门员工、工程项目、月度分配与绩点流水均保存在用户自主指定的 <code>.hengji</code> 工作区文件中，从物理层面杜绝保密数据泄露。
                    </p>
                    <pre className="manual-ascii-box">{`┌───────────────────────────────────────────────────────────────┐
│                      第一步：工作区建立机制示意                │
└───────────────────────────────────────────────────────────────┘
   双击运行软件 ──▶ 【+ 新建工作区】 ──▶ 选择非系统盘 (D:/E:/保密盘)
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
         【🏢 综合管理工作区 (推荐)】                     【📊 绩效核算工作区】
         适合超级管理员统揽全局                          适合专职核算员汇总数据包
                      │                                               │
                      └───────────────────────┬───────────────────────┘
                                              ▼
                                 设置管理员口令 (AES-256)
                                 (在个人电脑亦可直接留空免密)
                                              ▼
                                生成 .hengji 加密工作区文件
                                (每次保存自动生成 .backup 镜像)`}</pre>
                  </div>

                  <div className="manual-section">
                    <div className="manual-section-h3">1.2 具体操作指引</div>
                    <ol style={{ paddingLeft: '20px', margin: '8px 0', lineHeight: 1.8 }}>
                      <li><b>启动程序</b>：双击桌面离线版执行程序 <code>衡绩员工绩点考核系统.exe</code>；</li>
                      <li><b>点击【新建工作区】</b>：在欢迎界面点击【+ 新建工作区】（若已有基础团队，可点【从共享基础库新建】快速继承员工与项目组）；</li>
                      <li><b>选择工作区应用场景</b>：
                        <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                          <li><b>🏢 综合管理工作区（首选推荐）</b>：面向超级管理员或部门负责人，拥有项目创建、全周期规划、月度考评及系统全量配置权限。</li>
                          <li><b>📊 绩效核算工作区</b>：面向专职绩效核算员，用于接收并导入各项目负责人的数据包，开展跨项目汇总与荣誉评选。</li>
                        </ul>
                      </li>
                      <li><b>指定存储位置（强烈推荐非系统盘）</b>：弹出保存窗口时，<b>请务必选择非系统盘</b>（如 D 盘、E 盘、单位专用保密盘或共享受控网盘目录），文件后缀为 <code>.hengji</code>；</li>
                      <li><b>设置管理员口令（或留空免密）</b>：底层采用 <code>PBKDF2-SHA256</code>（100,000次加盐迭代）派生密钥并结合 <code>AES-256-GCM</code> 加密；若在个人专用电脑使用，口令可直接留空创建免密工作区，日常直接秒进；</li>
                      <li><b>自动备份机制</b>：每次在系统内点击保存或执行修改前，系统会自动在工作区同目录生成 <code>.hengji.backup</code> 上一版镜像，双重兜底。</li>
                    </ol>
                  </div>

                  <div className="manual-callout-box amber">
                    <strong>⚠️ 避坑提醒</strong>：建议定期将 <code>.hengji</code> 文件冷备份至专用移动硬盘或单位保密服务器。若忘记管理员口令，因高强度加密特性，任何第三方均无法强行破解。
                  </div>
                </div>
              )}

              {/* Chapter 2: 第二步 */}
              {activeChapter === 2 && (
                <div>
                  <div className="manual-section">
                    <div className="manual-section-h3">2.1 业务背景与主体初始化</div>
                    <p>
                      建立考核所需的“人”（员工档案与专业组归属）与“事”（工程合同项目与工作令号）两大基石数据。
                    </p>
                    <pre className="manual-ascii-box">{`┌───────────────────────────────────────────────────────────────┐
│                      第二步：业务主体初始化示意                │
└───────────────────────────────────────────────────────────────┘

  【员工管理】                                     【项目库管理】
  [员工与专业组]                                   [项目库与额度]
       │                                                │
  ┌────┴─────────────────────────┐                 ┌────┴─────────────────────────┐
  │ 选项A: 📥 批量导入员工 CSV   │                 │ 选项A: 📥 批量导入项目 CSV   │
  │ 选项B: ⚡ 一键初始化内置成员 │                 │ 选项B: ➕ 新建单项工程合同   │
  │ 选项C: ➕ 手动单个添加员工   │                 └──────────────────────────────┘
  └──────────────────────────────┘                              │
                 │                                              ▼
                 ▼                                 【财务格式全自动自适应清洗】
       【专业组自动归类绑定】                         • 自动剥离千分位逗号 (1,309,000.00)
       • 总体组 (系统方案/总体协调)                  • 自动清除货币符号 (¥、$、元、万元)
       • 产品组 (硬件结构/产品定义)                  • 浮点超长小数四舍五入到分 (33.333333)
       • 研发组 (算法/嵌入式/软件)                   • 同工作令号多子合同独立核算`}</pre>
                  </div>

                  <div className="manual-section">
                    <div className="manual-section-h3">2.2 具体操作指引</div>
                    <h4 style={{ margin: '10px 0 4px', color: '#15803d' }}>1. 导入或添加部门员工</h4>
                    <p>点击左侧导航栏【员工与专业组】：</p>
                    <ul style={{ paddingLeft: '20px', lineHeight: 1.8 }}>
                      <li><b>批量导入</b>：点击【📥 批量导入员工 CSV】，支持直接拖拽单位花名册，智能识别姓名、工号、部门、专业组、职务及邮箱；</li>
                      <li><b>一键初始化</b>：在新建空白工作区中，直接点击【⚡ 一键初始化内置成员】，一秒载入总体组、产品组、研发组的标准初始团队架构；</li>
                      <li><b>手动登记</b>：点击右上角【+ 新建员工】逐个登记，可指派“👑 系统管理员”、“📊 绩效核算员”或“👤 普通员工”角色。</li>
                    </ul>

                    <h4 style={{ margin: '14px 0 4px', color: '#15803d' }}>2. 导入或新建工程合同项目</h4>
                    <p>点击左侧导航栏【项目库与额度】或【数据导入导出与灾备】：</p>
                    <ul style={{ paddingLeft: '20px', lineHeight: 1.8 }}>
                      <li><b>批量导入项目</b>：点击【📥 批量导入项目 CSV】，支持拖拽项目清单（包含合同编号/工作令号、项目名称、客户名称、合同额（万元）、起止年月及项目负责人）；</li>
                      <li><b>财务格式全容错</b>：系统自动识别千分位逗号（如 <code>1,250,000.00</code>）、货币符号（¥、￥、$、RMB）与科学计数法（<code>1.25E+05</code>），超长小数自动四舍五入到分，绝不报错弹窗；</li>
                      <li><b>同令号多子项目独立归集</b>：同一工作令号下支持存在多个子项目或不同执行合同，每个合同项目基于 <code>projectId</code> 独立归集与分配，彻底杜绝数据克隆。</li>
                    </ul>
                  </div>

                  <div className="manual-callout-box">
                    <strong>💡 专业组推荐划分</strong>：常规工程型号推荐设立“总体组（方案与总体协调）”、“产品组（硬件结构与产品定义）”和“研发组（算法、嵌入式与系统软件）”，便于后续项目组模版统一配比。
                  </div>
                </div>
              )}

              {/* Chapter 3: 第三步 */}
              {activeChapter === 3 && (
                <div>
                  <div className="manual-section">
                    <div className="manual-section-h3">3.1 核心痛点与防前期透支策略</div>
                    <p>
                      工程与科研项目通常跨越数月乃至整年。若缺乏全生命周期节奏规划，常出现<b>“项目刚立项就把额度分光，后期进入成品发货、试验交付与终检验收阶段时却有货无钱可分”</b>的严重风险。
                    </p>
                    <pre className="manual-ascii-box">{`┌───────────────────────────────────────────────────────────────┐
│               第三步：🎯 稳健交付型（前低后高）额度排期曲线            │
└───────────────────────────────────────────────────────────────┘

  额度占比 (%)
   ▲
50%│                                       ╭─────────────╮ (发货终验期)
40%│                                       │ 成品发货交付│ (大头 45%+)
30%│                         ╭─────────────┤ 试验联调验收│
20%│           ╭─────────────┤ 试样研制加工│
10%│ ╭─────────┤ 方案评审论证│             │             ╭─────────────╮
 0%│ │ 前期争取│             │             │             │ 维保支持阶段│ (置底保留 5%)
   └─┴─────────┴─────────────┴─────────────┴─────────────┴─────────────┴──▶ 周期月份
       首月 (0~10%)            中间研制执行交付期              末月 (稳固锁定 5%)`}</pre>
                  </div>

                  <div className="manual-section">
                    <div className="manual-section-h3">3.2 具体操作指引</div>
                    <ol style={{ paddingLeft: '20px', margin: '8px 0', lineHeight: 1.8 }}>
                      <li><b>配置项目负责人与项目团队</b>：在【项目库与额度】卡片列表中，找到目标项目，点击【编辑】；选定项目负责人，并勾选参与团队成员（支持按总体组、产品组、研发组一键全选）；</li>
                      <li><b>制定全周期月度额度规划（防前期透支）</b>：
                        <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                          <li>点击项目卡片上的<b>【🎯 额度规划】</b>按钮，进入全周期月度规划控制台；</li>
                          <li><b>前期项目争取阶段（首月 0%~10% 可调，默认推荐 5%）</b>：设立硬性上限，严防初期把钱分完；</li>
                          <li><b>主体研制与成品交付阶段</b>：将大头（45% 以上额度）牢牢锁定在成品试验联调、发货交付与终检验收阶段；</li>
                          <li><b>维保阶段额度锁定（置底保留 5%）</b>：在项目全周期最后一个月，系统牢固锁定保留 5% 绩效额度，确保发货终验后售后维保依然有充沛激励。</li>
                        </ul>
                      </li>
                      <li><b>常用项目组模版与默认分配比例</b>：点击左侧【项目组管理】，可以预设常用项目组模版（如典型型号研制组：总体组30%、产品组30%、研发组40%），后续月度分配时可“一键套用项目组默认比例”，极大提速。</li>
                    </ol>
                  </div>

                  <div className="manual-callout-box amber">
                    <strong>🎯 黄金法则</strong>：项目立项时建议直接使用“🎯 一键稳健排期”，自动秒级排定全生命周期前低后高节奏，既保证过程激励，又杜绝后期干瘪。
                  </div>
                </div>
              )}

              {/* Chapter 4: 第四步 */}
              {activeChapter === 4 && (
                <div>
                  <div className="manual-section">
                    <div className="manual-section-h3">4.1 核心痛点与集中透视模式</div>
                    <p>
                      过去进行月底考评时，负责人必须逐个搜索并点开每个项目进行填报，耗时费力。当前版本全面升级为<b>【全项目当月集中管理】大表</b>，一屏尽览。
                    </p>
                    <pre className="manual-ascii-box">{`┌───────────────────────────────────────────────────────────────┐
│                      第四步：月底集中考评与发布示意             │
└───────────────────────────────────────────────────────────────┘

   【顶部考核月份切换器 (如 2026-06)】 ── 统计：当月进行中项目数、当月分配总额
                     │
                     ▼
   【📊 全项目当月集中管理大表 (矩阵模式)】
   ┌───────────┬──────────┬──────────┬──────────┬─────────────────┬──────────┐
   │ 项目名称  │ 工作令号 │ 合同额   │ 当月分配 │ 成员分润比例    │ 发布状态 │
   ├───────────┼──────────┼──────────┼──────────┼─────────────────┼──────────┤
   │ 某型通信机│ 23-0181  │ 120 万元 │  15.0%   │ 👥 点击配置成员 │ [已发布] │
   │ 智能控制箱│ 25-0010  │  80 万元 │  [微调]  │ ⚡ 套用组比例   │ [草稿]   │
   └───────────┴──────────┴──────────┴──────────┴─────────────────┴──────────┘
                     │
       ┌─────────────┴─────────────┐
       ▼                           ▼
   【💾 批量保存修改】        【🚀 批量发布所选项目】
   原子化提交所有项目变更      当月方案即刻正式生效计入考核！
                              (亦可随时 【↩ 批量撤回为草稿】)`}</pre>
                  </div>

                  <div className="manual-section">
                    <div className="manual-section-h3">4.2 具体操作指引</div>
                    <ol style={{ paddingLeft: '20px', margin: '8px 0', lineHeight: 1.8 }}>
                      <li><b>进入月度分配集中看板</b>：点击左侧【月度分配】，默认进入【📊 全项目当月集中管理】，顶部选择考核月份（如 2026-06），当月所有进行中项目集中呈现在同一张大表中；</li>
                      <li><b>设置各项目当月分配额度</b>：表格每行显示项目合同额、负责人及阶段里程碑，可直接微调当月分配比例（%），亦可直接点击<b>“⚡ 套用规划”</b>一键载入第 3 步排好的规划额度；</li>
                      <li><b>配置项目成员当月分润比例</b>：点击每行的【👥 快速配置成员比例】弹窗，为各成员输入分润百分比；支持快捷点击“一键全员均摊”或“套用项目组默认比例”；弹窗底部实时校验比例之和，<b>必须精确等于 100%</b> 方可保存；</li>
                      <li><b>批量保存与一键批量发布/撤回</b>：同时调整多个项目的额度与比例后，点击顶部<b>【💾 批量保存当月修改】</b>；点击【📝 全选当月草稿】，点击<b>【🚀 批量发布所选项目】</b>立即正式生效计入考核！如需微调，点击<b>【↩ 批量撤回为草稿】</b>即可瞬间撤回重新编辑。</li>
                    </ol>
                  </div>

                  <div className="manual-callout-box">
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>📐 核心核算公式</div>
                    <div><b>员工当月获得绩点 = 项目合同金额（万元） × 当月项目分配比例（%） × 员工当月分配率（%）</b></div>
                    <div style={{ fontSize: '11.5px', marginTop: '4px', opacity: 0.85 }}>注：未发布的草稿状态方案不会计入最终考核报表与考核之星殿堂。</div>
                  </div>
                </div>
              )}

              {/* Chapter 5: 第五步 */}
              {activeChapter === 5 && (
                <div>
                  <div className="manual-section">
                    <div className="manual-section-h3">5.1 二维透视矩阵与双向守恒机制</div>
                    <p>
                      方案一旦发布，数据立即实时流转至报表与荣誉中心。报表采用标准的二维透视矩阵：横向看个人累加，纵向看项目累加，右下角全系统终极总额双向完全闭环！
                    </p>
                    <pre className="manual-ascii-box">{`┌───────────────────────────────────────────────────────────────────────────────┐
│                    第五步：标准二维透视矩阵与双向闭环求和图示                   │
└───────────────────────────────────────────────────────────────────────────────┘

 序号 │ 姓名   │ 专业组 │ 项目A(令号1) │ 项目B(令号2) │ 项目C(令号3) │ 【个人累加】 
──────┼────────┼────────┼──────────────┼──────────────┼──────────────┼──────────────
  1   │ 张工   │ 总体组 │   12,000 点  │    8,500 点  │        0 点  │   20,500 点 
  2   │ 李工   │ 产品组 │    8,000 点  │        0 点  │   15,000 点  │   23,000 点 
  3   │ 王工   │ 研发组 │    5,000 点  │   11,500 点  │    9,000 点  │   25,500 点 
──────┼────────┼────────┼──────────────┼──────────────┼──────────────┼──────────────
 【项目累加】 (浅蓝高亮)│   25,000 点  │   20,000 点  │   24,000 点  │ 🌟 69,000 点 
 (序号为空，整行浅蓝底色)│ (项目A总分润)│ (项目B总分润)│ (项目C总分润)│ (终极双向守恒)

 ※ 右下角终极总额 = 所有员工个人累加之和 (20500+23000+25500=69000)
                  = 所有合同项目累加之和 (25000+20000+24000=69000)
                  行列双向交叉验证 100% 严密闭环！`}</pre>
                  </div>

                  <div className="manual-section">
                    <div className="manual-section-h3">5.2 具体操作指引</div>
                    <ol style={{ paddingLeft: '20px', margin: '8px 0', lineHeight: 1.8 }}>
                      <li><b>多时间维度自由切换</b>：点击左侧【周期绩点报表】，顶部自由切换时间维度：<b>整年度</b>、<b>按季度（Q1~Q4）</b>、<b>单月份</b>或<b>自定义月份跨度区间</b>（如 2026-01 至 2026-06），数据瞬时秒级重算；</li>
                      <li><b>二维矩阵透视阅览</b>：
                        <ul style={{ paddingLeft: '20px', marginTop: '4px' }}>
                          <li><b>横向每行（人员维度）</b>：展现每位员工在各个合同项目下分得的具体绩点，最右侧深色标示<b>【个人累加】</b>跨项目总和；</li>
                          <li><b>纵向每列（项目维度）</b>：展现每个合同项目列，<b>矩阵末行整行浅蓝色高亮展示【项目累加】汇总行</b>；</li>
                          <li><b>右下角全系统终极总累加</b>：行和（所有个人累加之和） = 列和（所有项目累加之和），双向交叉验证 100% 严密自洽闭环！</li>
                        </ul>
                      </li>
                      <li><b>明细下钻与报表 CSV 导出</b>：点击任意员工姓名调出其个人履职与分润明细档案；点击【导出本期报表 CSV】，生成的二维矩阵报表完全符合财务审计标准，在 Excel/WPS 中直接打开即可对接薪酬发放；</li>
                      <li><b>考核之星荣誉殿堂</b>：点击左侧【考核之星殿堂】，系统基于已发布绩点自动评选出<b>月度之星 🌟</b>、<b>季度之星 🏆</b>、<b>年度之星 👑</b>，金银铜奖牌榜实时闪耀，激发团队创新创优活力。</li>
                    </ol>
                  </div>

                  <div className="manual-callout-box blue">
                    <strong>🏆 荣誉驱动</strong>：考核之星支持按总体组、产品组、研发组分别筛选专业之星，兼顾公平与卓越，是部门绩效激励与期末评优的核心参考依据。
                  </div>
                </div>
              )}

              {/* Chapter 6: 新手 FAQ */}
              {activeChapter === 6 && (
                <div>
                  <div className="manual-section">
                    <div className="manual-faq-item">
                      <div className="manual-faq-q">
                        <span style={{ color: '#16a34a' }}>Q1</span>
                        <span>为什么我填写了月度分配，报表里却没有看到员工的绩点？</span>
                      </div>
                      <div className="manual-faq-a">
                        <b>解答</b>：请检查月度分配方案的状态是否为<b>【已发布】</b>。若为“草稿”状态，数据仅保存在草稿箱中供调整审核，必须点击【🚀 批量发布所选项目】发布生效后，才会正式计入周期报表和考核之星。
                      </div>
                    </div>

                    <div className="manual-faq-item">
                      <div className="manual-faq-q">
                        <span style={{ color: '#16a34a' }}>Q2</span>
                        <span>如果不小心点击了外部背景，弹窗会关闭导致正在填写的比例丢失吗？</span>
                      </div>
                      <div className="manual-faq-a">
                        <b>解答</b>：<b>绝对不会</b>。系统全面内置全局防误触保护，点击弹窗外部背景遮罩不会关闭弹窗。只有点击右上角“✕”或底部明确的“取消/关闭”按钮才会退出，彻底保护您的录入进度。
                      </div>
                    </div>

                    <div className="manual-faq-item">
                      <div className="manual-faq-q">
                        <span style={{ color: '#16a34a' }}>Q3</span>
                        <span>同一工作令号下有多个不同合同，数值会串联重复吗？</span>
                      </div>
                      <div className="manual-faq-a">
                        <b>解答</b>：<b>不会</b>。系统底层以唯一项目 ID（<code>projectId</code>）进行细目归集，严格隔离相同工作令号下的不同子项目，各合同项目的分配独立核算，末行【项目累加】精准自洽。
                      </div>
                    </div>

                    <div className="manual-faq-item">
                      <div className="manual-faq-q">
                        <span style={{ color: '#16a34a' }}>Q4</span>
                        <span>更换办公电脑或重装系统后，如何恢复数据？</span>
                      </div>
                      <div className="manual-faq-a">
                        <b>解答</b>：在旧电脑上将 <code>.hengji</code> 工作区文件拷贝到 U 盘或移动硬盘；在新电脑打开软件后，在欢迎界面点击【打开工作区】，选择该 <code>.hengji</code> 文件并输入管理员口令（若创建时免密则直接进入），全部数据与项目组配置 100% 完整复原。
                      </div>
                    </div>

                    <div className="manual-faq-item">
                      <div className="manual-faq-q">
                        <span style={{ color: '#16a34a' }}>Q5</span>
                        <span>如何防止前期就把额度分光，导致后期发货终验无法分配？</span>
                      </div>
                      <div className="manual-faq-a">
                        <b>解答</b>：在【项目库与额度】中点击【🎯 额度规划】，采用<b>“稳健交付型（前低后高）”</b>排期算法，前期争取硬性限制在 0%~10%（推荐5%），大头锁定在成品交付阶段，项目末月系统自动置底保留 5% 维保额度，彻底杜绝前期透支。
                      </div>
                    </div>
                  </div>

                  <div className="manual-callout-box">
                    <div><b>手册制作</b>：邹富敦 (Phudon Zou) / TOPFIRE 研发团队</div>
                    <div><b>技术支持邮箱</b>：zoufudun@163.com</div>
                    <div style={{ fontSize: '11.5px', marginTop: '4px', opacity: 0.85 }}>如有任何需求变更或系统建议，欢迎通过技术支持邮箱随时联系我们。</div>
                  </div>
                </div>
              )}
            </div>

            {/* 底部前后导航栏 */}
            <div className="manual-bottom-nav">
              {activeChapter > 0 ? (
                <button
                  type="button"
                  className="secondary"
                  style={{ padding: '7px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => setActiveChapter(activeChapter - 1)}
                >
                  <ChevronLeft size={16} /> 上一章：{chapters[activeChapter - 1].badge}
                </button>
              ) : <div />}

              {activeChapter < chapters.length - 1 ? (
                <button
                  type="button"
                  className="primary"
                  style={{ padding: '7px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => setActiveChapter(activeChapter + 1)}
                >
                  下一章：{chapters[activeChapter + 1].badge} <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="primary"
                  style={{ padding: '7px 20px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#15803d' }}
                  onClick={onClose}
                >
                  <Check size={16} /> 已完全掌握，关闭手册
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// -------------------------------------------------------------
// 0.9 将核算员已导入数据包转换为可供看板与荣誉殿堂使用的标准派生 State
// -------------------------------------------------------------
function buildAuditorDerivedState(packages: ProjectMeritPackage[], baseState: State | null): State {
  if (!packages || packages.length === 0) {
    return baseState || demoState();
  }
  const baseEmployees = baseState?.employees || [];

  // 1. 调用核心算法汇总归一出全员跨项目数据
  const summary = summarizeAuditorPackages(packages, baseEmployees);

  // 2. 映射构建全局归一化员工列表，杜绝姓名丢失与重复
  const empMap = new Map<string, Employee>();
  summary.employeeSummaries.forEach(emp => {
    empMap.set(emp.id, {
      id: emp.id,
      employeeNo: emp.employeeNo,
      name: emp.name || emp.employeeNo || emp.id,
      department: emp.department || '第四研究室',
      group: (emp.group as any) || '研发组',
      groupRole: (emp.groupRole as any) || '组员',
      position: emp.position || '工程师',
      role: 'member',
      active: true,
    });
  });

  // 补齐 baseState 中未参与分配的员工（如系统管理员或核算员）
  baseEmployees.forEach(be => {
    if (!empMap.has(be.id)) {
      empMap.set(be.id, be);
    }
  });

  const employees = Array.from(empMap.values());

  // 建立明细记录到归一化员工 ID 的高精度映射
  const detailToNormalizedEmpId = new Map<any, string>();
  summary.employeeSummaries.forEach(emp => {
    emp.details.forEach(d => {
      detailToNormalizedEmpId.set(d, emp.id);
    });
  });

  // 3. 构建 projects，时间轴动态适配数据包实际月份
  const projects: Project[] = packages.map(pkg => {
    const pkgMonths = (pkg.period?.months || []).concat(pkg.details?.map(d => d.month) || []).filter(Boolean).sort();
    const start = pkg.project.start || (pkgMonths.length > 0 ? pkgMonths[0] : '2026-01');
    const end = pkg.project.end || (pkgMonths.length > 0 ? pkgMonths[pkgMonths.length - 1] : '2026-12');
    const contract = pkg.project.contract !== undefined
      ? Math.round(Number(pkg.project.contract) || 0)
      : Math.round((Number(pkg.project.contractWan) || 0) * 1_000_000);

    return {
      id: pkg.project.id,
      code: pkg.project.code || '',
      name: pkg.project.name || '未命名项目',
      client: pkg.project.client || '',
      contract,
      owner: pkg.project.ownerId || '',
      start,
      end,
      status: 'active',
      members: (pkg.memberSummaries || []).map(m => {
        const match = summary.employeeSummaries.find(e => (m.employeeNo && e.employeeNo === m.employeeNo) || e.id === m.employeeId || e.name === m.name);
        return match ? match.id : m.employeeId;
      }),
    };
  });

  // 4. 将 details 按 month 组合成 plans，将 employeeId 统一归一化为全员汇总的标准 ID
  const plans: Plan[] = [];
  packages.forEach(pkg => {
    const monthDetailsMap = new Map<string, typeof pkg.details>();
    (pkg.details || []).forEach(d => {
      const list = monthDetailsMap.get(d.month) || [];
      list.push(d);
      monthDetailsMap.set(d.month, list);
    });

    monthDetailsMap.forEach((detailsList, month) => {
      const records: Record[] = detailsList.map((d, idx) => {
        const empId = detailToNormalizedEmpId.get(d) ||
          summary.employeeSummaries.find(e => (d.employeeNo && e.employeeNo === d.employeeNo) || e.id === d.employeeId || e.name === d.employeeName)?.id ||
          d.employeeId;
        return {
          id: `rec_${pkg.project.id}_${empId}_${month}_${idx}`,
          projectId: pkg.project.id,
          employeeId: empId,
          points: Math.round(Number(d.points) || 0),
          createdAt: new Date().toISOString(),
        };
      });

      const entries: PlanEntry[] = detailsList.map(d => {
        const empId = detailToNormalizedEmpId.get(d) ||
          summary.employeeSummaries.find(e => (d.employeeNo && e.employeeNo === d.employeeNo) || e.id === d.employeeId || e.name === d.employeeName)?.id ||
          d.employeeId;
        return {
          employeeId: empId,
          rate: Math.round(Number(d.rate) || 0),
          workContent: d.workContent || '',
        };
      });

      plans.push({
        id: `plan_${pkg.project.id}_${month}`,
        projectId: pkg.project.id,
        month,
        budget: Math.round(detailsList.reduce((acc, curr) => acc + (Number(curr.rate) || 0), 0)),
        entries,
        status: 'published',
        publishedAt: new Date().toISOString(),
        records,
      });
    });
  });

  return {
    projects,
    plans,
    employees,
    audit: baseState?.audit || [],
    settings: baseState?.settings || {
      contractRanges: [
        { min: 0, max: 100000000, managerRateRange: [1000, 2000] },
        { min: 100000000, max: 500000000, managerRateRange: [800, 1500] },
      ],
      defaultMembers: [],
    },
    auditorPackages: packages,
  };
}

// -------------------------------------------------------------
// 当月个人绩点前五名直观排行榜组件 (优化：勋章、进度对比条、万单位)
// -------------------------------------------------------------
function TopFiveRankingList({ rows }: { rows: ReturnType<typeof rangeReport> }) {
  const topRows = rows.filter(row => row.points > 0).slice(0, 5);
  const topPoints = topRows[0]?.points || 1;

  if (topRows.length === 0) {
    return <Empty text="本月暂未发布任何绩点" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
      {topRows.map((row, index) => {
        const pctOfTop = Math.max(6, Math.min(100, Math.round((row.points / topPoints) * 100)));
        return (
          <div
            key={row.employee.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: index === 0 ? '#fffdf5' : '#ffffff',
              border: index === 0 ? '1px solid #fef08a' : '1px solid #e2e8f0',
              boxShadow: index === 0 ? '0 2px 6px rgba(245, 158, 11, 0.08)' : '0 1px 2px rgba(0,0,0,0.02)',
              transition: 'all 0.15s ease',
            }}
          >
            {/* 勋章/排名标 */}
            {index === 0 ? (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', boxShadow: '0 2px 5px rgba(245, 158, 11, 0.35)', flexShrink: 0 }} title="月度第 1 名 · 榜首">
                🥇
              </div>
            ) : index === 1 ? (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #94a3b8, #64748b)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', boxShadow: '0 2px 5px rgba(100, 116, 139, 0.25)', flexShrink: 0 }} title="月度第 2 名">
                🥈
              </div>
            ) : index === 2 ? (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', boxShadow: '0 2px 5px rgba(180, 83, 9, 0.25)', flexShrink: 0 }} title="月度第 3 名">
                🥉
              </div>
            ) : (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f8fafc', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', border: '1px solid #cbd5e1', flexShrink: 0 }}>
                {index + 1}
              </div>
            )}

            {/* 头像 */}
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: index === 0 ? '#fef3c7' : index === 1 ? '#f1f5f9' : index === 2 ? '#ffedd5' : '#f0fdf4', color: index === 0 ? '#b45309' : index === 1 ? '#475569' : index === 2 ? '#9a3412' : '#166534', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(0,0,0,0.06)' }}>
              {row.employee.name.slice(0, 1)}
            </div>

            {/* 员工信息 */}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px', flex: '0 1 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>
                  {row.employee.name}
                </span>
                <GroupTag group={row.employee.group} />
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                {row.employee.department} · {row.details.length} 个项目
              </div>
            </div>

            {/* 直观进度对比条 */}
            <div style={{ flex: 1, padding: '0 10px', minWidth: '80px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '10.5px', color: '#94a3b8' }}>
                <span>对比榜首</span>
                <span>{pctOfTop}%</span>
              </div>
              <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${pctOfTop}%`,
                  height: '100%',
                  background: index === 0
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                    : index === 1
                    ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                    : index === 2
                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                    : 'linear-gradient(90deg, #0284c7, #38bdf8)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* 数值 (以万为单位，清晰大字号) */}
            <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '95px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: index === 0 ? '#b45309' : '#0f172a', fontFamily: 'monospace' }}>
                {wan(row.points)}
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginLeft: '3px' }}>万</span>
              </div>
              <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>当月绩点</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -------------------------------------------------------------
// 1.0 核算员工作区总览看板（保持图1原生排版与风格）
// -------------------------------------------------------------
function AuditorDashboardView({
  state,
  onNavigate,
  onNavigateDataImport,
  onNavigateRanking,
}: {
  state: State;
  onNavigate: (tab: Tab) => void;
  onNavigateDataImport: () => void;
  onNavigateRanking: () => void;
}) {
  const published = state.plans.filter(plan => plan.status === 'published');
  const currentRep = report(state, nowMonth());
  const totalScore = total(currentRep.map(row => row.points));
  const starsData = calculateStars(state, { year: nowMonth().slice(0, 4), month: nowMonth() });

  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">EQUITY & MERIT PERFORMANCE</span>
          <h1>衡绩绩点考核，<br /><em>科学衡量每一份项目贡献。</em></h1>
          <p>从项目合同金额出发，支持多周期额度监控、月度/季度/年度之星评选、趋势与柱状图分析、专业组分类及 CSV 数据导入导出。</p>
          <div className="hero-actions">
            <button className="primary" onClick={onNavigateDataImport}>
              <Upload size={16} />数据导入
            </button>
            <button className="secondary" onClick={() => onNavigate('stars')}>
              <Trophy size={16} />查看考核之星
            </button>
            <button className="secondary" onClick={() => onNavigate('analytics')}>
              <TrendingUp size={16} />趋势与柱状图
            </button>
          </div>
        </div>
        <div className="formula-card">
          <span>考核核心规则</span>
          <strong>月度预算 × 成员当月分配率</strong>
          <div><b>100%</b><small>项目各月额度比例最终合计</small></div>
          <div><b>100%</b><small>每月项目成员比例严格分配</small></div>
          <div><b>3 大组</b><small>总体组 · 产品组 · 研发组</small></div>
        </div>
      </section>

      <section className="metrics">
        <article>
          <span>执行中项目</span>
          <strong>{state.projects.filter(p => p.status === 'active').length}</strong>
          <small>项目库共 {state.projects.length} 项</small>
        </article>
        <article>
          <span>合同总额</span>
          <strong>{wan(total(state.projects.map(p => p.contract)))}<i> 万元</i></strong>
          <small>全部项目含税总合同额</small>
        </article>
        <article>
          <span>本月已发布绩点</span>
          <strong>{score(totalScore)}</strong>
          <small>{published.filter(p => p.month === nowMonth()).length} 个月度计划已生效</small>
        </article>
        <article>
          <span>团队部门成员</span>
          <strong>{state.employees.filter(e => e.active).length}<i> 人</i></strong>
          <small>覆盖总体组、产品组与研发组</small>
        </article>
      </section>

      <div className="split">
        <div className="panel">
          <div className="panel-title">
            <div>
              <span>HONOR & STARS</span>
              <h2>本月之星 🌟 与年度领跑</h2>
            </div>
            <button className="text-button" onClick={() => onNavigate('stars')}>进入荣誉殿堂</button>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '28px' }}>🌟</div>
              <div>
                <span style={{ fontSize: '11px', color: '#854d0e', fontWeight: 600 }}>本月之星 ({nowMonth()})</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#142822' }}>
                  {starsData.monthStar.stars.length > 0
                    ? starsData.monthStar.stars.map(s => s.employee.name).join('、')
                    : '本月暂无已发布绩点'}
                </div>
                {starsData.monthStar.stars.length > 0 && (
                  <small style={{ color: '#71717a' }}>
                    获得 {score(starsData.monthStar.topPoints)} 绩点 · <GroupTag group={starsData.monthStar.stars[0].employee.group} />
                  </small>
                )}
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '28px' }}>👑</div>
              <div>
                <span style={{ fontSize: '11px', color: '#334155', fontWeight: 600 }}>年度之星领跑 ({nowMonth().slice(0, 4)}年)</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#142822' }}>
                  {starsData.yearStar.stars.length > 0
                    ? starsData.yearStar.stars.map(s => s.employee.name).join('、')
                    : '暂无年度发布记录'}
                </div>
                {starsData.yearStar.stars.length > 0 && (
                  <small style={{ color: '#71717a' }}>
                    累计 {score(starsData.yearStar.topPoints)} 绩点 · <GroupTag group={starsData.yearStar.stars[0].employee.group} />
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <div>
              <span>MONTHLY RANKING</span>
              <h2>{nowMonth()} 个人绩点前五名</h2>
            </div>
            <button className="text-button" onClick={onNavigateRanking}>查看完整报表</button>
          </div>
          <TopFiveRankingList rows={currentRep} />
        </div>
      </div>
    </>
  );
}

// -------------------------------------------------------------
// 核算员专属数据导入导出与灾备视图
// -------------------------------------------------------------
function AuditorDataIoView({
  state,
  auditorPackages,
  workspaceName = '',
  onImportPackages,
  onRemovePackage,
  onClearAllPackages,
  onExportFullBundle,
  triggerDownload,
  setNotice,
}: {
  state?: State | null;
  auditorPackages: ProjectMeritPackage[];
  workspaceName?: string;
  onImportPackages: (files: FileList | null | File[]) => Promise<void>;
  onRemovePackage: (projectId: string) => void;
  onClearAllPackages: () => void;
  onExportFullBundle: () => void;
  triggerDownload: (content: string, filename: string, mimeType?: string) => Promise<void>;
  setNotice: (msg: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const employees = state?.employees || [];
  const summary = useMemo(() => {
    return summarizeAuditorPackages(auditorPackages, employees);
  }, [auditorPackages, employees]);

  const deptContracts = useMemo(() => {
    return calculateDepartmentContracts(summary);
  }, [summary]);

  const handleExportEmployeesCsv = async () => {
    const csv = exportAuditorEmployeesCsv(summary);
    await triggerDownload(csv, `衡绩_全员跨项目绩点汇总表_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
    setNotice('全员跨项目绩点汇总表 CSV 导出成功');
  };

  const handleExportProjectsCsv = async () => {
    const csv = exportAuditorProjectsCsv(summary);
    await triggerDownload(csv, `衡绩_全部门合同额度对照表_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
    setNotice('全部门合同额度对照表 CSV 导出成功');
  };

  const handleExportMatrixCsv = async () => {
    const csv = exportAuditorMatrixCsv(summary);
    await triggerDownload(csv, `衡绩_全项目全员二维透视矩阵_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
    setNotice('全项目全员二维透视矩阵 CSV 导出成功');
  };

  const handleExportDetailsCsv = async () => {
    const csv = exportAuditorDetailsCsv(summary);
    await triggerDownload(csv, `衡绩_全量绩点分配流水明细_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
    setNotice('全量明细流水 CSV 导出成功');
  };

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".json"
        style={{ display: 'none' }}
        onChange={e => {
          onImportPackages(e.target.files);
          e.target.value = '';
        }}
      />

      <PageTitle
        eyebrow="DATA PACKAGES & BACKUP"
        title="核算员数据导入导出与系统灾备"
        description="支持批量导入多位项目负责人提交的分配数据包、多项目合并包及归档总包；支持导出全员跨项目汇总表等四大报表（统一以万元为单位），并提供工作区加密备份与灾备恢复。"
      />

      {/* 拖拽导入与选择文件专区 */}
      <div
        onDragOver={e => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            onImportPackages(e.dataTransfer.files);
          }
        }}
        style={{
          background: isDragging ? '#dcfce7' : '#ffffff',
          border: `2px dashed ${isDragging ? '#10b981' : '#cbd5e1'}`,
          borderRadius: '16px',
          padding: '32px 28px',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
          transition: 'all 0.2s',
        }}
      >
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Upload size={28} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
          项目分配数据包批量导入与智能识别
        </h3>
        <p style={{ color: '#64748b', fontSize: '13.5px', maxWidth: '640px', margin: '0 auto 20px', lineHeight: 1.6 }}>
          支持拖入或一次性选择多个单项目数据包（.json）、项目负责人多项目合并包或历史归档总包。系统将自动解包、校验合规性、按工号精准去重合并，并自动加密持久化保存。
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="primary"
            style={{ padding: '10px 22px', fontSize: '14px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} />
            选择数据包文件 (支持按住Ctrl多选)
          </button>
          {auditorPackages.length > 0 && (
            <button
              type="button"
              className="secondary"
              style={{ padding: '10px 18px', fontSize: '14px', color: '#ef4444', borderColor: '#fca5a5' }}
              onClick={() => {
                if (window.confirm('确定清空当前所有已导入的数据包吗？此操作将重置汇总大盘。')) {
                  onClearAllPackages();
                }
              }}
            >
              <RotateCcw size={15} />
              清空已导入数据包 ({auditorPackages.length})
            </button>
          )}
        </div>
      </div>

      {/* 已导入的数据包清单 */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '22px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={18} color="#059669" />
            <strong style={{ fontSize: '16px', color: '#0f172a' }}>已载入的项目数据包清单 ({auditorPackages.length} 个项目)</strong>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            已安全加密保存在工作区文件中，切换页面或重启软件不失效
          </span>
        </div>

        {auditorPackages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8', fontSize: '13.5px' }}>
            暂无已导入的数据包，请点击上方按钮或直接将 .json 文件拖拽进来
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
            {auditorPackages.map(pkg => (
              <div
                key={pkg.project.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13.5px' }}>
                    {pkg.project.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                    工作令号: <strong>{pkg.project.code || '无'}</strong> · 负责人: {pkg.project.ownerName}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#059669', marginTop: '2px' }}>
                    合同额度: {pkg.project.periodAllocatedWan} 万元 · 成员数: {pkg.memberSummaries.length} 人
                  </div>
                </div>

                <button
                  type="button"
                  className="icon-button"
                  style={{ width: 28, height: 28, color: '#ef4444' }}
                  onClick={() => {
                    if (window.confirm(`确定移除【${pkg.project.name}】的数据包吗？`)) {
                      onRemovePackage(pkg.project.id);
                    }
                  }}
                  title="移除该数据包"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 报表导出与总包归档 */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '22px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={18} color="#0284c7" />
          <strong style={{ fontSize: '16px', color: '#0f172a' }}>核算成果导出与全量归档（全量以万元为标准单位）</strong>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>👥 全员跨项目绩点汇总表 (CSV)</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                包含工号、姓名、专业组、参与项目数、累计获得总绩点（万元）。
              </div>
            </div>
            <button
              type="button"
              className="secondary"
              style={{ alignSelf: 'flex-start', padding: '6px 14px', fontSize: '12.5px' }}
              onClick={handleExportEmployeesCsv}
            >
              <Download size={14} /> 导出汇总表 CSV
            </button>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>💼 全部门合同额度对照表 (CSV)</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                各项目工作令号、合同总额(万)、已分配额度(万)、剩余额度(万)、消耗率。
              </div>
            </div>
            <button
              type="button"
              className="secondary"
              style={{ alignSelf: 'flex-start', padding: '6px 14px', fontSize: '12.5px' }}
              onClick={handleExportProjectsCsv}
            >
              <Download size={14} /> 导出额度表 CSV
            </button>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>⊞ 全项目全员二维透视矩阵 (CSV)</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                横向为项目工作令号与名称，纵向为员工姓名工号，支持行列双向求和验证。
              </div>
            </div>
            <button
              type="button"
              className="secondary"
              style={{ alignSelf: 'flex-start', padding: '6px 14px', fontSize: '12.5px' }}
              onClick={handleExportMatrixCsv}
            >
              <Download size={14} /> 导出透视矩阵 CSV
            </button>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>📜 全量绩点分配流水明细 (CSV)</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                包含跨项目、跨月份每笔成员分配比例、所得绩点（万元）与工作内容描述。
              </div>
            </div>
            <button
              type="button"
              className="secondary"
              style={{ alignSelf: 'flex-start', padding: '6px 14px', fontSize: '12.5px' }}
              onClick={handleExportDetailsCsv}
            >
              <Download size={14} /> 导出流水明细 CSV
            </button>
          </div>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px', gridColumn: '1 / -1' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#065f46', fontSize: '14.5px' }}>📦 核算汇总完整总包归档 (JSON)</div>
              <div style={{ fontSize: '12.5px', color: '#166534', marginTop: '4px' }}>
                一键打包全部项目的原始数据包集合、跨项目全员求和档案、合同额度大盘与透视矩阵。可直接发给部门分管领导查阅，或在任意电脑上的衡绩核算员工作区中直接重新导入恢复。
              </div>
            </div>
            <button
              type="button"
              className="primary"
              style={{ alignSelf: 'flex-start', padding: '8px 18px', fontSize: '13.5px', background: '#059669', borderColor: '#047857' }}
              onClick={onExportFullBundle}
            >
              <Download size={15} /> 导出核算汇总总包 (JSON)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 1. Dashboard View
// -------------------------------------------------------------
function DashboardView({
  state,

  onNavigate,
  onResetDemo,
  onOpenGuide,
}: {
  state: State;
  onNavigate(tab: Tab): void;
  onResetDemo(): void;
  onOpenGuide(step?: number): void;
}) {
  const published = state.plans.filter(plan => plan.status === 'published');
  const currentRep = report(state, nowMonth());
  const totalScore = total(currentRep.map(row => row.points));
  const starsData = calculateStars(state, { year: nowMonth().slice(0, 4), month: nowMonth() });

  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">EQUITY & MERIT PERFORMANCE</span>
          <h1>衡绩绩点考核，<br /><em>科学衡量每一份项目贡献。</em></h1>
          <p>从项目合同金额出发，支持多周期额度监控、月度/季度/年度之星评选、趋势图与柱状图分析、专业组分类及 CSV 数据导入导出。</p>
          <div className="hero-actions">
            <button className="primary" onClick={() => onNavigate('projects')}>
              <Plus size={16} />新建项目
            </button>
            <button className="secondary" onClick={() => onNavigate('stars')}>
              <Trophy size={16} />查看考核之星
            </button>
            <button className="secondary" onClick={() => onNavigate('analytics')}>
              <TrendingUp size={16} />趋势与柱状图
            </button>
            {state.projects.length === 0 && (
              <button className="accent-btn" onClick={onResetDemo}>
                <Sparkles size={16} />载入示例数据
              </button>
            )}
          </div>
        </div>
        <div className="formula-card">
          <span>考核核心规则</span>
          <strong>月度预算 × 成员当月分配率</strong>
          <div><b>100%</b><small>项目各月额度比例最终合计</small></div>
          <div><b>100%</b><small>每月项目成员比例严格分配</small></div>
          <div><b>3 大组</b><small>总体组 · 产品组 · 研发组</small></div>
        </div>
      </section>

      <section className="metrics">
        <article>
          <span>执行中项目</span>
          <strong>{state.projects.filter(p => p.status === 'active').length}</strong>
          <small>项目库共 {state.projects.length} 项</small>
        </article>
        <article>
          <span>合同总额</span>
          <strong>{wan(total(state.projects.map(p => p.contract)))}<i> 万元</i></strong>
          <small>全部项目含税总合同额</small>
        </article>
        <article>
          <span>本月已发布绩点</span>
          <strong>{score(totalScore)}</strong>
          <small>{published.filter(p => p.month === nowMonth()).length} 个月度计划已生效</small>
        </article>
        <article>
          <span>团队部门成员</span>
          <strong>{state.employees.filter(e => e.active).length}<i> 人</i></strong>
          <small>覆盖总体组、产品组与研发组</small>
        </article>
      </section>

      <div className="split">
        <div className="panel">
          <div className="panel-title">
            <div>
              <span>HONOR & STARS</span>
              <h2>本月之星 🌟 与年度领跑</h2>
            </div>
            <button className="text-button" onClick={() => onNavigate('stars')}>进入荣誉殿堂</button>
          </div>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '28px' }}>🌟</div>
              <div>
                <span style={{ fontSize: '11px', color: '#854d0e', fontWeight: 600 }}>本月之星 ({nowMonth()})</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#142822' }}>
                  {starsData.monthStar.stars.length > 0
                    ? starsData.monthStar.stars.map(s => s.employee.name).join('、')
                    : '本月暂无已发布绩点'}
                </div>
                {starsData.monthStar.stars.length > 0 && (
                  <small style={{ color: '#71717a' }}>
                    获得 {score(starsData.monthStar.topPoints)} 绩点 · <GroupTag group={starsData.monthStar.stars[0].employee.group} />
                  </small>
                )}
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '28px' }}>👑</div>
              <div>
                <span style={{ fontSize: '11px', color: '#334155', fontWeight: 600 }}>年度之星领跑 ({nowMonth().slice(0, 4)}年)</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#142822' }}>
                  {starsData.yearStar.stars.length > 0
                    ? starsData.yearStar.stars.map(s => s.employee.name).join('、')
                    : '暂无年度发布记录'}
                </div>
                {starsData.yearStar.stars.length > 0 && (
                  <small style={{ color: '#71717a' }}>
                    累计 {score(starsData.yearStar.topPoints)} 绩点 · <GroupTag group={starsData.yearStar.stars[0].employee.group} />
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            <div>
              <span>MONTHLY RANKING</span>
              <h2>{nowMonth()} 个人绩点前五名</h2>
            </div>
            <button className="text-button" onClick={() => onNavigate('reports')}>查看完整报表</button>
          </div>
          <TopFiveRankingList rows={currentRep} />
        </div>
      </div>
    </>
  );
}

// -------------------------------------------------------------
// 需求3 Modal: 一键批量为项目组设置项目成员和默认分配比例
// -------------------------------------------------------------
function BatchProjectTeamModal({
  isOpen,
  targetProjects,
  allProjects,
  state,
  projectGroups = [],
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  targetProjects: Project[];
  allProjects: Project[];
  state: State;
  projectGroups?: ProjectGroup[];
  onClose(): void;
  onConfirm(projectIds: string[], members: string[], defaultRates: Record<string, number>, ownerId?: string): Promise<void>;
}) {
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(() => targetProjects.map(p => p.id));
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [members, setMembers] = useState<string[]>(() => {
    if (targetProjects.length > 0 && targetProjects[0].members.length > 0) {
      return [...targetProjects[0].members];
    }
    return [];
  });
  const [leaderId, setLeaderId] = useState<string>(() => {
    if (targetProjects.length > 0 && targetProjects[0].owner) {
      return targetProjects[0].owner;
    }
    return '';
  });
  const [rates, setRates] = useState<Record<string, string>>(() => {
    const initRates: Record<string, string> = {};
    if (targetProjects.length > 0 && targetProjects[0].defaultRates) {
      for (const [id, r] of Object.entries(targetProjects[0].defaultRates)) {
        if (typeof r === 'number') {
          initRates[id] = (r / 100).toFixed(2).replace(/\.00$/, '');
        }
      }
    }
    return initRates;
  });
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [searchMember, setSearchMember] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const activeEmployees = state.employees.filter(e => e.active);
  const filteredEmployees = activeEmployees.filter(e => {
    if (filterGroup !== 'all' && !(e.group && e.group.includes(filterGroup))) return false;
    if (searchMember && !(e.name + e.department + (e.group || '')).toLowerCase().includes(searchMember.toLowerCase())) return false;
    return true;
  });

  const toggleProject = (pId: string) => {
    setSelectedProjectIds(prev => prev.includes(pId) ? prev.filter(id => id !== pId) : [...prev, pId]);
  };

  const toggleAllProjects = () => {
    if (selectedProjectIds.length === allProjects.length) {
      setSelectedProjectIds([]);
    } else {
      setSelectedProjectIds(allProjects.map(p => p.id));
    }
  };

  const toggleMember = (empId: string) => {
    setMembers(prev => {
      if (prev.includes(empId)) {
        const next = prev.filter(id => id !== empId);
        if (leaderId === empId) setLeaderId(next[0] || '');
        setRates(r => { const c = { ...r }; delete c[empId]; return c; });
        return next;
      } else {
        const next = [...prev, empId];
        if (!leaderId) setLeaderId(empId);
        return next;
      }
    });
  };

  const selectGroupMembers = (groupName: string) => {
    const groupEmps = activeEmployees.filter(e => e.group && e.group.includes(groupName)).map(e => e.id);
    const combined = Array.from(new Set([...members, ...groupEmps]));
    setMembers(combined);
    if (!leaderId && combined.length > 0) setLeaderId(combined[0]);
  };

  const handleApplyTemplate = (groupId: string) => {
    if (!groupId) return;
    const grp = projectGroups.find(g => g.id === groupId);
    if (!grp) return;
    const combined = Array.from(new Set([...members, ...grp.memberIds]));
    setMembers(combined);
    if (grp.leaderId) setLeaderId(grp.leaderId);
    if (grp.defaultRates) {
      const nextRates = { ...rates };
      for (const [id, r] of Object.entries(grp.defaultRates)) {
        if (typeof r === 'number') {
          nextRates[id] = (r / 100).toFixed(2).replace(/\.00$/, '');
        }
      }
      setRates(nextRates);
    }
  };

  const handleEqualShare = () => {
    if (members.length === 0) return;
    const n = members.length;
    const base = Math.floor(10000 / n);
    let remainder = 10000 - base * n;
    const nextRates: Record<string, string> = {};
    for (const id of members) {
      let share = base;
      if (remainder > 0) {
        share += 1;
        remainder -= 1;
      }
      nextRates[id] = (share / 100).toFixed(2).replace(/\.00$/, '');
    }
    setRates(nextRates);
  };

  const handleDistributeRemaining = () => {
    let sum = 0;
    for (const id of members) {
      const v = parseFloat(rates[id] || '0') || 0;
      sum += Math.round(v * 100);
    }
    const rem = 10000 - sum;
    if (rem === 0) return;
    const targetId = leaderId && members.includes(leaderId) ? leaderId : members[0];
    if (!targetId) return;
    const cur = rates[targetId] ? Math.round((parseFloat(rates[targetId]) || 0) * 100) : 0;
    const nextTotal = Math.max(0, cur + rem);
    setRates(prev => ({ ...prev, [targetId]: (nextTotal / 100).toFixed(2).replace(/\.00$/, '') }));
  };

  const handleResetRates = () => {
    setRates(Object.fromEntries(members.map(id => [id, ''])));
  };

  const totalRatePct = useMemo(() => {
    let sum = 0;
    for (const id of members) {
      const v = parseFloat(rates[id] || '0') || 0;
      sum += Math.round(v * 100);
    }
    return sum;
  }, [members, rates]);

  const handleSubmit = async () => {
    if (selectedProjectIds.length === 0) {
      setError('请至少勾选一个目标项目');
      return;
    }
    if (members.length === 0) {
      setError('请至少为项目组配置一名成员');
      return;
    }
    const finalLeader = leaderId && members.includes(leaderId) ? leaderId : members[0];
    const numericDefaultRates: Record<string, number> = {};
    for (const id of members) {
      const v = rates[id] ? toRate(rates[id]) : 0;
      if (v > 0) numericDefaultRates[id] = v;
    }

    try {
      setSaving(true);
      setError('');
      await onConfirm(selectedProjectIds, members, numericDefaultRates, finalLeader);
      onClose();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setSaving(false);
    }
  };

  const selectedProjects = allProjects.filter(p => selectedProjectIds.includes(p.id));

  if (!isOpen) return null;

  return (
    <Modal
      title="👥 一键批量配置项目组成员与默认分配比例"
      subtitle={`一键为选中的 ${selectedProjectIds.length} 个项目批量统一设置项目组成员、指定负责人并配置默认月度分配比例`}
      wide
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '4px 0' }}>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 12px', borderRadius: '8px', fontSize: '12.5px' }}>
            {error}
          </div>
        )}

        {/* 目标项目选择卡片 */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                📁 目标项目 (已选中 <b>{selectedProjectIds.length}</b> / {allProjects.length} 个):
              </span>
              <button
                type="button"
                className="text-button"
                style={{ fontSize: '12px', color: '#0284c7' }}
                onClick={() => setShowProjectSelector(!showProjectSelector)}
              >
                {showProjectSelector ? '收起项目清单 ▴' : '展开查看与修改 ▾'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer' }}
                onClick={toggleAllProjects}
              >
                {selectedProjectIds.length === allProjects.length ? '取消全选' : '全选所有项目'}
              </button>
            </div>
          </div>

          {!showProjectSelector && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px', maxHeight: '48px', overflowY: 'auto' }}>
              {selectedProjects.map(p => (
                <span
                  key={p.id}
                  style={{
                    background: '#e0f2fe',
                    color: '#0369a1',
                    fontSize: '11.5px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.code}</span>
                  <span>{p.name}</span>
                </span>
              ))}
              {selectedProjects.length === 0 && (
                <span style={{ color: '#dc2626', fontSize: '12px' }}>⚠️ 尚未选中任何项目，请展开项目清单进行勾选</span>
              )}
            </div>
          )}

          {showProjectSelector && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '6px', maxHeight: '140px', overflowY: 'auto', marginTop: '10px', paddingTop: '6px', borderTop: '1px solid #e2e8f0' }}>
              {allProjects.map(p => {
                const isChecked = selectedProjectIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: isChecked ? '#f0fdf4' : '#fff',
                      border: isChecked ? '1px solid #86efac' : '1px solid #e2e8f0',
                      padding: '4px 8px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '11.5px'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleProject(p.id)}
                    />
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#166534' }}>{p.code}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.name}>{p.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* 成员配置与专业组/模版快捷选择 */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                选择团队成员 (已选 <b>{members.length}</b> 人):
              </span>
              <button type="button" className="pill-btn" style={{ fontSize: '11px', padding: '2px 7px' }} onClick={() => selectGroupMembers('总体组')}>+总体组</button>
              <button type="button" className="pill-btn" style={{ fontSize: '11px', padding: '2px 7px' }} onClick={() => selectGroupMembers('产品组')}>+产品组</button>
              <button type="button" className="pill-btn" style={{ fontSize: '11px', padding: '2px 7px' }} onClick={() => selectGroupMembers('研发组')}>+研发组</button>
              <button type="button" className="pill-btn" style={{ fontSize: '11px', padding: '2px 7px' }} onClick={() => selectGroupMembers('领导班子')}>+领导班子</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {projectGroups.length > 0 && (
                <select
                  value=""
                  onChange={e => {
                    if (e.target.value) handleApplyTemplate(e.target.value);
                  }}
                  style={{ fontSize: '11.5px', padding: '3px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', background: '#fff' }}
                >
                  <option value="">📁 套用项目组模版...</option>
                  {projectGroups.map(cg => (
                    <option key={cg.id} value={cg.id}>
                      {cg.type === '技术交流组' ? '💡' : cg.type === '任务攻坚组' ? '🚀' : '📁'} {cg.name} ({cg.memberIds.length}人)
                    </option>
                  ))}
                </select>
              )}
              <input
                type="text"
                placeholder="搜索成员姓名..."
                value={searchMember}
                onChange={e => setSearchMember(e.target.value)}
                style={{ width: '120px', padding: '3px 8px', fontSize: '11.5px', height: '28px' }}
              />
              <div className="filter-pills" style={{ margin: 0 }}>
                {['all', '总体组', '产品组', '研发组'].map(g => (
                  <button
                    key={g}
                    type="button"
                    className={`pill-btn ${filterGroup === g ? 'active' : ''}`}
                    style={{ padding: '2px 7px', fontSize: '11px' }}
                    onClick={() => setFilterGroup(g)}
                  >
                    {g === 'all' ? '全部' : g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '6px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredEmployees.map(emp => {
              const selected = members.includes(emp.id);
              const isLeader = emp.id === leaderId;
              return (
                <div
                  key={emp.id}
                  onClick={() => toggleMember(emp.id)}
                  style={{
                    background: selected ? (isLeader ? '#fefce8' : '#ecfdf5') : '#fff',
                    border: selected ? (isLeader ? '1px solid #facc15' : '1px solid #10b981') : '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '5px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                      {isLeader && <span title="项目负责人">👑</span>}
                      <span>{emp.name}</span>
                      {emp.employeeNo ? (
                        <span style={{ fontSize: '10.5px', color: '#0284c7', fontFamily: 'monospace' }}>
                          [{emp.employeeNo}]
                        </span>
                      ) : !emp.id.startsWith('emp_') ? (
                        <span style={{ fontSize: '10.5px', color: '#0284c7', fontFamily: 'monospace' }}>
                          [{emp.id}]
                        </span>
                      ) : null}
                      <GroupTag group={emp.group} />
                    </div>
                    <small style={{ fontSize: '10px', color: '#64748b', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {emp.department}
                    </small>
                  </div>
                  {selected && <Check size={14} color={isLeader ? '#854d0e' : '#059669'} style={{ flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* 默认分配比例配置与负责人指定 */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                ⚡ 配置默认月度分配比例与项目负责人 (👑 点击冠标指定负责人):
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: totalRatePct === 10000 ? '#15803d' : '#b91c1c' }}>
                合计: {(totalRatePct / 100).toFixed(2)}% / 100%
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', padding: '2px 7px', fontSize: '11px', cursor: 'pointer' }}
                onClick={handleEqualShare}
                title="全员平分 100% 比例"
              >
                ⚖️ 全员平分
              </button>
              <button
                type="button"
                style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', padding: '2px 7px', fontSize: '11px', cursor: 'pointer' }}
                onClick={handleDistributeRemaining}
                title="将剩余未满 100% 比例补齐至负责人"
              >
                🎯 补齐剩余
              </button>
              <button
                type="button"
                style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', padding: '2px 7px', fontSize: '11px', color: '#64748b', cursor: 'pointer' }}
                onClick={handleResetRates}
                title="清空全部默认比例"
              >
                🔄 清零
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '6px', maxHeight: '140px', overflowY: 'auto', paddingTop: '4px' }}>
            {members.map(empId => {
              const emp = state.employees.find(e => e.id === empId);
              const isLeader = empId === leaderId;
              return (
                <div
                  key={empId}
                  style={{
                    background: isLeader ? '#fefce8' : '#fff',
                    border: isLeader ? '1px solid #facc15' : '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
                    <button
                      type="button"
                      className="icon-button"
                      style={{ width: 22, height: 22, padding: 0, color: isLeader ? '#b45309' : '#94a3b8' }}
                      title={isLeader ? '当前为项目负责人' : '点击设为项目负责人'}
                      onClick={() => setLeaderId(empId)}
                    >
                      <Crown size={13} fill={isLeader ? '#facc15' : 'none'} />
                    </button>
                    <span style={{ fontSize: '12px', fontWeight: isLeader ? 700 : 500, color: '#1e293b' }}>
                      {emp?.name || empId}
                      {emp?.employeeNo ? (
                        <span style={{ fontSize: '10.5px', color: '#0284c7', marginLeft: '4px', fontFamily: 'monospace' }}>
                          [{emp.employeeNo}]
                        </span>
                      ) : !empId.startsWith('emp_') ? (
                        <span style={{ fontSize: '10.5px', color: '#0284c7', marginLeft: '4px', fontFamily: 'monospace' }}>
                          [{empId}]
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div
                    className="suffix-input"
                    style={{ width: '82px', height: '28px' }}
                    onClick={e => {
                      const input = e.currentTarget.querySelector('input');
                      if (input && document.activeElement !== input) input.focus();
                    }}
                  >
                    <input
                      type="text"
                      inputMode="decimal"
                      value={rates[empId] || ''}
                      onChange={e => setRates(prev => ({ ...prev, [empId]: e.target.value }))}
                      placeholder="0.00"
                      style={{ textAlign: 'right', fontSize: '12px', height: '26px' }}
                    />
                    <span>%</span>
                  </div>
                </div>
              );
            })}
            {members.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                尚未选择任何项目组成员，请从上方勾选员工或套用模版
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '6px' }}>
          <button type="button" className="secondary" onClick={onClose} disabled={saving}>
            取消
          </button>
          <button type="button" className="primary" onClick={handleSubmit} disabled={saving}>
            <Save size={15} />
            {saving ? '正在批量应用...' : `一键批量应用至 ${selectedProjectIds.length} 个项目`}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// -------------------------------------------------------------
// 2. Projects View (项目库与额度管理：支持多样式布局阅览、删除、多维排序与筛选)
// -------------------------------------------------------------
function ProjectsView({ state, isAdmin, isManager, currentActorId, projectGroups = [], onAdd, onEdit, onDelete, onBatchDelete, onViewDetail, onOpenQuotaSchedule, onArchive, onImportProjects, onBatchConfigureTeam, onExportPackage, onExportManagerAllPackages }: {
  state: State;
  isAdmin: boolean;
  isManager: boolean;
  currentActorId: string;
  projectGroups?: ProjectGroup[];
  onAdd(): void;
  onEdit(project: Project): void;
  onDelete(project: Project): void;
  onBatchDelete(ids: string[]): void;
  onViewDetail(projectId: string): void;
  onOpenQuotaSchedule?(projectId: string): void;
  onArchive(project: Project): void;
  onImportProjects(projects: any[]): Promise<void>;
  onBatchConfigureTeam?(projectIds: string[], members: string[], defaultRates: Record<string, number>, ownerId?: string): Promise<void>;
  onExportPackage?(projectId: string): void;
  onExportManagerAllPackages?(managerId?: string): void;
}) {
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [quotaFilter, setQuotaFilter] = useState<'all' | 'full' | 'partial' | 'zero'>('all');
  const [layoutMode, setLayoutMode] = useState<'grouped' | 'table' | 'cards'>(() => {
    try { return (localStorage.getItem('merit_proj_layout') as any) || 'grouped'; } catch { return 'grouped'; }
  });
  const [sortMode, setSortMode] = useState<'code_asc' | 'contract_desc' | 'contract_asc' | 'remaining_desc' | 'start_desc' | 'name_asc'>('code_asc');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [batchTeamTargetProjects, setBatchTeamTargetProjects] = useState<Project[] | null>(null);
  const prjCsvInputRef = useRef<HTMLInputElement>(null);

  const handleSetLayout = (mode: 'grouped' | 'table' | 'cards') => {
    setLayoutMode(mode);
    try { localStorage.setItem('merit_proj_layout', mode); } catch {}
  };

  const toggleGroup = (code: string) => {
    setExpandedGroups(c => ({ ...c, [code]: c[code] === false ? true : false }));
  };

  const handlePrjCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async evt => {
      try {
        const text = evt.target?.result as string;
        const list = parseProjectCsvText(text, state);
        if (list.length === 0) throw new Error('未在 CSV 中解析到有效项目数据');
        await onImportProjects(list);
      } catch (err) {
        alert(errorText(err));
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const filtered = useMemo(() => {
    return state.projects.filter(p => {
      if (filter !== 'all' && p.status !== filter) return false;
      if (search && !(p.name + p.code + p.client).toLowerCase().includes(search.toLowerCase())) return false;
      if (quotaFilter !== 'all') {
        const d = projectAllocDetail(state, p.id);
        const rate = d?.totalBudgetRate || 0;
        if (quotaFilter === 'full' && rate < 10000) return false;
        if (quotaFilter === 'partial' && (rate <= 0 || rate >= 10000)) return false;
        if (quotaFilter === 'zero' && rate > 0) return false;
      }
      return true;
    });
  }, [state, filter, search, quotaFilter]);

  const sortedProjects = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      if (sortMode === 'code_asc') {
        const cComp = a.code.localeCompare(b.code, undefined, { numeric: true });
        return cComp !== 0 ? cComp : a.name.localeCompare(b.name);
      }
      if (sortMode === 'contract_desc') return b.contract - a.contract;
      if (sortMode === 'contract_asc') return a.contract - b.contract;
      if (sortMode === 'remaining_desc') {
        const remA = projectAllocDetail(state, a.id)?.remainingAmount || 0;
        const remB = projectAllocDetail(state, b.id)?.remainingAmount || 0;
        return remB - remA;
      }
      if (sortMode === 'start_desc') return b.start.localeCompare(a.start);
      if (sortMode === 'name_asc') return a.name.localeCompare(b.name);
      return 0;
    });
    return list;
  }, [filtered, sortMode, state]);

  // 按工作令号聚合分组
  const groups = useMemo(() => {
    const map = new Map<string, Project[]>();
    for (const p of sortedProjects) {
      if (!map.has(p.code)) map.set(p.code, []);
      map.get(p.code)!.push(p);
    }
    return Array.from(map.entries()).map(([code, list]) => {
      const totalContract = total(list.map(p => p.contract));
      let totalAllocated = 0;
      let totalPublished = 0;
      for (const p of list) {
        const d = projectAllocDetail(state, p.id);
        if (d) {
          totalAllocated += d.totalAllocatedAmount;
          totalPublished += d.publishedAmount;
        }
      }
      const pctNum = totalContract > 0 ? (totalAllocated / totalContract) * 100 : 0;
      return {
        code,
        projects: list,
        totalContract,
        totalContractWan: wan(totalContract),
        totalAllocatedWan: wan(totalAllocated),
        totalPublishedWan: wan(totalPublished),
        pctNum: Math.min(100, Number(pctNum.toFixed(1))),
      };
    });
  }, [sortedProjects, state]);

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedProjects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedProjects.map(p => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id]);
  };

  return (
    <section className="panel full">
      <PageTitle
        eyebrow="PROJECT QUOTA & MANAGEMENT"
        title="项目库与额度管理"
        description="实时监控每个项目的已分配额度与明细、剩余额度和比例；提供令号分组、紧凑表格与卡片网格多样式排版，支持多选批量管理与删除。"
        action={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input type="file" ref={prjCsvInputRef} accept=".csv" style={{ display: 'none' }} onChange={handlePrjCsv} />
            {isAdmin && onBatchConfigureTeam && (
              <button
                className="secondary"
                style={{ color: '#166534', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                onClick={() => setBatchTeamTargetProjects(selectedIds.length > 0 ? state.projects.filter(p => selectedIds.includes(p.id)) : sortedProjects)}
                title="一键批量为多个项目配置成员名单、指定负责人与默认月度分配比例"
              >
                <Users size={15} />一键批量配置项目组与比例
              </button>
            )}
            {isAdmin && (
              <button className="secondary" onClick={() => prjCsvInputRef.current?.click()}>
                <Upload size={15} />导入项目合同(CSV格式)
              </button>
            )}
            {onExportManagerAllPackages && (
              <button
                className="secondary"
                style={{
                  color: '#065f46',
                  background: '#ecfdf5',
                  borderColor: '#a7f3d0',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onClick={() => onExportManagerAllPackages()}
                title="导出项目分配绩点数据包（发给核算员一键导入与汇总）"
              >
                <Package size={15} color="#059669" />
                导出项目数据包
              </button>
            )}
            {isAdmin && (
              <button className="primary" onClick={onAdd}>
                <Plus size={16} />新建项目
              </button>
            )}
          </div>
        }
      />

      {/* 多功能工具栏：筛选、排序与多样式切换 */}
      <div className="toolbar" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {/* 项目状态标签 */}
          <div className="filter-tabs">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
              全部项目 ({state.projects.length})
            </button>
            <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>
              执行中 ({state.projects.filter(p => p.status === 'active').length})
            </button>
            <button className={filter === 'archived' ? 'active' : ''} onClick={() => setFilter('archived')}>
              已结项 ({state.projects.filter(p => p.status === 'archived').length})
            </button>
          </div>

          {/* 排序方式与布局模式切换 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="sort-select-wrapper">
              <ArrowUpDown size={13} color="#64748b" />
              <select value={sortMode} onChange={e => setSortMode(e.target.value as any)}>
                <option value="code_asc">按工作令号排序</option>
                <option value="contract_desc">合同金额：从高到低</option>
                <option value="contract_asc">合同金额：从低到高</option>
                <option value="remaining_desc">剩余额度：从高到低</option>
                <option value="start_desc">开始月份：从新到旧</option>
                <option value="name_asc">项目名称 (A-Z)</option>
              </select>
            </div>

            <div className="layout-tabs">
              <button
                type="button"
                className={`layout-btn ${layoutMode === 'grouped' ? 'active' : ''}`}
                onClick={() => handleSetLayout('grouped')}
                title="按工作令号聚合子项目（适合令号多子项目阅览）"
              >
                <FolderKanban size={13} />令号分组
              </button>
              <button
                type="button"
                className={`layout-btn ${layoutMode === 'table' ? 'active' : ''}`}
                onClick={() => handleSetLayout('table')}
                title="紧凑表格列表（高密度阅览）"
              >
                <Table2 size={13} />紧凑表格
              </button>
              <button
                type="button"
                className={`layout-btn ${layoutMode === 'cards' ? 'active' : ''}`}
                onClick={() => handleSetLayout('cards')}
                title="标准卡片网格"
              >
                <LayoutGrid size={13} />卡片网格
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {/* 额度进度快捷筛选 */}
          <div className="filter-tabs" style={{ fontSize: '12px' }}>
            <button className={quotaFilter === 'all' ? 'active' : ''} onClick={() => setQuotaFilter('all')}>
              全部额度状态
            </button>
            <button className={quotaFilter === 'full' ? 'active' : ''} onClick={() => setQuotaFilter('full')}>
              全额规划完毕 (100%)
            </button>
            <button className={quotaFilter === 'partial' ? 'active' : ''} onClick={() => setQuotaFilter('partial')}>
              规划中 (1%-99%)
            </button>
            <button className={quotaFilter === 'zero' ? 'active' : ''} onClick={() => setQuotaFilter('zero')}>
              尚未规划 (0%)
            </button>
          </div>

          {/* 搜索框 */}
          <div className="search-input-wrapper" style={{ width: '280px' }}>
            <Search size={15} color="#82928a" />
            <input placeholder="搜索工作令号、项目名称或客户..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="icon-button" style={{ width: 20, height: 20 }} onClick={() => setSearch('')}><X size={12} /></button>}
          </div>
        </div>
      </div>

      {/* 样式 1：按工作令号聚合分组视图（最适合多子项目阅览） */}
      {layoutMode === 'grouped' && (
        <div className="order-group-list">
          {groups.map(grp => {
            const isExpanded = expandedGroups[grp.code] !== false;
            return (
              <div className="order-group-card" key={grp.code}>
                <div className="order-group-header" onClick={() => toggleGroup(grp.code)}>
                  <div className="order-group-title">
                    <span className="order-badge">令号: {grp.code}</span>
                    <span className="order-subprojects-count">{grp.projects.length} 个子项目/构件</span>
                    <span className="order-total-amount">合计金额：{grp.totalContractWan} 万元</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '200px' }}>
                      <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${grp.pctNum}%`, height: '100%', background: '#16a34a' }} />
                      </div>
                      <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>{grp.pctNum}% 已规划</span>
                    </div>
                    <button className="icon-button" style={{ width: 26, height: 26 }} onClick={e => { e.stopPropagation(); toggleGroup(grp.code); }}>
                      {!isExpanded ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="order-group-content">
                    <table className="subprojects-table">
                      <thead>
                        <tr>
                          <th>项目名称</th>
                          <th>客户主体</th>
                          <th>合同金额(万元)</th>
                          <th>项目负责人</th>
                          <th>项目周期</th>
                          <th>额度规划进度</th>
                          <th>状态</th>
                          <th style={{ textAlign: 'right' }}>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grp.projects.map(p => {
                          const detail = projectAllocDetail(state, p.id);
                          const ownerEmp = state.employees.find(e => e.id === p.owner);
                          return (
                            <tr key={p.id}>
                              <td>
                                <b style={{ color: '#0f172a', fontSize: '13px' }}>{p.name}</b>
                              </td>
                              <td style={{ color: p.client ? '#475569' : '#94a3b8' }}>{p.client || '自研/内部'}</td>
                              <td><b style={{ color: '#166534' }}>{wan(p.contract)} 万元</b></td>
                              <td>{ownerEmp?.name} <GroupTag group={ownerEmp?.group} /></td>
                              <td style={{ fontSize: '11px', color: '#64748b' }}>{p.start} 至 {p.end || '待定/持续'}</td>
                              <td>
                                {detail && (() => {
                                  const grandRate = (detail.historyCompletedRate || 0) + detail.totalBudgetRate;
                                  const grandPct = pct(grandRate);
                                  return (
                                    <div className="compact-progress-cell">
                                      <div className="compact-progress-track">
                                        {detail.isHistorical && detail.historyCompletedRate > 0 && (
                                          <div
                                            className="compact-progress-fill"
                                            style={{ width: `${Math.min(100, detail.historyCompletedRate / 100)}%`, background: '#0284c7' }}
                                            title={`历史已完成: ${detail.historyCompletedAmountWan}万 (${detail.historyCompletedPct})`}
                                          />
                                        )}
                                        <div
                                          className="compact-progress-fill"
                                          style={{ width: `${Math.min(100, detail.publishedBudgetRate / 100)}%`, background: '#15803d' }}
                                          title={`本系统已发布: ${detail.publishedWan}万 (${detail.publishedBudgetPct})`}
                                        />
                                        <div
                                          className="compact-progress-fill"
                                          style={{ width: `${Math.min(100, detail.draftBudgetRate / 100)}%`, background: '#f59e0b' }}
                                          title={`本系统草稿待发布: ${detail.draftWan}万 (${detail.draftBudgetPct})`}
                                        />
                                      </div>
                                      <span
                                        style={{ fontSize: '11px', color: '#475569', minWidth: '42px' }}
                                        title={detail.isHistorical && detail.historyCompletedRate > 0
                                          ? `全周期总进度: ${grandPct} (历史已完成 ${detail.historyCompletedPct} + 本系统分配 ${detail.totalBudgetPct})`
                                          : `已规划分配: ${detail.totalBudgetPct}`}
                                      >
                                        {grandPct}
                                      </span>
                                    </div>
                                  );
                                })()}
                              </td>
                              <td>
                                <Badge tone={p.status === 'active' ? 'green' : 'gray'}>
                                  {p.status === 'active' ? '执行中' : '已结项'}
                                </Badge>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                  <button style={{ padding: '3px 8px', fontSize: '11.5px' }} onClick={() => onViewDetail(p.id)}><Eye size={12} />明细</button>
                                  {onOpenQuotaSchedule && (
                                    <button style={{ padding: '3px 8px', fontSize: '11.5px', color: '#0369a1', background: '#f0f9ff', borderColor: '#bae6fd' }} onClick={() => onOpenQuotaSchedule(p.id)} title="全周期月度额度规划与执行透视，预防前期超支透支">
                                      <CalendarRange size={12} />额度规划
                                    </button>
                                  )}
                                  {onExportPackage && (
                                    <button style={{ padding: '3px 8px', fontSize: '11.5px', color: '#7c3aed', background: '#f5f3ff', borderColor: '#ddd6fe' }} onClick={() => onExportPackage(p.id)} title="导出本项目分配数据包（含个人总和、明细及额度情况），发送给核算员汇总">
                                      <Download size={12} />数据包
                                    </button>
                                  )}
                                  {isAdmin && onBatchConfigureTeam && (
                                    <button style={{ padding: '3px 8px', fontSize: '11.5px', color: '#166534' }} onClick={() => setBatchTeamTargetProjects([p])} title="为该项目配置成员名单与默认分配比例">
                                      <Users size={12} />组员与比例
                                    </button>
                                  )}
                                  {isAdmin && <button style={{ padding: '3px 8px', fontSize: '11.5px' }} onClick={() => onEdit(p)}><Pencil size={12} />编辑</button>}
                                  {isAdmin && <button style={{ padding: '3px 8px', fontSize: '11.5px' }} onClick={() => onArchive(p)}>{p.status === 'active' ? '结项' : '恢复'}</button>}
                                  {isAdmin && <button className="danger-btn" onClick={() => onDelete(p)}><Trash2 size={12} />删除</button>}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
          {groups.length === 0 && <Empty text="未找到符合条件的项目" />}
        </div>
      )}

      {/* 样式 2：紧凑高密表格视图（适合单屏查看数十个项目，并支持批量删除与批量组配置） */}
      {layoutMode === 'table' && (
        <div className="compact-project-table-box">
          {selectedIds.length > 0 && (
            <div style={{ background: '#f0fdf4', padding: '10px 16px', borderBottom: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12.5px', color: '#166534', fontWeight: 600 }}>
                已选择 {selectedIds.length} 个项目
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {isAdmin && onBatchConfigureTeam && (
                  <button
                    className="primary"
                    style={{ padding: '5px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => setBatchTeamTargetProjects(state.projects.filter(p => selectedIds.includes(p.id)))}
                    title="为选中的项目批量设置项目组成员和默认分配比例"
                  >
                    <Users size={13} /> 批量配置项目成员与默认比例 ({selectedIds.length})
                  </button>
                )}
                {isAdmin && (
                  <button className="danger-btn" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => onBatchDelete(selectedIds)}>
                    <Trash2 size={13} /> 批量删除选中的 {selectedIds.length} 个项目
                  </button>
                )}
                <button className="secondary" style={{ padding: '5px 12px', fontSize: '12px' }} onClick={() => setSelectedIds([])}>
                  取消全选
                </button>
              </div>
            </div>
          )}
          <table className="compact-table">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: 'center' }}>
                  <input type="checkbox" checked={selectedIds.length === sortedProjects.length && sortedProjects.length > 0} onChange={toggleSelectAll} />
                </th>
                <th>工作令号</th>
                <th>项目名称</th>
                <th>客户主体</th>
                <th>合同金额(万元)</th>
                <th>项目负责人</th>
                <th>项目周期</th>
                <th>已规划额度(万元)</th>
                <th>剩余额度(万元)</th>
                <th>状态</th>
                <th style={{ textAlign: 'right' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedProjects.map(p => {
                const detail = projectAllocDetail(state, p.id);
                const ownerEmp = state.employees.find(e => e.id === p.owner);
                const isSelected = selectedIds.includes(p.id);
                return (
                  <tr key={p.id} style={{ background: isSelected ? '#f8fafc' : undefined }}>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelectOne(p.id)} />
                    </td>
                    <td><span style={{ fontWeight: 600, color: '#166534', fontFamily: 'monospace' }}>{p.code}</span></td>
                    <td>
                      <b style={{ color: '#0f172a', cursor: 'pointer' }} onClick={() => onViewDetail(p.id)} title="点击查看额度明细">
                        {p.name}
                      </b>
                    </td>
                    <td style={{ color: p.client ? '#475569' : '#94a3b8' }}>{p.client || '自研/内部'}</td>
                    <td><b>{wan(p.contract)} 万元</b></td>
                    <td>{ownerEmp?.name} <GroupTag group={ownerEmp?.group} /></td>
                    <td style={{ fontSize: '11px', color: '#64748b' }}>{p.start} 至 {p.end || '待定'}</td>
                    <td>
                      {detail && (() => {
                        const grandRate = (detail.historyCompletedRate || 0) + detail.totalBudgetRate;
                        const grandPct = pct(grandRate);
                        return (
                          <div className="compact-progress-cell">
                            <div className="compact-progress-track">
                              {detail.isHistorical && detail.historyCompletedRate > 0 && (
                                <div
                                  className="compact-progress-fill"
                                  style={{ width: `${Math.min(100, detail.historyCompletedRate / 100)}%`, background: '#0284c7' }}
                                  title={`历史已完成: ${detail.historyCompletedAmountWan}万 (${detail.historyCompletedPct})`}
                                />
                              )}
                              <div
                                className="compact-progress-fill"
                                style={{ width: `${Math.min(100, detail.publishedBudgetRate / 100)}%`, background: '#15803d' }}
                                title={`本系统已发布: ${detail.publishedWan}万 (${detail.publishedBudgetPct})`}
                              />
                              <div
                                className="compact-progress-fill"
                                style={{ width: `${Math.min(100, detail.draftBudgetRate / 100)}%`, background: '#f59e0b' }}
                                title={`本系统草稿待发布: ${detail.draftWan}万 (${detail.draftBudgetPct})`}
                              />
                            </div>
                            <span
                              style={{ fontSize: '11px', color: '#475569', minWidth: '42px' }}
                              title={detail.isHistorical && detail.historyCompletedRate > 0
                                ? `全周期总进度: ${grandPct} (历史已完成 ${detail.historyCompletedPct} + 本系统分配 ${detail.totalBudgetPct})`
                                : `已规划分配: ${detail.totalBudgetPct}`}
                            >
                              {grandPct}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{detail ? `${detail.remainingWan} 万` : '—'}</td>
                    <td>
                      <Badge tone={p.status === 'active' ? 'green' : 'gray'}>
                        {p.status === 'active' ? '执行中' : '已结项'}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button style={{ padding: '3px 8px', fontSize: '11.5px' }} onClick={() => onViewDetail(p.id)}><Eye size={12} />明细</button>
                        {onOpenQuotaSchedule && (
                          <button style={{ padding: '3px 8px', fontSize: '11.5px', color: '#0369a1', background: '#f0f9ff', borderColor: '#bae6fd' }} onClick={() => onOpenQuotaSchedule(p.id)} title="全周期月度额度规划与执行透视，预防前期超支透支">
                            <CalendarRange size={12} />额度规划
                          </button>
                        )}
                        {onExportPackage && (
                          <button style={{ padding: '3px 8px', fontSize: '11.5px', color: '#7c3aed', background: '#f5f3ff', borderColor: '#ddd6fe' }} onClick={() => onExportPackage(p.id)} title="导出本项目分配数据包，发送给核算员汇总">
                            <Download size={12} />数据包
                          </button>
                        )}
                        {isAdmin && onBatchConfigureTeam && (
                          <button style={{ padding: '3px 8px', fontSize: '11.5px', color: '#166534' }} onClick={() => setBatchTeamTargetProjects([p])} title="为该项目配置成员名单与默认分配比例">
                            <Users size={12} />组员与比例
                          </button>
                        )}
                        {isAdmin && <button style={{ padding: '3px 8px', fontSize: '11.5px' }} onClick={() => onEdit(p)}><Pencil size={12} />编辑</button>}
                        {isAdmin && <button style={{ padding: '3px 8px', fontSize: '11.5px' }} onClick={() => onArchive(p)}>{p.status === 'active' ? '结项' : '恢复'}</button>}
                        {isAdmin && <button className="danger-btn" onClick={() => onDelete(p)}><Trash2 size={12} />删除</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedProjects.length === 0 && (
                <tr><td colSpan={11}><Empty text="未找到符合条件的项目" /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 样式 3：标准大卡片网格视图 */}
      {layoutMode === 'cards' && (
        <div className="project-grid">
          {sortedProjects.map(project => {
            const detail = projectAllocDetail(state, project.id);
            const owner = ownerSummary(state, project);
            const [low, high] = range(project.contract);
            const ownerEmp = state.employees.find(e => e.id === project.owner);

            return (
              <article className="project-card" key={project.id}>
                <header>
                  <div>
                    <span style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>工作令号: {project.code}</span>
                    <h3>{project.name}</h3>
                  </div>
                  <Badge tone={project.status === 'active' ? 'green' : 'gray'}>
                    {project.status === 'active' ? '执行中' : '已结项'}
                  </Badge>
                </header>

                <p style={{ color: project.client ? '#4b5563' : '#9ca3af' }}>{project.client ? `客户：${project.client}` : '客户：未指定（自研/内部项目）'}</p>

                <div className="project-facts">
                  <div>
                    <span>合同总额</span>
                    <strong>{wan(project.contract)} 万元</strong>
                  </div>
                  <div>
                    <span>项目周期</span>
                    <strong>{project.start} 至 {project.end || '持续推进/待定'}</strong>
                  </div>
                  <div>
                    <span>负责人</span>
                    <strong>{ownerEmp?.name} <GroupTag group={ownerEmp?.group} /></strong>
                  </div>
                  <div>
                    <span>项目成员</span>
                    <strong>{project.members.length} 人</strong>
                  </div>
                </div>

                {detail && (() => {
                  const grandRate = (detail.historyCompletedRate || 0) + detail.totalBudgetRate;
                  const grandPct = pct(grandRate);
                  return (
                    <div className="quota-meter">
                      <div className="quota-meter-header">
                        <span>
                          {detail.isHistorical && detail.historyCompletedRate > 0 ? (
                            <>全周期进度: <strong>{grandPct}</strong> (含历史{detail.historyCompletedPct})</>
                          ) : (
                            <>已规划: <strong>{detail.totalBudgetPct}</strong> ({detail.totalAllocatedWan}万)</>
                          )}
                        </span>
                        <span>剩余: <strong>{detail.remainingPct}</strong> ({detail.remainingWan}万)</span>
                      </div>
                      <div className="quota-bar-track">
                        {detail.isHistorical && detail.historyCompletedRate > 0 && (
                          <div
                            className="quota-bar-fill"
                            style={{ width: `${detail.historyCompletedRate / 100}%`, background: '#0284c7' }}
                            title={`历史已完成: ${detail.historyCompletedAmountWan}万 (${detail.historyCompletedPct})`}
                          />
                        )}
                        <div className="quota-bar-fill quota-bar-published" style={{ width: `${detail.publishedBudgetRate / 100}%` }} title={`已发布: ${detail.publishedBudgetPct}`} />
                        <div className="quota-bar-fill quota-bar-draft" style={{ width: `${detail.draftBudgetRate / 100}%` }} title={`草稿待发布: ${detail.draftBudgetPct}`} />
                        <div className="quota-bar-fill quota-bar-remaining" style={{ width: `${detail.remainingRate / 100}%` }} title={`剩余未分配: ${detail.remainingPct}`} />
                      </div>
                      <div className="quota-meter-legend">
                        {detail.isHistorical && detail.historyCompletedRate > 0 && (
                          <span><i style={{ background: '#0284c7' }} />历史已完成 {detail.historyCompletedPct}</span>
                        )}
                        <span><i style={{ background: '#15803d' }} />已发布 {detail.publishedBudgetPct}</span>
                        <span><i style={{ background: '#f59e0b' }} />待发布 {detail.draftBudgetPct}</span>
                        <span><i style={{ background: '#cbd5e1' }} />剩余 {detail.remainingPct}</span>
                      </div>
                    </div>
                  );
                })()}

                <div className={`owner-check ${!owner.valid ? 'ref-warn' : 'ref-ok'}`}>
                  <span>负责人累计占比 {pct(owner.rate)}</span>
                  <small>参考区间: {pct(low)}–{pct(high)} {!owner.valid ? '(供参考)' : '(建议范围内)'}</small>
                </div>

                <footer>
                  <button onClick={() => onViewDetail(project.id)}>
                    <Eye size={14} />额度明细与分润
                  </button>
                  {onOpenQuotaSchedule && (
                    <button style={{ color: '#0369a1' }} onClick={() => onOpenQuotaSchedule(project.id)} title="全周期月度额度规划与执行透视，预防前期超支透支">
                      <CalendarRange size={14} />额度规划
                    </button>
                  )}
                  {onExportPackage && (
                    <button style={{ color: '#7c3aed', background: '#f5f3ff', borderColor: '#ddd6fe' }} onClick={() => onExportPackage(project.id)} title="导出本项目分配数据包，发送给核算员汇总">
                      <Download size={14} />导出数据包
                    </button>
                  )}
                  {isAdmin && onBatchConfigureTeam && (
                    <button onClick={() => setBatchTeamTargetProjects([project])} title="为该项目配置成员名单与默认分配比例">
                      <Users size={14} />组员与比例
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => onEdit(project)}>
                      <Pencil size={14} />编辑
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => onArchive(project)}>
                      {project.status === 'active' ? '结项' : '恢复'}
                    </button>
                  )}
                  {isAdmin && (
                    <button className="danger-btn" onClick={() => onDelete(project)} title="永久删除该项目">
                      <Trash2 size={13} />删除
                    </button>
                  )}
                </footer>
              </article>
            );
          })}
          {sortedProjects.length === 0 && <Empty text="未找到符合条件的项目" />}
        </div>
      )}

      {/* 需求3：一键批量为项目组设置项目成员和默认分配比例弹窗 */}
      {batchTeamTargetProjects && (
        <BatchProjectTeamModal
          isOpen={!!batchTeamTargetProjects}
          targetProjects={batchTeamTargetProjects}
          allProjects={state.projects}
          state={state}
          projectGroups={projectGroups}
          onClose={() => setBatchTeamTargetProjects(null)}
          onConfirm={async (pIds, mems, rts, ownerId) => {
            if (onBatchConfigureTeam) {
              await onBatchConfigureTeam(pIds, mems, rts, ownerId);
            }
          }}
        />
      )}
    </section>
  );
}

// -------------------------------------------------------------
// 需求1 Modal: Project Detail Realtime Quota & Breakdown
// -------------------------------------------------------------
function ProjectDetailModal({ state, projectId, onClose, onOpenQuotaSchedule, onExportPackage }: {
  state: State;
  projectId: string;
  onClose(): void;
  onOpenQuotaSchedule?(projectId: string): void;
  onExportPackage?(projectId: string): void;
}) {
  const detail = projectAllocDetail(state, projectId);
  if (!detail) return null;
  const project = detail.project;
  const perspective = getProjectQuotaPerspective(state, projectId);

  return (
    <Modal title={`${project.name} · 额度实时监控与明细`} subtitle={`工作令号: ${project.code} · 周期: ${project.start} 至 ${project.end || '持续推进/待定'} · 合同金额 ${detail.contractWan} 万元`} wide onClose={onClose}>
      <div className="modal-body">
        {/* 顶部实时额度看板 */}
        <div className="metrics" style={{ margin: '0 0 20px' }}>
          <article>
            <span>合同总额</span>
            <strong>{detail.contractWan}<i> 万元</i></strong>
            <small>基准考核总额度</small>
          </article>
          {detail.isHistorical && (
            <article style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
              <span>历史已完成额度</span>
              <strong style={{ color: '#0369a1' }}>{detail.historyCompletedAmountWan}<i> 万元</i></strong>
              <small>历史占比 {detail.historyCompletedPct}</small>
            </article>
          )}
          <article>
            <span>系统内已规划分配</span>
            <strong style={{ color: '#166534' }}>{detail.totalAllocatedWan}<i> 万元</i></strong>
            <small>系统占比 {detail.totalBudgetPct}</small>
          </article>
          <article>
            <span>后续剩余可分配额度</span>
            <strong style={{ color: detail.remainingRate > 0 ? '#b45309' : '#475569' }}>
              {detail.remainingWan}<i> 万元</i>
            </strong>
            <small>剩余比例 {detail.remainingPct}</small>
          </article>
        </div>

        {/* 额度条 */}
        <div className="quota-meter" style={{ marginBottom: '24px' }}>
          <div className="quota-meter-header">
            <strong>项目生命周期额度分配进度</strong>
            <span>
              {detail.isHistorical ? `历史已完成 ${detail.historyCompletedPct} + 系统分配 ${detail.totalBudgetPct} · 剩余可用 ${detail.remainingPct}` : `已消耗 ${detail.totalBudgetPct} / 剩余 ${detail.remainingPct}`}
            </span>
          </div>
          <div className="quota-bar-track" style={{ height: 10 }}>
            {detail.isHistorical && (
              <div className="quota-bar-fill" style={{ width: `${detail.historyCompletedRate / 100}%`, background: '#38bdf8' }} title={`历史已完成: ${detail.historyCompletedAmountWan} 万元`} />
            )}
            <div className="quota-bar-fill quota-bar-published" style={{ width: `${detail.publishedBudgetRate / 100}%` }} />
            <div className="quota-bar-fill quota-bar-draft" style={{ width: `${detail.draftBudgetRate / 100}%` }} />
            <div className="quota-bar-fill quota-bar-remaining" style={{ width: `${detail.remainingRate / 100}%` }} />
          </div>
          <div className="quota-meter-legend">
            {detail.isHistorical && (
              <span><i style={{ background: '#38bdf8' }} />历史已完成: {detail.historyCompletedAmountWan} 万元 ({detail.historyCompletedPct})</span>
            )}
            <span><i style={{ background: '#15803d' }} />已发布: {detail.publishedWan} 万元 ({detail.publishedBudgetPct})</span>
            <span><i style={{ background: '#f59e0b' }} />草稿待发布: {detail.draftWan} 万元 ({detail.draftBudgetPct})</span>
            <span><i style={{ background: '#cbd5e1' }} />后续可分配: {detail.remainingWan} 万元 ({detail.remainingPct})</span>
          </div>
        </div>

        {/* 成员累计获得明细 */}
        <h3 style={{ fontSize: '15px', margin: '0 0 10px', color: '#142822' }}>项目成员累计分配额度明细</h3>
        <table style={{ marginBottom: '24px' }}>
          <thead>
            <tr>
              <th>成员姓名</th>
              <th>所属专业组</th>
              <th>部门</th>
              <th>项目角色</th>
              <th>累计获得额度(万元)</th>
              <th>累计绩点(万)</th>
              <th>占项目合同比例</th>
            </tr>
          </thead>
          <tbody>
            {detail.memberCumulative.map(m => (
              <tr key={m.employeeId}>
                <td><b>{m.name}</b></td>
                <td><GroupTag group={m.group} /></td>
                <td>{m.department}</td>
                <td>{m.isOwner ? <Badge tone="blue">项目负责人</Badge> : <Badge tone="neutral">组员</Badge>}</td>
                <td><b>{m.amountWan} 万元</b></td>
                <td style={{ color: '#166534', fontWeight: 600 }}>{score(m.cumulativePoints)}</td>
                <td>{m.cumulativePct}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 全周期额度规划与执行透视 (规划 vs 实际) */}
        <div style={{ marginTop: '26px', borderTop: '1px dashed #cbd5e1', paddingTop: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarRange size={18} color="#0284c7" />
              <h3 style={{ fontSize: '15px', margin: 0, color: '#0f172a' }}>
                全周期月度额度规划与执行透视 (规划 vs 实际对比)
              </h3>
              {perspective && (
                <Badge tone={perspective.isFrontLoadedRisk ? 'amber' : 'green'}>
                  {perspective.isFrontLoadedRisk ? '⚠️ 存在前期透支风险' : '全周期节奏受控'}
                </Badge>
              )}
            </div>
            {onOpenQuotaSchedule && (
              <button
                type="button"
                className="primary"
                style={{ padding: '4px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                onClick={() => { onClose(); onOpenQuotaSchedule(projectId); }}
              >
                <Pencil size={13} /> 调整周期额度规划
              </button>
            )}
          </div>

          {perspective?.riskWarnings && perspective.riskWarnings.length > 0 && (
            <div style={{ background: '#fffbeb', border: '1px solid #fef08a', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', color: '#92400e', fontSize: '12.5px' }}>
              {perspective.riskWarnings.map((w, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: idx > 0 ? '4px' : 0 }}>
                  <AlertCircle size={14} color="#d97706" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

          {perspective && perspective.monthRows.length > 0 ? (
            <table style={{ marginBottom: '20px' }}>
              <thead>
                <tr>
                  <th>规划月份</th>
                  <th>阶段里程碑 / 交付目标</th>
                  <th>规划比例</th>
                  <th>规划额度(万元)</th>
                  <th>实际分配比例</th>
                  <th>实际分配额度(万元)</th>
                  <th>分配状态</th>
                  <th>执行偏差</th>
                  <th>规划交付物说明</th>
                </tr>
              </thead>
              <tbody>
                {perspective.monthRows.map(r => (
                  <tr key={r.month} style={{ background: r.isOver ? '#fff1f2' : undefined }}>
                    <td><b>{r.month}</b></td>
                    <td><span style={{ fontWeight: 500, color: '#334155' }}>{r.milestone || '阶段研制'}</span></td>
                    <td>{r.plannedPct}</td>
                    <td>{r.plannedAmountWan} 万元</td>
                    <td style={{ fontWeight: 600, color: r.actualRate > 0 ? '#166534' : '#94a3b8' }}>{r.actualPct}</td>
                    <td style={{ fontWeight: 600 }}>{r.actualAmountWan} 万元</td>
                    <td>
                      <Badge tone={r.actualStatus === 'published' ? 'green' : r.actualStatus === 'draft' ? 'amber' : 'neutral'}>
                        {r.actualStatus === 'published' ? '已发布' : r.actualStatus === 'draft' ? '草稿' : '未分配'}
                      </Badge>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: r.diffRate > 0 ? '#b91c1c' : r.diffRate < 0 ? '#15803d' : '#64748b' }}>
                        {r.diffPct}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>{r.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', color: '#64748b', fontSize: '12.5px', marginBottom: '20px', textAlign: 'center' }}>
              暂未制定周期额度规划，点击右上角【调整周期额度规划】可进行一键生成与排期设定
            </div>
          )}
        </div>

        {/* 月度分配流水 */}
        <h3 style={{ fontSize: '15px', margin: '0 0 10px', color: '#142822' }}>按月分配流水与成员分润明细</h3>
        <table>
          <thead>
            <tr>
              <th>分配月份</th>
              <th>月度预算比例</th>
              <th>月度额度(万元)</th>
              <th>状态</th>
              <th>说明</th>
              <th>成员分配分润明细</th>
            </tr>
          </thead>
          <tbody>
            {detail.monthlyBreakdown.map(plan => (
              <tr key={plan.planId}>
                <td><b>{plan.month}</b></td>
                <td>{plan.budgetPct}</td>
                <td><b>{plan.amountWan} 万元</b></td>
                <td>
                  <Badge tone={plan.status === 'published' ? 'green' : 'amber'}>
                    {plan.status === 'published' ? '已发布' : '草稿'}
                  </Badge>
                </td>
                <td style={{ color: '#64748b', fontSize: '12px' }}>{plan.note || '—'}</td>
                <td>
                  <table className="plan-member-mini-table">
                    <thead>
                      <tr>
                        <th style={{ width: '70px' }}>成员</th>
                        <th style={{ width: '60px', textAlign: 'right' }}>比例</th>
                        <th style={{ width: '85px', textAlign: 'right' }}>绩点(万)</th>
                        <th>当月工作内容</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.members.map(m => (
                        <tr key={m.employeeId}>
                          <td><b>{m.name}</b></td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: m.rate > 0 ? '#166534' : '#94a3b8' }}>{m.ratePct}</td>
                          <td style={{ textAlign: 'right', color: '#15803d' }}>{score(m.points)}万</td>
                          <td style={{ color: m.workContent ? '#334155' : '#94a3b8', fontStyle: m.workContent ? 'normal' : 'italic' }}>
                            {m.workContent || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            ))}
            {detail.monthlyBreakdown.length === 0 && (
              <tr><td colSpan={6}><Empty text="该项目尚未制定月度分配" /></td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="modal-actions" style={{ padding: '16px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {onExportPackage ? (
          <button style={{ background: '#7c3aed', color: '#ffffff', borderColor: '#6d28d9', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => onExportPackage(projectId)}>
            <Download size={14} />导出本项目分配数据包 (供核算员汇总)
          </button>
        ) : <span />}
        <button className="primary" onClick={onClose}>关闭</button>
      </div>
    </Modal>
  );
}

// -------------------------------------------------------------
// 项目全周期月度额度规划与执行透视弹窗 (Project Quota Modal)
// -------------------------------------------------------------
function ProjectQuotaModal({
  state,
  projectId,
  onClose,
  onSaveQuotaSchedule,
}: {
  state: State;
  projectId: string;
  onClose(): void;
  onSaveQuotaSchedule(projectId: string, quotaSchedule: ProjectMonthlyQuotaPlan[]): Promise<void>;
}) {
  const foundProject = state.projects.find(p => p.id === projectId);
  const project = foundProject || {
    id: projectId,
    code: '',
    name: '',
    client: '',
    contract: 0,
    owner: '',
    start: '2026-01',
    end: '2026-12',
    status: 'active' as const,
    members: [],
  };

  const perspective = useMemo(() => getProjectQuotaPerspective(state, projectId), [state, projectId]);

  // Initial schedule state
  const [schedule, setSchedule] = useState<ProjectMonthlyQuotaPlan[]>(() => {
    if (project.quotaSchedule && project.quotaSchedule.length > 0) {
      return structuredClone(project.quotaSchedule);
    }
    return generateProjectQuotaSchedule(project, 'deliverable_focused', state);
  });

  const [rateStrings, setRateStrings] = useState<Record<number, string>>({});
  const [newMonth, setNewMonth] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const csvFileRef = useRef<HTMLInputElement>(null);

  const totalPlannedRate = total(schedule.map(s => s.rate));
  const maxAllocableRate = Math.max(0, 10000 - (project.historyCompletedRate || 0));
  const remainingRate = Math.max(0, maxAllocableRate - totalPlannedRate);
  const totalPlannedWan = (points(project.contract, totalPlannedRate) / 1_000_000).toFixed(4);
  const remainingWan = (points(project.contract, remainingRate) / 1_000_000).toFixed(4);
  const isOverAllocable = totalPlannedRate > maxAllocableRate;

  // 需求2：阶段额度统计与约束（前期项目争取阶段 0-10% 可调，维保阶段保留 5% 额度）
  const biddingTotalRate = schedule
    .filter(s => getQuotaPlanStageType(s) === 'bidding')
    .reduce((sum, s) => sum + s.rate, 0);
  const maintenanceTotalRate = schedule
    .filter(s => getQuotaPlanStageType(s) === 'maintenance')
    .reduce((sum, s) => sum + s.rate, 0);
  const midTotalRate = Math.max(0, totalPlannedRate - biddingTotalRate - maintenanceTotalRate);

  const biddingWan = (points(project.contract, biddingTotalRate) / 1_000_000).toFixed(4);
  const maintenanceWan = (points(project.contract, maintenanceTotalRate) / 1_000_000).toFixed(4);
  const midWan = (points(project.contract, midTotalRate) / 1_000_000).toFixed(4);

  const isBiddingOver = biddingTotalRate > BIDDING_MAX_RATE;
  const isMaintenanceInsufficient = maxAllocableRate >= MAINTENANCE_QUOTA_RATE && maintenanceTotalRate < MAINTENANCE_QUOTA_RATE;

  // Actual plans mapped by month
  const actualPlans = useMemo(() => state.plans.filter(p => p.projectId === projectId), [state.plans, projectId]);
  const actualMap = useMemo(() => {
    const map = new Map<string, { budget: number; status: 'draft' | 'published'; amount: number; note: string }>();
    for (const pl of actualPlans) {
      map.set(pl.month, { budget: pl.budget, status: pl.status, amount: monthAmount(project, pl), note: pl.note });
    }
    return map;
  }, [actualPlans, project]);

  // Chart data for visualization
  const chartData = useMemo(() => {
    let cumPlan = 0;
    let cumAct = 0;
    return schedule.map(item => {
      cumPlan += item.rate;
      const act = actualMap.get(item.month);
      const actRate = act ? act.budget : 0;
      cumAct += actRate;
      return {
        month: item.month,
        规划额度: Number((points(project.contract, item.rate) / 1_000_000).toFixed(4)),
        实际分配: act ? Number((act.amount / 1_000_000).toFixed(4)) : 0,
        累计规划: Number((cumPlan / 100).toFixed(1)),
        累计实际: Number((cumAct / 100).toFixed(1)),
      };
    });
  }, [schedule, actualMap, project.contract]);

  const handleApplyPreset = (mode: 'deliverable_focused' | 'even' | 'middle_heavy' | 'sync_actual') => {
    setRateStrings({});
    const generated = generateProjectQuotaSchedule(project, mode, state);
    setSchedule(generated);
    if (mode === 'deliverable_focused') {
      setNotice('🎯 已应用【稳健交付型】策略：首月前期争取（0-10%可调）、中间主体研制与发货交付、末月维保阶段锁定保留 5% 额度！');
    } else if (mode === 'even') {
      setNotice('⚖️ 已应用【全周期平摊】策略：包含前期争取与末尾维保保留，其余平摊');
    } else if (mode === 'middle_heavy') {
      setNotice('🚀 已应用【中期攻坚型】策略：包含前期争取与末尾维保保留，重点倾斜中期攻坚');
    } else if (mode === 'sync_actual') {
      setNotice('🔄 已同步【已有实际分配】：已发生月份采用实际分配值，剩余额度平摊到剩余月份（末月保留5%维保）');
    }
  };

  const handleRateChange = (index: number, valStr: string) => {
    setRateStrings(prev => ({ ...prev, [index]: valStr }));
    const clean = valStr.replace('%', '').trim();
    const num = parseFloat(clean);
    if (!isNaN(num)) {
      let newRate = Math.max(0, Math.min(10000, Math.round(num * 100)));
      const stageType = getQuotaPlanStageType(schedule[index]);
      if (stageType === 'bidding' && newRate > BIDDING_MAX_RATE) {
        newRate = BIDDING_MAX_RATE;
        setNotice('⚠️ 前期项目争取阶段额度为 0-10% 可调，最高不可超过 10.00%');
      }
      setSchedule(prev => {
        const copy = [...prev];
        copy[index] = { ...copy[index], rate: newRate };
        return copy;
      });
    } else if (clean === '') {
      setSchedule(prev => {
        const copy = [...prev];
        copy[index] = { ...copy[index], rate: 0 };
        return copy;
      });
    }
  };

  const adjustRateStep = (index: number, deltaPct: number) => {
    setRateStrings(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setSchedule(prev => {
      const copy = [...prev];
      const stageType = getQuotaPlanStageType(copy[index]);
      const curPct = copy[index].rate / 100;
      let nextPct = Math.max(0, Math.min(100, Math.round((curPct + deltaPct) * 100) / 100));
      if (stageType === 'bidding' && nextPct > 10) {
        nextPct = 10;
        setNotice('⚠️ 前期项目争取阶段额度为 0-10% 可调，最高不可超过 10%');
      }
      copy[index] = { ...copy[index], rate: Math.round(nextPct * 100) };
      return copy;
    });
  };

  const handleSetRowStageType = (index: number, stageType: ProjectQuotaStageType) => {
    setRateStrings(prev => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setSchedule(prev => {
      const copy = [...prev];
      const cur = copy[index];
      if (stageType === 'bidding') {
        const rate = Math.min(BIDDING_MAX_RATE, cur.rate > 0 ? cur.rate : BIDDING_DEFAULT_RATE);
        copy[index] = {
          ...cur,
          stageType: 'bidding',
          rate,
          milestone: cur.milestone && !cur.milestone.includes('阶段') ? cur.milestone : '前期项目争取阶段',
          note: cur.note || '前期项目争取与客户方案对接（0-10%额度可调）'
        };
        setNotice('🤝 已将该月份设置为【前期项目争取阶段】（0-10%额度可调）');
      } else if (stageType === 'maintenance') {
        copy[index] = {
          ...cur,
          stageType: 'maintenance',
          rate: MAINTENANCE_QUOTA_RATE,
          milestone: '维保阶段（项目结束）',
          note: '项目结束阶段维保支持（保留5%额度）'
        };
        setNotice('🔒 已将该月份设置为【维保阶段】（保留5%额度）');
      } else {
        copy[index] = {
          ...cur,
          stageType: 'normal',
          milestone: cur.milestone?.includes('争取') || cur.milestone?.includes('维保') ? '阶段研制与交付' : cur.milestone,
          note: cur.note?.includes('争取') || cur.note?.includes('维保') ? '' : cur.note
        };
        setNotice('📝 已将该月份设置为【常规执行阶段】');
      }
      return copy;
    });
  };

  const handleLockMaintenanceAtEnd = () => {
    if (schedule.length === 0) return;
    setRateStrings({});
    setSchedule(prev => {
      const copy = [...prev];
      const lastIdx = copy.length - 1;
      copy[lastIdx] = {
        ...copy[lastIdx],
        stageType: 'maintenance',
        rate: MAINTENANCE_QUOTA_RATE,
        milestone: '维保阶段（项目结束）',
        note: '项目结束阶段维保支持（保留5%额度）'
      };
      return copy;
    });
    setNotice('🔒 已为项目最后阶段锁定并保留 5% 维保额度');
  };

  const handleSetFirstMonthBidding = (ratePct = 5) => {
    if (schedule.length === 0) return;
    setRateStrings({});
    const targetRate = Math.min(1000, Math.max(0, Math.round(ratePct * 100)));
    setSchedule(prev => {
      const copy = [...prev];
      copy[0] = {
        ...copy[0],
        stageType: 'bidding',
        rate: targetRate,
        milestone: '前期项目争取阶段',
        note: '前期项目争取与客户方案对接（0-10%额度可调）'
      };
      return copy;
    });
    setNotice(`🤝 已将首月配置为【前期项目争取阶段】，规划额度 ${ratePct}% (0-10%可调)`);
  };

  const handleMilestoneChange = (index: number, milestone: string) => {
    setSchedule(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], milestone };
      return copy;
    });
  };

  const handleNoteChange = (index: number, note: string) => {
    setSchedule(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], note };
      return copy;
    });
  };

  const handleDeleteMonth = (index: number) => {
    setRateStrings({});
    setSchedule(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddCustomMonth = (stageType: ProjectQuotaStageType = 'normal') => {
    let targetMonth = newMonth;
    if (!targetMonth || !/^\d{4}-\d{2}$/.test(targetMonth)) {
      if (stageType === 'maintenance' && schedule.length > 0) {
        // 自动计算最后一个月份的下一个月
        const lastM = schedule[schedule.length - 1].month;
        const [y, m] = lastM.split('-').map(Number);
        const nextM = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
        targetMonth = nextM;
      } else {
        setNotice('⚠️ 请输入合法的月份格式，例如 2026-07');
        return;
      }
    }
    if (schedule.some(s => s.month === targetMonth)) {
      setNotice(`⚠️ 月份 ${targetMonth} 已存在于规划中`);
      return;
    }
    let defaultRate = 0;
    let milestone = '新规划阶段';
    let note = '';
    if (stageType === 'bidding') {
      defaultRate = BIDDING_DEFAULT_RATE;
      milestone = '前期项目争取阶段';
      note = '前期项目争取与客户方案对接（0-10%额度可调）';
    } else if (stageType === 'maintenance') {
      defaultRate = MAINTENANCE_QUOTA_RATE;
      milestone = '维保阶段（项目结束）';
      note = '项目结束阶段维保支持（保留5%额度）';
    }
    setRateStrings({});
    const nextList = [...schedule, { month: targetMonth, rate: defaultRate, milestone, note, stageType }];
    nextList.sort((a, b) => a.month.localeCompare(b.month));
    setSchedule(nextList);
    setNewMonth('');
    setNotice(`已追加月份 ${targetMonth} (${stageType === 'bidding' ? '前期项目争取阶段' : stageType === 'maintenance' ? '维保阶段' : '常规阶段'})`);
  };

  const handleFillRemainingToDelivery = () => {
    if (schedule.length === 0) return;
    if (remainingRate <= 0) {
      setNotice('当前规划已达到或超出可用额度上限，无需补齐');
      return;
    }
    setRateStrings({});
    setSchedule(prev => {
      const copy = [...prev];
      // 如果最后一期是维保阶段，则补齐到倒数第二期（发货交付阶段），绝不占用维保的5%！
      let targetIdx = copy.length - 1;
      if (copy.length >= 2 && getQuotaPlanStageType(copy[targetIdx]) === 'maintenance') {
        targetIdx = copy.length - 2;
      }
      copy[targetIdx] = { ...copy[targetIdx], rate: copy[targetIdx].rate + remainingRate };
      return copy;
    });
    setNotice(`🎯 已将剩余 ${pct(remainingRate)} (${remainingWan} 万元) 储备金自动填入发货交付主体阶段`);
  };

  const handleExportCsv = () => {
    if (!perspective) return;
    const currentPersp = {
      ...perspective,
      monthRows: schedule.map(item => {
        const act = actualMap.get(item.month);
        const actualRate = act ? act.budget : 0;
        const actualAmount = act ? act.amount : 0;
        const diffRate = actualRate - item.rate;
        return {
          month: item.month,
          plannedRate: item.rate,
          plannedPct: pct(item.rate),
          plannedAmountWan: (points(project.contract, item.rate) / 1_000_000).toFixed(4),
          milestone: item.milestone || '',
          note: item.note || '',
          actualRate,
          actualPct: pct(actualRate),
          actualAmountWan: (actualAmount / 1_000_000).toFixed(4),
          actualStatus: act ? act.status : 'none',
          cumPlannedRate: 0,
          cumActualRate: 0,
          diffRate,
          diffPct: (diffRate > 0 ? '+' : '') + pct(diffRate),
          isOver: actualRate > item.rate,
        };
      })
    };
    const csvContent = exportProjectQuotaScheduleCsv(currentPersp as any);
    triggerDownload(csvContent, `${project.name}-全周期额度规划-${nowMonth()}.csv`);
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const text = evt.target?.result as string;
        const parsed = parseProjectQuotaScheduleCsvText(text, project);
        if (parsed.length === 0) throw new Error('CSV中未找到有效月份额度规划数据');
        setRateStrings({});
        setSchedule(parsed);
        setNotice(`已从 CSV 导入 ${parsed.length} 个月份的额度规划`);
      } catch (err) {
        setNotice(`⚠️ ${errorText(err)}`);
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const handleSave = async () => {
    if (isOverAllocable) {
      setNotice(`⚠️ 全周期规划额度总和（${pct(totalPlannedRate)}）不能超过项目可用额度上限（${pct(maxAllocableRate)}），请调减部分月份后再保存`);
      return;
    }
    if (isBiddingOver) {
      setNotice(`⚠️ 前期项目争取阶段额度总和（${pct(biddingTotalRate)}）不能超过 10%（0-10%可调），请调整后再保存`);
      return;
    }
    setSaving(true);
    try {
      await onSaveQuotaSchedule(projectId, schedule);
    } finally {
      setSaving(false);
    }
  };

  if (!foundProject) return null;

  return (
    <Modal
      title={`${project.name} · 全周期月度额度规划与执行透视`}
      subtitle={`工作令号: ${project.code} · 合同金额: ${wan(project.contract)} 万元 · 周期: ${project.start} 至 ${project.end || '待定/持续'} · 科学规划各月分配节奏，前期争取0-10%可调，末尾维保保留5%，保障发货与交付`}
      wide
      onClose={onClose}
    >
      <div className="modal-body" style={{ maxHeight: '82vh', overflowY: 'auto' }}>
        {/* 全景透视核心指标卡片 */}
        <div className="metrics" style={{ margin: '0 0 16px', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
          <article>
            <span>合同总额</span>
            <strong>{wan(project.contract)}<i> 万元</i></strong>
            <small>基准考核总额度</small>
          </article>

          <article style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <span>全周期已规划额度</span>
            <strong style={{ color: totalPlannedRate === maxAllocableRate ? '#166534' : isOverAllocable ? '#b91c1c' : '#0369a1' }}>
              {totalPlannedWan}<i> 万元</i>
            </strong>
            <small>
              规划占比: {pct(totalPlannedRate)} / {pct(maxAllocableRate)}
              {isOverAllocable && ' ⚠️ 超额'}
              {totalPlannedRate === maxAllocableRate && ' ✅ 满额规划'}
            </small>
          </article>

          <article style={{ background: '#fffbeb', border: '1px solid #fef08a' }}>
            <span>🤝 前期项目争取阶段</span>
            <strong style={{ color: isBiddingOver ? '#b91c1c' : '#b45309' }}>
              {biddingWan}<i> 万元</i>
            </strong>
            <small style={{ color: isBiddingOver ? '#b91c1c' : '#92400e' }}>
              占比: {pct(biddingTotalRate)} {isBiddingOver ? '⚠️ 超10%上限' : '(0-10%可调)'}
            </small>
          </article>

          <article style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
            <span>🔒 维保阶段保留额度</span>
            <strong style={{ color: isMaintenanceInsufficient ? '#b45309' : '#065f46' }}>
              {maintenanceWan}<i> 万元</i>
            </strong>
            <small style={{ color: isMaintenanceInsufficient ? '#b45309' : '#047857' }}>
              占比: {pct(maintenanceTotalRate)} {isMaintenanceInsufficient ? '⚠️ 不足5%' : '(末位保留5%)'}
            </small>
          </article>

          <article style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <span>主体交付与储备金</span>
            <strong style={{ color: remainingRate > 0 ? '#1d4ed8' : '#64748b' }}>
              {remainingWan}<i> 万元</i>
            </strong>
            <small style={{ color: remainingRate < 1000 ? '#b91c1c' : '#1e40af' }}>
              剩余储备: {pct(remainingRate)} {remainingRate < 1000 && '⚠️ 储备紧张'}
            </small>
          </article>

          <article>
            <span>规划覆盖周期</span>
            <strong style={{ color: '#334155' }}>
              {schedule.length}<i> 个月</i>
            </strong>
            <small>{schedule[0]?.month || '-'} 至 {schedule[schedule.length - 1]?.month || '-'}</small>
          </article>
        </div>

        {/* 风险预警提示条 */}
        {perspective?.isFrontLoadedRisk && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde047', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} color="#b45309" style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '13px', color: '#92400e' }}>
              <strong>前期透支风险预警：</strong>
              当前项目的实际分配节奏偏快，后期交付发货阶段的储备金仅剩 {remainingWan} 万元 ({pct(remainingRate)})！
              建议调低前期月份的规划比例，确保在货物交付和最终验收阶段有充足的绩点额度激励团队。
            </div>
          </div>
        )}

        {isBiddingOver && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '9px 14px', marginBottom: '12px', fontSize: '12.5px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} />
            <span><strong>前期项目争取阶段超限：</strong>当前前期争取额度合计为 <b>{pct(biddingTotalRate)}</b>，已超过 10% 可调上限，请调减后再保存。</span>
          </div>
        )}

        {isMaintenanceInsufficient && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '9px 14px', marginBottom: '12px', fontSize: '12.5px', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} />
              <span><strong>维保阶段额度提示：</strong>维保阶段目前仅配置 <b>{pct(maintenanceTotalRate)}</b>（建议在项目结束阶段至少保留 5% 额度）。</span>
            </div>
            <button
              type="button"
              style={{ border: '1px solid #d97706', background: '#fff', color: '#b45309', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
              onClick={handleLockMaintenanceAtEnd}
            >
              🔒 一键末尾保留 5% 维保
            </button>
          </div>
        )}

        {notice && (
          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '8px 14px', marginBottom: '14px', fontSize: '12.5px', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{notice}</span>
            <button type="button" className="icon-button" style={{ width: 20, height: 20 }} onClick={() => setNotice('')}><X size={12} /></button>
          </div>
        )}

        {/* 规划策略预设工具栏 */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={14} color="#0284c7" /> 快捷规划策略：
              </span>
              <button
                type="button"
                style={{ border: '1px solid #0284c7', background: '#f0f9ff', color: '#0369a1', borderRadius: '6px', padding: '4px 10px', fontSize: '11.5px', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => handleApplyPreset('deliverable_focused')}
                title="首月前期争取（5%·0-10%可调）、中间攻坚、交付大头、末月维保保留5%"
              >
                🎯 稳健交付型（含前期争取与维保保留5%）
              </button>
              <button
                type="button"
                style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#334155', borderRadius: '6px', padding: '4px 10px', fontSize: '11.5px', cursor: 'pointer' }}
                onClick={() => handleApplyPreset('even')}
                title="首月前期争取，末月维保保留5%，其余按月平摊"
              >
                ⚖️ 全周期平摊
              </button>
              <button
                type="button"
                style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#334155', borderRadius: '6px', padding: '4px 10px', fontSize: '11.5px', cursor: 'pointer' }}
                onClick={() => handleApplyPreset('middle_heavy')}
                title="首月前期争取，末月维保保留5%，重点倾斜在中间核心研制攻坚"
              >
                🚀 中期攻坚型
              </button>
              <button
                type="button"
                style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#334155', borderRadius: '6px', padding: '4px 10px', fontSize: '11.5px', cursor: 'pointer' }}
                onClick={() => handleApplyPreset('sync_actual')}
                title="已发生月份采用实际分配值，剩余平摊且末月保留5%维保"
              >
                🔄 同步实际 + 平摊剩余
              </button>
              <button
                type="button"
                style={{ border: '1px solid #a7f3d0', background: '#ecfdf5', color: '#065f46', borderRadius: '6px', padding: '4px 10px', fontSize: '11.5px', cursor: 'pointer', fontWeight: 600 }}
                onClick={handleLockMaintenanceAtEnd}
                title="为最后一个月份锁定设置为维保阶段并保留5%额度"
              >
                🔒 末尾锁定5%维保
              </button>
              <button
                type="button"
                style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#047857', borderRadius: '6px', padding: '4px 10px', fontSize: '11.5px', cursor: 'pointer' }}
                onClick={handleFillRemainingToDelivery}
                title="将剩余可用额度全额追加到发货交付阶段（避开维保保留额度）"
              >
                🎯 补齐剩余至发货期
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="file" accept=".csv" ref={csvFileRef} style={{ display: 'none' }} onChange={handleImportCsv} />
              <button
                type="button"
                style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#334155', borderRadius: '6px', padding: '4px 10px', fontSize: '11.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => csvFileRef.current?.click()}
              >
                <Upload size={12} /> 导入规划 CSV
              </button>
              <button
                type="button"
                style={{ border: '1px solid #cbd5e1', background: '#fff', color: '#334155', borderRadius: '6px', padding: '4px 10px', fontSize: '11.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={handleExportCsv}
              >
                <Download size={12} /> 导出规划 CSV
              </button>
            </div>
          </div>
        </div>

        {/* 全景透视对比图表 (Recharts) */}
        {chartData.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b' }}>
                📊 全周期月度规划与实际执行走势对比 (透视分析)
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                柱状图: 月度规划额度 vs 实际分配额度 (万元) · 折线图: 累计进度 (%)
              </span>
            </div>
            <div style={{ width: '100%', height: 175 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} unit="万" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} unit="%" domain={[0, 100]} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      name.includes('累计') ? `${val}%` : `${val} 万元`,
                      name
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                  <Bar yAxisId="left" dataKey="规划额度" fill="#38bdf8" radius={[3, 3, 0, 0]} barSize={22} />
                  <Bar yAxisId="left" dataKey="实际分配" fill="#10b981" radius={[3, 3, 0, 0]} barSize={22} />
                  <Line yAxisId="right" type="monotone" dataKey="累计规划" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="累计实际" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 交互式月度额度规划明细表 */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px' }}>
          <table style={{ margin: 0 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ width: '130px' }}>规划月份与阶段</th>
                <th style={{ width: '180px' }}>阶段里程碑 / 交付目标</th>
                <th style={{ width: '190px' }}>规划分配比例 (%)</th>
                <th style={{ width: '110px' }}>规划额度(万元)</th>
                <th style={{ width: '130px' }}>实际分配额度(万元)</th>
                <th style={{ width: '90px' }}>执行偏差</th>
                <th>交付成果 / 规划说明</th>
                <th style={{ width: '60px', textAlign: 'center' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item, index) => {
                const stageType = getQuotaPlanStageType(item);
                const act = actualMap.get(item.month);
                const actualRate = act ? act.budget : 0;
                const actualAmount = act ? act.amount : 0;
                const plannedAmount = points(project.contract, item.rate);
                const diffRate = actualRate - item.rate;
                const isOver = actualRate > item.rate;

                return (
                  <tr key={item.month} style={{ background: isOver && actualRate > 0 ? '#fff1f2' : undefined }}>
                    <td>
                      <div>
                        <b style={{ color: '#0f172a', fontSize: '13px' }}>{item.month}</b>
                      </div>
                      {/* 阶段属性标签与快速切换 */}
                      <div style={{ marginTop: '3px' }}>
                        {stageType === 'bidding' && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', borderRadius: '4px', padding: '1px 5px', fontSize: '10px', fontWeight: 600 }}>
                            <span>🤝 前期争取</span>
                            <span style={{ fontSize: '9px', color: '#b45309' }}>(0-10%可调)</span>
                          </div>
                        )}
                        {stageType === 'maintenance' && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: '4px', padding: '1px 5px', fontSize: '10px', fontWeight: 600 }}>
                            <Lock size={10} />
                            <span>维保阶段</span>
                            <span style={{ fontSize: '9px', color: '#047857' }}>(保留5%)</span>
                          </div>
                        )}
                        {stageType === 'normal' && (
                          <span style={{ fontSize: '10.5px', color: '#64748b' }}>主体研制交付</span>
                        )}
                      </div>
                      <div style={{ marginTop: '2px' }}>
                        <select
                          value={stageType}
                          onChange={e => handleSetRowStageType(index, e.target.value as ProjectQuotaStageType)}
                          style={{ height: '20px', fontSize: '10px', padding: '0 3px', border: '1px solid #cbd5e1', borderRadius: '3px', background: '#fff', color: '#475569', cursor: 'pointer' }}
                          title="切换该月份所属的项目阶段类型"
                        >
                          <option value="normal">⚙️ 主体研制</option>
                          <option value="bidding">🤝 前期争取 (0-10%)</option>
                          <option value="maintenance">🔒 维保阶段 (保留5%)</option>
                        </select>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.milestone || ''}
                        onChange={e => handleMilestoneChange(index, e.target.value)}
                        placeholder="例如: 初样研制与联调"
                        style={{ height: '30px', fontSize: '12px' }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div
                          className="suffix-input"
                          style={{ width: '85px', height: '30px' }}
                          onClick={e => {
                            const input = e.currentTarget.querySelector('input');
                            if (input && document.activeElement !== input) input.focus();
                          }}
                        >
                          <input
                            type="text"
                            inputMode="decimal"
                            value={rateStrings[index] !== undefined ? rateStrings[index] : (item.rate > 0 ? (item.rate / 100).toFixed(2).replace(/\.00$/, '') : '')}
                            onChange={e => handleRateChange(index, e.target.value)}
                            onBlur={() => {
                              setRateStrings(prev => {
                                const next = { ...prev };
                                delete next[index];
                                return next;
                              });
                            }}
                            placeholder="0.00"
                            style={{ textAlign: 'right', fontSize: '12px', height: '28px', color: stageType === 'bidding' && item.rate > 1000 ? '#b91c1c' : undefined }}
                          />
                          <span>%</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <button
                            type="button"
                            style={{ padding: '0 4px', fontSize: '9px', height: '14px', lineHeight: '14px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '2px', cursor: 'pointer' }}
                            onClick={() => adjustRateStep(index, 1)}
                            title="+1%"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            style={{ padding: '0 4px', fontSize: '9px', height: '14px', lineHeight: '14px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '2px', cursor: 'pointer' }}
                            onClick={() => adjustRateStep(index, -1)}
                            title="-1%"
                          >
                            -1
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <button
                            type="button"
                            style={{ padding: '0 4px', fontSize: '9px', height: '14px', lineHeight: '14px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '2px', cursor: 'pointer' }}
                            onClick={() => adjustRateStep(index, 5)}
                            title="+5%"
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            style={{ padding: '0 4px', fontSize: '9px', height: '14px', lineHeight: '14px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '2px', cursor: 'pointer' }}
                            onClick={() => adjustRateStep(index, -5)}
                            title="-5%"
                          >
                            -5
                          </button>
                        </div>
                      </div>

                      {/* 阶段专属微调快捷按键 */}
                      {stageType === 'bidding' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}>
                          <span style={{ fontSize: '9.5px', color: '#b45309' }}>快捷:</span>
                          {[0, 3, 5, 8, 10].map(pVal => (
                            <button
                              key={pVal}
                              type="button"
                              style={{ border: '1px solid #fde68a', background: item.rate === pVal * 100 ? '#fef08a' : '#fff', color: '#92400e', borderRadius: '2px', padding: '0 3px', fontSize: '9.5px', height: '16px', lineHeight: '14px', cursor: 'pointer' }}
                              onClick={() => handleRateChange(index, String(pVal))}
                            >
                              {pVal}%
                            </button>
                          ))}
                        </div>
                      )}

                      {stageType === 'maintenance' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          <button
                            type="button"
                            style={{ border: '1px solid #a7f3d0', background: item.rate === 500 ? '#d1fae5' : '#fff', color: '#065f46', borderRadius: '2px', padding: '0 5px', fontSize: '9.5px', height: '16px', lineHeight: '14px', cursor: 'pointer', fontWeight: 600 }}
                            onClick={() => handleRateChange(index, '5')}
                            title="锁定为标准的 5% 维保额度"
                          >
                            🔒 锁定5%
                          </button>
                          {item.rate < 500 && (
                            <span style={{ fontSize: '9.5px', color: '#d97706' }}>⚠️ 建议保留5%</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <b style={{ color: '#0369a1', fontSize: '12.5px' }}>
                        {(plannedAmount / 1_000_000).toFixed(4)} 万元
                      </b>
                    </td>
                    <td>
                      {act ? (
                        <div>
                          <b style={{ color: '#166534', fontSize: '12.5px' }}>
                            {(actualAmount / 1_000_000).toFixed(4)} 万元
                          </b>
                          <Badge tone={act.status === 'published' ? 'green' : 'amber'} style={{ marginLeft: '4px', fontSize: '10px' }}>
                            {act.status === 'published' ? '已发布' : '草稿'}
                          </Badge>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>未分配</span>
                      )}
                    </td>
                    <td>
                      {act ? (
                        <span style={{ fontSize: '11.5px', fontWeight: 600, color: diffRate > 0 ? '#b91c1c' : diffRate < 0 ? '#15803d' : '#64748b' }}>
                          {diffRate > 0 ? `+${(diffRate / 100).toFixed(1)}% ⚠️` : diffRate < 0 ? `${(diffRate / 100).toFixed(1)}%` : '持平'}
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>—</span>
                      )}
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.note || ''}
                        onChange={e => handleNoteChange(index, e.target.value)}
                        placeholder="交付物说明/关键验收指标..."
                        style={{ height: '30px', fontSize: '12px' }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="icon-button"
                        style={{ width: 26, height: 26, color: '#ef4444' }}
                        onClick={() => handleDeleteMonth(index)}
                        title="移除该月份规划"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                <td>合计 ({schedule.length} 个月)</td>
                <td>
                  <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: '#92400e' }}>🤝 前期争取: {(biddingTotalRate / 100).toFixed(2)}%</span>
                    <span style={{ color: '#047857' }}>🔒 维保保留: {(maintenanceTotalRate / 100).toFixed(2)}%</span>
                    <span style={{ color: '#0369a1' }}>⚙️ 中间研制: {(midTotalRate / 100).toFixed(2)}%</span>
                  </div>
                </td>
                <td style={{ color: totalPlannedRate === maxAllocableRate ? '#166534' : isOverAllocable ? '#b91c1c' : '#0369a1' }}>
                  <div>{(totalPlannedRate / 100).toFixed(2)}% / {pct(maxAllocableRate)}</div>
                  <div style={{ fontSize: '11px', fontWeight: 500 }}>
                    {isOverAllocable ? ' (⚠️超额)' : totalPlannedRate < maxAllocableRate ? ` (尚余${pct(remainingRate)})` : ' (满额)'}
                  </div>
                </td>
                <td style={{ color: '#0369a1' }}>{totalPlannedWan} 万元</td>
                <td style={{ color: '#166534' }}>
                  {perspective ? perspective.totalActualWan : '0'} 万元
                </td>
                <td>—</td>
                <td colSpan={2} style={{ fontSize: '12px', color: remainingRate > 0 ? '#1d4ed8' : '#64748b' }}>
                  储备金剩余: <b>{remainingWan} 万元 ({pct(remainingRate)})</b>
                </td>
              </tr>
            </tfoot>
          </table>

          {/* 追加月份输入行 */}
          <div style={{ background: '#f8fafc', padding: '10px 14px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>追加规划月份：</span>
              <input
                type="month"
                value={newMonth}
                onChange={e => setNewMonth(e.target.value)}
                style={{ width: '135px', height: '28px', fontSize: '12px' }}
              />
              <button
                type="button"
                style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', padding: '3px 9px', fontSize: '11.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => handleAddCustomMonth('normal')}
              >
                <Plus size={12} /> 添加常规月份
              </button>
              <button
                type="button"
                style={{ border: '1px solid #fde68a', background: '#fffbeb', color: '#92400e', borderRadius: '4px', padding: '3px 9px', fontSize: '11.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => handleAddCustomMonth('bidding')}
                title="添加为前期项目争取阶段（0-10%额度可调）"
              >
                🤝 设为前期争取月份
              </button>
            </div>

            <button
              type="button"
              style={{ border: '1px solid #a7f3d0', background: '#ecfdf5', color: '#065f46', borderRadius: '4px', padding: '3px 10px', fontSize: '11.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
              onClick={() => handleAddCustomMonth('maintenance')}
              title="在末尾自动追加维保阶段月份（保留5%额度）"
            >
              🔒 追加维保阶段月份（置底保留5%）
            </button>
          </div>
        </div>
      </div>

      <div className="modal-actions" style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          提示：保存后，项目在每月录入分配时将自动根据此规划提供参考建议与超支拦截预警。
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="secondary" onClick={onClose} disabled={saving}>
            取消
          </button>
          <button
            type="button"
            className="primary"
            onClick={handleSave}
            disabled={saving || isOverAllocable || isBiddingOver}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <Save size={15} />
            {saving ? '正在保存...' : '保存额度规划'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// -------------------------------------------------------------
// 需求5：分配规则展示板（规则文本美观展示）
// -------------------------------------------------------------
function AllocationRulesBoard({ collapsible = false, defaultOpen = true }: { collapsible?: boolean; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rules-showcase-board">
      <div className="rules-board-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="rules-board-icon">
            <BookOpenCheck size={22} color="#15803d" />
          </div>
          <div>
            <h3 className="rules-board-heading">
              员工绩点分配与核算基本准则
            </h3>
            <span className="rules-board-subheading">
              遵循全员及负责人分配率核心规则 · 系统自动约束校验与合规保障
            </span>
          </div>
        </div>
        {collapsible && (
          <button
            type="button"
            className="secondary"
            style={{ padding: '4px 10px', fontSize: '12px', gap: '4px' }}
            onClick={() => setOpen(!open)}
          >
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {open ? '收起规则' : '展开规则'}
          </button>
        )}
      </div>

      {open && (
        <div className="rules-list-container">
          <div className="rule-card rule-card-constraint">
            <div className="rule-card-header">
              <span className="rule-badge rule-badge-emerald">全员总量上限约束</span>
            </div>
            <h4 className="rule-title">单项目全员绩点分配率累加不大于1；</h4>
            <div className="rule-desc">
              约束说明：项目内各成员分配率合计上限为 100%（比例和精确等于 1.0000），系统实时严格拦截，不允许超额透支。
            </div>
          </div>

          <div className="rule-card rule-card-formula">
            <div className="rule-card-header">
              <span className="rule-badge rule-badge-blue">月度核算基本公式</span>
            </div>
            <h4 className="rule-title">月度绩点分配率×单项目可分配经费=绩点值；</h4>
            <div className="rule-desc">
              计算公式：成员实际获得绩点 = 月度分配预算比例 × 单项目可分配经费 × 成员当月个人分配率，采用最大余数法精确补差，分文不差。
            </div>
          </div>

          <div className="rule-card rule-card-teal">
            <div className="rule-card-header">
              <span className="rule-badge rule-badge-teal">小型项目区间 · 负责人指导标准</span>
            </div>
            <h4 className="rule-title">合同经费区间(0,50)，项目负责人个人参考绩点分配率0.6-0.9，全员累计不大于1；</h4>
            <div className="rule-tags-row">
              <span className="rule-pill rule-pill-gray">合同经费：(0, 50) 万元</span>
              <span className="rule-pill rule-pill-accent">负责人参考比例：60% ~ 90%</span>
              <span className="rule-pill rule-pill-neutral">全员累计不大于 100%</span>
            </div>
          </div>

          <div className="rule-card rule-card-amber">
            <div className="rule-card-header">
              <span className="rule-badge rule-badge-amber">中型项目区间 · 负责人指导标准</span>
            </div>
            <h4 className="rule-title">合同经费区间[50,500)，项目负责人参考绩点分配率0.3-0.6，全员累计不大于1；</h4>
            <div className="rule-tags-row">
              <span className="rule-pill rule-pill-gray">合同经费：[50, 500) 万元</span>
              <span className="rule-pill rule-pill-amber">负责人参考比例：30% ~ 60%</span>
              <span className="rule-pill rule-pill-neutral">全员累计不大于 100%</span>
            </div>
          </div>

          <div className="rule-card rule-card-indigo">
            <div className="rule-card-header">
              <span className="rule-badge rule-badge-indigo">大型项目区间 · 负责人指导标准</span>
            </div>
            <h4 className="rule-title">合同经费区间[500,+∞)，项目负责人参考绩点分配率0.1-0.3，全员累计不大于1；</h4>
            <div className="rule-tags-row">
              <span className="rule-pill rule-pill-gray">合同经费：[500, +∞) 万元</span>
              <span className="rule-pill rule-pill-indigo">负责人参考比例：10% ~ 30%</span>
              <span className="rule-pill rule-pill-neutral">全员累计不大于 100%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RulesView() {
  return (
    <section className="panel full">
      <PageTitle
        eyebrow="ALLOCATION STANDARDS & CRITERIA"
        title="分配规则展示板"
        description="系统内置核心考核分配规则体系，涵盖单项目全员分配率约束、月度绩点计算准则以及不同合同经费区间下项目负责人的参考分配率指导区间。"
      />
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <AllocationRulesBoard defaultOpen={true} />
        
        <div style={{ marginTop: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px 22px' }}>
          <h4 style={{ margin: '0 0 10px', fontSize: '14px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#166534" /> 规则自动化校验与合规保障
          </h4>
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
            1. <b>总和校验拦截</b>：保存任何月度分配草稿时，系统会自动验证全部参与成员的分配比例总和是否严格等于 100%（即分配率和为 1），防止由于输入遗漏造成分配不公或资金超拨。
          </p>
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
            2. <b>负责人参考区间指引</b>：根据项目合同金额自动匹配对应的经费区间（0-50万、50-500万、500万以上），并在项目详情与分配审核中对负责人的累计实际占比给出参考区间诊断与提示。该区间为指导参考性质，系统不作强制拦截，充分满足不同项目的实际业务灵活性。
          </p>
          <p style={{ margin: '0', fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
            3. <b>历史额度无缝衔接</b>：针对系统上线前已有执行进度的历史项目，系统支持独立录入历史已完成额度与比例，后续月度计划将严格受限于剩余额度。
          </p>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------
// 3. Plans View (月度分配与全项目集中管理)
// -------------------------------------------------------------
function QuickMemberAllocModal({
  project,
  month,
  budgetRate,
  initialEntries,
  employees,
  onClose,
  onSave,
}: {
  project: Project;
  month: string;
  budgetRate: number; // bps e.g. 500 = 5%
  initialEntries: PlanEntry[];
  employees: Employee[];
  onClose(): void;
  onSave(entries: PlanEntry[]): void;
}) {
  const memberIds = useMemo(() => {
    const set = new Set(project.members);
    for (const e of initialEntries) set.add(e.employeeId);
    return Array.from(set);
  }, [project.members, initialEntries]);

  const [rates, setRates] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const mId of memberIds) {
      const existing = initialEntries.find(e => e.employeeId === mId);
      map[mId] = existing ? existing.rate : 0;
    }
    // 若初始全是0且成员数大于0，自动默认均摊
    const totalInit = Object.values(map).reduce((s, r) => s + r, 0);
    if (totalInit === 0 && memberIds.length > 0) {
      if (project.defaultRates && Object.keys(project.defaultRates).length > 0) {
        for (const mId of memberIds) {
          map[mId] = project.defaultRates[mId] || 0;
        }
      } else {
        const base = Math.floor(10000 / memberIds.length);
        let rem = 10000 - base * memberIds.length;
        for (const mId of memberIds) {
          let r = base;
          if (rem > 0) { r++; rem--; }
          map[mId] = r;
        }
      }
    }
    return map;
  });

  const totalAllocated = useMemo(() => {
    return Object.values(rates).reduce((s, r) => s + (Number(r) || 0), 0);
  }, [rates]);

  const isValid = totalAllocated === 10000;
  const projectAmt = monthAmount(project, { budget: budgetRate } as Plan);

  const handleRateChange = (empId: string, val: number) => {
    setRates(prev => ({
      ...prev,
      [empId]: Math.max(0, Math.min(10000, Math.round(val)))
    }));
  };

  const adjustRate = (empId: string, delta: number) => {
    setRates(prev => {
      const cur = prev[empId] || 0;
      return {
        ...prev,
        [empId]: Math.max(0, Math.min(10000, cur + delta))
      };
    });
  };

  // 一键全员均摊
  const handleSplitEvenly = () => {
    if (memberIds.length === 0) return;
    const base = Math.floor(10000 / memberIds.length);
    let rem = 10000 - base * memberIds.length;
    const next: Record<string, number> = {};
    for (const mId of memberIds) {
      let r = base;
      if (rem > 0) { r++; rem--; }
      next[mId] = r;
    }
    setRates(next);
  };

  // 一键套用项目组默认比例
  const handleApplyDefaults = () => {
    if (project.defaultRates && Object.keys(project.defaultRates).length > 0) {
      const next: Record<string, number> = {};
      for (const mId of memberIds) {
        next[mId] = project.defaultRates[mId] || 0;
      }
      setRates(next);
    } else {
      handleSplitEvenly();
    }
  };

  // 负责人主导（60% / 其余均摊）
  const handleOwnerDominant = () => {
    if (memberIds.length === 0) return;
    if (memberIds.length === 1) {
      setRates({ [memberIds[0]]: 10000 });
      return;
    }
    const ownerId = project.owner && memberIds.includes(project.owner) ? project.owner : memberIds[0];
    const otherMembers = memberIds.filter(id => id !== ownerId);
    const ownerShare = 6000; // 60%
    const otherTotal = 4000; // 40%
    const base = Math.floor(otherTotal / otherMembers.length);
    let rem = otherTotal - base * otherMembers.length;
    const next: Record<string, number> = { [ownerId]: ownerShare };
    for (const mId of otherMembers) {
      let r = base;
      if (rem > 0) { r++; rem--; }
      next[mId] = r;
    }
    setRates(next);
  };

  const handleConfirm = () => {
    if (!isValid) return;
    const resultEntries: PlanEntry[] = memberIds.map(empId => ({
      employeeId: empId,
      rate: rates[empId] || 0,
      workContent: initialEntries.find(e => e.employeeId === empId)?.workContent || ''
    }));
    onSave(resultEntries);
    onClose();
  };

  return (
    <Modal
      title={`快速配置项目成员分配比例 · ${month}`}
      subtitle={`【${project.name}】(${project.code}) · 合同金额: ${wan(project.contract)}万元 · 当月预算比例: ${pct(budgetRate)} (${wan(projectAmt)}万元)`}
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* 快捷预设按键 */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>快捷预设:</span>
          <button type="button" className="secondary" style={{ padding: '3px 9px', fontSize: '11.5px', cursor: 'pointer' }} onClick={handleSplitEvenly}>
            ⚡ 全员均摊
          </button>
          {project.defaultRates && Object.keys(project.defaultRates).length > 0 && (
            <button type="button" className="secondary" style={{ padding: '3px 9px', fontSize: '11.5px', cursor: 'pointer' }} onClick={handleApplyDefaults}>
              👥 套用项目组默认比例
            </button>
          )}
          <button type="button" className="secondary" style={{ padding: '3px 9px', fontSize: '11.5px', cursor: 'pointer' }} onClick={handleOwnerDominant}>
            👑 负责人主导 (60% / 其余均摊)
          </button>
        </div>

        {/* 成员比例配置列表 */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <table style={{ width: '100%', margin: 0, fontSize: '13px' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#f1f5f9', zIndex: 1 }}>
              <tr>
                <th style={{ width: '32%' }}>成员姓名</th>
                <th style={{ width: '22%' }}>专业组</th>
                <th style={{ width: '28%', textAlign: 'center' }}>分配比例 (%)</th>
                <th style={{ width: '18%', textAlign: 'right' }}>对应额度(万元)</th>
              </tr>
            </thead>
            <tbody>
              {memberIds.map(empId => {
                const emp = employees.find(e => e.id === empId);
                const curRate = rates[empId] || 0;
                const memberAmt = projectAmt ? Math.round((projectAmt * curRate) / 10000) : 0;
                const isOwner = empId === project.owner;
                return (
                  <tr key={empId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <b>{emp?.name || empId}</b>
                        {isOwner && <span title="项目负责人">👑</span>}
                      </div>
                    </td>
                    <td><GroupTag group={emp?.group} /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <button type="button" style={{ padding: '2px 5px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff', cursor: 'pointer' }} onClick={() => adjustRate(empId, -100)}>-1</button>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={(curRate / 100).toFixed(2)}
                          onChange={e => handleRateChange(empId, parseFloat(e.target.value || '0') * 100)}
                          style={{ width: '65px', textAlign: 'center', padding: '3px 4px', fontSize: '12px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        />
                        <button type="button" style={{ padding: '2px 5px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff', cursor: 'pointer' }} onClick={() => adjustRate(empId, 100)}>+1</button>
                        <button type="button" style={{ padding: '2px 5px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff', cursor: 'pointer' }} onClick={() => adjustRate(empId, 500)}>+5</button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: curRate > 0 ? '#166534' : '#94a3b8' }}>
                      {score(memberAmt)} 万元
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 底部合计与校验 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 4px' }}>
          <div>
            比例合计: <b style={{ fontSize: '15px', color: isValid ? '#166534' : '#dc2626' }}>{(totalAllocated / 100).toFixed(2)}%</b> / 100%
            {!isValid && (
              <span style={{ marginLeft: '10px', fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>
                {totalAllocated > 10000 ? `⚠️ 超额 ${((totalAllocated - 10000) / 100).toFixed(2)}%` : `⚠️ 还差 ${((10000 - totalAllocated) / 100).toFixed(2)}% 未分配`}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="secondary" onClick={onClose}>取消</button>
            <button type="button" className="primary" disabled={!isValid} onClick={handleConfirm}>确定应用比例</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function PlansView({
  state,
  isAdmin,
  isManager,
  currentActorId,
  onAdd,
  onEdit,
  onAction,
  onOpenQuotaSchedule,
  onBatchPublish,
  onBatchReopen,
  onBatchSave,
}: {
  state: State;
  isAdmin: boolean;
  isManager: boolean;
  currentActorId: string;
  onAdd(projectId: string): void;
  onEdit(plan: Plan): void;
  onAction(type: string, plan: Plan): void;
  onOpenQuotaSchedule?(projectId: string): void;
  onBatchPublish?(planIds: string[]): Promise<boolean>;
  onBatchReopen?(planIds: string[]): Promise<boolean>;
  onBatchSave?(plans: any[]): Promise<boolean>;
}) {
  // 视图模式：'matrix' (全项目当月集中管理与批量修改发布) vs 'single' (单项目全周期历史明细)
  const [viewMode, setViewMode] = useState<'matrix' | 'single'>('matrix');

  // 当月集中管理月份选择
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    if (state.plans.length > 0) {
      const sorted = [...state.plans].map(p => p.month).sort();
      return sorted[sorted.length - 1];
    }
    return nowMonth();
  });

  // 全项目当月透视数据
  const monthPerspective = useMemo(() => {
    return getMonthProjectsAllocPerspective(state, selectedMonth, currentActorId);
  }, [state, selectedMonth, currentActorId]);

  // 行内草稿修改状态：Record<projectId, { budget: number; entries: PlanEntry[]; dirty: boolean }>
  const [draftEdits, setDraftEdits] = useState<Record<string, { budget: number; entries: PlanEntry[]; dirty: boolean }>>({});
  const [budgetStrings, setBudgetStrings] = useState<Record<string, string>>({});

  // 勾选的项目行 ID（对应 plan.id 或 project.id）
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);

  // 状态筛选
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'unallocated' | 'published'>('all');
  const [searchKw, setSearchKw] = useState<string>('');

  // 快速配置人员比例弹窗
  const [quickAllocProject, setQuickAllocProject] = useState<{ project: Project; budgetRate: number; entries: PlanEntry[] } | null>(null);
  const [isSavingBatch, setIsSavingBatch] = useState(false);
  const [isPublishingBatch, setIsPublishingBatch] = useState(false);

  // 单项目明细视图状态
  const [singleProjectId, setSingleProjectId] = useState(state.projects.find(p => p.status === 'active')?.id || state.projects[0]?.id || '');
  const singleProject = state.projects.find(p => p.id === singleProjectId);
  const singlePlans = useMemo(() => state.plans.filter(p => p.projectId === singleProjectId).sort((a, b) => a.month.localeCompare(b.month)), [state.plans, singleProjectId]);
  const singleDetail = singleProject ? projectAllocDetail(state, singleProject.id) : null;
  const singlePerspective = singleProject ? getProjectQuotaPerspective(state, singleProject.id) : null;
  const canManageSingleProject = isAdmin || (singleProject && singleProject.owner === currentActorId);

  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  useEffect(() => {
    if (singlePlans.length > 0 && (!selectedPlanId || !singlePlans.some(p => p.id === selectedPlanId))) {
      setSelectedPlanId(singlePlans[singlePlans.length - 1].id);
    }
  }, [singlePlans, selectedPlanId]);

  const [memberViewMode, setMemberViewMode] = useState<'table' | 'compact'>('table');
  const [colWidths, setColWidths] = useState<Record<string, number>>({
    month: 110,
    budget: 110,
    amount: 130,
    detail: 460,
    status: 100,
    actions: 140
  });

  const handleColResize = (colKey: string, startX: number, startWidth: number) => {
    const onMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      setColWidths(prev => ({
        ...prev,
        [colKey]: Math.max(75, startWidth + diff)
      }));
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const [orderedPlanIds, setOrderedPlanIds] = useState<string[]>([]);
  const [draggedPlanId, setDraggedPlanId] = useState<string | null>(null);

  const displayedSinglePlans = useMemo(() => {
    if (orderedPlanIds.length === 0) return singlePlans;
    const map = new Map(singlePlans.map(p => [p.id, p]));
    const list: Plan[] = [];
    for (const id of orderedPlanIds) {
      const p = map.get(id);
      if (p) list.push(p);
    }
    for (const p of singlePlans) {
      if (!orderedPlanIds.includes(p.id)) list.push(p);
    }
    return list;
  }, [singlePlans, orderedPlanIds]);

  const handleDragStart = (id: string) => setDraggedPlanId(id);
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedPlanId || draggedPlanId === targetId) return;
    const curIds = orderedPlanIds.length > 0 ? [...orderedPlanIds] : singlePlans.map(p => p.id);
    const fromIndex = curIds.indexOf(draggedPlanId);
    const toIndex = curIds.indexOf(targetId);
    if (fromIndex !== -1 && toIndex !== -1) {
      curIds.splice(fromIndex, 1);
      curIds.splice(toIndex, 0, draggedPlanId);
      setOrderedPlanIds(curIds);
    }
  };
  const handleDragEnd = () => setDraggedPlanId(null);

  const selectedPlan = singlePlans.find(p => p.id === selectedPlanId) || singlePlans[0];

  // 月份切换函数
  const navigateMonth = (direction: -1 | 1 | 0) => {
    if (direction === 0) {
      setSelectedMonth(nowMonth());
      return;
    }
    const [y, m] = selectedMonth.split('-').map(Number);
    let ny = y;
    let nm = m + direction;
    if (nm < 1) { nm = 12; ny--; }
    if (nm > 12) { nm = 1; ny++; }
    setSelectedMonth(`${ny}-${String(nm).padStart(2, '0')}`);
    setDraftEdits({});
    setSelectedPlanIds([]);
  };

  // 行内预算调整
  const handleUpdateBudget = (projectId: string, newRate: number, clearStr = true) => {
    if (clearStr) {
      setBudgetStrings(prev => {
        if (prev[projectId] === undefined) return prev;
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
    }
    const clamped = Math.max(0, Math.min(10000, Math.round(newRate)));
    setDraftEdits(prev => {
      const curEntries = prev[projectId]?.entries || monthPerspective.rows.find(r => r.project.id === projectId)?.entries || [];
      return {
        ...prev,
        [projectId]: {
          budget: clamped,
          entries: curEntries,
          dirty: true
        }
      };
    });
  };

  // 单行保存
  const handleSaveSingleRow = async (projectId: string) => {
    const edit = draftEdits[projectId];
    if (!edit || !onBatchSave) return;
    const ok = await onBatchSave([{
      projectId,
      month: selectedMonth,
      budget: edit.budget,
      entries: edit.entries
    }]);
    if (ok) {
      setBudgetStrings(prev => {
        if (prev[projectId] === undefined) return prev;
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
      setDraftEdits(prev => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
    }
  };

  // 一键按规划填充当月额度
  const handleApplyAllPlanned = () => {
    setBudgetStrings({});
    const nextEdits = { ...draftEdits };
    let count = 0;
    for (const r of monthPerspective.rows) {
      if (r.plannedRate > 0 && r.status !== 'published') {
        const curEdit = nextEdits[r.project.id];
        nextEdits[r.project.id] = {
          budget: r.plannedRate,
          entries: curEdit?.entries || r.entries,
          dirty: true
        };
        count++;
      }
    }
    setDraftEdits(nextEdits);
  };

  // 一键应用项目组默认比例
  const handleApplyAllTeamDefaults = () => {
    setBudgetStrings({});
    const nextEdits = { ...draftEdits };
    for (const r of monthPerspective.rows) {
      if (r.project.defaultRates && Object.keys(r.project.defaultRates).length > 0 && r.status !== 'published') {
        const entries = Object.entries(r.project.defaultRates).map(([empId, rate]) => ({
          employeeId: empId,
          rate: Number(rate),
          workContent: ''
        }));
        const curBudget = nextEdits[r.project.id]?.budget ?? (r.plan?.budget || r.plannedRate || 0);
        nextEdits[r.project.id] = {
          budget: curBudget,
          entries,
          dirty: true
        };
      }
    }
    setDraftEdits(nextEdits);
  };

  // 批量保存全部已修改
  const handleSaveAllDirty = async () => {
    if (!onBatchSave) return;
    const toSave: any[] = [];
    for (const [pId, edit] of Object.entries(draftEdits)) {
      if (edit.dirty && edit.budget > 0) {
        toSave.push({
          projectId: pId,
          month: selectedMonth,
          budget: edit.budget,
          entries: edit.entries
        });
      }
    }
    if (toSave.length === 0) return;
    setIsSavingBatch(true);
    try {
      const ok = await onBatchSave(toSave);
      if (ok) {
        setDraftEdits({});
      }
    } finally {
      setIsSavingBatch(false);
    }
  };

  // 批量发布
  const handleBatchPublish = async () => {
    if (!onBatchPublish) return;
    const draftPlanIds: string[] = [];
    for (const r of monthPerspective.rows) {
      if (r.plan && r.plan.status === 'draft' && selectedPlanIds.includes(r.plan.id)) {
        draftPlanIds.push(r.plan.id);
      }
    }
    if (draftPlanIds.length === 0) {
      const allDrafts = monthPerspective.rows.filter(r => r.plan?.status === 'draft').map(r => r.plan!.id);
      if (allDrafts.length === 0) return;
      if (window.confirm(`当前未勾选特定项目，是否一键批量发布当月全部 ${allDrafts.length} 个待发布的项目草稿方案？`)) {
        setIsPublishingBatch(true);
        try {
          await onBatchPublish(allDrafts);
          setSelectedPlanIds([]);
        } finally {
          setIsPublishingBatch(false);
        }
      }
      return;
    }
    setIsPublishingBatch(true);
    try {
      await onBatchPublish(draftPlanIds);
      setSelectedPlanIds([]);
    } finally {
      setIsPublishingBatch(false);
    }
  };

  // 批量撤回
  const [isReopeningBatch, setIsReopeningBatch] = useState(false);

  const handleBatchReopen = async () => {
    if (!onBatchReopen) return;
    
    // 找出所有勾选的已发布方案
    const selectedPubPlanIds = monthPerspective.rows
      .filter(r => r.plan && r.plan.status === 'published' && selectedPlanIds.includes(r.plan.id))
      .map(r => r.plan!.id);

    // 找出当月全部已发布方案
    const allPubPlanIds = monthPerspective.rows
      .filter(r => r.plan && r.plan.status === 'published')
      .map(r => r.plan!.id);

    if (allPubPlanIds.length === 0) {
      alert(`当前【${selectedMonth}】月份没有已发布的项目方案可供撤回。`);
      return;
    }

    const targetPlanIds = selectedPubPlanIds.length > 0 ? selectedPubPlanIds : allPubPlanIds;
    const isAll = selectedPubPlanIds.length === 0 || selectedPubPlanIds.length === allPubPlanIds.length;
    
    const confirmMsg = isAll
      ? `【批量撤回确认】\n\n确定要将【${selectedMonth}】月份全部 ${allPubPlanIds.length} 个已发布的项目月度分配方案批量撤回为草稿状态吗？\n\n撤回后：\n1. 方案将转为草稿，您可以重新调整分配额度与成员比例；\n2. 涉及的绩点将暂时从当月考核报表中移出，待重新审核发布后计入。`
      : `【批量撤回确认】\n\n确定要将勾选的 ${selectedPubPlanIds.length} 个已发布项目月度分配方案批量撤回为草稿状态吗？\n\n撤回后：\n1. 选中的项目方案将转为草稿状态供重新编辑；\n2. 涉及的绩点将暂时从当月考核报表中移出。`;

    if (window.confirm(confirmMsg)) {
      setIsReopeningBatch(true);
      try {
        await onBatchReopen(targetPlanIds);
        setSelectedPlanIds(prev => prev.filter(id => !targetPlanIds.includes(id)));
      } finally {
        setIsReopeningBatch(false);
      }
    }
  };

  // 过滤后的行列表
  const filteredMatrixRows = useMemo(() => {
    return monthPerspective.rows.filter(r => {
      if (statusFilter === 'draft' && r.status !== 'draft') return false;
      if (statusFilter === 'published' && r.status !== 'published') return false;
      if (statusFilter === 'unallocated' && r.status !== 'unallocated') return false;
      if (searchKw.trim()) {
        const q = searchKw.trim().toLowerCase();
        const codeMatch = r.project.code.toLowerCase().includes(q);
        const nameMatch = r.project.name.toLowerCase().includes(q);
        const ownerMatch = (state.employees.find(e => e.id === r.project.owner)?.name || '').toLowerCase().includes(q);
        if (!codeMatch && !nameMatch && !ownerMatch) return false;
      }
      return true;
    });
  }, [monthPerspective.rows, statusFilter, searchKw, state.employees]);

  const dirtyCount = Object.values(draftEdits).filter(e => e.dirty).length;
  const draftRows = monthPerspective.rows.filter(r => r.status === 'draft');
  const publishedRows = monthPerspective.rows.filter(r => r.plan && r.plan.status === 'published');
  const allocatedRows = monthPerspective.rows.filter(r => r.plan !== undefined);

  const selectedDraftIds = draftRows.filter(r => r.plan && selectedPlanIds.includes(r.plan.id)).map(r => r.plan!.id);
  const selectedPubPlanIds = publishedRows.filter(r => r.plan && selectedPlanIds.includes(r.plan.id)).map(r => r.plan!.id);

  const allDraftsSelected = draftRows.length > 0 && selectedDraftIds.length === draftRows.length;
  const allPublishedSelected = publishedRows.length > 0 && selectedPubPlanIds.length === publishedRows.length;
  const allAllocatedSelected = allocatedRows.length > 0 && selectedPlanIds.length === allocatedRows.length;

  const toggleSelectAllDrafts = () => {
    if (allDraftsSelected) {
      setSelectedPlanIds(prev => prev.filter(id => !draftRows.some(r => r.plan?.id === id)));
    } else {
      const draftIds = draftRows.map(r => r.plan!.id);
      setSelectedPlanIds(prev => Array.from(new Set([...prev, ...draftIds])));
    }
  };

  const toggleSelectAllPublished = () => {
    if (allPublishedSelected) {
      setSelectedPlanIds(prev => prev.filter(id => !publishedRows.some(r => r.plan?.id === id)));
    } else {
      const pubIds = publishedRows.map(r => r.plan!.id);
      setSelectedPlanIds(prev => Array.from(new Set([...prev, ...pubIds])));
    }
  };

  const selectAllAllocated = () => {
    setSelectedPlanIds(allocatedRows.map(r => r.plan!.id));
  };

  const clearSelection = () => {
    setSelectedPlanIds([]);
  };

  return (
    <section className="panel full">
      <PageTitle
        eyebrow="MONTHLY ALLOCATION & BATCH WORKSPACE"
        title="月底分配与全项目集中管理"
        description="集中查看所有项目当月的分配额度与全周期规划节奏。支持批量微调额度、人员分配与一键批量发布，高效完成月底考核结算。"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px', border: '1px solid #e2e8f0', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                style={{
                  border: 'none',
                  background: viewMode === 'matrix' ? '#ffffff' : 'transparent',
                  color: viewMode === 'matrix' ? '#166534' : '#64748b',
                  fontWeight: viewMode === 'matrix' ? 700 : 500,
                  boxShadow: viewMode === 'matrix' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <Table2 size={14} /> 🏢 全项目当月集中管理
              </button>
              <button
                type="button"
                onClick={() => setViewMode('single')}
                style={{
                  border: 'none',
                  background: viewMode === 'single' ? '#ffffff' : 'transparent',
                  color: viewMode === 'single' ? '#166534' : '#64748b',
                  fontWeight: viewMode === 'single' ? 700 : 500,
                  boxShadow: viewMode === 'single' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <FolderKanban size={14} /> 📁 单项目历史明细
              </button>
            </div>
            {viewMode === 'single' && singleProject && singleProject.status === 'active' && canManageSingleProject && (
              <button className="primary" style={{ whiteSpace: 'nowrap', flexShrink: 0 }} onClick={() => onAdd(singleProject.id)}>
                <Plus size={16} />新增月份分配
              </button>
            )}
          </div>
        }
      />

      {/* ============================================================== */}
      {/* 视图一：全项目当月集中管理 (月底分配与批量发布) */}
      {/* ============================================================== */}
      {viewMode === 'matrix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 月份切换器与看板指标横幅（自适应换行与卡片排版） */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>考核结算月份:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                <button type="button" className="secondary" style={{ padding: '4px 8px', fontSize: '11.5px', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => navigateMonth(-1)} title="切换至上个月">
                  ◀ 上月
                </button>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => {
                    if (e.target.value) {
                      setSelectedMonth(e.target.value);
                      setDraftEdits({});
                      setSelectedPlanIds([]);
                    }
                  }}
                  style={{ padding: '4px 8px', fontSize: '13px', fontWeight: 600, border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff', color: '#166534', minWidth: '125px' }}
                />
                <button type="button" className="secondary" style={{ padding: '4px 8px', fontSize: '11.5px', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => navigateMonth(1)} title="切换至下个月">
                  下月 ▶
                </button>
                <button type="button" className="secondary" style={{ padding: '4px 8px', fontSize: '11.5px', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => navigateMonth(0)} title="回到当前系统月份">
                  📅 当前月
                </button>
              </div>
            </div>

            {/* 统计指标卡片组（自适应紧凑卡片） */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              fontSize: '12px'
            }}>
              <div style={{ background: '#ffffff', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                项目总计: <b>{monthPerspective.totalProjects}</b> 个
              </div>
              <div style={{ background: '#ffffff', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                配置进度: <b style={{ color: monthPerspective.allocatedCount === monthPerspective.totalProjects ? '#15803d' : '#b45309' }}>{monthPerspective.allocatedCount}/{monthPerspective.totalProjects}</b>
                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>
                  ({monthPerspective.publishedCount}已发布 · {monthPerspective.draftCount}草稿)
                </span>
              </div>
              <div style={{ background: '#ffffff', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                全周期规划: <b>{wan(monthPerspective.totalPlannedAmount)} 万元</b>
              </div>
              <div style={{ background: '#ffffff', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                当月分配: <b style={{ color: '#166534' }}>{wan(monthPerspective.totalActualAmount)} 万元</b>
                {(() => {
                  const diffWan = (monthPerspective.totalActualAmount - monthPerspective.totalPlannedAmount) / 1000000;
                  if (Math.abs(diffWan) < 0.0001) {
                    return <span style={{ marginLeft: 4, fontSize: '11px', color: '#166534', fontWeight: 600 }}>持平</span>;
                  }
                  return (
                    <span style={{ marginLeft: 4, fontSize: '11px', fontWeight: 600, color: diffWan > 0 ? '#b45309' : '#0284c7' }}>
                      ({diffWan > 0 ? `+${diffWan.toFixed(4)}` : diffWan.toFixed(4)}万)
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* 自适应操作控制台（统一卡片式两层排版，告别换行凌乱） */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: '#ffffff',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}>
            {/* 上层：状态筛选、关键字检索 与 自动化填充/批量保存 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              {/* 左侧：状态筛选胶囊与搜索框 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: '1 1 auto' }}>
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px', border: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                  {(['all', 'draft', 'unallocated', 'published'] as const).map(key => {
                    const labelMap = {
                      all: `全部 (${monthPerspective.totalProjects})`,
                      draft: `草稿待发布 (${monthPerspective.draftCount})`,
                      unallocated: `未配置 (${monthPerspective.totalProjects - monthPerspective.allocatedCount})`,
                      published: `已发布 (${monthPerspective.publishedCount})`
                    };
                    const active = statusFilter === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setStatusFilter(key)}
                        style={{
                          border: 'none',
                          background: active ? '#ffffff' : 'transparent',
                          color: active ? '#166534' : '#64748b',
                          fontWeight: active ? 700 : 400,
                          padding: '3px 9px',
                          borderRadius: '5px',
                          fontSize: '11.5px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {labelMap[key]}
                      </button>
                    );
                  })}
                </div>

                <div style={{ position: 'relative', minWidth: '180px', maxWidth: '260px', flex: '1 1 180px' }}>
                  <input
                    type="text"
                    placeholder="搜索令号、项目或负责人..."
                    value={searchKw}
                    onChange={e => setSearchKw(e.target.value)}
                    style={{ width: '100%', padding: '4px 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* 右侧：辅助规划工具 与 保存按钮 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
                <button
                  type="button"
                  className="secondary"
                  style={{ padding: '4px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  onClick={handleApplyAllPlanned}
                  title="自动将所有存在规划且未发布的项目设置为规划比例"
                >
                  <Sparkles size={13} color="#0284c7" /> 一键按规划填充当月额度
                </button>

                <button
                  type="button"
                  className="secondary"
                  style={{ padding: '4px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  onClick={handleApplyAllTeamDefaults}
                  title="一键将各项目的默认项目组成员与比例载入未发布的分配方案"
                >
                  <Users size={13} color="#475569" /> 一键应用项目组默认比例
                </button>

                {dirtyCount > 0 && (
                  <button
                    type="button"
                    className="primary"
                    style={{ padding: '4px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', background: '#0284c7', borderColor: '#0284c7', whiteSpace: 'nowrap' }}
                    onClick={handleSaveAllDirty}
                    disabled={isSavingBatch}
                  >
                    <Save size={13} /> {isSavingBatch ? '正在保存...' : `💾 批量保存修改 (${dirtyCount} 项待保存)`}
                  </button>
                )}
              </div>
            </div>

            {/* 下层：快捷批量勾选 与 核心批量发布/批量撤回执行按钮 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              paddingTop: '8px',
              borderTop: '1px solid #f1f5f9'
            }}>
              {/* 左侧：快捷勾选芯片与勾选计数 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
                <span style={{ color: '#475569', fontWeight: 600, whiteSpace: 'nowrap' }}>快捷勾选：</span>
                <button
                  type="button"
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: allDraftsSelected ? '#dbeafe' : '#f8fafc',
                    color: allDraftsSelected ? '#1d4ed8' : '#334155',
                    cursor: monthPerspective.draftCount > 0 ? 'pointer' : 'default',
                    opacity: monthPerspective.draftCount > 0 ? 1 : 0.5,
                    whiteSpace: 'nowrap',
                    fontWeight: allDraftsSelected ? 600 : 400
                  }}
                  disabled={monthPerspective.draftCount === 0}
                  onClick={toggleSelectAllDrafts}
                  title="勾选/取消勾选全部草稿待发布项目"
                >
                  📝 {allDraftsSelected ? '取消草稿全选' : `全选当月草稿 (${monthPerspective.draftCount})`}
                </button>

                <button
                  type="button"
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    border: '1px solid #f59e0b',
                    background: allPublishedSelected ? '#fef3c7' : '#fffbeb',
                    color: allPublishedSelected ? '#b45309' : '#92400e',
                    cursor: monthPerspective.publishedCount > 0 ? 'pointer' : 'default',
                    opacity: monthPerspective.publishedCount > 0 ? 1 : 0.5,
                    whiteSpace: 'nowrap',
                    fontWeight: allPublishedSelected ? 600 : 400
                  }}
                  disabled={monthPerspective.publishedCount === 0}
                  onClick={toggleSelectAllPublished}
                  title="勾选/取消勾选全部已发布项目（便于批量撤回）"
                >
                  🔒 {allPublishedSelected ? '取消已发布全选' : `全选当月已发布 (${monthPerspective.publishedCount})`}
                </button>

                <button
                  type="button"
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    background: allAllocatedSelected ? '#dcfce7' : '#f8fafc',
                    color: allAllocatedSelected ? '#15803d' : '#475569',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontWeight: allAllocatedSelected ? 600 : 400
                  }}
                  onClick={allAllocatedSelected ? clearSelection : selectAllAllocated}
                  title="勾选/取消勾选所有已配置方案"
                >
                  {allAllocatedSelected ? '取消全选' : `全选所有项目 (${monthPerspective.allocatedCount})`}
                </button>

                {selectedPlanIds.length > 0 ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: 4, whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#166534', fontWeight: 700, fontSize: '12px' }}>
                      已勾选 <b>{selectedPlanIds.length}</b> 项（草稿 {selectedDraftIds.length}，已发布 {selectedPubPlanIds.length}）
                    </span>
                    <button
                      type="button"
                      style={{ padding: '2px 6px', fontSize: '11px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff', color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      onClick={clearSelection}
                    >
                      清空选择
                    </button>
                  </div>
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
                    💡 提示：未单独勾选时，点击“🚀 批量发布”发布全部草稿，点击“↩ 批量撤回”撤回全部已发布
                  </span>
                )}
              </div>

              {/* 右侧：核心执行操作 批量发布 与 批量撤回 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
                <button
                  type="button"
                  className="primary"
                  style={{ padding: '4px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  onClick={handleBatchPublish}
                  disabled={isPublishingBatch || monthPerspective.draftCount === 0}
                  title="将勾选的草稿方案批量正式发布"
                >
                  <CheckSquare size={13} /> {isPublishingBatch ? '正在发布...' : `🚀 批量发布 (${selectedDraftIds.length > 0 ? `${selectedDraftIds.length} 项草稿` : '全部草稿'})`}
                </button>

                <button
                  type="button"
                  className="secondary"
                  style={{
                    padding: '4px 12px',
                    fontSize: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: monthPerspective.publishedCount === 0 ? 'not-allowed' : 'pointer',
                    color: monthPerspective.publishedCount === 0 ? '#94a3b8' : '#b45309',
                    borderColor: monthPerspective.publishedCount === 0 ? '#e2e8f0' : '#f59e0b',
                    background: monthPerspective.publishedCount === 0 ? '#f8fafc' : '#fffbeb',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={handleBatchReopen}
                  disabled={isReopeningBatch || monthPerspective.publishedCount === 0}
                  title={
                    monthPerspective.publishedCount === 0
                      ? `当前月份暂无已发布方案`
                      : selectedPubPlanIds.length > 0
                      ? `将勾选的 ${selectedPubPlanIds.length} 个已发布方案批量撤回为草稿`
                      : `将当月全部 ${monthPerspective.publishedCount} 个已发布方案批量撤回为草稿重新调整`
                  }
                >
                  <RotateCcw size={13} /> {isReopeningBatch ? '正在撤回...' : `↩ 批量撤回 (${
                    selectedPubPlanIds.length > 0
                      ? `${selectedPubPlanIds.length} 项已发布`
                      : `全部 ${monthPerspective.publishedCount} 项已发布`
                  })`}
                </button>
              </div>
            </div>
          </div>

          {/* 全项目当月集中矩阵列表 */}
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', minWidth: '1080px', margin: 0 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={allAllocatedSelected || (monthPerspective.draftCount > 0 && allDraftsSelected)}
                      onChange={() => {
                        if (allAllocatedSelected || allDraftsSelected) {
                          clearSelection();
                        } else if (draftRows.length > 0) {
                          toggleSelectAllDrafts();
                        } else {
                          selectAllAllocated();
                        }
                      }}
                      title="全选/取消全选"
                    />
                  </th>
                  <th style={{ width: '22%' }}>项目令号与名称</th>
                  <th style={{ width: '18%' }}>全周期规划参考 ({selectedMonth})</th>
                  <th style={{ width: '24%' }}>当月分配额度(万元) (可直接行内调整)</th>
                  <th style={{ width: '18%' }}>项目成员分配预览</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>当前状态</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatrixRows.map(row => {
                  const pId = row.project.id;
                  const currentBudget = draftEdits[pId] !== undefined
                    ? draftEdits[pId].budget
                    : (row.plan ? row.plan.budget : (row.plannedRate || 0));
                  const currentEntries = draftEdits[pId]?.entries || row.entries;
                  const isDirty = Boolean(draftEdits[pId]?.dirty);
                  const isPlanChecked = row.plan ? selectedPlanIds.includes(row.plan.id) : false;

                  const calculatedAmt = monthAmount(row.project, { budget: currentBudget } as Plan);
                  const diffRate = currentBudget - row.plannedRate;
                  const isOverRemaining = currentBudget > row.allocableRemainingRate;
                  const ownerEmp = state.employees.find(e => e.id === row.project.owner);

                  return (
                    <tr
                      key={row.project.id}
                      style={{
                        background: isDirty ? '#f0fdf4' : undefined,
                        borderLeft: isDirty ? '4px solid #16a34a' : undefined
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ textAlign: 'center' }}>
                        {row.plan ? (
                          <input
                            type="checkbox"
                            checked={isPlanChecked}
                            onChange={() => {
                              setSelectedPlanIds(prev =>
                                isPlanChecked ? prev.filter(id => id !== row.plan!.id) : [...prev, row.plan!.id]
                              );
                            }}
                          />
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: '12px' }}>—</span>
                        )}
                      </td>

                      {/* 项目令号与名称 */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                              {row.project.code}
                            </span>
                            <b style={{ fontSize: '13.5px', color: '#1e293b' }}>{row.project.name}</b>
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                            合同总额: <b>{wan(row.project.contract)} 万元</b> · 负责人: <b>{ownerEmp?.name || '未设置'}</b> 👑
                            {row.isHistorical && <span style={{ marginLeft: 4, color: '#b45309', fontWeight: 600 }}>(历史项目)</span>}
                          </div>
                        </div>
                      </td>

                      {/* 全周期规划参考 */}
                      <td>
                        {row.plannedRate > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 700, color: '#0369a1', fontSize: '13px' }}>
                                {pct(row.plannedRate)}
                              </span>
                              <span style={{ fontSize: '12px', color: '#475569' }}>
                                ({row.plannedAmountWan} 万元)
                              </span>
                            </div>
                            <div>
                              {row.plannedStageType === 'bidding' ? (
                                <span style={{ fontSize: '10.5px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                  🤝 前期争取 ({pct(row.plannedRate)})
                                </span>
                              ) : row.plannedStageType === 'maintenance' ? (
                                <span style={{ fontSize: '10.5px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                  🔒 维保阶段 (保留5%)
                                </span>
                              ) : (
                                <span style={{ fontSize: '10.5px', background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '4px' }}>
                                  {row.plannedMilestone || '研制交付阶段'}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>未预设规划</span>
                        )}
                      </td>

                      {/* 当月分配额度 (可直接行内调整) */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              inputMode="decimal"
                              disabled={row.status === 'published'}
                              value={budgetStrings[pId] !== undefined ? budgetStrings[pId] : (currentBudget / 100).toFixed(2).replace(/\.00$/, '')}
                              onChange={e => {
                                const val = e.target.value;
                                setBudgetStrings(prev => ({ ...prev, [pId]: val }));
                                const clean = val.replace('%', '').trim();
                                const num = parseFloat(clean);
                                if (!isNaN(num)) {
                                  handleUpdateBudget(pId, num * 100, false);
                                } else if (clean === '') {
                                  handleUpdateBudget(pId, 0, false);
                                }
                              }}
                              onBlur={() => {
                                setBudgetStrings(prev => {
                                  const next = { ...prev };
                                  delete next[pId];
                                  return next;
                                });
                              }}
                              style={{
                                width: '68px',
                                textAlign: 'center',
                                padding: '3px 4px',
                                fontSize: '13px',
                                fontWeight: 700,
                                borderRadius: '5px',
                                border: isOverRemaining ? '1px solid #ef4444' : isDirty ? '1px solid #16a34a' : '1px solid #cbd5e1',
                                background: row.status === 'published' ? '#f8fafc' : '#ffffff',
                                color: isOverRemaining ? '#ef4444' : '#166534'
                              }}
                            />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>%</span>

                            {row.status !== 'published' && (
                              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                                <button type="button" style={{ padding: '2px 5px', fontSize: '10.5px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff', cursor: 'pointer' }} onClick={() => handleUpdateBudget(pId, currentBudget - 100)}>-1%</button>
                                <button type="button" style={{ padding: '2px 5px', fontSize: '10.5px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff', cursor: 'pointer' }} onClick={() => handleUpdateBudget(pId, currentBudget + 100)}>+1%</button>
                                <button type="button" style={{ padding: '2px 5px', fontSize: '10.5px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff', cursor: 'pointer' }} onClick={() => handleUpdateBudget(pId, currentBudget + 500)}>+5%</button>
                              </div>
                            )}

                            {row.status !== 'published' && row.plannedRate > 0 && currentBudget !== row.plannedRate && (
                              <button
                                type="button"
                                style={{ padding: '2px 6px', fontSize: '10.5px', border: '1px solid #bae6fd', borderRadius: '4px', background: '#f0f9ff', color: '#0369a1', cursor: 'pointer' }}
                                onClick={() => handleUpdateBudget(pId, row.plannedRate)}
                                title={`一键套用全周期规划预设值 ${pct(row.plannedRate)}`}
                              >
                                ⚡ 套用规划
                              </button>
                            )}
                          </div>

                          <div style={{ fontSize: '11.5px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>折合: <b>{wan(calculatedAmt)} 万元</b></span>
                            {row.plannedRate > 0 && (
                              <span style={{ fontSize: '11px', color: diffRate > 0 ? '#b45309' : diffRate < 0 ? '#0284c7' : '#166534', fontWeight: 600 }}>
                                偏差: {diffRate > 0 ? `+${pct(diffRate)}` : diffRate < 0 ? `-${pct(-diffRate)}` : '持平'}
                              </span>
                            )}
                          </div>

                          {isOverRemaining && (
                            <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600 }}>
                              ⚠️ 超过剩余可用额度 ({pct(row.allocableRemainingRate)})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 项目成员分配预览与快捷调整 */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {currentEntries.slice(0, 3).map(e => {
                              const emp = state.employees.find(x => x.id === e.employeeId);
                              return (
                                <span
                                  key={e.employeeId}
                                  style={{
                                    fontSize: '11px',
                                    background: '#f1f5f9',
                                    color: '#334155',
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                >
                                  {emp?.name || e.employeeId}: <b>{pct(e.rate)}</b>
                                </span>
                              );
                            })}
                            {currentEntries.length > 3 && (
                              <span style={{ fontSize: '11px', color: '#64748b' }}>
                                等共 {currentEntries.length} 人
                              </span>
                            )}
                          </div>

                          {row.status !== 'published' && (
                            <button
                              type="button"
                              className="secondary"
                              style={{ padding: '2px 7px', fontSize: '11px', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}
                              onClick={() => {
                                setQuickAllocProject({
                                  project: row.project,
                                  budgetRate: currentBudget,
                                  entries: currentEntries
                                });
                              }}
                            >
                              <Users size={12} /> 👥 快速配置成员比例
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 当前状态 */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                          {isDirty ? (
                            <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              ✏️ 待保存
                            </span>
                          ) : row.status === 'published' ? (
                            <Badge tone="green">已发布</Badge>
                          ) : row.status === 'draft' ? (
                            <Badge tone="amber">草稿待发布</Badge>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#94a3b8', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>未配置</span>
                          )}
                        </div>
                      </td>

                      {/* 操作 */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          {isDirty && (
                            <button
                              type="button"
                              className="primary"
                              style={{ padding: '2px 7px', fontSize: '11px', cursor: 'pointer' }}
                              onClick={() => handleSaveSingleRow(pId)}
                              title="单独保存该项目的修改"
                            >
                              保存
                            </button>
                          )}

                          {row.status === 'draft' && row.plan && (
                            <button
                              type="button"
                              style={{ padding: '2px 7px', fontSize: '11px', border: '1px solid #86efac', background: '#f0fdf4', color: '#166534', borderRadius: '4px', cursor: 'pointer' }}
                              onClick={() => onAction('plan.publish', row.plan!)}
                              title="发布该项目月度方案"
                            >
                              发布
                            </button>
                          )}

                          {row.status === 'published' && row.plan && (
                            <button
                              type="button"
                              style={{ padding: '2px 7px', fontSize: '11px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', borderRadius: '4px', cursor: 'pointer' }}
                              onClick={() => onAction('plan.reopen', row.plan!)}
                              title="撤回为草稿"
                            >
                              撤回
                            </button>
                          )}

                          {row.plan ? (
                            <button
                              type="button"
                              className="secondary"
                              style={{ padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                              onClick={() => onEdit(row.plan!)}
                              title="打开完整编辑弹窗（含工作内容描述与精细评审）"
                            >
                              明细
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="secondary"
                              style={{ padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                              onClick={() => onAdd(row.project.id)}
                              title="新建月度分配"
                            >
                              创建
                            </button>
                          )}

                          {onOpenQuotaSchedule && (
                            <button
                              type="button"
                              style={{ padding: '2px 5px', fontSize: '11px', border: 'none', background: 'transparent', color: '#0284c7', cursor: 'pointer' }}
                              onClick={() => onOpenQuotaSchedule(row.project.id)}
                              title="查看该项目的全周期额度规划"
                            >
                              规划
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredMatrixRows.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      未找到符合条件的项目方案记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 快速配置成员比例弹窗 */}
          {quickAllocProject && (
            <QuickMemberAllocModal
              project={quickAllocProject.project}
              month={selectedMonth}
              budgetRate={quickAllocProject.budgetRate}
              initialEntries={quickAllocProject.entries}
              employees={state.employees}
              onClose={() => setQuickAllocProject(null)}
              onSave={entries => {
                setDraftEdits(prev => ({
                  ...prev,
                  [quickAllocProject.project.id]: {
                    budget: quickAllocProject.budgetRate,
                    entries,
                    dirty: true
                  }
                }));
              }}
            />
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 视图二：单项目全周期历史明细 (原有独立项目排期与工作内容展板) */}
      {/* ============================================================== */}
      {viewMode === 'single' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="toolbar" style={{ flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <Field label="选择项目">
                <select value={singleProjectId} onChange={e => setSingleProjectId(e.target.value)} style={{ minWidth: 320 }}>
                  {state.projects.map(p => (
                    <option value={p.id} key={p.id}>
                      {p.code} · {p.name} ({p.status === 'active' ? '执行中' : '已结项'})
                    </option>
                  ))}
                </select>
              </Field>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>人员明细排版方式</span>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '6px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setMemberViewMode('table')}
                    style={{
                      border: 'none',
                      background: memberViewMode === 'table' ? '#ffffff' : 'transparent',
                      color: memberViewMode === 'table' ? '#166534' : '#64748b',
                      fontWeight: memberViewMode === 'table' ? 700 : 400,
                      boxShadow: memberViewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      padding: '4px 10px',
                      borderRadius: '5px',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Table2 size={13} /> 表格明细
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberViewMode('compact')}
                    style={{
                      border: 'none',
                      background: memberViewMode === 'compact' ? '#ffffff' : 'transparent',
                      color: memberViewMode === 'compact' ? '#166534' : '#64748b',
                      fontWeight: memberViewMode === 'compact' ? 700 : 400,
                      boxShadow: memberViewMode === 'compact' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      padding: '4px 10px',
                      borderRadius: '5px',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <LayoutGrid size={13} /> 紧凑胶囊
                  </button>
                </div>
              </div>
            </div>

            {singleDetail && (
              <div className="quota-summary" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span>合同总额: <b>{singleDetail.contractWan} 万元</b></span>
                <span>已分配: <b>{singleDetail.totalBudgetPct}</b> ({singleDetail.totalAllocatedWan}万)</span>
                <span>剩余: <b style={{ color: singleDetail.remainingRate > 0 ? '#b45309' : '#15803d' }}>{singleDetail.remainingPct}</b> ({singleDetail.remainingWan}万)</span>
                {singlePerspective && (
                  <span>交付储备金: <b style={{ color: singlePerspective.deliveryStageReserveRate >= 3500 ? '#166534' : '#b45309' }}>{wan(singlePerspective.deliveryStageReserveAmount)}万 ({pct(singlePerspective.deliveryStageReserveRate)})</b></span>
                )}
                {singlePerspective?.isFrontLoadedRisk && (
                  <Badge tone="amber">⚠️ 前期透支风险</Badge>
                )}
                {onOpenQuotaSchedule && (
                  <button
                    type="button"
                    className="secondary"
                    style={{ padding: '3px 9px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    onClick={() => onOpenQuotaSchedule(singleProjectId)}
                    title="打开全周期额度规划与各月交付节点透视"
                  >
                    <CalendarRange size={13} /> 周期额度规划
                  </button>
                )}
                {singlePlans.some(p => p.status === 'published') && canManageSingleProject && onBatchReopen && (
                  <button
                    type="button"
                    className="secondary"
                    style={{ padding: '3px 9px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#b45309', borderColor: '#f59e0b', background: '#fffbeb' }}
                    onClick={async () => {
                      const pubPlans = singlePlans.filter(p => p.status === 'published');
                      if (window.confirm(`【批量撤回确认】\n\n确定要将项目【${singleProject?.name}】下的全部 ${pubPlans.length} 个已发布月份方案批量撤回为草稿状态吗？\n\n撤回后：\n1. 所有方案转为可编辑草稿；\n2. 涉及绩点将暂时从报表中移出。`)) {
                        await onBatchReopen(pubPlans.map(p => p.id));
                      }
                    }}
                    title="将该项目下全部已发布的月份方案批量撤回为草稿"
                  >
                    <RotateCcw size={13} /> 批量撤回已发布 ({singlePlans.filter(p => p.status === 'published').length})
                  </button>
                )}
              </div>
            )}
          </div>

          {singleDetail && (
            <div className="quota-meter" style={{ margin: '-4px 0 18px' }}>
              <div className="quota-bar-track">
                <div className="quota-bar-fill quota-bar-published" style={{ width: `${singleDetail.publishedBudgetRate / 100}%` }} />
                <div className="quota-bar-fill quota-bar-draft" style={{ width: `${singleDetail.draftBudgetRate / 100}%` }} />
                <div className="quota-bar-fill quota-bar-remaining" style={{ width: `${singleDetail.remainingRate / 100}%` }} />
              </div>
            </div>
          )}

          <table style={{ marginTop: '16px', tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: colWidths.month, position: 'relative' }}>
                  <span>分配月份</span>
                  <div className="col-resize-handle" onMouseDown={e => { e.preventDefault(); handleColResize('month', e.clientX, colWidths.month); }} title="拖动调整列宽" />
                </th>
                <th style={{ width: colWidths.budget, position: 'relative' }}>
                  <span>月度预算比例</span>
                  <div className="col-resize-handle" onMouseDown={e => { e.preventDefault(); handleColResize('budget', e.clientX, colWidths.budget); }} title="拖动调整列宽" />
                </th>
                <th style={{ width: colWidths.amount, position: 'relative' }}>
                  <span>当月额度</span>
                  <div className="col-resize-handle" onMouseDown={e => { e.preventDefault(); handleColResize('amount', e.clientX, colWidths.amount); }} title="拖动调整列宽" />
                </th>
                <th style={{ width: colWidths.detail, position: 'relative' }}>
                  <span>成员分配明细（按分配比例从大到小排列）</span>
                  <div className="col-resize-handle" onMouseDown={e => { e.preventDefault(); handleColResize('detail', e.clientX, colWidths.detail); }} title="拖动调整列宽" />
                </th>
                <th style={{ width: colWidths.status, position: 'relative' }}>
                  <span>状态</span>
                  <div className="col-resize-handle" onMouseDown={e => { e.preventDefault(); handleColResize('status', e.clientX, colWidths.status); }} title="拖动调整列宽" />
                </th>
                <th className="actions" style={{ width: colWidths.actions, position: 'relative' }}>
                  <span>操作</span>
                  <div className="col-resize-handle" onMouseDown={e => { e.preventDefault(); handleColResize('actions', e.clientX, colWidths.actions); }} title="拖动调整列宽" />
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedSinglePlans.map(plan => {
                const amt = singleProject ? monthAmount(singleProject, plan) : 0;
                const sortedEntries = [...plan.entries].sort((a, b) => b.rate - a.rate);
                const contentCount = plan.entries.filter(e => e.workContent?.trim()).length;
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <tr
                    key={plan.id}
                    draggable
                    onDragStart={() => handleDragStart(plan.id)}
                    onDragOver={e => handleDragOver(e, plan.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`draggable-plan-row ${draggedPlanId === plan.id ? 'dragging' : ''}`}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? '#f6fbf8' : undefined,
                      borderLeft: isSelected ? '4px solid #166534' : undefined
                    }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="row-drag-handle" title="按住拖拽调整行顺序"><GripVertical size={14} /></span>
                        <b>{plan.month}</b>
                      </div>
                    </td>
                    <td>
                      <div><b>{pct(plan.budget)}</b></div>
                      {(() => {
                        const plannedQuota = singleProject?.quotaSchedule?.find(s => s.month === plan.month);
                        if (!plannedQuota) return null;
                        const diff = plan.budget - plannedQuota.rate;
                        return (
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                            <div>规划: {pct(plannedQuota.rate)}</div>
                            <div>
                              偏差: {diff > 0 ? (
                                <span style={{ color: '#b45309', fontWeight: 600 }}>+{pct(diff)}</span>
                              ) : diff < 0 ? (
                                <span style={{ color: '#0284c7', fontWeight: 600 }}>-{pct(-diff)}</span>
                              ) : (
                                <span style={{ color: '#166534', fontWeight: 600 }}>持平</span>
                              )}
                            </div>
                            {plannedQuota.milestone && (
                              <div style={{ marginTop: '2px' }}>
                                <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0369a1', padding: '1px 5px', borderRadius: '4px' }}>
                                  {plannedQuota.milestone}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td><b>{wan(amt)} 万元</b></td>
                    <td>
                      {memberViewMode === 'table' ? (
                        <table className="plan-member-mini-table">
                          <thead>
                            <tr>
                              <th style={{ width: '80px' }}>成员姓名</th>
                              <th style={{ width: '70px' }}>专业组</th>
                              <th style={{ width: '75px', textAlign: 'right' }}>分配比例</th>
                              <th style={{ width: '105px', textAlign: 'right' }}>当月额度(万元)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedEntries.map(e => {
                              const emp = state.employees.find(x => x.id === e.employeeId);
                              const memberAmount = amt ? Math.round((amt * e.rate) / 10000) : 0;
                              return (
                                <tr key={e.employeeId}>
                                  <td>
                                    <b>{emp?.name || e.employeeId}</b>
                                    {emp?.id === singleProject?.owner && <span title="项目负责人" style={{ marginLeft: 3, fontSize: 10 }}>👑</span>}
                                  </td>
                                  <td><GroupTag group={emp?.group} /></td>
                                  <td style={{ textAlign: 'right', fontWeight: 600, color: e.rate > 0 ? '#166534' : '#94a3b8' }}>
                                    {pct(e.rate)}
                                  </td>
                                  <td style={{ textAlign: 'right', color: '#1e293b', fontWeight: e.rate > 0 ? 600 : 400 }}>
                                    {score(memberAmount)} 万元
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <div className="compact-member-capsules">
                          {sortedEntries.map(e => {
                            const emp = state.employees.find(x => x.id === e.employeeId);
                            const memberAmount = amt ? Math.round((amt * e.rate) / 10000) : 0;
                            const isOwner = emp?.id === singleProject?.owner;
                            return (
                              <div
                                key={e.employeeId}
                                className={`member-capsule ${e.rate > 0 ? (e.rate >= 2000 ? 'high' : 'normal') : 'zero'}`}
                                title={`${emp?.name} (${emp?.group || '未分组'}): 分配比例 ${pct(e.rate)}，折合额度 ${score(memberAmount)} 万元${e.workContent ? `\n工作内容：${e.workContent}` : ''}`}
                              >
                                <span className="capsule-name">
                                  {emp?.name || e.employeeId}
                                  {isOwner && <span style={{ fontSize: 10, marginLeft: 2 }}>👑</span>}
                                </span>
                                <span className="capsule-rate">{pct(e.rate)}</span>
                                <span className="capsule-amount">{score(memberAmount)}万</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div style={{ marginTop: '6px' }}>
                        <button
                          type="button"
                          className="text-button"
                          style={{ fontSize: '11px', color: contentCount > 0 ? '#166534' : '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedPlanId(plan.id);
                            const el = document.getElementById('work-content-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          title="点击跳转至下方独立区域查看该月完整工作内容描述"
                        >
                          <FileText size={12} /> 查看工作内容描述 ({contentCount}/{plan.entries.length} 人已填)
                        </button>
                      </div>
                    </td>
                    <td>
                      <Badge tone={plan.status === 'published' ? 'green' : 'amber'}>
                        {plan.status === 'published' ? '已发布' : '草稿待发布'}
                      </Badge>
                    </td>
                    <td className="actions" onClick={e => e.stopPropagation()}>
                      {canManageSingleProject ? (
                        plan.status === 'draft' ? (
                          <>
                            <button onClick={() => onEdit(plan)}><Pencil size={13} />编辑</button>
                            <button onClick={() => onAction('plan.publish', plan)}><Check size={13} />发布</button>
                            <button className="danger-link" onClick={() => onAction('plan.delete', plan)}><Trash2 size={13} />删除</button>
                          </>
                        ) : (
                          <button onClick={() => onAction('plan.reopen', plan)}><RotateCcw size={13} />撤回草稿</button>
                        )
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>只读查看</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {singlePlans.length === 0 && (
                <tr><td colSpan={6}><Empty text="当前项目还没有配置任何月度分配" /></td></tr>
              )}
            </tbody>
          </table>

          {selectedPlan && (
            <div className="work-content-showcase-panel" id="work-content-section" style={{ marginTop: '24px' }}>
              <div className="work-showcase-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="work-showcase-icon">
                    <FileText size={18} color="#166534" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', color: '#14532d', fontWeight: 700 }}>
                      【{selectedPlan.month}】项目成员当月工作内容与执行记录
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      共 {selectedPlan.entries.length} 位成员 · 已登记工作内容 {selectedPlan.entries.filter(e => e.workContent?.trim()).length} 人 · 当月额度 {wan(singleProject ? monthAmount(singleProject, selectedPlan) : 0)} 万元
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {singlePlans.length > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '6px', padding: '2px' }}>
                      {singlePlans.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPlanId(p.id)}
                          style={{
                            border: 'none',
                            background: p.id === selectedPlan.id ? '#ffffff' : 'transparent',
                            color: p.id === selectedPlan.id ? '#166534' : '#64748b',
                            fontWeight: p.id === selectedPlan.id ? 700 : 400,
                            boxShadow: p.id === selectedPlan.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                            padding: '4px 10px',
                            borderRadius: '5px',
                            fontSize: '11.5px',
                            cursor: 'pointer'
                          }}
                        >
                          {p.month}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    className="secondary"
                    style={{ padding: '4px 10px', fontSize: '12px', gap: '4px' }}
                    onClick={() => {
                      const lines = ['成员姓名,专业组,分配比例,当月折合额度(万元),当月工作内容描述'];
                      const amt = singleProject ? monthAmount(singleProject, selectedPlan) : 0;
                      const sorted = [...selectedPlan.entries].sort((a, b) => b.rate - a.rate);
                      for (const e of sorted) {
                        const emp = state.employees.find(x => x.id === e.employeeId);
                        const mAmount = amt ? Math.round((amt * e.rate) / 10000) : 0;
                        lines.push(`"${emp?.name || e.employeeId}","${emp?.group || ''}","${pct(e.rate)}","${score(mAmount)}","${(e.workContent || '').replace(/"/g, '""')}"`);
                      }
                      triggerDownload(lines.join('\n'), `${singleProject?.code || '项目'}_${selectedPlan.month}_成员工作内容明细.csv`);
                    }}
                    title="导出当月成员分配及工作内容描述为 CSV"
                  >
                    <Download size={13} /> 导出工作内容 CSV
                  </button>
                </div>
              </div>

              <div className="work-cards-grid">
                {[...selectedPlan.entries].sort((a, b) => b.rate - a.rate).map(e => {
                  const emp = state.employees.find(x => x.id === e.employeeId);
                  const amt = singleProject ? monthAmount(singleProject, selectedPlan) : 0;
                  const memberAmount = amt ? Math.round((amt * e.rate) / 10000) : 0;
                  const isOwner = emp?.id === singleProject?.owner;
                  const hasContent = !!e.workContent?.trim();
                  return (
                    <div key={e.employeeId} className={`work-card-item ${hasContent ? 'has-content' : 'empty-content'}`}>
                      <div className="work-card-top">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <b style={{ fontSize: '13.5px', color: '#1e293b' }}>
                            {emp?.name || e.employeeId}
                          </b>
                          {isOwner && <span title="项目负责人" style={{ fontSize: '12px' }}>👑</span>}
                          <GroupTag group={emp?.group} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: e.rate > 0 ? '#166534' : '#94a3b8' }}>
                            {pct(e.rate)}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {score(memberAmount)} 万元
                          </span>
                        </div>
                      </div>

                      <div className="work-card-body">
                        {hasContent ? (
                          <p className="work-content-text">{e.workContent}</p>
                        ) : (
                          <span className="work-content-placeholder">（当月暂无工作内容记录）</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// -------------------------------------------------------------
// 3.5 Project Groups View (项目组与协作团队管理)
// -------------------------------------------------------------
function GroupEditModal({
  state,
  value,
  currentActorId,
  onClose,
  onSave,
}: {
  state: State;
  value: ProjectGroup | 'new';
  currentActorId?: string;
  onClose(): void;
  onSave(group: ProjectGroup): void;
}) {
  const old = value === 'new' ? null : value;
  const [name, setName] = useState(old?.name || '');
  const [type, setType] = useState<string>(old?.type || '项目组');

  // 项目组负责人默认为组长或者当前管理员
  const defaultLeader = useMemo(() => {
    if (old?.leaderId) return old.leaderId;
    const groupLeader = state.employees.find(e => e.active && (e.groupRole === '组长' || (e.position && e.position.includes('组长'))));
    if (groupLeader) return groupLeader.id;
    if (currentActorId) {
      const curAdmin = state.employees.find(e => e.id === currentActorId && e.active);
      if (curAdmin) return curAdmin.id;
    }
    const adminEmp = state.employees.find(e => e.active && e.role === 'admin');
    if (adminEmp) return adminEmp.id;
    return state.employees.find(e => e.active)?.id || '';
  }, [old, state.employees, currentActorId]);

  const [leaderId, setLeaderId] = useState(old?.leaderId || defaultLeader);
  const [description, setDescription] = useState(old?.description || '');
  // 不在程序中设置默认组员，组员必须从员工与专业组中导入的组员手动配置
  const [members, setMembers] = useState<string[]>(old?.memberIds || []);
  const [rates, setRates] = useState<Record<string, string>>(() => {
    if (old?.defaultRates) {
      return Object.fromEntries(Object.entries(old.defaultRates).map(([id, r]) => [id, (r / 100).toFixed(2).replace(/\.00$/, '')]));
    }
    return {};
  });
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [searchMember, setSearchMember] = useState('');
  const [showRateConfig, setShowRateConfig] = useState(!!old?.defaultRates && Object.keys(old.defaultRates).length > 0);
  const [error, setError] = useState('');

  const toggleMember = (id: string) => {
    setMembers(prev => {
      const exists = prev.includes(id);
      if (exists) {
        if (leaderId === id) setLeaderId('');
        const nextRates = { ...rates };
        delete nextRates[id];
        setRates(nextRates);
        return prev.filter(m => m !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const selectEntireGroup = (grpName: string) => {
    const matched = state.employees.filter(e => e.active && e.group && e.group.includes(grpName)).map(e => e.id);
    setMembers(prev => Array.from(new Set([...prev, ...matched])));
  };

  const handleEqualRates = () => {
    if (members.length === 0) return;
    const n = members.length;
    const base = Math.floor(10000 / n);
    let rem = 10000 - base * n;
    const next: Record<string, string> = {};
    members.forEach((id, idx) => {
      const val = base + (idx < rem ? 1 : 0);
      next[id] = (val / 100).toFixed(2).replace(/\.00$/, '');
    });
    setRates(next);
  };

  const handleDistributeRemaining = () => {
    let sum = 0;
    for (const id of members) {
      const v = parseFloat(rates[id] || '0') || 0;
      sum += Math.round(v * 100);
    }
    const rem = 10000 - sum;
    if (rem <= 0) return;
    const target = (leaderId && members.includes(leaderId)) ? leaderId : members[0];
    if (!target) return;
    const cur = parseFloat(rates[target] || '0') || 0;
    const nextVal = Math.round(cur * 100) + rem;
    setRates(prev => ({ ...prev, [target]: (nextVal / 100).toFixed(2).replace(/\.00$/, '') }));
  };

  const handleResetRates = () => {
    setRates({});
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError('请输入团队/项目组名称');
      return;
    }
    const parsedRates: Record<string, number> = {};
    let totalRate = 0;
    if (showRateConfig && members.length > 0) {
      for (const id of members) {
        const v = parseFloat(rates[id] || '0') || 0;
        const b = Math.round(v * 100);
        if (b > 0) {
          parsedRates[id] = b;
          totalRate += b;
        }
      }
      if (totalRate > 0 && totalRate !== 10000) {
        if (!confirm(`当前配置的默认分配比例合计为 ${(totalRate / 100).toFixed(2)}%，未精确等于 100%，是否仍要保存？`)) {
          return;
        }
      }
    }

    const saved: ProjectGroup = {
      id: old?.id || `cg_${Date.now()}`,
      name: name.trim(),
      type,
      leaderId: leaderId || undefined,
      memberIds: members,
      defaultRates: Object.keys(parsedRates).length > 0 ? parsedRates : undefined,
      description: description.trim(),
      createdAt: old?.createdAt || new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onSave(saved);
    onClose();
  };

  const filteredEmployees = state.employees.filter(e => {
    if (!e.active) return false;
    if (filterGroup !== 'all' && (!e.group || !e.group.includes(filterGroup))) return false;
    if (searchMember && !e.name.toLowerCase().includes(searchMember.toLowerCase())) return false;
    return true;
  });

  return (
    <Modal title={old ? `✏️ 编辑【${old.name}】` : '➕ 新建项目组 / 协作团队'} subtitle="建立各类项目组、技术交流组或任务攻坚组模版；组员手动从员工与专业组配置" onClose={onClose} wide>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 12px', borderRadius: '6px', fontSize: '12.5px' }}>{error}</div>}

        {/* 顶部团队元数据卡片：紧凑两行网格布局 */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.1fr 1.5fr', gap: '12px' }}>
            <Field label="团队/项目组名称 *">
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                placeholder="例如：无人机飞控攻坚组、前沿算法技术交流组"
                autoFocus
                style={{ height: '36px' }}
              />
            </Field>

            <Field label="团队类别 *">
              <select value={type} onChange={e => setType(e.target.value)} style={{ height: '36px' }}>
                <option value="项目组">📁 项目组</option>
                <option value="技术交流组">💡 技术交流组</option>
                <option value="任务攻坚组">🚀 任务攻坚组</option>
                <option value="专项研发组">⚙️ 专项研发组</option>
                <option value="常规协同组">🤝 常规协同组</option>
              </select>
            </Field>

            <Field label="组长 / 团队负责人" hint="默认为组长或当前管理员">
              <select
                value={leaderId}
                onChange={e => {
                  const val = e.target.value;
                  setLeaderId(val);
                  if (val && !members.includes(val)) {
                    setMembers(prev => [val, ...prev]);
                  }
                }}
                style={{ height: '36px' }}
              >
                <option value="">-- 未指定负责人 (可后续选定) --</option>
                {state.employees.filter(e => e.active).map(emp => {
                  const isGroupLeader = emp.groupRole === '组长' || emp.position?.includes('组长');
                  const isAdmin = emp.role === 'admin';
                  return (
                    <option key={emp.id} value={emp.id}>
                      {isGroupLeader ? '🌟 ' : isAdmin ? '👑 ' : ''}{emp.name} ({emp.group || emp.department}) {isGroupLeader ? '· 组长' : isAdmin ? '· 管理员' : ''}
                    </option>
                  );
                })}
              </select>
            </Field>
          </div>

          <Field label="团队工作目标与任务职责说明">
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="简要描述该团队的使命、研讨主题或攻坚交付目标..."
              style={{ height: '36px' }}
            />
          </Field>
        </div>

        {/* 成员多选区 */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <b style={{ fontSize: '13px', color: '#1e293b' }}>
                选择团队成员 (已选 {members.length} 人)
              </b>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['总体组', '产品组', '研发组'].map(g => (
                  <button
                    key={g}
                    type="button"
                    style={{ border: '1px solid #cbd5cf', background: '#fff', borderRadius: '5px', padding: '2px 8px', fontSize: '11px', cursor: 'pointer', color: '#047857', fontWeight: 500 }}
                    onClick={() => selectEntireGroup(g)}
                  >
                    + 一键全选{g}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                placeholder="搜索成员姓名..."
                value={searchMember}
                onChange={e => setSearchMember(e.target.value)}
                style={{ width: '130px', padding: '3px 8px', fontSize: '12px', height: '28px' }}
              />
              <div className="filter-pills" style={{ margin: 0 }}>
                {['all', '总体组', '产品组', '研发组'].map(g => (
                  <button
                    key={g}
                    type="button"
                    className={`pill-btn ${filterGroup === g ? 'active' : ''}`}
                    style={{ padding: '2px 8px', fontSize: '11px' }}
                    onClick={() => setFilterGroup(g)}
                  >
                    {g === 'all' ? '全部' : g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '6px', maxHeight: '170px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredEmployees.map(emp => {
              const selected = members.includes(emp.id);
              const isLeader = emp.id === leaderId;
              return (
                <div
                  key={emp.id}
                  onClick={() => toggleMember(emp.id)}
                  style={{
                    background: selected ? (isLeader ? '#fefce8' : '#ecfdf5') : '#fff',
                    border: selected ? (isLeader ? '1px solid #facc15' : '1px solid #10b981') : '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                      {isLeader && <span title="组长/负责人">👑</span>}
                      <span>{emp.name}</span>
                      {emp.employeeNo && <span style={{ fontSize: '10px', color: '#0369a1', background: '#e0f2fe', padding: '0 4px', borderRadius: '4px' }}>[{emp.employeeNo}]</span>}
                      <GroupTag group={emp.group} />
                    </div>
                    <small style={{ fontSize: '10px', color: '#64748b', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{emp.department}</small>
                  </div>
                  {selected && <Check size={14} color={isLeader ? '#854d0e' : '#059669'} style={{ flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* 默认分配比例配置（可选） */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: showRateConfig ? '8px' : '0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>
              <input
                type="checkbox"
                checked={showRateConfig}
                onChange={e => {
                  setShowRateConfig(e.target.checked);
                  if (e.target.checked && Object.keys(rates).length === 0) handleEqualRates();
                }}
              />
              配置该团队默认月度分配比例（在月度分配中套用时自动填入）
            </label>
            {showRateConfig && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(() => {
                  let sum = 0;
                  for (const id of members) {
                    const v = parseFloat(rates[id] || '0') || 0;
                    sum += Math.round(v * 100);
                  }
                  return (
                    <span style={{ fontSize: '12px', fontWeight: 700, color: sum === 10000 ? '#15803d' : '#b91c1c' }}>
                      合计: {(sum / 100).toFixed(2)}% / 100%
                    </span>
                  );
                })()}
                <button type="button" style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }} onClick={handleEqualRates}>
                  ⚖️ 全员平分
                </button>
                <button type="button" style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }} onClick={handleDistributeRemaining}>
                  🎯 补齐剩余
                </button>
                <button type="button" style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', color: '#64748b', cursor: 'pointer' }} onClick={handleResetRates}>
                  🔄 清零
                </button>
              </div>
            )}
          </div>

          {showRateConfig && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '6px', maxHeight: '130px', overflowY: 'auto', paddingTop: '4px' }}>
              {members.map(empId => {
                const emp = state.employees.find(e => e.id === empId);
                const isLeader = empId === leaderId;
                return (
                  <div key={empId} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 500, color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      {isLeader && '👑'} {emp?.name || empId}
                    </span>
                    <div
                      className="suffix-input"
                      style={{ width: '80px', height: '28px' }}
                      onClick={e => {
                        const input = e.currentTarget.querySelector('input');
                        if (input && document.activeElement !== input) input.focus();
                      }}
                    >
                      <input
                        type="text"
                        inputMode="decimal"
                        value={rates[empId] || ''}
                        onChange={e => setRates(prev => ({ ...prev, [empId]: e.target.value }))}
                        placeholder="0.00"
                        style={{ textAlign: 'right', fontSize: '11.5px', height: '26px' }}
                      />
                      <span>%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: '4px' }}>
          <button type="button" className="secondary" onClick={onClose}>取消</button>
          <button type="button" className="primary" onClick={handleSave}><Save size={15} />保存项目组</button>
        </div>
      </div>
    </Modal>
  );
}

function GroupsView({
  state,
  groups,
  currentActorId,
  onSaveGroups,
  onNewProjectWithGroup,
}: {
  state: State;
  groups: ProjectGroup[];
  currentActorId?: string;
  onSaveGroups(next: ProjectGroup[]): void;
  onNewProjectWithGroup?(group: ProjectGroup): void;
}) {
  const [filterType, setFilterType] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupEdit, setGroupEdit] = useState<ProjectGroup | 'new' | null>(null);
  const [notice, setNotice] = useState('');
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = (group: ProjectGroup) => {
    if (confirm(`确定要删除团队【${group.name}】（${group.type}）吗？此操作不可撤销。`)) {
      const updated = groups.filter(g => g.id !== group.id);
      onSaveGroups(updated);
      setNotice(`已删除团队【${group.name}】`);
    }
  };

  const handleDuplicate = (group: ProjectGroup) => {
    const copy: ProjectGroup = {
      ...group,
      id: `cg_${Date.now()}`,
      name: `${group.name} (副本)`,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onSaveGroups([...groups, copy]);
    setNotice(`已成功复制团队【${copy.name}】`);
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const text = evt.target?.result as string;
        const { groups: importedGroups, newEmployees } = parseProjectGroupsCsvText(text, state);
        if (importedGroups.length === 0) throw new Error('未在 CSV 中解析到有效项目组或团队数据');
        if (newEmployees.length > 0) {
          state.employees.push(...newEmployees);
        }
        if (importedGroups.length === 1 && importedGroups[0].name === '导入项目组') {
          const autoName = file.name.replace(/\.csv$/i, '') || '导入团队';
          importedGroups[0].name = autoName;
          importedGroups[0].type = autoName.includes('交流') ? '技术交流组' : autoName.includes('攻坚') ? '任务攻坚组' : '项目组';
          importedGroups[0].description = `通过 CSV 导入（共 ${importedGroups[0].memberIds.length} 人）`;
        }
        const importedNames = new Set(importedGroups.map(g => g.name));
        const remaining = groups.filter(g => !importedNames.has(g.name));
        const updated = [...remaining, ...importedGroups];
        onSaveGroups(updated);
        const totalMems = importedGroups.reduce((acc, g) => acc + g.memberIds.length, 0);
        setNotice(`✅ 成功导入 ${importedGroups.length} 个项目组/团队（共 ${totalMems} 名成员配置）！${newEmployees.length > 0 ? `同步录入新员工 ${newEmployees.length} 人` : ''}`);
      } catch (err) {
        alert(errorText(err));
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      if (filterType !== '全部' && g.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const leaderName = state.employees.find(e => e.id === g.leaderId)?.name.toLowerCase() || '';
        const memberNames = g.memberIds.map(id => state.employees.find(e => e.id === id)?.name.toLowerCase() || '').join(' ');
        if (!g.name.toLowerCase().includes(q) && !(g.description || '').toLowerCase().includes(q) && !leaderName.includes(q) && !memberNames.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [groups, filterType, searchQuery, state.employees]);

  // 统计数据
  const stats = useMemo(() => {
    const total = groups.length;
    const projectTypeCount = groups.filter(g => g.type === '项目组').length;
    const techTypeCount = groups.filter(g => g.type === '技术交流组').length;
    const strikeTypeCount = groups.filter(g => g.type === '任务攻坚组').length;
    const coveredEmpSet = new Set<string>();
    groups.forEach(g => g.memberIds.forEach(id => coveredEmpSet.add(id)));
    return { total, projectTypeCount, techTypeCount, strikeTypeCount, coveredCount: coveredEmpSet.size };
  }, [groups]);

  return (
    <section className="panel full groups-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
        <PageTitle
          eyebrow="TEAM & CROSS-FUNCTIONAL GROUP MANAGEMENT"
          title="项目组与协作团队管理"
          description="建立和管理跨专业项目组、技术交流组、任务攻坚组等；支持灵活设置团队负责人、成员编制与默认比例，可在新建项目与月度分配中随时一键调取。"
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="file" ref={csvFileInputRef} accept=".csv" style={{ display: 'none' }} onChange={handleCsvImport} />
          <button className="primary" onClick={() => setGroupEdit('new')}>
            <Plus size={15} /> 新建项目组 / 协作团队
          </button>
          <button className="secondary" onClick={() => csvFileInputRef.current?.click()} title="通过 CSV 表格批量导入团队配置">
            <Upload size={14} /> 导入团队 CSV
          </button>
          <button className="secondary" onClick={() => triggerDownload(exportProjectGroupsCsv(groups, state.employees), `项目组与团队花名册-${nowMonth()}.csv`)} title="导出全部项目组与成员配置">
            <Download size={14} /> 导出团队 CSV
          </button>
          <button className="text-button" onClick={() => triggerDownload(getProjectGroupTemplateCsv(), '常用项目组与默认分配模板.csv')} title="下载团队导入标准模板">
            <Download size={13} /> 下载模板
          </button>
        </div>
      </div>

      {notice && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '8px 14px', borderRadius: '8px', fontSize: '12.5px', color: '#166534', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{notice}</span>
          <button type="button" className="icon-button" style={{ width: 20, height: 20 }} onClick={() => setNotice('')}><X size={13} /></button>
        </div>
      )}

      {/* 统计指标卡 */}
      <div className="group-stats-grid">
        <div className="group-stat-card">
          <div className="group-stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>📁</div>
          <div>
            <div className="group-stat-value">{stats.total}</div>
            <div className="group-stat-label">全部协作团队数</div>
          </div>
        </div>
        <div className="group-stat-card">
          <div className="group-stat-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>💼</div>
          <div>
            <div className="group-stat-value">{stats.projectTypeCount}</div>
            <div className="group-stat-label">项目组</div>
          </div>
        </div>
        <div className="group-stat-card">
          <div className="group-stat-icon" style={{ background: '#fdf4ff', color: '#86198f' }}>💡</div>
          <div>
            <div className="group-stat-value">{stats.techTypeCount}</div>
            <div className="group-stat-label">技术交流组</div>
          </div>
        </div>
        <div className="group-stat-card">
          <div className="group-stat-icon" style={{ background: '#fff7ed', color: '#c2410c' }}>🚀</div>
          <div>
            <div className="group-stat-value">{stats.strikeTypeCount}</div>
            <div className="group-stat-label">任务攻坚组</div>
          </div>
        </div>
        <div className="group-stat-card">
          <div className="group-stat-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>👥</div>
          <div>
            <div className="group-stat-value">{stats.coveredCount}</div>
            <div className="group-stat-label">覆盖部门员工数</div>
          </div>
        </div>
      </div>

      {/* 过滤标签与搜索栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <div className="filter-pills" style={{ margin: 0 }}>
          {['全部', '项目组', '技术交流组', '任务攻坚组', '专项研发组'].map(t => {
            const count = t === '全部' ? groups.length : groups.filter(g => g.type === t).length;
            return (
              <button
                key={t}
                type="button"
                className={`pill-btn ${filterType === t ? 'active' : ''}`}
                onClick={() => setFilterType(t)}
              >
                {t} ({count})
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={14} color="#64748b" />
          <input
            type="text"
            placeholder="搜索组名、组长、成员姓名或工作目标..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '260px', padding: '5px 10px', fontSize: '12.5px' }}
          />
          {searchQuery && (
            <button className="icon-button" style={{ width: 22, height: 22 }} onClick={() => setSearchQuery('')}><X size={12} /></button>
          )}
        </div>
      </div>

      {/* 团队卡片网格 */}
      <div className="group-cards-grid">
        {filteredGroups.map(group => {
          const leader = state.employees.find(e => e.id === group.leaderId);
          const typeClass = group.type === '项目组' ? 'type-project' : group.type === '技术交流组' ? 'type-tech' : group.type === '任务攻坚组' ? 'type-strike' : group.type === '专项研发组' ? 'type-special' : 'type-other';
          const typeIcon = group.type === '项目组' ? '📁' : group.type === '技术交流组' ? '💡' : group.type === '任务攻坚组' ? '🚀' : group.type === '专项研发组' ? '⚙️' : '🤝';
          const hasRates = !!group.defaultRates && Object.keys(group.defaultRates).length > 0;

          return (
            <div key={group.id} className="project-group-card">
              <div>
                <div className="project-group-card-header">
                  <div className="project-group-title">
                    <span className={`group-type-tag ${typeClass}`}>{typeIcon} {group.type}</span>
                    <span>{group.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button className="icon-button" style={{ width: 26, height: 26 }} title="编辑此团队" onClick={() => setGroupEdit(group)}>
                      <Pencil size={13} />
                    </button>
                    <button className="icon-button" style={{ width: 26, height: 26 }} title="复制为新团队" onClick={() => handleDuplicate(group)}>
                      <Copy size={13} />
                    </button>
                    <button className="icon-button" style={{ width: 26, height: 26, color: '#dc2626' }} title="删除团队" onClick={() => handleDelete(group)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* 组长信息 */}
                <div className="group-leader-banner">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px' }}>👑</span>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>
                        {leader ? leader.name : '未指定负责人'}
                        {leader?.group && <span style={{ marginLeft: 6 }}><GroupTag group={leader.group} /></span>}
                      </div>
                      <small style={{ color: '#64748b', fontSize: '11px' }}>
                        {leader ? `${leader.department} · 团队负责人/组长` : '可在编辑中指定组长'}
                      </small>
                    </div>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    共 <b>{group.memberIds.length}</b> 人
                  </span>
                </div>

                {/* 描述与使命 */}
                {group.description && (
                  <p className="group-desc-text">{group.description}</p>
                )}

                {/* 成员标签 */}
                <div className="group-member-chips-box">
                  {group.memberIds.map(empId => {
                    const emp = state.employees.find(e => e.id === empId);
                    const isLeader = empId === group.leaderId;
                    const defaultRate = group.defaultRates?.[empId];
                    return (
                      <span key={empId} className={`group-member-chip ${isLeader ? 'is-leader' : ''}`}>
                        {isLeader && '👑'}
                        {emp?.name || empId}
                        {defaultRate ? <b style={{ color: '#166534', fontSize: '11px' }}>({(defaultRate / 100).toFixed(0)}%)</b> : null}
                      </span>
                    );
                  })}
                </div>

                {/* 默认比例预览 */}
                {hasRates && (
                  <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #edf2f7', marginBottom: '12px', fontSize: '11px', color: '#475569' }}>
                    <span style={{ fontWeight: 600, color: '#166534' }}>⚡ 默认分配比例：</span>
                    {Object.entries(group.defaultRates || {})
                      .filter(([, r]) => r > 0)
                      .slice(0, 4)
                      .map(([id, r]) => `${state.employees.find(e => e.id === id)?.name || id}: ${(r / 100).toFixed(0)}%`)
                      .join(' · ')}
                    {Object.keys(group.defaultRates || {}).length > 4 && ' ...'}
                  </div>
                )}
              </div>

              {/* 底部操作 */}
              <div className="group-actions-footer">
                <button
                  type="button"
                  className="secondary"
                  style={{ fontSize: '11.5px', padding: '4px 10px', color: '#1d4ed8' }}
                  onClick={() => onNewProjectWithGroup && onNewProjectWithGroup(group)}
                  title="使用此团队的成员与负责人快速创建新项目"
                >
                  <BriefcaseBusiness size={13} /> 快捷以此组立项
                </button>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="text-button"
                    style={{ fontSize: '11.5px', color: '#475569' }}
                    onClick={() => triggerDownload(exportProjectGroupsCsv([group], state.employees), `${group.name}-成员名单.csv`)}
                  >
                    <Download size={12} /> 导出
                  </button>
                  <button
                    type="button"
                    className="primary"
                    style={{ fontSize: '11.5px', padding: '4px 10px' }}
                    onClick={() => setGroupEdit(group)}
                  >
                    <Pencil size={12} /> 编辑团队
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div style={{ background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#64748b' }}>
          <FolderKanban size={36} color="#94a3b8" style={{ margin: '0 auto 10px', display: 'block' }} />
          <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 600 }}>暂无匹配的项目组或协作团队</p>
          <small>您可以点击右上角“➕ 新建项目组/协作团队”或“导入团队 CSV”快速建立跨专业攻坚组、技术交流组</small>
        </div>
      )}

      {/* 新建/编辑团队弹窗 */}
      {groupEdit && (
        <GroupEditModal
          state={state}
          value={groupEdit}
          currentActorId={currentActorId}
          onClose={() => setGroupEdit(null)}
          onSave={saved => {
            const exists = groups.some(g => g.id === saved.id);
            const updated = exists ? groups.map(g => g.id === saved.id ? saved : g) : [...groups, saved];
            onSaveGroups(updated);
            setNotice(`团队【${saved.name}】已成功${exists ? '更新' : '创建'}！`);
          }}
        />
      )}
    </section>
  );
}

// -------------------------------------------------------------
// 4. Employees View (员工与专业组管理)
// -------------------------------------------------------------
function EmployeesView({ state, isAdmin, currentActorId, onAdd, onEdit, onToggleAdmin, onDelete, onNavigateIo, onImportEmployees }: {
  state: State;
  isAdmin: boolean;
  currentActorId?: string;
  onAdd(): void;
  onEdit(employee: Employee): void;
  onToggleAdmin?(employee: Employee): void;
  onDelete(employee: Employee): void;
  onNavigateIo(): void;
  onImportEmployees(employees: any[]): Promise<void>;
}) {
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const empCsvInputRef = useRef<HTMLInputElement>(null);

  const handleEmpCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async evt => {
      try {
        const text = evt.target?.result as string;
        const list = parseEmployeeCsvText(text);
        if (list.length === 0) throw new Error('未在 CSV 中解析到有效员工数据');
        await onImportEmployees(list);
      } catch (err) {
        alert(errorText(err));
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const filtered = state.employees.filter(e => {
    if (groupFilter !== 'all' && !(e.group && e.group.includes(groupFilter))) return false;
    if (search && !(e.name + (e.position || '') + e.department + (e.group || '') + (e.groupRole || '')).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <section className="panel full">
      <PageTitle
        eyebrow="DEPARTMENT & PROFESSIONAL GROUPS"
        title="员工与专业组管理"
        description="维护部门成员与专业组（总体组、产品组、研发组），支持职务与专业组职务评定、手动添加员工及按人员编制标准格式 CSV 批量导入。"
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="file" ref={empCsvInputRef} accept=".csv" style={{ display: 'none' }} onChange={handleEmpCsv} />
            <button className="secondary" onClick={() => triggerDownload(getEmployeeTemplateCsv(), '部门成员导入模板(人员编制标准格式).csv')}>
              <Download size={14} />下载编制模板
            </button>
            {isAdmin && (
              <button className="secondary" onClick={() => empCsvInputRef.current?.click()}>
                <Upload size={14} />导入员工 CSV
              </button>
            )}
            {isAdmin && (
              <button className="primary" onClick={onAdd}>
                <Plus size={14} />添加员工
              </button>
            )}
          </div>
        }
      />

      <div className="toolbar">
        <div className="filter-tabs">
          <button className={groupFilter === 'all' ? 'active' : ''} onClick={() => setGroupFilter('all')}>
            全部专业组 ({state.employees.length})
          </button>
          {DEFAULT_GROUPS.map(g => (
            <button
              key={g}
              className={groupFilter === g ? 'active' : ''}
              onClick={() => setGroupFilter(g)}
            >
              {g} ({state.employees.filter(e => e.group && e.group.includes(g)).length})
            </button>
          ))}
        </div>

        <div className="search-input-wrapper">
          <Search size={15} color="#82928a" />
          <input placeholder="搜索员工姓名、工号、职务、部门或专业组职务..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="icon-button" style={{ width: 20, height: 20 }} onClick={() => setSearch('')}><X size={12} /></button>}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style={{ width: '85px' }}>工号</th>
            <th>姓名</th>
            <th>职务</th>
            <th>专业组</th>
            <th>专业组职务</th>
            <th>所属部门</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>参与项目数</th>
            <th>状态</th>
            <th className="actions">操作</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(emp => {
            const prjCount = state.projects.filter(p => p.members.includes(emp.id)).length;
            return (
              <tr key={emp.id}>
                <td>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0369a1', background: '#f0f9ff', padding: '2px 7px', borderRadius: '4px', border: '1px solid #bae6fd', fontSize: '12px' }}>
                    {emp.employeeNo || emp.id}
                  </span>
                </td>
                <td><b>{emp.name}</b></td>
                <td><span style={{ color: '#334155', fontWeight: 500, fontSize: '12.5px' }}>{emp.position || '—'}</span></td>
                <td><GroupTag group={emp.group} /></td>
                <td><GroupRoleBadge role={emp.groupRole} /></td>
                <td>{emp.department}</td>
                <td style={{ color: emp.email ? '#334155' : '#94a3b8' }}>{emp.email || '—'}</td>
                <td>
                  <Badge tone={emp.role === 'admin' ? 'blue' : emp.role === 'auditor' ? 'green' : 'neutral'}>
                    {emp.role === 'admin' ? '👑 系统管理员' : emp.role === 'auditor' ? '📊 绩效核算员' : '普通成员'}
                  </Badge>
                </td>
                <td>{prjCount} 个项目</td>
                <td>
                  <Badge tone={emp.active ? 'green' : 'gray'}>
                    {emp.active ? '启用中' : '已停用'}
                  </Badge>
                </td>
                <td className="actions">
                  {isAdmin ? (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button onClick={() => onEdit(emp)}><Pencil size={13} />编辑</button>
                      {onToggleAdmin && emp.id !== currentActorId && (
                        <button
                          type="button"
                          style={{
                            fontSize: '11px',
                            padding: '3px 7px',
                            borderRadius: '4px',
                            background: emp.role === 'admin' ? '#fef3c7' : '#f0fdf4',
                            color: emp.role === 'admin' ? '#b45309' : '#15803d',
                            border: emp.role === 'admin' ? '1px solid #fde68a' : '1px solid #bbf7d0',
                          }}
                          title={emp.role === 'admin' ? '降级为普通成员' : '提升为系统管理员'}
                          onClick={() => onToggleAdmin(emp)}
                        >
                          {emp.role === 'admin' ? '降为成员' : '设为管理员'}
                        </button>
                      )}
                      {emp.id !== currentActorId && (
                        <button className="danger-link" onClick={() => onDelete(emp)}><Trash2 size={13} />删除</button>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>只读查看</span>
                  )}
                </td>
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr><td colSpan={11}><Empty text="未找到符合条件的员工" /></td></tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

// -------------------------------------------------------------
// 5. Analytics View (需求3 & 4：各种趋势图与柱状图)
// -------------------------------------------------------------
function AnalyticsView({ state }: { state: State }) {
  const [activeProjectId, setActiveProjectId] = useState(state.projects[0]?.id || '');
  const [projectTrendMode, setProjectTrendMode] = useState<'pct' | 'amount'>('pct');
  const [activeEmpId, setActiveEmpId] = useState(state.employees.filter(e => e.active)[0]?.id || '');
  const [year, setYear] = useState('2026');

  const project = state.projects.find(p => p.id === activeProjectId);
  const detail = useMemo(() => activeProjectId ? projectAllocDetail(state, activeProjectId) : null, [state, activeProjectId]);
  const projectTrend = useMemo(() => activeProjectId ? getProjectTrendData(state, activeProjectId) : [], [state, activeProjectId]);

  const yearMonths = useMemo(() => Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`), [year]);
  const monthlyBars = useMemo(() => getMonthlyBarData(state, yearMonths), [state, yearMonths]);
  const groupMonthlyBars = useMemo(() => getGroupMonthlyComparison(state, yearMonths), [state, yearMonths]);

  // Employee Monthly Trend Data
  const activeEmp = state.employees.find(e => e.id === activeEmpId);
  const empTrend = useMemo(() => activeEmpId ? getEmployeeTrendData(state, activeEmpId, yearMonths) : [], [state, activeEmpId, yearMonths]);
  const empYearTotalPoints = useMemo(() => empTrend.reduce((s, r) => s + r.points * 100, 0), [empTrend]);
  const empYearTotalWan = useMemo(() => (empYearTotalPoints / 1_000_000).toFixed(4), [empYearTotalPoints]);
  const empYearActiveMonths = useMemo(() => empTrend.filter(r => r.points > 0).length, [empTrend]);

  // Top 10 Employees for the year
  const topEmployeesBarData = useMemo(() => {
    const rep = rangeReport(state, { months: yearMonths, status: 'published' });
    return rep.slice(0, 10).map(r => ({
      name: r.employee.name,
      points: Number((r.points / 100).toFixed(2)),
      wan: Number((r.points / 1_000_000).toFixed(4)),
      group: r.employee.group || '其他',
    }));
  }, [state, yearMonths]);

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageTitle
        eyebrow="CHARTS & VISUAL ANALYTICS"
        title="统计分析与趋势图表"
        description="可视化洞察项目完成比例消耗走势、剩余额度变化、员工月度获得额度趋势、各月份额度柱状图及专业组分润对比。"
      />

      {/* 需求3: 项目额度消耗趋势图与剩余额度趋势图（优化版：支持完成比例%与金额万元双维度切换、实时指标看版） */}
      <div className="chart-container">
        <div className="chart-header">
          <div>
            <h3><TrendingUp size={18} color="#15803d" />项目额度消耗与剩余走势图</h3>
            <p>展示选定项目生命周期各月份累计完成比例(%)与额度金额(万元)的演变轨迹</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="mode-toggle-group">
              <button
                type="button"
                className={projectTrendMode === 'pct' ? 'active' : ''}
                onClick={() => setProjectTrendMode('pct')}
              >
                完成比例走势 (%)
              </button>
              <button
                type="button"
                className={projectTrendMode === 'amount' ? 'active' : ''}
                onClick={() => setProjectTrendMode('amount')}
              >
                金额消耗走势 (万元)
              </button>
            </div>
            <select
              value={activeProjectId}
              onChange={e => setActiveProjectId(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '7px', border: '1px solid #cbd5cf', fontSize: '13px', background: '#fff' }}
            >
              {state.projects.map(p => (
                <option value={p.id} key={p.id}>{p.code} · {p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 选定项目的高阶关键指标卡 */}
        {detail && project && (
          <div className="chart-kpi-bar">
            <div className="chart-kpi-item">
              <span>工作令号</span>
              <strong style={{ color: '#166534' }}>{project.code}</strong>
              <small>{project.client ? `客户: ${project.client}` : '内部自研'}</small>
            </div>
            <div className="chart-kpi-item">
              <span>合同总金额</span>
              <strong>{detail.contractWan} 万元</strong>
              <small>100% 基准预算</small>
            </div>
            <div className="chart-kpi-item">
              <span>已规划额度</span>
              <strong style={{ color: '#15803d' }}>{detail.totalAllocatedWan} 万元</strong>
              <small>完成比例 {detail.totalBudgetPct}</small>
            </div>
            <div className="chart-kpi-item">
              <span>剩余可用额度</span>
              <strong style={{ color: detail.remainingRate > 0 ? '#b45309' : '#475569' }}>
                {detail.remainingWan} 万元
              </strong>
              <small>剩余比例 {detail.remainingPct}</small>
            </div>
            <div className="chart-kpi-item">
              <span>执行周期</span>
              <strong>{project.start} 至 {project.end || '持续推进/待定'}</strong>
              <small>{project.status === 'active' ? '执行中' : '已结项'}</small>
            </div>
          </div>
        )}

        {project && projectTrend.length > 0 ? (
          <div style={{ height: 320, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectTrend} margin={{ top: 12, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ca8a04" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ca8a04" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5ebe7" />
                <XAxis dataKey="month" stroke="#718096" fontSize={12} />
                <YAxis stroke="#718096" fontSize={12} unit={projectTrendMode === 'pct' ? '%' : '万'} />
                <Tooltip
                  formatter={(val: any, name: any) => {
                    if (projectTrendMode === 'pct') {
                      const labelMap: Record<string, string> = {
                        cumulativeRate: '项目累计完成比例',
                        remainingRate: '项目剩余额度比例',
                        monthlyRate: '当月规划比例',
                      };
                      return [`${val}%`, labelMap[name] || name];
                    } else {
                      const labelMap: Record<string, string> = {
                        cumulativeAmountWan: '累计已规划金额',
                        remainingAmountWan: '剩余可用额度金额',
                        monthlyAmountWan: '当月分配金额',
                      };
                      return [`${val} 万元`, labelMap[name] || name];
                    }
                  }}
                  contentStyle={{ backgroundColor: '#182f27', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend
                  formatter={(val) => {
                    if (projectTrendMode === 'pct') {
                      if (val === 'cumulativeRate') return '项目累计完成比例 (%)';
                      if (val === 'remainingRate') return '项目剩余比例 (%)';
                      if (val === 'monthlyRate') return '当月预算比例 (%)';
                    } else {
                      if (val === 'cumulativeAmountWan') return '累计已规划金额 (万元)';
                      if (val === 'remainingAmountWan') return '剩余可用额度 (万元)';
                      if (val === 'monthlyAmountWan') return '当月分配额度 (万元)';
                    }
                    return val;
                  }}
                />
                {projectTrendMode === 'pct' ? (
                  <>
                    <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: '100% 预算上限', position: 'insideTopRight', fill: '#64748b', fontSize: 11 }} />
                    <Area type="monotone" dataKey="cumulativeRate" stroke="#15803d" strokeWidth={3} fillOpacity={1} fill="url(#colorCumulative)" />
                    <Area type="monotone" dataKey="remainingRate" stroke="#ca8a04" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorRemaining)" />
                    <Line type="monotone" dataKey="monthlyRate" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  </>
                ) : (
                  <>
                    <ReferenceLine y={Number((project.contract / 1_000_000).toFixed(4))} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: `上限 ${wan(project.contract)}万`, position: 'insideTopRight', fill: '#64748b', fontSize: 11 }} />
                    <Area type="monotone" dataKey="cumulativeAmountWan" stroke="#15803d" strokeWidth={3} fillOpacity={1} fill="url(#colorCumulative)" />
                    <Area type="monotone" dataKey="remainingAmountWan" stroke="#ca8a04" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorRemaining)" />
                    <Line type="monotone" dataKey="monthlyAmountWan" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Empty text="请选择一个项目以查看趋势图" />
        )}
      </div>

      {/* 需求3: 员工获得额度趋势图（按月追踪每位员工的绩点与折合额度，附贡献明细） */}
      <div className="chart-container">
        <div className="chart-header">
          <div>
            <h3><TrendingUp size={18} color="#059669" />员工获得额度趋势图</h3>
            <p>追踪选定成员在 {year} 年度各月份获得的绩点与折合额度演变轨迹，透视贡献项目明细</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={activeEmpId}
              onChange={e => setActiveEmpId(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '7px', border: '1px solid #cbd5cf', fontSize: '13px', background: '#fff' }}
            >
              {state.employees.filter(e => e.active).map(e => (
                <option value={e.id} key={e.id}>{e.name} · {e.group || '未分组'} ({e.department})</option>
              ))}
            </select>
          </div>
        </div>

        {activeEmp && (
          <div className="chart-kpi-bar">
            <div className="chart-kpi-item">
              <span>员工姓名</span>
              <strong>{activeEmp.name} <GroupTag group={activeEmp.group} /></strong>
              <small>{activeEmp.department}</small>
            </div>
            <div className="chart-kpi-item">
              <span>年度累计绩点</span>
              <strong style={{ color: '#15803d' }}>{score(empYearTotalPoints)} 万</strong>
              <small>已发布生效绩点</small>
            </div>
            <div className="chart-kpi-item">
              <span>折合总额度</span>
              <strong style={{ color: '#059669' }}>{empYearTotalWan} 万元</strong>
              <small>1万绩点 = 1万元合同额</small>
            </div>
            <div className="chart-kpi-item">
              <span>有收益月份数</span>
              <strong>{empYearActiveMonths} / 12 个月</strong>
              <small>{empYearActiveMonths > 0 ? `月均 ${score(Math.round(empYearTotalPoints / empYearActiveMonths))} 万绩点` : '暂无收益'}</small>
            </div>
          </div>
        )}

        <div style={{ height: 300, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={empTrend} margin={{ top: 12, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEmpWan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5ebe7" />
              <XAxis dataKey="month" stroke="#718096" fontSize={11} tickFormatter={m => m.slice(5)} />
              <YAxis stroke="#718096" fontSize={11} unit="万" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div style={{ backgroundColor: '#182f27', padding: '10px 14px', borderRadius: '8px', color: '#fff', fontSize: '12px' }}>
                      <p style={{ margin: '0 0 6px', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }}>
                        {label} 获得额度明细
                      </p>
                      <p style={{ margin: '2px 0' }}>折合额度: <strong style={{ color: '#4ade80' }}>{item.wan} 万元</strong></p>
                      <p style={{ margin: '2px 0' }}>获得绩点: <strong>{score(item.points)} 万绩点</strong></p>
                      <p style={{ margin: '2px 0' }}>累计折合: <strong>{item.cumulativeWan} 万元</strong></p>
                      {item.contributions && item.contributions.length > 0 && (
                        <div style={{ marginTop: '6px', paddingTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.2)' }}>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>贡献项目明细:</span>
                          {item.contributions.map((c: any, ci: number) => (
                            <div key={ci} style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>
                              • {c.project}: {c.wan} 万元 ({score(c.points)} 万绩点)
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
              <Legend formatter={(val) => val === 'wan' ? '月度获得额度(万元)' : val === 'cumulativeWan' ? '年度累计获得额度(万元)' : val} />
              <Area type="monotone" dataKey="wan" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorEmpWan)" />
              <Line type="monotone" dataKey="cumulativeWan" stroke="#3b82f6" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 需求4: 各种柱状图（项目月度柱状图 + 员工月度柱状图 + 专业组柱状图） */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* 各月份项目已分配额度柱状图 */}
        <div className="chart-container">
          <div className="chart-header">
            <div>
              <h3><BarChart3 size={18} color="#1d4ed8" />各月份团队额度分布柱状图</h3>
              <p>{year} 年各月份已发布 vs 草稿额度总量 (万元)</p>
            </div>
            <select value={year} onChange={e => setYear(e.target.value)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5cf' }}>
              <option value="2026">2026年</option>
              <option value="2027">2027年</option>
            </select>
          </div>
          <div style={{ height: 280, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBars}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5ebe7" />
                <XAxis dataKey="month" stroke="#718096" fontSize={11} tickFormatter={m => m.slice(5)} />
                <YAxis stroke="#718096" fontSize={11} unit="万" />
                <Tooltip contentStyle={{ backgroundColor: '#182f27', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend formatter={(val) => val === 'publishedWan' ? '已发布额度(万元)' : '待发布草稿(万元)'} />
                <Bar dataKey="publishedWan" fill="#15803d" radius={[4, 4, 0, 0]} />
                <Bar dataKey="draftWan" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 专业组月度额度分布柱状图 */}
        <div className="chart-container">
          <div className="chart-header">
            <div>
              <h3><Layers size={18} color="#7e22ce" />专业组月度额度配比柱状图</h3>
              <p>总体组 vs 产品组 vs 研发组月度绩点对比 (万元)</p>
            </div>
          </div>
          <div style={{ height: 280, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupMonthlyBars}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5ebe7" />
                <XAxis dataKey="month" stroke="#718096" fontSize={11} tickFormatter={m => m.slice(5)} />
                <YAxis stroke="#718096" fontSize={11} unit="万" />
                <Tooltip contentStyle={{ backgroundColor: '#182f27', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend />
                <Bar dataKey="总体组" fill="#2563eb" />
                <Bar dataKey="产品组" fill="#d97706" />
                <Bar dataKey="研发组" fill="#059669" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 员工获得额度柱状图 */}
      <div className="chart-container">
        <div className="chart-header">
          <div>
            <h3><Users size={18} color="#059669" />员工年度获得总额度排行榜 (Top 10)</h3>
            <p>{year} 年度获得绩点最高的 10 位成员</p>
          </div>
        </div>
        <div style={{ height: 260, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topEmployeesBarData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5ebe7" />
              <XAxis type="number" stroke="#718096" fontSize={11} unit="分" />
              <YAxis type="category" dataKey="name" stroke="#718096" fontSize={12} width={70} />
              <Tooltip
                formatter={(val: any) => [`${val} 绩点`, '获得总绩点']}
                contentStyle={{ backgroundColor: '#182f27', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="points" fill="#15803d" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 6. Stars View (考核之星殿堂：荣誉展台 + 月度/季度/年度/区间全员排行榜)
// -------------------------------------------------------------
function StarsView({ state }: { state: State }) {
  // 0. 防御性归一化 state，彻底杜绝 null / undefined 导致的解包崩溃
  const safeState: State = useMemo(() => {
    return {
      employees: Array.isArray(state?.employees) ? state.employees.filter(Boolean) : [],
      projects: Array.isArray(state?.projects) ? state.projects.filter(Boolean) : [],
      plans: Array.isArray(state?.plans) ? state.plans.filter(Boolean) : [],
      audit: Array.isArray(state?.audit) ? state.audit : [],
      settings: state?.settings || ({} as any),
      auditorPackages: state?.auditorPackages || [],
    };
  }, [state]);

  // 1. 动态提取已发布并有实际绩点分配的所有有效月份
  const activeMonths = useMemo(() => {
    const set = new Set<string>();
    safeState.plans.forEach(p => {
      if (p && p.status === 'published') {
        const hasPts = (Array.isArray(p.records) && p.records.some(r => (Number(r?.points) || 0) > 0)) ||
                       (Array.isArray(p.entries) && p.entries.some(e => (Number(e?.rate) || 0) > 0));
        if (hasPts && p.month) set.add(p.month);
      }
    });
    return Array.from(set).sort();
  }, [safeState.plans]);

  // 2. 动态提取所有年份
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    activeMonths.forEach(m => {
      const y = (m || '').slice(0, 4);
      if (/^\d{4}$/.test(y)) set.add(y);
    });
    const curYear = nowMonth().slice(0, 4);
    set.add(curYear);
    set.add('2026');
    return Array.from(set).sort().reverse();
  }, [activeMonths]);

  // 默认定位到最新有分配数据的月份
  const latestActiveMonth = activeMonths.length > 0 ? activeMonths[activeMonths.length - 1] : nowMonth();
  const defaultYear = latestActiveMonth.slice(0, 4) || '2026';
  const defaultQuarter = Math.ceil(parseInt(latestActiveMonth.slice(5, 7) || '1', 10) / 3) || 1;

  const [year, setYear] = useState<string>(() => defaultYear);
  const [quarter, setQuarter] = useState<number>(() => defaultQuarter);
  const [month, setMonth] = useState<string>(() => latestActiveMonth);

  // 全员排名榜四大模式：'month' (月度) | 'quarter' (季度) | 'year' (年度) | 'range' (区间)
  const [rankingMode, setRankingMode] = useState<'month' | 'quarter' | 'year' | 'range'>('month');
  const [rangeStart, setRangeStart] = useState<string>(() => (activeMonths.length > 0 ? activeMonths[0] : `${defaultYear}-01`));
  const [rangeEnd, setRangeEnd] = useState<string>(() => latestActiveMonth);
  const [search, setSearch] = useState<string>('');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [inspectRow, setInspectRow] = useState<any>(null);

  // 当工作区数据载入或更新且当前 month 无数据时，智能自动对齐到最新有数据的月份
  useEffect(() => {
    if (activeMonths.length > 0 && !activeMonths.includes(month)) {
      const target = activeMonths[activeMonths.length - 1];
      setMonth(target);
      const targetYear = target.slice(0, 4);
      setYear(targetYear);
      setQuarter(Math.ceil(parseInt(target.slice(5, 7) || '1', 10) / 3) || 1);
    }
  }, [activeMonths]);

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    const monthsInYear = activeMonths.filter(m => m.startsWith(newYear));
    if (monthsInYear.length > 0) {
      const latestInYear = monthsInYear[monthsInYear.length - 1];
      setMonth(latestInYear);
      setQuarter(Math.ceil(parseInt(latestInYear.slice(5, 7) || '1', 10) / 3) || 1);
    } else {
      setMonth(`${newYear}-01`);
      setQuarter(1);
    }
  };

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    if (/^\d{4}-\d{2}$/.test(newMonth)) {
      const y = newMonth.slice(0, 4);
      setYear(y);
      setQuarter(Math.ceil(parseInt(newMonth.slice(5, 7), 10) / 3) || 1);
    }
  };

  const starsData = useMemo(() => {
    try {
      return calculateStars(safeState, { year, quarter, month });
    } catch (err) {
      console.error('StarsView calculateStars error:', err);
      return {
        year,
        month,
        quarter,
        monthStar: { month, stars: [], topPoints: 0, ranking: [] },
        quarterStar: { year, quarter, months: [], stars: [], topPoints: 0, ranking: [] },
        yearStar: { year, stars: [], topPoints: 0, ranking: [] },
      };
    }
  }, [safeState, year, quarter, month]);

  // 根据当前选择的排名模式，动态推导要聚合的目标月份列表
  const rankingTargetMonths = useMemo(() => {
    if (rankingMode === 'month') {
      return [month];
    }
    if (rankingMode === 'quarter') {
      const qMap: Record<number, string[]> = {
        1: [`${year}-01`, `${year}-02`, `${year}-03`],
        2: [`${year}-04`, `${year}-05`, `${year}-06`],
        3: [`${year}-07`, `${year}-08`, `${year}-09`],
        4: [`${year}-10`, `${year}-11`, `${year}-12`],
      };
      return qMap[quarter] || qMap[1];
    }
    if (rankingMode === 'year') {
      return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
    }
    // 区间排名
    if (!rangeStart || !rangeEnd) return [month];
    return getMonthsBetween(rangeStart <= rangeEnd ? rangeStart : rangeEnd, rangeStart <= rangeEnd ? rangeEnd : rangeStart);
  }, [rankingMode, month, quarter, year, rangeStart, rangeEnd]);

  // 调用底层精准算法计算全员排名列表
  const fullRankingData = useMemo(() => {
    try {
      return rangeReport(safeState, {
        months: rankingTargetMonths,
        group: groupFilter,
        search,
        status: 'published',
      });
    } catch (err) {
      console.error('StarsView rangeReport error:', err);
      return [];
    }
  }, [safeState, rankingTargetMonths, groupFilter, search]);

  // 专业组选项集合
  const groupOptions = useMemo(() => {
    const set = new Set<string>();
    safeState.employees.forEach(e => {
      if (e?.group) set.add(String(e.group));
    });
    return Array.from(set).sort();
  }, [safeState.employees]);

  // 当期/该周期人均基准绩点
  const periodTotalPoints = useMemo(() => fullRankingData.reduce((acc, curr) => acc + curr.points, 0), [fullRankingData]);
  const periodAvgPoints = fullRankingData.length > 0 ? Math.round(periodTotalPoints / fullRankingData.length) : 0;
  const periodTopPoints = fullRankingData[0]?.points || 0;

  // 模式标题与标签
  const periodTitle = useMemo(() => {
    if (rankingMode === 'month') return `${month} 月度全员绩效排行榜`;
    if (rankingMode === 'quarter') return `${year} 第 ${quarter} 季度 (Q${quarter}) 全员绩效排行榜`;
    if (rankingMode === 'year') return `${year} 全年度全员绩效排行榜`;
    return `${rangeStart} 至 ${rangeEnd} 自定义区间全员绩效排行榜`;
  }, [rankingMode, month, year, quarter, rangeStart, rangeEnd]);

  // 导出榜单 CSV
  const handleExportRankingCsv = async () => {
    const header = ['名次,工号,姓名,专业组,职务,所属部门,参与项目数,获得总绩点,折合金额(万元),所属梯队,荣誉标识'];
    fullRankingData.forEach((row, idx) => {
      const rank = idx + 1;
      const empNo = row.employee?.employeeNo || '-';
      const name = row.employee?.name || row.employee?.id || '未命名';
      const grp = row.employee?.group || '-';
      const pos = row.employee?.position || '-';
      const dept = row.employee?.department || '-';
      const pts = score(row.points);
      const wan = (row.points / 10000).toFixed(4);
      const tier = idx < Math.ceil(fullRankingData.length * 0.15) ? 'Top 15% 卓越领航' : idx < Math.ceil(fullRankingData.length * 0.45) ? 'Top 45% 核心骨干' : '稳健中坚';
      const honor = idx === 0 && row.points > 0
        ? (rankingMode === 'month' ? '月度之星' : rankingMode === 'quarter' ? '季度之星' : rankingMode === 'year' ? '年度之星' : '区间榜首')
        : (idx < 3 && row.points > 0 ? '优胜奖' : '合格');

      header.push(`"${rank}","${empNo}","${name}","${grp}","${pos}","${dept}","${row.projectCount}","${pts}","${wan}","${tier}","${honor}"`);
    });
    const csv = '\uFEFF' + header.join('\n');
    await triggerDownload(csv, `卓越绩星荣誉殿堂_${periodTitle.replace(/\s+/g, '_')}.csv`, 'text/csv');
  };

  return (
    <div className="stars-container">
      {/* 顶部荣誉大 Banner */}
      <div className="star-hero-banner">
        <div>
          <h2><Crown size={28} />衡绩考核荣誉殿堂 · 卓越绩星殿堂</h2>
          <p>月度之星、季度之星、年度之星与多维周期全员绩效排名！唯有真实贡献，方得至高荣耀。</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {activeMonths.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', padding: '5px 12px', borderRadius: '8px', fontSize: '12px' }}>
              <span style={{ color: '#93c5fd' }}>活跃月份 ({activeMonths.length} 个):</span>
              <select
                value={activeMonths.includes(month) ? month : ''}
                onChange={e => { if (e.target.value) handleMonthChange(e.target.value); }}
                style={{ background: '#1e3a8a', color: '#fff', border: '1px solid #3b82f6', borderRadius: '6px', padding: '3px 8px', fontSize: '12px' }}
              >
                {!activeMonths.includes(month) && <option value="">选择已有数据月份...</option>}
                {activeMonths.map(m => (
                  <option key={m} value={m}>{m} (有分配)</option>
                ))}
              </select>
            </div>
          )}
          <select value={year} onChange={e => handleYearChange(e.target.value)} style={{ padding: '8px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '13px' }}>
            {availableYears.map(y => (
              <option key={y} value={y} style={{ color: '#000' }}>{y} 年</option>
            ))}
          </select>
        </div>
      </div>

      {/* 三大荣誉台 (月度之星 / 季度之星 / 年度之星) */}
      <div className="podium-grid">
        {/* 月度之星 */}
        <div className="podium-card gold" style={{ cursor: 'pointer' }} onClick={() => setRankingMode('month')}>
          <div className="podium-crown">🌟</div>
          <div className="podium-header">
            <span style={{ color: rankingMode === 'month' ? '#b45309' : undefined, fontWeight: 700 }}>
              MONTHLY STAR {rankingMode === 'month' && '· 查看榜单中'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={e => e.stopPropagation()}>
              <input type="month" value={month} onChange={e => handleMonthChange(e.target.value)} style={{ fontSize: '12px', border: '1px solid #cbd5cf', borderRadius: '6px', padding: '2px 6px' }} />
            </div>
          </div>
          <div className="podium-name">
            {starsData.monthStar.stars.length > 0
              ? starsData.monthStar.stars.map(s => s.employee?.name || s.employee?.employeeNo || s.employee?.id || '未命名').join('、')
              : '本月暂无之星'}
          </div>
          {starsData.monthStar.stars.length > 0 ? (
            <div className="podium-meta">
              <GroupTag group={starsData.monthStar.stars[0]?.employee?.group} />
              <span>{starsData.monthStar.stars[0]?.employee?.department || '第四研究室'}</span>
            </div>
          ) : (
            <div className="podium-meta" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>暂无当月发布记录</span>
              {activeMonths.length > 0 && !activeMonths.includes(month) && (
                <button
                  type="button"
                  style={{ border: 'none', background: 'transparent', color: '#0284c7', padding: 0, fontSize: '11px', cursor: 'pointer', textAlign: 'left', textDecoration: 'underline' }}
                  onClick={e => { e.stopPropagation(); handleMonthChange(activeMonths[activeMonths.length - 1]); }}
                >
                  切换至最新有数据月份 ({activeMonths[activeMonths.length - 1]})
                </button>
              )}
            </div>
          )}
          <div className="podium-score">
            <div>
              <small>当月最高绩点</small>
              <strong>{score(starsData.monthStar.topPoints)}</strong>
            </div>
            <small>点击聚焦月度排行榜</small>
          </div>
        </div>

        {/* 季度之星 */}
        <div className="podium-card gold" style={{ cursor: 'pointer' }} onClick={() => setRankingMode('quarter')}>
          <div className="podium-crown">🏆</div>
          <div className="podium-header">
            <span style={{ color: rankingMode === 'quarter' ? '#1d4ed8' : undefined, fontWeight: 700 }}>
              QUARTERLY STAR {rankingMode === 'quarter' && '· 查看榜单中'}
            </span>
            <div onClick={e => e.stopPropagation()}>
              <select value={quarter} onChange={e => setQuarter(Number(e.target.value))} style={{ fontSize: '12px', border: '1px solid #cbd5cf', borderRadius: '6px', padding: '2px 6px' }}>
                <option value={1}>第 1 季度 (Q1)</option>
                <option value={2}>第 2 季度 (Q2)</option>
                <option value={3}>第 3 季度 (Q3)</option>
                <option value={4}>第 4 季度 (Q4)</option>
              </select>
            </div>
          </div>
          <div className="podium-name">
            {starsData.quarterStar.stars.length > 0
              ? starsData.quarterStar.stars.map(s => s.employee?.name || s.employee?.employeeNo || s.employee?.id || '未命名').join('、')
              : '本季度暂无之星'}
          </div>
          {starsData.quarterStar.stars.length > 0 ? (
            <div className="podium-meta">
              <GroupTag group={starsData.quarterStar.stars[0]?.employee?.group} />
              <span>{starsData.quarterStar.stars[0]?.employee?.department || '第四研究室'}</span>
            </div>
          ) : (
            <div className="podium-meta">暂无当季发布记录</div>
          )}
          <div className="podium-score">
            <div>
              <small>季度累计绩点</small>
              <strong>{score(starsData.quarterStar.topPoints)}</strong>
            </div>
            <small>点击聚焦季度排行榜</small>
          </div>
        </div>

        {/* 年度之星 */}
        <div className="podium-card gold" style={{ cursor: 'pointer' }} onClick={() => setRankingMode('year')}>
          <div className="podium-crown">👑</div>
          <div className="podium-header">
            <span style={{ color: rankingMode === 'year' ? '#78350f' : undefined, fontWeight: 700 }}>
              ANNUAL STAR {rankingMode === 'year' && '· 查看榜单中'}
            </span>
            <Badge tone="purple">{year} 全年度</Badge>
          </div>
          <div className="podium-name">
            {starsData.yearStar.stars.length > 0
              ? starsData.yearStar.stars.map(s => s.employee?.name || s.employee?.employeeNo || s.employee?.id || '未命名').join('、')
              : '年度之星虚位以待'}
          </div>
          {starsData.yearStar.stars.length > 0 ? (
            <div className="podium-meta">
              <GroupTag group={starsData.yearStar.stars[0]?.employee?.group} />
              <span>{starsData.yearStar.stars[0]?.employee?.department || '第四研究室'}</span>
            </div>
          ) : (
            <div className="podium-meta">全年在评定中</div>
          )}
          <div className="podium-score">
            <div>
              <small>年度累计总绩点</small>
              <strong>{score(starsData.yearStar.topPoints)}</strong>
            </div>
            <small>点击聚焦年度排行榜</small>
          </div>
        </div>
      </div>

      {/* 核心升级：全员绩点与考核之星一体化排行榜 (支持月度、季度、年度、区间四大模式) */}
      <div className="panel full" style={{ border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
        {/* 顶部主控条：四大排名模式切换 + 导出按钮 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
          <div>
            <span className="eyebrow" style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
              HONOR HALL & FULL RANKING
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
              {periodTitle}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* 四大维度切换 */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
              <button
                type="button"
                style={{
                  border: 'none',
                  background: rankingMode === 'month' ? '#ffffff' : 'transparent',
                  color: rankingMode === 'month' ? '#059669' : '#64748b',
                  fontWeight: rankingMode === 'month' ? 700 : 500,
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: rankingMode === 'month' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                }}
                onClick={() => setRankingMode('month')}
              >
                🌟 月度排名
              </button>
              <button
                type="button"
                style={{
                  border: 'none',
                  background: rankingMode === 'quarter' ? '#ffffff' : 'transparent',
                  color: rankingMode === 'quarter' ? '#2563eb' : '#64748b',
                  fontWeight: rankingMode === 'quarter' ? 700 : 500,
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: rankingMode === 'quarter' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                }}
                onClick={() => setRankingMode('quarter')}
              >
                🏆 季度排名
              </button>
              <button
                type="button"
                style={{
                  border: 'none',
                  background: rankingMode === 'year' ? '#ffffff' : 'transparent',
                  color: rankingMode === 'year' ? '#d97706' : '#64748b',
                  fontWeight: rankingMode === 'year' ? 700 : 500,
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: rankingMode === 'year' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                }}
                onClick={() => setRankingMode('year')}
              >
                👑 年度排名
              </button>
              <button
                type="button"
                style={{
                  border: 'none',
                  background: rankingMode === 'range' ? '#ffffff' : 'transparent',
                  color: rankingMode === 'range' ? '#7c3aed' : '#64748b',
                  fontWeight: rankingMode === 'range' ? 700 : 500,
                  padding: '6px 14px',
                  borderRadius: '7px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: rankingMode === 'range' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                }}
                onClick={() => setRankingMode('range')}
              >
                📅 自定义区间排名
              </button>
            </div>

            <button
              className="secondary"
              style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={handleExportRankingCsv}
            >
              <Download size={14} />导出榜单 CSV
            </button>
          </div>
        </div>

        {/* 筛选与参数配置条 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* 模式专属参数选择 */}
            {rankingMode === 'month' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>考核月份:</span>
                <input
                  type="month"
                  value={month}
                  onChange={e => handleMonthChange(e.target.value)}
                  style={{ height: 32, fontSize: '13px', borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 8px' }}
                />
              </div>
            )}

            {rankingMode === 'quarter' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>考核季度:</span>
                <select
                  value={year}
                  onChange={e => handleYearChange(e.target.value)}
                  style={{ height: 32, fontSize: '13px', borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 8px' }}
                >
                  {availableYears.map(y => <option key={y} value={y}>{y} 年</option>)}
                </select>
                <select
                  value={quarter}
                  onChange={e => setQuarter(Number(e.target.value))}
                  style={{ height: 32, fontSize: '13px', borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 8px' }}
                >
                  <option value={1}>第 1 季度 (Q1)</option>
                  <option value={2}>第 2 季度 (Q2)</option>
                  <option value={3}>第 3 季度 (Q3)</option>
                  <option value={4}>第 4 季度 (Q4)</option>
                </select>
              </div>
            )}

            {rankingMode === 'year' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>考核年度:</span>
                <select
                  value={year}
                  onChange={e => handleYearChange(e.target.value)}
                  style={{ height: 32, fontSize: '13px', borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 8px' }}
                >
                  {availableYears.map(y => <option key={y} value={y}>{y} 全年度</option>)}
                </select>
              </div>
            )}

            {rankingMode === 'range' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <span style={{ color: '#475569', fontWeight: 600 }}>区间范围:</span>
                <input
                  type="month"
                  value={rangeStart}
                  onChange={e => setRangeStart(e.target.value)}
                  style={{ height: 32, fontSize: '13px', borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 6px' }}
                />
                <span style={{ color: '#94a3b8' }}>至</span>
                <input
                  type="month"
                  value={rangeEnd}
                  onChange={e => setRangeEnd(e.target.value)}
                  style={{ height: 32, fontSize: '13px', borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 6px' }}
                />
              </div>
            )}

            {/* 专业组筛选 */}
            {groupOptions.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <Filter size={14} color="#64748b" />
                <select
                  value={groupFilter}
                  onChange={e => setGroupFilter(e.target.value)}
                  style={{ height: 32, fontSize: '13px', borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 8px' }}
                >
                  <option value="all">全部专业组 ({safeState.employees.length}人)</option>
                  {groupOptions.map(g => (
                    <option key={g} value={g}>{g} ({safeState.employees.filter(e => e?.group === g).length}人)</option>
                  ))}
                </select>
              </div>
            )}

            {/* 搜索框 */}
            <div style={{ position: 'relative', width: 220 }}>
              <Search size={14} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="搜索员工姓名/工号/职务…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: 28, fontSize: '12.5px', height: 32, borderRadius: 6, border: '1px solid #cbd5e1' }}
              />
              {search && (
                <button
                  style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => setSearch('')}
                >
                  <X size={13} color="#94a3b8" />
                </button>
              )}
            </div>
          </div>

          {/* 宏观指标卡 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#64748b' }}>
            <div>参评全员: <strong style={{ color: '#0f172a', fontSize: '13px' }}>{fullRankingData.length}</strong> 人</div>
            <div>榜首最高: <strong style={{ color: '#059669', fontSize: '13px' }}>{score(periodTopPoints)}</strong> 万绩点</div>
            <div>人均基准: <strong style={{ color: '#0284c7', fontSize: '13px' }}>{score(periodAvgPoints)}</strong> 万绩点</div>
          </div>
        </div>

        {/* 详细全员排行榜表格 */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ width: '65px', textAlign: 'center' }}>名次</th>
                <th style={{ width: '85px' }}>工号</th>
                <th>员工姓名</th>
                <th>专业组</th>
                <th>职务</th>
                <th>所属部门</th>
                <th style={{ textAlign: 'center' }}>参与项目数</th>
                <th style={{ textAlign: 'right' }}>总获得绩点(万)</th>
                <th style={{ textAlign: 'right' }}>折合金额(万元)</th>
                <th>与人均对比</th>
                <th style={{ textAlign: 'center' }}>所属梯队</th>
                <th style={{ textAlign: 'center' }}>荣誉称号</th>
              </tr>
            </thead>
            <tbody>
              {fullRankingData.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    该周期暂无已发布的绩效分配记录。
                  </td>
                </tr>
              ) : (
                fullRankingData.map((row, index) => {
                  const empName = row.employee?.name || row.employee?.employeeNo || row.employee?.id || '未命名员工';
                  const empNo = row.employee?.employeeNo || '-';
                  const diff = row.points - periodAvgPoints;
                  const tier = index < Math.ceil(fullRankingData.length * 0.15) ? 'Top 15% 卓越领航' : index < Math.ceil(fullRankingData.length * 0.45) ? 'Top 45% 核心骨干' : '稳健中坚';
                  const tierColor = index < Math.ceil(fullRankingData.length * 0.15) ? '#e11d48' : index < Math.ceil(fullRankingData.length * 0.45) ? '#0284c7' : '#64748b';
                  const isTopStar = index === 0 && row.points > 0;
                  const wan = (row.points / 10000).toFixed(4);

                  return (
                    <tr
                      key={row.employee?.id || `rank_row_${index}`}
                      style={{
                        background: isTopStar ? '#fefce8' : undefined,
                        cursor: 'pointer',
                      }}
                      onClick={() => setInspectRow(row)}
                      title="点击查看该员工在本周期的详细项目分配流水"
                    >
                      <td style={{ textAlign: 'center', fontWeight: index < 3 ? 800 : 500, fontSize: index < 3 ? '15px' : '13px' }}>
                        {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : index + 1}
                      </td>
                      <td style={{ fontFamily: 'monospace', color: '#0369a1', fontSize: '12px' }}>
                        {empNo}
                      </td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>
                        {empName}
                      </td>
                      <td><GroupTag group={row.employee?.group} /></td>
                      <td>{row.employee?.position || '-'}</td>
                      <td>{row.employee?.department || '第四研究室'}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>
                        {row.projectCount} 项
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: row.points > 0 ? '#166534' : '#94a3b8', fontSize: '14px' }}>
                        {score(row.points)}
                      </td>
                      <td style={{ textAlign: 'right', color: '#475569' }}>
                        {wan} 万元
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '90px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(100, Math.max(5, (row.points / (periodTopPoints || 1)) * 100))}%`,
                                height: '100%',
                                background: index < 3 ? '#f59e0b' : '#059669',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '11px', color: diff >= 0 ? '#059669' : '#94a3b8' }}>
                            {diff >= 0 ? `+${score(diff)}` : score(diff)}
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '11.5px', color: tierColor, fontWeight: 600, background: '#f8fafc', padding: '2px 8px', borderRadius: '4px' }}>
                          {tier}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {isTopStar ? (
                          <Badge tone="amber">
                            {rankingMode === 'month' ? '🌟 月度之星' : rankingMode === 'quarter' ? '🏆 季度之星' : rankingMode === 'year' ? '👑 年度之星' : '🏅 区间榜首'}
                          </Badge>
                        ) : index < 3 && row.points > 0 ? (
                          <Badge tone="blue">优胜奖</Badge>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '11px' }}>合格</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 成员明细穿透弹窗 */}
      {inspectRow && (
        <Modal
          title={`【${inspectRow.employee?.name || inspectRow.employee?.employeeNo || inspectRow.employee?.id || '员工'}】在 ${periodTitle} 的绩效明细`}
          onClose={() => setInspectRow(null)}
          wide={true}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '18px', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', fontSize: '13px' }}>
              <div>工号: <strong style={{ color: '#0369a1' }}>{inspectRow.employee?.employeeNo || '-'}</strong></div>
              <div>专业组: <strong>{inspectRow.employee?.group || '-'}</strong></div>
              <div>部门: <strong>{inspectRow.employee?.department || '-'}</strong></div>
              <div>周期斩获总绩点: <strong style={{ color: '#059669', fontSize: '15px' }}>{score(inspectRow.points)}</strong></div>
            </div>

            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th>项目名称</th>
                    <th>工作令号</th>
                    <th>归属月份</th>
                    <th style={{ textAlign: 'right' }}>分配绩点(万)</th>
                    <th style={{ textAlign: 'right' }}>分配比例</th>
                  </tr>
                </thead>
                <tbody>
                  {(inspectRow.details || []).map((d: any, idx: number) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{d.project}</td>
                      <td style={{ fontFamily: 'monospace', color: '#0369a1' }}>{d.code || '-'}</td>
                      <td>{d.month}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>{score(d.points)}</td>
                      <td style={{ textAlign: 'right' }}>{(d.rate / 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button className="secondary" onClick={() => setInspectRow(null)}>
                关闭窗口
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 7. Reports View (需求2：整年度、某些区间或者某几个月度的获得总额度)
// -------------------------------------------------------------
function ReportsView({ state }: { state: State }) {
  const [mode, setMode] = useState<'single' | 'quarter' | 'year' | 'range'>('year');
  const [singleMonth, setSingleMonth] = useState('2026-01');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [quarter, setQuarter] = useState(1);
  const [rangeStart, setRangeStart] = useState('2026-01');
  const [rangeEnd, setRangeEnd] = useState('2026-03');
  const [groupFilter, setGroupFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [detailRow, setDetailRow] = useState<any>(null);
  const [reportViewMode, setReportViewMode] = useState<'matrix' | 'list'>('matrix');

  // Compute targeted months
  const targetMonths = useMemo(() => {
    if (mode === 'single') return [singleMonth];
    if (mode === 'quarter') {
      const qMap: Record<number, string[]> = {
        1: [`${selectedYear}-01`, `${selectedYear}-02`, `${selectedYear}-03`],
        2: [`${selectedYear}-04`, `${selectedYear}-05`, `${selectedYear}-06`],
        3: [`${selectedYear}-07`, `${selectedYear}-08`, `${selectedYear}-09`],
        4: [`${selectedYear}-10`, `${selectedYear}-11`, `${selectedYear}-12`],
      };
      return qMap[quarter] || qMap[1];
    }
    if (mode === 'year') {
      return Array.from({ length: 12 }, (_, i) => `${selectedYear}-${String(i + 1).padStart(2, '0')}`);
    }
    return getMonthsBetween(rangeStart, rangeEnd);
  }, [mode, singleMonth, selectedYear, quarter, rangeStart, rangeEnd]);

  const rows = useMemo(() => {
    return rangeReport(state, {
      months: targetMonths,
      group: groupFilter,
      search,
      status: 'published'
    });
  }, [state, targetMonths, groupFilter, search]);

  const periodLabel = useMemo(() => {
    if (mode === 'single') return `${singleMonth} 月度`;
    if (mode === 'quarter') return `${selectedYear}年第${quarter}季度`;
    if (mode === 'year') return `${selectedYear}年整年度`;
    return `${rangeStart} 至 ${rangeEnd} 区间`;
  }, [mode, singleMonth, selectedYear, quarter, rangeStart, rangeEnd]);

  // 图2标准：二维矩阵透视数据（人员 × 项目令号，最右侧个人累加，最底部项目累加）
  const matrixData = useMemo(() => {
    const projects = state.projects;
    const projectPointsSums = new Array(projects.length).fill(0);
    let grandTotalPoints = 0;

    const dataRows = rows.map((r, index) => {
      let rowPersonalTotal = 0;
      const projectScores = projects.map((p, pIndex) => {
        // 严格基于项目唯一 ID 隔离，杜绝同令号数据复制
        const fen = r.details
          .filter(d => d.projectId === p.id)
          .reduce((sum, d) => sum + d.points, 0);

        projectPointsSums[pIndex] += fen;
        rowPersonalTotal += fen;
        return {
          projectId: p.id,
          fen,
          scoreStr: (fen / 1_000_000).toFixed(4),
        };
      });

      grandTotalPoints += rowPersonalTotal;

      return {
        index: index + 1,
        employee: r.employee,
        projectScores,
        personalTotalFen: rowPersonalTotal,
        personalTotalStr: (rowPersonalTotal / 1_000_000).toFixed(4),
        originalRow: r,
      };
    });

    const projectTotals = projects.map((p, pIndex) => ({
      projectId: p.id,
      fen: projectPointsSums[pIndex],
      totalStr: (projectPointsSums[pIndex] / 1_000_000).toFixed(4),
    }));

    return {
      projects,
      dataRows,
      projectTotals,
      grandTotalPoints,
      grandTotalStr: (grandTotalPoints / 1_000_000).toFixed(4),
    };
  }, [state.projects, rows]);

  const exportCsv = () => {
    const csv = exportPeriodMatrixReportCsv(state.projects, rows, periodLabel);
    triggerDownload(csv, `绩点报表-${periodLabel}.csv`);
  };

  return (
    <section className="panel full">
      <PageTitle
        eyebrow="MULTI-PERIOD PERFORMANCE REPORT"
        title="周期绩点报表"
        description="支持查看整年度、季度、单月度或任意自定义区间的员工获得总额度与明细分润。"
        action={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ padding: '4px 10px', borderRadius: '6px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>📊</span><span>绩点单位：万元</span>
            </span>
            <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <button
                type="button"
                onClick={() => setReportViewMode('matrix')}
                style={{
                  padding: '5px 13px',
                  fontSize: '12px',
                  fontWeight: reportViewMode === 'matrix' ? 700 : 500,
                  background: reportViewMode === 'matrix' ? '#ffffff' : 'transparent',
                  color: reportViewMode === 'matrix' ? '#0369a1' : '#64748b',
                  border: 'none',
                  borderRadius: '6px',
                  boxShadow: reportViewMode === 'matrix' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                📊 二维透视矩阵
              </button>
              <button
                type="button"
                onClick={() => setReportViewMode('list')}
                style={{
                  padding: '5px 13px',
                  fontSize: '12px',
                  fontWeight: reportViewMode === 'list' ? 700 : 500,
                  background: reportViewMode === 'list' ? '#ffffff' : 'transparent',
                  color: reportViewMode === 'list' ? '#166534' : '#64748b',
                  border: 'none',
                  borderRadius: '6px',
                  boxShadow: reportViewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                📋 全员排名列表
              </button>
            </div>
            <button className="primary" onClick={exportCsv}>
              <Download size={15} />导出本期报表 CSV
            </button>
          </div>
        }
      />

      {/* 周期切换工具栏 (需求2) */}
      <div className="toolbar" style={{ gap: '14px', flexWrap: 'wrap' }}>
        <div className="filter-tabs">
          <button className={mode === 'year' ? 'active' : ''} onClick={() => setMode('year')}>整年度</button>
          <button className={mode === 'quarter' ? 'active' : ''} onClick={() => setMode('quarter')}>按季度</button>
          <button className={mode === 'single' ? 'active' : ''} onClick={() => setMode('single')}>单月份</button>
          <button className={mode === 'range' ? 'active' : ''} onClick={() => setMode('range')}>自定义区间</button>
        </div>

        {mode === 'year' && (
          <Field label="考核年度">
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
              <option value="2025">2025 年</option>
              <option value="2026">2026 年</option>
              <option value="2027">2027 年</option>
            </select>
          </Field>
        )}

        {mode === 'quarter' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Field label="年度">
              <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                <option value="2026">2026 年</option>
                <option value="2027">2027 年</option>
              </select>
            </Field>
            <Field label="季度">
              <select value={quarter} onChange={e => setQuarter(Number(e.target.value))}>
                <option value={1}>Q1 (1-3月)</option>
                <option value={2}>Q2 (4-6月)</option>
                <option value={3}>Q3 (7-9月)</option>
                <option value={4}>Q4 (10-12月)</option>
              </select>
            </Field>
          </div>
        )}

        {mode === 'single' && (
          <Field label="考核月份">
            <input type="month" value={singleMonth} onChange={e => setSingleMonth(e.target.value)} />
          </Field>
        )}

        {mode === 'range' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Field label="开始月份">
              <input type="month" value={rangeStart} onChange={e => setRangeStart(e.target.value)} />
            </Field>
            <span style={{ marginTop: '16px', color: '#94a3b8' }}>至</span>
            <Field label="结束月份">
              <input type="month" value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} />
            </Field>
          </div>
        )}

        <Field label="专业组筛选">
          <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)}>
            <option value="all">全部专业组</option>
            {DEFAULT_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>

        <div className="search-input-wrapper" style={{ marginTop: 'auto', marginBottom: '16px' }}>
          <Search size={15} color="#82928a" />
          <input placeholder="搜索员工或部门..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* 视图1：图2标准二维矩阵透视模式（人员 × 项目合同细目，右侧个人累加，底行项目累加） */}
      {reportViewMode === 'matrix' && (
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', background: '#ffffff' }}>
          <table style={{ minWidth: `${Math.max(800, 260 + state.projects.length * 140 + 130)}px`, borderCollapse: 'collapse', width: '100%', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ width: '60px', padding: '10px 8px', textAlign: 'center', color: '#475569', fontWeight: 600, borderRight: '1px solid #e2e8f0', position: 'sticky', left: 0, background: '#f8fafc', zIndex: 3 }}>序号</th>
                <th style={{ width: '110px', padding: '10px 10px', textAlign: 'left', color: '#475569', fontWeight: 600, borderRight: '1px solid #cbd5e1', position: 'sticky', left: '60px', background: '#f8fafc', zIndex: 3 }}>姓名</th>
                {state.projects.map(p => {
                  const headerText = p.code && !p.name.includes(p.code) ? `${p.name} (${p.code})` : p.name;
                  return (
                    <th key={p.id} style={{ padding: '10px 8px', textAlign: 'right', color: '#334155', fontWeight: 600, borderRight: '1px solid #e2e8f0', minWidth: '130px', whiteSpace: 'nowrap' }} title={`合同额: ${wan(p.contract)} 万元`}>
                      <div>{p.name}</div>
                      {p.code && <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 400 }}>{p.code}</div>}
                    </th>
                  );
                })}
                <th style={{ width: '130px', padding: '10px 12px', textAlign: 'right', background: '#38bdf8', color: '#0c4a6e', fontWeight: 700, borderLeft: '2px solid #0284c7', position: 'sticky', right: 0, zIndex: 3 }}>
                  个人累加 (万)
                </th>
              </tr>
            </thead>
            <tbody>
              {matrixData.dataRows.map(row => (
                <tr key={row.employee.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #e2e8f0', position: 'sticky', left: 0, background: '#ffffff', zIndex: 2 }}>
                    {row.index}
                  </td>
                  <td style={{ padding: '8px 10px', fontWeight: 600, color: '#1e293b', borderRight: '1px solid #cbd5e1', position: 'sticky', left: '60px', background: '#ffffff', zIndex: 2 }}>
                    <span
                      onClick={() => setDetailRow(row.originalRow)}
                      style={{ cursor: 'pointer', color: '#0369a1', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                      title="点击查看该员工本期明细档案"
                    >
                      {row.employee.name}
                    </span>
                  </td>
                  {row.projectScores.map(scoreItem => {
                    const hasPoints = scoreItem.fen > 0;
                    return (
                      <td
                        key={scoreItem.projectId}
                        style={{
                          padding: '8px',
                          textAlign: 'right',
                          borderRight: '1px solid #f1f5f9',
                          fontFamily: 'monospace',
                          fontSize: '12.5px',
                          fontWeight: hasPoints ? 600 : 400,
                          color: hasPoints ? '#166534' : '#cbd5e1',
                          background: hasPoints ? '#f0fdf4' : 'transparent',
                        }}
                      >
                        {scoreItem.scoreStr}
                      </td>
                    );
                  })}
                  <td
                    style={{
                      padding: '8px 12px',
                      textAlign: 'right',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      fontSize: '13.5px',
                      color: '#0369a1',
                      background: '#e0f2fe',
                      borderLeft: '2px solid #38bdf8',
                      position: 'sticky',
                      right: 0,
                      zIndex: 2,
                    }}
                  >
                    {row.personalTotalStr}
                  </td>
                </tr>
              ))}
              {matrixData.dataRows.length === 0 && (
                <tr>
                  <td colSpan={2 + state.projects.length + 1} style={{ padding: '40px', textAlign: 'center' }}>
                    <Empty text="当前周期无任何已发布绩点记录" />
                  </td>
                </tr>
              )}
            </tbody>
            {/* 图2标准：底部浅蓝色高亮【项目累加】汇总行 */}
            {matrixData.dataRows.length > 0 && (
              <tfoot>
                <tr style={{ background: '#bae6fd', borderTop: '2px solid #0284c7', borderBottom: '2px solid #0284c7' }}>
                  <td style={{ padding: '10px 8px', textAlign: 'center', background: '#bae6fd', borderRight: '1px solid #7dd3fc', position: 'sticky', left: 0, zIndex: 2 }}></td>
                  <td style={{ padding: '10px 10px', fontWeight: 800, color: '#0c4a6e', fontSize: '13.5px', background: '#bae6fd', borderRight: '1px solid #0284c7', position: 'sticky', left: '60px', zIndex: 2 }}>
                    项目累加 (万)
                  </td>
                  {matrixData.projectTotals.map(projTotal => (
                    <td
                      key={projTotal.projectId}
                      style={{
                        padding: '10px 8px',
                        textAlign: 'right',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        color: '#0369a1',
                        borderRight: '1px solid #7dd3fc',
                        background: '#e0f2fe',
                      }}
                    >
                      {projTotal.totalStr}
                    </td>
                  ))}
                  <td
                    style={{
                      padding: '10px 12px',
                      textAlign: 'right',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      fontSize: '14.5px',
                      color: '#082f49',
                      background: '#7dd3fc',
                      borderLeft: '2px solid #0284c7',
                      position: 'sticky',
                      right: 0,
                      zIndex: 2,
                    }}
                    title="全局所有项目与全员个人累加总和"
                  >
                    {matrixData.grandTotalStr}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* 视图2：原有全员排名列表模式 */}
      {reportViewMode === 'list' && (
        <table>
          <thead>
            <tr>
              <th>排名</th>
              <th>员工姓名</th>
              <th>专业组</th>
              <th>所属部门</th>
              <th>贡献项目数</th>
              <th>活跃月份</th>
              <th>获得总绩点(万)</th>
              <th>折合总额度(万元)</th>
              <th className="actions">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.employee.id}>
                <td>
                  <b className="rank">{index + 1}</b>
                </td>
                <td><b>{row.employee.name}</b></td>
                <td><GroupTag group={row.employee.group} /></td>
                <td>{row.employee.department}</td>
                <td>{row.projectCount} 个项目</td>
                <td>{row.activeMonthsCount} 个月</td>
                <td style={{ color: '#166534', fontWeight: 700, fontSize: '13.5px' }}>
                  {score(row.points)}
                </td>
                <td><b>{(row.points / 1_000_000).toFixed(4)} 万元</b></td>
                <td className="actions">
                  <button onClick={() => setDetailRow(row)}>
                    <Eye size={13} />明细档案
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={9}><Empty text="当前周期无任何已发布绩点记录" /></td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* 员工周期档案明细弹窗 */}
      {detailRow && (
        <Modal
          title={`${detailRow.employee.name} · ${periodLabel} 个人绩点档案`}
          subtitle={`${detailRow.employee.department} · 专业组: ${detailRow.employee.group || '未设置'}`}
          wide
          onClose={() => setDetailRow(null)}
        >
          <div className="modal-body">
            <div className="metrics" style={{ margin: '0 0 20px' }}>
              <article>
                <span>统计周期</span>
                <strong>{periodLabel}</strong>
                <small>跨 {targetMonths.length} 个月</small>
              </article>
              <article>
                <span>获得总绩点</span>
                <strong style={{ color: '#166534' }}>{score(detailRow.points)} 万</strong>
                <small>折合 {(detailRow.points / 1_000_000).toFixed(4)} 万元</small>
              </article>
              <article>
                <span>贡献项目数</span>
                <strong>{detailRow.projectCount}<i> 个</i></strong>
                <small>包含项目负责人与成员分润</small>
              </article>
            </div>

            <table>
              <thead>
                <tr>
                  <th>月份</th>
                  <th>项目编号</th>
                  <th>项目名称</th>
                  <th>月度总预算比例</th>
                  <th>个人当月比例</th>
                  <th>获得绩点(万)</th>
                  <th>折合额度(万元)</th>
                </tr>
              </thead>
              <tbody>
                {detailRow.details.map((d: any, i: number) => (
                  <tr key={i}>
                    <td><b>{d.month}</b></td>
                    <td>{d.code}</td>
                    <td>{d.project}</td>
                    <td>{pct(d.budget)}</td>
                    <td>{pct(d.rate)}</td>
                    <td style={{ color: '#166534', fontWeight: 600 }}>{score(d.points)}</td>
                    <td>{(d.points / 1_000_000).toFixed(4)} 万元</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="modal-actions" style={{ padding: '16px 26px' }}>
            <button className="primary" onClick={() => setDetailRow(null)}>关闭</button>
          </div>
        </Modal>
      )}
    </section>
  );
}

// -------------------------------------------------------------
// 8. Data IO View (数据导入导出与系统灾备中心)
// -------------------------------------------------------------
function DataIoView({
  state,
  isAdmin,
  projectGroups = [],
  workspaceName = '',
  onRestoreState,
  onImportEmployees,
  onImportProjects,
  onExportPackages,
  onNavigateAuditor,
}: {
  state: State;
  isAdmin: boolean;
  projectGroups?: ProjectGroup[];
  workspaceName?: string;
  onRestoreState(state: State, projectGroups?: ProjectGroup[]): Promise<void>;
  onImportEmployees(employees: any[]): Promise<void>;
  onImportProjects(projects: any[]): Promise<void>;
  onExportPackages?(): void;
  onNavigateAuditor?(): void;
}) {
  const [empPreview, setEmpPreview] = useState<any[] | null>(null);
  const [prjPreview, setPrjPreview] = useState<any[] | null>(null);
  const [ioNotice, setIoNotice] = useState('');

  const empFileInput = useRef<HTMLInputElement>(null);
  const prjFileInput = useRef<HTMLInputElement>(null);
  const restoreFileInput = useRef<HTMLInputElement>(null);

  const handleEmpFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const text = evt.target?.result as string;
        const list = parseEmployeeCsvText(text);
        if (list.length === 0) throw new Error('未在 CSV 中解析到有效员工数据');
        setEmpPreview(list);
        setIoNotice(`成功解析 ${list.length} 位员工信息（匹配人员编制标准格式）`);
      } catch (err) {
        alert(errorText(err));
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const handlePrjFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const text = evt.target?.result as string;
        const list = parseProjectCsvText(text, state);
        if (list.length === 0) throw new Error('未解析到有效项目数据，请确认 CSV 格式是否包含项目名称与工作令号');
        setPrjPreview(list);
        setIoNotice(`成功解析 ${list.length} 个项目数据（匹配工作令格式：项目名称、合同金额、工作令号、起止日期）`);
      } catch (err) {
        alert(errorText(err));
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [exportPasswordConfirm, setExportPasswordConfirm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const [decryptModalOpen, setDecryptModalOpen] = useState(false);
  const [pendingBackupText, setPendingBackupText] = useState<string | null>(null);
  const [decryptPassword, setDecryptPassword] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);

  const confirmAndApplyRestore = async (backup: BackupData) => {
    const grpCount = backup.projectGroups?.length || 0;
    const confirmMsg =
      `【系统全量灾备恢复确认】\n\n` +
      `已成功校验并解锁快照数据：\n` +
      `• 备份导出时间: ${backup.exportedAt}\n` +
      `• 包含部门员工: ${backup.state.employees.length} 人\n` +
      `• 包含项目清单: ${backup.state.projects.length} 个\n` +
      `• 包含项目组配置: ${grpCount} 组（含成员与分配比例）\n` +
      `• 包含月度分配: ${backup.state.plans.length} 笔\n` +
      `• 包含审计流水: ${backup.state.audit.length} 条\n\n` +
      `⚠️ 警告：恢复操作将用该快照数据完整覆盖当前系统全部数据与项目组配置！\n确定要继续恢复吗？`;
    if (window.confirm(confirmMsg)) {
      await onRestoreState(backup.state, backup.projectGroups || []);
      setIoNotice(`✅ 成功通过权限验证，已完整恢复系统全部数据与配置（${backup.state.projects.length}个项目，${backup.state.employees.length}位员工，${grpCount}个项目组配置）`);
    }
  };

  const handleRestoreJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async evt => {
      try {
        const text = evt.target?.result as string;
        if (isEncryptedBackup(text)) {
          // 该灾备快照已加密，必须输入口令才能解密打开
          setPendingBackupText(text);
          setDecryptPassword('');
          setDecryptModalOpen(true);
        } else {
          // 历史未加密灾备兼容
          const backup = parseAndValidateBackupJson(text);
          await confirmAndApplyRestore(backup);
        }
      } catch (err) {
        alert(`灾备文件读取失败：${errorText(err)}`);
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const handleDecryptAndRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingBackupText) return;
    if (!decryptPassword.trim()) {
      alert('请输入灾备快照解密权限口令');
      return;
    }
    setIsDecrypting(true);
    try {
      const backup = await parseAndDecryptBackupJson(pendingBackupText, decryptPassword);
      setDecryptModalOpen(false);
      setPendingBackupText(null);
      await confirmAndApplyRestore(backup);
    } catch (err) {
      alert(errorText(err));
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleConfirmExportEncrypted = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exportPassword || exportPassword.length < 4) {
      alert('为保障灾备数据安全，请输入至少 4 位加密口令（权限密钥）');
      return;
    }
    if (exportPassword !== exportPasswordConfirm) {
      alert('两次输入的加密口令不一致，请重新核对');
      return;
    }
    setIsExporting(true);
    try {
      const encryptedJson = await exportEncryptedBackupJson(state, exportPassword, { projectGroups, workspaceName });
      triggerDownload(encryptedJson, `衡绩系统全量灾备快照-加密版-${nowMonth()}-${Date.now().toString().slice(-4)}.json`);
      setExportModalOpen(false);
      setExportPassword('');
      setExportPasswordConfirm('');
      setIoNotice('🔐 全量系统灾备数据已完成 AES-256-GCM 高强度加密并成功导出！导入时须输入所设口令方可解密还原。');
    } catch (err) {
      alert(`导出加密失败：${errorText(err)}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageTitle
        eyebrow="BACKUP & DATA MANAGEMENT"
        title="数据导入导出与系统灾备中心"
        description="支持企业级全量 JSON 系统快照灾备与安全恢复、即时快照回滚；提供项目工作令数据、项目组成员明细、部门人员编制的 CSV 导出与批量导入。"
      />

      {ioNotice && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#166534', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{ioNotice}</span>
          <button type="button" className="icon-button" style={{ width: 20, height: 20 }} onClick={() => setIoNotice('')}><X size={13} /></button>
        </div>
      )}

      {/* 增强数据备份功能：企业级全量 JSON 灾备与还原 */}
      <div className="panel">
        <h3 style={{ margin: '0 0 16px', fontSize: '17px', color: '#142822', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="#15803d" />
          系统全量数据灾备与恢复（企业级高可用）
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {/* 全量备份导出 */}
          <div className="backup-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>📦 系统全量灾备快照导出</h4>
              <Badge tone="green">完整快照（含全部配置）</Badge>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 14px', lineHeight: 1.5 }}>
              完整导出当前系统全部业务数据与配置（含所有人员与专业组、全部工作令项目、项目组管理配置与成员分配比例、月度分配规划、历史明细、系统规则配置及审计流水），支持防篡改校验。可在更换电脑、系统重装或灾难故障时一键完整还原。
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '12px' }}>
              <span>部门人员: <b>{state.employees.length} 人</b></span>
              <span>工作令项目: <b>{state.projects.length} 项</b></span>
              <span>项目组配置: <b style={{ color: '#15803d' }}>{projectGroups.length} 组</b></span>
              <span>月度分配: <b>{state.plans.length} 笔</b></span>
              <span>审计流水: <b>{state.audit.length} 条</b></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="primary"
                style={{ background: '#15803d', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setExportModalOpen(true)}
              >
                <Lock size={14} />导出加密全量灾备快照 (.json)
              </button>
            </div>
          </div>

          {/* 全量灾备恢复 */}
          <div className="backup-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#0f172a' }}>🔄 从全量灾备快照还原系统</h4>
              <Badge tone="amber">管理员专享</Badge>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 14px', lineHeight: 1.5 }}>
              选择此前导出的全量快照 JSON 文件。系统将自动校验数据合法性与加密状态，若是加密快照须输入权限口令方可解密，确认无误后完整恢复系统状态与全部项目组配置。
            </p>
            <input type="file" ref={restoreFileInput} accept=".json" onChange={handleRestoreJsonFile} style={{ display: 'none' }} />
            {isAdmin ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="import-dropzone" style={{ padding: '14px', minHeight: 'auto' }} onClick={() => restoreFileInput.current?.click()}>
                  <Upload size={20} color="#b45309" />
                  <p style={{ fontSize: '12.5px', margin: '4px 0' }}>点击选择全量灾备快照 JSON 文件执行恢复</p>
                  <small style={{ fontSize: '11px' }}>支持自动识别加密快照（验证权限口令后解密）与明文快照完整性检查</small>
                </div>
              </div>
            ) : (
              <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#92400e' }}>
                ⚠️ 您当前为非管理员身份，全量系统灾备恢复需要先切换为【👑 系统管理员】账号。
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 项目分配绩点数据包导出与协同流转中心 */}
      <div className="panel">
        <h3 style={{ margin: '0 0 16px', fontSize: '17px', color: '#142822', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={20} color="#0284c7" />
          项目分配绩点数据包（项目协同与核算流转）
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {/* 导出项目数据包 */}
          <div className="backup-card" style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={16} color="#0284c7" />
                导出项目数据包
              </h4>
              <Badge tone="blue">协同流转标准包</Badge>
            </div>
            <p style={{ fontSize: '12.5px', color: '#475569', margin: '0 0 14px', lineHeight: 1.5 }}>
              将当前项目（或管理的全部项目）的合同额度、月度成员分配明细、个人绩点总额与流水分发一键打包为标准的绩点数据包文件（.json）。项目负责人可直接将此包提交发给绩效核算员。
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: '#ffffff', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '12px', border: '1px solid #e0f2fe' }}>
              <span>系统项目总数: <b style={{ color: '#0284c7' }}>{state.projects.length} 项</b></span>
              <span>合同总额度: <b>{wan(state.projects.reduce((acc, p) => acc + (p.contract || 0), 0))} 万元</b></span>
              <span>累计已分配: <b>{state.plans.filter(p => p.status === 'published').length} 个发布月次</b></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                className="primary"
                style={{ background: '#0284c7', borderColor: '#0369a1', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => onExportPackages && onExportPackages()}
              >
                <Package size={14} />导出项目数据包 (.json)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSV 导出区域 */}
      <div className="panel">
        <h3 style={{ margin: '0 0 16px', fontSize: '17px', color: '#142822' }}>
          <Download size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          CSV 数据一键导出
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 6px', fontSize: '15px' }}>工作令项目数据汇总</h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px' }}>包含工作令号、项目名称、客户、合同金额、起止月份、已规划与剩余额度。</p>
            <button className="primary" onClick={() => triggerDownload(exportProjectsCsv(state), `工作令项目汇总-${nowMonth()}.csv`)}>
              <Download size={14} />导出项目数据 CSV
            </button>
          </div>

          <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 6px', fontSize: '15px' }}>项目组成员明细</h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px' }}>包含各项目中成员姓名、所属专业组、累计分配绩点与额度。</p>
            <button className="secondary" onClick={() => triggerDownload(exportProjectMembersCsv(state), `项目组成员明细-${nowMonth()}.csv`)}>
              <Download size={14} />导出成员明细 CSV
            </button>
          </div>

          <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 6px', fontSize: '15px' }}>部门成员花名册</h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px' }}>包含姓名、职务、专业组、专业组职务、所属部门、邮箱、角色。</p>
            <button className="secondary" onClick={() => triggerDownload(exportEmployeesCsv(state), `部门成员花名册-${nowMonth()}.csv`)}>
              <Download size={14} />导出部门成员 CSV
            </button>
          </div>
        </div>
      </div>

      {/* CSV 导入区域 */}
      <div className="panel">
        <h3 style={{ margin: '0 0 16px', fontSize: '17px', color: '#142822' }}>
          <Upload size={18} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          批量导入数据
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* 部门成员导入 */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '15px' }}>批量导入部门成员 (编制表格式)</h4>
              <button className="text-button" onClick={() => triggerDownload(getEmployeeTemplateCsv(), '部门成员导入模板(人员编制标准格式).csv')}>
                <Download size={13} />下载编制模板
              </button>
            </div>
            <input type="file" ref={empFileInput} accept=".csv" onChange={handleEmpFile} style={{ display: 'none' }} />
            <div className="import-dropzone" onClick={() => empFileInput.current?.click()}>
              <Upload size={24} color="#15803d" />
              <p>点击选择 CSV 文件</p>
              <small>支持人员编制标准格式：序号、姓名、职务、专业组、专业组职务（或通用格式：姓名、部门、专业组、邮箱、角色）</small>
            </div>

            {empPreview && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>解析预览 ({empPreview.length} 人)</span>
                  {isAdmin ? (
                    <button className="primary" onClick={async () => {
                      await onImportEmployees(empPreview);
                      setEmpPreview(null);
                    }}>
                      确认导入系统
                    </button>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#b45309' }}>需管理员权限导入</span>
                  )}
                </div>
                <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                  <table>
                    <thead>
                      <tr><th>姓名</th><th>职务</th><th>专业组</th><th>专业组职务</th><th>所属部门</th></tr>
                    </thead>
                    <tbody>
                      {empPreview.slice(0, 10).map((e, idx) => (
                        <tr key={idx}>
                          <td><b>{e.name}</b></td>
                          <td>{e.position || '—'}</td>
                          <td><GroupTag group={e.group} /></td>
                          <td><GroupRoleBadge role={e.groupRole} /></td>
                          <td>{e.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {empPreview.length > 10 && (
                    <div style={{ textAlign: 'center', fontSize: '11px', color: '#64748b', padding: '6px' }}>
                      ... 剩余 {empPreview.length - 10} 位成员已全部载入
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 项目数据导入 */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '15px' }}>批量导入项目数据 (工作令格式)</h4>
              <button className="text-button" onClick={() => triggerDownload(getProjectTemplateCsv(), '项目工作令导入标准模板.csv')}>
                <Download size={13} />下载工作令模板
              </button>
            </div>
            <input type="file" ref={prjFileInput} accept=".csv" onChange={handlePrjFile} style={{ display: 'none' }} />
            <div className="import-dropzone" onClick={() => prjFileInput.current?.click()}>
              <Upload size={24} color="#1d4ed8" />
              <p>点击选择 CSV 文件</p>
              <small>支持工作令标准格式：序号、项目名称、合同金额(万元)、工作令号、开始日期、结束日期（支持“不确定/待定/留空”）</small>
            </div>

            {prjPreview && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>解析预览 ({prjPreview.length} 项)</span>
                  {isAdmin ? (
                    <button className="primary" onClick={async () => {
                      await onImportProjects(prjPreview);
                      setPrjPreview(null);
                    }}>
                      确认导入系统
                    </button>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#b45309' }}>需管理员权限导入</span>
                  )}
                </div>
                <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                  <table>
                    <thead>
                      <tr><th>工作令号</th><th>项目名称</th><th>合同金额(万元)</th><th>项目周期</th></tr>
                    </thead>
                    <tbody>
                      {prjPreview.slice(0, 10).map((p, idx) => (
                        <tr key={idx}>
                          <td><span style={{ fontWeight: 600, color: '#166534' }}>{p.code}</span></td>
                          <td><b>{p.name}</b></td>
                          <td>{wan(p.contract)} 万元</td>
                          <td style={{ fontSize: '11px', color: '#64748b' }}>{p.start} 至 {p.end || '持续推进/不确定'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {prjPreview.length > 10 && (
                    <div style={{ textAlign: 'center', fontSize: '11px', color: '#64748b', padding: '6px' }}>
                      ... 剩余 {prjPreview.length - 10} 个项目已全部载入
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* 灾备加密导出弹窗 */}
      {exportModalOpen && (
        <Modal
          title="🔐 导出企业级加密全量灾备快照"
          subtitle="系统将采用国际标准 AES-256-GCM 高强度加密打包当前所有人员、项目、规划与配置，导入还原时须输入该权限口令方可解密。"
          onClose={() => setExportModalOpen(false)}
        >
          <form onSubmit={handleConfirmExportEncrypted}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', fontSize: '12.5px', color: '#166534' }}>
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>🛡️ 数据高强度安全防线</div>
                灾备数据包含全单位项目合同、预算总额、人员编制、项目组配置及月度绩点。加密后生成防篡改文件，脱离权限口令无法解密，可安心进行离线归档或跨设备交接。
              </div>

              <Field label="设置灾备加密权限口令" hint="建议输入至少 4 位字符，请妥善保管该口令">
                <input
                  type="password"
                  value={exportPassword}
                  onChange={e => setExportPassword(e.target.value)}
                  placeholder="请输入权限口令..."
                  autoFocus
                  required
                />
              </Field>

              <Field label="确认加密口令" hint="请再次输入以防输入有误">
                <input
                  type="password"
                  value={exportPasswordConfirm}
                  onChange={e => setExportPasswordConfirm(e.target.value)}
                  placeholder="请再次输入权限口令..."
                  required
                />
              </Field>
            </div>

            <div className="modal-footer">
              <button type="button" className="secondary" onClick={() => setExportModalOpen(false)}>
                取消
              </button>
              <button type="submit" className="primary" disabled={isExporting} style={{ background: '#15803d' }}>
                {isExporting ? '加密打包中...' : '🔐 确认加密并下载快照'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* 灾备解密权限验证弹窗 */}
      {decryptModalOpen && (
        <Modal
          title="🔐 灾备数据权限口令验证"
          subtitle="检测到该快照已被 AES-256-GCM 高强度加密，必须输入加密权限口令方可解密并查看数据"
          onClose={() => { setDecryptModalOpen(false); setPendingBackupText(null); }}
        >
          <form onSubmit={handleDecryptAndRestore}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', fontSize: '12.5px', color: '#92400e' }}>
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>🔒 权限受控保护</div>
                该快照文件已被加密保护。输入正确的权限口令后，系统将校验数据完整性并展示快照全景概览供您确认恢复。
              </div>

              <Field label="输入灾备加密权限口令">
                <input
                  type="password"
                  value={decryptPassword}
                  onChange={e => setDecryptPassword(e.target.value)}
                  placeholder="请输入导出时设置的口令..."
                  autoFocus
                  required
                />
              </Field>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="secondary"
                onClick={() => { setDecryptModalOpen(false); setPendingBackupText(null); }}
              >
                取消
              </button>
              <button type="submit" className="primary" disabled={isDecrypting}>
                {isDecrypting ? '验证解密中...' : '🔓 验证口令并解密还原'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Modals for Editing & Creating
// -------------------------------------------------------------
function EmployeeFormModal({ value, onClose, onSave }: { value: Employee | 'new'; onClose(): void; onSave(data: any): void }) {
  const old = value === 'new' ? null : value;
  const [employeeNo, setEmployeeNo] = useState(old?.employeeNo || (old && !old.id.startsWith('emp_') ? old.id : ''));
  const [name, setName] = useState(old?.name || '');
  const [position, setPosition] = useState(old?.position || '');
  const [department, setDepartment] = useState(old?.department || '第四研究室');
  const [group, setGroup] = useState(old?.group || '产品组');
  const [groupRole, setGroupRole] = useState(old?.groupRole || '组员');
  const [email, setEmail] = useState(old?.email || '');
  const [role, setRole] = useState<'admin' | 'auditor' | 'member'>(old?.role || 'member');

  return (
    <Modal title={old ? '编辑员工' : '添加员工'} subtitle="维护员工工号、职务、所属专业组及系统管理权限" onClose={onClose}>
      <form onSubmit={e => {
        e.preventDefault();
        onSave({ id: old?.id, employeeNo: employeeNo.trim() || undefined, name, position, department, group, groupRole, email, role, active: true });
      }}>
        <div className="form-grid two">
          <Field label="员工工号 / 唯一ID (核心唯一标识)" hint="用于跨项目数据包唯一识别与合并，建议使用工号（如 1001、1012、TF-001）">
            <input autoFocus value={employeeNo} onChange={e => setEmployeeNo(e.target.value)} placeholder="例如：1012" required />
          </Field>
          <Field label="员工姓名">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="例如：张工" required />
          </Field>
          <Field label="职务岗位" hint="例如：副所长,主任 / 副主任 / 高级工程师 / 工程师 / 助理工程师 / 研究员 / 核算">
            <input value={position} onChange={e => setPosition(e.target.value)} placeholder="例如：工程师、高级工程师、主任助理" />
          </Field>
          <Field label="所属专业组 (核心分类)">
            <select value={group} onChange={e => setGroup(e.target.value)}>
              {DEFAULT_GROUPS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
              <option value="产品组,研发组">产品组,研发组 (双组)</option>
              <option value="产品组,总体组">产品组,总体组 (双组)</option>
              <option value="研发组,产品组">研发组,产品组 (双组)</option>
              <option value="未分组">未分组 / 所部领导</option>
              <option value="其他">其他业务组</option>
            </select>
          </Field>
          <Field label="专业组职务" hint="职务角色：组长、副组长、顾问、组员">
            <select value={groupRole} onChange={e => setGroupRole(e.target.value)}>
              <option value="组员">组员</option>
              <option value="组长">🌟 组长</option>
              <option value="副组长">副组长</option>
              <option value="顾问">顾问</option>
              <option value="">无 / 领导</option>
            </select>
          </Field>
          <Field label="系统权限 (管理员设置)" hint="系统管理员拥有项目增删与灾备最高权限；核算员拥有全项目全员汇总权限">
            <select value={role} onChange={e => setRole(e.target.value as 'admin' | 'auditor' | 'member')}>
              <option value="member">👤 普通成员（参与项目考核、查看报表）</option>
              <option value="auditor">📊 绩效核算员（拥有全项目全员绩点汇总、数据包导入与核算报表导出权限）</option>
              <option value="admin">👑 系统管理员（拥有全部管理与灾备权限）</option>
            </select>
          </Field>
          <Field label="所属部门">
            <input value={department} onChange={e => setDepartment(e.target.value)} placeholder="例如：产品部 / 研发部 / 总体部 / 综合管理部" required />
          </Field>
          <Field label="电子邮箱（选填）">
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
          </Field>
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>取消</button>
          <button className="primary"><Save size={15} />保存员工</button>
        </div>
      </form>
    </Modal>
  );
}

function SaveGroupQuickModal({
  isOpen,
  initialName,
  initialType = '项目组',
  initialLeader = '',
  initialDescription = '',
  memberIds,
  employees,
  defaultRates,
  memberEntries,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  initialName: string;
  initialType?: string;
  initialLeader?: string;
  initialDescription?: string;
  memberIds: string[];
  employees: Employee[];
  defaultRates?: Record<string, number>;
  memberEntries?: any[];
  onClose(): void;
  onSave(group: ProjectGroup): void;
}) {
  const [name, setName] = useState(initialName || '');
  const [type, setType] = useState<string>(initialType || '项目组');
  const [leaderId, setLeaderId] = useState(initialLeader || memberIds[0] || '');
  const [description, setDescription] = useState(initialDescription || '');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!name.trim()) {
      setError('请输入团队/项目组名称');
      return;
    }
    const newGroup: ProjectGroup = {
      id: `cg_${Date.now()}`,
      name: name.trim(),
      type,
      leaderId: leaderId || undefined,
      memberIds: [...memberIds],
      defaultRates,
      memberEntries,
      description: description.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onSave(newGroup);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal title="💾 存为常用项目组 / 分配模版" subtitle={`将当前包含的 ${memberIds.length} 名成员及配置存入项目组库，方便后续随时一键复用`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '4px 0' }}>
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '8px 12px', borderRadius: '6px', fontSize: '12.5px' }}>{error}</div>}
        
        <Field label="项目组 / 模版名称 *">
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="例如：重大专项研发组、前沿技术交流组、无人机攻坚队"
            autoFocus
          />
        </Field>

        <div className="grid-2">
          <Field label="组类别 *">
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="项目组">📁 项目组</option>
              <option value="技术交流组">💡 技术交流组</option>
              <option value="任务攻坚组">🚀 任务攻坚组</option>
              <option value="专项研发组">⚙️ 专项研发组</option>
              <option value="常规协同组">🤝 常规协同组</option>
            </select>
          </Field>

          <Field label="组长 / 负责人">
            <select value={leaderId} onChange={e => setLeaderId(e.target.value)}>
              <option value="">-- 未指定负责人 --</option>
              {memberIds.map(id => {
                const emp = employees.find(e => e.id === id);
                return <option key={id} value={id}>👑 {emp?.name || id} ({emp?.group || emp?.department || ''})</option>;
              })}
            </select>
          </Field>
        </div>

        <Field label="团队职责 / 工作目标与任务说明">
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="可在此备注该团队主要负责的研究方向、攻坚目标或交流主题..."
          />
        </Field>

        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
            已包含成员 ({memberIds.length} 人)
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '110px', overflowY: 'auto', background: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            {memberIds.map(id => {
              const emp = employees.find(e => e.id === id);
              const isLeader = id === leaderId;
              return (
                <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: isLeader ? '#fef3c7' : '#fff', border: isLeader ? '1px solid #fde68a' : '1px solid #cbd5e1', color: isLeader ? '#b45309' : '#334155', borderRadius: '4px', padding: '2px 6px', fontSize: '11.5px' }}>
                  {isLeader && '👑'} {emp?.name || id}
                  {emp?.group && <span style={{ fontSize: '10px', color: '#64748b' }}>({emp.group.split(',')[0]})</span>}
                </span>
              );
            })}
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '10px' }}>
          <button type="button" className="secondary" onClick={onClose}>取消</button>
          <button type="button" className="primary" onClick={handleConfirm}><Save size={14} /> 确认保存到项目组库</button>
        </div>
      </div>
    </Modal>
  );
}

function ProjectFormModal({ state, value, initialGroupId, projectGroups, onSaveGroups, onClose, onSave, onBatchImport }: {
  state: State;
  value: Project | 'new';
  initialGroupId?: string;
  projectGroups?: ProjectGroup[];
  onSaveGroups?(groups: ProjectGroup[]): void;
  onClose(): void;
  onSave(data: any): void;
  onBatchImport?(projects: any[]): Promise<void>;
}) {
  const old = value === 'new' ? null : value;
  const [endUncertain, setEndUncertain] = useState(old ? !old.end : false);
  const [form, setForm] = useState({
    code: old?.code || '',
    name: old?.name || '',
    client: old?.client || '',
    contract: old ? wan(old.contract) : '',
    owner: old?.owner || '',
    start: old?.start || nowMonth(),
    end: old?.end || '',
  });
  const [members, setMembers] = useState<string[]>(old?.members || []);
  const [activeGroupTab, setActiveGroupTab] = useState<string>('all');
  const [batchParsed, setBatchParsed] = useState<any[] | null>(null);
  const [importNotice, setImportNotice] = useState<string>('');
  const csvInputRef = useRef<HTMLInputElement>(null);
  const memberCsvInputRef = useRef<HTMLInputElement>(null);

  // 需求1：已完成额度、已完成比例、剩余额度、剩余比例 4 维双向联动
  const [isHistorical, setIsHistorical] = useState(Boolean(old?.historyCompletedAmount && old.historyCompletedAmount > 0));
  const [historyCompletedWan, setHistoryCompletedWan] = useState(old?.historyCompletedAmount ? wan(old.historyCompletedAmount) : '');
  const [historyCompletedRateStr, setHistoryCompletedRateStr] = useState(() => {
    if (old?.historyCompletedRate) return (old.historyCompletedRate / 100).toFixed(2).replace(/\.00$/, '');
    if (old?.historyCompletedAmount && old.contract > 0) return ((old.historyCompletedAmount / old.contract) * 100).toFixed(2).replace(/\.00$/, '');
    return '';
  });
  const [remainingWan, setRemainingWan] = useState(() => {
    if (old) {
      const contractWan = old.contract / 1_000_000;
      const histWan = (old.historyCompletedAmount || 0) / 1_000_000;
      return Math.max(0, contractWan - histWan).toFixed(2).replace(/\.00$/, '');
    }
    return '';
  });
  const [remainingRateStr, setRemainingRateStr] = useState(() => {
    if (old) {
      const hRate = old.historyCompletedRate || (old.contract > 0 ? ((old.historyCompletedAmount || 0) / old.contract) * 10000 : 0);
      const rRate = Math.max(0, 10000 - hRate);
      return (rRate / 100).toFixed(2).replace(/\.00$/, '');
    }
    return '';
  });

  // 常用项目组模版
  const commonGroups = projectGroups || [];
  const [selectedCommonGroupId, setSelectedCommonGroupId] = useState(initialGroupId || '');
  const [quickSaveOpen, setQuickSaveOpen] = useState(false);

  useEffect(() => {
    if (initialGroupId && commonGroups.length > 0) {
      handleApplyCommonGroup(initialGroupId);
    }
  }, [initialGroupId]);

  const saveCommonGroupsToStorage = (groups: ProjectGroup[]) => {
    if (onSaveGroups) onSaveGroups(groups);
  };

  const handleApplyCommonGroup = (groupId: string) => {
    if (!groupId) return;
    const target = commonGroups.find(g => g.id === groupId);
    if (!target) return;
    const combined = Array.from(new Set([...members, ...target.memberIds]));
    setMembers(combined);
    if (!form.owner && target.leaderId) {
      setForm(f => ({ ...f, owner: target.leaderId! }));
    }
    setImportNotice(`✅ 已载入常用项目组【${target.name}】（${target.type || '项目组'}），当前项目组成员已增至 ${combined.length} 人`);
  };

  const handleSaveCurrentAsCommonGroup = () => {
    if (members.length === 0) {
      alert('请先勾选或通过 CSV 导入成员，再保存为常用项目组');
      return;
    }
    setQuickSaveOpen(true);
  };

  const handleDeleteCommonGroup = (groupId: string) => {
    const target = commonGroups.find(g => g.id === groupId);
    if (!target) return;
    if (confirm(`确定要删除常用项目组【${target.name}】吗？`)) {
      const updated = commonGroups.filter(g => g.id !== groupId);
      saveCommonGroupsToStorage(updated);
      if (selectedCommonGroupId === groupId) setSelectedCommonGroupId('');
    }
  };

  const handleMemberCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const text = evt.target?.result as string;
        const res = parseProjectGroupCsvText(text, state);
        if (res.memberIds.length === 0) throw new Error('未在 CSV 中解析到有效员工姓名');
        if (res.newEmployees.length > 0) {
          state.employees.push(...res.newEmployees);
        }
        const merged = Array.from(new Set([...members, ...res.memberIds]));
        setMembers(merged);
        const hasRates = Object.values(res.defaultRates || {}).some(r => typeof r === 'number' && r > 0);
        if (hasRates) {
          const autoName = file.name.replace(/\.csv$/i, '') || '常用项目组模版';
          const newGroup = {
            id: `cg_${Date.now()}`,
            name: autoName,
            type: '项目组',
            memberIds: res.memberIds,
            defaultRates: res.defaultRates,
            memberEntries: res.memberEntries
          };
          const updated = [...commonGroups.filter(g => g.name !== autoName), newGroup];
          saveCommonGroupsToStorage(updated);
          setSelectedCommonGroupId(newGroup.id);
          setImportNotice(`✅ 成功导入常用项目组模版【${autoName}】！包含 ${res.memberIds.length} 名成员及月度默认分配比例，已同步存入常用项目组模版库，可在月度分配中直接复用！`);
        } else {
          setImportNotice(`✅ 成功通过 CSV 导入 ${res.memberIds.length} 名成员（${res.newEmployees.length > 0 ? `包含自动注册新成员 ${res.newEmployees.length} 名` : '全部匹配成功'}）！当前共 ${merged.length} 名成员。可点击下方“保存当前为常用组”以便后续项目复用。`);
        }
      } catch (err) {
        alert(errorText(err));
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  // 4 维联动计算
  const handleHistoryCompletedWanChange = (valStr: string) => {
    setHistoryCompletedWan(valStr);
    const contractNum = Number(form.contract) || 0;
    const histNum = Number(valStr) || 0;
    if (contractNum > 0) {
      const remNum = Math.max(0, contractNum - histNum);
      setRemainingWan(remNum.toFixed(2).replace(/\.00$/, ''));
      const hPct = Math.min(100, Math.max(0, (histNum / contractNum) * 100));
      const rPct = Math.max(0, 100 - hPct);
      setHistoryCompletedRateStr(hPct.toFixed(2).replace(/\.00$/, ''));
      setRemainingRateStr(rPct.toFixed(2).replace(/\.00$/, ''));
    }
  };

  const handleHistoryCompletedRateChange = (valStr: string) => {
    setHistoryCompletedRateStr(valStr);
    const contractNum = Number(form.contract) || 0;
    const hPct = Number(valStr) || 0;
    const rPct = Math.max(0, 100 - hPct);
    setRemainingRateStr(rPct.toFixed(2).replace(/\.00$/, ''));
    if (contractNum > 0) {
      const histWan = (contractNum * hPct) / 100;
      const remWan = Math.max(0, contractNum - histWan);
      setHistoryCompletedWan(histWan.toFixed(2).replace(/\.00$/, ''));
      setRemainingWan(remWan.toFixed(2).replace(/\.00$/, ''));
    }
  };

  const handleRemainingWanChange = (valStr: string) => {
    setRemainingWan(valStr);
    const contractNum = Number(form.contract) || 0;
    const remNum = Number(valStr) || 0;
    if (contractNum > 0) {
      const histNum = Math.max(0, contractNum - remNum);
      setHistoryCompletedWan(histNum.toFixed(2).replace(/\.00$/, ''));
      const rPct = Math.min(100, Math.max(0, (remNum / contractNum) * 100));
      const hPct = Math.max(0, 100 - rPct);
      setRemainingRateStr(rPct.toFixed(2).replace(/\.00$/, ''));
      setHistoryCompletedRateStr(hPct.toFixed(2).replace(/\.00$/, ''));
    }
  };

  const handleRemainingRateChange = (valStr: string) => {
    setRemainingRateStr(valStr);
    const contractNum = Number(form.contract) || 0;
    const rPct = Number(valStr) || 0;
    const hPct = Math.max(0, 100 - rPct);
    setHistoryCompletedRateStr(hPct.toFixed(2).replace(/\.00$/, ''));
    if (contractNum > 0) {
      const remWan = (contractNum * rPct) / 100;
      const histWan = Math.max(0, contractNum - remWan);
      setRemainingWan(remWan.toFixed(2).replace(/\.00$/, ''));
      setHistoryCompletedWan(histWan.toFixed(2).replace(/\.00$/, ''));
    }
  };

  const set = (k: string, v: string) => {
    setForm(c => ({ ...c, [k]: v }));
    if (k === 'contract') {
      const cNum = Number(v) || 0;
      if (cNum > 0) {
        if (historyCompletedRateStr) {
          const hPct = Number(historyCompletedRateStr) || 0;
          const hWan = (cNum * hPct) / 100;
          const rWan = Math.max(0, cNum - hWan);
          setHistoryCompletedWan(hWan.toFixed(2).replace(/\.00$/, ''));
          setRemainingWan(rWan.toFixed(2).replace(/\.00$/, ''));
        } else if (historyCompletedWan) {
          const hNum = Number(historyCompletedWan) || 0;
          setRemainingWan(Math.max(0, cNum - hNum).toFixed(2).replace(/\.00$/, ''));
          const hPct = Math.min(100, Math.max(0, (hNum / cNum) * 100));
          const rPct = Math.max(0, 100 - hPct);
          setHistoryCompletedRateStr(hPct.toFixed(2).replace(/\.00$/, ''));
          setRemainingRateStr(rPct.toFixed(2).replace(/\.00$/, ''));
        }
      }
    }
  };
  const toggle = (id: string) => setMembers(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id]);
  const chooseOwner = (id: string) => {
    set('owner', id);
    if (!members.includes(id)) setMembers(c => [...c, id]);
  };

  const fillFromItem = (item: any) => {
    setForm({
      code: item.code,
      name: item.name,
      client: item.client || '',
      contract: wan(item.contract),
      owner: item.owner || state.employees.find(emp => emp.active)?.id || '',
      start: item.start || nowMonth(),
      end: item.end || '',
    });
    setEndUncertain(!item.end);
    if (item.historyCompletedAmount) {
      setIsHistorical(true);
      setHistoryCompletedWan(wan(item.historyCompletedAmount));
      const c = item.contract / 1_000_000;
      const h = item.historyCompletedAmount / 1_000_000;
      setRemainingWan(Math.max(0, c - h).toFixed(2).replace(/\.00$/, ''));
      const hPct = c > 0 ? (h / c) * 100 : 0;
      setHistoryCompletedRateStr(hPct.toFixed(2).replace(/\.00$/, ''));
      setRemainingRateStr(Math.max(0, 100 - hPct).toFixed(2).replace(/\.00$/, ''));
    } else {
      setIsHistorical(false);
      setHistoryCompletedWan('');
      setRemainingWan(wan(item.contract));
      setHistoryCompletedRateStr('');
      setRemainingRateStr('100');
    }
    if (item.members?.length) {
      setMembers(item.members);
    } else if (item.owner) {
      setMembers([item.owner]);
    }
    setImportNotice(`✅ 已将项目【${item.name}】（工作令号：${item.code}）数据填入表单`);
  };

  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async evt => {
      try {
        const text = evt.target?.result as string;
        const list = parseProjectCsvText(text, state);
        if (list.length === 0) throw new Error('未在 CSV 中解析到有效项目数据');

        if (list.length === 1) {
          fillFromItem(list[0]);
          setBatchParsed(null);
        } else {
          setBatchParsed(list);
          fillFromItem(list[0]);
          setImportNotice(`已成功解析工作令清单中的 ${list.length} 个项目！已默认将第 1 个项目填入下方表单；您也可直接点击下方“⚡ 一键批量创建这 ${list.length} 个项目”将它们直接全部导入系统。`);
        }
      } catch (err) {
        alert(errorText(err));
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const selectEntireGroup = (grp: string) => {
    const grpMemberIds = state.employees.filter(e => e.active && e.group && e.group.includes(grp)).map(e => e.id);
    const combined = Array.from(new Set([...members, ...grpMemberIds]));
    setMembers(combined);
  };

  const filteredEmployees = state.employees.filter(e => {
    if (!e.active) return false;
    if (activeGroupTab !== 'all' && !(e.group && e.group.includes(activeGroupTab))) return false;
    return true;
  });

  return (
    <Modal title={old ? '编辑项目' : '新建项目'} subtitle="设置工作令号、合同总额、起止周期、负责人与专业组成员" wide onClose={onClose}>
      {/* 工作令 CSV 快速导入栏 */}
      {value === 'new' && (
        <div className="csv-quick-import-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="csv-icon-badge">
              <FileSpreadsheet size={20} color="#15803d" />
            </div>
            <div>
              <strong style={{ fontSize: '13.5px', color: '#166534', display: 'block' }}>
                快速导入：直接采用工作令项目清单 CSV 创建项目
              </strong>
              <span style={{ fontSize: '12px', color: '#4b7361' }}>
                支持工作令标准格式（序号、项目名称、合同金额、工作令号、开始日期、结束日期）。单个项目自动填充表单；多个项目可一键批量导入！
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
            <input type="file" ref={csvInputRef} accept=".csv" style={{ display: 'none' }} onChange={handleCsvFile} />
            <button
              type="button"
              className="secondary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
              onClick={() => triggerDownload(getProjectTemplateCsv(), '项目工作令导入标准模板.csv')}
            >
              <Download size={13} />下载工作令模板
            </button>
            <button
              type="button"
              className="primary"
              style={{ fontSize: '12px', padding: '6px 14px', background: '#166534' }}
              onClick={() => csvInputRef.current?.click()}
            >
              <Upload size={13} />导入工作令 CSV
            </button>
          </div>
        </div>
      )}

      {importNotice && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '12.5px', color: '#166534', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{importNotice}</span>
          <button type="button" className="icon-button" style={{ width: 20, height: 20 }} onClick={() => setImportNotice('')}><X size={13} /></button>
        </div>
      )}

      {/* 多项目批量导入快捷栏 */}
      {batchParsed && batchParsed.length > 0 && (
        <div className="batch-preview-box">
          <header>
            <div>
              <b style={{ fontSize: '13px', color: '#1e293b' }}>
                已解析 CSV 包含 {batchParsed.length} 个项目
              </b>
              <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px' }}>
                可一键直接全部创建，或点击任意一项填充下方表单
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {onBatchImport && (
                <button
                  type="button"
                  className="primary"
                  style={{ fontSize: '12px', padding: '5px 12px', background: '#0f766e' }}
                  onClick={async () => {
                    await onBatchImport(batchParsed);
                  }}
                >
                  ⚡ 一键批量创建这 {batchParsed.length} 个项目
                </button>
              )}
              <button
                type="button"
                className="icon-button"
                style={{ width: 24, height: 24 }}
                onClick={() => setBatchParsed(null)}
              >
                <X size={14} />
              </button>
            </div>
          </header>
          <div style={{ maxHeight: '140px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>工作令号</th>
                  <th>项目名称</th>
                  <th>合同金额(万元)</th>
                  <th>起止日期</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {batchParsed.slice(0, 15).map((p, idx) => (
                  <tr key={idx}>
                    <td><span style={{ fontWeight: 600, color: '#166534' }}>{p.code}</span></td>
                    <td><b>{p.name}</b></td>
                    <td>{wan(p.contract)} 万元</td>
                    <td style={{ fontSize: '11px', color: '#64748b' }}>{p.start} 至 {p.end || '不确定'}</td>
                    <td>
                      <button
                        type="button"
                        className="text-button"
                        style={{ fontSize: '11px' }}
                        onClick={() => fillFromItem(p)}
                      >
                        填入表单
                      </button>
                    </td>
                  </tr>
                ))}
                {batchParsed.length > 15 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
                      ... 以及其他 {batchParsed.length - 15} 个项目（点击右上角“一键批量创建”可直接全部导入）
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <form onSubmit={e => {
        e.preventDefault();
        onSave({
          id: old?.id,
          ...form,
          end: endUncertain ? '' : form.end,
          contract: toMoney(form.contract),
          members,
          historyCompletedAmount: isHistorical && historyCompletedWan ? toMoney(historyCompletedWan) : 0,
          historyCompletedRate: isHistorical && historyCompletedRateStr ? toRate(historyCompletedRateStr) : 0,
        });
      }}>
        <div className="form-grid two">
          <Field label="工作令号">
            <input autoFocus value={form.code} onChange={e => set('code', e.target.value)} placeholder="例如：22-0128 或 23-0181" required />
          </Field>
          <Field label="项目名称">
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="例如：E1 S部 或 EA1 LDC" required />
          </Field>
          <Field label="客户名称（选填）" hint="选填，无委托主体或自研项目可留空">
            <input value={form.client} onChange={e => set('client', e.target.value)} placeholder="选填，例如：某科技研究院" />
          </Field>
          <Field label="合同总金额（万元）" hint="以万元录入，支持小数（如 130.90、316.82、35.553）">
            <input value={form.contract} onChange={e => set('contract', e.target.value)} placeholder="130.90" required />
          </Field>
          <Field label="开始月份">
            <input type="month" value={form.start} onChange={e => set('start', e.target.value)} required />
          </Field>
          <Field label="结束月份（可不确定）" hint="如结束时间待定或不确定，勾选下方选项">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input
                type="month"
                value={endUncertain ? '' : form.end}
                min={form.start}
                disabled={endUncertain}
                onChange={e => set('end', e.target.value)}
                placeholder={endUncertain ? '不确定 / 待定 / 持续推进' : ''}
              />
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={endUncertain}
                  onChange={e => {
                    const checked = e.target.checked;
                    setEndUncertain(checked);
                    if (checked) set('end', '');
                    else if (!form.end) set('end', form.start);
                  }}
                />
                <span>结束日期暂不确定（待定 / 持续推进）</span>
              </label>
            </div>
          </Field>
          <Field label="项目负责人" hint="负责人将自动加入成员名单">
            <select value={form.owner} onChange={e => chooseOwner(e.target.value)} required>
              <option value="">请选择负责人</option>
              {state.employees.filter(e => e.active).map(e => (
                <option key={e.id} value={e.id}>{e.name} · {e.department} ({e.group || '未分组'})</option>
              ))}
            </select>
          </Field>
        </div>

        {/* 历史项目额度与比例处理（需求1） */}
        <div style={{ background: isHistorical ? '#f0fdf4' : '#f8fafc', border: isHistorical ? '1px solid #86efac' : '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', margin: '14px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', color: isHistorical ? '#166534' : '#334155' }}>
              <input
                type="checkbox"
                checked={isHistorical}
                onChange={e => {
                  const checked = e.target.checked;
                  setIsHistorical(checked);
                  if (!checked) {
                    setHistoryCompletedWan('');
                    setHistoryCompletedRateStr('');
                    setRemainingWan(form.contract);
                    setRemainingRateStr('100');
                  } else if (!historyCompletedWan && form.contract) {
                    setRemainingWan(form.contract);
                    setRemainingRateStr('100');
                  }
                }}
              />
              <span>📌 此项目为历史项目（设置已完成额度与比例，后续月度绩点考核严格限制在剩余额度中分配）</span>
            </label>
            {isHistorical && (
              <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>
                {(() => {
                  const c = Number(form.contract) || 0;
                  const h = Number(historyCompletedWan) || 0;
                  const r = Math.max(0, c - h);
                  const p = historyCompletedRateStr ? Number(historyCompletedRateStr).toFixed(2) : (c > 0 ? ((h / c) * 100).toFixed(2) : '0');
                  const rp = remainingRateStr ? Number(remainingRateStr).toFixed(2) : (c > 0 ? ((r / c) * 100).toFixed(2) : '0');
                  return `已完成 ${p}% · 后续限额 ${rp}% (${r.toFixed(2)} 万元)`;
                })()}
              </span>
            )}
          </div>

          {isHistorical && (
            <div style={{ marginTop: '10px' }}>
              <div className="form-grid two" style={{ gap: '12px' }}>
                <Field label="历史已完成额度（万元）" hint="此前在系统外已结项或已分配的额度">
                  <input
                    value={historyCompletedWan}
                    onChange={e => handleHistoryCompletedWanChange(e.target.value)}
                    placeholder="例如：60.00"
                    required={isHistorical}
                  />
                </Field>
                <Field label="历史已完成比例（%）" hint="占合同总额的历史完成比例，与额度双向联动">
                  <div
                    className="suffix-input"
                    onClick={e => {
                      const input = e.currentTarget.querySelector('input');
                      if (input && document.activeElement !== input) input.focus();
                    }}
                  >
                    <input
                      type="text"
                      inputMode="decimal"
                      value={historyCompletedRateStr}
                      onChange={e => handleHistoryCompletedRateChange(e.target.value)}
                      placeholder="例如：43.61"
                      required={isHistorical}
                    />
                    <span>%</span>
                  </div>
                </Field>
                <Field label="后续剩余可分配额度（万元）" hint="本系统后续月度方案只能从该剩余额度中分配">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={remainingWan}
                    onChange={e => handleRemainingWanChange(e.target.value)}
                    placeholder="例如：77.59"
                    required={isHistorical}
                  />
                </Field>
                <Field label="后续剩余比例（%）" hint="占合同总额的后续分配限额比例，与额度双向联动">
                  <div
                    className="suffix-input"
                    onClick={e => {
                      const input = e.currentTarget.querySelector('input');
                      if (input && document.activeElement !== input) input.focus();
                    }}
                  >
                    <input
                      type="text"
                      inputMode="decimal"
                      value={remainingRateStr}
                      onChange={e => handleRemainingRateChange(e.target.value)}
                      placeholder="例如：56.39"
                      required={isHistorical}
                    />
                    <span>%</span>
                  </div>
                </Field>
              </div>
            </div>
          )}
          {!isHistorical && (
            <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>
              全新项目将从 100% 满额在系统中逐月分配。若为已有历史进展的项目，勾选上方选项即可指定已完成比例与额度。
            </p>
          )}
        </div>

        {/* 需求5：选择项目组成员（支持常用项目组与 CSV 快速导入） */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>选择项目组成员 (已选 {members.length} 人)</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {DEFAULT_GROUPS.map(g => (
                <button
                  type="button"
                  key={g}
                  style={{ border: '1px solid #cbd5cf', background: '#f7faf8', borderRadius: '5px', padding: '2px 8px', fontSize: '11px' }}
                  onClick={() => selectEntireGroup(g)}
                >
                  一键全选{g}
                </button>
              ))}
            </div>
          </div>

          {/* 常用项目组与 CSV 导入工具栏 */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>📁 常用项目组：</span>
              <select
                value={selectedCommonGroupId}
                onChange={e => {
                  setSelectedCommonGroupId(e.target.value);
                  if (e.target.value) handleApplyCommonGroup(e.target.value);
                }}
                style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff' }}
              >
                <option value="">选择常用项目组快速填充...</option>
                {commonGroups.map(cg => (
                  <option key={cg.id} value={cg.id}>
                    {cg.type === '技术交流组' ? '💡' : cg.type === '任务攻坚组' ? '🚀' : '📁'} {cg.name} ({cg.memberIds.length}人{cg.leaderId ? ` · 组长:${state.employees.find(e => e.id === cg.leaderId)?.name || ''}` : ''})
                  </option>
                ))}
              </select>
              {selectedCommonGroupId && (
                <button
                  type="button"
                  style={{ border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', borderRadius: '5px', padding: '3px 8px', fontSize: '11px' }}
                  onClick={() => handleDeleteCommonGroup(selectedCommonGroupId)}
                  title="删除此常用项目组预设"
                >
                  删除该组
                </button>
              )}
              <button
                type="button"
                className="secondary"
                style={{ padding: '4px 10px', fontSize: '11.5px', gap: '4px' }}
                onClick={handleSaveCurrentAsCommonGroup}
                title="将当前已选成员保存为常用项目组，方便以后一键调取"
              >
                <Save size={13} /> 保存当前为常用组
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="file"
                ref={memberCsvInputRef}
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleMemberCsvFile}
              />
              <button
                type="button"
                className="secondary"
                style={{ padding: '4px 10px', fontSize: '11.5px', gap: '4px' }}
                onClick={() => memberCsvInputRef.current?.click()}
                title="通过 CSV 表格批量导入项目组成员"
              >
                <Upload size={13} /> 导入成员 CSV
              </button>
              <button
                type="button"
                className="text-button"
                style={{ fontSize: '11.5px', color: '#166534' }}
                onClick={() => triggerDownload(getProjectGroupTemplateCsv(), '常用项目组模版(含月度分配比例).csv')}
                title="下载包含月度默认分配比例与工作内容的常用项目组模版 CSV"
              >
                <Download size={13} /> 下载常用组模版(含比例)
              </button>
              <button
                type="button"
                className="text-button"
                style={{ fontSize: '11.5px', color: '#475569' }}
                onClick={() => triggerDownload(getProjectMemberTemplateCsv(), '普通项目组成员导入模板.csv')}
                title="下载基础项目组成员 CSV 导入模板"
              >
                <Download size={13} /> 基础成员模板
              </button>
            </div>
          </div>

          <div className="group-tabs">
            <button type="button" className={activeGroupTab === 'all' ? 'active' : ''} onClick={() => setActiveGroupTab('all')}>全部</button>
            {DEFAULT_GROUPS.map(g => (
              <button type="button" key={g} className={activeGroupTab === g ? 'active' : ''} onClick={() => setActiveGroupTab(g)}>{g}</button>
            ))}
          </div>

          <div className="member-grid">
            {filteredEmployees.map(emp => (
              <label key={emp.id} className={members.includes(emp.id) ? 'selected' : ''}>
                <input type="checkbox" checked={members.includes(emp.id)} onChange={() => toggle(emp.id)} />
                <span>
                  {emp.name} {emp.employeeNo && <span style={{ fontSize: '11px', color: '#0369a1', background: '#e0f2fe', padding: '1px 5px', borderRadius: '4px', marginLeft: '4px' }}>[{emp.employeeNo}]</span>} <GroupTag group={emp.group} />
                  <small>{emp.department}</small>
                </span>
                {members.includes(emp.id) && <Check size={16} color="#15803d" />}
              </label>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>取消</button>
          <button className="primary"><Save size={15} />保存项目</button>
        </div>

        {quickSaveOpen && (
          <SaveGroupQuickModal
            isOpen={quickSaveOpen}
            initialName={form.name ? `${form.name} 协作团队` : '研发攻坚协作组'}
            initialType="项目组"
            initialLeader={form.owner}
            memberIds={members}
            employees={state.employees}
            onClose={() => setQuickSaveOpen(false)}
            onSave={newGroup => {
              const updated = [...commonGroups.filter(g => g.name !== newGroup.name), newGroup];
              saveCommonGroupsToStorage(updated);
              setSelectedCommonGroupId(newGroup.id);
              setImportNotice(`⭐ 已成功将当前 ${members.length} 位成员保存为【${newGroup.name}】（${newGroup.type}）！可直接在“项目组管理”标签中查看与编辑。`);
            }}
          />
        )}
      </form>
    </Modal>
  );
}

type PlanColKey = 'member' | 'rate' | 'amount' | 'work' | 'action';

interface PlanColDef {
  key: PlanColKey;
  label: string;
  width: string;
  align?: 'left' | 'center' | 'right';
}

const PLAN_COLUMNS_DEF: Record<PlanColKey, PlanColDef> = {
  member: { key: 'member', label: '序号 / 成员与专业组', width: '220px', align: 'left' },
  rate: { key: 'rate', label: '分配比例 (%)', width: '130px', align: 'center' },
  amount: { key: 'amount', label: '当月折合额度', width: '130px', align: 'right' },
  work: { key: 'work', label: '工作内容描述', width: '110px', align: 'center' },
  action: { key: 'action', label: '操作', width: '46px', align: 'center' },
};

function PlanFormModal({ state, value, initialProjectId, projectGroups, onSaveGroups, onOpenQuotaSchedule, onClose, onSave }: {
  state: State;
  value: Plan | 'new';
  initialProjectId: string;
  projectGroups?: ProjectGroup[];
  onSaveGroups?(groups: ProjectGroup[]): void;
  onOpenQuotaSchedule?(projectId: string): void;
  onClose(): void;
  onSave(data: any): void;
}) {
  const old = value === 'new' ? null : value;
  const [projectId, setProjectId] = useState(old?.projectId || initialProjectId || state.projects[0]?.id || '');
  const project = state.projects.find(p => p.id === projectId);
  const [month, setMonth] = useState(old?.month || project?.start || nowMonth());
  const [budget, setBudget] = useState(old ? String(old.budget / 100) : '');
  const [note, setNote] = useState(old?.note || '');

  // 组长置顶辅助函数
  const ensureLeaderOnTop = (list: string[], ownerId?: string): string[] => {
    if (!ownerId || !list.includes(ownerId)) return list;
    return [ownerId, ...list.filter(id => id !== ownerId)];
  };

  // 组长置顶在第一位，支持按填写比例从大到小排列，支持拖动排序
  const [planMembers, setPlanMembers] = useState<string[]>(() => {
    let raw: string[] = [];
    if (old?.entries && old.entries.length > 0) {
      const owner = project?.owner;
      const sortedEntries = [...old.entries].sort((a, b) => {
        if (a.employeeId === owner) return -1;
        if (b.employeeId === owner) return 1;
        return b.rate - a.rate;
      });
      raw = sortedEntries.map(e => e.employeeId);
    } else {
      raw = project?.members || [];
    }
    return ensureLeaderOnTop(raw, project?.owner);
  });
  const [rates, setRates] = useState<Record<string, string>>(() =>
    Object.fromEntries((old?.entries || project?.members.map(eId => ({ employeeId: eId, rate: 0 })) || []).map(e => [e.employeeId, String(e.rate / 100)]))
  );
  const [workContents, setWorkContents] = useState<Record<string, string>>(() =>
    Object.fromEntries((old?.entries || []).map(e => [e.employeeId, e.workContent || '']))
  );
  const [planNotice, setPlanNotice] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'rates' | 'work'>('rates');
  const [quickSaveOpen, setQuickSaveOpen] = useState(false);
  const planCsvFileRef = useRef<HTMLInputElement>(null);

  // 表格列宽调节状态 (可拖动列边框调节列宽)
  const [colWidths, setColWidths] = useState({
    member: 220,
    rate: 130,
    amount: 130,
    work: 110,
    action: 52,
  });

  // 表格行高调节状态 (36 紧凑, 44 标准, 56 宽松)
  const [rowHeight, setRowHeight] = useState<number>(44);

  const handleColResizeMouseDown = (colKey: keyof typeof colWidths, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = colWidths[colKey];

    const onMouseMove = (moveEvt: MouseEvent) => {
      const delta = moveEvt.clientX - startX;
      const minW = colKey === 'action' ? 44 : colKey === 'work' ? 70 : colKey === 'rate' || colKey === 'amount' ? 85 : 140;
      const maxW = colKey === 'member' ? 420 : 280;
      const newWidth = Math.max(minW, Math.min(maxW, startW + delta));
      setColWidths(prev => ({ ...prev, [colKey]: newWidth }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const gridColsStyle = `${colWidths.member}px ${colWidths.rate}px ${colWidths.amount}px ${colWidths.work}px ${colWidths.action}px`;

  // 填写比例时自动触发：组长始终置顶在第一位，其余成员按比例从大到小排列
  const autoSortMembersByRate = (list: string[], currentRates: Record<string, string>) => {
    const ownerId = project?.owner;
    return [...list].sort((a, b) => {
      if (a === ownerId) return -1;
      if (b === ownerId) return 1;
      const rateA = currentRates[a] ? parseFloat(currentRates[a]) || 0 : 0;
      const rateB = currentRates[b] ? parseFloat(currentRates[b]) || 0 : 0;
      return rateB - rateA;
    });
  };

  // 常用项目组模版
  const [commonGroupOptions, setCommonGroupOptions] = useState<ProjectGroup[]>(() => {
    return projectGroups || [];
  });

  useEffect(() => {
    if (projectGroups) {
      setCommonGroupOptions(projectGroups);
    }
  }, [projectGroups]);

  useEffect(() => {
    if (!old && project) {
      const topList = ensureLeaderOnTop(project.members, project.owner);
      const initRates: Record<string, string> = {};
      for (const id of project.members) {
        if (project.defaultRates && typeof project.defaultRates[id] === 'number') {
          initRates[id] = (project.defaultRates[id] / 100).toFixed(2).replace(/\.00$/, '');
        } else {
          initRates[id] = rates[id] || '';
        }
      }
      setRates(initRates);
      setPlanMembers(autoSortMembersByRate(topList, initRates));
      setWorkContents(Object.fromEntries(project.members.map(id => [id, workContents[id] || ''])));
    }
  }, [projectId]);

  const handleAddMember = (empId: string) => {
    if (!empId) return;
    if (!planMembers.includes(empId)) {
      setPlanMembers(c => [...c, empId]);
      setRates(c => ({ ...c, [empId]: '' }));
      setWorkContents(c => ({ ...c, [empId]: '' }));
    }
  };

  const handleRemoveMember = (empId: string) => {
    const emp = state.employees.find(e => e.id === empId);
    const curRate = rates[empId];
    if (curRate && Number(curRate) > 0) {
      if (!confirm(`确定将【${emp?.name || empId}】从本月分配名单中移除吗？其当月分配比例将被清空。`)) return;
    }
    setPlanMembers(c => c.filter(id => id !== empId));
    setRates(c => {
      const next = { ...c };
      delete next[empId];
      return next;
    });
    setWorkContents(c => {
      const next = { ...c };
      delete next[empId];
      return next;
    });
  };

  const adjustRate = (empId: string, deltaPct: number) => {
    setRates(c => {
      const cur = parseFloat(c[empId] || '0') || 0;
      const next = Math.max(0, Math.min(100, Math.round((cur + deltaPct) * 100) / 100));
      return { ...c, [empId]: next === 0 ? '' : String(next) };
    });
  };

  const handleEqualShare = () => {
    if (planMembers.length === 0) return;
    const n = planMembers.length;
    const base = Math.floor(10000 / n);
    let remainder = 10000 - base * n;
    const nextRates: Record<string, string> = {};
    for (const id of planMembers) {
      let share = base;
      if (remainder > 0) {
        share += 1;
        remainder -= 1;
      }
      nextRates[id] = (share / 100).toFixed(2).replace(/\.00$/, '');
    }
    setRates(nextRates);
    setPlanMembers(prev => autoSortMembersByRate(prev, nextRates));
    setPlanNotice(`⚖️ 已将 100% 比例在当前 ${n} 位成员间精确平分`);
  };

  const handleDistributeRemaining = () => {
    const rem = 10000 - memberTotal;
    if (rem === 0) {
      setPlanNotice('当前成员分配比例已精确满额 100%，无需补齐');
      return;
    }
    const targetId = project?.owner && planMembers.includes(project.owner) ? project.owner : planMembers[0];
    if (!targetId) return;
    const cur = (() => { try { return rates[targetId] ? toRate(rates[targetId]) : 0; } catch { return 0; } })();
    const nextTotal = Math.max(0, cur + rem);
    const updatedRates = { ...rates, [targetId]: (nextTotal / 100).toFixed(2).replace(/\.00$/, '') };
    setRates(updatedRates);
    setPlanMembers(prev => autoSortMembersByRate(prev, updatedRates));
    const emp = state.employees.find(e => e.id === targetId);
    setPlanNotice(`🎯 已将剩余 ${pct(rem)} 比例自动补齐至负责人【${emp?.name || targetId}】`);
  };

  const handleResetRates = () => {
    setRates(Object.fromEntries(planMembers.map(id => [id, ''])));
    setPlanNotice('已重置清空全部成员分配比例');
  };

  const handleApplyCommonGroup = (grpId: string) => {
    if (!grpId) return;
    const target = commonGroupOptions.find(g => g.id === grpId);
    if (!target) return;
    const combined = Array.from(new Set([...planMembers, ...(target.memberIds || [])]));
    const topList = ensureLeaderOnTop(combined, project?.owner);
    const nextRates = { ...rates };
    if (target.defaultRates) {
      for (const [empId, rateVal] of Object.entries(target.defaultRates)) {
        if (typeof rateVal === 'number' && rateVal > 0) {
          nextRates[empId] = (rateVal / 100).toFixed(2).replace(/\.00$/, '');
        }
      }
      setRates(nextRates);
    }
    setPlanMembers(autoSortMembersByRate(topList, nextRates));
    if (Array.isArray(target.memberEntries)) {
      const nextWork = { ...workContents };
      for (const item of target.memberEntries) {
        if (item.workContent) nextWork[item.employeeId] = item.workContent;
      }
      setWorkContents(nextWork);
    }
    setPlanNotice(`✅ 已载入常用项目组模版【${target.name}】及对应默认比例与工作内容！`);
  };

  const handleSaveAsCommonGroup = () => {
    if (planMembers.length === 0) {
      alert('当前分配名单为空，请先添加成员');
      return;
    }
    setQuickSaveOpen(true);
  };

  const handleConfirmSaveGroupFromPlan = (newGroup: ProjectGroup) => {
    const defaultRates: Record<string, number> = {};
    const memberEntries: any[] = [];
    for (const id of planMembers) {
      const r = rates[id] ? toRate(rates[id]) : 0;
      defaultRates[id] = r;
      memberEntries.push({ employeeId: id, defaultRate: r, workContent: workContents[id] || '' });
    }
    const finalGroup: ProjectGroup = {
      ...newGroup,
      defaultRates,
      memberEntries,
    };
    const updated = [...commonGroupOptions.filter(g => g.name !== finalGroup.name), finalGroup];
    setCommonGroupOptions(updated);
    if (onSaveGroups) onSaveGroups(updated);
    setPlanNotice(`⭐ 已将当前 ${planMembers.length} 位成员及其分配比例、工作内容保存为【${finalGroup.name}】（${finalGroup.type}）！可在“项目组管理”中查看管理。`);
  };

  const handlePlanCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const text = evt.target?.result as string;
        const res = parsePlanMemberCsvText(text, state);
        if (res.entries.length === 0) throw new Error('未在 CSV 中解析到有效分配数据');
        if (res.newEmployees.length > 0) {
          state.employees.push(...res.newEmployees);
        }
        const newMembers = Array.from(new Set([...planMembers, ...res.entries.map(e => e.employeeId)]));
        const nextRates = { ...rates };
        const nextWork = { ...workContents };
        for (const en of res.entries) {
          nextRates[en.employeeId] = (en.rate / 100).toFixed(2).replace(/\.00$/, '');
          if (en.workContent) nextWork[en.employeeId] = en.workContent;
        }
        setPlanMembers(newMembers);
        setRates(nextRates);
        setWorkContents(nextWork);
        setPlanNotice(`✅ 成功通过 CSV 导入 ${res.entries.length} 位成员的分配比例与工作内容！`);
      } catch (err) {
        alert(errorText(err));
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const memberTotal = total(planMembers.map(id => {
    try { return rates[id] ? toRate(rates[id]) : 0; } catch { return 0; }
  }));

  const otherMonthsBudget = project ? projectBudgetRate(state, project.id) - (old?.budget || 0) : 0;
  let preview = 0;
  try {
    if (project && budget) preview = monthAmount(project, { budget: toRate(budget) } as Plan);
  } catch {}

  const currentMonthQuota = project?.quotaSchedule?.find(s => s.month === month);
  const quotaPerspective = project ? getProjectQuotaPerspective(state, project.id) : null;
  const enteredRate = (() => {
    try { return budget ? toRate(budget) : 0; } catch { return 0; }
  })();

  return (
    <Modal title={old ? '编辑月度分配草稿' : '新增月度分配'} subtitle="按月规划项目可分配额度，再在成员间按贡献比例分配（支持中途增加或退出成员，支持工作内容与快捷微调）" wide onClose={onClose}>
      <form onSubmit={e => {
        e.preventDefault();
        if (!project) return;
        if (planMembers.length === 0) {
          alert('请至少保留一名当月参与分配的成员');
          return;
        }
        onSave({
          id: old?.id,
          projectId,
          month,
          budget: toRate(budget),
          entries: planMembers.map(employeeId => ({
            employeeId,
            rate: toRate(rates[employeeId] || '0'),
            workContent: workContents[employeeId]?.trim() || '',
          })),
          note
        });
      }}>
        <div className="form-grid two">
          <Field label="项目">
            <select disabled={!!old} value={projectId} onChange={e => setProjectId(e.target.value)}>
              {state.projects.filter(p => p.status === 'active').map(p => (
                <option value={p.id} key={p.id}>{p.code} · {p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="分配月份">
            <input type="month" value={month} min={project?.start} max={project?.end} onChange={e => setMonth(e.target.value)} required />
          </Field>
          <Field
            label="本月额度占合同总额比例"
            hint={project ? (
              (project.historyCompletedRate || 0) > 0 ? (
                `历史已完成 ${pct(project.historyCompletedRate || 0)} (${wan(project.historyCompletedAmount || 0)}万)，其他月已配 ${pct(otherMonthsBudget)}，本月最多还可配 ${pct(Math.max(0, 10000 - (project.historyCompletedRate || 0) - otherMonthsBudget))}`
              ) : (
                `已配置 ${pct(otherMonthsBudget)}，最多还可配置 ${pct(10000 - otherMonthsBudget)}`
              )
            ) : ''}
          >
            <div
              className="suffix-input"
              onClick={e => {
                const input = e.currentTarget.querySelector('input');
                if (input && document.activeElement !== input) input.focus();
              }}
            >
              <input
                type="text"
                inputMode="decimal"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="例如 33.33"
                required
              />
              <span>%</span>
            </div>
          </Field>
          <Field label="本月可分配额度（折合）">
            <div style={{ height: 38, background: '#ecfdf5', borderRadius: 8, padding: '8px 12px', fontWeight: 700, color: '#166534', fontSize: '14px' }}>
              {wan(preview)} 万元
            </div>
          </Field>
        </div>

        {/* 全周期额度规划联动与防前期透支监控 */}
        {project && (
          <div style={{
            marginTop: '12px',
            marginBottom: '4px',
            background: currentMonthQuota ? '#f0f9ff' : '#fffbeb',
            border: `1px solid ${currentMonthQuota ? '#bae6fd' : '#fde68a'}`,
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: currentMonthQuota ? '#0369a1' : '#92400e' }}>
                <CalendarRange size={15} />
                <span>全周期额度规划透视 · {month}</span>
                {currentMonthQuota ? (
                  <Badge tone="blue">已排期节点</Badge>
                ) : project.quotaSchedule && project.quotaSchedule.length > 0 ? (
                  <Badge tone="amber">未在排期中</Badge>
                ) : (
                  <Badge tone="neutral">尚未制定规划</Badge>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {currentMonthQuota && (
                  <button
                    type="button"
                    style={{
                      border: '1px solid #0284c7',
                      background: '#0284c7',
                      color: '#fff',
                      borderRadius: '5px',
                      padding: '3px 9px',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onClick={() => {
                      setBudget((currentMonthQuota.rate / 100).toFixed(2).replace(/\.00$/, ''));
                      setPlanNotice(`⚡ 已自动套用【${month}】规划额度：${pct(currentMonthQuota.rate)} (${currentMonthQuota.milestone || '本期节点'})`);
                    }}
                    title="将本月规划的比例快速填入上方输入框"
                  >
                    ⚡ 一键套用规划额度 ({pct(currentMonthQuota.rate)})
                  </button>
                )}
                {onOpenQuotaSchedule && (
                  <button
                    type="button"
                    style={{
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      color: '#475569',
                      borderRadius: '5px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onClick={() => onOpenQuotaSchedule(projectId)}
                  >
                    📅 查看/调整全周期规划
                  </button>
                )}
              </div>
            </div>

            {currentMonthQuota ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#334155' }}>
                  <span>本月规划额度：<b style={{ color: '#0369a1' }}>{pct(currentMonthQuota.rate)}</b> ({wan(Math.round(project.contract * currentMonthQuota.rate / 10000))} 万元)</span>
                  <span>阶段节点：<b style={{ color: '#1e293b' }}>{currentMonthQuota.milestone || '未指定'}</b></span>
                  {currentMonthQuota.note && <span>说明：<span style={{ color: '#64748b' }}>{currentMonthQuota.note}</span></span>}
                  {quotaPerspective && (
                    <span>后期交付储备金：<b style={{ color: quotaPerspective.deliveryStageReserveRate >= 3500 ? '#166534' : '#b45309' }}>{wan(quotaPerspective.deliveryStageReserveAmount)} 万元 ({pct(quotaPerspective.deliveryStageReserveRate)})</b></span>
                  )}
                </div>

                {/* 偏离规划预警 & 提示 */}
                {enteredRate > currentMonthQuota.rate ? (
                  <div style={{
                    marginTop: '4px',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    color: '#92400e',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px'
                  }}>
                    <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div>
                      <strong>⚠️ 超出本月规划预警：</strong>
                      当前填写的比例 ({pct(enteredRate)}) 高于规划 ({pct(currentMonthQuota.rate)})，多支出 <b>{pct(enteredRate - currentMonthQuota.rate)}</b>（约 {wan(Math.round(project.contract * (enteredRate - currentMonthQuota.rate) / 10000))} 万元）。
                      <span style={{ display: 'block', color: '#b45309', marginTop: '2px' }}>
                        💡 掌握全周期节奏提醒：请确保为后续成品发货、试验交付预留充足额度，防范前期把钱分完导致后续有货无钱可分！
                      </span>
                    </div>
                  </div>
                ) : enteredRate > 0 && enteredRate < currentMonthQuota.rate ? (
                  <div style={{
                    marginTop: '4px',
                    background: '#e0f2fe',
                    border: '1px solid #bae6fd',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    color: '#0369a1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Info size={14} style={{ flexShrink: 0 }} />
                    <span>
                      当前录入比例比规划节余 <b>{pct(currentMonthQuota.rate - enteredRate)}</b>，节余额度将自动沉淀为后续发货交付阶段的激励储备。
                    </span>
                  </div>
                ) : enteredRate === currentMonthQuota.rate && enteredRate > 0 ? (
                  <div style={{
                    marginTop: '4px',
                    background: '#dcfce7',
                    border: '1px solid #bbf7d0',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Check size={14} style={{ flexShrink: 0 }} />
                    <span>
                      当前录入额度与全周期月度额度规划精准吻合，执行节奏稳健。
                    </span>
                  </div>
                ) : null}
              </div>
            ) : project.quotaSchedule && project.quotaSchedule.length > 0 ? (
              <div style={{ color: '#9a3412', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>
                  当前月份【{month}】未在项目的全周期规划排期中（当前已规划周期包含 {project.quotaSchedule.length} 个月份）。请确认是否为跨周期追加或点击“查看/调整全周期规划”更新排期。
                </span>
              </div>
            ) : (
              <div style={{ color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>
                  该项目尚未制定全周期额度规划。建议项目负责人预先在【项目看板 → 额度规划】做好月度计划与交付物节点排期，避免前期把钱分完、后期有货无钱的被动局面。
                </span>
              </div>
            )}

            {/* 前期透支风险强警报 */}
            {quotaPerspective?.isFrontLoadedRisk && (
              <div style={{
                marginTop: '6px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                padding: '6px 10px',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px'
              }}>
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <strong>⚠️ 前期透支高危风险预警：</strong>
                  该项目前期已累计分配或规划较多额度，预估后期交付期储备金仅剩 <b>{wan(quotaPerspective.deliveryStageReserveAmount)} 万元 ({pct(quotaPerspective.deliveryStageReserveRate)})</b>（低于 35% 安全线）。请严格把控本月分配，优先保障后期发货交付成果！
                </div>
              </div>
            )}
          </div>
        )}

        {/* 成员当月分配比例配置与工作内容 */}
        {project && (
          <div className="allocation-box" style={{ marginTop: '14px' }}>
            {/* 标签导航：分离比例设置与工作内容专区 */}
            <div className="modal-nav-tabs">
              <button
                type="button"
                className={`modal-tab-btn ${activeTab === 'rates' ? 'active' : ''}`}
                onClick={() => setActiveTab('rates')}
              >
                <Sliders size={14} /> 成员分配比例配置 ({planMembers.length}人 · {pct(memberTotal)})
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${activeTab === 'work' ? 'active' : ''}`}
                onClick={() => setActiveTab('work')}
              >
                <FileText size={14} /> 当月工作内容描述 (已填 {planMembers.filter(id => workContents[id]?.trim()).length}/{planMembers.length}人)
              </button>
            </div>

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', padding: '0 14px 10px' }}>
              <div>
                <b style={{ fontSize: '13px', color: '#1e293b' }}>
                  {activeTab === 'rates' ? '成员比例设置表' : '当月各成员工作任务与交付成果描述'}
                </b>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                  全部成员比例合计必须精确等于 100% · 支持增加成员到本月或退出成员
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select
                  value=""
                  onChange={e => {
                    if (e.target.value) handleAddMember(e.target.value);
                  }}
                  style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                >
                  <option value="">➕ 增加成员到本月...</option>
                  {state.employees.filter(e => e.active && !planMembers.includes(e.id)).map(e => (
                    <option key={e.id} value={e.id}>{e.name} · {e.department} ({e.group || '未分组'})</option>
                  ))}
                </select>
                <strong style={{ color: memberTotal === 10000 ? '#15803d' : '#b91c1c', fontSize: '13.5px', minWidth: '95px', textAlign: 'right' }}>
                  {pct(memberTotal)} / 100%
                </strong>
              </div>
            </header>

            {planNotice && (
              <div style={{ background: '#f0fdf4', borderBottom: '1px solid #86efac', padding: '6px 14px', fontSize: '11.5px', color: '#166534', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{planNotice}</span>
                <button type="button" className="icon-button" style={{ width: 18, height: 18 }} onClick={() => setPlanNotice('')}><X size={12} /></button>
              </div>
            )}

            {activeTab === 'rates' ? (
              <>
                {/* 快捷比例分配、常用模版与表格行高调节工具栏 */}
                <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '8px 14px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569' }}>快捷分配：</span>
                    <button
                      type="button"
                      style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '5px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}
                      onClick={handleEqualShare}
                      title="全员平分 100% 比例"
                    >
                      ⚖️ 全员平分 100%
                    </button>
                    <button
                      type="button"
                      style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '5px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}
                      onClick={handleDistributeRemaining}
                      title="将剩余未配比例全部补齐至项目负责人"
                    >
                      🎯 补齐剩余比例
                    </button>
                    <button
                      type="button"
                      style={{ border: '1px solid #f1f5f9', background: '#fff', borderRadius: '5px', padding: '3px 8px', fontSize: '11px', color: '#64748b', cursor: 'pointer' }}
                      onClick={handleResetRates}
                      title="重置清空全部成员分配比例"
                    >
                      🔄 一键清零
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {/* 表格行高调节控件 */}
                    <div className="row-height-control">
                      <span style={{ fontSize: '11px', color: '#64748b', marginRight: '2px' }}>行高:</span>
                      <button
                        type="button"
                        className={`row-height-btn ${rowHeight === 36 ? 'active' : ''}`}
                        onClick={() => setRowHeight(36)}
                        title="紧凑行高 (36px)"
                      >
                        紧凑
                      </button>
                      <button
                        type="button"
                        className={`row-height-btn ${rowHeight === 44 ? 'active' : ''}`}
                        onClick={() => setRowHeight(44)}
                        title="标准行高 (44px)"
                      >
                        标准
                      </button>
                      <button
                        type="button"
                        className={`row-height-btn ${rowHeight === 56 ? 'active' : ''}`}
                        onClick={() => setRowHeight(56)}
                        title="宽松行高 (56px)"
                      >
                        宽松
                      </button>
                    </div>

                    {commonGroupOptions.length > 0 && (
                      <select
                        value=""
                        onChange={e => {
                          if (e.target.value) handleApplyCommonGroup(e.target.value);
                        }}
                        style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '5px', border: '1px solid #cbd5e1', background: '#fff' }}
                      >
                        <option value="">📁 套用项目组(含比例)...</option>
                        {commonGroupOptions.map(cg => (
                          <option key={cg.id} value={cg.id}>
                            {cg.type === '技术交流组' ? '💡' : cg.type === '任务攻坚组' ? '🚀' : '📁'} {cg.name} ({cg.memberIds.length}人)
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      className="secondary"
                      style={{ padding: '3px 8px', fontSize: '11px', gap: '3px' }}
                      onClick={handleSaveAsCommonGroup}
                      title="将当前成员及其比例和工作内容保存为项目组模版"
                    >
                      <Save size={12} /> 存为模版
                    </button>
                  </div>
                </div>

                {/* 表头布局（支持表格拖拽调节列宽，无拖拽换位把手） */}
                <div className="allocation-table-header-v3" style={{ gridTemplateColumns: gridColsStyle }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '0 8px', fontWeight: 600 }}>
                    <span>序号 / 成员与专业组 (共 {planMembers.length} 人)</span>
                    <div
                      className="col-resize-handle"
                      title="按住左右拖动调节此列宽度"
                      onMouseDown={e => handleColResizeMouseDown('member', e)}
                    />
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', fontWeight: 600 }}>
                    <span>分配比例 (%)</span>
                    <div
                      className="col-resize-handle"
                      title="按住左右拖动调节此列宽度"
                      onMouseDown={e => handleColResizeMouseDown('rate', e)}
                    />
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 8px', fontWeight: 600 }}>
                    <span>当月折合额度 (万元)</span>
                    <div
                      className="col-resize-handle"
                      title="按住左右拖动调节此列宽度"
                      onMouseDown={e => handleColResizeMouseDown('amount', e)}
                    />
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', fontWeight: 600 }}>
                    <span>工作内容描述</span>
                    <div
                      className="col-resize-handle"
                      title="按住左右拖动调节此列宽度"
                      onMouseDown={e => handleColResizeMouseDown('work', e)}
                    />
                  </div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 8px', fontWeight: 600 }}>
                    <span>操作</span>
                    <div
                      className="col-resize-handle"
                      title="按住左右拖动调节此列宽度"
                      onMouseDown={e => handleColResizeMouseDown('action', e)}
                    />
                  </div>
                </div>

                <div style={{ maxHeight: 290, overflowY: 'auto' }}>
                  {planMembers.map((empId, idx) => {
                    const emp = state.employees.find(e => e.id === empId);
                    const r = (() => { try { return toRate(rates[empId] || '0'); } catch { return 0; } })();
                    const isOwner = empId === project.owner;
                    const hasWork = !!workContents[empId]?.trim();
                    return (
                      <div
                        className="allocation-row-v3"
                        key={empId}
                        style={{ gridTemplateColumns: gridColsStyle, minHeight: `${rowHeight}px`, height: `${rowHeight}px` }}
                      >
                        {/* 成员信息列 */}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0 8px', overflow: 'hidden' }}>
                          <span className={`drag-rank-badge ${isOwner ? 'top-leader' : ''}`} title={isOwner ? '组长/项目负责人（置顶）' : `第 ${idx + 1} 位`}>
                            {isOwner ? '👑' : `${idx + 1}`}
                          </span>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <b style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <span>{emp?.name || empId}</span>
                              {isOwner && <span title="项目负责人" style={{ fontSize: 10 }}>👑</span>}
                              <GroupTag group={emp?.group} />
                            </b>
                            <small style={{ display: 'block', color: '#64748b', fontSize: '11px', marginTop: '-2px' }}>
                              {emp?.department}{isOwner ? ' · 负责人' : ''}
                            </small>
                          </div>
                        </span>

                        {/* 分配比例输入列 */}
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 4px' }}>
                          <div
                            className="suffix-input"
                            style={{ width: 100, height: Math.min(32, rowHeight - 6) }}
                            onClick={e => {
                              const input = e.currentTarget.querySelector('input');
                              if (input && document.activeElement !== input) input.focus();
                            }}
                          >
                            <input
                              type="text"
                              inputMode="decimal"
                              value={rates[empId] !== undefined ? rates[empId] : ''}
                              onChange={e => setRates(c => ({ ...c, [empId]: e.target.value }))}
                              onBlur={() => {
                                setPlanMembers(prev => autoSortMembersByRate(prev, rates));
                              }}
                              placeholder="0.00"
                              style={{ textAlign: 'right', fontWeight: 600, fontSize: '12.5px', padding: '2px 4px' }}
                            />
                            <span style={{ padding: '0 4px', fontSize: '11px' }}>%</span>
                          </div>
                        </div>

                        {/* 折合额度列 */}
                        <strong style={{ color: r > 0 ? '#166534' : '#94a3b8', fontSize: '12.5px', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 8px' }}>
                          {preview ? score(Math.round(preview * r / 10000)) : '0'} 万元
                        </strong>

                        {/* 工作内容专区跳转列 */}
                        <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="text-button"
                            style={{
                              fontSize: '11px',
                              color: hasWork ? '#166534' : '#64748b',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                            onClick={() => setActiveTab('work')}
                            title={workContents[empId] || '点击进入工作内容专区填写'}
                          >
                            <FileText size={12} />
                            {hasWork ? '已填写描述' : '填写描述'}
                          </button>
                        </div>

                        {/* 操作移除列 */}
                        <div style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="btn-remove-member"
                            title="移出本月分配"
                            onClick={() => handleRemoveMember(empId)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {planMembers.length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                      当前月份暂无参与成员，请点击右上角“➕ 增加成员到本月”添加
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* 需求2：当月工作内容描述独立工作区 */
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#475569' }}>
                      💡 支持在线填写各成员当月具体工作内容，或通过标准 CSV 批量导入：
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="file"
                      ref={planCsvFileRef}
                      accept=".csv"
                      style={{ display: 'none' }}
                      onChange={handlePlanCsvUpload}
                    />
                    <button
                      type="button"
                      className="secondary"
                      style={{ padding: '3px 8px', fontSize: '11px', gap: '3px' }}
                      onClick={() => planCsvFileRef.current?.click()}
                      title="通过 CSV 批量导入成员分配比例与当月工作内容描述"
                    >
                      <Upload size={12} /> 导入当月 CSV
                    </button>
                    <button
                      type="button"
                      className="text-button"
                      style={{ fontSize: '11px', color: '#166534', padding: '0 4px' }}
                      onClick={() => triggerDownload(getPlanMemberTemplateCsv(), '月度分配与工作内容导入模板.csv')}
                      title="下载月度分配与工作内容标准导入模板"
                    >
                      <Download size={12} /> 模板
                    </button>
                  </div>
                </div>

                <div style={{ maxHeight: 290, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {planMembers.map(empId => {
                    const emp = state.employees.find(e => e.id === empId);
                    const isOwner = empId === project.owner;
                    const r = (() => { try { return toRate(rates[empId] || '0'); } catch { return 0; } })();
                    return (
                      <div key={empId} className="work-item-modal-card">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <b style={{ fontSize: '13px', color: '#1e293b' }}>
                              {emp?.name || empId}
                            </b>
                            {isOwner && <span title="项目负责人" style={{ fontSize: '11px' }}>👑 负责人</span>}
                            <GroupTag group={emp?.group} />
                            <small style={{ color: '#64748b' }}>{emp?.department}</small>
                          </div>
                          <div style={{ fontSize: '12px', color: '#475569' }}>
                            分配比例：<b style={{ color: r > 0 ? '#166534' : '#64748b' }}>{rates[empId] || '0'}%</b>
                            {preview > 0 && (
                              <span> · 当月额度：<b style={{ color: '#166534' }}>{score(Math.round(preview * r / 10000))} 万元</b></span>
                            )}
                          </div>
                        </div>
                        <textarea
                          className="work-content-modal-textarea"
                          rows={2}
                          value={workContents[empId] || ''}
                          onChange={e => setWorkContents(c => ({ ...c, [empId]: e.target.value }))}
                          placeholder={`请输入 ${emp?.name || empId} 当月工作内容描述（如架构设计、接口开发、阶段交付论证等）...`}
                        />
                      </div>
                    );
                  })}
                  {planMembers.length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                      当前暂无参与成员，请切回“成员分配比例配置”添加成员
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <Field label="分配说明（选填）">
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="记录本月关键交付成果或分配依据..." />
        </Field>

        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>取消</button>
          <button className="primary"><Save size={15} />保存草稿</button>
        </div>

        {quickSaveOpen && (
          <SaveGroupQuickModal
            isOpen={quickSaveOpen}
            initialName={project ? `${project.name} 月度分配模版` : '常用项目组模版'}
            initialType="项目组"
            initialLeader={project?.owner}
            memberIds={planMembers}
            employees={state.employees}
            onClose={() => setQuickSaveOpen(false)}
            onSave={handleConfirmSaveGroupFromPlan}
          />
        )}
      </form>
    </Modal>
  );
}

function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <div style={{ fontSize: '24px' }}>○</div>
      <p>{text}</p>
    </div>
  );
}

// -------------------------------------------------------------
// 需求2 Modal: Login & Role Permission Switcher
// -------------------------------------------------------------
function AuthModal({ state, currentActorId, onClose, onUpdateAdmin, onSelectActor, onUpdateEmployeeRole }: {
  state: State;
  currentActorId: string;
  onClose(): void;
  onUpdateAdmin(targetEmpId: string, action: 'setAdmin' | 'transferAdmin' | 'removeAdmin', switchActive?: boolean): Promise<void>;
  onSelectActor(actorId: string): void;
  onUpdateEmployeeRole?(emp: Employee, newRole: 'admin' | 'auditor' | 'member'): Promise<void>;
}) {
  const [roleTab, setRoleTab] = useState<'admin' | 'auditor' | 'manager' | 'member'>('admin');
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [selectedTargetId, setSelectedTargetId] = useState<string>(() => {
    return state.employees.find(e => e.role !== 'admin' && e.active)?.id || state.employees[0]?.id || '';
  });
  const [busy, setBusy] = useState(false);

  const currentEmp = state.employees.find(e => e.id === currentActorId);

  // 分类人员
  const adminUsers = state.employees.filter(e => e.role === 'admin' && e.active);
  const auditorUsers = state.employees.filter(e => e.role === 'auditor' && e.active);
  const managerUsers = state.employees.filter(e => state.projects.some(p => p.owner === e.id) && e.active);
  const allMembers = state.employees.filter(e => e.active);

  const filteredMembers = allMembers.filter(e => {
    if (groupFilter !== 'all' && !(e.group && e.group.includes(groupFilter))) return false;
    if (search && !(e.name + (e.position || '') + e.department + (e.group || '')).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Modal
      title="修改系统管理员 / 身份切换"
      subtitle="指定部门成员为系统管理员、移交管理员权限，或快速切换当前操作账号"
      wide
      onClose={onClose}
    >
      <div className="modal-body" style={{ padding: '0 20px 20px' }}>
        {/* 当前登录身份卡片 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 18px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className={`user-avatar-circle ${currentEmp?.role === 'admin' ? 'admin' : state.projects.some(p => p.owner === currentEmp?.id) ? 'manager' : 'member'}`} style={{ width: 36, height: 36, fontSize: 14 }}>
              {currentEmp?.name.slice(0, 1) || '管'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <b style={{ fontSize: '14px', color: '#0f172a' }}>{currentEmp?.name || '管理员'}</b>
                <span className={`role-badge ${currentEmp?.role === 'admin' ? 'admin' : state.projects.some(p => p.owner === currentEmp?.id) ? 'manager' : 'member'}`}>
                  {currentEmp?.role === 'admin' ? '👑 系统管理员' : state.projects.some(p => p.owner === currentEmp?.id) ? '💼 项目负责人' : '👤 专业组成员'}
                </span>
              </div>
              <small style={{ color: '#64748b', fontSize: '11.5px' }}>
                {currentEmp?.department || '系统综合部'}{currentEmp?.group ? ` · ${currentEmp?.group}` : ''}
              </small>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#166534', fontWeight: 500 }}>
            ● 当前在线会话
          </div>
        </div>

        {/* 角色权限说明栏 */}
        <div className="filter-tabs" style={{ marginBottom: '16px' }}>
          <button className={roleTab === 'admin' ? 'active' : ''} onClick={() => setRoleTab('admin')}>
            👑 系统管理员设置 ({adminUsers.length})
          </button>
          <button className={roleTab === 'auditor' ? 'active' : ''} onClick={() => setRoleTab('auditor')}>
            📊 绩效核算员设置 ({auditorUsers.length})
          </button>
          <button className={roleTab === 'manager' ? 'active' : ''} onClick={() => setRoleTab('manager')}>
            💼 项目负责人视图 ({managerUsers.length})
          </button>
          <button className={roleTab === 'member' ? 'active' : ''} onClick={() => setRoleTab('member')}>
            👤 专业组成员视图 ({allMembers.length})
          </button>
        </div>

        {/* 管理员设置与权限面板 */}
        {/* 绩效核算员设置面板 */}
        {roleTab === 'auditor' && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Calculator size={18} color="#15803d" />
                <strong style={{ fontSize: '14.5px', color: '#166534' }}>委任 / 增设绩效核算员</strong>
                <span style={{ fontSize: '11.5px', color: '#64748b', marginLeft: 'auto' }}>
                  核算员拥有全项目全员绩点汇总与各项目数据包导入权限
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr auto', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                <select
                  value={selectedTargetId}
                  onChange={e => setSelectedTargetId(e.target.value)}
                  style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '13px', background: '#fff' }}
                >
                  {allMembers.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.position || '员工'} · {emp.department}{emp.group ? ` · ${emp.group}` : ''}{emp.role === 'admin' ? ' [管理员]' : emp.role === 'auditor' ? ' [核算员]' : ''})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="primary"
                  style={{ height: '38px', padding: '0 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', background: '#059669', borderColor: '#047857' }}
                  onClick={async () => {
                    const emp = state.employees.find(e => e.id === selectedTargetId);
                    if (emp) {
                      if (onUpdateEmployeeRole) {
                        await onUpdateEmployeeRole(emp, 'auditor');
                      }
                      onSelectActor(emp.id);
                      onClose();
                    }
                  }}
                  title="设为绩效核算员并切换"
                >
                  <ShieldCheck size={14} />设为核算员并切换
                </button>
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px 18px' }}>
              <strong style={{ fontSize: '14px', color: '#065f46', display: 'block', marginBottom: '10px' }}>
                📊 当前在职绩效核算员 ({auditorUsers.length} 人)
              </strong>
              {auditorUsers.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: '13px', padding: '12px', textAlign: 'center' }}>
                  暂未专门设置核算员（系统管理员默认具备全部核算员权限）
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {auditorUsers.map(aud => (
                    <div
                      key={aud.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="user-avatar-circle auditor">{aud.name.slice(0, 1)}</div>
                        <div>
                          <b style={{ fontSize: '13.5px', color: '#0f172a' }}>{aud.name}</b>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                            {aud.position || '绩效核算员'} · {aud.department} · {aud.group || '全域'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="secondary"
                          style={{ fontSize: '12px', padding: '4px 10px' }}
                          onClick={() => {
                            onSelectActor(aud.id);
                            onClose();
                          }}
                        >
                          切换以此身份操作
                        </button>
                        <button
                          type="button"
                          className="secondary"
                          style={{ fontSize: '12px', padding: '4px 10px', color: '#dc2626' }}
                          onClick={async () => {
                            if (confirm(`确定撤销【${aud.name}】的核算员权限吗？`)) {
                              if (onUpdateEmployeeRole) {
                                await onUpdateEmployeeRole(aud, 'member');
                              }
                            }
                          }}
                        >
                          撤销核算员
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {roleTab === 'admin' && (
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* 核心功能：修改/变更系统管理员 */}
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Crown size={18} color="#15803d" />
                <strong style={{ fontSize: '14.5px', color: '#166534' }}>修改 / 变更系统管理员</strong>
                <span style={{ fontSize: '11.5px', color: '#64748b', marginLeft: 'auto' }}>
                  从全部在职员工中选择并设定系统管理员
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr auto auto', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                <select
                  value={selectedTargetId}
                  onChange={e => setSelectedTargetId(e.target.value)}
                  style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 10px', fontSize: '13px', background: '#fff' }}
                >
                  {allMembers.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.position || '员工'} · {emp.department}{emp.group ? ` · ${emp.group}` : ''}) {emp.role === 'admin' ? ' [已是管理员]' : ''}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="primary"
                  disabled={busy || !selectedTargetId}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await onUpdateAdmin(selectedTargetId, 'transferAdmin', true);
                      onClose();
                    } finally {
                      setBusy(false);
                    }
                  }}
                  title="将管理员权限变更为所选人员，并自动将当前操作身份切换为此人"
                  style={{ background: '#15803d', height: '38px', padding: '0 14px', fontSize: '12.5px', whiteSpace: 'nowrap' }}
                >
                  <Crown size={14} />设为管理员并切换
                </button>

                <button
                  type="button"
                  className="secondary"
                  disabled={busy || !selectedTargetId}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await onUpdateAdmin(selectedTargetId, 'setAdmin', false);
                    } finally {
                      setBusy(false);
                    }
                  }}
                  title="保留当前管理员，同时将所选人员也增设为系统管理员"
                  style={{ height: '38px', padding: '0 12px', fontSize: '12.5px', whiteSpace: 'nowrap' }}
                >
                  <ShieldCheck size={14} />增设为管理员
                </button>
              </div>
              <small style={{ color: '#166534', fontSize: '11px', marginTop: '8px', display: 'block' }}>
                💡 提示：点击“设为管理员并切换”后，顶部栏将立即变为新管理员头像与姓名（如任海平、陈韬等），拥有全部管理与灾备恢复权限。
              </small>
            </div>

            {/* 当前系统管理员列表与操作 */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
                <ShieldCheck size={20} color="#b45309" />
                <div>
                  <strong style={{ fontSize: '14px', color: '#92400e', display: 'block' }}>👑 当前系统管理员权限名单 ({adminUsers.length} 人)</strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    拥有最高业务权限：新建/编辑/批量删除项目、增删员工、月度分配终审与发布、全量系统灾备备份与还原。
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '8px' }}>
                {adminUsers.map(adm => {
                  const isCur = adm.id === currentActorId;
                  return (
                    <div
                      key={adm.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: isCur ? '#f0fdf4' : '#f8fafc',
                        border: isCur ? '1px solid #86efac' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="user-avatar-circle admin" style={{ width: 30, height: 30, fontSize: 12 }}>
                          {adm.name.slice(0, 1)}
                        </div>
                        <div>
                          <b style={{ fontSize: '13px', color: '#1e293b' }}>{adm.name}</b>
                          <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>
                            {adm.position || '系统管理员'} · {adm.department}
                          </span>
                          {isCur && (
                            <span style={{ fontSize: '11px', color: '#15803d', marginLeft: '8px', fontWeight: 600 }}>
                              (当前在线操作)
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {!isCur && (
                          <button
                            type="button"
                            className="secondary"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => { onSelectActor(adm.id); onClose(); }}
                          >
                            切换为此账号
                          </button>
                        )}
                        {adminUsers.length > 1 && (
                          <button
                            type="button"
                            className="text-button"
                            style={{ fontSize: '12px', color: '#ef4444' }}
                            onClick={async () => {
                              if (confirm(`确定要撤销【${adm.name}】的系统管理员权限，降为普通成员吗？`)) {
                                await onUpdateAdmin(adm.id, 'removeAdmin', isCur);
                              }
                            }}
                          >
                            降为普通成员
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 项目负责人切换面板 */}
        {roleTab === 'manager' && (
          <div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '12.5px', color: '#166534' }}>
              💼 <b>项目负责人专属权限：</b>可对自身负责的项目进行月度分配额度规划、调整团队成员分配比例、查看该项目实时额度监控与分润明细。
            </div>
            <div className="login-user-grid">
              {managerUsers.map(mgr => {
                const ownedPrjs = state.projects.filter(p => p.owner === mgr.id);
                const isCur = mgr.id === currentActorId;
                return (
                  <div
                    key={mgr.id}
                    className={`login-user-card ${isCur ? 'current' : ''}`}
                    onClick={() => onSelectActor(mgr.id)}
                  >
                    <div className="user-avatar-circle manager">
                      {mgr.name.slice(0, 1)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <b style={{ fontSize: '13.5px', color: '#0f172a' }}>{mgr.name}</b>
                        {isCur && <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>当前使用</span>}
                      </div>
                      <small style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>
                        {mgr.department} · {mgr.position || '负责人'}
                      </small>
                      <div style={{ fontSize: '11px', color: '#166534', marginTop: '4px', fontWeight: 500 }}>
                        负责 {ownedPrjs.length} 个项目: {ownedPrjs.map(p => p.name).slice(0, 2).join('、')}{ownedPrjs.length > 2 ? '等' : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 专业组成员切换面板 */}
        {roleTab === 'member' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '10px', flexWrap: 'wrap' }}>
              <div className="filter-tabs">
                <button className={groupFilter === 'all' ? 'active' : ''} onClick={() => setGroupFilter('all')}>
                  全部专业组 ({allMembers.length})
                </button>
                {DEFAULT_GROUPS.map(g => (
                  <button key={g} className={groupFilter === g ? 'active' : ''} onClick={() => setGroupFilter(g)}>
                    {g} ({allMembers.filter(e => e.group && e.group.includes(g)).length})
                  </button>
                ))}
              </div>
              <div className="search-input-wrapper" style={{ minWidth: 220 }}>
                <Search size={14} color="#82928a" />
                <input placeholder="搜索成员姓名、职务..." value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button className="icon-button" style={{ width: 18, height: 18 }} onClick={() => setSearch('')}><X size={11} /></button>}
              </div>
            </div>

            <div className="login-user-grid">
              {filteredMembers.map(emp => {
                const isCur = emp.id === currentActorId;
                const isMgr = state.projects.some(p => p.owner === emp.id);
                return (
                  <div
                    key={emp.id}
                    className={`login-user-card ${isCur ? 'current' : ''}`}
                    onClick={() => onSelectActor(emp.id)}
                  >
                    <div className={`user-avatar-circle ${emp.role === 'admin' ? 'admin' : isMgr ? 'manager' : 'member'}`}>
                      {emp.name.slice(0, 1)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <b style={{ fontSize: '13px', color: '#0f172a' }}>{emp.name}</b>
                        {isCur && <span style={{ fontSize: '11px', color: '#15803d', fontWeight: 600 }}>当前</span>}
                      </div>
                      <small style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>
                        {emp.position || '组员'} · {emp.department}
                      </small>
                      <div style={{ marginTop: '3px' }}>
                        <GroupTag group={emp.group} />
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredMembers.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '12.5px' }}>
                  未找到符合条件的成员
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="modal-actions" style={{ padding: '16px 26px', borderTop: '1px solid #f1f5f9' }}>
        <button type="button" className="secondary" onClick={onClose}>关闭</button>
      </div>
    </Modal>
  );
}

