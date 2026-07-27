import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Pavilion, Company } from '../../types';
import {
  Bot,
  Send,
  Volume2,
  VolumeX,
  Mic,
  Zap,
  Navigation,
  Globe,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
} from 'lucide-react';

interface ChatbotAssistantProps {
  currentPavilion: Pavilion | null;
  pavilions: Pavilion[];
  companies: Company[];
  onTeleportToPavilion: (pavilion: Pavilion) => void;
  onSelectCompany: (company: Company) => void;
  onOpenGlobeMap: () => void;
  isAutoTour: boolean;
  onToggleAutoTour: () => void;
}

export const ChatbotAssistant: React.FC<ChatbotAssistantProps> = ({
  currentPavilion,
  pavilions,
  companies,
  onTeleportToPavilion,
  onSelectCompany,
  onOpenGlobeMap,
  isAutoTour,
  onToggleAutoTour,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: 'Ciao! 👋 Sono il tuo Assistente Intelligente Meta-TV. Posso guidarti nei corridoi 3D, raccomandare aziende e attivare i link Bonus-Power! Come posso aiutarti?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice speech synthesis
  const speakText = (text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'it-IT';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const msgText = textToSend || inputMessage;
    if (!msgText.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: msgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgText,
          currentPavilion: currentPavilion?.name,
        }),
      });

      const data = await response.json();
      const replyText = data.reply || 'Come posso aiutarti nel centro commerciale 3D?';

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(replyText);
    } catch (err) {
      console.error('Assistant error:', err);
      const fallbackMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'assistant',
        text: 'Posso guidarti nei 20 padiglioni del Centro Commerciale Meta-TV! Prova a cliccare su uno dei suggerimenti qui sotto.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-auto">
      {/* Closed Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="group relative flex items-center gap-2 sm:gap-3 px-3.5 py-2.5 sm:px-5 sm:py-3.5 bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-widest rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <div className="relative">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 rounded-full border-2 border-black" />
          </div>
          <span className="hidden xs:inline">Assistente 3D</span>
          <span className="xs:hidden">Guida</span>
        </button>
      )}

      {/* Open Chat Drawer */}
      {isOpen && (
        <div
          className={`bg-[#080808] border border-yellow-500/40 rounded-2xl sm:rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-300 flex flex-col ${
            isMinimized
              ? 'w-[260px] sm:w-80 h-12 sm:h-16'
              : 'w-[calc(100vw-2rem)] max-w-sm sm:w-96 h-[380px] sm:h-[520px] max-h-[75vh]'
          }`}
        >
          {/* Assistant Header */}
          <div className="p-4 bg-black border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-600 to-yellow-200 p-0.5 shadow-[0_0_12px_rgba(212,175,55,0.3)]">
                <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-yellow-400" />
                </div>
              </div>
              <div>
                <h3 className="text-white font-light text-xs tracking-wider uppercase flex items-center gap-1.5">
                  <span>Guida <span className="font-bold text-yellow-500">Meta-TV 3D</span></span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono tracking-widest uppercase">
                    ONLINE
                  </span>
                </h3>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                  {currentPavilion ? `Atrio: ${currentPavilion.name}` : 'Assistente Virtuale Globale'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className={`p-1.5 rounded-lg hover:text-white transition-all ${
                  ttsEnabled ? 'text-yellow-400' : 'text-white/40'
                }`}
                title={ttsEnabled ? 'Disattiva Voce' : 'Attiva Voce'}
              >
                {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white transition-all"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-black/40">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        m.sender === 'user'
                          ? 'bg-yellow-500 text-black font-semibold rounded-tr-none shadow-md'
                          : 'bg-zinc-900 text-white/90 border border-white/10 rounded-tl-none shadow-md'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-line">{m.text}</p>
                      <span className="text-[9px] opacity-60 block text-right mt-1 font-mono">{m.timestamp}</span>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-yellow-400 text-xs italic bg-zinc-900/80 p-2.5 rounded-2xl w-fit border border-white/10">
                    <Sparkles className="w-4 h-4 animate-spin text-yellow-500" />
                    <span>Meta-Bot sta elaborando la guida...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Action Suggestion Chips */}
              <div className="p-2 bg-black border-t border-white/10 flex gap-1.5 overflow-x-auto">
                <button
                  onClick={() => {
                    const shoppingPav = pavilions.find((p) => p.id === 'shopping');
                    if (shoppingPav) onTeleportToPavilion(shoppingPav);
                  }}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-yellow-500/30 whitespace-nowrap flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Portami a Shopping</span>
                </button>

                <button
                  onClick={onOpenGlobeMap}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-yellow-500/30 whitespace-nowrap flex items-center gap-1"
                >
                  <Globe className="w-3 h-3" />
                  <span>Mappa Aziende</span>
                </button>

                <button
                  onClick={onToggleAutoTour}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-yellow-500/30 whitespace-nowrap flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isAutoTour ? 'Ferma Guida' : 'Guida Automatica'}</span>
                </button>
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-black border-t border-white/10 flex gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Chiedi indicazioni o offerte..."
                  className="flex-1 bg-zinc-950 border border-white/15 px-3 py-2 rounded-xl text-xs text-yellow-100 placeholder-white/40 focus:outline-none focus:border-yellow-500"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="p-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};
