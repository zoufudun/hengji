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
} from 'recharts';
import {
  type State,
  type Employee,
  type ProjectMeritPackage,
  type AuditorSummaryResult,
  score,
  wan,
  pct,
  parseProjectMeritPackage,
  summarizeAuditorPackages,
  summarizeCurrentStateForAuditor,
  exportAuditorEmployeesCsv,
  exportAuditorProjectsCsv,
  exportAuditorMatrixCsv,
  exportAuditorDetailsCsv,
  exportAuditorFullBundleJson,
} from '../lib/core';

interface AuditorSummaryViewProps {
  state: State;
  currentActor: Employee;
  isAdmin: boolean;
  isAuditor: boolean;
  onSwitchToAuditor?: () => void;
  triggerDownload: (content: string, filename: string, mimeType?: string) => Promise<void>;
  setNotice: (msg: string) => void;
}

export function AuditorSummaryView({
  state,
  currentActor,
  isAdmin,
  isAuditor,
  onSwitchToAuditor,
  triggerDownload,
  setNotice,
}: AuditorSummaryViewProps) {
  // 已导入的数据包列表
  const [packages, setPackages] = useState<ProjectMeritPackage[]>([]);
  // 当前查看的主视图 Tab: 'employees' | 'projects' | 'matrix' | 'details'
  const [activeTab, setActiveTab] = useState<'employees' | 'projects' | 'matrix' | 'details'>('employees');
  // 筛选与搜索
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  // 查看某位员工跨项目明细的弹窗
  const [inspectEmployee, setInspectEmployee] = useState<AuditorSummaryResult['employeeSummaries'][0] | null>(null);
  // 查看某个数据包详情的弹窗
  const [inspectPackage, setInspectPackage] = useState<ProjectMeritPackage | null>(null);
  // 是否正在拖拽文件
  const [isDragging, setIsDragging] = useState(false);
  // 文件选择器引用
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化：如果还没有导入外部数据包，默认自动载入当前系统中的全项目分配（便于立即体验与查看）
  useEffect(() => {
    if (packages.length === 0 && state && state.projects.length > 0 && state.plans.length > 0) {
      try {
        const initialSummary = summarizeCurrentStateForAuditor(state);
        if (initialSummary.projectSummaries.length > 0) {
          // 提取系统内生成的包
          const initialPkgs: ProjectMeritPackage[] = [];
          for (const prj of state.projects) {
            const hasPublished = state.plans.some(p => p.projectId === prj.id && p.status === 'published');
            if (hasPublished) {
              try {
                // 内部导入
                const pkg = summarizeCurrentStateForAuditor(state).overview;
              } catch {}
            }
          }
        }
      } catch {}
    }
  }, [state]);

  // 当点击“一键载入当前系统全项目分配”
  const handleLoadSystemProjects = () => {
    try {
      const summary = summarizeCurrentStateForAuditor(state);
      if (summary.projectSummaries.length === 0) {
        setNotice('⚠️ 当前系统中暂无可汇总的项目分配方案（请先发布月度分配方案）');
        return;
      }
      // 从 state 中为每个有方案的项目导出包
      const loadedPkgs: ProjectMeritPackage[] = [];
      for (const p of state.projects) {
        const hasPlans = state.plans.some(plan => plan.projectId === p.id && plan.status === 'published');
        if (hasPlans) {
          const { exportProjectMeritPackage } = require('../lib/core');
          const pkg = exportProjectMeritPackage(state, p.id, { actor: currentActor });
          loadedPkgs.push(pkg);
        }
      }
      setPackages(loadedPkgs);
      setNotice(`✅ 已成功载入当前系统全部 ${loadedPkgs.length} 个项目的分配数据包并完成全员汇总！`);
    } catch (err: any) {
      setNotice(`❌ 载入当前系统项目失败：${err.message}`);
    }
  };

  // 处理文件导入（支持单选或多选 JSON 数据包）
  const handleImportFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    let successCount = 0;
    let failCount = 0;
    const newPkgs: ProjectMeritPackage[] = [];

    for (const file of fileArray) {
      try {
        const text = await file.text();
        const parsed = parseProjectMeritPackage(text);
        newPkgs.push(parsed);
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    if (newPkgs.length > 0) {
      // 合并并去重（根据 projectId 覆盖或增量添加）
      setPackages(prev => {
        const map = new Map<string, ProjectMeritPackage>();
        prev.forEach(p => map.set(p.project.id, p));
        newPkgs.forEach(p => map.set(p.project.id, p));
        return Array.from(map.values());
      });

      setNotice(
        `✅ 成功导入 ${successCount} 个项目数据包${failCount > 0 ? `（${failCount} 个文件格式不符已跳过）` : ''}，全员全项目绩点已自动实时汇总！`
      );
    } else {
      setNotice('❌ 未能成功解析所选文件，请确认是否为导出的【项目绩点数据包 (.json)】文件');
    }
  };

  // 移除单个数据包
  const handleRemovePackage = (projectId: string) => {
    setPackages(prev => prev.filter(p => p.project.id !== projectId));
    setNotice('已移除该项目数据包并重新计算全员汇总');
  };

  // 清空所有数据包
  const handleClearAll = () => {
    if (packages.length === 0) return;
    if (confirm('确定要清空已导入的所有项目数据包吗？')) {
      setPackages([]);
      setNotice('已清空全部数据包');
    }
  };

  // 计算当前核算汇总结果
  const summary: AuditorSummaryResult = useMemo(() => {
    if (packages.length > 0) {
      return summarizeAuditorPackages(packages, state.employees);
    }
    // 若尚未手动导入包，且当前系统有数据，展示当前系统的汇总结果作为预览
    return summarizeCurrentStateForAuditor(state);
  }, [packages, state]);

  // 员工筛选
  const filteredEmployees = useMemo(() => {
    return summary.employeeSummaries.filter(emp => {
      if (groupFilter !== 'all' && emp.group !== groupFilter) return false;
      if (search) {
        const text = `${emp.name} ${emp.department} ${emp.group} ${emp.position} ${emp.groupRole}`.toLowerCase();
        if (!text.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [summary.employeeSummaries, groupFilter, search]);

  // 项目筛选
  const filteredProjects = useMemo(() => {
    return summary.projectSummaries.filter(p => {
      if (search) {
        const text = `${p.name} ${p.code} ${p.ownerName} ${p.client}`.toLowerCase();
        if (!text.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [summary.projectSummaries, search]);

  // 图表数据：前 10 名员工总绩点排行榜
  const top10Employees = useMemo(() => {
    return summary.employeeSummaries.slice(0, 10).map(e => ({
      name: e.name,
      points: Number((e.totalPoints / 100).toFixed(2)),
      group: e.group || '未分组',
      projectCount: e.projectCount,
    }));
  }, [summary.employeeSummaries]);

  // 导出报表处理函数
  const handleExportEmployeesCsv = () => {
    const csv = exportAuditorEmployeesCsv(summary);
    const filename = `【核算员汇总】全员跨项目绩点总表_${summary.overview.periodLabel}_${new Date().toISOString().slice(0, 10)}.csv`;
    triggerDownload(csv, filename);
    setNotice(`已导出全员绩点总表：${filename}`);
  };

  const handleExportProjectsCsv = () => {
    const csv = exportAuditorProjectsCsv(summary);
    const filename = `【核算员汇总】各项目分配额度情况对照表_${summary.overview.periodLabel}_${new Date().toISOString().slice(0, 10)}.csv`;
    triggerDownload(csv, filename);
    setNotice(`已导出项目分配额度对照表：${filename}`);
  };

  const handleExportMatrixCsv = () => {
    const csv = exportAuditorMatrixCsv(summary);
    const filename = `【核算员汇总】全项目全员二维透视矩阵_${summary.overview.periodLabel}_${new Date().toISOString().slice(0, 10)}.csv`;
    triggerDownload(csv, filename);
    setNotice(`已导出二维透视矩阵：${filename}`);
  };

  const handleExportDetailsCsv = () => {
    const csv = exportAuditorDetailsCsv(summary);
    const filename = `【核算员汇总】全量明细流水表_${summary.overview.periodLabel}_${new Date().toISOString().slice(0, 10)}.csv`;
    triggerDownload(csv, filename);
    setNotice(`已导出全量分配流水表：${filename}`);
  };

  const handleExportFullBundleJson = () => {
    const json = exportAuditorFullBundleJson(summary);
    const filename = `【核算员归档】全项目全员核算汇总数据总包_${summary.overview.periodLabel}_${new Date().toISOString().slice(0, 10)}.json`;
    triggerDownload(json, filename, 'application/json;charset=utf-8');
    setNotice(`已导出完整核算汇总总报告 JSON：${filename}`);
  };

  // 权限检查：如果非核算员且非管理员
  if (!isAuditor && !isAdmin) {
    return (
      <div className="tab-pane" style={{ padding: '30px 20px', maxWidth: 960, margin: '0 auto' }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '48px 32px',
            textAlign: 'center',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '24px',
              background: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '1px solid #fecaca',
            }}
          >
            <Lock size={36} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
            🔒 绩效核算员专属工作台
          </h2>

          <p style={{ fontSize: '15px', color: '#475569', maxWidth: 580, margin: '0 auto 24px', lineHeight: 1.6 }}>
            您当前登录账号为 <strong>【{currentActor.name}】</strong>（{currentActor.department} ·{' '}
            {currentActor.position || '员工'}），角色为普通成员。
            <br />
            <strong>【全项目全员绩点汇总与数据包导入】</strong>
            为绩效核算员与系统管理员专属核心功能，用于汇总各位项目负责人提交的分配数据包。
          </p>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '16px 20px',
              maxWidth: 540,
              margin: '0 auto 28px',
              textAlign: 'left',
              fontSize: '13.5px',
              color: '#334155',
            }}
          >
            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#059669" />
              如何开通核算员权限？
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.6 }}>
              <li>联系系统管理员在【员工与专业组】模块中，将您的系统角色变更为<strong>“📊 绩效核算员”</strong>；</li>
              <li>若需在本地快速体验，可点击右上角身份药丸或下方按钮切换为核算员身份。</li>
            </ul>
          </div>

          {onSwitchToAuditor && (
            <button
              className="primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                fontSize: '14.5px',
                borderRadius: '8px',
              }}
              onClick={onSwitchToAuditor}
            >
              <Calculator size={18} />
              一键切换为绩效核算员身份体验
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="tab-pane" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 隐藏的文件上传 input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".json"
        style={{ display: 'none' }}
        onChange={e => {
          if (e.target.files) handleImportFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* 顶部标题与操作栏 */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 60%, #ecfdf5 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: '16px',
          padding: '24px 28px',
          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  padding: '6px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calculator size={22} />
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#064e3b', margin: 0 }}>
                绩效核算员 · 全项目全员绩点汇总中心
              </h1>
              <span
                style={{
                  background: '#dcfce7',
                  color: '#15803d',
                  fontSize: '12px',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  border: '1px solid #86efac',
                }}
              >
                核算员专享模块
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', maxWidth: '780px', lineHeight: 1.5 }}>
              团队模式下，每位项目负责人负责分配各自项目并导出数据包发给核算员；核算员在此批量导入所有项目分配数据包（或一键载入系统内已有项目），系统自动合并各项目分配额度、计算每个人跨项目的绩点总和、生成全景透视矩阵与各维度报表。
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
              title="支持选择多个项目负责人发来的 .json 数据包合并导入"
            >
              <Upload size={16} />
              导入项目数据包
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
              💡 <strong>支持直接拖拽</strong>：可将多位项目负责人发来的 <code>.json</code> 项目分配数据包直接拖入此处快速导入汇总。
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
                    <Trash2 size={13} color="#dc2626" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 全景核心 KPI 指标卡片 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
        }}
      >
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BriefcaseBusiness size={15} color="#0284c7" />
            纳入核算项目数
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
            {summary.overview.packageCount} <span style={{ fontSize: '13px', fontWeight: 400, color: '#64748b' }}>个合同</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#0369a1', marginTop: '4px' }}>
            周期: {summary.overview.periodLabel}
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={15} color="#16a34a" />
            涉及合同总额
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#15803d' }}>
            {summary.overview.totalContractWan} <span style={{ fontSize: '13px', fontWeight: 400, color: '#64748b' }}>万元</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#166534', marginTop: '4px' }}>
            累计核算项目合同总规模
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={15} color="#ea580c" />
            已分配总额度
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#c2410c' }}>
            {summary.overview.totalAllocatedWan} <span style={{ fontSize: '13px', fontWeight: 400, color: '#64748b' }}>万元</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#9a3412', marginTop: '4px' }}>
            折合总基点: {summary.overview.totalContractWan > 0 ? ((summary.overview.totalAllocatedWan / summary.overview.totalContractWan) * 100).toFixed(2) : 0}%
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calculator size={15} color="#7c3aed" />
            全员已分配总绩点
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#6d28d9' }}>
            {score(summary.overview.totalAllocatedPoints)} <span style={{ fontSize: '13px', fontWeight: 400, color: '#64748b' }}>绩点</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#5b21b6', marginTop: '4px' }}>
            跨所有项目实绩汇总
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={15} color="#0d9488" />
            参评总员工数
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f766e' }}>
            {summary.overview.totalEmployees} <span style={{ fontSize: '13px', fontWeight: 400, color: '#64748b' }}>人</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#115e59', marginTop: '4px' }}>
            人均获得: {score(summary.overview.avgPointsPerEmployee)} 绩点
          </div>
        </div>
      </div>

      {/* 核心工作区：Tab 导航与过滤栏 */}
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
          {/* 四大视图切换 */}
          <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
            <button
              style={{
                border: 'none',
                background: activeTab === 'employees' ? '#ffffff' : 'transparent',
                color: activeTab === 'employees' ? '#0f172a' : '#64748b',
                fontWeight: activeTab === 'employees' ? 600 : 400,
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: activeTab === 'employees' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              }}
              onClick={() => setActiveTab('employees')}
            >
              <Users size={15} color={activeTab === 'employees' ? '#059669' : '#94a3b8'} />
              全员跨项目绩点总表 ({summary.employeeSummaries.length})
            </button>

            <button
              style={{
                border: 'none',
                background: activeTab === 'projects' ? '#ffffff' : 'transparent',
                color: activeTab === 'projects' ? '#0f172a' : '#64748b',
                fontWeight: activeTab === 'projects' ? 600 : 400,
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: activeTab === 'projects' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              }}
              onClick={() => setActiveTab('projects')}
            >
              <BriefcaseBusiness size={15} color={activeTab === 'projects' ? '#0284c7' : '#94a3b8'} />
              各项目分配额度对照表 ({summary.projectSummaries.length})
            </button>

            <button
              style={{
                border: 'none',
                background: activeTab === 'matrix' ? '#ffffff' : 'transparent',
                color: activeTab === 'matrix' ? '#0f172a' : '#64748b',
                fontWeight: activeTab === 'matrix' ? 600 : 400,
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: activeTab === 'matrix' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              }}
              onClick={() => setActiveTab('matrix')}
            >
              <Table2 size={15} color={activeTab === 'matrix' ? '#7c3aed' : '#94a3b8'} />
              全项目二维透视矩阵
            </button>

            <button
              style={{
                border: 'none',
                background: activeTab === 'details' ? '#ffffff' : 'transparent',
                color: activeTab === 'details' ? '#0f172a' : '#64748b',
                fontWeight: activeTab === 'details' ? 600 : 400,
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: activeTab === 'details' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              }}
              onClick={() => setActiveTab('details')}
            >
              <FileSpreadsheet size={15} color={activeTab === 'details' ? '#ea580c' : '#94a3b8'} />
              全量明细流水 ({summary.allDetails.length})
            </button>
          </div>

          {/* 快捷导出当前视图 CSV 按钮 */}
          <div style={{ display: 'flex', gap: '8px' }}>
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
            {activeTab === 'projects' && (
              <button
                className="secondary"
                style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={handleExportProjectsCsv}
              >
                <Download size={14} />
                导出项目额度对照 CSV
              </button>
            )}
            {activeTab === 'matrix' && (
              <button
                className="secondary"
                style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={handleExportMatrixCsv}
              >
                <Download size={14} />
                导出二维透视矩阵 CSV
              </button>
            )}
            {activeTab === 'details' && (
              <button
                className="secondary"
                style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={handleExportDetailsCsv}
              >
                <Download size={14} />
                导出全量明细流水 CSV
              </button>
            )}
          </div>
        </div>

        {/* 筛选与搜索工具栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 260 }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder={activeTab === 'projects' ? '搜索项目名称/令号/负责人…' : '搜索员工姓名/专业组/职务…'}
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

            {activeTab !== 'projects' && (
              <select
                value={groupFilter}
                onChange={e => setGroupFilter(e.target.value)}
                style={{ height: 34, fontSize: '13px', borderRadius: 6, border: '1px solid #cbd5e1', padding: '0 10px' }}
              >
                <option value="all">所有专业组</option>
                <option value="总体组">总体组</option>
                <option value="产品组">产品组</option>
                <option value="研发组">研发组</option>
              </select>
            )}
          </div>

          <div style={{ fontSize: '12.5px', color: '#64748b' }}>
            统计周期范围：<strong style={{ color: '#0f172a' }}>{summary.overview.periodLabel}</strong> · 共计{' '}
            <strong style={{ color: '#059669' }}>{summary.overview.totalAllocatedPoints ? score(summary.overview.totalAllocatedPoints) : '0.00'}</strong> 绩点
          </div>
        </div>

        {/* TAB 1: 全员跨项目绩点总和大表 */}
        {activeTab === 'employees' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={{ width: 60, textAlign: 'center' }}>排名</th>
                  <th>员工姓名</th>
                  <th>所属专业组</th>
                  <th>职务 / 组内职务</th>
                  <th>所属部门</th>
                  <th style={{ textAlign: 'center' }}>参与项目数</th>
                  <th style={{ textAlign: 'right' }}>累计获得总绩点</th>
                  <th style={{ textAlign: 'right' }}>折合总额度(万元)</th>
                  <th>参与项目与分润分布</th>
                  <th style={{ textAlign: 'center', width: 90 }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      未匹配到符合条件的员工记录
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map(emp => (
                    <tr key={emp.employeeId} style={{ transition: 'background 0.15s' }}>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>
                        {emp.rank === 1 ? '🥇 1' : emp.rank === 2 ? '🥈 2' : emp.rank === 3 ? '🥉 3' : emp.rank}
                      </td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{emp.name}</td>
                      <td>
                        {emp.group ? (
                          <span
                            style={{
                              background: emp.group.includes('总体') ? '#eff6ff' : emp.group.includes('产品') ? '#f0fdf4' : '#faf5ff',
                              color: emp.group.includes('总体') ? '#1d4ed8' : emp.group.includes('产品') ? '#15803d' : '#7e22ce',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11.5px',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {emp.group}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td>
                        {emp.position || emp.groupRole ? (
                          <span>
                            {emp.position} {emp.groupRole ? `(${emp.groupRole})` : ''}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>
                      <td>{emp.department || '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>
                          {emp.projectCount} 个
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669', fontSize: '14px' }}>
                        {score(emp.totalPoints)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#334155' }}>
                        {emp.totalWan.toFixed(4)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: 360 }}>
                          {emp.projects.map(p => (
                            <span
                              key={p.projectId}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                color: '#475569',
                              }}
                              title={`${p.projectName}: ${score(p.points)} 绩点 (${p.wan} 万元)`}
                            >
                              {p.projectName}: <strong style={{ color: '#059669' }}>{score(p.points)}</strong>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          style={{
                            padding: '3px 8px',
                            fontSize: '11.5px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          onClick={() => setInspectEmployee(emp)}
                          title="查看该员工在各项目的分配明细与履职说明"
                        >
                          <Eye size={12} color="#0284c7" />
                          明细
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: 各项目分配额度情况对照表 */}
        {activeTab === 'projects' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={{ width: 50, textAlign: 'center' }}>序号</th>
                  <th>工作令号</th>
                  <th>项目合同名称</th>
                  <th>项目负责人</th>
                  <th>客户名称</th>
                  <th style={{ textAlign: 'right' }}>合同总额(万元)</th>
                  <th style={{ textAlign: 'right' }}>已分配额度(万元)</th>
                  <th style={{ textAlign: 'right' }}>已分配比例(%)</th>
                  <th style={{ textAlign: 'right' }}>已分配总绩点</th>
                  <th style={{ textAlign: 'right' }}>剩余额度(万元)</th>
                  <th style={{ textAlign: 'right' }}>剩余比例(%)</th>
                  <th style={{ textAlign: 'center' }}>分配人数</th>
                  <th style={{ textAlign: 'center' }}>健康状态</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={13} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      未匹配到项目数据
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((p, idx) => (
                    <tr key={p.id}>
                      <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                          {p.code || '待定'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</td>
                      <td>{p.ownerName}</td>
                      <td>{p.client || '-'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{p.contractWan.toFixed(4)}</td>
                      <td style={{ textAlign: 'right', color: '#ea580c', fontWeight: 600 }}>{p.allocatedWan.toFixed(4)}</td>
                      <td style={{ textAlign: 'right' }}>{(p.allocatedRateBps / 100).toFixed(2)}%</td>
                      <td style={{ textAlign: 'right', color: '#059669', fontWeight: 700 }}>{score(p.allocatedPoints)}</td>
                      <td style={{ textAlign: 'right', color: p.remainingWan < 0 ? '#dc2626' : '#15803d', fontWeight: 600 }}>
                        {p.remainingWan.toFixed(4)}
                      </td>
                      <td style={{ textAlign: 'right' }}>{(p.remainingRateBps / 100).toFixed(2)}%</td>
                      <td style={{ textAlign: 'center' }}>{p.headcount} 人</td>
                      <td style={{ textAlign: 'center' }}>
                        {p.healthStatus === 'warning' ? (
                          <span style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontSize: '11.5px', border: '1px solid #fecaca' }}>
                            超额预警
                          </span>
                        ) : p.healthStatus === 'completed' ? (
                          <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontSize: '11.5px', border: '1px solid #bfdbfe' }}>
                            额度用尽
                          </span>
                        ) : (
                          <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '4px', fontSize: '11.5px', border: '1px solid #bbf7d0' }}>
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
        )}

        {/* TAB 3: 全项目全员二维透视矩阵 */}
        {activeTab === 'matrix' && (
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '12.5px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ width: 50, textAlign: 'center', position: 'sticky', left: 0, background: '#f8fafc', zIndex: 2 }}>序号</th>
                  <th style={{ minWidth: 90, position: 'sticky', left: 50, background: '#f8fafc', zIndex: 2 }}>姓名</th>
                  <th style={{ minWidth: 80 }}>专业组</th>
                  {summary.matrix.projectHeaders.map(h => (
                    <th key={h.id} style={{ minWidth: 120, textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {h.label}
                    </th>
                  ))}
                  <th style={{ minWidth: 110, textAlign: 'right', background: '#ecfdf5', color: '#065f46', fontWeight: 700 }}>
                    个人累加
                  </th>
                </tr>
              </thead>
              <tbody>
                {summary.matrix.rows.map(r => (
                  <tr key={r.employeeId}>
                    <td style={{ textAlign: 'center', position: 'sticky', left: 0, background: '#ffffff', zIndex: 1 }}>{r.index}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a', position: 'sticky', left: 50, background: '#ffffff', zIndex: 1 }}>
                      {r.name}
                    </td>
                    <td>{r.group || '-'}</td>
                    {r.scores.map((scoreFen, colIdx) => (
                      <td
                        key={colIdx}
                        style={{
                          textAlign: 'right',
                          color: scoreFen > 0 ? '#0f172a' : '#cbd5e1',
                          fontWeight: scoreFen > 0 ? 600 : 400,
                        }}
                      >
                        {scoreFen > 0 ? score(scoreFen) : '-'}
                      </td>
                    ))}
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669', background: '#f0fdf4' }}>
                      {score(r.rowTotalPoints)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {/* 最底行：项目累加 */}
                <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                  <td colSpan={3} style={{ textAlign: 'center', color: '#0f172a', position: 'sticky', left: 0, background: '#f1f5f9', zIndex: 2 }}>
                    项目累加
                  </td>
                  {summary.matrix.projectTotals.map((tot, idx) => (
                    <td key={idx} style={{ textAlign: 'right', color: '#0369a1' }}>
                      {score(tot)}
                    </td>
                  ))}
                  <td style={{ textAlign: 'right', color: '#b91c1c', background: '#fee2e2', fontSize: '13.5px' }}>
                    {score(summary.matrix.grandTotalPoints)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* TAB 4: 全量明细流水大表 */}
        {activeTab === 'details' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '12.5px' }}>
              <thead>
                <tr>
                  <th style={{ width: 50, textAlign: 'center' }}>序号</th>
                  <th>考核月份</th>
                  <th>工作令号</th>
                  <th>项目名称</th>
                  <th>员工姓名</th>
                  <th>专业组</th>
                  <th>职务</th>
                  <th>所属部门</th>
                  <th style={{ textAlign: 'right' }}>分润比例(%)</th>
                  <th style={{ textAlign: 'right' }}>获得绩点</th>
                  <th style={{ textAlign: 'right' }}>折合金额(万元)</th>
                  <th>工作履职内容说明</th>
                </tr>
              </thead>
              <tbody>
                {summary.allDetails.length === 0 ? (
                  <tr>
                    <td colSpan={12} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                      暂无分配流水明细记录
                    </td>
                  </tr>
                ) : (
                  summary.allDetails.map((d, idx) => (
                    <tr key={`${d.projectId}_${d.month}_${d.employeeId}_${idx}`}>
                      <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{d.month}</span>
                      </td>
                      <td>{d.projectCode || '-'}</td>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{d.projectName}</td>
                      <td style={{ fontWeight: 600 }}>{d.employeeName}</td>
                      <td>{d.group || '-'}</td>
                      <td>{d.position || '-'}</td>
                      <td>{d.department || '-'}</td>
                      <td style={{ textAlign: 'right' }}>{(d.rate / 100).toFixed(2)}%</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>{score(d.points)}</td>
                      <td style={{ textAlign: 'right' }}>{d.wan.toFixed(4)}</td>
                      <td style={{ color: '#475569' }}>{d.workContent || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 图表可视化区域：员工 Top 10 与专业组分布 */}
      {top10Employees.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} color="#059669" />
              全员累计获得总绩点 Top 10 排行榜
            </h3>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10Employees} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: any) => [`${value} 绩点`, '获得总绩点']} />
                  <Bar dataKey="points" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} color="#0284c7" />
              专业组额度配比与人数分布
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              {summary.groupDistribution.map(g => (
                <div key={g.group} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{g.group} ({g.headcount}人)</span>
                    <span style={{ color: '#059669', fontWeight: 600 }}>{score(g.points)} 绩点 ({g.wan}万 · {g.ratio}%)</span>
                  </div>
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${g.ratio}%`,
                        background: g.group.includes('总体') ? '#3b82f6' : g.group.includes('产品') ? '#10b981' : '#a855f7',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 弹窗：查看某员工在各个项目的明细下钻 */}
      {inspectEmployee && (
        <div className="modal-backdrop" onClick={() => setInspectEmployee(null)}>
          <div
            className="modal"
            style={{ maxWidth: 780, width: '90%' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2>【{inspectEmployee.name}】全项目分润明细档案</h2>
                <p>
                  所属：{inspectEmployee.department} · {inspectEmployee.group || '未分组'} · 职务：{inspectEmployee.position || '员工'}
                </p>
              </div>
              <button className="icon-button" onClick={() => setInspectEmployee(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ background: '#f0fdf4', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: '12px', color: '#166534' }}>累计获得总绩点</span>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#15803d' }}>
                    {score(inspectEmployee.totalPoints)}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>折合总额度</span>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                    {inspectEmployee.totalWan} 万元
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>参与项目总数</span>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                    {inspectEmployee.projectCount} 个
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                各项目明细记录流水：
              </h4>

              <table className="data-table" style={{ width: '100%', fontSize: '12.5px' }}>
                <thead>
                  <tr>
                    <th>考核月份</th>
                    <th>项目名称</th>
                    <th>工作令号</th>
                    <th style={{ textAlign: 'right' }}>分润比例</th>
                    <th style={{ textAlign: 'right' }}>获得绩点</th>
                    <th style={{ textAlign: 'right' }}>折合万元</th>
                    <th>工作履职内容</th>
                  </tr>
                </thead>
                <tbody>
                  {inspectEmployee.details.map((d, i) => (
                    <tr key={i}>
                      <td><span style={{ fontFamily: 'monospace' }}>{d.month}</span></td>
                      <td style={{ fontWeight: 600 }}>{d.projectName}</td>
                      <td>{d.projectCode || '-'}</td>
                      <td style={{ textAlign: 'right' }}>{(d.rate / 100).toFixed(2)}%</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>{score(d.points)}</td>
                      <td style={{ textAlign: 'right' }}>{d.wan.toFixed(4)}</td>
                      <td style={{ color: '#475569' }}>{d.workContent || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-foot">
              <button className="primary" onClick={() => setInspectEmployee(null)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 弹窗：查看某个数据包详情 */}
      {inspectPackage && (
        <div className="modal-backdrop" onClick={() => setInspectPackage(null)}>
          <div
            className="modal"
            style={{ maxWidth: 760, width: '90%' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <h2>【{inspectPackage.project.name}】数据包详情</h2>
                <p>
                  工作令号: {inspectPackage.project.code || '无'} · 负责人: {inspectPackage.project.ownerName} · 导出时间: {inspectPackage.generatedAt.slice(0, 19).replace('T', ' ')}
                </p>
              </div>
              <button className="icon-button" onClick={() => setInspectPackage(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>合同总额</span>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{inspectPackage.project.contractWan} 万元</div>
                </div>
                <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: '11.5px', color: '#166534' }}>本包分配额度</span>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#15803d' }}>{inspectPackage.project.periodAllocatedWan} 万元</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>剩余额度</span>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{inspectPackage.project.remainingWan} 万元</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>分配人数</span>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{inspectPackage.memberSummaries.length} 人</div>
                </div>
              </div>

              <h4 style={{ fontSize: '13.5px', fontWeight: 600, marginBottom: '8px' }}>成员分配总额：</h4>
              <table className="data-table" style={{ width: '100%', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>员工姓名</th>
                    <th>专业组</th>
                    <th>职务</th>
                    <th style={{ textAlign: 'right' }}>获得绩点</th>
                    <th style={{ textAlign: 'right' }}>折合金额(万元)</th>
                    <th style={{ textAlign: 'right' }}>项目内占比</th>
                  </tr>
                </thead>
                <tbody>
                  {inspectPackage.memberSummaries.map(m => (
                    <tr key={m.employeeId}>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td>{m.group || '-'}</td>
                      <td>{m.position || '-'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>{score(m.totalPoints)}</td>
                      <td style={{ textAlign: 'right' }}>{m.totalWan.toFixed(4)}</td>
                      <td style={{ textAlign: 'right' }}>{m.ratioInProject}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-foot">
              <button className="primary" onClick={() => setInspectPackage(null)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
