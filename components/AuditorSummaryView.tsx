'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Calculator,
  Download,
  Upload,
  FileSpreadsheet,
  Layers,
  FolderOpen,
  Users,
  BriefcaseBusiness,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Eye,
  Trash2,
  Table2,
  Lock,
  ShieldCheck,
  ChevronRight,
  Info,
  X,
  Package,
  CalendarRange,
  Award,
  Crown,
  Medal,
  Star,
  Flame,
  Check,
  Building2,
  PieChart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  Pie,
} from 'recharts';
import {
  type State,
  type Employee,
  type ProjectMeritPackage,
  type AuditorSummaryResult,
  type DepartmentContractSummary,
  type HonorStarsResult,
  type HonorStar,
  score,
  wan,
  pct,
  parseProjectMeritPackage,
  parseMeritPackageOrBundle,
  summarizeAuditorPackages,
  summarizeCurrentStateForAuditor,
  calculateDepartmentContracts,
  calculateHonorStars,
  exportAuditorEmployeesCsv,
  exportAuditorProjectsCsv,
  exportAuditorMatrixCsv,
  exportAuditorDetailsCsv,
  exportAuditorFullBundleJson,
} from '../lib/core';

const formatWan6 = (val: number | null | undefined): string =>
  val == null || isNaN(val) ? '0' : Number(Number(val).toFixed(6)).toLocaleString('zh-CN', { maximumFractionDigits: 6 });

interface AuditorSummaryViewProps {
  state: State;
  currentActor: Employee;
  isAdmin: boolean;
  isAuditor: boolean;
  packages?: ProjectMeritPackage[];
  onUpdatePackages?: (packages: ProjectMeritPackage[], message?: string) => void;
  activeSubTab?: AuditorTab;
  onSubTabChange?: (tab: AuditorTab) => void;
  hideTabBar?: boolean;
  onSwitchToAuditor?: () => void;
  triggerDownload: (content: string, filename: string, mimeType?: string) => Promise<void>;
  setNotice: (msg: string) => void;
}

export type AuditorTab = 'import' | 'employees' | 'contracts' | 'ranking' | 'stars' | 'matrix' | 'details';

