'use client';
import React, { useState, useEffect } from 'react';
import {
  Award,
  BarChart3,
  BriefcaseBusiness,
  Calculator,
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
  Lock,
  Moon,
  Package,
  Pencil,
  Play,
  Plus,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
  Sun,
  Table2,
  Tag,
  Trophy,
  Users,
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Calendar
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

// 将单条版本更新的 items 智能归类为：新增 / 改进 / 修复 / 安全与部署，方便图4右侧锚点导航与正文分段展示
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
  const [theme, setTheme] = useState<'parchment' | 'dark'>('parchment');
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);

  // 首页右侧交互窗口状态（模拟图5 CC Switch 控制面板）
  const [mockSideItem, setMockSideItem] = useState<string>('projects');
  const [mockConnMode, setMockConnMode] = useState<'general' | 'quota' | 'auditor'>('general');

  // 更新日志页状态（图4）
  const [selectedVerIdx, setSelectedVerIdx] = useState<number>(0);

  // 下载页状态（图3）
  const [copiedHash, setCopiedHash] = useState<string>('');

  // 文档页状态
  const [docSection, setDocSection] = useState<number>(0);

  const latestVer = updateInfo?.latestVersion || APP_VERSION;
  const latestDate = UPDATE_HISTORY[0]?.date || '2026-10-25';

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
      setCopiedHash(key);
      setTimeout(() => setCopiedHash(''), 1800);
    } catch {}
  };

  const navigatePage = (target: PageView) => {
    setPageView(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 语言文案（主用简体中文，右上角支持 CN / EN 切换展示）
  const isEn = lang === 'en';

  // 首页右侧仿真窗口中的项目/模块卡片数据（图5风格）
  const mockProjectsList = [
    {
      id: 'GF-2026-01',
      code: 'GF-2026-01',
      iconText: '光',
      iconBg: '#fef3c7',
      iconColor: '#d97706',
      name: '某型综合光电探测系统研制',
      tag: '核心型号',
      sub: '合同总额 360.00 万元 · 负责人: 任海平 (总体组)',
      statTop: '已分配 45.0% · 剩余 198.00 万',
      statBottom: '前期争取 5% · 发货终验 55% · 维保锁定 5%',
      active: true,
    },
    {
      id: 'GF-2026-02',
      code: 'GF-2026-02',
      iconText: '伺',
      iconBg: '#e0f2fe',
      iconColor: '#0284c7',
      name: '高精度伺服控制模块批产交付',
      tag: '批产合同',
      sub: '合同总额 180.00 万元 · 负责人: 陈韬 (产品组)',
      statTop: '已分配 60.0% · 剩余 72.00 万',
      statBottom: '当月分配率 20% · 成员配比 100% 校验通过',
      active: false,
    },
    {
      id: 'KY-2026-05',
      code: 'KY-2026-05',
      iconText: '算',
      iconBg: '#dcfce7',
      iconColor: '#15803d',
      name: '智能边缘计算载荷算法软件升级',
      tag: '科研攻关',
      sub: '合同总额 120.00 万元 · 负责人: 王研 (研发组)',
      statTop: '已分配 35.0% · 剩余 78.00 万',
      statBottom: '跨专业组协同 · 18 名研发骨干参评',
      active: false,
    },
    {
      id: 'GF-2026-06',
      code: 'GF-2026-06',
      iconText: '导',
      iconBg: '#f3e8ff',
      iconColor: '#7e22ce',
      name: '多源融合导航终端联调与环境试验',
      tag: '',
      sub: '合同总额 240.00 万元 · 负责人: 赵总师 (总体组)',
      statTop: '已分配 50.0% · 剩余 120.00 万',
      statBottom: '已导出项目绩点数据包 (.json)',
      active: false,
    },
    {
      id: 'KY-2026-08',
      code: 'KY-2026-08',
      iconText: '测',
      iconBg: '#ffe4e6',
      iconColor: '#e11d48',
      name: '自动化综合测试台架研制与交付',
      tag: '',
      sub: '合同总额 95.00 万元 · 负责人: 孙主任 (产品组)',
      statTop: '已分配 30.0% · 剩余 66.50 万',
      statBottom: '末月 5% 售后维保储备金已锁定',
      active: false,
    },
    {
      id: 'AUD-2026-ALL',
      code: 'AUD-BUNDLE',
      iconText: '核',
      iconBg: '#ccfbf1',
      iconColor: '#0f766e',
      name: '全部门跨项目绩效核算汇总总包',
      tag: '核算大盘',
      sub: '涵盖 8 个在研项目 · 36 名在岗员工 · 行列双向 100% 闭环',
      statTop: '总合同额 1,280.00 万',
      statBottom: '累计已核销 542.60 万绩点',
      active: false,
    }
  ];

  const currentVersionObj = UPDATE_HISTORY[selectedVerIdx] || UPDATE_HISTORY[0];
  const currentCategorized = categorizeVersionItems(currentVersionObj);

  return (
    <div className={`cc-parchment-root ${theme === 'dark' ? 'cc-dark' : ''}`}>
      {/* ==================== 顶部导航栏 (严格对齐图1 + 图2) ==================== */}
      <header className="cc-header">
        <div className="cc-header-inner">
          {/* 左侧：彩瓣图标 + 品牌名称 + 导航菜单 (图1) */}
          <div className="cc-header-left">
            <div className="cc-brand" onClick={() => navigatePage('home')}>
              <img src={brandBurstFlower} alt="衡绩" className="cc-brand-flower" />
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

          {/* 右侧：语言切换 + 主题切换 + GitHub 图标 (严格对齐图2) */}
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
              title={theme === 'parchment' ? '切换深色模式' : '切换暖羊皮纸模式'}
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

      {/* ==================== 视图 1：首页 (严格对齐图5，极简暖羊皮纸风格) ==================== */}
      {pageView === 'home' && (
        <main className="cc-home-main">
          {/* 首屏左右分栏：左侧品牌与操作按钮 + 右侧高仿真软件界面窗口 (图5) */}
          <section className="cc-hero-split">
            {/* 左栏 */}
            <div className="cc-hero-left">
              <button
                type="button"
                className="cc-release-badge"
                onClick={() => navigatePage('changelog')}
                title="点击查看版本更新日志"
              >
                <span>🎉 v{latestVer} {isEn ? 'Released' : '正式发布'}</span>
              </button>

              <div className="cc-hero-brand-row">
                <img src={brandBurstFlower} alt="衡绩" className="cc-hero-logo" />
                <h1>{isEn ? 'HengJi' : '衡绩'}</h1>
              </div>

              <p className="cc-hero-tagline">
                {isEn
                  ? 'Unify and manage your engineering project merit workflow'
                  : '统一管理你的工程项目与团队绩效考核工作流'}
              </p>

              <p className="cc-hero-subdesc">
                {isEn
                  ? 'AES-256 offline encrypted workspace, anti-overdraft quota scheduling, cross-project package aggregation, and 100% closed-loop matrix.'
                  : '合同总额硬约束 · 前低后高稳健防透支排期 · 跨项目数据包汇总 · 二维矩阵双向 100% 闭环'}
              </p>

              <div className="cc-hero-buttons">
                <button
                  type="button"
                  className="cc-btn-terracotta"
                  onClick={() => navigatePage('download')}
                >
                  <Download size={16} />
                  <span>{isEn ? 'Free Download' : '免费下载'}</span>
                </button>

                <button
                  type="button"
                  className="cc-btn-outline"
                  onClick={() => onLaunchDemo('dashboard', 'general')}
                >
                  <Play size={14} fill="currentColor" />
                  <span>{isEn ? 'Try Online' : '在线体验'}</span>
                </button>

                <button
                  type="button"
                  className="cc-btn-outline"
                  onClick={() => navigatePage('docs')}
                >
                  <span>{isEn ? 'Documentation' : '查看文档'}</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="cc-hero-os-hint">
                {isEn
                  ? 'Supports Windows 10/11 (MSI / Setup / Portable / ZIP) · Web Sandbox Live Experience'
                  : '支持 Windows 10/11 (安装版 / 便携版 / ZIP) · 浏览器免安装在线交互体验'}
              </div>
            </div>

            {/* 右栏：软件界面窗口展示 (图5 风格，点击任意项或右上角可直接进入在线体验) */}
            <div className="cc-hero-right">
              <div className="cc-app-window">
                {/* 左侧栏 */}
                <div className="cc-win-sidebar">
                  <div className="cc-win-traffic">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                  </div>

                  <div className="cc-win-brand-bar">
                    <img src={brandBurstFlower} alt="" width={18} height={18} />
                    <strong>衡绩 HengJi</strong>
                    <span className="collapse-icon">«</span>
                  </div>

                  <div className="cc-win-nav-list">
                    {[
                      { key: 'dashboard', label: '全景总览驾驶舱', icon: '🧭', badge: '' },
                      { key: 'projects', label: '项目全周期管理', icon: '📁', badge: '防透支' },
                      { key: 'plans', label: '月度绩效分配', icon: '📅', badge: '集中表' },
                      { key: 'groups', label: '常用项目组矩阵', icon: '👥', badge: '' },
                      { key: 'employees', label: '团队编制花名册', icon: '🪪', badge: '' },
                      { key: 'auditor', label: '全项目核算汇总', icon: '📊', badge: '聚合' },
                      { key: 'reports', label: '多周期汇总报表', icon: '📐', badge: '' },
                      { key: 'stars', label: '卓越绩星荣誉殿堂', icon: '🏆', badge: '' },
                    ].map(item => (
                      <div
                        key={item.key}
                        className={`cc-win-nav-item ${mockSideItem === item.key ? 'active' : ''}`}
                        onClick={() => setMockSideItem(item.key)}
                      >
                        <span className="nav-emoji">{item.icon}</span>
                        <span className="nav-text">{item.label}</span>
                        {item.badge && <em className="nav-pill">{item.badge}</em>}
                      </div>
                    ))}
                  </div>

                  <div className="cc-win-sub-list">
                    <div className="cc-win-sub-item" onClick={() => onLaunchDemo('rules', 'general')}>
                      <BookOpenCheck size={13} /> <span>绩效准则与规范</span>
                    </div>
                    <div className="cc-win-sub-item" onClick={() => onLaunchDemo('analytics', 'general')}>
                      <BarChart3 size={13} /> <span>效能趋势与洞察</span>
                    </div>
                    <div className="cc-win-sub-item" onClick={() => onLaunchDemo('data_io', 'general')}>
                      <ShieldCheck size={13} /> <span>AES-256 灾备中心</span>
                    </div>
                    <div className="cc-win-sub-item stat-row">
                      <Calculator size={13} /> <span>已核销绩点</span>
                      <b style={{ marginLeft: 'auto', fontSize: '11px' }}>542.60 万</b>
                    </div>
                  </div>

                  <div className="cc-win-sidebar-footer">
                    <span onClick={() => onLaunchDemo('dashboard', 'general')}>⊞ 工作台</span>
                    <span onClick={() => onLaunchDemo('auditor', 'auditor')}>⚙ 核算视图</span>
                  </div>
                </div>

                {/* 右侧主面板 */}
                <div className="cc-win-content">
                  <div className="cc-win-topbar">
                    <div className="cc-win-title">
                      <img src={brandHengSeal} alt="" width={22} height={22} style={{ borderRadius: 5 }} />
                      <strong>衡绩考核</strong>
                      <span>工程项目与月度绩点控制台</span>
                    </div>
                    <div className="cc-win-top-actions">
                      <button
                        type="button"
                        className="cc-win-orange-btn"
                        onClick={() => onLaunchDemo(mockSideItem as any, mockConnMode === 'auditor' ? 'auditor' : 'general')}
                      >
                        <Play size={12} fill="currentColor" />
                        <span>进入在线体验工作台</span>
                      </button>
                    </div>
                  </div>

                  {/* 模式切换药丸栏 (复刻图5 直连 / 路由 / 聚合 样式) */}
                  <div className="cc-win-mode-bar">
                    <div className="cc-win-seg-group">
                      <button
                        type="button"
                        className={`cc-win-seg ${mockConnMode === 'general' ? 'active' : ''}`}
                        onClick={() => setMockConnMode('general')}
                      >
                        <span>⚡ 综合管理 ·</span>
                      </button>
                      <button
                        type="button"
                        className={`cc-win-seg ${mockConnMode === 'quota' ? 'active' : ''}`}
                        onClick={() => setMockConnMode('quota')}
                      >
                        <span>🎯 稳健排期</span>
                      </button>
                      <button
                        type="button"
                        className={`cc-win-seg ${mockConnMode === 'auditor' ? 'active' : ''}`}
                        onClick={() => setMockConnMode('auditor')}
                      >
                        <span>📦 核算聚合</span>
                      </button>
                    </div>
                    <span className="cc-win-mode-status">
                      {mockConnMode === 'general' && '● 实时双向闭环校验生效中 · 精确到分 (BigInt)'}
                      {mockConnMode === 'quota' && '● 前低后高稳健交付排期 · 末月强制保留 5% 维保'}
                      {mockConnMode === 'auditor' && '● 跨项目 JSON 数据包自动归集与按工号去重合并'}
                    </span>
                  </div>

                  {/* 项目与模块列表卡片 (复刻图5卡片列表) */}
                  <div className="cc-win-cards-list">
                    {mockProjectsList.map(item => (
                      <div
                        key={item.id}
                        className={`cc-win-item-card ${item.active ? 'active-card' : ''}`}
                        onClick={() => onLaunchDemo(item.id === 'AUD-2026-ALL' ? 'auditor' : (mockSideItem as any), item.id === 'AUD-2026-ALL' ? 'auditor' : 'general')}
                      >
                        <div
                          className="cc-win-item-logo"
                          style={{ background: item.iconBg, color: item.iconColor }}
                        >
                          {item.iconText}
                        </div>
                        <div className="cc-win-item-main">
                          <div className="cc-win-item-title-row">
                            <b>{item.name}</b>
                            {item.tag && <span className="cc-win-mini-tag">{item.tag}</span>}
                          </div>
                          <div className="cc-win-item-sub">{item.sub}</div>
                        </div>
                        <div className="cc-win-item-metrics">
                          <div>{item.statTop}</div>
                          <small>{item.statBottom}</small>
                        </div>
                        <div className="cc-win-item-actions">
                          {item.active ? (
                            <span className="in-use-dot">● 执行中</span>
                          ) : (
                            <Play size={13} className="action-ico" />
                          )}
                          <Pencil size={13} className="action-ico" />
                          <span className="action-dots">···</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 精简版四大核心亮点卡片（保持主页清爽，不展示冗长更新日志） */}
          <section className="cc-home-highlights">
            <div className="cc-highlight-card" onClick={() => onLaunchDemo('projects', 'general')}>
              <div className="cc-hl-icon"><Sliders size={20} /></div>
              <h3>前低后高防透支规划</h3>
              <p>前期争取限高 0~10%（默认 5%），发货交付锁定 45%+ 大头，末月固定保留 5% 维保额度。</p>
            </div>
            <div className="cc-highlight-card" onClick={() => onLaunchDemo('plans', 'general')}>
              <div className="cc-hl-icon"><CalendarRange size={20} /></div>
              <h3>当月集中大表批量发布</h3>
              <p>告别逐个点开项目，全项目同屏套用规划、100% 成员比例严密校验，一键批量发布生效。</p>
            </div>
            <div className="cc-highlight-card" onClick={() => onLaunchDemo('auditor', 'auditor')}>
              <div className="cc-hl-icon"><Calculator size={20} /></div>
              <h3>离线数据包跨项目汇总</h3>
              <p>项目负责人一键导出 JSON 数据包，核算员拖拽导入即可自动完成全员跨项目去重归集。</p>
            </div>
            <div className="cc-highlight-card" onClick={() => onLaunchDemo('reports', 'general')}>
              <div className="cc-hl-icon"><ShieldCheck size={20} /></div>
              <h3>AES-256 加密与双向闭环</h3>
              <p>默认保存在非系统盘（D/E盘），BigInt 精确到分，横向个人与纵向项目累加 100% 严密自洽。</p>
            </div>
          </section>
        </main>
      )}

      {/* ==================== 视图 2：免费下载页 (严格对齐图3) ==================== */}
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

            {/* 下载条目列表框 (复刻图3样式) */}
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
                      {copiedHash === 'msi' ? <Check size={12} /> : <Copy size={12} />}
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
                      {copiedHash === 'exe' ? <Check size={12} /> : <Copy size={12} />}
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
                      {copiedHash === 'zip' ? <Check size={12} /> : <Copy size={12} />}
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
                      {copiedHash === 'portable' ? <Check size={12} /> : <Copy size={12} />}
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
              <p>不确定选哪个？大多数电脑选 <b>安装版 (.msi)</b> 或 <b>便携版 (.zip)</b>。</p>
              <p>
                校验完整性：下载后可在终端执行 <code>certutil -hashfile &lt;file&gt; SHA256</code>，输出应与 GitHub Releases 页面显示的 SHA-256 一致。
              </p>
            </div>

            {/* 历史版本卡片 (严格对齐图3底部) */}
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

      {/* ==================== 视图 3：更新日志独立页面 (严格对齐图4三栏布局) ==================== */}
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

            {/* 右栏：目录锚点导航 (在 vX.X.X 中) */}
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

      {/* ==================== 视图 4：文档页面 (五步闭环与核心规则) ==================== */}
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

              <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(120, 100, 80, 0.15)', display: 'flex', gap: '12px' }}>
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

      {/* ==================== 极简页脚 ==================== */}
      <footer className="cc-footer">
        <div className="cc-footer-inner">
          <div className="cc-footer-left">
            <img src={brandBurstFlower} alt="" width={20} height={20} />
            <span><b>衡绩 HengJi</b> v{APP_VERSION} · {APP_AUTHOR}</span>
          </div>
          <div className="cc-footer-links">
            <button type="button" onClick={() => navigatePage('home')}>首页</button>
            <button type="button" onClick={() => navigatePage('docs')}>文档</button>
            <button type="button" onClick={() => navigatePage('changelog')}>更新日志</button>
            <button type="button" onClick={() => navigatePage('download')}>免费下载</button>
            <button type="button" onClick={() => onLaunchDemo('dashboard', 'general')}>在线体验</button>
            <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
