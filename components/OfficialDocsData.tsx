import React from 'react';
import {
  ShieldCheck,
  HardDrive,
  CalendarRange,
  Users,
  FolderKanban,
  Calculator,
  Trophy,
  BriefcaseBusiness,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Terminal,
  Download,
  Play,
  Copy,
  ChevronRight,
  ExternalLink,
  GitBranch,
  UploadCloud,
  FileCode,
  Sparkles,
  Lock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { APP_VERSION, GITHUB_REPO } from '../lib/core';

export interface DocSection {
  id: string;
  titleZh: string;
  titleEn: string;
  level: 1 | 2;
}

export interface DocChapter {
  id: string;
  number: string;
  titleZh: string;
  titleEn: string;
  sections: DocSection[];
}

export interface DocBook {
  id: string;
  icon: string;
  titleZh: string;
  titleEn: string;
  chapters: DocChapter[];
}

export const DOC_BOOKS: DocBook[] = [
  {
    id: 'intro',
    icon: '🚀',
    titleZh: '详细的衡绩软件介绍',
    titleEn: 'Platform Overview & Architecture',
    chapters: [
      {
        id: 'intro-system',
        number: '1.1',
        titleZh: '系统定位与设计初衷',
        titleEn: 'System Positioning & Origin',
        sections: [
          { id: 'sec-intro-what', titleZh: '什么是衡绩 (HengJi)', titleEn: 'What is HengJi?', level: 1 },
          { id: 'sec-intro-why', titleZh: '解决什么问题（痛点对比）', titleEn: 'Pain Points & Solutions', level: 1 },
          { id: 'sec-intro-philosophy', titleZh: '设计哲学与合规保障', titleEn: 'Design Philosophy & Compliance', level: 2 }
        ]
      },
      {
        id: 'intro-features',
        number: '1.2',
        titleZh: '六大核心功能深度解析',
        titleEn: 'Six Core Functional Pillars',
        sections: [
          { id: 'sec-feat-quota', titleZh: '合同额度全周期管控与防透支引擎', titleEn: 'Contract Quota & Anti-Overdraft', level: 1 },
          { id: 'sec-feat-matrix', titleZh: '月底全景集中透视大表与一键发布', titleEn: 'Monthly Matrix & Batch Release', level: 1 },
          { id: 'sec-feat-dual', titleZh: '双工作区模式：综合管理与核算员分离', titleEn: 'Dual Workspace Architecture', level: 2 },
          { id: 'sec-feat-package', titleZh: '去中心化离线加密数据包流转', titleEn: 'Encrypted Package Routing', level: 1 },
          { id: 'sec-feat-stars', titleZh: '卓越绩星殿堂与多维团队激励看板', titleEn: 'Merit Stars & Incentives', level: 2 },
          { id: 'sec-feat-closed-loop', titleZh: '双向闭环核验与不可篡改审计追踪', titleEn: 'Closed-Loop & Audit Trail', level: 2 }
        ]
      },
      {
        id: 'intro-arch',
        number: '1.3',
        titleZh: '技术架构与数据安全机制',
        titleEn: 'Architecture & Cryptographic Security',
        sections: [
          { id: 'sec-arch-offline', titleZh: '100% 纯本地离线运行架构', titleEn: '100% Offline Runtime Architecture', level: 1 },
          { id: 'sec-arch-crypto', titleZh: 'PBKDF2 与 AES-256-GCM 强认证加密', titleEn: 'PBKDF2 & AES-256-GCM Encryption', level: 1 },
          { id: 'sec-arch-storage', titleZh: '非系统盘自主存储与自动镜像灾备', titleEn: 'Self-Controlled Storage & Backup', level: 2 },
          { id: 'sec-arch-bigint', titleZh: 'BigInt 与最大余数闭环运算算法', titleEn: 'BigInt & Largest Remainder Calculation', level: 2 }
        ]
      },
      {
        id: 'intro-platforms',
        number: '1.4',
        titleZh: '支持的应用与分发格式',
        titleEn: 'Supported Environments & Packages',
        sections: [
          { id: 'sec-plat-env', titleZh: '运行环境与硬件兼容性', titleEn: 'Runtime & Compatibility', level: 1 },
          { id: 'sec-plat-matrix', titleZh: '四大官方分发格式矩阵（MSI/EXE/Portable/ZIP）', titleEn: 'Four Distribution Packages', level: 1 }
        ]
      }
    ]
  },
  {
    id: 'manual',
    icon: '👥',
    titleZh: '详细的衡绩软件新手操作手册',
    titleEn: 'Step-by-Step Practical User Manual',
    chapters: [
      {
        id: 'manual-admin',
        number: '2.1',
        titleZh: '综合管理员新手实操指南（5步上手）',
        titleEn: 'General Admin 5-Step Rapid Guide',
        sections: [
          { id: 'sec-admin-step1', titleZh: '第一步：创建安全加密数据库', titleEn: 'Step 1: Create Secure Encrypted Database', level: 1 },
          { id: 'sec-admin-step2', titleZh: '第二步：录入团队编制与工程合同', titleEn: 'Step 2: Enter Roster & Contracts', level: 1 },
          { id: 'sec-admin-step3', titleZh: '第三步：项目全周期额度防透支排期', titleEn: 'Step 3: Phased Anti-Overdraft Scheduling', level: 1 },
          { id: 'sec-admin-step4', titleZh: '第四步：月底集中考评分配与一键发布', titleEn: 'Step 4: Monthly Allocation & Batch Release', level: 1 },
          { id: 'sec-admin-step5', titleZh: '第五步：导出项目加密数据包与财务报表', titleEn: 'Step 5: Export Encrypted Package & CSV', level: 1 }
        ]
      },
      {
        id: 'manual-auditor',
        number: '2.2',
        titleZh: '专职核算员新手实操指南（5步汇总）',
        titleEn: 'Auditor 5-Step Cross-Project Rollup Guide',
        sections: [
          { id: 'sec-auditor-step1', titleZh: '第一步：进入绩效核算员专用工作区', titleEn: 'Step 1: Enter Auditor Dedicated Workspace', level: 1 },
          { id: 'sec-auditor-step2', titleZh: '第二步：批量拖拽导入项目加密数据包', titleEn: 'Step 2: Drag-and-Drop Import .hengji Packages', level: 1 },
          { id: 'sec-auditor-step3', titleZh: '第三步：基于唯一工号跨项目自动归集', titleEn: 'Step 3: Cross-Project Rollup by Employee ID', level: 1 },
          { id: 'sec-auditor-step4', titleZh: '第四步：合同履约率与预算偏离度核验', titleEn: 'Step 4: Contract Fulfillment & Budget Audit', level: 1 },
          { id: 'sec-auditor-step5', titleZh: '第五步：生成财务发放终表与审计归档', titleEn: 'Step 5: Generate Payroll Matrix & Archive', level: 1 }
        ]
      },
      {
        id: 'manual-standards',
        number: '2.3',
        titleZh: '业务口径与负责人参考系数规范',
        titleEn: 'Business Standards & Guidance Ranges',
        sections: [
          { id: 'sec-std-tiers', titleZh: '合同金额梯队与负责人参考系数区间', titleEn: 'Contract Tiers & Leader Ratios', level: 1 },
          { id: 'sec-std-faqs', titleZh: '异常预警处理与常见高频疑问解答', titleEn: 'Warning Handling & Operational FAQs', level: 1 }
        ]
      }
    ]
  },
  {
    id: 'deploy',
    icon: '💻',
    titleZh: '《远程推送与发布部署教程》',
    titleEn: 'Remote Git Push, Build & Deployment Guide',
    chapters: [
      {
        id: 'deploy-prep',
        number: '3.1',
        titleZh: '准备工作与版本一致性检查',
        titleEn: 'Prerequisites, Versioning & Unit Testing',
        sections: [
          { id: 'sec-deploy-env', titleZh: 'Node.js 环境与版本号协同规范', titleEn: 'Node.js & Version Synchronization', level: 1 },
          { id: 'sec-deploy-test', titleZh: '运行自动化单元测试套件（npm test）', titleEn: 'Running Automated Test Suite (npm test)', level: 1 }
        ]
      },
      {
        id: 'deploy-git',
        number: '3.2',
        titleZh: 'Git 本地库远程推送与版本标签',
        titleEn: 'Git Staging, Commit & Remote Tag Push',
        sections: [
          { id: 'sec-deploy-commit', titleZh: '代码暂存与标准化语义提交', titleEn: 'Git Status, Add & Semantic Commit', level: 1 },
          { id: 'sec-deploy-tag', titleZh: '创建版本附注标签并推送到 GitHub', titleEn: 'Create Annotated Tag & Push to Remote', level: 1 }
        ]
      },
      {
        id: 'deploy-build',
        number: '3.3',
        titleZh: '桌面端本地打包构建全套矩阵',
        titleEn: 'Local Packaging Matrix: MSI, NSIS, Portable & ZIP',
        sections: [
          { id: 'sec-deploy-bundle', titleZh: '前端 Web Bundle 生产环境构建', titleEn: 'Desktop Web Bundle Build with Vite', level: 1 },
          { id: 'sec-deploy-builder', titleZh: '使用 electron-builder 编译三大格式', titleEn: 'Compile NSIS, MSI & Portable Installers', level: 1 },
          { id: 'sec-deploy-zip', titleZh: '构建 ZIP 绿色免安装完整包', titleEn: 'Generate Portable ZIP Archive via Script', level: 2 }
        ]
      },
      {
        id: 'deploy-release',
        number: '3.4',
        titleZh: 'GitHub Releases 命令行自动化发布',
        titleEn: 'Automated Publication to GitHub Releases',
        sections: [
          { id: 'sec-deploy-gh-upload', titleZh: '使用原生脚本一键自动上传资产包', titleEn: 'Upload Assets via publish-release-github.mjs', level: 1 },
          { id: 'sec-deploy-gh-verify', titleZh: '资产哈希校验与 Release 页面验证', titleEn: 'Asset SHA256 Verification & Release Checks', level: 2 }
        ]
      },
      {
        id: 'deploy-pages',
        number: '3.5',
        titleZh: 'GitHub Pages 静态站点命令行部署',
        titleEn: 'Deploying Static Website to GitHub Pages',
        sections: [
          { id: 'sec-deploy-pages-build', titleZh: '编译官方网站静态资源', titleEn: 'Build Web Artifacts via npm run pages:build', level: 1 },
          { id: 'sec-deploy-pages-push', titleZh: '执行 deploy-pages 脚本推送到 gh-pages', titleEn: 'Push to gh-pages Branch via Script', level: 1 }
        ]
      },
      {
        id: 'deploy-summary',
        number: '3.6',
        titleZh: '全流程一键连续执行速查与排错指南',
        titleEn: 'Full-Pipeline One-Liner & Troubleshooting',
        sections: [
          { id: 'sec-deploy-oneliner', titleZh: '终端一键全流程流水线命令', titleEn: 'Terminal Full-Pipeline Continuous One-Liner', level: 1 },
          { id: 'sec-deploy-trouble', titleZh: '常见报错排查与 Git 凭证处理', titleEn: 'Troubleshooting: Git 403, Path Issues & Cache', level: 1 }
        ]
      }
    ]
  }
];

interface DocArticleContentProps {
  chapterId: string;
  isEn: boolean;
  onLaunchDemo?: (tab?: string, workspace?: 'general' | 'auditor') => void;
  onNavigateDownload?: () => void;
  onCopyText?: (text: string, key: string) => void;
  copiedKey?: string;
}

export function DocArticleContent({
  chapterId,
  isEn,
  onLaunchDemo,
  onNavigateDownload,
  onCopyText,
  copiedKey
}: DocArticleContentProps) {
  // 根据选中的 chapterId 渲染对应的正文板块
  switch (chapterId) {
    // ==========================================
    // 文章 1：衡绩软件深度介绍
    // ==========================================
    case 'intro-system':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? '1.1 System Positioning & Design Philosophy' : '1.1 系统定位与设计初衷'}</h1>
            <span className="cc-cl-date">{isEn ? 'HengJi Official Whitepaper' : '衡绩平台官方技术白皮书'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'HengJi (衡绩) is an engineering and R&D team merit evaluation platform designed for multi-project, long-lifecycle, and cross-functional teams (General, Product, R&D). It resolves the core challenge of balancing quantitative merit fairness with project risk control, completely moving away from fragile Excel sheets.'
              : '衡绩（HengJi）是一款专为多项目、长周期、跨专业组（总体组 / 产品组 / 研发组）工程研发团队打造的高可靠绩效量化考核与核算平台。“衡”取衡平公正之意，“绩”寓实干奉献之实。它将合同总额刚性约束、全周期防透支额度排期、月底透视大表集中考评、离线去中心化数据包流转与跨项目自动化归集融为一体，彻底告别繁琐易错的 Excel 离散台账。'}
          </p>

          <hr className="cc-cl-divider" />

          {/* 小节 1: 什么是衡绩 */}
          <section id="sec-intro-what" className="cc-cl-sec">
            <h2>{isEn ? 'What is HengJi?' : '一、什么是衡绩 (HengJi)？'}</h2>
            <p>
              {isEn
                ? 'In modern engineering, aerospace, defense, and complex hardware/software R&D, a project typically spans 6 to 36 months, with contract values ranging from hundreds of thousands to tens of millions. Team members frequently participate in multiple projects simultaneously across overall system design, product prototyping, and specialized component R&D. Traditional HR software or generic SaaS tools cannot handle contract-bound budget caps, phased delivery milestones, or cross-project personnel contribution aggregation.'
                : '在现代工程制造、国防军工、高端装备、科研院所以及复杂软硬件研发领域，项目周期通常跨越 6 至 36 个月，单个项目合同金额从数十万到数千万元不等。一个技术骨干往往同时承担 3~5 个在研项目的不同研发任务。通用的人事考核软件（如各类基于固定工资折算的在线 SaaS 系统）由于无法理解“工程工作令号”、“合同额度刚性锁定”、“多阶段交付里程碑”以及“一人跨多项目绩点分摊”等严苛工业场景，根本无法落地。'}
            </p>

            <div className="cc-doc-step-card" style={{ marginTop: '16px' }}>
              <div className="cc-doc-step-header">
                <span className="cc-doc-step-tag">{isEn ? 'CORE PRINCIPLE' : '核心定义'}</span>
                <strong style={{ fontSize: '15px' }}>{isEn ? 'Dual-Anchor Merit Calculation' : '双锚定绩点计算法则'}</strong>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
                {isEn
                  ? 'HengJi anchors every awarded merit point to verifiable project delivery: 1 Point = ¥10,000 Contract Output Value. Monthly points earned by an employee equal Contract Total × Monthly Progress Ratio × Member Share Ratio, ensuring zero inflation and mathematical equity.'
                  : '衡绩系统确立了“以成果交付为基石、以合同额度为硬顶”的双锚定法则：系统内部 1 绩点严格锚定 1 万元工程合同贡献产值。个人当月所获绩点 = 项目合同总额 × 当月项目进度配比 × 个人当月贡献比例。没有凭空捏造的虚高分值，每一分绩点都有据可查、实打实对应工程产值。'}
              </p>
            </div>
          </section>

          {/* 小节 2: 解决什么问题 */}
          <section id="sec-intro-why" className="cc-cl-sec">
            <h2>{isEn ? 'Pain Points & Contrast Analysis' : '二、解决什么问题（传统模式 VS 衡绩对比）'}</h2>
            <p>
              {isEn
                ? 'Compare traditional spreadsheet management with HengJi to understand why engineering teams transition to this specialized platform:'
                : '通过以下工业研发团队常见管理场景对比，直观展现衡绩系统带来的质变提升：'}
            </p>

            <div style={{ overflowX: 'auto', margin: '16px 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: 'var(--cc-surface)', borderRadius: '10px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: 'var(--cc-surface-hover)', borderBottom: '2px solid var(--cc-border)' }}>
                    <th style={{ padding: '12px 14px', textAlign: 'left', width: '22%' }}>{isEn ? 'Scenario / Dimension' : '管理场景 / 核心痛点'}</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', width: '38%', color: '#dc2626' }}>{isEn ? 'Traditional Excel / Generic SaaS' : '传统 Excel / 通用人事工具'}</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', width: '40%', color: '#16a34a' }}>{isEn ? 'HengJi Platform Solution' : '衡绩专业平台解决方案'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--cc-border)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{isEn ? 'Project Quota Overdraft' : '项目预算防透支'}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--cc-text-secondary)' }}>{isEn ? 'No caps; early phases consume all points, leaving zero motivation for final acceptance.' : '无刚性阀门约束，项目前期立项就将绩效分光，到了后期发货终验时“有活无钱”，严重挫伤攻坚士气。'}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--cc-text)' }}>{isEn ? 'Built-in 3-Phase Anti-Overdraft scheduling: Inception hard-capped at 5%, delivery holds 45%+, 5% warranty retained.' : '内置三段式防透支法则：前期争取限高 5%，研制与发货锁定 45%+ 大头，末月维保强制保留 5%，确保善始善终。'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--cc-border)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{isEn ? 'Cross-Project Aggregation' : '跨项目人员兼项汇总'}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--cc-text-secondary)' }}>{isEn ? 'Finance manually merges hundreds of sheets; names/IDs mistyped, formulas break.' : '核算员月底手动合并数十张各项目 Excel 表，同名同姓、工号手滑、VLOOKUP 错位频发，耗时 3~5 天核对。'}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--cc-text)' }}>{isEn ? 'Unique Employee ID binding; drag & drop project packages for 1-second instant aggregation.' : '以员工工号为唯一主键，核算员直接批量拖拽各项目加密数据包，1 秒钟完成全员跨项目去重与合并折算。'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--cc-border)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{isEn ? 'Rounding Discrepancies' : '小数舍入分角误差'}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--cc-text-secondary)' }}>{isEn ? 'Floating point rounding causes sum(ratios) != 100%, rejected by finance.' : '浮点除法产生 0.333333... 无限循环，多人加总常出现 99.99% 或 100.01%，被财务审计直接打回。'}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--cc-text)' }}>{isEn ? 'BigInt fixed-point engine with largest remainder algorithm ensures exactly 100.00% closure down to cents.' : '采用 BigInt 定点分位算法配合最大余数补差机制，无论参与成员多少人，总和永远严密闭环至 100.00%。'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--cc-border)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{isEn ? 'Data Confidentiality' : '保密与数据主权'}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--cc-text-secondary)' }}>{isEn ? 'Cloud SaaS uploads sensitive defense/commercial blueprints; Excel files leak easily without password.' : '云端 SaaS 存在敏感军工科研数据出网违规风险；明文 Excel 通过微信/邮件传输极易被随意拷贝泄密。'}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--cc-text)' }}>{isEn ? '100% local offline execution; PBKDF2 + AES-256-GCM encryption with local zero-cloud architecture.' : '100% 本地纯离线运行，严禁公网上传；底层采用军工级 PBKDF2 与 AES-256-GCM 强认证加密，自主可控。'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 小节 3: 设计哲学 */}
          <section id="sec-intro-philosophy" className="cc-cl-sec">
            <h2>{isEn ? 'Design Philosophy & Compliance' : '三、设计哲学与合规保障'}</h2>
            <div className="cc-doc-callout">
              <strong style={{ color: 'var(--cc-terracotta)', display: 'block', marginBottom: '6px' }}>
                🛡️ {isEn ? 'Core Design Axiom: Transparency, Reproducibility, Zero Cloud Reliance' : '核心设计铁律：规则透明、计算可复现、绝不上云'}
              </strong>
              <p style={{ fontSize: '13px', margin: 0, color: 'var(--cc-text-secondary)' }}>
                {isEn
                  ? 'All calculation parameters, contract totals, and monthly release ratios are recorded with cryptographic timestamps. Any stakeholder or auditor can recalculate the exact merit matrix down to the cent, eliminating subjective ambiguity.'
                  : '衡绩坚信：考核的权威来源于算法的不可争议性。系统所有的合同基数、分配比例、发布时间戳均具备严密审计链。任何经授权的领导或审计人员，输入相同的初始数据与规则，均可 100% 重现计算结果，杜绝人情分、印象分，以客观工程产值服人。'}
              </p>
            </div>
          </section>
        </div>
      );

    case 'intro-features':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? '1.2 Six Core Functional Pillars' : '1.2 六大核心功能深度解析'}</h1>
            <span className="cc-cl-date">{isEn ? 'Architecture Breakdown' : '系统架构核心支柱'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'HengJi is built on six interconnected functional pillars that span the entire lifecycle: from contract budgeting and phased quota scheduling, to monthly evaluation matrices, offline package transmission, star rankings, and immutable audit logs.'
              : '衡绩平台由六大彼此咬合的核心功能支柱构建而成，覆盖从工程立项、预算排期、月底考评、数据流转、荣誉激励到合规审计的全流程链条。'}
          </p>

          <hr className="cc-cl-divider" />

          {/* 支柱 1 */}
          <section id="sec-feat-quota" className="cc-cl-sec">
            <h2>{isEn ? '1. Contract Quota & Phased Anti-Overdraft Engine' : '1. 合同额度全周期管控与防透支排期引擎'}</h2>
            <p>
              {isEn
                ? 'Each project order corresponds to a fixed contract value. The quota scheduling engine dynamically prevents over-allocation by breaking the lifecycle into structured phases:'
                : '系统对每个工程工作令号设定合同总额刚性红线。额度排期引擎通过三段式配比，彻底封死前松后紧导致的透支风险：'}
            </p>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.7', fontSize: '13.5px' }}>
              <li>
                <b>{isEn ? 'Inception & Bidding Phase (Month 1: 0% ~ 10%, default 5%)' : '前期立项与争取阶段（首月 0% ~ 10% 可调，系统默认 5%）'}</b>：
                {isEn ? 'Covers initial feasibility, proposal defense, and bidding with strict caps.' : '用于立项论证、商务投标与前期方案设计，设立硬性上限，防止项目尚未落地就大量瓜分预算。'}
              </li>
              <li>
                <b>{isEn ? 'Core R&D & Delivery Phase (Progressive, 45%+ major weight)' : '研制试验与成品交付阶段（前低后高，主体权重 45%+）'}</b>：
                {isEn ? 'Allocates points progressively as prototypes, hardware tests, and delivery acceptance are achieved.' : '随初样联调、正样试验及出厂交付进度梯次释放，让攻坚骨干在攻坚期获得最坚实的报酬回馈。'}
              </li>
              <li>
                <b>{isEn ? 'Warranty & Acceptance Phase (Final month: 5% mandatory retention)' : '售后维保与终检验收阶段（末月固定保留 5%）'}</b>：
                {isEn ? 'Retains 5% of the total contract quota until warranty ends, ensuring ongoing technical support.' : '在项目周期的最后一个月刚性锁定 5% 尾款额度，确保在用户现场终检验收与保修期内始终有激励支撑。'}
              </li>
            </ul>
          </section>

          {/* 支柱 2 */}
          <section id="sec-feat-matrix" className="cc-cl-sec">
            <h2>{isEn ? '2. Monthly Unified Matrix & Batch Release' : '2. 月底集中分配与全景透视大表'}</h2>
            <p>
              {isEn
                ? 'Instead of switching between dozens of separate windows, project managers and administrators view all ongoing projects in one consolidated matrix. The table highlights budget variances, allocated ratios, and member breakdowns in real time.'
                : '彻底摒弃在几十个项目窗口之间来回切换的低效做法。衡绩在【月度分配】模块中提供全项目当月透视大表，所有在研项目的合同总额、当月可用配额、参评人员分配率一览无余，支持一键套用排期计划与批量审核发布。'}
            </p>
          </section>

          {/* 支柱 3 */}
          <section id="sec-feat-dual" className="cc-cl-sec">
            <h2>{isEn ? '3. Dual Workspace: General Admin & Dedicated Auditor' : '3. 双工作区模式：综合管理与核算员分离'}</h2>
            <p>
              {isEn
                ? 'Follows the principle of least privilege. General Administrators manage projects, rosters, and allocations, while Auditors focus on receiving encrypted project packages and performing cross-project payroll rollups without permission conflicts.'
                : '遵循权限最小化与审计中立原则。系统内置“综合管理工作区”与“专职核算工作区”两大独立视图：综合管理员专注管理项目生命周期与月度考评；核算员专注接收各项目经理交接的加密数据包，执行跨项目全员薪酬归集，权责清晰分明。'}
            </p>
          </section>

          {/* 支柱 4 */}
          <section id="sec-feat-package" className="cc-cl-sec">
            <h2>{isEn ? '4. Encrypted Offline Package Routing' : '4. 去中心化离线加密数据包流转'}</h2>
            <p>
              {isEn
                ? 'Project managers export standard .hengji or .json encrypted data packets with one click. These packets can be transferred via internal email, USB, or local shared folders to the auditor for instant batch drag-and-drop import.'
                : '专为纯局域网无中心数据库环境研发。项目负责人在项目完成后一键导出具有数字指纹的 `.hengji` 加密数据包，通过内部涉密光盘或内网办公网络交接给核算员。核算员端无需联网，直接批量拖拽即可瞬间解析入库。'}
            </p>
          </section>

          {/* 支柱 5 */}
          <section id="sec-feat-stars" className="cc-cl-sec">
            <h2>{isEn ? '5. Merit Stars Hall & Multi-Dimensional Incentives' : '5. 卓越绩星殿堂与多维团队激励看板'}</h2>
            <p>
              {isEn
                ? 'Visualizes team contributions through monthly, quarterly, and annual top performer rankings, functional group comparisons (General, Product, R&D), and honor badges, inspiring high performance.'
                : '系统自动将冷冰冰的数字转化为鼓舞人心的荣誉体系。自动生成月度绩星、季度先锋与年度功勋排行榜，横向对比总体组、产品组、研发组的效能产出，颁发数字化荣誉勋章，极大激发团队攻坚动力。'}
            </p>
          </section>

          {/* 支柱 6 */}
          <section id="sec-feat-closed-loop" className="cc-cl-sec">
            <h2>{isEn ? '6. Closed-Loop Verification & Immutable Audit Trail' : '6. 双向闭环核验与不可篡改审计追踪'}</h2>
            <p>
              {isEn
                ? 'Supports 2D matrix verification (Employees × Projects), with full change logging, cryptographic file hashing, and automated mirror backups on every save.'
                : '提供纵向“按项目归集”与横向“按人员穿透”的二维交叉校验矩阵。任何数据的增删改查均记录在本地防篡改操作日志中，每次保存自动触发 `.hengji.backup` 镜像文件生成，确保数据链完整可追溯。'}
            </p>
          </section>
        </div>
      );

    case 'intro-arch':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? '1.3 Technical Architecture & Cryptographic Security' : '1.3 技术架构与数据安全机制'}</h1>
            <span className="cc-cl-date">{isEn ? 'Zero-Cloud & High Reliability' : '纯离线无外网依赖安全体系'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'HengJi is designed under the Zero-Trust, Zero-Cloud security philosophy. All sensitive employee rosters, project contracts, and payroll data reside entirely on local user storage, encrypted with industrial-grade cryptography.'
              : '衡绩平台全面遵从“零信任、绝不上云、数据主权在己”的安全设计理念。所有的部门花名册、合同标的与考评数据 100% 留存在用户自选的本地物理介质中，通过高强度加密算法构筑无懈可击的安全屏障。'}
          </p>

          <hr className="cc-cl-divider" />

          {/* 小节 1 */}
          <section id="sec-arch-offline" className="cc-cl-sec">
            <h2>{isEn ? '1. 100% Offline Zero-Cloud Runtime Architecture' : '1. 100% 纯本地离线运行架构'}</h2>
            <p>
              {isEn
                ? 'Built on Vite, React 18, TypeScript, and Electron. The application contains zero remote telemetry or external tracking scripts, making it fully operational in isolated military and research intranets.'
                : '软件采用 React 18 + TypeScript + Vite + Electron 现代化前端与桌面端架构。安装包经过严格安全审计，剥离任何第三方跟踪代码与外部网络调用。即使在物理拔掉网线的完全隔离涉密机房中，软件各项功能均可 100% 正常稳定运行。'}
            </p>
          </section>

          {/* 小节 2 */}
          <section id="sec-arch-crypto" className="cc-cl-sec">
            <h2>{isEn ? '2. PBKDF2 & AES-256-GCM Cryptographic Security' : '2. PBKDF2 与 AES-256-GCM 强认证加密'}</h2>
            <div className="cc-doc-step-card">
              <div className="cc-doc-step-header">
                <span className="cc-doc-step-tag">{isEn ? 'ENCRYPTION' : '加密算法规格'}</span>
                <strong>{isEn ? 'Military-Grade Authenticated Encryption' : '军工级认证加密标准'}</strong>
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>
                <li>
                  <b>PBKDF2-SHA256</b>：{isEn ? 'Uses 100,000 iterations with cryptographic random salts to derive AES keys from user master passwords, thwarting GPU/FPGA brute-force dictionary attacks.' : '采用 100,000 次高强度迭代与加密随机盐值，将主密码派生为 256 位对称密钥，彻底抵御 GPU / 彩虹表暴力破解。'}
                </li>
                <li>
                  <b>AES-256-GCM</b>：{isEn ? 'Combines AES symmetric encryption with Galois Counter Mode authentication tags. Any unauthorized bit modification or file tampering is instantly detected and blocked from loading.' : '不仅对数据明文进行端到端加密，同时生成 128 位 GCM 认证标签（Auth Tag）。若文件被第三方十六进制编辑器哪怕篡改 1 个字节，解密时将立即报错并拒绝加载，杜绝暗中篡改。'}
                </li>
              </ul>
            </div>
          </section>

          {/* 小节 3 */}
          <section id="sec-arch-storage" className="cc-cl-sec">
            <h2>{isEn ? '3. Self-Controlled Storage & Automated Mirror Backup' : '3. 非系统盘自主存储与自动镜像灾备'}</h2>
            <p>
              {isEn
                ? 'HengJi never hides user data in AppData or system drive directories. Users explicitly select safe paths (e.g. D:\\HengJiData\\). Each save automatically generates an exact .hengji.backup mirror file in the same folder for disaster recovery.'
                : '衡绩坚决反对将业务数据私自暗箱存储在 Windows 系统盘（C 盘）深处的临时目录中（一旦系统崩溃重装将永久丢失）。用户在初次新建数据库时，可自主选择安全的非系统盘路径（推荐 D 盘或 E 盘）。系统每次保存时，会在同目录自动生成 `.hengji.backup` 实时镜像备份，实现双保险防灾。'}
            </p>
          </section>

          {/* 小节 4 */}
          <section id="sec-arch-bigint" className="cc-cl-sec">
            <h2>{isEn ? '4. BigInt & Largest Remainder Calculation Engine' : '4. BigInt 与最大余数闭环运算算法'}</h2>
            <p>
              {isEn
                ? 'Standard JavaScript numbers suffer from IEEE-754 floating-point inaccuracies (e.g. 0.1 + 0.2 != 0.3). HengJi converts currency into integer cents using BigInt, coupled with the largest remainder algorithm, guaranteeing that individual shares sum up to exactly 100.00% without rounding drift.'
                : '标准 JavaScript 浮点数存在二进制舍入误差（如 `0.1 + 0.2 = 0.30000000000000004`）。衡绩在底层将所有金额全部换算为“分（Cents）”并采用 BigInt 整数体系运算；在比例分摊上引入“最大余数算法（Largest Remainder Method）”，当存在无限循环小数分摊时，将余数分毫不差地补入排序靠前的成员中，确保分配总和与项目预算 100% 严密闭合。'}
            </p>
          </section>
        </div>
      );

    case 'intro-platforms':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? '1.4 Supported Environments & Package Formats' : '1.4 支持的应用与分发格式'}</h1>
            <span className="cc-cl-date">{isEn ? 'Multi-Package Matrix' : '全格式发布矩阵'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'HengJi supports Windows 10, Windows 11, and Windows Server environments. It offers four distinct packaging formats to accommodate personal, enterprise-domain, and portable offline deployment scenarios.'
              : '衡绩平台全面适配 Windows 10、Windows 11 及 Windows Server 64 位操作系统，同时支持纯内网免安装使用。官方提供 4 种独立编译的分发格式，满足个人安装、企业域静默推送、涉密离线免提权等各类部署要求。'}
          </p>

          <hr className="cc-cl-divider" />

          <section id="sec-plat-matrix" className="cc-cl-sec">
            <h2>{isEn ? 'Four Official Package Formats' : '四大官方分发格式矩阵'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div className="cc-doc-step-card">
                <span className="cc-doc-step-tag" style={{ background: '#10b981' }}>MSI</span>
                <h3 style={{ margin: '8px 0 4px', fontSize: '15px' }}>{isEn ? 'Enterprise Installer (.msi)' : 'MSI 企业级安装包'}</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--cc-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  {isEn ? 'Supports standard Windows Installer flags, msiexec /qn silent deployment, and Active Directory Group Policy (GPO) batch rollouts.' : '支持标准 Windows Installer 规范，支持 `msiexec /qn` 静默安装，适合企业网络管理员通过 AD 域策略批量下发部署。'}
                </p>
              </div>

              <div className="cc-doc-step-card">
                <span className="cc-doc-step-tag" style={{ background: '#0284c7' }}>EXE</span>
                <h3 style={{ margin: '8px 0 4px', fontSize: '15px' }}>{isEn ? 'NSIS Setup Wizard (.exe)' : 'EXE 智能安装向导版'}</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--cc-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  {isEn ? 'Step-by-step graphical wizard, custom installation paths, automatic desktop shortcuts, and safe uninstaller.' : '经典的图形化安装向导，支持自主选择安装盘符，自动创建开始菜单与桌面快捷方式，支持一键卸载升级。'}
                </p>
              </div>

              <div className="cc-doc-step-card">
                <span className="cc-doc-step-tag" style={{ background: '#f59e0b' }}>PORTABLE</span>
                <h3 style={{ margin: '8px 0 4px', fontSize: '15px' }}>{isEn ? 'Single-File Portable (.exe)' : 'Portable 便携免安装版'}</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--cc-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  {isEn ? 'Zero administrator rights required; single executable runs directly from USB flash drives on restricted guest machines.' : '单文件绿色运行，免去系统安装向导，无需任何系统管理员（Admin）提权，非常适合在受限电脑或 U 盘即插即用。'}
                </p>
              </div>

              <div className="cc-doc-step-card">
                <span className="cc-doc-step-tag" style={{ background: '#8b5cf6' }}>ZIP</span>
                <h3 style={{ margin: '8px 0 4px', fontSize: '15px' }}>{isEn ? 'Green Zip Archive (.zip)' : 'ZIP 绿色免安装完整包'}</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--cc-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  {isEn ? 'Pure folder package; unzip to any non-system drive (D:\\ or E:\\) to launch immediately without touching the Windows Registry.' : '纯文件夹压缩包，解压到指定非系统盘即可双击直接运行，绝不修改 Windows 注册表，便于批量离线归档。'}
                </p>
              </div>
            </div>
          </section>
        </div>
      );

    // ==========================================
    // 文章 2：衡绩软件新手操作手册（管理员 + 核算员）
    // ==========================================
    case 'manual-admin':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? '2.1 General Admin 5-Step Practical Guide' : '2.1 综合管理员新手实操指南（5步上手）'}</h1>
            <span className="cc-cl-date">{isEn ? 'Role: Project Manager & Department Head' : '适用角色：部门负责人 / 综合管理员 / 项目经理'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'This guide provides comprehensive, step-by-step instructions for General Administrators. Learn how to initialize your encrypted workspace, import rosters and contracts, schedule phased overdraft-proof quotas, execute monthly evaluations, and export audit packages.'
              : '本操作手册面向综合管理员与项目负责人。采用图文并茂的卡片化步骤教学，手把手教您在 10 分钟内完成安全建库、花名册与合同录入、防透支排期规划、月底集中分配发布以及数据包交接全套流程。'}
          </p>

          <hr className="cc-cl-divider" />

          {/* 步骤 1 */}
          <section id="sec-admin-step1" className="cc-cl-sec">
            <div className="cc-doc-step-card">
              <div className="cc-doc-step-header">
                <span className="cc-doc-step-tag">STEP 1</span>
                <strong style={{ fontSize: '16px' }}>{isEn ? 'Create Secure Encrypted Workspace' : '第一步：创建安全加密数据库'}</strong>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
                {isEn
                  ? 'Launch the HengJi client, select [General Admin Workspace], choose a safe storage path (recommended on non-system drives such as D:\\ or E:\\), and define a strong master encryption password.'
                  : '启动衡绩软件后，进入主入口界面，选择【🏢 综合管理工作区（推荐）】。点击【新建数据库】，系统将弹出安全向导：'}
              </p>
              <div className="cc-doc-callout" style={{ margin: '10px 0' }}>
                <b>💡 {isEn ? 'Best Practice for File Location' : '建库位置最佳实践'}</b>：
                {isEn
                  ? 'Always select non-system disks (e.g. D:\\HengJi_Workspace\\). File format will be .hengji. Remember your master password—due to offline encryption, forgotten passwords cannot be recovered via cloud resets!'
                  : '推荐将数据库文件建立在非系统盘（如 `D:\\衡绩考核数据\\`），文件名如 `2026年度工程研发部.hengji`。请务必牢记设置的主密码——基于纯离线零外网设计，一旦密码遗忘，任何人都无法通过云端找回！'}
              </div>
            </div>
          </section>

          {/* 步骤 2 */}
          <section id="sec-admin-step2" className="cc-cl-sec">
            <div className="cc-doc-step-card">
              <div className="cc-doc-step-header">
                <span className="cc-doc-step-tag">STEP 2</span>
                <strong style={{ fontSize: '16px' }}>{isEn ? 'Import Team Roster & Engineering Contracts' : '第二步：录入团队编制与工程合同'}</strong>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
                {isEn
                  ? 'Navigate to [Team Roster] and [Project Lifecycle]. You can batch import members via Excel/CSV or add them manually. The smart parser automatically strips thousand separators (e.g. 1,500,000.00) and maps members to General, Product, or R&D groups.'
                  : '点击左侧导航栏的【团队编制花名册】与【项目全周期管理】。系统全面兼容财务部门导出的 Excel / CSV 台账：'}
              </p>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', lineHeight: '1.7', margin: '8px 0' }}>
                <li>
                  <b>{isEn ? 'Unique Employee ID' : '员工唯一工号绑定'}</b>：{isEn ? 'Every member is identified by their unique Employee ID (e.g. EMP001). This guarantees that even if names are identical across departments, cross-project aggregation will never mismatch.' : '每个成员以工号为全局唯一标识（如 EMP001）。即使出现同名同姓，跨项目汇总也绝不错配。'}
                </li>
                <li>
                  <b>{isEn ? 'Functional Group Tagging' : '专业组标签划分'}</b>：{isEn ? 'Assign members to Overall General, Product, or Specialized R&D groups, powering automated department trend comparisons and star ratings.' : '为成员勾选总体组、产品组或研发组。后续在团队月度分配大表中可一键快速勾选该组人员，无需逐人点选。'}
                </li>
                <li>
                  <b>{isEn ? 'Contract Order ID' : '工作令号与子合同绑定'}</b>：{isEn ? 'Link contract values and phase descriptions under designated project order IDs with zero data loss.' : '录入项目名称、工作令号及合同总金额（万元）。支持同一工作令号下多份子合同独立登记。'}
                </li>
              </ul>
            </div>
          </section>

          {/* 步骤 3 */}
          <section id="sec-admin-step3" className="cc-cl-sec">
            <div className="cc-doc-step-card">
              <div className="cc-doc-step-header">
                <span className="cc-doc-step-tag">STEP 3</span>
                <strong style={{ fontSize: '16px' }}>{isEn ? 'Phased Anti-Overdraft Quota Scheduling' : '第三步：项目全周期额度防透支排期'}</strong>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
                {isEn
                  ? 'Open [Monthly Allocation] or [Project Lifecycle], click on the project schedule button, and apply the "Robust Phased Delivery" template. The system verifies that the sum of all monthly quota percentages strictly equals 100%.'
                  : '进入【月度绩效分配】或【项目全周期管理】，点击项目的【额度排期】按钮。推荐直接点击【套用“🎯 稳健交付型”排期法则】：'}
              </p>
              <div className="cc-doc-callout" style={{ margin: '10px 0' }}>
                <b>🛡️ {isEn ? 'Three-Phase Anti-Overdraft Allocation Rule' : '三段式防透支核心法则'}</b>：
                <ol style={{ paddingLeft: '18px', margin: '6px 0 0', lineHeight: '1.6' }}>
                  <li>{isEn ? 'Month 1 (Inception / Proposal): Strictly capped at 0% ~ 10% (default 5%).' : '首月（立项方案论证期）：严格限制在 0% ~ 10%（默认 5%），设立封顶线。'}</li>
                  <li>{isEn ? 'Mid-to-Late Months (Core R&D & Delivery): Scaled progressively, with major 45%+ weight on acceptance.' : '中后期（成品研制、总装联调与发货出厂）：额度前低后高，交付月集中释放 45%+ 大头，攻坚期动力充沛。'}</li>
                  <li>{isEn ? 'Final Month (Warranty & Field Support): 5% hard retention.' : '末月（现场维保与终检验收）：刚性锁定 5% 尾款额度，保修期技术支持不撂挑子。'}</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 步骤 4 */}
          <section id="sec-admin-step4" className="cc-cl-sec">
            <div className="cc-doc-step-card">
              <div className="cc-doc-step-header">
                <span className="cc-doc-step-tag">STEP 4</span>
                <strong style={{ fontSize: '16px' }}>{isEn ? 'Monthly Allocation & Batch Release' : '第四步：月底集中考评分配与一键发布'}</strong>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
                {isEn
                  ? 'At the end of each month, administrators enter the [Monthly Allocation] unified matrix. Review all projects, add team members, adjust share percentages (which must sum up to exactly 100%), and click [Batch Release] to lock the month.'
                  : '每到月底考评窗口期，综合管理员进入【月度分配】全景透视大表：'}
              </p>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', lineHeight: '1.7', margin: '8px 0' }}>
                <li>{isEn ? 'Click [Apply Planned Quota] to auto-populate monthly quota budgets from your schedule.' : '点击【套用排期计划】，各项目当月规划额度自动注入，无需手动敲打计算器。'}</li>
                <li>{isEn ? 'Check team members in each project and configure their share percentages. BigInt ensures exact 100.00% closure.' : '勾选参评团队成员，配置其当月贡献占比。系统右侧实时显示已分配占比合计，只有达到 100.00% 才能绿灯保存。'}</li>
                <li>{isEn ? 'Click [Batch Release All Projects] to generate immutable cryptographic hashes and lock the month.' : '分配确认无误后，点击【批量发布当月所有项目】，系统生成数字签名并锁定当前月度，防止后续无意篡改。'}</li>
              </ul>
            </div>
          </section>

          {/* 步骤 5 */}
          <section id="sec-admin-step5" className="cc-cl-sec">
            <div className="cc-doc-step-card">
              <div className="cc-doc-step-header">
                <span className="cc-doc-step-tag">STEP 5</span>
                <strong style={{ fontSize: '16px' }}>{isEn ? 'Export Encrypted Package & Financial Reports' : '第五步：导出项目加密数据包与财务报表'}</strong>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
                {isEn
                  ? 'Navigate to [Data Asset Center], click [Export Project Package (.hengji)] to generate handoff files for the dedicated auditor. You can also export standard Excel/CSV payroll ledgers with one click.'
                  : '当月分配发布完成后，管理员进入【数据资产中心】：'}
              </p>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', lineHeight: '1.7', margin: '8px 0' }}>
                <li><b>{isEn ? 'Export Encrypted Package (.hengji)' : '导出项目加密数据包 (.hengji)'}</b>：{isEn ? 'Generates tamper-proof encrypted data packets containing this project’s metadata and allocations to transfer to the auditor.' : '一键导出带有完整数据指纹的 `.hengji` 加密交接包，通过内网安全邮件交接给专职绩效核算员。'}</li>
                <li><b>{isEn ? 'Export CSV / Excel' : '一键导出财务标准报表 (CSV / Excel)'}</b>：{isEn ? 'Generates clean, pre-formatted payroll tables ready for ERP/OA salary calculation.' : '一键导出包含项目名称、员工工号、姓名、当月分配额、合同基数等全要素的标准报表。'}</li>
              </ul>
            </div>
          </section>
        </div>
      );

    case 'manual-auditor':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? '2.2 Dedicated Auditor 5-Step Cross-Project Rollup Guide' : '2.2 专职核算员新手实操指南（5步汇总）'}</h1>
            <span className="cc-cl-date">{isEn ? 'Role: Financial Auditor & Cross-Project Specialist' : '适用角色：专职核算员 / 绩效审核员 / 财务薪酬主管'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'This guide is tailored specifically for Dedicated Auditors who receive packages from various project managers. Learn how to perform zero-error cross-project personnel rollups, detect budget anomalies, and export verified payroll sheets.'
              : '本手册专为负责跨项目汇总的核算员设计。在大型工业企业中，各项目由不同的项目经理独立打分，核算员需要将这些分散的成果统一归集并核验合规性。衡绩专职核算工作区让多项目汇总变得如同拖拽文件般简单快捷。'}
          </p>

          <hr className="cc-cl-divider" />

          {/* 步骤 1 */}
          <section id="sec-auditor-step1" className="cc-cl-sec">
            <div className="cc-doc-step-card">
              <div className="cc-doc-step-header">
                <span className="cc-doc-step-tag">AUDIT STEP 1</span>
                <strong style={{ fontSize: '16px' }}>{isEn ? 'Enter Dedicated Auditor Workspace' : '第一步：进入绩效核算员专用工作区'}</strong>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
                {isEn
                  ? 'From the launcher or the top-left role switch, choose [📊 Auditor Workspace]. Enter your auditor workspace password to access the clean cross-project rollup interface.'
                  : '在软件启动界面或左上角角色切换栏中，选择【📊 绩效核算工作区】。核算员模式界面专注呈现汇总穿透矩阵与合规审计看板，免受项目底层排期细节的视觉干扰。'}
              </p>
            </div>
          </section>

          {/* 步骤 2 */}
          <section id="sec-auditor-step2" className="cc-cl-sec">
            <div className="cc-doc-step-card">
              <div className="cc-doc-step-header">
                <span className="cc-doc-step-tag">AUDIT STEP 2</span>
                <strong style={{ fontSize: '16px' }}>{isEn ? 'Batch Drag-and-Drop Import .hengji Packages' : '第二步：批量拖拽导入项目加密数据包'}</strong>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
                {isEn
                  ? 'In the [Data Package Import Center], drag and drop all .hengji packages received from project managers into the dropzone. The system decrypts and validates them simultaneously.'
                  : '在核算员工作区界面的【数据包导入中心】，直接选中各项目经理发来的多个 `.hengji` 加密文件（支持单次 10~50 个文件），直接拖入网页或客户端虚线框内：'}
              </p>
              <div className="cc-doc-callout" style={{ margin: '10px 0' }}>
                <b>🛡️ {isEn ? 'Automated Security Verification' : '导入自动化安全校验'}</b>：
                {isEn
                  ? 'The system validates package integrity, checks for duplicate project order IDs, verifies employee ID continuity, and flags any tampered files immediately.'
                  : '系统在导入瞬间自动执行三重审计：① 校验数据包数字指纹是否完整防篡改；② 检查工作令号是否重复；③ 校验人员工号与基础档案的一致性。全部通过后显示绿色对勾。'}
              </div>
            </div>
          </section>

          {/* 步骤 3 */}
          <section id="sec-auditor-step3" className="cc-cl-sec">
            <div className="cc-doc-step-card">
              <div className="cc-doc-step-header">
                <span className="cc-doc-step-tag">AUDIT STEP 3</span>
                <strong style={{ fontSize: '16px' }}>{isEn ? 'Cross-Project Auto-Rollup by Employee ID' : '第三步：基于唯一工号跨项目自动归集'}</strong>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
                {isEn
                  ? 'Click [Execute Cross-Project Rollup]. The system traverses all imported project data, identifies members across different projects via their Employee ID, and builds a comprehensive 2D pivot matrix.'
                  : '点击【一键执行跨项目穿透汇总】。系统底层算法瞬间完成跨项目人员穿透归集：'}
              </p>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', lineHeight: '1.7', margin: '8px 0' }}>
                <li>{isEn ? 'A team member participating in Project A (3.2 pts) and Project B (4.5 pts) is automatically unified into a total of 7.7 pts.' : '若张工程师在“某型号雷达总体”（分得 3.2 绩点）与“数字信号处理研发”（分得 4.5 绩点）均有兼项，系统自动合并为该员工总计 7.7 绩点。'}</li>
                <li>{isEn ? 'Clicking on any employee expands their contribution breakdown across projects, complete with order IDs and release timestamps.' : '点击表格中任何一名员工的名字，即可向下展开查看他在各个项目中的详细分配占比、项目工作令号与项目负责人评语。'}</li>
              </ul>
            </div>
          </section>

          {/* 步骤 4 */}
          <section id="sec-auditor-step4" className="cc-cl-sec">
            <div className="cc-doc-step-card">
              <div className="cc-doc-step-header">
                <span className="cc-doc-step-tag">AUDIT STEP 4</span>
                <strong style={{ fontSize: '16px' }}>{isEn ? 'Contract Fulfillment & Budget Audit' : '第四步：合同履约率与预算偏离度核验'}</strong>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
                {isEn
                  ? 'The audit dashboard highlights contract fulfillment and alerts for any anomalies: over-allocation warnings (Red), unassigned remaining quotas (Yellow), and healthy balanced statuses (Green).'
                  : '切换至【合同履约率与偏离度审计】看板。系统通过红黄绿状态灯直观呈现各项目的资金安全状态：'}
              </p>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', lineHeight: '1.7', margin: '8px 0' }}>
                <li><span style={{ color: '#16a34a', fontWeight: '700' }}>● {isEn ? 'Green (Normal)' : '绿色正常'}</span>：{isEn ? 'Allocations match phased schedules with exactly 100% member closure.' : '月度分配严格遵从三段式排期，成员比例严密闭环至 100.00%。'}</li>
                <li><span style={{ color: '#ca8a04', fontWeight: '700' }}>● {isEn ? 'Yellow (Notice)' : '黄色提醒'}</span>：{isEn ? 'Project leader allocation percentage falls outside recommended guidance ranges.' : '项目负责人分配比例超出柔性参考区间（如大项目负责人占比偏高），需核对说明。'}</li>
                <li><span style={{ color: '#dc2626', fontWeight: '700' }}>● {isEn ? 'Red (Violation)' : '红色预警'}</span>：{isEn ? 'Cumulative releases exceed contract total quota or member shares do not sum to 100%.' : '累计释放额度超过合同总额硬约束，或当月分配总和不等于 100%，系统阻断并提示驳回。'}</li>
              </ul>
            </div>
          </section>

          {/* 步骤 5 */}
          <section id="sec-auditor-step5" className="cc-cl-sec">
            <div className="cc-doc-step-card">
              <div className="cc-doc-step-header">
                <span className="cc-doc-step-tag">AUDIT STEP 5</span>
                <strong style={{ fontSize: '16px' }}>{isEn ? 'Generate Payroll Matrix & Archive' : '第五步：生成财务发放终表与审计归档'}</strong>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
                {isEn
                  ? 'Once audit checks pass, click [Generate Final Payroll CSV/Excel]. The system exports a standardized payroll schedule with digital signatures for company finance disbursement, and saves a disaster-recovery backup snapshot.'
                  : '核验确认无误后，点击【生成财务结算总表（CSV / Excel）】。系统导出包含全员最终核定绩点金额的标准表格，直接对接财务薪酬发放系统，并自动在核算员本地归档完整的快照审计台账。'}
              </p>
            </div>
          </section>
        </div>
      );

    case 'manual-standards':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? '2.3 Business Standards & Guidance Ranges' : '2.3 业务口径与负责人参考系数规范'}</h1>
            <span className="cc-cl-date">{isEn ? 'Operational Standards & FAQs' : '业务考核标准与常见疑问解答'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'To prevent disproportionate allocation towards project leads while honoring leadership contributions, HengJi provides recommended leader allocation ranges grouped by contract value tiers.'
              : '为避免“大项目负责人占尽绩效，底层骨干颗粒无收”或“小项目负责人无激励不愿担责”的不良倾向，衡绩系统内置了经多方工业研讨确立的项目负责人参考占比区间，提供智能柔性提示。'}
          </p>

          <hr className="cc-cl-divider" />

          <section id="sec-std-tiers" className="cc-cl-sec">
            <h2>{isEn ? 'Contract Value Tiers & Recommended Leader Ratios' : '一、合同金额梯队与负责人参考系数区间'}</h2>
            <div style={{ overflowX: 'auto', margin: '16px 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', background: 'var(--cc-surface)', borderRadius: '10px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: 'var(--cc-surface-hover)', borderBottom: '2px solid var(--cc-border)' }}>
                    <th style={{ padding: '12px 14px', textAlign: 'left', width: '28%' }}>{isEn ? 'Contract Value Tier' : '合同总额梯队'}</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', width: '28%' }}>{isEn ? 'Recommended Leader Ratio' : '负责人参考占比区间'}</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left', width: '44%' }}>{isEn ? 'Management Rationale' : '业务管理导向与依据'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--cc-border)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>0 &lt; {isEn ? 'Contract' : '合同金额'} &lt; 50 {isEn ? 'Ten Thousand (¥500K)' : '万元'}</td>
                    <td style={{ padding: '10px 14px', color: '#c85a32', fontWeight: '700' }}>60% ~ 90%</td>
                    <td style={{ padding: '10px 14px', color: 'var(--cc-text-secondary)' }}>{isEn ? 'Small-scale / agile tasks. The leader usually drives both overall design and hands-on execution; high ratio ensures active commitment.' : '小型技术攻坚或短平快课题，项目负责人通常既做方案又主力编码/试验，高占比确保骨干敢挑重担。'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--cc-border)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>50 ≤ {isEn ? 'Contract' : '合同金额'} &lt; 500 {isEn ? 'Ten Thousand (¥5M)' : '万元'}</td>
                    <td style={{ padding: '10px 14px', color: '#c85a32', fontWeight: '700' }}>30% ~ 60%</td>
                    <td style={{ padding: '10px 14px', color: 'var(--cc-text-secondary)' }}>{isEn ? 'Standard engineering development. Balances coordinator oversight with core technical team distribution.' : '中型标准工程研制项目，兼顾总体统筹协调责任与各专业组核心主研人员的实干分红。'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--cc-border)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{isEn ? 'Contract' : '合同金额'} ≥ 500 {isEn ? 'Ten Thousand (¥5M+)' : '万元'}</td>
                    <td style={{ padding: '10px 14px', color: '#c85a32', fontWeight: '700' }}>10% ~ 30%</td>
                    <td style={{ padding: '10px 14px', color: 'var(--cc-text-secondary)' }}>{isEn ? 'Major strategic program. Contract sum is large; a 10%~30% share represents significant compensation, leaving ample quota to incentivize dozens of team members.' : '重大战略型号或大型工程总承包，总金额巨大。10%~30% 的绝对金额已足够激励负责人，更多额度需向数十名参研骨干深度倾斜。'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="sec-std-faqs" className="cc-cl-sec">
            <h2>{isEn ? 'Frequently Asked Questions (FAQs)' : '二、常见高频疑问解答'}</h2>
            <div className="cc-doc-step-card" style={{ marginBottom: '14px' }}>
              <strong style={{ fontSize: '14.5px', color: 'var(--cc-text)' }}>
                Q1: {isEn ? 'What if the project leader allocation percentage exceeds the reference range?' : '如果项目负责人分配占比超出了参考区间，系统会强制拦截保存吗？'}
              </strong>
              <p style={{ fontSize: '13px', color: 'var(--cc-text-secondary)', margin: '8px 0 0', lineHeight: '1.6' }}>
                A: {isEn ? 'No. HengJi treats reference ranges as soft guidance prompts. Administrators can still save and release after confirming project-specific circumstances (e.g. sole-contributor tasks).' : '不会强制阻断。衡绩采用“柔性引导”机制，超出区间仅以醒目黄色角标提醒，不剥夺管理者的自主决策权。若确因单兵作战等特殊情况，管理员依然可以正常发布。'}
              </p>
            </div>

            <div className="cc-doc-step-card">
              <strong style={{ fontSize: '14.5px', color: 'var(--cc-text)' }}>
                Q2: {isEn ? 'Can an unallocated monthly quota be rolled over to next month?' : '当月未分配完的剩余额度，可以自动顺延到下个月吗？'}
              </strong>
              <p style={{ fontSize: '13px', color: 'var(--cc-text-secondary)', margin: '8px 0 0', lineHeight: '1.6' }}>
                A: {isEn ? 'Yes. Quotas not assigned during a given month remain in the project’s total unspent budget pool and can be seamlessly scheduled in subsequent milestones.' : '完全可以。未分配的额度仍保留在项目总预算池中，管理员可在后续月份随时进行排期微调，额度绝不会凭空蒸发或作废。'}
              </p>
            </div>
          </section>
        </div>
      );

    // ==========================================
    // 文章 3：远程推送与发布部署教程（纯命令行实操）
    // ==========================================
    case 'deploy-prep':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? '3.1 Prerequisites, Versioning & Unit Testing' : '3.1 准备工作与版本一致性检查'}</h1>
            <span className="cc-cl-date">{isEn ? 'Step-by-Step Command Line Manual' : '纯命令行操作标准手册'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'Before executing remote pushes and building distribution packages, verify local runtime dependencies, synchronize version numbers across project files, and execute the automated test suite to ensure 100% calculation integrity.'
              : '在执行任何远程代码推送或编译打包前，必须确保本地开发环境完整、版本号在所有关键配置文件中严格一致，并通过全部自动化算法测试套件，杜绝带病发布。'}
          </p>

          <hr className="cc-cl-divider" />

          <section id="sec-deploy-env" className="cc-cl-sec">
            <h2>{isEn ? '1. Node.js Environment & Version Synchronization' : '1. Node.js 环境与版本号协同规范'}</h2>
            <p>
              {isEn
                ? 'Open your terminal (PowerShell or Bash) in the project root directory and check your Node and npm versions (Node 18+ required):'
                : '在项目根目录下打开终端（PowerShell 或 Bash），检查 Node 与 npm 基础环境（要求 Node.js 18.0 或更高版本）：'}
            </p>
            <pre style={{ background: 'var(--cc-surface-hover)', padding: '12px 16px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px' }}>
              <code>node -v{'\n'}npm -v</code>
            </pre>
            <div className="cc-doc-callout">
              <b>⚠️ {isEn ? 'Three-Way Version Consistency Rule' : '三处版本号必须严格一致'}</b>：
              {isEn
                ? 'Ensure APP_VERSION in lib/core.ts, version in package.json, and the current release tag share the exact same version string (e.g. 0.7.10).'
                : '每次发布前，请检查以下三处版本号字符串是否完全统一（例如统一为 `0.7.10`）：\n① `package.json` 中的 `"version": "0.7.10"`\n② `lib/core.ts` 中的 `export const APP_VERSION = \'0.7.10\';`\n③ `app/desktop-updater.ts` 中的当前版本常量。'}
            </div>
          </section>

          <section id="sec-deploy-test" className="cc-cl-sec">
            <h2>{isEn ? '2. Running Automated Test Suite (npm test)' : '2. 运行自动化单元测试套件（npm test）'}</h2>
            <p>
              {isEn
                ? 'Execute the automated test suite to verify BigInt precision, quota calculations, and auditor rollup algorithms:'
                : '执行自动化单测命令，严密校验 BigInt 闭环算法、防透支排期逻辑及核算员跨项目归集：'}
            </p>
            <pre style={{ background: 'var(--cc-surface-hover)', padding: '12px 16px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px' }}>
              <code>npm test</code>
            </pre>
            <div className="cc-doc-step-card" style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: '700' }}>
                <CheckCircle2 size={18} />
                <span>{isEn ? 'Test Pass Verification Criteria' : '通过指标与核验标准'}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--cc-text-secondary)', margin: '6px 0 0' }}>
                {isEn
                  ? 'All 37 core unit tests and 9 dedicated auditor tests must output green checks. Proceed to code commit only after 100% test success.'
                  : '终端必须输出 46/46 项用例全部通过（Pass），包括 37 项核心考核逻辑单测与 9 项核算员穿透测试全部绿灯通过。'}
              </p>
            </div>
          </section>
        </div>
      );

    case 'deploy-git':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? '3.2 Git Staging, Commit & Remote Tag Push' : '3.2 Git 本地库远程推送与版本标签'}</h1>
            <span className="cc-cl-date">{isEn ? 'Terminal Step 1' : '纯命令行第一步'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'Stage modified workspace files, create a standardized semantic commit, tag the repository with an annotated version tag, and push code and tags to GitHub.'
              : '使用原生 Git 命令将本地修改的所有文件加入暂存区，编写标准化的语义提交信息，打上包含版本说明的附注标签，并推送到 GitHub 远程仓库。'}
          </p>

          <hr className="cc-cl-divider" />

          <section id="sec-deploy-commit" className="cc-cl-sec">
            <h2>{isEn ? '1. Git Status, Add & Semantic Commit' : '1. 代码暂存与标准化语义提交'}</h2>
            <p>{isEn ? 'Inspect working directory changes and stage all files:' : '查看当前代码状态，并将改动加入暂存区：'}</p>
            <pre style={{ background: 'var(--cc-surface-hover)', padding: '12px 16px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px' }}>
              <code>{`# 1. 检查本地工作区状态\ngit status\n\n# 2. 将所有修改与新文件加入暂存区\ngit add .\n\n# 3. 提交版本更新记录\ngit commit -m "release: v${APP_VERSION} - system update and improvements"`}</code>
            </pre>
          </section>

          <section id="sec-deploy-tag" className="cc-cl-sec">
            <h2>{isEn ? '2. Create Annotated Tag & Push to Remote Origin' : '2. 创建版本附注标签并推送到 GitHub'}</h2>
            <p>
              {isEn
                ? 'Create a Git annotated tag matching the release version (e.g. v0.7.10), then push both the main branch and the tag to GitHub:'
                : '使用 `-a` 参数创建带附注说明的版本标签（例如 `v0.7.10`），然后分别将 `main` 分支与新标签推送到远程：'}
            </p>
            <pre style={{ background: 'var(--cc-surface-hover)', padding: '12px 16px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px' }}>
              <code>{`# 1. 创建附注版本标签\ngit tag -a v${APP_VERSION} -m "release v${APP_VERSION}"\n\n# 2. 推送 main 分支最新代码\ngit push origin main\n\n# 3. 将新版本标签推送到远程\ngit push origin v${APP_VERSION}`}</code>
            </pre>
            <div className="cc-doc-callout">
              <b>💡 {isEn ? 'Remote Push Verification' : '推送成功核验'}</b>：
              {isEn
                ? 'Open https://github.com/' + GITHUB_REPO + '/tags to verify that the new tag appears.'
                : `命令执行完毕后，访问 https://github.com/${GITHUB_REPO}/tags 即可看到已成功生成的版本标签。`}
            </div>
          </section>
        </div>
      );

    case 'deploy-build':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? '3.3 Local Packaging Matrix: MSI, NSIS, Portable & ZIP' : '3.3 桌面端本地打包构建全套矩阵'}</h1>
            <span className="cc-cl-date">{isEn ? 'Terminal Step 2' : '纯命令行第二步'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'HengJi compiles four distinct distribution formats from source: NSIS Setup Wizard (EXE), Enterprise Installer (MSI), Single-File Portable (EXE), and Green Archive (ZIP). Follow the commands below to generate all four binaries.'
              : '衡绩客户端支持从源码全自动编译 4 种独立分发包：EXE 安装向导、MSI 企业域安装包、Portable 便携单文件版与 ZIP 绿色解压版。本节展示纯命令行编译步骤。'}
          </p>

          <hr className="cc-cl-divider" />

          <section id="sec-deploy-bundle" className="cc-cl-sec">
            <h2>{isEn ? '1. Desktop Web Bundle Production Build with Vite' : '1. 前端 Web Bundle 生产环境构建'}</h2>
            <p>{isEn ? 'Bundle the desktop UI code with Vite:' : '首先使用专用的桌面端 Vite 配置文件进行高压缩生产编译：'}</p>
            <pre style={{ background: 'var(--cc-surface-hover)', padding: '12px 16px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px' }}>
              <code>npx vite build --config vite.desktop.config.ts</code>
            </pre>
          </section>

          <section id="sec-deploy-builder" className="cc-cl-sec">
            <h2>{isEn ? '2. Compile NSIS, MSI & Portable Installers via electron-builder' : '2. 使用 electron-builder 编译三大格式'}</h2>
            <p>
              {isEn
                ? 'Execute electron-builder targeting Windows x64 to generate NSIS, MSI, and Portable binaries simultaneously:'
                : '通过 electron-builder 一次性编译生成 NSIS 安装向导、MSI 企业级静默安装包以及 Portable 便携单文件版：'}
            </p>
            <pre style={{ background: 'var(--cc-surface-hover)', padding: '12px 16px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px' }}>
              <code>npx electron-builder --win nsis msi portable --x64</code>
            </pre>
          </section>

          <section id="sec-deploy-zip" className="cc-cl-sec">
            <h2>{isEn ? '3. Generate Portable ZIP Archive via Script' : '3. 构建 ZIP 绿色免安装完整包'}</h2>
            <p>{isEn ? 'Package the uncompressed win-unpacked directory into a standalone ZIP file:' : '运行项目内置的压缩脚本，将免安装文件夹打包为绿色 ZIP 压缩包：'}</p>
            <pre style={{ background: 'var(--cc-surface-hover)', padding: '12px 16px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px' }}>
              <code>node scripts/build-zip.mjs</code>
            </pre>
            <div className="cc-doc-step-card" style={{ marginTop: '12px' }}>
              <strong>{isEn ? 'Artifact Output Verification' : '构建产物检查清单（release/ 目录下）'}</strong>：
              <ul style={{ paddingLeft: '18px', fontSize: '13px', margin: '6px 0 0', lineHeight: '1.7' }}>
                <li><code>{`hengji-${APP_VERSION}.exe`}</code>（NSIS 安装向导包，约 75MB）</li>
                <li><code>{`hengji-${APP_VERSION}.msi`}</code>（MSI 企业级安装包，约 75MB）</li>
                <li><code>{`hengji-portable-${APP_VERSION}.exe`}</code>（Portable 单文件便携版，约 75MB）</li>
                <li><code>{`hengji-${APP_VERSION}.zip`}</code>（ZIP 绿色免安装解压包，约 85MB）</li>
              </ul>
            </div>
          </section>
        </div>
      );

    case 'deploy-release':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? '3.4 Automated Publication to GitHub Releases' : '3.4 GitHub Releases 命令行自动化发布'}</h1>
            <span className="cc-cl-date">{isEn ? 'Terminal Step 3' : '纯命令行第三步'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'Upload your compiled binaries (EXE, MSI, Portable, ZIP) directly to GitHub Releases via script or GitHub CLI, complete with release notes and SHA256 checksums.'
              : '通过项目封装的自动化发布脚本，利用 GitHub REST API 将本地 release 目录下的 4 个大文件自动上传至对应版本的 Release 资产中，无需手动在网页后台缓慢拖拽。'}
          </p>

          <hr className="cc-cl-divider" />

          <section id="sec-deploy-gh-upload" className="cc-cl-sec">
            <h2>{isEn ? '1. Upload Assets via publish-release-github.mjs' : '1. 使用原生脚本一键自动上传资产包'}</h2>
            <p>{isEn ? 'Run the native release publishing script in terminal:' : '在终端中执行项目自带的自动化发布脚本：'}</p>
            <pre style={{ background: 'var(--cc-surface-hover)', padding: '12px 16px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px' }}>
              <code>node scripts/publish-release-github.mjs</code>
            </pre>
            <div className="cc-doc-callout">
              <b>🛡️ {isEn ? 'Script Capabilities' : '脚本执行动作解析'}</b>：
              <ol style={{ paddingLeft: '18px', margin: '6px 0 0', lineHeight: '1.6', fontSize: '13px' }}>
                <li>{isEn ? 'Detects local Git credentials or GITHUB_TOKEN automatically.' : '自动读取本地已授权的 Git 凭证管理器或 GITHUB_TOKEN。'}</li>
                <li>{isEn ? 'Creates GitHub Release matching current version tag if it does not exist.' : '检查并自动创建匹配当前版本标签（如 v' + APP_VERSION + '）的 Release 条目。'}</li>
                <li>{isEn ? 'Uploads all 4 binaries with multi-part stream handling, replacing existing outdated assets.' : '并发上传 4 种分发包，遇到旧文件自动安全替换。'}</li>
                <li>{isEn ? 'Generates markdown release notes with direct download links and acceleration mirror URLs.' : '自动在 Release 页面生成排版工整的更新说明与极速镜像下载链接。'}</li>
              </ol>
            </div>
          </section>

          <section id="sec-deploy-gh-verify" className="cc-cl-sec">
            <h2>{isEn ? '2. Release Verification' : '2. Release 页面在线核验'}</h2>
            <p>
              {isEn
                ? `Visit https://github.com/${GITHUB_REPO}/releases/tag/v${APP_VERSION} to confirm that all 4 assets are uploaded and download links are operational.`
                : `脚本完成后，在浏览器中打开 https://github.com/${GITHUB_REPO}/releases/tag/v${APP_VERSION}，确认 4 个安装包文件均已挂载，且下载链接可正常点击。`}
            </p>
          </section>
        </div>
      );

    case 'deploy-pages':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? '3.5 Deploying Static Website to GitHub Pages' : '3.5 GitHub Pages 静态站点命令行部署'}</h1>
            <span className="cc-cl-date">{isEn ? 'Terminal Step 4' : '纯命令行第四步'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'Compile the official landing page and web sandbox demo into optimized static web assets, and deploy them to the gh-pages branch via the deploy script.'
              : '将衡绩官方网站、在线沙盒体验工作台以及完整在线文档中心编译为高优化的静态 Web 资源，并通过部署脚本推送到 GitHub 的 `gh-pages` 分支。'}
          </p>

          <hr className="cc-cl-divider" />

          <section id="sec-deploy-pages-build" className="cc-cl-sec">
            <h2>{isEn ? '1. Build Web Artifacts via npm run pages:build' : '1. 编译官方网站静态资源'}</h2>
            <p>{isEn ? 'Run the production web build:' : '在终端中执行官方网站的生产编译命令：'}</p>
            <pre style={{ background: 'var(--cc-surface-hover)', padding: '12px 16px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px' }}>
              <code>npm run pages:build</code>
            </pre>
            <small style={{ color: 'var(--cc-text-muted)' }}>
              {isEn ? 'Compiles React app into dist/ with proper base URL routing (/hengji/) and injects 404.html for SPA fallback.' : '该命令会将应用打包至 `dist/` 目录，配置好相对路由前缀 `/hengji/`，并自动注入 `404.html` 防止刷新页面白屏。'}
            </small>
          </section>

          <section id="sec-deploy-pages-push" className="cc-cl-sec">
            <h2>{isEn ? '2. Push to gh-pages Branch via deploy-pages.mjs' : '2. 执行 deploy-pages 脚本推送到 gh-pages 分支'}</h2>
            <p>{isEn ? 'Run the deployment script:' : '执行专用的推送脚本，将 `dist` 产物推送到 `gh-pages` 分支：'}</p>
            <pre style={{ background: 'var(--cc-surface-hover)', padding: '12px 16px', borderRadius: '8px', overflowX: 'auto', fontSize: '13px' }}>
              <code>node scripts/deploy-pages.mjs</code>
            </pre>
            <div className="cc-doc-step-card" style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: '700' }}>
                <CheckCircle2 size={18} />
                <span>{isEn ? 'Live Official Site Verification' : '官方网站在线验证地址'}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--cc-text-secondary)', margin: '6px 0 0' }}>
                {isEn ? 'Wait 30-60 seconds, then open: ' : '等待 30~60 秒 GitHub Pages 服务完成刷新后，即可在浏览器中访问：\n'}
                <a href="https://zoufudun.github.io/hengji/" target="_blank" rel="noreferrer" style={{ color: 'var(--cc-terracotta)', fontWeight: '700' }}>
                  https://zoufudun.github.io/hengji/
                </a>
              </p>
            </div>
          </section>
        </div>
      );

    case 'deploy-summary':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? '3.6 Full-Pipeline One-Liner & Troubleshooting' : '3.6 全流程一键连续执行速查与排错指南'}</h1>
            <span className="cc-cl-date">{isEn ? 'Cheatsheet & Common Errors' : '全流程一键速查与排错指南'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'A quick reference cheat sheet containing the full continuous pipeline command and solutions for common Git/Release errors.'
              : '本节提供将全套流程串联为一键执行的连续命令串（One-Liner），以及在命令行操作过程中可能遇到的常见报错排查技巧。'}
          </p>

          <hr className="cc-cl-divider" />

          <section id="sec-deploy-oneliner" className="cc-cl-sec">
            <h2>{isEn ? '1. Terminal Full-Pipeline Continuous One-Liner' : '1. 💡 终端一键全流程流水线命令'}</h2>
            <p>{isEn ? 'Execute the entire sequence (Testing → Desktop Packaging → Web Build → GitHub Release → GitHub Pages) in one line:' : '如果您熟悉流程，可直接在终端中复制以下单行命令，一次性全自动完成测试、桌面打包、Release 上传与 Pages 部署：'}</p>
            <pre style={{ background: 'var(--cc-surface-hover)', padding: '14px 16px', borderRadius: '8px', overflowX: 'auto', fontSize: '12.5px', lineHeight: '1.6' }}>
              <code>npm test &amp;&amp; npx vite build --config vite.desktop.config.ts &amp;&amp; npx electron-builder --win nsis msi portable --x64 &amp;&amp; node scripts/build-zip.mjs &amp;&amp; npm run pages:build &amp;&amp; node scripts/publish-release-github.mjs &amp;&amp; node scripts/deploy-pages.mjs</code>
            </pre>
          </section>

          <section id="sec-deploy-trouble" className="cc-cl-sec">
            <h2>{isEn ? '2. Troubleshooting & Common Git Errors' : '2. 常见报错排查与 Git 凭证处理'}</h2>
            
            <div className="cc-doc-step-card" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: '700' }}>
                <AlertTriangle size={18} />
                <span>{isEn ? 'Git Push 403 Forbidden / Authentication Failure' : '报错 1：git push origin 报错 403 / 身份认证失败'}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--cc-text-secondary)', margin: '8px 0 0', lineHeight: '1.6' }}>
                {isEn
                  ? 'Cause: GitHub password authentication was deprecated. Solution: Generate a Personal Access Token (classic) with repo scope on GitHub, and update Windows Credential Manager or set GITHUB_TOKEN environment variable.'
                  : '原因：GitHub 已废弃密码认证方式。解决办法：前往 GitHub Settings -> Developer Settings -> Personal access tokens 生成具有 repo 权限的 Token，在 Windows 凭据管理器中更新密码，或在终端中设置环境变量：\n`$env:GITHUB_TOKEN="ghp_你的Token"`'}
              </p>
            </div>

            <div className="cc-doc-step-card" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: '700' }}>
                <AlertTriangle size={18} />
                <span>{isEn ? 'Release Asset Upload Timeout or Network Failure' : '报错 2：publish-release 脚本上传大文件超时中断'}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--cc-text-secondary)', margin: '8px 0 0', lineHeight: '1.6' }}>
                {isEn
                  ? 'Cause: Network instability when uploading 75MB+ binaries. Solution: Re-run `node scripts/publish-release-github.mjs`. The script will detect already uploaded files and resume/retry failed ones.'
                  : '原因：个别网络环境下直连 GitHub Releases API 出现超时重置。解决办法：重新运行 `node scripts/publish-release-github.mjs` 即可，脚本具有断点检测能力，已成功上传的文件会自动跳过，仅补传失败资产。'}
              </p>
            </div>

            <div className="cc-doc-step-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: '700' }}>
                <Sparkles size={18} />
                <span>{isEn ? 'Browser Cache Refresh Tip' : '提示 3：GitHub Pages 更新后浏览器仍显示旧内容'}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--cc-text-secondary)', margin: '8px 0 0', lineHeight: '1.6' }}>
                {isEn
                  ? 'Use Ctrl + F5 (or Cmd + Shift + R on Mac) to perform a hard refresh, bypassing browser caches.'
                  : '解决办法：按下 `Ctrl + F5`（Mac 用户按 `Cmd + Shift + R`）强制刷新浏览器缓存，即可加载最新部署的网页。'}
              </p>
            </div>
          </section>
        </div>
      );

    default:
      return null;
  }
}
