# ÉLECTRO ASSIST 24H — Application web

Client web de la plateforme : espace client et espace électricien.
Réalisé avec React 19, Vite et TypeScript, conformément au plan de travail (§4.1 et §11).

## Prérequis

- Node.js 22 ou supérieur.
- Le dépôt backend cloné dans `../backend` : il fournit le contrat OpenAPI et le serveur mock.

```bash
cd ../backend
npm install
```

## Démarrage

Dans un premier terminal, lancer le mock :

```bash
npm run mock
```

Dans un second terminal, lancer l'application :

```bash
npm install
npm run dev
```

L'application est servie sur `http://localhost:5173`. Le mock Prism écoute sur `http://localhost:4010` ;
Vite proxifie `/api` vers ce serveur, donc aucun réglage n'est nécessaire en développement.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement avec rechargement à chaud |
| `npm run build` | Vérification TypeScript puis build de production dans `dist/` |
| `npm run preview` | Sert localement le build de production |
| `npm run lint` | Analyse statique (Oxlint) |
| `npm run api:generate` | Régénère les types depuis `../backend/docs/openapi.json` |
| `npm run mock` | Lance le serveur mock Prism du backend (port 4010) |

## Contrat d'API

Le contrat OpenAPI fait foi. Les types sont générés dans `src/lib/api/schema.d.ts` :

```bash
npm run api:generate
```

Ne jamais modifier ce fichier à la main. `src/lib/api/client.ts` expose le client typé,
l'en-tête `X-Client-Platform`, le format d'erreur normatif et la clé d'idempotence.

L'URL de l'API se règle avec `VITE_API_URL`, **sans** `/api/v1` (les chemins générés
contiennent déjà le préfixe). Laisser vide en développement pour utiliser le proxy Vite.

```
# .env
VITE_API_URL=
```

TypeScript est fixé à 5.9 : `openapi-typescript` 7 ne déclare pas encore TypeScript 7
comme pair compatible.

## Routes

| Route | Contenu |
|---|---|
| `/` | Accueil, état réel du socle |
| `/connexion` | C-01 puis C-02 : téléphone et code à 6 chiffres |
| `/connexion/profil` | C-03 : prénom, nom et commune (protégée) |
| `/app` | Espace personnel : profil `/me` et déconnexion (protégée) |
| `*` | 404 |

## Session

- Le jeton d'accès reste **en mémoire**, jamais dans `localStorage`.
- Le jeton de rafraîchissement est porté par le cookie httpOnly posé par le serveur.
- Le jeton CSRF nécessaire à `/auth/refresh` est conservé en `sessionStorage`.
- L'identifiant d'appareil est conservé dans `localStorage` et envoyé en `X-Device-Id`.
- Le renouvellement est anticipé une minute avant l'expiration.

## Structure

```
src/
  components/       En-tête, pied de page, marque
  features/session/ Contexte, appels d'authentification, jetons, garde de routes
  lib/api/          Client typé, types générés, erreur normative, idempotence
  pages/            Accueil, connexion, profil, espace, 404
  styles/           tokens.css (charte), global.css (socle), auth.css (étape 1)
```

## Règles de conception

- Charte : bleu nuit `#0B2545`, jaune `#F2B705`, fond `#F4F6F8`, Poppins / Inter.
- Cibles tactiles de 48 px minimum, contraste WCAG 2.2 AA, focus visible.
- Aucune règle métier côté client : montants, droits et états viennent de l'API.
- Erreurs toujours au format `{ error: { code, message, details } }`.
- Listes paginées par curseur (20 par défaut, 50 maximum).

## Avancement

Le suivi détaillé des étapes se trouve dans `../SUIVI_PLAN.md`.
