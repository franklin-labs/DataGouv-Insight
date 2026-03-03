import { useChatStore, MODELS } from "~/lib/store";
import { Send, Bot, User, Trash2, AlertCircle, Loader2, Database, Download, Check, Copy } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router";
import Groq from "groq-sdk";
import { getSubsidies, getMarketTrends, getRegulations } from "~/lib/mcp";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toPng } from "html-to-image";

export default function Chat() {
  const { messages, addMessage, updateMessage, apiKey, model, clearChat, isLoaded } = useChatStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMCPContext, setUseMCPContext] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleDownloadPng = useCallback(async (id: string) => {
    const element = messageRefs.current[id];
    if (!element) return;

    try {
      // Attendre que les polices et images soient chargées
      await document.fonts.ready;
      
      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: "transparent",
        pixelRatio: 2,
        skipFonts: true, // Éviter l'erreur "font is undefined" dans embed-webfonts.ts
        style: {
          padding: "32px",
          paddingBottom: "60px", // Plus d'espace pour le footer
          borderRadius: "16px",
          margin: "0",
        },
        filter: (node) => {
          return !(node instanceof HTMLElement && node.classList.contains('group-hover:opacity-100'));
        }
      });

      // Ajouter le watermark sur le canvas
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => img.onload = resolve);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;

      // Dessiner l'image originale
      ctx.drawImage(img, 0, 0);

      // Configurer le texte du watermark
      const fontSize = Math.max(24, Math.floor(img.width / 40));
      ctx.font = `bold ${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = '#6366f1'; // indigo-500
      ctx.textAlign = 'right';
      
      const watermarkText = "by Franklin Delbo";
      ctx.fillText(watermarkText, canvas.width - 40, canvas.height - 30);

      const finalDataUrl = canvas.toDataURL('image/png');
      const link = document.createElement("a");
      link.download = `datapulse-insight-${id.slice(0, 8)}.png`;
      link.href = finalDataUrl;
      link.click();
    } catch (err) {
      console.error("Download Error:", err);
    }
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!apiKey) {
      setError("Veuillez configurer votre clé API dans les paramètres pour commencer à discuter.");
      return;
    }

    const userContent = input.trim();
    setInput("");
    if (textAreaRef.current) textAreaRef.current.style.height = "auto";
    setError(null);
    addMessage("user", userContent);

    setIsLoading(true);
    try {
      let systemPrompt = `Tu es Pulse Terminal (assistant de DataPulse AI), une interface de pointe dédiée EXCLUSIVEMENT aux artisans et entrepreneurs français.

RÈGLES DE COMPORTEMENT (STRICTES) :
1. DOMAINE D'EXPERTISE : Tu ne réponds QU'AUX questions concernant les données publiques françaises (subventions, aides, tendances du marché, réglementations sectorielles). Si la question sort de ce cadre, refuse poliment de répondre.
2. TON "SMART & SEXY" : Ton ton est technologique, charismatique et percutant. Tu es un partenaire stratégique visionnaire.
3. SOURCES OBLIGATOIRES : Chaque information provenant des données MCP DOIT être accompagnée de sa source (ex: '[Source: Data.gouv.fr - Subventions 2024]'). Une réponse sans source est invalide.
4. ACTION QUEST : Termine TOUJOURS par une question stratégique qui force l'utilisateur à agir.
5. CONCIS : Sois direct et structuré. Pas de blabla inutile.

