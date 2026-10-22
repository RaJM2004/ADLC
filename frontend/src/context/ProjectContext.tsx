import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { Project } from '../types';

interface ProjectContextType {
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  activeProject: Project | undefined;
  loading: boolean;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectIdState] = useState<string>(() => {
    return localStorage.getItem('adlc_selected_project_id') || '';
  });
  const [loading, setLoading] = useState<boolean>(true);

  const setSelectedProjectId = (id: string) => {
    setSelectedProjectIdState(id);
    if (id) {
      localStorage.setItem('adlc_selected_project_id', id);
    }
  };

  const refreshProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.listProjects();
      const items = res.items || [];
      setProjects(items);

      setSelectedProjectIdState((current) => {
        if (current && items.some((p) => p.id === current)) {
          return current;
        }
        const stored = localStorage.getItem('adlc_selected_project_id');
        if (stored && items.some((p) => p.id === stored)) {
          return stored;
        }
        const demo = items.find((p) => p.is_demo);
        const fallback = demo ? demo.id : (items[0]?.id || '');
        if (fallback) {
          localStorage.setItem('adlc_selected_project_id', fallback);
        }
        return fallback;
      });
    } catch (err) {
      console.error('Failed to load projects in ProjectContext:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProjectId,
        setSelectedProjectId,
        activeProject,
        loading,
        refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
