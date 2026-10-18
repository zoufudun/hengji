import React from 'react';
import { createRoot } from 'react-dom/client';
import DesktopApp from './desktop-workspace';
import './desktop.css';

window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Rejection]', event.reason);
});

// Windows/Electron 焦点自动恢复：保证点击或输入表单时 WebContents 处于硬件激活对焦状态，避免输入框偶发假死
if (typeof window !== 'undefined') {
  window.addEventListener('mousedown', () => {
    if (window.meritDesktop?.refocusWindow) {
      window.meritDesktop.refocusWindow();
    }
  }, { passive: true });

  document.addEventListener('focusin', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
      if (window.meritDesktop?.refocusWindow) {
        window.meritDesktop.refocusWindow();
      }
    }
  }, { passive: true });

  // 避免原生 alert/confirm 弹出后 Windows 丢失键盘焦点导致输入框无法输入
  const origAlert = window.alert;
  window.alert = function(...args) {
    const res = origAlert.apply(window, args);
    setTimeout(() => {
      window.focus();
      if (window.meritDesktop?.refocusWindow) {
        window.meritDesktop.refocusWindow();
      }
    }, 50);
    return res;
  };

  const origConfirm = window.confirm;
  window.confirm = function(...args) {
    const res = origConfirm.apply(window, args);
    setTimeout(() => {
      window.focus();
      if (window.meritDesktop?.refocusWindow) {
        window.meritDesktop.refocusWindow();
      }
    }, 50);
    return res;
  };
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary caught error]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px',
          background: '#f8fafc',
          color: '#0f172a',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '680px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #fee2e2',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
            padding: '28px',
          }}>
            <h2 style={{ margin: '0 0 12px', color: '#dc2626', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚠️ 系统启动或渲染发生异常
            </h2>
            <p style={{ margin: '0 0 16px', color: '#475569', fontSize: '14px', lineHeight: 1.6 }}>
              系统已自动拦截异常以保护数据安全。请查看下方错误详细信息：
            </p>
            <pre style={{
              background: '#fef2f2',
              color: '#991b1b',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              overflow: 'auto',
              maxHeight: '260px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              border: '1px solid #fecaca'
            }}>
              {this.state.error?.message || '未知渲染错误'}
              {'\n\n'}
              {this.state.error?.stack}
            </pre>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#0f766e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                🔄 刷新重试
              </button>
              <button
                onClick={() => {
                  try { localStorage.clear(); } catch {}
                  window.location.reload();
                }}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '13.5px',
                  cursor: 'pointer'
                }}
              >
                🧹 清理前端缓存并重启
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <DesktopApp />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
