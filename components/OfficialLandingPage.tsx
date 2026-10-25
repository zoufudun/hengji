'use client';
import React, { useState, useEffect } from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  BriefcaseBusiness,
  Calculator,
  Calendar,
  CalendarRange,
  Check,
  ChevronDown,
  ChevronRight,
  CircleGauge,
  Copy,
  Crown,
  Database,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FolderArchive,
  FolderKanban,
  Globe,
  HardDrive,
  Info,
  Moon,
  Package,
  Play,
  Plus,
  Save,
  ShieldCheck,
  Sliders,
  Sparkles,
  Sun,
  Table2,
  Tag,
  TrendingUp,
  Trophy,
  Users,
  ArrowRight
} from 'lucide-react';
import {
  APP_VERSION,
  APP_BUILD,
  APP_AUTHOR,
  APP_CONTACT,
  UPDATE_HISTORY,
  GITHUB_REPO,
  GITHUB_REPO_URL,
  GITHUB_RELEASES_URL,
  checkAppUpdate,
  type UpdateCheckResult,
  type VersionUpdate
} from '../lib/core';
import brandHengSeal from '../app/brand-heng-seal.png';
import brandBurstFlower from '../app/brand-burst-flower.png';

export interface OfficialLandingPageProps {
  onLaunchDemo: (initialTab?: string, workspaceType?: 'general' | 'auditor') => void;
}

type PageView = 'home' | 'docs' | 'changelog' | 'download';
type PreviewTabKey =
  | 'dashboard'
  | 'quota'
  | 'plans'
  | 'groups'
  | 'employees'
  | 'rules'
  | 'auditor'
  | 'stars'
  | 'reports'
  | 'data_io';

// 将单条版本更新的 items 智能归类为：新增 / 改进 / 修复，方便更新日志页右侧锚点导航与正文分段展示
function categorizeVersionItems(ver: VersionUpdate) {
  const added: string[] = [];
  const improved: string[] = [];
  const fixed: string[] = [];

  for (const item of ver.items) {
    if (/修复|解决|根治|消除.*报错|消除.*问题|修正/.test(item)) {
      fixed.push(item);
    } else if (/优化|升级|重构|增强|美化|加大|调整|规范/.test(item)) {
      improved.push(item);
    } else {
      added.push(item);
    }
  }
  return { added, improved, fixed };
}

