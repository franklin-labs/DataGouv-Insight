import { getSubsidies, getMarketTrends, getRegulations } from "~/lib/mcp";
import type { Route } from "./+types/home";
import { Link } from "react-router";
import { HandCoins, TrendingUp, ShieldCheck, ArrowRight, Lightbulb } from "lucide-react";
import { getAIAdvice } from "~/lib/groq";

export async function loader() {
  const [subsidies, trends, regulations] = await Promise.all([
    getSubsidies(),
    getMarketTrends(),
    getRegulations(),
  ]);

  // Génération de conseils IA basés sur les données
  const context = `Subventions: ${subsidies.map(s => s.title).join(", ")}. Tendances: ${trends.map(t => t.sector + ": " + t.growth).join(", ")}.`;
  
  return { 
    subsidies: subsidies.slice(0, 3), 
    trends: trends.slice(0, 3), 
    regulations: regulations.slice(0, 3),
    advice: "Bienvenue sur votre assistant. Utilisez le chat pour obtenir des conseils personnalisés basés sur les données publiques en temps réel."
  };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { subsidies, trends, regulations, advice } = loaderData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      {/* Colonne Principale: Conseils IA et Résumé */}
      <div className="lg:col-span-2 space-y-6 md:space-y-8">
        {/* Widget Conseil IA */}
        <section className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-500/20">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="p-2 md:p-3 bg-white/20 rounded-xl">
              <TrendingUp className="w-6 h-6 md:w-7 md:h-7" />
            </div>
            <h3 className="text-xl md:text-2xl font-black">DataPulse Insight</h3>
          </div>
          <p className="text-indigo-50 text-base md:text-lg leading-relaxed italic font-medium">
            "{advice}"
          </p>
        </section>

        {/* Liste des Subventions */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-black flex items-center gap-3">
              <HandCoins className="w-6 h-6 md:w-7 md:h-7 text-emerald-500" />
              Subventions recommandées
            </h3>
            <Link to="/subsidies" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-black uppercase tracking-widest">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            {subsidies.map((s) => (
              <div key={s.id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{s.title}</h4>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black shrink-0">{s.amount}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed font-medium flex-1">
                  {s.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 shadow-sm">
                    {s.category}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200/20 dark:border-blue-700/30">
                    Expire le {s.deadline}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Colonne Latérale: Tendances et Veille */}
      <div className="space-y-6 md:space-y-8">
        {/* Tendances du marché */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl md:text-2xl font-black flex items-center gap-3 mb-6 md:mb-8">
            <TrendingUp className="w-6 h-6 md:w-7 md:h-7 text-blue-500" />
            Marché
          </h3>
          <div className="space-y-6">
            {trends.map((t) => (
              <div key={t.id} className="group cursor-default border-b border-slate-50 dark:border-slate-800 pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t.sector}</span>
                  <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${
                    t.trend === 'up' 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                  }`}>
                    {t.growth}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 font-bold leading-snug">{t.insight}</p>
              </div>
            ))}
          </div>
          <Link to="/market-trends" className="mt-8 block text-center py-3 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95">
            Analyse détaillée
          </Link>
        </section>

        {/* Veille réglementaire */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xl md:text-2xl font-black flex items-center gap-3 mb-6 md:mb-8">
            <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 text-amber-500" />
            Veille
          </h3>
          <div className="space-y-4">
            {regulations.map((r) => (
              <div key={r.id} className="relative pl-4 border-l-4 border-amber-500 py-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-r-xl transition-colors">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{r.title}</h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">Application : {r.date}</p>
              </div>
            ))}
          </div>
          <Link to="/regulations" className="mt-8 block text-center py-3 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95">
            Consulter toutes les lois
          </Link>
        </section>
      </div>
    </div>
  );
}
