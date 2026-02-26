import React, { useState } from 'react';
import { Generation, GenerationType } from '../context/AppContext';
import { Download, ChevronDown, ChevronUp, Play, CheckCircle, XCircle, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface ResultDisplayProps {
  generation: Generation;
  onSeek?: (time: number) => void;
}

export function ResultDisplay({ generation, onSeek }: ResultDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = (format: 'json' | 'csv' | 'xlsx') => {
    let data: any[] = [];
    let filename = `tubeboard-${generation.type}-${new Date().toISOString()}`;

    // Prepare data based on type
    if (generation.type === 'TRANSCRIPT_ADVANCED') {
      data = generation.content.segments || [];
    } else if (generation.type === 'SCENE_DESC') {
      data = generation.content.scenes || [];
    } else if (generation.type === 'QUIZ') {
      data = generation.content.questions || [];
    } else if (generation.type === 'FLASHCARDS') {
      data = generation.content.flashcards || [];
    } else {
      data = [{ content: generation.content }];
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      a.click();
    } else {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      
      if (format === 'csv') {
        XLSX.writeFile(wb, `${filename}.csv`, { bookType: 'csv' });
      } else {
        XLSX.writeFile(wb, `${filename}.xlsx`);
      }
    }
    setShowExportMenu(false);
  };

  return (
    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden mb-6">
      <div 
        className="flex items-center justify-between p-4 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg text-white",
            generation.type.includes('TRANSCRIPT') ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"
          )}>
            {generation.type === 'QUIZ' ? 'Quiz' : generation.type === 'SCENE_DESC' ? 'Scenes' : 'Transcript'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white capitalize">
              {generation.type.replace('_', ' ').toLowerCase()}
            </h3>
            <p className="text-xs text-text-muted font-mono">
              {new Date(generation.createdAt).toLocaleTimeString()} • {generation.model}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowExportMenu(!showExportMenu);
              }}
              className="p-2 text-text-muted hover:text-white transition-colors"
              title="Export"
              aria-label="Export options"
              aria-expanded={showExportMenu}
            >
              <Download size={16} />
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-white/10 rounded-xl shadow-xl z-20 py-1">
                <button
                  onClick={(e) => { e.stopPropagation(); handleExport('json'); }}
                  className="w-full px-4 py-2 text-left text-sm text-text-muted hover:text-white hover:bg-white/5 flex items-center gap-2"
                >
                  <FileJson size={14} /> JSON
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleExport('csv'); }}
                  className="w-full px-4 py-2 text-left text-sm text-text-muted hover:text-white hover:bg-white/5 flex items-center gap-2"
                >
                  <FileText size={14} /> CSV
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleExport('xlsx'); }}
                  className="w-full px-4 py-2 text-left text-sm text-text-muted hover:text-white hover:bg-white/5 flex items-center gap-2"
                >
                  <FileSpreadsheet size={14} /> Excel
                </button>
              </div>
            )}
          </div>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-white/5 bg-bg/50">
          {renderContent(generation, onSeek)}
        </div>
      )}
    </div>
  );
}

function renderContent(generation: Generation, onSeek?: (time: number) => void) {
  switch (generation.type) {
    case 'TRANSCRIPT_SIMPLE':
    case 'DESC':
      return (
        <div className="prose prose-invert max-w-none text-sm text-text-muted">
          <ReactMarkdown>{typeof generation.content === 'string' ? generation.content : JSON.stringify(generation.content)}</ReactMarkdown>
        </div>
      );
    case 'TRANSCRIPT_ADVANCED':
      return <TranscriptView segments={generation.content.segments} onSeek={onSeek} />;
    case 'SCENE_DESC':
      return <SceneView scenes={generation.content.scenes} onSeek={onSeek} />;
    case 'QUIZ':
      return <QuizView questions={generation.content.questions} />;
    case 'FLASHCARDS':
      return <FlashcardView flashcards={generation.content.flashcards} />;
    default:
      return <pre className="text-xs text-text-muted overflow-auto">{JSON.stringify(generation.content, null, 2)}</pre>;
  }
}

