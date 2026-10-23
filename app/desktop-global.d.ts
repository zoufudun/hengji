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
  downloadUpdate?(payload: { version: string; downloadUrl?: string; format?: 'exe' | 'msi' | 'portable' | 'setup' | 'zip' }): Promise<{ success: boolean; filePath: string; folder: string; fileName: string }>;
  installUpdate?(payload: { version: string; downloadUrl?: string; format?: 'exe' | 'msi' | 'portable' | 'setup' | 'zip' }): Promise<{ success: boolean; message?: string }>;
  showItemInFolder?(filePath: string): Promise<boolean>;
  openPath?(filePath: string): Promise<boolean>;
} } }
export {};
