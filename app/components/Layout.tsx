import { Navbar, MobileNavbar } from "./Navbar";
import { useLocation } from "react-router";
import { useState, useEffect } from "react";
import { X, Mail, Sparkles, Briefcase, Bot } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const [showPopup, setShowPopup] = useState(false);
  const [showAiPopup, setShowAiPopup] = useState(false);

  useEffect(() => {
    // Stage popup (1s delay for better visibility)
    const stageTimer = setTimeout(() => {
      // Force display for demo/testing or make it very frequent
      setShowPopup(true);
    }, 1000);

    // AI Intro popup - only on /chat
    if (location.pathname === "/chat") {
      const aiDismissed = localStorage.getItem("ai-intro-dismissed");
      if (!aiDismissed) {
        setShowAiPopup(true);
      }
    }

    return () => {
      clearTimeout(stageTimer);
    };
  }, [location.pathname]);

  const dismissPopup = () => {
    setShowPopup(false);
    // On ne stocke plus le dismissal pour que ça revienne à chaque navigation/refresh
  };

  const dismissAiPopup = () => {
    setShowAiPopup(false);
    localStorage.setItem("ai-intro-dismissed", "true");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex relative">
      <Navbar />
      <main className={`flex-1 md:ml-64 ${location.pathname === "/chat" ? "p-0" : "p-4 sm:p-6 md:p-8"}`}>
        {location.pathname !== "/chat" && (
          <header className="mb-6 md:mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              {pageTitle}
            </h2>
          </header>
        )}
        {children}
        {location.pathname !== "/chat" && <div className="h-20 md:hidden" />}
      </main>
      <MobileNavbar />

      {/* AI Intro Popup - Only for /chat */}
      {showAiPopup && location.pathname === "/chat" && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-3xl p-8 shadow-2xl max-w-md relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 right-0 p-4">
              <button 
                onClick={dismissAiPopup}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-100 dark:bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-indigo-500 rounded-2xl text-white shadow-xl shadow-indigo-500/30 mb-6">
                <Bot className="w-10 h-10" />
              </div>
              
              <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                Assistant IA Personnel
              </h4>
              
              <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                Discutez en toute confidentialité avec votre Assistant IA conçu par <strong>Franklin</strong>. Vos données ne quittent jamais votre session.
              </p>

              <button 
                onClick={dismissAiPopup}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 text-lg"
              >
                C'est parti !
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage Popup */}
      {showPopup && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in fade-in slide-in-from-bottom-10 duration-500">
          <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-3xl p-6 shadow-2xl max-w-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2">
              <button 
                onClick={dismissPopup}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                <Briefcase className="w-6 h-6" />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white leading-tight">
                Besoin d'une configuration personnalisée ?
              </h4>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Je suis actuellement à la <strong>recherche d'un stage immédiat</strong> ! Si vous appréciez cet outil ou si vous avez besoin d'une version sur mesure pour votre entreprise, contactez-moi :
            </p>

            <a 
              href="mailto:votre-email@exemple.com" 
              className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 group"
            >
              <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Me contacter par email
            </a>

            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Disponible immédiatement
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getPageTitle(pathname: string) {
  switch (pathname) {
    case "/":
      return "Tableau de bord";
    case "/chat":
      return "Chat avec Franklin";
    case "/subsidies":
      return "Subventions & Aides";
    case "/market-trends":
      return "Tendances du Marché";
    case "/regulations":
      return "Veille Réglementaire";
    case "/settings":
      return "Paramètres";
    default:
      return "Application";
  }
}

function getPageDescription(pathname: string) {
  switch (pathname) {
    case "/":
      return "Vue d'ensemble de votre activité et des opportunités.";
    case "/chat":
      return "Discutez en toute confidentialité avec votre Assistant IA Personnel conçu par Franklin. Vos données ne quittent jamais votre session.";
    case "/subsidies":
      return "Trouvez les financements publics adaptés à votre entreprise.";
    case "/market-trends":
      return "Analysez les évolutions de votre secteur d'activité.";
    case "/regulations":
      return "Restez informé des dernières normes et lois applicables.";
    case "/settings":
      return "Gérez vos préférences et informations d'entreprise.";
    default:
      return "";
  }
}
