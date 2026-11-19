# ÉLECTRO ASSIST 24H — Console d'administration

Client web distinct réservé aux administrateurs et évaluateurs, conformément au plan (§4.2 et §11).
React 19, Vite et TypeScript, mêmes tokens de charte que le web client.

## Démarrage

Le backend doit être cloné dans `../backend` et ses dépendances installées.

```bash
cd ../backend
npm install
```

Puis, dans deux terminaux :

```bash
npm run mock     # mock Prism sur le port 4010
npm run dev      # console sur http://localhost:5174
```

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement (port 5174) |
| `npm run build` | Vérification TypeScript puis build de production |
| `npm run lint` | Analyse statique (Oxlint) |
| `npm run api:generate` | Régénère les types depuis `../backend/docs/openapi.json` |
| `npm run mock` | Lance le serveur mock Prism (port 4010) |

## Contrat

`src/lib/api/schema.d.ts` est généré depuis OpenAPI et ne doit jamais être modifié à la main.
`VITE_API_URL` se renseigne sans `/api/v1` ; vide en développement pour utiliser le proxy Vite.

## Routes

| Route | Contenu |
|---|---|
| `/` | Redirection vers `/connexion` |
| `/connexion` | A-01 : numéro, mot de passe, puis code TOTP |
| `/invitation?token=…` | V-01 : activation de l'invitation et choix du mot de passe |
| `/app` | Console protégée (vue d'ensemble) |
| `/app/securite/totp` | Enrôlement du second facteur (QR code + clé manuelle) |
| `*` | 404 |

Aucune donnée métier n'est simulée. Les écrans de vérification arrivent à l'étape 3.

## Session

- Le jeton d'accès reste en mémoire ; le refresh est porté par le cookie httpOnly.
- Le jeton CSRF de `sessionStorage` permet de restaurer la session après rechargement.
- L'identifiant d'appareil est conservé dans `localStorage` et envoyé en `X-Device-Id`.

## Incohérences de contrat connues

- `/admin/auth/login` renvoie `mfaToken` quand un second facteur est requis, mais le schéma OpenAPI
  ne le déclare pas. La console lit la réponse réelle et **refuse** d'ouvrir la session si le jeton
  manque, plutôt que de contourner le MFA.
- `AdminSessionResponseDto` exige `accessToken` même pour un défi MFA, ce qui ne correspond pas au
  flux réel.
- `user-agent` est déclaré obligatoire alors qu'un navigateur ne peut pas le forger.
- Le plan prévoit `/admin/invitations/{token}/accept` ; le contrat expose `/admin/invitations/accept`
  avec le jeton dans le corps.

## Avancement

Voir `../SUIVI_PLAN.md`.
