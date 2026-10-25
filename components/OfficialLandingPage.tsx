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
  ArrowRight,
  Search
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
import { DOC_BOOKS, DocArticleContent } from './OfficialDocsData';

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

// 将单条版本更新的 items 智能归类为：新增 / 改进 / 修复
function categorizeVersionItems(ver: VersionUpdate) {
  const added: string[] = [];
  const improved: string[] = [];
  const fixed: string[] = [];

  for (const item of ver.items) {
    if (/修复|解决|根治|消除.*报错|消除.*问题|修正|Fix|Resolve/i.test(item)) {
      fixed.push(item);
    } else if (/优化|升级|重构|增强|美化|加大|调整|规范|Improve|Enhance|Update|Refactor/i.test(item)) {
      improved.push(item);
    } else {
      added.push(item);
    }
  }
  return { added, improved, fixed };
}

export function OfficialLandingPage({ onLaunchDemo }: OfficialLandingPageProps) {
  const [pageView, setPageView] = useState<PageView>('home');
  const [theme, setTheme] = useState<'parchment' | 'dark'>('parchment');
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);

  // 首屏右侧交互式软件预览窗口状态
  const [activePreview, setActivePreview] = useState<PreviewTabKey>('dashboard');
  // 五步闭环高亮状态
  const [activeStep, setActiveStep] = useState<number>(0);
  // 更新日志页状态
  const [selectedVerIdx, setSelectedVerIdx] = useState<number>(0);
  // 复制反馈状态
  const [copiedKey, setCopiedKey] = useState<string>('');
  // 文档中心大文章与章节状态
  const [activeBookId, setActiveBookId] = useState<string>('intro');
  const [activeChapterId, setActiveChapterId] = useState<string>('intro-system');
  const [expandedBooks, setExpandedBooks] = useState<{ [id: string]: boolean }>({
    intro: true,
    manual: true,
    deploy: true,
  });
  const [docSearchQuery, setDocSearchQuery] = useState<string>('');

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

  // 六大实景交互模块配置
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
      label: isEn ? 'Executive Dashboard' : '全景驾驶舱',
      badge: isEn ? 'Real-time' : '实时监控',
      icon: <CircleGauge size={13} />,
      topbarTitle: isEn ? 'Executive Overview Dashboard' : '全景总览驾驶舱',
      targetTab: 'dashboard',
      workspace: 'general'
    },
    {
      key: 'quota',
      label: isEn ? 'Anti-Overdraft Phasing' : '稳健交付防透支',
      badge: isEn ? 'Core Innovation' : '核心首创',
      icon: <Sliders size={13} />,
      topbarTitle: isEn ? 'Project Lifecycle Management' : '项目全周期管理',
      targetTab: 'projects',
      workspace: 'general'
    },
    {
      key: 'plans',
      label: isEn ? 'Monthly Allocation Grid' : '月底集中大表',
      badge: isEn ? 'Batch Review' : '告别繁琐',
      icon: <CalendarRange size={13} />,
      topbarTitle: isEn ? 'Monthly Merit Allocation' : '月度绩效分配',
      targetTab: 'plans',
      workspace: 'general'
    },
    {
      key: 'auditor',
      label: isEn ? 'Offline Package Rollup' : '数据包流转汇总',
      badge: isEn ? 'Offline Collab' : '离线协同',
      icon: <FolderArchive size={13} />,
      topbarTitle: isEn ? 'Cross-Project Auditor Matrix' : '全员跨项目绩效总表',
      targetTab: 'auditor',
      workspace: 'auditor'
    },
    {
      key: 'reports',
      label: isEn ? 'Two-Way Audit Matrix' : '双向闭环矩阵',
      badge: isEn ? 'Penny-Accurate' : '分毫不差',
      icon: <Table2 size={13} />,
      topbarTitle: isEn ? 'Multi-Cycle Reports' : '多周期汇总报表',
      targetTab: 'reports',
      workspace: 'general'
    },
    {
      key: 'stars',
      label: isEn ? 'Hall of Merit Stars' : '卓越绩星殿堂',
      badge: isEn ? 'Honor & Morale' : '荣誉激励',
      icon: <Trophy size={13} />,
      topbarTitle: isEn ? 'Hall of Merit Stars' : '卓越绩星荣誉殿堂',
      targetTab: 'stars',
      workspace: 'general'
    }
  ];

  // 五步构建端到端量化绩效考核闭环
  const workflowSteps = [
    {
      step: 'STEP 01',
      title: isEn ? 'Create Encrypted Workspace' : '新建加密工作区',
      subtitle: isEn ? 'Non-System Drive Storage · Password or Direct Entry' : '非系统盘存储 · 口令/免密可选',
      desc: isEn
        ? 'Choose "General Admin Workspace" or "Auditor Workspace". Store .hengji data files on drive D: or a secured intranet drive. Supports AES-256-GCM encryption or direct password-free workstation access.'
        : '选择“综合管理工作区”或“绩效核算工作区”，将 .hengji 数据文件保存在 D 盘或单位保密盘，支持设置 AES-256 口令或个人电脑免密秒进。',
      previewKey: 'dashboard' as PreviewTabKey,
      demoTab: 'dashboard'
    },
    {
      step: 'STEP 02',
      title: isEn ? 'Initialize Team & Project Contracts' : '初始化员工与项目',
      subtitle: isEn ? 'Batch CSV Import · Tolerant Financial Parsing' : 'CSV 批量导入 · 财务格式自适应',
      desc: isEn
        ? 'Initialize General, Product, and R&D group structures with one click, or import department rosters and contract ledgers via CSV with automatic stripping of commas, currency symbols, and decimals.'
        : '一键初始化总体组/产品组/研发组架构，或拖拽导入单位员工花名册与工程合同台账（自动剥离千分位、货币符号与超长小数）。',
      previewKey: 'dashboard' as PreviewTabKey,
      demoTab: 'employees'
    },
    {
      step: 'STEP 03',
      title: isEn ? 'Anti-Overdraft Lifecycle Quota Planning' : '全周期额度防透支规划',
      subtitle: isEn ? 'Robust Phased Curve · Team Ratio Templates' : '一键稳健排期 · 常用项目组模版',
      desc: isEn
        ? 'Click project card [🎯 Quota Planning] to generate an anti-overdraft schedule: 5% initial inception -> major delivery quota -> 5% warranty retention, linked with default group ratio templates.'
        : '点击项目卡片【🎯 额度规划】，一键生成“前期争取 5% → 研制发货大头 → 末月维保 5%”的防透支排期曲线，并绑定项目组默认分润比例。',
      previewKey: 'quota' as PreviewTabKey,
      demoTab: 'projects'
    },
    {
      step: 'STEP 04',
      title: isEn ? 'Monthly Allocation & Batch Release' : '月底集中分配与发布',
      subtitle: isEn ? 'All Projects Unified · Strict 100% Verification' : '全项目同屏考评 · 100% 严密校验',
      desc: isEn
        ? 'In the monthly review sheet, apply planned monthly budgets with one click, tune member contribution ratios (must sum to exactly 100%), and batch-publish officially or export data packages to auditors.'
        : '在【月度绩效分配】集中大表中，一键套用当月规划额度，微调成员贡献比例（严格等于 100%），一键批量发布正式计入考核，或导出数据包给核算员。',
      previewKey: 'plans' as PreviewTabKey,
      demoTab: 'plans'
    },
    {
      step: 'STEP 05',
      title: isEn ? 'Multi-Dimensional Reports & Honor Hall' : '多维报表与荣誉殿堂',
      subtitle: isEn ? '2D Matrix Closure · Automated Merit Star Awards' : '二维闭环透视 · 自动评选绩星',
      desc: isEn
        ? 'View 2D member-by-project pivot matrices across months, quarters, or years. Verify 100% row/column closure down to the cent, export Excel-compatible CSVs, and reveal merit stars.'
        : '按月/季/年度或任意区间查看“人员×项目”二维透视矩阵，验证行列双向 100% 闭环，一键导出 Excel 兼容 CSV 明细并揭晓考核之星金榜。',
      previewKey: 'reports' as PreviewTabKey,
      demoTab: 'reports'
    }
  ];

  const sidebarMeta: Record<PreviewTabKey, { topbarTitle: string; targetTab: string; workspace: 'general' | 'auditor' }> = {
    dashboard: { topbarTitle: isEn ? 'Executive Overview Dashboard' : '全景总览驾驶舱', targetTab: 'dashboard', workspace: 'general' },
    quota: { topbarTitle: isEn ? 'Project Lifecycle Management' : '项目全周期管理', targetTab: 'projects', workspace: 'general' },
    plans: { topbarTitle: isEn ? 'Monthly Merit Allocation' : '月度绩效分配', targetTab: 'plans', workspace: 'general' },
    groups: { topbarTitle: isEn ? 'Project Group Matrix' : '常用项目组矩阵', targetTab: 'groups', workspace: 'general' },
    employees: { topbarTitle: isEn ? 'Team Roster' : '团队编制花名册', targetTab: 'employees', workspace: 'general' },
    rules: { topbarTitle: isEn ? 'Merit Guidelines & Rules' : '绩效准则与规范', targetTab: 'rules', workspace: 'general' },
    auditor: { topbarTitle: isEn ? 'Cross-Project Auditor Matrix' : '全员跨项目绩效总表', targetTab: 'auditor', workspace: 'auditor' },
    stars: { topbarTitle: isEn ? 'Hall of Merit Stars' : '卓越绩星荣誉殿堂', targetTab: 'stars', workspace: 'general' },
    reports: { topbarTitle: isEn ? 'Multi-Cycle Reports' : '多周期汇总报表', targetTab: 'reports', workspace: 'general' },
    data_io: { topbarTitle: isEn ? 'Data Assets & Disaster Recovery' : '数据资产与灾备中心', targetTab: 'data_io', workspace: 'general' },
  };

  const currentModule = sidebarMeta[activePreview] || sidebarMeta.dashboard;
  const currentVersionObj = UPDATE_HISTORY[selectedVerIdx] || UPDATE_HISTORY[0];
  const currentCategorized = categorizeVersionItems(currentVersionObj);

  return (
    <div className={`cc-parchment-root ${theme === 'dark' ? 'cc-dark' : ''}`}>
      {/* ==================== 网页最顶部通告条 ==================== */}
      <div className="hj-top-announcement">
        <div className="hj-announcement-inner">
          <span className="hj-announcement-tag">NEW v{latestVer}</span>
          <span>
            {isEn
              ? `HengJi v${latestVer} Released: Terminal-free silent setup (MSI/EXE/ZIP), non-system drive encryption, and multi-project merit aggregation!`
              : '衡绩 (HengJi) 全新发布：支持 MSI/EXE/ZIP 四种无终端静默部署、非系统盘安全存储与全项目数据包流转汇总！'}
          </span>
          <button
            type="button"
            className="hj-announcement-link"
            onClick={() => onLaunchDemo('dashboard', 'general')}
          >
            <span>{isEn ? 'Try Live Demo Online' : '立即进入在线工作台体验'}</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* ==================== 顶部导航栏 ==================== */}
      <header className="cc-header">
        <div className="cc-header-inner">
          {/* 左侧：双图标并排同大 + 品牌名称 + 导航菜单 */}
          <div className="cc-header-left">
            <div className="cc-brand" onClick={() => navigatePage('home')}>
              <div className="cc-brand-logos" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                <img src={brandHengSeal} alt="衡" className="cc-brand-seal" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
                <img src={brandBurstFlower} alt="衡绩" className="cc-brand-flower" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain' }} />
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

          {/* 右侧：语言切换 + 主题切换 + GitHub 图标 */}
          <div className="cc-header-right">
            <button
              type="button"
              className="cc-lang-pill"
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              title={isEn ? 'Switch to Chinese / 切换为中文' : '切换语言 / Switch Language'}
            >
              <Globe size={15} />
              <span>{lang === 'zh' ? 'CN' : 'EN'}</span>
            </button>

            <button
              type="button"
              className="cc-theme-btn"
              onClick={() => setTheme(theme === 'parchment' ? 'dark' : 'parchment')}
              title={theme === 'parchment' ? (isEn ? 'Switch to Dark Emerald Theme' : '切换至深色翡翠主题') : (isEn ? 'Switch to Parchment Theme' : '切换至暖羊皮纸主题')}
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
              {/* 左栏：品牌价值主张 + 核心标语 + 操作按钮 */}
              <div className="cc-hero-left">
                {/* 上半部分：图 1 内容（发布徽章 + 品牌标题 + 大标语 + 副标语，行间距舒展美观） */}
                <div className="cc-hero-top-group">
                  <button
                    type="button"
                    className="cc-release-badge"
                    onClick={() => navigatePage('changelog')}
                    title={isEn ? 'Click to view version changelog' : '点击查看版本更新日志'}
                  >
                    <Sparkles size={13} className="cc-badge-spark" />
                    <span>🎉 v{latestVer} {isEn ? 'Released' : '正式发布'}</span>
                    <span className="cc-badge-sep">|</span>
                    <span className="cc-badge-hl">
                      {isEn ? 'Offline Encrypted · Anti-Overdraft · Closed-Loop Audit' : '离线加密 · 稳健防透支 · 双向闭环'}
                    </span>
                  </button>

                  <div className="cc-hero-title-group">
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
                      {isEn ? (
                        <>
                          Measure every project contribution <span className="cc-gradient-accent">with precision and equity</span>
                        </>
                      ) : (
                        <>
                          让每一份项目贡献，<span className="cc-gradient-accent">都有据可衡</span>
                        </>
                      )}
                    </h2>

                    <p className="cc-hero-tagline">
                      {isEn
                        ? 'Unify and manage your engineering project and team merit evaluation workflow.'
                        : '统一管理你的工程项目与团队绩效考核工作流'}
                    </p>
                  </div>
                </div>

                {/* 下半部分：图 2 内容（三个操作按钮 + 运行环境说明，稳稳对齐右边大图底边） */}
                <div className="cc-hero-bottom-group">
                  <div className="cc-hero-buttons-row">
                    <button
                      type="button"
                      className="cc-btn-hero-primary"
                      onClick={() => navigatePage('download')}
                    >
                      <Download size={16} />
                      <span>{isEn ? 'Free Download' : '免费下载'}</span>
                    </button>

                    <button
                      type="button"
                      className="cc-btn-hero-secondary"
                      onClick={() => onLaunchDemo('dashboard', 'general')}
                    >
                      <Play size={14} fill="currentColor" />
                      <span>{isEn ? 'Live Demo' : '在线体验'}</span>
                    </button>

                    <button
                      type="button"
                      className="cc-btn-hero-docs"
                      onClick={() => navigatePage('docs')}
                    >
                      <span>{isEn ? 'Documentation →' : '查看文档 →'}</span>
                    </button>
                  </div>

                  <div className="cc-hero-env-note">
                    <span>
                      {isEn
                        ? 'Supports Windows 10+ · Fully Offline · Non-System Drive Security'
                        : '支持 Windows 10+ · 纯离线免云端 · 非系统盘安全存储'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 右栏：单行六大模块切换栏 + 图1双图标并排同大的真实 Mockup 窗口 */}
              <div className="cc-hero-right">
                {/* 单行紧凑排列的六大模块切换栏 */}
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

                {/* 图1与实际软件界面 100% 保持一致的真实界面窗口（双图标并排同大） */}
                <div className="hj-mockup-window">
                  <div className="hj-mockup-body">
                    {/* 真实软件左侧导航栏 */}
                    <div className="hj-real-sidebar">
                      <div className="hj-real-brand">
                        <div className="hj-real-dual-logo">
                          <img src={brandHengSeal} alt="衡" className="seal-img" />
                          <img src={brandBurstFlower} alt="衡绩" className="flower-badge" />
                        </div>
                        <strong>{isEn ? 'HengJi Merit' : '衡绩考核'}</strong>
                      </div>

                      <div className="hj-real-mode-switch">
                        <button
                          type="button"
                          className={activePreview !== 'auditor' ? 'active' : ''}
                          onClick={() => setActivePreview('dashboard')}
                        >
                          <BriefcaseBusiness size={11} />
                          <span>{isEn ? 'General Admin' : '综合管理台'}</span>
                        </button>
                        <button
                          type="button"
                          className={activePreview === 'auditor' ? 'active auditor' : ''}
                          onClick={() => setActivePreview('auditor')}
                        >
                          <Calculator size={11} />
                          <span>{isEn ? 'Auditor Rollup' : '核算员汇总'}</span>
                        </button>
                      </div>

                      <div className="hj-real-sec-title">{isEn ? 'Core Operations' : '核心业务矩阵'}</div>
                      <div className="hj-real-nav">
                        <button
                          type="button"
                          className={activePreview === 'dashboard' ? 'active' : ''}
                          onClick={() => setActivePreview('dashboard')}
                        >
                          <CircleGauge size={14} />
                          <span>{isEn ? 'Executive Dashboard' : '全景总览驾驶舱'}</span>
                          <ChevronRight size={12} />
                        </button>
                        <button
                          type="button"
                          className={activePreview === 'quota' ? 'active' : ''}
                          onClick={() => setActivePreview('quota')}
                        >
                          <BriefcaseBusiness size={14} />
                          <span>{isEn ? 'Project Lifecycle' : '项目全周期管理'}</span>
                          <ChevronRight size={12} />
                        </button>
                        <button
                          type="button"
                          className={activePreview === 'plans' ? 'active' : ''}
                          onClick={() => setActivePreview('plans')}
                        >
                          <CalendarRange size={14} />
                          <span>{isEn ? 'Monthly Allocation' : '月度绩效分配'}</span>
                          <ChevronRight size={12} />
                        </button>
                        <button
                          type="button"
                          className={activePreview === 'groups' ? 'active' : ''}
                          onClick={() => setActivePreview('groups')}
                        >
                          <FolderKanban size={14} />
                          <span>{isEn ? 'Project Groups' : '常用项目组矩阵'}</span>
                          <ChevronRight size={12} />
                        </button>
                        <button
                          type="button"
                          className={activePreview === 'employees' ? 'active' : ''}
                          onClick={() => setActivePreview('employees')}
                        >
                          <Users size={14} />
                          <span>{isEn ? 'Team Roster' : '团队编制花名册'}</span>
                          <ChevronRight size={12} />
                        </button>
                      </div>

                      <div className="hj-real-sec-title">{isEn ? 'Performance & Honors' : '效能分析与荣誉殿堂'}</div>
                      <div className="hj-real-nav">
                        <button
                          type="button"
                          className={activePreview === 'rules' ? 'active' : ''}
                          onClick={() => setActivePreview('rules')}
                        >
                          <BookOpenCheck size={14} />
                          <span>{isEn ? 'Merit Guidelines' : '绩效准则与规范'}</span>
                          <ChevronRight size={12} />
                        </button>
                        <button
                          type="button"
                          className={activePreview === 'auditor' ? 'active' : ''}
                          onClick={() => setActivePreview('auditor')}
                        >
                          <Calculator size={14} />
                          <span>{isEn ? 'Auditor Master Sheet' : '全员跨项目总表'}</span>
                          <ChevronRight size={12} />
                        </button>
                        <button
                          type="button"
                          className={activePreview === 'stars' ? 'active' : ''}
                          onClick={() => setActivePreview('stars')}
                        >
                          <Trophy size={14} />
                          <span>{isEn ? 'Hall of Merit Stars' : '卓越绩星荣誉殿堂'}</span>
                          <ChevronRight size={12} />
                        </button>
                        <button
                          type="button"
                          className={activePreview === 'reports' ? 'active' : ''}
                          onClick={() => setActivePreview('reports')}
                        >
                          <BarChart3 size={14} />
                          <span>{isEn ? 'Multi-Cycle Reports' : '多周期汇总报表'}</span>
                          <ChevronRight size={12} />
                        </button>
                        <button
                          type="button"
                          className={activePreview === 'data_io' ? 'active' : ''}
                          onClick={() => setActivePreview('data_io')}
                        >
                          <FileSpreadsheet size={14} />
                          <span>{isEn ? 'Data Assets & Backup' : '数据资产与灾备中心'}</span>
                          <ChevronRight size={12} />
                        </button>
                      </div>

                      <div className="hj-real-sidebar-foot">
                        <Database size={13} />
                        <div>
                          <span>{isEn ? 'Online Demo Workspace' : '在线交互演示工作区'}</span>
                          <small>{isEn ? 'D:\\HengJi_Workspace.hengji' : 'D:\\衡绩工作区.hengji'}</small>
                        </div>
                      </div>
                      <div className="hj-real-sidebar-ver">
                        <span>v{APP_VERSION}</span>
                        <div>
                          <span><BookOpen size={10} /> {isEn ? 'Manual' : '操作手册'}</span>
                          <span><Info size={10} /> {isEn ? 'About' : '关于'}</span>
                        </div>
                      </div>
                    </div>

                    {/* 真实软件右侧主工作区 */}
                    <div className="hj-real-main">
                      {/* 顶部操作栏 */}
                      <div className="hj-real-topbar">
                        <div className="hj-real-topbar-left">
                          <span className="eyebrow">MERIT EVALUATION SYSTEM</span>
                          <strong>{currentModule.topbarTitle}</strong>
                        </div>
                        <div className="hj-real-topbar-right">
                          <div className="hj-real-user-badge" onClick={() => onLaunchDemo(currentModule.targetTab, currentModule.workspace)}>
                            <span className="avatar">任</span>
                            <b>{isEn ? 'M. Ren' : '任某某'}</b>
                            <span className="role-tag">{isEn ? '👑 Admin' : '👑 系统管理员'}</span>
                            <ChevronDown size={10} />
                          </div>
                          <button type="button" className="hj-real-top-btn" onClick={() => setActivePreview('data_io')}>
                            <Save size={11} /> {isEn ? 'Save As' : '另存为'}
                          </button>
                          <button type="button" className="hj-real-top-btn guide" onClick={() => setActivePreview('rules')}>
                            <Sparkles size={11} /> {isEn ? 'Guide' : '新手引导'}
                          </button>
                          <button
                            type="button"
                            className="hj-real-top-btn auditor-switch"
                            onClick={() => setActivePreview(activePreview === 'auditor' ? 'dashboard' : 'auditor')}
                          >
                            <Calculator size={11} />{' '}
                            {activePreview === 'auditor'
                              ? (isEn ? 'Switch Admin View' : '切换综合管理台')
                              : (isEn ? 'Switch Auditor View' : '切换核算员汇总')}
                          </button>
                          <button
                            type="button"
                            className="hj-real-top-btn launch"
                            onClick={() => onLaunchDemo(currentModule.targetTab, currentModule.workspace)}
                          >
                            <span>{isEn ? 'Launch Full App' : '全屏进入真实操作'}</span>
                            <ExternalLink size={11} />
                          </button>
                        </div>
                      </div>

                      {/* 真实软件页面画布 */}
                      <div className="hj-real-page">
                        {/* 1. 全景总览驾驶舱 */}
                        {activePreview === 'dashboard' && (
                          <>
                            <div className="hj-real-hero-card">
                              <div className="hj-real-hero-left">
                                <span className="eyebrow">EQUITY &amp; MERIT PERFORMANCE</span>
                                <h3>
                                  {isEn ? (
                                    <>HengJi Merit Evaluation: <em>Scientific measurement of every contribution.</em></>
                                  ) : (
                                    <>衡绩绩点考核，<em>科学衡量每一份项目贡献。</em></>
                                  )}
                                </h3>
                                <p>
                                  {isEn
                                    ? 'From contract budget to phased quota monitoring, monthly/quarterly/annual stars, trend charts, group categories, and full CSV imports and exports.'
                                    : '从项目合同金额出发，支持多周期额度监控、月度/季度/年度之星评选、趋势图与柱状图分析、专业组分类及 CSV 数据导入导出。'}
                                </p>
                                <div className="hj-real-hero-btns">
                                  <button type="button" className="primary" onClick={() => setActivePreview('quota')}>
                                    <Plus size={12} /> {isEn ? 'New Project' : '新建项目'}
                                  </button>
                                  <button type="button" className="secondary" onClick={() => setActivePreview('stars')}>
                                    <Trophy size={12} /> {isEn ? 'View Merit Stars' : '查看考核之星'}
                                  </button>
                                  <button type="button" className="secondary" onClick={() => setActivePreview('reports')}>
                                    <TrendingUp size={12} /> {isEn ? 'Trends & Summary' : '趋势与汇总表'}
                                  </button>
                                </div>
                              </div>
                              <div className="hj-real-formula-card">
                                <span>{isEn ? 'Core Merit Rule' : '考核核心规则'}</span>
                                <strong>{isEn ? 'Monthly Budget × Member Allocation Ratio' : '月度预算 × 成员当月分配率'}</strong>
                                <div><b>100%</b><small>{isEn ? 'Total project monthly quotas sum' : '项目各月额度比例最终合计'}</small></div>
                                <div><b>100%</b><small>{isEn ? 'Strict monthly member allocation sum' : '每月项目成员比例严格分配'}</small></div>
                                <div><b>3 {isEn ? 'Groups' : '大组'}</b><small>{isEn ? 'General · Product · R&D' : '总体组 · 产品组 · 研发组'}</small></div>
                              </div>
                            </div>

                            <div className="hj-real-metrics-row">
                              <div className="hj-real-metric-item">
                                <span>{isEn ? 'Active Projects' : '执行中项目'}</span>
                                <strong>8</strong>
                                <small>{isEn ? '8 Projects in repository' : '项目库共 8 项'}</small>
                              </div>
                              <div className="hj-real-metric-item">
                                <span>{isEn ? 'Total Contract Value' : '合同总额'}</span>
                                <strong>{isEn ? '¥12.80 M' : '1,280.00 万元'}</strong>
                                <small>{isEn ? 'Gross contract value' : '全部项目含税总合同额'}</small>
                              </div>
                              <div className="hj-real-metric-item">
                                <span>{isEn ? 'Published This Month' : '本月已发布绩点'}</span>
                                <strong>{isEn ? '¥1.02 M' : '102.00 万元'}</strong>
                                <small>{isEn ? '3 plans activated' : '3 个月度计划已生效'}</small>
                              </div>
                              <div className="hj-real-metric-item">
                                <span>{isEn ? 'Team Members' : '团队部门成员'}</span>
                                <strong>18 <i>{isEn ? 'pax' : '人'}</i></strong>
                                <small>{isEn ? 'General, Product, R&D' : '覆盖总体组、产品组与研发组'}</small>
                              </div>
                            </div>

                            <div className="hj-real-split-row">
                              <div className="hj-real-panel">
                                <div className="hj-real-panel-head">
                                  <div>
                                    <span>HONOR &amp; STARS</span>
                                    <h4>{isEn ? 'Monthly Star 🌟 & Annual Leader' : '本月之星 🌟 与年度领跑'}</h4>
                                  </div>
                                  <button type="button" onClick={() => setActivePreview('stars')}>
                                    {isEn ? 'Hall of Stars' : '进入荣誉殿堂'}
                                  </button>
                                </div>
                                <div className="hj-real-star-cards">
                                  <div className="hj-real-star-box yellow">
                                    <span className="star-ico">🌟</span>
                                    <div>
                                      <small>{isEn ? 'Monthly Star (2026-05)' : '本月之星 (2026-05)'}</small>
                                      <b>{isEn ? 'M. Wang' : '王某某'}</b>
                                      <em>{isEn ? 'Awarded ¥248K points · R&D Group' : '获得 24.80 万元绩点 · 研发组'}</em>
                                    </div>
                                  </div>
                                  <div className="hj-real-star-box slate">
                                    <span className="star-ico">👑</span>
                                    <div>
                                      <small>{isEn ? 'Annual Leader (2026)' : '年度之星领跑 (2026年)'}</small>
                                      <b>{isEn ? 'M. Ren' : '任某某'}</b>
                                      <em>{isEn ? 'Cumulative ¥1.685M points · General Group' : '累计 168.50 万元绩点 · 总体组'}</em>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="hj-real-panel">
                                <div className="hj-real-panel-head">
                                  <div>
                                    <span>MONTHLY RANKING</span>
                                    <h4>{isEn ? '2026-05 Individual Top 5' : '2026-05 个人绩点前五名'}</h4>
                                  </div>
                                  <button type="button" onClick={() => setActivePreview('reports')}>
                                    {isEn ? 'Full Report' : '查看完整报表'}
                                  </button>
                                </div>
                                <div className="hj-real-rank-list">
                                  {[
                                    { rank: 1, name: isEn ? 'M. Wang' : '王某某', grp: isEn ? 'R&D Group' : '研发组', pts: isEn ? '¥248K' : '24.80 万元', pct: 100 },
                                    { rank: 2, name: isEn ? 'M. Ren' : '任某某', grp: isEn ? 'General Group' : '总体组', pts: isEn ? '¥222K' : '22.20 万元', pct: 90 },
                                    { rank: 3, name: isEn ? 'M. Chen' : '陈某某', grp: isEn ? 'Product Group' : '产品组', pts: isEn ? '¥189K' : '18.90 万元', pct: 76 },
                                    { rank: 4, name: isEn ? 'M. Zhao' : '赵某某', grp: isEn ? 'General Group' : '总体组', pts: isEn ? '¥144K' : '14.40 万元', pct: 58 },
                                    { rank: 5, name: isEn ? 'M. Sun' : '孙某某', grp: isEn ? 'Product Group' : '产品组', pts: isEn ? '¥126K' : '12.60 万元', pct: 51 },
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
                                <div className="stage-badge">{isEn ? 'Phase 1: Inception & Bidding' : '阶段一：前期项目争取'}</div>
                                <strong>{isEn ? 'Month 1: 0% ~ 10% (Default 5%)' : '首月 0% ~ 10% 可调（默认 5%）'}</strong>
                                <p>{isEn ? 'Strict cap against premature overdraft; allocates only baseline incentive.' : '严控立项初期过早透支额度，仅发放前期论证与竞标争取基础激励。'}</p>
                              </div>
                              <div className="hj-quota-arrow">→</div>
                              <div className="hj-quota-stage-card stage-normal">
                                <div className="stage-badge">{isEn ? 'Phase 2: Core R&D & Delivery' : '阶段二：主体研制与成品发货'}</div>
                                <strong>{isEn ? 'Progressive Growth · 45%+ on Delivery' : '前低后高递增 · 交付大头 45%+'}</strong>
                                <p>{isEn ? 'Progressively scales with prototypes; locks major incentive on final delivery.' : '随初样、正样推进逐步爬坡，将核心绩效锁定在成品顺利发货与验收节点。'}</p>
                              </div>
                              <div className="hj-quota-arrow">→</div>
                              <div className="hj-quota-stage-card stage-maint">
                                <div className="stage-badge">{isEn ? 'Phase 3: Warranty & Support' : '阶段三：售后维保阶段'}</div>
                                <strong>{isEn ? 'Mandatory 5% Final Retention' : '末月强制锁定保留 5%'}</strong>
                                <p>{isEn ? 'Released only upon warranty completion without major defect.' : '质保期满无重大质量问题后予以核销，彻底杜绝“前期分光、后期无人维护”。'}</p>
                              </div>
                            </div>

                            <div className="hj-mock-table-wrap">
                              <table className="hj-mock-table">
                                <thead>
                                  <tr>
                                    <th>{isEn ? 'Month' : '考核月份'}</th>
                                    <th>{isEn ? 'Phase Category' : '排期阶段属性'}</th>
                                    <th>{isEn ? 'Planned Ratio' : '规划分配比例'}</th>
                                    <th>{isEn ? 'Monthly Budget' : '当月规划额度 (万元)'}</th>
                                    <th>{isEn ? 'Status' : '实际核销状态'}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>2026-01</td>
                                    <td><span className="hj-stage-tag bidding">{isEn ? 'Inception & Bidding' : '前期争取阶段'}</span></td>
                                    <td><strong>5.00%</strong> ({isEn ? 'Cap 10%' : '上限 10%'})</td>
                                    <td>{isEn ? '¥180K' : '18.00 万元'}</td>
                                    <td><span className="hj-status-pill ok">{isEn ? '✓ Published' : '✓ 已核销发布'}</span></td>
                                  </tr>
                                  <tr>
                                    <td>2026-02 ~ 04</td>
                                    <td><span className="hj-stage-tag normal">{isEn ? 'Standard R&D (Progressive)' : '正常研制阶段 (前低后高)'}</span></td>
                                    <td><strong>10% → 12% → 13%</strong></td>
                                    <td>{isEn ? '¥1.26M' : '126.00 万元'}</td>
                                    <td><span className="hj-status-pill ok">{isEn ? '✓ In Progress' : '✓ 稳健推进中'}</span></td>
                                  </tr>
                                  <tr>
                                    <td>2026-05</td>
                                    <td><span className="hj-stage-tag delivery">{isEn ? '★ Final Delivery & Acceptance' : '★ 成品发货与终验节点'}</span></td>
                                    <td><strong>55.00% ({isEn ? 'Major Quota' : '核心大头'})</strong></td>
                                    <td>{isEn ? '¥1.98M' : '198.00 万元'}</td>
                                    <td><span className="hj-status-pill blue">{isEn ? 'Pending Release' : '待验收发放'}</span></td>
                                  </tr>
                                  <tr>
                                    <td>2026-06</td>
                                    <td><span className="hj-stage-tag maint">{isEn ? 'Warranty Reserve' : '售后维保储备期'}</span></td>
                                    <td><strong>5.00% ({isEn ? 'Mandatory Retention' : '强制保留'})</strong></td>
                                    <td>{isEn ? '¥180K' : '18.00 万元'}</td>
                                    <td><span className="hj-status-pill warn">{isEn ? '🔒 Locked' : '🔒 维保期锁定'}</span></td>
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
                              <span>
                                {isEn ? (
                                  <>📅 Evaluation Month: <strong>2026-05</strong> (Unified Monthly Overview)</>
                                ) : (
                                  <>📅 当前考评月份：<strong>2026-05</strong>（全项目当月集中透视表）</>
                                )}
                              </span>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <span className="hj-mock-btn-chip">{isEn ? '⚡ Auto Apply Ratios' : '⚡ 一键套用当月规划比例'}</span>
                                <span className="hj-mock-btn-chip primary">{isEn ? '🚀 Batch Publish All' : '🚀 一键批量发布全部合格方案'}</span>
                              </div>
                            </div>
                            <div className="hj-mock-table-wrap">
                              <table className="hj-mock-table">
                                <thead>
                                  <tr>
                                    <th>{isEn ? 'Project / Order ID' : '项目名称 / 工作令号'}</th>
                                    <th>{isEn ? 'Total Contract' : '合同总额'}</th>
                                    <th>{isEn ? 'Monthly Rate' : '当月项目分配率'}</th>
                                    <th>{isEn ? 'Allocatable Pool' : '当月可分池'}</th>
                                    <th>{isEn ? 'Member Ratio Check (=100%)' : '项目成员配比校验 (合计必须=100%)'}</th>
                                    <th>{isEn ? 'Status' : '状态'}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td><b>{isEn ? 'Integrated Optical Sensor System' : '某型综合光电探测系统'}</b> (GF-2026-01)</td>
                                    <td>{isEn ? '¥3.6M' : '360.00 万'}</td>
                                    <td><strong>15.00%</strong></td>
                                    <td><strong>{isEn ? '¥540K' : '54.00 万'}</strong></td>
                                    <td>{isEn ? 'M. Ren 35% (189K) · M. Chen 25% (135K) · 4 others 40%' : '任某某 35% (18.90万) · 陈某某 25% (13.50万) · 王某某等4人 40%'}</td>
                                    <td><span className="hj-status-pill ok">{isEn ? '100% Passed' : '100% 校验通过'}</span></td>
                                  </tr>
                                  <tr>
                                    <td><b>{isEn ? 'Precision Servo Control Module' : '高精度伺服控制模块'}</b> (GF-2026-02)</td>
                                    <td>{isEn ? '¥1.8M' : '180.00 万'}</td>
                                    <td><strong>20.00%</strong></td>
                                    <td><strong>{isEn ? '¥360K' : '36.00 万'}</strong></td>
                                    <td>{isEn ? 'M. Chen 40% (144K) · M. Li 35% (126K) · M. Zhao 25% (90K)' : '陈某某 40% (14.40万) · 李某某 35% (12.60万) · 赵某某 25% (9.00万)'}</td>
                                    <td><span className="hj-status-pill ok">{isEn ? '100% Passed' : '100% 校验通过'}</span></td>
                                  </tr>
                                  <tr>
                                    <td><b>{isEn ? 'Edge Computing Algorithm Payload' : '边缘计算载荷算法升级'}</b> (KY-2026-05)</td>
                                    <td>{isEn ? '¥1.2M' : '120.00 万'}</td>
                                    <td><strong>10.00%</strong></td>
                                    <td><strong>{isEn ? '¥120K' : '12.00 万'}</strong></td>
                                    <td>{isEn ? 'M. Wang 45% (54K) · 3 others 55% (66K)' : '王某某 45% (5.40万) · 张某某等3人 55% (6.60万)'}</td>
                                    <td><span className="hj-status-pill ok">{isEn ? '100% Passed' : '100% 校验通过'}</span></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* 4. 常用项目组矩阵预览 */}
                        {activePreview === 'groups' && (
                          <div className="hj-mock-panel">
                            <div className="hj-mock-toolbar">
                              <span>{isEn ? '👥 Standard Project Group Templates (General / Product / R&D)' : '👥 常用项目组模版矩阵（总体组 / 产品组 / 研发组）'}</span>
                              <span className="hj-mock-btn-chip primary">{isEn ? '+ New Template' : '+ 新建项目组模版'}</span>
                            </div>
                            <div className="hj-mock-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                              <div className="hj-mock-kpi-card blue">
                                <span>{isEn ? 'General System Team' : '总体型号主研组'}</span>
                                <strong>{isEn ? 'General 40% · Product 35% · R&D 25%' : '总体组 40% · 产品组 35% · 研发组 25%'}</strong>
                                <em>{isEn ? 'Bound to 4 major engineering contracts' : '已绑定 4 个重大系统工程合同'}</em>
                              </div>
                              <div className="hj-mock-kpi-card emerald">
                                <span>{isEn ? 'Batch Production Team' : '批产交付攻坚组'}</span>
                                <strong>{isEn ? 'Product 55% · General 25% · R&D 20%' : '产品组 55% · 总体组 25% · 研发组 20%'}</strong>
                                <em>{isEn ? 'Bound to 3 series production lines' : '已绑定 3 项系列批产工程'}</em>
                              </div>
                              <div className="hj-mock-kpi-card amber">
                                <span>{isEn ? 'Core Algorithm Pre-Research' : '核心算法预研组'}</span>
                                <strong>{isEn ? 'R&D 60% · General 25% · Product 15%' : '研发组 60% · 总体组 25% · 产品组 15%'}</strong>
                                <em>{isEn ? 'Bound to 2 scientific research projects' : '已绑定 2 项前沿科研课题'}</em>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 5. 团队编制花名册预览 */}
                        {activePreview === 'employees' && (
                          <div className="hj-mock-panel">
                            <div className="hj-mock-toolbar">
                              <span>{isEn ? '📋 Department Roster (18 Members in Total)' : '📋 部门团队编制花名册（共 18 人）'}</span>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <span className="hj-mock-btn-chip">{isEn ? 'Import CSV Roster' : '批量导入员工 CSV'}</span>
                                <span className="hj-mock-btn-chip primary">{isEn ? '+ Add Member' : '+ 手动新增成员'}</span>
                              </div>
                            </div>
                            <div className="hj-mock-table-wrap">
                              <table className="hj-mock-table">
                                <thead>
                                  <tr>
                                    <th>{isEn ? 'Employee ID' : '员工工号'}</th>
                                    <th>{isEn ? 'Name' : '姓名'}</th>
                                    <th>{isEn ? 'Functional Group' : '所属专业组'}</th>
                                    <th>{isEn ? 'Title / Role' : '职务与角色'}</th>
                                    <th>{isEn ? 'Participating Projects' : '参研项目数'}</th>
                                    <th>{isEn ? 'Status' : '在岗状态'}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>EMP-001</td>
                                    <td><b>{isEn ? 'M. Ren' : '任某某'}</b></td>
                                    <td><span className="hj-stage-tag bidding">{isEn ? 'General Group' : '总体组'}</span></td>
                                    <td>{isEn ? 'Chief Engineer / Project Leader' : '主任设计师 / 项目总师'}</td>
                                    <td>5</td>
                                    <td><span className="hj-status-pill ok">{isEn ? 'Active' : '在岗执行'}</span></td>
                                  </tr>
                                  <tr>
                                    <td>EMP-002</td>
                                    <td><b>{isEn ? 'M. Chen' : '陈某某'}</b></td>
                                    <td><span className="hj-stage-tag normal">{isEn ? 'Product Group' : '产品组'}</span></td>
                                    <td>{isEn ? 'Product Manager / Lead' : '主管产品经理 / 组长'}</td>
                                    <td>4</td>
                                    <td><span className="hj-status-pill ok">{isEn ? 'Active' : '在岗执行'}</span></td>
                                  </tr>
                                  <tr>
                                    <td>EMP-003</td>
                                    <td><b>{isEn ? 'M. Wang' : '王某某'}</b></td>
                                    <td><span className="hj-stage-tag delivery">{isEn ? 'R&D Group' : '研发组'}</span></td>
                                    <td>{isEn ? 'Senior Algorithm Engineer' : '资深算法工程师'}</td>
                                    <td>3</td>
                                    <td><span className="hj-status-pill ok">{isEn ? 'Active' : '在岗执行'}</span></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* 6. 绩效准则与规范预览 */}
                        {activePreview === 'rules' && (
                          <div className="hj-mock-panel">
                            <div className="hj-mock-toolbar">
                              <span>{isEn ? '📖 Merit Evaluation Guidelines & Project Leader Reference Ranges' : '📖 绩效准则与规范 · 负责人参考系数区间'}</span>
                            </div>
                            <div className="hj-mock-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                              <div className="hj-mock-kpi-card blue">
                                <span>{isEn ? 'Small Project (< ¥500K)' : '小型项目（< 50 万元）'}</span>
                                <strong>60% – 90%</strong>
                                <em>{isEn ? 'Heavy individual focus · Direct delivery' : '高集中度 · 负责人亲自把控交付'}</em>
                              </div>
                              <div className="hj-mock-kpi-card emerald">
                                <span>{isEn ? 'Medium Project (¥500K - ¥5M)' : '中型项目（50 万 – 500 万元）'}</span>
                                <strong>30% – 60%</strong>
                                <em>{isEn ? 'Balanced division between leads and members' : '均衡分工 · 负责人协同骨干研制'}</em>
                              </div>
                              <div className="hj-mock-kpi-card amber">
                                <span>{isEn ? 'Large Major Project (≥ ¥5M)' : '大型重点项目（≥ 500 万元）'}</span>
                                <strong>10% – 30%</strong>
                                <em>{isEn ? 'Broad collaborative execution across groups' : '全员协同 · 总体/产品/研发广泛分润'}</em>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 7. 核算员汇总预览 */}
                        {activePreview === 'auditor' && (
                          <div className="hj-mock-panel">
                            <div className="hj-mock-toolbar">
                              <span>{isEn ? '📊 Auditor Rollup: Cross-Project Consolidation' : '📊 专职核算员大盘：全员跨项目分配总表'}</span>
                              <span className="hj-mock-btn-chip primary">{isEn ? 'Import .json Package' : '拖拽导入项目数据包 (.json)'}</span>
                            </div>
                            <div className="hj-mock-table-wrap">
                              <table className="hj-mock-table">
                                <thead>
                                  <tr>
                                    <th>{isEn ? 'Employee' : '员工姓名'}</th>
                                    <th>{isEn ? 'Group' : '专业组'}</th>
                                    <th>{isEn ? 'Optical Sensor' : '综合光电'}</th>
                                    <th>{isEn ? 'Servo Control' : '伺服控制'}</th>
                                    <th>{isEn ? 'Edge Payload' : '边缘载荷'}</th>
                                    <th>{isEn ? 'Monthly Total' : '当月合计绩点'}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td><b>{isEn ? 'M. Ren' : '任某某'}</b></td>
                                    <td>{isEn ? 'General Group' : '总体组'}</td>
                                    <td>{isEn ? '¥189K' : '18.90 万'}</td>
                                    <td>—</td>
                                    <td>{isEn ? '¥33K' : '3.30 万'}</td>
                                    <td><strong className="hj-accent-pts">{isEn ? '¥222K' : '22.20 万元'}</strong></td>
                                  </tr>
                                  <tr>
                                    <td><b>{isEn ? 'M. Chen' : '陈某某'}</b></td>
                                    <td>{isEn ? 'Product Group' : '产品组'}</td>
                                    <td>{isEn ? '¥135K' : '13.50 万'}</td>
                                    <td>{isEn ? '¥144K' : '14.40 万'}</td>
                                    <td>—</td>
                                    <td><strong className="hj-accent-pts">{isEn ? '¥279K' : '27.90 万元'}</strong></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* 8. 双向闭环矩阵预览 */}
                        {activePreview === 'reports' && (
                          <div className="hj-mock-panel">
                            <div className="hj-mock-toolbar">
                              <span>{isEn ? '📊 2D Pivot Matrix: Horizontal & Vertical 100% Closure' : '📊 二维透视矩阵：横向个人×纵向项目双向 100% 严密闭环'}</span>
                              <span className="hj-mock-btn-chip">{isEn ? 'Export Excel CSV' : '导出兼容 Excel 的 CSV'}</span>
                            </div>
                            <div className="hj-mock-table-wrap">
                              <table className="hj-mock-table">
                                <thead>
                                  <tr>
                                    <th>{isEn ? 'No.' : '序号'}</th>
                                    <th>{isEn ? 'Member' : '参评成员'}</th>
                                    <th>{isEn ? 'Optical Sensor' : '综合光电'}</th>
                                    <th>{isEn ? 'Servo Control' : '伺服控制'}</th>
                                    <th>{isEn ? 'Edge Payload' : '边缘载荷'}</th>
                                    <th>{isEn ? 'Horizontal Sum' : '横向：个人累加 (万元)'}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>1</td>
                                    <td><b>{isEn ? 'M. Ren' : '任某某'}</b></td>
                                    <td>18.90</td>
                                    <td>—</td>
                                    <td>3.30</td>
                                    <td><strong className="hj-accent-pts">22.20</strong></td>
                                  </tr>
                                  <tr>
                                    <td>2</td>
                                    <td><b>{isEn ? 'M. Chen' : '陈某某'}</b></td>
                                    <td>13.50</td>
                                    <td>14.40</td>
                                    <td>—</td>
                                    <td><strong className="hj-accent-pts">27.90</strong></td>
                                  </tr>
                                  <tr className="hj-mock-sum-row">
                                    <td>—</td>
                                    <td><b>{isEn ? 'Vertical Sum' : '纵向：项目累加'}</b></td>
                                    <td><strong>54.00</strong></td>
                                    <td><strong>36.00</strong></td>
                                    <td><strong>12.00</strong></td>
                                    <td><strong className="hj-accent-pts">{isEn ? 'Total Closed: ¥1.02M' : '总计闭环：102.00 万'}</strong></td>
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
                                <span>👑 {isEn ? 'Annual Navigator Star (TOP 1)' : '年度功勋领航之星 (TOP 1)'}</span>
                                <strong>{isEn ? 'M. Ren · General Group' : '任某某 · 总体组'}</strong>
                                <em>{isEn ? 'Cumulative ¥1.685M points · Led 5 major deliveries' : '年度累计斩获 168.50 万绩点 · 领衔 5 项重大工程交付'}</em>
                              </div>
                              <div className="hj-mock-kpi-card emerald">
                                <span>🏆 {isEn ? 'Quarterly Trailblazer' : '季度卓越攻坚标兵'}</span>
                                <strong>{isEn ? 'M. Chen · Product Group' : '陈某某 · 产品组'}</strong>
                                <em>{isEn ? 'Quarterly ¥642K points · Batch delivery on schedule' : '本季累计贡献 64.20 万绩点 · 核心型号批产按期交付'}</em>
                              </div>
                              <div className="hj-mock-kpi-card blue">
                                <span>🌟 {isEn ? 'Monthly Star' : '月度领跑之星'}</span>
                                <strong>{isEn ? 'M. Wang · R&D Group' : '王某某 · 研发组'}</strong>
                                <em>{isEn ? 'Monthly ¥248K points · Outstanding field testing' : '当月斩获 24.80 万绩点 · 算法联调与外场试验突出贡献'}</em>
                              </div>
                            </div>
                            <div className="hj-mock-table-wrap">
                              <table className="hj-mock-table">
                                <thead>
                                  <tr>
                                    <th>{isEn ? 'Medal' : '荣誉奖牌'}</th>
                                    <th>{isEn ? 'Recipient' : '获奖人'}</th>
                                    <th>{isEn ? 'Group' : '所属专业组'}</th>
                                    <th>{isEn ? 'Key Contribution Project' : '代表贡献项目'}</th>
                                    <th>{isEn ? 'Total Points' : '累计核定绩点'}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>🥇 {isEn ? 'Gold Champion' : '冠军金奖'}</td>
                                    <td><b>{isEn ? 'M. Ren' : '任某某'}</b></td>
                                    <td>{isEn ? 'General Group' : '总体组'}</td>
                                    <td>{isEn ? 'Integrated Optical Sensor System (GF-2026-01)' : '某型综合光电探测系统研制 (GF-2026-01)'}</td>
                                    <td><strong className="hj-accent-pts">{isEn ? '¥1.685M' : '168.50 万元'}</strong></td>
                                  </tr>
                                  <tr>
                                    <td>🥈 {isEn ? 'Silver Runner-Up' : '亚军银奖'}</td>
                                    <td><b>{isEn ? 'M. Chen' : '陈某某'}</b></td>
                                    <td>{isEn ? 'Product Group' : '产品组'}</td>
                                    <td>{isEn ? 'Precision Servo Control Module (GF-2026-02)' : '高精度伺服控制模块批产交付 (GF-2026-02)'}</td>
                                    <td><strong className="hj-accent-pts">{isEn ? '¥1.423M' : '142.30 万元'}</strong></td>
                                  </tr>
                                  <tr>
                                    <td>🥉 {isEn ? 'Bronze Third' : '季军铜奖'}</td>
                                    <td><b>{isEn ? 'M. Wang' : '王某某'}</b></td>
                                    <td>{isEn ? 'R&D Group' : '研发组'}</td>
                                    <td>{isEn ? 'Edge Computing Algorithm Payload (KY-2026-05)' : '智能边缘计算载荷算法软件升级 (KY-2026-05)'}</td>
                                    <td><strong className="hj-accent-pts">{isEn ? '¥1.289M' : '128.90 万元'}</strong></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* 10. 数据资产与灾备中心预览 */}
                        {activePreview === 'data_io' && (
                          <div className="hj-mock-panel">
                            <div className="hj-mock-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                              <div className="hj-mock-kpi-card emerald">
                                <span>🔒 {isEn ? 'AES-256-GCM Container' : 'AES-256-GCM 加密容器'}</span>
                                <strong>{isEn ? 'D:\\HengJi_Workspace.hengji' : 'D:\\衡绩工作区.hengji'}</strong>
                                <em>{isEn ? 'PBKDF2 100K iterations · Non-system drive persistence' : 'PBKDF2 10万次加盐迭代 · 非系统盘安全持久化'}</em>
                              </div>
                              <div className="hj-mock-kpi-card blue">
                                <span>📦 {isEn ? 'Cross-Project Offline Package' : '跨项目离线数据包'}</span>
                                <strong>{isEn ? 'Export project bundle (.json)' : '一键导出项目合包 (.json)'}</strong>
                                <em>{isEn ? 'Bundle projects with one click for auditor rollup' : '项目负责人一键打包名下项目，供专职核算员汇总'}</em>
                              </div>
                              <div className="hj-mock-kpi-card amber">
                                <span>🛡️ {isEn ? 'Dual Mirror Backup' : '双重自动镜像灾备'}</span>
                                <strong>.hengji.backup {isEn ? 'Real-time Sync' : '实时同步'}</strong>
                                <em>{isEn ? 'Auto hot-mirror generation on every save' : '每次保存自动生成同目录热备镜像，支持全量快照恢复'}</em>
                              </div>
                            </div>
                            <div className="hj-mock-table-wrap">
                              <table className="hj-mock-table">
                                <thead>
                                  <tr>
                                    <th>{isEn ? 'Data Asset / I/O Module' : '数据资产与导入导出模块'}</th>
                                    <th>{isEn ? 'Formats' : '支持格式'}</th>
                                    <th>{isEn ? 'Security & Description' : '安全机制与业务说明'}</th>
                                    <th>{isEn ? 'Action' : '快捷操作'}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td><b>{isEn ? 'Contract & Roster Batch Import' : '工程合同与员工花名册批量导入'}</b></td>
                                    <td><code>.csv / Excel</code></td>
                                    <td>{isEn ? 'Cleans commas, currency symbols, and precision floats' : '自动清洗千分位、货币符号与超长小数，支持同令号多合同'}</td>
                                    <td><span className="hj-status-pill ok">{isEn ? 'Tolerant Parser' : '高容错解析'}</span></td>
                                  </tr>
                                  <tr>
                                    <td><b>{isEn ? 'Project Leader Package Routing' : '项目负责人绩效数据包流转'}</b></td>
                                    <td><code>.json {isEn ? 'package' : '数据包'}</code></td>
                                    <td>{isEn ? 'Aggregates points by unique ID to prevent homophone mixups' : '按唯一工号自动归集跨项目个人绩点，严防同名混淆'}</td>
                                    <td><span className="hj-status-pill blue">{isEn ? 'Bundle Export' : '支持合包导出'}</span></td>
                                  </tr>
                                  <tr>
                                    <td><b>{isEn ? 'Enterprise Encrypted Snapshot' : '企业级全量加密灾备快照'}</b></td>
                                    <td><code>.hengji.enc</code></td>
                                    <td>{isEn ? 'Full backup of staff, contracts, templates, and history' : '完整备份员工、合同、项目组模版与历月分配方案'}</td>
                                    <td><span className="hj-status-pill warn">{isEn ? 'Password Protected' : '口令认证保护'}</span></td>
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

          {/* ==================== 滚动区块 1：CORE CAPABILITIES ==================== */}
          <section id="home-features-sec" className="hj-features-section">
            <div className="hj-section-container">
              <div className="hj-section-header">
                <span className="hj-section-eyebrow">CORE CAPABILITIES</span>
                <h2>{isEn ? 'Why Engineering & Research Teams Choose HengJi' : '为什么工程与科研团队选择「衡绩」？'}</h2>
                <p>
                  {isEn
                    ? 'Six foundational pillars custom-built for multi-project lines, cross-cycle deliveries, and strict financial auditability'
                    : '针对多型号并线、跨周期交付、内网涉密与财务严密审计场景深度定制的六大核心支柱'}
                </p>
              </div>

              <div className="hj-features-grid">
                <div className="hj-feature-card">
                  <div className="hj-feature-icon emerald"><ShieldCheck size={22} /></div>
                  <h3>{isEn ? 'Local Offline Encryption · Non-System Drive' : '纯本地离线加密 · 默认非系统盘'}</h3>
                  <p>
                    {isEn ? (
                      <>
                        Powered by <code>PBKDF2-SHA256</code> (100,000 salt iterations) and <code>AES-256-GCM</code> authenticated encryption.
                        Your operational data is stored in your chosen D:/E: drive <code>.hengji</code> file with automated <code>.backup</code> snapshots on every save. Zero cloud exposure.
                      </>
                    ) : (
                      <>
                        采用 <code>PBKDF2-SHA256</code>（10万次加盐迭代）与 <code>AES-256-GCM</code> 认证加密。
                        业务数据保存在您自主指定的 D/E 盘或保密盘 <code>.hengji</code> 文件中，每次保存自动生成 <code>.backup</code> 镜像，零云端上传风险。
                      </>
                    )}
                  </p>
                </div>

                <div className="hj-feature-card">
                  <div className="hj-feature-icon amber"><Sliders size={22} /></div>
                  <h3>{isEn ? 'Anti-Overdraft Phasing · Delivery-Focused' : '前低后高稳健排期 · 防前期透支'}</h3>
                  <p>
                    {isEn
                      ? 'Innovative 3-phase lifecycle model: Initial bidding phase capped at 0~10% (default 5%), primary delivery phase locking 45%+ major incentive, and final warranty phase mandatory 5% retention.'
                      : '独创三段式全生命周期额度模型：前期项目争取阶段限高 0~10%（默认 5%），主体研制与成品发货交付锁定 45%+ 大头，末月售后维保强制保留 5%，彻底杜绝“前期分光、后期无钱”。'}
                  </p>
                </div>

                <div className="hj-feature-card">
                  <div className="hj-feature-icon blue"><CalendarRange size={22} /></div>
                  <h3>{isEn ? 'Unified Monthly Grid · Batch Publish' : '全项目当月集中大表 · 批量发布'}</h3>
                  <p>
                    {isEn
                      ? 'Say goodbye to clicking through dozens of individual project dialogs. At month-end review, all ongoing projects are displayed in one unified sheet with 100% ratio verification and one-click batch release.'
                      : '告别传统系统逐个点开几十个项目的繁琐操作。月底考评时，所有在研项目集中呈现在一张透视大表，支持一键套用当月规划、快速配置团队比例（100% 校验）与一键批量发布/撤回。'}
                  </p>
                </div>

                <div className="hj-feature-card">
                  <div className="hj-feature-icon purple"><Calculator size={22} /></div>
                  <h3>{isEn ? 'Offline Package Routing · Auditor Rollup' : '离线数据包流转 · 专职核算员大盘'}</h3>
                  <p>
                    {isEn
                      ? 'Built-in dual workspaces (General Admin & Performance Auditor). Project leaders export project packages or unified bundles; auditors simply drag-and-drop to roll up all personnel cross-project allocations.'
                      : '内置双工作区模式（🏢 综合管理工作区 / 📊 绩效核算工作区）。项目负责人一键导出项目数据包或名下全项目合包，核算员拖拽导入即可完成全员跨项目汇总、合同监控与审计流水核查。'}
                  </p>
                </div>

                <div className="hj-feature-card">
                  <div className="hj-feature-icon cyan"><Table2 size={22} /></div>
                  <h3>{isEn ? 'BigInt Cents · 100% Closed-Loop Audit' : 'BigInt 精确到分 · 行列双向 100% 闭环'}</h3>
                  <p>
                    {isEn ? (
                      <>
                        Eliminates floating-point errors completely using integer cents and <code>BigInt</code> paired with the Largest Remainder Method.
                        Horizontal member sums and vertical project sums match down to the exact cent.
                      </>
                    ) : (
                      <>
                        底层摒弃浮点数误差，全部采用整数“分”与 <code>BigInt</code> 结合最大余额法（Largest Remainder）分润。二维透视矩阵中横向个人累加与纵向项目累加分毫不差，全面兼容财务千分位 CSV 导入导出。
                      </>
                    )}
                  </p>
                </div>

                <div className="hj-feature-card">
                  <div className="hj-feature-icon rose"><Trophy size={22} /></div>
                  <h3>{isEn ? 'Functional Matrix · Hall of Merit Stars' : '专业组协同矩阵 · 卓越绩星荣誉殿堂'}</h3>
                  <p>
                    {isEn
                      ? 'Deep alignment with General, Product, and R&D matrix structures with reusable team ratio templates. Automatically selects monthly stars, quarterly pacesetters, and annual navigators with medal rankings.'
                      : '深度契合“总体组、产品组、研发组”矩阵式架构，支持沉淀常用项目组默认分润模版；基于实绩自动评选月度之星、季度标兵与年度领航之星，配套冠亚季军荣誉奖牌榜。'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== 滚动区块 2：5-STEP WORKFLOW ==================== */}
          <section id="home-workflow-sec" className="hj-workflow-section">
            <div className="hj-section-container">
              <div className="hj-section-header">
                <span className="hj-section-eyebrow">5-STEP END-TO-END WORKFLOW</span>
                <h2>{isEn ? '5 Steps to Build an End-to-End Quantitative Merit Loop' : '五步构建端到端量化绩效考核闭环'}</h2>
                <p>
                  {isEn
                    ? 'Clear standardized operating procedures: complete setup, scheduling, monthly review, and reporting in 5 minutes'
                    : '清晰的标准化作业流程，5 分钟即可完成从建库、排期到月底考评与报表输出'}
                </p>
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
                      <span>{isEn ? `Try Step ${idx + 1} Online` : `在线体验第 ${idx + 1} 步`}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ==================== 滚动区块 3：DOWNLOAD & DEPLOYMENT ==================== */}
          <section id="home-download-sec" className="hj-download-section">
            <div className="hj-section-container">
              <div className="hj-section-header">
                <span className="hj-section-eyebrow">DOWNLOAD &amp; DEPLOYMENT</span>
                <h2>{isEn ? `Download HengJi Desktop Offline Client (v${latestVer})` : `下载衡绩桌面离线版客户端 (v${latestVer})`}</h2>
                <p>
                  {isEn
                    ? 'Four official Windows packaging formats with native GUI and zero terminal popups. Defaults to non-system drive (D:\\ / E:\\) to satisfy strict intranet deployment guidelines.'
                    : '提供四种 Windows 官方打包分发格式，全程原生 GUI 无终端弹窗，默认引导安装至非系统盘（D:\\ / E:\\），满足企业与涉密内网严苛部署要求'}
                </p>
              </div>

              <div className="hj-download-grid">
                {/* 1. EXE 标准安装向导版 */}
                <div className="hj-dl-card recommended">
                  <div className="hj-dl-ribbon">{isEn ? '★ Recommended' : '★ 官方推荐'}</div>
                  <div className="hj-dl-header">
                    <div className="hj-dl-icon blue"><Sparkles size={22} /></div>
                    <div>
                      <h3>{isEn ? 'EXE Standard Setup Wizard' : 'EXE 标准安装向导版'}</h3>
                      <span>hengji-{latestVer}.exe · Windows x64</span>
                    </div>
                  </div>
                  <p className="hj-dl-desc">
                    {isEn
                      ? 'NSIS-based standard graphical installer. Supports custom non-system drive installation paths, desktop & start menu shortcuts, and seamless overlay upgrades.'
                      : '基于 NSIS 的图形化标准安装程序，支持自由选择非系统盘安装路径，自动创建桌面与开始菜单快捷方式，支持平滑覆盖升级。'}
                  </p>
                  <div className="hj-dl-actions">
                    <a href={getDownloadUrl('setup', true)} target="_blank" rel="noopener noreferrer" className="hj-dl-btn primary">
                      <Download size={15} />
                      <span>{isEn ? 'Fast Mirror Download (.exe)' : '国内高速镜像下载 (.exe)'}</span>
                    </a>
                    <a href={getDownloadUrl('setup', false)} target="_blank" rel="noopener noreferrer" className="hj-dl-btn ghost">
                      <span>{isEn ? 'GitHub Source' : 'GitHub 源站'}</span>
                    </a>
                  </div>
                </div>

                {/* 2. MSI 企业级安装包 */}
                <div className="hj-dl-card">
                  <div className="hj-dl-header">
                    <div className="hj-dl-icon cyan"><Package size={22} /></div>
                    <div>
                      <h3>{isEn ? 'MSI Enterprise Package' : 'MSI 企业级安装包'}</h3>
                      <span>hengji-{latestVer}.msi · Windows Installer</span>
                    </div>
                  </div>
                  <p className="hj-dl-desc">
                    {isEn
                      ? 'Native Windows Installer package supporting custom non-system drives, ideal for centralized corporate domain control and standardized deployments.'
                      : '原生 Windows Installer 标准包，支持自定义非系统盘目录（如 D:\\衡绩员工绩点考核系统），适合单位域控与标准化分发。'}
                  </p>
                  <div className="hj-dl-actions">
                    <a href={getDownloadUrl('msi', true)} target="_blank" rel="noopener noreferrer" className="hj-dl-btn cyan">
                      <Download size={15} />
                      <span>{isEn ? 'Fast Mirror Download (.msi)' : '国内高速镜像下载 (.msi)'}</span>
                    </a>
                    <a href={getDownloadUrl('msi', false)} target="_blank" rel="noopener noreferrer" className="hj-dl-btn ghost">
                      <span>{isEn ? 'GitHub Source' : 'GitHub 源站'}</span>
                    </a>
                  </div>
                </div>

                {/* 3. Portable 便携单文件版 */}
                <div className="hj-dl-card">
                  <div className="hj-dl-header">
                    <div className="hj-dl-icon emerald"><HardDrive size={22} /></div>
                    <div>
                      <h3>{isEn ? 'Portable Single Executable' : 'Portable 便携单文件版'}</h3>
                      <span>hengji-portable-{latestVer}.exe · {isEn ? 'Zero Install' : '免安装即用'}</span>
                    </div>
                  </div>
                  <p className="hj-dl-desc">
                    {isEn
                      ? 'Zero installation and no registry modifications! Single green executable file. Run directly from USB drives, external storage, or any folder.'
                      : '零安装、不写注册表！单文件绿色可执行程序，放入 U 盘、移动硬盘或任意非系统盘目录双击即可直接运行，随身携带。'}
                  </p>
                  <div className="hj-dl-actions">
                    <a href={getDownloadUrl('portable', true)} target="_blank" rel="noopener noreferrer" className="hj-dl-btn emerald">
                      <Download size={15} />
                      <span>{isEn ? 'Fast Mirror Download (Portable)' : '国内高速镜像下载 (便携版)'}</span>
                    </a>
                    <a href={getDownloadUrl('portable', false)} target="_blank" rel="noopener noreferrer" className="hj-dl-btn ghost">
                      <span>{isEn ? 'GitHub Source' : 'GitHub 源站'}</span>
                    </a>
                  </div>
                </div>

                {/* 4. ZIP 绿色免安装压缩包 */}
                <div className="hj-dl-card">
                  <div className="hj-dl-header">
                    <div className="hj-dl-icon orange"><FolderKanban size={22} /></div>
                    <div>
                      <h3>{isEn ? 'ZIP Green Portable Archive' : 'ZIP 绿色免安装压缩包'}</h3>
                      <span>hengji-{latestVer}.zip · {isEn ? 'Extract & Run' : '解压即运行'}</span>
                    </div>
                  </div>
                  <p className="hj-dl-desc">
                    {isEn
                      ? 'Standard ZIP green archive requiring no administrator privileges. Extract to any directory and double-click to launch immediately.'
                      : '标准 ZIP 绿色完整目录归档包，无需管理员安装权限，解压到任意磁盘目录后双击 衡绩员工绩点考核系统.exe 即可秒速启动。'}
                  </p>
                  <div className="hj-dl-actions">
                    <a href={getDownloadUrl('zip', true)} target="_blank" rel="noopener noreferrer" className="hj-dl-btn orange">
                      <Download size={15} />
                      <span>{isEn ? 'Fast Mirror Download (.zip)' : '国内高速镜像下载 (.zip)'}</span>
                    </a>
                    <a href={getDownloadUrl('zip', false)} target="_blank" rel="noopener noreferrer" className="hj-dl-btn ghost">
                      <span>{isEn ? 'GitHub Source' : 'GitHub 源站'}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* 源码构建命令栏 */}
              <div className="hj-dl-footer-bar">
                <div className="hj-dl-cmd-box">
                  <span className="hj-cmd-label">{isEn ? 'Build from source & run locally:' : '源码构建与本地运行：'}</span>
                  <code>git clone https://github.com/zoufudun/hengji.git &amp;&amp; npm ci &amp;&amp; npm run desktop:start</code>
                  <button
                    type="button"
                    className="hj-copy-btn"
                    onClick={() => handleCopyText('git clone https://github.com/zoufudun/hengji.git && npm ci && npm run desktop:start', 'cmd')}
                  >
                    {copiedKey === 'cmd' ? (isEn ? '✓ Copied' : '✓ 已复制') : (isEn ? 'Copy Command' : '复制命令')}
                  </button>
                </div>
                <div className="hj-dl-links">
                  <a href={GITHUB_RELEASES_URL} target="_blank" rel="noopener noreferrer">
                    <span>{isEn ? 'View GitHub Releases Version History' : '查看 GitHub Releases 历史版本'}</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ==================== 滚动区块 4：底部行动号召卡片与页脚 ==================== */}
          <footer className="hj-footer">
            <div className="hj-footer-cta">
              <h2>{isEn ? 'Ready for Efficient, Transparent & Auditable Merit Evaluation?' : '准备好开启高效、透明、严谨的团队绩点考核了吗？'}</h2>
              <p>
                {isEn
                  ? 'No server setup needed. Experience the full system in your browser now or download the Windows offline client for production.'
                  : '无需注册配置服务器，立即在浏览器中体验完整功能，或下载 Windows 桌面离线版投入正式使用。'}
              </p>
              <div className="hj-footer-cta-btns">
                <button
                  type="button"
                  className="hj-cta-primary"
                  onClick={() => onLaunchDemo('dashboard', 'general')}
                >
                  <Play size={16} fill="currentColor" />
                  <span>{isEn ? 'Try HengJi Online Now' : '立即在线体验衡绩系统'}</span>
                </button>
                <a
                  href={getDownloadUrl('setup', true)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hj-cta-secondary"
                  style={{ textDecoration: 'none' }}
                >
                  <Download size={16} />
                  <span>{isEn ? `Free Download Desktop App (v${latestVer})` : `免费下载桌面离线客户端 (v${latestVer})`}</span>
                </a>
              </div>
            </div>

            <div className="hj-footer-bottom">
              <div className="hj-footer-brand">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <img src={brandHengSeal} alt="衡" width={28} height={28} style={{ borderRadius: 6, objectFit: 'cover' }} />
                  <img src={brandBurstFlower} alt="衡绩" width={28} height={28} style={{ borderRadius: 6, objectFit: 'contain' }} />
                  <strong style={{ fontSize: '16px' }}>{isEn ? 'HengJi · Employee Merit System' : '衡绩 · 员工绩点考核系统 (HengJi)'}</strong>
                </div>
                <p>
                  {isEn
                    ? 'Measure every project contribution with precision and equity. An offline secure merit evaluation platform for engineering and research teams.'
                    : '让每一份项目贡献，都有据可衡。面向工程与科研团队的离线安全量化绩效管理平台。'}
                </p>
                <p style={{ marginTop: '6px', opacity: 0.75 }}>
                  {isEn ? 'Development Team: TOPFIRE R&D Team' : `开发团队：${APP_AUTHOR}`} · {isEn ? 'Contact Email: ' : '联系邮箱：'}<a href={`mailto:${APP_CONTACT}`}>{APP_CONTACT}</a>
                </p>
              </div>

              <div className="hj-footer-links-col">
                <h4>{isEn ? 'Quick Access' : '快速入口'}</h4>
                <button type="button" onClick={() => onLaunchDemo('dashboard', 'general')}>{isEn ? 'General Admin Workspace' : '在线体验综合管理工作台'}</button>
                <button type="button" onClick={() => onLaunchDemo('auditor', 'auditor')}>{isEn ? 'Performance Auditor Workspace' : '在线体验绩效核算员工作台'}</button>
                <button type="button" onClick={() => onLaunchDemo('rules', 'general')}>{isEn ? 'Merit Guidelines & Formulas' : '查看绩效考核准则与公式'}</button>
                <button type="button" onClick={() => navigatePage('download')}>{isEn ? 'Download Client Matrix' : '客户端下载矩阵'}</button>
              </div>

              <div className="hj-footer-links-col">
                <h4>{isEn ? 'Open Source & Resources' : '开源与资源'}</h4>
                <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">{isEn ? 'GitHub Repository' : 'GitHub 源码仓库'}</a>
                <a href={GITHUB_RELEASES_URL} target="_blank" rel="noopener noreferrer">{isEn ? 'Releases Packages' : 'Releases 历史安装包'}</a>
                <button type="button" onClick={() => navigatePage('changelog')}>{isEn ? `Changelog (v${APP_VERSION})` : `版本更新日志 (v${APP_VERSION})`}</button>
                <button type="button" onClick={() => navigatePage('docs')}>{isEn ? '5-Step User Docs' : '五步使用文档'}</button>
              </div>
            </div>

            <div className="hj-footer-copyright">
              <span>© {new Date().getFullYear()} {isEn ? 'HengJi Employee Merit System' : '衡绩 (HengJi) Employee Merit System'} · Version v{APP_VERSION} ({APP_BUILD})</span>
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
              {isEn ? `Latest Version: v${latestVer} · Released on ${latestDate}` : `最新版本 v${latestVer} · 发布于 ${latestDate}`}
            </div>

            <a
              href={getDownloadUrl('msi', true)}
              target="_blank"
              rel="noopener noreferrer"
              className="cc-dl-main-btn"
            >
              <Download size={18} />
              <span>{isEn ? 'Download Windows Edition · ~82 MB' : '下载 Windows 版 · 约 82 MB'}</span>
            </a>

            <div className="cc-dl-hints">
              <p>
                {isEn
                  ? 'Not sure which to choose? Most users should pick x64 (defaults to non-system drive D:\\).'
                  : '不确定选哪个？大多数电脑选 x64（默认引导安装至 D:\\ 等非系统盘）。'}
              </p>
              <p>
                {isEn ? 'Prefer trying without install in your browser? ' : '想免安装直接在浏览器里试用？ '}
                <button
                  type="button"
                  className="cc-inline-link"
                  onClick={() => onLaunchDemo('dashboard', 'general')}
                >
                  {isEn ? 'Launch Live Demo Workspace ↗' : '点击立即进入在线体验工作台 ↗'}
                </button>
              </p>
            </div>
          </div>

          <div className="cc-dl-platforms">
            <h2>{isEn ? 'All Formats & Distributions' : '全部平台与分发格式'}</h2>

            <div className="cc-platform-tabs">
              <button type="button" className="cc-plat-tab active">
                Windows
              </button>
              <button
                type="button"
                className="cc-plat-tab"
                onClick={() => onLaunchDemo('dashboard', 'general')}
              >
                {isEn ? 'Web Live Demo (Zero Install)' : 'Web 在线体验版 (跨平台免安装)'}
              </button>
            </div>

            <div className="cc-dl-box">
              {/* 1. MSI 安装包 */}
              <div className="cc-dl-row">
                <div className="cc-dl-row-info">
                  <div className="cc-dl-row-title">
                    <strong>{isEn ? 'MSI Installer (.msi)' : '安装版 (.msi)'}</strong>
                    <span className="cc-badge-rec">{isEn ? 'Recommended' : '推荐'}</span>
                  </div>
                  <div className="cc-dl-row-desc">
                    {isEn
                      ? 'Standard Windows Installer (supports custom non-system drive path, terminal-free)'
                      : 'Windows Installer 标准安装程序（支持自定义非系统盘目录，全程无终端弹窗）'}
                  </div>
                  <div className="cc-dl-sha-line">
                    <span>{isEn ? 'File Identifier' : '文件标识'}</span>
                    <code>x64 hengji-{latestVer}.msi</code>
                    <button
                      type="button"
                      className="cc-copy-icon-btn"
                      onClick={() => handleCopyText(`hengji-${latestVer}.msi`, 'msi')}
                      title={isEn ? 'Copy filename' : '复制文件名'}
                    >
                      {copiedKey === 'msi' ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div className="cc-dl-row-btns">
                  <a href={getDownloadUrl('msi', true)} target="_blank" rel="noopener noreferrer" className="cc-arch-btn">
                    <Download size={13} />
                    <span>{isEn ? 'Fast Mirror · .msi' : 'x64 高速镜像 · .msi'}</span>
                  </a>
                  <a href={getDownloadUrl('msi', false)} target="_blank" rel="noopener noreferrer" className="cc-arch-btn">
                    <Download size={13} />
                    <span>{isEn ? 'GitHub Source' : 'GitHub 源站'}</span>
                  </a>
                </div>
              </div>

              {/* 2. EXE 安装向导版 */}
              <div className="cc-dl-row">
                <div className="cc-dl-row-info">
                  <div className="cc-dl-row-title">
                    <strong>{isEn ? 'Setup Wizard (.exe)' : '安装向导版 (.exe)'}</strong>
                    <span className="cc-badge-rec">{isEn ? 'Wizard' : '向导'}</span>
                  </div>
                  <div className="cc-dl-row-desc">
                    {isEn
                      ? 'NSIS standard graphical setup wizard (auto desktop shortcuts, smooth upgrades)'
                      : 'NSIS 标准图形安装向导（自动创建桌面快捷方式，支持平滑覆盖升级）'}
                  </div>
                  <div className="cc-dl-sha-line">
                    <span>{isEn ? 'File Identifier' : '文件标识'}</span>
                    <code>x64 hengji-{latestVer}.exe</code>
                    <button
                      type="button"
                      className="cc-copy-icon-btn"
                      onClick={() => handleCopyText(`hengji-${latestVer}.exe`, 'exe')}
                      title={isEn ? 'Copy filename' : '复制文件名'}
                    >
                      {copiedKey === 'exe' ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div className="cc-dl-row-btns">
                  <a href={getDownloadUrl('setup', true)} target="_blank" rel="noopener noreferrer" className="cc-arch-btn">
                    <Download size={13} />
                    <span>{isEn ? 'Fast Mirror · .exe' : 'x64 高速镜像 · .exe'}</span>
                  </a>
                  <a href={getDownloadUrl('setup', false)} target="_blank" rel="noopener noreferrer" className="cc-arch-btn">
                    <Download size={13} />
                    <span>{isEn ? 'GitHub Source' : 'GitHub 源站'}</span>
                  </a>
                </div>
              </div>

              {/* 3. ZIP 便携解压版 */}
              <div className="cc-dl-row">
                <div className="cc-dl-row-info">
                  <div className="cc-dl-row-title">
                    <strong>{isEn ? 'Portable Archive (.zip)' : '便携版 (.zip)'}</strong>
                  </div>
                  <div className="cc-dl-row-desc">
                    {isEn
                      ? 'Zero install, extract and run directly from non-system drive or restricted terminals'
                      : '免安装，解压即用（适合内网受限终端或直接解压至 D:\\ 盘运行）'}
                  </div>
                  <div className="cc-dl-sha-line">
                    <span>{isEn ? 'File Identifier' : '文件标识'}</span>
                    <code>x64 hengji-{latestVer}.zip</code>
                    <button
                      type="button"
                      className="cc-copy-icon-btn"
                      onClick={() => handleCopyText(`hengji-${latestVer}.zip`, 'zip')}
                      title={isEn ? 'Copy filename' : '复制文件名'}
                    >
                      {copiedKey === 'zip' ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div className="cc-dl-row-btns">
                  <a href={getDownloadUrl('zip', true)} target="_blank" rel="noopener noreferrer" className="cc-arch-btn">
                    <Download size={13} />
                    <span>{isEn ? 'Fast Mirror · .zip' : 'x64 高速镜像 · .zip'}</span>
                  </a>
                  <a href={getDownloadUrl('zip', false)} target="_blank" rel="noopener noreferrer" className="cc-arch-btn">
                    <Download size={13} />
                    <span>{isEn ? 'GitHub Source' : 'GitHub 源站'}</span>
                  </a>
                </div>
              </div>

              {/* 4. Portable 单文件版 */}
              <div className="cc-dl-row">
                <div className="cc-dl-row-info">
                  <div className="cc-dl-row-title">
                    <strong>{isEn ? 'Portable Single Executable (.exe)' : '便携单文件版 (Portable .exe)'}</strong>
                  </div>
                  <div className="cc-dl-row-desc">
                    {isEn
                      ? 'Single green executable, no registry modifications, perfect for portable encrypted USB drives'
                      : '绿色单可执行文件，不写注册表，可放入移动硬盘或加密 U 盘随身携带'}
                  </div>
                  <div className="cc-dl-sha-line">
                    <span>{isEn ? 'File Identifier' : '文件标识'}</span>
                    <code>x64 hengji-portable-{latestVer}.exe</code>
                    <button
                      type="button"
                      className="cc-copy-icon-btn"
                      onClick={() => handleCopyText(`hengji-portable-${latestVer}.exe`, 'portable')}
                      title={isEn ? 'Copy filename' : '复制文件名'}
                    >
                      {copiedKey === 'portable' ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div className="cc-dl-row-btns">
                  <a href={getDownloadUrl('portable', true)} target="_blank" rel="noopener noreferrer" className="cc-arch-btn">
                    <Download size={13} />
                    <span>{isEn ? 'Fast Mirror · Single Exe' : 'x64 高速镜像 · 单文件'}</span>
                  </a>
                  <a href={getDownloadUrl('portable', false)} target="_blank" rel="noopener noreferrer" className="cc-arch-btn">
                    <Download size={13} />
                    <span>{isEn ? 'GitHub Source' : 'GitHub 源站'}</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="cc-dl-verify-note">
              <p>
                {isEn
                  ? 'Not sure which to choose? Most users pick MSI Installer (.msi) or Setup Wizard (.exe).'
                  : '不确定选哪个？大多数电脑选 安装版 (.msi) 或 安装向导版 (.exe)。'}
              </p>
              <p>
                {isEn
                  ? 'Integrity check: Run certutil -hashfile <file> SHA256 in command prompt to match the hash on GitHub Releases.'
                  : '校验完整性：下载后可在终端执行 certutil -hashfile <file> SHA256，输出应与 GitHub Releases 页面显示的 SHA-256 一致。'}
              </p>
            </div>

            <div className="cc-dl-history-card">
              <h3>{isEn ? 'Historical Versions' : '历史版本'}</h3>
              <p>{isEn ? 'Need older releases? All historical versions are available on GitHub Releases.' : '需要旧版本？所有历史版本均可在 GitHub Releases 获取。'}</p>
              <a href={GITHUB_RELEASES_URL} target="_blank" rel="noopener noreferrer" className="cc-history-link">
                <span>{isEn ? 'Go to GitHub Releases' : '前往 GitHub Releases'}</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </main>
      )}

      {/* ==================== 视图 3：更新日志独立页面 ==================== */}
      {pageView === 'changelog' && (
        <main className="cc-changelog-page">
          <div className="cc-cl-layout">
            {/* 左栏：版本列表 */}
            <aside className="cc-cl-sidebar">
              <div className="cc-cl-sidebar-header">
                <Tag size={15} />
                <strong>{isEn ? 'Version History' : '版本列表'}</strong>
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

            {/* 中栏：当前选中版本的详细发布说明 */}
            <article className="cc-cl-article">
              <div className="cc-cl-article-header">
                <h1>{currentVersionObj.version}</h1>
                <span className="cc-cl-date">
                  <Calendar size={14} />
                  <span>{currentVersionObj.date}</span>
                </span>
              </div>

              <p className="cc-cl-summary">
                {isEn ? (
                  <>
                    Edition <b>[{currentVersionObj.tag}]</b>: {currentVersionObj.title}.
                    Synchronized across all four desktop distributions (MSI / EXE / Portable / ZIP) and the web sandbox. For complete binary packages, visit{' '}
                    <a href={`${GITHUB_RELEASES_URL}/tag/${currentVersionObj.version}`} target="_blank" rel="noopener noreferrer">
                      {currentVersionObj.version} Release Notes
                    </a>.
                  </>
                ) : (
                  <>
                    本版本为<b>「{currentVersionObj.tag}」</b>：{currentVersionObj.title}。
                    所有更新均已同步至桌面离线端四种安装包（MSI / EXE / Portable / ZIP）与网页在线体验工作台，完整发行包请见{' '}
                    <a href={`${GITHUB_RELEASES_URL}/tag/${currentVersionObj.version}`} target="_blank" rel="noopener noreferrer">
                      {currentVersionObj.version} 发布说明
                    </a>。
                  </>
                )}
              </p>

              <hr className="cc-cl-divider" />

              {currentCategorized.added.length > 0 && (
                <section id="cl-sec-added" className="cc-cl-sec">
                  <h2>{isEn ? 'New Features & Core Capabilities' : '新增与核心特性'}</h2>
                  <ul>
                    {currentCategorized.added.map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ul>
                </section>
              )}

              {currentCategorized.improved.length > 0 && (
                <section id="cl-sec-improved" className="cc-cl-sec">
                  <h2>{isEn ? 'Improvements & Optimizations' : '改进与体验优化'}</h2>
                  <ul>
                    {currentCategorized.improved.map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ul>
                </section>
              )}

              {currentCategorized.fixed.length > 0 && (
                <section id="cl-sec-fixed" className="cc-cl-sec">
                  <h2>{isEn ? 'Fixes & Stability Reinforcements' : '修复与稳定性加固'}</h2>
                  <ul>
                    {currentCategorized.fixed.map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section id="cl-sec-upgrade" className="cc-cl-sec">
                <h2>{isEn ? 'Upgrade Instructions' : '升级说明'}</h2>
                <ul>
                  <li>
                    <b>{isEn ? 'Desktop Client Upgrade' : '桌面客户端升级'}</b>：
                    {isEn
                      ? 'Click [Check Updates] on launch or the About dialog. Choose EXE overwrite, MSI install, or ZIP extraction (your .hengji data is retained safely).'
                      : '在软件启动页或“关于系统”窗口点击【检测新版】，选择 EXE 覆盖安装、MSI 安装、单文件覆盖或 ZIP 解压覆盖（默认保留您的 .hengji 加密工作区数据，绝不丢失）。'}
                  </li>
                  <li>
                    <b>{isEn ? 'Fresh Download & Install' : '全新下载安装'}</b>：
                    {isEn ? 'Visit the ' : '可前往官网 '}
                    <button type="button" className="cc-inline-link" onClick={() => navigatePage('download')}>
                      {isEn ? 'Download Page' : '免费下载页面'}
                    </button>{' '}
                    {isEn ? `to acquire the latest v${latestVer} package.` : `获取最新 v${latestVer} 安装包。`}
                  </li>
                </ul>
              </section>
            </article>

            {/* 右栏：目录锚点导航 */}
            <aside className="cc-cl-toc">
              <div className="cc-cl-toc-title">{isEn ? `In ${currentVersionObj.version}` : `在 ${currentVersionObj.version} 中`}</div>
              <nav>
                {currentCategorized.added.length > 0 && (
                  <a href="#cl-sec-added" onClick={e => { e.preventDefault(); document.getElementById('cl-sec-added')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    {isEn ? 'New Features' : '新增'}
                  </a>
                )}
                {currentCategorized.improved.length > 0 && (
                  <a href="#cl-sec-improved" onClick={e => { e.preventDefault(); document.getElementById('cl-sec-improved')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    {isEn ? 'Improvements' : '改进'}
                  </a>
                )}
                {currentCategorized.fixed.length > 0 && (
                  <a href="#cl-sec-fixed" onClick={e => { e.preventDefault(); document.getElementById('cl-sec-fixed')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    {isEn ? 'Fixes' : '修复'}
                  </a>
                )}
                <a href="#cl-sec-upgrade" onClick={e => { e.preventDefault(); document.getElementById('cl-sec-upgrade')?.scrollIntoView({ behavior: 'smooth' }); }}>
                  {isEn ? 'Upgrade Notes' : '升级说明'}
                </a>
              </nav>
            </aside>
          </div>
        </main>
      )}

      {/* ==================== 视图 4：文档页面（全新按图3、图4现代三栏架构） ==================== */}
      {pageView === 'docs' && (() => {
        const currentBook = DOC_BOOKS.find(b => b.id === activeBookId) || DOC_BOOKS[0];
        const currentChapter =
          currentBook.chapters.find(c => c.id === activeChapterId) ||
          DOC_BOOKS.flatMap(b => b.chapters).find(c => c.id === activeChapterId) ||
          currentBook.chapters[0];

        const query = docSearchQuery.trim().toLowerCase();
        const displayBooks = DOC_BOOKS.map(book => {
          if (!query) return book;
          const matchBook = (isEn ? book.titleEn : book.titleZh).toLowerCase().includes(query);
          const matchingChapters = book.chapters.filter(ch => {
            const matchChap = (isEn ? ch.titleEn : ch.titleZh).toLowerCase().includes(query);
            const matchSec = ch.sections.some(s => (isEn ? s.titleEn : s.titleZh).toLowerCase().includes(query));
            return matchChap || matchSec;
          });
          if (matchBook) return book;
          return matchingChapters.length > 0 ? { ...book, chapters: matchingChapters } : null;
        }).filter(Boolean) as typeof DOC_BOOKS;

        return (
          <main className="cc-changelog-page">
            <div className="cc-cl-layout" style={{ gridTemplateColumns: '270px 1fr 220px', gap: '30px' }}>
              {/* 左侧栏：按图3设计（顶部搜索框 + 文章大题目点击展开章节） */}
              <aside className="cc-cl-sidebar">
                {/* 搜索框：图3顶部带 ⌘K */}
                <div className="cc-doc-search-box">
                  <Search size={14} style={{ color: 'var(--cc-text-muted)', flexShrink: 0 }} />
                  <input
                    type="text"
                    value={docSearchQuery}
                    onChange={e => setDocSearchQuery(e.target.value)}
                    placeholder={isEn ? 'Search docs...' : '搜索文档...'}
                  />
                  <kbd>⌘K</kbd>
                </div>

                {/* 文档题目列表：按图3设计，带图标与箭头，展开每个章节 */}
                <nav className="cc-doc-books-nav">
                  {displayBooks.map(book => {
                    const isSelected = activeBookId === book.id;
                    const isExpanded = !!expandedBooks[book.id];
                    return (
                      <div key={book.id} className="cc-doc-book-group">
                        <button
                          type="button"
                          className={`cc-doc-book-header ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            setExpandedBooks(prev => ({
                              ...prev,
                              [book.id]: !prev[book.id]
                            }));
                            setActiveBookId(book.id);
                            if (book.chapters.length > 0 && !book.chapters.some(c => c.id === activeChapterId)) {
                              setActiveChapterId(book.chapters[0].id);
                            }
                          }}
                        >
                          <div className="cc-doc-book-title">
                            <span style={{ fontSize: '15px' }}>{book.icon}</span>
                            <span style={{ fontSize: '13.5px' }}>{isEn ? book.titleEn : book.titleZh}</span>
                          </div>
                          <ChevronRight
                            size={14}
                            className="cc-doc-book-chevron"
                            style={{
                              transform: isExpanded ? 'rotate(90deg)' : 'none',
                              transition: 'transform 0.18s ease'
                            }}
                          />
                        </button>

                        {/* 展开的章节列表 */}
                        {isExpanded && (
                          <div className="cc-doc-chapters-list">
                            {book.chapters.map(chap => {
                              const isChapActive = activeChapterId === chap.id;
                              return (
                                <button
                                  key={chap.id}
                                  type="button"
                                  className={`cc-doc-chapter-link ${isChapActive ? 'active' : ''}`}
                                  onClick={() => {
                                    setActiveBookId(book.id);
                                    setActiveChapterId(chap.id);
                                    window.scrollTo({ top: 120, behavior: 'smooth' });
                                  }}
                                >
                                  <span style={{ color: 'var(--cc-text-muted)', fontSize: '12px', fontWeight: '700' }}>
                                    {chap.number}
                                  </span>
                                  <span>{isEn ? chap.titleEn : chap.titleZh}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </aside>

              {/* 中间栏：正文内容展示 */}
              <article className="cc-cl-article">
                <DocArticleContent
                  chapterId={activeChapterId}
                  isEn={isEn}
                  onLaunchDemo={onLaunchDemo}
                  onNavigateDownload={() => navigatePage('download')}
                  onCopyText={handleCopyText}
                  copiedKey={copiedKey}
                />

                <div
                  style={{
                    marginTop: '36px',
                    paddingTop: '22px',
                    borderTop: '1px solid var(--cc-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      className="cc-btn-terracotta"
                      onClick={() => onLaunchDemo('dashboard', 'general')}
                    >
                      <Play size={14} fill="currentColor" />
                      <span>{isEn ? 'Launch Live Demo Online' : '立即进入在线工作台实操体验'}</span>
                    </button>
                    <button
                      type="button"
                      className="cc-btn-outline"
                      onClick={() => navigatePage('download')}
                    >
                      <Download size={14} />
                      <span>{isEn ? 'Go to Download Page' : '前往下载桌面客户端'}</span>
                    </button>
                  </div>

                  <span style={{ fontSize: '12px', color: 'var(--cc-text-muted)' }}>
                    {isEn ? `HengJi Documentation · v${latestVer}` : `衡绩官方技术文档 · v${latestVer}`}
                  </span>
                </div>
              </article>

              {/* 右侧栏：按图4设计（本页内容 / On this page 提纲，点击平滑滚动） */}
              <aside className="cc-doc-page-toc">
                <div className="cc-doc-page-toc-title">{isEn ? 'On this page' : '本页内容'}</div>
                <div className="cc-doc-page-toc-list">
                  {/* 当前章节大标 */}
                  <div
                    style={{
                      color: 'var(--cc-terracotta)',
                      fontWeight: '700',
                      fontSize: '13px',
                      marginBottom: '6px'
                    }}
                  >
                    {currentChapter?.number} {isEn ? currentChapter?.titleEn : currentChapter?.titleZh}
                  </div>

                  {/* 小节列表 */}
                  {currentChapter?.sections.map(sec => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className={`cc-doc-page-toc-item level-${sec.level}`}
                      onClick={e => {
                        e.preventDefault();
                        const el = document.getElementById(sec.id);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                    >
                      {isEn ? sec.titleEn : sec.titleZh}
                    </a>
                  ))}
                </div>
              </aside>
            </div>
          </main>
        );
      })()}
    </div>
  );
}
