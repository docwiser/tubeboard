import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Home, Folder, Trash2, PlusCircle, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const { projects, deleteProject, currentProject, setCurrentProject } = useApp();
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-card border-r border-white/5 flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-2xl tracking-tighter">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-black">
            <span className="text-xl">T</span>
          </div>
          Tubeboard
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 px-2">Menu</h3>
          <nav className="space-y-1">
            <Link
              to="/"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                location.pathname === "/" ? "bg-white/10 text-white" : "text-text-muted hover:text-white hover:bg-white/5"
              )}
            >
              <Home size={18} />
              Home
            </Link>
            <Link
              to="/cost"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                location.pathname === "/cost" ? "bg-white/10 text-white" : "text-text-muted hover:text-white hover:bg-white/5"
              )}
            >
              <DollarSign size={18} />
              Cost Breakdown
            </Link>
          </nav>
        </div>

        <div>
          <div className="flex items-center justify-between px-2 mb-3">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Projects</h3>
          </div>
          
          <div className="space-y-1">
            {projects.length === 0 ? (
              <div className="px-3 py-4 text-center border border-dashed border-white/10 rounded-xl">
                <p className="text-xs text-text-muted">No projects yet</p>
              </div>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="group relative flex items-center">
                  <Link
                    to={`/project/${project.id}`}
                    onClick={() => setCurrentProject(project)}
                    className={cn(
                      "flex-1 flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors truncate pr-8",
                      location.pathname === `/project/${project.id}` 
                        ? "bg-secondary/20 text-secondary" 
                        : "text-text-muted hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Folder size={16} className={cn(
                      location.pathname === `/project/${project.id}` ? "text-secondary" : "text-text-muted"
                    )} />
                    <span className="truncate">{project.name}</span>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm('Delete this project?')) deleteProject(project.id);
                    }}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 text-text-muted hover:text-red-500 transition-all"
                    aria-label="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-black">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">User</p>
            <p className="text-xs text-text-muted truncate">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
