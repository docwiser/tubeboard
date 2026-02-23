import React, { useState, useRef, useEffect } from 'react';
import { useApp, ChatMessage } from '../context/AppContext';
import { GeminiService } from '../lib/gemini';
import { Send, Loader2, User, Bot, Copy, RefreshCw, Share2, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface ChatInterfaceProps {
  projectId: string;
  videoUrl: string;
}

export function ChatInterface({ projectId, videoUrl }: ChatInterfaceProps) {
  const { projects, addChatMessage, apiKey, selectedModel } = useApp();
  const project = projects.find((p) => p.id === projectId);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const history = project?.chatHistory || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, streamingText]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !apiKey) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(projectId, userMsg);
    setInput('');
    setIsLoading(true);
    setStreamingText('');

    try {
      const service = new GeminiService(apiKey);
      const stream = await service.chatStream(
        selectedModel,
        history,
        userMsg.text,
        videoUrl
      );

      let fullText = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullText += chunkText;
          setStreamingText(fullText);
        }
      }

      const modelMsg: ChatMessage = {
        role: 'model',
        text: fullText || "I couldn't generate a response.",
        timestamp: new Date().toISOString(),
      };
      addChatMessage(projectId, modelMsg);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        role: 'model',
        text: "Sorry, I encountered an error processing your request.",
        timestamp: new Date().toISOString(),
      };
      addChatMessage(projectId, errorMsg);
    } finally {
      setIsLoading(false);
      setStreamingText('');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleRegenerate = async () => {
    // Logic to regenerate the last message would go here
    // For now, we'll just alert as it requires removing the last message from history state which is in context
    alert("Regeneration requires modifying history state. Feature coming soon.");
  };

  return (
    <div className="flex flex-col h-[600px] bg-card rounded-2xl border border-white/5 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef} role="log" aria-live="polite">
        {history.length === 0 && (
          <div className="text-center text-text-muted py-10">
            <p>Ask anything about the video!</p>
          </div>
        )}
        {history.map((msg, idx) => (
          <MessageItem key={idx} msg={msg} onCopy={handleCopy} />
        ))}
        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shrink-0">
              <Bot size={16} aria-hidden="true" />
            </div>
            <div className="p-3 rounded-2xl bg-white/5 text-text-muted rounded-tl-none">
              {streamingText ? (
                <ReactMarkdown>{streamingText}</ReactMarkdown>
              ) : (
                <div className="flex items-center">
                  <Loader2 size={16} className="animate-spin mr-2" aria-hidden="true" />
                  Thinking...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-bg/50 backdrop-blur-sm">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the video..."
            className="w-full pl-4 pr-12 py-3 rounded-xl bg-bg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            disabled={isLoading}
            aria-label="Chat input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:text-white disabled:opacity-50 transition-colors"
            aria-label="Send message"
          >
            <Send size={20} aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageItem({ msg, onCopy }: { msg: ChatMessage; onCopy: (text: string) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopyClick = () => {
    onCopy(msg.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%]",
        msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        msg.role === 'user' ? "bg-primary text-black" : "bg-secondary text-white"
      )}>
        {msg.role === 'user' ? <User size={16} aria-hidden="true" /> : <Bot size={16} aria-hidden="true" />}
      </div>
      
      <div className="flex flex-col gap-1 min-w-0">
        <div className={cn(
          "p-3 rounded-2xl text-sm prose prose-invert max-w-none",
          msg.role === 'user' 
            ? "bg-primary/10 text-white rounded-tr-none" 
            : "bg-white/5 text-text-muted rounded-tl-none"
        )}>
          <ReactMarkdown>{msg.text}</ReactMarkdown>
        </div>
        
        {msg.role === 'model' && (
          <div className="flex items-center gap-2 px-1">
            <button 
              onClick={handleCopyClick}
              className="p-1 text-text-muted hover:text-white transition-colors"
              aria-label="Copy message"
              title="Copy"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
            <button 
              className="p-1 text-text-muted hover:text-white transition-colors"
              aria-label="Share message"
              title="Share"
            >
              <Share2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
