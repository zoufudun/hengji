import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: '衡绩 · 员工绩点考核系统', description: '让每一份项目贡献，都有据可衡。项目、系数与月度绩点一体化管理。' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
