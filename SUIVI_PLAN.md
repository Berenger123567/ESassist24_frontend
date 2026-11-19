# SUIVI DU PLAN DE TRAVAIL — ÉLECTRO ASSIST 24H

> **Source de vérité :** `ELECTRO_ASSIST_24H_Doc1_Plan_de_travail.docx` (v1.0, 19 novembre 2026)
> **Dernière mise à jour :** 19 novembre 2026
> **Règle :** une étape n'est déclarée terminée que lorsque **tous** ses critères de passage sont remplis. Un critère manquant laisse l'étape ouverte.

## Légende

| Statut | Signification |
|---|---|
| ✅ Fait | Livré et vérifié |
| 🟡 En cours | Commencé, non validé |
| ⬜ À faire | Non commencé |
| ⛔ Bloqué | Dépend d'une décision ou d'un élément extérieur |

Clients concernés : **Web** (client + électricien), **Mobile** (client + électricien + évaluateur), **Admin** (administrateur + évaluateur, client web distinct).

> **Backend récupéré :** `backend/` est un clone de `https://github.com/Berenger123567/ESassist24_backend.git`, branche `main`, commit `106c383` (« étape 0 à étape 2 »). Il est en lecture seule pour le front : on ne modifie que le contrat et on lance le mock. La corbeille n'est plus consultée.

---

## Vue d'ensemble

| # | Étape | Web | Mobile | Admin | État |
|---|---|---|---|---|---|
| 0 | Fondations | ✅ | ✅ | ✅ | Socle des trois clients livré ; reste CI, environnements et migration |
| 1 | Identité et accès | ✅ | ✅ | ✅ | 🟡 Écrans livrés et testés ; canal des codes à trancher |
| 2 | Profils, zones et documents | ⬜ | ⬜ | — | À faire |
| 3 | Centre de confiance : vérification | ⬜ | ⬜ | ⬜ | À faire |
| 4 | Évaluation pratique et certification | ⬜ | ⬜ | ⬜ | À faire |
| 5 | Demandes de panne et recherche par zone | ⬜ | ⬜ | — | À faire |
| 6 | Missions, messagerie et code d'arrivée | ⬜ | ⬜ | — | À faire |
| 7 | Devis, suivi d'intervention et compte rendu | ⬜ | ⬜ | — | À faire |
| 8 | Paiements, commissions et abonnements | ⬜ | ⬜ | — | À faire |
| 9 | Réputation, réclamations, garanties et niveaux | ⬜ | ⬜ | ⬜ | À faire |
| 10 | Recette, sécurité et projet pilote | ⬜ | ⬜ | ⬜ | À faire |

---

## Étape 0 — Fondations (1 semaine)

**Objectif :** socle technique sain, les trois clients et le backend pouvant avancer en parallèle.

**Critères de passage (plan §11) :** pipeline vert sur l'API et les trois clients ; migration montée puis annulée sans erreur ; le mock répond aux routes décrites ; le client généré compile sur mobile, web et administration ; OpenAPI publié ; environnements de développement et de test en ligne ; projet complet lançable en local par **une commande documentée**.

| Livrable | Web | Mobile | Admin |
|---|---|---|---|
| Projet initialisé | ✅ React 19 + Vite + TypeScript | ✅ Expo SDK 58 + TypeScript | ✅ React 19 + Vite + TypeScript |
| Design tokens de la charte | ✅ `src/styles/tokens.css` | ✅ `src/theme/tokens.ts` | ✅ `src/styles/tokens.css` |
| Mise en page responsive de base | ✅ en-tête, pied de page, accueil | ✅ accueil, connexion et espace protégé | ✅ coquille de console et écrans d'accès |
| Navigation avec garde par rôle | ✅ squelette (`RequireAuth`, `SessionProvider`) | ✅ pile conditionnelle selon la session | ✅ `RequireAuth`, `SessionProvider` |
| Client API généré depuis OpenAPI | ✅ types générés et compilés (`npm run api:generate`) | ✅ types générés et compilés (`npm run api:generate`) | ✅ types générés et compilés (`npm run api:generate`) |
| Build / pipeline vert | ✅ `npm run build` + `npm run lint` | ✅ `npm run typecheck` + `npm run lint` + export Android | ✅ `npm run build` + `npm run lint` |
| Lançable par une commande | ✅ `npm run dev` (mock en parallèle : `npm run mock`) | ✅ `npm run start` (mock en parallèle : `npm run mock`) | ✅ `npm run dev` (port 5174, mock en parallèle) |