export function OfficialLandingPage({ onLaunchDemo }: OfficialLandingPageProps) {
  const [pageView, setPageView] = useState<PageView>('home');
  // 支持暖羊皮纸 (parchment) 与 初始暗色翡翠主题 (dark) 一键切换
  const [theme, setTheme] = useState<'parchment' | 'dark'>('parchment');
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);

  // 首屏右侧交互式软件预览窗口状态（默认展示与真实界面一致的全景总览驾驶舱）
  const [activePreview, setActivePreview] = useState<PreviewTabKey>('dashboard');
  // 五步闭环高亮状态
  const [activeStep, setActiveStep] = useState<number>(0);

  // 更新日志页状态
  const [selectedVerIdx, setSelectedVerIdx] = useState<number>(0);

  // 下载与命令复制状态
  const [copiedKey, setCopiedKey] = useState<string>('');

  // 文档页状态
  const [docSection, setDocSection] = useState<number>(0);

  const latestVer = updateInfo?.latestVersion || APP_VERSION;
  const latestDate = UPDATE_HISTORY[0]?.date || '2026-10-25';
  const isEn = lang === 'en';

  useEffect(() => {
    checkAppUpdate(APP_VERSION)
      .then(res => setUpdateInfo(res))
      .catch(() => {});
  }, []);

  const getDownloadUrl = (format: 'setup' | 'msi' | 'portable' | 'zip', mirror = true) => {
    const filename =
      format === 'msi'
        ? `hengji-${latestVer}.msi`
        : format === 'zip'
        ? `hengji-${latestVer}.zip`
        : format === 'setup'
        ? `hengji-${latestVer}.exe`
        : `hengji-portable-${latestVer}.exe`;
    const rawUrl = `https://github.com/${GITHUB_REPO}/releases/download/v${latestVer}/${encodeURIComponent(filename)}`;
    return mirror ? `https://ghfast.top/${rawUrl}` : rawUrl;
  };

  const handleCopyText = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 1800);
    } catch {}
  };

  const navigatePage = (target: PageView) => {
    setPageView(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToHomeSection = (id: string) => {
    if (pageView !== 'home') {
      setPageView('home');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 六大实景交互模块配置（单行紧凑排列）
  const previewModules: Array<{
    key: PreviewTabKey;
    label: string;
    badge: string;
    icon: React.ReactNode;
    topbarTitle: string;
    targetTab: string;
    workspace: 'general' | 'auditor';
  }> = [
    {
      key: 'dashboard',
      label: '全景驾驶舱',
      badge: '实时监控',
      icon: <CircleGauge size={13} />,
      topbarTitle: '全景总览驾驶舱',
      targetTab: 'dashboard',
      workspace: 'general'
    },
    {
      key: 'quota',
      label: '稳健交付防透支',
      badge: '核心首创',
      icon: <Sliders size={13} />,
      topbarTitle: '项目全周期管理',
      targetTab: 'projects',
      workspace: 'general'
    },
    {
      key: 'plans',
      label: '月底集中大表',
      badge: '告别繁琐',
      icon: <CalendarRange size={13} />,
      topbarTitle: '月度绩效分配',
      targetTab: 'plans',
      workspace: 'general'
    },
    {
      key: 'auditor',
      label: '数据包流转汇总',
      badge: '离线协同',
      icon: <FolderArchive size={13} />,
      topbarTitle: '全员跨项目绩效总表',
      targetTab: 'auditor',
      workspace: 'auditor'
    },
    {
      key: 'reports',
      label: '双向闭环矩阵',
      badge: '分毫不差',
      icon: <Table2 size={13} />,
      topbarTitle: '多周期汇总报表',
      targetTab: 'reports',
      workspace: 'general'
    },
    {
      key: 'stars',
      label: '卓越绩星殿堂',
      badge: '荣誉激励',
      icon: <Trophy size={13} />,
      topbarTitle: '卓越绩星荣誉殿堂',
      targetTab: 'stars',
      workspace: 'general'
    }
  ];

  // 五步构建端到端量化绩效考核闭环
  const workflowSteps = [
    {
      step: 'STEP 01',
      title: '新建加密工作区',
      subtitle: '非系统盘存储 · 口令/免密可选',
      desc: '选择“综合管理工作区”或“绩效核算工作区”，将 .hengji 数据文件保存在 D 盘或单位保密盘，支持设置 AES-256 口令或个人电脑免密秒进。',
      previewKey: 'dashboard' as PreviewTabKey,
      demoTab: 'dashboard'
    },
    {
      step: 'STEP 02',
      title: '初始化员工与项目',
      subtitle: 'CSV 批量导入 · 财务格式自适应',
      desc: '一键初始化总体组/产品组/研发组架构，或拖拽导入单位员工花名册与工程合同台账（自动剥离千分位、货币符号与超长小数）。',
      previewKey: 'dashboard' as PreviewTabKey,
      demoTab: 'employees'
    },
    {
      step: 'STEP 03',
      title: '全周期额度防透支规划',
      subtitle: '一键稳健排期 · 常用项目组模版',
      desc: '点击项目卡片【🎯 额度规划】，一键生成“前期争取 5% → 研制发货大头 → 末月维保 5%”的防透支排期曲线，并绑定项目组默认分润比例。',
      previewKey: 'quota' as PreviewTabKey,
      demoTab: 'projects'
    },
    {
      step: 'STEP 04',
      title: '月底集中分配与发布',
      subtitle: '全项目同屏考评 · 100% 严密校验',
      desc: '在【月度绩效分配】集中大表中，一键套用当月规划额度，微调成员贡献比例（严格等于 100%），一键批量发布正式计入考核，或导出数据包给核算员。',
      previewKey: 'plans' as PreviewTabKey,
      demoTab: 'plans'
    },
    {
      step: 'STEP 05',
      title: '多维报表与荣誉殿堂',
      subtitle: '二维闭环透视 · 自动评选绩星',
      desc: '按月/季/年度或任意区间查看“人员×项目”二维透视矩阵，验证行列双向 100% 闭环，一键导出 Excel 兼容 CSV 明细并揭晓考核之星金榜。',
      previewKey: 'reports' as PreviewTabKey,
      demoTab: 'reports'
    }
  ];

  const sidebarMeta: Record<PreviewTabKey, { topbarTitle: string; targetTab: string; workspace: 'general' | 'auditor' }> = {
    dashboard: { topbarTitle: '全景总览驾驶舱', targetTab: 'dashboard', workspace: 'general' },
    quota: { topbarTitle: '项目全周期管理', targetTab: 'projects', workspace: 'general' },
    plans: { topbarTitle: '月度绩效分配', targetTab: 'plans', workspace: 'general' },
    groups: { topbarTitle: '常用项目组矩阵', targetTab: 'groups', workspace: 'general' },
    employees: { topbarTitle: '团队编制花名册', targetTab: 'employees', workspace: 'general' },
    rules: { topbarTitle: '绩效准则与规范', targetTab: 'rules', workspace: 'general' },
    auditor: { topbarTitle: '全员跨项目绩效总表', targetTab: 'auditor', workspace: 'auditor' },
    stars: { topbarTitle: '卓越绩星荣誉殿堂', targetTab: 'stars', workspace: 'general' },
    reports: { topbarTitle: '多周期汇总报表', targetTab: 'reports', workspace: 'general' },
    data_io: { topbarTitle: '数据资产与灾备中心', targetTab: 'data_io', workspace: 'general' },
  };

  const currentModule = sidebarMeta[activePreview] || sidebarMeta.dashboard;
  const currentVersionObj = UPDATE_HISTORY[selectedVerIdx] || UPDATE_HISTORY[0];
  const currentCategorized = categorizeVersionItems(currentVersionObj);

  return (
    <div className={`cc-parchment-root ${theme === 'dark' ? 'cc-dark' : ''}`}>
      {/* ==================== 网页最顶部通告条 (严格对齐图3) ==================== */}
      <div className="hj-top-announcement">
        <div className="hj-announcement-inner">
          <span className="hj-announcement-tag">NEW v{latestVer}</span>
          <span>
            衡绩 (HengJi) 全新发布：支持 MSI/EXE/ZIP 四种无终端静默部署、非系统盘安全存储与全项目数据包流转汇总！
          </span>
          <button
            type="button"
            className="hj-announcement-link"
            onClick={() => onLaunchDemo('dashboard', 'general')}
          >
            <span>立即进入在线工作台体验</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* ==================== 顶部导航栏 ==================== */}
      <header className="cc-header">
        <div className="cc-header-inner">
          {/* 左侧：彩瓣图标 + 品牌名称 + 导航菜单 */}
          <div className="cc-header-left">
            <div className="cc-brand" onClick={() => navigatePage('home')}>
              <div className="cc-brand-logos">
                <img src={brandHengSeal} alt="衡" className="cc-brand-seal" />
                <img src={brandBurstFlower} alt="衡绩" className="cc-brand-flower" />
              </div>
              <span className="cc-brand-text">{isEn ? 'HengJi' : '衡绩 HengJi'}</span>
            </div>

            <nav className="cc-nav">
              <button
                type="button"
                className={`cc-nav-link ${pageView === 'home' ? 'active' : ''}`}
                onClick={() => navigatePage('home')}
              >
                {isEn ? 'Home' : '首页'}
              </button>
              <button
                type="button"
                className={`cc-nav-link ${pageView === 'docs' ? 'active' : ''}`}
                onClick={() => navigatePage('docs')}
              >
                {isEn ? 'Docs' : '文档'}
              </button>
              <button
                type="button"
                className={`cc-nav-link ${pageView === 'changelog' ? 'active' : ''}`}
                onClick={() => navigatePage('changelog')}
              >
                {isEn ? 'Changelog' : '更新日志'}
              </button>
              <button
                type="button"
                className={`cc-nav-link ${pageView === 'download' ? 'active' : ''}`}
                onClick={() => navigatePage('download')}
              >
                {isEn ? 'Download' : '免费下载'}
              </button>
              <button
                type="button"
                className="cc-nav-link cc-nav-demo-pill"
                onClick={() => onLaunchDemo('dashboard', 'general')}
              >
                <Play size={12} fill="currentColor" />
                <span>{isEn ? 'Live Demo' : '在线体验'}</span>
              </button>
            </nav>
          </div>

          {/* 右侧：语言切换 + 暖羊皮纸/初始暗色主题切换 + GitHub 图标 */}
          <div className="cc-header-right">
            <button
              type="button"
              className="cc-lang-pill"
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              title="切换语言 / Switch Language"
            >
              <Globe size={15} />
              <span>{lang === 'zh' ? 'CN' : 'EN'}</span>
            </button>

            <button
              type="button"
              className="cc-theme-btn"
              onClick={() => setTheme(theme === 'parchment' ? 'dark' : 'parchment')}
              title={theme === 'parchment' ? '切换至深色翡翠主题' : '切换至暖羊皮纸主题'}
            >
              {theme === 'parchment' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cc-github-icon-link"
              title="GitHub Repository"
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* ==================== 视图 1：首页 ==================== */}
      {pageView === 'home' && (
        <main className="cc-home-scroll-container">
          {/* 首屏：左右分栏布局 */}
          <section className="cc-hero-split-section">
            <div className="cc-hero-glow cc-glow-1" />
            <div className="cc-hero-glow cc-glow-2" />

            <div className="cc-hero-split">
              {/* 左栏：品牌价值主张 + 核心标语 + 操作按钮 (已按要求删除图5的四枚底部小徽章) */}
              <div className="cc-hero-left">
                <button
                  type="button"
                  className="cc-release-badge"
                  onClick={() => navigatePage('changelog')}
                  title="点击查看版本更新日志"
                >
                  <Sparkles size={13} className="cc-badge-spark" />
                  <span>🎉 v{latestVer} {isEn ? 'Released' : '正式发布'}</span>
                  <span className="cc-badge-sep">|</span>
                  <span className="cc-badge-hl">离线加密 · 稳健防透支 · 双向闭环</span>
                </button>

                <div className="cc-hero-brand-row">
                  <div className="cc-hero-dual-logos">
                    <img src={brandHengSeal} alt="衡" className="cc-hero-seal" />
                    <img src={brandBurstFlower} alt="衡绩" className="cc-hero-logo" />
                  </div>
                  <div>
                    <h1>{isEn ? 'HengJi' : '衡绩'}</h1>
                    <span className="cc-hero-en-sub">Engineering & R&D Merit Evaluation Platform</span>
                  </div>
                </div>

                <h2 className="cc-hero-slogan">
                  让每一份项目贡献，<span className="cc-gradient-accent">都有据可衡</span>
                </h2>

                <p className="cc-hero-tagline">
                  {isEn
                    ? 'Unify and manage your engineering project and team merit evaluation workflow.'
                    : '统一管理你的工程项目与团队绩效考核工作流'}
                </p>

                <p className="cc-hero-subdesc">
                  专为多项目、长周期、跨专业组（总体组 / 产品组 / 研发组）团队打造。将
                  <strong>合同总额管控、全周期前低后高防透支规划、月底集中考评分配、跨项目数据包流转汇总与卓越绩星评选</strong>
                  融为一体，告别繁琐易错的 Excel 手工台账，构建分毫不差的端到端量化考核闭环。
                </p>

                <div className="cc-hero-buttons">
                  <button
                    type="button"
                    className="cc-btn-terracotta"
                    onClick={() => onLaunchDemo('dashboard', 'general')}
                  >
                    <Play size={16} fill="currentColor" />
                    <div className="cc-btn-col">
                      <strong>{isEn ? 'Try Online Now' : '立即在线体验软件'}</strong>
                      <small>免安装 · 浏览器直接运行完整工作台</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="cc-btn-outline"
                    onClick={() => scrollToHomeSection('home-download-sec')}
                  >
                    <Download size={16} />
                    <div className="cc-btn-col">
                      <strong>{isEn ? 'Download Windows App' : '下载 Windows 桌面离线版'}</strong>
                      <small>v{latestVer} · 支持 EXE / MSI / 便携版 / ZIP</small>
                    </div>
                  </button>
                </div>

                {/* 左栏底部核心保障指标矩阵（填充下方留白，与右侧真实软件界面等高对齐，大气美观） */}
                <div className="cc-hero-stats-grid">
                  <div className="cc-hero-stat-card" onClick={() => setActivePreview('data_io')}>
                    <div className="cc-stat-icon"><ShieldCheck size={16} /></div>
                    <div>
                      <strong>AES-256 离线加密</strong>
                      <span>非系统盘存储 · 自动镜像备份</span>
                    </div>
                  </div>
                  <div className="cc-hero-stat-card" onClick={() => setActivePreview('quota')}>
                    <div className="cc-stat-icon"><Sliders size={16} /></div>
                    <div>
                      <strong>前低后高防透支</strong>
                      <span>5% 争取 · 交付大头 · 5% 维保</span>
                    </div>
                  </div>
                  <div className="cc-hero-stat-card" onClick={() => setActivePreview('reports')}>
                    <div className="cc-stat-icon"><Table2 size={16} /></div>
                    <div>
                      <strong>100% 双向严密闭环</strong>
                      <span>BigInt 精确到分 · 零浮点尾差</span>
                    </div>
                  </div>
                  <div className="cc-hero-stat-card" onClick={() => setActivePreview('auditor')}>
                    <div className="cc-stat-icon"><FolderArchive size={16} /></div>
                    <div>
                      <strong>跨项目数据包流转</strong>
                      <span>综合管理台 · 核算员汇总双视角</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 右栏：图2单行六大模块切换栏 + 图1与实际软件界面 1:1 保持一致的窗口 */}
              <div className="cc-hero-right">
                {/* 图2：单行紧凑排列的六大模块切换栏 */}
                <div className="hj-preview-tabs-bar">
                  {previewModules.map(mod => (
                    <button
                      key={mod.key}
                      type="button"
                      className={`hj-preview-tab-btn ${activePreview === mod.key ? 'active' : ''}`}
                      onClick={() => setActivePreview(mod.key)}
                    >
                      {mod.icon}
                      <span>{mod.label}</span>
                      <em className="hj-preview-tab-badge">{mod.badge}</em>
                    </button>
                  ))}
                </div>

                {/* 图1：与实际软件界面 (DesktopWorkspace) 100% 保持一致的真实界面窗口 */}
                <div className="hj-mockup-window">
                  <div className="hj-mockup-body">
                    {/* 真实软件左侧深绿导航栏 (复刻 aside.sidebar) */}
                    <div className="hj-real-sidebar">
                      <div className="hj-real-brand">
                        <div className="hj-real-dual-logo">
                          <img src={brandHengSeal} alt="衡" className="seal-img" />
                          <img src={brandBurstFlower} alt="" className="flower-badge" />
                        </div>
                        <strong>衡绩考核</strong>
                      </div>

                      <div className="hj-real-mode-switch">
                        <button
                          type="button"
                          className={activePreview !== 'auditor' ? 'active' : ''}
                          onClick={() => setActivePreview('dashboard')}
                        >
                          <BriefcaseBusiness size={11} />
                          <span>综合管理台</span>
                        </button>
                        <button
                          type="button"
                          className={activePreview === 'auditor' ? 'active auditor' : ''}
                          onClick={() => setActivePreview('auditor')}
                        >
                          <Calculator size={11} />
                          <span>核算员汇总</span>
                        </button>
                      </div>

                      <div className="hj-real-sec-title">核心业务矩阵</div>
                      <div className="hj-real-nav">
                        <button
                          type="button"
                          className={activePreview === 'dashboard' ? 'active' : ''}
                          onClick={() => setActivePreview('dashboard')}
                        >
                          <CircleGauge size={14} />
                          <span>全景总览驾驶舱</span>
                          <ChevronRight size={12} />
                        </button>
                        <button
                          type="button"
                          className={activePreview === 'quota' ? 'active' : ''}
                          onClick={() => setActivePreview('quota')}
                        >
                          <BriefcaseBusiness size={14} />
                          <span>项目全周期管理</span>
                          <ChevronRight size={12} />
                        </button>
                        <button
                          type="button"
                          className={activePreview === 'plans' ? 'active' : ''}
                          onClick={() => setActivePreview('plans')}
                        >
                          <CalendarRange size={14} />
                          <span>月度绩效分配</span>
                          <ChevronRight size={12} />
                        </button>
                        <button
                          type="button"
                          className={activePreview === 'groups' ? 'active' : ''}
                          onClick={() => setActivePreview('groups')}
                        >
                          <FolderKanban size={14} />
                          <span>常用项目组矩阵</span>
                          <ChevronRight size={12} />
                        </button>
                        <button
                          type="button"
                          className={activePreview === 'employees' ? 'active' : ''}
                          onClick={() => setActivePreview('employees')}
                        >
                          <Users size={14} />
                          <span>团队编制花名册</span>
                          <ChevronRight size={12} />
                        </button>
                      </div>

                      <div className="hj-real-sec-title">效能分析与荣誉殿堂</div>
                      <div className="hj-real-nav">
                        <button
                          type="button"
                          className={activePreview === 'rules' ? 'active' : ''}
                          onClick={() => setActivePreview('rules')}
                        >
                          <BookOpenCheck size={14} />
                          <span>绩效准则与规范</span>
                          <ChevronRight size={12} />
                        </button>
                        <button
                          type="button"
                          className={activePreview === 'auditor' ? 'active' : ''}
                          onClick={() => setActivePreview('auditor')}
                        >
                          <Calculator size={14} />
                          <span>全员跨项目总表</span>
                          <ChevronRight size={12} />
                        </button>
                        <button
                          type="button"
                          className={activePreview === 'stars' ? 'active' : ''}
                          onClick={() => setActivePreview('stars')}
                        >
                          <Trophy size={14} />
                          <span>卓越绩星荣誉殿堂</span>
                          <ChevronRight size={12} />
                        </button>
                        <button
                          type="button"
                          className={activePreview === 'reports' ? 'active' : ''}
                          onClick={() => setActivePreview('reports')}
                        >
                          <BarChart3 size={14} />
                          <span>多周期汇总报表</span>
                          <ChevronRight size={12} />
                        </button>
                        <button
                          type="button"
                          className={activePreview === 'data_io' ? 'active' : ''}
                          onClick={() => setActivePreview('data_io')}
                        >
                          <FileSpreadsheet size={14} />
                          <span>数据资产与灾备中心</span>
                          <ChevronRight size={12} />
                        </button>
                      </div>

                      <div className="hj-real-sidebar-foot">
                        <Database size={13} />
                        <div>
                          <span>在线交互演示工作区</span>
                          <small>D:\衡绩工作区.hengji</small>
                        </div>
                      </div>
                      <div className="hj-real-sidebar-ver">
                        <span>v{APP_VERSION}</span>
                        <div>
                          <span><BookOpen size={10} /> 操作手册</span>
                          <span><Info size={10} /> 关于</span>
                        </div>
                      </div>
                    </div>

                    {/* 真实软件右侧主工作区 (复刻 header.topbar + div.page) */}
                    <div className="hj-real-main">
                      {/* 顶部操作栏 (复刻 header.topbar) */}
                      <div className="hj-real-topbar">
                        <div className="hj-real-topbar-left">
                          <span className="eyebrow">MERIT EVALUATION SYSTEM</span>
                          <strong>{currentModule.topbarTitle}</strong>
                        </div>
                        <div className="hj-real-topbar-right">
                          <div className="hj-real-user-badge" onClick={() => onLaunchDemo(currentModule.targetTab, currentModule.workspace)}>
                            <span className="avatar">任</span>
                            <b>任某某</b>
                            <span className="role-tag">👑 系统管理员</span>
                            <ChevronDown size={10} />
                          </div>
                          <button type="button" className="hj-real-top-btn" onClick={() => setActivePreview('data_io')}>
                            <Save size={11} /> 另存为
                          </button>
                          <button type="button" className="hj-real-top-btn guide" onClick={() => setActivePreview('rules')}>
                            <Sparkles size={11} /> 新手引导
                          </button>
                          <button
                            type="button"
                            className="hj-real-top-btn auditor-switch"
                            onClick={() => setActivePreview(activePreview === 'auditor' ? 'dashboard' : 'auditor')}
                          >
                            <Calculator size={11} /> {activePreview === 'auditor' ? '切换综合管理台' : '切换核算员汇总'}
                          </button>
                          <button
                            type="button"
                            className="hj-real-top-btn launch"
                            onClick={() => onLaunchDemo(currentModule.targetTab, currentModule.workspace)}
                          >
                            <span>全屏进入真实操作</span>
                            <ExternalLink size={11} />
                          </button>
                        </div>
                      </div>

                      {/* 真实软件页面画布 (复刻 div.page) */}
                      <div className="hj-real-page">
                        {/* 1. 全景总览驾驶舱 (与实际 DashboardView 1:1 完全一致) */}
                        {activePreview === 'dashboard' && (
                          <>
                            <div className="hj-real-hero-card">
                              <div className="hj-real-hero-left">
                                <span className="eyebrow">EQUITY &amp; MERIT PERFORMANCE</span>
                                <h3>衡绩绩点考核，<em>科学衡量每一份项目贡献。</em></h3>
                                <p>从项目合同金额出发，支持多周期额度监控、月度/季度/年度之星评选、趋势图与柱状图分析、专业组分类及 CSV 数据导入导出。</p>
                                <div className="hj-real-hero-btns">
                                  <button type="button" className="primary" onClick={() => setActivePreview('quota')}>
                                    <Plus size={12} /> 新建项目
                                  </button>
                                  <button type="button" className="secondary" onClick={() => setActivePreview('stars')}>
                                    <Trophy size={12} /> 查看考核之星
                                  </button>
                                  <button type="button" className="secondary" onClick={() => setActivePreview('reports')}>
                                    <TrendingUp size={12} /> 趋势与汇总表
                                  </button>
                                </div>
                              </div>
                              <div className="hj-real-formula-card">
                                <span>考核核心规则</span>
                                <strong>月度预算 × 成员当月分配率</strong>
                                <div><b>100%</b><small>项目各月额度比例最终合计</small></div>
                                <div><b>100%</b><small>每月项目成员比例严格分配</small></div>
                                <div><b>3 大组</b><small>总体组 · 产品组 · 研发组</small></div>
                              </div>
                            </div>

                            <div className="hj-real-metrics-row">
                              <div className="hj-real-metric-item">
                                <span>执行中项目</span>
                                <strong>8</strong>
                                <small>项目库共 8 项</small>
                              </div>
                              <div className="hj-real-metric-item">
                                <span>合同总额</span>
                                <strong>1,280.00 <i>万元</i></strong>
                                <small>全部项目含税总合同额</small>
                              </div>
                              <div className="hj-real-metric-item">
                                <span>本月已发布绩点</span>
                                <strong>102.00 <i>万元</i></strong>
                                <small>3 个月度计划已生效</small>
                              </div>
                              <div className="hj-real-metric-item">
                                <span>团队部门成员</span>
                                <strong>18 <i>人</i></strong>
                                <small>覆盖总体组、产品组与研发组</small>
                              </div>
                            </div>

                            <div className="hj-real-split-row">
                              <div className="hj-real-panel">
                                <div className="hj-real-panel-head">
                                  <div>
                                    <span>HONOR &amp; STARS</span>
                                    <h4>本月之星 🌟 与年度领跑</h4>
                                  </div>
                                  <button type="button" onClick={() => setActivePreview('stars')}>进入荣誉殿堂</button>
                                </div>
                                <div className="hj-real-star-cards">
                                  <div className="hj-real-star-box yellow">
                                    <span className="star-ico">🌟</span>
                                    <div>
                                      <small>本月之星 (2026-05)</small>
                                      <b>王某某</b>
                                      <em>获得 24.80 万元绩点 · 研发组</em>
                                    </div>
                                  </div>
                                  <div className="hj-real-star-box slate">
                                    <span className="star-ico">👑</span>
                                    <div>
                                      <small>年度之星领跑 (2026年)</small>
                                      <b>任某某</b>
                                      <em>累计 168.50 万元绩点 · 总体组</em>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="hj-real-panel">
                                <div className="hj-real-panel-head">
                                  <div>
                                    <span>MONTHLY RANKING</span>
                                    <h4>2026-05 个人绩点前五名</h4>
                                  </div>
                                  <button type="button" onClick={() => setActivePreview('reports')}>查看完整报表</button>
                                </div>
                                <div className="hj-real-rank-list">
                                  {[
                                    { rank: 1, name: '王某某', grp: '研发组', pts: '24.80 万元', pct: 100 },
                                    { rank: 2, name: '任某某', grp: '总体组', pts: '22.20 万元', pct: 90 },
                                    { rank: 3, name: '陈某某', grp: '产品组', pts: '18.90 万元', pct: 76 },
                                    { rank: 4, name: '赵某某', grp: '总体组', pts: '14.40 万元', pct: 58 },
                                    { rank: 5, name: '孙某某', grp: '产品组', pts: '12.60 万元', pct: 51 },
                                  ].map(r => (
                                    <div key={r.rank} className="hj-real-rank-item">
                                      <span className={`rk-num rk-${r.rank}`}>{r.rank}</span>
                                      <b className="rk-name">{r.name}</b>
                                      <span className="rk-grp">{r.grp}</span>
                                      <div className="rk-bar-track">
                                        <div className="rk-bar-fill" style={{ width: `${r.pct}%` }} />
                                      </div>
                                      <strong className="rk-val">{r.pts}</strong>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {/* 2. 稳健交付防透支排期预览 */}
                        {activePreview === 'quota' && (
                          <div className="hj-mock-panel">
                            <div className="hj-mock-quota-curve">
                              <div className="hj-quota-stage-card stage-bidding">
                                <div className="stage-badge">阶段一：前期项目争取</div>
                                <strong>首月 0% ~ 10% 可调（默认 5%）</strong>
                                <p>严控立项初期过早透支额度，仅发放前期论证与竞标争取基础激励。</p>
                              </div>
                              <div className="hj-quota-arrow">→</div>
                              <div className="hj-quota-stage-card stage-normal">
                                <div className="stage-badge">阶段二：主体研制与成品发货</div>
                                <strong>前低后高递增 · 交付大头 45%+</strong>
                                <p>随初样、正样推进逐步爬坡，将核心绩效锁定在成品顺利发货与验收节点。</p>
                              </div>
                              <div className="hj-quota-arrow">→</div>
                              <div className="hj-quota-stage-card stage-maint">
                                <div className="stage-badge">阶段三：售后维保阶段</div>
                                <strong>末月强制锁定保留 5%</strong>
                                <p>质保期满无重大质量问题后予以核销，彻底杜绝“前期分光、后期无人维护”。</p>
                              </div>
                            </div>

                            <div className="hj-mock-table-wrap">
                              <table className="hj-mock-table">
                                <thead>
                                  <tr>
                                    <th>考核月份</th>
                                    <th>排期阶段属性</th>
                                    <th>规划分配比例</th>
                                    <th>当月规划额度 (万元)</th>
                                    <th>实际核销状态</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>2026-01</td>
                                    <td><span className="hj-stage-tag bidding">前期争取阶段</span></td>
                                    <td><strong>5.00%</strong> (上限 10%)</td>
                                    <td>18.00 万元</td>
                                    <td><span className="hj-status-pill ok">✓ 已核销发布</span></td>
                                  </tr>
                                  <tr>
                                    <td>2026-02 ~ 04</td>
                                    <td><span className="hj-stage-tag normal">正常研制阶段 (前低后高)</span></td>
                                    <td><strong>10% → 12% → 13%</strong></td>
                                    <td>126.00 万元</td>
                                    <td><span className="hj-status-pill ok">✓ 稳健推进中</span></td>
                                  </tr>
                                  <tr>
                                    <td>2026-05</td>
                                    <td><span className="hj-stage-tag delivery">★ 成品发货与终验节点</span></td>
                                    <td><strong>55.00% (核心大头)</strong></td>
                                    <td>198.00 万元</td>
                                    <td><span className="hj-status-pill blue">待验收发放</span></td>
                                  </tr>
                                  <tr>
                                    <td>2026-06</td>
                                    <td><span className="hj-stage-tag maint">售后维保储备期</span></td>
                                    <td><strong>5.00% (强制保留)</strong></td>
                                    <td>18.00 万元</td>
                                    <td><span className="hj-status-pill warn">🔒 维保期锁定</span></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* 3. 月底集中大表预览 */}
                        {activePreview === 'plans' && (
                          <div className="hj-mock-panel">
                            <div className="hj-mock-toolbar">
                              <span>📅 当前考评月份：<strong>2026-05</strong>（全项目当月集中透视表）</span>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <span className="hj-mock-btn-chip">⚡ 一键套用当月规划比例</span>
                                <span className="hj-mock-btn-chip primary">🚀 一键批量发布全部合格方案</span>
                              </div>
                            </div>
                            <div className="hj-mock-table-wrap">
                              <table className="hj-mock-table">
                                <thead>
                                  <tr>
                                    <th>项目名称 / 工作令号</th>
                                    <th>合同总额</th>
                                    <th>当月项目分配率</th>
                                    <th>当月可分池</th>
                                    <th>项目成员配比校验 (合计必须=100%)</th>
                                    <th>状态</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td><b>某型综合光电探测系统</b> (GF-2026-01)</td>
                                    <td>360.00 万</td>
                                    <td><strong>15.00%</strong></td>
                                    <td><strong>54.00 万</strong></td>
                                    <td>任某某 35% (18.90万) · 陈某某 25% (13.50万) · 王某某等4人 40%</td>
                                    <td><span className="hj-status-pill ok">100% 校验通过</span></td>
                                  </tr>
                                  <tr>
                                    <td><b>高精度伺服控制模块</b> (GF-2026-02)</td>
                                    <td>180.00 万</td>
                                    <td><strong>20.00%</strong></td>
                                    <td><strong>36.00 万</strong></td>
                                    <td>陈某某 40% (14.40万) · 李某某 35% (12.60万) · 赵某某 25% (9.00万)</td>
                                    <td><span className="hj-status-pill ok">100% 校验通过</span></td>
                                  </tr>
                                  <tr>
                                    <td><b>边缘计算载荷算法升级</b> (KY-2026-05)</td>
                                    <td>120.00 万</td>
                                    <td><strong>10.00%</strong></td>
                                    <td><strong>12.00 万</strong></td>
                                    <td>王某某 45% (5.40万) · 张某某等3人 55% (6.60万)</td>
                                    <td><span className="hj-status-pill ok">100% 校验通过</span></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* 4. 常用项目组矩阵预览 (左侧栏第4项) */}
                        {activePreview === 'groups' && (
                          <div className="hj-mock-panel">
                            <div className="hj-mock-toolbar">
                              <span>🗂️ 常用项目组与默认分配比例模版（立项或月度考评时可一键套用）</span>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <span className="hj-mock-btn-chip">📥 批量导入项目组 CSV</span>
                                <span className="hj-mock-btn-chip primary">＋ 新建常用项目组模版</span>
                              </div>
                            </div>
                            <div className="hj-mock-table-wrap">
                              <table className="hj-mock-table">
                                <thead>
                                  <tr>
                                    <th>项目组模版名称</th>
                                    <th>默认项目负责人</th>
                                    <th>团队人数</th>
                                    <th>预设成员默认分配比例 (合计=100%)</th>
                                    <th>关联在研项目</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td><b>光电系统总体攻坚组</b></td>
                                    <td><b>任某某</b> (总体组)</td>
                                    <td>5 人</td>
                                    <td>任某某 35% · 陈某某 25% · 王某某 20% · 赵某某 12% · 孙某某 8%</td>
                                    <td><span className="hj-status-pill ok">已关联 3 项</span></td>
                                  </tr>
                                  <tr>
                                    <td><b>高精度伺服产品批产组</b></td>
                                    <td><b>陈某某</b> (产品组)</td>
                                    <td>4 人</td>
                                    <td>陈某某 40% · 李某某 30% · 周某某 18% · 吴某某 12%</td>
                                    <td><span className="hj-status-pill ok">已关联 3 项</span></td>
                                  </tr>
                                  <tr>
                                    <td><b>智能边缘算法专项组</b></td>
                                    <td><b>王某某</b> (研发组)</td>
                                    <td>4 人</td>
                                    <td>王某某 45% · 张某某 25% · 刘某某 18% · 郑某某 12%</td>
                                    <td><span className="hj-status-pill ok">已关联 2 项</span></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* 5. 团队编制花名册预览 (左侧栏第5项) */}
                        {activePreview === 'employees' && (
                          <div className="hj-mock-panel">
                            <div className="hj-mock-toolbar">
                              <span>👥 部门员工编制花名册：共 <strong>18</strong> 人（总体组 5 人 · 产品组 6 人 · 研发组 7 人）</span>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <span className="hj-mock-btn-chip">📥 导入花名册 CSV</span>
                                <span className="hj-mock-btn-chip primary">＋ 新增部门成员</span>
                              </div>
                            </div>
                            <div className="hj-mock-table-wrap">
                              <table className="hj-mock-table">
                                <thead>
                                  <tr>
                                    <th>唯一工号</th>
                                    <th>姓名</th>
                                    <th>所属专业组</th>
                                    <th>专业组内职务</th>
                                    <th>系统角色权限</th>
                                    <th>参评项目数</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td><code>EMP-001</code></td>
                                    <td><b>任某某</b></td>
                                    <td>总体组</td>
                                    <td>总体组组长 / 型号总师</td>
                                    <td><span className="hj-status-pill warn">👑 系统管理员</span></td>
                                    <td>5 个项目</td>
                                  </tr>
                                  <tr>
                                    <td><code>EMP-005</code></td>
                                    <td><b>陈某某</b></td>
                                    <td>产品组</td>
                                    <td>产品组主任工程师</td>
                                    <td><span className="hj-status-pill blue">💼 项目负责人</span></td>
                                    <td>4 个项目</td>
                                  </tr>
                                  <tr>
                                    <td><code>EMP-012</code></td>
                                    <td><b>王某某</b></td>
                                    <td>研发组</td>
                                    <td>核心算法主任设计师</td>
                                    <td><span className="hj-status-pill blue">💼 项目负责人</span></td>
                                    <td>4 个项目</td>
                                  </tr>
                                  <tr>
                                    <td><code>EMP-016</code></td>
                                    <td><b>赵某某</b></td>
                                    <td>总体组</td>
                                    <td>高级总体设计师</td>
                                    <td><span className="hj-status-pill ok">📊 绩效核算员</span></td>
                                    <td>3 个项目</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* 6. 绩效准则与规范预览 (左侧栏第6项) */}
                        {activePreview === 'rules' && (
                          <div className="hj-mock-panel">
                            <div className="hj-mock-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                              <div className="hj-mock-kpi-card emerald">
                                <span>合同额 &lt; 50 万元</span>
                                <strong>负责人参考占比 60% – 90%</strong>
                                <em>小型专项或技术服务合同，负责人承担主体研制与交付</em>
                              </div>
                              <div className="hj-mock-kpi-card blue">
                                <span>50 ≤ 合同额 &lt; 500 万元</span>
                                <strong>负责人参考占比 30% – 60%</strong>
                                <em>中型工程研制项目，兼顾负责人统筹与骨干团队协同激励</em>
                              </div>
                              <div className="hj-mock-kpi-card amber">
                                <span>合同额 ≥ 500 万元</span>
                                <strong>负责人参考占比 10% – 30%</strong>
                                <em>大型重点型号工程，更大比例向总体/产品/研发多组参研人员倾斜</em>
                              </div>
                            </div>
                            <div className="hj-mock-table-wrap">
                              <table className="hj-mock-table">
                                <thead>
                                  <tr>
                                    <th>核心考核规范条目</th>
                                    <th>刚性/柔性控制口径</th>
                                    <th>计算公式与校验标准</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td><b>月度个人绩点核算公式</b></td>
                                    <td><span className="hj-status-pill ok">BigInt 精确到分</span></td>
                                    <td>个人当月绩点 = 项目合同总额 × 当月项目分配比例(%) × 成员当月分配率(%)</td>
                                  </tr>
                                  <tr>
                                    <td><b>全周期防透支三段式排期</b></td>
                                    <td><span className="hj-status-pill blue">核心防透支规范</span></td>
                                    <td>前期争取阶段 0~10%（默认5%） → 主体研制与发货交付大头 → 末月售后维保保留 5%</td>
                                  </tr>
                                  <tr>
                                    <td><b>当月成员比例与项目总额守恒</b></td>
                                    <td><span className="hj-status-pill warn">100% 刚性拦截</span></td>
                                    <td>当月参评成员分配比例合计必须严格等于 100%；项目各月累计分配不可超过 100%</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* 7. 核算员数据包流转汇总预览 */}
                        {activePreview === 'auditor' && (
                          <div className="hj-mock-panel">
                            <div className="hj-mock-toolbar">
                              <span>📦 核算员跨项目数据包归集中心：已导入 <strong>3</strong> 位项目负责人提交的 <strong>8</strong> 个项目数据包</span>
                              <span className="hj-mock-btn-chip primary">📊 导出全员跨项目汇总 CSV</span>
                            </div>
                            <div className="hj-mock-table-wrap">
                              <table className="hj-mock-table">
                                <thead>
                                  <tr>
                                    <th>工号 / 唯一标识</th>
                                    <th>员工姓名</th>
                                    <th>所属专业组</th>
                                    <th>参评项目数</th>
                                    <th>各项目绩点构成明细</th>
                                    <th>个人累计总绩点</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td><code>EMP-001</code></td>
                                    <td><b>任某某</b></td>
                                    <td>总体组 (组长)</td>
                                    <td>4 个项目</td>
                                    <td>光电系统 18.90万 + 导航终端 8.40万 + 论证专项 4.20万...</td>
                                    <td><strong className="hj-accent-pts">34.50 万元</strong></td>
                                  </tr>
                                  <tr>
                                    <td><code>EMP-005</code></td>
                                    <td><b>陈某某</b></td>
                                    <td>产品组 (骨干)</td>
                                    <td>3 个项目</td>
                                    <td>光电系统 13.50万 + 伺服模块 14.40万 + 批产保障 3.10万</td>
                                    <td><strong className="hj-accent-pts">31.00 万元</strong></td>
                                  </tr>
                                  <tr>
                                    <td><code>EMP-012</code></td>
                                    <td><b>王某某</b></td>
                                    <td>研发组 (主任设计师)</td>
                                    <td>3 个项目</td>
                                    <td>边缘算法 5.40万 + 光电系统 10.80万 + 预研课题 6.20万</td>
                                    <td><strong className="hj-accent-pts">22.40 万元</strong></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* 8. 双向闭环二维矩阵预览 */}
                        {activePreview === 'reports' && (
                          <div className="hj-mock-panel">
                            <div className="hj-mock-toolbar">
                              <span>📐 周期二维透视矩阵（横向【个人累加】与纵向【项目累加】双向 100% 严密闭环）</span>
                              <span className="hj-mock-tag green">BigInt 精确到分 · 零尾差</span>
                            </div>
                            <div className="hj-mock-table-wrap">
                              <table className="hj-mock-table">
                                <thead>
                                  <tr>
                                    <th>序号</th>
                                    <th>姓名</th>
                                    <th>光电探测系统 (GF-01)</th>
                                    <th>伺服控制模块 (GF-02)</th>
                                    <th>边缘计算算法 (KY-05)</th>
                                    <th>横向：个人累加 (万元)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>1</td>
                                    <td><b>任某某</b></td>
                                    <td>18.90</td>
                                    <td>0.00</td>
                                    <td>3.30</td>
                                    <td><strong>22.20</strong></td>
                                  </tr>
                                  <tr>
                                    <td>2</td>
                                    <td><b>陈某某</b></td>
                                    <td>13.50</td>
                                    <td>14.40</td>
                                    <td>0.00</td>
                                    <td><strong>27.90</strong></td>
                                  </tr>
                                  <tr>
                                    <td>3</td>
                                    <td><b>王某某</b></td>
                                    <td>21.60</td>
                                    <td>21.60</td>
                                    <td>8.70</td>
                                    <td><strong>51.90</strong></td>
                                  </tr>
                                  <tr className="hj-mock-sum-row">
                                    <td>—</td>
                                    <td><b>纵向：项目累加</b></td>
                                    <td><strong>54.00</strong></td>
                                    <td><strong>36.00</strong></td>
                                    <td><strong>12.00</strong></td>
                                    <td><strong className="hj-accent-pts">总计闭环：102.00 万</strong></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* 9. 卓越绩星殿堂预览 */}
                        {activePreview === 'stars' && (
                          <div className="hj-mock-panel">
                            <div className="hj-mock-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                              <div className="hj-mock-kpi-card amber">
                                <span>👑 年度功勋领航之星 (TOP 1)</span>
                                <strong>任某某 · 总体组</strong>
                                <em>年度累计斩获 168.50 万绩点 · 领衔 5 项重大工程交付</em>
                              </div>
                              <div className="hj-mock-kpi-card emerald">
                                <span>🏆 季度卓越攻坚标兵</span>
                                <strong>陈某某 · 产品组</strong>
                                <em>本季累计贡献 64.20 万绩点 · 核心型号批产按期交付</em>
                              </div>
                              <div className="hj-mock-kpi-card blue">
                                <span>🌟 月度领跑之星</span>
                                <strong>王某某 · 研发组</strong>
                                <em>当月斩获 24.80 万绩点 · 算法联调与外场试验突出贡献</em>
                              </div>
                            </div>
                            <div className="hj-mock-table-wrap">
                              <table className="hj-mock-table">
                                <thead>
                                  <tr>
                                    <th>荣誉奖牌</th>
                                    <th>获奖人</th>
                                    <th>所属专业组</th>
                                    <th>代表贡献项目</th>
                                    <th>累计核定绩点</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>🥇 冠军金奖</td>
                                    <td><b>任某某</b></td>
                                    <td>总体组</td>
                                    <td>某型综合光电探测系统研制 (GF-2026-01)</td>
                                    <td><strong className="hj-accent-pts">168.50 万元</strong></td>
                                  </tr>
                                  <tr>
                                    <td>🥈 亚军银奖</td>
                                    <td><b>陈某某</b></td>
                                    <td>产品组</td>
                                    <td>高精度伺服控制模块批产交付 (GF-2026-02)</td>
                                    <td><strong className="hj-accent-pts">142.30 万元</strong></td>
                                  </tr>
                                  <tr>
                                    <td>🥉 季军铜奖</td>
                                    <td><b>王某某</b></td>
                                    <td>研发组</td>
                                    <td>智能边缘计算载荷算法软件升级 (KY-2026-05)</td>
                                    <td><strong className="hj-accent-pts">128.90 万元</strong></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* 10. 数据资产与灾备中心预览 (左侧栏第10项) */}
                        {activePreview === 'data_io' && (
                          <div className="hj-mock-panel">
                            <div className="hj-mock-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                              <div className="hj-mock-kpi-card emerald">
                                <span>🔒 AES-256-GCM 加密容器</span>
                                <strong>D:\衡绩工作区.hengji</strong>
                                <em>PBKDF2 10万次加盐迭代 · 非系统盘安全持久化</em>
                              </div>
                              <div className="hj-mock-kpi-card blue">
                                <span>📦 跨项目离线数据包</span>
                                <strong>一键导出项目合包 (.json)</strong>
                                <em>项目负责人一键打包名下项目，供专职核算员汇总</em>
                              </div>
                              <div className="hj-mock-kpi-card amber">
                                <span>🛡️ 雙重自动镜像灾备</span>
                                <strong>.hengji.backup 实时同步</strong>
                                <em>每次保存自动生成同目录热备镜像，支持全量快照恢复</em>
                              </div>
                            </div>
                            <div className="hj-mock-table-wrap">
                              <table className="hj-mock-table">
                                <thead>
                                  <tr>
                                    <th>数据资产与导入导出模块</th>
                                    <th>支持格式</th>
                                    <th>安全机制与业务说明</th>
                                    <th>快捷操作</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td><b>工程合同与员工花名册批量导入</b></td>
                                    <td><code>.csv / Excel</code></td>
                                    <td>自动清洗千分位、货币符号与超长小数，支持同令号多合同</td>
                                    <td><span className="hj-status-pill ok">高容错解析</span></td>
                                  </tr>
                                  <tr>
                                    <td><b>项目负责人绩效数据包流转</b></td>
                                    <td><code>.json 数据包</code></td>
                                    <td>按唯一工号自动归集跨项目个人绩点，严防同名混淆</td>
                                    <td><span className="hj-status-pill blue">支持合包导出</span></td>
                                  </tr>
                                  <tr>
                                    <td><b>企业级全量加密灾备快照</b></td>
                                    <td><code>.hengji.enc</code></td>
                                    <td>完整备份员工、合同、项目组模版与历月分配方案</td>
                                    <td><span className="hj-status-pill warn">口令认证保护</span></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== 滚动区块 1：为什么工程与科研团队选择「衡绩」？ (CORE CAPABILITIES) ==================== */}
          <section id="home-features-sec" className="hj-features-section">
            <div className="hj-section-container">
              <div className="hj-section-header">
                <span className="hj-section-eyebrow">CORE CAPABILITIES</span>
                <h2>为什么工程与科研团队选择「衡绩」？</h2>
                <p>针对多型号并线、跨周期交付、内网涉密与财务严密审计场景深度定制的六大核心支柱</p>
              </div>

              <div className="hj-features-grid">
                <div className="hj-feature-card">
                  <div className="hj-feature-icon emerald"><ShieldCheck size={22} /></div>
                  <h3>纯本地离线加密 · 默认非系统盘</h3>
                  <p>
                    采用 <code>PBKDF2-SHA256</code>（10万次加盐迭代）与 <code>AES-256-GCM</code> 认证加密。
                    业务数据保存在您自主指定的 D/E 盘或保密盘 <code>.hengji</code> 文件中，每次保存自动生成 <code>.backup</code> 镜像，零云端上传风险。
                  </p>
                </div>

                <div className="hj-feature-card">
                  <div className="hj-feature-icon amber"><Sliders size={22} /></div>
                  <h3>前低后高稳健排期 · 防前期透支</h3>
                  <p>
                    独创三段式全生命周期额度模型：前期项目争取阶段限高 0~10%（默认 5%），主体研制与成品发货交付锁定 45%+ 大头，末月售后维保强制保留 5%，彻底杜绝“前期分光、后期无钱”。
                  </p>
                </div>

                <div className="hj-feature-card">
                  <div className="hj-feature-icon blue"><CalendarRange size={22} /></div>
                  <h3>全项目当月集中大表 · 批量发布</h3>
                  <p>
                    告别传统系统逐个点开几十个项目的繁琐操作。月底考评时，所有在研项目集中呈现在一张透视大表，支持一键套用当月规划、快速配置团队比例（100% 校验）与一键批量发布/撤回。
                  </p>
                </div>

                <div className="hj-feature-card">
                  <div className="hj-feature-icon purple"><Calculator size={22} /></div>
                  <h3>离线数据包流转 · 专职核算员大盘</h3>
                  <p>
                    内置双工作区模式（🏢 综合管理工作区 / 📊 绩效核算工作区）。项目负责人一键导出项目数据包或名下全项目合包，核算员拖拽导入即可完成全员跨项目汇总、合同监控与审计流水核查。
                  </p>
                </div>

                <div className="hj-feature-card">
                  <div className="hj-feature-icon cyan"><Table2 size={22} /></div>
                  <h3>BigInt 精确到分 · 行列双向 100% 闭环</h3>
                  <p>
                    底层摒弃浮点数误差，全部采用整数“分”与 <code>BigInt</code> 结合最大余额法（Largest Remainder）分润。二维透视矩阵中横向个人累加与纵向项目累加分毫不差，全面兼容财务千分位 CSV 导入导出。
                  </p>
                </div>

                <div className="hj-feature-card">
                  <div className="hj-feature-icon rose"><Trophy size={22} /></div>
                  <h3>专业组协同矩阵 · 卓越绩星荣誉殿堂</h3>
                  <p>
                    深度契合“总体组、产品组、研发组”矩阵式架构，支持沉淀常用项目组默认分润模版；基于实绩自动评选月度之星、季度标兵与年度领航之星，配套冠亚季军荣誉奖牌榜。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== 滚动区块 2：五步构建端到端量化绩效考核闭环 (5-STEP WORKFLOW) ==================== */}
          <section id="home-workflow-sec" className="hj-workflow-section">
            <div className="hj-section-container">
              <div className="hj-section-header">
                <span className="hj-section-eyebrow">5-STEP END-TO-END WORKFLOW</span>
                <h2>五步构建端到端量化绩效考核闭环</h2>
                <p>清晰的标准化作业流程，5 分钟即可完成从建库、排期到月底考评与报表输出</p>
              </div>

              <div className="hj-workflow-steps">
                {workflowSteps.map((item, idx) => (
                  <div
                    key={item.step}
                    className={`hj-workflow-card ${activeStep === idx ? 'active' : ''}`}
                    onClick={() => {
                      setActiveStep(idx);
                      setActivePreview(item.previewKey);
                    }}
                  >
                    <div className="hj-wf-num">{item.step}</div>
                    <h3>{item.title}</h3>
                    <div className="hj-wf-sub">{item.subtitle}</div>
                    <p>{item.desc}</p>
                    <button
                      type="button"
                      className="hj-wf-try-link"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLaunchDemo(item.demoTab, 'general');
                      }}
                    >
                      <span>在线体验第 {idx + 1} 步</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ==================== 滚动区块 3：下载衡绩桌面离线版客户端 (DOWNLOAD & DEPLOYMENT) ==================== */}
          <section id="home-download-sec" className="hj-download-section">
            <div className="hj-section-container">
              <div className="hj-section-header">
                <span className="hj-section-eyebrow">DOWNLOAD &amp; DEPLOYMENT</span>
                <h2>下载衡绩桌面离线版客户端 (v{latestVer})</h2>
                <p>
                  提供四种 Windows 官方打包分发格式，全程原生 GUI 无终端弹窗，默认引导安装至非系统盘（D:\ / E:\），满足企业与涉密内网严苛部署要求
                </p>
              </div>

              <div className="hj-download-grid">
                {/* 1. EXE 标准安装向导版 */}
                <div className="hj-dl-card recommended">
                  <div className="hj-dl-ribbon">★ 官方推荐</div>
                  <div className="hj-dl-header">
                    <div className="hj-dl-icon blue"><Sparkles size={22} /></div>
                    <div>
                      <h3>EXE 标准安装向导版</h3>
                      <span>hengji-{latestVer}.exe · Windows x64</span>
                    </div>
                  </div>
                  <p className="hj-dl-desc">
                    基于 NSIS 的图形化标准安装程序，支持自由选择非系统盘安装路径，自动创建桌面与开始菜单快捷方式，支持平滑覆盖升级。
                  </p>
                  <div className="hj-dl-actions">
                    <a href={getDownloadUrl('setup', true)} target="_blank" rel="noopener noreferrer" className="hj-dl-btn primary">
                      <Download size={15} />
                      <span>国内高速镜像下载 (.exe)</span>
                    </a>
                    <a href={getDownloadUrl('setup', false)} target="_blank" rel="noopener noreferrer" className="hj-dl-btn ghost">
                      <span>GitHub 源站</span>
                    </a>
                  </div>
                </div>

                {/* 2. MSI 企业级安装包 */}
                <div className="hj-dl-card">
                  <div className="hj-dl-header">
                    <div className="hj-dl-icon cyan"><Package size={22} /></div>
                    <div>
                      <h3>MSI 企业级安装包</h3>
                      <span>hengji-{latestVer}.msi · Windows Installer</span>
                    </div>
                  </div>
                  <p className="hj-dl-desc">
                    原生 Windows Installer (zh-CN 中文向导) 标准包，支持自定义非系统盘目录（如 <code>D:\衡绩员工绩点考核系统</code>），适合单位域控与标准化分发。
                  </p>
                  <div className="hj-dl-actions">
                    <a href={getDownloadUrl('msi', true)} target="_blank" rel="noopener noreferrer" className="hj-dl-btn cyan">
                      <Download size={15} />
                      <span>国内高速镜像下载 (.msi)</span>
                    </a>
                    <a href={getDownloadUrl('msi', false)} target="_blank" rel="noopener noreferrer" className="hj-dl-btn ghost">
                      <span>GitHub 源站</span>
                    </a>
                  </div>
                </div>

                {/* 3. Portable 便携单文件版 */}
                <div className="hj-dl-card">
                  <div className="hj-dl-header">
                    <div className="hj-dl-icon emerald"><HardDrive size={22} /></div>
                    <div>
                      <h3>Portable 便携单文件版</h3>
                      <span>hengji-portable-{latestVer}.exe · 免安装即用</span>
                    </div>
                  </div>
                  <p className="hj-dl-desc">
                    零安装、不写注册表！单文件绿色可执行程序，放入 U 盘、移动硬盘或任意非系统盘目录双击即可直接运行，随身携带。
                  </p>
                  <div className="hj-dl-actions">
                    <a href={getDownloadUrl('portable', true)} target="_blank" rel="noopener noreferrer" className="hj-dl-btn emerald">
                      <Download size={15} />
                      <span>国内高速镜像下载 (便携版)</span>
                    </a>
                    <a href={getDownloadUrl('portable', false)} target="_blank" rel="noopener noreferrer" className="hj-dl-btn ghost">
                      <span>GitHub 源站</span>
                    </a>
                  </div>
                </div>

                {/* 4. ZIP 绿色免安装压缩包 */}
                <div className="hj-dl-card">
                  <div className="hj-dl-header">
                    <div className="hj-dl-icon orange"><FolderKanban size={22} /></div>
                    <div>
                      <h3>ZIP 绿色免安装压缩包</h3>
                      <span>hengji-{latestVer}.zip · 解压即运行</span>
                    </div>
                  </div>
                  <p className="hj-dl-desc">
                    标准 ZIP 绿色完整目录归档包，无需管理员安装权限，解压到任意磁盘目录后双击 <code>衡绩员工绩点考核系统.exe</code> 即可秒速启动。
                  </p>
                  <div className="hj-dl-actions">
                    <a href={getDownloadUrl('zip', true)} target="_blank" rel="noopener noreferrer" className="hj-dl-btn orange">
                      <Download size={15} />
                      <span>国内高速镜像下载 (.zip)</span>
                    </a>
                    <a href={getDownloadUrl('zip', false)} target="_blank" rel="noopener noreferrer" className="hj-dl-btn ghost">
                      <span>GitHub 源站</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* 源码构建命令栏 */}
              <div className="hj-dl-footer-bar">
                <div className="hj-dl-cmd-box">
                  <span className="hj-cmd-label">源码构建与本地运行：</span>
                  <code>git clone https://github.com/zoufudun/hengji.git &amp;&amp; npm ci &amp;&amp; npm run desktop:start</code>
                  <button
                    type="button"
                    className="hj-copy-btn"
                    onClick={() => handleCopyText('git clone https://github.com/zoufudun/hengji.git && npm ci && npm run desktop:start', 'cmd')}
                  >
                    {copiedKey === 'cmd' ? '✓ 已复制' : '复制命令'}
                  </button>
                </div>
                <div className="hj-dl-links">
                  <a href={GITHUB_RELEASES_URL} target="_blank" rel="noopener noreferrer">
                    <span>查看 GitHub Releases 历史版本</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== 滚动区块 4：底部行动号召卡片与三栏页脚 ==================== */}
          <footer className="hj-footer">
            <div className="hj-footer-cta">
              <h2>准备好开启高效、透明、严谨的团队绩点考核了吗？</h2>
              <p>无需注册配置服务器，立即在浏览器中体验完整功能，或下载 Windows 桌面离线版投入正式使用。</p>
              <div className="hj-footer-cta-btns">
                <button
                  type="button"
                  className="hj-cta-primary"
                  onClick={() => onLaunchDemo('dashboard', 'general')}
                >
                  <Play size={16} fill="currentColor" />
                  <span>立即在线体验衡绩系统</span>
                </button>
                <a
                  href={getDownloadUrl('setup', true)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hj-cta-secondary"
                  style={{ textDecoration: 'none' }}
                >
                  <Download size={16} />
                  <span>免费下载桌面离线客户端 (v{latestVer})</span>
                </a>
              </div>
            </div>

            <div className="hj-footer-bottom">
              <div className="hj-footer-brand">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <img src={brandHengSeal} alt="衡" width={28} height={28} style={{ borderRadius: 6 }} />
                  <img src={brandBurstFlower} alt="衡绩" width={26} height={26} />
                  <strong style={{ fontSize: '16px' }}>衡绩 · 员工绩点考核系统 (HengJi)</strong>
                </div>
                <p>让每一份项目贡献，都有据可衡。面向工程与科研团队的离线安全量化绩效管理平台。</p>
                <p style={{ marginTop: '6px', opacity: 0.75 }}>
                  开发作者：{APP_AUTHOR} · 联系邮箱：<a href={`mailto:${APP_CONTACT}`}>{APP_CONTACT}</a>
                </p>
              </div>

              <div className="hj-footer-links-col">
                <h4>快速入口</h4>
                <button type="button" onClick={() => onLaunchDemo('dashboard', 'general')}>在线体验综合管理工作台</button>
                <button type="button" onClick={() => onLaunchDemo('auditor', 'auditor')}>在线体验绩效核算员工作台</button>
                <button type="button" onClick={() => onLaunchDemo('rules', 'general')}>查看绩效考核准则与公式</button>
                <button type="button" onClick={() => navigatePage('download')}>客户端下载矩阵</button>
              </div>

              <div className="hj-footer-links-col">
                <h4>开源与资源</h4>
                <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">GitHub 源码仓库</a>
                <a href={GITHUB_RELEASES_URL} target="_blank" rel="noopener noreferrer">Releases 历史安装包</a>
                <button type="button" onClick={() => navigatePage('changelog')}>版本更新日志 (v{APP_VERSION})</button>
                <button type="button" onClick={() => navigatePage('docs')}>五步使用文档</button>
              </div>
            </div>

            <div className="hj-footer-copyright">
              <span>© {new Date().getFullYear()} 衡绩 (HengJi) Employee Merit System · Version v{APP_VERSION} ({APP_BUILD})</span>
              <span>AES-256-GCM Encrypted · Non-System Drive Storage Ready</span>
            </div>
          </footer>
        </main>
      )}

      {/* ==================== 视图 2：免费下载独立页面 ==================== */}
      {pageView === 'download' && (
        <main className="cc-download-page">
          <div className="cc-dl-hero">
            <h1>{isEn ? 'Download HengJi' : '下载 衡绩 HengJi'}</h1>
            <p className="cc-dl-sub">
              {isEn
                ? 'Offline encrypted, unify and manage your engineering team merit evaluation workflow'
                : '本地离线加密，统一管理你的工程与科研团队绩效考核工作流'}
            </p>
            <div className="cc-dl-ver-meta">
              最新版本 <b>v{latestVer}</b> · 发布于 {latestDate}
            </div>

            <a
              href={getDownloadUrl('msi', true)}
              target="_blank"
              rel="noopener noreferrer"
              className="cc-dl-main-btn"
            >
              <Download size={18} />
              <span>下载 Windows 版 · 约 82 MB</span>
            </a>

            <div className="cc-dl-hints">
              <p>不确定选哪个？大多数电脑选 <b>x64</b>（默认引导安装至 D:\ 等非系统盘）。</p>
              <p>
                想免安装直接在浏览器里试用？{' '}
                <button
                  type="button"
                  className="cc-inline-link"
                  onClick={() => onLaunchDemo('dashboard', 'general')}
                >
                  点击立即进入在线体验工作台 ↗
                </button>
              </p>
            </div>
          </div>

          <div className="cc-dl-platforms">
            <h2>全部平台与分发格式</h2>

            <div className="cc-platform-tabs">
              <button type="button" className="cc-plat-tab active">
                Windows
              </button>
              <button
                type="button"
                className="cc-plat-tab"
                onClick={() => onLaunchDemo('dashboard', 'general')}
              >
                Web 在线体验版 (跨平台免安装)
              </button>
            </div>

            <div className="cc-dl-box">
              {/* 1. MSI 安装包 */}
              <div className="cc-dl-row">
                <div className="cc-dl-row-info">
                  <div className="cc-dl-row-title">
                    <strong>安装版 (.msi)</strong>
                    <span className="cc-badge-rec">推荐</span>
                  </div>
                  <div className="cc-dl-row-desc">
                    Windows Installer 标准安装程序（支持自定义非系统盘目录，全程无终端弹窗）
                  </div>
                  <div className="cc-dl-sha-line">
                    <span>文件标识</span>
                    <code>x64 hengji-{latestVer}.msi</code>
                    <button
                      type="button"
                      className="cc-copy-icon-btn"
                      onClick={() => handleCopyText(`hengji-${latestVer}.msi`, 'msi')}
                      title="复制文件名"
                    >
                      {copiedKey === 'msi' ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div className="cc-dl-row-btns">
                  <a href={getDownloadUrl('msi', true)} target="_blank" rel="noopener noreferrer" className="cc-arch-btn">
                    <Download size={13} />
                    <span>x64 高速镜像 · .msi</span>
                  </a>
                  <a href={getDownloadUrl('msi', false)} target="_blank" rel="noopener noreferrer" className="cc-arch-btn">
                    <Download size={13} />
                    <span>GitHub 源站</span>
                  </a>
                </div>
              </div>

              {/* 2. EXE 安装向导版 */}
              <div className="cc-dl-row">
                <div className="cc-dl-row-info">
                  <div className="cc-dl-row-title">
                    <strong>安装向导版 (.exe)</strong>
                    <span className="cc-badge-rec">向导</span>
                  </div>
                  <div className="cc-dl-row-desc">
                    NSIS 标准图形安装向导（自动创建桌面快捷方式，支持平滑覆盖升级）
                  </div>
                  <div className="cc-dl-sha-line">
                    <span>文件标识</span>
                    <code>x64 hengji-{latestVer}.exe</code>
                    <button
                      type="button"
                      className="cc-copy-icon-btn"
                      onClick={() => handleCopyText(`hengji-${latestVer}.exe`, 'exe')}
                      title="复制文件名"
                    >
                      {copiedKey === 'exe' ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div className="cc-dl-row-btns">
                  <a href={getDownloadUrl('setup', true)} target="_blank" rel="noopener noreferrer" className="cc-arch-btn">
                    <Download size={13} />
                    <span>x64 高速镜像 · .exe</span>
                  </a>
                  <a href={getDownloadUrl('setup', false)} target="_blank" rel="noopener noreferrer" className="cc-arch-btn">
                    <Download size={13} />
                    <span>GitHub 源站</span>
                  </a>
                </div>
              </div>

              {/* 3. ZIP 便携解压版 */}
              <div className="cc-dl-row">
                <div className="cc-dl-row-info">
                  <div className="cc-dl-row-title">
                    <strong>便携版 (.zip)</strong>
                  </div>
                  <div className="cc-dl-row-desc">
                    免安装，解压即用（适合内网受限终端或直接解压至 D:\ 盘运行）
                  </div>
                  <div className="cc-dl-sha-line">
                    <span>文件标识</span>
                    <code>x64 hengji-{latestVer}.zip</code>
                    <button
                      type="button"
                      className="cc-copy-icon-btn"
                      onClick={() => handleCopyText(`hengji-${latestVer}.zip`, 'zip')}
                      title="复制文件名"
                    >
                      {copiedKey === 'zip' ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div className="cc-dl-row-btns">
                  <a href={getDownloadUrl('zip', true)} target="_blank" rel="noopener noreferrer" className="cc-arch-btn">
                    <Download size={13} />
                    <span>x64 高速镜像 · .zip</span>
                  </a>
                  <a href={getDownloadUrl('zip', false)} target="_blank" rel="noopener noreferrer" className="cc-arch-btn">
                    <Download size={13} />
                    <span>GitHub 源站</span>
                  </a>
                </div>
              </div>

              {/* 4. Portable 单文件版 */}
              <div className="cc-dl-row">
                <div className="cc-dl-row-info">
                  <div className="cc-dl-row-title">
                    <strong>便携单文件版 (Portable .exe)</strong>
                  </div>
                  <div className="cc-dl-row-desc">
                    绿色单可执行文件，不写注册表，可放入移动硬盘或加密 U 盘随身携带
                  </div>
                  <div className="cc-dl-sha-line">
                    <span>文件标识</span>
                    <code>x64 hengji-portable-{latestVer}.exe</code>
                    <button
                      type="button"
                      className="cc-copy-icon-btn"
                      onClick={() => handleCopyText(`hengji-portable-${latestVer}.exe`, 'portable')}
                      title="复制文件名"
                    >
                      {copiedKey === 'portable' ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div className="cc-dl-row-btns">
                  <a href={getDownloadUrl('portable', true)} target="_blank" rel="noopener noreferrer" className="cc-arch-btn">
                    <Download size={13} />
                    <span>x64 高速镜像 · 单文件</span>
                  </a>
                  <a href={getDownloadUrl('portable', false)} target="_blank" rel="noopener noreferrer" className="cc-arch-btn">
                    <Download size={13} />
                    <span>GitHub 源站</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="cc-dl-verify-note">
              <p>不确定选哪个？大多数电脑选 <b>安装版 (.msi)</b> 或 <b>安装向导版 (.exe)</b>。</p>
              <p>
                校验完整性：下载后可在终端执行 <code>certutil -hashfile &lt;file&gt; SHA256</code>，输出应与 GitHub Releases 页面显示的 SHA-256 一致。
              </p>
            </div>

            <div className="cc-dl-history-card">
              <h3>历史版本</h3>
              <p>需要旧版本？所有历史版本均可在 GitHub Releases 获取。</p>
              <a href={GITHUB_RELEASES_URL} target="_blank" rel="noopener noreferrer" className="cc-history-link">
                <span>前往 GitHub Releases</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </main>
      )}

      {/* ==================== 视图 3：更新日志独立页面 (三栏布局) ==================== */}
      {pageView === 'changelog' && (
        <main className="cc-changelog-page">
          <div className="cc-cl-layout">
            {/* 左栏：版本列表 */}
            <aside className="cc-cl-sidebar">
              <div className="cc-cl-sidebar-header">
                <Tag size={15} />
                <strong>版本列表</strong>
              </div>
              <div className="cc-cl-ver-list">
                {UPDATE_HISTORY.map((ver, idx) => {
                  const active = idx === selectedVerIdx;
                  return (
                    <button
                      key={ver.version}
                      type="button"
                      className={`cc-cl-ver-item ${active ? 'active' : ''}`}
                      onClick={() => setSelectedVerIdx(idx)}
                    >
                      <span className="ver-arrow">{active ? '⌄' : '›'}</span>
                      <span>{ver.version}</span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* 中栏：当前选中版本的详细发布说明卡片 */}
            <article className="cc-cl-article">
              <div className="cc-cl-article-header">
                <h1>{currentVersionObj.version}</h1>
                <span className="cc-cl-date">
                  <Calendar size={14} />
                  <span>{currentVersionObj.date}</span>
                </span>
              </div>

              <p className="cc-cl-summary">
                本版本为<b>「{currentVersionObj.tag}」</b>：{currentVersionObj.title}。
                所有更新均已同步至桌面离线端四种安装包（MSI / EXE / Portable / ZIP）与网页在线体验工作台，完整发行包请见{' '}
                <a href={`${GITHUB_RELEASES_URL}/tag/${currentVersionObj.version}`} target="_blank" rel="noopener noreferrer">
                  {currentVersionObj.version} 发布说明
                </a>。
              </p>

              <hr className="cc-cl-divider" />

              {currentCategorized.added.length > 0 && (
                <section id="cl-sec-added" className="cc-cl-sec">
                  <h2>新增与核心特性</h2>
                  <ul>
                    {currentCategorized.added.map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ul>
                </section>
              )}

              {currentCategorized.improved.length > 0 && (
                <section id="cl-sec-improved" className="cc-cl-sec">
                  <h2>改进与体验优化</h2>
                  <ul>
                    {currentCategorized.improved.map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ul>
                </section>
              )}

              {currentCategorized.fixed.length > 0 && (
                <section id="cl-sec-fixed" className="cc-cl-sec">
                  <h2>修复与稳定性加固</h2>
                  <ul>
                    {currentCategorized.fixed.map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section id="cl-sec-upgrade" className="cc-cl-sec">
                <h2>升级说明</h2>
                <ul>
                  <li>
                    <b>桌面客户端升级</b>：在软件启动页或“关于系统”窗口点击【检测新版】，选择 EXE 覆盖安装、MSI 安装、单文件覆盖或 ZIP 解压覆盖（默认保留您的 <code>.hengji</code> 加密工作区数据，绝不丢失）。
                  </li>
                  <li>
                    <b>全新下载安装</b>：可前往官网{' '}
                    <button type="button" className="cc-inline-link" onClick={() => navigatePage('download')}>
                      免费下载页面
                    </button>{' '}
                    获取最新 v{latestVer} 安装包。
                  </li>
                </ul>
              </section>
            </article>

            {/* 右栏：目录锚点导航 */}
            <aside className="cc-cl-toc">
              <div className="cc-cl-toc-title">在 {currentVersionObj.version} 中</div>
              <nav>
                {currentCategorized.added.length > 0 && (
                  <a href="#cl-sec-added" onClick={e => { e.preventDefault(); document.getElementById('cl-sec-added')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    新增
                  </a>
                )}
                {currentCategorized.improved.length > 0 && (
                  <a href="#cl-sec-improved" onClick={e => { e.preventDefault(); document.getElementById('cl-sec-improved')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    改进
                  </a>
                )}
                {currentCategorized.fixed.length > 0 && (
                  <a href="#cl-sec-fixed" onClick={e => { e.preventDefault(); document.getElementById('cl-sec-fixed')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    修复
                  </a>
                )}
                <a href="#cl-sec-upgrade" onClick={e => { e.preventDefault(); document.getElementById('cl-sec-upgrade')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  升级说明
                </a>
              </nav>
            </aside>
          </div>
        </main>
      )}

      {/* ==================== 视图 4：文档页面 ==================== */}
      {pageView === 'docs' && (
        <main className="cc-changelog-page">
          <div className="cc-cl-layout">
            <aside className="cc-cl-sidebar">
              <div className="cc-cl-sidebar-header">
                <BookOpen size={15} />
                <strong>使用文档目录</strong>
              </div>
              <div className="cc-cl-ver-list">
                {[
                  { id: 0, title: '快速入门与五步闭环' },
                  { id: 1, title: '1. 新建安全加密工作区' },
                  { id: 2, title: '2. 导入部门员工与合同' },
                  { id: 3, title: '3. 稳健交付防透支排期' },
                  { id: 4, title: '4. 月底集中分配与发布' },
                  { id: 5, title: '5. 核算员数据包流转' },
                  { id: 6, title: '考核口径与常见问题' },
                ].map(ch => (
                  <button
                    key={ch.id}
                    type="button"
                    className={`cc-cl-ver-item ${docSection === ch.id ? 'active' : ''}`}
                    onClick={() => setDocSection(ch.id)}
                  >
                    <span className="ver-arrow">{docSection === ch.id ? '⌄' : '›'}</span>
                    <span>{ch.title}</span>
                  </button>
                ))}
              </div>
            </aside>

            <article className="cc-cl-article">
              {docSection === 0 && (
                <>
                  <div className="cc-cl-article-header">
                    <h1>衡绩 (HengJi) 快速入门与五步闭环</h1>
                    <span className="cc-cl-date">v{APP_VERSION} 官方手册</span>
                  </div>
                  <p className="cc-cl-summary">
                    衡绩是一套面向多项目、长周期、跨专业组（总体组 / 产品组 / 研发组）工程与科研团队的<b>离线安全员工绩点量化考核系统</b>。
                    您既可以下载 Windows 桌面客户端在纯内网离线使用，也可以随时点击顶部【在线体验】在浏览器沙盒中直接操作。
                  </p>
                  <hr className="cc-cl-divider" />
                  <section className="cc-cl-sec">
                    <h2>五步标准作业流程</h2>
                    <ul>
                      <li><b>第一步：新建安全工作区</b> — 选择“综合管理工作区”或“绩效核算工作区”，将 <code>.hengji</code> 加密文件保存在非系统盘（D:\ / E:\ 盘）。</li>
                      <li><b>第二步：初始化员工与项目</b> — 批量导入或一键初始化总体组、产品组、研发组员工花名册与工程合同清单（支持千分位与多位小数自动清洗）。</li>
                      <li><b>第三步：全周期额度防透支规划</b> — 使用“🎯 稳健交付型（前低后高）”排期，前期争取阶段限高 0~10%（默认 5%），发货交付锁定 45%+ 大头，末月维保强制保留 5%。</li>
                      <li><b>第四步：月底集中分配与发布</b> — 在全项目当月集中大表中一键套用规划额度，配置团队成员比例（合计严格等于 100%），一键批量发布生效。</li>
                      <li><b>第五步：多维报表透视与荣誉评选</b> — 查验横向个人×纵向项目二维闭环矩阵（精确到分），自动生成月度/季度/年度卓越绩星金榜。</li>
                    </ul>
                  </section>
                </>
              )}

              {docSection === 1 && (
                <>
                  <div className="cc-cl-article-header">
                    <h1>第一步：新建安全加密工作区</h1>
                  </div>
                  <p className="cc-cl-summary">
                    彻底告别把业务数据偷偷藏在 C 盘用户目录的隐患。衡绩所有数据均通过 <code>PBKDF2-SHA256</code> (10万次迭代) 与 <code>AES-256-GCM</code> 加密保存在您指定的本地文件中。
                  </p>
                  <hr className="cc-cl-divider" />
                  <section className="cc-cl-sec">
                    <h2>双工作区角色模式</h2>
                    <ul>
                      <li><b>🏢 综合管理工作区（推荐）</b>：适合超级管理员、部门主任或项目负责人，涵盖项目立项、额度排期、月度考评分配与团队编制全套功能。</li>
                      <li><b>📊 绩效核算工作区</b>：适合专职绩效核算员，专门用于批量接收并拖拽导入各项目负责人发来的 <code>.json</code> 项目分配数据包，自动跨项目合并出表。</li>
                      <li><b>自动镜像灾备</b>：每次点击保存，系统自动在同目录生成 <code>.hengji.backup</code> 备份文件，双重保障数据安全。</li>
                    </ul>
                  </section>
                </>
              )}

              {docSection === 2 && (
                <>
                  <div className="cc-cl-article-header">
                    <h1>第二步：导入部门员工与工程合同</h1>
                  </div>
                  <p className="cc-cl-summary">
                    全面兼容财务与 OA 导出的 Excel / CSV 台账，支持按唯一工号精准绑定员工，支持同一工作令号下挂靠多个独立子合同。
                  </p>
                  <hr className="cc-cl-divider" />
                  <section className="cc-cl-sec">
                    <h2>财务格式高容错解析</h2>
                    <ul>
                      <li><b>自动清洗金额</b>：自动剥离千分位逗号（如 <code>1,309,000.00</code>）、货币符号（¥、$、元、万元），超长浮点小数自动四舍五入到“分”。</li>
                      <li><b>专业组联动</b>：支持总体组、产品组、研发组划分，后续团队勾选、趋势对比与荣誉评选全自动联动。</li>
                    </ul>
                  </section>
                </>
              )}

              {docSection === 3 && (
                <>
                  <div className="cc-cl-article-header">
                    <h1>第三步：稳健交付防透支排期</h1>
                  </div>
                  <p className="cc-cl-summary">
                    严防“项目刚立项就把绩效分光，后期进入成品发货与试验终验时有活无钱可分”。
                  </p>
                  <hr className="cc-cl-divider" />
                  <section className="cc-cl-sec">
                    <h2>三段式防透支配比法则</h2>
                    <ul>
                      <li><b>前期项目争取阶段（首月 0% ~ 10% 可调，默认 5%）</b>：用于立项论证与商务争取，设立硬上限。</li>
                      <li><b>主体研制与成品交付阶段（前低后高，大头 45%+）</b>：随着初样、正样联调推进逐步递增，重头激励锁定在成品发货与终检验收。</li>
                      <li><b>售后维保阶段（末月固定保留 5%）</b>：在项目周期最后一个月稳固锁定 5% 额度，保障售后技术支持激励。</li>
                    </ul>
                  </section>
                </>
              )}

              {docSection === 4 && (
                <>
                  <div className="cc-cl-article-header">
                    <h1>第四步：月底集中分配与批量发布</h1>
                  </div>
                  <p className="cc-cl-summary">
                    当月所有在研项目集中呈现在同一张透视大表中，无需逐个点开项目弹窗。
                  </p>
                  <hr className="cc-cl-divider" />
                  <section className="cc-cl-sec">
                    <h2>核心计算公式与校验</h2>
                    <ul>
                      <li><b>员工当月绩点（万元）</b> = 项目合同总额（万元） × 当月项目分配比例（%） × 员工当月分配率（%）。</li>
                      <li><b>100% 严密守恒</b>：当月项目内所有参评成员的分配比例之和必须精确等于 100%，底层采用 <code>BigInt</code> 与最大余数补差法，确保分毫不差。</li>
                    </ul>
                  </section>
                </>
              )}

              {docSection === 5 && (
                <>
                  <div className="cc-cl-article-header">
                    <h1>第五步：核算员数据包流转与汇总</h1>
                  </div>
                  <p className="cc-cl-summary">
                    专为纯内网无服务器环境打造的多角色协同机制。
                  </p>
                  <hr className="cc-cl-divider" />
                  <section className="cc-cl-sec">
                    <h2>数据包导出与一键归集</h2>
                    <ul>
                      <li><b>负责人端导出</b>：在【项目库】或【数据资产中心】点击导出单个项目数据包或名下全部项目合包（<code>.json</code>）。</li>
                      <li><b>核算员端导入</b>：在核算工作区【数据包导入中心】直接拖拽多个数据包，系统基于员工唯一工号/ID 自动合并跨项目绩点，生成全员总表、全景合同矩阵与二维透视表。</li>
                    </ul>
                  </section>
                </>
              )}

              {docSection === 6 && (
                <>
                  <div className="cc-cl-article-header">
                    <h1>已确认的业务口径与负责人参考系数</h1>
                  </div>
                  <p className="cc-cl-summary">
                    系统内置项目负责人参考系数区间引导（柔性提示，不强制阻断保存）。
                  </p>
                  <hr className="cc-cl-divider" />
                  <section className="cc-cl-sec">
                    <h2>合同金额与负责人参考占比</h2>
                    <ul>
                      <li><b>0 &lt; 合同金额 &lt; 50 万元</b>：项目负责人参考系数区间为 <b>60% – 90%</b>。</li>
                      <li><b>50 ≤ 合同金额 &lt; 500 万元</b>：项目负责人参考系数区间为 <b>30% – 60%</b>。</li>
                      <li><b>合同金额 ≥ 500 万元</b>：项目负责人参考系数区间为 <b>10% – 30%</b>。</li>
                    </ul>
                  </section>
                </>
              )}

              <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--cc-border)', display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="cc-btn-terracotta"
                  onClick={() => onLaunchDemo('dashboard', 'general')}
                >
                  <Play size={14} fill="currentColor" />
                  <span>立即进入在线工作台实操体验</span>
                </button>
                <button
                  type="button"
                  className="cc-btn-outline"
                  onClick={() => navigatePage('download')}
                >
                  <Download size={14} />
                  <span>前往下载桌面客户端</span>
                </button>
              </div>
            </article>

            <aside className="cc-cl-toc">
              <div className="cc-cl-toc-title">快捷跳转</div>
              <nav>
                <a href="#try" onClick={e => { e.preventDefault(); onLaunchDemo('dashboard', 'general'); }}>进入综合工作台 ↗</a>
                <a href="#aud" onClick={e => { e.preventDefault(); onLaunchDemo('auditor', 'auditor'); }}>进入核算员视角 ↗</a>
                <a href="#dl" onClick={e => { e.preventDefault(); navigatePage('download'); }}>客户端下载 ↗</a>
              </nav>
            </aside>
          </div>
        </main>
      )}
    </div>
  );
}
