# ÉLECTRO ASSIST 24H — Application mobile

Application Expo / React Native destinée aux clients, aux électriciens et aux évaluateurs,
conformément au plan (§4.3 et §11). Mêmes tokens de charte que le web et l'administration.

## Prérequis

- Node.js 22 ou supérieur.
- L'application Expo Go sur un téléphone, ou un simulateur iOS / émulateur Android.
- Le dépôt backend cloné dans `../backend` pour le contrat OpenAPI et le mock.

```bash
cd ../backend
npm install
```

## Démarrage

Dans un premier terminal, lancer le mock :

```bash
npm run mock
```

Dans un second terminal :

```bash
cd mobile
npm install
npm run start
```

Puis scanner le QR code avec Expo Go, ou appuyer sur `a` / `i` pour ouvrir un émulateur.

L'API se règle avec `EXPO_PUBLIC_API_URL` dans `.env` (voir `.env.example`) :

| Cible | URL |
|---|---|
| Simulateur iOS / navigateur | `http://127.0.0.1:4010` |
| Émulateur Android | `http://10.0.2.2:4010` |
| Téléphone physique | `http://<IP-de-la-machine>:4010` |

Le mock Prism n'est pas exposé sur le réseau par défaut : le lancer avec
`npx prism mock docs/openapi.json -p 4010 --host 0.0.0.0` depuis `backend/` si un
téléphone physique doit le joindre.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run start` | Serveur de développement Expo |
| `npm run android` | Ouvre sur Android |
| `npm run ios` | Ouvre sur iOS (macOS) |
| `npm run web` | Ouvre la version web Expo |
| `npm run typecheck` | Vérification TypeScript |
| `npm run lint` | Analyse statique (Oxlint) |
| `npm run api:generate` | Régénère les types depuis `../backend/docs/openapi.json` |
| `npm run mock` | Lance le mock Prism du backend (port 4010) |

## Contrat d'API

`src/lib/api/schema.d.ts` est généré depuis OpenAPI et ne doit jamais être modifié à la main.
`src/lib/api/client.ts` expose le client typé, les en-têtes `X-Client-Platform: mobile` et
`X-Device-Id`, le jeton `Authorization` en mémoire, le format d'erreur normatif et la clé
d'idempotence.

`.npmrc` active `legacy-peer-deps` : `openapi-typescript@7` déclare TypeScript 5 comme pair,
alors qu'Expo SDK 58 utilise TypeScript 6. La génération fonctionne avec TypeScript 6.

## Navigation (étapes 0 et 1)

| Écran | Contenu |
|---|---|
| `Accueil` | Page de fondation, état réel du socle |
| `Connexion` | C-01 : numéro de téléphone béninois |
| `Verification` | C-02 : code à 6 chiffres, compte à rebours et renvoi |
| `Profil` | C-03 : prénom, nom et commune issue du référentiel |
| `Espace` | Espace protégé : identité, commune et déconnexion |

La session est restaurée par `SessionProvider`. Tant qu'elle est anonyme, l'espace protégé
n'est pas déclaré dans le navigateur : la garde est structurelle. Après vérification du code,
la pile authentifiée démarre sur `Profil` si le compte est nouveau, sinon sur `Espace`.
Aucun utilisateur, numéro ou code n'est simulé.

## Session et stockage

- Le jeton d'accès reste **en mémoire** ; il n'est jamais écrit sur le disque.
- Le jeton de rafraîchissement, le jeton CSRF exigé par `/auth/refresh` et l'identifiant
  d'appareil sont conservés dans `expo-secure-store` (Keystore Android, trousseau iOS).
- Le renouvellement est anticipé une minute avant l'expiration ; la déconnexion révoque la
  session côté serveur puis efface le stockage sécurisé.
- Aperçu web (`npm run web`) : `expo-secure-store` n'a pas d'implémentation web, la session
  n'est donc pas persistée après rechargement. C'est un mode de prévisualisation, pas la cible.

## Structure

```
src/
  components/       Marque, bouton, champ, alerte, ligne d'état
  features/session/ Contexte, appels d'authentification, stockage sécurisé
  lib/api/          Client typé, types générés
  navigation/       Pile racine et garde par session
  screens/          Accueil, téléphone, code, profil, espace, chargement
  theme/            Tokens de la charte (couleurs, espacements, typographie)
```

## Règles de conception

- Charte : bleu nuit `#0B2545`, jaune `#F2B705`, fond `#F4F6F8`, Poppins / Inter.
- Cibles tactiles de 48 minimum, contraste WCAG 2.2 AA, safe areas respectées.
- Aucune règle métier côté client : montants, droits et états viennent de l'API.
- Aucune donnée fictive : les écrans métier arrivent après l'étape 1.

## Avancement

Voir `../SUIVI_PLAN.md`.