function FlashcardView({ flashcards }: { flashcards: any[] }) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  if (!flashcards || !Array.isArray(flashcards)) return <p className="text-red-500">Invalid data format</p>;

  const toggleFlip = (idx: number) => {
    setFlipped(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {flashcards.map((card, idx) => (
        <div
          key={idx}
          className="relative h-64 cursor-pointer group [perspective:1000px]"
          onClick={() => toggleFlip(idx)}
        >
          <div className={cn(
            "w-full h-full transition-all duration-500 [transform-style:preserve-3d] relative",
            flipped[idx] ? "[transform:rotateY(180deg)]" : ""
          )}>
            {/* Front */}
            <div className="absolute inset-0 [backface-visibility:hidden] bg-card border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/30 transition-colors shadow-lg">
              <span className="text-xs text-text-muted uppercase tracking-wider mb-4 font-bold">Question</span>
              <p className="text-white font-medium text-lg">{card.front}</p>
              {card.tag && (
                <span className="absolute bottom-4 text-[10px] bg-white/5 px-2 py-1 rounded text-text-muted border border-white/5">
                  {card.tag}
                </span>
              )}
            </div>

            {/* Back */}
            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-primary/10 border border-primary/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-xs text-primary uppercase tracking-wider mb-4 font-bold">Answer</span>
              <p className="text-white text-lg">{card.back}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TranscriptView({ segments, onSeek }: { segments: any[]; onSeek?: (time: number) => void }) {
  if (!segments || !Array.isArray(segments)) return <p className="text-red-500">Invalid data format</p>;
  
  const parseTime = (timeStr: string) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  return (
    <div className="space-y-4">
      {segments.map((seg, idx) => (
        <div 
          key={idx} 
          className="flex gap-4 group hover:bg-white/5 p-2 rounded-xl transition-colors cursor-pointer"
          onClick={() => onSeek?.(parseTime(seg.startTime))}
        >
          <div className="w-24 shrink-0 text-xs font-mono text-secondary pt-1 group-hover:text-primary transition-colors">
            {seg.startTime} - {seg.endTime}
          </div>
          <div className="flex-1">
            <p className="text-sm text-white mb-1">{seg.transcript}</p>
            <div className="flex gap-2 text-[10px] text-text-muted uppercase tracking-wider">
              {seg.speakerGender && <span className="bg-white/5 px-1.5 py-0.5 rounded">{seg.speakerGender}</span>}
              {seg.type && <span className="bg-white/5 px-1.5 py-0.5 rounded">{seg.type}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SceneView({ scenes, onSeek }: { scenes: any[]; onSeek?: (time: number) => void }) {
  if (!scenes || !Array.isArray(scenes)) return <p className="text-red-500">Invalid data format</p>;

  const parseTime = (timeStr: string) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {scenes.map((scene, idx) => (
        <div 
          key={idx} 
          className="bg-card border border-white/5 p-4 rounded-2xl hover:border-primary/30 transition-colors cursor-pointer group"
          onClick={() => onSeek?.(parseTime(scene.startTime))}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded-lg group-hover:bg-primary group-hover:text-black transition-colors">
              {scene.startTime} - {scene.endTime}
            </span>
            {scene.mood && <span className="text-[10px] uppercase tracking-wider text-text-muted">{scene.mood}</span>}
          </div>
          <p className="text-sm text-white mb-3">{scene.descriptionText}</p>
          {scene.keyObjects && (
            <div className="flex flex-wrap gap-1">
              {scene.keyObjects.map((obj: string, i: number) => (
                <span key={i} className="text-[10px] bg-white/5 text-text-muted px-1.5 py-0.5 rounded">
                  {obj}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function QuizView({ questions }: { questions: any[] }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  if (!questions || !Array.isArray(questions)) return <p className="text-red-500">Invalid data format</p>;

  const handleSelect = (qId: number, option: string) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const score = questions.reduce((acc, q) => {
    return acc + (answers[q.id] === q.correctAnswer ? 1 : 0);
  }, 0);

  return (
    <div className="space-y-8">
      {showResults && (
        <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-2xl text-center mb-6">
          <h4 className="text-xl font-bold text-white mb-1">
            You scored {score} / {questions.length}
          </h4>
          <p className="text-sm text-secondary">
            {score === questions.length ? "Perfect!" : "Keep learning!"}
          </p>
        </div>
      )}

      {questions.map((q) => {
        const isCorrect = answers[q.id] === q.correctAnswer;
        const userAnswer = answers[q.id];

        return (
          <div key={q.id} className="space-y-3">
            <h4 className="text-base font-medium text-white flex gap-2">
              <span className="text-text-muted">{q.id}.</span>
              {q.question}
            </h4>
            
            <div className="pl-6 space-y-2">
              {q.questionType === 'short_answer' || q.questionType === 'long_answer' ? (
                <div className="space-y-2">
                  {q.questionType === 'long_answer' ? (
                    <textarea
                      disabled={showResults}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Type your answer..."
                    />
                  ) : (
                    <input
                      type="text"
                      disabled={showResults}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Type your answer..."
                    />
                  )}
                  {showResults && (
                    <div className="text-xs text-green-400">
                      Correct Answer: {q.correctAnswer}
                    </div>
                  )}
                </div>
              ) : (
                // Multiple Choice / Single Choice / True False
                q.options.map((opt: string, i: number) => {
                  let optionClass = "border-white/10 hover:bg-white/5";
                  
                  if (showResults) {
                    if (opt === q.correctAnswer) optionClass = "bg-green-500/20 border-green-500/50 text-green-200";
                    else if (opt === userAnswer && opt !== q.correctAnswer) optionClass = "bg-red-500/20 border-red-500/50 text-red-200";
                    else optionClass = "opacity-50 border-transparent";
                  } else if (userAnswer === opt) {
                    optionClass = "bg-primary/20 border-primary/50 text-primary";
                  }

                  return (
                    <label
                      key={i}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer",
                        optionClass
                      )}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={opt}
                        checked={userAnswer === opt}
                        onChange={() => handleSelect(q.id, opt)}
                        disabled={showResults}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="flex-1">{opt}</span>
                      {showResults && opt === q.correctAnswer && <CheckCircle size={14} className="text-green-400" />}
                      {showResults && opt === userAnswer && opt !== q.correctAnswer && <XCircle size={14} className="text-red-400" />}
                    </label>
                  );
                })
              )}
            </div>
            
            {showResults && q.explanation && (
              <div className="ml-6 p-3 bg-white/5 rounded-xl text-xs text-text-muted italic">
                💡 {q.explanation}
              </div>
            )}
          </div>
        );
      })}

      {!showResults && (
        <button
          onClick={() => setShowResults(true)}
          disabled={Object.keys(answers).length < questions.filter((q: any) => q.questionType !== 'short_answer' && q.questionType !== 'long_answer').length}
          className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Answers
        </button>
      )}
    </div>
  );
}
