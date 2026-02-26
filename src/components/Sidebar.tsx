import React, { useState, useEffect } from 'react';
import { useApp, TTSSettings } from '../context/AppContext';
import { GEMINI_MODELS, MODEL_LABELS } from '../lib/utils';
import { X, Settings, Home, DollarSign, Volume2, Mic, Plus, Trash2, FolderOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { 
    projects, 
    createProject, 
    deleteProject, 
    currentProject, 
    setCurrentProject,
    selectedModel,
    setSelectedModel,
    exchangeRate,
    setExchangeRate,
    ttsSettings,
    setTtsSettings
  } = useApp();
  
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleProjectClick = (project: any) => {
    setCurrentProject(project);
    navigate(`/project/${project.id}`);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-80 bg-card border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-primary">Tube</span>board
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-text-muted hover:text-white transition-colors"
            aria-label="Close Sidebar"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8">
          {/* Navigation */}
          <nav className="space-y-2">
            <Link 
              to="/" 
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-colors"
            >
              <Home size={18} aria-hidden="true" />
              <span className="font-medium">Home</span>
            </Link>
            <Link 
              to="/costs" 
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-colors"
            >
              <DollarSign size={18} aria-hidden="true" />
              <span className="font-medium">Cost Breakdown</span>
            </Link>
          </nav>

          {/* Projects */}
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Projects</h3>
              <button 
                onClick={() => {
                  // Trigger create modal logic (needs to be lifted or handled via context/global event)
                  // For now, we might need to pass a prop or use a global modal manager
                  // But since CreateProjectModal is in Layout, we can't easily trigger it from here without prop drilling
                  // Let's assume we can navigate to home and open it, or just use a simple prompt for now
                  // Actually, the user asked for the sidebar to be a modal dialog.
                  // Let's just use a simple prompt here or navigate to home?
                  // The original app had a create button in sidebar.
                  // We'll reimplement a simple create flow here or emit an event.
                  const url = prompt("Enter YouTube URL:");
                  if (url) {
                    const name = prompt("Enter Project Name:") || "Untitled Project";
                    createProject(name, url);
                  }
                }}
                className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                aria-label="New Project"
              >
                <Plus size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-1">
              {projects.map((project) => (
                <div key={project.id} className="group flex items-center gap-2">
                  <button
                    onClick={() => handleProjectClick(project)}
                    className={cn(
                      "flex-1 flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-colors text-left truncate",
                      currentProject?.id === project.id 
                        ? "bg-white/10 text-white font-medium" 
                        : "text-text-muted hover:text-white hover:bg-white/5"
                    )}
                  >
                    <FolderOpen size={16} className={cn(
                      "shrink-0", 
                      currentProject?.id === project.id ? "text-primary" : "text-text-muted"
                    )} aria-hidden="true" />
                    <span className="truncate">{project.name}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this project?')) deleteProject(project.id);
                    }}
                    className="p-2 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Delete ${project.name}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Settings Section */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider px-2 flex items-center gap-2">
              <Settings size={14} /> Settings
            </h3>
            
            <div className="space-y-4 px-2">
              {/* Model Selection */}
              <div className="space-y-2">
                <label className="text-xs text-text-muted">Gemini Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  {Object.values(GEMINI_MODELS).map((model) => (
                    <option key={model} value={model} className="bg-card text-white">
                      {Object.entries(MODEL_LABELS).find(([k, v]) => k === model)?.[1] || model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Exchange Rate */}
              <div className="space-y-2">
                <label className="text-xs text-text-muted">Exchange Rate (1 USD = ₹)</label>
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>

              {/* TTS Settings */}
              <div className="space-y-3">
                <label className="text-xs text-text-muted flex items-center gap-2">
                  <Volume2 size={14} /> Text-to-Speech
                </label>
                
                <select
                  value={ttsSettings.voiceURI || ''}
                  onChange={(e) => setTtsSettings({ ...ttsSettings, voiceURI: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                >
                  <option value="">Default Voice</option>
                  {voices.map((voice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-text-muted">Rate: {ttsSettings.rate}</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={ttsSettings.rate}
                      onChange={(e) => setTtsSettings({ ...ttsSettings, rate: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted">Pitch: {ttsSettings.pitch}</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={ttsSettings.pitch}
                      onChange={(e) => setTtsSettings({ ...ttsSettings, pitch: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
