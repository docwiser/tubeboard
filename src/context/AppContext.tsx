import React, { createContext, useContext, useEffect, useState } from 'react';
import { calculateCost, GEMINI_MODELS } from '../lib/utils';

export type GenerationType = 'TRANSCRIPT_SIMPLE' | 'TRANSCRIPT_ADVANCED' | 'SCENE_DESC' | 'QUIZ' | 'DESC';

export interface Generation {
  id: string;
  type: GenerationType;
  content: any;
  createdAt: string;
  model: string;
  tokens: { input: number; output: number };
  cost: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  videoUrl: string;
  createdAt: string;
  generations: Generation[];
  chatHistory: ChatMessage[];
}

export interface CostEntry {
  id: string;
  projectId: string;
  projectName: string;
  type: string;
  model: string;
  tokens: { input: number; output: number };
  cost: number;
  timestamp: string;
}

interface AppContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  projects: Project[];
  createProject: (name: string, videoUrl: string) => void;
  deleteProject: (id: string) => void;
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  addGeneration: (projectId: string, generation: Omit<Generation, 'id' | 'createdAt' | 'cost'>) => void;
  addChatMessage: (projectId: string, message: ChatMessage) => void;
  costHistory: CostEntry[];
  totalCost: number;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(() => {
    return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('tubeboard_api_key') || null;
  });

  const [selectedModel, setSelectedModel] = useState<string>(GEMINI_MODELS.FLASH_2_5);

  const [projects, setProjects] = useState<Project[]>(() => {
    const stored = localStorage.getItem('tubeboard_projects');
    return stored ? JSON.parse(stored) : [];
  });

  const [costHistory, setCostHistory] = useState<CostEntry[]>(() => {
    const stored = localStorage.getItem('tubeboard_cost_history');
    return stored ? JSON.parse(stored) : [];
  });

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (apiKey) localStorage.setItem('tubeboard_api_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('tubeboard_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('tubeboard_cost_history', JSON.stringify(costHistory));
  }, [costHistory]);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
  };

  const createProject = (name: string, videoUrl: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      videoUrl,
      createdAt: new Date().toISOString(),
      generations: [],
      chatHistory: [],
    };
    setProjects((prev) => [newProject, ...prev]);
    setCurrentProjectId(newProject.id);
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (currentProjectId === id) setCurrentProjectId(null);
  };

  const addGeneration = (projectId: string, gen: Omit<Generation, 'id' | 'createdAt' | 'cost'>) => {
    const cost = calculateCost(gen.model, gen.tokens.input, gen.tokens.output);
    const newGen: Generation = {
      ...gen,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      cost,
    };

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, generations: [newGen, ...p.generations] } : p
      )
    );

    const project = projects.find(p => p.id === projectId);
    const newCostEntry: CostEntry = {
      id: crypto.randomUUID(),
      projectId,
      projectName: project?.name || 'Unknown',
      type: gen.type,
      model: gen.model,
      tokens: gen.tokens,
      cost,
      timestamp: new Date().toISOString(),
    };
    setCostHistory(prev => [newCostEntry, ...prev]);
  };

  const addChatMessage = (projectId: string, message: ChatMessage) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, chatHistory: [...p.chatHistory, message] }
          : p
      )
    );
  };

  const currentProject = projects.find((p) => p.id === currentProjectId) || null;
  const totalCost = costHistory.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <AppContext.Provider
      value={{
        apiKey,
        setApiKey,
        projects,
        createProject,
        deleteProject,
        currentProject,
        setCurrentProject: (p) => setCurrentProjectId(p?.id || null),
        addGeneration,
        addChatMessage,
        costHistory,
        totalCost,
        selectedModel,
        setSelectedModel,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
