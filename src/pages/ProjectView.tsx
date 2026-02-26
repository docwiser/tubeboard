import React, { useState, useRef, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChatInterface } from '../components/ChatInterface';
import { GeneratorInterface } from '../components/GeneratorInterface';
import { ResultDisplay } from '../components/ResultDisplay';
import { extractYoutubeId } from '../lib/utils';
import { MessageSquare, Zap, Layers, MoreVertical, Copy, FileJson, Download } from 'lucide-react';
import { cn } from '../lib/utils';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';

export function ProjectView() {
  const { id } = useParams<{ id: string }>();
  const { projects, ttsSettings } = useApp();
  
  if (!id) return <Navigate to="/" />;
  
  const project = projects.find((p) => p.id === id);
  const [activeTab, setActiveTab] = useState<'generate' | 'chat'>('generate');
  const [showMenu, setShowMenu] = useState(false);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Scene Description TTS Logic
  useEffect(() => {
    if (!playerRef.current || !project) return;

    const checkTime = setInterval(async () => {
      if (!playerRef.current || !isPlaying) return;
      
      const currentTime = await playerRef.current.getCurrentTime();
      
      // Find active scene description
      const sceneGen = project.generations.find(g => g.type === 'SCENE_DESC');
      if (sceneGen && Array.isArray(sceneGen.content)) {
        const currentScene = sceneGen.content.find((scene: any) => {
          // Assuming scene has startTime/timestamp in seconds or "MM:SS"
          // We need to parse it. Let's assume content structure from prompt.
          // If prompt asks for JSON with startTime, we parse it.
          // For now, let's assume the content has a 'timestamp' field which is a string "MM:SS" or number
          
          let sceneTime = -1;
          if (typeof scene.timestamp === 'string') {
             const parts = scene.timestamp.split(':').map(Number);
             if (parts.length === 2) sceneTime = parts[0] * 60 + parts[1];
             else if (parts.length === 3) sceneTime = parts[0] * 3600 + parts[1] * 60 + parts[2];
          } else if (typeof scene.timestamp === 'number') {
            sceneTime = scene.timestamp;
          }

          // Check if we just hit this timestamp (within 1s margin)
          // We need a state to track played scenes to avoid loop, but for now simple check
          return Math.abs(currentTime - sceneTime) < 1;
        });

        if (currentScene && !window.speechSynthesis.speaking) {
           playerRef.current.pauseVideo();
           const utterance = new SpeechSynthesisUtterance(currentScene.description || currentScene.text);
           if (ttsSettings.voiceURI) {
             const voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === ttsSettings.voiceURI);
             if (voice) utterance.voice = voice;
           }
           utterance.rate = ttsSettings.rate;
           utterance.pitch = ttsSettings.pitch;
           utterance.volume = ttsSettings.volume;
           
           utterance.onend = () => {
             playerRef.current.playVideo();
           };
           
           window.speechSynthesis.speak(utterance);
        }
      }
    }, 1000);

    return () => clearInterval(checkTime);
  }, [project, isPlaying, ttsSettings]);

  if (!project) {
    return <Navigate to="/" />;
  }

  const videoId = extractYoutubeId(project.videoUrl);

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    setIsPlaying(event.data === 1); // 1 is playing
  };

  const seekTo = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true);
    }
  };

  const handleCopyMessages = () => {
    const text = project.chatHistory.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setShowMenu(false);
  };

  const handleExportProject = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-${project.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    setShowMenu(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white truncate">{project.name}</h1>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-text-muted hover:text-white transition-colors rounded-lg hover:bg-white/5"
            aria-label="Project Options"
            aria-expanded={showMenu}
          >
            <MoreVertical size={20} aria-hidden="true" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-white/10 rounded-xl shadow-xl z-20 py-1">
              <button
                onClick={handleCopyMessages}
                className="w-full px-4 py-2 text-left text-sm text-text-muted hover:text-white hover:bg-white/5 flex items-center gap-2"
              >
                <Copy size={14} aria-hidden="true" /> Copy All Messages
              </button>
              <button
                onClick={handleExportProject}
                className="w-full px-4 py-2 text-left text-sm text-text-muted hover:text-white hover:bg-white/5 flex items-center gap-2"
              >
                <FileJson size={14} aria-hidden="true" /> Export Project JSON
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Column: Video & Chat/Generate Toggle */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full overflow-hidden">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl shrink-0">
            {videoId ? (
              <YouTube
                videoId={videoId}
                className="w-full h-full"
                iframeClassName="w-full h-full"
                onReady={onPlayerReady}
                onStateChange={onPlayerStateChange}
                opts={{
                  playerVars: {
                    autoplay: 0,
                    modestbranding: 1,
                    rel: 0,
                  },
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted">
                Invalid YouTube URL
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 border-b border-white/10 pb-4 shrink-0" role="tablist" aria-label="Project Tools">
            <button
              role="tab"
              aria-selected={activeTab === 'generate'}
              aria-controls="panel-generate"
              id="tab-generate"
              onClick={() => setActiveTab('generate')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'generate' 
                  ? "bg-primary text-black shadow-lg shadow-primary/20" 
                  : "text-text-muted hover:text-white hover:bg-white/5"
              )}
            >
              <Zap size={18} aria-hidden="true" />
              Generate
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'chat'}
              aria-controls="panel-chat"
              id="tab-chat"
              onClick={() => setActiveTab('chat')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                activeTab === 'chat' 
                  ? "bg-secondary text-white shadow-lg shadow-secondary/20" 
                  : "text-text-muted hover:text-white hover:bg-white/5"
              )}
            >
              <MessageSquare size={18} aria-hidden="true" />
              Chat
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-2">
            <div
              role="tabpanel"
              id="panel-generate"
              aria-labelledby="tab-generate"
              hidden={activeTab !== 'generate'}
              className="h-full"
            >
              {activeTab === 'generate' && <GeneratorInterface projectId={project.id} videoUrl={project.videoUrl} onSeek={seekTo} />}
            </div>
            <div
              role="tabpanel"
              id="panel-chat"
              aria-labelledby="tab-chat"
              hidden={activeTab !== 'chat'}
              className="h-full"
            >
              {activeTab === 'chat' && <ChatInterface projectId={project.id} videoUrl={project.videoUrl} onSeek={seekTo} />}
            </div>
          </div>
        </div>

        {/* Right Column: Results Feed */}
        <div className="lg:col-span-1 bg-card/50 border border-white/5 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-text-muted uppercase tracking-wider text-xs font-bold shrink-0">
            <Layers size={14} aria-hidden="true" />
            Output History
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar" role="feed" aria-label="Generation History">
            {project.generations.length === 0 ? (
              <div className="text-center py-10 text-text-muted text-sm border border-dashed border-white/10 rounded-xl">
                No generations yet.
                <br />
                Use the "Generate" tab to start.
              </div>
            ) : (
              <ul className="space-y-4">
                {project.generations.map((gen) => (
                  <li key={gen.id}>
                    <ResultDisplay generation={gen} onSeek={seekTo} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