export function AuditorSummaryView({
  state,
  currentActor,
  isAdmin,
  isAuditor,
  packages: externalPackages,
  onUpdatePackages,
  activeSubTab: externalActiveTab,
  onSubTabChange,
  hideTabBar = false,
  onSwitchToAuditor,
  triggerDownload,
  setNotice,
}: AuditorSummaryViewProps) {
  // 内部数据包状态（支持受控或非受控）
  const [internalPackages, setInternalPackages] = useState<ProjectMeritPackage[]>(() => {
    if (externalPackages !== undefined) return externalPackages;
    if (state.auditorPackages && Array.isArray(state.auditorPackages)) return state.auditorPackages;
    return [];
  });

  const packages = externalPackages !== undefined ? externalPackages : internalPackages;

  const updatePackages = (newPkgs: ProjectMeritPackage[], msg?: string) => {
    setInternalPackages(newPkgs);
    if (onUpdatePackages) {
      onUpdatePackages(newPkgs, msg);
    }
  };

  // 当前查看的主视图 Tab（受控或非受控）
  const [internalActiveTab, setInternalActiveTab] = useState<AuditorTab>('employees');
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = (tab: AuditorTab) => {
    setInternalActiveTab(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };

  // 筛选与搜索
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  // 荣誉之星分类: 'monthly' | 'quarterly' | 'annual'
  const [starCategory, setStarCategory] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  // 查看某位员工跨项目明细的弹窗
  const [inspectEmployee, setInspectEmployee] = useState<AuditorSummaryResult['employeeSummaries'][0] | null>(null);
  // 查看某个数据包详情的弹窗
  const [inspectPackage, setInspectPackage] = useState<ProjectMeritPackage | null>(null);
  // 是否正在拖拽文件
  const [isDragging, setIsDragging] = useState(false);
  // 文件选择器引用
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化：仅在既没有外部包也没有持久化包且系统有已发布项目时，提供初次默认体验
  useEffect(() => {
    const hasExisting = (externalPackages && externalPackages.length > 0) || (state.auditorPackages && state.auditorPackages.length > 0);
    if (!hasExisting && packages.length === 0 && state && state.projects.length > 0 && state.plans.length > 0) {
      try {
        const initialSummary = summarizeCurrentStateForAuditor(state);
        if (initialSummary.projectSummaries.length > 0) {
          const initialPkgs: ProjectMeritPackage[] = [];
          for (const prj of state.projects) {
            const hasPublished = state.plans.some(p => p.projectId === prj.id && p.status === 'published');
            if (hasPublished) {
              try {
                const pkg = parseProjectMeritPackage(JSON.stringify({
                  version: '1.0',
                  packageType: 'project_merit_package',
                  generatedAt: new Date().toISOString(),
                  project: {
                    id: prj.id,
                    code: prj.code,
                    name: prj.name,
                    client: prj.client,
                    contract: prj.contract,
                    ownerId: prj.owner,
                    ownerName: (state?.employees || []).find(e => e.id === prj.owner)?.name || prj.owner,
                    contractWan: prj.contract / 1000000,
                  },
                  details: (state?.plans || [])
                    .filter(p => p.projectId === prj.id && p.status === 'published')
                    .flatMap(plan => plan.entries.map(e => ({
                      projectId: prj.id,
                      projectCode: prj.code,
                      projectName: prj.name,
                      month: plan.month,
                      employeeId: e.employeeId,
                      employeeName: (state?.employees || []).find(emp => emp.id === e.employeeId)?.name || e.employeeId,
                      rate: e.rate,
                      points: Math.round((prj.contract * plan.budget * e.rate) / 100000000),
                      wan: Number((((prj.contract * plan.budget * e.rate) / 100000000) / 1000000).toFixed(6)),
                      workContent: e.workContent,
                    }))),
                }));
                if (pkg.details.length > 0) initialPkgs.push(pkg);
              } catch {}
            }
          }
          if (initialPkgs.length > 0) {
            updatePackages(initialPkgs);
          }
        }
      } catch {}
    }
  }, [state]);

  // 当点击“一键载入当前系统全项目分配”
  const handleLoadSystemProjects = () => {
    try {
      if (!state) {
        setNotice('当前系统工作区尚未就绪。');
        return;
      }
      const summary = summarizeCurrentStateForAuditor(state);
      if (summary.projectSummaries.length === 0) {
        setNotice('当前系统中暂无已发布月度分配方案的项目。');
        return;
      }
      const employees = state?.employees || [];
      const plans = state?.plans || [];
      const initialPkgs: ProjectMeritPackage[] = [];
      for (const prj of state.projects || []) {
        const hasPublished = plans.some(p => p.projectId === prj.id && p.status === 'published');
        if (hasPublished) {
          const pkg = parseProjectMeritPackage(JSON.stringify({
            version: '1.0',
            packageType: 'project_merit_package',
            generatedAt: new Date().toISOString(),
            project: {
              id: prj.id,
              code: prj.code,
              name: prj.name,
              client: prj.client,
              contract: prj.contract,
              ownerId: prj.owner,
              ownerName: employees.find(e => e.id === prj.owner)?.name || prj.owner,
              contractWan: prj.contract / 1000000,
            },
            details: plans
              .filter(p => p.projectId === prj.id && p.status === 'published')
              .flatMap(plan => plan.entries.map(e => ({
                projectId: prj.id,
                projectCode: prj.code,
                projectName: prj.name,
                month: plan.month,
                employeeId: e.employeeId,
                employeeName: employees.find(emp => emp.id === e.employeeId)?.name || e.employeeId,
                rate: e.rate,
                points: Math.round((prj.contract * plan.budget * e.rate) / 100000000),
                wan: Number((((prj.contract * plan.budget * e.rate) / 100000000) / 1000000).toFixed(6)),
                workContent: e.workContent,
              }))),
          }));
          if (pkg.details.length > 0) initialPkgs.push(pkg);
        }
      }
      updatePackages(initialPkgs, `已成功读取并载入系统内的 ${initialPkgs.length} 个项目分配数据包！`);
      setNotice(`已成功读取并载入系统内的 ${initialPkgs.length} 个项目分配数据包！`);
    } catch (err: any) {
      setNotice(`载入系统项目失败: ${err.message || '未知错误'}`);
    }
  };

  // 支持单个数据包与项目负责人多项目合并包智能导入
  const handleImportFiles = async (files: FileList | null | File[]) => {
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
      packages.forEach(p => map.set(p.project.id, p));
      newPkgs.forEach(p => map.set(p.project.id, p));
      const merged = Array.from(map.values());
      const bundleHint = bundleCount > 0 ? `（含 ${bundleCount} 个多项目合并包）` : '';
      const msg = `✅ 成功导入 ${newPkgs.length} 个项目数据包${bundleHint}！已自动汇总并持久化保存。`;
      updatePackages(merged, msg);
      setNotice(msg);
    }

    if (errorCount > 0) {
      setNotice(`⚠️ 有 ${errorCount} 个文件格式不合规或损坏，未成功导入。`);
    }
  };

  // 移除指定项目数据包
  const handleRemovePackage = (projectId: string) => {
    const next = packages.filter(p => p.project.id !== projectId);
    updatePackages(next, '已移除该项目数据包');
    setNotice('已移除该项目数据包');
  };

  // 清空所有导入的数据包
  const handleClearAll = () => {
    updatePackages([], '已清空所有已导入的数据包');
    setNotice('已清空所有已导入的数据包');
  };

  const employees = state?.employees || [];

  // 核心汇总计算：全员跨项目绩点总和、额度对照、全景透视矩阵
  const summary: AuditorSummaryResult = useMemo(() => {
    return summarizeAuditorPackages(packages, employees);
  }, [packages, employees]);

  // 全部门合同额度大盘统计
  const deptContracts: DepartmentContractSummary = useMemo(() => {
    return calculateDepartmentContracts(summary);
  }, [summary]);

  // 荣誉之星（月度、季度、年度）
  const honorStars: HonorStarsResult = useMemo(() => {
    return calculateHonorStars(summary);
  }, [summary]);

  // 专业组选项
  const groupOptions = useMemo(() => {
    const set = new Set<string>();
    summary.employeeSummaries.forEach(e => {
      if (e.group) set.add(e.group);
    });
    return Array.from(set).sort();
  }, [summary]);

  // 过滤后的全员列表
  const filteredEmployees = useMemo(() => {
    return summary.employeeSummaries.filter(emp => {
      if (groupFilter !== 'all' && emp.group !== groupFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName = emp.name.toLowerCase().includes(q);
        const matchGroup = emp.group?.toLowerCase().includes(q);
        const matchPos = emp.position?.toLowerCase().includes(q);
        const matchDept = emp.department?.toLowerCase().includes(q);
        const matchPrj = emp.projects.some(p => p.projectName.toLowerCase().includes(q) || p.projectCode?.toLowerCase().includes(q));
        if (!matchName && !matchGroup && !matchPos && !matchDept && !matchPrj) return false;
      }
      return true;
    });
  }, [summary.employeeSummaries, search, groupFilter]);

  // 过滤后的项目额度对照列表
  const filteredProjects = useMemo(() => {
    return summary.projectSummaries.filter(p => {
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [summary.projectSummaries, search]);

  // 过滤后的明细流水
  const filteredDetails = useMemo(() => {
    return summary.allDetails.filter(d => {
      if (groupFilter !== 'all' && d.group !== groupFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          d.employeeName.toLowerCase().includes(q) ||
          d.projectName.toLowerCase().includes(q) ||
          d.projectCode.toLowerCase().includes(q) ||
          d.month.toLowerCase().includes(q) ||
          (d.workContent && d.workContent.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [summary.allDetails, search, groupFilter]);

  // 全员绩点排行榜（按总绩点降序）
  const rankingList = useMemo(() => {
    return [...summary.employeeSummaries].sort((a, b) => b.totalPoints - a.totalPoints);
  }, [summary.employeeSummaries]);

  // 部门人均基准线
  const avgPoints = summary.overview.avgPointsPerEmployee || 0;

  // 导出操作
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

  const handleExportFullBundleJson = async () => {
    const json = exportAuditorFullBundleJson(summary, packages);
    await triggerDownload(json, `衡绩_核算员全项目全员总包_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
    setNotice('核算汇总完整总包 JSON 导出成功');
  };

  // 权限检查守卫
  if (!isAuditor && !isAdmin) {
    return (
      <div style={{ padding: '40px 24px', maxWidth: '820px', margin: '40px auto', textAlign: 'center' }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #fee2e2',
            padding: '48px 32px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: '#fef2f2',
              color: '#dc2626',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Lock size={32} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#991b1b', marginBottom: '12px' }}>
            核算员专属权限保护
          </h2>
          <p style={{ color: '#4b5563', fontSize: '14.5px', lineHeight: 1.6, maxWidth: '560px', margin: '0 auto 24px' }}>
            当前操作者 <strong>{currentActor.name}</strong> 的角色为普通成员 (member)。
            全项目全员绩点自动汇总中心专供<strong>绩效核算员 (auditor)</strong> 与<strong>系统管理员 (admin)</strong> 使用，负责汇总所有项目负责人提交的分配数据包。
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px' }}>
            {onSwitchToAuditor && (
              <button
                className="primary"
                style={{
                  background: '#059669',
                  borderColor: '#047857',
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onClick={onSwitchToAuditor}
              >
                <ShieldCheck size={18} />
                一键切换/委任为核算员
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '60px' }}>
      {/* 隐藏的文件输入框：支持多选数据包 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".json"
        style={{ display: 'none' }}
        onChange={e => {
          handleImportFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* 图2与图3单独作为【数据导入】页面展示 */}
      {activeTab === 'import' && (
        <>
          {/* 数据包导入与操作栏 */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
              border: '1px solid #bbf7d0',
              borderRadius: '16px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 4px 16px rgba(5, 150, 105, 0.05)',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
              className="primary"
              style={{
                background: '#059669',
                borderColor: '#047857',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                fontSize: '13.5px',
                borderRadius: '8px',
              }}
              onClick={() => fileInputRef.current?.click()}
              title="支持选择多个负责人发来的单包或项目合包 (*.json)"
            >
              <Upload size={16} />
              导入项目数据包 / 合包
            </button>

            <button
              style={{
                background: '#ffffff',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                fontSize: '13.5px',
                borderRadius: '8px',
                fontWeight: 600,
              }}
              onClick={handleLoadSystemProjects}
              title="如果各项目已在当前系统中完成月度分配，可一键读取并自动汇总"
            >
              <Sparkles size={16} color="#059669" />
              一键载入系统全部项目
            </button>

            {packages.length > 0 && (
              <button
                className="secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 14px',
                  fontSize: '13.5px',
                  borderRadius: '8px',
                  color: '#b91c1c',
                }}
                onClick={handleClearAll}
                title="清空当前导入的数据包，重新导入"
              >
                <RotateCcw size={15} />
                清空重置
              </button>
            )}

            <button
              className="secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                fontSize: '13.5px',
                borderRadius: '8px',
              }}
              onClick={handleExportFullBundleJson}
              title="导出包含所有项目数据与全员汇总的完整 JSON 归档总包"
            >
              <Download size={15} />
              导出汇总总包(JSON)
            </button>
          </div>

        {/* 拖拽上传支持提示区 */}
        <div
          onDragOver={e => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files) handleImportFiles(e.dataTransfer.files);
          }}
          style={{
            background: isDragging ? '#dcfce7' : '#f8fafc',
            border: `2px dashed ${isDragging ? '#10b981' : '#cbd5e1'}`,
            borderRadius: '10px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: '#475569',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen size={16} color="#059669" />
            <span>
              💡 <strong>智能拖拽识别</strong>：支持拖入单个项目数据包，或负责人【一键导出的全部项目数据包集合】，系统自动解包并合并汇总。
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            当前已载入 <strong>{packages.length}</strong> 个项目数据包
          </span>
        </div>
      </div>

      {/* 已导入的数据包管理条带 */}
      {packages.length > 0 && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={16} color="#059669" />
              已导入的项目数据包清单 ({packages.length} 个项目)
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>点击卡片可查看该数据包完整明细</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {packages.map(pkg => (
              <div
                key={pkg.project.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '12.5px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>
                    {pkg.project.name} {pkg.project.code ? `(${pkg.project.code})` : ''}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    负责人: {pkg.project.ownerName} · 额度: {pkg.project.periodAllocatedWan}万 · 人数: {pkg.memberSummaries.length}人
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', borderLeft: '1px solid #e2e8f0', paddingLeft: '8px' }}>
                  <button
                    className="icon-button"
                    style={{ width: 24, height: 24 }}
                    onClick={() => setInspectPackage(pkg)}
                    title="查看该数据包详情"
                  >
                    <Eye size={13} color="#0369a1" />
                  </button>
                  <button
                    className="icon-button"
                    style={{ width: 24, height: 24 }}
                    onClick={() => handleRemovePackage(pkg.project.id)}
                    title="移除该数据包"
                  >
                    <Trash2 size={13} color="#ef4444" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 核心指标统计卡片 (KPI) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={15} color="#0284c7" />
            纳入项目总数 / 合同总额
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
            {summary.overview.packageCount} <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>个项目</span>
          </div>
          <div style={{ fontSize: '12px', color: '#0369a1', marginTop: '4px' }}>
            全部门合同总额: {wan(summary.overview.totalContractWan * 1000000)} 万元
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calculator size={15} color="#059669" />
            已分配总绩点 / 折合总额
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669' }}>
            {score(summary.overview.totalAllocatedPoints)} <span style={{ fontSize: '14px', fontWeight: 500 }}>绩点</span>
          </div>
          <div style={{ fontSize: '12px', color: '#047857', marginTop: '4px' }}>
            折合金额: {wan(summary.overview.totalAllocatedWan * 1000000)} 万元
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={15} color="#d97706" />
            部门合同剩余额度 / 消耗率
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#d97706' }}>
            {formatWan6(deptContracts.totalRemainingWan)} <span style={{ fontSize: '14px', fontWeight: 500 }}>万元</span>
          </div>
          <div style={{ fontSize: '12px', color: '#b45309', marginTop: '4px' }}>
            整体消耗率: {pct(deptContracts.overallAllocatedRateBps)} (已分配 {formatWan6(deptContracts.totalAllocatedWan)} 万元)
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={15} color="#7c3aed" />
            获得分配员工数 / 人均绩点
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#7c3aed' }}>
            {summary.overview.totalEmployees} <span style={{ fontSize: '14px', fontWeight: 500 }}>人</span>
          </div>
          <div style={{ fontSize: '12px', color: '#6d28d9', marginTop: '4px' }}>
            人均获得: {score(summary.overview.avgPointsPerEmployee)} 绩点
          </div>
        </div>
      </div>

      {/* 导入完成后的快捷导航引导卡片 */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px 28px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#059669" />
          <strong style={{ fontSize: '15px', color: '#0f172a' }}>数据已成功载入！请在左侧导航栏查看各维度统计：</strong>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <button
            type="button"
            className="secondary"
            style={{ justifyContent: 'flex-start', padding: '12px 14px', borderRadius: '10px', gap: '8px', fontSize: '13px' }}
            onClick={() => setActiveTab('employees')}
          >
            <Users size={16} color="#059669" />
            <span>全员跨项目绩效总表 ({summary.employeeSummaries.length}人)</span>
          </button>
          <button
            type="button"
            className="secondary"
            style={{ justifyContent: 'flex-start', padding: '12px 14px', borderRadius: '10px', gap: '8px', fontSize: '13px' }}
            onClick={() => setActiveTab('contracts')}
          >
            <BriefcaseBusiness size={16} color="#0284c7" />
            <span>全景合同矩阵 ({deptContracts.totalProjects}个)</span>
          </button>
          <button
            type="button"
            className="secondary"
            style={{ justifyContent: 'flex-start', padding: '12px 14px', borderRadius: '10px', gap: '8px', fontSize: '13px' }}
            onClick={() => setActiveTab('stars')}
          >
            <Crown size={16} color="#e11d48" />
            <span>卓越绩星荣誉殿堂 (月/季/年/区间排名)</span>
          </button>
          <button
            type="button"
            className="secondary"
            style={{ justifyContent: 'flex-start', padding: '12px 14px', borderRadius: '10px', gap: '8px', fontSize: '13px' }}
            onClick={() => setActiveTab('matrix')}
          >
            <Table2 size={16} color="#7c3aed" />
            <span>全项目多维透视矩阵</span>
          </button>
          <button
            type="button"
            className="secondary"
            style={{ justifyContent: 'flex-start', padding: '12px 14px', borderRadius: '10px', gap: '8px', fontSize: '13px' }}
            onClick={() => setActiveTab('details')}
          >
            <FileSpreadsheet size={16} color="#ea580c" />
            <span>全量明细审计流水 ({summary.allDetails.length}条)</span>
          </button>
        </div>
      </div>
    </>
  )}

      {/* 核心工作区：当处于图4各项时（activeTab !== 'import'），不渲染图2和图3，直接呈现纯净报表 */}
      {activeTab !== 'import' && (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
          {hideTabBar ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background:
                    activeTab === 'employees' ? '#ecfdf5' :
                    activeTab === 'contracts' ? '#f0f9ff' :
                    activeTab === 'ranking' ? '#fffbeb' :
                    activeTab === 'stars' ? '#fff1f2' :
                    activeTab === 'matrix' ? '#f5f3ff' : '#fff7ed',
                  color:
                    activeTab === 'employees' ? '#059669' :
                    activeTab === 'contracts' ? '#0284c7' :
                    activeTab === 'ranking' ? '#d97706' :
                    activeTab === 'stars' ? '#e11d48' :
                    activeTab === 'matrix' ? '#7c3aed' : '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {activeTab === 'employees' && <Users size={17} />}
                {activeTab === 'contracts' && <BriefcaseBusiness size={17} />}
                {activeTab === 'ranking' && <Medal size={17} />}
                {activeTab === 'stars' && <Crown size={17} />}
                {activeTab === 'matrix' && <Table2 size={17} />}
                {activeTab === 'details' && <FileSpreadsheet size={17} />}
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  {activeTab === 'employees' && `全员跨项目绩效总表 (${summary.employeeSummaries.length} 人)`}
                  {activeTab === 'contracts' && `全景合同矩阵与执行对照 (${deptContracts.totalProjects} 个项目)`}
                  {(activeTab === 'ranking' || activeTab === 'stars') && '卓越绩星荣誉殿堂 · 月/季/年/区间全员排名与荣誉榜'}
                  {activeTab === 'matrix' && `全项目多维透视矩阵 (${summary.matrix.projectHeaders.length} 项目 × ${summary.matrix.rows.length} 成员)`}
                  {activeTab === 'details' && `全量明细审计流水 (${summary.allDetails.length} 条记录)`}
                </div>
              </div>
            </div>
          ) : (
            /* 核心视图切换 */
            <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', flexWrap: 'wrap' }}>
              <button
                style={{
                  border: 'none',
                  background: activeTab === 'employees' ? '#ffffff' : 'transparent',
                  color: activeTab === 'employees' ? '#0f172a' : '#64748b',
                  fontWeight: activeTab === 'employees' ? 600 : 400,
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'employees' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                }}
                onClick={() => setActiveTab('employees')}
              >
                <Users size={15} color={activeTab === 'employees' ? '#059669' : '#94a3b8'} />
                全员跨项目绩效总表 ({summary.employeeSummaries.length})
              </button>

              <button
                style={{
                  border: 'none',
                  background: activeTab === 'contracts' ? '#ffffff' : 'transparent',
                  color: activeTab === 'contracts' ? '#0f172a' : '#64748b',
                  fontWeight: activeTab === 'contracts' ? 600 : 400,
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'contracts' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                }}
                onClick={() => setActiveTab('contracts')}
              >
                <BriefcaseBusiness size={15} color={activeTab === 'contracts' ? '#0284c7' : '#94a3b8'} />
                全景合同矩阵 ({deptContracts.totalProjects})
              </button>

              <button
                style={{
                  border: 'none',
                  background: activeTab === 'stars' || activeTab === 'ranking' ? '#ffffff' : 'transparent',
                  color: activeTab === 'stars' || activeTab === 'ranking' ? '#0f172a' : '#64748b',
                  fontWeight: activeTab === 'stars' || activeTab === 'ranking' ? 600 : 400,
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'stars' || activeTab === 'ranking' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                }}
                onClick={() => setActiveTab('stars')}
              >
                <Crown size={15} color={activeTab === 'stars' || activeTab === 'ranking' ? '#e11d48' : '#94a3b8'} />
                卓越绩星荣誉殿堂 (含全员多维排名)
              </button>

              <button
                style={{
                  border: 'none',
                  background: activeTab === 'matrix' ? '#ffffff' : 'transparent',
                  color: activeTab === 'matrix' ? '#0f172a' : '#64748b',
                  fontWeight: activeTab === 'matrix' ? 600 : 400,
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'matrix' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                }}
                onClick={() => setActiveTab('matrix')}
              >
                <Table2 size={15} color={activeTab === 'matrix' ? '#7c3aed' : '#94a3b8'} />
                全项目多维透视矩阵
              </button>

              <button
                style={{
                  border: 'none',
                  background: activeTab === 'details' ? '#ffffff' : 'transparent',
                  color: activeTab === 'details' ? '#0f172a' : '#64748b',
                  fontWeight: activeTab === 'details' ? 600 : 400,
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: activeTab === 'details' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                }}
                onClick={() => setActiveTab('details')}
              >
                <FileSpreadsheet size={15} color={activeTab === 'details' ? '#ea580c' : '#94a3b8'} />
                全量明细审计流水 ({summary.allDetails.length})
              </button>
            </div>
          )}

          {/* 快捷导出当前视图 CSV 按钮 */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {activeTab === 'employees' && (
              <button
                className="secondary"
                style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={handleExportEmployeesCsv}
              >
                <Download size={14} />
                导出全员总表 CSV
              </button>
            )}
            {activeTab === 'contracts' && (
              <button
                className="secondary"
                style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={handleExportProjectsCsv}
              >
                <Download size={14} />
                导出全景合同矩阵 CSV
              </button>
            )}
            {activeTab === 'matrix' && (
              <button
                className="secondary"
                style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={handleExportMatrixCsv}
              >
                <Download size={14} />
                导出多维透视矩阵 CSV
              </button>
            )}
            {activeTab === 'details' && (
              <button
                className="secondary"
                style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={handleExportDetailsCsv}
              >
                <Download size={14} />
                导出全量明细审计流水 CSV
              </button>
            )}
          </div>
        </div>

        {/* 筛选与搜索工具栏（仅在有列表的标签页展示） */}
        {activeTab !== 'stars' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 260 }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder={activeTab === 'contracts' ? '搜索项目名称/令号/客户/负责人…' : '搜索员工姓名/专业组/职务…'}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%', paddingLeft: 32, fontSize: '13px', height: 34, borderRadius: 6, border: '1px solid #cbd5e1' }}
                />
                {search && (
                  <button
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onClick={() => setSearch('')}
                  >
                    <X size={14} color="#94a3b8" />
                  </button>
                )}
              </div>

              {activeTab !== 'contracts' && groupOptions.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Filter size={14} color="#64748b" />
                  <select
                    value={groupFilter}
                    onChange={e => setGroupFilter(e.target.value)}
                    style={{ fontSize: '13px', height: 34, borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 8px' }}
                  >
                    <option value="all">全部专业组 ({summary.employeeSummaries.length}人)</option>
                    {groupOptions.map(g => (
                      <option key={g} value={g}>
                        {g} ({summary.employeeSummaries.filter(e => e.group === g).length}人)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ fontSize: '12.5px', color: '#64748b' }}>
              {activeTab === 'employees' && `共筛选出 ${filteredEmployees.length} 名成员获得分配`}
              {activeTab === 'contracts' && `共筛选出 ${filteredProjects.length} 个项目合同`}
              {activeTab === 'ranking' && `全员综合排位清单 (${rankingList.length} 人)`}
              {activeTab === 'matrix' && `透视矩阵：${summary.matrix.rows.length} 成员 × ${summary.matrix.projectHeaders.length} 项目 (行列总和精确守恒)`}
              {activeTab === 'details' && `共筛选出 ${filteredDetails.length} 条分配流水`}
            </div>
          </div>
        )}

        {/* ---------------- 视图 1：部门全员汇总表 ---------------- */}
        {activeTab === 'employees' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '60px', textAlign: 'center' }}>全员排名</th>
                    <th style={{ width: '90px' }}>工号</th>
                    <th>员工姓名</th>
                    <th>所属专业组</th>
                    <th>职务</th>
                    <th>参与项目数</th>
                    <th style={{ textAlign: 'right' }}>累计获得绩点</th>
                    <th style={{ textAlign: 'right' }}>折合金额</th>
                    <th>参与项目明细</th>
                    <th style={{ textAlign: 'center', width: '90px' }}>全景下钻</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        暂未找到匹配的员工分配记录，请检查筛选条件或导入项目数据包。
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map(emp => (
                      <tr key={emp.employeeId} style={{ cursor: 'pointer' }} onClick={() => setInspectEmployee(emp)}>
                        <td style={{ textAlign: 'center', fontWeight: emp.rank <= 3 ? 700 : 500 }}>
                          {emp.rank === 1 ? '🥇 1' : emp.rank === 2 ? '🥈 2' : emp.rank === 3 ? '🥉 3' : emp.rank}
                        </td>
                        <td style={{ fontFamily: 'monospace', color: '#0369a1', fontSize: '12px' }}>
                          {emp.employeeNo ? <span style={{ background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px' }}>{emp.employeeNo}</span> : <span style={{ color: '#94a3b8' }}>-</span>}
                        </td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{emp.name}</td>
                        <td>
                          {emp.group ? (
                            <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                              {emp.group}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>未分组</span>
                          )}
                        </td>
                        <td>{emp.position || '-'}</td>
                        <td style={{ fontWeight: 600, color: '#0369a1' }}>{emp.projectCount} 个项目</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669', fontSize: '13.5px' }}>
                          {score(emp.totalPoints)}
                        </td>
                        <td style={{ textAlign: 'right', color: '#334155' }}>{formatWan6(emp.totalWan)} 万元</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: '380px' }}>
                            {emp.projects.slice(0, 3).map(p => (
                              <span
                                key={p.projectId}
                                style={{
                                  background: '#e0f2fe',
                                  color: '#0369a1',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                }}
                              >
                                {p.projectName}: {score(p.points)}
                              </span>
                            ))}
                            {emp.projects.length > 3 && (
                              <span style={{ fontSize: '11px', color: '#64748b' }}>+{emp.projects.length - 3}个</span>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="secondary"
                            style={{ padding: '3px 8px', fontSize: '11.5px', borderRadius: '4px' }}
                            onClick={e => {
                              e.stopPropagation();
                              setInspectEmployee(emp);
                            }}
                          >
                            查看明细
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- 视图 2：全部门合同额度汇总与执行大盘 ---------------- */}
        {activeTab === 'contracts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 额度执行状态进度条 */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                  全部门合同总预算执行总览
                </span>
                <span style={{ fontSize: '13px', color: '#0369a1', fontWeight: 600 }}>
                  已分配 {formatWan6(deptContracts.totalAllocatedWan)} 万元 / 总额 {formatWan6(deptContracts.totalContractWan)} 万元 ({pct(deptContracts.overallAllocatedRateBps)})
                </span>
              </div>
              <div style={{ width: '100%', height: '14px', background: '#e2e8f0', borderRadius: '7px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, deptContracts.overallAllocatedRateBps / 100)}%`,
                    height: '100%',
                    background: deptContracts.overallAllocatedRateBps > 10000 ? '#ef4444' : deptContracts.overallAllocatedRateBps > 8500 ? '#f59e0b' : '#059669',
                    borderRadius: '7px',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                <span>正常执行项目: {deptContracts.normalProjectsCount} 个</span>
                <span>已结项/用尽项目: {deptContracts.completedProjectsCount} 个</span>
                {deptContracts.warningProjectsCount > 0 && (
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>超额预警项目: {deptContracts.warningProjectsCount} 个</span>
                )}
                <span>剩余可用总额度: {formatWan6(deptContracts.totalRemainingWan)} 万元</span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '50px', textAlign: 'center' }}>序号</th>
                    <th>工作令号</th>
                    <th>项目名称</th>
                    <th>项目负责人</th>
                    <th>客户单位</th>
                    <th style={{ textAlign: 'right' }}>合同总额</th>
                    <th style={{ textAlign: 'right' }}>已分配额度</th>
                    <th style={{ textAlign: 'right' }}>已分配比例</th>
                    <th style={{ textAlign: 'right' }}>剩余额度</th>
                    <th style={{ textAlign: 'center' }}>参与人数</th>
                    <th style={{ textAlign: 'center' }}>额度健康状态</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        暂未找到匹配的项目合同记录。
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((p, idx) => (
                      <tr key={p.id}>
                        <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 600, color: '#0369a1' }}>{p.code || '-'}</td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</td>
                        <td>{p.ownerName}</td>
                        <td style={{ color: '#475569' }}>{p.client || '-'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatWan6(p.contractWan)} 万元</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>
                          {formatWan6(p.allocatedWan)} 万元
                        </td>
                        <td style={{ textAlign: 'right' }}>{pct(p.allocatedRateBps)}</td>
                        <td
                          style={{
                            textAlign: 'right',
                            fontWeight: 600,
                            color: p.remainingWan < 0 ? '#dc2626' : '#334155',
                          }}
                        >
                          {formatWan6(p.remainingWan)} 万元
                        </td>
                        <td style={{ textAlign: 'center' }}>{p.headcount} 人</td>
                        <td style={{ textAlign: 'center' }}>
                          {p.healthStatus === 'warning' ? (
                            <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600 }}>
                              ⚠️ 超额预警
                            </span>
                          ) : p.healthStatus === 'completed' ? (
                            <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '11.5px' }}>
                              已结项
                            </span>
                          ) : (
                            <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '11.5px' }}>
                              正常执行
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- 视图 3：全员统计绩点排名大盘 ---------------- */}
        {activeTab === 'ranking' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 排行榜前三甲荣誉颁奖台 */}
            {rankingList.length >= 3 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.15fr 1fr',
                  gap: '16px',
                  alignItems: 'flex-end',
                  marginBottom: '10px',
                }}
              >
                {/* 榜眼 (第二名) */}
                <div
                  style={{
                    background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: '1px solid #cbd5e1',
                    borderRadius: '16px',
                    padding: '20px 16px',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '6px' }}>🥈</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>榜眼 · 第二名</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>
                    {rankingList[1]?.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>
                    {rankingList[1]?.group || '部门骨干'} · {rankingList[1]?.projectCount} 项任务
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0284c7' }}>
                    {score(rankingList[1]?.totalPoints)} <span style={{ fontSize: '12px' }}>绩点</span>
                  </div>
                </div>

                {/* 状元 (第一名) */}
                <div
                  style={{
                    background: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)',
                    border: '2px solid #fde68a',
                    borderRadius: '18px',
                    padding: '28px 18px',
                    textAlign: 'center',
                    boxShadow: '0 8px 24px rgba(245, 158, 11, 0.15)',
                    transform: 'translateY(-8px)',
                  }}
                >
                  <div style={{ fontSize: '36px', marginBottom: '6px' }}>👑</div>
                  <div style={{ fontSize: '13.5px', color: '#b45309', fontWeight: 700 }}>状元 · 全团队领航榜首</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#78350f', margin: '6px 0' }}>
                    {rankingList[0]?.name}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#92400e', marginBottom: '10px' }}>
                    {rankingList[0]?.group || '全栈攻坚'} · 主导参与 {rankingList[0]?.projectCount} 项核心项目
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706' }}>
                    {score(rankingList[0]?.totalPoints)} <span style={{ fontSize: '13px' }}>绩点</span>
                  </div>
                </div>

                {/* 探花 (第三名) */}
                <div
                  style={{
                    background: 'linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)',
                    border: '1px solid #fed7aa',
                    borderRadius: '16px',
                    padding: '18px 16px',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ fontSize: '26px', marginBottom: '6px' }}>🥉</div>
                  <div style={{ fontSize: '12.5px', color: '#c2410c', fontWeight: 600 }}>探花 · 第三名</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>
                    {rankingList[2]?.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>
                    {rankingList[2]?.group || '研发骨干'} · {rankingList[2]?.projectCount} 项任务
                  </div>
                  <div style={{ fontSize: '19px', fontWeight: 800, color: '#ea580c' }}>
                    {score(rankingList[2]?.totalPoints)} <span style={{ fontSize: '12px' }}>绩点</span>
                  </div>
                </div>
              </div>
            )}

            {/* 全员排名表格与离散对比 */}
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '70px', textAlign: 'center' }}>名次</th>
                    <th>员工姓名</th>
                    <th>专业组</th>
                    <th>职务</th>
                    <th style={{ textAlign: 'right' }}>总获得绩点</th>
                    <th style={{ textAlign: 'right' }}>折合金额</th>
                    <th>与部门人均对比</th>
                    <th style={{ textAlign: 'center' }}>参与项目数</th>
                    <th style={{ textAlign: 'center' }}>所属梯队</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingList.map((emp, idx) => {
                    const diff = emp.totalPoints - avgPoints;
                    const tier = idx < Math.ceil(rankingList.length * 0.15) ? 'Top 15% 卓越领航' : idx < Math.ceil(rankingList.length * 0.45) ? 'Top 45% 核心骨干' : '稳健中坚';
                    const tierColor = idx < Math.ceil(rankingList.length * 0.15) ? '#e11d48' : idx < Math.ceil(rankingList.length * 0.45) ? '#0284c7' : '#64748b';
                    return (
                      <tr key={emp.employeeId} style={{ cursor: 'pointer' }} onClick={() => setInspectEmployee(emp)}>
                        <td style={{ textAlign: 'center', fontWeight: idx < 3 ? 800 : 500, fontSize: idx < 3 ? '15px' : '13px' }}>
                          {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}
                        </td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{emp.name}</td>
                        <td>{emp.group || '-'}</td>
                        <td>{emp.position || '-'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669', fontSize: '14px' }}>
                          {score(emp.totalPoints)}
                        </td>
                        <td style={{ textAlign: 'right' }}>{formatWan6(emp.totalWan)} 万元</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '120px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${Math.min(100, Math.max(5, (emp.totalPoints / (rankingList[0]?.totalPoints || 1)) * 100))}%`,
                                  height: '100%',
                                  background: idx < 3 ? '#f59e0b' : '#059669',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '11.5px', color: diff >= 0 ? '#059669' : '#94a3b8' }}>
                              {diff >= 0 ? `+${score(diff)}` : score(diff)}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{emp.projectCount} 个</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '11.5px', color: tierColor, fontWeight: 600, background: '#f8fafc', padding: '2px 8px', borderRadius: '4px' }}>
                            {tier}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- 视图 4：荣誉之星殿堂 (月度之星、季度之星、年度之星) ---------------- */}
        {activeTab === 'stars' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 三大荣誉等级切换 */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                style={{
                  border: 'none',
                  background: starCategory === 'monthly' ? '#ecfdf5' : '#f8fafc',
                  color: starCategory === 'monthly' ? '#047857' : '#475569',
                  borderBottom: starCategory === 'monthly' ? '2px solid #059669' : '2px solid transparent',
                  padding: '10px 24px',
                  borderRadius: '8px 8px 0 0',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onClick={() => setStarCategory('monthly')}
              >
                <Star size={16} color="#059669" />
                🌟 月度之星 ({honorStars.monthlyStars.length})
              </button>

              <button
                style={{
                  border: 'none',
                  background: starCategory === 'quarterly' ? '#eff6ff' : '#f8fafc',
                  color: starCategory === 'quarterly' ? '#1d4ed8' : '#475569',
                  borderBottom: starCategory === 'quarterly' ? '2px solid #2563eb' : '2px solid transparent',
                  padding: '10px 24px',
                  borderRadius: '8px 8px 0 0',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onClick={() => setStarCategory('quarterly')}
              >
                <Award size={16} color="#2563eb" />
                🏆 季度之星 ({honorStars.quarterlyStars.length})
              </button>

              <button
                style={{
                  border: 'none',
                  background: starCategory === 'annual' ? '#fffbeb' : '#f8fafc',
                  color: starCategory === 'annual' ? '#b45309' : '#475569',
                  borderBottom: starCategory === 'annual' ? '2px solid #d97706' : '2px solid transparent',
                  padding: '10px 24px',
                  borderRadius: '8px 8px 0 0',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onClick={() => setStarCategory('annual')}
              >
                <Crown size={16} color="#d97706" />
                👑 年度之星 ({honorStars.annualStars.length})
              </button>
            </div>

            {/* 荣誉之星卡片网格 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '18px',
              }}
            >
              {starCategory === 'monthly' && (
                honorStars.monthlyStars.length === 0 ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                    暂无月度之星数据，导入包含各月份分配记录的数据包后将自动计算评选。
                  </div>
                ) : (
                  honorStars.monthlyStars.map((star, idx) => (
                    <div
                      key={`${star.period}-${star.employeeId}-${idx}`}
                      style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                        border: '1px solid #bbf7d0',
                        borderRadius: '16px',
                        padding: '22px',
                        boxShadow: '0 4px 16px rgba(5, 150, 105, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#047857', background: '#dcfce7', padding: '3px 10px', borderRadius: '12px' }}>
                            {star.badge}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                            {star.period} 考核周期
                          </span>
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#064e3b', margin: '0 0 4px' }}>
                          {star.title}
                        </h3>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>
                          {star.employeeName}
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#4b5563', marginBottom: '12px' }}>
                          {star.department} · {star.group || '骨干成员'} · {star.position || '核心技术骨干'}
                        </div>
                        <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '0 0 14px' }}>
                          {star.reason}
                        </p>
                      </div>

                      <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>当月斩获总绩点</div>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>
                            {score(star.points)} 绩点
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>高光项目</div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#0369a1' }}>
                            {star.topProjects[0] || '核心重大研制'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}

              {starCategory === 'quarterly' && (
                honorStars.quarterlyStars.length === 0 ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                    暂无季度之星数据。
                  </div>
                ) : (
                  honorStars.quarterlyStars.map((star, idx) => (
                    <div
                      key={`${star.period}-${star.employeeId}-${idx}`}
                      style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
                        border: '1px solid #bfdbfe',
                        borderRadius: '16px',
                        padding: '22px',
                        boxShadow: '0 4px 16px rgba(37, 99, 235, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#1d4ed8', background: '#dbeafe', padding: '3px 10px', borderRadius: '12px' }}>
                            {star.badge}
                          </span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{star.period} 季度</span>
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e3a8a', margin: '0 0 4px' }}>
                          {star.title}
                        </h3>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>
                          {star.employeeName}
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#4b5563', marginBottom: '12px' }}>
                          {star.department} · {star.group || '技术骨干'} · {star.position || '领衔研发'}
                        </div>
                        <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, background: '#ffffff', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '0 0 14px' }}>
                          {star.reason}
                        </p>
                      </div>

                      <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>季度累计绩点</div>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb' }}>
                            {score(star.points)} 绩点
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>持续攻坚项目</div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#0369a1' }}>
                            {star.topProjects.slice(0, 2).join(' / ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}

              {starCategory === 'annual' && (
                honorStars.annualStars.length === 0 ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                    暂无年度之星数据。
                  </div>
                ) : (
                  honorStars.annualStars.map((star, idx) => (
                    <div
                      key={`${star.period}-${star.employeeId}-${idx}`}
                      style={{
                        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                        border: '2px solid #fde68a',
                        borderRadius: '18px',
                        padding: '24px',
                        boxShadow: '0 8px 24px rgba(245, 158, 11, 0.12)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#92400e', background: '#fef3c7', padding: '4px 12px', borderRadius: '14px', border: '1px solid #fcd34d' }}>
                            {star.badge}
                          </span>
                          <span style={{ fontSize: '12px', color: '#78350f', fontWeight: 600 }}>{star.period} 年度功勋</span>
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#78350f', margin: '4px 0 6px' }}>
                          {star.title}
                        </h3>
                        <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: '8px 0 4px' }}>
                          {star.employeeName}
                        </div>
                        <div style={{ fontSize: '13px', color: '#92400e', marginBottom: '14px' }}>
                          {star.department} · {star.group || '技术领航'} · 牵头主导 {star.projectCount} 项重大任务
                        </div>
                        <p style={{ fontSize: '13.5px', color: '#451a03', lineHeight: 1.6, background: 'rgba(255,255,255,0.7)', padding: '12px 14px', borderRadius: '10px', border: '1px solid #fde68a', margin: '0 0 16px' }}>
                          {star.reason}
                        </p>
                      </div>

                      <div style={{ borderTop: '1px dashed #f59e0b', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#92400e' }}>年度斩获总绩点</div>
                          <div style={{ fontSize: '22px', fontWeight: 900, color: '#b45309' }}>
                            {score(star.points)} 绩点
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '11px', color: '#92400e' }}>领衔项目</div>
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#78350f' }}>
                            {star.topProjects[0] || '核心重点工程'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        )}

        {/* ---------------- 视图 5：全项目全员二维透视矩阵 ---------------- */}
        {activeTab === 'matrix' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={15} color="#0284c7" />
              <span>
                <strong>二维矩阵求和守恒说明</strong>：横向为每位成员在各项目的分配绩点之和（<strong>个人累加</strong>）；纵向为每个项目在全员中的分配绩点之和（<strong>项目累加</strong>）。右下角矩阵交叉总额与全员总额严格一致。
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '12.5px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ width: '45px', textAlign: 'center', border: '1px solid #e2e8f0' }}>序号</th>
                    <th style={{ minWidth: '85px', border: '1px solid #e2e8f0' }}>工号</th>
                    <th style={{ minWidth: '90px', border: '1px solid #e2e8f0' }}>姓名</th>
                    <th style={{ minWidth: '80px', border: '1px solid #e2e8f0' }}>职务</th>
                    <th style={{ minWidth: '85px', border: '1px solid #e2e8f0' }}>专业组</th>
                    {summary.matrix.projectHeaders.map(h => (
                      <th
                        key={h.id}
                        style={{
                          minWidth: '130px',
                          textAlign: 'right',
                          border: '1px solid #e2e8f0',
                          padding: '6px 10px',
                          fontSize: '12px',
                        }}
                        title={`${h.name} (${h.code || '无令号'})`}
                      >
                        {h.label}
                      </th>
                    ))}
                    <th
                      style={{
                        minWidth: '110px',
                        textAlign: 'right',
                        border: '1px solid #e2e8f0',
                        background: '#e0f2fe',
                        color: '#0369a1',
                        fontWeight: 700,
                      }}
                    >
                      个人累加
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary.matrix.rows.length === 0 ? (
                    <tr>
                      <td colSpan={6 + summary.matrix.projectHeaders.length} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        暂无矩阵透视数据，请导入项目数据包。
                      </td>
                    </tr>
                  ) : (
                    <>
                      {summary.matrix.rows.map(r => (
                        <tr key={r.employeeId}>
                          <td style={{ textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>{r.index}</td>
                          <td style={{ fontFamily: 'monospace', color: '#0369a1', fontSize: '12px', border: '1px solid #e2e8f0' }}>
                            {r.employeeNo || '-'}
                          </td>
                          <td style={{ fontWeight: 600, color: '#0f172a', border: '1px solid #e2e8f0' }}>{r.name}</td>
                          <td style={{ border: '1px solid #e2e8f0', color: '#475569' }}>{r.position || '-'}</td>
                          <td style={{ border: '1px solid #e2e8f0', color: '#475569' }}>{r.group || '-'}</td>
                          {r.scores.map((pts, pIdx) => (
                            <td
                              key={pIdx}
                              style={{
                                textAlign: 'right',
                                border: '1px solid #e2e8f0',
                                color: pts > 0 ? '#0f172a' : '#cbd5e1',
                                fontWeight: pts > 0 ? 500 : 400,
                              }}
                            >
                              {pts > 0 ? score(pts) : '-'}
                            </td>
                          ))}
                          <td
                            style={{
                              textAlign: 'right',
                              fontWeight: 700,
                              color: '#0284c7',
                              background: '#f0f9ff',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {score(r.rowTotalPoints)}
                          </td>
                        </tr>
                      ))}

                      {/* 底行：项目累加 */}
                      <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                        <td colSpan={5} style={{ textAlign: 'center', border: '1px solid #cbd5e1', color: '#0f172a' }}>
                          项目累加
                        </td>
                        {summary.matrix.projectTotals.map((pts, idx) => (
                          <td
                            key={idx}
                            style={{
                              textAlign: 'right',
                              border: '1px solid #cbd5e1',
                              color: '#059669',
                              fontWeight: 700,
                            }}
                          >
                            {score(pts)}
                          </td>
                        ))}
                        <td
                          style={{
                            textAlign: 'right',
                            border: '1px solid #cbd5e1',
                            background: '#dcfce7',
                            color: '#15803d',
                            fontWeight: 800,
                            fontSize: '13.5px',
                          }}
                        >
                          {score(summary.matrix.grandTotalPoints)}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- 视图 6：全量明细流水表 ---------------- */}
        {activeTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '45px', textAlign: 'center' }}>序号</th>
                    <th>考核月份</th>
                    <th>工作令号</th>
                    <th>项目名称</th>
                    <th>工号</th>
                    <th>员工姓名</th>
                    <th>专业组</th>
                    <th>职务</th>
                    <th style={{ textAlign: 'right' }}>分润比例</th>
                    <th style={{ textAlign: 'right' }}>获得绩点</th>
                    <th style={{ textAlign: 'right' }}>折合金额</th>
                    <th>工作履职内容</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDetails.length === 0 ? (
                    <tr>
                      <td colSpan={12} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                        暂未找到匹配的流水明细。
                      </td>
                    </tr>
                  ) : (
                    filteredDetails.map((d, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 600, color: '#0369a1' }}>{d.month}</td>
                        <td style={{ color: '#475569' }}>{d.projectCode || '-'}</td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{d.projectName}</td>
                        <td style={{ fontFamily: 'monospace', color: '#0369a1', fontSize: '12px' }}>
                          {d.employeeNo ? <span style={{ background: '#e0f2fe', padding: '1px 5px', borderRadius: '4px' }}>{d.employeeNo}</span> : <span style={{ color: '#94a3b8' }}>-</span>}
                        </td>
                        <td style={{ fontWeight: 600 }}>{d.employeeName}</td>
                        <td>{d.group || '-'}</td>
                        <td>{d.position || '-'}</td>
                        <td style={{ textAlign: 'right' }}>{pct(d.rate)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                          {score(d.points)}
                        </td>
                        <td style={{ textAlign: 'right', color: '#334155' }}>{formatWan6(d.wan)} 万元</td>
                        <td style={{ color: '#475569', maxWidth: '280px' }} title={d.workContent}>
                          {d.workContent || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      )}

      {/* 弹窗 1：员工跨项目分配全景下钻档案 */}
      {inspectEmployee && (
        <div className="modal-mask" onClick={() => setInspectEmployee(null)}>
          <div
            className="modal-container"
            style={{ maxWidth: '820px', width: '92%' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  【{inspectEmployee.name}】跨项目分配全景档案
                </h2>
                <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>
                  {inspectEmployee.employeeNo ? <span style={{ color: '#0369a1', background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px', marginRight: '6px', fontWeight: 600 }}>工号: {inspectEmployee.employeeNo}</span> : null}
                  {inspectEmployee.department} · {inspectEmployee.group || '未分组'} · {inspectEmployee.position || '员工'}
                </div>
              </div>
              <button className="icon-button" onClick={() => setInspectEmployee(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '11.5px', color: '#166534' }}>全员绩效排名</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803d' }}>第 {inspectEmployee.rank} 名</div>
              </div>
              <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <div style={{ fontSize: '11.5px', color: '#0369a1' }}>跨项目累计绩点</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0284c7' }}>{score(inspectEmployee.totalPoints)}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11.5px', color: '#475569' }}>折合总金额</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{formatWan6(inspectEmployee.totalWan)} 万元</div>
              </div>
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
              各项目获得绩点分布 ({inspectEmployee.projects.length} 个项目)
            </h4>
            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
              <table className="table" style={{ width: '100%', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th>工作令号</th>
                    <th>项目名称</th>
                    <th>项目负责人</th>
                    <th style={{ textAlign: 'right' }}>在该项目获得绩点</th>
                    <th style={{ textAlign: 'right' }}>折合金额</th>
                    <th style={{ textAlign: 'right' }}>在该项目占比</th>
                  </tr>
                </thead>
                <tbody>
                  {inspectEmployee.projects.map(p => {
                    const ratio = inspectEmployee.totalPoints > 0 ? ((p.points / inspectEmployee.totalPoints) * 100).toFixed(1) : '0';
                    return (
                      <tr key={p.projectId}>
                        <td style={{ color: '#0369a1', fontWeight: 600 }}>{p.projectCode || '-'}</td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{p.projectName}</td>
                        <td>{p.ownerName}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                          {score(p.points)}
                        </td>
                        <td style={{ textAlign: 'right' }}>{formatWan6(p.wan)} 万元</td>
                        <td style={{ textAlign: 'right', color: '#64748b' }}>{ratio}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="primary" onClick={() => setInspectEmployee(null)}>
                关闭档案
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗 2：单个数据包详细信息 */}
      {inspectPackage && (
        <div className="modal-mask" onClick={() => setInspectPackage(null)}>
          <div
            className="modal-container"
            style={{ maxWidth: '820px', width: '92%' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  数据包详情：{inspectPackage.project.name}
                </h2>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  项目负责人: {inspectPackage.project.ownerName} · 导出时间: {new Date(inspectPackage.generatedAt).toLocaleString()}
                </div>
              </div>
              <button className="icon-button" onClick={() => setInspectPackage(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>合同总额</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  {formatWan6(inspectPackage.project.contractWan)} 万元
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>已分配额度</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#059669' }}>
                  {formatWan6(inspectPackage.project.periodAllocatedWan)} 万元
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>剩余可用额度</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0369a1' }}>
                  {formatWan6(inspectPackage.project.remainingWan)} 万元
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>分配人数 / 明细数</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#7c3aed' }}>
                  {inspectPackage.memberSummaries.length} 人 / {inspectPackage.details.length} 条
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
              该项目各成员分配总和
            </h4>
            <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '16px' }}>
              <table className="table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ width: '80px' }}>工号</th>
                    <th>成员姓名</th>
                    <th>专业组</th>
                    <th>职务</th>
                    <th style={{ textAlign: 'right' }}>获得绩点</th>
                    <th style={{ textAlign: 'right' }}>折合金额</th>
                    <th style={{ textAlign: 'right' }}>在该项目占比</th>
                  </tr>
                </thead>
                <tbody>
                  {inspectPackage.memberSummaries.map(m => (
                    <tr key={m.employeeId}>
                      <td style={{ fontFamily: 'monospace', color: '#0369a1', fontSize: '12px' }}>
                        {m.employeeNo ? <span style={{ background: '#e0f2fe', padding: '1px 5px', borderRadius: '4px' }}>{m.employeeNo}</span> : '-'}
                      </td>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td>{m.group || '-'}</td>
                      <td>{m.position || '-'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                        {score(m.totalPoints)}
                      </td>
                      <td style={{ textAlign: 'right' }}>{formatWan6(m.totalWan)} 万元</td>
                      <td style={{ textAlign: 'right', color: '#64748b' }}>{m.ratioInProject}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="primary" onClick={() => setInspectPackage(null)}>
                关闭详情
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