**Reste à faire pour clore l'étape 0 :**

1. ✅ Backend cloné, installé, mock Prism vérifié et client typé généré.
2. ✅ `mobile/` initialisé : Expo, tokens, navigation, garde de session, client typé, export Android vérifié.
3. ✅ Client d'administration créé dans `admin/` : coquille, routes d'accès, garde de session, client typé.
4. ⬜ Mettre en place l'intégration continue et les environnements de développement/test.
5. ⬜ Vérifier la migration montée puis annulée (côté backend).

**Détail web livré :**

- `web/src/lib/api/schema.d.ts` : types générés depuis `backend/docs/openapi.json` (`106c383`), jamais modifiés à la main.
- `web/src/lib/api/client.ts` : client typé `openapi-fetch`, en-tête `X-Client-Platform`, `ApiError` au format `{ error: { code, message, details } }`, `Idempotency-Key`.
- `web/vite.config.ts` : proxy `/api` vers le mock Prism (port 4010).
- `web/src/features/session/` : contexte de session et garde de routes, sans utilisateur simulé.
- Routes : `/` (accueil de fondation), `/connexion` (placeholder explicite étape 1), `/app` (protégée), `*` (404).
- Aucune donnée métier fictive, aucun écran de l'étape 1.
- Vérifié : `GET /health` et `GET /api/v1/specialties` répondent via le proxy Vite, page d'accueil en HTTP 200.

**Détail mobile livré :**

- `mobile/src/theme/tokens.ts` : mêmes couleurs, espacements et typographie que le web, cible tactile 48.
- `mobile/src/navigation/RootNavigator.tsx` : accueil et connexion déclarés seulement si la session est anonyme ; l'espace protégé n'est enregistré qu'une fois la session authentifiée.
- `mobile/src/lib/api/` : client `openapi-fetch` (`X-Client-Platform: mobile`), erreurs normatives, idempotence ; types générés depuis le contrat.
- `mobile/src/screens/` : accueil de fondation, attente C-01 → C-03, espace protégé.
- `EXPO_PUBLIC_API_URL` documenté pour simulateur iOS, émulateur Android (`10.0.2.2`) et appareil physique.
- Vérifié : `npm run typecheck`, `npm run lint`, `npx expo-doctor` (20/20) et `npx expo export --platform android` sans erreur.
- `.npmrc` : `legacy-peer-deps` requis car `openapi-typescript@7` ne déclare pas TypeScript 6 comme pair.

**Détail administration livré :**

- `admin/` est un client Vite distinct (port 5174), comme prévu par le plan.
- Coquille de salle de contrôle (barre latérale, barre supérieure), routes `/connexion`, `/invitation`, `/app`, `*`.
- `AdminLayout` et `ConsolePage` : état réel de l'étape 0, sans données métier.
- A-01 et V-01 restent des écrans d'attente explicites jusqu'à l'étape 1.
- Vérifié : `npm run build` et `npm run lint` verts.

---

## Étape 1 — Identité et accès (1 semaine)

**Objectif :** inscription, connexion sûre et orientation par rôle.

