import { getRegulations } from "~/lib/mcp";
import type { Route } from "./+types/regulations";
import { ShieldCheck, Calendar, MapPin, Search, Info } from "lucide-react";
import { useState } from "react";

export async function loader() {
  const regulations = await getRegulations();
  return { regulations };
}

export default function Regulations({ loaderData }: Route.ComponentProps) {
  const { regulations } = loaderData;
  const [filter, setFilter] = useState("");
  const [activeTag, setActiveTag] = useState("Tous");

  const filteredRegulations = regulations.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(filter.toLowerCase()) || 
                          r.summary.toLowerCase().includes(filter.toLowerCase());
    const matchesTag = activeTag === "Tous" || r.sector === activeTag;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrer les réglementations..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {["Tous", "Bâtiment", "Alimentaire", "Services", "Fiscalité"].map((tag) => (
            <button 
              key={tag} 
              onClick={() => setActiveTag(tag)}
              className={`whitespace-nowrap px-4 py-1 rounded-full text-sm font-semibold transition-colors ${
                activeTag === tag 
                  ? "bg-amber-500 text-white" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/30 dark:hover:text-amber-400"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {filteredRegulations.length > 0 ? (
          filteredRegulations.map((r) => (
            <div key={r.id} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
              
              <div className="flex flex-col md:flex-row md:items-start gap-6 relative z-10">
                <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-2xl shrink-0 self-start">
                  <ShieldCheck className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                      {r.title}
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {r.sector}
                    </span>
                  </div>

                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    {r.summary}
                  </p>

                  <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold">Mise en application :</span> {r.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="w-4 h-4" />
                      <span className="font-semibold">Territoire :</span> France (National)
                    </div>
                  </div>
                </div>

                <div className="md:w-48 shrink-0">
                  <a 
                    href={`https://www.data.gouv.fr/fr/datasets/${r.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity text-center"
                  >
                    Consulter
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-slate-500 font-medium text-lg">Aucune réglementation ne correspond à vos critères.</p>
          </div>
        )}
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/50 flex items-start gap-4">
        <div className="p-2 bg-amber-500 rounded-full text-white shrink-0 mt-1">
          <Info className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-1">Besoin d'aide pour la mise en conformité ?</h4>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Notre assistant IA peut vous aider à comprendre l'impact spécifique de ces réglementations sur votre activité. 
            Utilisez le panneau de conseils sur votre tableau de bord.
          </p>
        </div>
      </div>
    </div>
  );
}
