import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Youtube, Plus } from 'lucide-react';

export function CreateProjectModal() {
  const { createProject, isCreateModalOpen, closeCreateModal } = useApp();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isCreateModalOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isCreateModalOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && url) {
      createProject(name, url);
      setName('');
      setUrl('');
      closeCreateModal();
    }
  };

  const handleClose = () => {
    closeCreateModal();
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className="backdrop:bg-black/60 backdrop:backdrop-blur-sm bg-transparent p-0 open:animate-in open:fade-in open:zoom-in duration-200"
    >
      <div className="w-full max-w-md rounded-2xl bg-card p-6 border border-white/10 shadow-2xl relative text-left">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={20} aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-secondary/20 text-secondary">
            <Youtube size={24} aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-white">New Project</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-text-muted mb-1">
              YouTube URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-4 py-3 rounded-xl bg-bg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
              required
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-muted mb-1">
              Project Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Physics Lecture 101"
              className="w-full px-4 py-3 rounded-xl bg-bg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
              required
              aria-required="true"
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-secondary text-white font-bold hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
            aria-label="Create Project"
          >
            <Plus size={20} aria-hidden="true" />
            Create Project
          </button>
        </form>
      </div>
    </dialog>
  );
}