**Écrans :** C-01 (téléphone), C-02 (code à 6 chiffres), C-03 (nom et commune) · A-01 (mot de passe + TOTP) · V-01 (activation d'invitation).

**Règles :** code valable 5 min, 3 tentatives ; jeton d'accès 15 min ; refresh à rotation, réutilisation = révocation ; web = jeton en mémoire + cookie httpOnly ; mobile = stockage sécurisé ; TOTP obligatoire pour les administrateurs ; aucun numéro complet dans les journaux.

**Condition de passage :** tous les tests d'authentification passent, relecture croisée effectuée, **canal des codes décidé**.

| Tâche | Web | Mobile | Admin |
|---|---|---|---|
| C-01 / C-02 / C-03 | ✅ | ✅ | — |
| A-01 (mot de passe + TOTP) | — | — | ✅ |
| V-01 (activation invitation) | — | — | ✅ |
| Garde par rôle et redirection | ✅ | ✅ | ✅ |

**Détail livré :**

- **Web** : `/connexion` (C-01 téléphone, C-02 code), `/connexion/profil` (C-03 : prénom, nom, commune depuis `/zones`), `/app` (profil `/me` et déconnexion). Jeton d'accès en mémoire, `csrfToken` en `sessionStorage`, renouvellement une minute avant expiration, cookie httpOnly. Parcours testé de bout en bout avec le mock Prism.
- **Mobile** : écrans `Connexion`, `Verification`, `Profil`, `Espace`. Jeton d'accès en mémoire ; refresh token, jeton CSRF et identifiant d'appareil dans `expo-secure-store`. Renouvellement anticipé et déconnexion révoquée. Parcours C-01 → C-03 → espace et déconnexion vérifiés via l'aperçu web Expo avec le mock.
- **Admin** : `/connexion` (A-01 : numéro, mot de passe, puis code TOTP), `/invitation` (V-01 : jeton, mot de passe, prénom/nom), `/app/securite/totp` (enrôlement TOTP avec QR code et clé manuelle), `/app` protégé. Parcours testé avec le mock (connexion, enrôlement, activation, déconnexion, invitation).

**Incohérences de contrat à corriger côté backend :**

- `/admin/auth/login` renvoie `mfaToken` en cas de défi MFA, mais le schéma OpenAPI ne le déclare pas ; la console le lit dans la réponse réelle et refuse d'ouvrir la session s'il manque.
- `AdminSessionResponseDto` exige `accessToken` même pour un défi MFA.
- `user-agent` est déclaré obligatoire alors qu'un navigateur ne peut pas le définir.
- `AdminSessionResponseDto.mfaRequired` est déclaré obligatoire, mais le mock renvoie aussi `mfaRequired` à `false` sans jeton MFA.
- Le plan prévoit `/admin/invitations/{token}/accept` ; le contrat expose `/admin/invitations/accept` avec le jeton dans le corps.
- `/me` type `firstName` et `lastName` comme `object` ; les clients n'affichent qu'une valeur texte.
- `/auth/otp/request` déclare `channel` avec une valeur par défaut, mais le type généré le rend obligatoire ; les clients envoient explicitement `SMS` (valeur par défaut du contrat) en attendant la décision produit.

🟡 **Reste bloqué par :** canal des codes non décidé (SMS, WhatsApp ou les deux). Les écrans sont livrés et testés, mais l'étape 1 ne peut pas être déclarée terminée avant cette décision.

---

## Étapes 2 à 10 — Rappel du périmètre

| # | Étape | Écrans principaux | Condition de passage |
|---|---|---|---|
| 2 | Profils, zones et documents | E-02, E-03, E-04 | Dossier complet déposé de bout en bout sur mobile et web |
| 3 | Centre de confiance : vérification | A-02 → A-05, A-11, A-12 | Un dossier passe En attente → Vérifié, un autre → Refusé, audit complet |
| 4 | Évaluation pratique et certification | V-01 → V-04, A-06 | Professionnel certifié de bout en bout, parité mobile/web |
| 5 | Demandes de panne et recherche par zone | C-04 → C-08, E-05, E-06 | Client déclare une panne et trouve des professionnels de sa zone |
| 6 | Missions, messagerie et code d'arrivée | C-09, C-10, E-07, E-08 | Mise en relation sécurisée, code d'arrivée vérifié |
| 7 | Devis, suivi et compte rendu | C-11 → C-13, E-09 → E-11 | Intervention encadrée jusqu'à la clôture |
| 8 | Paiements, commissions, abonnements | C-14, E-12, A-07 → A-09 | Argent traçable et exact, idempotence vérifiée |
| 9 | Réputation, réclamations, garanties | C-15, C-16, E-13 → E-15, A-10 | Confiance mesurée et protégée, niveaux à jour |
| 10 | Recette, sécurité, pilote | Tous | Parcours complets testés, sécurité vérifiée, pilote prêt |

---

## Blocages et décisions en attente

| # | Point | Impact | Statut |
|---|---|---|---|
| 1 | Client typé et mock | Étape 0 non clôturable | ✅ Générés et vérifiés (web, admin, mobile) |
| 2 | Dossier du client d'administration | Le plan exige un client web distinct | ✅ Créé dans `admin/` |
| 3 | Partage des tokens et du client API entre `web/` et `mobile/` | Workspace npm à la racine recommandé | ⛔ À trancher |
| 4 | Canal des codes (SMS / WhatsApp / les deux) | Seul point bloquant pour clore l'étape 1 | ⛔ À trancher (défaut `SMS` du contrat utilisé en attendant) |
| 5 | « Document 2 : Normes et standards de qualité » non fourni | Tokens pris dans la charte du ROADMAP (§12) | 🟡 Contourné, à confirmer |
| 6 | Routes É3 absentes du contrat (`/admin/verifications*`, `/admin/audit-logs`, `/devices`, `/notifications`) | A-03, A-04, A-05, A-12 non branchables | ⛔ Bloqué (côté backend) |
| 7 | Agrégateur Mobile Money (paiements récurrents) | Bloque l'étape 8 | ⬜ À valider |
| 8 | Hébergement des données et avis juridique | Bloque l'étape 10 | ⬜ À valider |
| 9 | 20 décisions É3 à valider par le backend | Contrat É3 non figé | 🟡 Voir `DECISIONS_ETAPE_3.md` |

---

## Journal

| Date | Fait |
|---|---|
| 19/11/2026 | Analyse des trois documents et du ROADMAP ; périmètre v1 confirmé (marchands et livreurs exclus). |
| 19/11/2026 | Création des dossiers `web/` et `mobile/`. |
| 19/11/2026 | Web : projet Vite + React + TypeScript, tokens de la charte, accueil de fondation, garde de routes, client HTTP. Build et lint verts. |
| 19/11/2026 | Ouverture du suivi. Étape 0 web posée, étape 0 non clôturée (OpenAPI et mobile manquants). |
| 19/11/2026 | Backend cloné depuis GitHub (`main`, `106c383`). Contrat à jour : admin auth, invitations, data-requests, documents. Aucune route É3. |
| 19/11/2026 | Règle appliquée : la corbeille n'est plus consultée ; toute référence backend vient du clone `backend/`. |
| 19/11/2026 | Backend installé (`npm install`), mock Prism lancé et vérifié sur `/health` et `/api/v1/specialties`. |
| 19/11/2026 | Web : types générés depuis OpenAPI, client typé `openapi-fetch`, proxy Vite, TypeScript ramené à 5.9 pour compatibilité. Build et lint verts. |
| 19/11/2026 | Administration : client Vite distinct créé dans `admin/` (port 5174), coquille de console, routes A-01/V-01 en attente explicite, client typé. Build et lint verts. |
| 19/11/2026 | Mobile : Expo SDK 58 initialisé, tokens, navigation React Navigation avec garde structurelle, client typé, écrans de fondation. Typecheck, lint, Expo Doctor (20/20) et export Android verts. |
| 19/11/2026 | Étape 1 web : C-01/C-02/C-03 branchés sur le mock, session réelle (jeton en mémoire, CSRF, refresh anticipé), espace `/me` et déconnexion. Parcours testé en navigateur sans erreur. |
| 19/11/2026 | Étape 1 administration : A-01 avec second facteur, V-01, enrôlement TOTP avec QR code, déconnexion. Build, lint et parcours de bout en bout vérifiés sur le mock. |
| 19/11/2026 | Étape 1 mobile : C-01/C-02/C-03, garde de navigation, stockage sécurisé Expo, renouvellement de session et espace `/me`. Typecheck, lint, Expo Doctor (20/20), export Android et parcours en aperçu web vérifiés. |
| 19/11/2026 | Étape 1 laissée ouverte : le canal des codes (SMS, WhatsApp ou les deux) reste à trancher côté produit. |
