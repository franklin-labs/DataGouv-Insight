# DataGouv Insight

Une plateforme moderne d'analyse et de visualisation des données publiques françaises (OpenData), conçue pour offrir une interface intuitive aux professionnels et décideurs.

## Fonctionnalités Clés

- **Analyse des Tendances** : Visualisation en temps réel des indicateurs de conjoncture économique via l'API officielle de Data.gouv.fr.
- **Veille sur les Subventions** : Moteur de recherche performant pour identifier les aides publiques et subventions disponibles.
- **Suivi Réglementaire** : Accès simplifié aux dernières réglementations sectorielles (Bâtiment, Alimentaire, Fiscalité, etc.).
- **Assistant IA Contextuel** : Intégration de l'IA (via Groq) pour interpréter les jeux de données complexes et fournir des conseils personnalisés.
- **Architecture MCP** : Utilisation du Model Context Protocol pour une interaction fluide entre l'IA et les sources de données gouvernementales.

## Stack Technique

- **Frontend** : React 18 avec [React Router v7](https://reactrouter.com/) (Framework full-stack).
- **Styling** : [Tailwind CSS](https://tailwindcss.com/) pour une interface responsive et mode sombre natif.
- **Icons** : [Lucide React](https://lucide.dev/) pour une iconographie moderne.
- **API Data** : Intégration directe avec l'API de [Data.gouv.fr](https://www.data.gouv.fr/).
- **LLM** : Groq SDK pour des réponses IA ultra-rapides.
- **Langage** : TypeScript pour une robustesse maximale du code.

## Installation et Démarrage

### Prérequis

- Node.js (v18+)
- pnpm (recommandé) ou npm

### Installation

```bash
pnpm install
```

### Configuration

Créez un fichier `.env` à la racine du projet :

```env
GROQ_API_KEY=votre_cle_groq
```

### Développement

Lancez le serveur de développement avec HMR :

```bash
pnpm dev
```

L'application sera accessible sur `http://localhost:5173`.

## Architecture du Projet

```text
├── app/
│   ├── components/    # Composants UI réutilisables (Navbar, Cards, etc.)
│   ├── lib/           # Logique métier, API clients et stores (Zustand)
│   ├── routes/        # Pages et gestion du routage (React Router v7)
│   └── root.tsx       # Point d'entrée de l'application
├── public/            # Assets statiques
└── build/             # Output de production
```

## Déploiement

Le projet est optimisé pour un déploiement sur Vercel, Netlify ou toute plateforme supportant Node.js.

```bash
pnpm build
pnpm start
```

---
Développé avec passion pour rendre la donnée publique accessible et actionnable.
