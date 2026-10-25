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
  Check,
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

/**
 * 图4 风格的高端 Markdown 代码块卡片组件
 * 包含：语言标识徽标 (BASH / POWERSHELL)、语法关键字高亮、注释斜体、一键复制
 */
interface MarkdownCodeCardProps {
  lang?: string;
  code: string;
  copyKey: string;
  onCopyText?: (text: string, key: string) => void;
  copiedKey?: string;
}

export function MarkdownCodeCard({
  lang = 'BASH',
  code,
  copyKey,
  onCopyText,
  copiedKey
}: MarkdownCodeCardProps) {
  const isCopied = copiedKey === copyKey;

  const renderHighlightedLines = (rawCode: string) => {
    const lines = rawCode.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} style={{ height: '0.9em' }} />;
      }
      // 注释行：灰色斜体
      if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
        return (
          <div key={idx} className="cc-md-code-comment">
            {line}
          </div>
        );
      }

      // 对命令行的分词与高亮处理
      const tokens = line.split(/(\s+|"[^"]*"|'[^']*')/);
      return (
        <div key={idx} className="cc-md-code-line">
          {tokens.map((token, tIdx) => {
            if (/^(brew|git|npm|npx|node)$/.test(token)) {
              return <span key={tIdx} className="cc-md-code-cmd">{token}</span>;
            }
            if (/^(install|commit|push|tag|add|status|build|test|run|checkout|clone|publish)$/.test(token)) {
              return <span key={tIdx} className="cc-md-code-keyword">{token}</span>;
            }
            if (/^(--[a-zA-Z0-9_-]+|-[a-zA-Z0-9]+)$/.test(token)) {
              return <span key={tIdx} className="cc-md-code-option">{token}</span>;
            }
            if (token.startsWith('"') || token.startsWith("'")) {
              return <span key={tIdx} style={{ color: '#047857' }}>{token}</span>;
            }
            return <span key={tIdx}>{token}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="cc-md-code-card">
      <div className="cc-md-code-header">
        <span className="cc-md-code-lang">{lang}</span>
        {onCopyText && (
          <button
            type="button"
            className="cc-md-code-copy-btn"
            onClick={() => onCopyText(code, copyKey)}
            title="复制代码"
          >
            {isCopied ? (
              <>
                <Check size={12} style={{ color: '#10b981' }} />
                <span style={{ color: '#10b981', fontWeight: '600' }}>已复制</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>复制</span>
              </>
            )}
          </button>
        )}
      </div>
      <div className="cc-md-code-content">
        {renderHighlightedLines(code)}
      </div>
    </div>
  );
}

interface FlowNodeDef {
  id: string;
  label: string;
  subgraphId: string | null;
}

interface FlowSubgraphDef {
  id: string;
  title: string;
  direction: 'LR' | 'TD';
  nodeIds: string[];
}

interface FlowStyleDef {
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  color?: string;
}

interface FlowEdgeDef {
  from: string;
  to: string;
  label: string;
}

function parseMermaidFlowchartAST(rawChart: string) {
  const normalized = rawChart
    .replace(/\r\n/g, '\n')
    .replace(/\n\s*(-->)/g, ' $1');

  const lines = normalized
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  let rootDirection: 'LR' | 'TD' = 'TD';
  const nodes = new Map<string, FlowNodeDef>();
  const subgraphs = new Map<string, FlowSubgraphDef>();
  const styles = new Map<string, FlowStyleDef>();
  const edges: FlowEdgeDef[] = [];

  let currentSubgraph: FlowSubgraphDef | null = null;

  const registerNode = (rawToken: string): string[] => {
    const token = rawToken.trim();
    const m = token.match(/^([A-Za-z0-9_]+)\s*\["([\s\S]*)"\]$/);
    if (m) {
      const id = m[1];
      const label = m[2];
      if (!nodes.has(id)) {
        nodes.set(id, { id, label, subgraphId: currentSubgraph ? currentSubgraph.id : null });
        if (currentSubgraph && !currentSubgraph.nodeIds.includes(id)) {
          currentSubgraph.nodeIds.push(id);
        }
      } else {
        const existing = nodes.get(id)!;
        if (label && (!existing.label || existing.label === id)) {
          existing.label = label;
        }
      }
      return [id];
    }

    const parts = token
      .split('&')
      .map((p) => p.trim())
      .filter(Boolean);
    const ids: string[] = [];
    for (const p of parts) {
      const idMatch = p.match(/^([A-Za-z0-9_]+)$/);
      if (idMatch) {
        const id = idMatch[1];
        if (!subgraphs.has(id) && !nodes.has(id)) {
          nodes.set(id, { id, label: id, subgraphId: currentSubgraph ? currentSubgraph.id : null });
          if (currentSubgraph && !currentSubgraph.nodeIds.includes(id)) {
            currentSubgraph.nodeIds.push(id);
          }
        }
        ids.push(id);
      }
    }
    return ids;
  };

  for (const line of lines) {
    if (line.startsWith('flowchart ') || line.startsWith('graph ')) {
      const parts = line.split(/\s+/);
      rootDirection = parts[1] === 'LR' ? 'LR' : 'TD';
      continue;
    }
    if (line.startsWith('direction ')) {
      const dir = line.split(/\s+/)[1];
      if (currentSubgraph) {
        currentSubgraph.direction = dir === 'LR' ? 'LR' : 'TD';
      } else {
        rootDirection = dir === 'LR' ? 'LR' : 'TD';
      }
      continue;
    }
    if (line.startsWith('subgraph ')) {
      const m = line.match(/^subgraph\s+([A-Za-z0-9_]+)\s*(?:\["([^"]+)"\])?/);
      if (m) {
        const sg: FlowSubgraphDef = {
          id: m[1],
          title: m[2] || m[1],
          direction: 'TD',
          nodeIds: []
        };
        subgraphs.set(sg.id, sg);
        currentSubgraph = sg;
      }
      continue;
    }
    if (line === 'end') {
      currentSubgraph = null;
      continue;
    }
    if (line.startsWith('style ')) {
      const m = line.match(/^style\s+([A-Za-z0-9_]+)\s+(.+)$/);
      if (m) {
        const id = m[1];
        const propStr = m[2];
        const styleObj: FlowStyleDef = {};
        for (const pair of propStr.split(',')) {
          const [k, v] = pair.split(':').map((s) => (s ? s.trim() : ''));
          if (k === 'fill') styleObj.fill = v;
          if (k === 'stroke') styleObj.stroke = v;
          if (k === 'stroke-width') styleObj.strokeWidth = v;
          if (k === 'color') styleObj.color = v;
        }
        styles.set(id, styleObj);
      }
      continue;
    }

    if (line.includes('-->')) {
      const arrowRegex = /-->(?:\|([^|]*)\|)?/g;
      const segments: string[] = [];
      const arrowLabels: string[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = arrowRegex.exec(line)) !== null) {
        segments.push(line.slice(lastIndex, match.index));
        arrowLabels.push(match[1] ? match[1].trim() : '');
        lastIndex = arrowRegex.lastIndex;
      }
      segments.push(line.slice(lastIndex));

      const segNodeIds = segments.map((seg) => registerNode(seg));
      for (let i = 0; i < segNodeIds.length - 1; i++) {
        const fromIds = segNodeIds[i];
        const toIds = segNodeIds[i + 1];
        const label = arrowLabels[i];
        for (const f of fromIds) {
          for (const t of toIds) {
            edges.push({ from: f, to: t, label });
          }
        }
      }
    } else {
      registerNode(line);
    }
  }

  return { rootDirection, nodes, subgraphs, styles, edges };
}

function computeTopologicalLayers(
  itemIds: string[],
  edges: FlowEdgeDef[],
  ownerFn: (id: string) => string
) {
  const rank = new Map<string, number>();
  itemIds.forEach((id) => rank.set(id, 0));

  const validLinks: FlowEdgeDef[] = [];
  for (const e of edges) {
    const u = ownerFn(e.from);
    const v = ownerFn(e.to);
    if (u && v && u !== v && rank.has(u) && rank.has(v)) {
      validLinks.push({ from: u, to: v, label: e.label });
    }
  }

  for (let i = 0; i < itemIds.length; i++) {
    for (const link of validLinks) {
      const rU = rank.get(link.from) ?? 0;
      const rV = rank.get(link.to) ?? 0;
      if (rU + 1 > rV) {
        rank.set(link.to, rU + 1);
      }
    }
  }

  const maxRank = Math.max(0, ...Array.from(rank.values()));
  const layers: string[][] = [];
  for (let r = 0; r <= maxRank; r++) {
    const layer = itemIds.filter((id) => rank.get(id) === r);
    if (layer.length > 0) layers.push(layer);
  }
  return { layers, validLinks };
}

/**
 * 高级现代化 Mermaid 矢量流程图与架构图组件（内置同步矢量图形渲染引擎，0延迟、100%生成高清可视化流程图）
 */
export function MermaidDiagram({
  chart,
  title,
  subtitle
}: {
  chart: string;
  title?: string;
  subtitle?: string;
}) {
  const [showCode, setShowCode] = React.useState<boolean>(false);
  const [copied, setCopied] = React.useState<boolean>(false);

  const ast = React.useMemo(() => parseMermaidFlowchartAST(chart), [chart]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 渲染单个节点卡片
  const renderNodeCard = (nodeId: string, isCompact?: boolean) => {
    const node = ast.nodes.get(nodeId);
    if (!node) return null;
    const st = ast.styles.get(nodeId) || {};
    const fill = st.fill || '#ffffff';
    const stroke = st.stroke || '#cbd5e1';
    const textColor = st.color || '#1e293b';

    const rawLines = node.label
      .split(/<br\s*\/?>|\\n/i)
      .map((s) => s.trim())
      .filter(Boolean);

    let stepBadge: string | null = null;
    let headerHtml = rawLines[0] || node.id;
    let bodyLines = rawLines.slice(1);

    // 识别 STEP N 徽标行
    const plainFirst = headerHtml.replace(/<[^>]+>/g, '').trim();
    if (/^STEP\s*\d+$/i.test(plainFirst) && bodyLines.length > 0) {
      stepBadge = plainFirst.toUpperCase();
      headerHtml = bodyLines[0];
      bodyLines = bodyLines.slice(1);
    }

    return (
      <div
        key={nodeId}
        className={`cc-flow-node-card ${isCompact ? 'is-compact' : ''}`}
        style={{
          backgroundColor: fill,
          borderColor: stroke,
          borderTopColor: stroke,
          color: textColor
        }}
      >
        {stepBadge && (
          <div className="cc-flow-step-pill" style={{ backgroundColor: stroke, color: '#ffffff' }}>
            {stepBadge}
          </div>
        )}
        <div
          className="cc-flow-node-title"
          style={{ color: textColor }}
          dangerouslySetInnerHTML={{ __html: headerHtml }}
        />
        {bodyLines.length > 0 && (
          <div className="cc-flow-node-body">
            {bodyLines.map((line, lIdx) => {
              const isBullet = line.startsWith('•') || line.startsWith('·');
              const cleanText = isBullet ? line.replace(/^[•·]\s*/, '') : line;
              if (isBullet) {
                return (
                  <div key={lIdx} className="cc-flow-bullet-row">
                    <span className="cc-flow-bullet-dot" style={{ backgroundColor: stroke }} />
                    <span
                      className="cc-flow-bullet-text"
                      dangerouslySetInnerHTML={{ __html: cleanText }}
                    />
                  </div>
                );
              }
              return (
                <div
                  key={lIdx}
                  className="cc-flow-desc-row"
                  dangerouslySetInnerHTML={{ __html: cleanText }}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 渲染横向 SVG 矢量连接箭头 (LR)
  const renderHorizontalArrow = (label?: string, key?: string) => (
    <div key={key} className="cc-flow-lr-arrow">
      {label && <span className="cc-flow-edge-pill">{label}</span>}
      <svg viewBox="0 0 42 22" className="cc-flow-lr-svg" aria-hidden="true">
        <circle cx="4" cy="11" r="3" fill="#c85a32" />
        <line
          x1="7"
          y1="11"
          x2="31"
          y2="11"
          stroke="#c85a32"
          strokeWidth="2"
          strokeDasharray="3.5 2.5"
        />
        <polygon points="39,11 29,6 29,16" fill="#c85a32" />
      </svg>
    </div>
  );

  // 渲染纵向 SVG 矢量分支/汇聚连接线 (TD: 1->1, 1->2, 2->1, 1->3, 3->1)
  const renderVerticalConnector = (
    fromCount: number,
    toCount: number,
    label?: string,
    key?: string
  ) => {
    const getCenters = (count: number) => {
      if (count <= 1) return [300];
      return Array.from({ length: count }, (_, i) => Math.round((600 * (2 * i + 1)) / (2 * count)));
    };
    const fromX = getCenters(fromCount);
    const toX = getCenters(toCount);

    const paths: string[] = [];
    for (const x1 of fromX) {
      for (const x2 of toX) {
        if (x1 === x2) {
          paths.push(`M ${x1} 5 L ${x2} 31`);
        } else {
          paths.push(`M ${x1} 5 L ${x1} 19 L ${x2} 19 L ${x2} 31`);
        }
      }
    }

    return (
      <div key={key} className="cc-flow-td-connector">
        {label && <span className="cc-flow-edge-pill is-td">{label}</span>}
        <svg viewBox="0 0 600 38" className="cc-flow-td-svg" aria-hidden="true">
          {paths.map((d, idx) => (
            <path
              key={idx}
              d={d}
              fill="none"
              stroke="#c85a32"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {fromX.map((x1, idx) => (
            <circle key={`f-${idx}`} cx={x1} cy={5} r="3.5" fill="#c85a32" />
          ))}
          {toX.map((x2, idx) => (
            <polygon
              key={`t-${idx}`}
              points={`${x2},36 ${x2 - 5.5},28 ${x2 + 5.5},28`}
              fill="#c85a32"
            />
          ))}
        </svg>
      </div>
    );
  };

  // 渲染子图容器 (Subgraph)
  const renderSubgraphBox = (sgId: string) => {
    const sg = ast.subgraphs.get(sgId);
    if (!sg) return null;
    const st = ast.styles.get(sgId) || {};
    const fill = st.fill || '#f8fafc';
    const stroke = st.stroke || '#cbd5e1';

    const sgLayout = computeTopologicalLayers(sg.nodeIds, ast.edges, (x) => x);

    return (
      <div
        key={sgId}
        className="cc-flow-subgraph"
        style={{
          backgroundColor: fill,
          borderColor: stroke
        }}
      >
        <div className="cc-flow-subgraph-header" style={{ borderColor: stroke }}>
          <span className="cc-flow-subgraph-dot" style={{ backgroundColor: stroke }} />
          <span className="cc-flow-subgraph-title">{sg.title}</span>
        </div>

        {sg.direction === 'LR' && sgLayout.layers.length > 1 ? (
          <div className="cc-flow-lr-pipeline">
            {sgLayout.layers.map((layer, lIdx) => {
              const nextLayer = sgLayout.layers[lIdx + 1];
              const link = nextLayer
                ? sgLayout.validLinks.find(
                    (l) => layer.includes(l.from) && nextLayer.includes(l.to) && l.label
                  )
                : undefined;
              return (
                <React.Fragment key={lIdx}>
                  <div className="cc-flow-lr-step">
                    {layer.map((nId) => renderNodeCard(nId, sgLayout.layers.length >= 3))}
                  </div>
                  {nextLayer && renderHorizontalArrow(link?.label, `sg-arr-${lIdx}`)}
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="cc-flow-td-stack">
            {sgLayout.layers.map((layer, lIdx) => {
              const nextLayer = sgLayout.layers[lIdx + 1];
              const link = nextLayer
                ? sgLayout.validLinks.find(
                    (l) => layer.includes(l.from) && nextLayer.includes(l.to) && l.label
                  )
                : undefined;
              return (
                <React.Fragment key={lIdx}>
                  <div
                    className="cc-flow-td-grid"
                    style={{
                      gridTemplateColumns: `repeat(${layer.length}, minmax(0, 1fr))`
                    }}
                  >
                    {layer.map((nId) => renderNodeCard(nId, layer.length >= 3))}
                  </div>
                  {nextLayer &&
                    renderVerticalConnector(
                      layer.length,
                      nextLayer.length,
                      link?.label,
                      `sg-vc-${lIdx}`
                    )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 计算顶层布局
  const topItemIds: string[] = [];
  for (const sgId of ast.subgraphs.keys()) topItemIds.push(sgId);
  for (const [nId, nObj] of ast.nodes.entries()) {
    if (!nObj.subgraphId) topItemIds.push(nId);
  }

  const ownerFn = (id: string) => {
    if (ast.subgraphs.has(id)) return id;
    const n = ast.nodes.get(id);
    return n && n.subgraphId ? n.subgraphId : id;
  };

  const topLayout = computeTopologicalLayers(topItemIds, ast.edges, ownerFn);
  const isPureHorizontal = ast.rootDirection === 'LR' && ast.subgraphs.size === 0;

  // 计算顶层某层的输入/输出视觉端口数
  const getLayerVisualPorts = (layerIds: string[], isOutput: boolean): number => {
    if (layerIds.length > 1) return layerIds.length;
    const singleId = layerIds[0];
    if (ast.subgraphs.has(singleId)) {
      const sg = ast.subgraphs.get(singleId)!;
      if (sg.direction === 'TD') {
        const sgLayout = computeTopologicalLayers(sg.nodeIds, ast.edges, (x) => x);
        if (sgLayout.layers.length > 0) {
          const targetLayer = isOutput
            ? sgLayout.layers[sgLayout.layers.length - 1]
            : sgLayout.layers[0];
          return targetLayer.length;
        }
      }
    }
    return 1;
  };

  return (
    <div className="cc-mermaid-card">
      <div className="cc-mermaid-header">
        <div>
          {title && <div className="cc-mermaid-title">{title}</div>}
          {subtitle && <div className="cc-mermaid-sub">{subtitle}</div>}
        </div>
        <button
          type="button"
          className="cc-mermaid-toggle-btn"
          onClick={() => setShowCode(!showCode)}
          title="查看/复制 Mermaid 源码"
        >
          <FileCode size={13} />
          <span>{showCode ? '收起源码' : 'Mermaid 源码'}</span>
        </button>
      </div>

      {showCode && (
        <div className="cc-mermaid-code-drawer">
          <div className="cc-mermaid-code-bar">
            <span>MERMAID FLOWCHART CODE</span>
            <button type="button" className="cc-md-code-copy-btn" onClick={handleCopy}>
              {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              <span>{copied ? '已复制' : '复制代码'}</span>
            </button>
          </div>
          <pre>
            <code>{chart.trim()}</code>
          </pre>
        </div>
      )}

      <div className="cc-mermaid-canvas">
        {isPureHorizontal ? (
          <div className="cc-flow-lr-master">
            <div className="cc-flow-lr-pipeline is-five-step">
              {topLayout.layers.map((layer, lIdx) => {
                const nextLayer = topLayout.layers[lIdx + 1];
                const link = nextLayer
                  ? topLayout.validLinks.find(
                      (l) => layer.includes(l.from) && nextLayer.includes(l.to) && l.label
                    )
                  : undefined;
                return (
                  <React.Fragment key={lIdx}>
                    <div className="cc-flow-lr-step">
                      {layer.map((id) => renderNodeCard(id, true))}
                    </div>
                    {nextLayer && renderHorizontalArrow(link?.label, `top-lr-${lIdx}`)}
                  </React.Fragment>
                );
              })}
            </div>
            <div className="cc-flow-loop-footer">
              <span>🔄 端到端数据安全与产值守恒闭环：安全建库 ➔ 人员与合同锚定 ➔ 防透支排期 ➔ 月底100%核验发布 ➔ 跨项目穿透汇总</span>
            </div>
          </div>
        ) : (
          <div className="cc-flow-td-stack is-root">
            {topLayout.layers.map((layer, lIdx) => {
              const nextLayer = topLayout.layers[lIdx + 1];
              const link = nextLayer
                ? topLayout.validLinks.find(
                    (l) => layer.includes(l.from) && nextLayer.includes(l.to) && l.label
                  )
                : undefined;
              const isSingleStandaloneNode =
                layer.length === 1 &&
                !ast.subgraphs.has(layer[0]) &&
                ast.subgraphs.size === 0;

              return (
                <React.Fragment key={lIdx}>
                  <div
                    className={`cc-flow-td-grid ${isSingleStandaloneNode ? 'is-centered-node' : ''}`}
                    style={{
                      gridTemplateColumns: `repeat(${layer.length}, minmax(0, 1fr))`
                    }}
                  >
                    {layer.map((id) =>
                      ast.subgraphs.has(id) ? renderSubgraphBox(id) : renderNodeCard(id)
                    )}
                  </div>
                  {nextLayer &&
                    renderVerticalConnector(
                      getLayerVisualPorts(layer, true),
                      getLayerVisualPorts(nextLayer, false),
                      link?.label,
                      `top-vc-${lIdx}`
                    )}
                </React.Fragment>
              );
            })}
          </div>
        )}
        {(title?.includes('五步') || title?.includes('总览') || subtitle?.includes('端到端') || subtitle?.includes('闭环')) && (
          <div className="cc-flow-loop-footer">
            <span>🔄 端到端数据安全与产值守恒闭环：安全建库 ➔ 人员与合同锚定 ➔ 防透支排期 ➔ 月底100%核验发布 ➔ 跨项目穿透汇总</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Markdown ASCII 流程与架构图卡片组件
 */
export function MarkdownDiagram({ diagram, title }: { diagram: string; title?: string }) {
  return (
    <div className="cc-md-diagram-card">
      {title && (
        <div style={{ color: 'var(--cc-text-muted)', fontSize: '11px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </div>
      )}
      <pre style={{ margin: 0, fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit' }}>
        <code>{diagram}</code>
      </pre>
    </div>
  );
}

/**
 * 形象直观的【双锚定工程产值量化模型】可视化图表组件（支持 Mermaid 架构查看）
 */
export function DualAnchorVisualModel({ isEn }: { isEn?: boolean }) {
  const [showMermaid, setShowMermaid] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const mermaidCode = `flowchart LR
    A["🛡️ 工程合同基石\\n<b>项目工作令合同总额</b>\\n1 绩点 ≡ 1 万元"] -->|✖ 乘以| B["⏳ 全周期防透支\\n<b>当月排期释放比例</b>\\n前低后高交付锚定"]
    B -->|✖ 乘以| C["👥 个人实干贡献\\n<b>员工当月分配占比</b>\\n团队闭环 100%"]
    C -->|⬇ 闭环精算| D["🎯 <b>员工当月实得绩点</b>\\nBigInt 最大余数补差 · 行列双向闭环"]
    
    style A fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412
    style B fill:#fefce8,stroke:#ca8a04,stroke-width:2px,color:#854d0e
    style C fill:#f0fdf4,stroke:#16a34a,stroke-width:2px,color:#166534
    style D fill:#f8fafc,stroke:#0284c7,stroke-width:2px,color:#0f172a`;

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cc-da-visual-container">
      {/* 顶部主横幅 */}
      <div className="cc-da-banner">
        <div className="cc-da-banner-left">
          <Sparkles size={16} className="cc-da-spark" />
          <span className="cc-da-banner-title">
            {isEn ? 'Dual-Anchor Merit Output Quantification Architecture' : '衡绩核心：双锚定工程产值量化模型'}
          </span>
        </div>
        <div className="cc-da-banner-sub">
          {isEn ? 'Contract Ceiling · Delivery Phased · 100% Closed Loop' : '工程合同硬顶 · 阶段交付防透支 · 团队贡献 100% 闭环'}
        </div>
      </div>

      {/* 三大基石连乘流程 */}
      <div className="cc-da-pipeline">
        {/* 卡片 1：工程合同基石 */}
        <div className="cc-da-card pillar-contract">
          <div className="cc-da-tag terracotta">
            <Lock size={12} />
            <span>{isEn ? 'Contract Cap' : '工程合同基石'}</span>
          </div>
          <h4 className="cc-da-card-title">{isEn ? 'Project Contract Value' : '项目工作令合同总额'}</h4>
          <div className="cc-da-rule-badge terracotta">
            {isEn ? '1 Merit Point ≡ ¥10,000' : '1 绩点 ≡ 1 万元产值'}
          </div>
          <p className="cc-da-card-desc">
            {isEn ? 'Hard legal cap locked to contract value, preventing arbitrary budget inflation.' : '法务合同刚性锁定，杜绝虚列预算与凭空造假'}
          </p>
        </div>

        {/* 乘号运算连接符 1 */}
        <div className="cc-da-connector">
          <div className="cc-da-arrow-line"></div>
          <div className="cc-da-op-badge" title={isEn ? 'Multiply' : '连乘计算'}>
            <span className="cc-da-op-symbol">✖</span>
            <span className="cc-da-op-label">{isEn ? 'Multiply' : '乘以'}</span>
          </div>
          <div className="cc-da-arrow-line"></div>
        </div>

        {/* 卡片 2：全周期防透支 */}
        <div className="cc-da-card pillar-schedule">
          <div className="cc-da-tag amber">
            <CalendarRange size={12} />
            <span>{isEn ? 'Phased Release' : '全周期防透支'}</span>
          </div>
          <h4 className="cc-da-card-title">{isEn ? 'Monthly Release Ratio' : '当月排期释放比例'}</h4>
          <div className="cc-da-rule-badge amber">
            {isEn ? 'Delivery-Anchored Milestones' : '前低后高动态排期'}
          </div>
          <p className="cc-da-card-desc">
            {isEn ? 'Inception capped at 5%, primary delivery 45%+, mandatory 5% warranty holdback.' : '前期争取限高5% · 发货锁定45%+ · 维保留5%'}
          </p>
        </div>

        {/* 乘号运算连接符 2 */}
        <div className="cc-da-connector">
          <div className="cc-da-arrow-line"></div>
          <div className="cc-da-op-badge" title={isEn ? 'Multiply' : '连乘计算'}>
            <span className="cc-da-op-symbol">✖</span>
            <span className="cc-da-op-label">{isEn ? 'Multiply' : '乘以'}</span>
          </div>
          <div className="cc-da-arrow-line"></div>
        </div>

        {/* 卡片 3：个人实干贡献 */}
        <div className="cc-da-card pillar-member">
          <div className="cc-da-tag emerald">
            <Users size={12} />
            <span>{isEn ? 'Team Allocation' : '个人实干贡献'}</span>
          </div>
          <h4 className="cc-da-card-title">{isEn ? 'Member Allocation Share' : '员工当月分配占比'}</h4>
          <div className="cc-da-rule-badge emerald">
            {isEn ? 'Team Sum = Strict 100%' : '团队分配闭环 100%'}
          </div>
          <p className="cc-da-card-desc">
            {isEn ? 'Allocated by leader to team members based on actual deliverables, sum equals 100%.' : '项目组员按当月成果实绩分配，总和严密闭环'}
          </p>
        </div>
      </div>

      {/* 向下归集连线 */}
      <div className="cc-da-flow-down">
        <div className="cc-da-down-line"></div>
        <div className="cc-da-down-badge">
          <span>{isEn ? '⬇ Precise Rollup Calculation' : '⬇ 连乘精算与最大余数闭环'}</span>
        </div>
        <div className="cc-da-down-line"></div>
      </div>

      {/* 产出结果卡片 */}
      <div className="cc-da-result-card">
        <div className="cc-da-result-header">
          <div className="cc-da-result-title-box">
            <div className="cc-da-result-pill">{isEn ? 'CALCULATED OUTPUT' : '最终核算成果'}</div>
            <h3 className="cc-da-result-title">{isEn ? 'Personal Monthly Awarded Merit' : '员工当月实得量化绩点'}</h3>
          </div>
          <div className="cc-da-tech-tags">
            <span className="cc-da-tech-tag">⚡ BigInt 整数分精算</span>
            <span className="cc-da-tech-tag">⚖️ 最大余数法补差</span>
            <span className="cc-da-tech-tag">🔒 行列双向 100% 闭环</span>
          </div>
        </div>

        <div className="cc-da-formula-box">
          <div className="cc-da-formula-label">{isEn ? 'Core Formula' : '核心量化公式'}</div>
          <div className="cc-da-formula-content">
            <code>实得绩点 (万元) = 项目工作令合同额 × 当月排期释放比例 × 员工当月分配占比</code>
          </div>
        </div>

        <div className="cc-da-example-box">
          <div className="cc-da-example-badge">{isEn ? 'EXAMPLE' : '直观算例'}</div>
          <div className="cc-da-example-text">
            {isEn
              ? 'e.g. ¥10,000,000 Contract × 10% Delivery Release (¥1,000,000) × 25% Member Share = 25.00 Merit Points (¥250,000 Output Value).'
              : '例如：1000 万元工程合同，当月完成阶段交付释放 10%（100 万元额度），骨干员工贡献占比 25% ➔ 1000 万 × 10% × 25% = 25.00 绩点（实得 25 万元考核产值）。'}
          </div>
        </div>
      </div>

      {/* Mermaid 切换展示面板 */}
      <div className="cc-da-mermaid-footer">
        <button
          type="button"
          className="cc-da-mermaid-toggle"
          onClick={() => setShowMermaid(!showMermaid)}
        >
          <FileCode size={13} />
          <span>{showMermaid ? (isEn ? 'Hide Mermaid Source Code' : '收起 Mermaid 架构源码') : (isEn ? 'View Mermaid Architecture Source' : '查看 / 复制 Mermaid 架构源码')}</span>
        </button>

        {showMermaid && (
          <div className="cc-da-mermaid-code-box">
            <div className="cc-da-mermaid-code-bar">
              <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--cc-text-muted)' }}>MERMAID.JS</span>
              <button
                type="button"
                className="cc-md-code-copy-btn"
                onClick={handleCopyMermaid}
              >
                {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copied ? (isEn ? 'Copied!' : '已复制') : (isEn ? 'Copy' : '复制')}</span>
              </button>
            </div>
            <pre style={{ margin: 0, fontSize: '12px', lineHeight: '1.5', overflowX: 'auto', color: 'var(--cc-text)' }}>
              <code>{mermaidCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export const DOC_BOOKS: DocBook[] = [
  {
    id: 'intro',
    icon: '🚀',
    titleZh: '衡绩软件介绍',
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
    titleZh: '衡绩软件新手操作手册',
    titleEn: 'Step-by-Step Practical User Manual',
    chapters: [
      {
        id: 'manual-admin',
        number: '2.1',
        titleZh: '综合管理员新手实操指南（5步上手）',
        titleEn: 'General Admin 5-Step Rapid Guide',
        sections: [
          { id: 'sec-admin-overview', titleZh: '业务闭环总览与五步流程图', titleEn: 'Business Loop Overview & Diagram', level: 1 },
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
    titleZh: '远程推送与发布部署教程',
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
  },
  {
    id: 'tutorial',
    icon: '🎨',
    titleZh: '衡绩设计教程',
    titleEn: 'HengJi Design & Implementation Tutorial',
    chapters: [
      {
        id: 'tutorial-concept',
        number: '4.1',
        titleZh: '痛点拆解与商业架构（为什么做衡绩？）',
        titleEn: 'Pain Points & Architectural Blueprint',
        sections: [
          { id: 'sec-tut-dilemma', titleZh: '十位大厨与五桌大席的考核困局（通俗类比）', titleEn: 'The Banquet Split Dilemma', level: 1 },
          { id: 'sec-tut-solutions', titleZh: '衡绩三大工程解法与架构流程图', titleEn: 'Three Engineering Solutions & Diagram', level: 1 }
        ]
      },
      {
        id: 'tutorial-algo',
        number: '4.2',
        titleZh: '核心精算算法与安全基石（大数与离线加密）',
        titleEn: 'Algorithms & Cryptographic Security',
        sections: [
          { id: 'sec-tut-bigint', titleZh: 'BigInt 整数分位与最大余数补差法精解', titleEn: 'BigInt & Largest Remainder Method', level: 1 },
          { id: 'sec-tut-crypto', titleZh: 'PBKDF2 与 AES-256-GCM 军工级离线加密防线', titleEn: 'Offline Cryptographic Architecture', level: 1 }
        ]
      },
      {
        id: 'tutorial-desktop',
        number: '4.3',
        titleZh: '桌面端软件系统设计与实现（双工作区落地）',
        titleEn: 'Desktop System & Dual Workspaces',
        sections: [
          { id: 'sec-tut-zerodb', titleZh: '极简无数据库（Zero-DB）状态机架构设计', titleEn: 'Zero-DB Architecture & State Machine', level: 1 },
          { id: 'sec-tut-dualmode', titleZh: '综合管理与专职核算双工作区物理分离哲学', titleEn: 'Dual Workspace Physical Isolation', level: 1 },
          { id: 'sec-tut-matrix', titleZh: '月度分配全项目一屏透视大表交互实现', titleEn: 'One-Screen Matrix Interaction Design', level: 2 }
        ]
      },
      {
        id: 'tutorial-website',
        number: '4.4',
        titleZh: '官方网站与视觉体验设计（羊皮纸美学）',
        titleEn: 'Official Website & Parchment Aesthetic',
        sections: [
          { id: 'sec-tut-parchment', titleZh: '羊皮纸暖金与工业陶土红品牌色彩哲学', titleEn: 'Parchment & Industrial Terracotta Color System', level: 1 },
          { id: 'sec-tut-funnel', titleZh: '官网五层心流转化漏斗与在线体验区实现', titleEn: 'Five-Layer Conversion Funnel & Live Demo', level: 1 }
        ]
      },
      {
        id: 'tutorial-release',
        number: '4.5',
        titleZh: '工程编译打包与自动化持续发布全景',
        titleEn: 'Packaging & Automated CI/CD Pipeline',
        sections: [
          { id: 'sec-tut-packages', titleZh: '四大官方桌面安装包（MSI/EXE/Portable/ZIP）选型', titleEn: 'Four Distribution Formats Explained', level: 1 },
          { id: 'sec-tut-cicd', titleZh: 'GitHub Releases 与 Pages 自动化流水线脚本', titleEn: 'Automated Build & Deployment Pipeline', level: 1 }
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
  switch (chapterId) {
    // ==========================================
    // 文章 1：衡绩软件深度介绍
    // ==========================================
    case 'intro-system':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? 'System Positioning & Design Philosophy' : '系统定位与设计初衷'}</h1>
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

            <DualAnchorVisualModel isEn={isEn} />

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
            <div className="cc-md-quote">
              <strong style={{ color: 'var(--cc-terracotta)', display: 'block', marginBottom: '6px' }}>
                🛡️ {isEn ? 'Core Design Axiom: Transparency, Reproducibility, Zero Cloud Reliance' : '核心设计铁律：规则透明、计算可复现、绝不上云'}
              </strong>
              {isEn
                ? 'All calculation parameters, contract totals, and monthly release ratios are recorded with cryptographic timestamps. Any stakeholder or auditor can recalculate the exact merit matrix down to the cent, eliminating subjective ambiguity.'
                : '衡绩坚信：考核的权威来源于算法的不可争议性。系统所有的合同基数、分配比例、发布时间戳均具备严密审计链。任何经授权的领导或审计人员，输入相同的初始数据与规则，均可 100% 重现计算结果，杜绝人情分、印象分，以客观工程产值服人。'}
            </div>
          </section>
        </div>
      );

    case 'intro-features':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? 'Six Core Functional Pillars' : '六大核心功能深度解析'}</h1>
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
            <h1>{isEn ? 'Technical Architecture & Cryptographic Security' : '技术架构与数据安全机制'}</h1>
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
            <h1>{isEn ? 'Supported Environments & Package Formats' : '支持的应用与分发格式'}</h1>
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
    // 文章 2：衡绩软件新手操作手册（管理员 + 核算员图文并茂）
    // ==========================================
    case 'manual-admin':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? 'General Admin 5-Step Practical Guide' : '综合管理员新手实操指南（5步上手）'}</h1>
            <span className="cc-cl-date">{isEn ? 'Role: Department Head & Project Manager' : '适用角色：部门负责人 / 综合管理员 / 项目经理'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'This guide provides comprehensive, step-by-step instructions for General Administrators. Learn how to initialize your encrypted workspace, import rosters and contracts, schedule phased overdraft-proof quotas, execute monthly evaluations, and export audit packages.'
              : '本操作手册专为综合管理员与项目负责人编写。系统采用端到端的数据量化流转架构，手把手教您在 10 分钟内完成安全建库、花名册与合同录入、防透支排期规划、月底集中分配发布以及数据包交接全套流程。'}
          </p>

          <hr className="cc-cl-divider" />

          {/* 业务总览流程图 */}
          <section id="sec-admin-overview" className="cc-cl-sec">
            <h2>{isEn ? 'Business Loop Overview & Diagram' : '🧭 五步核心业务闭环总览流程图'}</h2>
            <MermaidDiagram
              title={isEn ? '5-Step Closed-Loop Business Workflow' : '🧭 衡绩系统 5 步核心业务闭环总览流程图'}
              subtitle={isEn ? 'End-to-End Workflow: Workspace ➔ Subjects ➔ Scheduling ➔ Matrix ➔ Rollup & Stars' : '端到端业务流：建库 ➔ 初始化 ➔ 排期 ➔ 月底考评 ➔ 归集与荣誉'}
              chart={`flowchart TD
    subgraph Stage1["阶段一：业务准备与初始化定盘（建库 · 录入 · 防透支排期）"]
        direction LR
        S1["<b>STEP 1</b><br/>🏢 <b>新建安全工作区</b><br/>• .hengji 离线文件存储<br/>• AES-256 口令强认证加密"] -->|第一步完成| S2["<b>STEP 2</b><br/>👥 <b>初始化业务主体</b><br/>• 导入部门员工花名册与专业组<br/>• 导入工程合同与项目工作令"]
        S2 -->|第二步完成| S3["<b>STEP 3</b><br/>📊 <b>顶层防透支排期</b><br/>• 全周期 100% 额度硬顶锁定<br/>• 前低后高稳健交付锚定"]
    end

    subgraph Stage2["阶段二：月度考评执行与成果闭环（集中分配 · 发布 · 财务报表）"]
        direction LR
        S4["<b>STEP 4</b><br/>⚡ <b>月底考评与发布</b><br/>• 全项目透视集中大表一屏平铺<br/>• 团队比例 100% 闭环核验<br/>• 🚀 一键批量数字签名防篡改发布"] -->|第四步完成| S5["<b>STEP 5</b><br/>🏆 <b>财务报表与荣誉殿堂</b><br/>• 横向个人 · 纵向项目双向对齐<br/>• BigInt 分毫不差最大余数补差<br/>• 自动评选月度/季度/年度绩星榜"]
    end

    Stage1 -->|第三步就绪 ➔ 开启月底分配窗口| Stage2

    style Stage1 fill:#fafaf9,stroke:#d6d3d1,stroke-width:1.5px
    style Stage2 fill:#f0fdf4,stroke:#bbf7d0,stroke-width:1.5px
    style S1 fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412
    style S2 fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e40af
    style S3 fill:#fefce8,stroke:#ca8a04,stroke-width:2px,color:#854d0e
    style S4 fill:#fdf4ff,stroke:#a855f7,stroke-width:2px,color:#7e22ce
    style S5 fill:#f0fdf4,stroke:#16a34a,stroke-width:2px,color:#166534`}
            />
          </section>

          {/* 步骤 1 */}
          <section id="sec-admin-step1" className="cc-cl-sec">
            <div className="cc-doc-step-card">
              <div className="cc-doc-step-header">
                <span className="cc-doc-step-tag">STEP 1</span>
                <strong style={{ fontSize: '16px' }}>{isEn ? 'Create Secure Encrypted Workspace' : '第一步：新建安全工作区（数据安全与存储根基）'}</strong>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
                {isEn
                  ? 'Launch the HengJi client, select [General Admin Workspace], choose a safe storage path (recommended on non-system drives such as D:\\ or E:\\), and define a strong master encryption password.'
                  : '衡绩系统采用完全离线优先架构，零网络依赖。系统不会把业务数据隐蔽放到 C 盘用户目录，所有部门员工、工程项目、月度分配与绩点流水均保存在用户自主指定的 `.hengji` 工作区文件中，从物理层面杜绝保密数据泄露。'}
              </p>

              <MermaidDiagram
                title={isEn ? 'Workspace Initialization Architecture' : '第一步：工作区建立机制架构图'}
                subtitle={isEn ? 'Dual-Workspace Architecture · Non-System Drive Security · PBKDF2/AES-256' : '非系统盘物理隔离 · 综合管理与绩效核算双模式 · PBKDF2/AES-256 口令加密'}
                chart={`flowchart TD
    Start["🚀 双击运行「衡绩」客户端"] --> Create["➕ 点击【新建工作区】"]
    Create --> Disk["💾 选择非系统盘安全存储<br/><i>(推荐 D:/E:/科研保密盘，绝不落盘 C 盘)</i>"]
    
    Disk --> Mode1["🏢 <b>综合管理工作区</b> (首选推荐)<br/>• 面向部门长与项目负责人<br/>• 管理员工名册、工程合同与月度排期分配"]
    Disk --> Mode2["📊 <b>绩效核算工作区</b><br/>• 面向专职核算员与财务审计<br/>• 批量导入项目数据包，全员跨项目自动归集"]
    
    Mode1 --> Pwd["🔐 设置高强口令 (PBKDF2 + AES-256-GCM 认证加密)<br/><i>(个人专属电脑亦可留空免密极速启动)</i>"]
    Mode2 --> Pwd
    
    Pwd --> File["✅ 生成 <b>.hengji</b> 独立离线加密数据库<br/><i>(每次修改保存自动在同目录生成 .backup 镜像灾备)</i>"]

    style Start fill:#f8fafc,stroke:#64748b,stroke-width:1.5px
    style Create fill:#f8fafc,stroke:#64748b,stroke-width:1.5px
    style Disk fill:#f0fdf4,stroke:#16a34a,stroke-width:2px,color:#166534
    style Mode1 fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412
    style Mode2 fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e40af
    style Pwd fill:#fefce8,stroke:#ca8a04,stroke-width:2px,color:#854d0e
    style File fill:#ecfdf5,stroke:#059669,stroke-width:2px,color:#065f46`}
              />

              <div className="cc-md-quote">
                <b>💡 {isEn ? 'Operation Guide' : '具体操作指引'}</b>：
                <ol style={{ paddingLeft: '18px', margin: '6px 0 0', lineHeight: '1.6' }}>
                  <li><b>选择工作区</b>：在欢迎界面点击【🏢 综合管理工作区（首选推荐）】。</li>
                  <li><b>指定存储位置（强烈推荐非系统盘）</b>：请务必选择非系统盘（如 D 盘或 E 盘），文件后缀为 `.hengji`。</li>
                  <li><b>设置管理员口令</b>：输入主密码，系统采用 `PBKDF2-SHA256`（100,000次加盐迭代）结合 `AES-256-GCM` 加密；在个人专用电脑上亦可留空免密。</li>
                  <li><b>自动备份双重兜底</b>：每次保存前，系统会在同目录自动生成 `.hengji.backup` 实时镜像，确保安全无忧。</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 步骤 2 */}
          <section id="sec-admin-step2" className="cc-cl-sec">
            <div className="cc-doc-step-card">
              <div className="cc-doc-step-header">
                <span className="cc-doc-step-tag">STEP 2</span>
                <strong style={{ fontSize: '16px' }}>{isEn ? 'Import Team Roster & Engineering Contracts' : '第二步：导入部门员工花名册与工程合同（初始化主体）'}</strong>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
                {isEn
                  ? 'Navigate to [Team Roster] and [Project Lifecycle]. You can batch import members via Excel/CSV or add them manually. The smart parser automatically strips thousand separators (e.g. 1,500,000.00) and maps members to General, Product, or R&D groups.'
                  : '建立考核所需的“人”（员工档案与专业组归属）与“事”（工程合同项目与工作令号）两大基石数据。'}
              </p>

              <MermaidDiagram
                title={isEn ? 'Subject Initialization Architecture' : '第二步：业务主体（人与事）双基石初始化流程'}
                subtitle={isEn ? 'Personnel Matrix Binding · Financial Auto-Cleaning · Employee ID & Contract Order Anchoring' : '员工专业组绑定 · 合同金额财务自适应清洗 · 唯一工号与工作令号锚定'}
                chart={`flowchart TD
    subgraph S1["👥 员工人员库初始化 (人)"]
        direction TB
        M1["📥 批量导入员工 CSV 表"]
        M2["⚡ 一键套用内置演示编制"]
        M3["➕ 手动单个添加员工档案"]
        M1 --> MG["🎯 专业组自动归类绑定<br/>• 总体组 (系统方案 / 总体协调)<br/>• 产品组 (硬件结构 / 产品定义)<br/>• 研发组 (算法 / 嵌入式 / 软件)"]
        M2 --> MG
        M3 --> MG
    end

    subgraph S2["📁 工程项目库初始化 (事)"]
        direction TB
        P1["📥 批量导入项目合同 CSV 表"]
        P2["➕ 手动新建单项工程合同"]
        P1 --> PC["🧹 财务格式自适应高容错清洗引擎<br/>• 自动剥离千分位逗号 (如 1,500,000.00)<br/>• 自动清除货币符号 (¥、$、元、万元)<br/>• 超长浮点小数四舍五入精确到分<br/>• 同一工作令号多子合同独立核算"]
        P2 --> PC
    end

    MG & PC --> Ready["🚀 <b>“人”与“事”双基石就绪</b><br/>以唯一员工工号与工程工作令号精准绑定"]

    style S1 fill:#fff7ed,stroke:#ea580c,stroke-width:1.5px
    style S2 fill:#eff6ff,stroke:#2563eb,stroke-width:1.5px
    style MG fill:#ffffff,stroke:#ea580c,stroke-width:1.5px
    style PC fill:#ffffff,stroke:#2563eb,stroke-width:1.5px
    style Ready fill:#f0fdf4,stroke:#16a34a,stroke-width:2px,color:#166534`}
              />

              <div className="cc-md-quote">
                <b>💡 {isEn ? 'Smart Features' : '特色高容错能力'}</b>：
                系统全面兼容财务部门导出的 Excel / CSV 台账。即使金额带有千分位逗号（如 `1,500,000.00`）或货币符号（¥、元），系统均能毫秒级清洗为标准数值，并按唯一工号实现全局唯一绑定。
              </div>
            </div>
          </section>

          {/* 步骤 3 */}
          <section id="sec-admin-step3" className="cc-cl-sec">
            <div className="cc-doc-step-card">
              <div className="cc-doc-step-header">
                <span className="cc-doc-step-tag">STEP 3</span>
                <strong style={{ fontSize: '16px' }}>{isEn ? 'Phased Anti-Overdraft Quota Scheduling' : '第三步：项目全周期额度防透支排期规划'}</strong>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
                {isEn
                  ? 'Open [Monthly Allocation] or [Project Lifecycle], click on the project schedule button, and apply the "Robust Phased Delivery" template. The system verifies that the sum of all monthly quota percentages strictly equals 100%.'
                  : '针对长周期工程项目，最忌讳“项目刚立项就把绩效分光，后期进入成品发货与试验终验时有活无钱可分”。衡绩内置“稳健交付型（前低后高）”排期机制：'}
              </p>

              <MermaidDiagram
                title={isEn ? 'Three-Phase Anti-Overdraft Model' : '第三步：三段式前低后高防透支配比法则'}
                subtitle={isEn ? 'Phased Quota Lifecycle: Inception Cap ➔ Delivery Peak ➔ Warranty Retention' : '全周期额度生命周期：首月限高5% ➔ 交付月锁定45%+ ➔ 末月保底5%'}
                chart={`flowchart LR
    subgraph Whole["🎯 工程项目全周期 100% 额度硬顶锁定 (1 绩点 ≡ 1 万元合同产值)"]
        direction LR
        P1["<b>Phase 1: 前期立项与论证</b><br/>• 额度限高：<b>0% ~ 10%</b> (默认 5%)<br/>• <b>刚性红线约束</b><br/>• 彻底防止项目立项即瓜分透支"] -->|前低递进| P2["<b>Phase 2: 主体研制与交付</b><br/>• 额度递增：锁定 <b>45%+ 核心大头</b><br/>• <b>交付成果强锚定</b><br/>• 重金激励出厂试验与发货攻坚"]
        P2 -->|保底闭环| P3["<b>Phase 3: 现场维保与验收</b><br/>• 额度保留：刚性锁定 <b>5%</b><br/>• <b>售后履约保障</b><br/>• 杜绝发货后人员撂挑子不管售后"]
    end

    Whole --> Verify["⚖️ <b>全周期闭环校验</b>：所有月份额度百分比之和严格必须 ＝ 100.00%"]

    style Whole fill:#fafaf9,stroke:#78716c,stroke-width:1.5px
    style P1 fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#9a3412
    style P2 fill:#f0fdf4,stroke:#16a34a,stroke-width:2px,color:#166534
    style P3 fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e40af
    style Verify fill:#fefce8,stroke:#ca8a04,stroke-width:2px,color:#854d0e`}
              />

              <div className="cc-md-quote">
                <b>🛡️ {isEn ? 'Three Phases' : '三段式配比细则'}</b>：
                <ul style={{ paddingLeft: '18px', margin: '4px 0 0', lineHeight: '1.6' }}>
                  <li><b>前期争取阶段（首月 0% ~ 10% 可调，默认 5%）</b>：设立硬性封顶，防止项目未落地就提前消耗预算。</li>
                  <li><b>主体研制与交付阶段（前低后高，交付月集中释放 45%+ 大头）</b>：重头激励锁定在成品交付与试验终验。</li>
                  <li><b>售后维保阶段（末月固定保留 5%）</b>：在项目周期最后一个月刚性锁定 5% 额度，保障售后服务持续性。</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 步骤 4 */}
          <section id="sec-admin-step4" className="cc-cl-sec">
            <div className="cc-doc-step-card">
              <div className="cc-doc-step-header">
                <span className="cc-doc-step-tag">STEP 4</span>
                <strong style={{ fontSize: '16px' }}>{isEn ? 'Monthly Allocation & Batch Release' : '第四步：月底集中分配与批量发布'}</strong>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
                {isEn
                  ? 'At the end of each month, administrators enter the [Monthly Allocation] unified matrix. Review all projects, add team members, adjust share percentages (which must sum up to exactly 100%), and click [Batch Release] to lock the month.'
                  : '每到月底考评窗口期，综合管理员进入【月度绩效分配】全景透视大表：'}
              </p>

              <MermaidDiagram
                title={isEn ? 'Monthly Matrix Execution Workflow' : '第四步：月度分配全项目当月集中大表操作机制'}
                subtitle={isEn ? 'Apply Phased Plan · One-Screen Matrix · 100% Exact Verification · Batch Tamper-Proof Release' : '套用当月规划 · 一屏平铺所有在研项目 · 团队比例严格100% · 一键批量发布'}
                chart={`flowchart TD
    subgraph StepA["1. 选定考评月份并套用规划"]
        direction LR
        A1["📊 进入【月度绩效分配】大表"] --> A2["📅 选定考评月份 (例: 2026-10)"]
        A2 --> A3["⚡ 点击【套用当月规划】<br/><small>自动按排期提取各项目可用额度与成员基准</small>"]
    end

    subgraph StepB["2. 全景大表平铺透视与微调 (无需切换弹窗)"]
        direction TB
        A3 --> P1["<b>📁 项目A: 雷达总体方案</b><br/>• 当月可用额度: 5.00 万元<br/>• 成员分摊比例合计: <b>100%</b><br/>• 状态: 闭环校验通过 √"]
        A3 --> P2["<b>📁 项目B: 信号处理板卡</b><br/>• 当月可用额度: 12.50 万元<br/>• 成员分摊比例合计: <b>100%</b><br/>• 状态: 闭环校验通过 √"]
        A3 --> P3["<b>📁 ...全量在研工程项目</b><br/>• 一屏平铺纵览所有项目<br/>• 组员配比按最大余数法补差<br/>• 动态高亮未满100%项目"]
    end

    subgraph StepC["3. 终审与一键批量发布"]
        direction LR
        P1 & P2 & P3 --> BatchRel["🚀 <b>点击【一键批量发布】</b><br/>加盖数字签名 · 物理锁定当月分配 · 杜绝二次非授权篡改"]
    end

    style StepA fill:#f8fafc,stroke:#cbd5e1,stroke-width:1.5px
    style StepB fill:#fafaf9,stroke:#94a3b8,stroke-width:1.5px
    style StepC fill:#f0fdf4,stroke:#86efac,stroke-width:1.5px

    style A1 fill:#ffffff,stroke:#0284c7,stroke-width:1.5px,color:#0369a1
    style A2 fill:#ffffff,stroke:#0284c7,stroke-width:1.5px,color:#0369a1
    style A3 fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1d4ed8
    style P1 fill:#ffffff,stroke:#ea580c,stroke-width:1.5px,color:#c2410c
    style P2 fill:#ffffff,stroke:#ea580c,stroke-width:1.5px,color:#c2410c
    style P3 fill:#ffffff,stroke:#64748b,stroke-width:1.5px,color:#334155
    style BatchRel fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#15803d`}
              />

              <div className="cc-md-quote">
                <b>💡 {isEn ? 'Exact Verification' : '核心计算公式与严密守恒'}</b>：
                <br />
                <code>员工当月绩点（万元） = 项目合同总额 × 当月项目分配比例 × 员工当月分配率</code>
                <br />
                当月项目内所有参评成员的分配比例之和必须精确等于 100%，底层采用 <b>BigInt 与最大余数补差法</b>，确保分毫不差。
              </div>
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
                  : '当月分配发布完成后，管理员进入【数据资产中心】或【报表中心】：'}
              </p>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', lineHeight: '1.7', margin: '8px 0' }}>
                <li><b>导出项目加密数据包 (.hengji)</b>：一键导出带有完整数据指纹的 `.hengji` 加密交接包，通过内网安全邮件交接给专职绩效核算员。</li>
                <li><b>一键导出财务标准报表 (CSV / Excel)</b>：一键导出横向个人×纵向项目的二维闭环矩阵表，分毫不差直接交接财务。</li>
              </ul>
            </div>
          </section>
        </div>
      );

    case 'manual-auditor':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? 'Dedicated Auditor 5-Step Cross-Project Rollup Guide' : '专职核算员新手实操指南（5步汇总）'}</h1>
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
                  : '在核算员工作区界面的【数据包导入中心】，直接选中各项目经理发来的多个 `.hengji` 加密文件（支持单次 10~50 个文件），直接拖入虚线框内：'}
              </p>

              <MermaidDiagram
                title={isEn ? 'Package Ingestion & Verification Flow' : '核算员数据包导入与自动审计流程示意'}
                subtitle={isEn ? 'Batch Drag & Drop · 3-Layer Security Shield (Fingerprint/Deduplication/Employee Isolation) · Instant Rollup' : '批量拖拽导入 · 三重底层安全防线（防篡改/去重/工号隔离） · 1秒自动归集'}
                chart={`flowchart TD
    subgraph Import["📥 批量导入环节 (零学习成本拖拽交互)"]
        direction LR
        Src["📁 各项目经理独立导出<br/>.hengji 加密交接包"] --> Multi["🖱️ 选中 10~50 个文件<br/>(支持多选与全选)"]
        Multi --> Drop["🎯 直接批量拖拽至<br/>【数据包导入中心】虚线框"]
    end

    subgraph Shields["🛡️ 三重底层安全校验与合规审计网关"]
        direction TB
        Drop --> S1["<b>第一重：防篡改指纹校验</b><br/>• SHA-256 完整性摘要比对<br/>• 文件内容若被外力篡改即刻报警<br/>• 自动亮起绿色验签对勾 √"]
        Drop --> S2["<b>第二重：工程工作令号去重</b><br/>• 自动检测同名或同令号项目<br/>• 彻底防止同一工程重复计入薪酬<br/>• 冲突红灯即刻阻断并提示版本"]
        Drop --> S3["<b>第三重：员工唯一工号校对</b><br/>• 同名同姓员工按工号物理隔离<br/>• 自动关联部门与归属专业组<br/>• 确保跨项目归集精准无误落位"]
    end

    subgraph Success["✨ 成果与穿透核算"]
        direction LR
        S1 & S2 & S3 --> Agg["⚡ <b>1秒自动完成跨项目归集与穿透大表</b><br/>生成个人全景薪酬核算矩阵 · 随时一键导出交接财务"]
    end

    style Import fill:#eff6ff,stroke:#93c5fd,stroke-width:1.5px
    style Shields fill:#fafaf9,stroke:#78716c,stroke-width:1.5px
    style Success fill:#f0fdf4,stroke:#86efac,stroke-width:1.5px

    style Src fill:#ffffff,stroke:#0284c7,stroke-width:1.5px,color:#0369a1
    style Multi fill:#ffffff,stroke:#0284c7,stroke-width:1.5px,color:#0369a1
    style Drop fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1d4ed8
    style S1 fill:#ffffff,stroke:#059669,stroke-width:1.5px,color:#065f46
    style S2 fill:#ffffff,stroke:#d97706,stroke-width:1.5px,color:#92400e
    style S3 fill:#ffffff,stroke:#2563eb,stroke-width:1.5px,color:#1e40af
    style Agg fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#15803d`}
              />
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
                <li><b>一人多项目兼项聚合</b>：若张工程师在“某型号雷达总体”（分得 3.2 绩点）与“数字信号处理研发”（分得 4.5 绩点）均有兼项，系统自动合并为该员工总计 7.7 绩点。</li>
                <li><b>穿透明细展开</b>：点击表格中任何一名员工的名字，即可向下展开查看他在各个项目中的详细分配占比、项目工作令号与项目负责人评语。</li>
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
            <h1>{isEn ? 'Business Standards & Guidance Ranges' : '业务口径与负责人参考系数规范'}</h1>
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
    // 文章 3：远程推送与发布部署教程（图4高质感代码块实操）
    // ==========================================
    case 'deploy-prep':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? 'Prerequisites, Versioning & Unit Testing' : '准备工作与版本一致性检查'}</h1>
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

            <MarkdownCodeCard
              lang="POWERSHELL"
              code={`# 检查 Node.js 与 npm 运行时版本\nnode -v\nnpm -v`}
              copyKey="cmd-check-node"
              onCopyText={onCopyText}
              copiedKey={copiedKey}
            />

            <div className="cc-md-quote">
              <b>⚠️ {isEn ? 'Three-Way Version Consistency Rule' : '三处版本号必须严格一致'}</b>：
              <br />
              {isEn
                ? 'Ensure APP_VERSION in lib/core.ts, version in package.json, and the current release tag share the exact same version string (e.g. 0.7.10).'
                : `每次发布前，请检查以下三处版本号字符串是否完全统一（例如统一为 ${APP_VERSION}）：\n① package.json 中的 "version": "${APP_VERSION}"\n② lib/core.ts 中的 export const APP_VERSION = '${APP_VERSION}';\n③ app/desktop-updater.ts 中的当前版本常量。`}
            </div>
          </section>

          <section id="sec-deploy-test" className="cc-cl-sec">
            <h2>{isEn ? '2. Running Automated Test Suite (npm test)' : '2. 运行自动化单元测试套件（npm test）'}</h2>
            <p>
              {isEn
                ? 'Execute the automated test suite to verify BigInt precision, quota calculations, and auditor rollup algorithms:'
                : '执行自动化单测命令，严密校验 BigInt 闭环算法、防透支排期逻辑及核算员跨项目归集：'}
            </p>

            <MarkdownCodeCard
              lang="BASH"
              code={`# 执行全量自动化单元测试套件\nnpm test`}
              copyKey="cmd-npm-test"
              onCopyText={onCopyText}
              copiedKey={copiedKey}
            />

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
            <h1>{isEn ? 'Git Staging, Commit & Remote Tag Push' : 'Git 本地库远程推送与版本标签'}</h1>
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

            <MarkdownCodeCard
              lang="BASH"
              code={`# 1. 检查本地工作区状态\ngit status\n\n# 2. 将所有修改与新文件加入暂存区\ngit add .\n\n# 3. 提交版本更新记录，附带清晰语义说明\ngit commit -m "release: v${APP_VERSION} - update and improvements"`}
              copyKey="cmd-git-commit"
              onCopyText={onCopyText}
              copiedKey={copiedKey}
            />
          </section>

          <section id="sec-deploy-tag" className="cc-cl-sec">
            <h2>{isEn ? '2. Create Annotated Tag & Push to Remote Origin' : '2. 创建版本附注标签并推送到 GitHub'}</h2>
            <p>
              {isEn
                ? 'Create a Git annotated tag matching the release version (e.g. v0.7.10), then push both the main branch and the tag to GitHub:'
                : `使用 -a 参数创建带附注说明的版本标签（例如 v${APP_VERSION}），然后分别将 main 分支与新标签推送到远程：`}
            </p>

            <MarkdownCodeCard
              lang="BASH"
              code={`# 1. 创建附注版本标签\ngit tag -a v${APP_VERSION} -m "release v${APP_VERSION}"\n\n# 2. 推送 main 分支最新代码至远程\ngit push origin main\n\n# 3. 将新版本标签推送到远程 GitHub 仓库\ngit push origin v${APP_VERSION}`}
              copyKey="cmd-git-tag-push"
              onCopyText={onCopyText}
              copiedKey={copiedKey}
            />

            <div className="cc-md-quote">
              <b>💡 {isEn ? 'Remote Push Verification' : '推送成功核验'}</b>：
              {isEn
                ? `Visit https://github.com/${GITHUB_REPO}/tags to verify that the new tag appears.`
                : `命令执行完毕后，访问 https://github.com/${GITHUB_REPO}/tags 即可看到已成功生成的版本标签。`}
            </div>
          </section>
        </div>
      );

    case 'deploy-build':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? 'Local Packaging Matrix: MSI, NSIS, Portable & ZIP' : '桌面端本地打包构建全套矩阵'}</h1>
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

            <MarkdownCodeCard
              lang="BASH"
              code={`# 编译桌面端前端 Bundle\nnpx vite build --config vite.desktop.config.ts`}
              copyKey="cmd-vite-build"
              onCopyText={onCopyText}
              copiedKey={copiedKey}
            />
          </section>

          <section id="sec-deploy-builder" className="cc-cl-sec">
            <h2>{isEn ? '2. Compile NSIS, MSI & Portable Installers via electron-builder' : '2. 使用 electron-builder 编译三大格式'}</h2>
            <p>
              {isEn
                ? 'Execute electron-builder targeting Windows x64 to generate NSIS, MSI, and Portable binaries simultaneously:'
                : '通过 electron-builder 一次性编译生成 NSIS 安装向导、MSI 企业级静默安装包以及 Portable 便携单文件版：'}
            </p>

            <MarkdownCodeCard
              lang="BASH"
              code={`# 一次性编译打包 EXE、MSI 与 Portable 单文件\nnpx electron-builder --win nsis msi portable --x64`}
              copyKey="cmd-builder"
              onCopyText={onCopyText}
              copiedKey={copiedKey}
            />
          </section>

          <section id="sec-deploy-zip" className="cc-cl-sec">
            <h2>{isEn ? '3. Generate Portable ZIP Archive via Script' : '3. 构建 ZIP 绿色免安装完整包'}</h2>
            <p>{isEn ? 'Package the uncompressed win-unpacked directory into a standalone ZIP file:' : '运行项目内置的压缩脚本，将免安装文件夹打包为绿色 ZIP 压缩包：'}</p>

            <MarkdownCodeCard
              lang="BASH"
              code={`# 执行 ZIP 压缩脚本打包绿色完整包\nnode scripts/build-zip.mjs`}
              copyKey="cmd-build-zip"
              onCopyText={onCopyText}
              copiedKey={copiedKey}
            />

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
            <h1>{isEn ? 'Automated Publication to GitHub Releases' : 'GitHub Releases 命令行自动化发布'}</h1>
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

            <MarkdownCodeCard
              lang="BASH"
              code={`# 自动创建 Release 并上传 4 大安装文件及 SHA-256 校验和\nnode scripts/publish-release-github.mjs`}
              copyKey="cmd-publish-release"
              onCopyText={onCopyText}
              copiedKey={copiedKey}
            />

            <div className="cc-md-quote">
              <b>🛡️ {isEn ? 'Script Capabilities' : '脚本执行动作解析'}</b>：
              <ol style={{ paddingLeft: '18px', margin: '6px 0 0', lineHeight: '1.6', fontSize: '13px' }}>
                <li>自动读取本地已授权的 Git 凭证管理器或 <code>GITHUB_TOKEN</code> 环境变量。</li>
                <li>检查并自动创建匹配当前版本标签（如 <code>v{APP_VERSION}</code>）的 GitHub Release 条目。</li>
                <li>并发分块上传 4 种分发包（EXE、MSI、Portable、ZIP），遇旧文件自动安全替换。</li>
                <li>在 Release 页面生成工整的更新说明与极速镜像加速下载直链。</li>
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
            <h1>{isEn ? 'Deploying Static Website to GitHub Pages' : 'GitHub Pages 静态站点命令行部署'}</h1>
            <span className="cc-cl-date">{isEn ? 'Terminal Step 4' : '纯命令行第四步'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'Compile the official landing page and web sandbox demo into optimized static web assets, and deploy them to the gh-pages branch via the deploy script.'
              : '将衡绩官方网站、在线沙盒体验工作台以及完整在线文档中心编译为高优化的静态 Web 资源，并通过部署脚本推送到 GitHub 的 gh-pages 分支。'}
          </p>

          <hr className="cc-cl-divider" />

          <section id="sec-deploy-pages-build" className="cc-cl-sec">
            <h2>{isEn ? '1. Build Web Artifacts via npm run pages:build' : '1. 编译官方网站静态资源'}</h2>
            <p>{isEn ? 'Run the production web build:' : '在终端中执行官方网站的生产编译命令：'}</p>

            <MarkdownCodeCard
              lang="BASH"
              code={`# 编译打包官方网页版静态资源\nnpm run pages:build`}
              copyKey="cmd-pages-build"
              onCopyText={onCopyText}
              copiedKey={copiedKey}
            />

            <small style={{ color: 'var(--cc-text-muted)' }}>
              {isEn ? 'Compiles React app into dist/ with proper base URL routing (/hengji/) and injects 404.html for SPA fallback.' : '该命令会将应用打包至 dist/ 目录，配置好相对路由前缀 /hengji/，并自动注入 404.html 防止刷新页面白屏。'}
            </small>
          </section>

          <section id="sec-deploy-pages-push" className="cc-cl-sec">
            <h2>{isEn ? '2. Push to gh-pages Branch via deploy-pages.mjs' : '2. 执行 deploy-pages 脚本推送到 gh-pages 分支'}</h2>
            <p>{isEn ? 'Run the deployment script:' : '执行专用的推送脚本，将 dist 产物推送到 gh-pages 分支：'}</p>

            <MarkdownCodeCard
              lang="BASH"
              code={`# 执行脚本将编译结果推送到 gh-pages 静态发布分支\nnode scripts/deploy-pages.mjs`}
              copyKey="cmd-pages-deploy"
              onCopyText={onCopyText}
              copiedKey={copiedKey}
            />

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
            <h1>{isEn ? 'Full-Pipeline One-Liner & Troubleshooting' : '全流程一键连续执行速查与排错指南'}</h1>
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

            <MarkdownCodeCard
              lang="POWERSHELL"
              code={`# 纯命令行全自动连击流水线：测试 -> 打包 -> 网页编译 -> Release上传 -> Pages部署\nnpm test && npx vite build --config vite.desktop.config.ts && npx electron-builder --win nsis msi portable --x64 && node scripts/build-zip.mjs && npm run pages:build && node scripts/publish-release-github.mjs && node scripts/deploy-pages.mjs`}
              copyKey="cmd-oneliner"
              onCopyText={onCopyText}
              copiedKey={copiedKey}
            />
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
                  : '原因：GitHub 已废弃密码认证方式。解决办法：前往 GitHub Settings -> Developer Settings -> Personal access tokens 生成具有 repo 权限的 Token，在 Windows 凭据管理器中更新密码，或在终端中设置环境变量：'}
              </p>
              <MarkdownCodeCard
                lang="POWERSHELL"
                code={`# 在 PowerShell 中临时设置 GITHUB_TOKEN 环境变量\n$env:GITHUB_TOKEN="ghp_你的PersonalAccessToken"`}
                copyKey="cmd-token-fix"
                onCopyText={onCopyText}
                copiedKey={copiedKey}
              />
            </div>

            <div className="cc-doc-step-card" style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: '700' }}>
                <AlertTriangle size={18} />
                <span>{isEn ? 'Release Asset Upload Timeout or Network Failure' : '报错 2：publish-release 脚本上传大文件超时中断'}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--cc-text-secondary)', margin: '8px 0 0', lineHeight: '1.6' }}>
                {isEn
                  ? 'Cause: Network instability when uploading 75MB+ binaries. Solution: Re-run `node scripts/publish-release-github.mjs`. The script will detect already uploaded files and resume/retry failed ones.'
                  : '原因：个别网络环境下直连 GitHub Releases API 出现超时重置。解决办法：重新运行发布脚本，脚本具有断点智能检测能力，已成功上传的文件会自动跳过，仅补传失败资产：'}
              </p>
              <MarkdownCodeCard
                lang="BASH"
                code={`# 重新执行发布脚本，自动跳过已上传文件，续传失败资产\nnode scripts/publish-release-github.mjs`}
                copyKey="cmd-publish-retry"
                onCopyText={onCopyText}
                copiedKey={copiedKey}
              />
            </div>

            <div className="cc-doc-step-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: '700' }}>
                <Sparkles size={18} />
                <span>{isEn ? 'Browser Cache Refresh Tip' : '提示 3：GitHub Pages 更新后浏览器仍显示旧内容'}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--cc-text-secondary)', margin: '8px 0 0', lineHeight: '1.6' }}>
                {isEn
                  ? 'Use Ctrl + F5 (or Cmd + Shift + R on Mac) to perform a hard refresh, bypassing browser caches.'
                  : '解决办法：按下 Ctrl + F5（Mac 用户按 Cmd + Shift + R）强制刷新浏览器缓存，即可加载最新部署的网页。'}
              </p>
            </div>
          </section>
        </div>
      );

    // ==========================================
    // 书卷 4：衡绩设计教程（针对新手的大白话实战指南）
    // ==========================================
    case 'tutorial-concept':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? '4.1 Pain Points & Architectural Blueprint' : '4.1 痛点拆解与商业架构（为什么做衡绩？）'}</h1>
            <span className="cc-cl-date">{isEn ? 'HengJi Design Masterclass · Chapter 1' : '衡绩设计教程 · 核心理念篇'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'Why did traditional KPI spreadsheets break down in engineering teams? Learn the core business motivation behind HengJi through vivid analogies and architectural flowcharts.'
              : '写软件最关键的不是上来就敲代码，而是先搞清楚“到底要解决什么实际痛点”。本章用生活化大白话和生动比喻，拆解传统工程团队在绩效考评中遇到的各种扯皮乱象，并展示衡绩三位一体的顶层解法。'}
          </p>

          <hr className="cc-cl-divider" />

          {/* 1. 痛点类比 */}
          <section id="sec-tut-dilemma" className="cc-cl-sec">
            <h2>{isEn ? '1. The Banquet Split Dilemma (Analogy)' : '1. 形象类比：十位大厨与五桌大席的分钱困局'}</h2>
            <div className="cc-md-quote" style={{ margin: '14px 0', borderLeftColor: 'var(--cc-terracotta)' }}>
              <b>💡 设身处地想象一下这个生活场景：</b>
              <br />
              你开了一家大型国宴餐厅，接了 5 桌长达半年才能吃完的顶级国宴（相当于 5 个长期研制的工程项目）。
              <ul style={{ paddingLeft: '18px', margin: '6px 0 0', lineHeight: '1.7' }}>
                <li><b>死穴一（蛋糕膨胀）</b>：凉菜、热炒、汤品的大厨各管各的，大家都觉得自己的功劳最大。月底上报业绩时，各组负责人上报的金额加起来，居然达到了总营收的 <b>130%</b>！老板如果照单全发，餐厅当月就直接破产。</li>
                <li><b>死穴二（前紧后松与烂尾）</b>：刚开始买菜备料（立项）时，大厨们就把 80% 的服务费领走了。等到几个月后菜肴上桌、客人要洗碗擦桌（交付与质保维保）时，大家口袋里早已揣满了钱，根本没人愿意留在后厨干收尾的脏活累活！</li>
                <li><b>死穴三（一人多领与算错账）</b>：张师傅既在“第一桌”切了土豆，又在“第三桌”炒了牛肉。两个桌子的领班互不通气，张师傅在两边都按全勤领钱，财务月底做总账时彻底崩溃。</li>
              </ul>
            </div>
          </section>

          {/* 2. 衡绩三大工程解法与架构流程图 */}
          <section id="sec-tut-solutions" className="cc-cl-sec">
            <h2>{isEn ? '2. Three Engineering Solutions & Architecture' : '2. 衡绩的三大工程解法与架构流程图'}</h2>
            <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
              针对上面的烂摊子，衡绩在顶层设计上提出了三条铁律，并用软件代码直接焊死：
            </p>

            <MermaidDiagram
              title={isEn ? 'Traditional Pain Points vs HengJi Solutions' : '传统考核死穴与衡绩三大工程解法对照架构图'}
              subtitle={isEn ? 'From Chaos to Precision: Hard Cap · Phased Delivery · Physical Isolation' : '从扯皮泥潭到严密守恒：合同硬顶 · 前低后高 · 唯一工号穿透'}
              chart={`flowchart TD
    subgraph Traditional["❌ 传统管理模式的三大死穴（为什么大家都在扯皮？）"]
        direction TB
        T1["<b>死穴 1：Excel 满天飞</b><br/>公式容易被改乱 · 版本多头混乱 · 无防篡改校验"]
        T2["<b>死穴 2：前期立项分光光</b><br/>项目刚立项就分完奖金 · 后期试验维保没人愿意干"]
        T3["<b>死穴 3：跨项目重复算</b><br/>多个项目经理各自打分 · 员工一人领两份钱造成预算超支"]
    end

    subgraph HengJiSolution["✅ 衡绩（HengJi）的三位一体工程解法"]
        direction TB
        S1["<b>解法 1：合同额度绝对硬顶</b><br/>1 绩点 ≡ 1 万元合同产值 · 蛋糕固定绝不允许凭空印钞"]
        S2["<b>解法 2：前低后高防透支排期</b><br/>立项阶段限高 10% · 交付大头锁定 45%+ · 维保质保刚性留 5%"]
        S3["<b>解法 3：工号物理隔离与穿透汇总</b><br/>去中心化加密交接包 · 核算员 1 秒汇总 50 个项目且同名不同号严格区分"]
    end

    Traditional -->|催生数字化变革| HengJiSolution

    style Traditional fill:#fff1f2,stroke:#f43f5e,stroke-width:1.5px
    style HengJiSolution fill:#f0fdf4,stroke:#16a34a,stroke-width:1.5px
    style T1 fill:#ffffff,stroke:#f43f5e,stroke-width:1.5px,color:#9f1239
    style T2 fill:#ffffff,stroke:#f43f5e,stroke-width:1.5px,color:#9f1239
    style T3 fill:#ffffff,stroke:#f43f5e,stroke-width:1.5px,color:#9f1239
    style S1 fill:#ffffff,stroke:#16a34a,stroke-width:1.5px,color:#166534
    style S2 fill:#ffffff,stroke:#16a34a,stroke-width:1.5px,color:#166534
    style S3 fill:#ffffff,stroke:#16a34a,stroke-width:1.5px,color:#166534`}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '16px' }}>
              <div className="cc-doc-step-card">
                <span className="cc-doc-step-tag" style={{ background: '#ea580c' }}>铁律 1</span>
                <h4 style={{ margin: '8px 0 4px', fontSize: '14px' }}>合同总额绝对硬顶</h4>
                <p style={{ fontSize: '12px', color: 'var(--cc-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  项目合同是 100 万元，全生命周期可分配绩点就只能是 100 点。1 绩点 ≡ 1 万元产值，从源头杜绝超额虚标。
                </p>
              </div>

              <div className="cc-doc-step-card">
                <span className="cc-doc-step-tag" style={{ background: '#ca8a04' }}>铁律 2</span>
                <h4 style={{ margin: '8px 0 4px', fontSize: '14px' }}>前低后高防透支排期</h4>
                <p style={{ fontSize: '12px', color: 'var(--cc-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  首月立项限高 10%（默认 5%）；研制出厂交付月释放 45%+；末月固定保留 5% 维保金，杜绝领完钱撂挑子。
                </p>
              </div>

              <div className="cc-doc-step-card">
                <span className="cc-doc-step-tag" style={{ background: '#16a34a' }}>铁律 3</span>
                <h4 style={{ margin: '8px 0 4px', fontSize: '14px' }}>唯一工号全局锚定</h4>
                <p style={{ fontSize: '12px', color: 'var(--cc-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  跨项目汇总以员工唯一工号为唯一物理准绳。同名不同工号严格分列，同工号多项目自动累加，财务账目分毫不差。
                </p>
              </div>
            </div>
          </section>
        </div>
      );

    case 'tutorial-algo':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? '4.2 Mathematical Algorithms & Cryptography' : '4.2 核心精算算法与安全基石（大数与离线加密）'}</h1>
            <span className="cc-cl-date">{isEn ? 'HengJi Design Masterclass · Chapter 2' : '衡绩设计教程 · 算法安全篇'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'Why is standard JavaScript math dangerous for financial software? Learn how BigInt and the Largest Remainder Method ensure 100% exact allocation, plus PBKDF2/AES-256 military-grade encryption.'
              : '为什么千万不能用标准 JavaScript 浮点数算钱？如何用“分切披萨”的比喻搞懂最大余数补差算法？为什么涉密科研单位坚决不用 SaaS 云端？本章带你解密软件背后的数学与密码学底盘。'}
          </p>

          <hr className="cc-cl-divider" />

          {/* 1. BigInt 与最大余数法 */}
          <section id="sec-tut-bigint" className="cc-cl-sec">
            <h2>{isEn ? '1. BigInt Cents Calculation & Largest Remainder Method' : '1. 浮点数灾难、BigInt 整数分位与最大余数补差'}</h2>
            
            <div className="cc-md-quote" style={{ margin: '14px 0', borderLeftColor: '#dc2626' }}>
              <b>⚠️ 新手最容易踩的浮点数大坑：</b>
              <br />
              打开浏览器控制台，输入 <code>0.1 + 0.2</code>，你会发现它打印出 <code>0.30000000000000004</code>！
              <br />
              这就像去超市买肉，称上总会平白无故掉下几粒肉渣。如果不做处理，几百名员工的月度考评累加起来，总金额就会多出几分几角钱，在财务审计面前直接视为“做假账”！
            </div>

            <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
              <b>解法一：全量换算为 BigInt 整数“分（Cents）”</b><br />
              在衡绩底层，所有金额存入状态树时，一律乘以 1,000,000 换算为纯整数（1.25 万元 = 1,250,000 分），彻底摆脱 IEEE-754 浮点误差。
            </p>

            <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
              <b>解法二：最大余数补差法（分披萨的生动比喻）</b><br />
              3 个人平分 10 块钱：10 ÷ 3 = 每人 3.33 元，剩下最后的 0.01 元该给谁？
            </p>

            <MermaidDiagram
              title={isEn ? 'Largest Remainder Method Sequence' : '最大余数法严密补差精算时序图'}
              subtitle={isEn ? 'Exact Penny Balancing: Integer Shares ➔ Remainder Sorting ➔ 1-Cent Priority Fill' : '绝对闭环平账：整数分位 ➔ 余数降序排序 ➔ 1分钱优先补偿'}
              chart={`flowchart TD
    Start["💰 当月项目可用总额度: 10.00 万元 (换算为 1,000,000 分)"]
    --> Split["➗ 3名成员均分 (理论比例各 33.3333...%)"]
    
    Split --> Floor["1. 计算各成员整数商: 每人各分得 3.33 万元 (共计 9.99 万元)"]
    Floor --> Diff["2. 发现微观误差差额: 10.00 - 9.99 = 剩余 0.01 万元 (1 分钱余数)"]
    
    Diff --> Sort["3. 提取各成员除法截断的浮点余数，从大到小降序排列"]
    Sort --> Patch["4. 将未分完的 1 分钱，精准补偿给排序第一的骨干成员 A"]
    
    Patch --> Done["✅ 最终分配落定：A=3.34 万, B=3.33 万, C=3.33 万<br/><b>校验合计：3.34 + 3.33 + 3.33 严格恒等于 10.00 万元 (100% 闭环 √)</b>"]

    style Start fill:#f8fafc,stroke:#0284c7,stroke-width:1.5px
    style Split fill:#eff6ff,stroke:#2563eb,stroke-width:1.5px
    style Floor fill:#ffffff,stroke:#64748b,stroke-width:1.5px
    style Diff fill:#fefce8,stroke:#ca8a04,stroke-width:2px,color:#854d0e
    style Sort fill:#fff7ed,stroke:#ea580c,stroke-width:1.5px
    style Patch fill:#fdf4ff,stroke:#a855f7,stroke-width:2px,color:#7e22ce
    style Done fill:#f0fdf4,stroke:#16a34a,stroke-width:2px,color:#166534`}
            />
          </section>

          {/* 2. 军工级离线加密 */}
          <section id="sec-tut-crypto" className="cc-cl-sec">
            <h2>{isEn ? '2. PBKDF2 & AES-256-GCM Military Cryptographic Shield' : '2. 为什么坚决不做云端 SaaS？PBKDF2 与 AES-256-GCM 离线加密防线'}</h2>
            
            <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
              许多新手习惯把数据存到云端服务器，走账号登录和远程 API。但在国防雷达、航空航天、尖端芯片等科研团队，任何连接外部网络的行为都触碰涉密红线。
              衡绩采用完全离线的 <b>.hengji</b> 独立数据库文件，并设计了军工级认证加密防线：
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', margin: '14px 0' }}>
              <div className="cc-doc-step-card">
                <span className="cc-doc-step-tag" style={{ background: '#2563eb' }}>钥匙发生器</span>
                <h4 style={{ margin: '8px 0 4px', fontSize: '14px' }}>PBKDF2-SHA256（10万次加盐）</h4>
                <p style={{ fontSize: '12px', color: 'var(--cc-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  好比银行金库的齿轮密码锁。普通锁转 1 圈就开了，而这个锁必须极度精确地转满 10 万圈！即使黑客用超级计算机暴力破解，也要算上一百万年。
                </p>
              </div>

              <div className="cc-doc-step-card">
                <span className="cc-doc-step-tag" style={{ background: '#16a34a' }}>数字蜡封</span>
                <h4 style={{ margin: '8px 0 4px', fontSize: '14px' }}>AES-256-GCM 认证加密</h4>
                <p style={{ fontSize: '12px', color: 'var(--cc-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  不仅对数据内容高强度加密，还在门缝处贴上了一张带有全息防伪的数字蜡封（Auth Tag）。若有人用十六进制编辑器暗中改动 1 个字符，蜡封粉碎，系统立刻拒载！
                </p>
              </div>

              <div className="cc-doc-step-card">
                <span className="cc-doc-step-tag" style={{ background: '#059669' }}>双重备份</span>
                <h4 style={{ margin: '8px 0 4px', fontSize: '14px' }}>.hengji.backup 自动镜像</h4>
                <p style={{ fontSize: '12px', color: 'var(--cc-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  每次保存的瞬间，系统自动在同目录下生成一份 `.backup` 副本。即使遇到突然停电或电脑死机，随时可以用镜像文件秒级恢复。
                </p>
              </div>
            </div>
          </section>
        </div>
      );

    case 'tutorial-desktop':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? '4.3 Desktop Software Architecture & Dual Workspaces' : '4.3 桌面端软件系统设计与实现（双工作区落地）'}</h1>
            <span className="cc-cl-date">{isEn ? 'HengJi Design Masterclass · Chapter 3' : '衡绩设计教程 · 架构实战篇'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'Deep dive into the Electron + React 18 + Vite desktop architecture. Learn why a Zero-DB state machine outperforms local SQL, and how the Dual-Workspace model isolates managerial and auditing duties.'
              : '从零设计一款成熟的工业级桌面软件，如何进行技术选型？为什么无数据库（Zero-DB）架构反而比传统本地 SQLite 更加稳固？为什么月度分配坚决不做弹窗、必须做一屏全景大表？本章带你剖析全套桌面架构。'}
          </p>

          <hr className="cc-cl-divider" />

          {/* 1. 技术栈选型与 Zero-DB */}
          <section id="sec-tut-zerodb" className="cc-cl-sec">
            <h2>{isEn ? '1. Tech Stack Selection & Zero-DB State Machine' : '1. 技术选型哲学：为什么是 Electron + React + TypeScript + Zero-DB？'}</h2>
            
            <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
              许多新手一提到桌面端就想用 C# WPF 或 C++ Qt，或者在本地装一个 SQLite。但这会带来几个致命痛点：跨操作系统迁移极其繁重、本地 SQL 驱动容易因 Windows 运行库缺失而报错崩溃。
              衡绩采用 <b>Electron + React 18 + TypeScript + Vite + Zero-DB 单向状态机</b>：
            </p>

            <ul style={{ paddingLeft: '18px', fontSize: '13px', lineHeight: '1.7', margin: '8px 0' }}>
              <li><b>前端生态降维打击</b>：React 组件化开发 UI 极其丝滑，配合 Lucide 图标与 CSS 变量，轻松做出远超传统工业软件的高颜值界面；</li>
              <li><b>TypeScript 类型安全</b>：在编译期拦截 90% 以上的拼写错误、空指针异常与对象字段缺失；</li>
              <li><b>内存单向状态机 + 原子写盘</b>：内存中只维护一个单一的事实来源（Single Source of Truth）<code>AppState</code>，所有的用户操作都是纯函数计算，点击保存时直接加密刷入磁盘，无任何数据库死锁或驱动崩溃风险！</li>
            </ul>
          </section>

          {/* 2. 双工作区物理分离 */}
          <section id="sec-tut-dualmode" className="cc-cl-sec">
            <h2>{isEn ? '2. Dual-Workspace Architecture & Luggage Sorting Analogy' : '2. 双工作区物理分离哲学：综合管理 vs 专职核算'}</h2>

            <div className="cc-md-quote" style={{ margin: '14px 0', borderLeftColor: '#2563eb' }}>
              <b>🧳 形象类比：大型国际机场的行李分拣中心</b><br />
              一架飞机（项目经理）降落，运来 100 件行李；另一架飞机也运来 80 件行李。
              项目经理只负责把本项目的行李贴好标签装入货舱（导出项目数据包）；
              而专职核算员是<b>行李分拣中心的主管</b>：他把 10~50 架飞机的行李全部倒在传输带上，扫码枪（唯一工号）自动识别每件行李的主人是谁，1 秒内把属于张三的所有行李稳稳送上张三的提取轮盘，绝不串道！
            </div>

            <MermaidDiagram
              title={isEn ? 'Dual-Workspace Physical Separation Model' : '双工作区物理分离与数据包流转全景图'}
              subtitle={isEn ? 'Decentralized Project Rating ➔ Encrypted Bundle ➔ Dedicated Auditor 1-Sec Rollup' : '各项目独立打分 ➔ 加密数据包交接 ➔ 核算员 1 秒汇总并交接财务'}
              chart={`flowchart TD
    subgraph ModeAdmin["🏢 综合管理工作区（面向项目经理与部门长）"]
        direction TB
        A1["👥 录入部门编制花名册与专业组"]
        A2["📁 录入工程合同与工作令号"]
        A3["📊 设置前低后高防透支排期"]
        A4["⚡ 月底集中全景大表分配 (团队 100%)"]
        A5["🚀 一键批量盖章发布 & 导出 .hengji 数据包"]
        A1 --> A2 --> A3 --> A4 --> A5
    end

    subgraph Handoff["📦 安全离线交接环节"]
        Pkg["📁 导出的独立项目数据包 (.hengji)<br/><i>(内网邮件或U盘交接，无法越权修改他人项目)</i>"]
    end

    subgraph ModeAuditor["📊 绩效核算工作区（面向专职核算员与财务审计）"]
        direction TB
        B1["📥 批量拖拽 10~50 个 .hengji 文件入虚线框"]
        B2["🛡️ 三重防线：SHA256验签 + 工作令去重 + 工号隔离"]
        B3["⚡ 1秒自动全量穿透：生成个人×项目二维矩阵"]
        B4["🏆 自动评选月度/季度/年度绩星榜"]
        B5["📤 导出标准 Excel/CSV 直接交接财务发钱"]
        B1 --> B2 --> B3 --> B4 --> B5
    end

    A5 --> Pkg --> B1

    style ModeAdmin fill:#fff7ed,stroke:#ea580c,stroke-width:1.5px
    style ModeAuditor fill:#eff6ff,stroke:#2563eb,stroke-width:1.5px
    style Handoff fill:#f0fdf4,stroke:#16a34a,stroke-width:1.5px
    style Pkg fill:#ffffff,stroke:#16a34a,stroke-width:2px,color:#166534`}
            />
          </section>

          {/* 3. 一屏大表交互细节 */}
          <section id="sec-tut-matrix" className="cc-cl-sec">
            <h2>{isEn ? '3. One-Screen Matrix Interaction Design' : '3. 为什么坚决不做弹窗？月度分配一屏全景大表的交互细节'}</h2>
            
            <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
              在传统软件里，改一个项目的考评就弹出一个模态框（Modal），改完关掉再点下一个。如果部门有 15 个项目在研，管理员每月要开合 15 次弹窗，不仅头晕眼花，而且根本看不到所有项目的总人数、总额度分布。
              衡绩采用了<b>一屏平铺全景大表</b>设计：
            </p>

            <ul style={{ paddingLeft: '18px', fontSize: '13px', lineHeight: '1.7', margin: '8px 0' }}>
              <li><b>无缝纵向横向平铺</b>：所有的在研工程项目一屏展开，无需切换任何标签页；</li>
              <li><b>点击【⚡ 套用当月规划】</b>：系统毫秒级拉取年初排期设定的可用额度与成员基准；</li>
              <li><b>实时红黄绿三色闭环指示灯</b>：比例不足 100% 亮黄色警示，超过 100% 亮红色阻断保存，正好等于 100% 亮绿色对勾；</li>
              <li><b>一键批量盖章发布</b>：审核完毕后，点击按钮同时给所有项目加盖不可逆的数字防篡改指纹，省时省力！</li>
            </ul>
          </section>
        </div>
      );

    case 'tutorial-website':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? '4.4 Official Website & Visual Experience Design' : '4.4 官方网站与视觉体验设计（羊皮纸美学）'}</h1>
            <span className="cc-cl-date">{isEn ? 'HengJi Design Masterclass · Chapter 4' : '衡绩设计教程 · 视觉体验篇'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'Why did we reject the generic SaaS blue in favor of warm parchment and industrial terracotta? Discover the psychology of brand trust and the 5-layer psychological conversion funnel behind our landing page.'
              : '很多程序员做出来的官网像冷冰冰的后台模板。衡绩面对的是严谨权威的工程团队与科研机构，官网如何通过“羊皮纸暖金”与“工业陶土红”传递厚重的契约与信任感？如何在浏览器里打造零门槛的在线试玩体验？本章带你领略全套视觉设计系统。'}
          </p>

          <hr className="cc-cl-divider" />

          {/* 1. 羊皮纸配色哲学 */}
          <section id="sec-tut-parchment" className="cc-cl-sec">
            <h2>{isEn ? '1. Parchment & Industrial Terracotta Color Psychology' : '1. 品牌色彩哲学：为什么弃用科技蓝，选用羊皮纸暖金与工业陶土红？'}</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', margin: '14px 0' }}>
              <div className="cc-doc-step-card">
                <span className="cc-doc-step-tag" style={{ background: '#78716c' }}>底盘基石</span>
                <h4 style={{ margin: '8px 0 4px', fontSize: '14px' }}>羊皮纸暖金（#faf7f0）</h4>
                <p style={{ fontSize: '12px', color: 'var(--cc-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  源自中世纪手稿与国家档案馆的羊皮纸典籍。色泽温润护眼，彻底摒弃纯白屏幕的刺眼感，传递出“历史厚重、严肃契约、不可磨灭”的庄严信誉。
                </p>
              </div>

              <div className="cc-doc-step-card">
                <span className="cc-doc-step-tag" style={{ background: '#c85a32' }}>品牌灵魂</span>
                <h4 style={{ margin: '8px 0 4px', fontSize: '14px' }}>工业陶土红（#c85a32）</h4>
                <p style={{ fontSize: '12px', color: 'var(--cc-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  源自工程锻造的烈火与中国传统的火漆印章。象征“刚性锁定、盖印生效、不可篡改”，每次点击按钮都像是在契约上盖下一方庄严的红印。
                </p>
              </div>

              <div className="cc-doc-step-card">
                <span className="cc-doc-step-tag" style={{ background: '#10b981' }}>审计绿与深蓝</span>
                <h4 style={{ margin: '8px 0 4px', fontSize: '14px' }}>翡翠绿与总体蓝</h4>
                <p style={{ fontSize: '12px', color: 'var(--cc-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  用于表示校验通过（绿色）和专业组别归类（蓝色），整体色调克制、典雅，形成高度一致的工业级视觉辨识度。
                </p>
              </div>
            </div>
          </section>

          {/* 2. 五层心流转化漏斗 */}
          <section id="sec-tut-funnel" className="cc-cl-sec">
            <h2>{isEn ? '2. Five-Layer Conversion Funnel & Live Interactive Demo' : '2. 官网主页五层心流转化漏斗与在线体验区实现'}</h2>

            <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
              一个优秀的官网，绝不仅仅是好看，更是对访客心理预期的层层引导与信任建立。衡绩主页采用了五层心流转化漏斗：
            </p>

            <MermaidDiagram
              title={isEn ? 'Website 5-Layer Conversion Funnel' : '衡绩官网主页五层心流转化漏斗架构图'}
              subtitle={isEn ? 'Hero Anchor ➔ Pain Resonance ➔ Cognitive Model ➔ Live Interactive Demo ➔ Tech Docs' : '视觉锚定 ➔ 痛点共鸣 ➔ 核心认知 ➔ 浏览器内免安装体验 ➔ 多卷本技术文档'}
              chart={`flowchart TD
    L1["<b>第一层：视觉锚定 (Hero 顶层区)</b><br/>羊皮纸色调 · 品牌火漆印章徽标 · 醒目标语 · 四大安装包极速下载"]
    --> L2["<b>第二层：痛点共鸣 (传统痛点 vs 衡绩解法)</b><br/>对比卡片击碎客户心防：Excel崩盘/额度透支/跨项目重复算"]
    --> L3["<b>第三层：核心认知 (双锚定工程产值模型)</b><br/>合同硬顶 × 交付排期 × 团队闭环，公式化图解直观明了"]
    --> L4["<b>第四层：实操信任 (浏览器内嵌在线无缝体验)</b><br/>无需下载！直接在主页点击体验真实管理端与核算端操作"]
    --> L5["<b>第五层：技术沉淀 (多卷本交互式在线文档中心)</b><br/>白皮书 · 5步新手手册 · 部署指南 · 架构教程，Mermaid 流程图矢量呈现"]

    style L1 fill:#ffffff,stroke:#c85a32,stroke-width:2px,color:#9a3412
    style L2 fill:#ffffff,stroke:#ea580c,stroke-width:1.5px,color:#c2410c
    style L3 fill:#ffffff,stroke:#2563eb,stroke-width:1.5px,color:#1e40af
    style L4 fill:#ffffff,stroke:#16a34a,stroke-width:2px,color:#166534
    style L5 fill:#ffffff,stroke:#78716c,stroke-width:1.5px,color:#292524`}
            />

            <div className="cc-md-quote" style={{ margin: '14px 0', borderLeftColor: '#16a34a' }}>
              <b>⚡ 免下载试玩区的设计秘诀：</b><br />
              很多软件要求用户必须先下载几十兆的安装包才能看到界面，流失率高达 80%！
              我们在官网主页中，通过 React 组件直接将客户端的核心工作区移植为只读/交互演示模式。访客无需下载任何文件，在手机或电脑浏览器里点一下，就能亲身感受雷达、芯片项目的分配大表，信任感瞬间拉满！
            </div>
          </section>
        </div>
      );

    case 'tutorial-release':
      return (
        <div>
          <div className="cc-cl-article-header">
            <h1>{isEn ? '4.5 Packaging, Multi-Distribution & CI/CD Pipeline' : '4.5 工程编译打包与自动化持续发布全景'}</h1>
            <span className="cc-cl-date">{isEn ? 'HengJi Design Masterclass · Chapter 5' : '衡绩设计教程 · 工程发布篇'}</span>
          </div>

          <p className="cc-cl-summary">
            {isEn
              ? 'From local source code to verified multi-format artifacts. Master the electron-builder matrix (MSI/EXE/Portable/ZIP), automated GitHub Releases with SHA-256 digests, and cache-busting GitHub Pages deployment.'
              : '写完代码只是完成了软件工程的一半，如何把软件打包成企业需要的格式并全自动发布到全世界？为什么企业必须要有 MSI？静态网站部署如何彻底解决浏览器缓存旧代码的问题？本章带你打通全套工程化发布流水线。'}
          </p>

          <hr className="cc-cl-divider" />

          {/* 1. 四大安装包选型 */}
          <section id="sec-tut-packages" className="cc-cl-sec">
            <h2>{isEn ? '1. Four Official Package Formats Explained' : '1. 四大官方桌面安装包（MSI/EXE/Portable/ZIP）选型指南'}</h2>
            
            <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
              许多独立开发者只提供一个简单的 EXE 文件，但企业用户下载后往往抱怨连连。衡绩针对不同使用场景，通过 <code>electron-builder</code> 编译出四大官方分发格式：
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', margin: '14px 0' }}>
              <div className="cc-doc-step-card">
                <span className="cc-doc-step-tag" style={{ background: '#10b981' }}>MSI 企业级</span>
                <h4 style={{ margin: '8px 0 4px', fontSize: '14px' }}>hengji.msi (约 75MB)</h4>
                <p style={{ fontSize: '12px', color: 'var(--cc-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  大型企业网管的最爱。通过 Windows Server 的 Active Directory 域策略（GPO）或 <code>msiexec /qn</code> 命令，一键静默推送到几百台办公电脑，员工开机即用。
                </p>
              </div>

              <div className="cc-doc-step-card">
                <span className="cc-doc-step-tag" style={{ background: '#0284c7' }}>EXE 向导版</span>
                <h4 style={{ margin: '8px 0 4px', fontSize: '14px' }}>hengji.exe (约 75MB)</h4>
                <p style={{ fontSize: '12px', color: 'var(--cc-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  经典图形向导版。支持自主选择安装盘符，自动创建开始菜单和桌面快捷方式，并提供完善的安全卸载器。
                </p>
              </div>

              <div className="cc-doc-step-card">
                <span className="cc-doc-step-tag" style={{ background: '#f59e0b' }}>Portable 便携</span>
                <h4 style={{ margin: '8px 0 4px', fontSize: '14px' }}>hengji-portable.exe (约 75MB)</h4>
                <p style={{ fontSize: '12px', color: 'var(--cc-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  单文件绿色版。无需任何管理员（Admin）提权，非常适合在受限电脑上运行，或存放在 U 盘里即插即用，拔掉即走不留痕迹。
                </p>
              </div>

              <div className="cc-doc-step-card">
                <span className="cc-doc-step-tag" style={{ background: '#8b5cf6' }}>ZIP 绿色包</span>
                <h4 style={{ margin: '8px 0 4px', fontSize: '14px' }}>hengji.zip (约 85MB)</h4>
                <p style={{ fontSize: '12px', color: 'var(--cc-text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  纯文件夹压缩包。解压到非系统盘（D盘或E盘）即可双击运行，绝不修改 Windows 系统注册表，适合内网批量归档。
                </p>
              </div>
            </div>
          </section>

          {/* 2. 自动化发布流水线 */}
          <section id="sec-tut-cicd" className="cc-cl-sec">
            <h2>{isEn ? '2. Automated Build & Deployment Pipeline' : '2. 命令行自动化构建与持续发布流水线全景图'}</h2>

            <p style={{ fontSize: '13.5px', color: 'var(--cc-text-secondary)', lineHeight: '1.6' }}>
              衡绩将全套编译、打包、测试与部署整合为自动化的 Node.js 脚本：
            </p>

            <MermaidDiagram
              title={isEn ? 'End-to-End Build & Deployment Flow' : '端到端全自动编译与持续发布流水线架构图'}
              subtitle={isEn ? 'Git Source ➔ 46 Unit Tests ➔ Vite Bundle ➔ Electron Builder ➔ Releases & Pages' : '源码暂存 ➔ 46项测试 ➔ 网页构建 ➔ 四格式桌面编译 ➔ GitHub 双发布'}
              chart={`flowchart LR
    Code["💻 本地 Git 源码 (main)"]
    --> Test["🧪 全自动单元测试 (npm test)<br/><i>(46项精算与安全测试 100% 通过)</i>"]
    --> BuildWeb["📦 前端 Bundle 生产构建 (Vite)"]
    
    BuildWeb --> ElectronBuild["🔨 electron-builder 多格式编译"]
    BuildWeb --> PagesBuild["🌐 官网静态站构建 (带防缓存哈希)"]

    subgraph Packages["四大官方桌面安装包"]
        P1["hengji.msi (企业域静默安装)"]
        P2["hengji.exe (经典安装向导)"]
        P3["hengji-portable.exe (单文件便携版)"]
        P4["hengji.zip (免安装绿色包)"]
    end

    ElectronBuild --> Packages
    Packages --> GHReleases["🚀 发布至 GitHub Releases (带 SHA-256 校验和)"]
    PagesBuild --> GHPages["🌍 部署至 GitHub Pages 静态网站"]

    style Code fill:#f8fafc,stroke:#64748b,stroke-width:1.5px
    style Test fill:#eff6ff,stroke:#2563eb,stroke-width:1.5px,color:#1e40af
    style BuildWeb fill:#fefce8,stroke:#ca8a04,stroke-width:1.5px,color:#854d0e
    style ElectronBuild fill:#fff7ed,stroke:#ea580c,stroke-width:1.5px,color:#9a3412
    style PagesBuild fill:#fdf4ff,stroke:#a855f7,stroke-width:1.5px,color:#7e22ce
    style Packages fill:#f0fdf4,stroke:#16a34a,stroke-width:1.5px
    style GHReleases fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#15803d
    style GHPages fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1d4ed8`}
            />

            <div className="cc-md-quote" style={{ margin: '14px 0', borderLeftColor: '#0284c7' }}>
              <b>💡 终极全自动连击流水线：</b><br />
              只需在终端运行以下单行命令，就能在 3 分钟内全自动跑完单元测试、编译三大安装包、压缩 ZIP、编译官网并发布上线：
            </div>

            <MarkdownCodeCard
              lang="POWERSHELL"
              code={`# 纯命令行全自动全流程连击流水线\nnpm test && npx vite build --config vite.desktop.config.ts && npx electron-builder --win nsis msi portable --x64 && node scripts/build-zip.mjs && npm run pages:build && node scripts/publish-release-github.mjs && node scripts/deploy-pages.mjs`}
              copyKey="tut-cmd-oneliner"
              onCopyText={onCopyText}
              copiedKey={copiedKey}
            />
          </section>
        </div>
      );

    default:
      return null;
  }
}
