import type { State, ProjectGroup, WorkspaceType } from '../lib/core';
type WorkspaceData = {
  open: true;
  name: string;
  revision: number;
  actorId: string;
  workspaceType?: WorkspaceType;
  ownerEmployeeId?: string;
  ownerEmployeeName?: string;
  state: State;
  projectGroups: ProjectGroup[];
  filePath: string;
};
export type UpdateProgressPayload = {
  status: 'locating' | 'downloading' | 'installing' | 'done' | 'error';
  format?: string;
  percent?: number;
  transferredMB?: string;
  totalMB?: string;
  message?: string;
};
declare global { interface Window { meritDesktop: {
  status(): Promise<({ open: false } | WorkspaceData) & { hasLegacyData?: boolean }>;
  chooseOpen(): Promise<string | null>;
  open(payload: { filePath: string; password: string }): Promise<WorkspaceData>;
  create(payload: { name: string; password: string; workspaceType?: WorkspaceType; ownerEmployeeId?: string; ownerEmployeeName?: string; state: State; projectGroups: ProjectGroup[] }): Promise<WorkspaceData | null>;
  save(payload: { name: string; revision: number; actorId: string; workspaceType?: WorkspaceType; ownerEmployeeId?: string; ownerEmployeeName?: string; state: State; projectGroups: ProjectGroup[] }): Promise<WorkspaceData>;
  saveAs(payload: { name: string; revision: number; actorId: string; workspaceType?: WorkspaceType; ownerEmployeeId?: string; ownerEmployeeName?: string; state: State; projectGroups: ProjectGroup[] }): Promise<WorkspaceData | null>;
  exportBase(payload: { state: State; projectGroups: ProjectGroup[] }): Promise<boolean>;
  importBase(): Promise<{ employees: State['employees']; projectGroups: ProjectGroup[] } | null>;
  lock(): Promise<boolean>;
  exportCsv(payload: { content: string; defaultPath: string }): Promise<boolean>;
  showData(): Promise<void>;
  refocusWindow?(): Promise<boolean>;
  openUrl?(url: string): Promise<boolean>;
  getDefaultInstallDir?(): Promise<string>;
  chooseInstallDir?(defaultPath?: string): Promise<string | null>;
  onUpdateProgress?(callback: (data: UpdateProgressPayload) => void): () => void;
  downloadUpdate?(payload: { version: string; downloadUrl?: string; format?: 'exe' | 'msi' | 'portable' | 'setup' | 'zip'; targetDir?: string }): Promise<{ success: boolean; filePath: string; folder: string; fileName: string; format?: string }>;
  installUpdate?(payload: { version: string; downloadUrl?: string; format?: 'exe' | 'msi' | 'portable' | 'setup' | 'zip'; installDir?: string; filePath?: string }): Promise<{ success: boolean; message?: string; installDir?: string }>;
  showItemInFolder?(filePath: string): Promise<boolean>;
  openPath?(filePath: string): Promise<boolean>;
} } }
export {};