VÉRIFICATION INTERNE : Avant de finaliser ta réponse, vérifie qu'elle respecte ces 5 règles. Si ce n'est pas le cas, recommence ta réflexion.`;
      
      if (useMCPContext) {
        const [subsidies, trends, regs] = await Promise.all([
          getSubsidies(userContent),
          getMarketTrends(),
          getRegulations(),
        ]);
        
        systemPrompt += `\n\nVoici le contexte actuel des données publiques (MCP) pour la recherche "${userContent}":\n`;
        systemPrompt += `SUBVENTIONS DISPONIBLES:\n${subsidies.map(s => `- ${s.title}: ${s.amount} (${s.description})`).join("\n")}\n\n`;
        systemPrompt += `TENDANCES DU MARCHÉ:\n${trends.map(t => `- ${t.sector}: ${t.growth} (${t.insight})`).join("\n")}\n\n`;
        systemPrompt += `RÉGLEMENTATIONS RÉCENTES:\n${regs.map(r => `- ${r.title} (${r.date}): ${r.summary}`).join("\n")}`;
      }

      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
      
      const stream = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: userContent }
        ],
        model: model,
        stream: true,
      });

      const assistantMessage = addMessage("assistant", "");
      let fullContent = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullContent += content;
        updateMessage(assistantMessage.id, fullContent);
      }
    } catch (err: any) {
      console.error("Chat Error:", err);
      setError(err.message || "Une erreur est survenue lors de la communication avec l'IA.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) return <div className="p-8 text-center text-slate-500">Chargement de la session...</div>;

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-32px)] w-full bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 overflow-hidden relative pb-16 md:pb-0">
      {/* Header */}
      <div className="shrink-0 p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-indigo-500 rounded-xl text-white">
            <Bot className="w-4 h-4 sm:w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-none">DataPulse AI</h3>
            <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 sm:mt-1 truncate max-w-[120px] sm:max-w-none">Intelligence de Pointe • {model}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative">
            <button
              onClick={() => setUseMCPContext(!useMCPContext)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all shadow-lg ${
                useMCPContext 
                  ? "bg-emerald-500 text-white shadow-emerald-500/30 ring-4 ring-emerald-500/10" 
                  : "bg-slate-200 dark:bg-slate-800 text-slate-500 border-2 border-slate-300 dark:border-slate-700 shadow-none"
              }`}
              title={useMCPContext ? "Données Publiques (MCP) activées" : "Données Publiques (MCP) désactivées"}
            >
              <div className={`w-2 h-2 rounded-full animate-pulse ${useMCPContext ? 'bg-white' : 'bg-slate-400'}`} />
              <Database className={`w-3.5 h-3.5 ${useMCPContext ? 'animate-bounce' : ''}`} />
              <span className="hidden xs:inline">
                {useMCPContext ? "DATA.GOUV : ACTIF" : "DATA.GOUV : OFF"}
              </span>
            </button>
            {useMCPContext && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <button 
            onClick={clearChat}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
            title="Effacer la conversation"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth pb-32"
      >
        <div className="max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-full animate-pulse">
                <Bot className="w-16 h-16 text-indigo-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Comment puis-je vous aider ?</h2>
                <p className="max-w-md text-slate-500 font-medium">Posez-moi vos questions sur les subventions, les tendances du marché ou la réglementation. Je suis là pour vous accompagner !</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`flex mb-8 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-4 max-w-[90%] md:max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg ${
                      m.role === 'user' ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col gap-2 group">
                      <div 
                        ref={el => messageRefs.current[m.id] = el}
                        className={`p-6 rounded-3xl text-sm leading-relaxed prose dark:prose-invert prose-slate max-w-none ${
                          m.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50'
                        }`}
                      >
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            a: ({ node, ...props }) => (
                               <a 
                                 {...props} 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 className={`${m.role === 'user' ? 'text-blue-100 hover:text-white underline decoration-white/50' : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 underline decoration-indigo-500/30'} underline-offset-4 font-black transition-all`}
                               />
                             ),
                            p: ({ node, ...props }) => <p {...props} className="mb-4 last:mb-0" />,
                            ul: ({ node, ...props }) => <ul {...props} className="list-disc ml-6 space-y-2 my-4" />,
                            ol: ({ node, ...props }) => <ol {...props} className="list-decimal ml-6 space-y-2 my-4" />,
                            strong: ({ node, ...props }) => <strong {...props} className={`${m.role === 'user' ? 'text-white bg-white/20' : 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10'} font-black px-1 rounded`} />,
                           }}
                         >
                           {m.content}
                         </ReactMarkdown>
                      </div>
                      
                      {m.role === 'assistant' && (
                        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <button 
                            onClick={() => handleCopy(m.content, m.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                          >
                            {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Check className="w-3.5 h-3.5 opacity-0" />}
                            {copiedId === m.id ? "Copié" : "Copier"}
                          </button>
                          <button 
                            onClick={() => handleDownloadPng(m.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Capture PNG
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-8">
                  <div className="flex gap-4 items-center text-slate-400 animate-pulse">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">Analyse en cours...</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Fixed Input Area */}
      <div className="shrink-0 absolute bottom-0 left-0 right-0 p-2 sm:p-3 z-20">
        <div className="max-w-3xl mx-auto relative">
          {error && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-start gap-2 text-rose-600 dark:text-rose-400 text-xs animate-in slide-in-from-bottom-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Oups !</p>
                <p>{error}</p>
                {!apiKey && (
                  <Link to="/settings" className="inline-block mt-1 font-black underline hover:opacity-80">
                    Aller aux paramètres
                  </Link>
                )}
              </div>
            </div>
          )}
          
          <form 
            onSubmit={handleSubmit}
            className="relative group flex items-center gap-2"
          >
            <div className="relative flex-1">
              <textarea
                ref={textAreaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Votre message..."
                className="w-full pl-4 pr-12 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400 resize-none min-h-[42px] max-h-[120px]"
                disabled={isLoading}
                rows={1}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-400 transition-all active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>
          <p className="mt-1 text-[8px] text-center text-slate-400 font-bold uppercase tracking-widest opacity-50">
            Shift + Entrée pour sauter une ligne
          </p>
        </div>
      </div>
    </div>
  );
}
