import { useChatStore, MODELS } from "~/lib/store";
import { Shield, Key, Bot, Trash2, AlertTriangle, Save, Download, FileJson, FileSpreadsheet, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { exportToJSON, exportToCSV } from "~/lib/security";

export default function Settings() {
  const { apiKey, setApiKey, mcpApiKey, setMcpApiKey, model, setModel, messages, clearAllData, isLoaded } = useChatStore();
  const [localKey, setLocalKey] = useState("");
  const [isMasked, setIsMasked] = useState(true);
  const [isMcpMasked, setIsMcpMasked] = useState(true);
  const [localMcpKey, setLocalMcpKey] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setLocalKey(apiKey);
      setLocalMcpKey(mcpApiKey);
      
      // Afficher la popup de confidentialité au premier accès
      const hasSeenPrivacy = localStorage.getItem("hasSeenPrivacyPopup");
      if (!hasSeenPrivacy) {
        setShowPrivacyPopup(true);
      }
    }
  }, [isLoaded, apiKey, mcpApiKey]);

  const closePrivacyPopup = () => {
    setShowPrivacyPopup(false);
    localStorage.setItem("hasSeenPrivacyPopup", "true");
  };

  const handleSave = () => {
    setApiKey(localKey);
    setMcpApiKey(localMcpKey);
    setIsMasked(true);
    setIsMcpMasked(true);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const getMaskedValue = (val: string) => {
    if (!val) return "";
    if (val.length < 12) return "********";
    return val.slice(0, 6) + "..." + val.slice(-4);
  };

  const handleClear = () => {
    if (confirm("Êtes-vous sûr de vouloir effacer toutes vos données de session (Clé API et historique) ?")) {
      clearAllData();
      setLocalKey("");
    }
  };

  if (!isLoaded) return <div className="p-8 text-center text-slate-500">Chargement des paramètres...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-lg shadow-blue-500/30">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Configuration de l'IA</h3>
              <p className="text-slate-500 font-medium">Gérez vos identifiants et vos préférences de session.</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* API KEY SECTION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
              <Key className="w-5 h-5 text-blue-500" />
              <h4>Clé API de l'Assistant</h4>
            </div>
            <div className="relative group flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={isMasked ? "text" : "password"}
                  value={isMasked ? getMaskedValue(localKey) : localKey}
                  onChange={(e) => {
                    setLocalKey(e.target.value);
                    if (isMasked) setIsMasked(false);
                  }}
                  onFocus={() => {
                    if (isMasked) setIsMasked(false);
                  }}
                  placeholder="gsk_..."
                  className="w-full pl-4 pr-12 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-blue-500 outline-none transition-all font-mono text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setIsMasked(!isMasked)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {isMasked ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              <button 
                onClick={handleSave}
                className="p-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95 shrink-0"
                title="Enregistrer"
              >
                <Save className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  <strong className="text-blue-600 dark:text-blue-400">Architecture Zero-Server Storage :</strong> Votre clé est isolée dans un coffre-fort local (<code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded text-[10px]">localStorage</code>) protégé par l'isolation du navigateur. Elle ne quitte votre appareil que via un tunnel chiffré <span className="font-bold text-slate-900 dark:text-white">TLS 1.3</span> directement vers l'API de l'IA. <span className="text-emerald-600 dark:text-emerald-400 font-bold">Zéro risque de vol de données sur nos serveurs : ils n'existent pas.</span>
                </p>
                <a 
                  href="https://console.groq.com/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-black hover:underline group"
                >
                  Obtenir une clé API sécurisée (Groq)
                  <Bot className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
              <Key className="w-5 h-5 text-emerald-500" />
              <h4>Clé API MCP (Optionnelle)</h4>
            </div>
            <div className="relative group flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={isMcpMasked ? "text" : "password"}
                  value={isMcpMasked ? getMaskedValue(localMcpKey) : localMcpKey}
                  onChange={(e) => {
                    setLocalMcpKey(e.target.value);
                    if (isMcpMasked) setIsMcpMasked(false);
                  }}
                  onFocus={() => {
                    if (isMcpMasked) setIsMcpMasked(false);
                  }}
                  placeholder="mcp_..."
                  className="w-full pl-4 pr-12 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-emerald-500 outline-none transition-all font-mono text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setIsMcpMasked(!isMcpMasked)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {isMcpMasked ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              <button 
                onClick={handleSave}
                className="p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 shrink-0"
                title="Enregistrer"
              >
                <Save className="w-6 h-6" />
              </button>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed italic">
              Facultatif : Si vous disposez d'une clé spécifique pour le serveur MCP, vous pouvez la renseigner ici.
            </p>
          </div>

          <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl">
            <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400 font-bold mb-2">
              <Shield className="w-5 h-5" />
              <h4>Accès aux Données Publiques</h4>
            </div>
            <p className="text-sm text-emerald-800 dark:text-emerald-300">
              L'accès aux données de <strong>data.gouv.fr</strong> est libre et gratuit. 
              Aucune clé API n'est requise pour consulter les subventions, les tendances et les réglementations.
            </p>
          </div>

          {/* MODEL SELECTION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
              <Bot className="w-5 h-5 text-indigo-500" />
              <h4>Modèle de langage par défaut</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`p-4 text-left rounded-2xl border-2 transition-all ${
                    model === m.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 ring-4 ring-blue-500/10"
                      : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="font-black truncate">{m.name}</div>
                  <div className="text-xs opacity-60 mt-1 truncate">{m.id}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DATA EXPORT SECTION */}
        <div className="bg-slate-50 dark:bg-slate-950/50 p-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3 text-slate-900 dark:text-white font-bold">
            <Download className="w-6 h-6 text-emerald-500" />
            <h4 className="text-xl">Exporter vos données</h4>
          </div>
          <p className="text-slate-500 font-medium">
            Téléchargez votre historique de conversation et vos paramètres pour une consultation hors-ligne.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => exportToJSON({ messages, model, exportDate: new Date().toISOString() }, "chat-history.json")}
              disabled={messages.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileJson className="w-5 h-5 text-orange-500" />
              Exporter en JSON
            </button>
            <button
              onClick={() => exportToCSV(messages, "chat-history.csv")}
              disabled={messages.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
              Exporter en CSV
            </button>
          </div>
          {messages.length === 0 && (
            <p className="text-xs text-slate-400 italic">Aucun message à exporter pour le moment.</p>
          )}
        </div>

        {/* FEEDBACK SAVED */}
        {showSaved && (
          <div className="mx-8 mb-8 p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-bold">Paramètres sauvegardés localement avec succès !</span>
          </div>
        )}
      </div>

      {/* DANGER ZONE */}
      <div className="bg-rose-50 dark:bg-rose-900/10 p-8 rounded-3xl border border-rose-100 dark:border-rose-900/20">
        <div className="flex items-center gap-3 mb-4 text-rose-900 dark:text-rose-100">
          <AlertTriangle className="w-6 h-6" />
          <h4 className="text-xl font-black text-rose-600">Action Irréversible</h4>
        </div>
        <p className="text-rose-800 dark:text-rose-300 font-medium mb-6">
          Videz instantanément toutes les données chiffrées de votre session locale. 
          Cette action supprimera définitivement votre clé API et l'intégralité de votre historique de conversations sans possibilité de récupération.
        </p>
        <button 
          onClick={handleClear}
          className="w-full sm:w-auto px-8 py-4 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 flex items-center justify-center gap-3"
        >
          <Trash2 className="w-6 h-6" />
          Purger la session locale
        </button>
      </div>

      {/* PRIVACY POPUP */}
      {showPrivacyPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/30">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Confidentialité & Data</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest">Stratégie Zero-Collection</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  DataPulse AI a été conçu avec une philosophie radicale : <span className="font-bold text-slate-900 dark:text-white">votre vie privée n'est pas une option.</span>
                </p>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-1 text-slate-900 dark:text-white font-bold text-xs">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Pas de Base de Données
                    </div>
                    <p className="text-[11px] text-slate-500">L'outil est volontairement "stateless". Rien n'est stocké sur nos serveurs pour garantir un accès rapide et anonyme.</p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                     <div className="flex items-center gap-2 mb-1 text-slate-900 dark:text-white font-bold text-xs">
                       <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                       Chiffrement Local & Transport TLS 1.3
                     </div>
                     <p className="text-[11px] text-slate-500 leading-relaxed">Votre clé réside exclusivement dans votre navigateur. Elle n'est transmise qu'à l'IA via un tunnel <span className="font-bold">TLS 1.3</span> ultra-sécurisé. <span className="text-blue-500 font-bold">Impossible d'intercepter ou de voler vos données sur un serveur central : il n'y a pas de base de données.</span></p>
                   </div>
                </div>

                <p className="text-xs text-slate-400 italic text-center">
                  "Une technologie accessible immédiatement, sans collecte de données, sans compromis."
                </p>
              </div>

              <button
                onClick={closePrivacyPopup}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
              >
                J'ai compris, propulser l'Assistant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
