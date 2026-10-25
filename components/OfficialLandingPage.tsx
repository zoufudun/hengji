'use client';
import React, { useState, useEffect } from 'react';
import {
  Award,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleGauge,
  CloudDownload,
  Crown,
  Database,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FolderArchive,
  FolderKanban,
  Globe,
  History,
  KeyRound,
  Layers,
  Lock,
  Medal,
  Package,
  Play,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Sparkles,
  Star,
  Table2,
  TrendingUp,
  Trophy,
  Upload,
  Users,
  Zap,
  BookOpen,
  BookOpenCheck,
  ArrowRight,
  Monitor,
  Cpu,
  HardDrive
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
  GITHUB_PAGES_URL,
  checkAppUpdate,
  type UpdateCheckResult
} from '../lib/core';
import brandHengSeal from '../app/brand-heng-seal.png';
import brandBurstFlower from '../app/brand-burst-flower.png';

export interface OfficialLandingPageProps {
  onLaunchDemo: (initialTab?: string, workspaceType?: 'general' | 'auditor') => void;
}

export function OfficialLandingPage({ onLaunchDemo }: OfficialLandingPageProps) {
  const [previewTab, setPreviewTab] = useState<'dashboard' | 'quota' | 'plans' | 'auditor' | 'matrix' | 'stars'>('dashboard');
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);
  const [checkingRelease, setCheckingRelease] = useState(false);
  const [activeDocStep, setActiveDocStep] = useState<number>(1);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const latestVer = updateInfo?.latestVersion || APP_VERSION;

  useEffect(() => {
    setCheckingRelease(true);
    checkAppUpdate(APP_VERSION)
      .then(res => setUpdateInfo(res))
      .catch(() => {})
      .finally(() => setCheckingRelease(false));
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const previewItems = [
    {
      key: 'dashboard' as const,
      icon: CircleGauge,
      label: '全景驾驶舱',
      badge: '实时掌控',
      title: '部门与项目绩效全景驾驶舱',
      desc: '一屏统揽合同总额、已发绩点、剩余可分配池、项目健康度预警及各专业组（总体组/产品组/研发组）月度效能趋势对比。'
    },
    {
      key: 'quota' as const,
      icon: Sliders,
      label: '稳健交付防透支',
      badge: '核心首创',
      title: '全周期“前低后高”稳健交付额度规划',
      desc: '首创防前期透支排期算法：前期争取阶段设 0~10% 硬上限（默认 5%），成品发货与终检验收锁定 45%+ 大头，末月维保固定保留 5% 额度。'
    },
    {
      key: 'plans' as const,
      icon: CalendarRange,
      label: '月底集中大表',
      badge: '告别繁琐',
      title: '全项目当月集中考评与一键批量发布',
      desc: '无需逐个点开几十个项目！当月所有在研项目集中呈现在同一张透视大表中，支持一键套用规划额度、100% 严密比例校验与批量发布生效。'
    },
    {
      key: 'auditor' as const,
      icon: Calculator,
      label: '数据包流转汇总',
      badge: '离线协同',
      title: '项目负责人与专职核算员离线数据包协同',
      desc: '纯内网/无服务器环境下，各项目负责人一键导出加密 JSON 项目绩点数据包，核算员拖拽即可自动合并、跨项目去重归集全员绩效总表。'
    },
    {
      key: 'matrix' as const,
      icon: Table2,
      label: '双向闭环矩阵',
      badge: '分毫不差',
      title: '横向个人 × 纵向项目 二维透视闭环矩阵',
      desc: '底层采用 BigInt 精确到“分”与最大余额法分配，横向个人行累加与纵向项目列累加 100% 严密自洽，一键导出财务级 UTF-8 CSV 报表。'
    },
    {
      key: 'stars' as const,
      icon: Trophy,
      label: '卓越绩星殿堂',
      badge: '荣誉激励',
      title: '月度 / 季度 / 年度 卓越绩星自动评选殿堂',
      desc: '基于已发布的真实项目贡献绩点，自动生成冠亚季军荣耀金榜、月度领跑之星、季度卓越标兵与年度功勋领航之星，让实干者脱颖而出。'
    }
  ];

  const faqs = [
    {
      q: '为什么打开官网既能下载桌面客户端，又能直接“在线交互体验”？',
      a: '衡绩（HengJi）采用同构双引擎设计。对于日常办公、涉密工程与正式绩效核算，强烈推荐下载 Windows 桌面离线版（数据加密保存在非系统盘 .hengji 文件中）；同时官网内置了完整功能的 Web 沙盒在线体验空间（预置真实感示例工程与团队数据），无需安装即可在浏览器中直接体验全部 11 大核心模块。'
    },
    {
      q: '桌面离线版的数据保存在哪里？重装系统会丢失数据吗？',
      a: '彻底告别传统软件默认把数据偷偷藏在 C 盘用户目录的痛点！衡绩在新建工作区及 MSI/EXE 安装时，默认引导并推荐存储在 D:\\、E:\\ 或单位加密盘中（后缀为 .hengji）。每次保存时系统还会自动生成同目录 .hengji.backup 镜像备份，即使重装 Windows 系统也丝毫无损。'
    },
    {
      q: '没有架设内网服务器，多个项目负责人如何把分好的绩点汇总给部门核算员？',
      a: '衡绩专为无服务器（Serverless Offline）科研与工程团队设计了“数据包离线流转中心”。项目负责人在各自电脑完成月度分配后，点击【导出项目数据包（或名下全部项目合包）】发送给绩效核算员；核算员在【绩效核算工作区】一键拖拽导入，系统即刻完成全员跨项目合并、合同额度核销监控与荣誉榜单生成。'
    },
    {
      q: '如何防止项目刚立项就把绩效分完，导致后期发货交付时“有活没钱分”？',
      a: '这是工程团队最常见的痛点。衡绩内置了“🎯 稳健交付型（前低后高）”全周期额度排期引擎：将首月（前期争取/立项阶段）额度限制在 0%~10%（默认 5%），将 45% 以上的大头额度锁定在成品联调、发货交付与终检验收阶段，并在末月强制预留 5% 售后维保额度。'
    },
    {
      q: '导入财务或 OA 导出的 Excel/CSV 表格时，带有千分位逗号、¥符号或多位小数会报错吗？',
      a: '完全不会！衡绩内置了财务级自适应清洗引擎，自动剥离千分位逗号（如 1,309,000.00）、货币符号（¥、$、元、万元）以及浮点超长小数（如 33.33333333 自动四舍五入到分），并且支持同一工作令号下挂靠多个独立子合同。'
    }
  ];

  return (
    <div className="hj-landing-root">
      {/* 顶部通告横幅 */}
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
            立即进入在线工作台体验 <ArrowRight size={13} />
          </button>
        </div>
      </div>

      {/* 粘性毛玻璃导航栏 (CC Switch 风格) */}
      <header className="hj-navbar">
        <div className="hj-navbar-container">
          <div className="hj-navbar-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={brandHengSeal} alt="衡绩 Logo" className="hj-brand-seal" />
            <img src={brandBurstFlower} alt="彩瓣标识" className="hj-brand-flower" />
            <div className="hj-brand-titles">
              <div className="hj-brand-name-row">
                <span className="hj-brand-main">衡绩</span>
                <span className="hj-brand-en">HengJi</span>
                <span className="hj-version-pill">v{APP_VERSION}</span>
              </div>
              <span className="hj-brand-sub">工程与科研团队员工绩点考核系统</span>
            </div>
          </div>

          <nav className="hj-navbar-links">
            <button type="button" onClick={() => scrollToSection('hj-preview')}>界面与交互预览</button>
            <button type="button" onClick={() => scrollToSection('hj-features')}>核心特性</button>
            <button type="button" onClick={() => scrollToSection('hj-workflow')}>五步闭环指南</button>
            <button type="button" onClick={() => scrollToSection('hj-download')}>客户端下载</button>
            <button type="button" onClick={() => scrollToSection('hj-changelog')}>更新日志</button>
            <button type="button" onClick={() => scrollToSection('hj-faq')}>常见问题</button>
          </nav>

          <div className="hj-navbar-actions">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hj-github-btn"
              title="访问 GitHub 开源仓库"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A5.44 5.44 0 0 0 9 18.13V22" />
              </svg>
              <span>GitHub</span>
            </a>

            <button
              type="button"
              className="hj-nav-download-btn"
              onClick={() => scrollToSection('hj-download')}
            >
              <Download size={15} />
              <span>下载客户端</span>
            </button>

            <button
              type="button"
              className="hj-nav-try-btn"
              onClick={() => onLaunchDemo('dashboard', 'general')}
            >
              <Play size={14} fill="currentColor" />
              <span>在线体验软件</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero 首屏区域 */}
      <section className="hj-hero-section">
        <div className="hj-hero-glow hj-glow-1" />
        <div className="hj-hero-glow hj-glow-2" />
        <div className="hj-hero-container">
          <div className="hj-hero-pill">
            <Sparkles size={14} className="hj-pill-icon" />
            <span>All-in-One 工程与科研项目员工绩点量化考核管理平台</span>
            <span className="hj-pill-divider">|</span>
            <span className="hj-pill-highlight">离线加密 · 稳健防透支 · 双向闭环</span>
          </div>

          <h1 className="hj-hero-title">
            让每一份项目贡献，
            <span className="hj-gradient-text">都有据可衡</span>
          </h1>

          <p className="hj-hero-subtitle">
            <strong>衡绩 (HengJi)</strong> 专为多项目、长周期、跨专业组（总体组 / 产品组 / 研发组）团队打造。
            将<strong>合同总额管控、全周期前低后高防透支规划、月底集中考评分配、跨项目数据包流转汇总与卓越绩星评选</strong>融为一体，
            告别繁琐易错的 Excel 手工台账，构建分毫不差的端到端量化考核闭环。
          </p>

          {/* 核心 CTA 按钮组 */}
          <div className="hj-hero-cta-group">
            <button
              type="button"
              className="hj-cta-primary"
              onClick={() => onLaunchDemo('dashboard', 'general')}
            >
              <Play size={18} fill="currentColor" />
              <div className="hj-cta-text-col">
                <strong>立即在线体验软件</strong>
                <small>免安装 · 浏览器直接运行完整交互工作台</small>
              </div>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="hj-cta-secondary"
              onClick={() => scrollToSection('hj-download')}
            >
              <Download size={18} />
              <div className="hj-cta-text-col">
                <strong>下载 Windows 桌面离线版</strong>
                <small>v{latestVer} · 支持 EXE / MSI / 便携版 / ZIP</small>
              </div>
            </button>

            <button
              type="button"
              className="hj-cta-auditor"
              onClick={() => onLaunchDemo('auditor', 'auditor')}
              title="直接以绩效核算员身份进入全项目汇总大盘在线体验"
            >
              <Calculator size={17} />
              <span>体验核算员汇总视角</span>
            </button>
          </div>

          {/* 快捷角色体验与能力标签 */}
          <div className="hj-hero-badges">
            <div className="hj-hero-badge-item">
              <ShieldCheck size={15} color="#10b981" />
              <span>AES-256-GCM 本地加密存储</span>
            </div>
            <div className="hj-hero-badge-item">
              <HardDrive size={15} color="#0ea5e9" />
              <span>默认非系统盘 (D:/E:盘) 零残留</span>
            </div>
            <div className="hj-hero-badge-item">
              <Sliders size={15} color="#f59e0b" />
              <span>前低后高稳健排期 · 维保锁定 5%</span>
            </div>
            <div className="hj-hero-badge-item">
              <Table2 size={15} color="#8b5cf6" />
              <span>BigInt 精确到分 · 行列双向 100% 闭环</span>
            </div>
          </div>
        </div>
      </section>

      {/* 交互式软件界面预览与在线体验直达区 (类似 CC Switch 核心控制面展示) */}
      <section id="hj-preview" className="hj-preview-section">
        <div className="hj-section-container">
          <div className="hj-preview-tabs-bar">
            {previewItems.map(item => {
              const Icon = item.icon;
              const active = previewTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`hj-preview-tab-btn ${active ? 'active' : ''}`}
                  onClick={() => setPreviewTab(item.key)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  <em className="hj-preview-tab-badge">{item.badge}</em>
                </button>
              );
            })}
          </div>

          {/* 仿真桌面软件窗口展示框 */}
          <div className="hj-mockup-window">
            {/* 窗口顶部标题栏 */}
            <div className="hj-mockup-titlebar">
              <div className="hj-window-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <div className="hj-window-title">
                <img src={brandHengSeal} alt="" width={18} height={18} style={{ borderRadius: 4 }} />
                <span>衡绩 · 员工绩点考核系统 v{APP_VERSION} — {previewItems.find(x => x.key === previewTab)?.title}</span>
              </div>
              <div className="hj-window-actions">
                <button
                  type="button"
                  className="hj-window-launch-btn"
                  onClick={() => {
                    const targetMap: Record<typeof previewTab, { tab: string; ws: 'general' | 'auditor' }> = {
                      dashboard: { tab: 'dashboard', ws: 'general' },
                      quota: { tab: 'projects', ws: 'general' },
                      plans: { tab: 'plans', ws: 'general' },
                      auditor: { tab: 'auditor', ws: 'auditor' },
                      matrix: { tab: 'reports', ws: 'general' },
                      stars: { tab: 'stars', ws: 'general' },
                    };
                    const t = targetMap[previewTab];
                    onLaunchDemo(t.tab, t.ws);
                  }}
                >
                  <Zap size={13} />
                  <span>全屏进入此模块真实操作</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>

            {/* 窗口内部双栏仿真布局 */}
            <div className="hj-mockup-body">
              {/* 左侧仿真导航栏 */}
              <div className="hj-mockup-sidebar">
                <div className="hj-mock-brand">
                  <img src={brandHengSeal} alt="衡" width={34} height={34} style={{ borderRadius: 8 }} />
                  <div>
                    <strong>衡绩考核</strong>
                    <small>ENCRYPTED WORKSPACE</small>
                  </div>
                </div>
                <div className="hj-mock-nav-group">核心业务矩阵</div>
                <div
                  className={`hj-mock-nav-item ${previewTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setPreviewTab('dashboard')}
                >
                  <CircleGauge size={15} /> 全景总览驾驶舱
                </div>
                <div
                  className={`hj-mock-nav-item ${previewTab === 'quota' ? 'active' : ''}`}
                  onClick={() => setPreviewTab('quota')}
                >
                  <BriefcaseBusiness size={15} /> 项目全周期管理
                </div>
                <div
                  className={`hj-mock-nav-item ${previewTab === 'plans' ? 'active' : ''}`}
                  onClick={() => setPreviewTab('plans')}
                >
                  <CalendarRange size={15} /> 月度绩效分配
                </div>
                <div className="hj-mock-nav-group">审计与荣誉殿堂</div>
                <div
                  className={`hj-mock-nav-item ${previewTab === 'auditor' ? 'active' : ''}`}
                  onClick={() => setPreviewTab('auditor')}
                >
                  <Calculator size={15} /> 全项目核算汇总
                </div>
                <div
                  className={`hj-mock-nav-item ${previewTab === 'matrix' ? 'active' : ''}`}
                  onClick={() => setPreviewTab('matrix')}
                >
                  <Table2 size={15} /> 多周期二维矩阵
                </div>
                <div
                  className={`hj-mock-nav-item ${previewTab === 'stars' ? 'active' : ''}`}
                  onClick={() => setPreviewTab('stars')}
                >
                  <Trophy size={15} /> 卓越绩星荣誉殿堂
                </div>

                <div className="hj-mock-sidebar-foot">
                  <div>📂 D:\衡绩工作区.hengji</div>
                  <span>🔒 AES-256-GCM 离线受控</span>
                </div>
              </div>

              {/* 右侧仿真主视图内容 */}
              <div className="hj-mockup-content">
                <div className="hj-mockup-header-banner">
                  <div>
                    <span className="hj-mockup-eyebrow">LIVE INTERACTIVE MODULE PREVIEW</span>
                    <h3>{previewItems.find(x => x.key === previewTab)?.title}</h3>
                    <p>{previewItems.find(x => x.key === previewTab)?.desc}</p>
                  </div>
                  <button
                    type="button"
                    className="hj-mockup-try-now"
                    onClick={() => {
                      const targetMap: Record<typeof previewTab, { tab: string; ws: 'general' | 'auditor' }> = {
                        dashboard: { tab: 'dashboard', ws: 'general' },
                        quota: { tab: 'projects', ws: 'general' },
                        plans: { tab: 'plans', ws: 'general' },
                        auditor: { tab: 'auditor', ws: 'auditor' },
                        matrix: { tab: 'reports', ws: 'general' },
                        stars: { tab: 'stars', ws: 'general' },
                      };
                      const t = targetMap[previewTab];
                      onLaunchDemo(t.tab, t.ws);
                    }}
                  >
                    <Play size={15} fill="currentColor" /> 立即在真实工作台中体验
                  </button>
                </div>

                {/* Tab 1: 全景驾驶舱预览 */}
                {previewTab === 'dashboard' && (
                  <div className="hj-mock-panel">
                    <div className="hj-mock-kpi-grid">
                      <div className="hj-mock-kpi-card emerald">
                        <span>在研工程合同总额</span>
                        <strong>1,280.00 <small>万元</small></strong>
                        <em>涵盖 8 个重点型号与科研合同</em>
                      </div>
                      <div className="hj-mock-kpi-card blue">
                        <span>累计已发布核销绩点</span>
                        <strong>542.60 <small>万绩点</small></strong>
                        <em>总体执行进度 42.39% · 节奏稳健</em>
                      </div>
                      <div className="hj-mock-kpi-card amber">
                        <span>剩余可分配储备池</span>
                        <strong>737.40 <small>万元</small></strong>
                        <em>含各项目末月 5% 维保锁定储备</em>
                      </div>
                      <div className="hj-mock-kpi-card purple">
                        <span>在岗参评专业组成员</span>
                        <strong>36 <small>人</small></strong>
                        <em>总体组 · 产品组 · 研发组 协同</em>
                      </div>
                    </div>

                    <div className="hj-mock-split-row">
                      <div className="hj-mock-box">
                        <div className="hj-mock-box-title">
                          <span>📊 各专业组月度绩效产出趋势对比</span>
                          <span className="hj-mock-tag">总体组 / 产品组 / 研发组</span>
                        </div>
                        <div className="hj-mock-bars">
                          {[
                            { m: '2026-05', zt: 32, cp: 28, yf: 40 },
                            { m: '2026-06', zt: 30, cp: 32, yf: 45 },
                            { m: '2026-07', zt: 35, cp: 30, yf: 50 },
                            { m: '2026-08', zt: 38, cp: 36, yf: 58 },
                            { m: '2026-09', zt: 42, cp: 40, yf: 66 },
                            { m: '2026-10', zt: 45, cp: 44, yf: 72 },
                          ].map(row => (
                            <div key={row.m} className="hj-mock-bar-col">
                              <div className="hj-mock-bar-stack">
                                <div style={{ height: `${row.yf}px`, background: '#10b981' }} title="研发组" />
                                <div style={{ height: `${row.cp}px`, background: '#f59e0b' }} title="产品组" />
                                <div style={{ height: `${row.zt}px`, background: '#3b82f6' }} title="总体组" />
                              </div>
                              <span>{row.m.slice(5)}月</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="hj-mock-box">
                        <div className="hj-mock-box-title">
                          <span>🛡️ 合同总额硬上限与负责人系数监控</span>
                          <span className="hj-mock-tag green">0 超支风险</span>
                        </div>
                        <div className="hj-mock-list">
                          <div className="hj-mock-list-item">
                            <div>
                              <b>某型综合光电探测系统研制 (令号: GF-2026-01)</b>
                              <small>合同额: 360.00 万元 · 负责人: 任海平 (参考区间 30%~60%)</small>
                            </div>
                            <span className="hj-status-pill ok">已分配 45.0%</span>
                          </div>
                          <div className="hj-mock-list-item">
                            <div>
                              <b>高精度伺服控制模块批产交付 (令号: GF-2026-02)</b>
                              <small>合同额: 180.00 万元 · 负责人: 陈韬 (维保期已锁定 5%)</small>
                            </div>
                            <span className="hj-status-pill ok">已分配 60.0%</span>
                          </div>
                          <div className="hj-mock-list-item">
                            <div>
                              <b>智能边缘计算载荷算法软件升级 (令号: KY-2026-05)</b>
                              <small>合同额: 45.00 万元 · 负责人: 张工 (参考区间 60%~90%)</small>
                            </div>
                            <span className="hj-status-pill warn">进入终验期 85.0%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: 稳健交付防透支预览 */}
                {previewTab === 'quota' && (
                  <div className="hj-mock-panel">
                    <div className="hj-mock-quota-curve">
                      <div className="hj-quota-stage-card stage-bidding">
                        <div className="stage-badge">阶段一：前期项目争取</div>
                        <strong>0% ~ 10% 可调 (默认 5%)</strong>
                        <p>立项论证与商务招投标阶段设立硬性比例上限，严防项目刚立项就把合同经费分光。</p>
                      </div>
                      <div className="hj-quota-arrow">➔</div>
                      <div className="hj-quota-stage-card stage-normal">
                        <div className="stage-badge">阶段二：主体研制与成品交付</div>
                        <strong>前低后高 · 发货终验占 45%+</strong>
                        <p>初样研制、正样联调逐步递增，将大头额度牢牢锁定在成品发货交付与最终验收节点。</p>
                      </div>
                      <div className="hj-quota-arrow">➔</div>
                      <div className="hj-quota-stage-card stage-maint">
                        <div className="stage-badge">阶段三：售后质保与技术维保</div>
                        <strong>末月强制置底保留 5%</strong>
                        <p>在项目周期最后一个月稳固锁定 5% 绩效额度，确保产品交付后售后维保依然有充沛激励。</p>
                      </div>
                    </div>

                    <div className="hj-mock-table-wrap">
                      <table className="hj-mock-table">
                        <thead>
                          <tr>
                            <th>规划月份</th>
                            <th>阶段属性</th>
                            <th>阶段里程碑与交付物</th>
                            <th>规划额度比例</th>
                            <th>折合当月额度(万元)</th>
                            <th>实际已发状态</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><b>2026-06</b></td>
                            <td><span className="hj-stage-tag bidding">🌱 前期争取阶段</span></td>
                            <td>总体技术方案评审与合同签订</td>
                            <td><b>5.00%</b></td>
                            <td>18.000000 万</td>
                            <td><span className="hj-status-pill ok">✅ 已发布核销</span></td>
                          </tr>
                          <tr>
                            <td><b>2026-07 ~ 08</b></td>
                            <td><span className="hj-stage-tag normal">⚙️ 主体研制阶段</span></td>
                            <td>软硬件详细设计、初样加工与算法联调</td>
                            <td><b>35.00%</b></td>
                            <td>126.000000 万</td>
                            <td><span className="hj-status-pill ok">✅ 已发布核销</span></td>
                          </tr>
                          <tr>
                            <td><b>2026-09 ~ 11</b></td>
                            <td><span className="hj-stage-tag delivery">📦 成品发货终验</span></td>
                            <td>环境试验、批次成品发货交付与客户终检</td>
                            <td><b>55.00%</b></td>
                            <td>198.000000 万</td>
                            <td><span className="hj-status-pill blue">⚡ 当月执行中</span></td>
                          </tr>
                          <tr>
                            <td><b>2026-12</b></td>
                            <td><span className="hj-stage-tag maint">🛡️ 维保支持阶段</span></td>
                            <td>现场安装保障、备件支持与质保期维保</td>
                            <td><b>5.00% (锁定)</b></td>
                            <td>18.000000 万</td>
                            <td><span className="hj-status-pill gray">🔒 储备锁定中</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab 3: 月度集中大表预览 */}
                {previewTab === 'plans' && (
                  <div className="hj-mock-panel">
                    <div className="hj-mock-toolbar">
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="hj-status-pill blue">📅 考核月份：2026-10</span>
                        <span className="hj-status-pill ok">⚡ 一键套用当月规划额度</span>
                        <span className="hj-status-pill ok">👥 快速配置成员比例 (100% 校验)</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span className="hj-mock-btn-chip">💾 批量保存当月修改</span>
                        <span className="hj-mock-btn-chip primary">🚀 一键批量发布生效</span>
                      </div>
                    </div>
                    <div className="hj-mock-table-wrap">
                      <table className="hj-mock-table">
                        <thead>
                          <tr>
                            <th>工作令号 / 项目名称</th>
                            <th>合同总额</th>
                            <th>当月规划</th>
                            <th>当月实际分配率</th>
                            <th>当月绩效池(万)</th>
                            <th>成员比例配置 (合计=100%)</th>
                            <th>状态</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><b>GF-2026-01 · 综合光电探测系统</b></td>
                            <td>360.00 万</td>
                            <td>15.00%</td>
                            <td><b>15.00%</b></td>
                            <td><b>54.000000 万</b></td>
                            <td>任海平(35%)、陈韬(25%)、王研(20%)、李产(20%) = <b style={{ color: '#16a34a' }}>100%</b></td>
                            <td><span className="hj-status-pill ok">已发布</span></td>
                          </tr>
                          <tr>
                            <td><b>GF-2026-02 · 高精度伺服控制模块</b></td>
                            <td>180.00 万</td>
                            <td>20.00%</td>
                            <td><b>20.00%</b></td>
                            <td><b>36.000000 万</b></td>
                            <td>陈韬(40%)、赵算法(30%)、孙结构(30%) = <b style={{ color: '#16a34a' }}>100%</b></td>
                            <td><span className="hj-status-pill ok">已发布</span></td>
                          </tr>
                          <tr>
                            <td><b>KY-2026-05 · 智能边缘计算载荷升级</b></td>
                            <td>45.00 万</td>
                            <td>25.00%</td>
                            <td><b>25.00%</b></td>
                            <td><b>11.250000 万</b></td>
                            <td>张工(50%)、周硬件(25%)、吴测试(25%) = <b style={{ color: '#16a34a' }}>100%</b></td>
                            <td><span className="hj-status-pill warn">草稿待发</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab 4: 核算员数据包流转汇总 */}
                {previewTab === 'auditor' && (
                  <div className="hj-mock-panel">
                    <div className="hj-mock-quota-curve">
                      <div className="hj-quota-stage-card stage-bidding">
                        <div className="stage-badge">1. 各项目负责人端</div>
                        <strong>导出项目绩点数据包 (.json)</strong>
                        <p>支持导出单个项目数据包，或一键导出本人名下管理的全部项目合包。</p>
                      </div>
                      <div className="hj-quota-arrow">➔</div>
                      <div className="hj-quota-stage-card stage-normal">
                        <div className="stage-badge">2. 绩效核算员工作区</div>
                        <strong>批量拖拽导入 & 自动去重归集</strong>
                        <p>自动识别单项目包与多项目合包，按员工唯一 ID / 姓名智能跨项目累加合并。</p>
                      </div>
                      <div className="hj-quota-arrow">➔</div>
                      <div className="hj-quota-stage-card stage-maint">
                        <div className="stage-badge">3. 部门级审计大盘</div>
                        <strong>全员总表 · 合同矩阵 · 荣誉评选</strong>
                        <p>一键生成全员跨项目绩效总表、部门合同核销健康度大盘及导出完整审计总包。</p>
                      </div>
                    </div>
                    <div className="hj-mock-box" style={{ marginTop: 12 }}>
                      <div className="hj-mock-box-title">
                        <span>📦 核算员专职模式 — 已载入项目数据包实时汇总预览</span>
                        <span className="hj-mock-tag green">支持一键切换核算员体验</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                        点击上方【全屏进入此模块真实操作】或首屏【体验核算员汇总视角】，即可直接进入专职绩效核算员工作台，体验从当前系统一键载入全部项目数据包、查看全员跨项目绩效总表与全景合同矩阵！
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 5: 二维透视矩阵预览 */}
                {previewTab === 'matrix' && (
                  <div className="hj-mock-panel">
                    <div className="hj-mock-table-wrap">
                      <table className="hj-mock-table">
                        <thead>
                          <tr>
                            <th>员工姓名</th>
                            <th>专业组</th>
                            <th>GF-2026-01 (万)</th>
                            <th>GF-2026-02 (万)</th>
                            <th>KY-2026-05 (万)</th>
                            <th style={{ background: '#ecfdf5', color: '#065f46' }}>横向个人累加 (万元)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><b>任海平</b></td>
                            <td>总体组</td>
                            <td>18.900000</td>
                            <td>3.600000</td>
                            <td>—</td>
                            <td style={{ background: '#f0fdf4', fontWeight: 700, color: '#15803d' }}>22.500000 万</td>
                          </tr>
                          <tr>
                            <td><b>陈韬</b></td>
                            <td>产品组</td>
                            <td>13.500000</td>
                            <td>14.400000</td>
                            <td>2.250000</td>
                            <td style={{ background: '#f0fdf4', fontWeight: 700, color: '#15803d' }}>30.150000 万</td>
                          </tr>
                          <tr>
                            <td><b>王研</b></td>
                            <td>研发组</td>
                            <td>21.600000</td>
                            <td>18.000000</td>
                            <td>9.000000</td>
                            <td style={{ background: '#f0fdf4', fontWeight: 700, color: '#15803d' }}>48.600000 万</td>
                          </tr>
                          <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                            <td colSpan={2}><b>纵向项目累加 (万元)</b></td>
                            <td>54.000000 万</td>
                            <td>36.000000 万</td>
                            <td>11.250000 万</td>
                            <td style={{ background: '#dcfce7', color: '#166534', fontSize: 14 }}>🎯 双向闭环总计: 101.250000 万</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab 6: 卓越绩星殿堂预览 */}
                {previewTab === 'stars' && (
                  <div className="hj-mock-panel">
                    <div className="hj-mock-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                      <div className="hj-mock-kpi-card amber">
                        <span>👑 年度功勋领航之星 (TOP 1)</span>
                        <strong>任海平 · 总体组</strong>
                        <em>年度累计斩获 168.50 万绩点 · 领跑 5 项重大工程交付</em>
                      </div>
                      <div className="hj-mock-kpi-card emerald">
                        <span>🏆 季度卓越攻坚标兵</span>
                        <strong>陈韬 · 产品组</strong>
                        <em>本季累计贡献 64.20 万绩点 · 核心型号批产按期交付</em>
                      </div>
                      <div className="hj-mock-kpi-card blue">
                        <span>🌟 月度领跑之星</span>
                        <strong>王研 · 研发组</strong>
                        <em>当月斩获 24.80 万绩点 · 算法联调与外场试验突出贡献</em>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 核心功能六大特性矩阵 (Why HengJi) */}
      <section id="hj-features" className="hj-features-section">
        <div className="hj-section-container">
          <div className="hj-section-header">
            <span className="hj-section-eyebrow">CORE CAPABILITIES</span>
            <h2>为什么工程与科研团队选择「衡绩」？</h2>
            <p>针对多型号并线、跨周期交付、内网涉密与财务严密审计场景深度定制的六大核心支柱</p>
          </div>

          <div className="hj-features-grid">
            <div className="hj-feature-card">
              <div className="hj-feature-icon emerald"><ShieldCheck size={24} /></div>
              <h3>纯本地离线加密 · 默认非系统盘</h3>
              <p>
                采用 <code>PBKDF2-SHA256</code> (10万次加盐迭代) 与 <code>AES-256-GCM</code> 认证加密。
                业务数据保存在您自主指定的 D/E 盘或保密盘 <code>.hengji</code> 文件中，每次保存自动生成 <code>.backup</code> 镜像，零云端上传风险。
              </p>
            </div>

            <div className="hj-feature-card">
              <div className="hj-feature-icon amber"><Sliders size={24} /></div>
              <h3>前低后高稳健排期 · 防前期透支</h3>
              <p>
                独创三段式全生命周期额度模型：前期项目争取阶段限高 0~10%（默认 5%），主体研制与成品发货交付锁定 45%+ 大头，末月售后维保强制保留 5%，彻底杜绝“前期分光、后期无钱”。
              </p>
            </div>

            <div className="hj-feature-card">
              <div className="hj-feature-icon blue"><CalendarRange size={24} /></div>
              <h3>全项目当月集中大表 · 批量发布</h3>
              <p>
                告别传统系统逐个点开几十个项目的繁琐操作。月底考评时，所有在研项目集中呈现在一张透视大表，支持一键套用当月规划、快速配置团队比例（100% 校验）与一键批量发布/撤回。
              </p>
            </div>

            <div className="hj-feature-card">
              <div className="hj-feature-icon purple"><Calculator size={24} /></div>
              <h3>离线数据包流转 · 专职核算员大盘</h3>
              <p>
                内置双工作区模式（🏢 综合管理工作区 / 📊 绩效核算工作区）。项目负责人一键导出项目数据包或名下全项目合包，核算员拖拽导入即可完成全员跨项目汇总、合同监控与审计流水核查。
              </p>
            </div>

            <div className="hj-feature-card">
              <div className="hj-feature-icon cyan"><Table2 size={24} /></div>
              <h3>BigInt 精确到分 · 行列双向 100% 闭环</h3>
              <p>
                底层摒弃浮点数误差，全部采用整数“分”与 <code>BigInt</code> 结合最大余额法（Largest Remainder）分润。二维透视矩阵中横向个人累加与纵向项目累加分毫不差，全面兼容财务千分位 CSV 导入导出。
              </p>
            </div>

            <div className="hj-feature-card">
              <div className="hj-feature-icon rose"><Trophy size={24} /></div>
              <h3>专业组协同矩阵 · 卓越绩星荣誉殿堂</h3>
              <p>
                深度契合“总体组、产品组、研发组”矩阵式架构，支持沉淀常用项目组默认分润模版；基于实绩自动评选月度之星、季度标兵与年度领航之星，配套冠亚季军荣誉奖牌榜。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 五步端到端业务闭环指南 */}
      <section id="hj-workflow" className="hj-workflow-section">
        <div className="hj-section-container">
          <div className="hj-section-header">
            <span className="hj-section-eyebrow">5-STEP END-TO-END WORKFLOW</span>
            <h2>五步构建端到端量化绩效考核闭环</h2>
            <p>清晰的标准化作业流程，5 分钟即可完成从建库、排期到月底考评与报表输出</p>
          </div>

          <div className="hj-workflow-steps">
            {[
              {
                num: 1,
                title: '新建加密工作区',
                sub: '非系统盘存储 · 口令/免密可选',
                desc: '选择“综合管理工作区”或“绩效核算工作区”，将 .hengji 数据文件保存在 D 盘或单位保密盘，支持设置 AES-256 口令或个人电脑免密秒进。',
                tab: 'dashboard'
              },
              {
                num: 2,
                title: '初始化员工与项目',
                sub: 'CSV 批量导入 · 财务格式自适应',
                desc: '一键初始化总体组/产品组/研发组架构，或拖拽导入单位员工花名册与工程合同台账（自动剥离千分位、货币符号与超长小数）。',
                tab: 'employees'
              },
              {
                num: 3,
                title: '全周期额度防透支规划',
                sub: '一键稳健排期 · 常用项目组模版',
                desc: '点击项目卡片【🎯 额度规划】，一键生成“前期争取 5% → 研制发货大头 → 末月维保 5%”的防透支排期曲线，并绑定项目组默认分润比例。',
                tab: 'projects'
              },
              {
                num: 4,
                title: '月底集中分配与发布',
                sub: '全项目同屏考评 · 100% 严密校验',
                desc: '在【月度绩效分配】集中大表中，一键套用当月规划额度，微调成员贡献比例（严格等于 100%），一键批量发布正式计入考核，或导出数据包给核算员。',
                tab: 'plans'
              },
              {
                num: 5,
                title: '多维报表与荣誉殿堂',
                sub: '二维闭环透视 · 自动评选绩星',
                desc: '按月/季/年度或任意区间查看“人员×项目”二维透视矩阵，验证行列双向 100% 闭环，一键导出 Excel 兼容 CSV 明细并揭晓考核之星金榜。',
                tab: 'reports'
              }
            ].map(step => (
              <div
                key={step.num}
                className={`hj-workflow-card ${activeDocStep === step.num ? 'active' : ''}`}
                onClick={() => setActiveDocStep(step.num)}
              >
                <div className="hj-wf-num">STEP 0{step.num}</div>
                <h3>{step.title}</h3>
                <span className="hj-wf-sub">{step.sub}</span>
                <p>{step.desc}</p>
                <button
                  type="button"
                  className="hj-wf-try-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLaunchDemo(step.tab, 'general');
                  }}
                >
                  <span>在线体验第 {step.num} 步</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 客户端多格式下载矩阵 (类似 CC Switch 下载中心) */}
      <section id="hj-download" className="hj-download-section">
        <div className="hj-section-container">
          <div className="hj-section-header">
            <span className="hj-section-eyebrow">DOWNLOAD & DEPLOYMENT</span>
            <h2>下载衡绩桌面离线版客户端 (v{latestVer})</h2>
            <p>
              提供四种 Windows 官方打包分发格式，全程原生 GUI 无终端弹窗，默认引导安装至非系统盘（D:\ / E:\），满足企业与涉密内网严苛部署要求
            </p>
          </div>

          <div className="hj-download-grid">
            {/* 格式 1：EXE 安装向导版 */}
            <div className="hj-dl-card recommended">
              <div className="hj-dl-ribbon">⭐ 官方推荐</div>
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
                <a href={getDownloadUrl('setup', true)} className="hj-dl-btn primary" target="_blank" rel="noopener noreferrer">
                  <CloudDownload size={16} /> 国内高速镜像下载 (.exe)
                </a>
                <a href={getDownloadUrl('setup', false)} className="hj-dl-btn ghost" target="_blank" rel="noopener noreferrer">
                  GitHub 源站
                </a>
              </div>
            </div>

            {/* 格式 2：MSI 企业安装包 */}
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
                <a href={getDownloadUrl('msi', true)} className="hj-dl-btn cyan" target="_blank" rel="noopener noreferrer">
                  <CloudDownload size={16} /> 国内高速镜像下载 (.msi)
                </a>
                <a href={getDownloadUrl('msi', false)} className="hj-dl-btn ghost" target="_blank" rel="noopener noreferrer">
                  GitHub 源站
                </a>
              </div>
            </div>

            {/* 格式 3：Portable 便携单文件版 */}
            <div className="hj-dl-card">
              <div className="hj-dl-header">
                <div className="hj-dl-icon emerald"><FolderKanban size={22} /></div>
                <div>
                  <h3>Portable 便携单文件版</h3>
                  <span>hengji-portable-{latestVer}.exe · 免安装即用</span>
                </div>
              </div>
              <p className="hj-dl-desc">
                零安装、不写注册表！单文件绿色可执行程序，放入 U 盘、移动硬盘或任意非系统盘目录双击即可直接运行，随身携带。
              </p>
              <div className="hj-dl-actions">
                <a href={getDownloadUrl('portable', true)} className="hj-dl-btn emerald" target="_blank" rel="noopener noreferrer">
                  <CloudDownload size={16} /> 国内高速镜像下载 (便携版)
                </a>
                <a href={getDownloadUrl('portable', false)} className="hj-dl-btn ghost" target="_blank" rel="noopener noreferrer">
                  GitHub 源站
                </a>
              </div>
            </div>

            {/* 格式 4：ZIP 绿色解压版 */}
            <div className="hj-dl-card">
              <div className="hj-dl-header">
                <div className="hj-dl-icon orange"><FolderArchive size={22} /></div>
                <div>
                  <h3>ZIP 绿色免安装压缩包</h3>
                  <span>hengji-{latestVer}.zip · 解压即运行</span>
                </div>
              </div>
              <p className="hj-dl-desc">
                标准 ZIP 绿色完整目录归档包，无需管理员安装权限，解压到任意磁盘目录后双击 <code>衡绩员工绩点考核系统.exe</code> 即可秒速启动。
              </p>
              <div className="hj-dl-actions">
                <a href={getDownloadUrl('zip', true)} className="hj-dl-btn orange" target="_blank" rel="noopener noreferrer">
                  <CloudDownload size={16} /> 国内高速镜像下载 (.zip)
                </a>
                <a href={getDownloadUrl('zip', false)} className="hj-dl-btn ghost" target="_blank" rel="noopener noreferrer">
                  GitHub 源站
                </a>
              </div>
            </div>
          </div>

          {/* 开发者源码构建与在线体验横幅 */}
          <div className="hj-dl-footer-bar">
            <div className="hj-dl-cmd-box">
              <span className="hj-cmd-label">源码构建与本地运行：</span>
              <code>git clone https://github.com/zoufudun/hengji.git && npm ci && npm run desktop:start</code>
              <button
                type="button"
                className="hj-copy-btn"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText('git clone https://github.com/zoufudun/hengji.git && npm ci && npm run desktop:start');
                    setCopiedCmd(true);
                    setTimeout(() => setCopiedCmd(false), 2000);
                  } catch {}
                }}
              >
                {copiedCmd ? '✅ 已复制' : '复制命令'}
              </button>
            </div>
            <div className="hj-dl-links">
              <a href={GITHUB_RELEASES_URL} target="_blank" rel="noopener noreferrer">
                查看 GitHub Releases 历史版本 <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 版本演进与更新日志精选 */}
      <section id="hj-changelog" className="hj-changelog-section">
        <div className="hj-section-container">
          <div className="hj-section-header">
            <span className="hj-section-eyebrow">RELEASE NOTES & CHANGELOG</span>
            <h2>持续迭代演进 · 版本更新日志</h2>
            <p>紧贴一线工程与科研考核实战需求，不断打磨极致的交互体验与数据可靠性</p>
          </div>

          <div className="hj-changelog-timeline">
            {UPDATE_HISTORY.slice(0, 4).map((ver, index) => (
              <div key={ver.version} className={`hj-changelog-item ${index === 0 ? 'latest' : ''}`}>
                <div className="hj-cl-meta">
                  <span className="hj-cl-ver">{ver.version}</span>
                  <span className="hj-cl-tag">{ver.tag}</span>
                  <time className="hj-cl-date">{ver.date}</time>
                </div>
                <div className="hj-cl-content">
                  <h3>{ver.title}</h3>
                  <ul>
                    {ver.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 常见问题解答 FAQ */}
      <section id="hj-faq" className="hj-faq-section">
        <div className="hj-section-container">
          <div className="hj-section-header">
            <span className="hj-section-eyebrow">FREQUENTLY ASKED QUESTIONS</span>
            <h2>常见问题与避坑指南</h2>
            <p>关于在线体验、离线加密存储、跨项目数据包汇总与考核规则的常见疑问解答</p>
          </div>

          <div className="hj-faq-list">
            {faqs.map((f, idx) => {
              const isOpen = faqOpen === idx;
              return (
                <div
                  key={idx}
                  className={`hj-faq-card ${isOpen ? 'open' : ''}`}
                  onClick={() => setFaqOpen(isOpen ? null : idx)}
                >
                  <div className="hj-faq-question">
                    <span>{f.q}</span>
                    <ChevronRight size={18} className={`hj-faq-chevron ${isOpen ? 'rotated' : ''}`} />
                  </div>
                  {isOpen && <div className="hj-faq-answer">{f.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 底部 CTA 与页脚 */}
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
              <Play size={17} fill="currentColor" />
              <span>立即在线体验衡绩系统</span>
            </button>
            <button
              type="button"
              className="hj-cta-secondary"
              onClick={() => scrollToSection('hj-download')}
            >
              <Download size={17} />
              <span>免费下载桌面离线客户端 (v{latestVer})</span>
            </button>
          </div>
        </div>

        <div className="hj-footer-bottom">
          <div className="hj-footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <img src={brandHengSeal} alt="衡绩" width={32} height={32} style={{ borderRadius: 7 }} />
              <strong style={{ fontSize: '17px', color: '#f8fafc' }}>衡绩 · 员工绩点考核系统 (HengJi)</strong>
            </div>
            <p>让每一份项目贡献，都有据可衡。面向工程与科研团队的离线安全量化绩效管理平台。</p>
            <p style={{ marginTop: '6px', color: '#64748b' }}>
              开发作者：{APP_AUTHOR} · 联系邮箱：<a href={`mailto:${APP_CONTACT}`}>{APP_CONTACT}</a>
            </p>
          </div>

          <div className="hj-footer-links-col">
            <h4>快速入口</h4>
            <button type="button" onClick={() => onLaunchDemo('dashboard', 'general')}>在线体验综合管理工作台</button>
            <button type="button" onClick={() => onLaunchDemo('auditor', 'auditor')}>在线体验绩效核算员工作台</button>
            <button type="button" onClick={() => onLaunchDemo('rules', 'general')}>查看绩效考核准则与公式</button>
            <button type="button" onClick={() => scrollToSection('hj-download')}>客户端下载矩阵</button>
          </div>

          <div className="hj-footer-links-col">
            <h4>开源与资源</h4>
            <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">GitHub 源码仓库</a>
            <a href={GITHUB_RELEASES_URL} target="_blank" rel="noopener noreferrer">Releases 历史安装包</a>
            <a href={GITHUB_PAGES_URL} target="_blank" rel="noopener noreferrer">衡绩官方网站主页</a>
          </div>
        </div>

        <div className="hj-footer-copyright">
          <span>© 2026 TOPFIRE 研发团队 · 邹富敦 (Phudon Zou). All rights reserved.</span>
          <span>当前版本: v{APP_VERSION} (Build {APP_BUILD})</span>
        </div>
      </footer>
    </div>
  );
}
