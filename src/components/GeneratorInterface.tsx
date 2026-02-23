import React, { useState } from 'react';
import { useApp, GenerationType } from '../context/AppContext';
import { GeminiService, SCHEMAS } from '../lib/gemini';
import { Loader2, FileText, Clapperboard, BrainCircuit, ListVideo, Settings } from 'lucide-react';
import { cn, GEMINI_MODELS } from '../lib/utils';

interface GeneratorInterfaceProps {
  projectId: string;
  videoUrl: string;
}

export function GeneratorInterface({ projectId, videoUrl }: GeneratorInterfaceProps) {
  const { addGeneration, apiKey, selectedModel } = useApp();
  const [isGenerating, setIsGenerating] = useState<GenerationType | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleGenerate = async (type: GenerationType) => {
    if (!apiKey) return;
    setIsGenerating(type);

    try {
      const service = new GeminiService(apiKey);
      let prompt = '';
      let schema = undefined;
      let model = selectedModel; // Use global selected model by default

      // Override model for complex tasks if needed, or stick to user selection?
      // User requested "give controls to select the model".
      // However, some tasks like complex JSON might fail on Flash Lite.
      // I will respect the user selection but maybe warn or fallback if strictly necessary?
      // Actually, 2.5 Flash is very capable. 3.1 Pro is better.
      // Let's use the selected model, but for advanced schemas, maybe we should suggest Pro?
      // For now, I will use the selected model for everything as requested.
      
      switch (type) {
        case 'TRANSCRIPT_SIMPLE':
          prompt = "Transcribe this video. Provide the full text.";
          break;
        case 'TRANSCRIPT_ADVANCED':
          prompt = "Transcribe this video with timestamps, speaker identification, and detailed metadata for each segment.";
          schema = SCHEMAS.TRANSCRIPTION_ADVANCED;
          break;
        case 'SCENE_DESC':
          prompt = "Analyze the video and provide detailed scene descriptions with timestamps, key objects, and mood.";
          schema = SCHEMAS.SCENE_DESCRIPTION;
          break;
        case 'QUIZ':
          prompt = "Create a comprehensive quiz based on the video content. Include multiple choice, short answer, and true/false questions.";
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
          // Fallback to text if JSON parsing fails
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
        <button
          onClick={() => handleGenerate('DESC')}
          disabled={!!isGenerating}
          className="flex flex-col items-center justify-center p-6 bg-card border border-white/5 rounded-2xl hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          aria-label="Generate Video Description"
        >
          <div className="p-3 rounded-full bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
            <FileText size={24} aria-hidden="true" />
          </div>
          <span className="font-bold text-white">Describe Video</span>
          <span className="text-xs text-text-muted mt-1">Summary & Overview</span>
          {isGenerating === 'DESC' && <Loader2 size={16} className="animate-spin mt-2 text-primary" aria-hidden="true" />}
        </button>

        <button
          onClick={() => handleGenerate('TRANSCRIPT_SIMPLE')}
          disabled={!!isGenerating}
          className="flex flex-col items-center justify-center p-6 bg-card border border-white/5 rounded-2xl hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          aria-label="Generate Simple Transcript"
        >
          <div className="p-3 rounded-full bg-secondary/10 text-secondary mb-3 group-hover:scale-110 transition-transform">
            <ListVideo size={24} aria-hidden="true" />
          </div>
          <span className="font-bold text-white">Simple Transcript</span>
          <span className="text-xs text-text-muted mt-1">Plain text transcription</span>
          {isGenerating === 'TRANSCRIPT_SIMPLE' && <Loader2 size={16} className="animate-spin mt-2 text-secondary" aria-hidden="true" />}
        </button>

        <button
          onClick={() => handleGenerate('TRANSCRIPT_ADVANCED')}
          disabled={!!isGenerating}
          className="flex flex-col items-center justify-center p-6 bg-card border border-white/5 rounded-2xl hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
          aria-label="Generate Advanced Transcript"
        >
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-secondary text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
            Pro
          </div>
          <div className="p-3 rounded-full bg-secondary/10 text-secondary mb-3 group-hover:scale-110 transition-transform">
            <ListVideo size={24} aria-hidden="true" />
          </div>
          <span className="font-bold text-white">Advanced Transcript</span>
          <span className="text-xs text-text-muted mt-1">Timestamps & Speakers</span>
          {isGenerating === 'TRANSCRIPT_ADVANCED' && <Loader2 size={16} className="animate-spin mt-2 text-secondary" aria-hidden="true" />}
        </button>

        <button
          onClick={() => handleGenerate('SCENE_DESC')}
          disabled={!!isGenerating}
          className="flex flex-col items-center justify-center p-6 bg-card border border-white/5 rounded-2xl hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          aria-label="Generate Scene Description"
        >
          <div className="p-3 rounded-full bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
            <Clapperboard size={24} aria-hidden="true" />
          </div>
          <span className="font-bold text-white">Scene Description</span>
          <span className="text-xs text-text-muted mt-1">Visual analysis per scene</span>
          {isGenerating === 'SCENE_DESC' && <Loader2 size={16} className="animate-spin mt-2 text-primary" aria-hidden="true" />}
        </button>

        <button
          onClick={() => handleGenerate('QUIZ')}
          disabled={!!isGenerating}
          className="flex flex-col items-center justify-center p-6 bg-card border border-white/5 rounded-2xl hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          aria-label="Generate Quiz"
        >
          <div className="p-3 rounded-full bg-secondary/10 text-secondary mb-3 group-hover:scale-110 transition-transform">
            <BrainCircuit size={24} aria-hidden="true" />
          </div>
          <span className="font-bold text-white">Generate Quiz</span>
          <span className="text-xs text-text-muted mt-1">Test your knowledge</span>
          {isGenerating === 'QUIZ' && <Loader2 size={16} className="animate-spin mt-2 text-secondary" aria-hidden="true" />}
        </button>
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
    </div>
  );
}
