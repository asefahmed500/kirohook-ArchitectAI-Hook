import { create } from 'zustand';

export interface AnalysisEntry {
  id: string;
  filePath: string;
  timestamp: string;
  components: string[];
  services: string[];
  apiRoutes: string[];
  models: string[];
}

export interface DocState {
  lastAnalysis: string | null;
  totalFilesScanned: number;
  analysisHistory: AnalysisEntry[];
  architecture: string;
  apiDocs: string;
  changelog: string;
  testing: string;
  diagram: string;
  isAnalyzing: boolean;
  setLastAnalysis: (time: string) => void;
  incrementFilesScanned: () => void;
  addAnalysisEntry: (entry: AnalysisEntry) => void;
  setDocs: (docs: Partial<Pick<DocState, 'architecture' | 'apiDocs' | 'changelog' | 'testing' | 'diagram'>>) => void;
  setIsAnalyzing: (v: boolean) => void;
}

export const useDocStore = create<DocState>((set) => ({
  lastAnalysis: null,
  totalFilesScanned: 0,
  analysisHistory: [],
  architecture: '',
  apiDocs: '',
  changelog: '',
  testing: '',
  diagram: '',
  isAnalyzing: false,
  setLastAnalysis: (time) => set({ lastAnalysis: time }),
  incrementFilesScanned: () => set((s) => ({ totalFilesScanned: s.totalFilesScanned + 1 })),
  addAnalysisEntry: (entry) =>
    set((s) => ({ analysisHistory: [entry, ...s.analysisHistory].slice(0, 50) })),
  setDocs: (docs) => set(docs),
  setIsAnalyzing: (v) => set({ isAnalyzing: v }),
}));
