# OptiGoo — Prospection commerciale locale (Next.js + TypeScript)

Application full-stack pour identifier des opportunités d'amélioration de visibilité locale à partir des données officielles Google Places API (Text Search + Place Details), sans scraping HTML fragile.

## 1) Architecture proposée

### Stack retenue
- **Frontend + backend**: Next.js 14 (App Router, API Routes, Server Actions), TypeScript strict, Tailwind CSS
- **DB**: Prisma ORM + PostgreSQL (`DATABASE_URL`)
- **Tests**: Vitest (logique scoring + audit)

### Modules
- `lib/services/placesClient.ts`: intégration Google Places API officielle + fallback mock.
- `lib/services/scoring.ts`: `computeOpportunityScore(place)` configurable.
- `lib/services/audit.ts`: `generateQuickAudit(place)` basée sur faits observables.
- `app/api/search`: recherche textuelle, enrichissement, normalisation, persistance.
- `app/api/companies`: pagination + filtres.
- `app/api/export`: export CSV/JSON (all/selected).
- `app/settings`: configuration scoring modifiable.
- `app/templates`: bibliothèque de templates email/SMS avec variables.

## 2) Champs réellement accessibles via Google Places API retenue

Accessible de manière stable (selon disponibilité du lieu):
- nom
- adresse formatée
- téléphone international
- site web
- note moyenne
- nombre d’avis
- photos (présence / nombre de métadonnées retournées)
- types / catégories
- horaires (`opening_hours.weekday_text`)
- `place_id`
- URL Google Maps (`url`)

Non disponibles proprement via cette source:
- **email direct** → laissé vide (`null`)
- **description Google Business** (souvent non exposée directement dans Places Details classique selon configuration/produit)

## 3) Limites fonctionnelles importantes

- Les emails ne sont pas extraits (non fournis officiellement par Places Details): la colonne email reste vide.
- Les données peuvent être absentes selon le lieu (ex: téléphone/horaires non renseignés).
- Le score d’opportunité repose uniquement sur signaux observables (pas d’inférence non vérifiable).
- Un rate limiting mémoire simple est fourni (single-instance). Pour production multi-instance: Redis recommandé.

## 4) Fonctionnalités livrées

Écrans:
1. `/` formulaire de recherche métier + ville
2. `/results` tableau résultats, sélection, aperçu message, export
3. `/companies/[id]` détail entreprise + audit
4. `/history` historique des recherches
5. `/settings` paramètres de scoring
6. `/templates` bibliothèque templates

Moteur d’analyse:
- `computeOpportunityScore(place): number + raisons`
- `generateQuickAudit(place): string[]`
- pondérations configurables en base (`ScoringConfig`)

Exports:
- CSV / JSON
- résultats sélectionnés (extension facile vers tous/filtrés côté API)

## 5) Configuration Google Places API

1. Créer un projet Google Cloud.
2. Activer **Places API**.
3. Créer une clé API restreinte.
4. Renseigner `.env`:
   - `GOOGLE_MAPS_SERVER_API_KEY=...`
   - `USE_MOCK_DATA=false`
5. Respecter quotas, coûts, politiques d’attribution Google Maps Platform.

## 6) Lancement local immédiat (PostgreSQL)

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init_postgresql
npm run db:seed
npm run dev
```

Puis ouvrir `http://localhost:3000`.

## 7) Données mock pour test sans API

- `USE_MOCK_DATA=true` dans `.env`
- dataset: `lib/data/mockPlaces.ts`
- idéal pour démo hors quota / hors clé API

## 8) Transparence scoring (valeurs initiales)

- 5 à 10 avis => +30
- pas de site => +20
- peu de photos => +20
- note entre 4.0 et 4.7 => +10
- catégorie générique => +10
- infos incomplètes => +10

Tous les seuils sont modifiables dans l’écran **Scoring**.

## 9) Sécurité et conformité

- Pas d’envoi automatique de message.
- Génération de texte + copie/export seulement.
- Validation des entrées API (`zod`).
- Erreurs API renvoyées explicitement.

## 10) Déploiement (Vercel)

- Les routes API Prisma sont forcées en **runtime Node.js dynamique** (`force-dynamic`) pour éviter la collecte statique de données au build.
- Vérifier que `DATABASE_URL` est défini dans les variables d’environnement du projet (Build + Runtime).
- Pour la production, préférer PostgreSQL managé plutôt que SQLite local.


## 11) Variables d’environnement (Vercel)

- `DATABASE_URL` : URL PostgreSQL de production (Neon, Supabase, RDS, etc.)
- `GOOGLE_MAPS_SERVER_API_KEY` : clé API Google Places
- `USE_MOCK_DATA=false` en production
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` : clé publique pour composants front Google Maps (si carte côté client)

## 12) Commandes migration / déploiement

```bash
# Local
npx prisma generate
npx prisma migrate dev --name init_postgresql

# CI/Production (Vercel)
npx prisma generate
npx prisma migrate deploy
npm run build
```

## 13) Compatibilité Vercel App Router

- Les routes API Prisma sont forcées en runtime Node dynamique (`force-dynamic` + `runtime = 'nodejs'`).
- Les pages server qui lisent la DB (`/companies/[id]`, `/history`, `/settings`, `/templates`) sont aussi dynamiques pour éviter les accès DB au build.
- `app/companies/[id]/page.tsx` n'utilise pas `generateStaticParams` et appelle `notFound()` si l'entité est absente.

## 14) Configuration locale (.env.local)

Créer un fichier `.env.local` (non versionné) :

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
GOOGLE_MAPS_SERVER_API_KEY="votre_cle_serveur"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="votre_cle_publique_si_carte_front"
USE_MOCK_DATA="false"
```

Si la clé serveur est absente, l'application bascule sur le dataset mock et écrit un warning explicite en logs serveur.
