import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { Plus, Folder, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../lib/utils';
import { motion } from 'motion/react';

export function Home() {
  const { projects } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto">
      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center space-y-4"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
          Tubeboard
        </h1>
        <p className="text-xl text-text-muted max-w-2xl mx-auto">
          Analyze YouTube videos with the power of Gemini. Transcribe, quiz, and chat with your content.
        </p>
        
        <div className="pt-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-black font-bold rounded-2xl hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg shadow-primary/20"
          >
            <Plus size={24} />
            New Project
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={`/project/${project.id}`}
              className="group block p-6 bg-card border border-white/5 rounded-3xl hover:border-secondary/50 transition-all hover:shadow-2xl hover:shadow-secondary/10 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-secondary/20 group-hover:text-secondary transition-colors">
                    <Folder size={24} />
                  </div>
                  <span className="text-xs font-mono text-text-muted bg-black/20 px-2 py-1 rounded-lg">
                    {formatDateTime(project.createdAt)}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-secondary transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-text-muted line-clamp-2 mb-4">
                  {project.videoUrl}
                </p>
                
                <div className="flex items-center gap-2 text-sm font-medium text-text-muted group-hover:text-white transition-colors">
                  Open Project <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
        
        {projects.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
            <p className="text-text-muted">No projects found. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
