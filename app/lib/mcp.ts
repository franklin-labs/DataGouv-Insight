export interface Subsidy {
  id: string;
  title: string;
  amount: string;
  description: string;
  eligibility: string;
  deadline: string;
  category: "Innovation" | "Emploi" | "Écologie" | "Artisanat";
}

export interface MarketTrend {
  id: string;
  sector: string;
  growth: string;
  trend: "up" | "down" | "stable";
  insight: string;
}

export interface Regulation {
  id: string;
  title: string;
  date: string;
  summary: string;
  sector: string;
}

const DATA_GOUV_API_URL = "https://www.data.gouv.fr/api/1";

/**
 * Fetch helper for Data.gouv.fr API
 */
async function fetchDG<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${DATA_GOUV_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur Data.gouv API: ${response.statusText}`);
  }

  return response.json();
}

interface DataGouvDataset {
  id: string;
  title: string;
  description: string;
  last_modified: string;
  organization: { name: string } | null;
  tags: string[];
  page: string;
}

interface DataGouvResponse {
  data: DataGouvDataset[];
}

/**
 * Call an MCP tool directly on the official server
 */
export async function callMCPTool(name: string, args: any = {}): Promise<string> {
  const response = await fetch("https://mcp.data.gouv.fr/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name,
        arguments: args
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Erreur MCP Tool: ${response.statusText}`);
  }

  const result = await response.json();
  return result.result?.content?.[0]?.text || "Aucun résultat trouvé.";
}

/**
 * Nettoie le HTML et les balises Markdown des descriptions
 */
function cleanDescription(text: string): string {
  if (!text) return "Aucune description disponible.";
  return text
    .replace(/<[^>]*>/g, '') // Supprime HTML
    .replace(/[#*`]/g, '')    // Supprime Markdown simple
    .replace(/\n\s*\n/g, '\n') // Supprime doubles sauts de ligne
    .trim();
}

/**
 * Récupère les subventions (réelles via Data.gouv.fr)
 */
export async function getSubsidies(query?: string): Promise<Subsidy[]> {
  const q = query ? `subventions ${query}` : "subventions";
  const response = await fetchDG<DataGouvResponse>(`/datasets/?q=${encodeURIComponent(q)}&page_size=10`);
  
  return response.data.map(d => ({
    id: d.id,
    title: d.title.length > 80 ? d.title.substring(0, 77) + "..." : d.title,
    amount: "Aide Publique",
    description: cleanDescription(d.description).substring(0, 160) + "...",
    eligibility: d.organization?.name || "Consulter le jeu de données",
    deadline: new Date(d.last_modified).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' }),
    category: (d.tags && d.tags.length > 0) ? (d.tags[0].charAt(0).toUpperCase() + d.tags[0].slice(1)) : "Artisanat"
  }));
}

/**
 * Récupère les tendances du marché (réelles via Data.gouv.fr)
 */
export async function getMarketTrends(): Promise<MarketTrend[]> {
  const response = await fetchDG<DataGouvResponse>(`/datasets/?q=${encodeURIComponent("conjoncture économique")}&page_size=5`);
  
  return response.data.map(d => ({
    id: d.id,
    sector: d.organization?.name || "Économie",
    growth: "Données",
    trend: "stable",
    insight: d.title
  }));
}

/**
 * Récupère les réglementations (réelles via Data.gouv.fr)
 */
export async function getRegulations(): Promise<Regulation[]> {
  const response = await fetchDG<DataGouvResponse>(`/datasets/?q=${encodeURIComponent("réglementation")}&page_size=5`);
  
  return response.data.map(d => {
    // Essayer de deviner le secteur à partir des tags ou du titre
    const text = (d.title + " " + (d.tags?.join(" ") || "")).toLowerCase();
    let sector = "Général";
    if (text.includes("bâtiment") || text.includes("construction") || text.includes("urbanisme")) sector = "Bâtiment";
    else if (text.includes("alimentaire") || text.includes("agriculture") || text.includes("santé")) sector = "Alimentaire";
    else if (text.includes("fiscal") || text.includes("impôt") || text.includes("finance")) sector = "Fiscalité";

    return {
      id: d.id,
      title: d.title,
      date: new Date(d.last_modified).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' }),
      summary: cleanDescription(d.description).substring(0, 200) + "...",
      sector: sector as any
    };
  });
}
