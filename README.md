# PiloteSite — Assistant IA Conducteur de Travaux

Application web de pilotage de chantier connectée à Notion et n8n.

## Stack technique

- **Frontend** : React + Vite + Tailwind CSS → hébergé sur Vercel
- **Backend** : Node.js + Express → hébergé sur Railway
- **Base de données** : Notion API (Tâches + Planning + Emails)
- **Agent IA** : n8n (workflow séparé, déjà configuré)

## Structure du projet

```
pilotesite/
├── frontend/          # Application React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   │   ├── layout/    # Sidebar, Topbar, ChatBar
│   │   │   ├── dashboard/ # Cartes stats, To-do, Mails
│   │   │   ├── tasks/     # Liste et détail des tâches
│   │   │   ├── mails/     # File de mails à valider
│   │   │   ├── planning/  # Calendrier semaine
│   │   │   └── documents/ # Bibliothèque documents
│   │   ├── pages/         # Pages principales
│   │   ├── hooks/         # Hooks React custom
│   │   ├── services/      # Appels API backend
│   │   ├── utils/         # Fonctions utilitaires
│   │   └── styles/        # CSS global
│   └── package.json
├── backend/           # Serveur Node.js
│   ├── src/
│   │   ├── routes/        # Routes API Express
│   │   ├── middleware/     # Auth, CORS, erreurs
│   │   ├── services/      # Logique Notion API
│   │   └── utils/         # Helpers
│   └── package.json
└── README.md
```

## Installation

### Prérequis
- Node.js 18+
- Un compte Notion avec les bases Tâches + Planning créées
- Le workflow n8n configuré

### 1. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Remplis VITE_API_URL dans .env.local
npm run dev
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Remplis NOTION_API_KEY, NOTION_DB_TACHES_ID, NOTION_DB_PLANNING_ID, NOTION_DB_EMAILS_ID
npm run dev
```

## Déploiement

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```

### Backend → Railway
Connecte ton repo GitHub à Railway, il détecte automatiquement Node.js.
Ajoute les variables d'environnement dans le dashboard Railway.

## Variables d'environnement

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:3001   # en dev
# VITE_API_URL=https://ton-backend.railway.app   # en prod
```

### Backend (.env)
```
PORT=3001
NOTION_API_KEY=secret_xxxxxxxxxxxx
NOTION_DB_TACHES_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_PLANNING_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DB_EMAILS_ID=37a31a6d-50b2-8001-af9d-cca976298eb8
FRONTEND_URL=http://localhost:5173
```
