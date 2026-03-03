import { getSubsidies } from "~/lib/mcp";
import type { Route } from "./+types/subsidies";
import { useNavigation, useSubmit, useSearchParams } from "react-router";
import { Search, Loader2, HandCoins, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || undefined;
  const subsidies = await getSubsidies(q);
  return { subsidies, q };
}

export default function Subsidies({ loaderData }: Route.ComponentProps) {
  const { subsidies, q } = loaderData;
  const navigation = useNavigation();
  const submit = useSubmit();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(q || "");
  const searching = navigation.location && new URLSearchParams(navigation.location.search).has("q");

  useEffect(() => {
    setSearchTerm(q || "");
  }, [q]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    submit(formData, { replace: true });
  };

  return (
    <div className="space-y-8">
      {/* Barre de recherche */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <form 
          id="search-form" 
          role="search"
          onSubmit={handleSearch}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="q"
              type="search"
              name="q"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une aide, un secteur, un mot-clé..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searching && (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              )}
              <button 
                type="submit"
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
              >
                Rechercher
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Liste des résultats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subsidies.length > 0 ? (
          subsidies.map((s) => (
            <div key={s.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <HandCoins className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{s.amount}</span>
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{s.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 flex-1">
                {s.description}
              </p>

              <div className="space-y-3 mb-6">
                <div className="text-sm">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Éligibilité :</span>
                  <p className="text-slate-500 dark:text-slate-500">{s.eligibility}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Catégorie :</span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {s.category}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-sm text-slate-500 italic">Date limite : {s.deadline}</span>
                <a 
                  href={`https://www.data.gouv.fr/fr/datasets/${s.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 font-bold hover:underline"
                >
                  Détails <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-500 text-lg">Aucune aide trouvée pour votre recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
}
