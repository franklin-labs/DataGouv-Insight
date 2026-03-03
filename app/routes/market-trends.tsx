import { getMarketTrends } from "~/lib/mcp";
import type { Route } from "./+types/market-trends";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";

export async function loader() {
  const trends = await getMarketTrends();
  return { trends };
}

export default function MarketTrends({ loaderData }: Route.ComponentProps) {
  const { trends } = loaderData;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trends.length > 0 ? trends.map((t) => (
          <div key={t.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md max-w-[200px] truncate" title={t.sector}>
                {t.sector}
              </span>
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <Info className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex-1">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3 line-clamp-3">
                {t.insight}
              </h4>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">Source : Data.gouv.fr</span>
              <a 
                href={`https://www.data.gouv.fr/fr/datasets/${t.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Accéder aux données
              </a>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center">
            <div className="inline-flex p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 text-slate-400">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Aucune donnée de conjoncture</h3>
            <p className="text-slate-500">L'API n'a pas retourné de jeux de données récents pour la conjoncture économique.</p>
          </div>
        )}
      </div>
    </div>
  );
}
