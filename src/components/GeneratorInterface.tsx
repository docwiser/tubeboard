import React, { useState, useRef, useEffect } from 'react';
import { useApp, GenerationType } from '../context/AppContext';
import { GeminiService, SCHEMAS } from '../lib/gemini';
import { Loader2, FileText, Clapperboard, BrainCircuit, ListVideo, Settings, X, Play } from 'lucide-react';
import { cn } from '../lib/utils';

interface GeneratorInterfaceProps {
  projectId: string;
  videoUrl: string;
}

interface CustomizationParams {
  numQuestions?: number;
  difficulty?: string;
  detailLevel?: string;
  includeTimestamps?: boolean;
}

export function GeneratorInterface({ projectId, videoUrl }: GeneratorInterfaceProps) {
  const { addGeneration, apiKey, selectedModel } = useApp();
  const [isGenerating, setIsGenerating] = useState<GenerationType | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Modal State
  const [activeModal, setActiveModal] = useState<GenerationType | null>(null);
  const [params, setParams] = useState<CustomizationParams>({
    numQuestions: 5,
    difficulty: 'medium',
    detailLevel: 'standard',
    includeTimestamps: true,
  });
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (activeModal) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [activeModal]);

  const openModal = (type: GenerationType) => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleGenerate = async () => {
    if (!apiKey || !activeModal) return;
    const type = activeModal;
    closeModal();
    setIsGenerating(type);

    try {
      const service = new GeminiService(apiKey);
      let prompt = '';
      let schema = undefined;
      let model = selectedModel;

      switch (type) {
        case 'TRANSCRIPT_SIMPLE':
          prompt = "Transcribe this video. Provide the full text.";
          break;
        case 'TRANSCRIPT_ADVANCED':
          prompt = `Transcribe this video with timestamps, speaker identification, and detailed metadata for each segment. ${params.includeTimestamps ? 'Include precise timestamps.' : ''}`;
          schema = SCHEMAS.TRANSCRIPTION_ADVANCED;
          break;
        case 'SCENE_DESC':
          prompt = `Analyze the video and provide detailed scene descriptions with timestamps, key objects, and mood. Detail level: ${params.detailLevel}.`;
          schema = SCHEMAS.SCENE_DESCRIPTION;
          break;
        case 'QUIZ':
          prompt = `Create a comprehensive quiz based on the video content. Generate ${params.numQuestions} questions. Difficulty: ${params.difficulty}. Include multiple choice, short answer, and true/false questions.`;
          schema = SCHEMAS.QUIZ;
          break;
        case 'DESC':
          prompt = "Provide a detailed description and summary of this video.";
          break;
      }

      if (customPrompt) {
        prompt += `\n\nAdditional instructions: ${customPrompt}`;
      }

      const result = await service.generate(model, prompt, videoUrl, schema);

      let content = result.text;
      if (schema) {
        try {
          content = JSON.parse(result.text);
        } catch (e) {
          console.error("Failed to parse JSON:", e);
        }
      }

      addGeneration(projectId, {
        type,
        content,
        model,
        tokens: {
          input: result.usage?.promptTokenCount || 0,
          output: result.usage?.candidatesTokenCount || 0,
        },
      });
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate content. Please check your API key and try again.");
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-white animate-in fade-in duration-200">
          <Loader2 size={48} className="animate-spin text-primary mb-4" />
          <p className="font-bold text-lg">Generating Content...</p>
          <p className="text-sm text-text-muted">This may take a moment.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
        <GeneratorButton
          icon={<FileText size={24} aria-hidden="true" />}
          label="Describe Video"
          subLabel="Summary & Overview"
          onClick={() => openModal('DESC')}
          disabled={!!isGenerating}
          color="primary"
        />
        <GeneratorButton
          icon={<ListVideo size={24} aria-hidden="true" />}
          label="Simple Transcript"
          subLabel="Plain text transcription"
          onClick={() => openModal('TRANSCRIPT_SIMPLE')}
          disabled={!!isGenerating}
          color="secondary"
        />
        <GeneratorButton
          icon={<ListVideo size={24} aria-hidden="true" />}
          label="Advanced Transcript"
          subLabel="Timestamps & Speakers"
          onClick={() => openModal('TRANSCRIPT_ADVANCED')}
          disabled={!!isGenerating}
          color="secondary"
          badge="Pro"
        />
        <GeneratorButton
          icon={<Clapperboard size={24} aria-hidden="true" />}
          label="Scene Description"
          subLabel="Visual analysis per scene"
          onClick={() => openModal('SCENE_DESC')}
          disabled={!!isGenerating}
          color="primary"
        />
        <GeneratorButton
          icon={<BrainCircuit size={24} aria-hidden="true" />}
          label="Generate Quiz"
          subLabel="Test your knowledge"
          onClick={() => openModal('QUIZ')}
          disabled={!!isGenerating}
          color="secondary"
        />
      </div>

      <div className="bg-card border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2 text-text-muted">
          <Settings size={16} aria-hidden="true" />
          <label htmlFor="customPrompt" className="text-sm font-medium">Custom Instructions (Optional)</label>
        </div>
        <textarea
          id="customPrompt"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="E.g., Focus on the mathematical concepts..."
          className="w-full h-20 bg-bg border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
        />
      </div>

      {/* Customization Modal */}
      <dialog
        ref={dialogRef}
        onClose={closeModal}
        className="backdrop:bg-black/60 backdrop:backdrop-blur-sm bg-transparent p-0 open:animate-in open:fade-in open:zoom-in duration-200"
      >
        <div className="w-full max-w-md rounded-2xl bg-card p-6 border border-white/10 shadow-2xl text-left relative">
          <button 
            onClick={closeModal}
            className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={20} aria-hidden="true" />
          </button>

          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Settings size={20} className="text-primary" />
            Customize Generation
          </h2>

          <div className="space-y-6">
            {activeModal === 'QUIZ' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Number of Questions</label>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    value={params.numQuestions}
                    onChange={(e) => setParams({ ...params, numQuestions: parseInt(e.target.value) })}
                    className="w-full accent-primary"
                  />
                  <div className="text-right text-xs text-white font-mono mt-1">{params.numQuestions} Questions</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Difficulty</label>
                  <div className="flex gap-2">
                    {['easy', 'medium', 'hard'].map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setParams({ ...params, difficulty: diff })}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors border",
                          params.difficulty === diff
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-white/5 border-transparent text-text-muted hover:bg-white/10"
                        )}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeModal === 'SCENE_DESC' && (
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Detail Level</label>
                <select
                  value={params.detailLevel}
                  onChange={(e) => setParams({ ...params, detailLevel: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="brief" className="bg-card">Brief</option>
                  <option value="standard" className="bg-card">Standard</option>
                  <option value="detailed" className="bg-card">Detailed</option>
                </select>
              </div>
            )}

            {(activeModal === 'TRANSCRIPT_ADVANCED' || activeModal === 'TRANSCRIPT_SIMPLE') && (
               <div className="flex items-center gap-3">
                 <input
                   type="checkbox"
                   id="timestamps"
                   checked={params.includeTimestamps}
                   onChange={(e) => setParams({ ...params, includeTimestamps: e.target.checked })}
                   className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50"
                 />
                 <label htmlFor="timestamps" className="text-sm text-white">Include Timestamps</label>
               </div>
            )}

            {activeModal === 'DESC' && (
              <p className="text-sm text-text-muted">
                Generate a comprehensive summary and description of the video content.
              </p>
            )}

            <button
              onClick={handleGenerate}
              className="w-full py-3 px-4 rounded-xl bg-primary text-black font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <Play size={18} fill="currentColor" />
              Start Generation
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

function GeneratorButton({ icon, label, subLabel, onClick, disabled, color, badge }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center justify-center p-6 bg-card border border-white/5 rounded-2xl hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden text-center"
      aria-label={label}
    >
      {badge && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-secondary text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
          {badge}
        </div>
      )}
      <div className={cn(
        "p-3 rounded-full mb-3 group-hover:scale-110 transition-transform",
        color === 'primary' ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
      )}>
        {icon}
      </div>
      <span className="font-bold text-white">{label}</span>
      <span className="text-xs text-text-muted mt-1">{subLabel}</span>
    </button>
  );
}
